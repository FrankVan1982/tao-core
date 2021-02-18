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

namespace oat\tao\model\webhooks;

use oat\oatbox\service\ConfigurableService;
use oat\tao\model\webhooks\configEntity\Webhook;
use oat\taoPublishing\model\publishing\event\RemoteDeliveryCreatedEvent;

class WebhookRegistryManager extends ConfigurableService implements WebhookRegistryManagerInterface
{
    public function addWebhookConfig(Webhook $webhook, string $event)
    {
        $webhooks = $this->getWebhookFileRegistry()->getOption('webhooks');
        $events = $this->getWebhookFileRegistry()->getOption('events');

        $webhooks[$webhook->getId()] = $webhook->toArray();
        $events[RemoteDeliveryCreatedEvent::class] = [$webhook->getId()];

        $this->getWebhookFileRegistry()->setOption('webhooks', $webhooks);
        $this->getWebhookFileRegistry()->setOption('events', $events);

        $this->getServiceManager()->register(
            WebhookFileRegistry::SERVICE_ID,
            $this->getWebhookFileRegistry()
        );
    }

    private function getWebhookFileRegistry(): WebhookFileRegistry
    {
        return $this->getServiceLocator()->get(WebhookFileRegistry::class);
    }
}
