/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  /**
   * Generates the ID from an IBN.
   *
   * The ID contains the value, the potential action and context.
   *
   * @param dataField The IBN annotation
   * @returns The ID
   */
  const _getStableIdPartFromIBN = dataField => {
    var _dataField$Action;
    const idParts = [dataField.SemanticObject.valueOf(), (_dataField$Action = dataField.Action) === null || _dataField$Action === void 0 ? void 0 : _dataField$Action.valueOf()];
    if (dataField.RequiresContext) {
      idParts.push("RequiresContext");
    }
    return idParts.filter(id => id).join("::");
  };

  /**
   * Generates the ID part related to the value of the DataField.
   *
   * @param dataField The DataField
   * @returns String related to the DataField value
   */
  const _getStableIdPartFromValue = dataField => {
    const value = dataField.Value;
    if (value.path) {
      return value.path;
    } else if (value.Apply && value.Function === "odata.concat") {
      return value.Apply.map(app => app.$Path).join("::");
    }
    return replaceSpecialChars(value.replace(/ /g, "_"));
  };

  /**
   * Generates the ID part related to the value or url of the DataFieldWithUrl.
   *
   * @param dataField The DataFieldWithUrl
   * @returns String related to the DataFieldWithUrl value or url
   */
  const _getStableIdPartFromUrlOrPath = dataField => {
    const value = dataField.Value;
    if (value !== null && value !== void 0 && value.path) {
      return value.path;
    } else if (value !== null && value !== void 0 && value.Apply && value.Function === "odata.concat") {
      return value.Apply.map(app => app.$Path).join("::");
    }
    const url = dataField.Url;
    if (url !== null && url !== void 0 && url.path) {
      return url.path;
    } else if (url !== null && url !== void 0 && url.Apply && url.Function === "odata.concat") {
      return url.Apply.map(app => app.$Path).join("::");
    }
    return replaceSpecialChars(value === null || value === void 0 ? void 0 : value.replace(/ /g, "_"));
  };

  /**
   * Copy for the Core.isValid function to be independent.
   *
   * @param value String to validate
   * @returns Whether the value is valid or not
   */
  const _isValid = value => {
    return /^([A-Za-z_][-A-Za-z0-9_.:]*)$/.test(value);
  };

  /**
   * Removes the annotation namespaces.
   *
   * @param id String to manipulate
   * @returns String without the annotation namespaces
   */
  const _removeNamespaces = id => {
    id = id.replace("com.sap.vocabularies.UI.v1.", "");
    id = id.replace("com.sap.vocabularies.Communication.v1.", "");
    return id;
  };

  /**
   * Generates the ID from an annotation.
   *
   * @param annotation The annotation
   * @param idPreparation Determines whether the ID needs to be prepared for final usage
   * @returns The ID
   */
  const createIdForAnnotation = function (annotation) {
    var _id;
    let idPreparation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let id;
    switch (annotation.$Type) {
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        id = annotation.ID ?? annotation.Target.value;
        break;
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        id = annotation.ID ?? "undefined"; // CollectionFacet without Id is not supported but doesn't necessary fail right now
        break;
      case "com.sap.vocabularies.UI.v1.FieldGroupType":
        id = annotation.Label;
        break;
      default:
        id = getStableIdPartFromDataField(annotation);
        break;
    }
    id = (_id = id) === null || _id === void 0 ? void 0 : _id.toString();
    return id && idPreparation ? prepareId(id) : id;
  };

  /**
   * Generates a stable ID based on the given parameters.
   *
   * Parameters are combined in the same order in which they are provided and are separated by '::'.
   * Generate(['Stable', 'Id']) would result in 'Stable::Id' as the stable ID.
   * Currently supported annotations are Facets, FieldGroup and all kinds of DataField.
   *
   * @param stableIdParts Array of strings, undefined, dataModelObjectPath or annotations
   * @returns Stable ID constructed from the provided parameters
   */
  _exports.createIdForAnnotation = createIdForAnnotation;
  const generate = stableIdParts => {
    const ids = stableIdParts.map(element => {
      if (typeof element === "string" || !element) {
        return element;
      }
      return createIdForAnnotation(element.targetObject || element, false);
    });
    const result = ids.filter(id => id).join("::");
    return prepareId(result);
  };

  /**
   * Generates the ID from a DataField.
   *
   * @param dataField The DataField
   * @param ignoreForCompatibility Ignore a part of the ID on the DataFieldWithNavigationPath to be aligned with previous versions
   * @returns The ID
   */
  _exports.generate = generate;
  const getStableIdPartFromDataField = function (dataField) {
    let ignoreForCompatibility = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let id = "";
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        id = `DataFieldForAction::${dataField.Action}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        id = `DataFieldForIntentBasedNavigation::${_getStableIdPartFromIBN(dataField)}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        id = `DataFieldForAnnotation::${dataField.Target.value}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        id = `DataFieldWithAction::${_getStableIdPartFromValue(dataField)}::${dataField.Action}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataField":
        id = `DataField::${_getStableIdPartFromValue(dataField)}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        id = `DataFieldWithIntentBasedNavigation::${_getStableIdPartFromValue(dataField)}::${_getStableIdPartFromIBN(dataField)}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        id = `DataFieldWithNavigationPath::${_getStableIdPartFromValue(dataField)}`;
        if (dataField.Target.type === "NavigationPropertyPath" && !ignoreForCompatibility) {
          id = `${id}::${dataField.Target.value}`;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        id = `DataFieldWithUrl::${_getStableIdPartFromUrlOrPath(dataField)}`;
        break;
      default:
        break;
    }
    return id ? prepareId(id) : undefined;
  };

  /**
   * Removes or replaces with "::" some special characters.
   * Special characters (@, /, #) are replaced by '::' if they are in the middle of the stable ID and removed altogether if they are at the beginning or end.
   *
   * @param id String to manipulate
   * @returns String without the special characters
   */
  _exports.getStableIdPartFromDataField = getStableIdPartFromDataField;
  const replaceSpecialChars = id => {
    if (id.indexOf(" ") >= 0) {
      throw Error(`${id} - Spaces are not allowed in ID parts.`);
    }
    id = id.replace(/^\/|^@|^#|^\*/, "") // remove special characters from the beginning of the string
    .replace(/\/$|@$|#$|\*$/, "") // remove special characters from the end of the string
    .replace(/\/|@|\(|\)|#|\*/g, "::"); // replace special characters with ::

    // Replace double occurrences of the separator with a single separator
    while (id.indexOf("::::") > -1) {
      id = id.replace("::::", "::");
    }

    // If there is a :: at the end of the ID remove it
    if (id.slice(-2) == "::") {
      id = id.slice(0, -2);
    }
    return id;
  };

  /**
   * Prepares the ID.
   *
   * Removes namespaces and special characters and checks the validity of this ID.
   *
   * @param id The ID
   * @returns The ID or throws an error
   */
  _exports.replaceSpecialChars = replaceSpecialChars;
  const prepareId = function (id) {
    id = replaceSpecialChars(_removeNamespaces(id));
    if (_isValid(id)) {
      return id;
    } else {
      throw Error(`${id} - Stable Id could not be generated due to insufficient information.`);
    }
  };
  _exports.prepareId = prepareId;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZ2V0U3RhYmxlSWRQYXJ0RnJvbUlCTiIsImRhdGFGaWVsZCIsImlkUGFydHMiLCJTZW1hbnRpY09iamVjdCIsInZhbHVlT2YiLCJBY3Rpb24iLCJSZXF1aXJlc0NvbnRleHQiLCJwdXNoIiwiZmlsdGVyIiwiaWQiLCJqb2luIiwiX2dldFN0YWJsZUlkUGFydEZyb21WYWx1ZSIsInZhbHVlIiwiVmFsdWUiLCJwYXRoIiwiQXBwbHkiLCJGdW5jdGlvbiIsIm1hcCIsImFwcCIsIiRQYXRoIiwicmVwbGFjZVNwZWNpYWxDaGFycyIsInJlcGxhY2UiLCJfZ2V0U3RhYmxlSWRQYXJ0RnJvbVVybE9yUGF0aCIsInVybCIsIlVybCIsIl9pc1ZhbGlkIiwidGVzdCIsIl9yZW1vdmVOYW1lc3BhY2VzIiwiY3JlYXRlSWRGb3JBbm5vdGF0aW9uIiwiYW5ub3RhdGlvbiIsImlkUHJlcGFyYXRpb24iLCIkVHlwZSIsIklEIiwiVGFyZ2V0IiwiTGFiZWwiLCJnZXRTdGFibGVJZFBhcnRGcm9tRGF0YUZpZWxkIiwidG9TdHJpbmciLCJwcmVwYXJlSWQiLCJnZW5lcmF0ZSIsInN0YWJsZUlkUGFydHMiLCJpZHMiLCJlbGVtZW50IiwidGFyZ2V0T2JqZWN0IiwicmVzdWx0IiwiaWdub3JlRm9yQ29tcGF0aWJpbGl0eSIsInR5cGUiLCJ1bmRlZmluZWQiLCJpbmRleE9mIiwiRXJyb3IiLCJzbGljZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU3RhYmxlSWRIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0RGF0YUZpZWxkLFxuXHREYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHREYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdERhdGFGaWVsZFdpdGhBY3Rpb24sXG5cdERhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdERhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aCxcblx0RGF0YUZpZWxkV2l0aFVybCxcblx0RmFjZXRUeXBlcyxcblx0RmllbGRHcm91cCxcblx0VUlBbm5vdGF0aW9uVHlwZXNcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCIuLi90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcblxuZXhwb3J0IHR5cGUgQXV0aG9yaXplZElkQW5ub3RhdGlvbnNUeXBlID0gRmFjZXRUeXBlcyB8IEZpZWxkR3JvdXAgfCBEYXRhRmllbGRBYnN0cmFjdFR5cGVzO1xuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgSUQgZnJvbSBhbiBJQk4uXG4gKlxuICogVGhlIElEIGNvbnRhaW5zIHRoZSB2YWx1ZSwgdGhlIHBvdGVudGlhbCBhY3Rpb24gYW5kIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBUaGUgSUJOIGFubm90YXRpb25cbiAqIEByZXR1cm5zIFRoZSBJRFxuICovXG5jb25zdCBfZ2V0U3RhYmxlSWRQYXJ0RnJvbUlCTiA9IChkYXRhRmllbGQ6IERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiB8IERhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb24pID0+IHtcblx0Y29uc3QgaWRQYXJ0cyA9IFtkYXRhRmllbGQuU2VtYW50aWNPYmplY3QudmFsdWVPZigpLCBkYXRhRmllbGQuQWN0aW9uPy52YWx1ZU9mKCldO1xuXHRpZiAoKGRhdGFGaWVsZCBhcyBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24pLlJlcXVpcmVzQ29udGV4dCkge1xuXHRcdGlkUGFydHMucHVzaChcIlJlcXVpcmVzQ29udGV4dFwiKTtcblx0fVxuXHRyZXR1cm4gaWRQYXJ0cy5maWx0ZXIoKGlkKSA9PiBpZCkuam9pbihcIjo6XCIpO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIElEIHBhcnQgcmVsYXRlZCB0byB0aGUgdmFsdWUgb2YgdGhlIERhdGFGaWVsZC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIFRoZSBEYXRhRmllbGRcbiAqIEByZXR1cm5zIFN0cmluZyByZWxhdGVkIHRvIHRoZSBEYXRhRmllbGQgdmFsdWVcbiAqL1xuY29uc3QgX2dldFN0YWJsZUlkUGFydEZyb21WYWx1ZSA9IChcblx0ZGF0YUZpZWxkOiBEYXRhRmllbGQgfCBEYXRhRmllbGRXaXRoQWN0aW9uIHwgRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbiB8IERhdGFGaWVsZFdpdGhVcmwgfCBEYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGhcbik6IHN0cmluZyA9PiB7XG5cdGNvbnN0IHZhbHVlID0gZGF0YUZpZWxkLlZhbHVlO1xuXHRpZiAodmFsdWUucGF0aCkge1xuXHRcdHJldHVybiB2YWx1ZS5wYXRoIGFzIHN0cmluZztcblx0fSBlbHNlIGlmICh2YWx1ZS5BcHBseSAmJiB2YWx1ZS5GdW5jdGlvbiA9PT0gXCJvZGF0YS5jb25jYXRcIikge1xuXHRcdHJldHVybiB2YWx1ZS5BcHBseS5tYXAoKGFwcDogYW55KSA9PiBhcHAuJFBhdGggYXMgc3RyaW5nIHwgdW5kZWZpbmVkKS5qb2luKFwiOjpcIik7XG5cdH1cblx0cmV0dXJuIHJlcGxhY2VTcGVjaWFsQ2hhcnModmFsdWUucmVwbGFjZSgvIC9nLCBcIl9cIikpO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIElEIHBhcnQgcmVsYXRlZCB0byB0aGUgdmFsdWUgb3IgdXJsIG9mIHRoZSBEYXRhRmllbGRXaXRoVXJsLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIERhdGFGaWVsZFdpdGhVcmxcbiAqIEByZXR1cm5zIFN0cmluZyByZWxhdGVkIHRvIHRoZSBEYXRhRmllbGRXaXRoVXJsIHZhbHVlIG9yIHVybFxuICovXG5jb25zdCBfZ2V0U3RhYmxlSWRQYXJ0RnJvbVVybE9yUGF0aCA9IChkYXRhRmllbGQ6IERhdGFGaWVsZFdpdGhVcmwpOiBzdHJpbmcgPT4ge1xuXHRjb25zdCB2YWx1ZSA9IGRhdGFGaWVsZC5WYWx1ZTtcblx0aWYgKHZhbHVlPy5wYXRoKSB7XG5cdFx0cmV0dXJuIHZhbHVlLnBhdGggYXMgc3RyaW5nO1xuXHR9IGVsc2UgaWYgKHZhbHVlPy5BcHBseSAmJiB2YWx1ZS5GdW5jdGlvbiA9PT0gXCJvZGF0YS5jb25jYXRcIikge1xuXHRcdHJldHVybiB2YWx1ZS5BcHBseS5tYXAoKGFwcDogYW55KSA9PiBhcHAuJFBhdGggYXMgc3RyaW5nIHwgdW5kZWZpbmVkKS5qb2luKFwiOjpcIik7XG5cdH1cblx0Y29uc3QgdXJsOiBhbnkgPSBkYXRhRmllbGQuVXJsO1xuXHRpZiAodXJsPy5wYXRoKSB7XG5cdFx0cmV0dXJuIHVybC5wYXRoO1xuXHR9IGVsc2UgaWYgKHVybD8uQXBwbHkgJiYgdXJsLkZ1bmN0aW9uID09PSBcIm9kYXRhLmNvbmNhdFwiKSB7XG5cdFx0cmV0dXJuIHVybC5BcHBseS5tYXAoKGFwcDogYW55KSA9PiBhcHAuJFBhdGggYXMgc3RyaW5nIHwgdW5kZWZpbmVkKS5qb2luKFwiOjpcIik7XG5cdH1cblx0cmV0dXJuIHJlcGxhY2VTcGVjaWFsQ2hhcnModmFsdWU/LnJlcGxhY2UoLyAvZywgXCJfXCIpKTtcbn07XG5cbi8qKlxuICogQ29weSBmb3IgdGhlIENvcmUuaXNWYWxpZCBmdW5jdGlvbiB0byBiZSBpbmRlcGVuZGVudC5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgU3RyaW5nIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB2YWx1ZSBpcyB2YWxpZCBvciBub3RcbiAqL1xuY29uc3QgX2lzVmFsaWQgPSAodmFsdWU6IHN0cmluZykgPT4ge1xuXHRyZXR1cm4gL14oW0EtWmEtel9dWy1BLVphLXowLTlfLjpdKikkLy50ZXN0KHZhbHVlKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgYW5ub3RhdGlvbiBuYW1lc3BhY2VzLlxuICpcbiAqIEBwYXJhbSBpZCBTdHJpbmcgdG8gbWFuaXB1bGF0ZVxuICogQHJldHVybnMgU3RyaW5nIHdpdGhvdXQgdGhlIGFubm90YXRpb24gbmFtZXNwYWNlc1xuICovXG5jb25zdCBfcmVtb3ZlTmFtZXNwYWNlcyA9IChpZDogc3RyaW5nKSA9PiB7XG5cdGlkID0gaWQucmVwbGFjZShcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlwiLCBcIlwiKTtcblx0aWQgPSBpZC5yZXBsYWNlKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5cIiwgXCJcIik7XG5cdHJldHVybiBpZDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSBJRCBmcm9tIGFuIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIGFubm90YXRpb24gVGhlIGFubm90YXRpb25cbiAqIEBwYXJhbSBpZFByZXBhcmF0aW9uIERldGVybWluZXMgd2hldGhlciB0aGUgSUQgbmVlZHMgdG8gYmUgcHJlcGFyZWQgZm9yIGZpbmFsIHVzYWdlXG4gKiBAcmV0dXJucyBUaGUgSURcbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUlkRm9yQW5ub3RhdGlvbiA9IChhbm5vdGF0aW9uOiBBdXRob3JpemVkSWRBbm5vdGF0aW9uc1R5cGUsIGlkUHJlcGFyYXRpb24gPSB0cnVlKSA9PiB7XG5cdGxldCBpZDtcblx0c3dpdGNoIChhbm5vdGF0aW9uLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldDpcblx0XHRcdGlkID0gYW5ub3RhdGlvbi5JRCA/PyBhbm5vdGF0aW9uLlRhcmdldC52YWx1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0OlxuXHRcdFx0aWQgPSBhbm5vdGF0aW9uLklEID8/IFwidW5kZWZpbmVkXCI7IC8vIENvbGxlY3Rpb25GYWNldCB3aXRob3V0IElkIGlzIG5vdCBzdXBwb3J0ZWQgYnV0IGRvZXNuJ3QgbmVjZXNzYXJ5IGZhaWwgcmlnaHQgbm93XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkZpZWxkR3JvdXBUeXBlOlxuXHRcdFx0aWQgPSBhbm5vdGF0aW9uLkxhYmVsO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGlkID0gZ2V0U3RhYmxlSWRQYXJ0RnJvbURhdGFGaWVsZChhbm5vdGF0aW9uIGFzIERhdGFGaWVsZEFic3RyYWN0VHlwZXMpO1xuXHRcdFx0YnJlYWs7XG5cdH1cblx0aWQgPSBpZD8udG9TdHJpbmcoKTtcblx0cmV0dXJuIGlkICYmIGlkUHJlcGFyYXRpb24gPyBwcmVwYXJlSWQoaWQpIDogaWQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHN0YWJsZSBJRCBiYXNlZCBvbiB0aGUgZ2l2ZW4gcGFyYW1ldGVycy5cbiAqXG4gKiBQYXJhbWV0ZXJzIGFyZSBjb21iaW5lZCBpbiB0aGUgc2FtZSBvcmRlciBpbiB3aGljaCB0aGV5IGFyZSBwcm92aWRlZCBhbmQgYXJlIHNlcGFyYXRlZCBieSAnOjonLlxuICogR2VuZXJhdGUoWydTdGFibGUnLCAnSWQnXSkgd291bGQgcmVzdWx0IGluICdTdGFibGU6OklkJyBhcyB0aGUgc3RhYmxlIElELlxuICogQ3VycmVudGx5IHN1cHBvcnRlZCBhbm5vdGF0aW9ucyBhcmUgRmFjZXRzLCBGaWVsZEdyb3VwIGFuZCBhbGwga2luZHMgb2YgRGF0YUZpZWxkLlxuICpcbiAqIEBwYXJhbSBzdGFibGVJZFBhcnRzIEFycmF5IG9mIHN0cmluZ3MsIHVuZGVmaW5lZCwgZGF0YU1vZGVsT2JqZWN0UGF0aCBvciBhbm5vdGF0aW9uc1xuICogQHJldHVybnMgU3RhYmxlIElEIGNvbnN0cnVjdGVkIGZyb20gdGhlIHByb3ZpZGVkIHBhcmFtZXRlcnNcbiAqL1xuZXhwb3J0IGNvbnN0IGdlbmVyYXRlID0gKHN0YWJsZUlkUGFydHM6IEFycmF5PHN0cmluZyB8IHVuZGVmaW5lZCB8IERhdGFNb2RlbE9iamVjdFBhdGggfCBBdXRob3JpemVkSWRBbm5vdGF0aW9uc1R5cGU+KSA9PiB7XG5cdGNvbnN0IGlkczogKHN0cmluZyB8IHVuZGVmaW5lZClbXSA9IHN0YWJsZUlkUGFydHMubWFwKChlbGVtZW50KSA9PiB7XG5cdFx0aWYgKHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiIHx8ICFlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gZWxlbWVudDtcblx0XHR9XG5cdFx0cmV0dXJuIGNyZWF0ZUlkRm9yQW5ub3RhdGlvbigoZWxlbWVudCBhcyBEYXRhTW9kZWxPYmplY3RQYXRoKS50YXJnZXRPYmplY3QgfHwgZWxlbWVudCwgZmFsc2UpO1xuXHR9KTtcblx0Y29uc3QgcmVzdWx0ID0gaWRzLmZpbHRlcigoaWQpID0+IGlkKS5qb2luKFwiOjpcIik7XG5cdHJldHVybiBwcmVwYXJlSWQocmVzdWx0KTtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSBJRCBmcm9tIGEgRGF0YUZpZWxkLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIERhdGFGaWVsZFxuICogQHBhcmFtIGlnbm9yZUZvckNvbXBhdGliaWxpdHkgSWdub3JlIGEgcGFydCBvZiB0aGUgSUQgb24gdGhlIERhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aCB0byBiZSBhbGlnbmVkIHdpdGggcHJldmlvdXMgdmVyc2lvbnNcbiAqIEByZXR1cm5zIFRoZSBJRFxuICovXG5leHBvcnQgY29uc3QgZ2V0U3RhYmxlSWRQYXJ0RnJvbURhdGFGaWVsZCA9IChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsIGlnbm9yZUZvckNvbXBhdGliaWxpdHkgPSBmYWxzZSk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG5cdGxldCBpZCA9IFwiXCI7XG5cdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRGb3JBY3Rpb246OiR7ZGF0YUZpZWxkLkFjdGlvbn1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246OiR7X2dldFN0YWJsZUlkUGFydEZyb21JQk4oZGF0YUZpZWxkKX1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0aWQgPSBgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjo6JHtkYXRhRmllbGQuVGFyZ2V0LnZhbHVlfWA7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb246XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRXaXRoQWN0aW9uOjoke19nZXRTdGFibGVJZFBhcnRGcm9tVmFsdWUoZGF0YUZpZWxkKX06OiR7ZGF0YUZpZWxkLkFjdGlvbn1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0XHRpZCA9IGBEYXRhRmllbGQ6OiR7X2dldFN0YWJsZUlkUGFydEZyb21WYWx1ZShkYXRhRmllbGQpfWA7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOjoke19nZXRTdGFibGVJZFBhcnRGcm9tVmFsdWUoZGF0YUZpZWxkKX06OiR7X2dldFN0YWJsZUlkUGFydEZyb21JQk4oZGF0YUZpZWxkKX1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6OiR7X2dldFN0YWJsZUlkUGFydEZyb21WYWx1ZShkYXRhRmllbGQpfWA7XG5cdFx0XHRpZiAoZGF0YUZpZWxkLlRhcmdldC50eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIiAmJiAhaWdub3JlRm9yQ29tcGF0aWJpbGl0eSkge1xuXHRcdFx0XHRpZCA9IGAke2lkfTo6JHtkYXRhRmllbGQuVGFyZ2V0LnZhbHVlfWA7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRXaXRoVXJsOjoke19nZXRTdGFibGVJZFBhcnRGcm9tVXJsT3JQYXRoKGRhdGFGaWVsZCl9YDtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRicmVhaztcblx0fVxuXHRyZXR1cm4gaWQgPyBwcmVwYXJlSWQoaWQpIDogdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIG9yIHJlcGxhY2VzIHdpdGggXCI6OlwiIHNvbWUgc3BlY2lhbCBjaGFyYWN0ZXJzLlxuICogU3BlY2lhbCBjaGFyYWN0ZXJzIChALCAvLCAjKSBhcmUgcmVwbGFjZWQgYnkgJzo6JyBpZiB0aGV5IGFyZSBpbiB0aGUgbWlkZGxlIG9mIHRoZSBzdGFibGUgSUQgYW5kIHJlbW92ZWQgYWx0b2dldGhlciBpZiB0aGV5IGFyZSBhdCB0aGUgYmVnaW5uaW5nIG9yIGVuZC5cbiAqXG4gKiBAcGFyYW0gaWQgU3RyaW5nIHRvIG1hbmlwdWxhdGVcbiAqIEByZXR1cm5zIFN0cmluZyB3aXRob3V0IHRoZSBzcGVjaWFsIGNoYXJhY3RlcnNcbiAqL1xuZXhwb3J0IGNvbnN0IHJlcGxhY2VTcGVjaWFsQ2hhcnMgPSAoaWQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XG5cdGlmIChpZC5pbmRleE9mKFwiIFwiKSA+PSAwKSB7XG5cdFx0dGhyb3cgRXJyb3IoYCR7aWR9IC0gU3BhY2VzIGFyZSBub3QgYWxsb3dlZCBpbiBJRCBwYXJ0cy5gKTtcblx0fVxuXHRpZCA9IGlkXG5cdFx0LnJlcGxhY2UoL15cXC98XkB8XiN8XlxcKi8sIFwiXCIpIC8vIHJlbW92ZSBzcGVjaWFsIGNoYXJhY3RlcnMgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzdHJpbmdcblx0XHQucmVwbGFjZSgvXFwvJHxAJHwjJHxcXCokLywgXCJcIikgLy8gcmVtb3ZlIHNwZWNpYWwgY2hhcmFjdGVycyBmcm9tIHRoZSBlbmQgb2YgdGhlIHN0cmluZ1xuXHRcdC5yZXBsYWNlKC9cXC98QHxcXCh8XFwpfCN8XFwqL2csIFwiOjpcIik7IC8vIHJlcGxhY2Ugc3BlY2lhbCBjaGFyYWN0ZXJzIHdpdGggOjpcblxuXHQvLyBSZXBsYWNlIGRvdWJsZSBvY2N1cnJlbmNlcyBvZiB0aGUgc2VwYXJhdG9yIHdpdGggYSBzaW5nbGUgc2VwYXJhdG9yXG5cdHdoaWxlIChpZC5pbmRleE9mKFwiOjo6OlwiKSA+IC0xKSB7XG5cdFx0aWQgPSBpZC5yZXBsYWNlKFwiOjo6OlwiLCBcIjo6XCIpO1xuXHR9XG5cblx0Ly8gSWYgdGhlcmUgaXMgYSA6OiBhdCB0aGUgZW5kIG9mIHRoZSBJRCByZW1vdmUgaXRcblx0aWYgKGlkLnNsaWNlKC0yKSA9PSBcIjo6XCIpIHtcblx0XHRpZCA9IGlkLnNsaWNlKDAsIC0yKTtcblx0fVxuXG5cdHJldHVybiBpZDtcbn07XG5cbi8qKlxuICogUHJlcGFyZXMgdGhlIElELlxuICpcbiAqIFJlbW92ZXMgbmFtZXNwYWNlcyBhbmQgc3BlY2lhbCBjaGFyYWN0ZXJzIGFuZCBjaGVja3MgdGhlIHZhbGlkaXR5IG9mIHRoaXMgSUQuXG4gKlxuICogQHBhcmFtIGlkIFRoZSBJRFxuICogQHJldHVybnMgVGhlIElEIG9yIHRocm93cyBhbiBlcnJvclxuICovXG5leHBvcnQgY29uc3QgcHJlcGFyZUlkID0gZnVuY3Rpb24gKGlkOiBzdHJpbmcpIHtcblx0aWQgPSByZXBsYWNlU3BlY2lhbENoYXJzKF9yZW1vdmVOYW1lc3BhY2VzKGlkKSk7XG5cdGlmIChfaXNWYWxpZChpZCkpIHtcblx0XHRyZXR1cm4gaWQ7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgRXJyb3IoYCR7aWR9IC0gU3RhYmxlIElkIGNvdWxkIG5vdCBiZSBnZW5lcmF0ZWQgZHVlIHRvIGluc3VmZmljaWVudCBpbmZvcm1hdGlvbi5gKTtcblx0fVxufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1BLHVCQUF1QixHQUFJQyxTQUFpRixJQUFLO0lBQUE7SUFDdEgsTUFBTUMsT0FBTyxHQUFHLENBQUNELFNBQVMsQ0FBQ0UsY0FBYyxDQUFDQyxPQUFPLEVBQUUsdUJBQUVILFNBQVMsQ0FBQ0ksTUFBTSxzREFBaEIsa0JBQWtCRCxPQUFPLEVBQUUsQ0FBQztJQUNqRixJQUFLSCxTQUFTLENBQXVDSyxlQUFlLEVBQUU7TUFDckVKLE9BQU8sQ0FBQ0ssSUFBSSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDO0lBQ0EsT0FBT0wsT0FBTyxDQUFDTSxNQUFNLENBQUVDLEVBQUUsSUFBS0EsRUFBRSxDQUFDLENBQUNDLElBQUksQ0FBQyxJQUFJLENBQUM7RUFDN0MsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNQyx5QkFBeUIsR0FDOUJWLFNBQWdJLElBQ3BIO0lBQ1osTUFBTVcsS0FBSyxHQUFHWCxTQUFTLENBQUNZLEtBQUs7SUFDN0IsSUFBSUQsS0FBSyxDQUFDRSxJQUFJLEVBQUU7TUFDZixPQUFPRixLQUFLLENBQUNFLElBQUk7SUFDbEIsQ0FBQyxNQUFNLElBQUlGLEtBQUssQ0FBQ0csS0FBSyxJQUFJSCxLQUFLLENBQUNJLFFBQVEsS0FBSyxjQUFjLEVBQUU7TUFDNUQsT0FBT0osS0FBSyxDQUFDRyxLQUFLLENBQUNFLEdBQUcsQ0FBRUMsR0FBUSxJQUFLQSxHQUFHLENBQUNDLEtBQTJCLENBQUMsQ0FBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNqRjtJQUNBLE9BQU9VLG1CQUFtQixDQUFDUixLQUFLLENBQUNTLE9BQU8sQ0FB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