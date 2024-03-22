/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/uid", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/helpers/Aggregation", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/CommonHelper", "sap/ui/core/library", "sap/ui/model/json/JSONModel", "../internal/helpers/ActionHelper", "../internal/helpers/DefaultActionHandler", "./ChartHelper"], function (Log, uid, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, DataField, DataVisualization, Aggregation, MetaModelConverter, BindingToolkit, ModelHelper, StableIdHelper, DataModelPathHelper, CommonHelper, library, JSONModel, ActionHelper, DefaultActionHandler, ChartHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _class3;
  var _exports = {};
  var TitleLevel = library.TitleLevel;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var generate = StableIdHelper.generate;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var AggregationHelper = Aggregation.AggregationHelper;
  var getVisualizationsFromPresentationVariant = DataVisualization.getVisualizationsFromPresentationVariant;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var isDataModelObjectPathForActionWithDialog = DataField.isDataModelObjectPathForActionWithDialog;
  var xml = BuildingBlockTemplateProcessor.xml;
  var escapeXMLAttributeValue = BuildingBlockTemplateProcessor.escapeXMLAttributeValue;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockEvent = BuildingBlockSupport.blockEvent;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  var blockAggregation = BuildingBlockSupport.blockAggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const measureRole = {
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1": "axis1",
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2": "axis2",
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3": "axis3",
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis4": "axis4"
  };
  var personalizationValues;
  /**
   * Build actions and action groups with all properties for chart visualization.
   *
   * @param childAction XML node corresponding to actions
   * @returns Prepared action object
   */
  (function (personalizationValues) {
    personalizationValues["Sort"] = "Sort";
    personalizationValues["Type"] = "Type";
    personalizationValues["Item"] = "Item";
    personalizationValues["Filter"] = "Filter";
  })(personalizationValues || (personalizationValues = {}));
  const setCustomActionProperties = function (childAction) {
    var _action$getAttribute;
    let menuContentActions = null;
    const action = childAction;
    let menuActions = [];
    const actionKey = (_action$getAttribute = action.getAttribute("key")) === null || _action$getAttribute === void 0 ? void 0 : _action$getAttribute.replace("InlineXML_", "");
    // For the actionGroup we authorize the both entries <sap.fe.macros:ActionGroup> (compliant with old FPM examples) and <sap.fe.macros.chart:ActionGroup>
    if (action.children.length && action.localName === "ActionGroup" && action.namespaceURI && ["sap.fe.macros", "sap.fe.macros.chart"].indexOf(action.namespaceURI) > -1) {
      const actionsToAdd = Array.prototype.slice.apply(action.children);
      let actionIdx = 0;
      menuContentActions = actionsToAdd.reduce((customAction, actToAdd) => {
        var _actToAdd$getAttribut;
        const actionKeyAdd = ((_actToAdd$getAttribut = actToAdd.getAttribute("key")) === null || _actToAdd$getAttribut === void 0 ? void 0 : _actToAdd$getAttribut.replace("InlineXML_", "")) || actionKey + "_Menu_" + actionIdx;
        const curOutObject = {
          key: actionKeyAdd,
          text: actToAdd.getAttribute("text"),
          __noWrap: true,
          press: actToAdd.getAttribute("press"),
          requiresSelection: actToAdd.getAttribute("requiresSelection") === "true",
          enabled: actToAdd.getAttribute("enabled") === null ? true : actToAdd.getAttribute("enabled")
        };
        customAction[curOutObject.key] = curOutObject;
        actionIdx++;
        return customAction;
      }, {});
      menuActions = Object.values(menuContentActions).slice(-action.children.length).map(function (menuItem) {
        return menuItem.key;
      });
    }
    return {
      key: actionKey,
      text: action.getAttribute("text"),
      position: {
        placement: action.getAttribute("placement"),
        anchor: action.getAttribute("anchor")
      },
      __noWrap: true,
      press: action.getAttribute("press"),
      requiresSelection: action.getAttribute("requiresSelection") === "true",
      enabled: action.getAttribute("enabled") === null ? true : action.getAttribute("enabled"),
      menu: menuActions.length ? menuActions : null,
      menuContentActions: menuContentActions
    };
  };
  let ChartBlock = (
  /**
   *
   * Building block for creating a Chart based on the metadata provided by OData V4.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Chart id="MyChart" metaPath="@com.sap.vocabularies.UI.v1.Chart" /&gt;
   * </pre>
   *
   * Building block for creating a Chart based on the metadata provided by OData V4.
   *
   * @private
   * @experimental
   */
  _dec = defineBuildingBlock({
    name: "Chart",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros",
    returnTypes: ["sap.fe.macros.chart.ChartAPI"]
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "object"
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec9 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec10 = blockAttribute({
    type: "sap.ui.core.TitleLevel",
    isPublic: true
  }), _dec11 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec12 = blockAttribute({
    type: "string|boolean",
    isPublic: true
  }), _dec13 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec14 = blockAttribute({
    type: "string"
  }), _dec15 = blockAttribute({
    type: "string"
  }), _dec16 = blockAttribute({
    type: "string"
  }), _dec17 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec18 = blockAttribute({
    type: "boolean"
  }), _dec19 = blockAttribute({
    type: "boolean"
  }), _dec20 = blockAttribute({
    type: "string"
  }), _dec21 = blockAttribute({
    type: "string"
  }), _dec22 = blockAttribute({
    type: "string"
  }), _dec23 = blockAttribute({
    type: "string"
  }), _dec24 = blockAttribute({
    type: "boolean"
  }), _dec25 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec26 = blockEvent(), _dec27 = blockEvent(), _dec28 = blockAggregation({
    type: "sap.fe.macros.internal.chart.Action | sap.fe.macros.internal.chart.ActionGroup",
    isPublic: true,
    processAggregations: setCustomActionProperties
  }), _dec29 = blockEvent(), _dec30 = blockEvent(), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(ChartBlock, _BuildingBlockBase);
    /**
     * ID of the chart
     */

    /**
     * Metadata path to the presentation context (UI.Chart with or without a qualifier)
     */

    // We require metaPath to be there even though it is not formally required

    /**
     * Metadata path to the entitySet or navigationProperty
     */

    // We require contextPath to be there even though it is not formally required

    /**
     * The height of the chart
     */

    /**
     * The width of the chart
     */

    /**
     * Specifies the header text that is shown in the chart
     */

    /**
     * Specifies the visibility of the chart header
     */

    /**
     * Defines the "aria-level" of the chart header
     */

    /**
     * Specifies the selection mode
     */

    /**
     * Parameter which sets the personalization of the chart
     */

    /**
     * Parameter which sets the ID of the filterbar associating it to the chart
     */

    /**
     * 	Parameter which sets the noDataText for the chart
     */

    /**
     * Parameter which sets the chart delegate for the chart
     */

    /**
     * Parameter which sets the visualization properties for the chart
     */

    /**
     * The actions to be shown in the action area of the chart
     */

    /**
     * The XML and manifest actions to be shown in the action area of the chart
     */

    /**
     * An event triggered when chart selections are changed. The event contains information about the data selected/deselected and
     * the Boolean flag that indicates whether data is selected or deselected
     */

    /**
     * Event handler to react to the stateChange event of the chart.
     */

    function ChartBlock(_props, configuration, _settings) {
      var _this;
      _this = _BuildingBlockBase.call(this, _props, configuration, _settings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartDefinition", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "height", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "width", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "header", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerVisible", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerLevel", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionMode", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "personalization", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBar", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "noDataText", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartDelegate", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "vizProperties", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartActions", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "draftSupported", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "autoBindOnInit", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationPath", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filter", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "measures", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_applyIdToContent", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantSelected", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantSaved", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionChange", _descriptor28, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor29, _assertThisInitialized(_this));
      _this._commandActions = [];
      _this.createChartDefinition = (converterContext, contextObjectPath, controlPath) => {
        var _this$metaPath, _this$metaPath$getObj;
        let visualizationPath = getContextRelativeTargetObjectPath(contextObjectPath);
        if (((_this$metaPath = _this.metaPath) === null || _this$metaPath === void 0 ? void 0 : (_this$metaPath$getObj = _this$metaPath.getObject()) === null || _this$metaPath$getObj === void 0 ? void 0 : _this$metaPath$getObj.$Type) === "com.sap.vocabularies.UI.v1.PresentationVariantType") {
          const visualizations = _this.metaPath.getObject().Visualizations;
          visualizationPath = ChartBlock.checkChartVisualizationPath(visualizations, visualizationPath);
        }

        // fallback to default Chart if visualizationPath is missing or visualizationPath is not found in control (in case of PresentationVariant)
        if (!visualizationPath || controlPath.indexOf(visualizationPath) === -1) {
          visualizationPath = `@${"com.sap.vocabularies.UI.v1.Chart"}`;
        }
        const visualizationDefinition = getDataVisualizationConfiguration(visualizationPath, _this.useCondensedLayout, converterContext, undefined, undefined, undefined, true);
        return visualizationDefinition.visualizations[0];
      };
      _this.createBindingContext = function (data, settings) {
        const contextPath = `/${uid()}`;
        settings.models.converterContext.setProperty(contextPath, data);
        return settings.models.converterContext.createBindingContext(contextPath);
      };
      _this.getChartMeasures = (props, aggregationHelper) => {
        const chartAnnotationPath = props.chartDefinition.annotationPath.split("/");
        // this is required because getAbsolutePath in converterContext returns "/SalesOrderManage/_Item/_Item/@com.sap.vocabularies.v1.Chart" as annotationPath
        const annotationPath = chartAnnotationPath.filter(function (item, pos) {
          return chartAnnotationPath.indexOf(item) == pos;
        }).toString().replaceAll(",", "/");
        const oChart = getInvolvedDataModelObjects(_this.metaPath.getModel().createBindingContext(annotationPath), _this.contextPath).targetObject;
        const aggregatedProperty = aggregationHelper.getAggregatedProperties("AggregatedProperty");
        let measures = [];
        const annoPath = props.metaPath.getPath();
        const aggregatedProperties = aggregationHelper.getAggregatedProperties("AggregatedProperties");
        const chartMeasures = oChart.Measures ? oChart.Measures : [];
        const chartDynamicMeasures = oChart.DynamicMeasures ? oChart.DynamicMeasures : [];
        //check if there are measures pointing to aggregatedproperties
        const transAggInMeasures = aggregatedProperties[0] ? aggregatedProperties[0].filter(function (properties) {
          return chartMeasures.some(function (propertyMeasureType) {
            return properties.Name === propertyMeasureType.value;
          });
        }) : undefined;
        const entitySetPath = annoPath.replace(/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant|SelectionPresentationVariant).*/, "");
        const transAggregations = props.chartDefinition.transAgg;
        const customAggregations = props.chartDefinition.customAgg;
        // intimate the user if there is Aggregatedproperty configured with no DYnamicMeasures, bu there are measures with AggregatedProperties
        if (aggregatedProperty.length > 0 && !chartDynamicMeasures && transAggInMeasures.length > 0) {
          Log.warning("The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly.");
        }
        const isCustomAggregateIsMeasure = chartMeasures.some(oChartMeasure => {
          const oCustomAggMeasure = _this.getCustomAggMeasure(customAggregations, oChartMeasure);
          return !!oCustomAggMeasure;
        });
        if (aggregatedProperty.length > 0 && !(chartDynamicMeasures !== null && chartDynamicMeasures !== void 0 && chartDynamicMeasures.length) && !isCustomAggregateIsMeasure) {
          throw new Error("Please configure DynamicMeasures for the chart");
        }
        if (aggregatedProperty.length > 0) {
          for (const dynamicMeasure of chartDynamicMeasures) {
            measures = _this.getDynamicMeasures(measures, dynamicMeasure, entitySetPath, oChart);
          }
        }
        for (const chartMeasure of chartMeasures) {
          const key = chartMeasure.value;
          const customAggMeasure = _this.getCustomAggMeasure(customAggregations, chartMeasure);
          const measureType = {};
          if (customAggMeasure) {
            measures = _this.setCustomAggMeasure(measures, measureType, customAggMeasure, key);
            //if there is neither aggregatedProperty nor measures pointing to customAggregates, but we have normal measures. Now check if these measures are part of AggregatedProperties Obj
          } else if (aggregatedProperty.length === 0 && transAggregations[key]) {
            measures = _this.setTransAggMeasure(measures, measureType, transAggregations, key);
          }
          _this.setChartMeasureAttributes(_this._chart.MeasureAttributes, entitySetPath, measureType);
        }
        const measuresModel = new JSONModel(measures);
        measuresModel.$$valueAsPromise = true;
        return measuresModel.createBindingContext("/");
      };
      _this.setCustomAggMeasure = (measures, measure, customAggMeasure, key) => {
        if (key.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Measure: ${key} from an association cannot be used`);
        }
        measure.key = customAggMeasure.value;
        measure.role = "axis1";
        measure.label = customAggMeasure.label;
        measure.propertyPath = customAggMeasure.value;
        measures.push(measure);
        return measures;
      };
      _this.setTransAggMeasure = (measures, measure, transAggregations, key) => {
        const transAggMeasure = transAggregations[key];
        measure.key = transAggMeasure.name;
        measure.role = "axis1";
        measure.propertyPath = key;
        measure.aggregationMethod = transAggMeasure.aggregationMethod;
        measure.label = transAggMeasure.label || measure.label;
        measures.push(measure);
        return measures;
      };
      _this.getDynamicMeasures = (measures, chartDynamicMeasure, entitySetPath, chart) => {
        var _chartDynamicMeasure$;
        const key = chartDynamicMeasure.value || "";
        const aggregatedProperty = getInvolvedDataModelObjects(_this.metaPath.getModel().createBindingContext(entitySetPath + key), _this.contextPath).targetObject;
        if (key.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Measure: ${key} from an association cannot be used`);
          // check if the annotation path is wrong
        } else if (!aggregatedProperty) {
          throw new Error(`Please provide the right AnnotationPath to the Dynamic Measure ${chartDynamicMeasure.value}`);
          // check if the path starts with @
        } else if (((_chartDynamicMeasure$ = chartDynamicMeasure.value) === null || _chartDynamicMeasure$ === void 0 ? void 0 : _chartDynamicMeasure$.startsWith(`@${"com.sap.vocabularies.Analytics.v1.AggregatedProperty"}`)) === null) {
          throw new Error(`Please provide the right AnnotationPath to the Dynamic Measure ${chartDynamicMeasure.value}`);
        } else {
          var _aggregatedProperty$a;
          // check if AggregatedProperty is defined in given DynamicMeasure
          const dynamicMeasure = {
            key: aggregatedProperty.Name,
            role: "axis1"
          };
          dynamicMeasure.propertyPath = aggregatedProperty.AggregatableProperty.value;
          dynamicMeasure.aggregationMethod = aggregatedProperty.AggregationMethod;
          dynamicMeasure.label = resolveBindingString(((_aggregatedProperty$a = aggregatedProperty.annotations.Common) === null || _aggregatedProperty$a === void 0 ? void 0 : _aggregatedProperty$a.Label) || getInvolvedDataModelObjects(_this.metaPath.getModel().createBindingContext(entitySetPath + dynamicMeasure.propertyPath + `@${"com.sap.vocabularies.Common.v1.Label"}`), _this.contextPath).targetObject);
          _this.setChartMeasureAttributes(chart.MeasureAttributes, entitySetPath, dynamicMeasure);
          measures.push(dynamicMeasure);
        }
        return measures;
      };
      _this.getCustomAggMeasure = (customAggregations, measure) => {
        if (measure.value && customAggregations[measure.value]) {
          var _customAggregations$m;
          measure.label = (_customAggregations$m = customAggregations[measure.value]) === null || _customAggregations$m === void 0 ? void 0 : _customAggregations$m.label;
          return measure;
        }
        return null;
      };
      _this.setChartMeasureAttributes = (measureAttributes, entitySetPath, measure) => {
        if (measureAttributes !== null && measureAttributes !== void 0 && measureAttributes.length) {
          for (const measureAttribute of measureAttributes) {
            _this._setChartMeasureAttribute(measureAttribute, entitySetPath, measure);
          }
        }
      };
      _this._setChartMeasureAttribute = (measureAttribute, entitySetPath, measure) => {
        var _measureAttribute$Dyn, _measureAttribute$Mea, _measureAttribute$Dat;
        const path = measureAttribute.DynamicMeasure ? measureAttribute === null || measureAttribute === void 0 ? void 0 : (_measureAttribute$Dyn = measureAttribute.DynamicMeasure) === null || _measureAttribute$Dyn === void 0 ? void 0 : _measureAttribute$Dyn.value : measureAttribute === null || measureAttribute === void 0 ? void 0 : (_measureAttribute$Mea = measureAttribute.Measure) === null || _measureAttribute$Mea === void 0 ? void 0 : _measureAttribute$Mea.value;
        const measureAttributeDataPoint = measureAttribute.DataPoint ? measureAttribute === null || measureAttribute === void 0 ? void 0 : (_measureAttribute$Dat = measureAttribute.DataPoint) === null || _measureAttribute$Dat === void 0 ? void 0 : _measureAttribute$Dat.value : null;
        const role = measureAttribute.Role;
        const dataPoint = measureAttributeDataPoint && getInvolvedDataModelObjects(_this.metaPath.getModel().createBindingContext(entitySetPath + measureAttributeDataPoint), _this.contextPath).targetObject;
        if (measure.key === path) {
          _this.setMeasureRole(measure, role);
          //still to add data point, but UI5 Chart API is missing
          _this.setMeasureDataPoint(measure, dataPoint);
        }
      };
      _this.setMeasureDataPoint = (measure, dataPoint) => {
        if (dataPoint && dataPoint.Value.$Path == measure.key) {
          measure.dataPoint = ChartHelper.formatJSONToString(_this.createDataPointProperty(dataPoint)) || "";
        }
      };
      _this.setMeasureRole = (measure, role) => {
        if (role) {
          const index = role.$EnumMember;
          measure.role = measureRole[index];
        }
      };
      _this.getDependents = chartContext => {
        if (_this._commandActions.length > 0) {
          return _this._commandActions.map(commandAction => {
            return _this.getActionCommand(commandAction, chartContext);
          });
        }
        return "";
      };
      _this.checkPersonalizationInChartProperties = oProps => {
        if (oProps.personalization) {
          if (oProps.personalization === "false") {
            _this.personalization = undefined;
          } else if (oProps.personalization === "true") {
            _this.personalization = Object.values(personalizationValues).join(",");
          } else if (_this.verifyValidPersonlization(oProps.personalization) === true) {
            _this.personalization = oProps.personalization;
          } else {
            _this.personalization = undefined;
          }
        }
      };
      _this.verifyValidPersonlization = personalization => {
        let valid = true;
        const splitArray = personalization.split(",");
        const acceptedValues = Object.values(personalizationValues);
        splitArray.forEach(arrayElement => {
          if (!acceptedValues.includes(arrayElement)) {
            valid = false;
          }
        });
        return valid;
      };
      _this.getVariantManagement = (oProps, oChartDefinition) => {
        let variantManagement = oProps.variantManagement ? oProps.variantManagement : oChartDefinition.variantManagement;
        variantManagement = _this.personalization === undefined ? "None" : variantManagement;
        return variantManagement;
      };
      _this.createVariantManagement = () => {
        const personalization = _this.personalization;
        if (personalization) {
          const variantManagement = _this.variantManagement;
          if (variantManagement === "Control") {
            return xml`
					<mdc:variant>
					<variant:VariantManagement
						id="${generate([_this.id, "VM"])}"
						for="${_this.id}"
						showSetAsDefault="${true}"
						select="${_this.variantSelected}"
						headerLevel="${_this.headerLevel}"
						save="${_this.variantSaved}"
					/>
					</mdc:variant>
			`;
          } else if (variantManagement === "None" || variantManagement === "Page") {
            return "";
          }
        } else if (!personalization) {
          Log.warning("Variant Management cannot be enabled when personalization is disabled");
        }
        return "";
      };
      _this.getPersistenceProvider = () => {
        if (_this.variantManagement === "None") {
          return xml`<p13n:PersistenceProvider id="${generate([_this.id, "PersistenceProvider"])}" for="${_this.id}"/>`;
        }
        return "";
      };
      _this.pushActionCommand = (actionContext, dataField, chartOperationAvailableMap, action) => {
        if (dataField) {
          const commandAction = {
            actionContext: actionContext,
            onExecuteAction: ChartHelper.getPressEventForDataFieldForActionButton(_this.id, dataField, chartOperationAvailableMap || ""),
            onExecuteIBN: CommonHelper.getPressHandlerForDataFieldForIBN(dataField, `\${internal>selectedContexts}`, false),
            onExecuteManifest: CommonHelper.buildActionWrapper(action, _assertThisInitialized(_this))
          };
          _this._commandActions.push(commandAction);
        }
      };
      _this.getActionCommand = (commandAction, chartContext) => {
        const action = commandAction.actionContext.getObject();
        const dataFieldContext = action.annotationPath && _this.contextPath.getModel().createBindingContext(action.annotationPath);
        const dataField = dataFieldContext && dataFieldContext.getObject();
        const dataFieldAction = _this.contextPath.getModel().createBindingContext(action.annotationPath + "/Action");
        const actionContext = CommonHelper.getActionContext(dataFieldAction);
        const isBoundPath = CommonHelper.getPathToBoundActionOverload(dataFieldAction);
        const isBound = _this.contextPath.getModel().createBindingContext(isBoundPath).getObject();
        const chartOperationAvailableMap = escapeXMLAttributeValue(ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
          context: chartContext
        }));
        const isActionEnabled = action.enabled ? action.enabled : ChartHelper.isDataFieldForActionButtonEnabled(isBound && isBound.$IsBound, dataField.Action, _this.contextPath, chartOperationAvailableMap || "", action.enableOnSelect || "");
        let isIBNEnabled;
        if (action.enabled) {
          isIBNEnabled = action.enabled;
        } else if (dataField.RequiresContext) {
          isIBNEnabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
        }
        const actionCommand = xml`<internalMacro:ActionCommand
		action="${action}"
		onExecuteAction="${commandAction.onExecuteAction}"
		onExecuteIBN="${commandAction.onExecuteIBN}"
		onExecuteManifest="${commandAction.onExecuteManifest}"
		isIBNEnabled="${isIBNEnabled}"
		isActionEnabled="${isActionEnabled}"
		visible="${_this.getVisible(dataFieldContext)}"
	/>`;
        if (action.type == "ForAction" && (!isBound || isBound.IsBound !== true || actionContext[`@${"Org.OData.Core.V1.OperationAvailable"}`] !== false)) {
          return actionCommand;
        } else if (action.type == "ForAction") {
          return "";
        } else {
          return actionCommand;
        }
      };
      _this.getItems = chartContext => {
        if (_this._chart) {
          const dimensions = [];
          const measures = [];
          if (_this._chart.Dimensions) {
            ChartHelper.formatDimensions(chartContext).getObject().forEach(dimension => {
              dimension.id = generate([_this.id, "dimension", dimension.key]);
              dimensions.push(_this.getItem({
                id: dimension.id,
                key: dimension.key,
                label: dimension.label,
                role: dimension.role
              }, "_fe_groupable_", "groupable"));
            });
          }
          if (_this.measures) {
            ChartHelper.formatMeasures(_this.measures).forEach(measure => {
              measure.id = generate([_this.id, "measure", measure.key]);
              measures.push(_this.getItem({
                id: measure.id,
                key: measure.key,
                label: measure.label,
                role: measure.role
              }, "_fe_aggregatable_", "aggregatable"));
            });
          }
          if (dimensions.length && measures.length) {
            return dimensions.concat(measures);
          }
        }
        return "";
      };
      _this.getItem = (item, prefix, type) => {
        return xml`<chart:Item
			id="${item.id}"
			name="${prefix + item.key}"
			type="${type}"
			label="${resolveBindingString(item.label, "string")}"
			role="${item.role}"
		/>`;
      };
      _this.getToolbarActions = (chartContext, isInsightsEnabled) => {
        var _this$chartDefinition;
        const actions = _this.getActions(chartContext);
        if ((_this$chartDefinition = _this.chartDefinition) !== null && _this$chartDefinition !== void 0 && _this$chartDefinition.onSegmentedButtonPressed) {
          actions.push(_this.getSegmentedButton());
        }
        if (isInsightsEnabled) {
          actions.push(_this.getStandardActions(isInsightsEnabled));
        }
        if (actions.length > 0) {
          return xml`<mdc:actions>${actions}</mdc:actions>`;
        }
        return "";
      };
      _this.getStandardActions = isInsightsEnabled => {
        if (isInsightsEnabled) {
          return xml`<mdcat:ActionToolbarAction visible="${isInsightsEnabled}">
				<Button
					text="{sap.fe.i18n>M_COMMON_INSIGHTS_CARD}"
					core:require="{API: 'sap/fe/macros/chart/ChartAPI'}"
					press="API.onAddCardToInsightsPressed($event)"
					visible="${isInsightsEnabled}"
					enabled="${isInsightsEnabled}"
				>
					<layoutData>
						<OverflowToolbarLayoutData priority="AlwaysOverflow" />
					</layoutData>
				</Button>
			</mdcat:ActionToolbarAction>`;
        }
      };
      _this.getActions = chartContext => {
        var _this$chartActions;
        let actions = (_this$chartActions = _this.chartActions) === null || _this$chartActions === void 0 ? void 0 : _this$chartActions.getObject();
        actions = _this.removeMenuItems(actions);
        return actions.map(action => {
          if (action.annotationPath) {
            // Load annotation based actions
            return _this.getAction(action, chartContext, false);
          } else if (action.hasOwnProperty("noWrap")) {
            // Load XML or manifest based actions / action groups
            return _this.getCustomActions(action, chartContext);
          }
        });
      };
      _this.removeMenuItems = actions => {
        // If action is already part of menu in action group, then it will
        // be removed from the main actions list
        for (const action of actions) {
          if (action.menu) {
            action.menu.forEach(item => {
              if (actions.indexOf(item) !== -1) {
                actions.splice(actions.indexOf(item), 1);
              }
            });
          }
        }
        return actions;
      };
      _this.getCustomActions = (action, chartContext) => {
        let actionEnabled = action.enabled;
        if ((action.requiresSelection ?? false) && action.enabled === "true") {
          actionEnabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
        }
        if (action.type === "Default") {
          // Load XML or manifest based toolbar actions
          return _this.getActionToolbarAction(action, {
            id: generate([_this.id, action.id]),
            unittestid: "DataFieldForActionButtonAction",
            label: action.text ? action.text : "",
            ariaHasPopup: undefined,
            press: action.press ? action.press : "",
            enabled: actionEnabled,
            visible: action.visible ? action.visible : false
          }, false);
        } else if (action.type === "Menu") {
          // Load action groups (Menu)
          return _this.getActionToolbarMenuAction({
            id: generate([_this.id, action.id]),
            text: action.text,
            visible: action.visible,
            enabled: actionEnabled,
            useDefaultActionOnly: DefaultActionHandler.getUseDefaultActionOnly(action),
            buttonMode: DefaultActionHandler.getButtonMode(action),
            defaultAction: undefined,
            actions: action
          }, chartContext);
        }
      };
      _this.getMenuItemFromMenu = (menuItemAction, chartContext) => {
        let pressHandler;
        if (menuItemAction.annotationPath) {
          //Annotation based action is passed as menu item for menu button
          return _this.getAction(menuItemAction, chartContext, true);
        }
        if (menuItemAction.command) {
          pressHandler = "cmd:" + menuItemAction.command;
        } else if (menuItemAction.noWrap ?? false) {
          pressHandler = menuItemAction.press;
        } else {
          pressHandler = CommonHelper.buildActionWrapper(menuItemAction, _assertThisInitialized(_this));
        }
        return xml`<MenuItem
		core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
		text="${menuItemAction.text}"
		press="${pressHandler}"
		visible="${menuItemAction.visible}"
		enabled="${menuItemAction.enabled}"
	/>`;
      };
      _this.getActionToolbarMenuAction = (props, chartContext) => {
        var _props$actions, _props$actions$menu;
        const aMenuItems = (_props$actions = props.actions) === null || _props$actions === void 0 ? void 0 : (_props$actions$menu = _props$actions.menu) === null || _props$actions$menu === void 0 ? void 0 : _props$actions$menu.map(action => {
          return _this.getMenuItemFromMenu(action, chartContext);
        });
        return xml`<mdcat:ActionToolbarAction>
			<MenuButton
			text="${props.text}"
			type="Transparent"
			menuPosition="BeginBottom"
			id="${props.id}"
			visible="${props.visible}"
			enabled="${props.enabled}"
			useDefaultActionOnly="${props.useDefaultActionOnly}"
			buttonMode="${props.buttonMode}"
			defaultAction="${props.defaultAction}"
			>
				<menu>
					<Menu>
						${aMenuItems}
					</Menu>
				</menu>
			</MenuButton>
		</mdcat:ActionToolbarAction>`;
      };
      _this.getAction = (action, chartContext, isMenuItem) => {
        const dataFieldContext = _this.contextPath.getModel().createBindingContext(action.annotationPath || "");
        if (action.type === "ForNavigation") {
          return _this.getNavigationActions(action, dataFieldContext, isMenuItem);
        } else if (action.type === "ForAction") {
          return _this.getAnnotationActions(chartContext, action, dataFieldContext, isMenuItem);
        }
        return "";
      };
      _this.getNavigationActions = (action, dataFieldContext, isMenuItem) => {
        let enabled = "true";
        const dataField = dataFieldContext.getObject();
        if (action.enabled !== undefined) {
          enabled = action.enabled;
        } else if (dataField.RequiresContext) {
          enabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
        }
        return _this.getActionToolbarAction(action, {
          id: undefined,
          unittestid: "DataFieldForIntentBasedNavigationButtonAction",
          label: dataField.Label,
          ariaHasPopup: undefined,
          press: CommonHelper.getPressHandlerForDataFieldForIBN(dataField, `\${internal>selectedContexts}`, false),
          enabled: enabled,
          visible: _this.getVisible(dataFieldContext)
        }, isMenuItem);
      };
      _this.getAnnotationActions = (chartContext, action, dataFieldContext, isMenuItem) => {
        const dataFieldAction = _this.contextPath.getModel().createBindingContext(action.annotationPath + "/Action");
        const actionContext = _this.contextPath.getModel().createBindingContext(CommonHelper.getActionContext(dataFieldAction));
        const actionObject = actionContext.getObject();
        const isBoundPath = CommonHelper.getPathToBoundActionOverload(dataFieldAction);
        const isBound = _this.contextPath.getModel().createBindingContext(isBoundPath).getObject();
        const dataField = dataFieldContext.getObject();
        if (!isBound || isBound.$IsBound !== true || actionObject[`@${"Org.OData.Core.V1.OperationAvailable"}`] !== false) {
          const enabled = _this.getAnnotationActionsEnabled(action, isBound, dataField, chartContext);
          const dataFieldModelObjectPath = getInvolvedDataModelObjects(_this.contextPath.getModel().createBindingContext(action.annotationPath));
          const ariaHasPopup = isDataModelObjectPathForActionWithDialog(dataFieldModelObjectPath);
          const chartOperationAvailableMap = escapeXMLAttributeValue(ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
            context: chartContext
          })) || "";
          return _this.getActionToolbarAction(action, {
            id: generate([_this.id, getInvolvedDataModelObjects(dataFieldContext)]),
            unittestid: "DataFieldForActionButtonAction",
            label: dataField.Label,
            ariaHasPopup: ariaHasPopup,
            press: ChartHelper.getPressEventForDataFieldForActionButton(_this.id, dataField, chartOperationAvailableMap),
            enabled: enabled,
            visible: _this.getVisible(dataFieldContext)
          }, isMenuItem);
        }
        return "";
      };
      _this.getActionToolbarAction = (action, toolbarAction, isMenuItem) => {
        if (isMenuItem) {
          return xml`
			<MenuItem
				text="${toolbarAction.label}"
				press="${action.command ? "cmd:" + action.command : toolbarAction.press}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>`;
        } else {
          return _this.buildAction(action, toolbarAction);
        }
      };
      _this.buildAction = (action, toolbarAction) => {
        let actionPress = "";
        if (action.hasOwnProperty("noWrap")) {
          if (action.command) {
            actionPress = "cmd:" + action.command;
          } else if (action.noWrap === true) {
            actionPress = toolbarAction.press;
          } else if (!action.annotationPath) {
            actionPress = CommonHelper.buildActionWrapper(action, _assertThisInitialized(_this));
          }
          return xml`<mdcat:ActionToolbarAction>
			<Button
				core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
				unittest:id="${toolbarAction.unittestid}"
				id="${toolbarAction.id}"
				text="${toolbarAction.label}"
				ariaHasPopup="${toolbarAction.ariaHasPopup}"
				press="${actionPress}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>
		   </mdcat:ActionToolbarAction>`;
        } else {
          return xml`<mdcat:ActionToolbarAction>
			<Button
				unittest:id="${toolbarAction.unittestid}"
				id="${toolbarAction.id}"
				text="${toolbarAction.label}"
				ariaHasPopup="${toolbarAction.ariaHasPopup}"
				press="${action.command ? "cmd:" + action.command : toolbarAction.press}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>
		</mdcat:ActionToolbarAction>`;
        }
      };
      _this.getAnnotationActionsEnabled = (action, isBound, dataField, chartContext) => {
        return action.enabled !== undefined ? action.enabled : ChartHelper.isDataFieldForActionButtonEnabled(isBound && isBound.$IsBound, dataField.Action, _this.contextPath, ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
          context: chartContext
        }), action.enableOnSelect || "");
      };
      _this.getSegmentedButton = () => {
        return xml`<mdcat:ActionToolbarAction layoutInformation="{
			aggregationName: 'end',
			alignment: 'End'
		}">
			<SegmentedButton
				id="${generate([_this.id, "SegmentedButton", "TemplateContentView"])}"
				select="${_this.chartDefinition.onSegmentedButtonPressed}"
				visible="{= \${pageInternal>alpContentView} !== 'Table' }"
				selectedKey="{pageInternal>alpContentView}"
			>
				<items>
					${_this.getSegmentedButtonItems()}
				</items>
			</SegmentedButton>
		</mdcat:ActionToolbarAction>`;
      };
      _this.getSegmentedButtonItems = () => {
        const segmentedButtonItems = [];
        if (CommonHelper.isDesktop()) {
          segmentedButtonItems.push(_this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_HYBRID_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Hybrid", "sap-icon://chart-table-view"));
        }
        segmentedButtonItems.push(_this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_CHART_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Chart", "sap-icon://bar-chart"));
        segmentedButtonItems.push(_this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_TABLE_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Table", "sap-icon://table-view"));
        return segmentedButtonItems;
      };
      _this.getSegmentedButtonItem = (tooltip, key, icon) => {
        return xml`<SegmentedButtonItem
			tooltip="${tooltip}"
			key="${key}"
			icon="${icon}"
		/>`;
      };
      _this.getVisible = dataFieldContext => {
        const dataField = dataFieldContext.getObject();
        if (dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`] && dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`].$Path) {
          const hiddenPathContext = _this.contextPath.getModel().createBindingContext(dataFieldContext.getPath() + `/@${"com.sap.vocabularies.UI.v1.Hidden"}/$Path`, dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`].$Path);
          return ChartHelper.getHiddenPathExpressionForTableActionsAndIBN(dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`].$Path, {
            context: hiddenPathContext
          });
        } else if (dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`]) {
          return !dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`];
        } else {
          return true;
        }
      };
      _this.getContextPath = () => {
        return _this.contextPath.getPath().lastIndexOf("/") === _this.contextPath.getPath().length - 1 ? _this.contextPath.getPath().replaceAll("/", "") : _this.contextPath.getPath().split("/")[_this.contextPath.getPath().split("/").length - 1];
      };
      const _contextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
      const initialConverterContext = _this.getConverterContext(_contextObjectPath, /*this.contextPath*/undefined, _settings);
      const _visualizationPath = ChartBlock.getVisualizationPath(_assertThisInitialized(_this), _contextObjectPath, initialConverterContext);
      const extraParams = ChartBlock.getExtraParams(_assertThisInitialized(_this), _visualizationPath);
      const _converterContext = _this.getConverterContext(_contextObjectPath, /*this.contextPath*/undefined, _settings, extraParams);
      const _aggregationHelper = new AggregationHelper(_converterContext.getEntityType(), _converterContext, true); // passing the last parameter as true to consider the old annotations i.e. Aggregation.Aggregatable for backward compatibility in case of chart
      _this._chartContext = ChartHelper.getUiChart(_this.metaPath);
      _this._chart = _this._chartContext.getObject();
      if (_this._applyIdToContent ?? false) {
        _this._apiId = _this.id + "::Chart";
        _this._contentId = _this.id;
      } else {
        _this._apiId = _this.id;
        _this._contentId = _this.getContentId(_this.id);
      }
      if (_this._chart) {
        var _this$chartDefinition2, _contextObjectPath$co, _this$chartDefinition5, _this$chartDefinition6, _this$chartDefinition7, _this$chartDefinition8, _this$chartDefinition9;
        _this.chartDefinition = _this.chartDefinition === undefined || _this.chartDefinition === null ? _this.createChartDefinition(_converterContext, _contextObjectPath, _this._chartContext.getPath()) : _this.chartDefinition;
        // API Properties
        _this.navigationPath = _this.chartDefinition.navigationPath;
        _this.autoBindOnInit = _this.chartDefinition.autoBindOnInit;
        _this.vizProperties = _this.chartDefinition.vizProperties;
        _this.chartActions = _this.createBindingContext(_this.chartDefinition.actions, _settings);
        _this.selectionMode = _this.selectionMode.toUpperCase();
        if (_this.filterBar) {
          _this.filter = _this.getContentId(_this.filterBar);
        } else if (!_this.filter) {
          _this.filter = _this.chartDefinition.filterId;
        }
        _this.checkPersonalizationInChartProperties(_assertThisInitialized(_this));
        _this.variantManagement = _this.getVariantManagement(_assertThisInitialized(_this), _this.chartDefinition);
        _this.visible = _this.chartDefinition.visible;
        let contextPath = _this.contextPath.getPath();
        contextPath = contextPath[contextPath.length - 1] === "/" ? contextPath.slice(0, -1) : contextPath;
        _this.draftSupported = ModelHelper.isDraftSupported(_settings.models.metaModel, contextPath);
        _this._chartType = ChartHelper.formatChartType(_this._chart.ChartType);
        const operationAvailableMap = ChartHelper.getOperationAvailableMap(_this._chart, {
          context: _this._chartContext
        });
        if (Object.keys((_this$chartDefinition2 = _this.chartDefinition) === null || _this$chartDefinition2 === void 0 ? void 0 : _this$chartDefinition2.commandActions).length > 0) {
          var _this$chartDefinition3;
          Object.keys((_this$chartDefinition3 = _this.chartDefinition) === null || _this$chartDefinition3 === void 0 ? void 0 : _this$chartDefinition3.commandActions).forEach(key => {
            var _this$chartDefinition4;
            const action = (_this$chartDefinition4 = _this.chartDefinition) === null || _this$chartDefinition4 === void 0 ? void 0 : _this$chartDefinition4.commandActions[key];
            const actionContext = _this.createBindingContext(action, _settings);
            const dataFieldContext = action.annotationPath && _this.contextPath.getModel().createBindingContext(action.annotationPath);
            const dataField = dataFieldContext && dataFieldContext.getObject();
            const chartOperationAvailableMap = escapeXMLAttributeValue(operationAvailableMap);
            _this.pushActionCommand(actionContext, dataField, chartOperationAvailableMap, action);
          });
        }
        _this.measures = _this.getChartMeasures(_assertThisInitialized(_this), _aggregationHelper);
        const presentationPath = CommonHelper.createPresentationPathContext(_this.metaPath);
        _this._sortCondtions = ChartHelper.getSortConditions(_this.metaPath, _this.metaPath.getObject(), presentationPath.getPath(), _this.chartDefinition.applySupported);
        const chartActionsContext = _this.contextPath.getModel().createBindingContext(_this._chartContext.getPath() + "/Actions", _this._chart.Actions);
        const contextPathContext = _this.contextPath.getModel().createBindingContext(_this.contextPath.getPath(), _this.contextPath);
        const contextPathPath = CommonHelper.getContextPath(_this.contextPath, {
          context: contextPathContext
        });
        const targetCollectionPath = CommonHelper.getTargetCollectionPath(_this.contextPath);
        const targetCollectionPathContext = _this.contextPath.getModel().createBindingContext(targetCollectionPath, _this.contextPath);
        const actionsObject = (_contextObjectPath$co = _contextObjectPath.convertedTypes.resolvePath(chartActionsContext.getPath())) === null || _contextObjectPath$co === void 0 ? void 0 : _contextObjectPath$co.target;
        _this._customData = {
          targetCollectionPath: contextPathPath,
          entitySet: typeof targetCollectionPathContext.getObject() === "string" ? targetCollectionPathContext.getObject() : targetCollectionPathContext.getObject("@sapui.name"),
          entityType: contextPathPath + "/",
          operationAvailableMap: CommonHelper.stringifyCustomData(JSON.parse(operationAvailableMap)),
          multiSelectDisabledActions: ActionHelper.getMultiSelectDisabledActions(actionsObject) + "",
          segmentedButtonId: generate([_this.id, "SegmentedButton", "TemplateContentView"]),
          customAgg: CommonHelper.stringifyCustomData((_this$chartDefinition5 = _this.chartDefinition) === null || _this$chartDefinition5 === void 0 ? void 0 : _this$chartDefinition5.customAgg),
          transAgg: CommonHelper.stringifyCustomData((_this$chartDefinition6 = _this.chartDefinition) === null || _this$chartDefinition6 === void 0 ? void 0 : _this$chartDefinition6.transAgg),
          applySupported: CommonHelper.stringifyCustomData((_this$chartDefinition7 = _this.chartDefinition) === null || _this$chartDefinition7 === void 0 ? void 0 : _this$chartDefinition7.applySupported),
          vizProperties: _this.vizProperties,
          draftSupported: _this.draftSupported,
          multiViews: (_this$chartDefinition8 = _this.chartDefinition) === null || _this$chartDefinition8 === void 0 ? void 0 : _this$chartDefinition8.multiViews,
          selectionPresentationVariantPath: CommonHelper.stringifyCustomData({
            data: (_this$chartDefinition9 = _this.chartDefinition) === null || _this$chartDefinition9 === void 0 ? void 0 : _this$chartDefinition9.selectionPresentationVariantPath
          })
        };
        _this._actions = _this.chartActions ? _this.getToolbarActions(_this._chartContext, _this.chartDefinition.isInsightsEnabled ?? false) : "";
      } else {
        // fallback to display empty chart
        _this.autoBindOnInit = false;
        _this.visible = "true";
        _this.navigationPath = "";
        _this._actions = "";
        _this._customData = {
          targetCollectionPath: "",
          entitySet: "",
          entityType: "",
          operationAvailableMap: "",
          multiSelectDisabledActions: "",
          segmentedButtonId: "",
          customAgg: "",
          transAgg: "",
          applySupported: "",
          vizProperties: ""
        };
      }
      return _this;
    }
    _exports = ChartBlock;
    var _proto = ChartBlock.prototype;
    _proto.getContentId = function getContentId(macroId) {
      return `${macroId}-content`;
    };
    ChartBlock.getExtraParams = function getExtraParams(props, visualizationPath) {
      const extraParams = {};
      if (props.actions) {
        var _Object$values;
        (_Object$values = Object.values(props.actions)) === null || _Object$values === void 0 ? void 0 : _Object$values.forEach(item => {
          props.actions = {
            ...props.actions,
            ...item.menuContentActions
          };
          delete item.menuContentActions;
        });
      }
      if (visualizationPath) {
        extraParams[visualizationPath] = {
          actions: props.actions
        };
      }
      return extraParams;
    };
    /**
     * Format the data point as a JSON object.
     *
     * @param oDataPointAnno
     * @returns The formatted json object
     */
    _proto.createDataPointProperty = function createDataPointProperty(oDataPointAnno) {
      const oDataPoint = {};
      if (oDataPointAnno.TargetValue) {
        oDataPoint.targetValue = oDataPointAnno.TargetValue.$Path;
      }
      if (oDataPointAnno.ForeCastValue) {
        oDataPoint.foreCastValue = oDataPointAnno.ForeCastValue.$Path;
      }
      let oCriticality = null;
      if (oDataPointAnno.Criticality) {
        if (oDataPointAnno.Criticality.$Path) {
          //will be an aggregated property or custom aggregate
          oCriticality = {
            Calculated: oDataPointAnno.Criticality.$Path
          };
        } else {
          oCriticality = {
            Static: oDataPointAnno.Criticality.$EnumMember.replace("com.sap.vocabularies.UI.v1.CriticalityType/", "")
          };
        }
      } else if (oDataPointAnno.CriticalityCalculation) {
        const oThresholds = {};
        const bConstant = this.buildThresholds(oThresholds, oDataPointAnno.CriticalityCalculation);
        if (bConstant) {
          oCriticality = {
            ConstantThresholds: oThresholds
          };
        } else {
          oCriticality = {
            DynamicThresholds: oThresholds
          };
        }
      }
      if (oCriticality) {
        oDataPoint.criticality = oCriticality;
      }
      return oDataPoint;
    }

    /**
     * Checks whether the thresholds are dynamic or constant.
     *
     * @param oThresholds The threshold skeleton
     * @param oCriticalityCalculation The UI.DataPoint.CriticalityCalculation annotation
     * @returns `true` if the threshold should be supplied as ConstantThresholds, <code>false</code> if the threshold should
     * be supplied as DynamicThresholds
     * @private
     */;
    _proto.buildThresholds = function buildThresholds(oThresholds, oCriticalityCalculation) {
      const aKeys = ["AcceptanceRangeLowValue", "AcceptanceRangeHighValue", "ToleranceRangeLowValue", "ToleranceRangeHighValue", "DeviationRangeLowValue", "DeviationRangeHighValue"];
      let bConstant = true,
        sKey,
        i,
        j;
      oThresholds.ImprovementDirection = oCriticalityCalculation.ImprovementDirection.$EnumMember.replace("com.sap.vocabularies.UI.v1.ImprovementDirectionType/", "");
      const oDynamicThresholds = {
        oneSupplied: false,
        usedMeasures: []
        // combination to check whether at least one is supplied
      };

      const oConstantThresholds = {
        oneSupplied: false
        // combination to check whether at least one is supplied
      };

      for (i = 0; i < aKeys.length; i++) {
        sKey = aKeys[i];
        oDynamicThresholds[sKey] = oCriticalityCalculation[sKey] ? oCriticalityCalculation[sKey].$Path : undefined;
        oDynamicThresholds.oneSupplied = oDynamicThresholds.oneSupplied || oDynamicThresholds[sKey];
        if (!oDynamicThresholds.oneSupplied) {
          // only consider in case no dynamic threshold is supplied
          oConstantThresholds[sKey] = oCriticalityCalculation[sKey];
          oConstantThresholds.oneSupplied = oConstantThresholds.oneSupplied || oConstantThresholds[sKey];
        } else if (oDynamicThresholds[sKey]) {
          oDynamicThresholds.usedMeasures.push(oDynamicThresholds[sKey]);
        }
      }

      // dynamic definition shall overrule constant definition
      if (oDynamicThresholds.oneSupplied) {
        bConstant = false;
        for (i = 0; i < aKeys.length; i++) {
          if (oDynamicThresholds[aKeys[i]]) {
            oThresholds[aKeys[i]] = oDynamicThresholds[aKeys[i]];
          }
        }
        oThresholds.usedMeasures = oDynamicThresholds.usedMeasures;
      } else {
        let oAggregationLevel;
        oThresholds.AggregationLevels = [];

        // check if at least one static value is supplied
        if (oConstantThresholds.oneSupplied) {
          // add one entry in the aggregation level
          oAggregationLevel = {
            VisibleDimensions: null
          };
          for (i = 0; i < aKeys.length; i++) {
            if (oConstantThresholds[aKeys[i]]) {
              oAggregationLevel[aKeys[i]] = oConstantThresholds[aKeys[i]];
            }
          }
          oThresholds.AggregationLevels.push(oAggregationLevel);
        }

        // further check for ConstantThresholds
        if (oCriticalityCalculation.ConstantThresholds && oCriticalityCalculation.ConstantThresholds.length > 0) {
          for (i = 0; i < oCriticalityCalculation.ConstantThresholds.length; i++) {
            const oAggregationLevelInfo = oCriticalityCalculation.ConstantThresholds[i];
            const aVisibleDimensions = oAggregationLevelInfo.AggregationLevel ? [] : null;
            if (oAggregationLevelInfo.AggregationLevel && oAggregationLevelInfo.AggregationLevel.length > 0) {
              for (j = 0; j < oAggregationLevelInfo.AggregationLevel.length; j++) {
                aVisibleDimensions.push(oAggregationLevelInfo.AggregationLevel[j].$PropertyPath);
              }
            }
            oAggregationLevel = {
              VisibleDimensions: aVisibleDimensions
            };
            for (j = 0; j < aKeys.length; j++) {
              const nValue = oAggregationLevelInfo[aKeys[j]];
              if (nValue) {
                oAggregationLevel[aKeys[j]] = nValue;
              }
            }
            oThresholds.AggregationLevels.push(oAggregationLevel);
          }
        }
      }
      return bConstant;
    };
    _proto.getTemplate = function getTemplate() {
      let chartdelegate = "";
      if (this._customData.targetCollectionPath === "") {
        this.noDataText = this.getTranslatedText("M_CHART_NO_ANNOTATION_SET_TEXT");
      }
      if (this.chartDelegate) {
        chartdelegate = this.chartDelegate;
      } else {
        const contextPath = this.getContextPath();
        chartdelegate = "{name:'sap/fe/macros/chart/ChartDelegate', payload: {collectionName: '" + contextPath + "', contextPath: '" + contextPath + "', parameters:{$$groupId:'$auto.Workers'}, selectionMode: '" + this.selectionMode + "'}}";
      }
      const binding = "{internal>controls/" + this.id + "}";
      if (!this.header) {
        var _this$_chart, _this$_chart$Title;
        this.header = (_this$_chart = this._chart) === null || _this$_chart === void 0 ? void 0 : (_this$_chart$Title = _this$_chart.Title) === null || _this$_chart$Title === void 0 ? void 0 : _this$_chart$Title.toString();
      }
      return xml`
			<macro:ChartAPI xmlns="sap.m" xmlns:macro="sap.fe.macros.chart" xmlns:variant="sap.ui.fl.variants" xmlns:p13n="sap.ui.mdc.p13n" xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1" xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1" xmlns:internalMacro="sap.fe.macros.internal" xmlns:chart="sap.ui.mdc.chart" xmlns:mdc="sap.ui.mdc" xmlns:mdcat="sap.ui.mdc.actiontoolbar" xmlns:core="sap.ui.core" id="${this._apiId}" selectionChange="${this.selectionChange}" stateChange="${this.stateChange}">
				<macro:layoutData>
					<FlexItemData growFactor="1" shrinkFactor="1" />
				</macro:layoutData>
				<mdc:Chart
					binding="${binding}"
					unittest:id="ChartMacroFragment"
					id="${this._contentId}"
					chartType="${this._chartType}"
					sortConditions="${this._sortCondtions}"
					header="${this.header}"
					headerVisible="${this.headerVisible}"
					height="${this.height}"
					width="${this.width}"
					headerLevel="${this.headerLevel}"
					p13nMode="${this.personalization}"
					filter="${this.filter}"
					noDataText="${this.noDataText}"
					autoBindOnInit="${this.autoBindOnInit}"
					delegate="${chartdelegate}"
					macrodata:targetCollectionPath="${this._customData.targetCollectionPath}"
					macrodata:entitySet="${this._customData.entitySet}"
					macrodata:entityType="${this._customData.entityType}"
					macrodata:operationAvailableMap="${this._customData.operationAvailableMap}"
					macrodata:multiSelectDisabledActions="${this._customData.multiSelectDisabledActions}"
					macrodata:segmentedButtonId="${this._customData.segmentedButtonId}"
					macrodata:customAgg="${this._customData.customAgg}"
					macrodata:transAgg="${this._customData.transAgg}"
					macrodata:applySupported="${this._customData.applySupported}"
					macrodata:vizProperties="${this._customData.vizProperties}"
					macrodata:draftSupported="${this._customData.draftSupported}"
					macrodata:multiViews="${this._customData.multiViews}"
					macrodata:selectionPresentationVariantPath="${this._customData.selectionPresentationVariantPath}"
					visible="${this.visible}"
				>
				<mdc:dependents>
					${this.getDependents(this._chartContext)}
					${this.getPersistenceProvider()}
				</mdc:dependents>
				<mdc:items>
					${this.getItems(this._chartContext)}
				</mdc:items>
				${this._actions}
				${this.createVariantManagement()}
			</mdc:Chart>
		</macro:ChartAPI>`;
    };
    return ChartBlock;
  }(BuildingBlockBase), _class3.checkChartVisualizationPath = (visualizations, visualizationPath) => {
    visualizations.forEach(function (visualization) {
      if (visualization.$AnnotationPath.indexOf(`@${"com.sap.vocabularies.UI.v1.Chart"}`) > -1) {
        visualizationPath = visualization.$AnnotationPath;
      }
    });
    return visualizationPath;
  }, _class3.getVisualizationPath = (props, contextObjectPath, converterContext) => {
    var _contextObjectPath$ta;
    const metaPath = getContextRelativeTargetObjectPath(contextObjectPath);

    // fallback to default Chart if metapath is not set
    if (!metaPath) {
      Log.error(`Missing metapath parameter for Chart`);
      return `@${"com.sap.vocabularies.UI.v1.Chart"}`;
    }
    if (contextObjectPath.targetObject.term === "com.sap.vocabularies.UI.v1.Chart") {
      return metaPath; // MetaPath is already pointing to a Chart
    }

    //Need to switch to the context related the PV or SPV
    const resolvedTarget = converterContext.getEntityTypeAnnotation(metaPath);
    let visualizations = [];
    switch ((_contextObjectPath$ta = contextObjectPath.targetObject) === null || _contextObjectPath$ta === void 0 ? void 0 : _contextObjectPath$ta.term) {
      case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
        if (contextObjectPath.targetObject.PresentationVariant) {
          visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject.PresentationVariant, metaPath, resolvedTarget.converterContext, true);
        }
        break;
      case "com.sap.vocabularies.UI.v1.PresentationVariant":
        visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject, metaPath, resolvedTarget.converterContext, true);
        break;
    }
    const chartViz = visualizations.find(viz => {
      return viz.visualization.term === "com.sap.vocabularies.UI.v1.Chart";
    });
    if (chartViz) {
      return chartViz.annotationPath;
    } else {
      // fallback to default Chart if annotation missing in PV
      Log.error(`Bad metapath parameter for chart: ${contextObjectPath.targetObject.term}`);
      return `@${"com.sap.vocabularies.UI.v1.Chart"}`;
    }
  }, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "chartDefinition", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "height", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "100%";
    }
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "100%";
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "header", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "headerVisible", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "headerLevel", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return TitleLevel.Auto;
    }
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "selectionMode", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "MULTIPLE";
    }
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "personalization", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "noDataText", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "chartDelegate", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "vizProperties", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "chartActions", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "draftSupported", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "autoBindOnInit", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "navigationPath", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "filter", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "measures", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "_applyIdToContent", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "variantSelected", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "variantSaved", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "selectionChange", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec30], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ChartBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZWFzdXJlUm9sZSIsInBlcnNvbmFsaXphdGlvblZhbHVlcyIsInNldEN1c3RvbUFjdGlvblByb3BlcnRpZXMiLCJjaGlsZEFjdGlvbiIsIm1lbnVDb250ZW50QWN0aW9ucyIsImFjdGlvbiIsIm1lbnVBY3Rpb25zIiwiYWN0aW9uS2V5IiwiZ2V0QXR0cmlidXRlIiwicmVwbGFjZSIsImNoaWxkcmVuIiwibGVuZ3RoIiwibG9jYWxOYW1lIiwibmFtZXNwYWNlVVJJIiwiaW5kZXhPZiIsImFjdGlvbnNUb0FkZCIsIkFycmF5IiwicHJvdG90eXBlIiwic2xpY2UiLCJhcHBseSIsImFjdGlvbklkeCIsInJlZHVjZSIsImN1c3RvbUFjdGlvbiIsImFjdFRvQWRkIiwiYWN0aW9uS2V5QWRkIiwiY3VyT3V0T2JqZWN0Iiwia2V5IiwidGV4dCIsIl9fbm9XcmFwIiwicHJlc3MiLCJyZXF1aXJlc1NlbGVjdGlvbiIsImVuYWJsZWQiLCJPYmplY3QiLCJ2YWx1ZXMiLCJtYXAiLCJtZW51SXRlbSIsInBvc2l0aW9uIiwicGxhY2VtZW50IiwiYW5jaG9yIiwibWVudSIsIkNoYXJ0QmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsInJldHVyblR5cGVzIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiaXNQdWJsaWMiLCJibG9ja0V2ZW50IiwiYmxvY2tBZ2dyZWdhdGlvbiIsInByb2Nlc3NBZ2dyZWdhdGlvbnMiLCJwcm9wcyIsImNvbmZpZ3VyYXRpb24iLCJzZXR0aW5ncyIsIl9jb21tYW5kQWN0aW9ucyIsImNyZWF0ZUNoYXJ0RGVmaW5pdGlvbiIsImNvbnZlcnRlckNvbnRleHQiLCJjb250ZXh0T2JqZWN0UGF0aCIsImNvbnRyb2xQYXRoIiwidmlzdWFsaXphdGlvblBhdGgiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwibWV0YVBhdGgiLCJnZXRPYmplY3QiLCIkVHlwZSIsInZpc3VhbGl6YXRpb25zIiwiVmlzdWFsaXphdGlvbnMiLCJjaGVja0NoYXJ0VmlzdWFsaXphdGlvblBhdGgiLCJ2aXN1YWxpemF0aW9uRGVmaW5pdGlvbiIsImdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbiIsInVzZUNvbmRlbnNlZExheW91dCIsInVuZGVmaW5lZCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiZGF0YSIsImNvbnRleHRQYXRoIiwidWlkIiwibW9kZWxzIiwic2V0UHJvcGVydHkiLCJnZXRDaGFydE1lYXN1cmVzIiwiYWdncmVnYXRpb25IZWxwZXIiLCJjaGFydEFubm90YXRpb25QYXRoIiwiY2hhcnREZWZpbml0aW9uIiwiYW5ub3RhdGlvblBhdGgiLCJzcGxpdCIsImZpbHRlciIsIml0ZW0iLCJwb3MiLCJ0b1N0cmluZyIsInJlcGxhY2VBbGwiLCJvQ2hhcnQiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJnZXRNb2RlbCIsInRhcmdldE9iamVjdCIsImFnZ3JlZ2F0ZWRQcm9wZXJ0eSIsImdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzIiwibWVhc3VyZXMiLCJhbm5vUGF0aCIsImdldFBhdGgiLCJhZ2dyZWdhdGVkUHJvcGVydGllcyIsImNoYXJ0TWVhc3VyZXMiLCJNZWFzdXJlcyIsImNoYXJ0RHluYW1pY01lYXN1cmVzIiwiRHluYW1pY01lYXN1cmVzIiwidHJhbnNBZ2dJbk1lYXN1cmVzIiwicHJvcGVydGllcyIsInNvbWUiLCJwcm9wZXJ0eU1lYXN1cmVUeXBlIiwiTmFtZSIsInZhbHVlIiwiZW50aXR5U2V0UGF0aCIsInRyYW5zQWdncmVnYXRpb25zIiwidHJhbnNBZ2ciLCJjdXN0b21BZ2dyZWdhdGlvbnMiLCJjdXN0b21BZ2ciLCJMb2ciLCJ3YXJuaW5nIiwiaXNDdXN0b21BZ2dyZWdhdGVJc01lYXN1cmUiLCJvQ2hhcnRNZWFzdXJlIiwib0N1c3RvbUFnZ01lYXN1cmUiLCJnZXRDdXN0b21BZ2dNZWFzdXJlIiwiRXJyb3IiLCJkeW5hbWljTWVhc3VyZSIsImdldER5bmFtaWNNZWFzdXJlcyIsImNoYXJ0TWVhc3VyZSIsImN1c3RvbUFnZ01lYXN1cmUiLCJtZWFzdXJlVHlwZSIsInNldEN1c3RvbUFnZ01lYXN1cmUiLCJzZXRUcmFuc0FnZ01lYXN1cmUiLCJzZXRDaGFydE1lYXN1cmVBdHRyaWJ1dGVzIiwiX2NoYXJ0IiwiTWVhc3VyZUF0dHJpYnV0ZXMiLCJtZWFzdXJlc01vZGVsIiwiSlNPTk1vZGVsIiwiJCR2YWx1ZUFzUHJvbWlzZSIsIm1lYXN1cmUiLCJlcnJvciIsInJvbGUiLCJsYWJlbCIsInByb3BlcnR5UGF0aCIsInB1c2giLCJ0cmFuc0FnZ01lYXN1cmUiLCJhZ2dyZWdhdGlvbk1ldGhvZCIsImNoYXJ0RHluYW1pY01lYXN1cmUiLCJjaGFydCIsInN0YXJ0c1dpdGgiLCJBZ2dyZWdhdGFibGVQcm9wZXJ0eSIsIkFnZ3JlZ2F0aW9uTWV0aG9kIiwicmVzb2x2ZUJpbmRpbmdTdHJpbmciLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIkxhYmVsIiwibWVhc3VyZUF0dHJpYnV0ZXMiLCJtZWFzdXJlQXR0cmlidXRlIiwiX3NldENoYXJ0TWVhc3VyZUF0dHJpYnV0ZSIsInBhdGgiLCJEeW5hbWljTWVhc3VyZSIsIk1lYXN1cmUiLCJtZWFzdXJlQXR0cmlidXRlRGF0YVBvaW50IiwiRGF0YVBvaW50IiwiUm9sZSIsImRhdGFQb2ludCIsInNldE1lYXN1cmVSb2xlIiwic2V0TWVhc3VyZURhdGFQb2ludCIsIlZhbHVlIiwiJFBhdGgiLCJDaGFydEhlbHBlciIsImZvcm1hdEpTT05Ub1N0cmluZyIsImNyZWF0ZURhdGFQb2ludFByb3BlcnR5IiwiaW5kZXgiLCIkRW51bU1lbWJlciIsImdldERlcGVuZGVudHMiLCJjaGFydENvbnRleHQiLCJjb21tYW5kQWN0aW9uIiwiZ2V0QWN0aW9uQ29tbWFuZCIsImNoZWNrUGVyc29uYWxpemF0aW9uSW5DaGFydFByb3BlcnRpZXMiLCJvUHJvcHMiLCJwZXJzb25hbGl6YXRpb24iLCJqb2luIiwidmVyaWZ5VmFsaWRQZXJzb25saXphdGlvbiIsInZhbGlkIiwic3BsaXRBcnJheSIsImFjY2VwdGVkVmFsdWVzIiwiZm9yRWFjaCIsImFycmF5RWxlbWVudCIsImluY2x1ZGVzIiwiZ2V0VmFyaWFudE1hbmFnZW1lbnQiLCJvQ2hhcnREZWZpbml0aW9uIiwidmFyaWFudE1hbmFnZW1lbnQiLCJjcmVhdGVWYXJpYW50TWFuYWdlbWVudCIsInhtbCIsImdlbmVyYXRlIiwiaWQiLCJ2YXJpYW50U2VsZWN0ZWQiLCJoZWFkZXJMZXZlbCIsInZhcmlhbnRTYXZlZCIsImdldFBlcnNpc3RlbmNlUHJvdmlkZXIiLCJwdXNoQWN0aW9uQ29tbWFuZCIsImFjdGlvbkNvbnRleHQiLCJkYXRhRmllbGQiLCJjaGFydE9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsIm9uRXhlY3V0ZUFjdGlvbiIsImdldFByZXNzRXZlbnRGb3JEYXRhRmllbGRGb3JBY3Rpb25CdXR0b24iLCJvbkV4ZWN1dGVJQk4iLCJDb21tb25IZWxwZXIiLCJnZXRQcmVzc0hhbmRsZXJGb3JEYXRhRmllbGRGb3JJQk4iLCJvbkV4ZWN1dGVNYW5pZmVzdCIsImJ1aWxkQWN0aW9uV3JhcHBlciIsImRhdGFGaWVsZENvbnRleHQiLCJkYXRhRmllbGRBY3Rpb24iLCJnZXRBY3Rpb25Db250ZXh0IiwiaXNCb3VuZFBhdGgiLCJnZXRQYXRoVG9Cb3VuZEFjdGlvbk92ZXJsb2FkIiwiaXNCb3VuZCIsImVzY2FwZVhNTEF0dHJpYnV0ZVZhbHVlIiwiZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiY29udGV4dCIsImlzQWN0aW9uRW5hYmxlZCIsImlzRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uRW5hYmxlZCIsIiRJc0JvdW5kIiwiQWN0aW9uIiwiZW5hYmxlT25TZWxlY3QiLCJpc0lCTkVuYWJsZWQiLCJSZXF1aXJlc0NvbnRleHQiLCJhY3Rpb25Db21tYW5kIiwiZ2V0VmlzaWJsZSIsIklzQm91bmQiLCJnZXRJdGVtcyIsImRpbWVuc2lvbnMiLCJEaW1lbnNpb25zIiwiZm9ybWF0RGltZW5zaW9ucyIsImRpbWVuc2lvbiIsImdldEl0ZW0iLCJmb3JtYXRNZWFzdXJlcyIsImNvbmNhdCIsInByZWZpeCIsImdldFRvb2xiYXJBY3Rpb25zIiwiaXNJbnNpZ2h0c0VuYWJsZWQiLCJhY3Rpb25zIiwiZ2V0QWN0aW9ucyIsIm9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZCIsImdldFNlZ21lbnRlZEJ1dHRvbiIsImdldFN0YW5kYXJkQWN0aW9ucyIsImNoYXJ0QWN0aW9ucyIsInJlbW92ZU1lbnVJdGVtcyIsImdldEFjdGlvbiIsImhhc093blByb3BlcnR5IiwiZ2V0Q3VzdG9tQWN0aW9ucyIsInNwbGljZSIsImFjdGlvbkVuYWJsZWQiLCJnZXRBY3Rpb25Ub29sYmFyQWN0aW9uIiwidW5pdHRlc3RpZCIsImFyaWFIYXNQb3B1cCIsInZpc2libGUiLCJnZXRBY3Rpb25Ub29sYmFyTWVudUFjdGlvbiIsInVzZURlZmF1bHRBY3Rpb25Pbmx5IiwiRGVmYXVsdEFjdGlvbkhhbmRsZXIiLCJnZXRVc2VEZWZhdWx0QWN0aW9uT25seSIsImJ1dHRvbk1vZGUiLCJnZXRCdXR0b25Nb2RlIiwiZGVmYXVsdEFjdGlvbiIsImdldE1lbnVJdGVtRnJvbU1lbnUiLCJtZW51SXRlbUFjdGlvbiIsInByZXNzSGFuZGxlciIsImNvbW1hbmQiLCJub1dyYXAiLCJhTWVudUl0ZW1zIiwiaXNNZW51SXRlbSIsImdldE5hdmlnYXRpb25BY3Rpb25zIiwiZ2V0QW5ub3RhdGlvbkFjdGlvbnMiLCJhY3Rpb25PYmplY3QiLCJnZXRBbm5vdGF0aW9uQWN0aW9uc0VuYWJsZWQiLCJkYXRhRmllbGRNb2RlbE9iamVjdFBhdGgiLCJpc0RhdGFNb2RlbE9iamVjdFBhdGhGb3JBY3Rpb25XaXRoRGlhbG9nIiwidG9vbGJhckFjdGlvbiIsImJ1aWxkQWN0aW9uIiwiYWN0aW9uUHJlc3MiLCJnZXRTZWdtZW50ZWRCdXR0b25JdGVtcyIsInNlZ21lbnRlZEJ1dHRvbkl0ZW1zIiwiaXNEZXNrdG9wIiwiZ2V0U2VnbWVudGVkQnV0dG9uSXRlbSIsInRvb2x0aXAiLCJpY29uIiwiaGlkZGVuUGF0aENvbnRleHQiLCJnZXRIaWRkZW5QYXRoRXhwcmVzc2lvbkZvclRhYmxlQWN0aW9uc0FuZElCTiIsImdldENvbnRleHRQYXRoIiwibGFzdEluZGV4T2YiLCJpbml0aWFsQ29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHQiLCJnZXRWaXN1YWxpemF0aW9uUGF0aCIsImV4dHJhUGFyYW1zIiwiZ2V0RXh0cmFQYXJhbXMiLCJBZ2dyZWdhdGlvbkhlbHBlciIsImdldEVudGl0eVR5cGUiLCJfY2hhcnRDb250ZXh0IiwiZ2V0VWlDaGFydCIsIl9hcHBseUlkVG9Db250ZW50IiwiX2FwaUlkIiwiX2NvbnRlbnRJZCIsImdldENvbnRlbnRJZCIsIm5hdmlnYXRpb25QYXRoIiwiYXV0b0JpbmRPbkluaXQiLCJ2aXpQcm9wZXJ0aWVzIiwic2VsZWN0aW9uTW9kZSIsInRvVXBwZXJDYXNlIiwiZmlsdGVyQmFyIiwiZmlsdGVySWQiLCJkcmFmdFN1cHBvcnRlZCIsIk1vZGVsSGVscGVyIiwiaXNEcmFmdFN1cHBvcnRlZCIsIm1ldGFNb2RlbCIsIl9jaGFydFR5cGUiLCJmb3JtYXRDaGFydFR5cGUiLCJDaGFydFR5cGUiLCJvcGVyYXRpb25BdmFpbGFibGVNYXAiLCJrZXlzIiwiY29tbWFuZEFjdGlvbnMiLCJwcmVzZW50YXRpb25QYXRoIiwiY3JlYXRlUHJlc2VudGF0aW9uUGF0aENvbnRleHQiLCJfc29ydENvbmR0aW9ucyIsImdldFNvcnRDb25kaXRpb25zIiwiYXBwbHlTdXBwb3J0ZWQiLCJjaGFydEFjdGlvbnNDb250ZXh0IiwiQWN0aW9ucyIsImNvbnRleHRQYXRoQ29udGV4dCIsImNvbnRleHRQYXRoUGF0aCIsInRhcmdldENvbGxlY3Rpb25QYXRoIiwiZ2V0VGFyZ2V0Q29sbGVjdGlvblBhdGgiLCJ0YXJnZXRDb2xsZWN0aW9uUGF0aENvbnRleHQiLCJhY3Rpb25zT2JqZWN0IiwiY29udmVydGVkVHlwZXMiLCJyZXNvbHZlUGF0aCIsInRhcmdldCIsIl9jdXN0b21EYXRhIiwiZW50aXR5U2V0IiwiZW50aXR5VHlwZSIsInN0cmluZ2lmeUN1c3RvbURhdGEiLCJKU09OIiwicGFyc2UiLCJtdWx0aVNlbGVjdERpc2FibGVkQWN0aW9ucyIsIkFjdGlvbkhlbHBlciIsImdldE11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zIiwic2VnbWVudGVkQnV0dG9uSWQiLCJtdWx0aVZpZXdzIiwic2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFBhdGgiLCJfYWN0aW9ucyIsIm1hY3JvSWQiLCJvRGF0YVBvaW50QW5ubyIsIm9EYXRhUG9pbnQiLCJUYXJnZXRWYWx1ZSIsInRhcmdldFZhbHVlIiwiRm9yZUNhc3RWYWx1ZSIsImZvcmVDYXN0VmFsdWUiLCJvQ3JpdGljYWxpdHkiLCJDcml0aWNhbGl0eSIsIkNhbGN1bGF0ZWQiLCJTdGF0aWMiLCJDcml0aWNhbGl0eUNhbGN1bGF0aW9uIiwib1RocmVzaG9sZHMiLCJiQ29uc3RhbnQiLCJidWlsZFRocmVzaG9sZHMiLCJDb25zdGFudFRocmVzaG9sZHMiLCJEeW5hbWljVGhyZXNob2xkcyIsImNyaXRpY2FsaXR5Iiwib0NyaXRpY2FsaXR5Q2FsY3VsYXRpb24iLCJhS2V5cyIsInNLZXkiLCJpIiwiaiIsIkltcHJvdmVtZW50RGlyZWN0aW9uIiwib0R5bmFtaWNUaHJlc2hvbGRzIiwib25lU3VwcGxpZWQiLCJ1c2VkTWVhc3VyZXMiLCJvQ29uc3RhbnRUaHJlc2hvbGRzIiwib0FnZ3JlZ2F0aW9uTGV2ZWwiLCJBZ2dyZWdhdGlvbkxldmVscyIsIlZpc2libGVEaW1lbnNpb25zIiwib0FnZ3JlZ2F0aW9uTGV2ZWxJbmZvIiwiYVZpc2libGVEaW1lbnNpb25zIiwiQWdncmVnYXRpb25MZXZlbCIsIiRQcm9wZXJ0eVBhdGgiLCJuVmFsdWUiLCJnZXRUZW1wbGF0ZSIsImNoYXJ0ZGVsZWdhdGUiLCJub0RhdGFUZXh0IiwiZ2V0VHJhbnNsYXRlZFRleHQiLCJjaGFydERlbGVnYXRlIiwiYmluZGluZyIsImhlYWRlciIsIlRpdGxlIiwic2VsZWN0aW9uQ2hhbmdlIiwic3RhdGVDaGFuZ2UiLCJoZWFkZXJWaXNpYmxlIiwiaGVpZ2h0Iiwid2lkdGgiLCJCdWlsZGluZ0Jsb2NrQmFzZSIsInZpc3VhbGl6YXRpb24iLCIkQW5ub3RhdGlvblBhdGgiLCJ0ZXJtIiwicmVzb2x2ZWRUYXJnZXQiLCJnZXRFbnRpdHlUeXBlQW5ub3RhdGlvbiIsIlByZXNlbnRhdGlvblZhcmlhbnQiLCJnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50IiwiY2hhcnRWaXoiLCJmaW5kIiwidml6IiwiVGl0bGVMZXZlbCIsIkF1dG8iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNoYXJ0LmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUHJpbWl0aXZlVHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHsgQW5hbHl0aWNzQW5ub3RhdGlvblRlcm1zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9BbmFseXRpY3NcIjtcbmltcG9ydCB7IENvbW1vbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgeyBDb3JlQW5ub3RhdGlvblRlcm1zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db3JlXCI7XG5pbXBvcnQgdHlwZSB7XG5cdENoYXJ0LFxuXHRDaGFydE1lYXN1cmVBdHRyaWJ1dGVUeXBlLFxuXHRDaGFydE1lYXN1cmVSb2xlVHlwZSxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkRm9yQWN0aW9uLFxuXHREYXRhUG9pbnRcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMsIFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdWlkIGZyb20gXCJzYXAvYmFzZS91dGlsL3VpZFwiO1xuaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgYmxvY2tBZ2dyZWdhdGlvbiwgYmxvY2tBdHRyaWJ1dGUsIGJsb2NrRXZlbnQsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB7IGVzY2FwZVhNTEF0dHJpYnV0ZVZhbHVlLCB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgeyBpc0RhdGFNb2RlbE9iamVjdFBhdGhGb3JBY3Rpb25XaXRoRGlhbG9nIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvYW5ub3RhdGlvbnMvRGF0YUZpZWxkXCI7XG5pbXBvcnQgdHlwZSB7IEFubm90YXRpb25BY3Rpb24sIEJhc2VBY3Rpb24sIEN1c3RvbUFjdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB0eXBlIHsgQ2hhcnRWaXN1YWxpemF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0NoYXJ0XCI7XG5pbXBvcnQgdHlwZSB7IFZpc3VhbGl6YXRpb25BbmRQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQge1xuXHRnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24sXG5cdGdldFZpc3VhbGl6YXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnRcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IEFnZ3JlZ2F0aW9uSGVscGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9BZ2dyZWdhdGlvblwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCByZXNvbHZlQmluZGluZ1N0cmluZyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCB7IFRpdGxlTGV2ZWwgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IEFjdGlvbkhlbHBlciBmcm9tIFwiLi4vaW50ZXJuYWwvaGVscGVycy9BY3Rpb25IZWxwZXJcIjtcbmltcG9ydCBEZWZhdWx0QWN0aW9uSGFuZGxlciBmcm9tIFwiLi4vaW50ZXJuYWwvaGVscGVycy9EZWZhdWx0QWN0aW9uSGFuZGxlclwiO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb24sIEFjdGlvbkdyb3VwIH0gZnJvbSBcIi4vQ2hhcnRBUElcIjtcbmltcG9ydCBDaGFydEhlbHBlciBmcm9tIFwiLi9DaGFydEhlbHBlclwiO1xuXG5jb25zdCBtZWFzdXJlUm9sZTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydE1lYXN1cmVSb2xlVHlwZS9BeGlzMVwiOiBcImF4aXMxXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRNZWFzdXJlUm9sZVR5cGUvQXhpczJcIjogXCJheGlzMlwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0TWVhc3VyZVJvbGVUeXBlL0F4aXMzXCI6IFwiYXhpczNcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydE1lYXN1cmVSb2xlVHlwZS9BeGlzNFwiOiBcImF4aXM0XCJcbn07XG5cbnR5cGUgRXh0ZW5kZWRBY3Rpb25Hcm91cCA9IEFjdGlvbkdyb3VwICYgeyBtZW51Q29udGVudEFjdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCBBY3Rpb24+IH07XG50eXBlIEFjdGlvbk9yQWN0aW9uR3JvdXAgPSBSZWNvcmQ8c3RyaW5nLCBBY3Rpb24gfCBFeHRlbmRlZEFjdGlvbkdyb3VwPjtcbnR5cGUgQ3VzdG9tQW5kQWN0aW9uID0gQ3VzdG9tQWN0aW9uICYgKEFjdGlvbiB8IEFjdGlvbkdyb3VwKTtcbnR5cGUgQ3VzdG9tVG9vbGJhck1lbnVBY3Rpb24gPSB7XG5cdGlkOiBzdHJpbmc7XG5cdHRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0dmlzaWJsZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRlbmFibGVkOiBzdHJpbmcgfCBib29sZWFuO1xuXHR1c2VEZWZhdWx0QWN0aW9uT25seT86IGJvb2xlYW47XG5cdGJ1dHRvbk1vZGU/OiBzdHJpbmc7XG5cdGRlZmF1bHRBY3Rpb24/OiBzdHJpbmc7XG5cdGFjdGlvbnM/OiBDdXN0b21BY3Rpb247XG59O1xuXG5lbnVtIHBlcnNvbmFsaXphdGlvblZhbHVlcyB7XG5cdFNvcnQgPSBcIlNvcnRcIixcblx0VHlwZSA9IFwiVHlwZVwiLFxuXHRJdGVtID0gXCJJdGVtXCIsXG5cdEZpbHRlciA9IFwiRmlsdGVyXCJcbn1cblxuLyoqXG4gKiBCdWlsZCBhY3Rpb25zIGFuZCBhY3Rpb24gZ3JvdXBzIHdpdGggYWxsIHByb3BlcnRpZXMgZm9yIGNoYXJ0IHZpc3VhbGl6YXRpb24uXG4gKlxuICogQHBhcmFtIGNoaWxkQWN0aW9uIFhNTCBub2RlIGNvcnJlc3BvbmRpbmcgdG8gYWN0aW9uc1xuICogQHJldHVybnMgUHJlcGFyZWQgYWN0aW9uIG9iamVjdFxuICovXG5jb25zdCBzZXRDdXN0b21BY3Rpb25Qcm9wZXJ0aWVzID0gZnVuY3Rpb24gKGNoaWxkQWN0aW9uOiBFbGVtZW50KSB7XG5cdGxldCBtZW51Q29udGVudEFjdGlvbnMgPSBudWxsO1xuXHRjb25zdCBhY3Rpb24gPSBjaGlsZEFjdGlvbjtcblx0bGV0IG1lbnVBY3Rpb25zOiBBY3Rpb25Hcm91cFtdID0gW107XG5cdGNvbnN0IGFjdGlvbktleSA9IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJrZXlcIik/LnJlcGxhY2UoXCJJbmxpbmVYTUxfXCIsIFwiXCIpO1xuXHQvLyBGb3IgdGhlIGFjdGlvbkdyb3VwIHdlIGF1dGhvcml6ZSB0aGUgYm90aCBlbnRyaWVzIDxzYXAuZmUubWFjcm9zOkFjdGlvbkdyb3VwPiAoY29tcGxpYW50IHdpdGggb2xkIEZQTSBleGFtcGxlcykgYW5kIDxzYXAuZmUubWFjcm9zLmNoYXJ0OkFjdGlvbkdyb3VwPlxuXHRpZiAoXG5cdFx0YWN0aW9uLmNoaWxkcmVuLmxlbmd0aCAmJlxuXHRcdGFjdGlvbi5sb2NhbE5hbWUgPT09IFwiQWN0aW9uR3JvdXBcIiAmJlxuXHRcdGFjdGlvbi5uYW1lc3BhY2VVUkkgJiZcblx0XHRbXCJzYXAuZmUubWFjcm9zXCIsIFwic2FwLmZlLm1hY3Jvcy5jaGFydFwiXS5pbmRleE9mKGFjdGlvbi5uYW1lc3BhY2VVUkkpID4gLTFcblx0KSB7XG5cdFx0Y29uc3QgYWN0aW9uc1RvQWRkID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFjdGlvbi5jaGlsZHJlbik7XG5cdFx0bGV0IGFjdGlvbklkeCA9IDA7XG5cdFx0bWVudUNvbnRlbnRBY3Rpb25zID0gYWN0aW9uc1RvQWRkLnJlZHVjZSgoY3VzdG9tQWN0aW9uLCBhY3RUb0FkZCkgPT4ge1xuXHRcdFx0Y29uc3QgYWN0aW9uS2V5QWRkID0gYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwia2V5XCIpPy5yZXBsYWNlKFwiSW5saW5lWE1MX1wiLCBcIlwiKSB8fCBhY3Rpb25LZXkgKyBcIl9NZW51X1wiICsgYWN0aW9uSWR4O1xuXHRcdFx0Y29uc3QgY3VyT3V0T2JqZWN0ID0ge1xuXHRcdFx0XHRrZXk6IGFjdGlvbktleUFkZCxcblx0XHRcdFx0dGV4dDogYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwidGV4dFwiKSxcblx0XHRcdFx0X19ub1dyYXA6IHRydWUsXG5cdFx0XHRcdHByZXNzOiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJwcmVzc1wiKSxcblx0XHRcdFx0cmVxdWlyZXNTZWxlY3Rpb246IGFjdFRvQWRkLmdldEF0dHJpYnV0ZShcInJlcXVpcmVzU2VsZWN0aW9uXCIpID09PSBcInRydWVcIixcblx0XHRcdFx0ZW5hYmxlZDogYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwiZW5hYmxlZFwiKSA9PT0gbnVsbCA/IHRydWUgOiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpXG5cdFx0XHR9O1xuXHRcdFx0Y3VzdG9tQWN0aW9uW2N1ck91dE9iamVjdC5rZXldID0gY3VyT3V0T2JqZWN0O1xuXHRcdFx0YWN0aW9uSWR4Kys7XG5cdFx0XHRyZXR1cm4gY3VzdG9tQWN0aW9uO1xuXHRcdH0sIHt9KTtcblx0XHRtZW51QWN0aW9ucyA9IE9iamVjdC52YWx1ZXMobWVudUNvbnRlbnRBY3Rpb25zKVxuXHRcdFx0LnNsaWNlKC1hY3Rpb24uY2hpbGRyZW4ubGVuZ3RoKVxuXHRcdFx0Lm1hcChmdW5jdGlvbiAobWVudUl0ZW06IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gbWVudUl0ZW0ua2V5O1xuXHRcdFx0fSk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRrZXk6IGFjdGlvbktleSxcblx0XHR0ZXh0OiBhY3Rpb24uZ2V0QXR0cmlidXRlKFwidGV4dFwiKSxcblx0XHRwb3NpdGlvbjoge1xuXHRcdFx0cGxhY2VtZW50OiBhY3Rpb24uZ2V0QXR0cmlidXRlKFwicGxhY2VtZW50XCIpLFxuXHRcdFx0YW5jaG9yOiBhY3Rpb24uZ2V0QXR0cmlidXRlKFwiYW5jaG9yXCIpXG5cdFx0fSxcblx0XHRfX25vV3JhcDogdHJ1ZSxcblx0XHRwcmVzczogYWN0aW9uLmdldEF0dHJpYnV0ZShcInByZXNzXCIpLFxuXHRcdHJlcXVpcmVzU2VsZWN0aW9uOiBhY3Rpb24uZ2V0QXR0cmlidXRlKFwicmVxdWlyZXNTZWxlY3Rpb25cIikgPT09IFwidHJ1ZVwiLFxuXHRcdGVuYWJsZWQ6IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpID09PSBudWxsID8gdHJ1ZSA6IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpLFxuXHRcdG1lbnU6IG1lbnVBY3Rpb25zLmxlbmd0aCA/IG1lbnVBY3Rpb25zIDogbnVsbCxcblx0XHRtZW51Q29udGVudEFjdGlvbnM6IG1lbnVDb250ZW50QWN0aW9uc1xuXHR9O1xufTtcblxudHlwZSBNZWFzdXJlVHlwZSA9IHtcblx0aWQ/OiBzdHJpbmc7XG5cdGtleT86IHN0cmluZztcblx0cm9sZT86IHN0cmluZztcblx0cHJvcGVydHlQYXRoPzogc3RyaW5nO1xuXHRhZ2dyZWdhdGlvbk1ldGhvZD86IHN0cmluZztcblx0bGFiZWw/OiBzdHJpbmcgfCBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248UHJpbWl0aXZlVHlwZT47XG5cdHZhbHVlPzogc3RyaW5nO1xuXHRkYXRhUG9pbnQ/OiBzdHJpbmc7XG5cdG5hbWU/OiBzdHJpbmc7XG59O1xuXG50eXBlIERpbWVuc2lvblR5cGUgPSB7XG5cdGlkPzogc3RyaW5nO1xuXHRrZXk/OiBzdHJpbmc7XG5cdHJvbGU/OiBzdHJpbmc7XG5cdHByb3BlcnR5UGF0aD86IHN0cmluZztcblx0bGFiZWw/OiBzdHJpbmcgfCBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248UHJpbWl0aXZlVHlwZT47XG5cdHZhbHVlPzogc3RyaW5nO1xufTtcblxudHlwZSBDb21tYW5kQWN0aW9uID0ge1xuXHRhY3Rpb25Db250ZXh0OiBDb250ZXh0O1xuXHRvbkV4ZWN1dGVBY3Rpb246IHN0cmluZztcblx0b25FeGVjdXRlSUJOPzogc3RyaW5nO1xuXHRvbkV4ZWN1dGVNYW5pZmVzdDogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG59O1xuXG50eXBlIFRvb2xCYXJBY3Rpb24gPSB7XG5cdHVuaXR0ZXN0aWQ6IHN0cmluZztcblx0aWQ/OiBzdHJpbmc7XG5cdGxhYmVsOiBzdHJpbmc7XG5cdGFyaWFIYXNQb3B1cD86IHN0cmluZztcblx0cHJlc3M6IHN0cmluZztcblx0ZW5hYmxlZDogc3RyaW5nIHwgYm9vbGVhbjtcblx0dmlzaWJsZTogc3RyaW5nIHwgYm9vbGVhbjtcbn07XG5cbnR5cGUgQ2hhcnRDdXN0b21EYXRhID0ge1xuXHR0YXJnZXRDb2xsZWN0aW9uUGF0aDogc3RyaW5nO1xuXHRlbnRpdHlTZXQ6IHN0cmluZztcblx0ZW50aXR5VHlwZTogc3RyaW5nO1xuXHRvcGVyYXRpb25BdmFpbGFibGVNYXA6IHN0cmluZztcblx0bXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnM6IHN0cmluZztcblx0c2VnbWVudGVkQnV0dG9uSWQ6IHN0cmluZztcblx0Y3VzdG9tQWdnOiBzdHJpbmc7XG5cdHRyYW5zQWdnOiBzdHJpbmc7XG5cdGFwcGx5U3VwcG9ydGVkOiBzdHJpbmc7XG5cdHZpelByb3BlcnRpZXM6IHN0cmluZztcblx0ZHJhZnRTdXBwb3J0ZWQ/OiBib29sZWFuO1xuXHRtdWx0aVZpZXdzPzogYm9vbGVhbjtcblx0c2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFBhdGg/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBDaGFydCBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkNoYXJ0IGlkPVwiTXlDaGFydFwiIG1ldGFQYXRoPVwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0XCIgLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIENoYXJ0IGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiQ2hhcnRcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIixcblx0cHVibGljTmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIixcblx0cmV0dXJuVHlwZXM6IFtcInNhcC5mZS5tYWNyb3MuY2hhcnQuQ2hhcnRBUElcIl1cbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGFydEJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogSUQgb2YgdGhlIGNoYXJ0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRpZD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwib2JqZWN0XCJcblx0fSlcblx0Y2hhcnREZWZpbml0aW9uPzogQ2hhcnRWaXN1YWxpemF0aW9uO1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBwcmVzZW50YXRpb24gY29udGV4dCAoVUkuQ2hhcnQgd2l0aCBvciB3aXRob3V0IGEgcXVhbGlmaWVyKVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0bWV0YVBhdGghOiBDb250ZXh0OyAvLyBXZSByZXF1aXJlIG1ldGFQYXRoIHRvIGJlIHRoZXJlIGV2ZW4gdGhvdWdoIGl0IGlzIG5vdCBmb3JtYWxseSByZXF1aXJlZFxuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBlbnRpdHlTZXQgb3IgbmF2aWdhdGlvblByb3BlcnR5XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRjb250ZXh0UGF0aCE6IENvbnRleHQ7IC8vIFdlIHJlcXVpcmUgY29udGV4dFBhdGggdG8gYmUgdGhlcmUgZXZlbiB0aG91Z2ggaXQgaXMgbm90IGZvcm1hbGx5IHJlcXVpcmVkXG5cblx0LyoqXG5cdCAqIFRoZSBoZWlnaHQgb2YgdGhlIGNoYXJ0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0aGVpZ2h0OiBzdHJpbmcgPSBcIjEwMCVcIjtcblxuXHQvKipcblx0ICogVGhlIHdpZHRoIG9mIHRoZSBjaGFydFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHdpZHRoOiBzdHJpbmcgPSBcIjEwMCVcIjtcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHRoZSBoZWFkZXIgdGV4dCB0aGF0IGlzIHNob3duIGluIHRoZSBjaGFydFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGhlYWRlcj86IHN0cmluZztcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBjaGFydCBoZWFkZXJcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0aGVhZGVyVmlzaWJsZT86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIFwiYXJpYS1sZXZlbFwiIG9mIHRoZSBjaGFydCBoZWFkZXJcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkuY29yZS5UaXRsZUxldmVsXCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0aGVhZGVyTGV2ZWw6IFRpdGxlTGV2ZWwgPSBUaXRsZUxldmVsLkF1dG87XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgc2VsZWN0aW9uIG1vZGVcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRzZWxlY3Rpb25Nb2RlOiBzdHJpbmcgPSBcIk1VTFRJUExFXCI7XG5cblx0LyoqXG5cdCAqIFBhcmFtZXRlciB3aGljaCBzZXRzIHRoZSBwZXJzb25hbGl6YXRpb24gb2YgdGhlIGNoYXJ0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nfGJvb2xlYW5cIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRwZXJzb25hbGl6YXRpb24/OiBzdHJpbmcgfCBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBQYXJhbWV0ZXIgd2hpY2ggc2V0cyB0aGUgSUQgb2YgdGhlIGZpbHRlcmJhciBhc3NvY2lhdGluZyBpdCB0byB0aGUgY2hhcnRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRmaWx0ZXJCYXI/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFx0UGFyYW1ldGVyIHdoaWNoIHNldHMgdGhlIG5vRGF0YVRleHQgZm9yIHRoZSBjaGFydFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRub0RhdGFUZXh0Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBQYXJhbWV0ZXIgd2hpY2ggc2V0cyB0aGUgY2hhcnQgZGVsZWdhdGUgZm9yIHRoZSBjaGFydFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRjaGFydERlbGVnYXRlPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBQYXJhbWV0ZXIgd2hpY2ggc2V0cyB0aGUgdmlzdWFsaXphdGlvbiBwcm9wZXJ0aWVzIGZvciB0aGUgY2hhcnRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dml6UHJvcGVydGllcz86IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIGFjdGlvbnMgdG8gYmUgc2hvd24gaW4gdGhlIGFjdGlvbiBhcmVhIG9mIHRoZSBjaGFydFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiIH0pXG5cdGNoYXJ0QWN0aW9ucz86IENvbnRleHQ7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0ZHJhZnRTdXBwb3J0ZWQ/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGF1dG9CaW5kT25Jbml0PzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHZpc2libGU/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRuYXZpZ2F0aW9uUGF0aD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGZpbHRlcj86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdG1lYXN1cmVzPzogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdF9hcHBseUlkVG9Db250ZW50OiBib29sZWFuID0gZmFsc2U7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0dmFyaWFudE1hbmFnZW1lbnQ/OiBzdHJpbmc7XG5cblx0QGJsb2NrRXZlbnQoKVxuXHR2YXJpYW50U2VsZWN0ZWQ/OiBGdW5jdGlvbjtcblxuXHRAYmxvY2tFdmVudCgpXG5cdHZhcmlhbnRTYXZlZD86IEZ1bmN0aW9uO1xuXG5cdC8qKlxuXHQgKiBUaGUgWE1MIGFuZCBtYW5pZmVzdCBhY3Rpb25zIHRvIGJlIHNob3duIGluIHRoZSBhY3Rpb24gYXJlYSBvZiB0aGUgY2hhcnRcblx0ICovXG5cdEBibG9ja0FnZ3JlZ2F0aW9uKHtcblx0XHR0eXBlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuY2hhcnQuQWN0aW9uIHwgc2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5jaGFydC5BY3Rpb25Hcm91cFwiLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdHByb2Nlc3NBZ2dyZWdhdGlvbnM6IHNldEN1c3RvbUFjdGlvblByb3BlcnRpZXNcblx0fSlcblx0YWN0aW9ucz86IEFjdGlvbk9yQWN0aW9uR3JvdXA7XG5cblx0LyoqXG5cdCAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIGNoYXJ0IHNlbGVjdGlvbnMgYXJlIGNoYW5nZWQuIFRoZSBldmVudCBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZGF0YSBzZWxlY3RlZC9kZXNlbGVjdGVkIGFuZFxuXHQgKiB0aGUgQm9vbGVhbiBmbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgZGF0YSBpcyBzZWxlY3RlZCBvciBkZXNlbGVjdGVkXG5cdCAqL1xuXHRAYmxvY2tFdmVudCgpXG5cdHNlbGVjdGlvbkNoYW5nZT86IEZ1bmN0aW9uO1xuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIHRvIHJlYWN0IHRvIHRoZSBzdGF0ZUNoYW5nZSBldmVudCBvZiB0aGUgY2hhcnQuXG5cdCAqL1xuXHRAYmxvY2tFdmVudCgpXG5cdHN0YXRlQ2hhbmdlPzogRnVuY3Rpb247XG5cblx0dXNlQ29uZGVuc2VkTGF5b3V0ITogYm9vbGVhbjtcblxuXHRfYXBpSWQhOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0X2NvbnRlbnRJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdF9jb21tYW5kQWN0aW9uczogQ29tbWFuZEFjdGlvbltdID0gW107XG5cblx0X2NoYXJ0VHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdF9zb3J0Q29uZHRpb25zOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0X2N1c3RvbURhdGE6IENoYXJ0Q3VzdG9tRGF0YTtcblxuXHRfYWN0aW9uczogc3RyaW5nO1xuXG5cdF9jaGFydENvbnRleHQ6IENvbnRleHQ7XG5cblx0X2NoYXJ0OiBDaGFydDtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPENoYXJ0QmxvY2s+LCBjb25maWd1cmF0aW9uOiBhbnksIHNldHRpbmdzOiBhbnkpIHtcblx0XHRzdXBlcihwcm9wcywgY29uZmlndXJhdGlvbiwgc2V0dGluZ3MpO1xuXHRcdGNvbnN0IGNvbnRleHRPYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMubWV0YVBhdGgsIHRoaXMuY29udGV4dFBhdGgpO1xuXHRcdGNvbnN0IGluaXRpYWxDb252ZXJ0ZXJDb250ZXh0ID0gdGhpcy5nZXRDb252ZXJ0ZXJDb250ZXh0KGNvbnRleHRPYmplY3RQYXRoLCAvKnRoaXMuY29udGV4dFBhdGgqLyB1bmRlZmluZWQsIHNldHRpbmdzKTtcblx0XHRjb25zdCB2aXN1YWxpemF0aW9uUGF0aCA9IENoYXJ0QmxvY2suZ2V0VmlzdWFsaXphdGlvblBhdGgodGhpcywgY29udGV4dE9iamVjdFBhdGgsIGluaXRpYWxDb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRjb25zdCBleHRyYVBhcmFtcyA9IENoYXJ0QmxvY2suZ2V0RXh0cmFQYXJhbXModGhpcywgdmlzdWFsaXphdGlvblBhdGgpO1xuXHRcdGNvbnN0IGNvbnZlcnRlckNvbnRleHQgPSB0aGlzLmdldENvbnZlcnRlckNvbnRleHQoY29udGV4dE9iamVjdFBhdGgsIC8qdGhpcy5jb250ZXh0UGF0aCovIHVuZGVmaW5lZCwgc2V0dGluZ3MsIGV4dHJhUGFyYW1zKTtcblxuXHRcdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLCBjb252ZXJ0ZXJDb250ZXh0LCB0cnVlKTsgLy8gcGFzc2luZyB0aGUgbGFzdCBwYXJhbWV0ZXIgYXMgdHJ1ZSB0byBjb25zaWRlciB0aGUgb2xkIGFubm90YXRpb25zIGkuZS4gQWdncmVnYXRpb24uQWdncmVnYXRhYmxlIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IGluIGNhc2Ugb2YgY2hhcnRcblx0XHR0aGlzLl9jaGFydENvbnRleHQgPSBDaGFydEhlbHBlci5nZXRVaUNoYXJ0KHRoaXMubWV0YVBhdGgpISBhcyBDb250ZXh0O1xuXHRcdHRoaXMuX2NoYXJ0ID0gdGhpcy5fY2hhcnRDb250ZXh0LmdldE9iamVjdCgpIGFzIENoYXJ0O1xuXHRcdGlmICh0aGlzLl9hcHBseUlkVG9Db250ZW50ID8/IGZhbHNlKSB7XG5cdFx0XHR0aGlzLl9hcGlJZCA9IHRoaXMuaWQgKyBcIjo6Q2hhcnRcIjtcblx0XHRcdHRoaXMuX2NvbnRlbnRJZCA9IHRoaXMuaWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2FwaUlkID0gdGhpcy5pZDtcblx0XHRcdHRoaXMuX2NvbnRlbnRJZCA9IHRoaXMuZ2V0Q29udGVudElkKHRoaXMuaWQhKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fY2hhcnQpIHtcblx0XHRcdHRoaXMuY2hhcnREZWZpbml0aW9uID1cblx0XHRcdFx0dGhpcy5jaGFydERlZmluaXRpb24gPT09IHVuZGVmaW5lZCB8fCB0aGlzLmNoYXJ0RGVmaW5pdGlvbiA9PT0gbnVsbFxuXHRcdFx0XHRcdD8gdGhpcy5jcmVhdGVDaGFydERlZmluaXRpb24oY29udmVydGVyQ29udGV4dCwgY29udGV4dE9iamVjdFBhdGgsIHRoaXMuX2NoYXJ0Q29udGV4dC5nZXRQYXRoKCkpXG5cdFx0XHRcdFx0OiB0aGlzLmNoYXJ0RGVmaW5pdGlvbjtcblx0XHRcdC8vIEFQSSBQcm9wZXJ0aWVzXG5cdFx0XHR0aGlzLm5hdmlnYXRpb25QYXRoID0gdGhpcy5jaGFydERlZmluaXRpb24ubmF2aWdhdGlvblBhdGg7XG5cdFx0XHR0aGlzLmF1dG9CaW5kT25Jbml0ID0gdGhpcy5jaGFydERlZmluaXRpb24uYXV0b0JpbmRPbkluaXQ7XG5cdFx0XHR0aGlzLnZpelByb3BlcnRpZXMgPSB0aGlzLmNoYXJ0RGVmaW5pdGlvbi52aXpQcm9wZXJ0aWVzO1xuXHRcdFx0dGhpcy5jaGFydEFjdGlvbnMgPSB0aGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHRoaXMuY2hhcnREZWZpbml0aW9uLmFjdGlvbnMsIHNldHRpbmdzKTtcblx0XHRcdHRoaXMuc2VsZWN0aW9uTW9kZSA9IHRoaXMuc2VsZWN0aW9uTW9kZS50b1VwcGVyQ2FzZSgpO1xuXHRcdFx0aWYgKHRoaXMuZmlsdGVyQmFyKSB7XG5cdFx0XHRcdHRoaXMuZmlsdGVyID0gdGhpcy5nZXRDb250ZW50SWQodGhpcy5maWx0ZXJCYXIpO1xuXHRcdFx0fSBlbHNlIGlmICghdGhpcy5maWx0ZXIpIHtcblx0XHRcdFx0dGhpcy5maWx0ZXIgPSB0aGlzLmNoYXJ0RGVmaW5pdGlvbi5maWx0ZXJJZDtcblx0XHRcdH1cblx0XHRcdHRoaXMuY2hlY2tQZXJzb25hbGl6YXRpb25JbkNoYXJ0UHJvcGVydGllcyh0aGlzKTtcblx0XHRcdHRoaXMudmFyaWFudE1hbmFnZW1lbnQgPSB0aGlzLmdldFZhcmlhbnRNYW5hZ2VtZW50KHRoaXMsIHRoaXMuY2hhcnREZWZpbml0aW9uKTtcblx0XHRcdHRoaXMudmlzaWJsZSA9IHRoaXMuY2hhcnREZWZpbml0aW9uLnZpc2libGU7XG5cdFx0XHRsZXQgY29udGV4dFBhdGggPSB0aGlzLmNvbnRleHRQYXRoLmdldFBhdGgoKTtcblx0XHRcdGNvbnRleHRQYXRoID0gY29udGV4dFBhdGhbY29udGV4dFBhdGgubGVuZ3RoIC0gMV0gPT09IFwiL1wiID8gY29udGV4dFBhdGguc2xpY2UoMCwgLTEpIDogY29udGV4dFBhdGg7XG5cdFx0XHR0aGlzLmRyYWZ0U3VwcG9ydGVkID0gTW9kZWxIZWxwZXIuaXNEcmFmdFN1cHBvcnRlZChzZXR0aW5ncy5tb2RlbHMubWV0YU1vZGVsLCBjb250ZXh0UGF0aCk7XG5cdFx0XHR0aGlzLl9jaGFydFR5cGUgPSBDaGFydEhlbHBlci5mb3JtYXRDaGFydFR5cGUodGhpcy5fY2hhcnQuQ2hhcnRUeXBlKTtcblxuXHRcdFx0Y29uc3Qgb3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gQ2hhcnRIZWxwZXIuZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwKHRoaXMuX2NoYXJ0LCB7XG5cdFx0XHRcdGNvbnRleHQ6IHRoaXMuX2NoYXJ0Q29udGV4dFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChPYmplY3Qua2V5cyh0aGlzLmNoYXJ0RGVmaW5pdGlvbj8uY29tbWFuZEFjdGlvbnMgYXMgb2JqZWN0KS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdE9iamVjdC5rZXlzKHRoaXMuY2hhcnREZWZpbml0aW9uPy5jb21tYW5kQWN0aW9ucyBhcyBvYmplY3QpLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgYWN0aW9uID0gdGhpcy5jaGFydERlZmluaXRpb24/LmNvbW1hbmRBY3Rpb25zW2tleV07XG5cdFx0XHRcdFx0Y29uc3QgYWN0aW9uQ29udGV4dCA9IHRoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoYWN0aW9uISwgc2V0dGluZ3MpO1xuXHRcdFx0XHRcdGNvbnN0IGRhdGFGaWVsZENvbnRleHQgPVxuXHRcdFx0XHRcdFx0YWN0aW9uIS5hbm5vdGF0aW9uUGF0aCAmJiB0aGlzLmNvbnRleHRQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoYWN0aW9uIS5hbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRcdFx0Y29uc3QgZGF0YUZpZWxkID0gZGF0YUZpZWxkQ29udGV4dCAmJiBkYXRhRmllbGRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdGNvbnN0IGNoYXJ0T3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gZXNjYXBlWE1MQXR0cmlidXRlVmFsdWUob3BlcmF0aW9uQXZhaWxhYmxlTWFwKTtcblx0XHRcdFx0XHR0aGlzLnB1c2hBY3Rpb25Db21tYW5kKGFjdGlvbkNvbnRleHQsIGRhdGFGaWVsZCwgY2hhcnRPcGVyYXRpb25BdmFpbGFibGVNYXAsIGFjdGlvbiEpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHRoaXMubWVhc3VyZXMgPSB0aGlzLmdldENoYXJ0TWVhc3VyZXModGhpcywgYWdncmVnYXRpb25IZWxwZXIpO1xuXHRcdFx0Y29uc3QgcHJlc2VudGF0aW9uUGF0aCA9IENvbW1vbkhlbHBlci5jcmVhdGVQcmVzZW50YXRpb25QYXRoQ29udGV4dCh0aGlzLm1ldGFQYXRoKTtcblx0XHRcdHRoaXMuX3NvcnRDb25kdGlvbnMgPSBDaGFydEhlbHBlci5nZXRTb3J0Q29uZGl0aW9ucyhcblx0XHRcdFx0dGhpcy5tZXRhUGF0aCxcblx0XHRcdFx0dGhpcy5tZXRhUGF0aC5nZXRPYmplY3QoKSxcblx0XHRcdFx0cHJlc2VudGF0aW9uUGF0aC5nZXRQYXRoKCksXG5cdFx0XHRcdHRoaXMuY2hhcnREZWZpbml0aW9uLmFwcGx5U3VwcG9ydGVkXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgY2hhcnRBY3Rpb25zQ29udGV4dCA9IHRoaXMuY29udGV4dFBhdGhcblx0XHRcdFx0LmdldE1vZGVsKClcblx0XHRcdFx0LmNyZWF0ZUJpbmRpbmdDb250ZXh0KHRoaXMuX2NoYXJ0Q29udGV4dC5nZXRQYXRoKCkgKyBcIi9BY3Rpb25zXCIsIHRoaXMuX2NoYXJ0LkFjdGlvbnMgYXMgdW5rbm93biBhcyBDb250ZXh0KTtcblx0XHRcdGNvbnN0IGNvbnRleHRQYXRoQ29udGV4dCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dCh0aGlzLmNvbnRleHRQYXRoLmdldFBhdGgoKSwgdGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0XHRjb25zdCBjb250ZXh0UGF0aFBhdGggPSBDb21tb25IZWxwZXIuZ2V0Q29udGV4dFBhdGgodGhpcy5jb250ZXh0UGF0aCwgeyBjb250ZXh0OiBjb250ZXh0UGF0aENvbnRleHQgfSk7XG5cdFx0XHRjb25zdCB0YXJnZXRDb2xsZWN0aW9uUGF0aCA9IENvbW1vbkhlbHBlci5nZXRUYXJnZXRDb2xsZWN0aW9uUGF0aCh0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRcdGNvbnN0IHRhcmdldENvbGxlY3Rpb25QYXRoQ29udGV4dCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dCh0YXJnZXRDb2xsZWN0aW9uUGF0aCwgdGhpcy5jb250ZXh0UGF0aCkhO1xuXHRcdFx0Y29uc3QgYWN0aW9uc09iamVjdCA9IGNvbnRleHRPYmplY3RQYXRoLmNvbnZlcnRlZFR5cGVzLnJlc29sdmVQYXRoKGNoYXJ0QWN0aW9uc0NvbnRleHQuZ2V0UGF0aCgpKT8udGFyZ2V0O1xuXG5cdFx0XHR0aGlzLl9jdXN0b21EYXRhID0ge1xuXHRcdFx0XHR0YXJnZXRDb2xsZWN0aW9uUGF0aDogY29udGV4dFBhdGhQYXRoLFxuXHRcdFx0XHRlbnRpdHlTZXQ6XG5cdFx0XHRcdFx0dHlwZW9mIHRhcmdldENvbGxlY3Rpb25QYXRoQ29udGV4dC5nZXRPYmplY3QoKSA9PT0gXCJzdHJpbmdcIlxuXHRcdFx0XHRcdFx0PyB0YXJnZXRDb2xsZWN0aW9uUGF0aENvbnRleHQuZ2V0T2JqZWN0KClcblx0XHRcdFx0XHRcdDogdGFyZ2V0Q29sbGVjdGlvblBhdGhDb250ZXh0LmdldE9iamVjdChcIkBzYXB1aS5uYW1lXCIpLFxuXHRcdFx0XHRlbnRpdHlUeXBlOiBjb250ZXh0UGF0aFBhdGggKyBcIi9cIixcblx0XHRcdFx0b3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBDb21tb25IZWxwZXIuc3RyaW5naWZ5Q3VzdG9tRGF0YShKU09OLnBhcnNlKG9wZXJhdGlvbkF2YWlsYWJsZU1hcCkpLFxuXHRcdFx0XHRtdWx0aVNlbGVjdERpc2FibGVkQWN0aW9uczogQWN0aW9uSGVscGVyLmdldE11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zKGFjdGlvbnNPYmplY3QgYXMgRGF0YUZpZWxkQWJzdHJhY3RUeXBlc1tdKSArIFwiXCIsXG5cdFx0XHRcdHNlZ21lbnRlZEJ1dHRvbklkOiBnZW5lcmF0ZShbdGhpcy5pZCwgXCJTZWdtZW50ZWRCdXR0b25cIiwgXCJUZW1wbGF0ZUNvbnRlbnRWaWV3XCJdKSxcblx0XHRcdFx0Y3VzdG9tQWdnOiBDb21tb25IZWxwZXIuc3RyaW5naWZ5Q3VzdG9tRGF0YSh0aGlzLmNoYXJ0RGVmaW5pdGlvbj8uY3VzdG9tQWdnKSxcblx0XHRcdFx0dHJhbnNBZ2c6IENvbW1vbkhlbHBlci5zdHJpbmdpZnlDdXN0b21EYXRhKHRoaXMuY2hhcnREZWZpbml0aW9uPy50cmFuc0FnZyksXG5cdFx0XHRcdGFwcGx5U3VwcG9ydGVkOiBDb21tb25IZWxwZXIuc3RyaW5naWZ5Q3VzdG9tRGF0YSh0aGlzLmNoYXJ0RGVmaW5pdGlvbj8uYXBwbHlTdXBwb3J0ZWQpLFxuXHRcdFx0XHR2aXpQcm9wZXJ0aWVzOiB0aGlzLnZpelByb3BlcnRpZXMsXG5cdFx0XHRcdGRyYWZ0U3VwcG9ydGVkOiB0aGlzLmRyYWZ0U3VwcG9ydGVkLFxuXHRcdFx0XHRtdWx0aVZpZXdzOiB0aGlzLmNoYXJ0RGVmaW5pdGlvbj8ubXVsdGlWaWV3cyxcblx0XHRcdFx0c2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFBhdGg6IENvbW1vbkhlbHBlci5zdHJpbmdpZnlDdXN0b21EYXRhKHtcblx0XHRcdFx0XHRkYXRhOiB0aGlzLmNoYXJ0RGVmaW5pdGlvbj8uc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFBhdGhcblx0XHRcdFx0fSlcblx0XHRcdH07XG5cdFx0XHR0aGlzLl9hY3Rpb25zID0gdGhpcy5jaGFydEFjdGlvbnNcblx0XHRcdFx0PyB0aGlzLmdldFRvb2xiYXJBY3Rpb25zKHRoaXMuX2NoYXJ0Q29udGV4dCwgdGhpcy5jaGFydERlZmluaXRpb24uaXNJbnNpZ2h0c0VuYWJsZWQgPz8gZmFsc2UpXG5cdFx0XHRcdDogXCJcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gZmFsbGJhY2sgdG8gZGlzcGxheSBlbXB0eSBjaGFydFxuXHRcdFx0dGhpcy5hdXRvQmluZE9uSW5pdCA9IGZhbHNlO1xuXHRcdFx0dGhpcy52aXNpYmxlID0gXCJ0cnVlXCI7XG5cdFx0XHR0aGlzLm5hdmlnYXRpb25QYXRoID0gXCJcIjtcblx0XHRcdHRoaXMuX2FjdGlvbnMgPSBcIlwiO1xuXHRcdFx0dGhpcy5fY3VzdG9tRGF0YSA9IHtcblx0XHRcdFx0dGFyZ2V0Q29sbGVjdGlvblBhdGg6IFwiXCIsXG5cdFx0XHRcdGVudGl0eVNldDogXCJcIixcblx0XHRcdFx0ZW50aXR5VHlwZTogXCJcIixcblx0XHRcdFx0b3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBcIlwiLFxuXHRcdFx0XHRtdWx0aVNlbGVjdERpc2FibGVkQWN0aW9uczogXCJcIixcblx0XHRcdFx0c2VnbWVudGVkQnV0dG9uSWQ6IFwiXCIsXG5cdFx0XHRcdGN1c3RvbUFnZzogXCJcIixcblx0XHRcdFx0dHJhbnNBZ2c6IFwiXCIsXG5cdFx0XHRcdGFwcGx5U3VwcG9ydGVkOiBcIlwiLFxuXHRcdFx0XHR2aXpQcm9wZXJ0aWVzOiBcIlwiXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGNyZWF0ZUNoYXJ0RGVmaW5pdGlvbiA9IChcblx0XHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRcdGNvbnRleHRPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdGNvbnRyb2xQYXRoOiBzdHJpbmdcblx0KTogQ2hhcnRWaXN1YWxpemF0aW9uID0+IHtcblx0XHRsZXQgdmlzdWFsaXphdGlvblBhdGggPSBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKGNvbnRleHRPYmplY3RQYXRoKTtcblx0XHRpZiAodGhpcy5tZXRhUGF0aD8uZ2V0T2JqZWN0KCk/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5QcmVzZW50YXRpb25WYXJpYW50VHlwZSkge1xuXHRcdFx0Y29uc3QgdmlzdWFsaXphdGlvbnMgPSB0aGlzLm1ldGFQYXRoLmdldE9iamVjdCgpLlZpc3VhbGl6YXRpb25zO1xuXHRcdFx0dmlzdWFsaXphdGlvblBhdGggPSBDaGFydEJsb2NrLmNoZWNrQ2hhcnRWaXN1YWxpemF0aW9uUGF0aCh2aXN1YWxpemF0aW9ucywgdmlzdWFsaXphdGlvblBhdGgpO1xuXHRcdH1cblxuXHRcdC8vIGZhbGxiYWNrIHRvIGRlZmF1bHQgQ2hhcnQgaWYgdmlzdWFsaXphdGlvblBhdGggaXMgbWlzc2luZyBvciB2aXN1YWxpemF0aW9uUGF0aCBpcyBub3QgZm91bmQgaW4gY29udHJvbCAoaW4gY2FzZSBvZiBQcmVzZW50YXRpb25WYXJpYW50KVxuXHRcdGlmICghdmlzdWFsaXphdGlvblBhdGggfHwgY29udHJvbFBhdGguaW5kZXhPZih2aXN1YWxpemF0aW9uUGF0aCkgPT09IC0xKSB7XG5cdFx0XHR2aXN1YWxpemF0aW9uUGF0aCA9IGBAJHtVSUFubm90YXRpb25UZXJtcy5DaGFydH1gO1xuXHRcdH1cblxuXHRcdGNvbnN0IHZpc3VhbGl6YXRpb25EZWZpbml0aW9uID0gZ2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uKFxuXHRcdFx0dmlzdWFsaXphdGlvblBhdGgsXG5cdFx0XHR0aGlzLnVzZUNvbmRlbnNlZExheW91dCxcblx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHR0cnVlXG5cdFx0KTtcblx0XHRyZXR1cm4gdmlzdWFsaXphdGlvbkRlZmluaXRpb24udmlzdWFsaXphdGlvbnNbMF0gYXMgQ2hhcnRWaXN1YWxpemF0aW9uO1xuXHR9O1xuXG5cdHN0YXRpYyBjaGVja0NoYXJ0VmlzdWFsaXphdGlvblBhdGggPSAodmlzdWFsaXphdGlvbnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5bXSwgdmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCkgPT4ge1xuXHRcdHZpc3VhbGl6YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKHZpc3VhbGl6YXRpb246IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pIHtcblx0XHRcdGlmICh2aXN1YWxpemF0aW9uLiRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKGBAJHtVSUFubm90YXRpb25UZXJtcy5DaGFydH1gKSA+IC0xKSB7XG5cdFx0XHRcdHZpc3VhbGl6YXRpb25QYXRoID0gdmlzdWFsaXphdGlvbi4kQW5ub3RhdGlvblBhdGg7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHZpc3VhbGl6YXRpb25QYXRoO1xuXHR9O1xuXG5cdGdldENvbnRlbnRJZChtYWNyb0lkOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gYCR7bWFjcm9JZH0tY29udGVudGA7XG5cdH1cblxuXHRzdGF0aWMgZ2V0RXh0cmFQYXJhbXMocHJvcHM6IFByb3BlcnRpZXNPZjxDaGFydEJsb2NrPiwgdmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IGV4dHJhUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBvYmplY3Q+ID0ge307XG5cdFx0aWYgKHByb3BzLmFjdGlvbnMpIHtcblx0XHRcdE9iamVjdC52YWx1ZXMocHJvcHMuYWN0aW9ucyk/LmZvckVhY2goKGl0ZW0pID0+IHtcblx0XHRcdFx0cHJvcHMuYWN0aW9ucyA9IHsgLi4uKHByb3BzLmFjdGlvbnMgYXMgQWN0aW9uT3JBY3Rpb25Hcm91cCksIC4uLihpdGVtIGFzIEV4dGVuZGVkQWN0aW9uR3JvdXApLm1lbnVDb250ZW50QWN0aW9ucyB9O1xuXHRcdFx0XHRkZWxldGUgKGl0ZW0gYXMgRXh0ZW5kZWRBY3Rpb25Hcm91cCkubWVudUNvbnRlbnRBY3Rpb25zO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmICh2aXN1YWxpemF0aW9uUGF0aCkge1xuXHRcdFx0ZXh0cmFQYXJhbXNbdmlzdWFsaXphdGlvblBhdGhdID0ge1xuXHRcdFx0XHRhY3Rpb25zOiBwcm9wcy5hY3Rpb25zXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4gZXh0cmFQYXJhbXM7XG5cdH1cblxuXHRjcmVhdGVCaW5kaW5nQ29udGV4dCA9IGZ1bmN0aW9uIChkYXRhOiBvYmplY3QgfCBCYXNlQWN0aW9uW10gfCBDdXN0b21BY3Rpb24sIHNldHRpbmdzOiBhbnkpIHtcblx0XHRjb25zdCBjb250ZXh0UGF0aCA9IGAvJHt1aWQoKX1gO1xuXHRcdHNldHRpbmdzLm1vZGVscy5jb252ZXJ0ZXJDb250ZXh0LnNldFByb3BlcnR5KGNvbnRleHRQYXRoLCBkYXRhKTtcblx0XHRyZXR1cm4gc2V0dGluZ3MubW9kZWxzLmNvbnZlcnRlckNvbnRleHQuY3JlYXRlQmluZGluZ0NvbnRleHQoY29udGV4dFBhdGgpO1xuXHR9O1xuXG5cdGdldENoYXJ0TWVhc3VyZXMgPSAocHJvcHM6IGFueSwgYWdncmVnYXRpb25IZWxwZXI6IEFnZ3JlZ2F0aW9uSGVscGVyKTogQ29udGV4dCA9PiB7XG5cdFx0Y29uc3QgY2hhcnRBbm5vdGF0aW9uUGF0aCA9IHByb3BzLmNoYXJ0RGVmaW5pdGlvbi5hbm5vdGF0aW9uUGF0aC5zcGxpdChcIi9cIik7XG5cdFx0Ly8gdGhpcyBpcyByZXF1aXJlZCBiZWNhdXNlIGdldEFic29sdXRlUGF0aCBpbiBjb252ZXJ0ZXJDb250ZXh0IHJldHVybnMgXCIvU2FsZXNPcmRlck1hbmFnZS9fSXRlbS9fSXRlbS9AY29tLnNhcC52b2NhYnVsYXJpZXMudjEuQ2hhcnRcIiBhcyBhbm5vdGF0aW9uUGF0aFxuXHRcdGNvbnN0IGFubm90YXRpb25QYXRoID0gY2hhcnRBbm5vdGF0aW9uUGF0aFxuXHRcdFx0LmZpbHRlcihmdW5jdGlvbiAoaXRlbTogb2JqZWN0LCBwb3M6IG51bWJlcikge1xuXHRcdFx0XHRyZXR1cm4gY2hhcnRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKGl0ZW0pID09IHBvcztcblx0XHRcdH0pXG5cdFx0XHQudG9TdHJpbmcoKVxuXHRcdFx0LnJlcGxhY2VBbGwoXCIsXCIsIFwiL1wiKTtcblx0XHRjb25zdCBvQ2hhcnQgPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoXG5cdFx0XHR0aGlzLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoYW5ub3RhdGlvblBhdGgpLFxuXHRcdFx0dGhpcy5jb250ZXh0UGF0aFxuXHRcdCkudGFyZ2V0T2JqZWN0O1xuXHRcdGNvbnN0IGFnZ3JlZ2F0ZWRQcm9wZXJ0eSA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzKFwiQWdncmVnYXRlZFByb3BlcnR5XCIpO1xuXHRcdGxldCBtZWFzdXJlczogTWVhc3VyZVR5cGVbXSA9IFtdO1xuXHRcdGNvbnN0IGFubm9QYXRoID0gcHJvcHMubWV0YVBhdGguZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0QWdncmVnYXRlZFByb3BlcnRpZXMoXCJBZ2dyZWdhdGVkUHJvcGVydGllc1wiKTtcblx0XHRjb25zdCBjaGFydE1lYXN1cmVzID0gb0NoYXJ0Lk1lYXN1cmVzID8gb0NoYXJ0Lk1lYXN1cmVzIDogW107XG5cdFx0Y29uc3QgY2hhcnREeW5hbWljTWVhc3VyZXMgPSBvQ2hhcnQuRHluYW1pY01lYXN1cmVzID8gb0NoYXJ0LkR5bmFtaWNNZWFzdXJlcyA6IFtdO1xuXHRcdC8vY2hlY2sgaWYgdGhlcmUgYXJlIG1lYXN1cmVzIHBvaW50aW5nIHRvIGFnZ3JlZ2F0ZWRwcm9wZXJ0aWVzXG5cdFx0Y29uc3QgdHJhbnNBZ2dJbk1lYXN1cmVzID0gYWdncmVnYXRlZFByb3BlcnRpZXNbMF1cblx0XHRcdD8gYWdncmVnYXRlZFByb3BlcnRpZXNbMF0uZmlsdGVyKGZ1bmN0aW9uIChwcm9wZXJ0aWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGNoYXJ0TWVhc3VyZXMuc29tZShmdW5jdGlvbiAocHJvcGVydHlNZWFzdXJlVHlwZTogTWVhc3VyZVR5cGUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBwcm9wZXJ0aWVzLk5hbWUgPT09IHByb3BlcnR5TWVhc3VyZVR5cGUudmFsdWU7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHQgIH0pXG5cdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRjb25zdCBlbnRpdHlTZXRQYXRoID0gYW5ub1BhdGgucmVwbGFjZShcblx0XHRcdC9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuKENoYXJ0fFByZXNlbnRhdGlvblZhcmlhbnR8U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCkuKi8sXG5cdFx0XHRcIlwiXG5cdFx0KTtcblx0XHRjb25zdCB0cmFuc0FnZ3JlZ2F0aW9ucyA9IHByb3BzLmNoYXJ0RGVmaW5pdGlvbi50cmFuc0FnZztcblx0XHRjb25zdCBjdXN0b21BZ2dyZWdhdGlvbnMgPSBwcm9wcy5jaGFydERlZmluaXRpb24uY3VzdG9tQWdnO1xuXHRcdC8vIGludGltYXRlIHRoZSB1c2VyIGlmIHRoZXJlIGlzIEFnZ3JlZ2F0ZWRwcm9wZXJ0eSBjb25maWd1cmVkIHdpdGggbm8gRFluYW1pY01lYXN1cmVzLCBidSB0aGVyZSBhcmUgbWVhc3VyZXMgd2l0aCBBZ2dyZWdhdGVkUHJvcGVydGllc1xuXHRcdGlmIChhZ2dyZWdhdGVkUHJvcGVydHkubGVuZ3RoID4gMCAmJiAhY2hhcnREeW5hbWljTWVhc3VyZXMgJiYgdHJhbnNBZ2dJbk1lYXN1cmVzLmxlbmd0aCA+IDApIHtcblx0XHRcdExvZy53YXJuaW5nKFxuXHRcdFx0XHRcIlRoZSB0cmFuc2Zvcm1hdGlvbmFsIGFnZ3JlZ2F0ZSBtZWFzdXJlcyBhcmUgY29uZmlndXJlZCBhcyBDaGFydC5NZWFzdXJlcyBidXQgc2hvdWxkIGJlIGNvbmZpZ3VyZWQgYXMgQ2hhcnQuRHluYW1pY01lYXN1cmVzIGluc3RlYWQuIFBsZWFzZSBjaGVjayB0aGUgU0FQIEhlbHAgZG9jdW1lbnRhdGlvbiBhbmQgY29ycmVjdCB0aGUgY29uZmlndXJhdGlvbiBhY2NvcmRpbmdseS5cIlxuXHRcdFx0KTtcblx0XHR9XG5cdFx0Y29uc3QgaXNDdXN0b21BZ2dyZWdhdGVJc01lYXN1cmUgPSBjaGFydE1lYXN1cmVzLnNvbWUoKG9DaGFydE1lYXN1cmU6IE1lYXN1cmVUeXBlKSA9PiB7XG5cdFx0XHRjb25zdCBvQ3VzdG9tQWdnTWVhc3VyZSA9IHRoaXMuZ2V0Q3VzdG9tQWdnTWVhc3VyZShjdXN0b21BZ2dyZWdhdGlvbnMsIG9DaGFydE1lYXN1cmUpO1xuXHRcdFx0cmV0dXJuICEhb0N1c3RvbUFnZ01lYXN1cmU7XG5cdFx0fSk7XG5cdFx0aWYgKGFnZ3JlZ2F0ZWRQcm9wZXJ0eS5sZW5ndGggPiAwICYmICFjaGFydER5bmFtaWNNZWFzdXJlcz8ubGVuZ3RoICYmICFpc0N1c3RvbUFnZ3JlZ2F0ZUlzTWVhc3VyZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUGxlYXNlIGNvbmZpZ3VyZSBEeW5hbWljTWVhc3VyZXMgZm9yIHRoZSBjaGFydFwiKTtcblx0XHR9XG5cdFx0aWYgKGFnZ3JlZ2F0ZWRQcm9wZXJ0eS5sZW5ndGggPiAwKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGR5bmFtaWNNZWFzdXJlIG9mIGNoYXJ0RHluYW1pY01lYXN1cmVzKSB7XG5cdFx0XHRcdG1lYXN1cmVzID0gdGhpcy5nZXREeW5hbWljTWVhc3VyZXMobWVhc3VyZXMsIGR5bmFtaWNNZWFzdXJlLCBlbnRpdHlTZXRQYXRoLCBvQ2hhcnQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IGNoYXJ0TWVhc3VyZSBvZiBjaGFydE1lYXN1cmVzKSB7XG5cdFx0XHRjb25zdCBrZXkgPSBjaGFydE1lYXN1cmUudmFsdWU7XG5cdFx0XHRjb25zdCBjdXN0b21BZ2dNZWFzdXJlID0gdGhpcy5nZXRDdXN0b21BZ2dNZWFzdXJlKGN1c3RvbUFnZ3JlZ2F0aW9ucywgY2hhcnRNZWFzdXJlKTtcblx0XHRcdGNvbnN0IG1lYXN1cmVUeXBlOiBNZWFzdXJlVHlwZSA9IHt9O1xuXHRcdFx0aWYgKGN1c3RvbUFnZ01lYXN1cmUpIHtcblx0XHRcdFx0bWVhc3VyZXMgPSB0aGlzLnNldEN1c3RvbUFnZ01lYXN1cmUobWVhc3VyZXMsIG1lYXN1cmVUeXBlLCBjdXN0b21BZ2dNZWFzdXJlLCBrZXkpO1xuXHRcdFx0XHQvL2lmIHRoZXJlIGlzIG5laXRoZXIgYWdncmVnYXRlZFByb3BlcnR5IG5vciBtZWFzdXJlcyBwb2ludGluZyB0byBjdXN0b21BZ2dyZWdhdGVzLCBidXQgd2UgaGF2ZSBub3JtYWwgbWVhc3VyZXMuIE5vdyBjaGVjayBpZiB0aGVzZSBtZWFzdXJlcyBhcmUgcGFydCBvZiBBZ2dyZWdhdGVkUHJvcGVydGllcyBPYmpcblx0XHRcdH0gZWxzZSBpZiAoYWdncmVnYXRlZFByb3BlcnR5Lmxlbmd0aCA9PT0gMCAmJiB0cmFuc0FnZ3JlZ2F0aW9uc1trZXldKSB7XG5cdFx0XHRcdG1lYXN1cmVzID0gdGhpcy5zZXRUcmFuc0FnZ01lYXN1cmUobWVhc3VyZXMsIG1lYXN1cmVUeXBlLCB0cmFuc0FnZ3JlZ2F0aW9ucywga2V5KTtcblx0XHRcdH1cblx0XHRcdHRoaXMuc2V0Q2hhcnRNZWFzdXJlQXR0cmlidXRlcyh0aGlzLl9jaGFydC5NZWFzdXJlQXR0cmlidXRlcywgZW50aXR5U2V0UGF0aCwgbWVhc3VyZVR5cGUpO1xuXHRcdH1cblx0XHRjb25zdCBtZWFzdXJlc01vZGVsOiBKU09OTW9kZWwgPSBuZXcgSlNPTk1vZGVsKG1lYXN1cmVzKTtcblx0XHQobWVhc3VyZXNNb2RlbCBhcyBhbnkpLiQkdmFsdWVBc1Byb21pc2UgPSB0cnVlO1xuXHRcdHJldHVybiBtZWFzdXJlc01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSBhcyBDb250ZXh0O1xuXHR9O1xuXG5cdHNldEN1c3RvbUFnZ01lYXN1cmUgPSAobWVhc3VyZXM6IE1lYXN1cmVUeXBlW10sIG1lYXN1cmU6IE1lYXN1cmVUeXBlLCBjdXN0b21BZ2dNZWFzdXJlOiBNZWFzdXJlVHlwZSwga2V5OiBzdHJpbmcpID0+IHtcblx0XHRpZiAoa2V5LmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdExvZy5lcnJvcihgJGV4cGFuZCBpcyBub3QgeWV0IHN1cHBvcnRlZC4gTWVhc3VyZTogJHtrZXl9IGZyb20gYW4gYXNzb2NpYXRpb24gY2Fubm90IGJlIHVzZWRgKTtcblx0XHR9XG5cdFx0bWVhc3VyZS5rZXkgPSBjdXN0b21BZ2dNZWFzdXJlLnZhbHVlO1xuXHRcdG1lYXN1cmUucm9sZSA9IFwiYXhpczFcIjtcblx0XHRtZWFzdXJlLmxhYmVsID0gY3VzdG9tQWdnTWVhc3VyZS5sYWJlbDtcblx0XHRtZWFzdXJlLnByb3BlcnR5UGF0aCA9IGN1c3RvbUFnZ01lYXN1cmUudmFsdWU7XG5cdFx0bWVhc3VyZXMucHVzaChtZWFzdXJlKTtcblx0XHRyZXR1cm4gbWVhc3VyZXM7XG5cdH07XG5cblx0c2V0VHJhbnNBZ2dNZWFzdXJlID0gKG1lYXN1cmVzOiBNZWFzdXJlVHlwZVtdLCBtZWFzdXJlOiBNZWFzdXJlVHlwZSwgdHJhbnNBZ2dyZWdhdGlvbnM6IFJlY29yZDxzdHJpbmcsIE1lYXN1cmVUeXBlPiwga2V5OiBzdHJpbmcpID0+IHtcblx0XHRjb25zdCB0cmFuc0FnZ01lYXN1cmUgPSB0cmFuc0FnZ3JlZ2F0aW9uc1trZXldO1xuXHRcdG1lYXN1cmUua2V5ID0gdHJhbnNBZ2dNZWFzdXJlLm5hbWU7XG5cdFx0bWVhc3VyZS5yb2xlID0gXCJheGlzMVwiO1xuXHRcdG1lYXN1cmUucHJvcGVydHlQYXRoID0ga2V5O1xuXHRcdG1lYXN1cmUuYWdncmVnYXRpb25NZXRob2QgPSB0cmFuc0FnZ01lYXN1cmUuYWdncmVnYXRpb25NZXRob2Q7XG5cdFx0bWVhc3VyZS5sYWJlbCA9IHRyYW5zQWdnTWVhc3VyZS5sYWJlbCB8fCBtZWFzdXJlLmxhYmVsO1xuXHRcdG1lYXN1cmVzLnB1c2gobWVhc3VyZSk7XG5cdFx0cmV0dXJuIG1lYXN1cmVzO1xuXHR9O1xuXG5cdGdldER5bmFtaWNNZWFzdXJlcyA9IChcblx0XHRtZWFzdXJlczogTWVhc3VyZVR5cGVbXSxcblx0XHRjaGFydER5bmFtaWNNZWFzdXJlOiBNZWFzdXJlVHlwZSxcblx0XHRlbnRpdHlTZXRQYXRoOiBzdHJpbmcsXG5cdFx0Y2hhcnQ6IENoYXJ0XG5cdCk6IE1lYXN1cmVUeXBlW10gPT4ge1xuXHRcdGNvbnN0IGtleSA9IGNoYXJ0RHluYW1pY01lYXN1cmUudmFsdWUgfHwgXCJcIjtcblx0XHRjb25zdCBhZ2dyZWdhdGVkUHJvcGVydHkgPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoXG5cdFx0XHR0aGlzLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoZW50aXR5U2V0UGF0aCArIGtleSksXG5cdFx0XHR0aGlzLmNvbnRleHRQYXRoXG5cdFx0KS50YXJnZXRPYmplY3Q7XG5cdFx0aWYgKGtleS5pbmRleE9mKFwiL1wiKSA+IC0xKSB7XG5cdFx0XHRMb2cuZXJyb3IoYCRleHBhbmQgaXMgbm90IHlldCBzdXBwb3J0ZWQuIE1lYXN1cmU6ICR7a2V5fSBmcm9tIGFuIGFzc29jaWF0aW9uIGNhbm5vdCBiZSB1c2VkYCk7XG5cdFx0XHQvLyBjaGVjayBpZiB0aGUgYW5ub3RhdGlvbiBwYXRoIGlzIHdyb25nXG5cdFx0fSBlbHNlIGlmICghYWdncmVnYXRlZFByb3BlcnR5KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFBsZWFzZSBwcm92aWRlIHRoZSByaWdodCBBbm5vdGF0aW9uUGF0aCB0byB0aGUgRHluYW1pYyBNZWFzdXJlICR7Y2hhcnREeW5hbWljTWVhc3VyZS52YWx1ZX1gKTtcblx0XHRcdC8vIGNoZWNrIGlmIHRoZSBwYXRoIHN0YXJ0cyB3aXRoIEBcblx0XHR9IGVsc2UgaWYgKGNoYXJ0RHluYW1pY01lYXN1cmUudmFsdWU/LnN0YXJ0c1dpdGgoYEAke0FuYWx5dGljc0Fubm90YXRpb25UZXJtcy5BZ2dyZWdhdGVkUHJvcGVydHl9YCkgPT09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgUGxlYXNlIHByb3ZpZGUgdGhlIHJpZ2h0IEFubm90YXRpb25QYXRoIHRvIHRoZSBEeW5hbWljIE1lYXN1cmUgJHtjaGFydER5bmFtaWNNZWFzdXJlLnZhbHVlfWApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBjaGVjayBpZiBBZ2dyZWdhdGVkUHJvcGVydHkgaXMgZGVmaW5lZCBpbiBnaXZlbiBEeW5hbWljTWVhc3VyZVxuXHRcdFx0Y29uc3QgZHluYW1pY01lYXN1cmU6IE1lYXN1cmVUeXBlID0ge1xuXHRcdFx0XHRrZXk6IGFnZ3JlZ2F0ZWRQcm9wZXJ0eS5OYW1lLFxuXHRcdFx0XHRyb2xlOiBcImF4aXMxXCJcblx0XHRcdH07XG5cdFx0XHRkeW5hbWljTWVhc3VyZS5wcm9wZXJ0eVBhdGggPSBhZ2dyZWdhdGVkUHJvcGVydHkuQWdncmVnYXRhYmxlUHJvcGVydHkudmFsdWU7XG5cdFx0XHRkeW5hbWljTWVhc3VyZS5hZ2dyZWdhdGlvbk1ldGhvZCA9IGFnZ3JlZ2F0ZWRQcm9wZXJ0eS5BZ2dyZWdhdGlvbk1ldGhvZDtcblx0XHRcdGR5bmFtaWNNZWFzdXJlLmxhYmVsID0gcmVzb2x2ZUJpbmRpbmdTdHJpbmcoXG5cdFx0XHRcdGFnZ3JlZ2F0ZWRQcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db21tb24/LkxhYmVsIHx8XG5cdFx0XHRcdFx0Z2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKFxuXHRcdFx0XHRcdFx0dGhpcy5tZXRhUGF0aFxuXHRcdFx0XHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdFx0XHQuY3JlYXRlQmluZGluZ0NvbnRleHQoZW50aXR5U2V0UGF0aCArIGR5bmFtaWNNZWFzdXJlLnByb3BlcnR5UGF0aCArIGBAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuTGFiZWx9YCkhLFxuXHRcdFx0XHRcdFx0dGhpcy5jb250ZXh0UGF0aFxuXHRcdFx0XHRcdCkudGFyZ2V0T2JqZWN0XG5cdFx0XHQpO1xuXHRcdFx0dGhpcy5zZXRDaGFydE1lYXN1cmVBdHRyaWJ1dGVzKGNoYXJ0Lk1lYXN1cmVBdHRyaWJ1dGVzLCBlbnRpdHlTZXRQYXRoLCBkeW5hbWljTWVhc3VyZSk7XG5cdFx0XHRtZWFzdXJlcy5wdXNoKGR5bmFtaWNNZWFzdXJlKTtcblx0XHR9XG5cdFx0cmV0dXJuIG1lYXN1cmVzO1xuXHR9O1xuXG5cdGdldEN1c3RvbUFnZ01lYXN1cmUgPSAoY3VzdG9tQWdncmVnYXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBNZWFzdXJlVHlwZSB8IHVuZGVmaW5lZD4sIG1lYXN1cmU6IE1lYXN1cmVUeXBlKSA9PiB7XG5cdFx0aWYgKG1lYXN1cmUudmFsdWUgJiYgY3VzdG9tQWdncmVnYXRpb25zW21lYXN1cmUudmFsdWVdKSB7XG5cdFx0XHRtZWFzdXJlLmxhYmVsID0gY3VzdG9tQWdncmVnYXRpb25zW21lYXN1cmUudmFsdWVdPy5sYWJlbDtcblx0XHRcdHJldHVybiBtZWFzdXJlO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fTtcblxuXHRzZXRDaGFydE1lYXN1cmVBdHRyaWJ1dGVzID0gKG1lYXN1cmVBdHRyaWJ1dGVzOiBDaGFydE1lYXN1cmVBdHRyaWJ1dGVUeXBlW10sIGVudGl0eVNldFBhdGg6IHN0cmluZywgbWVhc3VyZTogTWVhc3VyZVR5cGUpID0+IHtcblx0XHRpZiAobWVhc3VyZUF0dHJpYnV0ZXM/Lmxlbmd0aCkge1xuXHRcdFx0Zm9yIChjb25zdCBtZWFzdXJlQXR0cmlidXRlIG9mIG1lYXN1cmVBdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdHRoaXMuX3NldENoYXJ0TWVhc3VyZUF0dHJpYnV0ZShtZWFzdXJlQXR0cmlidXRlLCBlbnRpdHlTZXRQYXRoLCBtZWFzdXJlKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0X3NldENoYXJ0TWVhc3VyZUF0dHJpYnV0ZSA9IChtZWFzdXJlQXR0cmlidXRlOiBDaGFydE1lYXN1cmVBdHRyaWJ1dGVUeXBlLCBlbnRpdHlTZXRQYXRoOiBzdHJpbmcsIG1lYXN1cmU6IE1lYXN1cmVUeXBlKSA9PiB7XG5cdFx0Y29uc3QgcGF0aCA9IG1lYXN1cmVBdHRyaWJ1dGUuRHluYW1pY01lYXN1cmUgPyBtZWFzdXJlQXR0cmlidXRlPy5EeW5hbWljTWVhc3VyZT8udmFsdWUgOiBtZWFzdXJlQXR0cmlidXRlPy5NZWFzdXJlPy52YWx1ZTtcblx0XHRjb25zdCBtZWFzdXJlQXR0cmlidXRlRGF0YVBvaW50ID0gbWVhc3VyZUF0dHJpYnV0ZS5EYXRhUG9pbnQgPyBtZWFzdXJlQXR0cmlidXRlPy5EYXRhUG9pbnQ/LnZhbHVlIDogbnVsbDtcblx0XHRjb25zdCByb2xlID0gbWVhc3VyZUF0dHJpYnV0ZS5Sb2xlO1xuXHRcdGNvbnN0IGRhdGFQb2ludCA9XG5cdFx0XHRtZWFzdXJlQXR0cmlidXRlRGF0YVBvaW50ICYmXG5cdFx0XHRnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoXG5cdFx0XHRcdHRoaXMubWV0YVBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChlbnRpdHlTZXRQYXRoICsgbWVhc3VyZUF0dHJpYnV0ZURhdGFQb2ludCksXG5cdFx0XHRcdHRoaXMuY29udGV4dFBhdGhcblx0XHRcdCkudGFyZ2V0T2JqZWN0O1xuXHRcdGlmIChtZWFzdXJlLmtleSA9PT0gcGF0aCkge1xuXHRcdFx0dGhpcy5zZXRNZWFzdXJlUm9sZShtZWFzdXJlLCByb2xlKTtcblx0XHRcdC8vc3RpbGwgdG8gYWRkIGRhdGEgcG9pbnQsIGJ1dCBVSTUgQ2hhcnQgQVBJIGlzIG1pc3Npbmdcblx0XHRcdHRoaXMuc2V0TWVhc3VyZURhdGFQb2ludChtZWFzdXJlLCBkYXRhUG9pbnQpO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogRm9ybWF0IHRoZSBkYXRhIHBvaW50IGFzIGEgSlNPTiBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRGF0YVBvaW50QW5ub1xuXHQgKiBAcmV0dXJucyBUaGUgZm9ybWF0dGVkIGpzb24gb2JqZWN0XG5cdCAqL1xuXHRjcmVhdGVEYXRhUG9pbnRQcm9wZXJ0eShvRGF0YVBvaW50QW5ubzogYW55KSB7XG5cdFx0Y29uc3Qgb0RhdGFQb2ludDogYW55ID0ge307XG5cblx0XHRpZiAob0RhdGFQb2ludEFubm8uVGFyZ2V0VmFsdWUpIHtcblx0XHRcdG9EYXRhUG9pbnQudGFyZ2V0VmFsdWUgPSBvRGF0YVBvaW50QW5uby5UYXJnZXRWYWx1ZS4kUGF0aDtcblx0XHR9XG5cblx0XHRpZiAob0RhdGFQb2ludEFubm8uRm9yZUNhc3RWYWx1ZSkge1xuXHRcdFx0b0RhdGFQb2ludC5mb3JlQ2FzdFZhbHVlID0gb0RhdGFQb2ludEFubm8uRm9yZUNhc3RWYWx1ZS4kUGF0aDtcblx0XHR9XG5cblx0XHRsZXQgb0NyaXRpY2FsaXR5ID0gbnVsbDtcblx0XHRpZiAob0RhdGFQb2ludEFubm8uQ3JpdGljYWxpdHkpIHtcblx0XHRcdGlmIChvRGF0YVBvaW50QW5uby5Dcml0aWNhbGl0eS4kUGF0aCkge1xuXHRcdFx0XHQvL3dpbGwgYmUgYW4gYWdncmVnYXRlZCBwcm9wZXJ0eSBvciBjdXN0b20gYWdncmVnYXRlXG5cdFx0XHRcdG9Dcml0aWNhbGl0eSA9IHtcblx0XHRcdFx0XHRDYWxjdWxhdGVkOiBvRGF0YVBvaW50QW5uby5Dcml0aWNhbGl0eS4kUGF0aFxuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b0NyaXRpY2FsaXR5ID0ge1xuXHRcdFx0XHRcdFN0YXRpYzogb0RhdGFQb2ludEFubm8uQ3JpdGljYWxpdHkuJEVudW1NZW1iZXIucmVwbGFjZShcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5VHlwZS9cIiwgXCJcIilcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKG9EYXRhUG9pbnRBbm5vLkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24pIHtcblx0XHRcdGNvbnN0IG9UaHJlc2hvbGRzID0ge307XG5cdFx0XHRjb25zdCBiQ29uc3RhbnQgPSB0aGlzLmJ1aWxkVGhyZXNob2xkcyhvVGhyZXNob2xkcywgb0RhdGFQb2ludEFubm8uQ3JpdGljYWxpdHlDYWxjdWxhdGlvbik7XG5cblx0XHRcdGlmIChiQ29uc3RhbnQpIHtcblx0XHRcdFx0b0NyaXRpY2FsaXR5ID0ge1xuXHRcdFx0XHRcdENvbnN0YW50VGhyZXNob2xkczogb1RocmVzaG9sZHNcblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9Dcml0aWNhbGl0eSA9IHtcblx0XHRcdFx0XHREeW5hbWljVGhyZXNob2xkczogb1RocmVzaG9sZHNcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAob0NyaXRpY2FsaXR5KSB7XG5cdFx0XHRvRGF0YVBvaW50LmNyaXRpY2FsaXR5ID0gb0NyaXRpY2FsaXR5O1xuXHRcdH1cblxuXHRcdHJldHVybiBvRGF0YVBvaW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSB0aHJlc2hvbGRzIGFyZSBkeW5hbWljIG9yIGNvbnN0YW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RocmVzaG9sZHMgVGhlIHRocmVzaG9sZCBza2VsZXRvblxuXHQgKiBAcGFyYW0gb0NyaXRpY2FsaXR5Q2FsY3VsYXRpb24gVGhlIFVJLkRhdGFQb2ludC5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uIGFubm90YXRpb25cblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSB0aHJlc2hvbGQgc2hvdWxkIGJlIHN1cHBsaWVkIGFzIENvbnN0YW50VGhyZXNob2xkcywgPGNvZGU+ZmFsc2U8L2NvZGU+IGlmIHRoZSB0aHJlc2hvbGQgc2hvdWxkXG5cdCAqIGJlIHN1cHBsaWVkIGFzIER5bmFtaWNUaHJlc2hvbGRzXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRidWlsZFRocmVzaG9sZHMob1RocmVzaG9sZHM6IGFueSwgb0NyaXRpY2FsaXR5Q2FsY3VsYXRpb246IGFueSkge1xuXHRcdGNvbnN0IGFLZXlzID0gW1xuXHRcdFx0XCJBY2NlcHRhbmNlUmFuZ2VMb3dWYWx1ZVwiLFxuXHRcdFx0XCJBY2NlcHRhbmNlUmFuZ2VIaWdoVmFsdWVcIixcblx0XHRcdFwiVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZVwiLFxuXHRcdFx0XCJUb2xlcmFuY2VSYW5nZUhpZ2hWYWx1ZVwiLFxuXHRcdFx0XCJEZXZpYXRpb25SYW5nZUxvd1ZhbHVlXCIsXG5cdFx0XHRcIkRldmlhdGlvblJhbmdlSGlnaFZhbHVlXCJcblx0XHRdO1xuXHRcdGxldCBiQ29uc3RhbnQgPSB0cnVlLFxuXHRcdFx0c0tleSxcblx0XHRcdGksXG5cdFx0XHRqO1xuXG5cdFx0b1RocmVzaG9sZHMuSW1wcm92ZW1lbnREaXJlY3Rpb24gPSBvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5JbXByb3ZlbWVudERpcmVjdGlvbi4kRW51bU1lbWJlci5yZXBsYWNlKFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXByb3ZlbWVudERpcmVjdGlvblR5cGUvXCIsXG5cdFx0XHRcIlwiXG5cdFx0KTtcblxuXHRcdGNvbnN0IG9EeW5hbWljVGhyZXNob2xkczogYW55ID0ge1xuXHRcdFx0b25lU3VwcGxpZWQ6IGZhbHNlLFxuXHRcdFx0dXNlZE1lYXN1cmVzOiBbXVxuXHRcdFx0Ly8gY29tYmluYXRpb24gdG8gY2hlY2sgd2hldGhlciBhdCBsZWFzdCBvbmUgaXMgc3VwcGxpZWRcblx0XHR9O1xuXHRcdGNvbnN0IG9Db25zdGFudFRocmVzaG9sZHM6IGFueSA9IHtcblx0XHRcdG9uZVN1cHBsaWVkOiBmYWxzZVxuXHRcdFx0Ly8gY29tYmluYXRpb24gdG8gY2hlY2sgd2hldGhlciBhdCBsZWFzdCBvbmUgaXMgc3VwcGxpZWRcblx0XHR9O1xuXG5cdFx0Zm9yIChpID0gMDsgaSA8IGFLZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRzS2V5ID0gYUtleXNbaV07XG5cdFx0XHRvRHluYW1pY1RocmVzaG9sZHNbc0tleV0gPSBvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbltzS2V5XSA/IG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uW3NLZXldLiRQYXRoIDogdW5kZWZpbmVkO1xuXHRcdFx0b0R5bmFtaWNUaHJlc2hvbGRzLm9uZVN1cHBsaWVkID0gb0R5bmFtaWNUaHJlc2hvbGRzLm9uZVN1cHBsaWVkIHx8IG9EeW5hbWljVGhyZXNob2xkc1tzS2V5XTtcblxuXHRcdFx0aWYgKCFvRHluYW1pY1RocmVzaG9sZHMub25lU3VwcGxpZWQpIHtcblx0XHRcdFx0Ly8gb25seSBjb25zaWRlciBpbiBjYXNlIG5vIGR5bmFtaWMgdGhyZXNob2xkIGlzIHN1cHBsaWVkXG5cdFx0XHRcdG9Db25zdGFudFRocmVzaG9sZHNbc0tleV0gPSBvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbltzS2V5XTtcblx0XHRcdFx0b0NvbnN0YW50VGhyZXNob2xkcy5vbmVTdXBwbGllZCA9IG9Db25zdGFudFRocmVzaG9sZHMub25lU3VwcGxpZWQgfHwgb0NvbnN0YW50VGhyZXNob2xkc1tzS2V5XTtcblx0XHRcdH0gZWxzZSBpZiAob0R5bmFtaWNUaHJlc2hvbGRzW3NLZXldKSB7XG5cdFx0XHRcdG9EeW5hbWljVGhyZXNob2xkcy51c2VkTWVhc3VyZXMucHVzaChvRHluYW1pY1RocmVzaG9sZHNbc0tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGR5bmFtaWMgZGVmaW5pdGlvbiBzaGFsbCBvdmVycnVsZSBjb25zdGFudCBkZWZpbml0aW9uXG5cdFx0aWYgKG9EeW5hbWljVGhyZXNob2xkcy5vbmVTdXBwbGllZCkge1xuXHRcdFx0YkNvbnN0YW50ID0gZmFsc2U7XG5cblx0XHRcdGZvciAoaSA9IDA7IGkgPCBhS2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAob0R5bmFtaWNUaHJlc2hvbGRzW2FLZXlzW2ldXSkge1xuXHRcdFx0XHRcdG9UaHJlc2hvbGRzW2FLZXlzW2ldXSA9IG9EeW5hbWljVGhyZXNob2xkc1thS2V5c1tpXV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG9UaHJlc2hvbGRzLnVzZWRNZWFzdXJlcyA9IG9EeW5hbWljVGhyZXNob2xkcy51c2VkTWVhc3VyZXM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBvQWdncmVnYXRpb25MZXZlbDogYW55O1xuXHRcdFx0b1RocmVzaG9sZHMuQWdncmVnYXRpb25MZXZlbHMgPSBbXTtcblxuXHRcdFx0Ly8gY2hlY2sgaWYgYXQgbGVhc3Qgb25lIHN0YXRpYyB2YWx1ZSBpcyBzdXBwbGllZFxuXHRcdFx0aWYgKG9Db25zdGFudFRocmVzaG9sZHMub25lU3VwcGxpZWQpIHtcblx0XHRcdFx0Ly8gYWRkIG9uZSBlbnRyeSBpbiB0aGUgYWdncmVnYXRpb24gbGV2ZWxcblx0XHRcdFx0b0FnZ3JlZ2F0aW9uTGV2ZWwgPSB7XG5cdFx0XHRcdFx0VmlzaWJsZURpbWVuc2lvbnM6IG51bGxcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgYUtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRpZiAob0NvbnN0YW50VGhyZXNob2xkc1thS2V5c1tpXV0pIHtcblx0XHRcdFx0XHRcdG9BZ2dyZWdhdGlvbkxldmVsW2FLZXlzW2ldXSA9IG9Db25zdGFudFRocmVzaG9sZHNbYUtleXNbaV1dO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdG9UaHJlc2hvbGRzLkFnZ3JlZ2F0aW9uTGV2ZWxzLnB1c2gob0FnZ3JlZ2F0aW9uTGV2ZWwpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBmdXJ0aGVyIGNoZWNrIGZvciBDb25zdGFudFRocmVzaG9sZHNcblx0XHRcdGlmIChvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5Db25zdGFudFRocmVzaG9sZHMgJiYgb0NyaXRpY2FsaXR5Q2FsY3VsYXRpb24uQ29uc3RhbnRUaHJlc2hvbGRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLkNvbnN0YW50VGhyZXNob2xkcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGNvbnN0IG9BZ2dyZWdhdGlvbkxldmVsSW5mbyA9IG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLkNvbnN0YW50VGhyZXNob2xkc1tpXTtcblxuXHRcdFx0XHRcdGNvbnN0IGFWaXNpYmxlRGltZW5zaW9uczogYW55ID0gb0FnZ3JlZ2F0aW9uTGV2ZWxJbmZvLkFnZ3JlZ2F0aW9uTGV2ZWwgPyBbXSA6IG51bGw7XG5cblx0XHRcdFx0XHRpZiAob0FnZ3JlZ2F0aW9uTGV2ZWxJbmZvLkFnZ3JlZ2F0aW9uTGV2ZWwgJiYgb0FnZ3JlZ2F0aW9uTGV2ZWxJbmZvLkFnZ3JlZ2F0aW9uTGV2ZWwubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0Zm9yIChqID0gMDsgaiA8IG9BZ2dyZWdhdGlvbkxldmVsSW5mby5BZ2dyZWdhdGlvbkxldmVsLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0XHRcdGFWaXNpYmxlRGltZW5zaW9ucy5wdXNoKG9BZ2dyZWdhdGlvbkxldmVsSW5mby5BZ2dyZWdhdGlvbkxldmVsW2pdLiRQcm9wZXJ0eVBhdGgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG9BZ2dyZWdhdGlvbkxldmVsID0ge1xuXHRcdFx0XHRcdFx0VmlzaWJsZURpbWVuc2lvbnM6IGFWaXNpYmxlRGltZW5zaW9uc1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRmb3IgKGogPSAwOyBqIDwgYUtleXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcdGNvbnN0IG5WYWx1ZSA9IG9BZ2dyZWdhdGlvbkxldmVsSW5mb1thS2V5c1tqXV07XG5cdFx0XHRcdFx0XHRpZiAoblZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdG9BZ2dyZWdhdGlvbkxldmVsW2FLZXlzW2pdXSA9IG5WYWx1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvVGhyZXNob2xkcy5BZ2dyZWdhdGlvbkxldmVscy5wdXNoKG9BZ2dyZWdhdGlvbkxldmVsKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBiQ29uc3RhbnQ7XG5cdH1cblxuXHRzZXRNZWFzdXJlRGF0YVBvaW50ID0gKG1lYXN1cmU6IE1lYXN1cmVUeXBlLCBkYXRhUG9pbnQ6IERhdGFQb2ludCB8IHVuZGVmaW5lZCkgPT4ge1xuXHRcdGlmIChkYXRhUG9pbnQgJiYgZGF0YVBvaW50LlZhbHVlLiRQYXRoID09IG1lYXN1cmUua2V5KSB7XG5cdFx0XHRtZWFzdXJlLmRhdGFQb2ludCA9IENoYXJ0SGVscGVyLmZvcm1hdEpTT05Ub1N0cmluZyh0aGlzLmNyZWF0ZURhdGFQb2ludFByb3BlcnR5KGRhdGFQb2ludCkpIHx8IFwiXCI7XG5cdFx0fVxuXHR9O1xuXG5cdHNldE1lYXN1cmVSb2xlID0gKG1lYXN1cmU6IE1lYXN1cmVUeXBlLCByb2xlOiBDaGFydE1lYXN1cmVSb2xlVHlwZSB8IHVuZGVmaW5lZCkgPT4ge1xuXHRcdGlmIChyb2xlKSB7XG5cdFx0XHRjb25zdCBpbmRleCA9IChyb2xlIGFzIGFueSkuJEVudW1NZW1iZXI7XG5cdFx0XHRtZWFzdXJlLnJvbGUgPSBtZWFzdXJlUm9sZVtpbmRleF07XG5cdFx0fVxuXHR9O1xuXG5cdGdldERlcGVuZGVudHMgPSAoY2hhcnRDb250ZXh0OiBDb250ZXh0KSA9PiB7XG5cdFx0aWYgKHRoaXMuX2NvbW1hbmRBY3Rpb25zLmxlbmd0aCA+IDApIHtcblx0XHRcdHJldHVybiB0aGlzLl9jb21tYW5kQWN0aW9ucy5tYXAoKGNvbW1hbmRBY3Rpb246IENvbW1hbmRBY3Rpb24pID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0QWN0aW9uQ29tbWFuZChjb21tYW5kQWN0aW9uLCBjaGFydENvbnRleHQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBcIlwiO1xuXHR9O1xuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gb1Byb3BzIFNwZWNpZmllcyB0aGUgY2hhcnQgcHJvcGVydGllc1xuXHQgKi9cblx0Y2hlY2tQZXJzb25hbGl6YXRpb25JbkNoYXJ0UHJvcGVydGllcyA9IChvUHJvcHM6IGFueSkgPT4ge1xuXHRcdGlmIChvUHJvcHMucGVyc29uYWxpemF0aW9uKSB7XG5cdFx0XHRpZiAob1Byb3BzLnBlcnNvbmFsaXphdGlvbiA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHRcdHRoaXMucGVyc29uYWxpemF0aW9uID0gdW5kZWZpbmVkO1xuXHRcdFx0fSBlbHNlIGlmIChvUHJvcHMucGVyc29uYWxpemF0aW9uID09PSBcInRydWVcIikge1xuXHRcdFx0XHR0aGlzLnBlcnNvbmFsaXphdGlvbiA9IE9iamVjdC52YWx1ZXMocGVyc29uYWxpemF0aW9uVmFsdWVzKS5qb2luKFwiLFwiKTtcblx0XHRcdH0gZWxzZSBpZiAodGhpcy52ZXJpZnlWYWxpZFBlcnNvbmxpemF0aW9uKG9Qcm9wcy5wZXJzb25hbGl6YXRpb24pID09PSB0cnVlKSB7XG5cdFx0XHRcdHRoaXMucGVyc29uYWxpemF0aW9uID0gb1Byb3BzLnBlcnNvbmFsaXphdGlvbjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGVyc29uYWxpemF0aW9uID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIHBlcnNvbmFsaXphdGlvblxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgb3IgYGZhbHNlYCBpZiB0aGUgcGVyc29uYWxpemF0aW9uIGlzIHZhbGlkIG9yIG5vdCB2YWxpZFxuXHQgKi9cblx0dmVyaWZ5VmFsaWRQZXJzb25saXphdGlvbiA9IChwZXJzb25hbGl6YXRpb246IFN0cmluZykgPT4ge1xuXHRcdGxldCB2YWxpZDogQm9vbGVhbiA9IHRydWU7XG5cdFx0Y29uc3Qgc3BsaXRBcnJheSA9IHBlcnNvbmFsaXphdGlvbi5zcGxpdChcIixcIik7XG5cdFx0Y29uc3QgYWNjZXB0ZWRWYWx1ZXM6IHN0cmluZ1tdID0gT2JqZWN0LnZhbHVlcyhwZXJzb25hbGl6YXRpb25WYWx1ZXMpO1xuXHRcdHNwbGl0QXJyYXkuZm9yRWFjaCgoYXJyYXlFbGVtZW50KSA9PiB7XG5cdFx0XHRpZiAoIWFjY2VwdGVkVmFsdWVzLmluY2x1ZGVzKGFycmF5RWxlbWVudCkpIHtcblx0XHRcdFx0dmFsaWQgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gdmFsaWQ7XG5cdH07XG5cblx0Z2V0VmFyaWFudE1hbmFnZW1lbnQgPSAob1Byb3BzOiBhbnksIG9DaGFydERlZmluaXRpb246IENoYXJ0VmlzdWFsaXphdGlvbikgPT4ge1xuXHRcdGxldCB2YXJpYW50TWFuYWdlbWVudCA9IG9Qcm9wcy52YXJpYW50TWFuYWdlbWVudCA/IG9Qcm9wcy52YXJpYW50TWFuYWdlbWVudCA6IG9DaGFydERlZmluaXRpb24udmFyaWFudE1hbmFnZW1lbnQ7XG5cdFx0dmFyaWFudE1hbmFnZW1lbnQgPSB0aGlzLnBlcnNvbmFsaXphdGlvbiA9PT0gdW5kZWZpbmVkID8gXCJOb25lXCIgOiB2YXJpYW50TWFuYWdlbWVudDtcblx0XHRyZXR1cm4gdmFyaWFudE1hbmFnZW1lbnQ7XG5cdH07XG5cblx0Y3JlYXRlVmFyaWFudE1hbmFnZW1lbnQgPSAoKSA9PiB7XG5cdFx0Y29uc3QgcGVyc29uYWxpemF0aW9uID0gdGhpcy5wZXJzb25hbGl6YXRpb247XG5cdFx0aWYgKHBlcnNvbmFsaXphdGlvbikge1xuXHRcdFx0Y29uc3QgdmFyaWFudE1hbmFnZW1lbnQgPSB0aGlzLnZhcmlhbnRNYW5hZ2VtZW50O1xuXHRcdFx0aWYgKHZhcmlhbnRNYW5hZ2VtZW50ID09PSBcIkNvbnRyb2xcIikge1xuXHRcdFx0XHRyZXR1cm4geG1sYFxuXHRcdFx0XHRcdDxtZGM6dmFyaWFudD5cblx0XHRcdFx0XHQ8dmFyaWFudDpWYXJpYW50TWFuYWdlbWVudFxuXHRcdFx0XHRcdFx0aWQ9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIlZNXCJdKX1cIlxuXHRcdFx0XHRcdFx0Zm9yPVwiJHt0aGlzLmlkfVwiXG5cdFx0XHRcdFx0XHRzaG93U2V0QXNEZWZhdWx0PVwiJHt0cnVlfVwiXG5cdFx0XHRcdFx0XHRzZWxlY3Q9XCIke3RoaXMudmFyaWFudFNlbGVjdGVkfVwiXG5cdFx0XHRcdFx0XHRoZWFkZXJMZXZlbD1cIiR7dGhpcy5oZWFkZXJMZXZlbH1cIlxuXHRcdFx0XHRcdFx0c2F2ZT1cIiR7dGhpcy52YXJpYW50U2F2ZWR9XCJcblx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDwvbWRjOnZhcmlhbnQ+XG5cdFx0XHRgO1xuXHRcdFx0fSBlbHNlIGlmICh2YXJpYW50TWFuYWdlbWVudCA9PT0gXCJOb25lXCIgfHwgdmFyaWFudE1hbmFnZW1lbnQgPT09IFwiUGFnZVwiKSB7XG5cdFx0XHRcdHJldHVybiBcIlwiO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoIXBlcnNvbmFsaXphdGlvbikge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJWYXJpYW50IE1hbmFnZW1lbnQgY2Fubm90IGJlIGVuYWJsZWQgd2hlbiBwZXJzb25hbGl6YXRpb24gaXMgZGlzYWJsZWRcIik7XG5cdFx0fVxuXHRcdHJldHVybiBcIlwiO1xuXHR9O1xuXG5cdGdldFBlcnNpc3RlbmNlUHJvdmlkZXIgPSAoKSA9PiB7XG5cdFx0aWYgKHRoaXMudmFyaWFudE1hbmFnZW1lbnQgPT09IFwiTm9uZVwiKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxwMTNuOlBlcnNpc3RlbmNlUHJvdmlkZXIgaWQ9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIlBlcnNpc3RlbmNlUHJvdmlkZXJcIl0pfVwiIGZvcj1cIiR7dGhpcy5pZH1cIi8+YDtcblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH07XG5cblx0cHVzaEFjdGlvbkNvbW1hbmQgPSAoXG5cdFx0YWN0aW9uQ29udGV4dDogQ29udGV4dCxcblx0XHRkYXRhRmllbGQ6IERhdGFGaWVsZEZvckFjdGlvbiB8IHVuZGVmaW5lZCxcblx0XHRjaGFydE9wZXJhdGlvbkF2YWlsYWJsZU1hcDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRcdGFjdGlvbjogQmFzZUFjdGlvbiB8IEN1c3RvbUFjdGlvblxuXHQpID0+IHtcblx0XHRpZiAoZGF0YUZpZWxkKSB7XG5cdFx0XHRjb25zdCBjb21tYW5kQWN0aW9uID0ge1xuXHRcdFx0XHRhY3Rpb25Db250ZXh0OiBhY3Rpb25Db250ZXh0LFxuXHRcdFx0XHRvbkV4ZWN1dGVBY3Rpb246IENoYXJ0SGVscGVyLmdldFByZXNzRXZlbnRGb3JEYXRhRmllbGRGb3JBY3Rpb25CdXR0b24oXG5cdFx0XHRcdFx0dGhpcy5pZCEsXG5cdFx0XHRcdFx0ZGF0YUZpZWxkLFxuXHRcdFx0XHRcdGNoYXJ0T3BlcmF0aW9uQXZhaWxhYmxlTWFwIHx8IFwiXCJcblx0XHRcdFx0KSxcblx0XHRcdFx0b25FeGVjdXRlSUJOOiBDb21tb25IZWxwZXIuZ2V0UHJlc3NIYW5kbGVyRm9yRGF0YUZpZWxkRm9ySUJOKGRhdGFGaWVsZCwgYFxcJHtpbnRlcm5hbD5zZWxlY3RlZENvbnRleHRzfWAsIGZhbHNlKSxcblx0XHRcdFx0b25FeGVjdXRlTWFuaWZlc3Q6IENvbW1vbkhlbHBlci5idWlsZEFjdGlvbldyYXBwZXIoYWN0aW9uIGFzIEN1c3RvbUFjdGlvbiwgdGhpcylcblx0XHRcdH07XG5cdFx0XHR0aGlzLl9jb21tYW5kQWN0aW9ucy5wdXNoKGNvbW1hbmRBY3Rpb24pO1xuXHRcdH1cblx0fTtcblxuXHRnZXRBY3Rpb25Db21tYW5kID0gKGNvbW1hbmRBY3Rpb246IENvbW1hbmRBY3Rpb24sIGNoYXJ0Q29udGV4dDogQ29udGV4dCkgPT4ge1xuXHRcdGNvbnN0IGFjdGlvbiA9IGNvbW1hbmRBY3Rpb24uYWN0aW9uQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRjb25zdCBkYXRhRmllbGRDb250ZXh0ID0gYWN0aW9uLmFubm90YXRpb25QYXRoICYmIHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChhY3Rpb24uYW5ub3RhdGlvblBhdGgpO1xuXHRcdGNvbnN0IGRhdGFGaWVsZCA9IGRhdGFGaWVsZENvbnRleHQgJiYgZGF0YUZpZWxkQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRjb25zdCBkYXRhRmllbGRBY3Rpb24gPSB0aGlzLmNvbnRleHRQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoYWN0aW9uLmFubm90YXRpb25QYXRoICsgXCIvQWN0aW9uXCIpITtcblx0XHRjb25zdCBhY3Rpb25Db250ZXh0ID0gQ29tbW9uSGVscGVyLmdldEFjdGlvbkNvbnRleHQoZGF0YUZpZWxkQWN0aW9uKTtcblx0XHRjb25zdCBpc0JvdW5kUGF0aCA9IENvbW1vbkhlbHBlci5nZXRQYXRoVG9Cb3VuZEFjdGlvbk92ZXJsb2FkKGRhdGFGaWVsZEFjdGlvbik7XG5cdFx0Y29uc3QgaXNCb3VuZCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChpc0JvdW5kUGF0aCkhLmdldE9iamVjdCgpO1xuXHRcdGNvbnN0IGNoYXJ0T3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gZXNjYXBlWE1MQXR0cmlidXRlVmFsdWUoXG5cdFx0XHRDaGFydEhlbHBlci5nZXRPcGVyYXRpb25BdmFpbGFibGVNYXAoY2hhcnRDb250ZXh0LmdldE9iamVjdCgpLCB7XG5cdFx0XHRcdGNvbnRleHQ6IGNoYXJ0Q29udGV4dFxuXHRcdFx0fSlcblx0XHQpO1xuXHRcdGNvbnN0IGlzQWN0aW9uRW5hYmxlZCA9IGFjdGlvbi5lbmFibGVkXG5cdFx0XHQ/IGFjdGlvbi5lbmFibGVkXG5cdFx0XHQ6IENoYXJ0SGVscGVyLmlzRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uRW5hYmxlZChcblx0XHRcdFx0XHRpc0JvdW5kICYmIGlzQm91bmQuJElzQm91bmQsXG5cdFx0XHRcdFx0ZGF0YUZpZWxkLkFjdGlvbixcblx0XHRcdFx0XHR0aGlzLmNvbnRleHRQYXRoLFxuXHRcdFx0XHRcdGNoYXJ0T3BlcmF0aW9uQXZhaWxhYmxlTWFwIHx8IFwiXCIsXG5cdFx0XHRcdFx0YWN0aW9uLmVuYWJsZU9uU2VsZWN0IHx8IFwiXCJcblx0XHRcdCAgKTtcblx0XHRsZXQgaXNJQk5FbmFibGVkO1xuXHRcdGlmIChhY3Rpb24uZW5hYmxlZCkge1xuXHRcdFx0aXNJQk5FbmFibGVkID0gYWN0aW9uLmVuYWJsZWQ7XG5cdFx0fSBlbHNlIGlmIChkYXRhRmllbGQuUmVxdWlyZXNDb250ZXh0KSB7XG5cdFx0XHRpc0lCTkVuYWJsZWQgPSBcIns9ICV7aW50ZXJuYWw+bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzfSA+PSAxfVwiO1xuXHRcdH1cblx0XHRjb25zdCBhY3Rpb25Db21tYW5kID0geG1sYDxpbnRlcm5hbE1hY3JvOkFjdGlvbkNvbW1hbmRcblx0XHRhY3Rpb249XCIke2FjdGlvbn1cIlxuXHRcdG9uRXhlY3V0ZUFjdGlvbj1cIiR7Y29tbWFuZEFjdGlvbi5vbkV4ZWN1dGVBY3Rpb259XCJcblx0XHRvbkV4ZWN1dGVJQk49XCIke2NvbW1hbmRBY3Rpb24ub25FeGVjdXRlSUJOfVwiXG5cdFx0b25FeGVjdXRlTWFuaWZlc3Q9XCIke2NvbW1hbmRBY3Rpb24ub25FeGVjdXRlTWFuaWZlc3R9XCJcblx0XHRpc0lCTkVuYWJsZWQ9XCIke2lzSUJORW5hYmxlZH1cIlxuXHRcdGlzQWN0aW9uRW5hYmxlZD1cIiR7aXNBY3Rpb25FbmFibGVkfVwiXG5cdFx0dmlzaWJsZT1cIiR7dGhpcy5nZXRWaXNpYmxlKGRhdGFGaWVsZENvbnRleHQpfVwiXG5cdC8+YDtcblx0XHRpZiAoXG5cdFx0XHRhY3Rpb24udHlwZSA9PSBcIkZvckFjdGlvblwiICYmXG5cdFx0XHQoIWlzQm91bmQgfHwgaXNCb3VuZC5Jc0JvdW5kICE9PSB0cnVlIHx8IGFjdGlvbkNvbnRleHRbYEAke0NvcmVBbm5vdGF0aW9uVGVybXMuT3BlcmF0aW9uQXZhaWxhYmxlfWBdICE9PSBmYWxzZSlcblx0XHQpIHtcblx0XHRcdHJldHVybiBhY3Rpb25Db21tYW5kO1xuXHRcdH0gZWxzZSBpZiAoYWN0aW9uLnR5cGUgPT0gXCJGb3JBY3Rpb25cIikge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBhY3Rpb25Db21tYW5kO1xuXHRcdH1cblx0fTtcblxuXHRnZXRJdGVtcyA9IChjaGFydENvbnRleHQ6IENvbnRleHQpID0+IHtcblx0XHRpZiAodGhpcy5fY2hhcnQpIHtcblx0XHRcdGNvbnN0IGRpbWVuc2lvbnM6IHN0cmluZ1tdID0gW107XG5cdFx0XHRjb25zdCBtZWFzdXJlczogc3RyaW5nW10gPSBbXTtcblx0XHRcdGlmICh0aGlzLl9jaGFydC5EaW1lbnNpb25zKSB7XG5cdFx0XHRcdENoYXJ0SGVscGVyLmZvcm1hdERpbWVuc2lvbnMoY2hhcnRDb250ZXh0KVxuXHRcdFx0XHRcdC5nZXRPYmplY3QoKVxuXHRcdFx0XHRcdC5mb3JFYWNoKChkaW1lbnNpb246IERpbWVuc2lvblR5cGUpID0+IHtcblx0XHRcdFx0XHRcdGRpbWVuc2lvbi5pZCA9IGdlbmVyYXRlKFt0aGlzLmlkLCBcImRpbWVuc2lvblwiLCBkaW1lbnNpb24ua2V5XSk7XG5cdFx0XHRcdFx0XHRkaW1lbnNpb25zLnB1c2goXG5cdFx0XHRcdFx0XHRcdHRoaXMuZ2V0SXRlbShcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZDogZGltZW5zaW9uLmlkLFxuXHRcdFx0XHRcdFx0XHRcdFx0a2V5OiBkaW1lbnNpb24ua2V5LFxuXHRcdFx0XHRcdFx0XHRcdFx0bGFiZWw6IGRpbWVuc2lvbi5sYWJlbCxcblx0XHRcdFx0XHRcdFx0XHRcdHJvbGU6IGRpbWVuc2lvbi5yb2xlXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcIl9mZV9ncm91cGFibGVfXCIsXG5cdFx0XHRcdFx0XHRcdFx0XCJncm91cGFibGVcIlxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMubWVhc3VyZXMpIHtcblx0XHRcdFx0Q2hhcnRIZWxwZXIuZm9ybWF0TWVhc3VyZXModGhpcy5tZWFzdXJlcykuZm9yRWFjaCgobWVhc3VyZTogTWVhc3VyZVR5cGUpID0+IHtcblx0XHRcdFx0XHRtZWFzdXJlLmlkID0gZ2VuZXJhdGUoW3RoaXMuaWQsIFwibWVhc3VyZVwiLCBtZWFzdXJlLmtleV0pO1xuXHRcdFx0XHRcdG1lYXN1cmVzLnB1c2goXG5cdFx0XHRcdFx0XHR0aGlzLmdldEl0ZW0oXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpZDogbWVhc3VyZS5pZCxcblx0XHRcdFx0XHRcdFx0XHRrZXk6IG1lYXN1cmUua2V5LFxuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBtZWFzdXJlLmxhYmVsLFxuXHRcdFx0XHRcdFx0XHRcdHJvbGU6IG1lYXN1cmUucm9sZVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcIl9mZV9hZ2dyZWdhdGFibGVfXCIsXG5cdFx0XHRcdFx0XHRcdFwiYWdncmVnYXRhYmxlXCJcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGlmIChkaW1lbnNpb25zLmxlbmd0aCAmJiBtZWFzdXJlcy5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIGRpbWVuc2lvbnMuY29uY2F0KG1lYXN1cmVzKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH07XG5cblx0Z2V0SXRlbSA9IChpdGVtOiBNZWFzdXJlVHlwZSB8IERpbWVuc2lvblR5cGUsIHByZWZpeDogc3RyaW5nLCB0eXBlOiBzdHJpbmcpID0+IHtcblx0XHRyZXR1cm4geG1sYDxjaGFydDpJdGVtXG5cdFx0XHRpZD1cIiR7aXRlbS5pZH1cIlxuXHRcdFx0bmFtZT1cIiR7cHJlZml4ICsgaXRlbS5rZXl9XCJcblx0XHRcdHR5cGU9XCIke3R5cGV9XCJcblx0XHRcdGxhYmVsPVwiJHtyZXNvbHZlQmluZGluZ1N0cmluZyhpdGVtLmxhYmVsIGFzIHN0cmluZywgXCJzdHJpbmdcIil9XCJcblx0XHRcdHJvbGU9XCIke2l0ZW0ucm9sZX1cIlxuXHRcdC8+YDtcblx0fTtcblxuXHRnZXRUb29sYmFyQWN0aW9ucyA9IChjaGFydENvbnRleHQ6IENvbnRleHQsIGlzSW5zaWdodHNFbmFibGVkOiBib29sZWFuKSA9PiB7XG5cdFx0Y29uc3QgYWN0aW9ucyA9IHRoaXMuZ2V0QWN0aW9ucyhjaGFydENvbnRleHQpO1xuXHRcdGlmICh0aGlzLmNoYXJ0RGVmaW5pdGlvbj8ub25TZWdtZW50ZWRCdXR0b25QcmVzc2VkKSB7XG5cdFx0XHRhY3Rpb25zLnB1c2godGhpcy5nZXRTZWdtZW50ZWRCdXR0b24oKSk7XG5cdFx0fVxuXHRcdGlmIChpc0luc2lnaHRzRW5hYmxlZCkge1xuXHRcdFx0YWN0aW9ucy5wdXNoKHRoaXMuZ2V0U3RhbmRhcmRBY3Rpb25zKGlzSW5zaWdodHNFbmFibGVkKSk7XG5cdFx0fVxuXHRcdGlmIChhY3Rpb25zLmxlbmd0aCA+IDApIHtcblx0XHRcdHJldHVybiB4bWxgPG1kYzphY3Rpb25zPiR7YWN0aW9uc308L21kYzphY3Rpb25zPmA7XG5cdFx0fVxuXHRcdHJldHVybiBcIlwiO1xuXHR9O1xuXG5cdGdldFN0YW5kYXJkQWN0aW9ucyA9IChpc0luc2lnaHRzRW5hYmxlZDogYm9vbGVhbikgPT4ge1xuXHRcdGlmIChpc0luc2lnaHRzRW5hYmxlZCkge1xuXHRcdFx0cmV0dXJuIHhtbGA8bWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbiB2aXNpYmxlPVwiJHtpc0luc2lnaHRzRW5hYmxlZH1cIj5cblx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdHRleHQ9XCJ7c2FwLmZlLmkxOG4+TV9DT01NT05fSU5TSUdIVFNfQ0FSRH1cIlxuXHRcdFx0XHRcdGNvcmU6cmVxdWlyZT1cIntBUEk6ICdzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0QVBJJ31cIlxuXHRcdFx0XHRcdHByZXNzPVwiQVBJLm9uQWRkQ2FyZFRvSW5zaWdodHNQcmVzc2VkKCRldmVudClcIlxuXHRcdFx0XHRcdHZpc2libGU9XCIke2lzSW5zaWdodHNFbmFibGVkfVwiXG5cdFx0XHRcdFx0ZW5hYmxlZD1cIiR7aXNJbnNpZ2h0c0VuYWJsZWR9XCJcblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxsYXlvdXREYXRhPlxuXHRcdFx0XHRcdFx0PE92ZXJmbG93VG9vbGJhckxheW91dERhdGEgcHJpb3JpdHk9XCJBbHdheXNPdmVyZmxvd1wiIC8+XG5cdFx0XHRcdFx0PC9sYXlvdXREYXRhPlxuXHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdDwvbWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5gO1xuXHRcdH1cblx0fTtcblxuXHRnZXRBY3Rpb25zID0gKGNoYXJ0Q29udGV4dDogQ29udGV4dCkgPT4ge1xuXHRcdGxldCBhY3Rpb25zID0gdGhpcy5jaGFydEFjdGlvbnM/LmdldE9iamVjdCgpO1xuXHRcdGFjdGlvbnMgPSB0aGlzLnJlbW92ZU1lbnVJdGVtcyhhY3Rpb25zKTtcblx0XHRyZXR1cm4gYWN0aW9ucy5tYXAoKGFjdGlvbjogQ3VzdG9tQW5kQWN0aW9uKSA9PiB7XG5cdFx0XHRpZiAoYWN0aW9uLmFubm90YXRpb25QYXRoKSB7XG5cdFx0XHRcdC8vIExvYWQgYW5ub3RhdGlvbiBiYXNlZCBhY3Rpb25zXG5cdFx0XHRcdHJldHVybiB0aGlzLmdldEFjdGlvbihhY3Rpb24sIGNoYXJ0Q29udGV4dCwgZmFsc2UpO1xuXHRcdFx0fSBlbHNlIGlmIChhY3Rpb24uaGFzT3duUHJvcGVydHkoXCJub1dyYXBcIikpIHtcblx0XHRcdFx0Ly8gTG9hZCBYTUwgb3IgbWFuaWZlc3QgYmFzZWQgYWN0aW9ucyAvIGFjdGlvbiBncm91cHNcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0Q3VzdG9tQWN0aW9ucyhhY3Rpb24sIGNoYXJ0Q29udGV4dCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0cmVtb3ZlTWVudUl0ZW1zID0gKGFjdGlvbnM6IEJhc2VBY3Rpb25bXSkgPT4ge1xuXHRcdC8vIElmIGFjdGlvbiBpcyBhbHJlYWR5IHBhcnQgb2YgbWVudSBpbiBhY3Rpb24gZ3JvdXAsIHRoZW4gaXQgd2lsbFxuXHRcdC8vIGJlIHJlbW92ZWQgZnJvbSB0aGUgbWFpbiBhY3Rpb25zIGxpc3Rcblx0XHRmb3IgKGNvbnN0IGFjdGlvbiBvZiBhY3Rpb25zKSB7XG5cdFx0XHRpZiAoYWN0aW9uLm1lbnUpIHtcblx0XHRcdFx0YWN0aW9uLm1lbnUuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXHRcdFx0XHRcdGlmIChhY3Rpb25zLmluZGV4T2YoaXRlbSBhcyBCYXNlQWN0aW9uKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRcdGFjdGlvbnMuc3BsaWNlKGFjdGlvbnMuaW5kZXhPZihpdGVtIGFzIEJhc2VBY3Rpb24pLCAxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gYWN0aW9ucztcblx0fTtcblxuXHRnZXRDdXN0b21BY3Rpb25zID0gKGFjdGlvbjogQ3VzdG9tQW5kQWN0aW9uLCBjaGFydENvbnRleHQ6IENvbnRleHQpID0+IHtcblx0XHRsZXQgYWN0aW9uRW5hYmxlZCA9IGFjdGlvbi5lbmFibGVkIGFzIHN0cmluZyB8IGJvb2xlYW47XG5cdFx0aWYgKChhY3Rpb24ucmVxdWlyZXNTZWxlY3Rpb24gPz8gZmFsc2UpICYmIGFjdGlvbi5lbmFibGVkID09PSBcInRydWVcIikge1xuXHRcdFx0YWN0aW9uRW5hYmxlZCA9IFwiez0gJXtpbnRlcm5hbD5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHN9ID49IDF9XCI7XG5cdFx0fVxuXHRcdGlmIChhY3Rpb24udHlwZSA9PT0gXCJEZWZhdWx0XCIpIHtcblx0XHRcdC8vIExvYWQgWE1MIG9yIG1hbmlmZXN0IGJhc2VkIHRvb2xiYXIgYWN0aW9uc1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0QWN0aW9uVG9vbGJhckFjdGlvbihcblx0XHRcdFx0YWN0aW9uLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IGdlbmVyYXRlKFt0aGlzLmlkLCBhY3Rpb24uaWRdKSxcblx0XHRcdFx0XHR1bml0dGVzdGlkOiBcIkRhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbkFjdGlvblwiLFxuXHRcdFx0XHRcdGxhYmVsOiBhY3Rpb24udGV4dCA/IGFjdGlvbi50ZXh0IDogXCJcIixcblx0XHRcdFx0XHRhcmlhSGFzUG9wdXA6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRwcmVzczogYWN0aW9uLnByZXNzID8gYWN0aW9uLnByZXNzIDogXCJcIixcblx0XHRcdFx0XHRlbmFibGVkOiBhY3Rpb25FbmFibGVkLFxuXHRcdFx0XHRcdHZpc2libGU6IGFjdGlvbi52aXNpYmxlID8gYWN0aW9uLnZpc2libGUgOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmYWxzZVxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSBcIk1lbnVcIikge1xuXHRcdFx0Ly8gTG9hZCBhY3Rpb24gZ3JvdXBzIChNZW51KVxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0QWN0aW9uVG9vbGJhck1lbnVBY3Rpb24oXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogZ2VuZXJhdGUoW3RoaXMuaWQsIGFjdGlvbi5pZF0pLFxuXHRcdFx0XHRcdHRleHQ6IGFjdGlvbi50ZXh0LFxuXHRcdFx0XHRcdHZpc2libGU6IGFjdGlvbi52aXNpYmxlLFxuXHRcdFx0XHRcdGVuYWJsZWQ6IGFjdGlvbkVuYWJsZWQsXG5cdFx0XHRcdFx0dXNlRGVmYXVsdEFjdGlvbk9ubHk6IERlZmF1bHRBY3Rpb25IYW5kbGVyLmdldFVzZURlZmF1bHRBY3Rpb25Pbmx5KGFjdGlvbiksXG5cdFx0XHRcdFx0YnV0dG9uTW9kZTogRGVmYXVsdEFjdGlvbkhhbmRsZXIuZ2V0QnV0dG9uTW9kZShhY3Rpb24pLFxuXHRcdFx0XHRcdGRlZmF1bHRBY3Rpb246IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRhY3Rpb25zOiBhY3Rpb25cblx0XHRcdFx0fSxcblx0XHRcdFx0Y2hhcnRDb250ZXh0XG5cdFx0XHQpO1xuXHRcdH1cblx0fTtcblxuXHRnZXRNZW51SXRlbUZyb21NZW51ID0gKG1lbnVJdGVtQWN0aW9uOiBDdXN0b21BY3Rpb24sIGNoYXJ0Q29udGV4dDogQ29udGV4dCkgPT4ge1xuXHRcdGxldCBwcmVzc0hhbmRsZXI7XG5cdFx0aWYgKG1lbnVJdGVtQWN0aW9uLmFubm90YXRpb25QYXRoKSB7XG5cdFx0XHQvL0Fubm90YXRpb24gYmFzZWQgYWN0aW9uIGlzIHBhc3NlZCBhcyBtZW51IGl0ZW0gZm9yIG1lbnUgYnV0dG9uXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRBY3Rpb24obWVudUl0ZW1BY3Rpb24sIGNoYXJ0Q29udGV4dCwgdHJ1ZSk7XG5cdFx0fVxuXHRcdGlmIChtZW51SXRlbUFjdGlvbi5jb21tYW5kKSB7XG5cdFx0XHRwcmVzc0hhbmRsZXIgPSBcImNtZDpcIiArIG1lbnVJdGVtQWN0aW9uLmNvbW1hbmQ7XG5cdFx0fSBlbHNlIGlmIChtZW51SXRlbUFjdGlvbi5ub1dyYXAgPz8gZmFsc2UpIHtcblx0XHRcdHByZXNzSGFuZGxlciA9IG1lbnVJdGVtQWN0aW9uLnByZXNzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwcmVzc0hhbmRsZXIgPSBDb21tb25IZWxwZXIuYnVpbGRBY3Rpb25XcmFwcGVyKG1lbnVJdGVtQWN0aW9uLCB0aGlzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHhtbGA8TWVudUl0ZW1cblx0XHRjb3JlOnJlcXVpcmU9XCJ7RlBNOiAnc2FwL2ZlL2NvcmUvaGVscGVycy9GUE1IZWxwZXInfVwiXG5cdFx0dGV4dD1cIiR7bWVudUl0ZW1BY3Rpb24udGV4dH1cIlxuXHRcdHByZXNzPVwiJHtwcmVzc0hhbmRsZXJ9XCJcblx0XHR2aXNpYmxlPVwiJHttZW51SXRlbUFjdGlvbi52aXNpYmxlfVwiXG5cdFx0ZW5hYmxlZD1cIiR7bWVudUl0ZW1BY3Rpb24uZW5hYmxlZH1cIlxuXHQvPmA7XG5cdH07XG5cblx0Z2V0QWN0aW9uVG9vbGJhck1lbnVBY3Rpb24gPSAocHJvcHM6IEN1c3RvbVRvb2xiYXJNZW51QWN0aW9uLCBjaGFydENvbnRleHQ6IENvbnRleHQpID0+IHtcblx0XHRjb25zdCBhTWVudUl0ZW1zID0gcHJvcHMuYWN0aW9ucz8ubWVudT8ubWFwKChhY3Rpb246IEN1c3RvbUFjdGlvbikgPT4ge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0TWVudUl0ZW1Gcm9tTWVudShhY3Rpb24sIGNoYXJ0Q29udGV4dCk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHhtbGA8bWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5cblx0XHRcdDxNZW51QnV0dG9uXG5cdFx0XHR0ZXh0PVwiJHtwcm9wcy50ZXh0fVwiXG5cdFx0XHR0eXBlPVwiVHJhbnNwYXJlbnRcIlxuXHRcdFx0bWVudVBvc2l0aW9uPVwiQmVnaW5Cb3R0b21cIlxuXHRcdFx0aWQ9XCIke3Byb3BzLmlkfVwiXG5cdFx0XHR2aXNpYmxlPVwiJHtwcm9wcy52aXNpYmxlfVwiXG5cdFx0XHRlbmFibGVkPVwiJHtwcm9wcy5lbmFibGVkfVwiXG5cdFx0XHR1c2VEZWZhdWx0QWN0aW9uT25seT1cIiR7cHJvcHMudXNlRGVmYXVsdEFjdGlvbk9ubHl9XCJcblx0XHRcdGJ1dHRvbk1vZGU9XCIke3Byb3BzLmJ1dHRvbk1vZGV9XCJcblx0XHRcdGRlZmF1bHRBY3Rpb249XCIke3Byb3BzLmRlZmF1bHRBY3Rpb259XCJcblx0XHRcdD5cblx0XHRcdFx0PG1lbnU+XG5cdFx0XHRcdFx0PE1lbnU+XG5cdFx0XHRcdFx0XHQke2FNZW51SXRlbXN9XG5cdFx0XHRcdFx0PC9NZW51PlxuXHRcdFx0XHQ8L21lbnU+XG5cdFx0XHQ8L01lbnVCdXR0b24+XG5cdFx0PC9tZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uPmA7XG5cdH07XG5cblx0Z2V0QWN0aW9uID0gKGFjdGlvbjogQmFzZUFjdGlvbiwgY2hhcnRDb250ZXh0OiBDb250ZXh0LCBpc01lbnVJdGVtOiBib29sZWFuKSA9PiB7XG5cdFx0Y29uc3QgZGF0YUZpZWxkQ29udGV4dCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChhY3Rpb24uYW5ub3RhdGlvblBhdGggfHwgXCJcIikhO1xuXHRcdGlmIChhY3Rpb24udHlwZSA9PT0gXCJGb3JOYXZpZ2F0aW9uXCIpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE5hdmlnYXRpb25BY3Rpb25zKGFjdGlvbiwgZGF0YUZpZWxkQ29udGV4dCwgaXNNZW51SXRlbSk7XG5cdFx0fSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PT0gXCJGb3JBY3Rpb25cIikge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0QW5ub3RhdGlvbkFjdGlvbnMoY2hhcnRDb250ZXh0LCBhY3Rpb24gYXMgQW5ub3RhdGlvbkFjdGlvbiwgZGF0YUZpZWxkQ29udGV4dCwgaXNNZW51SXRlbSk7XG5cdFx0fVxuXHRcdHJldHVybiBcIlwiO1xuXHR9O1xuXG5cdGdldE5hdmlnYXRpb25BY3Rpb25zID0gKGFjdGlvbjogQmFzZUFjdGlvbiwgZGF0YUZpZWxkQ29udGV4dDogQ29udGV4dCwgaXNNZW51SXRlbTogYm9vbGVhbikgPT4ge1xuXHRcdGxldCBlbmFibGVkID0gXCJ0cnVlXCI7XG5cdFx0Y29uc3QgZGF0YUZpZWxkID0gZGF0YUZpZWxkQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRpZiAoYWN0aW9uLmVuYWJsZWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0ZW5hYmxlZCA9IGFjdGlvbi5lbmFibGVkO1xuXHRcdH0gZWxzZSBpZiAoZGF0YUZpZWxkLlJlcXVpcmVzQ29udGV4dCkge1xuXHRcdFx0ZW5hYmxlZCA9IFwiez0gJXtpbnRlcm5hbD5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHN9ID49IDF9XCI7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmdldEFjdGlvblRvb2xiYXJBY3Rpb24oXG5cdFx0XHRhY3Rpb24sXG5cdFx0XHR7XG5cdFx0XHRcdGlkOiB1bmRlZmluZWQsXG5cdFx0XHRcdHVuaXR0ZXN0aWQ6IFwiRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uQnV0dG9uQWN0aW9uXCIsXG5cdFx0XHRcdGxhYmVsOiBkYXRhRmllbGQuTGFiZWwsXG5cdFx0XHRcdGFyaWFIYXNQb3B1cDogdW5kZWZpbmVkLFxuXHRcdFx0XHRwcmVzczogQ29tbW9uSGVscGVyLmdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTihkYXRhRmllbGQsIGBcXCR7aW50ZXJuYWw+c2VsZWN0ZWRDb250ZXh0c31gLCBmYWxzZSkhLFxuXHRcdFx0XHRlbmFibGVkOiBlbmFibGVkLFxuXHRcdFx0XHR2aXNpYmxlOiB0aGlzLmdldFZpc2libGUoZGF0YUZpZWxkQ29udGV4dClcblx0XHRcdH0sXG5cdFx0XHRpc01lbnVJdGVtXG5cdFx0KTtcblx0fTtcblxuXHRnZXRBbm5vdGF0aW9uQWN0aW9ucyA9IChjaGFydENvbnRleHQ6IENvbnRleHQsIGFjdGlvbjogQW5ub3RhdGlvbkFjdGlvbiwgZGF0YUZpZWxkQ29udGV4dDogQ29udGV4dCwgaXNNZW51SXRlbTogYm9vbGVhbikgPT4ge1xuXHRcdGNvbnN0IGRhdGFGaWVsZEFjdGlvbiA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChhY3Rpb24uYW5ub3RhdGlvblBhdGggKyBcIi9BY3Rpb25cIikhO1xuXHRcdGNvbnN0IGFjdGlvbkNvbnRleHQgPSB0aGlzLmNvbnRleHRQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoQ29tbW9uSGVscGVyLmdldEFjdGlvbkNvbnRleHQoZGF0YUZpZWxkQWN0aW9uKSk7XG5cdFx0Y29uc3QgYWN0aW9uT2JqZWN0ID0gYWN0aW9uQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRjb25zdCBpc0JvdW5kUGF0aCA9IENvbW1vbkhlbHBlci5nZXRQYXRoVG9Cb3VuZEFjdGlvbk92ZXJsb2FkKGRhdGFGaWVsZEFjdGlvbik7XG5cdFx0Y29uc3QgaXNCb3VuZCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChpc0JvdW5kUGF0aCkhLmdldE9iamVjdCgpO1xuXHRcdGNvbnN0IGRhdGFGaWVsZCA9IGRhdGFGaWVsZENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0aWYgKCFpc0JvdW5kIHx8IGlzQm91bmQuJElzQm91bmQgIT09IHRydWUgfHwgYWN0aW9uT2JqZWN0W2BAJHtDb3JlQW5ub3RhdGlvblRlcm1zLk9wZXJhdGlvbkF2YWlsYWJsZX1gXSAhPT0gZmFsc2UpIHtcblx0XHRcdGNvbnN0IGVuYWJsZWQgPSB0aGlzLmdldEFubm90YXRpb25BY3Rpb25zRW5hYmxlZChhY3Rpb24sIGlzQm91bmQsIGRhdGFGaWVsZCwgY2hhcnRDb250ZXh0KTtcblx0XHRcdGNvbnN0IGRhdGFGaWVsZE1vZGVsT2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhcblx0XHRcdFx0dGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGFjdGlvbi5hbm5vdGF0aW9uUGF0aCkhXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgYXJpYUhhc1BvcHVwID0gaXNEYXRhTW9kZWxPYmplY3RQYXRoRm9yQWN0aW9uV2l0aERpYWxvZyhkYXRhRmllbGRNb2RlbE9iamVjdFBhdGgpO1xuXHRcdFx0Y29uc3QgY2hhcnRPcGVyYXRpb25BdmFpbGFibGVNYXAgPVxuXHRcdFx0XHRlc2NhcGVYTUxBdHRyaWJ1dGVWYWx1ZShcblx0XHRcdFx0XHRDaGFydEhlbHBlci5nZXRPcGVyYXRpb25BdmFpbGFibGVNYXAoY2hhcnRDb250ZXh0LmdldE9iamVjdCgpLCB7XG5cdFx0XHRcdFx0XHRjb250ZXh0OiBjaGFydENvbnRleHRcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpIHx8IFwiXCI7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRBY3Rpb25Ub29sYmFyQWN0aW9uKFxuXHRcdFx0XHRhY3Rpb24sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogZ2VuZXJhdGUoW3RoaXMuaWQsIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhkYXRhRmllbGRDb250ZXh0KV0pLFxuXHRcdFx0XHRcdHVuaXR0ZXN0aWQ6IFwiRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uQWN0aW9uXCIsXG5cdFx0XHRcdFx0bGFiZWw6IGRhdGFGaWVsZC5MYWJlbCxcblx0XHRcdFx0XHRhcmlhSGFzUG9wdXA6IGFyaWFIYXNQb3B1cCxcblx0XHRcdFx0XHRwcmVzczogQ2hhcnRIZWxwZXIuZ2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbih0aGlzLmlkISwgZGF0YUZpZWxkLCBjaGFydE9wZXJhdGlvbkF2YWlsYWJsZU1hcCksXG5cdFx0XHRcdFx0ZW5hYmxlZDogZW5hYmxlZCxcblx0XHRcdFx0XHR2aXNpYmxlOiB0aGlzLmdldFZpc2libGUoZGF0YUZpZWxkQ29udGV4dClcblx0XHRcdFx0fSxcblx0XHRcdFx0aXNNZW51SXRlbVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH07XG5cblx0Z2V0QWN0aW9uVG9vbGJhckFjdGlvbiA9IChhY3Rpb246IEJhc2VBY3Rpb24gJiB7IG5vV3JhcD86IGJvb2xlYW4gfSwgdG9vbGJhckFjdGlvbjogVG9vbEJhckFjdGlvbiwgaXNNZW51SXRlbTogYm9vbGVhbikgPT4ge1xuXHRcdGlmIChpc01lbnVJdGVtKSB7XG5cdFx0XHRyZXR1cm4geG1sYFxuXHRcdFx0PE1lbnVJdGVtXG5cdFx0XHRcdHRleHQ9XCIke3Rvb2xiYXJBY3Rpb24ubGFiZWx9XCJcblx0XHRcdFx0cHJlc3M9XCIke2FjdGlvbi5jb21tYW5kID8gXCJjbWQ6XCIgKyBhY3Rpb24uY29tbWFuZCA6IHRvb2xiYXJBY3Rpb24ucHJlc3N9XCJcblx0XHRcdFx0ZW5hYmxlZD1cIiR7dG9vbGJhckFjdGlvbi5lbmFibGVkfVwiXG5cdFx0XHRcdHZpc2libGU9XCIke3Rvb2xiYXJBY3Rpb24udmlzaWJsZX1cIlxuXHRcdFx0Lz5gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5idWlsZEFjdGlvbihhY3Rpb24sIHRvb2xiYXJBY3Rpb24pO1xuXHRcdH1cblx0fTtcblxuXHRidWlsZEFjdGlvbiA9IChhY3Rpb246IEJhc2VBY3Rpb24gfCBDdXN0b21BY3Rpb24sIHRvb2xiYXJBY3Rpb246IFRvb2xCYXJBY3Rpb24pID0+IHtcblx0XHRsZXQgYWN0aW9uUHJlc3M6IHN0cmluZyB8IHVuZGVmaW5lZCA9IFwiXCI7XG5cdFx0aWYgKGFjdGlvbi5oYXNPd25Qcm9wZXJ0eShcIm5vV3JhcFwiKSkge1xuXHRcdFx0aWYgKGFjdGlvbi5jb21tYW5kKSB7XG5cdFx0XHRcdGFjdGlvblByZXNzID0gXCJjbWQ6XCIgKyBhY3Rpb24uY29tbWFuZDtcblx0XHRcdH0gZWxzZSBpZiAoKGFjdGlvbiBhcyBDdXN0b21BY3Rpb24pLm5vV3JhcCA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRhY3Rpb25QcmVzcyA9IHRvb2xiYXJBY3Rpb24ucHJlc3M7XG5cdFx0XHR9IGVsc2UgaWYgKCFhY3Rpb24uYW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdFx0YWN0aW9uUHJlc3MgPSBDb21tb25IZWxwZXIuYnVpbGRBY3Rpb25XcmFwcGVyKGFjdGlvbiBhcyBDdXN0b21BY3Rpb24sIHRoaXMpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHhtbGA8bWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5cblx0XHRcdDxCdXR0b25cblx0XHRcdFx0Y29yZTpyZXF1aXJlPVwie0ZQTTogJ3NhcC9mZS9jb3JlL2hlbHBlcnMvRlBNSGVscGVyJ31cIlxuXHRcdFx0XHR1bml0dGVzdDppZD1cIiR7dG9vbGJhckFjdGlvbi51bml0dGVzdGlkfVwiXG5cdFx0XHRcdGlkPVwiJHt0b29sYmFyQWN0aW9uLmlkfVwiXG5cdFx0XHRcdHRleHQ9XCIke3Rvb2xiYXJBY3Rpb24ubGFiZWx9XCJcblx0XHRcdFx0YXJpYUhhc1BvcHVwPVwiJHt0b29sYmFyQWN0aW9uLmFyaWFIYXNQb3B1cH1cIlxuXHRcdFx0XHRwcmVzcz1cIiR7YWN0aW9uUHJlc3N9XCJcblx0XHRcdFx0ZW5hYmxlZD1cIiR7dG9vbGJhckFjdGlvbi5lbmFibGVkfVwiXG5cdFx0XHRcdHZpc2libGU9XCIke3Rvb2xiYXJBY3Rpb24udmlzaWJsZX1cIlxuXHRcdFx0Lz5cblx0XHQgICA8L21kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb24+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHhtbGA8bWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5cblx0XHRcdDxCdXR0b25cblx0XHRcdFx0dW5pdHRlc3Q6aWQ9XCIke3Rvb2xiYXJBY3Rpb24udW5pdHRlc3RpZH1cIlxuXHRcdFx0XHRpZD1cIiR7dG9vbGJhckFjdGlvbi5pZH1cIlxuXHRcdFx0XHR0ZXh0PVwiJHt0b29sYmFyQWN0aW9uLmxhYmVsfVwiXG5cdFx0XHRcdGFyaWFIYXNQb3B1cD1cIiR7dG9vbGJhckFjdGlvbi5hcmlhSGFzUG9wdXB9XCJcblx0XHRcdFx0cHJlc3M9XCIke2FjdGlvbi5jb21tYW5kID8gXCJjbWQ6XCIgKyBhY3Rpb24uY29tbWFuZCA6IHRvb2xiYXJBY3Rpb24ucHJlc3N9XCJcblx0XHRcdFx0ZW5hYmxlZD1cIiR7dG9vbGJhckFjdGlvbi5lbmFibGVkfVwiXG5cdFx0XHRcdHZpc2libGU9XCIke3Rvb2xiYXJBY3Rpb24udmlzaWJsZX1cIlxuXHRcdFx0Lz5cblx0XHQ8L21kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb24+YDtcblx0XHR9XG5cdH07XG5cblx0Z2V0QW5ub3RhdGlvbkFjdGlvbnNFbmFibGVkID0gKFxuXHRcdGFjdGlvbjogQmFzZUFjdGlvbixcblx0XHRpc0JvdW5kOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPixcblx0XHRkYXRhRmllbGQ6IERhdGFGaWVsZEZvckFjdGlvbixcblx0XHRjaGFydENvbnRleHQ6IENvbnRleHRcblx0KSA9PiB7XG5cdFx0cmV0dXJuIGFjdGlvbi5lbmFibGVkICE9PSB1bmRlZmluZWRcblx0XHRcdD8gYWN0aW9uLmVuYWJsZWRcblx0XHRcdDogQ2hhcnRIZWxwZXIuaXNEYXRhRmllbGRGb3JBY3Rpb25CdXR0b25FbmFibGVkKFxuXHRcdFx0XHRcdGlzQm91bmQgJiYgaXNCb3VuZC4kSXNCb3VuZCxcblx0XHRcdFx0XHRkYXRhRmllbGQuQWN0aW9uIGFzIHN0cmluZyxcblx0XHRcdFx0XHR0aGlzLmNvbnRleHRQYXRoLFxuXHRcdFx0XHRcdENoYXJ0SGVscGVyLmdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcChjaGFydENvbnRleHQuZ2V0T2JqZWN0KCksIHsgY29udGV4dDogY2hhcnRDb250ZXh0IH0pLFxuXHRcdFx0XHRcdGFjdGlvbi5lbmFibGVPblNlbGVjdCB8fCBcIlwiXG5cdFx0XHQgICk7XG5cdH07XG5cblx0Z2V0U2VnbWVudGVkQnV0dG9uID0gKCkgPT4ge1xuXHRcdHJldHVybiB4bWxgPG1kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb24gbGF5b3V0SW5mb3JtYXRpb249XCJ7XG5cdFx0XHRhZ2dyZWdhdGlvbk5hbWU6ICdlbmQnLFxuXHRcdFx0YWxpZ25tZW50OiAnRW5kJ1xuXHRcdH1cIj5cblx0XHRcdDxTZWdtZW50ZWRCdXR0b25cblx0XHRcdFx0aWQ9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIlNlZ21lbnRlZEJ1dHRvblwiLCBcIlRlbXBsYXRlQ29udGVudFZpZXdcIl0pfVwiXG5cdFx0XHRcdHNlbGVjdD1cIiR7dGhpcy5jaGFydERlZmluaXRpb24hLm9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZH1cIlxuXHRcdFx0XHR2aXNpYmxlPVwiez0gXFwke3BhZ2VJbnRlcm5hbD5hbHBDb250ZW50Vmlld30gIT09ICdUYWJsZScgfVwiXG5cdFx0XHRcdHNlbGVjdGVkS2V5PVwie3BhZ2VJbnRlcm5hbD5hbHBDb250ZW50Vmlld31cIlxuXHRcdFx0PlxuXHRcdFx0XHQ8aXRlbXM+XG5cdFx0XHRcdFx0JHt0aGlzLmdldFNlZ21lbnRlZEJ1dHRvbkl0ZW1zKCl9XG5cdFx0XHRcdDwvaXRlbXM+XG5cdFx0XHQ8L1NlZ21lbnRlZEJ1dHRvbj5cblx0XHQ8L21kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb24+YDtcblx0fTtcblxuXHRnZXRTZWdtZW50ZWRCdXR0b25JdGVtcyA9ICgpID0+IHtcblx0XHRjb25zdCBzZWdtZW50ZWRCdXR0b25JdGVtcyA9IFtdO1xuXHRcdGlmIChDb21tb25IZWxwZXIuaXNEZXNrdG9wKCkpIHtcblx0XHRcdHNlZ21lbnRlZEJ1dHRvbkl0ZW1zLnB1c2goXG5cdFx0XHRcdHRoaXMuZ2V0U2VnbWVudGVkQnV0dG9uSXRlbShcblx0XHRcdFx0XHRcIntzYXAuZmUuaTE4bj5NX0NPTU1PTl9IWUJSSURfU0VHTUVOVEVEX0JVVFRPTl9JVEVNX1RPT0xUSVB9XCIsXG5cdFx0XHRcdFx0XCJIeWJyaWRcIixcblx0XHRcdFx0XHRcInNhcC1pY29uOi8vY2hhcnQtdGFibGUtdmlld1wiXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHNlZ21lbnRlZEJ1dHRvbkl0ZW1zLnB1c2goXG5cdFx0XHR0aGlzLmdldFNlZ21lbnRlZEJ1dHRvbkl0ZW0oXCJ7c2FwLmZlLmkxOG4+TV9DT01NT05fQ0hBUlRfU0VHTUVOVEVEX0JVVFRPTl9JVEVNX1RPT0xUSVB9XCIsIFwiQ2hhcnRcIiwgXCJzYXAtaWNvbjovL2Jhci1jaGFydFwiKVxuXHRcdCk7XG5cdFx0c2VnbWVudGVkQnV0dG9uSXRlbXMucHVzaChcblx0XHRcdHRoaXMuZ2V0U2VnbWVudGVkQnV0dG9uSXRlbShcIntzYXAuZmUuaTE4bj5NX0NPTU1PTl9UQUJMRV9TRUdNRU5URURfQlVUVE9OX0lURU1fVE9PTFRJUH1cIiwgXCJUYWJsZVwiLCBcInNhcC1pY29uOi8vdGFibGUtdmlld1wiKVxuXHRcdCk7XG5cdFx0cmV0dXJuIHNlZ21lbnRlZEJ1dHRvbkl0ZW1zO1xuXHR9O1xuXG5cdGdldFNlZ21lbnRlZEJ1dHRvbkl0ZW0gPSAodG9vbHRpcDogc3RyaW5nLCBrZXk6IHN0cmluZywgaWNvbjogc3RyaW5nKSA9PiB7XG5cdFx0cmV0dXJuIHhtbGA8U2VnbWVudGVkQnV0dG9uSXRlbVxuXHRcdFx0dG9vbHRpcD1cIiR7dG9vbHRpcH1cIlxuXHRcdFx0a2V5PVwiJHtrZXl9XCJcblx0XHRcdGljb249XCIke2ljb259XCJcblx0XHQvPmA7XG5cdH07XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFubm90YXRpb24gcGF0aCBwb2ludGluZyB0byB0aGUgdmlzdWFsaXphdGlvbiBhbm5vdGF0aW9uIChDaGFydCkuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wcyBUaGUgY2hhcnQgcHJvcGVydGllc1xuXHQgKiBAcGFyYW0gY29udGV4dE9iamVjdFBhdGggVGhlIGRhdGFtb2RlbCBvYmplY3QgcGF0aCBmb3IgdGhlIGNoYXJ0XG5cdCAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuXHQgKiBAcmV0dXJucyBUaGUgYW5ub3RhdGlvbiBwYXRoXG5cdCAqL1xuXHRzdGF0aWMgZ2V0VmlzdWFsaXphdGlvblBhdGggPSAoXG5cdFx0cHJvcHM6IFByb3BlcnRpZXNPZjxDaGFydEJsb2NrPixcblx0XHRjb250ZXh0T2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG5cdCkgPT4ge1xuXHRcdGNvbnN0IG1ldGFQYXRoID0gZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChjb250ZXh0T2JqZWN0UGF0aCk7XG5cblx0XHQvLyBmYWxsYmFjayB0byBkZWZhdWx0IENoYXJ0IGlmIG1ldGFwYXRoIGlzIG5vdCBzZXRcblx0XHRpZiAoIW1ldGFQYXRoKSB7XG5cdFx0XHRMb2cuZXJyb3IoYE1pc3NpbmcgbWV0YXBhdGggcGFyYW1ldGVyIGZvciBDaGFydGApO1xuXHRcdFx0cmV0dXJuIGBAJHtVSUFubm90YXRpb25UZXJtcy5DaGFydH1gO1xuXHRcdH1cblxuXHRcdGlmIChjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQpIHtcblx0XHRcdHJldHVybiBtZXRhUGF0aDsgLy8gTWV0YVBhdGggaXMgYWxyZWFkeSBwb2ludGluZyB0byBhIENoYXJ0XG5cdFx0fVxuXG5cdFx0Ly9OZWVkIHRvIHN3aXRjaCB0byB0aGUgY29udGV4dCByZWxhdGVkIHRoZSBQViBvciBTUFZcblx0XHRjb25zdCByZXNvbHZlZFRhcmdldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24obWV0YVBhdGgpO1xuXG5cdFx0bGV0IHZpc3VhbGl6YXRpb25zOiBWaXN1YWxpemF0aW9uQW5kUGF0aFtdID0gW107XG5cdFx0c3dpdGNoIChjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LnRlcm0pIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudDpcblx0XHRcdFx0aWYgKGNvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdC5QcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0XHRcdFx0dmlzdWFsaXphdGlvbnMgPSBnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50KFxuXHRcdFx0XHRcdFx0Y29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlByZXNlbnRhdGlvblZhcmlhbnQsXG5cdFx0XHRcdFx0XHRtZXRhUGF0aCxcblx0XHRcdFx0XHRcdHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuUHJlc2VudGF0aW9uVmFyaWFudDpcblx0XHRcdFx0dmlzdWFsaXphdGlvbnMgPSBnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50KFxuXHRcdFx0XHRcdGNvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdCxcblx0XHRcdFx0XHRtZXRhUGF0aCxcblx0XHRcdFx0XHRyZXNvbHZlZFRhcmdldC5jb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0Y29uc3QgY2hhcnRWaXogPSB2aXN1YWxpemF0aW9ucy5maW5kKCh2aXopID0+IHtcblx0XHRcdHJldHVybiB2aXoudmlzdWFsaXphdGlvbi50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5DaGFydDtcblx0XHR9KTtcblxuXHRcdGlmIChjaGFydFZpeikge1xuXHRcdFx0cmV0dXJuIGNoYXJ0Vml6LmFubm90YXRpb25QYXRoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBmYWxsYmFjayB0byBkZWZhdWx0IENoYXJ0IGlmIGFubm90YXRpb24gbWlzc2luZyBpbiBQVlxuXHRcdFx0TG9nLmVycm9yKGBCYWQgbWV0YXBhdGggcGFyYW1ldGVyIGZvciBjaGFydDogJHtjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybX1gKTtcblx0XHRcdHJldHVybiBgQCR7VUlBbm5vdGF0aW9uVGVybXMuQ2hhcnR9YDtcblx0XHR9XG5cdH07XG5cblx0Z2V0VmlzaWJsZSA9IChkYXRhRmllbGRDb250ZXh0OiBDb250ZXh0KSA9PiB7XG5cdFx0Y29uc3QgZGF0YUZpZWxkID0gZGF0YUZpZWxkQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRpZiAoZGF0YUZpZWxkW2BAJHtVSUFubm90YXRpb25UZXJtcy5IaWRkZW59YF0gJiYgZGF0YUZpZWxkW2BAJHtVSUFubm90YXRpb25UZXJtcy5IaWRkZW59YF0uJFBhdGgpIHtcblx0XHRcdGNvbnN0IGhpZGRlblBhdGhDb250ZXh0ID0gdGhpcy5jb250ZXh0UGF0aFxuXHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHQuY3JlYXRlQmluZGluZ0NvbnRleHQoXG5cdFx0XHRcdFx0ZGF0YUZpZWxkQ29udGV4dC5nZXRQYXRoKCkgKyBgL0Ake1VJQW5ub3RhdGlvblRlcm1zLkhpZGRlbn0vJFBhdGhgLFxuXHRcdFx0XHRcdGRhdGFGaWVsZFtgQCR7VUlBbm5vdGF0aW9uVGVybXMuSGlkZGVufWBdLiRQYXRoXG5cdFx0XHRcdCk7XG5cdFx0XHRyZXR1cm4gQ2hhcnRIZWxwZXIuZ2V0SGlkZGVuUGF0aEV4cHJlc3Npb25Gb3JUYWJsZUFjdGlvbnNBbmRJQk4oZGF0YUZpZWxkW2BAJHtVSUFubm90YXRpb25UZXJtcy5IaWRkZW59YF0uJFBhdGgsIHtcblx0XHRcdFx0Y29udGV4dDogaGlkZGVuUGF0aENvbnRleHRcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSBpZiAoZGF0YUZpZWxkW2BAJHtVSUFubm90YXRpb25UZXJtcy5IaWRkZW59YF0pIHtcblx0XHRcdHJldHVybiAhZGF0YUZpZWxkW2BAJHtVSUFubm90YXRpb25UZXJtcy5IaWRkZW59YF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fTtcblxuXHRnZXRDb250ZXh0UGF0aCA9ICgpID0+IHtcblx0XHRyZXR1cm4gdGhpcy5jb250ZXh0UGF0aC5nZXRQYXRoKCkubGFzdEluZGV4T2YoXCIvXCIpID09PSB0aGlzLmNvbnRleHRQYXRoLmdldFBhdGgoKS5sZW5ndGggLSAxXG5cdFx0XHQ/IHRoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpLnJlcGxhY2VBbGwoXCIvXCIsIFwiXCIpXG5cdFx0XHQ6IHRoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpLnNwbGl0KFwiL1wiKVt0aGlzLmNvbnRleHRQYXRoLmdldFBhdGgoKS5zcGxpdChcIi9cIikubGVuZ3RoIC0gMV07XG5cdH07XG5cblx0Z2V0VGVtcGxhdGUoKSB7XG5cdFx0bGV0IGNoYXJ0ZGVsZWdhdGUgPSBcIlwiO1xuXG5cdFx0aWYgKHRoaXMuX2N1c3RvbURhdGEudGFyZ2V0Q29sbGVjdGlvblBhdGggPT09IFwiXCIpIHtcblx0XHRcdHRoaXMubm9EYXRhVGV4dCA9IHRoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJNX0NIQVJUX05PX0FOTk9UQVRJT05fU0VUX1RFWFRcIik7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuY2hhcnREZWxlZ2F0ZSkge1xuXHRcdFx0Y2hhcnRkZWxlZ2F0ZSA9IHRoaXMuY2hhcnREZWxlZ2F0ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgY29udGV4dFBhdGggPSB0aGlzLmdldENvbnRleHRQYXRoKCk7XG5cdFx0XHRjaGFydGRlbGVnYXRlID1cblx0XHRcdFx0XCJ7bmFtZTonc2FwL2ZlL21hY3Jvcy9jaGFydC9DaGFydERlbGVnYXRlJywgcGF5bG9hZDoge2NvbGxlY3Rpb25OYW1lOiAnXCIgK1xuXHRcdFx0XHRjb250ZXh0UGF0aCArXG5cdFx0XHRcdFwiJywgY29udGV4dFBhdGg6ICdcIiArXG5cdFx0XHRcdGNvbnRleHRQYXRoICtcblx0XHRcdFx0XCInLCBwYXJhbWV0ZXJzOnskJGdyb3VwSWQ6JyRhdXRvLldvcmtlcnMnfSwgc2VsZWN0aW9uTW9kZTogJ1wiICtcblx0XHRcdFx0dGhpcy5zZWxlY3Rpb25Nb2RlICtcblx0XHRcdFx0XCInfX1cIjtcblx0XHR9XG5cdFx0Y29uc3QgYmluZGluZyA9IFwie2ludGVybmFsPmNvbnRyb2xzL1wiICsgdGhpcy5pZCArIFwifVwiO1xuXHRcdGlmICghdGhpcy5oZWFkZXIpIHtcblx0XHRcdHRoaXMuaGVhZGVyID0gdGhpcy5fY2hhcnQ/LlRpdGxlPy50b1N0cmluZygpO1xuXHRcdH1cblx0XHRyZXR1cm4geG1sYFxuXHRcdFx0PG1hY3JvOkNoYXJ0QVBJIHhtbG5zPVwic2FwLm1cIiB4bWxuczptYWNybz1cInNhcC5mZS5tYWNyb3MuY2hhcnRcIiB4bWxuczp2YXJpYW50PVwic2FwLnVpLmZsLnZhcmlhbnRzXCIgeG1sbnM6cDEzbj1cInNhcC51aS5tZGMucDEzblwiIHhtbG5zOnVuaXR0ZXN0PVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvcHJlcHJvY2Vzc29yZXh0ZW5zaW9uL3NhcC5mZS51bml0dGVzdGluZy8xXCIgeG1sbnM6bWFjcm9kYXRhPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiIHhtbG5zOmludGVybmFsTWFjcm89XCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIgeG1sbnM6Y2hhcnQ9XCJzYXAudWkubWRjLmNoYXJ0XCIgeG1sbnM6bWRjPVwic2FwLnVpLm1kY1wiIHhtbG5zOm1kY2F0PVwic2FwLnVpLm1kYy5hY3Rpb250b29sYmFyXCIgeG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCIgaWQ9XCIke1xuXHRcdFx0XHR0aGlzLl9hcGlJZFxuXHRcdFx0fVwiIHNlbGVjdGlvbkNoYW5nZT1cIiR7dGhpcy5zZWxlY3Rpb25DaGFuZ2V9XCIgc3RhdGVDaGFuZ2U9XCIke3RoaXMuc3RhdGVDaGFuZ2V9XCI+XG5cdFx0XHRcdDxtYWNybzpsYXlvdXREYXRhPlxuXHRcdFx0XHRcdDxGbGV4SXRlbURhdGEgZ3Jvd0ZhY3Rvcj1cIjFcIiBzaHJpbmtGYWN0b3I9XCIxXCIgLz5cblx0XHRcdFx0PC9tYWNybzpsYXlvdXREYXRhPlxuXHRcdFx0XHQ8bWRjOkNoYXJ0XG5cdFx0XHRcdFx0YmluZGluZz1cIiR7YmluZGluZ31cIlxuXHRcdFx0XHRcdHVuaXR0ZXN0OmlkPVwiQ2hhcnRNYWNyb0ZyYWdtZW50XCJcblx0XHRcdFx0XHRpZD1cIiR7dGhpcy5fY29udGVudElkfVwiXG5cdFx0XHRcdFx0Y2hhcnRUeXBlPVwiJHt0aGlzLl9jaGFydFR5cGV9XCJcblx0XHRcdFx0XHRzb3J0Q29uZGl0aW9ucz1cIiR7dGhpcy5fc29ydENvbmR0aW9uc31cIlxuXHRcdFx0XHRcdGhlYWRlcj1cIiR7dGhpcy5oZWFkZXJ9XCJcblx0XHRcdFx0XHRoZWFkZXJWaXNpYmxlPVwiJHt0aGlzLmhlYWRlclZpc2libGV9XCJcblx0XHRcdFx0XHRoZWlnaHQ9XCIke3RoaXMuaGVpZ2h0fVwiXG5cdFx0XHRcdFx0d2lkdGg9XCIke3RoaXMud2lkdGh9XCJcblx0XHRcdFx0XHRoZWFkZXJMZXZlbD1cIiR7dGhpcy5oZWFkZXJMZXZlbH1cIlxuXHRcdFx0XHRcdHAxM25Nb2RlPVwiJHt0aGlzLnBlcnNvbmFsaXphdGlvbn1cIlxuXHRcdFx0XHRcdGZpbHRlcj1cIiR7dGhpcy5maWx0ZXJ9XCJcblx0XHRcdFx0XHRub0RhdGFUZXh0PVwiJHt0aGlzLm5vRGF0YVRleHR9XCJcblx0XHRcdFx0XHRhdXRvQmluZE9uSW5pdD1cIiR7dGhpcy5hdXRvQmluZE9uSW5pdH1cIlxuXHRcdFx0XHRcdGRlbGVnYXRlPVwiJHtjaGFydGRlbGVnYXRlfVwiXG5cdFx0XHRcdFx0bWFjcm9kYXRhOnRhcmdldENvbGxlY3Rpb25QYXRoPVwiJHt0aGlzLl9jdXN0b21EYXRhLnRhcmdldENvbGxlY3Rpb25QYXRofVwiXG5cdFx0XHRcdFx0bWFjcm9kYXRhOmVudGl0eVNldD1cIiR7dGhpcy5fY3VzdG9tRGF0YS5lbnRpdHlTZXR9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6ZW50aXR5VHlwZT1cIiR7dGhpcy5fY3VzdG9tRGF0YS5lbnRpdHlUeXBlfVwiXG5cdFx0XHRcdFx0bWFjcm9kYXRhOm9wZXJhdGlvbkF2YWlsYWJsZU1hcD1cIiR7dGhpcy5fY3VzdG9tRGF0YS5vcGVyYXRpb25BdmFpbGFibGVNYXB9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6bXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnM9XCIke3RoaXMuX2N1c3RvbURhdGEubXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnN9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6c2VnbWVudGVkQnV0dG9uSWQ9XCIke3RoaXMuX2N1c3RvbURhdGEuc2VnbWVudGVkQnV0dG9uSWR9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6Y3VzdG9tQWdnPVwiJHt0aGlzLl9jdXN0b21EYXRhLmN1c3RvbUFnZ31cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTp0cmFuc0FnZz1cIiR7dGhpcy5fY3VzdG9tRGF0YS50cmFuc0FnZ31cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTphcHBseVN1cHBvcnRlZD1cIiR7dGhpcy5fY3VzdG9tRGF0YS5hcHBseVN1cHBvcnRlZH1cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTp2aXpQcm9wZXJ0aWVzPVwiJHt0aGlzLl9jdXN0b21EYXRhLnZpelByb3BlcnRpZXN9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6ZHJhZnRTdXBwb3J0ZWQ9XCIke3RoaXMuX2N1c3RvbURhdGEuZHJhZnRTdXBwb3J0ZWR9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6bXVsdGlWaWV3cz1cIiR7dGhpcy5fY3VzdG9tRGF0YS5tdWx0aVZpZXdzfVwiXG5cdFx0XHRcdFx0bWFjcm9kYXRhOnNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRoPVwiJHt0aGlzLl9jdXN0b21EYXRhLnNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRofVwiXG5cdFx0XHRcdFx0dmlzaWJsZT1cIiR7dGhpcy52aXNpYmxlfVwiXG5cdFx0XHRcdD5cblx0XHRcdFx0PG1kYzpkZXBlbmRlbnRzPlxuXHRcdFx0XHRcdCR7dGhpcy5nZXREZXBlbmRlbnRzKHRoaXMuX2NoYXJ0Q29udGV4dCl9XG5cdFx0XHRcdFx0JHt0aGlzLmdldFBlcnNpc3RlbmNlUHJvdmlkZXIoKX1cblx0XHRcdFx0PC9tZGM6ZGVwZW5kZW50cz5cblx0XHRcdFx0PG1kYzppdGVtcz5cblx0XHRcdFx0XHQke3RoaXMuZ2V0SXRlbXModGhpcy5fY2hhcnRDb250ZXh0KX1cblx0XHRcdFx0PC9tZGM6aXRlbXM+XG5cdFx0XHRcdCR7dGhpcy5fYWN0aW9uc31cblx0XHRcdFx0JHt0aGlzLmNyZWF0ZVZhcmlhbnRNYW5hZ2VtZW50KCl9XG5cdFx0XHQ8L21kYzpDaGFydD5cblx0XHQ8L21hY3JvOkNoYXJ0QVBJPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBNENBLE1BQU1BLFdBQXNDLEdBQUc7SUFDOUMsdURBQXVELEVBQUUsT0FBTztJQUNoRSx1REFBdUQsRUFBRSxPQUFPO0lBQ2hFLHVEQUF1RCxFQUFFLE9BQU87SUFDaEUsdURBQXVELEVBQUU7RUFDMUQsQ0FBQztFQUFDLElBZ0JHQyxxQkFBcUI7RUFPMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsV0FQS0EscUJBQXFCO0lBQXJC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SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BendDZ0IsTUFBTTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BUVAsTUFBTTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0EyQklRLFVBQVUsQ0FBQ0MsSUFBSTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BU2pCLFVBQVU7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQWlFTCxLQUFLO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9