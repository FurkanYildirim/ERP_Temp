/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/deepEqual", "sap/base/util/isPlainObject", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ToES6Promise", "sap/fe/core/templating/SemanticObjectHelper", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/field/FieldRuntime", "sap/fe/navigation/SelectionVariant", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/link/Factory", "sap/ui/mdc/link/LinkItem", "sap/ui/mdc/link/SemanticObjectMapping", "sap/ui/mdc/link/SemanticObjectMappingItem", "sap/ui/mdc/link/SemanticObjectUnavailableAction", "sap/ui/mdc/LinkDelegate", "sap/ui/model/json/JSONModel"], function (Log, deepClone, deepEqual, isPlainObject, CommonUtils, KeepAliveHelper, toES6Promise, SemanticObjectHelper, FieldHelper, FieldRuntime, SelectionVariant, Core, Fragment, XMLPreprocessor, XMLTemplateProcessor, Factory, LinkItem, SemanticObjectMapping, SemanticObjectMappingItem, SemanticObjectUnavailableAction, LinkDelegate, JSONModel) {
  "use strict";

  var getDynamicPathFromSemanticObject = SemanticObjectHelper.getDynamicPathFromSemanticObject;
  const SimpleLinkDelegate = Object.assign({}, LinkDelegate);
  const CONSTANTS = {
    iLinksShownInPopup: 3,
    sapmLink: "sap.m.Link",
    sapuimdcLink: "sap.ui.mdc.Link",
    sapuimdclinkLinkItem: "sap.ui.mdc.link.LinkItem",
    sapmObjectIdentifier: "sap.m.ObjectIdentifier",
    sapmObjectStatus: "sap.m.ObjectStatus"
  };
  SimpleLinkDelegate.getConstants = function () {
    return CONSTANTS;
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns The context pointing to the current EntityType.
   */
  SimpleLinkDelegate._getEntityType = function (oPayload, oMetaModel) {
    if (oMetaModel) {
      return oMetaModel.createBindingContext(oPayload.entityType);
    } else {
      return undefined;
    }
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns A model containing the payload information
   */
  SimpleLinkDelegate._getSemanticsModel = function (oPayload, oMetaModel) {
    if (oMetaModel) {
      return new JSONModel(oPayload);
    } else {
      return undefined;
    }
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns An array containing SemanticObjects based of the payload
   */
  SimpleLinkDelegate._getDataField = function (oPayload, oMetaModel) {
    return oMetaModel.createBindingContext(oPayload.dataField);
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns Ancontaining SemanticObjects based of the payload
   */
  SimpleLinkDelegate._getContact = function (oPayload, oMetaModel) {
    return oMetaModel.createBindingContext(oPayload.contact);
  };
  SimpleLinkDelegate.fnTemplateFragment = function () {
    let sFragmentName, titleLinkHref;
    const oFragmentModel = {};
    let oPayloadToUse;

    // payload has been modified by fetching Semantic Objects names with path
    if (this.resolvedpayload) {
      oPayloadToUse = this.resolvedpayload;
    } else {
      oPayloadToUse = this.payload;
    }
    if (oPayloadToUse && !oPayloadToUse.LinkId) {
      oPayloadToUse.LinkId = this.oControl && this.oControl.isA(CONSTANTS.sapuimdcLink) ? this.oControl.getId() : undefined;
    }
    if (oPayloadToUse.LinkId) {
      titleLinkHref = this.oControl.getModel("$sapuimdcLink").getProperty("/titleLinkHref");
      oPayloadToUse.titlelink = titleLinkHref;
    }
    const oSemanticsModel = this._getSemanticsModel(oPayloadToUse, this.oMetaModel);
    this.semanticModel = oSemanticsModel;
    if (oPayloadToUse.entityType && this._getEntityType(oPayloadToUse, this.oMetaModel)) {
      sFragmentName = "sap.fe.macros.quickView.fragments.EntityQuickView";
      oFragmentModel.bindingContexts = {
        entityType: this._getEntityType(oPayloadToUse, this.oMetaModel),
        semantic: oSemanticsModel.createBindingContext("/")
      };
      oFragmentModel.models = {
        entityType: this.oMetaModel,
        semantic: oSemanticsModel
      };
    } else if (oPayloadToUse.dataField && this._getDataField(oPayloadToUse, this.oMetaModel)) {
      sFragmentName = "sap.fe.macros.quickView.fragments.DataFieldQuickView";
      oFragmentModel.bindingContexts = {
        dataField: this._getDataField(oPayloadToUse, this.oMetaModel),
        semantic: oSemanticsModel.createBindingContext("/")
      };
      oFragmentModel.models = {
        dataField: this.oMetaModel,
        semantic: oSemanticsModel
      };
    }
    oFragmentModel.models.entitySet = this.oMetaModel;
    oFragmentModel.models.metaModel = this.oMetaModel;
    if (this.oControl && this.oControl.getModel("viewData")) {
      oFragmentModel.models.viewData = this.oControl.getModel("viewData");
      oFragmentModel.bindingContexts.viewData = this.oControl.getModel("viewData").createBindingContext("/");
    }
    const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
    return Promise.resolve(XMLPreprocessor.process(oFragment, {
      name: sFragmentName
    }, oFragmentModel)).then(_internalFragment => {
      return Fragment.load({
        definition: _internalFragment,
        controller: this
      });
    }).then(oPopoverContent => {
      if (oPopoverContent) {
        if (oFragmentModel.models && oFragmentModel.models.semantic) {
          oPopoverContent.setModel(oFragmentModel.models.semantic, "semantic");
          oPopoverContent.setBindingContext(oFragmentModel.bindingContexts.semantic, "semantic");
        }
        if (oFragmentModel.bindingContexts && oFragmentModel.bindingContexts.entityType) {
          oPopoverContent.setModel(oFragmentModel.models.entityType, "entityType");
          oPopoverContent.setBindingContext(oFragmentModel.bindingContexts.entityType, "entityType");
        }
      }
      this.resolvedpayload = undefined;
      return oPopoverContent;
    });
  };
  SimpleLinkDelegate.fetchAdditionalContent = function (oPayLoad, oMdcLinkControl) {
    var _oPayLoad$navigationP;
    this.oControl = oMdcLinkControl;
    const aNavigateRegexpMatch = oPayLoad === null || oPayLoad === void 0 ? void 0 : (_oPayLoad$navigationP = oPayLoad.navigationPath) === null || _oPayLoad$navigationP === void 0 ? void 0 : _oPayLoad$navigationP.match(/{(.*?)}/);
    const oBindingContext = aNavigateRegexpMatch && aNavigateRegexpMatch.length > 1 && aNavigateRegexpMatch[1] ? oMdcLinkControl.getModel().bindContext(aNavigateRegexpMatch[1], oMdcLinkControl.getBindingContext(), {
      $$ownRequest: true
    }) : null;
    this.payload = oPayLoad;
    if (oMdcLinkControl && oMdcLinkControl.isA(CONSTANTS.sapuimdcLink)) {
      this.oMetaModel = oMdcLinkControl.getModel().getMetaModel();
      return this.fnTemplateFragment().then(function (oPopoverContent) {
        if (oBindingContext) {
          oPopoverContent.setBindingContext(oBindingContext.getBoundContext());
        }
        return [oPopoverContent];
      });
    }
    return Promise.resolve([]);
  };
  SimpleLinkDelegate._fetchLinkCustomData = function (_oLink) {
    if (_oLink.getParent() && _oLink.isA(CONSTANTS.sapuimdcLink) && (_oLink.getParent().isA(CONSTANTS.sapmLink) || _oLink.getParent().isA(CONSTANTS.sapmObjectIdentifier) || _oLink.getParent().isA(CONSTANTS.sapmObjectStatus))) {
      return _oLink.getCustomData();
    } else {
      return undefined;
    }
  };
  /**
   * Fetches the relevant {@link sap.ui.mdc.link.LinkItem} for the Link and returns them.
   *
   * @public
   * @param oPayload The Payload of the Link given by the application
   * @param oBindingContext The ContextObject of the Link
   * @param oInfoLog The InfoLog of the Link
   * @returns Once resolved an array of {@link sap.ui.mdc.link.LinkItem} is returned
   */
  SimpleLinkDelegate.fetchLinkItems = function (oPayload, oBindingContext, oInfoLog) {
    if (oBindingContext && SimpleLinkDelegate._getSemanticObjects(oPayload)) {
      const oContextObject = oBindingContext.getObject();
      if (oInfoLog) {
        oInfoLog.initialize(SimpleLinkDelegate._getSemanticObjects(oPayload));
      }
      const _oLinkCustomData = this._link && this._fetchLinkCustomData(this._link);
      this.aLinkCustomData = _oLinkCustomData && this._fetchLinkCustomData(this._link).map(function (linkItem) {
        return linkItem.mProperties.value;
      });
      const oSemanticAttributesResolved = SimpleLinkDelegate._calculateSemanticAttributes(oContextObject, oPayload, oInfoLog, this._link);
      const oSemanticAttributes = oSemanticAttributesResolved.results;
      const oPayloadResolved = oSemanticAttributesResolved.payload;
      return SimpleLinkDelegate._retrieveNavigationTargets("", oSemanticAttributes, oPayloadResolved, oInfoLog, this._link).then(function (aLinks) {
        return aLinks.length === 0 ? null : aLinks;
      });
    } else {
      return Promise.resolve(null);
    }
  };

  /**
   * Find the type of the link.
   *
   * @param payload The payload of the mdc link.
   * @param aLinkItems Links returned by call to mdc _retrieveUnmodifiedLinkItems.
   * @returns The type of the link as defined by mdc.
   */
  SimpleLinkDelegate._findLinkType = function (payload, aLinkItems) {
    let nLinkType, oLinkItem;
    if ((aLinkItems === null || aLinkItems === void 0 ? void 0 : aLinkItems.length) === 1) {
      oLinkItem = new LinkItem({
        text: aLinkItems[0].getText(),
        href: aLinkItems[0].getHref()
      });
      nLinkType = payload.hasQuickViewFacets === "false" ? 1 : 2;
    } else if (payload.hasQuickViewFacets === "false" && (aLinkItems === null || aLinkItems === void 0 ? void 0 : aLinkItems.length) === 0) {
      nLinkType = 0;
    } else {
      nLinkType = 2;
    }
    return {
      linkType: nLinkType,
      linkItem: oLinkItem
    };
  };
  SimpleLinkDelegate.fetchLinkType = async function (oPayload, oLink) {
    const _oCurrentLink = oLink;
    const _oPayload = Object.assign({}, oPayload);
    const oDefaultInitialType = {
      initialType: {
        type: 2,
        directLink: undefined
      },
      runtimeType: undefined
    };
    // clean appStateKeyMap storage
    if (!this.appStateKeyMap) {
      this.appStateKeyMap = {};
    }
    try {
      var _oPayload$contact;
      if (_oPayload !== null && _oPayload !== void 0 && _oPayload.semanticObjects) {
        this._link = oLink;
        let aLinkItems = await _oCurrentLink._retrieveUnmodifiedLinkItems();
        if (aLinkItems.length === 1) {
          // This is the direct navigation use case so we need to perform the appropriate checks / transformations
          aLinkItems = await _oCurrentLink.retrieveLinkItems();
        }
        const _LinkType = SimpleLinkDelegate._findLinkType(_oPayload, aLinkItems);
        return {
          initialType: {
            type: _LinkType.linkType,
            directLink: _LinkType.linkItem ? _LinkType.linkItem : undefined
          },
          runtimeType: undefined
        };
      } else if ((_oPayload === null || _oPayload === void 0 ? void 0 : (_oPayload$contact = _oPayload.contact) === null || _oPayload$contact === void 0 ? void 0 : _oPayload$contact.length) > 0) {
        return oDefaultInitialType;
      } else if (_oPayload !== null && _oPayload !== void 0 && _oPayload.entityType && _oPayload !== null && _oPayload !== void 0 && _oPayload.navigationPath) {
        return oDefaultInitialType;
      }
      throw new Error("no payload or semanticObjects found");
    } catch (oError) {
      Log.error("Error in SimpleLinkDelegate.fetchLinkType: ", oError);
    }
  };
  SimpleLinkDelegate._RemoveTitleLinkFromTargets = function (_aLinkItems, _bTitleHasLink, _aTitleLink) {
    let _sTitleLinkHref, _oMDCLink;
    let bResult = false;
    if (_bTitleHasLink && _aTitleLink && _aTitleLink[0]) {
      let linkIsPrimaryAction, _sLinkIntentWithoutParameters;
      const _sTitleIntent = _aTitleLink[0].intent.split("?")[0];
      if (_aLinkItems && _aLinkItems[0]) {
        _sLinkIntentWithoutParameters = `#${_aLinkItems[0].getProperty("key")}`;
        linkIsPrimaryAction = _sTitleIntent === _sLinkIntentWithoutParameters;
        if (linkIsPrimaryAction) {
          _sTitleLinkHref = _aLinkItems[0].getProperty("href");
          this.payload.titlelinkhref = _sTitleLinkHref;
          if (_aLinkItems[0].isA(CONSTANTS.sapuimdclinkLinkItem)) {
            _oMDCLink = _aLinkItems[0].getParent();
            _oMDCLink.getModel("$sapuimdcLink").setProperty("/titleLinkHref", _sTitleLinkHref);
            const aMLinkItems = _oMDCLink.getModel("$sapuimdcLink").getProperty("/linkItems").filter(function (oLinkItem) {
              if (`#${oLinkItem.key}` !== _sLinkIntentWithoutParameters) {
                return oLinkItem;
              }
            });
            if (aMLinkItems && aMLinkItems.length > 0) {
              _oMDCLink.getModel("$sapuimdcLink").setProperty("/linkItems/", aMLinkItems);
            }
            bResult = true;
          }
        }
      }
    }
    return bResult;
  };
  SimpleLinkDelegate._IsSemanticObjectDynamic = function (aNewLinkCustomData, oThis) {
    if (aNewLinkCustomData && oThis.aLinkCustomData) {
      return oThis.aLinkCustomData.filter(function (link) {
        return aNewLinkCustomData.filter(function (otherLink) {
          return otherLink !== link;
        }).length > 0;
      }).length > 0;
    } else {
      return false;
    }
  };
  SimpleLinkDelegate._getLineContext = function (oView, mLineContext) {
    if (!mLineContext) {
      if (oView.getAggregation("content")[0] && oView.getAggregation("content")[0].getBindingContext()) {
        return oView.getAggregation("content")[0].getBindingContext();
      }
    }
    return mLineContext;
  };
  SimpleLinkDelegate._setFilterContextUrlForSelectionVariant = function (oView, oSelectionVariant, oNavigationService) {
    if (oView.getViewData().entitySet && oSelectionVariant) {
      const sContextUrl = oNavigationService.constructContextUrl(oView.getViewData().entitySet, oView.getModel());
      oSelectionVariant.setFilterContextUrl(sContextUrl);
    }
    return oSelectionVariant;
  };
  SimpleLinkDelegate._setObjectMappings = function (sSemanticObject, oParams, aSemanticObjectMappings, oSelectionVariant) {
    let hasChanged = false;
    const modifiedSelectionVariant = new SelectionVariant(oSelectionVariant.toJSONObject());
    // if semanticObjectMappings has items with dynamic semanticObjects we need to resolve them using oParams
    aSemanticObjectMappings.forEach(function (mapping) {
      let mappingSemanticObject = mapping.semanticObject;
      const mappingSemanticObjectPath = getDynamicPathFromSemanticObject(mapping.semanticObject);
      if (mappingSemanticObjectPath && oParams[mappingSemanticObjectPath]) {
        mappingSemanticObject = oParams[mappingSemanticObjectPath];
      }
      if (sSemanticObject === mappingSemanticObject) {
        const oMappings = mapping.items;
        for (const i in oMappings) {
          const sLocalProperty = oMappings[i].key;
          const sSemanticObjectProperty = oMappings[i].value;
          if (sLocalProperty !== sSemanticObjectProperty) {
            if (oParams[sLocalProperty]) {
              modifiedSelectionVariant.removeParameter(sSemanticObjectProperty);
              modifiedSelectionVariant.removeSelectOption(sSemanticObjectProperty);
              modifiedSelectionVariant.renameParameter(sLocalProperty, sSemanticObjectProperty);
              modifiedSelectionVariant.renameSelectOption(sLocalProperty, sSemanticObjectProperty);
              oParams[sSemanticObjectProperty] = oParams[sLocalProperty];
              delete oParams[sLocalProperty];
              hasChanged = true;
            }
            // We remove the parameter as there is no value

            // The local property comes from a navigation property
            else if (sLocalProperty.split("/").length > 1) {
              // find the property to be removed
              const propertyToBeRemoved = sLocalProperty.split("/").slice(-1)[0];
              // The navigation property has no value
              if (!oParams[propertyToBeRemoved]) {
                delete oParams[propertyToBeRemoved];
                modifiedSelectionVariant.removeParameter(propertyToBeRemoved);
                modifiedSelectionVariant.removeSelectOption(propertyToBeRemoved);
              } else if (propertyToBeRemoved !== sSemanticObjectProperty) {
                // The navigation property has a value and properties names are different
                modifiedSelectionVariant.renameParameter(propertyToBeRemoved, sSemanticObjectProperty);
                modifiedSelectionVariant.renameSelectOption(propertyToBeRemoved, sSemanticObjectProperty);
                oParams[sSemanticObjectProperty] = oParams[propertyToBeRemoved];
                delete oParams[propertyToBeRemoved];
              }
            } else {
              delete oParams[sLocalProperty];
              modifiedSelectionVariant.removeParameter(sSemanticObjectProperty);
              modifiedSelectionVariant.removeSelectOption(sSemanticObjectProperty);
            }
          }
        }
      }
    });
    return {
      params: oParams,
      hasChanged,
      selectionVariant: modifiedSelectionVariant
    };
  };

  /**
   * Call getAppStateKeyAndUrlParameters in navigation service and cache its results.
   *
   * @param _this The instance of quickviewdelegate.
   * @param navigationService The navigation service.
   * @param selectionVariant The current selection variant.
   * @param semanticObject The current semanticObject.
   */
  SimpleLinkDelegate._getAppStateKeyAndUrlParameters = async function (_this, navigationService, selectionVariant, semanticObject) {
    var _this$appStateKeyMap$;
    let aValues = [];

    // check if default cache contains already the unmodified selectionVariant
    if (deepEqual(selectionVariant, (_this$appStateKeyMap$ = _this.appStateKeyMap[""]) === null || _this$appStateKeyMap$ === void 0 ? void 0 : _this$appStateKeyMap$.selectionVariant)) {
      const defaultCache = _this.appStateKeyMap[""];
      return [defaultCache.semanticAttributes, defaultCache.appstatekey];
    }
    // update url parameters because there is a change in selection variant
    if (_this.appStateKeyMap[`${semanticObject}`] === undefined || !deepEqual(_this.appStateKeyMap[`${semanticObject}`].selectionVariant, selectionVariant)) {
      aValues = await toES6Promise(navigationService.getAppStateKeyAndUrlParameters(selectionVariant.toJSONString()));
      _this.appStateKeyMap[`${semanticObject}`] = {
        semanticAttributes: aValues[0],
        appstatekey: aValues[1],
        selectionVariant: selectionVariant
      };
    } else {
      const cache = _this.appStateKeyMap[`${semanticObject}`];
      aValues = [cache.semanticAttributes, cache.appstatekey];
    }
    return aValues;
  };
  SimpleLinkDelegate._getLinkItemWithNewParameter = async function (_that, _bTitleHasLink, _aTitleLink, _oLinkItem, _oShellServices, _oPayload, _oParams, _sAppStateKey, _oSelectionVariant, _oNavigationService) {
    return _oShellServices.expandCompactHash(_oLinkItem.getHref()).then(async function (sHash) {
      const oShellHash = _oShellServices.parseShellHash(sHash);
      const params = Object.assign({}, _oParams);
      const {
        params: oNewParams,
        hasChanged,
        selectionVariant: newSelectionVariant
      } = SimpleLinkDelegate._setObjectMappings(oShellHash.semanticObject, params, _oPayload.semanticObjectMappings, _oSelectionVariant);
      if (hasChanged) {
        const aValues = await SimpleLinkDelegate._getAppStateKeyAndUrlParameters(_that, _oNavigationService, newSelectionVariant, oShellHash.semanticObject);
        _sAppStateKey = aValues[1];
      }
      const oNewShellHash = {
        target: {
          semanticObject: oShellHash.semanticObject,
          action: oShellHash.action
        },
        params: oNewParams,
        appStateKey: _sAppStateKey
      };
      delete oNewShellHash.params["sap-xapp-state"];
      _oLinkItem.setHref(`#${_oShellServices.constructShellHash(oNewShellHash)}`);
      _oPayload.aSemanticLinks.push(_oLinkItem.getHref());
      // The link is removed from the target list because the title link has same target.
      return SimpleLinkDelegate._RemoveTitleLinkFromTargets.bind(_that)([_oLinkItem], _bTitleHasLink, _aTitleLink);
    });
  };
  SimpleLinkDelegate._removeEmptyLinkItem = function (aLinkItems) {
    return aLinkItems.filter(linkItem => {
      return linkItem !== undefined;
    });
  };
  /**
   * Enables the modification of LinkItems before the popover opens. This enables additional parameters
   * to be added to the link.
   *
   * @param oPayload The payload of the Link given by the application
   * @param oBindingContext The binding context of the Link
   * @param aLinkItems The LinkItems of the Link that can be modified
   * @returns Once resolved an array of {@link sap.ui.mdc.link.LinkItem} is returned
   */
  SimpleLinkDelegate.modifyLinkItems = async function (oPayload, oBindingContext, aLinkItems) {
    if (aLinkItems.length !== 0) {
      this.payload = oPayload;
      const oLink = aLinkItems[0].getParent();
      const oView = CommonUtils.getTargetView(oLink);
      const oAppComponent = CommonUtils.getAppComponent(oView);
      const primaryActionIsActive = await FieldHelper.checkPrimaryActions(oPayload, true, oAppComponent);
      const aTitleLink = primaryActionIsActive.titleLink;
      const bTitleHasLink = primaryActionIsActive.hasTitleLink;
      const oShellServices = oAppComponent.getShellServices();
      if (!oShellServices.hasUShell()) {
        Log.error("QuickViewDelegate: Cannot retrieve the shell services");
        return Promise.reject();
      }
      const oMetaModel = oView.getModel().getMetaModel();
      let mLineContext = oLink.getBindingContext();
      const oTargetInfo = {
        semanticObject: oPayload.mainSemanticObject,
        action: ""
      };
      try {
        const aNewLinkCustomData = oLink && this._fetchLinkCustomData(oLink).map(function (linkItem) {
          return linkItem.mProperties.value;
        });
        // check if all link items in this.aLinkCustomData are also present in aNewLinkCustomData
        if (SimpleLinkDelegate._IsSemanticObjectDynamic(aNewLinkCustomData, this)) {
          // if the customData changed there are different LinkItems to display
          const oSemanticAttributesResolved = SimpleLinkDelegate._calculateSemanticAttributes(oBindingContext.getObject(), oPayload, undefined, this._link);
          const oSemanticAttributes = oSemanticAttributesResolved.results;
          const oPayloadResolved = oSemanticAttributesResolved.payload;
          aLinkItems = await SimpleLinkDelegate._retrieveNavigationTargets("", oSemanticAttributes, oPayloadResolved, undefined, this._link);
        }
        const oNavigationService = oAppComponent.getNavigationService();
        const oController = oView.getController();
        let oSelectionVariant;
        let mLineContextData;
        mLineContext = SimpleLinkDelegate._getLineContext(oView, mLineContext);
        const sMetaPath = oMetaModel.getMetaPath(mLineContext.getPath());
        mLineContextData = oController._intentBasedNavigation.removeSensitiveData(mLineContext.getObject(), sMetaPath);
        mLineContextData = oController._intentBasedNavigation.prepareContextForExternalNavigation(mLineContextData, mLineContext);
        oSelectionVariant = oNavigationService.mixAttributesAndSelectionVariant(mLineContextData.semanticAttributes, {});
        oTargetInfo.propertiesWithoutConflict = mLineContextData.propertiesWithoutConflict;
        //TO modify the selection variant from the Extension API
        oController.intentBasedNavigation.adaptNavigationContext(oSelectionVariant, oTargetInfo);
        SimpleLinkDelegate._removeTechnicalParameters(oSelectionVariant);
        oSelectionVariant = SimpleLinkDelegate._setFilterContextUrlForSelectionVariant(oView, oSelectionVariant, oNavigationService);
        const aValues = await SimpleLinkDelegate._getAppStateKeyAndUrlParameters(this, oNavigationService, oSelectionVariant, "");
        const oParams = aValues[0];
        const appStateKey = aValues[1];
        let titleLinktoBeRemove;
        oPayload.aSemanticLinks = [];
        aLinkItems = SimpleLinkDelegate._removeEmptyLinkItem(aLinkItems);
        for (const index in aLinkItems) {
          titleLinktoBeRemove = await SimpleLinkDelegate._getLinkItemWithNewParameter(this, bTitleHasLink, aTitleLink, aLinkItems[index], oShellServices, oPayload, oParams, appStateKey, oSelectionVariant, oNavigationService);
          // Do not remove the link if there is only one direct target application
          if (titleLinktoBeRemove === true && aLinkItems.length > 1) {
            aLinkItems[index] = undefined;
          }
        }
        return SimpleLinkDelegate._removeEmptyLinkItem(aLinkItems);
      } catch (oError) {
        Log.error("Error while getting the navigation service", oError);
        return undefined;
      }
    } else {
      return aLinkItems;
    }
  };
  SimpleLinkDelegate.beforeNavigationCallback = function (oPayload, oEvent) {
    const oSource = oEvent.getSource(),
      sHref = oEvent.getParameter("href"),
      oURLParsing = Factory.getService("URLParsing"),
      oHash = sHref && oURLParsing.parseShellHash(sHref);
    KeepAliveHelper.storeControlRefreshStrategyForHash(oSource, oHash);
    return Promise.resolve(true);
  };
  SimpleLinkDelegate._removeTechnicalParameters = function (oSelectionVariant) {
    oSelectionVariant.removeSelectOption("@odata.context");
    oSelectionVariant.removeSelectOption("@odata.metadataEtag");
    oSelectionVariant.removeSelectOption("SAP__Messages");
  };
  SimpleLinkDelegate._getSemanticObjectCustomDataValue = function (aLinkCustomData, oSemanticObjectsResolved) {
    let sPropertyName, sCustomDataValue;
    for (let iCustomDataCount = 0; iCustomDataCount < aLinkCustomData.length; iCustomDataCount++) {
      sPropertyName = aLinkCustomData[iCustomDataCount].getKey();
      sCustomDataValue = aLinkCustomData[iCustomDataCount].getValue();
      oSemanticObjectsResolved[sPropertyName] = {
        value: sCustomDataValue
      };
    }
  };

  /**
   * Check the semantic object name if it is dynamic or not.
   *
   * @private
   * @param pathOrValue The semantic object path or name
   * @returns True if semantic object is dynamic
   */
  SimpleLinkDelegate._isDynamicPath = function (pathOrValue) {
    if (pathOrValue && pathOrValue.indexOf("{") === 0 && pathOrValue.indexOf("}") === pathOrValue.length - 1) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Update the payload with semantic object values from custom data of Link.
   *
   * @private
   * @param payload The payload of the mdc link.
   * @param newPayload The new updated payload.
   * @param semanticObjectName The semantic object name resolved.
   */
  SimpleLinkDelegate._updatePayloadWithResolvedSemanticObjectValue = function (payload, newPayload, semanticObjectName) {
    var _newPayload$semanticO;
    if (SimpleLinkDelegate._isDynamicPath(payload.mainSemanticObject)) {
      if (semanticObjectName) {
        newPayload.mainSemanticObject = semanticObjectName;
      } else {
        // no value from Custom Data, so removing mainSemanticObject
        newPayload.mainSemanticObject = undefined;
      }
    }
    switch (typeof semanticObjectName) {
      case "string":
        (_newPayload$semanticO = newPayload.semanticObjectsResolved) === null || _newPayload$semanticO === void 0 ? void 0 : _newPayload$semanticO.push(semanticObjectName);
        newPayload.semanticObjects.push(semanticObjectName);
        break;
      case "object":
        for (const j in semanticObjectName) {
          var _newPayload$semanticO2;
          (_newPayload$semanticO2 = newPayload.semanticObjectsResolved) === null || _newPayload$semanticO2 === void 0 ? void 0 : _newPayload$semanticO2.push(semanticObjectName[j]);
          newPayload.semanticObjects.push(semanticObjectName[j]);
        }
        break;
      default:
    }
  };
  SimpleLinkDelegate._createNewPayloadWithDynamicSemanticObjectsResolved = function (payload, semanticObjectsResolved, newPayload) {
    let semanticObjectName, tmpPropertyName;
    for (const i in payload.semanticObjects) {
      semanticObjectName = payload.semanticObjects[i];
      if (SimpleLinkDelegate._isDynamicPath(semanticObjectName)) {
        tmpPropertyName = semanticObjectName.substr(1, semanticObjectName.indexOf("}") - 1);
        semanticObjectName = semanticObjectsResolved[tmpPropertyName].value;
        SimpleLinkDelegate._updatePayloadWithResolvedSemanticObjectValue(payload, newPayload, semanticObjectName);
      } else {
        newPayload.semanticObjects.push(semanticObjectName);
      }
    }
  };

  /**
   * Update the semantic object name from the resolved value for the mappings attributes.
   *
   * @private
   * @param mdcPayload The payload given by the application.
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload with the resolved value for the semantic object name.
   * @param newPayload The new updated payload.
   */
  SimpleLinkDelegate._updateSemanticObjectsForMappings = function (mdcPayload, mdcPayloadWithDynamicSemanticObjectsResolved, newPayload) {
    // update the semantic object name from the resolved ones in the semantic object mappings.
    mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.forEach(function (semanticObjectMapping) {
      if (semanticObjectMapping.semanticObject && SimpleLinkDelegate._isDynamicPath(semanticObjectMapping.semanticObject)) {
        semanticObjectMapping.semanticObject = newPayload.semanticObjects[mdcPayload.semanticObjects.indexOf(semanticObjectMapping.semanticObject)];
      }
    });
  };

  /**
   * Update the semantic object name from the resolved value for the unavailable actions.
   *
   * @private
   * @param mdcPayload The payload given by the application.
   * @param mdcPayloadSemanticObjectUnavailableActions The unavailable actions given by the application.
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The updated payload with the resolved value for the semantic object name for the unavailable actions.
   */
  SimpleLinkDelegate._updateSemanticObjectsUnavailableActions = function (mdcPayload, mdcPayloadSemanticObjectUnavailableActions, mdcPayloadWithDynamicSemanticObjectsResolved) {
    let _Index;
    mdcPayloadSemanticObjectUnavailableActions.forEach(function (semanticObjectUnavailableAction) {
      // Dynamic SemanticObject has an unavailable action
      if (semanticObjectUnavailableAction !== null && semanticObjectUnavailableAction !== void 0 && semanticObjectUnavailableAction.semanticObject && SimpleLinkDelegate._isDynamicPath(semanticObjectUnavailableAction.semanticObject)) {
        _Index = mdcPayload.semanticObjects.findIndex(function (semanticObject) {
          return semanticObject === semanticObjectUnavailableAction.semanticObject;
        });
        if (_Index !== undefined) {
          // Get the SemanticObject name resolved to a value
          semanticObjectUnavailableAction.semanticObject = mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[_Index];
        }
      }
    });
  };

  /**
   * Update the semantic object name from the resolved value for the unavailable actions.
   *
   * @private
   * @param mdcPayload The updated payload with the information from custom data provided in the link.
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload updated with resolved semantic objects names.
   */
  SimpleLinkDelegate._updateSemanticObjectsWithResolvedValue = function (mdcPayload, mdcPayloadWithDynamicSemanticObjectsResolved) {
    for (let newSemanticObjectsCount = 0; newSemanticObjectsCount < mdcPayload.semanticObjects.length; newSemanticObjectsCount++) {
      if (mdcPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject === (mdcPayload.semanticObjectsResolved && mdcPayload.semanticObjectsResolved[newSemanticObjectsCount])) {
        mdcPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = mdcPayload.semanticObjects[newSemanticObjectsCount];
      }
      if (mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[newSemanticObjectsCount]) {
        mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[newSemanticObjectsCount] = mdcPayload.semanticObjects[newSemanticObjectsCount];
      } else {
        // no Custom Data value for a Semantic Object name with path
        mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects.splice(newSemanticObjectsCount, 1);
      }
    }
  };

  /**
   * Remove empty semantic object mappings and if there is no semantic object name, link to it.
   *
   * @private
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload used to check the mappings of the semantic objects.
   */
  SimpleLinkDelegate._removeEmptySemanticObjectsMappings = function (mdcPayloadWithDynamicSemanticObjectsResolved) {
    // remove undefined Semantic Object Mapping
    for (let mappingsCount = 0; mappingsCount < mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.length; mappingsCount++) {
      if (mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings[mappingsCount] && mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings[mappingsCount].semanticObject === undefined) {
        mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.splice(mappingsCount, 1);
      }
    }
  };
  SimpleLinkDelegate._setPayloadWithDynamicSemanticObjectsResolved = function (payload, newPayload) {
    let oPayloadWithDynamicSemanticObjectsResolved;
    if (newPayload.semanticObjectsResolved && newPayload.semanticObjectsResolved.length > 0) {
      oPayloadWithDynamicSemanticObjectsResolved = {
        entityType: payload.entityType,
        dataField: payload.dataField,
        contact: payload.contact,
        mainSemanticObject: payload.mainSemanticObject,
        navigationPath: payload.navigationPath,
        propertyPathLabel: payload.propertyPathLabel,
        semanticObjectMappings: deepClone(payload.semanticObjectMappings),
        semanticObjects: newPayload.semanticObjects
      };
      SimpleLinkDelegate._updateSemanticObjectsForMappings(payload, oPayloadWithDynamicSemanticObjectsResolved, newPayload);
      const _SemanticObjectUnavailableActions = deepClone(payload.semanticObjectUnavailableActions);
      SimpleLinkDelegate._updateSemanticObjectsUnavailableActions(payload, _SemanticObjectUnavailableActions, oPayloadWithDynamicSemanticObjectsResolved);
      oPayloadWithDynamicSemanticObjectsResolved.semanticObjectUnavailableActions = _SemanticObjectUnavailableActions;
      if (newPayload.mainSemanticObject) {
        oPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = newPayload.mainSemanticObject;
      } else {
        oPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = undefined;
      }
      SimpleLinkDelegate._updateSemanticObjectsWithResolvedValue(newPayload, oPayloadWithDynamicSemanticObjectsResolved);
      SimpleLinkDelegate._removeEmptySemanticObjectsMappings(oPayloadWithDynamicSemanticObjectsResolved);
      return oPayloadWithDynamicSemanticObjectsResolved;
    } else {
      return {};
    }
  };
  SimpleLinkDelegate._getPayloadWithDynamicSemanticObjectsResolved = function (payload, linkCustomData) {
    let oPayloadWithDynamicSemanticObjectsResolved;
    const oSemanticObjectsResolved = {};
    const newPayload = {
      semanticObjects: [],
      semanticObjectsResolved: [],
      semanticObjectMappings: []
    };
    if (payload.semanticObjects) {
      // sap.m.Link has custom data with Semantic Objects names resolved
      if (linkCustomData && linkCustomData.length > 0) {
        SimpleLinkDelegate._getSemanticObjectCustomDataValue(linkCustomData, oSemanticObjectsResolved);
        SimpleLinkDelegate._createNewPayloadWithDynamicSemanticObjectsResolved(payload, oSemanticObjectsResolved, newPayload);
        oPayloadWithDynamicSemanticObjectsResolved = SimpleLinkDelegate._setPayloadWithDynamicSemanticObjectsResolved(payload, newPayload);
        return oPayloadWithDynamicSemanticObjectsResolved;
      }
    } else {
      return undefined;
    }
  };
  SimpleLinkDelegate._updatePayloadWithSemanticAttributes = function (aSemanticObjects, oInfoLog, oContextObject, oResults, mSemanticObjectMappings) {
    aSemanticObjects.forEach(function (sSemanticObject) {
      if (oInfoLog) {
        oInfoLog.addContextObject(sSemanticObject, oContextObject);
      }
      oResults[sSemanticObject] = {};
      for (const sAttributeName in oContextObject) {
        let oAttribute = null,
          oTransformationAdditional = null;
        if (oInfoLog) {
          oAttribute = oInfoLog.getSemanticObjectAttribute(sSemanticObject, sAttributeName);
          if (!oAttribute) {
            oAttribute = oInfoLog.createAttributeStructure();
            oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeName, oAttribute);
          }
        }
        // Ignore undefined and null values
        if (oContextObject[sAttributeName] === undefined || oContextObject[sAttributeName] === null) {
          if (oAttribute) {
            oAttribute.transformations.push({
              value: undefined,
              description: "\u2139 Undefined and null values have been removed in SimpleLinkDelegate."
            });
          }
          continue;
        }
        // Ignore plain objects (BCP 1770496639)
        if (isPlainObject(oContextObject[sAttributeName])) {
          if (mSemanticObjectMappings && mSemanticObjectMappings[sSemanticObject]) {
            const aKeys = Object.keys(mSemanticObjectMappings[sSemanticObject]);
            let sNewAttributeNameMapped, sNewAttributeName, sValue, sKey;
            for (let index = 0; index < aKeys.length; index++) {
              sKey = aKeys[index];
              if (sKey.indexOf(sAttributeName) === 0) {
                sNewAttributeNameMapped = mSemanticObjectMappings[sSemanticObject][sKey];
                sNewAttributeName = sKey.split("/")[sKey.split("/").length - 1];
                sValue = oContextObject[sAttributeName][sNewAttributeName];
                if (sNewAttributeNameMapped && sNewAttributeName && sValue) {
                  oResults[sSemanticObject][sNewAttributeNameMapped] = sValue;
                }
              }
            }
          }
          if (oAttribute) {
            oAttribute.transformations.push({
              value: undefined,
              description: "\u2139 Plain objects has been removed in SimpleLinkDelegate."
            });
          }
          continue;
        }

        // Map the attribute name only if 'semanticObjectMapping' is defined.
        // Note: under defined 'semanticObjectMapping' we also mean an empty annotation or an annotation with empty record
        const sAttributeNameMapped = mSemanticObjectMappings && mSemanticObjectMappings[sSemanticObject] && mSemanticObjectMappings[sSemanticObject][sAttributeName] ? mSemanticObjectMappings[sSemanticObject][sAttributeName] : sAttributeName;
        if (oAttribute && sAttributeName !== sAttributeNameMapped) {
          oTransformationAdditional = {
            value: undefined,
            description: `\u2139 The attribute ${sAttributeName} has been renamed to ${sAttributeNameMapped} in SimpleLinkDelegate.`,
            reason: `\ud83d\udd34 A com.sap.vocabularies.Common.v1.SemanticObjectMapping annotation is defined for semantic object ${sSemanticObject} with source attribute ${sAttributeName} and target attribute ${sAttributeNameMapped}. You can modify the annotation if the mapping result is not what you expected.`
          };
        }

        // If more then one local property maps to the same target property (clash situation)
        // we take the value of the last property and write an error log
        if (oResults[sSemanticObject][sAttributeNameMapped]) {
          Log.error(`SimpleLinkDelegate: The attribute ${sAttributeName} can not be renamed to the attribute ${sAttributeNameMapped} due to a clash situation. This can lead to wrong navigation later on.`);
        }

        // Copy the value replacing the attribute name by semantic object name
        oResults[sSemanticObject][sAttributeNameMapped] = oContextObject[sAttributeName];
        if (oAttribute) {
          if (oTransformationAdditional) {
            oAttribute.transformations.push(oTransformationAdditional);
            const aAttributeNew = oInfoLog.createAttributeStructure();
            aAttributeNew.transformations.push({
              value: oContextObject[sAttributeName],
              description: `\u2139 The attribute ${sAttributeNameMapped} with the value ${oContextObject[sAttributeName]} has been added due to a mapping rule regarding the attribute ${sAttributeName} in SimpleLinkDelegate.`
            });
            oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeNameMapped, aAttributeNew);
          }
        }
      }
    });
  };

  /**
   * Checks which attributes of the ContextObject belong to which SemanticObject and maps them into a two dimensional array.
   *
   * @private
   * @param oContextObject The BindingContext of the SourceControl of the Link / of the Link itself if not set
   * @param oPayload The payload given by the application
   * @param oInfoLog The corresponding InfoLog of the Link
   * @param oLink The corresponding Link
   * @returns A two dimensional array which maps a given SemanticObject name together with a given attribute name to the value of that given attribute
   */
  SimpleLinkDelegate._calculateSemanticAttributes = function (oContextObject, oPayload, oInfoLog, oLink) {
    const aLinkCustomData = oLink && this._fetchLinkCustomData(oLink);
    const oPayloadWithDynamicSemanticObjectsResolved = SimpleLinkDelegate._getPayloadWithDynamicSemanticObjectsResolved(oPayload, aLinkCustomData);
    const oPayloadResolved = oPayloadWithDynamicSemanticObjectsResolved ? oPayloadWithDynamicSemanticObjectsResolved : oPayload;
    this.resolvedpayload = oPayloadWithDynamicSemanticObjectsResolved;
    const aSemanticObjects = SimpleLinkDelegate._getSemanticObjects(oPayloadResolved);
    const mSemanticObjectMappings = SimpleLinkDelegate._convertSemanticObjectMapping(SimpleLinkDelegate._getSemanticObjectMappings(oPayloadResolved));
    if (!aSemanticObjects.length) {
      return {
        payload: oPayloadResolved,
        results: {}
      };
    }
    const oResults = {};
    SimpleLinkDelegate._updatePayloadWithSemanticAttributes(aSemanticObjects, oInfoLog, oContextObject, oResults, mSemanticObjectMappings);
    return {
      payload: oPayloadResolved,
      results: oResults
    };
  };
  /**
   * Retrieves the actual targets for the navigation of the link. This uses the UShell loaded by the {@link sap.ui.mdc.link.Factory} to retrieve
   * the navigation targets from the FLP service.
   *
   * @private
   * @param sAppStateKey Key of the appstate (not used yet)
   * @param oSemanticAttributes The calculated by _calculateSemanticAttributes
   * @param oPayload The payload given by the application
   * @param oInfoLog The corresponding InfoLog of the Link
   * @param oLink The corresponding Link
   * @returns Resolving into availableAtions and ownNavigation containing an array of {@link sap.ui.mdc.link.LinkItem}
   */
  SimpleLinkDelegate._retrieveNavigationTargets = function (sAppStateKey, oSemanticAttributes, oPayload, oInfoLog, oLink) {
    if (!oPayload.semanticObjects) {
      return Promise.resolve([]);
    }
    const aSemanticObjects = oPayload.semanticObjects;
    const oNavigationTargets = {
      ownNavigation: undefined,
      availableActions: []
    };
    let iSuperiorActionLinksFound = 0;
    return Core.loadLibrary("sap.ui.fl", {
      async: true
    }).then(() => {
      return new Promise(resolve => {
        sap.ui.require(["sap/ui/fl/Utils"], async Utils => {
          const oAppComponent = Utils.getAppComponentForControl(oLink === undefined ? this.oControl : oLink);
          const oShellServices = oAppComponent ? oAppComponent.getShellServices() : null;
          if (!oShellServices) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
          }
          if (!oShellServices.hasUShell()) {
            Log.error("SimpleLinkDelegate: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained");
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
          }
          const aParams = aSemanticObjects.map(function (sSemanticObject) {
            return [{
              semanticObject: sSemanticObject,
              params: oSemanticAttributes ? oSemanticAttributes[sSemanticObject] : undefined,
              appStateKey: sAppStateKey,
              sortResultsBy: "text"
            }];
          });
          try {
            const aLinks = await oShellServices.getLinks(aParams);
            let bHasLinks = false;
            for (let i = 0; i < aLinks.length; i++) {
              for (let j = 0; j < aLinks[i].length; j++) {
                if (aLinks[i][j].length > 0) {
                  bHasLinks = true;
                  break;
                }
                if (bHasLinks) {
                  break;
                }
              }
            }
            if (!aLinks || !aLinks.length || !bHasLinks) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
            }
            const aSemanticObjectUnavailableActions = SimpleLinkDelegate._getSemanticObjectUnavailableActions(oPayload);
            const oUnavailableActions = SimpleLinkDelegate._convertSemanticObjectUnavailableAction(aSemanticObjectUnavailableActions);
            let sCurrentHash = FieldRuntime._fnFixHashQueryString(oAppComponent.getShellServices().getHash());
            if (sCurrentHash) {
              // BCP 1770315035: we have to set the end-point '?' of action in order to avoid matching of "#SalesOrder-manage" in "#SalesOrder-manageFulfillment"
              sCurrentHash += "?";
            }
            const fnIsUnavailableAction = function (sSemanticObject, sAction) {
              return !!oUnavailableActions && !!oUnavailableActions[sSemanticObject] && oUnavailableActions[sSemanticObject].indexOf(sAction) > -1;
            };
            const fnAddLink = function (_oLink) {
              const oShellHash = oShellServices.parseShellHash(_oLink.intent);
              if (fnIsUnavailableAction(oShellHash.semanticObject, oShellHash.action)) {
                return;
              }
              const sHref = `#${oShellServices.constructShellHash({
                target: {
                  shellHash: _oLink.intent
                }
              })}`;
              if (_oLink.intent && _oLink.intent.indexOf(sCurrentHash) === 0) {
                // Prevent current app from being listed
                // NOTE: If the navigation target exists in
                // multiple contexts (~XXXX in hash) they will all be skipped
                oNavigationTargets.ownNavigation = new LinkItem({
                  href: sHref,
                  text: _oLink.text
                });
                return;
              }
              const oLinkItem = new LinkItem({
                // As the retrieveNavigationTargets method can be called several time we can not create the LinkItem instance with the same id
                key: oShellHash.semanticObject && oShellHash.action ? `${oShellHash.semanticObject}-${oShellHash.action}` : undefined,
                text: _oLink.text,
                description: undefined,
                href: sHref,
                // target: not supported yet
                icon: undefined,
                //_oLink.icon,
                initiallyVisible: _oLink.tags && _oLink.tags.indexOf("superiorAction") > -1
              });
              if (oLinkItem.getProperty("initiallyVisible")) {
                iSuperiorActionLinksFound++;
              }
              oNavigationTargets.availableActions.push(oLinkItem);
              if (oInfoLog) {
                oInfoLog.addSemanticObjectIntent(oShellHash.semanticObject, {
                  intent: oLinkItem.getHref(),
                  text: oLinkItem.getText()
                });
              }
            };
            for (let n = 0; n < aSemanticObjects.length; n++) {
              aLinks[n][0].forEach(fnAddLink);
            }
            if (iSuperiorActionLinksFound === 0) {
              for (let iLinkItemIndex = 0; iLinkItemIndex < oNavigationTargets.availableActions.length; iLinkItemIndex++) {
                if (iLinkItemIndex < this.getConstants().iLinksShownInPopup) {
                  oNavigationTargets.availableActions[iLinkItemIndex].setProperty("initiallyVisible", true);
                } else {
                  break;
                }
              }
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
          } catch (oError) {
            Log.error("SimpleLinkDelegate: '_retrieveNavigationTargets' failed executing getLinks method");
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
          }
        });
      });
    });
  };
  SimpleLinkDelegate._getSemanticObjects = function (oPayload) {
    return oPayload.semanticObjects ? oPayload.semanticObjects : [];
  };
  SimpleLinkDelegate._getSemanticObjectUnavailableActions = function (oPayload) {
    const aSemanticObjectUnavailableActions = [];
    if (oPayload.semanticObjectUnavailableActions) {
      oPayload.semanticObjectUnavailableActions.forEach(function (oSemanticObjectUnavailableAction) {
        aSemanticObjectUnavailableActions.push(new SemanticObjectUnavailableAction({
          semanticObject: oSemanticObjectUnavailableAction.semanticObject,
          actions: oSemanticObjectUnavailableAction.actions
        }));
      });
    }
    return aSemanticObjectUnavailableActions;
  };

  /**
   * This will return an array of {@link sap.ui.mdc.link.SemanticObjectMapping} depending on the given payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @returns An array of semantic object mappings.
   */
  SimpleLinkDelegate._getSemanticObjectMappings = function (oPayload) {
    const aSemanticObjectMappings = [];
    let aSemanticObjectMappingItems = [];
    if (oPayload.semanticObjectMappings) {
      oPayload.semanticObjectMappings.forEach(function (oSemanticObjectMapping) {
        aSemanticObjectMappingItems = [];
        if (oSemanticObjectMapping.items) {
          oSemanticObjectMapping.items.forEach(function (oSemanticObjectMappingItem) {
            aSemanticObjectMappingItems.push(new SemanticObjectMappingItem({
              key: oSemanticObjectMappingItem.key,
              value: oSemanticObjectMappingItem.value
            }));
          });
        }
        aSemanticObjectMappings.push(new SemanticObjectMapping({
          semanticObject: oSemanticObjectMapping.semanticObject,
          items: aSemanticObjectMappingItems
        }));
      });
    }
    return aSemanticObjectMappings;
  };
  /**
   * Converts a given array of SemanticObjectMapping into a Map containing SemanticObjects as Keys and a Map of it's corresponding SemanticObjectMappings as values.
   *
   * @private
   * @param aSemanticObjectMappings An array of SemanticObjectMappings.
   * @returns The converterd SemanticObjectMappings
   */
  SimpleLinkDelegate._convertSemanticObjectMapping = function (aSemanticObjectMappings) {
    if (!aSemanticObjectMappings.length) {
      return undefined;
    }
    const mSemanticObjectMappings = {};
    aSemanticObjectMappings.forEach(function (oSemanticObjectMapping) {
      if (!oSemanticObjectMapping.getSemanticObject()) {
        throw Error(`SimpleLinkDelegate: 'semanticObject' property with value '${oSemanticObjectMapping.getSemanticObject()}' is not valid`);
      }
      mSemanticObjectMappings[oSemanticObjectMapping.getSemanticObject()] = oSemanticObjectMapping.getItems().reduce(function (oMap, oItem) {
        oMap[oItem.getKey()] = oItem.getValue();
        return oMap;
      }, {});
    });
    return mSemanticObjectMappings;
  };
  /**
   * Converts a given array of SemanticObjectUnavailableActions into a map containing SemanticObjects as keys and a map of its corresponding SemanticObjectUnavailableActions as values.
   *
   * @private
   * @param aSemanticObjectUnavailableActions The SemanticObjectUnavailableActions converted
   * @returns The map containing the converted SemanticObjectUnavailableActions
   */
  SimpleLinkDelegate._convertSemanticObjectUnavailableAction = function (aSemanticObjectUnavailableActions) {
    let _SemanticObjectName;
    let _SemanticObjectHasAlreadyUnavailableActions;
    let _UnavailableActions = [];
    if (!aSemanticObjectUnavailableActions.length) {
      return undefined;
    }
    const mSemanticObjectUnavailableActions = {};
    aSemanticObjectUnavailableActions.forEach(function (oSemanticObjectUnavailableActions) {
      _SemanticObjectName = oSemanticObjectUnavailableActions.getSemanticObject();
      if (!_SemanticObjectName) {
        throw Error(`SimpleLinkDelegate: 'semanticObject' property with value '${_SemanticObjectName}' is not valid`);
      }
      _UnavailableActions = oSemanticObjectUnavailableActions.getActions();
      if (mSemanticObjectUnavailableActions[_SemanticObjectName] === undefined) {
        mSemanticObjectUnavailableActions[_SemanticObjectName] = _UnavailableActions;
      } else {
        _SemanticObjectHasAlreadyUnavailableActions = mSemanticObjectUnavailableActions[_SemanticObjectName];
        _UnavailableActions.forEach(function (UnavailableAction) {
          _SemanticObjectHasAlreadyUnavailableActions.push(UnavailableAction);
        });
        mSemanticObjectUnavailableActions[_SemanticObjectName] = _SemanticObjectHasAlreadyUnavailableActions;
      }
    });
    return mSemanticObjectUnavailableActions;
  };
  return SimpleLinkDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW1wbGVMaW5rRGVsZWdhdGUiLCJPYmplY3QiLCJhc3NpZ24iLCJMaW5rRGVsZWdhdGUiLCJDT05TVEFOVFMiLCJpTGlua3NTaG93bkluUG9wdXAiLCJzYXBtTGluayIsInNhcHVpbWRjTGluayIsInNhcHVpbWRjbGlua0xpbmtJdGVtIiwic2FwbU9iamVjdElkZW50aWZpZXIiLCJzYXBtT2JqZWN0U3RhdHVzIiwiZ2V0Q29uc3RhbnRzIiwiX2dldEVudGl0eVR5cGUiLCJvUGF5bG9hZCIsIm9NZXRhTW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImVudGl0eVR5cGUiLCJ1bmRlZmluZWQiLCJfZ2V0U2VtYW50aWNzTW9kZWwiLCJKU09OTW9kZWwiLCJfZ2V0RGF0YUZpZWxkIiwiZGF0YUZpZWxkIiwiX2dldENvbnRhY3QiLCJjb250YWN0IiwiZm5UZW1wbGF0ZUZyYWdtZW50Iiwic0ZyYWdtZW50TmFtZSIsInRpdGxlTGlua0hyZWYiLCJvRnJhZ21lbnRNb2RlbCIsIm9QYXlsb2FkVG9Vc2UiLCJyZXNvbHZlZHBheWxvYWQiLCJwYXlsb2FkIiwiTGlua0lkIiwib0NvbnRyb2wiLCJpc0EiLCJnZXRJZCIsImdldE1vZGVsIiwiZ2V0UHJvcGVydHkiLCJ0aXRsZWxpbmsiLCJvU2VtYW50aWNzTW9kZWwiLCJzZW1hbnRpY01vZGVsIiwiYmluZGluZ0NvbnRleHRzIiwic2VtYW50aWMiLCJtb2RlbHMiLCJlbnRpdHlTZXQiLCJtZXRhTW9kZWwiLCJ2aWV3RGF0YSIsIm9GcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJYTUxQcmVwcm9jZXNzb3IiLCJwcm9jZXNzIiwibmFtZSIsInRoZW4iLCJfaW50ZXJuYWxGcmFnbWVudCIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJjb250cm9sbGVyIiwib1BvcG92ZXJDb250ZW50Iiwic2V0TW9kZWwiLCJzZXRCaW5kaW5nQ29udGV4dCIsImZldGNoQWRkaXRpb25hbENvbnRlbnQiLCJvUGF5TG9hZCIsIm9NZGNMaW5rQ29udHJvbCIsImFOYXZpZ2F0ZVJlZ2V4cE1hdGNoIiwibmF2aWdhdGlvblBhdGgiLCJtYXRjaCIsIm9CaW5kaW5nQ29udGV4dCIsImxlbmd0aCIsImJpbmRDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCIkJG93blJlcXVlc3QiLCJnZXRNZXRhTW9kZWwiLCJnZXRCb3VuZENvbnRleHQiLCJfZmV0Y2hMaW5rQ3VzdG9tRGF0YSIsIl9vTGluayIsImdldFBhcmVudCIsImdldEN1c3RvbURhdGEiLCJmZXRjaExpbmtJdGVtcyIsIm9JbmZvTG9nIiwiX2dldFNlbWFudGljT2JqZWN0cyIsIm9Db250ZXh0T2JqZWN0IiwiZ2V0T2JqZWN0IiwiaW5pdGlhbGl6ZSIsIl9vTGlua0N1c3RvbURhdGEiLCJfbGluayIsImFMaW5rQ3VzdG9tRGF0YSIsIm1hcCIsImxpbmtJdGVtIiwibVByb3BlcnRpZXMiLCJ2YWx1ZSIsIm9TZW1hbnRpY0F0dHJpYnV0ZXNSZXNvbHZlZCIsIl9jYWxjdWxhdGVTZW1hbnRpY0F0dHJpYnV0ZXMiLCJvU2VtYW50aWNBdHRyaWJ1dGVzIiwicmVzdWx0cyIsIm9QYXlsb2FkUmVzb2x2ZWQiLCJfcmV0cmlldmVOYXZpZ2F0aW9uVGFyZ2V0cyIsImFMaW5rcyIsIl9maW5kTGlua1R5cGUiLCJhTGlua0l0ZW1zIiwibkxpbmtUeXBlIiwib0xpbmtJdGVtIiwiTGlua0l0ZW0iLCJ0ZXh0IiwiZ2V0VGV4dCIsImhyZWYiLCJnZXRIcmVmIiwiaGFzUXVpY2tWaWV3RmFjZXRzIiwibGlua1R5cGUiLCJmZXRjaExpbmtUeXBlIiwib0xpbmsiLCJfb0N1cnJlbnRMaW5rIiwiX29QYXlsb2FkIiwib0RlZmF1bHRJbml0aWFsVHlwZSIsImluaXRpYWxUeXBlIiwidHlwZSIsImRpcmVjdExpbmsiLCJydW50aW1lVHlwZSIsImFwcFN0YXRlS2V5TWFwIiwic2VtYW50aWNPYmplY3RzIiwiX3JldHJpZXZlVW5tb2RpZmllZExpbmtJdGVtcyIsInJldHJpZXZlTGlua0l0ZW1zIiwiX0xpbmtUeXBlIiwiRXJyb3IiLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsIl9SZW1vdmVUaXRsZUxpbmtGcm9tVGFyZ2V0cyIsIl9hTGlua0l0ZW1zIiwiX2JUaXRsZUhhc0xpbmsiLCJfYVRpdGxlTGluayIsIl9zVGl0bGVMaW5rSHJlZiIsIl9vTURDTGluayIsImJSZXN1bHQiLCJsaW5rSXNQcmltYXJ5QWN0aW9uIiwiX3NMaW5rSW50ZW50V2l0aG91dFBhcmFtZXRlcnMiLCJfc1RpdGxlSW50ZW50IiwiaW50ZW50Iiwic3BsaXQiLCJ0aXRsZWxpbmtocmVmIiwic2V0UHJvcGVydHkiLCJhTUxpbmtJdGVtcyIsImZpbHRlciIsImtleSIsIl9Jc1NlbWFudGljT2JqZWN0RHluYW1pYyIsImFOZXdMaW5rQ3VzdG9tRGF0YSIsIm9UaGlzIiwibGluayIsIm90aGVyTGluayIsIl9nZXRMaW5lQ29udGV4dCIsIm9WaWV3IiwibUxpbmVDb250ZXh0IiwiZ2V0QWdncmVnYXRpb24iLCJfc2V0RmlsdGVyQ29udGV4dFVybEZvclNlbGVjdGlvblZhcmlhbnQiLCJvU2VsZWN0aW9uVmFyaWFudCIsIm9OYXZpZ2F0aW9uU2VydmljZSIsImdldFZpZXdEYXRhIiwic0NvbnRleHRVcmwiLCJjb25zdHJ1Y3RDb250ZXh0VXJsIiwic2V0RmlsdGVyQ29udGV4dFVybCIsIl9zZXRPYmplY3RNYXBwaW5ncyIsInNTZW1hbnRpY09iamVjdCIsIm9QYXJhbXMiLCJhU2VtYW50aWNPYmplY3RNYXBwaW5ncyIsImhhc0NoYW5nZWQiLCJtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3Rpb25WYXJpYW50IiwidG9KU09OT2JqZWN0IiwiZm9yRWFjaCIsIm1hcHBpbmciLCJtYXBwaW5nU2VtYW50aWNPYmplY3QiLCJzZW1hbnRpY09iamVjdCIsIm1hcHBpbmdTZW1hbnRpY09iamVjdFBhdGgiLCJnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdCIsIm9NYXBwaW5ncyIsIml0ZW1zIiwiaSIsInNMb2NhbFByb3BlcnR5Iiwic1NlbWFudGljT2JqZWN0UHJvcGVydHkiLCJyZW1vdmVQYXJhbWV0ZXIiLCJyZW1vdmVTZWxlY3RPcHRpb24iLCJyZW5hbWVQYXJhbWV0ZXIiLCJyZW5hbWVTZWxlY3RPcHRpb24iLCJwcm9wZXJ0eVRvQmVSZW1vdmVkIiwic2xpY2UiLCJwYXJhbXMiLCJzZWxlY3Rpb25WYXJpYW50IiwiX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyIsIl90aGlzIiwibmF2aWdhdGlvblNlcnZpY2UiLCJhVmFsdWVzIiwiZGVlcEVxdWFsIiwiZGVmYXVsdENhY2hlIiwic2VtYW50aWNBdHRyaWJ1dGVzIiwiYXBwc3RhdGVrZXkiLCJ0b0VTNlByb21pc2UiLCJnZXRBcHBTdGF0ZUtleUFuZFVybFBhcmFtZXRlcnMiLCJ0b0pTT05TdHJpbmciLCJjYWNoZSIsIl9nZXRMaW5rSXRlbVdpdGhOZXdQYXJhbWV0ZXIiLCJfdGhhdCIsIl9vTGlua0l0ZW0iLCJfb1NoZWxsU2VydmljZXMiLCJfb1BhcmFtcyIsIl9zQXBwU3RhdGVLZXkiLCJfb1NlbGVjdGlvblZhcmlhbnQiLCJfb05hdmlnYXRpb25TZXJ2aWNlIiwiZXhwYW5kQ29tcGFjdEhhc2giLCJzSGFzaCIsIm9TaGVsbEhhc2giLCJwYXJzZVNoZWxsSGFzaCIsIm9OZXdQYXJhbXMiLCJuZXdTZWxlY3Rpb25WYXJpYW50Iiwic2VtYW50aWNPYmplY3RNYXBwaW5ncyIsIm9OZXdTaGVsbEhhc2giLCJ0YXJnZXQiLCJhY3Rpb24iLCJhcHBTdGF0ZUtleSIsInNldEhyZWYiLCJjb25zdHJ1Y3RTaGVsbEhhc2giLCJhU2VtYW50aWNMaW5rcyIsInB1c2giLCJiaW5kIiwiX3JlbW92ZUVtcHR5TGlua0l0ZW0iLCJtb2RpZnlMaW5rSXRlbXMiLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50IiwicHJpbWFyeUFjdGlvbklzQWN0aXZlIiwiRmllbGRIZWxwZXIiLCJjaGVja1ByaW1hcnlBY3Rpb25zIiwiYVRpdGxlTGluayIsInRpdGxlTGluayIsImJUaXRsZUhhc0xpbmsiLCJoYXNUaXRsZUxpbmsiLCJvU2hlbGxTZXJ2aWNlcyIsImdldFNoZWxsU2VydmljZXMiLCJoYXNVU2hlbGwiLCJyZWplY3QiLCJvVGFyZ2V0SW5mbyIsIm1haW5TZW1hbnRpY09iamVjdCIsImdldE5hdmlnYXRpb25TZXJ2aWNlIiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwibUxpbmVDb250ZXh0RGF0YSIsInNNZXRhUGF0aCIsImdldE1ldGFQYXRoIiwiZ2V0UGF0aCIsIl9pbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJyZW1vdmVTZW5zaXRpdmVEYXRhIiwicHJlcGFyZUNvbnRleHRGb3JFeHRlcm5hbE5hdmlnYXRpb24iLCJtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCIsInByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QiLCJpbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJhZGFwdE5hdmlnYXRpb25Db250ZXh0IiwiX3JlbW92ZVRlY2huaWNhbFBhcmFtZXRlcnMiLCJ0aXRsZUxpbmt0b0JlUmVtb3ZlIiwiaW5kZXgiLCJiZWZvcmVOYXZpZ2F0aW9uQ2FsbGJhY2siLCJvRXZlbnQiLCJvU291cmNlIiwiZ2V0U291cmNlIiwic0hyZWYiLCJnZXRQYXJhbWV0ZXIiLCJvVVJMUGFyc2luZyIsIkZhY3RvcnkiLCJnZXRTZXJ2aWNlIiwib0hhc2giLCJLZWVwQWxpdmVIZWxwZXIiLCJzdG9yZUNvbnRyb2xSZWZyZXNoU3RyYXRlZ3lGb3JIYXNoIiwiX2dldFNlbWFudGljT2JqZWN0Q3VzdG9tRGF0YVZhbHVlIiwib1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwic1Byb3BlcnR5TmFtZSIsInNDdXN0b21EYXRhVmFsdWUiLCJpQ3VzdG9tRGF0YUNvdW50IiwiZ2V0S2V5IiwiZ2V0VmFsdWUiLCJfaXNEeW5hbWljUGF0aCIsInBhdGhPclZhbHVlIiwiaW5kZXhPZiIsIl91cGRhdGVQYXlsb2FkV2l0aFJlc29sdmVkU2VtYW50aWNPYmplY3RWYWx1ZSIsIm5ld1BheWxvYWQiLCJzZW1hbnRpY09iamVjdE5hbWUiLCJzZW1hbnRpY09iamVjdHNSZXNvbHZlZCIsImoiLCJfY3JlYXRlTmV3UGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQiLCJ0bXBQcm9wZXJ0eU5hbWUiLCJzdWJzdHIiLCJfdXBkYXRlU2VtYW50aWNPYmplY3RzRm9yTWFwcGluZ3MiLCJtZGNQYXlsb2FkIiwibWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQiLCJzZW1hbnRpY09iamVjdE1hcHBpbmciLCJfdXBkYXRlU2VtYW50aWNPYmplY3RzVW5hdmFpbGFibGVBY3Rpb25zIiwibWRjUGF5bG9hZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiX0luZGV4Iiwic2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbiIsImZpbmRJbmRleCIsIl91cGRhdGVTZW1hbnRpY09iamVjdHNXaXRoUmVzb2x2ZWRWYWx1ZSIsIm5ld1NlbWFudGljT2JqZWN0c0NvdW50Iiwic3BsaWNlIiwiX3JlbW92ZUVtcHR5U2VtYW50aWNPYmplY3RzTWFwcGluZ3MiLCJtYXBwaW5nc0NvdW50IiwiX3NldFBheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwib1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwicHJvcGVydHlQYXRoTGFiZWwiLCJkZWVwQ2xvbmUiLCJfU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsIl9nZXRQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCIsImxpbmtDdXN0b21EYXRhIiwiX3VwZGF0ZVBheWxvYWRXaXRoU2VtYW50aWNBdHRyaWJ1dGVzIiwiYVNlbWFudGljT2JqZWN0cyIsIm9SZXN1bHRzIiwibVNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJhZGRDb250ZXh0T2JqZWN0Iiwic0F0dHJpYnV0ZU5hbWUiLCJvQXR0cmlidXRlIiwib1RyYW5zZm9ybWF0aW9uQWRkaXRpb25hbCIsImdldFNlbWFudGljT2JqZWN0QXR0cmlidXRlIiwiY3JlYXRlQXR0cmlidXRlU3RydWN0dXJlIiwiYWRkU2VtYW50aWNPYmplY3RBdHRyaWJ1dGUiLCJ0cmFuc2Zvcm1hdGlvbnMiLCJkZXNjcmlwdGlvbiIsImlzUGxhaW5PYmplY3QiLCJhS2V5cyIsImtleXMiLCJzTmV3QXR0cmlidXRlTmFtZU1hcHBlZCIsInNOZXdBdHRyaWJ1dGVOYW1lIiwic1ZhbHVlIiwic0tleSIsInNBdHRyaWJ1dGVOYW1lTWFwcGVkIiwicmVhc29uIiwiYUF0dHJpYnV0ZU5ldyIsIl9jb252ZXJ0U2VtYW50aWNPYmplY3RNYXBwaW5nIiwiX2dldFNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJzQXBwU3RhdGVLZXkiLCJvTmF2aWdhdGlvblRhcmdldHMiLCJvd25OYXZpZ2F0aW9uIiwiYXZhaWxhYmxlQWN0aW9ucyIsImlTdXBlcmlvckFjdGlvbkxpbmtzRm91bmQiLCJDb3JlIiwibG9hZExpYnJhcnkiLCJhc3luYyIsInNhcCIsInVpIiwicmVxdWlyZSIsIlV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50Rm9yQ29udHJvbCIsImFQYXJhbXMiLCJzb3J0UmVzdWx0c0J5IiwiZ2V0TGlua3MiLCJiSGFzTGlua3MiLCJhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJfZ2V0U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJvVW5hdmFpbGFibGVBY3Rpb25zIiwiX2NvbnZlcnRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uIiwic0N1cnJlbnRIYXNoIiwiRmllbGRSdW50aW1lIiwiX2ZuRml4SGFzaFF1ZXJ5U3RyaW5nIiwiZ2V0SGFzaCIsImZuSXNVbmF2YWlsYWJsZUFjdGlvbiIsInNBY3Rpb24iLCJmbkFkZExpbmsiLCJzaGVsbEhhc2giLCJpY29uIiwiaW5pdGlhbGx5VmlzaWJsZSIsInRhZ3MiLCJhZGRTZW1hbnRpY09iamVjdEludGVudCIsIm4iLCJpTGlua0l0ZW1JbmRleCIsIm9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uIiwiU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbiIsImFjdGlvbnMiLCJhU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbXMiLCJvU2VtYW50aWNPYmplY3RNYXBwaW5nIiwib1NlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW0iLCJTZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtIiwiU2VtYW50aWNPYmplY3RNYXBwaW5nIiwiZ2V0U2VtYW50aWNPYmplY3QiLCJnZXRJdGVtcyIsInJlZHVjZSIsIm9NYXAiLCJvSXRlbSIsIl9TZW1hbnRpY09iamVjdE5hbWUiLCJfU2VtYW50aWNPYmplY3RIYXNBbHJlYWR5VW5hdmFpbGFibGVBY3Rpb25zIiwiX1VuYXZhaWxhYmxlQWN0aW9ucyIsIm1TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsIm9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsImdldEFjdGlvbnMiLCJVbmF2YWlsYWJsZUFjdGlvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUXVpY2tWaWV3RGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgZGVlcENsb25lIGZyb20gXCJzYXAvYmFzZS91dGlsL2RlZXBDbG9uZVwiO1xuaW1wb3J0IGRlZXBFcXVhbCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwRXF1YWxcIjtcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gXCJzYXAvYmFzZS91dGlsL2lzUGxhaW5PYmplY3RcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBLZWVwQWxpdmVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvS2VlcEFsaXZlSGVscGVyXCI7XG5pbXBvcnQgdG9FUzZQcm9taXNlIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1RvRVM2UHJvbWlzZVwiO1xuaW1wb3J0IFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgTmF2aWdhdGlvblNlcnZpY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvTmF2aWdhdGlvblNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgeyBnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1NlbWFudGljT2JqZWN0SGVscGVyXCI7XG5pbXBvcnQgRmllbGRIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRIZWxwZXJcIjtcbmltcG9ydCBGaWVsZFJ1bnRpbWUgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lXCI7XG5pbXBvcnQgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgRmFjdG9yeSBmcm9tIFwic2FwL3VpL21kYy9saW5rL0ZhY3RvcnlcIjtcbmltcG9ydCBMaW5rSXRlbSBmcm9tIFwic2FwL3VpL21kYy9saW5rL0xpbmtJdGVtXCI7XG5pbXBvcnQgU2VtYW50aWNPYmplY3RNYXBwaW5nIGZyb20gXCJzYXAvdWkvbWRjL2xpbmsvU2VtYW50aWNPYmplY3RNYXBwaW5nXCI7XG5pbXBvcnQgU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbSBmcm9tIFwic2FwL3VpL21kYy9saW5rL1NlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW1cIjtcbmltcG9ydCBTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uIGZyb20gXCJzYXAvdWkvbWRjL2xpbmsvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvblwiO1xuaW1wb3J0IExpbmtEZWxlZ2F0ZSBmcm9tIFwic2FwL3VpL21kYy9MaW5rRGVsZWdhdGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxuZXhwb3J0IHR5cGUgUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZyA9IHsgc2VtYW50aWNPYmplY3Q6IHN0cmluZzsgaXRlbXM6IHsga2V5OiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfVtdIH07XG50eXBlIFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdE1hcHBpbmdzID0gUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZ1tdO1xuZXhwb3J0IHR5cGUgUmVnaXN0ZXJlZFBheWxvYWQgPSB7XG5cdG1haW5TZW1hbnRpY09iamVjdD86IHN0cmluZztcblx0c2VtYW50aWNPYmplY3RzOiBzdHJpbmdbXTtcblx0c2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ/OiBzdHJpbmdbXTtcblx0c2VtYW50aWNPYmplY3RNYXBwaW5nczogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZ3M7XG5cdHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zPzogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zO1xuXHRlbnRpdHlUeXBlPzogc3RyaW5nO1xuXHRkYXRhRmllbGQ/OiBzdHJpbmc7XG5cdGNvbnRhY3Q/OiBzdHJpbmc7XG5cdG5hdmlnYXRpb25QYXRoPzogc3RyaW5nO1xuXHRwcm9wZXJ0eVBhdGhMYWJlbD86IHN0cmluZztcblx0aGFzUXVpY2tWaWV3RmFjZXRzPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0ge1xuXHRzZW1hbnRpY09iamVjdDogc3RyaW5nO1xuXHRhY3Rpb25zOiBzdHJpbmdbXTtcbn1bXTtcblxuY29uc3QgU2ltcGxlTGlua0RlbGVnYXRlID0gT2JqZWN0LmFzc2lnbih7fSwgTGlua0RlbGVnYXRlKSBhcyBhbnk7XG5jb25zdCBDT05TVEFOVFMgPSB7XG5cdGlMaW5rc1Nob3duSW5Qb3B1cDogMyxcblx0c2FwbUxpbms6IFwic2FwLm0uTGlua1wiLFxuXHRzYXB1aW1kY0xpbms6IFwic2FwLnVpLm1kYy5MaW5rXCIsXG5cdHNhcHVpbWRjbGlua0xpbmtJdGVtOiBcInNhcC51aS5tZGMubGluay5MaW5rSXRlbVwiLFxuXHRzYXBtT2JqZWN0SWRlbnRpZmllcjogXCJzYXAubS5PYmplY3RJZGVudGlmaWVyXCIsXG5cdHNhcG1PYmplY3RTdGF0dXM6IFwic2FwLm0uT2JqZWN0U3RhdHVzXCJcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuZ2V0Q29uc3RhbnRzID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gQ09OU1RBTlRTO1xufTtcbi8qKlxuICogVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiB0aGUgU2VtYW50aWNPYmplY3RzIGFzIHN0cmluZ3MgZ2l2ZW4gYnkgdGhlIHBheWxvYWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBkZWZpbmVkIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIE9EYXRhTWV0YU1vZGVsIHJlY2VpdmVkIGZyb20gdGhlIExpbmtcbiAqIEByZXR1cm5zIFRoZSBjb250ZXh0IHBvaW50aW5nIHRvIHRoZSBjdXJyZW50IEVudGl0eVR5cGUuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0RW50aXR5VHlwZSA9IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55LCBvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCkge1xuXHRpZiAob01ldGFNb2RlbCkge1xuXHRcdHJldHVybiBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG9QYXlsb2FkLmVudGl0eVR5cGUpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG4vKipcbiAqIFRoaXMgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2YgdGhlIFNlbWFudGljT2JqZWN0cyBhcyBzdHJpbmdzIGdpdmVuIGJ5IHRoZSBwYXlsb2FkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gb1BheWxvYWQgVGhlIHBheWxvYWQgZGVmaW5lZCBieSB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBPRGF0YU1ldGFNb2RlbCByZWNlaXZlZCBmcm9tIHRoZSBMaW5rXG4gKiBAcmV0dXJucyBBIG1vZGVsIGNvbnRhaW5pbmcgdGhlIHBheWxvYWQgaW5mb3JtYXRpb25cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY3NNb2RlbCA9IGZ1bmN0aW9uIChvUGF5bG9hZDogb2JqZWN0LCBvTWV0YU1vZGVsOiBvYmplY3QpIHtcblx0aWYgKG9NZXRhTW9kZWwpIHtcblx0XHRyZXR1cm4gbmV3IEpTT05Nb2RlbChvUGF5bG9hZCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcbi8qKlxuICogVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiB0aGUgU2VtYW50aWNPYmplY3RzIGFzIHN0cmluZ3MgZ2l2ZW4gYnkgdGhlIHBheWxvYWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBkZWZpbmVkIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIE9EYXRhTWV0YU1vZGVsIHJlY2VpdmVkIGZyb20gdGhlIExpbmtcbiAqIEByZXR1cm5zIEFuIGFycmF5IGNvbnRhaW5pbmcgU2VtYW50aWNPYmplY3RzIGJhc2VkIG9mIHRoZSBwYXlsb2FkXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0RGF0YUZpZWxkID0gZnVuY3Rpb24gKG9QYXlsb2FkOiBhbnksIG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdHJldHVybiBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG9QYXlsb2FkLmRhdGFGaWVsZCk7XG59O1xuLyoqXG4gKiBUaGlzIHdpbGwgcmV0dXJuIGFuIGFycmF5IG9mIHRoZSBTZW1hbnRpY09iamVjdHMgYXMgc3RyaW5ncyBnaXZlbiBieSB0aGUgcGF5bG9hZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBwYXlsb2FkIGRlZmluZWQgYnkgdGhlIGFwcGxpY2F0aW9uXG4gKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgT0RhdGFNZXRhTW9kZWwgcmVjZWl2ZWQgZnJvbSB0aGUgTGlua1xuICogQHJldHVybnMgQW5jb250YWluaW5nIFNlbWFudGljT2JqZWN0cyBiYXNlZCBvZiB0aGUgcGF5bG9hZFxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldENvbnRhY3QgPSBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSwgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0cmV0dXJuIG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQob1BheWxvYWQuY29udGFjdCk7XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLmZuVGVtcGxhdGVGcmFnbWVudCA9IGZ1bmN0aW9uICgpIHtcblx0bGV0IHNGcmFnbWVudE5hbWU6IHN0cmluZywgdGl0bGVMaW5rSHJlZjtcblx0Y29uc3Qgb0ZyYWdtZW50TW9kZWw6IGFueSA9IHt9O1xuXHRsZXQgb1BheWxvYWRUb1VzZTtcblxuXHQvLyBwYXlsb2FkIGhhcyBiZWVuIG1vZGlmaWVkIGJ5IGZldGNoaW5nIFNlbWFudGljIE9iamVjdHMgbmFtZXMgd2l0aCBwYXRoXG5cdGlmICh0aGlzLnJlc29sdmVkcGF5bG9hZCkge1xuXHRcdG9QYXlsb2FkVG9Vc2UgPSB0aGlzLnJlc29sdmVkcGF5bG9hZDtcblx0fSBlbHNlIHtcblx0XHRvUGF5bG9hZFRvVXNlID0gdGhpcy5wYXlsb2FkO1xuXHR9XG5cblx0aWYgKG9QYXlsb2FkVG9Vc2UgJiYgIW9QYXlsb2FkVG9Vc2UuTGlua0lkKSB7XG5cdFx0b1BheWxvYWRUb1VzZS5MaW5rSWQgPSB0aGlzLm9Db250cm9sICYmIHRoaXMub0NvbnRyb2wuaXNBKENPTlNUQU5UUy5zYXB1aW1kY0xpbmspID8gdGhpcy5vQ29udHJvbC5nZXRJZCgpIDogdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKG9QYXlsb2FkVG9Vc2UuTGlua0lkKSB7XG5cdFx0dGl0bGVMaW5rSHJlZiA9IHRoaXMub0NvbnRyb2wuZ2V0TW9kZWwoXCIkc2FwdWltZGNMaW5rXCIpLmdldFByb3BlcnR5KFwiL3RpdGxlTGlua0hyZWZcIik7XG5cdFx0b1BheWxvYWRUb1VzZS50aXRsZWxpbmsgPSB0aXRsZUxpbmtIcmVmO1xuXHR9XG5cblx0Y29uc3Qgb1NlbWFudGljc01vZGVsID0gdGhpcy5fZ2V0U2VtYW50aWNzTW9kZWwob1BheWxvYWRUb1VzZSwgdGhpcy5vTWV0YU1vZGVsKTtcblx0dGhpcy5zZW1hbnRpY01vZGVsID0gb1NlbWFudGljc01vZGVsO1xuXG5cdGlmIChvUGF5bG9hZFRvVXNlLmVudGl0eVR5cGUgJiYgdGhpcy5fZ2V0RW50aXR5VHlwZShvUGF5bG9hZFRvVXNlLCB0aGlzLm9NZXRhTW9kZWwpKSB7XG5cdFx0c0ZyYWdtZW50TmFtZSA9IFwic2FwLmZlLm1hY3Jvcy5xdWlja1ZpZXcuZnJhZ21lbnRzLkVudGl0eVF1aWNrVmlld1wiO1xuXHRcdG9GcmFnbWVudE1vZGVsLmJpbmRpbmdDb250ZXh0cyA9IHtcblx0XHRcdGVudGl0eVR5cGU6IHRoaXMuX2dldEVudGl0eVR5cGUob1BheWxvYWRUb1VzZSwgdGhpcy5vTWV0YU1vZGVsKSxcblx0XHRcdHNlbWFudGljOiBvU2VtYW50aWNzTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0fTtcblx0XHRvRnJhZ21lbnRNb2RlbC5tb2RlbHMgPSB7XG5cdFx0XHRlbnRpdHlUeXBlOiB0aGlzLm9NZXRhTW9kZWwsXG5cdFx0XHRzZW1hbnRpYzogb1NlbWFudGljc01vZGVsXG5cdFx0fTtcblx0fSBlbHNlIGlmIChvUGF5bG9hZFRvVXNlLmRhdGFGaWVsZCAmJiB0aGlzLl9nZXREYXRhRmllbGQob1BheWxvYWRUb1VzZSwgdGhpcy5vTWV0YU1vZGVsKSkge1xuXHRcdHNGcmFnbWVudE5hbWUgPSBcInNhcC5mZS5tYWNyb3MucXVpY2tWaWV3LmZyYWdtZW50cy5EYXRhRmllbGRRdWlja1ZpZXdcIjtcblx0XHRvRnJhZ21lbnRNb2RlbC5iaW5kaW5nQ29udGV4dHMgPSB7XG5cdFx0XHRkYXRhRmllbGQ6IHRoaXMuX2dldERhdGFGaWVsZChvUGF5bG9hZFRvVXNlLCB0aGlzLm9NZXRhTW9kZWwpLFxuXHRcdFx0c2VtYW50aWM6IG9TZW1hbnRpY3NNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHR9O1xuXHRcdG9GcmFnbWVudE1vZGVsLm1vZGVscyA9IHtcblx0XHRcdGRhdGFGaWVsZDogdGhpcy5vTWV0YU1vZGVsLFxuXHRcdFx0c2VtYW50aWM6IG9TZW1hbnRpY3NNb2RlbFxuXHRcdH07XG5cdH1cblx0b0ZyYWdtZW50TW9kZWwubW9kZWxzLmVudGl0eVNldCA9IHRoaXMub01ldGFNb2RlbDtcblx0b0ZyYWdtZW50TW9kZWwubW9kZWxzLm1ldGFNb2RlbCA9IHRoaXMub01ldGFNb2RlbDtcblx0aWYgKHRoaXMub0NvbnRyb2wgJiYgdGhpcy5vQ29udHJvbC5nZXRNb2RlbChcInZpZXdEYXRhXCIpKSB7XG5cdFx0b0ZyYWdtZW50TW9kZWwubW9kZWxzLnZpZXdEYXRhID0gdGhpcy5vQ29udHJvbC5nZXRNb2RlbChcInZpZXdEYXRhXCIpO1xuXHRcdG9GcmFnbWVudE1vZGVsLmJpbmRpbmdDb250ZXh0cy52aWV3RGF0YSA9IHRoaXMub0NvbnRyb2wuZ2V0TW9kZWwoXCJ2aWV3RGF0YVwiKS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdH1cblxuXHRjb25zdCBvRnJhZ21lbnQgPSBYTUxUZW1wbGF0ZVByb2Nlc3Nvci5sb2FkVGVtcGxhdGUoc0ZyYWdtZW50TmFtZSEsIFwiZnJhZ21lbnRcIik7XG5cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShYTUxQcmVwcm9jZXNzb3IucHJvY2VzcyhvRnJhZ21lbnQsIHsgbmFtZTogc0ZyYWdtZW50TmFtZSEgfSwgb0ZyYWdtZW50TW9kZWwpKVxuXHRcdC50aGVuKChfaW50ZXJuYWxGcmFnbWVudDogYW55KSA9PiB7XG5cdFx0XHRyZXR1cm4gRnJhZ21lbnQubG9hZCh7XG5cdFx0XHRcdGRlZmluaXRpb246IF9pbnRlcm5hbEZyYWdtZW50LFxuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzXG5cdFx0XHR9KTtcblx0XHR9KVxuXHRcdC50aGVuKChvUG9wb3ZlckNvbnRlbnQ6IGFueSkgPT4ge1xuXHRcdFx0aWYgKG9Qb3BvdmVyQ29udGVudCkge1xuXHRcdFx0XHRpZiAob0ZyYWdtZW50TW9kZWwubW9kZWxzICYmIG9GcmFnbWVudE1vZGVsLm1vZGVscy5zZW1hbnRpYykge1xuXHRcdFx0XHRcdG9Qb3BvdmVyQ29udGVudC5zZXRNb2RlbChvRnJhZ21lbnRNb2RlbC5tb2RlbHMuc2VtYW50aWMsIFwic2VtYW50aWNcIik7XG5cdFx0XHRcdFx0b1BvcG92ZXJDb250ZW50LnNldEJpbmRpbmdDb250ZXh0KG9GcmFnbWVudE1vZGVsLmJpbmRpbmdDb250ZXh0cy5zZW1hbnRpYywgXCJzZW1hbnRpY1wiKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvRnJhZ21lbnRNb2RlbC5iaW5kaW5nQ29udGV4dHMgJiYgb0ZyYWdtZW50TW9kZWwuYmluZGluZ0NvbnRleHRzLmVudGl0eVR5cGUpIHtcblx0XHRcdFx0XHRvUG9wb3ZlckNvbnRlbnQuc2V0TW9kZWwob0ZyYWdtZW50TW9kZWwubW9kZWxzLmVudGl0eVR5cGUsIFwiZW50aXR5VHlwZVwiKTtcblx0XHRcdFx0XHRvUG9wb3ZlckNvbnRlbnQuc2V0QmluZGluZ0NvbnRleHQob0ZyYWdtZW50TW9kZWwuYmluZGluZ0NvbnRleHRzLmVudGl0eVR5cGUsIFwiZW50aXR5VHlwZVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZXNvbHZlZHBheWxvYWQgPSB1bmRlZmluZWQ7XG5cdFx0XHRyZXR1cm4gb1BvcG92ZXJDb250ZW50O1xuXHRcdH0pO1xufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5mZXRjaEFkZGl0aW9uYWxDb250ZW50ID0gZnVuY3Rpb24gKG9QYXlMb2FkOiBhbnksIG9NZGNMaW5rQ29udHJvbDogYW55KSB7XG5cdHRoaXMub0NvbnRyb2wgPSBvTWRjTGlua0NvbnRyb2w7XG5cdGNvbnN0IGFOYXZpZ2F0ZVJlZ2V4cE1hdGNoID0gb1BheUxvYWQ/Lm5hdmlnYXRpb25QYXRoPy5tYXRjaCgveyguKj8pfS8pO1xuXHRjb25zdCBvQmluZGluZ0NvbnRleHQgPVxuXHRcdGFOYXZpZ2F0ZVJlZ2V4cE1hdGNoICYmIGFOYXZpZ2F0ZVJlZ2V4cE1hdGNoLmxlbmd0aCA+IDEgJiYgYU5hdmlnYXRlUmVnZXhwTWF0Y2hbMV1cblx0XHRcdD8gb01kY0xpbmtDb250cm9sLmdldE1vZGVsKCkuYmluZENvbnRleHQoYU5hdmlnYXRlUmVnZXhwTWF0Y2hbMV0sIG9NZGNMaW5rQ29udHJvbC5nZXRCaW5kaW5nQ29udGV4dCgpLCB7ICQkb3duUmVxdWVzdDogdHJ1ZSB9KVxuXHRcdFx0OiBudWxsO1xuXHR0aGlzLnBheWxvYWQgPSBvUGF5TG9hZDtcblx0aWYgKG9NZGNMaW5rQ29udHJvbCAmJiBvTWRjTGlua0NvbnRyb2wuaXNBKENPTlNUQU5UUy5zYXB1aW1kY0xpbmspKSB7XG5cdFx0dGhpcy5vTWV0YU1vZGVsID0gb01kY0xpbmtDb250cm9sLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0cmV0dXJuIHRoaXMuZm5UZW1wbGF0ZUZyYWdtZW50KCkudGhlbihmdW5jdGlvbiAob1BvcG92ZXJDb250ZW50OiBhbnkpIHtcblx0XHRcdGlmIChvQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdFx0b1BvcG92ZXJDb250ZW50LnNldEJpbmRpbmdDb250ZXh0KG9CaW5kaW5nQ29udGV4dC5nZXRCb3VuZENvbnRleHQoKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gW29Qb3BvdmVyQ29udGVudF07XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLl9mZXRjaExpbmtDdXN0b21EYXRhID0gZnVuY3Rpb24gKF9vTGluazogYW55KSB7XG5cdGlmIChcblx0XHRfb0xpbmsuZ2V0UGFyZW50KCkgJiZcblx0XHRfb0xpbmsuaXNBKENPTlNUQU5UUy5zYXB1aW1kY0xpbmspICYmXG5cdFx0KF9vTGluay5nZXRQYXJlbnQoKS5pc0EoQ09OU1RBTlRTLnNhcG1MaW5rKSB8fFxuXHRcdFx0X29MaW5rLmdldFBhcmVudCgpLmlzQShDT05TVEFOVFMuc2FwbU9iamVjdElkZW50aWZpZXIpIHx8XG5cdFx0XHRfb0xpbmsuZ2V0UGFyZW50KCkuaXNBKENPTlNUQU5UUy5zYXBtT2JqZWN0U3RhdHVzKSlcblx0KSB7XG5cdFx0cmV0dXJuIF9vTGluay5nZXRDdXN0b21EYXRhKCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcbi8qKlxuICogRmV0Y2hlcyB0aGUgcmVsZXZhbnQge0BsaW5rIHNhcC51aS5tZGMubGluay5MaW5rSXRlbX0gZm9yIHRoZSBMaW5rIGFuZCByZXR1cm5zIHRoZW0uXG4gKlxuICogQHB1YmxpY1xuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBQYXlsb2FkIG9mIHRoZSBMaW5rIGdpdmVuIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9CaW5kaW5nQ29udGV4dCBUaGUgQ29udGV4dE9iamVjdCBvZiB0aGUgTGlua1xuICogQHBhcmFtIG9JbmZvTG9nIFRoZSBJbmZvTG9nIG9mIHRoZSBMaW5rXG4gKiBAcmV0dXJucyBPbmNlIHJlc29sdmVkIGFuIGFycmF5IG9mIHtAbGluayBzYXAudWkubWRjLmxpbmsuTGlua0l0ZW19IGlzIHJldHVybmVkXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5mZXRjaExpbmtJdGVtcyA9IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55LCBvQmluZGluZ0NvbnRleHQ6IENvbnRleHQsIG9JbmZvTG9nOiBhbnkpIHtcblx0aWYgKG9CaW5kaW5nQ29udGV4dCAmJiBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0cyhvUGF5bG9hZCkpIHtcblx0XHRjb25zdCBvQ29udGV4dE9iamVjdCA9IG9CaW5kaW5nQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRpZiAob0luZm9Mb2cpIHtcblx0XHRcdG9JbmZvTG9nLmluaXRpYWxpemUoU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdHMob1BheWxvYWQpKTtcblx0XHR9XG5cdFx0Y29uc3QgX29MaW5rQ3VzdG9tRGF0YSA9IHRoaXMuX2xpbmsgJiYgdGhpcy5fZmV0Y2hMaW5rQ3VzdG9tRGF0YSh0aGlzLl9saW5rKTtcblx0XHR0aGlzLmFMaW5rQ3VzdG9tRGF0YSA9XG5cdFx0XHRfb0xpbmtDdXN0b21EYXRhICYmXG5cdFx0XHR0aGlzLl9mZXRjaExpbmtDdXN0b21EYXRhKHRoaXMuX2xpbmspLm1hcChmdW5jdGlvbiAobGlua0l0ZW06IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gbGlua0l0ZW0ubVByb3BlcnRpZXMudmFsdWU7XG5cdFx0XHR9KTtcblxuXHRcdGNvbnN0IG9TZW1hbnRpY0F0dHJpYnV0ZXNSZXNvbHZlZCA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fY2FsY3VsYXRlU2VtYW50aWNBdHRyaWJ1dGVzKG9Db250ZXh0T2JqZWN0LCBvUGF5bG9hZCwgb0luZm9Mb2csIHRoaXMuX2xpbmspO1xuXHRcdGNvbnN0IG9TZW1hbnRpY0F0dHJpYnV0ZXMgPSBvU2VtYW50aWNBdHRyaWJ1dGVzUmVzb2x2ZWQucmVzdWx0cztcblx0XHRjb25zdCBvUGF5bG9hZFJlc29sdmVkID0gb1NlbWFudGljQXR0cmlidXRlc1Jlc29sdmVkLnBheWxvYWQ7XG5cblx0XHRyZXR1cm4gU2ltcGxlTGlua0RlbGVnYXRlLl9yZXRyaWV2ZU5hdmlnYXRpb25UYXJnZXRzKFwiXCIsIG9TZW1hbnRpY0F0dHJpYnV0ZXMsIG9QYXlsb2FkUmVzb2x2ZWQsIG9JbmZvTG9nLCB0aGlzLl9saW5rKS50aGVuKFxuXHRcdFx0ZnVuY3Rpb24gKGFMaW5rczogYW55IC8qb093bk5hdmlnYXRpb25MaW5rOiBhbnkqLykge1xuXHRcdFx0XHRyZXR1cm4gYUxpbmtzLmxlbmd0aCA9PT0gMCA/IG51bGwgOiBhTGlua3M7XG5cdFx0XHR9XG5cdFx0KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHR9XG59O1xuXG4vKipcbiAqIEZpbmQgdGhlIHR5cGUgb2YgdGhlIGxpbmsuXG4gKlxuICogQHBhcmFtIHBheWxvYWQgVGhlIHBheWxvYWQgb2YgdGhlIG1kYyBsaW5rLlxuICogQHBhcmFtIGFMaW5rSXRlbXMgTGlua3MgcmV0dXJuZWQgYnkgY2FsbCB0byBtZGMgX3JldHJpZXZlVW5tb2RpZmllZExpbmtJdGVtcy5cbiAqIEByZXR1cm5zIFRoZSB0eXBlIG9mIHRoZSBsaW5rIGFzIGRlZmluZWQgYnkgbWRjLlxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2ZpbmRMaW5rVHlwZSA9IGZ1bmN0aW9uIChwYXlsb2FkOiBhbnksIGFMaW5rSXRlbXM6IGFueVtdKTogYW55IHtcblx0bGV0IG5MaW5rVHlwZSwgb0xpbmtJdGVtO1xuXHRpZiAoYUxpbmtJdGVtcz8ubGVuZ3RoID09PSAxKSB7XG5cdFx0b0xpbmtJdGVtID0gbmV3IExpbmtJdGVtKHtcblx0XHRcdHRleHQ6IGFMaW5rSXRlbXNbMF0uZ2V0VGV4dCgpLFxuXHRcdFx0aHJlZjogYUxpbmtJdGVtc1swXS5nZXRIcmVmKClcblx0XHR9KTtcblx0XHRuTGlua1R5cGUgPSBwYXlsb2FkLmhhc1F1aWNrVmlld0ZhY2V0cyA9PT0gXCJmYWxzZVwiID8gMSA6IDI7XG5cdH0gZWxzZSBpZiAocGF5bG9hZC5oYXNRdWlja1ZpZXdGYWNldHMgPT09IFwiZmFsc2VcIiAmJiBhTGlua0l0ZW1zPy5sZW5ndGggPT09IDApIHtcblx0XHRuTGlua1R5cGUgPSAwO1xuXHR9IGVsc2Uge1xuXHRcdG5MaW5rVHlwZSA9IDI7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRsaW5rVHlwZTogbkxpbmtUeXBlLFxuXHRcdGxpbmtJdGVtOiBvTGlua0l0ZW1cblx0fTtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuZmV0Y2hMaW5rVHlwZSA9IGFzeW5jIGZ1bmN0aW9uIChvUGF5bG9hZDogYW55LCBvTGluazogYW55KSB7XG5cdGNvbnN0IF9vQ3VycmVudExpbmsgPSBvTGluaztcblx0Y29uc3QgX29QYXlsb2FkID0gT2JqZWN0LmFzc2lnbih7fSwgb1BheWxvYWQpO1xuXHRjb25zdCBvRGVmYXVsdEluaXRpYWxUeXBlID0ge1xuXHRcdGluaXRpYWxUeXBlOiB7XG5cdFx0XHR0eXBlOiAyLFxuXHRcdFx0ZGlyZWN0TGluazogdW5kZWZpbmVkXG5cdFx0fSxcblx0XHRydW50aW1lVHlwZTogdW5kZWZpbmVkXG5cdH07XG5cdC8vIGNsZWFuIGFwcFN0YXRlS2V5TWFwIHN0b3JhZ2Vcblx0aWYgKCF0aGlzLmFwcFN0YXRlS2V5TWFwKSB7XG5cdFx0dGhpcy5hcHBTdGF0ZUtleU1hcCA9IHt9O1xuXHR9XG5cblx0dHJ5IHtcblx0XHRpZiAoX29QYXlsb2FkPy5zZW1hbnRpY09iamVjdHMpIHtcblx0XHRcdHRoaXMuX2xpbmsgPSBvTGluaztcblx0XHRcdGxldCBhTGlua0l0ZW1zID0gYXdhaXQgX29DdXJyZW50TGluay5fcmV0cmlldmVVbm1vZGlmaWVkTGlua0l0ZW1zKCk7XG5cdFx0XHRpZiAoYUxpbmtJdGVtcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0Ly8gVGhpcyBpcyB0aGUgZGlyZWN0IG5hdmlnYXRpb24gdXNlIGNhc2Ugc28gd2UgbmVlZCB0byBwZXJmb3JtIHRoZSBhcHByb3ByaWF0ZSBjaGVja3MgLyB0cmFuc2Zvcm1hdGlvbnNcblx0XHRcdFx0YUxpbmtJdGVtcyA9IGF3YWl0IF9vQ3VycmVudExpbmsucmV0cmlldmVMaW5rSXRlbXMoKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IF9MaW5rVHlwZSA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZmluZExpbmtUeXBlKF9vUGF5bG9hZCwgYUxpbmtJdGVtcyk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRpbml0aWFsVHlwZToge1xuXHRcdFx0XHRcdHR5cGU6IF9MaW5rVHlwZS5saW5rVHlwZSxcblx0XHRcdFx0XHRkaXJlY3RMaW5rOiBfTGlua1R5cGUubGlua0l0ZW0gPyBfTGlua1R5cGUubGlua0l0ZW0gOiB1bmRlZmluZWRcblx0XHRcdFx0fSxcblx0XHRcdFx0cnVudGltZVR5cGU6IHVuZGVmaW5lZFxuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKF9vUGF5bG9hZD8uY29udGFjdD8ubGVuZ3RoID4gMCkge1xuXHRcdFx0cmV0dXJuIG9EZWZhdWx0SW5pdGlhbFR5cGU7XG5cdFx0fSBlbHNlIGlmIChfb1BheWxvYWQ/LmVudGl0eVR5cGUgJiYgX29QYXlsb2FkPy5uYXZpZ2F0aW9uUGF0aCkge1xuXHRcdFx0cmV0dXJuIG9EZWZhdWx0SW5pdGlhbFR5cGU7XG5cdFx0fVxuXHRcdHRocm93IG5ldyBFcnJvcihcIm5vIHBheWxvYWQgb3Igc2VtYW50aWNPYmplY3RzIGZvdW5kXCIpO1xuXHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdExvZy5lcnJvcihcIkVycm9yIGluIFNpbXBsZUxpbmtEZWxlZ2F0ZS5mZXRjaExpbmtUeXBlOiBcIiwgb0Vycm9yKTtcblx0fVxufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl9SZW1vdmVUaXRsZUxpbmtGcm9tVGFyZ2V0cyA9IGZ1bmN0aW9uIChfYUxpbmtJdGVtczogYW55W10sIF9iVGl0bGVIYXNMaW5rOiBib29sZWFuLCBfYVRpdGxlTGluazogYW55KTogYW55IHtcblx0bGV0IF9zVGl0bGVMaW5rSHJlZiwgX29NRENMaW5rO1xuXHRsZXQgYlJlc3VsdDogYm9vbGVhbiA9IGZhbHNlO1xuXHRpZiAoX2JUaXRsZUhhc0xpbmsgJiYgX2FUaXRsZUxpbmsgJiYgX2FUaXRsZUxpbmtbMF0pIHtcblx0XHRsZXQgbGlua0lzUHJpbWFyeUFjdGlvbjogYm9vbGVhbiwgX3NMaW5rSW50ZW50V2l0aG91dFBhcmFtZXRlcnM6IHN0cmluZztcblx0XHRjb25zdCBfc1RpdGxlSW50ZW50ID0gX2FUaXRsZUxpbmtbMF0uaW50ZW50LnNwbGl0KFwiP1wiKVswXTtcblx0XHRpZiAoX2FMaW5rSXRlbXMgJiYgX2FMaW5rSXRlbXNbMF0pIHtcblx0XHRcdF9zTGlua0ludGVudFdpdGhvdXRQYXJhbWV0ZXJzID0gYCMke19hTGlua0l0ZW1zWzBdLmdldFByb3BlcnR5KFwia2V5XCIpfWA7XG5cdFx0XHRsaW5rSXNQcmltYXJ5QWN0aW9uID0gX3NUaXRsZUludGVudCA9PT0gX3NMaW5rSW50ZW50V2l0aG91dFBhcmFtZXRlcnM7XG5cdFx0XHRpZiAobGlua0lzUHJpbWFyeUFjdGlvbikge1xuXHRcdFx0XHRfc1RpdGxlTGlua0hyZWYgPSBfYUxpbmtJdGVtc1swXS5nZXRQcm9wZXJ0eShcImhyZWZcIik7XG5cdFx0XHRcdHRoaXMucGF5bG9hZC50aXRsZWxpbmtocmVmID0gX3NUaXRsZUxpbmtIcmVmO1xuXHRcdFx0XHRpZiAoX2FMaW5rSXRlbXNbMF0uaXNBKENPTlNUQU5UUy5zYXB1aW1kY2xpbmtMaW5rSXRlbSkpIHtcblx0XHRcdFx0XHRfb01EQ0xpbmsgPSBfYUxpbmtJdGVtc1swXS5nZXRQYXJlbnQoKTtcblx0XHRcdFx0XHRfb01EQ0xpbmsuZ2V0TW9kZWwoXCIkc2FwdWltZGNMaW5rXCIpLnNldFByb3BlcnR5KFwiL3RpdGxlTGlua0hyZWZcIiwgX3NUaXRsZUxpbmtIcmVmKTtcblx0XHRcdFx0XHRjb25zdCBhTUxpbmtJdGVtcyA9IF9vTURDTGlua1xuXHRcdFx0XHRcdFx0LmdldE1vZGVsKFwiJHNhcHVpbWRjTGlua1wiKVxuXHRcdFx0XHRcdFx0LmdldFByb3BlcnR5KFwiL2xpbmtJdGVtc1wiKVxuXHRcdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAob0xpbmtJdGVtOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGAjJHtvTGlua0l0ZW0ua2V5fWAgIT09IF9zTGlua0ludGVudFdpdGhvdXRQYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9MaW5rSXRlbTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0aWYgKGFNTGlua0l0ZW1zICYmIGFNTGlua0l0ZW1zLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdF9vTURDTGluay5nZXRNb2RlbChcIiRzYXB1aW1kY0xpbmtcIikuc2V0UHJvcGVydHkoXCIvbGlua0l0ZW1zL1wiLCBhTUxpbmtJdGVtcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJSZXN1bHQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBiUmVzdWx0O1xufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5fSXNTZW1hbnRpY09iamVjdER5bmFtaWMgPSBmdW5jdGlvbiAoYU5ld0xpbmtDdXN0b21EYXRhOiBhbnksIG9UaGlzOiBhbnkpIHtcblx0aWYgKGFOZXdMaW5rQ3VzdG9tRGF0YSAmJiBvVGhpcy5hTGlua0N1c3RvbURhdGEpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0b1RoaXMuYUxpbmtDdXN0b21EYXRhLmZpbHRlcihmdW5jdGlvbiAobGluazogYW55KSB7XG5cdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0YU5ld0xpbmtDdXN0b21EYXRhLmZpbHRlcihmdW5jdGlvbiAob3RoZXJMaW5rOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvdGhlckxpbmsgIT09IGxpbms7XG5cdFx0XHRcdFx0fSkubGVuZ3RoID4gMFxuXHRcdFx0XHQpO1xuXHRcdFx0fSkubGVuZ3RoID4gMFxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRMaW5lQ29udGV4dCA9IGZ1bmN0aW9uIChvVmlldzogYW55LCBtTGluZUNvbnRleHQ6IGFueSkge1xuXHRpZiAoIW1MaW5lQ29udGV4dCkge1xuXHRcdGlmIChvVmlldy5nZXRBZ2dyZWdhdGlvbihcImNvbnRlbnRcIilbMF0gJiYgb1ZpZXcuZ2V0QWdncmVnYXRpb24oXCJjb250ZW50XCIpWzBdLmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHRcdHJldHVybiBvVmlldy5nZXRBZ2dyZWdhdGlvbihcImNvbnRlbnRcIilbMF0uZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG1MaW5lQ29udGV4dDtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuX3NldEZpbHRlckNvbnRleHRVcmxGb3JTZWxlY3Rpb25WYXJpYW50ID0gZnVuY3Rpb24gKFxuXHRvVmlldzogYW55LFxuXHRvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCxcblx0b05hdmlnYXRpb25TZXJ2aWNlOiBhbnlcbik6IFNlbGVjdGlvblZhcmlhbnQge1xuXHRpZiAob1ZpZXcuZ2V0Vmlld0RhdGEoKS5lbnRpdHlTZXQgJiYgb1NlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRjb25zdCBzQ29udGV4dFVybCA9IG9OYXZpZ2F0aW9uU2VydmljZS5jb25zdHJ1Y3RDb250ZXh0VXJsKG9WaWV3LmdldFZpZXdEYXRhKCkuZW50aXR5U2V0LCBvVmlldy5nZXRNb2RlbCgpKTtcblx0XHRvU2VsZWN0aW9uVmFyaWFudC5zZXRGaWx0ZXJDb250ZXh0VXJsKHNDb250ZXh0VXJsKTtcblx0fVxuXHRyZXR1cm4gb1NlbGVjdGlvblZhcmlhbnQ7XG59O1xuXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3NldE9iamVjdE1hcHBpbmdzID0gZnVuY3Rpb24gKFxuXHRzU2VtYW50aWNPYmplY3Q6IHN0cmluZyxcblx0b1BhcmFtczogYW55LFxuXHRhU2VtYW50aWNPYmplY3RNYXBwaW5nczogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZ3MsXG5cdG9TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50XG4pIHtcblx0bGV0IGhhc0NoYW5nZWQgPSBmYWxzZTtcblx0Y29uc3QgbW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQob1NlbGVjdGlvblZhcmlhbnQudG9KU09OT2JqZWN0KCkpO1xuXHQvLyBpZiBzZW1hbnRpY09iamVjdE1hcHBpbmdzIGhhcyBpdGVtcyB3aXRoIGR5bmFtaWMgc2VtYW50aWNPYmplY3RzIHdlIG5lZWQgdG8gcmVzb2x2ZSB0aGVtIHVzaW5nIG9QYXJhbXNcblx0YVNlbWFudGljT2JqZWN0TWFwcGluZ3MuZm9yRWFjaChmdW5jdGlvbiAobWFwcGluZykge1xuXHRcdGxldCBtYXBwaW5nU2VtYW50aWNPYmplY3QgPSBtYXBwaW5nLnNlbWFudGljT2JqZWN0O1xuXHRcdGNvbnN0IG1hcHBpbmdTZW1hbnRpY09iamVjdFBhdGggPSBnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdChtYXBwaW5nLnNlbWFudGljT2JqZWN0KTtcblx0XHRpZiAobWFwcGluZ1NlbWFudGljT2JqZWN0UGF0aCAmJiBvUGFyYW1zW21hcHBpbmdTZW1hbnRpY09iamVjdFBhdGhdKSB7XG5cdFx0XHRtYXBwaW5nU2VtYW50aWNPYmplY3QgPSBvUGFyYW1zW21hcHBpbmdTZW1hbnRpY09iamVjdFBhdGhdO1xuXHRcdH1cblx0XHRpZiAoc1NlbWFudGljT2JqZWN0ID09PSBtYXBwaW5nU2VtYW50aWNPYmplY3QpIHtcblx0XHRcdGNvbnN0IG9NYXBwaW5ncyA9IG1hcHBpbmcuaXRlbXM7XG5cdFx0XHRmb3IgKGNvbnN0IGkgaW4gb01hcHBpbmdzKSB7XG5cdFx0XHRcdGNvbnN0IHNMb2NhbFByb3BlcnR5ID0gb01hcHBpbmdzW2ldLmtleTtcblx0XHRcdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0UHJvcGVydHkgPSBvTWFwcGluZ3NbaV0udmFsdWU7XG5cdFx0XHRcdGlmIChzTG9jYWxQcm9wZXJ0eSAhPT0gc1NlbWFudGljT2JqZWN0UHJvcGVydHkpIHtcblx0XHRcdFx0XHRpZiAob1BhcmFtc1tzTG9jYWxQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVQYXJhbWV0ZXIoc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQucmVuYW1lUGFyYW1ldGVyKHNMb2NhbFByb3BlcnR5LCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQucmVuYW1lU2VsZWN0T3B0aW9uKHNMb2NhbFByb3BlcnR5LCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRvUGFyYW1zW3NTZW1hbnRpY09iamVjdFByb3BlcnR5XSA9IG9QYXJhbXNbc0xvY2FsUHJvcGVydHldO1xuXHRcdFx0XHRcdFx0ZGVsZXRlIG9QYXJhbXNbc0xvY2FsUHJvcGVydHldO1xuXHRcdFx0XHRcdFx0aGFzQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIFdlIHJlbW92ZSB0aGUgcGFyYW1ldGVyIGFzIHRoZXJlIGlzIG5vIHZhbHVlXG5cblx0XHRcdFx0XHQvLyBUaGUgbG9jYWwgcHJvcGVydHkgY29tZXMgZnJvbSBhIG5hdmlnYXRpb24gcHJvcGVydHlcblx0XHRcdFx0XHRlbHNlIGlmIChzTG9jYWxQcm9wZXJ0eS5zcGxpdChcIi9cIikubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0Ly8gZmluZCB0aGUgcHJvcGVydHkgdG8gYmUgcmVtb3ZlZFxuXHRcdFx0XHRcdFx0Y29uc3QgcHJvcGVydHlUb0JlUmVtb3ZlZCA9IHNMb2NhbFByb3BlcnR5LnNwbGl0KFwiL1wiKS5zbGljZSgtMSlbMF07XG5cdFx0XHRcdFx0XHQvLyBUaGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBoYXMgbm8gdmFsdWVcblx0XHRcdFx0XHRcdGlmICghb1BhcmFtc1twcm9wZXJ0eVRvQmVSZW1vdmVkXSkge1xuXHRcdFx0XHRcdFx0XHRkZWxldGUgb1BhcmFtc1twcm9wZXJ0eVRvQmVSZW1vdmVkXTtcblx0XHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbW92ZVBhcmFtZXRlcihwcm9wZXJ0eVRvQmVSZW1vdmVkKTtcblx0XHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihwcm9wZXJ0eVRvQmVSZW1vdmVkKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocHJvcGVydHlUb0JlUmVtb3ZlZCAhPT0gc1NlbWFudGljT2JqZWN0UHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gVGhlIG5hdmlnYXRpb24gcHJvcGVydHkgaGFzIGEgdmFsdWUgYW5kIHByb3BlcnRpZXMgbmFtZXMgYXJlIGRpZmZlcmVudFxuXHRcdFx0XHRcdFx0XHRtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQucmVuYW1lUGFyYW1ldGVyKHByb3BlcnR5VG9CZVJlbW92ZWQsIHNTZW1hbnRpY09iamVjdFByb3BlcnR5KTtcblx0XHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbmFtZVNlbGVjdE9wdGlvbihwcm9wZXJ0eVRvQmVSZW1vdmVkLCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRcdG9QYXJhbXNbc1NlbWFudGljT2JqZWN0UHJvcGVydHldID0gb1BhcmFtc1twcm9wZXJ0eVRvQmVSZW1vdmVkXTtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIG9QYXJhbXNbcHJvcGVydHlUb0JlUmVtb3ZlZF07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSBvUGFyYW1zW3NMb2NhbFByb3BlcnR5XTtcblx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVQYXJhbWV0ZXIoc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHsgcGFyYW1zOiBvUGFyYW1zLCBoYXNDaGFuZ2VkLCBzZWxlY3Rpb25WYXJpYW50OiBtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQgfTtcbn07XG5cbi8qKlxuICogQ2FsbCBnZXRBcHBTdGF0ZUtleUFuZFVybFBhcmFtZXRlcnMgaW4gbmF2aWdhdGlvbiBzZXJ2aWNlIGFuZCBjYWNoZSBpdHMgcmVzdWx0cy5cbiAqXG4gKiBAcGFyYW0gX3RoaXMgVGhlIGluc3RhbmNlIG9mIHF1aWNrdmlld2RlbGVnYXRlLlxuICogQHBhcmFtIG5hdmlnYXRpb25TZXJ2aWNlIFRoZSBuYXZpZ2F0aW9uIHNlcnZpY2UuXG4gKiBAcGFyYW0gc2VsZWN0aW9uVmFyaWFudCBUaGUgY3VycmVudCBzZWxlY3Rpb24gdmFyaWFudC5cbiAqIEBwYXJhbSBzZW1hbnRpY09iamVjdCBUaGUgY3VycmVudCBzZW1hbnRpY09iamVjdC5cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRBcHBTdGF0ZUtleUFuZFVybFBhcmFtZXRlcnMgPSBhc3luYyBmdW5jdGlvbiAoXG5cdF90aGlzOiB0eXBlb2YgU2ltcGxlTGlua0RlbGVnYXRlLFxuXHRuYXZpZ2F0aW9uU2VydmljZTogYW55LFxuXHRzZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50LFxuXHRzZW1hbnRpY09iamVjdDogc3RyaW5nXG4pOiBQcm9taXNlPHN0cmluZ1tdPiB7XG5cdGxldCBhVmFsdWVzID0gW107XG5cblx0Ly8gY2hlY2sgaWYgZGVmYXVsdCBjYWNoZSBjb250YWlucyBhbHJlYWR5IHRoZSB1bm1vZGlmaWVkIHNlbGVjdGlvblZhcmlhbnRcblx0aWYgKGRlZXBFcXVhbChzZWxlY3Rpb25WYXJpYW50LCBfdGhpcy5hcHBTdGF0ZUtleU1hcFtcIlwiXT8uc2VsZWN0aW9uVmFyaWFudCkpIHtcblx0XHRjb25zdCBkZWZhdWx0Q2FjaGUgPSBfdGhpcy5hcHBTdGF0ZUtleU1hcFtcIlwiXTtcblx0XHRyZXR1cm4gW2RlZmF1bHRDYWNoZS5zZW1hbnRpY0F0dHJpYnV0ZXMsIGRlZmF1bHRDYWNoZS5hcHBzdGF0ZWtleV07XG5cdH1cblx0Ly8gdXBkYXRlIHVybCBwYXJhbWV0ZXJzIGJlY2F1c2UgdGhlcmUgaXMgYSBjaGFuZ2UgaW4gc2VsZWN0aW9uIHZhcmlhbnRcblx0aWYgKFxuXHRcdF90aGlzLmFwcFN0YXRlS2V5TWFwW2Ake3NlbWFudGljT2JqZWN0fWBdID09PSB1bmRlZmluZWQgfHxcblx0XHQhZGVlcEVxdWFsKF90aGlzLmFwcFN0YXRlS2V5TWFwW2Ake3NlbWFudGljT2JqZWN0fWBdLnNlbGVjdGlvblZhcmlhbnQsIHNlbGVjdGlvblZhcmlhbnQpXG5cdCkge1xuXHRcdGFWYWx1ZXMgPSBhd2FpdCB0b0VTNlByb21pc2UobmF2aWdhdGlvblNlcnZpY2UuZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzKHNlbGVjdGlvblZhcmlhbnQudG9KU09OU3RyaW5nKCkpKTtcblx0XHRfdGhpcy5hcHBTdGF0ZUtleU1hcFtgJHtzZW1hbnRpY09iamVjdH1gXSA9IHtcblx0XHRcdHNlbWFudGljQXR0cmlidXRlczogYVZhbHVlc1swXSxcblx0XHRcdGFwcHN0YXRla2V5OiBhVmFsdWVzWzFdLFxuXHRcdFx0c2VsZWN0aW9uVmFyaWFudDogc2VsZWN0aW9uVmFyaWFudFxuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgY2FjaGUgPSBfdGhpcy5hcHBTdGF0ZUtleU1hcFtgJHtzZW1hbnRpY09iamVjdH1gXTtcblx0XHRhVmFsdWVzID0gW2NhY2hlLnNlbWFudGljQXR0cmlidXRlcywgY2FjaGUuYXBwc3RhdGVrZXldO1xuXHR9XG5cdHJldHVybiBhVmFsdWVzO1xufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRMaW5rSXRlbVdpdGhOZXdQYXJhbWV0ZXIgPSBhc3luYyBmdW5jdGlvbiAoXG5cdF90aGF0OiBhbnksXG5cdF9iVGl0bGVIYXNMaW5rOiBib29sZWFuLFxuXHRfYVRpdGxlTGluazogc3RyaW5nW10sXG5cdF9vTGlua0l0ZW06IGFueSxcblx0X29TaGVsbFNlcnZpY2VzOiBhbnksXG5cdF9vUGF5bG9hZDogYW55LFxuXHRfb1BhcmFtczogYW55LFxuXHRfc0FwcFN0YXRlS2V5OiBzdHJpbmcsXG5cdF9vU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCxcblx0X29OYXZpZ2F0aW9uU2VydmljZTogTmF2aWdhdGlvblNlcnZpY2Vcbik6IFByb21pc2U8YW55PiB7XG5cdHJldHVybiBfb1NoZWxsU2VydmljZXMuZXhwYW5kQ29tcGFjdEhhc2goX29MaW5rSXRlbS5nZXRIcmVmKCkpLnRoZW4oYXN5bmMgZnVuY3Rpb24gKHNIYXNoOiBhbnkpIHtcblx0XHRjb25zdCBvU2hlbGxIYXNoID0gX29TaGVsbFNlcnZpY2VzLnBhcnNlU2hlbGxIYXNoKHNIYXNoKTtcblx0XHRjb25zdCBwYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCBfb1BhcmFtcyk7XG5cdFx0Y29uc3Qge1xuXHRcdFx0cGFyYW1zOiBvTmV3UGFyYW1zLFxuXHRcdFx0aGFzQ2hhbmdlZCxcblx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IG5ld1NlbGVjdGlvblZhcmlhbnRcblx0XHR9ID0gU2ltcGxlTGlua0RlbGVnYXRlLl9zZXRPYmplY3RNYXBwaW5ncyhvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0LCBwYXJhbXMsIF9vUGF5bG9hZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzLCBfb1NlbGVjdGlvblZhcmlhbnQpO1xuXHRcdGlmIChoYXNDaGFuZ2VkKSB7XG5cdFx0XHRjb25zdCBhVmFsdWVzID0gYXdhaXQgU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRBcHBTdGF0ZUtleUFuZFVybFBhcmFtZXRlcnMoXG5cdFx0XHRcdF90aGF0LFxuXHRcdFx0XHRfb05hdmlnYXRpb25TZXJ2aWNlLFxuXHRcdFx0XHRuZXdTZWxlY3Rpb25WYXJpYW50LFxuXHRcdFx0XHRvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0XG5cdFx0XHQpO1xuXG5cdFx0XHRfc0FwcFN0YXRlS2V5ID0gYVZhbHVlc1sxXTtcblx0XHR9XG5cdFx0Y29uc3Qgb05ld1NoZWxsSGFzaCA9IHtcblx0XHRcdHRhcmdldDoge1xuXHRcdFx0XHRzZW1hbnRpY09iamVjdDogb1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0YWN0aW9uOiBvU2hlbGxIYXNoLmFjdGlvblxuXHRcdFx0fSxcblx0XHRcdHBhcmFtczogb05ld1BhcmFtcyxcblx0XHRcdGFwcFN0YXRlS2V5OiBfc0FwcFN0YXRlS2V5XG5cdFx0fTtcblx0XHRkZWxldGUgb05ld1NoZWxsSGFzaC5wYXJhbXNbXCJzYXAteGFwcC1zdGF0ZVwiXTtcblx0XHRfb0xpbmtJdGVtLnNldEhyZWYoYCMke19vU2hlbGxTZXJ2aWNlcy5jb25zdHJ1Y3RTaGVsbEhhc2gob05ld1NoZWxsSGFzaCl9YCk7XG5cdFx0X29QYXlsb2FkLmFTZW1hbnRpY0xpbmtzLnB1c2goX29MaW5rSXRlbS5nZXRIcmVmKCkpO1xuXHRcdC8vIFRoZSBsaW5rIGlzIHJlbW92ZWQgZnJvbSB0aGUgdGFyZ2V0IGxpc3QgYmVjYXVzZSB0aGUgdGl0bGUgbGluayBoYXMgc2FtZSB0YXJnZXQuXG5cdFx0cmV0dXJuIFNpbXBsZUxpbmtEZWxlZ2F0ZS5fUmVtb3ZlVGl0bGVMaW5rRnJvbVRhcmdldHMuYmluZChfdGhhdCkoW19vTGlua0l0ZW1dLCBfYlRpdGxlSGFzTGluaywgX2FUaXRsZUxpbmspO1xuXHR9KTtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuX3JlbW92ZUVtcHR5TGlua0l0ZW0gPSBmdW5jdGlvbiAoYUxpbmtJdGVtczogYW55KTogYW55W10ge1xuXHRyZXR1cm4gYUxpbmtJdGVtcy5maWx0ZXIoKGxpbmtJdGVtOiBhbnkpID0+IHtcblx0XHRyZXR1cm4gbGlua0l0ZW0gIT09IHVuZGVmaW5lZDtcblx0fSk7XG59O1xuLyoqXG4gKiBFbmFibGVzIHRoZSBtb2RpZmljYXRpb24gb2YgTGlua0l0ZW1zIGJlZm9yZSB0aGUgcG9wb3ZlciBvcGVucy4gVGhpcyBlbmFibGVzIGFkZGl0aW9uYWwgcGFyYW1ldGVyc1xuICogdG8gYmUgYWRkZWQgdG8gdGhlIGxpbmsuXG4gKlxuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBwYXlsb2FkIG9mIHRoZSBMaW5rIGdpdmVuIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9CaW5kaW5nQ29udGV4dCBUaGUgYmluZGluZyBjb250ZXh0IG9mIHRoZSBMaW5rXG4gKiBAcGFyYW0gYUxpbmtJdGVtcyBUaGUgTGlua0l0ZW1zIG9mIHRoZSBMaW5rIHRoYXQgY2FuIGJlIG1vZGlmaWVkXG4gKiBAcmV0dXJucyBPbmNlIHJlc29sdmVkIGFuIGFycmF5IG9mIHtAbGluayBzYXAudWkubWRjLmxpbmsuTGlua0l0ZW19IGlzIHJldHVybmVkXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5tb2RpZnlMaW5rSXRlbXMgPSBhc3luYyBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSwgb0JpbmRpbmdDb250ZXh0OiBDb250ZXh0LCBhTGlua0l0ZW1zOiBhbnkpIHtcblx0aWYgKGFMaW5rSXRlbXMubGVuZ3RoICE9PSAwKSB7XG5cdFx0dGhpcy5wYXlsb2FkID0gb1BheWxvYWQ7XG5cdFx0Y29uc3Qgb0xpbmsgPSBhTGlua0l0ZW1zWzBdLmdldFBhcmVudCgpO1xuXHRcdGNvbnN0IG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvTGluayk7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvVmlldyk7XG5cdFx0Y29uc3QgcHJpbWFyeUFjdGlvbklzQWN0aXZlID0gKGF3YWl0IEZpZWxkSGVscGVyLmNoZWNrUHJpbWFyeUFjdGlvbnMob1BheWxvYWQsIHRydWUsIG9BcHBDb21wb25lbnQpKSBhcyBhbnk7XG5cdFx0Y29uc3QgYVRpdGxlTGluayA9IHByaW1hcnlBY3Rpb25Jc0FjdGl2ZS50aXRsZUxpbms7XG5cdFx0Y29uc3QgYlRpdGxlSGFzTGluazogYm9vbGVhbiA9IHByaW1hcnlBY3Rpb25Jc0FjdGl2ZS5oYXNUaXRsZUxpbms7XG5cdFx0Y29uc3Qgb1NoZWxsU2VydmljZXMgPSBvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKTtcblx0XHRpZiAoIW9TaGVsbFNlcnZpY2VzLmhhc1VTaGVsbCgpKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJRdWlja1ZpZXdEZWxlZ2F0ZTogQ2Fubm90IHJldHJpZXZlIHRoZSBzaGVsbCBzZXJ2aWNlc1wiKTtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuXHRcdH1cblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1ZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRsZXQgbUxpbmVDb250ZXh0ID0gb0xpbmsuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRjb25zdCBvVGFyZ2V0SW5mbzogYW55ID0ge1xuXHRcdFx0c2VtYW50aWNPYmplY3Q6IG9QYXlsb2FkLm1haW5TZW1hbnRpY09iamVjdCxcblx0XHRcdGFjdGlvbjogXCJcIlxuXHRcdH07XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgYU5ld0xpbmtDdXN0b21EYXRhID1cblx0XHRcdFx0b0xpbmsgJiZcblx0XHRcdFx0dGhpcy5fZmV0Y2hMaW5rQ3VzdG9tRGF0YShvTGluaykubWFwKGZ1bmN0aW9uIChsaW5rSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGxpbmtJdGVtLm1Qcm9wZXJ0aWVzLnZhbHVlO1xuXHRcdFx0XHR9KTtcblx0XHRcdC8vIGNoZWNrIGlmIGFsbCBsaW5rIGl0ZW1zIGluIHRoaXMuYUxpbmtDdXN0b21EYXRhIGFyZSBhbHNvIHByZXNlbnQgaW4gYU5ld0xpbmtDdXN0b21EYXRhXG5cdFx0XHRpZiAoU2ltcGxlTGlua0RlbGVnYXRlLl9Jc1NlbWFudGljT2JqZWN0RHluYW1pYyhhTmV3TGlua0N1c3RvbURhdGEsIHRoaXMpKSB7XG5cdFx0XHRcdC8vIGlmIHRoZSBjdXN0b21EYXRhIGNoYW5nZWQgdGhlcmUgYXJlIGRpZmZlcmVudCBMaW5rSXRlbXMgdG8gZGlzcGxheVxuXHRcdFx0XHRjb25zdCBvU2VtYW50aWNBdHRyaWJ1dGVzUmVzb2x2ZWQgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2NhbGN1bGF0ZVNlbWFudGljQXR0cmlidXRlcyhcblx0XHRcdFx0XHRvQmluZGluZ0NvbnRleHQuZ2V0T2JqZWN0KCksXG5cdFx0XHRcdFx0b1BheWxvYWQsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHRoaXMuX2xpbmtcblx0XHRcdFx0KTtcblx0XHRcdFx0Y29uc3Qgb1NlbWFudGljQXR0cmlidXRlcyA9IG9TZW1hbnRpY0F0dHJpYnV0ZXNSZXNvbHZlZC5yZXN1bHRzO1xuXHRcdFx0XHRjb25zdCBvUGF5bG9hZFJlc29sdmVkID0gb1NlbWFudGljQXR0cmlidXRlc1Jlc29sdmVkLnBheWxvYWQ7XG5cdFx0XHRcdGFMaW5rSXRlbXMgPSBhd2FpdCBTaW1wbGVMaW5rRGVsZWdhdGUuX3JldHJpZXZlTmF2aWdhdGlvblRhcmdldHMoXG5cdFx0XHRcdFx0XCJcIixcblx0XHRcdFx0XHRvU2VtYW50aWNBdHRyaWJ1dGVzLFxuXHRcdFx0XHRcdG9QYXlsb2FkUmVzb2x2ZWQsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHRoaXMuX2xpbmtcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IG9OYXZpZ2F0aW9uU2VydmljZSA9IG9BcHBDb21wb25lbnQuZ2V0TmF2aWdhdGlvblNlcnZpY2UoKTtcblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyO1xuXHRcdFx0bGV0IG9TZWxlY3Rpb25WYXJpYW50O1xuXHRcdFx0bGV0IG1MaW5lQ29udGV4dERhdGE7XG5cdFx0XHRtTGluZUNvbnRleHQgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldExpbmVDb250ZXh0KG9WaWV3LCBtTGluZUNvbnRleHQpO1xuXHRcdFx0Y29uc3Qgc01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChtTGluZUNvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdG1MaW5lQ29udGV4dERhdGEgPSBvQ29udHJvbGxlci5faW50ZW50QmFzZWROYXZpZ2F0aW9uLnJlbW92ZVNlbnNpdGl2ZURhdGEobUxpbmVDb250ZXh0LmdldE9iamVjdCgpLCBzTWV0YVBhdGgpO1xuXHRcdFx0bUxpbmVDb250ZXh0RGF0YSA9IG9Db250cm9sbGVyLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ucHJlcGFyZUNvbnRleHRGb3JFeHRlcm5hbE5hdmlnYXRpb24obUxpbmVDb250ZXh0RGF0YSwgbUxpbmVDb250ZXh0KTtcblx0XHRcdG9TZWxlY3Rpb25WYXJpYW50ID0gb05hdmlnYXRpb25TZXJ2aWNlLm1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50KG1MaW5lQ29udGV4dERhdGEuc2VtYW50aWNBdHRyaWJ1dGVzLCB7fSk7XG5cdFx0XHRvVGFyZ2V0SW5mby5wcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0ID0gbUxpbmVDb250ZXh0RGF0YS5wcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0O1xuXHRcdFx0Ly9UTyBtb2RpZnkgdGhlIHNlbGVjdGlvbiB2YXJpYW50IGZyb20gdGhlIEV4dGVuc2lvbiBBUElcblx0XHRcdG9Db250cm9sbGVyLmludGVudEJhc2VkTmF2aWdhdGlvbi5hZGFwdE5hdmlnYXRpb25Db250ZXh0KG9TZWxlY3Rpb25WYXJpYW50LCBvVGFyZ2V0SW5mbyk7XG5cdFx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX3JlbW92ZVRlY2huaWNhbFBhcmFtZXRlcnMob1NlbGVjdGlvblZhcmlhbnQpO1xuXHRcdFx0b1NlbGVjdGlvblZhcmlhbnQgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX3NldEZpbHRlckNvbnRleHRVcmxGb3JTZWxlY3Rpb25WYXJpYW50KG9WaWV3LCBvU2VsZWN0aW9uVmFyaWFudCwgb05hdmlnYXRpb25TZXJ2aWNlKTtcblx0XHRcdGNvbnN0IGFWYWx1ZXMgPSBhd2FpdCBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyh0aGlzLCBvTmF2aWdhdGlvblNlcnZpY2UsIG9TZWxlY3Rpb25WYXJpYW50LCBcIlwiKTtcblx0XHRcdGNvbnN0IG9QYXJhbXMgPSBhVmFsdWVzWzBdO1xuXHRcdFx0Y29uc3QgYXBwU3RhdGVLZXkgPSBhVmFsdWVzWzFdO1xuXHRcdFx0bGV0IHRpdGxlTGlua3RvQmVSZW1vdmU6IGFueTtcblx0XHRcdG9QYXlsb2FkLmFTZW1hbnRpY0xpbmtzID0gW107XG5cdFx0XHRhTGlua0l0ZW1zID0gU2ltcGxlTGlua0RlbGVnYXRlLl9yZW1vdmVFbXB0eUxpbmtJdGVtKGFMaW5rSXRlbXMpO1xuXHRcdFx0Zm9yIChjb25zdCBpbmRleCBpbiBhTGlua0l0ZW1zKSB7XG5cdFx0XHRcdHRpdGxlTGlua3RvQmVSZW1vdmUgPSBhd2FpdCBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldExpbmtJdGVtV2l0aE5ld1BhcmFtZXRlcihcblx0XHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRcdGJUaXRsZUhhc0xpbmssXG5cdFx0XHRcdFx0YVRpdGxlTGluayxcblx0XHRcdFx0XHRhTGlua0l0ZW1zW2luZGV4XSxcblx0XHRcdFx0XHRvU2hlbGxTZXJ2aWNlcyxcblx0XHRcdFx0XHRvUGF5bG9hZCxcblx0XHRcdFx0XHRvUGFyYW1zLFxuXHRcdFx0XHRcdGFwcFN0YXRlS2V5LFxuXHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LFxuXHRcdFx0XHRcdG9OYXZpZ2F0aW9uU2VydmljZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHQvLyBEbyBub3QgcmVtb3ZlIHRoZSBsaW5rIGlmIHRoZXJlIGlzIG9ubHkgb25lIGRpcmVjdCB0YXJnZXQgYXBwbGljYXRpb25cblx0XHRcdFx0aWYgKHRpdGxlTGlua3RvQmVSZW1vdmUgPT09IHRydWUgJiYgYUxpbmtJdGVtcy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0YUxpbmtJdGVtc1tpbmRleF0gPSB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBTaW1wbGVMaW5rRGVsZWdhdGUuX3JlbW92ZUVtcHR5TGlua0l0ZW0oYUxpbmtJdGVtcyk7XG5cdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGdldHRpbmcgdGhlIG5hdmlnYXRpb24gc2VydmljZVwiLCBvRXJyb3IpO1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGFMaW5rSXRlbXM7XG5cdH1cbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuYmVmb3JlTmF2aWdhdGlvbkNhbGxiYWNrID0gZnVuY3Rpb24gKG9QYXlsb2FkOiBhbnksIG9FdmVudDogYW55KSB7XG5cdGNvbnN0IG9Tb3VyY2UgPSBvRXZlbnQuZ2V0U291cmNlKCksXG5cdFx0c0hyZWYgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiaHJlZlwiKSxcblx0XHRvVVJMUGFyc2luZyA9IEZhY3RvcnkuZ2V0U2VydmljZShcIlVSTFBhcnNpbmdcIiksXG5cdFx0b0hhc2ggPSBzSHJlZiAmJiBvVVJMUGFyc2luZy5wYXJzZVNoZWxsSGFzaChzSHJlZik7XG5cblx0S2VlcEFsaXZlSGVscGVyLnN0b3JlQ29udHJvbFJlZnJlc2hTdHJhdGVneUZvckhhc2gob1NvdXJjZSwgb0hhc2gpO1xuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLl9yZW1vdmVUZWNobmljYWxQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKG9TZWxlY3Rpb25WYXJpYW50OiBhbnkpIHtcblx0b1NlbGVjdGlvblZhcmlhbnQucmVtb3ZlU2VsZWN0T3B0aW9uKFwiQG9kYXRhLmNvbnRleHRcIik7XG5cdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihcIkBvZGF0YS5tZXRhZGF0YUV0YWdcIik7XG5cdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihcIlNBUF9fTWVzc2FnZXNcIik7XG59O1xuXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0Q3VzdG9tRGF0YVZhbHVlID0gZnVuY3Rpb24gKGFMaW5rQ3VzdG9tRGF0YTogYW55LCBvU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IGFueSk6IHZvaWQge1xuXHRsZXQgc1Byb3BlcnR5TmFtZTogc3RyaW5nLCBzQ3VzdG9tRGF0YVZhbHVlOiBzdHJpbmc7XG5cdGZvciAobGV0IGlDdXN0b21EYXRhQ291bnQgPSAwOyBpQ3VzdG9tRGF0YUNvdW50IDwgYUxpbmtDdXN0b21EYXRhLmxlbmd0aDsgaUN1c3RvbURhdGFDb3VudCsrKSB7XG5cdFx0c1Byb3BlcnR5TmFtZSA9IGFMaW5rQ3VzdG9tRGF0YVtpQ3VzdG9tRGF0YUNvdW50XS5nZXRLZXkoKTtcblx0XHRzQ3VzdG9tRGF0YVZhbHVlID0gYUxpbmtDdXN0b21EYXRhW2lDdXN0b21EYXRhQ291bnRdLmdldFZhbHVlKCk7XG5cdFx0b1NlbWFudGljT2JqZWN0c1Jlc29sdmVkW3NQcm9wZXJ0eU5hbWVdID0geyB2YWx1ZTogc0N1c3RvbURhdGFWYWx1ZSB9O1xuXHR9XG59O1xuXG4vKipcbiAqIENoZWNrIHRoZSBzZW1hbnRpYyBvYmplY3QgbmFtZSBpZiBpdCBpcyBkeW5hbWljIG9yIG5vdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHBhdGhPclZhbHVlIFRoZSBzZW1hbnRpYyBvYmplY3QgcGF0aCBvciBuYW1lXG4gKiBAcmV0dXJucyBUcnVlIGlmIHNlbWFudGljIG9iamVjdCBpcyBkeW5hbWljXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5faXNEeW5hbWljUGF0aCA9IGZ1bmN0aW9uIChwYXRoT3JWYWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdGlmIChwYXRoT3JWYWx1ZSAmJiBwYXRoT3JWYWx1ZS5pbmRleE9mKFwie1wiKSA9PT0gMCAmJiBwYXRoT3JWYWx1ZS5pbmRleE9mKFwifVwiKSA9PT0gcGF0aE9yVmFsdWUubGVuZ3RoIC0gMSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIHBheWxvYWQgd2l0aCBzZW1hbnRpYyBvYmplY3QgdmFsdWVzIGZyb20gY3VzdG9tIGRhdGEgb2YgTGluay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHBheWxvYWQgVGhlIHBheWxvYWQgb2YgdGhlIG1kYyBsaW5rLlxuICogQHBhcmFtIG5ld1BheWxvYWQgVGhlIG5ldyB1cGRhdGVkIHBheWxvYWQuXG4gKiBAcGFyYW0gc2VtYW50aWNPYmplY3ROYW1lIFRoZSBzZW1hbnRpYyBvYmplY3QgbmFtZSByZXNvbHZlZC5cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVQYXlsb2FkV2l0aFJlc29sdmVkU2VtYW50aWNPYmplY3RWYWx1ZSA9IGZ1bmN0aW9uIChcblx0cGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWQsXG5cdG5ld1BheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkLFxuXHRzZW1hbnRpY09iamVjdE5hbWU6IHN0cmluZ1xuKTogdm9pZCB7XG5cdGlmIChTaW1wbGVMaW5rRGVsZWdhdGUuX2lzRHluYW1pY1BhdGgocGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3QpKSB7XG5cdFx0aWYgKHNlbWFudGljT2JqZWN0TmFtZSkge1xuXHRcdFx0bmV3UGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3QgPSBzZW1hbnRpY09iamVjdE5hbWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIG5vIHZhbHVlIGZyb20gQ3VzdG9tIERhdGEsIHNvIHJlbW92aW5nIG1haW5TZW1hbnRpY09iamVjdFxuXHRcdFx0bmV3UGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3QgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cdHN3aXRjaCAodHlwZW9mIHNlbWFudGljT2JqZWN0TmFtZSkge1xuXHRcdGNhc2UgXCJzdHJpbmdcIjpcblx0XHRcdG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ/LnB1c2goc2VtYW50aWNPYmplY3ROYW1lKTtcblx0XHRcdG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzLnB1c2goc2VtYW50aWNPYmplY3ROYW1lKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJvYmplY3RcIjpcblx0XHRcdGZvciAoY29uc3QgaiBpbiBzZW1hbnRpY09iamVjdE5hbWUgYXMgc3RyaW5nW10pIHtcblx0XHRcdFx0bmV3UGF5bG9hZC5zZW1hbnRpY09iamVjdHNSZXNvbHZlZD8ucHVzaChzZW1hbnRpY09iamVjdE5hbWVbal0pO1xuXHRcdFx0XHRuZXdQYXlsb2FkLnNlbWFudGljT2JqZWN0cy5wdXNoKHNlbWFudGljT2JqZWN0TmFtZVtqXSk7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHR9XG59O1xuXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2NyZWF0ZU5ld1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkID0gZnVuY3Rpb24gKFxuXHRwYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZCxcblx0c2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IGFueSxcblx0bmV3UGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWRcbik6IHZvaWQge1xuXHRsZXQgc2VtYW50aWNPYmplY3ROYW1lOiBzdHJpbmcsIHRtcFByb3BlcnR5TmFtZTogc3RyaW5nO1xuXHRmb3IgKGNvbnN0IGkgaW4gcGF5bG9hZC5zZW1hbnRpY09iamVjdHMpIHtcblx0XHRzZW1hbnRpY09iamVjdE5hbWUgPSBwYXlsb2FkLnNlbWFudGljT2JqZWN0c1tpXTtcblx0XHRpZiAoU2ltcGxlTGlua0RlbGVnYXRlLl9pc0R5bmFtaWNQYXRoKHNlbWFudGljT2JqZWN0TmFtZSkpIHtcblx0XHRcdHRtcFByb3BlcnR5TmFtZSA9IHNlbWFudGljT2JqZWN0TmFtZS5zdWJzdHIoMSwgc2VtYW50aWNPYmplY3ROYW1lLmluZGV4T2YoXCJ9XCIpIC0gMSk7XG5cdFx0XHRzZW1hbnRpY09iamVjdE5hbWUgPSBzZW1hbnRpY09iamVjdHNSZXNvbHZlZFt0bXBQcm9wZXJ0eU5hbWVdLnZhbHVlO1xuXHRcdFx0U2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVQYXlsb2FkV2l0aFJlc29sdmVkU2VtYW50aWNPYmplY3RWYWx1ZShwYXlsb2FkLCBuZXdQYXlsb2FkLCBzZW1hbnRpY09iamVjdE5hbWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRuZXdQYXlsb2FkLnNlbWFudGljT2JqZWN0cy5wdXNoKHNlbWFudGljT2JqZWN0TmFtZSk7XG5cdFx0fVxuXHR9XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgc2VtYW50aWMgb2JqZWN0IG5hbWUgZnJvbSB0aGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZSBtYXBwaW5ncyBhdHRyaWJ1dGVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gbWRjUGF5bG9hZCBUaGUgcGF5bG9hZCBnaXZlbiBieSB0aGUgYXBwbGljYXRpb24uXG4gKiBAcGFyYW0gbWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgVGhlIHBheWxvYWQgd2l0aCB0aGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZSBzZW1hbnRpYyBvYmplY3QgbmFtZS5cbiAqIEBwYXJhbSBuZXdQYXlsb2FkIFRoZSBuZXcgdXBkYXRlZCBwYXlsb2FkLlxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVNlbWFudGljT2JqZWN0c0Zvck1hcHBpbmdzID0gZnVuY3Rpb24gKFxuXHRtZGNQYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZCxcblx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IFJlZ2lzdGVyZWRQYXlsb2FkLFxuXHRuZXdQYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZFxuKTogdm9pZCB7XG5cdC8vIHVwZGF0ZSB0aGUgc2VtYW50aWMgb2JqZWN0IG5hbWUgZnJvbSB0aGUgcmVzb2x2ZWQgb25lcyBpbiB0aGUgc2VtYW50aWMgb2JqZWN0IG1hcHBpbmdzLlxuXHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzLmZvckVhY2goZnVuY3Rpb24gKFxuXHRcdHNlbWFudGljT2JqZWN0TWFwcGluZzogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZ1xuXHQpIHtcblx0XHRpZiAoc2VtYW50aWNPYmplY3RNYXBwaW5nLnNlbWFudGljT2JqZWN0ICYmIFNpbXBsZUxpbmtEZWxlZ2F0ZS5faXNEeW5hbWljUGF0aChzZW1hbnRpY09iamVjdE1hcHBpbmcuc2VtYW50aWNPYmplY3QpKSB7XG5cdFx0XHRzZW1hbnRpY09iamVjdE1hcHBpbmcuc2VtYW50aWNPYmplY3QgPVxuXHRcdFx0XHRuZXdQYXlsb2FkLnNlbWFudGljT2JqZWN0c1ttZGNQYXlsb2FkLnNlbWFudGljT2JqZWN0cy5pbmRleE9mKHNlbWFudGljT2JqZWN0TWFwcGluZy5zZW1hbnRpY09iamVjdCldO1xuXHRcdH1cblx0fSk7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgc2VtYW50aWMgb2JqZWN0IG5hbWUgZnJvbSB0aGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZSB1bmF2YWlsYWJsZSBhY3Rpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gbWRjUGF5bG9hZCBUaGUgcGF5bG9hZCBnaXZlbiBieSB0aGUgYXBwbGljYXRpb24uXG4gKiBAcGFyYW0gbWRjUGF5bG9hZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIFRoZSB1bmF2YWlsYWJsZSBhY3Rpb25zIGdpdmVuIGJ5IHRoZSBhcHBsaWNhdGlvbi5cbiAqIEBwYXJhbSBtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCBUaGUgdXBkYXRlZCBwYXlsb2FkIHdpdGggdGhlIHJlc29sdmVkIHZhbHVlIGZvciB0aGUgc2VtYW50aWMgb2JqZWN0IG5hbWUgZm9yIHRoZSB1bmF2YWlsYWJsZSBhY3Rpb25zLlxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVNlbWFudGljT2JqZWN0c1VuYXZhaWxhYmxlQWN0aW9ucyA9IGZ1bmN0aW9uIChcblx0bWRjUGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWQsXG5cdG1kY1BheWxvYWRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLFxuXHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZDogUmVnaXN0ZXJlZFBheWxvYWRcbik6IHZvaWQge1xuXHRsZXQgX0luZGV4OiBhbnk7XG5cdG1kY1BheWxvYWRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uOiBhbnkpIHtcblx0XHQvLyBEeW5hbWljIFNlbWFudGljT2JqZWN0IGhhcyBhbiB1bmF2YWlsYWJsZSBhY3Rpb25cblx0XHRpZiAoXG5cdFx0XHRzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uPy5zZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0U2ltcGxlTGlua0RlbGVnYXRlLl9pc0R5bmFtaWNQYXRoKHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24uc2VtYW50aWNPYmplY3QpXG5cdFx0KSB7XG5cdFx0XHRfSW5kZXggPSBtZGNQYXlsb2FkLnNlbWFudGljT2JqZWN0cy5maW5kSW5kZXgoZnVuY3Rpb24gKHNlbWFudGljT2JqZWN0OiBzdHJpbmcpIHtcblx0XHRcdFx0cmV0dXJuIHNlbWFudGljT2JqZWN0ID09PSBzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uLnNlbWFudGljT2JqZWN0O1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoX0luZGV4ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Ly8gR2V0IHRoZSBTZW1hbnRpY09iamVjdCBuYW1lIHJlc29sdmVkIHRvIGEgdmFsdWVcblx0XHRcdFx0c2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbi5zZW1hbnRpY09iamVjdCA9IG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0c1tfSW5kZXhdO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgc2VtYW50aWMgb2JqZWN0IG5hbWUgZnJvbSB0aGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZSB1bmF2YWlsYWJsZSBhY3Rpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gbWRjUGF5bG9hZCBUaGUgdXBkYXRlZCBwYXlsb2FkIHdpdGggdGhlIGluZm9ybWF0aW9uIGZyb20gY3VzdG9tIGRhdGEgcHJvdmlkZWQgaW4gdGhlIGxpbmsuXG4gKiBAcGFyYW0gbWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgVGhlIHBheWxvYWQgdXBkYXRlZCB3aXRoIHJlc29sdmVkIHNlbWFudGljIG9iamVjdHMgbmFtZXMuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fdXBkYXRlU2VtYW50aWNPYmplY3RzV2l0aFJlc29sdmVkVmFsdWUgPSBmdW5jdGlvbiAoXG5cdG1kY1BheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkLFxuXHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZDogUmVnaXN0ZXJlZFBheWxvYWRcbik6IHZvaWQge1xuXHRmb3IgKGxldCBuZXdTZW1hbnRpY09iamVjdHNDb3VudCA9IDA7IG5ld1NlbWFudGljT2JqZWN0c0NvdW50IDwgbWRjUGF5bG9hZC5zZW1hbnRpY09iamVjdHMubGVuZ3RoOyBuZXdTZW1hbnRpY09iamVjdHNDb3VudCsrKSB7XG5cdFx0aWYgKFxuXHRcdFx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQubWFpblNlbWFudGljT2JqZWN0ID09PVxuXHRcdFx0KG1kY1BheWxvYWQuc2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgJiYgbWRjUGF5bG9hZC5zZW1hbnRpY09iamVjdHNSZXNvbHZlZFtuZXdTZW1hbnRpY09iamVjdHNDb3VudF0pXG5cdFx0KSB7XG5cdFx0XHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5tYWluU2VtYW50aWNPYmplY3QgPSBtZGNQYXlsb2FkLnNlbWFudGljT2JqZWN0c1tuZXdTZW1hbnRpY09iamVjdHNDb3VudF07XG5cdFx0fVxuXHRcdGlmIChtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdHNbbmV3U2VtYW50aWNPYmplY3RzQ291bnRdKSB7XG5cdFx0XHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdHNbbmV3U2VtYW50aWNPYmplY3RzQ291bnRdID1cblx0XHRcdFx0bWRjUGF5bG9hZC5zZW1hbnRpY09iamVjdHNbbmV3U2VtYW50aWNPYmplY3RzQ291bnRdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBubyBDdXN0b20gRGF0YSB2YWx1ZSBmb3IgYSBTZW1hbnRpYyBPYmplY3QgbmFtZSB3aXRoIHBhdGhcblx0XHRcdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0cy5zcGxpY2UobmV3U2VtYW50aWNPYmplY3RzQ291bnQsIDEpO1xuXHRcdH1cblx0fVxufTtcblxuLyoqXG4gKiBSZW1vdmUgZW1wdHkgc2VtYW50aWMgb2JqZWN0IG1hcHBpbmdzIGFuZCBpZiB0aGVyZSBpcyBubyBzZW1hbnRpYyBvYmplY3QgbmFtZSwgbGluayB0byBpdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIFRoZSBwYXlsb2FkIHVzZWQgdG8gY2hlY2sgdGhlIG1hcHBpbmdzIG9mIHRoZSBzZW1hbnRpYyBvYmplY3RzLlxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3JlbW92ZUVtcHR5U2VtYW50aWNPYmplY3RzTWFwcGluZ3MgPSBmdW5jdGlvbiAobWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IFJlZ2lzdGVyZWRQYXlsb2FkKTogdm9pZCB7XG5cdC8vIHJlbW92ZSB1bmRlZmluZWQgU2VtYW50aWMgT2JqZWN0IE1hcHBpbmdcblx0Zm9yIChcblx0XHRsZXQgbWFwcGluZ3NDb3VudCA9IDA7XG5cdFx0bWFwcGluZ3NDb3VudCA8IG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0TWFwcGluZ3MubGVuZ3RoO1xuXHRcdG1hcHBpbmdzQ291bnQrK1xuXHQpIHtcblx0XHRpZiAoXG5cdFx0XHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzW21hcHBpbmdzQ291bnRdICYmXG5cdFx0XHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzW21hcHBpbmdzQ291bnRdLnNlbWFudGljT2JqZWN0ID09PSB1bmRlZmluZWRcblx0XHQpIHtcblx0XHRcdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0TWFwcGluZ3Muc3BsaWNlKG1hcHBpbmdzQ291bnQsIDEpO1xuXHRcdH1cblx0fVxufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl9zZXRQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCA9IGZ1bmN0aW9uIChcblx0cGF5bG9hZDogYW55LFxuXHRuZXdQYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZFxuKTogUmVnaXN0ZXJlZFBheWxvYWQge1xuXHRsZXQgb1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBSZWdpc3RlcmVkUGF5bG9hZDtcblx0aWYgKG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgJiYgbmV3UGF5bG9hZC5zZW1hbnRpY09iamVjdHNSZXNvbHZlZC5sZW5ndGggPiAwKSB7XG5cdFx0b1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkID0ge1xuXHRcdFx0ZW50aXR5VHlwZTogcGF5bG9hZC5lbnRpdHlUeXBlLFxuXHRcdFx0ZGF0YUZpZWxkOiBwYXlsb2FkLmRhdGFGaWVsZCxcblx0XHRcdGNvbnRhY3Q6IHBheWxvYWQuY29udGFjdCxcblx0XHRcdG1haW5TZW1hbnRpY09iamVjdDogcGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3QsXG5cdFx0XHRuYXZpZ2F0aW9uUGF0aDogcGF5bG9hZC5uYXZpZ2F0aW9uUGF0aCxcblx0XHRcdHByb3BlcnR5UGF0aExhYmVsOiBwYXlsb2FkLnByb3BlcnR5UGF0aExhYmVsLFxuXHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nczogZGVlcENsb25lKHBheWxvYWQuc2VtYW50aWNPYmplY3RNYXBwaW5ncyksXG5cdFx0XHRzZW1hbnRpY09iamVjdHM6IG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzXG5cdFx0fTtcblx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVNlbWFudGljT2JqZWN0c0Zvck1hcHBpbmdzKHBheWxvYWQsIG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCwgbmV3UGF5bG9hZCk7XG5cdFx0Y29uc3QgX1NlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBSZWdpc3RlcmVkU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPSBkZWVwQ2xvbmUoXG5cdFx0XHRwYXlsb2FkLnNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zXG5cdFx0KTtcblx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVNlbWFudGljT2JqZWN0c1VuYXZhaWxhYmxlQWN0aW9ucyhcblx0XHRcdHBheWxvYWQsXG5cdFx0XHRfU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMsXG5cdFx0XHRvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWRcblx0XHQpO1xuXHRcdG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA9IF9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucztcblx0XHRpZiAobmV3UGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3QpIHtcblx0XHRcdG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5tYWluU2VtYW50aWNPYmplY3QgPSBuZXdQYXlsb2FkLm1haW5TZW1hbnRpY09iamVjdDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLm1haW5TZW1hbnRpY09iamVjdCA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0U2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVTZW1hbnRpY09iamVjdHNXaXRoUmVzb2x2ZWRWYWx1ZShuZXdQYXlsb2FkLCBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQpO1xuXHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fcmVtb3ZlRW1wdHlTZW1hbnRpY09iamVjdHNNYXBwaW5ncyhvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQpO1xuXHRcdHJldHVybiBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHt9IGFzIGFueTtcblx0fVxufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCA9IGZ1bmN0aW9uIChwYXlsb2FkOiBhbnksIGxpbmtDdXN0b21EYXRhOiBhbnkpOiBhbnkge1xuXHRsZXQgb1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBhbnk7XG5cdGNvbnN0IG9TZW1hbnRpY09iamVjdHNSZXNvbHZlZDogYW55ID0ge307XG5cdGNvbnN0IG5ld1BheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkID0geyBzZW1hbnRpY09iamVjdHM6IFtdLCBzZW1hbnRpY09iamVjdHNSZXNvbHZlZDogW10sIHNlbWFudGljT2JqZWN0TWFwcGluZ3M6IFtdIH07XG5cdGlmIChwYXlsb2FkLnNlbWFudGljT2JqZWN0cykge1xuXHRcdC8vIHNhcC5tLkxpbmsgaGFzIGN1c3RvbSBkYXRhIHdpdGggU2VtYW50aWMgT2JqZWN0cyBuYW1lcyByZXNvbHZlZFxuXHRcdGlmIChsaW5rQ3VzdG9tRGF0YSAmJiBsaW5rQ3VzdG9tRGF0YS5sZW5ndGggPiAwKSB7XG5cdFx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0Q3VzdG9tRGF0YVZhbHVlKGxpbmtDdXN0b21EYXRhLCBvU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQpO1xuXHRcdFx0U2ltcGxlTGlua0RlbGVnYXRlLl9jcmVhdGVOZXdQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZChwYXlsb2FkLCBvU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQsIG5ld1BheWxvYWQpO1xuXHRcdFx0b1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkID0gU2ltcGxlTGlua0RlbGVnYXRlLl9zZXRQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZChcblx0XHRcdFx0cGF5bG9hZCxcblx0XHRcdFx0bmV3UGF5bG9hZFxuXHRcdFx0KTtcblx0XHRcdHJldHVybiBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG5cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fdXBkYXRlUGF5bG9hZFdpdGhTZW1hbnRpY0F0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoXG5cdGFTZW1hbnRpY09iamVjdHM6IGFueSxcblx0b0luZm9Mb2c6IGFueSxcblx0b0NvbnRleHRPYmplY3Q6IGFueSxcblx0b1Jlc3VsdHM6IGFueSxcblx0bVNlbWFudGljT2JqZWN0TWFwcGluZ3M6IGFueVxuKTogdm9pZCB7XG5cdGFTZW1hbnRpY09iamVjdHMuZm9yRWFjaChmdW5jdGlvbiAoc1NlbWFudGljT2JqZWN0OiBhbnkpIHtcblx0XHRpZiAob0luZm9Mb2cpIHtcblx0XHRcdG9JbmZvTG9nLmFkZENvbnRleHRPYmplY3Qoc1NlbWFudGljT2JqZWN0LCBvQ29udGV4dE9iamVjdCk7XG5cdFx0fVxuXHRcdG9SZXN1bHRzW3NTZW1hbnRpY09iamVjdF0gPSB7fTtcblx0XHRmb3IgKGNvbnN0IHNBdHRyaWJ1dGVOYW1lIGluIG9Db250ZXh0T2JqZWN0KSB7XG5cdFx0XHRsZXQgb0F0dHJpYnV0ZSA9IG51bGwsXG5cdFx0XHRcdG9UcmFuc2Zvcm1hdGlvbkFkZGl0aW9uYWwgPSBudWxsO1xuXHRcdFx0aWYgKG9JbmZvTG9nKSB7XG5cdFx0XHRcdG9BdHRyaWJ1dGUgPSBvSW5mb0xvZy5nZXRTZW1hbnRpY09iamVjdEF0dHJpYnV0ZShzU2VtYW50aWNPYmplY3QsIHNBdHRyaWJ1dGVOYW1lKTtcblx0XHRcdFx0aWYgKCFvQXR0cmlidXRlKSB7XG5cdFx0XHRcdFx0b0F0dHJpYnV0ZSA9IG9JbmZvTG9nLmNyZWF0ZUF0dHJpYnV0ZVN0cnVjdHVyZSgpO1xuXHRcdFx0XHRcdG9JbmZvTG9nLmFkZFNlbWFudGljT2JqZWN0QXR0cmlidXRlKHNTZW1hbnRpY09iamVjdCwgc0F0dHJpYnV0ZU5hbWUsIG9BdHRyaWJ1dGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBJZ25vcmUgdW5kZWZpbmVkIGFuZCBudWxsIHZhbHVlc1xuXHRcdFx0aWYgKG9Db250ZXh0T2JqZWN0W3NBdHRyaWJ1dGVOYW1lXSA9PT0gdW5kZWZpbmVkIHx8IG9Db250ZXh0T2JqZWN0W3NBdHRyaWJ1dGVOYW1lXSA9PT0gbnVsbCkge1xuXHRcdFx0XHRpZiAob0F0dHJpYnV0ZSkge1xuXHRcdFx0XHRcdG9BdHRyaWJ1dGUudHJhbnNmb3JtYXRpb25zLnB1c2goe1xuXHRcdFx0XHRcdFx0dmFsdWU6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBcIlxcdTIxMzkgVW5kZWZpbmVkIGFuZCBudWxsIHZhbHVlcyBoYXZlIGJlZW4gcmVtb3ZlZCBpbiBTaW1wbGVMaW5rRGVsZWdhdGUuXCJcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdC8vIElnbm9yZSBwbGFpbiBvYmplY3RzIChCQ1AgMTc3MDQ5NjYzOSlcblx0XHRcdGlmIChpc1BsYWluT2JqZWN0KG9Db250ZXh0T2JqZWN0W3NBdHRyaWJ1dGVOYW1lXSkpIHtcblx0XHRcdFx0aWYgKG1TZW1hbnRpY09iamVjdE1hcHBpbmdzICYmIG1TZW1hbnRpY09iamVjdE1hcHBpbmdzW3NTZW1hbnRpY09iamVjdF0pIHtcblx0XHRcdFx0XHRjb25zdCBhS2V5cyA9IE9iamVjdC5rZXlzKG1TZW1hbnRpY09iamVjdE1hcHBpbmdzW3NTZW1hbnRpY09iamVjdF0pO1xuXHRcdFx0XHRcdGxldCBzTmV3QXR0cmlidXRlTmFtZU1hcHBlZCwgc05ld0F0dHJpYnV0ZU5hbWUsIHNWYWx1ZSwgc0tleTtcblx0XHRcdFx0XHRmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYUtleXMubGVuZ3RoOyBpbmRleCsrKSB7XG5cdFx0XHRcdFx0XHRzS2V5ID0gYUtleXNbaW5kZXhdO1xuXHRcdFx0XHRcdFx0aWYgKHNLZXkuaW5kZXhPZihzQXR0cmlidXRlTmFtZSkgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0c05ld0F0dHJpYnV0ZU5hbWVNYXBwZWQgPSBtU2VtYW50aWNPYmplY3RNYXBwaW5nc1tzU2VtYW50aWNPYmplY3RdW3NLZXldO1xuXHRcdFx0XHRcdFx0XHRzTmV3QXR0cmlidXRlTmFtZSA9IHNLZXkuc3BsaXQoXCIvXCIpW3NLZXkuc3BsaXQoXCIvXCIpLmxlbmd0aCAtIDFdO1xuXHRcdFx0XHRcdFx0XHRzVmFsdWUgPSBvQ29udGV4dE9iamVjdFtzQXR0cmlidXRlTmFtZV1bc05ld0F0dHJpYnV0ZU5hbWVdO1xuXHRcdFx0XHRcdFx0XHRpZiAoc05ld0F0dHJpYnV0ZU5hbWVNYXBwZWQgJiYgc05ld0F0dHJpYnV0ZU5hbWUgJiYgc1ZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0b1Jlc3VsdHNbc1NlbWFudGljT2JqZWN0XVtzTmV3QXR0cmlidXRlTmFtZU1hcHBlZF0gPSBzVmFsdWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9BdHRyaWJ1dGUpIHtcblx0XHRcdFx0XHRvQXR0cmlidXRlLnRyYW5zZm9ybWF0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogXCJcXHUyMTM5IFBsYWluIG9iamVjdHMgaGFzIGJlZW4gcmVtb3ZlZCBpbiBTaW1wbGVMaW5rRGVsZWdhdGUuXCJcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gTWFwIHRoZSBhdHRyaWJ1dGUgbmFtZSBvbmx5IGlmICdzZW1hbnRpY09iamVjdE1hcHBpbmcnIGlzIGRlZmluZWQuXG5cdFx0XHQvLyBOb3RlOiB1bmRlciBkZWZpbmVkICdzZW1hbnRpY09iamVjdE1hcHBpbmcnIHdlIGFsc28gbWVhbiBhbiBlbXB0eSBhbm5vdGF0aW9uIG9yIGFuIGFubm90YXRpb24gd2l0aCBlbXB0eSByZWNvcmRcblx0XHRcdGNvbnN0IHNBdHRyaWJ1dGVOYW1lTWFwcGVkID1cblx0XHRcdFx0bVNlbWFudGljT2JqZWN0TWFwcGluZ3MgJiZcblx0XHRcdFx0bVNlbWFudGljT2JqZWN0TWFwcGluZ3Nbc1NlbWFudGljT2JqZWN0XSAmJlxuXHRcdFx0XHRtU2VtYW50aWNPYmplY3RNYXBwaW5nc1tzU2VtYW50aWNPYmplY3RdW3NBdHRyaWJ1dGVOYW1lXVxuXHRcdFx0XHRcdD8gbVNlbWFudGljT2JqZWN0TWFwcGluZ3Nbc1NlbWFudGljT2JqZWN0XVtzQXR0cmlidXRlTmFtZV1cblx0XHRcdFx0XHQ6IHNBdHRyaWJ1dGVOYW1lO1xuXG5cdFx0XHRpZiAob0F0dHJpYnV0ZSAmJiBzQXR0cmlidXRlTmFtZSAhPT0gc0F0dHJpYnV0ZU5hbWVNYXBwZWQpIHtcblx0XHRcdFx0b1RyYW5zZm9ybWF0aW9uQWRkaXRpb25hbCA9IHtcblx0XHRcdFx0XHR2YWx1ZTogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBgXFx1MjEzOSBUaGUgYXR0cmlidXRlICR7c0F0dHJpYnV0ZU5hbWV9IGhhcyBiZWVuIHJlbmFtZWQgdG8gJHtzQXR0cmlidXRlTmFtZU1hcHBlZH0gaW4gU2ltcGxlTGlua0RlbGVnYXRlLmAsXG5cdFx0XHRcdFx0cmVhc29uOiBgXFx1ZDgzZFxcdWRkMzQgQSBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RNYXBwaW5nIGFubm90YXRpb24gaXMgZGVmaW5lZCBmb3Igc2VtYW50aWMgb2JqZWN0ICR7c1NlbWFudGljT2JqZWN0fSB3aXRoIHNvdXJjZSBhdHRyaWJ1dGUgJHtzQXR0cmlidXRlTmFtZX0gYW5kIHRhcmdldCBhdHRyaWJ1dGUgJHtzQXR0cmlidXRlTmFtZU1hcHBlZH0uIFlvdSBjYW4gbW9kaWZ5IHRoZSBhbm5vdGF0aW9uIGlmIHRoZSBtYXBwaW5nIHJlc3VsdCBpcyBub3Qgd2hhdCB5b3UgZXhwZWN0ZWQuYFxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiBtb3JlIHRoZW4gb25lIGxvY2FsIHByb3BlcnR5IG1hcHMgdG8gdGhlIHNhbWUgdGFyZ2V0IHByb3BlcnR5IChjbGFzaCBzaXR1YXRpb24pXG5cdFx0XHQvLyB3ZSB0YWtlIHRoZSB2YWx1ZSBvZiB0aGUgbGFzdCBwcm9wZXJ0eSBhbmQgd3JpdGUgYW4gZXJyb3IgbG9nXG5cdFx0XHRpZiAob1Jlc3VsdHNbc1NlbWFudGljT2JqZWN0XVtzQXR0cmlidXRlTmFtZU1hcHBlZF0pIHtcblx0XHRcdFx0TG9nLmVycm9yKFxuXHRcdFx0XHRcdGBTaW1wbGVMaW5rRGVsZWdhdGU6IFRoZSBhdHRyaWJ1dGUgJHtzQXR0cmlidXRlTmFtZX0gY2FuIG5vdCBiZSByZW5hbWVkIHRvIHRoZSBhdHRyaWJ1dGUgJHtzQXR0cmlidXRlTmFtZU1hcHBlZH0gZHVlIHRvIGEgY2xhc2ggc2l0dWF0aW9uLiBUaGlzIGNhbiBsZWFkIHRvIHdyb25nIG5hdmlnYXRpb24gbGF0ZXIgb24uYFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBDb3B5IHRoZSB2YWx1ZSByZXBsYWNpbmcgdGhlIGF0dHJpYnV0ZSBuYW1lIGJ5IHNlbWFudGljIG9iamVjdCBuYW1lXG5cdFx0XHRvUmVzdWx0c1tzU2VtYW50aWNPYmplY3RdW3NBdHRyaWJ1dGVOYW1lTWFwcGVkXSA9IG9Db250ZXh0T2JqZWN0W3NBdHRyaWJ1dGVOYW1lXTtcblxuXHRcdFx0aWYgKG9BdHRyaWJ1dGUpIHtcblx0XHRcdFx0aWYgKG9UcmFuc2Zvcm1hdGlvbkFkZGl0aW9uYWwpIHtcblx0XHRcdFx0XHRvQXR0cmlidXRlLnRyYW5zZm9ybWF0aW9ucy5wdXNoKG9UcmFuc2Zvcm1hdGlvbkFkZGl0aW9uYWwpO1xuXHRcdFx0XHRcdGNvbnN0IGFBdHRyaWJ1dGVOZXcgPSBvSW5mb0xvZy5jcmVhdGVBdHRyaWJ1dGVTdHJ1Y3R1cmUoKTtcblx0XHRcdFx0XHRhQXR0cmlidXRlTmV3LnRyYW5zZm9ybWF0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdHZhbHVlOiBvQ29udGV4dE9iamVjdFtzQXR0cmlidXRlTmFtZV0sXG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogYFxcdTIxMzkgVGhlIGF0dHJpYnV0ZSAke3NBdHRyaWJ1dGVOYW1lTWFwcGVkfSB3aXRoIHRoZSB2YWx1ZSAke29Db250ZXh0T2JqZWN0W3NBdHRyaWJ1dGVOYW1lXX0gaGFzIGJlZW4gYWRkZWQgZHVlIHRvIGEgbWFwcGluZyBydWxlIHJlZ2FyZGluZyB0aGUgYXR0cmlidXRlICR7c0F0dHJpYnV0ZU5hbWV9IGluIFNpbXBsZUxpbmtEZWxlZ2F0ZS5gXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0b0luZm9Mb2cuYWRkU2VtYW50aWNPYmplY3RBdHRyaWJ1dGUoc1NlbWFudGljT2JqZWN0LCBzQXR0cmlidXRlTmFtZU1hcHBlZCwgYUF0dHJpYnV0ZU5ldyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hpY2ggYXR0cmlidXRlcyBvZiB0aGUgQ29udGV4dE9iamVjdCBiZWxvbmcgdG8gd2hpY2ggU2VtYW50aWNPYmplY3QgYW5kIG1hcHMgdGhlbSBpbnRvIGEgdHdvIGRpbWVuc2lvbmFsIGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gb0NvbnRleHRPYmplY3QgVGhlIEJpbmRpbmdDb250ZXh0IG9mIHRoZSBTb3VyY2VDb250cm9sIG9mIHRoZSBMaW5rIC8gb2YgdGhlIExpbmsgaXRzZWxmIGlmIG5vdCBzZXRcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBnaXZlbiBieSB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSBvSW5mb0xvZyBUaGUgY29ycmVzcG9uZGluZyBJbmZvTG9nIG9mIHRoZSBMaW5rXG4gKiBAcGFyYW0gb0xpbmsgVGhlIGNvcnJlc3BvbmRpbmcgTGlua1xuICogQHJldHVybnMgQSB0d28gZGltZW5zaW9uYWwgYXJyYXkgd2hpY2ggbWFwcyBhIGdpdmVuIFNlbWFudGljT2JqZWN0IG5hbWUgdG9nZXRoZXIgd2l0aCBhIGdpdmVuIGF0dHJpYnV0ZSBuYW1lIHRvIHRoZSB2YWx1ZSBvZiB0aGF0IGdpdmVuIGF0dHJpYnV0ZVxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2NhbGN1bGF0ZVNlbWFudGljQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChvQ29udGV4dE9iamVjdDogYW55LCBvUGF5bG9hZDogYW55LCBvSW5mb0xvZzogYW55LCBvTGluazogYW55KSB7XG5cdGNvbnN0IGFMaW5rQ3VzdG9tRGF0YSA9IG9MaW5rICYmIHRoaXMuX2ZldGNoTGlua0N1c3RvbURhdGEob0xpbmspO1xuXHRjb25zdCBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IGFueSA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0UGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQoXG5cdFx0b1BheWxvYWQsXG5cdFx0YUxpbmtDdXN0b21EYXRhXG5cdCk7XG5cdGNvbnN0IG9QYXlsb2FkUmVzb2x2ZWQgPSBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgPyBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgOiBvUGF5bG9hZDtcblx0dGhpcy5yZXNvbHZlZHBheWxvYWQgPSBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ7XG5cdGNvbnN0IGFTZW1hbnRpY09iamVjdHMgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0cyhvUGF5bG9hZFJlc29sdmVkKTtcblx0Y29uc3QgbVNlbWFudGljT2JqZWN0TWFwcGluZ3MgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2NvbnZlcnRTZW1hbnRpY09iamVjdE1hcHBpbmcoXG5cdFx0U2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzKG9QYXlsb2FkUmVzb2x2ZWQpXG5cdCk7XG5cdGlmICghYVNlbWFudGljT2JqZWN0cy5sZW5ndGgpIHtcblx0XHRyZXR1cm4geyBwYXlsb2FkOiBvUGF5bG9hZFJlc29sdmVkLCByZXN1bHRzOiB7fSB9O1xuXHR9XG5cdGNvbnN0IG9SZXN1bHRzOiBhbnkgPSB7fTtcblx0U2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVQYXlsb2FkV2l0aFNlbWFudGljQXR0cmlidXRlcyhhU2VtYW50aWNPYmplY3RzLCBvSW5mb0xvZywgb0NvbnRleHRPYmplY3QsIG9SZXN1bHRzLCBtU2VtYW50aWNPYmplY3RNYXBwaW5ncyk7XG5cdHJldHVybiB7IHBheWxvYWQ6IG9QYXlsb2FkUmVzb2x2ZWQsIHJlc3VsdHM6IG9SZXN1bHRzIH07XG59O1xuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGFjdHVhbCB0YXJnZXRzIGZvciB0aGUgbmF2aWdhdGlvbiBvZiB0aGUgbGluay4gVGhpcyB1c2VzIHRoZSBVU2hlbGwgbG9hZGVkIGJ5IHRoZSB7QGxpbmsgc2FwLnVpLm1kYy5saW5rLkZhY3Rvcnl9IHRvIHJldHJpZXZlXG4gKiB0aGUgbmF2aWdhdGlvbiB0YXJnZXRzIGZyb20gdGhlIEZMUCBzZXJ2aWNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gc0FwcFN0YXRlS2V5IEtleSBvZiB0aGUgYXBwc3RhdGUgKG5vdCB1c2VkIHlldClcbiAqIEBwYXJhbSBvU2VtYW50aWNBdHRyaWJ1dGVzIFRoZSBjYWxjdWxhdGVkIGJ5IF9jYWxjdWxhdGVTZW1hbnRpY0F0dHJpYnV0ZXNcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBnaXZlbiBieSB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSBvSW5mb0xvZyBUaGUgY29ycmVzcG9uZGluZyBJbmZvTG9nIG9mIHRoZSBMaW5rXG4gKiBAcGFyYW0gb0xpbmsgVGhlIGNvcnJlc3BvbmRpbmcgTGlua1xuICogQHJldHVybnMgUmVzb2x2aW5nIGludG8gYXZhaWxhYmxlQXRpb25zIGFuZCBvd25OYXZpZ2F0aW9uIGNvbnRhaW5pbmcgYW4gYXJyYXkgb2Yge0BsaW5rIHNhcC51aS5tZGMubGluay5MaW5rSXRlbX1cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9yZXRyaWV2ZU5hdmlnYXRpb25UYXJnZXRzID0gZnVuY3Rpb24gKFxuXHRzQXBwU3RhdGVLZXk6IHN0cmluZyxcblx0b1NlbWFudGljQXR0cmlidXRlczogYW55LFxuXHRvUGF5bG9hZDogYW55LFxuXHRvSW5mb0xvZzogYW55LFxuXHRvTGluazogYW55XG4pIHtcblx0aWYgKCFvUGF5bG9hZC5zZW1hbnRpY09iamVjdHMpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcblx0fVxuXHRjb25zdCBhU2VtYW50aWNPYmplY3RzID0gb1BheWxvYWQuc2VtYW50aWNPYmplY3RzO1xuXHRjb25zdCBvTmF2aWdhdGlvblRhcmdldHM6IGFueSA9IHtcblx0XHRvd25OYXZpZ2F0aW9uOiB1bmRlZmluZWQsXG5cdFx0YXZhaWxhYmxlQWN0aW9uczogW11cblx0fTtcblx0bGV0IGlTdXBlcmlvckFjdGlvbkxpbmtzRm91bmQgPSAwO1xuXHRyZXR1cm4gQ29yZS5sb2FkTGlicmFyeShcInNhcC51aS5mbFwiLCB7XG5cdFx0YXN5bmM6IHRydWVcblx0fSkudGhlbigoKSA9PiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHRzYXAudWkucmVxdWlyZShbXCJzYXAvdWkvZmwvVXRpbHNcIl0sIGFzeW5jIChVdGlsczogYW55KSA9PiB7XG5cdFx0XHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBVdGlscy5nZXRBcHBDb21wb25lbnRGb3JDb250cm9sKG9MaW5rID09PSB1bmRlZmluZWQgPyB0aGlzLm9Db250cm9sIDogb0xpbmspO1xuXHRcdFx0XHRjb25zdCBvU2hlbGxTZXJ2aWNlcyA9IG9BcHBDb21wb25lbnQgPyBvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKSA6IG51bGw7XG5cdFx0XHRcdGlmICghb1NoZWxsU2VydmljZXMpIHtcblx0XHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdHJlc29sdmUob05hdmlnYXRpb25UYXJnZXRzLmF2YWlsYWJsZUFjdGlvbnMsIG9OYXZpZ2F0aW9uVGFyZ2V0cy5vd25OYXZpZ2F0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIW9TaGVsbFNlcnZpY2VzLmhhc1VTaGVsbCgpKSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiU2ltcGxlTGlua0RlbGVnYXRlOiBTZXJ2aWNlICdDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbicgb3IgJ1VSTFBhcnNpbmcnIGNvdWxkIG5vdCBiZSBvYnRhaW5lZFwiKTtcblx0XHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdHJlc29sdmUob05hdmlnYXRpb25UYXJnZXRzLmF2YWlsYWJsZUFjdGlvbnMsIG9OYXZpZ2F0aW9uVGFyZ2V0cy5vd25OYXZpZ2F0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBhUGFyYW1zID0gYVNlbWFudGljT2JqZWN0cy5tYXAoZnVuY3Rpb24gKHNTZW1hbnRpY09iamVjdDogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IHNTZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdFx0cGFyYW1zOiBvU2VtYW50aWNBdHRyaWJ1dGVzID8gb1NlbWFudGljQXR0cmlidXRlc1tzU2VtYW50aWNPYmplY3RdIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHRhcHBTdGF0ZUtleTogc0FwcFN0YXRlS2V5LFxuXHRcdFx0XHRcdFx0XHRzb3J0UmVzdWx0c0J5OiBcInRleHRcIlxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdF07XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IGFMaW5rcyA9IGF3YWl0IG9TaGVsbFNlcnZpY2VzLmdldExpbmtzKGFQYXJhbXMpO1xuXHRcdFx0XHRcdGxldCBiSGFzTGlua3MgPSBmYWxzZTtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFMaW5rcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBhTGlua3NbaV0ubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcdFx0aWYgKGFMaW5rc1tpXVtqXS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ykhhc0xpbmtzID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAoYkhhc0xpbmtzKSB7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIWFMaW5rcyB8fCAhYUxpbmtzLmxlbmd0aCB8fCAhYkhhc0xpbmtzKSB7XG5cdFx0XHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRyZXNvbHZlKG9OYXZpZ2F0aW9uVGFyZ2V0cy5hdmFpbGFibGVBY3Rpb25zLCBvTmF2aWdhdGlvblRhcmdldHMub3duTmF2aWdhdGlvbik7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0gU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyhvUGF5bG9hZCk7XG5cdFx0XHRcdFx0Y29uc3Qgb1VuYXZhaWxhYmxlQWN0aW9ucyA9XG5cdFx0XHRcdFx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX2NvbnZlcnRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uKGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyk7XG5cdFx0XHRcdFx0bGV0IHNDdXJyZW50SGFzaCA9IEZpZWxkUnVudGltZS5fZm5GaXhIYXNoUXVlcnlTdHJpbmcob0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkuZ2V0SGFzaCgpKTtcblxuXHRcdFx0XHRcdGlmIChzQ3VycmVudEhhc2gpIHtcblx0XHRcdFx0XHRcdC8vIEJDUCAxNzcwMzE1MDM1OiB3ZSBoYXZlIHRvIHNldCB0aGUgZW5kLXBvaW50ICc/JyBvZiBhY3Rpb24gaW4gb3JkZXIgdG8gYXZvaWQgbWF0Y2hpbmcgb2YgXCIjU2FsZXNPcmRlci1tYW5hZ2VcIiBpbiBcIiNTYWxlc09yZGVyLW1hbmFnZUZ1bGZpbGxtZW50XCJcblx0XHRcdFx0XHRcdHNDdXJyZW50SGFzaCArPSBcIj9cIjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBmbklzVW5hdmFpbGFibGVBY3Rpb24gPSBmdW5jdGlvbiAoc1NlbWFudGljT2JqZWN0OiBhbnksIHNBY3Rpb246IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdFx0ISFvVW5hdmFpbGFibGVBY3Rpb25zICYmXG5cdFx0XHRcdFx0XHRcdCEhb1VuYXZhaWxhYmxlQWN0aW9uc1tzU2VtYW50aWNPYmplY3RdICYmXG5cdFx0XHRcdFx0XHRcdG9VbmF2YWlsYWJsZUFjdGlvbnNbc1NlbWFudGljT2JqZWN0XS5pbmRleE9mKHNBY3Rpb24pID4gLTFcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRjb25zdCBmbkFkZExpbmsgPSBmdW5jdGlvbiAoX29MaW5rOiBhbnkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9TaGVsbEhhc2ggPSBvU2hlbGxTZXJ2aWNlcy5wYXJzZVNoZWxsSGFzaChfb0xpbmsuaW50ZW50KTtcblx0XHRcdFx0XHRcdGlmIChmbklzVW5hdmFpbGFibGVBY3Rpb24ob1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdCwgb1NoZWxsSGFzaC5hY3Rpb24pKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNvbnN0IHNIcmVmID0gYCMke29TaGVsbFNlcnZpY2VzLmNvbnN0cnVjdFNoZWxsSGFzaCh7IHRhcmdldDogeyBzaGVsbEhhc2g6IF9vTGluay5pbnRlbnQgfSB9KX1gO1xuXG5cdFx0XHRcdFx0XHRpZiAoX29MaW5rLmludGVudCAmJiBfb0xpbmsuaW50ZW50LmluZGV4T2Yoc0N1cnJlbnRIYXNoKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHQvLyBQcmV2ZW50IGN1cnJlbnQgYXBwIGZyb20gYmVpbmcgbGlzdGVkXG5cdFx0XHRcdFx0XHRcdC8vIE5PVEU6IElmIHRoZSBuYXZpZ2F0aW9uIHRhcmdldCBleGlzdHMgaW5cblx0XHRcdFx0XHRcdFx0Ly8gbXVsdGlwbGUgY29udGV4dHMgKH5YWFhYIGluIGhhc2gpIHRoZXkgd2lsbCBhbGwgYmUgc2tpcHBlZFxuXHRcdFx0XHRcdFx0XHRvTmF2aWdhdGlvblRhcmdldHMub3duTmF2aWdhdGlvbiA9IG5ldyBMaW5rSXRlbSh7XG5cdFx0XHRcdFx0XHRcdFx0aHJlZjogc0hyZWYsXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogX29MaW5rLnRleHRcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNvbnN0IG9MaW5rSXRlbSA9IG5ldyBMaW5rSXRlbSh7XG5cdFx0XHRcdFx0XHRcdC8vIEFzIHRoZSByZXRyaWV2ZU5hdmlnYXRpb25UYXJnZXRzIG1ldGhvZCBjYW4gYmUgY2FsbGVkIHNldmVyYWwgdGltZSB3ZSBjYW4gbm90IGNyZWF0ZSB0aGUgTGlua0l0ZW0gaW5zdGFuY2Ugd2l0aCB0aGUgc2FtZSBpZFxuXHRcdFx0XHRcdFx0XHRrZXk6XG5cdFx0XHRcdFx0XHRcdFx0b1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdCAmJiBvU2hlbGxIYXNoLmFjdGlvblxuXHRcdFx0XHRcdFx0XHRcdFx0PyBgJHtvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0fS0ke29TaGVsbEhhc2guYWN0aW9ufWBcblx0XHRcdFx0XHRcdFx0XHRcdDogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBfb0xpbmsudGV4dCxcblx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0aHJlZjogc0hyZWYsXG5cdFx0XHRcdFx0XHRcdC8vIHRhcmdldDogbm90IHN1cHBvcnRlZCB5ZXRcblx0XHRcdFx0XHRcdFx0aWNvbjogdW5kZWZpbmVkLCAvL19vTGluay5pY29uLFxuXHRcdFx0XHRcdFx0XHRpbml0aWFsbHlWaXNpYmxlOiBfb0xpbmsudGFncyAmJiBfb0xpbmsudGFncy5pbmRleE9mKFwic3VwZXJpb3JBY3Rpb25cIikgPiAtMVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRpZiAob0xpbmtJdGVtLmdldFByb3BlcnR5KFwiaW5pdGlhbGx5VmlzaWJsZVwiKSkge1xuXHRcdFx0XHRcdFx0XHRpU3VwZXJpb3JBY3Rpb25MaW5rc0ZvdW5kKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9ucy5wdXNoKG9MaW5rSXRlbSk7XG5cblx0XHRcdFx0XHRcdGlmIChvSW5mb0xvZykge1xuXHRcdFx0XHRcdFx0XHRvSW5mb0xvZy5hZGRTZW1hbnRpY09iamVjdEludGVudChvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0LCB7XG5cdFx0XHRcdFx0XHRcdFx0aW50ZW50OiBvTGlua0l0ZW0uZ2V0SHJlZigpLFxuXHRcdFx0XHRcdFx0XHRcdHRleHQ6IG9MaW5rSXRlbS5nZXRUZXh0KClcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRmb3IgKGxldCBuID0gMDsgbiA8IGFTZW1hbnRpY09iamVjdHMubGVuZ3RoOyBuKyspIHtcblx0XHRcdFx0XHRcdGFMaW5rc1tuXVswXS5mb3JFYWNoKGZuQWRkTGluayk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChpU3VwZXJpb3JBY3Rpb25MaW5rc0ZvdW5kID09PSAwKSB7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBpTGlua0l0ZW1JbmRleCA9IDA7IGlMaW5rSXRlbUluZGV4IDwgb05hdmlnYXRpb25UYXJnZXRzLmF2YWlsYWJsZUFjdGlvbnMubGVuZ3RoOyBpTGlua0l0ZW1JbmRleCsrKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChpTGlua0l0ZW1JbmRleCA8IHRoaXMuZ2V0Q29uc3RhbnRzKCkuaUxpbmtzU2hvd25JblBvcHVwKSB7XG5cdFx0XHRcdFx0XHRcdFx0b05hdmlnYXRpb25UYXJnZXRzLmF2YWlsYWJsZUFjdGlvbnNbaUxpbmtJdGVtSW5kZXhdLnNldFByb3BlcnR5KFwiaW5pdGlhbGx5VmlzaWJsZVwiLCB0cnVlKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdHJlc29sdmUob05hdmlnYXRpb25UYXJnZXRzLmF2YWlsYWJsZUFjdGlvbnMsIG9OYXZpZ2F0aW9uVGFyZ2V0cy5vd25OYXZpZ2F0aW9uKTtcblx0XHRcdFx0fSBjYXRjaCAob0Vycm9yKSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiU2ltcGxlTGlua0RlbGVnYXRlOiAnX3JldHJpZXZlTmF2aWdhdGlvblRhcmdldHMnIGZhaWxlZCBleGVjdXRpbmcgZ2V0TGlua3MgbWV0aG9kXCIpO1xuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0cmVzb2x2ZShvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9ucywgb05hdmlnYXRpb25UYXJnZXRzLm93bk5hdmlnYXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSk7XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdHMgPSBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSkge1xuXHRyZXR1cm4gb1BheWxvYWQuc2VtYW50aWNPYmplY3RzID8gb1BheWxvYWQuc2VtYW50aWNPYmplY3RzIDogW107XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA9IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55KSB7XG5cdGNvbnN0IGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczogYW55W10gPSBbXTtcblx0aWYgKG9QYXlsb2FkLnNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zKSB7XG5cdFx0b1BheWxvYWQuc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob1NlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb246IGFueSkge1xuXHRcdFx0YVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLnB1c2goXG5cdFx0XHRcdG5ldyBTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uKHtcblx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogb1NlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24uc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0YWN0aW9uczogb1NlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24uYWN0aW9uc1xuXHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zO1xufTtcblxuLyoqXG4gKiBUaGlzIHdpbGwgcmV0dXJuIGFuIGFycmF5IG9mIHtAbGluayBzYXAudWkubWRjLmxpbmsuU2VtYW50aWNPYmplY3RNYXBwaW5nfSBkZXBlbmRpbmcgb24gdGhlIGdpdmVuIHBheWxvYWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBkZWZpbmVkIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc2VtYW50aWMgb2JqZWN0IG1hcHBpbmdzLlxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0TWFwcGluZ3MgPSBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSkge1xuXHRjb25zdCBhU2VtYW50aWNPYmplY3RNYXBwaW5nczogYW55W10gPSBbXTtcblx0bGV0IGFTZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtczogYW55W10gPSBbXTtcblx0aWYgKG9QYXlsb2FkLnNlbWFudGljT2JqZWN0TWFwcGluZ3MpIHtcblx0XHRvUGF5bG9hZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzLmZvckVhY2goZnVuY3Rpb24gKG9TZW1hbnRpY09iamVjdE1hcHBpbmc6IGFueSkge1xuXHRcdFx0YVNlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW1zID0gW107XG5cdFx0XHRpZiAob1NlbWFudGljT2JqZWN0TWFwcGluZy5pdGVtcykge1xuXHRcdFx0XHRvU2VtYW50aWNPYmplY3RNYXBwaW5nLml0ZW1zLmZvckVhY2goZnVuY3Rpb24gKG9TZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtOiBhbnkpIHtcblx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbXMucHVzaChcblx0XHRcdFx0XHRcdG5ldyBTZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtKHtcblx0XHRcdFx0XHRcdFx0a2V5OiBvU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbS5rZXksXG5cdFx0XHRcdFx0XHRcdHZhbHVlOiBvU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbS52YWx1ZVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGFTZW1hbnRpY09iamVjdE1hcHBpbmdzLnB1c2goXG5cdFx0XHRcdG5ldyBTZW1hbnRpY09iamVjdE1hcHBpbmcoe1xuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvU2VtYW50aWNPYmplY3RNYXBwaW5nLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdGl0ZW1zOiBhU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbXNcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGFTZW1hbnRpY09iamVjdE1hcHBpbmdzO1xufTtcbi8qKlxuICogQ29udmVydHMgYSBnaXZlbiBhcnJheSBvZiBTZW1hbnRpY09iamVjdE1hcHBpbmcgaW50byBhIE1hcCBjb250YWluaW5nIFNlbWFudGljT2JqZWN0cyBhcyBLZXlzIGFuZCBhIE1hcCBvZiBpdCdzIGNvcnJlc3BvbmRpbmcgU2VtYW50aWNPYmplY3RNYXBwaW5ncyBhcyB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBhU2VtYW50aWNPYmplY3RNYXBwaW5ncyBBbiBhcnJheSBvZiBTZW1hbnRpY09iamVjdE1hcHBpbmdzLlxuICogQHJldHVybnMgVGhlIGNvbnZlcnRlcmQgU2VtYW50aWNPYmplY3RNYXBwaW5nc1xuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2NvbnZlcnRTZW1hbnRpY09iamVjdE1hcHBpbmcgPSBmdW5jdGlvbiAoYVNlbWFudGljT2JqZWN0TWFwcGluZ3M6IGFueVtdKSB7XG5cdGlmICghYVNlbWFudGljT2JqZWN0TWFwcGluZ3MubGVuZ3RoKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRjb25zdCBtU2VtYW50aWNPYmplY3RNYXBwaW5nczogYW55ID0ge307XG5cdGFTZW1hbnRpY09iamVjdE1hcHBpbmdzLmZvckVhY2goZnVuY3Rpb24gKG9TZW1hbnRpY09iamVjdE1hcHBpbmc6IGFueSkge1xuXHRcdGlmICghb1NlbWFudGljT2JqZWN0TWFwcGluZy5nZXRTZW1hbnRpY09iamVjdCgpKSB7XG5cdFx0XHR0aHJvdyBFcnJvcihcblx0XHRcdFx0YFNpbXBsZUxpbmtEZWxlZ2F0ZTogJ3NlbWFudGljT2JqZWN0JyBwcm9wZXJ0eSB3aXRoIHZhbHVlICcke29TZW1hbnRpY09iamVjdE1hcHBpbmcuZ2V0U2VtYW50aWNPYmplY3QoKX0nIGlzIG5vdCB2YWxpZGBcblx0XHRcdCk7XG5cdFx0fVxuXHRcdG1TZW1hbnRpY09iamVjdE1hcHBpbmdzW29TZW1hbnRpY09iamVjdE1hcHBpbmcuZ2V0U2VtYW50aWNPYmplY3QoKV0gPSBvU2VtYW50aWNPYmplY3RNYXBwaW5nXG5cdFx0XHQuZ2V0SXRlbXMoKVxuXHRcdFx0LnJlZHVjZShmdW5jdGlvbiAob01hcDogYW55LCBvSXRlbTogYW55KSB7XG5cdFx0XHRcdG9NYXBbb0l0ZW0uZ2V0S2V5KCldID0gb0l0ZW0uZ2V0VmFsdWUoKTtcblx0XHRcdFx0cmV0dXJuIG9NYXA7XG5cdFx0XHR9LCB7fSk7XG5cdH0pO1xuXHRyZXR1cm4gbVNlbWFudGljT2JqZWN0TWFwcGluZ3M7XG59O1xuLyoqXG4gKiBDb252ZXJ0cyBhIGdpdmVuIGFycmF5IG9mIFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIGludG8gYSBtYXAgY29udGFpbmluZyBTZW1hbnRpY09iamVjdHMgYXMga2V5cyBhbmQgYSBtYXAgb2YgaXRzIGNvcnJlc3BvbmRpbmcgU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgYXMgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIFRoZSBTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyBjb252ZXJ0ZWRcbiAqIEByZXR1cm5zIFRoZSBtYXAgY29udGFpbmluZyB0aGUgY29udmVydGVkIFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fY29udmVydFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24gPSBmdW5jdGlvbiAoYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBhbnlbXSkge1xuXHRsZXQgX1NlbWFudGljT2JqZWN0TmFtZTogYW55O1xuXHRsZXQgX1NlbWFudGljT2JqZWN0SGFzQWxyZWFkeVVuYXZhaWxhYmxlQWN0aW9uczogYW55O1xuXHRsZXQgX1VuYXZhaWxhYmxlQWN0aW9uczogYW55W10gPSBbXTtcblx0aWYgKCFhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRjb25zdCBtU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM6IGFueSA9IHt9O1xuXHRhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob1NlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBhbnkpIHtcblx0XHRfU2VtYW50aWNPYmplY3ROYW1lID0gb1NlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLmdldFNlbWFudGljT2JqZWN0KCk7XG5cdFx0aWYgKCFfU2VtYW50aWNPYmplY3ROYW1lKSB7XG5cdFx0XHR0aHJvdyBFcnJvcihgU2ltcGxlTGlua0RlbGVnYXRlOiAnc2VtYW50aWNPYmplY3QnIHByb3BlcnR5IHdpdGggdmFsdWUgJyR7X1NlbWFudGljT2JqZWN0TmFtZX0nIGlzIG5vdCB2YWxpZGApO1xuXHRcdH1cblx0XHRfVW5hdmFpbGFibGVBY3Rpb25zID0gb1NlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLmdldEFjdGlvbnMoKTtcblx0XHRpZiAobVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zW19TZW1hbnRpY09iamVjdE5hbWVdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdG1TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1tfU2VtYW50aWNPYmplY3ROYW1lXSA9IF9VbmF2YWlsYWJsZUFjdGlvbnM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdF9TZW1hbnRpY09iamVjdEhhc0FscmVhZHlVbmF2YWlsYWJsZUFjdGlvbnMgPSBtU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNbX1NlbWFudGljT2JqZWN0TmFtZV07XG5cdFx0XHRfVW5hdmFpbGFibGVBY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKFVuYXZhaWxhYmxlQWN0aW9uOiBzdHJpbmcpIHtcblx0XHRcdFx0X1NlbWFudGljT2JqZWN0SGFzQWxyZWFkeVVuYXZhaWxhYmxlQWN0aW9ucy5wdXNoKFVuYXZhaWxhYmxlQWN0aW9uKTtcblx0XHRcdH0pO1xuXHRcdFx0bVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zW19TZW1hbnRpY09iamVjdE5hbWVdID0gX1NlbWFudGljT2JqZWN0SGFzQWxyZWFkeVVuYXZhaWxhYmxlQWN0aW9ucztcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2ltcGxlTGlua0RlbGVnYXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQWdEQSxNQUFNQSxrQkFBa0IsR0FBR0MsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVDLFlBQVksQ0FBUTtFQUNqRSxNQUFNQyxTQUFTLEdBQUc7SUFDakJDLGtCQUFrQixFQUFFLENBQUM7SUFDckJDLFFBQVEsRUFBRSxZQUFZO0lBQ3RCQyxZQUFZLEVBQUUsaUJBQWlCO0lBQy9CQyxvQkFBb0IsRUFBRSwwQkFBMEI7SUFDaERDLG9CQUFvQixFQUFFLHdCQUF3QjtJ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