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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 */

define([
    'jquery',
    'ui/component',
    'ui/component/placeable',
    'ui/component/draggable'
], function ($, componentFactory, makePlaceable, makeDraggable) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function (assert) {
        QUnit.expect(1);

        assert.ok(typeof makeDraggable === 'function', 'The module expose a function');
    });

    QUnit.module('Visual test');

    QUnit.asyncTest('Display and play', function (assert) {
        var component = componentFactory(),
            $container = $('#outside');

        QUnit.expect(1);

        makeDraggable(component);

        component
            .on('render', function(){
                assert.ok(true);
                QUnit.start();
            })
            .init({
                x: 100,
                y: 100
            })
            .render($container)
            .setSize(200, 300);
    });


});