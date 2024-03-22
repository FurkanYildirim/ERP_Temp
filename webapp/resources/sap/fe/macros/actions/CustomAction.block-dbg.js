/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/helpers/FPMHelper", "sap/m/Button", "sap/fe/core/jsx-runtime/jsx"], function (Log, BuildingBlockSupport, RuntimeBuildingBlock, FPMHelper, Button, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CustomActionBlock = (_dec = defineBuildingBlock({
    name: "CustomAction",
    namespace: "sap.fe.macros.actions"
  }), _dec2 = blockAttribute({
    type: "object",
    required: true
  }), _dec3 = blockAttribute({
    type: "string",
    required: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(CustomActionBlock, _RuntimeBuildingBlock);
    function CustomActionBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _RuntimeBuildingBlock.call(this, ...args) || this;
      _initializerDefineProperty(_this, "action", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    _exports = CustomActionBlock;
    var _proto = CustomActionBlock.prototype;
    _proto.getContent = function getContent() {
      let pressEvent;
      if (this.action.command) {
        pressEvent = {
          "jsx:command": `${this.action.command}|press`
        };
      } else {
        pressEvent = {
          press: event => {
            FPMHelper.actionWrapper(event, this.action.handlerModule, this.action.handlerMethod, {}).catch(error => Log.error(error));
          }
        };
      }
      return _jsx(Button, {
        id: this.id,
        text: this.action.text ?? "",
        ...pressEvent,
        type: "Transparent",
        visible: this.action.visible,
        enabled: this.action.enabled
      });
    };
    return CustomActionBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "action", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = CustomActionBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXN0b21BY3Rpb25CbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJnZXRDb250ZW50IiwicHJlc3NFdmVudCIsImFjdGlvbiIsImNvbW1hbmQiLCJwcmVzcyIsImV2ZW50IiwiRlBNSGVscGVyIiwiYWN0aW9uV3JhcHBlciIsImhhbmRsZXJNb2R1bGUiLCJoYW5kbGVyTWV0aG9kIiwiY2F0Y2giLCJlcnJvciIsIkxvZyIsImlkIiwidGV4dCIsInZpc2libGUiLCJlbmFibGVkIiwiUnVudGltZUJ1aWxkaW5nQmxvY2siXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkN1c3RvbUFjdGlvbi5ibG9jay50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9SdW50aW1lQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHR5cGUgeyBDdXN0b21BY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgRlBNSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0ZQTUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBDb21tYW5kUHJvcGVydGllcyB9IGZyb20gXCJzYXAvZmUvY29yZS9qc3gtcnVudGltZS9qc3hcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHsgbmFtZTogXCJDdXN0b21BY3Rpb25cIiwgbmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuYWN0aW9uc1wiIH0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDdXN0b21BY3Rpb25CbG9jayBleHRlbmRzIFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIHtcblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJvYmplY3RcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0YWN0aW9uITogQ3VzdG9tQWN0aW9uO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRpZCE6IHN0cmluZztcblxuXHRnZXRDb250ZW50KCkge1xuXHRcdGxldCBwcmVzc0V2ZW50OiB7IHByZXNzOiAoZXZlbnQ6IEV2ZW50KSA9PiB2b2lkIH0gfCB7IFwianN4OmNvbW1hbmRcIjogQ29tbWFuZFByb3BlcnRpZXMgfTtcblx0XHRpZiAodGhpcy5hY3Rpb24uY29tbWFuZCkge1xuXHRcdFx0cHJlc3NFdmVudCA9IHsgXCJqc3g6Y29tbWFuZFwiOiBgJHt0aGlzLmFjdGlvbi5jb21tYW5kfXxwcmVzc2AgYXMgQ29tbWFuZFByb3BlcnRpZXMgfTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHJlc3NFdmVudCA9IHtcblx0XHRcdFx0cHJlc3M6IChldmVudDogRXZlbnQpID0+IHtcblx0XHRcdFx0XHRGUE1IZWxwZXIuYWN0aW9uV3JhcHBlcihldmVudCwgdGhpcy5hY3Rpb24uaGFuZGxlck1vZHVsZSwgdGhpcy5hY3Rpb24uaGFuZGxlck1ldGhvZCwge30pLmNhdGNoKChlcnJvcjogdW5rbm93bikgPT5cblx0XHRcdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBzdHJpbmcpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdDxCdXR0b25cblx0XHRcdFx0aWQ9e3RoaXMuaWR9XG5cdFx0XHRcdHRleHQ9e3RoaXMuYWN0aW9uLnRleHQgPz8gXCJcIn1cblx0XHRcdFx0ey4uLnByZXNzRXZlbnR9XG5cdFx0XHRcdHR5cGU9XCJUcmFuc3BhcmVudFwiXG5cdFx0XHRcdHZpc2libGU9e3RoaXMuYWN0aW9uLnZpc2libGV9XG5cdFx0XHRcdGVuYWJsZWQ9e3RoaXMuYWN0aW9uLmVuYWJsZWR9XG5cdFx0XHQvPlxuXHRcdCkgYXMgQnV0dG9uO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O01BVXFCQSxpQkFBaUIsV0FEckNDLG1CQUFtQixDQUFDO0lBQUVDLElBQUksRUFBRSxjQUFjO0lBQUVDLFNBQVMsRUFBRTtFQUF3QixDQUFDLENBQUMsVUFFaEZDLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHbERGLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBLE9BR0ZDLFVBQVUsR0FBVixzQkFBYTtNQUNaLElBQUlDLFVBQW9GO01BQ3hGLElBQUksSUFBSSxDQUFDQyxNQUFNLENBQUNDLE9BQU8sRUFBRTtRQUN4QkYsVUFBVSxHQUFHO1VBQUUsYUFBYSxFQUFHLEdBQUUsSUFBSSxDQUFDQyxNQUFNLENBQUNDLE9BQVE7UUFBNkIsQ0FBQztNQUNwRixDQUFDLE1BQU07UUFDTkYsVUFBVSxHQUFHO1VBQ1pHLEtBQUssRUFBR0MsS0FBWSxJQUFLO1lBQ3hCQyxTQUFTLENBQUNDLGFBQWEsQ0FBQ0YsS0FBSyxFQUFFLElBQUksQ0FBQ0gsTUFBTSxDQUFDTSxhQUFhLEVBQUUsSUFBSSxDQUFDTixNQUFNLENBQUNPLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDQyxLQUFLLENBQUVDLEtBQWMsSUFDN0dDLEdBQUcsQ0FBQ0QsS0FBSyxDQUFDQSxLQUFLLENBQVcsQ0FDMUI7VUFDRjtRQUNELENBQUM7TUFDRjtNQUNBLE9BQ0MsS0FBQyxNQUFNO1FBQ04sRUFBRSxFQUFFLElBQUksQ0FBQ0UsRUFBRztRQUNaLElBQUksRUFBRSxJQUFJLENBQUNYLE1BQU0sQ0FBQ1ksSUFBSSxJQUFJLEVBQUc7UUFBQSxHQUN6QmIsVUFBVTtRQUNkLElBQUksRUFBQyxhQUFhO1FBQ2xCLE9BQU8sRUFBRSxJQUFJLENBQUNDLE1BQU0sQ0FBQ2EsT0FBUTtRQUM3QixPQUFPLEVBQUUsSUFBSSxDQUFDYixNQUFNLENBQUNjO01BQVEsRUFDNUI7SUFFSixDQUFDO0lBQUE7RUFBQSxFQWpDNkNDLG9CQUFvQjtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUE7RUFBQTtBQUFBIn0=