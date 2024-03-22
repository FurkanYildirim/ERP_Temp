'use strict';
sap.ui.define([
    'sap/feedback/ui/thirdparty/sap-px/pxapi',
    'sap/m/library',
    './Ui5ControlFactory',
    '../common/Constants',
    '../data/AppContextData'
], function (___sap_px_pxapi, sap_m_library, __Ui5ControlFactory, __Constants, __AppContextData) {
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
    var PushType = ___sap_px_pxapi['PushType'];
    var ButtonType = sap_m_library['ButtonType'];
    var DialogType = sap_m_library['DialogType'];
    var Ui5ControlFactory = _interopRequireDefault(__Ui5ControlFactory);
    var Constants = _interopRequireDefault(__Constants);
    var AppContextData = _interopRequireDefault(__AppContextData);
    var InvitationDialog = (function () {
        function InvitationDialog(resourceBundle) {
            _classCallCheck(this, InvitationDialog);
            this._resourceBundle = resourceBundle;
        }
        _createClass(InvitationDialog, [
            {
                key: 'surveyInvitationDialogShowCallback',
                value: function surveyInvitationDialogShowCallback(eventData) {
                    try {
                        var _this = this;
                        _this.show(eventData.pushType);
                        var surveyInvitationDialogResponse = new Promise(function (resolve) {
                            return _this._resolveSurveyInvitation = resolve;
                        });
                        return Promise.resolve(surveyInvitationDialogResponse);
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }
            },
            {
                key: 'show',
                value: function show(pushType) {
                    if (!this._dialog) {
                        this._dialog = this.createDialog();
                    }
                    if (!this._dialog.isOpen()) {
                        this.setDismissButtonText(pushType);
                        this._dialog.open();
                    }
                }
            },
            {
                key: 'setDismissButtonText',
                value: function setDismissButtonText(pushType) {
                    var dismissButtonText = this.getText('YOUR_OPINION_NOTNOW');
                    if (pushType === PushType.timedPush) {
                        dismissButtonText = this.getText('YOUR_OPINION_ASKLATERBUTTON');
                    }
                    this._dialog.getEndButton().setText(dismissButtonText);
                }
            },
            {
                key: 'onDialogClose',
                value: function onDialogClose(willProvideFeedback) {
                    try {
                        var _this2 = this;
                        _this2._dialog.close();
                        return Promise.resolve(AppContextData.getData()).then(function (appContextData) {
                            _this2._resolveSurveyInvitation({
                                appContextData: appContextData,
                                surveyUser: willProvideFeedback
                            });
                        });
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }
            },
            {
                key: 'getText',
                value: function getText(textKey) {
                    return this._resourceBundle.getText(textKey) || textKey;
                }
            },
            {
                key: 'createFeedbackButton',
                value: function createFeedbackButton() {
                    var _this3 = this;
                    return Ui5ControlFactory.createButton({
                        type: ButtonType.Emphasized,
                        text: this.getText('YOUR_OPINION_PROVIDEBUTTON'),
                        press: function press() {
                            _this3.onDialogClose(true);
                        }
                    });
                }
            },
            {
                key: 'createDismissButton',
                value: function createDismissButton() {
                    var _this4 = this;
                    return Ui5ControlFactory.createButton({
                        text: this.getText('YOUR_OPINION_NOTNOW'),
                        press: function press() {
                            _this4.onDialogClose(false);
                        }
                    });
                }
            },
            {
                key: 'createDialog',
                value: function createDialog() {
                    return Ui5ControlFactory.createDialog({
                        type: DialogType.Message,
                        title: this.getText('YOUR_OPINION_TITLE'),
                        content: Ui5ControlFactory.createFormattedText({ htmlText: this.getText('YOUR_OPINION_TEXT') }),
                        beginButton: this.createFeedbackButton(),
                        endButton: this.createDismissButton(),
                        escapeHandler: this.handleEscape.bind(this)
                    }, Constants.SURVEY_INVITATION_DIALOG_ID);
                }
            },
            {
                key: 'handleEscape',
                value: function handleEscape(promise) {
                    promise.resolve();
                    this.onDialogClose(false);
                }
            }
        ]);
        return InvitationDialog;
    }());
    return InvitationDialog;
});