/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/TypeGuards"], function (TypeGuards) {
  "use strict";

  var _exports = {};
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var isEntityType = TypeGuards.isEntityType;
  var isEntitySet = TypeGuards.isEntitySet;
  /**
   * helper class for Aggregation annotations.
   */
  let AggregationHelper = /*#__PURE__*/function () {
    /**
     * Creates a helper for a specific entity type and a converter context.
     *
     * @param entityType The EntityType
     * @param converterContext The ConverterContext
     * @param [considerOldAnnotations] The flag to indicate whether or not to consider old annotations
     */
    function AggregationHelper(entityType, converterContext) {
      var _this$oTargetAggregat;
      let considerOldAnnotations = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      //considerOldAnnotations will be true and sent only for chart
      this._entityType = entityType;
      this._converterContext = converterContext;
      this._oAggregationAnnotationTarget = this._determineAggregationAnnotationTarget();
      if (isNavigationProperty(this._oAggregationAnnotationTarget) || isEntityType(this._oAggregationAnnotationTarget) || isEntitySet(this._oAggregationAnnotationTarget)) {
        this.oTargetAggregationAnnotations = this._oAggregationAnnotationTarget.annotations.Aggregation;
      }
      this._bApplySupported = (_this$oTargetAggregat = this.oTargetAggregationAnnotations) !== null && _this$oTargetAggregat !== void 0 && _this$oTargetAggregat.ApplySupported ? true : false;
      if (this._bApplySupported) {
        var _this$oTargetAggregat2, _this$oTargetAggregat3, _this$oTargetAggregat4, _this$oTargetAggregat5;
        this._aGroupableProperties = (_this$oTargetAggregat2 = this.oTargetAggregationAnnotations) === null || _this$oTargetAggregat2 === void 0 ? void 0 : (_this$oTargetAggregat3 = _this$oTargetAggregat2.ApplySupported) === null || _this$oTargetAggregat3 === void 0 ? void 0 : _this$oTargetAggregat3.GroupableProperties;
        this._aAggregatableProperties = (_this$oTargetAggregat4 = this.oTargetAggregationAnnotations) === null || _this$oTargetAggregat4 === void 0 ? void 0 : (_this$oTargetAggregat5 = _this$oTargetAggregat4.ApplySupported) === null || _this$oTargetAggregat5 === void 0 ? void 0 : _this$oTargetAggregat5.AggregatableProperties;
        this.oContainerAggregationAnnotation = converterContext.getEntityContainer().annotations.Aggregation;
      }
      if (!this._aAggregatableProperties && considerOldAnnotations) {
        const entityProperties = this._getEntityProperties();
        this._aAggregatableProperties = entityProperties === null || entityProperties === void 0 ? void 0 : entityProperties.filter(property => {
          var _property$annotations, _property$annotations2;
          return (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Aggregation) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.Aggregatable;
        });
      }
    }

    /**
     * Determines the most appropriate target for the aggregation annotations.
     *
     * @returns  EntityType, EntitySet or NavigationProperty where aggregation annotations should be read from.
     */
    _exports.AggregationHelper = AggregationHelper;
    var _proto = AggregationHelper.prototype;
    _proto._determineAggregationAnnotationTarget = function _determineAggregationAnnotationTarget() {
      var _this$_converterConte, _this$_converterConte2, _this$_converterConte3, _this$_converterConte4, _this$_converterConte5;
      const bIsParameterized = (_this$_converterConte = this._converterContext.getDataModelObjectPath()) !== null && _this$_converterConte !== void 0 && (_this$_converterConte2 = _this$_converterConte.targetEntitySet) !== null && _this$_converterConte2 !== void 0 && (_this$_converterConte3 = _this$_converterConte2.entityType) !== null && _this$_converterConte3 !== void 0 && (_this$_converterConte4 = _this$_converterConte3.annotations) !== null && _this$_converterConte4 !== void 0 && (_this$_converterConte5 = _this$_converterConte4.Common) !== null && _this$_converterConte5 !== void 0 && _this$_converterConte5.ResultContext ? true : false;
      let oAggregationAnnotationSource;

      // find ApplySupported
      if (bIsParameterized) {
        var _oNavigationPropertyO, _oNavigationPropertyO2, _oEntityTypeObject$an, _oEntityTypeObject$an2;
        // if this is a parameterized view then applysupported can be found at either the navProp pointing to the result set or entityType.
        // If applySupported is present at both the navProp and the entityType then navProp is more specific so take annotations from there
        // targetObject in the converter context for a parameterized view is the navigation property pointing to th result set
        const oDataModelObjectPath = this._converterContext.getDataModelObjectPath();
        const oNavigationPropertyObject = oDataModelObjectPath === null || oDataModelObjectPath === void 0 ? void 0 : oDataModelObjectPath.targetObject;
        const oEntityTypeObject = oDataModelObjectPath === null || oDataModelObjectPath === void 0 ? void 0 : oDataModelObjectPath.targetEntityType;
        if (oNavigationPropertyObject !== null && oNavigationPropertyObject !== void 0 && (_oNavigationPropertyO = oNavigationPropertyObject.annotations) !== null && _oNavigationPropertyO !== void 0 && (_oNavigationPropertyO2 = _oNavigationPropertyO.Aggregation) !== null && _oNavigationPropertyO2 !== void 0 && _oNavigationPropertyO2.ApplySupported) {
          oAggregationAnnotationSource = oNavigationPropertyObject;
        } else if (oEntityTypeObject !== null && oEntityTypeObject !== void 0 && (_oEntityTypeObject$an = oEntityTypeObject.annotations) !== null && _oEntityTypeObject$an !== void 0 && (_oEntityTypeObject$an2 = _oEntityTypeObject$an.Aggregation) !== null && _oEntityTypeObject$an2 !== void 0 && _oEntityTypeObject$an2.ApplySupported) {
          oAggregationAnnotationSource = oEntityTypeObject;
        }
      } else {
        var _oEntitySetObject$ann;
        // For the time being, we ignore annotations at the container level, until the vocabulary is stabilized
        const oEntitySetObject = this._converterContext.getEntitySet();
        if (isEntitySet(oEntitySetObject) && (_oEntitySetObject$ann = oEntitySetObject.annotations.Aggregation) !== null && _oEntitySetObject$ann !== void 0 && _oEntitySetObject$ann.ApplySupported) {
          oAggregationAnnotationSource = oEntitySetObject;
        } else {
          oAggregationAnnotationSource = this._converterContext.getEntityType();
        }
      }
      return oAggregationAnnotationSource;
    }

    /**
     * Checks if the entity supports analytical queries.
     *
     * @returns `true` if analytical queries are supported, false otherwise.
     */;
    _proto.isAnalyticsSupported = function isAnalyticsSupported() {
      return this._bApplySupported;
    }

    /**
     * Checks if a property is groupable.
     *
     * @param property The property to check
     * @returns `undefined` if the entity doesn't support analytical queries, true or false otherwise
     */;
    _proto.isPropertyGroupable = function isPropertyGroupable(property) {
      if (!this._bApplySupported) {
        return undefined;
      } else if (!this._aGroupableProperties || this._aGroupableProperties.length === 0) {
        // No groupableProperties --> all properties are groupable
        return true;
      } else {
        return this._aGroupableProperties.findIndex(path => path.$target.fullyQualifiedName === property.fullyQualifiedName) >= 0;
      }
    }

    /**
     * Checks if a property is aggregatable.
     *
     * @param property The property to check
     * @returns `undefined` if the entity doesn't support analytical queries, true or false otherwise
     */;
    _proto.isPropertyAggregatable = function isPropertyAggregatable(property) {
      if (!this._bApplySupported) {
        return undefined;
      } else {
        // Get the custom aggregates
        const aCustomAggregateAnnotations = this._converterContext.getAnnotationsByTerm("Aggregation", "Org.OData.Aggregation.V1.CustomAggregate", [this._oAggregationAnnotationTarget]);

        // Check if a custom aggregate has a qualifier that corresponds to the property name
        return aCustomAggregateAnnotations.some(annotation => {
          return property.name === annotation.qualifier;
        });
      }
    };
    _proto.getGroupableProperties = function getGroupableProperties() {
      return this._aGroupableProperties;
    };
    _proto.getAggregatableProperties = function getAggregatableProperties() {
      return this._aAggregatableProperties;
    };
    _proto.getEntityType = function getEntityType() {
      return this._entityType;
    }

    /**
     * Returns AggregatedProperties or AggregatedProperty based on param Term.
     * The Term here indicates if the AggregatedProperty should be retrieved or the deprecated AggregatedProperties.
     *
     * @param Term The Annotation Term
     * @returns Annotations The appropriate annotations based on the given Term.
     */;
    _proto.getAggregatedProperties = function getAggregatedProperties(Term) {
      if (Term === "AggregatedProperties") {
        return this._converterContext.getAnnotationsByTerm("Analytics", "com.sap.vocabularies.Analytics.v1.AggregatedProperties", [this._converterContext.getEntityContainer(), this._converterContext.getEntityType()]);
      }
      return this._converterContext.getAnnotationsByTerm("Analytics", "com.sap.vocabularies.Analytics.v1.AggregatedProperty", [this._converterContext.getEntityContainer(), this._converterContext.getEntityType()]);
    }

    // retirve all transformation aggregates by prioritizing AggregatedProperty over AggregatedProperties objects
    ;
    _proto.getTransAggregations = function getTransAggregations() {
      var _aAggregatedPropertyO;
      let aAggregatedPropertyObjects = this.getAggregatedProperties("AggregatedProperty");
      if (!aAggregatedPropertyObjects || aAggregatedPropertyObjects.length === 0) {
        aAggregatedPropertyObjects = this.getAggregatedProperties("AggregatedProperties")[0];
      }
      return (_aAggregatedPropertyO = aAggregatedPropertyObjects) === null || _aAggregatedPropertyO === void 0 ? void 0 : _aAggregatedPropertyO.filter(aggregatedProperty => {
        if (this._getAggregatableAggregates(aggregatedProperty.AggregatableProperty)) {
          return aggregatedProperty;
        }
      });
    }

    /**
     * Check if each transformation is aggregatable.
     *
     * @param property The property to check
     * @returns 'aggregatedProperty'
     */;
    _proto._getAggregatableAggregates = function _getAggregatableAggregates(property) {
      const aAggregatableProperties = this.getAggregatableProperties() || [];
      return aAggregatableProperties.find(function (obj) {
        var _obj$Property;
        const prop = property.qualifier ? property.qualifier : property.$target.name;
        if (obj !== null && obj !== void 0 && (_obj$Property = obj.Property) !== null && _obj$Property !== void 0 && _obj$Property.value) {
          return obj.Property.value === prop;
        }
        return (obj === null || obj === void 0 ? void 0 : obj.name) === prop;
      });
    };
    _proto._getEntityProperties = function _getEntityProperties() {
      let entityProperties;
      if (isEntitySet(this._oAggregationAnnotationTarget)) {
        var _this$_oAggregationAn, _this$_oAggregationAn2;
        entityProperties = (_this$_oAggregationAn = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn === void 0 ? void 0 : (_this$_oAggregationAn2 = _this$_oAggregationAn.entityType) === null || _this$_oAggregationAn2 === void 0 ? void 0 : _this$_oAggregationAn2.entityProperties;
      } else if (isEntityType(this._oAggregationAnnotationTarget)) {
        var _this$_oAggregationAn3;
        entityProperties = (_this$_oAggregationAn3 = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn3 === void 0 ? void 0 : _this$_oAggregationAn3.entityProperties;
      }
      return entityProperties;
    }

    /**
     * Returns the list of custom aggregate definitions for the entity type.
     *
     * @returns A map (propertyName --> array of context-defining property names) for each custom aggregate corresponding to a property. The array of
     * context-defining property names is empty if the custom aggregate doesn't have any context-defining property.
     */;
    _proto.getCustomAggregateDefinitions = function getCustomAggregateDefinitions() {
      // Get the custom aggregates
      const aCustomAggregateAnnotations = this._converterContext.getAnnotationsByTerm("Aggregation", "Org.OData.Aggregation.V1.CustomAggregate", [this._oAggregationAnnotationTarget]);
      return aCustomAggregateAnnotations;
    }

    /**
     * Returns the list of allowed transformations in the $apply.
     * First look at the current EntitySet, then look at the default values provided at the container level.
     *
     * @returns The list of transformations, or undefined if no list is found
     */;
    _proto.getAllowedTransformations = function getAllowedTransformations() {
      var _this$oTargetAggregat6, _this$oTargetAggregat7, _this$oContainerAggre, _this$oContainerAggre2;
      return ((_this$oTargetAggregat6 = this.oTargetAggregationAnnotations) === null || _this$oTargetAggregat6 === void 0 ? void 0 : (_this$oTargetAggregat7 = _this$oTargetAggregat6.ApplySupported) === null || _this$oTargetAggregat7 === void 0 ? void 0 : _this$oTargetAggregat7.Transformations) || ((_this$oContainerAggre = this.oContainerAggregationAnnotation) === null || _this$oContainerAggre === void 0 ? void 0 : (_this$oContainerAggre2 = _this$oContainerAggre.ApplySupportedDefaults) === null || _this$oContainerAggre2 === void 0 ? void 0 : _this$oContainerAggre2.Transformations);
    };
    return AggregationHelper;
  }();
  _exports.AggregationHelper = AggregationHelper;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBZ2dyZWdhdGlvbkhlbHBlciIsImVudGl0eVR5cGUiLCJjb252ZXJ0ZXJDb250ZXh0IiwiY29uc2lkZXJPbGRBbm5vdGF0aW9ucyIsIl9lbnRpdHlUeXBlIiwiX2NvbnZlcnRlckNvbnRleHQiLCJfb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldCIsIl9kZXRlcm1pbmVBZ2dyZWdhdGlvbkFubm90YXRpb25UYXJnZXQiLCJpc05hdmlnYXRpb25Qcm9wZXJ0eSIsImlzRW50aXR5VHlwZSIsImlzRW50aXR5U2V0Iiwib1RhcmdldEFnZ3JlZ2F0aW9uQW5ub3RhdGlvbnMiLCJhbm5vdGF0aW9ucyIsIkFnZ3JlZ2F0aW9uIiwiX2JBcHBseVN1cHBvcnRlZCIsIkFwcGx5U3VwcG9ydGVkIiwiX2FHcm91cGFibGVQcm9wZXJ0aWVzIiwiR3JvdXBhYmxlUHJvcGVydGllcyIsIl9hQWdncmVnYXRhYmxlUHJvcGVydGllcyIsIkFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMiLCJvQ29udGFpbmVyQWdncmVnYXRpb25Bbm5vdGF0aW9uIiwiZ2V0RW50aXR5Q29udGFpbmVyIiwiZW50aXR5UHJvcGVydGllcyIsIl9nZXRFbnRpdHlQcm9wZXJ0aWVzIiwiZmlsdGVyIiwicHJvcGVydHkiLCJBZ2dyZWdhdGFibGUiLCJiSXNQYXJhbWV0ZXJpemVkIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCIsInRhcmdldEVudGl0eVNldCIsIkNvbW1vbiIsIlJlc3VsdENvbnRleHQiLCJvQWdncmVnYXRpb25Bbm5vdGF0aW9uU291cmNlIiwib0RhdGFNb2RlbE9iamVjdFBhdGgiLCJvTmF2aWdhdGlvblByb3BlcnR5T2JqZWN0IiwidGFyZ2V0T2JqZWN0Iiwib0VudGl0eVR5cGVPYmplY3QiLCJ0YXJnZXRFbnRpdHlUeXBlIiwib0VudGl0eVNldE9iamVjdCIsImdldEVudGl0eVNldCIsImdldEVudGl0eVR5cGUiLCJpc0FuYWx5dGljc1N1cHBvcnRlZCIsImlzUHJvcGVydHlHcm91cGFibGUiLCJ1bmRlZmluZWQiLCJsZW5ndGgiLCJmaW5kSW5kZXgiLCJwYXRoIiwiJHRhcmdldCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImlzUHJvcGVydHlBZ2dyZWdhdGFibGUiLCJhQ3VzdG9tQWdncmVnYXRlQW5ub3RhdGlvbnMiLCJnZXRBbm5vdGF0aW9uc0J5VGVybSIsInNvbWUiLCJhbm5vdGF0aW9uIiwibmFtZSIsInF1YWxpZmllciIsImdldEdyb3VwYWJsZVByb3BlcnRpZXMiLCJnZXRBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzIiwiZ2V0QWdncmVnYXRlZFByb3BlcnRpZXMiLCJUZXJtIiwiZ2V0VHJhbnNBZ2dyZWdhdGlvbnMiLCJhQWdncmVnYXRlZFByb3BlcnR5T2JqZWN0cyIsImFnZ3JlZ2F0ZWRQcm9wZXJ0eSIsIl9nZXRBZ2dyZWdhdGFibGVBZ2dyZWdhdGVzIiwiQWdncmVnYXRhYmxlUHJvcGVydHkiLCJhQWdncmVnYXRhYmxlUHJvcGVydGllcyIsImZpbmQiLCJvYmoiLCJwcm9wIiwiUHJvcGVydHkiLCJ2YWx1ZSIsImdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zIiwiZ2V0QWxsb3dlZFRyYW5zZm9ybWF0aW9ucyIsIlRyYW5zZm9ybWF0aW9ucyIsIkFwcGx5U3VwcG9ydGVkRGVmYXVsdHMiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkFnZ3JlZ2F0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQW5ub3RhdGlvblRlcm0sIEVudGl0eVNldCwgRW50aXR5VHlwZSwgTmF2aWdhdGlvblByb3BlcnR5LCBQcm9wZXJ0eSwgUHJvcGVydHlQYXRoIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IEFnZ3JlZ2F0YWJsZVByb3BlcnR5VHlwZSwgQXBwbHlTdXBwb3J0ZWRUeXBlLCBDdXN0b21BZ2dyZWdhdGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0FnZ3JlZ2F0aW9uXCI7XG5pbXBvcnQgeyBBZ2dyZWdhdGlvbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB0eXBlIHtcblx0Q29sbGVjdGlvbkFubm90YXRpb25zX0FnZ3JlZ2F0aW9uLFxuXHRFbnRpdHlDb250YWluZXJBbm5vdGF0aW9uc19BZ2dyZWdhdGlvbixcblx0RW50aXR5U2V0QW5ub3RhdGlvbnNfQWdncmVnYXRpb24sXG5cdEVudGl0eVR5cGVBbm5vdGF0aW9uc19BZ2dyZWdhdGlvblxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0FnZ3JlZ2F0aW9uX0VkbVwiO1xuaW1wb3J0IHR5cGUgeyBBZ2dyZWdhdGVkUHJvcGVydHlUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9BbmFseXRpY3NcIjtcbmltcG9ydCB7IGlzRW50aXR5U2V0LCBpc0VudGl0eVR5cGUsIGlzTmF2aWdhdGlvblByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vQ29udmVydGVyQ29udGV4dFwiO1xuXG4vKipcbiAqIGhlbHBlciBjbGFzcyBmb3IgQWdncmVnYXRpb24gYW5ub3RhdGlvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBZ2dyZWdhdGlvbkhlbHBlciB7XG5cdF9lbnRpdHlUeXBlOiBFbnRpdHlUeXBlO1xuXG5cdF9jb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0O1xuXG5cdF9iQXBwbHlTdXBwb3J0ZWQ6IGJvb2xlYW47XG5cblx0X2FHcm91cGFibGVQcm9wZXJ0aWVzPzogUHJvcGVydHlQYXRoW107XG5cblx0X2FBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzPzogQWdncmVnYXRhYmxlUHJvcGVydHlUeXBlW10gfCBQcm9wZXJ0eVtdO1xuXG5cdF9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0OiBFbnRpdHlUeXBlIHwgRW50aXR5U2V0IHwgTmF2aWdhdGlvblByb3BlcnR5O1xuXG5cdG9UYXJnZXRBZ2dyZWdhdGlvbkFubm90YXRpb25zPzpcblx0XHR8IENvbGxlY3Rpb25Bbm5vdGF0aW9uc19BZ2dyZWdhdGlvblxuXHRcdHwgRW50aXR5VHlwZUFubm90YXRpb25zX0FnZ3JlZ2F0aW9uXG5cdFx0fCBFbnRpdHlTZXRBbm5vdGF0aW9uc19BZ2dyZWdhdGlvbjtcblxuXHRvQ29udGFpbmVyQWdncmVnYXRpb25Bbm5vdGF0aW9uPzogRW50aXR5Q29udGFpbmVyQW5ub3RhdGlvbnNfQWdncmVnYXRpb247XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBoZWxwZXIgZm9yIGEgc3BlY2lmaWMgZW50aXR5IHR5cGUgYW5kIGEgY29udmVydGVyIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlIFRoZSBFbnRpdHlUeXBlXG5cdCAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBDb252ZXJ0ZXJDb250ZXh0XG5cdCAqIEBwYXJhbSBbY29uc2lkZXJPbGRBbm5vdGF0aW9uc10gVGhlIGZsYWcgdG8gaW5kaWNhdGUgd2hldGhlciBvciBub3QgdG8gY29uc2lkZXIgb2xkIGFubm90YXRpb25zXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCBjb25zaWRlck9sZEFubm90YXRpb25zOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHQvL2NvbnNpZGVyT2xkQW5ub3RhdGlvbnMgd2lsbCBiZSB0cnVlIGFuZCBzZW50IG9ubHkgZm9yIGNoYXJ0XG5cdFx0dGhpcy5fZW50aXR5VHlwZSA9IGVudGl0eVR5cGU7XG5cdFx0dGhpcy5fY29udmVydGVyQ29udGV4dCA9IGNvbnZlcnRlckNvbnRleHQ7XG5cblx0XHR0aGlzLl9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0ID0gdGhpcy5fZGV0ZXJtaW5lQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0KCk7XG5cdFx0aWYgKFxuXHRcdFx0aXNOYXZpZ2F0aW9uUHJvcGVydHkodGhpcy5fb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldCkgfHxcblx0XHRcdGlzRW50aXR5VHlwZSh0aGlzLl9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0KSB8fFxuXHRcdFx0aXNFbnRpdHlTZXQodGhpcy5fb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldClcblx0XHQpIHtcblx0XHRcdHRoaXMub1RhcmdldEFnZ3JlZ2F0aW9uQW5ub3RhdGlvbnMgPSB0aGlzLl9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0LmFubm90YXRpb25zLkFnZ3JlZ2F0aW9uO1xuXHRcdH1cblx0XHR0aGlzLl9iQXBwbHlTdXBwb3J0ZWQgPSB0aGlzLm9UYXJnZXRBZ2dyZWdhdGlvbkFubm90YXRpb25zPy5BcHBseVN1cHBvcnRlZCA/IHRydWUgOiBmYWxzZTtcblxuXHRcdGlmICh0aGlzLl9iQXBwbHlTdXBwb3J0ZWQpIHtcblx0XHRcdHRoaXMuX2FHcm91cGFibGVQcm9wZXJ0aWVzID0gdGhpcy5vVGFyZ2V0QWdncmVnYXRpb25Bbm5vdGF0aW9ucz8uQXBwbHlTdXBwb3J0ZWQ/Lkdyb3VwYWJsZVByb3BlcnRpZXMgYXMgUHJvcGVydHlQYXRoW107XG5cdFx0XHR0aGlzLl9hQWdncmVnYXRhYmxlUHJvcGVydGllcyA9IHRoaXMub1RhcmdldEFnZ3JlZ2F0aW9uQW5ub3RhdGlvbnM/LkFwcGx5U3VwcG9ydGVkPy5BZ2dyZWdhdGFibGVQcm9wZXJ0aWVzO1xuXG5cdFx0XHR0aGlzLm9Db250YWluZXJBZ2dyZWdhdGlvbkFubm90YXRpb24gPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eUNvbnRhaW5lcigpLmFubm90YXRpb25zXG5cdFx0XHRcdC5BZ2dyZWdhdGlvbiBhcyBFbnRpdHlDb250YWluZXJBbm5vdGF0aW9uc19BZ2dyZWdhdGlvbjtcblx0XHR9XG5cdFx0aWYgKCF0aGlzLl9hQWdncmVnYXRhYmxlUHJvcGVydGllcyAmJiBjb25zaWRlck9sZEFubm90YXRpb25zKSB7XG5cdFx0XHRjb25zdCBlbnRpdHlQcm9wZXJ0aWVzID0gdGhpcy5fZ2V0RW50aXR5UHJvcGVydGllcygpO1xuXHRcdFx0dGhpcy5fYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMgPSBlbnRpdHlQcm9wZXJ0aWVzPy5maWx0ZXIoKHByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdHJldHVybiBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQWdncmVnYXRpb24/LkFnZ3JlZ2F0YWJsZTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmVzIHRoZSBtb3N0IGFwcHJvcHJpYXRlIHRhcmdldCBmb3IgdGhlIGFnZ3JlZ2F0aW9uIGFubm90YXRpb25zLlxuXHQgKlxuXHQgKiBAcmV0dXJucyAgRW50aXR5VHlwZSwgRW50aXR5U2V0IG9yIE5hdmlnYXRpb25Qcm9wZXJ0eSB3aGVyZSBhZ2dyZWdhdGlvbiBhbm5vdGF0aW9ucyBzaG91bGQgYmUgcmVhZCBmcm9tLlxuXHQgKi9cblx0cHJpdmF0ZSBfZGV0ZXJtaW5lQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0KCk6IEVudGl0eVR5cGUgfCBFbnRpdHlTZXQgfCBOYXZpZ2F0aW9uUHJvcGVydHkge1xuXHRcdGNvbnN0IGJJc1BhcmFtZXRlcml6ZWQgPSB0aGlzLl9jb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKT8udGFyZ2V0RW50aXR5U2V0Py5lbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uQ29tbW9uXG5cdFx0XHQ/LlJlc3VsdENvbnRleHRcblx0XHRcdD8gdHJ1ZVxuXHRcdFx0OiBmYWxzZTtcblx0XHRsZXQgb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblNvdXJjZTtcblxuXHRcdC8vIGZpbmQgQXBwbHlTdXBwb3J0ZWRcblx0XHRpZiAoYklzUGFyYW1ldGVyaXplZCkge1xuXHRcdFx0Ly8gaWYgdGhpcyBpcyBhIHBhcmFtZXRlcml6ZWQgdmlldyB0aGVuIGFwcGx5c3VwcG9ydGVkIGNhbiBiZSBmb3VuZCBhdCBlaXRoZXIgdGhlIG5hdlByb3AgcG9pbnRpbmcgdG8gdGhlIHJlc3VsdCBzZXQgb3IgZW50aXR5VHlwZS5cblx0XHRcdC8vIElmIGFwcGx5U3VwcG9ydGVkIGlzIHByZXNlbnQgYXQgYm90aCB0aGUgbmF2UHJvcCBhbmQgdGhlIGVudGl0eVR5cGUgdGhlbiBuYXZQcm9wIGlzIG1vcmUgc3BlY2lmaWMgc28gdGFrZSBhbm5vdGF0aW9ucyBmcm9tIHRoZXJlXG5cdFx0XHQvLyB0YXJnZXRPYmplY3QgaW4gdGhlIGNvbnZlcnRlciBjb250ZXh0IGZvciBhIHBhcmFtZXRlcml6ZWQgdmlldyBpcyB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBwb2ludGluZyB0byB0aCByZXN1bHQgc2V0XG5cdFx0XHRjb25zdCBvRGF0YU1vZGVsT2JqZWN0UGF0aCA9IHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpO1xuXHRcdFx0Y29uc3Qgb05hdmlnYXRpb25Qcm9wZXJ0eU9iamVjdCA9IG9EYXRhTW9kZWxPYmplY3RQYXRoPy50YXJnZXRPYmplY3Q7XG5cdFx0XHRjb25zdCBvRW50aXR5VHlwZU9iamVjdCA9IG9EYXRhTW9kZWxPYmplY3RQYXRoPy50YXJnZXRFbnRpdHlUeXBlO1xuXHRcdFx0aWYgKG9OYXZpZ2F0aW9uUHJvcGVydHlPYmplY3Q/LmFubm90YXRpb25zPy5BZ2dyZWdhdGlvbj8uQXBwbHlTdXBwb3J0ZWQpIHtcblx0XHRcdFx0b0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblNvdXJjZSA9IG9OYXZpZ2F0aW9uUHJvcGVydHlPYmplY3Q7XG5cdFx0XHR9IGVsc2UgaWYgKG9FbnRpdHlUeXBlT2JqZWN0Py5hbm5vdGF0aW9ucz8uQWdncmVnYXRpb24/LkFwcGx5U3VwcG9ydGVkKSB7XG5cdFx0XHRcdG9BZ2dyZWdhdGlvbkFubm90YXRpb25Tb3VyY2UgPSBvRW50aXR5VHlwZU9iamVjdDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gRm9yIHRoZSB0aW1lIGJlaW5nLCB3ZSBpZ25vcmUgYW5ub3RhdGlvbnMgYXQgdGhlIGNvbnRhaW5lciBsZXZlbCwgdW50aWwgdGhlIHZvY2FidWxhcnkgaXMgc3RhYmlsaXplZFxuXHRcdFx0Y29uc3Qgb0VudGl0eVNldE9iamVjdCA9IHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk7XG5cdFx0XHRpZiAoaXNFbnRpdHlTZXQob0VudGl0eVNldE9iamVjdCkgJiYgb0VudGl0eVNldE9iamVjdC5hbm5vdGF0aW9ucy5BZ2dyZWdhdGlvbj8uQXBwbHlTdXBwb3J0ZWQpIHtcblx0XHRcdFx0b0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblNvdXJjZSA9IG9FbnRpdHlTZXRPYmplY3Q7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvQWdncmVnYXRpb25Bbm5vdGF0aW9uU291cmNlID0gdGhpcy5fY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvQWdncmVnYXRpb25Bbm5vdGF0aW9uU291cmNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgZW50aXR5IHN1cHBvcnRzIGFuYWx5dGljYWwgcXVlcmllcy5cblx0ICpcblx0ICogQHJldHVybnMgYHRydWVgIGlmIGFuYWx5dGljYWwgcXVlcmllcyBhcmUgc3VwcG9ydGVkLCBmYWxzZSBvdGhlcndpc2UuXG5cdCAqL1xuXHRwdWJsaWMgaXNBbmFseXRpY3NTdXBwb3J0ZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2JBcHBseVN1cHBvcnRlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBwcm9wZXJ0eSBpcyBncm91cGFibGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gY2hlY2tcblx0ICogQHJldHVybnMgYHVuZGVmaW5lZGAgaWYgdGhlIGVudGl0eSBkb2Vzbid0IHN1cHBvcnQgYW5hbHl0aWNhbCBxdWVyaWVzLCB0cnVlIG9yIGZhbHNlIG90aGVyd2lzZVxuXHQgKi9cblx0cHVibGljIGlzUHJvcGVydHlHcm91cGFibGUocHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKCF0aGlzLl9iQXBwbHlTdXBwb3J0ZWQpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIGlmICghdGhpcy5fYUdyb3VwYWJsZVByb3BlcnRpZXMgfHwgdGhpcy5fYUdyb3VwYWJsZVByb3BlcnRpZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHQvLyBObyBncm91cGFibGVQcm9wZXJ0aWVzIC0tPiBhbGwgcHJvcGVydGllcyBhcmUgZ3JvdXBhYmxlXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2FHcm91cGFibGVQcm9wZXJ0aWVzLmZpbmRJbmRleCgocGF0aCkgPT4gcGF0aC4kdGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZSA9PT0gcHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lKSA+PSAwO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBwcm9wZXJ0eSBpcyBhZ2dyZWdhdGFibGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gY2hlY2tcblx0ICogQHJldHVybnMgYHVuZGVmaW5lZGAgaWYgdGhlIGVudGl0eSBkb2Vzbid0IHN1cHBvcnQgYW5hbHl0aWNhbCBxdWVyaWVzLCB0cnVlIG9yIGZhbHNlIG90aGVyd2lzZVxuXHQgKi9cblx0cHVibGljIGlzUHJvcGVydHlBZ2dyZWdhdGFibGUocHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKCF0aGlzLl9iQXBwbHlTdXBwb3J0ZWQpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEdldCB0aGUgY3VzdG9tIGFnZ3JlZ2F0ZXNcblx0XHRcdGNvbnN0IGFDdXN0b21BZ2dyZWdhdGVBbm5vdGF0aW9uczogQ3VzdG9tQWdncmVnYXRlW10gPSB0aGlzLl9jb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25zQnlUZXJtKFxuXHRcdFx0XHRcIkFnZ3JlZ2F0aW9uXCIsXG5cdFx0XHRcdEFnZ3JlZ2F0aW9uQW5ub3RhdGlvblRlcm1zLkN1c3RvbUFnZ3JlZ2F0ZSxcblx0XHRcdFx0W3RoaXMuX29BZ2dyZWdhdGlvbkFubm90YXRpb25UYXJnZXRdXG5cdFx0XHQpO1xuXG5cdFx0XHQvLyBDaGVjayBpZiBhIGN1c3RvbSBhZ2dyZWdhdGUgaGFzIGEgcXVhbGlmaWVyIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHByb3BlcnR5IG5hbWVcblx0XHRcdHJldHVybiBhQ3VzdG9tQWdncmVnYXRlQW5ub3RhdGlvbnMuc29tZSgoYW5ub3RhdGlvbikgPT4ge1xuXHRcdFx0XHRyZXR1cm4gcHJvcGVydHkubmFtZSA9PT0gYW5ub3RhdGlvbi5xdWFsaWZpZXI7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgZ2V0R3JvdXBhYmxlUHJvcGVydGllcygpIHtcblx0XHRyZXR1cm4gdGhpcy5fYUdyb3VwYWJsZVByb3BlcnRpZXM7XG5cdH1cblxuXHRwdWJsaWMgZ2V0QWdncmVnYXRhYmxlUHJvcGVydGllcygpIHtcblx0XHRyZXR1cm4gdGhpcy5fYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXM7XG5cdH1cblxuXHRwdWJsaWMgZ2V0RW50aXR5VHlwZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fZW50aXR5VHlwZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzIG9yIEFnZ3JlZ2F0ZWRQcm9wZXJ0eSBiYXNlZCBvbiBwYXJhbSBUZXJtLlxuXHQgKiBUaGUgVGVybSBoZXJlIGluZGljYXRlcyBpZiB0aGUgQWdncmVnYXRlZFByb3BlcnR5IHNob3VsZCBiZSByZXRyaWV2ZWQgb3IgdGhlIGRlcHJlY2F0ZWQgQWdncmVnYXRlZFByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBUZXJtIFRoZSBBbm5vdGF0aW9uIFRlcm1cblx0ICogQHJldHVybnMgQW5ub3RhdGlvbnMgVGhlIGFwcHJvcHJpYXRlIGFubm90YXRpb25zIGJhc2VkIG9uIHRoZSBnaXZlbiBUZXJtLlxuXHQgKi9cblx0cHVibGljIGdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzKFRlcm06IFN0cmluZykge1xuXHRcdGlmIChUZXJtID09PSBcIkFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzXCIpIHtcblx0XHRcdHJldHVybiB0aGlzLl9jb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25zQnlUZXJtKFwiQW5hbHl0aWNzXCIsIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzXCIsIFtcblx0XHRcdFx0dGhpcy5fY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlDb250YWluZXIoKSxcblx0XHRcdFx0dGhpcy5fY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKClcblx0XHRcdF0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uc0J5VGVybShcIkFuYWx5dGljc1wiLCBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5BZ2dyZWdhdGVkUHJvcGVydHlcIiwgW1xuXHRcdFx0dGhpcy5fY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlDb250YWluZXIoKSxcblx0XHRcdHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpXG5cdFx0XSk7XG5cdH1cblxuXHQvLyByZXRpcnZlIGFsbCB0cmFuc2Zvcm1hdGlvbiBhZ2dyZWdhdGVzIGJ5IHByaW9yaXRpemluZyBBZ2dyZWdhdGVkUHJvcGVydHkgb3ZlciBBZ2dyZWdhdGVkUHJvcGVydGllcyBvYmplY3RzXG5cdHB1YmxpYyBnZXRUcmFuc0FnZ3JlZ2F0aW9ucygpIHtcblx0XHRsZXQgYUFnZ3JlZ2F0ZWRQcm9wZXJ0eU9iamVjdHMgPSB0aGlzLmdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzKFwiQWdncmVnYXRlZFByb3BlcnR5XCIpO1xuXHRcdGlmICghYUFnZ3JlZ2F0ZWRQcm9wZXJ0eU9iamVjdHMgfHwgYUFnZ3JlZ2F0ZWRQcm9wZXJ0eU9iamVjdHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRhQWdncmVnYXRlZFByb3BlcnR5T2JqZWN0cyA9IHRoaXMuZ2V0QWdncmVnYXRlZFByb3BlcnRpZXMoXCJBZ2dyZWdhdGVkUHJvcGVydGllc1wiKVswXTtcblx0XHR9XG5cdFx0cmV0dXJuIGFBZ2dyZWdhdGVkUHJvcGVydHlPYmplY3RzPy5maWx0ZXIoKGFnZ3JlZ2F0ZWRQcm9wZXJ0eTogQWdncmVnYXRlZFByb3BlcnR5VHlwZSkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuX2dldEFnZ3JlZ2F0YWJsZUFnZ3JlZ2F0ZXMoYWdncmVnYXRlZFByb3BlcnR5LkFnZ3JlZ2F0YWJsZVByb3BlcnR5KSkge1xuXHRcdFx0XHRyZXR1cm4gYWdncmVnYXRlZFByb3BlcnR5O1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIGVhY2ggdHJhbnNmb3JtYXRpb24gaXMgYWdncmVnYXRhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGNoZWNrXG5cdCAqIEByZXR1cm5zICdhZ2dyZWdhdGVkUHJvcGVydHknXG5cdCAqL1xuXG5cdHByaXZhdGUgX2dldEFnZ3JlZ2F0YWJsZUFnZ3JlZ2F0ZXMocHJvcGVydHk6IFByb3BlcnR5UGF0aCB8IEFubm90YXRpb25UZXJtPEN1c3RvbUFnZ3JlZ2F0ZT4pIHtcblx0XHRjb25zdCBhQWdncmVnYXRhYmxlUHJvcGVydGllcyA9ICh0aGlzLmdldEFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMoKSBhcyBBcHBseVN1cHBvcnRlZFR5cGVbXCJBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzXCJdKSB8fCBbXTtcblx0XHRyZXR1cm4gYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMuZmluZChmdW5jdGlvbiAob2JqOiBBZ2dyZWdhdGFibGVQcm9wZXJ0eVR5cGUgfCBhbnkpIHtcblx0XHRcdGNvbnN0IHByb3AgPSAocHJvcGVydHkgYXMgQW5ub3RhdGlvblRlcm08Q3VzdG9tQWdncmVnYXRlPikucXVhbGlmaWVyXG5cdFx0XHRcdD8gKHByb3BlcnR5IGFzIEFubm90YXRpb25UZXJtPEN1c3RvbUFnZ3JlZ2F0ZT4pLnF1YWxpZmllclxuXHRcdFx0XHQ6IChwcm9wZXJ0eSBhcyBQcm9wZXJ0eVBhdGgpLiR0YXJnZXQubmFtZTtcblx0XHRcdGlmIChvYmo/LlByb3BlcnR5Py52YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gb2JqLlByb3BlcnR5LnZhbHVlID09PSBwcm9wO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG9iaj8ubmFtZSA9PT0gcHJvcDtcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgX2dldEVudGl0eVByb3BlcnRpZXMoKSB7XG5cdFx0bGV0IGVudGl0eVByb3BlcnRpZXM7XG5cdFx0aWYgKGlzRW50aXR5U2V0KHRoaXMuX29BZ2dyZWdhdGlvbkFubm90YXRpb25UYXJnZXQpKSB7XG5cdFx0XHRlbnRpdHlQcm9wZXJ0aWVzID0gdGhpcy5fb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldD8uZW50aXR5VHlwZT8uZW50aXR5UHJvcGVydGllcztcblx0XHR9IGVsc2UgaWYgKGlzRW50aXR5VHlwZSh0aGlzLl9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0KSkge1xuXHRcdFx0ZW50aXR5UHJvcGVydGllcyA9IHRoaXMuX29BZ2dyZWdhdGlvbkFubm90YXRpb25UYXJnZXQ/LmVudGl0eVByb3BlcnRpZXM7XG5cdFx0fVxuXHRcdHJldHVybiBlbnRpdHlQcm9wZXJ0aWVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGxpc3Qgb2YgY3VzdG9tIGFnZ3JlZ2F0ZSBkZWZpbml0aW9ucyBmb3IgdGhlIGVudGl0eSB0eXBlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBIG1hcCAocHJvcGVydHlOYW1lIC0tPiBhcnJheSBvZiBjb250ZXh0LWRlZmluaW5nIHByb3BlcnR5IG5hbWVzKSBmb3IgZWFjaCBjdXN0b20gYWdncmVnYXRlIGNvcnJlc3BvbmRpbmcgdG8gYSBwcm9wZXJ0eS4gVGhlIGFycmF5IG9mXG5cdCAqIGNvbnRleHQtZGVmaW5pbmcgcHJvcGVydHkgbmFtZXMgaXMgZW1wdHkgaWYgdGhlIGN1c3RvbSBhZ2dyZWdhdGUgZG9lc24ndCBoYXZlIGFueSBjb250ZXh0LWRlZmluaW5nIHByb3BlcnR5LlxuXHQgKi9cblx0cHVibGljIGdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zKCkge1xuXHRcdC8vIEdldCB0aGUgY3VzdG9tIGFnZ3JlZ2F0ZXNcblx0XHRjb25zdCBhQ3VzdG9tQWdncmVnYXRlQW5ub3RhdGlvbnM6IEN1c3RvbUFnZ3JlZ2F0ZVtdID0gdGhpcy5fY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uc0J5VGVybShcblx0XHRcdFwiQWdncmVnYXRpb25cIixcblx0XHRcdEFnZ3JlZ2F0aW9uQW5ub3RhdGlvblRlcm1zLkN1c3RvbUFnZ3JlZ2F0ZSxcblx0XHRcdFt0aGlzLl9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0XVxuXHRcdCk7XG5cdFx0cmV0dXJuIGFDdXN0b21BZ2dyZWdhdGVBbm5vdGF0aW9ucztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBsaXN0IG9mIGFsbG93ZWQgdHJhbnNmb3JtYXRpb25zIGluIHRoZSAkYXBwbHkuXG5cdCAqIEZpcnN0IGxvb2sgYXQgdGhlIGN1cnJlbnQgRW50aXR5U2V0LCB0aGVuIGxvb2sgYXQgdGhlIGRlZmF1bHQgdmFsdWVzIHByb3ZpZGVkIGF0IHRoZSBjb250YWluZXIgbGV2ZWwuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBsaXN0IG9mIHRyYW5zZm9ybWF0aW9ucywgb3IgdW5kZWZpbmVkIGlmIG5vIGxpc3QgaXMgZm91bmRcblx0ICovXG5cdHB1YmxpYyBnZXRBbGxvd2VkVHJhbnNmb3JtYXRpb25zKCk6IFN0cmluZ1tdIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0KHRoaXMub1RhcmdldEFnZ3JlZ2F0aW9uQW5ub3RhdGlvbnM/LkFwcGx5U3VwcG9ydGVkPy5UcmFuc2Zvcm1hdGlvbnMgYXMgU3RyaW5nW10pIHx8XG5cdFx0XHQodGhpcy5vQ29udGFpbmVyQWdncmVnYXRpb25Bbm5vdGF0aW9uPy5BcHBseVN1cHBvcnRlZERlZmF1bHRzPy5UcmFuc2Zvcm1hdGlvbnMgYXMgU3RyaW5nW10pXG5cdFx0KTtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztFQWFBO0FBQ0E7QUFDQTtFQUZBLElBR2FBLGlCQUFpQjtJQW9CN0I7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQywyQkFBWUMsVUFBc0IsRUFBRUMsZ0JBQWtDLEVBQTJDO01BQUE7TUFBQSxJQUF6Q0Msc0JBQStCLHVFQUFHLEtBQUs7TUFDOUc7TUFDQSxJQUFJLENBQUNDLFdBQVcsR0FBR0gsVUFBVTtNQUM3QixJQUFJLENBQUNJLGlCQUFpQixHQUFHSCxnQkFBZ0I7TUFFekMsSUFBSSxDQUFDSSw2QkFBNkIsR0FBRyxJQUFJLENBQUNDLHFDQUFxQyxFQUFFO01BQ2pGLElBQ0NDLG9CQUFvQixDQUFDLElBQUksQ0FBQ0YsNkJBQTZCLENBQUMsSUFDeERHLFlBQVksQ0FBQyxJQUFJLENBQUNILDZCQUE2QixDQUFDLElBQ2hESSxXQUFXLENBQUMsSUFBSSxDQUFDSiw2QkFBNkIsQ0FBQyxFQUM5QztRQUNELElBQUksQ0FBQ0ssNkJBQTZCLEdBQUcsSUFBSSxDQUFDTCw2QkFBNkIsQ0FBQ00sV0FBVyxDQUFD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