/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/SemanticObjectHelper"], function (TypeGuards, SemanticObjectHelper) {
  "use strict";

  var _exports = {};
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  /**
   * Check whether the property has the Core.Computed annotation or not.
   *
   * @param oProperty The target property
   * @returns `true` if the property is computed
   */
  const isComputed = function (oProperty) {
    var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation3;
    return !!((_oProperty$annotation = oProperty.annotations) !== null && _oProperty$annotation !== void 0 && (_oProperty$annotation2 = _oProperty$annotation.Core) !== null && _oProperty$annotation2 !== void 0 && (_oProperty$annotation3 = _oProperty$annotation2.Computed) !== null && _oProperty$annotation3 !== void 0 && _oProperty$annotation3.valueOf());
  };

  /**
   * Check whether the property has the Core.Immutable annotation or not.
   *
   * @param oProperty The target property
   * @returns `true` if it's immutable
   */
  _exports.isComputed = isComputed;
  const isImmutable = function (oProperty) {
    var _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6;
    return !!((_oProperty$annotation4 = oProperty.annotations) !== null && _oProperty$annotation4 !== void 0 && (_oProperty$annotation5 = _oProperty$annotation4.Core) !== null && _oProperty$annotation5 !== void 0 && (_oProperty$annotation6 = _oProperty$annotation5.Immutable) !== null && _oProperty$annotation6 !== void 0 && _oProperty$annotation6.valueOf());
  };

  /**
   * Check whether the property is a key or not.
   *
   * @param oProperty The target property
   * @returns `true` if it's a key
   */
  _exports.isImmutable = isImmutable;
  const isKey = function (oProperty) {
    return !!oProperty.isKey;
  };

  /**
   * Check whether the property is a semanticKey for the context entity.
   *
   * @param property
   * @param contextDataModelObject The DataModelObject that holds the context
   * @returns `true`if it's a semantic key
   */
  _exports.isKey = isKey;
  const isSemanticKey = function (property, contextDataModelObject) {
    var _contextDataModelObje, _contextDataModelObje2, _contextDataModelObje3, _contextDataModelObje4;
    const semanticKeys = (_contextDataModelObje = contextDataModelObject.contextLocation) === null || _contextDataModelObje === void 0 ? void 0 : (_contextDataModelObje2 = _contextDataModelObje.targetEntityType) === null || _contextDataModelObje2 === void 0 ? void 0 : (_contextDataModelObje3 = _contextDataModelObje2.annotations) === null || _contextDataModelObje3 === void 0 ? void 0 : (_contextDataModelObje4 = _contextDataModelObje3.Common) === null || _contextDataModelObje4 === void 0 ? void 0 : _contextDataModelObje4.SemanticKey;
    return (semanticKeys === null || semanticKeys === void 0 ? void 0 : semanticKeys.some(function (key) {
      var _key$$target;
      return (key === null || key === void 0 ? void 0 : (_key$$target = key.$target) === null || _key$$target === void 0 ? void 0 : _key$$target.fullyQualifiedName) === property.fullyQualifiedName;
    })) ?? false;
  };

  /**
   * Checks whether the property has a date time or not.
   *
   * @param oProperty
   * @returns `true` if it is of type date / datetime / datetimeoffset
   */
  _exports.isSemanticKey = isSemanticKey;
  const hasDateType = function (oProperty) {
    return ["Edm.Date", "Edm.DateTime", "Edm.DateTimeOffset"].indexOf(oProperty.type) !== -1;
  };

  /**
   * Retrieve the label annotation.
   *
   * @param oProperty The target property
   * @returns The label string
   */
  _exports.hasDateType = hasDateType;
  const getLabel = function (oProperty) {
    var _oProperty$annotation7, _oProperty$annotation8, _oProperty$annotation9;
    return ((_oProperty$annotation7 = oProperty.annotations) === null || _oProperty$annotation7 === void 0 ? void 0 : (_oProperty$annotation8 = _oProperty$annotation7.Common) === null || _oProperty$annotation8 === void 0 ? void 0 : (_oProperty$annotation9 = _oProperty$annotation8.Label) === null || _oProperty$annotation9 === void 0 ? void 0 : _oProperty$annotation9.toString()) || "";
  };

  /**
   * Check whether the property has a semantic object defined or not.
   *
   * @param property The target property
   * @returns `true` if it has a semantic object
   */
  _exports.getLabel = getLabel;
  const hasSemanticObject = function (property) {
    return SemanticObjectHelper.hasSemanticObject(property);
  };

  /**
   * Retrieves the timezone property associated to the property, if applicable.
   *
   * @param oProperty The target property
   * @returns The timezone property, if it exists
   */
  _exports.hasSemanticObject = hasSemanticObject;
  const getAssociatedTimezoneProperty = function (oProperty) {
    var _oProperty$annotation10, _oProperty$annotation11, _oProperty$annotation12, _oProperty$annotation13;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation10 = oProperty.annotations) === null || _oProperty$annotation10 === void 0 ? void 0 : (_oProperty$annotation11 = _oProperty$annotation10.Common) === null || _oProperty$annotation11 === void 0 ? void 0 : _oProperty$annotation11.Timezone) ? (_oProperty$annotation12 = oProperty.annotations) === null || _oProperty$annotation12 === void 0 ? void 0 : (_oProperty$annotation13 = _oProperty$annotation12.Common) === null || _oProperty$annotation13 === void 0 ? void 0 : _oProperty$annotation13.Timezone.$target : undefined;
  };

  /**
   * Retrieves the timezone property path associated to the property, if applicable.
   *
   * @param oProperty The target property
   * @returns The timezone property path, if it exists
   */
  _exports.getAssociatedTimezoneProperty = getAssociatedTimezoneProperty;
  const getAssociatedTimezonePropertyPath = function (oProperty) {
    var _oProperty$annotation14, _oProperty$annotation15, _oProperty$annotation16, _oProperty$annotation17, _oProperty$annotation18;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation14 = oProperty.annotations) === null || _oProperty$annotation14 === void 0 ? void 0 : (_oProperty$annotation15 = _oProperty$annotation14.Common) === null || _oProperty$annotation15 === void 0 ? void 0 : _oProperty$annotation15.Timezone) ? oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation16 = oProperty.annotations) === null || _oProperty$annotation16 === void 0 ? void 0 : (_oProperty$annotation17 = _oProperty$annotation16.Common) === null || _oProperty$annotation17 === void 0 ? void 0 : (_oProperty$annotation18 = _oProperty$annotation17.Timezone) === null || _oProperty$annotation18 === void 0 ? void 0 : _oProperty$annotation18.path : undefined;
  };

  /**
   * Retrieves the associated text property for that property, if it exists.
   *
   * @param oProperty The target property
   * @returns The text property, if it exists
   */
  _exports.getAssociatedTimezonePropertyPath = getAssociatedTimezonePropertyPath;
  const getAssociatedTextProperty = function (oProperty) {
    var _oProperty$annotation19, _oProperty$annotation20, _oProperty$annotation21, _oProperty$annotation22;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation19 = oProperty.annotations) === null || _oProperty$annotation19 === void 0 ? void 0 : (_oProperty$annotation20 = _oProperty$annotation19.Common) === null || _oProperty$annotation20 === void 0 ? void 0 : _oProperty$annotation20.Text) ? (_oProperty$annotation21 = oProperty.annotations) === null || _oProperty$annotation21 === void 0 ? void 0 : (_oProperty$annotation22 = _oProperty$annotation21.Common) === null || _oProperty$annotation22 === void 0 ? void 0 : _oProperty$annotation22.Text.$target : undefined;
  };

  /**
   * Retrieves the unit property associated to the property, if applicable.
   *
   * @param oProperty The target property
   * @returns The unit property, if it exists
   */
  _exports.getAssociatedTextProperty = getAssociatedTextProperty;
  const getAssociatedUnitProperty = function (oProperty) {
    var _oProperty$annotation23, _oProperty$annotation24, _oProperty$annotation25, _oProperty$annotation26;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation23 = oProperty.annotations) === null || _oProperty$annotation23 === void 0 ? void 0 : (_oProperty$annotation24 = _oProperty$annotation23.Measures) === null || _oProperty$annotation24 === void 0 ? void 0 : _oProperty$annotation24.Unit) ? (_oProperty$annotation25 = oProperty.annotations) === null || _oProperty$annotation25 === void 0 ? void 0 : (_oProperty$annotation26 = _oProperty$annotation25.Measures) === null || _oProperty$annotation26 === void 0 ? void 0 : _oProperty$annotation26.Unit.$target : undefined;
  };
  _exports.getAssociatedUnitProperty = getAssociatedUnitProperty;
  const getAssociatedUnitPropertyPath = function (oProperty) {
    var _oProperty$annotation27, _oProperty$annotation28, _oProperty$annotation29, _oProperty$annotation30;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation27 = oProperty.annotations) === null || _oProperty$annotation27 === void 0 ? void 0 : (_oProperty$annotation28 = _oProperty$annotation27.Measures) === null || _oProperty$annotation28 === void 0 ? void 0 : _oProperty$annotation28.Unit) ? (_oProperty$annotation29 = oProperty.annotations) === null || _oProperty$annotation29 === void 0 ? void 0 : (_oProperty$annotation30 = _oProperty$annotation29.Measures) === null || _oProperty$annotation30 === void 0 ? void 0 : _oProperty$annotation30.Unit.path : undefined;
  };

  /**
   * Retrieves the associated currency property for that property if it exists.
   *
   * @param oProperty The target property
   * @returns The unit property, if it exists
   */
  _exports.getAssociatedUnitPropertyPath = getAssociatedUnitPropertyPath;
  const getAssociatedCurrencyProperty = function (oProperty) {
    var _oProperty$annotation31, _oProperty$annotation32, _oProperty$annotation33, _oProperty$annotation34;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation31 = oProperty.annotations) === null || _oProperty$annotation31 === void 0 ? void 0 : (_oProperty$annotation32 = _oProperty$annotation31.Measures) === null || _oProperty$annotation32 === void 0 ? void 0 : _oProperty$annotation32.ISOCurrency) ? (_oProperty$annotation33 = oProperty.annotations) === null || _oProperty$annotation33 === void 0 ? void 0 : (_oProperty$annotation34 = _oProperty$annotation33.Measures) === null || _oProperty$annotation34 === void 0 ? void 0 : _oProperty$annotation34.ISOCurrency.$target : undefined;
  };
  _exports.getAssociatedCurrencyProperty = getAssociatedCurrencyProperty;
  const getAssociatedCurrencyPropertyPath = function (oProperty) {
    var _oProperty$annotation35, _oProperty$annotation36, _oProperty$annotation37, _oProperty$annotation38;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation35 = oProperty.annotations) === null || _oProperty$annotation35 === void 0 ? void 0 : (_oProperty$annotation36 = _oProperty$annotation35.Measures) === null || _oProperty$annotation36 === void 0 ? void 0 : _oProperty$annotation36.ISOCurrency) ? (_oProperty$annotation37 = oProperty.annotations) === null || _oProperty$annotation37 === void 0 ? void 0 : (_oProperty$annotation38 = _oProperty$annotation37.Measures) === null || _oProperty$annotation38 === void 0 ? void 0 : _oProperty$annotation38.ISOCurrency.path : undefined;
  };

  /**
   * Retrieves the Common.Text property path if it exists.
   *
   * @param oProperty The target property
   * @returns The Common.Text property path or undefined if it does not exist
   */
  _exports.getAssociatedCurrencyPropertyPath = getAssociatedCurrencyPropertyPath;
  const getAssociatedTextPropertyPath = function (oProperty) {
    var _oProperty$annotation39, _oProperty$annotation40, _oProperty$annotation41, _oProperty$annotation42;
    return isPathAnnotationExpression((_oProperty$annotation39 = oProperty.annotations) === null || _oProperty$annotation39 === void 0 ? void 0 : (_oProperty$annotation40 = _oProperty$annotation39.Common) === null || _oProperty$annotation40 === void 0 ? void 0 : _oProperty$annotation40.Text) ? (_oProperty$annotation41 = oProperty.annotations) === null || _oProperty$annotation41 === void 0 ? void 0 : (_oProperty$annotation42 = _oProperty$annotation41.Common) === null || _oProperty$annotation42 === void 0 ? void 0 : _oProperty$annotation42.Text.path : undefined;
  };

  /**
   * Check whether the property has a value help annotation defined or not.
   *
   * @param property The target property to be checked
   * @returns `true` if it has a value help
   */
  _exports.getAssociatedTextPropertyPath = getAssociatedTextPropertyPath;
  const hasValueHelp = function (property) {
    var _property$annotations, _property$annotations2, _property$annotations3, _property$annotations4, _property$annotations5, _property$annotations6, _property$annotations7, _property$annotations8;
    return !!((_property$annotations = property.annotations) !== null && _property$annotations !== void 0 && (_property$annotations2 = _property$annotations.Common) !== null && _property$annotations2 !== void 0 && _property$annotations2.ValueList) || !!((_property$annotations3 = property.annotations) !== null && _property$annotations3 !== void 0 && (_property$annotations4 = _property$annotations3.Common) !== null && _property$annotations4 !== void 0 && _property$annotations4.ValueListReferences) || !!((_property$annotations5 = property.annotations) !== null && _property$annotations5 !== void 0 && (_property$annotations6 = _property$annotations5.Common) !== null && _property$annotations6 !== void 0 && _property$annotations6.ValueListWithFixedValues) || !!((_property$annotations7 = property.annotations) !== null && _property$annotations7 !== void 0 && (_property$annotations8 = _property$annotations7.Common) !== null && _property$annotations8 !== void 0 && _property$annotations8.ValueListMapping);
  };

  /**
   * Check whether the property has a value help with fixed value annotation defined or not.
   *
   * @param oProperty The target property
   * @returns `true` if it has a value help
   */
  _exports.hasValueHelp = hasValueHelp;
  const hasValueHelpWithFixedValues = function (oProperty) {
    var _oProperty$annotation43, _oProperty$annotation44, _oProperty$annotation45;
    return !!(oProperty !== null && oProperty !== void 0 && (_oProperty$annotation43 = oProperty.annotations) !== null && _oProperty$annotation43 !== void 0 && (_oProperty$annotation44 = _oProperty$annotation43.Common) !== null && _oProperty$annotation44 !== void 0 && (_oProperty$annotation45 = _oProperty$annotation44.ValueListWithFixedValues) !== null && _oProperty$annotation45 !== void 0 && _oProperty$annotation45.valueOf());
  };

  /**
   * Check whether the property has a value help for validation annotation defined or not.
   *
   * @param oProperty The target property
   * @returns `true` if it has a value help
   */
  _exports.hasValueHelpWithFixedValues = hasValueHelpWithFixedValues;
  const hasValueListForValidation = function (oProperty) {
    var _oProperty$annotation46, _oProperty$annotation47;
    return ((_oProperty$annotation46 = oProperty.annotations) === null || _oProperty$annotation46 === void 0 ? void 0 : (_oProperty$annotation47 = _oProperty$annotation46.Common) === null || _oProperty$annotation47 === void 0 ? void 0 : _oProperty$annotation47.ValueListForValidation) !== undefined;
  };
  _exports.hasValueListForValidation = hasValueListForValidation;
  const hasTimezone = function (oProperty) {
    var _oProperty$annotation48, _oProperty$annotation49;
    return ((_oProperty$annotation48 = oProperty.annotations) === null || _oProperty$annotation48 === void 0 ? void 0 : (_oProperty$annotation49 = _oProperty$annotation48.Common) === null || _oProperty$annotation49 === void 0 ? void 0 : _oProperty$annotation49.Timezone) !== undefined;
  };
  /**
   * Checks whether the property is a unit property.
   *
   * @param property The property to be checked
   * @returns `true` if it is a unit
   */
  _exports.hasTimezone = hasTimezone;
  const isUnit = function (property) {
    var _property$annotations9, _property$annotations10, _property$annotations11;
    return !!((_property$annotations9 = property.annotations) !== null && _property$annotations9 !== void 0 && (_property$annotations10 = _property$annotations9.Common) !== null && _property$annotations10 !== void 0 && (_property$annotations11 = _property$annotations10.IsUnit) !== null && _property$annotations11 !== void 0 && _property$annotations11.valueOf());
  };

  /**
   * Checks whether the property has a text property.
   *
   * @param property The property to be checked
   * @returns `true` if it is a Text
   */
  _exports.isUnit = isUnit;
  const hasText = function (property) {
    var _property$annotations12, _property$annotations13, _property$annotations14;
    return !!((_property$annotations12 = property.annotations) !== null && _property$annotations12 !== void 0 && (_property$annotations13 = _property$annotations12.Common) !== null && _property$annotations13 !== void 0 && (_property$annotations14 = _property$annotations13.Text) !== null && _property$annotations14 !== void 0 && _property$annotations14.valueOf());
  };

  /**
   * Checks whether the property has an ImageURL.
   *
   * @param property The property to be checked
   * @returns `true` if it is an ImageURL
   */
  _exports.hasText = hasText;
  const isImageURL = function (property) {
    var _property$annotations15, _property$annotations16, _property$annotations17;
    return !!((_property$annotations15 = property.annotations) !== null && _property$annotations15 !== void 0 && (_property$annotations16 = _property$annotations15.UI) !== null && _property$annotations16 !== void 0 && (_property$annotations17 = _property$annotations16.IsImageURL) !== null && _property$annotations17 !== void 0 && _property$annotations17.valueOf());
  };

  /**
   * Checks whether the property is a currency property.
   *
   * @param oProperty The property to be checked
   * @returns `true` if it is a currency
   */
  _exports.isImageURL = isImageURL;
  const isCurrency = function (oProperty) {
    var _oProperty$annotation50, _oProperty$annotation51, _oProperty$annotation52;
    return !!((_oProperty$annotation50 = oProperty.annotations) !== null && _oProperty$annotation50 !== void 0 && (_oProperty$annotation51 = _oProperty$annotation50.Common) !== null && _oProperty$annotation51 !== void 0 && (_oProperty$annotation52 = _oProperty$annotation51.IsCurrency) !== null && _oProperty$annotation52 !== void 0 && _oProperty$annotation52.valueOf());
  };

  /**
   * Checks whether the property has a currency property.
   *
   * @param property The property to be checked
   * @returns `true` if it has a currency
   */
  _exports.isCurrency = isCurrency;
  const hasCurrency = function (property) {
    var _property$annotations18, _property$annotations19;
    return ((_property$annotations18 = property.annotations) === null || _property$annotations18 === void 0 ? void 0 : (_property$annotations19 = _property$annotations18.Measures) === null || _property$annotations19 === void 0 ? void 0 : _property$annotations19.ISOCurrency) !== undefined;
  };

  /**
   * Checks whether the property has a unit property.
   *
   * @param property The property to be checked
   * @returns `true` if it has a unit
   */
  _exports.hasCurrency = hasCurrency;
  const hasUnit = function (property) {
    var _property$annotations20, _property$annotations21;
    return ((_property$annotations20 = property.annotations) === null || _property$annotations20 === void 0 ? void 0 : (_property$annotations21 = _property$annotations20.Measures) === null || _property$annotations21 === void 0 ? void 0 : _property$annotations21.Unit) !== undefined;
  };

  /**
   * Checks whether the property type has Edm.Guid.
   *
   * @param property The property to be checked
   * @returns `true` if it is a Guid
   */
  _exports.hasUnit = hasUnit;
  const isGuid = function (property) {
    return property.type === "Edm.Guid";
  };
  _exports.isGuid = isGuid;
  const hasStaticPercentUnit = function (oProperty) {
    var _oProperty$annotation53, _oProperty$annotation54, _oProperty$annotation55;
    return (oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation53 = oProperty.annotations) === null || _oProperty$annotation53 === void 0 ? void 0 : (_oProperty$annotation54 = _oProperty$annotation53.Measures) === null || _oProperty$annotation54 === void 0 ? void 0 : (_oProperty$annotation55 = _oProperty$annotation54.Unit) === null || _oProperty$annotation55 === void 0 ? void 0 : _oProperty$annotation55.toString()) === "%";
  };
  _exports.hasStaticPercentUnit = hasStaticPercentUnit;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0NvbXB1dGVkIiwib1Byb3BlcnR5IiwiYW5ub3RhdGlvbnMiLCJDb3JlIiwiQ29tcHV0ZWQiLCJ2YWx1ZU9mIiwiaXNJbW11dGFibGUiLCJJbW11dGFibGUiLCJpc0tleSIsImlzU2VtYW50aWNLZXkiLCJwcm9wZXJ0eSIsImNvbnRleHREYXRhTW9kZWxPYmplY3QiLCJzZW1hbnRpY0tleXMiLCJjb250ZXh0TG9jYXRpb24iLCJ0YXJnZXRFbnRpdHlUeXBlIiwiQ29tbW9uIiwiU2VtYW50aWNLZXkiLCJzb21lIiwia2V5IiwiJHRhcmdldCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImhhc0RhdGVUeXBlIiwiaW5kZXhPZiIsInR5cGUiLCJnZXRMYWJlbCIsIkxhYmVsIiwidG9TdHJpbmciLCJoYXNTZW1hbnRpY09iamVjdCIsIlNlbWFudGljT2JqZWN0SGVscGVyIiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkiLCJpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiIsIlRpbWV6b25lIiwidW5kZWZpbmVkIiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoIiwicGF0aCIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHkiLCJUZXh0IiwiZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSIsIk1lYXN1cmVzIiwiVW5pdCIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkiLCJJU09DdXJyZW5jeSIsImdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5UGF0aCIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoIiwiaGFzVmFsdWVIZWxwIiwiVmFsdWVMaXN0IiwiVmFsdWVMaXN0UmVmZXJlbmNlcyIsIlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyIsIlZhbHVlTGlzdE1hcHBpbmciLCJoYXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMiLCJoYXNWYWx1ZUxpc3RGb3JWYWxpZGF0aW9uIiwiVmFsdWVMaXN0Rm9yVmFsaWRhdGlvbiIsImhhc1RpbWV6b25lIiwiaXNVbml0IiwiSXNVbml0IiwiaGFzVGV4dCIsImlzSW1hZ2VVUkwiLCJVSSIsIklzSW1hZ2VVUkwiLCJpc0N1cnJlbmN5IiwiSXNDdXJyZW5jeSIsImhhc0N1cnJlbmN5IiwiaGFzVW5pdCIsImlzR3VpZCIsImhhc1N0YXRpY1BlcmNlbnRVbml0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQcm9wZXJ0eUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFjdGlvblBhcmFtZXRlciwgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0ICogYXMgU2VtYW50aWNPYmplY3RIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvU2VtYW50aWNPYmplY3RIZWxwZXJcIjtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgdGhlIENvcmUuQ29tcHV0ZWQgYW5ub3RhdGlvbiBvciBub3QuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHByb3BlcnR5IGlzIGNvbXB1dGVkXG4gKi9cbmV4cG9ydCBjb25zdCBpc0NvbXB1dGVkID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuICEhb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db3JlPy5Db21wdXRlZD8udmFsdWVPZigpO1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgdGhlIENvcmUuSW1tdXRhYmxlIGFubm90YXRpb24gb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgYHRydWVgIGlmIGl0J3MgaW1tdXRhYmxlXG4gKi9cbmV4cG9ydCBjb25zdCBpc0ltbXV0YWJsZSA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIW9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29yZT8uSW1tdXRhYmxlPy52YWx1ZU9mKCk7XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIHByb3BlcnR5IGlzIGEga2V5IG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCdzIGEga2V5XG4gKi9cbmV4cG9ydCBjb25zdCBpc0tleSA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIW9Qcm9wZXJ0eS5pc0tleTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaXMgYSBzZW1hbnRpY0tleSBmb3IgdGhlIGNvbnRleHQgZW50aXR5LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eVxuICogQHBhcmFtIGNvbnRleHREYXRhTW9kZWxPYmplY3QgVGhlIERhdGFNb2RlbE9iamVjdCB0aGF0IGhvbGRzIHRoZSBjb250ZXh0XG4gKiBAcmV0dXJucyBgdHJ1ZWBpZiBpdCdzIGEgc2VtYW50aWMga2V5XG4gKi9cbmV4cG9ydCBjb25zdCBpc1NlbWFudGljS2V5ID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSwgY29udGV4dERhdGFNb2RlbE9iamVjdDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRjb25zdCBzZW1hbnRpY0tleXMgPSBjb250ZXh0RGF0YU1vZGVsT2JqZWN0LmNvbnRleHRMb2NhdGlvbj8udGFyZ2V0RW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uU2VtYW50aWNLZXk7XG5cdHJldHVybiAoXG5cdFx0c2VtYW50aWNLZXlzPy5zb21lKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHJldHVybiBrZXk/LiR0YXJnZXQ/LmZ1bGx5UXVhbGlmaWVkTmFtZSA9PT0gcHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lO1xuXHRcdH0pID8/IGZhbHNlXG5cdCk7XG59O1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgYSBkYXRlIHRpbWUgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHlcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBvZiB0eXBlIGRhdGUgLyBkYXRldGltZSAvIGRhdGV0aW1lb2Zmc2V0XG4gKi9cbmV4cG9ydCBjb25zdCBoYXNEYXRlVHlwZSA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiBbXCJFZG0uRGF0ZVwiLCBcIkVkbS5EYXRlVGltZVwiLCBcIkVkbS5EYXRlVGltZU9mZnNldFwiXS5pbmRleE9mKG9Qcm9wZXJ0eS50eXBlKSAhPT0gLTE7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBsYWJlbCBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIGxhYmVsIHN0cmluZ1xuICovXG5leHBvcnQgY29uc3QgZ2V0TGFiZWwgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IHN0cmluZyB7XG5cdHJldHVybiBvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWw/LnRvU3RyaW5nKCkgfHwgXCJcIjtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgc2VtYW50aWMgb2JqZWN0IGRlZmluZWQgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaGFzIGEgc2VtYW50aWMgb2JqZWN0XG4gKi9cbmV4cG9ydCBjb25zdCBoYXNTZW1hbnRpY09iamVjdCA9IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuIFNlbWFudGljT2JqZWN0SGVscGVyLmhhc1NlbWFudGljT2JqZWN0KHByb3BlcnR5KTtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSB0aW1lem9uZSBwcm9wZXJ0eSBhc3NvY2lhdGVkIHRvIHRoZSBwcm9wZXJ0eSwgaWYgYXBwbGljYWJsZS5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSB0aW1lem9uZSBwcm9wZXJ0eSwgaWYgaXQgZXhpc3RzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eSA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogUHJvcGVydHkgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZSlcblx0XHQ/IChvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmUuJHRhcmdldCBhcyB1bmtub3duIGFzIFByb3BlcnR5KVxuXHRcdDogdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHRpbWV6b25lIHByb3BlcnR5IHBhdGggYXNzb2NpYXRlZCB0byB0aGUgcHJvcGVydHksIGlmIGFwcGxpY2FibGUuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgdGltZXpvbmUgcHJvcGVydHkgcGF0aCwgaWYgaXQgZXhpc3RzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eVBhdGggPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihvUHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LlRpbWV6b25lKVxuXHRcdD8gb1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZT8ucGF0aFxuXHRcdDogdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGFzc29jaWF0ZWQgdGV4dCBwcm9wZXJ0eSBmb3IgdGhhdCBwcm9wZXJ0eSwgaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIHRleHQgcHJvcGVydHksIGlmIGl0IGV4aXN0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eSA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogUHJvcGVydHkgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0KVxuXHRcdD8gKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0LiR0YXJnZXQgYXMgdW5rbm93biBhcyBQcm9wZXJ0eSlcblx0XHQ6IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSB1bml0IHByb3BlcnR5IGFzc29jaWF0ZWQgdG8gdGhlIHByb3BlcnR5LCBpZiBhcHBsaWNhYmxlLlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIHVuaXQgcHJvcGVydHksIGlmIGl0IGV4aXN0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogUHJvcGVydHkgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQpXG5cdFx0PyAob1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdC4kdGFyZ2V0IGFzIHVua25vd24gYXMgUHJvcGVydHkpXG5cdFx0OiB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eVBhdGggPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihvUHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdCkgPyBvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5Vbml0LnBhdGggOiB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgYXNzb2NpYXRlZCBjdXJyZW5jeSBwcm9wZXJ0eSBmb3IgdGhhdCBwcm9wZXJ0eSBpZiBpdCBleGlzdHMuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgdW5pdCBwcm9wZXJ0eSwgaWYgaXQgZXhpc3RzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eSA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogUHJvcGVydHkgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5KVxuXHRcdD8gKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5LiR0YXJnZXQgYXMgdW5rbm93biBhcyBQcm9wZXJ0eSlcblx0XHQ6IHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eVBhdGggPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihvUHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kpXG5cdFx0PyBvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeS5wYXRoXG5cdFx0OiB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgQ29tbW9uLlRleHQgcHJvcGVydHkgcGF0aCBpZiBpdCBleGlzdHMuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgQ29tbW9uLlRleHQgcHJvcGVydHkgcGF0aCBvciB1bmRlZmluZWQgaWYgaXQgZG9lcyBub3QgZXhpc3RcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ob1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRleHQpID8gb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRleHQucGF0aCA6IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgdmFsdWUgaGVscCBhbm5vdGF0aW9uIGRlZmluZWQgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBoYXMgYSB2YWx1ZSBoZWxwXG4gKi9cbmV4cG9ydCBjb25zdCBoYXNWYWx1ZUhlbHAgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5IHwgQWN0aW9uUGFyYW1ldGVyKTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0ISFwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5WYWx1ZUxpc3QgfHxcblx0XHQhIXByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdFJlZmVyZW5jZXMgfHxcblx0XHQhIXByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyB8fFxuXHRcdCEhcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0TWFwcGluZ1xuXHQpO1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgYSB2YWx1ZSBoZWxwIHdpdGggZml4ZWQgdmFsdWUgYW5ub3RhdGlvbiBkZWZpbmVkIG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBoYXMgYSB2YWx1ZSBoZWxwXG4gKi9cbmV4cG9ydCBjb25zdCBoYXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSB8IEFjdGlvblBhcmFtZXRlcik6IGJvb2xlYW4ge1xuXHRyZXR1cm4gISFvUHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcz8udmFsdWVPZigpO1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgYSB2YWx1ZSBoZWxwIGZvciB2YWxpZGF0aW9uIGFubm90YXRpb24gZGVmaW5lZCBvciBub3QuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaGFzIGEgdmFsdWUgaGVscFxuICovXG5leHBvcnQgY29uc3QgaGFzVmFsdWVMaXN0Rm9yVmFsaWRhdGlvbiA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5IHwgQWN0aW9uUGFyYW1ldGVyKTogYm9vbGVhbiB7XG5cdHJldHVybiBvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0Rm9yVmFsaWRhdGlvbiAhPT0gdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IGNvbnN0IGhhc1RpbWV6b25lID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuIG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZSAhPT0gdW5kZWZpbmVkO1xufTtcbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3BlcnR5IGlzIGEgdW5pdCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBhIHVuaXRcbiAqL1xuZXhwb3J0IGNvbnN0IGlzVW5pdCA9IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHkgfCBBY3Rpb25QYXJhbWV0ZXIpOiBib29sZWFuIHtcblx0cmV0dXJuICEhcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNVbml0Py52YWx1ZU9mKCk7XG59O1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgYSB0ZXh0IHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIGEgVGV4dFxuICovXG5leHBvcnQgY29uc3QgaGFzVGV4dCA9IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuICEhcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dD8udmFsdWVPZigpO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGFuIEltYWdlVVJMLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIGFuIEltYWdlVVJMXG4gKi9cbmV4cG9ydCBjb25zdCBpc0ltYWdlVVJMID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gISFwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/LklzSW1hZ2VVUkw/LnZhbHVlT2YoKTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3BlcnR5IGlzIGEgY3VycmVuY3kgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIGEgY3VycmVuY3lcbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ3VycmVuY3kgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSB8IEFjdGlvblBhcmFtZXRlcik6IGJvb2xlYW4ge1xuXHRyZXR1cm4gISFvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNDdXJyZW5jeT8udmFsdWVPZigpO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgY3VycmVuY3kgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSBwcm9wZXJ0eSB0byBiZSBjaGVja2VkXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaGFzIGEgY3VycmVuY3lcbiAqL1xuZXhwb3J0IGNvbnN0IGhhc0N1cnJlbmN5ID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gcHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeSAhPT0gdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgdW5pdCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBoYXMgYSB1bml0XG4gKi9cblxuZXhwb3J0IGNvbnN0IGhhc1VuaXQgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQgIT09IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3BlcnR5IHR5cGUgaGFzIEVkbS5HdWlkLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIGEgR3VpZFxuICovXG5leHBvcnQgY29uc3QgaXNHdWlkID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSB8IEFjdGlvblBhcmFtZXRlcik6IGJvb2xlYW4ge1xuXHRyZXR1cm4gcHJvcGVydHkudHlwZSA9PT0gXCJFZG0uR3VpZFwiO1xufTtcblxuZXhwb3J0IGNvbnN0IGhhc1N0YXRpY1BlcmNlbnRVbml0ID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuIG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5Vbml0Py50b1N0cmluZygpID09PSBcIiVcIjtcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7OztFQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLE1BQU1BLFVBQVUsR0FB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