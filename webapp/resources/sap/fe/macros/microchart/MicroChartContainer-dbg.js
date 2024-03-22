/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/chart/coloring/CriticalityType", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/library", "sap/m/FlexBox", "sap/m/Label", "sap/m/library", "sap/suite/ui/microchart/AreaMicroChart", "sap/suite/ui/microchart/ColumnMicroChart", "sap/suite/ui/microchart/ComparisonMicroChart", "sap/suite/ui/microchart/LineMicroChart", "sap/ui/core/Control", "sap/ui/core/format/NumberFormat", "sap/ui/model/odata/v4/ODataListBinding", "sap/ui/model/odata/v4/ODataMetaModel", "sap/ui/model/type/Date"], function (Log, CriticalityType, ClassSupport, macroLib, FlexBox, Label, mobilelibrary, AreaMicroChart, ColumnMicroChart, ComparisonMicroChart, LineMicroChart, Control, NumberFormat, ODataV4ListBinding, ODataMetaModel, DateType) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const NavigationType = macroLib.NavigationType;
  const ValueColor = mobilelibrary.ValueColor;
  /**
   *  Container Control for Micro Chart and UoM.
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  let MicroChartContainer = (_dec = defineUI5Class("sap.fe.macros.microchart.MicroChartContainer"), _dec2 = property({
    type: "boolean",
    defaultValue: false
  }), _dec3 = property({
    type: "string",
    defaultValue: undefined
  }), _dec4 = property({
    type: "string[]",
    defaultValue: []
  }), _dec5 = property({
    type: "string",
    defaultValue: undefined
  }), _dec6 = property({
    type: "string[]",
    defaultValue: []
  }), _dec7 = property({
    type: "int",
    defaultValue: undefined
  }), _dec8 = property({
    type: "int",
    defaultValue: 1
  }), _dec9 = property({
    type: "int",
    defaultValue: undefined
  }), _dec10 = property({
    type: "string",
    defaultValue: ""
  }), _dec11 = property({
    type: "string",
    defaultValue: ""
  }), _dec12 = property({
    type: "sap.fe.macros.NavigationType",
    defaultValue: "None"
  }), _dec13 = property({
    type: "string",
    defaultValue: ""
  }), _dec14 = event(), _dec15 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec16 = aggregation({
    type: "sap.m.Label",
    multiple: false
  }), _dec17 = aggregation({
    type: "sap.ui.core.Control",
    multiple: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(MicroChartContainer, _Control);
    function MicroChartContainer() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "showOnlyChart", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "uomPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "measures", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dimension", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataPointQualifiers", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "measurePrecision", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "measureScale", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dimensionPrecision", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartTitle", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartDescription", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationType", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "calendarPattern", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onTitlePressed", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "microChart", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_uomLabel", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "microChartTitle", _descriptor16, _assertThisInitialized(_this));
      return _this;
    }
    MicroChartContainer.render = function render(renderManager, control) {
      renderManager.openStart("div", control);
      renderManager.openEnd();
      if (!control.showOnlyChart) {
        const chartTitle = control.microChartTitle;
        if (chartTitle) {
          chartTitle.forEach(function (subChartTitle) {
            renderManager.openStart("div");
            renderManager.openEnd();
            renderManager.renderControl(subChartTitle);
            renderManager.close("div");
          });
        }
        renderManager.openStart("div");
        renderManager.openEnd();
        const chartDescription = new Label({
          text: control.chartDescription
        });
        renderManager.renderControl(chartDescription);
        renderManager.close("div");
      }
      const microChart = control.microChart;
      if (microChart) {
        microChart.addStyleClass("sapUiTinyMarginTopBottom");
        renderManager.renderControl(microChart);
        if (!control.showOnlyChart && control.uomPath) {
          const settings = control._checkIfChartRequiresRuntimeLabels() ? undefined : {
              text: {
                path: control.uomPath
              }
            },
            label = new Label(settings),
            flexBox = new FlexBox({
              alignItems: "Start",
              justifyContent: "End",
              items: [label]
            });
          renderManager.renderControl(flexBox);
          control.setAggregation("_uomLabel", label);
        }
      }
      renderManager.close("div");
    };
    var _proto = MicroChartContainer.prototype;
    _proto.onBeforeRendering = function onBeforeRendering() {
      const binding = this._getListBindingForRuntimeLabels();
      if (binding) {
        binding.detachEvent("change", this._setRuntimeChartLabelsAndUnitOfMeasure, this);
        this._olistBinding = undefined;
      }
    };
    _proto.onAfterRendering = function onAfterRendering() {
      const binding = this._getListBindingForRuntimeLabels();
      if (!this._checkIfChartRequiresRuntimeLabels()) {
        return;
      }
      if (binding) {
        binding.attachEvent("change", this._setRuntimeChartLabelsAndUnitOfMeasure, this);
        this._olistBinding = binding;
      }
    };
    _proto.setShowOnlyChart = function setShowOnlyChart(value) {
      if (!value && this._olistBinding) {
        this._setChartLabels();
      }
      this.setProperty("showOnlyChart", value, false /*re-rendering*/);
    };
    _proto._checkIfChartRequiresRuntimeLabels = function _checkIfChartRequiresRuntimeLabels() {
      const microChart = this.microChart;
      return Boolean(microChart instanceof AreaMicroChart || microChart instanceof ColumnMicroChart || microChart instanceof LineMicroChart || microChart instanceof ComparisonMicroChart);
    };
    _proto._checkForChartLabelAggregations = function _checkForChartLabelAggregations() {
      const microChart = this.microChart;
      return Boolean(microChart instanceof AreaMicroChart && microChart.getAggregation("firstYLabel") && microChart.getAggregation("lastYLabel") && microChart.getAggregation("firstXLabel") && microChart.getAggregation("lastXLabel") || microChart instanceof ColumnMicroChart && microChart.getAggregation("leftTopLabel") && microChart.getAggregation("rightTopLabel") && microChart.getAggregation("leftBottomLabel") && microChart.getAggregation("rightBottomLabel") || microChart instanceof LineMicroChart);
    };
    _proto._getListBindingForRuntimeLabels = function _getListBindingForRuntimeLabels() {
      const microChart = this.microChart;
      let binding;
      if (microChart instanceof AreaMicroChart) {
        const chart = microChart.getChart();
        binding = chart && chart.getBinding("points");
      } else if (microChart instanceof ColumnMicroChart) {
        binding = microChart.getBinding("columns");
      } else if (microChart instanceof LineMicroChart) {
        const lines = microChart.getLines();
        binding = lines && lines.length && lines[0].getBinding("points");
      } else if (microChart instanceof ComparisonMicroChart) {
        binding = microChart.getBinding("data");
      }
      return binding instanceof ODataV4ListBinding ? binding : false;
    };
    _proto._setRuntimeChartLabelsAndUnitOfMeasure = async function _setRuntimeChartLabelsAndUnitOfMeasure() {
      const listBinding = this._olistBinding,
        contexts = listBinding === null || listBinding === void 0 ? void 0 : listBinding.getContexts(),
        measures = this.measures,
        dimension = this.dimension,
        unitOfMeasurePath = this.uomPath,
        microChart = this.microChart,
        unitOfMeasureLabel = this._uomLabel;
      if (unitOfMeasureLabel && unitOfMeasurePath && contexts && contexts.length && !this.showOnlyChart) {
        unitOfMeasureLabel.setText(contexts[0].getObject(unitOfMeasurePath));
      } else if (unitOfMeasureLabel) {
        unitOfMeasureLabel.setText("");
      }
      if (!this._checkForChartLabelAggregations()) {
        return;
      }
      if (!contexts || !contexts.length) {
        this._setChartLabels();
        return;
      }
      const firstContext = contexts[0],
        lastContext = contexts[contexts.length - 1],
        linesPomises = [],
        lineChart = microChart instanceof LineMicroChart,
        currentMinX = firstContext.getObject(dimension),
        currentMaxX = lastContext.getObject(dimension);
      let currentMinY,
        currentMaxY,
        minX = {
          value: Infinity
        },
        maxX = {
          value: -Infinity
        },
        minY = {
          value: Infinity
        },
        maxY = {
          value: -Infinity
        };
      minX = currentMinX == undefined ? minX : {
        context: firstContext,
        value: currentMinX
      };
      maxX = currentMaxX == undefined ? maxX : {
        context: lastContext,
        value: currentMaxX
      };
      if (measures !== null && measures !== void 0 && measures.length) {
        measures.forEach((measure, i) => {
          currentMinY = firstContext.getObject(measure);
          currentMaxY = lastContext.getObject(measure);
          maxY = currentMaxY > maxY.value ? {
            context: lastContext,
            value: currentMaxY,
            index: lineChart ? i : 0
          } : maxY;
          minY = currentMinY < minY.value ? {
            context: firstContext,
            value: currentMinY,
            index: lineChart ? i : 0
          } : minY;
          if (lineChart) {
            linesPomises.push(this._getCriticalityFromPoint({
              context: lastContext,
              value: currentMaxY,
              index: i
            }));
          }
        });
      }
      this._setChartLabels(minY.value, maxY.value, minX.value, maxX.value);
      if (lineChart) {
        const colors = await Promise.all(linesPomises);
        if (colors !== null && colors !== void 0 && colors.length) {
          const lines = microChart.getLines();
          lines.forEach(function (line, i) {
            line.setColor(colors[i]);
          });
        }
      } else {
        await this._setChartLabelsColors(maxY, minY);
      }
    };
    _proto._setChartLabelsColors = async function _setChartLabelsColors(maxY, minY) {
      const microChart = this.microChart;
      const criticality = await Promise.all([this._getCriticalityFromPoint(minY), this._getCriticalityFromPoint(maxY)]);
      if (microChart instanceof AreaMicroChart) {
        microChart.getAggregation("firstYLabel").setProperty("color", criticality[0], true);
        microChart.getAggregation("lastYLabel").setProperty("color", criticality[1], true);
      } else if (microChart instanceof ColumnMicroChart) {
        microChart.getAggregation("leftTopLabel").setProperty("color", criticality[0], true);
        microChart.getAggregation("rightTopLabel").setProperty("color", criticality[1], true);
      }
    };
    _proto._setChartLabels = function _setChartLabels(leftTop, rightTop, leftBottom, rightBottom) {
      const microChart = this.microChart;
      leftTop = this._formatDateAndNumberValue(leftTop, this.measurePrecision, this.measureScale);
      rightTop = this._formatDateAndNumberValue(rightTop, this.measurePrecision, this.measureScale);
      leftBottom = this._formatDateAndNumberValue(leftBottom, this.dimensionPrecision, undefined, this.calendarPattern);
      rightBottom = this._formatDateAndNumberValue(rightBottom, this.dimensionPrecision, undefined, this.calendarPattern);
      if (microChart instanceof AreaMicroChart) {
        microChart.getAggregation("firstYLabel").setProperty("label", leftTop, false);
        microChart.getAggregation("lastYLabel").setProperty("label", rightTop, false);
        microChart.getAggregation("firstXLabel").setProperty("label", leftBottom, false);
        microChart.getAggregation("lastXLabel").setProperty("label", rightBottom, false);
      } else if (microChart instanceof ColumnMicroChart) {
        microChart.getAggregation("leftTopLabel").setProperty("label", leftTop, false);
        microChart.getAggregation("rightTopLabel").setProperty("label", rightTop, false);
        microChart.getAggregation("leftBottomLabel").setProperty("label", leftBottom, false);
        microChart.getAggregation("rightBottomLabel").setProperty("label", rightBottom, false);
      } else if (microChart instanceof LineMicroChart) {
        microChart.setProperty("leftTopLabel", leftTop, false);
        microChart.setProperty("rightTopLabel", rightTop, false);
        microChart.setProperty("leftBottomLabel", leftBottom, false);
        microChart.setProperty("rightBottomLabel", rightBottom, false);
      }
    };
    _proto._getCriticalityFromPoint = async function _getCriticalityFromPoint(point) {
      if (point !== null && point !== void 0 && point.context) {
        const metaModel = this.getModel() && this.getModel().getMetaModel(),
          dataPointQualifiers = this.dataPointQualifiers,
          metaPath = metaModel instanceof ODataMetaModel && point.context.getPath() && metaModel.getMetaPath(point.context.getPath());
        if (metaModel && typeof metaPath === "string") {
          const dataPoint = await metaModel.requestObject(`${metaPath}/@${"com.sap.vocabularies.UI.v1.DataPoint"}${point.index !== undefined && dataPointQualifiers[point.index] ? `#${dataPointQualifiers[point.index]}` : ""}`);
          if (dataPoint) {
            let criticality = ValueColor.Neutral;
            const context = point.context;
            if (dataPoint.Criticality) {
              criticality = this._criticality(dataPoint.Criticality, context);
            } else if (dataPoint.CriticalityCalculation) {
              const criticalityCalculation = dataPoint.CriticalityCalculation;
              const getValue = function (valueProperty) {
                let valueResponse;
                if (valueProperty !== null && valueProperty !== void 0 && valueProperty.$Path) {
                  valueResponse = context.getObject(valueProperty.$Path);
                } else if (valueProperty !== null && valueProperty !== void 0 && valueProperty.hasOwnProperty("$Decimal")) {
                  valueResponse = valueProperty.$Decimal;
                }
                return valueResponse;
              };
              criticality = this._criticalityCalculation(criticalityCalculation.ImprovementDirection.$EnumMember, point.value, getValue(criticalityCalculation.DeviationRangeLowValue), getValue(criticalityCalculation.ToleranceRangeLowValue), getValue(criticalityCalculation.AcceptanceRangeLowValue), getValue(criticalityCalculation.AcceptanceRangeHighValue), getValue(criticalityCalculation.ToleranceRangeHighValue), getValue(criticalityCalculation.DeviationRangeHighValue));
            }
            return criticality;
          }
        }
      }
      return Promise.resolve(ValueColor.Neutral);
    };
    _proto._criticality = function _criticality(criticality, context) {
      let criticalityValue, result;
      if (criticality.$Path) {
        criticalityValue = context.getObject(criticality.$Path);
        if (criticalityValue === CriticalityType.Negative || criticalityValue.toString() === "1") {
          result = ValueColor.Error;
        } else if (criticalityValue === CriticalityType.Critical || criticalityValue.toString() === "2") {
          result = ValueColor.Critical;
        } else if (criticalityValue === CriticalityType.Positive || criticalityValue.toString() === "3") {
          result = ValueColor.Good;
        }
      } else if (criticality.$EnumMember) {
        criticalityValue = criticality.$EnumMember;
        if (criticalityValue.indexOf("com.sap.vocabularies.UI.v1.CriticalityType/Negative") > -1) {
          result = ValueColor.Error;
        } else if (criticalityValue.indexOf("com.sap.vocabularies.UI.v1.CriticalityType/Positive") > -1) {
          result = ValueColor.Good;
        } else if (criticalityValue.indexOf("com.sap.vocabularies.UI.v1.CriticalityType/Critical") > -1) {
          result = ValueColor.Critical;
        }
      }
      if (result === undefined) {
        Log.warning("Case not supported, returning the default Value Neutral");
        return ValueColor.Neutral;
      }
      return result;
    };
    _proto._criticalityCalculation = function _criticalityCalculation(improvementDirection, value, deviationLow, toleranceLow, acceptanceLow, acceptanceHigh, toleranceHigh, deviationHigh) {
      let result;

      // Dealing with Decimal and Path based bingdings
      deviationLow = deviationLow == undefined ? -Infinity : deviationLow;
      toleranceLow = toleranceLow == undefined ? deviationLow : toleranceLow;
      acceptanceLow = acceptanceLow == undefined ? toleranceLow : acceptanceLow;
      deviationHigh = deviationHigh == undefined ? Infinity : deviationHigh;
      toleranceHigh = toleranceHigh == undefined ? deviationHigh : toleranceHigh;
      acceptanceHigh = acceptanceHigh == undefined ? toleranceHigh : acceptanceHigh;

      // Creating runtime expression binding from criticality calculation for Criticality State
      if (improvementDirection.indexOf("Minimize") > -1) {
        if (value <= acceptanceHigh) {
          result = ValueColor.Good;
        } else if (value <= toleranceHigh) {
          result = ValueColor.Neutral;
        } else if (value <= deviationHigh) {
          result = ValueColor.Critical;
        } else {
          result = ValueColor.Error;
        }
      } else if (improvementDirection.indexOf("Maximize") > -1) {
        if (value >= acceptanceLow) {
          result = ValueColor.Good;
        } else if (value >= toleranceLow) {
          result = ValueColor.Neutral;
        } else if (value >= deviationLow) {
          result = ValueColor.Critical;
        } else {
          result = ValueColor.Error;
        }
      } else if (improvementDirection.indexOf("Target") > -1) {
        if (value <= acceptanceHigh && value >= acceptanceLow) {
          result = ValueColor.Good;
        } else if (value >= toleranceLow && value < acceptanceLow || value > acceptanceHigh && value <= toleranceHigh) {
          result = ValueColor.Neutral;
        } else if (value >= deviationLow && value < toleranceLow || value > toleranceHigh && value <= deviationHigh) {
          result = ValueColor.Critical;
        } else {
          result = ValueColor.Error;
        }
      }
      if (result === undefined) {
        Log.warning("Case not supported, returning the default Value Neutral");
        return ValueColor.Neutral;
      }
      return result;
    };
    _proto._formatDateAndNumberValue = function _formatDateAndNumberValue(value, precision, scale, pattern) {
      if (pattern) {
        return this._getSemanticsValueFormatter(pattern).formatValue(value, "string");
      } else if (!isNaN(value)) {
        return this._getLabelNumberFormatter(precision, scale).format(value);
      }
      return value;
    };
    _proto._getSemanticsValueFormatter = function _getSemanticsValueFormatter(pattern) {
      if (!this._oDateType) {
        this._oDateType = new DateType({
          style: "short",
          source: {
            pattern
          }
        });
      }
      return this._oDateType;
    };
    _proto._getLabelNumberFormatter = function _getLabelNumberFormatter(precision, scale) {
      return NumberFormat.getFloatInstance({
        style: "short",
        showScale: true,
        precision: typeof precision === "number" && precision || 0,
        decimals: typeof scale === "number" && scale || 0
      });
    };
    return MicroChartContainer;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "showOnlyChart", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "uomPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "measures", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "dimension", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "dataPointQualifiers", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "measurePrecision", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "measureScale", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "dimensionPrecision", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "chartTitle", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "chartDescription", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "navigationType", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "calendarPattern", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "onTitlePressed", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "microChart", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "_uomLabel", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "microChartTitle", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return MicroChartContainer;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZpZ2F0aW9uVHlwZSIsIm1hY3JvTGliIiwiVmFsdWVDb2xvciIsIm1vYmlsZWxpYnJhcnkiLCJNaWNyb0NoYXJ0Q29udGFpbmVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJwcm9wZXJ0eSIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJ1bmRlZmluZWQiLCJldmVudCIsImFnZ3JlZ2F0aW9uIiwibXVsdGlwbGUiLCJpc0RlZmF1bHQiLCJyZW5kZXIiLCJyZW5kZXJNYW5hZ2VyIiwiY29udHJvbCIsIm9wZW5TdGFydCIsIm9wZW5FbmQiLCJzaG93T25seUNoYXJ0IiwiY2hhcnRUaXRsZSIsIm1pY3JvQ2hhcnRUaXRsZSIsImZvckVhY2giLCJzdWJDaGFydFRpdGxlIiwicmVuZGVyQ29udHJvbCIsImNsb3NlIiwiY2hhcnREZXNjcmlwdGlvbiIsIkxhYmVsIiwidGV4dCIsIm1pY3JvQ2hhcnQiLCJhZGRTdHlsZUNsYXNzIiwidW9tUGF0aCIsInNldHRpbmdzIiwiX2NoZWNrSWZDaGFydFJlcXVpcmVzUnVudGltZUxhYmVscyIsInBhdGgiLCJsYWJlbCIsImZsZXhCb3giLCJGbGV4Qm94IiwiYWxpZ25JdGVtcyIsImp1c3RpZnlDb250ZW50IiwiaXRlbXMiLCJzZXRBZ2dyZWdhdGlvbiIsIm9uQmVmb3JlUmVuZGVyaW5nIiwiYmluZGluZyIsIl9nZXRMaXN0QmluZGluZ0ZvclJ1bnRpbWVMYWJlbHMiLCJkZXRhY2hFdmVudCIsIl9zZXRSdW50aW1lQ2hhcnRMYWJlbHNBbmRVbml0T2ZNZWFzdXJlIiwiX29saXN0QmluZGluZyIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJhdHRhY2hFdmVudCIsInNldFNob3dPbmx5Q2hhcnQiLCJ2YWx1ZSIsIl9zZXRDaGFydExhYmVscyIsInNldFByb3BlcnR5IiwiQm9vbGVhbiIsIkFyZWFNaWNyb0NoYXJ0IiwiQ29sdW1uTWljcm9DaGFydCIsIkxpbmVNaWNyb0NoYXJ0IiwiQ29tcGFyaXNvbk1pY3JvQ2hhcnQiLCJfY2hlY2tGb3JDaGFydExhYmVsQWdncmVnYXRpb25zIiwiZ2V0QWdncmVnYXRpb24iLCJjaGFydCIsImdldENoYXJ0IiwiZ2V0QmluZGluZyIsImxpbmVzIiwiZ2V0TGluZXMiLCJsZW5ndGgiLCJPRGF0YVY0TGlzdEJpbmRpbmciLCJsaXN0QmluZGluZyIsImNvbnRleHRzIiwiZ2V0Q29udGV4dHMiLCJtZWFzdXJlcyIsImRpbWVuc2lvbiIsInVuaXRPZk1lYXN1cmVQYXRoIiwidW5pdE9mTWVhc3VyZUxhYmVsIiwiX3VvbUxhYmVsIiwic2V0VGV4dCIsImdldE9iamVjdCIsImZpcnN0Q29udGV4dCIsImxhc3RDb250ZXh0IiwibGluZXNQb21pc2VzIiwibGluZUNoYXJ0IiwiY3VycmVudE1pblgiLCJjdXJyZW50TWF4WCIsImN1cnJlbnRNaW5ZIiwiY3VycmVudE1heFkiLCJtaW5YIiwiSW5maW5pdHkiLCJtYXhYIiwibWluWSIsIm1heFkiLCJjb250ZXh0IiwibWVhc3VyZSIsImkiLCJpbmRleCIsInB1c2giLCJfZ2V0Q3JpdGljYWxpdHlGcm9tUG9pbnQiLCJjb2xvcnMiLCJQcm9taXNlIiwiYWxsIiwibGluZSIsInNldENvbG9yIiwiX3NldENoYXJ0TGFiZWxzQ29sb3JzIiwiY3JpdGljYWxpdHkiLCJsZWZ0VG9wIiwicmlnaHRUb3AiLCJsZWZ0Qm90dG9tIiwicmlnaHRCb3R0b20iLCJfZm9ybWF0RGF0ZUFuZE51bWJlclZhbHVlIiwibWVhc3VyZVByZWNpc2lvbiIsIm1lYXN1cmVTY2FsZSIsImRpbWVuc2lvblByZWNpc2lvbiIsImNhbGVuZGFyUGF0dGVybiIsInBvaW50IiwibWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJkYXRhUG9pbnRRdWFsaWZpZXJzIiwibWV0YVBhdGgiLCJPRGF0YU1ldGFNb2RlbCIsImdldFBhdGgiLCJnZXRNZXRhUGF0aCIsImRhdGFQb2ludCIsInJlcXVlc3RPYmplY3QiLCJOZXV0cmFsIiwiQ3JpdGljYWxpdHkiLCJfY3JpdGljYWxpdHkiLCJDcml0aWNhbGl0eUNhbGN1bGF0aW9uIiwiY3JpdGljYWxpdHlDYWxjdWxhdGlvbiIsImdldFZhbHVlIiwidmFsdWVQcm9wZXJ0eSIsInZhbHVlUmVzcG9uc2UiLCIkUGF0aCIsImhhc093blByb3BlcnR5IiwiJERlY2ltYWwiLCJfY3JpdGljYWxpdHlDYWxjdWxhdGlvbiIsIkltcHJvdmVtZW50RGlyZWN0aW9uIiwiJEVudW1NZW1iZXIiLCJEZXZpYXRpb25SYW5nZUxvd1ZhbHVlIiwiVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZSIsIkFjY2VwdGFuY2VSYW5nZUxvd1ZhbHVlIiwiQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlIiwiVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUiLCJEZXZpYXRpb25SYW5nZUhpZ2hWYWx1ZSIsInJlc29sdmUiLCJjcml0aWNhbGl0eVZhbHVlIiwicmVzdWx0IiwiQ3JpdGljYWxpdHlUeXBlIiwiTmVnYXRpdmUiLCJ0b1N0cmluZyIsIkVycm9yIiwiQ3JpdGljYWwiLCJQb3NpdGl2ZSIsIkdvb2QiLCJpbmRleE9mIiwiTG9nIiwid2FybmluZyIsImltcHJvdmVtZW50RGlyZWN0aW9uIiwiZGV2aWF0aW9uTG93IiwidG9sZXJhbmNlTG93IiwiYWNjZXB0YW5jZUxvdyIsImFjY2VwdGFuY2VIaWdoIiwidG9sZXJhbmNlSGlnaCIsImRldmlhdGlvbkhpZ2giLCJwcmVjaXNpb24iLCJzY2FsZSIsInBhdHRlcm4iLCJfZ2V0U2VtYW50aWNzVmFsdWVGb3JtYXR0ZXIiLCJmb3JtYXRWYWx1ZSIsImlzTmFOIiwiX2dldExhYmVsTnVtYmVyRm9ybWF0dGVyIiwiZm9ybWF0IiwiX29EYXRlVHlwZSIsIkRhdGVUeXBlIiwic3R5bGUiLCJzb3VyY2UiLCJOdW1iZXJGb3JtYXQiLCJnZXRGbG9hdEluc3RhbmNlIiwic2hvd1NjYWxlIiwiZGVjaW1hbHMiLCJDb250cm9sIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNaWNyb0NoYXJ0Q29udGFpbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ3JpdGljYWxpdHlUeXBlIGZyb20gXCJzYXAvY2hhcnQvY29sb3JpbmcvQ3JpdGljYWxpdHlUeXBlXCI7XG5pbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50LCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IG1hY3JvTGliIGZyb20gXCJzYXAvZmUvbWFjcm9zL2xpYnJhcnlcIjtcbmltcG9ydCBGbGV4Qm94IGZyb20gXCJzYXAvbS9GbGV4Qm94XCI7XG5pbXBvcnQgTGFiZWwgZnJvbSBcInNhcC9tL0xhYmVsXCI7XG5pbXBvcnQgbW9iaWxlbGlicmFyeSBmcm9tIFwic2FwL20vbGlicmFyeVwiO1xuaW1wb3J0IEFyZWFNaWNyb0NoYXJ0IGZyb20gXCJzYXAvc3VpdGUvdWkvbWljcm9jaGFydC9BcmVhTWljcm9DaGFydFwiO1xuaW1wb3J0IENvbHVtbk1pY3JvQ2hhcnQgZnJvbSBcInNhcC9zdWl0ZS91aS9taWNyb2NoYXJ0L0NvbHVtbk1pY3JvQ2hhcnRcIjtcbmltcG9ydCBDb21wYXJpc29uTWljcm9DaGFydCBmcm9tIFwic2FwL3N1aXRlL3VpL21pY3JvY2hhcnQvQ29tcGFyaXNvbk1pY3JvQ2hhcnRcIjtcbmltcG9ydCBMaW5lTWljcm9DaGFydCBmcm9tIFwic2FwL3N1aXRlL3VpL21pY3JvY2hhcnQvTGluZU1pY3JvQ2hhcnRcIjtcbmltcG9ydCBMaW5lTWljcm9DaGFydExpbmUgZnJvbSBcInNhcC9zdWl0ZS91aS9taWNyb2NoYXJ0L0xpbmVNaWNyb0NoYXJ0TGluZVwiO1xuaW1wb3J0IE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgTnVtYmVyRm9ybWF0IGZyb20gXCJzYXAvdWkvY29yZS9mb3JtYXQvTnVtYmVyRm9ybWF0XCI7XG5pbXBvcnQgdHlwZSBSZW5kZXJNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9SZW5kZXJNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhVjRMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCBEYXRlVHlwZSBmcm9tIFwic2FwL3VpL21vZGVsL3R5cGUvRGF0ZVwiO1xuXG5jb25zdCBOYXZpZ2F0aW9uVHlwZSA9IG1hY3JvTGliLk5hdmlnYXRpb25UeXBlO1xuY29uc3QgVmFsdWVDb2xvciA9IG1vYmlsZWxpYnJhcnkuVmFsdWVDb2xvcjtcbnR5cGUgRGF0YVBvaW50VmFsdWVUeXBlID0ge1xuXHR2YWx1ZTogbnVtYmVyO1xuXHRjb250ZXh0PzogQ29udGV4dDtcblx0aW5kZXg/OiBudW1iZXI7XG59O1xuLyoqXG4gKiAgQ29udGFpbmVyIENvbnRyb2wgZm9yIE1pY3JvIENoYXJ0IGFuZCBVb00uXG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgaW50ZXJuYWwvZXhwZXJpbWVudGFsIHVzZSFcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5taWNyb2NoYXJ0Lk1pY3JvQ2hhcnRDb250YWluZXJcIilcbmNsYXNzIE1pY3JvQ2hhcnRDb250YWluZXIgZXh0ZW5kcyBDb250cm9sIHtcblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdH0pXG5cdHNob3dPbmx5Q2hhcnQhOiBib29sZWFuO1xuXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRkZWZhdWx0VmFsdWU6IHVuZGVmaW5lZFxuXHR9KVxuXHR1b21QYXRoITogc3RyaW5nO1xuXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdbXVwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogW11cblx0fSlcblx0bWVhc3VyZXMhOiBzdHJpbmdbXTtcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiB1bmRlZmluZWRcblx0fSlcblx0ZGltZW5zaW9uPzogc3RyaW5nO1xuXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdbXVwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogW11cblx0fSlcblx0ZGF0YVBvaW50UXVhbGlmaWVycyE6IHN0cmluZ1tdO1xuXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJpbnRcIixcblx0XHRkZWZhdWx0VmFsdWU6IHVuZGVmaW5lZFxuXHR9KVxuXHRtZWFzdXJlUHJlY2lzaW9uITogbnVtYmVyO1xuXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJpbnRcIixcblx0XHRkZWZhdWx0VmFsdWU6IDFcblx0fSlcblx0bWVhc3VyZVNjYWxlITogbnVtYmVyO1xuXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJpbnRcIixcblx0XHRkZWZhdWx0VmFsdWU6IHVuZGVmaW5lZFxuXHR9KVxuXHRkaW1lbnNpb25QcmVjaXNpb24/OiBudW1iZXI7XG5cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGRlZmF1bHRWYWx1ZTogXCJcIlxuXHR9KVxuXHRjaGFydFRpdGxlITogc3RyaW5nO1xuXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRkZWZhdWx0VmFsdWU6IFwiXCJcblx0fSlcblx0Y2hhcnREZXNjcmlwdGlvbiE6IHN0cmluZztcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic2FwLmZlLm1hY3Jvcy5OYXZpZ2F0aW9uVHlwZVwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogXCJOb25lXCJcblx0fSlcblx0bmF2aWdhdGlvblR5cGUhOiB0eXBlb2YgTmF2aWdhdGlvblR5cGU7XG5cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGRlZmF1bHRWYWx1ZTogXCJcIlxuXHR9KVxuXHRjYWxlbmRhclBhdHRlcm4hOiBzdHJpbmc7XG5cblx0QGV2ZW50KClcblx0b25UaXRsZVByZXNzZWQhOiBGdW5jdGlvbjtcblxuXHRAYWdncmVnYXRpb24oe1xuXHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLFxuXHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHRpc0RlZmF1bHQ6IHRydWVcblx0fSlcblx0bWljcm9DaGFydCE6IENvbnRyb2w7XG5cblx0QGFnZ3JlZ2F0aW9uKHtcblx0XHR0eXBlOiBcInNhcC5tLkxhYmVsXCIsXG5cdFx0bXVsdGlwbGU6IGZhbHNlXG5cdH0pXG5cdF91b21MYWJlbCE6IExhYmVsO1xuXG5cdEBhZ2dyZWdhdGlvbih7XG5cdFx0dHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsXG5cdFx0bXVsdGlwbGU6IHRydWVcblx0fSlcblx0bWljcm9DaGFydFRpdGxlITogQ29udHJvbFtdO1xuXG5cdHByaXZhdGUgX29saXN0QmluZGluZz86IE9EYXRhVjRMaXN0QmluZGluZztcblxuXHRwcml2YXRlIF9vRGF0ZVR5cGU/OiBEYXRlVHlwZTtcblxuXHRzdGF0aWMgcmVuZGVyKHJlbmRlck1hbmFnZXI6IFJlbmRlck1hbmFnZXIsIGNvbnRyb2w6IE1pY3JvQ2hhcnRDb250YWluZXIpIHtcblx0XHRyZW5kZXJNYW5hZ2VyLm9wZW5TdGFydChcImRpdlwiLCBjb250cm9sKTtcblx0XHRyZW5kZXJNYW5hZ2VyLm9wZW5FbmQoKTtcblx0XHRpZiAoIWNvbnRyb2wuc2hvd09ubHlDaGFydCkge1xuXHRcdFx0Y29uc3QgY2hhcnRUaXRsZSA9IGNvbnRyb2wubWljcm9DaGFydFRpdGxlO1xuXHRcdFx0aWYgKGNoYXJ0VGl0bGUpIHtcblx0XHRcdFx0Y2hhcnRUaXRsZS5mb3JFYWNoKGZ1bmN0aW9uIChzdWJDaGFydFRpdGxlKSB7XG5cdFx0XHRcdFx0cmVuZGVyTWFuYWdlci5vcGVuU3RhcnQoXCJkaXZcIik7XG5cdFx0XHRcdFx0cmVuZGVyTWFuYWdlci5vcGVuRW5kKCk7XG5cdFx0XHRcdFx0cmVuZGVyTWFuYWdlci5yZW5kZXJDb250cm9sKHN1YkNoYXJ0VGl0bGUpO1xuXHRcdFx0XHRcdHJlbmRlck1hbmFnZXIuY2xvc2UoXCJkaXZcIik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0cmVuZGVyTWFuYWdlci5vcGVuU3RhcnQoXCJkaXZcIik7XG5cdFx0XHRyZW5kZXJNYW5hZ2VyLm9wZW5FbmQoKTtcblx0XHRcdGNvbnN0IGNoYXJ0RGVzY3JpcHRpb24gPSBuZXcgTGFiZWwoeyB0ZXh0OiBjb250cm9sLmNoYXJ0RGVzY3JpcHRpb24gfSk7XG5cdFx0XHRyZW5kZXJNYW5hZ2VyLnJlbmRlckNvbnRyb2woY2hhcnREZXNjcmlwdGlvbik7XG5cdFx0XHRyZW5kZXJNYW5hZ2VyLmNsb3NlKFwiZGl2XCIpO1xuXHRcdH1cblx0XHRjb25zdCBtaWNyb0NoYXJ0ID0gY29udHJvbC5taWNyb0NoYXJ0O1xuXHRcdGlmIChtaWNyb0NoYXJ0KSB7XG5cdFx0XHRtaWNyb0NoYXJ0LmFkZFN0eWxlQ2xhc3MoXCJzYXBVaVRpbnlNYXJnaW5Ub3BCb3R0b21cIik7XG5cdFx0XHRyZW5kZXJNYW5hZ2VyLnJlbmRlckNvbnRyb2wobWljcm9DaGFydCk7XG5cdFx0XHRpZiAoIWNvbnRyb2wuc2hvd09ubHlDaGFydCAmJiBjb250cm9sLnVvbVBhdGgpIHtcblx0XHRcdFx0Y29uc3Qgc2V0dGluZ3MgPSBjb250cm9sLl9jaGVja0lmQ2hhcnRSZXF1aXJlc1J1bnRpbWVMYWJlbHMoKSA/IHVuZGVmaW5lZCA6IHsgdGV4dDogeyBwYXRoOiBjb250cm9sLnVvbVBhdGggfSB9LFxuXHRcdFx0XHRcdGxhYmVsID0gbmV3IExhYmVsKHNldHRpbmdzKSxcblx0XHRcdFx0XHRmbGV4Qm94ID0gbmV3IEZsZXhCb3goe1xuXHRcdFx0XHRcdFx0YWxpZ25JdGVtczogXCJTdGFydFwiLFxuXHRcdFx0XHRcdFx0anVzdGlmeUNvbnRlbnQ6IFwiRW5kXCIsXG5cdFx0XHRcdFx0XHRpdGVtczogW2xhYmVsXVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRyZW5kZXJNYW5hZ2VyLnJlbmRlckNvbnRyb2woZmxleEJveCk7XG5cdFx0XHRcdGNvbnRyb2wuc2V0QWdncmVnYXRpb24oXCJfdW9tTGFiZWxcIiwgbGFiZWwpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZW5kZXJNYW5hZ2VyLmNsb3NlKFwiZGl2XCIpO1xuXHR9XG5cblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0Y29uc3QgYmluZGluZyA9IHRoaXMuX2dldExpc3RCaW5kaW5nRm9yUnVudGltZUxhYmVscygpO1xuXG5cdFx0aWYgKGJpbmRpbmcpIHtcblx0XHRcdGJpbmRpbmcuZGV0YWNoRXZlbnQoXCJjaGFuZ2VcIiwgdGhpcy5fc2V0UnVudGltZUNoYXJ0TGFiZWxzQW5kVW5pdE9mTWVhc3VyZSwgdGhpcyk7XG5cdFx0XHR0aGlzLl9vbGlzdEJpbmRpbmcgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHRjb25zdCBiaW5kaW5nID0gdGhpcy5fZ2V0TGlzdEJpbmRpbmdGb3JSdW50aW1lTGFiZWxzKCk7XG5cblx0XHRpZiAoIXRoaXMuX2NoZWNrSWZDaGFydFJlcXVpcmVzUnVudGltZUxhYmVscygpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKGJpbmRpbmcpIHtcblx0XHRcdChiaW5kaW5nLmF0dGFjaEV2ZW50IGFzIGFueSkoXCJjaGFuZ2VcIiwgdGhpcy5fc2V0UnVudGltZUNoYXJ0TGFiZWxzQW5kVW5pdE9mTWVhc3VyZSwgdGhpcyk7XG5cdFx0XHR0aGlzLl9vbGlzdEJpbmRpbmcgPSBiaW5kaW5nO1xuXHRcdH1cblx0fVxuXG5cdHNldFNob3dPbmx5Q2hhcnQodmFsdWU6IGJvb2xlYW4pIHtcblx0XHRpZiAoIXZhbHVlICYmIHRoaXMuX29saXN0QmluZGluZykge1xuXHRcdFx0dGhpcy5fc2V0Q2hhcnRMYWJlbHMoKTtcblx0XHR9XG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcInNob3dPbmx5Q2hhcnRcIiwgdmFsdWUsIGZhbHNlIC8qcmUtcmVuZGVyaW5nKi8pO1xuXHR9XG5cblx0X2NoZWNrSWZDaGFydFJlcXVpcmVzUnVudGltZUxhYmVscygpIHtcblx0XHRjb25zdCBtaWNyb0NoYXJ0ID0gdGhpcy5taWNyb0NoYXJ0O1xuXG5cdFx0cmV0dXJuIEJvb2xlYW4oXG5cdFx0XHRtaWNyb0NoYXJ0IGluc3RhbmNlb2YgQXJlYU1pY3JvQ2hhcnQgfHxcblx0XHRcdFx0bWljcm9DaGFydCBpbnN0YW5jZW9mIENvbHVtbk1pY3JvQ2hhcnQgfHxcblx0XHRcdFx0bWljcm9DaGFydCBpbnN0YW5jZW9mIExpbmVNaWNyb0NoYXJ0IHx8XG5cdFx0XHRcdG1pY3JvQ2hhcnQgaW5zdGFuY2VvZiBDb21wYXJpc29uTWljcm9DaGFydFxuXHRcdCk7XG5cdH1cblxuXHRfY2hlY2tGb3JDaGFydExhYmVsQWdncmVnYXRpb25zKCkge1xuXHRcdGNvbnN0IG1pY3JvQ2hhcnQgPSB0aGlzLm1pY3JvQ2hhcnQ7XG5cdFx0cmV0dXJuIEJvb2xlYW4oXG5cdFx0XHQobWljcm9DaGFydCBpbnN0YW5jZW9mIEFyZWFNaWNyb0NoYXJ0ICYmXG5cdFx0XHRcdG1pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJmaXJzdFlMYWJlbFwiKSAmJlxuXHRcdFx0XHRtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwibGFzdFlMYWJlbFwiKSAmJlxuXHRcdFx0XHRtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwiZmlyc3RYTGFiZWxcIikgJiZcblx0XHRcdFx0bWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImxhc3RYTGFiZWxcIikpIHx8XG5cdFx0XHRcdChtaWNyb0NoYXJ0IGluc3RhbmNlb2YgQ29sdW1uTWljcm9DaGFydCAmJlxuXHRcdFx0XHRcdG1pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsZWZ0VG9wTGFiZWxcIikgJiZcblx0XHRcdFx0XHRtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwicmlnaHRUb3BMYWJlbFwiKSAmJlxuXHRcdFx0XHRcdG1pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsZWZ0Qm90dG9tTGFiZWxcIikgJiZcblx0XHRcdFx0XHRtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwicmlnaHRCb3R0b21MYWJlbFwiKSkgfHxcblx0XHRcdFx0bWljcm9DaGFydCBpbnN0YW5jZW9mIExpbmVNaWNyb0NoYXJ0XG5cdFx0KTtcblx0fVxuXG5cdF9nZXRMaXN0QmluZGluZ0ZvclJ1bnRpbWVMYWJlbHMoKSB7XG5cdFx0Y29uc3QgbWljcm9DaGFydCA9IHRoaXMubWljcm9DaGFydDtcblx0XHRsZXQgYmluZGluZztcblx0XHRpZiAobWljcm9DaGFydCBpbnN0YW5jZW9mIEFyZWFNaWNyb0NoYXJ0KSB7XG5cdFx0XHRjb25zdCBjaGFydCA9IG1pY3JvQ2hhcnQuZ2V0Q2hhcnQoKTtcblx0XHRcdGJpbmRpbmcgPSBjaGFydCAmJiBjaGFydC5nZXRCaW5kaW5nKFwicG9pbnRzXCIpO1xuXHRcdH0gZWxzZSBpZiAobWljcm9DaGFydCBpbnN0YW5jZW9mIENvbHVtbk1pY3JvQ2hhcnQpIHtcblx0XHRcdGJpbmRpbmcgPSBtaWNyb0NoYXJ0LmdldEJpbmRpbmcoXCJjb2x1bW5zXCIpO1xuXHRcdH0gZWxzZSBpZiAobWljcm9DaGFydCBpbnN0YW5jZW9mIExpbmVNaWNyb0NoYXJ0KSB7XG5cdFx0XHRjb25zdCBsaW5lcyA9IG1pY3JvQ2hhcnQuZ2V0TGluZXMoKTtcblx0XHRcdGJpbmRpbmcgPSBsaW5lcyAmJiBsaW5lcy5sZW5ndGggJiYgbGluZXNbMF0uZ2V0QmluZGluZyhcInBvaW50c1wiKTtcblx0XHR9IGVsc2UgaWYgKG1pY3JvQ2hhcnQgaW5zdGFuY2VvZiBDb21wYXJpc29uTWljcm9DaGFydCkge1xuXHRcdFx0YmluZGluZyA9IG1pY3JvQ2hhcnQuZ2V0QmluZGluZyhcImRhdGFcIik7XG5cdFx0fVxuXHRcdHJldHVybiBiaW5kaW5nIGluc3RhbmNlb2YgT0RhdGFWNExpc3RCaW5kaW5nID8gYmluZGluZyA6IGZhbHNlO1xuXHR9XG5cblx0YXN5bmMgX3NldFJ1bnRpbWVDaGFydExhYmVsc0FuZFVuaXRPZk1lYXN1cmUoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgbGlzdEJpbmRpbmcgPSB0aGlzLl9vbGlzdEJpbmRpbmcsXG5cdFx0XHRjb250ZXh0cyA9IGxpc3RCaW5kaW5nPy5nZXRDb250ZXh0cygpLFxuXHRcdFx0bWVhc3VyZXMgPSB0aGlzLm1lYXN1cmVzLFxuXHRcdFx0ZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb24sXG5cdFx0XHR1bml0T2ZNZWFzdXJlUGF0aCA9IHRoaXMudW9tUGF0aCxcblx0XHRcdG1pY3JvQ2hhcnQgPSB0aGlzLm1pY3JvQ2hhcnQsXG5cdFx0XHR1bml0T2ZNZWFzdXJlTGFiZWwgPSB0aGlzLl91b21MYWJlbDtcblxuXHRcdGlmICh1bml0T2ZNZWFzdXJlTGFiZWwgJiYgdW5pdE9mTWVhc3VyZVBhdGggJiYgY29udGV4dHMgJiYgY29udGV4dHMubGVuZ3RoICYmICF0aGlzLnNob3dPbmx5Q2hhcnQpIHtcblx0XHRcdHVuaXRPZk1lYXN1cmVMYWJlbC5zZXRUZXh0KGNvbnRleHRzWzBdLmdldE9iamVjdCh1bml0T2ZNZWFzdXJlUGF0aCkpO1xuXHRcdH0gZWxzZSBpZiAodW5pdE9mTWVhc3VyZUxhYmVsKSB7XG5cdFx0XHR1bml0T2ZNZWFzdXJlTGFiZWwuc2V0VGV4dChcIlwiKTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuX2NoZWNrRm9yQ2hhcnRMYWJlbEFnZ3JlZ2F0aW9ucygpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCFjb250ZXh0cyB8fCAhY29udGV4dHMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLl9zZXRDaGFydExhYmVscygpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZpcnN0Q29udGV4dCA9IGNvbnRleHRzWzBdLFxuXHRcdFx0bGFzdENvbnRleHQgPSBjb250ZXh0c1tjb250ZXh0cy5sZW5ndGggLSAxXSxcblx0XHRcdGxpbmVzUG9taXNlczogUHJvbWlzZTxtb2JpbGVsaWJyYXJ5LlZhbHVlQ29sb3I+W10gPSBbXSxcblx0XHRcdGxpbmVDaGFydCA9IG1pY3JvQ2hhcnQgaW5zdGFuY2VvZiBMaW5lTWljcm9DaGFydCxcblx0XHRcdGN1cnJlbnRNaW5YID0gZmlyc3RDb250ZXh0LmdldE9iamVjdChkaW1lbnNpb24pLFxuXHRcdFx0Y3VycmVudE1heFggPSBsYXN0Q29udGV4dC5nZXRPYmplY3QoZGltZW5zaW9uKTtcblx0XHRsZXQgY3VycmVudE1pblksXG5cdFx0XHRjdXJyZW50TWF4WSxcblx0XHRcdG1pblg6IERhdGFQb2ludFZhbHVlVHlwZSA9IHsgdmFsdWU6IEluZmluaXR5IH0sXG5cdFx0XHRtYXhYOiBEYXRhUG9pbnRWYWx1ZVR5cGUgPSB7IHZhbHVlOiAtSW5maW5pdHkgfSxcblx0XHRcdG1pblk6IERhdGFQb2ludFZhbHVlVHlwZSA9IHsgdmFsdWU6IEluZmluaXR5IH0sXG5cdFx0XHRtYXhZOiBEYXRhUG9pbnRWYWx1ZVR5cGUgPSB7IHZhbHVlOiAtSW5maW5pdHkgfTtcblxuXHRcdG1pblggPSBjdXJyZW50TWluWCA9PSB1bmRlZmluZWQgPyBtaW5YIDogeyBjb250ZXh0OiBmaXJzdENvbnRleHQsIHZhbHVlOiBjdXJyZW50TWluWCB9O1xuXHRcdG1heFggPSBjdXJyZW50TWF4WCA9PSB1bmRlZmluZWQgPyBtYXhYIDogeyBjb250ZXh0OiBsYXN0Q29udGV4dCwgdmFsdWU6IGN1cnJlbnRNYXhYIH07XG5cblx0XHRpZiAobWVhc3VyZXM/Lmxlbmd0aCkge1xuXHRcdFx0bWVhc3VyZXMuZm9yRWFjaCgobWVhc3VyZTogc3RyaW5nLCBpOiBudW1iZXIpID0+IHtcblx0XHRcdFx0Y3VycmVudE1pblkgPSBmaXJzdENvbnRleHQuZ2V0T2JqZWN0KG1lYXN1cmUpO1xuXHRcdFx0XHRjdXJyZW50TWF4WSA9IGxhc3RDb250ZXh0LmdldE9iamVjdChtZWFzdXJlKTtcblx0XHRcdFx0bWF4WSA9IGN1cnJlbnRNYXhZID4gbWF4WS52YWx1ZSA/IHsgY29udGV4dDogbGFzdENvbnRleHQsIHZhbHVlOiBjdXJyZW50TWF4WSwgaW5kZXg6IGxpbmVDaGFydCA/IGkgOiAwIH0gOiBtYXhZO1xuXHRcdFx0XHRtaW5ZID0gY3VycmVudE1pblkgPCBtaW5ZLnZhbHVlID8geyBjb250ZXh0OiBmaXJzdENvbnRleHQsIHZhbHVlOiBjdXJyZW50TWluWSwgaW5kZXg6IGxpbmVDaGFydCA/IGkgOiAwIH0gOiBtaW5ZO1xuXHRcdFx0XHRpZiAobGluZUNoYXJ0KSB7XG5cdFx0XHRcdFx0bGluZXNQb21pc2VzLnB1c2godGhpcy5fZ2V0Q3JpdGljYWxpdHlGcm9tUG9pbnQoeyBjb250ZXh0OiBsYXN0Q29udGV4dCwgdmFsdWU6IGN1cnJlbnRNYXhZLCBpbmRleDogaSB9KSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHR0aGlzLl9zZXRDaGFydExhYmVscyhtaW5ZLnZhbHVlLCBtYXhZLnZhbHVlLCBtaW5YLnZhbHVlLCBtYXhYLnZhbHVlKTtcblx0XHRpZiAobGluZUNoYXJ0KSB7XG5cdFx0XHRjb25zdCBjb2xvcnMgPSBhd2FpdCBQcm9taXNlLmFsbChsaW5lc1BvbWlzZXMpO1xuXHRcdFx0aWYgKGNvbG9ycz8ubGVuZ3RoKSB7XG5cdFx0XHRcdGNvbnN0IGxpbmVzID0gbWljcm9DaGFydC5nZXRMaW5lcygpO1xuXHRcdFx0XHRsaW5lcy5mb3JFYWNoKGZ1bmN0aW9uIChsaW5lOiBMaW5lTWljcm9DaGFydExpbmUsIGk6IG51bWJlcikge1xuXHRcdFx0XHRcdGxpbmUuc2V0Q29sb3IoY29sb3JzW2ldKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF3YWl0IHRoaXMuX3NldENoYXJ0TGFiZWxzQ29sb3JzKG1heFksIG1pblkpO1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIF9zZXRDaGFydExhYmVsc0NvbG9ycyhtYXhZOiBEYXRhUG9pbnRWYWx1ZVR5cGUsIG1pblk6IERhdGFQb2ludFZhbHVlVHlwZSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IG1pY3JvQ2hhcnQgPSB0aGlzLm1pY3JvQ2hhcnQ7XG5cblx0XHRjb25zdCBjcml0aWNhbGl0eSA9IGF3YWl0IFByb21pc2UuYWxsKFt0aGlzLl9nZXRDcml0aWNhbGl0eUZyb21Qb2ludChtaW5ZKSwgdGhpcy5fZ2V0Q3JpdGljYWxpdHlGcm9tUG9pbnQobWF4WSldKTtcblxuXHRcdGlmIChtaWNyb0NoYXJ0IGluc3RhbmNlb2YgQXJlYU1pY3JvQ2hhcnQpIHtcblx0XHRcdChtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwiZmlyc3RZTGFiZWxcIikgYXMgTWFuYWdlZE9iamVjdCkuc2V0UHJvcGVydHkoXCJjb2xvclwiLCBjcml0aWNhbGl0eVswXSwgdHJ1ZSk7XG5cdFx0XHQobWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImxhc3RZTGFiZWxcIikgYXMgTWFuYWdlZE9iamVjdCkuc2V0UHJvcGVydHkoXCJjb2xvclwiLCBjcml0aWNhbGl0eVsxXSwgdHJ1ZSk7XG5cdFx0fSBlbHNlIGlmIChtaWNyb0NoYXJ0IGluc3RhbmNlb2YgQ29sdW1uTWljcm9DaGFydCkge1xuXHRcdFx0KG1pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsZWZ0VG9wTGFiZWxcIikgYXMgTWFuYWdlZE9iamVjdCkuc2V0UHJvcGVydHkoXCJjb2xvclwiLCBjcml0aWNhbGl0eVswXSwgdHJ1ZSk7XG5cdFx0XHQobWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcInJpZ2h0VG9wTGFiZWxcIikgYXMgTWFuYWdlZE9iamVjdCkuc2V0UHJvcGVydHkoXCJjb2xvclwiLCBjcml0aWNhbGl0eVsxXSwgdHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0X3NldENoYXJ0TGFiZWxzKGxlZnRUb3A/OiBudW1iZXIsIHJpZ2h0VG9wPzogbnVtYmVyLCBsZWZ0Qm90dG9tPzogbnVtYmVyLCByaWdodEJvdHRvbT86IG51bWJlcik6IHZvaWQge1xuXHRcdGNvbnN0IG1pY3JvQ2hhcnQgPSB0aGlzLm1pY3JvQ2hhcnQ7XG5cblx0XHRsZWZ0VG9wID0gdGhpcy5fZm9ybWF0RGF0ZUFuZE51bWJlclZhbHVlKGxlZnRUb3AsIHRoaXMubWVhc3VyZVByZWNpc2lvbiwgdGhpcy5tZWFzdXJlU2NhbGUpO1xuXHRcdHJpZ2h0VG9wID0gdGhpcy5fZm9ybWF0RGF0ZUFuZE51bWJlclZhbHVlKHJpZ2h0VG9wLCB0aGlzLm1lYXN1cmVQcmVjaXNpb24sIHRoaXMubWVhc3VyZVNjYWxlKTtcblx0XHRsZWZ0Qm90dG9tID0gdGhpcy5fZm9ybWF0RGF0ZUFuZE51bWJlclZhbHVlKGxlZnRCb3R0b20sIHRoaXMuZGltZW5zaW9uUHJlY2lzaW9uLCB1bmRlZmluZWQsIHRoaXMuY2FsZW5kYXJQYXR0ZXJuKTtcblx0XHRyaWdodEJvdHRvbSA9IHRoaXMuX2Zvcm1hdERhdGVBbmROdW1iZXJWYWx1ZShyaWdodEJvdHRvbSwgdGhpcy5kaW1lbnNpb25QcmVjaXNpb24sIHVuZGVmaW5lZCwgdGhpcy5jYWxlbmRhclBhdHRlcm4pO1xuXG5cdFx0aWYgKG1pY3JvQ2hhcnQgaW5zdGFuY2VvZiBBcmVhTWljcm9DaGFydCkge1xuXHRcdFx0KG1pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJmaXJzdFlMYWJlbFwiKSBhcyBNYW5hZ2VkT2JqZWN0KS5zZXRQcm9wZXJ0eShcImxhYmVsXCIsIGxlZnRUb3AsIGZhbHNlKTtcblx0XHRcdChtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwibGFzdFlMYWJlbFwiKSBhcyBNYW5hZ2VkT2JqZWN0KS5zZXRQcm9wZXJ0eShcImxhYmVsXCIsIHJpZ2h0VG9wLCBmYWxzZSk7XG5cdFx0XHQobWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImZpcnN0WExhYmVsXCIpIGFzIE1hbmFnZWRPYmplY3QpLnNldFByb3BlcnR5KFwibGFiZWxcIiwgbGVmdEJvdHRvbSwgZmFsc2UpO1xuXHRcdFx0KG1pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsYXN0WExhYmVsXCIpIGFzIE1hbmFnZWRPYmplY3QpLnNldFByb3BlcnR5KFwibGFiZWxcIiwgcmlnaHRCb3R0b20sIGZhbHNlKTtcblx0XHR9IGVsc2UgaWYgKG1pY3JvQ2hhcnQgaW5zdGFuY2VvZiBDb2x1bW5NaWNyb0NoYXJ0KSB7XG5cdFx0XHQobWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImxlZnRUb3BMYWJlbFwiKSBhcyBNYW5hZ2VkT2JqZWN0KS5zZXRQcm9wZXJ0eShcImxhYmVsXCIsIGxlZnRUb3AsIGZhbHNlKTtcblx0XHRcdChtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwicmlnaHRUb3BMYWJlbFwiKSBhcyBNYW5hZ2VkT2JqZWN0KS5zZXRQcm9wZXJ0eShcImxhYmVsXCIsIHJpZ2h0VG9wLCBmYWxzZSk7XG5cdFx0XHQobWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImxlZnRCb3R0b21MYWJlbFwiKSBhcyBNYW5hZ2VkT2JqZWN0KS5zZXRQcm9wZXJ0eShcImxhYmVsXCIsIGxlZnRCb3R0b20sIGZhbHNlKTtcblx0XHRcdChtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwicmlnaHRCb3R0b21MYWJlbFwiKSBhcyBNYW5hZ2VkT2JqZWN0KS5zZXRQcm9wZXJ0eShcImxhYmVsXCIsIHJpZ2h0Qm90dG9tLCBmYWxzZSk7XG5cdFx0fSBlbHNlIGlmIChtaWNyb0NoYXJ0IGluc3RhbmNlb2YgTGluZU1pY3JvQ2hhcnQpIHtcblx0XHRcdG1pY3JvQ2hhcnQuc2V0UHJvcGVydHkoXCJsZWZ0VG9wTGFiZWxcIiwgbGVmdFRvcCwgZmFsc2UpO1xuXHRcdFx0bWljcm9DaGFydC5zZXRQcm9wZXJ0eShcInJpZ2h0VG9wTGFiZWxcIiwgcmlnaHRUb3AsIGZhbHNlKTtcblx0XHRcdG1pY3JvQ2hhcnQuc2V0UHJvcGVydHkoXCJsZWZ0Qm90dG9tTGFiZWxcIiwgbGVmdEJvdHRvbSwgZmFsc2UpO1xuXHRcdFx0bWljcm9DaGFydC5zZXRQcm9wZXJ0eShcInJpZ2h0Qm90dG9tTGFiZWxcIiwgcmlnaHRCb3R0b20sIGZhbHNlKTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBfZ2V0Q3JpdGljYWxpdHlGcm9tUG9pbnQocG9pbnQ6IERhdGFQb2ludFZhbHVlVHlwZSk6IFByb21pc2U8bW9iaWxlbGlicmFyeS5WYWx1ZUNvbG9yPiB7XG5cdFx0aWYgKHBvaW50Py5jb250ZXh0KSB7XG5cdFx0XHRjb25zdCBtZXRhTW9kZWwgPSB0aGlzLmdldE1vZGVsKCkgJiYgKHRoaXMuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsKS5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0ZGF0YVBvaW50UXVhbGlmaWVycyA9IHRoaXMuZGF0YVBvaW50UXVhbGlmaWVycyxcblx0XHRcdFx0bWV0YVBhdGggPSBtZXRhTW9kZWwgaW5zdGFuY2VvZiBPRGF0YU1ldGFNb2RlbCAmJiBwb2ludC5jb250ZXh0LmdldFBhdGgoKSAmJiBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgocG9pbnQuY29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0aWYgKG1ldGFNb2RlbCAmJiB0eXBlb2YgbWV0YVBhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0Y29uc3QgZGF0YVBvaW50ID0gYXdhaXQgbWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoXG5cdFx0XHRcdFx0YCR7bWV0YVBhdGh9L0Ake1VJQW5ub3RhdGlvblRlcm1zLkRhdGFQb2ludH0ke1xuXHRcdFx0XHRcdFx0cG9pbnQuaW5kZXggIT09IHVuZGVmaW5lZCAmJiBkYXRhUG9pbnRRdWFsaWZpZXJzW3BvaW50LmluZGV4XSA/IGAjJHtkYXRhUG9pbnRRdWFsaWZpZXJzW3BvaW50LmluZGV4XX1gIDogXCJcIlxuXHRcdFx0XHRcdH1gXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChkYXRhUG9pbnQpIHtcblx0XHRcdFx0XHRsZXQgY3JpdGljYWxpdHkgPSBWYWx1ZUNvbG9yLk5ldXRyYWw7XG5cdFx0XHRcdFx0Y29uc3QgY29udGV4dCA9IHBvaW50LmNvbnRleHQ7XG5cblx0XHRcdFx0XHRpZiAoZGF0YVBvaW50LkNyaXRpY2FsaXR5KSB7XG5cdFx0XHRcdFx0XHRjcml0aWNhbGl0eSA9IHRoaXMuX2NyaXRpY2FsaXR5KGRhdGFQb2ludC5Dcml0aWNhbGl0eSwgY29udGV4dCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChkYXRhUG9pbnQuQ3JpdGljYWxpdHlDYWxjdWxhdGlvbikge1xuXHRcdFx0XHRcdFx0Y29uc3QgY3JpdGljYWxpdHlDYWxjdWxhdGlvbiA9IGRhdGFQb2ludC5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uO1xuXHRcdFx0XHRcdFx0Y29uc3QgZ2V0VmFsdWUgPSBmdW5jdGlvbiAodmFsdWVQcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdGxldCB2YWx1ZVJlc3BvbnNlO1xuXHRcdFx0XHRcdFx0XHRpZiAodmFsdWVQcm9wZXJ0eT8uJFBhdGgpIHtcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZVJlc3BvbnNlID0gY29udGV4dC5nZXRPYmplY3QodmFsdWVQcm9wZXJ0eS4kUGF0aCk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAodmFsdWVQcm9wZXJ0eT8uaGFzT3duUHJvcGVydHkoXCIkRGVjaW1hbFwiKSkge1xuXHRcdFx0XHRcdFx0XHRcdHZhbHVlUmVzcG9uc2UgPSB2YWx1ZVByb3BlcnR5LiREZWNpbWFsO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZVJlc3BvbnNlO1xuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0Y3JpdGljYWxpdHkgPSB0aGlzLl9jcml0aWNhbGl0eUNhbGN1bGF0aW9uKFxuXHRcdFx0XHRcdFx0XHRjcml0aWNhbGl0eUNhbGN1bGF0aW9uLkltcHJvdmVtZW50RGlyZWN0aW9uLiRFbnVtTWVtYmVyLFxuXHRcdFx0XHRcdFx0XHRwb2ludC52YWx1ZSxcblx0XHRcdFx0XHRcdFx0Z2V0VmFsdWUoY3JpdGljYWxpdHlDYWxjdWxhdGlvbi5EZXZpYXRpb25SYW5nZUxvd1ZhbHVlKSxcblx0XHRcdFx0XHRcdFx0Z2V0VmFsdWUoY3JpdGljYWxpdHlDYWxjdWxhdGlvbi5Ub2xlcmFuY2VSYW5nZUxvd1ZhbHVlKSxcblx0XHRcdFx0XHRcdFx0Z2V0VmFsdWUoY3JpdGljYWxpdHlDYWxjdWxhdGlvbi5BY2NlcHRhbmNlUmFuZ2VMb3dWYWx1ZSksXG5cdFx0XHRcdFx0XHRcdGdldFZhbHVlKGNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlKSxcblx0XHRcdFx0XHRcdFx0Z2V0VmFsdWUoY3JpdGljYWxpdHlDYWxjdWxhdGlvbi5Ub2xlcmFuY2VSYW5nZUhpZ2hWYWx1ZSksXG5cdFx0XHRcdFx0XHRcdGdldFZhbHVlKGNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWUpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBjcml0aWNhbGl0eTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoVmFsdWVDb2xvci5OZXV0cmFsKTtcblx0fVxuXG5cdF9jcml0aWNhbGl0eShjcml0aWNhbGl0eTogYW55LCBjb250ZXh0OiBDb250ZXh0KTogbW9iaWxlbGlicmFyeS5WYWx1ZUNvbG9yIHtcblx0XHRsZXQgY3JpdGljYWxpdHlWYWx1ZSwgcmVzdWx0O1xuXHRcdGlmIChjcml0aWNhbGl0eS4kUGF0aCkge1xuXHRcdFx0Y3JpdGljYWxpdHlWYWx1ZSA9IGNvbnRleHQuZ2V0T2JqZWN0KGNyaXRpY2FsaXR5LiRQYXRoKTtcblx0XHRcdGlmIChjcml0aWNhbGl0eVZhbHVlID09PSBDcml0aWNhbGl0eVR5cGUuTmVnYXRpdmUgfHwgY3JpdGljYWxpdHlWYWx1ZS50b1N0cmluZygpID09PSBcIjFcIikge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkVycm9yO1xuXHRcdFx0fSBlbHNlIGlmIChjcml0aWNhbGl0eVZhbHVlID09PSBDcml0aWNhbGl0eVR5cGUuQ3JpdGljYWwgfHwgY3JpdGljYWxpdHlWYWx1ZS50b1N0cmluZygpID09PSBcIjJcIikge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkNyaXRpY2FsO1xuXHRcdFx0fSBlbHNlIGlmIChjcml0aWNhbGl0eVZhbHVlID09PSBDcml0aWNhbGl0eVR5cGUuUG9zaXRpdmUgfHwgY3JpdGljYWxpdHlWYWx1ZS50b1N0cmluZygpID09PSBcIjNcIikge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkdvb2Q7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChjcml0aWNhbGl0eS4kRW51bU1lbWJlcikge1xuXHRcdFx0Y3JpdGljYWxpdHlWYWx1ZSA9IGNyaXRpY2FsaXR5LiRFbnVtTWVtYmVyO1xuXHRcdFx0aWYgKGNyaXRpY2FsaXR5VmFsdWUuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5VHlwZS9OZWdhdGl2ZVwiKSA+IC0xKSB7XG5cdFx0XHRcdHJlc3VsdCA9IFZhbHVlQ29sb3IuRXJyb3I7XG5cdFx0XHR9IGVsc2UgaWYgKGNyaXRpY2FsaXR5VmFsdWUuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5VHlwZS9Qb3NpdGl2ZVwiKSA+IC0xKSB7XG5cdFx0XHRcdHJlc3VsdCA9IFZhbHVlQ29sb3IuR29vZDtcblx0XHRcdH0gZWxzZSBpZiAoY3JpdGljYWxpdHlWYWx1ZS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JpdGljYWxpdHlUeXBlL0NyaXRpY2FsXCIpID4gLTEpIHtcblx0XHRcdFx0cmVzdWx0ID0gVmFsdWVDb2xvci5Dcml0aWNhbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRMb2cud2FybmluZyhcIkNhc2Ugbm90IHN1cHBvcnRlZCwgcmV0dXJuaW5nIHRoZSBkZWZhdWx0IFZhbHVlIE5ldXRyYWxcIik7XG5cdFx0XHRyZXR1cm4gVmFsdWVDb2xvci5OZXV0cmFsO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0X2NyaXRpY2FsaXR5Q2FsY3VsYXRpb24oXG5cdFx0aW1wcm92ZW1lbnREaXJlY3Rpb246IHN0cmluZyxcblx0XHR2YWx1ZTogbnVtYmVyLFxuXHRcdGRldmlhdGlvbkxvdz86IHN0cmluZyB8IG51bWJlcixcblx0XHR0b2xlcmFuY2VMb3c/OiBzdHJpbmcgfCBudW1iZXIsXG5cdFx0YWNjZXB0YW5jZUxvdz86IHN0cmluZyB8IG51bWJlcixcblx0XHRhY2NlcHRhbmNlSGlnaD86IHN0cmluZyB8IG51bWJlcixcblx0XHR0b2xlcmFuY2VIaWdoPzogc3RyaW5nIHwgbnVtYmVyLFxuXHRcdGRldmlhdGlvbkhpZ2g/OiBzdHJpbmcgfCBudW1iZXJcblx0KTogbW9iaWxlbGlicmFyeS5WYWx1ZUNvbG9yIHtcblx0XHRsZXQgcmVzdWx0O1xuXG5cdFx0Ly8gRGVhbGluZyB3aXRoIERlY2ltYWwgYW5kIFBhdGggYmFzZWQgYmluZ2RpbmdzXG5cdFx0ZGV2aWF0aW9uTG93ID0gZGV2aWF0aW9uTG93ID09IHVuZGVmaW5lZCA/IC1JbmZpbml0eSA6IGRldmlhdGlvbkxvdztcblx0XHR0b2xlcmFuY2VMb3cgPSB0b2xlcmFuY2VMb3cgPT0gdW5kZWZpbmVkID8gZGV2aWF0aW9uTG93IDogdG9sZXJhbmNlTG93O1xuXHRcdGFjY2VwdGFuY2VMb3cgPSBhY2NlcHRhbmNlTG93ID09IHVuZGVmaW5lZCA/IHRvbGVyYW5jZUxvdyA6IGFjY2VwdGFuY2VMb3c7XG5cdFx0ZGV2aWF0aW9uSGlnaCA9IGRldmlhdGlvbkhpZ2ggPT0gdW5kZWZpbmVkID8gSW5maW5pdHkgOiBkZXZpYXRpb25IaWdoO1xuXHRcdHRvbGVyYW5jZUhpZ2ggPSB0b2xlcmFuY2VIaWdoID09IHVuZGVmaW5lZCA/IGRldmlhdGlvbkhpZ2ggOiB0b2xlcmFuY2VIaWdoO1xuXHRcdGFjY2VwdGFuY2VIaWdoID0gYWNjZXB0YW5jZUhpZ2ggPT0gdW5kZWZpbmVkID8gdG9sZXJhbmNlSGlnaCA6IGFjY2VwdGFuY2VIaWdoO1xuXG5cdFx0Ly8gQ3JlYXRpbmcgcnVudGltZSBleHByZXNzaW9uIGJpbmRpbmcgZnJvbSBjcml0aWNhbGl0eSBjYWxjdWxhdGlvbiBmb3IgQ3JpdGljYWxpdHkgU3RhdGVcblx0XHRpZiAoaW1wcm92ZW1lbnREaXJlY3Rpb24uaW5kZXhPZihcIk1pbmltaXplXCIpID4gLTEpIHtcblx0XHRcdGlmICh2YWx1ZSA8PSBhY2NlcHRhbmNlSGlnaCkge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkdvb2Q7XG5cdFx0XHR9IGVsc2UgaWYgKHZhbHVlIDw9IHRvbGVyYW5jZUhpZ2gpIHtcblx0XHRcdFx0cmVzdWx0ID0gVmFsdWVDb2xvci5OZXV0cmFsO1xuXHRcdFx0fSBlbHNlIGlmICh2YWx1ZSA8PSBkZXZpYXRpb25IaWdoKSB7XG5cdFx0XHRcdHJlc3VsdCA9IFZhbHVlQ29sb3IuQ3JpdGljYWw7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkVycm9yO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoaW1wcm92ZW1lbnREaXJlY3Rpb24uaW5kZXhPZihcIk1heGltaXplXCIpID4gLTEpIHtcblx0XHRcdGlmICh2YWx1ZSA+PSBhY2NlcHRhbmNlTG93KSB7XG5cdFx0XHRcdHJlc3VsdCA9IFZhbHVlQ29sb3IuR29vZDtcblx0XHRcdH0gZWxzZSBpZiAodmFsdWUgPj0gdG9sZXJhbmNlTG93KSB7XG5cdFx0XHRcdHJlc3VsdCA9IFZhbHVlQ29sb3IuTmV1dHJhbDtcblx0XHRcdH0gZWxzZSBpZiAodmFsdWUgPj0gZGV2aWF0aW9uTG93KSB7XG5cdFx0XHRcdHJlc3VsdCA9IFZhbHVlQ29sb3IuQ3JpdGljYWw7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkVycm9yO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoaW1wcm92ZW1lbnREaXJlY3Rpb24uaW5kZXhPZihcIlRhcmdldFwiKSA+IC0xKSB7XG5cdFx0XHRpZiAodmFsdWUgPD0gYWNjZXB0YW5jZUhpZ2ggJiYgdmFsdWUgPj0gYWNjZXB0YW5jZUxvdykge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkdvb2Q7XG5cdFx0XHR9IGVsc2UgaWYgKCh2YWx1ZSA+PSB0b2xlcmFuY2VMb3cgJiYgdmFsdWUgPCBhY2NlcHRhbmNlTG93KSB8fCAodmFsdWUgPiBhY2NlcHRhbmNlSGlnaCAmJiB2YWx1ZSA8PSB0b2xlcmFuY2VIaWdoKSkge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLk5ldXRyYWw7XG5cdFx0XHR9IGVsc2UgaWYgKCh2YWx1ZSA+PSBkZXZpYXRpb25Mb3cgJiYgdmFsdWUgPCB0b2xlcmFuY2VMb3cpIHx8ICh2YWx1ZSA+IHRvbGVyYW5jZUhpZ2ggJiYgdmFsdWUgPD0gZGV2aWF0aW9uSGlnaCkpIHtcblx0XHRcdFx0cmVzdWx0ID0gVmFsdWVDb2xvci5Dcml0aWNhbDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlc3VsdCA9IFZhbHVlQ29sb3IuRXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRMb2cud2FybmluZyhcIkNhc2Ugbm90IHN1cHBvcnRlZCwgcmV0dXJuaW5nIHRoZSBkZWZhdWx0IFZhbHVlIE5ldXRyYWxcIik7XG5cdFx0XHRyZXR1cm4gVmFsdWVDb2xvci5OZXV0cmFsO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRfZm9ybWF0RGF0ZUFuZE51bWJlclZhbHVlKHZhbHVlPzogbnVtYmVyIHwgc3RyaW5nLCBwcmVjaXNpb24/OiBudW1iZXIsIHNjYWxlPzogbnVtYmVyLCBwYXR0ZXJuPzogc3RyaW5nKSB7XG5cdFx0aWYgKHBhdHRlcm4pIHtcblx0XHRcdHJldHVybiB0aGlzLl9nZXRTZW1hbnRpY3NWYWx1ZUZvcm1hdHRlcihwYXR0ZXJuKS5mb3JtYXRWYWx1ZSh2YWx1ZSwgXCJzdHJpbmdcIik7XG5cdFx0fSBlbHNlIGlmICghaXNOYU4odmFsdWUgYXMgbnVtYmVyKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2dldExhYmVsTnVtYmVyRm9ybWF0dGVyKHByZWNpc2lvbiwgc2NhbGUpLmZvcm1hdCh2YWx1ZSBhcyBudW1iZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxuXG5cdF9nZXRTZW1hbnRpY3NWYWx1ZUZvcm1hdHRlcihwYXR0ZXJuOiBzdHJpbmcpIHtcblx0XHRpZiAoIXRoaXMuX29EYXRlVHlwZSkge1xuXHRcdFx0dGhpcy5fb0RhdGVUeXBlID0gbmV3IERhdGVUeXBlKHtcblx0XHRcdFx0c3R5bGU6IFwic2hvcnRcIixcblx0XHRcdFx0c291cmNlOiB7XG5cdFx0XHRcdFx0cGF0dGVyblxuXHRcdFx0XHR9XG5cdFx0XHR9IGFzIGFueSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX29EYXRlVHlwZTtcblx0fVxuXG5cdF9nZXRMYWJlbE51bWJlckZvcm1hdHRlcihwcmVjaXNpb24/OiBudW1iZXIsIHNjYWxlPzogbnVtYmVyKSB7XG5cdFx0cmV0dXJuIE51bWJlckZvcm1hdC5nZXRGbG9hdEluc3RhbmNlKHtcblx0XHRcdHN0eWxlOiBcInNob3J0XCIsXG5cdFx0XHRzaG93U2NhbGU6IHRydWUsXG5cdFx0XHRwcmVjaXNpb246ICh0eXBlb2YgcHJlY2lzaW9uID09PSBcIm51bWJlclwiICYmIHByZWNpc2lvbikgfHwgMCxcblx0XHRcdGRlY2ltYWxzOiAodHlwZW9mIHNjYWxlID09PSBcIm51bWJlclwiICYmIHNjYWxlKSB8fCAwXG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWljcm9DaGFydENvbnRhaW5lcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O0VBdUJBLE1BQU1BLGNBQWMsR0FBR0MsUUFBUSxDQUFDRCxjQUFjO0VBQzlDLE1BQU1FLFVBQVUsR0FBR0MsYUFBYSxDQUFDRCxVQUFVO0VBTTNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBLElBT01FLG1CQUFtQixXQUR4QkMsY0FBYyxDQUFDLDhDQUE4QyxDQUFDLFVBRTdEQyxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFNBQVM7SUFDZkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFDLFVBR0RGLFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUVDO0VBQ2YsQ0FBQyxDQUFDLFVBR0RILFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsVUFBVTtJQUNoQkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFDLFVBR0RGLFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUVDO0VBQ2YsQ0FBQyxDQUFDLFVBR0RILFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsVUFBVTtJQUNoQkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFDLFVBR0RGLFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsS0FBSztJQUNYQyxZQUFZLEVBQUVDO0VBQ2YsQ0FBQyxDQUFDLFVBR0RILFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsS0FBSztJQUNYQyxZQUFZLEVBQUU7RUFDZixDQUFDLENB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