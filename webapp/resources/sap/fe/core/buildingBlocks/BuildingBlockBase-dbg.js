/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/deepClone", "sap/base/util/merge", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/ConverterContext", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper"], function (deepClone, merge, BuildingBlockTemplateProcessor, ConverterContext, BindingToolkit, StableIdHelper, DataModelPathHelper) {
  "use strict";

  var _exports = {};
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var generate = StableIdHelper.generate;
  var isUndefinedExpression = BindingToolkit.isUndefinedExpression;
  var xml = BuildingBlockTemplateProcessor.xml;
  var unregisterBuildingBlock = BuildingBlockTemplateProcessor.unregisterBuildingBlock;
  var registerBuildingBlock = BuildingBlockTemplateProcessor.registerBuildingBlock;
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  /**
   * Base class for building blocks
   */
  let BuildingBlockBase = /*#__PURE__*/function () {
    function BuildingBlockBase(props, _controlConfiguration, _visitorSettings) {
      var _visitorSettings$mode;
      this.isPublic = false;
      this.getConverterContext = function (dataModelObjectPath, contextPath, settings, extraParams) {
        var _settings$models$view;
        const appComponent = settings.appComponent;
        const originalViewData = (_settings$models$view = settings.models.viewData) === null || _settings$models$view === void 0 ? void 0 : _settings$models$view.getData();
        let viewData = Object.assign({}, originalViewData);
        delete viewData.resourceModel;
        delete viewData.appComponent;
        viewData = deepClone(viewData);
        let controlConfiguration = {};
        // Only merge in page control configuration if the building block is on the same context
        const relativePath = getTargetObjectPath(dataModelObjectPath.contextLocation ?? dataModelObjectPath);
        if (relativePath === (originalViewData === null || originalViewData === void 0 ? void 0 : originalViewData.contextPath) || relativePath === `/${originalViewData === null || originalViewData === void 0 ? void 0 : originalViewData.entitySet}`) {
          controlConfiguration = viewData.controlConfiguration;
        }
        viewData.controlConfiguration = merge(controlConfiguration, extraParams || {});
        return ConverterContext.createConverterContextForMacro(dataModelObjectPath.startingEntitySet.name, settings.models.metaModel, appComponent === null || appComponent === void 0 ? void 0 : appComponent.getDiagnostics(), merge, dataModelObjectPath.contextLocation, viewData);
      };
      Object.keys(props).forEach(propName => {
        this[propName] = props[propName];
      });
      this.resourceModel = _visitorSettings === null || _visitorSettings === void 0 ? void 0 : (_visitorSettings$mode = _visitorSettings.models) === null || _visitorSettings$mode === void 0 ? void 0 : _visitorSettings$mode["sap.fe.i18n"];
    }

    /**
     * Only used internally
     *
     * @private
     */
    _exports = BuildingBlockBase;
    var _proto = BuildingBlockBase.prototype;
    /**
     * Convert the given local element ID to a globally unique ID by prefixing with the Building Block ID.
     *
     * @param stringParts
     * @returns Either the global ID or undefined if the Building Block doesn't have an ID
     * @private
     */
    _proto.createId = function createId() {
      // If the child instance has an ID property use it otherwise return undefined
      if (this.id) {
        for (var _len = arguments.length, stringParts = new Array(_len), _key = 0; _key < _len; _key++) {
          stringParts[_key] = arguments[_key];
        }
        return generate([this.id, ...stringParts]);
      }
      return undefined;
    }

    /**
     * Get the ID of the content control.
     *
     * @param buildingBlockId
     * @returns Return the ID
     * @private
     */;
    _proto.getContentId = function getContentId(buildingBlockId) {
      return `${buildingBlockId}-content`;
    }

    /**
     * Returns translated text for a given resource key.
     *
     * @param textID ID of the Text
     * @param parameters Array of parameters that are used to create the text
     * @param metaPath Entity set name or action name to overload a text
     * @returns Determined text
     */;
    _proto.getTranslatedText = function getTranslatedText(textID, parameters, metaPath) {
      var _this$resourceModel;
      return ((_this$resourceModel = this.resourceModel) === null || _this$resourceModel === void 0 ? void 0 : _this$resourceModel.getText(textID, parameters, metaPath)) || textID;
    };
    /**
     * Only used internally.
     *
     * @returns All the properties defined on the object with their values
     * @private
     */
    _proto.getProperties = function getProperties() {
      const allProperties = {};
      for (const oInstanceKey in this) {
        if (this.hasOwnProperty(oInstanceKey)) {
          allProperties[oInstanceKey] = this[oInstanceKey];
        }
      }
      return allProperties;
    };
    BuildingBlockBase.register = function register() {
      registerBuildingBlock(this);
    };
    BuildingBlockBase.unregister = function unregister() {
      unregisterBuildingBlock(this);
    }

    /**
     * Add a part of string based on the condition.
     *
     * @param condition
     * @param partToAdd
     * @returns The part to add if the condition is true, otherwise an empty string
     * @private
     */;
    _proto.addConditionally = function addConditionally(condition, partToAdd) {
      if (condition) {
        return partToAdd;
      } else {
        return "";
      }
    }

    /**
     * Add an attribute depending on the current value of the property.
     * If it's undefined the attribute is not added.
     *
     * @param attributeName
     * @param value
     * @returns The attribute to add if the value is not undefined, otherwise an empty string
     * @private
     */;
    _proto.attr = function attr(attributeName, value) {
      if (value !== undefined && !isUndefinedExpression(value)) {
        return () => xml`${attributeName}="${value}"`;
      } else {
        return () => "";
      }
    };
    _createClass(BuildingBlockBase, null, [{
      key: "metadata",
      get: function () {
        // We need to store the metadata on the actual subclass, not on BuildingBlockBase
        this.internalMetadata ??= {
          namespace: "",
          name: "",
          properties: {},
          aggregations: {},
          stereotype: "xmlmacro"
        };
        return this.internalMetadata;
      }
    }]);
    return BuildingBlockBase;
  }();
  BuildingBlockBase.isRuntime = false;
  _exports = BuildingBlockBase;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdWlsZGluZ0Jsb2NrQmFzZSIsInByb3BzIiwiX2NvbnRyb2xDb25maWd1cmF0aW9uIiwiX3Zpc2l0b3JTZXR0aW5ncyIsImlzUHVibGljIiwiZ2V0Q29udmVydGVyQ29udGV4dCIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJjb250ZXh0UGF0aCIsInNldHRpbmdzIiwiZXh0cmFQYXJhbXMiLCJhcHBDb21wb25lbnQiLCJvcmlnaW5hbFZpZXdEYXRhIiwibW9kZWxzIiwidmlld0RhdGEiLCJnZXREYXRhIiwiT2JqZWN0IiwiYXNzaWduIiwicmVzb3VyY2VNb2RlbCIsImRlZXBDbG9uZSIsImNvbnRyb2xDb25maWd1cmF0aW9uIiwicmVsYXRpdmVQYXRoIiwiZ2V0VGFyZ2V0T2JqZWN0UGF0aCIsImNvbnRleHRMb2NhdGlvbiIsImVudGl0eVNldCIsIm1lcmdlIiwiQ29udmVydGVyQ29udGV4dCIsImNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyIsInN0YXJ0aW5nRW50aXR5U2V0IiwibmFtZSIsIm1ldGFNb2RlbCIsImdldERpYWdub3N0aWNzIiwia2V5cyIsImZvckVhY2giLCJwcm9wTmFtZSIsImNyZWF0ZUlkIiwiaWQiLCJzdHJpbmdQYXJ0cyIsImdlbmVyYXRlIiwidW5kZWZpbmVkIiwiZ2V0Q29udGVudElkIiwiYnVpbGRpbmdCbG9ja0lkIiwiZ2V0VHJhbnNsYXRlZFRleHQiLCJ0ZXh0SUQiLCJwYXJhbWV0ZXJzIiwibWV0YVBhdGgiLCJnZXRUZXh0IiwiZ2V0UHJvcGVydGllcyIsImFsbFByb3BlcnRpZXMiLCJvSW5zdGFuY2VLZXkiLCJoYXNPd25Qcm9wZXJ0eSIsInJlZ2lzdGVyIiwicmVnaXN0ZXJCdWlsZGluZ0Jsb2NrIiwidW5yZWdpc3RlciIsInVucmVnaXN0ZXJCdWlsZGluZ0Jsb2NrIiwiYWRkQ29uZGl0aW9uYWxseSIsImNvbmRpdGlvbiIsInBhcnRUb0FkZCIsImF0dHIiLCJhdHRyaWJ1dGVOYW1lIiwidmFsdWUiLCJpc1VuZGVmaW5lZEV4cHJlc3Npb24iLCJ4bWwiLCJpbnRlcm5hbE1ldGFkYXRhIiwibmFtZXNwYWNlIiwicHJvcGVydGllcyIsImFnZ3JlZ2F0aW9ucyIsInN0ZXJlb3R5cGUiLCJpc1J1bnRpbWUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkJ1aWxkaW5nQmxvY2tCYXNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWVwQ2xvbmUgZnJvbSBcInNhcC9iYXNlL3V0aWwvZGVlcENsb25lXCI7XG5pbXBvcnQgbWVyZ2UgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCB0eXBlIHsgQnVpbGRpbmdCbG9ja01ldGFkYXRhLCBPYmplY3RWYWx1ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgeyBUZW1wbGF0ZVByb2Nlc3NvclNldHRpbmdzLCBYTUxQcm9jZXNzb3JUeXBlVmFsdWUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgeyByZWdpc3RlckJ1aWxkaW5nQmxvY2ssIHVucmVnaXN0ZXJCdWlsZGluZ0Jsb2NrLCB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgQ29udmVydGVyQ29udGV4dCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgeyBpc1VuZGVmaW5lZEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0VGFyZ2V0T2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBidWlsZGluZyBibG9ja3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHRwcml2YXRlIHN0YXRpYyBpbnRlcm5hbE1ldGFkYXRhOiBCdWlsZGluZ0Jsb2NrTWV0YWRhdGE7XG5cblx0cHVibGljIHN0YXRpYyBnZXQgbWV0YWRhdGEoKTogQnVpbGRpbmdCbG9ja01ldGFkYXRhIHtcblx0XHQvLyBXZSBuZWVkIHRvIHN0b3JlIHRoZSBtZXRhZGF0YSBvbiB0aGUgYWN0dWFsIHN1YmNsYXNzLCBub3Qgb24gQnVpbGRpbmdCbG9ja0Jhc2Vcblx0XHR0aGlzLmludGVybmFsTWV0YWRhdGEgPz89IHtcblx0XHRcdG5hbWVzcGFjZTogXCJcIixcblx0XHRcdG5hbWU6IFwiXCIsXG5cdFx0XHRwcm9wZXJ0aWVzOiB7fSxcblx0XHRcdGFnZ3JlZ2F0aW9uczoge30sXG5cdFx0XHRzdGVyZW90eXBlOiBcInhtbG1hY3JvXCJcblx0XHR9O1xuXHRcdHJldHVybiB0aGlzLmludGVybmFsTWV0YWRhdGE7XG5cdH1cblxuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGlzUnVudGltZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdHByb3RlY3RlZCBpc1B1YmxpYyA9IGZhbHNlO1xuXG5cdHByaXZhdGUgcmVzb3VyY2VNb2RlbD86IFJlc291cmNlTW9kZWw7XG5cblx0cHJvdGVjdGVkIGlkPzogc3RyaW5nO1xuXG5cdGNvbnN0cnVjdG9yKHByb3BzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgX2NvbnRyb2xDb25maWd1cmF0aW9uPzogdW5rbm93biwgX3Zpc2l0b3JTZXR0aW5ncz86IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MpIHtcblx0XHRPYmplY3Qua2V5cyhwcm9wcykuZm9yRWFjaCgocHJvcE5hbWUpID0+IHtcblx0XHRcdHRoaXNbcHJvcE5hbWUgYXMga2V5b2YgdGhpc10gPSBwcm9wc1twcm9wTmFtZV0gYXMgbmV2ZXI7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnJlc291cmNlTW9kZWwgPSBfdmlzaXRvclNldHRpbmdzPy5tb2RlbHM/LltcInNhcC5mZS5pMThuXCJdO1xuXHR9XG5cblx0LyoqXG5cdCAqIE9ubHkgdXNlZCBpbnRlcm5hbGx5XG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0VGVtcGxhdGU/KG9Ob2RlPzogRWxlbWVudCk6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZDtcblxuXHQvKipcblx0ICogQ29udmVydCB0aGUgZ2l2ZW4gbG9jYWwgZWxlbWVudCBJRCB0byBhIGdsb2JhbGx5IHVuaXF1ZSBJRCBieSBwcmVmaXhpbmcgd2l0aCB0aGUgQnVpbGRpbmcgQmxvY2sgSUQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzdHJpbmdQYXJ0c1xuXHQgKiBAcmV0dXJucyBFaXRoZXIgdGhlIGdsb2JhbCBJRCBvciB1bmRlZmluZWQgaWYgdGhlIEJ1aWxkaW5nIEJsb2NrIGRvZXNuJ3QgaGF2ZSBhbiBJRFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJvdGVjdGVkIGNyZWF0ZUlkKC4uLnN0cmluZ1BhcnRzOiBzdHJpbmdbXSkge1xuXHRcdC8vIElmIHRoZSBjaGlsZCBpbnN0YW5jZSBoYXMgYW4gSUQgcHJvcGVydHkgdXNlIGl0IG90aGVyd2lzZSByZXR1cm4gdW5kZWZpbmVkXG5cdFx0aWYgKHRoaXMuaWQpIHtcblx0XHRcdHJldHVybiBnZW5lcmF0ZShbdGhpcy5pZCwgLi4uc3RyaW5nUGFydHNdKTtcblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIElEIG9mIHRoZSBjb250ZW50IGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBidWlsZGluZ0Jsb2NrSWRcblx0ICogQHJldHVybnMgUmV0dXJuIHRoZSBJRFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJvdGVjdGVkIGdldENvbnRlbnRJZChidWlsZGluZ0Jsb2NrSWQ6IHN0cmluZykge1xuXHRcdHJldHVybiBgJHtidWlsZGluZ0Jsb2NrSWR9LWNvbnRlbnRgO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdHJhbnNsYXRlZCB0ZXh0IGZvciBhIGdpdmVuIHJlc291cmNlIGtleS5cblx0ICpcblx0ICogQHBhcmFtIHRleHRJRCBJRCBvZiB0aGUgVGV4dFxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycyBBcnJheSBvZiBwYXJhbWV0ZXJzIHRoYXQgYXJlIHVzZWQgdG8gY3JlYXRlIHRoZSB0ZXh0XG5cdCAqIEBwYXJhbSBtZXRhUGF0aCBFbnRpdHkgc2V0IG5hbWUgb3IgYWN0aW9uIG5hbWUgdG8gb3ZlcmxvYWQgYSB0ZXh0XG5cdCAqIEByZXR1cm5zIERldGVybWluZWQgdGV4dFxuXHQgKi9cblx0Z2V0VHJhbnNsYXRlZFRleHQodGV4dElEOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiB1bmtub3duW10sIG1ldGFQYXRoPzogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5yZXNvdXJjZU1vZGVsPy5nZXRUZXh0KHRleHRJRCwgcGFyYW1ldGVycywgbWV0YVBhdGgpIHx8IHRleHRJRDtcblx0fVxuXG5cdHByb3RlY3RlZCBnZXRDb252ZXJ0ZXJDb250ZXh0ID0gZnVuY3Rpb24gKFxuXHRcdGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0Y29udGV4dFBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHRzZXR0aW5nczogVGVtcGxhdGVQcm9jZXNzb3JTZXR0aW5ncyxcblx0XHRleHRyYVBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+XG5cdCkge1xuXHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IHNldHRpbmdzLmFwcENvbXBvbmVudDtcblx0XHRjb25zdCBvcmlnaW5hbFZpZXdEYXRhID0gc2V0dGluZ3MubW9kZWxzLnZpZXdEYXRhPy5nZXREYXRhKCk7XG5cdFx0bGV0IHZpZXdEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgb3JpZ2luYWxWaWV3RGF0YSk7XG5cdFx0ZGVsZXRlIHZpZXdEYXRhLnJlc291cmNlTW9kZWw7XG5cdFx0ZGVsZXRlIHZpZXdEYXRhLmFwcENvbXBvbmVudDtcblx0XHR2aWV3RGF0YSA9IGRlZXBDbG9uZSh2aWV3RGF0YSk7XG5cdFx0bGV0IGNvbnRyb2xDb25maWd1cmF0aW9uID0ge307XG5cdFx0Ly8gT25seSBtZXJnZSBpbiBwYWdlIGNvbnRyb2wgY29uZmlndXJhdGlvbiBpZiB0aGUgYnVpbGRpbmcgYmxvY2sgaXMgb24gdGhlIHNhbWUgY29udGV4dFxuXHRcdGNvbnN0IHJlbGF0aXZlUGF0aCA9IGdldFRhcmdldE9iamVjdFBhdGgoZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24gPz8gZGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0aWYgKHJlbGF0aXZlUGF0aCA9PT0gb3JpZ2luYWxWaWV3RGF0YT8uY29udGV4dFBhdGggfHwgcmVsYXRpdmVQYXRoID09PSBgLyR7b3JpZ2luYWxWaWV3RGF0YT8uZW50aXR5U2V0fWApIHtcblx0XHRcdGNvbnRyb2xDb25maWd1cmF0aW9uID0gdmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb247XG5cdFx0fVxuXHRcdHZpZXdEYXRhLmNvbnRyb2xDb25maWd1cmF0aW9uID0gbWVyZ2UoY29udHJvbENvbmZpZ3VyYXRpb24sIGV4dHJhUGFyYW1zIHx8IHt9KTtcblx0XHRyZXR1cm4gQ29udmVydGVyQ29udGV4dC5jcmVhdGVDb252ZXJ0ZXJDb250ZXh0Rm9yTWFjcm8oXG5cdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0Lm5hbWUsXG5cdFx0XHRzZXR0aW5ncy5tb2RlbHMubWV0YU1vZGVsLFxuXHRcdFx0YXBwQ29tcG9uZW50Py5nZXREaWFnbm9zdGljcygpLFxuXHRcdFx0bWVyZ2UsXG5cdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbixcblx0XHRcdHZpZXdEYXRhXG5cdFx0KTtcblx0fTtcblxuXHQvKipcblx0ICogT25seSB1c2VkIGludGVybmFsbHkuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFsbCB0aGUgcHJvcGVydGllcyBkZWZpbmVkIG9uIHRoZSBvYmplY3Qgd2l0aCB0aGVpciB2YWx1ZXNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyBnZXRQcm9wZXJ0aWVzKCkge1xuXHRcdGNvbnN0IGFsbFByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIE9iamVjdFZhbHVlPiA9IHt9O1xuXHRcdGZvciAoY29uc3Qgb0luc3RhbmNlS2V5IGluIHRoaXMpIHtcblx0XHRcdGlmICh0aGlzLmhhc093blByb3BlcnR5KG9JbnN0YW5jZUtleSkpIHtcblx0XHRcdFx0YWxsUHJvcGVydGllc1tvSW5zdGFuY2VLZXldID0gdGhpc1tvSW5zdGFuY2VLZXldIGFzIHVua25vd24gYXMgT2JqZWN0VmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBhbGxQcm9wZXJ0aWVzO1xuXHR9XG5cblx0c3RhdGljIHJlZ2lzdGVyKCkge1xuXHRcdHJlZ2lzdGVyQnVpbGRpbmdCbG9jayh0aGlzKTtcblx0fVxuXG5cdHN0YXRpYyB1bnJlZ2lzdGVyKCkge1xuXHRcdHVucmVnaXN0ZXJCdWlsZGluZ0Jsb2NrKHRoaXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBhIHBhcnQgb2Ygc3RyaW5nIGJhc2VkIG9uIHRoZSBjb25kaXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBjb25kaXRpb25cblx0ICogQHBhcmFtIHBhcnRUb0FkZFxuXHQgKiBAcmV0dXJucyBUaGUgcGFydCB0byBhZGQgaWYgdGhlIGNvbmRpdGlvbiBpcyB0cnVlLCBvdGhlcndpc2UgYW4gZW1wdHkgc3RyaW5nXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcm90ZWN0ZWQgYWRkQ29uZGl0aW9uYWxseShjb25kaXRpb246IGJvb2xlYW4sIHBhcnRUb0FkZDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRpZiAoY29uZGl0aW9uKSB7XG5cdFx0XHRyZXR1cm4gcGFydFRvQWRkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGFuIGF0dHJpYnV0ZSBkZXBlbmRpbmcgb24gdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIHByb3BlcnR5LlxuXHQgKiBJZiBpdCdzIHVuZGVmaW5lZCB0aGUgYXR0cmlidXRlIGlzIG5vdCBhZGRlZC5cblx0ICpcblx0ICogQHBhcmFtIGF0dHJpYnV0ZU5hbWVcblx0ICogQHBhcmFtIHZhbHVlXG5cdCAqIEByZXR1cm5zIFRoZSBhdHRyaWJ1dGUgdG8gYWRkIGlmIHRoZSB2YWx1ZSBpcyBub3QgdW5kZWZpbmVkLCBvdGhlcndpc2UgYW4gZW1wdHkgc3RyaW5nXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcm90ZWN0ZWQgYXR0cihhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIHZhbHVlPzogWE1MUHJvY2Vzc29yVHlwZVZhbHVlKTogKCkgPT4gc3RyaW5nIHtcblx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiAhaXNVbmRlZmluZWRFeHByZXNzaW9uKHZhbHVlKSkge1xuXHRcdFx0cmV0dXJuICgpID0+IHhtbGAke2F0dHJpYnV0ZU5hbWV9PVwiJHt2YWx1ZX1cImA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAoKSA9PiBcIlwiO1xuXHRcdH1cblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7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