/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, BindingToolkit, StableIdHelper) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var _exports = {};
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let PaginatorBlock = (
  /**
   * Building block used to create a paginator control.
   *
   * Usage example:
   * <pre>
   * &lt;macro:Paginator /&gt;
   * </pre>
   *
   * @hideconstructor
   * @public
   * @since 1.94.0
   */
  _dec = defineBuildingBlock({
    name: "Paginator",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros",
    returnTypes: ["sap.m.HBox"]
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(PaginatorBlock, _BuildingBlockBase);
    function PaginatorBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    _exports = PaginatorBlock;
    var _proto = PaginatorBlock.prototype;
    /**
     * The building block template function.
     *
     * @returns An XML-based string
     */
    _proto.getTemplate = function getTemplate() {
      // The model name is hardcoded, as this building block can also be used transparently by application developers
      const navUpEnabledExpression = pathInModel("/navUpEnabled", "paginator");
      const navDownEnabledExpression = pathInModel("/navDownEnabled", "paginator");
      const visibleExpression = or(navUpEnabledExpression, navDownEnabledExpression);
      const navUpTooltipExpression = pathInModel("T_PAGINATOR_CONTROL_PAGINATOR_TOOLTIP_UP", "sap.fe.i18n");
      const navDownTooltipExpression = pathInModel("T_PAGINATOR_CONTROL_PAGINATOR_TOOLTIP_DOWN", "sap.fe.i18n");
      return xml`
			<m:HBox displayInline="true" id="${this.id}" visible="${visibleExpression}">
				<uxap:ObjectPageHeaderActionButton
					xmlns:uxap="sap.uxap"
					id="${generate([this.id, "previousItem"])}"
					enabled="${navUpEnabledExpression}"
					tooltip="${navUpTooltipExpression}"
					icon="sap-icon://navigation-up-arrow"
					press=".paginator.updateCurrentContext(-1)"
					type="Transparent"
					importance="High"
				/>
				<uxap:ObjectPageHeaderActionButton
					xmlns:uxap="sap.uxap"
					id="${generate([this.id, "nextItem"])}"
					enabled="${navDownEnabledExpression}"
					tooltip="${navDownTooltipExpression}"
					icon="sap-icon://navigation-down-arrow"
					press=".paginator.updateCurrentContext(1)"
					type="Transparent"
					importance="High"
				/>
			</m:HBox>`;
    };
    return PaginatorBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  })), _class2)) || _class);
  _exports = PaginatorBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWdpbmF0b3JCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwicmV0dXJuVHlwZXMiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJpc1B1YmxpYyIsImdldFRlbXBsYXRlIiwibmF2VXBFbmFibGVkRXhwcmVzc2lvbiIsInBhdGhJbk1vZGVsIiwibmF2RG93bkVuYWJsZWRFeHByZXNzaW9uIiwidmlzaWJsZUV4cHJlc3Npb24iLCJvciIsIm5hdlVwVG9vbHRpcEV4cHJlc3Npb24iLCJuYXZEb3duVG9vbHRpcEV4cHJlc3Npb24iLCJ4bWwiLCJpZCIsImdlbmVyYXRlIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlBhZ2luYXRvci5ibG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHsgb3IsIHBhdGhJbk1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayB1c2VkIHRvIGNyZWF0ZSBhIHBhZ2luYXRvciBjb250cm9sLlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOlBhZ2luYXRvciAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQHNpbmNlIDEuOTQuMFxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiUGFnaW5hdG9yXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIsXG5cdHB1YmxpY05hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsXG5cdHJldHVyblR5cGVzOiBbXCJzYXAubS5IQm94XCJdXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFnaW5hdG9yQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8qKlxuXHQgKiBUaGUgaWRlbnRpZmllciBvZiB0aGUgUGFnaW5hdG9yIGNvbnRyb2wuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRwdWJsaWMgaWQgPSBcIlwiO1xuXG5cdC8qKlxuXHQgKiBUaGUgYnVpbGRpbmcgYmxvY2sgdGVtcGxhdGUgZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmdcblx0ICovXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdC8vIFRoZSBtb2RlbCBuYW1lIGlzIGhhcmRjb2RlZCwgYXMgdGhpcyBidWlsZGluZyBibG9jayBjYW4gYWxzbyBiZSB1c2VkIHRyYW5zcGFyZW50bHkgYnkgYXBwbGljYXRpb24gZGV2ZWxvcGVyc1xuXHRcdGNvbnN0IG5hdlVwRW5hYmxlZEV4cHJlc3Npb24gPSBwYXRoSW5Nb2RlbChcIi9uYXZVcEVuYWJsZWRcIiwgXCJwYWdpbmF0b3JcIik7XG5cdFx0Y29uc3QgbmF2RG93bkVuYWJsZWRFeHByZXNzaW9uID0gcGF0aEluTW9kZWwoXCIvbmF2RG93bkVuYWJsZWRcIiwgXCJwYWdpbmF0b3JcIik7XG5cdFx0Y29uc3QgdmlzaWJsZUV4cHJlc3Npb24gPSBvcihuYXZVcEVuYWJsZWRFeHByZXNzaW9uLCBuYXZEb3duRW5hYmxlZEV4cHJlc3Npb24pO1xuXG5cdFx0Y29uc3QgbmF2VXBUb29sdGlwRXhwcmVzc2lvbiA9IHBhdGhJbk1vZGVsKFwiVF9QQUdJTkFUT1JfQ09OVFJPTF9QQUdJTkFUT1JfVE9PTFRJUF9VUFwiLCBcInNhcC5mZS5pMThuXCIpO1xuXHRcdGNvbnN0IG5hdkRvd25Ub29sdGlwRXhwcmVzc2lvbiA9IHBhdGhJbk1vZGVsKFwiVF9QQUdJTkFUT1JfQ09OVFJPTF9QQUdJTkFUT1JfVE9PTFRJUF9ET1dOXCIsIFwic2FwLmZlLmkxOG5cIik7XG5cblx0XHRyZXR1cm4geG1sYFxuXHRcdFx0PG06SEJveCBkaXNwbGF5SW5saW5lPVwidHJ1ZVwiIGlkPVwiJHt0aGlzLmlkfVwiIHZpc2libGU9XCIke3Zpc2libGVFeHByZXNzaW9ufVwiPlxuXHRcdFx0XHQ8dXhhcDpPYmplY3RQYWdlSGVhZGVyQWN0aW9uQnV0dG9uXG5cdFx0XHRcdFx0eG1sbnM6dXhhcD1cInNhcC51eGFwXCJcblx0XHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwicHJldmlvdXNJdGVtXCJdKX1cIlxuXHRcdFx0XHRcdGVuYWJsZWQ9XCIke25hdlVwRW5hYmxlZEV4cHJlc3Npb259XCJcblx0XHRcdFx0XHR0b29sdGlwPVwiJHtuYXZVcFRvb2x0aXBFeHByZXNzaW9ufVwiXG5cdFx0XHRcdFx0aWNvbj1cInNhcC1pY29uOi8vbmF2aWdhdGlvbi11cC1hcnJvd1wiXG5cdFx0XHRcdFx0cHJlc3M9XCIucGFnaW5hdG9yLnVwZGF0ZUN1cnJlbnRDb250ZXh0KC0xKVwiXG5cdFx0XHRcdFx0dHlwZT1cIlRyYW5zcGFyZW50XCJcblx0XHRcdFx0XHRpbXBvcnRhbmNlPVwiSGlnaFwiXG5cdFx0XHRcdC8+XG5cdFx0XHRcdDx1eGFwOk9iamVjdFBhZ2VIZWFkZXJBY3Rpb25CdXR0b25cblx0XHRcdFx0XHR4bWxuczp1eGFwPVwic2FwLnV4YXBcIlxuXHRcdFx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJuZXh0SXRlbVwiXSl9XCJcblx0XHRcdFx0XHRlbmFibGVkPVwiJHtuYXZEb3duRW5hYmxlZEV4cHJlc3Npb259XCJcblx0XHRcdFx0XHR0b29sdGlwPVwiJHtuYXZEb3duVG9vbHRpcEV4cHJlc3Npb259XCJcblx0XHRcdFx0XHRpY29uPVwic2FwLWljb246Ly9uYXZpZ2F0aW9uLWRvd24tYXJyb3dcIlxuXHRcdFx0XHRcdHByZXNzPVwiLnBhZ2luYXRvci51cGRhdGVDdXJyZW50Q29udGV4dCgxKVwiXG5cdFx0XHRcdFx0dHlwZT1cIlRyYW5zcGFyZW50XCJcblx0XHRcdFx0XHRpbXBvcnRhbmNlPVwiSGlnaFwiXG5cdFx0XHRcdC8+XG5cdFx0XHQ8L206SEJveD5gO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXdCcUJBLGNBQWM7RUFsQm5DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVhBLE9BWUNDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsV0FBVztJQUNqQkMsU0FBUyxFQUFFLHdCQUF3QjtJQUNuQ0MsZUFBZSxFQUFFLGVBQWU7SUFDaENDLFdBQVcsRUFBRSxDQUFDLFlBQVk7RUFDM0IsQ0FBQyxDQUFDLFVBS0FDLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBQUE7SUFHbkQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUpDLE9BS0FDLFdBQVcsR0FBWCx1QkFBYztNQUNiO01BQ0EsTUFBTUMsc0JBQXNCLEdBQUdDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsV0FBVyxDQUFDO01BQ3hFLE1BQU1DLHdCQUF3QixHQUFHRCxXQUFXLENBQUMsaUJBQWlCLEVBQUUsV0FBVyxDQUFDO01BQzVFLE1BQU1FLGlCQUFpQixHQUFHQyxFQUFFLENBQUNKLHNCQUFzQixFQUFFRSx3QkFBd0IsQ0FBQztNQUU5RSxNQUFNRyxzQkFBc0IsR0FBR0osV0FBVyxDQUFDLDBDQUEwQyxFQUFFLGFBQWEsQ0FBQztNQUNyRyxNQUFNSyx3QkFBd0IsR0FBR0wsV0FBVyxDQUFDLDRDQUE0QyxFQUFFLGFBQWEsQ0FBQztNQUV6RyxPQUFPTSxHQUFJO0FBQ2Isc0NBQXNDLElBQUksQ0FBQ0MsRUFBRyxjQUFhTCxpQkFBa0I7QUFDN0U7QUFDQTtBQUNBLFdBQVdNLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQ0QsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFFO0FBQy9DLGdCQUFnQlIsc0JBQXVCO0FBQ3ZDLGdCQUFnQkssc0JBQXVCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBV0ksUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDRCxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUU7QUFDM0MsZ0JBQWdCTix3QkFBeUI7QUFDekMsZ0JBQWdCSSx3QkFBeUI7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7SUFDWixDQUFDO0lBQUE7RUFBQSxFQTVDMENJLGlCQUFpQjtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FLaEQsRUFBRTtJQUFBO0VBQUE7RUFBQTtFQUFBO0FBQUEifQ==