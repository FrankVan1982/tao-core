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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA;
 */
namespace oat\tao\model\search\index;

/**
 * Class IndexDocument
 * @package oat\tao\model\search\index
 */
class IndexDocument
{
    /** @var string */
    protected $id;

    /** @var array */
    protected $body;

    /**
     * IndexDocument constructor.
     * @param $id
     * @param $body
     * @throws \common_Exception
     */
    public function __construct(
        $id,
        $body
    ){
        $this->id = $id;

        if (!isset($body['type_r'])) {
            throw new \common_Exception('Body of indexDocument should contain type key');
        }
        $this->body = $body;

    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Body of document
     *
     * $body['type'] = ['type1', 'type2'];
     * $body['label'] = 'label';
     * $body[$field'] = $value;
     * @return array
     */
    public function getBody()
    {
        return $this->body;
    }

}
