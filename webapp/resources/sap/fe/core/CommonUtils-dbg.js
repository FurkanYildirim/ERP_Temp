/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/array/uniqueSort", "sap/base/util/merge", "sap/fe/core/converters/ConverterContext", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticDateOperators", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/fe/core/StateFilterToSelectionVariant", "sap/fe/core/type/TypeUtil", "sap/ui/core/Component", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/Device", "sap/ui/mdc/condition/FilterOperatorUtil", "sap/ui/model/Filter", "./controls/AnyElement", "./helpers/MetaModelFunction", "./templating/FilterHelper"], function (Log, uniqueSort, mergeObjects, ConverterContext, MetaModelConverter, BindingToolkit, ModelHelper, SemanticDateOperators, StableIdHelper, FELibrary, StateFilterToSelectionVariant, TypeUtil, Component, Fragment, XMLPreprocessor, XMLTemplateProcessor, Device, FilterOperatorUtil, Filter, AnyElement, MetaModelFunction, FilterHelper) {
  "use strict";

  var _exports = {};
  var getConditions = FilterHelper.getConditions;
  var system = Device.system;
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var compileExpression = BindingToolkit.compileExpression;
  const ProgrammingModel = FELibrary.ProgrammingModel;
  function normalizeSearchTerm(sSearchTerm) {
    if (!sSearchTerm) {
      return undefined;
    }
    return sSearchTerm.replace(/"/g, " ").replace(/\\/g, "\\\\") //escape backslash characters. Can be removed if odata/binding handles backend errors responds.
    .split(/\s+/).reduce(function (sNormalized, sCurrentWord) {
      if (sCurrentWord !== "") {
        sNormalized = `${sNormalized ? `${sNormalized} ` : ""}"${sCurrentWord}"`;
      }
      return sNormalized;
    }, undefined);
  }
  async function waitForContextRequested(bindingContext) {
    var _dataModel$targetEnti;
    const model = bindingContext.getModel();
    const metaModel = model.getMetaModel();
    const entityPath = metaModel.getMetaPath(bindingContext.getPath());
    const dataModel = MetaModelConverter.getInvolvedDataModelObjects(metaModel.getContext(entityPath));
    await bindingContext.requestProperty((_dataModel$targetEnti = dataModel.targetEntityType.keys[0]) === null || _dataModel$targetEnti === void 0 ? void 0 : _dataModel$targetEnti.name);
  }
  function fnHasTransientContexts(oListBinding) {
    let bHasTransientContexts = false;
    if (oListBinding) {
      oListBinding.getCurrentContexts().forEach(function (oContext) {
        if (oContext && oContext.isTransient()) {
          bHasTransientContexts = true;
        }
      });
    }
    return bHasTransientContexts;
  }

  // there is no navigation in entitySet path and property path

  async function _getSOIntents(oShellServiceHelper, oObjectPageLayout, oSemanticObject, oParam) {
    return oShellServiceHelper.getLinks({
      semanticObject: oSemanticObject,
      params: oParam
    });
  }

  // TO-DO add this as part of applySemanticObjectmappings logic in IntentBasednavigation controller extension
  function _createMappings(oMapping) {
    const aSOMappings = [];
    const aMappingKeys = Object.keys(oMapping);
    let oSemanticMapping;
    for (let i = 0; i < aMappingKeys.length; i++) {
      oSemanticMapping = {
        LocalProperty: {
          $PropertyPath: aMappingKeys[i]
        },
        SemanticObjectProperty: oMapping[aMappingKeys[i]]
      };
      aSOMappings.push(oSemanticMapping);
    }
    return aSOMappings;
  }
  /**
   * @param aLinks
   * @param aExcludedActions
   * @param oTargetParams
   * @param aItems
   * @param aAllowedActions
   */
  function _getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aItems, aAllowedActions) {
    for (let i = 0; i < aLinks.length; i++) {
      const oLink = aLinks[i];
      const sIntent = oLink.intent;
      const sAction = sIntent.split("-")[1].split("?")[0];
      if (aAllowedActions && aAllowedActions.includes(sAction)) {
        aItems.push({
          text: oLink.text,
          targetSemObject: sIntent.split("#")[1].split("-")[0],
          targetAction: sAction.split("~")[0],
          targetParams: oTargetParams
        });
      } else if (!aAllowedActions && aExcludedActions && aExcludedActions.indexOf(sAction) === -1) {
        aItems.push({
          text: oLink.text,
          targetSemObject: sIntent.split("#")[1].split("-")[0],
          targetAction: sAction.split("~")[0],
          targetParams: oTargetParams
        });
      }
    }
  }
  function _getRelatedIntents(oAdditionalSemanticObjects, oBindingContext, aManifestSOItems, aLinks) {
    if (aLinks && aLinks.length > 0) {
      const aAllowedActions = oAdditionalSemanticObjects.allowedActions || undefined;
      const aExcludedActions = oAdditionalSemanticObjects.unavailableActions ? oAdditionalSemanticObjects.unavailableActions : [];
      const aSOMappings = oAdditionalSemanticObjects.mapping ? _createMappings(oAdditionalSemanticObjects.mapping) : [];
      const oTargetParams = {
        navigationContexts: oBindingContext,
        semanticObjectMapping: aSOMappings
      };
      _getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aManifestSOItems, aAllowedActions);
    }
  }

  /**
   * @description This function fetches the related intents when semantic object and action are passed from feEnvironment.getIntent() only in case of My Inbox integration
   * @param semanticObjectAndAction This specifies the semantic object and action for fetching the intents
   * @param oBindingContext This sepcifies the binding context for updating related apps
   * @param appComponentSOItems This is a list of semantic items used for updating the related apps button
   * @param aLinks This is an array comprising of related intents
   */

  function _getRelatedIntentsWithSemanticObjectsAndAction(semanticObjectAndAction, oBindingContext, appComponentSOItems, aLinks) {
    if (aLinks.length > 0) {
      const actions = [semanticObjectAndAction.action];
      const excludedActions = [];
      const soMappings = [];
      const targetParams = {
        navigationContexts: oBindingContext,
        semanticObjectMapping: soMappings
      };
      _getRelatedAppsMenuItems(aLinks, excludedActions, targetParams, appComponentSOItems, actions);
    }
  }
  async function updateRelateAppsModel(oBindingContext, oEntry, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath, appComponent) {
    const oShellServiceHelper = appComponent.getShellServices();
    const oParam = {};
    let sCurrentSemObj = "",
      sCurrentAction = "";
    let oSemanticObjectAnnotations;
    let aRelatedAppsMenuItems = [];
    let aExcludedActions = [];
    let aManifestSOKeys;
    async function fnGetParseShellHashAndGetLinks() {
      const oParsedUrl = oShellServiceHelper.parseShellHash(document.location.hash);
      sCurrentSemObj = oParsedUrl.semanticObject; // Current Semantic Object
      sCurrentAction = oParsedUrl.action;
      return _getSOIntents(oShellServiceHelper, oObjectPageLayout, sCurrentSemObj, oParam);
    }
    try {
      if (oEntry) {
        if (aSemKeys && aSemKeys.length > 0) {
          for (let j = 0; j < aSemKeys.length; j++) {
            const sSemKey = aSemKeys[j].$PropertyPath;
            if (!oParam[sSemKey]) {
              oParam[sSemKey] = {
                value: oEntry[sSemKey]
              };
            }
          }
        } else {
          // fallback to Technical Keys if no Semantic Key is present
          const aTechnicalKeys = oMetaModel.getObject(`${oMetaPath}/$Type/$Key`);
          for (const key in aTechnicalKeys) {
            const sObjKey = aTechnicalKeys[key];
            if (!oParam[sObjKey]) {
              oParam[sObjKey] = {
                value: oEntry[sObjKey]
              };
            }
          }
        }
      }
      // Logic to read additional SO from manifest and updated relatedapps model

      const oManifestData = getTargetView(oObjectPageLayout).getViewData();
      const aManifestSOItems = [];
      let semanticObjectIntents;
      if (oManifestData.additionalSemanticObjects) {
        aManifestSOKeys = Object.keys(oManifestData.additionalSemanticObjects);
        for (let key = 0; key < aManifestSOKeys.length; key++) {
          semanticObjectIntents = await Promise.resolve(_getSOIntents(oShellServiceHelper, oObjectPageLayout, aManifestSOKeys[key], oParam));
          _getRelatedIntents(oManifestData.additionalSemanticObjects[aManifestSOKeys[key]], oBindingContext, aManifestSOItems, semanticObjectIntents);
        }
      }

      // appComponentSOItems is updated in case of My Inbox integration when semantic object and action are passed from feEnvironment.getIntent() method
      // In other cases it remains as an empty list
      // We concat this list towards the end with aManifestSOItems

      const appComponentSOItems = [];
      const componentData = appComponent.getComponentData();
      if (componentData.feEnvironment && componentData.feEnvironment.getIntent()) {
        const intent = componentData.feEnvironment.getIntent();
        semanticObjectIntents = await Promise.resolve(_getSOIntents(oShellServiceHelper, oObjectPageLayout, intent.semanticObject, oParam));
        _getRelatedIntentsWithSemanticObjectsAndAction(intent, oBindingContext, appComponentSOItems, semanticObjectIntents);
      }
      const internalModelContext = oObjectPageLayout.getBindingContext("internal");
      const aLinks = await fnGetParseShellHashAndGetLinks();
      if (aLinks) {
        if (aLinks.length > 0) {
          let isSemanticObjectHasSameTargetInManifest = false;
          const oTargetParams = {};
          const aAnnotationsSOItems = [];
          const sEntitySetPath = `${oMetaPath}@`;
          const sEntityTypePath = `${oMetaPath}/@`;
          const oEntitySetAnnotations = oMetaModel.getObject(sEntitySetPath);
          oSemanticObjectAnnotations = CommonUtils.getSemanticObjectAnnotations(oEntitySetAnnotations, sCurrentSemObj);
          if (!oSemanticObjectAnnotations.bHasEntitySetSO) {
            const oEntityTypeAnnotations = oMetaModel.getObject(sEntityTypePath);
            oSemanticObjectAnnotations = CommonUtils.getSemanticObjectAnnotations(oEntityTypeAnnotations, sCurrentSemObj);
          }
          aExcludedActions = oSemanticObjectAnnotations.aUnavailableActions;
          //Skip same application from Related Apps
          aExcludedActions.push(sCurrentAction);
          oTargetParams.navigationContexts = oBindingContext;
          oTargetParams.semanticObjectMapping = oSemanticObjectAnnotations.aMappings;
          _getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aAnnotationsSOItems);
          aManifestSOItems.forEach(function (_ref) {
            var _aAnnotationsSOItems$;
            let {
              targetSemObject
            } = _ref;
            if (((_aAnnotationsSOItems$ = aAnnotationsSOItems[0]) === null || _aAnnotationsSOItems$ === void 0 ? void 0 : _aAnnotationsSOItems$.targetSemObject) === targetSemObject) {
              isSemanticObjectHasSameTargetInManifest = true;
            }
          });

          // remove all actions from current hash application if manifest contains empty allowedActions
          if (oManifestData.additionalSemanticObjects && aAnnotationsSOItems[0] && oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject] && !!oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject].allowedActions) {
            isSemanticObjectHasSameTargetInManifest = true;
          }
          const soItems = aManifestSOItems.concat(appComponentSOItems);
          aRelatedAppsMenuItems = isSemanticObjectHasSameTargetInManifest ? soItems : soItems.concat(aAnnotationsSOItems);
          // If no app in list, related apps button will be hidden
          internalModelContext.setProperty("relatedApps/visibility", aRelatedAppsMenuItems.length > 0);
          internalModelContext.setProperty("relatedApps/items", aRelatedAppsMenuItems);
        } else {
          internalModelContext.setProperty("relatedApps/visibility", false);
        }
      } else {
        internalModelContext.setProperty("relatedApps/visibility", false);
      }
    } catch (error) {
      Log.error("Cannot read links", error);
    }
    return aRelatedAppsMenuItems;
  }
  function _getSemanticObjectAnnotations(oEntityAnnotations, sCurrentSemObj) {
    const oSemanticObjectAnnotations = {
      bHasEntitySetSO: false,
      aAllowedActions: [],
      aUnavailableActions: [],
      aMappings: []
    };
    let sAnnotationMappingTerm, sAnnotationActionTerm;
    let sQualifier;
    for (const key in oEntityAnnotations) {
      if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject") > -1 && oEntityAnnotations[key] === sCurrentSemObj) {
        oSemanticObjectAnnotations.bHasEntitySetSO = true;
        sAnnotationMappingTerm = `@${"com.sap.vocabularies.Common.v1.SemanticObjectMapping"}`;
        sAnnotationActionTerm = `@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}`;
        if (key.indexOf("#") > -1) {
          sQualifier = key.split("#")[1];
          sAnnotationMappingTerm = `${sAnnotationMappingTerm}#${sQualifier}`;
          sAnnotationActionTerm = `${sAnnotationActionTerm}#${sQualifier}`;
        }
        if (oEntityAnnotations[sAnnotationMappingTerm]) {
          oSemanticObjectAnnotations.aMappings = oSemanticObjectAnnotations.aMappings.concat(oEntityAnnotations[sAnnotationMappingTerm]);
        }
        if (oEntityAnnotations[sAnnotationActionTerm]) {
          oSemanticObjectAnnotations.aUnavailableActions = oSemanticObjectAnnotations.aUnavailableActions.concat(oEntityAnnotations[sAnnotationActionTerm]);
        }
        break;
      }
    }
    return oSemanticObjectAnnotations;
  }
  function fnUpdateRelatedAppsDetails(oObjectPageLayout, appComponent) {
    const oMetaModel = oObjectPageLayout.getModel().getMetaModel();
    const oBindingContext = oObjectPageLayout.getBindingContext();
    const path = oBindingContext && oBindingContext.getPath() || "";
    const oMetaPath = oMetaModel.getMetaPath(path);
    // Semantic Key Vocabulary
    const sSemanticKeyVocabulary = `${oMetaPath}/` + `@com.sap.vocabularies.Common.v1.SemanticKey`;
    //Semantic Keys
    const aSemKeys = oMetaModel.getObject(sSemanticKeyVocabulary);
    // Unavailable Actions
    const oEntry = oBindingContext === null || oBindingContext === void 0 ? void 0 : oBindingContext.getObject();
    if (!oEntry && oBindingContext) {
      oBindingContext.requestObject().then(async function (requestedObject) {
        return CommonUtils.updateRelateAppsModel(oBindingContext, requestedObject, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath, appComponent);
      }).catch(function (oError) {
        Log.error("Cannot update the related app details", oError);
      });
    } else {
      return CommonUtils.updateRelateAppsModel(oBindingContext, oEntry, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath, appComponent);
    }
  }

  /**
   * @param oButton
   */
  function fnFireButtonPress(oButton) {
    if (oButton && oButton.isA(["sap.m.Button", "sap.m.OverflowToolbarButton"]) && oButton.getVisible() && oButton.getEnabled()) {
      oButton.firePress();
    }
  }
  function getAppComponent(oControl) {
    if (oControl.isA("sap.fe.core.AppComponent")) {
      return oControl;
    }
    const oOwner = Component.getOwnerComponentFor(oControl);
    if (!oOwner) {
      throw new Error("There should be a sap.fe.core.AppComponent as owner of the control");
    } else {
      return getAppComponent(oOwner);
    }
  }
  function getCurrentPageView(oAppComponent) {
    const rootViewController = oAppComponent.getRootViewController();
    return rootViewController.isFclEnabled() ? rootViewController.getRightmostView() : CommonUtils.getTargetView(oAppComponent.getRootContainer().getCurrentPage());
  }
  function getTargetView(oControl) {
    if (oControl && oControl.isA("sap.ui.core.ComponentContainer")) {
      const oComponent = oControl.getComponentInstance();
      oControl = oComponent && oComponent.getRootControl();
    }
    while (oControl && !oControl.isA("sap.ui.core.mvc.View")) {
      oControl = oControl.getParent();
    }
    return oControl;
  }
  function _fnCheckIsMatch(oObject, oKeysToCheck) {
    for (const sKey in oKeysToCheck) {
      if (oKeysToCheck[sKey] !== oObject[sKey]) {
        return false;
      }
    }
    return true;
  }
  function fnGetContextPathProperties(metaModelContext, sContextPath, oFilter) {
    const oEntityType = metaModelContext.getObject(`${sContextPath}/`) || {},
      oProperties = {};
    for (const sKey in oEntityType) {
      if (oEntityType.hasOwnProperty(sKey) && !/^\$/i.test(sKey) && oEntityType[sKey].$kind && _fnCheckIsMatch(oEntityType[sKey], oFilter || {
        $kind: "Property"
      })) {
        oProperties[sKey] = oEntityType[sKey];
      }
    }
    return oProperties;
  }
  function fnGetMandatoryFilterFields(oMetaModel, sContextPath) {
    let aMandatoryFilterFields = [];
    if (oMetaModel && sContextPath) {
      aMandatoryFilterFields = oMetaModel.getObject(`${sContextPath}@Org.OData.Capabilities.V1.FilterRestrictions/RequiredProperties`);
    }
    return aMandatoryFilterFields;
  }
  function fnGetIBNActions(oControl, aIBNActions) {
    const aActions = oControl && oControl.getActions();
    if (aActions) {
      aActions.forEach(function (oAction) {
        if (oAction.isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction")) {
          oAction = oAction.getAction();
        }
        if (oAction.isA("sap.m.MenuButton")) {
          const oMenu = oAction.getMenu();
          const aItems = oMenu.getItems();
          aItems.forEach(oItem => {
            if (oItem.data("IBNData")) {
              aIBNActions.push(oItem);
            }
          });
        } else if (oAction.data("IBNData")) {
          aIBNActions.push(oAction);
        }
      });
    }
    return aIBNActions;
  }

  /**
   * @param aIBNActions
   * @param oView
   */
  function fnUpdateDataFieldForIBNButtonsVisibility(aIBNActions, oView) {
    const oParams = {};
    const oAppComponent = CommonUtils.getAppComponent(oView);
    const isSticky = ModelHelper.isStickySessionSupported(oView.getModel().getMetaModel());
    const fnGetLinks = function (oData) {
      if (oData) {
        const aKeys = Object.keys(oData);
        aKeys.forEach(function (sKey) {
          if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
            oParams[sKey] = {
              value: oData[sKey]
            };
          }
        });
      }
      if (aIBNActions.length) {
        aIBNActions.forEach(function (oIBNAction) {
          const sSemanticObject = oIBNAction.data("IBNData").semanticObject;
          const sAction = oIBNAction.data("IBNData").action;
          oAppComponent.getShellServices().getLinks({
            semanticObject: sSemanticObject,
            action: sAction,
            params: oParams
          }).then(function (aLink) {
            oIBNAction.setVisible(oIBNAction.getVisible() && aLink && aLink.length === 1);
            if (isSticky) {
              oIBNAction.getBindingContext("internal").setProperty(oIBNAction.getId().split("--")[1], {
                shellNavigationNotAvailable: !(aLink && aLink.length === 1)
              });
            }
            return;
          }).catch(function (oError) {
            Log.error("Cannot retrieve the links from the shell service", oError);
          });
        });
      }
    };
    if (oView && oView.getBindingContext()) {
      var _oView$getBindingCont;
      (_oView$getBindingCont = oView.getBindingContext()) === null || _oView$getBindingCont === void 0 ? void 0 : _oView$getBindingCont.requestObject().then(function (oData) {
        return fnGetLinks(oData);
      }).catch(function (oError) {
        Log.error("Cannot retrieve the links from the shell service", oError);
      });
    } else {
      fnGetLinks();
    }
  }
  function getActionPath(actionContext, bReturnOnlyPath, inActionName, bCheckStaticValue) {
    const sActionName = !inActionName ? actionContext.getObject(actionContext.getPath()).toString() : inActionName;
    let sContextPath = actionContext.getPath().split("/@")[0];
    const sEntityTypeName = actionContext.getObject(sContextPath).$Type;
    const sEntityName = getEntitySetName(actionContext.getModel(), sEntityTypeName);
    if (sEntityName) {
      sContextPath = `/${sEntityName}`;
    }
    if (bCheckStaticValue) {
      return actionContext.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable`);
    }
    if (bReturnOnlyPath) {
      return `${sContextPath}/${sActionName}`;
    } else {
      return {
        sContextPath: sContextPath,
        sProperty: actionContext.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable/$Path`),
        sBindingParameter: actionContext.getObject(`${sContextPath}/${sActionName}/@$ui5.overload/0/$Parameter/0/$Name`)
      };
    }
  }
  function getEntitySetName(oMetaModel, sEntityType) {
    const oEntityContainer = oMetaModel.getObject("/");
    for (const key in oEntityContainer) {
      if (typeof oEntityContainer[key] === "object" && oEntityContainer[key].$Type === sEntityType) {
        return key;
      }
    }
  }
  function computeDisplayMode(oPropertyAnnotations, oCollectionAnnotations) {
    const oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"],
      oTextArrangementAnnotation = oTextAnnotation && (oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"] || oCollectionAnnotations && oCollectionAnnotations["@com.sap.vocabularies.UI.v1.TextArrangement"]);
    if (oTextArrangementAnnotation) {
      if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
        return "Description";
      } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
        return "ValueDescription";
      } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate") {
        return "Value";
      }
      //Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
      return "DescriptionValue";
    }
    return oTextAnnotation ? "DescriptionValue" : "Value";
  }
  function _getEntityType(oContext) {
    const oMetaModel = oContext.getModel().getMetaModel();
    return oMetaModel.getObject(`${oMetaModel.getMetaPath(oContext.getPath())}/$Type`);
  }
  async function _requestObject(sAction, oSelectedContext, sProperty) {
    let oContext = oSelectedContext;
    const nBracketIndex = sAction.indexOf("(");
    if (nBracketIndex > -1) {
      const sTargetType = sAction.slice(nBracketIndex + 1, -1);
      let sCurrentType = _getEntityType(oContext);
      while (sCurrentType !== sTargetType) {
        // Find parent binding context and retrieve entity type
        oContext = oContext.getBinding().getContext();
        if (oContext) {
          sCurrentType = _getEntityType(oContext);
        } else {
          Log.warning("Cannot determine target type to request property value for bound action invocation");
          return Promise.resolve(undefined);
        }
      }
    }
    return oContext.requestObject(sProperty);
  }
  async function requestProperty(oSelectedContext, sAction, sProperty, sDynamicActionEnabledPath) {
    const oPromise = sProperty && sProperty.indexOf("/") === 0 ? requestSingletonProperty(sProperty, oSelectedContext.getModel()) : _requestObject(sAction, oSelectedContext, sProperty);
    return oPromise.then(function (vPropertyValue) {
      return {
        vPropertyValue: vPropertyValue,
        oSelectedContext: oSelectedContext,
        sAction: sAction,
        sDynamicActionEnabledPath: sDynamicActionEnabledPath
      };
    });
  }
  async function setContextsBasedOnOperationAvailable(oInternalModelContext, aRequestPromises) {
    return Promise.all(aRequestPromises).then(function (aResults) {
      if (aResults.length) {
        const aApplicableContexts = [],
          aNotApplicableContexts = [];
        aResults.forEach(function (aResult) {
          if (aResult) {
            if (aResult.vPropertyValue) {
              oInternalModelContext.getModel().setProperty(aResult.sDynamicActionEnabledPath, true);
              aApplicableContexts.push(aResult.oSelectedContext);
            } else {
              aNotApplicableContexts.push(aResult.oSelectedContext);
            }
          }
        });
        setDynamicActionContexts(oInternalModelContext, aResults[0].sAction, aApplicableContexts, aNotApplicableContexts);
      }
      return;
    }).catch(function (oError) {
      Log.trace("Cannot retrieve property value from path", oError);
    });
  }

  /**
   * @param oInternalModelContext
   * @param sAction
   * @param aApplicable
   * @param aNotApplicable
   */
  function setDynamicActionContexts(oInternalModelContext, sAction, aApplicable, aNotApplicable) {
    const sDynamicActionPathPrefix = `${oInternalModelContext.getPath()}/dynamicActions/${sAction}`,
      oInternalModel = oInternalModelContext.getModel();
    oInternalModel.setProperty(`${sDynamicActionPathPrefix}/aApplicable`, aApplicable);
    oInternalModel.setProperty(`${sDynamicActionPathPrefix}/aNotApplicable`, aNotApplicable);
  }
  function _getDefaultOperators(sPropertyType) {
    // mdc defines the full set of operations that are meaningful for each Edm Type
    // TODO Replace with model / internal way of retrieving the actual model type used for the property
    const oDataClass = TypeUtil.getDataTypeClassName(sPropertyType);
    // TODO need to pass proper formatOptions, constraints here
    const oBaseType = TypeUtil.getBaseType(oDataClass, {}, {});
    return FilterOperatorUtil.getOperatorsForType(oBaseType);
  }
  function _getRestrictions(aDefaultOps, aExpressionOps) {
    // From the default set of Operators for the Base Type, select those that are defined in the Allowed Value.
    // In case that no operators are found, return undefined so that the default set is used.
    return aDefaultOps.filter(function (sElement) {
      return aExpressionOps.indexOf(sElement) > -1;
    });
  }
  function getSpecificAllowedExpression(aExpressions) {
    const aAllowedExpressionsPriority = CommonUtils.AllowedExpressionsPrio;
    aExpressions.sort(function (a, b) {
      return aAllowedExpressionsPriority.indexOf(a) - aAllowedExpressionsPriority.indexOf(b);
    });
    return aExpressions[0];
  }

  /**
   * Method to fetch the correct operators based on the filter restrictions that can be annotated on an entity set or a navigation property.
   * We return the correct operators based on the specified restriction and also check for the operators defined in the manifest to include or exclude them.
   *
   * @param sProperty String name of the property
   * @param sEntitySetPath String path to the entity set
   * @param oContext Context used during templating
   * @param sType String data type od the property, for example edm.Date
   * @param bUseSemanticDateRange Boolean passed from the manifest for semantic date range
   * @param sSettings Stringified object of the property settings
   * @returns An array of strings representing operators for filtering
   */
  function getOperatorsForProperty(sProperty, sEntitySetPath, oContext, sType, bUseSemanticDateRange, sSettings) {
    const oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oContext);
    const aEqualsOps = ["EQ"];
    const aSingleRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
    const aSingleRangeDTBasicOps = ["EQ", "BT"];
    const aSingleValueDateOps = ["TODAY", "TOMORROW", "YESTERDAY", "DATE", "FIRSTDAYWEEK", "LASTDAYWEEK", "FIRSTDAYMONTH", "LASTDAYMONTH", "FIRSTDAYQUARTER", "LASTDAYQUARTER", "FIRSTDAYYEAR", "LASTDAYYEAR"];
    const aMultiRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
    const aSearchExpressionOps = ["Contains", "NotContains", "StartsWith", "NotStartsWith", "EndsWith", "NotEndsWith"];
    const aSemanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
    const bSemanticDateRange = bUseSemanticDateRange === "true" || bUseSemanticDateRange === true;
    let aSemanticDateOps = [];
    const oSettings = sSettings && typeof sSettings === "string" ? JSON.parse(sSettings).customData : sSettings;
    if (oContext.getObject(`${sEntitySetPath}/@com.sap.vocabularies.Common.v1.ResultContext`) === true) {
      return aEqualsOps;
    }
    if (oSettings && oSettings.operatorConfiguration && oSettings.operatorConfiguration.length > 0) {
      aSemanticDateOps = SemanticDateOperators.getFilterOperations(oSettings.operatorConfiguration, sType);
    } else {
      aSemanticDateOps = SemanticDateOperators.getSemanticDateOperations(sType);
    }
    // Get the default Operators for this Property Type
    let aDefaultOperators = _getDefaultOperators(sType);
    if (bSemanticDateRange) {
      aDefaultOperators = aSemanticDateOpsExt.concat(aDefaultOperators);
    }
    let restrictions = [];

    // Is there a Filter Restriction defined for this property?
    if (oFilterRestrictions && oFilterRestrictions.FilterAllowedExpressions && oFilterRestrictions.FilterAllowedExpressions[sProperty]) {
      // Extending the default operators list with Semantic Date options DATERANGE, DATE, FROM and TO
      const sAllowedExpression = CommonUtils.getSpecificAllowedExpression(oFilterRestrictions.FilterAllowedExpressions[sProperty]);
      // In case more than one Allowed Expressions has been defined for a property
      // choose the most restrictive Allowed Expression

      // MultiValue has same Operator as SingleValue, but there can be more than one (maxConditions)
      switch (sAllowedExpression) {
        case "SingleValue":
          const aSingleValueOps = sType === "Edm.Date" && bSemanticDateRange ? aSingleValueDateOps : aEqualsOps;
          restrictions = _getRestrictions(aDefaultOperators, aSingleValueOps);
          break;
        case "MultiValue":
          restrictions = _getRestrictions(aDefaultOperators, aEqualsOps);
          break;
        case "SingleRange":
          let aExpressionOps;
          if (bSemanticDateRange) {
            if (sType === "Edm.Date") {
              aExpressionOps = aSemanticDateOps;
            } else if (sType === "Edm.DateTimeOffset") {
              aExpressionOps = aSemanticDateOps;
            } else {
              aExpressionOps = aSingleRangeOps;
            }
          } else if (sType === "Edm.DateTimeOffset") {
            aExpressionOps = aSingleRangeDTBasicOps;
          } else {
            aExpressionOps = aSingleRangeOps;
          }
          const sOperators = _getRestrictions(aDefaultOperators, aExpressionOps);
          restrictions = sOperators;
          break;
        case "MultiRange":
          restrictions = _getRestrictions(aDefaultOperators, aMultiRangeOps);
          break;
        case "SearchExpression":
          restrictions = _getRestrictions(aDefaultOperators, aSearchExpressionOps);
          break;
        case "MultiRangeOrSearchExpression":
          restrictions = _getRestrictions(aDefaultOperators, aSearchExpressionOps.concat(aMultiRangeOps));
          break;
        default:
          break;
      }
      // In case AllowedExpressions is not recognised, undefined in return results in the default set of
      // operators for the type.
    }

    return restrictions;
  }

  /**
   * Method to return allowed operators for type Guid.
   *
   * @function
   * @name getOperatorsForGuidProperty
   * @returns Allowed operators for type Guid
   */
  _exports.getOperatorsForProperty = getOperatorsForProperty;
  function getOperatorsForGuidProperty() {
    const allowedOperatorsForGuid = ["EQ", "NE"];
    return allowedOperatorsForGuid.toString();
  }
  function getOperatorsForDateProperty(propertyType) {
    // In case AllowedExpressions is not provided for type Edm.Date then all the default
    // operators for the type should be returned excluding semantic operators from the list.
    const aDefaultOperators = _getDefaultOperators(propertyType);
    const aMultiRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
    return _getRestrictions(aDefaultOperators, aMultiRangeOps);
  }
  function getParameterInfo(metaModelContext, sContextPath) {
    const sParameterContextPath = sContextPath.substring(0, sContextPath.lastIndexOf("/"));
    const bResultContext = metaModelContext.getObject(`${sParameterContextPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
    const oParameterInfo = {};
    if (bResultContext && sParameterContextPath !== sContextPath) {
      oParameterInfo.contextPath = sParameterContextPath;
      oParameterInfo.parameterProperties = CommonUtils.getContextPathProperties(metaModelContext, sParameterContextPath);
    }
    return oParameterInfo;
  }

  /**
   * Method to add the select Options to filter conditions.
   *
   * @function
   * @name addSelectOptionToConditions
   * @param oPropertyMetadata Property metadata information
   * @param aValidOperators Operators for all the data types
   * @param aSemanticDateOperators Operators for the Date type
   * @param aCumulativeConditions Filter conditions
   * @param oSelectOption Selectoption of selection variant
   * @returns The filter conditions
   */
  function addSelectOptionToConditions(oPropertyMetadata, aValidOperators, aSemanticDateOperators, aCumulativeConditions, oSelectOption) {
    var _oSelectOption$Semant;
    const oCondition = getConditions(oSelectOption, oPropertyMetadata);
    if (oSelectOption !== null && oSelectOption !== void 0 && oSelectOption.SemanticDates && aSemanticDateOperators && aSemanticDateOperators.indexOf(oSelectOption === null || oSelectOption === void 0 ? void 0 : (_oSelectOption$Semant = oSelectOption.SemanticDates) === null || _oSelectOption$Semant === void 0 ? void 0 : _oSelectOption$Semant.operator) > -1) {
      const semanticDates = CommonUtils.addSemanticDatesToConditions(oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.SemanticDates);
      if (semanticDates && Object.keys(semanticDates).length > 0) {
        aCumulativeConditions.push(semanticDates);
      }
    } else if (oCondition) {
      if (aValidOperators.length === 0 || aValidOperators.indexOf(oCondition.operator) > -1) {
        aCumulativeConditions.push(oCondition);
      }
    }
    return aCumulativeConditions;
  }

  /**
   * Method to add the semantic dates to filter conditions
   *
   * @function
   * @name addSemanticDatesToConditions
   * @param oSemanticDates Semantic date infomation
   * @returns The filter conditions containing semantic dates
   */

  function addSemanticDatesToConditions(oSemanticDates) {
    const values = [];
    if (oSemanticDates !== null && oSemanticDates !== void 0 && oSemanticDates.high) {
      values.push(oSemanticDates === null || oSemanticDates === void 0 ? void 0 : oSemanticDates.high);
    }
    if (oSemanticDates !== null && oSemanticDates !== void 0 && oSemanticDates.low) {
      values.push(oSemanticDates === null || oSemanticDates === void 0 ? void 0 : oSemanticDates.low);
    }
    return {
      values: values,
      operator: oSemanticDates === null || oSemanticDates === void 0 ? void 0 : oSemanticDates.operator,
      isEmpty: undefined
    };
  }
  function addPageContextToSelectionVariant(oSelectionVariant, mPageContext, oView) {
    const oAppComponent = CommonUtils.getAppComponent(oView);
    const oNavigationService = oAppComponent.getNavigationService();
    return oNavigationService.mixAttributesAndSelectionVariant(mPageContext, oSelectionVariant.toJSONString());
  }

  /**
   * Get selection variant based on the filter conditions and the navigation context fields.
   *
   * @param selectionVariant SelectionVariant provided by SAP Fiori elements.
   * @param filters Retrieved filter condition for filter bar and non conflicting properties
   * @param targetInfo Object containing intent-based navigation-related info
   * @param filterBar The filterbar control
   * @returns The selection variant
   */

  function addExternalStateFiltersToSelectionVariant(inputSelectionVariant, filters, filterBar, targetInfo) {
    const filterConditions = filters.filterConditions;
    const filtersWithoutConflict = filters.filterConditionsWithoutConflict ? filters.filterConditionsWithoutConflict : {};
    const tablePropertiesWithoutConflict = targetInfo !== null && targetInfo !== void 0 && targetInfo.propertiesWithoutConflict ? targetInfo.propertiesWithoutConflict : {};
    const selectionVariantFromFilterbar = StateFilterToSelectionVariant.getSelectionVariantFromConditions(filterConditions, filterBar.getPropertyHelper());
    for (const filterkey in filterConditions) {
      // only add the filter values if it is not already present in the SV already
      const filterSelectOption = selectionVariantFromFilterbar.getSelectOption(filterkey);
      if (!inputSelectionVariant.getSelectOption(filterkey)) {
        // TODO : custom filters should be ignored more generically
        if (filterkey === "$editState") {
          continue;
        }
        if (filterSelectOption) {
          inputSelectionVariant.massAddSelectOption(filterkey, filterSelectOption);
        }
      } else {
        if (tablePropertiesWithoutConflict && filterkey in tablePropertiesWithoutConflict) {
          inputSelectionVariant.massAddSelectOption(tablePropertiesWithoutConflict[filterkey], filterSelectOption);
        }
        // if property was without conflict in page context then add path from page context to SV
        if (filterkey in filtersWithoutConflict) {
          inputSelectionVariant.massAddSelectOption(filtersWithoutConflict[filterkey], filterSelectOption);
        }
      }
    }
    return inputSelectionVariant;
  }
  function isStickyEditMode(oControl) {
    const bIsStickyMode = ModelHelper.isStickySessionSupported(oControl.getModel().getMetaModel());
    const bUIEditable = oControl.getModel("ui").getProperty("/isEditable");
    return bIsStickyMode && bUIEditable;
  }

  /**
   * @param aMandatoryFilterFields
   * @param oSelectionVariant
   * @param oSelectionVariantDefaults
   */
  function addDefaultDisplayCurrency(aMandatoryFilterFields, oSelectionVariant, oSelectionVariantDefaults) {
    if (oSelectionVariant && aMandatoryFilterFields && aMandatoryFilterFields.length) {
      for (let i = 0; i < aMandatoryFilterFields.length; i++) {
        const aSVOption = oSelectionVariant.getSelectOption("DisplayCurrency"),
          aDefaultSVOption = oSelectionVariantDefaults && oSelectionVariantDefaults.getSelectOption("DisplayCurrency");
        if (aMandatoryFilterFields[i].$PropertyPath === "DisplayCurrency" && (!aSVOption || !aSVOption.length) && aDefaultSVOption && aDefaultSVOption.length) {
          const displayCurrencySelectOption = aDefaultSVOption[0];
          const sSign = displayCurrencySelectOption["Sign"];
          const sOption = displayCurrencySelectOption["Option"];
          const sLow = displayCurrencySelectOption["Low"];
          const sHigh = displayCurrencySelectOption["High"];
          oSelectionVariant.addSelectOption("DisplayCurrency", sSign, sOption, sLow, sHigh);
        }
      }
    }
  }
  /**
   * Retrieves the user defaults from the startup app state (if available) or the startup parameter and sets them to a model.
   *
   * @param oAppComponent
   * @param aParameters
   * @param oModel
   * @param bIsAction
   * @param bIsCreate
   * @param oActionDefaultValues
   */
  async function setUserDefaults(oAppComponent, aParameters, oModel, bIsAction, bIsCreate, oActionDefaultValues) {
    const oComponentData = oAppComponent.getComponentData(),
      oStartupParameters = oComponentData && oComponentData.startupParameters || {},
      oShellServices = oAppComponent.getShellServices();
    const oStartupAppState = await oShellServices.getStartupAppState(oAppComponent);
    const oData = (oStartupAppState === null || oStartupAppState === void 0 ? void 0 : oStartupAppState.getData()) || {},
      aExtendedParameters = oData.selectionVariant && oData.selectionVariant.SelectOptions || [];
    aParameters.forEach(function (oParameter) {
      var _oParameter$getPath;
      const sPropertyName = bIsAction ? `/${oParameter.$Name}` : (_oParameter$getPath = oParameter.getPath) === null || _oParameter$getPath === void 0 ? void 0 : _oParameter$getPath.call(oParameter).slice(oParameter.getPath().lastIndexOf("/") + 1);
      const sParameterName = bIsAction ? sPropertyName.slice(1) : sPropertyName;
      if (oActionDefaultValues && bIsCreate) {
        if (oActionDefaultValues[sParameterName]) {
          oModel.setProperty(sPropertyName, oActionDefaultValues[sParameterName]);
        }
      } else if (oStartupParameters[sParameterName]) {
        oModel.setProperty(sPropertyName, oStartupParameters[sParameterName][0]);
      } else if (aExtendedParameters.length > 0) {
        for (const oExtendedParameter of aExtendedParameters) {
          if (oExtendedParameter.PropertyName === sParameterName) {
            const oRange = oExtendedParameter.Ranges.length ? oExtendedParameter.Ranges[oExtendedParameter.Ranges.length - 1] : undefined;
            if (oRange && oRange.Sign === "I" && oRange.Option === "EQ") {
              oModel.setProperty(sPropertyName, oRange.Low); // high is ignored when Option=EQ
            }
          }
        }
      }
    });
  }

  function getAdditionalParamsForCreate(oStartupParameters, oInboundParameters) {
    const oInbounds = oInboundParameters,
      aCreateParameters = oInbounds !== undefined ? Object.keys(oInbounds).filter(function (sParameter) {
        return oInbounds[sParameter].useForCreate;
      }) : [];
    let oRet;
    for (let i = 0; i < aCreateParameters.length; i++) {
      const sCreateParameter = aCreateParameters[i];
      const aValues = oStartupParameters && oStartupParameters[sCreateParameter];
      if (aValues && aValues.length === 1) {
        oRet = oRet || Object.create(null);
        oRet[sCreateParameter] = aValues[0];
      }
    }
    return oRet;
  }
  function getSemanticObjectMapping(oOutbound) {
    const aSemanticObjectMapping = [];
    if (oOutbound.parameters) {
      const aParameters = Object.keys(oOutbound.parameters) || [];
      if (aParameters.length > 0) {
        aParameters.forEach(function (sParam) {
          const oMapping = oOutbound.parameters[sParam];
          if (oMapping.value && oMapping.value.value && oMapping.value.format === "binding") {
            // using the format of UI.Mapping
            const oSemanticMapping = {
              LocalProperty: {
                $PropertyPath: oMapping.value.value
              },
              SemanticObjectProperty: sParam
            };
            if (aSemanticObjectMapping.length > 0) {
              // To check if the semanticObject Mapping is done for the same local property more that once then first one will be considered
              for (let i = 0; i < aSemanticObjectMapping.length; i++) {
                var _aSemanticObjectMappi;
                if (((_aSemanticObjectMappi = aSemanticObjectMapping[i].LocalProperty) === null || _aSemanticObjectMappi === void 0 ? void 0 : _aSemanticObjectMappi.$PropertyPath) !== oSemanticMapping.LocalProperty.$PropertyPath) {
                  aSemanticObjectMapping.push(oSemanticMapping);
                }
              }
            } else {
              aSemanticObjectMapping.push(oSemanticMapping);
            }
          }
        });
      }
    }
    return aSemanticObjectMapping;
  }
  function getHeaderFacetItemConfigForExternalNavigation(oViewData, oCrossNav) {
    const oHeaderFacetItems = {};
    let sId;
    const oControlConfig = oViewData.controlConfiguration;
    for (const config in oControlConfig) {
      if (config.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 || config.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
        var _oControlConfig$confi, _oControlConfig$confi2;
        const sOutbound = (_oControlConfig$confi = oControlConfig[config].navigation) === null || _oControlConfig$confi === void 0 ? void 0 : (_oControlConfig$confi2 = _oControlConfig$confi.targetOutbound) === null || _oControlConfig$confi2 === void 0 ? void 0 : _oControlConfig$confi2.outbound;
        if (sOutbound !== undefined) {
          const oOutbound = oCrossNav[sOutbound];
          if (oOutbound.semanticObject && oOutbound.action) {
            if (config.indexOf("Chart") > -1) {
              sId = generate(["fe", "MicroChartLink", config]);
            } else {
              sId = generate(["fe", "HeaderDPLink", config]);
            }
            const aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oOutbound);
            oHeaderFacetItems[sId] = {
              semanticObject: oOutbound.semanticObject,
              action: oOutbound.action,
              semanticObjectMapping: aSemanticObjectMapping
            };
          } else {
            Log.error(`Cross navigation outbound is configured without semantic object and action for ${sOutbound}`);
          }
        }
      }
    }
    return oHeaderFacetItems;
  }
  function setSemanticObjectMappings(oSelectionVariant, vMappings) {
    const oMappings = typeof vMappings === "string" ? JSON.parse(vMappings) : vMappings;
    for (let i = 0; i < oMappings.length; i++) {
      const sLocalProperty = oMappings[i]["LocalProperty"] && oMappings[i]["LocalProperty"]["$PropertyPath"] || oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"] && oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"]["$Path"];
      const sSemanticObjectProperty = oMappings[i]["SemanticObjectProperty"] || oMappings[i]["@com.sap.vocabularies.Common.v1.SemanticObjectProperty"];
      const oSelectOption = oSelectionVariant.getSelectOption(sLocalProperty);
      if (oSelectOption) {
        //Create a new SelectOption with sSemanticObjectProperty as the property Name and remove the older one
        oSelectionVariant.removeSelectOption(sLocalProperty);
        oSelectionVariant.massAddSelectOption(sSemanticObjectProperty, oSelectOption);
      }
    }
    return oSelectionVariant;
  }
  async function fnGetSemanticObjectsFromPath(oMetaModel, sPath, sQualifier) {
    return new Promise(function (resolve) {
      let sSemanticObject, aSemanticObjectUnavailableActions;
      if (sQualifier === "") {
        sSemanticObject = oMetaModel.getObject(`${sPath}@${"com.sap.vocabularies.Common.v1.SemanticObject"}`);
        aSemanticObjectUnavailableActions = oMetaModel.getObject(`${sPath}@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}`);
      } else {
        sSemanticObject = oMetaModel.getObject(`${sPath}@${"com.sap.vocabularies.Common.v1.SemanticObject"}#${sQualifier}`);
        aSemanticObjectUnavailableActions = oMetaModel.getObject(`${sPath}@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}#${sQualifier}`);
      }
      const aSemanticObjectForGetLinks = [{
        semanticObject: sSemanticObject
      }];
      const oSemanticObject = {
        semanticObject: sSemanticObject
      };
      resolve({
        semanticObjectPath: sPath,
        semanticObjectForGetLinks: aSemanticObjectForGetLinks,
        semanticObject: oSemanticObject,
        unavailableActions: aSemanticObjectUnavailableActions
      });
    });
  }
  async function fnUpdateSemanticTargetsModel(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash) {
    return Promise.all(aGetLinksPromises).then(function (aValues) {
      let aLinks,
        _oLink,
        _sLinkIntentAction,
        aFinalLinks = [];
      let oFinalSemanticObjects = {};
      const bIntentHasActions = function (sIntent, aActions) {
        for (const intent in aActions) {
          if (intent === sIntent) {
            return true;
          } else {
            return false;
          }
        }
      };
      for (let k = 0; k < aValues.length; k++) {
        aLinks = aValues[k];
        if (aLinks && aLinks.length > 0 && aLinks[0] !== undefined) {
          const oSemanticObject = {};
          let oTmp;
          let sAlternatePath;
          for (let i = 0; i < aLinks.length; i++) {
            aFinalLinks.push([]);
            let hasTargetsNotFiltered = false;
            let hasTargets = false;
            for (let iLinkCount = 0; iLinkCount < aLinks[i][0].length; iLinkCount++) {
              _oLink = aLinks[i][0][iLinkCount];
              _sLinkIntentAction = _oLink && _oLink.intent.split("?")[0].split("-")[1];
              if (!(_oLink && _oLink.intent && _oLink.intent.indexOf(sCurrentHash) === 0)) {
                hasTargetsNotFiltered = true;
                if (!bIntentHasActions(_sLinkIntentAction, aSemanticObjects[k].unavailableActions)) {
                  aFinalLinks[i].push(_oLink);
                  hasTargets = true;
                }
              }
            }
            oTmp = {
              semanticObject: aSemanticObjects[k].semanticObject,
              path: aSemanticObjects[k].path,
              HasTargets: hasTargets,
              HasTargetsNotFiltered: hasTargetsNotFiltered
            };
            if (oSemanticObject[aSemanticObjects[k].semanticObject] === undefined) {
              oSemanticObject[aSemanticObjects[k].semanticObject] = {};
            }
            sAlternatePath = aSemanticObjects[k].path.replace(/\//g, "_");
            if (oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] === undefined) {
              oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] = {};
            }
            oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] = Object.assign(oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath], oTmp);
          }
          const sSemanticObjectName = Object.keys(oSemanticObject)[0];
          if (Object.keys(oFinalSemanticObjects).includes(sSemanticObjectName)) {
            oFinalSemanticObjects[sSemanticObjectName] = Object.assign(oFinalSemanticObjects[sSemanticObjectName], oSemanticObject[sSemanticObjectName]);
          } else {
            oFinalSemanticObjects = Object.assign(oFinalSemanticObjects, oSemanticObject);
          }
          aFinalLinks = [];
        }
      }
      if (Object.keys(oFinalSemanticObjects).length > 0) {
        oInternalModelContext.setProperty("semanticsTargets", mergeObjects(oFinalSemanticObjects, oInternalModelContext.getProperty("semanticsTargets")));
        return oFinalSemanticObjects;
      }
      return;
    }).catch(function (oError) {
      Log.error("fnUpdateSemanticTargetsModel: Cannot read links", oError);
    });
  }
  async function fnGetSemanticObjectPromise(oAppComponent, oView, oMetaModel, sPath, sQualifier) {
    return CommonUtils.getSemanticObjectsFromPath(oMetaModel, sPath, sQualifier);
  }
  function fnPrepareSemanticObjectsPromises(_oAppComponent, _oView, _oMetaModel, _aSemanticObjectsFound, _aSemanticObjectsPromises) {
    let _Keys, sPath;
    let sQualifier, regexResult;
    for (let i = 0; i < _aSemanticObjectsFound.length; i++) {
      sPath = _aSemanticObjectsFound[i];
      _Keys = Object.keys(_oMetaModel.getObject(sPath + "@"));
      for (let index = 0; index < _Keys.length; index++) {
        if (_Keys[index].indexOf(`@${"com.sap.vocabularies.Common.v1.SemanticObject"}`) === 0 && _Keys[index].indexOf(`@${"com.sap.vocabularies.Common.v1.SemanticObjectMapping"}`) === -1 && _Keys[index].indexOf(`@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}`) === -1) {
          regexResult = /#(.*)/.exec(_Keys[index]);
          sQualifier = regexResult ? regexResult[1] : "";
          _aSemanticObjectsPromises.push(CommonUtils.getSemanticObjectPromise(_oAppComponent, _oView, _oMetaModel, sPath, sQualifier));
        }
      }
    }
  }
  function fnGetSemanticTargetsFromPageModel(oController, sPageModel) {
    const _fnfindValuesHelper = function (obj, key, list) {
      if (!obj) {
        return list;
      }
      if (obj instanceof Array) {
        obj.forEach(item => {
          list = list.concat(_fnfindValuesHelper(item, key, []));
        });
        return list;
      }
      if (obj[key]) {
        list.push(obj[key]);
      }
      if (typeof obj == "object" && obj !== null) {
        const children = Object.keys(obj);
        if (children.length > 0) {
          for (let i = 0; i < children.length; i++) {
            list = list.concat(_fnfindValuesHelper(obj[children[i]], key, []));
          }
        }
      }
      return list;
    };
    const _fnfindValues = function (obj, key) {
      return _fnfindValuesHelper(obj, key, []);
    };
    const _fnDeleteDuplicateSemanticObjects = function (aSemanticObjectPath) {
      return aSemanticObjectPath.filter(function (value, index) {
        return aSemanticObjectPath.indexOf(value) === index;
      });
    };
    const oView = oController.getView();
    const oInternalModelContext = oView.getBindingContext("internal");
    if (oInternalModelContext) {
      const aSemanticObjectsPromises = [];
      const oComponent = oController.getOwnerComponent();
      const oAppComponent = Component.getOwnerComponentFor(oComponent);
      const oMetaModel = oAppComponent.getMetaModel();
      let oPageModel = oComponent.getModel(sPageModel).getData();
      if (JSON.stringify(oPageModel) === "{}") {
        oPageModel = oComponent.getModel(sPageModel)._getObject("/", undefined);
      }
      let aSemanticObjectsFound = _fnfindValues(oPageModel, "semanticObjectPath");
      aSemanticObjectsFound = _fnDeleteDuplicateSemanticObjects(aSemanticObjectsFound);
      const oShellServiceHelper = oAppComponent.getShellServices();
      let sCurrentHash = oShellServiceHelper.getHash();
      const aSemanticObjectsForGetLinks = [];
      const aSemanticObjects = [];
      let _oSemanticObject;
      if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
        // sCurrentHash can contain query string, cut it off!
        sCurrentHash = sCurrentHash.split("?")[0];
      }
      fnPrepareSemanticObjectsPromises(oAppComponent, oView, oMetaModel, aSemanticObjectsFound, aSemanticObjectsPromises);
      if (aSemanticObjectsPromises.length === 0) {
        return Promise.resolve();
      } else {
        Promise.all(aSemanticObjectsPromises).then(async function (aValues) {
          const aGetLinksPromises = [];
          let sSemObjExpression;
          const aSemanticObjectsResolved = aValues.filter(function (element) {
            if (element.semanticObject !== undefined && element.semanticObject.semanticObject && typeof element.semanticObject.semanticObject === "object") {
              sSemObjExpression = compileExpression(pathInModel(element.semanticObject.semanticObject.$Path));
              element.semanticObject.semanticObject = sSemObjExpression;
              element.semanticObjectForGetLinks[0].semanticObject = sSemObjExpression;
              return true;
            } else if (element) {
              return element.semanticObject !== undefined;
            } else {
              return false;
            }
          });
          for (let j = 0; j < aSemanticObjectsResolved.length; j++) {
            _oSemanticObject = aSemanticObjectsResolved[j];
            if (_oSemanticObject && _oSemanticObject.semanticObject && !(_oSemanticObject.semanticObject.semanticObject.indexOf("{") === 0)) {
              aSemanticObjectsForGetLinks.push(_oSemanticObject.semanticObjectForGetLinks);
              aSemanticObjects.push({
                semanticObject: _oSemanticObject.semanticObject.semanticObject,
                unavailableActions: _oSemanticObject.unavailableActions,
                path: aSemanticObjectsResolved[j].semanticObjectPath
              });
              aGetLinksPromises.push(oShellServiceHelper.getLinksWithCache([_oSemanticObject.semanticObjectForGetLinks]));
            }
          }
          return CommonUtils.updateSemanticTargets(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash);
        }).catch(function (oError) {
          Log.error("fnGetSemanticTargetsFromTable: Cannot get Semantic Objects", oError);
        });
      }
    } else {
      return Promise.resolve();
    }
  }
  function getFilterAllowedExpression(oFilterRestrictionsAnnotation) {
    const mAllowedExpressions = {};
    if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation.FilterExpressionRestrictions !== undefined) {
      oFilterRestrictionsAnnotation.FilterExpressionRestrictions.forEach(function (oProperty) {
        if (oProperty.Property && oProperty.AllowedExpressions !== undefined) {
          //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
          if (mAllowedExpressions[oProperty.Property.$PropertyPath] !== undefined) {
            mAllowedExpressions[oProperty.Property.$PropertyPath].push(oProperty.AllowedExpressions);
          } else {
            mAllowedExpressions[oProperty.Property.$PropertyPath] = [oProperty.AllowedExpressions];
          }
        }
      });
    }
    return mAllowedExpressions;
  }
  function getFilterRestrictions(oFilterRestrictionsAnnotation, sRestriction) {
    let aProps = [];
    if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation[sRestriction]) {
      aProps = oFilterRestrictionsAnnotation[sRestriction].map(function (oProperty) {
        return oProperty.$PropertyPath;
      });
    }
    return aProps;
  }
  function _fetchPropertiesForNavPath(paths, navPath, props) {
    const navPathPrefix = navPath + "/";
    return paths.reduce((outPaths, pathToCheck) => {
      if (pathToCheck.startsWith(navPathPrefix)) {
        const outPath = pathToCheck.replace(navPathPrefix, "");
        if (outPaths.indexOf(outPath) === -1) {
          outPaths.push(outPath);
        }
      }
      return outPaths;
    }, props);
  }
  function getFilterRestrictionsByPath(entityPath, oContext) {
    const oRet = {
      RequiredProperties: [],
      NonFilterableProperties: [],
      FilterAllowedExpressions: {}
    };
    let oFilterRestrictions;
    const navigationText = "$NavigationPropertyBinding";
    const frTerm = "@Org.OData.Capabilities.V1.FilterRestrictions";
    const entityTypePathParts = entityPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
    const entityTypePath = `/${entityTypePathParts.join("/")}/`;
    const entitySetPath = ModelHelper.getEntitySetPath(entityPath, oContext);
    const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    const isContainment = oContext.getObject(`${entityTypePath}$ContainsTarget`);
    const containmentNavPath = !!isContainment && entityTypePathParts[entityTypePathParts.length - 1];

    //LEAST PRIORITY - Filter restrictions directly at Entity Set
    //e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
    if (!isContainment) {
      oFilterRestrictions = oContext.getObject(`${entitySetPath}${frTerm}`);
      oRet.RequiredProperties = getFilterRestrictions(oFilterRestrictions, "RequiredProperties") || [];
      const resultContextCheck = oContext.getObject(`${entityTypePath}@com.sap.vocabularies.Common.v1.ResultContext`);
      if (!resultContextCheck) {
        oRet.NonFilterableProperties = getFilterRestrictions(oFilterRestrictions, "NonFilterableProperties") || [];
      }
      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet.FilterAllowedExpressions = getFilterAllowedExpression(oFilterRestrictions) || {};
    }
    if (entityTypePathParts.length > 1) {
      const navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
      // In case of containment we take entitySet provided as parent. And in case of normal we would remove the last navigation from entitySetPath.
      const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;
      //THIRD HIGHEST PRIORITY - Reading property path restrictions - Annotation at main entity but directly on navigation property path
      //e.g. Parent Customer with PropertyPath="Set/CityName" ContextPath: Customer/Set
      const oParentRet = {
        RequiredProperties: [],
        NonFilterableProperties: [],
        FilterAllowedExpressions: {}
      };
      if (!navPath.includes("%2F")) {
        const oParentFR = oContext.getObject(`${parentEntitySetPath}${frTerm}`);
        oRet.RequiredProperties = _fetchPropertiesForNavPath(getFilterRestrictions(oParentFR, "RequiredProperties") || [], navPath, oRet.RequiredProperties || []);
        oRet.NonFilterableProperties = _fetchPropertiesForNavPath(getFilterRestrictions(oParentFR, "NonFilterableProperties") || [], navPath, oRet.NonFilterableProperties || []);
        //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
        const completeAllowedExps = getFilterAllowedExpression(oParentFR) || {};
        oParentRet.FilterAllowedExpressions = Object.keys(completeAllowedExps).reduce((outProp, propPath) => {
          if (propPath.startsWith(navPath + "/")) {
            const outPropPath = propPath.replace(navPath + "/", "");
            outProp[outPropPath] = completeAllowedExps[propPath];
          }
          return outProp;
        }, {});
      }

      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet.FilterAllowedExpressions = mergeObjects({}, oRet.FilterAllowedExpressions || {}, oParentRet.FilterAllowedExpressions || {});

      //SECOND HIGHEST priority - Navigation restrictions
      //e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
      const oNavRestrictions = MetaModelFunction.getNavigationRestrictions(oContext, parentEntitySetPath, navPath.replaceAll("%2F", "/"));
      const oNavFilterRest = oNavRestrictions && oNavRestrictions["FilterRestrictions"];
      const navResReqProps = getFilterRestrictions(oNavFilterRest, "RequiredProperties") || [];
      oRet.RequiredProperties = uniqueSort(oRet.RequiredProperties.concat(navResReqProps));
      const navNonFilterProps = getFilterRestrictions(oNavFilterRest, "NonFilterableProperties") || [];
      oRet.NonFilterableProperties = uniqueSort(oRet.NonFilterableProperties.concat(navNonFilterProps));
      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet.FilterAllowedExpressions = mergeObjects({}, oRet.FilterAllowedExpressions || {}, getFilterAllowedExpression(oNavFilterRest) || {});

      //HIGHEST priority - Restrictions having target with navigation association entity
      // e.g. FR in "CustomerParameters/Set" ContextPath: "Customer/Set"
      const navAssociationEntityRest = oContext.getObject(`/${entityTypePathParts.join("/")}${frTerm}`);
      const navAssocReqProps = getFilterRestrictions(navAssociationEntityRest, "RequiredProperties") || [];
      oRet.RequiredProperties = uniqueSort(oRet.RequiredProperties.concat(navAssocReqProps));
      const navAssocNonFilterProps = getFilterRestrictions(navAssociationEntityRest, "NonFilterableProperties") || [];
      oRet.NonFilterableProperties = uniqueSort(oRet.NonFilterableProperties.concat(navAssocNonFilterProps));
      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet.FilterAllowedExpressions = mergeObjects({}, oRet.FilterAllowedExpressions, getFilterAllowedExpression(navAssociationEntityRest) || {});
    }
    return oRet;
  }
  async function templateControlFragment(sFragmentName, oPreprocessorSettings, oOptions, oModifier) {
    oOptions = oOptions || {};
    if (oModifier) {
      return oModifier.templateControlFragment(sFragmentName, oPreprocessorSettings, oOptions.view).then(function (oFragment) {
        // This is required as Flex returns an HTMLCollection as templating result in XML time.
        return oModifier.targets === "xmlTree" && oFragment.length > 0 ? oFragment[0] : oFragment;
      });
    } else {
      const oFragment = await XMLPreprocessor.process(XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"), {
        name: sFragmentName
      }, oPreprocessorSettings);
      const oControl = oFragment.firstElementChild;
      if (!!oOptions.isXML && oControl) {
        return oControl;
      }
      return Fragment.load({
        id: oOptions.id,
        definition: oFragment,
        controller: oOptions.controller
      });
    }
  }
  function getSingletonPath(path, metaModel) {
    const parts = path.split("/").filter(Boolean),
      propertyName = parts.pop(),
      navigationPath = parts.join("/"),
      entitySet = navigationPath && metaModel.getObject(`/${navigationPath}`);
    if ((entitySet === null || entitySet === void 0 ? void 0 : entitySet.$kind) === "Singleton") {
      const singletonName = parts[parts.length - 1];
      return `/${singletonName}/${propertyName}`;
    }
    return undefined;
  }
  async function requestSingletonProperty(path, model) {
    if (!path || !model) {
      return Promise.resolve(null);
    }
    const metaModel = model.getMetaModel();
    // Find the underlying entity set from the property path and check whether it is a singleton.
    const resolvedPath = getSingletonPath(path, metaModel);
    if (resolvedPath) {
      const propertyBinding = model.bindProperty(resolvedPath);
      return propertyBinding.requestValue();
    }
    return Promise.resolve(null);
  }

  // Get the path for action parameters that is needed to read the annotations
  function getParameterPath(sPath, sParameter) {
    let sContext;
    if (sPath.indexOf("@$ui5.overload") > -1) {
      sContext = sPath.split("@$ui5.overload")[0];
    } else {
      // For Unbound Actions in Action Parameter Dialogs
      const aAction = sPath.split("/0")[0].split(".");
      sContext = `/${aAction[aAction.length - 1]}/`;
    }
    return sContext + sParameter;
  }

  /**
   * Get resolved expression binding used for texts at runtime.
   *
   * @param expBinding
   * @param control
   * @function
   * @static
   * @memberof sap.fe.core.CommonUtils
   * @returns A string after resolution.
   * @ui5-restricted
   */
  function _fntranslatedTextFromExpBindingString(expBinding, control) {
    // The idea here is to create dummy element with the expresion binding.
    // Adding it as dependent to the view/control would propagate all the models to the dummy element and resolve the binding.
    // We remove the dummy element after that and destroy it.

    const anyResourceText = new AnyElement({
      anyText: expBinding
    });
    control.addDependent(anyResourceText);
    const resultText = anyResourceText.getAnyText();
    control.removeDependent(anyResourceText);
    anyResourceText.destroy();
    return resultText;
  }
  /**
   * Check if the current device has a small screen.
   *
   * @returns A Boolean.
   * @private
   */
  function isSmallDevice() {
    return !system.desktop || Device.resize.width <= 320;
  }
  /**
   * Get filter information for a SelectionVariant annotation.
   *
   * @param oControl The table/chart instance
   * @param selectionVariantPath Relative SelectionVariant annotation path
   * @param isChart
   * @returns Information on filters
   *  filters: array of sap.ui.model.filters
   * text: Text property of the SelectionVariant
   * @private
   * @ui5-restricted
   */

  function getFiltersInfoForSV(oControl, selectionVariantPath, isChart) {
    const sEntityTypePath = oControl.data("entityType"),
      oMetaModel = CommonUtils.getAppComponent(oControl).getMetaModel(),
      mPropertyFilters = {},
      aFilters = [],
      aPaths = [];
    let sText = "";
    let oSelectionVariant = oMetaModel.getObject(`${sEntityTypePath}${selectionVariantPath}`);
    // for chart the structure varies hence read it from main object
    if (isChart) {
      oSelectionVariant = oSelectionVariant.SelectionVariant;
    }
    if (oSelectionVariant) {
      sText = oSelectionVariant.Text;
      (oSelectionVariant.SelectOptions || []).filter(function (oSelectOption) {
        return oSelectOption && oSelectOption.PropertyName && oSelectOption.PropertyName.$PropertyPath;
      }).forEach(function (oSelectOption) {
        const sPath = oSelectOption.PropertyName.$PropertyPath;
        if (!aPaths.includes(sPath)) {
          aPaths.push(sPath);
        }
        for (const j in oSelectOption.Ranges) {
          var _oRange$Option, _oRange$Option$$EnumM;
          const oRange = oSelectOption.Ranges[j];
          mPropertyFilters[sPath] = (mPropertyFilters[sPath] || []).concat(new Filter(sPath, (_oRange$Option = oRange.Option) === null || _oRange$Option === void 0 ? void 0 : (_oRange$Option$$EnumM = _oRange$Option.$EnumMember) === null || _oRange$Option$$EnumM === void 0 ? void 0 : _oRange$Option$$EnumM.split("/").pop(), oRange.Low, oRange.High));
        }
      });
      for (const sPropertyPath in mPropertyFilters) {
        aFilters.push(new Filter({
          filters: mPropertyFilters[sPropertyPath],
          and: false
        }));
      }
    }
    return {
      properties: aPaths,
      filters: aFilters,
      text: sText
    };
  }
  function getConverterContextForPath(sMetaPath, oMetaModel, sEntitySet, oDiagnostics) {
    const oContext = oMetaModel.createBindingContext(sMetaPath);
    return ConverterContext === null || ConverterContext === void 0 ? void 0 : ConverterContext.createConverterContextForMacro(sEntitySet, oContext || oMetaModel, oDiagnostics, mergeObjects, undefined);
  }

  /**
   * This function returns an ID which should be used in the internal chart for the measure or dimension.
   * For standard cases, this is just the ID of the property.
   * If it is necessary to use another ID internally inside the chart (e.g. on duplicate property IDs) this method can be overwritten.
   * In this case, <code>getPropertyFromNameAndKind</code> needs to be overwritten as well.
   *
   * @param name ID of the property
   * @param kind Type of the property (measure or dimension)
   * @returns Internal ID for the sap.chart.Chart
   * @private
   * @ui5-restricted
   */
  function getInternalChartNameFromPropertyNameAndKind(name, kind) {
    return name.replace("_fe_" + kind + "_", "");
  }

  /**
   * This function returns an array of chart properties by remvoing _fe_groupable prefix.
   *
   * @param {Array} aFilters Chart filter properties
   * @returns Chart properties without prefixes
   * @private
   * @ui5-restricted
   */

  function getChartPropertiesWithoutPrefixes(aFilters) {
    aFilters.forEach(element => {
      if (element.sPath && element.sPath.includes("fe_groupable")) {
        element.sPath = CommonUtils.getInternalChartNameFromPropertyNameAndKind(element.sPath, "groupable");
      }
    });
    return aFilters;
  }

  /**
   * Gets the context of the DraftRoot path.
   * If a view has been created with the draft Root Path, this method returns its bindingContext.
   * Where no view is found a new created context is returned.
   * The new created context request the key of the entity in order to get the Etag of this entity.
   *
   * @function
   * @param programmingModel
   * @param view
   * @param appComponent
   * @name createRootContext
   * @returns Returns a Promise
   */
  async function createRootContext(programmingModel, view, appComponent) {
    const context = view.getBindingContext();
    if (context) {
      const rootContextPath = programmingModel === ProgrammingModel.Draft ? ModelHelper.getDraftRootPath(context) : ModelHelper.getStickyRootPath(context);
      let simpleRootContext;
      if (rootContextPath) {
        var _appComponent$getRoot, _simpleRootContext;
        // Check if a view matches with the draft root path
        const existingBindingContextOnPage = (_appComponent$getRoot = appComponent.getRootViewController().getInstancedViews().find(pageView => {
          var _pageView$getBindingC;
          return ((_pageView$getBindingC = pageView.getBindingContext()) === null || _pageView$getBindingC === void 0 ? void 0 : _pageView$getBindingC.getPath()) === rootContextPath;
        })) === null || _appComponent$getRoot === void 0 ? void 0 : _appComponent$getRoot.getBindingContext();
        if (existingBindingContextOnPage) {
          return existingBindingContextOnPage;
        }
        const internalModel = view.getModel("internal");
        simpleRootContext = internalModel.getProperty("/simpleRootContext");
        if (((_simpleRootContext = simpleRootContext) === null || _simpleRootContext === void 0 ? void 0 : _simpleRootContext.getPath()) === rootContextPath) {
          return simpleRootContext;
        }
        const model = context.getModel();
        simpleRootContext = model.bindContext(rootContextPath).getBoundContext();
        await CommonUtils.waitForContextRequested(simpleRootContext);
        // Store this new created context to use it on the next iterations
        internalModel.setProperty("/simpleRootContext", simpleRootContext);
        return simpleRootContext;
      }
    }
  }
  const CommonUtils = {
    fireButtonPress: fnFireButtonPress,
    getTargetView: getTargetView,
    getCurrentPageView: getCurrentPageView,
    hasTransientContext: fnHasTransientContexts,
    updateRelatedAppsDetails: fnUpdateRelatedAppsDetails,
    getAppComponent: getAppComponent,
    getMandatoryFilterFields: fnGetMandatoryFilterFields,
    getContextPathProperties: fnGetContextPathProperties,
    getParameterInfo: getParameterInfo,
    updateDataFieldForIBNButtonsVisibility: fnUpdateDataFieldForIBNButtonsVisibility,
    getEntitySetName: getEntitySetName,
    getActionPath: getActionPath,
    computeDisplayMode: computeDisplayMode,
    isStickyEditMode: isStickyEditMode,
    getOperatorsForProperty: getOperatorsForProperty,
    getOperatorsForDateProperty: getOperatorsForDateProperty,
    getOperatorsForGuidProperty: getOperatorsForGuidProperty,
    addExternalStateFiltersToSelectionVariant: addExternalStateFiltersToSelectionVariant,
    addPageContextToSelectionVariant: addPageContextToSelectionVariant,
    addDefaultDisplayCurrency: addDefaultDisplayCurrency,
    setUserDefaults: setUserDefaults,
    getIBNActions: fnGetIBNActions,
    getHeaderFacetItemConfigForExternalNavigation: getHeaderFacetItemConfigForExternalNavigation,
    getSemanticObjectMapping: getSemanticObjectMapping,
    setSemanticObjectMappings: setSemanticObjectMappings,
    getSemanticObjectPromise: fnGetSemanticObjectPromise,
    getSemanticTargetsFromPageModel: fnGetSemanticTargetsFromPageModel,
    getSemanticObjectsFromPath: fnGetSemanticObjectsFromPath,
    updateSemanticTargets: fnUpdateSemanticTargetsModel,
    waitForContextRequested: waitForContextRequested,
    getFilterRestrictionsByPath: getFilterRestrictionsByPath,
    getSpecificAllowedExpression: getSpecificAllowedExpression,
    getAdditionalParamsForCreate: getAdditionalParamsForCreate,
    requestSingletonProperty: requestSingletonProperty,
    templateControlFragment: templateControlFragment,
    FilterRestrictions: {
      REQUIRED_PROPERTIES: "RequiredProperties",
      NON_FILTERABLE_PROPERTIES: "NonFilterableProperties",
      ALLOWED_EXPRESSIONS: "FilterAllowedExpressions"
    },
    AllowedExpressionsPrio: ["SingleValue", "MultiValue", "SingleRange", "MultiRange", "SearchExpression", "MultiRangeOrSearchExpression"],
    normalizeSearchTerm: normalizeSearchTerm,
    setContextsBasedOnOperationAvailable: setContextsBasedOnOperationAvailable,
    setDynamicActionContexts: setDynamicActionContexts,
    requestProperty: requestProperty,
    getParameterPath: getParameterPath,
    getRelatedAppsMenuItems: _getRelatedAppsMenuItems,
    getTranslatedTextFromExpBindingString: _fntranslatedTextFromExpBindingString,
    addSemanticDatesToConditions: addSemanticDatesToConditions,
    addSelectOptionToConditions: addSelectOptionToConditions,
    updateRelateAppsModel: updateRelateAppsModel,
    getSemanticObjectAnnotations: _getSemanticObjectAnnotations,
    getFiltersInfoForSV: getFiltersInfoForSV,
    getInternalChartNameFromPropertyNameAndKind: getInternalChartNameFromPropertyNameAndKind,
    getChartPropertiesWithoutPrefixes: getChartPropertiesWithoutPrefixes,
    createRootContext: createRootContext,
    isSmallDevice,
    getConverterContextForPath
  };
  return CommonUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9ncmFtbWluZ01vZGVsIiwiRkVMaWJyYXJ5Iiwibm9ybWFsaXplU2VhcmNoVGVybSIsInNTZWFyY2hUZXJtIiwidW5kZWZpbmVkIiwicmVwbGFjZSIsInNwbGl0IiwicmVkdWNlIiwic05vcm1hbGl6ZWQiLCJzQ3VycmVudFdvcmQiLCJ3YWl0Rm9yQ29udGV4dFJlcXVlc3RlZCIsImJpbmRpbmdDb250ZXh0IiwibW9kZWwiLCJnZXRNb2RlbCIsIm1ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsImVudGl0eVBhdGgiLCJnZXRNZXRhUGF0aCIsImdldFBhdGgiLCJkYXRhTW9kZWwiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJnZXRDb250ZXh0IiwicmVxdWVzdFByb3BlcnR5IiwidGFyZ2V0RW50aXR5VHlwZSIsImtleXMiLCJuYW1lIiwiZm5IYXNUcmFuc2llbnRDb250ZXh0cyIsIm9MaXN0QmluZGluZyIsImJIYXNUcmFuc2llbnRDb250ZXh0cyIsImdldEN1cnJlbnRDb250ZXh0cyIsImZvckVhY2giLCJvQ29udGV4dCIsImlzVHJhbnNpZW50IiwiX2dldFNPSW50ZW50cyIsIm9TaGVsbFNlcnZpY2VIZWxwZXIiLCJvT2JqZWN0UGFnZUxheW91dCIsIm9TZW1hbnRpY09iamVjdCIsIm9QYXJhbSIsImdldExpbmtzIiwic2VtYW50aWNPYmplY3QiLCJwYXJhbXMiLCJfY3JlYXRlTWFwcGluZ3MiLCJvTWFwcGluZyIsImFTT01hcHBpbmdzIiwiYU1hcHBpbmdLZXlzIiwiT2JqZWN0Iiwib1NlbWFudGljTWFwcGluZyIsImkiLCJsZW5ndGgiLCJMb2NhbFByb3BlcnR5IiwiJFByb3BlcnR5UGF0aCIsIlNlbWFudGljT2JqZWN0UHJvcGVydHkiLCJwdXNoIiwiX2dldFJlbGF0ZWRBcHBzTWVudUl0ZW1zIiwiYUxpbmtzIiwiYUV4Y2x1ZGVkQWN0aW9ucyIsIm9UYXJnZXRQYXJhbXMiLCJhSXRlbXMiLCJhQWxsb3dlZEFjdGlvbnMiLCJvTGluayIsInNJbnRlbnQiLCJpbnRlbnQiLCJzQWN0aW9uIiwiaW5jbHVkZXMiLCJ0ZXh0IiwidGFyZ2V0U2VtT2JqZWN0IiwidGFyZ2V0QWN0aW9uIiwidGFyZ2V0UGFyYW1zIiwiaW5kZXhPZiIsIl9nZXRSZWxhdGVkSW50ZW50cyIsIm9BZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzIiwib0JpbmRpbmdDb250ZXh0IiwiYU1hbmlmZXN0U09JdGVtcyIsImFsbG93ZWRBY3Rpb25zIiwidW5hdmFpbGFibGVBY3Rpb25zIiwibWFwcGluZyIsIm5hdmlnYXRpb25Db250ZXh0cyIsInNlbWFudGljT2JqZWN0TWFwcGluZyIsIl9nZXRSZWxhdGVkSW50ZW50c1dpdGhTZW1hbnRpY09iamVjdHNBbmRBY3Rpb24iLCJzZW1hbnRpY09iamVjdEFuZEFjdGlvbiIsImFwcENvbXBvbmVudFNPSXRlbXMiLCJhY3Rpb25zIiwiYWN0aW9uIiwiZXhjbHVkZWRBY3Rpb25zIiwic29NYXBwaW5ncyIsInVwZGF0ZVJlbGF0ZUFwcHNNb2RlbCIsIm9FbnRyeSIsImFTZW1LZXlzIiwib01ldGFNb2RlbCIsIm9NZXRhUGF0aCIsImFwcENvbXBvbmVudCIsImdldFNoZWxsU2VydmljZXMiLCJzQ3VycmVudFNlbU9iaiIsInNDdXJyZW50QWN0aW9uIiwib1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMiLCJhUmVsYXRlZEFwcHNNZW51SXRlbXMiLCJhTWFuaWZlc3RTT0tleXMiLCJmbkdldFBhcnNlU2hlbGxIYXNoQW5kR2V0TGlua3MiLCJvUGFyc2VkVXJsIiwicGFyc2VTaGVsbEhhc2giLCJkb2N1bWVudCIsImxvY2F0aW9uIiwiaGFzaCIsImoiLCJzU2VtS2V5IiwidmFsdWUiLCJhVGVjaG5pY2FsS2V5cyIsImdldE9iamVjdCIsImtleSIsInNPYmpLZXkiLCJvTWFuaWZlc3REYXRhIiwiZ2V0VGFyZ2V0VmlldyIsImdldFZpZXdEYXRhIiwic2VtYW50aWNPYmplY3RJbnRlbnRzIiwiYWRkaXRpb25hbFNlbWFudGljT2JqZWN0cyIsIlByb21pc2UiLCJyZXNvbHZlIiwiY29tcG9uZW50RGF0YSIsImdldENvbXBvbmVudERhdGEiLCJmZUVudmlyb25tZW50IiwiZ2V0SW50ZW50IiwiaW50ZXJuYWxNb2RlbENvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImlzU2VtYW50aWNPYmplY3RIYXNTYW1lVGFyZ2V0SW5NYW5pZmVzdCIsImFBbm5vdGF0aW9uc1NPSXRlbXMiLCJzRW50aXR5U2V0UGF0aCIsInNFbnRpdHlUeXBlUGF0aCIsIm9FbnRpdHlTZXRBbm5vdGF0aW9ucyIsIkNvbW1vblV0aWxzIiwiZ2V0U2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyIsImJIYXNFbnRpdHlTZXRTTyIsIm9FbnRpdHlUeXBlQW5ub3RhdGlvbnMiLCJhVW5hdmFpbGFibGVBY3Rpb25zIiwiYU1hcHBpbmdzIiwic29JdGVtcyIsImNvbmNhdCIsInNldFByb3BlcnR5IiwiZXJyb3IiLCJMb2ciLCJfZ2V0U2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyIsIm9FbnRpdHlBbm5vdGF0aW9ucyIsInNBbm5vdGF0aW9uTWFwcGluZ1Rlcm0iLCJzQW5ub3RhdGlvbkFjdGlvblRlcm0iLCJzUXVhbGlmaWVyIiwiZm5VcGRhdGVSZWxhdGVkQXBwc0RldGFpbHMiLCJwYXRoIiwic1NlbWFudGljS2V5Vm9jYWJ1bGFyeSIsInJlcXVlc3RPYmplY3QiLCJ0aGVuIiwicmVxdWVzdGVkT2JqZWN0IiwiY2F0Y2giLCJvRXJyb3IiLCJmbkZpcmVCdXR0b25QcmVzcyIsIm9CdXR0b24iLCJpc0EiLCJnZXRWaXNpYmxlIiwiZ2V0RW5hYmxlZCIsImZpcmVQcmVzcyIsImdldEFwcENvbXBvbmVudCIsIm9Db250cm9sIiwib093bmVyIiwiQ29tcG9uZW50IiwiZ2V0T3duZXJDb21wb25lbnRGb3IiLCJFcnJvciIsImdldEN1cnJlbnRQYWdlVmlldyIsIm9BcHBDb21wb25lbnQiLCJyb290Vmlld0NvbnRyb2xsZXIiLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJpc0ZjbEVuYWJsZWQiLCJnZXRSaWdodG1vc3RWaWV3IiwiZ2V0Um9vdENvbnRhaW5lciIsImdldEN1cnJlbnRQYWdlIiwib0NvbXBvbmVudCIsImdldENvbXBvbmVudEluc3RhbmNlIiwiZ2V0Um9vdENvbnRyb2wiLCJnZXRQYXJlbnQiLCJfZm5DaGVja0lzTWF0Y2giLCJvT2JqZWN0Iiwib0tleXNUb0NoZWNrIiwic0tleSIsImZuR2V0Q29udGV4dFBhdGhQcm9wZXJ0aWVzIiwibWV0YU1vZGVsQ29udGV4dCIsInNDb250ZXh0UGF0aCIsIm9GaWx0ZXIiLCJvRW50aXR5VHlwZSIsIm9Qcm9wZXJ0aWVzIiwiaGFzT3duUHJvcGVydHkiLCJ0ZXN0IiwiJGtpbmQiLCJmbkdldE1hbmRhdG9yeUZpbHRlckZpZWxkcyIsImFNYW5kYXRvcnlGaWx0ZXJGaWVsZHMiLCJmbkdldElCTkFjdGlvbnMiLCJhSUJOQWN0aW9ucyIsImFBY3Rpb25zIiwiZ2V0QWN0aW9ucyIsIm9BY3Rpb24iLCJnZXRBY3Rpb24iLCJvTWVudSIsImdldE1lbnUiLCJnZXRJdGVtcyIsIm9JdGVtIiwiZGF0YSIsImZuVXBkYXRlRGF0YUZpZWxkRm9ySUJOQnV0dG9uc1Zpc2liaWxpdHkiLCJvVmlldyIsIm9QYXJhbXMiLCJpc1N0aWNreSIsIk1vZGVsSGVscGVyIiwiaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkIiwiZm5HZXRMaW5rcyIsIm9EYXRhIiwiYUtleXMiLCJvSUJOQWN0aW9uIiwic1NlbWFudGljT2JqZWN0IiwiYUxpbmsiLCJzZXRWaXNpYmxlIiwiZ2V0SWQiLCJzaGVsbE5hdmlnYXRpb25Ob3RBdmFpbGFibGUiLCJnZXRBY3Rpb25QYXRoIiwiYWN0aW9uQ29udGV4dCIsImJSZXR1cm5Pbmx5UGF0aCIsImluQWN0aW9uTmFtZSIsImJDaGVja1N0YXRpY1ZhbHVlIiwic0FjdGlvbk5hbWUiLCJ0b1N0cmluZyIsInNFbnRpdHlUeXBlTmFtZSIsIiRUeXBlIiwic0VudGl0eU5hbWUiLCJnZXRFbnRpdHlTZXROYW1lIiwic1Byb3BlcnR5Iiwic0JpbmRpbmdQYXJhbWV0ZXIiLCJzRW50aXR5VHlwZSIsIm9FbnRpdHlDb250YWluZXIiLCJjb21wdXRlRGlzcGxheU1vZGUiLCJvUHJvcGVydHlBbm5vdGF0aW9ucyIsIm9Db2xsZWN0aW9uQW5ub3RhdGlvbnMiLCJvVGV4dEFubm90YXRpb24iLCJvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiIsIiRFbnVtTWVtYmVyIiwiX2dldEVudGl0eVR5cGUiLCJfcmVxdWVzdE9iamVjdCIsIm9TZWxlY3RlZENvbnRleHQiLCJuQnJhY2tldEluZGV4Iiwic1RhcmdldFR5cGUiLCJzbGljZSIsInNDdXJyZW50VHlwZSIsImdldEJpbmRpbmciLCJ3YXJuaW5nIiwic0R5bmFtaWNBY3Rpb25FbmFibGVkUGF0aCIsIm9Qcm9taXNlIiwicmVxdWVzdFNpbmdsZXRvblByb3BlcnR5IiwidlByb3BlcnR5VmFsdWUiLCJzZXRDb250ZXh0c0Jhc2VkT25PcGVyYXRpb25BdmFpbGFibGUiLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJhUmVxdWVzdFByb21pc2VzIiwiYWxsIiwiYVJlc3VsdHMiLCJhQXBwbGljYWJsZUNvbnRleHRzIiwiYU5vdEFwcGxpY2FibGVDb250ZXh0cyIsImFSZXN1bHQiLCJzZXREeW5hbWljQWN0aW9uQ29udGV4dHMiLCJ0cmFjZSIsImFBcHBsaWNhYmxlIiwiYU5vdEFwcGxpY2FibGUiLCJzRHluYW1pY0FjdGlvblBhdGhQcmVmaXgiLCJvSW50ZXJuYWxNb2RlbCIsIl9nZXREZWZhdWx0T3BlcmF0b3JzIiwic1Byb3BlcnR5VHlwZSIsIm9EYXRhQ2xhc3MiLCJUeXBlVXRpbCIsImdldERhdGFUeXBlQ2xhc3NOYW1lIiwib0Jhc2VUeXBlIiwiZ2V0QmFzZVR5cGUiLCJGaWx0ZXJPcGVyYXRvclV0aWwiLCJnZXRPcGVyYXRvcnNGb3JUeXBlIiwiX2dldFJlc3RyaWN0aW9ucyIsImFEZWZhdWx0T3BzIiwiYUV4cHJlc3Npb25PcHMiLCJmaWx0ZXIiLCJzRWxlbWVudCIsImdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb24iLCJhRXhwcmVzc2lvbnMiLCJhQWxsb3dlZEV4cHJlc3Npb25zUHJpb3JpdHkiLCJBbGxvd2VkRXhwcmVzc2lvbnNQcmlvIiwic29ydCIsImEiLCJiIiwiZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkiLCJzVHlwZSIsImJVc2VTZW1hbnRpY0RhdGVSYW5nZSIsInNTZXR0aW5ncyIsIm9GaWx0ZXJSZXN0cmljdGlvbnMiLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgiLCJhRXF1YWxzT3BzIiwiYVNpbmdsZVJhbmdlT3BzIiwiYVNpbmdsZVJhbmdlRFRCYXNpY09wcyIsImFTaW5nbGVWYWx1ZURhdGVPcHMiLCJhTXVsdGlSYW5nZU9wcyIsImFTZWFyY2hFeHByZXNzaW9uT3BzIiwiYVNlbWFudGljRGF0ZU9wc0V4dCIsIlNlbWFudGljRGF0ZU9wZXJhdG9ycyIsImdldFN1cHBvcnRlZE9wZXJhdGlvbnMiLCJiU2VtYW50aWNEYXRlUmFuZ2UiLCJhU2VtYW50aWNEYXRlT3BzIiwib1NldHRpbmdzIiwiSlNPTiIsInBhcnNlIiwiY3VzdG9tRGF0YSIsIm9wZXJhdG9yQ29uZmlndXJhdGlvbiIsImdldEZpbHRlck9wZXJhdGlvbnMiLCJnZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zIiwiYURlZmF1bHRPcGVyYXRvcnMiLCJyZXN0cmljdGlvbnMiLCJGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMiLCJzQWxsb3dlZEV4cHJlc3Npb24iLCJhU2luZ2xlVmFsdWVPcHMiLCJzT3BlcmF0b3JzIiwiZ2V0T3BlcmF0b3JzRm9yR3VpZFByb3BlcnR5IiwiYWxsb3dlZE9wZXJhdG9yc0Zvckd1aWQiLCJnZXRPcGVyYXRvcnNGb3JEYXRlUHJvcGVydHkiLCJwcm9wZXJ0eVR5cGUiLCJnZXRQYXJhbWV0ZXJJbmZvIiwic1BhcmFtZXRlckNvbnRleHRQYXRoIiwic3Vic3RyaW5nIiwibGFzdEluZGV4T2YiLCJiUmVzdWx0Q29udGV4dCIsIm9QYXJhbWV0ZXJJbmZvIiwiY29udGV4dFBhdGgiLCJwYXJhbWV0ZXJQcm9wZXJ0aWVzIiwiZ2V0Q29udGV4dFBhdGhQcm9wZXJ0aWVzIiwiYWRkU2VsZWN0T3B0aW9uVG9Db25kaXRpb25zIiwib1Byb3BlcnR5TWV0YWRhdGEiLCJhVmFsaWRPcGVyYXRvcnMiLCJhU2VtYW50aWNEYXRlT3BlcmF0b3JzIiwiYUN1bXVsYXRpdmVDb25kaXRpb25zIiwib1NlbGVjdE9wdGlvbiIsIm9Db25kaXRpb24iLCJnZXRDb25kaXRpb25zIiwiU2VtYW50aWNEYXRlcyIsIm9wZXJhdG9yIiwic2VtYW50aWNEYXRlcyIsImFkZFNlbWFudGljRGF0ZXNUb0NvbmRpdGlvbnMiLCJvU2VtYW50aWNEYXRlcyIsInZhbHVlcyIsImhpZ2giLCJsb3ciLCJpc0VtcHR5IiwiYWRkUGFnZUNvbnRleHRUb1NlbGVjdGlvblZhcmlhbnQiLCJvU2VsZWN0aW9uVmFyaWFudCIsIm1QYWdlQ29udGV4dCIsIm9OYXZpZ2F0aW9uU2VydmljZSIsImdldE5hdmlnYXRpb25TZXJ2aWNlIiwibWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQiLCJ0b0pTT05TdHJpbmciLCJhZGRFeHRlcm5hbFN0YXRlRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudCIsImlucHV0U2VsZWN0aW9uVmFyaWFudCIsImZpbHRlcnMiLCJmaWx0ZXJCYXIiLCJ0YXJnZXRJbmZvIiwiZmlsdGVyQ29uZGl0aW9ucyIsImZpbHRlcnNXaXRob3V0Q29uZmxpY3QiLCJmaWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0IiwidGFibGVQcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0IiwicHJvcGVydGllc1dpdGhvdXRDb25mbGljdCIsInNlbGVjdGlvblZhcmlhbnRGcm9tRmlsdGVyYmFyIiwiU3RhdGVGaWx0ZXJUb1NlbGVjdGlvblZhcmlhbnQiLCJnZXRTZWxlY3Rpb25WYXJpYW50RnJvbUNvbmRpdGlvbnMiLCJnZXRQcm9wZXJ0eUhlbHBlciIsImZpbHRlcmtleSIsImZpbHRlclNlbGVjdE9wdGlvbiIsImdldFNlbGVjdE9wdGlvbiIsIm1hc3NBZGRTZWxlY3RPcHRpb24iLCJpc1N0aWNreUVkaXRNb2RlIiwiYklzU3RpY2t5TW9kZSIsImJVSUVkaXRhYmxlIiwiZ2V0UHJvcGVydHkiLCJhZGREZWZhdWx0RGlzcGxheUN1cnJlbmN5Iiwib1NlbGVjdGlvblZhcmlhbnREZWZhdWx0cyIsImFTVk9wdGlvbiIsImFEZWZhdWx0U1ZPcHRpb24iLCJkaXNwbGF5Q3VycmVuY3lTZWxlY3RPcHRpb24iLCJzU2lnbiIsInNPcHRpb24iLCJzTG93Iiwic0hpZ2giLCJhZGRTZWxlY3RPcHRpb24iLCJzZXRVc2VyRGVmYXVsdHMiLCJhUGFyYW1ldGVycyIsIm9Nb2RlbCIsImJJc0FjdGlvbiIsImJJc0NyZWF0ZSIsIm9BY3Rpb25EZWZhdWx0VmFsdWVzIiwib0NvbXBvbmVudERhdGEiLCJvU3RhcnR1cFBhcmFtZXRlcnMiLCJzdGFydHVwUGFyYW1ldGVycyIsIm9TaGVsbFNlcnZpY2VzIiwib1N0YXJ0dXBBcHBTdGF0ZSIsImdldFN0YXJ0dXBBcHBTdGF0ZSIsImdldERhdGEiLCJhRXh0ZW5kZWRQYXJhbWV0ZXJzIiwic2VsZWN0aW9uVmFyaWFudCIsIlNlbGVjdE9wdGlvbnMiLCJvUGFyYW1ldGVyIiwic1Byb3BlcnR5TmFtZSIsIiROYW1lIiwic1BhcmFtZXRlck5hbWUiLCJvRXh0ZW5kZWRQYXJhbWV0ZXIiLCJQcm9wZXJ0eU5hbWUiLCJvUmFuZ2UiLCJSYW5nZXMiLCJTaWduIiwiT3B0aW9uIiwiTG93IiwiZ2V0QWRkaXRpb25hbFBhcmFtc0ZvckNyZWF0ZSIsIm9JbmJvdW5kUGFyYW1ldGVycyIsIm9JbmJvdW5kcyIsImFDcmVhdGVQYXJhbWV0ZXJzIiwic1BhcmFtZXRlciIsInVzZUZvckNyZWF0ZSIsIm9SZXQiLCJzQ3JlYXRlUGFyYW1ldGVyIiwiYVZhbHVlcyIsImNyZWF0ZSIsImdldFNlbWFudGljT2JqZWN0TWFwcGluZyIsIm9PdXRib3VuZCIsImFTZW1hbnRpY09iamVjdE1hcHBpbmciLCJwYXJhbWV0ZXJzIiwic1BhcmFtIiwiZm9ybWF0IiwiZ2V0SGVhZGVyRmFjZXRJdGVtQ29uZmlnRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uIiwib1ZpZXdEYXRhIiwib0Nyb3NzTmF2Iiwib0hlYWRlckZhY2V0SXRlbXMiLCJzSWQiLCJvQ29udHJvbENvbmZpZyIsImNvbnRyb2xDb25maWd1cmF0aW9uIiwiY29uZmlnIiwic091dGJvdW5kIiwibmF2aWdhdGlvbiIsInRhcmdldE91dGJvdW5kIiwib3V0Ym91bmQiLCJnZW5lcmF0ZSIsInNldFNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJ2TWFwcGluZ3MiLCJvTWFwcGluZ3MiLCJzTG9jYWxQcm9wZXJ0eSIsInNTZW1hbnRpY09iamVjdFByb3BlcnR5IiwicmVtb3ZlU2VsZWN0T3B0aW9uIiwiZm5HZXRTZW1hbnRpY09iamVjdHNGcm9tUGF0aCIsInNQYXRoIiwiYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiYVNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3MiLCJzZW1hbnRpY09iamVjdFBhdGgiLCJzZW1hbnRpY09iamVjdEZvckdldExpbmtzIiwiZm5VcGRhdGVTZW1hbnRpY1RhcmdldHNNb2RlbCIsImFHZXRMaW5rc1Byb21pc2VzIiwiYVNlbWFudGljT2JqZWN0cyIsInNDdXJyZW50SGFzaCIsIl9vTGluayIsIl9zTGlua0ludGVudEFjdGlvbiIsImFGaW5hbExpbmtzIiwib0ZpbmFsU2VtYW50aWNPYmplY3RzIiwiYkludGVudEhhc0FjdGlvbnMiLCJrIiwib1RtcCIsInNBbHRlcm5hdGVQYXRoIiwiaGFzVGFyZ2V0c05vdEZpbHRlcmVkIiwiaGFzVGFyZ2V0cyIsImlMaW5rQ291bnQiLCJIYXNUYXJnZXRzIiwiSGFzVGFyZ2V0c05vdEZpbHRlcmVkIiwiYXNzaWduIiwic1NlbWFudGljT2JqZWN0TmFtZSIsIm1lcmdlT2JqZWN0cyIsImZuR2V0U2VtYW50aWNPYmplY3RQcm9taXNlIiwiZ2V0U2VtYW50aWNPYmplY3RzRnJvbVBhdGgiLCJmblByZXBhcmVTZW1hbnRpY09iamVjdHNQcm9taXNlcyIsIl9vQXBwQ29tcG9uZW50IiwiX29WaWV3IiwiX29NZXRhTW9kZWwiLCJfYVNlbWFudGljT2JqZWN0c0ZvdW5kIiwiX2FTZW1hbnRpY09iamVjdHNQcm9taXNlcyIsIl9LZXlzIiwicmVnZXhSZXN1bHQiLCJpbmRleCIsImV4ZWMiLCJnZXRTZW1hbnRpY09iamVjdFByb21pc2UiLCJmbkdldFNlbWFudGljVGFyZ2V0c0Zyb21QYWdlTW9kZWwiLCJvQ29udHJvbGxlciIsInNQYWdlTW9kZWwiLCJfZm5maW5kVmFsdWVzSGVscGVyIiwib2JqIiwibGlzdCIsIkFycmF5IiwiaXRlbSIsImNoaWxkcmVuIiwiX2ZuZmluZFZhbHVlcyIsIl9mbkRlbGV0ZUR1cGxpY2F0ZVNlbWFudGljT2JqZWN0cyIsImFTZW1hbnRpY09iamVjdFBhdGgiLCJnZXRWaWV3IiwiYVNlbWFudGljT2JqZWN0c1Byb21pc2VzIiwiZ2V0T3duZXJDb21wb25lbnQiLCJvUGFnZU1vZGVsIiwic3RyaW5naWZ5IiwiX2dldE9iamVjdCIsImFTZW1hbnRpY09iamVjdHNGb3VuZCIsImdldEhhc2giLCJhU2VtYW50aWNPYmplY3RzRm9yR2V0TGlua3MiLCJfb1NlbWFudGljT2JqZWN0Iiwic1NlbU9iakV4cHJlc3Npb24iLCJhU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQiLCJlbGVtZW50IiwiY29tcGlsZUV4cHJlc3Npb24iLCJwYXRoSW5Nb2RlbCIsIiRQYXRoIiwiZ2V0TGlua3NXaXRoQ2FjaGUiLCJ1cGRhdGVTZW1hbnRpY1RhcmdldHMiLCJnZXRGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbiIsIm9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uIiwibUFsbG93ZWRFeHByZXNzaW9ucyIsIkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMiLCJvUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkFsbG93ZWRFeHByZXNzaW9ucyIsImdldEZpbHRlclJlc3RyaWN0aW9ucyIsInNSZXN0cmljdGlvbiIsImFQcm9wcyIsIm1hcCIsIl9mZXRjaFByb3BlcnRpZXNGb3JOYXZQYXRoIiwicGF0aHMiLCJuYXZQYXRoIiwicHJvcHMiLCJuYXZQYXRoUHJlZml4Iiwib3V0UGF0aHMiLCJwYXRoVG9DaGVjayIsInN0YXJ0c1dpdGgiLCJvdXRQYXRoIiwiUmVxdWlyZWRQcm9wZXJ0aWVzIiwiTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMiLCJuYXZpZ2F0aW9uVGV4dCIsImZyVGVybSIsImVudGl0eVR5cGVQYXRoUGFydHMiLCJyZXBsYWNlQWxsIiwiZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmciLCJlbnRpdHlUeXBlUGF0aCIsImpvaW4iLCJlbnRpdHlTZXRQYXRoIiwiZ2V0RW50aXR5U2V0UGF0aCIsImVudGl0eVNldFBhdGhQYXJ0cyIsImlzQ29udGFpbm1lbnQiLCJjb250YWlubWVudE5hdlBhdGgiLCJyZXN1bHRDb250ZXh0Q2hlY2siLCJwYXJlbnRFbnRpdHlTZXRQYXRoIiwib1BhcmVudFJldCIsIm9QYXJlbnRGUiIsImNvbXBsZXRlQWxsb3dlZEV4cHMiLCJvdXRQcm9wIiwicHJvcFBhdGgiLCJvdXRQcm9wUGF0aCIsIm9OYXZSZXN0cmljdGlvbnMiLCJNZXRhTW9kZWxGdW5jdGlvbiIsImdldE5hdmlnYXRpb25SZXN0cmljdGlvbnMiLCJvTmF2RmlsdGVyUmVzdCIsIm5hdlJlc1JlcVByb3BzIiwidW5pcXVlU29ydCIsIm5hdk5vbkZpbHRlclByb3BzIiwibmF2QXNzb2NpYXRpb25FbnRpdHlSZXN0IiwibmF2QXNzb2NSZXFQcm9wcyIsIm5hdkFzc29jTm9uRmlsdGVyUHJvcHMiLCJ0ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudCIsInNGcmFnbWVudE5hbWUiLCJvUHJlcHJvY2Vzc29yU2V0dGluZ3MiLCJvT3B0aW9ucyIsIm9Nb2RpZmllciIsInZpZXciLCJvRnJhZ21lbnQiLCJ0YXJnZXRzIiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJpc1hNTCIsIkZyYWdtZW50IiwibG9hZCIsImlkIiwiZGVmaW5pdGlvbiIsImNvbnRyb2xsZXIiLCJnZXRTaW5nbGV0b25QYXRoIiwicGFydHMiLCJCb29sZWFuIiwicHJvcGVydHlOYW1lIiwicG9wIiwibmF2aWdhdGlvblBhdGgiLCJlbnRpdHlTZXQiLCJzaW5nbGV0b25OYW1lIiwicmVzb2x2ZWRQYXRoIiwicHJvcGVydHlCaW5kaW5nIiwiYmluZFByb3BlcnR5IiwicmVxdWVzdFZhbHVlIiwiZ2V0UGFyYW1ldGVyUGF0aCIsInNDb250ZXh0IiwiYUFjdGlvbiIsIl9mbnRyYW5zbGF0ZWRUZXh0RnJvbUV4cEJpbmRpbmdTdHJpbmciLCJleHBCaW5kaW5nIiwiY29udHJvbCIsImFueVJlc291cmNlVGV4dCIsIkFueUVsZW1lbnQiLCJhbnlUZXh0IiwiYWRkRGVwZW5kZW50IiwicmVzdWx0VGV4dCIsImdldEFueVRleHQiLCJyZW1vdmVEZXBlbmRlbnQiLCJkZXN0cm95IiwiaXNTbWFsbERldmljZSIsInN5c3RlbSIsImRlc2t0b3AiLCJEZXZpY2UiLCJyZXNpemUiLCJ3aWR0aCIsImdldEZpbHRlcnNJbmZvRm9yU1YiLCJzZWxlY3Rpb25WYXJpYW50UGF0aCIsImlzQ2hhcnQiLCJtUHJvcGVydHlGaWx0ZXJzIiwiYUZpbHRlcnMiLCJhUGF0aHMiLCJzVGV4dCIsIlNlbGVjdGlvblZhcmlhbnQiLCJUZXh0IiwiRmlsdGVyIiwiSGlnaCIsInNQcm9wZXJ0eVBhdGgiLCJhbmQiLCJwcm9wZXJ0aWVzIiwiZ2V0Q29udmVydGVyQ29udGV4dEZvclBhdGgiLCJzTWV0YVBhdGgiLCJzRW50aXR5U2V0Iiwib0RpYWdub3N0aWNzIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJDb252ZXJ0ZXJDb250ZXh0IiwiY3JlYXRlQ29udmVydGVyQ29udGV4dEZvck1hY3JvIiwiZ2V0SW50ZXJuYWxDaGFydE5hbWVGcm9tUHJvcGVydHlOYW1lQW5kS2luZCIsImtpbmQiLCJnZXRDaGFydFByb3BlcnRpZXNXaXRob3V0UHJlZml4ZXMiLCJjcmVhdGVSb290Q29udGV4dCIsInByb2dyYW1taW5nTW9kZWwiLCJjb250ZXh0Iiwicm9vdENvbnRleHRQYXRoIiwiRHJhZnQiLCJnZXREcmFmdFJvb3RQYXRoIiwiZ2V0U3RpY2t5Um9vdFBhdGgiLCJzaW1wbGVSb290Q29udGV4dCIsImV4aXN0aW5nQmluZGluZ0NvbnRleHRPblBhZ2UiLCJnZXRJbnN0YW5jZWRWaWV3cyIsImZpbmQiLCJwYWdlVmlldyIsImludGVybmFsTW9kZWwiLCJiaW5kQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsImZpcmVCdXR0b25QcmVzcyIsImhhc1RyYW5zaWVudENvbnRleHQiLCJ1cGRhdGVSZWxhdGVkQXBwc0RldGFpbHMiLCJnZXRNYW5kYXRvcnlGaWx0ZXJGaWVsZHMiLCJ1cGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eSIsImdldElCTkFjdGlvbnMiLCJnZXRTZW1hbnRpY1RhcmdldHNGcm9tUGFnZU1vZGVsIiwiRmlsdGVyUmVzdHJpY3Rpb25zIiwiUkVRVUlSRURfUFJPUEVSVElFUyIsIk5PTl9GSUxURVJBQkxFX1BST1BFUlRJRVMiLCJBTExPV0VEX0VYUFJFU1NJT05TIiwiZ2V0UmVsYXRlZEFwcHNNZW51SXRlbXMiLCJnZXRUcmFuc2xhdGVkVGV4dEZyb21FeHBCaW5kaW5nU3RyaW5nIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb21tb25VdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSAqIGFzIEVkbSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvRWRtXCI7XG5pbXBvcnQgdHlwZSB7IEZpbHRlclJlc3RyaWN0aW9uc1R5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NhcGFiaWxpdGllc1wiO1xuaW1wb3J0IHR5cGUgeyBTZW1hbnRpY09iamVjdE1hcHBpbmdUeXBlLCBTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgeyBDb21tb25Bbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHR5cGUgeyBUZXh0QXJyYW5nZW1lbnQgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB1bmlxdWVTb3J0IGZyb20gXCJzYXAvYmFzZS91dGlsL2FycmF5L3VuaXF1ZVNvcnRcIjtcbmltcG9ydCBtZXJnZU9iamVjdHMgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgdHlwZSB7IENvbXBvbmVudERhdGEgfSBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgdHlwZSB7IEZFVmlldyB9IGZyb20gXCJzYXAvZmUvY29yZS9CYXNlQ29udHJvbGxlclwiO1xuaW1wb3J0IENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIHBhdGhJbk1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgU2VtYW50aWNEYXRlT3BlcmF0b3JzIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NlbWFudGljRGF0ZU9wZXJhdG9yc1wiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IEZFTGlicmFyeSBmcm9tIFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSB7IElTaGVsbFNlcnZpY2VzIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1NoZWxsU2VydmljZXNGYWN0b3J5XCI7XG5pbXBvcnQgU3RhdGVGaWx0ZXJUb1NlbGVjdGlvblZhcmlhbnQgZnJvbSBcInNhcC9mZS9jb3JlL1N0YXRlRmlsdGVyVG9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSBEaWFnbm9zdGljcyBmcm9tIFwic2FwL2ZlL2NvcmUvc3VwcG9ydC9EaWFnbm9zdGljc1wiO1xuaW1wb3J0IFR5cGVVdGlsIGZyb20gXCJzYXAvZmUvY29yZS90eXBlL1R5cGVVdGlsXCI7XG5pbXBvcnQgdHlwZSBTZWxlY3Rpb25WYXJpYW50IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSB7IFNlbGVjdE9wdGlvbiwgU2VtYW50aWNEYXRlQ29uZmlndXJhdGlvbiB9IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IHR5cGUgTWVudUJ1dHRvbiBmcm9tIFwic2FwL20vTWVudUJ1dHRvblwiO1xuaW1wb3J0IHR5cGUgTmF2Q29udGFpbmVyIGZyb20gXCJzYXAvbS9OYXZDb250YWluZXJcIjtcbmltcG9ydCB0eXBlIE92ZXJmbG93VG9vbGJhckJ1dHRvbiBmcm9tIFwic2FwL20vT3ZlcmZsb3dUb29sYmFyQnV0dG9uXCI7XG5pbXBvcnQgdHlwZSBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCB0eXBlIENvbXBvbmVudENvbnRhaW5lciBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50Q29udGFpbmVyXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBVSTVFbGVtZW50IGZyb20gXCJzYXAvdWkvY29yZS9FbGVtZW50XCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sbGVyIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgRGV2aWNlLCB7IHN5c3RlbSB9IGZyb20gXCJzYXAvdWkvRGV2aWNlXCI7XG5pbXBvcnQgdHlwZSBBY3Rpb25Ub29sYmFyQWN0aW9uIGZyb20gXCJzYXAvdWkvbWRjL2FjdGlvbnRvb2xiYXIvQWN0aW9uVG9vbGJhckFjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBkZWZhdWx0IGFzIE1EQ0NoYXJ0IH0gZnJvbSBcInNhcC91aS9tZGMvQ2hhcnRcIjtcbmltcG9ydCB0eXBlIHsgQ29uZGl0aW9uT2JqZWN0IH0gZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvblwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yVXRpbCBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vRmlsdGVyT3BlcmF0b3JVdGlsXCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyXCI7XG5pbXBvcnQgdHlwZSBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgTURDVGFibGUgZnJvbSBcInNhcC91aS9tZGMvdmFsdWVoZWxwL2NvbnRlbnQvTURDVGFibGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgRmlsdGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFWNENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9iamVjdFBhZ2VEeW5hbWljSGVhZGVyVGl0bGUgZnJvbSBcInNhcC91eGFwL09iamVjdFBhZ2VEeW5hbWljSGVhZGVyVGl0bGVcIjtcbmltcG9ydCB0eXBlIE9iamVjdFBhZ2VMYXlvdXQgZnJvbSBcInNhcC91eGFwL09iamVjdFBhZ2VMYXlvdXRcIjtcbmltcG9ydCB0eXBlIHtcblx0RXhwYW5kUGF0aFR5cGUsXG5cdE1ldGFNb2RlbEVudGl0eVR5cGUsXG5cdE1ldGFNb2RlbEVudW0sXG5cdE1ldGFNb2RlbE5hdlByb3BlcnR5LFxuXHRNZXRhTW9kZWxQcm9wZXJ0eSxcblx0TWV0YU1vZGVsVHlwZVxufSBmcm9tIFwidHlwZXMvbWV0YW1vZGVsX3R5cGVzXCI7XG5pbXBvcnQgQW55RWxlbWVudCBmcm9tIFwiLi9jb250cm9scy9BbnlFbGVtZW50XCI7XG5pbXBvcnQgKiBhcyBNZXRhTW9kZWxGdW5jdGlvbiBmcm9tIFwiLi9oZWxwZXJzL01ldGFNb2RlbEZ1bmN0aW9uXCI7XG5pbXBvcnQgeyBnZXRDb25kaXRpb25zIH0gZnJvbSBcIi4vdGVtcGxhdGluZy9GaWx0ZXJIZWxwZXJcIjtcblxuY29uc3QgUHJvZ3JhbW1pbmdNb2RlbCA9IEZFTGlicmFyeS5Qcm9ncmFtbWluZ01vZGVsO1xuXG50eXBlIE15SW5ib3hJbnRlbnQgPSB7XG5cdHNlbWFudGljT2JqZWN0OiBzdHJpbmc7XG5cdGFjdGlvbjogc3RyaW5nO1xufTtcbnR5cGUgRXh0ZXJuYWxGaWx0ZXIgPSB7XG5cdGZpbHRlckNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIENvbmRpdGlvbk9iamVjdFtdPjtcblx0ZmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdD86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59O1xuXG50eXBlIE5hdmlnYXRpb25JbmZvID0ge1xuXHRwcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0PzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn07XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNlYXJjaFRlcm0oc1NlYXJjaFRlcm06IHN0cmluZykge1xuXHRpZiAoIXNTZWFyY2hUZXJtKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdHJldHVybiBzU2VhcmNoVGVybVxuXHRcdC5yZXBsYWNlKC9cIi9nLCBcIiBcIilcblx0XHQucmVwbGFjZSgvXFxcXC9nLCBcIlxcXFxcXFxcXCIpIC8vZXNjYXBlIGJhY2tzbGFzaCBjaGFyYWN0ZXJzLiBDYW4gYmUgcmVtb3ZlZCBpZiBvZGF0YS9iaW5kaW5nIGhhbmRsZXMgYmFja2VuZCBlcnJvcnMgcmVzcG9uZHMuXG5cdFx0LnNwbGl0KC9cXHMrLylcblx0XHQucmVkdWNlKGZ1bmN0aW9uIChzTm9ybWFsaXplZDogc3RyaW5nIHwgdW5kZWZpbmVkLCBzQ3VycmVudFdvcmQ6IHN0cmluZykge1xuXHRcdFx0aWYgKHNDdXJyZW50V29yZCAhPT0gXCJcIikge1xuXHRcdFx0XHRzTm9ybWFsaXplZCA9IGAke3NOb3JtYWxpemVkID8gYCR7c05vcm1hbGl6ZWR9IGAgOiBcIlwifVwiJHtzQ3VycmVudFdvcmR9XCJgO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHNOb3JtYWxpemVkO1xuXHRcdH0sIHVuZGVmaW5lZCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JDb250ZXh0UmVxdWVzdGVkKGJpbmRpbmdDb250ZXh0OiBPRGF0YVY0Q29udGV4dCkge1xuXHRjb25zdCBtb2RlbCA9IGJpbmRpbmdDb250ZXh0LmdldE1vZGVsKCk7XG5cdGNvbnN0IG1ldGFNb2RlbCA9IG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRjb25zdCBlbnRpdHlQYXRoID0gbWV0YU1vZGVsLmdldE1ldGFQYXRoKGJpbmRpbmdDb250ZXh0LmdldFBhdGgoKSk7XG5cdGNvbnN0IGRhdGFNb2RlbCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMobWV0YU1vZGVsLmdldENvbnRleHQoZW50aXR5UGF0aCkpO1xuXHRhd2FpdCBiaW5kaW5nQ29udGV4dC5yZXF1ZXN0UHJvcGVydHkoZGF0YU1vZGVsLnRhcmdldEVudGl0eVR5cGUua2V5c1swXT8ubmFtZSk7XG59XG5cbmZ1bmN0aW9uIGZuSGFzVHJhbnNpZW50Q29udGV4dHMob0xpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nKSB7XG5cdGxldCBiSGFzVHJhbnNpZW50Q29udGV4dHMgPSBmYWxzZTtcblx0aWYgKG9MaXN0QmluZGluZykge1xuXHRcdG9MaXN0QmluZGluZy5nZXRDdXJyZW50Q29udGV4dHMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvQ29udGV4dDogT0RhdGFWNENvbnRleHQpIHtcblx0XHRcdGlmIChvQ29udGV4dCAmJiBvQ29udGV4dC5pc1RyYW5zaWVudCgpKSB7XG5cdFx0XHRcdGJIYXNUcmFuc2llbnRDb250ZXh0cyA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGJIYXNUcmFuc2llbnRDb250ZXh0cztcbn1cblxuLy8gdGhlcmUgaXMgbm8gbmF2aWdhdGlvbiBpbiBlbnRpdHlTZXQgcGF0aCBhbmQgcHJvcGVydHkgcGF0aFxuXG5hc3luYyBmdW5jdGlvbiBfZ2V0U09JbnRlbnRzKFxuXHRvU2hlbGxTZXJ2aWNlSGVscGVyOiBJU2hlbGxTZXJ2aWNlcyxcblx0b09iamVjdFBhZ2VMYXlvdXQ6IE9iamVjdFBhZ2VMYXlvdXQsXG5cdG9TZW1hbnRpY09iamVjdDogdW5rbm93bixcblx0b1BhcmFtOiB1bmtub3duXG4pOiBQcm9taXNlPExpbmtEZWZpbml0aW9uW10+IHtcblx0cmV0dXJuIG9TaGVsbFNlcnZpY2VIZWxwZXIuZ2V0TGlua3Moe1xuXHRcdHNlbWFudGljT2JqZWN0OiBvU2VtYW50aWNPYmplY3QsXG5cdFx0cGFyYW1zOiBvUGFyYW1cblx0fSkgYXMgUHJvbWlzZTxMaW5rRGVmaW5pdGlvbltdPjtcbn1cblxuLy8gVE8tRE8gYWRkIHRoaXMgYXMgcGFydCBvZiBhcHBseVNlbWFudGljT2JqZWN0bWFwcGluZ3MgbG9naWMgaW4gSW50ZW50QmFzZWRuYXZpZ2F0aW9uIGNvbnRyb2xsZXIgZXh0ZW5zaW9uXG5mdW5jdGlvbiBfY3JlYXRlTWFwcGluZ3Mob01hcHBpbmc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSB7XG5cdGNvbnN0IGFTT01hcHBpbmdzID0gW107XG5cdGNvbnN0IGFNYXBwaW5nS2V5cyA9IE9iamVjdC5rZXlzKG9NYXBwaW5nKTtcblx0bGV0IG9TZW1hbnRpY01hcHBpbmc7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgYU1hcHBpbmdLZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0b1NlbWFudGljTWFwcGluZyA9IHtcblx0XHRcdExvY2FsUHJvcGVydHk6IHtcblx0XHRcdFx0JFByb3BlcnR5UGF0aDogYU1hcHBpbmdLZXlzW2ldXG5cdFx0XHR9LFxuXHRcdFx0U2VtYW50aWNPYmplY3RQcm9wZXJ0eTogb01hcHBpbmdbYU1hcHBpbmdLZXlzW2ldXVxuXHRcdH07XG5cdFx0YVNPTWFwcGluZ3MucHVzaChvU2VtYW50aWNNYXBwaW5nKTtcblx0fVxuXG5cdHJldHVybiBhU09NYXBwaW5ncztcbn1cbnR5cGUgTGlua0RlZmluaXRpb24gPSB7XG5cdGludGVudDogc3RyaW5nO1xuXHR0ZXh0OiBzdHJpbmc7XG59O1xudHlwZSBTZW1hbnRpY0l0ZW0gPSB7XG5cdHRleHQ6IHN0cmluZztcblx0dGFyZ2V0U2VtT2JqZWN0OiBzdHJpbmc7XG5cdHRhcmdldEFjdGlvbjogc3RyaW5nO1xuXHR0YXJnZXRQYXJhbXM6IHVua25vd247XG59O1xuLyoqXG4gKiBAcGFyYW0gYUxpbmtzXG4gKiBAcGFyYW0gYUV4Y2x1ZGVkQWN0aW9uc1xuICogQHBhcmFtIG9UYXJnZXRQYXJhbXNcbiAqIEBwYXJhbSBhSXRlbXNcbiAqIEBwYXJhbSBhQWxsb3dlZEFjdGlvbnNcbiAqL1xuZnVuY3Rpb24gX2dldFJlbGF0ZWRBcHBzTWVudUl0ZW1zKFxuXHRhTGlua3M6IExpbmtEZWZpbml0aW9uW10sXG5cdGFFeGNsdWRlZEFjdGlvbnM6IHVua25vd25bXSxcblx0b1RhcmdldFBhcmFtczogdW5rbm93bixcblx0YUl0ZW1zOiBTZW1hbnRpY0l0ZW1bXSxcblx0YUFsbG93ZWRBY3Rpb25zPzogdW5rbm93bltdXG4pIHtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTGlua3MubGVuZ3RoOyBpKyspIHtcblx0XHRjb25zdCBvTGluayA9IGFMaW5rc1tpXTtcblx0XHRjb25zdCBzSW50ZW50ID0gb0xpbmsuaW50ZW50O1xuXHRcdGNvbnN0IHNBY3Rpb24gPSBzSW50ZW50LnNwbGl0KFwiLVwiKVsxXS5zcGxpdChcIj9cIilbMF07XG5cdFx0aWYgKGFBbGxvd2VkQWN0aW9ucyAmJiBhQWxsb3dlZEFjdGlvbnMuaW5jbHVkZXMoc0FjdGlvbikpIHtcblx0XHRcdGFJdGVtcy5wdXNoKHtcblx0XHRcdFx0dGV4dDogb0xpbmsudGV4dCxcblx0XHRcdFx0dGFyZ2V0U2VtT2JqZWN0OiBzSW50ZW50LnNwbGl0KFwiI1wiKVsxXS5zcGxpdChcIi1cIilbMF0sXG5cdFx0XHRcdHRhcmdldEFjdGlvbjogc0FjdGlvbi5zcGxpdChcIn5cIilbMF0sXG5cdFx0XHRcdHRhcmdldFBhcmFtczogb1RhcmdldFBhcmFtc1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIGlmICghYUFsbG93ZWRBY3Rpb25zICYmIGFFeGNsdWRlZEFjdGlvbnMgJiYgYUV4Y2x1ZGVkQWN0aW9ucy5pbmRleE9mKHNBY3Rpb24pID09PSAtMSkge1xuXHRcdFx0YUl0ZW1zLnB1c2goe1xuXHRcdFx0XHR0ZXh0OiBvTGluay50ZXh0LFxuXHRcdFx0XHR0YXJnZXRTZW1PYmplY3Q6IHNJbnRlbnQuc3BsaXQoXCIjXCIpWzFdLnNwbGl0KFwiLVwiKVswXSxcblx0XHRcdFx0dGFyZ2V0QWN0aW9uOiBzQWN0aW9uLnNwbGl0KFwiflwiKVswXSxcblx0XHRcdFx0dGFyZ2V0UGFyYW1zOiBvVGFyZ2V0UGFyYW1zXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cbn1cblxudHlwZSBTZW1hbnRpY09iamVjdCA9IHtcblx0YWxsb3dlZEFjdGlvbnM/OiB1bmtub3duW107XG5cdHVuYXZhaWxhYmxlQWN0aW9ucz86IHVua25vd25bXTtcblx0c2VtYW50aWNPYmplY3Q6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHRtYXBwaW5nPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn07XG5cbmZ1bmN0aW9uIF9nZXRSZWxhdGVkSW50ZW50cyhcblx0b0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHM6IFNlbWFudGljT2JqZWN0LFxuXHRvQmluZGluZ0NvbnRleHQ6IENvbnRleHQsXG5cdGFNYW5pZmVzdFNPSXRlbXM6IFNlbWFudGljSXRlbVtdLFxuXHRhTGlua3M6IExpbmtEZWZpbml0aW9uW11cbikge1xuXHRpZiAoYUxpbmtzICYmIGFMaW5rcy5sZW5ndGggPiAwKSB7XG5cdFx0Y29uc3QgYUFsbG93ZWRBY3Rpb25zID0gb0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMuYWxsb3dlZEFjdGlvbnMgfHwgdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGFFeGNsdWRlZEFjdGlvbnMgPSBvQWRkaXRpb25hbFNlbWFudGljT2JqZWN0cy51bmF2YWlsYWJsZUFjdGlvbnMgPyBvQWRkaXRpb25hbFNlbWFudGljT2JqZWN0cy51bmF2YWlsYWJsZUFjdGlvbnMgOiBbXTtcblx0XHRjb25zdCBhU09NYXBwaW5ncyA9IG9BZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzLm1hcHBpbmcgPyBfY3JlYXRlTWFwcGluZ3Mob0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMubWFwcGluZykgOiBbXTtcblx0XHRjb25zdCBvVGFyZ2V0UGFyYW1zID0geyBuYXZpZ2F0aW9uQ29udGV4dHM6IG9CaW5kaW5nQ29udGV4dCwgc2VtYW50aWNPYmplY3RNYXBwaW5nOiBhU09NYXBwaW5ncyB9O1xuXHRcdF9nZXRSZWxhdGVkQXBwc01lbnVJdGVtcyhhTGlua3MsIGFFeGNsdWRlZEFjdGlvbnMsIG9UYXJnZXRQYXJhbXMsIGFNYW5pZmVzdFNPSXRlbXMsIGFBbGxvd2VkQWN0aW9ucyk7XG5cdH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gVGhpcyBmdW5jdGlvbiBmZXRjaGVzIHRoZSByZWxhdGVkIGludGVudHMgd2hlbiBzZW1hbnRpYyBvYmplY3QgYW5kIGFjdGlvbiBhcmUgcGFzc2VkIGZyb20gZmVFbnZpcm9ubWVudC5nZXRJbnRlbnQoKSBvbmx5IGluIGNhc2Ugb2YgTXkgSW5ib3ggaW50ZWdyYXRpb25cbiAqIEBwYXJhbSBzZW1hbnRpY09iamVjdEFuZEFjdGlvbiBUaGlzIHNwZWNpZmllcyB0aGUgc2VtYW50aWMgb2JqZWN0IGFuZCBhY3Rpb24gZm9yIGZldGNoaW5nIHRoZSBpbnRlbnRzXG4gKiBAcGFyYW0gb0JpbmRpbmdDb250ZXh0IFRoaXMgc2VwY2lmaWVzIHRoZSBiaW5kaW5nIGNvbnRleHQgZm9yIHVwZGF0aW5nIHJlbGF0ZWQgYXBwc1xuICogQHBhcmFtIGFwcENvbXBvbmVudFNPSXRlbXMgVGhpcyBpcyBhIGxpc3Qgb2Ygc2VtYW50aWMgaXRlbXMgdXNlZCBmb3IgdXBkYXRpbmcgdGhlIHJlbGF0ZWQgYXBwcyBidXR0b25cbiAqIEBwYXJhbSBhTGlua3MgVGhpcyBpcyBhbiBhcnJheSBjb21wcmlzaW5nIG9mIHJlbGF0ZWQgaW50ZW50c1xuICovXG5cbmZ1bmN0aW9uIF9nZXRSZWxhdGVkSW50ZW50c1dpdGhTZW1hbnRpY09iamVjdHNBbmRBY3Rpb24oXG5cdHNlbWFudGljT2JqZWN0QW5kQWN0aW9uOiBNeUluYm94SW50ZW50LFxuXHRvQmluZGluZ0NvbnRleHQ6IENvbnRleHQsXG5cdGFwcENvbXBvbmVudFNPSXRlbXM6IFNlbWFudGljSXRlbVtdLFxuXHRhTGlua3M6IExpbmtEZWZpbml0aW9uW11cbikge1xuXHRpZiAoYUxpbmtzLmxlbmd0aCA+IDApIHtcblx0XHRjb25zdCBhY3Rpb25zID0gW3NlbWFudGljT2JqZWN0QW5kQWN0aW9uLmFjdGlvbl07XG5cdFx0Y29uc3QgZXhjbHVkZWRBY3Rpb25zOiBbXSA9IFtdO1xuXHRcdGNvbnN0IHNvTWFwcGluZ3M6IFtdID0gW107XG5cdFx0Y29uc3QgdGFyZ2V0UGFyYW1zID0geyBuYXZpZ2F0aW9uQ29udGV4dHM6IG9CaW5kaW5nQ29udGV4dCwgc2VtYW50aWNPYmplY3RNYXBwaW5nOiBzb01hcHBpbmdzIH07XG5cdFx0X2dldFJlbGF0ZWRBcHBzTWVudUl0ZW1zKGFMaW5rcywgZXhjbHVkZWRBY3Rpb25zLCB0YXJnZXRQYXJhbXMsIGFwcENvbXBvbmVudFNPSXRlbXMsIGFjdGlvbnMpO1xuXHR9XG59XG5cbnR5cGUgU2VtYW50aWNPYmplY3RDb25maWcgPSB7XG5cdGFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHM6IFJlY29yZDxzdHJpbmcsIFNlbWFudGljT2JqZWN0Pjtcbn07XG50eXBlIFJlbGF0ZWRBcHBzQ29uZmlnID0ge1xuXHR0ZXh0OiBzdHJpbmc7XG5cdHRhcmdldFNlbU9iamVjdDogc3RyaW5nO1xuXHR0YXJnZXRBY3Rpb246IHN0cmluZztcbn07XG5hc3luYyBmdW5jdGlvbiB1cGRhdGVSZWxhdGVBcHBzTW9kZWwoXG5cdG9CaW5kaW5nQ29udGV4dDogQ29udGV4dCxcblx0b0VudHJ5OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCxcblx0b09iamVjdFBhZ2VMYXlvdXQ6IE9iamVjdFBhZ2VMYXlvdXQsXG5cdGFTZW1LZXlzOiB7ICRQcm9wZXJ0eVBhdGg6IHN0cmluZyB9W10sXG5cdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRvTWV0YVBhdGg6IHN0cmluZyxcblx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnRcbik6IFByb21pc2U8UmVsYXRlZEFwcHNDb25maWdbXT4ge1xuXHRjb25zdCBvU2hlbGxTZXJ2aWNlSGVscGVyOiBJU2hlbGxTZXJ2aWNlcyA9IGFwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdGNvbnN0IG9QYXJhbTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblx0bGV0IHNDdXJyZW50U2VtT2JqID0gXCJcIixcblx0XHRzQ3VycmVudEFjdGlvbiA9IFwiXCI7XG5cdGxldCBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucztcblx0bGV0IGFSZWxhdGVkQXBwc01lbnVJdGVtczogUmVsYXRlZEFwcHNDb25maWdbXSA9IFtdO1xuXHRsZXQgYUV4Y2x1ZGVkQWN0aW9uczogdW5rbm93bltdID0gW107XG5cdGxldCBhTWFuaWZlc3RTT0tleXM6IHN0cmluZ1tdO1xuXG5cdGFzeW5jIGZ1bmN0aW9uIGZuR2V0UGFyc2VTaGVsbEhhc2hBbmRHZXRMaW5rcygpIHtcblx0XHRjb25zdCBvUGFyc2VkVXJsID0gb1NoZWxsU2VydmljZUhlbHBlci5wYXJzZVNoZWxsSGFzaChkb2N1bWVudC5sb2NhdGlvbi5oYXNoKTtcblx0XHRzQ3VycmVudFNlbU9iaiA9IG9QYXJzZWRVcmwuc2VtYW50aWNPYmplY3Q7IC8vIEN1cnJlbnQgU2VtYW50aWMgT2JqZWN0XG5cdFx0c0N1cnJlbnRBY3Rpb24gPSBvUGFyc2VkVXJsLmFjdGlvbjtcblx0XHRyZXR1cm4gX2dldFNPSW50ZW50cyhvU2hlbGxTZXJ2aWNlSGVscGVyLCBvT2JqZWN0UGFnZUxheW91dCwgc0N1cnJlbnRTZW1PYmosIG9QYXJhbSk7XG5cdH1cblxuXHR0cnkge1xuXHRcdGlmIChvRW50cnkpIHtcblx0XHRcdGlmIChhU2VtS2V5cyAmJiBhU2VtS2V5cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgYVNlbUtleXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRjb25zdCBzU2VtS2V5ID0gYVNlbUtleXNbal0uJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHRpZiAoIW9QYXJhbVtzU2VtS2V5XSkge1xuXHRcdFx0XHRcdFx0b1BhcmFtW3NTZW1LZXldID0geyB2YWx1ZTogb0VudHJ5W3NTZW1LZXldIH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBmYWxsYmFjayB0byBUZWNobmljYWwgS2V5cyBpZiBubyBTZW1hbnRpYyBLZXkgaXMgcHJlc2VudFxuXHRcdFx0XHRjb25zdCBhVGVjaG5pY2FsS2V5cyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke29NZXRhUGF0aH0vJFR5cGUvJEtleWApO1xuXHRcdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBhVGVjaG5pY2FsS2V5cykge1xuXHRcdFx0XHRcdGNvbnN0IHNPYmpLZXkgPSBhVGVjaG5pY2FsS2V5c1trZXldO1xuXHRcdFx0XHRcdGlmICghb1BhcmFtW3NPYmpLZXldKSB7XG5cdFx0XHRcdFx0XHRvUGFyYW1bc09iaktleV0gPSB7IHZhbHVlOiBvRW50cnlbc09iaktleV0gfTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gTG9naWMgdG8gcmVhZCBhZGRpdGlvbmFsIFNPIGZyb20gbWFuaWZlc3QgYW5kIHVwZGF0ZWQgcmVsYXRlZGFwcHMgbW9kZWxcblxuXHRcdGNvbnN0IG9NYW5pZmVzdERhdGEgPSBnZXRUYXJnZXRWaWV3KG9PYmplY3RQYWdlTGF5b3V0KS5nZXRWaWV3RGF0YSgpIGFzIFNlbWFudGljT2JqZWN0Q29uZmlnO1xuXHRcdGNvbnN0IGFNYW5pZmVzdFNPSXRlbXM6IFNlbWFudGljSXRlbVtdID0gW107XG5cdFx0bGV0IHNlbWFudGljT2JqZWN0SW50ZW50cztcblx0XHRpZiAob01hbmlmZXN0RGF0YS5hZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzKSB7XG5cdFx0XHRhTWFuaWZlc3RTT0tleXMgPSBPYmplY3Qua2V5cyhvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMpO1xuXHRcdFx0Zm9yIChsZXQga2V5ID0gMDsga2V5IDwgYU1hbmlmZXN0U09LZXlzLmxlbmd0aDsga2V5KyspIHtcblx0XHRcdFx0c2VtYW50aWNPYmplY3RJbnRlbnRzID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKFxuXHRcdFx0XHRcdF9nZXRTT0ludGVudHMob1NoZWxsU2VydmljZUhlbHBlciwgb09iamVjdFBhZ2VMYXlvdXQsIGFNYW5pZmVzdFNPS2V5c1trZXldLCBvUGFyYW0pXG5cdFx0XHRcdCk7XG5cdFx0XHRcdF9nZXRSZWxhdGVkSW50ZW50cyhcblx0XHRcdFx0XHRvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHNbYU1hbmlmZXN0U09LZXlzW2tleV1dLFxuXHRcdFx0XHRcdG9CaW5kaW5nQ29udGV4dCxcblx0XHRcdFx0XHRhTWFuaWZlc3RTT0l0ZW1zLFxuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0SW50ZW50c1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGFwcENvbXBvbmVudFNPSXRlbXMgaXMgdXBkYXRlZCBpbiBjYXNlIG9mIE15IEluYm94IGludGVncmF0aW9uIHdoZW4gc2VtYW50aWMgb2JqZWN0IGFuZCBhY3Rpb24gYXJlIHBhc3NlZCBmcm9tIGZlRW52aXJvbm1lbnQuZ2V0SW50ZW50KCkgbWV0aG9kXG5cdFx0Ly8gSW4gb3RoZXIgY2FzZXMgaXQgcmVtYWlucyBhcyBhbiBlbXB0eSBsaXN0XG5cdFx0Ly8gV2UgY29uY2F0IHRoaXMgbGlzdCB0b3dhcmRzIHRoZSBlbmQgd2l0aCBhTWFuaWZlc3RTT0l0ZW1zXG5cblx0XHRjb25zdCBhcHBDb21wb25lbnRTT0l0ZW1zOiBTZW1hbnRpY0l0ZW1bXSA9IFtdO1xuXHRcdGNvbnN0IGNvbXBvbmVudERhdGE6IENvbXBvbmVudERhdGEgPSBhcHBDb21wb25lbnQuZ2V0Q29tcG9uZW50RGF0YSgpO1xuXHRcdGlmIChjb21wb25lbnREYXRhLmZlRW52aXJvbm1lbnQgJiYgY29tcG9uZW50RGF0YS5mZUVudmlyb25tZW50LmdldEludGVudCgpKSB7XG5cdFx0XHRjb25zdCBpbnRlbnQ6IE15SW5ib3hJbnRlbnQgPSBjb21wb25lbnREYXRhLmZlRW52aXJvbm1lbnQuZ2V0SW50ZW50KCk7XG5cdFx0XHRzZW1hbnRpY09iamVjdEludGVudHMgPSBhd2FpdCBQcm9taXNlLnJlc29sdmUoXG5cdFx0XHRcdF9nZXRTT0ludGVudHMob1NoZWxsU2VydmljZUhlbHBlciwgb09iamVjdFBhZ2VMYXlvdXQsIGludGVudC5zZW1hbnRpY09iamVjdCwgb1BhcmFtKVxuXHRcdFx0KTtcblx0XHRcdF9nZXRSZWxhdGVkSW50ZW50c1dpdGhTZW1hbnRpY09iamVjdHNBbmRBY3Rpb24oaW50ZW50LCBvQmluZGluZ0NvbnRleHQsIGFwcENvbXBvbmVudFNPSXRlbXMsIHNlbWFudGljT2JqZWN0SW50ZW50cyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaW50ZXJuYWxNb2RlbENvbnRleHQgPSBvT2JqZWN0UGFnZUxheW91dC5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdGNvbnN0IGFMaW5rcyA9IGF3YWl0IGZuR2V0UGFyc2VTaGVsbEhhc2hBbmRHZXRMaW5rcygpO1xuXHRcdGlmIChhTGlua3MpIHtcblx0XHRcdGlmIChhTGlua3MubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRsZXQgaXNTZW1hbnRpY09iamVjdEhhc1NhbWVUYXJnZXRJbk1hbmlmZXN0ID0gZmFsc2U7XG5cdFx0XHRcdGNvbnN0IG9UYXJnZXRQYXJhbXM6IHtcblx0XHRcdFx0XHRuYXZpZ2F0aW9uQ29udGV4dHM/OiBDb250ZXh0O1xuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0TWFwcGluZz86IE1ldGFNb2RlbFR5cGU8U2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZT5bXTtcblx0XHRcdFx0fSA9IHt9O1xuXHRcdFx0XHRjb25zdCBhQW5ub3RhdGlvbnNTT0l0ZW1zOiBTZW1hbnRpY0l0ZW1bXSA9IFtdO1xuXHRcdFx0XHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IGAke29NZXRhUGF0aH1AYDtcblx0XHRcdFx0Y29uc3Qgc0VudGl0eVR5cGVQYXRoID0gYCR7b01ldGFQYXRofS9AYDtcblx0XHRcdFx0Y29uc3Qgb0VudGl0eVNldEFubm90YXRpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0VudGl0eVNldFBhdGgpO1xuXHRcdFx0XHRvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyA9IENvbW1vblV0aWxzLmdldFNlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMob0VudGl0eVNldEFubm90YXRpb25zLCBzQ3VycmVudFNlbU9iaik7XG5cdFx0XHRcdGlmICghb1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMuYkhhc0VudGl0eVNldFNPKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0VudGl0eVR5cGVBbm5vdGF0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNFbnRpdHlUeXBlUGF0aCk7XG5cdFx0XHRcdFx0b1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMgPSBDb21tb25VdGlscy5nZXRTZW1hbnRpY09iamVjdEFubm90YXRpb25zKG9FbnRpdHlUeXBlQW5ub3RhdGlvbnMsIHNDdXJyZW50U2VtT2JqKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhRXhjbHVkZWRBY3Rpb25zID0gb1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMuYVVuYXZhaWxhYmxlQWN0aW9ucztcblx0XHRcdFx0Ly9Ta2lwIHNhbWUgYXBwbGljYXRpb24gZnJvbSBSZWxhdGVkIEFwcHNcblx0XHRcdFx0YUV4Y2x1ZGVkQWN0aW9ucy5wdXNoKHNDdXJyZW50QWN0aW9uKTtcblx0XHRcdFx0b1RhcmdldFBhcmFtcy5uYXZpZ2F0aW9uQ29udGV4dHMgPSBvQmluZGluZ0NvbnRleHQ7XG5cdFx0XHRcdG9UYXJnZXRQYXJhbXMuc2VtYW50aWNPYmplY3RNYXBwaW5nID0gb1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMuYU1hcHBpbmdzO1xuXHRcdFx0XHRfZ2V0UmVsYXRlZEFwcHNNZW51SXRlbXMoYUxpbmtzLCBhRXhjbHVkZWRBY3Rpb25zLCBvVGFyZ2V0UGFyYW1zLCBhQW5ub3RhdGlvbnNTT0l0ZW1zKTtcblxuXHRcdFx0XHRhTWFuaWZlc3RTT0l0ZW1zLmZvckVhY2goZnVuY3Rpb24gKHsgdGFyZ2V0U2VtT2JqZWN0IH0pIHtcblx0XHRcdFx0XHRpZiAoYUFubm90YXRpb25zU09JdGVtc1swXT8udGFyZ2V0U2VtT2JqZWN0ID09PSB0YXJnZXRTZW1PYmplY3QpIHtcblx0XHRcdFx0XHRcdGlzU2VtYW50aWNPYmplY3RIYXNTYW1lVGFyZ2V0SW5NYW5pZmVzdCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyByZW1vdmUgYWxsIGFjdGlvbnMgZnJvbSBjdXJyZW50IGhhc2ggYXBwbGljYXRpb24gaWYgbWFuaWZlc3QgY29udGFpbnMgZW1wdHkgYWxsb3dlZEFjdGlvbnNcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdG9NYW5pZmVzdERhdGEuYWRkaXRpb25hbFNlbWFudGljT2JqZWN0cyAmJlxuXHRcdFx0XHRcdGFBbm5vdGF0aW9uc1NPSXRlbXNbMF0gJiZcblx0XHRcdFx0XHRvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHNbYUFubm90YXRpb25zU09JdGVtc1swXS50YXJnZXRTZW1PYmplY3RdICYmXG5cdFx0XHRcdFx0ISFvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHNbYUFubm90YXRpb25zU09JdGVtc1swXS50YXJnZXRTZW1PYmplY3RdLmFsbG93ZWRBY3Rpb25zXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGlzU2VtYW50aWNPYmplY3RIYXNTYW1lVGFyZ2V0SW5NYW5pZmVzdCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3Qgc29JdGVtcyA9IGFNYW5pZmVzdFNPSXRlbXMuY29uY2F0KGFwcENvbXBvbmVudFNPSXRlbXMpO1xuXHRcdFx0XHRhUmVsYXRlZEFwcHNNZW51SXRlbXMgPSBpc1NlbWFudGljT2JqZWN0SGFzU2FtZVRhcmdldEluTWFuaWZlc3QgPyBzb0l0ZW1zIDogc29JdGVtcy5jb25jYXQoYUFubm90YXRpb25zU09JdGVtcyk7XG5cdFx0XHRcdC8vIElmIG5vIGFwcCBpbiBsaXN0LCByZWxhdGVkIGFwcHMgYnV0dG9uIHdpbGwgYmUgaGlkZGVuXG5cdFx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwicmVsYXRlZEFwcHMvdmlzaWJpbGl0eVwiLCBhUmVsYXRlZEFwcHNNZW51SXRlbXMubGVuZ3RoID4gMCk7XG5cdFx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwicmVsYXRlZEFwcHMvaXRlbXNcIiwgYVJlbGF0ZWRBcHBzTWVudUl0ZW1zKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwicmVsYXRlZEFwcHMvdmlzaWJpbGl0eVwiLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwicmVsYXRlZEFwcHMvdmlzaWJpbGl0eVwiLCBmYWxzZSk7XG5cdFx0fVxuXHR9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuXHRcdExvZy5lcnJvcihcIkNhbm5vdCByZWFkIGxpbmtzXCIsIGVycm9yIGFzIHN0cmluZyk7XG5cdH1cblx0cmV0dXJuIGFSZWxhdGVkQXBwc01lbnVJdGVtcztcbn1cblxuZnVuY3Rpb24gX2dldFNlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMob0VudGl0eUFubm90YXRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgc0N1cnJlbnRTZW1PYmo6IHN0cmluZykge1xuXHRjb25zdCBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyA9IHtcblx0XHRiSGFzRW50aXR5U2V0U086IGZhbHNlLFxuXHRcdGFBbGxvd2VkQWN0aW9uczogW10sXG5cdFx0YVVuYXZhaWxhYmxlQWN0aW9uczogW10gYXMgTWV0YU1vZGVsVHlwZTxTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucz5bXSxcblx0XHRhTWFwcGluZ3M6IFtdIGFzIE1ldGFNb2RlbFR5cGU8U2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZT5bXVxuXHR9O1xuXHRsZXQgc0Fubm90YXRpb25NYXBwaW5nVGVybSwgc0Fubm90YXRpb25BY3Rpb25UZXJtO1xuXHRsZXQgc1F1YWxpZmllcjtcblx0Zm9yIChjb25zdCBrZXkgaW4gb0VudGl0eUFubm90YXRpb25zKSB7XG5cdFx0aWYgKGtleS5pbmRleE9mKENvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdCkgPiAtMSAmJiBvRW50aXR5QW5ub3RhdGlvbnNba2V5XSA9PT0gc0N1cnJlbnRTZW1PYmopIHtcblx0XHRcdG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zLmJIYXNFbnRpdHlTZXRTTyA9IHRydWU7XG5cdFx0XHRzQW5ub3RhdGlvbk1hcHBpbmdUZXJtID0gYEAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdE1hcHBpbmd9YDtcblx0XHRcdHNBbm5vdGF0aW9uQWN0aW9uVGVybSA9IGBAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnN9YDtcblxuXHRcdFx0aWYgKGtleS5pbmRleE9mKFwiI1wiKSA+IC0xKSB7XG5cdFx0XHRcdHNRdWFsaWZpZXIgPSBrZXkuc3BsaXQoXCIjXCIpWzFdO1xuXHRcdFx0XHRzQW5ub3RhdGlvbk1hcHBpbmdUZXJtID0gYCR7c0Fubm90YXRpb25NYXBwaW5nVGVybX0jJHtzUXVhbGlmaWVyfWA7XG5cdFx0XHRcdHNBbm5vdGF0aW9uQWN0aW9uVGVybSA9IGAke3NBbm5vdGF0aW9uQWN0aW9uVGVybX0jJHtzUXVhbGlmaWVyfWA7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0VudGl0eUFubm90YXRpb25zW3NBbm5vdGF0aW9uTWFwcGluZ1Rlcm1dKSB7XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zLmFNYXBwaW5ncyA9IG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zLmFNYXBwaW5ncy5jb25jYXQoXG5cdFx0XHRcdFx0b0VudGl0eUFubm90YXRpb25zW3NBbm5vdGF0aW9uTWFwcGluZ1Rlcm1dIGFzIE1ldGFNb2RlbFR5cGU8U2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZT5cblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9FbnRpdHlBbm5vdGF0aW9uc1tzQW5ub3RhdGlvbkFjdGlvblRlcm1dKSB7XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zLmFVbmF2YWlsYWJsZUFjdGlvbnMgPSBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5hVW5hdmFpbGFibGVBY3Rpb25zLmNvbmNhdChcblx0XHRcdFx0XHRvRW50aXR5QW5ub3RhdGlvbnNbc0Fubm90YXRpb25BY3Rpb25UZXJtXSBhcyBNZXRhTW9kZWxUeXBlPFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zPlxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zO1xufVxuXG5mdW5jdGlvbiBmblVwZGF0ZVJlbGF0ZWRBcHBzRGV0YWlscyhvT2JqZWN0UGFnZUxheW91dDogT2JqZWN0UGFnZUxheW91dCwgYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IChvT2JqZWN0UGFnZUxheW91dC5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWwpLmdldE1ldGFNb2RlbCgpO1xuXHRjb25zdCBvQmluZGluZ0NvbnRleHQgPSBvT2JqZWN0UGFnZUxheW91dC5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIE9EYXRhVjRDb250ZXh0O1xuXHRjb25zdCBwYXRoID0gKG9CaW5kaW5nQ29udGV4dCAmJiBvQmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpKSB8fCBcIlwiO1xuXHRjb25zdCBvTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHBhdGgpO1xuXHQvLyBTZW1hbnRpYyBLZXkgVm9jYWJ1bGFyeVxuXHRjb25zdCBzU2VtYW50aWNLZXlWb2NhYnVsYXJ5ID0gYCR7b01ldGFQYXRofS9gICsgYEBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNLZXlgO1xuXHQvL1NlbWFudGljIEtleXNcblx0Y29uc3QgYVNlbUtleXMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzU2VtYW50aWNLZXlWb2NhYnVsYXJ5KTtcblx0Ly8gVW5hdmFpbGFibGUgQWN0aW9uc1xuXHRjb25zdCBvRW50cnkgPSBvQmluZGluZ0NvbnRleHQ/LmdldE9iamVjdCgpO1xuXHRpZiAoIW9FbnRyeSAmJiBvQmluZGluZ0NvbnRleHQpIHtcblx0XHRvQmluZGluZ0NvbnRleHRcblx0XHRcdC5yZXF1ZXN0T2JqZWN0KClcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChyZXF1ZXN0ZWRPYmplY3Q6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiBDb21tb25VdGlscy51cGRhdGVSZWxhdGVBcHBzTW9kZWwoXG5cdFx0XHRcdFx0b0JpbmRpbmdDb250ZXh0LFxuXHRcdFx0XHRcdHJlcXVlc3RlZE9iamVjdCxcblx0XHRcdFx0XHRvT2JqZWN0UGFnZUxheW91dCxcblx0XHRcdFx0XHRhU2VtS2V5cyxcblx0XHRcdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdG9NZXRhUGF0aCxcblx0XHRcdFx0XHRhcHBDb21wb25lbnRcblx0XHRcdFx0KTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogdW5rbm93bikge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgdXBkYXRlIHRoZSByZWxhdGVkIGFwcCBkZXRhaWxzXCIsIG9FcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIENvbW1vblV0aWxzLnVwZGF0ZVJlbGF0ZUFwcHNNb2RlbChvQmluZGluZ0NvbnRleHQsIG9FbnRyeSwgb09iamVjdFBhZ2VMYXlvdXQsIGFTZW1LZXlzLCBvTWV0YU1vZGVsLCBvTWV0YVBhdGgsIGFwcENvbXBvbmVudCk7XG5cdH1cbn1cblxuLyoqXG4gKiBAcGFyYW0gb0J1dHRvblxuICovXG5mdW5jdGlvbiBmbkZpcmVCdXR0b25QcmVzcyhvQnV0dG9uOiBDb250cm9sKSB7XG5cdGlmIChcblx0XHRvQnV0dG9uICYmXG5cdFx0b0J1dHRvbi5pc0E8QnV0dG9uIHwgT3ZlcmZsb3dUb29sYmFyQnV0dG9uPihbXCJzYXAubS5CdXR0b25cIiwgXCJzYXAubS5PdmVyZmxvd1Rvb2xiYXJCdXR0b25cIl0pICYmXG5cdFx0b0J1dHRvbi5nZXRWaXNpYmxlKCkgJiZcblx0XHRvQnV0dG9uLmdldEVuYWJsZWQoKVxuXHQpIHtcblx0XHRvQnV0dG9uLmZpcmVQcmVzcygpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEFwcENvbXBvbmVudChvQ29udHJvbDogQ29udHJvbCB8IENvbXBvbmVudCk6IEFwcENvbXBvbmVudCB7XG5cdGlmIChvQ29udHJvbC5pc0E8QXBwQ29tcG9uZW50PihcInNhcC5mZS5jb3JlLkFwcENvbXBvbmVudFwiKSkge1xuXHRcdHJldHVybiBvQ29udHJvbDtcblx0fVxuXHRjb25zdCBvT3duZXIgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob0NvbnRyb2wpO1xuXHRpZiAoIW9Pd25lcikge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlRoZXJlIHNob3VsZCBiZSBhIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudCBhcyBvd25lciBvZiB0aGUgY29udHJvbFwiKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZ2V0QXBwQ29tcG9uZW50KG9Pd25lcik7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudFBhZ2VWaWV3KG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCkge1xuXHRjb25zdCByb290Vmlld0NvbnRyb2xsZXIgPSBvQXBwQ29tcG9uZW50LmdldFJvb3RWaWV3Q29udHJvbGxlcigpO1xuXHRyZXR1cm4gcm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpXG5cdFx0PyByb290Vmlld0NvbnRyb2xsZXIuZ2V0UmlnaHRtb3N0VmlldygpXG5cdFx0OiBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KChvQXBwQ29tcG9uZW50LmdldFJvb3RDb250YWluZXIoKSBhcyBOYXZDb250YWluZXIpLmdldEN1cnJlbnRQYWdlKCkpO1xufVxuXG5mdW5jdGlvbiBnZXRUYXJnZXRWaWV3KG9Db250cm9sOiBNYW5hZ2VkT2JqZWN0IHwgbnVsbCk6IEZFVmlldyB7XG5cdGlmIChvQ29udHJvbCAmJiBvQ29udHJvbC5pc0E8Q29tcG9uZW50Q29udGFpbmVyPihcInNhcC51aS5jb3JlLkNvbXBvbmVudENvbnRhaW5lclwiKSkge1xuXHRcdGNvbnN0IG9Db21wb25lbnQgPSBvQ29udHJvbC5nZXRDb21wb25lbnRJbnN0YW5jZSgpO1xuXHRcdG9Db250cm9sID0gb0NvbXBvbmVudCAmJiBvQ29tcG9uZW50LmdldFJvb3RDb250cm9sKCk7XG5cdH1cblx0d2hpbGUgKG9Db250cm9sICYmICFvQ29udHJvbC5pc0E8RkVWaWV3PihcInNhcC51aS5jb3JlLm12Yy5WaWV3XCIpKSB7XG5cdFx0b0NvbnRyb2wgPSBvQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0fVxuXHRyZXR1cm4gb0NvbnRyb2whO1xufVxuXG5mdW5jdGlvbiBfZm5DaGVja0lzTWF0Y2gob09iamVjdDogb2JqZWN0LCBvS2V5c1RvQ2hlY2s6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSB7XG5cdGZvciAoY29uc3Qgc0tleSBpbiBvS2V5c1RvQ2hlY2spIHtcblx0XHRpZiAob0tleXNUb0NoZWNrW3NLZXldICE9PSBvT2JqZWN0W3NLZXkgYXMga2V5b2YgdHlwZW9mIG9PYmplY3RdKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBmbkdldENvbnRleHRQYXRoUHJvcGVydGllcyhcblx0bWV0YU1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsXG5cdHNDb250ZXh0UGF0aDogc3RyaW5nLFxuXHRvRmlsdGVyPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbik6IFJlY29yZDxzdHJpbmcsIE1ldGFNb2RlbFByb3BlcnR5PiB8IFJlY29yZDxzdHJpbmcsIE1ldGFNb2RlbE5hdlByb3BlcnR5PiB7XG5cdGNvbnN0IG9FbnRpdHlUeXBlOiBNZXRhTW9kZWxFbnRpdHlUeXBlID0gKG1ldGFNb2RlbENvbnRleHQuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vYCkgfHwge30pIGFzIE1ldGFNb2RlbEVudGl0eVR5cGUsXG5cdFx0b1Byb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIE1ldGFNb2RlbFByb3BlcnR5PiB8IFJlY29yZDxzdHJpbmcsIE1ldGFNb2RlbE5hdlByb3BlcnR5PiA9IHt9O1xuXG5cdGZvciAoY29uc3Qgc0tleSBpbiBvRW50aXR5VHlwZSkge1xuXHRcdGlmIChcblx0XHRcdG9FbnRpdHlUeXBlLmhhc093blByb3BlcnR5KHNLZXkpICYmXG5cdFx0XHQhL15cXCQvaS50ZXN0KHNLZXkpICYmXG5cdFx0XHRvRW50aXR5VHlwZVtzS2V5XS4ka2luZCAmJlxuXHRcdFx0X2ZuQ2hlY2tJc01hdGNoKG9FbnRpdHlUeXBlW3NLZXldLCBvRmlsdGVyIHx8IHsgJGtpbmQ6IFwiUHJvcGVydHlcIiB9KVxuXHRcdCkge1xuXHRcdFx0b1Byb3BlcnRpZXNbc0tleV0gPSBvRW50aXR5VHlwZVtzS2V5XTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9Qcm9wZXJ0aWVzO1xufVxuXG5mdW5jdGlvbiBmbkdldE1hbmRhdG9yeUZpbHRlckZpZWxkcyhvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgc0NvbnRleHRQYXRoOiBzdHJpbmcpIHtcblx0bGV0IGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHM6IEV4cGFuZFBhdGhUeXBlPEVkbS5Qcm9wZXJ0eVBhdGg+W10gPSBbXTtcblx0aWYgKG9NZXRhTW9kZWwgJiYgc0NvbnRleHRQYXRoKSB7XG5cdFx0YU1hbmRhdG9yeUZpbHRlckZpZWxkcyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0YCR7c0NvbnRleHRQYXRofUBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlclJlc3RyaWN0aW9ucy9SZXF1aXJlZFByb3BlcnRpZXNgXG5cdFx0KSBhcyBFeHBhbmRQYXRoVHlwZTxFZG0uUHJvcGVydHlQYXRoPltdO1xuXHR9XG5cdHJldHVybiBhTWFuZGF0b3J5RmlsdGVyRmllbGRzO1xufVxuXG5mdW5jdGlvbiBmbkdldElCTkFjdGlvbnMob0NvbnRyb2w6IFRhYmxlIHwgT2JqZWN0UGFnZUR5bmFtaWNIZWFkZXJUaXRsZSwgYUlCTkFjdGlvbnM6IHVua25vd25bXSkge1xuXHRjb25zdCBhQWN0aW9ucyA9IG9Db250cm9sICYmIG9Db250cm9sLmdldEFjdGlvbnMoKTtcblx0aWYgKGFBY3Rpb25zKSB7XG5cdFx0YUFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob0FjdGlvbikge1xuXHRcdFx0aWYgKG9BY3Rpb24uaXNBPEFjdGlvblRvb2xiYXJBY3Rpb24+KFwic2FwLnVpLm1kYy5hY3Rpb250b29sYmFyLkFjdGlvblRvb2xiYXJBY3Rpb25cIikpIHtcblx0XHRcdFx0b0FjdGlvbiA9IG9BY3Rpb24uZ2V0QWN0aW9uKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0FjdGlvbi5pc0E8TWVudUJ1dHRvbj4oXCJzYXAubS5NZW51QnV0dG9uXCIpKSB7XG5cdFx0XHRcdGNvbnN0IG9NZW51ID0gb0FjdGlvbi5nZXRNZW51KCk7XG5cdFx0XHRcdGNvbnN0IGFJdGVtcyA9IG9NZW51LmdldEl0ZW1zKCk7XG5cdFx0XHRcdGFJdGVtcy5mb3JFYWNoKChvSXRlbSkgPT4ge1xuXHRcdFx0XHRcdGlmIChvSXRlbS5kYXRhKFwiSUJORGF0YVwiKSkge1xuXHRcdFx0XHRcdFx0YUlCTkFjdGlvbnMucHVzaChvSXRlbSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAob0FjdGlvbi5kYXRhKFwiSUJORGF0YVwiKSkge1xuXHRcdFx0XHRhSUJOQWN0aW9ucy5wdXNoKG9BY3Rpb24pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhSUJOQWN0aW9ucztcbn1cblxuLyoqXG4gKiBAcGFyYW0gYUlCTkFjdGlvbnNcbiAqIEBwYXJhbSBvVmlld1xuICovXG5mdW5jdGlvbiBmblVwZGF0ZURhdGFGaWVsZEZvcklCTkJ1dHRvbnNWaXNpYmlsaXR5KGFJQk5BY3Rpb25zOiBDb250cm9sW10sIG9WaWV3OiBWaWV3KSB7XG5cdGNvbnN0IG9QYXJhbXM6IFJlY29yZDxzdHJpbmcsIHsgdmFsdWU6IHVua25vd24gfT4gPSB7fTtcblx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvVmlldyk7XG5cdGNvbnN0IGlzU3RpY2t5ID0gTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKChvVmlldy5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWwpLmdldE1ldGFNb2RlbCgpKTtcblx0Y29uc3QgZm5HZXRMaW5rcyA9IGZ1bmN0aW9uIChvRGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkKSB7XG5cdFx0aWYgKG9EYXRhKSB7XG5cdFx0XHRjb25zdCBhS2V5cyA9IE9iamVjdC5rZXlzKG9EYXRhKTtcblx0XHRcdGFLZXlzLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IHN0cmluZykge1xuXHRcdFx0XHRpZiAoc0tleS5pbmRleE9mKFwiX1wiKSAhPT0gMCAmJiBzS2V5LmluZGV4T2YoXCJvZGF0YS5jb250ZXh0XCIpID09PSAtMSkge1xuXHRcdFx0XHRcdG9QYXJhbXNbc0tleV0gPSB7IHZhbHVlOiBvRGF0YVtzS2V5XSB9O1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0aWYgKGFJQk5BY3Rpb25zLmxlbmd0aCkge1xuXHRcdFx0YUlCTkFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob0lCTkFjdGlvbikge1xuXHRcdFx0XHRjb25zdCBzU2VtYW50aWNPYmplY3QgPSBvSUJOQWN0aW9uLmRhdGEoXCJJQk5EYXRhXCIpLnNlbWFudGljT2JqZWN0O1xuXHRcdFx0XHRjb25zdCBzQWN0aW9uID0gb0lCTkFjdGlvbi5kYXRhKFwiSUJORGF0YVwiKS5hY3Rpb247XG5cdFx0XHRcdG9BcHBDb21wb25lbnRcblx0XHRcdFx0XHQuZ2V0U2hlbGxTZXJ2aWNlcygpXG5cdFx0XHRcdFx0LmdldExpbmtzKHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBzU2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRhY3Rpb246IHNBY3Rpb24sXG5cdFx0XHRcdFx0XHRwYXJhbXM6IG9QYXJhbXNcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChhTGluaykge1xuXHRcdFx0XHRcdFx0b0lCTkFjdGlvbi5zZXRWaXNpYmxlKG9JQk5BY3Rpb24uZ2V0VmlzaWJsZSgpICYmIGFMaW5rICYmIGFMaW5rLmxlbmd0aCA9PT0gMSk7XG5cdFx0XHRcdFx0XHRpZiAoaXNTdGlja3kpIHtcblx0XHRcdFx0XHRcdFx0KG9JQk5BY3Rpb24uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCkuc2V0UHJvcGVydHkoXG5cdFx0XHRcdFx0XHRcdFx0b0lCTkFjdGlvbi5nZXRJZCgpLnNwbGl0KFwiLS1cIilbMV0sXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0c2hlbGxOYXZpZ2F0aW9uTm90QXZhaWxhYmxlOiAhKGFMaW5rICYmIGFMaW5rLmxlbmd0aCA9PT0gMSlcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogdW5rbm93bikge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IHJldHJpZXZlIHRoZSBsaW5rcyBmcm9tIHRoZSBzaGVsbCBzZXJ2aWNlXCIsIG9FcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xuXHRpZiAob1ZpZXcgJiYgb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdChvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIE9EYXRhVjRDb250ZXh0KVxuXHRcdFx0Py5yZXF1ZXN0T2JqZWN0KClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChvRGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQpIHtcblx0XHRcdFx0cmV0dXJuIGZuR2V0TGlua3Mob0RhdGEpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiB1bmtub3duKSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkNhbm5vdCByZXRyaWV2ZSB0aGUgbGlua3MgZnJvbSB0aGUgc2hlbGwgc2VydmljZVwiLCBvRXJyb3IgYXMgc3RyaW5nKTtcblx0XHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGZuR2V0TGlua3MoKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRBY3Rpb25QYXRoKGFjdGlvbkNvbnRleHQ6IENvbnRleHQsIGJSZXR1cm5Pbmx5UGF0aDogYm9vbGVhbiwgaW5BY3Rpb25OYW1lPzogc3RyaW5nLCBiQ2hlY2tTdGF0aWNWYWx1ZT86IGJvb2xlYW4pIHtcblx0Y29uc3Qgc0FjdGlvbk5hbWU6IHN0cmluZyA9ICFpbkFjdGlvbk5hbWUgPyBhY3Rpb25Db250ZXh0LmdldE9iamVjdChhY3Rpb25Db250ZXh0LmdldFBhdGgoKSkudG9TdHJpbmcoKSA6IGluQWN0aW9uTmFtZTtcblx0bGV0IHNDb250ZXh0UGF0aCA9IGFjdGlvbkNvbnRleHQuZ2V0UGF0aCgpLnNwbGl0KFwiL0BcIilbMF07XG5cdGNvbnN0IHNFbnRpdHlUeXBlTmFtZSA9IChhY3Rpb25Db250ZXh0LmdldE9iamVjdChzQ29udGV4dFBhdGgpIGFzIE1ldGFNb2RlbEVudGl0eVR5cGUpLiRUeXBlO1xuXHRjb25zdCBzRW50aXR5TmFtZSA9IGdldEVudGl0eVNldE5hbWUoYWN0aW9uQ29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsLCBzRW50aXR5VHlwZU5hbWUpO1xuXHRpZiAoc0VudGl0eU5hbWUpIHtcblx0XHRzQ29udGV4dFBhdGggPSBgLyR7c0VudGl0eU5hbWV9YDtcblx0fVxuXHRpZiAoYkNoZWNrU3RhdGljVmFsdWUpIHtcblx0XHRyZXR1cm4gYWN0aW9uQ29udGV4dC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofS8ke3NBY3Rpb25OYW1lfUBPcmcuT0RhdGEuQ29yZS5WMS5PcGVyYXRpb25BdmFpbGFibGVgKTtcblx0fVxuXHRpZiAoYlJldHVybk9ubHlQYXRoKSB7XG5cdFx0cmV0dXJuIGAke3NDb250ZXh0UGF0aH0vJHtzQWN0aW9uTmFtZX1gO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzQ29udGV4dFBhdGg6IHNDb250ZXh0UGF0aCxcblx0XHRcdHNQcm9wZXJ0eTogYWN0aW9uQ29udGV4dC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofS8ke3NBY3Rpb25OYW1lfUBPcmcuT0RhdGEuQ29yZS5WMS5PcGVyYXRpb25BdmFpbGFibGUvJFBhdGhgKSxcblx0XHRcdHNCaW5kaW5nUGFyYW1ldGVyOiBhY3Rpb25Db250ZXh0LmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9LyR7c0FjdGlvbk5hbWV9L0AkdWk1Lm92ZXJsb2FkLzAvJFBhcmFtZXRlci8wLyROYW1lYClcblx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEVudGl0eVNldE5hbWUob01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIHNFbnRpdHlUeXBlOiBzdHJpbmcpIHtcblx0Y29uc3Qgb0VudGl0eUNvbnRhaW5lciA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFwiL1wiKTtcblx0Zm9yIChjb25zdCBrZXkgaW4gb0VudGl0eUNvbnRhaW5lcikge1xuXHRcdGlmICh0eXBlb2Ygb0VudGl0eUNvbnRhaW5lcltrZXldID09PSBcIm9iamVjdFwiICYmIG9FbnRpdHlDb250YWluZXJba2V5XS4kVHlwZSA9PT0gc0VudGl0eVR5cGUpIHtcblx0XHRcdHJldHVybiBrZXk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVEaXNwbGF5TW9kZShvUHJvcGVydHlBbm5vdGF0aW9uczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIG9Db2xsZWN0aW9uQW5ub3RhdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuXHRjb25zdCBvVGV4dEFubm90YXRpb24gPSBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXSxcblx0XHRvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA9IChvVGV4dEFubm90YXRpb24gJiZcblx0XHRcdCgob1Byb3BlcnR5QW5ub3RhdGlvbnMgJiZcblx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCJdKSB8fFxuXHRcdFx0XHQob0NvbGxlY3Rpb25Bbm5vdGF0aW9ucyAmJlxuXHRcdFx0XHRcdG9Db2xsZWN0aW9uQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCJdKSkpIGFzIE1ldGFNb2RlbEVudW08VGV4dEFycmFuZ2VtZW50PjtcblxuXHRpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24pIHtcblx0XHRpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0T25seVwiKSB7XG5cdFx0XHRyZXR1cm4gXCJEZXNjcmlwdGlvblwiO1xuXHRcdH0gZWxzZSBpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0TGFzdFwiKSB7XG5cdFx0XHRyZXR1cm4gXCJWYWx1ZURlc2NyaXB0aW9uXCI7XG5cdFx0fSBlbHNlIGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRTZXBhcmF0ZVwiKSB7XG5cdFx0XHRyZXR1cm4gXCJWYWx1ZVwiO1xuXHRcdH1cblx0XHQvL0RlZmF1bHQgc2hvdWxkIGJlIFRleHRGaXJzdCBpZiB0aGVyZSBpcyBhIFRleHQgYW5ub3RhdGlvbiBhbmQgbmVpdGhlciBUZXh0T25seSBub3IgVGV4dExhc3QgYXJlIHNldFxuXHRcdHJldHVybiBcIkRlc2NyaXB0aW9uVmFsdWVcIjtcblx0fVxuXHRyZXR1cm4gb1RleHRBbm5vdGF0aW9uID8gXCJEZXNjcmlwdGlvblZhbHVlXCIgOiBcIlZhbHVlXCI7XG59XG5cbmZ1bmN0aW9uIF9nZXRFbnRpdHlUeXBlKG9Db250ZXh0OiBPRGF0YVY0Q29udGV4dCkge1xuXHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0cmV0dXJuIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke29NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKX0vJFR5cGVgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gX3JlcXVlc3RPYmplY3Qoc0FjdGlvbjogc3RyaW5nLCBvU2VsZWN0ZWRDb250ZXh0OiBPRGF0YVY0Q29udGV4dCwgc1Byb3BlcnR5OiBzdHJpbmcpIHtcblx0bGV0IG9Db250ZXh0ID0gb1NlbGVjdGVkQ29udGV4dDtcblx0Y29uc3QgbkJyYWNrZXRJbmRleCA9IHNBY3Rpb24uaW5kZXhPZihcIihcIik7XG5cblx0aWYgKG5CcmFja2V0SW5kZXggPiAtMSkge1xuXHRcdGNvbnN0IHNUYXJnZXRUeXBlID0gc0FjdGlvbi5zbGljZShuQnJhY2tldEluZGV4ICsgMSwgLTEpO1xuXHRcdGxldCBzQ3VycmVudFR5cGUgPSBfZ2V0RW50aXR5VHlwZShvQ29udGV4dCk7XG5cblx0XHR3aGlsZSAoc0N1cnJlbnRUeXBlICE9PSBzVGFyZ2V0VHlwZSkge1xuXHRcdFx0Ly8gRmluZCBwYXJlbnQgYmluZGluZyBjb250ZXh0IGFuZCByZXRyaWV2ZSBlbnRpdHkgdHlwZVxuXHRcdFx0b0NvbnRleHQgPSBvQ29udGV4dC5nZXRCaW5kaW5nKCkuZ2V0Q29udGV4dCgpIGFzIE9EYXRhVjRDb250ZXh0O1xuXHRcdFx0aWYgKG9Db250ZXh0KSB7XG5cdFx0XHRcdHNDdXJyZW50VHlwZSA9IF9nZXRFbnRpdHlUeXBlKG9Db250ZXh0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdExvZy53YXJuaW5nKFwiQ2Fubm90IGRldGVybWluZSB0YXJnZXQgdHlwZSB0byByZXF1ZXN0IHByb3BlcnR5IHZhbHVlIGZvciBib3VuZCBhY3Rpb24gaW52b2NhdGlvblwiKTtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBvQ29udGV4dC5yZXF1ZXN0T2JqZWN0KHNQcm9wZXJ0eSk7XG59XG5cbmV4cG9ydCB0eXBlIF9SZXF1ZXN0ZWRQcm9wZXJ0eSA9IHtcblx0dlByb3BlcnR5VmFsdWU6IHVua25vd247XG5cdG9TZWxlY3RlZENvbnRleHQ6IENvbnRleHQ7XG5cdHNBY3Rpb246IHN0cmluZztcblx0c0R5bmFtaWNBY3Rpb25FbmFibGVkUGF0aDogc3RyaW5nO1xufTtcbmFzeW5jIGZ1bmN0aW9uIHJlcXVlc3RQcm9wZXJ0eShcblx0b1NlbGVjdGVkQ29udGV4dDogT0RhdGFWNENvbnRleHQsXG5cdHNBY3Rpb246IHN0cmluZyxcblx0c1Byb3BlcnR5OiBzdHJpbmcsXG5cdHNEeW5hbWljQWN0aW9uRW5hYmxlZFBhdGg6IHN0cmluZ1xuKTogUHJvbWlzZTxfUmVxdWVzdGVkUHJvcGVydHk+IHtcblx0Y29uc3Qgb1Byb21pc2UgPVxuXHRcdHNQcm9wZXJ0eSAmJiBzUHJvcGVydHkuaW5kZXhPZihcIi9cIikgPT09IDBcblx0XHRcdD8gcmVxdWVzdFNpbmdsZXRvblByb3BlcnR5KHNQcm9wZXJ0eSwgb1NlbGVjdGVkQ29udGV4dC5nZXRNb2RlbCgpKVxuXHRcdFx0OiBfcmVxdWVzdE9iamVjdChzQWN0aW9uLCBvU2VsZWN0ZWRDb250ZXh0LCBzUHJvcGVydHkpO1xuXG5cdHJldHVybiBvUHJvbWlzZS50aGVuKGZ1bmN0aW9uICh2UHJvcGVydHlWYWx1ZTogdW5rbm93bikge1xuXHRcdHJldHVybiB7XG5cdFx0XHR2UHJvcGVydHlWYWx1ZTogdlByb3BlcnR5VmFsdWUsXG5cdFx0XHRvU2VsZWN0ZWRDb250ZXh0OiBvU2VsZWN0ZWRDb250ZXh0LFxuXHRcdFx0c0FjdGlvbjogc0FjdGlvbixcblx0XHRcdHNEeW5hbWljQWN0aW9uRW5hYmxlZFBhdGg6IHNEeW5hbWljQWN0aW9uRW5hYmxlZFBhdGhcblx0XHR9O1xuXHR9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0Q29udGV4dHNCYXNlZE9uT3BlcmF0aW9uQXZhaWxhYmxlKFxuXHRvSW50ZXJuYWxNb2RlbENvbnRleHQ6IEludGVybmFsTW9kZWxDb250ZXh0LFxuXHRhUmVxdWVzdFByb21pc2VzOiBQcm9taXNlPF9SZXF1ZXN0ZWRQcm9wZXJ0eT5bXVxuKSB7XG5cdHJldHVybiBQcm9taXNlLmFsbChhUmVxdWVzdFByb21pc2VzKVxuXHRcdC50aGVuKGZ1bmN0aW9uIChhUmVzdWx0cykge1xuXHRcdFx0aWYgKGFSZXN1bHRzLmxlbmd0aCkge1xuXHRcdFx0XHRjb25zdCBhQXBwbGljYWJsZUNvbnRleHRzOiB1bmtub3duW10gPSBbXSxcblx0XHRcdFx0XHRhTm90QXBwbGljYWJsZUNvbnRleHRzOiB1bmtub3duW10gPSBbXTtcblx0XHRcdFx0YVJlc3VsdHMuZm9yRWFjaChmdW5jdGlvbiAoYVJlc3VsdCkge1xuXHRcdFx0XHRcdGlmIChhUmVzdWx0KSB7XG5cdFx0XHRcdFx0XHRpZiAoYVJlc3VsdC52UHJvcGVydHlWYWx1ZSkge1xuXHRcdFx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0TW9kZWwoKS5zZXRQcm9wZXJ0eShhUmVzdWx0LnNEeW5hbWljQWN0aW9uRW5hYmxlZFBhdGgsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHRhQXBwbGljYWJsZUNvbnRleHRzLnB1c2goYVJlc3VsdC5vU2VsZWN0ZWRDb250ZXh0KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGFOb3RBcHBsaWNhYmxlQ29udGV4dHMucHVzaChhUmVzdWx0Lm9TZWxlY3RlZENvbnRleHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdHNldER5bmFtaWNBY3Rpb25Db250ZXh0cyhvSW50ZXJuYWxNb2RlbENvbnRleHQsIGFSZXN1bHRzWzBdLnNBY3Rpb24sIGFBcHBsaWNhYmxlQ29udGV4dHMsIGFOb3RBcHBsaWNhYmxlQ29udGV4dHMpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IHVua25vd24pIHtcblx0XHRcdExvZy50cmFjZShcIkNhbm5vdCByZXRyaWV2ZSBwcm9wZXJ0eSB2YWx1ZSBmcm9tIHBhdGhcIiwgb0Vycm9yIGFzIHN0cmluZyk7XG5cdFx0fSk7XG59XG5cbi8qKlxuICogQHBhcmFtIG9JbnRlcm5hbE1vZGVsQ29udGV4dFxuICogQHBhcmFtIHNBY3Rpb25cbiAqIEBwYXJhbSBhQXBwbGljYWJsZVxuICogQHBhcmFtIGFOb3RBcHBsaWNhYmxlXG4gKi9cbmZ1bmN0aW9uIHNldER5bmFtaWNBY3Rpb25Db250ZXh0cyhcblx0b0ludGVybmFsTW9kZWxDb250ZXh0OiBJbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0c0FjdGlvbjogc3RyaW5nLFxuXHRhQXBwbGljYWJsZTogdW5rbm93bltdLFxuXHRhTm90QXBwbGljYWJsZTogdW5rbm93bltdXG4pIHtcblx0Y29uc3Qgc0R5bmFtaWNBY3Rpb25QYXRoUHJlZml4ID0gYCR7b0ludGVybmFsTW9kZWxDb250ZXh0LmdldFBhdGgoKX0vZHluYW1pY0FjdGlvbnMvJHtzQWN0aW9ufWAsXG5cdFx0b0ludGVybmFsTW9kZWwgPSBvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0TW9kZWwoKTtcblx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoYCR7c0R5bmFtaWNBY3Rpb25QYXRoUHJlZml4fS9hQXBwbGljYWJsZWAsIGFBcHBsaWNhYmxlKTtcblx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoYCR7c0R5bmFtaWNBY3Rpb25QYXRoUHJlZml4fS9hTm90QXBwbGljYWJsZWAsIGFOb3RBcHBsaWNhYmxlKTtcbn1cblxuZnVuY3Rpb24gX2dldERlZmF1bHRPcGVyYXRvcnMoc1Byb3BlcnR5VHlwZT86IHN0cmluZykge1xuXHQvLyBtZGMgZGVmaW5lcyB0aGUgZnVsbCBzZXQgb2Ygb3BlcmF0aW9ucyB0aGF0IGFyZSBtZWFuaW5nZnVsIGZvciBlYWNoIEVkbSBUeXBlXG5cdC8vIFRPRE8gUmVwbGFjZSB3aXRoIG1vZGVsIC8gaW50ZXJuYWwgd2F5IG9mIHJldHJpZXZpbmcgdGhlIGFjdHVhbCBtb2RlbCB0eXBlIHVzZWQgZm9yIHRoZSBwcm9wZXJ0eVxuXHRjb25zdCBvRGF0YUNsYXNzID0gVHlwZVV0aWwuZ2V0RGF0YVR5cGVDbGFzc05hbWUoc1Byb3BlcnR5VHlwZSk7XG5cdC8vIFRPRE8gbmVlZCB0byBwYXNzIHByb3BlciBmb3JtYXRPcHRpb25zLCBjb25zdHJhaW50cyBoZXJlXG5cdGNvbnN0IG9CYXNlVHlwZSA9IFR5cGVVdGlsLmdldEJhc2VUeXBlKG9EYXRhQ2xhc3MsIHt9LCB7fSk7XG5cdHJldHVybiBGaWx0ZXJPcGVyYXRvclV0aWwuZ2V0T3BlcmF0b3JzRm9yVHlwZShvQmFzZVR5cGUpO1xufVxuXG5mdW5jdGlvbiBfZ2V0UmVzdHJpY3Rpb25zKGFEZWZhdWx0T3BzOiBzdHJpbmdbXSwgYUV4cHJlc3Npb25PcHM6IHN0cmluZ1tdKTogc3RyaW5nW10ge1xuXHQvLyBGcm9tIHRoZSBkZWZhdWx0IHNldCBvZiBPcGVyYXRvcnMgZm9yIHRoZSBCYXNlIFR5cGUsIHNlbGVjdCB0aG9zZSB0aGF0IGFyZSBkZWZpbmVkIGluIHRoZSBBbGxvd2VkIFZhbHVlLlxuXHQvLyBJbiBjYXNlIHRoYXQgbm8gb3BlcmF0b3JzIGFyZSBmb3VuZCwgcmV0dXJuIHVuZGVmaW5lZCBzbyB0aGF0IHRoZSBkZWZhdWx0IHNldCBpcyB1c2VkLlxuXHRyZXR1cm4gYURlZmF1bHRPcHMuZmlsdGVyKGZ1bmN0aW9uIChzRWxlbWVudCkge1xuXHRcdHJldHVybiBhRXhwcmVzc2lvbk9wcy5pbmRleE9mKHNFbGVtZW50KSA+IC0xO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbihhRXhwcmVzc2lvbnM6IHN0cmluZ1tdKSB7XG5cdGNvbnN0IGFBbGxvd2VkRXhwcmVzc2lvbnNQcmlvcml0eSA9IENvbW1vblV0aWxzLkFsbG93ZWRFeHByZXNzaW9uc1ByaW87XG5cblx0YUV4cHJlc3Npb25zLnNvcnQoZnVuY3Rpb24gKGE6IHN0cmluZywgYjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIGFBbGxvd2VkRXhwcmVzc2lvbnNQcmlvcml0eS5pbmRleE9mKGEpIC0gYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5LmluZGV4T2YoYik7XG5cdH0pO1xuXG5cdHJldHVybiBhRXhwcmVzc2lvbnNbMF07XG59XG5cbi8qKlxuICogTWV0aG9kIHRvIGZldGNoIHRoZSBjb3JyZWN0IG9wZXJhdG9ycyBiYXNlZCBvbiB0aGUgZmlsdGVyIHJlc3RyaWN0aW9ucyB0aGF0IGNhbiBiZSBhbm5vdGF0ZWQgb24gYW4gZW50aXR5IHNldCBvciBhIG5hdmlnYXRpb24gcHJvcGVydHkuXG4gKiBXZSByZXR1cm4gdGhlIGNvcnJlY3Qgb3BlcmF0b3JzIGJhc2VkIG9uIHRoZSBzcGVjaWZpZWQgcmVzdHJpY3Rpb24gYW5kIGFsc28gY2hlY2sgZm9yIHRoZSBvcGVyYXRvcnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QgdG8gaW5jbHVkZSBvciBleGNsdWRlIHRoZW0uXG4gKlxuICogQHBhcmFtIHNQcm9wZXJ0eSBTdHJpbmcgbmFtZSBvZiB0aGUgcHJvcGVydHlcbiAqIEBwYXJhbSBzRW50aXR5U2V0UGF0aCBTdHJpbmcgcGF0aCB0byB0aGUgZW50aXR5IHNldFxuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdXNlZCBkdXJpbmcgdGVtcGxhdGluZ1xuICogQHBhcmFtIHNUeXBlIFN0cmluZyBkYXRhIHR5cGUgb2QgdGhlIHByb3BlcnR5LCBmb3IgZXhhbXBsZSBlZG0uRGF0ZVxuICogQHBhcmFtIGJVc2VTZW1hbnRpY0RhdGVSYW5nZSBCb29sZWFuIHBhc3NlZCBmcm9tIHRoZSBtYW5pZmVzdCBmb3Igc2VtYW50aWMgZGF0ZSByYW5nZVxuICogQHBhcmFtIHNTZXR0aW5ncyBTdHJpbmdpZmllZCBvYmplY3Qgb2YgdGhlIHByb3BlcnR5IHNldHRpbmdzXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBzdHJpbmdzIHJlcHJlc2VudGluZyBvcGVyYXRvcnMgZm9yIGZpbHRlcmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkoXG5cdHNQcm9wZXJ0eTogc3RyaW5nLFxuXHRzRW50aXR5U2V0UGF0aDogc3RyaW5nLFxuXHRvQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsXG5cdHNUeXBlPzogc3RyaW5nLFxuXHRiVXNlU2VtYW50aWNEYXRlUmFuZ2U/OiBib29sZWFuIHwgc3RyaW5nLFxuXHRzU2V0dGluZ3M/OiBzdHJpbmdcbik6IHN0cmluZ1tdIHtcblx0Y29uc3Qgb0ZpbHRlclJlc3RyaWN0aW9ucyA9IENvbW1vblV0aWxzLmdldEZpbHRlclJlc3RyaWN0aW9uc0J5UGF0aChzRW50aXR5U2V0UGF0aCwgb0NvbnRleHQpO1xuXHRjb25zdCBhRXF1YWxzT3BzID0gW1wiRVFcIl07XG5cdGNvbnN0IGFTaW5nbGVSYW5nZU9wcyA9IFtcIkVRXCIsIFwiR0VcIiwgXCJMRVwiLCBcIkxUXCIsIFwiR1RcIiwgXCJCVFwiLCBcIk5PVExFXCIsIFwiTk9UTFRcIiwgXCJOT1RHRVwiLCBcIk5PVEdUXCJdO1xuXHRjb25zdCBhU2luZ2xlUmFuZ2VEVEJhc2ljT3BzID0gW1wiRVFcIiwgXCJCVFwiXTtcblx0Y29uc3QgYVNpbmdsZVZhbHVlRGF0ZU9wcyA9IFtcblx0XHRcIlRPREFZXCIsXG5cdFx0XCJUT01PUlJPV1wiLFxuXHRcdFwiWUVTVEVSREFZXCIsXG5cdFx0XCJEQVRFXCIsXG5cdFx0XCJGSVJTVERBWVdFRUtcIixcblx0XHRcIkxBU1REQVlXRUVLXCIsXG5cdFx0XCJGSVJTVERBWU1PTlRIXCIsXG5cdFx0XCJMQVNUREFZTU9OVEhcIixcblx0XHRcIkZJUlNUREFZUVVBUlRFUlwiLFxuXHRcdFwiTEFTVERBWVFVQVJURVJcIixcblx0XHRcIkZJUlNUREFZWUVBUlwiLFxuXHRcdFwiTEFTVERBWVlFQVJcIlxuXHRdO1xuXHRjb25zdCBhTXVsdGlSYW5nZU9wcyA9IFtcIkVRXCIsIFwiR0VcIiwgXCJMRVwiLCBcIkxUXCIsIFwiR1RcIiwgXCJCVFwiLCBcIk5FXCIsIFwiTk9UQlRcIiwgXCJOT1RMRVwiLCBcIk5PVExUXCIsIFwiTk9UR0VcIiwgXCJOT1RHVFwiXTtcblx0Y29uc3QgYVNlYXJjaEV4cHJlc3Npb25PcHMgPSBbXCJDb250YWluc1wiLCBcIk5vdENvbnRhaW5zXCIsIFwiU3RhcnRzV2l0aFwiLCBcIk5vdFN0YXJ0c1dpdGhcIiwgXCJFbmRzV2l0aFwiLCBcIk5vdEVuZHNXaXRoXCJdO1xuXHRjb25zdCBhU2VtYW50aWNEYXRlT3BzRXh0ID0gU2VtYW50aWNEYXRlT3BlcmF0b3JzLmdldFN1cHBvcnRlZE9wZXJhdGlvbnMoKTtcblx0Y29uc3QgYlNlbWFudGljRGF0ZVJhbmdlID0gYlVzZVNlbWFudGljRGF0ZVJhbmdlID09PSBcInRydWVcIiB8fCBiVXNlU2VtYW50aWNEYXRlUmFuZ2UgPT09IHRydWU7XG5cdGxldCBhU2VtYW50aWNEYXRlT3BzOiBzdHJpbmdbXSA9IFtdO1xuXHRjb25zdCBvU2V0dGluZ3MgPSBzU2V0dGluZ3MgJiYgdHlwZW9mIHNTZXR0aW5ncyA9PT0gXCJzdHJpbmdcIiA/IEpTT04ucGFyc2Uoc1NldHRpbmdzKS5jdXN0b21EYXRhIDogc1NldHRpbmdzO1xuXG5cdGlmICgob0NvbnRleHQuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlc3VsdENvbnRleHRgKSBhcyB1bmtub3duKSA9PT0gdHJ1ZSkge1xuXHRcdHJldHVybiBhRXF1YWxzT3BzO1xuXHR9XG5cblx0aWYgKG9TZXR0aW5ncyAmJiBvU2V0dGluZ3Mub3BlcmF0b3JDb25maWd1cmF0aW9uICYmIG9TZXR0aW5ncy5vcGVyYXRvckNvbmZpZ3VyYXRpb24ubGVuZ3RoID4gMCkge1xuXHRcdGFTZW1hbnRpY0RhdGVPcHMgPSBTZW1hbnRpY0RhdGVPcGVyYXRvcnMuZ2V0RmlsdGVyT3BlcmF0aW9ucyhvU2V0dGluZ3Mub3BlcmF0b3JDb25maWd1cmF0aW9uLCBzVHlwZSk7XG5cdH0gZWxzZSB7XG5cdFx0YVNlbWFudGljRGF0ZU9wcyA9IFNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zKHNUeXBlKTtcblx0fVxuXHQvLyBHZXQgdGhlIGRlZmF1bHQgT3BlcmF0b3JzIGZvciB0aGlzIFByb3BlcnR5IFR5cGVcblx0bGV0IGFEZWZhdWx0T3BlcmF0b3JzID0gX2dldERlZmF1bHRPcGVyYXRvcnMoc1R5cGUpO1xuXHRpZiAoYlNlbWFudGljRGF0ZVJhbmdlKSB7XG5cdFx0YURlZmF1bHRPcGVyYXRvcnMgPSBhU2VtYW50aWNEYXRlT3BzRXh0LmNvbmNhdChhRGVmYXVsdE9wZXJhdG9ycyk7XG5cdH1cblx0bGV0IHJlc3RyaWN0aW9uczogc3RyaW5nW10gPSBbXTtcblxuXHQvLyBJcyB0aGVyZSBhIEZpbHRlciBSZXN0cmljdGlvbiBkZWZpbmVkIGZvciB0aGlzIHByb3BlcnR5P1xuXHRpZiAob0ZpbHRlclJlc3RyaWN0aW9ucyAmJiBvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyAmJiBvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHldKSB7XG5cdFx0Ly8gRXh0ZW5kaW5nIHRoZSBkZWZhdWx0IG9wZXJhdG9ycyBsaXN0IHdpdGggU2VtYW50aWMgRGF0ZSBvcHRpb25zIERBVEVSQU5HRSwgREFURSwgRlJPTSBhbmQgVE9cblx0XHRjb25zdCBzQWxsb3dlZEV4cHJlc3Npb24gPSBDb21tb25VdGlscy5nZXRTcGVjaWZpY0FsbG93ZWRFeHByZXNzaW9uKG9GaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zW3NQcm9wZXJ0eV0pO1xuXHRcdC8vIEluIGNhc2UgbW9yZSB0aGFuIG9uZSBBbGxvd2VkIEV4cHJlc3Npb25zIGhhcyBiZWVuIGRlZmluZWQgZm9yIGEgcHJvcGVydHlcblx0XHQvLyBjaG9vc2UgdGhlIG1vc3QgcmVzdHJpY3RpdmUgQWxsb3dlZCBFeHByZXNzaW9uXG5cblx0XHQvLyBNdWx0aVZhbHVlIGhhcyBzYW1lIE9wZXJhdG9yIGFzIFNpbmdsZVZhbHVlLCBidXQgdGhlcmUgY2FuIGJlIG1vcmUgdGhhbiBvbmUgKG1heENvbmRpdGlvbnMpXG5cdFx0c3dpdGNoIChzQWxsb3dlZEV4cHJlc3Npb24pIHtcblx0XHRcdGNhc2UgXCJTaW5nbGVWYWx1ZVwiOlxuXHRcdFx0XHRjb25zdCBhU2luZ2xlVmFsdWVPcHMgPSBzVHlwZSA9PT0gXCJFZG0uRGF0ZVwiICYmIGJTZW1hbnRpY0RhdGVSYW5nZSA/IGFTaW5nbGVWYWx1ZURhdGVPcHMgOiBhRXF1YWxzT3BzO1xuXHRcdFx0XHRyZXN0cmljdGlvbnMgPSBfZ2V0UmVzdHJpY3Rpb25zKGFEZWZhdWx0T3BlcmF0b3JzLCBhU2luZ2xlVmFsdWVPcHMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJNdWx0aVZhbHVlXCI6XG5cdFx0XHRcdHJlc3RyaWN0aW9ucyA9IF9nZXRSZXN0cmljdGlvbnMoYURlZmF1bHRPcGVyYXRvcnMsIGFFcXVhbHNPcHMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJTaW5nbGVSYW5nZVwiOlxuXHRcdFx0XHRsZXQgYUV4cHJlc3Npb25PcHM6IHN0cmluZ1tdO1xuXHRcdFx0XHRpZiAoYlNlbWFudGljRGF0ZVJhbmdlKSB7XG5cdFx0XHRcdFx0aWYgKHNUeXBlID09PSBcIkVkbS5EYXRlXCIpIHtcblx0XHRcdFx0XHRcdGFFeHByZXNzaW9uT3BzID0gYVNlbWFudGljRGF0ZU9wcztcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHNUeXBlID09PSBcIkVkbS5EYXRlVGltZU9mZnNldFwiKSB7XG5cdFx0XHRcdFx0XHRhRXhwcmVzc2lvbk9wcyA9IGFTZW1hbnRpY0RhdGVPcHM7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGFFeHByZXNzaW9uT3BzID0gYVNpbmdsZVJhbmdlT3BzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChzVHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIikge1xuXHRcdFx0XHRcdGFFeHByZXNzaW9uT3BzID0gYVNpbmdsZVJhbmdlRFRCYXNpY09wcztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhRXhwcmVzc2lvbk9wcyA9IGFTaW5nbGVSYW5nZU9wcztcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBzT3BlcmF0b3JzID0gX2dldFJlc3RyaWN0aW9ucyhhRGVmYXVsdE9wZXJhdG9ycywgYUV4cHJlc3Npb25PcHMpO1xuXHRcdFx0XHRyZXN0cmljdGlvbnMgPSBzT3BlcmF0b3JzO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJNdWx0aVJhbmdlXCI6XG5cdFx0XHRcdHJlc3RyaWN0aW9ucyA9IF9nZXRSZXN0cmljdGlvbnMoYURlZmF1bHRPcGVyYXRvcnMsIGFNdWx0aVJhbmdlT3BzKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiU2VhcmNoRXhwcmVzc2lvblwiOlxuXHRcdFx0XHRyZXN0cmljdGlvbnMgPSBfZ2V0UmVzdHJpY3Rpb25zKGFEZWZhdWx0T3BlcmF0b3JzLCBhU2VhcmNoRXhwcmVzc2lvbk9wcyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk11bHRpUmFuZ2VPclNlYXJjaEV4cHJlc3Npb25cIjpcblx0XHRcdFx0cmVzdHJpY3Rpb25zID0gX2dldFJlc3RyaWN0aW9ucyhhRGVmYXVsdE9wZXJhdG9ycywgYVNlYXJjaEV4cHJlc3Npb25PcHMuY29uY2F0KGFNdWx0aVJhbmdlT3BzKSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdC8vIEluIGNhc2UgQWxsb3dlZEV4cHJlc3Npb25zIGlzIG5vdCByZWNvZ25pc2VkLCB1bmRlZmluZWQgaW4gcmV0dXJuIHJlc3VsdHMgaW4gdGhlIGRlZmF1bHQgc2V0IG9mXG5cdFx0Ly8gb3BlcmF0b3JzIGZvciB0aGUgdHlwZS5cblx0fVxuXHRyZXR1cm4gcmVzdHJpY3Rpb25zO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byByZXR1cm4gYWxsb3dlZCBvcGVyYXRvcnMgZm9yIHR5cGUgR3VpZC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIGdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eVxuICogQHJldHVybnMgQWxsb3dlZCBvcGVyYXRvcnMgZm9yIHR5cGUgR3VpZFxuICovXG5mdW5jdGlvbiBnZXRPcGVyYXRvcnNGb3JHdWlkUHJvcGVydHkoKTogc3RyaW5nIHtcblx0Y29uc3QgYWxsb3dlZE9wZXJhdG9yc0Zvckd1aWQgPSBbXCJFUVwiLCBcIk5FXCJdO1xuXHRyZXR1cm4gYWxsb3dlZE9wZXJhdG9yc0Zvckd1aWQudG9TdHJpbmcoKTtcbn1cblxuZnVuY3Rpb24gZ2V0T3BlcmF0b3JzRm9yRGF0ZVByb3BlcnR5KHByb3BlcnR5VHlwZTogc3RyaW5nKTogc3RyaW5nW10ge1xuXHQvLyBJbiBjYXNlIEFsbG93ZWRFeHByZXNzaW9ucyBpcyBub3QgcHJvdmlkZWQgZm9yIHR5cGUgRWRtLkRhdGUgdGhlbiBhbGwgdGhlIGRlZmF1bHRcblx0Ly8gb3BlcmF0b3JzIGZvciB0aGUgdHlwZSBzaG91bGQgYmUgcmV0dXJuZWQgZXhjbHVkaW5nIHNlbWFudGljIG9wZXJhdG9ycyBmcm9tIHRoZSBsaXN0LlxuXHRjb25zdCBhRGVmYXVsdE9wZXJhdG9ycyA9IF9nZXREZWZhdWx0T3BlcmF0b3JzKHByb3BlcnR5VHlwZSk7XG5cdGNvbnN0IGFNdWx0aVJhbmdlT3BzID0gW1wiRVFcIiwgXCJHRVwiLCBcIkxFXCIsIFwiTFRcIiwgXCJHVFwiLCBcIkJUXCIsIFwiTkVcIiwgXCJOT1RCVFwiLCBcIk5PVExFXCIsIFwiTk9UTFRcIiwgXCJOT1RHRVwiLCBcIk5PVEdUXCJdO1xuXHRyZXR1cm4gX2dldFJlc3RyaWN0aW9ucyhhRGVmYXVsdE9wZXJhdG9ycywgYU11bHRpUmFuZ2VPcHMpO1xufVxuXG50eXBlIFBhcmFtZXRlckluZm8gPSB7XG5cdGNvbnRleHRQYXRoPzogc3RyaW5nO1xuXHRwYXJhbWV0ZXJQcm9wZXJ0aWVzPzogUmVjb3JkPHN0cmluZywgTWV0YU1vZGVsUHJvcGVydHk+O1xufTtcbmZ1bmN0aW9uIGdldFBhcmFtZXRlckluZm8obWV0YU1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsIHNDb250ZXh0UGF0aDogc3RyaW5nKSB7XG5cdGNvbnN0IHNQYXJhbWV0ZXJDb250ZXh0UGF0aCA9IHNDb250ZXh0UGF0aC5zdWJzdHJpbmcoMCwgc0NvbnRleHRQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSk7XG5cdGNvbnN0IGJSZXN1bHRDb250ZXh0ID0gbWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3QoYCR7c1BhcmFtZXRlckNvbnRleHRQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlc3VsdENvbnRleHRgKTtcblx0Y29uc3Qgb1BhcmFtZXRlckluZm86IFBhcmFtZXRlckluZm8gPSB7fTtcblx0aWYgKGJSZXN1bHRDb250ZXh0ICYmIHNQYXJhbWV0ZXJDb250ZXh0UGF0aCAhPT0gc0NvbnRleHRQYXRoKSB7XG5cdFx0b1BhcmFtZXRlckluZm8uY29udGV4dFBhdGggPSBzUGFyYW1ldGVyQ29udGV4dFBhdGg7XG5cdFx0b1BhcmFtZXRlckluZm8ucGFyYW1ldGVyUHJvcGVydGllcyA9IENvbW1vblV0aWxzLmdldENvbnRleHRQYXRoUHJvcGVydGllcyhtZXRhTW9kZWxDb250ZXh0LCBzUGFyYW1ldGVyQ29udGV4dFBhdGgpO1xuXHR9XG5cdHJldHVybiBvUGFyYW1ldGVySW5mbztcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gYWRkIHRoZSBzZWxlY3QgT3B0aW9ucyB0byBmaWx0ZXIgY29uZGl0aW9ucy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIGFkZFNlbGVjdE9wdGlvblRvQ29uZGl0aW9uc1xuICogQHBhcmFtIG9Qcm9wZXJ0eU1ldGFkYXRhIFByb3BlcnR5IG1ldGFkYXRhIGluZm9ybWF0aW9uXG4gKiBAcGFyYW0gYVZhbGlkT3BlcmF0b3JzIE9wZXJhdG9ycyBmb3IgYWxsIHRoZSBkYXRhIHR5cGVzXG4gKiBAcGFyYW0gYVNlbWFudGljRGF0ZU9wZXJhdG9ycyBPcGVyYXRvcnMgZm9yIHRoZSBEYXRlIHR5cGVcbiAqIEBwYXJhbSBhQ3VtdWxhdGl2ZUNvbmRpdGlvbnMgRmlsdGVyIGNvbmRpdGlvbnNcbiAqIEBwYXJhbSBvU2VsZWN0T3B0aW9uIFNlbGVjdG9wdGlvbiBvZiBzZWxlY3Rpb24gdmFyaWFudFxuICogQHJldHVybnMgVGhlIGZpbHRlciBjb25kaXRpb25zXG4gKi9cbmZ1bmN0aW9uIGFkZFNlbGVjdE9wdGlvblRvQ29uZGl0aW9ucyhcblx0b1Byb3BlcnR5TWV0YWRhdGE6IHVua25vd24sXG5cdGFWYWxpZE9wZXJhdG9yczogc3RyaW5nW10sXG5cdGFTZW1hbnRpY0RhdGVPcGVyYXRvcnM6IHN0cmluZ1tdLFxuXHRhQ3VtdWxhdGl2ZUNvbmRpdGlvbnM6IENvbmRpdGlvbk9iamVjdFtdLFxuXHRvU2VsZWN0T3B0aW9uOiBTZWxlY3RPcHRpb25cbikge1xuXHRjb25zdCBvQ29uZGl0aW9uID0gZ2V0Q29uZGl0aW9ucyhvU2VsZWN0T3B0aW9uLCBvUHJvcGVydHlNZXRhZGF0YSk7XG5cdGlmIChcblx0XHRvU2VsZWN0T3B0aW9uPy5TZW1hbnRpY0RhdGVzICYmXG5cdFx0YVNlbWFudGljRGF0ZU9wZXJhdG9ycyAmJlxuXHRcdGFTZW1hbnRpY0RhdGVPcGVyYXRvcnMuaW5kZXhPZihvU2VsZWN0T3B0aW9uPy5TZW1hbnRpY0RhdGVzPy5vcGVyYXRvcikgPiAtMVxuXHQpIHtcblx0XHRjb25zdCBzZW1hbnRpY0RhdGVzID0gQ29tbW9uVXRpbHMuYWRkU2VtYW50aWNEYXRlc1RvQ29uZGl0aW9ucyhvU2VsZWN0T3B0aW9uPy5TZW1hbnRpY0RhdGVzKTtcblx0XHRpZiAoc2VtYW50aWNEYXRlcyAmJiBPYmplY3Qua2V5cyhzZW1hbnRpY0RhdGVzKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRhQ3VtdWxhdGl2ZUNvbmRpdGlvbnMucHVzaChzZW1hbnRpY0RhdGVzKTtcblx0XHR9XG5cdH0gZWxzZSBpZiAob0NvbmRpdGlvbikge1xuXHRcdGlmIChhVmFsaWRPcGVyYXRvcnMubGVuZ3RoID09PSAwIHx8IGFWYWxpZE9wZXJhdG9ycy5pbmRleE9mKG9Db25kaXRpb24ub3BlcmF0b3IpID4gLTEpIHtcblx0XHRcdGFDdW11bGF0aXZlQ29uZGl0aW9ucy5wdXNoKG9Db25kaXRpb24pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gYUN1bXVsYXRpdmVDb25kaXRpb25zO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byBhZGQgdGhlIHNlbWFudGljIGRhdGVzIHRvIGZpbHRlciBjb25kaXRpb25zXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBhZGRTZW1hbnRpY0RhdGVzVG9Db25kaXRpb25zXG4gKiBAcGFyYW0gb1NlbWFudGljRGF0ZXMgU2VtYW50aWMgZGF0ZSBpbmZvbWF0aW9uXG4gKiBAcmV0dXJucyBUaGUgZmlsdGVyIGNvbmRpdGlvbnMgY29udGFpbmluZyBzZW1hbnRpYyBkYXRlc1xuICovXG5cbmZ1bmN0aW9uIGFkZFNlbWFudGljRGF0ZXNUb0NvbmRpdGlvbnMob1NlbWFudGljRGF0ZXM6IFNlbWFudGljRGF0ZUNvbmZpZ3VyYXRpb24pOiBDb25kaXRpb25PYmplY3Qge1xuXHRjb25zdCB2YWx1ZXM6IHVua25vd25bXSA9IFtdO1xuXHRpZiAob1NlbWFudGljRGF0ZXM/LmhpZ2gpIHtcblx0XHR2YWx1ZXMucHVzaChvU2VtYW50aWNEYXRlcz8uaGlnaCk7XG5cdH1cblx0aWYgKG9TZW1hbnRpY0RhdGVzPy5sb3cpIHtcblx0XHR2YWx1ZXMucHVzaChvU2VtYW50aWNEYXRlcz8ubG93KTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdHZhbHVlczogdmFsdWVzLFxuXHRcdG9wZXJhdG9yOiBvU2VtYW50aWNEYXRlcz8ub3BlcmF0b3IsXG5cdFx0aXNFbXB0eTogdW5kZWZpbmVkXG5cdH07XG59XG5cbnR5cGUgVmlld0RhdGEgPSB7XG5cdGNvbnRyb2xDb25maWd1cmF0aW9uPzogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgdW5rbm93bj4+O1xufTtcblxuZnVuY3Rpb24gYWRkUGFnZUNvbnRleHRUb1NlbGVjdGlvblZhcmlhbnQob1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsIG1QYWdlQ29udGV4dDogdW5rbm93bltdLCBvVmlldzogVmlldykge1xuXHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9WaWV3KTtcblx0Y29uc3Qgb05hdmlnYXRpb25TZXJ2aWNlID0gb0FwcENvbXBvbmVudC5nZXROYXZpZ2F0aW9uU2VydmljZSgpO1xuXHRyZXR1cm4gb05hdmlnYXRpb25TZXJ2aWNlLm1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50KG1QYWdlQ29udGV4dCwgb1NlbGVjdGlvblZhcmlhbnQudG9KU09OU3RyaW5nKCkpO1xufVxuXG4vKipcbiAqIEdldCBzZWxlY3Rpb24gdmFyaWFudCBiYXNlZCBvbiB0aGUgZmlsdGVyIGNvbmRpdGlvbnMgYW5kIHRoZSBuYXZpZ2F0aW9uIGNvbnRleHQgZmllbGRzLlxuICpcbiAqIEBwYXJhbSBzZWxlY3Rpb25WYXJpYW50IFNlbGVjdGlvblZhcmlhbnQgcHJvdmlkZWQgYnkgU0FQIEZpb3JpIGVsZW1lbnRzLlxuICogQHBhcmFtIGZpbHRlcnMgUmV0cmlldmVkIGZpbHRlciBjb25kaXRpb24gZm9yIGZpbHRlciBiYXIgYW5kIG5vbiBjb25mbGljdGluZyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0gdGFyZ2V0SW5mbyBPYmplY3QgY29udGFpbmluZyBpbnRlbnQtYmFzZWQgbmF2aWdhdGlvbi1yZWxhdGVkIGluZm9cbiAqIEBwYXJhbSBmaWx0ZXJCYXIgVGhlIGZpbHRlcmJhciBjb250cm9sXG4gKiBAcmV0dXJucyBUaGUgc2VsZWN0aW9uIHZhcmlhbnRcbiAqL1xuXG5mdW5jdGlvbiBhZGRFeHRlcm5hbFN0YXRlRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudChcblx0aW5wdXRTZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50LFxuXHRmaWx0ZXJzOiBFeHRlcm5hbEZpbHRlcixcblx0ZmlsdGVyQmFyOiBGaWx0ZXJCYXIsXG5cdHRhcmdldEluZm8/OiBOYXZpZ2F0aW9uSW5mb1xuKTogU2VsZWN0aW9uVmFyaWFudCB7XG5cdGNvbnN0IGZpbHRlckNvbmRpdGlvbnMgPSBmaWx0ZXJzLmZpbHRlckNvbmRpdGlvbnM7XG5cdGNvbnN0IGZpbHRlcnNXaXRob3V0Q29uZmxpY3QgPSBmaWx0ZXJzLmZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3QgPyBmaWx0ZXJzLmZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3QgOiB7fTtcblx0Y29uc3QgdGFibGVQcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0ID0gdGFyZ2V0SW5mbz8ucHJvcGVydGllc1dpdGhvdXRDb25mbGljdCA/IHRhcmdldEluZm8ucHJvcGVydGllc1dpdGhvdXRDb25mbGljdCA6IHt9O1xuXG5cdGNvbnN0IHNlbGVjdGlvblZhcmlhbnRGcm9tRmlsdGVyYmFyID0gU3RhdGVGaWx0ZXJUb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0aW9uVmFyaWFudEZyb21Db25kaXRpb25zKFxuXHRcdGZpbHRlckNvbmRpdGlvbnMsXG5cdFx0ZmlsdGVyQmFyLmdldFByb3BlcnR5SGVscGVyKClcblx0KTtcblx0Zm9yIChjb25zdCBmaWx0ZXJrZXkgaW4gZmlsdGVyQ29uZGl0aW9ucykge1xuXHRcdC8vIG9ubHkgYWRkIHRoZSBmaWx0ZXIgdmFsdWVzIGlmIGl0IGlzIG5vdCBhbHJlYWR5IHByZXNlbnQgaW4gdGhlIFNWIGFscmVhZHlcblx0XHRjb25zdCBmaWx0ZXJTZWxlY3RPcHRpb24gPSBzZWxlY3Rpb25WYXJpYW50RnJvbUZpbHRlcmJhci5nZXRTZWxlY3RPcHRpb24oZmlsdGVya2V5KTtcblx0XHRpZiAoIWlucHV0U2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oZmlsdGVya2V5KSkge1xuXHRcdFx0Ly8gVE9ETyA6IGN1c3RvbSBmaWx0ZXJzIHNob3VsZCBiZSBpZ25vcmVkIG1vcmUgZ2VuZXJpY2FsbHlcblx0XHRcdGlmIChmaWx0ZXJrZXkgPT09IFwiJGVkaXRTdGF0ZVwiKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGZpbHRlclNlbGVjdE9wdGlvbikge1xuXHRcdFx0XHRpbnB1dFNlbGVjdGlvblZhcmlhbnQubWFzc0FkZFNlbGVjdE9wdGlvbihmaWx0ZXJrZXksIGZpbHRlclNlbGVjdE9wdGlvbik7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0YWJsZVByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QgJiYgZmlsdGVya2V5IGluIHRhYmxlUHJvcGVydGllc1dpdGhvdXRDb25mbGljdCkge1xuXHRcdFx0XHRpbnB1dFNlbGVjdGlvblZhcmlhbnQubWFzc0FkZFNlbGVjdE9wdGlvbih0YWJsZVByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3RbZmlsdGVya2V5XSwgZmlsdGVyU2VsZWN0T3B0aW9uIGFzIFNlbGVjdE9wdGlvbltdKTtcblx0XHRcdH1cblx0XHRcdC8vIGlmIHByb3BlcnR5IHdhcyB3aXRob3V0IGNvbmZsaWN0IGluIHBhZ2UgY29udGV4dCB0aGVuIGFkZCBwYXRoIGZyb20gcGFnZSBjb250ZXh0IHRvIFNWXG5cdFx0XHRpZiAoZmlsdGVya2V5IGluIGZpbHRlcnNXaXRob3V0Q29uZmxpY3QpIHtcblx0XHRcdFx0aW5wdXRTZWxlY3Rpb25WYXJpYW50Lm1hc3NBZGRTZWxlY3RPcHRpb24oZmlsdGVyc1dpdGhvdXRDb25mbGljdFtmaWx0ZXJrZXldLCBmaWx0ZXJTZWxlY3RPcHRpb24gYXMgU2VsZWN0T3B0aW9uW10pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gaW5wdXRTZWxlY3Rpb25WYXJpYW50O1xufVxuXG5mdW5jdGlvbiBpc1N0aWNreUVkaXRNb2RlKG9Db250cm9sOiBDb250cm9sKSB7XG5cdGNvbnN0IGJJc1N0aWNreU1vZGUgPSBNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQoKG9Db250cm9sLmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbCkuZ2V0TWV0YU1vZGVsKCkpO1xuXHRjb25zdCBiVUlFZGl0YWJsZSA9IChvQ29udHJvbC5nZXRNb2RlbChcInVpXCIpIGFzIEpTT05Nb2RlbCkuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKTtcblx0cmV0dXJuIGJJc1N0aWNreU1vZGUgJiYgYlVJRWRpdGFibGU7XG59XG5cbi8qKlxuICogQHBhcmFtIGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHNcbiAqIEBwYXJhbSBvU2VsZWN0aW9uVmFyaWFudFxuICogQHBhcmFtIG9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHNcbiAqL1xuZnVuY3Rpb24gYWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeShcblx0YU1hbmRhdG9yeUZpbHRlckZpZWxkczogRXhwYW5kUGF0aFR5cGU8RWRtLlByb3BlcnR5UGF0aD5bXSxcblx0b1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsXG5cdG9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHM6IFNlbGVjdGlvblZhcmlhbnRcbikge1xuXHRpZiAob1NlbGVjdGlvblZhcmlhbnQgJiYgYU1hbmRhdG9yeUZpbHRlckZpZWxkcyAmJiBhTWFuZGF0b3J5RmlsdGVyRmllbGRzLmxlbmd0aCkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYU1hbmRhdG9yeUZpbHRlckZpZWxkcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3QgYVNWT3B0aW9uID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uKFwiRGlzcGxheUN1cnJlbmN5XCIpLFxuXHRcdFx0XHRhRGVmYXVsdFNWT3B0aW9uID0gb1NlbGVjdGlvblZhcmlhbnREZWZhdWx0cyAmJiBvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzLmdldFNlbGVjdE9wdGlvbihcIkRpc3BsYXlDdXJyZW5jeVwiKTtcblx0XHRcdGlmIChcblx0XHRcdFx0YU1hbmRhdG9yeUZpbHRlckZpZWxkc1tpXS4kUHJvcGVydHlQYXRoID09PSBcIkRpc3BsYXlDdXJyZW5jeVwiICYmXG5cdFx0XHRcdCghYVNWT3B0aW9uIHx8ICFhU1ZPcHRpb24ubGVuZ3RoKSAmJlxuXHRcdFx0XHRhRGVmYXVsdFNWT3B0aW9uICYmXG5cdFx0XHRcdGFEZWZhdWx0U1ZPcHRpb24ubGVuZ3RoXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgZGlzcGxheUN1cnJlbmN5U2VsZWN0T3B0aW9uID0gYURlZmF1bHRTVk9wdGlvblswXTtcblx0XHRcdFx0Y29uc3Qgc1NpZ24gPSBkaXNwbGF5Q3VycmVuY3lTZWxlY3RPcHRpb25bXCJTaWduXCJdO1xuXHRcdFx0XHRjb25zdCBzT3B0aW9uID0gZGlzcGxheUN1cnJlbmN5U2VsZWN0T3B0aW9uW1wiT3B0aW9uXCJdO1xuXHRcdFx0XHRjb25zdCBzTG93ID0gZGlzcGxheUN1cnJlbmN5U2VsZWN0T3B0aW9uW1wiTG93XCJdO1xuXHRcdFx0XHRjb25zdCBzSGlnaCA9IGRpc3BsYXlDdXJyZW5jeVNlbGVjdE9wdGlvbltcIkhpZ2hcIl07XG5cdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcIkRpc3BsYXlDdXJyZW5jeVwiLCBzU2lnbiwgc09wdGlvbiwgc0xvdywgc0hpZ2gpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG50eXBlIFVzZXJEZWZhdWx0UGFyYW1ldGVyID0ge1xuXHQkTmFtZTogc3RyaW5nO1xuXHRnZXRQYXRoPygpOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdXNlciBkZWZhdWx0cyBmcm9tIHRoZSBzdGFydHVwIGFwcCBzdGF0ZSAoaWYgYXZhaWxhYmxlKSBvciB0aGUgc3RhcnR1cCBwYXJhbWV0ZXIgYW5kIHNldHMgdGhlbSB0byBhIG1vZGVsLlxuICpcbiAqIEBwYXJhbSBvQXBwQ29tcG9uZW50XG4gKiBAcGFyYW0gYVBhcmFtZXRlcnNcbiAqIEBwYXJhbSBvTW9kZWxcbiAqIEBwYXJhbSBiSXNBY3Rpb25cbiAqIEBwYXJhbSBiSXNDcmVhdGVcbiAqIEBwYXJhbSBvQWN0aW9uRGVmYXVsdFZhbHVlc1xuICovXG5hc3luYyBmdW5jdGlvbiBzZXRVc2VyRGVmYXVsdHMoXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0YVBhcmFtZXRlcnM6IFVzZXJEZWZhdWx0UGFyYW1ldGVyW10sXG5cdG9Nb2RlbDogSlNPTk1vZGVsIHwgT0RhdGFWNENvbnRleHQsXG5cdGJJc0FjdGlvbjogYm9vbGVhbixcblx0YklzQ3JlYXRlPzogYm9vbGVhbixcblx0b0FjdGlvbkRlZmF1bHRWYWx1ZXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG4pOiBQcm9taXNlPHZvaWQ+IHtcblx0Y29uc3Qgb0NvbXBvbmVudERhdGEgPSBvQXBwQ29tcG9uZW50LmdldENvbXBvbmVudERhdGEoKSxcblx0XHRvU3RhcnR1cFBhcmFtZXRlcnMgPSAob0NvbXBvbmVudERhdGEgJiYgb0NvbXBvbmVudERhdGEuc3RhcnR1cFBhcmFtZXRlcnMpIHx8IHt9LFxuXHRcdG9TaGVsbFNlcnZpY2VzID0gb0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdGNvbnN0IG9TdGFydHVwQXBwU3RhdGUgPSBhd2FpdCBvU2hlbGxTZXJ2aWNlcy5nZXRTdGFydHVwQXBwU3RhdGUob0FwcENvbXBvbmVudCk7XG5cdGNvbnN0IG9EYXRhID0gb1N0YXJ0dXBBcHBTdGF0ZT8uZ2V0RGF0YSgpIHx8IHt9LFxuXHRcdGFFeHRlbmRlZFBhcmFtZXRlcnMgPSAob0RhdGEuc2VsZWN0aW9uVmFyaWFudCAmJiBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMpIHx8IFtdO1xuXHRhUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChvUGFyYW1ldGVyKSB7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5TmFtZSA9IGJJc0FjdGlvblxuXHRcdFx0PyBgLyR7b1BhcmFtZXRlci4kTmFtZX1gXG5cdFx0XHQ6IChvUGFyYW1ldGVyLmdldFBhdGg/LigpLnNsaWNlKG9QYXJhbWV0ZXIuZ2V0UGF0aCgpLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpIGFzIHN0cmluZyk7XG5cdFx0Y29uc3Qgc1BhcmFtZXRlck5hbWUgPSBiSXNBY3Rpb24gPyBzUHJvcGVydHlOYW1lLnNsaWNlKDEpIDogc1Byb3BlcnR5TmFtZTtcblx0XHRpZiAob0FjdGlvbkRlZmF1bHRWYWx1ZXMgJiYgYklzQ3JlYXRlKSB7XG5cdFx0XHRpZiAob0FjdGlvbkRlZmF1bHRWYWx1ZXNbc1BhcmFtZXRlck5hbWVdKSB7XG5cdFx0XHRcdG9Nb2RlbC5zZXRQcm9wZXJ0eShzUHJvcGVydHlOYW1lLCBvQWN0aW9uRGVmYXVsdFZhbHVlc1tzUGFyYW1ldGVyTmFtZV0pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAob1N0YXJ0dXBQYXJhbWV0ZXJzW3NQYXJhbWV0ZXJOYW1lXSkge1xuXHRcdFx0b01vZGVsLnNldFByb3BlcnR5KHNQcm9wZXJ0eU5hbWUsIG9TdGFydHVwUGFyYW1ldGVyc1tzUGFyYW1ldGVyTmFtZV1bMF0pO1xuXHRcdH0gZWxzZSBpZiAoYUV4dGVuZGVkUGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRmb3IgKGNvbnN0IG9FeHRlbmRlZFBhcmFtZXRlciBvZiBhRXh0ZW5kZWRQYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdGlmIChvRXh0ZW5kZWRQYXJhbWV0ZXIuUHJvcGVydHlOYW1lID09PSBzUGFyYW1ldGVyTmFtZSkge1xuXHRcdFx0XHRcdGNvbnN0IG9SYW5nZSA9IG9FeHRlbmRlZFBhcmFtZXRlci5SYW5nZXMubGVuZ3RoXG5cdFx0XHRcdFx0XHQ/IG9FeHRlbmRlZFBhcmFtZXRlci5SYW5nZXNbb0V4dGVuZGVkUGFyYW1ldGVyLlJhbmdlcy5sZW5ndGggLSAxXVxuXHRcdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0aWYgKG9SYW5nZSAmJiBvUmFuZ2UuU2lnbiA9PT0gXCJJXCIgJiYgb1JhbmdlLk9wdGlvbiA9PT0gXCJFUVwiKSB7XG5cdFx0XHRcdFx0XHRvTW9kZWwuc2V0UHJvcGVydHkoc1Byb3BlcnR5TmFtZSwgb1JhbmdlLkxvdyk7IC8vIGhpZ2ggaXMgaWdub3JlZCB3aGVuIE9wdGlvbj1FUVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59XG5cbmV4cG9ydCB0eXBlIEluYm91bmRQYXJhbWV0ZXIgPSB7XG5cdHVzZUZvckNyZWF0ZTogYm9vbGVhbjtcbn07XG5mdW5jdGlvbiBnZXRBZGRpdGlvbmFsUGFyYW1zRm9yQ3JlYXRlKFxuXHRvU3RhcnR1cFBhcmFtZXRlcnM6IFJlY29yZDxzdHJpbmcsIHVua25vd25bXT4sXG5cdG9JbmJvdW5kUGFyYW1ldGVycz86IFJlY29yZDxzdHJpbmcsIEluYm91bmRQYXJhbWV0ZXI+XG4pIHtcblx0Y29uc3Qgb0luYm91bmRzID0gb0luYm91bmRQYXJhbWV0ZXJzLFxuXHRcdGFDcmVhdGVQYXJhbWV0ZXJzID1cblx0XHRcdG9JbmJvdW5kcyAhPT0gdW5kZWZpbmVkXG5cdFx0XHRcdD8gT2JqZWN0LmtleXMob0luYm91bmRzKS5maWx0ZXIoZnVuY3Rpb24gKHNQYXJhbWV0ZXI6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9JbmJvdW5kc1tzUGFyYW1ldGVyXS51c2VGb3JDcmVhdGU7XG5cdFx0XHRcdCAgfSlcblx0XHRcdFx0OiBbXTtcblx0bGV0IG9SZXQ7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgYUNyZWF0ZVBhcmFtZXRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRjb25zdCBzQ3JlYXRlUGFyYW1ldGVyID0gYUNyZWF0ZVBhcmFtZXRlcnNbaV07XG5cdFx0Y29uc3QgYVZhbHVlcyA9IG9TdGFydHVwUGFyYW1ldGVycyAmJiBvU3RhcnR1cFBhcmFtZXRlcnNbc0NyZWF0ZVBhcmFtZXRlcl07XG5cdFx0aWYgKGFWYWx1ZXMgJiYgYVZhbHVlcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdG9SZXQgPSBvUmV0IHx8IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0XHRvUmV0W3NDcmVhdGVQYXJhbWV0ZXJdID0gYVZhbHVlc1swXTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9SZXQ7XG59XG50eXBlIE91dGJvdW5kUGFyYW1ldGVyID0ge1xuXHRwYXJhbWV0ZXJzOiBSZWNvcmQ8c3RyaW5nLCBPdXRib3VuZFBhcmFtZXRlclZhbHVlPjtcblx0c2VtYW50aWNPYmplY3Q/OiBzdHJpbmc7XG5cdGFjdGlvbj86IHN0cmluZztcbn07XG50eXBlIE91dGJvdW5kUGFyYW1ldGVyVmFsdWUgPSB7XG5cdHZhbHVlPzoge1xuXHRcdHZhbHVlPzogc3RyaW5nO1xuXHRcdGZvcm1hdD86IHN0cmluZztcblx0fTtcbn07XG5mdW5jdGlvbiBnZXRTZW1hbnRpY09iamVjdE1hcHBpbmcob091dGJvdW5kOiBPdXRib3VuZFBhcmFtZXRlcikge1xuXHRjb25zdCBhU2VtYW50aWNPYmplY3RNYXBwaW5nOiBNZXRhTW9kZWxUeXBlPFNlbWFudGljT2JqZWN0TWFwcGluZ1R5cGU+W10gPSBbXTtcblx0aWYgKG9PdXRib3VuZC5wYXJhbWV0ZXJzKSB7XG5cdFx0Y29uc3QgYVBhcmFtZXRlcnMgPSBPYmplY3Qua2V5cyhvT3V0Ym91bmQucGFyYW1ldGVycykgfHwgW107XG5cdFx0aWYgKGFQYXJhbWV0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdGFQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHNQYXJhbTogc3RyaW5nKSB7XG5cdFx0XHRcdGNvbnN0IG9NYXBwaW5nID0gb091dGJvdW5kLnBhcmFtZXRlcnNbc1BhcmFtXTtcblx0XHRcdFx0aWYgKG9NYXBwaW5nLnZhbHVlICYmIG9NYXBwaW5nLnZhbHVlLnZhbHVlICYmIG9NYXBwaW5nLnZhbHVlLmZvcm1hdCA9PT0gXCJiaW5kaW5nXCIpIHtcblx0XHRcdFx0XHQvLyB1c2luZyB0aGUgZm9ybWF0IG9mIFVJLk1hcHBpbmdcblx0XHRcdFx0XHRjb25zdCBvU2VtYW50aWNNYXBwaW5nID0ge1xuXHRcdFx0XHRcdFx0TG9jYWxQcm9wZXJ0eToge1xuXHRcdFx0XHRcdFx0XHQkUHJvcGVydHlQYXRoOiBvTWFwcGluZy52YWx1ZS52YWx1ZVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFNlbWFudGljT2JqZWN0UHJvcGVydHk6IHNQYXJhbVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRpZiAoYVNlbWFudGljT2JqZWN0TWFwcGluZy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHQvLyBUbyBjaGVjayBpZiB0aGUgc2VtYW50aWNPYmplY3QgTWFwcGluZyBpcyBkb25lIGZvciB0aGUgc2FtZSBsb2NhbCBwcm9wZXJ0eSBtb3JlIHRoYXQgb25jZSB0aGVuIGZpcnN0IG9uZSB3aWxsIGJlIGNvbnNpZGVyZWRcblx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVNlbWFudGljT2JqZWN0TWFwcGluZy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRpZiAoYVNlbWFudGljT2JqZWN0TWFwcGluZ1tpXS5Mb2NhbFByb3BlcnR5Py4kUHJvcGVydHlQYXRoICE9PSBvU2VtYW50aWNNYXBwaW5nLkxvY2FsUHJvcGVydHkuJFByb3BlcnR5UGF0aCkge1xuXHRcdFx0XHRcdFx0XHRcdGFTZW1hbnRpY09iamVjdE1hcHBpbmcucHVzaChvU2VtYW50aWNNYXBwaW5nKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RNYXBwaW5nLnB1c2gob1NlbWFudGljTWFwcGluZyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGFTZW1hbnRpY09iamVjdE1hcHBpbmc7XG59XG5cbmZ1bmN0aW9uIGdldEhlYWRlckZhY2V0SXRlbUNvbmZpZ0ZvckV4dGVybmFsTmF2aWdhdGlvbihvVmlld0RhdGE6IFZpZXdEYXRhLCBvQ3Jvc3NOYXY6IFJlY29yZDxzdHJpbmcsIE91dGJvdW5kUGFyYW1ldGVyPikge1xuXHRjb25zdCBvSGVhZGVyRmFjZXRJdGVtczogUmVjb3JkPFxuXHRcdHN0cmluZyxcblx0XHR7XG5cdFx0XHRzZW1hbnRpY09iamVjdDogc3RyaW5nO1xuXHRcdFx0YWN0aW9uOiBzdHJpbmc7XG5cdFx0XHRzZW1hbnRpY09iamVjdE1hcHBpbmc6IE1ldGFNb2RlbFR5cGU8U2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZT5bXTtcblx0XHR9XG5cdD4gPSB7fTtcblx0bGV0IHNJZDtcblx0Y29uc3Qgb0NvbnRyb2xDb25maWcgPSBvVmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb24gYXMgUmVjb3JkPFxuXHRcdHN0cmluZyxcblx0XHR7XG5cdFx0XHRuYXZpZ2F0aW9uPzoge1xuXHRcdFx0XHR0YXJnZXRPdXRib3VuZD86IHtcblx0XHRcdFx0XHRvdXRib3VuZDogc3RyaW5nO1xuXHRcdFx0XHR9O1xuXHRcdFx0fTtcblx0XHR9XG5cdD47XG5cdGZvciAoY29uc3QgY29uZmlnIGluIG9Db250cm9sQ29uZmlnKSB7XG5cdFx0aWYgKGNvbmZpZy5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFwiKSA+IC0xIHx8IGNvbmZpZy5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0XCIpID4gLTEpIHtcblx0XHRcdGNvbnN0IHNPdXRib3VuZCA9IG9Db250cm9sQ29uZmlnW2NvbmZpZ10ubmF2aWdhdGlvbj8udGFyZ2V0T3V0Ym91bmQ/Lm91dGJvdW5kO1xuXHRcdFx0aWYgKHNPdXRib3VuZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNvbnN0IG9PdXRib3VuZCA9IG9Dcm9zc05hdltzT3V0Ym91bmRdO1xuXHRcdFx0XHRpZiAob091dGJvdW5kLnNlbWFudGljT2JqZWN0ICYmIG9PdXRib3VuZC5hY3Rpb24pIHtcblx0XHRcdFx0XHRpZiAoY29uZmlnLmluZGV4T2YoXCJDaGFydFwiKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRzSWQgPSBnZW5lcmF0ZShbXCJmZVwiLCBcIk1pY3JvQ2hhcnRMaW5rXCIsIGNvbmZpZ10pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzSWQgPSBnZW5lcmF0ZShbXCJmZVwiLCBcIkhlYWRlckRQTGlua1wiLCBjb25maWddKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0TWFwcGluZyA9IENvbW1vblV0aWxzLmdldFNlbWFudGljT2JqZWN0TWFwcGluZyhvT3V0Ym91bmQpO1xuXHRcdFx0XHRcdG9IZWFkZXJGYWNldEl0ZW1zW3NJZF0gPSB7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogb091dGJvdW5kLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0YWN0aW9uOiBvT3V0Ym91bmQuYWN0aW9uLFxuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nOiBhU2VtYW50aWNPYmplY3RNYXBwaW5nXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoYENyb3NzIG5hdmlnYXRpb24gb3V0Ym91bmQgaXMgY29uZmlndXJlZCB3aXRob3V0IHNlbWFudGljIG9iamVjdCBhbmQgYWN0aW9uIGZvciAke3NPdXRib3VuZH1gKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gb0hlYWRlckZhY2V0SXRlbXM7XG59XG5cbmZ1bmN0aW9uIHNldFNlbWFudGljT2JqZWN0TWFwcGluZ3Mob1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsIHZNYXBwaW5nczogdW5rbm93bikge1xuXHRjb25zdCBvTWFwcGluZ3MgPSB0eXBlb2Ygdk1hcHBpbmdzID09PSBcInN0cmluZ1wiID8gSlNPTi5wYXJzZSh2TWFwcGluZ3MpIDogdk1hcHBpbmdzO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IG9NYXBwaW5ncy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnN0IHNMb2NhbFByb3BlcnR5ID1cblx0XHRcdChvTWFwcGluZ3NbaV1bXCJMb2NhbFByb3BlcnR5XCJdICYmIG9NYXBwaW5nc1tpXVtcIkxvY2FsUHJvcGVydHlcIl1bXCIkUHJvcGVydHlQYXRoXCJdKSB8fFxuXHRcdFx0KG9NYXBwaW5nc1tpXVtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTG9jYWxQcm9wZXJ0eVwiXSAmJlxuXHRcdFx0XHRvTWFwcGluZ3NbaV1bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxvY2FsUHJvcGVydHlcIl1bXCIkUGF0aFwiXSk7XG5cdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0UHJvcGVydHkgPVxuXHRcdFx0b01hcHBpbmdzW2ldW1wiU2VtYW50aWNPYmplY3RQcm9wZXJ0eVwiXSB8fCBvTWFwcGluZ3NbaV1bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0UHJvcGVydHlcIl07XG5cdFx0Y29uc3Qgb1NlbGVjdE9wdGlvbiA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbihzTG9jYWxQcm9wZXJ0eSk7XG5cdFx0aWYgKG9TZWxlY3RPcHRpb24pIHtcblx0XHRcdC8vQ3JlYXRlIGEgbmV3IFNlbGVjdE9wdGlvbiB3aXRoIHNTZW1hbnRpY09iamVjdFByb3BlcnR5IGFzIHRoZSBwcm9wZXJ0eSBOYW1lIGFuZCByZW1vdmUgdGhlIG9sZGVyIG9uZVxuXHRcdFx0b1NlbGVjdGlvblZhcmlhbnQucmVtb3ZlU2VsZWN0T3B0aW9uKHNMb2NhbFByb3BlcnR5KTtcblx0XHRcdG9TZWxlY3Rpb25WYXJpYW50Lm1hc3NBZGRTZWxlY3RPcHRpb24oc1NlbWFudGljT2JqZWN0UHJvcGVydHksIG9TZWxlY3RPcHRpb24pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb1NlbGVjdGlvblZhcmlhbnQ7XG59XG5cbnR5cGUgU2VtYW50aWNPYmplY3RGcm9tUGF0aCA9IHtcblx0c2VtYW50aWNPYmplY3RQYXRoOiBzdHJpbmc7XG5cdHNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3M6IHsgc2VtYW50aWNPYmplY3Q6IHN0cmluZyB9W107XG5cdHNlbWFudGljT2JqZWN0OiB7XG5cdFx0c2VtYW50aWNPYmplY3Q6IHsgJFBhdGg6IHN0cmluZyB9O1xuXHR9O1xuXHR1bmF2YWlsYWJsZUFjdGlvbnM6IHN0cmluZ1tdO1xufTtcbmFzeW5jIGZ1bmN0aW9uIGZuR2V0U2VtYW50aWNPYmplY3RzRnJvbVBhdGgob01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIHNQYXRoOiBzdHJpbmcsIHNRdWFsaWZpZXI6IHN0cmluZykge1xuXHRyZXR1cm4gbmV3IFByb21pc2U8U2VtYW50aWNPYmplY3RGcm9tUGF0aD4oZnVuY3Rpb24gKHJlc29sdmUpIHtcblx0XHRsZXQgc1NlbWFudGljT2JqZWN0LCBhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM7XG5cdFx0aWYgKHNRdWFsaWZpZXIgPT09IFwiXCIpIHtcblx0XHRcdHNTZW1hbnRpY09iamVjdCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NQYXRofUAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdH1gKTtcblx0XHRcdGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NQYXRofUAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc31gKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c1NlbWFudGljT2JqZWN0ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhdGh9QCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0fSMke3NRdWFsaWZpZXJ9YCk7XG5cdFx0XHRhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcblx0XHRcdFx0YCR7c1BhdGh9QCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zfSMke3NRdWFsaWZpZXJ9YFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RGb3JHZXRMaW5rcyA9IFt7IHNlbWFudGljT2JqZWN0OiBzU2VtYW50aWNPYmplY3QgfV07XG5cdFx0Y29uc3Qgb1NlbWFudGljT2JqZWN0ID0ge1xuXHRcdFx0c2VtYW50aWNPYmplY3Q6IHNTZW1hbnRpY09iamVjdFxuXHRcdH07XG5cdFx0cmVzb2x2ZSh7XG5cdFx0XHRzZW1hbnRpY09iamVjdFBhdGg6IHNQYXRoLFxuXHRcdFx0c2VtYW50aWNPYmplY3RGb3JHZXRMaW5rczogYVNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3MsXG5cdFx0XHRzZW1hbnRpY09iamVjdDogb1NlbWFudGljT2JqZWN0LFxuXHRcdFx0dW5hdmFpbGFibGVBY3Rpb25zOiBhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNcblx0XHR9KTtcblx0fSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZuVXBkYXRlU2VtYW50aWNUYXJnZXRzTW9kZWwoXG5cdGFHZXRMaW5rc1Byb21pc2VzOiBQcm9taXNlPExpbmtEZWZpbml0aW9uW11bXVtdPltdLFxuXHRhU2VtYW50aWNPYmplY3RzOiBTZW1hbnRpY09iamVjdFtdLFxuXHRvSW50ZXJuYWxNb2RlbENvbnRleHQ6IEludGVybmFsTW9kZWxDb250ZXh0LFxuXHRzQ3VycmVudEhhc2g6IHN0cmluZ1xuKSB7XG5cdHR5cGUgU2VtYW50aWNPYmplY3RJbmZvID0geyBzZW1hbnRpY09iamVjdDogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IEhhc1RhcmdldHM6IGJvb2xlYW47IEhhc1RhcmdldHNOb3RGaWx0ZXJlZDogYm9vbGVhbiB9O1xuXHRyZXR1cm4gUHJvbWlzZS5hbGwoYUdldExpbmtzUHJvbWlzZXMpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGFWYWx1ZXMpIHtcblx0XHRcdGxldCBhTGlua3M6IExpbmtEZWZpbml0aW9uW11bXVtdLFxuXHRcdFx0XHRfb0xpbmssXG5cdFx0XHRcdF9zTGlua0ludGVudEFjdGlvbixcblx0XHRcdFx0YUZpbmFsTGlua3M6IExpbmtEZWZpbml0aW9uW11bXSA9IFtdO1xuXHRcdFx0bGV0IG9GaW5hbFNlbWFudGljT2JqZWN0czogUmVjb3JkPHN0cmluZywgU2VtYW50aWNPYmplY3RJbmZvPiA9IHt9O1xuXHRcdFx0Y29uc3QgYkludGVudEhhc0FjdGlvbnMgPSBmdW5jdGlvbiAoc0ludGVudDogc3RyaW5nLCBhQWN0aW9ucz86IHVua25vd25bXSkge1xuXHRcdFx0XHRmb3IgKGNvbnN0IGludGVudCBpbiBhQWN0aW9ucykge1xuXHRcdFx0XHRcdGlmIChpbnRlbnQgPT09IHNJbnRlbnQpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRmb3IgKGxldCBrID0gMDsgayA8IGFWYWx1ZXMubGVuZ3RoOyBrKyspIHtcblx0XHRcdFx0YUxpbmtzID0gYVZhbHVlc1trXTtcblx0XHRcdFx0aWYgKGFMaW5rcyAmJiBhTGlua3MubGVuZ3RoID4gMCAmJiBhTGlua3NbMF0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNvbnN0IG9TZW1hbnRpY09iamVjdDogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgU2VtYW50aWNPYmplY3RJbmZvPj4gPSB7fTtcblx0XHRcdFx0XHRsZXQgb1RtcDogU2VtYW50aWNPYmplY3RJbmZvO1xuXHRcdFx0XHRcdGxldCBzQWx0ZXJuYXRlUGF0aDtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFMaW5rcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0YUZpbmFsTGlua3MucHVzaChbXSk7XG5cdFx0XHRcdFx0XHRsZXQgaGFzVGFyZ2V0c05vdEZpbHRlcmVkID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRsZXQgaGFzVGFyZ2V0cyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgaUxpbmtDb3VudCA9IDA7IGlMaW5rQ291bnQgPCBhTGlua3NbaV1bMF0ubGVuZ3RoOyBpTGlua0NvdW50KyspIHtcblx0XHRcdFx0XHRcdFx0X29MaW5rID0gYUxpbmtzW2ldWzBdW2lMaW5rQ291bnRdO1xuXHRcdFx0XHRcdFx0XHRfc0xpbmtJbnRlbnRBY3Rpb24gPSBfb0xpbmsgJiYgX29MaW5rLmludGVudC5zcGxpdChcIj9cIilbMF0uc3BsaXQoXCItXCIpWzFdO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghKF9vTGluayAmJiBfb0xpbmsuaW50ZW50ICYmIF9vTGluay5pbnRlbnQuaW5kZXhPZihzQ3VycmVudEhhc2gpID09PSAwKSkge1xuXHRcdFx0XHRcdFx0XHRcdGhhc1RhcmdldHNOb3RGaWx0ZXJlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFiSW50ZW50SGFzQWN0aW9ucyhfc0xpbmtJbnRlbnRBY3Rpb24sIGFTZW1hbnRpY09iamVjdHNba10udW5hdmFpbGFibGVBY3Rpb25zKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0YUZpbmFsTGlua3NbaV0ucHVzaChfb0xpbmspO1xuXHRcdFx0XHRcdFx0XHRcdFx0aGFzVGFyZ2V0cyA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvVG1wID0ge1xuXHRcdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogYVNlbWFudGljT2JqZWN0c1trXS5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdFx0cGF0aDogYVNlbWFudGljT2JqZWN0c1trXS5wYXRoLFxuXHRcdFx0XHRcdFx0XHRIYXNUYXJnZXRzOiBoYXNUYXJnZXRzLFxuXHRcdFx0XHRcdFx0XHRIYXNUYXJnZXRzTm90RmlsdGVyZWQ6IGhhc1RhcmdldHNOb3RGaWx0ZXJlZFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGlmIChvU2VtYW50aWNPYmplY3RbYVNlbWFudGljT2JqZWN0c1trXS5zZW1hbnRpY09iamVjdF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRvU2VtYW50aWNPYmplY3RbYVNlbWFudGljT2JqZWN0c1trXS5zZW1hbnRpY09iamVjdF0gPSB7fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNBbHRlcm5hdGVQYXRoID0gYVNlbWFudGljT2JqZWN0c1trXS5wYXRoLnJlcGxhY2UoL1xcLy9nLCBcIl9cIik7XG5cdFx0XHRcdFx0XHRpZiAob1NlbWFudGljT2JqZWN0W2FTZW1hbnRpY09iamVjdHNba10uc2VtYW50aWNPYmplY3RdW3NBbHRlcm5hdGVQYXRoXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdG9TZW1hbnRpY09iamVjdFthU2VtYW50aWNPYmplY3RzW2tdLnNlbWFudGljT2JqZWN0XVtzQWx0ZXJuYXRlUGF0aF0gPSB7fSBhcyBTZW1hbnRpY09iamVjdEluZm87XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvU2VtYW50aWNPYmplY3RbYVNlbWFudGljT2JqZWN0c1trXS5zZW1hbnRpY09iamVjdF1bc0FsdGVybmF0ZVBhdGhdID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdFx0XHRcdFx0b1NlbWFudGljT2JqZWN0W2FTZW1hbnRpY09iamVjdHNba10uc2VtYW50aWNPYmplY3RdW3NBbHRlcm5hdGVQYXRoXSxcblx0XHRcdFx0XHRcdFx0b1RtcFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0TmFtZSA9IE9iamVjdC5rZXlzKG9TZW1hbnRpY09iamVjdClbMF07XG5cdFx0XHRcdFx0aWYgKE9iamVjdC5rZXlzKG9GaW5hbFNlbWFudGljT2JqZWN0cykuaW5jbHVkZXMoc1NlbWFudGljT2JqZWN0TmFtZSkpIHtcblx0XHRcdFx0XHRcdG9GaW5hbFNlbWFudGljT2JqZWN0c1tzU2VtYW50aWNPYmplY3ROYW1lXSA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHRcdFx0XHRcdG9GaW5hbFNlbWFudGljT2JqZWN0c1tzU2VtYW50aWNPYmplY3ROYW1lXSxcblx0XHRcdFx0XHRcdFx0b1NlbWFudGljT2JqZWN0W3NTZW1hbnRpY09iamVjdE5hbWVdXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvRmluYWxTZW1hbnRpY09iamVjdHMgPSBPYmplY3QuYXNzaWduKG9GaW5hbFNlbWFudGljT2JqZWN0cywgb1NlbWFudGljT2JqZWN0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YUZpbmFsTGlua3MgPSBbXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKE9iamVjdC5rZXlzKG9GaW5hbFNlbWFudGljT2JqZWN0cykubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXG5cdFx0XHRcdFx0XCJzZW1hbnRpY3NUYXJnZXRzXCIsXG5cdFx0XHRcdFx0bWVyZ2VPYmplY3RzKG9GaW5hbFNlbWFudGljT2JqZWN0cywgb0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwic2VtYW50aWNzVGFyZ2V0c1wiKSlcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIG9GaW5hbFNlbWFudGljT2JqZWN0cztcblx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiB1bmtub3duKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJmblVwZGF0ZVNlbWFudGljVGFyZ2V0c01vZGVsOiBDYW5ub3QgcmVhZCBsaW5rc1wiLCBvRXJyb3IgYXMgc3RyaW5nKTtcblx0XHR9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZm5HZXRTZW1hbnRpY09iamVjdFByb21pc2UoXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0b1ZpZXc6IFZpZXcsXG5cdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRzUGF0aDogc3RyaW5nLFxuXHRzUXVhbGlmaWVyOiBzdHJpbmdcbikge1xuXHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0U2VtYW50aWNPYmplY3RzRnJvbVBhdGgob01ldGFNb2RlbCwgc1BhdGgsIHNRdWFsaWZpZXIpO1xufVxuXG5mdW5jdGlvbiBmblByZXBhcmVTZW1hbnRpY09iamVjdHNQcm9taXNlcyhcblx0X29BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0X29WaWV3OiBWaWV3LFxuXHRfb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsXG5cdF9hU2VtYW50aWNPYmplY3RzRm91bmQ6IHN0cmluZ1tdLFxuXHRfYVNlbWFudGljT2JqZWN0c1Byb21pc2VzOiBQcm9taXNlPFNlbWFudGljT2JqZWN0RnJvbVBhdGg+W11cbikge1xuXHRsZXQgX0tleXM6IHN0cmluZ1tdLCBzUGF0aDtcblx0bGV0IHNRdWFsaWZpZXI6IHN0cmluZywgcmVnZXhSZXN1bHQ7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgX2FTZW1hbnRpY09iamVjdHNGb3VuZC5sZW5ndGg7IGkrKykge1xuXHRcdHNQYXRoID0gX2FTZW1hbnRpY09iamVjdHNGb3VuZFtpXTtcblx0XHRfS2V5cyA9IE9iamVjdC5rZXlzKF9vTWV0YU1vZGVsLmdldE9iamVjdChzUGF0aCArIFwiQFwiKSk7XG5cdFx0Zm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9LZXlzLmxlbmd0aDsgaW5kZXgrKykge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRfS2V5c1tpbmRleF0uaW5kZXhPZihgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0fWApID09PSAwICYmXG5cdFx0XHRcdF9LZXlzW2luZGV4XS5pbmRleE9mKGBAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3RNYXBwaW5nfWApID09PSAtMSAmJlxuXHRcdFx0XHRfS2V5c1tpbmRleF0uaW5kZXhPZihgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zfWApID09PSAtMVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJlZ2V4UmVzdWx0ID0gLyMoLiopLy5leGVjKF9LZXlzW2luZGV4XSk7XG5cdFx0XHRcdHNRdWFsaWZpZXIgPSByZWdleFJlc3VsdCA/IHJlZ2V4UmVzdWx0WzFdIDogXCJcIjtcblx0XHRcdFx0X2FTZW1hbnRpY09iamVjdHNQcm9taXNlcy5wdXNoKFxuXHRcdFx0XHRcdENvbW1vblV0aWxzLmdldFNlbWFudGljT2JqZWN0UHJvbWlzZShfb0FwcENvbXBvbmVudCwgX29WaWV3LCBfb01ldGFNb2RlbCwgc1BhdGgsIHNRdWFsaWZpZXIpXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbnR5cGUgSW50ZXJuYWxKU09OTW9kZWwgPSB7XG5cdF9nZXRPYmplY3QodmFsOiBzdHJpbmcsIGNvbnRleHQ/OiBDb250ZXh0KTogb2JqZWN0O1xufTtcbmZ1bmN0aW9uIGZuR2V0U2VtYW50aWNUYXJnZXRzRnJvbVBhZ2VNb2RlbChvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIHNQYWdlTW9kZWw6IHN0cmluZykge1xuXHRjb25zdCBfZm5maW5kVmFsdWVzSGVscGVyID0gZnVuY3Rpb24gKFxuXHRcdG9iajogdW5kZWZpbmVkIHwgbnVsbCB8IFJlY29yZDxzdHJpbmcsIHN0cmluZz5bXSB8IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuXHRcdGtleTogc3RyaW5nLFxuXHRcdGxpc3Q6IHN0cmluZ1tdXG5cdCkge1xuXHRcdGlmICghb2JqKSB7XG5cdFx0XHRyZXR1cm4gbGlzdDtcblx0XHR9XG5cdFx0aWYgKG9iaiBpbnN0YW5jZW9mIEFycmF5KSB7XG5cdFx0XHRvYmouZm9yRWFjaCgoaXRlbSkgPT4ge1xuXHRcdFx0XHRsaXN0ID0gbGlzdC5jb25jYXQoX2ZuZmluZFZhbHVlc0hlbHBlcihpdGVtLCBrZXksIFtdKSk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBsaXN0O1xuXHRcdH1cblx0XHRpZiAob2JqW2tleV0pIHtcblx0XHRcdGxpc3QucHVzaChvYmpba2V5XSBhcyBzdHJpbmcpO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2Ygb2JqID09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsKSB7XG5cdFx0XHRjb25zdCBjaGlsZHJlbiA9IE9iamVjdC5rZXlzKG9iaik7XG5cdFx0XHRpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bGlzdCA9IGxpc3QuY29uY2F0KF9mbmZpbmRWYWx1ZXNIZWxwZXIob2JqW2NoaWxkcmVuW2ldXSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwga2V5LCBbXSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBsaXN0O1xuXHR9O1xuXHRjb25zdCBfZm5maW5kVmFsdWVzID0gZnVuY3Rpb24gKG9iajogdW5kZWZpbmVkIHwgbnVsbCB8IFJlY29yZDxzdHJpbmcsIHN0cmluZz5bXSB8IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBrZXk6IHN0cmluZykge1xuXHRcdHJldHVybiBfZm5maW5kVmFsdWVzSGVscGVyKG9iaiwga2V5LCBbXSk7XG5cdH07XG5cdGNvbnN0IF9mbkRlbGV0ZUR1cGxpY2F0ZVNlbWFudGljT2JqZWN0cyA9IGZ1bmN0aW9uIChhU2VtYW50aWNPYmplY3RQYXRoOiBzdHJpbmdbXSkge1xuXHRcdHJldHVybiBhU2VtYW50aWNPYmplY3RQYXRoLmZpbHRlcihmdW5jdGlvbiAodmFsdWU6IHN0cmluZywgaW5kZXg6IG51bWJlcikge1xuXHRcdFx0cmV0dXJuIGFTZW1hbnRpY09iamVjdFBhdGguaW5kZXhPZih2YWx1ZSkgPT09IGluZGV4O1xuXHRcdH0pO1xuXHR9O1xuXHRjb25zdCBvVmlldyA9IG9Db250cm9sbGVyLmdldFZpZXcoKTtcblx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblxuXHRpZiAob0ludGVybmFsTW9kZWxDb250ZXh0KSB7XG5cdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0c1Byb21pc2VzOiBQcm9taXNlPFNlbWFudGljT2JqZWN0RnJvbVBhdGg+W10gPSBbXTtcblx0XHRjb25zdCBvQ29tcG9uZW50ID0gb0NvbnRyb2xsZXIuZ2V0T3duZXJDb21wb25lbnQoKTtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKG9Db21wb25lbnQpIGFzIEFwcENvbXBvbmVudDtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudC5nZXRNZXRhTW9kZWwoKTtcblx0XHRsZXQgb1BhZ2VNb2RlbCA9IChvQ29tcG9uZW50LmdldE1vZGVsKHNQYWdlTW9kZWwpIGFzIEpTT05Nb2RlbCkuZ2V0RGF0YSgpO1xuXHRcdGlmIChKU09OLnN0cmluZ2lmeShvUGFnZU1vZGVsKSA9PT0gXCJ7fVwiKSB7XG5cdFx0XHRvUGFnZU1vZGVsID0gKG9Db21wb25lbnQuZ2V0TW9kZWwoc1BhZ2VNb2RlbCkgYXMgdW5rbm93biBhcyBJbnRlcm5hbEpTT05Nb2RlbCkuX2dldE9iamVjdChcIi9cIiwgdW5kZWZpbmVkKTtcblx0XHR9XG5cdFx0bGV0IGFTZW1hbnRpY09iamVjdHNGb3VuZCA9IF9mbmZpbmRWYWx1ZXMob1BhZ2VNb2RlbCwgXCJzZW1hbnRpY09iamVjdFBhdGhcIik7XG5cdFx0YVNlbWFudGljT2JqZWN0c0ZvdW5kID0gX2ZuRGVsZXRlRHVwbGljYXRlU2VtYW50aWNPYmplY3RzKGFTZW1hbnRpY09iamVjdHNGb3VuZCk7XG5cdFx0Y29uc3Qgb1NoZWxsU2VydmljZUhlbHBlciA9IG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRcdGxldCBzQ3VycmVudEhhc2ggPSBvU2hlbGxTZXJ2aWNlSGVscGVyLmdldEhhc2goKTtcblx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RzRm9yR2V0TGlua3MgPSBbXTtcblx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RzOiBTZW1hbnRpY09iamVjdFtdID0gW107XG5cdFx0bGV0IF9vU2VtYW50aWNPYmplY3Q7XG5cblx0XHRpZiAoc0N1cnJlbnRIYXNoICYmIHNDdXJyZW50SGFzaC5pbmRleE9mKFwiP1wiKSAhPT0gLTEpIHtcblx0XHRcdC8vIHNDdXJyZW50SGFzaCBjYW4gY29udGFpbiBxdWVyeSBzdHJpbmcsIGN1dCBpdCBvZmYhXG5cdFx0XHRzQ3VycmVudEhhc2ggPSBzQ3VycmVudEhhc2guc3BsaXQoXCI/XCIpWzBdO1xuXHRcdH1cblxuXHRcdGZuUHJlcGFyZVNlbWFudGljT2JqZWN0c1Byb21pc2VzKG9BcHBDb21wb25lbnQsIG9WaWV3LCBvTWV0YU1vZGVsLCBhU2VtYW50aWNPYmplY3RzRm91bmQsIGFTZW1hbnRpY09iamVjdHNQcm9taXNlcyk7XG5cblx0XHRpZiAoYVNlbWFudGljT2JqZWN0c1Byb21pc2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRQcm9taXNlLmFsbChhU2VtYW50aWNPYmplY3RzUHJvbWlzZXMpXG5cdFx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChhVmFsdWVzKSB7XG5cdFx0XHRcdFx0Y29uc3QgYUdldExpbmtzUHJvbWlzZXMgPSBbXTtcblx0XHRcdFx0XHRsZXQgc1NlbU9iakV4cHJlc3Npb247XG5cdFx0XHRcdFx0dHlwZSBTZW1hbnRpY09iamVjdFJlc29sdmVkID0ge1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3RQYXRoOiBzdHJpbmc7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdEZvckdldExpbmtzOiB7IHNlbWFudGljT2JqZWN0OiBzdHJpbmcgfVtdO1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IHtcblx0XHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IHN0cmluZztcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR1bmF2YWlsYWJsZUFjdGlvbnM6IHN0cmluZ1tdO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBTZW1hbnRpY09iamVjdFJlc29sdmVkW10gPSBhVmFsdWVzLmZpbHRlcihmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRlbGVtZW50LnNlbWFudGljT2JqZWN0ICE9PSB1bmRlZmluZWQgJiZcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0XHRcdFx0XHR0eXBlb2YgZWxlbWVudC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdCA9PT0gXCJvYmplY3RcIlxuXHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdHNTZW1PYmpFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24ocGF0aEluTW9kZWwoZWxlbWVudC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdC4kUGF0aCkpITtcblx0XHRcdFx0XHRcdFx0KGVsZW1lbnQgYXMgdW5rbm93biBhcyBTZW1hbnRpY09iamVjdFJlc29sdmVkKS5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdCA9IHNTZW1PYmpFeHByZXNzaW9uO1xuXHRcdFx0XHRcdFx0XHRlbGVtZW50LnNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3NbMF0uc2VtYW50aWNPYmplY3QgPSBzU2VtT2JqRXhwcmVzc2lvbjtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGVsZW1lbnQpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGVsZW1lbnQuc2VtYW50aWNPYmplY3QgIT09IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KSBhcyB1bmtub3duIGFzIFNlbWFudGljT2JqZWN0UmVzb2x2ZWRbXTtcblx0XHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGFTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0X29TZW1hbnRpY09iamVjdCA9IGFTZW1hbnRpY09iamVjdHNSZXNvbHZlZFtqXTtcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0X29TZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0XHRcdFx0XHRfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0ICYmXG5cdFx0XHRcdFx0XHRcdCEoX29TZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdC5pbmRleE9mKFwie1wiKSA9PT0gMClcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RzRm9yR2V0TGlua3MucHVzaChfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3MpO1xuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RzLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0XHRcdHVuYXZhaWxhYmxlQWN0aW9uczogX29TZW1hbnRpY09iamVjdC51bmF2YWlsYWJsZUFjdGlvbnMsXG5cdFx0XHRcdFx0XHRcdFx0cGF0aDogYVNlbWFudGljT2JqZWN0c1Jlc29sdmVkW2pdLnNlbWFudGljT2JqZWN0UGF0aFxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0YUdldExpbmtzUHJvbWlzZXMucHVzaChvU2hlbGxTZXJ2aWNlSGVscGVyLmdldExpbmtzV2l0aENhY2hlKFtfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3NdKSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBDb21tb25VdGlscy51cGRhdGVTZW1hbnRpY1RhcmdldHMoYUdldExpbmtzUHJvbWlzZXMsIGFTZW1hbnRpY09iamVjdHMsIG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgc0N1cnJlbnRIYXNoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IHVua25vd24pIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJmbkdldFNlbWFudGljVGFyZ2V0c0Zyb21UYWJsZTogQ2Fubm90IGdldCBTZW1hbnRpYyBPYmplY3RzXCIsIG9FcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEZpbHRlckFsbG93ZWRFeHByZXNzaW9uKG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uPzogTWV0YU1vZGVsVHlwZTxGaWx0ZXJSZXN0cmljdGlvbnNUeXBlPikge1xuXHRjb25zdCBtQWxsb3dlZEV4cHJlc3Npb25zOiBfRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zID0ge307XG5cdGlmIChvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiAmJiBvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbi5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zICE9PSB1bmRlZmluZWQpIHtcblx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbi5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKG9Qcm9wZXJ0eSkge1xuXHRcdFx0aWYgKG9Qcm9wZXJ0eS5Qcm9wZXJ0eSAmJiBvUHJvcGVydHkuQWxsb3dlZEV4cHJlc3Npb25zICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdFx0XHRpZiAobUFsbG93ZWRFeHByZXNzaW9uc1tvUHJvcGVydHkuUHJvcGVydHkuJFByb3BlcnR5UGF0aF0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdG1BbGxvd2VkRXhwcmVzc2lvbnNbb1Byb3BlcnR5LlByb3BlcnR5LiRQcm9wZXJ0eVBhdGhdLnB1c2gob1Byb3BlcnR5LkFsbG93ZWRFeHByZXNzaW9ucyBhcyBzdHJpbmcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1BbGxvd2VkRXhwcmVzc2lvbnNbb1Byb3BlcnR5LlByb3BlcnR5LiRQcm9wZXJ0eVBhdGhdID0gW29Qcm9wZXJ0eS5BbGxvd2VkRXhwcmVzc2lvbnMgYXMgc3RyaW5nXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBtQWxsb3dlZEV4cHJlc3Npb25zO1xufVxuZnVuY3Rpb24gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKFxuXHRvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbj86IE1ldGFNb2RlbFR5cGU8RmlsdGVyUmVzdHJpY3Rpb25zVHlwZT4sXG5cdHNSZXN0cmljdGlvbj86IFwiUmVxdWlyZWRQcm9wZXJ0aWVzXCIgfCBcIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzXCJcbikge1xuXHRsZXQgYVByb3BzOiBzdHJpbmdbXSA9IFtdO1xuXHRpZiAob0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24gJiYgb0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb25bc1Jlc3RyaWN0aW9uIGFzIGtleW9mIE1ldGFNb2RlbFR5cGU8RmlsdGVyUmVzdHJpY3Rpb25zVHlwZT5dKSB7XG5cdFx0YVByb3BzID0gKFxuXHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb25bc1Jlc3RyaWN0aW9uIGFzIGtleW9mIE1ldGFNb2RlbFR5cGU8RmlsdGVyUmVzdHJpY3Rpb25zVHlwZT5dIGFzIEV4cGFuZFBhdGhUeXBlPEVkbS5Qcm9wZXJ0eVBhdGg+W11cblx0XHQpLm1hcChmdW5jdGlvbiAob1Byb3BlcnR5OiBFeHBhbmRQYXRoVHlwZTxFZG0uUHJvcGVydHlQYXRoPikge1xuXHRcdFx0cmV0dXJuIG9Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhUHJvcHM7XG59XG5cbmZ1bmN0aW9uIF9mZXRjaFByb3BlcnRpZXNGb3JOYXZQYXRoKHBhdGhzOiBzdHJpbmdbXSwgbmF2UGF0aDogc3RyaW5nLCBwcm9wczogc3RyaW5nW10pIHtcblx0Y29uc3QgbmF2UGF0aFByZWZpeCA9IG5hdlBhdGggKyBcIi9cIjtcblx0cmV0dXJuIHBhdGhzLnJlZHVjZSgob3V0UGF0aHM6IHN0cmluZ1tdLCBwYXRoVG9DaGVjazogc3RyaW5nKSA9PiB7XG5cdFx0aWYgKHBhdGhUb0NoZWNrLnN0YXJ0c1dpdGgobmF2UGF0aFByZWZpeCkpIHtcblx0XHRcdGNvbnN0IG91dFBhdGggPSBwYXRoVG9DaGVjay5yZXBsYWNlKG5hdlBhdGhQcmVmaXgsIFwiXCIpO1xuXHRcdFx0aWYgKG91dFBhdGhzLmluZGV4T2Yob3V0UGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdG91dFBhdGhzLnB1c2gob3V0UGF0aCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRQYXRocztcblx0fSwgcHJvcHMpO1xufVxudHlwZSBfRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zID0gUmVjb3JkPHN0cmluZywgc3RyaW5nW10+O1xudHlwZSBfRmlsdGVyUmVzdHJpY3Rpb25zID0ge1xuXHRSZXF1aXJlZFByb3BlcnRpZXM6IHN0cmluZ1tdO1xuXHROb25GaWx0ZXJhYmxlUHJvcGVydGllczogc3RyaW5nW107XG5cdEZpbHRlckFsbG93ZWRFeHByZXNzaW9uczogX0ZpbHRlckFsbG93ZWRFeHByZXNzaW9ucztcbn07XG5mdW5jdGlvbiBnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgoZW50aXR5UGF0aDogc3RyaW5nLCBvQ29udGV4dDogT0RhdGFNZXRhTW9kZWwpIHtcblx0Y29uc3Qgb1JldDogX0ZpbHRlclJlc3RyaWN0aW9ucyA9IHtcblx0XHRSZXF1aXJlZFByb3BlcnRpZXM6IFtdLFxuXHRcdE5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzOiBbXSxcblx0XHRGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnM6IHt9XG5cdH07XG5cdGxldCBvRmlsdGVyUmVzdHJpY3Rpb25zO1xuXHRjb25zdCBuYXZpZ2F0aW9uVGV4dCA9IFwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdcIjtcblx0Y29uc3QgZnJUZXJtID0gXCJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5GaWx0ZXJSZXN0cmljdGlvbnNcIjtcblx0Y29uc3QgZW50aXR5VHlwZVBhdGhQYXJ0cyA9IGVudGl0eVBhdGgucmVwbGFjZUFsbChcIiUyRlwiLCBcIi9cIikuc3BsaXQoXCIvXCIpLmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZyk7XG5cdGNvbnN0IGVudGl0eVR5cGVQYXRoID0gYC8ke2VudGl0eVR5cGVQYXRoUGFydHMuam9pbihcIi9cIil9L2A7XG5cdGNvbnN0IGVudGl0eVNldFBhdGggPSBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKGVudGl0eVBhdGgsIG9Db250ZXh0KTtcblx0Y29uc3QgZW50aXR5U2V0UGF0aFBhcnRzID0gZW50aXR5U2V0UGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKE1vZGVsSGVscGVyLmZpbHRlck91dE5hdlByb3BCaW5kaW5nKTtcblx0Y29uc3QgaXNDb250YWlubWVudCA9IG9Db250ZXh0LmdldE9iamVjdChgJHtlbnRpdHlUeXBlUGF0aH0kQ29udGFpbnNUYXJnZXRgKTtcblx0Y29uc3QgY29udGFpbm1lbnROYXZQYXRoID0gISFpc0NvbnRhaW5tZW50ICYmIGVudGl0eVR5cGVQYXRoUGFydHNbZW50aXR5VHlwZVBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblxuXHQvL0xFQVNUIFBSSU9SSVRZIC0gRmlsdGVyIHJlc3RyaWN0aW9ucyBkaXJlY3RseSBhdCBFbnRpdHkgU2V0XG5cdC8vZS5nLiBGUiBpbiBcIk5TLkVudGl0eUNvbnRhaW5lci9TYWxlc09yZGVyTWFuYWdlXCIgQ29udGV4dFBhdGg6IC9TYWxlc09yZGVyTWFuYWdlXG5cdGlmICghaXNDb250YWlubWVudCkge1xuXHRcdG9GaWx0ZXJSZXN0cmljdGlvbnMgPSBvQ29udGV4dC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0UGF0aH0ke2ZyVGVybX1gKSBhcyBNZXRhTW9kZWxUeXBlPEZpbHRlclJlc3RyaWN0aW9uc1R5cGU+IHwgdW5kZWZpbmVkO1xuXHRcdG9SZXQuUmVxdWlyZWRQcm9wZXJ0aWVzID0gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKG9GaWx0ZXJSZXN0cmljdGlvbnMsIFwiUmVxdWlyZWRQcm9wZXJ0aWVzXCIpIHx8IFtdO1xuXHRcdGNvbnN0IHJlc3VsdENvbnRleHRDaGVjayA9IG9Db250ZXh0LmdldE9iamVjdChgJHtlbnRpdHlUeXBlUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlc3VsdENvbnRleHRgKTtcblx0XHRpZiAoIXJlc3VsdENvbnRleHRDaGVjaykge1xuXHRcdFx0b1JldC5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyA9IGdldEZpbHRlclJlc3RyaWN0aW9ucyhvRmlsdGVyUmVzdHJpY3Rpb25zLCBcIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzXCIpIHx8IFtdO1xuXHRcdH1cblx0XHQvL1NpbmdsZVZhbHVlIHwgTXVsdGlWYWx1ZSB8IFNpbmdsZVJhbmdlIHwgTXVsdGlSYW5nZSB8IFNlYXJjaEV4cHJlc3Npb24gfCBNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXG5cdFx0b1JldC5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgPSBnZXRGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbihvRmlsdGVyUmVzdHJpY3Rpb25zKSB8fCB7fTtcblx0fVxuXG5cdGlmIChlbnRpdHlUeXBlUGF0aFBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRjb25zdCBuYXZQYXRoID0gaXNDb250YWlubWVudCA/IChjb250YWlubWVudE5hdlBhdGggYXMgc3RyaW5nKSA6IGVudGl0eVNldFBhdGhQYXJ0c1tlbnRpdHlTZXRQYXRoUGFydHMubGVuZ3RoIC0gMV07XG5cdFx0Ly8gSW4gY2FzZSBvZiBjb250YWlubWVudCB3ZSB0YWtlIGVudGl0eVNldCBwcm92aWRlZCBhcyBwYXJlbnQuIEFuZCBpbiBjYXNlIG9mIG5vcm1hbCB3ZSB3b3VsZCByZW1vdmUgdGhlIGxhc3QgbmF2aWdhdGlvbiBmcm9tIGVudGl0eVNldFBhdGguXG5cdFx0Y29uc3QgcGFyZW50RW50aXR5U2V0UGF0aCA9IGlzQ29udGFpbm1lbnQgPyBlbnRpdHlTZXRQYXRoIDogYC8ke2VudGl0eVNldFBhdGhQYXJ0cy5zbGljZSgwLCAtMSkuam9pbihgLyR7bmF2aWdhdGlvblRleHR9L2ApfWA7XG5cdFx0Ly9USElSRCBISUdIRVNUIFBSSU9SSVRZIC0gUmVhZGluZyBwcm9wZXJ0eSBwYXRoIHJlc3RyaWN0aW9ucyAtIEFubm90YXRpb24gYXQgbWFpbiBlbnRpdHkgYnV0IGRpcmVjdGx5IG9uIG5hdmlnYXRpb24gcHJvcGVydHkgcGF0aFxuXHRcdC8vZS5nLiBQYXJlbnQgQ3VzdG9tZXIgd2l0aCBQcm9wZXJ0eVBhdGg9XCJTZXQvQ2l0eU5hbWVcIiBDb250ZXh0UGF0aDogQ3VzdG9tZXIvU2V0XG5cdFx0Y29uc3Qgb1BhcmVudFJldDogX0ZpbHRlclJlc3RyaWN0aW9ucyA9IHtcblx0XHRcdFJlcXVpcmVkUHJvcGVydGllczogW10sXG5cdFx0XHROb25GaWx0ZXJhYmxlUHJvcGVydGllczogW10sXG5cdFx0XHRGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnM6IHt9XG5cdFx0fTtcblx0XHRpZiAoIW5hdlBhdGguaW5jbHVkZXMoXCIlMkZcIikpIHtcblx0XHRcdGNvbnN0IG9QYXJlbnRGUiA9IG9Db250ZXh0LmdldE9iamVjdChgJHtwYXJlbnRFbnRpdHlTZXRQYXRofSR7ZnJUZXJtfWApIGFzIE1ldGFNb2RlbFR5cGU8RmlsdGVyUmVzdHJpY3Rpb25zVHlwZT4gfCB1bmRlZmluZWQ7XG5cdFx0XHRvUmV0LlJlcXVpcmVkUHJvcGVydGllcyA9IF9mZXRjaFByb3BlcnRpZXNGb3JOYXZQYXRoKFxuXHRcdFx0XHRnZXRGaWx0ZXJSZXN0cmljdGlvbnMob1BhcmVudEZSLCBcIlJlcXVpcmVkUHJvcGVydGllc1wiKSB8fCBbXSxcblx0XHRcdFx0bmF2UGF0aCxcblx0XHRcdFx0b1JldC5SZXF1aXJlZFByb3BlcnRpZXMgfHwgW11cblx0XHRcdCk7XG5cdFx0XHRvUmV0Lk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzID0gX2ZldGNoUHJvcGVydGllc0Zvck5hdlBhdGgoXG5cdFx0XHRcdGdldEZpbHRlclJlc3RyaWN0aW9ucyhvUGFyZW50RlIsIFwiTm9uRmlsdGVyYWJsZVByb3BlcnRpZXNcIikgfHwgW10sXG5cdFx0XHRcdG5hdlBhdGgsXG5cdFx0XHRcdG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgfHwgW11cblx0XHRcdCk7XG5cdFx0XHQvL1NpbmdsZVZhbHVlIHwgTXVsdGlWYWx1ZSB8IFNpbmdsZVJhbmdlIHwgTXVsdGlSYW5nZSB8IFNlYXJjaEV4cHJlc3Npb24gfCBNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXG5cdFx0XHRjb25zdCBjb21wbGV0ZUFsbG93ZWRFeHBzID0gZ2V0RmlsdGVyQWxsb3dlZEV4cHJlc3Npb24ob1BhcmVudEZSKSB8fCB7fTtcblx0XHRcdG9QYXJlbnRSZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zID0gT2JqZWN0LmtleXMoY29tcGxldGVBbGxvd2VkRXhwcykucmVkdWNlKFxuXHRcdFx0XHQob3V0UHJvcDogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+LCBwcm9wUGF0aDogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHByb3BQYXRoLnN0YXJ0c1dpdGgobmF2UGF0aCArIFwiL1wiKSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb3V0UHJvcFBhdGggPSBwcm9wUGF0aC5yZXBsYWNlKG5hdlBhdGggKyBcIi9cIiwgXCJcIik7XG5cdFx0XHRcdFx0XHRvdXRQcm9wW291dFByb3BQYXRoXSA9IGNvbXBsZXRlQWxsb3dlZEV4cHNbcHJvcFBhdGhdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gb3V0UHJvcDtcblx0XHRcdFx0fSxcblx0XHRcdFx0e30gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdC8vU2luZ2xlVmFsdWUgfCBNdWx0aVZhbHVlIHwgU2luZ2xlUmFuZ2UgfCBNdWx0aVJhbmdlIHwgU2VhcmNoRXhwcmVzc2lvbiB8IE11bHRpUmFuZ2VPclNlYXJjaEV4cHJlc3Npb25cblx0XHRvUmV0LkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyA9IG1lcmdlT2JqZWN0cyhcblx0XHRcdHt9LFxuXHRcdFx0b1JldC5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgfHwge30sXG5cdFx0XHRvUGFyZW50UmV0LkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyB8fCB7fVxuXHRcdCkgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+O1xuXG5cdFx0Ly9TRUNPTkQgSElHSEVTVCBwcmlvcml0eSAtIE5hdmlnYXRpb24gcmVzdHJpY3Rpb25zXG5cdFx0Ly9lLmcuIFBhcmVudCBcIi9DdXN0b21lclwiIHdpdGggTmF2aWdhdGlvblByb3BlcnR5UGF0aD1cIlNldFwiIENvbnRleHRQYXRoOiBDdXN0b21lci9TZXRcblx0XHRjb25zdCBvTmF2UmVzdHJpY3Rpb25zID0gTWV0YU1vZGVsRnVuY3Rpb24uZ2V0TmF2aWdhdGlvblJlc3RyaWN0aW9ucyhvQ29udGV4dCwgcGFyZW50RW50aXR5U2V0UGF0aCwgbmF2UGF0aC5yZXBsYWNlQWxsKFwiJTJGXCIsIFwiL1wiKSk7XG5cdFx0Y29uc3Qgb05hdkZpbHRlclJlc3QgPSBvTmF2UmVzdHJpY3Rpb25zICYmIChvTmF2UmVzdHJpY3Rpb25zW1wiRmlsdGVyUmVzdHJpY3Rpb25zXCJdIGFzIE1ldGFNb2RlbFR5cGU8RmlsdGVyUmVzdHJpY3Rpb25zVHlwZT4pO1xuXHRcdGNvbnN0IG5hdlJlc1JlcVByb3BzID0gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKG9OYXZGaWx0ZXJSZXN0LCBcIlJlcXVpcmVkUHJvcGVydGllc1wiKSB8fCBbXTtcblx0XHRvUmV0LlJlcXVpcmVkUHJvcGVydGllcyA9IHVuaXF1ZVNvcnQob1JldC5SZXF1aXJlZFByb3BlcnRpZXMuY29uY2F0KG5hdlJlc1JlcVByb3BzKSk7XG5cdFx0Y29uc3QgbmF2Tm9uRmlsdGVyUHJvcHMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMob05hdkZpbHRlclJlc3QsIFwiTm9uRmlsdGVyYWJsZVByb3BlcnRpZXNcIikgfHwgW107XG5cdFx0b1JldC5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyA9IHVuaXF1ZVNvcnQob1JldC5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcy5jb25jYXQobmF2Tm9uRmlsdGVyUHJvcHMpKTtcblx0XHQvL1NpbmdsZVZhbHVlIHwgTXVsdGlWYWx1ZSB8IFNpbmdsZVJhbmdlIHwgTXVsdGlSYW5nZSB8IFNlYXJjaEV4cHJlc3Npb24gfCBNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXG5cdFx0b1JldC5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgPSBtZXJnZU9iamVjdHMoXG5cdFx0XHR7fSxcblx0XHRcdG9SZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zIHx8IHt9LFxuXHRcdFx0Z2V0RmlsdGVyQWxsb3dlZEV4cHJlc3Npb24ob05hdkZpbHRlclJlc3QpIHx8IHt9XG5cdFx0KSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT47XG5cblx0XHQvL0hJR0hFU1QgcHJpb3JpdHkgLSBSZXN0cmljdGlvbnMgaGF2aW5nIHRhcmdldCB3aXRoIG5hdmlnYXRpb24gYXNzb2NpYXRpb24gZW50aXR5XG5cdFx0Ly8gZS5nLiBGUiBpbiBcIkN1c3RvbWVyUGFyYW1ldGVycy9TZXRcIiBDb250ZXh0UGF0aDogXCJDdXN0b21lci9TZXRcIlxuXHRcdGNvbnN0IG5hdkFzc29jaWF0aW9uRW50aXR5UmVzdCA9IG9Db250ZXh0LmdldE9iamVjdChcblx0XHRcdGAvJHtlbnRpdHlUeXBlUGF0aFBhcnRzLmpvaW4oXCIvXCIpfSR7ZnJUZXJtfWBcblx0XHQpIGFzIE1ldGFNb2RlbFR5cGU8RmlsdGVyUmVzdHJpY3Rpb25zVHlwZT47XG5cdFx0Y29uc3QgbmF2QXNzb2NSZXFQcm9wcyA9IGdldEZpbHRlclJlc3RyaWN0aW9ucyhuYXZBc3NvY2lhdGlvbkVudGl0eVJlc3QsIFwiUmVxdWlyZWRQcm9wZXJ0aWVzXCIpIHx8IFtdO1xuXHRcdG9SZXQuUmVxdWlyZWRQcm9wZXJ0aWVzID0gdW5pcXVlU29ydChvUmV0LlJlcXVpcmVkUHJvcGVydGllcy5jb25jYXQobmF2QXNzb2NSZXFQcm9wcykpO1xuXHRcdGNvbnN0IG5hdkFzc29jTm9uRmlsdGVyUHJvcHMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMobmF2QXNzb2NpYXRpb25FbnRpdHlSZXN0LCBcIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzXCIpIHx8IFtdO1xuXHRcdG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgPSB1bmlxdWVTb3J0KG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMuY29uY2F0KG5hdkFzc29jTm9uRmlsdGVyUHJvcHMpKTtcblx0XHQvL1NpbmdsZVZhbHVlIHwgTXVsdGlWYWx1ZSB8IFNpbmdsZVJhbmdlIHwgTXVsdGlSYW5nZSB8IFNlYXJjaEV4cHJlc3Npb24gfCBNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXG5cdFx0b1JldC5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgPSBtZXJnZU9iamVjdHMoXG5cdFx0XHR7fSxcblx0XHRcdG9SZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zLFxuXHRcdFx0Z2V0RmlsdGVyQWxsb3dlZEV4cHJlc3Npb24obmF2QXNzb2NpYXRpb25FbnRpdHlSZXN0KSB8fCB7fVxuXHRcdCkgYXMgX0ZpbHRlckFsbG93ZWRFeHByZXNzaW9ucztcblx0fVxuXHRyZXR1cm4gb1JldDtcbn1cblxudHlwZSBQcmVwcm9jZXNzb3JTZXR0aW5ncyA9IHtcblx0YmluZGluZ0NvbnRleHRzOiBvYmplY3Q7XG5cdG1vZGVsczogb2JqZWN0O1xufTtcbnR5cGUgQmFzZVRyZWVNb2RpZmllciA9IHtcblx0dGVtcGxhdGVDb250cm9sRnJhZ21lbnQoXG5cdFx0c0ZyYWdtZW50TmFtZTogc3RyaW5nLFxuXHRcdG1QcmVwcm9jZXNzb3JTZXR0aW5nczogUHJlcHJvY2Vzc29yU2V0dGluZ3MsXG5cdFx0b1ZpZXc/OiBWaWV3XG5cdCk6IFByb21pc2U8VUk1RWxlbWVudFtdIHwgRWxlbWVudFtdPjtcblx0dGFyZ2V0czogc3RyaW5nO1xufTtcblxuYXN5bmMgZnVuY3Rpb24gdGVtcGxhdGVDb250cm9sRnJhZ21lbnQoXG5cdHNGcmFnbWVudE5hbWU6IHN0cmluZyxcblx0b1ByZXByb2Nlc3NvclNldHRpbmdzOiBQcmVwcm9jZXNzb3JTZXR0aW5ncyxcblx0b09wdGlvbnM6IHsgdmlldz86IFZpZXc7IGlzWE1MPzogYm9vbGVhbjsgaWQ6IHN0cmluZzsgY29udHJvbGxlcjogQ29udHJvbGxlciB9LFxuXHRvTW9kaWZpZXI/OiBCYXNlVHJlZU1vZGlmaWVyXG4pOiBQcm9taXNlPEVsZW1lbnQgfCBVSTVFbGVtZW50IHwgRWxlbWVudFtdIHwgVUk1RWxlbWVudFtdPiB7XG5cdG9PcHRpb25zID0gb09wdGlvbnMgfHwge307XG5cdGlmIChvTW9kaWZpZXIpIHtcblx0XHRyZXR1cm4gb01vZGlmaWVyLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KHNGcmFnbWVudE5hbWUsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywgb09wdGlvbnMudmlldykudGhlbihmdW5jdGlvbiAob0ZyYWdtZW50KSB7XG5cdFx0XHQvLyBUaGlzIGlzIHJlcXVpcmVkIGFzIEZsZXggcmV0dXJucyBhbiBIVE1MQ29sbGVjdGlvbiBhcyB0ZW1wbGF0aW5nIHJlc3VsdCBpbiBYTUwgdGltZS5cblx0XHRcdHJldHVybiBvTW9kaWZpZXIudGFyZ2V0cyA9PT0gXCJ4bWxUcmVlXCIgJiYgb0ZyYWdtZW50Lmxlbmd0aCA+IDAgPyBvRnJhZ21lbnRbMF0gOiBvRnJhZ21lbnQ7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3Qgb0ZyYWdtZW50ID0gYXdhaXQgWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRYTUxUZW1wbGF0ZVByb2Nlc3Nvci5sb2FkVGVtcGxhdGUoc0ZyYWdtZW50TmFtZSwgXCJmcmFnbWVudFwiKSxcblx0XHRcdHsgbmFtZTogc0ZyYWdtZW50TmFtZSB9LFxuXHRcdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzXG5cdFx0KTtcblx0XHRjb25zdCBvQ29udHJvbCA9IG9GcmFnbWVudC5maXJzdEVsZW1lbnRDaGlsZDtcblx0XHRpZiAoISFvT3B0aW9ucy5pc1hNTCAmJiBvQ29udHJvbCkge1xuXHRcdFx0cmV0dXJuIG9Db250cm9sO1xuXHRcdH1cblx0XHRyZXR1cm4gRnJhZ21lbnQubG9hZCh7XG5cdFx0XHRpZDogb09wdGlvbnMuaWQsXG5cdFx0XHRkZWZpbml0aW9uOiBvRnJhZ21lbnQgYXMgdW5rbm93biBhcyBzdHJpbmcsXG5cdFx0XHRjb250cm9sbGVyOiBvT3B0aW9ucy5jb250cm9sbGVyXG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0U2luZ2xldG9uUGF0aChwYXRoOiBzdHJpbmcsIG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRjb25zdCBwYXJ0cyA9IHBhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihCb29sZWFuKSxcblx0XHRwcm9wZXJ0eU5hbWUgPSBwYXJ0cy5wb3AoKSEsXG5cdFx0bmF2aWdhdGlvblBhdGggPSBwYXJ0cy5qb2luKFwiL1wiKSxcblx0XHRlbnRpdHlTZXQgPSBuYXZpZ2F0aW9uUGF0aCAmJiBtZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtuYXZpZ2F0aW9uUGF0aH1gKTtcblx0aWYgKGVudGl0eVNldD8uJGtpbmQgPT09IFwiU2luZ2xldG9uXCIpIHtcblx0XHRjb25zdCBzaW5nbGV0b25OYW1lID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIGAvJHtzaW5nbGV0b25OYW1lfS8ke3Byb3BlcnR5TmFtZX1gO1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlcXVlc3RTaW5nbGV0b25Qcm9wZXJ0eShwYXRoOiBzdHJpbmcsIG1vZGVsOiBPRGF0YU1vZGVsKSB7XG5cdGlmICghcGF0aCB8fCAhbW9kZWwpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHR9XG5cdGNvbnN0IG1ldGFNb2RlbCA9IG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHQvLyBGaW5kIHRoZSB1bmRlcmx5aW5nIGVudGl0eSBzZXQgZnJvbSB0aGUgcHJvcGVydHkgcGF0aCBhbmQgY2hlY2sgd2hldGhlciBpdCBpcyBhIHNpbmdsZXRvbi5cblx0Y29uc3QgcmVzb2x2ZWRQYXRoID0gZ2V0U2luZ2xldG9uUGF0aChwYXRoLCBtZXRhTW9kZWwpO1xuXHRpZiAocmVzb2x2ZWRQYXRoKSB7XG5cdFx0Y29uc3QgcHJvcGVydHlCaW5kaW5nID0gbW9kZWwuYmluZFByb3BlcnR5KHJlc29sdmVkUGF0aCk7XG5cdFx0cmV0dXJuIHByb3BlcnR5QmluZGluZy5yZXF1ZXN0VmFsdWUoKTtcblx0fVxuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG59XG5cbi8vIEdldCB0aGUgcGF0aCBmb3IgYWN0aW9uIHBhcmFtZXRlcnMgdGhhdCBpcyBuZWVkZWQgdG8gcmVhZCB0aGUgYW5ub3RhdGlvbnNcbmZ1bmN0aW9uIGdldFBhcmFtZXRlclBhdGgoc1BhdGg6IHN0cmluZywgc1BhcmFtZXRlcjogc3RyaW5nKSB7XG5cdGxldCBzQ29udGV4dDtcblx0aWYgKHNQYXRoLmluZGV4T2YoXCJAJHVpNS5vdmVybG9hZFwiKSA+IC0xKSB7XG5cdFx0c0NvbnRleHQgPSBzUGF0aC5zcGxpdChcIkAkdWk1Lm92ZXJsb2FkXCIpWzBdO1xuXHR9IGVsc2Uge1xuXHRcdC8vIEZvciBVbmJvdW5kIEFjdGlvbnMgaW4gQWN0aW9uIFBhcmFtZXRlciBEaWFsb2dzXG5cdFx0Y29uc3QgYUFjdGlvbiA9IHNQYXRoLnNwbGl0KFwiLzBcIilbMF0uc3BsaXQoXCIuXCIpO1xuXHRcdHNDb250ZXh0ID0gYC8ke2FBY3Rpb25bYUFjdGlvbi5sZW5ndGggLSAxXX0vYDtcblx0fVxuXHRyZXR1cm4gc0NvbnRleHQgKyBzUGFyYW1ldGVyO1xufVxuXG4vKipcbiAqIEdldCByZXNvbHZlZCBleHByZXNzaW9uIGJpbmRpbmcgdXNlZCBmb3IgdGV4dHMgYXQgcnVudGltZS5cbiAqXG4gKiBAcGFyYW0gZXhwQmluZGluZ1xuICogQHBhcmFtIGNvbnRyb2xcbiAqIEBmdW5jdGlvblxuICogQHN0YXRpY1xuICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLkNvbW1vblV0aWxzXG4gKiBAcmV0dXJucyBBIHN0cmluZyBhZnRlciByZXNvbHV0aW9uLlxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIF9mbnRyYW5zbGF0ZWRUZXh0RnJvbUV4cEJpbmRpbmdTdHJpbmcoZXhwQmluZGluZzogc3RyaW5nLCBjb250cm9sOiBDb250cm9sKSB7XG5cdC8vIFRoZSBpZGVhIGhlcmUgaXMgdG8gY3JlYXRlIGR1bW15IGVsZW1lbnQgd2l0aCB0aGUgZXhwcmVzaW9uIGJpbmRpbmcuXG5cdC8vIEFkZGluZyBpdCBhcyBkZXBlbmRlbnQgdG8gdGhlIHZpZXcvY29udHJvbCB3b3VsZCBwcm9wYWdhdGUgYWxsIHRoZSBtb2RlbHMgdG8gdGhlIGR1bW15IGVsZW1lbnQgYW5kIHJlc29sdmUgdGhlIGJpbmRpbmcuXG5cdC8vIFdlIHJlbW92ZSB0aGUgZHVtbXkgZWxlbWVudCBhZnRlciB0aGF0IGFuZCBkZXN0cm95IGl0LlxuXG5cdGNvbnN0IGFueVJlc291cmNlVGV4dCA9IG5ldyBBbnlFbGVtZW50KHsgYW55VGV4dDogZXhwQmluZGluZyB9KTtcblx0Y29udHJvbC5hZGREZXBlbmRlbnQoYW55UmVzb3VyY2VUZXh0KTtcblx0Y29uc3QgcmVzdWx0VGV4dCA9IGFueVJlc291cmNlVGV4dC5nZXRBbnlUZXh0KCk7XG5cdGNvbnRyb2wucmVtb3ZlRGVwZW5kZW50KGFueVJlc291cmNlVGV4dCk7XG5cdGFueVJlc291cmNlVGV4dC5kZXN0cm95KCk7XG5cblx0cmV0dXJuIHJlc3VsdFRleHQ7XG59XG4vKipcbiAqIENoZWNrIGlmIHRoZSBjdXJyZW50IGRldmljZSBoYXMgYSBzbWFsbCBzY3JlZW4uXG4gKlxuICogQHJldHVybnMgQSBCb29sZWFuLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaXNTbWFsbERldmljZSgpIHtcblx0cmV0dXJuICFzeXN0ZW0uZGVza3RvcCB8fCBEZXZpY2UucmVzaXplLndpZHRoIDw9IDMyMDtcbn1cbi8qKlxuICogR2V0IGZpbHRlciBpbmZvcm1hdGlvbiBmb3IgYSBTZWxlY3Rpb25WYXJpYW50IGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIG9Db250cm9sIFRoZSB0YWJsZS9jaGFydCBpbnN0YW5jZVxuICogQHBhcmFtIHNlbGVjdGlvblZhcmlhbnRQYXRoIFJlbGF0aXZlIFNlbGVjdGlvblZhcmlhbnQgYW5ub3RhdGlvbiBwYXRoXG4gKiBAcGFyYW0gaXNDaGFydFxuICogQHJldHVybnMgSW5mb3JtYXRpb24gb24gZmlsdGVyc1xuICogIGZpbHRlcnM6IGFycmF5IG9mIHNhcC51aS5tb2RlbC5maWx0ZXJzXG4gKiB0ZXh0OiBUZXh0IHByb3BlcnR5IG9mIHRoZSBTZWxlY3Rpb25WYXJpYW50XG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmludGVyZmFjZSBJU2VsZWN0aW9uT3B0aW9uIHtcblx0UHJvcGVydHlOYW1lOiB7ICRQcm9wZXJ0eVBhdGg6IHN0cmluZyB9O1xuXHRSYW5nZXM6IHtcblx0XHRba2V5OiBzdHJpbmddOiB7XG5cdFx0XHRPcHRpb246IHsgJEVudW1NZW1iZXI6IFN0cmluZyB9O1xuXHRcdFx0TG93OiB1bmtub3duO1xuXHRcdFx0SGlnaDogdW5rbm93bjtcblx0XHR9O1xuXHR9O1xufVxuZnVuY3Rpb24gZ2V0RmlsdGVyc0luZm9Gb3JTVihvQ29udHJvbDogQ29udHJvbCB8IE1EQ0NoYXJ0IHwgTURDVGFibGUsIHNlbGVjdGlvblZhcmlhbnRQYXRoOiBzdHJpbmcsIGlzQ2hhcnQ/OiBib29sZWFuKSB7XG5cdGNvbnN0IHNFbnRpdHlUeXBlUGF0aCA9IG9Db250cm9sLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdG9NZXRhTW9kZWwgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob0NvbnRyb2wgYXMgQ29udHJvbCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0bVByb3BlcnR5RmlsdGVyczogUmVjb3JkPHN0cmluZywgRmlsdGVyW10+ID0ge30sXG5cdFx0YUZpbHRlcnMgPSBbXSxcblx0XHRhUGF0aHM6IHN0cmluZ1tdID0gW107XG5cdGxldCBzVGV4dCA9IFwiXCI7XG5cdGxldCBvU2VsZWN0aW9uVmFyaWFudCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlUeXBlUGF0aH0ke3NlbGVjdGlvblZhcmlhbnRQYXRofWApO1xuXHQvLyBmb3IgY2hhcnQgdGhlIHN0cnVjdHVyZSB2YXJpZXMgaGVuY2UgcmVhZCBpdCBmcm9tIG1haW4gb2JqZWN0XG5cdGlmIChpc0NoYXJ0KSB7XG5cdFx0b1NlbGVjdGlvblZhcmlhbnQgPSBvU2VsZWN0aW9uVmFyaWFudC5TZWxlY3Rpb25WYXJpYW50O1xuXHR9XG5cdGlmIChvU2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdHNUZXh0ID0gb1NlbGVjdGlvblZhcmlhbnQuVGV4dDtcblx0XHQob1NlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucyB8fCBbXSlcblx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9TZWxlY3RPcHRpb246IElTZWxlY3Rpb25PcHRpb24pIHtcblx0XHRcdFx0cmV0dXJuIG9TZWxlY3RPcHRpb24gJiYgb1NlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWUgJiYgb1NlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWUuJFByb3BlcnR5UGF0aDtcblx0XHRcdH0pXG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAob1NlbGVjdE9wdGlvbjogSVNlbGVjdGlvbk9wdGlvbikge1xuXHRcdFx0XHRjb25zdCBzUGF0aCA9IG9TZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lLiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdGlmICghYVBhdGhzLmluY2x1ZGVzKHNQYXRoKSkge1xuXHRcdFx0XHRcdGFQYXRocy5wdXNoKHNQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKGNvbnN0IGogaW4gb1NlbGVjdE9wdGlvbi5SYW5nZXMpIHtcblx0XHRcdFx0XHRjb25zdCBvUmFuZ2UgPSBvU2VsZWN0T3B0aW9uLlJhbmdlc1tqXTtcblx0XHRcdFx0XHRtUHJvcGVydHlGaWx0ZXJzW3NQYXRoXSA9IChtUHJvcGVydHlGaWx0ZXJzW3NQYXRoXSB8fCBbXSkuY29uY2F0KFxuXHRcdFx0XHRcdFx0bmV3IEZpbHRlcihzUGF0aCwgb1JhbmdlLk9wdGlvbj8uJEVudW1NZW1iZXI/LnNwbGl0KFwiL1wiKS5wb3AoKSBhcyB1bmRlZmluZWQsIG9SYW5nZS5Mb3csIG9SYW5nZS5IaWdoKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0Zm9yIChjb25zdCBzUHJvcGVydHlQYXRoIGluIG1Qcm9wZXJ0eUZpbHRlcnMpIHtcblx0XHRcdGFGaWx0ZXJzLnB1c2goXG5cdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdGZpbHRlcnM6IG1Qcm9wZXJ0eUZpbHRlcnNbc1Byb3BlcnR5UGF0aF0sXG5cdFx0XHRcdFx0YW5kOiBmYWxzZVxuXHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHByb3BlcnRpZXM6IGFQYXRocyxcblx0XHRmaWx0ZXJzOiBhRmlsdGVycyxcblx0XHR0ZXh0OiBzVGV4dFxuXHR9O1xufVxuXG5mdW5jdGlvbiBnZXRDb252ZXJ0ZXJDb250ZXh0Rm9yUGF0aChzTWV0YVBhdGg6IHN0cmluZywgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIHNFbnRpdHlTZXQ6IHN0cmluZywgb0RpYWdub3N0aWNzOiBEaWFnbm9zdGljcykge1xuXHRjb25zdCBvQ29udGV4dCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc01ldGFQYXRoKSBhcyBPRGF0YVY0Q29udGV4dDtcblx0cmV0dXJuIENvbnZlcnRlckNvbnRleHQ/LmNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyhzRW50aXR5U2V0LCBvQ29udGV4dCB8fCBvTWV0YU1vZGVsLCBvRGlhZ25vc3RpY3MsIG1lcmdlT2JqZWN0cywgdW5kZWZpbmVkKTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYW4gSUQgd2hpY2ggc2hvdWxkIGJlIHVzZWQgaW4gdGhlIGludGVybmFsIGNoYXJ0IGZvciB0aGUgbWVhc3VyZSBvciBkaW1lbnNpb24uXG4gKiBGb3Igc3RhbmRhcmQgY2FzZXMsIHRoaXMgaXMganVzdCB0aGUgSUQgb2YgdGhlIHByb3BlcnR5LlxuICogSWYgaXQgaXMgbmVjZXNzYXJ5IHRvIHVzZSBhbm90aGVyIElEIGludGVybmFsbHkgaW5zaWRlIHRoZSBjaGFydCAoZS5nLiBvbiBkdXBsaWNhdGUgcHJvcGVydHkgSURzKSB0aGlzIG1ldGhvZCBjYW4gYmUgb3ZlcndyaXR0ZW4uXG4gKiBJbiB0aGlzIGNhc2UsIDxjb2RlPmdldFByb3BlcnR5RnJvbU5hbWVBbmRLaW5kPC9jb2RlPiBuZWVkcyB0byBiZSBvdmVyd3JpdHRlbiBhcyB3ZWxsLlxuICpcbiAqIEBwYXJhbSBuYW1lIElEIG9mIHRoZSBwcm9wZXJ0eVxuICogQHBhcmFtIGtpbmQgVHlwZSBvZiB0aGUgcHJvcGVydHkgKG1lYXN1cmUgb3IgZGltZW5zaW9uKVxuICogQHJldHVybnMgSW50ZXJuYWwgSUQgZm9yIHRoZSBzYXAuY2hhcnQuQ2hhcnRcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZnVuY3Rpb24gZ2V0SW50ZXJuYWxDaGFydE5hbWVGcm9tUHJvcGVydHlOYW1lQW5kS2luZChuYW1lOiBzdHJpbmcsIGtpbmQ6IHN0cmluZykge1xuXHRyZXR1cm4gbmFtZS5yZXBsYWNlKFwiX2ZlX1wiICsga2luZCArIFwiX1wiLCBcIlwiKTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYW4gYXJyYXkgb2YgY2hhcnQgcHJvcGVydGllcyBieSByZW12b2luZyBfZmVfZ3JvdXBhYmxlIHByZWZpeC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhRmlsdGVycyBDaGFydCBmaWx0ZXIgcHJvcGVydGllc1xuICogQHJldHVybnMgQ2hhcnQgcHJvcGVydGllcyB3aXRob3V0IHByZWZpeGVzXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmludGVyZmFjZSBJRmlsdGVyUHJvcCB7XG5cdHNQYXRoOiBzdHJpbmc7XG59XG5mdW5jdGlvbiBnZXRDaGFydFByb3BlcnRpZXNXaXRob3V0UHJlZml4ZXMoYUZpbHRlcnM6IElGaWx0ZXJQcm9wW10pIHtcblx0YUZpbHRlcnMuZm9yRWFjaCgoZWxlbWVudDogSUZpbHRlclByb3ApID0+IHtcblx0XHRpZiAoZWxlbWVudC5zUGF0aCAmJiBlbGVtZW50LnNQYXRoLmluY2x1ZGVzKFwiZmVfZ3JvdXBhYmxlXCIpKSB7XG5cdFx0XHRlbGVtZW50LnNQYXRoID0gQ29tbW9uVXRpbHMuZ2V0SW50ZXJuYWxDaGFydE5hbWVGcm9tUHJvcGVydHlOYW1lQW5kS2luZChlbGVtZW50LnNQYXRoLCBcImdyb3VwYWJsZVwiKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gYUZpbHRlcnM7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgY29udGV4dCBvZiB0aGUgRHJhZnRSb290IHBhdGguXG4gKiBJZiBhIHZpZXcgaGFzIGJlZW4gY3JlYXRlZCB3aXRoIHRoZSBkcmFmdCBSb290IFBhdGgsIHRoaXMgbWV0aG9kIHJldHVybnMgaXRzIGJpbmRpbmdDb250ZXh0LlxuICogV2hlcmUgbm8gdmlldyBpcyBmb3VuZCBhIG5ldyBjcmVhdGVkIGNvbnRleHQgaXMgcmV0dXJuZWQuXG4gKiBUaGUgbmV3IGNyZWF0ZWQgY29udGV4dCByZXF1ZXN0IHRoZSBrZXkgb2YgdGhlIGVudGl0eSBpbiBvcmRlciB0byBnZXQgdGhlIEV0YWcgb2YgdGhpcyBlbnRpdHkuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0gcHJvZ3JhbW1pbmdNb2RlbFxuICogQHBhcmFtIHZpZXdcbiAqIEBwYXJhbSBhcHBDb21wb25lbnRcbiAqIEBuYW1lIGNyZWF0ZVJvb3RDb250ZXh0XG4gKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZVxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVSb290Q29udGV4dChwcm9ncmFtbWluZ01vZGVsOiBzdHJpbmcsIHZpZXc6IFZpZXcsIGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50KTogUHJvbWlzZTxDb250ZXh0IHwgdW5kZWZpbmVkPiB7XG5cdGNvbnN0IGNvbnRleHQgPSB2aWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgT0RhdGFWNENvbnRleHQ7XG5cdGlmIChjb250ZXh0KSB7XG5cdFx0Y29uc3Qgcm9vdENvbnRleHRQYXRoID1cblx0XHRcdHByb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQgPyBNb2RlbEhlbHBlci5nZXREcmFmdFJvb3RQYXRoKGNvbnRleHQpIDogTW9kZWxIZWxwZXIuZ2V0U3RpY2t5Um9vdFBhdGgoY29udGV4dCk7XG5cdFx0bGV0IHNpbXBsZVJvb3RDb250ZXh0OiBPRGF0YVY0Q29udGV4dDtcblx0XHRpZiAocm9vdENvbnRleHRQYXRoKSB7XG5cdFx0XHQvLyBDaGVjayBpZiBhIHZpZXcgbWF0Y2hlcyB3aXRoIHRoZSBkcmFmdCByb290IHBhdGhcblx0XHRcdGNvbnN0IGV4aXN0aW5nQmluZGluZ0NvbnRleHRPblBhZ2UgPSBhcHBDb21wb25lbnRcblx0XHRcdFx0LmdldFJvb3RWaWV3Q29udHJvbGxlcigpXG5cdFx0XHRcdC5nZXRJbnN0YW5jZWRWaWV3cygpXG5cdFx0XHRcdC5maW5kKChwYWdlVmlldzogVmlldykgPT4gcGFnZVZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpID09PSByb290Q29udGV4dFBhdGgpXG5cdFx0XHRcdD8uZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdFx0aWYgKGV4aXN0aW5nQmluZGluZ0NvbnRleHRPblBhZ2UpIHtcblx0XHRcdFx0cmV0dXJuIGV4aXN0aW5nQmluZGluZ0NvbnRleHRPblBhZ2U7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBpbnRlcm5hbE1vZGVsID0gdmlldy5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdHNpbXBsZVJvb3RDb250ZXh0ID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShcIi9zaW1wbGVSb290Q29udGV4dFwiKTtcblx0XHRcdGlmIChzaW1wbGVSb290Q29udGV4dD8uZ2V0UGF0aCgpID09PSByb290Q29udGV4dFBhdGgpIHtcblx0XHRcdFx0cmV0dXJuIHNpbXBsZVJvb3RDb250ZXh0O1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgbW9kZWwgPSBjb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0XHRzaW1wbGVSb290Q29udGV4dCA9IG1vZGVsLmJpbmRDb250ZXh0KHJvb3RDb250ZXh0UGF0aCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRhd2FpdCBDb21tb25VdGlscy53YWl0Rm9yQ29udGV4dFJlcXVlc3RlZChzaW1wbGVSb290Q29udGV4dCk7XG5cdFx0XHQvLyBTdG9yZSB0aGlzIG5ldyBjcmVhdGVkIGNvbnRleHQgdG8gdXNlIGl0IG9uIHRoZSBuZXh0IGl0ZXJhdGlvbnNcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvc2ltcGxlUm9vdENvbnRleHRcIiwgc2ltcGxlUm9vdENvbnRleHQpO1xuXHRcdFx0cmV0dXJuIHNpbXBsZVJvb3RDb250ZXh0O1xuXHRcdH1cblx0fVxufVxuXG5jb25zdCBDb21tb25VdGlscyA9IHtcblx0ZmlyZUJ1dHRvblByZXNzOiBmbkZpcmVCdXR0b25QcmVzcyxcblx0Z2V0VGFyZ2V0VmlldzogZ2V0VGFyZ2V0Vmlldyxcblx0Z2V0Q3VycmVudFBhZ2VWaWV3OiBnZXRDdXJyZW50UGFnZVZpZXcsXG5cdGhhc1RyYW5zaWVudENvbnRleHQ6IGZuSGFzVHJhbnNpZW50Q29udGV4dHMsXG5cdHVwZGF0ZVJlbGF0ZWRBcHBzRGV0YWlsczogZm5VcGRhdGVSZWxhdGVkQXBwc0RldGFpbHMsXG5cdGdldEFwcENvbXBvbmVudDogZ2V0QXBwQ29tcG9uZW50LFxuXHRnZXRNYW5kYXRvcnlGaWx0ZXJGaWVsZHM6IGZuR2V0TWFuZGF0b3J5RmlsdGVyRmllbGRzLFxuXHRnZXRDb250ZXh0UGF0aFByb3BlcnRpZXM6IGZuR2V0Q29udGV4dFBhdGhQcm9wZXJ0aWVzLFxuXHRnZXRQYXJhbWV0ZXJJbmZvOiBnZXRQYXJhbWV0ZXJJbmZvLFxuXHR1cGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eTogZm5VcGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eSxcblx0Z2V0RW50aXR5U2V0TmFtZTogZ2V0RW50aXR5U2V0TmFtZSxcblx0Z2V0QWN0aW9uUGF0aDogZ2V0QWN0aW9uUGF0aCxcblx0Y29tcHV0ZURpc3BsYXlNb2RlOiBjb21wdXRlRGlzcGxheU1vZGUsXG5cdGlzU3RpY2t5RWRpdE1vZGU6IGlzU3RpY2t5RWRpdE1vZGUsXG5cdGdldE9wZXJhdG9yc0ZvclByb3BlcnR5OiBnZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eSxcblx0Z2V0T3BlcmF0b3JzRm9yRGF0ZVByb3BlcnR5OiBnZXRPcGVyYXRvcnNGb3JEYXRlUHJvcGVydHksXG5cdGdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eTogZ2V0T3BlcmF0b3JzRm9yR3VpZFByb3BlcnR5LFxuXHRhZGRFeHRlcm5hbFN0YXRlRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudDogYWRkRXh0ZXJuYWxTdGF0ZUZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQsXG5cdGFkZFBhZ2VDb250ZXh0VG9TZWxlY3Rpb25WYXJpYW50OiBhZGRQYWdlQ29udGV4dFRvU2VsZWN0aW9uVmFyaWFudCxcblx0YWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeTogYWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeSxcblx0c2V0VXNlckRlZmF1bHRzOiBzZXRVc2VyRGVmYXVsdHMsXG5cdGdldElCTkFjdGlvbnM6IGZuR2V0SUJOQWN0aW9ucyxcblx0Z2V0SGVhZGVyRmFjZXRJdGVtQ29uZmlnRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uOiBnZXRIZWFkZXJGYWNldEl0ZW1Db25maWdGb3JFeHRlcm5hbE5hdmlnYXRpb24sXG5cdGdldFNlbWFudGljT2JqZWN0TWFwcGluZzogZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nLFxuXHRzZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzOiBzZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzLFxuXHRnZXRTZW1hbnRpY09iamVjdFByb21pc2U6IGZuR2V0U2VtYW50aWNPYmplY3RQcm9taXNlLFxuXHRnZXRTZW1hbnRpY1RhcmdldHNGcm9tUGFnZU1vZGVsOiBmbkdldFNlbWFudGljVGFyZ2V0c0Zyb21QYWdlTW9kZWwsXG5cdGdldFNlbWFudGljT2JqZWN0c0Zyb21QYXRoOiBmbkdldFNlbWFudGljT2JqZWN0c0Zyb21QYXRoLFxuXHR1cGRhdGVTZW1hbnRpY1RhcmdldHM6IGZuVXBkYXRlU2VtYW50aWNUYXJnZXRzTW9kZWwsXG5cdHdhaXRGb3JDb250ZXh0UmVxdWVzdGVkOiB3YWl0Rm9yQ29udGV4dFJlcXVlc3RlZCxcblx0Z2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoOiBnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgsXG5cdGdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb246IGdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb24sXG5cdGdldEFkZGl0aW9uYWxQYXJhbXNGb3JDcmVhdGU6IGdldEFkZGl0aW9uYWxQYXJhbXNGb3JDcmVhdGUsXG5cdHJlcXVlc3RTaW5nbGV0b25Qcm9wZXJ0eTogcmVxdWVzdFNpbmdsZXRvblByb3BlcnR5LFxuXHR0ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudDogdGVtcGxhdGVDb250cm9sRnJhZ21lbnQsXG5cdEZpbHRlclJlc3RyaWN0aW9uczoge1xuXHRcdFJFUVVJUkVEX1BST1BFUlRJRVM6IFwiUmVxdWlyZWRQcm9wZXJ0aWVzXCIsXG5cdFx0Tk9OX0ZJTFRFUkFCTEVfUFJPUEVSVElFUzogXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiLFxuXHRcdEFMTE9XRURfRVhQUkVTU0lPTlM6IFwiRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zXCJcblx0fSxcblx0QWxsb3dlZEV4cHJlc3Npb25zUHJpbzogW1wiU2luZ2xlVmFsdWVcIiwgXCJNdWx0aVZhbHVlXCIsIFwiU2luZ2xlUmFuZ2VcIiwgXCJNdWx0aVJhbmdlXCIsIFwiU2VhcmNoRXhwcmVzc2lvblwiLCBcIk11bHRpUmFuZ2VPclNlYXJjaEV4cHJlc3Npb25cIl0sXG5cdG5vcm1hbGl6ZVNlYXJjaFRlcm06IG5vcm1hbGl6ZVNlYXJjaFRlcm0sXG5cdHNldENvbnRleHRzQmFzZWRPbk9wZXJhdGlvbkF2YWlsYWJsZTogc2V0Q29udGV4dHNCYXNlZE9uT3BlcmF0aW9uQXZhaWxhYmxlLFxuXHRzZXREeW5hbWljQWN0aW9uQ29udGV4dHM6IHNldER5bmFtaWNBY3Rpb25Db250ZXh0cyxcblx0cmVxdWVzdFByb3BlcnR5OiByZXF1ZXN0UHJvcGVydHksXG5cdGdldFBhcmFtZXRlclBhdGg6IGdldFBhcmFtZXRlclBhdGgsXG5cdGdldFJlbGF0ZWRBcHBzTWVudUl0ZW1zOiBfZ2V0UmVsYXRlZEFwcHNNZW51SXRlbXMsXG5cdGdldFRyYW5zbGF0ZWRUZXh0RnJvbUV4cEJpbmRpbmdTdHJpbmc6IF9mbnRyYW5zbGF0ZWRUZXh0RnJvbUV4cEJpbmRpbmdTdHJpbmcsXG5cdGFkZFNlbWFudGljRGF0ZXNUb0NvbmRpdGlvbnM6IGFkZFNlbWFudGljRGF0ZXNUb0NvbmRpdGlvbnMsXG5cdGFkZFNlbGVjdE9wdGlvblRvQ29uZGl0aW9uczogYWRkU2VsZWN0T3B0aW9uVG9Db25kaXRpb25zLFxuXHR1cGRhdGVSZWxhdGVBcHBzTW9kZWw6IHVwZGF0ZVJlbGF0ZUFwcHNNb2RlbCxcblx0Z2V0U2VtYW50aWNPYmplY3RBbm5vdGF0aW9uczogX2dldFNlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMsXG5cdGdldEZpbHRlcnNJbmZvRm9yU1Y6IGdldEZpbHRlcnNJbmZvRm9yU1YsXG5cdGdldEludGVybmFsQ2hhcnROYW1lRnJvbVByb3BlcnR5TmFtZUFuZEtpbmQ6IGdldEludGVybmFsQ2hhcnROYW1lRnJvbVByb3BlcnR5TmFtZUFuZEtpbmQsXG5cdGdldENoYXJ0UHJvcGVydGllc1dpdGhvdXRQcmVmaXhlczogZ2V0Q2hhcnRQcm9wZXJ0aWVzV2l0aG91dFByZWZpeGVzLFxuXHRjcmVhdGVSb290Q29udGV4dDogY3JlYXRlUm9vdENvbnRleHQsXG5cdGlzU21hbGxEZXZpY2UsXG5cdGdldENvbnZlcnRlckNvbnRleHRGb3JQYXRoXG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb21tb25VdGlscztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7OztFQXFFQSxNQUFNQSxnQkFBZ0IsR0FBR0MsU0FBUyxDQUFDRCxnQkFBZ0I7RUFlbkQsU0FBU0UsbUJBQW1CLENBQUNDLFdBQW1CLEVBQUU7SUFDakQsSUFBSSxDQUFDQSxXQUFXLEVBQUU7TUFDakIsT0FBT0MsU0FBUztJQUNqQjtJQUVBLE9BQU9ELFdBQVcsQ0FDaEJFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQ2xCQSxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQUEsQ0FDdkJDLEtBQUssQ0FBQyxLQUFL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