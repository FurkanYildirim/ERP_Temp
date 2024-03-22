/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/uid", "sap/fe/core/buildingBlocks/AttributeModel", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/TypeGuards", "sap/ui/base/BindingParser", "sap/ui/core/util/XMLPreprocessor", "sap/ui/model/json/JSONModel", "./TraceInfo"], function (Log, deepClone, uid, AttributeModel, ConfigurableObject, BindingToolkit, TypeGuards, BindingParser, XMLPreprocessor, JSONModel, TraceInfo) {
  "use strict";

  var _exports = {};
  var isFunctionArray = TypeGuards.isFunctionArray;
  var isContext = TypeGuards.isContext;
  var isBindingToolkitExpression = BindingToolkit.isBindingToolkitExpression;
  var compileExpression = BindingToolkit.compileExpression;
  var Placement = ConfigurableObject.Placement;
  const LOGGER_SCOPE = "sap.fe.core.buildingBlocks.BuildingBlockTemplateProcessor";
  const XMLTEMPLATING_NS = "http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1";
  const DOMParserInstance = new DOMParser();
  function validateMacroMetadataContext(sName, mContexts, oContextSettings, sKey) {
    const oContext = mContexts[sKey];
    const oContextObject = oContext === null || oContext === void 0 ? void 0 : oContext.getObject();
    if (oContextSettings.required === true && (!oContext || oContextObject === null)) {
      throw new Error(`${sName}: Required metadataContext '${sKey}' is missing`);
    } else if (oContextObject) {
      // If context object has $kind property, $Type should not be checked
      // Therefore remove from context settings
      if (oContextObject.hasOwnProperty("$kind") && oContextObject.$kind !== undefined && oContextSettings.expectedTypes !== undefined) {
        // Check if the $kind is part of the allowed ones
        if (oContextSettings.expectedTypes.indexOf(oContextObject.$kind) === -1) {
          throw new Error(`${sName}: '${sKey}' must be '$kind' '${oContextSettings.expectedTypes}' but is '${oContextObject.$kind}': ${oContext.getPath()}`);
        }
      } else if (oContextObject.hasOwnProperty("$Type") && oContextObject.$Type !== undefined && oContextSettings.expectedAnnotationTypes) {
        // Check only $Type
        if (oContextSettings.expectedAnnotationTypes.indexOf(oContextObject.$Type) === -1) {
          throw new Error(`${sName}: '${sKey}' must be '$Type' '${oContextSettings.expectedAnnotationTypes}' but is '${oContextObject.$Type}': ${oContext.getPath()}`);
        }
      }
    }
  }
  function validateMacroSignature(sName, oMetadata, mContexts, oNode) {
    const aMetadataContextKeys = oMetadata.metadataContexts && Object.keys(oMetadata.metadataContexts) || [],
      aProperties = oMetadata.properties && Object.keys(oMetadata.properties) || [],
      oAttributeNames = {};

    // collect all attributes to find unchecked properties
    const attributeNames = oNode.getAttributeNames();
    for (const attributeName of attributeNames) {
      oAttributeNames[attributeName] = true;
    }

    //Check metadataContexts
    aMetadataContextKeys.forEach(function (sKey) {
      const oContextSettings = oMetadata.metadataContexts[sKey];
      validateMacroMetadataContext(sName, mContexts, oContextSettings, sKey);
      delete oAttributeNames[sKey];
    });
    //Check properties
    aProperties.forEach(function (sKey) {
      const oPropertySettings = oMetadata.properties[sKey];
      if (!oNode.hasAttribute(sKey)) {
        if (oPropertySettings.required && !oPropertySettings.hasOwnProperty("defaultValue")) {
          throw new Error(`${sName}: ` + `Required property '${sKey}' is missing`);
        }
      } else {
        delete oAttributeNames[sKey];
      }
    });

    // Unchecked properties
    Object.keys(oAttributeNames).forEach(function (sKey) {
      // no check for properties which contain a colon ":" (different namespace), e.g. xmlns:trace, trace:macroID, unittest:id
      if (sKey.indexOf(":") < 0 && !sKey.startsWith("xmlns")) {
        Log.warning(`Unchecked parameter: ${sName}: ${sKey}`, undefined, LOGGER_SCOPE);
      }
    });
  }
  _exports.validateMacroSignature = validateMacroSignature;
  const SAP_UI_CORE_ELEMENT = "sap.ui.core.Element";
  const SAP_UI_MODEL_CONTEXT = "sap.ui.model.Context";

  /**
   * Transforms the metadata of a building block by adding additional aggregations,
   * and splitting properties into actual properties and metadata contexts.
   *
   * @param buildingBlockMetadata The metadata received from the input
   * @returns The transformed metadata
   */
  _exports.SAP_UI_MODEL_CONTEXT = SAP_UI_MODEL_CONTEXT;
  function transformMetadata(buildingBlockMetadata) {
    const properties = {};
    const aggregations = {
      dependents: {
        type: SAP_UI_CORE_ELEMENT,
        slot: "dependents"
      },
      customData: {
        type: SAP_UI_CORE_ELEMENT,
        slot: "customData"
      },
      layoutData: {
        type: SAP_UI_CORE_ELEMENT,
        slot: "layoutData"
      },
      ...buildingBlockMetadata.aggregations
    };
    const metadataContexts = {};
    for (const propertyName of Object.keys(buildingBlockMetadata.properties)) {
      const propertyType = buildingBlockMetadata.properties[propertyName].type;
      if (propertyType !== SAP_UI_MODEL_CONTEXT) {
        properties[propertyName] = buildingBlockMetadata.properties[propertyName];
      }
      if ([SAP_UI_MODEL_CONTEXT, "object", "array"].includes(propertyType)) {
        // Explicitly defined contexts, objects, and arrays may come from the metadataContext
        metadataContexts[propertyName] = buildingBlockMetadata.properties[propertyName];
      }
    }
    return {
      ...buildingBlockMetadata,
      properties,
      metadataContexts,
      aggregations
    };
  }

  /**
   * Checks the absolute or context paths and returns an appropriate MetaContext.
   *
   * @param oSettings Additional settings
   * @param sAttributeValue The attribute value
   * @returns The meta data context object
   */
  function _checkAbsoluteAndContextPaths(oSettings, sAttributeValue) {
    let sMetaPath;
    if (sAttributeValue && sAttributeValue.startsWith("/")) {
      // absolute path - we just use this one
      sMetaPath = sAttributeValue;
    } else {
      let sContextPath = oSettings.currentContextPath.getPath();
      if (!sContextPath.endsWith("/")) {
        sContextPath += "/";
      }
      sMetaPath = sContextPath + sAttributeValue;
    }
    return {
      model: "metaModel",
      path: sMetaPath
    };
  }

  /**
   * This method helps to create the metadata context in case it is not yet available in the store.
   *
   * @param oSettings Additional settings
   * @param sAttributeName The attribute name
   * @param sAttributeValue The attribute value
   * @returns The meta data context object
   */
  function _createInitialMetadataContext(oSettings, sAttributeName, sAttributeValue) {
    let returnContext;
    if (sAttributeValue.startsWith("/uid--") && !oSettings.models.converterContext.getProperty(sAttributeValue)) {
      const data = unstoreObjectValue(sAttributeValue);
      oSettings.models.converterContext.setProperty(sAttributeValue, data);
      returnContext = {
        model: "converterContext",
        path: sAttributeValue
      };
    } else if (sAttributeName === "metaPath" && oSettings.currentContextPath || sAttributeName === "contextPath") {
      returnContext = _checkAbsoluteAndContextPaths(oSettings, sAttributeValue);
    } else if (sAttributeValue && sAttributeValue.startsWith("/")) {
      // absolute path - we just use this one
      returnContext = {
        model: "metaModel",
        path: sAttributeValue
      };
    } else {
      returnContext = {
        model: "metaModel",
        path: oSettings.bindingContexts.entitySet ? oSettings.bindingContexts.entitySet.getPath(sAttributeValue) : sAttributeValue
      };
    }
    return returnContext;
  }
  function _getMetadataContext(oSettings, oNode, sAttributeName, oVisitor, bDoNotResolve, isOpen) {
    let oMetadataContext;
    if (!bDoNotResolve && oNode.hasAttribute(sAttributeName)) {
      const sAttributeValue = oNode.getAttribute(sAttributeName);
      oMetadataContext = BindingParser.complexParser(sAttributeValue);
      if (!oMetadataContext) {
        oMetadataContext = _createInitialMetadataContext(oSettings, sAttributeName, sAttributeValue);
      }
    } else if (oSettings.bindingContexts.hasOwnProperty(sAttributeName)) {
      oMetadataContext = {
        model: sAttributeName,
        path: ""
      };
    } else if (isOpen) {
      try {
        if (oVisitor.getContext(`${sAttributeName}>`)) {
          oMetadataContext = {
            model: sAttributeName,
            path: ""
          };
        }
      } catch (e) {
        return undefined;
      }
    }
    return oMetadataContext;
  }

  /**
   * Parse the incoming XML node and try to resolve the properties defined there.
   *
   * @param oMetadata The metadata for the building block
   * @param oNode The XML node to parse
   * @param isPublic Whether the building block is used in a public context or not
   * @param oVisitor The visitor instance
   */
  async function processProperties(oMetadata, oNode, isPublic, oVisitor) {
    const definitionProperties = oMetadata.properties;

    // Retrieve properties values
    const aDefinitionPropertiesKeys = Object.keys(definitionProperties);
    const propertyValues = {};
    for (const sKeyValue of aDefinitionPropertiesKeys) {
      if (definitionProperties[sKeyValue].type === "object") {
        propertyValues[sKeyValue] = definitionProperties[sKeyValue].defaultValue && deepClone(definitionProperties[sKeyValue].defaultValue); // To avoid values being reused across macros
      } else {
        propertyValues[sKeyValue] = definitionProperties[sKeyValue].defaultValue;
      }
      if (oNode.hasAttribute(sKeyValue) && isPublic && definitionProperties[sKeyValue].isPublic === false) {
        Log.error(`Property ${sKeyValue} was ignored as it is not intended for public usage`);
      } else if (oNode.hasAttribute(sKeyValue)) {
        await oVisitor.visitAttribute(oNode, oNode.attributes.getNamedItem(sKeyValue));
        let value = oNode.getAttribute(sKeyValue);
        if (value !== undefined && value !== null) {
          if (typeof value === "string" && !value.startsWith("{")) {
            switch (definitionProperties[sKeyValue].type) {
              case "boolean":
                value = value === "true";
                break;
              case "number":
                value = Number(value);
                break;
            }
          }
          value = value === null ? undefined : value;
          propertyValues[sKeyValue] = value;
        }
      }
    }
    return propertyValues;
  }

  /**
   * Parse the incoming XML node and try to resolve the binding contexts defined inside.
   *
   * @param oMetadata The metadata for the building block
   * @param oSettings The settings object
   * @param oNode The XML node to parse
   * @param isPublic Whether the building block is used in a public context or not
   * @param oVisitor The visitor instance
   * @param mContexts The contexts to be used
   * @param propertyValues The current property values
   * @returns The processed and missing contexts
   */
  function processContexts(oMetadata, oSettings, oNode, isPublic, oVisitor, mContexts, propertyValues) {
    oSettings.currentContextPath = oSettings.bindingContexts.contextPath;
    const mMissingContext = {};
    const oDefinitionContexts = oMetadata.metadataContexts;
    const aDefinitionContextsKeys = Object.keys(oDefinitionContexts);
    // Since the metaPath and other property can be relative to the contextPath we need to evaluate the current contextPath first
    const contextPathIndex = aDefinitionContextsKeys.indexOf("contextPath");
    if (contextPathIndex !== -1) {
      // If it is defined we extract it and reinsert it in the first position of the array
      const contextPathDefinition = aDefinitionContextsKeys.splice(contextPathIndex, 1);
      aDefinitionContextsKeys.splice(0, 0, contextPathDefinition[0]);
    }
    for (const sAttributeName of aDefinitionContextsKeys) {
      // If the context was resolved as a property (binding / xml aggregation) then we don't need to resolve it here.
      const propertyValue = propertyValues[sAttributeName];
      if (propertyValue !== undefined && typeof propertyValue === "object" && Object.keys(propertyValue).length > 0) {
        delete oMetadata.metadataContexts[sAttributeName];
        continue;
      }
      const bDoNotResolve = isPublic && oDefinitionContexts[sAttributeName].isPublic === false && oNode.hasAttribute(sAttributeName);
      const oMetadataContext = _getMetadataContext(oSettings, oNode, sAttributeName, oVisitor, bDoNotResolve, oMetadata.isOpen ?? false);
      if (oMetadataContext) {
        oMetadataContext.name = sAttributeName;
        addSingleContext(mContexts, oVisitor, oMetadataContext);
        if ((sAttributeName === "entitySet" || sAttributeName === "contextPath") && !oSettings.bindingContexts.hasOwnProperty(sAttributeName)) {
          oSettings.bindingContexts[sAttributeName] = mContexts[sAttributeName];
        }
        if (sAttributeName === "contextPath") {
          oSettings.currentContextPath = mContexts[sAttributeName];
        }
        if (mContexts[sAttributeName] !== undefined) {
          propertyValues[sAttributeName] = mContexts[sAttributeName];
        } else if (typeof propertyValues[sAttributeName] === "string") {
          // If the binding couldn't be resolved consider that there was no value here
          delete oMetadata.metadataContexts[sAttributeName];
        }
      } else {
        mMissingContext[sAttributeName] = true;
      }
    }
    return mMissingContext;
  }
  function parseAggregation(oAggregation, processAggregations) {
    const oOutObjects = {};
    if (oAggregation && oAggregation.children.length > 0) {
      const children = oAggregation.children;
      for (let childIdx = 0; childIdx < children.length; childIdx++) {
        const childDefinition = children[childIdx];
        let childKey = childDefinition.getAttribute("key") || childDefinition.getAttribute("id");
        if (childKey) {
          childKey = `InlineXML_${childKey}`;
          childDefinition.setAttribute("key", childKey);
          let aggregationObject = {
            key: childKey,
            position: {
              placement: childDefinition.getAttribute("placement") || Placement.After,
              anchor: childDefinition.getAttribute("anchor") || undefined
            },
            type: "Slot"
          };
          if (processAggregations) {
            aggregationObject = processAggregations(childDefinition, aggregationObject);
          }
          oOutObjects[aggregationObject.key] = aggregationObject;
        } else if (childDefinition.tagName !== "slot") {
          Log.error(`The aggregation ${childDefinition.nodeName} is missing a Key attribute. It is not displayed`);
        }
      }
    }
    return oOutObjects;
  }

  /**
   * Processes the child nodes of the building block and parses them as either aggregations or object-/array-based values.
   *
   * @param oNode The XML node for which to process the children
   * @param oVisitor The visitor instance
   * @param oMetadata The metadata for the building block
   * @param isPublic Whether the building block is used in a public context or not
   * @param propertyValues The values of already parsed property
   */
  async function processChildren(oNode, oVisitor, oMetadata, isPublic, propertyValues) {
    const oAggregations = {};
    if (oNode.firstElementChild !== null) {
      let oFirstElementChild = oNode.firstElementChild;
      while (oFirstElementChild !== null) {
        if (oFirstElementChild.namespaceURI === XMLTEMPLATING_NS) {
          // In case we encounter a templating tag, run the visitor on it and continue with the resulting child
          const oParent = oFirstElementChild.parentNode;
          if (oParent) {
            const iChildIndex = Array.from(oParent.children).indexOf(oFirstElementChild);
            await oVisitor.visitNode(oFirstElementChild);
            oFirstElementChild = oParent.children[iChildIndex] ? oParent.children[iChildIndex] : null;
          } else {
            // Not sure how this could happen but I also don't want to create infinite loops
            oFirstElementChild = oFirstElementChild.nextElementSibling;
          }
        } else {
          const sChildName = oFirstElementChild.localName;
          let sAggregationName = sChildName;
          if (sAggregationName[0].toUpperCase() === sAggregationName[0]) {
            // not a sub aggregation, go back to default Aggregation
            sAggregationName = oMetadata.defaultAggregation || "";
          }
          const aggregationDefinition = oMetadata.aggregations[sAggregationName];
          if (aggregationDefinition !== undefined && !aggregationDefinition.slot) {
            const parsedAggregation = parseAggregation(oFirstElementChild, aggregationDefinition.processAggregations);
            propertyValues[sAggregationName] = parsedAggregation;
            for (const parsedAggregationKey in parsedAggregation) {
              oMetadata.aggregations[parsedAggregationKey] = parsedAggregation[parsedAggregationKey];
            }
          }
          oFirstElementChild = oFirstElementChild.nextElementSibling;
        }
      }
      oFirstElementChild = oNode.firstElementChild;
      while (oFirstElementChild !== null) {
        const oNextChild = oFirstElementChild.nextElementSibling;
        const sChildName = oFirstElementChild.localName;
        let sAggregationName = sChildName;
        if (sAggregationName[0].toUpperCase() === sAggregationName[0]) {
          // not a sub aggregation, go back to default Aggregation
          sAggregationName = oMetadata.defaultAggregation || "";
        }
        if (Object.keys(oMetadata.aggregations).indexOf(sAggregationName) !== -1 && (!isPublic || oMetadata.aggregations[sAggregationName].isPublic === true)) {
          const aggregationDefinition = oMetadata.aggregations[sAggregationName];
          if (!aggregationDefinition.slot && oFirstElementChild !== null && oFirstElementChild.children.length > 0) {
            await oVisitor.visitNode(oFirstElementChild);
            let childDefinition = oFirstElementChild.firstElementChild;
            while (childDefinition) {
              const nextChild = childDefinition.nextElementSibling;
              if (!aggregationDefinition.hasVirtualNode) {
                const childWrapper = document.createElementNS(oNode.namespaceURI, childDefinition.getAttribute("key"));
                childWrapper.appendChild(childDefinition);
                oAggregations[childDefinition.getAttribute("key")] = childWrapper;
              } else {
                oAggregations[childDefinition.getAttribute("key")] = childDefinition;
              }
              childDefinition.removeAttribute("key");
              childDefinition = nextChild;
            }
          } else if (aggregationDefinition.slot) {
            await oVisitor.visitNode(oFirstElementChild);
            if (sAggregationName !== sChildName) {
              if (!oAggregations[sAggregationName]) {
                const oNewChild = document.createElementNS(oNode.namespaceURI, sAggregationName);
                oAggregations[sAggregationName] = oNewChild;
              }
              oAggregations[sAggregationName].appendChild(oFirstElementChild);
            } else {
              oAggregations[sAggregationName] = oFirstElementChild;
            }
          }
        } else if (Object.keys(oMetadata.properties).indexOf(sAggregationName) !== -1) {
          await oVisitor.visitNode(oFirstElementChild);
          if (oMetadata.properties[sAggregationName].type === "object") {
            // Object Type properties
            const aggregationPropertyValues = {};
            const attributeNames = oFirstElementChild.getAttributeNames();
            for (const attributeName of attributeNames) {
              aggregationPropertyValues[attributeName] = oFirstElementChild.getAttribute(attributeName);
            }
            if (oFirstElementChild.children.length) {
              //retrieve one level subObject properties
              for (let childIndex = 0; childIndex < oFirstElementChild.children.length; childIndex++) {
                const subChild = oFirstElementChild.children[childIndex];
                const subObjectKey = subChild.localName;
                const subObject = {};
                const subChildAttributeNames = subChild.getAttributeNames();
                for (const subChildAttributeName of subChildAttributeNames) {
                  subObject[subChildAttributeName] = subChild.getAttribute(subChildAttributeName);
                }
                aggregationPropertyValues[subObjectKey] = subObject;
              }
            }
            propertyValues[sAggregationName] = aggregationPropertyValues;
          } else if (oMetadata.properties[sAggregationName].type === "array") {
            if (oFirstElementChild !== null && oFirstElementChild.children.length > 0) {
              const children = oFirstElementChild.children;
              const oOutObjects = [];
              for (let childIdx = 0; childIdx < children.length; childIdx++) {
                const childDefinition = children[childIdx];
                // non keyed child, just add it to the aggregation
                const myChild = {};
                const attributeNames = childDefinition.getAttributeNames();
                for (const attributeName of attributeNames) {
                  myChild[attributeName] = childDefinition.getAttribute(attributeName);
                }
                oOutObjects.push(myChild);
              }
              propertyValues[sAggregationName] = oOutObjects;
            }
          }
        }
        oFirstElementChild = oNextChild;
      }
    }
    return oAggregations;
  }
  function processSlots(oAggregations, oMetadataAggregations, oNode) {
    let processCustomData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    if (Object.keys(oAggregations).length > 0) {
      Object.keys(oAggregations).forEach(function (sAggregationName) {
        const oAggregationElement = oAggregations[sAggregationName];
        if (oNode !== null && oNode !== undefined && oAggregationElement) {
          // slots can have :: as keys which is not a valid aggregation name therefore replacing them
          const oElementChild = oAggregationElement.firstElementChild;
          if (!["dependents", "customData", "layoutData"].includes(sAggregationName)) {
            const sSlotName = oMetadataAggregations[sAggregationName] !== undefined && oMetadataAggregations[sAggregationName].slot || sAggregationName;
            const oTargetElement = oNode.querySelector(`slot[name='${sSlotName}']`);
            if (oTargetElement !== null) {
              const oNewChild = prepareAggregationElement(oNode, sAggregationName, oElementChild);
              oTargetElement.replaceWith(...oNewChild.children); // Somehow TS doesn't like this but the documentation says is should work
            }
          } else if (processCustomData && oElementChild !== null) {
            const oNewChild = prepareAggregationElement(oNode, sAggregationName, oElementChild);
            oNode.appendChild(oNewChild);
          }
        }
      });
    }
  }
  function prepareAggregationElement(oNode, sAggregationName, oElementChild) {
    const oNewChild = document.createElementNS(oNode.namespaceURI, sAggregationName.replace(/:/gi, "_"));
    while (oElementChild) {
      const oNextChild = oElementChild.nextElementSibling;
      oNewChild.appendChild(oElementChild);
      oElementChild = oNextChild;
    }
    return oNewChild;
  }
  async function processBuildingBlock(BuildingBlockClass, oNode, oVisitor) {
    let isPublic = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const oMetadata = transformMetadata(BuildingBlockClass.metadata);
    const sFragmentName = oMetadata.fragment ?? `${oMetadata.namespace ?? oMetadata.publicNamespace}.${oMetadata.xmlTag ?? oMetadata.name}`;
    const mContexts = {};
    const oSettings = oVisitor.getSettings();

    // Add an empty converter context if there is none in order to have a place to store object values
    oSettings.models.converterContext ??= new JSONModel();

    //Inject storage for macros
    if (!oSettings[sFragmentName]) {
      oSettings[sFragmentName] = {};
    }

    // First of all we need to visit the attributes to resolve the properties and the metadata contexts
    const propertyValues = await processProperties(oMetadata, oNode, isPublic, oVisitor);
    const initialKeys = Object.keys(propertyValues);
    const mMissingContext = processContexts(oMetadata, oSettings, oNode, isPublic, oVisitor, mContexts, propertyValues);
    try {
      // Aggregation and complex type support
      const oAggregations = await processChildren(oNode, oVisitor, oMetadata, isPublic, propertyValues);
      let oControlConfig = {};
      if (oSettings.models.viewData) {
        // Only used in the Field macro and even then maybe not really useful
        oControlConfig = oSettings.models.viewData.getProperty("/controlConfiguration");
      }
      let processedPropertyValues = propertyValues;
      Object.keys(propertyValues).forEach(propName => {
        var _BuildingBlockClass$m, _oData, _oData$isA;
        let oData = propertyValues[propName];
        //check for additional processing function to validate / overwrite parameters
        const originalDefinition = BuildingBlockClass === null || BuildingBlockClass === void 0 ? void 0 : (_BuildingBlockClass$m = BuildingBlockClass.metadata) === null || _BuildingBlockClass$m === void 0 ? void 0 : _BuildingBlockClass$m.properties[propName];
        if (originalDefinition !== null && originalDefinition !== void 0 && originalDefinition.validate) {
          oData = originalDefinition.validate(oData) || oData;
        }
        if ((_oData = oData) !== null && _oData !== void 0 && (_oData$isA = _oData.isA) !== null && _oData$isA !== void 0 && _oData$isA.call(_oData, SAP_UI_MODEL_CONTEXT) && !oData.getModel().isA("sap.ui.model.odata.v4.ODataMetaModel")) {
          propertyValues[propName] = oData.getObject();
        }
      });
      propertyValues.isPublic = isPublic;
      const oInstance = new BuildingBlockClass({
        ...propertyValues,
        ...oAggregations
      }, oControlConfig, oSettings);
      processedPropertyValues = oInstance.getProperties();
      Object.keys(oMetadata.metadataContexts).forEach(function (sContextName) {
        if (processedPropertyValues.hasOwnProperty(sContextName)) {
          const targetObject = processedPropertyValues[sContextName];
          if (isContext(targetObject)) {
            mContexts[sContextName] = targetObject;
          } else if (typeof targetObject === "object") {
            const attributeValue = storeObjectValue(targetObject);
            oSettings.models.converterContext.setProperty(attributeValue, targetObject);
            const newContext = oSettings.models.converterContext.createBindingContext(attributeValue);
            unstoreObjectValue(attributeValue);
            mContexts[sContextName] = newContext;
          }
        }
      });
      const oAttributesModel = new AttributeModel(oNode, processedPropertyValues, BuildingBlockClass);
      mContexts["this"] = oAttributesModel.createBindingContext("/");
      let oPreviousMacroInfo;

      // Keep track
      if (TraceInfo.isTraceInfoActive()) {
        const oTraceInfo = TraceInfo.traceMacroCalls(sFragmentName, oMetadata, mContexts, oNode, oVisitor);
        if (oTraceInfo !== null && oTraceInfo !== void 0 && oTraceInfo.macroInfo) {
          oPreviousMacroInfo = oSettings["_macroInfo"];
          oSettings["_macroInfo"] = oTraceInfo.macroInfo;
        }
      }
      validateMacroSignature(sFragmentName, oMetadata, mContexts, oNode);
      const oContextVisitor = oVisitor.with(mContexts, oMetadata.isOpen !== undefined ? !oMetadata.isOpen : true);
      const oParent = oNode.parentNode;
      let iChildIndex;
      let oPromise;
      if (oParent) {
        iChildIndex = Array.from(oParent.children).indexOf(oNode);
        if (oMetadata.fragment) {
          oPromise = oContextVisitor.insertFragment(sFragmentName, oNode);
        } else {
          const templateString = await oInstance.getTemplate(oNode);
          if (BuildingBlockClass.isRuntime) {
            // For runtime building blocks, we need to attach all objects to the converterContext directly, as the actual rendering takes place at runtime
            for (const storeKey in temporaryObjectStore) {
              const data = unstoreObjectValue(storeKey);
              oSettings.models.converterContext.setProperty(storeKey, data);
            }
          }
          let hasError = "";
          if (templateString) {
            let hasParseError = false;
            let parsedTemplate = parseXMLString(templateString, true);
            // For safety purpose we try to detect trailing text in between XML Tags
            for (const element of parsedTemplate) {
              const iter = document.createNodeIterator(element, NodeFilter.SHOW_TEXT);
              let textnode = iter.nextNode();
              if (element.localName === "parsererror") {
                hasParseError = true;
              }
              while (textnode) {
                if (textnode.textContent && textnode.textContent.trim().length > 0) {
                  hasError = textnode.textContent;
                }
                textnode = iter.nextNode();
              }
            }
            if (hasParseError) {
              // If there is a parseerror while processing the XML it means the XML itself is malformed, as such we rerun the template process
              // Setting isTraceMode true will make it so that each xml` expression is checked for validity from XML perspective
              // If an error is found it's returned instead of the normal fragment
              Log.error(`Error while processing building block ${oMetadata.xmlTag || oMetadata.name}`);
              parsedTemplate = await processXmlInTrace(async () => {
                var _oInstance$getTemplat;
                const initialTemplate = await ((_oInstance$getTemplat = oInstance.getTemplate) === null || _oInstance$getTemplat === void 0 ? void 0 : _oInstance$getTemplat.call(oInstance, oNode));
                return parseXMLString(initialTemplate ?? "", true);
              });
            } else if (hasError.length > 0) {
              // If there is trailing text we create a standard error and display it.
              Log.error(`Error while processing building block ${oMetadata.xmlTag || oMetadata.name}`);
              const oErrorText = createErrorXML([`Error while processing building block ${oMetadata.xmlTag || oMetadata.name}`, `Trailing text was found in the XML: ${hasError}`], parsedTemplate.map(template => template.outerHTML).join("\n"));
              parsedTemplate = parseXMLString(oErrorText, true);
            }
            oNode.replaceWith(...parsedTemplate);
            const visitedNodes = parsedTemplate.map(async internalNode => {
              processSlots(oAggregations, oMetadata.aggregations, internalNode, false);
              return oContextVisitor.visitNode(internalNode);
            });
            oPromise = Promise.all(visitedNodes);
          } else {
            oNode.remove();
            oPromise = Promise.resolve();
          }
        }
        await oPromise;
        const oMacroElement = oParent.children[iChildIndex];
        processSlots(oAggregations, oMetadata.aggregations, oMacroElement, true);
        if (oMacroElement !== undefined) {
          const oRemainingSlots = oMacroElement.querySelectorAll("slot");
          oRemainingSlots.forEach(function (oSlotElement) {
            oSlotElement.remove();
          });
        }
      }
      if (oPreviousMacroInfo) {
        //restore macro info if available
        oSettings["_macroInfo"] = oPreviousMacroInfo;
      } else {
        delete oSettings["_macroInfo"];
      }
    } catch (e) {
      // In case there is a generic error (usually code error), we retrieve the current context information and create a dedicated error message
      const traceDetails = {
        initialProperties: {},
        resolvedProperties: {},
        missingContexts: mMissingContext
      };
      for (const propertyName of initialKeys) {
        const propertyValue = propertyValues[propertyName];
        if (isContext(propertyValue)) {
          traceDetails.initialProperties[propertyName] = {
            path: propertyValue.getPath(),
            value: propertyValue.getObject()
          };
        } else {
          traceDetails.initialProperties[propertyName] = propertyValue;
        }
      }
      for (const propertyName in propertyValues) {
        const propertyValue = propertyValues[propertyName];
        if (!initialKeys.includes(propertyName)) {
          if (isContext(propertyValue)) {
            traceDetails.resolvedProperties[propertyName] = {
              path: propertyValue.getPath(),
              value: propertyValue.getObject()
            };
          } else {
            traceDetails.resolvedProperties[propertyName] = propertyValue;
          }
        }
      }
      Log.error(e);
      const oError = createErrorXML([`Error while processing building block ${oMetadata.name}`], oNode.outerHTML, traceDetails, e.stack);
      const oTemplate = parseXMLString(oError, true);
      oNode.replaceWith(...oTemplate);
    }
  }
  function addSingleContext(mContexts, oVisitor, oCtx) {
    const sKey = oCtx.name || oCtx.model || undefined;
    if (mContexts[sKey]) {
      return; // do not add twice
    }

    try {
      let sContextPath = oCtx.path;
      if (oCtx.model !== null) {
        sContextPath = `${oCtx.model}>${sContextPath}`;
      }
      const mSetting = oVisitor.getSettings();
      if (oCtx.model === "converterContext" && oCtx.path.length > 0) {
        mContexts[sKey] = mSetting.models[oCtx.model].getContext(oCtx.path /*, mSetting.bindingContexts[oCtx.model]*/); // add the context to the visitor
      } else if (!mSetting.bindingContexts[oCtx.model] && mSetting.models[oCtx.model]) {
        mContexts[sKey] = mSetting.models[oCtx.model].getContext(oCtx.path); // add the context to the visitor
      } else {
        mContexts[sKey] = oVisitor.getContext(sContextPath); // add the context to the visitor
      }
    } catch (ex) {
      // ignore the context as this can only be the case if the model is not ready,
      // i.e. not a preprocessing model but maybe a model for providing afterwards
    }
  }

  /**
   * Register a building block definition to be used inside the xml template processor.
   *
   * @param BuildingBlockClass The building block definition
   */
  function registerBuildingBlock(BuildingBlockClass) {
    if (BuildingBlockClass.metadata.namespace !== undefined) {
      XMLPreprocessor.plugIn(async (oNode, oVisitor) => processBuildingBlock(BuildingBlockClass, oNode, oVisitor), BuildingBlockClass.metadata.namespace, BuildingBlockClass.metadata.xmlTag || BuildingBlockClass.metadata.name);
    }
    if (BuildingBlockClass.metadata.publicNamespace !== undefined) {
      XMLPreprocessor.plugIn(async (oNode, oVisitor) => processBuildingBlock(BuildingBlockClass, oNode, oVisitor, true), BuildingBlockClass.metadata.publicNamespace, BuildingBlockClass.metadata.xmlTag || BuildingBlockClass.metadata.name);
    }
  }

  /**
   * UnRegister a building block definition so that it is no longer used inside the xml template processor.
   *
   * @param BuildingBlockClass The building block definition
   */
  _exports.registerBuildingBlock = registerBuildingBlock;
  function unregisterBuildingBlock(BuildingBlockClass) {
    if (BuildingBlockClass.metadata.namespace !== undefined) {
      XMLPreprocessor.plugIn(null, BuildingBlockClass.metadata.namespace, BuildingBlockClass.metadata.xmlTag || BuildingBlockClass.metadata.name);
    }
    if (BuildingBlockClass.metadata.publicNamespace !== undefined) {
      XMLPreprocessor.plugIn(null, BuildingBlockClass.metadata.publicNamespace, BuildingBlockClass.metadata.xmlTag || BuildingBlockClass.metadata.name);
    }
  }
  _exports.unregisterBuildingBlock = unregisterBuildingBlock;
  function createErrorXML(errorMessages, xmlFragment, additionalData, stack) {
    const errorLabels = errorMessages.map(errorMessage => xml`<m:Label text="${escapeXMLAttributeValue(errorMessage)}"/>`);
    let errorStack = "";
    if (stack) {
      const stackFormatted = btoa(`<pre>${stack}</pre>`);
      errorStack = xml`<m:FormattedText htmlText="${`{= BBF.base64Decode('${stackFormatted}') }`}" />`;
    }
    let additionalText = "";
    if (additionalData) {
      additionalText = xml`<m:VBox>
						<m:Label text="Trace Info"/>
						<code:CodeEditor type="json"  value="${`{= BBF.base64Decode('${btoa(JSON.stringify(additionalData, null, 4))}') }`}" height="300px" />
					</m:VBox>`;
    }
    return xml`<controls:FormElementWrapper xmlns:controls="sap.fe.core.controls">
					<m:VBox xmlns:m="sap.m" xmlns:code="sap.ui.codeeditor" core:require="{BBF:'sap/fe/core/buildingBlocks/BuildingBlockFormatter'}">
					${errorLabels}
					${errorStack}
						<grid:CSSGrid gridTemplateRows="fr" gridTemplateColumns="repeat(2,1fr)" gridGap="1rem" xmlns:grid="sap.ui.layout.cssgrid" >
							<m:VBox>
								<m:Label text="How the building block was called"/>
								<code:CodeEditor type="xml" value="${`{= BBF.base64Decode('${btoa(xmlFragment.replaceAll("&gt;", ">"))}') }`}" height="300px" />
							</m:VBox>
							${additionalText}
						</grid:CSSGrid>
					</m:VBox>
				</controls:FormElementWrapper>`;
  }
  const temporaryObjectStore = {};

  /**
   * Stores an object value in a temporary storage and returns an ID used to retrieve this value at a later point in time.
   *
   * Required as there is functionality like the xml` function, which might take objects as parameters but needs to return a serialized string.
   *
   * @param value Value to store
   * @returns ID to retrieve this value
   */
  function storeObjectValue(value) {
    const propertyUID = `/uid--${uid()}`;
    temporaryObjectStore[propertyUID] = value;
    return propertyUID;
  }

  /**
   * Unstores an object from a temporary store by removing it and returning its object value.
   *
   * @param propertyUID ID to retrieve this value
   * @returns Object value
   */
  function unstoreObjectValue(propertyUID) {
    const value = temporaryObjectStore[propertyUID];
    delete temporaryObjectStore[propertyUID];
    return value;
  }
  let processNextXmlInTrace = false;
  /**
   * Makes sure that all xml` calls inside the given method are processed in trace mode.
   *
   * @param method The method to execute
   * @returns The return value of the given method
   */
  const processXmlInTrace = function (method) {
    processNextXmlInTrace = true;
    let returnValue;
    try {
      returnValue = method();
    } finally {
      processNextXmlInTrace = false;
    }
    return returnValue;
  };

  /**
   * Parse an XML string and return the associated document.
   *
   * @param xmlString The xml string
   * @param [addDefaultNamespaces] Whether or not default namespaces should be added
   * @returns The XML document.
   */
  function parseXMLString(xmlString) {
    var _output2, _output3;
    let addDefaultNamespaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (addDefaultNamespaces) {
      xmlString = `<template
						xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
						xmlns:m="sap.m"
						xmlns:macros="sap.fe.macros"
						xmlns:core="sap.ui.core"
						xmlns:mdc="sap.ui.mdc"
						xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">${xmlString}</template>`;
    }
    const xmlDocument = DOMParserInstance.parseFromString(xmlString, "text/xml");
    let output = xmlDocument.firstElementChild;
    while (((_output = output) === null || _output === void 0 ? void 0 : _output.localName) === "template") {
      var _output;
      output = output.firstElementChild;
    }
    const children = (_output2 = output) !== null && _output2 !== void 0 && _output2.parentElement ? (_output3 = output) === null || _output3 === void 0 ? void 0 : _output3.parentElement.children : [output];
    return Array.from(children);
  }

  /**
   * Escape an XML attribute value.
   *
   * @param value The attribute value to escape.
   * @returns The escaped string.
   */
  _exports.parseXMLString = parseXMLString;
  function escapeXMLAttributeValue(value) {
    return value === null || value === void 0 ? void 0 : value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  _exports.escapeXMLAttributeValue = escapeXMLAttributeValue;
  function renderInTraceMode(outStr) {
    var _xmlResult$;
    const xmlResult = parseXMLString(outStr, true);
    if ((xmlResult === null || xmlResult === void 0 ? void 0 : xmlResult.length) > 0 && ((_xmlResult$ = xmlResult[0]) === null || _xmlResult$ === void 0 ? void 0 : _xmlResult$.localName) === "parsererror") {
      const errorMessage = xmlResult[0].innerText || xmlResult[0].innerHTML;
      return createErrorXML([errorMessage.split("\n")[0]], outStr);
    } else {
      return outStr;
    }
  }
  /**
   * Create a string representation of the template literal while handling special object case.
   *
   * @param strings The string parts of the template literal
   * @param values The values part of the template literal
   * @returns The XML string document representing the string that was used.
   */
  const xml = function (strings) {
    let outStr = "";
    let i;
    for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      values[_key - 1] = arguments[_key];
    }
    for (i = 0; i < values.length; i++) {
      outStr += strings[i];

      // Handle the different case of object, if it's an array we join them, if it's a binding expression then we compile it.
      const value = values[i];
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        outStr += value.flat(5).join("\n").trim();
      } else if (isFunctionArray(value)) {
        outStr += value.map(valuefn => valuefn()).join("\n");
      } else if (isBindingToolkitExpression(value)) {
        const compiledExpression = compileExpression(value);
        outStr += escapeXMLAttributeValue(compiledExpression);
      } else if (typeof value === "undefined") {
        outStr += "{this>undefinedValue}";
      } else if (typeof value === "function") {
        outStr += value();
      } else if (typeof value === "object" && value !== null) {
        if (isContext(value)) {
          outStr += value.getPath();
        } else {
          const propertyUId = storeObjectValue(value);
          outStr += `${propertyUId}`;
        }
      } else if (value && typeof value === "string" && !value.startsWith("<") && !value.startsWith("&lt;")) {
        outStr += escapeXMLAttributeValue(value);
      } else {
        outStr += value;
      }
    }
    outStr += strings[i];
    outStr = outStr.trim();
    if (processNextXmlInTrace) {
      return renderInTraceMode(outStr);
    }
    return outStr;
  };
  _exports.xml = xml;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMT0dHRVJfU0NPUEUiLCJYTUxURU1QTEFUSU5HX05TIiwiRE9NUGFyc2VySW5zdGFuY2UiLCJET01QYXJzZXIiLCJ2YWxpZGF0ZU1hY3JvTWV0YWRhdGFDb250ZXh0Iiwic05hbWUiLCJtQ29udGV4dHMiLCJvQ29udGV4dFNldHRpbmdzIiwic0tleSIsIm9Db250ZXh0Iiwib0NvbnRleHRPYmplY3QiLCJnZXRPYmplY3QiLCJyZXF1aXJlZCIsIkVycm9yIiwiaGFzT3duUHJvcGVydHkiLCIka2luZCIsInVuZGVmaW5lZCIsImV4cGVjdGVkVHlwZXMiLCJpbmRleE9mIiwiZ2V0UGF0aCIsIiRUeXBlIiwiZXhwZWN0ZWRBbm5vdGF0aW9uVHlwZXMiLCJ2YWxpZGF0ZU1hY3JvU2lnbmF0dXJlIiwib01ldGFkYXRhIiwib05vZGUiLCJhTWV0YWRhdGFDb250ZXh0S2V5cyIsIm1ldGFkYXRhQ29udGV4dHMiLCJPYmplY3QiLCJrZXlzIiwiYVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwib0F0dHJpYnV0ZU5hbWVzIiwiYXR0cmlidXRlTmFtZXMiLCJnZXRBdHRyaWJ1dGVOYW1lcyIsImF0dHJpYnV0ZU5hbWUiLCJmb3JFYWNoIiwib1Byb3BlcnR5U2V0dGluZ3MiLCJoYXNBdHRyaWJ1dGUiLCJzdGFydHNXaXRoIiwiTG9nIiwid2FybmluZyIsIlNBUF9VSV9DT1JFX0VMRU1FTlQiLCJTQVBfVUlfTU9ERUxfQ09OVEVYVCIsInRyYW5zZm9ybU1ldGFkYXRhIiwiYnVpbGRpbmdCbG9ja01ldGFkYXRhIiwiYWdncmVnYXRpb25zIiwiZGVwZW5kZW50cyIsInR5cGUiLCJzbG90IiwiY3VzdG9tRGF0YSIsImxheW91dERhdGEiLCJwcm9wZXJ0eU5hbWUiLCJwcm9wZXJ0eVR5cGUiLCJpbmNsdWRlcyIsIl9jaGVja0Fic29sdXRlQW5kQ29udGV4dFBhdGhzIiwib1NldHRpbmdzIiwic0F0dHJpYnV0ZVZhbHVlIiwic01ldGFQYXRoIiwic0NvbnRleHRQYXRoIiwiY3VycmVudENvbnRleHRQYXRoIiwiZW5kc1dpdGgiLCJtb2RlbCIsInBhdGgiLCJfY3JlYXRlSW5pdGlhbE1ldGFkYXRhQ29udGV4dCIsInNBdHRyaWJ1dGVOYW1lIiwicmV0dXJuQ29udGV4dCIsIm1vZGVscyIsImNvbnZlcnRlckNvbnRleHQiLCJnZXRQcm9wZXJ0eSIsImRhdGEiLCJ1bnN0b3JlT2JqZWN0VmFsdWUiLCJzZXRQcm9wZXJ0eSIsImJpbmRpbmdDb250ZXh0cyIsImVudGl0eVNldCIsIl9nZXRNZXRhZGF0YUNvbnRleHQiLCJvVmlzaXRvciIsImJEb05vdFJlc29sdmUiLCJpc09wZW4iLCJvTWV0YWRhdGFDb250ZXh0IiwiZ2V0QXR0cmlidXRlIiwiQmluZGluZ1BhcnNlciIsImNvbXBsZXhQYXJzZXIiLCJnZXRDb250ZXh0IiwiZSIsInByb2Nlc3NQcm9wZXJ0aWVzIiwiaXNQdWJsaWMiLCJkZWZpbml0aW9uUHJvcGVydGllcyIsImFEZWZpbml0aW9uUHJvcGVydGllc0tleXMiLCJwcm9wZXJ0eVZhbHVlcyIsInNLZXlWYWx1ZSIsImRlZmF1bHRWYWx1ZSIsImRlZXBDbG9uZSIsImVycm9yIiwidmlzaXRBdHRyaWJ1dGUiLCJhdHRyaWJ1dGVzIiwiZ2V0TmFtZWRJdGVtIiwidmFsdWUiLCJOdW1iZXIiLCJwcm9jZXNzQ29udGV4dHMiLCJjb250ZXh0UGF0aCIsIm1NaXNzaW5nQ29udGV4dCIsIm9EZWZpbml0aW9uQ29udGV4dHMiLCJhRGVmaW5pdGlvbkNvbnRleHRzS2V5cyIsImNvbnRleHRQYXRoSW5kZXgiLCJjb250ZXh0UGF0aERlZmluaXRpb24iLCJzcGxpY2UiLCJwcm9wZXJ0eVZhbHVlIiwibGVuZ3RoIiwibmFtZSIsImFkZFNpbmdsZUNvbnRleHQiLCJwYXJzZUFnZ3JlZ2F0aW9uIiwib0FnZ3JlZ2F0aW9uIiwicHJvY2Vzc0FnZ3JlZ2F0aW9ucyIsIm9PdXRPYmplY3RzIiwiY2hpbGRyZW4iLCJjaGlsZElkeCIsImNoaWxkRGVmaW5pdGlvbiIsImNoaWxkS2V5Iiwic2V0QXR0cmlidXRlIiwiYWdncmVnYXRpb25PYmplY3QiLCJrZXkiLCJwb3NpdGlvbiIsInBsYWNlbWVudCIsIlBsYWNlbWVudCIsIkFmdGVyIiwiYW5jaG9yIiwidGFnTmFtZSIsIm5vZGVOYW1lIiwicHJvY2Vzc0NoaWxkcmVuIiwib0FnZ3JlZ2F0aW9ucyIsImZpcnN0RWxlbWVudENoaWxkIiwib0ZpcnN0RWxlbWVudENoaWxkIiwibmFtZXNwYWNlVVJJIiwib1BhcmVudCIsInBhcmVudE5vZGUiLCJpQ2hpbGRJbmRleCIsIkFycmF5IiwiZnJvbSIsInZpc2l0Tm9kZSIsIm5leHRFbGVtZW50U2libGluZyIsInNDaGlsZE5hbWUiLCJsb2NhbE5hbWUiLCJzQWdncmVnYXRpb25OYW1lIiwidG9VcHBlckNhc2UiLCJkZWZhdWx0QWdncmVnYXRpb24iLCJhZ2dyZWdhdGlvbkRlZmluaXRpb24iLCJwYXJzZWRBZ2dyZWdhdGlvbiIsInBhcnNlZEFnZ3JlZ2F0aW9uS2V5Iiwib05leHRDaGlsZCIsIm5leHRDaGlsZCIsImhhc1ZpcnR1YWxOb2RlIiwiY2hpbGRXcmFwcGVyIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJhcHBlbmRDaGlsZCIsInJlbW92ZUF0dHJpYnV0ZSIsIm9OZXdDaGlsZCIsImFnZ3JlZ2F0aW9uUHJvcGVydHlWYWx1ZXMiLCJjaGlsZEluZGV4Iiwic3ViQ2hpbGQiLCJzdWJPYmplY3RLZXkiLCJzdWJPYmplY3QiLCJzdWJDaGlsZEF0dHJpYnV0ZU5hbWVzIiwic3ViQ2hpbGRBdHRyaWJ1dGVOYW1lIiwibXlDaGlsZCIsInB1c2giLCJwcm9jZXNzU2xvdHMiLCJvTWV0YWRhdGFBZ2dyZWdhdGlvbnMiLCJwcm9jZXNzQ3VzdG9tRGF0YSIsIm9BZ2dyZWdhdGlvbkVsZW1lbnQiLCJvRWxlbWVudENoaWxkIiwic1Nsb3ROYW1lIiwib1RhcmdldEVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicHJlcGFyZUFnZ3JlZ2F0aW9uRWxlbWVudCIsInJlcGxhY2VXaXRoIiwicmVwbGFjZSIsInByb2Nlc3NCdWlsZGluZ0Jsb2NrIiwiQnVpbGRpbmdCbG9ja0NsYXNzIiwibWV0YWRhdGEiLCJzRnJhZ21lbnROYW1lIiwiZnJhZ21lbnQiLCJuYW1lc3BhY2UiLCJwdWJsaWNOYW1lc3BhY2UiLCJ4bWxUYWciLCJnZXRTZXR0aW5ncyIsIkpTT05Nb2RlbCIsImluaXRpYWxLZXlzIiwib0NvbnRyb2xDb25maWciLCJ2aWV3RGF0YSIsInByb2Nlc3NlZFByb3BlcnR5VmFsdWVzIiwicHJvcE5hbWUiLCJvRGF0YSIsIm9yaWdpbmFsRGVmaW5pdGlvbiIsInZhbGlkYXRlIiwiaXNBIiwiZ2V0TW9kZWwiLCJvSW5zdGFuY2UiLCJnZXRQcm9wZXJ0aWVzIiwic0NvbnRleHROYW1lIiwidGFyZ2V0T2JqZWN0IiwiaXNDb250ZXh0IiwiYXR0cmlidXRlVmFsdWUiLCJzdG9yZU9iamVjdFZhbHVlIiwibmV3Q29udGV4dCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0Iiwib0F0dHJpYnV0ZXNNb2RlbCIsIkF0dHJpYnV0ZU1vZGVsIiwib1ByZXZpb3VzTWFjcm9JbmZvIiwiVHJhY2VJbmZvIiwiaXNUcmFjZUluZm9BY3RpdmUiLCJvVHJhY2VJbmZvIiwidHJhY2VNYWNyb0NhbGxzIiwibWFjcm9JbmZvIiwib0NvbnRleHRWaXNpdG9yIiwid2l0aCIsIm9Qcm9taXNlIiwiaW5zZXJ0RnJhZ21lbnQiLCJ0ZW1wbGF0ZVN0cmluZyIsImdldFRlbXBsYXRlIiwiaXNSdW50aW1lIiwic3RvcmVLZXkiLCJ0ZW1wb3JhcnlPYmplY3RTdG9yZSIsImhhc0Vycm9yIiwiaGFzUGFyc2VFcnJvciIsInBhcnNlZFRlbXBsYXRlIiwicGFyc2VYTUxTdHJpbmciLCJlbGVtZW50IiwiaXRlciIsImNyZWF0ZU5vZGVJdGVyYXRvciIsIk5vZGVGaWx0ZXIiLCJTSE9XX1RFWFQiLCJ0ZXh0bm9kZSIsIm5leHROb2RlIiwidGV4dENvbnRlbnQiLCJ0cmltIiwicHJvY2Vzc1htbEluVHJhY2UiLCJpbml0aWFsVGVtcGxhdGUiLCJvRXJyb3JUZXh0IiwiY3JlYXRlRXJyb3JYTUwiLCJtYXAiLCJ0ZW1wbGF0ZSIsIm91dGVySFRNTCIsImpvaW4iLCJ2aXNpdGVkTm9kZXMiLCJpbnRlcm5hbE5vZGUiLCJQcm9taXNlIiwiYWxsIiwicmVtb3ZlIiwicmVzb2x2ZSIsIm9NYWNyb0VsZW1lbnQiLCJvUmVtYWluaW5nU2xvdHMiLCJxdWVyeVNlbGVjdG9yQWxsIiwib1Nsb3RFbGVtZW50IiwidHJhY2VEZXRhaWxzIiwiaW5pdGlhbFByb3BlcnRpZXMiLCJyZXNvbHZlZFByb3BlcnRpZXMiLCJtaXNzaW5nQ29udGV4dHMiLCJvRXJyb3IiLCJzdGFjayIsIm9UZW1wbGF0ZSIsIm9DdHgiLCJtU2V0dGluZyIsImV4IiwicmVnaXN0ZXJCdWlsZGluZ0Jsb2NrIiwiWE1MUHJlcHJvY2Vzc29yIiwicGx1Z0luIiwidW5yZWdpc3RlckJ1aWxkaW5nQmxvY2siLCJlcnJvck1lc3NhZ2VzIiwieG1sRnJhZ21lbnQiLCJhZGRpdGlvbmFsRGF0YSIsImVycm9yTGFiZWxzIiwiZXJyb3JNZXNzYWdlIiwieG1sIiwiZXNjYXBlWE1MQXR0cmlidXRlVmFsdWUiLCJlcnJvclN0YWNrIiwic3RhY2tGb3JtYXR0ZWQiLCJidG9hIiwiYWRkaXRpb25hbFRleHQiLCJKU09OIiwic3RyaW5naWZ5IiwicmVwbGFjZUFsbCIsInByb3BlcnR5VUlEIiwidWlkIiwicHJvY2Vzc05leHRYbWxJblRyYWNlIiwibWV0aG9kIiwicmV0dXJuVmFsdWUiLCJ4bWxTdHJpbmciLCJhZGREZWZhdWx0TmFtZXNwYWNlcyIsInhtbERvY3VtZW50IiwicGFyc2VGcm9tU3RyaW5nIiwib3V0cHV0IiwicGFyZW50RWxlbWVudCIsInJlbmRlckluVHJhY2VNb2RlIiwib3V0U3RyIiwieG1sUmVzdWx0IiwiaW5uZXJUZXh0IiwiaW5uZXJIVE1MIiwic3BsaXQiLCJzdHJpbmdzIiwiaSIsInZhbHVlcyIsImlzQXJyYXkiLCJmbGF0IiwiaXNGdW5jdGlvbkFycmF5IiwidmFsdWVmbiIsImlzQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIiwiY29tcGlsZWRFeHByZXNzaW9uIiwiY29tcGlsZUV4cHJlc3Npb24iLCJwcm9wZXJ0eVVJZCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGRlZXBDbG9uZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwQ2xvbmVcIjtcbmltcG9ydCB1aWQgZnJvbSBcInNhcC9iYXNlL3V0aWwvdWlkXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IEF0dHJpYnV0ZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9BdHRyaWJ1dGVNb2RlbFwiO1xuaW1wb3J0IHR5cGUgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEJ1aWxkaW5nQmxvY2tBZ2dyZWdhdGlvbkRlZmluaXRpb24sXG5cdEJ1aWxkaW5nQmxvY2tNZXRhZGF0YSxcblx0QnVpbGRpbmdCbG9ja01ldGFkYXRhQ29udGV4dERlZmluaXRpb24sXG5cdEJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24sXG5cdE9iamVjdFZhbHVlLFxuXHRPYmplY3RWYWx1ZTJcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgdHlwZSB7IFBvc2l0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IFBsYWNlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBjb21waWxlRXhwcmVzc2lvbiwgaXNCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgaXNDb250ZXh0LCBpc0Z1bmN0aW9uQXJyYXkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9UeXBlR3VhcmRzXCI7XG5pbXBvcnQgdHlwZSBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgQmluZGluZ1BhcnNlciBmcm9tIFwic2FwL3VpL2Jhc2UvQmluZGluZ1BhcnNlclwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIHsgTWFjcm9JbmZvLCBUcmFjZU1ldGFkYXRhQ29udGV4dCB9IGZyb20gXCIuL1RyYWNlSW5mb1wiO1xuaW1wb3J0IFRyYWNlSW5mbyBmcm9tIFwiLi9UcmFjZUluZm9cIjtcblxuY29uc3QgTE9HR0VSX1NDT1BFID0gXCJzYXAuZmUuY29yZS5idWlsZGluZ0Jsb2Nrcy5CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmNvbnN0IFhNTFRFTVBMQVRJTkdfTlMgPSBcImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS50ZW1wbGF0ZS8xXCI7XG5jb25zdCBET01QYXJzZXJJbnN0YW5jZSA9IG5ldyBET01QYXJzZXIoKTtcblxuZXhwb3J0IHR5cGUgVHJhbnNmb3JtZWRCdWlsZGluZ0Jsb2NrTWV0YWRhdGEgPSBCdWlsZGluZ0Jsb2NrTWV0YWRhdGEgJiB7XG5cdG1ldGFkYXRhQ29udGV4dHM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tNZXRhZGF0YUNvbnRleHREZWZpbml0aW9uPjtcbn07XG5cbi8qKlxuICogRGVmaW5pdGlvbiBvZiBhIG1ldGEgZGF0YSBjb250ZXh0XG4gKi9cbnR5cGUgTWV0YURhdGFDb250ZXh0ID0ge1xuXHRuYW1lPzogc3RyaW5nO1xuXHRtb2RlbDogc3RyaW5nO1xuXHRwYXRoOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBUZW1wbGF0ZVByb2Nlc3NvclNldHRpbmdzID0ge1xuXHRjdXJyZW50Q29udGV4dFBhdGg6IENvbnRleHQ7XG5cdGlzUHVibGljOiBib29sZWFuO1xuXHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudDtcblx0bW9kZWxzOiBSZWNvcmQ8c3RyaW5nLCBNb2RlbD4gJiB7XG5cdFx0Y29udmVydGVyQ29udGV4dDogSlNPTk1vZGVsO1xuXHRcdHZpZXdEYXRhOiBKU09OTW9kZWw7XG5cdFx0bWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbDtcblx0XHRcInNhcC5mZS5pMThuXCI/OiBSZXNvdXJjZU1vZGVsO1xuXHR9O1xuXHRiaW5kaW5nQ29udGV4dHM6IFJlY29yZDxzdHJpbmcsIENvbnRleHQ+O1xuXHRfbWFjcm9JbmZvPzogTWFjcm9JbmZvO1xuXHRbazogc3RyaW5nXTogdW5rbm93bjtcbn07XG5cbmV4cG9ydCB0eXBlIElWaXNpdG9yQ2FsbGJhY2sgPSB7XG5cdGdldFNldHRpbmdzKCk6IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3M7XG5cdC8qKlxuXHQgKiBWaXNpdHMgdGhlIGdpdmVuIG5vZGUgYW5kIGVpdGhlciBwcm9jZXNzZXMgYSB0ZW1wbGF0ZSBpbnN0cnVjdGlvbiwgY2FsbHNcblx0ICogYSB2aXNpdG9yLCBvciBzaW1wbHkgY2FsbHMgYm90aCB7QGxpbmtcblx0ICogc2FwLnVpLmNvcmUudXRpbC5YTUxQcmVwcm9jZXNzb3IuSUNhbGxiYWNrLnZpc2l0QXR0cmlidXRlcyB2aXNpdEF0dHJpYnV0ZXN9XG5cdCAqIGFuZCB7QGxpbmsgc2FwLnVpLmNvcmUudXRpbC5YTUxQcmVwcm9jZXNzb3IuSUNhbGxiYWNrLnZpc2l0Q2hpbGROb2Rlc1xuXHQgKiB2aXNpdENoaWxkTm9kZXN9LlxuXHQgKlxuXHQgKiBAcGFyYW0gb05vZGVcblx0ICogICBUaGUgWE1MIERPTSBub2RlXG5cdCAqIEByZXR1cm5zXG5cdCAqICAgQSB0aGVuYWJsZSB3aGljaCByZXNvbHZlcyB3aXRoIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gYXMgc29vbiBhcyB2aXNpdGluZ1xuXHQgKiAgIGlzIGRvbmUsIG9yIGlzIHJlamVjdGVkIHdpdGggYSBjb3JyZXNwb25kaW5nIGVycm9yIGlmIHZpc2l0aW5nIGZhaWxzXG5cdCAqL1xuXHR2aXNpdE5vZGUob05vZGU6IE5vZGUpOiBQcm9taXNlPHZvaWQ+O1xuXG5cdC8qKlxuXHQgKiBJbnNlcnRzIHRoZSBmcmFnbWVudCB3aXRoIHRoZSBnaXZlbiBuYW1lIGluIHBsYWNlIG9mIHRoZSBnaXZlbiBlbGVtZW50LiBMb2FkcyB0aGVcblx0ICogZnJhZ21lbnQsIHRha2VzIGNhcmUgb2YgY2FjaGluZyAoZm9yIHRoZSBjdXJyZW50IHByZS1wcm9jZXNzb3IgcnVuKSBhbmQgdmlzaXRzIHRoZVxuXHQgKiBmcmFnbWVudCdzIGNvbnRlbnQgb25jZSBpdCBoYXMgYmVlbiBpbXBvcnRlZCBpbnRvIHRoZSBlbGVtZW50J3Mgb3duZXIgZG9jdW1lbnQgYW5kXG5cdCAqIHB1dCBpbnRvIHBsYWNlLiBMb2FkaW5nIG9mIGZyYWdtZW50cyBpcyBhc3luY2hyb25vdXMgaWYgdGhlIHRlbXBsYXRlIHZpZXcgaXNcblx0ICogYXN5bmNocm9ub3VzLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0ZyYWdtZW50XG5cdCAqICAgdGhlIGZyYWdtZW50J3MgcmVzb2x2ZWQgbmFtZVxuXHQgKiBAcGFyYW0gb0VsZW1lbnRcblx0ICogICB0aGUgWE1MIERPTSBlbGVtZW50LCBlLmcuIDxzYXAudWkuY29yZTpGcmFnbWVudD4gb3IgPGNvcmU6RXh0ZW5zaW9uUG9pbnQ+XG5cdCAqIEBwYXJhbSBvV2l0aFxuXHQgKiAgIHRoZSBwYXJlbnQncyBcIndpdGhcIiBjb250cm9sXG5cdCAqIEByZXR1cm5zXG5cdCAqIEEgc3luYyBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHdpdGggPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiBhcyBzb29uIGFzIHRoZSBmcmFnbWVudFxuXHQgKiAgIGhhcyBiZWVuIGluc2VydGVkLCBvciBpcyByZWplY3RlZCB3aXRoIGEgY29ycmVzcG9uZGluZyBlcnJvciBpZiBsb2FkaW5nIG9yIHZpc2l0aW5nXG5cdCAqICAgZmFpbHMuXG5cdCAqL1xuXHRpbnNlcnRGcmFnbWVudChzRnJhZ21lbnQ6IHN0cmluZywgb0VsZW1lbnQ6IEVsZW1lbnQsIG9XaXRoPzogQ29udHJvbCk6IFByb21pc2U8dm9pZD47XG5cdHZpc2l0QXR0cmlidXRlKG9Ob2RlOiBFbGVtZW50LCBvQXR0cmlidXRlOiBBdHRyKTogUHJvbWlzZTx2b2lkPjtcblx0dmlzaXRBdHRyaWJ1dGVzKG9Ob2RlOiBFbGVtZW50KTogUHJvbWlzZTx2b2lkPjtcblx0Z2V0Vmlld0luZm8oKTogUHJvbWlzZTx1bmtub3duPjtcblx0dmlzaXRDaGlsZE5vZGVzKG9Ob2RlOiBOb2RlKTogUHJvbWlzZTx2b2lkPjtcblx0LyoqXG5cdCAqIEludGVycHJldHMgdGhlIGdpdmVuIFhNTCBET00gYXR0cmlidXRlIHZhbHVlIGFzIGEgYmluZGluZyBhbmQgcmV0dXJucyB0aGVcblx0ICogcmVzdWx0aW5nIHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1ZhbHVlXG5cdCAqICAgQW4gWE1MIERPTSBhdHRyaWJ1dGUgdmFsdWVcblx0ICogQHBhcmFtIFtlbGVtZW50XVxuXHQgKiAgIFRoZSBYTUwgRE9NIGVsZW1lbnQgdGhlIGF0dHJpYnV0ZSB2YWx1ZSBiZWxvbmdzIHRvIChuZWVkZWQgb25seSBmb3Jcblx0ICogICB3YXJuaW5ncyB3aGljaCBhcmUgbG9nZ2VkIHRvIHRoZSBjb25zb2xlKVxuXHQgKiBAcmV0dXJuc1xuXHQgKiAgIEEgdGhlbmFibGUgd2hpY2ggcmVzb2x2ZXMgd2l0aCB0aGUgcmVzdWx0aW5nIHZhbHVlLCBvciBpcyByZWplY3RlZCB3aXRoIGFcblx0ICogICBjb3JyZXNwb25kaW5nIGVycm9yIChmb3IgZXhhbXBsZSwgYW4gZXJyb3IgdGhyb3duIGJ5IGEgZm9ybWF0dGVyKSBvclxuXHQgKiAgIDxjb2RlPm51bGw8L2NvZGU+IGluIGNhc2UgdGhlIGJpbmRpbmcgaXMgbm90IHJlYWR5IChiZWNhdXNlIGl0IHJlZmVycyB0byBhXG5cdCAqICAgbW9kZWwgd2hpY2ggaXMgbm90IGF2YWlsYWJsZSkgKHNpbmNlIDEuNTcuMClcblx0ICovXG5cdGdldFJlc3VsdChzVmFsdWU6IHN0cmluZywgZWxlbWVudD86IEVsZW1lbnQpOiBQcm9taXNlPENvbnRleHQ+IHwgbnVsbDtcblx0Z2V0Q29udGV4dChzUGF0aD86IHN0cmluZyk6IENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgY2FsbGJhY2sgaW50ZXJmYWNlIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gbWFwIG9mIHZhcmlhYmxlcyB3aGljaFxuXHQgKiBvdmVycmlkZSBjdXJyZW50bHkga25vd24gdmFyaWFibGVzIG9mIHRoZSBzYW1lIG5hbWUgaW4gPGNvZGU+dGhpczwvY29kZT5cblx0ICogcGFyZW50IGludGVyZmFjZSBvciByZXBsYWNlIHRoZW0gYWx0b2dldGhlci4gRWFjaCB2YXJpYWJsZSBuYW1lIGJlY29tZXMgYVxuXHQgKiBuYW1lZCBtb2RlbCB3aXRoIGEgY29ycmVzcG9uZGluZyBvYmplY3QgYmluZGluZyBhbmQgY2FuIGJlIHVzZWQgaW5zaWRlIHRoZVxuXHQgKiBYTUwgdGVtcGxhdGUgaW4gdGhlIHVzdWFsIHdheSwgdGhhdCBpcywgd2l0aCBhIGJpbmRpbmcgZXhwcmVzc2lvbiBsaWtlXG5cdCAqIDxjb2RlPlwie3Zhcj5zb21lL3JlbGF0aXZlL3BhdGh9XCI8L2NvZGU+IChzZWUgZXhhbXBsZSkuXG5cdCAqXG5cdCAqIEBwYXJhbSBbbVZhcmlhYmxlcz17fV1cblx0ICogICBNYXAgZnJvbSB2YXJpYWJsZSBuYW1lIChzdHJpbmcpIHRvIHZhbHVlXG5cdCAqIEBwYXJhbSBbYlJlcGxhY2VdXG5cdCAqICAgV2hldGhlciBvbmx5IHRoZSBnaXZlbiB2YXJpYWJsZXMgYXJlIGtub3duIGluIHRoZSBuZXcgY2FsbGJhY2sgaW50ZXJmYWNlXG5cdCAqICAgaW5zdGFuY2UsIG5vIGluaGVyaXRlZCBvbmVzXG5cdCAqIEByZXR1cm5zXG5cdCAqICAgQSBjYWxsYmFjayBpbnRlcmZhY2UgaW5zdGFuY2Vcblx0ICogQHBhcmFtIG1WYXJpYWJsZXNcblx0ICogQHBhcmFtIGJSZXBsYWNlXG5cdCAqL1xuXHRcIndpdGhcIihtVmFyaWFibGVzPzogUmVjb3JkPHN0cmluZywgQ29udGV4dD4sIGJSZXBsYWNlPzogYm9vbGVhbik6IElWaXNpdG9yQ2FsbGJhY2s7XG59O1xuXG5mdW5jdGlvbiB2YWxpZGF0ZU1hY3JvTWV0YWRhdGFDb250ZXh0KFxuXHRzTmFtZTogc3RyaW5nLFxuXHRtQ29udGV4dHM6IFJlY29yZDxzdHJpbmcsIENvbnRleHQ+LFxuXHRvQ29udGV4dFNldHRpbmdzOiBCdWlsZGluZ0Jsb2NrTWV0YWRhdGFDb250ZXh0RGVmaW5pdGlvbixcblx0c0tleTogc3RyaW5nXG4pIHtcblx0Y29uc3Qgb0NvbnRleHQgPSBtQ29udGV4dHNbc0tleV07XG5cdGNvbnN0IG9Db250ZXh0T2JqZWN0ID0gb0NvbnRleHQ/LmdldE9iamVjdCgpIGFzIHtcblx0XHQkVHlwZT86IHN0cmluZztcblx0XHQka2luZD86IHN0cmluZztcblx0fTtcblxuXHRpZiAob0NvbnRleHRTZXR0aW5ncy5yZXF1aXJlZCA9PT0gdHJ1ZSAmJiAoIW9Db250ZXh0IHx8IG9Db250ZXh0T2JqZWN0ID09PSBudWxsKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgJHtzTmFtZX06IFJlcXVpcmVkIG1ldGFkYXRhQ29udGV4dCAnJHtzS2V5fScgaXMgbWlzc2luZ2ApO1xuXHR9IGVsc2UgaWYgKG9Db250ZXh0T2JqZWN0KSB7XG5cdFx0Ly8gSWYgY29udGV4dCBvYmplY3QgaGFzICRraW5kIHByb3BlcnR5LCAkVHlwZSBzaG91bGQgbm90IGJlIGNoZWNrZWRcblx0XHQvLyBUaGVyZWZvcmUgcmVtb3ZlIGZyb20gY29udGV4dCBzZXR0aW5nc1xuXHRcdGlmIChvQ29udGV4dE9iamVjdC5oYXNPd25Qcm9wZXJ0eShcIiRraW5kXCIpICYmIG9Db250ZXh0T2JqZWN0LiRraW5kICE9PSB1bmRlZmluZWQgJiYgb0NvbnRleHRTZXR0aW5ncy5leHBlY3RlZFR5cGVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIENoZWNrIGlmIHRoZSAka2luZCBpcyBwYXJ0IG9mIHRoZSBhbGxvd2VkIG9uZXNcblx0XHRcdGlmIChvQ29udGV4dFNldHRpbmdzLmV4cGVjdGVkVHlwZXMuaW5kZXhPZihvQ29udGV4dE9iamVjdC4ka2luZCkgPT09IC0xKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRgJHtzTmFtZX06ICcke3NLZXl9JyBtdXN0IGJlICcka2luZCcgJyR7b0NvbnRleHRTZXR0aW5ncy5leHBlY3RlZFR5cGVzfScgYnV0IGlzICcke1xuXHRcdFx0XHRcdFx0b0NvbnRleHRPYmplY3QuJGtpbmRcblx0XHRcdFx0XHR9JzogJHtvQ29udGV4dC5nZXRQYXRoKCl9YFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRvQ29udGV4dE9iamVjdC5oYXNPd25Qcm9wZXJ0eShcIiRUeXBlXCIpICYmXG5cdFx0XHRvQ29udGV4dE9iamVjdC4kVHlwZSAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRvQ29udGV4dFNldHRpbmdzLmV4cGVjdGVkQW5ub3RhdGlvblR5cGVzXG5cdFx0KSB7XG5cdFx0XHQvLyBDaGVjayBvbmx5ICRUeXBlXG5cdFx0XHRpZiAob0NvbnRleHRTZXR0aW5ncy5leHBlY3RlZEFubm90YXRpb25UeXBlcy5pbmRleE9mKG9Db250ZXh0T2JqZWN0LiRUeXBlKSA9PT0gLTEpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdGAke3NOYW1lfTogJyR7c0tleX0nIG11c3QgYmUgJyRUeXBlJyAnJHtvQ29udGV4dFNldHRpbmdzLmV4cGVjdGVkQW5ub3RhdGlvblR5cGVzfScgYnV0IGlzICcke1xuXHRcdFx0XHRcdFx0b0NvbnRleHRPYmplY3QuJFR5cGVcblx0XHRcdFx0XHR9JzogJHtvQ29udGV4dC5nZXRQYXRoKCl9YFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTWFjcm9TaWduYXR1cmUoXG5cdHNOYW1lOiBzdHJpbmcsXG5cdG9NZXRhZGF0YTogVHJhbnNmb3JtZWRCdWlsZGluZ0Jsb2NrTWV0YWRhdGEsXG5cdG1Db250ZXh0czogUmVjb3JkPHN0cmluZywgQ29udGV4dD4sXG5cdG9Ob2RlOiBFbGVtZW50XG4pIHtcblx0Y29uc3QgYU1ldGFkYXRhQ29udGV4dEtleXMgPSAob01ldGFkYXRhLm1ldGFkYXRhQ29udGV4dHMgJiYgT2JqZWN0LmtleXMob01ldGFkYXRhLm1ldGFkYXRhQ29udGV4dHMpKSB8fCBbXSxcblx0XHRhUHJvcGVydGllcyA9IChvTWV0YWRhdGEucHJvcGVydGllcyAmJiBPYmplY3Qua2V5cyhvTWV0YWRhdGEucHJvcGVydGllcykpIHx8IFtdLFxuXHRcdG9BdHRyaWJ1dGVOYW1lczogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gPSB7fTtcblxuXHQvLyBjb2xsZWN0IGFsbCBhdHRyaWJ1dGVzIHRvIGZpbmQgdW5jaGVja2VkIHByb3BlcnRpZXNcblx0Y29uc3QgYXR0cmlidXRlTmFtZXMgPSBvTm9kZS5nZXRBdHRyaWJ1dGVOYW1lcygpO1xuXHRmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgb2YgYXR0cmlidXRlTmFtZXMpIHtcblx0XHRvQXR0cmlidXRlTmFtZXNbYXR0cmlidXRlTmFtZV0gPSB0cnVlO1xuXHR9XG5cblx0Ly9DaGVjayBtZXRhZGF0YUNvbnRleHRzXG5cdGFNZXRhZGF0YUNvbnRleHRLZXlzLmZvckVhY2goZnVuY3Rpb24gKHNLZXkpIHtcblx0XHRjb25zdCBvQ29udGV4dFNldHRpbmdzID0gb01ldGFkYXRhLm1ldGFkYXRhQ29udGV4dHNbc0tleV07XG5cblx0XHR2YWxpZGF0ZU1hY3JvTWV0YWRhdGFDb250ZXh0KHNOYW1lLCBtQ29udGV4dHMsIG9Db250ZXh0U2V0dGluZ3MsIHNLZXkpO1xuXHRcdGRlbGV0ZSBvQXR0cmlidXRlTmFtZXNbc0tleV07XG5cdH0pO1xuXHQvL0NoZWNrIHByb3BlcnRpZXNcblx0YVByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAoc0tleSkge1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eVNldHRpbmdzID0gb01ldGFkYXRhLnByb3BlcnRpZXNbc0tleV07XG5cdFx0aWYgKCFvTm9kZS5oYXNBdHRyaWJ1dGUoc0tleSkpIHtcblx0XHRcdGlmIChvUHJvcGVydHlTZXR0aW5ncy5yZXF1aXJlZCAmJiAhb1Byb3BlcnR5U2V0dGluZ3MuaGFzT3duUHJvcGVydHkoXCJkZWZhdWx0VmFsdWVcIikpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGAke3NOYW1lfTogYCArIGBSZXF1aXJlZCBwcm9wZXJ0eSAnJHtzS2V5fScgaXMgbWlzc2luZ2ApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRkZWxldGUgb0F0dHJpYnV0ZU5hbWVzW3NLZXldO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gVW5jaGVja2VkIHByb3BlcnRpZXNcblx0T2JqZWN0LmtleXMob0F0dHJpYnV0ZU5hbWVzKS5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHQvLyBubyBjaGVjayBmb3IgcHJvcGVydGllcyB3aGljaCBjb250YWluIGEgY29sb24gXCI6XCIgKGRpZmZlcmVudCBuYW1lc3BhY2UpLCBlLmcuIHhtbG5zOnRyYWNlLCB0cmFjZTptYWNyb0lELCB1bml0dGVzdDppZFxuXHRcdGlmIChzS2V5LmluZGV4T2YoXCI6XCIpIDwgMCAmJiAhc0tleS5zdGFydHNXaXRoKFwieG1sbnNcIikpIHtcblx0XHRcdExvZy53YXJuaW5nKGBVbmNoZWNrZWQgcGFyYW1ldGVyOiAke3NOYW1lfTogJHtzS2V5fWAsIHVuZGVmaW5lZCwgTE9HR0VSX1NDT1BFKTtcblx0XHR9XG5cdH0pO1xufVxuXG5jb25zdCBTQVBfVUlfQ09SRV9FTEVNRU5UID0gXCJzYXAudWkuY29yZS5FbGVtZW50XCI7XG5cbmV4cG9ydCBjb25zdCBTQVBfVUlfTU9ERUxfQ09OVEVYVCA9IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIjtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSBtZXRhZGF0YSBvZiBhIGJ1aWxkaW5nIGJsb2NrIGJ5IGFkZGluZyBhZGRpdGlvbmFsIGFnZ3JlZ2F0aW9ucyxcbiAqIGFuZCBzcGxpdHRpbmcgcHJvcGVydGllcyBpbnRvIGFjdHVhbCBwcm9wZXJ0aWVzIGFuZCBtZXRhZGF0YSBjb250ZXh0cy5cbiAqXG4gKiBAcGFyYW0gYnVpbGRpbmdCbG9ja01ldGFkYXRhIFRoZSBtZXRhZGF0YSByZWNlaXZlZCBmcm9tIHRoZSBpbnB1dFxuICogQHJldHVybnMgVGhlIHRyYW5zZm9ybWVkIG1ldGFkYXRhXG4gKi9cbmZ1bmN0aW9uIHRyYW5zZm9ybU1ldGFkYXRhKGJ1aWxkaW5nQmxvY2tNZXRhZGF0YTogQnVpbGRpbmdCbG9ja01ldGFkYXRhKTogVHJhbnNmb3JtZWRCdWlsZGluZ0Jsb2NrTWV0YWRhdGEge1xuXHRjb25zdCBwcm9wZXJ0aWVzOiBSZWNvcmQ8c3RyaW5nLCBCdWlsZGluZ0Jsb2NrUHJvcGVydHlEZWZpbml0aW9uPiA9IHt9O1xuXHRjb25zdCBhZ2dyZWdhdGlvbnM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tBZ2dyZWdhdGlvbkRlZmluaXRpb24+ID0ge1xuXHRcdGRlcGVuZGVudHM6IHtcblx0XHRcdHR5cGU6IFNBUF9VSV9DT1JFX0VMRU1FTlQsXG5cdFx0XHRzbG90OiBcImRlcGVuZGVudHNcIlxuXHRcdH0sXG5cdFx0Y3VzdG9tRGF0YToge1xuXHRcdFx0dHlwZTogU0FQX1VJX0NPUkVfRUxFTUVOVCxcblx0XHRcdHNsb3Q6IFwiY3VzdG9tRGF0YVwiXG5cdFx0fSxcblx0XHRsYXlvdXREYXRhOiB7XG5cdFx0XHR0eXBlOiBTQVBfVUlfQ09SRV9FTEVNRU5ULFxuXHRcdFx0c2xvdDogXCJsYXlvdXREYXRhXCJcblx0XHR9LFxuXHRcdC4uLmJ1aWxkaW5nQmxvY2tNZXRhZGF0YS5hZ2dyZWdhdGlvbnNcblx0fTtcblx0Y29uc3QgbWV0YWRhdGFDb250ZXh0czogUmVjb3JkPHN0cmluZywgQnVpbGRpbmdCbG9ja01ldGFkYXRhQ29udGV4dERlZmluaXRpb24+ID0ge307XG5cblx0Zm9yIChjb25zdCBwcm9wZXJ0eU5hbWUgb2YgT2JqZWN0LmtleXMoYnVpbGRpbmdCbG9ja01ldGFkYXRhLnByb3BlcnRpZXMpKSB7XG5cdFx0Y29uc3QgcHJvcGVydHlUeXBlID0gYnVpbGRpbmdCbG9ja01ldGFkYXRhLnByb3BlcnRpZXNbcHJvcGVydHlOYW1lXS50eXBlO1xuXG5cdFx0aWYgKHByb3BlcnR5VHlwZSAhPT0gU0FQX1VJX01PREVMX0NPTlRFWFQpIHtcblx0XHRcdHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9IGJ1aWxkaW5nQmxvY2tNZXRhZGF0YS5wcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV07XG5cdFx0fVxuXG5cdFx0aWYgKFtTQVBfVUlfTU9ERUxfQ09OVEVYVCwgXCJvYmplY3RcIiwgXCJhcnJheVwiXS5pbmNsdWRlcyhwcm9wZXJ0eVR5cGUpKSB7XG5cdFx0XHQvLyBFeHBsaWNpdGx5IGRlZmluZWQgY29udGV4dHMsIG9iamVjdHMsIGFuZCBhcnJheXMgbWF5IGNvbWUgZnJvbSB0aGUgbWV0YWRhdGFDb250ZXh0XG5cdFx0XHRtZXRhZGF0YUNvbnRleHRzW3Byb3BlcnR5TmFtZV0gPSBidWlsZGluZ0Jsb2NrTWV0YWRhdGEucHJvcGVydGllc1twcm9wZXJ0eU5hbWVdIGFzIEJ1aWxkaW5nQmxvY2tNZXRhZGF0YUNvbnRleHREZWZpbml0aW9uO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Li4uYnVpbGRpbmdCbG9ja01ldGFkYXRhLFxuXHRcdHByb3BlcnRpZXMsXG5cdFx0bWV0YWRhdGFDb250ZXh0cyxcblx0XHRhZ2dyZWdhdGlvbnNcblx0fTtcbn1cblxuLyoqXG4gKiBDaGVja3MgdGhlIGFic29sdXRlIG9yIGNvbnRleHQgcGF0aHMgYW5kIHJldHVybnMgYW4gYXBwcm9wcmlhdGUgTWV0YUNvbnRleHQuXG4gKlxuICogQHBhcmFtIG9TZXR0aW5ncyBBZGRpdGlvbmFsIHNldHRpbmdzXG4gKiBAcGFyYW0gc0F0dHJpYnV0ZVZhbHVlIFRoZSBhdHRyaWJ1dGUgdmFsdWVcbiAqIEByZXR1cm5zIFRoZSBtZXRhIGRhdGEgY29udGV4dCBvYmplY3RcbiAqL1xuZnVuY3Rpb24gX2NoZWNrQWJzb2x1dGVBbmRDb250ZXh0UGF0aHMob1NldHRpbmdzOiBUZW1wbGF0ZVByb2Nlc3NvclNldHRpbmdzLCBzQXR0cmlidXRlVmFsdWU6IHN0cmluZyk6IE1ldGFEYXRhQ29udGV4dCB7XG5cdGxldCBzTWV0YVBhdGg6IHN0cmluZztcblx0aWYgKHNBdHRyaWJ1dGVWYWx1ZSAmJiBzQXR0cmlidXRlVmFsdWUuc3RhcnRzV2l0aChcIi9cIikpIHtcblx0XHQvLyBhYnNvbHV0ZSBwYXRoIC0gd2UganVzdCB1c2UgdGhpcyBvbmVcblx0XHRzTWV0YVBhdGggPSBzQXR0cmlidXRlVmFsdWU7XG5cdH0gZWxzZSB7XG5cdFx0bGV0IHNDb250ZXh0UGF0aCA9IG9TZXR0aW5ncy5jdXJyZW50Q29udGV4dFBhdGguZ2V0UGF0aCgpO1xuXHRcdGlmICghc0NvbnRleHRQYXRoLmVuZHNXaXRoKFwiL1wiKSkge1xuXHRcdFx0c0NvbnRleHRQYXRoICs9IFwiL1wiO1xuXHRcdH1cblx0XHRzTWV0YVBhdGggPSBzQ29udGV4dFBhdGggKyBzQXR0cmlidXRlVmFsdWU7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRtb2RlbDogXCJtZXRhTW9kZWxcIixcblx0XHRwYXRoOiBzTWV0YVBhdGhcblx0fTtcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBoZWxwcyB0byBjcmVhdGUgdGhlIG1ldGFkYXRhIGNvbnRleHQgaW4gY2FzZSBpdCBpcyBub3QgeWV0IGF2YWlsYWJsZSBpbiB0aGUgc3RvcmUuXG4gKlxuICogQHBhcmFtIG9TZXR0aW5ncyBBZGRpdGlvbmFsIHNldHRpbmdzXG4gKiBAcGFyYW0gc0F0dHJpYnV0ZU5hbWUgVGhlIGF0dHJpYnV0ZSBuYW1lXG4gKiBAcGFyYW0gc0F0dHJpYnV0ZVZhbHVlIFRoZSBhdHRyaWJ1dGUgdmFsdWVcbiAqIEByZXR1cm5zIFRoZSBtZXRhIGRhdGEgY29udGV4dCBvYmplY3RcbiAqL1xuZnVuY3Rpb24gX2NyZWF0ZUluaXRpYWxNZXRhZGF0YUNvbnRleHQoXG5cdG9TZXR0aW5nczogVGVtcGxhdGVQcm9jZXNzb3JTZXR0aW5ncyxcblx0c0F0dHJpYnV0ZU5hbWU6IHN0cmluZyxcblx0c0F0dHJpYnV0ZVZhbHVlOiBzdHJpbmdcbik6IE1ldGFEYXRhQ29udGV4dCB7XG5cdGxldCByZXR1cm5Db250ZXh0OiBNZXRhRGF0YUNvbnRleHQ7XG5cdGlmIChzQXR0cmlidXRlVmFsdWUuc3RhcnRzV2l0aChcIi91aWQtLVwiKSAmJiAhb1NldHRpbmdzLm1vZGVscy5jb252ZXJ0ZXJDb250ZXh0LmdldFByb3BlcnR5KHNBdHRyaWJ1dGVWYWx1ZSkpIHtcblx0XHRjb25zdCBkYXRhID0gdW5zdG9yZU9iamVjdFZhbHVlKHNBdHRyaWJ1dGVWYWx1ZSk7XG5cdFx0b1NldHRpbmdzLm1vZGVscy5jb252ZXJ0ZXJDb250ZXh0LnNldFByb3BlcnR5KHNBdHRyaWJ1dGVWYWx1ZSwgZGF0YSk7XG5cdFx0cmV0dXJuQ29udGV4dCA9IHtcblx0XHRcdG1vZGVsOiBcImNvbnZlcnRlckNvbnRleHRcIixcblx0XHRcdHBhdGg6IHNBdHRyaWJ1dGVWYWx1ZVxuXHRcdH07XG5cdH0gZWxzZSBpZiAoKHNBdHRyaWJ1dGVOYW1lID09PSBcIm1ldGFQYXRoXCIgJiYgb1NldHRpbmdzLmN1cnJlbnRDb250ZXh0UGF0aCkgfHwgc0F0dHJpYnV0ZU5hbWUgPT09IFwiY29udGV4dFBhdGhcIikge1xuXHRcdHJldHVybkNvbnRleHQgPSBfY2hlY2tBYnNvbHV0ZUFuZENvbnRleHRQYXRocyhvU2V0dGluZ3MsIHNBdHRyaWJ1dGVWYWx1ZSk7XG5cdH0gZWxzZSBpZiAoc0F0dHJpYnV0ZVZhbHVlICYmIHNBdHRyaWJ1dGVWYWx1ZS5zdGFydHNXaXRoKFwiL1wiKSkge1xuXHRcdC8vIGFic29sdXRlIHBhdGggLSB3ZSBqdXN0IHVzZSB0aGlzIG9uZVxuXHRcdHJldHVybkNvbnRleHQgPSB7XG5cdFx0XHRtb2RlbDogXCJtZXRhTW9kZWxcIixcblx0XHRcdHBhdGg6IHNBdHRyaWJ1dGVWYWx1ZVxuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuQ29udGV4dCA9IHtcblx0XHRcdG1vZGVsOiBcIm1ldGFNb2RlbFwiLFxuXHRcdFx0cGF0aDogb1NldHRpbmdzLmJpbmRpbmdDb250ZXh0cy5lbnRpdHlTZXQgPyBvU2V0dGluZ3MuYmluZGluZ0NvbnRleHRzLmVudGl0eVNldC5nZXRQYXRoKHNBdHRyaWJ1dGVWYWx1ZSkgOiBzQXR0cmlidXRlVmFsdWVcblx0XHR9O1xuXHR9XG5cdHJldHVybiByZXR1cm5Db250ZXh0O1xufVxuXG5mdW5jdGlvbiBfZ2V0TWV0YWRhdGFDb250ZXh0KFxuXHRvU2V0dGluZ3M6IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MsXG5cdG9Ob2RlOiBFbGVtZW50LFxuXHRzQXR0cmlidXRlTmFtZTogc3RyaW5nLFxuXHRvVmlzaXRvcjogSVZpc2l0b3JDYWxsYmFjayxcblx0YkRvTm90UmVzb2x2ZTogYm9vbGVhbixcblx0aXNPcGVuOiBib29sZWFuXG4pIHtcblx0bGV0IG9NZXRhZGF0YUNvbnRleHQ6IE1ldGFEYXRhQ29udGV4dCB8IHVuZGVmaW5lZDtcblx0aWYgKCFiRG9Ob3RSZXNvbHZlICYmIG9Ob2RlLmhhc0F0dHJpYnV0ZShzQXR0cmlidXRlTmFtZSkpIHtcblx0XHRjb25zdCBzQXR0cmlidXRlVmFsdWUgPSBvTm9kZS5nZXRBdHRyaWJ1dGUoc0F0dHJpYnV0ZU5hbWUpIGFzIHN0cmluZztcblx0XHRvTWV0YWRhdGFDb250ZXh0ID0gQmluZGluZ1BhcnNlci5jb21wbGV4UGFyc2VyKHNBdHRyaWJ1dGVWYWx1ZSk7XG5cdFx0aWYgKCFvTWV0YWRhdGFDb250ZXh0KSB7XG5cdFx0XHRvTWV0YWRhdGFDb250ZXh0ID0gX2NyZWF0ZUluaXRpYWxNZXRhZGF0YUNvbnRleHQob1NldHRpbmdzLCBzQXR0cmlidXRlTmFtZSwgc0F0dHJpYnV0ZVZhbHVlKTtcblx0XHR9XG5cdH0gZWxzZSBpZiAob1NldHRpbmdzLmJpbmRpbmdDb250ZXh0cy5oYXNPd25Qcm9wZXJ0eShzQXR0cmlidXRlTmFtZSkpIHtcblx0XHRvTWV0YWRhdGFDb250ZXh0ID0ge1xuXHRcdFx0bW9kZWw6IHNBdHRyaWJ1dGVOYW1lLFxuXHRcdFx0cGF0aDogXCJcIlxuXHRcdH07XG5cdH0gZWxzZSBpZiAoaXNPcGVuKSB7XG5cdFx0dHJ5IHtcblx0XHRcdGlmIChvVmlzaXRvci5nZXRDb250ZXh0KGAke3NBdHRyaWJ1dGVOYW1lfT5gKSkge1xuXHRcdFx0XHRvTWV0YWRhdGFDb250ZXh0ID0ge1xuXHRcdFx0XHRcdG1vZGVsOiBzQXR0cmlidXRlTmFtZSxcblx0XHRcdFx0XHRwYXRoOiBcIlwiXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9NZXRhZGF0YUNvbnRleHQ7XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGluY29taW5nIFhNTCBub2RlIGFuZCB0cnkgdG8gcmVzb2x2ZSB0aGUgcHJvcGVydGllcyBkZWZpbmVkIHRoZXJlLlxuICpcbiAqIEBwYXJhbSBvTWV0YWRhdGEgVGhlIG1ldGFkYXRhIGZvciB0aGUgYnVpbGRpbmcgYmxvY2tcbiAqIEBwYXJhbSBvTm9kZSBUaGUgWE1MIG5vZGUgdG8gcGFyc2VcbiAqIEBwYXJhbSBpc1B1YmxpYyBXaGV0aGVyIHRoZSBidWlsZGluZyBibG9jayBpcyB1c2VkIGluIGEgcHVibGljIGNvbnRleHQgb3Igbm90XG4gKiBAcGFyYW0gb1Zpc2l0b3IgVGhlIHZpc2l0b3IgaW5zdGFuY2VcbiAqL1xuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc1Byb3BlcnRpZXMoXG5cdG9NZXRhZGF0YTogVHJhbnNmb3JtZWRCdWlsZGluZ0Jsb2NrTWV0YWRhdGEsXG5cdG9Ob2RlOiBFbGVtZW50LFxuXHRpc1B1YmxpYzogYm9vbGVhbixcblx0b1Zpc2l0b3I6IElWaXNpdG9yQ2FsbGJhY2tcbikge1xuXHRjb25zdCBkZWZpbml0aW9uUHJvcGVydGllcyA9IG9NZXRhZGF0YS5wcm9wZXJ0aWVzO1xuXG5cdC8vIFJldHJpZXZlIHByb3BlcnRpZXMgdmFsdWVzXG5cdGNvbnN0IGFEZWZpbml0aW9uUHJvcGVydGllc0tleXMgPSBPYmplY3Qua2V5cyhkZWZpbml0aW9uUHJvcGVydGllcyk7XG5cblx0Y29uc3QgcHJvcGVydHlWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIE9iamVjdFZhbHVlPiA9IHt9O1xuXHRmb3IgKGNvbnN0IHNLZXlWYWx1ZSBvZiBhRGVmaW5pdGlvblByb3BlcnRpZXNLZXlzKSB7XG5cdFx0aWYgKGRlZmluaXRpb25Qcm9wZXJ0aWVzW3NLZXlWYWx1ZV0udHlwZSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0cHJvcGVydHlWYWx1ZXNbc0tleVZhbHVlXSA9XG5cdFx0XHRcdGRlZmluaXRpb25Qcm9wZXJ0aWVzW3NLZXlWYWx1ZV0uZGVmYXVsdFZhbHVlICYmIGRlZXBDbG9uZShkZWZpbml0aW9uUHJvcGVydGllc1tzS2V5VmFsdWVdLmRlZmF1bHRWYWx1ZSk7IC8vIFRvIGF2b2lkIHZhbHVlcyBiZWluZyByZXVzZWQgYWNyb3NzIG1hY3Jvc1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwcm9wZXJ0eVZhbHVlc1tzS2V5VmFsdWVdID0gZGVmaW5pdGlvblByb3BlcnRpZXNbc0tleVZhbHVlXS5kZWZhdWx0VmFsdWUgYXMgc3RyaW5nIHwgYm9vbGVhbiB8IG51bWJlcjtcblx0XHR9XG5cblx0XHRpZiAob05vZGUuaGFzQXR0cmlidXRlKHNLZXlWYWx1ZSkgJiYgaXNQdWJsaWMgJiYgZGVmaW5pdGlvblByb3BlcnRpZXNbc0tleVZhbHVlXS5pc1B1YmxpYyA9PT0gZmFsc2UpIHtcblx0XHRcdExvZy5lcnJvcihgUHJvcGVydHkgJHtzS2V5VmFsdWV9IHdhcyBpZ25vcmVkIGFzIGl0IGlzIG5vdCBpbnRlbmRlZCBmb3IgcHVibGljIHVzYWdlYCk7XG5cdFx0fSBlbHNlIGlmIChvTm9kZS5oYXNBdHRyaWJ1dGUoc0tleVZhbHVlKSkge1xuXHRcdFx0YXdhaXQgb1Zpc2l0b3IudmlzaXRBdHRyaWJ1dGUob05vZGUsIG9Ob2RlLmF0dHJpYnV0ZXMuZ2V0TmFtZWRJdGVtKHNLZXlWYWx1ZSkgYXMgQXR0cik7XG5cdFx0XHRsZXQgdmFsdWU6IHN0cmluZyB8IGJvb2xlYW4gfCBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkID0gb05vZGUuZ2V0QXR0cmlidXRlKHNLZXlWYWx1ZSk7XG5cdFx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmICF2YWx1ZS5zdGFydHNXaXRoKFwie1wiKSkge1xuXHRcdFx0XHRcdHN3aXRjaCAoZGVmaW5pdGlvblByb3BlcnRpZXNbc0tleVZhbHVlXS50eXBlKSB7XG5cdFx0XHRcdFx0XHRjYXNlIFwiYm9vbGVhblwiOlxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlID09PSBcInRydWVcIjtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwibnVtYmVyXCI6XG5cdFx0XHRcdFx0XHRcdHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHZhbHVlID0gdmFsdWUgPT09IG51bGwgPyB1bmRlZmluZWQgOiB2YWx1ZTtcblx0XHRcdFx0cHJvcGVydHlWYWx1ZXNbc0tleVZhbHVlXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gcHJvcGVydHlWYWx1ZXM7XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGluY29taW5nIFhNTCBub2RlIGFuZCB0cnkgdG8gcmVzb2x2ZSB0aGUgYmluZGluZyBjb250ZXh0cyBkZWZpbmVkIGluc2lkZS5cbiAqXG4gKiBAcGFyYW0gb01ldGFkYXRhIFRoZSBtZXRhZGF0YSBmb3IgdGhlIGJ1aWxkaW5nIGJsb2NrXG4gKiBAcGFyYW0gb1NldHRpbmdzIFRoZSBzZXR0aW5ncyBvYmplY3RcbiAqIEBwYXJhbSBvTm9kZSBUaGUgWE1MIG5vZGUgdG8gcGFyc2VcbiAqIEBwYXJhbSBpc1B1YmxpYyBXaGV0aGVyIHRoZSBidWlsZGluZyBibG9jayBpcyB1c2VkIGluIGEgcHVibGljIGNvbnRleHQgb3Igbm90XG4gKiBAcGFyYW0gb1Zpc2l0b3IgVGhlIHZpc2l0b3IgaW5zdGFuY2VcbiAqIEBwYXJhbSBtQ29udGV4dHMgVGhlIGNvbnRleHRzIHRvIGJlIHVzZWRcbiAqIEBwYXJhbSBwcm9wZXJ0eVZhbHVlcyBUaGUgY3VycmVudCBwcm9wZXJ0eSB2YWx1ZXNcbiAqIEByZXR1cm5zIFRoZSBwcm9jZXNzZWQgYW5kIG1pc3NpbmcgY29udGV4dHNcbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc0NvbnRleHRzKFxuXHRvTWV0YWRhdGE6IFRyYW5zZm9ybWVkQnVpbGRpbmdCbG9ja01ldGFkYXRhLFxuXHRvU2V0dGluZ3M6IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MsXG5cdG9Ob2RlOiBFbGVtZW50LFxuXHRpc1B1YmxpYzogYm9vbGVhbixcblx0b1Zpc2l0b3I6IElWaXNpdG9yQ2FsbGJhY2ssXG5cdG1Db250ZXh0czogUmVjb3JkPHN0cmluZywgQ29udGV4dD4sXG5cdHByb3BlcnR5VmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBPYmplY3RWYWx1ZT5cbikge1xuXHRvU2V0dGluZ3MuY3VycmVudENvbnRleHRQYXRoID0gb1NldHRpbmdzLmJpbmRpbmdDb250ZXh0cy5jb250ZXh0UGF0aDtcblx0Y29uc3QgbU1pc3NpbmdDb250ZXh0OiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPiA9IHt9O1xuXHRjb25zdCBvRGVmaW5pdGlvbkNvbnRleHRzID0gb01ldGFkYXRhLm1ldGFkYXRhQ29udGV4dHM7XG5cdGNvbnN0IGFEZWZpbml0aW9uQ29udGV4dHNLZXlzID0gT2JqZWN0LmtleXMob0RlZmluaXRpb25Db250ZXh0cyk7XG5cdC8vIFNpbmNlIHRoZSBtZXRhUGF0aCBhbmQgb3RoZXIgcHJvcGVydHkgY2FuIGJlIHJlbGF0aXZlIHRvIHRoZSBjb250ZXh0UGF0aCB3ZSBuZWVkIHRvIGV2YWx1YXRlIHRoZSBjdXJyZW50IGNvbnRleHRQYXRoIGZpcnN0XG5cdGNvbnN0IGNvbnRleHRQYXRoSW5kZXggPSBhRGVmaW5pdGlvbkNvbnRleHRzS2V5cy5pbmRleE9mKFwiY29udGV4dFBhdGhcIik7XG5cdGlmIChjb250ZXh0UGF0aEluZGV4ICE9PSAtMSkge1xuXHRcdC8vIElmIGl0IGlzIGRlZmluZWQgd2UgZXh0cmFjdCBpdCBhbmQgcmVpbnNlcnQgaXQgaW4gdGhlIGZpcnN0IHBvc2l0aW9uIG9mIHRoZSBhcnJheVxuXHRcdGNvbnN0IGNvbnRleHRQYXRoRGVmaW5pdGlvbiA9IGFEZWZpbml0aW9uQ29udGV4dHNLZXlzLnNwbGljZShjb250ZXh0UGF0aEluZGV4LCAxKTtcblx0XHRhRGVmaW5pdGlvbkNvbnRleHRzS2V5cy5zcGxpY2UoMCwgMCwgY29udGV4dFBhdGhEZWZpbml0aW9uWzBdKTtcblx0fVxuXHRmb3IgKGNvbnN0IHNBdHRyaWJ1dGVOYW1lIG9mIGFEZWZpbml0aW9uQ29udGV4dHNLZXlzKSB7XG5cdFx0Ly8gSWYgdGhlIGNvbnRleHQgd2FzIHJlc29sdmVkIGFzIGEgcHJvcGVydHkgKGJpbmRpbmcgLyB4bWwgYWdncmVnYXRpb24pIHRoZW4gd2UgZG9uJ3QgbmVlZCB0byByZXNvbHZlIGl0IGhlcmUuXG5cdFx0Y29uc3QgcHJvcGVydHlWYWx1ZSA9IHByb3BlcnR5VmFsdWVzW3NBdHRyaWJ1dGVOYW1lXTtcblx0XHRpZiAocHJvcGVydHlWYWx1ZSAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBwcm9wZXJ0eVZhbHVlID09PSBcIm9iamVjdFwiICYmIE9iamVjdC5rZXlzKHByb3BlcnR5VmFsdWUgYXMgb2JqZWN0KS5sZW5ndGggPiAwKSB7XG5cdFx0XHRkZWxldGUgb01ldGFkYXRhLm1ldGFkYXRhQ29udGV4dHNbc0F0dHJpYnV0ZU5hbWVdO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXHRcdGNvbnN0IGJEb05vdFJlc29sdmUgPSBpc1B1YmxpYyAmJiBvRGVmaW5pdGlvbkNvbnRleHRzW3NBdHRyaWJ1dGVOYW1lXS5pc1B1YmxpYyA9PT0gZmFsc2UgJiYgb05vZGUuaGFzQXR0cmlidXRlKHNBdHRyaWJ1dGVOYW1lKTtcblx0XHRjb25zdCBvTWV0YWRhdGFDb250ZXh0ID0gX2dldE1ldGFkYXRhQ29udGV4dChvU2V0dGluZ3MsIG9Ob2RlLCBzQXR0cmlidXRlTmFtZSwgb1Zpc2l0b3IsIGJEb05vdFJlc29sdmUsIG9NZXRhZGF0YS5pc09wZW4gPz8gZmFsc2UpO1xuXHRcdGlmIChvTWV0YWRhdGFDb250ZXh0KSB7XG5cdFx0XHRvTWV0YWRhdGFDb250ZXh0Lm5hbWUgPSBzQXR0cmlidXRlTmFtZTtcblx0XHRcdGFkZFNpbmdsZUNvbnRleHQobUNvbnRleHRzLCBvVmlzaXRvciwgb01ldGFkYXRhQ29udGV4dCk7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChzQXR0cmlidXRlTmFtZSA9PT0gXCJlbnRpdHlTZXRcIiB8fCBzQXR0cmlidXRlTmFtZSA9PT0gXCJjb250ZXh0UGF0aFwiKSAmJlxuXHRcdFx0XHQhb1NldHRpbmdzLmJpbmRpbmdDb250ZXh0cy5oYXNPd25Qcm9wZXJ0eShzQXR0cmlidXRlTmFtZSlcblx0XHRcdCkge1xuXHRcdFx0XHRvU2V0dGluZ3MuYmluZGluZ0NvbnRleHRzW3NBdHRyaWJ1dGVOYW1lXSA9IG1Db250ZXh0c1tzQXR0cmlidXRlTmFtZV07XG5cdFx0XHR9XG5cdFx0XHRpZiAoc0F0dHJpYnV0ZU5hbWUgPT09IFwiY29udGV4dFBhdGhcIikge1xuXHRcdFx0XHRvU2V0dGluZ3MuY3VycmVudENvbnRleHRQYXRoID0gbUNvbnRleHRzW3NBdHRyaWJ1dGVOYW1lXTtcblx0XHRcdH1cblx0XHRcdGlmIChtQ29udGV4dHNbc0F0dHJpYnV0ZU5hbWVdICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cHJvcGVydHlWYWx1ZXNbc0F0dHJpYnV0ZU5hbWVdID0gbUNvbnRleHRzW3NBdHRyaWJ1dGVOYW1lXTtcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIHByb3BlcnR5VmFsdWVzW3NBdHRyaWJ1dGVOYW1lXSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHQvLyBJZiB0aGUgYmluZGluZyBjb3VsZG4ndCBiZSByZXNvbHZlZCBjb25zaWRlciB0aGF0IHRoZXJlIHdhcyBubyB2YWx1ZSBoZXJlXG5cdFx0XHRcdGRlbGV0ZSBvTWV0YWRhdGEubWV0YWRhdGFDb250ZXh0c1tzQXR0cmlidXRlTmFtZV07XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1NaXNzaW5nQ29udGV4dFtzQXR0cmlidXRlTmFtZV0gPSB0cnVlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbU1pc3NpbmdDb250ZXh0O1xufVxuXG5leHBvcnQgdHlwZSBCdWlsZGluZ0Jsb2NrQWdncmVnYXRpb24gPSB7XG5cdGtleTogc3RyaW5nO1xuXHRwb3NpdGlvbjogUG9zaXRpb247XG5cdHR5cGU6IFwiU2xvdFwiO1xufTtcbmZ1bmN0aW9uIHBhcnNlQWdncmVnYXRpb24ob0FnZ3JlZ2F0aW9uPzogRWxlbWVudCwgcHJvY2Vzc0FnZ3JlZ2F0aW9ucz86IEZ1bmN0aW9uKSB7XG5cdGNvbnN0IG9PdXRPYmplY3RzOiBSZWNvcmQ8c3RyaW5nLCBCdWlsZGluZ0Jsb2NrQWdncmVnYXRpb24+ID0ge307XG5cdGlmIChvQWdncmVnYXRpb24gJiYgb0FnZ3JlZ2F0aW9uLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcblx0XHRjb25zdCBjaGlsZHJlbiA9IG9BZ2dyZWdhdGlvbi5jaGlsZHJlbjtcblx0XHRmb3IgKGxldCBjaGlsZElkeCA9IDA7IGNoaWxkSWR4IDwgY2hpbGRyZW4ubGVuZ3RoOyBjaGlsZElkeCsrKSB7XG5cdFx0XHRjb25zdCBjaGlsZERlZmluaXRpb24gPSBjaGlsZHJlbltjaGlsZElkeF07XG5cdFx0XHRsZXQgY2hpbGRLZXkgPSBjaGlsZERlZmluaXRpb24uZ2V0QXR0cmlidXRlKFwia2V5XCIpIHx8IGNoaWxkRGVmaW5pdGlvbi5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtcblx0XHRcdGlmIChjaGlsZEtleSkge1xuXHRcdFx0XHRjaGlsZEtleSA9IGBJbmxpbmVYTUxfJHtjaGlsZEtleX1gO1xuXHRcdFx0XHRjaGlsZERlZmluaXRpb24uc2V0QXR0cmlidXRlKFwia2V5XCIsIGNoaWxkS2V5KTtcblx0XHRcdFx0bGV0IGFnZ3JlZ2F0aW9uT2JqZWN0OiBCdWlsZGluZ0Jsb2NrQWdncmVnYXRpb24gPSB7XG5cdFx0XHRcdFx0a2V5OiBjaGlsZEtleSxcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0cGxhY2VtZW50OiAoY2hpbGREZWZpbml0aW9uLmdldEF0dHJpYnV0ZShcInBsYWNlbWVudFwiKSBhcyBQbGFjZW1lbnQpIHx8IFBsYWNlbWVudC5BZnRlcixcblx0XHRcdFx0XHRcdGFuY2hvcjogY2hpbGREZWZpbml0aW9uLmdldEF0dHJpYnV0ZShcImFuY2hvclwiKSB8fCB1bmRlZmluZWRcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHR5cGU6IFwiU2xvdFwiXG5cdFx0XHRcdH07XG5cdFx0XHRcdGlmIChwcm9jZXNzQWdncmVnYXRpb25zKSB7XG5cdFx0XHRcdFx0YWdncmVnYXRpb25PYmplY3QgPSBwcm9jZXNzQWdncmVnYXRpb25zKGNoaWxkRGVmaW5pdGlvbiwgYWdncmVnYXRpb25PYmplY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9PdXRPYmplY3RzW2FnZ3JlZ2F0aW9uT2JqZWN0LmtleV0gPSBhZ2dyZWdhdGlvbk9iamVjdDtcblx0XHRcdH0gZWxzZSBpZiAoY2hpbGREZWZpbml0aW9uLnRhZ05hbWUgIT09IFwic2xvdFwiKSB7XG5cdFx0XHRcdExvZy5lcnJvcihgVGhlIGFnZ3JlZ2F0aW9uICR7Y2hpbGREZWZpbml0aW9uLm5vZGVOYW1lfSBpcyBtaXNzaW5nIGEgS2V5IGF0dHJpYnV0ZS4gSXQgaXMgbm90IGRpc3BsYXllZGApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gb091dE9iamVjdHM7XG59XG5cbi8qKlxuICogUHJvY2Vzc2VzIHRoZSBjaGlsZCBub2RlcyBvZiB0aGUgYnVpbGRpbmcgYmxvY2sgYW5kIHBhcnNlcyB0aGVtIGFzIGVpdGhlciBhZ2dyZWdhdGlvbnMgb3Igb2JqZWN0LS9hcnJheS1iYXNlZCB2YWx1ZXMuXG4gKlxuICogQHBhcmFtIG9Ob2RlIFRoZSBYTUwgbm9kZSBmb3Igd2hpY2ggdG8gcHJvY2VzcyB0aGUgY2hpbGRyZW5cbiAqIEBwYXJhbSBvVmlzaXRvciBUaGUgdmlzaXRvciBpbnN0YW5jZVxuICogQHBhcmFtIG9NZXRhZGF0YSBUaGUgbWV0YWRhdGEgZm9yIHRoZSBidWlsZGluZyBibG9ja1xuICogQHBhcmFtIGlzUHVibGljIFdoZXRoZXIgdGhlIGJ1aWxkaW5nIGJsb2NrIGlzIHVzZWQgaW4gYSBwdWJsaWMgY29udGV4dCBvciBub3RcbiAqIEBwYXJhbSBwcm9wZXJ0eVZhbHVlcyBUaGUgdmFsdWVzIG9mIGFscmVhZHkgcGFyc2VkIHByb3BlcnR5XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NDaGlsZHJlbihcblx0b05vZGU6IEVsZW1lbnQsXG5cdG9WaXNpdG9yOiBJVmlzaXRvckNhbGxiYWNrLFxuXHRvTWV0YWRhdGE6IFRyYW5zZm9ybWVkQnVpbGRpbmdCbG9ja01ldGFkYXRhLFxuXHRpc1B1YmxpYzogYm9vbGVhbixcblx0cHJvcGVydHlWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIE9iamVjdFZhbHVlPlxuKSB7XG5cdGNvbnN0IG9BZ2dyZWdhdGlvbnM6IFJlY29yZDxzdHJpbmcsIEVsZW1lbnQ+ID0ge307XG5cdGlmIChvTm9kZS5maXJzdEVsZW1lbnRDaGlsZCAhPT0gbnVsbCkge1xuXHRcdGxldCBvRmlyc3RFbGVtZW50Q2hpbGQ6IEVsZW1lbnQgfCBudWxsID0gb05vZGUuZmlyc3RFbGVtZW50Q2hpbGQgYXMgRWxlbWVudCB8IG51bGw7XG5cblx0XHR3aGlsZSAob0ZpcnN0RWxlbWVudENoaWxkICE9PSBudWxsKSB7XG5cdFx0XHRpZiAob0ZpcnN0RWxlbWVudENoaWxkLm5hbWVzcGFjZVVSSSA9PT0gWE1MVEVNUExBVElOR19OUykge1xuXHRcdFx0XHQvLyBJbiBjYXNlIHdlIGVuY291bnRlciBhIHRlbXBsYXRpbmcgdGFnLCBydW4gdGhlIHZpc2l0b3Igb24gaXQgYW5kIGNvbnRpbnVlIHdpdGggdGhlIHJlc3VsdGluZyBjaGlsZFxuXHRcdFx0XHRjb25zdCBvUGFyZW50ID0gb0ZpcnN0RWxlbWVudENoaWxkLnBhcmVudE5vZGU7XG5cdFx0XHRcdGlmIChvUGFyZW50KSB7XG5cdFx0XHRcdFx0Y29uc3QgaUNoaWxkSW5kZXggPSBBcnJheS5mcm9tKG9QYXJlbnQuY2hpbGRyZW4pLmluZGV4T2Yob0ZpcnN0RWxlbWVudENoaWxkKTtcblx0XHRcdFx0XHRhd2FpdCBvVmlzaXRvci52aXNpdE5vZGUob0ZpcnN0RWxlbWVudENoaWxkKTtcblx0XHRcdFx0XHRvRmlyc3RFbGVtZW50Q2hpbGQgPSBvUGFyZW50LmNoaWxkcmVuW2lDaGlsZEluZGV4XSA/IG9QYXJlbnQuY2hpbGRyZW5baUNoaWxkSW5kZXhdIDogbnVsbDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBOb3Qgc3VyZSBob3cgdGhpcyBjb3VsZCBoYXBwZW4gYnV0IEkgYWxzbyBkb24ndCB3YW50IHRvIGNyZWF0ZSBpbmZpbml0ZSBsb29wc1xuXHRcdFx0XHRcdG9GaXJzdEVsZW1lbnRDaGlsZCA9IG9GaXJzdEVsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmc7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHNDaGlsZE5hbWUgPSBvRmlyc3RFbGVtZW50Q2hpbGQubG9jYWxOYW1lO1xuXHRcdFx0XHRsZXQgc0FnZ3JlZ2F0aW9uTmFtZSA9IHNDaGlsZE5hbWU7XG5cdFx0XHRcdGlmIChzQWdncmVnYXRpb25OYW1lWzBdLnRvVXBwZXJDYXNlKCkgPT09IHNBZ2dyZWdhdGlvbk5hbWVbMF0pIHtcblx0XHRcdFx0XHQvLyBub3QgYSBzdWIgYWdncmVnYXRpb24sIGdvIGJhY2sgdG8gZGVmYXVsdCBBZ2dyZWdhdGlvblxuXHRcdFx0XHRcdHNBZ2dyZWdhdGlvbk5hbWUgPSBvTWV0YWRhdGEuZGVmYXVsdEFnZ3JlZ2F0aW9uIHx8IFwiXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgYWdncmVnYXRpb25EZWZpbml0aW9uID0gb01ldGFkYXRhLmFnZ3JlZ2F0aW9uc1tzQWdncmVnYXRpb25OYW1lXTtcblx0XHRcdFx0aWYgKGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbiAhPT0gdW5kZWZpbmVkICYmICFhZ2dyZWdhdGlvbkRlZmluaXRpb24uc2xvdCkge1xuXHRcdFx0XHRcdGNvbnN0IHBhcnNlZEFnZ3JlZ2F0aW9uID0gcGFyc2VBZ2dyZWdhdGlvbihvRmlyc3RFbGVtZW50Q2hpbGQsIGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbi5wcm9jZXNzQWdncmVnYXRpb25zKTtcblx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlc1tzQWdncmVnYXRpb25OYW1lXSA9IHBhcnNlZEFnZ3JlZ2F0aW9uO1xuXHRcdFx0XHRcdGZvciAoY29uc3QgcGFyc2VkQWdncmVnYXRpb25LZXkgaW4gcGFyc2VkQWdncmVnYXRpb24pIHtcblx0XHRcdFx0XHRcdG9NZXRhZGF0YS5hZ2dyZWdhdGlvbnNbcGFyc2VkQWdncmVnYXRpb25LZXldID0gcGFyc2VkQWdncmVnYXRpb25bcGFyc2VkQWdncmVnYXRpb25LZXldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRvRmlyc3RFbGVtZW50Q2hpbGQgPSBvRmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG9GaXJzdEVsZW1lbnRDaGlsZCA9IG9Ob2RlLmZpcnN0RWxlbWVudENoaWxkO1xuXHRcdHdoaWxlIChvRmlyc3RFbGVtZW50Q2hpbGQgIT09IG51bGwpIHtcblx0XHRcdGNvbnN0IG9OZXh0Q2hpbGQ6IEVsZW1lbnQgfCBudWxsID0gb0ZpcnN0RWxlbWVudENoaWxkLm5leHRFbGVtZW50U2libGluZztcblx0XHRcdGNvbnN0IHNDaGlsZE5hbWUgPSBvRmlyc3RFbGVtZW50Q2hpbGQubG9jYWxOYW1lO1xuXHRcdFx0bGV0IHNBZ2dyZWdhdGlvbk5hbWUgPSBzQ2hpbGROYW1lO1xuXHRcdFx0aWYgKHNBZ2dyZWdhdGlvbk5hbWVbMF0udG9VcHBlckNhc2UoKSA9PT0gc0FnZ3JlZ2F0aW9uTmFtZVswXSkge1xuXHRcdFx0XHQvLyBub3QgYSBzdWIgYWdncmVnYXRpb24sIGdvIGJhY2sgdG8gZGVmYXVsdCBBZ2dyZWdhdGlvblxuXHRcdFx0XHRzQWdncmVnYXRpb25OYW1lID0gb01ldGFkYXRhLmRlZmF1bHRBZ2dyZWdhdGlvbiB8fCBcIlwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKFxuXHRcdFx0XHRPYmplY3Qua2V5cyhvTWV0YWRhdGEuYWdncmVnYXRpb25zKS5pbmRleE9mKHNBZ2dyZWdhdGlvbk5hbWUpICE9PSAtMSAmJlxuXHRcdFx0XHQoIWlzUHVibGljIHx8IG9NZXRhZGF0YS5hZ2dyZWdhdGlvbnNbc0FnZ3JlZ2F0aW9uTmFtZV0uaXNQdWJsaWMgPT09IHRydWUpXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgYWdncmVnYXRpb25EZWZpbml0aW9uID0gb01ldGFkYXRhLmFnZ3JlZ2F0aW9uc1tzQWdncmVnYXRpb25OYW1lXTtcblx0XHRcdFx0aWYgKCFhZ2dyZWdhdGlvbkRlZmluaXRpb24uc2xvdCAmJiBvRmlyc3RFbGVtZW50Q2hpbGQgIT09IG51bGwgJiYgb0ZpcnN0RWxlbWVudENoaWxkLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRhd2FpdCBvVmlzaXRvci52aXNpdE5vZGUob0ZpcnN0RWxlbWVudENoaWxkKTtcblx0XHRcdFx0XHRsZXQgY2hpbGREZWZpbml0aW9uID0gb0ZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkO1xuXHRcdFx0XHRcdHdoaWxlIChjaGlsZERlZmluaXRpb24pIHtcblx0XHRcdFx0XHRcdGNvbnN0IG5leHRDaGlsZCA9IGNoaWxkRGVmaW5pdGlvbi5uZXh0RWxlbWVudFNpYmxpbmc7XG5cdFx0XHRcdFx0XHRpZiAoIWFnZ3JlZ2F0aW9uRGVmaW5pdGlvbi5oYXNWaXJ0dWFsTm9kZSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjaGlsZFdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMob05vZGUubmFtZXNwYWNlVVJJLCBjaGlsZERlZmluaXRpb24uZ2V0QXR0cmlidXRlKFwia2V5XCIpISk7XG5cdFx0XHRcdFx0XHRcdGNoaWxkV3JhcHBlci5hcHBlbmRDaGlsZChjaGlsZERlZmluaXRpb24pO1xuXHRcdFx0XHRcdFx0XHRvQWdncmVnYXRpb25zW2NoaWxkRGVmaW5pdGlvbi5nZXRBdHRyaWJ1dGUoXCJrZXlcIikhXSA9IGNoaWxkV3JhcHBlcjtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG9BZ2dyZWdhdGlvbnNbY2hpbGREZWZpbml0aW9uLmdldEF0dHJpYnV0ZShcImtleVwiKSFdID0gY2hpbGREZWZpbml0aW9uO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRjaGlsZERlZmluaXRpb24ucmVtb3ZlQXR0cmlidXRlKFwia2V5XCIpO1xuXHRcdFx0XHRcdFx0Y2hpbGREZWZpbml0aW9uID0gbmV4dENoaWxkO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChhZ2dyZWdhdGlvbkRlZmluaXRpb24uc2xvdCkge1xuXHRcdFx0XHRcdGF3YWl0IG9WaXNpdG9yLnZpc2l0Tm9kZShvRmlyc3RFbGVtZW50Q2hpbGQpO1xuXHRcdFx0XHRcdGlmIChzQWdncmVnYXRpb25OYW1lICE9PSBzQ2hpbGROYW1lKSB7XG5cdFx0XHRcdFx0XHRpZiAoIW9BZ2dyZWdhdGlvbnNbc0FnZ3JlZ2F0aW9uTmFtZV0pIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb05ld0NoaWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG9Ob2RlLm5hbWVzcGFjZVVSSSwgc0FnZ3JlZ2F0aW9uTmFtZSk7XG5cdFx0XHRcdFx0XHRcdG9BZ2dyZWdhdGlvbnNbc0FnZ3JlZ2F0aW9uTmFtZV0gPSBvTmV3Q2hpbGQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvQWdncmVnYXRpb25zW3NBZ2dyZWdhdGlvbk5hbWVdLmFwcGVuZENoaWxkKG9GaXJzdEVsZW1lbnRDaGlsZCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9BZ2dyZWdhdGlvbnNbc0FnZ3JlZ2F0aW9uTmFtZV0gPSBvRmlyc3RFbGVtZW50Q2hpbGQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKE9iamVjdC5rZXlzKG9NZXRhZGF0YS5wcm9wZXJ0aWVzKS5pbmRleE9mKHNBZ2dyZWdhdGlvbk5hbWUpICE9PSAtMSkge1xuXHRcdFx0XHRhd2FpdCBvVmlzaXRvci52aXNpdE5vZGUob0ZpcnN0RWxlbWVudENoaWxkKTtcblx0XHRcdFx0aWYgKG9NZXRhZGF0YS5wcm9wZXJ0aWVzW3NBZ2dyZWdhdGlvbk5hbWVdLnR5cGUgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHQvLyBPYmplY3QgVHlwZSBwcm9wZXJ0aWVzXG5cdFx0XHRcdFx0Y29uc3QgYWdncmVnYXRpb25Qcm9wZXJ0eVZhbHVlczogUmVjb3JkPHN0cmluZywgT2JqZWN0VmFsdWUyIHwgUmVjb3JkPHN0cmluZywgT2JqZWN0VmFsdWUyPj4gPSB7fTtcblx0XHRcdFx0XHRjb25zdCBhdHRyaWJ1dGVOYW1lcyA9IG9GaXJzdEVsZW1lbnRDaGlsZC5nZXRBdHRyaWJ1dGVOYW1lcygpO1xuXHRcdFx0XHRcdGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBvZiBhdHRyaWJ1dGVOYW1lcykge1xuXHRcdFx0XHRcdFx0YWdncmVnYXRpb25Qcm9wZXJ0eVZhbHVlc1thdHRyaWJ1dGVOYW1lXSA9IG9GaXJzdEVsZW1lbnRDaGlsZC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChvRmlyc3RFbGVtZW50Q2hpbGQuY2hpbGRyZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHQvL3JldHJpZXZlIG9uZSBsZXZlbCBzdWJPYmplY3QgcHJvcGVydGllc1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgY2hpbGRJbmRleCA9IDA7IGNoaWxkSW5kZXggPCBvRmlyc3RFbGVtZW50Q2hpbGQuY2hpbGRyZW4ubGVuZ3RoOyBjaGlsZEluZGV4KyspIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc3ViQ2hpbGQgPSBvRmlyc3RFbGVtZW50Q2hpbGQuY2hpbGRyZW5bY2hpbGRJbmRleF07XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHN1Yk9iamVjdEtleSA9IHN1YkNoaWxkLmxvY2FsTmFtZTtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc3ViT2JqZWN0OiBSZWNvcmQ8c3RyaW5nLCBPYmplY3RWYWx1ZTI+ID0ge307XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHN1YkNoaWxkQXR0cmlidXRlTmFtZXMgPSBzdWJDaGlsZC5nZXRBdHRyaWJ1dGVOYW1lcygpO1xuXHRcdFx0XHRcdFx0XHRmb3IgKGNvbnN0IHN1YkNoaWxkQXR0cmlidXRlTmFtZSBvZiBzdWJDaGlsZEF0dHJpYnV0ZU5hbWVzKSB7XG5cdFx0XHRcdFx0XHRcdFx0c3ViT2JqZWN0W3N1YkNoaWxkQXR0cmlidXRlTmFtZV0gPSBzdWJDaGlsZC5nZXRBdHRyaWJ1dGUoc3ViQ2hpbGRBdHRyaWJ1dGVOYW1lKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRhZ2dyZWdhdGlvblByb3BlcnR5VmFsdWVzW3N1Yk9iamVjdEtleV0gPSBzdWJPYmplY3Q7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHByb3BlcnR5VmFsdWVzW3NBZ2dyZWdhdGlvbk5hbWVdID0gYWdncmVnYXRpb25Qcm9wZXJ0eVZhbHVlcztcblx0XHRcdFx0fSBlbHNlIGlmIChvTWV0YWRhdGEucHJvcGVydGllc1tzQWdncmVnYXRpb25OYW1lXS50eXBlID09PSBcImFycmF5XCIpIHtcblx0XHRcdFx0XHRpZiAob0ZpcnN0RWxlbWVudENoaWxkICE9PSBudWxsICYmIG9GaXJzdEVsZW1lbnRDaGlsZC5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBjaGlsZHJlbiA9IG9GaXJzdEVsZW1lbnRDaGlsZC5jaGlsZHJlbjtcblx0XHRcdFx0XHRcdGNvbnN0IG9PdXRPYmplY3RzOiBSZWNvcmQ8c3RyaW5nLCBPYmplY3RWYWx1ZTI+W10gPSBbXTtcblx0XHRcdFx0XHRcdGZvciAobGV0IGNoaWxkSWR4ID0gMDsgY2hpbGRJZHggPCBjaGlsZHJlbi5sZW5ndGg7IGNoaWxkSWR4KyspIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgY2hpbGREZWZpbml0aW9uID0gY2hpbGRyZW5bY2hpbGRJZHhdO1xuXHRcdFx0XHRcdFx0XHQvLyBub24ga2V5ZWQgY2hpbGQsIGp1c3QgYWRkIGl0IHRvIHRoZSBhZ2dyZWdhdGlvblxuXHRcdFx0XHRcdFx0XHRjb25zdCBteUNoaWxkOiBSZWNvcmQ8c3RyaW5nLCBPYmplY3RWYWx1ZTI+ID0ge307XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGF0dHJpYnV0ZU5hbWVzID0gY2hpbGREZWZpbml0aW9uLmdldEF0dHJpYnV0ZU5hbWVzKCk7XG5cdFx0XHRcdFx0XHRcdGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBvZiBhdHRyaWJ1dGVOYW1lcykge1xuXHRcdFx0XHRcdFx0XHRcdG15Q2hpbGRbYXR0cmlidXRlTmFtZV0gPSBjaGlsZERlZmluaXRpb24uZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdG9PdXRPYmplY3RzLnB1c2gobXlDaGlsZCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlc1tzQWdncmVnYXRpb25OYW1lXSA9IG9PdXRPYmplY3RzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRvRmlyc3RFbGVtZW50Q2hpbGQgPSBvTmV4dENoaWxkO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb0FnZ3JlZ2F0aW9ucztcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1Nsb3RzKFxuXHRvQWdncmVnYXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBFbGVtZW50Pixcblx0b01ldGFkYXRhQWdncmVnYXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBCdWlsZGluZ0Jsb2NrQWdncmVnYXRpb25EZWZpbml0aW9uPixcblx0b05vZGU6IEVsZW1lbnQsXG5cdHByb2Nlc3NDdXN0b21EYXRhID0gZmFsc2Vcbikge1xuXHRpZiAoT2JqZWN0LmtleXMob0FnZ3JlZ2F0aW9ucykubGVuZ3RoID4gMCkge1xuXHRcdE9iamVjdC5rZXlzKG9BZ2dyZWdhdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKHNBZ2dyZWdhdGlvbk5hbWU6IHN0cmluZykge1xuXHRcdFx0Y29uc3Qgb0FnZ3JlZ2F0aW9uRWxlbWVudCA9IG9BZ2dyZWdhdGlvbnNbc0FnZ3JlZ2F0aW9uTmFtZV07XG5cdFx0XHRpZiAob05vZGUgIT09IG51bGwgJiYgb05vZGUgIT09IHVuZGVmaW5lZCAmJiBvQWdncmVnYXRpb25FbGVtZW50KSB7XG5cdFx0XHRcdC8vIHNsb3RzIGNhbiBoYXZlIDo6IGFzIGtleXMgd2hpY2ggaXMgbm90IGEgdmFsaWQgYWdncmVnYXRpb24gbmFtZSB0aGVyZWZvcmUgcmVwbGFjaW5nIHRoZW1cblx0XHRcdFx0Y29uc3Qgb0VsZW1lbnRDaGlsZCA9IG9BZ2dyZWdhdGlvbkVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cdFx0XHRcdGlmICghW1wiZGVwZW5kZW50c1wiLCBcImN1c3RvbURhdGFcIiwgXCJsYXlvdXREYXRhXCJdLmluY2x1ZGVzKHNBZ2dyZWdhdGlvbk5hbWUpKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc1Nsb3ROYW1lID1cblx0XHRcdFx0XHRcdChvTWV0YWRhdGFBZ2dyZWdhdGlvbnNbc0FnZ3JlZ2F0aW9uTmFtZV0gIT09IHVuZGVmaW5lZCAmJiBvTWV0YWRhdGFBZ2dyZWdhdGlvbnNbc0FnZ3JlZ2F0aW9uTmFtZV0uc2xvdCkgfHxcblx0XHRcdFx0XHRcdHNBZ2dyZWdhdGlvbk5hbWU7XG5cdFx0XHRcdFx0Y29uc3Qgb1RhcmdldEVsZW1lbnQgPSBvTm9kZS5xdWVyeVNlbGVjdG9yKGBzbG90W25hbWU9JyR7c1Nsb3ROYW1lfSddYCk7XG5cdFx0XHRcdFx0aWYgKG9UYXJnZXRFbGVtZW50ICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvTmV3Q2hpbGQgPSBwcmVwYXJlQWdncmVnYXRpb25FbGVtZW50KG9Ob2RlLCBzQWdncmVnYXRpb25OYW1lLCBvRWxlbWVudENoaWxkKTtcblx0XHRcdFx0XHRcdG9UYXJnZXRFbGVtZW50LnJlcGxhY2VXaXRoKC4uLihvTmV3Q2hpbGQuY2hpbGRyZW4gYXMgdW5rbm93biBhcyBOb2RlW10pKTsgLy8gU29tZWhvdyBUUyBkb2Vzbid0IGxpa2UgdGhpcyBidXQgdGhlIGRvY3VtZW50YXRpb24gc2F5cyBpcyBzaG91bGQgd29ya1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChwcm9jZXNzQ3VzdG9tRGF0YSAmJiBvRWxlbWVudENoaWxkICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb05ld0NoaWxkID0gcHJlcGFyZUFnZ3JlZ2F0aW9uRWxlbWVudChvTm9kZSwgc0FnZ3JlZ2F0aW9uTmFtZSwgb0VsZW1lbnRDaGlsZCk7XG5cdFx0XHRcdFx0b05vZGUuYXBwZW5kQ2hpbGQob05ld0NoaWxkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVBZ2dyZWdhdGlvbkVsZW1lbnQob05vZGU6IEVsZW1lbnQsIHNBZ2dyZWdhdGlvbk5hbWU6IHN0cmluZywgb0VsZW1lbnRDaGlsZDogRWxlbWVudCB8IG51bGwpIHtcblx0Y29uc3Qgb05ld0NoaWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG9Ob2RlLm5hbWVzcGFjZVVSSSwgc0FnZ3JlZ2F0aW9uTmFtZS5yZXBsYWNlKC86L2dpLCBcIl9cIikpO1xuXHR3aGlsZSAob0VsZW1lbnRDaGlsZCkge1xuXHRcdGNvbnN0IG9OZXh0Q2hpbGQgPSBvRWxlbWVudENoaWxkLm5leHRFbGVtZW50U2libGluZztcblx0XHRvTmV3Q2hpbGQuYXBwZW5kQ2hpbGQob0VsZW1lbnRDaGlsZCk7XG5cdFx0b0VsZW1lbnRDaGlsZCA9IG9OZXh0Q2hpbGQ7XG5cdH1cblx0cmV0dXJuIG9OZXdDaGlsZDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0J1aWxkaW5nQmxvY2soXG5cdEJ1aWxkaW5nQmxvY2tDbGFzczogdHlwZW9mIEJ1aWxkaW5nQmxvY2tCYXNlLFxuXHRvTm9kZTogRWxlbWVudCxcblx0b1Zpc2l0b3I6IElWaXNpdG9yQ2FsbGJhY2ssXG5cdGlzUHVibGljID0gZmFsc2Vcbikge1xuXHRjb25zdCBvTWV0YWRhdGEgPSB0cmFuc2Zvcm1NZXRhZGF0YShCdWlsZGluZ0Jsb2NrQ2xhc3MubWV0YWRhdGEpO1xuXG5cdGNvbnN0IHNGcmFnbWVudE5hbWUgPSBvTWV0YWRhdGEuZnJhZ21lbnQgPz8gYCR7b01ldGFkYXRhLm5hbWVzcGFjZSA/PyBvTWV0YWRhdGEucHVibGljTmFtZXNwYWNlfS4ke29NZXRhZGF0YS54bWxUYWcgPz8gb01ldGFkYXRhLm5hbWV9YDtcblxuXHRjb25zdCBtQ29udGV4dHM6IFJlY29yZDxzdHJpbmcsIENvbnRleHQ+ID0ge307XG5cdGNvbnN0IG9TZXR0aW5ncyA9IG9WaXNpdG9yLmdldFNldHRpbmdzKCk7XG5cblx0Ly8gQWRkIGFuIGVtcHR5IGNvbnZlcnRlciBjb250ZXh0IGlmIHRoZXJlIGlzIG5vbmUgaW4gb3JkZXIgdG8gaGF2ZSBhIHBsYWNlIHRvIHN0b3JlIG9iamVjdCB2YWx1ZXNcblx0b1NldHRpbmdzLm1vZGVscy5jb252ZXJ0ZXJDb250ZXh0ID8/PSBuZXcgSlNPTk1vZGVsKCk7XG5cblx0Ly9JbmplY3Qgc3RvcmFnZSBmb3IgbWFjcm9zXG5cdGlmICghb1NldHRpbmdzW3NGcmFnbWVudE5hbWVdKSB7XG5cdFx0b1NldHRpbmdzW3NGcmFnbWVudE5hbWVdID0ge307XG5cdH1cblxuXHQvLyBGaXJzdCBvZiBhbGwgd2UgbmVlZCB0byB2aXNpdCB0aGUgYXR0cmlidXRlcyB0byByZXNvbHZlIHRoZSBwcm9wZXJ0aWVzIGFuZCB0aGUgbWV0YWRhdGEgY29udGV4dHNcblx0Y29uc3QgcHJvcGVydHlWYWx1ZXMgPSBhd2FpdCBwcm9jZXNzUHJvcGVydGllcyhvTWV0YWRhdGEsIG9Ob2RlLCBpc1B1YmxpYywgb1Zpc2l0b3IpO1xuXHRjb25zdCBpbml0aWFsS2V5cyA9IE9iamVjdC5rZXlzKHByb3BlcnR5VmFsdWVzKTtcblx0Y29uc3QgbU1pc3NpbmdDb250ZXh0ID0gcHJvY2Vzc0NvbnRleHRzKG9NZXRhZGF0YSwgb1NldHRpbmdzLCBvTm9kZSwgaXNQdWJsaWMsIG9WaXNpdG9yLCBtQ29udGV4dHMsIHByb3BlcnR5VmFsdWVzKTtcblxuXHR0cnkge1xuXHRcdC8vIEFnZ3JlZ2F0aW9uIGFuZCBjb21wbGV4IHR5cGUgc3VwcG9ydFxuXHRcdGNvbnN0IG9BZ2dyZWdhdGlvbnMgPSBhd2FpdCBwcm9jZXNzQ2hpbGRyZW4ob05vZGUsIG9WaXNpdG9yLCBvTWV0YWRhdGEsIGlzUHVibGljLCBwcm9wZXJ0eVZhbHVlcyk7XG5cdFx0bGV0IG9Db250cm9sQ29uZmlnID0ge307XG5cblx0XHRpZiAob1NldHRpbmdzLm1vZGVscy52aWV3RGF0YSkge1xuXHRcdFx0Ly8gT25seSB1c2VkIGluIHRoZSBGaWVsZCBtYWNybyBhbmQgZXZlbiB0aGVuIG1heWJlIG5vdCByZWFsbHkgdXNlZnVsXG5cdFx0XHRvQ29udHJvbENvbmZpZyA9IG9TZXR0aW5ncy5tb2RlbHMudmlld0RhdGEuZ2V0UHJvcGVydHkoXCIvY29udHJvbENvbmZpZ3VyYXRpb25cIik7XG5cdFx0fVxuXHRcdGxldCBwcm9jZXNzZWRQcm9wZXJ0eVZhbHVlcyA9IHByb3BlcnR5VmFsdWVzO1xuXG5cdFx0T2JqZWN0LmtleXMocHJvcGVydHlWYWx1ZXMpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG5cdFx0XHRsZXQgb0RhdGEgPSBwcm9wZXJ0eVZhbHVlc1twcm9wTmFtZV0gYXMgdW5rbm93biBhcyBDb250ZXh0O1xuXHRcdFx0Ly9jaGVjayBmb3IgYWRkaXRpb25hbCBwcm9jZXNzaW5nIGZ1bmN0aW9uIHRvIHZhbGlkYXRlIC8gb3ZlcndyaXRlIHBhcmFtZXRlcnNcblx0XHRcdGNvbnN0IG9yaWdpbmFsRGVmaW5pdGlvbiA9IEJ1aWxkaW5nQmxvY2tDbGFzcz8ubWV0YWRhdGE/LnByb3BlcnRpZXNbcHJvcE5hbWVdO1xuXHRcdFx0aWYgKG9yaWdpbmFsRGVmaW5pdGlvbj8udmFsaWRhdGUpIHtcblx0XHRcdFx0b0RhdGEgPSBvcmlnaW5hbERlZmluaXRpb24udmFsaWRhdGUob0RhdGEpIHx8IG9EYXRhO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9EYXRhPy5pc0E/LihTQVBfVUlfTU9ERUxfQ09OVEVYVCkgJiYgIW9EYXRhLmdldE1vZGVsKCkuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTWV0YU1vZGVsXCIpKSB7XG5cdFx0XHRcdHByb3BlcnR5VmFsdWVzW3Byb3BOYW1lXSA9IG9EYXRhLmdldE9iamVjdCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHByb3BlcnR5VmFsdWVzLmlzUHVibGljID0gaXNQdWJsaWM7XG5cblx0XHRjb25zdCBvSW5zdGFuY2UgPSBuZXcgQnVpbGRpbmdCbG9ja0NsYXNzKHsgLi4ucHJvcGVydHlWYWx1ZXMsIC4uLm9BZ2dyZWdhdGlvbnMgfSwgb0NvbnRyb2xDb25maWcsIG9TZXR0aW5ncyk7XG5cdFx0cHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXMgPSBvSW5zdGFuY2UuZ2V0UHJvcGVydGllcygpO1xuXHRcdE9iamVjdC5rZXlzKG9NZXRhZGF0YS5tZXRhZGF0YUNvbnRleHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChzQ29udGV4dE5hbWU6IHN0cmluZykge1xuXHRcdFx0aWYgKHByb2Nlc3NlZFByb3BlcnR5VmFsdWVzLmhhc093blByb3BlcnR5KHNDb250ZXh0TmFtZSkpIHtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0T2JqZWN0ID0gcHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXNbc0NvbnRleHROYW1lXTtcblx0XHRcdFx0aWYgKGlzQ29udGV4dCh0YXJnZXRPYmplY3QpKSB7XG5cdFx0XHRcdFx0bUNvbnRleHRzW3NDb250ZXh0TmFtZV0gPSB0YXJnZXRPYmplY3QgYXMgQ29udGV4dDtcblx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgdGFyZ2V0T2JqZWN0ID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0Y29uc3QgYXR0cmlidXRlVmFsdWUgPSBzdG9yZU9iamVjdFZhbHVlKHRhcmdldE9iamVjdCk7XG5cdFx0XHRcdFx0b1NldHRpbmdzLm1vZGVscy5jb252ZXJ0ZXJDb250ZXh0LnNldFByb3BlcnR5KGF0dHJpYnV0ZVZhbHVlLCB0YXJnZXRPYmplY3QpO1xuXHRcdFx0XHRcdGNvbnN0IG5ld0NvbnRleHQgPSBvU2V0dGluZ3MubW9kZWxzLmNvbnZlcnRlckNvbnRleHQuY3JlYXRlQmluZGluZ0NvbnRleHQoYXR0cmlidXRlVmFsdWUpITtcblx0XHRcdFx0XHR1bnN0b3JlT2JqZWN0VmFsdWUoYXR0cmlidXRlVmFsdWUpO1xuXHRcdFx0XHRcdG1Db250ZXh0c1tzQ29udGV4dE5hbWVdID0gbmV3Q29udGV4dDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Y29uc3Qgb0F0dHJpYnV0ZXNNb2RlbDogSlNPTk1vZGVsID0gbmV3IEF0dHJpYnV0ZU1vZGVsKG9Ob2RlLCBwcm9jZXNzZWRQcm9wZXJ0eVZhbHVlcywgQnVpbGRpbmdCbG9ja0NsYXNzKTtcblx0XHRtQ29udGV4dHNbXCJ0aGlzXCJdID0gb0F0dHJpYnV0ZXNNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdFx0bGV0IG9QcmV2aW91c01hY3JvSW5mbzogTWFjcm9JbmZvIHwgdW5kZWZpbmVkO1xuXG5cdFx0Ly8gS2VlcCB0cmFja1xuXHRcdGlmIChUcmFjZUluZm8uaXNUcmFjZUluZm9BY3RpdmUoKSkge1xuXHRcdFx0Y29uc3Qgb1RyYWNlSW5mbyA9IFRyYWNlSW5mby50cmFjZU1hY3JvQ2FsbHMoc0ZyYWdtZW50TmFtZSwgb01ldGFkYXRhLCBtQ29udGV4dHMsIG9Ob2RlLCBvVmlzaXRvcik7XG5cdFx0XHRpZiAoKG9UcmFjZUluZm8gYXMgVHJhY2VNZXRhZGF0YUNvbnRleHQpPy5tYWNyb0luZm8pIHtcblx0XHRcdFx0b1ByZXZpb3VzTWFjcm9JbmZvID0gb1NldHRpbmdzW1wiX21hY3JvSW5mb1wiXTtcblx0XHRcdFx0b1NldHRpbmdzW1wiX21hY3JvSW5mb1wiXSA9IChvVHJhY2VJbmZvIGFzIFRyYWNlTWV0YWRhdGFDb250ZXh0KS5tYWNyb0luZm87XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHZhbGlkYXRlTWFjcm9TaWduYXR1cmUoc0ZyYWdtZW50TmFtZSwgb01ldGFkYXRhLCBtQ29udGV4dHMsIG9Ob2RlKTtcblxuXHRcdGNvbnN0IG9Db250ZXh0VmlzaXRvciA9IG9WaXNpdG9yLndpdGgobUNvbnRleHRzLCBvTWV0YWRhdGEuaXNPcGVuICE9PSB1bmRlZmluZWQgPyAhb01ldGFkYXRhLmlzT3BlbiA6IHRydWUpO1xuXHRcdGNvbnN0IG9QYXJlbnQgPSBvTm9kZS5wYXJlbnROb2RlO1xuXG5cdFx0bGV0IGlDaGlsZEluZGV4OiBudW1iZXI7XG5cdFx0bGV0IG9Qcm9taXNlO1xuXHRcdGlmIChvUGFyZW50KSB7XG5cdFx0XHRpQ2hpbGRJbmRleCA9IEFycmF5LmZyb20ob1BhcmVudC5jaGlsZHJlbikuaW5kZXhPZihvTm9kZSk7XG5cblx0XHRcdGlmIChvTWV0YWRhdGEuZnJhZ21lbnQpIHtcblx0XHRcdFx0b1Byb21pc2UgPSBvQ29udGV4dFZpc2l0b3IuaW5zZXJ0RnJhZ21lbnQoc0ZyYWdtZW50TmFtZSwgb05vZGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgdGVtcGxhdGVTdHJpbmcgPSBhd2FpdCBvSW5zdGFuY2UuZ2V0VGVtcGxhdGUhKG9Ob2RlKTtcblxuXHRcdFx0XHRpZiAoQnVpbGRpbmdCbG9ja0NsYXNzLmlzUnVudGltZSkge1xuXHRcdFx0XHRcdC8vIEZvciBydW50aW1lIGJ1aWxkaW5nIGJsb2Nrcywgd2UgbmVlZCB0byBhdHRhY2ggYWxsIG9iamVjdHMgdG8gdGhlIGNvbnZlcnRlckNvbnRleHQgZGlyZWN0bHksIGFzIHRoZSBhY3R1YWwgcmVuZGVyaW5nIHRha2VzIHBsYWNlIGF0IHJ1bnRpbWVcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHN0b3JlS2V5IGluIHRlbXBvcmFyeU9iamVjdFN0b3JlKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBkYXRhID0gdW5zdG9yZU9iamVjdFZhbHVlKHN0b3JlS2V5KTtcblx0XHRcdFx0XHRcdG9TZXR0aW5ncy5tb2RlbHMuY29udmVydGVyQ29udGV4dC5zZXRQcm9wZXJ0eShzdG9yZUtleSwgZGF0YSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IGhhc0Vycm9yID0gXCJcIjtcblx0XHRcdFx0aWYgKHRlbXBsYXRlU3RyaW5nKSB7XG5cdFx0XHRcdFx0bGV0IGhhc1BhcnNlRXJyb3IgPSBmYWxzZTtcblx0XHRcdFx0XHRsZXQgcGFyc2VkVGVtcGxhdGUgPSBwYXJzZVhNTFN0cmluZyh0ZW1wbGF0ZVN0cmluZywgdHJ1ZSk7XG5cdFx0XHRcdFx0Ly8gRm9yIHNhZmV0eSBwdXJwb3NlIHdlIHRyeSB0byBkZXRlY3QgdHJhaWxpbmcgdGV4dCBpbiBiZXR3ZWVuIFhNTCBUYWdzXG5cdFx0XHRcdFx0Zm9yIChjb25zdCBlbGVtZW50IG9mIHBhcnNlZFRlbXBsYXRlKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBpdGVyID0gZG9jdW1lbnQuY3JlYXRlTm9kZUl0ZXJhdG9yKGVsZW1lbnQsIE5vZGVGaWx0ZXIuU0hPV19URVhUKTtcblx0XHRcdFx0XHRcdGxldCB0ZXh0bm9kZSA9IGl0ZXIubmV4dE5vZGUoKTtcblx0XHRcdFx0XHRcdGlmIChlbGVtZW50LmxvY2FsTmFtZSA9PT0gXCJwYXJzZXJlcnJvclwiKSB7XG5cdFx0XHRcdFx0XHRcdGhhc1BhcnNlRXJyb3IgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0d2hpbGUgKHRleHRub2RlKSB7XG5cdFx0XHRcdFx0XHRcdGlmICh0ZXh0bm9kZS50ZXh0Q29udGVudCAmJiB0ZXh0bm9kZS50ZXh0Q29udGVudC50cmltKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRcdGhhc0Vycm9yID0gdGV4dG5vZGUudGV4dENvbnRlbnQ7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0dGV4dG5vZGUgPSBpdGVyLm5leHROb2RlKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGhhc1BhcnNlRXJyb3IpIHtcblx0XHRcdFx0XHRcdC8vIElmIHRoZXJlIGlzIGEgcGFyc2VlcnJvciB3aGlsZSBwcm9jZXNzaW5nIHRoZSBYTUwgaXQgbWVhbnMgdGhlIFhNTCBpdHNlbGYgaXMgbWFsZm9ybWVkLCBhcyBzdWNoIHdlIHJlcnVuIHRoZSB0ZW1wbGF0ZSBwcm9jZXNzXG5cdFx0XHRcdFx0XHQvLyBTZXR0aW5nIGlzVHJhY2VNb2RlIHRydWUgd2lsbCBtYWtlIGl0IHNvIHRoYXQgZWFjaCB4bWxgIGV4cHJlc3Npb24gaXMgY2hlY2tlZCBmb3IgdmFsaWRpdHkgZnJvbSBYTUwgcGVyc3BlY3RpdmVcblx0XHRcdFx0XHRcdC8vIElmIGFuIGVycm9yIGlzIGZvdW5kIGl0J3MgcmV0dXJuZWQgaW5zdGVhZCBvZiB0aGUgbm9ybWFsIGZyYWdtZW50XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoYEVycm9yIHdoaWxlIHByb2Nlc3NpbmcgYnVpbGRpbmcgYmxvY2sgJHtvTWV0YWRhdGEueG1sVGFnIHx8IG9NZXRhZGF0YS5uYW1lfWApO1xuXHRcdFx0XHRcdFx0cGFyc2VkVGVtcGxhdGUgPSBhd2FpdCBwcm9jZXNzWG1sSW5UcmFjZShhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGluaXRpYWxUZW1wbGF0ZSA9IGF3YWl0IG9JbnN0YW5jZS5nZXRUZW1wbGF0ZT8uKG9Ob2RlKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlWE1MU3RyaW5nKGluaXRpYWxUZW1wbGF0ZSA/PyBcIlwiLCB0cnVlKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoaGFzRXJyb3IubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgdHJhaWxpbmcgdGV4dCB3ZSBjcmVhdGUgYSBzdGFuZGFyZCBlcnJvciBhbmQgZGlzcGxheSBpdC5cblx0XHRcdFx0XHRcdExvZy5lcnJvcihgRXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBidWlsZGluZyBibG9jayAke29NZXRhZGF0YS54bWxUYWcgfHwgb01ldGFkYXRhLm5hbWV9YCk7XG5cdFx0XHRcdFx0XHRjb25zdCBvRXJyb3JUZXh0ID0gY3JlYXRlRXJyb3JYTUwoXG5cdFx0XHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdFx0XHRgRXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBidWlsZGluZyBibG9jayAke29NZXRhZGF0YS54bWxUYWcgfHwgb01ldGFkYXRhLm5hbWV9YCxcblx0XHRcdFx0XHRcdFx0XHRgVHJhaWxpbmcgdGV4dCB3YXMgZm91bmQgaW4gdGhlIFhNTDogJHtoYXNFcnJvcn1gXG5cdFx0XHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0XHRcdHBhcnNlZFRlbXBsYXRlLm1hcCgodGVtcGxhdGUpID0+IHRlbXBsYXRlLm91dGVySFRNTCkuam9pbihcIlxcblwiKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHBhcnNlZFRlbXBsYXRlID0gcGFyc2VYTUxTdHJpbmcob0Vycm9yVGV4dCwgdHJ1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9Ob2RlLnJlcGxhY2VXaXRoKC4uLnBhcnNlZFRlbXBsYXRlKTtcblxuXHRcdFx0XHRcdGNvbnN0IHZpc2l0ZWROb2RlcyA9IHBhcnNlZFRlbXBsYXRlLm1hcChhc3luYyAoaW50ZXJuYWxOb2RlKSA9PiB7XG5cdFx0XHRcdFx0XHRwcm9jZXNzU2xvdHMob0FnZ3JlZ2F0aW9ucywgb01ldGFkYXRhLmFnZ3JlZ2F0aW9ucywgaW50ZXJuYWxOb2RlLCBmYWxzZSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0NvbnRleHRWaXNpdG9yLnZpc2l0Tm9kZShpbnRlcm5hbE5vZGUpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdG9Qcm9taXNlID0gUHJvbWlzZS5hbGwodmlzaXRlZE5vZGVzKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvTm9kZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRvUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGF3YWl0IG9Qcm9taXNlO1xuXHRcdFx0Y29uc3Qgb01hY3JvRWxlbWVudCA9IG9QYXJlbnQuY2hpbGRyZW5baUNoaWxkSW5kZXhdO1xuXHRcdFx0cHJvY2Vzc1Nsb3RzKG9BZ2dyZWdhdGlvbnMsIG9NZXRhZGF0YS5hZ2dyZWdhdGlvbnMsIG9NYWNyb0VsZW1lbnQsIHRydWUpO1xuXHRcdFx0aWYgKG9NYWNyb0VsZW1lbnQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb25zdCBvUmVtYWluaW5nU2xvdHMgPSBvTWFjcm9FbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJzbG90XCIpO1xuXHRcdFx0XHRvUmVtYWluaW5nU2xvdHMuZm9yRWFjaChmdW5jdGlvbiAob1Nsb3RFbGVtZW50KSB7XG5cdFx0XHRcdFx0b1Nsb3RFbGVtZW50LnJlbW92ZSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG9QcmV2aW91c01hY3JvSW5mbykge1xuXHRcdFx0Ly9yZXN0b3JlIG1hY3JvIGluZm8gaWYgYXZhaWxhYmxlXG5cdFx0XHRvU2V0dGluZ3NbXCJfbWFjcm9JbmZvXCJdID0gb1ByZXZpb3VzTWFjcm9JbmZvO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkZWxldGUgb1NldHRpbmdzW1wiX21hY3JvSW5mb1wiXTtcblx0XHR9XG5cdH0gY2F0Y2ggKGU6IHVua25vd24pIHtcblx0XHQvLyBJbiBjYXNlIHRoZXJlIGlzIGEgZ2VuZXJpYyBlcnJvciAodXN1YWxseSBjb2RlIGVycm9yKSwgd2UgcmV0cmlldmUgdGhlIGN1cnJlbnQgY29udGV4dCBpbmZvcm1hdGlvbiBhbmQgY3JlYXRlIGEgZGVkaWNhdGVkIGVycm9yIG1lc3NhZ2Vcblx0XHRjb25zdCB0cmFjZURldGFpbHMgPSB7XG5cdFx0XHRpbml0aWFsUHJvcGVydGllczoge30gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG5cdFx0XHRyZXNvbHZlZFByb3BlcnRpZXM6IHt9IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuXHRcdFx0bWlzc2luZ0NvbnRleHRzOiBtTWlzc2luZ0NvbnRleHRcblx0XHR9O1xuXHRcdGZvciAoY29uc3QgcHJvcGVydHlOYW1lIG9mIGluaXRpYWxLZXlzKSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydHlWYWx1ZXNbcHJvcGVydHlOYW1lXTtcblx0XHRcdGlmIChpc0NvbnRleHQocHJvcGVydHlWYWx1ZSkpIHtcblx0XHRcdFx0dHJhY2VEZXRhaWxzLmluaXRpYWxQcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSB7XG5cdFx0XHRcdFx0cGF0aDogcHJvcGVydHlWYWx1ZS5nZXRQYXRoKCksXG5cdFx0XHRcdFx0dmFsdWU6IHByb3BlcnR5VmFsdWUuZ2V0T2JqZWN0KClcblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRyYWNlRGV0YWlscy5pbml0aWFsUHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID0gcHJvcGVydHlWYWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Zm9yIChjb25zdCBwcm9wZXJ0eU5hbWUgaW4gcHJvcGVydHlWYWx1ZXMpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0eVZhbHVlc1twcm9wZXJ0eU5hbWVdO1xuXHRcdFx0aWYgKCFpbml0aWFsS2V5cy5pbmNsdWRlcyhwcm9wZXJ0eU5hbWUpKSB7XG5cdFx0XHRcdGlmIChpc0NvbnRleHQocHJvcGVydHlWYWx1ZSkpIHtcblx0XHRcdFx0XHR0cmFjZURldGFpbHMucmVzb2x2ZWRQcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSB7XG5cdFx0XHRcdFx0XHRwYXRoOiBwcm9wZXJ0eVZhbHVlLmdldFBhdGgoKSxcblx0XHRcdFx0XHRcdHZhbHVlOiBwcm9wZXJ0eVZhbHVlLmdldE9iamVjdCgpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cmFjZURldGFpbHMucmVzb2x2ZWRQcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSBwcm9wZXJ0eVZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdExvZy5lcnJvcihlIGFzIHN0cmluZyk7XG5cdFx0Y29uc3Qgb0Vycm9yID0gY3JlYXRlRXJyb3JYTUwoXG5cdFx0XHRbYEVycm9yIHdoaWxlIHByb2Nlc3NpbmcgYnVpbGRpbmcgYmxvY2sgJHtvTWV0YWRhdGEubmFtZX1gXSxcblx0XHRcdG9Ob2RlLm91dGVySFRNTCxcblx0XHRcdHRyYWNlRGV0YWlscyxcblx0XHRcdChlIGFzIEVycm9yKS5zdGFja1xuXHRcdCk7XG5cdFx0Y29uc3Qgb1RlbXBsYXRlID0gcGFyc2VYTUxTdHJpbmcob0Vycm9yLCB0cnVlKTtcblx0XHRvTm9kZS5yZXBsYWNlV2l0aCguLi5vVGVtcGxhdGUpO1xuXHR9XG59XG5mdW5jdGlvbiBhZGRTaW5nbGVDb250ZXh0KFxuXHRtQ29udGV4dHM6IFJlY29yZDxzdHJpbmcsIENvbnRleHQgfCB1bmRlZmluZWQ+LFxuXHRvVmlzaXRvcjogSVZpc2l0b3JDYWxsYmFjayxcblx0b0N0eDoge1xuXHRcdG5hbWU/OiBzdHJpbmc7XG5cdFx0cGF0aDogc3RyaW5nO1xuXHRcdG1vZGVsPzogc3RyaW5nO1xuXHR9XG4pIHtcblx0Y29uc3Qgc0tleSA9IChvQ3R4Lm5hbWUgfHwgb0N0eC5tb2RlbCB8fCB1bmRlZmluZWQpIGFzIHN0cmluZztcblx0aWYgKG1Db250ZXh0c1tzS2V5XSkge1xuXHRcdHJldHVybjsgLy8gZG8gbm90IGFkZCB0d2ljZVxuXHR9XG5cdHRyeSB7XG5cdFx0bGV0IHNDb250ZXh0UGF0aCA9IG9DdHgucGF0aDtcblx0XHRpZiAob0N0eC5tb2RlbCAhPT0gbnVsbCkge1xuXHRcdFx0c0NvbnRleHRQYXRoID0gYCR7b0N0eC5tb2RlbH0+JHtzQ29udGV4dFBhdGh9YDtcblx0XHR9XG5cdFx0Y29uc3QgbVNldHRpbmcgPSBvVmlzaXRvci5nZXRTZXR0aW5ncygpO1xuXHRcdGlmIChvQ3R4Lm1vZGVsID09PSBcImNvbnZlcnRlckNvbnRleHRcIiAmJiBvQ3R4LnBhdGgubGVuZ3RoID4gMCkge1xuXHRcdFx0bUNvbnRleHRzW3NLZXldID0gbVNldHRpbmcubW9kZWxzW29DdHgubW9kZWxdLmdldENvbnRleHQob0N0eC5wYXRoIC8qLCBtU2V0dGluZy5iaW5kaW5nQ29udGV4dHNbb0N0eC5tb2RlbF0qLyk7IC8vIGFkZCB0aGUgY29udGV4dCB0byB0aGUgdmlzaXRvclxuXHRcdH0gZWxzZSBpZiAoIW1TZXR0aW5nLmJpbmRpbmdDb250ZXh0c1tvQ3R4Lm1vZGVsIV0gJiYgbVNldHRpbmcubW9kZWxzW29DdHgubW9kZWwhXSkge1xuXHRcdFx0bUNvbnRleHRzW3NLZXldID0gbVNldHRpbmcubW9kZWxzW29DdHgubW9kZWwhXS5nZXRDb250ZXh0KG9DdHgucGF0aCk7IC8vIGFkZCB0aGUgY29udGV4dCB0byB0aGUgdmlzaXRvclxuXHRcdH0gZWxzZSB7XG5cdFx0XHRtQ29udGV4dHNbc0tleV0gPSBvVmlzaXRvci5nZXRDb250ZXh0KHNDb250ZXh0UGF0aCk7IC8vIGFkZCB0aGUgY29udGV4dCB0byB0aGUgdmlzaXRvclxuXHRcdH1cblx0fSBjYXRjaCAoZXgpIHtcblx0XHQvLyBpZ25vcmUgdGhlIGNvbnRleHQgYXMgdGhpcyBjYW4gb25seSBiZSB0aGUgY2FzZSBpZiB0aGUgbW9kZWwgaXMgbm90IHJlYWR5LFxuXHRcdC8vIGkuZS4gbm90IGEgcHJlcHJvY2Vzc2luZyBtb2RlbCBidXQgbWF5YmUgYSBtb2RlbCBmb3IgcHJvdmlkaW5nIGFmdGVyd2FyZHNcblx0fVxufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGEgYnVpbGRpbmcgYmxvY2sgZGVmaW5pdGlvbiB0byBiZSB1c2VkIGluc2lkZSB0aGUgeG1sIHRlbXBsYXRlIHByb2Nlc3Nvci5cbiAqXG4gKiBAcGFyYW0gQnVpbGRpbmdCbG9ja0NsYXNzIFRoZSBidWlsZGluZyBibG9jayBkZWZpbml0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckJ1aWxkaW5nQmxvY2soQnVpbGRpbmdCbG9ja0NsYXNzOiB0eXBlb2YgQnVpbGRpbmdCbG9ja0Jhc2UpOiB2b2lkIHtcblx0aWYgKEJ1aWxkaW5nQmxvY2tDbGFzcy5tZXRhZGF0YS5uYW1lc3BhY2UgIT09IHVuZGVmaW5lZCkge1xuXHRcdFhNTFByZXByb2Nlc3Nvci5wbHVnSW4oXG5cdFx0XHRhc3luYyAob05vZGU6IEVsZW1lbnQsIG9WaXNpdG9yOiBJVmlzaXRvckNhbGxiYWNrKSA9PiBwcm9jZXNzQnVpbGRpbmdCbG9jayhCdWlsZGluZ0Jsb2NrQ2xhc3MsIG9Ob2RlLCBvVmlzaXRvciksXG5cdFx0XHRCdWlsZGluZ0Jsb2NrQ2xhc3MubWV0YWRhdGEubmFtZXNwYWNlLFxuXHRcdFx0QnVpbGRpbmdCbG9ja0NsYXNzLm1ldGFkYXRhLnhtbFRhZyB8fCBCdWlsZGluZ0Jsb2NrQ2xhc3MubWV0YWRhdGEubmFtZVxuXHRcdCk7XG5cdH1cblx0aWYgKEJ1aWxkaW5nQmxvY2tDbGFzcy5tZXRhZGF0YS5wdWJsaWNOYW1lc3BhY2UgIT09IHVuZGVmaW5lZCkge1xuXHRcdFhNTFByZXByb2Nlc3Nvci5wbHVnSW4oXG5cdFx0XHRhc3luYyAob05vZGU6IEVsZW1lbnQsIG9WaXNpdG9yOiBJVmlzaXRvckNhbGxiYWNrKSA9PiBwcm9jZXNzQnVpbGRpbmdCbG9jayhCdWlsZGluZ0Jsb2NrQ2xhc3MsIG9Ob2RlLCBvVmlzaXRvciwgdHJ1ZSksXG5cdFx0XHRCdWlsZGluZ0Jsb2NrQ2xhc3MubWV0YWRhdGEucHVibGljTmFtZXNwYWNlLFxuXHRcdFx0QnVpbGRpbmdCbG9ja0NsYXNzLm1ldGFkYXRhLnhtbFRhZyB8fCBCdWlsZGluZ0Jsb2NrQ2xhc3MubWV0YWRhdGEubmFtZVxuXHRcdCk7XG5cdH1cbn1cblxuLyoqXG4gKiBVblJlZ2lzdGVyIGEgYnVpbGRpbmcgYmxvY2sgZGVmaW5pdGlvbiBzbyB0aGF0IGl0IGlzIG5vIGxvbmdlciB1c2VkIGluc2lkZSB0aGUgeG1sIHRlbXBsYXRlIHByb2Nlc3Nvci5cbiAqXG4gKiBAcGFyYW0gQnVpbGRpbmdCbG9ja0NsYXNzIFRoZSBidWlsZGluZyBibG9jayBkZWZpbml0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnJlZ2lzdGVyQnVpbGRpbmdCbG9jayhCdWlsZGluZ0Jsb2NrQ2xhc3M6IHR5cGVvZiBCdWlsZGluZ0Jsb2NrQmFzZSk6IHZvaWQge1xuXHRpZiAoQnVpbGRpbmdCbG9ja0NsYXNzLm1ldGFkYXRhLm5hbWVzcGFjZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0WE1MUHJlcHJvY2Vzc29yLnBsdWdJbihcblx0XHRcdG51bGwsXG5cdFx0XHRCdWlsZGluZ0Jsb2NrQ2xhc3MubWV0YWRhdGEubmFtZXNwYWNlLFxuXHRcdFx0QnVpbGRpbmdCbG9ja0NsYXNzLm1ldGFkYXRhLnhtbFRhZyB8fCBCdWlsZGluZ0Jsb2NrQ2xhc3MubWV0YWRhdGEubmFtZVxuXHRcdCk7XG5cdH1cblx0aWYgKEJ1aWxkaW5nQmxvY2tDbGFzcy5tZXRhZGF0YS5wdWJsaWNOYW1lc3BhY2UgIT09IHVuZGVmaW5lZCkge1xuXHRcdFhNTFByZXByb2Nlc3Nvci5wbHVnSW4oXG5cdFx0XHRudWxsLFxuXHRcdFx0QnVpbGRpbmdCbG9ja0NsYXNzLm1ldGFkYXRhLnB1YmxpY05hbWVzcGFjZSxcblx0XHRcdEJ1aWxkaW5nQmxvY2tDbGFzcy5tZXRhZGF0YS54bWxUYWcgfHwgQnVpbGRpbmdCbG9ja0NsYXNzLm1ldGFkYXRhLm5hbWVcblx0XHQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVycm9yWE1MKGVycm9yTWVzc2FnZXM6IHN0cmluZ1tdLCB4bWxGcmFnbWVudDogc3RyaW5nLCBhZGRpdGlvbmFsRGF0YT86IG9iamVjdCwgc3RhY2s/OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRjb25zdCBlcnJvckxhYmVscyA9IGVycm9yTWVzc2FnZXMubWFwKChlcnJvck1lc3NhZ2UpID0+IHhtbGA8bTpMYWJlbCB0ZXh0PVwiJHtlc2NhcGVYTUxBdHRyaWJ1dGVWYWx1ZShlcnJvck1lc3NhZ2UpfVwiLz5gKTtcblx0bGV0IGVycm9yU3RhY2sgPSBcIlwiO1xuXHRpZiAoc3RhY2spIHtcblx0XHRjb25zdCBzdGFja0Zvcm1hdHRlZCA9IGJ0b2EoYDxwcmU+JHtzdGFja308L3ByZT5gKTtcblx0XHRlcnJvclN0YWNrID0geG1sYDxtOkZvcm1hdHRlZFRleHQgaHRtbFRleHQ9XCIke2B7PSBCQkYuYmFzZTY0RGVjb2RlKCcke3N0YWNrRm9ybWF0dGVkfScpIH1gfVwiIC8+YDtcblx0fVxuXHRsZXQgYWRkaXRpb25hbFRleHQgPSBcIlwiO1xuXHRpZiAoYWRkaXRpb25hbERhdGEpIHtcblx0XHRhZGRpdGlvbmFsVGV4dCA9IHhtbGA8bTpWQm94PlxuXHRcdFx0XHRcdFx0PG06TGFiZWwgdGV4dD1cIlRyYWNlIEluZm9cIi8+XG5cdFx0XHRcdFx0XHQ8Y29kZTpDb2RlRWRpdG9yIHR5cGU9XCJqc29uXCIgIHZhbHVlPVwiJHtgez0gQkJGLmJhc2U2NERlY29kZSgnJHtidG9hKEpTT04uc3RyaW5naWZ5KGFkZGl0aW9uYWxEYXRhLCBudWxsLCA0KSl9JykgfWB9XCIgaGVpZ2h0PVwiMzAwcHhcIiAvPlxuXHRcdFx0XHRcdDwvbTpWQm94PmA7XG5cdH1cblx0cmV0dXJuIHhtbGA8Y29udHJvbHM6Rm9ybUVsZW1lbnRXcmFwcGVyIHhtbG5zOmNvbnRyb2xzPVwic2FwLmZlLmNvcmUuY29udHJvbHNcIj5cblx0XHRcdFx0XHQ8bTpWQm94IHhtbG5zOm09XCJzYXAubVwiIHhtbG5zOmNvZGU9XCJzYXAudWkuY29kZWVkaXRvclwiIGNvcmU6cmVxdWlyZT1cIntCQkY6J3NhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tGb3JtYXR0ZXInfVwiPlxuXHRcdFx0XHRcdCR7ZXJyb3JMYWJlbHN9XG5cdFx0XHRcdFx0JHtlcnJvclN0YWNrfVxuXHRcdFx0XHRcdFx0PGdyaWQ6Q1NTR3JpZCBncmlkVGVtcGxhdGVSb3dzPVwiZnJcIiBncmlkVGVtcGxhdGVDb2x1bW5zPVwicmVwZWF0KDIsMWZyKVwiIGdyaWRHYXA9XCIxcmVtXCIgeG1sbnM6Z3JpZD1cInNhcC51aS5sYXlvdXQuY3NzZ3JpZFwiID5cblx0XHRcdFx0XHRcdFx0PG06VkJveD5cblx0XHRcdFx0XHRcdFx0XHQ8bTpMYWJlbCB0ZXh0PVwiSG93IHRoZSBidWlsZGluZyBibG9jayB3YXMgY2FsbGVkXCIvPlxuXHRcdFx0XHRcdFx0XHRcdDxjb2RlOkNvZGVFZGl0b3IgdHlwZT1cInhtbFwiIHZhbHVlPVwiJHtgez0gQkJGLmJhc2U2NERlY29kZSgnJHtidG9hKHhtbEZyYWdtZW50LnJlcGxhY2VBbGwoXCImZ3Q7XCIsIFwiPlwiKSl9JykgfWB9XCIgaGVpZ2h0PVwiMzAwcHhcIiAvPlxuXHRcdFx0XHRcdFx0XHQ8L206VkJveD5cblx0XHRcdFx0XHRcdFx0JHthZGRpdGlvbmFsVGV4dH1cblx0XHRcdFx0XHRcdDwvZ3JpZDpDU1NHcmlkPlxuXHRcdFx0XHRcdDwvbTpWQm94PlxuXHRcdFx0XHQ8L2NvbnRyb2xzOkZvcm1FbGVtZW50V3JhcHBlcj5gO1xufVxuXG5jb25zdCB0ZW1wb3JhcnlPYmplY3RTdG9yZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblxuLyoqXG4gKiBTdG9yZXMgYW4gb2JqZWN0IHZhbHVlIGluIGEgdGVtcG9yYXJ5IHN0b3JhZ2UgYW5kIHJldHVybnMgYW4gSUQgdXNlZCB0byByZXRyaWV2ZSB0aGlzIHZhbHVlIGF0IGEgbGF0ZXIgcG9pbnQgaW4gdGltZS5cbiAqXG4gKiBSZXF1aXJlZCBhcyB0aGVyZSBpcyBmdW5jdGlvbmFsaXR5IGxpa2UgdGhlIHhtbGAgZnVuY3Rpb24sIHdoaWNoIG1pZ2h0IHRha2Ugb2JqZWN0cyBhcyBwYXJhbWV0ZXJzIGJ1dCBuZWVkcyB0byByZXR1cm4gYSBzZXJpYWxpemVkIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gc3RvcmVcbiAqIEByZXR1cm5zIElEIHRvIHJldHJpZXZlIHRoaXMgdmFsdWVcbiAqL1xuZnVuY3Rpb24gc3RvcmVPYmplY3RWYWx1ZSh2YWx1ZTogdW5rbm93bikge1xuXHRjb25zdCBwcm9wZXJ0eVVJRCA9IGAvdWlkLS0ke3VpZCgpfWA7XG5cdHRlbXBvcmFyeU9iamVjdFN0b3JlW3Byb3BlcnR5VUlEXSA9IHZhbHVlO1xuXHRyZXR1cm4gcHJvcGVydHlVSUQ7XG59XG5cbi8qKlxuICogVW5zdG9yZXMgYW4gb2JqZWN0IGZyb20gYSB0ZW1wb3Jhcnkgc3RvcmUgYnkgcmVtb3ZpbmcgaXQgYW5kIHJldHVybmluZyBpdHMgb2JqZWN0IHZhbHVlLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eVVJRCBJRCB0byByZXRyaWV2ZSB0aGlzIHZhbHVlXG4gKiBAcmV0dXJucyBPYmplY3QgdmFsdWVcbiAqL1xuZnVuY3Rpb24gdW5zdG9yZU9iamVjdFZhbHVlKHByb3BlcnR5VUlEOiBzdHJpbmcpIHtcblx0Y29uc3QgdmFsdWUgPSB0ZW1wb3JhcnlPYmplY3RTdG9yZVtwcm9wZXJ0eVVJRF07XG5cdGRlbGV0ZSB0ZW1wb3JhcnlPYmplY3RTdG9yZVtwcm9wZXJ0eVVJRF07XG5cdHJldHVybiB2YWx1ZTtcbn1cblxubGV0IHByb2Nlc3NOZXh0WG1sSW5UcmFjZSA9IGZhbHNlO1xuLyoqXG4gKiBNYWtlcyBzdXJlIHRoYXQgYWxsIHhtbGAgY2FsbHMgaW5zaWRlIHRoZSBnaXZlbiBtZXRob2QgYXJlIHByb2Nlc3NlZCBpbiB0cmFjZSBtb2RlLlxuICpcbiAqIEBwYXJhbSBtZXRob2QgVGhlIG1ldGhvZCB0byBleGVjdXRlXG4gKiBAcmV0dXJucyBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBnaXZlbiBtZXRob2RcbiAqL1xuY29uc3QgcHJvY2Vzc1htbEluVHJhY2UgPSBmdW5jdGlvbiAobWV0aG9kOiBGdW5jdGlvbikge1xuXHRwcm9jZXNzTmV4dFhtbEluVHJhY2UgPSB0cnVlO1xuXHRsZXQgcmV0dXJuVmFsdWU7XG5cdHRyeSB7XG5cdFx0cmV0dXJuVmFsdWUgPSBtZXRob2QoKTtcblx0fSBmaW5hbGx5IHtcblx0XHRwcm9jZXNzTmV4dFhtbEluVHJhY2UgPSBmYWxzZTtcblx0fVxuXHRyZXR1cm4gcmV0dXJuVmFsdWU7XG59O1xuXG4vKipcbiAqIFBhcnNlIGFuIFhNTCBzdHJpbmcgYW5kIHJldHVybiB0aGUgYXNzb2NpYXRlZCBkb2N1bWVudC5cbiAqXG4gKiBAcGFyYW0geG1sU3RyaW5nIFRoZSB4bWwgc3RyaW5nXG4gKiBAcGFyYW0gW2FkZERlZmF1bHROYW1lc3BhY2VzXSBXaGV0aGVyIG9yIG5vdCBkZWZhdWx0IG5hbWVzcGFjZXMgc2hvdWxkIGJlIGFkZGVkXG4gKiBAcmV0dXJucyBUaGUgWE1MIGRvY3VtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VYTUxTdHJpbmcoeG1sU3RyaW5nOiBzdHJpbmcsIGFkZERlZmF1bHROYW1lc3BhY2VzID0gZmFsc2UpOiBFbGVtZW50W10ge1xuXHRpZiAoYWRkRGVmYXVsdE5hbWVzcGFjZXMpIHtcblx0XHR4bWxTdHJpbmcgPSBgPHRlbXBsYXRlXG5cdFx0XHRcdFx0XHR4bWxuczp0ZW1wbGF0ZT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS50ZW1wbGF0ZS8xXCJcblx0XHRcdFx0XHRcdHhtbG5zOm09XCJzYXAubVwiXG5cdFx0XHRcdFx0XHR4bWxuczptYWNyb3M9XCJzYXAuZmUubWFjcm9zXCJcblx0XHRcdFx0XHRcdHhtbG5zOmNvcmU9XCJzYXAudWkuY29yZVwiXG5cdFx0XHRcdFx0XHR4bWxuczptZGM9XCJzYXAudWkubWRjXCJcblx0XHRcdFx0XHRcdHhtbG5zOmN1c3RvbURhdGE9XCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9leHRlbnNpb24vc2FwLnVpLmNvcmUuQ3VzdG9tRGF0YS8xXCI+JHt4bWxTdHJpbmd9PC90ZW1wbGF0ZT5gO1xuXHR9XG5cdGNvbnN0IHhtbERvY3VtZW50ID0gRE9NUGFyc2VySW5zdGFuY2UucGFyc2VGcm9tU3RyaW5nKHhtbFN0cmluZywgXCJ0ZXh0L3htbFwiKTtcblx0bGV0IG91dHB1dCA9IHhtbERvY3VtZW50LmZpcnN0RWxlbWVudENoaWxkO1xuXHR3aGlsZSAob3V0cHV0Py5sb2NhbE5hbWUgPT09IFwidGVtcGxhdGVcIikge1xuXHRcdG91dHB1dCA9IG91dHB1dC5maXJzdEVsZW1lbnRDaGlsZDtcblx0fVxuXHRjb25zdCBjaGlsZHJlbiA9IG91dHB1dD8ucGFyZW50RWxlbWVudCA/IG91dHB1dD8ucGFyZW50RWxlbWVudC5jaGlsZHJlbiA6IFtvdXRwdXQgYXMgRWxlbWVudF07XG5cdHJldHVybiBBcnJheS5mcm9tKGNoaWxkcmVuKTtcbn1cblxuLyoqXG4gKiBFc2NhcGUgYW4gWE1MIGF0dHJpYnV0ZSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIGF0dHJpYnV0ZSB2YWx1ZSB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyBUaGUgZXNjYXBlZCBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVYTUxBdHRyaWJ1dGVWYWx1ZSh2YWx1ZT86IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiB2YWx1ZT8ucmVwbGFjZSgvJi9nLCBcIiZhbXA7XCIpLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoL1wiL2csIFwiJnF1b3Q7XCIpLnJlcGxhY2UoLycvZywgXCImYXBvcztcIik7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckluVHJhY2VNb2RlKG91dFN0cjogc3RyaW5nKSB7XG5cdGNvbnN0IHhtbFJlc3VsdCA9IHBhcnNlWE1MU3RyaW5nKG91dFN0ciwgdHJ1ZSk7XG5cdGlmICh4bWxSZXN1bHQ/Lmxlbmd0aCA+IDAgJiYgeG1sUmVzdWx0WzBdPy5sb2NhbE5hbWUgPT09IFwicGFyc2VyZXJyb3JcIikge1xuXHRcdGNvbnN0IGVycm9yTWVzc2FnZSA9ICh4bWxSZXN1bHRbMF0gYXMgSFRNTEVsZW1lbnQpLmlubmVyVGV4dCB8fCAoeG1sUmVzdWx0WzBdIGFzIEhUTUxFbGVtZW50KS5pbm5lckhUTUw7XG5cdFx0cmV0dXJuIGNyZWF0ZUVycm9yWE1MKFtlcnJvck1lc3NhZ2Uuc3BsaXQoXCJcXG5cIilbMF1dLCBvdXRTdHIpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBvdXRTdHI7XG5cdH1cbn1cblxuZXhwb3J0IHR5cGUgWE1MUHJvY2Vzc29yVHlwZVZhbHVlID1cblx0fCBzdHJpbmdcblx0fCBib29sZWFuXG5cdHwgbnVtYmVyXG5cdHwgdW5kZWZpbmVkXG5cdHwgbnVsbFxuXHR8IG9iamVjdFxuXHR8IFJlY29yZDxzdHJpbmcsIHVua25vd24+XG5cdHwgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZyB8IGJvb2xlYW4gfCBudW1iZXI+XG5cdHwgQXJyYXk8c3RyaW5nPlxuXHR8IEFycmF5PEZ1bmN0aW9uPlxuXHR8IEZ1bmN0aW9uXG5cdHwgQ29udGV4dDtcbi8qKlxuICogQ3JlYXRlIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0ZW1wbGF0ZSBsaXRlcmFsIHdoaWxlIGhhbmRsaW5nIHNwZWNpYWwgb2JqZWN0IGNhc2UuXG4gKlxuICogQHBhcmFtIHN0cmluZ3MgVGhlIHN0cmluZyBwYXJ0cyBvZiB0aGUgdGVtcGxhdGUgbGl0ZXJhbFxuICogQHBhcmFtIHZhbHVlcyBUaGUgdmFsdWVzIHBhcnQgb2YgdGhlIHRlbXBsYXRlIGxpdGVyYWxcbiAqIEByZXR1cm5zIFRoZSBYTUwgc3RyaW5nIGRvY3VtZW50IHJlcHJlc2VudGluZyB0aGUgc3RyaW5nIHRoYXQgd2FzIHVzZWQuXG4gKi9cbmV4cG9ydCBjb25zdCB4bWwgPSAoc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXksIC4uLnZhbHVlczogWE1MUHJvY2Vzc29yVHlwZVZhbHVlW10pID0+IHtcblx0bGV0IG91dFN0ciA9IFwiXCI7XG5cdGxldCBpO1xuXHRmb3IgKGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0b3V0U3RyICs9IHN0cmluZ3NbaV07XG5cblx0XHQvLyBIYW5kbGUgdGhlIGRpZmZlcmVudCBjYXNlIG9mIG9iamVjdCwgaWYgaXQncyBhbiBhcnJheSB3ZSBqb2luIHRoZW0sIGlmIGl0J3MgYSBiaW5kaW5nIGV4cHJlc3Npb24gdGhlbiB3ZSBjb21waWxlIGl0LlxuXHRcdGNvbnN0IHZhbHVlID0gdmFsdWVzW2ldO1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA+IDAgJiYgdHlwZW9mIHZhbHVlWzBdID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRvdXRTdHIgKz0gdmFsdWUuZmxhdCg1KS5qb2luKFwiXFxuXCIpLnRyaW0oKTtcblx0XHR9IGVsc2UgaWYgKGlzRnVuY3Rpb25BcnJheSh2YWx1ZSkpIHtcblx0XHRcdG91dFN0ciArPSB2YWx1ZS5tYXAoKHZhbHVlZm4pID0+IHZhbHVlZm4oKSkuam9pbihcIlxcblwiKTtcblx0XHR9IGVsc2UgaWYgKGlzQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uKHZhbHVlKSkge1xuXHRcdFx0Y29uc3QgY29tcGlsZWRFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24odmFsdWUpO1xuXHRcdFx0b3V0U3RyICs9IGVzY2FwZVhNTEF0dHJpYnV0ZVZhbHVlKGNvbXBpbGVkRXhwcmVzc2lvbik7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdG91dFN0ciArPSBcInt0aGlzPnVuZGVmaW5lZFZhbHVlfVwiO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdG91dFN0ciArPSB2YWx1ZSgpO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRpZiAoaXNDb250ZXh0KHZhbHVlKSkge1xuXHRcdFx0XHRvdXRTdHIgKz0gdmFsdWUuZ2V0UGF0aCgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgcHJvcGVydHlVSWQgPSBzdG9yZU9iamVjdFZhbHVlKHZhbHVlKTtcblx0XHRcdFx0b3V0U3RyICs9IGAke3Byb3BlcnR5VUlkfWA7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgJiYgIXZhbHVlLnN0YXJ0c1dpdGgoXCI8XCIpICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiJmx0O1wiKSkge1xuXHRcdFx0b3V0U3RyICs9IGVzY2FwZVhNTEF0dHJpYnV0ZVZhbHVlKHZhbHVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3V0U3RyICs9IHZhbHVlO1xuXHRcdH1cblx0fVxuXHRvdXRTdHIgKz0gc3RyaW5nc1tpXTtcblx0b3V0U3RyID0gb3V0U3RyLnRyaW0oKTtcblx0aWYgKHByb2Nlc3NOZXh0WG1sSW5UcmFjZSkge1xuXHRcdHJldHVybiByZW5kZXJJblRyYWNlTW9kZShvdXRTdHIpO1xuXHR9XG5cdHJldHVybiBvdXRTdHI7XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O0VBOEJBLE1BQU1BLFlBQVksR0FBRywyREFBMkQ7RUFDaEYsTUFBTUMsZ0JBQWdCLEdBQUcsZ0VBQWdFO0VBQ3pGLE1BQU1DLGlCQUFpQixHQUFHLElBQUlDLFNBQVMsRUFBRTtFQTRHekMsU0FBU0MsNEJBQTRCLENBQ3BDQyxLQUFhLEVBQ2JDLFNBQWtDLEVBQ2xDQyxnQkFBd0QsRUFDeERDLElBQVksRUFDWDtJQUNELE1BQU1DLFFBQVEsR0FBR0gsU0FBUyxDQUFDRSxJ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