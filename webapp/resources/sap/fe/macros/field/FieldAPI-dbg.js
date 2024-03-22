/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/message/Message", "../MacroAPI"], function (ClassSupport, Message, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12;
  var xmlEventHandler = ClassSupport.xmlEventHandler;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var association = ClassSupport.association;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Returns the first visible control in the FieldWrapper.
   *
   * @param oControl FieldWrapper
   * @returns The first visible control
   */
  function getControlInFieldWrapper(oControl) {
    if (oControl.isA("sap.fe.macros.controls.FieldWrapper")) {
      const oFieldWrapper = oControl;
      const aControls = oFieldWrapper.getEditMode() === "Display" ? [oFieldWrapper.getContentDisplay()] : oFieldWrapper.getContentEdit();
      if (aControls.length >= 1) {
        return aControls.length ? aControls[0] : undefined;
      }
    } else {
      return oControl;
    }
    return undefined;
  }

  /**
   * Building block for creating a field based on the metadata provided by OData V4.
   * <br>
   * Usually, a DataField or DataPoint annotation is expected, but the field can also be used to display a property from the entity type.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Field id="MyField" metaPath="MyProperty" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Field
   * @public
   */
  let FieldAPI = (_dec = defineUI5Class("sap.fe.macros.field.FieldAPI", {
    returnTypes: ["sap.fe.core.controls.FormElementWrapper" /*, not sure i want to add those yet "sap.fe.macros.field.FieldAPI", "sap.m.HBox", "sap.fe.macros.controls.ConditionalWrapper", "sap.m.Button"*/]
  }), _dec2 = property({
    type: "boolean"
  }), _dec3 = property({
    type: "boolean"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "string",
    expectedAnnotations: [],
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty", "Property"]
  }), _dec6 = property({
    type: "string",
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"]
  }), _dec7 = event(), _dec8 = association({
    type: "sap.ui.core.Control",
    multiple: true,
    singularName: "ariaLabelledBy"
  }), _dec9 = property({
    type: "boolean"
  }), _dec10 = property({
    type: "sap.fe.macros.FieldFormatOptions"
  }), _dec11 = property({
    type: "string"
  }), _dec12 = property({
    type: "boolean"
  }), _dec13 = property({
    type: "boolean"
  }), _dec14 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(FieldAPI, _MacroAPI);
    function FieldAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call(this, ...args) || this;
      _initializerDefineProperty(_this, "editable", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "change", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "required", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObject", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collaborationEnabled", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor12, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FieldAPI.prototype;
    _proto.handleChange = function handleChange(oEvent) {
      this.fireChange({
        value: this.getValue(),
        isValid: oEvent.getParameter("valid")
      });
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      const isArialLabelledByCompliant = function (control) {
        return control.isA(["sap.m.Button", "sap.fe.macros.controls.FieldWrapper", "sap.ui.mdc.Field", "sap.fe.macros.controls.FileWrapper"]);
      };
      const oContent = this.content;
      if (oContent && isArialLabelledByCompliant(oContent) && oContent.addAriaLabelledBy) {
        const aAriaLabelledBy = this.getAriaLabelledBy();
        for (let i = 0; i < aAriaLabelledBy.length; i++) {
          const sId = aAriaLabelledBy[i];
          const aAriaLabelledBys = oContent.getAriaLabelledBy() || [];
          if (aAriaLabelledBys.indexOf(sId) === -1) {
            oContent.addAriaLabelledBy(sId);
          }
        }
      }
    };
    _proto.enhanceAccessibilityState = function enhanceAccessibilityState(_oElement, mAriaProps) {
      const oParent = this.getParent();
      if (oParent && oParent.enhanceAccessibilityState) {
        // use FieldWrapper as control, but aria properties of rendered inner control.
        oParent.enhanceAccessibilityState(this, mAriaProps);
      }
      return mAriaProps;
    };
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      const oContent = this.content;
      return oContent && oContent.getAccessibilityInfo ? oContent.getAccessibilityInfo() : {};
    }

    /**
     * Returns the DOMNode ID to be used for the "labelFor" attribute.
     *
     * We forward the call of this method to the content control.
     *
     * @returns ID to be used for the <code>labelFor</code>
     */;
    _proto.getIdForLabel = function getIdForLabel() {
      const oContent = this.content;
      return oContent.getIdForLabel();
    }

    /**
     * Retrieves the current value of the field.
     *
     * @public
     * @returns The current value of the field
     */;
    _proto.getValue = function getValue() {
      var _oControl, _oControl2, _oControl3, _oControl4;
      let oControl = getControlInFieldWrapper(this.content);
      if (this.collaborationEnabled && (_oControl = oControl) !== null && _oControl !== void 0 && _oControl.isA("sap.m.HBox")) {
        oControl = oControl.getItems()[0];
      }
      if ((_oControl2 = oControl) !== null && _oControl2 !== void 0 && _oControl2.isA("sap.m.CheckBox")) {
        return oControl.getSelected();
      } else if ((_oControl3 = oControl) !== null && _oControl3 !== void 0 && _oControl3.isA("sap.m.InputBase")) {
        return oControl.getValue();
      } else if ((_oControl4 = oControl) !== null && _oControl4 !== void 0 && _oControl4.isA("sap.ui.mdc.Field")) {
        return oControl.getValue(); // FieldWrapper
      } else {
        throw "getting value not yet implemented for this field type";
      }
    }

    /**
     * Adds a message to the field.
     *
     * @param [parameters] The parameters to create message
     * @param parameters.type Type of the message
     * @param parameters.message Message text
     * @param parameters.description Message description
     * @param parameters.persistent True if the message is persistent
     * @returns The id of the message
     * @public
     */;
    _proto.addMessage = function addMessage(parameters) {
      const msgManager = this.getMessageManager();
      const oControl = getControlInFieldWrapper(this.content);
      let path; //target for oMessage
      if (oControl !== null && oControl !== void 0 && oControl.isA("sap.m.CheckBox")) {
        var _getBinding;
        path = (_getBinding = oControl.getBinding("selected")) === null || _getBinding === void 0 ? void 0 : _getBinding.getResolvedPath();
      } else if (oControl !== null && oControl !== void 0 && oControl.isA("sap.m.InputBase")) {
        var _getBinding2;
        path = (_getBinding2 = oControl.getBinding("value")) === null || _getBinding2 === void 0 ? void 0 : _getBinding2.getResolvedPath();
      } else if (oControl !== null && oControl !== void 0 && oControl.isA("sap.ui.mdc.Field")) {
        path = oControl.getBinding("value").getResolvedPath();
      }
      const oMessage = new Message({
        target: path,
        type: parameters.type,
        message: parameters.message,
        processor: oControl === null || oControl === void 0 ? void 0 : oControl.getModel(),
        description: parameters.description,
        persistent: parameters.persistent
      });
      msgManager.addMessages(oMessage);
      return oMessage.getId();
    }

    /**
     * Removes a message from the field.
     *
     * @param id The id of the message
     * @public
     */;
    _proto.removeMessage = function removeMessage(id) {
      const msgManager = this.getMessageManager();
      const arr = msgManager.getMessageModel().getData();
      const result = arr.find(e => e.id === id);
      if (result) {
        msgManager.removeMessages(result);
      }
    };
    _proto.getMessageManager = function getMessageManager() {
      return sap.ui.getCore().getMessageManager();
    };
    return FieldAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "editable", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "change", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "required", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "semanticObject", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "collaborationEnabled", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "handleChange", [_dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "handleChange"), _class2.prototype)), _class2)) || _class);
  return FieldAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRDb250cm9sSW5GaWVsZFdyYXBwZXIiLCJvQ29udHJvbCIsImlzQSIsIm9GaWVsZFdyYXBwZXIiLCJhQ29udHJvbHMiLCJnZXRFZGl0TW9kZSIsImdldENvbnRlbnREaXNwbGF5IiwiZ2V0Q29udGVudEVkaXQiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJGaWVsZEFQSSIsImRlZmluZVVJNUNsYXNzIiwicmV0dXJuVHlwZXMiLCJwcm9wZXJ0eSIsInR5cGUiLCJleHBlY3RlZEFubm90YXRpb25zIiwiZXhwZWN0ZWRUeXBlcyIsImV2ZW50IiwiYXNzb2NpYXRpb24iLCJtdWx0aXBsZSIsInNpbmd1bGFyTmFtZSIsInhtbEV2ZW50SGFuZGxlciIsImhhbmRsZUNoYW5nZSIsIm9FdmVudCIsImZpcmVDaGFuZ2UiLCJ2YWx1ZSIsImdldFZhbHVlIiwiaXNWYWxpZCIsImdldFBhcmFtZXRlciIsIm9uQmVmb3JlUmVuZGVyaW5nIiwiaXNBcmlhbExhYmVsbGVkQnlDb21wbGlhbnQiLCJjb250cm9sIiwib0NvbnRlbnQiLCJjb250ZW50IiwiYWRkQXJpYUxhYmVsbGVkQnkiLCJhQXJpYUxhYmVsbGVkQnkiLCJnZXRBcmlhTGFiZWxsZWRCeSIsImkiLCJzSWQiLCJhQXJpYUxhYmVsbGVkQnlzIiwiaW5kZXhPZiIsImVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUiLCJfb0VsZW1lbnQiLCJtQXJpYVByb3BzIiwib1BhcmVudCIsImdldFBhcmVudCIsImdldEFjY2Vzc2liaWxpdHlJbmZvIiwiZ2V0SWRGb3JMYWJlbCIsImNvbGxhYm9yYXRpb25FbmFibGVkIiwiZ2V0SXRlbXMiLCJnZXRTZWxlY3RlZCIsImFkZE1lc3NhZ2UiLCJwYXJhbWV0ZXJzIiwibXNnTWFuYWdlciIsImdldE1lc3NhZ2VNYW5hZ2VyIiwicGF0aCIsImdldEJpbmRpbmciLCJnZXRSZXNvbHZlZFBhdGgiLCJvTWVzc2FnZSIsIk1lc3NhZ2UiLCJ0YXJnZXQiLCJtZXNzYWdlIiwicHJvY2Vzc29yIiwiZ2V0TW9kZWwiLCJkZXNjcmlwdGlvbiIsInBlcnNpc3RlbnQiLCJhZGRNZXNzYWdlcyIsImdldElkIiwicmVtb3ZlTWVzc2FnZSIsImlkIiwiYXJyIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsInJlc3VsdCIsImZpbmQiLCJlIiwicmVtb3ZlTWVzc2FnZXMiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJNYWNyb0FQSSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmllbGRBUEkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFbmhhbmNlV2l0aFVJNSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgYXNzb2NpYXRpb24sIGRlZmluZVVJNUNsYXNzLCBldmVudCwgcHJvcGVydHksIHhtbEV2ZW50SGFuZGxlciB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgRmllbGRXcmFwcGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NvbnRyb2xzL0ZpZWxkV3JhcHBlclwiO1xuaW1wb3J0IHR5cGUgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCB0eXBlIENoZWNrQm94IGZyb20gXCJzYXAvbS9DaGVja0JveFwiO1xuaW1wb3J0IHR5cGUgSEJveCBmcm9tIFwic2FwL20vSEJveFwiO1xuaW1wb3J0IHR5cGUgSW5wdXRCYXNlIGZyb20gXCJzYXAvbS9JbnB1dEJhc2VcIjtcbmltcG9ydCB0eXBlIFVJNUV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgdHlwZSBNRENGaWVsZCBmcm9tIFwic2FwL3VpL21kYy9GaWVsZFwiO1xuaW1wb3J0IHR5cGUgRmlsZVdyYXBwZXIgZnJvbSBcIi4uL2NvbnRyb2xzL0ZpbGVXcmFwcGVyXCI7XG5pbXBvcnQgTWFjcm9BUEkgZnJvbSBcIi4uL01hY3JvQVBJXCI7XG4vKipcbiAqIEFkZGl0aW9uYWwgZm9ybWF0IG9wdGlvbnMgZm9yIHRoZSBmaWVsZC5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5GaWVsZEZvcm1hdE9wdGlvbnNcbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IHR5cGUgRmllbGRGb3JtYXRPcHRpb25zID0ge1xuXHQvKipcblx0ICogIERlZmluZXMgaG93IHRoZSBmaWVsZCB2YWx1ZSBhbmQgYXNzb2NpYXRlZCB0ZXh0IHdpbGwgYmUgZGlzcGxheWVkIHRvZ2V0aGVyLjxici8+XG5cdCAqXG5cdCAqICBBbGxvd2VkIHZhbHVlcyBhcmUgXCJWYWx1ZVwiLCBcIkRlc2NyaXB0aW9uXCIsIFwiRGVzY3JpcHRpb25WYWx1ZVwiIGFuZCBcIlZhbHVlRGVzY3JpcHRpb25cIlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0ZGlzcGxheU1vZGU6IFwiVmFsdWVcIiB8IFwiRGVzY3JpcHRpb25cIiB8IFwiRGVzY3JpcHRpb25WYWx1ZVwiIHwgXCJWYWx1ZURlc2NyaXB0aW9uXCI7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIGlmIGFuZCBob3cgdGhlIGZpZWxkIG1lYXN1cmUgd2lsbCBiZSBkaXNwbGF5ZWQuPGJyLz5cblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIFwiSGlkZGVuXCIgYW5kIFwiUmVhZE9ubHlcIlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0bWVhc3VyZURpc3BsYXlNb2RlOiBcIkhpZGRlblwiIHwgXCJSZWFkT25seVwiO1xuXHQvKipcblx0ICogTWF4aW11bSBudW1iZXIgb2YgbGluZXMgZm9yIG11bHRpbGluZSB0ZXh0cyBpbiBlZGl0IG1vZGUuPGJyLz5cblx0ICpcblx0ICogIEBwdWJsaWNcblx0ICovXG5cdHRleHRMaW5lc0VkaXQ6IG51bWJlcjtcblx0LyoqXG5cdCAqIE1heGltdW0gbnVtYmVyIG9mIGxpbmVzIHRoYXQgbXVsdGlsaW5lIHRleHRzIGluIGVkaXQgbW9kZSBjYW4gZ3JvdyB0by48YnIvPlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0dGV4dE1heExpbmVzOiBudW1iZXI7XG5cdC8qKlxuXHQgKiBNYXhpbXVtIG51bWJlciBvZiBjaGFyYWN0ZXJzIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgdGV4dCBmaWVsZCB0aGF0IGFyZSBzaG93biBpbml0aWFsbHkuPGJyLz5cblx0ICpcblx0ICogIEBwdWJsaWNcblx0ICovXG5cdHRleHRNYXhDaGFyYWN0ZXJzRGlzcGxheTogbnVtYmVyO1xuXHQvKipcblx0ICogRGVmaW5lcyBob3cgdGhlIGZ1bGwgdGV4dCB3aWxsIGJlIGRpc3BsYXllZC48YnIvPlxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgXCJJblBsYWNlXCIgYW5kIFwiUG9wb3ZlclwiXG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHR0ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5OiBcIkluUGxhY2VcIiB8IFwiUG9wb3ZlclwiO1xuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgY2hhcmFjdGVycyBmb3IgdGhlIG11bHRpbGluZSB0ZXh0IHZhbHVlLjxici8+XG5cdCAqXG5cdCAqIElmIGEgbXVsdGlsaW5lIHRleHQgZXhjZWVkcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgYWxsb3dlZCBjaGFyYWN0ZXJzLCB0aGUgY291bnRlciBiZWxvdyB0aGUgaW5wdXQgZmllbGQgZGlzcGxheXMgdGhlIGV4YWN0IG51bWJlci5cblx0ICpcblx0ICogIEBwdWJsaWNcblx0ICovXG5cdHRleHRNYXhMZW5ndGg6IG51bWJlcjtcblx0LyoqXG5cdCAqIERlZmluZXMgaWYgdGhlIGRhdGUgcGFydCBvZiBhIGRhdGUgdGltZSB3aXRoIHRpbWV6b25lIGZpZWxkIHNob3VsZCBiZSBzaG93bi4gPGJyLz5cblx0ICpcblx0ICogVGhlIGRhdGVUaW1lT2Zmc2V0IGZpZWxkIG11c3QgaGF2ZSBhIHRpbWV6b25lIGFubm90YXRpb24uXG5cdCAqXG5cdCAqIFRoZSBkZWZhdWx0IHZhbHVlIGlzIHRydWUuXG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHRzaG93RGF0ZTogYm9vbGVhbjtcblx0LyoqXG5cdCAqIERlZmluZXMgaWYgdGhlIHRpbWUgcGFydCBvZiBhIGRhdGUgdGltZSB3aXRoIHRpbWV6b25lIGZpZWxkIHNob3VsZCBiZSBzaG93bi4gPGJyLz5cblx0ICpcblx0ICogVGhlIGRhdGVUaW1lT2Zmc2V0IGZpZWxkIG11c3QgaGF2ZSBhIHRpbWV6b25lIGFubm90YXRpb24uXG5cdCAqXG5cdCAqIFRoZSBkZWZhdWx0IHZhbHVlIGlzIHRydWUuXG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHRzaG93VGltZTogYm9vbGVhbjtcblx0LyoqXG5cdCAqIERlZmluZXMgaWYgdGhlIHRpbWV6b25lIHBhcnQgb2YgYSBkYXRlIHRpbWUgd2l0aCB0aW1lem9uZSBmaWVsZCBzaG91bGQgYmUgc2hvd24uIDxici8+XG5cdCAqXG5cdCAqIFRoZSBkYXRlVGltZU9mZnNldCBmaWVsZCBtdXN0IGhhdmUgYSB0aW1lem9uZSBhbm5vdGF0aW9uLlxuXHQgKlxuXHQgKiBUaGUgZGVmYXVsdCB2YWx1ZSBpcyB0cnVlLlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0c2hvd1RpbWV6b25lOiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCB2aXNpYmxlIGNvbnRyb2wgaW4gdGhlIEZpZWxkV3JhcHBlci5cbiAqXG4gKiBAcGFyYW0gb0NvbnRyb2wgRmllbGRXcmFwcGVyXG4gKiBAcmV0dXJucyBUaGUgZmlyc3QgdmlzaWJsZSBjb250cm9sXG4gKi9cbmZ1bmN0aW9uIGdldENvbnRyb2xJbkZpZWxkV3JhcHBlcihvQ29udHJvbDogQ29udHJvbCk6IENvbnRyb2wgfCB1bmRlZmluZWQge1xuXHRpZiAob0NvbnRyb2wuaXNBKFwic2FwLmZlLm1hY3Jvcy5jb250cm9scy5GaWVsZFdyYXBwZXJcIikpIHtcblx0XHRjb25zdCBvRmllbGRXcmFwcGVyID0gb0NvbnRyb2wgYXMgRW5oYW5jZVdpdGhVSTU8RmllbGRXcmFwcGVyPjtcblx0XHRjb25zdCBhQ29udHJvbHMgPSBvRmllbGRXcmFwcGVyLmdldEVkaXRNb2RlKCkgPT09IFwiRGlzcGxheVwiID8gW29GaWVsZFdyYXBwZXIuZ2V0Q29udGVudERpc3BsYXkoKV0gOiBvRmllbGRXcmFwcGVyLmdldENvbnRlbnRFZGl0KCk7XG5cdFx0aWYgKGFDb250cm9scy5sZW5ndGggPj0gMSkge1xuXHRcdFx0cmV0dXJuIGFDb250cm9scy5sZW5ndGggPyBhQ29udHJvbHNbMF0gOiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBvQ29udHJvbDtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIGZpZWxkIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIFVzdWFsbHksIGEgRGF0YUZpZWxkIG9yIERhdGFQb2ludCBhbm5vdGF0aW9uIGlzIGV4cGVjdGVkLCBidXQgdGhlIGZpZWxkIGNhbiBhbHNvIGJlIHVzZWQgdG8gZGlzcGxheSBhIHByb3BlcnR5IGZyb20gdGhlIGVudGl0eSB0eXBlLlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpGaWVsZCBpZD1cIk15RmllbGRcIiBtZXRhUGF0aD1cIk15UHJvcGVydHlcIiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuRmllbGRcbiAqIEBwdWJsaWNcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEFQSVwiLCB7XG5cdHJldHVyblR5cGVzOiBbXG5cdFx0XCJzYXAuZmUuY29yZS5jb250cm9scy5Gb3JtRWxlbWVudFdyYXBwZXJcIiAvKiwgbm90IHN1cmUgaSB3YW50IHRvIGFkZCB0aG9zZSB5ZXQgXCJzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkQVBJXCIsIFwic2FwLm0uSEJveFwiLCBcInNhcC5mZS5tYWNyb3MuY29udHJvbHMuQ29uZGl0aW9uYWxXcmFwcGVyXCIsIFwic2FwLm0uQnV0dG9uXCIqL1xuXHRdXG59KVxuY2xhc3MgRmllbGRBUEkgZXh0ZW5kcyBNYWNyb0FQSSB7XG5cdC8qKlxuXHQgKiBBbiBleHByZXNzaW9uIHRoYXQgYWxsb3dzIHlvdSB0byBjb250cm9sIHRoZSBlZGl0YWJsZSBzdGF0ZSBvZiB0aGUgZmllbGQuXG5cdCAqXG5cdCAqIElmIHlvdSBkbyBub3Qgc2V0IGFueSBleHByZXNzaW9uLCBTQVAgRmlvcmkgZWxlbWVudHMgaG9va3MgaW50byB0aGUgc3RhbmRhcmQgbGlmZWN5Y2xlIHRvIGRldGVybWluZSBpZiB0aGUgcGFnZSBpcyBjdXJyZW50bHkgZWRpdGFibGUuXG5cdCAqIFBsZWFzZSBub3RlIHRoYXQgeW91IGNhbm5vdCBzZXQgYSBmaWVsZCB0byBlZGl0YWJsZSBpZiBpdCBoYXMgYmVlbiBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uIGFzIG5vdCBlZGl0YWJsZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQGRlcHJlY2F0ZWRcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGVkaXRhYmxlITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQW4gZXhwcmVzc2lvbiB0aGF0IGFsbG93cyB5b3UgdG8gY29udHJvbCB0aGUgcmVhZC1vbmx5IHN0YXRlIG9mIHRoZSBmaWVsZC5cblx0ICpcblx0ICogSWYgeW91IGRvIG5vdCBzZXQgYW55IGV4cHJlc3Npb24sIFNBUCBGaW9yaSBlbGVtZW50cyBob29rcyBpbnRvIHRoZSBzdGFuZGFyZCBsaWZlY3ljbGUgdG8gZGV0ZXJtaW5lIHRoZSBjdXJyZW50IHN0YXRlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRyZWFkT25seSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBpZGVudGlmaWVyIG9mIHRoZSBGaWVsZCBjb250cm9sLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSByZWxhdGl2ZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSBpbiB0aGUgbWV0YW1vZGVsLCBiYXNlZCBvbiB0aGUgY3VycmVudCBjb250ZXh0UGF0aC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGV4cGVjdGVkQW5ub3RhdGlvbnM6IFtdLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJQcm9wZXJ0eVwiXVxuXHR9KVxuXHRtZXRhUGF0aCE6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcGF0aCBvZiB0aGUgY29udGV4dCB1c2VkIGluIHRoZSBjdXJyZW50IHBhZ2Ugb3IgYmxvY2suXG5cdCAqIFRoaXMgc2V0dGluZyBpcyBkZWZpbmVkIGJ5IHRoZSBmcmFtZXdvcmsuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCJdXG5cdH0pXG5cdGNvbnRleHRQYXRoITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBBbiBldmVudCBjb250YWluaW5nIGRldGFpbHMgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHZhbHVlIG9mIHRoZSBmaWVsZCBpcyBjaGFuZ2VkLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRjaGFuZ2UhOiBGdW5jdGlvbjtcblxuXHRAYXNzb2NpYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgbXVsdGlwbGU6IHRydWUsIHNpbmd1bGFyTmFtZTogXCJhcmlhTGFiZWxsZWRCeVwiIH0pXG5cdGFyaWFMYWJlbGxlZEJ5ITogQ29udHJvbDtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRyZXF1aXJlZCE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEEgc2V0IG9mIG9wdGlvbnMgdGhhdCBjYW4gYmUgY29uZmlndXJlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzYXAuZmUubWFjcm9zLkZpZWxkRm9ybWF0T3B0aW9uc1wiIH0pXG5cdGZvcm1hdE9wdGlvbnMhOiBGaWVsZEZvcm1hdE9wdGlvbnM7XG5cblx0LyoqXG5cdCAqIE9wdGlvbiB0byBhZGQgc2VtYW50aWMgb2JqZWN0cyB0byBhIGZpZWxkLlxuXHQgKiBWYWxpZCBvcHRpb25zIGFyZSBlaXRoZXIgYSBzaW5nbGUgc2VtYW50aWMgb2JqZWN0LCBhIHN0cmluZ2lmaWVkIGFycmF5IG9mIHNlbWFudGljIG9iamVjdHNcblx0ICogb3IgYSBzaW5nbGUgYmluZGluZyBleHByZXNzaW9uIHJldHVybmluZyBlaXRoZXIgYSBzaW5nbGUgc2VtYW50aWMgb2JqZWN0IG9yIGFuIGFycmF5IG9mIHNlbWFudGljIG9iamVjdHNcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRzZW1hbnRpY09iamVjdCE6IHN0cmluZztcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRjb2xsYWJvcmF0aW9uRW5hYmxlZCE6IGJvb2xlYW47XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0dmlzaWJsZSE6IGJvb2xlYW47XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdGhhbmRsZUNoYW5nZShvRXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0KHRoaXMgYXMgYW55KS5maXJlQ2hhbmdlKHsgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKSwgaXNWYWxpZDogb0V2ZW50LmdldFBhcmFtZXRlcihcInZhbGlkXCIpIH0pO1xuXHR9XG5cblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0Y29uc3QgaXNBcmlhbExhYmVsbGVkQnlDb21wbGlhbnQgPSBmdW5jdGlvbiAoXG5cdFx0XHRjb250cm9sOiBDb250cm9sXG5cdFx0KTogY29udHJvbCBpcyBDb250cm9sICYgeyBhZGRBcmlhTGFiZWxsZWRCeTogRnVuY3Rpb247IGdldEFyaWFMYWJlbGxlZEJ5OiBGdW5jdGlvbiB9IHtcblx0XHRcdHJldHVybiBjb250cm9sLmlzQTxCdXR0b24gfCBGaWVsZFdyYXBwZXIgfCBNRENGaWVsZCB8IEZpbGVXcmFwcGVyPihbXG5cdFx0XHRcdFwic2FwLm0uQnV0dG9uXCIsXG5cdFx0XHRcdFwic2FwLmZlLm1hY3Jvcy5jb250cm9scy5GaWVsZFdyYXBwZXJcIixcblx0XHRcdFx0XCJzYXAudWkubWRjLkZpZWxkXCIsXG5cdFx0XHRcdFwic2FwLmZlLm1hY3Jvcy5jb250cm9scy5GaWxlV3JhcHBlclwiXG5cdFx0XHRdKTtcblx0XHR9O1xuXHRcdGNvbnN0IG9Db250ZW50ID0gdGhpcy5jb250ZW50O1xuXHRcdGlmIChvQ29udGVudCAmJiBpc0FyaWFsTGFiZWxsZWRCeUNvbXBsaWFudChvQ29udGVudCkgJiYgb0NvbnRlbnQuYWRkQXJpYUxhYmVsbGVkQnkpIHtcblx0XHRcdGNvbnN0IGFBcmlhTGFiZWxsZWRCeSA9ICh0aGlzIGFzIGFueSkuZ2V0QXJpYUxhYmVsbGVkQnkoKTtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhQXJpYUxhYmVsbGVkQnkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3Qgc0lkID0gYUFyaWFMYWJlbGxlZEJ5W2ldO1xuXHRcdFx0XHRjb25zdCBhQXJpYUxhYmVsbGVkQnlzID0gb0NvbnRlbnQuZ2V0QXJpYUxhYmVsbGVkQnkoKSB8fCBbXTtcblx0XHRcdFx0aWYgKGFBcmlhTGFiZWxsZWRCeXMuaW5kZXhPZihzSWQpID09PSAtMSkge1xuXHRcdFx0XHRcdG9Db250ZW50LmFkZEFyaWFMYWJlbGxlZEJ5KHNJZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRlbmhhbmNlQWNjZXNzaWJpbGl0eVN0YXRlKF9vRWxlbWVudDogb2JqZWN0LCBtQXJpYVByb3BzOiBvYmplY3QpOiBvYmplY3Qge1xuXHRcdGNvbnN0IG9QYXJlbnQgPSB0aGlzLmdldFBhcmVudCgpO1xuXG5cdFx0aWYgKG9QYXJlbnQgJiYgKG9QYXJlbnQgYXMgYW55KS5lbmhhbmNlQWNjZXNzaWJpbGl0eVN0YXRlKSB7XG5cdFx0XHQvLyB1c2UgRmllbGRXcmFwcGVyIGFzIGNvbnRyb2wsIGJ1dCBhcmlhIHByb3BlcnRpZXMgb2YgcmVuZGVyZWQgaW5uZXIgY29udHJvbC5cblx0XHRcdChvUGFyZW50IGFzIGFueSkuZW5oYW5jZUFjY2Vzc2liaWxpdHlTdGF0ZSh0aGlzLCBtQXJpYVByb3BzKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbUFyaWFQcm9wcztcblx0fVxuXG5cdGdldEFjY2Vzc2liaWxpdHlJbmZvKCk6IE9iamVjdCB7XG5cdFx0Y29uc3Qgb0NvbnRlbnQgPSB0aGlzLmNvbnRlbnQ7XG5cdFx0cmV0dXJuIG9Db250ZW50ICYmIG9Db250ZW50LmdldEFjY2Vzc2liaWxpdHlJbmZvID8gb0NvbnRlbnQuZ2V0QWNjZXNzaWJpbGl0eUluZm8oKSA6IHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIERPTU5vZGUgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIFwibGFiZWxGb3JcIiBhdHRyaWJ1dGUuXG5cdCAqXG5cdCAqIFdlIGZvcndhcmQgdGhlIGNhbGwgb2YgdGhpcyBtZXRob2QgdG8gdGhlIGNvbnRlbnQgY29udHJvbC5cblx0ICpcblx0ICogQHJldHVybnMgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIDxjb2RlPmxhYmVsRm9yPC9jb2RlPlxuXHQgKi9cblx0Z2V0SWRGb3JMYWJlbCgpOiBzdHJpbmcge1xuXHRcdGNvbnN0IG9Db250ZW50ID0gdGhpcy5jb250ZW50O1xuXHRcdHJldHVybiBvQ29udGVudC5nZXRJZEZvckxhYmVsKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBmaWVsZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgZmllbGRcblx0ICovXG5cdGdldFZhbHVlKCk6IGJvb2xlYW4gfCBzdHJpbmcge1xuXHRcdGxldCBvQ29udHJvbCA9IGdldENvbnRyb2xJbkZpZWxkV3JhcHBlcih0aGlzLmNvbnRlbnQpO1xuXHRcdGlmICh0aGlzLmNvbGxhYm9yYXRpb25FbmFibGVkICYmIG9Db250cm9sPy5pc0EoXCJzYXAubS5IQm94XCIpKSB7XG5cdFx0XHRvQ29udHJvbCA9IChvQ29udHJvbCBhcyBIQm94KS5nZXRJdGVtcygpWzBdO1xuXHRcdH1cblx0XHRpZiAob0NvbnRyb2w/LmlzQShcInNhcC5tLkNoZWNrQm94XCIpKSB7XG5cdFx0XHRyZXR1cm4gKG9Db250cm9sIGFzIENoZWNrQm94KS5nZXRTZWxlY3RlZCgpO1xuXHRcdH0gZWxzZSBpZiAob0NvbnRyb2w/LmlzQShcInNhcC5tLklucHV0QmFzZVwiKSkge1xuXHRcdFx0cmV0dXJuIChvQ29udHJvbCBhcyBJbnB1dEJhc2UpLmdldFZhbHVlKCk7XG5cdFx0fSBlbHNlIGlmIChvQ29udHJvbD8uaXNBKFwic2FwLnVpLm1kYy5GaWVsZFwiKSkge1xuXHRcdFx0cmV0dXJuIChvQ29udHJvbCBhcyBhbnkpLmdldFZhbHVlKCk7IC8vIEZpZWxkV3JhcHBlclxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBcImdldHRpbmcgdmFsdWUgbm90IHlldCBpbXBsZW1lbnRlZCBmb3IgdGhpcyBmaWVsZCB0eXBlXCI7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBtZXNzYWdlIHRvIHRoZSBmaWVsZC5cblx0ICpcblx0ICogQHBhcmFtIFtwYXJhbWV0ZXJzXSBUaGUgcGFyYW1ldGVycyB0byBjcmVhdGUgbWVzc2FnZVxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycy50eXBlIFR5cGUgb2YgdGhlIG1lc3NhZ2Vcblx0ICogQHBhcmFtIHBhcmFtZXRlcnMubWVzc2FnZSBNZXNzYWdlIHRleHRcblx0ICogQHBhcmFtIHBhcmFtZXRlcnMuZGVzY3JpcHRpb24gTWVzc2FnZSBkZXNjcmlwdGlvblxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycy5wZXJzaXN0ZW50IFRydWUgaWYgdGhlIG1lc3NhZ2UgaXMgcGVyc2lzdGVudFxuXHQgKiBAcmV0dXJucyBUaGUgaWQgb2YgdGhlIG1lc3NhZ2Vcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YWRkTWVzc2FnZShwYXJhbWV0ZXJzOiB7IHR5cGU/OiBNZXNzYWdlVHlwZTsgbWVzc2FnZT86IHN0cmluZzsgZGVzY3JpcHRpb24/OiBzdHJpbmc7IHBlcnNpc3RlbnQ/OiBib29sZWFuIH0pIHtcblx0XHRjb25zdCBtc2dNYW5hZ2VyID0gdGhpcy5nZXRNZXNzYWdlTWFuYWdlcigpO1xuXHRcdGNvbnN0IG9Db250cm9sID0gZ2V0Q29udHJvbEluRmllbGRXcmFwcGVyKHRoaXMuY29udGVudCk7XG5cblx0XHRsZXQgcGF0aDsgLy90YXJnZXQgZm9yIG9NZXNzYWdlXG5cdFx0aWYgKG9Db250cm9sPy5pc0EoXCJzYXAubS5DaGVja0JveFwiKSkge1xuXHRcdFx0cGF0aCA9IChvQ29udHJvbCBhcyBDaGVja0JveCkuZ2V0QmluZGluZyhcInNlbGVjdGVkXCIpPy5nZXRSZXNvbHZlZFBhdGgoKTtcblx0XHR9IGVsc2UgaWYgKG9Db250cm9sPy5pc0EoXCJzYXAubS5JbnB1dEJhc2VcIikpIHtcblx0XHRcdHBhdGggPSAob0NvbnRyb2wgYXMgSW5wdXRCYXNlKS5nZXRCaW5kaW5nKFwidmFsdWVcIik/LmdldFJlc29sdmVkUGF0aCgpO1xuXHRcdH0gZWxzZSBpZiAob0NvbnRyb2w/LmlzQShcInNhcC51aS5tZGMuRmllbGRcIikpIHtcblx0XHRcdHBhdGggPSAob0NvbnRyb2wgYXMgYW55KS5nZXRCaW5kaW5nKFwidmFsdWVcIikuZ2V0UmVzb2x2ZWRQYXRoKCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb01lc3NhZ2UgPSBuZXcgTWVzc2FnZSh7XG5cdFx0XHR0YXJnZXQ6IHBhdGgsXG5cdFx0XHR0eXBlOiBwYXJhbWV0ZXJzLnR5cGUsXG5cdFx0XHRtZXNzYWdlOiBwYXJhbWV0ZXJzLm1lc3NhZ2UsXG5cdFx0XHRwcm9jZXNzb3I6IG9Db250cm9sPy5nZXRNb2RlbCgpLFxuXHRcdFx0ZGVzY3JpcHRpb246IHBhcmFtZXRlcnMuZGVzY3JpcHRpb24sXG5cdFx0XHRwZXJzaXN0ZW50OiBwYXJhbWV0ZXJzLnBlcnNpc3RlbnRcblx0XHR9KTtcblxuXHRcdG1zZ01hbmFnZXIuYWRkTWVzc2FnZXMob01lc3NhZ2UpO1xuXHRcdHJldHVybiBvTWVzc2FnZS5nZXRJZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBtZXNzYWdlIGZyb20gdGhlIGZpZWxkLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGlkIG9mIHRoZSBtZXNzYWdlXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJlbW92ZU1lc3NhZ2UoaWQ6IHN0cmluZykge1xuXHRcdGNvbnN0IG1zZ01hbmFnZXIgPSB0aGlzLmdldE1lc3NhZ2VNYW5hZ2VyKCk7XG5cdFx0Y29uc3QgYXJyID0gbXNnTWFuYWdlci5nZXRNZXNzYWdlTW9kZWwoKS5nZXREYXRhKCk7XG5cdFx0Y29uc3QgcmVzdWx0ID0gYXJyLmZpbmQoKGU6IGFueSkgPT4gZS5pZCA9PT0gaWQpO1xuXHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdG1zZ01hbmFnZXIucmVtb3ZlTWVzc2FnZXMocmVzdWx0KTtcblx0XHR9XG5cdH1cblxuXHRnZXRNZXNzYWdlTWFuYWdlcigpIHtcblx0XHRyZXR1cm4gc2FwLnVpLmdldENvcmUoKS5nZXRNZXNzYWdlTWFuYWdlcigpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZpZWxkQVBJO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0VBdUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNBLHdCQUF3QixDQUFDQyxRQUFpQixFQUF1QjtJQUN6RSxJQUFJQSxRQUFRLENBQUNDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxFQUFFO01BQ3hELE1BQU1DLGFBQWEsR0FBR0YsUUFBd0M7TUFDOUQsTUFBTUcsU0FBUyxHQUFHRCxhQUFhLENBQUNFLFdBQVcsRUFBRSxLQUFLLFNBQVMsR0FBRyxDQUFDRixhQUFhLENBQUNHLGlCQUFpQixFQUFFLENBQUMsR0FBR0gsYUFBYSxDQUFDSSxjQUFjLEVBQUU7TUFDbEksSUFBSUgsU0FBUyxDQUFDSSxNQUFNLElBQUksQ0FBQyxFQUFFO1FBQzFCLE9BQU9KLFNBQVMsQ0FBQ0ksTUFBTSxHQUFHSixTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUdLLFNBQVM7TUFDbkQ7SUFDRCxDQUFDLE1BQU07TUFDTixPQUFPUixRQUFRO0lBQ2hCO0lBQ0EsT0FBT1EsU0FBUztFQUNqQjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBYkEsSUFtQk1DLFFBQVEsV0FMYkMsY0FBYyxDQUFDLDhCQUE4QixFQUFFO0lBQy9DQyxXQUFXLEVBQUUsQ0FDWix5Q0FBeUMsQ0FBQztFQUU1QyxDQUFDLENBQUMsVUFXQUMsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFVLENBQUMsQ0FBQyxVQVU3QkQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFVLENBQUMsQ0FBQyxVQVE3QkQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxVQVE1QkQsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxRQUFRO0lBQ2RDLG1CQUFtQixFQUFFLEVBQUU7SUFDdkJDLGFBQWEsRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixFQUFFLFVBQVU7RUFDekYsQ0FBQyxDQUFDLFVBU0RILFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsUUFBUTtJQUNkRSxhQUFhLEVBQUUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxvQkFBb0I7RUFDN0UsQ0FBQyxDQUFDLFVBUURDLEtBQUssRUFBRSxVQUdQQyxXQUFXLENBQUM7SUFBRUosSUFBSSxFQUFFLHFCQUFxQjtJQUFFSyxRQUFRLEVBQUUsSUFBSTtJQUFFQyxZQUFZLEVBQUU7RUFBaUIsQ0FBQyxDQUFDLFVBRzVGUCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFdBUTdCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQW1DLENBQUMsQ0FBQyxXQVV0REQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxXQUc1QkQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFVLENBQUMsQ0FBQyxXQUc3QkQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFVLENBQUMsQ0FBQyxXQUc3Qk8sZUFBZSxFQUFFO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQUNsQkMsWUFBWSxHQURaLHNCQUNhQyxNQUFnQixFQUFFO01BQzdCLElBQUksQ0FBU0MsVUFBVSxDQUFDO1FBQUVDLEtBQUssRUFBRSxJQUFJLENBQUNDLFFBQVEsRUFBRTtRQUFFQyxPQUFPLEVBQUVKLE1BQU0sQ0FBQ0ssWUFBWSxDQUFDLE9BQU87TUFBRSxDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUFBLE9BRURDLGlCQUFpQixHQUFqQiw2QkFBb0I7TUFDbkIsTUFBTUMsMEJBQTBCLEdBQUcsVUFDbENDLE9BQWdCLEVBQ29FO1FBQ3BGLE9BQU9BLE9BQU8sQ0FBQzdCLEdBQUcsQ0FBaUQsQ0FDbEUsY0FBYyxFQUNkLHFDQUFxQyxFQUNyQyxrQkFBa0IsRUFDbEIsb0NBQW9DLENBQ3BDLENBQUM7TUFDSCxDQUFDO01BQ0QsTUFBTThCLFFBQVEsR0FBRyxJQUFJLENBQUNDLE9BQU87TUFDN0IsSUFBSUQsUUFBUSxJQUFJRiwwQkFBMEIsQ0FBQ0UsUUFBUSxDQUFDLElBQUlBLFFBQVEsQ0FBQ0UsaUJBQWlCLEVBQUU7UUFDbkYsTUFBTUMsZUFBZSxHQUFJLElBQUksQ0FBU0MsaUJBQWlCLEVBQUU7UUFFekQsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdGLGVBQWUsQ0FBQzNCLE1BQU0sRUFBRTZCLENBQUMsRUFBRSxFQUFFO1VBQ2hELE1BQU1DLEdBQUcsR0FBR0gsZUFBZSxDQUFDRSxDQUFDLENBQUM7VUFDOUIsTUFBTUUsZ0JBQWdCLEdBQUdQLFFBQVEsQ0FBQ0ksaUJBQWlCLEVBQUUsSUFBSSxFQUFFO1VBQzNELElBQUlHLGdCQUFnQixDQUFDQyxPQUFPLENBQUNGLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3pDTixRQUFRLENBQUNFLGlCQUFpQixDQUFDSSxHQUFHLENBQUM7VUFDaEM7UUFDRDtNQUNEO0lBQ0QsQ0FBQztJQUFBLE9BRURHLHlCQUF5QixHQUF6QixtQ0FBMEJDLFNBQWlCLEVBQUVDLFVBQWtCLEVBQVU7TUFDeEUsTUFBTUMsT0FBTyxHQUFHLElBQUksQ0FBQ0MsU0FBUyxFQUFFO01BRWhDLElBQUlELE9BQU8sSUFBS0EsT0FBTyxDQUFTSCx5QkFBeUIsRUFBRTtRQUMxRDtRQUNDRyxPQUFPLENBQVNILHlCQUF5QixDQUFDLElBQUksRUFBRUUsVUFBVSxDQUFDO01BQzdEO01BRUEsT0FBT0EsVUFBVTtJQUNsQixDQUFDO0lBQUEsT0FFREcsb0JBQW9CLEdBQXBCLGdDQUErQjtNQUM5QixNQUFNZCxRQUFRLEdBQUcsSUFBSSxDQUFDQyxPQUFPO01BQzdCLE9BQU9ELFFBQVEsSUFBSUEsUUFBUSxDQUFDYyxvQkFBb0IsR0FBR2QsUUFBUSxDQUFDYyxvQkFBb0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN4Rjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsT0FPQUMsYUFBYSxHQUFiLHlCQUF3QjtNQUN2QixNQUFNZixRQUFRLEdBQUcsSUFBSSxDQUFDQyxPQUFPO01BQzdCLE9BQU9ELFFBQVEsQ0FBQ2UsYUFBYSxFQUFFO0lBQ2hDOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNQXJCLFFBQVEsR0FBUixvQkFBNkI7TUFBQTtNQUM1QixJQUFJekIsUUFBUSxHQUFHRCx3QkFBd0IsQ0FBQyxJQUFJLENBQUNpQyxPQUFPLENBQUM7TUFDckQsSUFBSSxJQUFJLENBQUNlLG9CQUFvQixpQkFBSS9DLFFBQVEsc0NBQVIsVUFBVUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO1FBQzdERCxRQUFRLEdBQUlBLFFBQVEsQ0FBVWdELFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztNQUM1QztNQUNBLGtCQUFJaEQsUUFBUSx1Q0FBUixXQUFVQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUNwQyxPQUFRRCxRQUFRLENBQWNpRCxXQUFXLEVBQUU7TUFDNUMsQ0FBQyxNQUFNLGtCQUFJakQsUUFBUSx1Q0FBUixXQUFVQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsRUFBRTtRQUM1QyxPQUFRRCxRQUFRLENBQWV5QixRQUFRLEVBQUU7TUFDMUMsQ0FBQyxNQUFNLGtCQUFJekIsUUFBUSx1Q0FBUixXQUFVQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUM3QyxPQUFRRCxRQUFRLENBQVN5QixRQUFRLEVBQUUsQ0FBQyxDQUFDO01BQ3RDLENBQUMsTUFBTTtRQUNOLE1BQU0sdURBQXVEO01BQzlEO0lBQ0Q7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVZDO0lBQUEsT0FXQXlCLFVBQVUsR0FBVixvQkFBV0MsVUFBZ0csRUFBRTtNQUM1RyxNQUFNQyxVQUFVLEdBQUcsSUFBSSxDQUFDQyxpQkFBaUIsRUFBRTtNQUMzQyxNQUFNckQsUUFBUSxHQUFHRCx3QkFBd0IsQ0FBQyxJQUFJLENBQUNpQyxPQUFPLENBQUM7TUFFdkQsSUFBSXNCLElBQUksQ0FBQyxDQUFDO01BQ1YsSUFBSXRELFFBQVEsYUFBUkEsUUFBUSxlQUFSQSxRQUFRLENBQUVDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQUE7UUFDcENxRCxJQUFJLGtCQUFJdEQsUUFBUSxDQUFjdUQsVUFBVSxDQUFDLFVBQVUsQ0FBQyxnREFBN0MsWUFBK0NDLGVBQWUsRUFBRTtNQUN4RSxDQUFDLE1BQU0sSUFBSXhELFFBQVEsYUFBUkEsUUFBUSxlQUFSQSxRQUFRLENBQUVDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1FBQUE7UUFDNUNxRCxJQUFJLG1CQUFJdEQsUUFBUSxDQUFldUQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxpREFBM0MsYUFBNkNDLGVBQWUsRUFBRTtNQUN0RSxDQUFDLE1BQU0sSUFBSXhELFFBQVEsYUFBUkEsUUFBUSxlQUFSQSxRQUFRLENBQUVDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1FBQzdDcUQsSUFBSSxHQUFJdEQsUUFBUSxDQUFTdUQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDQyxlQUFlLEVBQUU7TUFDL0Q7TUFFQSxNQUFNQyxRQUFRLEdBQUcsSUFBSUMsT0FBTyxDQUFDO1FBQzVCQyxNQUFNLEVBQUVMLElBQUk7UUFDWnpDLElBQUksRUFBRXNDLFVBQVUsQ0FBQ3RDLElBQUk7UUFDckIrQyxPQUFPLEVBQUVULFVBQVUsQ0FBQ1MsT0FBTztRQUMzQkMsU0FBUyxFQUFFN0QsUUFBUSxhQUFSQSxRQUFRLHVCQUFSQSxRQUFRLENBQUU4RCxRQUFRLEVBQUU7UUFDL0JDLFdBQVcsRUFBRVosVUFBVSxDQUFDWSxXQUFXO1FBQ25DQyxVQUFVLEVBQUViLFVBQVUsQ0FBQ2E7TUFDeEIsQ0FBQyxDQUFDO01BRUZaLFVBQVUsQ0FBQ2EsV0FBVyxDQUFDUixRQUFRLENBQUM7TUFDaEMsT0FBT0EsUUFBUSxDQUFDUyxLQUFLLEVBQUU7SUFDeEI7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BQyxhQUFhLEdBQWIsdUJBQWNDLEVBQVUsRUFBRTtNQUN6QixNQUFNaEIsVUFBVSxHQUFHLElBQUksQ0FBQ0MsaUJBQWlCLEVBQUU7TUFDM0MsTUFBTWdCLEdBQUcsR0FBR2pCLFVBQVUsQ0FBQ2tCLGVBQWUsRUFBRSxDQUFDQyxPQUFPLEVBQUU7TUFDbEQsTUFBTUMsTUFBTSxHQUFHSCxHQUFHLENBQUNJLElBQUksQ0FBRUMsQ0FBTSxJQUFLQSxDQUFDLENBQUNOLEVBQUUsS0FBS0EsRUFBRSxDQUFDO01BQ2hELElBQUlJLE1BQU0sRUFBRTtRQUNYcEIsVUFBVSxDQUFDdUIsY0FBYyxDQUFDSCxNQUFNLENBQUM7TUFDbEM7SUFDRCxDQUFDO0lBQUEsT0FFRG5CLGlCQUFpQixHQUFqQiw2QkFBb0I7TUFDbkIsT0FBT3VCLEdBQUcsQ0FBQ0MsRUFBRSxDQUFDQyxPQUFPLEVBQUUsQ0FBQ3pCLGlCQUFpQixFQUFFO0lBQzVDLENBQUM7SUFBQTtFQUFBLEVBbk9xQjBCLFFBQVE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQXNPaEJ0RSxRQUFRO0FBQUEifQ==