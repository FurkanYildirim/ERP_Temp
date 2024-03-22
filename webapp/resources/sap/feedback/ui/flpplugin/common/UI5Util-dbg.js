'use strict';
sap.ui.define([
    'sap/feedback/ui/thirdparty/sap-px/pxapi',
    'sap/base/util/ObjectPath'
], function (___sap_px_pxapi, ObjectPath) {
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
    var ThemeId = ___sap_px_pxapi['ThemeId'];
    var UI5Util = (function () {
        function UI5Util() {
            _classCallCheck(this, UI5Util);
        }
        _createClass(UI5Util, null, [
            {
                key: 'getShellContainer',
                value: function getShellContainer() {
                    return ObjectPath.get('sap.ushell.Container');
                }
            },
            {
                key: 'getAppLifeCycleService',
                value: function getAppLifeCycleService() {
                    try {
                        var _this = this;
                        return Promise.resolve(_this.getShellContainer().getServiceAsync('AppLifeCycle')).then(function (_this$getShellContain) {
                            return _this$getShellContain;
                        });
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }
            },
            {
                key: 'getCurrentApp',
                value: function getCurrentApp() {
                    try {
                        var _this2 = this;
                        return Promise.resolve(_this2.getAppLifeCycleService()).then(function (_this2$getAppLifeCycl) {
                            return _this2$getAppLifeCycl.getCurrentApplication();
                        });
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }
            },
            {
                key: 'getAppConfig',
                value: function getAppConfig() {
                    return sap.ui.getCore().getConfiguration();
                }
            },
            {
                key: 'getTheme',
                value: function getTheme() {
                    return this.getAppConfig().getTheme();
                }
            },
            {
                key: 'getThemeId',
                value: function getThemeId() {
                    var themeId = this.getAppConfig().getTheme();
                    return ThemeId[themeId];
                }
            },
            {
                key: 'getLanguage',
                value: function getLanguage() {
                    return this.getAppConfig().getLanguageTag();
                }
            },
            {
                key: 'getEventBus',
                value: function getEventBus() {
                    return sap.ui.getCore().getEventBus();
                }
            }
        ]);
        return UI5Util;
    }());
    return UI5Util;
});