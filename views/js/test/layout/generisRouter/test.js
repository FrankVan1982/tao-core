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
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'layout/generisRouter'
], function (_, $, generisRouterFactory) {
    'use strict';

    var location = window.history.location || window.location;
    var testerUrl = location.href;
    var baseUrlAbs = 'http://tao/tao/Main/index?structure=items&ext=taoItems';
    var baseUrlRel = '/tao/Main/index?structure=items&ext=taoItems';

    QUnit.module('Module');

    QUnit.test('Module export', function (assert) {
        QUnit.expect(3);

        assert.ok(typeof generisRouterFactory === 'function', 'The module expose a factory function');
        assert.ok(typeof generisRouterFactory() === 'object', 'The factory returns an object');
        assert.equal(generisRouterFactory(), generisRouterFactory(), 'The factory always returns the same object');
    });

    QUnit
        .cases([
            {title: 'pushSectionState'},
            {title: 'pushNodeState'},
            {title: 'restoreState'},
            {title: 'hasRestorableState'},

            // eventifier
            {title: 'on'},
            {title: 'off'},
            {title: 'trigger'}
        ])
        .test('Instance API', function (data, assert) {
            var instance = generisRouterFactory();
            QUnit.expect(1);

            assert.ok(typeof instance[data.title] === 'function', 'instance implements ' + data.title);
        });

    QUnit.module('.pushSectionState()', {
        setup: function() {
            window.history.replaceState(null, '', testerUrl);
        },
        teardown: function() {
            window.history.replaceState(null, '', testerUrl);
        }
    });

    QUnit
        .cases([
            {
                title: 'change the section parameter',
                baseUrl: baseUrlAbs + '&section=manage_items',
                sectionId: 'authoring',
                restoreWith: 'activate',
                expectedUrl: baseUrlRel + '&section=authoring'
            },
            {
                title: 'remove the uri parameter on section change',
                baseUrl: baseUrlAbs + '&section=manage_items' + '&uri=http_2_tao_1_mytao_0_rdf_3_i15151515151515',
                sectionId: 'authoring',
                restoreWith: 'activate',
                expectedUrl: baseUrlRel + '&section=authoring'
            }
        ])
        .asyncTest('Push new state in history when section parameter already exists', function(data, assert) {
            var generisRouter = generisRouterFactory();

            QUnit.expect(4);

            generisRouter
                .off('.test')
                .on('pushsectionstate.test', function(stateUrl) {
                    var state = window.history.state;
                    assert.ok(true, 'pushsectionstate have been called');
                    assert.equal(stateUrl, data.expectedUrl);
                    assert.equal(state.sectionId, data.sectionId, 'section id param has been correctly set');
                    assert.equal(state.restoreWith, data.restoreWith, 'restoreWith param has been correctly set');
                    QUnit.start();
                })
                .on('replacesectionstate.test', function() {
                    assert.ok(false, 'I should not be called');
                    QUnit.start();
                });

            generisRouter.pushSectionState(data.baseUrl, data.sectionId, data.restoreWith);
        });

    QUnit
        .cases([
            {
                title: 'add the section parameter',
                baseUrl: baseUrlAbs,
                sectionId: 'authoring',
                restoreWith: 'activate',
                expectedUrl: baseUrlRel + '&section=authoring'
            },
            {
                title: 'add the section parameter and keep the uri parameter',
                baseUrl: baseUrlAbs + '&uri=http_2_tao_1_mytao_0_rdf_3_i15151515151515',
                sectionId: 'authoring',
                restoreWith: 'activate',
                expectedUrl: baseUrlRel + '&uri=http_2_tao_1_mytao_0_rdf_3_i15151515151515' + '&section=authoring'
            }
        ])
        .asyncTest('Replace current state when section does not exists', function(data, assert) {
            var generisRouter = generisRouterFactory();

            QUnit.expect(4);

            generisRouter
                .off('.test')
                .on('pushsectionstate.test', function() {
                    assert.ok(false, 'I should not be called');
                    QUnit.start();
                })
                .on('replacesectionstate.test', function(stateUrl) {
                    var state = window.history.state;
                    assert.ok(true, 'replacesectionstate have been called');
                    assert.equal(stateUrl, data.expectedUrl);
                    assert.equal(state.sectionId, data.sectionId, 'section id param has been correctly set');
                    assert.equal(state.restoreWith, data.restoreWith, 'restoreWith param has been correctly set');
                    QUnit.start();
                });

            generisRouter.pushSectionState(data.baseUrl, data.sectionId, data.restoreWith);
        });


    QUnit
        .cases([
            {
                title: 'SectionId is the same as the existing section',
                baseUrl: baseUrlAbs + '&section=authoring',
                sectionId: 'authoring',
                restoreWith: 'activate'
            },
            {
                title: 'SectionId parameter is missing',
                baseUrl: baseUrlAbs + '&section=authoring'
            }
        ])
        .asyncTest('Does not change state', function(data, assert) {
            var generisRouter = generisRouterFactory();

            generisRouter
                .off('.test')
                .on('pushsectionstate.test', function() {
                    assert.ok(false, 'I should not be called');
                    QUnit.start();
                })
                .on('replacesectionstate.test', function() {
                    assert.ok(false, 'I should not be called');
                    QUnit.start();
                });

            generisRouter.pushSectionState(data.baseUrl, data.sectionId, data.restoreWith);

            assert.ok(_.isNull(window.history.state), 'state has not been updated');
            QUnit.start();
        });


    QUnit.module('.pushNodeState()', {
        setup: function() {
            window.history.replaceState(null, '', testerUrl);
        },
        teardown: function() {
            window.history.replaceState(null, '', testerUrl);
        }
    });

    QUnit
        .cases([
            {
                title: 'Change the uri parameter. No section param, no existing state.',
                baseUrl: baseUrlAbs + '&uri=http_2_tao_1_mytao_0_rdf_3_i1111111111111111',
                nodeUri: 'http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedUrl: baseUrlRel + '&uri=http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedSectionId: '',
                expectedRestoreWith: 'activate',
                setExistingState: _.noop
            },
            {
                title: 'Change the uri parameter. With section param, no existing state.',
                baseUrl: baseUrlAbs + '&section=manage_items' + '&uri=http_2_tao_1_mytao_0_rdf_3_i1111111111111111',
                nodeUri: 'http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedUrl: baseUrlRel + '&section=manage_items' + '&uri=http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedSectionId: 'manage_items',
                expectedRestoreWith: 'activate',
                setExistingState: _.noop
            },
            {
                title: 'Change the uri parameter. No section param, existing state.',
                baseUrl: baseUrlAbs + '&uri=http_2_tao_1_mytao_0_rdf_3_i1111111111111111',
                nodeUri: 'http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedUrl: baseUrlRel + '&uri=http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedSectionId: 'authoring',
                expectedRestoreWith: 'show',
                setExistingState: function setExistingState(generisRouter) {
                    generisRouter.pushSectionState(baseUrlAbs, 'authoring', 'show');
                }
            },
            {
                title: 'Change the uri parameter. Section param, existing state, different sections (should never happen. This is only to assert the assessment priority.',
                baseUrl: baseUrlAbs + '&section=manage_items' + '&uri=http_2_tao_1_mytao_0_rdf_3_i1111111111111111',
                nodeUri: 'http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedUrl: baseUrlRel + '&section=manage_items' + '&uri=http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedSectionId: 'authoring',
                expectedRestoreWith: 'show',
                setExistingState: function setExistingState(generisRouter) {
                    generisRouter.pushSectionState(baseUrlAbs, 'authoring', 'show');
                }
            }
        ])
        .asyncTest('Push new state in history when uri parameter already exists', function(data, assert) {
            var generisRouter = generisRouterFactory();

            QUnit.expect(4);

            generisRouter
                .off('.test')
                .on('pushnodestate.test', function(stateUrl) {
                    var state = window.history.state;
                    assert.ok(true, 'pushnodestate have been called');
                    assert.equal(stateUrl, data.expectedUrl);
                    assert.equal(state.sectionId, data.expectedSectionId, 'section id param has been correctly set');
                    assert.equal(state.restoreWith, data.expectedRestoreWith, 'restoreWith param has been correctly set');
                    QUnit.start();
                })
                .on('replacenodestate.test', function() {
                    assert.ok(false, 'I should not be called');
                    QUnit.start();
                });

            data.setExistingState(generisRouter);

            generisRouter.pushNodeState(data.baseUrl, data.nodeUri);
        });

    QUnit
        .cases([
            {
                title: 'Add the uri parameter. No section param, no existing state.',
                baseUrl: baseUrlAbs,
                nodeUri: 'http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedUrl: baseUrlRel + '&uri=http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedSectionId: '',
                expectedRestoreWith: 'activate',
                setExistingState: _.noop
            },
            {
                title: 'Add the uri parameter. With section param, no existing state.',
                baseUrl: baseUrlAbs + '&section=manage_items',
                nodeUri: 'http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedUrl: baseUrlRel + '&section=manage_items' + '&uri=http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedSectionId: 'manage_items',
                expectedRestoreWith: 'activate',
                setExistingState: _.noop
            },
            {
                title: 'Add the uri parameter. No section param, existing state.',
                baseUrl: baseUrlAbs,
                nodeUri: 'http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedUrl: baseUrlRel + '&uri=http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedSectionId: 'authoring',
                expectedRestoreWith: 'show',
                setExistingState: function setExistingState(generisRouter) {
                    generisRouter.pushSectionState(baseUrlAbs, 'authoring', 'show');
                }
            },
            {
                title: 'Change the uri parameter. Section param, existing state, different sections (should never happen. This is only to assess priority.',
                baseUrl: baseUrlAbs + '&section=manage_items',
                nodeUri: 'http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedUrl: baseUrlRel + '&section=manage_items' + '&uri=http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                expectedSectionId: 'authoring',
                expectedRestoreWith: 'show',
                setExistingState: function setExistingState(generisRouter) {
                    generisRouter.pushSectionState(baseUrlAbs, 'authoring', 'show');
                }
            }
        ])
        .asyncTest('Replace current state when uri parameter does not exists', function(data, assert) {
            var generisRouter = generisRouterFactory();

            QUnit.expect(4);

            generisRouter
                .off('.test')
                .on('pushnodestate.test', function() {
                    assert.ok(false, 'I should not be called');
                    QUnit.start();
                })
                .on('replacenodestate.test', function(stateUrl) {
                    var state = window.history.state;
                    assert.ok(true, 'replacenodestate have been called');
                    assert.equal(stateUrl, data.expectedUrl);
                    assert.equal(state.sectionId, data.expectedSectionId, 'section id param has been correctly set');
                    assert.equal(state.restoreWith, data.expectedRestoreWith, 'restoreWith param has been correctly set');
                    QUnit.start();
                });

            data.setExistingState(generisRouter);

            generisRouter.pushNodeState(data.baseUrl, data.nodeUri);
        });

    QUnit
        .cases([
            {
                title: 'Uri parameter is the same',
                baseUrl: baseUrlAbs + '&uri=http_2_tao_1_mytao_0_rdf_3_i8888888888888888',
                nodeUri: 'http_2_tao_1_mytao_0_rdf_3_i8888888888888888'
            },
            {
                title: 'Uri parameter is missing',
                baseUrl: baseUrlAbs + '&uri=http_2_tao_1_mytao_0_rdf_3_i8888888888888888'
            }
        ])
        .asyncTest('Does not change state', function(data, assert) {
            var generisRouter = generisRouterFactory();

            generisRouter
                .off('.test')
                .on('pushnodestate.test', function() {
                    assert.ok(false, 'I should not be called');
                    QUnit.start();
                })
                .on('replacenodestate.test', function() {
                    assert.ok(false, 'I should not be called');
                    QUnit.start();
                });

            generisRouter.pushNodeState(data.baseUrl, data.nodeUri);

            assert.ok(_.isNull(window.history.state), 'state has not been updated');
            QUnit.start();
        });

    QUnit.module('popstate', {
        setup: function() {
            window.history.replaceState(null, '', testerUrl);
        },
        teardown: function() {
            window.history.replaceState(null, '', testerUrl);
        }
    });


    QUnit.asyncTest('Trigger the sectionactivate event if previous state was pushed with the "activate" param', function(assert) {
        var generisRouter = generisRouterFactory();
        var url1 = 'http://tao/tao/Main/index?structure=items&ext=taoItems&section=authoring';
        var url2 = 'http://tao/tao/Main/index?structure=items&ext=taoItems&section=manage_items';

        generisRouter
            .off('.test')
            .on('sectionactivate.test', function(sectionId) {
                assert.ok(true, 'sectionactivate has been called');
                assert.equal(sectionId, 'manage_items', 'correct param is passed to the callback');
                QUnit.start();
            })
            .on('sectionshow.test', function() {
                assert.ok(false, 'I should not be called');
                QUnit.start();
            });

        generisRouter.pushState(url1, {
            sectionId: 'manage_items',
            restoreWith: 'activate'
        });
        generisRouter.pushState(url2, {
            sectionId: 'authoring',
            restoreWith: 'activate'
        });

        window.history.back();
    });

    QUnit.asyncTest('Trigger the sectionshow event if previous state was pushed with the "show" param', function(assert) {
        var generisRouter = generisRouterFactory();
        var url1 = 'http://tao/tao/Main/index?structure=items&ext=taoItems&section=authoring';
        var url2 = 'http://tao/tao/Main/index?structure=items&ext=taoItems&section=manage_items';

        generisRouter
            .off('.test')
            .on('sectionshow.test', function(sectionId) {
                assert.ok(true, 'sectionshow has been called');
                assert.equal(sectionId, 'manage_items', 'correct param is passed to the callback');
                QUnit.start();
            })
            .on('sectionactivate.test', function() {
                assert.ok(false, 'I should not be called');
                QUnit.start();
            });

        generisRouter.pushState(url1, {
            sectionId: 'manage_items',
            restoreWith: 'show'
        });
        generisRouter.pushState(url2, {
            sectionId: 'authoring',
            restoreWith: 'show'
        });

        window.history.back();
    });

    // todo: test hasRestorableState

});