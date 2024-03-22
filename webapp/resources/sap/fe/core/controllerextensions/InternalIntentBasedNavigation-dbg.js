/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/navigation/SelectionVariant", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "../converters/helpers/Aggregation", "./editFlow/NotApplicableContextDialog"], function (Log, mergeObjects, CommonUtils, draft, MetaModelConverter, ClassSupport, KeepAliveHelper, ModelHelper, ResourceModelHelper, SelectionVariant, Core, ControllerExtension, OverrideExecution, Aggregation, NotApplicableContextDialog) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _class, _class2;
  var AggregationHelper = Aggregation.AggregationHelper;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var convertTypes = MetaModelConverter.convertTypes;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * {@link sap.ui.core.mvc.ControllerExtension Controller extension}
   *
   * @namespace
   * @alias sap.fe.core.controllerextensions.InternalInternalBasedNavigation
   * @private
   * @since 1.84.0
   */
  let InternalIntentBasedNavigation = (_dec = defineUI5Class("sap.fe.core.controllerextensions.InternalInternalBasedNavigation"), _dec2 = methodOverride(), _dec3 = publicExtension(), _dec4 = finalExtension(), _dec5 = publicExtension(), _dec6 = finalExtension(), _dec7 = publicExtension(), _dec8 = finalExtension(), _dec9 = publicExtension(), _dec10 = extensible(OverrideExecution.Instead), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = privateExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec16 = publicExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = finalExtension(), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(InternalIntentBasedNavigation, _ControllerExtension);
    function InternalIntentBasedNavigation() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = InternalIntentBasedNavigation.prototype;
    _proto.onInit = function onInit() {
      this._oAppComponent = this.base.getAppComponent();
      this._oMetaModel = this._oAppComponent.getModel().getMetaModel();
      this._oNavigationService = this._oAppComponent.getNavigationService();
      this._oView = this.base.getView();
    }

    /**
     * Enables intent-based navigation (SemanticObject-Action) with the provided context.
     * If semantic object mapping is provided, this is also applied to the selection variant after the adaptation by a consumer.
     * This takes care of removing any technical parameters and determines if an explace or inplace navigation should take place.
     *
     * @param sSemanticObject Semantic object for the target app
     * @param sAction  Action for the target app
     * @param [mNavigationParameters] Optional parameters to be passed to the external navigation
     * @param [mNavigationParameters.navigationContexts] Uses one of the following to be passed to the intent:
     *    a single instance of {@link sap.ui.model.odata.v4.Context}
     *    multiple instances of {@link sap.ui.model.odata.v4.Context}
     *    an object or an array of objects
     *		  If an array of objects is passed, the context is used to determine the metaPath and to remove any sensitive data
     *		  If an array of objects is passed, the following format ix expected:
     *		  {
     *			data: {
     *	 			ProductID: 7634,
     *				Name: "Laptop"
     *			 },
     *			 metaPath: "/SalesOrderManage"
     *        }
     * @param [mNavigationParameters.semanticObjectMapping] String representation of the SemanticObjectMapping or SemanticObjectMapping that applies to this navigation
     * @param [mNavigationParameters.defaultRefreshStrategy] Default refresh strategy to be used in case no refresh strategy is specified for the intent in the view.
     * @param [mNavigationParameters.refreshStrategies]
     * @param [mNavigationParameters.additionalNavigationParameters] Additional navigation parameters configured in the crossAppNavigation outbound parameters.
     */;
    _proto.navigate = function navigate(sSemanticObject, sAction, mNavigationParameters) {
      const _doNavigate = oContext => {
        const vNavigationContexts = mNavigationParameters && mNavigationParameters.navigationContexts,
          aNavigationContexts = vNavigationContexts && !Array.isArray(vNavigationContexts) ? [vNavigationContexts] : vNavigationContexts,
          vSemanticObjectMapping = mNavigationParameters && mNavigationParameters.semanticObjectMapping,
          vOutboundParams = mNavigationParameters && mNavigationParameters.additionalNavigationParameters,
          oTargetInfo = {
            semanticObject: sSemanticObject,
            action: sAction
          },
          oView = this.base.getView(),
          oController = oView.getController();
        if (oContext) {
          this._oView.setBindingContext(oContext);
        }
        if (sSemanticObject && sAction) {
          let aSemanticAttributes = [],
            oSelectionVariant = new SelectionVariant();
          // 1. get SemanticAttributes for navigation
          if (aNavigationContexts && aNavigationContexts.length) {
            aNavigationContexts.forEach(oNavigationContext => {
              // 1.1.a if navigation context is instance of sap.ui.mode.odata.v4.Context
              // else check if navigation context is of type object
              if (oNavigationContext.isA && oNavigationContext.isA("sap.ui.model.odata.v4.Context")) {
                // 1.1.b remove sensitive data
                let oSemanticAttributes = oNavigationContext.getObject();
                const sMetaPath = this._oMetaModel.getMetaPath(oNavigationContext.getPath());
                // TODO: also remove sensitive data from  navigation properties
                oSemanticAttributes = this.removeSensitiveData(oSemanticAttributes, sMetaPath);
                const oNavContext = this.prepareContextForExternalNavigation(oSemanticAttributes, oNavigationContext);
                oTargetInfo["propertiesWithoutConflict"] = oNavContext.propertiesWithoutConflict;
                aSemanticAttributes.push(oNavContext.semanticAttributes);
              } else if (!(oNavigationContext && Array.isArray(oNavigationContext.data)) && typeof oNavigationContext === "object") {
                // 1.1.b remove sensitive data from object
                aSemanticAttributes.push(this.removeSensitiveData(oNavigationContext.data, oNavigationContext.metaPath));
              } else if (oNavigationContext && Array.isArray(oNavigationContext.data)) {
                // oNavigationContext.data can be array already ex : [{Customer: "10001"}, {Customer: "10091"}]
                // hence assigning it to the aSemanticAttributes
                aSemanticAttributes = this.removeSensitiveData(oNavigationContext.data, oNavigationContext.metaPath);
              }
            });
          }
          // 2.1 Merge base selection variant and sanitized semantic attributes into one SelectionVariant
          if (aSemanticAttributes && aSemanticAttributes.length) {
            oSelectionVariant = this._oNavigationService.mixAttributesAndSelectionVariant(aSemanticAttributes, oSelectionVariant.toJSONString());
          }

          // 3. Add filterContextUrl to SV so the NavigationHandler can remove any sensitive data based on view entitySet
          const oModel = this._oView.getModel(),
            sEntitySet = this.getEntitySet(),
            sContextUrl = sEntitySet ? this._oNavigationService.constructContextUrl(sEntitySet, oModel) : undefined;
          if (sContextUrl) {
            oSelectionVariant.setFilterContextUrl(sContextUrl);
          }

          // Apply Outbound Parameters to the SV
          if (vOutboundParams) {
            this._applyOutboundParams(oSelectionVariant, vOutboundParams);
          }

          // 4. give an opportunity for the application to influence the SelectionVariant
          oController.intentBasedNavigation.adaptNavigationContext(oSelectionVariant, oTargetInfo);

          // 5. Apply semantic object mappings to the SV
          if (vSemanticObjectMapping) {
            this._applySemanticObjectMappings(oSelectionVariant, vSemanticObjectMapping);
          }

          // 6. remove technical parameters from Selection Variant
          this._removeTechnicalParameters(oSelectionVariant);

          // 7. check if programming model is sticky and page is editable
          const sNavMode = oController._intentBasedNavigation.getNavigationMode();

          // 8. Updating refresh strategy in internal model
          const mRefreshStrategies = mNavigationParameters && mNavigationParameters.refreshStrategies || {},
            oInternalModel = oView.getModel("internal");
          if (oInternalModel) {
            if ((oView && oView.getViewData()).refreshStrategyOnAppRestore) {
              const mViewRefreshStrategies = oView.getViewData().refreshStrategyOnAppRestore || {};
              mergeObjects(mRefreshStrategies, mViewRefreshStrategies);
            }
            const mRefreshStrategy = KeepAliveHelper.getRefreshStrategyForIntent(mRefreshStrategies, sSemanticObject, sAction);
            if (mRefreshStrategy) {
              oInternalModel.setProperty("/refreshStrategyOnAppRestore", mRefreshStrategy);
            }
          }

          // 9. Navigate via NavigationHandler
          const onError = function () {
            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
              const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
              MessageBox.error(oResourceBundle.getText("C_COMMON_HELPER_NAVIGATION_ERROR_MESSAGE"), {
                title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR")
              });
            });
          };
          this._oNavigationService.navigate(sSemanticObject, sAction, oSelectionVariant.toJSONString(), undefined, onError, undefined, sNavMode);
        } else {
          throw new Error("Semantic Object/action is not provided");
        }
      };
      const oBindingContext = this.base.getView().getBindingContext();
      const oMetaModel = oBindingContext && oBindingContext.getModel().getMetaModel();
      if (this.getView().getViewData().converterType === "ObjectPage" && oMetaModel && !ModelHelper.isStickySessionSupported(oMetaModel)) {
        draft.processDataLossOrDraftDiscardConfirmation(_doNavigate.bind(this), Function.prototype, this.base.getView().getBindingContext(), this.base.getView().getController(), true, draft.NavigationType.ForwardNavigation);
      } else {
        _doNavigate();
      }
    }

    /**
     * Prepare attributes to be passed to external navigation.
     *
     * @param oSemanticAttributes Context data after removing all sensitive information.
     * @param oContext Actual context from which the semanticAttributes were derived.
     * @returns Object of prepared attributes for external navigation and no conflict properties.
     */;
    _proto.prepareContextForExternalNavigation = function prepareContextForExternalNavigation(oSemanticAttributes, oContext) {
      // 1. Find all distinct keys in the object SemanticAttributes
      // Store meta path for each occurence of the key
      const oDistinctKeys = {},
        sContextPath = oContext.getPath(),
        oMetaModel = oContext.getModel().getMetaModel(),
        sMetaPath = oMetaModel.getMetaPath(sContextPath),
        aMetaPathParts = sMetaPath.split("/").filter(Boolean);
      function _findDistinctKeysInObject(LookUpObject, sLookUpObjectMetaPath) {
        for (const sKey in LookUpObject) {
          // null case??
          if (LookUpObject[sKey] === null || typeof LookUpObject[sKey] !== "object") {
            if (!oDistinctKeys[sKey]) {
              // if key is found for the first time then create array
              oDistinctKeys[sKey] = [];
            }
            // push path to array
            oDistinctKeys[sKey].push(sLookUpObjectMetaPath);
          } else {
            // if a nested object is found
            const oNewLookUpObject = LookUpObject[sKey];
            _findDistinctKeysInObject(oNewLookUpObject, `${sLookUpObjectMetaPath}/${sKey}`);
          }
        }
      }
      _findDistinctKeysInObject(oSemanticAttributes, sMetaPath);

      // 2. Determine distinct key value and add conflicted paths to semantic attributes
      const sMainEntitySetName = aMetaPathParts[0],
        sMainEntityTypeName = oMetaModel.getObject(`/${sMainEntitySetName}/@sapui.name`),
        oPropertiesWithoutConflict = {};
      let sMainEntityValuePath, sCurrentValuePath, sLastValuePath;
      for (const sDistinctKey in oDistinctKeys) {
        const aConflictingPaths = oDistinctKeys[sDistinctKey];
        let sWinnerValuePath;
        // Find winner value for each distinct key in case of conflict by the following rule:

        // -> A. if any meta path for a distinct key is the same as main entity take that as the value
        // -> B. if A is not met keep the value from the current context (sMetaPath === path of distince key)
        // -> C. if A, B or C are not met take the last path for value
        if (aConflictingPaths.length > 1) {
          // conflict
          for (let i = 0; i <= aConflictingPaths.length - 1; i++) {
            const sPath = aConflictingPaths[i];
            let sPathInContext = sPath.replace(sPath === sMetaPath ? sMetaPath : `${sMetaPath}/`, "");
            sPathInContext = (sPathInContext === "" ? sPathInContext : `${sPathInContext}/`) + sDistinctKey;
            const sEntityTypeName = oMetaModel.getObject(`${sPath}/@sapui.name`);
            // rule A

            // rule A
            if (sEntityTypeName === sMainEntityTypeName) {
              sMainEntityValuePath = sPathInContext;
            }

            // rule B
            if (sPath === sMetaPath) {
              sCurrentValuePath = sPathInContext;
            }

            // rule C
            sLastValuePath = sPathInContext;

            // add conflicted path to semantic attributes
            // check if the current path points to main entity and prefix attribute names accordingly
            oSemanticAttributes[`${sMetaPath}/${sPathInContext}`.split("/").filter(function (sValue) {
              return sValue != "";
            }).join(".")] = oContext.getProperty(sPathInContext);
          }
          // A || B || C
          sWinnerValuePath = sMainEntityValuePath || sCurrentValuePath || sLastValuePath;
          oSemanticAttributes[sDistinctKey] = oContext.getProperty(sWinnerValuePath);
          sMainEntityValuePath = undefined;
          sCurrentValuePath = undefined;
          sLastValuePath = undefined;
        } else {
          // no conflict, add distinct key without adding paths
          const sPath = aConflictingPaths[0]; // because there is only one and hence no conflict
          let sPathInContext = sPath.replace(sPath === sMetaPath ? sMetaPath : `${sMetaPath}/`, "");
          sPathInContext = (sPathInContext === "" ? sPathInContext : `${sPathInContext}/`) + sDistinctKey;
          oSemanticAttributes[sDistinctKey] = oContext.getProperty(sPathInContext);
          oPropertiesWithoutConflict[sDistinctKey] = `${sMetaPath}/${sPathInContext}`.split("/").filter(function (sValue) {
            return sValue != "";
          }).join(".");
        }
      }
      // 3. Remove all Navigation properties
      for (const sProperty in oSemanticAttributes) {
        if (oSemanticAttributes[sProperty] !== null && typeof oSemanticAttributes[sProperty] === "object") {
          delete oSemanticAttributes[sProperty];
        }
      }
      return {
        semanticAttributes: oSemanticAttributes,
        propertiesWithoutConflict: oPropertiesWithoutConflict
      };
    }

    /**
     * Prepare filter conditions to be passed to external navigation.
     *
     * @param oFilterBarConditions Filter conditions.
     * @param sRootPath Root path of the application.
     * @param aParameters Names of parameters to be considered.
     * @returns Object of prepared filter conditions for external navigation and no conflict filters.
     */;
    _proto.prepareFiltersForExternalNavigation = function prepareFiltersForExternalNavigation(oFilterBarConditions, sRootPath, aParameters) {
      let sPath;
      const oDistinctKeys = {};
      const oFilterConditionsWithoutConflict = {};
      let sMainEntityValuePath, sCurrentValuePath, sFullContextPath, sWinnerValuePath, sPathInContext;
      function _findDistinctKeysInObject(LookUpObject) {
        let sLookUpObjectMetaPath;
        for (const sKey in LookUpObject) {
          let keyInContext = sKey;
          if (LookUpObject[keyInContext]) {
            if (keyInContext.includes("/")) {
              sLookUpObjectMetaPath = keyInContext; // "/SalesOrdermanage/_Item/Material"
              const aPathParts = keyInContext.split("/");
              keyInContext = aPathParts[aPathParts.length - 1];
            } else {
              sLookUpObjectMetaPath = sRootPath;
            }
            if (!oDistinctKeys[keyInContext]) {
              // if key is found for the first time then create array
              oDistinctKeys[keyInContext] = [];
            }

            // push path to array
            oDistinctKeys[keyInContext].push(sLookUpObjectMetaPath);
          }
        }
      }
      _findDistinctKeysInObject(oFilterBarConditions);
      for (const sDistinctKey in oDistinctKeys) {
        const aConflictingPaths = oDistinctKeys[sDistinctKey];
        if (aConflictingPaths.length > 1) {
          // conflict
          for (let i = 0; i <= aConflictingPaths.length - 1; i++) {
            sPath = aConflictingPaths[i];
            if (sPath === sRootPath) {
              sFullContextPath = `${sRootPath}/${sDistinctKey}`;
              sPathInContext = sDistinctKey;
              sMainEntityValuePath = sDistinctKey;
              if (aParameters && aParameters.includes(sDistinctKey)) {
                oFilterBarConditions[`$Parameter.${sDistinctKey}`] = oFilterBarConditions[sDistinctKey];
              }
            } else {
              sPathInContext = sPath;
              sFullContextPath = `${sRootPath}/${sPath}`.replaceAll(/\*/g, "");
              sCurrentValuePath = sPath;
            }
            oFilterBarConditions[sFullContextPath.split("/").filter(function (sValue) {
              return sValue != "";
            }).join(".")] = oFilterBarConditions[sPathInContext];
            delete oFilterBarConditions[sPath];
          }
          sWinnerValuePath = sMainEntityValuePath || sCurrentValuePath;
          oFilterBarConditions[sDistinctKey] = oFilterBarConditions[sWinnerValuePath];
        } else {
          // no conflict, add distinct key without adding paths
          sPath = aConflictingPaths[0];
          sFullContextPath = sPath === sRootPath ? `${sRootPath}/${sDistinctKey}` : `${sRootPath}/${sPath}`.replaceAll("*", "");
          oFilterConditionsWithoutConflict[sDistinctKey] = sFullContextPath.split("/").filter(function (sValue) {
            return sValue != "";
          }).join(".");
          if (aParameters && aParameters.includes(sDistinctKey)) {
            oFilterBarConditions[`$Parameter.${sDistinctKey}`] = oFilterBarConditions[sDistinctKey];
          }
        }
      }
      return {
        filterConditions: oFilterBarConditions,
        filterConditionsWithoutConflict: oFilterConditionsWithoutConflict
      };
    }

    /**
     * Get Navigation mode.
     *
     * @returns The navigation mode
     */;
    _proto.getNavigationMode = function getNavigationMode() {
      return undefined;
    }

    /**
     * Allows for navigation to a given intent (SemanticObject-Action) with the provided context, using a dialog that shows the contexts which cannot be passed
     * If semantic object mapping is provided, this setting is also applied to the selection variant after adaptation by a consumer.
     * This setting also removes any technical parameters and determines if an inplace or explace navigation should take place.
     *
     * @param sSemanticObject Semantic object for the target app
     * @param sAction  Action for the target app
     * @param [mNavigationParameters] Optional parameters to be passed to the external navigation
     */;
    _proto.navigateWithConfirmationDialog = async function navigateWithConfirmationDialog(sSemanticObject, sAction, mNavigationParameters) {
      var _mNavigationParameter;
      let shouldContinue = true;
      if (mNavigationParameters !== null && mNavigationParameters !== void 0 && mNavigationParameters.notApplicableContexts && ((_mNavigationParameter = mNavigationParameters.notApplicableContexts) === null || _mNavigationParameter === void 0 ? void 0 : _mNavigationParameter.length) >= 1) {
        const metaModel = this.base.getView().getModel().getMetaModel();
        const entitySetPath = metaModel.getMetaPath(mNavigationParameters.notApplicableContexts[0].getPath());
        const convertedMetadata = convertTypes(metaModel);
        const entitySet = convertedMetadata.resolvePath(entitySetPath).target;
        // Show the contexts that are not applicable and will not therefore be processed
        const notApplicableContextsDialog = new NotApplicableContextDialog({
          title: "",
          entityType: entitySet.entityType,
          resourceModel: getResourceModel(this.getView()),
          notApplicableContexts: mNavigationParameters.notApplicableContexts
        });
        mNavigationParameters.navigationContexts = mNavigationParameters.applicableContexts;
        shouldContinue = await notApplicableContextsDialog.open(this.getView());
      }
      if (shouldContinue) {
        this.navigate(sSemanticObject, sAction, mNavigationParameters);
      }
    };
    _proto._removeTechnicalParameters = function _removeTechnicalParameters(oSelectionVariant) {
      oSelectionVariant.removeSelectOption("@odata.context");
      oSelectionVariant.removeSelectOption("@odata.metadataEtag");
      oSelectionVariant.removeSelectOption("SAP__Messages");
    }

    /**
     * Get targeted Entity set.
     *
     * @returns Entity set name
     */;
    _proto.getEntitySet = function getEntitySet() {
      return this._oView.getViewData().entitySet;
    }

    /**
     * Removes sensitive data from the semantic attribute with respect to the entitySet.
     *
     * @param oAttributes Context data
     * @param sMetaPath Meta path to reach the entitySet in the MetaModel
     * @returns Array of semantic Attributes
     * @private
     */
    // TO-DO add unit tests for this function in the controller extension qunit.
    ;
    _proto.removeSensitiveData = function removeSensitiveData(oAttributes, sMetaPath) {
      if (oAttributes) {
        const {
          transAggregations,
          customAggregates
        } = this._getAggregates(sMetaPath, this.base.getView(), this.base.getAppComponent().getDiagnostics());
        const aProperties = Object.keys(oAttributes);
        if (aProperties.length) {
          delete oAttributes["@odata.context"];
          delete oAttributes["@odata.metadataEtag"];
          delete oAttributes["SAP__Messages"];
          for (const element of aProperties) {
            if (oAttributes[element] && typeof oAttributes[element] === "object") {
              this.removeSensitiveData(oAttributes[element], `${sMetaPath}/${element}`);
            }
            if (element.indexOf("@odata.type") > -1) {
              delete oAttributes[element];
              continue;
            }
            this._deleteAggregates([...transAggregations, ...customAggregates], element, oAttributes);
            const aPropertyAnnotations = this._getPropertyAnnotations(element, sMetaPath, oAttributes, this._oMetaModel);
            if (aPropertyAnnotations) {
              var _aPropertyAnnotations, _aPropertyAnnotations2, _aPropertyAnnotations3, _aPropertyAnnotations4;
              if ((_aPropertyAnnotations = aPropertyAnnotations.PersonalData) !== null && _aPropertyAnnotations !== void 0 && _aPropertyAnnotations.IsPotentiallySensitive || (_aPropertyAnnotations2 = aPropertyAnnotations.UI) !== null && _aPropertyAnnotations2 !== void 0 && _aPropertyAnnotations2.ExcludeFromNavigationContext || (_aPropertyAnnotations3 = aPropertyAnnotations.Analytics) !== null && _aPropertyAnnotations3 !== void 0 && _aPropertyAnnotations3.Measure) {
                delete oAttributes[element];
              } else if ((_aPropertyAnnotations4 = aPropertyAnnotations.Common) !== null && _aPropertyAnnotations4 !== void 0 && _aPropertyAnnotations4.FieldControl) {
                const oFieldControl = aPropertyAnnotations.Common.FieldControl;
                if (oFieldControl["$EnumMember"] && oFieldControl["$EnumMember"].split("/")[1] === "Inapplicable" || oFieldControl["$Path"] && this._isFieldControlPathInapplicable(oFieldControl["$Path"], oAttributes)) {
                  delete oAttributes[element];
                }
              }
            }
          }
        }
      }
      return oAttributes;
    }

    /**
     * Remove the attribute from navigation data if it is a measure.
     *
     * @param aggregates Array of Aggregates
     * @param sProp Attribute name
     * @param oAttributes SemanticAttributes
     */;
    _proto._deleteAggregates = function _deleteAggregates(aggregates, sProp, oAttributes) {
      if (aggregates && aggregates.indexOf(sProp) > -1) {
        delete oAttributes[sProp];
      }
    }

    /**
     * Returns the property annotations.
     *
     * @param sProp
     * @param sMetaPath
     * @param oAttributes
     * @param oMetaModel
     * @returns - The property annotations
     */;
    _proto._getPropertyAnnotations = function _getPropertyAnnotations(sProp, sMetaPath, oAttributes, oMetaModel) {
      if (oAttributes[sProp] && sMetaPath && !sMetaPath.includes("undefined")) {
        var _oFullContext$targetO;
        const oContext = oMetaModel.createBindingContext(`${sMetaPath}/${sProp}`);
        const oFullContext = MetaModelConverter.getInvolvedDataModelObjects(oContext);
        return oFullContext === null || oFullContext === void 0 ? void 0 : (_oFullContext$targetO = oFullContext.targetObject) === null || _oFullContext$targetO === void 0 ? void 0 : _oFullContext$targetO.annotations;
      }
      return null;
    }

    /**
     * Returns the aggregates part of the EntitySet or EntityType.
     *
     * @param sMetaPath
     * @param oView
     * @param oDiagnostics
     * @returns - The aggregates
     */;
    _proto._getAggregates = function _getAggregates(sMetaPath, oView, oDiagnostics) {
      const converterContext = this._getConverterContext(sMetaPath, oView, oDiagnostics);
      const aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext);
      const isAnalyticsSupported = aggregationHelper.isAnalyticsSupported();
      let transAggregations, customAggregates;
      if (isAnalyticsSupported) {
        var _transAggregations, _customAggregates;
        transAggregations = aggregationHelper.getTransAggregations();
        if ((_transAggregations = transAggregations) !== null && _transAggregations !== void 0 && _transAggregations.length) {
          transAggregations = transAggregations.map(transAgg => {
            return transAgg.Name || transAgg.Value;
          });
        }
        customAggregates = aggregationHelper.getCustomAggregateDefinitions();
        if ((_customAggregates = customAggregates) !== null && _customAggregates !== void 0 && _customAggregates.length) {
          customAggregates = customAggregates.map(customAggregate => {
            return customAggregate.qualifier;
          });
        }
      }
      transAggregations = transAggregations ? transAggregations : [];
      customAggregates = customAggregates ? customAggregates : [];
      return {
        transAggregations,
        customAggregates
      };
    }

    /**
     * Returns converterContext.
     *
     * @param sMetaPath
     * @param oView
     * @param oDiagnostics
     * @returns - ConverterContext
     */;
    _proto._getConverterContext = function _getConverterContext(sMetaPath, oView, oDiagnostics) {
      const oViewData = oView.getViewData();
      let sEntitySet = oViewData.entitySet;
      const sContextPath = oViewData.contextPath;
      if (sContextPath && (!sEntitySet || sEntitySet.includes("/"))) {
        sEntitySet = oViewData === null || oViewData === void 0 ? void 0 : oViewData.fullContextPath.split("/")[1];
      }
      return CommonUtils.getConverterContextForPath(sMetaPath, oView.getModel().getMetaModel(), sEntitySet, oDiagnostics);
    }

    /**
     * Check if path-based FieldControl evaluates to inapplicable.
     *
     * @param sFieldControlPath Field control path
     * @param oAttribute SemanticAttributes
     * @returns `true` if inapplicable
     */;
    _proto._isFieldControlPathInapplicable = function _isFieldControlPathInapplicable(sFieldControlPath, oAttribute) {
      let bInapplicable = false;
      const aParts = sFieldControlPath.split("/");
      // sensitive data is removed only if the path has already been resolved.
      if (aParts.length > 1) {
        bInapplicable = oAttribute[aParts[0]] && oAttribute[aParts[0]].hasOwnProperty(aParts[1]) && oAttribute[aParts[0]][aParts[1]] === 0;
      } else {
        bInapplicable = oAttribute[sFieldControlPath] === 0;
      }
      return bInapplicable;
    }

    /**
     * Method to replace Local Properties with Semantic Object mappings.
     *
     * @param oSelectionVariant SelectionVariant consisting of filterbar, Table and Page Context
     * @param vMappings A string representation of semantic object mapping
     * @returns - Modified SelectionVariant with LocalProperty replaced with SemanticObjectProperties.
     */;
    _proto._applySemanticObjectMappings = function _applySemanticObjectMappings(oSelectionVariant, vMappings) {
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

    /**
     * Navigates to an Outbound provided in the manifest.
     *
     * @function
     * @param sOutbound Identifier to location the outbound in the manifest
     * @param mNavigationParameters Optional map containing key/value pairs to be passed to the intent
     * @alias sap.fe.core.controllerextensions.IntentBasedNavigation#navigateOutbound
     * @since 1.86.0
     */;
    _proto.navigateOutbound = function navigateOutbound(sOutbound, mNavigationParameters) {
      var _oManifestEntry$cross, _oManifestEntry$cross2;
      let aNavParams;
      const oManifestEntry = this.base.getAppComponent().getManifestEntry("sap.app"),
        oOutbound = (_oManifestEntry$cross = oManifestEntry.crossNavigation) === null || _oManifestEntry$cross === void 0 ? void 0 : (_oManifestEntry$cross2 = _oManifestEntry$cross.outbounds) === null || _oManifestEntry$cross2 === void 0 ? void 0 : _oManifestEntry$cross2[sOutbound];
      if (!oOutbound) {
        Log.error("Outbound is not defined in manifest!!");
        return;
      }
      const sSemanticObject = oOutbound.semanticObject,
        sAction = oOutbound.action,
        outboundParams = oOutbound.parameters && this.getOutboundParams(oOutbound.parameters);
      if (mNavigationParameters) {
        aNavParams = [];
        Object.keys(mNavigationParameters).forEach(function (key) {
          let oParams;
          if (Array.isArray(mNavigationParameters[key])) {
            const aValues = mNavigationParameters[key];
            for (let i = 0; i < aValues.length; i++) {
              var _aNavParams;
              oParams = {};
              oParams[key] = aValues[i];
              (_aNavParams = aNavParams) === null || _aNavParams === void 0 ? void 0 : _aNavParams.push(oParams);
            }
          } else {
            var _aNavParams2;
            oParams = {};
            oParams[key] = mNavigationParameters[key];
            (_aNavParams2 = aNavParams) === null || _aNavParams2 === void 0 ? void 0 : _aNavParams2.push(oParams);
          }
        });
      }
      if (aNavParams || outboundParams) {
        mNavigationParameters = {
          navigationContexts: {
            data: aNavParams || outboundParams
          }
        };
      }
      this.base._intentBasedNavigation.navigate(sSemanticObject, sAction, mNavigationParameters);
    }

    /**
     * Method to apply outbound parameters defined in the manifest.
     *
     * @param oSelectionVariant SelectionVariant consisting of a filter bar, a table, and a page context
     * @param vOutboundParams Outbound Properties defined in the manifest
     * @returns - The modified SelectionVariant with outbound parameters.
     */;
    _proto._applyOutboundParams = function _applyOutboundParams(oSelectionVariant, vOutboundParams) {
      const aParameters = Object.keys(vOutboundParams);
      const aSelectProperties = oSelectionVariant.getSelectOptionsPropertyNames();
      aParameters.forEach(function (key) {
        if (!aSelectProperties.includes(key)) {
          oSelectionVariant.addSelectOption(key, "I", "EQ", vOutboundParams[key]);
        }
      });
      return oSelectionVariant;
    }

    /**
     * Method to get the outbound parameters defined in the manifest.
     *
     * @function
     * @param oOutboundParams Parameters defined in the outbounds. Only "plain" is supported
     * @returns Parameters with the key-Value pair
     */;
    _proto.getOutboundParams = function getOutboundParams(oOutboundParams) {
      const oParamsMapping = {};
      if (oOutboundParams) {
        const aParameters = Object.keys(oOutboundParams) || [];
        if (aParameters.length > 0) {
          aParameters.forEach(function (key) {
            const oMapping = oOutboundParams[key];
            if (oMapping.value && oMapping.value.value && oMapping.value.format === "plain") {
              if (!oParamsMapping[key]) {
                oParamsMapping[key] = oMapping.value.value;
              }
            }
          });
        }
      }
      return oParamsMapping;
    }

    /**
     * Triggers an outbound navigation when a user chooses the chevron.
     *
     * @param {object} oController
     * @param {string} sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
     * @param {sap.ui.model.odata.v4.Context} oContext The context that contains the data for the target app
     * @param {string} sCreatePath Create path when the chevron is created.
     * @returns {Promise} Promise which is resolved once the navigation is triggered
     */;
    _proto.onChevronPressNavigateOutBound = function onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath) {
      const oOutbounds = oController.getAppComponent().getRoutingService().getOutbounds();
      const oDisplayOutbound = oOutbounds[sOutboundTarget];
      let additionalNavigationParameters;
      if (oDisplayOutbound && oDisplayOutbound.semanticObject && oDisplayOutbound.action) {
        const oRefreshStrategies = {
          intents: {}
        };
        const oDefaultRefreshStrategy = {};
        let sMetaPath;
        if (oContext) {
          if (oContext.isA && oContext.isA("sap.ui.model.odata.v4.Context")) {
            sMetaPath = ModelHelper.getMetaPathForContext(oContext);
            oContext = [oContext];
          } else {
            sMetaPath = ModelHelper.getMetaPathForContext(oContext[0]);
          }
          oDefaultRefreshStrategy[sMetaPath] = "self";
          oRefreshStrategies["_feDefault"] = oDefaultRefreshStrategy;
        }
        if (sCreatePath) {
          const sKey = `${oDisplayOutbound.semanticObject}-${oDisplayOutbound.action}`;
          oRefreshStrategies.intents[sKey] = {};
          oRefreshStrategies.intents[sKey][sCreatePath] = "self";
        }
        if (oDisplayOutbound && oDisplayOutbound.parameters) {
          const oParams = oDisplayOutbound.parameters && this.getOutboundParams(oDisplayOutbound.parameters);
          if (Object.keys(oParams).length > 0) {
            additionalNavigationParameters = oParams;
          }
        }
        oController._intentBasedNavigation.navigate(oDisplayOutbound.semanticObject, oDisplayOutbound.action, {
          navigationContexts: oContext,
          refreshStrategies: oRefreshStrategies,
          additionalNavigationParameters: additionalNavigationParameters
        });

        //TODO: check why returning a promise is required
        return Promise.resolve();
      } else {
        throw new Error(`outbound target ${sOutboundTarget} not found in cross navigation definition of manifest`);
      }
    };
    return InternalIntentBasedNavigation;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigate", [_dec3, _dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "navigate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "prepareContextForExternalNavigation", [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "prepareContextForExternalNavigation"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "prepareFiltersForExternalNavigation", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "prepareFiltersForExternalNavigation"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getNavigationMode", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "getNavigationMode"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateWithConfirmationDialog", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateWithConfirmationDialog"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getEntitySet", [_dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "getEntitySet"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "removeSensitiveData", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "removeSensitiveData"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateOutbound", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateOutbound"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getOutboundParams", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "getOutboundParams"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onChevronPressNavigateOutBound", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "onChevronPressNavigateOutBound"), _class2.prototype)), _class2)) || _class);
  return InternalIntentBasedNavigation;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiIsImRlZmluZVVJNUNsYXNzIiwibWV0aG9kT3ZlcnJpZGUiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkluc3RlYWQiLCJwcml2YXRlRXh0ZW5zaW9uIiwib25Jbml0IiwiX29BcHBDb21wb25lbnQiLCJiYXNlIiwiZ2V0QXBwQ29tcG9uZW50IiwiX29NZXRhTW9kZWwiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsIl9vTmF2aWdhdGlvblNlcnZpY2UiLCJnZXROYXZpZ2F0aW9uU2VydmljZSIsIl9vVmlldyIsImdldFZpZXciLCJuYXZpZ2F0ZSIsInNTZW1hbnRpY09iamVjdCIsInNBY3Rpb24iLCJtTmF2aWdhdGlvblBhcmFtZXRlcnMiLCJfZG9OYXZpZ2F0ZSIsIm9Db250ZXh0Iiwidk5hdmlnYXRpb25Db250ZXh0cyIsIm5hdmlnYXRpb25Db250ZXh0cyIsImFOYXZpZ2F0aW9uQ29udGV4dHMiLCJBcnJheSIsImlzQXJyYXkiLCJ2U2VtYW50aWNPYmplY3RNYXBwaW5nIiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwidk91dGJvdW5kUGFyYW1zIiwiYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzIiwib1RhcmdldEluZm8iLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsIm9WaWV3Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwic2V0QmluZGluZ0NvbnRleHQiLCJhU2VtYW50aWNBdHRyaWJ1dGVzIiwib1NlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3Rpb25WYXJpYW50IiwibGVuZ3RoIiwiZm9yRWFjaCIsIm9OYXZpZ2F0aW9uQ29udGV4dCIsImlzQSIsIm9TZW1hbnRpY0F0dHJpYnV0ZXMiLCJnZXRPYmplY3QiLCJzTWV0YVBhdGgiLCJnZXRNZXRhUGF0aCIsImdldFBhdGgiLCJyZW1vdmVTZW5zaXRpdmVEYXRhIiwib05hdkNvbnRleHQiLCJwcmVwYXJlQ29udGV4dEZvckV4dGVybmFsTmF2aWdhdGlvbiIsInByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QiLCJwdXNoIiwic2VtYW50aWNBdHRyaWJ1dGVzIiwiZGF0YSIsIm1ldGFQYXRoIiwibWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQiLCJ0b0pTT05TdHJpbmciLCJvTW9kZWwiLCJzRW50aXR5U2V0IiwiZ2V0RW50aXR5U2V0Iiwic0NvbnRleHRVcmwiLCJjb25zdHJ1Y3RDb250ZXh0VXJsIiwidW5kZWZpbmVkIiwic2V0RmlsdGVyQ29udGV4dFVybCIsIl9hcHBseU91dGJvdW5kUGFyYW1zIiwiaW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiYWRhcHROYXZpZ2F0aW9uQ29udGV4dCIsIl9hcHBseVNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJfcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyIsInNOYXZNb2RlIiwiX2ludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldE5hdmlnYXRpb25Nb2RlIiwibVJlZnJlc2hTdHJhdGVnaWVzIiwicmVmcmVzaFN0cmF0ZWdpZXMiLCJvSW50ZXJuYWxNb2RlbCIsImdldFZpZXdEYXRhIiwicmVmcmVzaFN0cmF0ZWd5T25BcHBSZXN0b3JlIiwibVZpZXdSZWZyZXNoU3RyYXRlZ2llcyIsIm1lcmdlT2JqZWN0cyIsIm1SZWZyZXNoU3RyYXRlZ3kiLCJLZWVwQWxpdmVIZWxwZXIiLCJnZXRSZWZyZXNoU3RyYXRlZ3lGb3JJbnRlbnQiLCJzZXRQcm9wZXJ0eSIsIm9uRXJyb3IiLCJzYXAiLCJ1aSIsInJlcXVpcmUiLCJNZXNzYWdlQm94Iiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImVycm9yIiwiZ2V0VGV4dCIsInRpdGxlIiwiRXJyb3IiLCJvQmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIm9NZXRhTW9kZWwiLCJjb252ZXJ0ZXJUeXBlIiwiTW9kZWxIZWxwZXIiLCJpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJkcmFmdCIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiYmluZCIsIkZ1bmN0aW9uIiwicHJvdG90eXBlIiwiTmF2aWdhdGlvblR5cGUiLCJGb3J3YXJkTmF2aWdhdGlvbiIsIm9EaXN0aW5jdEtleXMiLCJzQ29udGV4dFBhdGgiLCJhTWV0YVBhdGhQYXJ0cyIsInNwbGl0IiwiZmlsdGVyIiwiQm9vbGVhbiIsIl9maW5kRGlzdGluY3RLZXlzSW5PYmplY3QiLCJMb29rVXBPYmplY3QiLCJzTG9va1VwT2JqZWN0TWV0YVBhdGgiLCJzS2V5Iiwib05ld0xvb2tVcE9iamVjdCIsInNNYWluRW50aXR5U2V0TmFtZSIsInNNYWluRW50aXR5VHlwZU5hbWUiLCJvUHJvcGVydGllc1dpdGhvdXRDb25mbGljdCIsInNNYWluRW50aXR5VmFsdWVQYXRoIiwic0N1cnJlbnRWYWx1ZVBhdGgiLCJzTGFzdFZhbHVlUGF0aCIsInNEaXN0aW5jdEtleSIsImFDb25mbGljdGluZ1BhdGhzIiwic1dpbm5lclZhbHVlUGF0aCIsImkiLCJzUGF0aCIsInNQYXRoSW5Db250ZXh0IiwicmVwbGFjZSIsInNFbnRpdHlUeXBlTmFtZSIsInNWYWx1ZSIsImpvaW4iLCJnZXRQcm9wZXJ0eSIsInNQcm9wZXJ0eSIsInByZXBhcmVGaWx0ZXJzRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uIiwib0ZpbHRlckJhckNvbmRpdGlvbnMiLCJzUm9vdFBhdGgiLCJhUGFyYW1ldGVycyIsIm9GaWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0Iiwic0Z1bGxDb250ZXh0UGF0aCIsImtleUluQ29udGV4dCIsImluY2x1ZGVzIiwiYVBhdGhQYXJ0cyIsInJlcGxhY2VBbGwiLCJmaWx0ZXJDb25kaXRpb25zIiwiZmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdCIsIm5hdmlnYXRlV2l0aENvbmZpcm1hdGlvbkRpYWxvZyIsInNob3VsZENvbnRpbnVlIiwibm90QXBwbGljYWJsZUNvbnRleHRzIiwibWV0YU1vZGVsIiwiZW50aXR5U2V0UGF0aCIsImNvbnZlcnRlZE1ldGFkYXRhIiwiY29udmVydFR5cGVzIiwiZW50aXR5U2V0IiwicmVzb2x2ZVBhdGgiLCJ0YXJnZXQiLCJub3RBcHBsaWNhYmxlQ29udGV4dHNEaWFsb2ciLCJOb3RBcHBsaWNhYmxlQ29udGV4dERpYWxvZyIsImVudGl0eVR5cGUiLCJyZXNvdXJjZU1vZGVsIiwiZ2V0UmVzb3VyY2VNb2RlbCIsImFwcGxpY2FibGVDb250ZXh0cyIsIm9wZW4iLCJyZW1vdmVTZWxlY3RPcHRpb24iLCJvQXR0cmlidXRlcyIsInRyYW5zQWdncmVnYXRpb25zIiwiY3VzdG9tQWdncmVnYXRlcyIsIl9nZXRBZ2dyZWdhdGVzIiwiZ2V0RGlhZ25vc3RpY3MiLCJhUHJvcGVydGllcyIsIk9iamVjdCIsImtleXMiLCJlbGVtZW50IiwiaW5kZXhPZiIsIl9kZWxldGVBZ2dyZWdhdGVzIiwiYVByb3BlcnR5QW5ub3RhdGlvbnMiLCJfZ2V0UHJvcGVydHlBbm5vdGF0aW9ucyIsIlBlcnNvbmFsRGF0YSIsIklzUG90ZW50aWFsbHlTZW5zaXRpdmUiLCJVSSIsIkV4Y2x1ZGVGcm9tTmF2aWdhdGlvbkNvbnRleHQiLCJBbmFseXRpY3MiLCJNZWFzdXJlIiwiQ29tbW9uIiwiRmllbGRDb250cm9sIiwib0ZpZWxkQ29udHJvbCIsIl9pc0ZpZWxkQ29udHJvbFBhdGhJbmFwcGxpY2FibGUiLCJhZ2dyZWdhdGVzIiwic1Byb3AiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsIm9GdWxsQ29udGV4dCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsInRhcmdldE9iamVjdCIsImFubm90YXRpb25zIiwib0RpYWdub3N0aWNzIiwiY29udmVydGVyQ29udGV4dCIsIl9nZXRDb252ZXJ0ZXJDb250ZXh0IiwiYWdncmVnYXRpb25IZWxwZXIiLCJBZ2dyZWdhdGlvbkhlbHBlciIsImdldEVudGl0eVR5cGUiLCJpc0FuYWx5dGljc1N1cHBvcnRlZCIsImdldFRyYW5zQWdncmVnYXRpb25zIiwibWFwIiwidHJhbnNBZ2ciLCJOYW1lIiwiVmFsdWUiLCJnZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucyIsImN1c3RvbUFnZ3JlZ2F0ZSIsInF1YWxpZmllciIsIm9WaWV3RGF0YSIsImNvbnRleHRQYXRoIiwiZnVsbENvbnRleHRQYXRoIiwiQ29tbW9uVXRpbHMiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Rm9yUGF0aCIsInNGaWVsZENvbnRyb2xQYXRoIiwib0F0dHJpYnV0ZSIsImJJbmFwcGxpY2FibGUiLCJhUGFydHMiLCJoYXNPd25Qcm9wZXJ0eSIsInZNYXBwaW5ncyIsIm9NYXBwaW5ncyIsIkpTT04iLCJwYXJzZSIsInNMb2NhbFByb3BlcnR5Iiwic1NlbWFudGljT2JqZWN0UHJvcGVydHkiLCJvU2VsZWN0T3B0aW9uIiwiZ2V0U2VsZWN0T3B0aW9uIiwibWFzc0FkZFNlbGVjdE9wdGlvbiIsIm5hdmlnYXRlT3V0Ym91bmQiLCJzT3V0Ym91bmQiLCJhTmF2UGFyYW1zIiwib01hbmlmZXN0RW50cnkiLCJnZXRNYW5pZmVzdEVudHJ5Iiwib091dGJvdW5kIiwiY3Jvc3NOYXZpZ2F0aW9uIiwib3V0Ym91bmRzIiwiTG9nIiwib3V0Ym91bmRQYXJhbXMiLCJwYXJhbWV0ZXJzIiwiZ2V0T3V0Ym91bmRQYXJhbXMiLCJrZXkiLCJvUGFyYW1zIiwiYVZhbHVlcyIsImFTZWxlY3RQcm9wZXJ0aWVzIiwiZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMiLCJhZGRTZWxlY3RPcHRpb24iLCJvT3V0Ym91bmRQYXJhbXMiLCJvUGFyYW1zTWFwcGluZyIsIm9NYXBwaW5nIiwidmFsdWUiLCJmb3JtYXQiLCJvbkNoZXZyb25QcmVzc05hdmlnYXRlT3V0Qm91bmQiLCJzT3V0Ym91bmRUYXJnZXQiLCJzQ3JlYXRlUGF0aCIsIm9PdXRib3VuZHMiLCJnZXRSb3V0aW5nU2VydmljZSIsImdldE91dGJvdW5kcyIsIm9EaXNwbGF5T3V0Ym91bmQiLCJvUmVmcmVzaFN0cmF0ZWdpZXMiLCJpbnRlbnRzIiwib0RlZmF1bHRSZWZyZXNoU3RyYXRlZ3kiLCJnZXRNZXRhUGF0aEZvckNvbnRleHQiLCJQcm9taXNlIiwicmVzb2x2ZSIsIkNvbnRyb2xsZXJFeHRlbnNpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudGl0eVNldCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eUFubm90YXRpb25zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9FZG1fVHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IG1lcmdlT2JqZWN0cyBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCB7IEZFVmlldyB9IGZyb20gXCJzYXAvZmUvY29yZS9CYXNlQ29udHJvbGxlclwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IGRyYWZ0IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9kcmFmdFwiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgY29udmVydFR5cGVzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQge1xuXHRkZWZpbmVVSTVDbGFzcyxcblx0ZXh0ZW5zaWJsZSxcblx0ZmluYWxFeHRlbnNpb24sXG5cdG1ldGhvZE92ZXJyaWRlLFxuXHRwcml2YXRlRXh0ZW5zaW9uLFxuXHRwdWJsaWNFeHRlbnNpb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgS2VlcEFsaXZlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0tlZXBBbGl2ZUhlbHBlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRSZXNvdXJjZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUmVzb3VyY2VNb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSB7IE5hdmlnYXRpb25TZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL05hdmlnYXRpb25TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgRGlhZ25vc3RpY3MgZnJvbSBcInNhcC9mZS9jb3JlL3N1cHBvcnQvRGlhZ25vc3RpY3NcIjtcbmltcG9ydCBTZWxlY3Rpb25WYXJpYW50IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YVY0Q29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB7IEFnZ3JlZ2F0aW9uSGVscGVyIH0gZnJvbSBcIi4uL2NvbnZlcnRlcnMvaGVscGVycy9BZ2dyZWdhdGlvblwiO1xuaW1wb3J0IE5vdEFwcGxpY2FibGVDb250ZXh0RGlhbG9nIGZyb20gXCIuL2VkaXRGbG93L05vdEFwcGxpY2FibGVDb250ZXh0RGlhbG9nXCI7XG5cbi8qKlxuICogTmF2aWdhdGlvbiBQYXJhbWV0ZXJzIHVzZWQgZHVyaW5nIG5hdmlnYXRpb25cbiAqL1xuZXhwb3J0IHR5cGUgTmF2aWdhdGlvblBhcmFtZXRlcnMgPSB7XG5cdC8qKlxuXHQgKiBTaW5nbGUgaW5zdGFuY2Ugb3IgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHtAbGluayBzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0sIG9yIGFsdGVybmF0aXZlbHkgYW4gb2JqZWN0IG9yIGFycmF5IG9mIG9iamVjdHMsIHRvIGJlIHBhc3NlZCB0byB0aGUgaW50ZW50LlxuXHQgKi9cblx0bmF2aWdhdGlvbkNvbnRleHRzPzogb2JqZWN0IHwgYW55W10gfCB1bmRlZmluZWQ7XG5cdC8qKlxuXHQgKiBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgU2VtYW50aWNPYmplY3RNYXBwaW5nIG9yIFNlbWFudGljT2JqZWN0TWFwcGluZyB0aGF0IGFwcGxpZXMgdG8gdGhpcyBuYXZpZ2F0aW9uLlxuXHQgKi9cblx0c2VtYW50aWNPYmplY3RNYXBwaW5nPzogc3RyaW5nIHwgb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRkZWZhdWx0UmVmcmVzaFN0cmF0ZWd5Pzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRyZWZyZXNoU3RyYXRlZ2llcz86IGFueTtcblx0YWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzPzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHQvKipcblx0ICogU2luZ2xlIGluc3RhbmNlIG9yIG11bHRpcGxlIGluc3RhbmNlcyBvZiB7QGxpbmsgc2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9LCBvciBhbHRlcm5hdGl2ZWx5IGFuIG9iamVjdCBvciBhcnJheSBvZiBvYmplY3RzLCB0byBiZSBwYXNzZWQgdG8gdGhlIGludGVudCBhbmQgZm9yIHdoaWNoIHRoZSBJQk4gYnV0dG9uIGlzIGVuYWJsZWRcblx0ICovXG5cdGFwcGxpY2FibGVDb250ZXh0cz86IG9iamVjdCB8IGFueVtdO1xuXHQvKipcblx0ICogU2luZ2xlIGluc3RhbmNlIG9yIG11bHRpcGxlIGluc3RhbmNlcyBvZiB7QGxpbmsgc2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9LCBvciBhbHRlcm5hdGl2ZWx5IGFuIG9iamVjdCBvciBhcnJheSBvZiBvYmplY3RzLCB3aGljaCBjYW5ub3QgYmUgcGFzc2VkIHRvIHRoZSBpbnRlbnQuXG5cdCAqIFx0aWYgYW4gYXJyYXkgb2YgY29udGV4dHMgaXMgcGFzc2VkIHRoZSBjb250ZXh0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZXRhIHBhdGggYW5kIGFjY29yZGluZ2x5IHJlbW92ZSB0aGUgc2Vuc2l0aXZlIGRhdGFcblx0ICogSWYgYW4gYXJyYXkgb2Ygb2JqZWN0cyBpcyBwYXNzZWQsIHRoZSBmb2xsb3dpbmcgZm9ybWF0IGlzIGV4cGVjdGVkOlxuXHQgKiB7XG5cdCAqIFx0ZGF0YToge1xuXHQgKiBcdFx0UHJvZHVjdElEOiA3NjM0LFxuXHQgKiBcdFx0XHROYW1lOiBcIkxhcHRvcFwiXG5cdCAqIFx0fSxcblx0ICogXHRtZXRhUGF0aDogXCIvU2FsZXNPcmRlck1hbmFnZVwiXG5cdCAqIH1cblx0ICogVGhlIG1ldGFQYXRoIGlzIHVzZWQgdG8gcmVtb3ZlIGFueSBzZW5zaXRpdmUgZGF0YS5cblx0ICovXG5cdG5vdEFwcGxpY2FibGVDb250ZXh0cz86IGFueTtcblxuXHRsYWJlbD86IHN0cmluZztcbn07XG4vKipcbiAqIHtAbGluayBzYXAudWkuY29yZS5tdmMuQ29udHJvbGxlckV4dGVuc2lvbiBDb250cm9sbGVyIGV4dGVuc2lvbn1cbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuSW50ZXJuYWxJbnRlcm5hbEJhc2VkTmF2aWdhdGlvblxuICogQHByaXZhdGVcbiAqIEBzaW5jZSAxLjg0LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuSW50ZXJuYWxJbnRlcm5hbEJhc2VkTmF2aWdhdGlvblwiKVxuY2xhc3MgSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24gZXh0ZW5kcyBDb250cm9sbGVyRXh0ZW5zaW9uIHtcblx0cHJvdGVjdGVkIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblxuXHRwcml2YXRlIF9vQXBwQ29tcG9uZW50ITogQXBwQ29tcG9uZW50O1xuXG5cdHByaXZhdGUgX29NZXRhTW9kZWwhOiBPRGF0YU1ldGFNb2RlbDtcblxuXHRwcml2YXRlIF9vTmF2aWdhdGlvblNlcnZpY2UhOiBOYXZpZ2F0aW9uU2VydmljZTtcblxuXHRwcml2YXRlIF9vVmlldyE6IFZpZXc7XG5cblx0QG1ldGhvZE92ZXJyaWRlKClcblx0b25Jbml0KCkge1xuXHRcdHRoaXMuX29BcHBDb21wb25lbnQgPSB0aGlzLmJhc2UuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0dGhpcy5fb01ldGFNb2RlbCA9IHRoaXMuX29BcHBDb21wb25lbnQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHR0aGlzLl9vTmF2aWdhdGlvblNlcnZpY2UgPSB0aGlzLl9vQXBwQ29tcG9uZW50LmdldE5hdmlnYXRpb25TZXJ2aWNlKCk7XG5cdFx0dGhpcy5fb1ZpZXcgPSB0aGlzLmJhc2UuZ2V0VmlldygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVuYWJsZXMgaW50ZW50LWJhc2VkIG5hdmlnYXRpb24gKFNlbWFudGljT2JqZWN0LUFjdGlvbikgd2l0aCB0aGUgcHJvdmlkZWQgY29udGV4dC5cblx0ICogSWYgc2VtYW50aWMgb2JqZWN0IG1hcHBpbmcgaXMgcHJvdmlkZWQsIHRoaXMgaXMgYWxzbyBhcHBsaWVkIHRvIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBhZnRlciB0aGUgYWRhcHRhdGlvbiBieSBhIGNvbnN1bWVyLlxuXHQgKiBUaGlzIHRha2VzIGNhcmUgb2YgcmVtb3ZpbmcgYW55IHRlY2huaWNhbCBwYXJhbWV0ZXJzIGFuZCBkZXRlcm1pbmVzIGlmIGFuIGV4cGxhY2Ugb3IgaW5wbGFjZSBuYXZpZ2F0aW9uIHNob3VsZCB0YWtlIHBsYWNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1NlbWFudGljT2JqZWN0IFNlbWFudGljIG9iamVjdCBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIHNBY3Rpb24gIEFjdGlvbiBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnNdIE9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBleHRlcm5hbCBuYXZpZ2F0aW9uXG5cdCAqIEBwYXJhbSBbbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5hdmlnYXRpb25Db250ZXh0c10gVXNlcyBvbmUgb2YgdGhlIGZvbGxvd2luZyB0byBiZSBwYXNzZWQgdG8gdGhlIGludGVudDpcblx0ICogICAgYSBzaW5nbGUgaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fVxuXHQgKiAgICBtdWx0aXBsZSBpbnN0YW5jZXMgb2Yge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fVxuXHQgKiAgICBhbiBvYmplY3Qgb3IgYW4gYXJyYXkgb2Ygb2JqZWN0c1xuXHQgKlx0XHQgIElmIGFuIGFycmF5IG9mIG9iamVjdHMgaXMgcGFzc2VkLCB0aGUgY29udGV4dCBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWV0YVBhdGggYW5kIHRvIHJlbW92ZSBhbnkgc2Vuc2l0aXZlIGRhdGFcblx0ICpcdFx0ICBJZiBhbiBhcnJheSBvZiBvYmplY3RzIGlzIHBhc3NlZCwgdGhlIGZvbGxvd2luZyBmb3JtYXQgaXggZXhwZWN0ZWQ6XG5cdCAqXHRcdCAge1xuXHQgKlx0XHRcdGRhdGE6IHtcblx0ICpcdCBcdFx0XHRQcm9kdWN0SUQ6IDc2MzQsXG5cdCAqXHRcdFx0XHROYW1lOiBcIkxhcHRvcFwiXG5cdCAqXHRcdFx0IH0sXG5cdCAqXHRcdFx0IG1ldGFQYXRoOiBcIi9TYWxlc09yZGVyTWFuYWdlXCJcblx0ICogICAgICAgIH1cblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnMuc2VtYW50aWNPYmplY3RNYXBwaW5nXSBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIFNlbWFudGljT2JqZWN0TWFwcGluZyBvciBTZW1hbnRpY09iamVjdE1hcHBpbmcgdGhhdCBhcHBsaWVzIHRvIHRoaXMgbmF2aWdhdGlvblxuXHQgKiBAcGFyYW0gW21OYXZpZ2F0aW9uUGFyYW1ldGVycy5kZWZhdWx0UmVmcmVzaFN0cmF0ZWd5XSBEZWZhdWx0IHJlZnJlc2ggc3RyYXRlZ3kgdG8gYmUgdXNlZCBpbiBjYXNlIG5vIHJlZnJlc2ggc3RyYXRlZ3kgaXMgc3BlY2lmaWVkIGZvciB0aGUgaW50ZW50IGluIHRoZSB2aWV3LlxuXHQgKiBAcGFyYW0gW21OYXZpZ2F0aW9uUGFyYW1ldGVycy5yZWZyZXNoU3RyYXRlZ2llc11cblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnMuYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzXSBBZGRpdGlvbmFsIG5hdmlnYXRpb24gcGFyYW1ldGVycyBjb25maWd1cmVkIGluIHRoZSBjcm9zc0FwcE5hdmlnYXRpb24gb3V0Ym91bmQgcGFyYW1ldGVycy5cblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZShzU2VtYW50aWNPYmplY3Q6IHN0cmluZywgc0FjdGlvbjogc3RyaW5nLCBtTmF2aWdhdGlvblBhcmFtZXRlcnM6IE5hdmlnYXRpb25QYXJhbWV0ZXJzIHwgdW5kZWZpbmVkKSB7XG5cdFx0Y29uc3QgX2RvTmF2aWdhdGUgPSAob0NvbnRleHQ/OiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IHZOYXZpZ2F0aW9uQ29udGV4dHMgPSBtTmF2aWdhdGlvblBhcmFtZXRlcnMgJiYgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5hdmlnYXRpb25Db250ZXh0cyxcblx0XHRcdFx0YU5hdmlnYXRpb25Db250ZXh0cyA9XG5cdFx0XHRcdFx0dk5hdmlnYXRpb25Db250ZXh0cyAmJiAhQXJyYXkuaXNBcnJheSh2TmF2aWdhdGlvbkNvbnRleHRzKSA/IFt2TmF2aWdhdGlvbkNvbnRleHRzXSA6IHZOYXZpZ2F0aW9uQ29udGV4dHMsXG5cdFx0XHRcdHZTZW1hbnRpY09iamVjdE1hcHBpbmcgPSBtTmF2aWdhdGlvblBhcmFtZXRlcnMgJiYgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLnNlbWFudGljT2JqZWN0TWFwcGluZyxcblx0XHRcdFx0dk91dGJvdW5kUGFyYW1zID0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzICYmIG1OYXZpZ2F0aW9uUGFyYW1ldGVycy5hZGRpdGlvbmFsTmF2aWdhdGlvblBhcmFtZXRlcnMsXG5cdFx0XHRcdG9UYXJnZXRJbmZvOiBhbnkgPSB7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IHNTZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRhY3Rpb246IHNBY3Rpb25cblx0XHRcdFx0fSxcblx0XHRcdFx0b1ZpZXcgPSB0aGlzLmJhc2UuZ2V0VmlldygpLFxuXHRcdFx0XHRvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcjtcblxuXHRcdFx0aWYgKG9Db250ZXh0KSB7XG5cdFx0XHRcdHRoaXMuX29WaWV3LnNldEJpbmRpbmdDb250ZXh0KG9Db250ZXh0KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHNTZW1hbnRpY09iamVjdCAmJiBzQWN0aW9uKSB7XG5cdFx0XHRcdGxldCBhU2VtYW50aWNBdHRyaWJ1dGVzOiBhbnlbXSA9IFtdLFxuXHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50OiBhbnkgPSBuZXcgU2VsZWN0aW9uVmFyaWFudCgpO1xuXHRcdFx0XHQvLyAxLiBnZXQgU2VtYW50aWNBdHRyaWJ1dGVzIGZvciBuYXZpZ2F0aW9uXG5cdFx0XHRcdGlmIChhTmF2aWdhdGlvbkNvbnRleHRzICYmIGFOYXZpZ2F0aW9uQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0YU5hdmlnYXRpb25Db250ZXh0cy5mb3JFYWNoKChvTmF2aWdhdGlvbkNvbnRleHQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0Ly8gMS4xLmEgaWYgbmF2aWdhdGlvbiBjb250ZXh0IGlzIGluc3RhbmNlIG9mIHNhcC51aS5tb2RlLm9kYXRhLnY0LkNvbnRleHRcblx0XHRcdFx0XHRcdC8vIGVsc2UgY2hlY2sgaWYgbmF2aWdhdGlvbiBjb250ZXh0IGlzIG9mIHR5cGUgb2JqZWN0XG5cdFx0XHRcdFx0XHRpZiAob05hdmlnYXRpb25Db250ZXh0LmlzQSAmJiBvTmF2aWdhdGlvbkNvbnRleHQuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHRcIikpIHtcblx0XHRcdFx0XHRcdFx0Ly8gMS4xLmIgcmVtb3ZlIHNlbnNpdGl2ZSBkYXRhXG5cdFx0XHRcdFx0XHRcdGxldCBvU2VtYW50aWNBdHRyaWJ1dGVzID0gb05hdmlnYXRpb25Db250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzTWV0YVBhdGggPSB0aGlzLl9vTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9OYXZpZ2F0aW9uQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0XHRcdFx0XHQvLyBUT0RPOiBhbHNvIHJlbW92ZSBzZW5zaXRpdmUgZGF0YSBmcm9tICBuYXZpZ2F0aW9uIHByb3BlcnRpZXNcblx0XHRcdFx0XHRcdFx0b1NlbWFudGljQXR0cmlidXRlcyA9IHRoaXMucmVtb3ZlU2Vuc2l0aXZlRGF0YShvU2VtYW50aWNBdHRyaWJ1dGVzLCBzTWV0YVBhdGgpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvTmF2Q29udGV4dCA9IHRoaXMucHJlcGFyZUNvbnRleHRGb3JFeHRlcm5hbE5hdmlnYXRpb24ob1NlbWFudGljQXR0cmlidXRlcywgb05hdmlnYXRpb25Db250ZXh0KTtcblx0XHRcdFx0XHRcdFx0b1RhcmdldEluZm9bXCJwcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0XCJdID0gb05hdkNvbnRleHQucHJvcGVydGllc1dpdGhvdXRDb25mbGljdDtcblx0XHRcdFx0XHRcdFx0YVNlbWFudGljQXR0cmlidXRlcy5wdXNoKG9OYXZDb250ZXh0LnNlbWFudGljQXR0cmlidXRlcyk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0XHQhKG9OYXZpZ2F0aW9uQ29udGV4dCAmJiBBcnJheS5pc0FycmF5KG9OYXZpZ2F0aW9uQ29udGV4dC5kYXRhKSkgJiZcblx0XHRcdFx0XHRcdFx0dHlwZW9mIG9OYXZpZ2F0aW9uQ29udGV4dCA9PT0gXCJvYmplY3RcIlxuXHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdC8vIDEuMS5iIHJlbW92ZSBzZW5zaXRpdmUgZGF0YSBmcm9tIG9iamVjdFxuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNBdHRyaWJ1dGVzLnB1c2godGhpcy5yZW1vdmVTZW5zaXRpdmVEYXRhKG9OYXZpZ2F0aW9uQ29udGV4dC5kYXRhLCBvTmF2aWdhdGlvbkNvbnRleHQubWV0YVBhdGgpKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAob05hdmlnYXRpb25Db250ZXh0ICYmIEFycmF5LmlzQXJyYXkob05hdmlnYXRpb25Db250ZXh0LmRhdGEpKSB7XG5cdFx0XHRcdFx0XHRcdC8vIG9OYXZpZ2F0aW9uQ29udGV4dC5kYXRhIGNhbiBiZSBhcnJheSBhbHJlYWR5IGV4IDogW3tDdXN0b21lcjogXCIxMDAwMVwifSwge0N1c3RvbWVyOiBcIjEwMDkxXCJ9XVxuXHRcdFx0XHRcdFx0XHQvLyBoZW5jZSBhc3NpZ25pbmcgaXQgdG8gdGhlIGFTZW1hbnRpY0F0dHJpYnV0ZXNcblx0XHRcdFx0XHRcdFx0YVNlbWFudGljQXR0cmlidXRlcyA9IHRoaXMucmVtb3ZlU2Vuc2l0aXZlRGF0YShvTmF2aWdhdGlvbkNvbnRleHQuZGF0YSwgb05hdmlnYXRpb25Db250ZXh0Lm1ldGFQYXRoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyAyLjEgTWVyZ2UgYmFzZSBzZWxlY3Rpb24gdmFyaWFudCBhbmQgc2FuaXRpemVkIHNlbWFudGljIGF0dHJpYnV0ZXMgaW50byBvbmUgU2VsZWN0aW9uVmFyaWFudFxuXHRcdFx0XHRpZiAoYVNlbWFudGljQXR0cmlidXRlcyAmJiBhU2VtYW50aWNBdHRyaWJ1dGVzLmxlbmd0aCkge1xuXHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50ID0gdGhpcy5fb05hdmlnYXRpb25TZXJ2aWNlLm1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50KFxuXHRcdFx0XHRcdFx0YVNlbWFudGljQXR0cmlidXRlcyxcblx0XHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LnRvSlNPTlN0cmluZygpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIDMuIEFkZCBmaWx0ZXJDb250ZXh0VXJsIHRvIFNWIHNvIHRoZSBOYXZpZ2F0aW9uSGFuZGxlciBjYW4gcmVtb3ZlIGFueSBzZW5zaXRpdmUgZGF0YSBiYXNlZCBvbiB2aWV3IGVudGl0eVNldFxuXHRcdFx0XHRjb25zdCBvTW9kZWwgPSB0aGlzLl9vVmlldy5nZXRNb2RlbCgpLFxuXHRcdFx0XHRcdHNFbnRpdHlTZXQgPSB0aGlzLmdldEVudGl0eVNldCgpLFxuXHRcdFx0XHRcdHNDb250ZXh0VXJsID0gc0VudGl0eVNldCA/IHRoaXMuX29OYXZpZ2F0aW9uU2VydmljZS5jb25zdHJ1Y3RDb250ZXh0VXJsKHNFbnRpdHlTZXQsIG9Nb2RlbCkgOiB1bmRlZmluZWQ7XG5cdFx0XHRcdGlmIChzQ29udGV4dFVybCkge1xuXHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LnNldEZpbHRlckNvbnRleHRVcmwoc0NvbnRleHRVcmwpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQXBwbHkgT3V0Ym91bmQgUGFyYW1ldGVycyB0byB0aGUgU1Zcblx0XHRcdFx0aWYgKHZPdXRib3VuZFBhcmFtcykge1xuXHRcdFx0XHRcdHRoaXMuX2FwcGx5T3V0Ym91bmRQYXJhbXMob1NlbGVjdGlvblZhcmlhbnQsIHZPdXRib3VuZFBhcmFtcyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyA0LiBnaXZlIGFuIG9wcG9ydHVuaXR5IGZvciB0aGUgYXBwbGljYXRpb24gdG8gaW5mbHVlbmNlIHRoZSBTZWxlY3Rpb25WYXJpYW50XG5cdFx0XHRcdG9Db250cm9sbGVyLmludGVudEJhc2VkTmF2aWdhdGlvbi5hZGFwdE5hdmlnYXRpb25Db250ZXh0KG9TZWxlY3Rpb25WYXJpYW50LCBvVGFyZ2V0SW5mbyk7XG5cblx0XHRcdFx0Ly8gNS4gQXBwbHkgc2VtYW50aWMgb2JqZWN0IG1hcHBpbmdzIHRvIHRoZSBTVlxuXHRcdFx0XHRpZiAodlNlbWFudGljT2JqZWN0TWFwcGluZykge1xuXHRcdFx0XHRcdHRoaXMuX2FwcGx5U2VtYW50aWNPYmplY3RNYXBwaW5ncyhvU2VsZWN0aW9uVmFyaWFudCwgdlNlbWFudGljT2JqZWN0TWFwcGluZyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyA2LiByZW1vdmUgdGVjaG5pY2FsIHBhcmFtZXRlcnMgZnJvbSBTZWxlY3Rpb24gVmFyaWFudFxuXHRcdFx0XHR0aGlzLl9yZW1vdmVUZWNobmljYWxQYXJhbWV0ZXJzKG9TZWxlY3Rpb25WYXJpYW50KTtcblxuXHRcdFx0XHQvLyA3LiBjaGVjayBpZiBwcm9ncmFtbWluZyBtb2RlbCBpcyBzdGlja3kgYW5kIHBhZ2UgaXMgZWRpdGFibGVcblx0XHRcdFx0Y29uc3Qgc05hdk1vZGUgPSBvQ29udHJvbGxlci5faW50ZW50QmFzZWROYXZpZ2F0aW9uLmdldE5hdmlnYXRpb25Nb2RlKCk7XG5cblx0XHRcdFx0Ly8gOC4gVXBkYXRpbmcgcmVmcmVzaCBzdHJhdGVneSBpbiBpbnRlcm5hbCBtb2RlbFxuXHRcdFx0XHRjb25zdCBtUmVmcmVzaFN0cmF0ZWdpZXMgPSAobU5hdmlnYXRpb25QYXJhbWV0ZXJzICYmIG1OYXZpZ2F0aW9uUGFyYW1ldGVycy5yZWZyZXNoU3RyYXRlZ2llcykgfHwge30sXG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWwgPSBvVmlldy5nZXRNb2RlbChcImludGVybmFsXCIpO1xuXHRcdFx0XHRpZiAob0ludGVybmFsTW9kZWwpIHtcblx0XHRcdFx0XHRpZiAoKG9WaWV3ICYmIChvVmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSkpLnJlZnJlc2hTdHJhdGVneU9uQXBwUmVzdG9yZSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgbVZpZXdSZWZyZXNoU3RyYXRlZ2llcyA9IChvVmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSkucmVmcmVzaFN0cmF0ZWd5T25BcHBSZXN0b3JlIHx8IHt9O1xuXHRcdFx0XHRcdFx0bWVyZ2VPYmplY3RzKG1SZWZyZXNoU3RyYXRlZ2llcywgbVZpZXdSZWZyZXNoU3RyYXRlZ2llcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IG1SZWZyZXNoU3RyYXRlZ3kgPSBLZWVwQWxpdmVIZWxwZXIuZ2V0UmVmcmVzaFN0cmF0ZWd5Rm9ySW50ZW50KG1SZWZyZXNoU3RyYXRlZ2llcywgc1NlbWFudGljT2JqZWN0LCBzQWN0aW9uKTtcblx0XHRcdFx0XHRpZiAobVJlZnJlc2hTdHJhdGVneSkge1xuXHRcdFx0XHRcdFx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvcmVmcmVzaFN0cmF0ZWd5T25BcHBSZXN0b3JlXCIsIG1SZWZyZXNoU3RyYXRlZ3kpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIDkuIE5hdmlnYXRlIHZpYSBOYXZpZ2F0aW9uSGFuZGxlclxuXHRcdFx0XHRjb25zdCBvbkVycm9yID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHNhcC51aS5yZXF1aXJlKFtcInNhcC9tL01lc3NhZ2VCb3hcIl0sIGZ1bmN0aW9uIChNZXNzYWdlQm94OiBhbnkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0XHRcdFx0XHRNZXNzYWdlQm94LmVycm9yKG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fSEVMUEVSX05BVklHQVRJT05fRVJST1JfTUVTU0FHRVwiKSwge1xuXHRcdFx0XHRcdFx0XHR0aXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9FUlJPUlwiKVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHRoaXMuX29OYXZpZ2F0aW9uU2VydmljZS5uYXZpZ2F0ZShcblx0XHRcdFx0XHRzU2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0c0FjdGlvbixcblx0XHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC50b0pTT05TdHJpbmcoKSxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0b25FcnJvcixcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0c05hdk1vZGVcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlNlbWFudGljIE9iamVjdC9hY3Rpb24gaXMgbm90IHByb3ZpZGVkXCIpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Y29uc3Qgb0JpbmRpbmdDb250ZXh0ID0gdGhpcy5iYXNlLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQmluZGluZ0NvbnRleHQgJiYgKG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0XHRpZiAoXG5cdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmNvbnZlcnRlclR5cGUgPT09IFwiT2JqZWN0UGFnZVwiICYmXG5cdFx0XHRvTWV0YU1vZGVsICYmXG5cdFx0XHQhTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKG9NZXRhTW9kZWwpXG5cdFx0KSB7XG5cdFx0XHRkcmFmdC5wcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbihcblx0XHRcdFx0X2RvTmF2aWdhdGUuYmluZCh0aGlzKSxcblx0XHRcdFx0RnVuY3Rpb24ucHJvdG90eXBlLFxuXHRcdFx0XHR0aGlzLmJhc2UuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRcdHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpLFxuXHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRkcmFmdC5OYXZpZ2F0aW9uVHlwZS5Gb3J3YXJkTmF2aWdhdGlvblxuXHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0X2RvTmF2aWdhdGUoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUHJlcGFyZSBhdHRyaWJ1dGVzIHRvIGJlIHBhc3NlZCB0byBleHRlcm5hbCBuYXZpZ2F0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1NlbWFudGljQXR0cmlidXRlcyBDb250ZXh0IGRhdGEgYWZ0ZXIgcmVtb3ZpbmcgYWxsIHNlbnNpdGl2ZSBpbmZvcm1hdGlvbi5cblx0ICogQHBhcmFtIG9Db250ZXh0IEFjdHVhbCBjb250ZXh0IGZyb20gd2hpY2ggdGhlIHNlbWFudGljQXR0cmlidXRlcyB3ZXJlIGRlcml2ZWQuXG5cdCAqIEByZXR1cm5zIE9iamVjdCBvZiBwcmVwYXJlZCBhdHRyaWJ1dGVzIGZvciBleHRlcm5hbCBuYXZpZ2F0aW9uIGFuZCBubyBjb25mbGljdCBwcm9wZXJ0aWVzLlxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHByZXBhcmVDb250ZXh0Rm9yRXh0ZXJuYWxOYXZpZ2F0aW9uKG9TZW1hbnRpY0F0dHJpYnV0ZXM6IGFueSwgb0NvbnRleHQ6IENvbnRleHQpIHtcblx0XHQvLyAxLiBGaW5kIGFsbCBkaXN0aW5jdCBrZXlzIGluIHRoZSBvYmplY3QgU2VtYW50aWNBdHRyaWJ1dGVzXG5cdFx0Ly8gU3RvcmUgbWV0YSBwYXRoIGZvciBlYWNoIG9jY3VyZW5jZSBvZiB0aGUga2V5XG5cdFx0Y29uc3Qgb0Rpc3RpbmN0S2V5czogYW55ID0ge30sXG5cdFx0XHRzQ29udGV4dFBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc0NvbnRleHRQYXRoKSxcblx0XHRcdGFNZXRhUGF0aFBhcnRzID0gc01ldGFQYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoQm9vbGVhbik7XG5cblx0XHRmdW5jdGlvbiBfZmluZERpc3RpbmN0S2V5c0luT2JqZWN0KExvb2tVcE9iamVjdDogYW55LCBzTG9va1VwT2JqZWN0TWV0YVBhdGg6IGFueSkge1xuXHRcdFx0Zm9yIChjb25zdCBzS2V5IGluIExvb2tVcE9iamVjdCkge1xuXHRcdFx0XHQvLyBudWxsIGNhc2U/P1xuXHRcdFx0XHRpZiAoTG9va1VwT2JqZWN0W3NLZXldID09PSBudWxsIHx8IHR5cGVvZiBMb29rVXBPYmplY3Rbc0tleV0gIT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRpZiAoIW9EaXN0aW5jdEtleXNbc0tleV0pIHtcblx0XHRcdFx0XHRcdC8vIGlmIGtleSBpcyBmb3VuZCBmb3IgdGhlIGZpcnN0IHRpbWUgdGhlbiBjcmVhdGUgYXJyYXlcblx0XHRcdFx0XHRcdG9EaXN0aW5jdEtleXNbc0tleV0gPSBbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gcHVzaCBwYXRoIHRvIGFycmF5XG5cdFx0XHRcdFx0b0Rpc3RpbmN0S2V5c1tzS2V5XS5wdXNoKHNMb29rVXBPYmplY3RNZXRhUGF0aCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gaWYgYSBuZXN0ZWQgb2JqZWN0IGlzIGZvdW5kXG5cdFx0XHRcdFx0Y29uc3Qgb05ld0xvb2tVcE9iamVjdCA9IExvb2tVcE9iamVjdFtzS2V5XTtcblx0XHRcdFx0XHRfZmluZERpc3RpbmN0S2V5c0luT2JqZWN0KG9OZXdMb29rVXBPYmplY3QsIGAke3NMb29rVXBPYmplY3RNZXRhUGF0aH0vJHtzS2V5fWApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X2ZpbmREaXN0aW5jdEtleXNJbk9iamVjdChvU2VtYW50aWNBdHRyaWJ1dGVzLCBzTWV0YVBhdGgpO1xuXG5cdFx0Ly8gMi4gRGV0ZXJtaW5lIGRpc3RpbmN0IGtleSB2YWx1ZSBhbmQgYWRkIGNvbmZsaWN0ZWQgcGF0aHMgdG8gc2VtYW50aWMgYXR0cmlidXRlc1xuXHRcdGNvbnN0IHNNYWluRW50aXR5U2V0TmFtZSA9IGFNZXRhUGF0aFBhcnRzWzBdLFxuXHRcdFx0c01haW5FbnRpdHlUeXBlTmFtZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtzTWFpbkVudGl0eVNldE5hbWV9L0BzYXB1aS5uYW1lYCksXG5cdFx0XHRvUHJvcGVydGllc1dpdGhvdXRDb25mbGljdDogYW55ID0ge307XG5cdFx0bGV0IHNNYWluRW50aXR5VmFsdWVQYXRoLCBzQ3VycmVudFZhbHVlUGF0aCwgc0xhc3RWYWx1ZVBhdGg7XG5cdFx0Zm9yIChjb25zdCBzRGlzdGluY3RLZXkgaW4gb0Rpc3RpbmN0S2V5cykge1xuXHRcdFx0Y29uc3QgYUNvbmZsaWN0aW5nUGF0aHMgPSBvRGlzdGluY3RLZXlzW3NEaXN0aW5jdEtleV07XG5cdFx0XHRsZXQgc1dpbm5lclZhbHVlUGF0aDtcblx0XHRcdC8vIEZpbmQgd2lubmVyIHZhbHVlIGZvciBlYWNoIGRpc3RpbmN0IGtleSBpbiBjYXNlIG9mIGNvbmZsaWN0IGJ5IHRoZSBmb2xsb3dpbmcgcnVsZTpcblxuXHRcdFx0Ly8gLT4gQS4gaWYgYW55IG1ldGEgcGF0aCBmb3IgYSBkaXN0aW5jdCBrZXkgaXMgdGhlIHNhbWUgYXMgbWFpbiBlbnRpdHkgdGFrZSB0aGF0IGFzIHRoZSB2YWx1ZVxuXHRcdFx0Ly8gLT4gQi4gaWYgQSBpcyBub3QgbWV0IGtlZXAgdGhlIHZhbHVlIGZyb20gdGhlIGN1cnJlbnQgY29udGV4dCAoc01ldGFQYXRoID09PSBwYXRoIG9mIGRpc3RpbmNlIGtleSlcblx0XHRcdC8vIC0+IEMuIGlmIEEsIEIgb3IgQyBhcmUgbm90IG1ldCB0YWtlIHRoZSBsYXN0IHBhdGggZm9yIHZhbHVlXG5cdFx0XHRpZiAoYUNvbmZsaWN0aW5nUGF0aHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHQvLyBjb25mbGljdFxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8PSBhQ29uZmxpY3RpbmdQYXRocy5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdFx0XHRjb25zdCBzUGF0aCA9IGFDb25mbGljdGluZ1BhdGhzW2ldO1xuXHRcdFx0XHRcdGxldCBzUGF0aEluQ29udGV4dCA9IHNQYXRoLnJlcGxhY2Uoc1BhdGggPT09IHNNZXRhUGF0aCA/IHNNZXRhUGF0aCA6IGAke3NNZXRhUGF0aH0vYCwgXCJcIik7XG5cdFx0XHRcdFx0c1BhdGhJbkNvbnRleHQgPSAoc1BhdGhJbkNvbnRleHQgPT09IFwiXCIgPyBzUGF0aEluQ29udGV4dCA6IGAke3NQYXRoSW5Db250ZXh0fS9gKSArIHNEaXN0aW5jdEtleTtcblx0XHRcdFx0XHRjb25zdCBzRW50aXR5VHlwZU5hbWUgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH0vQHNhcHVpLm5hbWVgKTtcblx0XHRcdFx0XHQvLyBydWxlIEFcblxuXHRcdFx0XHRcdC8vIHJ1bGUgQVxuXHRcdFx0XHRcdGlmIChzRW50aXR5VHlwZU5hbWUgPT09IHNNYWluRW50aXR5VHlwZU5hbWUpIHtcblx0XHRcdFx0XHRcdHNNYWluRW50aXR5VmFsdWVQYXRoID0gc1BhdGhJbkNvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcnVsZSBCXG5cdFx0XHRcdFx0aWYgKHNQYXRoID09PSBzTWV0YVBhdGgpIHtcblx0XHRcdFx0XHRcdHNDdXJyZW50VmFsdWVQYXRoID0gc1BhdGhJbkNvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcnVsZSBDXG5cdFx0XHRcdFx0c0xhc3RWYWx1ZVBhdGggPSBzUGF0aEluQ29udGV4dDtcblxuXHRcdFx0XHRcdC8vIGFkZCBjb25mbGljdGVkIHBhdGggdG8gc2VtYW50aWMgYXR0cmlidXRlc1xuXHRcdFx0XHRcdC8vIGNoZWNrIGlmIHRoZSBjdXJyZW50IHBhdGggcG9pbnRzIHRvIG1haW4gZW50aXR5IGFuZCBwcmVmaXggYXR0cmlidXRlIG5hbWVzIGFjY29yZGluZ2x5XG5cdFx0XHRcdFx0b1NlbWFudGljQXR0cmlidXRlc1tcblx0XHRcdFx0XHRcdGAke3NNZXRhUGF0aH0vJHtzUGF0aEluQ29udGV4dH1gXG5cdFx0XHRcdFx0XHRcdC5zcGxpdChcIi9cIilcblx0XHRcdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAoc1ZhbHVlOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc1ZhbHVlICE9IFwiXCI7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC5qb2luKFwiLlwiKVxuXHRcdFx0XHRcdF0gPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShzUGF0aEluQ29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gQSB8fCBCIHx8IENcblx0XHRcdFx0c1dpbm5lclZhbHVlUGF0aCA9IHNNYWluRW50aXR5VmFsdWVQYXRoIHx8IHNDdXJyZW50VmFsdWVQYXRoIHx8IHNMYXN0VmFsdWVQYXRoO1xuXHRcdFx0XHRvU2VtYW50aWNBdHRyaWJ1dGVzW3NEaXN0aW5jdEtleV0gPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShzV2lubmVyVmFsdWVQYXRoKTtcblx0XHRcdFx0c01haW5FbnRpdHlWYWx1ZVBhdGggPSB1bmRlZmluZWQ7XG5cdFx0XHRcdHNDdXJyZW50VmFsdWVQYXRoID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRzTGFzdFZhbHVlUGF0aCA9IHVuZGVmaW5lZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIG5vIGNvbmZsaWN0LCBhZGQgZGlzdGluY3Qga2V5IHdpdGhvdXQgYWRkaW5nIHBhdGhzXG5cdFx0XHRcdGNvbnN0IHNQYXRoID0gYUNvbmZsaWN0aW5nUGF0aHNbMF07IC8vIGJlY2F1c2UgdGhlcmUgaXMgb25seSBvbmUgYW5kIGhlbmNlIG5vIGNvbmZsaWN0XG5cdFx0XHRcdGxldCBzUGF0aEluQ29udGV4dCA9IHNQYXRoLnJlcGxhY2Uoc1BhdGggPT09IHNNZXRhUGF0aCA/IHNNZXRhUGF0aCA6IGAke3NNZXRhUGF0aH0vYCwgXCJcIik7XG5cdFx0XHRcdHNQYXRoSW5Db250ZXh0ID0gKHNQYXRoSW5Db250ZXh0ID09PSBcIlwiID8gc1BhdGhJbkNvbnRleHQgOiBgJHtzUGF0aEluQ29udGV4dH0vYCkgKyBzRGlzdGluY3RLZXk7XG5cdFx0XHRcdG9TZW1hbnRpY0F0dHJpYnV0ZXNbc0Rpc3RpbmN0S2V5XSA9IG9Db250ZXh0LmdldFByb3BlcnR5KHNQYXRoSW5Db250ZXh0KTtcblx0XHRcdFx0b1Byb3BlcnRpZXNXaXRob3V0Q29uZmxpY3Rbc0Rpc3RpbmN0S2V5XSA9IGAke3NNZXRhUGF0aH0vJHtzUGF0aEluQ29udGV4dH1gXG5cdFx0XHRcdFx0LnNwbGl0KFwiL1wiKVxuXHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKHNWYWx1ZTogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc1ZhbHVlICE9IFwiXCI7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuam9pbihcIi5cIik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIDMuIFJlbW92ZSBhbGwgTmF2aWdhdGlvbiBwcm9wZXJ0aWVzXG5cdFx0Zm9yIChjb25zdCBzUHJvcGVydHkgaW4gb1NlbWFudGljQXR0cmlidXRlcykge1xuXHRcdFx0aWYgKG9TZW1hbnRpY0F0dHJpYnV0ZXNbc1Byb3BlcnR5XSAhPT0gbnVsbCAmJiB0eXBlb2Ygb1NlbWFudGljQXR0cmlidXRlc1tzUHJvcGVydHldID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdGRlbGV0ZSBvU2VtYW50aWNBdHRyaWJ1dGVzW3NQcm9wZXJ0eV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB7XG5cdFx0XHRzZW1hbnRpY0F0dHJpYnV0ZXM6IG9TZW1hbnRpY0F0dHJpYnV0ZXMsXG5cdFx0XHRwcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0OiBvUHJvcGVydGllc1dpdGhvdXRDb25mbGljdFxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogUHJlcGFyZSBmaWx0ZXIgY29uZGl0aW9ucyB0byBiZSBwYXNzZWQgdG8gZXh0ZXJuYWwgbmF2aWdhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIG9GaWx0ZXJCYXJDb25kaXRpb25zIEZpbHRlciBjb25kaXRpb25zLlxuXHQgKiBAcGFyYW0gc1Jvb3RQYXRoIFJvb3QgcGF0aCBvZiB0aGUgYXBwbGljYXRpb24uXG5cdCAqIEBwYXJhbSBhUGFyYW1ldGVycyBOYW1lcyBvZiBwYXJhbWV0ZXJzIHRvIGJlIGNvbnNpZGVyZWQuXG5cdCAqIEByZXR1cm5zIE9iamVjdCBvZiBwcmVwYXJlZCBmaWx0ZXIgY29uZGl0aW9ucyBmb3IgZXh0ZXJuYWwgbmF2aWdhdGlvbiBhbmQgbm8gY29uZmxpY3QgZmlsdGVycy5cblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwcmVwYXJlRmlsdGVyc0ZvckV4dGVybmFsTmF2aWdhdGlvbihvRmlsdGVyQmFyQ29uZGl0aW9uczogYW55LCBzUm9vdFBhdGg6IHN0cmluZywgYVBhcmFtZXRlcnM/OiBhbnlbXSkge1xuXHRcdGxldCBzUGF0aDtcblx0XHRjb25zdCBvRGlzdGluY3RLZXlzOiBhbnkgPSB7fTtcblx0XHRjb25zdCBvRmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdDogYW55ID0ge307XG5cdFx0bGV0IHNNYWluRW50aXR5VmFsdWVQYXRoLCBzQ3VycmVudFZhbHVlUGF0aCwgc0Z1bGxDb250ZXh0UGF0aCwgc1dpbm5lclZhbHVlUGF0aCwgc1BhdGhJbkNvbnRleHQ7XG5cblx0XHRmdW5jdGlvbiBfZmluZERpc3RpbmN0S2V5c0luT2JqZWN0KExvb2tVcE9iamVjdDogYW55KSB7XG5cdFx0XHRsZXQgc0xvb2tVcE9iamVjdE1ldGFQYXRoO1xuXHRcdFx0Zm9yIChjb25zdCBzS2V5IGluIExvb2tVcE9iamVjdCkge1xuXHRcdFx0XHRsZXQga2V5SW5Db250ZXh0ID0gc0tleTtcblx0XHRcdFx0aWYgKExvb2tVcE9iamVjdFtrZXlJbkNvbnRleHRdKSB7XG5cdFx0XHRcdFx0aWYgKGtleUluQ29udGV4dC5pbmNsdWRlcyhcIi9cIikpIHtcblx0XHRcdFx0XHRcdHNMb29rVXBPYmplY3RNZXRhUGF0aCA9IGtleUluQ29udGV4dDsgLy8gXCIvU2FsZXNPcmRlcm1hbmFnZS9fSXRlbS9NYXRlcmlhbFwiXG5cdFx0XHRcdFx0XHRjb25zdCBhUGF0aFBhcnRzID0ga2V5SW5Db250ZXh0LnNwbGl0KFwiL1wiKTtcblx0XHRcdFx0XHRcdGtleUluQ29udGV4dCA9IGFQYXRoUGFydHNbYVBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c0xvb2tVcE9iamVjdE1ldGFQYXRoID0gc1Jvb3RQYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIW9EaXN0aW5jdEtleXNba2V5SW5Db250ZXh0XSkge1xuXHRcdFx0XHRcdFx0Ly8gaWYga2V5IGlzIGZvdW5kIGZvciB0aGUgZmlyc3QgdGltZSB0aGVuIGNyZWF0ZSBhcnJheVxuXHRcdFx0XHRcdFx0b0Rpc3RpbmN0S2V5c1trZXlJbkNvbnRleHRdID0gW107XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcHVzaCBwYXRoIHRvIGFycmF5XG5cdFx0XHRcdFx0b0Rpc3RpbmN0S2V5c1trZXlJbkNvbnRleHRdLnB1c2goc0xvb2tVcE9iamVjdE1ldGFQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdF9maW5kRGlzdGluY3RLZXlzSW5PYmplY3Qob0ZpbHRlckJhckNvbmRpdGlvbnMpO1xuXHRcdGZvciAoY29uc3Qgc0Rpc3RpbmN0S2V5IGluIG9EaXN0aW5jdEtleXMpIHtcblx0XHRcdGNvbnN0IGFDb25mbGljdGluZ1BhdGhzID0gb0Rpc3RpbmN0S2V5c1tzRGlzdGluY3RLZXldO1xuXG5cdFx0XHRpZiAoYUNvbmZsaWN0aW5nUGF0aHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHQvLyBjb25mbGljdFxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8PSBhQ29uZmxpY3RpbmdQYXRocy5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdFx0XHRzUGF0aCA9IGFDb25mbGljdGluZ1BhdGhzW2ldO1xuXHRcdFx0XHRcdGlmIChzUGF0aCA9PT0gc1Jvb3RQYXRoKSB7XG5cdFx0XHRcdFx0XHRzRnVsbENvbnRleHRQYXRoID0gYCR7c1Jvb3RQYXRofS8ke3NEaXN0aW5jdEtleX1gO1xuXHRcdFx0XHRcdFx0c1BhdGhJbkNvbnRleHQgPSBzRGlzdGluY3RLZXk7XG5cdFx0XHRcdFx0XHRzTWFpbkVudGl0eVZhbHVlUGF0aCA9IHNEaXN0aW5jdEtleTtcblx0XHRcdFx0XHRcdGlmIChhUGFyYW1ldGVycyAmJiBhUGFyYW1ldGVycy5pbmNsdWRlcyhzRGlzdGluY3RLZXkpKSB7XG5cdFx0XHRcdFx0XHRcdG9GaWx0ZXJCYXJDb25kaXRpb25zW2AkUGFyYW1ldGVyLiR7c0Rpc3RpbmN0S2V5fWBdID0gb0ZpbHRlckJhckNvbmRpdGlvbnNbc0Rpc3RpbmN0S2V5XTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c1BhdGhJbkNvbnRleHQgPSBzUGF0aDtcblx0XHRcdFx0XHRcdHNGdWxsQ29udGV4dFBhdGggPSAoYCR7c1Jvb3RQYXRofS8ke3NQYXRofWAgYXMgYW55KS5yZXBsYWNlQWxsKC9cXCovZywgXCJcIik7XG5cdFx0XHRcdFx0XHRzQ3VycmVudFZhbHVlUGF0aCA9IHNQYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRvRmlsdGVyQmFyQ29uZGl0aW9uc1tcblx0XHRcdFx0XHRcdHNGdWxsQ29udGV4dFBhdGhcblx0XHRcdFx0XHRcdFx0LnNwbGl0KFwiL1wiKVxuXHRcdFx0XHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChzVmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzVmFsdWUgIT0gXCJcIjtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LmpvaW4oXCIuXCIpXG5cdFx0XHRcdFx0XSA9IG9GaWx0ZXJCYXJDb25kaXRpb25zW3NQYXRoSW5Db250ZXh0XTtcblx0XHRcdFx0XHRkZWxldGUgb0ZpbHRlckJhckNvbmRpdGlvbnNbc1BhdGhdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c1dpbm5lclZhbHVlUGF0aCA9IHNNYWluRW50aXR5VmFsdWVQYXRoIHx8IHNDdXJyZW50VmFsdWVQYXRoO1xuXHRcdFx0XHRvRmlsdGVyQmFyQ29uZGl0aW9uc1tzRGlzdGluY3RLZXldID0gb0ZpbHRlckJhckNvbmRpdGlvbnNbc1dpbm5lclZhbHVlUGF0aF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBubyBjb25mbGljdCwgYWRkIGRpc3RpbmN0IGtleSB3aXRob3V0IGFkZGluZyBwYXRoc1xuXHRcdFx0XHRzUGF0aCA9IGFDb25mbGljdGluZ1BhdGhzWzBdO1xuXHRcdFx0XHRzRnVsbENvbnRleHRQYXRoID1cblx0XHRcdFx0XHRzUGF0aCA9PT0gc1Jvb3RQYXRoID8gYCR7c1Jvb3RQYXRofS8ke3NEaXN0aW5jdEtleX1gIDogKGAke3NSb290UGF0aH0vJHtzUGF0aH1gIGFzIGFueSkucmVwbGFjZUFsbChcIipcIiwgXCJcIik7XG5cdFx0XHRcdG9GaWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0W3NEaXN0aW5jdEtleV0gPSBzRnVsbENvbnRleHRQYXRoXG5cdFx0XHRcdFx0LnNwbGl0KFwiL1wiKVxuXHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKHNWYWx1ZTogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc1ZhbHVlICE9IFwiXCI7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuam9pbihcIi5cIik7XG5cdFx0XHRcdGlmIChhUGFyYW1ldGVycyAmJiBhUGFyYW1ldGVycy5pbmNsdWRlcyhzRGlzdGluY3RLZXkpKSB7XG5cdFx0XHRcdFx0b0ZpbHRlckJhckNvbmRpdGlvbnNbYCRQYXJhbWV0ZXIuJHtzRGlzdGluY3RLZXl9YF0gPSBvRmlsdGVyQmFyQ29uZGl0aW9uc1tzRGlzdGluY3RLZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGZpbHRlckNvbmRpdGlvbnM6IG9GaWx0ZXJCYXJDb25kaXRpb25zLFxuXHRcdFx0ZmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdDogb0ZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3Rcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBOYXZpZ2F0aW9uIG1vZGUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBuYXZpZ2F0aW9uIG1vZGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5JbnN0ZWFkKVxuXHRnZXROYXZpZ2F0aW9uTW9kZSgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFsbG93cyBmb3IgbmF2aWdhdGlvbiB0byBhIGdpdmVuIGludGVudCAoU2VtYW50aWNPYmplY3QtQWN0aW9uKSB3aXRoIHRoZSBwcm92aWRlZCBjb250ZXh0LCB1c2luZyBhIGRpYWxvZyB0aGF0IHNob3dzIHRoZSBjb250ZXh0cyB3aGljaCBjYW5ub3QgYmUgcGFzc2VkXG5cdCAqIElmIHNlbWFudGljIG9iamVjdCBtYXBwaW5nIGlzIHByb3ZpZGVkLCB0aGlzIHNldHRpbmcgaXMgYWxzbyBhcHBsaWVkIHRvIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBhZnRlciBhZGFwdGF0aW9uIGJ5IGEgY29uc3VtZXIuXG5cdCAqIFRoaXMgc2V0dGluZyBhbHNvIHJlbW92ZXMgYW55IHRlY2huaWNhbCBwYXJhbWV0ZXJzIGFuZCBkZXRlcm1pbmVzIGlmIGFuIGlucGxhY2Ugb3IgZXhwbGFjZSBuYXZpZ2F0aW9uIHNob3VsZCB0YWtlIHBsYWNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1NlbWFudGljT2JqZWN0IFNlbWFudGljIG9iamVjdCBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIHNBY3Rpb24gIEFjdGlvbiBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnNdIE9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBleHRlcm5hbCBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgbmF2aWdhdGVXaXRoQ29uZmlybWF0aW9uRGlhbG9nKHNTZW1hbnRpY09iamVjdDogc3RyaW5nLCBzQWN0aW9uOiBzdHJpbmcsIG1OYXZpZ2F0aW9uUGFyYW1ldGVycz86IE5hdmlnYXRpb25QYXJhbWV0ZXJzKSB7XG5cdFx0bGV0IHNob3VsZENvbnRpbnVlID0gdHJ1ZTtcblx0XHRpZiAobU5hdmlnYXRpb25QYXJhbWV0ZXJzPy5ub3RBcHBsaWNhYmxlQ29udGV4dHMgJiYgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0cz8ubGVuZ3RoID49IDEpIHtcblx0XHRcdGNvbnN0IG1ldGFNb2RlbCA9IHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGNvbnN0IGVudGl0eVNldFBhdGggPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgobU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0c1swXS5nZXRQYXRoKCkpO1xuXHRcdFx0Y29uc3QgY29udmVydGVkTWV0YWRhdGEgPSBjb252ZXJ0VHlwZXMobWV0YU1vZGVsKTtcblx0XHRcdGNvbnN0IGVudGl0eVNldCA9IGNvbnZlcnRlZE1ldGFkYXRhLnJlc29sdmVQYXRoPEVudGl0eVNldD4oZW50aXR5U2V0UGF0aCkudGFyZ2V0ITtcblx0XHRcdC8vIFNob3cgdGhlIGNvbnRleHRzIHRoYXQgYXJlIG5vdCBhcHBsaWNhYmxlIGFuZCB3aWxsIG5vdCB0aGVyZWZvcmUgYmUgcHJvY2Vzc2VkXG5cdFx0XHRjb25zdCBub3RBcHBsaWNhYmxlQ29udGV4dHNEaWFsb2cgPSBuZXcgTm90QXBwbGljYWJsZUNvbnRleHREaWFsb2coe1xuXHRcdFx0XHR0aXRsZTogXCJcIixcblx0XHRcdFx0ZW50aXR5VHlwZTogZW50aXR5U2V0LmVudGl0eVR5cGUsXG5cdFx0XHRcdHJlc291cmNlTW9kZWw6IGdldFJlc291cmNlTW9kZWwodGhpcy5nZXRWaWV3KCkpLFxuXHRcdFx0XHRub3RBcHBsaWNhYmxlQ29udGV4dHM6IG1OYXZpZ2F0aW9uUGFyYW1ldGVycy5ub3RBcHBsaWNhYmxlQ29udGV4dHNcblx0XHRcdH0pO1xuXHRcdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5hdmlnYXRpb25Db250ZXh0cyA9IG1OYXZpZ2F0aW9uUGFyYW1ldGVycy5hcHBsaWNhYmxlQ29udGV4dHM7XG5cdFx0XHRzaG91bGRDb250aW51ZSA9IGF3YWl0IG5vdEFwcGxpY2FibGVDb250ZXh0c0RpYWxvZy5vcGVuKHRoaXMuZ2V0VmlldygpKTtcblx0XHR9XG5cdFx0aWYgKHNob3VsZENvbnRpbnVlKSB7XG5cdFx0XHR0aGlzLm5hdmlnYXRlKHNTZW1hbnRpY09iamVjdCwgc0FjdGlvbiwgbU5hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHR9XG5cdH1cblxuXHRfcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyhvU2VsZWN0aW9uVmFyaWFudDogYW55KSB7XG5cdFx0b1NlbGVjdGlvblZhcmlhbnQucmVtb3ZlU2VsZWN0T3B0aW9uKFwiQG9kYXRhLmNvbnRleHRcIik7XG5cdFx0b1NlbGVjdGlvblZhcmlhbnQucmVtb3ZlU2VsZWN0T3B0aW9uKFwiQG9kYXRhLm1ldGFkYXRhRXRhZ1wiKTtcblx0XHRvU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oXCJTQVBfX01lc3NhZ2VzXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0YXJnZXRlZCBFbnRpdHkgc2V0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBFbnRpdHkgc2V0IG5hbWVcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0Z2V0RW50aXR5U2V0KCkge1xuXHRcdHJldHVybiAodGhpcy5fb1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmVudGl0eVNldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIHNlbnNpdGl2ZSBkYXRhIGZyb20gdGhlIHNlbWFudGljIGF0dHJpYnV0ZSB3aXRoIHJlc3BlY3QgdG8gdGhlIGVudGl0eVNldC5cblx0ICpcblx0ICogQHBhcmFtIG9BdHRyaWJ1dGVzIENvbnRleHQgZGF0YVxuXHQgKiBAcGFyYW0gc01ldGFQYXRoIE1ldGEgcGF0aCB0byByZWFjaCB0aGUgZW50aXR5U2V0IGluIHRoZSBNZXRhTW9kZWxcblx0ICogQHJldHVybnMgQXJyYXkgb2Ygc2VtYW50aWMgQXR0cmlidXRlc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Ly8gVE8tRE8gYWRkIHVuaXQgdGVzdHMgZm9yIHRoaXMgZnVuY3Rpb24gaW4gdGhlIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIHF1bml0LlxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cmVtb3ZlU2Vuc2l0aXZlRGF0YShvQXR0cmlidXRlczogYW55LCBzTWV0YVBhdGg6IHN0cmluZykge1xuXHRcdGlmIChvQXR0cmlidXRlcykge1xuXHRcdFx0Y29uc3QgeyB0cmFuc0FnZ3JlZ2F0aW9ucywgY3VzdG9tQWdncmVnYXRlcyB9ID0gdGhpcy5fZ2V0QWdncmVnYXRlcyhcblx0XHRcdFx0c01ldGFQYXRoLFxuXHRcdFx0XHR0aGlzLmJhc2UuZ2V0VmlldygpLFxuXHRcdFx0XHR0aGlzLmJhc2UuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0RGlhZ25vc3RpY3MoKVxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGFQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMob0F0dHJpYnV0ZXMpO1xuXHRcdFx0aWYgKGFQcm9wZXJ0aWVzLmxlbmd0aCkge1xuXHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbXCJAb2RhdGEuY29udGV4dFwiXTtcblx0XHRcdFx0ZGVsZXRlIG9BdHRyaWJ1dGVzW1wiQG9kYXRhLm1ldGFkYXRhRXRhZ1wiXTtcblx0XHRcdFx0ZGVsZXRlIG9BdHRyaWJ1dGVzW1wiU0FQX19NZXNzYWdlc1wiXTtcblx0XHRcdFx0Zm9yIChjb25zdCBlbGVtZW50IG9mIGFQcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0aWYgKG9BdHRyaWJ1dGVzW2VsZW1lbnRdICYmIHR5cGVvZiBvQXR0cmlidXRlc1tlbGVtZW50XSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRcdFx0dGhpcy5yZW1vdmVTZW5zaXRpdmVEYXRhKG9BdHRyaWJ1dGVzW2VsZW1lbnRdLCBgJHtzTWV0YVBhdGh9LyR7ZWxlbWVudH1gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGVsZW1lbnQuaW5kZXhPZihcIkBvZGF0YS50eXBlXCIpID4gLTEpIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSBvQXR0cmlidXRlc1tlbGVtZW50XTtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLl9kZWxldGVBZ2dyZWdhdGVzKFsuLi50cmFuc0FnZ3JlZ2F0aW9ucywgLi4uY3VzdG9tQWdncmVnYXRlc10sIGVsZW1lbnQsIG9BdHRyaWJ1dGVzKTtcblx0XHRcdFx0XHRjb25zdCBhUHJvcGVydHlBbm5vdGF0aW9ucyA9IHRoaXMuX2dldFByb3BlcnR5QW5ub3RhdGlvbnMoZWxlbWVudCwgc01ldGFQYXRoLCBvQXR0cmlidXRlcywgdGhpcy5fb01ldGFNb2RlbCk7XG5cdFx0XHRcdFx0aWYgKGFQcm9wZXJ0eUFubm90YXRpb25zKSB7XG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdGFQcm9wZXJ0eUFubm90YXRpb25zLlBlcnNvbmFsRGF0YT8uSXNQb3RlbnRpYWxseVNlbnNpdGl2ZSB8fFxuXHRcdFx0XHRcdFx0XHRhUHJvcGVydHlBbm5vdGF0aW9ucy5VST8uRXhjbHVkZUZyb21OYXZpZ2F0aW9uQ29udGV4dCB8fFxuXHRcdFx0XHRcdFx0XHRhUHJvcGVydHlBbm5vdGF0aW9ucy5BbmFseXRpY3M/Lk1lYXN1cmVcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbZWxlbWVudF07XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGFQcm9wZXJ0eUFubm90YXRpb25zLkNvbW1vbj8uRmllbGRDb250cm9sKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9GaWVsZENvbnRyb2wgPSBhUHJvcGVydHlBbm5vdGF0aW9ucy5Db21tb24uRmllbGRDb250cm9sIGFzIGFueTtcblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdChvRmllbGRDb250cm9sW1wiJEVudW1NZW1iZXJcIl0gJiYgb0ZpZWxkQ29udHJvbFtcIiRFbnVtTWVtYmVyXCJdLnNwbGl0KFwiL1wiKVsxXSA9PT0gXCJJbmFwcGxpY2FibGVcIikgfHxcblx0XHRcdFx0XHRcdFx0XHQob0ZpZWxkQ29udHJvbFtcIiRQYXRoXCJdICYmIHRoaXMuX2lzRmllbGRDb250cm9sUGF0aEluYXBwbGljYWJsZShvRmllbGRDb250cm9sW1wiJFBhdGhcIl0sIG9BdHRyaWJ1dGVzKSlcblx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIG9BdHRyaWJ1dGVzW2VsZW1lbnRdO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvQXR0cmlidXRlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgdGhlIGF0dHJpYnV0ZSBmcm9tIG5hdmlnYXRpb24gZGF0YSBpZiBpdCBpcyBhIG1lYXN1cmUuXG5cdCAqXG5cdCAqIEBwYXJhbSBhZ2dyZWdhdGVzIEFycmF5IG9mIEFnZ3JlZ2F0ZXNcblx0ICogQHBhcmFtIHNQcm9wIEF0dHJpYnV0ZSBuYW1lXG5cdCAqIEBwYXJhbSBvQXR0cmlidXRlcyBTZW1hbnRpY0F0dHJpYnV0ZXNcblx0ICovXG5cdF9kZWxldGVBZ2dyZWdhdGVzKGFnZ3JlZ2F0ZXM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkLCBzUHJvcDogc3RyaW5nLCBvQXR0cmlidXRlczogYW55KSB7XG5cdFx0aWYgKGFnZ3JlZ2F0ZXMgJiYgYWdncmVnYXRlcy5pbmRleE9mKHNQcm9wKSA+IC0xKSB7XG5cdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbc1Byb3BdO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwcm9wZXJ0eSBhbm5vdGF0aW9ucy5cblx0ICpcblx0ICogQHBhcmFtIHNQcm9wXG5cdCAqIEBwYXJhbSBzTWV0YVBhdGhcblx0ICogQHBhcmFtIG9BdHRyaWJ1dGVzXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsXG5cdCAqIEByZXR1cm5zIC0gVGhlIHByb3BlcnR5IGFubm90YXRpb25zXG5cdCAqL1xuXHRfZ2V0UHJvcGVydHlBbm5vdGF0aW9ucyhzUHJvcDogc3RyaW5nLCBzTWV0YVBhdGg6IHN0cmluZywgb0F0dHJpYnV0ZXM6IGFueSwgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0XHRpZiAob0F0dHJpYnV0ZXNbc1Byb3BdICYmIHNNZXRhUGF0aCAmJiAhc01ldGFQYXRoLmluY2x1ZGVzKFwidW5kZWZpbmVkXCIpKSB7XG5cdFx0XHRjb25zdCBvQ29udGV4dCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYCR7c01ldGFQYXRofS8ke3NQcm9wfWApIGFzIE9EYXRhVjRDb250ZXh0O1xuXHRcdFx0Y29uc3Qgb0Z1bGxDb250ZXh0ID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvQ29udGV4dCk7XG5cdFx0XHRyZXR1cm4gb0Z1bGxDb250ZXh0Py50YXJnZXRPYmplY3Q/LmFubm90YXRpb25zIGFzIFByb3BlcnR5QW5ub3RhdGlvbnMgfCB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFnZ3JlZ2F0ZXMgcGFydCBvZiB0aGUgRW50aXR5U2V0IG9yIEVudGl0eVR5cGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzTWV0YVBhdGhcblx0ICogQHBhcmFtIG9WaWV3XG5cdCAqIEBwYXJhbSBvRGlhZ25vc3RpY3Ncblx0ICogQHJldHVybnMgLSBUaGUgYWdncmVnYXRlc1xuXHQgKi9cblx0X2dldEFnZ3JlZ2F0ZXMoc01ldGFQYXRoOiBzdHJpbmcsIG9WaWV3OiBGRVZpZXcsIG9EaWFnbm9zdGljczogRGlhZ25vc3RpY3MpIHtcblx0XHRjb25zdCBjb252ZXJ0ZXJDb250ZXh0ID0gdGhpcy5fZ2V0Q29udmVydGVyQ29udGV4dChzTWV0YVBhdGgsIG9WaWV3LCBvRGlhZ25vc3RpY3MpO1xuXHRcdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRjb25zdCBpc0FuYWx5dGljc1N1cHBvcnRlZCA9IGFnZ3JlZ2F0aW9uSGVscGVyLmlzQW5hbHl0aWNzU3VwcG9ydGVkKCk7XG5cdFx0bGV0IHRyYW5zQWdncmVnYXRpb25zLCBjdXN0b21BZ2dyZWdhdGVzO1xuXHRcdGlmIChpc0FuYWx5dGljc1N1cHBvcnRlZCkge1xuXHRcdFx0dHJhbnNBZ2dyZWdhdGlvbnMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRUcmFuc0FnZ3JlZ2F0aW9ucygpO1xuXHRcdFx0aWYgKHRyYW5zQWdncmVnYXRpb25zPy5sZW5ndGgpIHtcblx0XHRcdFx0dHJhbnNBZ2dyZWdhdGlvbnMgPSB0cmFuc0FnZ3JlZ2F0aW9ucy5tYXAoKHRyYW5zQWdnOiBhbnkpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gdHJhbnNBZ2cuTmFtZSB8fCB0cmFuc0FnZy5WYWx1ZTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRjdXN0b21BZ2dyZWdhdGVzID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0Q3VzdG9tQWdncmVnYXRlRGVmaW5pdGlvbnMoKTtcblx0XHRcdGlmIChjdXN0b21BZ2dyZWdhdGVzPy5sZW5ndGgpIHtcblx0XHRcdFx0Y3VzdG9tQWdncmVnYXRlcyA9IGN1c3RvbUFnZ3JlZ2F0ZXMubWFwKChjdXN0b21BZ2dyZWdhdGU6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBjdXN0b21BZ2dyZWdhdGUucXVhbGlmaWVyO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dHJhbnNBZ2dyZWdhdGlvbnMgPSB0cmFuc0FnZ3JlZ2F0aW9ucyA/IHRyYW5zQWdncmVnYXRpb25zIDogW107XG5cdFx0Y3VzdG9tQWdncmVnYXRlcyA9IGN1c3RvbUFnZ3JlZ2F0ZXMgPyBjdXN0b21BZ2dyZWdhdGVzIDogW107XG5cdFx0cmV0dXJuIHsgdHJhbnNBZ2dyZWdhdGlvbnMsIGN1c3RvbUFnZ3JlZ2F0ZXMgfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGNvbnZlcnRlckNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzTWV0YVBhdGhcblx0ICogQHBhcmFtIG9WaWV3XG5cdCAqIEBwYXJhbSBvRGlhZ25vc3RpY3Ncblx0ICogQHJldHVybnMgLSBDb252ZXJ0ZXJDb250ZXh0XG5cdCAqL1xuXHRfZ2V0Q29udmVydGVyQ29udGV4dChzTWV0YVBhdGg6IHN0cmluZywgb1ZpZXc6IEZFVmlldywgb0RpYWdub3N0aWNzOiBEaWFnbm9zdGljcykge1xuXHRcdGNvbnN0IG9WaWV3RGF0YTogYW55ID0gb1ZpZXcuZ2V0Vmlld0RhdGEoKTtcblx0XHRsZXQgc0VudGl0eVNldCA9IG9WaWV3RGF0YS5lbnRpdHlTZXQ7XG5cdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gb1ZpZXdEYXRhLmNvbnRleHRQYXRoO1xuXHRcdGlmIChzQ29udGV4dFBhdGggJiYgKCFzRW50aXR5U2V0IHx8IHNFbnRpdHlTZXQuaW5jbHVkZXMoXCIvXCIpKSkge1xuXHRcdFx0c0VudGl0eVNldCA9IG9WaWV3RGF0YT8uZnVsbENvbnRleHRQYXRoLnNwbGl0KFwiL1wiKVsxXTtcblx0XHR9XG5cdFx0cmV0dXJuIENvbW1vblV0aWxzLmdldENvbnZlcnRlckNvbnRleHRGb3JQYXRoKHNNZXRhUGF0aCwgb1ZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSwgc0VudGl0eVNldCwgb0RpYWdub3N0aWNzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiBwYXRoLWJhc2VkIEZpZWxkQ29udHJvbCBldmFsdWF0ZXMgdG8gaW5hcHBsaWNhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0ZpZWxkQ29udHJvbFBhdGggRmllbGQgY29udHJvbCBwYXRoXG5cdCAqIEBwYXJhbSBvQXR0cmlidXRlIFNlbWFudGljQXR0cmlidXRlc1xuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaW5hcHBsaWNhYmxlXG5cdCAqL1xuXHRfaXNGaWVsZENvbnRyb2xQYXRoSW5hcHBsaWNhYmxlKHNGaWVsZENvbnRyb2xQYXRoOiBzdHJpbmcsIG9BdHRyaWJ1dGU6IGFueSkge1xuXHRcdGxldCBiSW5hcHBsaWNhYmxlID0gZmFsc2U7XG5cdFx0Y29uc3QgYVBhcnRzID0gc0ZpZWxkQ29udHJvbFBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdC8vIHNlbnNpdGl2ZSBkYXRhIGlzIHJlbW92ZWQgb25seSBpZiB0aGUgcGF0aCBoYXMgYWxyZWFkeSBiZWVuIHJlc29sdmVkLlxuXHRcdGlmIChhUGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0YkluYXBwbGljYWJsZSA9XG5cdFx0XHRcdG9BdHRyaWJ1dGVbYVBhcnRzWzBdXSAmJiBvQXR0cmlidXRlW2FQYXJ0c1swXV0uaGFzT3duUHJvcGVydHkoYVBhcnRzWzFdKSAmJiBvQXR0cmlidXRlW2FQYXJ0c1swXV1bYVBhcnRzWzFdXSA9PT0gMDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YkluYXBwbGljYWJsZSA9IG9BdHRyaWJ1dGVbc0ZpZWxkQ29udHJvbFBhdGhdID09PSAwO1xuXHRcdH1cblx0XHRyZXR1cm4gYkluYXBwbGljYWJsZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gcmVwbGFjZSBMb2NhbCBQcm9wZXJ0aWVzIHdpdGggU2VtYW50aWMgT2JqZWN0IG1hcHBpbmdzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1NlbGVjdGlvblZhcmlhbnQgU2VsZWN0aW9uVmFyaWFudCBjb25zaXN0aW5nIG9mIGZpbHRlcmJhciwgVGFibGUgYW5kIFBhZ2UgQ29udGV4dFxuXHQgKiBAcGFyYW0gdk1hcHBpbmdzIEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHNlbWFudGljIG9iamVjdCBtYXBwaW5nXG5cdCAqIEByZXR1cm5zIC0gTW9kaWZpZWQgU2VsZWN0aW9uVmFyaWFudCB3aXRoIExvY2FsUHJvcGVydHkgcmVwbGFjZWQgd2l0aCBTZW1hbnRpY09iamVjdFByb3BlcnRpZXMuXG5cdCAqL1xuXHRfYXBwbHlTZW1hbnRpY09iamVjdE1hcHBpbmdzKG9TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50LCB2TWFwcGluZ3M6IG9iamVjdCB8IHN0cmluZykge1xuXHRcdGNvbnN0IG9NYXBwaW5ncyA9IHR5cGVvZiB2TWFwcGluZ3MgPT09IFwic3RyaW5nXCIgPyBKU09OLnBhcnNlKHZNYXBwaW5ncykgOiB2TWFwcGluZ3M7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvTWFwcGluZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHNMb2NhbFByb3BlcnR5ID1cblx0XHRcdFx0KG9NYXBwaW5nc1tpXVtcIkxvY2FsUHJvcGVydHlcIl0gJiYgb01hcHBpbmdzW2ldW1wiTG9jYWxQcm9wZXJ0eVwiXVtcIiRQcm9wZXJ0eVBhdGhcIl0pIHx8XG5cdFx0XHRcdChvTWFwcGluZ3NbaV1bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxvY2FsUHJvcGVydHlcIl0gJiZcblx0XHRcdFx0XHRvTWFwcGluZ3NbaV1bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxvY2FsUHJvcGVydHlcIl1bXCIkUGF0aFwiXSk7XG5cdFx0XHRjb25zdCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSA9XG5cdFx0XHRcdG9NYXBwaW5nc1tpXVtcIlNlbWFudGljT2JqZWN0UHJvcGVydHlcIl0gfHwgb01hcHBpbmdzW2ldW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFByb3BlcnR5XCJdO1xuXHRcdFx0Y29uc3Qgb1NlbGVjdE9wdGlvbiA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbihzTG9jYWxQcm9wZXJ0eSk7XG5cdFx0XHRpZiAob1NlbGVjdE9wdGlvbikge1xuXHRcdFx0XHQvL0NyZWF0ZSBhIG5ldyBTZWxlY3RPcHRpb24gd2l0aCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSBhcyB0aGUgcHJvcGVydHkgTmFtZSBhbmQgcmVtb3ZlIHRoZSBvbGRlciBvbmVcblx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQucmVtb3ZlU2VsZWN0T3B0aW9uKHNMb2NhbFByb3BlcnR5KTtcblx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQubWFzc0FkZFNlbGVjdE9wdGlvbihzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSwgb1NlbGVjdE9wdGlvbik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvU2VsZWN0aW9uVmFyaWFudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gYW4gT3V0Ym91bmQgcHJvdmlkZWQgaW4gdGhlIG1hbmlmZXN0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIHNPdXRib3VuZCBJZGVudGlmaWVyIHRvIGxvY2F0aW9uIHRoZSBvdXRib3VuZCBpbiB0aGUgbWFuaWZlc3Rcblx0ICogQHBhcmFtIG1OYXZpZ2F0aW9uUGFyYW1ldGVycyBPcHRpb25hbCBtYXAgY29udGFpbmluZyBrZXkvdmFsdWUgcGFpcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBpbnRlbnRcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVudEJhc2VkTmF2aWdhdGlvbiNuYXZpZ2F0ZU91dGJvdW5kXG5cdCAqIEBzaW5jZSAxLjg2LjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZU91dGJvdW5kKHNPdXRib3VuZDogc3RyaW5nLCBtTmF2aWdhdGlvblBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGxldCBhTmF2UGFyYW1zOiBhbnlbXSB8IHVuZGVmaW5lZDtcblx0XHRjb25zdCBvTWFuaWZlc3RFbnRyeSA9IHRoaXMuYmFzZS5nZXRBcHBDb21wb25lbnQoKS5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLmFwcFwiKSxcblx0XHRcdG9PdXRib3VuZCA9IG9NYW5pZmVzdEVudHJ5LmNyb3NzTmF2aWdhdGlvbj8ub3V0Ym91bmRzPy5bc091dGJvdW5kXTtcblx0XHRpZiAoIW9PdXRib3VuZCkge1xuXHRcdFx0TG9nLmVycm9yKFwiT3V0Ym91bmQgaXMgbm90IGRlZmluZWQgaW4gbWFuaWZlc3QhIVwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0ID0gb091dGJvdW5kLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0c0FjdGlvbiA9IG9PdXRib3VuZC5hY3Rpb24sXG5cdFx0XHRvdXRib3VuZFBhcmFtcyA9IG9PdXRib3VuZC5wYXJhbWV0ZXJzICYmIHRoaXMuZ2V0T3V0Ym91bmRQYXJhbXMob091dGJvdW5kLnBhcmFtZXRlcnMpO1xuXG5cdFx0aWYgKG1OYXZpZ2F0aW9uUGFyYW1ldGVycykge1xuXHRcdFx0YU5hdlBhcmFtcyA9IFtdO1xuXHRcdFx0T2JqZWN0LmtleXMobU5hdmlnYXRpb25QYXJhbWV0ZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXk6IHN0cmluZykge1xuXHRcdFx0XHRsZXQgb1BhcmFtczogYW55O1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShtTmF2aWdhdGlvblBhcmFtZXRlcnNba2V5XSkpIHtcblx0XHRcdFx0XHRjb25zdCBhVmFsdWVzID0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzW2tleV07XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRvUGFyYW1zID0ge307XG5cdFx0XHRcdFx0XHRvUGFyYW1zW2tleV0gPSBhVmFsdWVzW2ldO1xuXHRcdFx0XHRcdFx0YU5hdlBhcmFtcz8ucHVzaChvUGFyYW1zKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b1BhcmFtcyA9IHt9O1xuXHRcdFx0XHRcdG9QYXJhbXNba2V5XSA9IG1OYXZpZ2F0aW9uUGFyYW1ldGVyc1trZXldO1xuXHRcdFx0XHRcdGFOYXZQYXJhbXM/LnB1c2gob1BhcmFtcyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAoYU5hdlBhcmFtcyB8fCBvdXRib3VuZFBhcmFtcykge1xuXHRcdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzID0ge1xuXHRcdFx0XHRuYXZpZ2F0aW9uQ29udGV4dHM6IHtcblx0XHRcdFx0XHRkYXRhOiBhTmF2UGFyYW1zIHx8IG91dGJvdW5kUGFyYW1zXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHRcdHRoaXMuYmFzZS5faW50ZW50QmFzZWROYXZpZ2F0aW9uLm5hdmlnYXRlKHNTZW1hbnRpY09iamVjdCwgc0FjdGlvbiwgbU5hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gYXBwbHkgb3V0Ym91bmQgcGFyYW1ldGVycyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHBhcmFtIG9TZWxlY3Rpb25WYXJpYW50IFNlbGVjdGlvblZhcmlhbnQgY29uc2lzdGluZyBvZiBhIGZpbHRlciBiYXIsIGEgdGFibGUsIGFuZCBhIHBhZ2UgY29udGV4dFxuXHQgKiBAcGFyYW0gdk91dGJvdW5kUGFyYW1zIE91dGJvdW5kIFByb3BlcnRpZXMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3Rcblx0ICogQHJldHVybnMgLSBUaGUgbW9kaWZpZWQgU2VsZWN0aW9uVmFyaWFudCB3aXRoIG91dGJvdW5kIHBhcmFtZXRlcnMuXG5cdCAqL1xuXHRfYXBwbHlPdXRib3VuZFBhcmFtcyhvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCwgdk91dGJvdW5kUGFyYW1zOiBhbnkpIHtcblx0XHRjb25zdCBhUGFyYW1ldGVycyA9IE9iamVjdC5rZXlzKHZPdXRib3VuZFBhcmFtcyk7XG5cdFx0Y29uc3QgYVNlbGVjdFByb3BlcnRpZXMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcygpO1xuXHRcdGFQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGtleTogc3RyaW5nKSB7XG5cdFx0XHRpZiAoIWFTZWxlY3RQcm9wZXJ0aWVzLmluY2x1ZGVzKGtleSkpIHtcblx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKGtleSwgXCJJXCIsIFwiRVFcIiwgdk91dGJvdW5kUGFyYW1zW2tleV0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBvU2VsZWN0aW9uVmFyaWFudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBvdXRib3VuZCBwYXJhbWV0ZXJzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIG9PdXRib3VuZFBhcmFtcyBQYXJhbWV0ZXJzIGRlZmluZWQgaW4gdGhlIG91dGJvdW5kcy4gT25seSBcInBsYWluXCIgaXMgc3VwcG9ydGVkXG5cdCAqIEByZXR1cm5zIFBhcmFtZXRlcnMgd2l0aCB0aGUga2V5LVZhbHVlIHBhaXJcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRPdXRib3VuZFBhcmFtcyhvT3V0Ym91bmRQYXJhbXM6IGFueSkge1xuXHRcdGNvbnN0IG9QYXJhbXNNYXBwaW5nOiBhbnkgPSB7fTtcblx0XHRpZiAob091dGJvdW5kUGFyYW1zKSB7XG5cdFx0XHRjb25zdCBhUGFyYW1ldGVycyA9IE9iamVjdC5rZXlzKG9PdXRib3VuZFBhcmFtcykgfHwgW107XG5cdFx0XHRpZiAoYVBhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRhUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChrZXk6IHN0cmluZykge1xuXHRcdFx0XHRcdGNvbnN0IG9NYXBwaW5nID0gb091dGJvdW5kUGFyYW1zW2tleV07XG5cdFx0XHRcdFx0aWYgKG9NYXBwaW5nLnZhbHVlICYmIG9NYXBwaW5nLnZhbHVlLnZhbHVlICYmIG9NYXBwaW5nLnZhbHVlLmZvcm1hdCA9PT0gXCJwbGFpblwiKSB7XG5cdFx0XHRcdFx0XHRpZiAoIW9QYXJhbXNNYXBwaW5nW2tleV0pIHtcblx0XHRcdFx0XHRcdFx0b1BhcmFtc01hcHBpbmdba2V5XSA9IG9NYXBwaW5nLnZhbHVlLnZhbHVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvUGFyYW1zTWFwcGluZztcblx0fVxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VycyBhbiBvdXRib3VuZCBuYXZpZ2F0aW9uIHdoZW4gYSB1c2VyIGNob29zZXMgdGhlIGNoZXZyb24uXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvQ29udHJvbGxlclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc091dGJvdW5kVGFyZ2V0IE5hbWUgb2YgdGhlIG91dGJvdW5kIHRhcmdldCAobmVlZHMgdG8gYmUgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QpXG5cdCAqIEBwYXJhbSB7c2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9IG9Db250ZXh0IFRoZSBjb250ZXh0IHRoYXQgY29udGFpbnMgdGhlIGRhdGEgZm9yIHRoZSB0YXJnZXQgYXBwXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzQ3JlYXRlUGF0aCBDcmVhdGUgcGF0aCB3aGVuIHRoZSBjaGV2cm9uIGlzIGNyZWF0ZWQuXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIG9uY2UgdGhlIG5hdmlnYXRpb24gaXMgdHJpZ2dlcmVkXG5cdCAqL1xuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRvbkNoZXZyb25QcmVzc05hdmlnYXRlT3V0Qm91bmQob0NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyLCBzT3V0Ym91bmRUYXJnZXQ6IHN0cmluZywgb0NvbnRleHQ6IGFueSwgc0NyZWF0ZVBhdGg6IHN0cmluZykge1xuXHRcdGNvbnN0IG9PdXRib3VuZHMgPSAob0NvbnRyb2xsZXIuZ2V0QXBwQ29tcG9uZW50KCkgYXMgYW55KS5nZXRSb3V0aW5nU2VydmljZSgpLmdldE91dGJvdW5kcygpO1xuXHRcdGNvbnN0IG9EaXNwbGF5T3V0Ym91bmQgPSBvT3V0Ym91bmRzW3NPdXRib3VuZFRhcmdldF07XG5cdFx0bGV0IGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVycztcblx0XHRpZiAob0Rpc3BsYXlPdXRib3VuZCAmJiBvRGlzcGxheU91dGJvdW5kLnNlbWFudGljT2JqZWN0ICYmIG9EaXNwbGF5T3V0Ym91bmQuYWN0aW9uKSB7XG5cdFx0XHRjb25zdCBvUmVmcmVzaFN0cmF0ZWdpZXM6IGFueSA9IHtcblx0XHRcdFx0aW50ZW50czoge31cblx0XHRcdH07XG5cdFx0XHRjb25zdCBvRGVmYXVsdFJlZnJlc2hTdHJhdGVneTogYW55ID0ge307XG5cdFx0XHRsZXQgc01ldGFQYXRoO1xuXG5cdFx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdFx0aWYgKG9Db250ZXh0LmlzQSAmJiBvQ29udGV4dC5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dFwiKSkge1xuXHRcdFx0XHRcdHNNZXRhUGF0aCA9IE1vZGVsSGVscGVyLmdldE1ldGFQYXRoRm9yQ29udGV4dChvQ29udGV4dCk7XG5cdFx0XHRcdFx0b0NvbnRleHQgPSBbb0NvbnRleHRdO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNNZXRhUGF0aCA9IE1vZGVsSGVscGVyLmdldE1ldGFQYXRoRm9yQ29udGV4dChvQ29udGV4dFswXSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0b0RlZmF1bHRSZWZyZXNoU3RyYXRlZ3lbc01ldGFQYXRoXSA9IFwic2VsZlwiO1xuXHRcdFx0XHRvUmVmcmVzaFN0cmF0ZWdpZXNbXCJfZmVEZWZhdWx0XCJdID0gb0RlZmF1bHRSZWZyZXNoU3RyYXRlZ3k7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChzQ3JlYXRlUGF0aCkge1xuXHRcdFx0XHRjb25zdCBzS2V5ID0gYCR7b0Rpc3BsYXlPdXRib3VuZC5zZW1hbnRpY09iamVjdH0tJHtvRGlzcGxheU91dGJvdW5kLmFjdGlvbn1gO1xuXHRcdFx0XHRvUmVmcmVzaFN0cmF0ZWdpZXMuaW50ZW50c1tzS2V5XSA9IHt9O1xuXHRcdFx0XHRvUmVmcmVzaFN0cmF0ZWdpZXMuaW50ZW50c1tzS2V5XVtzQ3JlYXRlUGF0aF0gPSBcInNlbGZcIjtcblx0XHRcdH1cblx0XHRcdGlmIChvRGlzcGxheU91dGJvdW5kICYmIG9EaXNwbGF5T3V0Ym91bmQucGFyYW1ldGVycykge1xuXHRcdFx0XHRjb25zdCBvUGFyYW1zID0gb0Rpc3BsYXlPdXRib3VuZC5wYXJhbWV0ZXJzICYmIHRoaXMuZ2V0T3V0Ym91bmRQYXJhbXMob0Rpc3BsYXlPdXRib3VuZC5wYXJhbWV0ZXJzKTtcblx0XHRcdFx0aWYgKE9iamVjdC5rZXlzKG9QYXJhbXMpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRhZGRpdGlvbmFsTmF2aWdhdGlvblBhcmFtZXRlcnMgPSBvUGFyYW1zO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdG9Db250cm9sbGVyLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ubmF2aWdhdGUob0Rpc3BsYXlPdXRib3VuZC5zZW1hbnRpY09iamVjdCwgb0Rpc3BsYXlPdXRib3VuZC5hY3Rpb24sIHtcblx0XHRcdFx0bmF2aWdhdGlvbkNvbnRleHRzOiBvQ29udGV4dCxcblx0XHRcdFx0cmVmcmVzaFN0cmF0ZWdpZXM6IG9SZWZyZXNoU3RyYXRlZ2llcyxcblx0XHRcdFx0YWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzOiBhZGRpdGlvbmFsTmF2aWdhdGlvblBhcmFtZXRlcnNcblx0XHRcdH0pO1xuXG5cdFx0XHQvL1RPRE86IGNoZWNrIHdoeSByZXR1cm5pbmcgYSBwcm9taXNlIGlzIHJlcXVpcmVkXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgb3V0Ym91bmQgdGFyZ2V0ICR7c091dGJvdW5kVGFyZ2V0fSBub3QgZm91bmQgaW4gY3Jvc3MgbmF2aWdhdGlvbiBkZWZpbml0aW9uIG9mIG1hbmlmZXN0YCk7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7OztFQXVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUEEsSUFTTUEsNkJBQTZCLFdBRGxDQyxjQUFjLENBQUMsa0VBQWtFLENBQUMsVUFZakZDLGNBQWMsRUFBRSxVQWtDaEJDLGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBbUpoQkQsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsVUFvSGhCRCxlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRSxVQTJGaEJELGVBQWUsRUFBRSxXQUNqQkUsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsT0FBTyxDQUFDLFdBY3JDSixlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQWtDaEJJLGdCQUFnQixFQUFFLFdBY2xCTCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQXNMaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBa0VoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0E2QmhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRTtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQS90QmpCSyxNQUFNLEdBRE4sa0JBQ1M7TUFDUixJQUFJLENBQUNDLGNBQWMsR0FBRyxJQUFJLENBQUNDLElBQUksQ0FBQ0MsZUFBZSxFQUFFO01BQ2pELElBQUksQ0FBQ0MsV0FBVyxHQUFHLElB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