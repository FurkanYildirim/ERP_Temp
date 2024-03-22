/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/CommonFormatters", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/FieldControlHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/SemanticObjectHelper", "sap/fe/core/templating/UIFormatters", "sap/ui/core/format/NumberFormat", "sap/ui/model/json/JSONModel", "./FieldHelper"], function (DataField, BindingHelper, BindingToolkit, TypeGuards, CommonFormatters, DataModelPathHelper, FieldControlHelper, PropertyHelper, SemanticObjectHelper, UIFormatters, NumberFormat, JSONModel, FieldHelper) {
  "use strict";

  var _exports = {};
  var ifUnitEditable = UIFormatters.ifUnitEditable;
  var hasSemanticObject = SemanticObjectHelper.hasSemanticObject;
  var getDynamicPathFromSemanticObject = SemanticObjectHelper.getDynamicPathFromSemanticObject;
  var isReadOnlyExpression = FieldControlHelper.isReadOnlyExpression;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isProperty = TypeGuards.isProperty;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var transformRecursively = BindingToolkit.transformRecursively;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isPathInModelExpression = BindingToolkit.isPathInModelExpression;
  var isComplexTypeExpression = BindingToolkit.isComplexTypeExpression;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatWithTypeInformation = BindingToolkit.formatWithTypeInformation;
  var formatResult = BindingToolkit.formatResult;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  var isDataFieldForAnnotation = DataField.isDataFieldForAnnotation;
  /**
   * Recursively add the text arrangement to a binding expression.
   *
   * @param bindingExpressionToEnhance The binding expression to be enhanced
   * @param fullContextPath The current context path we're on (to properly resolve the text arrangement properties)
   * @returns An updated expression containing the text arrangement binding.
   */
  const addTextArrangementToBindingExpression = function (bindingExpressionToEnhance, fullContextPath) {
    return transformRecursively(bindingExpressionToEnhance, "PathInModel", expression => {
      let outExpression = expression;
      if (expression.modelName === undefined) {
        // In case of default model we then need to resolve the text arrangement property
        const oPropertyDataModelPath = enhanceDataModelPath(fullContextPath, expression.path);
        outExpression = CommonFormatters.getBindingWithTextArrangement(oPropertyDataModelPath, expression);
      }
      return outExpression;
    });
  };
  _exports.addTextArrangementToBindingExpression = addTextArrangementToBindingExpression;
  const formatValueRecursively = function (bindingExpressionToEnhance, fullContextPath) {
    return transformRecursively(bindingExpressionToEnhance, "PathInModel", expression => {
      let outExpression = expression;
      if (expression.modelName === undefined) {
        // In case of default model we then need to resolve the text arrangement property
        const oPropertyDataModelPath = enhanceDataModelPath(fullContextPath, expression.path);
        outExpression = formatWithTypeInformation(oPropertyDataModelPath.targetObject, expression);
      }
      return outExpression;
    });
  };
  _exports.formatValueRecursively = formatValueRecursively;
  const getTextBindingExpression = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    return getTextBinding(oPropertyDataModelObjectPath, fieldFormatOptions, true);
  };
  _exports.getTextBindingExpression = getTextBindingExpression;
  const getTextBinding = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    var _oPropertyDataModelOb, _oPropertyDataModelOb2, _oPropertyDataModelOb3, _oPropertyDataModelOb4, _oPropertyDataModelOb5, _oPropertyDataModelOb6, _oPropertyDataModelOb7, _oPropertyDataModelOb8, _oPropertyDataModelOb9, _oPropertyDataModelOb10, _oPropertyDataModelOb11, _oPropertyDataModelOb12, _oPropertyDataModelOb13, _oPropertyDataModelOb14, _oPropertyDataModelOb15;
    let asObject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (((_oPropertyDataModelOb = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb === void 0 ? void 0 : _oPropertyDataModelOb.$Type) === "com.sap.vocabularies.UI.v1.DataField" || ((_oPropertyDataModelOb2 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb2 === void 0 ? void 0 : _oPropertyDataModelOb2.$Type) === "com.sap.vocabularies.UI.v1.DataPointType" || ((_oPropertyDataModelOb3 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb3 === void 0 ? void 0 : _oPropertyDataModelOb3.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath" || ((_oPropertyDataModelOb4 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb4 === void 0 ? void 0 : _oPropertyDataModelOb4.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || ((_oPropertyDataModelOb5 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb5 === void 0 ? void 0 : _oPropertyDataModelOb5.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation" || ((_oPropertyDataModelOb6 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb6 === void 0 ? void 0 : _oPropertyDataModelOb6.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithAction") {
      // If there is no resolved property, the value is returned as a constant
      const fieldValue = getExpressionFromAnnotation(oPropertyDataModelObjectPath.targetObject.Value) ?? "";
      return compileExpression(fieldValue);
    }
    if (isPathAnnotationExpression(oPropertyDataModelObjectPath.targetObject) && oPropertyDataModelObjectPath.targetObject.$target) {
      oPropertyDataModelObjectPath = enhanceDataModelPath(oPropertyDataModelObjectPath, oPropertyDataModelObjectPath.targetObject.path);
    }
    const oPropertyBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
    let oTargetBinding;
    // formatting
    if ((_oPropertyDataModelOb7 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb7 !== void 0 && (_oPropertyDataModelOb8 = _oPropertyDataModelOb7.annotations) !== null && _oPropertyDataModelOb8 !== void 0 && (_oPropertyDataModelOb9 = _oPropertyDataModelOb8.Measures) !== null && _oPropertyDataModelOb9 !== void 0 && _oPropertyDataModelOb9.Unit || (_oPropertyDataModelOb10 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb10 !== void 0 && (_oPropertyDataModelOb11 = _oPropertyDataModelOb10.annotations) !== null && _oPropertyDataModelOb11 !== void 0 && (_oPropertyDataModelOb12 = _oPropertyDataModelOb11.Measures) !== null && _oPropertyDataModelOb12 !== void 0 && _oPropertyDataModelOb12.ISOCurrency) {
      oTargetBinding = UIFormatters.getBindingWithUnitOrCurrency(oPropertyDataModelObjectPath, oPropertyBindingExpression);
      if ((fieldFormatOptions === null || fieldFormatOptions === void 0 ? void 0 : fieldFormatOptions.measureDisplayMode) === "Hidden" && isComplexTypeExpression(oTargetBinding)) {
        // TODO: Refactor once types are less generic here
        oTargetBinding.formatOptions = {
          ...oTargetBinding.formatOptions,
          showMeasure: false
        };
      }
    } else if ((_oPropertyDataModelOb13 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb13 !== void 0 && (_oPropertyDataModelOb14 = _oPropertyDataModelOb13.annotations) !== null && _oPropertyDataModelOb14 !== void 0 && (_oPropertyDataModelOb15 = _oPropertyDataModelOb14.Common) !== null && _oPropertyDataModelOb15 !== void 0 && _oPropertyDataModelOb15.Timezone) {
      oTargetBinding = UIFormatters.getBindingWithTimezone(oPropertyDataModelObjectPath, oPropertyBindingExpression, false, true, fieldFormatOptions.dateFormatOptions);
    } else {
      oTargetBinding = CommonFormatters.getBindingWithTextArrangement(oPropertyDataModelObjectPath, oPropertyBindingExpression, fieldFormatOptions);
    }
    if (asObject) {
      return oTargetBinding;
    }
    // We don't include $$nopatch and parseKeepEmptyString as they make no sense in the text binding case
    return compileExpression(oTargetBinding);
  };
  _exports.getTextBinding = getTextBinding;
  const getValueBinding = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    let ignoreUnit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let ignoreFormatting = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let bindingParameters = arguments.length > 4 ? arguments[4] : undefined;
    let targetTypeAny = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
    let keepUnit = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    if (isPathAnnotationExpression(oPropertyDataModelObjectPath.targetObject) && oPropertyDataModelObjectPath.targetObject.$target) {
      const oNavPath = oPropertyDataModelObjectPath.targetEntityType.resolvePath(oPropertyDataModelObjectPath.targetObject.path, true);
      oPropertyDataModelObjectPath.targetObject = oNavPath.target;
      oNavPath.visitedObjects.forEach(oNavObj => {
        if (isNavigationProperty(oNavObj)) {
          oPropertyDataModelObjectPath.navigationProperties.push(oNavObj);
        }
      });
    }
    const targetObject = oPropertyDataModelObjectPath.targetObject;
    if (isProperty(targetObject)) {
      let oBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
      if (isPathInModelExpression(oBindingExpression)) {
        var _targetObject$annotat, _targetObject$annotat2, _targetObject$annotat3, _targetObject$annotat4, _targetObject$annotat5, _targetObject$annotat6;
        if ((_targetObject$annotat = targetObject.annotations) !== null && _targetObject$annotat !== void 0 && (_targetObject$annotat2 = _targetObject$annotat.Communication) !== null && _targetObject$annotat2 !== void 0 && _targetObject$annotat2.IsEmailAddress) {
          oBindingExpression.type = "sap.fe.core.type.Email";
        } else if (!ignoreUnit && ((_targetObject$annotat3 = targetObject.annotations) !== null && _targetObject$annotat3 !== void 0 && (_targetObject$annotat4 = _targetObject$annotat3.Measures) !== null && _targetObject$annotat4 !== void 0 && _targetObject$annotat4.ISOCurrency || (_targetObject$annotat5 = targetObject.annotations) !== null && _targetObject$annotat5 !== void 0 && (_targetObject$annotat6 = _targetObject$annotat5.Measures) !== null && _targetObject$annotat6 !== void 0 && _targetObject$annotat6.Unit)) {
          oBindingExpression = UIFormatters.getBindingWithUnitOrCurrency(oPropertyDataModelObjectPath, oBindingExpression, true, keepUnit ? undefined : {
            showMeasure: false
          });
        } else {
          var _oPropertyDataModelOb16, _oPropertyDataModelOb17;
          const oTimezone = (_oPropertyDataModelOb16 = oPropertyDataModelObjectPath.targetObject.annotations) === null || _oPropertyDataModelOb16 === void 0 ? void 0 : (_oPropertyDataModelOb17 = _oPropertyDataModelOb16.Common) === null || _oPropertyDataModelOb17 === void 0 ? void 0 : _oPropertyDataModelOb17.Timezone;
          if (oTimezone) {
            oBindingExpression = UIFormatters.getBindingWithTimezone(oPropertyDataModelObjectPath, oBindingExpression, true);
          } else {
            oBindingExpression = formatWithTypeInformation(targetObject, oBindingExpression);
          }
          if (isPathInModelExpression(oBindingExpression) && oBindingExpression.type === "sap.ui.model.odata.type.String") {
            oBindingExpression.formatOptions = {
              parseKeepsEmptyString: true
            };
          }
        }
        if (isPathInModelExpression(oBindingExpression)) {
          if (ignoreFormatting) {
            delete oBindingExpression.formatOptions;
            delete oBindingExpression.constraints;
            delete oBindingExpression.type;
          }
          if (bindingParameters) {
            oBindingExpression.parameters = bindingParameters;
          }
          if (targetTypeAny) {
            oBindingExpression.targetType = "any";
          }
        }
        return compileExpression(oBindingExpression);
      } else {
        // if somehow we could not compile the binding -> return empty string
        return "";
      }
    } else if ((targetObject === null || targetObject === void 0 ? void 0 : targetObject.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || (targetObject === null || targetObject === void 0 ? void 0 : targetObject.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath") {
      return compileExpression(getExpressionFromAnnotation(targetObject.Value));
    } else {
      return "";
    }
  };
  _exports.getValueBinding = getValueBinding;
  const getAssociatedTextBinding = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    const textPropertyPath = PropertyHelper.getAssociatedTextPropertyPath(oPropertyDataModelObjectPath.targetObject);
    if (textPropertyPath) {
      const oTextPropertyPath = enhanceDataModelPath(oPropertyDataModelObjectPath, textPropertyPath);
      return getValueBinding(oTextPropertyPath, fieldFormatOptions, true, true, {
        $$noPatch: true
      });
    }
    return undefined;
  };
  _exports.getAssociatedTextBinding = getAssociatedTextBinding;
  const isUsedInNavigationWithQuickViewFacets = function (oDataModelPath, oProperty) {
    var _oDataModelPath$targe, _oDataModelPath$targe2, _oDataModelPath$targe3, _oDataModelPath$targe4, _oDataModelPath$conte;
    const aNavigationProperties = (oDataModelPath === null || oDataModelPath === void 0 ? void 0 : (_oDataModelPath$targe = oDataModelPath.targetEntityType) === null || _oDataModelPath$targe === void 0 ? void 0 : _oDataModelPath$targe.navigationProperties) || [];
    const aSemanticObjects = (oDataModelPath === null || oDataModelPath === void 0 ? void 0 : (_oDataModelPath$targe2 = oDataModelPath.targetEntityType) === null || _oDataModelPath$targe2 === void 0 ? void 0 : (_oDataModelPath$targe3 = _oDataModelPath$targe2.annotations) === null || _oDataModelPath$targe3 === void 0 ? void 0 : (_oDataModelPath$targe4 = _oDataModelPath$targe3.Common) === null || _oDataModelPath$targe4 === void 0 ? void 0 : _oDataModelPath$targe4.SemanticKey) || [];
    let bIsUsedInNavigationWithQuickViewFacets = false;
    aNavigationProperties.forEach(oNavProp => {
      if (oNavProp.referentialConstraint && oNavProp.referentialConstraint.length) {
        oNavProp.referentialConstraint.forEach(oRefConstraint => {
          if ((oRefConstraint === null || oRefConstraint === void 0 ? void 0 : oRefConstraint.sourceProperty) === oProperty.name) {
            var _oNavProp$targetType, _oNavProp$targetType$, _oNavProp$targetType$2;
            if (oNavProp !== null && oNavProp !== void 0 && (_oNavProp$targetType = oNavProp.targetType) !== null && _oNavProp$targetType !== void 0 && (_oNavProp$targetType$ = _oNavProp$targetType.annotations) !== null && _oNavProp$targetType$ !== void 0 && (_oNavProp$targetType$2 = _oNavProp$targetType$.UI) !== null && _oNavProp$targetType$2 !== void 0 && _oNavProp$targetType$2.QuickViewFacets) {
              bIsUsedInNavigationWithQuickViewFacets = true;
            }
          }
        });
      }
    });
    if (((_oDataModelPath$conte = oDataModelPath.contextLocation) === null || _oDataModelPath$conte === void 0 ? void 0 : _oDataModelPath$conte.targetEntitySet) !== oDataModelPath.targetEntitySet) {
      var _oDataModelPath$targe5, _oDataModelPath$targe6, _oDataModelPath$targe7;
      const aIsTargetSemanticKey = aSemanticObjects.some(function (oSemantic) {
        var _oSemantic$$target;
        return (oSemantic === null || oSemantic === void 0 ? void 0 : (_oSemantic$$target = oSemantic.$target) === null || _oSemantic$$target === void 0 ? void 0 : _oSemantic$$target.name) === oProperty.name;
      });
      if ((aIsTargetSemanticKey || oProperty.isKey) && oDataModelPath !== null && oDataModelPath !== void 0 && (_oDataModelPath$targe5 = oDataModelPath.targetEntityType) !== null && _oDataModelPath$targe5 !== void 0 && (_oDataModelPath$targe6 = _oDataModelPath$targe5.annotations) !== null && _oDataModelPath$targe6 !== void 0 && (_oDataModelPath$targe7 = _oDataModelPath$targe6.UI) !== null && _oDataModelPath$targe7 !== void 0 && _oDataModelPath$targe7.QuickViewFacets) {
        bIsUsedInNavigationWithQuickViewFacets = true;
      }
    }
    return bIsUsedInNavigationWithQuickViewFacets;
  };
  _exports.isUsedInNavigationWithQuickViewFacets = isUsedInNavigationWithQuickViewFacets;
  const isRetrieveTextFromValueListEnabled = function (oPropertyPath, fieldFormatOptions) {
    var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation3;
    const oProperty = isPathAnnotationExpression(oPropertyPath) && oPropertyPath.$target || oPropertyPath;
    if (!((_oProperty$annotation = oProperty.annotations) !== null && _oProperty$annotation !== void 0 && (_oProperty$annotation2 = _oProperty$annotation.Common) !== null && _oProperty$annotation2 !== void 0 && _oProperty$annotation2.Text) && !((_oProperty$annotation3 = oProperty.annotations) !== null && _oProperty$annotation3 !== void 0 && _oProperty$annotation3.Measures) && PropertyHelper.hasValueHelp(oProperty) && fieldFormatOptions.textAlignMode === "Form") {
      return true;
    }
    return false;
  };

  /**
   * Calculates text alignment based on the dataModelObjectPath.
   *
   * @param dataFieldModelPath The property's type
   * @param formatOptions The field format options
   * @param computedEditMode The editMode used in this case
   * @returns The property alignment
   */
  _exports.isRetrieveTextFromValueListEnabled = isRetrieveTextFromValueListEnabled;
  const getTextAlignment = function (dataFieldModelPath, formatOptions, computedEditMode) {
    var _dataFieldModelPath$t, _dataFieldModelPath$t2, _dataFieldModelPath$t3, _dataFieldModelPath$t4, _dataFieldModelPath$t5, _dataFieldModelPath$t6;
    // check for the target value type directly, or in case it is pointing to a DataPoint we look at the dataPoint's value
    let sType = ((_dataFieldModelPath$t = dataFieldModelPath.targetObject.Value) === null || _dataFieldModelPath$t === void 0 ? void 0 : _dataFieldModelPath$t.$target.type) || ((_dataFieldModelPath$t2 = dataFieldModelPath.targetObject.Target) === null || _dataFieldModelPath$t2 === void 0 ? void 0 : _dataFieldModelPath$t2.$target.Value.$target.type);
    let annotations;
    if (PropertyHelper.isKey(((_dataFieldModelPath$t3 = dataFieldModelPath.targetObject.Value) === null || _dataFieldModelPath$t3 === void 0 ? void 0 : _dataFieldModelPath$t3.$target) || ((_dataFieldModelPath$t4 = dataFieldModelPath.targetObject.Target) === null || _dataFieldModelPath$t4 === void 0 ? void 0 : (_dataFieldModelPath$t5 = _dataFieldModelPath$t4.$target) === null || _dataFieldModelPath$t5 === void 0 ? void 0 : (_dataFieldModelPath$t6 = _dataFieldModelPath$t5.Value) === null || _dataFieldModelPath$t6 === void 0 ? void 0 : _dataFieldModelPath$t6.$target))) {
      return "Begin";
    }
    if (dataFieldModelPath.targetObject.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      annotations = dataFieldModelPath.targetObject.Value.$target.annotations.UI;
      sType = FieldHelper.getDataTypeForVisualization(annotations, sType);
    }
    return FieldHelper.getPropertyAlignment(sType, formatOptions, computedEditMode);
  };

  /**
   * Returns the binding expression to evaluate the visibility of a DataField or DataPoint annotation.
   *
   * SAP Fiori elements will evaluate either the UI.Hidden annotation defined on the annotation itself or on the target property.
   *
   * @param dataFieldModelPath The metapath referring to the annotation we are evaluating.
   * @param [formatOptions] FormatOptions optional.
   * @param formatOptions.isAnalytics This flag is set when using an analytical table.
   * @returns An expression that you can bind to the UI.
   */
  _exports.getTextAlignment = getTextAlignment;
  const getVisibleExpression = function (dataFieldModelPath, formatOptions) {
    var _targetObject$Target, _targetObject$Target$, _targetObject$annotat7, _targetObject$annotat8, _propertyValue$annota, _propertyValue$annota2;
    const targetObject = dataFieldModelPath.targetObject;
    let propertyValue;
    if (targetObject) {
      switch (targetObject.$Type) {
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        case "com.sap.vocabularies.UI.v1.DataPointType":
          propertyValue = targetObject.Value.$target;
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          // if it is a DataFieldForAnnotation pointing to a DataPoint we look at the dataPoint's value
          if ((targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$Target = targetObject.Target) === null || _targetObject$Target === void 0 ? void 0 : (_targetObject$Target$ = _targetObject$Target.$target) === null || _targetObject$Target$ === void 0 ? void 0 : _targetObject$Target$.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            var _targetObject$Target$2;
            propertyValue = (_targetObject$Target$2 = targetObject.Target.$target) === null || _targetObject$Target$2 === void 0 ? void 0 : _targetObject$Target$2.Value.$target;
            break;
          }
        // eslint-disable-next-line no-fallthrough
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        default:
          propertyValue = undefined;
      }
    }
    const isAnalyticalGroupHeaderExpanded = formatOptions !== null && formatOptions !== void 0 && formatOptions.isAnalytics ? UI.IsExpanded : constant(false);
    const isAnalyticalLeaf = formatOptions !== null && formatOptions !== void 0 && formatOptions.isAnalytics ? equal(UI.NodeLevel, 0) : constant(false);

    // A data field is visible if:
    // - the UI.Hidden expression in the original annotation does not evaluate to 'true'
    // - the UI.Hidden expression in the target property does not evaluate to 'true'
    // - in case of Analytics it's not visible for an expanded GroupHeader
    return compileExpression(and(...[not(equal(getExpressionFromAnnotation(targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$annotat7 = targetObject.annotations) === null || _targetObject$annotat7 === void 0 ? void 0 : (_targetObject$annotat8 = _targetObject$annotat7.UI) === null || _targetObject$annotat8 === void 0 ? void 0 : _targetObject$annotat8.Hidden), true)), ifElse(!!propertyValue, propertyValue && not(equal(getExpressionFromAnnotation((_propertyValue$annota = propertyValue.annotations) === null || _propertyValue$annota === void 0 ? void 0 : (_propertyValue$annota2 = _propertyValue$annota.UI) === null || _propertyValue$annota2 === void 0 ? void 0 : _propertyValue$annota2.Hidden), true)), true), or(not(isAnalyticalGroupHeaderExpanded), isAnalyticalLeaf)]));
  };
  _exports.getVisibleExpression = getVisibleExpression;
  const QVTextBinding = function (oPropertyDataModelObjectPath, oPropertyValueDataModelObjectPath, fieldFormatOptions) {
    let asObject = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let returnValue = getValueBinding(oPropertyDataModelObjectPath, fieldFormatOptions, asObject);
    if (returnValue === "") {
      returnValue = getTextBinding(oPropertyValueDataModelObjectPath, fieldFormatOptions, asObject);
    }
    return returnValue;
  };
  _exports.QVTextBinding = QVTextBinding;
  const getQuickViewType = function (oPropertyDataModelObjectPath) {
    var _targetObject$$target, _targetObject$$target2, _targetObject$$target3, _targetObject$$target4, _targetObject$$target5, _targetObject$$target6;
    const targetObject = oPropertyDataModelObjectPath.targetObject;
    if (targetObject !== null && targetObject !== void 0 && (_targetObject$$target = targetObject.$target) !== null && _targetObject$$target !== void 0 && (_targetObject$$target2 = _targetObject$$target.annotations) !== null && _targetObject$$target2 !== void 0 && (_targetObject$$target3 = _targetObject$$target2.Communication) !== null && _targetObject$$target3 !== void 0 && _targetObject$$target3.IsEmailAddress) {
      return "email";
    }
    if (targetObject !== null && targetObject !== void 0 && (_targetObject$$target4 = targetObject.$target) !== null && _targetObject$$target4 !== void 0 && (_targetObject$$target5 = _targetObject$$target4.annotations) !== null && _targetObject$$target5 !== void 0 && (_targetObject$$target6 = _targetObject$$target5.Communication) !== null && _targetObject$$target6 !== void 0 && _targetObject$$target6.IsPhoneNumber) {
      return "phone";
    }
    return "text";
  };
  _exports.getQuickViewType = getQuickViewType;
  /**
   * Get the customData key value pair of SemanticObjects.
   *
   * @param propertyAnnotations The value of the Common annotation.
   * @param [dynamicSemanticObjectsOnly] Flag for retrieving dynamic Semantic Objects only.
   * @returns The array of the semantic Objects.
   */
  const getSemanticObjectExpressionToResolve = function (propertyAnnotations, dynamicSemanticObjectsOnly) {
    const aSemObjExprToResolve = [];
    let sSemObjExpression;
    let annotation;
    if (propertyAnnotations) {
      const semanticObjectsKeys = Object.keys(propertyAnnotations).filter(function (element) {
        return element === "SemanticObject" || element.startsWith("SemanticObject#");
      });
      for (const semanticObject of semanticObjectsKeys) {
        annotation = propertyAnnotations[semanticObject];
        sSemObjExpression = compileExpression(getExpressionFromAnnotation(annotation));
        if (!dynamicSemanticObjectsOnly || dynamicSemanticObjectsOnly && isPathAnnotationExpression(annotation)) {
          aSemObjExprToResolve.push({
            key: getDynamicPathFromSemanticObject(sSemObjExpression) || sSemObjExpression,
            value: sSemObjExpression
          });
        }
      }
    }
    return aSemObjExprToResolve;
  };
  _exports.getSemanticObjectExpressionToResolve = getSemanticObjectExpressionToResolve;
  const getSemanticObjects = function (aSemObjExprToResolve) {
    if (aSemObjExprToResolve.length > 0) {
      let sCustomDataKey = "";
      let sCustomDataValue = "";
      const aSemObjCustomData = [];
      for (let iSemObjCount = 0; iSemObjCount < aSemObjExprToResolve.length; iSemObjCount++) {
        sCustomDataKey = aSemObjExprToResolve[iSemObjCount].key;
        sCustomDataValue = compileExpression(getExpressionFromAnnotation(aSemObjExprToResolve[iSemObjCount].value));
        aSemObjCustomData.push({
          key: sCustomDataKey,
          value: sCustomDataValue
        });
      }
      const oSemanticObjectsModel = new JSONModel(aSemObjCustomData);
      oSemanticObjectsModel.$$valueAsPromise = true;
      const oSemObjBindingContext = oSemanticObjectsModel.createBindingContext("/");
      return oSemObjBindingContext;
    } else {
      return new JSONModel([]).createBindingContext("/");
    }
  };

  /**
   * Method to get MultipleLines for a DataField.
   *
   * @name getMultipleLinesForDataField
   * @param {any} oThis The current object
   * @param {string} sPropertyType The property type
   * @param {boolean} isMultiLineText The property isMultiLineText
   * @returns {CompiledBindingToolkitExpression<string>} The binding expression to determine if a data field should be a MultiLineText or not
   * @public
   */
  _exports.getSemanticObjects = getSemanticObjects;
  const getMultipleLinesForDataField = function (oThis, sPropertyType, isMultiLineText) {
    if (oThis.wrap === false) {
      return false;
    }
    if (sPropertyType !== "Edm.String") {
      return isMultiLineText;
    }
    if (oThis.editMode === "Display") {
      return true;
    }
    if (oThis.editMode.indexOf("{") > -1) {
      // If the editMode is computed then we just care about the page editMode to determine if the multiline property should be taken into account
      return compileExpression(or(not(UI.IsEditable), isMultiLineText));
    }
    return isMultiLineText;
  };
  _exports.getMultipleLinesForDataField = getMultipleLinesForDataField;
  const _hasValueHelpToShow = function (oProperty, measureDisplayMode) {
    // we show a value help if teh property has one or if its visible unit has one
    const oPropertyUnit = PropertyHelper.getAssociatedUnitProperty(oProperty);
    const oPropertyCurrency = PropertyHelper.getAssociatedCurrencyProperty(oProperty);
    return PropertyHelper.hasValueHelp(oProperty) && oProperty.type !== "Edm.Boolean" || measureDisplayMode !== "Hidden" && (oPropertyUnit && PropertyHelper.hasValueHelp(oPropertyUnit) || oPropertyCurrency && PropertyHelper.hasValueHelp(oPropertyCurrency));
  };

  /**
   * Sets Edit Style properties for Field in case of Macro Field and MassEditDialog fields.
   *
   * @param oProps Field Properties for the Macro Field.
   * @param oDataField DataField Object.
   * @param oDataModelPath DataModel Object Path to the property.
   * @param onlyEditStyle To add only editStyle.
   */
  const setEditStyleProperties = function (oProps, oDataField, oDataModelPath, onlyEditStyle) {
    var _oDataField$Target, _oProps$formatOptions, _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6, _oProperty$annotation7, _oProperty$annotation8, _oProps$formatOptions3, _oProperty$annotation9, _oProperty$annotation10, _oProperty$annotation11, _oProperty$annotation12;
    const oProperty = oDataModelPath.targetObject;
    if (!isProperty(oProperty) || ["com.sap.vocabularies.UI.v1.DataFieldForAction", "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath", "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"].includes(oDataField.$Type)) {
      oProps.editStyle = null;
      return;
    }
    if (!onlyEditStyle) {
      var _oDataField$annotatio, _oDataField$annotatio2, _oDataField$Value, _oDataField$Value$$ta, _oDataField$Value$$ta2, _oDataField$Value$$ta3;
      oProps.valueBindingExpression = getValueBinding(oDataModelPath, oProps.formatOptions);
      const editStylePlaceholder = ((_oDataField$annotatio = oDataField.annotations) === null || _oDataField$annotatio === void 0 ? void 0 : (_oDataField$annotatio2 = _oDataField$annotatio.UI) === null || _oDataField$annotatio2 === void 0 ? void 0 : _oDataField$annotatio2.Placeholder) || ((_oDataField$Value = oDataField.Value) === null || _oDataField$Value === void 0 ? void 0 : (_oDataField$Value$$ta = _oDataField$Value.$target) === null || _oDataField$Value$$ta === void 0 ? void 0 : (_oDataField$Value$$ta2 = _oDataField$Value$$ta.annotations) === null || _oDataField$Value$$ta2 === void 0 ? void 0 : (_oDataField$Value$$ta3 = _oDataField$Value$$ta2.UI) === null || _oDataField$Value$$ta3 === void 0 ? void 0 : _oDataField$Value$$ta3.Placeholder);
      if (editStylePlaceholder) {
        oProps.editStylePlaceholder = compileExpression(getExpressionFromAnnotation(editStylePlaceholder));
      }
    }

    // Setup RatingIndicator
    const dataPointAnnotation = isDataFieldForAnnotation(oDataField) ? (_oDataField$Target = oDataField.Target) === null || _oDataField$Target === void 0 ? void 0 : _oDataField$Target.$target : oDataField;
    if ((dataPointAnnotation === null || dataPointAnnotation === void 0 ? void 0 : dataPointAnnotation.Visualization) === "UI.VisualizationType/Rating") {
      var _dataPointAnnotation$, _dataPointAnnotation$2;
      oProps.editStyle = "RatingIndicator";
      if ((_dataPointAnnotation$ = dataPointAnnotation.annotations) !== null && _dataPointAnnotation$ !== void 0 && (_dataPointAnnotation$2 = _dataPointAnnotation$.Common) !== null && _dataPointAnnotation$2 !== void 0 && _dataPointAnnotation$2.QuickInfo) {
        var _dataPointAnnotation$3, _dataPointAnnotation$4;
        oProps.ratingIndicatorTooltip = compileExpression(getExpressionFromAnnotation((_dataPointAnnotation$3 = dataPointAnnotation.annotations) === null || _dataPointAnnotation$3 === void 0 ? void 0 : (_dataPointAnnotation$4 = _dataPointAnnotation$3.Common) === null || _dataPointAnnotation$4 === void 0 ? void 0 : _dataPointAnnotation$4.QuickInfo));
      }
      oProps.ratingIndicatorTargetValue = compileExpression(getExpressionFromAnnotation(dataPointAnnotation.TargetValue));
      return;
    }
    if (_hasValueHelpToShow(oProperty, (_oProps$formatOptions = oProps.formatOptions) === null || _oProps$formatOptions === void 0 ? void 0 : _oProps$formatOptions.measureDisplayMode)) {
      if (!onlyEditStyle) {
        var _oProps$formatOptions2;
        oProps.textBindingExpression = getAssociatedTextBinding(oDataModelPath, oProps.formatOptions);
        if (((_oProps$formatOptions2 = oProps.formatOptions) === null || _oProps$formatOptions2 === void 0 ? void 0 : _oProps$formatOptions2.measureDisplayMode) !== "Hidden") {
          // for the MDC Field we need to keep the unit inside the valueBindingExpression
          oProps.valueBindingExpression = getValueBinding(oDataModelPath, oProps.formatOptions, false, false, undefined, false, true);
        }
      }
      oProps.editStyle = "InputWithValueHelp";
      return;
    }
    switch (oProperty.type) {
      case "Edm.Date":
        oProps.editStyle = "DatePicker";
        return;
      case "Edm.Time":
      case "Edm.TimeOfDay":
        oProps.editStyle = "TimePicker";
        return;
      case "Edm.DateTime":
      case "Edm.DateTimeOffset":
        oProps.editStyle = "DateTimePicker";
        // No timezone defined. Also for compatibility reasons.
        if (!((_oProperty$annotation4 = oProperty.annotations) !== null && _oProperty$annotation4 !== void 0 && (_oProperty$annotation5 = _oProperty$annotation4.Common) !== null && _oProperty$annotation5 !== void 0 && _oProperty$annotation5.Timezone)) {
          oProps.showTimezone = undefined;
        } else {
          oProps.showTimezone = true;
        }
        return;
      case "Edm.Boolean":
        oProps.editStyle = "CheckBox";
        return;
      case "Edm.Stream":
        oProps.editStyle = "File";
        return;
      case "Edm.String":
        if ((_oProperty$annotation6 = oProperty.annotations) !== null && _oProperty$annotation6 !== void 0 && (_oProperty$annotation7 = _oProperty$annotation6.UI) !== null && _oProperty$annotation7 !== void 0 && (_oProperty$annotation8 = _oProperty$annotation7.MultiLineText) !== null && _oProperty$annotation8 !== void 0 && _oProperty$annotation8.valueOf()) {
          oProps.editStyle = "TextArea";
          return;
        }
        break;
      default:
        oProps.editStyle = "Input";
    }
    if (((_oProps$formatOptions3 = oProps.formatOptions) === null || _oProps$formatOptions3 === void 0 ? void 0 : _oProps$formatOptions3.measureDisplayMode) !== "Hidden" && ((_oProperty$annotation9 = oProperty.annotations) !== null && _oProperty$annotation9 !== void 0 && (_oProperty$annotation10 = _oProperty$annotation9.Measures) !== null && _oProperty$annotation10 !== void 0 && _oProperty$annotation10.ISOCurrency || (_oProperty$annotation11 = oProperty.annotations) !== null && _oProperty$annotation11 !== void 0 && (_oProperty$annotation12 = _oProperty$annotation11.Measures) !== null && _oProperty$annotation12 !== void 0 && _oProperty$annotation12.Unit)) {
      if (!onlyEditStyle) {
        oProps.unitBindingExpression = compileExpression(UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
        oProps.descriptionBindingExpression = UIFormatters.ifUnitEditable(oProperty, "", UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
        const unitProperty = PropertyHelper.getAssociatedCurrencyProperty(oProperty) || PropertyHelper.getAssociatedUnitProperty(oProperty);
        oProps.staticUnit = unitProperty ? undefined : getStaticUnitWithLocale(oProperty);
        oProps.unitEditable = oProps.formatOptions.measureDisplayMode === "ReadOnly" ? "false" : compileExpression(not(isReadOnlyExpression(unitProperty)));
        oProps.valueInputWidth = ifUnitEditable(oProperty, "70%", "100%");
        oProps.valueInputFieldWidth = ifUnitEditable(oProperty, "100%", "70%");
        oProps.unitInputVisible = ifUnitEditable(oProperty, true, false);
      }
      oProps.editStyle = "InputWithUnit";
      return;
    }
    oProps.editStyle = "Input";
  };

  /**
   * Returns the unit or currency  value using the locale if the annotation value is a unit key.
   *
   * @param property Property with a static unit or currency
   * @returns The value for the unit/currency
   */
  _exports.setEditStyleProperties = setEditStyleProperties;
  const getStaticUnitWithLocale = property => {
    var _property$annotations, _property$annotations2, _property$annotations3, _property$annotations4, _property$annotations5, _property$annotations6, _unitFormat$oLocaleDa, _localeData$units;
    let unit = ((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Measures) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.Unit) === null || _property$annotations3 === void 0 ? void 0 : _property$annotations3.valueOf()) || (property === null || property === void 0 ? void 0 : (_property$annotations4 = property.annotations) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.Measures) === null || _property$annotations5 === void 0 ? void 0 : (_property$annotations6 = _property$annotations5.ISOCurrency) === null || _property$annotations6 === void 0 ? void 0 : _property$annotations6.valueOf());
    // this is a hack of UI5 locale data to retrieve the localized text for the unit key where we access UI5 private structure
    const unitFormat = NumberFormat.getUnitInstance();
    const localeData = unitFormat === null || unitFormat === void 0 ? void 0 : (_unitFormat$oLocaleDa = unitFormat.oLocaleData) === null || _unitFormat$oLocaleDa === void 0 ? void 0 : _unitFormat$oLocaleDa.mData;
    if (localeData !== null && localeData !== void 0 && (_localeData$units = localeData.units) !== null && _localeData$units !== void 0 && _localeData$units.short && localeData.units.short[unit] && localeData.units.short[unit].displayName) {
      unit = localeData.units.short[unit].displayName;
    }
    return unit;
  };
  _exports.getStaticUnitWithLocale = getStaticUnitWithLocale;
  const hasSemanticObjectInNavigationOrProperty = propertyDataModelObjectPath => {
    var _propertyDataModelObj, _propertyDataModelObj2, _propertyDataModelObj3, _propertyDataModelObj4;
    const property = propertyDataModelObjectPath.targetObject;
    if (SemanticObjectHelper.hasSemanticObject(property)) {
      return true;
    }
    const lastNavProp = propertyDataModelObjectPath !== null && propertyDataModelObjectPath !== void 0 && (_propertyDataModelObj = propertyDataModelObjectPath.navigationProperties) !== null && _propertyDataModelObj !== void 0 && _propertyDataModelObj.length ? propertyDataModelObjectPath === null || propertyDataModelObjectPath === void 0 ? void 0 : propertyDataModelObjectPath.navigationProperties[(propertyDataModelObjectPath === null || propertyDataModelObjectPath === void 0 ? void 0 : (_propertyDataModelObj2 = propertyDataModelObjectPath.navigationProperties) === null || _propertyDataModelObj2 === void 0 ? void 0 : _propertyDataModelObj2.length) - 1] : null;
    if (!lastNavProp || (_propertyDataModelObj3 = propertyDataModelObjectPath.contextLocation) !== null && _propertyDataModelObj3 !== void 0 && (_propertyDataModelObj4 = _propertyDataModelObj3.navigationProperties) !== null && _propertyDataModelObj4 !== void 0 && _propertyDataModelObj4.find(contextNavProp => contextNavProp.name === lastNavProp.name)) {
      return false;
    }
    return SemanticObjectHelper.hasSemanticObject(lastNavProp);
  };

  /**
   * Get the dataModelObjectPath with the value property as targetObject if it exists
   * for a dataModelObjectPath targeting a DataField or a DataPoint annotation.
   *
   * @param initialDataModelObjectPath
   * @returns The dataModelObjectPath targetiing the value property or undefined
   */
  _exports.hasSemanticObjectInNavigationOrProperty = hasSemanticObjectInNavigationOrProperty;
  const getDataModelObjectPathForValue = initialDataModelObjectPath => {
    if (!initialDataModelObjectPath.targetObject) {
      return undefined;
    }
    let valuePath = "";
    // data point annotations need not have $Type defined, so add it if missing
    if (initialDataModelObjectPath.targetObject.term === "com.sap.vocabularies.UI.v1.DataPoint") {
      initialDataModelObjectPath.targetObject.$Type = initialDataModelObjectPath.targetObject.$Type || "com.sap.vocabularies.UI.v1.DataPointType";
    }
    switch (initialDataModelObjectPath.targetObject.$Type) {
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataPointType":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        if (typeof initialDataModelObjectPath.targetObject.Value === "object") {
          valuePath = initialDataModelObjectPath.targetObject.Value.path;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        if (initialDataModelObjectPath.targetObject.Target.$target) {
          if (initialDataModelObjectPath.targetObject.Target.$target.$Type === "com.sap.vocabularies.UI.v1.DataField" || initialDataModelObjectPath.targetObject.Target.$target.$Type === "com.sap.vocabularies.UI.v1.DataPointType") {
            if (initialDataModelObjectPath.targetObject.Target.value.indexOf("/") > 0) {
              var _initialDataModelObje;
              valuePath = initialDataModelObjectPath.targetObject.Target.value.replace(/\/@.*/, `/${(_initialDataModelObje = initialDataModelObjectPath.targetObject.Target.$target.Value) === null || _initialDataModelObje === void 0 ? void 0 : _initialDataModelObje.path}`);
            } else {
              var _initialDataModelObje2;
              valuePath = (_initialDataModelObje2 = initialDataModelObjectPath.targetObject.Target.$target.Value) === null || _initialDataModelObje2 === void 0 ? void 0 : _initialDataModelObje2.path;
            }
          } else {
            var _initialDataModelObje3;
            valuePath = (_initialDataModelObje3 = initialDataModelObjectPath.targetObject.Target) === null || _initialDataModelObje3 === void 0 ? void 0 : _initialDataModelObje3.path;
          }
        }
        break;
    }
    if (valuePath && valuePath.length > 0) {
      return enhanceDataModelPath(initialDataModelObjectPath, valuePath);
    } else {
      return undefined;
    }
  };

  /**
   * Get the property or the navigation property in  its relative path that holds semanticObject annotation if it exists.
   *
   * @param dataModelObjectPath
   * @returns A property or a NavProperty or undefined
   */
  _exports.getDataModelObjectPathForValue = getDataModelObjectPathForValue;
  const getPropertyWithSemanticObject = dataModelObjectPath => {
    let propertyWithSemanticObject;
    if (hasSemanticObject(dataModelObjectPath.targetObject)) {
      propertyWithSemanticObject = dataModelObjectPath.targetObject;
    } else if (dataModelObjectPath.navigationProperties.length > 0) {
      // there are no semantic objects on the property itself so we look for some on nav properties
      for (const navProperty of dataModelObjectPath.navigationProperties) {
        var _dataModelObjectPath$;
        if (!((_dataModelObjectPath$ = dataModelObjectPath.contextLocation) !== null && _dataModelObjectPath$ !== void 0 && _dataModelObjectPath$.navigationProperties.find(contextNavProp => contextNavProp.fullyQualifiedName === navProperty.fullyQualifiedName)) && !propertyWithSemanticObject && hasSemanticObject(navProperty)) {
          propertyWithSemanticObject = navProperty;
        }
      }
    }
    return propertyWithSemanticObject;
  };

  /**
   * Check if the considered property is a non-insertable property
   * A first check is done on the last navigation from the contextLocation:
   * 	- If the annotation 'nonInsertableProperty' is found and the property is listed, then the property is non-insertable,
   *  - Else the same check is done on the target entity.
   *
   * @param PropertyDataModelObjectPath
   * @returns True if the property is not insertable
   */
  _exports.getPropertyWithSemanticObject = getPropertyWithSemanticObject;
  const hasPropertyInsertRestrictions = PropertyDataModelObjectPath => {
    var _PropertyDataModelObj, _PropertyDataModelObj2;
    const lastNavProp = (_PropertyDataModelObj = PropertyDataModelObjectPath.contextLocation) === null || _PropertyDataModelObj === void 0 ? void 0 : (_PropertyDataModelObj2 = _PropertyDataModelObj.navigationProperties) === null || _PropertyDataModelObj2 === void 0 ? void 0 : _PropertyDataModelObj2.slice(-1)[0];
    const isAnnotatedWithNonInsertableProperties = function (object) {
      var _object$annotations, _object$annotations$C, _object$annotations$C2;
      return !!(object !== null && object !== void 0 && (_object$annotations = object.annotations) !== null && _object$annotations !== void 0 && (_object$annotations$C = _object$annotations.Capabilities) !== null && _object$annotations$C !== void 0 && (_object$annotations$C2 = _object$annotations$C.InsertRestrictions) !== null && _object$annotations$C2 !== void 0 && _object$annotations$C2.NonInsertableProperties);
    };
    const isListedInNonInsertableProperties = function (object) {
      var _object$annotations2, _object$annotations2$, _object$annotations2$2, _object$annotations2$3;
      return !!(object !== null && object !== void 0 && (_object$annotations2 = object.annotations) !== null && _object$annotations2 !== void 0 && (_object$annotations2$ = _object$annotations2.Capabilities) !== null && _object$annotations2$ !== void 0 && (_object$annotations2$2 = _object$annotations2$.InsertRestrictions) !== null && _object$annotations2$2 !== void 0 && (_object$annotations2$3 = _object$annotations2$2.NonInsertableProperties) !== null && _object$annotations2$3 !== void 0 && _object$annotations2$3.some(nonInsertableProperty => {
        var _nonInsertablePropert, _PropertyDataModelObj3;
        return (nonInsertableProperty === null || nonInsertableProperty === void 0 ? void 0 : (_nonInsertablePropert = nonInsertableProperty.$target) === null || _nonInsertablePropert === void 0 ? void 0 : _nonInsertablePropert.name) === ((_PropertyDataModelObj3 = PropertyDataModelObjectPath.targetObject) === null || _PropertyDataModelObj3 === void 0 ? void 0 : _PropertyDataModelObj3.name);
      }));
    };
    if (lastNavProp && isAnnotatedWithNonInsertableProperties(lastNavProp)) {
      return isListedInNonInsertableProperties(lastNavProp);
    } else {
      return !!PropertyDataModelObjectPath.targetEntitySet && isListedInNonInsertableProperties(PropertyDataModelObjectPath.targetEntitySet);
    }
  };

  /**
   * Get the binding for the draft indicator visibility.
   *
   * @param draftIndicatorKey
   * @returns  The visibility binding expression.
   */
  _exports.hasPropertyInsertRestrictions = hasPropertyInsertRestrictions;
  const getDraftIndicatorVisibleBinding = draftIndicatorKey => {
    return draftIndicatorKey ? compileExpression(formatResult([constant(draftIndicatorKey), pathInModel("semanticKeyHasDraftIndicator", "internal"), pathInModel("HasDraftEntity"), pathInModel("IsActiveEntity"), pathInModel("hideDraftInfo", "pageInternal")], "sap.fe.macros.field.FieldRuntime.isDraftIndicatorVisible")) : "false";
  };
  _exports.getDraftIndicatorVisibleBinding = getDraftIndicatorVisibleBinding;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhZGRUZXh0QXJyYW5nZW1lbnRUb0JpbmRpbmdFeHByZXNzaW9uIiwiYmluZGluZ0V4cHJlc3Npb25Ub0VuaGFuY2UiLCJmdWxsQ29udGV4dFBhdGgiLCJ0cmFuc2Zvcm1SZWN1cnNpdmVseSIsImV4cHJlc3Npb24iLCJvdXRFeHByZXNzaW9uIiwibW9kZWxOYW1lIiwidW5kZWZpbmVkIiwib1Byb3BlcnR5RGF0YU1vZGVsUGF0aCIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwicGF0aCIsIkNvbW1vbkZvcm1hdHRlcnMiLCJnZXRCaW5kaW5nV2l0aFRleHRBcnJhbmdlbWVudCIsImZvcm1hdFZhbHVlUmVjdXJzaXZlbHkiLCJmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uIiwidGFyZ2V0T2JqZWN0IiwiZ2V0VGV4dEJpbmRpbmdFeHByZXNzaW9uIiwib1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCIsImZpZWxkRm9ybWF0T3B0aW9ucyIsImdldFRleHRCaW5kaW5nIiwiYXNPYmplY3QiLCIkVHlwZSIsImZpZWxkVmFsdWUiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJWYWx1ZSIsImNvbXBpbGVFeHByZXNzaW9uIiwiaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24iLCIkdGFyZ2V0Iiwib1Byb3BlcnR5QmluZGluZ0V4cHJlc3Npb24iLCJwYXRoSW5Nb2RlbCIsImdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgiLCJvVGFyZ2V0QmluZGluZyIsImFubm90YXRpb25zIiwiTWVhc3VyZXMiLCJVbml0IiwiSVNPQ3VycmVuY3kiLCJVSUZvcm1hdHRlcnMiLCJnZXRCaW5kaW5nV2l0aFVuaXRPckN1cnJlbmN5IiwibWVhc3VyZURpc3BsYXlNb2RlIiwiaXNDb21wbGV4VHlwZUV4cHJlc3Npb24iLCJmb3JtYXRPcHRpb25zIiwic2hvd01lYXN1cmUiLCJDb21tb24iLCJUaW1lem9uZSIsImdldEJpbmRpbmdXaXRoVGltZXpvbmUiLCJkYXRlRm9ybWF0T3B0aW9ucyIsImdldFZhbHVlQmluZGluZyIsImlnbm9yZVVuaXQiLCJpZ25vcmVGb3JtYXR0aW5nIiwiYmluZGluZ1BhcmFtZXRlcnMiLCJ0YXJnZXRUeXBlQW55Iiwia2VlcFVuaXQiLCJvTmF2UGF0aCIsInRhcmdldEVudGl0eVR5cGUiLCJyZXNvbHZlUGF0aCIsInRhcmdldCIsInZpc2l0ZWRPYmplY3RzIiwiZm9yRWFjaCIsIm9OYXZPYmoiLCJpc05hdmlnYXRpb25Qcm9wZXJ0eSIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwicHVzaCIsImlzUHJvcGVydHkiLCJvQmluZGluZ0V4cHJlc3Npb24iLCJpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbiIsIkNvbW11bmljYXRpb24iLCJJc0VtYWlsQWRkcmVzcyIsInR5cGUiLCJvVGltZXpvbmUiLCJwYXJzZUtlZXBzRW1wdHlTdHJpbmciLCJjb25zdHJhaW50cyIsInBhcmFtZXRlcnMiLCJ0YXJnZXRUeXBlIiwiZ2V0QXNzb2NpYXRlZFRleHRCaW5kaW5nIiwidGV4dFByb3BlcnR5UGF0aCIsIlByb3BlcnR5SGVscGVyIiwiZ2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eVBhdGgiLCJvVGV4dFByb3BlcnR5UGF0aCIsIiQkbm9QYXRjaCIsImlzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMiLCJvRGF0YU1vZGVsUGF0aCIsIm9Qcm9wZXJ0eSIsImFOYXZpZ2F0aW9uUHJvcGVydGllcyIsImFTZW1hbnRpY09iamVjdHMiLCJTZW1hbnRpY0tleSIsImJJc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzIiwib05hdlByb3AiLCJyZWZlcmVudGlhbENvbnN0cmFpbnQiLCJsZW5ndGgiLCJvUmVmQ29uc3RyYWludCIsInNvdXJjZVByb3BlcnR5IiwibmFtZSIsIlVJIiwiUXVpY2tWaWV3RmFjZXRzIiwiY29udGV4dExvY2F0aW9uIiwidGFyZ2V0RW50aXR5U2V0IiwiYUlzVGFyZ2V0U2VtYW50aWNLZXkiLCJzb21lIiwib1NlbWFudGljIiwiaXNLZXkiLCJpc1JldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3RFbmFibGVkIiwib1Byb3BlcnR5UGF0aCIsIlRleHQiLCJoYXNWYWx1ZUhlbHAiLCJ0ZXh0QWxpZ25Nb2RlIiwiZ2V0VGV4dEFsaWdubWVudCIsImRhdGFGaWVsZE1vZGVsUGF0aCIsImNvbXB1dGVkRWRpdE1vZGUiLCJzVHlwZSIsIlRhcmdldCIsIkZpZWxkSGVscGVyIiwiZ2V0RGF0YVR5cGVGb3JWaXN1YWxpemF0aW9uIiwiZ2V0UHJvcGVydHlBbGlnbm1lbnQiLCJnZXRWaXNpYmxlRXhwcmVzc2lvbiIsInByb3BlcnR5VmFsdWUiLCJpc0FuYWx5dGljYWxHcm91cEhlYWRlckV4cGFuZGVkIiwiaXNBbmFseXRpY3MiLCJJc0V4cGFuZGVkIiwiY29uc3RhbnQiLCJpc0FuYWx5dGljYWxMZWFmIiwiZXF1YWwiLCJOb2RlTGV2ZWwiLCJhbmQiLCJub3QiLCJIaWRkZW4iLCJpZkVsc2UiLCJvciIsIlFWVGV4dEJpbmRpbmciLCJvUHJvcGVydHlWYWx1ZURhdGFNb2RlbE9iamVjdFBhdGgiLCJyZXR1cm5WYWx1ZSIsImdldFF1aWNrVmlld1R5cGUiLCJJc1Bob25lTnVtYmVyIiwiZ2V0U2VtYW50aWNPYmplY3RFeHByZXNzaW9uVG9SZXNvbHZlIiwicHJvcGVydHlBbm5vdGF0aW9ucyIsImR5bmFtaWNTZW1hbnRpY09iamVjdHNPbmx5IiwiYVNlbU9iakV4cHJUb1Jlc29sdmUiLCJzU2VtT2JqRXhwcmVzc2lvbiIsImFubm90YXRpb24iLCJzZW1hbnRpY09iamVjdHNLZXlzIiwiT2JqZWN0Iiwia2V5cyIsImZpbHRlciIsImVsZW1lbnQiLCJzdGFydHNXaXRoIiwic2VtYW50aWNPYmplY3QiLCJrZXkiLCJnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdCIsInZhbHVlIiwiZ2V0U2VtYW50aWNPYmplY3RzIiwic0N1c3RvbURhdGFLZXkiLCJzQ3VzdG9tRGF0YVZhbHVlIiwiYVNlbU9iakN1c3RvbURhdGEiLCJpU2VtT2JqQ291bnQiLCJvU2VtYW50aWNPYmplY3RzTW9kZWwiLCJKU09OTW9kZWwiLCIkJHZhbHVlQXNQcm9taXNlIiwib1NlbU9iakJpbmRpbmdDb250ZXh0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJnZXRNdWx0aXBsZUxpbmVzRm9yRGF0YUZpZWxkIiwib1RoaXMiLCJzUHJvcGVydHlUeXBlIiwiaXNNdWx0aUxpbmVUZXh0Iiwid3JhcCIsImVkaXRNb2RlIiwiaW5kZXhPZiIsIklzRWRpdGFibGUiLCJfaGFzVmFsdWVIZWxwVG9TaG93Iiwib1Byb3BlcnR5VW5pdCIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkiLCJvUHJvcGVydHlDdXJyZW5jeSIsImdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5Iiwic2V0RWRpdFN0eWxlUHJvcGVydGllcyIsIm9Qcm9wcyIsIm9EYXRhRmllbGQiLCJvbmx5RWRpdFN0eWxlIiwiaW5jbHVkZXMiLCJlZGl0U3R5bGUiLCJ2YWx1ZUJpbmRpbmdFeHByZXNzaW9uIiwiZWRpdFN0eWxlUGxhY2Vob2xkZXIiLCJQbGFjZWhvbGRlciIsImRhdGFQb2ludEFubm90YXRpb24iLCJpc0RhdGFGaWVsZEZvckFubm90YXRpb24iLCJWaXN1YWxpemF0aW9uIiwiUXVpY2tJbmZvIiwicmF0aW5nSW5kaWNhdG9yVG9vbHRpcCIsInJhdGluZ0luZGljYXRvclRhcmdldFZhbHVlIiwiVGFyZ2V0VmFsdWUiLCJ0ZXh0QmluZGluZ0V4cHJlc3Npb24iLCJzaG93VGltZXpvbmUiLCJNdWx0aUxpbmVUZXh0IiwidmFsdWVPZiIsInVuaXRCaW5kaW5nRXhwcmVzc2lvbiIsImdldEJpbmRpbmdGb3JVbml0T3JDdXJyZW5jeSIsImRlc2NyaXB0aW9uQmluZGluZ0V4cHJlc3Npb24iLCJpZlVuaXRFZGl0YWJsZSIsInVuaXRQcm9wZXJ0eSIsInN0YXRpY1VuaXQiLCJnZXRTdGF0aWNVbml0V2l0aExvY2FsZSIsInVuaXRFZGl0YWJsZSIsImlzUmVhZE9ubHlFeHByZXNzaW9uIiwidmFsdWVJbnB1dFdpZHRoIiwidmFsdWVJbnB1dEZpZWxkV2lkdGgiLCJ1bml0SW5wdXRWaXNpYmxlIiwicHJvcGVydHkiLCJ1bml0IiwidW5pdEZvcm1hdCIsIk51bWJlckZvcm1hdCIsImdldFVuaXRJbnN0YW5jZSIsImxvY2FsZURhdGEiLCJvTG9jYWxlRGF0YSIsIm1EYXRhIiwidW5pdHMiLCJzaG9ydCIsImRpc3BsYXlOYW1lIiwiaGFzU2VtYW50aWNPYmplY3RJbk5hdmlnYXRpb25PclByb3BlcnR5IiwicHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoIiwiU2VtYW50aWNPYmplY3RIZWxwZXIiLCJoYXNTZW1hbnRpY09iamVjdCIsImxhc3ROYXZQcm9wIiwiZmluZCIsImNvbnRleHROYXZQcm9wIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aEZvclZhbHVlIiwiaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgiLCJ2YWx1ZVBhdGgiLCJ0ZXJtIiwicmVwbGFjZSIsImdldFByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0IiwiZGF0YU1vZGVsT2JqZWN0UGF0aCIsInByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0IiwibmF2UHJvcGVydHkiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJoYXNQcm9wZXJ0eUluc2VydFJlc3RyaWN0aW9ucyIsIlByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCIsInNsaWNlIiwiaXNBbm5vdGF0ZWRXaXRoTm9uSW5zZXJ0YWJsZVByb3BlcnRpZXMiLCJvYmplY3QiLCJDYXBhYmlsaXRpZXMiLCJJbnNlcnRSZXN0cmljdGlvbnMiLCJOb25JbnNlcnRhYmxlUHJvcGVydGllcyIsImlzTGlzdGVkSW5Ob25JbnNlcnRhYmxlUHJvcGVydGllcyIsIm5vbkluc2VydGFibGVQcm9wZXJ0eSIsImdldERyYWZ0SW5kaWNhdG9yVmlzaWJsZUJpbmRpbmciLCJkcmFmdEluZGljYXRvcktleSIsImZvcm1hdFJlc3VsdCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmllbGRUZW1wbGF0aW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW50aXR5U2V0LCBOYXZpZ2F0aW9uUHJvcGVydHksIFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQge1xuXHRDb2xsZWN0aW9uQW5ub3RhdGlvbnNCYXNlX0NhcGFiaWxpdGllcyxcblx0RW50aXR5U2V0QW5ub3RhdGlvbnNfQ2FwYWJpbGl0aWVzXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ2FwYWJpbGl0aWVzX0VkbVwiO1xuaW1wb3J0IHR5cGUge1xuXHREYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHREYXRhRmllbGRXaXRoVXJsLFxuXHREYXRhUG9pbnRUeXBlLFxuXHREYXRhUG9pbnRUeXBlVHlwZXNcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBpc0RhdGFGaWVsZEZvckFubm90YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9hbm5vdGF0aW9ucy9EYXRhRmllbGRcIjtcbmltcG9ydCB7IFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQge1xuXHRhbmQsXG5cdEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbixcblx0Q29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRjb25zdGFudCxcblx0ZXF1YWwsXG5cdGZvcm1hdFJlc3VsdCxcblx0Zm9ybWF0V2l0aFR5cGVJbmZvcm1hdGlvbixcblx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLFxuXHRpZkVsc2UsXG5cdGlzQ29tcGxleFR5cGVFeHByZXNzaW9uLFxuXHRpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbixcblx0bm90LFxuXHRvcixcblx0cGF0aEluTW9kZWwsXG5cdHRyYW5zZm9ybVJlY3Vyc2l2ZWx5XG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBpc05hdmlnYXRpb25Qcm9wZXJ0eSwgaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24sIGlzUHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9UeXBlR3VhcmRzXCI7XG5pbXBvcnQgKiBhcyBDb21tb25Gb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0NvbW1vbkZvcm1hdHRlcnNcIjtcbmltcG9ydCB7IERhdGFNb2RlbE9iamVjdFBhdGgsIGVuaGFuY2VEYXRhTW9kZWxQYXRoLCBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgaXNSZWFkT25seUV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9GaWVsZENvbnRyb2xIZWxwZXJcIjtcbmltcG9ydCAqIGFzIFByb3BlcnR5SGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgKiBhcyBTZW1hbnRpY09iamVjdEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9TZW1hbnRpY09iamVjdEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0RHluYW1pY1BhdGhGcm9tU2VtYW50aWNPYmplY3QsIGhhc1NlbWFudGljT2JqZWN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvU2VtYW50aWNPYmplY3RIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgRGlzcGxheU1vZGUsIFByb3BlcnR5T3JQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgKiBhcyBVSUZvcm1hdHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgeyBpZlVuaXRFZGl0YWJsZSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBGaWVsZFByb3BlcnRpZXMgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9JbnRlcm5hbEZpZWxkLmJsb2NrXCI7XG5pbXBvcnQgTnVtYmVyRm9ybWF0IGZyb20gXCJzYXAvdWkvY29yZS9mb3JtYXQvTnVtYmVyRm9ybWF0XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBGaWVsZEhlbHBlciBmcm9tIFwiLi9GaWVsZEhlbHBlclwiO1xuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGFkZCB0aGUgdGV4dCBhcnJhbmdlbWVudCB0byBhIGJpbmRpbmcgZXhwcmVzc2lvbi5cbiAqXG4gKiBAcGFyYW0gYmluZGluZ0V4cHJlc3Npb25Ub0VuaGFuY2UgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiB0byBiZSBlbmhhbmNlZFxuICogQHBhcmFtIGZ1bGxDb250ZXh0UGF0aCBUaGUgY3VycmVudCBjb250ZXh0IHBhdGggd2UncmUgb24gKHRvIHByb3Blcmx5IHJlc29sdmUgdGhlIHRleHQgYXJyYW5nZW1lbnQgcHJvcGVydGllcylcbiAqIEByZXR1cm5zIEFuIHVwZGF0ZWQgZXhwcmVzc2lvbiBjb250YWluaW5nIHRoZSB0ZXh0IGFycmFuZ2VtZW50IGJpbmRpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBhZGRUZXh0QXJyYW5nZW1lbnRUb0JpbmRpbmdFeHByZXNzaW9uID0gZnVuY3Rpb24gKFxuXHRiaW5kaW5nRXhwcmVzc2lvblRvRW5oYW5jZTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4sXG5cdGZ1bGxDb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4ge1xuXHRyZXR1cm4gdHJhbnNmb3JtUmVjdXJzaXZlbHkoYmluZGluZ0V4cHJlc3Npb25Ub0VuaGFuY2UsIFwiUGF0aEluTW9kZWxcIiwgKGV4cHJlc3Npb24pID0+IHtcblx0XHRsZXQgb3V0RXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4gPSBleHByZXNzaW9uO1xuXHRcdGlmIChleHByZXNzaW9uLm1vZGVsTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBJbiBjYXNlIG9mIGRlZmF1bHQgbW9kZWwgd2UgdGhlbiBuZWVkIHRvIHJlc29sdmUgdGhlIHRleHQgYXJyYW5nZW1lbnQgcHJvcGVydHlcblx0XHRcdGNvbnN0IG9Qcm9wZXJ0eURhdGFNb2RlbFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChmdWxsQ29udGV4dFBhdGgsIGV4cHJlc3Npb24ucGF0aCk7XG5cdFx0XHRvdXRFeHByZXNzaW9uID0gQ29tbW9uRm9ybWF0dGVycy5nZXRCaW5kaW5nV2l0aFRleHRBcnJhbmdlbWVudChvUHJvcGVydHlEYXRhTW9kZWxQYXRoLCBleHByZXNzaW9uKTtcblx0XHR9XG5cdFx0cmV0dXJuIG91dEV4cHJlc3Npb247XG5cdH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGZvcm1hdFZhbHVlUmVjdXJzaXZlbHkgPSBmdW5jdGlvbiAoXG5cdGJpbmRpbmdFeHByZXNzaW9uVG9FbmhhbmNlOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55Pixcblx0ZnVsbENvbnRleHRQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55PiB7XG5cdHJldHVybiB0cmFuc2Zvcm1SZWN1cnNpdmVseShiaW5kaW5nRXhwcmVzc2lvblRvRW5oYW5jZSwgXCJQYXRoSW5Nb2RlbFwiLCAoZXhwcmVzc2lvbikgPT4ge1xuXHRcdGxldCBvdXRFeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55PiA9IGV4cHJlc3Npb247XG5cdFx0aWYgKGV4cHJlc3Npb24ubW9kZWxOYW1lID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIEluIGNhc2Ugb2YgZGVmYXVsdCBtb2RlbCB3ZSB0aGVuIG5lZWQgdG8gcmVzb2x2ZSB0aGUgdGV4dCBhcnJhbmdlbWVudCBwcm9wZXJ0eVxuXHRcdFx0Y29uc3Qgb1Byb3BlcnR5RGF0YU1vZGVsUGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKGZ1bGxDb250ZXh0UGF0aCwgZXhwcmVzc2lvbi5wYXRoKTtcblx0XHRcdG91dEV4cHJlc3Npb24gPSBmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uKG9Qcm9wZXJ0eURhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0LCBleHByZXNzaW9uKTtcblx0XHR9XG5cdFx0cmV0dXJuIG91dEV4cHJlc3Npb247XG5cdH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFRleHRCaW5kaW5nRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChcblx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0ZmllbGRGb3JtYXRPcHRpb25zOiB7IGRpc3BsYXlNb2RlPzogRGlzcGxheU1vZGU7IG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZyB9XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB7XG5cdHJldHVybiBnZXRUZXh0QmluZGluZyhvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBmaWVsZEZvcm1hdE9wdGlvbnMsIHRydWUpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+O1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFRleHRCaW5kaW5nID0gZnVuY3Rpb24gKFxuXHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmaWVsZEZvcm1hdE9wdGlvbnM6IHtcblx0XHRkaXNwbGF5TW9kZT86IERpc3BsYXlNb2RlO1xuXHRcdG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZztcblx0XHRkYXRlRm9ybWF0T3B0aW9ucz86IHsgc2hvd1RpbWU6IHN0cmluZzsgc2hvd0RhdGU6IHN0cmluZzsgc2hvd1RpbWV6b25lOiBzdHJpbmcgfTtcblx0fSxcblx0YXNPYmplY3QgPSBmYWxzZVxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz4gfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGlmIChcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCIgfHxcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50VHlwZVwiIHx8XG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aFwiIHx8XG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhVcmxcIiB8fFxuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uXCIgfHxcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEFjdGlvblwiXG5cdCkge1xuXHRcdC8vIElmIHRoZXJlIGlzIG5vIHJlc29sdmVkIHByb3BlcnR5LCB0aGUgdmFsdWUgaXMgcmV0dXJuZWQgYXMgYSBjb25zdGFudFxuXHRcdGNvbnN0IGZpZWxkVmFsdWUgPSBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVmFsdWUpID8/IFwiXCI7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGZpZWxkVmFsdWUpO1xuXHR9XG5cdGlmIChpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCkgJiYgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuJHRhcmdldCkge1xuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5wYXRoKTtcblx0fVxuXHRjb25zdCBvUHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbiA9IHBhdGhJbk1vZGVsKGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCkpO1xuXHRsZXQgb1RhcmdldEJpbmRpbmc7XG5cdC8vIGZvcm1hdHRpbmdcblx0aWYgKFxuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQgfHxcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeVxuXHQpIHtcblx0XHRvVGFyZ2V0QmluZGluZyA9IFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nV2l0aFVuaXRPckN1cnJlbmN5KG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsIG9Qcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uKTtcblx0XHRpZiAoZmllbGRGb3JtYXRPcHRpb25zPy5tZWFzdXJlRGlzcGxheU1vZGUgPT09IFwiSGlkZGVuXCIgJiYgaXNDb21wbGV4VHlwZUV4cHJlc3Npb24ob1RhcmdldEJpbmRpbmcpKSB7XG5cdFx0XHQvLyBUT0RPOiBSZWZhY3RvciBvbmNlIHR5cGVzIGFyZSBsZXNzIGdlbmVyaWMgaGVyZVxuXHRcdFx0b1RhcmdldEJpbmRpbmcuZm9ybWF0T3B0aW9ucyA9IHtcblx0XHRcdFx0Li4ub1RhcmdldEJpbmRpbmcuZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0c2hvd01lYXN1cmU6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdH1cblx0fSBlbHNlIGlmIChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmUpIHtcblx0XHRvVGFyZ2V0QmluZGluZyA9IFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nV2l0aFRpbWV6b25lKFxuXHRcdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRcdG9Qcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uLFxuXHRcdFx0ZmFsc2UsXG5cdFx0XHR0cnVlLFxuXHRcdFx0ZmllbGRGb3JtYXRPcHRpb25zLmRhdGVGb3JtYXRPcHRpb25zXG5cdFx0KTtcblx0fSBlbHNlIHtcblx0XHRvVGFyZ2V0QmluZGluZyA9IENvbW1vbkZvcm1hdHRlcnMuZ2V0QmluZGluZ1dpdGhUZXh0QXJyYW5nZW1lbnQoXG5cdFx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdFx0b1Byb3BlcnR5QmluZGluZ0V4cHJlc3Npb24sXG5cdFx0XHRmaWVsZEZvcm1hdE9wdGlvbnNcblx0XHQpO1xuXHR9XG5cdGlmIChhc09iamVjdCkge1xuXHRcdHJldHVybiBvVGFyZ2V0QmluZGluZztcblx0fVxuXHQvLyBXZSBkb24ndCBpbmNsdWRlICQkbm9wYXRjaCBhbmQgcGFyc2VLZWVwRW1wdHlTdHJpbmcgYXMgdGhleSBtYWtlIG5vIHNlbnNlIGluIHRoZSB0ZXh0IGJpbmRpbmcgY2FzZVxuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24ob1RhcmdldEJpbmRpbmcpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFZhbHVlQmluZGluZyA9IGZ1bmN0aW9uIChcblx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0ZmllbGRGb3JtYXRPcHRpb25zOiB7IG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZyB9LFxuXHRpZ25vcmVVbml0OiBib29sZWFuID0gZmFsc2UsXG5cdGlnbm9yZUZvcm1hdHRpbmc6IGJvb2xlYW4gPSBmYWxzZSxcblx0YmluZGluZ1BhcmFtZXRlcnM/OiBvYmplY3QsXG5cdHRhcmdldFR5cGVBbnkgPSBmYWxzZSxcblx0a2VlcFVuaXQgPSBmYWxzZVxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRpZiAoaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QpICYmIG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LiR0YXJnZXQpIHtcblx0XHRjb25zdCBvTmF2UGF0aCA9IG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5VHlwZS5yZXNvbHZlUGF0aChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5wYXRoLCB0cnVlKTtcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCA9IG9OYXZQYXRoLnRhcmdldDtcblx0XHRvTmF2UGF0aC52aXNpdGVkT2JqZWN0cy5mb3JFYWNoKChvTmF2T2JqOiBhbnkpID0+IHtcblx0XHRcdGlmIChpc05hdmlnYXRpb25Qcm9wZXJ0eShvTmF2T2JqKSkge1xuXHRcdFx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLnB1c2gob05hdk9iaik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRjb25zdCB0YXJnZXRPYmplY3QgPSBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdDtcblx0aWYgKGlzUHJvcGVydHkodGFyZ2V0T2JqZWN0KSkge1xuXHRcdGxldCBvQmluZGluZ0V4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+ID0gcGF0aEluTW9kZWwoXG5cdFx0XHRnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpXG5cdFx0KTtcblx0XHRpZiAoaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24ob0JpbmRpbmdFeHByZXNzaW9uKSkge1xuXHRcdFx0aWYgKHRhcmdldE9iamVjdC5hbm5vdGF0aW9ucz8uQ29tbXVuaWNhdGlvbj8uSXNFbWFpbEFkZHJlc3MpIHtcblx0XHRcdFx0b0JpbmRpbmdFeHByZXNzaW9uLnR5cGUgPSBcInNhcC5mZS5jb3JlLnR5cGUuRW1haWxcIjtcblx0XHRcdH0gZWxzZSBpZiAoIWlnbm9yZVVuaXQgJiYgKHRhcmdldE9iamVjdC5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5IHx8IHRhcmdldE9iamVjdC5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQpKSB7XG5cdFx0XHRcdG9CaW5kaW5nRXhwcmVzc2lvbiA9IFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nV2l0aFVuaXRPckN1cnJlbmN5KFxuXHRcdFx0XHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0XHRcdFx0b0JpbmRpbmdFeHByZXNzaW9uLFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0a2VlcFVuaXQgPyB1bmRlZmluZWQgOiB7IHNob3dNZWFzdXJlOiBmYWxzZSB9XG5cdFx0XHRcdCkgYXMgYW55O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb1RpbWV6b25lID0gb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmU7XG5cdFx0XHRcdGlmIChvVGltZXpvbmUpIHtcblx0XHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24gPSBVSUZvcm1hdHRlcnMuZ2V0QmluZGluZ1dpdGhUaW1lem9uZShvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBvQmluZGluZ0V4cHJlc3Npb24sIHRydWUpIGFzIGFueTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24gPSBmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uKHRhcmdldE9iamVjdCwgb0JpbmRpbmdFeHByZXNzaW9uKSBhcyBhbnk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGlzUGF0aEluTW9kZWxFeHByZXNzaW9uKG9CaW5kaW5nRXhwcmVzc2lvbikgJiYgb0JpbmRpbmdFeHByZXNzaW9uLnR5cGUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCIpIHtcblx0XHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24uZm9ybWF0T3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdHBhcnNlS2VlcHNFbXB0eVN0cmluZzogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbihvQmluZGluZ0V4cHJlc3Npb24pKSB7XG5cdFx0XHRcdGlmIChpZ25vcmVGb3JtYXR0aW5nKSB7XG5cdFx0XHRcdFx0ZGVsZXRlIG9CaW5kaW5nRXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zO1xuXHRcdFx0XHRcdGRlbGV0ZSBvQmluZGluZ0V4cHJlc3Npb24uY29uc3RyYWludHM7XG5cdFx0XHRcdFx0ZGVsZXRlIG9CaW5kaW5nRXhwcmVzc2lvbi50eXBlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChiaW5kaW5nUGFyYW1ldGVycykge1xuXHRcdFx0XHRcdG9CaW5kaW5nRXhwcmVzc2lvbi5wYXJhbWV0ZXJzID0gYmluZGluZ1BhcmFtZXRlcnM7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRhcmdldFR5cGVBbnkpIHtcblx0XHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24udGFyZ2V0VHlwZSA9IFwiYW55XCI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihvQmluZGluZ0V4cHJlc3Npb24pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBzb21laG93IHdlIGNvdWxkIG5vdCBjb21waWxlIHRoZSBiaW5kaW5nIC0+IHJldHVybiBlbXB0eSBzdHJpbmdcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0fSBlbHNlIGlmIChcblx0XHR0YXJnZXRPYmplY3Q/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsIHx8XG5cdFx0dGFyZ2V0T2JqZWN0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoXG5cdCkge1xuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oKHRhcmdldE9iamVjdCBhcyBEYXRhRmllbGRXaXRoVXJsKS5WYWx1ZSkpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFRleHRCaW5kaW5nID0gZnVuY3Rpb24gKFxuXHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmaWVsZEZvcm1hdE9wdGlvbnM6IHsgbWVhc3VyZURpc3BsYXlNb2RlPzogc3RyaW5nIH1cbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0Y29uc3QgdGV4dFByb3BlcnR5UGF0aCA9IFByb3BlcnR5SGVscGVyLmdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0KTtcblx0aWYgKHRleHRQcm9wZXJ0eVBhdGgpIHtcblx0XHRjb25zdCBvVGV4dFByb3BlcnR5UGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsIHRleHRQcm9wZXJ0eVBhdGgpO1xuXHRcdHJldHVybiBnZXRWYWx1ZUJpbmRpbmcob1RleHRQcm9wZXJ0eVBhdGgsIGZpZWxkRm9ybWF0T3B0aW9ucywgdHJ1ZSwgdHJ1ZSwgeyAkJG5vUGF0Y2g6IHRydWUgfSk7XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBjb25zdCBpc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzID0gZnVuY3Rpb24gKG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLCBvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdGNvbnN0IGFOYXZpZ2F0aW9uUHJvcGVydGllcyA9IG9EYXRhTW9kZWxQYXRoPy50YXJnZXRFbnRpdHlUeXBlPy5uYXZpZ2F0aW9uUHJvcGVydGllcyB8fCBbXTtcblx0Y29uc3QgYVNlbWFudGljT2JqZWN0cyA9IG9EYXRhTW9kZWxQYXRoPy50YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY0tleSB8fCBbXTtcblx0bGV0IGJJc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzID0gZmFsc2U7XG5cdGFOYXZpZ2F0aW9uUHJvcGVydGllcy5mb3JFYWNoKChvTmF2UHJvcDogTmF2aWdhdGlvblByb3BlcnR5KSA9PiB7XG5cdFx0aWYgKG9OYXZQcm9wLnJlZmVyZW50aWFsQ29uc3RyYWludCAmJiBvTmF2UHJvcC5yZWZlcmVudGlhbENvbnN0cmFpbnQubGVuZ3RoKSB7XG5cdFx0XHRvTmF2UHJvcC5yZWZlcmVudGlhbENvbnN0cmFpbnQuZm9yRWFjaCgob1JlZkNvbnN0cmFpbnQpID0+IHtcblx0XHRcdFx0aWYgKG9SZWZDb25zdHJhaW50Py5zb3VyY2VQcm9wZXJ0eSA9PT0gb1Byb3BlcnR5Lm5hbWUpIHtcblx0XHRcdFx0XHRpZiAob05hdlByb3A/LnRhcmdldFR5cGU/LmFubm90YXRpb25zPy5VST8uUXVpY2tWaWV3RmFjZXRzKSB7XG5cdFx0XHRcdFx0XHRiSXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xuXHRpZiAob0RhdGFNb2RlbFBhdGguY29udGV4dExvY2F0aW9uPy50YXJnZXRFbnRpdHlTZXQgIT09IG9EYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVNldCkge1xuXHRcdGNvbnN0IGFJc1RhcmdldFNlbWFudGljS2V5ID0gYVNlbWFudGljT2JqZWN0cy5zb21lKGZ1bmN0aW9uIChvU2VtYW50aWMpIHtcblx0XHRcdHJldHVybiBvU2VtYW50aWM/LiR0YXJnZXQ/Lm5hbWUgPT09IG9Qcm9wZXJ0eS5uYW1lO1xuXHRcdH0pO1xuXHRcdGlmICgoYUlzVGFyZ2V0U2VtYW50aWNLZXkgfHwgb1Byb3BlcnR5LmlzS2V5KSAmJiBvRGF0YU1vZGVsUGF0aD8udGFyZ2V0RW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LlVJPy5RdWlja1ZpZXdGYWNldHMpIHtcblx0XHRcdGJJc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzID0gdHJ1ZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGJJc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzUmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdEVuYWJsZWQgPSBmdW5jdGlvbiAoXG5cdG9Qcm9wZXJ0eVBhdGg6IFByb3BlcnR5T3JQYXRoPFByb3BlcnR5Pixcblx0ZmllbGRGb3JtYXRPcHRpb25zOiB7IGRpc3BsYXlNb2RlPzogRGlzcGxheU1vZGU7IHRleHRBbGlnbk1vZGU/OiBzdHJpbmcgfVxuKTogYm9vbGVhbiB7XG5cdGNvbnN0IG9Qcm9wZXJ0eTogUHJvcGVydHkgPSAoaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ob1Byb3BlcnR5UGF0aCkgJiYgb1Byb3BlcnR5UGF0aC4kdGFyZ2V0KSB8fCAob1Byb3BlcnR5UGF0aCBhcyBQcm9wZXJ0eSk7XG5cdGlmIChcblx0XHQhb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRleHQgJiZcblx0XHQhb1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcyAmJlxuXHRcdFByb3BlcnR5SGVscGVyLmhhc1ZhbHVlSGVscChvUHJvcGVydHkpICYmXG5cdFx0ZmllbGRGb3JtYXRPcHRpb25zLnRleHRBbGlnbk1vZGUgPT09IFwiRm9ybVwiXG5cdCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0ZXh0IGFsaWdubWVudCBiYXNlZCBvbiB0aGUgZGF0YU1vZGVsT2JqZWN0UGF0aC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkTW9kZWxQYXRoIFRoZSBwcm9wZXJ0eSdzIHR5cGVcbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zIFRoZSBmaWVsZCBmb3JtYXQgb3B0aW9uc1xuICogQHBhcmFtIGNvbXB1dGVkRWRpdE1vZGUgVGhlIGVkaXRNb2RlIHVzZWQgaW4gdGhpcyBjYXNlXG4gKiBAcmV0dXJucyBUaGUgcHJvcGVydHkgYWxpZ25tZW50XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRUZXh0QWxpZ25tZW50ID0gZnVuY3Rpb24gKGRhdGFGaWVsZE1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCwgZm9ybWF0T3B0aW9uczogYW55LCBjb21wdXRlZEVkaXRNb2RlOiBhbnkpIHtcblx0Ly8gY2hlY2sgZm9yIHRoZSB0YXJnZXQgdmFsdWUgdHlwZSBkaXJlY3RseSwgb3IgaW4gY2FzZSBpdCBpcyBwb2ludGluZyB0byBhIERhdGFQb2ludCB3ZSBsb29rIGF0IHRoZSBkYXRhUG9pbnQncyB2YWx1ZVxuXHRsZXQgc1R5cGUgPSBkYXRhRmllbGRNb2RlbFBhdGgudGFyZ2V0T2JqZWN0LlZhbHVlPy4kdGFyZ2V0LnR5cGUgfHwgZGF0YUZpZWxkTW9kZWxQYXRoLnRhcmdldE9iamVjdC5UYXJnZXQ/LiR0YXJnZXQuVmFsdWUuJHRhcmdldC50eXBlO1xuXHRsZXQgYW5ub3RhdGlvbnM7XG5cblx0aWYgKFxuXHRcdFByb3BlcnR5SGVscGVyLmlzS2V5KFxuXHRcdFx0ZGF0YUZpZWxkTW9kZWxQYXRoLnRhcmdldE9iamVjdC5WYWx1ZT8uJHRhcmdldCB8fCBkYXRhRmllbGRNb2RlbFBhdGgudGFyZ2V0T2JqZWN0LlRhcmdldD8uJHRhcmdldD8uVmFsdWU/LiR0YXJnZXRcblx0XHQpXG5cdCkge1xuXHRcdHJldHVybiBcIkJlZ2luXCI7XG5cdH1cblx0aWYgKGRhdGFGaWVsZE1vZGVsUGF0aC50YXJnZXRPYmplY3QuJFR5cGUgIT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24pIHtcblx0XHRhbm5vdGF0aW9ucyA9IGRhdGFGaWVsZE1vZGVsUGF0aC50YXJnZXRPYmplY3QuVmFsdWUuJHRhcmdldC5hbm5vdGF0aW9ucy5VSTtcblx0XHRzVHlwZSA9IEZpZWxkSGVscGVyLmdldERhdGFUeXBlRm9yVmlzdWFsaXphdGlvbihhbm5vdGF0aW9ucywgc1R5cGUpO1xuXHR9XG5cblx0cmV0dXJuIEZpZWxkSGVscGVyLmdldFByb3BlcnR5QWxpZ25tZW50KHNUeXBlLCBmb3JtYXRPcHRpb25zLCBjb21wdXRlZEVkaXRNb2RlKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYmluZGluZyBleHByZXNzaW9uIHRvIGV2YWx1YXRlIHRoZSB2aXNpYmlsaXR5IG9mIGEgRGF0YUZpZWxkIG9yIERhdGFQb2ludCBhbm5vdGF0aW9uLlxuICpcbiAqIFNBUCBGaW9yaSBlbGVtZW50cyB3aWxsIGV2YWx1YXRlIGVpdGhlciB0aGUgVUkuSGlkZGVuIGFubm90YXRpb24gZGVmaW5lZCBvbiB0aGUgYW5ub3RhdGlvbiBpdHNlbGYgb3Igb24gdGhlIHRhcmdldCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkTW9kZWxQYXRoIFRoZSBtZXRhcGF0aCByZWZlcnJpbmcgdG8gdGhlIGFubm90YXRpb24gd2UgYXJlIGV2YWx1YXRpbmcuXG4gKiBAcGFyYW0gW2Zvcm1hdE9wdGlvbnNdIEZvcm1hdE9wdGlvbnMgb3B0aW9uYWwuXG4gKiBAcGFyYW0gZm9ybWF0T3B0aW9ucy5pc0FuYWx5dGljcyBUaGlzIGZsYWcgaXMgc2V0IHdoZW4gdXNpbmcgYW4gYW5hbHl0aWNhbCB0YWJsZS5cbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gdGhhdCB5b3UgY2FuIGJpbmQgdG8gdGhlIFVJLlxuICovXG5leHBvcnQgY29uc3QgZ2V0VmlzaWJsZUV4cHJlc3Npb24gPSBmdW5jdGlvbiAoXG5cdGRhdGFGaWVsZE1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0Zm9ybWF0T3B0aW9ucz86IHsgaXNBbmFseXRpY3M/OiBib29sZWFuIH1cbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0Y29uc3QgdGFyZ2V0T2JqZWN0OiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIHwgRGF0YVBvaW50VHlwZVR5cGVzID0gZGF0YUZpZWxkTW9kZWxQYXRoLnRhcmdldE9iamVjdDtcblx0bGV0IHByb3BlcnR5VmFsdWU7XG5cdGlmICh0YXJnZXRPYmplY3QpIHtcblx0XHRzd2l0Y2ggKHRhcmdldE9iamVjdC4kVHlwZSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZTpcblx0XHRcdFx0cHJvcGVydHlWYWx1ZSA9IHRhcmdldE9iamVjdC5WYWx1ZS4kdGFyZ2V0O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjpcblx0XHRcdFx0Ly8gaWYgaXQgaXMgYSBEYXRhRmllbGRGb3JBbm5vdGF0aW9uIHBvaW50aW5nIHRvIGEgRGF0YVBvaW50IHdlIGxvb2sgYXQgdGhlIGRhdGFQb2ludCdzIHZhbHVlXG5cdFx0XHRcdGlmICh0YXJnZXRPYmplY3Q/LlRhcmdldD8uJHRhcmdldD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGUpIHtcblx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlID0gdGFyZ2V0T2JqZWN0LlRhcmdldC4kdGFyZ2V0Py5WYWx1ZS4kdGFyZ2V0O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZmFsbHRocm91Z2hcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXHRjb25zdCBpc0FuYWx5dGljYWxHcm91cEhlYWRlckV4cGFuZGVkID0gZm9ybWF0T3B0aW9ucz8uaXNBbmFseXRpY3MgPyBVSS5Jc0V4cGFuZGVkIDogY29uc3RhbnQoZmFsc2UpO1xuXHRjb25zdCBpc0FuYWx5dGljYWxMZWFmID0gZm9ybWF0T3B0aW9ucz8uaXNBbmFseXRpY3MgPyBlcXVhbChVSS5Ob2RlTGV2ZWwsIDApIDogY29uc3RhbnQoZmFsc2UpO1xuXG5cdC8vIEEgZGF0YSBmaWVsZCBpcyB2aXNpYmxlIGlmOlxuXHQvLyAtIHRoZSBVSS5IaWRkZW4gZXhwcmVzc2lvbiBpbiB0aGUgb3JpZ2luYWwgYW5ub3RhdGlvbiBkb2VzIG5vdCBldmFsdWF0ZSB0byAndHJ1ZSdcblx0Ly8gLSB0aGUgVUkuSGlkZGVuIGV4cHJlc3Npb24gaW4gdGhlIHRhcmdldCBwcm9wZXJ0eSBkb2VzIG5vdCBldmFsdWF0ZSB0byAndHJ1ZSdcblx0Ly8gLSBpbiBjYXNlIG9mIEFuYWx5dGljcyBpdCdzIG5vdCB2aXNpYmxlIGZvciBhbiBleHBhbmRlZCBHcm91cEhlYWRlclxuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0YW5kKFxuXHRcdFx0Li4uW1xuXHRcdFx0XHRub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4pLCB0cnVlKSksXG5cdFx0XHRcdGlmRWxzZShcblx0XHRcdFx0XHQhIXByb3BlcnR5VmFsdWUsXG5cdFx0XHRcdFx0cHJvcGVydHlWYWx1ZSAmJiBub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHByb3BlcnR5VmFsdWUuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4pLCB0cnVlKSksXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRvcihub3QoaXNBbmFseXRpY2FsR3JvdXBIZWFkZXJFeHBhbmRlZCksIGlzQW5hbHl0aWNhbExlYWYpXG5cdFx0XHRdXG5cdFx0KVxuXHQpO1xufTtcblxuZXhwb3J0IGNvbnN0IFFWVGV4dEJpbmRpbmcgPSBmdW5jdGlvbiAoXG5cdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdG9Qcm9wZXJ0eVZhbHVlRGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0ZmllbGRGb3JtYXRPcHRpb25zOiB7IGRpc3BsYXlNb2RlPzogRGlzcGxheU1vZGU7IG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZyB9LFxuXHRhc09iamVjdDogYm9vbGVhbiA9IGZhbHNlXG4pIHtcblx0bGV0IHJldHVyblZhbHVlOiBhbnkgPSBnZXRWYWx1ZUJpbmRpbmcob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCwgZmllbGRGb3JtYXRPcHRpb25zLCBhc09iamVjdCk7XG5cdGlmIChyZXR1cm5WYWx1ZSA9PT0gXCJcIikge1xuXHRcdHJldHVyblZhbHVlID0gZ2V0VGV4dEJpbmRpbmcob1Byb3BlcnR5VmFsdWVEYXRhTW9kZWxPYmplY3RQYXRoLCBmaWVsZEZvcm1hdE9wdGlvbnMsIGFzT2JqZWN0KTtcblx0fVxuXHRyZXR1cm4gcmV0dXJuVmFsdWU7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0UXVpY2tWaWV3VHlwZSA9IGZ1bmN0aW9uIChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogc3RyaW5nIHtcblx0Y29uc3QgdGFyZ2V0T2JqZWN0ID0gb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q7XG5cdGlmICh0YXJnZXRPYmplY3Q/LiR0YXJnZXQ/LmFubm90YXRpb25zPy5Db21tdW5pY2F0aW9uPy5Jc0VtYWlsQWRkcmVzcykge1xuXHRcdHJldHVybiBcImVtYWlsXCI7XG5cdH1cblx0aWYgKHRhcmdldE9iamVjdD8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW11bmljYXRpb24/LklzUGhvbmVOdW1iZXIpIHtcblx0XHRyZXR1cm4gXCJwaG9uZVwiO1xuXHR9XG5cdHJldHVybiBcInRleHRcIjtcbn07XG5cbmV4cG9ydCB0eXBlIFNlbWFudGljT2JqZWN0Q3VzdG9tRGF0YSA9IHtcblx0a2V5OiBzdHJpbmc7XG5cdHZhbHVlOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgY3VzdG9tRGF0YSBrZXkgdmFsdWUgcGFpciBvZiBTZW1hbnRpY09iamVjdHMuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5QW5ub3RhdGlvbnMgVGhlIHZhbHVlIG9mIHRoZSBDb21tb24gYW5ub3RhdGlvbi5cbiAqIEBwYXJhbSBbZHluYW1pY1NlbWFudGljT2JqZWN0c09ubHldIEZsYWcgZm9yIHJldHJpZXZpbmcgZHluYW1pYyBTZW1hbnRpYyBPYmplY3RzIG9ubHkuXG4gKiBAcmV0dXJucyBUaGUgYXJyYXkgb2YgdGhlIHNlbWFudGljIE9iamVjdHMuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTZW1hbnRpY09iamVjdEV4cHJlc3Npb25Ub1Jlc29sdmUgPSBmdW5jdGlvbiAoXG5cdHByb3BlcnR5QW5ub3RhdGlvbnM6IGFueSxcblx0ZHluYW1pY1NlbWFudGljT2JqZWN0c09ubHk/OiBib29sZWFuXG4pOiBTZW1hbnRpY09iamVjdEN1c3RvbURhdGFbXSB7XG5cdGNvbnN0IGFTZW1PYmpFeHByVG9SZXNvbHZlOiBTZW1hbnRpY09iamVjdEN1c3RvbURhdGFbXSA9IFtdO1xuXHRsZXQgc1NlbU9iakV4cHJlc3Npb246IHN0cmluZztcblx0bGV0IGFubm90YXRpb247XG5cdGlmIChwcm9wZXJ0eUFubm90YXRpb25zKSB7XG5cdFx0Y29uc3Qgc2VtYW50aWNPYmplY3RzS2V5cyA9IE9iamVjdC5rZXlzKHByb3BlcnR5QW5ub3RhdGlvbnMpLmZpbHRlcihmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIGVsZW1lbnQgPT09IFwiU2VtYW50aWNPYmplY3RcIiB8fCBlbGVtZW50LnN0YXJ0c1dpdGgoXCJTZW1hbnRpY09iamVjdCNcIik7XG5cdFx0fSk7XG5cdFx0Zm9yIChjb25zdCBzZW1hbnRpY09iamVjdCBvZiBzZW1hbnRpY09iamVjdHNLZXlzKSB7XG5cdFx0XHRhbm5vdGF0aW9uID0gcHJvcGVydHlBbm5vdGF0aW9uc1tzZW1hbnRpY09iamVjdF07XG5cdFx0XHRzU2VtT2JqRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihhbm5vdGF0aW9uKSkgYXMgc3RyaW5nO1xuXHRcdFx0aWYgKCFkeW5hbWljU2VtYW50aWNPYmplY3RzT25seSB8fCAoZHluYW1pY1NlbWFudGljT2JqZWN0c09ubHkgJiYgaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24oYW5ub3RhdGlvbikpKSB7XG5cdFx0XHRcdGFTZW1PYmpFeHByVG9SZXNvbHZlLnB1c2goe1xuXHRcdFx0XHRcdGtleTogZ2V0RHluYW1pY1BhdGhGcm9tU2VtYW50aWNPYmplY3Qoc1NlbU9iakV4cHJlc3Npb24pIHx8IHNTZW1PYmpFeHByZXNzaW9uLFxuXHRcdFx0XHRcdHZhbHVlOiBzU2VtT2JqRXhwcmVzc2lvblxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIGFTZW1PYmpFeHByVG9SZXNvbHZlO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFNlbWFudGljT2JqZWN0cyA9IGZ1bmN0aW9uIChhU2VtT2JqRXhwclRvUmVzb2x2ZTogYW55W10pOiBhbnkge1xuXHRpZiAoYVNlbU9iakV4cHJUb1Jlc29sdmUubGVuZ3RoID4gMCkge1xuXHRcdGxldCBzQ3VzdG9tRGF0YUtleTogc3RyaW5nID0gXCJcIjtcblx0XHRsZXQgc0N1c3RvbURhdGFWYWx1ZTogYW55ID0gXCJcIjtcblx0XHRjb25zdCBhU2VtT2JqQ3VzdG9tRGF0YTogYW55W10gPSBbXTtcblx0XHRmb3IgKGxldCBpU2VtT2JqQ291bnQgPSAwOyBpU2VtT2JqQ291bnQgPCBhU2VtT2JqRXhwclRvUmVzb2x2ZS5sZW5ndGg7IGlTZW1PYmpDb3VudCsrKSB7XG5cdFx0XHRzQ3VzdG9tRGF0YUtleSA9IGFTZW1PYmpFeHByVG9SZXNvbHZlW2lTZW1PYmpDb3VudF0ua2V5O1xuXHRcdFx0c0N1c3RvbURhdGFWYWx1ZSA9IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihhU2VtT2JqRXhwclRvUmVzb2x2ZVtpU2VtT2JqQ291bnRdLnZhbHVlKSk7XG5cdFx0XHRhU2VtT2JqQ3VzdG9tRGF0YS5wdXNoKHtcblx0XHRcdFx0a2V5OiBzQ3VzdG9tRGF0YUtleSxcblx0XHRcdFx0dmFsdWU6IHNDdXN0b21EYXRhVmFsdWVcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zdCBvU2VtYW50aWNPYmplY3RzTW9kZWw6IGFueSA9IG5ldyBKU09OTW9kZWwoYVNlbU9iakN1c3RvbURhdGEpO1xuXHRcdG9TZW1hbnRpY09iamVjdHNNb2RlbC4kJHZhbHVlQXNQcm9taXNlID0gdHJ1ZTtcblx0XHRjb25zdCBvU2VtT2JqQmluZGluZ0NvbnRleHQ6IGFueSA9IG9TZW1hbnRpY09iamVjdHNNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdFx0cmV0dXJuIG9TZW1PYmpCaW5kaW5nQ29udGV4dDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gbmV3IEpTT05Nb2RlbChbXSkuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpO1xuXHR9XG59O1xuXG4vKipcbiAqIE1ldGhvZCB0byBnZXQgTXVsdGlwbGVMaW5lcyBmb3IgYSBEYXRhRmllbGQuXG4gKlxuICogQG5hbWUgZ2V0TXVsdGlwbGVMaW5lc0ZvckRhdGFGaWVsZFxuICogQHBhcmFtIHthbnl9IG9UaGlzIFRoZSBjdXJyZW50IG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IHNQcm9wZXJ0eVR5cGUgVGhlIHByb3BlcnR5IHR5cGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNNdWx0aUxpbmVUZXh0IFRoZSBwcm9wZXJ0eSBpc011bHRpTGluZVRleHRcbiAqIEByZXR1cm5zIHtDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+fSBUaGUgYmluZGluZyBleHByZXNzaW9uIHRvIGRldGVybWluZSBpZiBhIGRhdGEgZmllbGQgc2hvdWxkIGJlIGEgTXVsdGlMaW5lVGV4dCBvciBub3RcbiAqIEBwdWJsaWNcbiAqL1xuXG5leHBvcnQgY29uc3QgZ2V0TXVsdGlwbGVMaW5lc0ZvckRhdGFGaWVsZCA9IGZ1bmN0aW9uIChvVGhpczogYW55LCBzUHJvcGVydHlUeXBlOiBzdHJpbmcsIGlzTXVsdGlMaW5lVGV4dDogYm9vbGVhbik6IGFueSB7XG5cdGlmIChvVGhpcy53cmFwID09PSBmYWxzZSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRpZiAoc1Byb3BlcnR5VHlwZSAhPT0gXCJFZG0uU3RyaW5nXCIpIHtcblx0XHRyZXR1cm4gaXNNdWx0aUxpbmVUZXh0O1xuXHR9XG5cdGlmIChvVGhpcy5lZGl0TW9kZSA9PT0gXCJEaXNwbGF5XCIpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRpZiAob1RoaXMuZWRpdE1vZGUuaW5kZXhPZihcIntcIikgPiAtMSkge1xuXHRcdC8vIElmIHRoZSBlZGl0TW9kZSBpcyBjb21wdXRlZCB0aGVuIHdlIGp1c3QgY2FyZSBhYm91dCB0aGUgcGFnZSBlZGl0TW9kZSB0byBkZXRlcm1pbmUgaWYgdGhlIG11bHRpbGluZSBwcm9wZXJ0eSBzaG91bGQgYmUgdGFrZW4gaW50byBhY2NvdW50XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKG9yKG5vdChVSS5Jc0VkaXRhYmxlKSwgaXNNdWx0aUxpbmVUZXh0KSk7XG5cdH1cblx0cmV0dXJuIGlzTXVsdGlMaW5lVGV4dDtcbn07XG5cbmNvbnN0IF9oYXNWYWx1ZUhlbHBUb1Nob3cgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSwgbWVhc3VyZURpc3BsYXlNb2RlOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBib29sZWFuIHwgdW5kZWZpbmVkIHtcblx0Ly8gd2Ugc2hvdyBhIHZhbHVlIGhlbHAgaWYgdGVoIHByb3BlcnR5IGhhcyBvbmUgb3IgaWYgaXRzIHZpc2libGUgdW5pdCBoYXMgb25lXG5cdGNvbnN0IG9Qcm9wZXJ0eVVuaXQgPSBQcm9wZXJ0eUhlbHBlci5nZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5KG9Qcm9wZXJ0eSk7XG5cdGNvbnN0IG9Qcm9wZXJ0eUN1cnJlbmN5ID0gUHJvcGVydHlIZWxwZXIuZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkob1Byb3BlcnR5KTtcblx0cmV0dXJuIChcblx0XHQoUHJvcGVydHlIZWxwZXIuaGFzVmFsdWVIZWxwKG9Qcm9wZXJ0eSkgJiYgb1Byb3BlcnR5LnR5cGUgIT09IFwiRWRtLkJvb2xlYW5cIikgfHxcblx0XHQobWVhc3VyZURpc3BsYXlNb2RlICE9PSBcIkhpZGRlblwiICYmXG5cdFx0XHQoKG9Qcm9wZXJ0eVVuaXQgJiYgUHJvcGVydHlIZWxwZXIuaGFzVmFsdWVIZWxwKG9Qcm9wZXJ0eVVuaXQpKSB8fFxuXHRcdFx0XHQob1Byb3BlcnR5Q3VycmVuY3kgJiYgUHJvcGVydHlIZWxwZXIuaGFzVmFsdWVIZWxwKG9Qcm9wZXJ0eUN1cnJlbmN5KSkpKVxuXHQpO1xufTtcblxuLyoqXG4gKiBTZXRzIEVkaXQgU3R5bGUgcHJvcGVydGllcyBmb3IgRmllbGQgaW4gY2FzZSBvZiBNYWNybyBGaWVsZCBhbmQgTWFzc0VkaXREaWFsb2cgZmllbGRzLlxuICpcbiAqIEBwYXJhbSBvUHJvcHMgRmllbGQgUHJvcGVydGllcyBmb3IgdGhlIE1hY3JvIEZpZWxkLlxuICogQHBhcmFtIG9EYXRhRmllbGQgRGF0YUZpZWxkIE9iamVjdC5cbiAqIEBwYXJhbSBvRGF0YU1vZGVsUGF0aCBEYXRhTW9kZWwgT2JqZWN0IFBhdGggdG8gdGhlIHByb3BlcnR5LlxuICogQHBhcmFtIG9ubHlFZGl0U3R5bGUgVG8gYWRkIG9ubHkgZWRpdFN0eWxlLlxuICovXG5leHBvcnQgY29uc3Qgc2V0RWRpdFN0eWxlUHJvcGVydGllcyA9IGZ1bmN0aW9uIChcblx0b1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsXG5cdG9EYXRhRmllbGQ6IGFueSxcblx0b0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdG9ubHlFZGl0U3R5bGU/OiBib29sZWFuXG4pOiB2b2lkIHtcblx0Y29uc3Qgb1Byb3BlcnR5ID0gb0RhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRpZiAoXG5cdFx0IWlzUHJvcGVydHkob1Byb3BlcnR5KSB8fFxuXHRcdFtcblx0XHRcdFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbixcblx0XHRcdFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aCxcblx0XHRcdFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblxuXHRcdF0uaW5jbHVkZXMob0RhdGFGaWVsZC4kVHlwZSlcblx0KSB7XG5cdFx0b1Byb3BzLmVkaXRTdHlsZSA9IG51bGw7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGlmICghb25seUVkaXRTdHlsZSkge1xuXHRcdG9Qcm9wcy52YWx1ZUJpbmRpbmdFeHByZXNzaW9uID0gZ2V0VmFsdWVCaW5kaW5nKG9EYXRhTW9kZWxQYXRoLCBvUHJvcHMuZm9ybWF0T3B0aW9ucyk7XG5cblx0XHRjb25zdCBlZGl0U3R5bGVQbGFjZWhvbGRlciA9IG9EYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5QbGFjZWhvbGRlciB8fCBvRGF0YUZpZWxkLlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uVUk/LlBsYWNlaG9sZGVyO1xuXG5cdFx0aWYgKGVkaXRTdHlsZVBsYWNlaG9sZGVyKSB7XG5cdFx0XHRvUHJvcHMuZWRpdFN0eWxlUGxhY2Vob2xkZXIgPSBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZWRpdFN0eWxlUGxhY2Vob2xkZXIpKTtcblx0XHR9XG5cdH1cblxuXHQvLyBTZXR1cCBSYXRpbmdJbmRpY2F0b3Jcblx0Y29uc3QgZGF0YVBvaW50QW5ub3RhdGlvbiA9IChpc0RhdGFGaWVsZEZvckFubm90YXRpb24ob0RhdGFGaWVsZCkgPyBvRGF0YUZpZWxkLlRhcmdldD8uJHRhcmdldCA6IG9EYXRhRmllbGQpIGFzIERhdGFQb2ludFR5cGU7XG5cdGlmIChkYXRhUG9pbnRBbm5vdGF0aW9uPy5WaXN1YWxpemF0aW9uID09PSBcIlVJLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiKSB7XG5cdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiUmF0aW5nSW5kaWNhdG9yXCI7XG5cblx0XHRpZiAoZGF0YVBvaW50QW5ub3RhdGlvbi5hbm5vdGF0aW9ucz8uQ29tbW9uPy5RdWlja0luZm8pIHtcblx0XHRcdG9Qcm9wcy5yYXRpbmdJbmRpY2F0b3JUb29sdGlwID0gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhUG9pbnRBbm5vdGF0aW9uLmFubm90YXRpb25zPy5Db21tb24/LlF1aWNrSW5mbylcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0b1Byb3BzLnJhdGluZ0luZGljYXRvclRhcmdldFZhbHVlID0gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFQb2ludEFubm90YXRpb24uVGFyZ2V0VmFsdWUpKTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAoX2hhc1ZhbHVlSGVscFRvU2hvdyhvUHJvcGVydHksIG9Qcm9wcy5mb3JtYXRPcHRpb25zPy5tZWFzdXJlRGlzcGxheU1vZGUpKSB7XG5cdFx0aWYgKCFvbmx5RWRpdFN0eWxlKSB7XG5cdFx0XHRvUHJvcHMudGV4dEJpbmRpbmdFeHByZXNzaW9uID0gZ2V0QXNzb2NpYXRlZFRleHRCaW5kaW5nKG9EYXRhTW9kZWxQYXRoLCBvUHJvcHMuZm9ybWF0T3B0aW9ucyk7XG5cdFx0XHRpZiAob1Byb3BzLmZvcm1hdE9wdGlvbnM/Lm1lYXN1cmVEaXNwbGF5TW9kZSAhPT0gXCJIaWRkZW5cIikge1xuXHRcdFx0XHQvLyBmb3IgdGhlIE1EQyBGaWVsZCB3ZSBuZWVkIHRvIGtlZXAgdGhlIHVuaXQgaW5zaWRlIHRoZSB2YWx1ZUJpbmRpbmdFeHByZXNzaW9uXG5cdFx0XHRcdG9Qcm9wcy52YWx1ZUJpbmRpbmdFeHByZXNzaW9uID0gZ2V0VmFsdWVCaW5kaW5nKG9EYXRhTW9kZWxQYXRoLCBvUHJvcHMuZm9ybWF0T3B0aW9ucywgZmFsc2UsIGZhbHNlLCB1bmRlZmluZWQsIGZhbHNlLCB0cnVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiSW5wdXRXaXRoVmFsdWVIZWxwXCI7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0c3dpdGNoIChvUHJvcGVydHkudHlwZSkge1xuXHRcdGNhc2UgXCJFZG0uRGF0ZVwiOlxuXHRcdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiRGF0ZVBpY2tlclwiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdGNhc2UgXCJFZG0uVGltZVwiOlxuXHRcdGNhc2UgXCJFZG0uVGltZU9mRGF5XCI6XG5cdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJUaW1lUGlja2VyXCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0Y2FzZSBcIkVkbS5EYXRlVGltZVwiOlxuXHRcdGNhc2UgXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIjpcblx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIkRhdGVUaW1lUGlja2VyXCI7XG5cdFx0XHQvLyBObyB0aW1lem9uZSBkZWZpbmVkLiBBbHNvIGZvciBjb21wYXRpYmlsaXR5IHJlYXNvbnMuXG5cdFx0XHRpZiAoIW9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZSkge1xuXHRcdFx0XHRvUHJvcHMuc2hvd1RpbWV6b25lID0gdW5kZWZpbmVkO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b1Byb3BzLnNob3dUaW1lem9uZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm47XG5cdFx0Y2FzZSBcIkVkbS5Cb29sZWFuXCI6XG5cdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJDaGVja0JveFwiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdGNhc2UgXCJFZG0uU3RyZWFtXCI6XG5cdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJGaWxlXCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0Y2FzZSBcIkVkbS5TdHJpbmdcIjpcblx0XHRcdGlmIChvUHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5NdWx0aUxpbmVUZXh0Py52YWx1ZU9mKCkpIHtcblx0XHRcdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiVGV4dEFyZWFcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIklucHV0XCI7XG5cdH1cblx0aWYgKFxuXHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zPy5tZWFzdXJlRGlzcGxheU1vZGUgIT09IFwiSGlkZGVuXCIgJiZcblx0XHQob1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgfHwgb1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdClcblx0KSB7XG5cdFx0aWYgKCFvbmx5RWRpdFN0eWxlKSB7XG5cdFx0XHRvUHJvcHMudW5pdEJpbmRpbmdFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oVUlGb3JtYXR0ZXJzLmdldEJpbmRpbmdGb3JVbml0T3JDdXJyZW5jeShvRGF0YU1vZGVsUGF0aCkpO1xuXHRcdFx0b1Byb3BzLmRlc2NyaXB0aW9uQmluZGluZ0V4cHJlc3Npb24gPSBVSUZvcm1hdHRlcnMuaWZVbml0RWRpdGFibGUoXG5cdFx0XHRcdG9Qcm9wZXJ0eSxcblx0XHRcdFx0XCJcIixcblx0XHRcdFx0VUlGb3JtYXR0ZXJzLmdldEJpbmRpbmdGb3JVbml0T3JDdXJyZW5jeShvRGF0YU1vZGVsUGF0aClcblx0XHRcdCk7XG5cdFx0XHRjb25zdCB1bml0UHJvcGVydHkgPVxuXHRcdFx0XHRQcm9wZXJ0eUhlbHBlci5nZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eShvUHJvcGVydHkpIHx8IFByb3BlcnR5SGVscGVyLmdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkob1Byb3BlcnR5KTtcblx0XHRcdG9Qcm9wcy5zdGF0aWNVbml0ID0gdW5pdFByb3BlcnR5ID8gdW5kZWZpbmVkIDogZ2V0U3RhdGljVW5pdFdpdGhMb2NhbGUob1Byb3BlcnR5KTtcblx0XHRcdG9Qcm9wcy51bml0RWRpdGFibGUgPVxuXHRcdFx0XHRvUHJvcHMuZm9ybWF0T3B0aW9ucy5tZWFzdXJlRGlzcGxheU1vZGUgPT09IFwiUmVhZE9ubHlcIlxuXHRcdFx0XHRcdD8gXCJmYWxzZVwiXG5cdFx0XHRcdFx0OiBjb21waWxlRXhwcmVzc2lvbihub3QoaXNSZWFkT25seUV4cHJlc3Npb24odW5pdFByb3BlcnR5KSkpO1xuXHRcdFx0b1Byb3BzLnZhbHVlSW5wdXRXaWR0aCA9IGlmVW5pdEVkaXRhYmxlKG9Qcm9wZXJ0eSwgXCI3MCVcIiwgXCIxMDAlXCIpO1xuXHRcdFx0b1Byb3BzLnZhbHVlSW5wdXRGaWVsZFdpZHRoID0gaWZVbml0RWRpdGFibGUob1Byb3BlcnR5LCBcIjEwMCVcIiwgXCI3MCVcIik7XG5cdFx0XHRvUHJvcHMudW5pdElucHV0VmlzaWJsZSA9IGlmVW5pdEVkaXRhYmxlKG9Qcm9wZXJ0eSwgdHJ1ZSwgZmFsc2UpO1xuXHRcdH1cblx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJJbnB1dFdpdGhVbml0XCI7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiSW5wdXRcIjtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdW5pdCBvciBjdXJyZW5jeSAgdmFsdWUgdXNpbmcgdGhlIGxvY2FsZSBpZiB0aGUgYW5ub3RhdGlvbiB2YWx1ZSBpcyBhIHVuaXQga2V5LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBQcm9wZXJ0eSB3aXRoIGEgc3RhdGljIHVuaXQgb3IgY3VycmVuY3lcbiAqIEByZXR1cm5zIFRoZSB2YWx1ZSBmb3IgdGhlIHVuaXQvY3VycmVuY3lcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFN0YXRpY1VuaXRXaXRoTG9jYWxlID0gKHByb3BlcnR5OiBQcm9wZXJ0eSkgPT4ge1xuXHRsZXQgdW5pdCA9IChwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQ/LnZhbHVlT2YoKSB8fCBwcm9wZXJ0eT8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeT8udmFsdWVPZigpKSBhcyBzdHJpbmc7XG5cdC8vIHRoaXMgaXMgYSBoYWNrIG9mIFVJNSBsb2NhbGUgZGF0YSB0byByZXRyaWV2ZSB0aGUgbG9jYWxpemVkIHRleHQgZm9yIHRoZSB1bml0IGtleSB3aGVyZSB3ZSBhY2Nlc3MgVUk1IHByaXZhdGUgc3RydWN0dXJlXG5cdGNvbnN0IHVuaXRGb3JtYXQgPSBOdW1iZXJGb3JtYXQuZ2V0VW5pdEluc3RhbmNlKCkgYXMgdW5rbm93biBhcyB7XG5cdFx0b0xvY2FsZURhdGE/OiB7IG1EYXRhPzogeyB1bml0cz86IHsgc2hvcnQ6IFJlY29yZDxzdHJpbmcsIHsgZGlzcGxheU5hbWU/OiBzdHJpbmcgfT4gfSB9IH07XG5cdH07XG5cdGNvbnN0IGxvY2FsZURhdGEgPSB1bml0Rm9ybWF0Py5vTG9jYWxlRGF0YT8ubURhdGE7XG5cblx0aWYgKGxvY2FsZURhdGE/LnVuaXRzPy5zaG9ydCAmJiBsb2NhbGVEYXRhLnVuaXRzLnNob3J0W3VuaXRdICYmIGxvY2FsZURhdGEudW5pdHMuc2hvcnRbdW5pdF0uZGlzcGxheU5hbWUpIHtcblx0XHR1bml0ID0gbG9jYWxlRGF0YS51bml0cy5zaG9ydFt1bml0XS5kaXNwbGF5TmFtZSBhcyBzdHJpbmc7XG5cdH1cblxuXHRyZXR1cm4gdW5pdDtcbn07XG5cbmV4cG9ydCBjb25zdCBoYXNTZW1hbnRpY09iamVjdEluTmF2aWdhdGlvbk9yUHJvcGVydHkgPSAocHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSA9PiB7XG5cdGNvbnN0IHByb3BlcnR5ID0gcHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eTtcblx0aWYgKFNlbWFudGljT2JqZWN0SGVscGVyLmhhc1NlbWFudGljT2JqZWN0KHByb3BlcnR5KSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGNvbnN0IGxhc3ROYXZQcm9wID0gcHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoPy5uYXZpZ2F0aW9uUHJvcGVydGllcz8ubGVuZ3RoXG5cdFx0PyBwcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg/Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzW3Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aD8ubmF2aWdhdGlvblByb3BlcnRpZXM/Lmxlbmd0aCAtIDFdXG5cdFx0OiBudWxsO1xuXHRpZiAoXG5cdFx0IWxhc3ROYXZQcm9wIHx8XG5cdFx0cHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbj8ubmF2aWdhdGlvblByb3BlcnRpZXM/LmZpbmQoXG5cdFx0XHQoY29udGV4dE5hdlByb3ApID0+IGNvbnRleHROYXZQcm9wLm5hbWUgPT09IGxhc3ROYXZQcm9wLm5hbWVcblx0XHQpXG5cdCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRyZXR1cm4gU2VtYW50aWNPYmplY3RIZWxwZXIuaGFzU2VtYW50aWNPYmplY3QobGFzdE5hdlByb3ApO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGRhdGFNb2RlbE9iamVjdFBhdGggd2l0aCB0aGUgdmFsdWUgcHJvcGVydHkgYXMgdGFyZ2V0T2JqZWN0IGlmIGl0IGV4aXN0c1xuICogZm9yIGEgZGF0YU1vZGVsT2JqZWN0UGF0aCB0YXJnZXRpbmcgYSBEYXRhRmllbGQgb3IgYSBEYXRhUG9pbnQgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGhcbiAqIEByZXR1cm5zIFRoZSBkYXRhTW9kZWxPYmplY3RQYXRoIHRhcmdldGlpbmcgdGhlIHZhbHVlIHByb3BlcnR5IG9yIHVuZGVmaW5lZFxuICovXG5leHBvcnQgY29uc3QgZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aEZvclZhbHVlID0gKGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogRGF0YU1vZGVsT2JqZWN0UGF0aCB8IHVuZGVmaW5lZCA9PiB7XG5cdGlmICghaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0KSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRsZXQgdmFsdWVQYXRoID0gXCJcIjtcblx0Ly8gZGF0YSBwb2ludCBhbm5vdGF0aW9ucyBuZWVkIG5vdCBoYXZlICRUeXBlIGRlZmluZWQsIHNvIGFkZCBpdCBpZiBtaXNzaW5nXG5cdGlmIChpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIikge1xuXHRcdGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC4kVHlwZSA9IGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC4kVHlwZSB8fCBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlO1xuXHR9XG5cdHN3aXRjaCAoaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uOlxuXHRcdFx0aWYgKHR5cGVvZiBpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVmFsdWUgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0dmFsdWVQYXRoID0gaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlZhbHVlLnBhdGg7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0XHRpZiAoaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlRhcmdldC4kdGFyZ2V0KSB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVGFyZ2V0LiR0YXJnZXQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZCB8fFxuXHRcdFx0XHRcdGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5UYXJnZXQuJHRhcmdldC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRpZiAoaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlRhcmdldC52YWx1ZS5pbmRleE9mKFwiL1wiKSA+IDApIHtcblx0XHRcdFx0XHRcdHZhbHVlUGF0aCA9IGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5UYXJnZXQudmFsdWUucmVwbGFjZShcblx0XHRcdFx0XHRcdFx0L1xcL0AuKi8sXG5cdFx0XHRcdFx0XHRcdGAvJHtpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVGFyZ2V0LiR0YXJnZXQuVmFsdWU/LnBhdGh9YFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dmFsdWVQYXRoID0gaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlRhcmdldC4kdGFyZ2V0LlZhbHVlPy5wYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YWx1ZVBhdGggPSBpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVGFyZ2V0Py5wYXRoO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdGlmICh2YWx1ZVBhdGggJiYgdmFsdWVQYXRoLmxlbmd0aCA+IDApIHtcblx0XHRyZXR1cm4gZW5oYW5jZURhdGFNb2RlbFBhdGgoaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgsIHZhbHVlUGF0aCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcblxuLyoqXG4gKiBHZXQgdGhlIHByb3BlcnR5IG9yIHRoZSBuYXZpZ2F0aW9uIHByb3BlcnR5IGluICBpdHMgcmVsYXRpdmUgcGF0aCB0aGF0IGhvbGRzIHNlbWFudGljT2JqZWN0IGFubm90YXRpb24gaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSBkYXRhTW9kZWxPYmplY3RQYXRoXG4gKiBAcmV0dXJucyBBIHByb3BlcnR5IG9yIGEgTmF2UHJvcGVydHkgb3IgdW5kZWZpbmVkXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCA9IChkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSA9PiB7XG5cdGxldCBwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdDogUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHkgfCB1bmRlZmluZWQ7XG5cdGlmIChoYXNTZW1hbnRpY09iamVjdChkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eSB8IE5hdmlnYXRpb25Qcm9wZXJ0eSkpIHtcblx0XHRwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0IGFzIFByb3BlcnR5IHwgTmF2aWdhdGlvblByb3BlcnR5O1xuXHR9IGVsc2UgaWYgKGRhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuXHRcdC8vIHRoZXJlIGFyZSBubyBzZW1hbnRpYyBvYmplY3RzIG9uIHRoZSBwcm9wZXJ0eSBpdHNlbGYgc28gd2UgbG9vayBmb3Igc29tZSBvbiBuYXYgcHJvcGVydGllc1xuXHRcdGZvciAoY29uc3QgbmF2UHJvcGVydHkgb2YgZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcykge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQhZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24/Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZpbmQoXG5cdFx0XHRcdFx0KGNvbnRleHROYXZQcm9wKSA9PiBjb250ZXh0TmF2UHJvcC5mdWxseVF1YWxpZmllZE5hbWUgPT09IG5hdlByb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdFx0XHQpICYmXG5cdFx0XHRcdCFwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0XHRoYXNTZW1hbnRpY09iamVjdChuYXZQcm9wZXJ0eSlcblx0XHRcdCkge1xuXHRcdFx0XHRwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCA9IG5hdlByb3BlcnR5O1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gcHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3Q7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBjb25zaWRlcmVkIHByb3BlcnR5IGlzIGEgbm9uLWluc2VydGFibGUgcHJvcGVydHlcbiAqIEEgZmlyc3QgY2hlY2sgaXMgZG9uZSBvbiB0aGUgbGFzdCBuYXZpZ2F0aW9uIGZyb20gdGhlIGNvbnRleHRMb2NhdGlvbjpcbiAqIFx0LSBJZiB0aGUgYW5ub3RhdGlvbiAnbm9uSW5zZXJ0YWJsZVByb3BlcnR5JyBpcyBmb3VuZCBhbmQgdGhlIHByb3BlcnR5IGlzIGxpc3RlZCwgdGhlbiB0aGUgcHJvcGVydHkgaXMgbm9uLWluc2VydGFibGUsXG4gKiAgLSBFbHNlIHRoZSBzYW1lIGNoZWNrIGlzIGRvbmUgb24gdGhlIHRhcmdldCBlbnRpdHkuXG4gKlxuICogQHBhcmFtIFByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aFxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgcHJvcGVydHkgaXMgbm90IGluc2VydGFibGVcbiAqL1xuZXhwb3J0IGNvbnN0IGhhc1Byb3BlcnR5SW5zZXJ0UmVzdHJpY3Rpb25zID0gKFByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IGJvb2xlYW4gPT4ge1xuXHRjb25zdCBsYXN0TmF2UHJvcCA9IFByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24/Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzPy5zbGljZSgtMSlbMF07XG5cdGNvbnN0IGlzQW5ub3RhdGVkV2l0aE5vbkluc2VydGFibGVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKG9iamVjdDogRW50aXR5U2V0IHwgTmF2aWdhdGlvblByb3BlcnR5KSB7XG5cdFx0cmV0dXJuICEhKG9iamVjdD8uYW5ub3RhdGlvbnM/LkNhcGFiaWxpdGllcyBhcyBDb2xsZWN0aW9uQW5ub3RhdGlvbnNCYXNlX0NhcGFiaWxpdGllcyB8IEVudGl0eVNldEFubm90YXRpb25zX0NhcGFiaWxpdGllcylcblx0XHRcdD8uSW5zZXJ0UmVzdHJpY3Rpb25zPy5Ob25JbnNlcnRhYmxlUHJvcGVydGllcztcblx0fTtcblx0Y29uc3QgaXNMaXN0ZWRJbk5vbkluc2VydGFibGVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKG9iamVjdDogRW50aXR5U2V0IHwgTmF2aWdhdGlvblByb3BlcnR5KSB7XG5cdFx0cmV0dXJuICEhKFxuXHRcdFx0b2JqZWN0Py5hbm5vdGF0aW9ucz8uQ2FwYWJpbGl0aWVzIGFzIENvbGxlY3Rpb25Bbm5vdGF0aW9uc0Jhc2VfQ2FwYWJpbGl0aWVzIHwgRW50aXR5U2V0QW5ub3RhdGlvbnNfQ2FwYWJpbGl0aWVzXG5cdFx0KT8uSW5zZXJ0UmVzdHJpY3Rpb25zPy5Ob25JbnNlcnRhYmxlUHJvcGVydGllcz8uc29tZSgobm9uSW5zZXJ0YWJsZVByb3BlcnR5KSA9PiB7XG5cdFx0XHRyZXR1cm4gbm9uSW5zZXJ0YWJsZVByb3BlcnR5Py4kdGFyZ2V0Py5uYW1lID09PSBQcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5uYW1lO1xuXHRcdH0pO1xuXHR9O1xuXHRpZiAobGFzdE5hdlByb3AgJiYgaXNBbm5vdGF0ZWRXaXRoTm9uSW5zZXJ0YWJsZVByb3BlcnRpZXMobGFzdE5hdlByb3AgYXMgTmF2aWdhdGlvblByb3BlcnR5KSkge1xuXHRcdHJldHVybiBpc0xpc3RlZEluTm9uSW5zZXJ0YWJsZVByb3BlcnRpZXMobGFzdE5hdlByb3AgYXMgTmF2aWdhdGlvblByb3BlcnR5KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0ISFQcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5U2V0ICYmXG5cdFx0XHRpc0xpc3RlZEluTm9uSW5zZXJ0YWJsZVByb3BlcnRpZXMoUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVNldCBhcyBFbnRpdHlTZXQpXG5cdFx0KTtcblx0fVxufTtcblxuLyoqXG4gKiBHZXQgdGhlIGJpbmRpbmcgZm9yIHRoZSBkcmFmdCBpbmRpY2F0b3IgdmlzaWJpbGl0eS5cbiAqXG4gKiBAcGFyYW0gZHJhZnRJbmRpY2F0b3JLZXlcbiAqIEByZXR1cm5zICBUaGUgdmlzaWJpbGl0eSBiaW5kaW5nIGV4cHJlc3Npb24uXG4gKi9cbmV4cG9ydCBjb25zdCBnZXREcmFmdEluZGljYXRvclZpc2libGVCaW5kaW5nID0gKGRyYWZ0SW5kaWNhdG9yS2V5OiBzdHJpbmcpID0+IHtcblx0cmV0dXJuIGRyYWZ0SW5kaWNhdG9yS2V5XG5cdFx0PyBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0Zm9ybWF0UmVzdWx0KFxuXHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdGNvbnN0YW50KGRyYWZ0SW5kaWNhdG9yS2V5KSxcblx0XHRcdFx0XHRcdHBhdGhJbk1vZGVsKFwic2VtYW50aWNLZXlIYXNEcmFmdEluZGljYXRvclwiLCBcImludGVybmFsXCIpLFxuXHRcdFx0XHRcdFx0cGF0aEluTW9kZWwoXCJIYXNEcmFmdEVudGl0eVwiKSxcblx0XHRcdFx0XHRcdHBhdGhJbk1vZGVsKFwiSXNBY3RpdmVFbnRpdHlcIiksXG5cdFx0XHRcdFx0XHRwYXRoSW5Nb2RlbChcImhpZGVEcmFmdEluZm9cIiwgXCJwYWdlSW50ZXJuYWxcIilcblx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdFwic2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZFJ1bnRpbWUuaXNEcmFmdEluZGljYXRvclZpc2libGVcIlxuXHRcdFx0XHQpXG5cdFx0ICApXG5cdFx0OiBcImZhbHNlXCI7XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUErQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNQSxxQ0FBcUMsR0FBRyxVQUNwREMsMEJBQXlELEVBQ3pEQyxlQUFvQyxFQUNKO0lBQ2hDLE9BQU9DLG9CQUFvQixDQUFDRiwwQkFBMEIsRUFBRSxhQUFhLEVBQUdHLFVBQVUsSUFB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