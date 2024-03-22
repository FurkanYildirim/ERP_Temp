'use strict';
sap.ui.define([
    'sap/feedback/ui/thirdparty/sap-px/pxapi',
    '../common/UI5Util',
    '../storage/LocalStorageHandler'
], function (___sap_px_pxapi, __UI5Util, __LocalStorageHandler) {
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
    var ThemeId = ___sap_px_pxapi['ThemeId'];
    var UI5Util = _interopRequireDefault(__UI5Util);
    var LocalStorageHandler = _interopRequireDefault(__LocalStorageHandler);
    var ThemeData = (function () {
        function ThemeData() {
            _classCallCheck(this, ThemeData);
        }
        _createClass(ThemeData, null, [
            {
                key: 'initLastTheme',
                value: function initLastTheme() {
                    var currentThemeId = UI5Util.getThemeId() || ThemeId.none;
                    var lastThemeId = currentThemeId;
                    var userState = LocalStorageHandler.getUserState();
                    if (userState && userState.lastTheme) {
                        lastThemeId = ThemeId[userState.lastTheme];
                        if (!lastThemeId) {
                            lastThemeId = currentThemeId;
                        }
                    }
                    this.updateThemeState(lastThemeId, currentThemeId);
                }
            },
            {
                key: 'updateCurrentTheme',
                value: function updateCurrentTheme(newCurrentThemeId) {
                    var newThemeId = ThemeId[newCurrentThemeId] || ThemeId.none;
                    var userState = LocalStorageHandler.getUserState();
                    if (userState) {
                        var lastCurrentThemeId = ThemeId[userState.currentTheme] || ThemeId.none;
                        if (lastCurrentThemeId !== newThemeId) {
                            this.updateThemeState(lastCurrentThemeId, newThemeId);
                        }
                    }
                }
            },
            {
                key: 'updateThemeState',
                value: function updateThemeState(newLastThemeId, currentThemeId) {
                    LocalStorageHandler.updateLastTheme(newLastThemeId);
                    LocalStorageHandler.updateCurrentTheme(currentThemeId);
                }
            },
            {
                key: 'getPreviousTheme',
                value: function getPreviousTheme() {
                    var userState = LocalStorageHandler.getUserState();
                    if (userState) {
                        return ThemeId[userState.lastTheme] || ThemeId.none;
                    }
                    return ThemeId.none;
                }
            }
        ]);
        return ThemeData;
    }());
    return ThemeData;
});