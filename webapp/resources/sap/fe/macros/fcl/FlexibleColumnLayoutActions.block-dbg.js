/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor) {
  "use strict";

  var _dec, _class;
  var _exports = {};
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let FlexibleColumnLayoutActionsBlock = (_dec = defineBuildingBlock({
    name: "FlexibleColumnLayoutActions",
    namespace: "sap.fe.macros.fcl",
    publicNamespace: "sap.fe.macros",
    returnTypes: ["sap.m.OverflowToolbarButton"]
  }), _dec(_class = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FlexibleColumnLayoutActionsBlock, _BuildingBlockBase);
    function FlexibleColumnLayoutActionsBlock() {
      return _BuildingBlockBase.apply(this, arguments) || this;
    }
    _exports = FlexibleColumnLayoutActionsBlock;
    var _proto = FlexibleColumnLayoutActionsBlock.prototype;
    _proto.getTemplate = function getTemplate() {
      return xml`
            <m:OverflowToolbarButton
                id="fe::FCLStandardAction::FullScreen"
                type="Transparent"
                icon="{fclhelper>/actionButtonsInfo/switchIcon}"
                visible="{fclhelper>/actionButtonsInfo/switchVisible}"
                press="._routing.switchFullScreen()"
            />
            <m:OverflowToolbarButton
                id="fe::FCLStandardAction::Close"
                type="Transparent"
                icon="sap-icon://decline"
                tooltip="{sap.fe.i18n>C_COMMON_SAPFE_CLOSE}"
                visible="{fclhelper>/actionButtonsInfo/closeVisible}"
                press="._routing.closeColumn()"
            />`;
    };
    return FlexibleColumnLayoutActionsBlock;
  }(BuildingBlockBase)) || _class);
  _exports = FlexibleColumnLayoutActionsBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGbGV4aWJsZUNvbHVtbkxheW91dEFjdGlvbnNCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwicmV0dXJuVHlwZXMiLCJnZXRUZW1wbGF0ZSIsInhtbCIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGbGV4aWJsZUNvbHVtbkxheW91dEFjdGlvbnMuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiRmxleGlibGVDb2x1bW5MYXlvdXRBY3Rpb25zXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmZjbFwiLFxuXHRwdWJsaWNOYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiLFxuXHRyZXR1cm5UeXBlczogW1wic2FwLm0uT3ZlcmZsb3dUb29sYmFyQnV0dG9uXCJdXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmxleGlibGVDb2x1bW5MYXlvdXRBY3Rpb25zQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdHJldHVybiB4bWxgXG4gICAgICAgICAgICA8bTpPdmVyZmxvd1Rvb2xiYXJCdXR0b25cbiAgICAgICAgICAgICAgICBpZD1cImZlOjpGQ0xTdGFuZGFyZEFjdGlvbjo6RnVsbFNjcmVlblwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIlRyYW5zcGFyZW50XCJcbiAgICAgICAgICAgICAgICBpY29uPVwie2ZjbGhlbHBlcj4vYWN0aW9uQnV0dG9uc0luZm8vc3dpdGNoSWNvbn1cIlxuICAgICAgICAgICAgICAgIHZpc2libGU9XCJ7ZmNsaGVscGVyPi9hY3Rpb25CdXR0b25zSW5mby9zd2l0Y2hWaXNpYmxlfVwiXG4gICAgICAgICAgICAgICAgcHJlc3M9XCIuX3JvdXRpbmcuc3dpdGNoRnVsbFNjcmVlbigpXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8bTpPdmVyZmxvd1Rvb2xiYXJCdXR0b25cbiAgICAgICAgICAgICAgICBpZD1cImZlOjpGQ0xTdGFuZGFyZEFjdGlvbjo6Q2xvc2VcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJUcmFuc3BhcmVudFwiXG4gICAgICAgICAgICAgICAgaWNvbj1cInNhcC1pY29uOi8vZGVjbGluZVwiXG4gICAgICAgICAgICAgICAgdG9vbHRpcD1cIntzYXAuZmUuaTE4bj5DX0NPTU1PTl9TQVBGRV9DTE9TRX1cIlxuICAgICAgICAgICAgICAgIHZpc2libGU9XCJ7ZmNsaGVscGVyPi9hY3Rpb25CdXR0b25zSW5mby9jbG9zZVZpc2libGV9XCJcbiAgICAgICAgICAgICAgICBwcmVzcz1cIi5fcm91dGluZy5jbG9zZUNvbHVtbigpXCJcbiAgICAgICAgICAgIC8+YDtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O01BVXFCQSxnQ0FBZ0MsV0FOcERDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsNkJBQTZCO0lBQ25DQyxTQUFTLEVBQUUsbUJBQW1CO0lBQzlCQyxlQUFlLEVBQUUsZUFBZTtJQUNoQ0MsV0FBVyxFQUFFLENBQUMsNkJBQTZCO0VBQzVDLENBQUMsQ0FBQztJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBLE9BRURDLFdBQVcsR0FBWCx1QkFBYztNQUNiLE9BQU9DLEdBQUk7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtJQUNkLENBQUM7SUFBQTtFQUFBLEVBbEI0REMsaUJBQWlCO0VBQUE7RUFBQTtBQUFBIn0=