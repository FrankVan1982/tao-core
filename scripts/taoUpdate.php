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
 * Copyright (c) 2014-2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types = 1);

require_once __DIR__ . '/../includes/raw_start.php';

use oat\oatbox\reporting\Report;
use oat\tao\model\config\BackupConfigService;
use oat\tao\model\extension\UpdateExtensions;
use oat\oatbox\service\ServiceManager;

$serviceManager = ServiceManager::getServiceManager();

/** @var BackupConfigService $backupConfigService */
$backupConfigService = $serviceManager->getContainer()->get(BackupConfigService::class);

$backupConfigService->makeCopy();

$report = $serviceManager->propagate(new UpdateExtensions())();

$serviceManager->getContainerBuilder()->forceBuild();

$report->add(Report::createSuccess('Update completed'));
$report->add(Report::createSuccess('Dependency Injection Container rebuilt'));

echo helpers_Report::renderToCommandline($report);
