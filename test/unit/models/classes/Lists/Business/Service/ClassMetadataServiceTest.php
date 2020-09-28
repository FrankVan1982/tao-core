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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 *
 */

declare(strict_types=1);

namespace oat\tao\test\unit\model\Lists\Business\Service;

use core_kernel_classes_Class;
use oat\generis\model\data\Ontology;
use oat\generis\test\MockObject;
use oat\generis\test\TestCase;
use oat\tao\model\Lists\Business\Contract\ValueCollectionRepositoryInterface;
use oat\tao\model\Lists\Business\Domain\ClassMetadataSearchRequest;
use oat\tao\model\Lists\Business\Input\ClassMetadataSearchInput;
use oat\tao\model\Lists\Business\Service\ClassMetadataService;
use oat\tao\model\Lists\Business\Service\ValueCollectionService;

class ClassMetadataServiceTest extends TestCase
{
    /** @var ClassMetadataService */
    private $sut;

    /** @var ValueCollectionService|MockObject */
    private $valueCollectionServiceMock;

    /** @var ValueCollectionRepositoryInterface|MockObject */
    private $repositoryMock;

    /**
     * @before
     */
    public function init(): void
    {
        $this->repositoryMock = $this->createMock(ValueCollectionRepositoryInterface::class);

        $this->valueCollectionServiceMock = $this->createMock(ValueCollectionService::class);

        $this->sut = new ClassMetadataService(
            $this->valueCollectionServiceMock
        );

        $ontologyServiceMock = $this->createMock(Ontology::class);
        $ontologyServiceMock
            ->expects($this->any())
            ->method('getClass')
            ->willReturn($this->createClassMock());

        $serviceLocator = $this->getServiceLocatorMock(
            [Ontology::SERVICE_ID => $ontologyServiceMock]
        );

        $this->sut->setServiceLocator($serviceLocator);
    }

    public function testFindAll(): void
    {
        $result = $this->sut->findAll(
            $this->createSearchInputMock(
                $this->createSearchRequestMock()
            )
        );

        $this->assertSame(
            '[{"class":"uri","parent-class":null,"label":"label","metadata":[]}]',
            json_encode($result)
        );
    }

    private function createSearchInputMock(ClassMetadataSearchRequest $searchRequest): ClassMetadataSearchInput
    {
        $classMetadataSearchInputMock = $this->createMock(ClassMetadataSearchInput::class);

        $classMetadataSearchInputMock
            ->expects($this->once())
            ->method('getSearchRequest')
            ->willReturn($searchRequest);

        return $classMetadataSearchInputMock;
    }

    private function createSearchRequestMock(): ClassMetadataSearchRequest
    {
        $classMetadataSearchRequestMock = $this->createMock(ClassMetadataSearchRequest::class);

        return $classMetadataSearchRequestMock;
    }

    private function createClassMock(): core_kernel_classes_Class
    {
        $class = $this->createMock(core_kernel_classes_Class::class);

        $class
            ->expects($this->once())
            ->method('isClass')
            ->willReturn(true);
        $class
            ->expects($this->once())
            ->method('getSubClasses')
            ->willReturn([]);
        $class
            ->expects($this->once())
            ->method('getUri')
            ->willReturn('uri');
        $class
            ->expects($this->once())
            ->method('getLabel')
            ->willReturn('label');
        $class
            ->expects($this->once())
            ->method('getProperties')
            ->willReturn([]);

        return $class;
    }
}
