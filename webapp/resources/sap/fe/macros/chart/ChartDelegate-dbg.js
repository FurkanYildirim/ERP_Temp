/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/macros/chart/ChartHelper", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/ui/mdc/library", "sap/ui/mdc/odata/v4/util/DelegateUtil", "sap/ui/mdc/odata/v4/vizChart/ChartDelegate", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "../filterBar/FilterBarDelegate"], function (Log, merge, CommonUtils, MetaModelFunction, ResourceModelHelper, ChartHelper, ChartUtils, CommonHelper, MacrosDelegateUtil, FilterUtils, MDCLib, DelegateUtil, BaseChartDelegate, Filter, FilterOperator, FilterBarDelegate) {
  "use strict";

  var getResourceModel = ResourceModelHelper.getResourceModel;
  var isMultiValueFilterExpression = MetaModelFunction.isMultiValueFilterExpression;
  var getSortRestrictionsInfo = MetaModelFunction.getSortRestrictionsInfo;
  var getFilterRestrictionsInfo = MetaModelFunction.getFilterRestrictionsInfo;
  const ChartItemRoleType = MDCLib.ChartItemRoleType;
  // /**
  //  * Helper class for sap.ui.mdc.Chart.
  //  * <h3><b>Note:</b></h3>
  //  * The class is experimental and the API/behaviour is not finalised
  //  * and hence this should not be used for productive usage.
  //  * Especially this class is not intended to be used for the FE scenario,
  //  * here we shall use sap.fe.macros.ChartDelegate that is especially tailored for V4
  //  * meta model
  //  *
  //  * @author SAP SE
  //  * @private
  //  * @experimental
  //  * @since 1.62
  //  * @alias sap.fe.macros.ChartDelegate
  //  */
  const ChartDelegate = Object.assign({}, BaseChartDelegate);
  BaseChartDelegate.apiVersion = 2;
  ChartDelegate._setChartNoDataText = function (oChart, oBindingInfo) {
    let sNoDataKey = "";
    const oChartFilterInfo = ChartUtils.getAllFilterInfo(oChart),
      suffixResourceKey = oBindingInfo.path.startsWith("/") ? oBindingInfo.path.substr(1) : oBindingInfo.path;
    const _getNoDataTextWithFilters = function () {
      if (oChart.data("multiViews")) {
        return "M_TABLE_AND_CHART_NO_DATA_TEXT_MULTI_VIEW";
      } else {
        return "T_TABLE_AND_CHART_NO_DATA_TEXT_WITH_FILTER";
      }
    };
    if (oChart.getFilter()) {
      if (oChartFilterInfo.search || oChartFilterInfo.filters && oChartFilterInfo.filters.length) {
        sNoDataKey = _getNoDataTextWithFilters();
      } else {
        sNoDataKey = "T_TABLE_AND_CHART_NO_DATA_TEXT";
      }
    } else if (oChartFilterInfo.search || oChartFilterInfo.filters && oChartFilterInfo.filters.length) {
      sNoDataKey = _getNoDataTextWithFilters();
    } else {
      sNoDataKey = "M_TABLE_AND_CHART_NO_FILTERS_NO_DATA_TEXT";
    }
    oChart.setNoDataText(getResourceModel(oChart).getText(sNoDataKey, undefined, suffixResourceKey));
  };
  ChartDelegate._handleProperty = function (oMDCChart, mEntitySetAnnotations, mKnownAggregatableProps, mCustomAggregates, aProperties, sCriticality) {
    const oApplySupported = CommonHelper.parseCustomData(oMDCChart.data("applySupported"));
    const sortRestrictionsInfo = getSortRestrictionsInfo(mEntitySetAnnotations);
    const oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
    const oFilterRestrictionsInfo = getFilterRestrictionsInfo(oFilterRestrictions);
    const oObj = this.getModel().getObject(this.getPath());
    const sKey = this.getModel().getObject(`${this.getPath()}@sapui.name`);
    const oMetaModel = this.getModel();
    const aModes = oMDCChart.getP13nMode();
    checkForNonfilterableEntitySet(oMDCChart, aModes);
    if (oObj && oObj.$kind === "Property") {
      // ignore (as for now) all complex properties
      // not clear if they might be nesting (complex in complex)
      // not clear how they are represented in non-filterable annotation
      // etc.
      if (oObj.$isCollection) {
        //Log.warning("Complex property with type " + oObj.$Type + " has been ignored");
        return;
      }
      const oPropertyAnnotations = oMetaModel.getObject(`${this.getPath()}@`);
      const sPath = oMetaModel.getObject("@sapui.name", oMetaModel.getMetaContext(this.getPath()));
      const aGroupableProperties = oApplySupported && oApplySupported.GroupableProperties;
      const aAggregatableProperties = oApplySupported && oApplySupported.AggregatableProperties;
      let bGroupable = aGroupableProperties ? checkPropertyType(aGroupableProperties, sPath) : false;
      let bAggregatable = aAggregatableProperties ? checkPropertyType(aAggregatableProperties, sPath) : false;
      if (!aGroupableProperties || aGroupableProperties && !aGroupableProperties.length) {
        bGroupable = oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"];
      }
      if (!aAggregatableProperties || aAggregatableProperties && !aAggregatableProperties.length) {
        bAggregatable = oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"];
      }

      //Right now: skip them, since we can't create a chart from it
      if (!bGroupable && !bAggregatable) {
        return;
      }
      checkPropertyIsBothGroupableAndAggregatable(mCustomAggregates, sKey, bGroupable, bAggregatable);
      if (bAggregatable) {
        const aAggregateProperties = ChartDelegate._createPropertyInfosForAggregatable(oMDCChart, sKey, oPropertyAnnotations, oFilterRestrictionsInfo, sortRestrictionsInfo, mKnownAggregatableProps, mCustomAggregates);
        aAggregateProperties.forEach(function (oAggregateProperty) {
          aProperties.push(oAggregateProperty);
        });
        //Add transformation aggregated properties to chart properties
        if (aModes && aModes.includes("Filter")) {
          const aKnownAggregatableProps = Object.keys(mKnownAggregatableProps);
          const aGroupablePropertiesValues = aGroupableProperties.map(oProperty => oProperty.$PropertyPath);
          aKnownAggregatableProps.forEach(sProperty => {
            // Add transformation aggregated property to chart so that in the filter dropdown it's visible
            // Also mark visibility false as this property should not come up in under chart section of personalization dialog
            if (!aGroupablePropertiesValues.includes(sProperty)) {
              aProperties = addPropertyToChart(aProperties, sKey, oPropertyAnnotations, oFilterRestrictionsInfo, sortRestrictionsInfo, oMDCChart, sCriticality, oObj, false, true, undefined, true);
            }
          });
        }
      }
      if (bGroupable) {
        const sName = sKey || "",
          sTextProperty = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] ? oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path : null;
        let bIsNavigationText = false;
        if (sName && sName.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Property: ${sName} from an association cannot be used`);
          return;
        }
        if (sTextProperty && sTextProperty.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Text Property: ${sTextProperty} from an association cannot be used`);
          bIsNavigationText = true;
        }
        aProperties = addPropertyToChart(aProperties, sKey, oPropertyAnnotations, oFilterRestrictionsInfo, sortRestrictionsInfo, oMDCChart, sCriticality, oObj, true, false, bIsNavigationText);
      }
    }
  };

  // create properties for chart
  function addPropertyToChart(aProperties, sKey, oPropertyAnnotations, oFilterRestrictionsInfo, sortRestrictionsInfo, oMDCChart, sCriticality, oObj, bIsGroupable, bIsAggregatable, bIsNavigationText, bIsHidden) {
    aProperties.push({
      name: "_fe_groupable_" + sKey,
      propertyPath: sKey,
      label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
      sortable: ChartDelegate._getSortable(oMDCChart, sortRestrictionsInfo.propertyInfo[sKey], false),
      filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
      groupable: bIsGroupable,
      aggregatable: bIsAggregatable,
      maxConditions: isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
      sortKey: sKey,
      path: sKey,
      role: ChartItemRoleType.category,
      //standard, normally this should be interpreted from UI.Chart annotation
      criticality: sCriticality,
      //To be implemented by FE
      typeConfig: oObj.typeConfig,
      visible: bIsHidden ? !bIsHidden : true,
      textProperty: !bIsNavigationText && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] ? oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path : null,
      //To be implemented by FE
      textFormatter: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]
    });
    return aProperties;
  }

  // If entityset is non filterable,then from p13n modes remove Filter so that on UI filter option doesn't show up
  function checkForNonfilterableEntitySet(oMDCChart, aModes) {
    var _oMDCChart$getModel, _oMDCChart$getModel$g, _oMDCChart$getModel$g2;
    const bEntitySetFilerable = oMDCChart === null || oMDCChart === void 0 ? void 0 : (_oMDCChart$getModel = oMDCChart.getModel()) === null || _oMDCChart$getModel === void 0 ? void 0 : (_oMDCChart$getModel$g = _oMDCChart$getModel.getMetaModel()) === null || _oMDCChart$getModel$g === void 0 ? void 0 : (_oMDCChart$getModel$g2 = _oMDCChart$getModel$g.getObject(`${oMDCChart.data("targetCollectionPath")}@Org.OData.Capabilities.V1.FilterRestrictions`)) === null || _oMDCChart$getModel$g2 === void 0 ? void 0 : _oMDCChart$getModel$g2.Filterable;
    if (bEntitySetFilerable !== undefined && !bEntitySetFilerable) {
      aModes = aModes.filter(item => item !== "Filter");
      oMDCChart.setP13nMode(aModes);
    }
  }

  //  check if Groupable /Aggregatable property is present or not
  function checkPropertyType(aProperties, sPath) {
    if (aProperties.length) {
      for (const element of aProperties) {
        var _element$Property;
        if ((element === null || element === void 0 ? void 0 : element.$PropertyPath) === sPath || (element === null || element === void 0 ? void 0 : (_element$Property = element.Property) === null || _element$Property === void 0 ? void 0 : _element$Property.$PropertyPath) === sPath) {
          return true;
        }
      }
    }
  }

  //If same custom property is configured as groupable and aggregatable throw an error
  function checkPropertyIsBothGroupableAndAggregatable(mCustomAggregates, sKey, bGroupable, bAggregatable) {
    const customProperties = Object.keys(mCustomAggregates);
    if (bGroupable && bAggregatable && customProperties.includes(sKey)) {
      throw new Error("Same property can not be configured as groupable and aggregatable");
    }
  }
  ChartDelegate.formatText = function (oValue1, oValue2) {
    const oTextArrangementAnnotation = this.textFormatter;
    if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst") {
      return `${oValue2} (${oValue1})`;
    } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
      return `${oValue1} (${oValue2})`;
    } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
      return oValue2;
    }
    return oValue2 ? oValue2 : oValue1;
  };
  ChartDelegate.updateBindingInfo = function (oChart, oBindingInfo) {
    ChartDelegate._setChartNoDataText(oChart, oBindingInfo);
    const oFilter = sap.ui.getCore().byId(oChart.getFilter());
    const mConditions = oChart.getConditions();
    if (!oBindingInfo) {
      oBindingInfo = {};
    }
    if (!oBindingInfo.parameters) {
      oBindingInfo.parameters = {};
    }
    if (oFilter) {
      // Search
      const oInfo = FilterUtils.getFilterInfo(oFilter, {});
      const oApplySupported = CommonHelper.parseCustomData(oChart.data("applySupported"));
      if (oApplySupported && oApplySupported.enableSearch && oInfo.search) {
        oBindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(oInfo.search);
      } else if (oBindingInfo.parameters.$search) {
        delete oBindingInfo.parameters.$search;
      }
    }
    const sParameterPath = mConditions ? DelegateUtil.getParametersInfo(oFilter, mConditions) : null;
    if (sParameterPath) {
      oBindingInfo.path = sParameterPath;
    }
    const oFilterInfo = ChartUtils.getAllFilterInfo(oChart);

    // remove prefixes so that entityset will match with the property names with these field
    if (oFilterInfo.filters) {
      oFilterInfo.filters = CommonUtils.getChartPropertiesWithoutPrefixes(oFilterInfo.filters);
    }
    oBindingInfo.filters = oFilterInfo.filters.length > 0 ? new Filter({
      filters: oFilterInfo.filters,
      and: true
    }) : null;
    oBindingInfo.sorter = this.getSorters(oChart);
    ChartDelegate._checkAndAddDraftFilter(oChart, oBindingInfo);
  };
  ChartDelegate.fetchProperties = function (oMDCChart) {
    const oModel = this._getModel(oMDCChart);
    let pCreatePropertyInfos;
    if (!oModel) {
      pCreatePropertyInfos = new Promise(resolve => {
        oMDCChart.attachModelContextChange({
          resolver: resolve
        }, onModelContextChange, this);
      }).then(oRetrievedModel => {
        return this._createPropertyInfos(oMDCChart, oRetrievedModel);
      });
    } else {
      pCreatePropertyInfos = this._createPropertyInfos(oMDCChart, oModel);
    }
    return pCreatePropertyInfos.then(function (aProperties) {
      if (oMDCChart.data) {
        oMDCChart.data("$mdcChartPropertyInfo", aProperties);
        // store the properties to fetch during p13n calculation
        MacrosDelegateUtil.setCachedProperties(oMDCChart, aProperties);
      }
      return aProperties;
    });
  };
  function onModelContextChange(oEvent, oData) {
    const oMDCChart = oEvent.getSource();
    const oModel = this._getModel(oMDCChart);
    if (oModel) {
      oMDCChart.detachModelContextChange(onModelContextChange);
      oData.resolver(oModel);
    }
  }
  ChartDelegate._createPropertyInfos = async function (oMDCChart, oModel) {
    const sEntitySetPath = `/${oMDCChart.data("entitySet")}`;
    const oMetaModel = oModel.getMetaModel();
    const aResults = await Promise.all([oMetaModel.requestObject(`${sEntitySetPath}/`), oMetaModel.requestObject(`${sEntitySetPath}@`)]);
    const aProperties = [];
    let oEntityType = aResults[0];
    const mEntitySetAnnotations = aResults[1];
    oEntityType = allowedPropertiesForFilterOption(oEntityType, oMDCChart);
    const mCustomAggregates = CommonHelper.parseCustomData(oMDCChart.data("customAgg"));
    getCustomAggregate(mCustomAggregates, oMDCChart);
    let sAnno;
    const aPropertyPromise = [];
    for (const sAnnoKey in mEntitySetAnnotations) {
      if (sAnnoKey.startsWith("@Org.OData.Aggregation.V1.CustomAggregate")) {
        sAnno = sAnnoKey.replace("@Org.OData.Aggregation.V1.CustomAggregate#", "");
        const aAnno = sAnno.split("@");
        if (aAnno.length == 2 && aAnno[1] == "com.sap.vocabularies.Common.v1.Label") {
          mCustomAggregates[aAnno[0]] = mEntitySetAnnotations[sAnnoKey];
        }
      }
    }
    const mTypeAggregatableProps = CommonHelper.parseCustomData(oMDCChart.data("transAgg"));
    const mKnownAggregatableProps = {};
    for (const sAggregatable in mTypeAggregatableProps) {
      const sPropKey = mTypeAggregatableProps[sAggregatable].propertyPath;
      mKnownAggregatableProps[sPropKey] = mKnownAggregatableProps[sPropKey] || {};
      mKnownAggregatableProps[sPropKey][mTypeAggregatableProps[sAggregatable].aggregationMethod] = {
        name: mTypeAggregatableProps[sAggregatable].name,
        label: mTypeAggregatableProps[sAggregatable].label
      };
    }
    for (const sKey in oEntityType) {
      if (sKey.indexOf("$") !== 0) {
        aPropertyPromise.push(ChartHelper.fetchCriticality(oMetaModel, oMetaModel.createBindingContext(`${sEntitySetPath}/${sKey}`)).then(ChartDelegate._handleProperty.bind(oMetaModel.getMetaContext(`${sEntitySetPath}/${sKey}`), oMDCChart, mEntitySetAnnotations, mKnownAggregatableProps, mCustomAggregates, aProperties)));
      }
    }
    await Promise.all(aPropertyPromise);
    return aProperties;
  };

  // for every property of chart, configure the typeConfig which we would like to see in the filter dropdrown list
  function allowedPropertiesForFilterOption(oEntityType, oMDCChart) {
    for (const i in oEntityType) {
      if (i == "$Key" || i == "$kind" || i == "SAP_Message") {
        continue;
      } else if (oEntityType[i]["$kind"] == "Property") {
        oEntityType[i]["typeConfig"] = oMDCChart.getTypeUtil().getTypeConfig(oEntityType[i].$Type);
      } else {
        oEntityType[i]["typeConfig"] = null;
      }
    }
    return oEntityType;
  }
  function getCustomAggregate(mCustomAggregates, oMDCChart) {
    const aDimensions = [],
      aMeasures = [];
    if (mCustomAggregates && Object.keys(mCustomAggregates).length >= 1) {
      const aChartItems = oMDCChart.getItems();
      for (const key in aChartItems) {
        if (aChartItems[key].getType() === "groupable") {
          aDimensions.push(ChartDelegate.getInternalChartNameFromPropertyNameAndKind(aChartItems[key].getName(), "groupable"));
        } else if (aChartItems[key].getType() === "aggregatable") {
          aMeasures.push(ChartDelegate.getInternalChartNameFromPropertyNameAndKind(aChartItems[key].getName(), "aggregatable"));
        }
      }
      if (aMeasures.filter(function (val) {
        return aDimensions.indexOf(val) != -1;
      }).length >= 1) {
        Log.error("Dimension and Measure has the sameProperty Configured");
      }
    }
  }
  ChartDelegate._createPropertyInfosForAggregatable = function (oMDCChart, sKey, oPropertyAnnotations, oFilterRestrictionsInfo, sortRestrictionsInfo, mKnownAggregatableProps, mCustomAggregates) {
    const aAggregateProperties = [];
    if (Object.keys(mKnownAggregatableProps).indexOf(sKey) > -1) {
      for (const sAggregatable in mKnownAggregatableProps[sKey]) {
        aAggregateProperties.push({
          name: "_fe_aggregatable_" + mKnownAggregatableProps[sKey][sAggregatable].name,
          propertyPath: sKey,
          label: mKnownAggregatableProps[sKey][sAggregatable].label || `${oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"]} (${sAggregatable})` || `${sKey} (${sAggregatable})`,
          sortable: sortRestrictionsInfo.propertyInfo[sKey] ? sortRestrictionsInfo.propertyInfo[sKey].sortable : true,
          filterable: false,
          groupable: false,
          aggregatable: true,
          path: sKey,
          aggregationMethod: sAggregatable,
          maxConditions: isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
          role: ChartItemRoleType.axis1,
          datapoint: null //To be implemented by FE
        });
      }
    }

    if (Object.keys(mCustomAggregates).indexOf(sKey) > -1) {
      for (const sCustom in mCustomAggregates) {
        if (sCustom === sKey) {
          const oItem = merge({}, mCustomAggregates[sCustom], {
            name: "_fe_aggregatable_" + sCustom,
            groupable: false,
            aggregatable: true,
            filterable: false,
            role: ChartItemRoleType.axis1,
            propertyPath: sCustom,
            datapoint: null //To be implemented by FE
          });

          aAggregateProperties.push(oItem);
          break;
        }
      }
    }
    return aAggregateProperties;
  };
  ChartDelegate.rebind = function (oMDCChart, oBindingInfo) {
    const sSearch = oBindingInfo.parameters.$search;
    if (sSearch) {
      delete oBindingInfo.parameters.$search;
    }
    BaseChartDelegate.rebind(oMDCChart, oBindingInfo);
    if (sSearch) {
      const oInnerChart = oMDCChart.getControlDelegate().getInnerChart(oMDCChart),
        oChartBinding = oInnerChart && oInnerChart.getBinding("data");

      // Temporary workaround until this is fixed in MDCChart / UI5 Chart
      // In order to avoid having 2 OData requests, we need to suspend the binding before setting some aggregation properties
      // and resume it once the chart has added other aggregation properties (in onBeforeRendering)
      oChartBinding.suspend();
      oChartBinding.setAggregation({
        search: sSearch
      });
      const oInnerChartDelegate = {
        onBeforeRendering: function () {
          oChartBinding.resume();
          oInnerChart.removeEventDelegate(oInnerChartDelegate);
        }
      };
      oInnerChart.addEventDelegate(oInnerChartDelegate);
    }
    oMDCChart.fireEvent("bindingUpdated");
  };
  ChartDelegate._setChart = function (oMDCChart, oInnerChart) {
    const oChartAPI = oMDCChart.getParent();
    oInnerChart.setVizProperties(oMDCChart.data("vizProperties"));
    oInnerChart.detachSelectData(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.detachDeselectData(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.detachDrilledUp(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.attachSelectData(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.attachDeselectData(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.attachDrilledUp(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.setSelectionMode(oMDCChart.getPayload().selectionMode.toUpperCase());
    BaseChartDelegate._setChart(oMDCChart, oInnerChart);
  };
  ChartDelegate._getBindingInfo = function (oMDCChart) {
    if (this._getBindingInfoFromState(oMDCChart)) {
      return this._getBindingInfoFromState(oMDCChart);
    }
    const oMetadataInfo = oMDCChart.getDelegate().payload;
    const oMetaModel = oMDCChart.getModel() && oMDCChart.getModel().getMetaModel();
    const sTargetCollectionPath = oMDCChart.data("targetCollectionPath");
    const sEntitySetPath = (oMetaModel.getObject(`${sTargetCollectionPath}/$kind`) !== "NavigationProperty" ? "/" : "") + oMetadataInfo.contextPath;
    const oParams = merge({}, oMetadataInfo.parameters, {
      entitySet: oMDCChart.data("entitySet")
    });
    return {
      path: sEntitySetPath,
      events: {
        dataRequested: oMDCChart.getParent().onInternalDataRequested.bind(oMDCChart.getParent())
      },
      parameters: oParams
    };
  };
  ChartDelegate.removeItemFromInnerChart = function (oMDCChart, oMDCChartItem) {
    BaseChartDelegate.removeItemFromInnerChart.call(this, oMDCChart, oMDCChartItem);
    if (oMDCChartItem.getType() === "groupable") {
      const oInnerChart = this.getInnerChart(oMDCChart);
      oInnerChart.fireDeselectData();
    }
  };
  ChartDelegate._getSortable = function (oMDCChart, sortRestrictionsProperty, bIsTransAggregate) {
    if (bIsTransAggregate) {
      if (oMDCChart.data("draftSupported") === "true") {
        return false;
      } else {
        return sortRestrictionsProperty ? sortRestrictionsProperty.sortable : true;
      }
    }
    return sortRestrictionsProperty ? sortRestrictionsProperty.sortable : true;
  };
  ChartDelegate._checkAndAddDraftFilter = function (oChart, oBindingInfo) {
    if (oChart.data("draftSupported") === "true") {
      if (!oBindingInfo) {
        oBindingInfo = {};
      }
      if (!oBindingInfo.filters) {
        oBindingInfo.filters = [];
        oBindingInfo.filters.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
      } else {
        var _oBindingInfo$filters, _oBindingInfo$filters2;
        (_oBindingInfo$filters = oBindingInfo.filters) === null || _oBindingInfo$filters === void 0 ? void 0 : (_oBindingInfo$filters2 = _oBindingInfo$filters.aFilters) === null || _oBindingInfo$filters2 === void 0 ? void 0 : _oBindingInfo$filters2.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
      }
    }
  };

  /**
   * This function returns an ID which should be used in the internal chart for the measure or dimension.
   * For standard cases, this is just the ID of the property.
   * If it is necessary to use another ID internally inside the chart (e.g. on duplicate property IDs) this method can be overwritten.
   * In this case, <code>getPropertyFromNameAndKind</code> needs to be overwritten as well.
   *
   * @param {string} name ID of the property
   * @param {string} kind Type of the property (measure or dimension)
   * @returns {string} Internal ID for the sap.chart.Chart
   */
  ChartDelegate.getInternalChartNameFromPropertyNameAndKind = function (name, kind) {
    return name.replace("_fe_" + kind + "_", "");
  };

  /**
   * This maps an id of an internal chart dimension or measure & type of a property to its corresponding property entry.
   *
   * @param {string} name ID of internal chart measure or dimension
   * @param {string} kind The kind of property that is used
   * @param {sap.ui.mdc.Chart} mdcChart Reference to the MDC_Chart
   * @returns {object} PropertyInfo object
   */
  ChartDelegate.getPropertyFromNameAndKind = function (name, kind, mdcChart) {
    return mdcChart.getPropertyHelper().getProperty("_fe_" + kind + "_" + name);
  };

  /**
   * Provide the chart's filter delegate to provide basic filter functionality such as adding FilterFields.
   *
   * @returns Object for the personalization of the chart filter
   */
  ChartDelegate.getFilterDelegate = function () {
    return Object.assign({
      apiVersion: 2
    }, FilterBarDelegate, {
      addItem: function (oParentControl, sPropertyInfoName) {
        const prop = ChartDelegate.getInternalChartNameFromPropertyNameAndKind(sPropertyInfoName, "groupable");
        return FilterBarDelegate.addItem(oParentControl, prop).then(oFilterItem => {
          oFilterItem === null || oFilterItem === void 0 ? void 0 : oFilterItem.bindProperty("conditions", {
            path: "$filters>/conditions/" + sPropertyInfoName
          });
          return oFilterItem;
        });
      }
    });
  };
  return ChartDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGFydEl0ZW1Sb2xlVHlwZSIsIk1EQ0xpYiIsIkNoYXJ0RGVsZWdhdGUiLCJPYmplY3QiLCJhc3NpZ24iLCJCYXNlQ2hhcnREZWxlZ2F0ZSIsImFwaVZlcnNpb24iLCJfc2V0Q2hhcnROb0RhdGFUZXh0Iiwib0NoYXJ0Iiwib0JpbmRpbmdJbmZvIiwic05vRGF0YUtleSIsIm9DaGFydEZpbHRlckluZm8iLCJDaGFydFV0aWxzIiwiZ2V0QWxsRmlsdGVySW5mbyIsInN1ZmZpeFJlc291cmNlS2V5IiwicGF0aCIsInN0YXJ0c1dpdGgiLCJzdWJzdHIiLCJfZ2V0Tm9EYXRhVGV4dFdpdGhGaWx0ZXJzIiwiZGF0YSIsImdldEZpbHRlciIsInNlYXJjaCIsImZpbHRlcnMiLCJsZW5ndGgiLCJzZXROb0RhdGFUZXh0IiwiZ2V0UmVzb3VyY2VNb2RlbCIsImdldFRleHQiLCJ1bmRlZmluZWQiLCJfaGFuZGxlUHJvcGVydHkiLCJvTURDQ2hhcnQiLCJtRW50aXR5U2V0QW5ub3RhdGlvbnMiLCJtS25vd25BZ2dyZWdhdGFibGVQcm9wcyIsIm1DdXN0b21BZ2dyZWdhdGVzIiwiYVByb3BlcnRpZXMiLCJzQ3JpdGljYWxpdHkiLCJvQXBwbHlTdXBwb3J0ZWQiLCJDb21tb25IZWxwZXIiLCJwYXJzZUN1c3RvbURhdGEiLCJzb3J0UmVzdHJpY3Rpb25zSW5mbyIsImdldFNvcnRSZXN0cmljdGlvbnNJbmZvIiwib0ZpbHRlclJlc3RyaWN0aW9ucyIsIm9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvIiwiZ2V0RmlsdGVyUmVzdHJpY3Rpb25zSW5mbyIsIm9PYmoiLCJnZXRNb2RlbCIsImdldE9iamVjdCIsImdldFBhdGgiLCJzS2V5Iiwib01ldGFNb2RlbCIsImFNb2RlcyIsImdldFAxM25Nb2RlIiwiY2hlY2tGb3JOb25maWx0ZXJhYmxlRW50aXR5U2V0IiwiJGtpbmQiLCIkaXNDb2xsZWN0aW9uIiwib1Byb3BlcnR5QW5ub3RhdGlvbnMiLCJzUGF0aCIsImdldE1ldGFDb250ZXh0IiwiYUdyb3VwYWJsZVByb3BlcnRpZXMiLCJHcm91cGFibGVQcm9wZXJ0aWVzIiwiYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMiLCJBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzIiwiYkdyb3VwYWJsZSIsImNoZWNrUHJvcGVydHlUeXBlIiwiYkFnZ3JlZ2F0YWJsZSIsImNoZWNrUHJvcGVydHlJc0JvdGhHcm91cGFibGVBbmRBZ2dyZWdhdGFibGUiLCJhQWdncmVnYXRlUHJvcGVydGllcyIsIl9jcmVhdGVQcm9wZXJ0eUluZm9zRm9yQWdncmVnYXRhYmxlIiwiZm9yRWFjaCIsIm9BZ2dyZWdhdGVQcm9wZXJ0eSIsInB1c2giLCJpbmNsdWRlcyIsImFLbm93bkFnZ3JlZ2F0YWJsZVByb3BzIiwia2V5cyIsImFHcm91cGFibGVQcm9wZXJ0aWVzVmFsdWVzIiwibWFwIiwib1Byb3BlcnR5IiwiJFByb3BlcnR5UGF0aCIsInNQcm9wZXJ0eSIsImFkZFByb3BlcnR5VG9DaGFydCIsInNOYW1lIiwic1RleHRQcm9wZXJ0eSIsIiRQYXRoIiwiYklzTmF2aWdhdGlvblRleHQiLCJpbmRleE9mIiwiTG9nIiwiZXJyb3IiLCJiSXNHcm91cGFibGUiLCJiSXNBZ2dyZWdhdGFibGUiLCJiSXNIaWRkZW4iLCJuYW1lIiwicHJvcGVydHlQYXRoIiwibGFiZWwiLCJzb3J0YWJsZSIsIl9nZXRTb3J0YWJsZSIsInByb3BlcnR5SW5mbyIsImZpbHRlcmFibGUiLCJncm91cGFibGUiLCJhZ2dyZWdhdGFibGUiLCJtYXhDb25kaXRpb25zIiwiaXNNdWx0aVZhbHVlRmlsdGVyRXhwcmVzc2lvbiIsInNvcnRLZXkiLCJyb2xlIiwiY2F0ZWdvcnkiLCJjcml0aWNhbGl0eSIsInR5cGVDb25maWciLCJ2aXNpYmxlIiwidGV4dFByb3BlcnR5IiwidGV4dEZvcm1hdHRlciIsImJFbnRpdHlTZXRGaWxlcmFibGUiLCJnZXRNZXRhTW9kZWwiLCJGaWx0ZXJhYmxlIiwiZmlsdGVyIiwiaXRlbSIsInNldFAxM25Nb2RlIiwiZWxlbWVudCIsIlByb3BlcnR5IiwiY3VzdG9tUHJvcGVydGllcyIsIkVycm9yIiwiZm9ybWF0VGV4dCIsIm9WYWx1ZTEiLCJvVmFsdWUyIiwib1RleHRBcnJhbmdlbWVudEFubm90YXRpb24iLCIkRW51bU1lbWJlciIsInVwZGF0ZUJpbmRpbmdJbmZvIiwib0ZpbHRlciIsInNhcCIsInVpIiwiZ2V0Q29yZSIsImJ5SWQiLCJtQ29uZGl0aW9ucyIsImdldENvbmRpdGlvbnMiLCJwYXJhbWV0ZXJzIiwib0luZm8iLCJGaWx0ZXJVdGlscyIsImdldEZpbHRlckluZm8iLCJlbmFibGVTZWFyY2giLCIkc2VhcmNoIiwiQ29tbW9uVXRpbHMiLCJub3JtYWxpemVTZWFyY2hUZXJtIiwic1BhcmFtZXRlclBhdGgiLCJEZWxlZ2F0ZVV0aWwiLCJnZXRQYXJhbWV0ZXJzSW5mbyIsIm9GaWx0ZXJJbmZvIiwiZ2V0Q2hhcnRQcm9wZXJ0aWVzV2l0aG91dFByZWZpeGVzIiwiRmlsdGVyIiwiYW5kIiwic29ydGVyIiwiZ2V0U29ydGVycyIsIl9jaGVja0FuZEFkZERyYWZ0RmlsdGVyIiwiZmV0Y2hQcm9wZXJ0aWVzIiwib01vZGVsIiwiX2dldE1vZGVsIiwicENyZWF0ZVByb3BlcnR5SW5mb3MiLCJQcm9taXNlIiwicmVzb2x2ZSIsImF0dGFjaE1vZGVsQ29udGV4dENoYW5nZSIsInJlc29sdmVyIiwib25Nb2RlbENvbnRleHRDaGFuZ2UiLCJ0aGVuIiwib1JldHJpZXZlZE1vZGVsIiwiX2NyZWF0ZVByb3BlcnR5SW5mb3MiLCJNYWNyb3NEZWxlZ2F0ZVV0aWwiLCJzZXRDYWNoZWRQcm9wZXJ0aWVzIiwib0V2ZW50Iiwib0RhdGEiLCJnZXRTb3VyY2UiLCJkZXRhY2hNb2RlbENvbnRleHRDaGFuZ2UiLCJzRW50aXR5U2V0UGF0aCIsImFSZXN1bHRzIiwiYWxsIiwicmVxdWVzdE9iamVjdCIsIm9FbnRpdHlUeXBlIiwiYWxsb3dlZFByb3BlcnRpZXNGb3JGaWx0ZXJPcHRpb24iLCJnZXRDdXN0b21BZ2dyZWdhdGUiLCJzQW5ubyIsImFQcm9wZXJ0eVByb21pc2UiLCJzQW5ub0tleSIsInJlcGxhY2UiLCJhQW5ubyIsInNwbGl0IiwibVR5cGVBZ2dyZWdhdGFibGVQcm9wcyIsInNBZ2dyZWdhdGFibGUiLCJzUHJvcEtleSIsImFnZ3JlZ2F0aW9uTWV0aG9kIiwiQ2hhcnRIZWxwZXIiLCJmZXRjaENyaXRpY2FsaXR5IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJiaW5kIiwiaSIsImdldFR5cGVVdGlsIiwiZ2V0VHlwZUNvbmZpZyIsIiRUeXBlIiwiYURpbWVuc2lvbnMiLCJhTWVhc3VyZXMiLCJhQ2hhcnRJdGVtcyIsImdldEl0ZW1zIiwia2V5IiwiZ2V0VHlwZSIsImdldEludGVybmFsQ2hhcnROYW1lRnJvbVByb3BlcnR5TmFtZUFuZEtpbmQiLCJnZXROYW1lIiwidmFsIiwiYXhpczEiLCJkYXRhcG9pbnQiLCJzQ3VzdG9tIiwib0l0ZW0iLCJtZXJnZSIsInJlYmluZCIsInNTZWFyY2giLCJvSW5uZXJDaGFydCIsImdldENvbnRyb2xEZWxlZ2F0ZSIsImdldElubmVyQ2hhcnQiLCJvQ2hhcnRCaW5kaW5nIiwiZ2V0QmluZGluZyIsInN1c3BlbmQiLCJzZXRBZ2dyZWdhdGlvbiIsIm9Jbm5lckNoYXJ0RGVsZWdhdGUiLCJvbkJlZm9yZVJlbmRlcmluZyIsInJlc3VtZSIsInJlbW92ZUV2ZW50RGVsZWdhdGUiLCJhZGRFdmVudERlbGVnYXRlIiwiZmlyZUV2ZW50IiwiX3NldENoYXJ0Iiwib0NoYXJ0QVBJIiwiZ2V0UGFyZW50Iiwic2V0Vml6UHJvcGVydGllcyIsImRldGFjaFNlbGVjdERhdGEiLCJoYW5kbGVTZWxlY3Rpb25DaGFuZ2UiLCJkZXRhY2hEZXNlbGVjdERhdGEiLCJkZXRhY2hEcmlsbGVkVXAiLCJhdHRhY2hTZWxlY3REYXRhIiwiYXR0YWNoRGVzZWxlY3REYXRhIiwiYXR0YWNoRHJpbGxlZFVwIiwic2V0U2VsZWN0aW9uTW9kZSIsImdldFBheWxvYWQiLCJzZWxlY3Rpb25Nb2RlIiwidG9VcHBlckNhc2UiLCJfZ2V0QmluZGluZ0luZm8iLCJfZ2V0QmluZGluZ0luZm9Gcm9tU3RhdGUiLCJvTWV0YWRhdGFJbmZvIiwiZ2V0RGVsZWdhdGUiLCJwYXlsb2FkIiwic1RhcmdldENvbGxlY3Rpb25QYXRoIiwiY29udGV4dFBhdGgiLCJvUGFyYW1zIiwiZW50aXR5U2V0IiwiZXZlbnRzIiwiZGF0YVJlcXVlc3RlZCIsIm9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkIiwicmVtb3ZlSXRlbUZyb21Jbm5lckNoYXJ0Iiwib01EQ0NoYXJ0SXRlbSIsImNhbGwiLCJmaXJlRGVzZWxlY3REYXRhIiwic29ydFJlc3RyaWN0aW9uc1Byb3BlcnR5IiwiYklzVHJhbnNBZ2dyZWdhdGUiLCJGaWx0ZXJPcGVyYXRvciIsIkVRIiwiYUZpbHRlcnMiLCJraW5kIiwiZ2V0UHJvcGVydHlGcm9tTmFtZUFuZEtpbmQiLCJtZGNDaGFydCIsImdldFByb3BlcnR5SGVscGVyIiwiZ2V0UHJvcGVydHkiLCJnZXRGaWx0ZXJEZWxlZ2F0ZSIsIkZpbHRlckJhckRlbGVnYXRlIiwiYWRkSXRlbSIsIm9QYXJlbnRDb250cm9sIiwic1Byb3BlcnR5SW5mb05hbWUiLCJwcm9wIiwib0ZpbHRlckl0ZW0iLCJiaW5kUHJvcGVydHkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNoYXJ0RGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgbWVyZ2UgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7XG5cdGdldEZpbHRlclJlc3RyaWN0aW9uc0luZm8sXG5cdGdldFNvcnRSZXN0cmljdGlvbnNJbmZvLFxuXHRpc011bHRpVmFsdWVGaWx0ZXJFeHByZXNzaW9uLFxuXHRTb3J0UmVzdHJpY3Rpb25zSW5mb1R5cGUsXG5cdFNvcnRSZXN0cmljdGlvbnNQcm9wZXJ0eUluZm9UeXBlXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01ldGFNb2RlbEZ1bmN0aW9uXCI7XG5pbXBvcnQgeyBnZXRSZXNvdXJjZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUmVzb3VyY2VNb2RlbEhlbHBlclwiO1xuaW1wb3J0IENoYXJ0SGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0SGVscGVyXCI7XG5pbXBvcnQgQ2hhcnRVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9jaGFydC9DaGFydFV0aWxzXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IE1hY3Jvc0RlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyVXRpbHNcIjtcbmltcG9ydCBDaGFydCBmcm9tIFwic2FwL3VpL21kYy9DaGFydFwiO1xuaW1wb3J0IE1EQ0xpYiBmcm9tIFwic2FwL3VpL21kYy9saWJyYXJ5XCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvdWkvbWRjL29kYXRhL3Y0L3V0aWwvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgQmFzZUNoYXJ0RGVsZWdhdGUgZnJvbSBcInNhcC91aS9tZGMvb2RhdGEvdjQvdml6Q2hhcnQvQ2hhcnREZWxlZ2F0ZVwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCBGaWx0ZXJCYXJEZWxlZ2F0ZSBmcm9tIFwiLi4vZmlsdGVyQmFyL0ZpbHRlckJhckRlbGVnYXRlXCI7XG5cbmNvbnN0IENoYXJ0SXRlbVJvbGVUeXBlID0gKE1EQ0xpYiBhcyBhbnkpLkNoYXJ0SXRlbVJvbGVUeXBlO1xuLy8gLyoqXG4vLyAgKiBIZWxwZXIgY2xhc3MgZm9yIHNhcC51aS5tZGMuQ2hhcnQuXG4vLyAgKiA8aDM+PGI+Tm90ZTo8L2I+PC9oMz5cbi8vICAqIFRoZSBjbGFzcyBpcyBleHBlcmltZW50YWwgYW5kIHRoZSBBUEkvYmVoYXZpb3VyIGlzIG5vdCBmaW5hbGlzZWRcbi8vICAqIGFuZCBoZW5jZSB0aGlzIHNob3VsZCBub3QgYmUgdXNlZCBmb3IgcHJvZHVjdGl2ZSB1c2FnZS5cbi8vICAqIEVzcGVjaWFsbHkgdGhpcyBjbGFzcyBpcyBub3QgaW50ZW5kZWQgdG8gYmUgdXNlZCBmb3IgdGhlIEZFIHNjZW5hcmlvLFxuLy8gICogaGVyZSB3ZSBzaGFsbCB1c2Ugc2FwLmZlLm1hY3Jvcy5DaGFydERlbGVnYXRlIHRoYXQgaXMgZXNwZWNpYWxseSB0YWlsb3JlZCBmb3IgVjRcbi8vICAqIG1ldGEgbW9kZWxcbi8vICAqXG4vLyAgKiBAYXV0aG9yIFNBUCBTRVxuLy8gICogQHByaXZhdGVcbi8vICAqIEBleHBlcmltZW50YWxcbi8vICAqIEBzaW5jZSAxLjYyXG4vLyAgKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5DaGFydERlbGVnYXRlXG4vLyAgKi9cbmNvbnN0IENoYXJ0RGVsZWdhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBCYXNlQ2hhcnREZWxlZ2F0ZSk7XG5CYXNlQ2hhcnREZWxlZ2F0ZS5hcGlWZXJzaW9uID0gMjtcblxuQ2hhcnREZWxlZ2F0ZS5fc2V0Q2hhcnROb0RhdGFUZXh0ID0gZnVuY3Rpb24gKG9DaGFydDogYW55LCBvQmluZGluZ0luZm86IGFueSkge1xuXHRsZXQgc05vRGF0YUtleSA9IFwiXCI7XG5cdGNvbnN0IG9DaGFydEZpbHRlckluZm8gPSBDaGFydFV0aWxzLmdldEFsbEZpbHRlckluZm8ob0NoYXJ0KSxcblx0XHRzdWZmaXhSZXNvdXJjZUtleSA9IG9CaW5kaW5nSW5mby5wYXRoLnN0YXJ0c1dpdGgoXCIvXCIpID8gb0JpbmRpbmdJbmZvLnBhdGguc3Vic3RyKDEpIDogb0JpbmRpbmdJbmZvLnBhdGg7XG5cdGNvbnN0IF9nZXROb0RhdGFUZXh0V2l0aEZpbHRlcnMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKG9DaGFydC5kYXRhKFwibXVsdGlWaWV3c1wiKSkge1xuXHRcdFx0cmV0dXJuIFwiTV9UQUJMRV9BTkRfQ0hBUlRfTk9fREFUQV9URVhUX01VTFRJX1ZJRVdcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiVF9UQUJMRV9BTkRfQ0hBUlRfTk9fREFUQV9URVhUX1dJVEhfRklMVEVSXCI7XG5cdFx0fVxuXHR9O1xuXHRpZiAob0NoYXJ0LmdldEZpbHRlcigpKSB7XG5cdFx0aWYgKG9DaGFydEZpbHRlckluZm8uc2VhcmNoIHx8IChvQ2hhcnRGaWx0ZXJJbmZvLmZpbHRlcnMgJiYgb0NoYXJ0RmlsdGVySW5mby5maWx0ZXJzLmxlbmd0aCkpIHtcblx0XHRcdHNOb0RhdGFLZXkgPSBfZ2V0Tm9EYXRhVGV4dFdpdGhGaWx0ZXJzKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNOb0RhdGFLZXkgPSBcIlRfVEFCTEVfQU5EX0NIQVJUX05PX0RBVEFfVEVYVFwiO1xuXHRcdH1cblx0fSBlbHNlIGlmIChvQ2hhcnRGaWx0ZXJJbmZvLnNlYXJjaCB8fCAob0NoYXJ0RmlsdGVySW5mby5maWx0ZXJzICYmIG9DaGFydEZpbHRlckluZm8uZmlsdGVycy5sZW5ndGgpKSB7XG5cdFx0c05vRGF0YUtleSA9IF9nZXROb0RhdGFUZXh0V2l0aEZpbHRlcnMoKTtcblx0fSBlbHNlIHtcblx0XHRzTm9EYXRhS2V5ID0gXCJNX1RBQkxFX0FORF9DSEFSVF9OT19GSUxURVJTX05PX0RBVEFfVEVYVFwiO1xuXHR9XG5cdG9DaGFydC5zZXROb0RhdGFUZXh0KGdldFJlc291cmNlTW9kZWwob0NoYXJ0KS5nZXRUZXh0KHNOb0RhdGFLZXksIHVuZGVmaW5lZCwgc3VmZml4UmVzb3VyY2VLZXkpKTtcbn07XG5cbkNoYXJ0RGVsZWdhdGUuX2hhbmRsZVByb3BlcnR5ID0gZnVuY3Rpb24gKFxuXHRvTURDQ2hhcnQ6IENoYXJ0LFxuXHRtRW50aXR5U2V0QW5ub3RhdGlvbnM6IGFueSxcblx0bUtub3duQWdncmVnYXRhYmxlUHJvcHM6IGFueSxcblx0bUN1c3RvbUFnZ3JlZ2F0ZXM6IGFueSxcblx0YVByb3BlcnRpZXM6IGFueVtdLFxuXHRzQ3JpdGljYWxpdHk6IHN0cmluZ1xuKSB7XG5cdGNvbnN0IG9BcHBseVN1cHBvcnRlZCA9IENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEob01EQ0NoYXJ0LmRhdGEoXCJhcHBseVN1cHBvcnRlZFwiKSk7XG5cdGNvbnN0IHNvcnRSZXN0cmljdGlvbnNJbmZvID0gZ2V0U29ydFJlc3RyaWN0aW9uc0luZm8obUVudGl0eVNldEFubm90YXRpb25zKTtcblx0Y29uc3Qgb0ZpbHRlclJlc3RyaWN0aW9ucyA9IG1FbnRpdHlTZXRBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlclJlc3RyaWN0aW9uc1wiXTtcblx0Y29uc3Qgb0ZpbHRlclJlc3RyaWN0aW9uc0luZm8gPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnNJbmZvKG9GaWx0ZXJSZXN0cmljdGlvbnMpO1xuXHRjb25zdCBvT2JqID0gdGhpcy5nZXRNb2RlbCgpLmdldE9iamVjdCh0aGlzLmdldFBhdGgoKSk7XG5cdGNvbnN0IHNLZXkgPSB0aGlzLmdldE1vZGVsKCkuZ2V0T2JqZWN0KGAke3RoaXMuZ2V0UGF0aCgpfUBzYXB1aS5uYW1lYCkgYXMgc3RyaW5nO1xuXHRjb25zdCBvTWV0YU1vZGVsID0gdGhpcy5nZXRNb2RlbCgpO1xuXHRjb25zdCBhTW9kZXM6IHN0cmluZ1tdID0gb01EQ0NoYXJ0LmdldFAxM25Nb2RlKCk7XG5cdGNoZWNrRm9yTm9uZmlsdGVyYWJsZUVudGl0eVNldChvTURDQ2hhcnQsIGFNb2Rlcyk7XG5cdGlmIChvT2JqICYmIG9PYmouJGtpbmQgPT09IFwiUHJvcGVydHlcIikge1xuXHRcdC8vIGlnbm9yZSAoYXMgZm9yIG5vdykgYWxsIGNvbXBsZXggcHJvcGVydGllc1xuXHRcdC8vIG5vdCBjbGVhciBpZiB0aGV5IG1pZ2h0IGJlIG5lc3RpbmcgKGNvbXBsZXggaW4gY29tcGxleClcblx0XHQvLyBub3QgY2xlYXIgaG93IHRoZXkgYXJlIHJlcHJlc2VudGVkIGluIG5vbi1maWx0ZXJhYmxlIGFubm90YXRpb25cblx0XHQvLyBldGMuXG5cdFx0aWYgKG9PYmouJGlzQ29sbGVjdGlvbikge1xuXHRcdFx0Ly9Mb2cud2FybmluZyhcIkNvbXBsZXggcHJvcGVydHkgd2l0aCB0eXBlIFwiICsgb09iai4kVHlwZSArIFwiIGhhcyBiZWVuIGlnbm9yZWRcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb1Byb3BlcnR5QW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHt0aGlzLmdldFBhdGgoKX1AYCk7XG5cdFx0Y29uc3Qgc1BhdGggPSBvTWV0YU1vZGVsLmdldE9iamVjdChcIkBzYXB1aS5uYW1lXCIsIG9NZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQodGhpcy5nZXRQYXRoKCkpKTtcblxuXHRcdGNvbnN0IGFHcm91cGFibGVQcm9wZXJ0aWVzID0gb0FwcGx5U3VwcG9ydGVkICYmIG9BcHBseVN1cHBvcnRlZC5Hcm91cGFibGVQcm9wZXJ0aWVzO1xuXHRcdGNvbnN0IGFBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzID0gb0FwcGx5U3VwcG9ydGVkICYmIG9BcHBseVN1cHBvcnRlZC5BZ2dyZWdhdGFibGVQcm9wZXJ0aWVzO1xuXHRcdGxldCBiR3JvdXBhYmxlID0gYUdyb3VwYWJsZVByb3BlcnRpZXMgPyBjaGVja1Byb3BlcnR5VHlwZShhR3JvdXBhYmxlUHJvcGVydGllcywgc1BhdGgpIDogZmFsc2U7XG5cdFx0bGV0IGJBZ2dyZWdhdGFibGUgPSBhQWdncmVnYXRhYmxlUHJvcGVydGllcyA/IGNoZWNrUHJvcGVydHlUeXBlKGFBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzLCBzUGF0aCkgOiBmYWxzZTtcblxuXHRcdGlmICghYUdyb3VwYWJsZVByb3BlcnRpZXMgfHwgKGFHcm91cGFibGVQcm9wZXJ0aWVzICYmICFhR3JvdXBhYmxlUHJvcGVydGllcy5sZW5ndGgpKSB7XG5cdFx0XHRiR3JvdXBhYmxlID0gb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkdyb3VwYWJsZVwiXTtcblx0XHR9XG5cdFx0aWYgKCFhQWdncmVnYXRhYmxlUHJvcGVydGllcyB8fCAoYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMgJiYgIWFBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzLmxlbmd0aCkpIHtcblx0XHRcdGJBZ2dyZWdhdGFibGUgPSBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuQWdncmVnYXRhYmxlXCJdO1xuXHRcdH1cblxuXHRcdC8vUmlnaHQgbm93OiBza2lwIHRoZW0sIHNpbmNlIHdlIGNhbid0IGNyZWF0ZSBhIGNoYXJ0IGZyb20gaXRcblx0XHRpZiAoIWJHcm91cGFibGUgJiYgIWJBZ2dyZWdhdGFibGUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y2hlY2tQcm9wZXJ0eUlzQm90aEdyb3VwYWJsZUFuZEFnZ3JlZ2F0YWJsZShtQ3VzdG9tQWdncmVnYXRlcywgc0tleSwgYkdyb3VwYWJsZSwgYkFnZ3JlZ2F0YWJsZSk7XG5cdFx0aWYgKGJBZ2dyZWdhdGFibGUpIHtcblx0XHRcdGNvbnN0IGFBZ2dyZWdhdGVQcm9wZXJ0aWVzID0gQ2hhcnREZWxlZ2F0ZS5fY3JlYXRlUHJvcGVydHlJbmZvc0ZvckFnZ3JlZ2F0YWJsZShcblx0XHRcdFx0b01EQ0NoYXJ0LFxuXHRcdFx0XHRzS2V5LFxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9ucyxcblx0XHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9uc0luZm8sXG5cdFx0XHRcdHNvcnRSZXN0cmljdGlvbnNJbmZvLFxuXHRcdFx0XHRtS25vd25BZ2dyZWdhdGFibGVQcm9wcyxcblx0XHRcdFx0bUN1c3RvbUFnZ3JlZ2F0ZXNcblx0XHRcdCk7XG5cdFx0XHRhQWdncmVnYXRlUHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChvQWdncmVnYXRlUHJvcGVydHk6IGFueSkge1xuXHRcdFx0XHRhUHJvcGVydGllcy5wdXNoKG9BZ2dyZWdhdGVQcm9wZXJ0eSk7XG5cdFx0XHR9KTtcblx0XHRcdC8vQWRkIHRyYW5zZm9ybWF0aW9uIGFnZ3JlZ2F0ZWQgcHJvcGVydGllcyB0byBjaGFydCBwcm9wZXJ0aWVzXG5cdFx0XHRpZiAoYU1vZGVzICYmIGFNb2Rlcy5pbmNsdWRlcyhcIkZpbHRlclwiKSkge1xuXHRcdFx0XHRjb25zdCBhS25vd25BZ2dyZWdhdGFibGVQcm9wcyA9IE9iamVjdC5rZXlzKG1Lbm93bkFnZ3JlZ2F0YWJsZVByb3BzKTtcblx0XHRcdFx0Y29uc3QgYUdyb3VwYWJsZVByb3BlcnRpZXNWYWx1ZXMgPSBhR3JvdXBhYmxlUHJvcGVydGllcy5tYXAoXG5cdFx0XHRcdFx0KG9Qcm9wZXJ0eTogeyAkUHJvcGVydHlQYXRoOiBzdHJpbmcgfSkgPT4gb1Byb3BlcnR5LiRQcm9wZXJ0eVBhdGhcblx0XHRcdFx0KTtcblx0XHRcdFx0YUtub3duQWdncmVnYXRhYmxlUHJvcHMuZm9yRWFjaCgoc1Byb3BlcnR5OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHQvLyBBZGQgdHJhbnNmb3JtYXRpb24gYWdncmVnYXRlZCBwcm9wZXJ0eSB0byBjaGFydCBzbyB0aGF0IGluIHRoZSBmaWx0ZXIgZHJvcGRvd24gaXQncyB2aXNpYmxlXG5cdFx0XHRcdFx0Ly8gQWxzbyBtYXJrIHZpc2liaWxpdHkgZmFsc2UgYXMgdGhpcyBwcm9wZXJ0eSBzaG91bGQgbm90IGNvbWUgdXAgaW4gdW5kZXIgY2hhcnQgc2VjdGlvbiBvZiBwZXJzb25hbGl6YXRpb24gZGlhbG9nXG5cdFx0XHRcdFx0aWYgKCFhR3JvdXBhYmxlUHJvcGVydGllc1ZhbHVlcy5pbmNsdWRlcyhzUHJvcGVydHkpKSB7XG5cdFx0XHRcdFx0XHRhUHJvcGVydGllcyA9IGFkZFByb3BlcnR5VG9DaGFydChcblx0XHRcdFx0XHRcdFx0YVByb3BlcnRpZXMsXG5cdFx0XHRcdFx0XHRcdHNLZXksXG5cdFx0XHRcdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zLFxuXHRcdFx0XHRcdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbyxcblx0XHRcdFx0XHRcdFx0c29ydFJlc3RyaWN0aW9uc0luZm8sXG5cdFx0XHRcdFx0XHRcdG9NRENDaGFydCxcblx0XHRcdFx0XHRcdFx0c0NyaXRpY2FsaXR5LFxuXHRcdFx0XHRcdFx0XHRvT2JqLFxuXHRcdFx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChiR3JvdXBhYmxlKSB7XG5cdFx0XHRjb25zdCBzTmFtZSA9IHNLZXkgfHwgXCJcIixcblx0XHRcdFx0c1RleHRQcm9wZXJ0eSA9IG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCJdXG5cdFx0XHRcdFx0PyBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXS4kUGF0aFxuXHRcdFx0XHRcdDogbnVsbDtcblx0XHRcdGxldCBiSXNOYXZpZ2F0aW9uVGV4dCA9IGZhbHNlO1xuXHRcdFx0aWYgKHNOYW1lICYmIHNOYW1lLmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdFx0TG9nLmVycm9yKGAkZXhwYW5kIGlzIG5vdCB5ZXQgc3VwcG9ydGVkLiBQcm9wZXJ0eTogJHtzTmFtZX0gZnJvbSBhbiBhc3NvY2lhdGlvbiBjYW5ub3QgYmUgdXNlZGApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoc1RleHRQcm9wZXJ0eSAmJiBzVGV4dFByb3BlcnR5LmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdFx0TG9nLmVycm9yKGAkZXhwYW5kIGlzIG5vdCB5ZXQgc3VwcG9ydGVkLiBUZXh0IFByb3BlcnR5OiAke3NUZXh0UHJvcGVydHl9IGZyb20gYW4gYXNzb2NpYXRpb24gY2Fubm90IGJlIHVzZWRgKTtcblx0XHRcdFx0YklzTmF2aWdhdGlvblRleHQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0YVByb3BlcnRpZXMgPSBhZGRQcm9wZXJ0eVRvQ2hhcnQoXG5cdFx0XHRcdGFQcm9wZXJ0aWVzLFxuXHRcdFx0XHRzS2V5LFxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9ucyxcblx0XHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9uc0luZm8sXG5cdFx0XHRcdHNvcnRSZXN0cmljdGlvbnNJbmZvLFxuXHRcdFx0XHRvTURDQ2hhcnQsXG5cdFx0XHRcdHNDcml0aWNhbGl0eSxcblx0XHRcdFx0b09iaixcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdGJJc05hdmlnYXRpb25UZXh0XG5cdFx0XHQpO1xuXHRcdH1cblx0fVxufTtcblxuLy8gY3JlYXRlIHByb3BlcnRpZXMgZm9yIGNoYXJ0XG5mdW5jdGlvbiBhZGRQcm9wZXJ0eVRvQ2hhcnQoXG5cdGFQcm9wZXJ0aWVzOiBhbnlbXSxcblx0c0tleTogc3RyaW5nLFxuXHRvUHJvcGVydHlBbm5vdGF0aW9uczogYW55LFxuXHRvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbzogYW55LFxuXHRzb3J0UmVzdHJpY3Rpb25zSW5mbzogYW55LFxuXHRvTURDQ2hhcnQ6IENoYXJ0LFxuXHRzQ3JpdGljYWxpdHk6IHN0cmluZyxcblx0b09iajogYW55LFxuXHRiSXNHcm91cGFibGU6IGJvb2xlYW4sXG5cdGJJc0FnZ3JlZ2F0YWJsZTogYm9vbGVhbixcblx0YklzTmF2aWdhdGlvblRleHQ/OiBib29sZWFuLFxuXHRiSXNIaWRkZW4/OiBib29sZWFuXG4pOiBhbnlbXSB7XG5cdGFQcm9wZXJ0aWVzLnB1c2goe1xuXHRcdG5hbWU6IFwiX2ZlX2dyb3VwYWJsZV9cIiArIHNLZXksXG5cdFx0cHJvcGVydHlQYXRoOiBzS2V5LFxuXHRcdGxhYmVsOiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxcIl0gfHwgc0tleSxcblx0XHRzb3J0YWJsZTogQ2hhcnREZWxlZ2F0ZS5fZ2V0U29ydGFibGUob01EQ0NoYXJ0LCBzb3J0UmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bc0tleV0sIGZhbHNlKSxcblx0XHRmaWx0ZXJhYmxlOiBvRmlsdGVyUmVzdHJpY3Rpb25zSW5mb1tzS2V5XSA/IG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvW3NLZXldLmZpbHRlcmFibGUgOiB0cnVlLFxuXHRcdGdyb3VwYWJsZTogYklzR3JvdXBhYmxlLFxuXHRcdGFnZ3JlZ2F0YWJsZTogYklzQWdncmVnYXRhYmxlLFxuXHRcdG1heENvbmRpdGlvbnM6IGlzTXVsdGlWYWx1ZUZpbHRlckV4cHJlc3Npb24ob0ZpbHRlclJlc3RyaWN0aW9uc0luZm8ucHJvcGVydHlJbmZvW3NLZXldKSA/IC0xIDogMSxcblx0XHRzb3J0S2V5OiBzS2V5LFxuXHRcdHBhdGg6IHNLZXksXG5cdFx0cm9sZTogQ2hhcnRJdGVtUm9sZVR5cGUuY2F0ZWdvcnksIC8vc3RhbmRhcmQsIG5vcm1hbGx5IHRoaXMgc2hvdWxkIGJlIGludGVycHJldGVkIGZyb20gVUkuQ2hhcnQgYW5ub3RhdGlvblxuXHRcdGNyaXRpY2FsaXR5OiBzQ3JpdGljYWxpdHksIC8vVG8gYmUgaW1wbGVtZW50ZWQgYnkgRkVcblx0XHR0eXBlQ29uZmlnOiBvT2JqLnR5cGVDb25maWcsXG5cdFx0dmlzaWJsZTogYklzSGlkZGVuID8gIWJJc0hpZGRlbiA6IHRydWUsXG5cdFx0dGV4dFByb3BlcnR5OlxuXHRcdFx0IWJJc05hdmlnYXRpb25UZXh0ICYmIG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCJdXG5cdFx0XHRcdD8gb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl0uJFBhdGhcblx0XHRcdFx0OiBudWxsLCAvL1RvIGJlIGltcGxlbWVudGVkIGJ5IEZFXG5cdFx0dGV4dEZvcm1hdHRlcjogb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCJdXG5cdH0pO1xuXG5cdHJldHVybiBhUHJvcGVydGllcztcbn1cblxuLy8gSWYgZW50aXR5c2V0IGlzIG5vbiBmaWx0ZXJhYmxlLHRoZW4gZnJvbSBwMTNuIG1vZGVzIHJlbW92ZSBGaWx0ZXIgc28gdGhhdCBvbiBVSSBmaWx0ZXIgb3B0aW9uIGRvZXNuJ3Qgc2hvdyB1cFxuZnVuY3Rpb24gY2hlY2tGb3JOb25maWx0ZXJhYmxlRW50aXR5U2V0KG9NRENDaGFydDogQ2hhcnQsIGFNb2RlczogYW55W10pIHtcblx0Y29uc3QgYkVudGl0eVNldEZpbGVyYWJsZSA9IG9NRENDaGFydFxuXHRcdD8uZ2V0TW9kZWwoKVxuXHRcdD8uZ2V0TWV0YU1vZGVsKClcblx0XHQ/LmdldE9iamVjdChgJHtvTURDQ2hhcnQuZGF0YShcInRhcmdldENvbGxlY3Rpb25QYXRoXCIpfUBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlclJlc3RyaWN0aW9uc2ApPy5GaWx0ZXJhYmxlO1xuXHRpZiAoYkVudGl0eVNldEZpbGVyYWJsZSAhPT0gdW5kZWZpbmVkICYmICFiRW50aXR5U2V0RmlsZXJhYmxlKSB7XG5cdFx0YU1vZGVzID0gYU1vZGVzLmZpbHRlcigoaXRlbTogYW55KSA9PiBpdGVtICE9PSBcIkZpbHRlclwiKTtcblx0XHRvTURDQ2hhcnQuc2V0UDEzbk1vZGUoYU1vZGVzKTtcblx0fVxufVxuXG4vLyAgY2hlY2sgaWYgR3JvdXBhYmxlIC9BZ2dyZWdhdGFibGUgcHJvcGVydHkgaXMgcHJlc2VudCBvciBub3RcbmZ1bmN0aW9uIGNoZWNrUHJvcGVydHlUeXBlKGFQcm9wZXJ0aWVzOiBhbnlbXSwgc1BhdGg6IHN0cmluZykge1xuXHRpZiAoYVByb3BlcnRpZXMubGVuZ3RoKSB7XG5cdFx0Zm9yIChjb25zdCBlbGVtZW50IG9mIGFQcm9wZXJ0aWVzKSB7XG5cdFx0XHRpZiAoZWxlbWVudD8uJFByb3BlcnR5UGF0aCA9PT0gc1BhdGggfHwgZWxlbWVudD8uUHJvcGVydHk/LiRQcm9wZXJ0eVBhdGggPT09IHNQYXRoKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG4vL0lmIHNhbWUgY3VzdG9tIHByb3BlcnR5IGlzIGNvbmZpZ3VyZWQgYXMgZ3JvdXBhYmxlIGFuZCBhZ2dyZWdhdGFibGUgdGhyb3cgYW4gZXJyb3JcbmZ1bmN0aW9uIGNoZWNrUHJvcGVydHlJc0JvdGhHcm91cGFibGVBbmRBZ2dyZWdhdGFibGUoXG5cdG1DdXN0b21BZ2dyZWdhdGVzOiB7IFtwcm9wZXJ0eU5hbWU6IHN0cmluZ106IHVua25vd24gfSxcblx0c0tleTogc3RyaW5nLFxuXHRiR3JvdXBhYmxlPzogYm9vbGVhbixcblx0YkFnZ3JlZ2F0YWJsZT86IGJvb2xlYW5cbikge1xuXHRjb25zdCBjdXN0b21Qcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMobUN1c3RvbUFnZ3JlZ2F0ZXMpO1xuXHRpZiAoYkdyb3VwYWJsZSAmJiBiQWdncmVnYXRhYmxlICYmIGN1c3RvbVByb3BlcnRpZXMuaW5jbHVkZXMoc0tleSkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTYW1lIHByb3BlcnR5IGNhbiBub3QgYmUgY29uZmlndXJlZCBhcyBncm91cGFibGUgYW5kIGFnZ3JlZ2F0YWJsZVwiKTtcblx0fVxufVxuXG5DaGFydERlbGVnYXRlLmZvcm1hdFRleHQgPSBmdW5jdGlvbiAob1ZhbHVlMTogYW55LCBvVmFsdWUyOiBhbnkpIHtcblx0Y29uc3Qgb1RleHRBcnJhbmdlbWVudEFubm90YXRpb24gPSB0aGlzLnRleHRGb3JtYXR0ZXI7XG5cdGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRGaXJzdFwiKSB7XG5cdFx0cmV0dXJuIGAke29WYWx1ZTJ9ICgke29WYWx1ZTF9KWA7XG5cdH0gZWxzZSBpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0TGFzdFwiKSB7XG5cdFx0cmV0dXJuIGAke29WYWx1ZTF9ICgke29WYWx1ZTJ9KWA7XG5cdH0gZWxzZSBpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0T25seVwiKSB7XG5cdFx0cmV0dXJuIG9WYWx1ZTI7XG5cdH1cblx0cmV0dXJuIG9WYWx1ZTIgPyBvVmFsdWUyIDogb1ZhbHVlMTtcbn07XG5cbkNoYXJ0RGVsZWdhdGUudXBkYXRlQmluZGluZ0luZm8gPSBmdW5jdGlvbiAob0NoYXJ0OiBhbnksIG9CaW5kaW5nSW5mbzogYW55KSB7XG5cdENoYXJ0RGVsZWdhdGUuX3NldENoYXJ0Tm9EYXRhVGV4dChvQ2hhcnQsIG9CaW5kaW5nSW5mbyk7XG5cdGNvbnN0IG9GaWx0ZXIgPSBzYXAudWkuZ2V0Q29yZSgpLmJ5SWQob0NoYXJ0LmdldEZpbHRlcigpKSBhcyBhbnk7XG5cdGNvbnN0IG1Db25kaXRpb25zID0gb0NoYXJ0LmdldENvbmRpdGlvbnMoKTtcblx0aWYgKCFvQmluZGluZ0luZm8pIHtcblx0XHRvQmluZGluZ0luZm8gPSB7fTtcblx0fVxuXHRpZiAoIW9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzKSB7XG5cdFx0b0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMgPSB7fTtcblx0fVxuXHRpZiAob0ZpbHRlcikge1xuXHRcdC8vIFNlYXJjaFxuXHRcdGNvbnN0IG9JbmZvID0gRmlsdGVyVXRpbHMuZ2V0RmlsdGVySW5mbyhvRmlsdGVyLCB7fSk7XG5cdFx0Y29uc3Qgb0FwcGx5U3VwcG9ydGVkID0gQ29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShvQ2hhcnQuZGF0YShcImFwcGx5U3VwcG9ydGVkXCIpKTtcblx0XHRpZiAob0FwcGx5U3VwcG9ydGVkICYmIG9BcHBseVN1cHBvcnRlZC5lbmFibGVTZWFyY2ggJiYgb0luZm8uc2VhcmNoKSB7XG5cdFx0XHRvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoID0gQ29tbW9uVXRpbHMubm9ybWFsaXplU2VhcmNoVGVybShvSW5mby5zZWFyY2gpO1xuXHRcdH0gZWxzZSBpZiAob0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlYXJjaCkge1xuXHRcdFx0ZGVsZXRlIG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2g7XG5cdFx0fVxuXHR9XG5cdGNvbnN0IHNQYXJhbWV0ZXJQYXRoID0gbUNvbmRpdGlvbnMgPyBEZWxlZ2F0ZVV0aWwuZ2V0UGFyYW1ldGVyc0luZm8ob0ZpbHRlciwgbUNvbmRpdGlvbnMpIDogbnVsbDtcblx0aWYgKHNQYXJhbWV0ZXJQYXRoKSB7XG5cdFx0b0JpbmRpbmdJbmZvLnBhdGggPSBzUGFyYW1ldGVyUGF0aDtcblx0fVxuXHRjb25zdCBvRmlsdGVySW5mbyA9IENoYXJ0VXRpbHMuZ2V0QWxsRmlsdGVySW5mbyhvQ2hhcnQpO1xuXG5cdC8vIHJlbW92ZSBwcmVmaXhlcyBzbyB0aGF0IGVudGl0eXNldCB3aWxsIG1hdGNoIHdpdGggdGhlIHByb3BlcnR5IG5hbWVzIHdpdGggdGhlc2UgZmllbGRcblx0aWYgKG9GaWx0ZXJJbmZvLmZpbHRlcnMpIHtcblx0XHRvRmlsdGVySW5mby5maWx0ZXJzID0gQ29tbW9uVXRpbHMuZ2V0Q2hhcnRQcm9wZXJ0aWVzV2l0aG91dFByZWZpeGVzKG9GaWx0ZXJJbmZvLmZpbHRlcnMpO1xuXHR9XG5cblx0b0JpbmRpbmdJbmZvLmZpbHRlcnMgPSBvRmlsdGVySW5mby5maWx0ZXJzLmxlbmd0aCA+IDAgPyBuZXcgRmlsdGVyKHsgZmlsdGVyczogb0ZpbHRlckluZm8uZmlsdGVycywgYW5kOiB0cnVlIH0pIDogbnVsbDtcblx0b0JpbmRpbmdJbmZvLnNvcnRlciA9IHRoaXMuZ2V0U29ydGVycyhvQ2hhcnQpO1xuXHRDaGFydERlbGVnYXRlLl9jaGVja0FuZEFkZERyYWZ0RmlsdGVyKG9DaGFydCwgb0JpbmRpbmdJbmZvKTtcbn07XG5cbkNoYXJ0RGVsZWdhdGUuZmV0Y2hQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKG9NRENDaGFydDogQ2hhcnQpIHtcblx0Y29uc3Qgb01vZGVsID0gdGhpcy5fZ2V0TW9kZWwob01EQ0NoYXJ0KTtcblx0bGV0IHBDcmVhdGVQcm9wZXJ0eUluZm9zO1xuXG5cdGlmICghb01vZGVsKSB7XG5cdFx0cENyZWF0ZVByb3BlcnR5SW5mb3MgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZTogYW55KSA9PiB7XG5cdFx0XHRvTURDQ2hhcnQuYXR0YWNoTW9kZWxDb250ZXh0Q2hhbmdlKFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmVzb2x2ZXI6IHJlc29sdmVcblx0XHRcdFx0fSxcblx0XHRcdFx0b25Nb2RlbENvbnRleHRDaGFuZ2UgYXMgYW55LFxuXHRcdFx0XHR0aGlzXG5cdFx0XHQpO1xuXHRcdH0pLnRoZW4oKG9SZXRyaWV2ZWRNb2RlbDogYW55KSA9PiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY3JlYXRlUHJvcGVydHlJbmZvcyhvTURDQ2hhcnQsIG9SZXRyaWV2ZWRNb2RlbCk7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cENyZWF0ZVByb3BlcnR5SW5mb3MgPSB0aGlzLl9jcmVhdGVQcm9wZXJ0eUluZm9zKG9NRENDaGFydCwgb01vZGVsKTtcblx0fVxuXG5cdHJldHVybiBwQ3JlYXRlUHJvcGVydHlJbmZvcy50aGVuKGZ1bmN0aW9uIChhUHJvcGVydGllczogYW55KSB7XG5cdFx0aWYgKG9NRENDaGFydC5kYXRhKSB7XG5cdFx0XHRvTURDQ2hhcnQuZGF0YShcIiRtZGNDaGFydFByb3BlcnR5SW5mb1wiLCBhUHJvcGVydGllcyk7XG5cdFx0XHQvLyBzdG9yZSB0aGUgcHJvcGVydGllcyB0byBmZXRjaCBkdXJpbmcgcDEzbiBjYWxjdWxhdGlvblxuXHRcdFx0TWFjcm9zRGVsZWdhdGVVdGlsLnNldENhY2hlZFByb3BlcnRpZXMob01EQ0NoYXJ0LCBhUHJvcGVydGllcyk7XG5cdFx0fVxuXHRcdHJldHVybiBhUHJvcGVydGllcztcblx0fSk7XG59O1xuZnVuY3Rpb24gb25Nb2RlbENvbnRleHRDaGFuZ2UodGhpczogdHlwZW9mIENoYXJ0RGVsZWdhdGUsIG9FdmVudDogYW55LCBvRGF0YTogYW55KSB7XG5cdGNvbnN0IG9NRENDaGFydCA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0Y29uc3Qgb01vZGVsID0gdGhpcy5fZ2V0TW9kZWwob01EQ0NoYXJ0KTtcblxuXHRpZiAob01vZGVsKSB7XG5cdFx0b01EQ0NoYXJ0LmRldGFjaE1vZGVsQ29udGV4dENoYW5nZShvbk1vZGVsQ29udGV4dENoYW5nZSk7XG5cdFx0b0RhdGEucmVzb2x2ZXIob01vZGVsKTtcblx0fVxufVxuQ2hhcnREZWxlZ2F0ZS5fY3JlYXRlUHJvcGVydHlJbmZvcyA9IGFzeW5jIGZ1bmN0aW9uIChvTURDQ2hhcnQ6IGFueSwgb01vZGVsOiBhbnkpIHtcblx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBgLyR7b01EQ0NoYXJ0LmRhdGEoXCJlbnRpdHlTZXRcIil9YDtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0Y29uc3QgYVJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChbb01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofS9gKSwgb01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofUBgKV0pO1xuXHRjb25zdCBhUHJvcGVydGllczogYW55W10gPSBbXTtcblx0bGV0IG9FbnRpdHlUeXBlID0gYVJlc3VsdHNbMF07XG5cdGNvbnN0IG1FbnRpdHlTZXRBbm5vdGF0aW9ucyA9IGFSZXN1bHRzWzFdO1xuXHRvRW50aXR5VHlwZSA9IGFsbG93ZWRQcm9wZXJ0aWVzRm9yRmlsdGVyT3B0aW9uKG9FbnRpdHlUeXBlLCBvTURDQ2hhcnQpO1xuXHRjb25zdCBtQ3VzdG9tQWdncmVnYXRlcyA9IENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEob01EQ0NoYXJ0LmRhdGEoXCJjdXN0b21BZ2dcIikpO1xuXHRnZXRDdXN0b21BZ2dyZWdhdGUobUN1c3RvbUFnZ3JlZ2F0ZXMsIG9NRENDaGFydCk7XG5cdGxldCBzQW5ubztcblx0Y29uc3QgYVByb3BlcnR5UHJvbWlzZSA9IFtdO1xuXHRmb3IgKGNvbnN0IHNBbm5vS2V5IGluIG1FbnRpdHlTZXRBbm5vdGF0aW9ucykge1xuXHRcdGlmIChzQW5ub0tleS5zdGFydHNXaXRoKFwiQE9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5DdXN0b21BZ2dyZWdhdGVcIikpIHtcblx0XHRcdHNBbm5vID0gc0Fubm9LZXkucmVwbGFjZShcIkBPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuQ3VzdG9tQWdncmVnYXRlI1wiLCBcIlwiKTtcblx0XHRcdGNvbnN0IGFBbm5vID0gc0Fubm8uc3BsaXQoXCJAXCIpO1xuXG5cdFx0XHRpZiAoYUFubm8ubGVuZ3RoID09IDIgJiYgYUFubm9bMV0gPT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxcIikge1xuXHRcdFx0XHRtQ3VzdG9tQWdncmVnYXRlc1thQW5ub1swXV0gPSBtRW50aXR5U2V0QW5ub3RhdGlvbnNbc0Fubm9LZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRjb25zdCBtVHlwZUFnZ3JlZ2F0YWJsZVByb3BzID0gQ29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShvTURDQ2hhcnQuZGF0YShcInRyYW5zQWdnXCIpKTtcblx0Y29uc3QgbUtub3duQWdncmVnYXRhYmxlUHJvcHM6IGFueSA9IHt9O1xuXHRmb3IgKGNvbnN0IHNBZ2dyZWdhdGFibGUgaW4gbVR5cGVBZ2dyZWdhdGFibGVQcm9wcykge1xuXHRcdGNvbnN0IHNQcm9wS2V5ID0gbVR5cGVBZ2dyZWdhdGFibGVQcm9wc1tzQWdncmVnYXRhYmxlXS5wcm9wZXJ0eVBhdGg7XG5cdFx0bUtub3duQWdncmVnYXRhYmxlUHJvcHNbc1Byb3BLZXldID0gbUtub3duQWdncmVnYXRhYmxlUHJvcHNbc1Byb3BLZXldIHx8IHt9O1xuXHRcdG1Lbm93bkFnZ3JlZ2F0YWJsZVByb3BzW3NQcm9wS2V5XVttVHlwZUFnZ3JlZ2F0YWJsZVByb3BzW3NBZ2dyZWdhdGFibGVdLmFnZ3JlZ2F0aW9uTWV0aG9kXSA9IHtcblx0XHRcdG5hbWU6IG1UeXBlQWdncmVnYXRhYmxlUHJvcHNbc0FnZ3JlZ2F0YWJsZV0ubmFtZSxcblx0XHRcdGxhYmVsOiBtVHlwZUFnZ3JlZ2F0YWJsZVByb3BzW3NBZ2dyZWdhdGFibGVdLmxhYmVsXG5cdFx0fTtcblx0fVxuXHRmb3IgKGNvbnN0IHNLZXkgaW4gb0VudGl0eVR5cGUpIHtcblx0XHRpZiAoc0tleS5pbmRleE9mKFwiJFwiKSAhPT0gMCkge1xuXHRcdFx0YVByb3BlcnR5UHJvbWlzZS5wdXNoKFxuXHRcdFx0XHRDaGFydEhlbHBlci5mZXRjaENyaXRpY2FsaXR5KG9NZXRhTW9kZWwsIG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYCR7c0VudGl0eVNldFBhdGh9LyR7c0tleX1gKSkudGhlbihcblx0XHRcdFx0XHRDaGFydERlbGVnYXRlLl9oYW5kbGVQcm9wZXJ0eS5iaW5kKFxuXHRcdFx0XHRcdFx0b01ldGFNb2RlbC5nZXRNZXRhQ29udGV4dChgJHtzRW50aXR5U2V0UGF0aH0vJHtzS2V5fWApLFxuXHRcdFx0XHRcdFx0b01EQ0NoYXJ0LFxuXHRcdFx0XHRcdFx0bUVudGl0eVNldEFubm90YXRpb25zLFxuXHRcdFx0XHRcdFx0bUtub3duQWdncmVnYXRhYmxlUHJvcHMsXG5cdFx0XHRcdFx0XHRtQ3VzdG9tQWdncmVnYXRlcyxcblx0XHRcdFx0XHRcdGFQcm9wZXJ0aWVzXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXHRhd2FpdCBQcm9taXNlLmFsbChhUHJvcGVydHlQcm9taXNlKTtcblxuXHRyZXR1cm4gYVByb3BlcnRpZXM7XG59O1xuXG4vLyBmb3IgZXZlcnkgcHJvcGVydHkgb2YgY2hhcnQsIGNvbmZpZ3VyZSB0aGUgdHlwZUNvbmZpZyB3aGljaCB3ZSB3b3VsZCBsaWtlIHRvIHNlZSBpbiB0aGUgZmlsdGVyIGRyb3Bkcm93biBsaXN0XG5mdW5jdGlvbiBhbGxvd2VkUHJvcGVydGllc0ZvckZpbHRlck9wdGlvbihvRW50aXR5VHlwZTogYW55LCBvTURDQ2hhcnQ6IGFueSkge1xuXHRmb3IgKGNvbnN0IGkgaW4gb0VudGl0eVR5cGUpIHtcblx0XHRpZiAoaSA9PSBcIiRLZXlcIiB8fCBpID09IFwiJGtpbmRcIiB8fCBpID09IFwiU0FQX01lc3NhZ2VcIikge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fSBlbHNlIGlmIChvRW50aXR5VHlwZVtpXVtcIiRraW5kXCJdID09IFwiUHJvcGVydHlcIikge1xuXHRcdFx0b0VudGl0eVR5cGVbaV1bXCJ0eXBlQ29uZmlnXCJdID0gb01EQ0NoYXJ0LmdldFR5cGVVdGlsKCkuZ2V0VHlwZUNvbmZpZyhvRW50aXR5VHlwZVtpXS4kVHlwZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9FbnRpdHlUeXBlW2ldW1widHlwZUNvbmZpZ1wiXSA9IG51bGw7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBvRW50aXR5VHlwZTtcbn1cblxuZnVuY3Rpb24gZ2V0Q3VzdG9tQWdncmVnYXRlKG1DdXN0b21BZ2dyZWdhdGVzOiBhbnksIG9NRENDaGFydDogYW55KSB7XG5cdGNvbnN0IGFEaW1lbnNpb25zOiBhbnlbXSA9IFtdLFxuXHRcdGFNZWFzdXJlcyA9IFtdO1xuXHRpZiAobUN1c3RvbUFnZ3JlZ2F0ZXMgJiYgT2JqZWN0LmtleXMobUN1c3RvbUFnZ3JlZ2F0ZXMpLmxlbmd0aCA+PSAxKSB7XG5cdFx0Y29uc3QgYUNoYXJ0SXRlbXMgPSBvTURDQ2hhcnQuZ2V0SXRlbXMoKTtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBhQ2hhcnRJdGVtcykge1xuXHRcdFx0aWYgKGFDaGFydEl0ZW1zW2tleV0uZ2V0VHlwZSgpID09PSBcImdyb3VwYWJsZVwiKSB7XG5cdFx0XHRcdGFEaW1lbnNpb25zLnB1c2goQ2hhcnREZWxlZ2F0ZS5nZXRJbnRlcm5hbENoYXJ0TmFtZUZyb21Qcm9wZXJ0eU5hbWVBbmRLaW5kKGFDaGFydEl0ZW1zW2tleV0uZ2V0TmFtZSgpLCBcImdyb3VwYWJsZVwiKSk7XG5cdFx0XHR9IGVsc2UgaWYgKGFDaGFydEl0ZW1zW2tleV0uZ2V0VHlwZSgpID09PSBcImFnZ3JlZ2F0YWJsZVwiKSB7XG5cdFx0XHRcdGFNZWFzdXJlcy5wdXNoKENoYXJ0RGVsZWdhdGUuZ2V0SW50ZXJuYWxDaGFydE5hbWVGcm9tUHJvcGVydHlOYW1lQW5kS2luZChhQ2hhcnRJdGVtc1trZXldLmdldE5hbWUoKSwgXCJhZ2dyZWdhdGFibGVcIikpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHRhTWVhc3VyZXMuZmlsdGVyKGZ1bmN0aW9uICh2YWw6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gYURpbWVuc2lvbnMuaW5kZXhPZih2YWwpICE9IC0xO1xuXHRcdFx0fSkubGVuZ3RoID49IDFcblx0XHQpIHtcblx0XHRcdExvZy5lcnJvcihcIkRpbWVuc2lvbiBhbmQgTWVhc3VyZSBoYXMgdGhlIHNhbWVQcm9wZXJ0eSBDb25maWd1cmVkXCIpO1xuXHRcdH1cblx0fVxufVxuXG5DaGFydERlbGVnYXRlLl9jcmVhdGVQcm9wZXJ0eUluZm9zRm9yQWdncmVnYXRhYmxlID0gZnVuY3Rpb24gKFxuXHRvTURDQ2hhcnQ6IENoYXJ0LFxuXHRzS2V5OiBzdHJpbmcsXG5cdG9Qcm9wZXJ0eUFubm90YXRpb25zOiBhbnksXG5cdG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvOiBhbnksXG5cdHNvcnRSZXN0cmljdGlvbnNJbmZvOiBTb3J0UmVzdHJpY3Rpb25zSW5mb1R5cGUsXG5cdG1Lbm93bkFnZ3JlZ2F0YWJsZVByb3BzOiBhbnksXG5cdG1DdXN0b21BZ2dyZWdhdGVzOiBhbnlcbikge1xuXHRjb25zdCBhQWdncmVnYXRlUHJvcGVydGllcyA9IFtdO1xuXHRpZiAoT2JqZWN0LmtleXMobUtub3duQWdncmVnYXRhYmxlUHJvcHMpLmluZGV4T2Yoc0tleSkgPiAtMSkge1xuXHRcdGZvciAoY29uc3Qgc0FnZ3JlZ2F0YWJsZSBpbiBtS25vd25BZ2dyZWdhdGFibGVQcm9wc1tzS2V5XSkge1xuXHRcdFx0YUFnZ3JlZ2F0ZVByb3BlcnRpZXMucHVzaCh7XG5cdFx0XHRcdG5hbWU6IFwiX2ZlX2FnZ3JlZ2F0YWJsZV9cIiArIG1Lbm93bkFnZ3JlZ2F0YWJsZVByb3BzW3NLZXldW3NBZ2dyZWdhdGFibGVdLm5hbWUsXG5cdFx0XHRcdHByb3BlcnR5UGF0aDogc0tleSxcblx0XHRcdFx0bGFiZWw6XG5cdFx0XHRcdFx0bUtub3duQWdncmVnYXRhYmxlUHJvcHNbc0tleV1bc0FnZ3JlZ2F0YWJsZV0ubGFiZWwgfHxcblx0XHRcdFx0XHRgJHtvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxcIl19ICgke3NBZ2dyZWdhdGFibGV9KWAgfHxcblx0XHRcdFx0XHRgJHtzS2V5fSAoJHtzQWdncmVnYXRhYmxlfSlgLFxuXHRcdFx0XHRzb3J0YWJsZTogc29ydFJlc3RyaWN0aW9uc0luZm8ucHJvcGVydHlJbmZvW3NLZXldID8gc29ydFJlc3RyaWN0aW9uc0luZm8ucHJvcGVydHlJbmZvW3NLZXldLnNvcnRhYmxlIDogdHJ1ZSxcblx0XHRcdFx0ZmlsdGVyYWJsZTogZmFsc2UsXG5cdFx0XHRcdGdyb3VwYWJsZTogZmFsc2UsXG5cdFx0XHRcdGFnZ3JlZ2F0YWJsZTogdHJ1ZSxcblx0XHRcdFx0cGF0aDogc0tleSxcblx0XHRcdFx0YWdncmVnYXRpb25NZXRob2Q6IHNBZ2dyZWdhdGFibGUsXG5cdFx0XHRcdG1heENvbmRpdGlvbnM6IGlzTXVsdGlWYWx1ZUZpbHRlckV4cHJlc3Npb24ob0ZpbHRlclJlc3RyaWN0aW9uc0luZm8ucHJvcGVydHlJbmZvW3NLZXldKSA/IC0xIDogMSxcblx0XHRcdFx0cm9sZTogQ2hhcnRJdGVtUm9sZVR5cGUuYXhpczEsXG5cdFx0XHRcdGRhdGFwb2ludDogbnVsbCAvL1RvIGJlIGltcGxlbWVudGVkIGJ5IEZFXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblx0aWYgKE9iamVjdC5rZXlzKG1DdXN0b21BZ2dyZWdhdGVzKS5pbmRleE9mKHNLZXkpID4gLTEpIHtcblx0XHRmb3IgKGNvbnN0IHNDdXN0b20gaW4gbUN1c3RvbUFnZ3JlZ2F0ZXMpIHtcblx0XHRcdGlmIChzQ3VzdG9tID09PSBzS2V5KSB7XG5cdFx0XHRcdGNvbnN0IG9JdGVtID0gbWVyZ2Uoe30sIG1DdXN0b21BZ2dyZWdhdGVzW3NDdXN0b21dLCB7XG5cdFx0XHRcdFx0bmFtZTogXCJfZmVfYWdncmVnYXRhYmxlX1wiICsgc0N1c3RvbSxcblx0XHRcdFx0XHRncm91cGFibGU6IGZhbHNlLFxuXHRcdFx0XHRcdGFnZ3JlZ2F0YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRmaWx0ZXJhYmxlOiBmYWxzZSxcblx0XHRcdFx0XHRyb2xlOiBDaGFydEl0ZW1Sb2xlVHlwZS5heGlzMSxcblx0XHRcdFx0XHRwcm9wZXJ0eVBhdGg6IHNDdXN0b20sXG5cdFx0XHRcdFx0ZGF0YXBvaW50OiBudWxsIC8vVG8gYmUgaW1wbGVtZW50ZWQgYnkgRkVcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGFBZ2dyZWdhdGVQcm9wZXJ0aWVzLnB1c2gob0l0ZW0pO1xuXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gYUFnZ3JlZ2F0ZVByb3BlcnRpZXM7XG59O1xuQ2hhcnREZWxlZ2F0ZS5yZWJpbmQgPSBmdW5jdGlvbiAob01EQ0NoYXJ0OiBhbnksIG9CaW5kaW5nSW5mbzogYW55KSB7XG5cdGNvbnN0IHNTZWFyY2ggPSBvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoO1xuXG5cdGlmIChzU2VhcmNoKSB7XG5cdFx0ZGVsZXRlIG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2g7XG5cdH1cblxuXHRCYXNlQ2hhcnREZWxlZ2F0ZS5yZWJpbmQob01EQ0NoYXJ0LCBvQmluZGluZ0luZm8pO1xuXG5cdGlmIChzU2VhcmNoKSB7XG5cdFx0Y29uc3Qgb0lubmVyQ2hhcnQgPSBvTURDQ2hhcnQuZ2V0Q29udHJvbERlbGVnYXRlKCkuZ2V0SW5uZXJDaGFydChvTURDQ2hhcnQpLFxuXHRcdFx0b0NoYXJ0QmluZGluZyA9IG9Jbm5lckNoYXJ0ICYmIG9Jbm5lckNoYXJ0LmdldEJpbmRpbmcoXCJkYXRhXCIpO1xuXG5cdFx0Ly8gVGVtcG9yYXJ5IHdvcmthcm91bmQgdW50aWwgdGhpcyBpcyBmaXhlZCBpbiBNRENDaGFydCAvIFVJNSBDaGFydFxuXHRcdC8vIEluIG9yZGVyIHRvIGF2b2lkIGhhdmluZyAyIE9EYXRhIHJlcXVlc3RzLCB3ZSBuZWVkIHRvIHN1c3BlbmQgdGhlIGJpbmRpbmcgYmVmb3JlIHNldHRpbmcgc29tZSBhZ2dyZWdhdGlvbiBwcm9wZXJ0aWVzXG5cdFx0Ly8gYW5kIHJlc3VtZSBpdCBvbmNlIHRoZSBjaGFydCBoYXMgYWRkZWQgb3RoZXIgYWdncmVnYXRpb24gcHJvcGVydGllcyAoaW4gb25CZWZvcmVSZW5kZXJpbmcpXG5cdFx0b0NoYXJ0QmluZGluZy5zdXNwZW5kKCk7XG5cdFx0b0NoYXJ0QmluZGluZy5zZXRBZ2dyZWdhdGlvbih7IHNlYXJjaDogc1NlYXJjaCB9KTtcblxuXHRcdGNvbnN0IG9Jbm5lckNoYXJ0RGVsZWdhdGUgPSB7XG5cdFx0XHRvbkJlZm9yZVJlbmRlcmluZzogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRvQ2hhcnRCaW5kaW5nLnJlc3VtZSgpO1xuXHRcdFx0XHRvSW5uZXJDaGFydC5yZW1vdmVFdmVudERlbGVnYXRlKG9Jbm5lckNoYXJ0RGVsZWdhdGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0b0lubmVyQ2hhcnQuYWRkRXZlbnREZWxlZ2F0ZShvSW5uZXJDaGFydERlbGVnYXRlKTtcblx0fVxuXG5cdG9NRENDaGFydC5maXJlRXZlbnQoXCJiaW5kaW5nVXBkYXRlZFwiKTtcbn07XG5DaGFydERlbGVnYXRlLl9zZXRDaGFydCA9IGZ1bmN0aW9uIChvTURDQ2hhcnQ6IGFueSwgb0lubmVyQ2hhcnQ6IGFueSkge1xuXHRjb25zdCBvQ2hhcnRBUEkgPSBvTURDQ2hhcnQuZ2V0UGFyZW50KCk7XG5cdG9Jbm5lckNoYXJ0LnNldFZpelByb3BlcnRpZXMob01EQ0NoYXJ0LmRhdGEoXCJ2aXpQcm9wZXJ0aWVzXCIpKTtcblx0b0lubmVyQ2hhcnQuZGV0YWNoU2VsZWN0RGF0YShvQ2hhcnRBUEkuaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLmJpbmQob0NoYXJ0QVBJKSk7XG5cdG9Jbm5lckNoYXJ0LmRldGFjaERlc2VsZWN0RGF0YShvQ2hhcnRBUEkuaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLmJpbmQob0NoYXJ0QVBJKSk7XG5cdG9Jbm5lckNoYXJ0LmRldGFjaERyaWxsZWRVcChvQ2hhcnRBUEkuaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLmJpbmQob0NoYXJ0QVBJKSk7XG5cdG9Jbm5lckNoYXJ0LmF0dGFjaFNlbGVjdERhdGEob0NoYXJ0QVBJLmhhbmRsZVNlbGVjdGlvbkNoYW5nZS5iaW5kKG9DaGFydEFQSSkpO1xuXHRvSW5uZXJDaGFydC5hdHRhY2hEZXNlbGVjdERhdGEob0NoYXJ0QVBJLmhhbmRsZVNlbGVjdGlvbkNoYW5nZS5iaW5kKG9DaGFydEFQSSkpO1xuXHRvSW5uZXJDaGFydC5hdHRhY2hEcmlsbGVkVXAob0NoYXJ0QVBJLmhhbmRsZVNlbGVjdGlvbkNoYW5nZS5iaW5kKG9DaGFydEFQSSkpO1xuXG5cdG9Jbm5lckNoYXJ0LnNldFNlbGVjdGlvbk1vZGUob01EQ0NoYXJ0LmdldFBheWxvYWQoKS5zZWxlY3Rpb25Nb2RlLnRvVXBwZXJDYXNlKCkpO1xuXHRCYXNlQ2hhcnREZWxlZ2F0ZS5fc2V0Q2hhcnQob01EQ0NoYXJ0LCBvSW5uZXJDaGFydCk7XG59O1xuQ2hhcnREZWxlZ2F0ZS5fZ2V0QmluZGluZ0luZm8gPSBmdW5jdGlvbiAob01EQ0NoYXJ0OiBhbnkpIHtcblx0aWYgKHRoaXMuX2dldEJpbmRpbmdJbmZvRnJvbVN0YXRlKG9NRENDaGFydCkpIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0QmluZGluZ0luZm9Gcm9tU3RhdGUob01EQ0NoYXJ0KTtcblx0fVxuXG5cdGNvbnN0IG9NZXRhZGF0YUluZm8gPSBvTURDQ2hhcnQuZ2V0RGVsZWdhdGUoKS5wYXlsb2FkO1xuXHRjb25zdCBvTWV0YU1vZGVsID0gb01EQ0NoYXJ0LmdldE1vZGVsKCkgJiYgb01EQ0NoYXJ0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdGNvbnN0IHNUYXJnZXRDb2xsZWN0aW9uUGF0aCA9IG9NRENDaGFydC5kYXRhKFwidGFyZ2V0Q29sbGVjdGlvblBhdGhcIik7XG5cdGNvbnN0IHNFbnRpdHlTZXRQYXRoID1cblx0XHQob01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1RhcmdldENvbGxlY3Rpb25QYXRofS8ka2luZGApICE9PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiID8gXCIvXCIgOiBcIlwiKSArIG9NZXRhZGF0YUluZm8uY29udGV4dFBhdGg7XG5cdGNvbnN0IG9QYXJhbXMgPSBtZXJnZSh7fSwgb01ldGFkYXRhSW5mby5wYXJhbWV0ZXJzLCB7XG5cdFx0ZW50aXR5U2V0OiBvTURDQ2hhcnQuZGF0YShcImVudGl0eVNldFwiKVxuXHR9KTtcblx0cmV0dXJuIHtcblx0XHRwYXRoOiBzRW50aXR5U2V0UGF0aCxcblx0XHRldmVudHM6IHtcblx0XHRcdGRhdGFSZXF1ZXN0ZWQ6IG9NRENDaGFydC5nZXRQYXJlbnQoKS5vbkludGVybmFsRGF0YVJlcXVlc3RlZC5iaW5kKG9NRENDaGFydC5nZXRQYXJlbnQoKSlcblx0XHR9LFxuXHRcdHBhcmFtZXRlcnM6IG9QYXJhbXNcblx0fTtcbn07XG5DaGFydERlbGVnYXRlLnJlbW92ZUl0ZW1Gcm9tSW5uZXJDaGFydCA9IGZ1bmN0aW9uIChvTURDQ2hhcnQ6IGFueSwgb01EQ0NoYXJ0SXRlbTogYW55KSB7XG5cdEJhc2VDaGFydERlbGVnYXRlLnJlbW92ZUl0ZW1Gcm9tSW5uZXJDaGFydC5jYWxsKHRoaXMsIG9NRENDaGFydCwgb01EQ0NoYXJ0SXRlbSk7XG5cdGlmIChvTURDQ2hhcnRJdGVtLmdldFR5cGUoKSA9PT0gXCJncm91cGFibGVcIikge1xuXHRcdGNvbnN0IG9Jbm5lckNoYXJ0ID0gdGhpcy5nZXRJbm5lckNoYXJ0KG9NRENDaGFydCk7XG5cdFx0b0lubmVyQ2hhcnQuZmlyZURlc2VsZWN0RGF0YSgpO1xuXHR9XG59O1xuQ2hhcnREZWxlZ2F0ZS5fZ2V0U29ydGFibGUgPSBmdW5jdGlvbiAoXG5cdG9NRENDaGFydDogYW55LFxuXHRzb3J0UmVzdHJpY3Rpb25zUHJvcGVydHk6IFNvcnRSZXN0cmljdGlvbnNQcm9wZXJ0eUluZm9UeXBlIHwgdW5kZWZpbmVkLFxuXHRiSXNUcmFuc0FnZ3JlZ2F0ZTogYW55XG4pIHtcblx0aWYgKGJJc1RyYW5zQWdncmVnYXRlKSB7XG5cdFx0aWYgKG9NRENDaGFydC5kYXRhKFwiZHJhZnRTdXBwb3J0ZWRcIikgPT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBzb3J0UmVzdHJpY3Rpb25zUHJvcGVydHkgPyBzb3J0UmVzdHJpY3Rpb25zUHJvcGVydHkuc29ydGFibGUgOiB0cnVlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gc29ydFJlc3RyaWN0aW9uc1Byb3BlcnR5ID8gc29ydFJlc3RyaWN0aW9uc1Byb3BlcnR5LnNvcnRhYmxlIDogdHJ1ZTtcbn07XG5DaGFydERlbGVnYXRlLl9jaGVja0FuZEFkZERyYWZ0RmlsdGVyID0gZnVuY3Rpb24gKG9DaGFydDogYW55LCBvQmluZGluZ0luZm86IGFueSkge1xuXHRpZiAob0NoYXJ0LmRhdGEoXCJkcmFmdFN1cHBvcnRlZFwiKSA9PT0gXCJ0cnVlXCIpIHtcblx0XHRpZiAoIW9CaW5kaW5nSW5mbykge1xuXHRcdFx0b0JpbmRpbmdJbmZvID0ge307XG5cdFx0fVxuXHRcdGlmICghb0JpbmRpbmdJbmZvLmZpbHRlcnMpIHtcblx0XHRcdG9CaW5kaW5nSW5mby5maWx0ZXJzID0gW107XG5cdFx0XHRvQmluZGluZ0luZm8uZmlsdGVycy5wdXNoKG5ldyBGaWx0ZXIoXCJJc0FjdGl2ZUVudGl0eVwiLCBGaWx0ZXJPcGVyYXRvci5FUSwgdHJ1ZSkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvQmluZGluZ0luZm8uZmlsdGVycz8uYUZpbHRlcnM/LnB1c2gobmV3IEZpbHRlcihcIklzQWN0aXZlRW50aXR5XCIsIEZpbHRlck9wZXJhdG9yLkVRLCB0cnVlKSk7XG5cdFx0fVxuXHR9XG59O1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhbiBJRCB3aGljaCBzaG91bGQgYmUgdXNlZCBpbiB0aGUgaW50ZXJuYWwgY2hhcnQgZm9yIHRoZSBtZWFzdXJlIG9yIGRpbWVuc2lvbi5cbiAqIEZvciBzdGFuZGFyZCBjYXNlcywgdGhpcyBpcyBqdXN0IHRoZSBJRCBvZiB0aGUgcHJvcGVydHkuXG4gKiBJZiBpdCBpcyBuZWNlc3NhcnkgdG8gdXNlIGFub3RoZXIgSUQgaW50ZXJuYWxseSBpbnNpZGUgdGhlIGNoYXJ0IChlLmcuIG9uIGR1cGxpY2F0ZSBwcm9wZXJ0eSBJRHMpIHRoaXMgbWV0aG9kIGNhbiBiZSBvdmVyd3JpdHRlbi5cbiAqIEluIHRoaXMgY2FzZSwgPGNvZGU+Z2V0UHJvcGVydHlGcm9tTmFtZUFuZEtpbmQ8L2NvZGU+IG5lZWRzIHRvIGJlIG92ZXJ3cml0dGVuIGFzIHdlbGwuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgSUQgb2YgdGhlIHByb3BlcnR5XG4gKiBAcGFyYW0ge3N0cmluZ30ga2luZCBUeXBlIG9mIHRoZSBwcm9wZXJ0eSAobWVhc3VyZSBvciBkaW1lbnNpb24pXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBJbnRlcm5hbCBJRCBmb3IgdGhlIHNhcC5jaGFydC5DaGFydFxuICovXG5DaGFydERlbGVnYXRlLmdldEludGVybmFsQ2hhcnROYW1lRnJvbVByb3BlcnR5TmFtZUFuZEtpbmQgPSBmdW5jdGlvbiAobmFtZTogc3RyaW5nLCBraW5kOiBzdHJpbmcpIHtcblx0cmV0dXJuIG5hbWUucmVwbGFjZShcIl9mZV9cIiArIGtpbmQgKyBcIl9cIiwgXCJcIik7XG59O1xuXG4vKipcbiAqIFRoaXMgbWFwcyBhbiBpZCBvZiBhbiBpbnRlcm5hbCBjaGFydCBkaW1lbnNpb24gb3IgbWVhc3VyZSAmIHR5cGUgb2YgYSBwcm9wZXJ0eSB0byBpdHMgY29ycmVzcG9uZGluZyBwcm9wZXJ0eSBlbnRyeS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBJRCBvZiBpbnRlcm5hbCBjaGFydCBtZWFzdXJlIG9yIGRpbWVuc2lvblxuICogQHBhcmFtIHtzdHJpbmd9IGtpbmQgVGhlIGtpbmQgb2YgcHJvcGVydHkgdGhhdCBpcyB1c2VkXG4gKiBAcGFyYW0ge3NhcC51aS5tZGMuQ2hhcnR9IG1kY0NoYXJ0IFJlZmVyZW5jZSB0byB0aGUgTURDX0NoYXJ0XG4gKiBAcmV0dXJucyB7b2JqZWN0fSBQcm9wZXJ0eUluZm8gb2JqZWN0XG4gKi9cbkNoYXJ0RGVsZWdhdGUuZ2V0UHJvcGVydHlGcm9tTmFtZUFuZEtpbmQgPSBmdW5jdGlvbiAobmFtZTogc3RyaW5nLCBraW5kOiBzdHJpbmcsIG1kY0NoYXJ0OiBhbnkpIHtcblx0cmV0dXJuIG1kY0NoYXJ0LmdldFByb3BlcnR5SGVscGVyKCkuZ2V0UHJvcGVydHkoXCJfZmVfXCIgKyBraW5kICsgXCJfXCIgKyBuYW1lKTtcbn07XG5cbi8qKlxuICogUHJvdmlkZSB0aGUgY2hhcnQncyBmaWx0ZXIgZGVsZWdhdGUgdG8gcHJvdmlkZSBiYXNpYyBmaWx0ZXIgZnVuY3Rpb25hbGl0eSBzdWNoIGFzIGFkZGluZyBGaWx0ZXJGaWVsZHMuXG4gKlxuICogQHJldHVybnMgT2JqZWN0IGZvciB0aGUgcGVyc29uYWxpemF0aW9uIG9mIHRoZSBjaGFydCBmaWx0ZXJcbiAqL1xuQ2hhcnREZWxlZ2F0ZS5nZXRGaWx0ZXJEZWxlZ2F0ZSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24oXG5cdFx0e1xuXHRcdFx0YXBpVmVyc2lvbjogMlxuXHRcdH0sXG5cdFx0RmlsdGVyQmFyRGVsZWdhdGUsXG5cdFx0e1xuXHRcdFx0YWRkSXRlbTogZnVuY3Rpb24gKG9QYXJlbnRDb250cm9sOiBhbnksIHNQcm9wZXJ0eUluZm9OYW1lOiBhbnkpIHtcblx0XHRcdFx0Y29uc3QgcHJvcCA9IENoYXJ0RGVsZWdhdGUuZ2V0SW50ZXJuYWxDaGFydE5hbWVGcm9tUHJvcGVydHlOYW1lQW5kS2luZChzUHJvcGVydHlJbmZvTmFtZSwgXCJncm91cGFibGVcIik7XG5cdFx0XHRcdHJldHVybiBGaWx0ZXJCYXJEZWxlZ2F0ZS5hZGRJdGVtKG9QYXJlbnRDb250cm9sLCBwcm9wKS50aGVuKChvRmlsdGVySXRlbTogYW55KSA9PiB7XG5cdFx0XHRcdFx0b0ZpbHRlckl0ZW0/LmJpbmRQcm9wZXJ0eShcImNvbmRpdGlvbnNcIiwge1xuXHRcdFx0XHRcdFx0cGF0aDogXCIkZmlsdGVycz4vY29uZGl0aW9ucy9cIiArIHNQcm9wZXJ0eUluZm9OYW1lXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuIG9GaWx0ZXJJdGVtO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDaGFydERlbGVnYXRlO1xuIl0sIm1hcHBp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