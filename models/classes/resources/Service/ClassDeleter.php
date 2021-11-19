<?php

/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\tao\model\resources\Service;

use InvalidArgumentException;
use core_kernel_classes_Class;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\search\index\OntologyIndex;
use oat\tao\model\accessControl\PermissionCheckerInterface;
use oat\tao\model\resources\Contract\ClassDeleterInterface;
use oat\tao\model\Specification\ClassSpecificationInterface;

class ClassDeleter implements ClassDeleterInterface
{
    private const PROPERTY_INDEX = OntologyIndex::PROPERTY_INDEX;

    /** @var ClassSpecificationInterface */
    private $rootClassSpecification;

    /** @var PermissionCheckerInterface */
    private $permissionChecker;

    /** @var Ontology */
    private $ontology;

    /** @var core_kernel_classes_Property */
    private $propertyIndex;

    public function __construct(
        ClassSpecificationInterface $rootClassSpecification,
        PermissionCheckerInterface $permissionChecker,
        Ontology $ontology
    ) {
        $this->rootClassSpecification = $rootClassSpecification;
        $this->permissionChecker = $permissionChecker;
        $this->ontology = $ontology;

        $this->propertyIndex = $ontology->getProperty(self::PROPERTY_INDEX);
    }

    public function delete(core_kernel_classes_Class $class): void
    {
        if ($this->rootClassSpecification->isSatisfiedBy($class)) {
            throw new InvalidArgumentException('The class provided for deletion cannot be the root class.');
        }

        $this->deleteClassRecursively($class);
    }

    public function isDeleted(core_kernel_classes_Class $class): bool
    {
        return !$class->exists();
    }

    private function deleteClassRecursively(core_kernel_classes_Class $class): bool
    {
        if (!$this->permissionChecker->hasReadAccess($class->getUri())) {
            return false;
        }

        $isClassDeletable = true;

        foreach ($class->getSubClasses() as $subClass) {
            $isClassDeletable = $this->deleteClassRecursively($subClass) && $isClassDeletable;
        }

        return $this->deleteClass($class, $isClassDeletable);
    }

    /**
     * @param bool $isClassDeletable Class is not deletable if it contains at least one protected sub class,
     *                               instance or property
     */
    private function deleteClass(core_kernel_classes_Class $class, bool $isClassDeletable): bool
    {
        return $this->deleteInstances($class->getInstances())
            && $isClassDeletable
            && $this->permissionChecker->hasWriteAccess($class->getUri())
            && $this->deleteProperties($class->getProperties())
            && $class->delete();
    }

    /**
     * @param core_kernel_classes_Resource[] $instances
     */
    private function deleteInstances(array $instances): bool
    {
        $status = true;

        foreach ($instances as $instance) {
            if (!$this->permissionChecker->hasWriteAccess($instance->getUri()) || !$instance->delete()) {
                $status = false;
            }
        }

        return $status;
    }

    /**
     * @param core_kernel_classes_Property[] $properties
     */
    private function deleteProperties(array $properties): bool
    {
        $status = true;

        foreach ($properties as $property) {
            $status = $this->deleteProperty($property) && $status;
        }

        return $status;
    }

    private function deleteProperty(core_kernel_classes_Property $property): bool
    {
        $indexes = $property->getPropertyValues($this->propertyIndex);

        if (!$property->delete(true)) {
            return false;
        }

        foreach ($indexes as $indexUri) {
            $this->ontology->getResource($indexUri)->delete(true);
        }

        return true;
    }
}
