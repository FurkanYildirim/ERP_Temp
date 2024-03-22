/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/PropertyHelper", "../helpers/DataFieldHelper"], function (TypeGuards, DisplayModeFormatter, PropertyHelper, DataFieldHelper) {
  "use strict";

  var _exports = {};
  var isReferencePropertyStaticallyHidden = DataFieldHelper.isReferencePropertyStaticallyHidden;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getAssociatedTimezoneProperty = PropertyHelper.getAssociatedTimezoneProperty;
  var getAssociatedCurrencyProperty = PropertyHelper.getAssociatedCurrencyProperty;
  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  var isProperty = TypeGuards.isProperty;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  /**
   * Identifies if the given dataFieldAbstract that is passed is a "DataFieldForActionAbstract".
   * DataFieldForActionAbstract has an inline action defined.
   *
   * @param dataField DataField to be evaluated
   * @returns Validates that dataField is a DataFieldForActionAbstractType
   */
  function isDataFieldForActionAbstract(dataField) {
    return dataField.hasOwnProperty("Action");
  }

  /**
   * Identifies if the given dataFieldAbstract that is passed is a "isDataFieldForAnnotation".
   * isDataFieldForAnnotation has an inline $Type property that can be used.
   *
   * @param dataField DataField to be evaluated
   * @returns Validates that dataField is a DataFieldForAnnotation
   */
  _exports.isDataFieldForActionAbstract = isDataFieldForActionAbstract;
  function isDataFieldForAnnotation(dataField) {
    return dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation";
  }
  _exports.isDataFieldForAnnotation = isDataFieldForAnnotation;
  function isDataFieldForAction(dataField) {
    return dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction";
  }

  /**
   * Identifies if the given dataFieldAbstract that is passed is a "DataFieldForIntentBasedNavigation".
   * DataFieldForIntentBasedNavigation has an inline $Type property that can be used.
   *
   * @param dataField DataField to be evaluated
   * @returns Validates that dataField is a DataFieldForIntentBasedNavigation
   */
  _exports.isDataFieldForAction = isDataFieldForAction;
  function isDataFieldForIntentBasedNavigation(dataField) {
    return dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";
  }

  /**
   * Identifies if the given dataFieldAbstract that is passed is a "DataField".
   * DataField has a value defined.
   *
   * @param dataField DataField to be evaluated
   * @returns Validate that dataField is a DataFieldTypes
   */
  _exports.isDataFieldForIntentBasedNavigation = isDataFieldForIntentBasedNavigation;
  function isDataFieldTypes(dataField) {
    return dataField.hasOwnProperty("Value");
  }

  /**
   * Determine if the data model object path targeting a dataField for action opens up a dialog.
   *
   * @param dataModelObjectPath DataModelObjectPath
   * @returns `Dialog` | `None` if a dialog is needed
   */
  _exports.isDataFieldTypes = isDataFieldTypes;
  function isDataModelObjectPathForActionWithDialog(dataModelObjectPath) {
    const target = dataModelObjectPath.targetObject;
    return isActionWithDialog(isDataFieldForAction(target) ? target : undefined);
  }

  /**
   * Determine if the dataField for action opens up a dialog.
   *
   * @param dataField DataField for action
   * @returns `Dialog` | `None` if a dialog is needed
   */
  _exports.isDataModelObjectPathForActionWithDialog = isDataModelObjectPathForActionWithDialog;
  function isActionWithDialog(dataField) {
    const action = dataField === null || dataField === void 0 ? void 0 : dataField.ActionTarget;
    if (action) {
      var _action$annotations, _action$annotations$C;
      const bCritical = (_action$annotations = action.annotations) === null || _action$annotations === void 0 ? void 0 : (_action$annotations$C = _action$annotations.Common) === null || _action$annotations$C === void 0 ? void 0 : _action$annotations$C.IsActionCritical;
      if (action.parameters.length > 1 || bCritical) {
        return "Dialog";
      } else {
        return "None";
      }
    } else {
      return "None";
    }
  }

  /**
   * Retrieves the TargetValue from a DataPoint.
   *
   * @param source the target property or DataPoint
   * @returns The TargetValue as a decimal or a property path
   */
  _exports.isActionWithDialog = isActionWithDialog;
  function getTargetValueOnDataPoint(source) {
    let targetValue;
    if (isProperty(source)) {
      var _source$annotations, _source$annotations$U, _source$annotations$U2, _source$annotations$U3, _source$annotations$U4, _source$annotations2, _source$annotations2$, _source$annotations2$2, _source$annotations2$3, _source$annotations2$4;
      targetValue = ((_source$annotations = source.annotations) === null || _source$annotations === void 0 ? void 0 : (_source$annotations$U = _source$annotations.UI) === null || _source$annotations$U === void 0 ? void 0 : (_source$annotations$U2 = _source$annotations$U.DataFieldDefault) === null || _source$annotations$U2 === void 0 ? void 0 : (_source$annotations$U3 = _source$annotations$U2.Target) === null || _source$annotations$U3 === void 0 ? void 0 : (_source$annotations$U4 = _source$annotations$U3.$target) === null || _source$annotations$U4 === void 0 ? void 0 : _source$annotations$U4.TargetValue) ?? ((_source$annotations2 = source.annotations) === null || _source$annotations2 === void 0 ? void 0 : (_source$annotations2$ = _source$annotations2.UI) === null || _source$annotations2$ === void 0 ? void 0 : (_source$annotations2$2 = _source$annotations2$.DataFieldDefault) === null || _source$annotations2$2 === void 0 ? void 0 : (_source$annotations2$3 = _source$annotations2$2.Target) === null || _source$annotations2$3 === void 0 ? void 0 : (_source$annotations2$4 = _source$annotations2$3.$target) === null || _source$annotations2$4 === void 0 ? void 0 : _source$annotations2$4.MaximumValue);
    } else {
      targetValue = source.TargetValue ?? source.MaximumValue;
    }
    if (typeof targetValue === "number") {
      return targetValue.toString();
    }
    return isPathAnnotationExpression(targetValue) ? targetValue : "100";
  }

  /**
   * Check if a property uses a DataPoint within a DataFieldDefault.
   *
   * @param property The property to be checked
   * @returns `true` if the referenced property has a DataPoint within the DataFieldDefault, false else
   * @private
   */
  _exports.getTargetValueOnDataPoint = getTargetValueOnDataPoint;
  const isDataPointFromDataFieldDefault = function (property) {
    var _property$annotations, _property$annotations2, _property$annotations3, _property$annotations4, _property$annotations5;
    return ((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.DataFieldDefault) === null || _property$annotations3 === void 0 ? void 0 : (_property$annotations4 = _property$annotations3.Target) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.$target) === null || _property$annotations5 === void 0 ? void 0 : _property$annotations5.$Type) === "com.sap.vocabularies.UI.v1.DataPointType";
  };
  _exports.isDataPointFromDataFieldDefault = isDataPointFromDataFieldDefault;
  function getSemanticObjectPath(converterContext, object) {
    if (typeof object === "object") {
      var _object$Value;
      if (isDataFieldTypes(object) && (_object$Value = object.Value) !== null && _object$Value !== void 0 && _object$Value.$target) {
        var _object$Value2, _property$annotations6, _property$annotations7;
        const property = (_object$Value2 = object.Value) === null || _object$Value2 === void 0 ? void 0 : _object$Value2.$target;
        if ((property === null || property === void 0 ? void 0 : (_property$annotations6 = property.annotations) === null || _property$annotations6 === void 0 ? void 0 : (_property$annotations7 = _property$annotations6.Common) === null || _property$annotations7 === void 0 ? void 0 : _property$annotations7.SemanticObject) !== undefined) {
          return converterContext.getEntitySetBasedAnnotationPath(property === null || property === void 0 ? void 0 : property.fullyQualifiedName);
        }
      } else if (isProperty(object)) {
        var _object$annotations, _object$annotations$C;
        if ((object === null || object === void 0 ? void 0 : (_object$annotations = object.annotations) === null || _object$annotations === void 0 ? void 0 : (_object$annotations$C = _object$annotations.Common) === null || _object$annotations$C === void 0 ? void 0 : _object$annotations$C.SemanticObject) !== undefined) {
          return converterContext.getEntitySetBasedAnnotationPath(object === null || object === void 0 ? void 0 : object.fullyQualifiedName);
        }
      }
    }
    return undefined;
  }

  /**
   * Returns the navigation path prefix for a property path.
   *
   * @param path The property path For e.g. /EntityType/Navigation/Property
   * @returns The navigation path prefix For e.g. /EntityType/Navigation/
   */
  _exports.getSemanticObjectPath = getSemanticObjectPath;
  function _getNavigationPathPrefix(path) {
    if (path) {
      return path.indexOf("/") > -1 ? path.substring(0, path.lastIndexOf("/") + 1) : "";
    }
    return "";
  }

  /**
   * Collect additional properties for the ALP table use-case.
   *
   * For e.g. If UI.Hidden points to a property, include this property in the additionalProperties of ComplexPropertyInfo object.
   *
   * @param target Property or DataField being processed
   * @param navigationPathPrefix Navigation path prefix, applicable in case of navigation properties.
   * @param tableType Table type.
   * @param relatedProperties The related properties identified so far.
   * @returns The related properties identified.
   */
  function _collectAdditionalPropertiesForAnalyticalTable(target, navigationPathPrefix, tableType, relatedProperties) {
    if (tableType === "AnalyticalTable") {
      var _target$annotations, _target$annotations$U;
      const hiddenAnnotation = (_target$annotations = target.annotations) === null || _target$annotations === void 0 ? void 0 : (_target$annotations$U = _target$annotations.UI) === null || _target$annotations$U === void 0 ? void 0 : _target$annotations$U.Hidden;
      if (hiddenAnnotation !== null && hiddenAnnotation !== void 0 && hiddenAnnotation.path && isProperty(hiddenAnnotation.$target)) {
        const hiddenAnnotationPropertyPath = navigationPathPrefix + hiddenAnnotation.path;
        // This property should be added to additionalProperties map for the ALP table use-case.
        relatedProperties.additionalProperties[hiddenAnnotationPropertyPath] = hiddenAnnotation.$target;
      }
      const criticality = target.Criticality;
      if (criticality !== null && criticality !== void 0 && criticality.path && isProperty(criticality === null || criticality === void 0 ? void 0 : criticality.$target)) {
        const criticalityPropertyPath = navigationPathPrefix + criticality.path;
        relatedProperties.additionalProperties[criticalityPropertyPath] = criticality === null || criticality === void 0 ? void 0 : criticality.$target;
      }
    }
    return relatedProperties;
  }

  /**
   * Collect related properties from a property's annotations.
   *
   * @param path The property path
   * @param property The property to be considered
   * @param converterContext The converter context
   * @param ignoreSelf Whether to exclude the same property from related properties.
   * @param tableType The table type.
   * @param relatedProperties The related properties identified so far.
   * @param addUnitInTemplate True if the unit/currency property needs to be added in the export template
   * @param isAnnotatedAsHidden True if the DataField or the property are statically hidden
   * @returns The related properties identified.
   */
  function collectRelatedProperties(path, property, converterContext, ignoreSelf, tableType) {
    let relatedProperties = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {
      properties: {},
      additionalProperties: {},
      textOnlyPropertiesFromTextAnnotation: []
    };
    let addUnitInTemplate = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    let isAnnotatedAsHidden = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
    /**
     * Helper to push unique related properties.
     *
     * @param key The property path
     * @param value The properties object containing value property, description property...
     * @returns Index at which the property is available
     */
    function _pushUnique(key, value) {
      if (!relatedProperties.properties.hasOwnProperty(key)) {
        relatedProperties.properties[key] = value;
      }
      return Object.keys(relatedProperties.properties).indexOf(key);
    }

    /**
     * Helper to append the export settings template with a formatted text.
     *
     * @param value Formatted text
     */
    function _appendTemplate(value) {
      relatedProperties.exportSettingsTemplate = relatedProperties.exportSettingsTemplate ? `${relatedProperties.exportSettingsTemplate}${value}` : `${value}`;
    }
    if (path && property) {
      var _property$annotations8, _property$annotations9;
      let valueIndex;
      let targetValue;
      let currencyOrUoMIndex;
      let timezoneOrUoMIndex;
      let dataPointIndex;
      if (isAnnotatedAsHidden) {
        // Collect underlying property
        valueIndex = _pushUnique(path, property);
        _appendTemplate(`{${valueIndex}}`);
        return relatedProperties;
      }
      const navigationPathPrefix = _getNavigationPathPrefix(path);

      // Check for Text annotation.
      const textAnnotation = (_property$annotations8 = property.annotations) === null || _property$annotations8 === void 0 ? void 0 : (_property$annotations9 = _property$annotations8.Common) === null || _property$annotations9 === void 0 ? void 0 : _property$annotations9.Text;
      if (relatedProperties.exportSettingsTemplate) {
        // FieldGroup use-case. Need to add each Field in new line.
        _appendTemplate("\n");
        relatedProperties.exportSettingsWrapping = true;
      }
      if (textAnnotation !== null && textAnnotation !== void 0 && textAnnotation.path && textAnnotation !== null && textAnnotation !== void 0 && textAnnotation.$target) {
        // Check for Text Arrangement.
        const dataModelObjectPath = converterContext.getDataModelObjectPath();
        const textAnnotationPropertyPath = navigationPathPrefix + textAnnotation.path;
        const displayMode = getDisplayMode(property, dataModelObjectPath);
        let descriptionIndex;
        switch (displayMode) {
          case "Value":
            valueIndex = _pushUnique(path, property);
            _appendTemplate(`{${valueIndex}}`);
            break;
          case "Description":
            descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
            _appendTemplate(`{${descriptionIndex}}`);
            relatedProperties.textOnlyPropertiesFromTextAnnotation.push(textAnnotationPropertyPath);
            break;
          case "ValueDescription":
            valueIndex = _pushUnique(path, property);
            descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
            _appendTemplate(`{${valueIndex}} ({${descriptionIndex}})`);
            break;
          case "DescriptionValue":
            valueIndex = _pushUnique(path, property);
            descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
            _appendTemplate(`{${descriptionIndex}} ({${valueIndex}})`);
            break;
          // no default
        }
      } else {
        var _property$annotations10, _property$annotations11, _property$annotations12, _property$annotations13, _property$annotations14, _property$annotations15, _property$Target, _property$Target$$tar, _property$Target2, _property$Target2$$ta, _property$annotations16, _property$annotations17, _property$annotations18, _property$annotations19, _property$annotations20;
        // Check for field containing Currency Or Unit Properties or Timezone
        const currencyOrUoMProperty = getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property);
        const currencyOrUnitAnnotation = (property === null || property === void 0 ? void 0 : (_property$annotations10 = property.annotations) === null || _property$annotations10 === void 0 ? void 0 : (_property$annotations11 = _property$annotations10.Measures) === null || _property$annotations11 === void 0 ? void 0 : _property$annotations11.ISOCurrency) || (property === null || property === void 0 ? void 0 : (_property$annotations12 = property.annotations) === null || _property$annotations12 === void 0 ? void 0 : (_property$annotations13 = _property$annotations12.Measures) === null || _property$annotations13 === void 0 ? void 0 : _property$annotations13.Unit);
        const timezoneProperty = getAssociatedTimezoneProperty(property);
        const timezoneAnnotation = property === null || property === void 0 ? void 0 : (_property$annotations14 = property.annotations) === null || _property$annotations14 === void 0 ? void 0 : (_property$annotations15 = _property$annotations14.Common) === null || _property$annotations15 === void 0 ? void 0 : _property$annotations15.Timezone;
        if (currencyOrUoMProperty && currencyOrUnitAnnotation !== null && currencyOrUnitAnnotation !== void 0 && currencyOrUnitAnnotation.$target) {
          valueIndex = _pushUnique(path, property);
          currencyOrUoMIndex = _pushUnique(navigationPathPrefix + currencyOrUnitAnnotation.path, currencyOrUnitAnnotation.$target);
          if (addUnitInTemplate) {
            _appendTemplate(`{${valueIndex}}  {${currencyOrUoMIndex}}`);
          } else {
            relatedProperties.exportUnitName = navigationPathPrefix + currencyOrUnitAnnotation.path;
          }
        } else if (timezoneProperty && timezoneAnnotation !== null && timezoneAnnotation !== void 0 && timezoneAnnotation.$target) {
          valueIndex = _pushUnique(path, property);
          timezoneOrUoMIndex = _pushUnique(navigationPathPrefix + timezoneAnnotation.path, timezoneAnnotation.$target);
          if (addUnitInTemplate) {
            _appendTemplate(`{${valueIndex}}  {${timezoneOrUoMIndex}}`);
          } else {
            relatedProperties.exportTimezoneName = navigationPathPrefix + timezoneAnnotation.path;
          }
        } else if (((_property$Target = property.Target) === null || _property$Target === void 0 ? void 0 : (_property$Target$$tar = _property$Target.$target) === null || _property$Target$$tar === void 0 ? void 0 : _property$Target$$tar.$Type) === "com.sap.vocabularies.UI.v1.DataPointType" && !((_property$Target2 = property.Target) !== null && _property$Target2 !== void 0 && (_property$Target2$$ta = _property$Target2.$target) !== null && _property$Target2$$ta !== void 0 && _property$Target2$$ta.ValueFormat) || ((_property$annotations16 = property.annotations) === null || _property$annotations16 === void 0 ? void 0 : (_property$annotations17 = _property$annotations16.UI) === null || _property$annotations17 === void 0 ? void 0 : (_property$annotations18 = _property$annotations17.DataFieldDefault) === null || _property$annotations18 === void 0 ? void 0 : (_property$annotations19 = _property$annotations18.Target) === null || _property$annotations19 === void 0 ? void 0 : (_property$annotations20 = _property$annotations19.$target) === null || _property$annotations20 === void 0 ? void 0 : _property$annotations20.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
          var _property$Target3, _property$Target3$$ta, _property$Target4, _property$annotations21, _property$annotations22;
          const dataPointProperty = (_property$Target3 = property.Target) === null || _property$Target3 === void 0 ? void 0 : (_property$Target3$$ta = _property$Target3.$target) === null || _property$Target3$$ta === void 0 ? void 0 : _property$Target3$$ta.Value.$target;
          const datapointTarget = (_property$Target4 = property.Target) === null || _property$Target4 === void 0 ? void 0 : _property$Target4.$target;
          // DataPoint use-case using DataFieldDefault.
          const dataPointDefaultProperty = (_property$annotations21 = property.annotations) === null || _property$annotations21 === void 0 ? void 0 : (_property$annotations22 = _property$annotations21.UI) === null || _property$annotations22 === void 0 ? void 0 : _property$annotations22.DataFieldDefault;
          valueIndex = _pushUnique(navigationPathPrefix ? navigationPathPrefix + path : path, dataPointDefaultProperty ? property : dataPointProperty);
          targetValue = getTargetValueOnDataPoint(dataPointDefaultProperty ? property : datapointTarget);
          if (isProperty(targetValue.$target)) {
            //in case it's a dynamic targetValue
            targetValue = targetValue;
            dataPointIndex = _pushUnique(navigationPathPrefix ? navigationPathPrefix + targetValue.$target.name : targetValue.$target.name, targetValue.$target);
            _appendTemplate(`{${valueIndex}}/{${dataPointIndex}}`);
          } else {
            relatedProperties.exportDataPointTargetValue = targetValue;
            _appendTemplate(`{${valueIndex}}/${targetValue}`);
          }
        } else if (property.$Type === "com.sap.vocabularies.Communication.v1.ContactType") {
          var _property$fn, _property$fn2;
          const contactProperty = (_property$fn = property.fn) === null || _property$fn === void 0 ? void 0 : _property$fn.$target;
          const contactPropertyPath = (_property$fn2 = property.fn) === null || _property$fn2 === void 0 ? void 0 : _property$fn2.path;
          valueIndex = _pushUnique(navigationPathPrefix ? navigationPathPrefix + contactPropertyPath : contactPropertyPath, contactProperty);
          _appendTemplate(`{${valueIndex}}`);
        } else if (!ignoreSelf) {
          // Collect underlying property
          valueIndex = _pushUnique(path, property);
          _appendTemplate(`{${valueIndex}}`);
          if (currencyOrUnitAnnotation) {
            relatedProperties.exportUnitString = `${currencyOrUnitAnnotation}`; // Hard-coded currency/unit
          } else if (timezoneAnnotation) {
            relatedProperties.exportTimezoneString = `${timezoneAnnotation}`; // Hard-coded timezone
          }
        }
      }

      relatedProperties = _collectAdditionalPropertiesForAnalyticalTable(property, navigationPathPrefix, tableType, relatedProperties);
      if (Object.keys(relatedProperties.additionalProperties).length > 0 && Object.keys(relatedProperties.properties).length === 0) {
        // Collect underlying property if not collected already.
        // This is to ensure that additionalProperties are made available only to complex property infos.
        valueIndex = _pushUnique(path, property);
        _appendTemplate(`{${valueIndex}}`);
      }
    }
    return relatedProperties;
  }

  /**
   * Collect properties consumed by a DataField.
   * This is for populating the ComplexPropertyInfos of the table delegate.
   *
   * @param dataField The DataField for which the properties need to be identified.
   * @param converterContext The converter context.
   * @param tableType The table type.
   * @param relatedProperties The properties identified so far.
   * @param isEmbedded True if the DataField is embedded in another annotation (e.g. FieldGroup).
   * @returns The properties related to the DataField.
   */
  _exports.collectRelatedProperties = collectRelatedProperties;
  function collectRelatedPropertiesRecursively(dataField, converterContext, tableType) {
    var _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2;
    let relatedProperties = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
      properties: {},
      additionalProperties: {},
      textOnlyPropertiesFromTextAnnotation: []
    };
    let isEmbedded = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    let isStaticallyHidden = false;
    switch (dataField === null || dataField === void 0 ? void 0 : dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        if (dataField.Value) {
          var _property$$target, _property$$target$ann, _property$$target$ann2;
          const property = dataField.Value;
          isStaticallyHidden = isReferencePropertyStaticallyHidden((_property$$target = property.$target) === null || _property$$target === void 0 ? void 0 : (_property$$target$ann = _property$$target.annotations) === null || _property$$target$ann === void 0 ? void 0 : (_property$$target$ann2 = _property$$target$ann.UI) === null || _property$$target$ann2 === void 0 ? void 0 : _property$$target$ann2.DataFieldDefault) || isReferencePropertyStaticallyHidden(dataField) || false;
          relatedProperties = collectRelatedProperties(property.path, property.$target, converterContext, false, tableType, relatedProperties, isEmbedded, isStaticallyHidden);
          const navigationPathPrefix = _getNavigationPathPrefix(property.path);
          relatedProperties = _collectAdditionalPropertiesForAnalyticalTable(dataField, navigationPathPrefix, tableType, relatedProperties);
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        switch ((_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : (_dataField$Target$$ta = _dataField$Target.$target) === null || _dataField$Target$$ta === void 0 ? void 0 : _dataField$Target$$ta.$Type) {
          case "com.sap.vocabularies.UI.v1.FieldGroupType":
            (_dataField$Target$$ta2 = dataField.Target.$target.Data) === null || _dataField$Target$$ta2 === void 0 ? void 0 : _dataField$Target$$ta2.forEach(innerDataField => {
              relatedProperties = collectRelatedPropertiesRecursively(innerDataField, converterContext, tableType, relatedProperties, true);
            });
            break;
          case "com.sap.vocabularies.UI.v1.DataPointType":
            isStaticallyHidden = isReferencePropertyStaticallyHidden(dataField) ?? false;
            relatedProperties = collectRelatedProperties(dataField.Target.$target.Value.path, dataField, converterContext, false, tableType, relatedProperties, isEmbedded, isStaticallyHidden);
            break;
          case "com.sap.vocabularies.Communication.v1.ContactType":
            const dataFieldContact = dataField.Target.$target;
            isStaticallyHidden = isReferencePropertyStaticallyHidden(dataField) ?? false;
            relatedProperties = collectRelatedProperties(dataField.Target.value, dataFieldContact, converterContext, isStaticallyHidden, tableType, relatedProperties, isEmbedded, isStaticallyHidden);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
    return relatedProperties;
  }
  _exports.collectRelatedPropertiesRecursively = collectRelatedPropertiesRecursively;
  const getDataFieldDataType = function (oDataField) {
    var _Value, _Value$$target, _oDataField$Target, _oDataField$Target$$t;
    if (isProperty(oDataField)) {
      return oDataField.type;
    }
    let sDataType;
    switch (oDataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForActionGroup":
      case "com.sap.vocabularies.UI.v1.DataFieldWithActionGroup":
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        sDataType = undefined;
        break;
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        sDataType = oDataField === null || oDataField === void 0 ? void 0 : (_Value = oDataField.Value) === null || _Value === void 0 ? void 0 : (_Value$$target = _Value.$target) === null || _Value$$target === void 0 ? void 0 : _Value$$target.type;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
      default:
        const sDataTypeForDataFieldForAnnotation = (_oDataField$Target = oDataField.Target) === null || _oDataField$Target === void 0 ? void 0 : (_oDataField$Target$$t = _oDataField$Target.$target) === null || _oDataField$Target$$t === void 0 ? void 0 : _oDataField$Target$$t.$Type;
        if (sDataTypeForDataFieldForAnnotation) {
          var _oDataField$Target2;
          const dataFieldTarget = (_oDataField$Target2 = oDataField.Target) === null || _oDataField$Target2 === void 0 ? void 0 : _oDataField$Target2.$target;
          if (dataFieldTarget.$Type === "com.sap.vocabularies.Communication.v1.ContactType") {
            var _dataFieldTarget$fn, _dataFieldTarget$fn$$;
            sDataType = isPathAnnotationExpression(dataFieldTarget === null || dataFieldTarget === void 0 ? void 0 : dataFieldTarget.fn) && (dataFieldTarget === null || dataFieldTarget === void 0 ? void 0 : (_dataFieldTarget$fn = dataFieldTarget.fn) === null || _dataFieldTarget$fn === void 0 ? void 0 : (_dataFieldTarget$fn$$ = _dataFieldTarget$fn.$target) === null || _dataFieldTarget$fn$$ === void 0 ? void 0 : _dataFieldTarget$fn$$.type) || undefined;
          } else if (dataFieldTarget.$Type === "com.sap.vocabularies.UI.v1.DataPointType") {
            var _dataFieldTarget$Valu, _dataFieldTarget$Valu2, _dataFieldTarget$Valu3;
            sDataType = (dataFieldTarget === null || dataFieldTarget === void 0 ? void 0 : (_dataFieldTarget$Valu = dataFieldTarget.Value) === null || _dataFieldTarget$Valu === void 0 ? void 0 : (_dataFieldTarget$Valu2 = _dataFieldTarget$Valu.$Path) === null || _dataFieldTarget$Valu2 === void 0 ? void 0 : _dataFieldTarget$Valu2.$Type) || (dataFieldTarget === null || dataFieldTarget === void 0 ? void 0 : (_dataFieldTarget$Valu3 = dataFieldTarget.Value) === null || _dataFieldTarget$Valu3 === void 0 ? void 0 : _dataFieldTarget$Valu3.$target.type);
          } else {
            var _oDataField$Target3;
            // e.g. FieldGroup or Chart
            // FieldGroup Properties have no type, so we define it as a boolean type to prevent exceptions during the calculation of the width
            sDataType = ((_oDataField$Target3 = oDataField.Target) === null || _oDataField$Target3 === void 0 ? void 0 : _oDataField$Target3.$target.$Type) === "com.sap.vocabularies.UI.v1.ChartDefinitionType" ? undefined : "Edm.Boolean";
          }
        } else {
          sDataType = undefined;
        }
        break;
    }
    return sDataType;
  };
  _exports.getDataFieldDataType = getDataFieldDataType;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0IiwiZGF0YUZpZWxkIiwiaGFzT3duUHJvcGVydHkiLCJpc0RhdGFGaWVsZEZvckFubm90YXRpb24iLCIkVHlwZSIsImlzRGF0YUZpZWxkRm9yQWN0aW9uIiwiaXNEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJpc0RhdGFGaWVsZFR5cGVzIiwiaXNEYXRhTW9kZWxPYmplY3RQYXRoRm9yQWN0aW9uV2l0aERpYWxvZyIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJ0YXJnZXQiLCJ0YXJnZXRPYmplY3QiLCJpc0FjdGlvbldpdGhEaWFsb2ciLCJ1bmRlZmluZWQiLCJhY3Rpb24iLCJBY3Rpb25UYXJnZXQiLCJiQ3JpdGljYWwiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIklzQWN0aW9uQ3JpdGljYWwiLCJwYXJhbWV0ZXJzIiwibGVuZ3RoIiwiZ2V0VGFyZ2V0VmFsdWVPbkRhdGFQb2ludCIsInNvdXJjZSIsInRhcmdldFZhbHVlIiwiaXNQcm9wZXJ0eSIsIlVJIiwiRGF0YUZpZWxkRGVmYXVsdCIsIlRhcmdldCIsIiR0YXJnZXQiLCJUYXJnZXRWYWx1ZSIsIk1heGltdW1WYWx1ZSIsInRvU3RyaW5nIiwiaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24iLCJpc0RhdGFQb2ludEZyb21EYXRhRmllbGREZWZhdWx0IiwicHJvcGVydHkiLCJnZXRTZW1hbnRpY09iamVjdFBhdGgiLCJjb252ZXJ0ZXJDb250ZXh0Iiwib2JqZWN0IiwiVmFsdWUiLCJTZW1hbnRpY09iamVjdCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJfZ2V0TmF2aWdhdGlvblBhdGhQcmVmaXgiLCJwYXRoIiwiaW5kZXhPZiIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiX2NvbGxlY3RBZGRpdGlvbmFsUHJvcGVydGllc0ZvckFuYWx5dGljYWxUYWJsZSIsIm5hdmlnYXRpb25QYXRoUHJlZml4IiwidGFibGVUeXBlIiwicmVsYXRlZFByb3BlcnRpZXMiLCJoaWRkZW5Bbm5vdGF0aW9uIiwiSGlkZGVuIiwiaGlkZGVuQW5ub3RhdGlvblByb3BlcnR5UGF0aCIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwiY3JpdGljYWxpdHkiLCJDcml0aWNhbGl0eSIsImNyaXRpY2FsaXR5UHJvcGVydHlQYXRoIiwiY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzIiwiaWdub3JlU2VsZiIsInByb3BlcnRpZXMiLCJ0ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb24iLCJhZGRVbml0SW5UZW1wbGF0ZSIsImlzQW5ub3RhdGVkQXNIaWRkZW4iLCJfcHVzaFVuaXF1ZSIsImtleSIsInZhbHVlIiwiT2JqZWN0Iiwia2V5cyIsIl9hcHBlbmRUZW1wbGF0ZSIsImV4cG9ydFNldHRpbmdzVGVtcGxhdGUiLCJ2YWx1ZUluZGV4IiwiY3VycmVuY3lPclVvTUluZGV4IiwidGltZXpvbmVPclVvTUluZGV4IiwiZGF0YVBvaW50SW5kZXgiLCJ0ZXh0QW5ub3RhdGlvbiIsIlRleHQiLCJleHBvcnRTZXR0aW5nc1dyYXBwaW5nIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCIsInRleHRBbm5vdGF0aW9uUHJvcGVydHlQYXRoIiwiZGlzcGxheU1vZGUiLCJnZXREaXNwbGF5TW9kZSIsImRlc2NyaXB0aW9uSW5kZXgiLCJwdXNoIiwiY3VycmVuY3lPclVvTVByb3BlcnR5IiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkiLCJnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5IiwiY3VycmVuY3lPclVuaXRBbm5vdGF0aW9uIiwiTWVhc3VyZXMiLCJJU09DdXJyZW5jeSIsIlVuaXQiLCJ0aW1lem9uZVByb3BlcnR5IiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkiLCJ0aW1lem9uZUFubm90YXRpb24iLCJUaW1lem9uZSIsImV4cG9ydFVuaXROYW1lIiwiZXhwb3J0VGltZXpvbmVOYW1lIiwiVmFsdWVGb3JtYXQiLCJkYXRhUG9pbnRQcm9wZXJ0eSIsImRhdGFwb2ludFRhcmdldCIsImRhdGFQb2ludERlZmF1bHRQcm9wZXJ0eSIsIm5hbWUiLCJleHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSIsImNvbnRhY3RQcm9wZXJ0eSIsImZuIiwiY29udGFjdFByb3BlcnR5UGF0aCIsImV4cG9ydFVuaXRTdHJpbmciLCJleHBvcnRUaW1lem9uZVN0cmluZyIsImNvbGxlY3RSZWxhdGVkUHJvcGVydGllc1JlY3Vyc2l2ZWx5IiwiaXNFbWJlZGRlZCIsImlzU3RhdGljYWxseUhpZGRlbiIsImlzUmVmZXJlbmNlUHJvcGVydHlTdGF0aWNhbGx5SGlkZGVuIiwiRGF0YSIsImZvckVhY2giLCJpbm5lckRhdGFGaWVsZCIsImRhdGFGaWVsZENvbnRhY3QiLCJnZXREYXRhRmllbGREYXRhVHlwZSIsIm9EYXRhRmllbGQiLCJ0eXBlIiwic0RhdGFUeXBlIiwic0RhdGFUeXBlRm9yRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiIsImRhdGFGaWVsZFRhcmdldCIsIiRQYXRoIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJEYXRhRmllbGQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcmltaXRpdmVUeXBlLCBQcm9wZXJ0eSwgUHJvcGVydHlQYXRoIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IENvbnRhY3QgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW11bmljYXRpb25cIjtcbmltcG9ydCB7IENvbW11bmljYXRpb25Bbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW11bmljYXRpb25cIjtcbmltcG9ydCB0eXBlIHtcblx0RGF0YUZpZWxkLFxuXHREYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHREYXRhRmllbGRGb3JBY3Rpb24sXG5cdERhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0VHlwZXMsXG5cdERhdGFGaWVsZEZvckFubm90YXRpb24sXG5cdERhdGFGaWVsZEZvckFubm90YXRpb25UeXBlcyxcblx0RGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHREYXRhRmllbGRUeXBlcyxcblx0RGF0YVBvaW50VHlwZVxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB0eXBlIHsgVGFibGVUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgeyBpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiwgaXNQcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB7IGdldERpc3BsYXlNb2RlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGlzcGxheU1vZGVGb3JtYXR0ZXJcIjtcbmltcG9ydCB7XG5cdGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5LFxuXHRnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eSxcblx0Z2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eVxufSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcIi4uLy4uL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4gfSBmcm9tIFwiLi4vaGVscGVycy9EYXRhRmllbGRIZWxwZXJcIjtcblxuZXhwb3J0IHR5cGUgQ29tcGxleFByb3BlcnR5SW5mbyA9IHtcblx0cHJvcGVydGllczogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+O1xuXHRhZGRpdGlvbmFsUHJvcGVydGllczogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+O1xuXHRleHBvcnRTZXR0aW5nc1RlbXBsYXRlPzogc3RyaW5nO1xuXHRleHBvcnRTZXR0aW5nc1dyYXBwaW5nPzogYm9vbGVhbjtcblx0ZXhwb3J0VW5pdE5hbWU/OiBzdHJpbmc7XG5cdGV4cG9ydFVuaXRTdHJpbmc/OiBzdHJpbmc7XG5cdGV4cG9ydFRpbWV6b25lTmFtZT86IHN0cmluZztcblx0ZXhwb3J0VGltZXpvbmVTdHJpbmc/OiBzdHJpbmc7XG5cdHRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbjogc3RyaW5nW107XG5cdGV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlPzogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBJZGVudGlmaWVzIGlmIHRoZSBnaXZlbiBkYXRhRmllbGRBYnN0cmFjdCB0aGF0IGlzIHBhc3NlZCBpcyBhIFwiRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3RcIi5cbiAqIERhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0IGhhcyBhbiBpbmxpbmUgYWN0aW9uIGRlZmluZWQuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBEYXRhRmllbGQgdG8gYmUgZXZhbHVhdGVkXG4gKiBAcmV0dXJucyBWYWxpZGF0ZXMgdGhhdCBkYXRhRmllbGQgaXMgYSBEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdFR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKTogZGF0YUZpZWxkIGlzIERhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0VHlwZXMge1xuXHRyZXR1cm4gKGRhdGFGaWVsZCBhcyBEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdFR5cGVzKS5oYXNPd25Qcm9wZXJ0eShcIkFjdGlvblwiKTtcbn1cblxuLyoqXG4gKiBJZGVudGlmaWVzIGlmIHRoZSBnaXZlbiBkYXRhRmllbGRBYnN0cmFjdCB0aGF0IGlzIHBhc3NlZCBpcyBhIFwiaXNEYXRhRmllbGRGb3JBbm5vdGF0aW9uXCIuXG4gKiBpc0RhdGFGaWVsZEZvckFubm90YXRpb24gaGFzIGFuIGlubGluZSAkVHlwZSBwcm9wZXJ0eSB0aGF0IGNhbiBiZSB1c2VkLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YUZpZWxkIHRvIGJlIGV2YWx1YXRlZFxuICogQHJldHVybnMgVmFsaWRhdGVzIHRoYXQgZGF0YUZpZWxkIGlzIGEgRGF0YUZpZWxkRm9yQW5ub3RhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRhRmllbGRGb3JBbm5vdGF0aW9uKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyk6IGRhdGFGaWVsZCBpcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uIHtcblx0cmV0dXJuIGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0YUZpZWxkRm9yQWN0aW9uKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyk6IGRhdGFGaWVsZCBpcyBEYXRhRmllbGRGb3JBY3Rpb24ge1xuXHRyZXR1cm4gZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb247XG59XG5cbi8qKlxuICogSWRlbnRpZmllcyBpZiB0aGUgZ2l2ZW4gZGF0YUZpZWxkQWJzdHJhY3QgdGhhdCBpcyBwYXNzZWQgaXMgYSBcIkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiLlxuICogRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIGhhcyBhbiBpbmxpbmUgJFR5cGUgcHJvcGVydHkgdGhhdCBjYW4gYmUgdXNlZC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIERhdGFGaWVsZCB0byBiZSBldmFsdWF0ZWRcbiAqIEByZXR1cm5zIFZhbGlkYXRlcyB0aGF0IGRhdGFGaWVsZCBpcyBhIERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbihkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpOiBkYXRhRmllbGQgaXMgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIHtcblx0cmV0dXJuIGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uO1xufVxuXG4vKipcbiAqIElkZW50aWZpZXMgaWYgdGhlIGdpdmVuIGRhdGFGaWVsZEFic3RyYWN0IHRoYXQgaXMgcGFzc2VkIGlzIGEgXCJEYXRhRmllbGRcIi5cbiAqIERhdGFGaWVsZCBoYXMgYSB2YWx1ZSBkZWZpbmVkLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YUZpZWxkIHRvIGJlIGV2YWx1YXRlZFxuICogQHJldHVybnMgVmFsaWRhdGUgdGhhdCBkYXRhRmllbGQgaXMgYSBEYXRhRmllbGRUeXBlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRhRmllbGRUeXBlcyhkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCB1bmtub3duKTogZGF0YUZpZWxkIGlzIERhdGFGaWVsZFR5cGVzIHtcblx0cmV0dXJuIChkYXRhRmllbGQgYXMgRGF0YUZpZWxkVHlwZXMpLmhhc093blByb3BlcnR5KFwiVmFsdWVcIik7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHRoZSBkYXRhIG1vZGVsIG9iamVjdCBwYXRoIHRhcmdldGluZyBhIGRhdGFGaWVsZCBmb3IgYWN0aW9uIG9wZW5zIHVwIGEgZGlhbG9nLlxuICpcbiAqIEBwYXJhbSBkYXRhTW9kZWxPYmplY3RQYXRoIERhdGFNb2RlbE9iamVjdFBhdGhcbiAqIEByZXR1cm5zIGBEaWFsb2dgIHwgYE5vbmVgIGlmIGEgZGlhbG9nIGlzIG5lZWRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRhTW9kZWxPYmplY3RQYXRoRm9yQWN0aW9uV2l0aERpYWxvZyhkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdGNvbnN0IHRhcmdldCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRyZXR1cm4gaXNBY3Rpb25XaXRoRGlhbG9nKGlzRGF0YUZpZWxkRm9yQWN0aW9uKHRhcmdldCkgPyB0YXJnZXQgOiB1bmRlZmluZWQpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB0aGUgZGF0YUZpZWxkIGZvciBhY3Rpb24gb3BlbnMgdXAgYSBkaWFsb2cuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBEYXRhRmllbGQgZm9yIGFjdGlvblxuICogQHJldHVybnMgYERpYWxvZ2AgfCBgTm9uZWAgaWYgYSBkaWFsb2cgaXMgbmVlZGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0FjdGlvbldpdGhEaWFsb2coZGF0YUZpZWxkPzogRGF0YUZpZWxkRm9yQWN0aW9uKTogXCJEaWFsb2dcIiB8IFwiTm9uZVwiIHtcblx0Y29uc3QgYWN0aW9uID0gZGF0YUZpZWxkPy5BY3Rpb25UYXJnZXQ7XG5cdGlmIChhY3Rpb24pIHtcblx0XHRjb25zdCBiQ3JpdGljYWwgPSBhY3Rpb24uYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNBY3Rpb25Dcml0aWNhbDtcblx0XHRpZiAoYWN0aW9uLnBhcmFtZXRlcnMubGVuZ3RoID4gMSB8fCBiQ3JpdGljYWwpIHtcblx0XHRcdHJldHVybiBcIkRpYWxvZ1wiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJOb25lXCI7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBcIk5vbmVcIjtcblx0fVxufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgVGFyZ2V0VmFsdWUgZnJvbSBhIERhdGFQb2ludC5cbiAqXG4gKiBAcGFyYW0gc291cmNlIHRoZSB0YXJnZXQgcHJvcGVydHkgb3IgRGF0YVBvaW50XG4gKiBAcmV0dXJucyBUaGUgVGFyZ2V0VmFsdWUgYXMgYSBkZWNpbWFsIG9yIGEgcHJvcGVydHkgcGF0aFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXJnZXRWYWx1ZU9uRGF0YVBvaW50KHNvdXJjZTogUHJvcGVydHkgfCBEYXRhUG9pbnRUeXBlKTogc3RyaW5nIHwgUHJvcGVydHlQYXRoIHtcblx0bGV0IHRhcmdldFZhbHVlOiBzdHJpbmcgfCBQcm9wZXJ0eVBhdGggfCBudW1iZXI7XG5cdGlmIChpc1Byb3BlcnR5KHNvdXJjZSkpIHtcblx0XHR0YXJnZXRWYWx1ZSA9XG5cdFx0XHQoKHNvdXJjZS5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQgYXMgRGF0YUZpZWxkRm9yQW5ub3RhdGlvblR5cGVzKT8uVGFyZ2V0Py4kdGFyZ2V0IGFzIERhdGFQb2ludFR5cGUpPy5UYXJnZXRWYWx1ZSA/P1xuXHRcdFx0KChzb3VyY2UuYW5ub3RhdGlvbnM/LlVJPy5EYXRhRmllbGREZWZhdWx0IGFzIERhdGFGaWVsZEZvckFubm90YXRpb25UeXBlcyk/LlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnRUeXBlKT8uTWF4aW11bVZhbHVlO1xuXHR9IGVsc2Uge1xuXHRcdHRhcmdldFZhbHVlID0gc291cmNlLlRhcmdldFZhbHVlID8/IHNvdXJjZS5NYXhpbXVtVmFsdWU7XG5cdH1cblx0aWYgKHR5cGVvZiB0YXJnZXRWYWx1ZSA9PT0gXCJudW1iZXJcIikge1xuXHRcdHJldHVybiB0YXJnZXRWYWx1ZS50b1N0cmluZygpO1xuXHR9XG5cdHJldHVybiBpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbih0YXJnZXRWYWx1ZSkgPyB0YXJnZXRWYWx1ZSA6IFwiMTAwXCI7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBwcm9wZXJ0eSB1c2VzIGEgRGF0YVBvaW50IHdpdGhpbiBhIERhdGFGaWVsZERlZmF1bHQuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSBwcm9wZXJ0eSB0byBiZSBjaGVja2VkXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHJlZmVyZW5jZWQgcHJvcGVydHkgaGFzIGEgRGF0YVBvaW50IHdpdGhpbiB0aGUgRGF0YUZpZWxkRGVmYXVsdCwgZmFsc2UgZWxzZVxuICogQHByaXZhdGVcbiAqL1xuXG5leHBvcnQgY29uc3QgaXNEYXRhUG9pbnRGcm9tRGF0YUZpZWxkRGVmYXVsdCA9IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuIChcblx0XHQocHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5EYXRhRmllbGREZWZhdWx0IGFzIERhdGFGaWVsZEZvckFubm90YXRpb24pPy5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlXG5cdCk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VtYW50aWNPYmplY3RQYXRoKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIG9iamVjdDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IFByb3BlcnR5KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKHR5cGVvZiBvYmplY3QgPT09IFwib2JqZWN0XCIpIHtcblx0XHRpZiAoaXNEYXRhRmllbGRUeXBlcyhvYmplY3QpICYmIG9iamVjdC5WYWx1ZT8uJHRhcmdldCkge1xuXHRcdFx0Y29uc3QgcHJvcGVydHkgPSBvYmplY3QuVmFsdWU/LiR0YXJnZXQ7XG5cdFx0XHRpZiAocHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LlNlbWFudGljT2JqZWN0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cmV0dXJuIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChwcm9wZXJ0eT8uZnVsbHlRdWFsaWZpZWROYW1lKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGlzUHJvcGVydHkob2JqZWN0KSkge1xuXHRcdFx0aWYgKG9iamVjdD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uU2VtYW50aWNPYmplY3QgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXR1cm4gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKG9iamVjdD8uZnVsbHlRdWFsaWZpZWROYW1lKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBuYXZpZ2F0aW9uIHBhdGggcHJlZml4IGZvciBhIHByb3BlcnR5IHBhdGguXG4gKlxuICogQHBhcmFtIHBhdGggVGhlIHByb3BlcnR5IHBhdGggRm9yIGUuZy4gL0VudGl0eVR5cGUvTmF2aWdhdGlvbi9Qcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIG5hdmlnYXRpb24gcGF0aCBwcmVmaXggRm9yIGUuZy4gL0VudGl0eVR5cGUvTmF2aWdhdGlvbi9cbiAqL1xuZnVuY3Rpb24gX2dldE5hdmlnYXRpb25QYXRoUHJlZml4KHBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG5cdGlmIChwYXRoKSB7XG5cdFx0cmV0dXJuIHBhdGguaW5kZXhPZihcIi9cIikgPiAtMSA/IHBhdGguc3Vic3RyaW5nKDAsIHBhdGgubGFzdEluZGV4T2YoXCIvXCIpICsgMSkgOiBcIlwiO1xuXHR9XG5cdHJldHVybiBcIlwiO1xufVxuXG4vKipcbiAqIENvbGxlY3QgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGZvciB0aGUgQUxQIHRhYmxlIHVzZS1jYXNlLlxuICpcbiAqIEZvciBlLmcuIElmIFVJLkhpZGRlbiBwb2ludHMgdG8gYSBwcm9wZXJ0eSwgaW5jbHVkZSB0aGlzIHByb3BlcnR5IGluIHRoZSBhZGRpdGlvbmFsUHJvcGVydGllcyBvZiBDb21wbGV4UHJvcGVydHlJbmZvIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IFByb3BlcnR5IG9yIERhdGFGaWVsZCBiZWluZyBwcm9jZXNzZWRcbiAqIEBwYXJhbSBuYXZpZ2F0aW9uUGF0aFByZWZpeCBOYXZpZ2F0aW9uIHBhdGggcHJlZml4LCBhcHBsaWNhYmxlIGluIGNhc2Ugb2YgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzLlxuICogQHBhcmFtIHRhYmxlVHlwZSBUYWJsZSB0eXBlLlxuICogQHBhcmFtIHJlbGF0ZWRQcm9wZXJ0aWVzIFRoZSByZWxhdGVkIHByb3BlcnRpZXMgaWRlbnRpZmllZCBzbyBmYXIuXG4gKiBAcmV0dXJucyBUaGUgcmVsYXRlZCBwcm9wZXJ0aWVzIGlkZW50aWZpZWQuXG4gKi9cbmZ1bmN0aW9uIF9jb2xsZWN0QWRkaXRpb25hbFByb3BlcnRpZXNGb3JBbmFseXRpY2FsVGFibGUoXG5cdHRhcmdldDogUHJpbWl0aXZlVHlwZSxcblx0bmF2aWdhdGlvblBhdGhQcmVmaXg6IHN0cmluZyxcblx0dGFibGVUeXBlOiBUYWJsZVR5cGUsXG5cdHJlbGF0ZWRQcm9wZXJ0aWVzOiBDb21wbGV4UHJvcGVydHlJbmZvXG4pOiBDb21wbGV4UHJvcGVydHlJbmZvIHtcblx0aWYgKHRhYmxlVHlwZSA9PT0gXCJBbmFseXRpY2FsVGFibGVcIikge1xuXHRcdGNvbnN0IGhpZGRlbkFubm90YXRpb24gPSB0YXJnZXQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW47XG5cdFx0aWYgKGhpZGRlbkFubm90YXRpb24/LnBhdGggJiYgaXNQcm9wZXJ0eShoaWRkZW5Bbm5vdGF0aW9uLiR0YXJnZXQpKSB7XG5cdFx0XHRjb25zdCBoaWRkZW5Bbm5vdGF0aW9uUHJvcGVydHlQYXRoID0gbmF2aWdhdGlvblBhdGhQcmVmaXggKyBoaWRkZW5Bbm5vdGF0aW9uLnBhdGg7XG5cdFx0XHQvLyBUaGlzIHByb3BlcnR5IHNob3VsZCBiZSBhZGRlZCB0byBhZGRpdGlvbmFsUHJvcGVydGllcyBtYXAgZm9yIHRoZSBBTFAgdGFibGUgdXNlLWNhc2UuXG5cdFx0XHRyZWxhdGVkUHJvcGVydGllcy5hZGRpdGlvbmFsUHJvcGVydGllc1toaWRkZW5Bbm5vdGF0aW9uUHJvcGVydHlQYXRoXSA9IGhpZGRlbkFubm90YXRpb24uJHRhcmdldDtcblx0XHR9XG5cblx0XHRjb25zdCBjcml0aWNhbGl0eSA9IHRhcmdldC5Dcml0aWNhbGl0eTtcblx0XHRpZiAoY3JpdGljYWxpdHk/LnBhdGggJiYgaXNQcm9wZXJ0eShjcml0aWNhbGl0eT8uJHRhcmdldCkpIHtcblx0XHRcdGNvbnN0IGNyaXRpY2FsaXR5UHJvcGVydHlQYXRoID0gbmF2aWdhdGlvblBhdGhQcmVmaXggKyBjcml0aWNhbGl0eS5wYXRoO1xuXHRcdFx0cmVsYXRlZFByb3BlcnRpZXMuYWRkaXRpb25hbFByb3BlcnRpZXNbY3JpdGljYWxpdHlQcm9wZXJ0eVBhdGhdID0gY3JpdGljYWxpdHk/LiR0YXJnZXQ7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZWxhdGVkUHJvcGVydGllcztcbn1cblxuLyoqXG4gKiBDb2xsZWN0IHJlbGF0ZWQgcHJvcGVydGllcyBmcm9tIGEgcHJvcGVydHkncyBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gcGF0aCBUaGUgcHJvcGVydHkgcGF0aFxuICogQHBhcmFtIHByb3BlcnR5IFRoZSBwcm9wZXJ0eSB0byBiZSBjb25zaWRlcmVkXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEBwYXJhbSBpZ25vcmVTZWxmIFdoZXRoZXIgdG8gZXhjbHVkZSB0aGUgc2FtZSBwcm9wZXJ0eSBmcm9tIHJlbGF0ZWQgcHJvcGVydGllcy5cbiAqIEBwYXJhbSB0YWJsZVR5cGUgVGhlIHRhYmxlIHR5cGUuXG4gKiBAcGFyYW0gcmVsYXRlZFByb3BlcnRpZXMgVGhlIHJlbGF0ZWQgcHJvcGVydGllcyBpZGVudGlmaWVkIHNvIGZhci5cbiAqIEBwYXJhbSBhZGRVbml0SW5UZW1wbGF0ZSBUcnVlIGlmIHRoZSB1bml0L2N1cnJlbmN5IHByb3BlcnR5IG5lZWRzIHRvIGJlIGFkZGVkIGluIHRoZSBleHBvcnQgdGVtcGxhdGVcbiAqIEBwYXJhbSBpc0Fubm90YXRlZEFzSGlkZGVuIFRydWUgaWYgdGhlIERhdGFGaWVsZCBvciB0aGUgcHJvcGVydHkgYXJlIHN0YXRpY2FsbHkgaGlkZGVuXG4gKiBAcmV0dXJucyBUaGUgcmVsYXRlZCBwcm9wZXJ0aWVzIGlkZW50aWZpZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMoXG5cdHBhdGg6IHN0cmluZyxcblx0cHJvcGVydHk6IFByaW1pdGl2ZVR5cGUsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGlnbm9yZVNlbGY6IGJvb2xlYW4sXG5cdHRhYmxlVHlwZTogVGFibGVUeXBlLFxuXHRyZWxhdGVkUHJvcGVydGllczogQ29tcGxleFByb3BlcnR5SW5mbyA9IHsgcHJvcGVydGllczoge30sIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiB7fSwgdGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uOiBbXSB9LFxuXHRhZGRVbml0SW5UZW1wbGF0ZSA9IGZhbHNlLFxuXHRpc0Fubm90YXRlZEFzSGlkZGVuID0gZmFsc2Vcbik6IENvbXBsZXhQcm9wZXJ0eUluZm8ge1xuXHQvKipcblx0ICogSGVscGVyIHRvIHB1c2ggdW5pcXVlIHJlbGF0ZWQgcHJvcGVydGllcy5cblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUgcHJvcGVydHkgcGF0aFxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIHByb3BlcnRpZXMgb2JqZWN0IGNvbnRhaW5pbmcgdmFsdWUgcHJvcGVydHksIGRlc2NyaXB0aW9uIHByb3BlcnR5Li4uXG5cdCAqIEByZXR1cm5zIEluZGV4IGF0IHdoaWNoIHRoZSBwcm9wZXJ0eSBpcyBhdmFpbGFibGVcblx0ICovXG5cdGZ1bmN0aW9uIF9wdXNoVW5pcXVlKGtleTogc3RyaW5nLCB2YWx1ZTogUHJvcGVydHkpOiBudW1iZXIge1xuXHRcdGlmICghcmVsYXRlZFByb3BlcnRpZXMucHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRyZWxhdGVkUHJvcGVydGllcy5wcm9wZXJ0aWVzW2tleV0gPSB2YWx1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHJlbGF0ZWRQcm9wZXJ0aWVzLnByb3BlcnRpZXMpLmluZGV4T2Yoa2V5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgdG8gYXBwZW5kIHRoZSBleHBvcnQgc2V0dGluZ3MgdGVtcGxhdGUgd2l0aCBhIGZvcm1hdHRlZCB0ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWUgRm9ybWF0dGVkIHRleHRcblx0ICovXG5cdGZ1bmN0aW9uIF9hcHBlbmRUZW1wbGF0ZSh2YWx1ZTogc3RyaW5nKSB7XG5cdFx0cmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0U2V0dGluZ3NUZW1wbGF0ZSA9IHJlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFNldHRpbmdzVGVtcGxhdGVcblx0XHRcdD8gYCR7cmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0U2V0dGluZ3NUZW1wbGF0ZX0ke3ZhbHVlfWBcblx0XHRcdDogYCR7dmFsdWV9YDtcblx0fVxuXHRpZiAocGF0aCAmJiBwcm9wZXJ0eSkge1xuXHRcdGxldCB2YWx1ZUluZGV4OiBudW1iZXI7XG5cdFx0bGV0IHRhcmdldFZhbHVlOiBzdHJpbmcgfCBQcm9wZXJ0eVBhdGg7XG5cdFx0bGV0IGN1cnJlbmN5T3JVb01JbmRleDogbnVtYmVyO1xuXHRcdGxldCB0aW1lem9uZU9yVW9NSW5kZXg6IG51bWJlcjtcblx0XHRsZXQgZGF0YVBvaW50SW5kZXg6IG51bWJlcjtcblx0XHRpZiAoaXNBbm5vdGF0ZWRBc0hpZGRlbikge1xuXHRcdFx0Ly8gQ29sbGVjdCB1bmRlcmx5aW5nIHByb3BlcnR5XG5cdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUocGF0aCwgcHJvcGVydHkpO1xuXHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX1gKTtcblx0XHRcdHJldHVybiByZWxhdGVkUHJvcGVydGllcztcblx0XHR9XG5cdFx0Y29uc3QgbmF2aWdhdGlvblBhdGhQcmVmaXggPSBfZ2V0TmF2aWdhdGlvblBhdGhQcmVmaXgocGF0aCk7XG5cblx0XHQvLyBDaGVjayBmb3IgVGV4dCBhbm5vdGF0aW9uLlxuXHRcdGNvbnN0IHRleHRBbm5vdGF0aW9uID0gcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dDtcblxuXHRcdGlmIChyZWxhdGVkUHJvcGVydGllcy5leHBvcnRTZXR0aW5nc1RlbXBsYXRlKSB7XG5cdFx0XHQvLyBGaWVsZEdyb3VwIHVzZS1jYXNlLiBOZWVkIHRvIGFkZCBlYWNoIEZpZWxkIGluIG5ldyBsaW5lLlxuXHRcdFx0X2FwcGVuZFRlbXBsYXRlKFwiXFxuXCIpO1xuXHRcdFx0cmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0U2V0dGluZ3NXcmFwcGluZyA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKHRleHRBbm5vdGF0aW9uPy5wYXRoICYmIHRleHRBbm5vdGF0aW9uPy4kdGFyZ2V0KSB7XG5cdFx0XHQvLyBDaGVjayBmb3IgVGV4dCBBcnJhbmdlbWVudC5cblx0XHRcdGNvbnN0IGRhdGFNb2RlbE9iamVjdFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKTtcblx0XHRcdGNvbnN0IHRleHRBbm5vdGF0aW9uUHJvcGVydHlQYXRoID0gbmF2aWdhdGlvblBhdGhQcmVmaXggKyB0ZXh0QW5ub3RhdGlvbi5wYXRoO1xuXHRcdFx0Y29uc3QgZGlzcGxheU1vZGUgPSBnZXREaXNwbGF5TW9kZShwcm9wZXJ0eSwgZGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0XHRsZXQgZGVzY3JpcHRpb25JbmRleDogbnVtYmVyO1xuXHRcdFx0c3dpdGNoIChkaXNwbGF5TW9kZSkge1xuXHRcdFx0XHRjYXNlIFwiVmFsdWVcIjpcblx0XHRcdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUocGF0aCwgcHJvcGVydHkpO1xuXHRcdFx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7dmFsdWVJbmRleH19YCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25JbmRleCA9IF9wdXNoVW5pcXVlKHRleHRBbm5vdGF0aW9uUHJvcGVydHlQYXRoLCB0ZXh0QW5ub3RhdGlvbi4kdGFyZ2V0KTtcblx0XHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske2Rlc2NyaXB0aW9uSW5kZXh9fWApO1xuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLnRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbi5wdXNoKHRleHRBbm5vdGF0aW9uUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiVmFsdWVEZXNjcmlwdGlvblwiOlxuXHRcdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25JbmRleCA9IF9wdXNoVW5pcXVlKHRleHRBbm5vdGF0aW9uUHJvcGVydHlQYXRoLCB0ZXh0QW5ub3RhdGlvbi4kdGFyZ2V0KTtcblx0XHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fSAoeyR7ZGVzY3JpcHRpb25JbmRleH19KWApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblZhbHVlXCI6XG5cdFx0XHRcdFx0dmFsdWVJbmRleCA9IF9wdXNoVW5pcXVlKHBhdGgsIHByb3BlcnR5KTtcblx0XHRcdFx0XHRkZXNjcmlwdGlvbkluZGV4ID0gX3B1c2hVbmlxdWUodGV4dEFubm90YXRpb25Qcm9wZXJ0eVBhdGgsIHRleHRBbm5vdGF0aW9uLiR0YXJnZXQpO1xuXHRcdFx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7ZGVzY3JpcHRpb25JbmRleH19ICh7JHt2YWx1ZUluZGV4fX0pYCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdC8vIG5vIGRlZmF1bHRcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gQ2hlY2sgZm9yIGZpZWxkIGNvbnRhaW5pbmcgQ3VycmVuY3kgT3IgVW5pdCBQcm9wZXJ0aWVzIG9yIFRpbWV6b25lXG5cdFx0XHRjb25zdCBjdXJyZW5jeU9yVW9NUHJvcGVydHkgPSBnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eShwcm9wZXJ0eSkgfHwgZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eShwcm9wZXJ0eSk7XG5cdFx0XHRjb25zdCBjdXJyZW5jeU9yVW5pdEFubm90YXRpb24gPSBwcm9wZXJ0eT8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeSB8fCBwcm9wZXJ0eT8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5Vbml0O1xuXHRcdFx0Y29uc3QgdGltZXpvbmVQcm9wZXJ0eSA9IGdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5KHByb3BlcnR5KTtcblx0XHRcdGNvbnN0IHRpbWV6b25lQW5ub3RhdGlvbiA9IHByb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZTtcblxuXHRcdFx0aWYgKGN1cnJlbmN5T3JVb01Qcm9wZXJ0eSAmJiBjdXJyZW5jeU9yVW5pdEFubm90YXRpb24/LiR0YXJnZXQpIHtcblx0XHRcdFx0dmFsdWVJbmRleCA9IF9wdXNoVW5pcXVlKHBhdGgsIHByb3BlcnR5KTtcblx0XHRcdFx0Y3VycmVuY3lPclVvTUluZGV4ID0gX3B1c2hVbmlxdWUobmF2aWdhdGlvblBhdGhQcmVmaXggKyBjdXJyZW5jeU9yVW5pdEFubm90YXRpb24ucGF0aCwgY3VycmVuY3lPclVuaXRBbm5vdGF0aW9uLiR0YXJnZXQpO1xuXHRcdFx0XHRpZiAoYWRkVW5pdEluVGVtcGxhdGUpIHtcblx0XHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fSAgeyR7Y3VycmVuY3lPclVvTUluZGV4fX1gKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcy5leHBvcnRVbml0TmFtZSA9IG5hdmlnYXRpb25QYXRoUHJlZml4ICsgY3VycmVuY3lPclVuaXRBbm5vdGF0aW9uLnBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAodGltZXpvbmVQcm9wZXJ0eSAmJiB0aW1lem9uZUFubm90YXRpb24/LiR0YXJnZXQpIHtcblx0XHRcdFx0dmFsdWVJbmRleCA9IF9wdXNoVW5pcXVlKHBhdGgsIHByb3BlcnR5KTtcblx0XHRcdFx0dGltZXpvbmVPclVvTUluZGV4ID0gX3B1c2hVbmlxdWUobmF2aWdhdGlvblBhdGhQcmVmaXggKyB0aW1lem9uZUFubm90YXRpb24ucGF0aCwgdGltZXpvbmVBbm5vdGF0aW9uLiR0YXJnZXQpO1xuXHRcdFx0XHRpZiAoYWRkVW5pdEluVGVtcGxhdGUpIHtcblx0XHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fSAgeyR7dGltZXpvbmVPclVvTUluZGV4fX1gKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcy5leHBvcnRUaW1lem9uZU5hbWUgPSBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIHRpbWV6b25lQW5ub3RhdGlvbi5wYXRoO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHQocHJvcGVydHkuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZSAmJiAhcHJvcGVydHkuVGFyZ2V0Py4kdGFyZ2V0Py5WYWx1ZUZvcm1hdCkgfHxcblx0XHRcdFx0cHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5EYXRhRmllbGREZWZhdWx0Py5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgZGF0YVBvaW50UHJvcGVydHkgPSBwcm9wZXJ0eS5UYXJnZXQ/LiR0YXJnZXQ/LlZhbHVlLiR0YXJnZXQgYXMgUHJvcGVydHk7XG5cdFx0XHRcdGNvbnN0IGRhdGFwb2ludFRhcmdldCA9IHByb3BlcnR5LlRhcmdldD8uJHRhcmdldDtcblx0XHRcdFx0Ly8gRGF0YVBvaW50IHVzZS1jYXNlIHVzaW5nIERhdGFGaWVsZERlZmF1bHQuXG5cdFx0XHRcdGNvbnN0IGRhdGFQb2ludERlZmF1bHRQcm9wZXJ0eSA9IHByb3BlcnR5LmFubm90YXRpb25zPy5VST8uRGF0YUZpZWxkRGVmYXVsdDtcblx0XHRcdFx0dmFsdWVJbmRleCA9IF9wdXNoVW5pcXVlKFxuXHRcdFx0XHRcdG5hdmlnYXRpb25QYXRoUHJlZml4ID8gbmF2aWdhdGlvblBhdGhQcmVmaXggKyBwYXRoIDogcGF0aCxcblx0XHRcdFx0XHRkYXRhUG9pbnREZWZhdWx0UHJvcGVydHkgPyBwcm9wZXJ0eSA6IGRhdGFQb2ludFByb3BlcnR5XG5cdFx0XHRcdCk7XG5cdFx0XHRcdHRhcmdldFZhbHVlID0gZ2V0VGFyZ2V0VmFsdWVPbkRhdGFQb2ludChkYXRhUG9pbnREZWZhdWx0UHJvcGVydHkgPyBwcm9wZXJ0eSA6IGRhdGFwb2ludFRhcmdldCk7XG5cdFx0XHRcdGlmIChpc1Byb3BlcnR5KCh0YXJnZXRWYWx1ZSBhcyBQcm9wZXJ0eVBhdGgpLiR0YXJnZXQpKSB7XG5cdFx0XHRcdFx0Ly9pbiBjYXNlIGl0J3MgYSBkeW5hbWljIHRhcmdldFZhbHVlXG5cdFx0XHRcdFx0dGFyZ2V0VmFsdWUgPSB0YXJnZXRWYWx1ZSBhcyBQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdFx0ZGF0YVBvaW50SW5kZXggPSBfcHVzaFVuaXF1ZShcblx0XHRcdFx0XHRcdG5hdmlnYXRpb25QYXRoUHJlZml4ID8gbmF2aWdhdGlvblBhdGhQcmVmaXggKyB0YXJnZXRWYWx1ZS4kdGFyZ2V0Lm5hbWUgOiB0YXJnZXRWYWx1ZS4kdGFyZ2V0Lm5hbWUsXG5cdFx0XHRcdFx0XHR0YXJnZXRWYWx1ZS4kdGFyZ2V0XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fS97JHtkYXRhUG9pbnRJbmRleH19YCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWUgPSB0YXJnZXRWYWx1ZSBhcyBzdHJpbmc7XG5cdFx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX0vJHt0YXJnZXRWYWx1ZX1gKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChwcm9wZXJ0eS4kVHlwZSA9PT0gQ29tbXVuaWNhdGlvbkFubm90YXRpb25UeXBlcy5Db250YWN0VHlwZSkge1xuXHRcdFx0XHRjb25zdCBjb250YWN0UHJvcGVydHkgPSBwcm9wZXJ0eS5mbj8uJHRhcmdldDtcblx0XHRcdFx0Y29uc3QgY29udGFjdFByb3BlcnR5UGF0aCA9IHByb3BlcnR5LmZuPy5wYXRoO1xuXHRcdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUoXG5cdFx0XHRcdFx0bmF2aWdhdGlvblBhdGhQcmVmaXggPyBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIGNvbnRhY3RQcm9wZXJ0eVBhdGggOiBjb250YWN0UHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdGNvbnRhY3RQcm9wZXJ0eVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fWApO1xuXHRcdFx0fSBlbHNlIGlmICghaWdub3JlU2VsZikge1xuXHRcdFx0XHQvLyBDb2xsZWN0IHVuZGVybHlpbmcgcHJvcGVydHlcblx0XHRcdFx0dmFsdWVJbmRleCA9IF9wdXNoVW5pcXVlKHBhdGgsIHByb3BlcnR5KTtcblx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX1gKTtcblx0XHRcdFx0aWYgKGN1cnJlbmN5T3JVbml0QW5ub3RhdGlvbikge1xuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFVuaXRTdHJpbmcgPSBgJHtjdXJyZW5jeU9yVW5pdEFubm90YXRpb259YDsgLy8gSGFyZC1jb2RlZCBjdXJyZW5jeS91bml0XG5cdFx0XHRcdH0gZWxzZSBpZiAodGltZXpvbmVBbm5vdGF0aW9uKSB7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0VGltZXpvbmVTdHJpbmcgPSBgJHt0aW1lem9uZUFubm90YXRpb259YDsgLy8gSGFyZC1jb2RlZCB0aW1lem9uZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmVsYXRlZFByb3BlcnRpZXMgPSBfY29sbGVjdEFkZGl0aW9uYWxQcm9wZXJ0aWVzRm9yQW5hbHl0aWNhbFRhYmxlKHByb3BlcnR5LCBuYXZpZ2F0aW9uUGF0aFByZWZpeCwgdGFibGVUeXBlLCByZWxhdGVkUHJvcGVydGllcyk7XG5cdFx0aWYgKE9iamVjdC5rZXlzKHJlbGF0ZWRQcm9wZXJ0aWVzLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKS5sZW5ndGggPiAwICYmIE9iamVjdC5rZXlzKHJlbGF0ZWRQcm9wZXJ0aWVzLnByb3BlcnRpZXMpLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0Ly8gQ29sbGVjdCB1bmRlcmx5aW5nIHByb3BlcnR5IGlmIG5vdCBjb2xsZWN0ZWQgYWxyZWFkeS5cblx0XHRcdC8vIFRoaXMgaXMgdG8gZW5zdXJlIHRoYXQgYWRkaXRpb25hbFByb3BlcnRpZXMgYXJlIG1hZGUgYXZhaWxhYmxlIG9ubHkgdG8gY29tcGxleCBwcm9wZXJ0eSBpbmZvcy5cblx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fWApO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVsYXRlZFByb3BlcnRpZXM7XG59XG5cbi8qKlxuICogQ29sbGVjdCBwcm9wZXJ0aWVzIGNvbnN1bWVkIGJ5IGEgRGF0YUZpZWxkLlxuICogVGhpcyBpcyBmb3IgcG9wdWxhdGluZyB0aGUgQ29tcGxleFByb3BlcnR5SW5mb3Mgb2YgdGhlIHRhYmxlIGRlbGVnYXRlLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIERhdGFGaWVsZCBmb3Igd2hpY2ggdGhlIHByb3BlcnRpZXMgbmVlZCB0byBiZSBpZGVudGlmaWVkLlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0LlxuICogQHBhcmFtIHRhYmxlVHlwZSBUaGUgdGFibGUgdHlwZS5cbiAqIEBwYXJhbSByZWxhdGVkUHJvcGVydGllcyBUaGUgcHJvcGVydGllcyBpZGVudGlmaWVkIHNvIGZhci5cbiAqIEBwYXJhbSBpc0VtYmVkZGVkIFRydWUgaWYgdGhlIERhdGFGaWVsZCBpcyBlbWJlZGRlZCBpbiBhbm90aGVyIGFubm90YXRpb24gKGUuZy4gRmllbGRHcm91cCkuXG4gKiBAcmV0dXJucyBUaGUgcHJvcGVydGllcyByZWxhdGVkIHRvIHRoZSBEYXRhRmllbGQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXNSZWN1cnNpdmVseShcblx0ZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHR0YWJsZVR5cGU6IFRhYmxlVHlwZSxcblx0cmVsYXRlZFByb3BlcnRpZXM6IENvbXBsZXhQcm9wZXJ0eUluZm8gPSB7IHByb3BlcnRpZXM6IHt9LCBhZGRpdGlvbmFsUHJvcGVydGllczoge30sIHRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbjogW10gfSxcblx0aXNFbWJlZGRlZCA9IGZhbHNlXG4pOiBDb21wbGV4UHJvcGVydHlJbmZvIHtcblx0bGV0IGlzU3RhdGljYWxseUhpZGRlbiA9IGZhbHNlO1xuXHRzd2l0Y2ggKGRhdGFGaWVsZD8uJFR5cGUpIHtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRcdGlmIChkYXRhRmllbGQuVmFsdWUpIHtcblx0XHRcdFx0Y29uc3QgcHJvcGVydHkgPSBkYXRhRmllbGQuVmFsdWU7XG5cdFx0XHRcdGlzU3RhdGljYWxseUhpZGRlbiA9XG5cdFx0XHRcdFx0aXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4ocHJvcGVydHkuJHRhcmdldD8uYW5ub3RhdGlvbnM/LlVJPy5EYXRhRmllbGREZWZhdWx0KSB8fFxuXHRcdFx0XHRcdGlzUmVmZXJlbmNlUHJvcGVydHlTdGF0aWNhbGx5SGlkZGVuKGRhdGFGaWVsZCkgfHxcblx0XHRcdFx0XHRmYWxzZTtcblx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMgPSBjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMoXG5cdFx0XHRcdFx0cHJvcGVydHkucGF0aCxcblx0XHRcdFx0XHRwcm9wZXJ0eS4kdGFyZ2V0LFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0dGFibGVUeXBlLFxuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdGlzRW1iZWRkZWQsXG5cdFx0XHRcdFx0aXNTdGF0aWNhbGx5SGlkZGVuXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGNvbnN0IG5hdmlnYXRpb25QYXRoUHJlZml4ID0gX2dldE5hdmlnYXRpb25QYXRoUHJlZml4KHByb3BlcnR5LnBhdGgpO1xuXHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcyA9IF9jb2xsZWN0QWRkaXRpb25hbFByb3BlcnRpZXNGb3JBbmFseXRpY2FsVGFibGUoXG5cdFx0XHRcdFx0ZGF0YUZpZWxkLFxuXHRcdFx0XHRcdG5hdmlnYXRpb25QYXRoUHJlZml4LFxuXHRcdFx0XHRcdHRhYmxlVHlwZSxcblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllc1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0c3dpdGNoIChkYXRhRmllbGQuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSkge1xuXHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkZpZWxkR3JvdXBUeXBlOlxuXHRcdFx0XHRcdGRhdGFGaWVsZC5UYXJnZXQuJHRhcmdldC5EYXRhPy5mb3JFYWNoKChpbm5lckRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykgPT4ge1xuXHRcdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMgPSBjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXNSZWN1cnNpdmVseShcblx0XHRcdFx0XHRcdFx0aW5uZXJEYXRhRmllbGQsXG5cdFx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRcdHRhYmxlVHlwZSxcblx0XHRcdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMsXG5cdFx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlOlxuXHRcdFx0XHRcdGlzU3RhdGljYWxseUhpZGRlbiA9IGlzUmVmZXJlbmNlUHJvcGVydHlTdGF0aWNhbGx5SGlkZGVuKGRhdGFGaWVsZCkgPz8gZmFsc2U7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMgPSBjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMoXG5cdFx0XHRcdFx0XHRkYXRhRmllbGQuVGFyZ2V0LiR0YXJnZXQuVmFsdWUucGF0aCxcblx0XHRcdFx0XHRcdGRhdGFGaWVsZCxcblx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHRcdHRhYmxlVHlwZSxcblx0XHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdFx0aXNFbWJlZGRlZCxcblx0XHRcdFx0XHRcdGlzU3RhdGljYWxseUhpZGRlblxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblR5cGVzLkNvbnRhY3RUeXBlOlxuXHRcdFx0XHRcdGNvbnN0IGRhdGFGaWVsZENvbnRhY3QgPSBkYXRhRmllbGQuVGFyZ2V0LiR0YXJnZXQgYXMgQ29udGFjdDtcblx0XHRcdFx0XHRpc1N0YXRpY2FsbHlIaWRkZW4gPSBpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbihkYXRhRmllbGQpID8/IGZhbHNlO1xuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzID0gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzKFxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkLlRhcmdldC52YWx1ZSxcblx0XHRcdFx0XHRcdGRhdGFGaWVsZENvbnRhY3QsXG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0aXNTdGF0aWNhbGx5SGlkZGVuLFxuXHRcdFx0XHRcdFx0dGFibGVUeXBlLFxuXHRcdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMsXG5cdFx0XHRcdFx0XHRpc0VtYmVkZGVkLFxuXHRcdFx0XHRcdFx0aXNTdGF0aWNhbGx5SGlkZGVuXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdGJyZWFrO1xuXHR9XG5cblx0cmV0dXJuIHJlbGF0ZWRQcm9wZXJ0aWVzO1xufVxuXG5leHBvcnQgY29uc3QgZ2V0RGF0YUZpZWxkRGF0YVR5cGUgPSBmdW5jdGlvbiAob0RhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IFByb3BlcnR5KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKGlzUHJvcGVydHkob0RhdGFGaWVsZCkpIHtcblx0XHRyZXR1cm4gb0RhdGFGaWVsZC50eXBlO1xuXHR9XG5cdGxldCBzRGF0YVR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0c3dpdGNoIChvRGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb25Hcm91cDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb25Hcm91cDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdHNEYXRhVHlwZSA9IHVuZGVmaW5lZDtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb246XG5cdFx0XHRzRGF0YVR5cGUgPSAob0RhdGFGaWVsZCBhcyBEYXRhRmllbGQpPy5WYWx1ZT8uJHRhcmdldD8udHlwZTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRjb25zdCBzRGF0YVR5cGVGb3JEYXRhRmllbGRGb3JBbm5vdGF0aW9uID0gb0RhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlO1xuXHRcdFx0aWYgKHNEYXRhVHlwZUZvckRhdGFGaWVsZEZvckFubm90YXRpb24pIHtcblx0XHRcdFx0Y29uc3QgZGF0YUZpZWxkVGFyZ2V0ID0gb0RhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQ7XG5cdFx0XHRcdGlmIChkYXRhRmllbGRUYXJnZXQuJFR5cGUgPT09IENvbW11bmljYXRpb25Bbm5vdGF0aW9uVHlwZXMuQ29udGFjdFR5cGUpIHtcblx0XHRcdFx0XHRzRGF0YVR5cGUgPSAoaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24oZGF0YUZpZWxkVGFyZ2V0Py5mbikgJiYgZGF0YUZpZWxkVGFyZ2V0Py5mbj8uJHRhcmdldD8udHlwZSkgfHwgdW5kZWZpbmVkO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGRhdGFGaWVsZFRhcmdldC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZSkge1xuXHRcdFx0XHRcdHNEYXRhVHlwZSA9IGRhdGFGaWVsZFRhcmdldD8uVmFsdWU/LiRQYXRoPy4kVHlwZSB8fCBkYXRhRmllbGRUYXJnZXQ/LlZhbHVlPy4kdGFyZ2V0LnR5cGU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gZS5nLiBGaWVsZEdyb3VwIG9yIENoYXJ0XG5cdFx0XHRcdFx0Ly8gRmllbGRHcm91cCBQcm9wZXJ0aWVzIGhhdmUgbm8gdHlwZSwgc28gd2UgZGVmaW5lIGl0IGFzIGEgYm9vbGVhbiB0eXBlIHRvIHByZXZlbnQgZXhjZXB0aW9ucyBkdXJpbmcgdGhlIGNhbGN1bGF0aW9uIG9mIHRoZSB3aWR0aFxuXHRcdFx0XHRcdHNEYXRhVHlwZSA9XG5cdFx0XHRcdFx0XHRvRGF0YUZpZWxkLlRhcmdldD8uJHRhcmdldC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydERlZmluaXRpb25UeXBlXCIgPyB1bmRlZmluZWQgOiBcIkVkbS5Cb29sZWFuXCI7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNEYXRhVHlwZSA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHR9XG5cblx0cmV0dXJuIHNEYXRhVHlwZTtcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7OztFQXdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVNBLDRCQUE0QixDQUFDQyxTQUFpQyxFQUFnRDtJQUM3SCxPQUFRQSxTQUFTLENBQXFDQyxjQUFjLENBQUMsUUFBUSxDQUFDO0VBQy9FOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkE7RUFPTyxTQUFTQyx3QkFBd0IsQ0FBQ0YsU0FBaUMsRUFBdUM7SUFDaEgsT0FBT0EsU0FBUyxDQUFDRyxLQUFLLHdEQUE2QztFQUNwRTtFQUFDO0VBRU0sU0FBU0Msb0JBQW9CLENBQUNKLFNBQWlDLEVBQW1DO0lBQ3hHLE9BQU9BLFNBQVMsQ0FBQ0csS0FBSyxvREFBeUM7RUFDaEU7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQVFPLFNBQVNFLG1DQUFtQyxDQUFDTCxTQUFpQyxFQUFrRDtJQUN0SSxPQUFPQSxTQUFTLENBQUNHLEtBQUssbUVBQXdEO0VB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