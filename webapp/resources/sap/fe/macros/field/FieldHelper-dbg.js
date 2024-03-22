/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/FieldControlHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/internal/valuehelp/ValueListHelper", "sap/ui/base/ManagedObject", "sap/ui/model/odata/v4/AnnotationHelper"], function (Log, CommonUtils, BindingHelper, Key, BindingToolkit, ModelHelper, StableIdHelper, FieldControlHelper, UIFormatters, CommonHelper, ValueListHelper, ManagedObject, AnnotationHelper) {
  "use strict";

  var getAlignmentExpression = UIFormatters.getAlignmentExpression;
  var isRequiredExpression = FieldControlHelper.isRequiredExpression;
  var generate = StableIdHelper.generate;
  var or = BindingToolkit.or;
  var ifElse = BindingToolkit.ifElse;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var UI = BindingHelper.UI;
  const ISOCurrency = "@Org.OData.Measures.V1.ISOCurrency",
    Unit = "@Org.OData.Measures.V1.Unit";
  const FieldHelper = {
    isNotAlwaysHidden: function (oDataField, oDetails) {
      // this is used in HeaderDataPointTitle.fragment
      const oContext = oDetails.context;
      let isAlwaysHidden = false;
      if (oDataField.Value && oDataField.Value.$Path) {
        isAlwaysHidden = oContext.getObject("Value/$Path@com.sap.vocabularies.UI.v1.Hidden");
      }
      if (!isAlwaysHidden || isAlwaysHidden.$Path) {
        isAlwaysHidden = oContext.getObject("@com.sap.vocabularies.UI.v1.Hidden");
        if (!isAlwaysHidden || isAlwaysHidden.$Path) {
          isAlwaysHidden = false;
        }
      }
      return !isAlwaysHidden;
    },
    isRequired: function (oFieldControl, sEditMode) {
      // this is used in actionParameterDialog.fragment
      if (sEditMode === "Display" || sEditMode === "ReadOnly" || sEditMode === "Disabled") {
        return false;
      }
      if (oFieldControl) {
        if (ManagedObject.bindingParser(oFieldControl)) {
          return "{= %" + oFieldControl + " === 7}";
        } else {
          return oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory";
        }
      }
      return false;
    },
    getActionParameterVisibility: function (oParam, oContext) {
      // To use the UI.Hidden annotation for controlling visibility the value needs to be negated
      if (typeof oParam === "object") {
        if (oParam && oParam.$If && oParam.$If.length === 3) {
          // In case the UI.Hidden contains a dynamic expression we do this
          // by just switching the "then" and "else" part of the erpression
          // oParam.$If[0] <== Condition part
          // oParam.$If[1] <== Then part
          // oParam.$If[2] <== Else part
          const oNegParam = {
            $If: []
          };
          oNegParam.$If[0] = oParam.$If[0];
          oNegParam.$If[1] = oParam.$If[2];
          oNegParam.$If[2] = oParam.$If[1];
          return AnnotationHelper.value(oNegParam, oContext);
        } else {
          return "{= !%{" + oParam.$Path + "} }";
        }
      } else if (typeof oParam === "boolean") {
        return AnnotationHelper.value(!oParam, oContext);
      } else {
        return undefined;
      }
    },
    /**
     * Computed annotation that returns vProperty for a string and @sapui.name for an object.
     *
     * @param vProperty The property
     * @param oInterface The interface instance
     * @returns The property name
     */
    propertyName: function (vProperty, oInterface) {
      let sPropertyName;
      if (typeof vProperty === "string") {
        if (oInterface.context.getPath().indexOf("$Path") > -1 || oInterface.context.getPath().indexOf("$PropertyPath") > -1) {
          // We could end up with a pure string property (no $Path), and this is not a real property in that case
          sPropertyName = vProperty;
        }
      } else if (vProperty.$Path || vProperty.$PropertyPath) {
        const sPath = vProperty.$Path ? "/$Path" : "/$PropertyPath";
        const sContextPath = oInterface.context.getPath();
        sPropertyName = oInterface.context.getObject(`${sContextPath + sPath}/$@sapui.name`);
      } else if (vProperty.Value && vProperty.Value.$Path) {
        sPropertyName = vProperty.Value.$Path;
      } else {
        sPropertyName = oInterface.context.getObject("@sapui.name");
      }
      return sPropertyName;
    },
    fieldControl: function (sPropertyPath, oInterface) {
      // actionParameter dialog and editable header facet
      const oModel = oInterface && oInterface.context.getModel();
      const sPath = oInterface && oInterface.context.getPath();
      const oFieldControlContext = oModel && oModel.createBindingContext(`${sPath}@com.sap.vocabularies.Common.v1.FieldControl`);
      const oFieldControl = oFieldControlContext && oFieldControlContext.getProperty();
      if (oFieldControl) {
        if (oFieldControl.hasOwnProperty("$EnumMember")) {
          return oFieldControl.$EnumMember;
        } else if (oFieldControl.hasOwnProperty("$Path")) {
          return AnnotationHelper.value(oFieldControl, {
            context: oFieldControlContext
          });
        }
      } else {
        return undefined;
      }
    },
    /**
     * Method to get the value help property from a DataField or a PropertyPath (in case a SelectionField is used)
     * Priority from where to get the property value of the field (examples are "Name" and "Supplier"):
     * 1. If oPropertyContext.getObject() has key '$Path', then we take the value at '$Path'.
     * 2. Else, value at oPropertyContext.getObject().
     * If there is an ISOCurrency or if there are Unit annotations for the field property,
     * then the Path at the ISOCurrency or Unit annotations of the field property is considered.
     *
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param oPropertyContext The context from which value help property need to be extracted.
     * @param bInFilterField Whether or not we're in the filter field and should ignore
     * @returns The value help property path
     */
    valueHelpProperty: function (oPropertyContext, bInFilterField) {
      /* For currency (and later Unit) we need to forward the value help to the annotated field */
      const sContextPath = oPropertyContext.getPath();
      const oContent = oPropertyContext.getObject() || {};
      let sPath = oContent.$Path ? `${sContextPath}/$Path` : sContextPath;
      const sAnnoPath = `${sPath}@`;
      const oPropertyAnnotations = oPropertyContext.getObject(sAnnoPath);
      let sAnnotation;
      if (oPropertyAnnotations) {
        sAnnotation = oPropertyAnnotations.hasOwnProperty(ISOCurrency) && ISOCurrency || oPropertyAnnotations.hasOwnProperty(Unit) && Unit;
        if (sAnnotation && !bInFilterField) {
          const sUnitOrCurrencyPath = `${sPath + sAnnotation}/$Path`;
          // we check that the currency or unit is a Property and not a fixed value
          if (oPropertyContext.getObject(sUnitOrCurrencyPath)) {
            sPath = sUnitOrCurrencyPath;
          }
        }
      }
      return sPath;
    },
    /**
     * Dedicated method to avoid looking for unit properties.
     *
     * @param oPropertyContext
     * @returns The value help property path
     */
    valueHelpPropertyForFilterField: function (oPropertyContext) {
      return FieldHelper.valueHelpProperty(oPropertyContext, true);
    },
    /**
     * Method to generate the ID for Value Help.
     *
     * @function
     * @name getIDForFieldValueHelp
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param sFlexId Flex ID of the current object
     * @param sIdPrefix Prefix for the ValueHelp ID
     * @param sOriginalPropertyName Name of the property
     * @param sPropertyName Name of the ValueHelp Property
     * @returns The ID generated for the ValueHelp
     */
    getIDForFieldValueHelp: function (sFlexId, sIdPrefix, sOriginalPropertyName, sPropertyName) {
      if (sFlexId) {
        return sFlexId;
      }
      let sProperty = sPropertyName;
      if (sOriginalPropertyName !== sPropertyName) {
        sProperty = `${sOriginalPropertyName}::${sPropertyName}`;
      }
      return generate([sIdPrefix, sProperty]);
    },
    /**
     * Method to get the fieldHelp property of the FilterField.
     *
     * @function
     * @name getFieldHelpPropertyForFilterField
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param propertyContext Property context for filter field
     * @param oProperty The object of the FieldHelp property
     * @param sPropertyType The $Type of the property
     * @param sVhIdPrefix The ID prefix of the value help
     * @param sPropertyName The name of the property
     * @param sValueHelpPropertyName The property name of the value help
     * @param bHasValueListWithFixedValues `true` if there is a value list with a fixed value annotation
     * @param bUseSemanticDateRange `true` if the semantic date range is set to 'true' in the manifest
     * @returns The field help property of the value help
     */
    getFieldHelpPropertyForFilterField: function (propertyContext, oProperty, sPropertyType, sVhIdPrefix, sPropertyName, sValueHelpPropertyName, bHasValueListWithFixedValues, bUseSemanticDateRange) {
      const sProperty = FieldHelper.propertyName(oProperty, {
          context: propertyContext
        }),
        bSemanticDateRange = bUseSemanticDateRange === "true" || bUseSemanticDateRange === true;
      const oModel = propertyContext.getModel(),
        sPropertyPath = propertyContext.getPath(),
        sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
        oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sPropertyLocationPath, oModel);
      if ((sPropertyType === "Edm.DateTimeOffset" || sPropertyType === "Edm.Date") && bSemanticDateRange && oFilterRestrictions && oFilterRestrictions.FilterAllowedExpressions && oFilterRestrictions.FilterAllowedExpressions[sProperty] && (oFilterRestrictions.FilterAllowedExpressions[sProperty].indexOf("SingleRange") !== -1 || oFilterRestrictions.FilterAllowedExpressions[sProperty].indexOf("SingleValue") !== -1) || sPropertyType === "Edm.Boolean" && !bHasValueListWithFixedValues) {
        return undefined;
      }
      return FieldHelper.getIDForFieldValueHelp(null, sVhIdPrefix || "FilterFieldValueHelp", sPropertyName, sValueHelpPropertyName);
    },
    /*
     * Method to compute the delegate with payload
     * @function
     * @param {object} delegateName - name of the delegate methode
     * @param {boolean} retrieveTextFromValueList - added to the payload of the delegate methode
     * @return {object} - returns the delegate with payload
     */
    computeFieldBaseDelegate: function (delegateName, retrieveTextFromValueList) {
      if (retrieveTextFromValueList) {
        return JSON.stringify({
          name: delegateName,
          payload: {
            retrieveTextFromValueList: retrieveTextFromValueList
          }
        });
      }
      return `{name: '${delegateName}'}`;
    },
    _getPrimaryIntents: function (aSemanticObjectsList) {
      const aPromises = [];
      if (aSemanticObjectsList) {
        const oUshellContainer = sap.ushell && sap.ushell.Container;
        const oService = oUshellContainer && oUshellContainer.getService("CrossApplicationNavigation");
        aSemanticObjectsList.forEach(function (semObject) {
          if (typeof semObject === "string") {
            aPromises.push(oService.getPrimaryIntent(semObject, {}));
          }
        });
      }
      return Promise.all(aPromises).then(function (aSemObjectPrimaryAction) {
        return aSemObjectPrimaryAction;
      }).catch(function (oError) {
        Log.error("Error fetching primary intents", oError);
        return [];
      });
    },
    _checkIfSemanticObjectsHasPrimaryAction: function (oSemantics, aSemanticObjectsPrimaryActions, appComponent) {
      const _fnIsSemanticObjectActionUnavailable = function (_oSemantics, _oPrimaryAction, _index) {
        for (const unavailableActionsIndex in _oSemantics.semanticObjectUnavailableActions[_index].actions) {
          if (_oPrimaryAction.intent.split("-")[1].indexOf(_oSemantics.semanticObjectUnavailableActions[_index].actions[unavailableActionsIndex]) === 0) {
            return false;
          }
        }
        return true;
      };
      oSemantics.semanticPrimaryActions = aSemanticObjectsPrimaryActions;
      const oPrimaryAction = oSemantics.semanticObjects && oSemantics.mainSemanticObject && oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)];
      const sCurrentHash = appComponent.getShellServices().getHash();
      if (oSemantics.mainSemanticObject && oPrimaryAction !== null && oPrimaryAction.intent !== sCurrentHash) {
        for (const index in oSemantics.semanticObjectUnavailableActions) {
          if (oSemantics.mainSemanticObject.indexOf(oSemantics.semanticObjectUnavailableActions[index].semanticObject) === 0) {
            return _fnIsSemanticObjectActionUnavailable(oSemantics, oPrimaryAction, index);
          }
        }
        return true;
      } else {
        return false;
      }
    },
    checkPrimaryActions: function (oSemantics, bGetTitleLink, appComponent) {
      return this._getPrimaryIntents(oSemantics && oSemantics.semanticObjects).then(aSemanticObjectsPrimaryActions => {
        return bGetTitleLink ? {
          titleLink: aSemanticObjectsPrimaryActions,
          hasTitleLink: this._checkIfSemanticObjectsHasPrimaryAction(oSemantics, aSemanticObjectsPrimaryActions, appComponent)
        } : this._checkIfSemanticObjectsHasPrimaryAction(oSemantics, aSemanticObjectsPrimaryActions, appComponent);
      }).catch(function (oError) {
        Log.error("Error in checkPrimaryActions", oError);
      });
    },
    _getTitleLinkWithParameters: function (_oSemanticObjectModel, _linkIntent) {
      if (_oSemanticObjectModel && _oSemanticObjectModel.titlelink) {
        return _oSemanticObjectModel.titlelink;
      } else {
        return _linkIntent;
      }
    },
    getPrimaryAction: function (oSemantics) {
      return oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)].intent ? FieldHelper._getTitleLinkWithParameters(oSemantics, oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)].intent) : oSemantics.primaryIntentAction;
    },
    /**
     * Method to fetch the filter restrictions. Filter restrictions can be annotated on an entity set or a navigation property.
     * Depending on the path to which the control is bound, we check for filter restrictions on the context path of the control,
     * or on the navigation property (if there is a navigation).
     * Eg. If the table is bound to '/EntitySet', for property path '/EntitySet/_Association/PropertyName', the filter restrictions
     * on '/EntitySet' win over filter restrictions on '/EntitySet/_Association'.
     * If the table is bound to '/EntitySet/_Association', the filter restrictions on '/EntitySet/_Association' win over filter
     * retrictions on '/AssociationEntitySet'.
     *
     * @param oContext Property Context
     * @param oProperty Property object in the metadata
     * @param bUseSemanticDateRange Boolean Suggests if semantic date range should be used
     * @param sSettings Stringified object of the property settings
     * @param contextPath Path to which the parent control (the table or the filter bar) is bound
     * @returns String containing comma-separated list of operators for filtering
     */
    operators: function (oContext, oProperty, bUseSemanticDateRange, sSettings, contextPath) {
      // this is used in FilterField.block
      if (!oProperty || !contextPath) {
        return undefined;
      }
      let operators;
      const sProperty = FieldHelper.propertyName(oProperty, {
        context: oContext
      });
      const oModel = oContext.getModel(),
        sPropertyPath = oContext.getPath(),
        sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
        propertyType = oProperty.$Type;
      if (propertyType === "Edm.Guid") {
        return CommonUtils.getOperatorsForGuidProperty();
      }

      // remove '/'
      contextPath = contextPath.slice(0, -1);
      const isTableBoundToNavigation = contextPath.lastIndexOf("/") > 0;
      const isNavigationPath = isTableBoundToNavigation && contextPath !== sPropertyLocationPath || !isTableBoundToNavigation && sPropertyLocationPath.lastIndexOf("/") > 0;
      const navigationPath = isNavigationPath && sPropertyLocationPath.substr(sPropertyLocationPath.indexOf(contextPath) + contextPath.length + 1) || "";
      const propertyPath = isNavigationPath && navigationPath + "/" + sProperty || sProperty;
      if (!isTableBoundToNavigation) {
        if (!isNavigationPath) {
          // /SalesOrderManage/ID
          operators = CommonUtils.getOperatorsForProperty(sProperty, sPropertyLocationPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
        } else {
          // /SalesOrderManange/_Item/Material
          //let operators
          operators = CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
          if (operators.length === 0) {
            operators = CommonUtils.getOperatorsForProperty(sProperty, sPropertyLocationPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
          }
        }
      } else if (!isNavigationPath) {
        var _operators;
        // /SalesOrderManage/_Item/Material
        operators = CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
        if (operators.length === 0) {
          operators = CommonUtils.getOperatorsForProperty(sProperty, ModelHelper.getEntitySetPath(contextPath), oModel, propertyType, bUseSemanticDateRange, sSettings);
        }
        return ((_operators = operators) === null || _operators === void 0 ? void 0 : _operators.length) > 0 ? operators.toString() : undefined;
      } else {
        // /SalesOrderManage/_Item/_Association/PropertyName
        // This is currently not supported for tables
        operators = CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
        if (operators.length === 0) {
          operators = CommonUtils.getOperatorsForProperty(propertyPath, ModelHelper.getEntitySetPath(contextPath), oModel, propertyType, bUseSemanticDateRange, sSettings);
        }
      }
      if ((!operators || operators.length === 0) && (propertyType === "Edm.Date" || propertyType === "Edm.DateTimeOffset")) {
        operators = CommonUtils.getOperatorsForDateProperty(propertyType);
      }
      return operators.length > 0 ? operators.toString() : undefined;
    },
    /**
     * Return the path of the DaFieldDefault (if any). Otherwise, the DataField path is returned.
     *
     * @param oDataFieldContext Context of the DataField
     * @returns Object path
     */
    getDataFieldDefault: function (oDataFieldContext) {
      // this is used in column.fragment
      const oDataFieldDefault = oDataFieldContext.getModel().getObject(`${oDataFieldContext.getPath()}@com.sap.vocabularies.UI.v1.DataFieldDefault`);
      return oDataFieldDefault ? `${oDataFieldContext.getPath()}@com.sap.vocabularies.UI.v1.DataFieldDefault` : oDataFieldContext.getPath();
    },
    /*
     * Method to get visible expression for DataFieldActionButton
     * @function
     * @name isDataFieldActionButtonVisible
     * @param {object} oThis - Current Object
     * @param {object} oDataField - DataPoint's Value
     * @param {boolean} bIsBound - DataPoint action bound
     * @param {object} oActionContext - ActionContext Value
     * @return {boolean} - returns boolean
     */
    isDataFieldActionButtonVisible: function (oThis, oDataField, bIsBound, oActionContext) {
      return oDataField["@com.sap.vocabularies.UI.v1.Hidden"] !== true && (bIsBound !== true || oActionContext !== false);
    },
    /**
     * Method to get press event for DataFieldActionButton.
     *
     * @function
     * @name getPressEventForDataFieldActionButton
     * @param oThis Current Object
     * @param oDataField DataPoint's Value
     * @returns The binding expression for the DataFieldActionButton press event
     */
    getPressEventForDataFieldActionButton: function (oThis, oDataField) {
      var _oThis$entitySet;
      let sInvocationGrouping = "Isolated";
      if (oDataField.InvocationGrouping && oDataField.InvocationGrouping.$EnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet") {
        sInvocationGrouping = "ChangeSet";
      }
      let bIsNavigable = oThis.navigateAfterAction;
      bIsNavigable = bIsNavigable === "false" ? false : true;
      const entities = oThis === null || oThis === void 0 ? void 0 : (_oThis$entitySet = oThis.entitySet) === null || _oThis$entitySet === void 0 ? void 0 : _oThis$entitySet.getPath().split("/");
      const entitySetName = entities[entities.length - 1];
      const oParams = {
        contexts: "${$source>/}.getBindingContext()",
        invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGrouping),
        model: "${$source>/}.getModel()",
        label: CommonHelper.addSingleQuotes(oDataField.Label, true),
        isNavigable: bIsNavigable,
        entitySetName: CommonHelper.addSingleQuotes(entitySetName)
      };
      return CommonHelper.generateFunction(".editFlow.invokeAction", CommonHelper.addSingleQuotes(oDataField.Action), CommonHelper.objectToString(oParams));
    },
    isNumericDataType: function (sDataFieldType) {
      const _sDataFieldType = sDataFieldType;
      if (_sDataFieldType !== undefined) {
        const aNumericDataTypes = ["Edm.Int16", "Edm.Int32", "Edm.Int64", "Edm.Byte", "Edm.SByte", "Edm.Single", "Edm.Decimal", "Edm.Double"];
        return aNumericDataTypes.indexOf(_sDataFieldType) === -1 ? false : true;
      } else {
        return false;
      }
    },
    isDateOrTimeDataType: function (sPropertyType) {
      if (sPropertyType !== undefined) {
        const aDateTimeDataTypes = ["Edm.DateTimeOffset", "Edm.DateTime", "Edm.Date", "Edm.TimeOfDay", "Edm.Time"];
        return aDateTimeDataTypes.indexOf(sPropertyType) > -1;
      } else {
        return false;
      }
    },
    isDateTimeDataType: function (sPropertyType) {
      if (sPropertyType !== undefined) {
        const aDateDataTypes = ["Edm.DateTimeOffset", "Edm.DateTime"];
        return aDateDataTypes.indexOf(sPropertyType) > -1;
      } else {
        return false;
      }
    },
    isDateDataType: function (sPropertyType) {
      return sPropertyType === "Edm.Date";
    },
    isTimeDataType: function (sPropertyType) {
      if (sPropertyType !== undefined) {
        const aDateDataTypes = ["Edm.TimeOfDay", "Edm.Time"];
        return aDateDataTypes.indexOf(sPropertyType) > -1;
      } else {
        return false;
      }
    },
    /**
     * To display a text arrangement showing text and id, we need a string field on the UI.
     *
     * @param oAnnotations All the annotations of a property
     * @param sType The property data type
     * @returns The type to be used on the UI for the alignment
     * @private
     */
    getDataTypeForVisualization: function (oAnnotations, sType) {
      var _oAnnotations$sTextAr, _oAnnotations$sTextAn;
      const sTextAnnotation = "@com.sap.vocabularies.Common.v1.Text",
        sTextArrangementAnnotation = "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement";

      /*
        In case of TextSeparate, the returned is used for the filed itself only showing
         the value of the original property, thus also the type of the property needs to be used.
        In case of TextOnly, we consider it to be Edm.String according to the definition
         in the vocabulary, even if it's not.
        In other cases, we return Edm.String, as the value is build using a text template.
       */
      return (oAnnotations === null || oAnnotations === void 0 ? void 0 : (_oAnnotations$sTextAr = oAnnotations[sTextArrangementAnnotation]) === null || _oAnnotations$sTextAr === void 0 ? void 0 : _oAnnotations$sTextAr.$EnumMember) !== "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate" && oAnnotations !== null && oAnnotations !== void 0 && (_oAnnotations$sTextAn = oAnnotations[sTextAnnotation]) !== null && _oAnnotations$sTextAn !== void 0 && _oAnnotations$sTextAn.$Path ? "Edm.String" : sType;
    },
    getColumnAlignment: function (oDataField, oTable) {
      const sEntityPath = oTable.collection.sPath,
        oModel = oTable.collection.oModel;
      if ((oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") && oDataField.Inline && oDataField.IconUrl) {
        return "Center";
      }
      // Columns containing a Semantic Key must be Begin aligned
      const aSemanticKeys = oModel.getObject(`${sEntityPath}/@com.sap.vocabularies.Common.v1.SemanticKey`);
      if (oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataField") {
        const sPropertyPath = oDataField.Value.$Path;
        const bIsSemanticKey = aSemanticKeys && !aSemanticKeys.every(function (oKey) {
          return oKey.$PropertyPath !== sPropertyPath;
        });
        if (bIsSemanticKey) {
          return "Begin";
        }
      }
      return FieldHelper.getDataFieldAlignment(oDataField, oModel, sEntityPath);
    },
    /**
     * Get alignment based only on the property.
     *
     * @param sType The property's type
     * @param oFormatOptions The field format options
     * @param [oComputedEditMode] The computed Edit mode of the property is empty when directly called from the ColumnProperty fragment
     * @returns The property alignment
     */
    getPropertyAlignment: function (sType, oFormatOptions, oComputedEditMode) {
      let sDefaultAlignment = "Begin";
      const sTextAlignment = oFormatOptions ? oFormatOptions.textAlignMode : "";
      switch (sTextAlignment) {
        case "Form":
          if (this.isNumericDataType(sType)) {
            sDefaultAlignment = "Begin";
            if (oComputedEditMode) {
              sDefaultAlignment = getAlignmentExpression(oComputedEditMode, "Begin", "End");
            }
          }
          break;
        default:
          if (this.isNumericDataType(sType) || this.isDateOrTimeDataType(sType)) {
            sDefaultAlignment = "Right";
          }
          break;
      }
      return sDefaultAlignment;
    },
    getDataFieldAlignment: function (oDataField, oModel, sEntityPath, oFormatOptions, oComputedEditMode) {
      let sDataFieldPath,
        sDefaultAlignment = "Begin",
        sType,
        oAnnotations;
      if (oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        sDataFieldPath = oDataField.Target.$AnnotationPath;
        if (oDataField.Target["$AnnotationPath"] && oDataField.Target["$AnnotationPath"].indexOf("com.sap.vocabularies.UI.v1.FieldGroup") >= 0) {
          const oFieldGroup = oModel.getObject(`${sEntityPath}/${sDataFieldPath}`);
          for (let i = 0; i < oFieldGroup.Data.length; i++) {
            sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Data/${i.toString()}/Value/$Path/$Type`);
            oAnnotations = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Data/${i.toString()}/Value/$Path@`);
            sType = this.getDataTypeForVisualization(oAnnotations, sType);
            sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
            if (sDefaultAlignment === "Begin") {
              break;
            }
          }
          return sDefaultAlignment;
        } else if (oDataField.Target["$AnnotationPath"] && oDataField.Target["$AnnotationPath"].indexOf("com.sap.vocabularies.UI.v1.DataPoint") >= 0 && oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Visualization/$EnumMember`) === "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
          return sDefaultAlignment;
        } else {
          sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/$Type`);
          if (sType === "com.sap.vocabularies.UI.v1.DataPointType") {
            sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Value/$Path/$Type`);
            oAnnotations = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Value/$Path@`);
            sType = this.getDataTypeForVisualization(oAnnotations, sType);
          }
          sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
        }
      } else {
        sDataFieldPath = oDataField.Value.$Path;
        sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/$Type`);
        oAnnotations = oModel.getObject(`${sEntityPath}/${sDataFieldPath}@`);
        sType = this.getDataTypeForVisualization(oAnnotations, sType);
        if (!(oModel.getObject(`${sEntityPath}/`)["$Key"].indexOf(sDataFieldPath) === 0)) {
          sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
        }
      }
      return sDefaultAlignment;
    },
    getTypeAlignment: function (oContext, oDataField, oFormatOptions, sEntityPath, oComputedEditMode, oProperty) {
      const oInterface = oContext.getInterface(0);
      const oModel = oInterface.getModel();
      if (sEntityPath === "/undefined" && oProperty && oProperty.$target) {
        sEntityPath = `/${oProperty.$target.fullyQualifiedName.split("/")[0]}`;
      }
      return FieldHelper.getDataFieldAlignment(oDataField, oModel, sEntityPath, oFormatOptions, oComputedEditMode);
    },
    /**
     * Method to get enabled expression for DataFieldActionButton.
     *
     * @function
     * @name isDataFieldActionButtonEnabled
     * @param oDataField DataPoint's Value
     * @param bIsBound DataPoint action bound
     * @param oActionContext ActionContext Value
     * @param sActionContextFormat Formatted value of ActionContext
     * @returns A boolean or string expression for enabled property
     */
    isDataFieldActionButtonEnabled: function (oDataField, bIsBound, oActionContext, sActionContextFormat) {
      if (bIsBound !== true) {
        return "true";
      }
      return (oActionContext === null ? "{= !${#" + oDataField.Action + "} ? false : true }" : oActionContext) ? sActionContextFormat : "true";
    },
    /**
     * Method to compute the label for a DataField.
     * If the DataField's label is an empty string, it's not rendered even if a fallback exists.
     *
     * @function
     * @name computeLabelText
     * @param {object} oDataField The DataField being processed
     * @param {object} oInterface The interface for context instance
     * @returns {string} The computed text for the DataField label.
     */

    computeLabelText: function (oDataField, oInterface) {
      const oModel = oInterface.context.getModel();
      let sContextPath = oInterface.context.getPath();
      if (sContextPath.endsWith("/")) {
        sContextPath = sContextPath.slice(0, sContextPath.lastIndexOf("/"));
      }
      const sDataFieldLabel = oModel.getObject(`${sContextPath}/Label`);
      //We do not show an additional label text for a button:
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
        return undefined;
      }
      if (sDataFieldLabel) {
        return sDataFieldLabel;
      } else if (sDataFieldLabel === "") {
        return "";
      }
      let sDataFieldTargetTitle;
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        if (oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 || oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
          sDataFieldTargetTitle = oModel.getObject(`${sContextPath}/Target/$AnnotationPath@/Title`);
        }
        if (oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.Communication.v1.Contact") > -1) {
          sDataFieldTargetTitle = oModel.getObject(`${sContextPath}/Target/$AnnotationPath@/fn/$Path@com.sap.vocabularies.Common.v1.Label`);
        }
      }
      if (sDataFieldTargetTitle) {
        return sDataFieldTargetTitle;
      }
      let sDataFieldTargetLabel;
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        sDataFieldTargetLabel = oModel.getObject(`${sContextPath}/Target/$AnnotationPath@/Label`);
      }
      if (sDataFieldTargetLabel) {
        return sDataFieldTargetLabel;
      }
      const sDataFieldValueLabel = oModel.getObject(`${sContextPath}/Value/$Path@com.sap.vocabularies.Common.v1.Label`);
      if (sDataFieldValueLabel) {
        return sDataFieldValueLabel;
      }
      let sDataFieldTargetValueLabel;
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        sDataFieldTargetValueLabel = oModel.getObject(`${sContextPath}/Target/$AnnotationPath/Value/$Path@com.sap.vocabularies.Common.v1.Label`);
      }
      if (sDataFieldTargetValueLabel) {
        return sDataFieldTargetValueLabel;
      }
      return "";
    },
    /**
     * Method to align the data fields with their label.
     *
     * @function
     * @name buildExpressionForAlignItems
     * @param sVisualization
     * @returns Expression binding for alignItems property
     */
    buildExpressionForAlignItems: function (sVisualization) {
      const fieldVisualizationBindingExpression = constant(sVisualization);
      const progressVisualizationBindingExpression = constant("com.sap.vocabularies.UI.v1.VisualizationType/Progress");
      const ratingVisualizationBindingExpression = constant("com.sap.vocabularies.UI.v1.VisualizationType/Rating");
      return compileExpression(ifElse(or(equal(fieldVisualizationBindingExpression, progressVisualizationBindingExpression), equal(fieldVisualizationBindingExpression, ratingVisualizationBindingExpression)), constant("Center"), ifElse(UI.IsEditable, constant("Center"), constant("Stretch"))));
    },
    /**
     * Method to check ValueListReferences, ValueListMapping and ValueList inside ActionParameters for FieldHelp.
     *
     * @function
     * @name hasValueHelp
     * @param oPropertyAnnotations Action parameter object
     * @returns `true` if there is a ValueList* annotation defined
     */
    hasValueHelpAnnotation: function (oPropertyAnnotations) {
      if (oPropertyAnnotations) {
        return !!(oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListReferences"] || oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListMapping"] || oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"]);
      }
      return false;
    },
    /**
     * Method to get display property for ActionParameter dialog.
     *
     * 	@function
     * @name getAPDialogDisplayFormat
     * @param oProperty The action parameter instance
     * @param oInterface The interface for the context instance
     * @returns The display format  for an action parameter Field
     */
    getAPDialogDisplayFormat: function (oProperty, oInterface) {
      let oAnnotation;
      const oModel = oInterface.context.getModel();
      const sContextPath = oInterface.context.getPath();
      const sPropertyName = oProperty.$Name || oInterface.context.getProperty(`${sContextPath}@sapui.name`);
      const oActionParameterAnnotations = oModel.getObject(`${sContextPath}@`);
      const oValueHelpAnnotation = oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueList"] || oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueListMapping"] || oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueListReferences"];
      const getValueListPropertyName = function (oValueList) {
        const oValueListParameter = oValueList.Parameters.find(function (oParameter) {
          return oParameter.LocalDataProperty && oParameter.LocalDataProperty.$PropertyPath === sPropertyName;
        });
        return oValueListParameter && oValueListParameter.ValueListProperty;
      };
      let sValueListPropertyName;
      if (oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.TextArrangement"] || oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]) {
        return CommonUtils.computeDisplayMode(oActionParameterAnnotations, undefined);
      } else if (oValueHelpAnnotation) {
        if (oValueHelpAnnotation.CollectionPath) {
          // get the name of the corresponding property in value list collection
          sValueListPropertyName = getValueListPropertyName(oValueHelpAnnotation);
          if (!sValueListPropertyName) {
            return "Value";
          }
          // get text for this property
          oAnnotation = oModel.getObject(`/${oValueHelpAnnotation.CollectionPath}/${sValueListPropertyName}@`);
          return oAnnotation && oAnnotation["@com.sap.vocabularies.Common.v1.Text"] ? CommonUtils.computeDisplayMode(oAnnotation, undefined) : "Value";
        } else {
          return oModel.requestValueListInfo(sContextPath, true).then(function (oValueListInfo) {
            // get the name of the corresponding property in value list collection
            sValueListPropertyName = getValueListPropertyName(oValueListInfo[""]);
            if (!sValueListPropertyName) {
              return "Value";
            }
            // get text for this property
            oAnnotation = oValueListInfo[""].$model.getMetaModel().getObject(`/${oValueListInfo[""]["CollectionPath"]}/${sValueListPropertyName}@`);
            return oAnnotation && oAnnotation["@com.sap.vocabularies.Common.v1.Text"] ? CommonUtils.computeDisplayMode(oAnnotation, undefined) : "Value";
          });
        }
      } else {
        return "Value";
      }
    },
    /**
     * Method to get display property for ActionParameter dialog FieldHelp.
     *
     * @function
     * @name getActionParameterDialogFieldHelp
     * @param oActionParameter Action parameter object
     * @param sSapUIName Action sapui name
     * @param sParamName The parameter name
     * @returns The ID of the fieldHelp used by this action parameter
     */
    getActionParameterDialogFieldHelp: function (oActionParameter, sSapUIName, sParamName) {
      return this.hasValueHelpAnnotation(oActionParameter) ? generate([sSapUIName, sParamName]) : undefined;
    },
    /**
     * Method to get the delegate configuration for ActionParameter dialog.
     *
     * @function
     * @name getValueHelpDelegate
     * @param isBound Action is bound
     * @param entityTypePath The EntityType Path
     * @param sapUIName The name of the Action
     * @param paramName The name of the ActionParameter
     * @returns The delegate configuration object as a string
     */
    getValueHelpDelegate: function (isBound, entityTypePath, sapUIName, paramName) {
      const delegateConfiguration = {
        name: CommonHelper.addSingleQuotes("sap/fe/macros/valuehelp/ValueHelpDelegate"),
        payload: {
          propertyPath: CommonHelper.addSingleQuotes(ValueListHelper.getPropertyPath({
            UnboundAction: !isBound,
            EntityTypePath: entityTypePath,
            Action: sapUIName,
            Property: paramName
          })),
          qualifiers: {},
          valueHelpQualifier: CommonHelper.addSingleQuotes(""),
          isActionParameterDialog: true
        }
      };
      return CommonHelper.objectToString(delegateConfiguration);
    },
    /**
     * Method to get the delegate configuration for NonComputedVisibleKeyField dialog.
     *
     * @function
     * @name getValueHelpDelegateForNonComputedVisibleKeyField
     * @param propertyPath The current property path
     * @returns The delegate configuration object as a string
     */
    getValueHelpDelegateForNonComputedVisibleKeyField: function (propertyPath) {
      const delegateConfiguration = {
        name: CommonHelper.addSingleQuotes("sap/fe/macros/valuehelp/ValueHelpDelegate"),
        payload: {
          propertyPath: CommonHelper.addSingleQuotes(propertyPath),
          qualifiers: {},
          valueHelpQualifier: CommonHelper.addSingleQuotes("")
        }
      };
      return CommonHelper.objectToString(delegateConfiguration);
    },
    /**
     * Method to fetch entity from a path containing multiple associations.
     *
     * @function
     * @name _getEntitySetFromMultiLevel
     * @param oContext The context whose path is to be checked
     * @param sPath The path from which entity has to be fetched
     * @param sSourceEntity The entity path in which nav entity exists
     * @param iStart The start index : beginning parts of the path to be ignored
     * @param iDiff The diff index : end parts of the path to be ignored
     * @returns The path of the entity set
     */
    _getEntitySetFromMultiLevel: function (oContext, sPath, sSourceEntity, iStart, iDiff) {
      let aNavParts = sPath.split("/").filter(Boolean);
      aNavParts = aNavParts.filter(function (sPart) {
        return sPart !== "$NavigationPropertyBinding";
      });
      if (aNavParts.length > 0) {
        for (let i = iStart; i < aNavParts.length - iDiff; i++) {
          sSourceEntity = `/${oContext.getObject(`${sSourceEntity}/$NavigationPropertyBinding/${aNavParts[i]}`)}`;
        }
      }
      return sSourceEntity;
    },
    /**
     * When the value displayed is in text arrangement TextOnly we also want to retrieve the Text value for tables even if we don't show it.
     * This method will return the value of the original data field.
     *
     * @param oThis The current object
     * @param oDataFieldTextArrangement DataField using text arrangement annotation
     * @param oDataField DataField containing the value using text arrangement annotation
     * @returns The binding to the value
     */
    getBindingInfoForTextArrangement: function (oThis, oDataFieldTextArrangement, oDataField) {
      // this is used in ColumnContent fragment
      if (oDataFieldTextArrangement && oDataFieldTextArrangement.$EnumMember && oDataFieldTextArrangement.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" && oDataField) {
        return `{${oDataField.Value.$Path}}`;
      }
      return undefined;
    },
    getPathForIconSource: function (sPropertyPath) {
      return "{= FIELDRUNTIME.getIconForMimeType(%{" + sPropertyPath + "@odata.mediaContentType})}";
    },
    getFilenameExpr: function (sFilename, sNoFilenameText) {
      if (sFilename) {
        if (sFilename.indexOf("{") === 0) {
          // filename is referenced via path, i.e. @Core.ContentDisposition.Filename : path
          return "{= $" + sFilename + " ? $" + sFilename + " : $" + sNoFilenameText + "}";
        }
        // static filename, i.e. @Core.ContentDisposition.Filename : 'someStaticName'
        return sFilename;
      }
      // no @Core.ContentDisposition.Filename
      return sNoFilenameText;
    },
    calculateMBfromByte: function (iByte) {
      return iByte ? (iByte / (1024 * 1024)).toFixed(6) : undefined;
    },
    getDownloadUrl: function (propertyPath) {
      return propertyPath + "{= ${internal>/stickySessionToken} ? ('?SAP-ContextId=' + ${internal>/stickySessionToken}) : '' }";
    },
    getMarginClass: function (compactSemanticKey) {
      return compactSemanticKey === "true" || compactSemanticKey === true ? "sapMTableContentMargin" : undefined;
    },
    getRequired: function (immutableKey, target, requiredProperties) {
      let targetRequiredExpression = constant(false);
      if (target !== null) {
        targetRequiredExpression = isRequiredExpression(target === null || target === void 0 ? void 0 : target.targetObject);
      }
      return compileExpression(or(targetRequiredExpression, requiredProperties.indexOf(immutableKey) > -1));
    },
    /**
     * The method checks if the field is already part of a form.
     *
     * @param dataFieldCollection The list of the fields of the form
     * @param dataFieldObjectPath The data model object path of the field which needs to be checked in the form
     * @returns `true` if the field is already part of the form, `false` otherwise
     */
    isFieldPartOfForm: function (dataFieldCollection, dataFieldObjectPath) {
      //generating key for the received data field
      const connectedDataFieldKey = KeyHelper.generateKeyFromDataField(dataFieldObjectPath.targetObject);
      // trying to find the generated key in already existing form elements
      const isFieldFound = dataFieldCollection.find(field => {
        return field.key === connectedDataFieldKey;
      });
      return isFieldFound ? true : false;
    }
  };
  FieldHelper.fieldControl.requiresIContext = true;
  FieldHelper.getTypeAlignment.requiresIContext = true;
  FieldHelper.getAPDialogDisplayFormat.requiresIContext = true;
  FieldHelper.computeLabelText.requiresIContext = true;
  FieldHelper.getActionParameterVisibility.requiresIContext = true;
  return FieldHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJU09DdXJyZW5jeSIsIlVuaXQiLCJGaWVsZEhlbHBlciIsImlzTm90QWx3YXlzSGlkZGVuIiwib0RhdGFGaWVsZCIsIm9EZXRhaWxzIiwib0NvbnRleHQiLCJjb250ZXh0IiwiaXNBbHdheXNIaWRkZW4iLCJWYWx1ZSIsIiRQYXRoIiwiZ2V0T2JqZWN0IiwiaXNSZXF1aXJlZCIsIm9GaWVsZENvbnRyb2wiLCJzRWRpdE1vZGUiLCJNYW5hZ2VkT2JqZWN0IiwiYmluZGluZ1BhcnNlciIsImdldEFjdGlvblBhcmFtZXRlclZpc2liaWxpdHkiLCJvUGFyYW0iLCIkSWYiLCJsZW5ndGgiLCJvTmVnUGFyYW0iLCJBbm5vdGF0aW9uSGVscGVyIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJwcm9wZXJ0eU5hbWUiLCJ2UHJvcGVydHkiLCJvSW50ZXJmYWNlIiwic1Byb3BlcnR5TmFtZSIsImdldFBhdGgiLCJpbmRleE9mIiwiJFByb3BlcnR5UGF0aCIsInNQYXRoIiwic0NvbnRleHRQYXRoIiwiZmllbGRDb250cm9sIiwic1Byb3BlcnR5UGF0aCIsIm9Nb2RlbCIsImdldE1vZGVsIiwib0ZpZWxkQ29udHJvbENvbnRleHQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImdldFByb3BlcnR5IiwiaGFzT3duUHJvcGVydHkiLCIkRW51bU1lbWJlciIsInZhbHVlSGVscFByb3BlcnR5Iiwib1Byb3BlcnR5Q29udGV4dCIsImJJbkZpbHRlckZpZWxkIiwib0NvbnRlbnQiLCJzQW5ub1BhdGgiLCJvUHJvcGVydHlBbm5vdGF0aW9ucyIsInNBbm5vdGF0aW9uIiwic1VuaXRPckN1cnJlbmN5UGF0aCIsInZhbHVlSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQiLCJnZXRJREZvckZpZWxkVmFsdWVIZWxwIiwic0ZsZXhJZCIsInNJZFByZWZpeCIsInNPcmlnaW5hbFByb3BlcnR5TmFtZSIsInNQcm9wZXJ0eSIsImdlbmVyYXRlIiwiZ2V0RmllbGRIZWxwUHJvcGVydHlGb3JGaWx0ZXJGaWVsZCIsInByb3BlcnR5Q29udGV4dCIsIm9Qcm9wZXJ0eSIsInNQcm9wZXJ0eVR5cGUiLCJzVmhJZFByZWZpeCIsInNWYWx1ZUhlbHBQcm9wZXJ0eU5hbWUiLCJiSGFzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzIiwiYlVzZVNlbWFudGljRGF0ZVJhbmdlIiwiYlNlbWFudGljRGF0ZVJhbmdlIiwic1Byb3BlcnR5TG9jYXRpb25QYXRoIiwiQ29tbW9uSGVscGVyIiwiZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgiLCJvRmlsdGVyUmVzdHJpY3Rpb25zIiwiQ29tbW9uVXRpbHMiLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgiLCJGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMiLCJjb21wdXRlRmllbGRCYXNlRGVsZWdhdGUiLCJkZWxlZ2F0ZU5hbWUiLCJyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0IiwiSlNPTiIsInN0cmluZ2lmeSIsIm5hbWUiLCJwYXlsb2FkIiwiX2dldFByaW1hcnlJbnRlbnRzIiwiYVNlbWFudGljT2JqZWN0c0xpc3QiLCJhUHJvbWlzZXMiLCJvVXNoZWxsQ29udGFpbmVyIiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwib1NlcnZpY2UiLCJnZXRTZXJ2aWNlIiwiZm9yRWFjaCIsInNlbU9iamVjdCIsInB1c2giLCJnZXRQcmltYXJ5SW50ZW50IiwiUHJvbWlzZSIsImFsbCIsInRoZW4iLCJhU2VtT2JqZWN0UHJpbWFyeUFjdGlvbiIsImNhdGNoIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJfY2hlY2tJZlNlbWFudGljT2JqZWN0c0hhc1ByaW1hcnlBY3Rpb24iLCJvU2VtYW50aWNzIiwiYVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zIiwiYXBwQ29tcG9uZW50IiwiX2ZuSXNTZW1hbnRpY09iamVjdEFjdGlvblVuYXZhaWxhYmxlIiwiX29TZW1hbnRpY3MiLCJfb1ByaW1hcnlBY3Rpb24iLCJfaW5kZXgiLCJ1bmF2YWlsYWJsZUFjdGlvbnNJbmRleCIsInNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiYWN0aW9ucyIsImludGVudCIsInNwbGl0Iiwic2VtYW50aWNQcmltYXJ5QWN0aW9ucyIsIm9QcmltYXJ5QWN0aW9uIiwic2VtYW50aWNPYmplY3RzIiwibWFpblNlbWFudGljT2JqZWN0Iiwic0N1cnJlbnRIYXNoIiwiZ2V0U2hlbGxTZXJ2aWNlcyIsImdldEhhc2giLCJpbmRleCIsInNlbWFudGljT2JqZWN0IiwiY2hlY2tQcmltYXJ5QWN0aW9ucyIsImJHZXRUaXRsZUxpbmsiLCJ0aXRsZUxpbmsiLCJoYXNUaXRsZUxpbmsiLCJfZ2V0VGl0bGVMaW5rV2l0aFBhcmFtZXRlcnMiLCJfb1NlbWFudGljT2JqZWN0TW9kZWwiLCJfbGlua0ludGVudCIsInRpdGxlbGluayIsImdldFByaW1hcnlBY3Rpb24iLCJwcmltYXJ5SW50ZW50QWN0aW9uIiwib3BlcmF0b3JzIiwic1NldHRpbmdzIiwiY29udGV4dFBhdGgiLCJwcm9wZXJ0eVR5cGUiLCIkVHlwZSIsImdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eSIsInNsaWNlIiwiaXNUYWJsZUJvdW5kVG9OYXZpZ2F0aW9uIiwibGFzdEluZGV4T2YiLCJpc05hdmlnYXRpb25QYXRoIiwibmF2aWdhdGlvblBhdGgiLCJzdWJzdHIiLCJwcm9wZXJ0eVBhdGgiLCJnZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eSIsIk1vZGVsSGVscGVyIiwiZ2V0RW50aXR5U2V0UGF0aCIsInRvU3RyaW5nIiwiZ2V0T3BlcmF0b3JzRm9yRGF0ZVByb3BlcnR5IiwiZ2V0RGF0YUZpZWxkRGVmYXVsdCIsIm9EYXRhRmllbGRDb250ZXh0Iiwib0RhdGFGaWVsZERlZmF1bHQiLCJpc0RhdGFGaWVsZEFjdGlvbkJ1dHRvblZpc2libGUiLCJvVGhpcyIsImJJc0JvdW5kIiwib0FjdGlvbkNvbnRleHQiLCJnZXRQcmVzc0V2ZW50Rm9yRGF0YUZpZWxkQWN0aW9uQnV0dG9uIiwic0ludm9jYXRpb25Hcm91cGluZyIsIkludm9jYXRpb25Hcm91cGluZyIsImJJc05hdmlnYWJsZSIsIm5hdmlnYXRlQWZ0ZXJBY3Rpb24iLCJlbnRpdGllcyIsImVudGl0eVNldCIsImVudGl0eVNldE5hbWUiLCJvUGFyYW1zIiwiY29udGV4dHMiLCJpbnZvY2F0aW9uR3JvdXBpbmciLCJhZGRTaW5nbGVRdW90ZXMiLCJtb2RlbCIsImxhYmVsIiwiTGFiZWwiLCJpc05hdmlnYWJsZSIsImdlbmVyYXRlRnVuY3Rpb24iLCJBY3Rpb24iLCJvYmplY3RUb1N0cmluZyIsImlzTnVtZXJpY0RhdGFUeXBlIiwic0RhdGFGaWVsZFR5cGUiLCJfc0RhdGFGaWVsZFR5cGUiLCJhTnVtZXJpY0RhdGFUeXBlcyIsImlzRGF0ZU9yVGltZURhdGFUeXBlIiwiYURhdGVUaW1lRGF0YVR5cGVzIiwiaXNEYXRlVGltZURhdGFUeXBlIiwiYURhdGVEYXRhVHlwZXMiLCJpc0RhdGVEYXRhVHlwZSIsImlzVGltZURhdGFUeXBlIiwiZ2V0RGF0YVR5cGVGb3JWaXN1YWxpemF0aW9uIiwib0Fubm90YXRpb25zIiwic1R5cGUiLCJzVGV4dEFubm90YXRpb24iLCJzVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiIsImdldENvbHVtbkFsaWdubWVudCIsIm9UYWJsZSIsInNFbnRpdHlQYXRoIiwiY29sbGVjdGlvbiIsIklubGluZSIsIkljb25VcmwiLCJhU2VtYW50aWNLZXlzIiwiYklzU2VtYW50aWNLZXkiLCJldmVyeSIsIm9LZXkiLCJnZXREYXRhRmllbGRBbGlnbm1lbnQiLCJnZXRQcm9wZXJ0eUFsaWdubWVudCIsIm9Gb3JtYXRPcHRpb25zIiwib0NvbXB1dGVkRWRpdE1vZGUiLCJzRGVmYXVsdEFsaWdubWVudCIsInNUZXh0QWxpZ25tZW50IiwidGV4dEFsaWduTW9kZSIsImdldEFsaWdubWVudEV4cHJlc3Npb24iLCJzRGF0YUZpZWxkUGF0aCIsIlRhcmdldCIsIiRBbm5vdGF0aW9uUGF0aCIsIm9GaWVsZEdyb3VwIiwiaSIsIkRhdGEiLCJnZXRUeXBlQWxpZ25tZW50IiwiZ2V0SW50ZXJmYWNlIiwiJHRhcmdldCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImlzRGF0YUZpZWxkQWN0aW9uQnV0dG9uRW5hYmxlZCIsInNBY3Rpb25Db250ZXh0Rm9ybWF0IiwiY29tcHV0ZUxhYmVsVGV4dCIsImVuZHNXaXRoIiwic0RhdGFGaWVsZExhYmVsIiwic0RhdGFGaWVsZFRhcmdldFRpdGxlIiwic0RhdGFGaWVsZFRhcmdldExhYmVsIiwic0RhdGFGaWVsZFZhbHVlTGFiZWwiLCJzRGF0YUZpZWxkVGFyZ2V0VmFsdWVMYWJlbCIsImJ1aWxkRXhwcmVzc2lvbkZvckFsaWduSXRlbXMiLCJzVmlzdWFsaXphdGlvbiIsImZpZWxkVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uIiwiY29uc3RhbnQiLCJwcm9ncmVzc1Zpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbiIsInJhdGluZ1Zpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbiIsImNvbXBpbGVFeHByZXNzaW9uIiwiaWZFbHNlIiwib3IiLCJlcXVhbCIsIlVJIiwiSXNFZGl0YWJsZSIsImhhc1ZhbHVlSGVscEFubm90YXRpb24iLCJnZXRBUERpYWxvZ0Rpc3BsYXlGb3JtYXQiLCJvQW5ub3RhdGlvbiIsIiROYW1lIiwib0FjdGlvblBhcmFtZXRlckFubm90YXRpb25zIiwib1ZhbHVlSGVscEFubm90YXRpb24iLCJnZXRWYWx1ZUxpc3RQcm9wZXJ0eU5hbWUiLCJvVmFsdWVMaXN0Iiwib1ZhbHVlTGlzdFBhcmFtZXRlciIsIlBhcmFtZXRlcnMiLCJmaW5kIiwib1BhcmFtZXRlciIsIkxvY2FsRGF0YVByb3BlcnR5IiwiVmFsdWVMaXN0UHJvcGVydHkiLCJzVmFsdWVMaXN0UHJvcGVydHlOYW1lIiwiY29tcHV0ZURpc3BsYXlNb2RlIiwiQ29sbGVjdGlvblBhdGgiLCJyZXF1ZXN0VmFsdWVMaXN0SW5mbyIsIm9WYWx1ZUxpc3RJbmZvIiwiJG1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiZ2V0QWN0aW9uUGFyYW1ldGVyRGlhbG9nRmllbGRIZWxwIiwib0FjdGlvblBhcmFtZXRlciIsInNTYXBVSU5hbWUiLCJzUGFyYW1OYW1lIiwiZ2V0VmFsdWVIZWxwRGVsZWdhdGUiLCJpc0JvdW5kIiwiZW50aXR5VHlwZVBhdGgiLCJzYXBVSU5hbWUiLCJwYXJhbU5hbWUiLCJkZWxlZ2F0ZUNvbmZpZ3VyYXRpb24iLCJWYWx1ZUxpc3RIZWxwZXIiLCJnZXRQcm9wZXJ0eVBhdGgiLCJVbmJvdW5kQWN0aW9uIiwiRW50aXR5VHlwZVBhdGgiLCJQcm9wZXJ0eSIsInF1YWxpZmllcnMiLCJ2YWx1ZUhlbHBRdWFsaWZpZXIiLCJpc0FjdGlvblBhcmFtZXRlckRpYWxvZyIsImdldFZhbHVlSGVscERlbGVnYXRlRm9yTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGQiLCJfZ2V0RW50aXR5U2V0RnJvbU11bHRpTGV2ZWwiLCJzU291cmNlRW50aXR5IiwiaVN0YXJ0IiwiaURpZmYiLCJhTmF2UGFydHMiLCJmaWx0ZXIiLCJCb29sZWFuIiwic1BhcnQiLCJnZXRCaW5kaW5nSW5mb0ZvclRleHRBcnJhbmdlbWVudCIsIm9EYXRhRmllbGRUZXh0QXJyYW5nZW1lbnQiLCJnZXRQYXRoRm9ySWNvblNvdXJjZSIsImdldEZpbGVuYW1lRXhwciIsInNGaWxlbmFtZSIsInNOb0ZpbGVuYW1lVGV4dCIsImNhbGN1bGF0ZU1CZnJvbUJ5dGUiLCJpQnl0ZSIsInRvRml4ZWQiLCJnZXREb3dubG9hZFVybCIsImdldE1hcmdpbkNsYXNzIiwiY29tcGFjdFNlbWFudGljS2V5IiwiZ2V0UmVxdWlyZWQiLCJpbW11dGFibGVLZXkiLCJ0YXJnZXQiLCJyZXF1aXJlZFByb3BlcnRpZXMiLCJ0YXJnZXRSZXF1aXJlZEV4cHJlc3Npb24iLCJpc1JlcXVpcmVkRXhwcmVzc2lvbiIsInRhcmdldE9iamVjdCIsImlzRmllbGRQYXJ0T2ZGb3JtIiwiZGF0YUZpZWxkQ29sbGVjdGlvbiIsImRhdGFGaWVsZE9iamVjdFBhdGgiLCJjb25uZWN0ZWREYXRhRmllbGRLZXkiLCJLZXlIZWxwZXIiLCJnZW5lcmF0ZUtleUZyb21EYXRhRmllbGQiLCJpc0ZpZWxkRm91bmQiLCJmaWVsZCIsImtleSIsInJlcXVpcmVzSUNvbnRleHQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpZWxkSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSB7IEZvcm1FbGVtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0Zvcm1cIjtcbmltcG9ydCB7IFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGNvbnN0YW50LCBlcXVhbCwgaWZFbHNlLCBvciB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBpc1JlcXVpcmVkRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0ZpZWxkQ29udHJvbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0QWxpZ25tZW50RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgVmFsdWVIZWxwUGF5bG9hZCB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL3ZhbHVlaGVscC9WYWx1ZUxpc3RIZWxwZXJcIjtcbmltcG9ydCBWYWx1ZUxpc3RIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvdmFsdWVoZWxwL1ZhbHVlTGlzdEhlbHBlclwiO1xuaW1wb3J0IE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCB0eXBlIEJhc2VDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEFubm90YXRpb25IZWxwZXIgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Bbm5vdGF0aW9uSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuXG5jb25zdCBJU09DdXJyZW5jeSA9IFwiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiLFxuXHRVbml0ID0gXCJAT3JnLk9EYXRhLk1lYXN1cmVzLlYxLlVuaXRcIjtcblxuY29uc3QgRmllbGRIZWxwZXIgPSB7XG5cdGlzTm90QWx3YXlzSGlkZGVuOiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBvRGV0YWlsczogYW55KSB7XG5cdFx0Ly8gdGhpcyBpcyB1c2VkIGluIEhlYWRlckRhdGFQb2ludFRpdGxlLmZyYWdtZW50XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSBvRGV0YWlscy5jb250ZXh0O1xuXHRcdGxldCBpc0Fsd2F5c0hpZGRlbjogYW55ID0gZmFsc2U7XG5cdFx0aWYgKG9EYXRhRmllbGQuVmFsdWUgJiYgb0RhdGFGaWVsZC5WYWx1ZS4kUGF0aCkge1xuXHRcdFx0aXNBbHdheXNIaWRkZW4gPSBvQ29udGV4dC5nZXRPYmplY3QoXCJWYWx1ZS8kUGF0aEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIik7XG5cdFx0fVxuXHRcdGlmICghaXNBbHdheXNIaWRkZW4gfHwgaXNBbHdheXNIaWRkZW4uJFBhdGgpIHtcblx0XHRcdGlzQWx3YXlzSGlkZGVuID0gb0NvbnRleHQuZ2V0T2JqZWN0KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiKTtcblx0XHRcdGlmICghaXNBbHdheXNIaWRkZW4gfHwgaXNBbHdheXNIaWRkZW4uJFBhdGgpIHtcblx0XHRcdFx0aXNBbHdheXNIaWRkZW4gPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuICFpc0Fsd2F5c0hpZGRlbjtcblx0fSxcblx0aXNSZXF1aXJlZDogZnVuY3Rpb24gKG9GaWVsZENvbnRyb2w6IGFueSwgc0VkaXRNb2RlOiBhbnkpIHtcblx0XHQvLyB0aGlzIGlzIHVzZWQgaW4gYWN0aW9uUGFyYW1ldGVyRGlhbG9nLmZyYWdtZW50XG5cdFx0aWYgKHNFZGl0TW9kZSA9PT0gXCJEaXNwbGF5XCIgfHwgc0VkaXRNb2RlID09PSBcIlJlYWRPbmx5XCIgfHwgc0VkaXRNb2RlID09PSBcIkRpc2FibGVkXCIpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKG9GaWVsZENvbnRyb2wpIHtcblx0XHRcdGlmICgoTWFuYWdlZE9iamVjdCBhcyBhbnkpLmJpbmRpbmdQYXJzZXIob0ZpZWxkQ29udHJvbCkpIHtcblx0XHRcdFx0cmV0dXJuIFwiez0gJVwiICsgb0ZpZWxkQ29udHJvbCArIFwiID09PSA3fVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG9GaWVsZENvbnRyb2wgPT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sVHlwZS9NYW5kYXRvcnlcIjtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdGdldEFjdGlvblBhcmFtZXRlclZpc2liaWxpdHk6IGZ1bmN0aW9uIChvUGFyYW06IGFueSwgb0NvbnRleHQ6IGFueSkge1xuXHRcdC8vIFRvIHVzZSB0aGUgVUkuSGlkZGVuIGFubm90YXRpb24gZm9yIGNvbnRyb2xsaW5nIHZpc2liaWxpdHkgdGhlIHZhbHVlIG5lZWRzIHRvIGJlIG5lZ2F0ZWRcblx0XHRpZiAodHlwZW9mIG9QYXJhbSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0aWYgKG9QYXJhbSAmJiBvUGFyYW0uJElmICYmIG9QYXJhbS4kSWYubGVuZ3RoID09PSAzKSB7XG5cdFx0XHRcdC8vIEluIGNhc2UgdGhlIFVJLkhpZGRlbiBjb250YWlucyBhIGR5bmFtaWMgZXhwcmVzc2lvbiB3ZSBkbyB0aGlzXG5cdFx0XHRcdC8vIGJ5IGp1c3Qgc3dpdGNoaW5nIHRoZSBcInRoZW5cIiBhbmQgXCJlbHNlXCIgcGFydCBvZiB0aGUgZXJwcmVzc2lvblxuXHRcdFx0XHQvLyBvUGFyYW0uJElmWzBdIDw9PSBDb25kaXRpb24gcGFydFxuXHRcdFx0XHQvLyBvUGFyYW0uJElmWzFdIDw9PSBUaGVuIHBhcnRcblx0XHRcdFx0Ly8gb1BhcmFtLiRJZlsyXSA8PT0gRWxzZSBwYXJ0XG5cdFx0XHRcdGNvbnN0IG9OZWdQYXJhbTogYW55ID0geyAkSWY6IFtdIH07XG5cdFx0XHRcdG9OZWdQYXJhbS4kSWZbMF0gPSBvUGFyYW0uJElmWzBdO1xuXHRcdFx0XHRvTmVnUGFyYW0uJElmWzFdID0gb1BhcmFtLiRJZlsyXTtcblx0XHRcdFx0b05lZ1BhcmFtLiRJZlsyXSA9IG9QYXJhbS4kSWZbMV07XG5cdFx0XHRcdHJldHVybiBBbm5vdGF0aW9uSGVscGVyLnZhbHVlKG9OZWdQYXJhbSwgb0NvbnRleHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFwiez0gISV7XCIgKyBvUGFyYW0uJFBhdGggKyBcIn0gfVwiO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIG9QYXJhbSA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdHJldHVybiBBbm5vdGF0aW9uSGVscGVyLnZhbHVlKCFvUGFyYW0sIG9Db250ZXh0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIENvbXB1dGVkIGFubm90YXRpb24gdGhhdCByZXR1cm5zIHZQcm9wZXJ0eSBmb3IgYSBzdHJpbmcgYW5kIEBzYXB1aS5uYW1lIGZvciBhbiBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB2UHJvcGVydHkgVGhlIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBvSW50ZXJmYWNlIFRoZSBpbnRlcmZhY2UgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgVGhlIHByb3BlcnR5IG5hbWVcblx0ICovXG5cdHByb3BlcnR5TmFtZTogZnVuY3Rpb24gKHZQcm9wZXJ0eTogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHRsZXQgc1Byb3BlcnR5TmFtZTtcblx0XHRpZiAodHlwZW9mIHZQcm9wZXJ0eSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCkuaW5kZXhPZihcIiRQYXRoXCIpID4gLTEgfHwgb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKS5pbmRleE9mKFwiJFByb3BlcnR5UGF0aFwiKSA+IC0xKSB7XG5cdFx0XHRcdC8vIFdlIGNvdWxkIGVuZCB1cCB3aXRoIGEgcHVyZSBzdHJpbmcgcHJvcGVydHkgKG5vICRQYXRoKSwgYW5kIHRoaXMgaXMgbm90IGEgcmVhbCBwcm9wZXJ0eSBpbiB0aGF0IGNhc2Vcblx0XHRcdFx0c1Byb3BlcnR5TmFtZSA9IHZQcm9wZXJ0eTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHZQcm9wZXJ0eS4kUGF0aCB8fCB2UHJvcGVydHkuJFByb3BlcnR5UGF0aCkge1xuXHRcdFx0Y29uc3Qgc1BhdGggPSB2UHJvcGVydHkuJFBhdGggPyBcIi8kUGF0aFwiIDogXCIvJFByb3BlcnR5UGF0aFwiO1xuXHRcdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKTtcblx0XHRcdHNQcm9wZXJ0eU5hbWUgPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aCArIHNQYXRofS8kQHNhcHVpLm5hbWVgKTtcblx0XHR9IGVsc2UgaWYgKHZQcm9wZXJ0eS5WYWx1ZSAmJiB2UHJvcGVydHkuVmFsdWUuJFBhdGgpIHtcblx0XHRcdHNQcm9wZXJ0eU5hbWUgPSB2UHJvcGVydHkuVmFsdWUuJFBhdGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNQcm9wZXJ0eU5hbWUgPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0T2JqZWN0KFwiQHNhcHVpLm5hbWVcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNQcm9wZXJ0eU5hbWU7XG5cdH0sXG5cblx0ZmllbGRDb250cm9sOiBmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHQvLyBhY3Rpb25QYXJhbWV0ZXIgZGlhbG9nIGFuZCBlZGl0YWJsZSBoZWFkZXIgZmFjZXRcblx0XHRjb25zdCBvTW9kZWwgPSBvSW50ZXJmYWNlICYmIG9JbnRlcmZhY2UuY29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdGNvbnN0IHNQYXRoID0gb0ludGVyZmFjZSAmJiBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IG9GaWVsZENvbnRyb2xDb250ZXh0ID0gb01vZGVsICYmIG9Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgJHtzUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbGApO1xuXHRcdGNvbnN0IG9GaWVsZENvbnRyb2wgPSBvRmllbGRDb250cm9sQ29udGV4dCAmJiBvRmllbGRDb250cm9sQ29udGV4dC5nZXRQcm9wZXJ0eSgpO1xuXHRcdGlmIChvRmllbGRDb250cm9sKSB7XG5cdFx0XHRpZiAob0ZpZWxkQ29udHJvbC5oYXNPd25Qcm9wZXJ0eShcIiRFbnVtTWVtYmVyXCIpKSB7XG5cdFx0XHRcdHJldHVybiBvRmllbGRDb250cm9sLiRFbnVtTWVtYmVyO1xuXHRcdFx0fSBlbHNlIGlmIChvRmllbGRDb250cm9sLmhhc093blByb3BlcnR5KFwiJFBhdGhcIikpIHtcblx0XHRcdFx0cmV0dXJuIEFubm90YXRpb25IZWxwZXIudmFsdWUob0ZpZWxkQ29udHJvbCwgeyBjb250ZXh0OiBvRmllbGRDb250cm9sQ29udGV4dCB9KTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIHZhbHVlIGhlbHAgcHJvcGVydHkgZnJvbSBhIERhdGFGaWVsZCBvciBhIFByb3BlcnR5UGF0aCAoaW4gY2FzZSBhIFNlbGVjdGlvbkZpZWxkIGlzIHVzZWQpXG5cdCAqIFByaW9yaXR5IGZyb20gd2hlcmUgdG8gZ2V0IHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZmllbGQgKGV4YW1wbGVzIGFyZSBcIk5hbWVcIiBhbmQgXCJTdXBwbGllclwiKTpcblx0ICogMS4gSWYgb1Byb3BlcnR5Q29udGV4dC5nZXRPYmplY3QoKSBoYXMga2V5ICckUGF0aCcsIHRoZW4gd2UgdGFrZSB0aGUgdmFsdWUgYXQgJyRQYXRoJy5cblx0ICogMi4gRWxzZSwgdmFsdWUgYXQgb1Byb3BlcnR5Q29udGV4dC5nZXRPYmplY3QoKS5cblx0ICogSWYgdGhlcmUgaXMgYW4gSVNPQ3VycmVuY3kgb3IgaWYgdGhlcmUgYXJlIFVuaXQgYW5ub3RhdGlvbnMgZm9yIHRoZSBmaWVsZCBwcm9wZXJ0eSxcblx0ICogdGhlbiB0aGUgUGF0aCBhdCB0aGUgSVNPQ3VycmVuY3kgb3IgVW5pdCBhbm5vdGF0aW9ucyBvZiB0aGUgZmllbGQgcHJvcGVydHkgaXMgY29uc2lkZXJlZC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRIZWxwZXIuanNcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eUNvbnRleHQgVGhlIGNvbnRleHQgZnJvbSB3aGljaCB2YWx1ZSBoZWxwIHByb3BlcnR5IG5lZWQgdG8gYmUgZXh0cmFjdGVkLlxuXHQgKiBAcGFyYW0gYkluRmlsdGVyRmllbGQgV2hldGhlciBvciBub3Qgd2UncmUgaW4gdGhlIGZpbHRlciBmaWVsZCBhbmQgc2hvdWxkIGlnbm9yZVxuXHQgKiBAcmV0dXJucyBUaGUgdmFsdWUgaGVscCBwcm9wZXJ0eSBwYXRoXG5cdCAqL1xuXHR2YWx1ZUhlbHBQcm9wZXJ0eTogZnVuY3Rpb24gKG9Qcm9wZXJ0eUNvbnRleHQ6IEJhc2VDb250ZXh0LCBiSW5GaWx0ZXJGaWVsZD86IGJvb2xlYW4pIHtcblx0XHQvKiBGb3IgY3VycmVuY3kgKGFuZCBsYXRlciBVbml0KSB3ZSBuZWVkIHRvIGZvcndhcmQgdGhlIHZhbHVlIGhlbHAgdG8gdGhlIGFubm90YXRlZCBmaWVsZCAqL1xuXHRcdGNvbnN0IHNDb250ZXh0UGF0aCA9IG9Qcm9wZXJ0eUNvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IG9Db250ZW50ID0gb1Byb3BlcnR5Q29udGV4dC5nZXRPYmplY3QoKSB8fCB7fTtcblx0XHRsZXQgc1BhdGggPSBvQ29udGVudC4kUGF0aCA/IGAke3NDb250ZXh0UGF0aH0vJFBhdGhgIDogc0NvbnRleHRQYXRoO1xuXHRcdGNvbnN0IHNBbm5vUGF0aCA9IGAke3NQYXRofUBgO1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eUFubm90YXRpb25zID0gb1Byb3BlcnR5Q29udGV4dC5nZXRPYmplY3Qoc0Fubm9QYXRoKTtcblx0XHRsZXQgc0Fubm90YXRpb247XG5cdFx0aWYgKG9Qcm9wZXJ0eUFubm90YXRpb25zKSB7XG5cdFx0XHRzQW5ub3RhdGlvbiA9XG5cdFx0XHRcdChvUHJvcGVydHlBbm5vdGF0aW9ucy5oYXNPd25Qcm9wZXJ0eShJU09DdXJyZW5jeSkgJiYgSVNPQ3VycmVuY3kpIHx8IChvUHJvcGVydHlBbm5vdGF0aW9ucy5oYXNPd25Qcm9wZXJ0eShVbml0KSAmJiBVbml0KTtcblx0XHRcdGlmIChzQW5ub3RhdGlvbiAmJiAhYkluRmlsdGVyRmllbGQpIHtcblx0XHRcdFx0Y29uc3Qgc1VuaXRPckN1cnJlbmN5UGF0aCA9IGAke3NQYXRoICsgc0Fubm90YXRpb259LyRQYXRoYDtcblx0XHRcdFx0Ly8gd2UgY2hlY2sgdGhhdCB0aGUgY3VycmVuY3kgb3IgdW5pdCBpcyBhIFByb3BlcnR5IGFuZCBub3QgYSBmaXhlZCB2YWx1ZVxuXHRcdFx0XHRpZiAob1Byb3BlcnR5Q29udGV4dC5nZXRPYmplY3Qoc1VuaXRPckN1cnJlbmN5UGF0aCkpIHtcblx0XHRcdFx0XHRzUGF0aCA9IHNVbml0T3JDdXJyZW5jeVBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHNQYXRoO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBEZWRpY2F0ZWQgbWV0aG9kIHRvIGF2b2lkIGxvb2tpbmcgZm9yIHVuaXQgcHJvcGVydGllcy5cblx0ICpcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eUNvbnRleHRcblx0ICogQHJldHVybnMgVGhlIHZhbHVlIGhlbHAgcHJvcGVydHkgcGF0aFxuXHQgKi9cblx0dmFsdWVIZWxwUHJvcGVydHlGb3JGaWx0ZXJGaWVsZDogZnVuY3Rpb24gKG9Qcm9wZXJ0eUNvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiBGaWVsZEhlbHBlci52YWx1ZUhlbHBQcm9wZXJ0eShvUHJvcGVydHlDb250ZXh0LCB0cnVlKTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdlbmVyYXRlIHRoZSBJRCBmb3IgVmFsdWUgSGVscC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldElERm9yRmllbGRWYWx1ZUhlbHBcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRIZWxwZXIuanNcblx0ICogQHBhcmFtIHNGbGV4SWQgRmxleCBJRCBvZiB0aGUgY3VycmVudCBvYmplY3Rcblx0ICogQHBhcmFtIHNJZFByZWZpeCBQcmVmaXggZm9yIHRoZSBWYWx1ZUhlbHAgSURcblx0ICogQHBhcmFtIHNPcmlnaW5hbFByb3BlcnR5TmFtZSBOYW1lIG9mIHRoZSBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gc1Byb3BlcnR5TmFtZSBOYW1lIG9mIHRoZSBWYWx1ZUhlbHAgUHJvcGVydHlcblx0ICogQHJldHVybnMgVGhlIElEIGdlbmVyYXRlZCBmb3IgdGhlIFZhbHVlSGVscFxuXHQgKi9cblx0Z2V0SURGb3JGaWVsZFZhbHVlSGVscDogZnVuY3Rpb24gKHNGbGV4SWQ6IHN0cmluZyB8IG51bGwsIHNJZFByZWZpeDogc3RyaW5nLCBzT3JpZ2luYWxQcm9wZXJ0eU5hbWU6IHN0cmluZywgc1Byb3BlcnR5TmFtZTogc3RyaW5nKSB7XG5cdFx0aWYgKHNGbGV4SWQpIHtcblx0XHRcdHJldHVybiBzRmxleElkO1xuXHRcdH1cblx0XHRsZXQgc1Byb3BlcnR5ID0gc1Byb3BlcnR5TmFtZTtcblx0XHRpZiAoc09yaWdpbmFsUHJvcGVydHlOYW1lICE9PSBzUHJvcGVydHlOYW1lKSB7XG5cdFx0XHRzUHJvcGVydHkgPSBgJHtzT3JpZ2luYWxQcm9wZXJ0eU5hbWV9Ojoke3NQcm9wZXJ0eU5hbWV9YDtcblx0XHR9XG5cdFx0cmV0dXJuIGdlbmVyYXRlKFtzSWRQcmVmaXgsIHNQcm9wZXJ0eV0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBmaWVsZEhlbHAgcHJvcGVydHkgb2YgdGhlIEZpbHRlckZpZWxkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0RmllbGRIZWxwUHJvcGVydHlGb3JGaWx0ZXJGaWVsZFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEhlbHBlci5qc1xuXHQgKiBAcGFyYW0gcHJvcGVydHlDb250ZXh0IFByb3BlcnR5IGNvbnRleHQgZm9yIGZpbHRlciBmaWVsZFxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSBvYmplY3Qgb2YgdGhlIEZpZWxkSGVscCBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gc1Byb3BlcnR5VHlwZSBUaGUgJFR5cGUgb2YgdGhlIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBzVmhJZFByZWZpeCBUaGUgSUQgcHJlZml4IG9mIHRoZSB2YWx1ZSBoZWxwXG5cdCAqIEBwYXJhbSBzUHJvcGVydHlOYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gc1ZhbHVlSGVscFByb3BlcnR5TmFtZSBUaGUgcHJvcGVydHkgbmFtZSBvZiB0aGUgdmFsdWUgaGVscFxuXHQgKiBAcGFyYW0gYkhhc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyBgdHJ1ZWAgaWYgdGhlcmUgaXMgYSB2YWx1ZSBsaXN0IHdpdGggYSBmaXhlZCB2YWx1ZSBhbm5vdGF0aW9uXG5cdCAqIEBwYXJhbSBiVXNlU2VtYW50aWNEYXRlUmFuZ2UgYHRydWVgIGlmIHRoZSBzZW1hbnRpYyBkYXRlIHJhbmdlIGlzIHNldCB0byAndHJ1ZScgaW4gdGhlIG1hbmlmZXN0XG5cdCAqIEByZXR1cm5zIFRoZSBmaWVsZCBoZWxwIHByb3BlcnR5IG9mIHRoZSB2YWx1ZSBoZWxwXG5cdCAqL1xuXHRnZXRGaWVsZEhlbHBQcm9wZXJ0eUZvckZpbHRlckZpZWxkOiBmdW5jdGlvbiAoXG5cdFx0cHJvcGVydHlDb250ZXh0OiBCYXNlQ29udGV4dCxcblx0XHRvUHJvcGVydHk6IGFueSxcblx0XHRzUHJvcGVydHlUeXBlOiBzdHJpbmcsXG5cdFx0c1ZoSWRQcmVmaXg6IHN0cmluZyxcblx0XHRzUHJvcGVydHlOYW1lOiBzdHJpbmcsXG5cdFx0c1ZhbHVlSGVscFByb3BlcnR5TmFtZTogc3RyaW5nLFxuXHRcdGJIYXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXM6IGJvb2xlYW4sXG5cdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlOiBib29sZWFuIHwgc3RyaW5nXG5cdCkge1xuXHRcdGNvbnN0IHNQcm9wZXJ0eSA9IEZpZWxkSGVscGVyLnByb3BlcnR5TmFtZShvUHJvcGVydHksIHsgY29udGV4dDogcHJvcGVydHlDb250ZXh0IH0pLFxuXHRcdFx0YlNlbWFudGljRGF0ZVJhbmdlID0gYlVzZVNlbWFudGljRGF0ZVJhbmdlID09PSBcInRydWVcIiB8fCBiVXNlU2VtYW50aWNEYXRlUmFuZ2UgPT09IHRydWU7XG5cdFx0Y29uc3Qgb01vZGVsID0gcHJvcGVydHlDb250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRzUHJvcGVydHlQYXRoID0gcHJvcGVydHlDb250ZXh0LmdldFBhdGgoKSxcblx0XHRcdHNQcm9wZXJ0eUxvY2F0aW9uUGF0aCA9IENvbW1vbkhlbHBlci5nZXRMb2NhdGlvbkZvclByb3BlcnR5UGF0aChvTW9kZWwsIHNQcm9wZXJ0eVBhdGgpLFxuXHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9ucyA9IENvbW1vblV0aWxzLmdldEZpbHRlclJlc3RyaWN0aW9uc0J5UGF0aChzUHJvcGVydHlMb2NhdGlvblBhdGgsIG9Nb2RlbCk7XG5cdFx0aWYgKFxuXHRcdFx0KChzUHJvcGVydHlUeXBlID09PSBcIkVkbS5EYXRlVGltZU9mZnNldFwiIHx8IHNQcm9wZXJ0eVR5cGUgPT09IFwiRWRtLkRhdGVcIikgJiZcblx0XHRcdFx0YlNlbWFudGljRGF0ZVJhbmdlICYmXG5cdFx0XHRcdG9GaWx0ZXJSZXN0cmljdGlvbnMgJiZcblx0XHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9ucy5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgJiZcblx0XHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9ucy5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnNbc1Byb3BlcnR5XSAmJlxuXHRcdFx0XHQob0ZpbHRlclJlc3RyaWN0aW9ucy5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnNbc1Byb3BlcnR5XS5pbmRleE9mKFwiU2luZ2xlUmFuZ2VcIikgIT09IC0xIHx8XG5cdFx0XHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9ucy5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnNbc1Byb3BlcnR5XS5pbmRleE9mKFwiU2luZ2xlVmFsdWVcIikgIT09IC0xKSkgfHxcblx0XHRcdChzUHJvcGVydHlUeXBlID09PSBcIkVkbS5Cb29sZWFuXCIgJiYgIWJIYXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMpXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRyZXR1cm4gRmllbGRIZWxwZXIuZ2V0SURGb3JGaWVsZFZhbHVlSGVscChudWxsLCBzVmhJZFByZWZpeCB8fCBcIkZpbHRlckZpZWxkVmFsdWVIZWxwXCIsIHNQcm9wZXJ0eU5hbWUsIHNWYWx1ZUhlbHBQcm9wZXJ0eU5hbWUpO1xuXHR9LFxuXG5cdC8qXG5cdCAqIE1ldGhvZCB0byBjb21wdXRlIHRoZSBkZWxlZ2F0ZSB3aXRoIHBheWxvYWRcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkZWxlZ2F0ZU5hbWUgLSBuYW1lIG9mIHRoZSBkZWxlZ2F0ZSBtZXRob2RlXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCAtIGFkZGVkIHRvIHRoZSBwYXlsb2FkIG9mIHRoZSBkZWxlZ2F0ZSBtZXRob2RlXG5cdCAqIEByZXR1cm4ge29iamVjdH0gLSByZXR1cm5zIHRoZSBkZWxlZ2F0ZSB3aXRoIHBheWxvYWRcblx0ICovXG5cdGNvbXB1dGVGaWVsZEJhc2VEZWxlZ2F0ZTogZnVuY3Rpb24gKGRlbGVnYXRlTmFtZTogc3RyaW5nLCByZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0OiBib29sZWFuKSB7XG5cdFx0aWYgKHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QpIHtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRcdG5hbWU6IGRlbGVnYXRlTmFtZSxcblx0XHRcdFx0cGF5bG9hZDoge1xuXHRcdFx0XHRcdHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Q6IHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Rcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBge25hbWU6ICcke2RlbGVnYXRlTmFtZX0nfWA7XG5cdH0sXG5cdF9nZXRQcmltYXJ5SW50ZW50czogZnVuY3Rpb24gKGFTZW1hbnRpY09iamVjdHNMaXN0OiBhbnlbXSk6IFByb21pc2U8YW55W10+IHtcblx0XHRjb25zdCBhUHJvbWlzZXM6IGFueVtdID0gW107XG5cdFx0aWYgKGFTZW1hbnRpY09iamVjdHNMaXN0KSB7XG5cdFx0XHRjb25zdCBvVXNoZWxsQ29udGFpbmVyID0gc2FwLnVzaGVsbCAmJiBzYXAudXNoZWxsLkNvbnRhaW5lcjtcblx0XHRcdGNvbnN0IG9TZXJ2aWNlID0gb1VzaGVsbENvbnRhaW5lciAmJiBvVXNoZWxsQ29udGFpbmVyLmdldFNlcnZpY2UoXCJDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvblwiKTtcblx0XHRcdGFTZW1hbnRpY09iamVjdHNMaXN0LmZvckVhY2goZnVuY3Rpb24gKHNlbU9iamVjdCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHNlbU9iamVjdCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdGFQcm9taXNlcy5wdXNoKG9TZXJ2aWNlLmdldFByaW1hcnlJbnRlbnQoc2VtT2JqZWN0LCB7fSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFQcm9taXNlcylcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChhU2VtT2JqZWN0UHJpbWFyeUFjdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gYVNlbU9iamVjdFByaW1hcnlBY3Rpb247XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3IpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3IgZmV0Y2hpbmcgcHJpbWFyeSBpbnRlbnRzXCIsIG9FcnJvcik7XG5cdFx0XHRcdHJldHVybiBbXTtcblx0XHRcdH0pO1xuXHR9LFxuXHRfY2hlY2tJZlNlbWFudGljT2JqZWN0c0hhc1ByaW1hcnlBY3Rpb246IGZ1bmN0aW9uIChcblx0XHRvU2VtYW50aWNzOiBhbnksXG5cdFx0YVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zOiBhbnksXG5cdFx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnRcblx0KTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgX2ZuSXNTZW1hbnRpY09iamVjdEFjdGlvblVuYXZhaWxhYmxlID0gZnVuY3Rpb24gKF9vU2VtYW50aWNzOiBhbnksIF9vUHJpbWFyeUFjdGlvbjogYW55LCBfaW5kZXg6IHN0cmluZykge1xuXHRcdFx0Zm9yIChjb25zdCB1bmF2YWlsYWJsZUFjdGlvbnNJbmRleCBpbiBfb1NlbWFudGljcy5zZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1tfaW5kZXhdLmFjdGlvbnMpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdF9vUHJpbWFyeUFjdGlvbi5pbnRlbnRcblx0XHRcdFx0XHRcdC5zcGxpdChcIi1cIilbMV1cblx0XHRcdFx0XHRcdC5pbmRleE9mKF9vU2VtYW50aWNzLnNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zW19pbmRleF0uYWN0aW9uc1t1bmF2YWlsYWJsZUFjdGlvbnNJbmRleF0pID09PSAwXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblxuXHRcdG9TZW1hbnRpY3Muc2VtYW50aWNQcmltYXJ5QWN0aW9ucyA9IGFTZW1hbnRpY09iamVjdHNQcmltYXJ5QWN0aW9ucztcblx0XHRjb25zdCBvUHJpbWFyeUFjdGlvbiA9XG5cdFx0XHRvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cyAmJlxuXHRcdFx0b1NlbWFudGljcy5tYWluU2VtYW50aWNPYmplY3QgJiZcblx0XHRcdG9TZW1hbnRpY3Muc2VtYW50aWNQcmltYXJ5QWN0aW9uc1tvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cy5pbmRleE9mKG9TZW1hbnRpY3MubWFpblNlbWFudGljT2JqZWN0KV07XG5cdFx0Y29uc3Qgc0N1cnJlbnRIYXNoID0gYXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5nZXRIYXNoKCk7XG5cdFx0aWYgKG9TZW1hbnRpY3MubWFpblNlbWFudGljT2JqZWN0ICYmIG9QcmltYXJ5QWN0aW9uICE9PSBudWxsICYmIG9QcmltYXJ5QWN0aW9uLmludGVudCAhPT0gc0N1cnJlbnRIYXNoKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGluZGV4IGluIG9TZW1hbnRpY3Muc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMpIHtcblx0XHRcdFx0aWYgKG9TZW1hbnRpY3MubWFpblNlbWFudGljT2JqZWN0LmluZGV4T2Yob1NlbWFudGljcy5zZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1tpbmRleF0uc2VtYW50aWNPYmplY3QpID09PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIF9mbklzU2VtYW50aWNPYmplY3RBY3Rpb25VbmF2YWlsYWJsZShvU2VtYW50aWNzLCBvUHJpbWFyeUFjdGlvbiwgaW5kZXgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblx0Y2hlY2tQcmltYXJ5QWN0aW9uczogZnVuY3Rpb24gKG9TZW1hbnRpY3M6IGFueSwgYkdldFRpdGxlTGluazogYm9vbGVhbiwgYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0UHJpbWFyeUludGVudHMob1NlbWFudGljcyAmJiBvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cylcblx0XHRcdC50aGVuKChhU2VtYW50aWNPYmplY3RzUHJpbWFyeUFjdGlvbnM6IGFueVtdKSA9PiB7XG5cdFx0XHRcdHJldHVybiBiR2V0VGl0bGVMaW5rXG5cdFx0XHRcdFx0PyB7XG5cdFx0XHRcdFx0XHRcdHRpdGxlTGluazogYVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zLFxuXHRcdFx0XHRcdFx0XHRoYXNUaXRsZUxpbms6IHRoaXMuX2NoZWNrSWZTZW1hbnRpY09iamVjdHNIYXNQcmltYXJ5QWN0aW9uKFxuXHRcdFx0XHRcdFx0XHRcdG9TZW1hbnRpY3MsXG5cdFx0XHRcdFx0XHRcdFx0YVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zLFxuXHRcdFx0XHRcdFx0XHRcdGFwcENvbXBvbmVudFxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0ICB9XG5cdFx0XHRcdFx0OiB0aGlzLl9jaGVja0lmU2VtYW50aWNPYmplY3RzSGFzUHJpbWFyeUFjdGlvbihvU2VtYW50aWNzLCBhU2VtYW50aWNPYmplY3RzUHJpbWFyeUFjdGlvbnMsIGFwcENvbXBvbmVudCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3IpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3IgaW4gY2hlY2tQcmltYXJ5QWN0aW9uc1wiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0sXG5cdF9nZXRUaXRsZUxpbmtXaXRoUGFyYW1ldGVyczogZnVuY3Rpb24gKF9vU2VtYW50aWNPYmplY3RNb2RlbDogYW55LCBfbGlua0ludGVudDogc3RyaW5nKSB7XG5cdFx0aWYgKF9vU2VtYW50aWNPYmplY3RNb2RlbCAmJiBfb1NlbWFudGljT2JqZWN0TW9kZWwudGl0bGVsaW5rKSB7XG5cdFx0XHRyZXR1cm4gX29TZW1hbnRpY09iamVjdE1vZGVsLnRpdGxlbGluaztcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIF9saW5rSW50ZW50O1xuXHRcdH1cblx0fSxcblxuXHRnZXRQcmltYXJ5QWN0aW9uOiBmdW5jdGlvbiAob1NlbWFudGljczogYW55KSB7XG5cdFx0cmV0dXJuIG9TZW1hbnRpY3Muc2VtYW50aWNQcmltYXJ5QWN0aW9uc1tvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cy5pbmRleE9mKG9TZW1hbnRpY3MubWFpblNlbWFudGljT2JqZWN0KV0uaW50ZW50XG5cdFx0XHQ/IEZpZWxkSGVscGVyLl9nZXRUaXRsZUxpbmtXaXRoUGFyYW1ldGVycyhcblx0XHRcdFx0XHRvU2VtYW50aWNzLFxuXHRcdFx0XHRcdG9TZW1hbnRpY3Muc2VtYW50aWNQcmltYXJ5QWN0aW9uc1tvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cy5pbmRleE9mKG9TZW1hbnRpY3MubWFpblNlbWFudGljT2JqZWN0KV0uaW50ZW50XG5cdFx0XHQgIClcblx0XHRcdDogb1NlbWFudGljcy5wcmltYXJ5SW50ZW50QWN0aW9uO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGZldGNoIHRoZSBmaWx0ZXIgcmVzdHJpY3Rpb25zLiBGaWx0ZXIgcmVzdHJpY3Rpb25zIGNhbiBiZSBhbm5vdGF0ZWQgb24gYW4gZW50aXR5IHNldCBvciBhIG5hdmlnYXRpb24gcHJvcGVydHkuXG5cdCAqIERlcGVuZGluZyBvbiB0aGUgcGF0aCB0byB3aGljaCB0aGUgY29udHJvbCBpcyBib3VuZCwgd2UgY2hlY2sgZm9yIGZpbHRlciByZXN0cmljdGlvbnMgb24gdGhlIGNvbnRleHQgcGF0aCBvZiB0aGUgY29udHJvbCxcblx0ICogb3Igb24gdGhlIG5hdmlnYXRpb24gcHJvcGVydHkgKGlmIHRoZXJlIGlzIGEgbmF2aWdhdGlvbikuXG5cdCAqIEVnLiBJZiB0aGUgdGFibGUgaXMgYm91bmQgdG8gJy9FbnRpdHlTZXQnLCBmb3IgcHJvcGVydHkgcGF0aCAnL0VudGl0eVNldC9fQXNzb2NpYXRpb24vUHJvcGVydHlOYW1lJywgdGhlIGZpbHRlciByZXN0cmljdGlvbnNcblx0ICogb24gJy9FbnRpdHlTZXQnIHdpbiBvdmVyIGZpbHRlciByZXN0cmljdGlvbnMgb24gJy9FbnRpdHlTZXQvX0Fzc29jaWF0aW9uJy5cblx0ICogSWYgdGhlIHRhYmxlIGlzIGJvdW5kIHRvICcvRW50aXR5U2V0L19Bc3NvY2lhdGlvbicsIHRoZSBmaWx0ZXIgcmVzdHJpY3Rpb25zIG9uICcvRW50aXR5U2V0L19Bc3NvY2lhdGlvbicgd2luIG92ZXIgZmlsdGVyXG5cdCAqIHJldHJpY3Rpb25zIG9uICcvQXNzb2NpYXRpb25FbnRpdHlTZXQnLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgUHJvcGVydHkgQ29udGV4dFxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5IFByb3BlcnR5IG9iamVjdCBpbiB0aGUgbWV0YWRhdGFcblx0ICogQHBhcmFtIGJVc2VTZW1hbnRpY0RhdGVSYW5nZSBCb29sZWFuIFN1Z2dlc3RzIGlmIHNlbWFudGljIGRhdGUgcmFuZ2Ugc2hvdWxkIGJlIHVzZWRcblx0ICogQHBhcmFtIHNTZXR0aW5ncyBTdHJpbmdpZmllZCBvYmplY3Qgb2YgdGhlIHByb3BlcnR5IHNldHRpbmdzXG5cdCAqIEBwYXJhbSBjb250ZXh0UGF0aCBQYXRoIHRvIHdoaWNoIHRoZSBwYXJlbnQgY29udHJvbCAodGhlIHRhYmxlIG9yIHRoZSBmaWx0ZXIgYmFyKSBpcyBib3VuZFxuXHQgKiBAcmV0dXJucyBTdHJpbmcgY29udGFpbmluZyBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBvcGVyYXRvcnMgZm9yIGZpbHRlcmluZ1xuXHQgKi9cblx0b3BlcmF0b3JzOiBmdW5jdGlvbiAob0NvbnRleHQ6IEJhc2VDb250ZXh0LCBvUHJvcGVydHk6IGFueSwgYlVzZVNlbWFudGljRGF0ZVJhbmdlOiBib29sZWFuLCBzU2V0dGluZ3M6IHN0cmluZywgY29udGV4dFBhdGg6IHN0cmluZykge1xuXHRcdC8vIHRoaXMgaXMgdXNlZCBpbiBGaWx0ZXJGaWVsZC5ibG9ja1xuXHRcdGlmICghb1Byb3BlcnR5IHx8ICFjb250ZXh0UGF0aCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0bGV0IG9wZXJhdG9yczogc3RyaW5nW107XG5cdFx0Y29uc3Qgc1Byb3BlcnR5ID0gRmllbGRIZWxwZXIucHJvcGVydHlOYW1lKG9Qcm9wZXJ0eSwgeyBjb250ZXh0OiBvQ29udGV4dCB9KTtcblx0XHRjb25zdCBvTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsLFxuXHRcdFx0c1Byb3BlcnR5UGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKSxcblx0XHRcdHNQcm9wZXJ0eUxvY2F0aW9uUGF0aCA9IENvbW1vbkhlbHBlci5nZXRMb2NhdGlvbkZvclByb3BlcnR5UGF0aChvTW9kZWwsIHNQcm9wZXJ0eVBhdGgpLFxuXHRcdFx0cHJvcGVydHlUeXBlID0gb1Byb3BlcnR5LiRUeXBlO1xuXG5cdFx0aWYgKHByb3BlcnR5VHlwZSA9PT0gXCJFZG0uR3VpZFwiKSB7XG5cdFx0XHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yR3VpZFByb3BlcnR5KCk7XG5cdFx0fVxuXG5cdFx0Ly8gcmVtb3ZlICcvJ1xuXHRcdGNvbnRleHRQYXRoID0gY29udGV4dFBhdGguc2xpY2UoMCwgLTEpO1xuXHRcdGNvbnN0IGlzVGFibGVCb3VuZFRvTmF2aWdhdGlvbjogYm9vbGVhbiA9IGNvbnRleHRQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSA+IDA7XG5cdFx0Y29uc3QgaXNOYXZpZ2F0aW9uUGF0aDogYm9vbGVhbiA9XG5cdFx0XHQoaXNUYWJsZUJvdW5kVG9OYXZpZ2F0aW9uICYmIGNvbnRleHRQYXRoICE9PSBzUHJvcGVydHlMb2NhdGlvblBhdGgpIHx8XG5cdFx0XHQoIWlzVGFibGVCb3VuZFRvTmF2aWdhdGlvbiAmJiBzUHJvcGVydHlMb2NhdGlvblBhdGgubGFzdEluZGV4T2YoXCIvXCIpID4gMCk7XG5cdFx0Y29uc3QgbmF2aWdhdGlvblBhdGg6IHN0cmluZyA9XG5cdFx0XHQoaXNOYXZpZ2F0aW9uUGF0aCAmJiBzUHJvcGVydHlMb2NhdGlvblBhdGguc3Vic3RyKHNQcm9wZXJ0eUxvY2F0aW9uUGF0aC5pbmRleE9mKGNvbnRleHRQYXRoKSArIGNvbnRleHRQYXRoLmxlbmd0aCArIDEpKSB8fCBcIlwiO1xuXHRcdGNvbnN0IHByb3BlcnR5UGF0aDogc3RyaW5nID0gKGlzTmF2aWdhdGlvblBhdGggJiYgbmF2aWdhdGlvblBhdGggKyBcIi9cIiArIHNQcm9wZXJ0eSkgfHwgc1Byb3BlcnR5O1xuXG5cdFx0aWYgKCFpc1RhYmxlQm91bmRUb05hdmlnYXRpb24pIHtcblx0XHRcdGlmICghaXNOYXZpZ2F0aW9uUGF0aCkge1xuXHRcdFx0XHQvLyAvU2FsZXNPcmRlck1hbmFnZS9JRFxuXHRcdFx0XHRvcGVyYXRvcnMgPSBDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0XHRcdFx0XHRzUHJvcGVydHksXG5cdFx0XHRcdFx0c1Byb3BlcnR5TG9jYXRpb25QYXRoLFxuXHRcdFx0XHRcdG9Nb2RlbCxcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGUsXG5cdFx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdHNTZXR0aW5nc1xuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gL1NhbGVzT3JkZXJNYW5hbmdlL19JdGVtL01hdGVyaWFsXG5cdFx0XHRcdC8vbGV0IG9wZXJhdG9yc1xuXHRcdFx0XHRvcGVyYXRvcnMgPSBDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0XHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0Y29udGV4dFBhdGgsXG5cdFx0XHRcdFx0b01vZGVsLFxuXHRcdFx0XHRcdHByb3BlcnR5VHlwZSxcblx0XHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdFx0c1NldHRpbmdzXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChvcGVyYXRvcnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0b3BlcmF0b3JzID0gQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkoXG5cdFx0XHRcdFx0XHRzUHJvcGVydHksXG5cdFx0XHRcdFx0XHRzUHJvcGVydHlMb2NhdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRvTW9kZWwsXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eVR5cGUsXG5cdFx0XHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdFx0XHRzU2V0dGluZ3Ncblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghaXNOYXZpZ2F0aW9uUGF0aCkge1xuXHRcdFx0Ly8gL1NhbGVzT3JkZXJNYW5hZ2UvX0l0ZW0vTWF0ZXJpYWxcblx0XHRcdG9wZXJhdG9ycyA9IENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvclByb3BlcnR5KFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdGNvbnRleHRQYXRoLFxuXHRcdFx0XHRvTW9kZWwsXG5cdFx0XHRcdHByb3BlcnR5VHlwZSxcblx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRzU2V0dGluZ3Ncblx0XHRcdCk7XG5cdFx0XHRpZiAob3BlcmF0b3JzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRvcGVyYXRvcnMgPSBDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0XHRcdFx0XHRzUHJvcGVydHksXG5cdFx0XHRcdFx0TW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChjb250ZXh0UGF0aCksXG5cdFx0XHRcdFx0b01vZGVsLFxuXHRcdFx0XHRcdHByb3BlcnR5VHlwZSxcblx0XHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdFx0c1NldHRpbmdzXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb3BlcmF0b3JzPy5sZW5ndGggPiAwID8gb3BlcmF0b3JzLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIC9TYWxlc09yZGVyTWFuYWdlL19JdGVtL19Bc3NvY2lhdGlvbi9Qcm9wZXJ0eU5hbWVcblx0XHRcdC8vIFRoaXMgaXMgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQgZm9yIHRhYmxlc1xuXHRcdFx0b3BlcmF0b3JzID0gQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkoXG5cdFx0XHRcdHByb3BlcnR5UGF0aCxcblx0XHRcdFx0Y29udGV4dFBhdGgsXG5cdFx0XHRcdG9Nb2RlbCxcblx0XHRcdFx0cHJvcGVydHlUeXBlLFxuXHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdHNTZXR0aW5nc1xuXHRcdFx0KTtcblx0XHRcdGlmIChvcGVyYXRvcnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdG9wZXJhdG9ycyA9IENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvclByb3BlcnR5KFxuXHRcdFx0XHRcdHByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKGNvbnRleHRQYXRoKSxcblx0XHRcdFx0XHRvTW9kZWwsXG5cdFx0XHRcdFx0cHJvcGVydHlUeXBlLFxuXHRcdFx0XHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdFx0XHRzU2V0dGluZ3Ncblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoKCFvcGVyYXRvcnMgfHwgb3BlcmF0b3JzLmxlbmd0aCA9PT0gMCkgJiYgKHByb3BlcnR5VHlwZSA9PT0gXCJFZG0uRGF0ZVwiIHx8IHByb3BlcnR5VHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIikpIHtcblx0XHRcdG9wZXJhdG9ycyA9IENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvckRhdGVQcm9wZXJ0eShwcm9wZXJ0eVR5cGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcGVyYXRvcnMubGVuZ3RoID4gMCA/IG9wZXJhdG9ycy50b1N0cmluZygpIDogdW5kZWZpbmVkO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJuIHRoZSBwYXRoIG9mIHRoZSBEYUZpZWxkRGVmYXVsdCAoaWYgYW55KS4gT3RoZXJ3aXNlLCB0aGUgRGF0YUZpZWxkIHBhdGggaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkQ29udGV4dCBDb250ZXh0IG9mIHRoZSBEYXRhRmllbGRcblx0ICogQHJldHVybnMgT2JqZWN0IHBhdGhcblx0ICovXG5cdGdldERhdGFGaWVsZERlZmF1bHQ6IGZ1bmN0aW9uIChvRGF0YUZpZWxkQ29udGV4dDogYW55KSB7XG5cdFx0Ly8gdGhpcyBpcyB1c2VkIGluIGNvbHVtbi5mcmFnbWVudFxuXHRcdGNvbnN0IG9EYXRhRmllbGREZWZhdWx0ID0gb0RhdGFGaWVsZENvbnRleHRcblx0XHRcdC5nZXRNb2RlbCgpXG5cdFx0XHQuZ2V0T2JqZWN0KGAke29EYXRhRmllbGRDb250ZXh0LmdldFBhdGgoKX1AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRGVmYXVsdGApO1xuXHRcdHJldHVybiBvRGF0YUZpZWxkRGVmYXVsdFxuXHRcdFx0PyBgJHtvRGF0YUZpZWxkQ29udGV4dC5nZXRQYXRoKCl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZERlZmF1bHRgXG5cdFx0XHQ6IG9EYXRhRmllbGRDb250ZXh0LmdldFBhdGgoKTtcblx0fSxcblx0Lypcblx0ICogTWV0aG9kIHRvIGdldCB2aXNpYmxlIGV4cHJlc3Npb24gZm9yIERhdGFGaWVsZEFjdGlvbkJ1dHRvblxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNEYXRhRmllbGRBY3Rpb25CdXR0b25WaXNpYmxlXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvVGhpcyAtIEN1cnJlbnQgT2JqZWN0XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvRGF0YUZpZWxkIC0gRGF0YVBvaW50J3MgVmFsdWVcblx0ICogQHBhcmFtIHtib29sZWFufSBiSXNCb3VuZCAtIERhdGFQb2ludCBhY3Rpb24gYm91bmRcblx0ICogQHBhcmFtIHtvYmplY3R9IG9BY3Rpb25Db250ZXh0IC0gQWN0aW9uQ29udGV4dCBWYWx1ZVxuXHQgKiBAcmV0dXJuIHtib29sZWFufSAtIHJldHVybnMgYm9vbGVhblxuXHQgKi9cblx0aXNEYXRhRmllbGRBY3Rpb25CdXR0b25WaXNpYmxlOiBmdW5jdGlvbiAob1RoaXM6IGFueSwgb0RhdGFGaWVsZDogYW55LCBiSXNCb3VuZDogYW55LCBvQWN0aW9uQ29udGV4dDogYW55KSB7XG5cdFx0cmV0dXJuIG9EYXRhRmllbGRbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdICE9PSB0cnVlICYmIChiSXNCb3VuZCAhPT0gdHJ1ZSB8fCBvQWN0aW9uQ29udGV4dCAhPT0gZmFsc2UpO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBwcmVzcyBldmVudCBmb3IgRGF0YUZpZWxkQWN0aW9uQnV0dG9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEFjdGlvbkJ1dHRvblxuXHQgKiBAcGFyYW0gb1RoaXMgQ3VycmVudCBPYmplY3Rcblx0ICogQHBhcmFtIG9EYXRhRmllbGQgRGF0YVBvaW50J3MgVmFsdWVcblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIERhdGFGaWVsZEFjdGlvbkJ1dHRvbiBwcmVzcyBldmVudFxuXHQgKi9cblx0Z2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEFjdGlvbkJ1dHRvbjogZnVuY3Rpb24gKG9UaGlzOiBhbnksIG9EYXRhRmllbGQ6IGFueSkge1xuXHRcdGxldCBzSW52b2NhdGlvbkdyb3VwaW5nID0gXCJJc29sYXRlZFwiO1xuXHRcdGlmIChcblx0XHRcdG9EYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nICYmXG5cdFx0XHRvRGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZy4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5PcGVyYXRpb25Hcm91cGluZ1R5cGUvQ2hhbmdlU2V0XCJcblx0XHQpIHtcblx0XHRcdHNJbnZvY2F0aW9uR3JvdXBpbmcgPSBcIkNoYW5nZVNldFwiO1xuXHRcdH1cblx0XHRsZXQgYklzTmF2aWdhYmxlID0gb1RoaXMubmF2aWdhdGVBZnRlckFjdGlvbjtcblx0XHRiSXNOYXZpZ2FibGUgPSBiSXNOYXZpZ2FibGUgPT09IFwiZmFsc2VcIiA/IGZhbHNlIDogdHJ1ZTtcblxuXHRcdGNvbnN0IGVudGl0aWVzOiBBcnJheTxzdHJpbmc+ID0gb1RoaXM/LmVudGl0eVNldD8uZ2V0UGF0aCgpLnNwbGl0KFwiL1wiKTtcblx0XHRjb25zdCBlbnRpdHlTZXROYW1lOiBzdHJpbmcgPSBlbnRpdGllc1tlbnRpdGllcy5sZW5ndGggLSAxXTtcblxuXHRcdGNvbnN0IG9QYXJhbXMgPSB7XG5cdFx0XHRjb250ZXh0czogXCIkeyRzb3VyY2U+L30uZ2V0QmluZGluZ0NvbnRleHQoKVwiLFxuXHRcdFx0aW52b2NhdGlvbkdyb3VwaW5nOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNJbnZvY2F0aW9uR3JvdXBpbmcpLFxuXHRcdFx0bW9kZWw6IFwiJHskc291cmNlPi99LmdldE1vZGVsKClcIixcblx0XHRcdGxhYmVsOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQuTGFiZWwsIHRydWUpLFxuXHRcdFx0aXNOYXZpZ2FibGU6IGJJc05hdmlnYWJsZSxcblx0XHRcdGVudGl0eVNldE5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoZW50aXR5U2V0TmFtZSlcblx0XHR9O1xuXG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFxuXHRcdFx0XCIuZWRpdEZsb3cuaW52b2tlQWN0aW9uXCIsXG5cdFx0XHRDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQuQWN0aW9uKSxcblx0XHRcdENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvUGFyYW1zKVxuXHRcdCk7XG5cdH0sXG5cblx0aXNOdW1lcmljRGF0YVR5cGU6IGZ1bmN0aW9uIChzRGF0YUZpZWxkVHlwZTogYW55KSB7XG5cdFx0Y29uc3QgX3NEYXRhRmllbGRUeXBlID0gc0RhdGFGaWVsZFR5cGU7XG5cdFx0aWYgKF9zRGF0YUZpZWxkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBhTnVtZXJpY0RhdGFUeXBlcyA9IFtcblx0XHRcdFx0XCJFZG0uSW50MTZcIixcblx0XHRcdFx0XCJFZG0uSW50MzJcIixcblx0XHRcdFx0XCJFZG0uSW50NjRcIixcblx0XHRcdFx0XCJFZG0uQnl0ZVwiLFxuXHRcdFx0XHRcIkVkbS5TQnl0ZVwiLFxuXHRcdFx0XHRcIkVkbS5TaW5nbGVcIixcblx0XHRcdFx0XCJFZG0uRGVjaW1hbFwiLFxuXHRcdFx0XHRcIkVkbS5Eb3VibGVcIlxuXHRcdFx0XTtcblx0XHRcdHJldHVybiBhTnVtZXJpY0RhdGFUeXBlcy5pbmRleE9mKF9zRGF0YUZpZWxkVHlwZSkgPT09IC0xID8gZmFsc2UgOiB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXG5cdGlzRGF0ZU9yVGltZURhdGFUeXBlOiBmdW5jdGlvbiAoc1Byb3BlcnR5VHlwZTogYW55KSB7XG5cdFx0aWYgKHNQcm9wZXJ0eVR5cGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgYURhdGVUaW1lRGF0YVR5cGVzID0gW1wiRWRtLkRhdGVUaW1lT2Zmc2V0XCIsIFwiRWRtLkRhdGVUaW1lXCIsIFwiRWRtLkRhdGVcIiwgXCJFZG0uVGltZU9mRGF5XCIsIFwiRWRtLlRpbWVcIl07XG5cdFx0XHRyZXR1cm4gYURhdGVUaW1lRGF0YVR5cGVzLmluZGV4T2Yoc1Byb3BlcnR5VHlwZSkgPiAtMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblx0aXNEYXRlVGltZURhdGFUeXBlOiBmdW5jdGlvbiAoc1Byb3BlcnR5VHlwZTogYW55KSB7XG5cdFx0aWYgKHNQcm9wZXJ0eVR5cGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgYURhdGVEYXRhVHlwZXMgPSBbXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIiwgXCJFZG0uRGF0ZVRpbWVcIl07XG5cdFx0XHRyZXR1cm4gYURhdGVEYXRhVHlwZXMuaW5kZXhPZihzUHJvcGVydHlUeXBlKSA+IC0xO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXHRpc0RhdGVEYXRhVHlwZTogZnVuY3Rpb24gKHNQcm9wZXJ0eVR5cGU6IGFueSkge1xuXHRcdHJldHVybiBzUHJvcGVydHlUeXBlID09PSBcIkVkbS5EYXRlXCI7XG5cdH0sXG5cdGlzVGltZURhdGFUeXBlOiBmdW5jdGlvbiAoc1Byb3BlcnR5VHlwZTogYW55KSB7XG5cdFx0aWYgKHNQcm9wZXJ0eVR5cGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgYURhdGVEYXRhVHlwZXMgPSBbXCJFZG0uVGltZU9mRGF5XCIsIFwiRWRtLlRpbWVcIl07XG5cdFx0XHRyZXR1cm4gYURhdGVEYXRhVHlwZXMuaW5kZXhPZihzUHJvcGVydHlUeXBlKSA+IC0xO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBUbyBkaXNwbGF5IGEgdGV4dCBhcnJhbmdlbWVudCBzaG93aW5nIHRleHQgYW5kIGlkLCB3ZSBuZWVkIGEgc3RyaW5nIGZpZWxkIG9uIHRoZSBVSS5cblx0ICpcblx0ICogQHBhcmFtIG9Bbm5vdGF0aW9ucyBBbGwgdGhlIGFubm90YXRpb25zIG9mIGEgcHJvcGVydHlcblx0ICogQHBhcmFtIHNUeXBlIFRoZSBwcm9wZXJ0eSBkYXRhIHR5cGVcblx0ICogQHJldHVybnMgVGhlIHR5cGUgdG8gYmUgdXNlZCBvbiB0aGUgVUkgZm9yIHRoZSBhbGlnbm1lbnRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldERhdGFUeXBlRm9yVmlzdWFsaXphdGlvbjogZnVuY3Rpb24gKG9Bbm5vdGF0aW9uczogYW55LCBzVHlwZTogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgc1RleHRBbm5vdGF0aW9uID0gXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIixcblx0XHRcdHNUZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uID0gXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCI7XG5cblx0XHQvKlxuXHRcdCAgSW4gY2FzZSBvZiBUZXh0U2VwYXJhdGUsIHRoZSByZXR1cm5lZCBpcyB1c2VkIGZvciB0aGUgZmlsZWQgaXRzZWxmIG9ubHkgc2hvd2luZ1xuXHRcdCAgIHRoZSB2YWx1ZSBvZiB0aGUgb3JpZ2luYWwgcHJvcGVydHksIHRodXMgYWxzbyB0aGUgdHlwZSBvZiB0aGUgcHJvcGVydHkgbmVlZHMgdG8gYmUgdXNlZC5cblx0XHQgIEluIGNhc2Ugb2YgVGV4dE9ubHksIHdlIGNvbnNpZGVyIGl0IHRvIGJlIEVkbS5TdHJpbmcgYWNjb3JkaW5nIHRvIHRoZSBkZWZpbml0aW9uXG5cdFx0ICAgaW4gdGhlIHZvY2FidWxhcnksIGV2ZW4gaWYgaXQncyBub3QuXG5cdFx0ICBJbiBvdGhlciBjYXNlcywgd2UgcmV0dXJuIEVkbS5TdHJpbmcsIGFzIHRoZSB2YWx1ZSBpcyBidWlsZCB1c2luZyBhIHRleHQgdGVtcGxhdGUuXG5cdFx0ICovXG5cdFx0cmV0dXJuIG9Bbm5vdGF0aW9ucz8uW3NUZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uXT8uJEVudW1NZW1iZXIgIT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0U2VwYXJhdGVcIiAmJlxuXHRcdFx0b0Fubm90YXRpb25zPy5bc1RleHRBbm5vdGF0aW9uXT8uJFBhdGhcblx0XHRcdD8gXCJFZG0uU3RyaW5nXCJcblx0XHRcdDogc1R5cGU7XG5cdH0sXG5cblx0Z2V0Q29sdW1uQWxpZ25tZW50OiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBvVGFibGU6IGFueSkge1xuXHRcdGNvbnN0IHNFbnRpdHlQYXRoID0gb1RhYmxlLmNvbGxlY3Rpb24uc1BhdGgsXG5cdFx0XHRvTW9kZWwgPSBvVGFibGUuY29sbGVjdGlvbi5vTW9kZWw7XG5cdFx0aWYgKFxuXHRcdFx0KG9EYXRhRmllbGRbXCIkVHlwZVwiXSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIiB8fFxuXHRcdFx0XHRvRGF0YUZpZWxkW1wiJFR5cGVcIl0gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCIpICYmXG5cdFx0XHRvRGF0YUZpZWxkLklubGluZSAmJlxuXHRcdFx0b0RhdGFGaWVsZC5JY29uVXJsXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gXCJDZW50ZXJcIjtcblx0XHR9XG5cdFx0Ly8gQ29sdW1ucyBjb250YWluaW5nIGEgU2VtYW50aWMgS2V5IG11c3QgYmUgQmVnaW4gYWxpZ25lZFxuXHRcdGNvbnN0IGFTZW1hbnRpY0tleXMgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljS2V5YCk7XG5cdFx0aWYgKG9EYXRhRmllbGRbXCIkVHlwZVwiXSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIikge1xuXHRcdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IG9EYXRhRmllbGQuVmFsdWUuJFBhdGg7XG5cdFx0XHRjb25zdCBiSXNTZW1hbnRpY0tleSA9XG5cdFx0XHRcdGFTZW1hbnRpY0tleXMgJiZcblx0XHRcdFx0IWFTZW1hbnRpY0tleXMuZXZlcnkoZnVuY3Rpb24gKG9LZXk6IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBvS2V5LiRQcm9wZXJ0eVBhdGggIT09IHNQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdH0pO1xuXHRcdFx0aWYgKGJJc1NlbWFudGljS2V5KSB7XG5cdFx0XHRcdHJldHVybiBcIkJlZ2luXCI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBGaWVsZEhlbHBlci5nZXREYXRhRmllbGRBbGlnbm1lbnQob0RhdGFGaWVsZCwgb01vZGVsLCBzRW50aXR5UGF0aCk7XG5cdH0sXG5cdC8qKlxuXHQgKiBHZXQgYWxpZ25tZW50IGJhc2VkIG9ubHkgb24gdGhlIHByb3BlcnR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gc1R5cGUgVGhlIHByb3BlcnR5J3MgdHlwZVxuXHQgKiBAcGFyYW0gb0Zvcm1hdE9wdGlvbnMgVGhlIGZpZWxkIGZvcm1hdCBvcHRpb25zXG5cdCAqIEBwYXJhbSBbb0NvbXB1dGVkRWRpdE1vZGVdIFRoZSBjb21wdXRlZCBFZGl0IG1vZGUgb2YgdGhlIHByb3BlcnR5IGlzIGVtcHR5IHdoZW4gZGlyZWN0bHkgY2FsbGVkIGZyb20gdGhlIENvbHVtblByb3BlcnR5IGZyYWdtZW50XG5cdCAqIEByZXR1cm5zIFRoZSBwcm9wZXJ0eSBhbGlnbm1lbnRcblx0ICovXG5cdGdldFByb3BlcnR5QWxpZ25tZW50OiBmdW5jdGlvbiAoc1R5cGU6IHN0cmluZywgb0Zvcm1hdE9wdGlvbnM6IGFueSwgb0NvbXB1dGVkRWRpdE1vZGU/OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPikge1xuXHRcdGxldCBzRGVmYXVsdEFsaWdubWVudCA9IFwiQmVnaW5cIiBhcyBhbnk7XG5cdFx0Y29uc3Qgc1RleHRBbGlnbm1lbnQgPSBvRm9ybWF0T3B0aW9ucyA/IG9Gb3JtYXRPcHRpb25zLnRleHRBbGlnbk1vZGUgOiBcIlwiO1xuXHRcdHN3aXRjaCAoc1RleHRBbGlnbm1lbnQpIHtcblx0XHRcdGNhc2UgXCJGb3JtXCI6XG5cdFx0XHRcdGlmICh0aGlzLmlzTnVtZXJpY0RhdGFUeXBlKHNUeXBlKSkge1xuXHRcdFx0XHRcdHNEZWZhdWx0QWxpZ25tZW50ID0gXCJCZWdpblwiO1xuXHRcdFx0XHRcdGlmIChvQ29tcHV0ZWRFZGl0TW9kZSkge1xuXHRcdFx0XHRcdFx0c0RlZmF1bHRBbGlnbm1lbnQgPSBnZXRBbGlnbm1lbnRFeHByZXNzaW9uKG9Db21wdXRlZEVkaXRNb2RlLCBcIkJlZ2luXCIsIFwiRW5kXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGlmICh0aGlzLmlzTnVtZXJpY0RhdGFUeXBlKHNUeXBlKSB8fCB0aGlzLmlzRGF0ZU9yVGltZURhdGFUeXBlKHNUeXBlKSkge1xuXHRcdFx0XHRcdHNEZWZhdWx0QWxpZ25tZW50ID0gXCJSaWdodFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gc0RlZmF1bHRBbGlnbm1lbnQ7XG5cdH0sXG5cblx0Z2V0RGF0YUZpZWxkQWxpZ25tZW50OiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBvTW9kZWw6IGFueSwgc0VudGl0eVBhdGg6IGFueSwgb0Zvcm1hdE9wdGlvbnM/OiBhbnksIG9Db21wdXRlZEVkaXRNb2RlPzogYW55KSB7XG5cdFx0bGV0IHNEYXRhRmllbGRQYXRoLFxuXHRcdFx0c0RlZmF1bHRBbGlnbm1lbnQgPSBcIkJlZ2luXCIsXG5cdFx0XHRzVHlwZSxcblx0XHRcdG9Bbm5vdGF0aW9ucztcblxuXHRcdGlmIChvRGF0YUZpZWxkW1wiJFR5cGVcIl0gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiKSB7XG5cdFx0XHRzRGF0YUZpZWxkUGF0aCA9IG9EYXRhRmllbGQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aDtcblx0XHRcdGlmIChcblx0XHRcdFx0b0RhdGFGaWVsZC5UYXJnZXRbXCIkQW5ub3RhdGlvblBhdGhcIl0gJiZcblx0XHRcdFx0b0RhdGFGaWVsZC5UYXJnZXRbXCIkQW5ub3RhdGlvblBhdGhcIl0uaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXBcIikgPj0gMFxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IG9GaWVsZEdyb3VwID0gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vJHtzRGF0YUZpZWxkUGF0aH1gKTtcblxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG9GaWVsZEdyb3VwLkRhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRzVHlwZSA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9LyR7c0RhdGFGaWVsZFBhdGh9L0RhdGEvJHtpLnRvU3RyaW5nKCl9L1ZhbHVlLyRQYXRoLyRUeXBlYCk7XG5cdFx0XHRcdFx0b0Fubm90YXRpb25zID0gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vJHtzRGF0YUZpZWxkUGF0aH0vRGF0YS8ke2kudG9TdHJpbmcoKX0vVmFsdWUvJFBhdGhAYCk7XG5cdFx0XHRcdFx0c1R5cGUgPSB0aGlzLmdldERhdGFUeXBlRm9yVmlzdWFsaXphdGlvbihvQW5ub3RhdGlvbnMsIHNUeXBlKTtcblx0XHRcdFx0XHRzRGVmYXVsdEFsaWdubWVudCA9IHRoaXMuZ2V0UHJvcGVydHlBbGlnbm1lbnQoc1R5cGUsIG9Gb3JtYXRPcHRpb25zLCBvQ29tcHV0ZWRFZGl0TW9kZSk7XG5cblx0XHRcdFx0XHRpZiAoc0RlZmF1bHRBbGlnbm1lbnQgPT09IFwiQmVnaW5cIikge1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBzRGVmYXVsdEFsaWdubWVudDtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0W1wiJEFubm90YXRpb25QYXRoXCJdICYmXG5cdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0W1wiJEFubm90YXRpb25QYXRoXCJdLmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIikgPj0gMCAmJlxuXHRcdFx0XHRvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofS9WaXN1YWxpemF0aW9uLyRFbnVtTWVtYmVyYCkgPT09XG5cdFx0XHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WaXN1YWxpemF0aW9uVHlwZS9SYXRpbmdcIlxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiBzRGVmYXVsdEFsaWdubWVudDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNUeXBlID0gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vJHtzRGF0YUZpZWxkUGF0aH0vJFR5cGVgKTtcblx0XHRcdFx0aWYgKHNUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFR5cGVcIikge1xuXHRcdFx0XHRcdHNUeXBlID0gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vJHtzRGF0YUZpZWxkUGF0aH0vVmFsdWUvJFBhdGgvJFR5cGVgKTtcblx0XHRcdFx0XHRvQW5ub3RhdGlvbnMgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofS9WYWx1ZS8kUGF0aEBgKTtcblx0XHRcdFx0XHRzVHlwZSA9IHRoaXMuZ2V0RGF0YVR5cGVGb3JWaXN1YWxpemF0aW9uKG9Bbm5vdGF0aW9ucywgc1R5cGUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHNEZWZhdWx0QWxpZ25tZW50ID0gdGhpcy5nZXRQcm9wZXJ0eUFsaWdubWVudChzVHlwZSwgb0Zvcm1hdE9wdGlvbnMsIG9Db21wdXRlZEVkaXRNb2RlKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0c0RhdGFGaWVsZFBhdGggPSBvRGF0YUZpZWxkLlZhbHVlLiRQYXRoO1xuXHRcdFx0c1R5cGUgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofS8kVHlwZWApO1xuXHRcdFx0b0Fubm90YXRpb25zID0gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vJHtzRGF0YUZpZWxkUGF0aH1AYCk7XG5cdFx0XHRzVHlwZSA9IHRoaXMuZ2V0RGF0YVR5cGVGb3JWaXN1YWxpemF0aW9uKG9Bbm5vdGF0aW9ucywgc1R5cGUpO1xuXHRcdFx0aWYgKCEob01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vYClbXCIkS2V5XCJdLmluZGV4T2Yoc0RhdGFGaWVsZFBhdGgpID09PSAwKSkge1xuXHRcdFx0XHRzRGVmYXVsdEFsaWdubWVudCA9IHRoaXMuZ2V0UHJvcGVydHlBbGlnbm1lbnQoc1R5cGUsIG9Gb3JtYXRPcHRpb25zLCBvQ29tcHV0ZWRFZGl0TW9kZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzRGVmYXVsdEFsaWdubWVudDtcblx0fSxcblx0Z2V0VHlwZUFsaWdubWVudDogZnVuY3Rpb24gKFxuXHRcdG9Db250ZXh0OiBhbnksXG5cdFx0b0RhdGFGaWVsZDogYW55LFxuXHRcdG9Gb3JtYXRPcHRpb25zOiBhbnksXG5cdFx0c0VudGl0eVBhdGg6IHN0cmluZyxcblx0XHRvQ29tcHV0ZWRFZGl0TW9kZTogYW55LFxuXHRcdG9Qcm9wZXJ0eTogYW55XG5cdCkge1xuXHRcdGNvbnN0IG9JbnRlcmZhY2UgPSBvQ29udGV4dC5nZXRJbnRlcmZhY2UoMCk7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0ludGVyZmFjZS5nZXRNb2RlbCgpO1xuXG5cdFx0aWYgKHNFbnRpdHlQYXRoID09PSBcIi91bmRlZmluZWRcIiAmJiBvUHJvcGVydHkgJiYgb1Byb3BlcnR5LiR0YXJnZXQpIHtcblx0XHRcdHNFbnRpdHlQYXRoID0gYC8ke29Qcm9wZXJ0eS4kdGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdChcIi9cIilbMF19YDtcblx0XHR9XG5cdFx0cmV0dXJuIEZpZWxkSGVscGVyLmdldERhdGFGaWVsZEFsaWdubWVudChvRGF0YUZpZWxkLCBvTW9kZWwsIHNFbnRpdHlQYXRoLCBvRm9ybWF0T3B0aW9ucywgb0NvbXB1dGVkRWRpdE1vZGUpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IGVuYWJsZWQgZXhwcmVzc2lvbiBmb3IgRGF0YUZpZWxkQWN0aW9uQnV0dG9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNEYXRhRmllbGRBY3Rpb25CdXR0b25FbmFibGVkXG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkIERhdGFQb2ludCdzIFZhbHVlXG5cdCAqIEBwYXJhbSBiSXNCb3VuZCBEYXRhUG9pbnQgYWN0aW9uIGJvdW5kXG5cdCAqIEBwYXJhbSBvQWN0aW9uQ29udGV4dCBBY3Rpb25Db250ZXh0IFZhbHVlXG5cdCAqIEBwYXJhbSBzQWN0aW9uQ29udGV4dEZvcm1hdCBGb3JtYXR0ZWQgdmFsdWUgb2YgQWN0aW9uQ29udGV4dFxuXHQgKiBAcmV0dXJucyBBIGJvb2xlYW4gb3Igc3RyaW5nIGV4cHJlc3Npb24gZm9yIGVuYWJsZWQgcHJvcGVydHlcblx0ICovXG5cdGlzRGF0YUZpZWxkQWN0aW9uQnV0dG9uRW5hYmxlZDogZnVuY3Rpb24gKG9EYXRhRmllbGQ6IGFueSwgYklzQm91bmQ6IGJvb2xlYW4sIG9BY3Rpb25Db250ZXh0OiBhbnksIHNBY3Rpb25Db250ZXh0Rm9ybWF0OiBzdHJpbmcpIHtcblx0XHRpZiAoYklzQm91bmQgIT09IHRydWUpIHtcblx0XHRcdHJldHVybiBcInRydWVcIjtcblx0XHR9XG5cdFx0cmV0dXJuIChvQWN0aW9uQ29udGV4dCA9PT0gbnVsbCA/IFwiez0gISR7I1wiICsgb0RhdGFGaWVsZC5BY3Rpb24gKyBcIn0gPyBmYWxzZSA6IHRydWUgfVwiIDogb0FjdGlvbkNvbnRleHQpXG5cdFx0XHQ/IHNBY3Rpb25Db250ZXh0Rm9ybWF0XG5cdFx0XHQ6IFwidHJ1ZVwiO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gY29tcHV0ZSB0aGUgbGFiZWwgZm9yIGEgRGF0YUZpZWxkLlxuXHQgKiBJZiB0aGUgRGF0YUZpZWxkJ3MgbGFiZWwgaXMgYW4gZW1wdHkgc3RyaW5nLCBpdCdzIG5vdCByZW5kZXJlZCBldmVuIGlmIGEgZmFsbGJhY2sgZXhpc3RzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgY29tcHV0ZUxhYmVsVGV4dFxuXHQgKiBAcGFyYW0ge29iamVjdH0gb0RhdGFGaWVsZCBUaGUgRGF0YUZpZWxkIGJlaW5nIHByb2Nlc3NlZFxuXHQgKiBAcGFyYW0ge29iamVjdH0gb0ludGVyZmFjZSBUaGUgaW50ZXJmYWNlIGZvciBjb250ZXh0IGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21wdXRlZCB0ZXh0IGZvciB0aGUgRGF0YUZpZWxkIGxhYmVsLlxuXHQgKi9cblxuXHRjb21wdXRlTGFiZWxUZXh0OiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRsZXQgc0NvbnRleHRQYXRoID0gb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKTtcblx0XHRpZiAoc0NvbnRleHRQYXRoLmVuZHNXaXRoKFwiL1wiKSkge1xuXHRcdFx0c0NvbnRleHRQYXRoID0gc0NvbnRleHRQYXRoLnNsaWNlKDAsIHNDb250ZXh0UGF0aC5sYXN0SW5kZXhPZihcIi9cIikpO1xuXHRcdH1cblx0XHRjb25zdCBzRGF0YUZpZWxkTGFiZWwgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vTGFiZWxgKTtcblx0XHQvL1dlIGRvIG5vdCBzaG93IGFuIGFkZGl0aW9uYWwgbGFiZWwgdGV4dCBmb3IgYSBidXR0b246XG5cdFx0aWYgKFxuXHRcdFx0b0RhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIiB8fFxuXHRcdFx0b0RhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cIlxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0aWYgKHNEYXRhRmllbGRMYWJlbCkge1xuXHRcdFx0cmV0dXJuIHNEYXRhRmllbGRMYWJlbDtcblx0XHR9IGVsc2UgaWYgKHNEYXRhRmllbGRMYWJlbCA9PT0gXCJcIikge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHRcdGxldCBzRGF0YUZpZWxkVGFyZ2V0VGl0bGU7XG5cdFx0aWYgKG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFwiKSA+IC0xIHx8XG5cdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0XCIpID4gLTFcblx0XHRcdCkge1xuXHRcdFx0XHRzRGF0YUZpZWxkVGFyZ2V0VGl0bGUgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aEAvVGl0bGVgKTtcblx0XHRcdH1cblx0XHRcdGlmIChvRGF0YUZpZWxkLlRhcmdldC4kQW5ub3RhdGlvblBhdGguaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkNvbnRhY3RcIikgPiAtMSkge1xuXHRcdFx0XHRzRGF0YUZpZWxkVGFyZ2V0VGl0bGUgPSBvTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRcdGAke3NDb250ZXh0UGF0aH0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aEAvZm4vJFBhdGhAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsYFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoc0RhdGFGaWVsZFRhcmdldFRpdGxlKSB7XG5cdFx0XHRyZXR1cm4gc0RhdGFGaWVsZFRhcmdldFRpdGxlO1xuXHRcdH1cblx0XHRsZXQgc0RhdGFGaWVsZFRhcmdldExhYmVsO1xuXHRcdGlmIChvRGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIikge1xuXHRcdFx0c0RhdGFGaWVsZFRhcmdldExhYmVsID0gb01vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L1RhcmdldC8kQW5ub3RhdGlvblBhdGhAL0xhYmVsYCk7XG5cdFx0fVxuXHRcdGlmIChzRGF0YUZpZWxkVGFyZ2V0TGFiZWwpIHtcblx0XHRcdHJldHVybiBzRGF0YUZpZWxkVGFyZ2V0TGFiZWw7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc0RhdGFGaWVsZFZhbHVlTGFiZWwgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vVmFsdWUvJFBhdGhAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsYCk7XG5cdFx0aWYgKHNEYXRhRmllbGRWYWx1ZUxhYmVsKSB7XG5cdFx0XHRyZXR1cm4gc0RhdGFGaWVsZFZhbHVlTGFiZWw7XG5cdFx0fVxuXG5cdFx0bGV0IHNEYXRhRmllbGRUYXJnZXRWYWx1ZUxhYmVsO1xuXHRcdGlmIChvRGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIikge1xuXHRcdFx0c0RhdGFGaWVsZFRhcmdldFZhbHVlTGFiZWwgPSBvTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRgJHtzQ29udGV4dFBhdGh9L1RhcmdldC8kQW5ub3RhdGlvblBhdGgvVmFsdWUvJFBhdGhAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsYFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0aWYgKHNEYXRhRmllbGRUYXJnZXRWYWx1ZUxhYmVsKSB7XG5cdFx0XHRyZXR1cm4gc0RhdGFGaWVsZFRhcmdldFZhbHVlTGFiZWw7XG5cdFx0fVxuXHRcdHJldHVybiBcIlwiO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGFsaWduIHRoZSBkYXRhIGZpZWxkcyB3aXRoIHRoZWlyIGxhYmVsLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgYnVpbGRFeHByZXNzaW9uRm9yQWxpZ25JdGVtc1xuXHQgKiBAcGFyYW0gc1Zpc3VhbGl6YXRpb25cblx0ICogQHJldHVybnMgRXhwcmVzc2lvbiBiaW5kaW5nIGZvciBhbGlnbkl0ZW1zIHByb3BlcnR5XG5cdCAqL1xuXHRidWlsZEV4cHJlc3Npb25Gb3JBbGlnbkl0ZW1zOiBmdW5jdGlvbiAoc1Zpc3VhbGl6YXRpb246IHN0cmluZykge1xuXHRcdGNvbnN0IGZpZWxkVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uID0gY29uc3RhbnQoc1Zpc3VhbGl6YXRpb24pO1xuXHRcdGNvbnN0IHByb2dyZXNzVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uID0gY29uc3RhbnQoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WaXN1YWxpemF0aW9uVHlwZS9Qcm9ncmVzc1wiKTtcblx0XHRjb25zdCByYXRpbmdWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24gPSBjb25zdGFudChcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiKTtcblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRpZkVsc2UoXG5cdFx0XHRcdG9yKFxuXHRcdFx0XHRcdGVxdWFsKGZpZWxkVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uLCBwcm9ncmVzc1Zpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbiksXG5cdFx0XHRcdFx0ZXF1YWwoZmllbGRWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24sIHJhdGluZ1Zpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbilcblx0XHRcdFx0KSxcblx0XHRcdFx0Y29uc3RhbnQoXCJDZW50ZXJcIiksXG5cdFx0XHRcdGlmRWxzZShVSS5Jc0VkaXRhYmxlLCBjb25zdGFudChcIkNlbnRlclwiKSwgY29uc3RhbnQoXCJTdHJldGNoXCIpKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBjaGVjayBWYWx1ZUxpc3RSZWZlcmVuY2VzLCBWYWx1ZUxpc3RNYXBwaW5nIGFuZCBWYWx1ZUxpc3QgaW5zaWRlIEFjdGlvblBhcmFtZXRlcnMgZm9yIEZpZWxkSGVscC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGhhc1ZhbHVlSGVscFxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5QW5ub3RhdGlvbnMgQWN0aW9uIHBhcmFtZXRlciBvYmplY3Rcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZXJlIGlzIGEgVmFsdWVMaXN0KiBhbm5vdGF0aW9uIGRlZmluZWRcblx0ICovXG5cdGhhc1ZhbHVlSGVscEFubm90YXRpb246IGZ1bmN0aW9uIChvUHJvcGVydHlBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0aWYgKG9Qcm9wZXJ0eUFubm90YXRpb25zKSB7XG5cdFx0XHRyZXR1cm4gISEoXG5cdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RSZWZlcmVuY2VzXCJdIHx8XG5cdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RNYXBwaW5nXCJdIHx8XG5cdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RcIl1cblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgZGlzcGxheSBwcm9wZXJ0eSBmb3IgQWN0aW9uUGFyYW1ldGVyIGRpYWxvZy5cblx0ICpcblx0ICogXHRAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0QVBEaWFsb2dEaXNwbGF5Rm9ybWF0XG5cdCAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIGFjdGlvbiBwYXJhbWV0ZXIgaW5zdGFuY2Vcblx0ICogQHBhcmFtIG9JbnRlcmZhY2UgVGhlIGludGVyZmFjZSBmb3IgdGhlIGNvbnRleHQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgVGhlIGRpc3BsYXkgZm9ybWF0ICBmb3IgYW4gYWN0aW9uIHBhcmFtZXRlciBGaWVsZFxuXHQgKi9cblx0Z2V0QVBEaWFsb2dEaXNwbGF5Rm9ybWF0OiBmdW5jdGlvbiAob1Byb3BlcnR5OiBhbnksIG9JbnRlcmZhY2U6IGFueSkge1xuXHRcdGxldCBvQW5ub3RhdGlvbjtcblx0XHRjb25zdCBvTW9kZWwgPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBzQ29udGV4dFBhdGggPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IHNQcm9wZXJ0eU5hbWUgPSBvUHJvcGVydHkuJE5hbWUgfHwgb0ludGVyZmFjZS5jb250ZXh0LmdldFByb3BlcnR5KGAke3NDb250ZXh0UGF0aH1Ac2FwdWkubmFtZWApO1xuXHRcdGNvbnN0IG9BY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9ucyA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofUBgKTtcblx0XHRjb25zdCBvVmFsdWVIZWxwQW5ub3RhdGlvbiA9XG5cdFx0XHRvQWN0aW9uUGFyYW1ldGVyQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFwiXSB8fFxuXHRcdFx0b0FjdGlvblBhcmFtZXRlckFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RNYXBwaW5nXCJdIHx8XG5cdFx0XHRvQWN0aW9uUGFyYW1ldGVyQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFJlZmVyZW5jZXNcIl07XG5cdFx0Y29uc3QgZ2V0VmFsdWVMaXN0UHJvcGVydHlOYW1lID0gZnVuY3Rpb24gKG9WYWx1ZUxpc3Q6IGFueSkge1xuXHRcdFx0Y29uc3Qgb1ZhbHVlTGlzdFBhcmFtZXRlciA9IG9WYWx1ZUxpc3QuUGFyYW1ldGVycy5maW5kKGZ1bmN0aW9uIChvUGFyYW1ldGVyOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9QYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHkgJiYgb1BhcmFtZXRlci5Mb2NhbERhdGFQcm9wZXJ0eS4kUHJvcGVydHlQYXRoID09PSBzUHJvcGVydHlOYW1lO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gb1ZhbHVlTGlzdFBhcmFtZXRlciAmJiBvVmFsdWVMaXN0UGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5O1xuXHRcdH07XG5cdFx0bGV0IHNWYWx1ZUxpc3RQcm9wZXJ0eU5hbWU7XG5cdFx0aWYgKFxuXHRcdFx0b0FjdGlvblBhcmFtZXRlckFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0QXJyYW5nZW1lbnRcIl0gfHxcblx0XHRcdG9BY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl1cblx0XHQpIHtcblx0XHRcdHJldHVybiBDb21tb25VdGlscy5jb21wdXRlRGlzcGxheU1vZGUob0FjdGlvblBhcmFtZXRlckFubm90YXRpb25zLCB1bmRlZmluZWQpO1xuXHRcdH0gZWxzZSBpZiAob1ZhbHVlSGVscEFubm90YXRpb24pIHtcblx0XHRcdGlmIChvVmFsdWVIZWxwQW5ub3RhdGlvbi5Db2xsZWN0aW9uUGF0aCkge1xuXHRcdFx0XHQvLyBnZXQgdGhlIG5hbWUgb2YgdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgaW4gdmFsdWUgbGlzdCBjb2xsZWN0aW9uXG5cdFx0XHRcdHNWYWx1ZUxpc3RQcm9wZXJ0eU5hbWUgPSBnZXRWYWx1ZUxpc3RQcm9wZXJ0eU5hbWUob1ZhbHVlSGVscEFubm90YXRpb24pO1xuXHRcdFx0XHRpZiAoIXNWYWx1ZUxpc3RQcm9wZXJ0eU5hbWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gXCJWYWx1ZVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGdldCB0ZXh0IGZvciB0aGlzIHByb3BlcnR5XG5cdFx0XHRcdG9Bbm5vdGF0aW9uID0gb01vZGVsLmdldE9iamVjdChgLyR7b1ZhbHVlSGVscEFubm90YXRpb24uQ29sbGVjdGlvblBhdGh9LyR7c1ZhbHVlTGlzdFByb3BlcnR5TmFtZX1AYCk7XG5cdFx0XHRcdHJldHVybiBvQW5ub3RhdGlvbiAmJiBvQW5ub3RhdGlvbltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXVxuXHRcdFx0XHRcdD8gQ29tbW9uVXRpbHMuY29tcHV0ZURpc3BsYXlNb2RlKG9Bbm5vdGF0aW9uLCB1bmRlZmluZWQpXG5cdFx0XHRcdFx0OiBcIlZhbHVlXCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gb01vZGVsLnJlcXVlc3RWYWx1ZUxpc3RJbmZvKHNDb250ZXh0UGF0aCwgdHJ1ZSkudGhlbihmdW5jdGlvbiAob1ZhbHVlTGlzdEluZm86IGFueSkge1xuXHRcdFx0XHRcdC8vIGdldCB0aGUgbmFtZSBvZiB0aGUgY29ycmVzcG9uZGluZyBwcm9wZXJ0eSBpbiB2YWx1ZSBsaXN0IGNvbGxlY3Rpb25cblx0XHRcdFx0XHRzVmFsdWVMaXN0UHJvcGVydHlOYW1lID0gZ2V0VmFsdWVMaXN0UHJvcGVydHlOYW1lKG9WYWx1ZUxpc3RJbmZvW1wiXCJdKTtcblx0XHRcdFx0XHRpZiAoIXNWYWx1ZUxpc3RQcm9wZXJ0eU5hbWUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBcIlZhbHVlXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIGdldCB0ZXh0IGZvciB0aGlzIHByb3BlcnR5XG5cdFx0XHRcdFx0b0Fubm90YXRpb24gPSBvVmFsdWVMaXN0SW5mb1tcIlwiXS4kbW9kZWxcblx0XHRcdFx0XHRcdC5nZXRNZXRhTW9kZWwoKVxuXHRcdFx0XHRcdFx0LmdldE9iamVjdChgLyR7b1ZhbHVlTGlzdEluZm9bXCJcIl1bXCJDb2xsZWN0aW9uUGF0aFwiXX0vJHtzVmFsdWVMaXN0UHJvcGVydHlOYW1lfUBgKTtcblx0XHRcdFx0XHRyZXR1cm4gb0Fubm90YXRpb24gJiYgb0Fubm90YXRpb25bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl1cblx0XHRcdFx0XHRcdD8gQ29tbW9uVXRpbHMuY29tcHV0ZURpc3BsYXlNb2RlKG9Bbm5vdGF0aW9uLCB1bmRlZmluZWQpXG5cdFx0XHRcdFx0XHQ6IFwiVmFsdWVcIjtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBcIlZhbHVlXCI7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBkaXNwbGF5IHByb3BlcnR5IGZvciBBY3Rpb25QYXJhbWV0ZXIgZGlhbG9nIEZpZWxkSGVscC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEFjdGlvblBhcmFtZXRlckRpYWxvZ0ZpZWxkSGVscFxuXHQgKiBAcGFyYW0gb0FjdGlvblBhcmFtZXRlciBBY3Rpb24gcGFyYW1ldGVyIG9iamVjdFxuXHQgKiBAcGFyYW0gc1NhcFVJTmFtZSBBY3Rpb24gc2FwdWkgbmFtZVxuXHQgKiBAcGFyYW0gc1BhcmFtTmFtZSBUaGUgcGFyYW1ldGVyIG5hbWVcblx0ICogQHJldHVybnMgVGhlIElEIG9mIHRoZSBmaWVsZEhlbHAgdXNlZCBieSB0aGlzIGFjdGlvbiBwYXJhbWV0ZXJcblx0ICovXG5cdGdldEFjdGlvblBhcmFtZXRlckRpYWxvZ0ZpZWxkSGVscDogZnVuY3Rpb24gKG9BY3Rpb25QYXJhbWV0ZXI6IG9iamVjdCwgc1NhcFVJTmFtZTogc3RyaW5nLCBzUGFyYW1OYW1lOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gdGhpcy5oYXNWYWx1ZUhlbHBBbm5vdGF0aW9uKG9BY3Rpb25QYXJhbWV0ZXIpID8gZ2VuZXJhdGUoW3NTYXBVSU5hbWUsIHNQYXJhbU5hbWVdKSA6IHVuZGVmaW5lZDtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIGRlbGVnYXRlIGNvbmZpZ3VyYXRpb24gZm9yIEFjdGlvblBhcmFtZXRlciBkaWFsb2cuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRWYWx1ZUhlbHBEZWxlZ2F0ZVxuXHQgKiBAcGFyYW0gaXNCb3VuZCBBY3Rpb24gaXMgYm91bmRcblx0ICogQHBhcmFtIGVudGl0eVR5cGVQYXRoIFRoZSBFbnRpdHlUeXBlIFBhdGhcblx0ICogQHBhcmFtIHNhcFVJTmFtZSBUaGUgbmFtZSBvZiB0aGUgQWN0aW9uXG5cdCAqIEBwYXJhbSBwYXJhbU5hbWUgVGhlIG5hbWUgb2YgdGhlIEFjdGlvblBhcmFtZXRlclxuXHQgKiBAcmV0dXJucyBUaGUgZGVsZWdhdGUgY29uZmlndXJhdGlvbiBvYmplY3QgYXMgYSBzdHJpbmdcblx0ICovXG5cdGdldFZhbHVlSGVscERlbGVnYXRlOiBmdW5jdGlvbiAoaXNCb3VuZDogYm9vbGVhbiwgZW50aXR5VHlwZVBhdGg6IHN0cmluZywgc2FwVUlOYW1lOiBzdHJpbmcsIHBhcmFtTmFtZTogc3RyaW5nKSB7XG5cdFx0Y29uc3QgZGVsZWdhdGVDb25maWd1cmF0aW9uOiB7IG5hbWU6IHN0cmluZzsgcGF5bG9hZDogVmFsdWVIZWxwUGF5bG9hZCB9ID0ge1xuXHRcdFx0bmFtZTogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhcInNhcC9mZS9tYWNyb3MvdmFsdWVoZWxwL1ZhbHVlSGVscERlbGVnYXRlXCIpLFxuXHRcdFx0cGF5bG9hZDoge1xuXHRcdFx0XHRwcm9wZXJ0eVBhdGg6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXG5cdFx0XHRcdFx0VmFsdWVMaXN0SGVscGVyLmdldFByb3BlcnR5UGF0aCh7XG5cdFx0XHRcdFx0XHRVbmJvdW5kQWN0aW9uOiAhaXNCb3VuZCxcblx0XHRcdFx0XHRcdEVudGl0eVR5cGVQYXRoOiBlbnRpdHlUeXBlUGF0aCxcblx0XHRcdFx0XHRcdEFjdGlvbjogc2FwVUlOYW1lLFxuXHRcdFx0XHRcdFx0UHJvcGVydHk6IHBhcmFtTmFtZVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCksXG5cdFx0XHRcdHF1YWxpZmllcnM6IHt9LFxuXHRcdFx0XHR2YWx1ZUhlbHBRdWFsaWZpZXI6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCJcIiksXG5cdFx0XHRcdGlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nOiB0cnVlXG5cdFx0XHR9XG5cdFx0fTtcblx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKGRlbGVnYXRlQ29uZmlndXJhdGlvbik7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBkZWxlZ2F0ZSBjb25maWd1cmF0aW9uIGZvciBOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZCBkaWFsb2cuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRWYWx1ZUhlbHBEZWxlZ2F0ZUZvck5vbkNvbXB1dGVkVmlzaWJsZUtleUZpZWxkXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eVBhdGggVGhlIGN1cnJlbnQgcHJvcGVydHkgcGF0aFxuXHQgKiBAcmV0dXJucyBUaGUgZGVsZWdhdGUgY29uZmlndXJhdGlvbiBvYmplY3QgYXMgYSBzdHJpbmdcblx0ICovXG5cdGdldFZhbHVlSGVscERlbGVnYXRlRm9yTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGQ6IGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGg6IHN0cmluZykge1xuXHRcdGNvbnN0IGRlbGVnYXRlQ29uZmlndXJhdGlvbjogeyBuYW1lOiBzdHJpbmc7IHBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWQgfSA9IHtcblx0XHRcdG5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCJzYXAvZmUvbWFjcm9zL3ZhbHVlaGVscC9WYWx1ZUhlbHBEZWxlZ2F0ZVwiKSxcblx0XHRcdHBheWxvYWQ6IHtcblx0XHRcdFx0cHJvcGVydHlQYXRoOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHByb3BlcnR5UGF0aCksXG5cdFx0XHRcdHF1YWxpZmllcnM6IHt9LFxuXHRcdFx0XHR2YWx1ZUhlbHBRdWFsaWZpZXI6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCJcIilcblx0XHRcdH1cblx0XHR9O1xuXHRcdHJldHVybiBDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcoZGVsZWdhdGVDb25maWd1cmF0aW9uKTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGZldGNoIGVudGl0eSBmcm9tIGEgcGF0aCBjb250YWluaW5nIG11bHRpcGxlIGFzc29jaWF0aW9ucy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIF9nZXRFbnRpdHlTZXRGcm9tTXVsdGlMZXZlbFxuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGNvbnRleHQgd2hvc2UgcGF0aCBpcyB0byBiZSBjaGVja2VkXG5cdCAqIEBwYXJhbSBzUGF0aCBUaGUgcGF0aCBmcm9tIHdoaWNoIGVudGl0eSBoYXMgdG8gYmUgZmV0Y2hlZFxuXHQgKiBAcGFyYW0gc1NvdXJjZUVudGl0eSBUaGUgZW50aXR5IHBhdGggaW4gd2hpY2ggbmF2IGVudGl0eSBleGlzdHNcblx0ICogQHBhcmFtIGlTdGFydCBUaGUgc3RhcnQgaW5kZXggOiBiZWdpbm5pbmcgcGFydHMgb2YgdGhlIHBhdGggdG8gYmUgaWdub3JlZFxuXHQgKiBAcGFyYW0gaURpZmYgVGhlIGRpZmYgaW5kZXggOiBlbmQgcGFydHMgb2YgdGhlIHBhdGggdG8gYmUgaWdub3JlZFxuXHQgKiBAcmV0dXJucyBUaGUgcGF0aCBvZiB0aGUgZW50aXR5IHNldFxuXHQgKi9cblx0X2dldEVudGl0eVNldEZyb21NdWx0aUxldmVsOiBmdW5jdGlvbiAob0NvbnRleHQ6IENvbnRleHQsIHNQYXRoOiBzdHJpbmcsIHNTb3VyY2VFbnRpdHk6IHN0cmluZywgaVN0YXJ0OiBhbnksIGlEaWZmOiBhbnkpIHtcblx0XHRsZXQgYU5hdlBhcnRzID0gc1BhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihCb29sZWFuKTtcblx0XHRhTmF2UGFydHMgPSBhTmF2UGFydHMuZmlsdGVyKGZ1bmN0aW9uIChzUGFydDogc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gc1BhcnQgIT09IFwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdcIjtcblx0XHR9KTtcblx0XHRpZiAoYU5hdlBhcnRzLmxlbmd0aCA+IDApIHtcblx0XHRcdGZvciAobGV0IGkgPSBpU3RhcnQ7IGkgPCBhTmF2UGFydHMubGVuZ3RoIC0gaURpZmY7IGkrKykge1xuXHRcdFx0XHRzU291cmNlRW50aXR5ID0gYC8ke29Db250ZXh0LmdldE9iamVjdChgJHtzU291cmNlRW50aXR5fS8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZy8ke2FOYXZQYXJ0c1tpXX1gKX1gO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc1NvdXJjZUVudGl0eTtcblx0fSxcblxuXHQvKipcblx0ICogV2hlbiB0aGUgdmFsdWUgZGlzcGxheWVkIGlzIGluIHRleHQgYXJyYW5nZW1lbnQgVGV4dE9ubHkgd2UgYWxzbyB3YW50IHRvIHJldHJpZXZlIHRoZSBUZXh0IHZhbHVlIGZvciB0YWJsZXMgZXZlbiBpZiB3ZSBkb24ndCBzaG93IGl0LlxuXHQgKiBUaGlzIG1ldGhvZCB3aWxsIHJldHVybiB0aGUgdmFsdWUgb2YgdGhlIG9yaWdpbmFsIGRhdGEgZmllbGQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGhpcyBUaGUgY3VycmVudCBvYmplY3Rcblx0ICogQHBhcmFtIG9EYXRhRmllbGRUZXh0QXJyYW5nZW1lbnQgRGF0YUZpZWxkIHVzaW5nIHRleHQgYXJyYW5nZW1lbnQgYW5ub3RhdGlvblxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZCBEYXRhRmllbGQgY29udGFpbmluZyB0aGUgdmFsdWUgdXNpbmcgdGV4dCBhcnJhbmdlbWVudCBhbm5vdGF0aW9uXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIHRvIHRoZSB2YWx1ZVxuXHQgKi9cblx0Z2V0QmluZGluZ0luZm9Gb3JUZXh0QXJyYW5nZW1lbnQ6IGZ1bmN0aW9uIChvVGhpczogb2JqZWN0LCBvRGF0YUZpZWxkVGV4dEFycmFuZ2VtZW50OiBhbnksIG9EYXRhRmllbGQ6IGFueSkge1xuXHRcdC8vIHRoaXMgaXMgdXNlZCBpbiBDb2x1bW5Db250ZW50IGZyYWdtZW50XG5cdFx0aWYgKFxuXHRcdFx0b0RhdGFGaWVsZFRleHRBcnJhbmdlbWVudCAmJlxuXHRcdFx0b0RhdGFGaWVsZFRleHRBcnJhbmdlbWVudC4kRW51bU1lbWJlciAmJlxuXHRcdFx0b0RhdGFGaWVsZFRleHRBcnJhbmdlbWVudC4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCIgJiZcblx0XHRcdG9EYXRhRmllbGRcblx0XHQpIHtcblx0XHRcdHJldHVybiBgeyR7b0RhdGFGaWVsZC5WYWx1ZS4kUGF0aH19YDtcblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblxuXHRnZXRQYXRoRm9ySWNvblNvdXJjZTogZnVuY3Rpb24gKHNQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHRcdHJldHVybiBcIns9IEZJRUxEUlVOVElNRS5nZXRJY29uRm9yTWltZVR5cGUoJXtcIiArIHNQcm9wZXJ0eVBhdGggKyBcIkBvZGF0YS5tZWRpYUNvbnRlbnRUeXBlfSl9XCI7XG5cdH0sXG5cdGdldEZpbGVuYW1lRXhwcjogZnVuY3Rpb24gKHNGaWxlbmFtZTogYW55LCBzTm9GaWxlbmFtZVRleHQ6IGFueSkge1xuXHRcdGlmIChzRmlsZW5hbWUpIHtcblx0XHRcdGlmIChzRmlsZW5hbWUuaW5kZXhPZihcIntcIikgPT09IDApIHtcblx0XHRcdFx0Ly8gZmlsZW5hbWUgaXMgcmVmZXJlbmNlZCB2aWEgcGF0aCwgaS5lLiBAQ29yZS5Db250ZW50RGlzcG9zaXRpb24uRmlsZW5hbWUgOiBwYXRoXG5cdFx0XHRcdHJldHVybiBcIns9ICRcIiArIHNGaWxlbmFtZSArIFwiID8gJFwiICsgc0ZpbGVuYW1lICsgXCIgOiAkXCIgKyBzTm9GaWxlbmFtZVRleHQgKyBcIn1cIjtcblx0XHRcdH1cblx0XHRcdC8vIHN0YXRpYyBmaWxlbmFtZSwgaS5lLiBAQ29yZS5Db250ZW50RGlzcG9zaXRpb24uRmlsZW5hbWUgOiAnc29tZVN0YXRpY05hbWUnXG5cdFx0XHRyZXR1cm4gc0ZpbGVuYW1lO1xuXHRcdH1cblx0XHQvLyBubyBAQ29yZS5Db250ZW50RGlzcG9zaXRpb24uRmlsZW5hbWVcblx0XHRyZXR1cm4gc05vRmlsZW5hbWVUZXh0O1xuXHR9LFxuXG5cdGNhbGN1bGF0ZU1CZnJvbUJ5dGU6IGZ1bmN0aW9uIChpQnl0ZTogYW55KSB7XG5cdFx0cmV0dXJuIGlCeXRlID8gKGlCeXRlIC8gKDEwMjQgKiAxMDI0KSkudG9GaXhlZCg2KSA6IHVuZGVmaW5lZDtcblx0fSxcblx0Z2V0RG93bmxvYWRVcmw6IGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGg6IHN0cmluZykge1xuXHRcdHJldHVybiBwcm9wZXJ0eVBhdGggKyBcIns9ICR7aW50ZXJuYWw+L3N0aWNreVNlc3Npb25Ub2tlbn0gPyAoJz9TQVAtQ29udGV4dElkPScgKyAke2ludGVybmFsPi9zdGlja3lTZXNzaW9uVG9rZW59KSA6ICcnIH1cIjtcblx0fSxcblx0Z2V0TWFyZ2luQ2xhc3M6IGZ1bmN0aW9uIChjb21wYWN0U2VtYW50aWNLZXk6IHN0cmluZyB8IGJvb2xlYW4gfCB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY29tcGFjdFNlbWFudGljS2V5ID09PSBcInRydWVcIiB8fCBjb21wYWN0U2VtYW50aWNLZXkgPT09IHRydWUgPyBcInNhcE1UYWJsZUNvbnRlbnRNYXJnaW5cIiA6IHVuZGVmaW5lZDtcblx0fSxcblx0Z2V0UmVxdWlyZWQ6IGZ1bmN0aW9uIChpbW11dGFibGVLZXk6IGFueSwgdGFyZ2V0OiBhbnksIHJlcXVpcmVkUHJvcGVydGllczogYW55KSB7XG5cdFx0bGV0IHRhcmdldFJlcXVpcmVkRXhwcmVzc2lvbjogYW55ID0gY29uc3RhbnQoZmFsc2UpO1xuXHRcdGlmICh0YXJnZXQgIT09IG51bGwpIHtcblx0XHRcdHRhcmdldFJlcXVpcmVkRXhwcmVzc2lvbiA9IGlzUmVxdWlyZWRFeHByZXNzaW9uKHRhcmdldD8udGFyZ2V0T2JqZWN0KTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKG9yKHRhcmdldFJlcXVpcmVkRXhwcmVzc2lvbiwgcmVxdWlyZWRQcm9wZXJ0aWVzLmluZGV4T2YoaW1tdXRhYmxlS2V5KSA+IC0xKSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgY2hlY2tzIGlmIHRoZSBmaWVsZCBpcyBhbHJlYWR5IHBhcnQgb2YgYSBmb3JtLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkQ29sbGVjdGlvbiBUaGUgbGlzdCBvZiB0aGUgZmllbGRzIG9mIHRoZSBmb3JtXG5cdCAqIEBwYXJhbSBkYXRhRmllbGRPYmplY3RQYXRoIFRoZSBkYXRhIG1vZGVsIG9iamVjdCBwYXRoIG9mIHRoZSBmaWVsZCB3aGljaCBuZWVkcyB0byBiZSBjaGVja2VkIGluIHRoZSBmb3JtXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgZmllbGQgaXMgYWxyZWFkeSBwYXJ0IG9mIHRoZSBmb3JtLCBgZmFsc2VgIG90aGVyd2lzZVxuXHQgKi9cblx0aXNGaWVsZFBhcnRPZkZvcm06IGZ1bmN0aW9uIChkYXRhRmllbGRDb2xsZWN0aW9uOiBGb3JtRWxlbWVudFtdLCBkYXRhRmllbGRPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdFx0Ly9nZW5lcmF0aW5nIGtleSBmb3IgdGhlIHJlY2VpdmVkIGRhdGEgZmllbGRcblx0XHRjb25zdCBjb25uZWN0ZWREYXRhRmllbGRLZXkgPSBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0KTtcblx0XHQvLyB0cnlpbmcgdG8gZmluZCB0aGUgZ2VuZXJhdGVkIGtleSBpbiBhbHJlYWR5IGV4aXN0aW5nIGZvcm0gZWxlbWVudHNcblx0XHRjb25zdCBpc0ZpZWxkRm91bmQgPSBkYXRhRmllbGRDb2xsZWN0aW9uLmZpbmQoKGZpZWxkKSA9PiB7XG5cdFx0XHRyZXR1cm4gZmllbGQua2V5ID09PSBjb25uZWN0ZWREYXRhRmllbGRLZXk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGlzRmllbGRGb3VuZCA/IHRydWUgOiBmYWxzZTtcblx0fVxufTtcbihGaWVsZEhlbHBlci5maWVsZENvbnRyb2wgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihGaWVsZEhlbHBlci5nZXRUeXBlQWxpZ25tZW50IGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4oRmllbGRIZWxwZXIuZ2V0QVBEaWFsb2dEaXNwbGF5Rm9ybWF0IGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4oRmllbGRIZWxwZXIuY29tcHV0ZUxhYmVsVGV4dCBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuKEZpZWxkSGVscGVyLmdldEFjdGlvblBhcmFtZXRlclZpc2liaWxpdHkgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcblxuZXhwb3J0IGRlZmF1bHQgRmllbGRIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBc0JBLE1BQU1BLFdBQVcsR0FBRyxvQ0FBb0M7SUFDdkRDLElBQUksR0FBRyw2QkFBNkI7RUFFckMsTUFBTUMsV0FBVyxHQUFHO0lBQ25CQyxpQkFBaUIsRUFBRSxVQUFVQyxVQUFlLEVBQUVDLFFBQWEsRUFBRTtNQUM1RDtNQUNBLE1BQU1DLFFBQVEsR0FBR0QsUUFBUSxDQUFDRSxPQUFPO01BQ2pDLElBQUlDLGNBQW1CLEdBQUcsS0FBSztNQUMvQixJQUFJSixVQUFVLENBQUNLLEtBQUssSUFBSUwsVUFBVSxDQUFDSyxLQUFLLENBQUNDLEtBQUssRUFBRTtRQUMvQ0YsY0FBYyxHQUFHRixRQUFRLENBQUNLLFNBQVMsQ0FBQywrQ0FBK0MsQ0FBQztNQUNyRjtNQUNBLElBQUksQ0FBQ0gsY0FBYyxJQUFJQSxjQUFjLENBQUNFLEtBQUssRUFBRTtRQUM1Q0YsY0FBYyxHQUFHRixRQUFRLENBQUNLLFNBQVMsQ0FBQyxvQ0FBb0MsQ0FBQztRQUN6RSxJQUFJLENBQUNILGNBQWMsSUFBSUEsY0FBYyxDQUFDRSxLQUFLLEVBQUU7VUFDNUNGLGNBQWMsR0FBRyxLQUFLO1FBQ3ZCO01BQ0Q7TUFDQSxPQUFPLENBQUNBLGNBQWM7SUFDdkIsQ0FBQztJQUNESSxVQUFVLEVBQUUsVUFBVUMsYUFBa0IsRUFBRUMsU0FBYyxFQUFFO01BQ3pEO01BQ0EsSUFBSUEsU0FBUyxLQUFLLFNBQVMsSUFBSUEsU0FBUyxLQUFLLFVBQVUsSUFBSUEsU0FBUyxLQUFLLFVBQVUsRUFBRTtRQUNwRixPQUFPLEtBQUs7TUFDYjtNQUNBLElBQUlELGFBQWEsRUFBRTtRQUNsQixJQUFLRSxhQUFhLENB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