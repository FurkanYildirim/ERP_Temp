/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/common/AnnotationConverter", "sap/fe/core/helpers/TypeGuards", "../helpers/StableIdHelper"], function (AnnotationConverter, TypeGuards, StableIdHelper) {
  "use strict";

  var _exports = {};
  var prepareId = StableIdHelper.prepareId;
  var isSingleton = TypeGuards.isSingleton;
  var isServiceObject = TypeGuards.isServiceObject;
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var isEntityType = TypeGuards.isEntityType;
  var isEntitySet = TypeGuards.isEntitySet;
  var isEntityContainer = TypeGuards.isEntityContainer;
  const VOCABULARY_ALIAS = {
    "Org.OData.Capabilities.V1": "Capabilities",
    "Org.OData.Core.V1": "Core",
    "Org.OData.Measures.V1": "Measures",
    "com.sap.vocabularies.Common.v1": "Common",
    "com.sap.vocabularies.UI.v1": "UI",
    "com.sap.vocabularies.Session.v1": "Session",
    "com.sap.vocabularies.Analytics.v1": "Analytics",
    "com.sap.vocabularies.PersonalData.v1": "PersonalData",
    "com.sap.vocabularies.Communication.v1": "Communication"
  };
  const DefaultEnvironmentCapabilities = {
    Chart: true,
    MicroChart: true,
    UShell: true,
    IntentBasedNavigation: true,
    AppState: true,
    InsightsSupported: false
  };
  _exports.DefaultEnvironmentCapabilities = DefaultEnvironmentCapabilities;
  function parsePropertyValue(annotationObject, propertyKey, currentTarget, annotationsLists, oCapabilities) {
    let value;
    const currentPropertyTarget = `${currentTarget}/${propertyKey}`;
    const typeOfAnnotation = typeof annotationObject;
    if (annotationObject === null) {
      value = {
        type: "Null",
        Null: null
      };
    } else if (typeOfAnnotation === "string") {
      value = {
        type: "String",
        String: annotationObject
      };
    } else if (typeOfAnnotation === "boolean") {
      value = {
        type: "Bool",
        Bool: annotationObject
      };
    } else if (typeOfAnnotation === "number") {
      value = {
        type: "Int",
        Int: annotationObject
      };
    } else if (Array.isArray(annotationObject)) {
      value = {
        type: "Collection",
        Collection: annotationObject.map((subAnnotationObject, subAnnotationObjectIndex) => parseAnnotationObject(subAnnotationObject, `${currentPropertyTarget}/${subAnnotationObjectIndex}`, annotationsLists, oCapabilities))
      };
      if (annotationObject.length > 0) {
        if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
          value.Collection.type = "PropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$Path")) {
          value.Collection.type = "Path";
        } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
          value.Collection.type = "NavigationPropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
          value.Collection.type = "AnnotationPath";
        } else if (annotationObject[0].hasOwnProperty("$Type")) {
          value.Collection.type = "Record";
        } else if (annotationObject[0].hasOwnProperty("$If")) {
          value.Collection.type = "If";
        } else if (annotationObject[0].hasOwnProperty("$Or")) {
          value.Collection.type = "Or";
        } else if (annotationObject[0].hasOwnProperty("$And")) {
          value.Collection.type = "And";
        } else if (annotationObject[0].hasOwnProperty("$Eq")) {
          value.Collection.type = "Eq";
        } else if (annotationObject[0].hasOwnProperty("$Ne")) {
          value.Collection.type = "Ne";
        } else if (annotationObject[0].hasOwnProperty("$Not")) {
          value.Collection.type = "Not";
        } else if (annotationObject[0].hasOwnProperty("$Gt")) {
          value.Collection.type = "Gt";
        } else if (annotationObject[0].hasOwnProperty("$Ge")) {
          value.Collection.type = "Ge";
        } else if (annotationObject[0].hasOwnProperty("$Lt")) {
          value.Collection.type = "Lt";
        } else if (annotationObject[0].hasOwnProperty("$Le")) {
          value.Collection.type = "Le";
        } else if (annotationObject[0].hasOwnProperty("$Apply")) {
          value.Collection.type = "Apply";
        } else if (typeof annotationObject[0] === "object") {
          // $Type is optional...
          value.Collection.type = "Record";
        } else {
          value.Collection.type = "String";
        }
      }
    } else if (annotationObject.$Path !== undefined) {
      value = {
        type: "Path",
        Path: annotationObject.$Path
      };
    } else if (annotationObject.$Decimal !== undefined) {
      value = {
        type: "Decimal",
        Decimal: parseFloat(annotationObject.$Decimal)
      };
    } else if (annotationObject.$PropertyPath !== undefined) {
      value = {
        type: "PropertyPath",
        PropertyPath: annotationObject.$PropertyPath
      };
    } else if (annotationObject.$NavigationPropertyPath !== undefined) {
      value = {
        type: "NavigationPropertyPath",
        NavigationPropertyPath: annotationObject.$NavigationPropertyPath
      };
    } else if (annotationObject.$If !== undefined) {
      value = {
        type: "If",
        If: annotationObject.$If
      };
    } else if (annotationObject.$And !== undefined) {
      value = {
        type: "And",
        And: annotationObject.$And
      };
    } else if (annotationObject.$Or !== undefined) {
      value = {
        type: "Or",
        Or: annotationObject.$Or
      };
    } else if (annotationObject.$Not !== undefined) {
      value = {
        type: "Not",
        Not: annotationObject.$Not
      };
    } else if (annotationObject.$Eq !== undefined) {
      value = {
        type: "Eq",
        Eq: annotationObject.$Eq
      };
    } else if (annotationObject.$Ne !== undefined) {
      value = {
        type: "Ne",
        Ne: annotationObject.$Ne
      };
    } else if (annotationObject.$Gt !== undefined) {
      value = {
        type: "Gt",
        Gt: annotationObject.$Gt
      };
    } else if (annotationObject.$Ge !== undefined) {
      value = {
        type: "Ge",
        Ge: annotationObject.$Ge
      };
    } else if (annotationObject.$Lt !== undefined) {
      value = {
        type: "Lt",
        Lt: annotationObject.$Lt
      };
    } else if (annotationObject.$Le !== undefined) {
      value = {
        type: "Le",
        Le: annotationObject.$Le
      };
    } else if (annotationObject.$Apply !== undefined) {
      value = {
        type: "Apply",
        Apply: annotationObject.$Apply,
        Function: annotationObject.$Function
      };
    } else if (annotationObject.$AnnotationPath !== undefined) {
      value = {
        type: "AnnotationPath",
        AnnotationPath: annotationObject.$AnnotationPath
      };
    } else if (annotationObject.$EnumMember !== undefined) {
      value = {
        type: "EnumMember",
        EnumMember: `${mapNameToAlias(annotationObject.$EnumMember.split("/")[0])}/${annotationObject.$EnumMember.split("/")[1]}`
      };
    } else {
      value = {
        type: "Record",
        Record: parseAnnotationObject(annotationObject, currentTarget, annotationsLists, oCapabilities)
      };
    }
    return {
      name: propertyKey,
      value
    };
  }
  function mapNameToAlias(annotationName) {
    let [pathPart, annoPart] = annotationName.split("@");
    if (!annoPart) {
      annoPart = pathPart;
      pathPart = "";
    } else {
      pathPart += "@";
    }
    const lastDot = annoPart.lastIndexOf(".");
    return `${pathPart + VOCABULARY_ALIAS[annoPart.substr(0, lastDot)]}.${annoPart.substr(lastDot + 1)}`;
  }
  function parseAnnotationObject(annotationObject, currentObjectTarget, annotationsLists, oCapabilities) {
    let parsedAnnotationObject = {};
    const typeOfObject = typeof annotationObject;
    if (annotationObject === null) {
      parsedAnnotationObject = {
        type: "Null",
        Null: null
      };
    } else if (typeOfObject === "string") {
      parsedAnnotationObject = {
        type: "String",
        String: annotationObject
      };
    } else if (typeOfObject === "boolean") {
      parsedAnnotationObject = {
        type: "Bool",
        Bool: annotationObject
      };
    } else if (typeOfObject === "number") {
      parsedAnnotationObject = {
        type: "Int",
        Int: annotationObject
      };
    } else if (annotationObject.$AnnotationPath !== undefined) {
      parsedAnnotationObject = {
        type: "AnnotationPath",
        AnnotationPath: annotationObject.$AnnotationPath
      };
    } else if (annotationObject.$Path !== undefined) {
      parsedAnnotationObject = {
        type: "Path",
        Path: annotationObject.$Path
      };
    } else if (annotationObject.$Decimal !== undefined) {
      parsedAnnotationObject = {
        type: "Decimal",
        Decimal: parseFloat(annotationObject.$Decimal)
      };
    } else if (annotationObject.$PropertyPath !== undefined) {
      parsedAnnotationObject = {
        type: "PropertyPath",
        PropertyPath: annotationObject.$PropertyPath
      };
    } else if (annotationObject.$If !== undefined) {
      parsedAnnotationObject = {
        type: "If",
        If: annotationObject.$If
      };
    } else if (annotationObject.$And !== undefined) {
      parsedAnnotationObject = {
        type: "And",
        And: annotationObject.$And
      };
    } else if (annotationObject.$Or !== undefined) {
      parsedAnnotationObject = {
        type: "Or",
        Or: annotationObject.$Or
      };
    } else if (annotationObject.$Not !== undefined) {
      parsedAnnotationObject = {
        type: "Not",
        Not: annotationObject.$Not
      };
    } else if (annotationObject.$Eq !== undefined) {
      parsedAnnotationObject = {
        type: "Eq",
        Eq: annotationObject.$Eq
      };
    } else if (annotationObject.$Ne !== undefined) {
      parsedAnnotationObject = {
        type: "Ne",
        Ne: annotationObject.$Ne
      };
    } else if (annotationObject.$Gt !== undefined) {
      parsedAnnotationObject = {
        type: "Gt",
        Gt: annotationObject.$Gt
      };
    } else if (annotationObject.$Ge !== undefined) {
      parsedAnnotationObject = {
        type: "Ge",
        Ge: annotationObject.$Ge
      };
    } else if (annotationObject.$Lt !== undefined) {
      parsedAnnotationObject = {
        type: "Lt",
        Lt: annotationObject.$Lt
      };
    } else if (annotationObject.$Le !== undefined) {
      parsedAnnotationObject = {
        type: "Le",
        Le: annotationObject.$Le
      };
    } else if (annotationObject.$Apply !== undefined) {
      parsedAnnotationObject = {
        type: "Apply",
        Apply: annotationObject.$Apply,
        Function: annotationObject.$Function
      };
    } else if (annotationObject.$NavigationPropertyPath !== undefined) {
      parsedAnnotationObject = {
        type: "NavigationPropertyPath",
        NavigationPropertyPath: annotationObject.$NavigationPropertyPath
      };
    } else if (annotationObject.$EnumMember !== undefined) {
      parsedAnnotationObject = {
        type: "EnumMember",
        EnumMember: `${mapNameToAlias(annotationObject.$EnumMember.split("/")[0])}/${annotationObject.$EnumMember.split("/")[1]}`
      };
    } else if (Array.isArray(annotationObject)) {
      const parsedAnnotationCollection = parsedAnnotationObject;
      parsedAnnotationCollection.collection = annotationObject.map((subAnnotationObject, subAnnotationIndex) => parseAnnotationObject(subAnnotationObject, `${currentObjectTarget}/${subAnnotationIndex}`, annotationsLists, oCapabilities));
      if (annotationObject.length > 0) {
        if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
          parsedAnnotationCollection.collection.type = "PropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$Path")) {
          parsedAnnotationCollection.collection.type = "Path";
        } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
          parsedAnnotationCollection.collection.type = "NavigationPropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
          parsedAnnotationCollection.collection.type = "AnnotationPath";
        } else if (annotationObject[0].hasOwnProperty("$Type")) {
          parsedAnnotationCollection.collection.type = "Record";
        } else if (annotationObject[0].hasOwnProperty("$If")) {
          parsedAnnotationCollection.collection.type = "If";
        } else if (annotationObject[0].hasOwnProperty("$And")) {
          parsedAnnotationCollection.collection.type = "And";
        } else if (annotationObject[0].hasOwnProperty("$Or")) {
          parsedAnnotationCollection.collection.type = "Or";
        } else if (annotationObject[0].hasOwnProperty("$Eq")) {
          parsedAnnotationCollection.collection.type = "Eq";
        } else if (annotationObject[0].hasOwnProperty("$Ne")) {
          parsedAnnotationCollection.collection.type = "Ne";
        } else if (annotationObject[0].hasOwnProperty("$Not")) {
          parsedAnnotationCollection.collection.type = "Not";
        } else if (annotationObject[0].hasOwnProperty("$Gt")) {
          parsedAnnotationCollection.collection.type = "Gt";
        } else if (annotationObject[0].hasOwnProperty("$Ge")) {
          parsedAnnotationCollection.collection.type = "Ge";
        } else if (annotationObject[0].hasOwnProperty("$Lt")) {
          parsedAnnotationCollection.collection.type = "Lt";
        } else if (annotationObject[0].hasOwnProperty("$Le")) {
          parsedAnnotationCollection.collection.type = "Le";
        } else if (annotationObject[0].hasOwnProperty("$Apply")) {
          parsedAnnotationCollection.collection.type = "Apply";
        } else if (typeof annotationObject[0] === "object") {
          parsedAnnotationCollection.collection.type = "Record";
        } else {
          parsedAnnotationCollection.collection.type = "String";
        }
      }
    } else {
      if (annotationObject.$Type) {
        const typeValue = annotationObject.$Type;
        parsedAnnotationObject.type = typeValue; //`${typeAlias}.${typeTerm}`;
      }

      const propertyValues = [];
      Object.keys(annotationObject).forEach(propertyKey => {
        if (propertyKey !== "$Type" && propertyKey !== "$If" && propertyKey !== "$Apply" && propertyKey !== "$And" && propertyKey !== "$Or" && propertyKey !== "$Ne" && propertyKey !== "$Gt" && propertyKey !== "$Ge" && propertyKey !== "$Lt" && propertyKey !== "$Le" && propertyKey !== "$Not" && propertyKey !== "$Eq" && !propertyKey.startsWith("@")) {
          propertyValues.push(parsePropertyValue(annotationObject[propertyKey], propertyKey, currentObjectTarget, annotationsLists, oCapabilities));
        } else if (propertyKey.startsWith("@")) {
          // Annotation of annotation
          createAnnotationLists({
            [propertyKey]: annotationObject[propertyKey]
          }, currentObjectTarget, annotationsLists, oCapabilities);
        }
      });
      parsedAnnotationObject.propertyValues = propertyValues;
    }
    return parsedAnnotationObject;
  }
  function getOrCreateAnnotationList(target, annotationsLists) {
    if (!annotationsLists.hasOwnProperty(target)) {
      annotationsLists[target] = {
        target: target,
        annotations: []
      };
    }
    return annotationsLists[target];
  }
  function createReferenceFacetId(referenceFacet) {
    const id = referenceFacet.ID ?? referenceFacet.Target.$AnnotationPath;
    return id ? prepareId(id) : id;
  }
  function removeChartAnnotations(annotationObject) {
    return annotationObject.filter(oRecord => {
      if (oRecord.Target && oRecord.Target.$AnnotationPath) {
        return oRecord.Target.$AnnotationPath.indexOf(`@${"com.sap.vocabularies.UI.v1.Chart"}`) === -1;
      } else {
        return true;
      }
    });
  }
  function removeIBNAnnotations(annotationObject) {
    return annotationObject.filter(oRecord => {
      return oRecord.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";
    });
  }
  function handlePresentationVariant(annotationObject) {
    return annotationObject.filter(oRecord => {
      return oRecord.$AnnotationPath !== `@${"com.sap.vocabularies.UI.v1.Chart"}`;
    });
  }
  function createAnnotationLists(annotationObjects, annotationTarget, annotationLists, oCapabilities) {
    var _annotationObjects$Fi;
    if (Object.keys(annotationObjects).length === 0) {
      return;
    }
    const outAnnotationObject = getOrCreateAnnotationList(annotationTarget, annotationLists);
    if (!oCapabilities.MicroChart) {
      delete annotationObjects[`@${"com.sap.vocabularies.UI.v1.Chart"}`];
    }
    for (const annotationObjectKey in annotationObjects) {
      let annotationKey = annotationObjectKey;
      let annotationObject = annotationObjects[annotationKey];
      switch (annotationKey) {
        case `@${"com.sap.vocabularies.UI.v1.HeaderFacets"}`:
          if (!oCapabilities.MicroChart) {
            annotationObject = removeChartAnnotations(annotationObject);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@${"com.sap.vocabularies.UI.v1.Identification"}`:
          if (!oCapabilities.IntentBasedNavigation) {
            annotationObject = removeIBNAnnotations(annotationObject);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@${"com.sap.vocabularies.UI.v1.LineItem"}`:
          if (!oCapabilities.IntentBasedNavigation) {
            annotationObject = removeIBNAnnotations(annotationObject);
            annotationObjects[annotationKey] = annotationObject;
          }
          if (!oCapabilities.MicroChart) {
            annotationObject = removeChartAnnotations(annotationObject);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@${"com.sap.vocabularies.UI.v1.FieldGroup"}`:
          if (!oCapabilities.IntentBasedNavigation) {
            annotationObject.Data = removeIBNAnnotations(annotationObject.Data);
            annotationObjects[annotationKey] = annotationObject;
          }
          if (!oCapabilities.MicroChart) {
            annotationObject.Data = removeChartAnnotations(annotationObject.Data);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@${"com.sap.vocabularies.UI.v1.PresentationVariant"}`:
          if (!oCapabilities.Chart && annotationObject.Visualizations) {
            annotationObject.Visualizations = handlePresentationVariant(annotationObject.Visualizations);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@com.sap.vocabularies.Common.v1.DraftRoot`:
          // This scenario is needed for enabling semantic filtering on DraftAdministrativeData-filters. As of now the SingleRange annotation is read by the
          // FieldHelper, which should not include any propertyspecific logic. We will remove this once the FieldHelper receives the SingleRange data from
          // the converter or having it set is no longer a prerequisite for the semantic filtering.
          if (annotationObjects[`@Org.OData.Capabilities.V1.FilterRestrictions`] && (_annotationObjects$Fi = annotationObjects[`@Org.OData.Capabilities.V1.FilterRestrictions`].FilterExpressionRestrictions) !== null && _annotationObjects$Fi !== void 0 && _annotationObjects$Fi.length) {
            if (!annotationObjects[`@Org.OData.Capabilities.V1.FilterRestrictions`].FilterExpressionRestrictions.some(FilterExpressionRestriction => {
              var _FilterExpressionRest;
              return FilterExpressionRestriction === null || FilterExpressionRestriction === void 0 ? void 0 : (_FilterExpressionRest = FilterExpressionRestriction.Property) === null || _FilterExpressionRest === void 0 ? void 0 : _FilterExpressionRest.$PropertyPath.includes("DraftAdministrativeData");
            })) {
              annotationObjects[`@Org.OData.Capabilities.V1.FilterRestrictions`].FilterExpressionRestrictions.push({
                $Type: "Org.OData.Capabilities.V1.FilterExpressionRestrictionType",
                AllowedExpressions: "SingleRange",
                Property: {
                  $PropertyPath: "DraftAdministrativeData/CreationDateTime"
                }
              }, {
                $Type: "Org.OData.Capabilities.V1.FilterExpressionRestrictionType",
                AllowedExpressions: "SingleRange",
                Property: {
                  $PropertyPath: "DraftAdministrativeData/LastChangeDateTime"
                }
              });
            }
          }
          break;
        default:
          break;
      }
      let currentOutAnnotationObject = outAnnotationObject;

      // Check for annotation of annotation
      const annotationOfAnnotationSplit = annotationKey.split("@");
      if (annotationOfAnnotationSplit.length > 2) {
        currentOutAnnotationObject = getOrCreateAnnotationList(`${annotationTarget}@${annotationOfAnnotationSplit[1]}`, annotationLists);
        annotationKey = annotationOfAnnotationSplit[2];
      } else {
        annotationKey = annotationOfAnnotationSplit[1];
      }
      const annotationQualifierSplit = annotationKey.split("#");
      const qualifier = annotationQualifierSplit[1];
      annotationKey = annotationQualifierSplit[0];
      const parsedAnnotationObject = {
        term: annotationKey,
        qualifier: qualifier
      };
      let currentAnnotationTarget = `${annotationTarget}@${parsedAnnotationObject.term}`;
      if (qualifier) {
        currentAnnotationTarget += `#${qualifier}`;
      }
      let isCollection = false;
      const typeofAnnotation = typeof annotationObject;
      if (annotationObject === null) {
        parsedAnnotationObject.value = {
          type: "Null"
        };
      } else if (typeofAnnotation === "string") {
        parsedAnnotationObject.value = {
          type: "String",
          String: annotationObject
        };
      } else if (typeofAnnotation === "boolean") {
        parsedAnnotationObject.value = {
          type: "Bool",
          Bool: annotationObject
        };
      } else if (typeofAnnotation === "number") {
        parsedAnnotationObject.value = {
          type: "Int",
          Int: annotationObject
        };
      } else if (annotationObject.$If !== undefined) {
        parsedAnnotationObject.value = {
          type: "If",
          If: annotationObject.$If
        };
      } else if (annotationObject.$And !== undefined) {
        parsedAnnotationObject.value = {
          type: "And",
          And: annotationObject.$And
        };
      } else if (annotationObject.$Or !== undefined) {
        parsedAnnotationObject.value = {
          type: "Or",
          Or: annotationObject.$Or
        };
      } else if (annotationObject.$Not !== undefined) {
        parsedAnnotationObject.value = {
          type: "Not",
          Not: annotationObject.$Not
        };
      } else if (annotationObject.$Eq !== undefined) {
        parsedAnnotationObject.value = {
          type: "Eq",
          Eq: annotationObject.$Eq
        };
      } else if (annotationObject.$Ne !== undefined) {
        parsedAnnotationObject.value = {
          type: "Ne",
          Ne: annotationObject.$Ne
        };
      } else if (annotationObject.$Gt !== undefined) {
        parsedAnnotationObject.value = {
          type: "Gt",
          Gt: annotationObject.$Gt
        };
      } else if (annotationObject.$Ge !== undefined) {
        parsedAnnotationObject.value = {
          type: "Ge",
          Ge: annotationObject.$Ge
        };
      } else if (annotationObject.$Lt !== undefined) {
        parsedAnnotationObject.value = {
          type: "Lt",
          Lt: annotationObject.$Lt
        };
      } else if (annotationObject.$Le !== undefined) {
        parsedAnnotationObject.value = {
          type: "Le",
          Le: annotationObject.$Le
        };
      } else if (annotationObject.$Apply !== undefined) {
        parsedAnnotationObject.value = {
          type: "Apply",
          Apply: annotationObject.$Apply,
          Function: annotationObject.$Function
        };
      } else if (annotationObject.$Path !== undefined) {
        parsedAnnotationObject.value = {
          type: "Path",
          Path: annotationObject.$Path
        };
      } else if (annotationObject.$AnnotationPath !== undefined) {
        parsedAnnotationObject.value = {
          type: "AnnotationPath",
          AnnotationPath: annotationObject.$AnnotationPath
        };
      } else if (annotationObject.$Decimal !== undefined) {
        parsedAnnotationObject.value = {
          type: "Decimal",
          Decimal: parseFloat(annotationObject.$Decimal)
        };
      } else if (annotationObject.$EnumMember !== undefined) {
        parsedAnnotationObject.value = {
          type: "EnumMember",
          EnumMember: `${mapNameToAlias(annotationObject.$EnumMember.split("/")[0])}/${annotationObject.$EnumMember.split("/")[1]}`
        };
      } else if (Array.isArray(annotationObject)) {
        isCollection = true;
        parsedAnnotationObject.collection = annotationObject.map((subAnnotationObject, subAnnotationIndex) => parseAnnotationObject(subAnnotationObject, `${currentAnnotationTarget}/${subAnnotationIndex}`, annotationLists, oCapabilities));
        if (annotationObject.length > 0) {
          if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
            parsedAnnotationObject.collection.type = "PropertyPath";
          } else if (annotationObject[0].hasOwnProperty("$Path")) {
            parsedAnnotationObject.collection.type = "Path";
          } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
            parsedAnnotationObject.collection.type = "NavigationPropertyPath";
          } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
            parsedAnnotationObject.collection.type = "AnnotationPath";
          } else if (annotationObject[0].hasOwnProperty("$Type")) {
            parsedAnnotationObject.collection.type = "Record";
          } else if (annotationObject[0].hasOwnProperty("$If")) {
            parsedAnnotationObject.collection.type = "If";
          } else if (annotationObject[0].hasOwnProperty("$Or")) {
            parsedAnnotationObject.collection.type = "Or";
          } else if (annotationObject[0].hasOwnProperty("$Eq")) {
            parsedAnnotationObject.collection.type = "Eq";
          } else if (annotationObject[0].hasOwnProperty("$Ne")) {
            parsedAnnotationObject.collection.type = "Ne";
          } else if (annotationObject[0].hasOwnProperty("$Not")) {
            parsedAnnotationObject.collection.type = "Not";
          } else if (annotationObject[0].hasOwnProperty("$Gt")) {
            parsedAnnotationObject.collection.type = "Gt";
          } else if (annotationObject[0].hasOwnProperty("$Ge")) {
            parsedAnnotationObject.collection.type = "Ge";
          } else if (annotationObject[0].hasOwnProperty("$Lt")) {
            parsedAnnotationObject.collection.type = "Lt";
          } else if (annotationObject[0].hasOwnProperty("$Le")) {
            parsedAnnotationObject.collection.type = "Le";
          } else if (annotationObject[0].hasOwnProperty("$And")) {
            parsedAnnotationObject.collection.type = "And";
          } else if (annotationObject[0].hasOwnProperty("$Apply")) {
            parsedAnnotationObject.collection.type = "Apply";
          } else if (typeof annotationObject[0] === "object") {
            parsedAnnotationObject.collection.type = "Record";
          } else {
            parsedAnnotationObject.collection.type = "String";
          }
        }
      } else {
        const record = {
          propertyValues: []
        };
        if (annotationObject.$Type) {
          const typeValue = annotationObject.$Type;
          record.type = `${typeValue}`;
        }
        const propertyValues = [];
        for (const propertyKey in annotationObject) {
          if (propertyKey !== "$Type" && !propertyKey.startsWith("@")) {
            propertyValues.push(parsePropertyValue(annotationObject[propertyKey], propertyKey, currentAnnotationTarget, annotationLists, oCapabilities));
          } else if (propertyKey.startsWith("@")) {
            // Annotation of record
            createAnnotationLists({
              [propertyKey]: annotationObject[propertyKey]
            }, currentAnnotationTarget, annotationLists, oCapabilities);
          }
        }
        record.propertyValues = propertyValues;
        parsedAnnotationObject.record = record;
      }
      parsedAnnotationObject.isCollection = isCollection;
      currentOutAnnotationObject.annotations.push(parsedAnnotationObject);
    }
  }
  function prepareProperty(propertyDefinition, entityTypeObject, propertyName) {
    return {
      _type: "Property",
      name: propertyName,
      fullyQualifiedName: `${entityTypeObject.fullyQualifiedName}/${propertyName}`,
      type: propertyDefinition.$Type,
      maxLength: propertyDefinition.$MaxLength,
      precision: propertyDefinition.$Precision,
      scale: propertyDefinition.$Scale,
      nullable: propertyDefinition.$Nullable
    };
  }
  function prepareNavigationProperty(navPropertyDefinition, entityTypeObject, navPropertyName) {
    let referentialConstraint = [];
    if (navPropertyDefinition.$ReferentialConstraint) {
      referentialConstraint = Object.keys(navPropertyDefinition.$ReferentialConstraint).map(sourcePropertyName => {
        return {
          sourceTypeName: entityTypeObject.name,
          sourceProperty: sourcePropertyName,
          targetTypeName: navPropertyDefinition.$Type,
          targetProperty: navPropertyDefinition.$ReferentialConstraint[sourcePropertyName]
        };
      });
    }
    const navigationProperty = {
      _type: "NavigationProperty",
      name: navPropertyName,
      fullyQualifiedName: `${entityTypeObject.fullyQualifiedName}/${navPropertyName}`,
      partner: navPropertyDefinition.$Partner,
      isCollection: navPropertyDefinition.$isCollection ? navPropertyDefinition.$isCollection : false,
      containsTarget: navPropertyDefinition.$ContainsTarget,
      targetTypeName: navPropertyDefinition.$Type,
      referentialConstraint
    };
    return navigationProperty;
  }
  function prepareEntitySet(entitySetDefinition, entitySetName, entityContainerName) {
    const entitySetObject = {
      _type: "EntitySet",
      name: entitySetName,
      navigationPropertyBinding: {},
      entityTypeName: entitySetDefinition.$Type,
      fullyQualifiedName: `${entityContainerName}/${entitySetName}`
    };
    return entitySetObject;
  }
  function prepareSingleton(singletonDefinition, singletonName, entityContainerName) {
    return {
      _type: "Singleton",
      name: singletonName,
      navigationPropertyBinding: {},
      entityTypeName: singletonDefinition.$Type,
      fullyQualifiedName: `${entityContainerName}/${singletonName}`,
      nullable: true
    };
  }
  function prepareActionImport(actionImport, actionImportName, entityContainerName) {
    return {
      _type: "ActionImport",
      name: actionImportName,
      fullyQualifiedName: `${entityContainerName}/${actionImportName}`,
      actionName: actionImport.$Action
    };
  }
  function prepareTypeDefinition(typeDefinition, typeName, namespacePrefix) {
    const typeObject = {
      _type: "TypeDefinition",
      name: typeName.substring(namespacePrefix.length),
      fullyQualifiedName: typeName,
      underlyingType: typeDefinition.$UnderlyingType
    };
    return typeObject;
  }
  function prepareComplexType(complexTypeDefinition, complexTypeName, namespacePrefix) {
    const complexTypeObject = {
      _type: "ComplexType",
      name: complexTypeName.substring(namespacePrefix.length),
      fullyQualifiedName: complexTypeName,
      properties: [],
      navigationProperties: []
    };
    const complexTypeProperties = Object.keys(complexTypeDefinition).filter(propertyNameOrNot => {
      if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
        return complexTypeDefinition[propertyNameOrNot].$kind === "Property";
      }
    }).sort((a, b) => a > b ? 1 : -1).map(propertyName => {
      return prepareProperty(complexTypeDefinition[propertyName], complexTypeObject, propertyName);
    });
    complexTypeObject.properties = complexTypeProperties;
    const complexTypeNavigationProperties = Object.keys(complexTypeDefinition).filter(propertyNameOrNot => {
      if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
        return complexTypeDefinition[propertyNameOrNot].$kind === "NavigationProperty";
      }
    }).sort((a, b) => a > b ? 1 : -1).map(navPropertyName => {
      return prepareNavigationProperty(complexTypeDefinition[navPropertyName], complexTypeObject, navPropertyName);
    });
    complexTypeObject.navigationProperties = complexTypeNavigationProperties;
    return complexTypeObject;
  }
  function prepareEntityKeys(entityTypeDefinition, oMetaModelData) {
    if (!entityTypeDefinition.$Key && entityTypeDefinition.$BaseType) {
      return prepareEntityKeys(oMetaModelData[entityTypeDefinition.$BaseType], oMetaModelData);
    }
    return entityTypeDefinition.$Key ?? []; //handling of entity types without key as well as basetype
  }

  function prepareEntityType(entityTypeDefinition, entityTypeName, namespacePrefix, metaModelData) {
    var _metaModelData$$Annot, _metaModelData$$Annot2;
    const entityType = {
      _type: "EntityType",
      name: entityTypeName.substring(namespacePrefix.length),
      fullyQualifiedName: entityTypeName,
      keys: [],
      entityProperties: [],
      navigationProperties: [],
      actions: {}
    };
    for (const key in entityTypeDefinition) {
      const value = entityTypeDefinition[key];
      switch (value.$kind) {
        case "Property":
          const property = prepareProperty(value, entityType, key);
          entityType.entityProperties.push(property);
          break;
        case "NavigationProperty":
          const navigationProperty = prepareNavigationProperty(value, entityType, key);
          entityType.navigationProperties.push(navigationProperty);
          break;
      }
    }
    entityType.keys = prepareEntityKeys(entityTypeDefinition, metaModelData).map(entityKey => entityType.entityProperties.find(property => property.name === entityKey)).filter(property => property !== undefined);

    // Check if there are filter facets defined for the entityType and if yes, check if all of them have an ID
    // The ID is optional, but it is internally taken for grouping filter fields and if it's not present
    // a fallback ID needs to be generated here.
    (_metaModelData$$Annot = metaModelData.$Annotations[entityType.fullyQualifiedName]) === null || _metaModelData$$Annot === void 0 ? void 0 : (_metaModelData$$Annot2 = _metaModelData$$Annot[`@${"com.sap.vocabularies.UI.v1.FilterFacets"}`]) === null || _metaModelData$$Annot2 === void 0 ? void 0 : _metaModelData$$Annot2.forEach(filterFacetAnnotation => {
      filterFacetAnnotation.ID = createReferenceFacetId(filterFacetAnnotation);
    });
    for (const entityProperty of entityType.entityProperties) {
      if (!metaModelData.$Annotations[entityProperty.fullyQualifiedName]) {
        metaModelData.$Annotations[entityProperty.fullyQualifiedName] = {};
      }
      if (!metaModelData.$Annotations[entityProperty.fullyQualifiedName][`@${"com.sap.vocabularies.UI.v1.DataFieldDefault"}`]) {
        metaModelData.$Annotations[entityProperty.fullyQualifiedName][`@${"com.sap.vocabularies.UI.v1.DataFieldDefault"}`] = {
          $Type: "com.sap.vocabularies.UI.v1.DataField",
          Value: {
            $Path: entityProperty.name
          }
        };
      }
    }
    return entityType;
  }
  function prepareAction(actionName, actionRawData, namespacePrefix) {
    var _actionRawData$$Retur;
    let actionEntityType = "";
    let actionFQN = actionName;
    if (actionRawData.$IsBound) {
      const bindingParameter = actionRawData.$Parameter[0];
      actionEntityType = bindingParameter.$Type;
      if (bindingParameter.$isCollection === true) {
        actionFQN = `${actionName}(Collection(${actionEntityType}))`;
      } else {
        actionFQN = `${actionName}(${actionEntityType})`;
      }
    }
    const parameters = actionRawData.$Parameter ?? [];
    return {
      _type: "Action",
      name: actionName.substring(namespacePrefix.length),
      fullyQualifiedName: actionFQN,
      isBound: actionRawData.$IsBound ?? false,
      isFunction: actionRawData.$kind === "Function",
      sourceType: actionEntityType,
      returnType: ((_actionRawData$$Retur = actionRawData.$ReturnType) === null || _actionRawData$$Retur === void 0 ? void 0 : _actionRawData$$Retur.$Type) ?? "",
      parameters: parameters.map(param => {
        return {
          _type: "ActionParameter",
          fullyQualifiedName: `${actionFQN}/${param.$Name}`,
          isCollection: param.$isCollection ?? false,
          name: param.$Name,
          type: param.$Type,
          nullable: param.$Nullable ?? false,
          maxLength: param.$MaxLength,
          precision: param.$Precision,
          scale: param.$Scale
        };
      })
    };
  }
  function parseEntityContainer(namespacePrefix, entityContainerName, entityContainerMetadata, schema) {
    schema.entityContainer = {
      _type: "EntityContainer",
      name: entityContainerName.substring(namespacePrefix.length),
      fullyQualifiedName: entityContainerName
    };
    for (const elementName in entityContainerMetadata) {
      const elementValue = entityContainerMetadata[elementName];
      switch (elementValue.$kind) {
        case "EntitySet":
          schema.entitySets.push(prepareEntitySet(elementValue, elementName, entityContainerName));
          break;
        case "Singleton":
          schema.singletons.push(prepareSingleton(elementValue, elementName, entityContainerName));
          break;
        case "ActionImport":
          schema.actionImports.push(prepareActionImport(elementValue, elementName, entityContainerName));
          break;
      }
    }

    // link the navigation property bindings ($NavigationPropertyBinding)
    for (const entitySet of schema.entitySets) {
      const navPropertyBindings = entityContainerMetadata[entitySet.name].$NavigationPropertyBinding;
      if (navPropertyBindings) {
        for (const navPropName of Object.keys(navPropertyBindings)) {
          const targetEntitySet = schema.entitySets.find(entitySetName => entitySetName.name === navPropertyBindings[navPropName]);
          if (targetEntitySet) {
            entitySet.navigationPropertyBinding[navPropName] = targetEntitySet;
          }
        }
      }
    }
  }
  function parseAnnotations(annotations, capabilities) {
    const annotationLists = {};
    for (const target in annotations) {
      createAnnotationLists(annotations[target], target, annotationLists, capabilities);
    }
    return Object.values(annotationLists);
  }
  function parseSchema(metaModelData) {
    // assuming there is only one schema/namespace
    const namespacePrefix = Object.keys(metaModelData).find(key => metaModelData[key].$kind === "Schema") ?? "";
    const schema = {
      namespace: namespacePrefix.slice(0, -1),
      entityContainer: {
        _type: "EntityContainer",
        name: "",
        fullyQualifiedName: ""
      },
      entitySets: [],
      entityTypes: [],
      complexTypes: [],
      typeDefinitions: [],
      singletons: [],
      associations: [],
      associationSets: [],
      actions: [],
      actionImports: [],
      annotations: {}
    };
    const parseMetaModelElement = (name, value) => {
      switch (value.$kind) {
        case "EntityContainer":
          parseEntityContainer(namespacePrefix, name, value, schema);
          break;
        case "Action":
        case "Function":
          schema.actions.push(prepareAction(name, value, namespacePrefix));
          break;
        case "EntityType":
          schema.entityTypes.push(prepareEntityType(value, name, namespacePrefix, metaModelData));
          break;
        case "ComplexType":
          schema.complexTypes.push(prepareComplexType(value, name, namespacePrefix));
          break;
        case "TypeDefinition":
          schema.typeDefinitions.push(prepareTypeDefinition(value, name, namespacePrefix));
          break;
      }
    };
    for (const elementName in metaModelData) {
      const elementValue = metaModelData[elementName];
      if (Array.isArray(elementValue)) {
        // value can be an array in case of actions or functions
        for (const subElementValue of elementValue) {
          parseMetaModelElement(elementName, subElementValue);
        }
      } else {
        parseMetaModelElement(elementName, elementValue);
      }
    }
    return schema;
  }
  function parseMetaModel(metaModel) {
    let capabilities = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DefaultEnvironmentCapabilities;
    const result = {
      identification: "metamodelResult",
      version: "4.0",
      references: []
    };

    // parse the schema when it is accessed for the first time
    AnnotationConverter.lazy(result, "schema", () => {
      const metaModelData = metaModel.getObject("/$");
      const schema = parseSchema(metaModelData);
      AnnotationConverter.lazy(schema.annotations, "metamodelResult", () => parseAnnotations(metaModelData.$Annotations, capabilities));
      return schema;
    });
    return result;
  }
  _exports.parseMetaModel = parseMetaModel;
  const mMetaModelMap = {};

  /**
   * Convert the ODataMetaModel into another format that allow for easy manipulation of the annotations.
   *
   * @param oMetaModel The ODataMetaModel
   * @param oCapabilities The current capabilities
   * @returns An object containing object-like annotations
   */
  function convertTypes(oMetaModel, oCapabilities) {
    const sMetaModelId = oMetaModel.id;
    if (!mMetaModelMap.hasOwnProperty(sMetaModelId)) {
      const parsedOutput = parseMetaModel(oMetaModel, oCapabilities);
      try {
        mMetaModelMap[sMetaModelId] = AnnotationConverter.convert(parsedOutput);
      } catch (oError) {
        throw new Error(oError);
      }
    }
    return mMetaModelMap[sMetaModelId];
  }
  _exports.convertTypes = convertTypes;
  function getConvertedTypes(oContext) {
    const oMetaModel = oContext.getModel();
    if (!oMetaModel.isA("sap.ui.model.odata.v4.ODataMetaModel")) {
      throw new Error("This should only be called on a ODataMetaModel");
    }
    return convertTypes(oMetaModel);
  }
  _exports.getConvertedTypes = getConvertedTypes;
  function deleteModelCacheData(oMetaModel) {
    delete mMetaModelMap[oMetaModel.id];
  }
  _exports.deleteModelCacheData = deleteModelCacheData;
  function convertMetaModelContext(oMetaModelContext) {
    let bIncludeVisitedObjects = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const oConvertedMetadata = convertTypes(oMetaModelContext.getModel());
    const sPath = oMetaModelContext.getPath();
    const aPathSplit = sPath.split("/");
    let firstPart = aPathSplit[1];
    let beginIndex = 2;
    if (oConvertedMetadata.entityContainer.fullyQualifiedName === firstPart) {
      firstPart = aPathSplit[2];
      beginIndex++;
    }
    let targetEntitySet = oConvertedMetadata.entitySets.find(entitySet => entitySet.name === firstPart);
    if (!targetEntitySet) {
      targetEntitySet = oConvertedMetadata.singletons.find(singleton => singleton.name === firstPart);
    }
    let relativePath = aPathSplit.slice(beginIndex).join("/");
    const localObjects = [targetEntitySet];
    while (relativePath && relativePath.length > 0 && relativePath.startsWith("$NavigationPropertyBinding")) {
      var _sNavPropToCheck;
      let relativeSplit = relativePath.split("/");
      let idx = 0;
      let currentEntitySet, sNavPropToCheck;
      relativeSplit = relativeSplit.slice(1); // Removing "$NavigationPropertyBinding"
      while (!currentEntitySet && relativeSplit.length > idx) {
        if (relativeSplit[idx] !== "$NavigationPropertyBinding") {
          // Finding the correct entitySet for the navigaiton property binding example: "Set/_SalesOrder"
          sNavPropToCheck = relativeSplit.slice(0, idx + 1).join("/").replace("/$NavigationPropertyBinding", "");
          currentEntitySet = targetEntitySet && targetEntitySet.navigationPropertyBinding[sNavPropToCheck];
        }
        idx++;
      }
      if (!currentEntitySet) {
        // Fall back to Single nav prop if entitySet is not found.
        sNavPropToCheck = relativeSplit[0];
      }
      const aNavProps = ((_sNavPropToCheck = sNavPropToCheck) === null || _sNavPropToCheck === void 0 ? void 0 : _sNavPropToCheck.split("/")) || [];
      let targetEntityType = targetEntitySet && targetEntitySet.entityType;
      for (const sNavProp of aNavProps) {
        // Pushing all nav props to the visited objects. example: "Set", "_SalesOrder" for "Set/_SalesOrder"(in NavigationPropertyBinding)
        const targetNavProp = targetEntityType && targetEntityType.navigationProperties.find(navProp => navProp.name === sNavProp);
        if (targetNavProp) {
          localObjects.push(targetNavProp);
          targetEntityType = targetNavProp.targetType;
        } else {
          break;
        }
      }
      targetEntitySet = targetEntitySet && currentEntitySet || targetEntitySet && targetEntitySet.navigationPropertyBinding[relativeSplit[0]];
      if (targetEntitySet) {
        // Pushing the target entitySet to visited objects
        localObjects.push(targetEntitySet);
      }
      // Re-calculating the relative path
      // As each navigation name is enclosed between '$NavigationPropertyBinding' and '$' (to be able to access the entityset easily in the metamodel)
      // we need to remove the closing '$' to be able to switch to the next navigation
      relativeSplit = relativeSplit.slice(aNavProps.length || 1);
      if (relativeSplit.length && relativeSplit[0] === "$") {
        relativeSplit.shift();
      }
      relativePath = relativeSplit.join("/");
    }
    if (relativePath.startsWith("$Type")) {
      // As $Type@ is allowed as well
      if (relativePath.startsWith("$Type@")) {
        relativePath = relativePath.replace("$Type", "");
      } else {
        // We're anyway going to look on the entityType...
        relativePath = aPathSplit.slice(3).join("/");
      }
    }
    if (targetEntitySet && relativePath.length) {
      const oTarget = targetEntitySet.entityType.resolvePath(relativePath, bIncludeVisitedObjects);
      if (oTarget) {
        if (bIncludeVisitedObjects) {
          oTarget.visitedObjects = localObjects.concat(oTarget.visitedObjects);
        }
      } else if (targetEntitySet.entityType && targetEntitySet.entityType.actions) {
        // if target is an action or an action parameter
        const actions = targetEntitySet.entityType && targetEntitySet.entityType.actions;
        const relativeSplit = relativePath.split("/");
        if (actions[relativeSplit[0]]) {
          const action = actions[relativeSplit[0]];
          if (relativeSplit[1] && action.parameters) {
            const parameterName = relativeSplit[1];
            return action.parameters.find(parameter => {
              return parameter.fullyQualifiedName.endsWith(`/${parameterName}`);
            });
          } else if (relativePath.length === 1) {
            return action;
          }
        }
      }
      return oTarget;
    } else {
      if (bIncludeVisitedObjects) {
        return {
          target: targetEntitySet,
          visitedObjects: localObjects
        };
      }
      return targetEntitySet;
    }
  }
  _exports.convertMetaModelContext = convertMetaModelContext;
  function getInvolvedDataModelObjects(oMetaModelContext, oEntitySetMetaModelContext) {
    const oConvertedMetadata = convertTypes(oMetaModelContext.getModel());
    const metaModelContext = convertMetaModelContext(oMetaModelContext, true);
    let targetEntitySetLocation;
    if (oEntitySetMetaModelContext && oEntitySetMetaModelContext.getPath() !== "/") {
      targetEntitySetLocation = getInvolvedDataModelObjects(oEntitySetMetaModelContext);
    }
    return getInvolvedDataModelObjectFromPath(metaModelContext, oConvertedMetadata, targetEntitySetLocation);
  }
  _exports.getInvolvedDataModelObjects = getInvolvedDataModelObjects;
  function getInvolvedDataModelObjectFromPath(metaModelContext, convertedTypes, targetEntitySetLocation) {
    let onlyServiceObjects = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const dataModelObjects = metaModelContext.visitedObjects.filter(visitedObject => isServiceObject(visitedObject) && !isEntityType(visitedObject) && !isEntityContainer(visitedObject));
    if (isServiceObject(metaModelContext.target) && !isEntityType(metaModelContext.target) && dataModelObjects[dataModelObjects.length - 1] !== metaModelContext.target && !onlyServiceObjects) {
      dataModelObjects.push(metaModelContext.target);
    }
    const navigationProperties = [];
    const rootEntitySet = dataModelObjects[0];
    let currentEntitySet = rootEntitySet;
    let currentEntityType = rootEntitySet.entityType;
    let currentObject;
    let navigatedPath = [];
    for (let i = 1; i < dataModelObjects.length; i++) {
      currentObject = dataModelObjects[i];
      if (isNavigationProperty(currentObject)) {
        var _currentEntitySet;
        navigatedPath.push(currentObject.name);
        navigationProperties.push(currentObject);
        currentEntityType = currentObject.targetType;
        const boundEntitySet = (_currentEntitySet = currentEntitySet) === null || _currentEntitySet === void 0 ? void 0 : _currentEntitySet.navigationPropertyBinding[navigatedPath.join("/")];
        if (boundEntitySet !== undefined) {
          currentEntitySet = boundEntitySet;
          navigatedPath = [];
        }
      }
      if (isEntitySet(currentObject) || isSingleton(currentObject)) {
        currentEntitySet = currentObject;
        currentEntityType = currentEntitySet.entityType;
      }
    }
    if (navigatedPath.length > 0) {
      // Path without NavigationPropertyBinding --> no target entity set
      currentEntitySet = undefined;
    }
    if (targetEntitySetLocation && targetEntitySetLocation.startingEntitySet !== rootEntitySet) {
      // In case the entityset is not starting from the same location it may mean that we are doing too much work earlier for some reason
      // As such we need to redefine the context source for the targetEntitySetLocation
      const startingIndex = dataModelObjects.indexOf(targetEntitySetLocation.startingEntitySet);
      if (startingIndex !== -1) {
        // If it's not found I don't know what we can do (probably nothing)
        const requiredDataModelObjects = dataModelObjects.slice(0, startingIndex);
        targetEntitySetLocation.startingEntitySet = rootEntitySet;
        targetEntitySetLocation.navigationProperties = requiredDataModelObjects.filter(isNavigationProperty).concat(targetEntitySetLocation.navigationProperties);
      }
    }
    const outDataModelPath = {
      startingEntitySet: rootEntitySet,
      targetEntitySet: currentEntitySet,
      targetEntityType: currentEntityType,
      targetObject: metaModelContext.target,
      navigationProperties,
      contextLocation: targetEntitySetLocation,
      convertedTypes: convertedTypes
    };
    if (!isServiceObject(outDataModelPath.targetObject) && onlyServiceObjects) {
      outDataModelPath.targetObject = isServiceObject(currentObject) ? currentObject : undefined;
    }
    if (!outDataModelPath.contextLocation) {
      outDataModelPath.contextLocation = outDataModelPath;
    }
    return outDataModelPath;
  }
  _exports.getInvolvedDataModelObjectFromPath = getInvolvedDataModelObjectFromPath;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWT0NBQlVMQVJZX0FMSUFTIiwiRGVmYXVsdEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIiwiQ2hhcnQiLCJNaWNyb0NoYXJ0IiwiVVNoZWxsIiwiSW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiQXBwU3RhdGUiLCJJbnNpZ2h0c1N1cHBvcnRlZCIsInBhcnNlUHJvcGVydHlWYWx1ZSIsImFubm90YXRpb25PYmplY3QiLCJwcm9wZXJ0eUtleSIsImN1cnJlbnRUYXJnZXQiLCJhbm5vdGF0aW9uc0xpc3RzIiwib0NhcGFiaWxpdGllcyIsInZhbHVlIiwiY3VycmVudFByb3BlcnR5VGFyZ2V0IiwidHlwZU9mQW5ub3RhdGlvbiIsInR5cGUiLCJOdWxsIiwiU3RyaW5nIiwiQm9vbCIsIkludCIsIkFycmF5IiwiaXNBcnJheSIsIkNvbGxlY3Rpb24iLCJtYXAiLCJzdWJBbm5vdGF0aW9uT2JqZWN0Iiwic3ViQW5ub3RhdGlvbk9iamVjdEluZGV4IiwicGFyc2VBbm5vdGF0aW9uT2JqZWN0IiwibGVuZ3RoIiwiaGFzT3duUHJvcGVydHkiLCIkUGF0aCIsInVuZGVmaW5lZCIsIlBhdGgiLCIkRGVjaW1hbCIsIkRlY2ltYWwiLCJwYXJzZUZsb2F0IiwiJFByb3BlcnR5UGF0aCIsIlByb3BlcnR5UGF0aCIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiTmF2aWdhdGlvblByb3BlcnR5UGF0aCIsIiRJZiIsIklmIiwiJEFuZCIsIkFuZCIsIiRPciIsIk9yIiwiJE5vdCIsIk5vdCIsIiRFcSIsIkVxIiwiJE5lIiwiTmUiLCIkR3QiLCJHdCIsIiRHZSIsIkdlIiwiJEx0IiwiTHQiLCIkTGUiLCJMZSIsIiRBcHBseSIsIkFwcGx5IiwiRnVuY3Rpb24iLCIkRnVuY3Rpb24iLCIkQW5ub3RhdGlvblBhdGgiLCJBbm5vdGF0aW9uUGF0aCIsIiRFbnVtTWVtYmVyIiwiRW51bU1lbWJlciIsIm1hcE5hbWVUb0FsaWFzIiwic3BsaXQiLCJSZWNvcmQiLCJuYW1lIiwiYW5ub3RhdGlvbk5hbWUiLCJwYXRoUGFydCIsImFubm9QYXJ0IiwibGFzdERvdCIsImxhc3RJbmRleE9mIiwic3Vic3RyIiwiY3VycmVudE9iamVjdFRhcmdldCIsInBhcnNlZEFubm90YXRpb25PYmplY3QiLCJ0eXBlT2ZPYmplY3QiLCJwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbiIsImNvbGxlY3Rpb24iLCJzdWJBbm5vdGF0aW9uSW5kZXgiLCIkVHlwZSIsInR5cGVWYWx1ZSIsInByb3BlcnR5VmFsdWVzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJzdGFydHNXaXRoIiwicHVzaCIsImNyZWF0ZUFubm90YXRpb25MaXN0cyIsImdldE9yQ3JlYXRlQW5ub3RhdGlvbkxpc3QiLCJ0YXJnZXQiLCJhbm5vdGF0aW9ucyIsImNyZWF0ZVJlZmVyZW5jZUZhY2V0SWQiLCJyZWZlcmVuY2VGYWNldCIsImlkIiwiSUQiLCJUYXJnZXQiLCJwcmVwYXJlSWQiLCJyZW1vdmVDaGFydEFubm90YXRpb25zIiwiZmlsdGVyIiwib1JlY29yZCIsImluZGV4T2YiLCJyZW1vdmVJQk5Bbm5vdGF0aW9ucyIsImhhbmRsZVByZXNlbnRhdGlvblZhcmlhbnQiLCJhbm5vdGF0aW9uT2JqZWN0cyIsImFubm90YXRpb25UYXJnZXQiLCJhbm5vdGF0aW9uTGlzdHMiLCJvdXRBbm5vdGF0aW9uT2JqZWN0IiwiYW5ub3RhdGlvbk9iamVjdEtleSIsImFubm90YXRpb25LZXkiLCJEYXRhIiwiVmlzdWFsaXphdGlvbnMiLCJGaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zIiwic29tZSIsIkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbiIsIlByb3BlcnR5IiwiaW5jbHVkZXMiLCJBbGxvd2VkRXhwcmVzc2lvbnMiLCJjdXJyZW50T3V0QW5ub3RhdGlvbk9iamVjdCIsImFubm90YXRpb25PZkFubm90YXRpb25TcGxpdCIsImFubm90YXRpb25RdWFsaWZpZXJTcGxpdCIsInF1YWxpZmllciIsInRlcm0iLCJjdXJyZW50QW5ub3RhdGlvblRhcmdldCIsImlzQ29sbGVjdGlvbiIsInR5cGVvZkFubm90YXRpb24iLCJyZWNvcmQiLCJwcmVwYXJlUHJvcGVydHkiLCJwcm9wZXJ0eURlZmluaXRpb24iLCJlbnRpdHlUeXBlT2JqZWN0IiwicHJvcGVydHlOYW1lIiwiX3R5cGUiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJtYXhMZW5ndGgiLCIkTWF4TGVuZ3RoIiwicHJlY2lzaW9uIiwiJFByZWNpc2lvbiIsInNjYWxlIiwiJFNjYWxlIiwibnVsbGFibGUiLCIkTnVsbGFibGUiLCJwcmVwYXJlTmF2aWdhdGlvblByb3BlcnR5IiwibmF2UHJvcGVydHlEZWZpbml0aW9uIiwibmF2UHJvcGVydHlOYW1lIiwicmVmZXJlbnRpYWxDb25zdHJhaW50IiwiJFJlZmVyZW50aWFsQ29uc3RyYWludCIsInNvdXJjZVByb3BlcnR5TmFtZSIsInNvdXJjZVR5cGVOYW1lIiwic291cmNlUHJvcGVydHkiLCJ0YXJnZXRUeXBlTmFtZSIsInRhcmdldFByb3BlcnR5IiwibmF2aWdhdGlvblByb3BlcnR5IiwicGFydG5lciIsIiRQYXJ0bmVyIiwiJGlzQ29sbGVjdGlvbiIsImNvbnRhaW5zVGFyZ2V0IiwiJENvbnRhaW5zVGFyZ2V0IiwicHJlcGFyZUVudGl0eVNldCIsImVudGl0eVNldERlZmluaXRpb24iLCJlbnRpdHlTZXROYW1lIiwiZW50aXR5Q29udGFpbmVyTmFtZSIsImVudGl0eVNldE9iamVjdCIsIm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmciLCJlbnRpdHlUeXBlTmFtZSIsInByZXBhcmVTaW5nbGV0b24iLCJzaW5nbGV0b25EZWZpbml0aW9uIiwic2luZ2xldG9uTmFtZSIsInByZXBhcmVBY3Rpb25JbXBvcnQiLCJhY3Rpb25JbXBvcnQiLCJhY3Rpb25JbXBvcnROYW1lIiwiYWN0aW9uTmFtZSIsIiRBY3Rpb24iLCJwcmVwYXJlVHlwZURlZmluaXRpb24iLCJ0eXBlRGVmaW5pdGlvbiIsInR5cGVOYW1lIiwibmFtZXNwYWNlUHJlZml4IiwidHlwZU9iamVjdCIsInN1YnN0cmluZyIsInVuZGVybHlpbmdUeXBlIiwiJFVuZGVybHlpbmdUeXBlIiwicHJlcGFyZUNvbXBsZXhUeXBlIiwiY29tcGxleFR5cGVEZWZpbml0aW9uIiwiY29tcGxleFR5cGVOYW1lIiwiY29tcGxleFR5cGVPYmplY3QiLCJwcm9wZXJ0aWVzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJjb21wbGV4VHlwZVByb3BlcnRpZXMiLCJwcm9wZXJ0eU5hbWVPck5vdCIsIiRraW5kIiwic29ydCIsImEiLCJiIiwiY29tcGxleFR5cGVOYXZpZ2F0aW9uUHJvcGVydGllcyIsInByZXBhcmVFbnRpdHlLZXlzIiwiZW50aXR5VHlwZURlZmluaXRpb24iLCJvTWV0YU1vZGVsRGF0YSIsIiRLZXkiLCIkQmFzZVR5cGUiLCJwcmVwYXJlRW50aXR5VHlwZSIsIm1ldGFNb2RlbERhdGEiLCJlbnRpdHlUeXBlIiwiZW50aXR5UHJvcGVydGllcyIsImFjdGlvbnMiLCJrZXkiLCJwcm9wZXJ0eSIsImVudGl0eUtleSIsImZpbmQiLCIkQW5ub3RhdGlvbnMiLCJmaWx0ZXJGYWNldEFubm90YXRpb24iLCJlbnRpdHlQcm9wZXJ0eSIsIlZhbHVlIiwicHJlcGFyZUFjdGlvbiIsImFjdGlvblJhd0RhdGEiLCJhY3Rpb25FbnRpdHlUeXBlIiwiYWN0aW9uRlFOIiwiJElzQm91bmQiLCJiaW5kaW5nUGFyYW1ldGVyIiwiJFBhcmFtZXRlciIsInBhcmFtZXRlcnMiLCJpc0JvdW5kIiwiaXNGdW5jdGlvbiIsInNvdXJjZVR5cGUiLCJyZXR1cm5UeXBlIiwiJFJldHVyblR5cGUiLCJwYXJhbSIsIiROYW1lIiwicGFyc2VFbnRpdHlDb250YWluZXIiLCJlbnRpdHlDb250YWluZXJNZXRhZGF0YSIsInNjaGVtYSIsImVudGl0eUNvbnRhaW5lciIsImVsZW1lbnROYW1lIiwiZWxlbWVudFZhbHVlIiwiZW50aXR5U2V0cyIsInNpbmdsZXRvbnMiLCJhY3Rpb25JbXBvcnRzIiwiZW50aXR5U2V0IiwibmF2UHJvcGVydHlCaW5kaW5ncyIsIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nIiwibmF2UHJvcE5hbWUiLCJ0YXJnZXRFbnRpdHlTZXQiLCJwYXJzZUFubm90YXRpb25zIiwiY2FwYWJpbGl0aWVzIiwidmFsdWVzIiwicGFyc2VTY2hlbWEiLCJuYW1lc3BhY2UiLCJzbGljZSIsImVudGl0eVR5cGVzIiwiY29tcGxleFR5cGVzIiwidHlwZURlZmluaXRpb25zIiwiYXNzb2NpYXRpb25zIiwiYXNzb2NpYXRpb25TZXRzIiwicGFyc2VNZXRhTW9kZWxFbGVtZW50Iiwic3ViRWxlbWVudFZhbHVlIiwicGFyc2VNZXRhTW9kZWwiLCJtZXRhTW9kZWwiLCJyZXN1bHQiLCJpZGVudGlmaWNhdGlvbiIsInZlcnNpb24iLCJyZWZlcmVuY2VzIiwiQW5ub3RhdGlvbkNvbnZlcnRlciIsImxhenkiLCJnZXRPYmplY3QiLCJtTWV0YU1vZGVsTWFwIiwiY29udmVydFR5cGVzIiwib01ldGFNb2RlbCIsInNNZXRhTW9kZWxJZCIsInBhcnNlZE91dHB1dCIsImNvbnZlcnQiLCJvRXJyb3IiLCJFcnJvciIsImdldENvbnZlcnRlZFR5cGVzIiwib0NvbnRleHQiLCJnZXRNb2RlbCIsImlzQSIsImRlbGV0ZU1vZGVsQ2FjaGVEYXRhIiwiY29udmVydE1ldGFNb2RlbENvbnRleHQiLCJvTWV0YU1vZGVsQ29udGV4dCIsImJJbmNsdWRlVmlzaXRlZE9iamVjdHMiLCJvQ29udmVydGVkTWV0YWRhdGEiLCJzUGF0aCIsImdldFBhdGgiLCJhUGF0aFNwbGl0IiwiZmlyc3RQYXJ0IiwiYmVnaW5JbmRleCIsInNpbmdsZXRvbiIsInJlbGF0aXZlUGF0aCIsImpvaW4iLCJsb2NhbE9iamVjdHMiLCJyZWxhdGl2ZVNwbGl0IiwiaWR4IiwiY3VycmVudEVudGl0eVNldCIsInNOYXZQcm9wVG9DaGVjayIsInJlcGxhY2UiLCJhTmF2UHJvcHMiLCJ0YXJnZXRFbnRpdHlUeXBlIiwic05hdlByb3AiLCJ0YXJnZXROYXZQcm9wIiwibmF2UHJvcCIsInRhcmdldFR5cGUiLCJzaGlmdCIsIm9UYXJnZXQiLCJyZXNvbHZlUGF0aCIsInZpc2l0ZWRPYmplY3RzIiwiY29uY2F0IiwiYWN0aW9uIiwicGFyYW1ldGVyTmFtZSIsInBhcmFtZXRlciIsImVuZHNXaXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwib0VudGl0eVNldE1ldGFNb2RlbENvbnRleHQiLCJtZXRhTW9kZWxDb250ZXh0IiwidGFyZ2V0RW50aXR5U2V0TG9jYXRpb24iLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdEZyb21QYXRoIiwiY29udmVydGVkVHlwZXMiLCJvbmx5U2VydmljZU9iamVjdHMiLCJkYXRhTW9kZWxPYmplY3RzIiwidmlzaXRlZE9iamVjdCIsImlzU2VydmljZU9iamVjdCIsImlzRW50aXR5VHlwZSIsImlzRW50aXR5Q29udGFpbmVyIiwicm9vdEVudGl0eVNldCIsImN1cnJlbnRFbnRpdHlUeXBlIiwiY3VycmVudE9iamVjdCIsIm5hdmlnYXRlZFBhdGgiLCJpIiwiaXNOYXZpZ2F0aW9uUHJvcGVydHkiLCJib3VuZEVudGl0eVNldCIsImlzRW50aXR5U2V0IiwiaXNTaW5nbGV0b24iLCJzdGFydGluZ0VudGl0eVNldCIsInN0YXJ0aW5nSW5kZXgiLCJyZXF1aXJlZERhdGFNb2RlbE9iamVjdHMiLCJvdXREYXRhTW9kZWxQYXRoIiwidGFyZ2V0T2JqZWN0IiwiY29udGV4dExvY2F0aW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNZXRhTW9kZWxDb252ZXJ0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBmaWxlIGlzIHJldHJpZXZlZCBmcm9tIEBzYXAtdXgvYW5ub3RhdGlvbi1jb252ZXJ0ZXIsIHNoYXJlZCBjb2RlIHdpdGggdG9vbCBzdWl0ZVxuXG5pbXBvcnQgdHlwZSB7XG5cdEFubm90YXRpb24sXG5cdEFubm90YXRpb25MaXN0LFxuXHRBbm5vdGF0aW9uUmVjb3JkLFxuXHRDb252ZXJ0ZWRNZXRhZGF0YSxcblx0RW50aXR5U2V0LFxuXHRFbnRpdHlUeXBlLFxuXHRFeHByZXNzaW9uLFxuXHROYXZpZ2F0aW9uUHJvcGVydHksXG5cdFJhd0FjdGlvbixcblx0UmF3QWN0aW9uSW1wb3J0LFxuXHRSYXdDb21wbGV4VHlwZSxcblx0UmF3RW50aXR5U2V0LFxuXHRSYXdFbnRpdHlUeXBlLFxuXHRSYXdNZXRhZGF0YSxcblx0UmF3UHJvcGVydHksXG5cdFJhd1NjaGVtYSxcblx0UmF3U2luZ2xldG9uLFxuXHRSYXdUeXBlRGVmaW5pdGlvbixcblx0UmF3VjROYXZpZ2F0aW9uUHJvcGVydHksXG5cdFJlZmVyZW50aWFsQ29uc3RyYWludCxcblx0U2VydmljZU9iamVjdCxcblx0U2luZ2xldG9uXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHsgU2VydmljZU9iamVjdEFuZEFubm90YXRpb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zLCBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IEFubm90YXRpb25Db252ZXJ0ZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb21tb25cIjtcbmltcG9ydCB7XG5cdGlzRW50aXR5Q29udGFpbmVyLFxuXHRpc0VudGl0eVNldCxcblx0aXNFbnRpdHlUeXBlLFxuXHRpc05hdmlnYXRpb25Qcm9wZXJ0eSxcblx0aXNTZXJ2aWNlT2JqZWN0LFxuXHRpc1NpbmdsZXRvblxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9UeXBlR3VhcmRzXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHsgcHJlcGFyZUlkIH0gZnJvbSBcIi4uL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcblxuY29uc3QgVk9DQUJVTEFSWV9BTElBUzogYW55ID0ge1xuXHRcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjFcIjogXCJDYXBhYmlsaXRpZXNcIixcblx0XCJPcmcuT0RhdGEuQ29yZS5WMVwiOiBcIkNvcmVcIixcblx0XCJPcmcuT0RhdGEuTWVhc3VyZXMuVjFcIjogXCJNZWFzdXJlc1wiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiOiBcIkNvbW1vblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCI6IFwiVUlcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxXCI6IFwiU2Vzc2lvblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MVwiOiBcIkFuYWx5dGljc1wiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MVwiOiBcIlBlcnNvbmFsRGF0YVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjFcIjogXCJDb21tdW5pY2F0aW9uXCJcbn07XG5cbmV4cG9ydCB0eXBlIEVudmlyb25tZW50Q2FwYWJpbGl0aWVzID0ge1xuXHRDaGFydDogYm9vbGVhbjtcblx0TWljcm9DaGFydDogYm9vbGVhbjtcblx0VVNoZWxsOiBib29sZWFuO1xuXHRJbnRlbnRCYXNlZE5hdmlnYXRpb246IGJvb2xlYW47XG5cdEFwcFN0YXRlOiBib29sZWFuO1xuXHRJbnNpZ2h0c1N1cHBvcnRlZDogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCBjb25zdCBEZWZhdWx0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMgPSB7XG5cdENoYXJ0OiB0cnVlLFxuXHRNaWNyb0NoYXJ0OiB0cnVlLFxuXHRVU2hlbGw6IHRydWUsXG5cdEludGVudEJhc2VkTmF2aWdhdGlvbjogdHJ1ZSxcblx0QXBwU3RhdGU6IHRydWUsXG5cdEluc2lnaHRzU3VwcG9ydGVkOiBmYWxzZVxufTtcblxuZXhwb3J0IHR5cGUgTWV0YU1vZGVsQWN0aW9uID0ge1xuXHQka2luZDogXCJBY3Rpb25cIiB8IFwiRnVuY3Rpb25cIjtcblx0JElzQm91bmQ6IGJvb2xlYW47XG5cdCRFbnRpdHlTZXRQYXRoOiBzdHJpbmc7XG5cdCRQYXJhbWV0ZXI6IHtcblx0XHQkVHlwZTogc3RyaW5nO1xuXHRcdCROYW1lOiBzdHJpbmc7XG5cdFx0JE51bGxhYmxlPzogYm9vbGVhbjtcblx0XHQkTWF4TGVuZ3RoPzogbnVtYmVyO1xuXHRcdCRQcmVjaXNpb24/OiBudW1iZXI7XG5cdFx0JFNjYWxlPzogbnVtYmVyO1xuXHRcdCRpc0NvbGxlY3Rpb24/OiBib29sZWFuO1xuXHR9W107XG5cdCRSZXR1cm5UeXBlOiB7XG5cdFx0JFR5cGU6IHN0cmluZztcblx0fTtcbn07XG5cbmZ1bmN0aW9uIHBhcnNlUHJvcGVydHlWYWx1ZShcblx0YW5ub3RhdGlvbk9iamVjdDogYW55LFxuXHRwcm9wZXJ0eUtleTogc3RyaW5nLFxuXHRjdXJyZW50VGFyZ2V0OiBzdHJpbmcsXG5cdGFubm90YXRpb25zTGlzdHM6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25MaXN0Pixcblx0b0NhcGFiaWxpdGllczogRW52aXJvbm1lbnRDYXBhYmlsaXRpZXNcbik6IGFueSB7XG5cdGxldCB2YWx1ZTtcblx0Y29uc3QgY3VycmVudFByb3BlcnR5VGFyZ2V0OiBzdHJpbmcgPSBgJHtjdXJyZW50VGFyZ2V0fS8ke3Byb3BlcnR5S2V5fWA7XG5cdGNvbnN0IHR5cGVPZkFubm90YXRpb24gPSB0eXBlb2YgYW5ub3RhdGlvbk9iamVjdDtcblx0aWYgKGFubm90YXRpb25PYmplY3QgPT09IG51bGwpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJOdWxsXCIsIE51bGw6IG51bGwgfTtcblx0fSBlbHNlIGlmICh0eXBlT2ZBbm5vdGF0aW9uID09PSBcInN0cmluZ1wiKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiU3RyaW5nXCIsIFN0cmluZzogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHR9IGVsc2UgaWYgKHR5cGVPZkFubm90YXRpb24gPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiQm9vbFwiLCBCb29sOiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdH0gZWxzZSBpZiAodHlwZU9mQW5ub3RhdGlvbiA9PT0gXCJudW1iZXJcIikge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkludFwiLCBJbnQ6IGFubm90YXRpb25PYmplY3QgfTtcblx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFubm90YXRpb25PYmplY3QpKSB7XG5cdFx0dmFsdWUgPSB7XG5cdFx0XHR0eXBlOiBcIkNvbGxlY3Rpb25cIixcblx0XHRcdENvbGxlY3Rpb246IGFubm90YXRpb25PYmplY3QubWFwKChzdWJBbm5vdGF0aW9uT2JqZWN0LCBzdWJBbm5vdGF0aW9uT2JqZWN0SW5kZXgpID0+XG5cdFx0XHRcdHBhcnNlQW5ub3RhdGlvbk9iamVjdChcblx0XHRcdFx0XHRzdWJBbm5vdGF0aW9uT2JqZWN0LFxuXHRcdFx0XHRcdGAke2N1cnJlbnRQcm9wZXJ0eVRhcmdldH0vJHtzdWJBbm5vdGF0aW9uT2JqZWN0SW5kZXh9YCxcblx0XHRcdFx0XHRhbm5vdGF0aW9uc0xpc3RzLFxuXHRcdFx0XHRcdG9DYXBhYmlsaXRpZXNcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdH07XG5cdFx0aWYgKGFubm90YXRpb25PYmplY3QubGVuZ3RoID4gMCkge1xuXHRcdFx0aWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkUHJvcGVydHlQYXRoXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiUHJvcGVydHlQYXRoXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkUGF0aFwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlBhdGhcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEFubm90YXRpb25QYXRoXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiQW5ub3RhdGlvblBhdGhcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRUeXBlXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiUmVjb3JkXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkSWZcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJJZlwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE9yXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiT3JcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRBbmRcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJBbmRcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRFcVwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkVxXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTmVcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJOZVwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE5vdFwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIk5vdFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEd0XCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiR3RcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRHZVwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkdlXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTHRcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJMdFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJExlXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiTGVcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRBcHBseVwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkFwcGx5XCI7XG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBhbm5vdGF0aW9uT2JqZWN0WzBdID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdC8vICRUeXBlIGlzIG9wdGlvbmFsLi4uXG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiUmVjb3JkXCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlN0cmluZ1wiO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRQYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJQYXRoXCIsIFBhdGg6IGFubm90YXRpb25PYmplY3QuJFBhdGggfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiREZWNpbWFsICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJEZWNpbWFsXCIsIERlY2ltYWw6IHBhcnNlRmxvYXQoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCkgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRQcm9wZXJ0eVBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIlByb3BlcnR5UGF0aFwiLCBQcm9wZXJ0eVBhdGg6IGFubm90YXRpb25PYmplY3QuJFByb3BlcnR5UGF0aCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0ge1xuXHRcdFx0dHlwZTogXCJOYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCIsXG5cdFx0XHROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoXG5cdFx0fTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRJZiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiSWZcIiwgSWY6IGFubm90YXRpb25PYmplY3QuJElmIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kQW5kICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJBbmRcIiwgQW5kOiBhbm5vdGF0aW9uT2JqZWN0LiRBbmQgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRPciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiT3JcIiwgT3I6IGFubm90YXRpb25PYmplY3QuJE9yIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTm90ICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJOb3RcIiwgTm90OiBhbm5vdGF0aW9uT2JqZWN0LiROb3QgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRFcSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiRXFcIiwgRXE6IGFubm90YXRpb25PYmplY3QuJEVxIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTmUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIk5lXCIsIE5lOiBhbm5vdGF0aW9uT2JqZWN0LiROZSB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEd0ICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJHdFwiLCBHdDogYW5ub3RhdGlvbk9iamVjdC4kR3QgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRHZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiR2VcIiwgR2U6IGFubm90YXRpb25PYmplY3QuJEdlIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTHQgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkx0XCIsIEx0OiBhbm5vdGF0aW9uT2JqZWN0LiRMdCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJExlICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJMZVwiLCBMZTogYW5ub3RhdGlvbk9iamVjdC4kTGUgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBcHBseSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiQXBwbHlcIiwgQXBwbHk6IGFubm90YXRpb25PYmplY3QuJEFwcGx5LCBGdW5jdGlvbjogYW5ub3RhdGlvbk9iamVjdC4kRnVuY3Rpb24gfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiQW5ub3RhdGlvblBhdGhcIiwgQW5ub3RhdGlvblBhdGg6IGFubm90YXRpb25PYmplY3QuJEFubm90YXRpb25QYXRoIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRW51bU1lbWJlciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7XG5cdFx0XHR0eXBlOiBcIkVudW1NZW1iZXJcIixcblx0XHRcdEVudW1NZW1iZXI6IGAke21hcE5hbWVUb0FsaWFzKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIuc3BsaXQoXCIvXCIpWzBdKX0vJHthbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyLnNwbGl0KFwiL1wiKVsxXX1gXG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHR2YWx1ZSA9IHtcblx0XHRcdHR5cGU6IFwiUmVjb3JkXCIsXG5cdFx0XHRSZWNvcmQ6IHBhcnNlQW5ub3RhdGlvbk9iamVjdChhbm5vdGF0aW9uT2JqZWN0LCBjdXJyZW50VGFyZ2V0LCBhbm5vdGF0aW9uc0xpc3RzLCBvQ2FwYWJpbGl0aWVzKVxuXHRcdH07XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdG5hbWU6IHByb3BlcnR5S2V5LFxuXHRcdHZhbHVlXG5cdH07XG59XG5mdW5jdGlvbiBtYXBOYW1lVG9BbGlhcyhhbm5vdGF0aW9uTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcblx0bGV0IFtwYXRoUGFydCwgYW5ub1BhcnRdID0gYW5ub3RhdGlvbk5hbWUuc3BsaXQoXCJAXCIpO1xuXHRpZiAoIWFubm9QYXJ0KSB7XG5cdFx0YW5ub1BhcnQgPSBwYXRoUGFydDtcblx0XHRwYXRoUGFydCA9IFwiXCI7XG5cdH0gZWxzZSB7XG5cdFx0cGF0aFBhcnQgKz0gXCJAXCI7XG5cdH1cblx0Y29uc3QgbGFzdERvdCA9IGFubm9QYXJ0Lmxhc3RJbmRleE9mKFwiLlwiKTtcblx0cmV0dXJuIGAke3BhdGhQYXJ0ICsgVk9DQUJVTEFSWV9BTElBU1thbm5vUGFydC5zdWJzdHIoMCwgbGFzdERvdCldfS4ke2Fubm9QYXJ0LnN1YnN0cihsYXN0RG90ICsgMSl9YDtcbn1cbmZ1bmN0aW9uIHBhcnNlQW5ub3RhdGlvbk9iamVjdChcblx0YW5ub3RhdGlvbk9iamVjdDogYW55LFxuXHRjdXJyZW50T2JqZWN0VGFyZ2V0OiBzdHJpbmcsXG5cdGFubm90YXRpb25zTGlzdHM6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25MaXN0Pixcblx0b0NhcGFiaWxpdGllczogRW52aXJvbm1lbnRDYXBhYmlsaXRpZXNcbik6IEV4cHJlc3Npb24gfCBBbm5vdGF0aW9uUmVjb3JkIHwgQW5ub3RhdGlvbiB7XG5cdGxldCBwYXJzZWRBbm5vdGF0aW9uT2JqZWN0OiBhbnkgPSB7fTtcblx0Y29uc3QgdHlwZU9mT2JqZWN0ID0gdHlwZW9mIGFubm90YXRpb25PYmplY3Q7XG5cdGlmIChhbm5vdGF0aW9uT2JqZWN0ID09PSBudWxsKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJOdWxsXCIsIE51bGw6IG51bGwgfTtcblx0fSBlbHNlIGlmICh0eXBlT2ZPYmplY3QgPT09IFwic3RyaW5nXCIpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIlN0cmluZ1wiLCBTdHJpbmc6IGFubm90YXRpb25PYmplY3QgfTtcblx0fSBlbHNlIGlmICh0eXBlT2ZPYmplY3QgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJCb29sXCIsIEJvb2w6IGFubm90YXRpb25PYmplY3QgfTtcblx0fSBlbHNlIGlmICh0eXBlT2ZPYmplY3QgPT09IFwibnVtYmVyXCIpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkludFwiLCBJbnQ6IGFubm90YXRpb25PYmplY3QgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJBbm5vdGF0aW9uUGF0aFwiLCBBbm5vdGF0aW9uUGF0aDogYW5ub3RhdGlvbk9iamVjdC4kQW5ub3RhdGlvblBhdGggfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRQYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIlBhdGhcIiwgUGF0aDogYW5ub3RhdGlvbk9iamVjdC4kUGF0aCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJERlY2ltYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiRGVjaW1hbFwiLCBEZWNpbWFsOiBwYXJzZUZsb2F0KGFubm90YXRpb25PYmplY3QuJERlY2ltYWwpIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kUHJvcGVydHlQYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIlByb3BlcnR5UGF0aFwiLCBQcm9wZXJ0eVBhdGg6IGFubm90YXRpb25PYmplY3QuJFByb3BlcnR5UGF0aCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJElmICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIklmXCIsIElmOiBhbm5vdGF0aW9uT2JqZWN0LiRJZiB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEFuZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJBbmRcIiwgQW5kOiBhbm5vdGF0aW9uT2JqZWN0LiRBbmQgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRPciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJPclwiLCBPcjogYW5ub3RhdGlvbk9iamVjdC4kT3IgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiROb3QgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiTm90XCIsIE5vdDogYW5ub3RhdGlvbk9iamVjdC4kTm90IH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRXEgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiRXFcIiwgRXE6IGFubm90YXRpb25PYmplY3QuJEVxIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTmUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiTmVcIiwgTmU6IGFubm90YXRpb25PYmplY3QuJE5lIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kR3QgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiR3RcIiwgR3Q6IGFubm90YXRpb25PYmplY3QuJEd0IH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kR2UgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiR2VcIiwgR2U6IGFubm90YXRpb25PYmplY3QuJEdlIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTHQgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiTHRcIiwgTHQ6IGFubm90YXRpb25PYmplY3QuJEx0IH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiTGVcIiwgTGU6IGFubm90YXRpb25PYmplY3QuJExlIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kQXBwbHkgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiQXBwbHlcIiwgQXBwbHk6IGFubm90YXRpb25PYmplY3QuJEFwcGx5LCBGdW5jdGlvbjogYW5ub3RhdGlvbk9iamVjdC4kRnVuY3Rpb24gfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0ge1xuXHRcdFx0dHlwZTogXCJOYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCIsXG5cdFx0XHROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoXG5cdFx0fTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0ge1xuXHRcdFx0dHlwZTogXCJFbnVtTWVtYmVyXCIsXG5cdFx0XHRFbnVtTWVtYmVyOiBgJHttYXBOYW1lVG9BbGlhcyhhbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyLnNwbGl0KFwiL1wiKVswXSl9LyR7YW5ub3RhdGlvbk9iamVjdC4kRW51bU1lbWJlci5zcGxpdChcIi9cIilbMV19YFxuXHRcdH07XG5cdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhbm5vdGF0aW9uT2JqZWN0KSkge1xuXHRcdGNvbnN0IHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uID0gcGFyc2VkQW5ub3RhdGlvbk9iamVjdDtcblx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uID0gYW5ub3RhdGlvbk9iamVjdC5tYXAoKHN1YkFubm90YXRpb25PYmplY3QsIHN1YkFubm90YXRpb25JbmRleCkgPT5cblx0XHRcdHBhcnNlQW5ub3RhdGlvbk9iamVjdChzdWJBbm5vdGF0aW9uT2JqZWN0LCBgJHtjdXJyZW50T2JqZWN0VGFyZ2V0fS8ke3N1YkFubm90YXRpb25JbmRleH1gLCBhbm5vdGF0aW9uc0xpc3RzLCBvQ2FwYWJpbGl0aWVzKVxuXHRcdCk7XG5cdFx0aWYgKGFubm90YXRpb25PYmplY3QubGVuZ3RoID4gMCkge1xuXHRcdFx0aWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkUHJvcGVydHlQYXRoXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiUHJvcGVydHlQYXRoXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkUGF0aFwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIlBhdGhcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEFubm90YXRpb25QYXRoXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiQW5ub3RhdGlvblBhdGhcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRUeXBlXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiUmVjb3JkXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkSWZcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJJZlwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEFuZFwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIkFuZFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE9yXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiT3JcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRFcVwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIkVxXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTmVcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJOZVwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE5vdFwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIk5vdFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEd0XCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiR3RcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRHZVwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIkdlXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTHRcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJMdFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJExlXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiTGVcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRBcHBseVwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIkFwcGx5XCI7XG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBhbm5vdGF0aW9uT2JqZWN0WzBdID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiUmVjb3JkXCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIlN0cmluZ1wiO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdC4kVHlwZSkge1xuXHRcdFx0Y29uc3QgdHlwZVZhbHVlID0gYW5ub3RhdGlvbk9iamVjdC4kVHlwZTtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudHlwZSA9IHR5cGVWYWx1ZTsgLy9gJHt0eXBlQWxpYXN9LiR7dHlwZVRlcm19YDtcblx0XHR9XG5cdFx0Y29uc3QgcHJvcGVydHlWYWx1ZXM6IGFueSA9IFtdO1xuXHRcdE9iamVjdC5rZXlzKGFubm90YXRpb25PYmplY3QpLmZvckVhY2goKHByb3BlcnR5S2V5KSA9PiB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiRUeXBlXCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJElmXCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJEFwcGx5XCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJEFuZFwiICYmXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiRPclwiICYmXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiROZVwiICYmXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiRHdFwiICYmXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiRHZVwiICYmXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiRMdFwiICYmXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiRMZVwiICYmXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiROb3RcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkRXFcIiAmJlxuXHRcdFx0XHQhcHJvcGVydHlLZXkuc3RhcnRzV2l0aChcIkBcIilcblx0XHRcdCkge1xuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlcy5wdXNoKFxuXHRcdFx0XHRcdHBhcnNlUHJvcGVydHlWYWx1ZShhbm5vdGF0aW9uT2JqZWN0W3Byb3BlcnR5S2V5XSwgcHJvcGVydHlLZXksIGN1cnJlbnRPYmplY3RUYXJnZXQsIGFubm90YXRpb25zTGlzdHMsIG9DYXBhYmlsaXRpZXMpXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2UgaWYgKHByb3BlcnR5S2V5LnN0YXJ0c1dpdGgoXCJAXCIpKSB7XG5cdFx0XHRcdC8vIEFubm90YXRpb24gb2YgYW5ub3RhdGlvblxuXHRcdFx0XHRjcmVhdGVBbm5vdGF0aW9uTGlzdHMoXG5cdFx0XHRcdFx0eyBbcHJvcGVydHlLZXldOiBhbm5vdGF0aW9uT2JqZWN0W3Byb3BlcnR5S2V5XSB9LFxuXHRcdFx0XHRcdGN1cnJlbnRPYmplY3RUYXJnZXQsXG5cdFx0XHRcdFx0YW5ub3RhdGlvbnNMaXN0cyxcblx0XHRcdFx0XHRvQ2FwYWJpbGl0aWVzXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5wcm9wZXJ0eVZhbHVlcyA9IHByb3BlcnR5VmFsdWVzO1xuXHR9XG5cdHJldHVybiBwYXJzZWRBbm5vdGF0aW9uT2JqZWN0O1xufVxuZnVuY3Rpb24gZ2V0T3JDcmVhdGVBbm5vdGF0aW9uTGlzdCh0YXJnZXQ6IHN0cmluZywgYW5ub3RhdGlvbnNMaXN0czogUmVjb3JkPHN0cmluZywgQW5ub3RhdGlvbkxpc3Q+KTogQW5ub3RhdGlvbkxpc3Qge1xuXHRpZiAoIWFubm90YXRpb25zTGlzdHMuaGFzT3duUHJvcGVydHkodGFyZ2V0KSkge1xuXHRcdGFubm90YXRpb25zTGlzdHNbdGFyZ2V0XSA9IHtcblx0XHRcdHRhcmdldDogdGFyZ2V0LFxuXHRcdFx0YW5ub3RhdGlvbnM6IFtdXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gYW5ub3RhdGlvbnNMaXN0c1t0YXJnZXRdO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVSZWZlcmVuY2VGYWNldElkKHJlZmVyZW5jZUZhY2V0OiBhbnkpIHtcblx0Y29uc3QgaWQgPSByZWZlcmVuY2VGYWNldC5JRCA/PyByZWZlcmVuY2VGYWNldC5UYXJnZXQuJEFubm90YXRpb25QYXRoO1xuXHRyZXR1cm4gaWQgPyBwcmVwYXJlSWQoaWQpIDogaWQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNoYXJ0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbk9iamVjdDogYW55KSB7XG5cdHJldHVybiBhbm5vdGF0aW9uT2JqZWN0LmZpbHRlcigob1JlY29yZDogYW55KSA9PiB7XG5cdFx0aWYgKG9SZWNvcmQuVGFyZ2V0ICYmIG9SZWNvcmQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0cmV0dXJuIG9SZWNvcmQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKGBAJHtVSUFubm90YXRpb25UZXJtcy5DaGFydH1gKSA9PT0gLTE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUlCTkFubm90YXRpb25zKGFubm90YXRpb25PYmplY3Q6IGFueSkge1xuXHRyZXR1cm4gYW5ub3RhdGlvbk9iamVjdC5maWx0ZXIoKG9SZWNvcmQ6IGFueSkgPT4ge1xuXHRcdHJldHVybiBvUmVjb3JkLiRUeXBlICE9PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb247XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVzZW50YXRpb25WYXJpYW50KGFubm90YXRpb25PYmplY3Q6IGFueSkge1xuXHRyZXR1cm4gYW5ub3RhdGlvbk9iamVjdC5maWx0ZXIoKG9SZWNvcmQ6IGFueSkgPT4ge1xuXHRcdHJldHVybiBvUmVjb3JkLiRBbm5vdGF0aW9uUGF0aCAhPT0gYEAke1VJQW5ub3RhdGlvblRlcm1zLkNoYXJ0fWA7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBbm5vdGF0aW9uTGlzdHMoXG5cdGFubm90YXRpb25PYmplY3RzOiBhbnksXG5cdGFubm90YXRpb25UYXJnZXQ6IHN0cmluZyxcblx0YW5ub3RhdGlvbkxpc3RzOiBSZWNvcmQ8c3RyaW5nLCBBbm5vdGF0aW9uTGlzdD4sXG5cdG9DYXBhYmlsaXRpZXM6IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzXG4pIHtcblx0aWYgKE9iamVjdC5rZXlzKGFubm90YXRpb25PYmplY3RzKS5sZW5ndGggPT09IDApIHtcblx0XHRyZXR1cm47XG5cdH1cblx0Y29uc3Qgb3V0QW5ub3RhdGlvbk9iamVjdCA9IGdldE9yQ3JlYXRlQW5ub3RhdGlvbkxpc3QoYW5ub3RhdGlvblRhcmdldCwgYW5ub3RhdGlvbkxpc3RzKTtcblx0aWYgKCFvQ2FwYWJpbGl0aWVzLk1pY3JvQ2hhcnQpIHtcblx0XHRkZWxldGUgYW5ub3RhdGlvbk9iamVjdHNbYEAke1VJQW5ub3RhdGlvblRlcm1zLkNoYXJ0fWBdO1xuXHR9XG5cblx0Zm9yIChjb25zdCBhbm5vdGF0aW9uT2JqZWN0S2V5IGluIGFubm90YXRpb25PYmplY3RzKSB7XG5cdFx0bGV0IGFubm90YXRpb25LZXkgPSBhbm5vdGF0aW9uT2JqZWN0S2V5O1xuXHRcdGxldCBhbm5vdGF0aW9uT2JqZWN0ID0gYW5ub3RhdGlvbk9iamVjdHNbYW5ub3RhdGlvbktleV07XG5cdFx0c3dpdGNoIChhbm5vdGF0aW9uS2V5KSB7XG5cdFx0XHRjYXNlIGBAJHtVSUFubm90YXRpb25UZXJtcy5IZWFkZXJGYWNldHN9YDpcblx0XHRcdFx0aWYgKCFvQ2FwYWJpbGl0aWVzLk1pY3JvQ2hhcnQpIHtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0ID0gcmVtb3ZlQ2hhcnRBbm5vdGF0aW9ucyhhbm5vdGF0aW9uT2JqZWN0KTtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1thbm5vdGF0aW9uS2V5XSA9IGFubm90YXRpb25PYmplY3Q7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIGBAJHtVSUFubm90YXRpb25UZXJtcy5JZGVudGlmaWNhdGlvbn1gOlxuXHRcdFx0XHRpZiAoIW9DYXBhYmlsaXRpZXMuSW50ZW50QmFzZWROYXZpZ2F0aW9uKSB7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdCA9IHJlbW92ZUlCTkFubm90YXRpb25zKGFubm90YXRpb25PYmplY3QpO1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3RzW2Fubm90YXRpb25LZXldID0gYW5ub3RhdGlvbk9iamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgYEAke1VJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtfWA6XG5cdFx0XHRcdGlmICghb0NhcGFiaWxpdGllcy5JbnRlbnRCYXNlZE5hdmlnYXRpb24pIHtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0ID0gcmVtb3ZlSUJOQW5ub3RhdGlvbnMoYW5ub3RhdGlvbk9iamVjdCk7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdHNbYW5ub3RhdGlvbktleV0gPSBhbm5vdGF0aW9uT2JqZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICghb0NhcGFiaWxpdGllcy5NaWNyb0NoYXJ0KSB7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdCA9IHJlbW92ZUNoYXJ0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbk9iamVjdCk7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdHNbYW5ub3RhdGlvbktleV0gPSBhbm5vdGF0aW9uT2JqZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuRmllbGRHcm91cH1gOlxuXHRcdFx0XHRpZiAoIW9DYXBhYmlsaXRpZXMuSW50ZW50QmFzZWROYXZpZ2F0aW9uKSB7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdC5EYXRhID0gcmVtb3ZlSUJOQW5ub3RhdGlvbnMoYW5ub3RhdGlvbk9iamVjdC5EYXRhKTtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1thbm5vdGF0aW9uS2V5XSA9IGFubm90YXRpb25PYmplY3Q7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCFvQ2FwYWJpbGl0aWVzLk1pY3JvQ2hhcnQpIHtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0LkRhdGEgPSByZW1vdmVDaGFydEFubm90YXRpb25zKGFubm90YXRpb25PYmplY3QuRGF0YSk7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdHNbYW5ub3RhdGlvbktleV0gPSBhbm5vdGF0aW9uT2JqZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuUHJlc2VudGF0aW9uVmFyaWFudH1gOlxuXHRcdFx0XHRpZiAoIW9DYXBhYmlsaXRpZXMuQ2hhcnQgJiYgYW5ub3RhdGlvbk9iamVjdC5WaXN1YWxpemF0aW9ucykge1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3QuVmlzdWFsaXphdGlvbnMgPSBoYW5kbGVQcmVzZW50YXRpb25WYXJpYW50KGFubm90YXRpb25PYmplY3QuVmlzdWFsaXphdGlvbnMpO1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3RzW2Fubm90YXRpb25LZXldID0gYW5ub3RhdGlvbk9iamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgYEBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290YDpcblx0XHRcdFx0Ly8gVGhpcyBzY2VuYXJpbyBpcyBuZWVkZWQgZm9yIGVuYWJsaW5nIHNlbWFudGljIGZpbHRlcmluZyBvbiBEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS1maWx0ZXJzLiBBcyBvZiBub3cgdGhlIFNpbmdsZVJhbmdlIGFubm90YXRpb24gaXMgcmVhZCBieSB0aGVcblx0XHRcdFx0Ly8gRmllbGRIZWxwZXIsIHdoaWNoIHNob3VsZCBub3QgaW5jbHVkZSBhbnkgcHJvcGVydHlzcGVjaWZpYyBsb2dpYy4gV2Ugd2lsbCByZW1vdmUgdGhpcyBvbmNlIHRoZSBGaWVsZEhlbHBlciByZWNlaXZlcyB0aGUgU2luZ2xlUmFuZ2UgZGF0YSBmcm9tXG5cdFx0XHRcdC8vIHRoZSBjb252ZXJ0ZXIgb3IgaGF2aW5nIGl0IHNldCBpcyBubyBsb25nZXIgYSBwcmVyZXF1aXNpdGUgZm9yIHRoZSBzZW1hbnRpYyBmaWx0ZXJpbmcuXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1tgQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zYF0gJiZcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1tgQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zYF0uRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucz8ubGVuZ3RoXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdCFhbm5vdGF0aW9uT2JqZWN0c1tgQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zYF0uRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucy5zb21lKFxuXHRcdFx0XHRcdFx0XHQoRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9uOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9uPy5Qcm9wZXJ0eT8uJFByb3BlcnR5UGF0aC5pbmNsdWRlcyhcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhXCIpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1tgQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zYF0uRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucy5wdXNoKFxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0JFR5cGU6IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25UeXBlXCIsXG5cdFx0XHRcdFx0XHRcdFx0QWxsb3dlZEV4cHJlc3Npb25zOiBcIlNpbmdsZVJhbmdlXCIsXG5cdFx0XHRcdFx0XHRcdFx0UHJvcGVydHk6IHtcblx0XHRcdFx0XHRcdFx0XHRcdCRQcm9wZXJ0eVBhdGg6IFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvQ3JlYXRpb25EYXRlVGltZVwiXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0JFR5cGU6IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25UeXBlXCIsXG5cdFx0XHRcdFx0XHRcdFx0QWxsb3dlZEV4cHJlc3Npb25zOiBcIlNpbmdsZVJhbmdlXCIsXG5cdFx0XHRcdFx0XHRcdFx0UHJvcGVydHk6IHtcblx0XHRcdFx0XHRcdFx0XHRcdCRQcm9wZXJ0eVBhdGg6IFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvTGFzdENoYW5nZURhdGVUaW1lXCJcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0bGV0IGN1cnJlbnRPdXRBbm5vdGF0aW9uT2JqZWN0ID0gb3V0QW5ub3RhdGlvbk9iamVjdDtcblxuXHRcdC8vIENoZWNrIGZvciBhbm5vdGF0aW9uIG9mIGFubm90YXRpb25cblx0XHRjb25zdCBhbm5vdGF0aW9uT2ZBbm5vdGF0aW9uU3BsaXQgPSBhbm5vdGF0aW9uS2V5LnNwbGl0KFwiQFwiKTtcblx0XHRpZiAoYW5ub3RhdGlvbk9mQW5ub3RhdGlvblNwbGl0Lmxlbmd0aCA+IDIpIHtcblx0XHRcdGN1cnJlbnRPdXRBbm5vdGF0aW9uT2JqZWN0ID0gZ2V0T3JDcmVhdGVBbm5vdGF0aW9uTGlzdChcblx0XHRcdFx0YCR7YW5ub3RhdGlvblRhcmdldH1AJHthbm5vdGF0aW9uT2ZBbm5vdGF0aW9uU3BsaXRbMV19YCxcblx0XHRcdFx0YW5ub3RhdGlvbkxpc3RzXG5cdFx0XHQpO1xuXHRcdFx0YW5ub3RhdGlvbktleSA9IGFubm90YXRpb25PZkFubm90YXRpb25TcGxpdFsyXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YW5ub3RhdGlvbktleSA9IGFubm90YXRpb25PZkFubm90YXRpb25TcGxpdFsxXTtcblx0XHR9XG5cblx0XHRjb25zdCBhbm5vdGF0aW9uUXVhbGlmaWVyU3BsaXQgPSBhbm5vdGF0aW9uS2V5LnNwbGl0KFwiI1wiKTtcblx0XHRjb25zdCBxdWFsaWZpZXIgPSBhbm5vdGF0aW9uUXVhbGlmaWVyU3BsaXRbMV07XG5cdFx0YW5ub3RhdGlvbktleSA9IGFubm90YXRpb25RdWFsaWZpZXJTcGxpdFswXTtcblxuXHRcdGNvbnN0IHBhcnNlZEFubm90YXRpb25PYmplY3Q6IGFueSA9IHtcblx0XHRcdHRlcm06IGFubm90YXRpb25LZXksXG5cdFx0XHRxdWFsaWZpZXI6IHF1YWxpZmllclxuXHRcdH07XG5cdFx0bGV0IGN1cnJlbnRBbm5vdGF0aW9uVGFyZ2V0ID0gYCR7YW5ub3RhdGlvblRhcmdldH1AJHtwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnRlcm19YDtcblx0XHRpZiAocXVhbGlmaWVyKSB7XG5cdFx0XHRjdXJyZW50QW5ub3RhdGlvblRhcmdldCArPSBgIyR7cXVhbGlmaWVyfWA7XG5cdFx0fVxuXHRcdGxldCBpc0NvbGxlY3Rpb24gPSBmYWxzZTtcblx0XHRjb25zdCB0eXBlb2ZBbm5vdGF0aW9uID0gdHlwZW9mIGFubm90YXRpb25PYmplY3Q7XG5cdFx0aWYgKGFubm90YXRpb25PYmplY3QgPT09IG51bGwpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiTnVsbFwiIH07XG5cdFx0fSBlbHNlIGlmICh0eXBlb2ZBbm5vdGF0aW9uID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIlN0cmluZ1wiLCBTdHJpbmc6IGFubm90YXRpb25PYmplY3QgfTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZkFubm90YXRpb24gPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkJvb2xcIiwgQm9vbDogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mQW5ub3RhdGlvbiA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJJbnRcIiwgSW50OiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRJZiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIklmXCIsIElmOiBhbm5vdGF0aW9uT2JqZWN0LiRJZiB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kQW5kICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiQW5kXCIsIEFuZDogYW5ub3RhdGlvbk9iamVjdC4kQW5kIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRPciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIk9yXCIsIE9yOiBhbm5vdGF0aW9uT2JqZWN0LiRPciB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTm90ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiTm90XCIsIE5vdDogYW5ub3RhdGlvbk9iamVjdC4kTm90IH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRFcSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkVxXCIsIEVxOiBhbm5vdGF0aW9uT2JqZWN0LiRFcSB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTmUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJOZVwiLCBOZTogYW5ub3RhdGlvbk9iamVjdC4kTmUgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEd0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiR3RcIiwgR3Q6IGFubm90YXRpb25PYmplY3QuJEd0IH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRHZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkdlXCIsIEdlOiBhbm5vdGF0aW9uT2JqZWN0LiRHZSB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTHQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJMdFwiLCBMdDogYW5ub3RhdGlvbk9iamVjdC4kTHQgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJExlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiTGVcIiwgTGU6IGFubm90YXRpb25PYmplY3QuJExlIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBcHBseSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkFwcGx5XCIsIEFwcGx5OiBhbm5vdGF0aW9uT2JqZWN0LiRBcHBseSwgRnVuY3Rpb246IGFubm90YXRpb25PYmplY3QuJEZ1bmN0aW9uIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRQYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiUGF0aFwiLCBQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRQYXRoIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0ge1xuXHRcdFx0XHR0eXBlOiBcIkFubm90YXRpb25QYXRoXCIsXG5cdFx0XHRcdEFubm90YXRpb25QYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aFxuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJERlY2ltYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJEZWNpbWFsXCIsIERlY2ltYWw6IHBhcnNlRmxvYXQoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCkgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHtcblx0XHRcdFx0dHlwZTogXCJFbnVtTWVtYmVyXCIsXG5cdFx0XHRcdEVudW1NZW1iZXI6IGAke21hcE5hbWVUb0FsaWFzKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIuc3BsaXQoXCIvXCIpWzBdKX0vJHthbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyLnNwbGl0KFwiL1wiKVsxXX1gXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhbm5vdGF0aW9uT2JqZWN0KSkge1xuXHRcdFx0aXNDb2xsZWN0aW9uID0gdHJ1ZTtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbiA9IGFubm90YXRpb25PYmplY3QubWFwKChzdWJBbm5vdGF0aW9uT2JqZWN0LCBzdWJBbm5vdGF0aW9uSW5kZXgpID0+XG5cdFx0XHRcdHBhcnNlQW5ub3RhdGlvbk9iamVjdChcblx0XHRcdFx0XHRzdWJBbm5vdGF0aW9uT2JqZWN0LFxuXHRcdFx0XHRcdGAke2N1cnJlbnRBbm5vdGF0aW9uVGFyZ2V0fS8ke3N1YkFubm90YXRpb25JbmRleH1gLFxuXHRcdFx0XHRcdGFubm90YXRpb25MaXN0cyxcblx0XHRcdFx0XHRvQ2FwYWJpbGl0aWVzXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdC5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJFByb3BlcnR5UGF0aFwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJQcm9wZXJ0eVBhdGhcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJFBhdGhcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiUGF0aFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJOYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRBbm5vdGF0aW9uUGF0aFwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJBbm5vdGF0aW9uUGF0aFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkVHlwZVwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJElmXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIklmXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRPclwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJPclwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkRXFcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiRXFcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE5lXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIk5lXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiROb3RcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiTm90XCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRHdFwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJHdFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkR2VcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiR2VcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEx0XCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIkx0XCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRMZVwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJMZVwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQW5kXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIkFuZFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQXBwbHlcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiQXBwbHlcIjtcblx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgYW5ub3RhdGlvbk9iamVjdFswXSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiU3RyaW5nXCI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgcmVjb3JkOiBBbm5vdGF0aW9uUmVjb3JkID0ge1xuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlczogW11cblx0XHRcdH07XG5cdFx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdC4kVHlwZSkge1xuXHRcdFx0XHRjb25zdCB0eXBlVmFsdWUgPSBhbm5vdGF0aW9uT2JqZWN0LiRUeXBlO1xuXHRcdFx0XHRyZWNvcmQudHlwZSA9IGAke3R5cGVWYWx1ZX1gO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgcHJvcGVydHlWYWx1ZXM6IGFueVtdID0gW107XG5cdFx0XHRmb3IgKGNvbnN0IHByb3BlcnR5S2V5IGluIGFubm90YXRpb25PYmplY3QpIHtcblx0XHRcdFx0aWYgKHByb3BlcnR5S2V5ICE9PSBcIiRUeXBlXCIgJiYgIXByb3BlcnR5S2V5LnN0YXJ0c1dpdGgoXCJAXCIpKSB7XG5cdFx0XHRcdFx0cHJvcGVydHlWYWx1ZXMucHVzaChcblx0XHRcdFx0XHRcdHBhcnNlUHJvcGVydHlWYWx1ZShcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdFtwcm9wZXJ0eUtleV0sXG5cdFx0XHRcdFx0XHRcdHByb3BlcnR5S2V5LFxuXHRcdFx0XHRcdFx0XHRjdXJyZW50QW5ub3RhdGlvblRhcmdldCxcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvbkxpc3RzLFxuXHRcdFx0XHRcdFx0XHRvQ2FwYWJpbGl0aWVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSBlbHNlIGlmIChwcm9wZXJ0eUtleS5zdGFydHNXaXRoKFwiQFwiKSkge1xuXHRcdFx0XHRcdC8vIEFubm90YXRpb24gb2YgcmVjb3JkXG5cdFx0XHRcdFx0Y3JlYXRlQW5ub3RhdGlvbkxpc3RzKFxuXHRcdFx0XHRcdFx0eyBbcHJvcGVydHlLZXldOiBhbm5vdGF0aW9uT2JqZWN0W3Byb3BlcnR5S2V5XSB9LFxuXHRcdFx0XHRcdFx0Y3VycmVudEFubm90YXRpb25UYXJnZXQsXG5cdFx0XHRcdFx0XHRhbm5vdGF0aW9uTGlzdHMsXG5cdFx0XHRcdFx0XHRvQ2FwYWJpbGl0aWVzXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmVjb3JkLnByb3BlcnR5VmFsdWVzID0gcHJvcGVydHlWYWx1ZXM7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnJlY29yZCA9IHJlY29yZDtcblx0XHR9XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5pc0NvbGxlY3Rpb24gPSBpc0NvbGxlY3Rpb247XG5cdFx0Y3VycmVudE91dEFubm90YXRpb25PYmplY3QuYW5ub3RhdGlvbnMucHVzaChwYXJzZWRBbm5vdGF0aW9uT2JqZWN0KTtcblx0fVxufVxuXG5mdW5jdGlvbiBwcmVwYXJlUHJvcGVydHkocHJvcGVydHlEZWZpbml0aW9uOiBhbnksIGVudGl0eVR5cGVPYmplY3Q6IFJhd0VudGl0eVR5cGUgfCBSYXdDb21wbGV4VHlwZSwgcHJvcGVydHlOYW1lOiBzdHJpbmcpOiBSYXdQcm9wZXJ0eSB7XG5cdHJldHVybiB7XG5cdFx0X3R5cGU6IFwiUHJvcGVydHlcIixcblx0XHRuYW1lOiBwcm9wZXJ0eU5hbWUsXG5cdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtlbnRpdHlUeXBlT2JqZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZX0vJHtwcm9wZXJ0eU5hbWV9YCxcblx0XHR0eXBlOiBwcm9wZXJ0eURlZmluaXRpb24uJFR5cGUsXG5cdFx0bWF4TGVuZ3RoOiBwcm9wZXJ0eURlZmluaXRpb24uJE1heExlbmd0aCxcblx0XHRwcmVjaXNpb246IHByb3BlcnR5RGVmaW5pdGlvbi4kUHJlY2lzaW9uLFxuXHRcdHNjYWxlOiBwcm9wZXJ0eURlZmluaXRpb24uJFNjYWxlLFxuXHRcdG51bGxhYmxlOiBwcm9wZXJ0eURlZmluaXRpb24uJE51bGxhYmxlXG5cdH07XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVOYXZpZ2F0aW9uUHJvcGVydHkoXG5cdG5hdlByb3BlcnR5RGVmaW5pdGlvbjogYW55LFxuXHRlbnRpdHlUeXBlT2JqZWN0OiBSYXdFbnRpdHlUeXBlIHwgUmF3Q29tcGxleFR5cGUsXG5cdG5hdlByb3BlcnR5TmFtZTogc3RyaW5nXG4pOiBSYXdWNE5hdmlnYXRpb25Qcm9wZXJ0eSB7XG5cdGxldCByZWZlcmVudGlhbENvbnN0cmFpbnQ6IFJlZmVyZW50aWFsQ29uc3RyYWludFtdID0gW107XG5cdGlmIChuYXZQcm9wZXJ0eURlZmluaXRpb24uJFJlZmVyZW50aWFsQ29uc3RyYWludCkge1xuXHRcdHJlZmVyZW50aWFsQ29uc3RyYWludCA9IE9iamVjdC5rZXlzKG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kUmVmZXJlbnRpYWxDb25zdHJhaW50KS5tYXAoKHNvdXJjZVByb3BlcnR5TmFtZSkgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c291cmNlVHlwZU5hbWU6IGVudGl0eVR5cGVPYmplY3QubmFtZSxcblx0XHRcdFx0c291cmNlUHJvcGVydHk6IHNvdXJjZVByb3BlcnR5TmFtZSxcblx0XHRcdFx0dGFyZ2V0VHlwZU5hbWU6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kVHlwZSxcblx0XHRcdFx0dGFyZ2V0UHJvcGVydHk6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kUmVmZXJlbnRpYWxDb25zdHJhaW50W3NvdXJjZVByb3BlcnR5TmFtZV1cblx0XHRcdH07XG5cdFx0fSk7XG5cdH1cblx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnR5OiBSYXdWNE5hdmlnYXRpb25Qcm9wZXJ0eSA9IHtcblx0XHRfdHlwZTogXCJOYXZpZ2F0aW9uUHJvcGVydHlcIixcblx0XHRuYW1lOiBuYXZQcm9wZXJ0eU5hbWUsXG5cdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtlbnRpdHlUeXBlT2JqZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZX0vJHtuYXZQcm9wZXJ0eU5hbWV9YCxcblx0XHRwYXJ0bmVyOiBuYXZQcm9wZXJ0eURlZmluaXRpb24uJFBhcnRuZXIsXG5cdFx0aXNDb2xsZWN0aW9uOiBuYXZQcm9wZXJ0eURlZmluaXRpb24uJGlzQ29sbGVjdGlvbiA/IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kaXNDb2xsZWN0aW9uIDogZmFsc2UsXG5cdFx0Y29udGFpbnNUYXJnZXQ6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kQ29udGFpbnNUYXJnZXQsXG5cdFx0dGFyZ2V0VHlwZU5hbWU6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kVHlwZSxcblx0XHRyZWZlcmVudGlhbENvbnN0cmFpbnRcblx0fTtcblxuXHRyZXR1cm4gbmF2aWdhdGlvblByb3BlcnR5O1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlRW50aXR5U2V0KGVudGl0eVNldERlZmluaXRpb246IGFueSwgZW50aXR5U2V0TmFtZTogc3RyaW5nLCBlbnRpdHlDb250YWluZXJOYW1lOiBzdHJpbmcpOiBSYXdFbnRpdHlTZXQge1xuXHRjb25zdCBlbnRpdHlTZXRPYmplY3Q6IFJhd0VudGl0eVNldCA9IHtcblx0XHRfdHlwZTogXCJFbnRpdHlTZXRcIixcblx0XHRuYW1lOiBlbnRpdHlTZXROYW1lLFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmc6IHt9LFxuXHRcdGVudGl0eVR5cGVOYW1lOiBlbnRpdHlTZXREZWZpbml0aW9uLiRUeXBlLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5Q29udGFpbmVyTmFtZX0vJHtlbnRpdHlTZXROYW1lfWBcblx0fTtcblx0cmV0dXJuIGVudGl0eVNldE9iamVjdDtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZVNpbmdsZXRvbihzaW5nbGV0b25EZWZpbml0aW9uOiBhbnksIHNpbmdsZXRvbk5hbWU6IHN0cmluZywgZW50aXR5Q29udGFpbmVyTmFtZTogc3RyaW5nKTogUmF3U2luZ2xldG9uIHtcblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJTaW5nbGV0b25cIixcblx0XHRuYW1lOiBzaW5nbGV0b25OYW1lLFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmc6IHt9LFxuXHRcdGVudGl0eVR5cGVOYW1lOiBzaW5nbGV0b25EZWZpbml0aW9uLiRUeXBlLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5Q29udGFpbmVyTmFtZX0vJHtzaW5nbGV0b25OYW1lfWAsXG5cdFx0bnVsbGFibGU6IHRydWVcblx0fTtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZUFjdGlvbkltcG9ydChhY3Rpb25JbXBvcnQ6IGFueSwgYWN0aW9uSW1wb3J0TmFtZTogc3RyaW5nLCBlbnRpdHlDb250YWluZXJOYW1lOiBzdHJpbmcpOiBSYXdBY3Rpb25JbXBvcnQge1xuXHRyZXR1cm4ge1xuXHRcdF90eXBlOiBcIkFjdGlvbkltcG9ydFwiLFxuXHRcdG5hbWU6IGFjdGlvbkltcG9ydE5hbWUsXG5cdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtlbnRpdHlDb250YWluZXJOYW1lfS8ke2FjdGlvbkltcG9ydE5hbWV9YCxcblx0XHRhY3Rpb25OYW1lOiBhY3Rpb25JbXBvcnQuJEFjdGlvblxuXHR9O1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlVHlwZURlZmluaXRpb24odHlwZURlZmluaXRpb246IGFueSwgdHlwZU5hbWU6IHN0cmluZywgbmFtZXNwYWNlUHJlZml4OiBzdHJpbmcpOiBSYXdUeXBlRGVmaW5pdGlvbiB7XG5cdGNvbnN0IHR5cGVPYmplY3Q6IFJhd1R5cGVEZWZpbml0aW9uID0ge1xuXHRcdF90eXBlOiBcIlR5cGVEZWZpbml0aW9uXCIsXG5cdFx0bmFtZTogdHlwZU5hbWUuc3Vic3RyaW5nKG5hbWVzcGFjZVByZWZpeC5sZW5ndGgpLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogdHlwZU5hbWUsXG5cdFx0dW5kZXJseWluZ1R5cGU6IHR5cGVEZWZpbml0aW9uLiRVbmRlcmx5aW5nVHlwZVxuXHR9O1xuXHRyZXR1cm4gdHlwZU9iamVjdDtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZUNvbXBsZXhUeXBlKGNvbXBsZXhUeXBlRGVmaW5pdGlvbjogYW55LCBjb21wbGV4VHlwZU5hbWU6IHN0cmluZywgbmFtZXNwYWNlUHJlZml4OiBzdHJpbmcpOiBSYXdDb21wbGV4VHlwZSB7XG5cdGNvbnN0IGNvbXBsZXhUeXBlT2JqZWN0OiBSYXdDb21wbGV4VHlwZSA9IHtcblx0XHRfdHlwZTogXCJDb21wbGV4VHlwZVwiLFxuXHRcdG5hbWU6IGNvbXBsZXhUeXBlTmFtZS5zdWJzdHJpbmcobmFtZXNwYWNlUHJlZml4Lmxlbmd0aCksXG5cdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBjb21wbGV4VHlwZU5hbWUsXG5cdFx0cHJvcGVydGllczogW10sXG5cdFx0bmF2aWdhdGlvblByb3BlcnRpZXM6IFtdXG5cdH07XG5cblx0Y29uc3QgY29tcGxleFR5cGVQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMoY29tcGxleFR5cGVEZWZpbml0aW9uKVxuXHRcdC5maWx0ZXIoKHByb3BlcnR5TmFtZU9yTm90KSA9PiB7XG5cdFx0XHRpZiAocHJvcGVydHlOYW1lT3JOb3QgIT0gXCIkS2V5XCIgJiYgcHJvcGVydHlOYW1lT3JOb3QgIT0gXCIka2luZFwiKSB7XG5cdFx0XHRcdHJldHVybiBjb21wbGV4VHlwZURlZmluaXRpb25bcHJvcGVydHlOYW1lT3JOb3RdLiRraW5kID09PSBcIlByb3BlcnR5XCI7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuc29ydCgoYSwgYikgPT4gKGEgPiBiID8gMSA6IC0xKSlcblx0XHQubWFwKChwcm9wZXJ0eU5hbWUpID0+IHtcblx0XHRcdHJldHVybiBwcmVwYXJlUHJvcGVydHkoY29tcGxleFR5cGVEZWZpbml0aW9uW3Byb3BlcnR5TmFtZV0sIGNvbXBsZXhUeXBlT2JqZWN0LCBwcm9wZXJ0eU5hbWUpO1xuXHRcdH0pO1xuXG5cdGNvbXBsZXhUeXBlT2JqZWN0LnByb3BlcnRpZXMgPSBjb21wbGV4VHlwZVByb3BlcnRpZXM7XG5cdGNvbnN0IGNvbXBsZXhUeXBlTmF2aWdhdGlvblByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhjb21wbGV4VHlwZURlZmluaXRpb24pXG5cdFx0LmZpbHRlcigocHJvcGVydHlOYW1lT3JOb3QpID0+IHtcblx0XHRcdGlmIChwcm9wZXJ0eU5hbWVPck5vdCAhPSBcIiRLZXlcIiAmJiBwcm9wZXJ0eU5hbWVPck5vdCAhPSBcIiRraW5kXCIpIHtcblx0XHRcdFx0cmV0dXJuIGNvbXBsZXhUeXBlRGVmaW5pdGlvbltwcm9wZXJ0eU5hbWVPck5vdF0uJGtpbmQgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCI7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuc29ydCgoYSwgYikgPT4gKGEgPiBiID8gMSA6IC0xKSlcblx0XHQubWFwKChuYXZQcm9wZXJ0eU5hbWUpID0+IHtcblx0XHRcdHJldHVybiBwcmVwYXJlTmF2aWdhdGlvblByb3BlcnR5KGNvbXBsZXhUeXBlRGVmaW5pdGlvbltuYXZQcm9wZXJ0eU5hbWVdLCBjb21wbGV4VHlwZU9iamVjdCwgbmF2UHJvcGVydHlOYW1lKTtcblx0XHR9KTtcblx0Y29tcGxleFR5cGVPYmplY3QubmF2aWdhdGlvblByb3BlcnRpZXMgPSBjb21wbGV4VHlwZU5hdmlnYXRpb25Qcm9wZXJ0aWVzO1xuXHRyZXR1cm4gY29tcGxleFR5cGVPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVFbnRpdHlLZXlzKGVudGl0eVR5cGVEZWZpbml0aW9uOiBhbnksIG9NZXRhTW9kZWxEYXRhOiBhbnkpOiBzdHJpbmdbXSB7XG5cdGlmICghZW50aXR5VHlwZURlZmluaXRpb24uJEtleSAmJiBlbnRpdHlUeXBlRGVmaW5pdGlvbi4kQmFzZVR5cGUpIHtcblx0XHRyZXR1cm4gcHJlcGFyZUVudGl0eUtleXMob01ldGFNb2RlbERhdGFbZW50aXR5VHlwZURlZmluaXRpb24uJEJhc2VUeXBlXSwgb01ldGFNb2RlbERhdGEpO1xuXHR9XG5cdHJldHVybiBlbnRpdHlUeXBlRGVmaW5pdGlvbi4kS2V5ID8/IFtdOyAvL2hhbmRsaW5nIG9mIGVudGl0eSB0eXBlcyB3aXRob3V0IGtleSBhcyB3ZWxsIGFzIGJhc2V0eXBlXG59XG5cbmZ1bmN0aW9uIHByZXBhcmVFbnRpdHlUeXBlKGVudGl0eVR5cGVEZWZpbml0aW9uOiBhbnksIGVudGl0eVR5cGVOYW1lOiBzdHJpbmcsIG5hbWVzcGFjZVByZWZpeDogc3RyaW5nLCBtZXRhTW9kZWxEYXRhOiBhbnkpOiBSYXdFbnRpdHlUeXBlIHtcblx0Y29uc3QgZW50aXR5VHlwZTogUmF3RW50aXR5VHlwZSA9IHtcblx0XHRfdHlwZTogXCJFbnRpdHlUeXBlXCIsXG5cdFx0bmFtZTogZW50aXR5VHlwZU5hbWUuc3Vic3RyaW5nKG5hbWVzcGFjZVByZWZpeC5sZW5ndGgpLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogZW50aXR5VHlwZU5hbWUsXG5cdFx0a2V5czogW10sXG5cdFx0ZW50aXR5UHJvcGVydGllczogW10sXG5cdFx0bmF2aWdhdGlvblByb3BlcnRpZXM6IFtdLFxuXHRcdGFjdGlvbnM6IHt9XG5cdH07XG5cblx0Zm9yIChjb25zdCBrZXkgaW4gZW50aXR5VHlwZURlZmluaXRpb24pIHtcblx0XHRjb25zdCB2YWx1ZSA9IGVudGl0eVR5cGVEZWZpbml0aW9uW2tleV07XG5cblx0XHRzd2l0Y2ggKHZhbHVlLiRraW5kKSB7XG5cdFx0XHRjYXNlIFwiUHJvcGVydHlcIjpcblx0XHRcdFx0Y29uc3QgcHJvcGVydHkgPSBwcmVwYXJlUHJvcGVydHkodmFsdWUsIGVudGl0eVR5cGUsIGtleSk7XG5cdFx0XHRcdGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5wdXNoKHByb3BlcnR5KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTmF2aWdhdGlvblByb3BlcnR5XCI6XG5cdFx0XHRcdGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0eSA9IHByZXBhcmVOYXZpZ2F0aW9uUHJvcGVydHkodmFsdWUsIGVudGl0eVR5cGUsIGtleSk7XG5cdFx0XHRcdGVudGl0eVR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMucHVzaChuYXZpZ2F0aW9uUHJvcGVydHkpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRlbnRpdHlUeXBlLmtleXMgPSBwcmVwYXJlRW50aXR5S2V5cyhlbnRpdHlUeXBlRGVmaW5pdGlvbiwgbWV0YU1vZGVsRGF0YSlcblx0XHQubWFwKChlbnRpdHlLZXkpID0+IGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5maW5kKChwcm9wZXJ0eSkgPT4gcHJvcGVydHkubmFtZSA9PT0gZW50aXR5S2V5KSlcblx0XHQuZmlsdGVyKChwcm9wZXJ0eSkgPT4gcHJvcGVydHkgIT09IHVuZGVmaW5lZCkgYXMgUmF3RW50aXR5VHlwZVtcImtleXNcIl07XG5cblx0Ly8gQ2hlY2sgaWYgdGhlcmUgYXJlIGZpbHRlciBmYWNldHMgZGVmaW5lZCBmb3IgdGhlIGVudGl0eVR5cGUgYW5kIGlmIHllcywgY2hlY2sgaWYgYWxsIG9mIHRoZW0gaGF2ZSBhbiBJRFxuXHQvLyBUaGUgSUQgaXMgb3B0aW9uYWwsIGJ1dCBpdCBpcyBpbnRlcm5hbGx5IHRha2VuIGZvciBncm91cGluZyBmaWx0ZXIgZmllbGRzIGFuZCBpZiBpdCdzIG5vdCBwcmVzZW50XG5cdC8vIGEgZmFsbGJhY2sgSUQgbmVlZHMgdG8gYmUgZ2VuZXJhdGVkIGhlcmUuXG5cdG1ldGFNb2RlbERhdGEuJEFubm90YXRpb25zW2VudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lXT8uW2BAJHtVSUFubm90YXRpb25UZXJtcy5GaWx0ZXJGYWNldHN9YF0/LmZvckVhY2goXG5cdFx0KGZpbHRlckZhY2V0QW5ub3RhdGlvbjogYW55KSA9PiB7XG5cdFx0XHRmaWx0ZXJGYWNldEFubm90YXRpb24uSUQgPSBjcmVhdGVSZWZlcmVuY2VGYWNldElkKGZpbHRlckZhY2V0QW5ub3RhdGlvbik7XG5cdFx0fVxuXHQpO1xuXG5cdGZvciAoY29uc3QgZW50aXR5UHJvcGVydHkgb2YgZW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzKSB7XG5cdFx0aWYgKCFtZXRhTW9kZWxEYXRhLiRBbm5vdGF0aW9uc1tlbnRpdHlQcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWVdKSB7XG5cdFx0XHRtZXRhTW9kZWxEYXRhLiRBbm5vdGF0aW9uc1tlbnRpdHlQcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWVdID0ge307XG5cdFx0fVxuXHRcdGlmICghbWV0YU1vZGVsRGF0YS4kQW5ub3RhdGlvbnNbZW50aXR5UHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lXVtgQCR7VUlBbm5vdGF0aW9uVGVybXMuRGF0YUZpZWxkRGVmYXVsdH1gXSkge1xuXHRcdFx0bWV0YU1vZGVsRGF0YS4kQW5ub3RhdGlvbnNbZW50aXR5UHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lXVtgQCR7VUlBbm5vdGF0aW9uVGVybXMuRGF0YUZpZWxkRGVmYXVsdH1gXSA9IHtcblx0XHRcdFx0JFR5cGU6IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZCxcblx0XHRcdFx0VmFsdWU6IHsgJFBhdGg6IGVudGl0eVByb3BlcnR5Lm5hbWUgfVxuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZW50aXR5VHlwZTtcbn1cbmZ1bmN0aW9uIHByZXBhcmVBY3Rpb24oYWN0aW9uTmFtZTogc3RyaW5nLCBhY3Rpb25SYXdEYXRhOiBNZXRhTW9kZWxBY3Rpb24sIG5hbWVzcGFjZVByZWZpeDogc3RyaW5nKTogUmF3QWN0aW9uIHtcblx0bGV0IGFjdGlvbkVudGl0eVR5cGUgPSBcIlwiO1xuXHRsZXQgYWN0aW9uRlFOID0gYWN0aW9uTmFtZTtcblxuXHRpZiAoYWN0aW9uUmF3RGF0YS4kSXNCb3VuZCkge1xuXHRcdGNvbnN0IGJpbmRpbmdQYXJhbWV0ZXIgPSBhY3Rpb25SYXdEYXRhLiRQYXJhbWV0ZXJbMF07XG5cdFx0YWN0aW9uRW50aXR5VHlwZSA9IGJpbmRpbmdQYXJhbWV0ZXIuJFR5cGU7XG5cdFx0aWYgKGJpbmRpbmdQYXJhbWV0ZXIuJGlzQ29sbGVjdGlvbiA9PT0gdHJ1ZSkge1xuXHRcdFx0YWN0aW9uRlFOID0gYCR7YWN0aW9uTmFtZX0oQ29sbGVjdGlvbigke2FjdGlvbkVudGl0eVR5cGV9KSlgO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhY3Rpb25GUU4gPSBgJHthY3Rpb25OYW1lfSgke2FjdGlvbkVudGl0eVR5cGV9KWA7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgcGFyYW1ldGVycyA9IGFjdGlvblJhd0RhdGEuJFBhcmFtZXRlciA/PyBbXTtcblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJBY3Rpb25cIixcblx0XHRuYW1lOiBhY3Rpb25OYW1lLnN1YnN0cmluZyhuYW1lc3BhY2VQcmVmaXgubGVuZ3RoKSxcblx0XHRmdWxseVF1YWxpZmllZE5hbWU6IGFjdGlvbkZRTixcblx0XHRpc0JvdW5kOiBhY3Rpb25SYXdEYXRhLiRJc0JvdW5kID8/IGZhbHNlLFxuXHRcdGlzRnVuY3Rpb246IGFjdGlvblJhd0RhdGEuJGtpbmQgPT09IFwiRnVuY3Rpb25cIixcblx0XHRzb3VyY2VUeXBlOiBhY3Rpb25FbnRpdHlUeXBlLFxuXHRcdHJldHVyblR5cGU6IGFjdGlvblJhd0RhdGEuJFJldHVyblR5cGU/LiRUeXBlID8/IFwiXCIsXG5cdFx0cGFyYW1ldGVyczogcGFyYW1ldGVycy5tYXAoKHBhcmFtKSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRfdHlwZTogXCJBY3Rpb25QYXJhbWV0ZXJcIixcblx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHthY3Rpb25GUU59LyR7cGFyYW0uJE5hbWV9YCxcblx0XHRcdFx0aXNDb2xsZWN0aW9uOiBwYXJhbS4kaXNDb2xsZWN0aW9uID8/IGZhbHNlLFxuXHRcdFx0XHRuYW1lOiBwYXJhbS4kTmFtZSxcblx0XHRcdFx0dHlwZTogcGFyYW0uJFR5cGUsXG5cdFx0XHRcdG51bGxhYmxlOiBwYXJhbS4kTnVsbGFibGUgPz8gZmFsc2UsXG5cdFx0XHRcdG1heExlbmd0aDogcGFyYW0uJE1heExlbmd0aCxcblx0XHRcdFx0cHJlY2lzaW9uOiBwYXJhbS4kUHJlY2lzaW9uLFxuXHRcdFx0XHRzY2FsZTogcGFyYW0uJFNjYWxlXG5cdFx0XHR9O1xuXHRcdH0pXG5cdH07XG59XG5cbmZ1bmN0aW9uIHBhcnNlRW50aXR5Q29udGFpbmVyKFxuXHRuYW1lc3BhY2VQcmVmaXg6IHN0cmluZyxcblx0ZW50aXR5Q29udGFpbmVyTmFtZTogc3RyaW5nLFxuXHRlbnRpdHlDb250YWluZXJNZXRhZGF0YTogUmVjb3JkPHN0cmluZywgYW55Pixcblx0c2NoZW1hOiBSYXdTY2hlbWFcbikge1xuXHRzY2hlbWEuZW50aXR5Q29udGFpbmVyID0ge1xuXHRcdF90eXBlOiBcIkVudGl0eUNvbnRhaW5lclwiLFxuXHRcdG5hbWU6IGVudGl0eUNvbnRhaW5lck5hbWUuc3Vic3RyaW5nKG5hbWVzcGFjZVByZWZpeC5sZW5ndGgpLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogZW50aXR5Q29udGFpbmVyTmFtZVxuXHR9O1xuXG5cdGZvciAoY29uc3QgZWxlbWVudE5hbWUgaW4gZW50aXR5Q29udGFpbmVyTWV0YWRhdGEpIHtcblx0XHRjb25zdCBlbGVtZW50VmFsdWUgPSBlbnRpdHlDb250YWluZXJNZXRhZGF0YVtlbGVtZW50TmFtZV07XG5cdFx0c3dpdGNoIChlbGVtZW50VmFsdWUuJGtpbmQpIHtcblx0XHRcdGNhc2UgXCJFbnRpdHlTZXRcIjpcblx0XHRcdFx0c2NoZW1hLmVudGl0eVNldHMucHVzaChwcmVwYXJlRW50aXR5U2V0KGVsZW1lbnRWYWx1ZSwgZWxlbWVudE5hbWUsIGVudGl0eUNvbnRhaW5lck5hbWUpKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgXCJTaW5nbGV0b25cIjpcblx0XHRcdFx0c2NoZW1hLnNpbmdsZXRvbnMucHVzaChwcmVwYXJlU2luZ2xldG9uKGVsZW1lbnRWYWx1ZSwgZWxlbWVudE5hbWUsIGVudGl0eUNvbnRhaW5lck5hbWUpKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgXCJBY3Rpb25JbXBvcnRcIjpcblx0XHRcdFx0c2NoZW1hLmFjdGlvbkltcG9ydHMucHVzaChwcmVwYXJlQWN0aW9uSW1wb3J0KGVsZW1lbnRWYWx1ZSwgZWxlbWVudE5hbWUsIGVudGl0eUNvbnRhaW5lck5hbWUpKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0Ly8gbGluayB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBiaW5kaW5ncyAoJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcpXG5cdGZvciAoY29uc3QgZW50aXR5U2V0IG9mIHNjaGVtYS5lbnRpdHlTZXRzKSB7XG5cdFx0Y29uc3QgbmF2UHJvcGVydHlCaW5kaW5ncyA9IGVudGl0eUNvbnRhaW5lck1ldGFkYXRhW2VudGl0eVNldC5uYW1lXS4kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZztcblx0XHRpZiAobmF2UHJvcGVydHlCaW5kaW5ncykge1xuXHRcdFx0Zm9yIChjb25zdCBuYXZQcm9wTmFtZSBvZiBPYmplY3Qua2V5cyhuYXZQcm9wZXJ0eUJpbmRpbmdzKSkge1xuXHRcdFx0XHRjb25zdCB0YXJnZXRFbnRpdHlTZXQgPSBzY2hlbWEuZW50aXR5U2V0cy5maW5kKChlbnRpdHlTZXROYW1lKSA9PiBlbnRpdHlTZXROYW1lLm5hbWUgPT09IG5hdlByb3BlcnR5QmluZGluZ3NbbmF2UHJvcE5hbWVdKTtcblx0XHRcdFx0aWYgKHRhcmdldEVudGl0eVNldCkge1xuXHRcdFx0XHRcdGVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW25hdlByb3BOYW1lXSA9IHRhcmdldEVudGl0eVNldDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZUFubm90YXRpb25zKGFubm90YXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBjYXBhYmlsaXRpZXM6IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzKSB7XG5cdGNvbnN0IGFubm90YXRpb25MaXN0czogUmVjb3JkPHN0cmluZywgQW5ub3RhdGlvbkxpc3Q+ID0ge307XG5cdGZvciAoY29uc3QgdGFyZ2V0IGluIGFubm90YXRpb25zKSB7XG5cdFx0Y3JlYXRlQW5ub3RhdGlvbkxpc3RzKGFubm90YXRpb25zW3RhcmdldF0sIHRhcmdldCwgYW5ub3RhdGlvbkxpc3RzLCBjYXBhYmlsaXRpZXMpO1xuXHR9XG5cdHJldHVybiBPYmplY3QudmFsdWVzKGFubm90YXRpb25MaXN0cyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU2NoZW1hKG1ldGFNb2RlbERhdGE6IGFueSkge1xuXHQvLyBhc3N1bWluZyB0aGVyZSBpcyBvbmx5IG9uZSBzY2hlbWEvbmFtZXNwYWNlXG5cdGNvbnN0IG5hbWVzcGFjZVByZWZpeCA9IE9iamVjdC5rZXlzKG1ldGFNb2RlbERhdGEpLmZpbmQoKGtleSkgPT4gbWV0YU1vZGVsRGF0YVtrZXldLiRraW5kID09PSBcIlNjaGVtYVwiKSA/PyBcIlwiO1xuXG5cdGNvbnN0IHNjaGVtYTogUmF3U2NoZW1hID0ge1xuXHRcdG5hbWVzcGFjZTogbmFtZXNwYWNlUHJlZml4LnNsaWNlKDAsIC0xKSxcblx0XHRlbnRpdHlDb250YWluZXI6IHsgX3R5cGU6IFwiRW50aXR5Q29udGFpbmVyXCIsIG5hbWU6IFwiXCIsIGZ1bGx5UXVhbGlmaWVkTmFtZTogXCJcIiB9LFxuXHRcdGVudGl0eVNldHM6IFtdLFxuXHRcdGVudGl0eVR5cGVzOiBbXSxcblx0XHRjb21wbGV4VHlwZXM6IFtdLFxuXHRcdHR5cGVEZWZpbml0aW9uczogW10sXG5cdFx0c2luZ2xldG9uczogW10sXG5cdFx0YXNzb2NpYXRpb25zOiBbXSxcblx0XHRhc3NvY2lhdGlvblNldHM6IFtdLFxuXHRcdGFjdGlvbnM6IFtdLFxuXHRcdGFjdGlvbkltcG9ydHM6IFtdLFxuXHRcdGFubm90YXRpb25zOiB7fVxuXHR9O1xuXG5cdGNvbnN0IHBhcnNlTWV0YU1vZGVsRWxlbWVudCA9IChuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpID0+IHtcblx0XHRzd2l0Y2ggKHZhbHVlLiRraW5kKSB7XG5cdFx0XHRjYXNlIFwiRW50aXR5Q29udGFpbmVyXCI6XG5cdFx0XHRcdHBhcnNlRW50aXR5Q29udGFpbmVyKG5hbWVzcGFjZVByZWZpeCwgbmFtZSwgdmFsdWUsIHNjaGVtYSk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFwiQWN0aW9uXCI6XG5cdFx0XHRjYXNlIFwiRnVuY3Rpb25cIjpcblx0XHRcdFx0c2NoZW1hLmFjdGlvbnMucHVzaChwcmVwYXJlQWN0aW9uKG5hbWUsIHZhbHVlLCBuYW1lc3BhY2VQcmVmaXgpKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgXCJFbnRpdHlUeXBlXCI6XG5cdFx0XHRcdHNjaGVtYS5lbnRpdHlUeXBlcy5wdXNoKHByZXBhcmVFbnRpdHlUeXBlKHZhbHVlLCBuYW1lLCBuYW1lc3BhY2VQcmVmaXgsIG1ldGFNb2RlbERhdGEpKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgXCJDb21wbGV4VHlwZVwiOlxuXHRcdFx0XHRzY2hlbWEuY29tcGxleFR5cGVzLnB1c2gocHJlcGFyZUNvbXBsZXhUeXBlKHZhbHVlLCBuYW1lLCBuYW1lc3BhY2VQcmVmaXgpKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgXCJUeXBlRGVmaW5pdGlvblwiOlxuXHRcdFx0XHRzY2hlbWEudHlwZURlZmluaXRpb25zLnB1c2gocHJlcGFyZVR5cGVEZWZpbml0aW9uKHZhbHVlLCBuYW1lLCBuYW1lc3BhY2VQcmVmaXgpKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9O1xuXG5cdGZvciAoY29uc3QgZWxlbWVudE5hbWUgaW4gbWV0YU1vZGVsRGF0YSkge1xuXHRcdGNvbnN0IGVsZW1lbnRWYWx1ZSA9IG1ldGFNb2RlbERhdGFbZWxlbWVudE5hbWVdO1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoZWxlbWVudFZhbHVlKSkge1xuXHRcdFx0Ly8gdmFsdWUgY2FuIGJlIGFuIGFycmF5IGluIGNhc2Ugb2YgYWN0aW9ucyBvciBmdW5jdGlvbnNcblx0XHRcdGZvciAoY29uc3Qgc3ViRWxlbWVudFZhbHVlIG9mIGVsZW1lbnRWYWx1ZSkge1xuXHRcdFx0XHRwYXJzZU1ldGFNb2RlbEVsZW1lbnQoZWxlbWVudE5hbWUsIHN1YkVsZW1lbnRWYWx1ZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBhcnNlTWV0YU1vZGVsRWxlbWVudChlbGVtZW50TmFtZSwgZWxlbWVudFZhbHVlKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NoZW1hO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VNZXRhTW9kZWwoXG5cdG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsXG5cdGNhcGFiaWxpdGllczogRW52aXJvbm1lbnRDYXBhYmlsaXRpZXMgPSBEZWZhdWx0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXNcbik6IFJhd01ldGFkYXRhIHtcblx0Y29uc3QgcmVzdWx0OiBPbWl0PFJhd01ldGFkYXRhLCBcInNjaGVtYVwiPiA9IHtcblx0XHRpZGVudGlmaWNhdGlvbjogXCJtZXRhbW9kZWxSZXN1bHRcIixcblx0XHR2ZXJzaW9uOiBcIjQuMFwiLFxuXHRcdHJlZmVyZW5jZXM6IFtdXG5cdH07XG5cblx0Ly8gcGFyc2UgdGhlIHNjaGVtYSB3aGVuIGl0IGlzIGFjY2Vzc2VkIGZvciB0aGUgZmlyc3QgdGltZVxuXHRBbm5vdGF0aW9uQ29udmVydGVyLmxhenkocmVzdWx0IGFzIFJhd01ldGFkYXRhLCBcInNjaGVtYVwiLCAoKSA9PiB7XG5cdFx0Y29uc3QgbWV0YU1vZGVsRGF0YSA9IG1ldGFNb2RlbC5nZXRPYmplY3QoXCIvJFwiKTtcblx0XHRjb25zdCBzY2hlbWEgPSBwYXJzZVNjaGVtYShtZXRhTW9kZWxEYXRhKTtcblxuXHRcdEFubm90YXRpb25Db252ZXJ0ZXIubGF6eShzY2hlbWEuYW5ub3RhdGlvbnMsIFwibWV0YW1vZGVsUmVzdWx0XCIsICgpID0+IHBhcnNlQW5ub3RhdGlvbnMobWV0YU1vZGVsRGF0YS4kQW5ub3RhdGlvbnMsIGNhcGFiaWxpdGllcykpO1xuXG5cdFx0cmV0dXJuIHNjaGVtYTtcblx0fSk7XG5cblx0cmV0dXJuIHJlc3VsdCBhcyBSYXdNZXRhZGF0YTtcbn1cblxuY29uc3QgbU1ldGFNb2RlbE1hcDogUmVjb3JkPHN0cmluZywgQ29udmVydGVkTWV0YWRhdGE+ID0ge307XG5cbi8qKlxuICogQ29udmVydCB0aGUgT0RhdGFNZXRhTW9kZWwgaW50byBhbm90aGVyIGZvcm1hdCB0aGF0IGFsbG93IGZvciBlYXN5IG1hbmlwdWxhdGlvbiBvZiB0aGUgYW5ub3RhdGlvbnMuXG4gKlxuICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIE9EYXRhTWV0YU1vZGVsXG4gKiBAcGFyYW0gb0NhcGFiaWxpdGllcyBUaGUgY3VycmVudCBjYXBhYmlsaXRpZXNcbiAqIEByZXR1cm5zIEFuIG9iamVjdCBjb250YWluaW5nIG9iamVjdC1saWtlIGFubm90YXRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0VHlwZXMob01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIG9DYXBhYmlsaXRpZXM/OiBFbnZpcm9ubWVudENhcGFiaWxpdGllcyk6IENvbnZlcnRlZE1ldGFkYXRhIHtcblx0Y29uc3Qgc01ldGFNb2RlbElkID0gKG9NZXRhTW9kZWwgYXMgYW55KS5pZDtcblx0aWYgKCFtTWV0YU1vZGVsTWFwLmhhc093blByb3BlcnR5KHNNZXRhTW9kZWxJZCkpIHtcblx0XHRjb25zdCBwYXJzZWRPdXRwdXQgPSBwYXJzZU1ldGFNb2RlbChvTWV0YU1vZGVsLCBvQ2FwYWJpbGl0aWVzKTtcblx0XHR0cnkge1xuXHRcdFx0bU1ldGFNb2RlbE1hcFtzTWV0YU1vZGVsSWRdID0gQW5ub3RhdGlvbkNvbnZlcnRlci5jb252ZXJ0KHBhcnNlZE91dHB1dCk7XG5cdFx0fSBjYXRjaCAob0Vycm9yKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3Iob0Vycm9yIGFzIGFueSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBtTWV0YU1vZGVsTWFwW3NNZXRhTW9kZWxJZF0gYXMgYW55IGFzIENvbnZlcnRlZE1ldGFkYXRhO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udmVydGVkVHlwZXMob0NvbnRleHQ6IENvbnRleHQpIHtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkgYXMgdW5rbm93biBhcyBPRGF0YU1ldGFNb2RlbDtcblx0aWYgKCFvTWV0YU1vZGVsLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YU1ldGFNb2RlbFwiKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlRoaXMgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uIGEgT0RhdGFNZXRhTW9kZWxcIik7XG5cdH1cblx0cmV0dXJuIGNvbnZlcnRUeXBlcyhvTWV0YU1vZGVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZU1vZGVsQ2FjaGVEYXRhKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdGRlbGV0ZSBtTWV0YU1vZGVsTWFwWyhvTWV0YU1vZGVsIGFzIGFueSkuaWRdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydE1ldGFNb2RlbENvbnRleHQob01ldGFNb2RlbENvbnRleHQ6IENvbnRleHQsIGJJbmNsdWRlVmlzaXRlZE9iamVjdHM6IGJvb2xlYW4gPSBmYWxzZSk6IGFueSB7XG5cdGNvbnN0IG9Db252ZXJ0ZWRNZXRhZGF0YSA9IGNvbnZlcnRUeXBlcyhvTWV0YU1vZGVsQ29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0Y29uc3Qgc1BhdGggPSBvTWV0YU1vZGVsQ29udGV4dC5nZXRQYXRoKCk7XG5cblx0Y29uc3QgYVBhdGhTcGxpdCA9IHNQYXRoLnNwbGl0KFwiL1wiKTtcblx0bGV0IGZpcnN0UGFydCA9IGFQYXRoU3BsaXRbMV07XG5cdGxldCBiZWdpbkluZGV4ID0gMjtcblx0aWYgKG9Db252ZXJ0ZWRNZXRhZGF0YS5lbnRpdHlDb250YWluZXIuZnVsbHlRdWFsaWZpZWROYW1lID09PSBmaXJzdFBhcnQpIHtcblx0XHRmaXJzdFBhcnQgPSBhUGF0aFNwbGl0WzJdO1xuXHRcdGJlZ2luSW5kZXgrKztcblx0fVxuXHRsZXQgdGFyZ2V0RW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gPSBvQ29udmVydGVkTWV0YWRhdGEuZW50aXR5U2V0cy5maW5kKFxuXHRcdChlbnRpdHlTZXQpID0+IGVudGl0eVNldC5uYW1lID09PSBmaXJzdFBhcnRcblx0KSBhcyBFbnRpdHlTZXQ7XG5cdGlmICghdGFyZ2V0RW50aXR5U2V0KSB7XG5cdFx0dGFyZ2V0RW50aXR5U2V0ID0gb0NvbnZlcnRlZE1ldGFkYXRhLnNpbmdsZXRvbnMuZmluZCgoc2luZ2xldG9uKSA9PiBzaW5nbGV0b24ubmFtZSA9PT0gZmlyc3RQYXJ0KSBhcyBTaW5nbGV0b247XG5cdH1cblx0bGV0IHJlbGF0aXZlUGF0aCA9IGFQYXRoU3BsaXQuc2xpY2UoYmVnaW5JbmRleCkuam9pbihcIi9cIik7XG5cblx0Y29uc3QgbG9jYWxPYmplY3RzOiBhbnlbXSA9IFt0YXJnZXRFbnRpdHlTZXRdO1xuXHR3aGlsZSAocmVsYXRpdmVQYXRoICYmIHJlbGF0aXZlUGF0aC5sZW5ndGggPiAwICYmIHJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKFwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdcIikpIHtcblx0XHRsZXQgcmVsYXRpdmVTcGxpdCA9IHJlbGF0aXZlUGF0aC5zcGxpdChcIi9cIik7XG5cdFx0bGV0IGlkeCA9IDA7XG5cdFx0bGV0IGN1cnJlbnRFbnRpdHlTZXQsIHNOYXZQcm9wVG9DaGVjaztcblxuXHRcdHJlbGF0aXZlU3BsaXQgPSByZWxhdGl2ZVNwbGl0LnNsaWNlKDEpOyAvLyBSZW1vdmluZyBcIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCJcblx0XHR3aGlsZSAoIWN1cnJlbnRFbnRpdHlTZXQgJiYgcmVsYXRpdmVTcGxpdC5sZW5ndGggPiBpZHgpIHtcblx0XHRcdGlmIChyZWxhdGl2ZVNwbGl0W2lkeF0gIT09IFwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdcIikge1xuXHRcdFx0XHQvLyBGaW5kaW5nIHRoZSBjb3JyZWN0IGVudGl0eVNldCBmb3IgdGhlIG5hdmlnYWl0b24gcHJvcGVydHkgYmluZGluZyBleGFtcGxlOiBcIlNldC9fU2FsZXNPcmRlclwiXG5cdFx0XHRcdHNOYXZQcm9wVG9DaGVjayA9IHJlbGF0aXZlU3BsaXRcblx0XHRcdFx0XHQuc2xpY2UoMCwgaWR4ICsgMSlcblx0XHRcdFx0XHQuam9pbihcIi9cIilcblx0XHRcdFx0XHQucmVwbGFjZShcIi8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiLCBcIlwiKTtcblx0XHRcdFx0Y3VycmVudEVudGl0eVNldCA9IHRhcmdldEVudGl0eVNldCAmJiB0YXJnZXRFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1tzTmF2UHJvcFRvQ2hlY2tdO1xuXHRcdFx0fVxuXHRcdFx0aWR4Kys7XG5cdFx0fVxuXHRcdGlmICghY3VycmVudEVudGl0eVNldCkge1xuXHRcdFx0Ly8gRmFsbCBiYWNrIHRvIFNpbmdsZSBuYXYgcHJvcCBpZiBlbnRpdHlTZXQgaXMgbm90IGZvdW5kLlxuXHRcdFx0c05hdlByb3BUb0NoZWNrID0gcmVsYXRpdmVTcGxpdFswXTtcblx0XHR9XG5cdFx0Y29uc3QgYU5hdlByb3BzID0gc05hdlByb3BUb0NoZWNrPy5zcGxpdChcIi9cIikgfHwgW107XG5cdFx0bGV0IHRhcmdldEVudGl0eVR5cGUgPSB0YXJnZXRFbnRpdHlTZXQgJiYgdGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGU7XG5cdFx0Zm9yIChjb25zdCBzTmF2UHJvcCBvZiBhTmF2UHJvcHMpIHtcblx0XHRcdC8vIFB1c2hpbmcgYWxsIG5hdiBwcm9wcyB0byB0aGUgdmlzaXRlZCBvYmplY3RzLiBleGFtcGxlOiBcIlNldFwiLCBcIl9TYWxlc09yZGVyXCIgZm9yIFwiU2V0L19TYWxlc09yZGVyXCIoaW4gTmF2aWdhdGlvblByb3BlcnR5QmluZGluZylcblx0XHRcdGNvbnN0IHRhcmdldE5hdlByb3AgPSB0YXJnZXRFbnRpdHlUeXBlICYmIHRhcmdldEVudGl0eVR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMuZmluZCgobmF2UHJvcCkgPT4gbmF2UHJvcC5uYW1lID09PSBzTmF2UHJvcCk7XG5cdFx0XHRpZiAodGFyZ2V0TmF2UHJvcCkge1xuXHRcdFx0XHRsb2NhbE9iamVjdHMucHVzaCh0YXJnZXROYXZQcm9wKTtcblx0XHRcdFx0dGFyZ2V0RW50aXR5VHlwZSA9IHRhcmdldE5hdlByb3AudGFyZ2V0VHlwZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0YXJnZXRFbnRpdHlTZXQgPVxuXHRcdFx0KHRhcmdldEVudGl0eVNldCAmJiBjdXJyZW50RW50aXR5U2V0KSB8fCAodGFyZ2V0RW50aXR5U2V0ICYmIHRhcmdldEVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW3JlbGF0aXZlU3BsaXRbMF1dKTtcblx0XHRpZiAodGFyZ2V0RW50aXR5U2V0KSB7XG5cdFx0XHQvLyBQdXNoaW5nIHRoZSB0YXJnZXQgZW50aXR5U2V0IHRvIHZpc2l0ZWQgb2JqZWN0c1xuXHRcdFx0bG9jYWxPYmplY3RzLnB1c2godGFyZ2V0RW50aXR5U2V0KTtcblx0XHR9XG5cdFx0Ly8gUmUtY2FsY3VsYXRpbmcgdGhlIHJlbGF0aXZlIHBhdGhcblx0XHQvLyBBcyBlYWNoIG5hdmlnYXRpb24gbmFtZSBpcyBlbmNsb3NlZCBiZXR3ZWVuICckTmF2aWdhdGlvblByb3BlcnR5QmluZGluZycgYW5kICckJyAodG8gYmUgYWJsZSB0byBhY2Nlc3MgdGhlIGVudGl0eXNldCBlYXNpbHkgaW4gdGhlIG1ldGFtb2RlbClcblx0XHQvLyB3ZSBuZWVkIHRvIHJlbW92ZSB0aGUgY2xvc2luZyAnJCcgdG8gYmUgYWJsZSB0byBzd2l0Y2ggdG8gdGhlIG5leHQgbmF2aWdhdGlvblxuXHRcdHJlbGF0aXZlU3BsaXQgPSByZWxhdGl2ZVNwbGl0LnNsaWNlKGFOYXZQcm9wcy5sZW5ndGggfHwgMSk7XG5cdFx0aWYgKHJlbGF0aXZlU3BsaXQubGVuZ3RoICYmIHJlbGF0aXZlU3BsaXRbMF0gPT09IFwiJFwiKSB7XG5cdFx0XHRyZWxhdGl2ZVNwbGl0LnNoaWZ0KCk7XG5cdFx0fVxuXHRcdHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlU3BsaXQuam9pbihcIi9cIik7XG5cdH1cblx0aWYgKHJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKFwiJFR5cGVcIikpIHtcblx0XHQvLyBBcyAkVHlwZUAgaXMgYWxsb3dlZCBhcyB3ZWxsXG5cdFx0aWYgKHJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKFwiJFR5cGVAXCIpKSB7XG5cdFx0XHRyZWxhdGl2ZVBhdGggPSByZWxhdGl2ZVBhdGgucmVwbGFjZShcIiRUeXBlXCIsIFwiXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBXZSdyZSBhbnl3YXkgZ29pbmcgdG8gbG9vayBvbiB0aGUgZW50aXR5VHlwZS4uLlxuXHRcdFx0cmVsYXRpdmVQYXRoID0gYVBhdGhTcGxpdC5zbGljZSgzKS5qb2luKFwiL1wiKTtcblx0XHR9XG5cdH1cblx0aWYgKHRhcmdldEVudGl0eVNldCAmJiByZWxhdGl2ZVBhdGgubGVuZ3RoKSB7XG5cdFx0Y29uc3Qgb1RhcmdldCA9IHRhcmdldEVudGl0eVNldC5lbnRpdHlUeXBlLnJlc29sdmVQYXRoKHJlbGF0aXZlUGF0aCwgYkluY2x1ZGVWaXNpdGVkT2JqZWN0cyk7XG5cdFx0aWYgKG9UYXJnZXQpIHtcblx0XHRcdGlmIChiSW5jbHVkZVZpc2l0ZWRPYmplY3RzKSB7XG5cdFx0XHRcdG9UYXJnZXQudmlzaXRlZE9iamVjdHMgPSBsb2NhbE9iamVjdHMuY29uY2F0KG9UYXJnZXQudmlzaXRlZE9iamVjdHMpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGUgJiYgdGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGUuYWN0aW9ucykge1xuXHRcdFx0Ly8gaWYgdGFyZ2V0IGlzIGFuIGFjdGlvbiBvciBhbiBhY3Rpb24gcGFyYW1ldGVyXG5cdFx0XHRjb25zdCBhY3Rpb25zID0gdGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGUgJiYgdGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGUuYWN0aW9ucztcblx0XHRcdGNvbnN0IHJlbGF0aXZlU3BsaXQgPSByZWxhdGl2ZVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0aWYgKGFjdGlvbnNbcmVsYXRpdmVTcGxpdFswXV0pIHtcblx0XHRcdFx0Y29uc3QgYWN0aW9uID0gYWN0aW9uc1tyZWxhdGl2ZVNwbGl0WzBdXTtcblx0XHRcdFx0aWYgKHJlbGF0aXZlU3BsaXRbMV0gJiYgYWN0aW9uLnBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRjb25zdCBwYXJhbWV0ZXJOYW1lID0gcmVsYXRpdmVTcGxpdFsxXTtcblx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uLnBhcmFtZXRlcnMuZmluZCgocGFyYW1ldGVyKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyYW1ldGVyLmZ1bGx5UXVhbGlmaWVkTmFtZS5lbmRzV2l0aChgLyR7cGFyYW1ldGVyTmFtZX1gKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIGlmIChyZWxhdGl2ZVBhdGgubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFjdGlvbjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb1RhcmdldDtcblx0fSBlbHNlIHtcblx0XHRpZiAoYkluY2x1ZGVWaXNpdGVkT2JqZWN0cykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dGFyZ2V0OiB0YXJnZXRFbnRpdHlTZXQsXG5cdFx0XHRcdHZpc2l0ZWRPYmplY3RzOiBsb2NhbE9iamVjdHNcblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiB0YXJnZXRFbnRpdHlTZXQ7XG5cdH1cbn1cblxuZXhwb3J0IHR5cGUgUmVzb2x2ZWRUYXJnZXQgPSB7XG5cdHRhcmdldD86IFNlcnZpY2VPYmplY3Q7XG5cdHZpc2l0ZWRPYmplY3RzOiBTZXJ2aWNlT2JqZWN0QW5kQW5ub3RhdGlvbltdO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvTWV0YU1vZGVsQ29udGV4dDogQ29udGV4dCwgb0VudGl0eVNldE1ldGFNb2RlbENvbnRleHQ/OiBDb250ZXh0KTogRGF0YU1vZGVsT2JqZWN0UGF0aCB7XG5cdGNvbnN0IG9Db252ZXJ0ZWRNZXRhZGF0YSA9IGNvbnZlcnRUeXBlcyhvTWV0YU1vZGVsQ29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0Y29uc3QgbWV0YU1vZGVsQ29udGV4dCA9IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KG9NZXRhTW9kZWxDb250ZXh0LCB0cnVlKTtcblx0bGV0IHRhcmdldEVudGl0eVNldExvY2F0aW9uO1xuXHRpZiAob0VudGl0eVNldE1ldGFNb2RlbENvbnRleHQgJiYgb0VudGl0eVNldE1ldGFNb2RlbENvbnRleHQuZ2V0UGF0aCgpICE9PSBcIi9cIikge1xuXHRcdHRhcmdldEVudGl0eVNldExvY2F0aW9uID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9FbnRpdHlTZXRNZXRhTW9kZWxDb250ZXh0KTtcblx0fVxuXHRyZXR1cm4gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RGcm9tUGF0aChtZXRhTW9kZWxDb250ZXh0LCBvQ29udmVydGVkTWV0YWRhdGEsIHRhcmdldEVudGl0eVNldExvY2F0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0RnJvbVBhdGgoXG5cdG1ldGFNb2RlbENvbnRleHQ6IFJlc29sdmVkVGFyZ2V0LFxuXHRjb252ZXJ0ZWRUeXBlczogQ29udmVydGVkTWV0YWRhdGEsXG5cdHRhcmdldEVudGl0eVNldExvY2F0aW9uPzogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0b25seVNlcnZpY2VPYmplY3RzOiBib29sZWFuID0gZmFsc2Vcbik6IERhdGFNb2RlbE9iamVjdFBhdGgge1xuXHRjb25zdCBkYXRhTW9kZWxPYmplY3RzID0gbWV0YU1vZGVsQ29udGV4dC52aXNpdGVkT2JqZWN0cy5maWx0ZXIoXG5cdFx0KHZpc2l0ZWRPYmplY3QpID0+IGlzU2VydmljZU9iamVjdCh2aXNpdGVkT2JqZWN0KSAmJiAhaXNFbnRpdHlUeXBlKHZpc2l0ZWRPYmplY3QpICYmICFpc0VudGl0eUNvbnRhaW5lcih2aXNpdGVkT2JqZWN0KVxuXHQpO1xuXHRpZiAoXG5cdFx0aXNTZXJ2aWNlT2JqZWN0KG1ldGFNb2RlbENvbnRleHQudGFyZ2V0KSAmJlxuXHRcdCFpc0VudGl0eVR5cGUobWV0YU1vZGVsQ29udGV4dC50YXJnZXQpICYmXG5cdFx0ZGF0YU1vZGVsT2JqZWN0c1tkYXRhTW9kZWxPYmplY3RzLmxlbmd0aCAtIDFdICE9PSBtZXRhTW9kZWxDb250ZXh0LnRhcmdldCAmJlxuXHRcdCFvbmx5U2VydmljZU9iamVjdHNcblx0KSB7XG5cdFx0ZGF0YU1vZGVsT2JqZWN0cy5wdXNoKG1ldGFNb2RlbENvbnRleHQudGFyZ2V0KTtcblx0fVxuXG5cdGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0aWVzOiBOYXZpZ2F0aW9uUHJvcGVydHlbXSA9IFtdO1xuXHRjb25zdCByb290RW50aXR5U2V0OiBFbnRpdHlTZXQgPSBkYXRhTW9kZWxPYmplY3RzWzBdIGFzIEVudGl0eVNldDtcblxuXHRsZXQgY3VycmVudEVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkID0gcm9vdEVudGl0eVNldDtcblx0bGV0IGN1cnJlbnRFbnRpdHlUeXBlOiBFbnRpdHlUeXBlID0gcm9vdEVudGl0eVNldC5lbnRpdHlUeXBlO1xuXHRsZXQgY3VycmVudE9iamVjdDogU2VydmljZU9iamVjdEFuZEFubm90YXRpb24gfCB1bmRlZmluZWQ7XG5cdGxldCBuYXZpZ2F0ZWRQYXRoID0gW107XG5cblx0Zm9yIChsZXQgaSA9IDE7IGkgPCBkYXRhTW9kZWxPYmplY3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y3VycmVudE9iamVjdCA9IGRhdGFNb2RlbE9iamVjdHNbaV07XG5cblx0XHRpZiAoaXNOYXZpZ2F0aW9uUHJvcGVydHkoY3VycmVudE9iamVjdCkpIHtcblx0XHRcdG5hdmlnYXRlZFBhdGgucHVzaChjdXJyZW50T2JqZWN0Lm5hbWUpO1xuXHRcdFx0bmF2aWdhdGlvblByb3BlcnRpZXMucHVzaChjdXJyZW50T2JqZWN0KTtcblx0XHRcdGN1cnJlbnRFbnRpdHlUeXBlID0gY3VycmVudE9iamVjdC50YXJnZXRUeXBlO1xuXHRcdFx0Y29uc3QgYm91bmRFbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCA9IGN1cnJlbnRFbnRpdHlTZXQ/Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdbbmF2aWdhdGVkUGF0aC5qb2luKFwiL1wiKV07XG5cdFx0XHRpZiAoYm91bmRFbnRpdHlTZXQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjdXJyZW50RW50aXR5U2V0ID0gYm91bmRFbnRpdHlTZXQ7XG5cdFx0XHRcdG5hdmlnYXRlZFBhdGggPSBbXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGlzRW50aXR5U2V0KGN1cnJlbnRPYmplY3QpIHx8IGlzU2luZ2xldG9uKGN1cnJlbnRPYmplY3QpKSB7XG5cdFx0XHRjdXJyZW50RW50aXR5U2V0ID0gY3VycmVudE9iamVjdDtcblx0XHRcdGN1cnJlbnRFbnRpdHlUeXBlID0gY3VycmVudEVudGl0eVNldC5lbnRpdHlUeXBlO1xuXHRcdH1cblx0fVxuXG5cdGlmIChuYXZpZ2F0ZWRQYXRoLmxlbmd0aCA+IDApIHtcblx0XHQvLyBQYXRoIHdpdGhvdXQgTmF2aWdhdGlvblByb3BlcnR5QmluZGluZyAtLT4gbm8gdGFyZ2V0IGVudGl0eSBzZXRcblx0XHRjdXJyZW50RW50aXR5U2V0ID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKHRhcmdldEVudGl0eVNldExvY2F0aW9uICYmIHRhcmdldEVudGl0eVNldExvY2F0aW9uLnN0YXJ0aW5nRW50aXR5U2V0ICE9PSByb290RW50aXR5U2V0KSB7XG5cdFx0Ly8gSW4gY2FzZSB0aGUgZW50aXR5c2V0IGlzIG5vdCBzdGFydGluZyBmcm9tIHRoZSBzYW1lIGxvY2F0aW9uIGl0IG1heSBtZWFuIHRoYXQgd2UgYXJlIGRvaW5nIHRvbyBtdWNoIHdvcmsgZWFybGllciBmb3Igc29tZSByZWFzb25cblx0XHQvLyBBcyBzdWNoIHdlIG5lZWQgdG8gcmVkZWZpbmUgdGhlIGNvbnRleHQgc291cmNlIGZvciB0aGUgdGFyZ2V0RW50aXR5U2V0TG9jYXRpb25cblx0XHRjb25zdCBzdGFydGluZ0luZGV4ID0gZGF0YU1vZGVsT2JqZWN0cy5pbmRleE9mKHRhcmdldEVudGl0eVNldExvY2F0aW9uLnN0YXJ0aW5nRW50aXR5U2V0KTtcblx0XHRpZiAoc3RhcnRpbmdJbmRleCAhPT0gLTEpIHtcblx0XHRcdC8vIElmIGl0J3Mgbm90IGZvdW5kIEkgZG9uJ3Qga25vdyB3aGF0IHdlIGNhbiBkbyAocHJvYmFibHkgbm90aGluZylcblx0XHRcdGNvbnN0IHJlcXVpcmVkRGF0YU1vZGVsT2JqZWN0cyA9IGRhdGFNb2RlbE9iamVjdHMuc2xpY2UoMCwgc3RhcnRpbmdJbmRleCk7XG5cdFx0XHR0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbi5zdGFydGluZ0VudGl0eVNldCA9IHJvb3RFbnRpdHlTZXQ7XG5cdFx0XHR0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbi5uYXZpZ2F0aW9uUHJvcGVydGllcyA9IHJlcXVpcmVkRGF0YU1vZGVsT2JqZWN0c1xuXHRcdFx0XHQuZmlsdGVyKGlzTmF2aWdhdGlvblByb3BlcnR5KVxuXHRcdFx0XHQuY29uY2F0KHRhcmdldEVudGl0eVNldExvY2F0aW9uLm5hdmlnYXRpb25Qcm9wZXJ0aWVzIGFzIE5hdmlnYXRpb25Qcm9wZXJ0eVtdKTtcblx0XHR9XG5cdH1cblx0Y29uc3Qgb3V0RGF0YU1vZGVsUGF0aCA9IHtcblx0XHRzdGFydGluZ0VudGl0eVNldDogcm9vdEVudGl0eVNldCxcblx0XHR0YXJnZXRFbnRpdHlTZXQ6IGN1cnJlbnRFbnRpdHlTZXQsXG5cdFx0dGFyZ2V0RW50aXR5VHlwZTogY3VycmVudEVudGl0eVR5cGUsXG5cdFx0dGFyZ2V0T2JqZWN0OiBtZXRhTW9kZWxDb250ZXh0LnRhcmdldCxcblx0XHRuYXZpZ2F0aW9uUHJvcGVydGllcyxcblx0XHRjb250ZXh0TG9jYXRpb246IHRhcmdldEVudGl0eVNldExvY2F0aW9uLFxuXHRcdGNvbnZlcnRlZFR5cGVzOiBjb252ZXJ0ZWRUeXBlc1xuXHR9O1xuXHRpZiAoIWlzU2VydmljZU9iamVjdChvdXREYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCkgJiYgb25seVNlcnZpY2VPYmplY3RzKSB7XG5cdFx0b3V0RGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QgPSBpc1NlcnZpY2VPYmplY3QoY3VycmVudE9iamVjdCkgPyBjdXJyZW50T2JqZWN0IDogdW5kZWZpbmVkO1xuXHR9XG5cdGlmICghb3V0RGF0YU1vZGVsUGF0aC5jb250ZXh0TG9jYXRpb24pIHtcblx0XHRvdXREYXRhTW9kZWxQYXRoLmNvbnRleHRMb2NhdGlvbiA9IG91dERhdGFNb2RlbFBhdGg7XG5cdH1cblx0cmV0dXJuIG91dERhdGFNb2RlbFBhdGg7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7OztFQTBDQSxNQUFNQSxnQkFBcUIsR0FBRztJQUM3QiwyQkFBMkIsRUFBRSxjQUFjO0lBQzNDLG1CQUFtQixFQUFFLE1BQU07SUFDM0IsdUJBQXVC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