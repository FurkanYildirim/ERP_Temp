'use strict';
sap.ui.define([
    'sap/feedback/ui/thirdparty/sap-px/pxapi',
    'sap/base/Log',
    'sap/ui/Device',
    '../common/Constants',
    '../common/Util',
    '../embeddedCfg/EmbeddedPxConfig',
    '../pxapi/PxApiWrapper',
    '../storage/PushStateMigrator'
], function (___sap_px_pxapi, Log, sap_ui_Device, __Constants, __Util, __EmbeddedPxConfig, __PxApiWrapper, __PushStateMigrator) {
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule && typeof obj.default !== 'undefined' ? obj.default : obj;
    }
    function _typeof(obj) {
        '@babel/helpers - typeof';
        return _typeof = 'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator ? function (obj) {
            return typeof obj;
        } : function (obj) {
            return obj && 'function' == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj;
        }, _typeof(obj);
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
        }
    }
    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
    }
    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps)
            _defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, 'prototype', { writable: false });
        return Constructor;
    }
    function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, 'string');
        return typeof key === 'symbol' ? key : String(key);
    }
    function _toPrimitive(input, hint) {
        if (_typeof(input) !== 'object' || input === null)
            return input;
        var prim = input[Symbol.toPrimitive];
        if (prim !== undefined) {
            var res = prim.call(input, hint || 'default');
            if (_typeof(res) !== 'object')
                return res;
            throw new TypeError('@@toPrimitive must return a primitive value.');
        }
        return (hint === 'string' ? String : Number)(input);
    }
    var Environment = ___sap_px_pxapi['Environment'];
    var system = sap_ui_Device['system'];
    var Constants = _interopRequireDefault(__Constants);
    var Util = _interopRequireDefault(__Util);
    var EmbeddedPxConfig = _interopRequireDefault(__EmbeddedPxConfig);
    var PxApiWrapper = _interopRequireDefault(__PxApiWrapper);
    var PushStateMigrator = _interopRequireDefault(__PushStateMigrator);
    var InitController = (function () {
        function InitController(pluginInfo) {
            _classCallCheck(this, InitController);
            this._pxApiWrapper = new PxApiWrapper(pluginInfo);
        }
        _createClass(InitController, [
            {
                key: 'pxApiWrapper',
                get: function get() {
                    return this._pxApiWrapper;
                }
            },
            {
                key: 'init',
                value: function init(parameters, surveyInvitationDialogCallback) {
                    try {
                        var _temp2 = function _temp2(_result) {
                            if (_exit)
                                return _result;
                            Log.error(Constants.ERROR.INIT_PARAMS_INCONSISTENT, undefined, Constants.COMPONENT.INIT_CONTROLLER);
                            return false;
                        };
                        var _exit = false;
                        var _this = this;
                        if (!PushStateMigrator.migrate()) {
                            Log.error(Constants.ERROR.PUSH_STATE_MIGRATION_FAILED, undefined, Constants.COMPONENT.PLUGIN_CONTROLLER);
                            return Promise.resolve(false);
                        }
                        if (_this.isPhone()) {
                            Log.info(Constants.INFO.PHONE_NOT_SUPPORTED, undefined, Constants.COMPONENT.INIT_CONTROLLER);
                            return Promise.resolve(false);
                        }
                        var _temp = (function () {
                            if (_this.hasOldParameters(parameters)) {
                                return Promise.resolve(_this.initWithOldParameters(parameters, surveyInvitationDialogCallback)).then(function (_await$_this$initWith) {
                                    _exit = true;
                                    return _await$_this$initWith;
                                });
                            } else
                                return (function () {
                                    if (_this.hasNewParameters(parameters)) {
                                        if (_this.hasUrlParameters()) {
                                            _this.overwriteWithUrlParameters(parameters);
                                        }
                                        return Promise.resolve(_this.initWithNewParameters(parameters, surveyInvitationDialogCallback)).then(function (_await$_this$initWith2) {
                                            _exit = true;
                                            return _await$_this$initWith2;
                                        });
                                    }
                                }());
                        }());
                        return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }
            },
            {
                key: 'isPhone',
                value: function isPhone() {
                    return system.phone;
                }
            },
            {
                key: 'hasNewParameters',
                value: function hasNewParameters(parameters) {
                    if (parameters.configUrl && parameters.unitId && parameters.environment) {
                        Log.debug(Constants.DEBUG.INIT_PARAMS_MANDATORY_FOUND_NEW, undefined, Constants.COMPONENT.INIT_CONTROLLER);
                        return true;
                    }
                    Log.debug(Constants.DEBUG.INIT_PARAMS_MANDATORY_NOT_SET_NEW, undefined, Constants.COMPONENT.INIT_CONTROLLER);
                    if (parameters.configJson) {
                        Log.debug(Constants.DEBUG.INIT_PARAMS_MANDATORY_FOUND_JSON, undefined, Constants.COMPONENT.INIT_CONTROLLER);
                        return true;
                    }
                    Log.debug(Constants.DEBUG.INIT_PARAMS_MANDATORY_NOT_SET_JSON, undefined, Constants.COMPONENT.INIT_CONTROLLER);
                    return false;
                }
            },
            {
                key: 'hasOldParameters',
                value: function hasOldParameters(parameters) {
                    if (parameters.qualtricsInternalUri && parameters.tenantId) {
                        Log.debug(Constants.DEBUG.INIT_PARAMS_MANDATORY_FOUND_OLD, undefined, Constants.COMPONENT.INIT_CONTROLLER);
                        return true;
                    }
                    Log.debug(Constants.DEBUG.INIT_PARAMS_MANDATORY_NOT_SET_OLD, undefined, Constants.COMPONENT.INIT_CONTROLLER);
                    return false;
                }
            },
            {
                key: 'hasUrlParameters',
                value: function hasUrlParameters() {
                    if (Util.isUnitIdUrlParamSet() && Util.isEnvironmentUrlParamSet()) {
                        Log.debug(Constants.DEBUG.INIT_PARAMS_URL_MODIFIED, undefined, Constants.COMPONENT.INIT_CONTROLLER);
                        return true;
                    }
                    return false;
                }
            },
            {
                key: 'overwriteWithUrlParameters',
                value: function overwriteWithUrlParameters(parameters) {
                    var unitId = Util.getUnitIdUrlParamValue();
                    if (unitId) {
                        parameters.unitId = unitId;
                    }
                    var env = Util.getEnvironmentUrlParamValue();
                    if (env) {
                        parameters.environment = env;
                    }
                }
            },
            {
                key: 'initWithNewParameters',
                value: function initWithNewParameters(parameters, surveyInvitationDialogCallback) {
                    try {
                        var _temp4 = function _temp4(_result3) {
                            if (_exit2)
                                return _result3;
                            Log.error(Constants.ERROR.INIT_PARAMS_INCONSISTENT, undefined, Constants.COMPONENT.INIT_CONTROLLER);
                            return false;
                        };
                        var _exit2 = false;
                        var _this2 = this;
                        var _temp3 = (function () {
                            if (parameters.configUrl && !parameters.configJson) {
                                var tenantInfo = {
                                    tenantId: parameters.tenantId,
                                    tenantRole: parameters.tenantRole
                                };
                                var configIdentifier = {
                                    configUrl: parameters.configUrl,
                                    unitId: parameters.unitId,
                                    environment: parameters.environment
                                };
                                return Promise.resolve(_this2._pxApiWrapper.initialize(tenantInfo, configIdentifier, undefined, surveyInvitationDialogCallback)).then(function (_await$_this2$_pxApiW) {
                                    _exit2 = true;
                                    return _await$_this2$_pxApiW;
                                });
                            } else
                                return (function () {
                                    if (!parameters.configUrl && parameters.configJson) {
                                        var _tenantInfo = {
                                            tenantId: parameters.tenantId,
                                            tenantRole: parameters.tenantRole
                                        };
                                        var configJson = parameters.configJson;
                                        return Promise.resolve(_this2._pxApiWrapper.initialize(_tenantInfo, undefined, configJson, surveyInvitationDialogCallback)).then(function (_await$_this2$_pxApiW2) {
                                            _exit2 = true;
                                            return _await$_this2$_pxApiW2;
                                        });
                                    }
                                }());
                        }());
                        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3));
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }
            },
            {
                key: 'initWithOldParameters',
                value: function initWithOldParameters(parameters, surveyInvitationDialogCallback) {
                    try {
                        var _this3 = this;
                        var configJson = {
                            version: '0.3.1',
                            unitId: Constants.DEFAULT_VALUE_NA,
                            environment: Environment.prod,
                            startupConfig: {
                                qualtricsInternalUri: parameters.qualtricsInternalUri,
                                productName: parameters.productName,
                                platformType: parameters.platformType,
                                scopeSet: _this3.convertScopeSet(parameters.scopeSet)
                            },
                            runtimeConfig: { useApi: true },
                            themingConfig: { writeToGlobals: true },
                            pushConfig: EmbeddedPxConfig.pushConfig()
                        };
                        var tenantInfo = {
                            tenantId: parameters.tenantId,
                            tenantRole: parameters.tenantRole
                        };
                        return Promise.resolve(_this3._pxApiWrapper.initialize(tenantInfo, undefined, configJson, surveyInvitationDialogCallback));
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }
            },
            {
                key: 'convertScopeSet',
                value: function convertScopeSet(scopeSetString) {
                    var scopeSetMap = {
                        featurePush: Constants.SCOPE_SETS.APP_PUSH,
                        dynamicPush: Constants.SCOPE_SETS.TIMED_PUSH
                    };
                    if (scopeSetString) {
                        var scopeSetArray = scopeSetString.split(',');
                        scopeSetArray = this.appendManualScopeSet(scopeSetArray);
                        var scopeSet = scopeSetArray.map(function (scopeItem) {
                            return scopeSetMap[scopeItem.trim()] || scopeItem.trim();
                        });
                        return scopeSet;
                    }
                    return [Constants.SCOPE_SETS.MANUAL];
                }
            },
            {
                key: 'appendManualScopeSet',
                value: function appendManualScopeSet(scopeSetArray) {
                    if (scopeSetArray.indexOf(Constants.SCOPE_SETS.MANUAL) > -1) {
                        return scopeSetArray;
                    }
                    scopeSetArray.push(Constants.SCOPE_SETS.MANUAL);
                    return scopeSetArray;
                }
            }
        ]);
        return InitController;
    }());
    return InitController;
});