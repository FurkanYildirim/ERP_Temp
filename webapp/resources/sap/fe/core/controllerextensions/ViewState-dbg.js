/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/navigation/library", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/fl/apply/api/ControlVariantApplyAPI", "sap/fe/core/controls/filterbar/adapter/SelectionVariantToStateFilters", "sap/ui/mdc/p13n/StateUtil"], function (Log, mergeObjects, CommonUtils, ClassSupport, KeepAliveHelper, ModelHelper, NavLibrary, ControllerExtension, OverrideExecution, ControlVariantApplyAPI, SelectionVariantToStateFilters, StateUtil) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  // additionalStates are stored next to control IDs, so name clash avoidance needed. Fortunately IDs have restrictions:
  // "Allowed is a sequence of characters (capital/lowercase), digits, underscores, dashes, points and/or colons."
  // Therefore adding a symbol like # or @
  const ADDITIONAL_STATES_KEY = "#additionalStates",
    NavType = NavLibrary.NavType;

  /**
   * Definition of a custom action to be used inside the table toolbar
   *
   * @alias sap.fe.core.controllerextensions.ViewState.NavigationParameter
   * @public
   */

  ///////////////////////////////////////////////////////////////////
  // methods to retrieve & apply states for the different controls //
  ///////////////////////////////////////////////////////////////////

  const _mControlStateHandlerMap = {
    "sap.ui.fl.variants.VariantManagement": {
      retrieve: function (oVM) {
        return {
          variantId: oVM.getCurrentVariantKey()
        };
      },
      apply: async function (oVM, controlState) {
        try {
          if (controlState && controlState.variantId !== undefined && controlState.variantId !== oVM.getCurrentVariantKey()) {
            const isVariantIdAvailable = this._checkIfVariantIdIsAvailable(oVM, controlState.variantId);
            let sVariantReference;
            if (isVariantIdAvailable) {
              sVariantReference = controlState.variantId;
            } else {
              sVariantReference = oVM.getStandardVariantKey();
              this.controlsVariantIdUnavailable.push(...oVM.getFor());
            }
            try {
              await ControlVariantApplyAPI.activateVariant({
                element: oVM,
                variantReference: sVariantReference
              });
              await this._setInitialStatesForDeltaCompute(oVM);
            } catch (error) {
              Log.error(error);
              this.invalidateInitialStateForApply.push(...oVM.getFor());
              await this._setInitialStatesForDeltaCompute(oVM);
            }
          } else {
            this._setInitialStatesForDeltaCompute(oVM);
          }
        } catch (error) {
          Log.error(error);
        }
      }
    },
    "sap.m.IconTabBar": {
      retrieve: function (oTabBar) {
        return {
          selectedKey: oTabBar.getSelectedKey()
        };
      },
      apply: function (oTabBar, oControlState) {
        if (oControlState && oControlState.selectedKey) {
          const oSelectedItem = oTabBar.getItems().find(function (oItem) {
            return oItem.getKey() === oControlState.selectedKey;
          });
          if (oSelectedItem) {
            oTabBar.setSelectedItem(oSelectedItem);
          }
        }
      }
    },
    "sap.ui.mdc.FilterBar": {
      retrieve: async function (filterBar) {
        const controlStateKey = this.getStateKey(filterBar);
        const filterBarState = await StateUtil.retrieveExternalState(filterBar);
        // remove sensitive or view state irrelevant fields
        const propertiesInfo = filterBar.getPropertyInfoSet();
        const filter = filterBarState.filter || {};
        propertiesInfo.filter(function (PropertyInfo) {
          return Object.keys(filter).length > 0 && PropertyInfo.path && filter[PropertyInfo.path] && (PropertyInfo.removeFromAppState || filter[PropertyInfo.path].length === 0);
        }).forEach(function (PropertyInfo) {
          if (PropertyInfo.path) {
            delete filter[PropertyInfo.path];
          }
        });
        return this._getControlState(controlStateKey, filterBarState);
      },
      apply: async function (filterBar, controlState, navParameter) {
        try {
          if (controlState) {
            const isInitialStateApplicable = this._isInitialStatesApplicable(controlState === null || controlState === void 0 ? void 0 : controlState.initialState, filterBar);
            const navigationType = navParameter.navigationType;
            //Whwn navigation type is hybrid, we override the filter conditions in IAppState with SV received from XappState
            if (navigationType === NavType.hybrid && controlState.fullState !== undefined) {
              const filterBarPropertyInfos = await SelectionVariantToStateFilters.getFilterBarSupportedFields(filterBar),
                filterBarInfoForConversion = SelectionVariantToStateFilters.getFilterBarInfoForConversion(filterBar),
                xAppStateFilters = SelectionVariantToStateFilters.getConditionsFromSV(navParameter.selectionVariant, filterBarInfoForConversion, filterBarPropertyInfos);
              const mergedFullState = {
                ...controlState.fullState,
                filter: {
                  ...controlState.fullState.filter,
                  ...xAppStateFilters
                }
              };
              return StateUtil.applyExternalState(filterBar, mergedFullState);
            }
            if (isInitialStateApplicable) {
              const diffState = await StateUtil.diffState(filterBar, controlState.initialState, controlState.fullState);
              return StateUtil.applyExternalState(filterBar, diffState);
            }
            return StateUtil.applyExternalState(filterBar, (controlState === null || controlState === void 0 ? void 0 : controlState.fullState) ?? controlState);
          }
        } catch (error) {
          Log.error(error);
        }
      }
    },
    "sap.ui.mdc.Table": {
      retrieve: async function (table) {
        const controlStateKey = this.getStateKey(table);
        const tableState = await StateUtil.retrieveExternalState(table);
        return this._getControlState(controlStateKey, tableState);
      },
      apply: async function (table, controlState, navParameters) {
        try {
          if (controlState) {
            // Extra condition added to apply the diff state logic for mdc control
            const isInitialStateApplicable = this._isInitialStatesApplicable(controlState === null || controlState === void 0 ? void 0 : controlState.initialState, table, navParameters.navigationType !== NavType.hybrid);
            if (isInitialStateApplicable) {
              var _controlState$initial;
              if (controlState.initialState && !((_controlState$initial = controlState.initialState) !== null && _controlState$initial !== void 0 && _controlState$initial.supplementaryConfig)) {
                controlState.initialState.supplementaryConfig = {};
              }
              const oDiffState = await StateUtil.diffState(table, controlState.initialState, controlState.fullState);
              return StateUtil.applyExternalState(table, oDiffState);
            } else {
              if (!controlState.supplementaryConfig) {
                controlState.supplementaryConfig = {};
              }
              return StateUtil.applyExternalState(table, (controlState === null || controlState === void 0 ? void 0 : controlState.fullState) ?? controlState);
            }
          }
        } catch (error) {
          Log.error(error);
        }
      },
      refreshBinding: function (oTable) {
        const oTableBinding = oTable.getRowBinding();
        if (oTableBinding) {
          const oRootBinding = oTableBinding.getRootBinding();
          if (oRootBinding === oTableBinding) {
            // absolute binding
            oTableBinding.refresh();
          } else {
            // relative binding
            const oHeaderContext = oTableBinding.getHeaderContext();
            const sGroupId = oTableBinding.getGroupId();
            if (oHeaderContext) {
              oHeaderContext.requestSideEffects([{
                $NavigationPropertyPath: ""
              }], sGroupId);
            }
          }
        } else {
          Log.info(`Table: ${oTable.getId()} was not refreshed. No binding found!`);
        }
      }
    },
    "sap.ui.mdc.Chart": {
      retrieve: function (oChart) {
        return StateUtil.retrieveExternalState(oChart);
      },
      apply: function (oChart, oControlState) {
        if (oControlState) {
          return StateUtil.applyExternalState(oChart, oControlState);
        }
      }
      // TODO: uncomment after mdc fix is merged
      /* retrieve: async function (chart: Chart) {
      	const controlStateKey = this.getStateKey(chart);
      	const chartState = await StateUtil.retrieveExternalState(chart);
      		return this._getControlState(controlStateKey, chartState);
      },
      apply: async function (chart: Chart, controlState: ControlState) {
      	try {
      		if (controlState) {
      			// Extra condition added to apply the diff state logic for mdc control
      			const isInitialStateApplicable = controlState?.initialState && this.invalidateInitialStateForApply.indexOf(chart.getId()) === -1 && this.controlsVariantIdUnavailable.indexOf(chart.getId()) === -1;
      				if (isInitialStateApplicable) {
      				const diffState = await StateUtil.diffState(
      					chart,
      					controlState.initialState as object,
      					controlState.fullState as object
      				);
      				return await StateUtil.applyExternalState(chart, diffState);
      			} else {
      				return await StateUtil.applyExternalState(chart, controlState?.fullState ?? controlState);
      			}
      		}
      	} catch (error) {
      		Log.error(error as string);
      	}
      } */
    },

    "sap.uxap.ObjectPageLayout": {
      retrieve: function (oOPLayout) {
        return {
          selectedSection: oOPLayout.getSelectedSection()
        };
      },
      apply: function (oOPLayout, oControlState) {
        if (oControlState) {
          oOPLayout.setSelectedSection(oControlState.selectedSection);
        }
      },
      refreshBinding: function (oOPLayout) {
        const oBindingContext = oOPLayout.getBindingContext();
        const oBinding = oBindingContext && oBindingContext.getBinding();
        if (oBinding) {
          const sMetaPath = ModelHelper.getMetaPathForContext(oBindingContext);
          const sStrategy = KeepAliveHelper.getControlRefreshStrategyForContextPath(oOPLayout, sMetaPath);
          if (sStrategy === "self") {
            // Refresh main context and 1-1 navigation properties or OP
            const oModel = oBindingContext.getModel(),
              oMetaModel = oModel.getMetaModel(),
              oNavigationProperties = CommonUtils.getContextPathProperties(oMetaModel, sMetaPath, {
                $kind: "NavigationProperty"
              }) || {},
              aNavPropertiesToRequest = Object.keys(oNavigationProperties).reduce(function (aPrev, sNavProp) {
                if (oNavigationProperties[sNavProp].$isCollection !== true) {
                  aPrev.push({
                    $NavigationPropertyPath: sNavProp
                  });
                }
                return aPrev;
              }, []),
              aProperties = [{
                $PropertyPath: "*"
              }],
              sGroupId = oBinding.getGroupId();
            oBindingContext.requestSideEffects(aProperties.concat(aNavPropertiesToRequest), sGroupId);
          } else if (sStrategy === "includingDependents") {
            // Complete refresh
            oBinding.refresh();
          }
        } else {
          Log.info(`ObjectPage: ${oOPLayout.getId()} was not refreshed. No binding found!`);
        }
      }
    },
    "sap.m.SegmentedButton": {
      retrieve: function (oSegmentedButton) {
        return {
          selectedKey: oSegmentedButton.getSelectedKey()
        };
      },
      apply: function (oSegmentedButton, oControlState) {
        if (oControlState !== null && oControlState !== void 0 && oControlState.selectedKey && oControlState.selectedKey !== oSegmentedButton.getSelectedKey()) {
          var _oSegmentedButton$get;
          oSegmentedButton.setSelectedKey(oControlState.selectedKey);
          if ((_oSegmentedButton$get = oSegmentedButton.getParent()) !== null && _oSegmentedButton$get !== void 0 && _oSegmentedButton$get.isA("sap.ui.mdc.ActionToolbar")) {
            oSegmentedButton.fireEvent("selectionChange");
          }
        }
      }
    },
    "sap.m.Select": {
      retrieve: function (oSelect) {
        return {
          selectedKey: oSelect.getSelectedKey()
        };
      },
      apply: function (oSelect, oControlState) {
        if (oControlState !== null && oControlState !== void 0 && oControlState.selectedKey && oControlState.selectedKey !== oSelect.getSelectedKey()) {
          var _oSelect$getParent;
          oSelect.setSelectedKey(oControlState.selectedKey);
          if ((_oSelect$getParent = oSelect.getParent()) !== null && _oSelect$getParent !== void 0 && _oSelect$getParent.isA("sap.ui.mdc.ActionToolbar")) {
            oSelect.fireEvent("change");
          }
        }
      }
    },
    "sap.f.DynamicPage": {
      retrieve: function (oDynamicPage) {
        return {
          headerExpanded: oDynamicPage.getHeaderExpanded()
        };
      },
      apply: function (oDynamicPage, oControlState) {
        if (oControlState) {
          oDynamicPage.setHeaderExpanded(oControlState.headerExpanded);
        }
      }
    },
    "sap.ui.core.mvc.View": {
      retrieve: function (oView) {
        const oController = oView.getController();
        if (oController && oController.viewState) {
          return oController.viewState.retrieveViewState(oController.viewState);
        }
        return {};
      },
      apply: function (oView, oControlState, oNavParameters) {
        const oController = oView.getController();
        if (oController && oController.viewState) {
          return oController.viewState.applyViewState(oControlState, oNavParameters);
        }
      },
      refreshBinding: function (oView) {
        const oController = oView.getController();
        if (oController && oController.viewState) {
          return oController.viewState.refreshViewBindings();
        }
      }
    },
    "sap.ui.core.ComponentContainer": {
      retrieve: function (oComponentContainer) {
        const oComponent = oComponentContainer.getComponentInstance();
        if (oComponent) {
          return this.retrieveControlState(oComponent.getRootControl());
        }
        return {};
      },
      apply: function (oComponentContainer, oControlState, oNavParameters) {
        const oComponent = oComponentContainer.getComponentInstance();
        if (oComponent) {
          return this.applyControlState(oComponent.getRootControl(), oControlState, oNavParameters);
        }
      }
    }
  };
  /**
   * A controller extension offering hooks for state handling
   *
   * If you need to maintain a specific state for your application, you can use the controller extension.
   *
   * @hideconstructor
   * @public
   * @since 1.85.0
   */
  let ViewState = (_dec = defineUI5Class("sap.fe.core.controllerextensions.ViewState"), _dec2 = publicExtension(), _dec3 = finalExtension(), _dec4 = publicExtension(), _dec5 = extensible(OverrideExecution.After), _dec6 = privateExtension(), _dec7 = finalExtension(), _dec8 = privateExtension(), _dec9 = finalExtension(), _dec10 = publicExtension(), _dec11 = extensible(OverrideExecution.After), _dec12 = publicExtension(), _dec13 = extensible(OverrideExecution.After), _dec14 = publicExtension(), _dec15 = extensible(OverrideExecution.After), _dec16 = privateExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = extensible(OverrideExecution.After), _dec20 = privateExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = extensible(OverrideExecution.After), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = finalExtension(), _dec28 = publicExtension(), _dec29 = extensible(OverrideExecution.After), _dec30 = privateExtension(), _dec31 = finalExtension(), _dec32 = publicExtension(), _dec33 = extensible(OverrideExecution.Instead), _dec34 = publicExtension(), _dec35 = finalExtension(), _dec36 = privateExtension(), _dec37 = publicExtension(), _dec38 = extensible(OverrideExecution.After), _dec39 = publicExtension(), _dec40 = extensible(OverrideExecution.After), _dec41 = publicExtension(), _dec42 = extensible(OverrideExecution.After), _dec43 = privateExtension(), _dec44 = publicExtension(), _dec45 = extensible(OverrideExecution.After), _dec46 = privateExtension(), _dec47 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(ViewState, _ControllerExtension);
    /**
     * Constructor.
     */
    function ViewState() {
      var _this;
      _this = _ControllerExtension.call(this) || this;
      _this.initialControlStatesMapper = {};
      _this.controlsVariantIdUnavailable = [];
      _this.invalidateInitialStateForApply = [];
      _this.viewStateControls = [];
      _this._setInitialStatesForDeltaCompute = async variantManagement => {
        try {
          const adaptControls = _this.viewStateControls;
          const externalStatePromises = [];
          const controlStateKey = [];
          let initialControlStates = [];
          const variantControls = (variantManagement === null || variantManagement === void 0 ? void 0 : variantManagement.getFor()) ?? [];
          adaptControls.filter(function (control) {
            return control && (!variantManagement || variantControls.indexOf(control.getId()) > -1) && (control.isA("sap.ui.mdc.Table") || control.isA("sap.ui.mdc.FilterBar") || control.isA("sap.ui.mdc.Chart"));
          }).forEach(control => {
            if (variantManagement) {
              _this._addEventListenersToVariantManagement(variantManagement, variantControls);
            }
            const externalStatePromise = StateUtil.retrieveExternalState(control);
            externalStatePromises.push(externalStatePromise);
            controlStateKey.push(_this.getStateKey(control));
          });
          initialControlStates = await Promise.all(externalStatePromises);
          initialControlStates.forEach((initialControlState, i) => {
            _this.initialControlStatesMapper[controlStateKey[i]] = initialControlState;
          });
        } catch (e) {
          Log.error(e);
        }
      };
      _this._iRetrievingStateCounter = 0;
      _this._pInitialStateApplied = new Promise(resolve => {
        _this._pInitialStateAppliedResolve = resolve;
      });
      return _this;
    }
    var _proto = ViewState.prototype;
    _proto.refreshViewBindings = async function refreshViewBindings() {
      const aControls = await this.collectResults(this.base.viewState.adaptBindingRefreshControls);
      let oPromiseChain = Promise.resolve();
      aControls.filter(oControl => {
        return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
      }).forEach(oControl => {
        oPromiseChain = oPromiseChain.then(this.refreshControlBinding.bind(this, oControl));
      });
      return oPromiseChain;
    }

    /**
     * This function should add all controls relevant for refreshing to the provided control array.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aCollectedControls The collected controls
     * @alias sap.fe.core.controllerextensions.ViewState#adaptBindingRefreshControls
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptBindingRefreshControls = function adaptBindingRefreshControls(aCollectedControls) {
      // to be overriden
    };
    _proto.refreshControlBinding = function refreshControlBinding(oControl) {
      const oControlRefreshBindingHandler = this.getControlRefreshBindingHandler(oControl);
      let oPromiseChain = Promise.resolve();
      if (typeof oControlRefreshBindingHandler.refreshBinding !== "function") {
        Log.info(`refreshBinding handler for control: ${oControl.getMetadata().getName()} is not provided`);
      } else {
        oPromiseChain = oPromiseChain.then(oControlRefreshBindingHandler.refreshBinding.bind(this, oControl));
      }
      return oPromiseChain;
    }

    /**
     * Returns a map of <code>refreshBinding</code> function for a certain control.
     *
     * @param {sap.ui.base.ManagedObject} oControl The control to get state handler for
     * @returns {object} A plain object with one function: <code>refreshBinding</code>
     */;
    _proto.getControlRefreshBindingHandler = function getControlRefreshBindingHandler(oControl) {
      const oRefreshBindingHandler = {};
      if (oControl) {
        for (const sType in _mControlStateHandlerMap) {
          if (oControl.isA(sType)) {
            // pass only the refreshBinding handler in an object so that :
            // 1. Application has access only to refreshBinding and not apply and reterive at this stage
            // 2. Application modifications to the object will be reflected here (as we pass by reference)
            oRefreshBindingHandler["refreshBinding"] = _mControlStateHandlerMap[sType].refreshBinding || {};
            break;
          }
        }
      }
      this.base.viewState.adaptBindingRefreshHandler(oControl, oRefreshBindingHandler);
      return oRefreshBindingHandler;
    }

    /**
     * Customize the <code>refreshBinding</code> function for a certain control.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oControl The control for which the refresh handler is adapted.
     * @param oControlHandler A plain object which can have one function: <code>refreshBinding</code>
     * @alias sap.fe.core.controllerextensions.ViewState#adaptBindingRefreshHandler
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptBindingRefreshHandler = function adaptBindingRefreshHandler(oControl, oControlHandler) {
      // to be overriden
    }

    /**
     * Called when the application is suspended due to keep-alive mode.
     *
     * @alias sap.fe.core.controllerextensions.ViewState#onSuspend
     * @public
     */;
    _proto.onSuspend = function onSuspend() {
      // to be overriden
    }

    /**
     * Called when the application is restored due to keep-alive mode.
     *
     * @alias sap.fe.core.controllerextensions.ViewState#onRestore
     * @public
     */;
    _proto.onRestore = function onRestore() {
      // to be overriden
    }

    /**
     * Destructor method for objects.
     */;
    _proto.destroy = function destroy() {
      delete this._pInitialStateAppliedResolve;
      _ControllerExtension.prototype.destroy.call(this);
    }

    /**
     * Helper function to enable multi override. It is adding an additional parameter (array) to the provided
     * function (and its parameters), that will be evaluated via <code>Promise.all</code>.
     *
     * @param fnCall The function to be called
     * @param args
     * @returns A promise to be resolved with the result of all overrides
     */;
    _proto.collectResults = function collectResults(fnCall) {
      const aResults = [];
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      args.push(aResults);
      fnCall.apply(this, args);
      return Promise.all(aResults);
    }

    /**
     * Customize the <code>retrieve</code> and <code>apply</code> functions for a certain control.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oControl The control to get state handler for
     * @param aControlHandler A list of plain objects with two functions: <code>retrieve</code> and <code>apply</code>
     * @alias sap.fe.core.controllerextensions.ViewState#adaptControlStateHandler
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptControlStateHandler = function adaptControlStateHandler(oControl, aControlHandler) {
      // to be overridden if needed
    }

    /**
     * Returns a map of <code>retrieve</code> and <code>apply</code> functions for a certain control.
     *
     * @param oControl The control to get state handler for
     * @returns A plain object with two functions: <code>retrieve</code> and <code>apply</code>
     */;
    _proto.getControlStateHandler = function getControlStateHandler(oControl) {
      const aInternalControlStateHandler = [],
        aCustomControlStateHandler = [];
      if (oControl) {
        for (const sType in _mControlStateHandlerMap) {
          if (oControl.isA(sType)) {
            // avoid direct manipulation of internal _mControlStateHandlerMap
            aInternalControlStateHandler.push(Object.assign({}, _mControlStateHandlerMap[sType]));
            break;
          }
        }
      }
      this.base.viewState.adaptControlStateHandler(oControl, aCustomControlStateHandler);
      return aInternalControlStateHandler.concat(aCustomControlStateHandler);
    }

    /**
     * This function should add all controls for given view that should be considered for the state handling to the provided control array.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aCollectedControls The collected controls
     * @alias sap.fe.core.controllerextensions.ViewState#adaptStateControls
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptStateControls = function adaptStateControls(aCollectedControls) {
      // to be overridden if needed
    }

    /**
     * Returns the key to be used for given control.
     *
     * @param oControl The control to get state key for
     * @returns The key to be used for storing the controls state
     */;
    _proto.getStateKey = function getStateKey(oControl) {
      return this.getView().getLocalId(oControl.getId()) || oControl.getId();
    }

    /**
     * Retrieve the view state of this extensions view.
     * When this function is called more than once before finishing, all but the final response will resolve to <code>undefined</code>.
     *
     * @returns A promise resolving the view state
     * @alias sap.fe.core.controllerextensions.ViewState#retrieveViewState
     * @public
     */;
    _proto.retrieveViewState = async function retrieveViewState() {
      ++this._iRetrievingStateCounter;
      let oViewState;
      try {
        await this._pInitialStateApplied;
        const aControls = await this.collectResults(this.base.viewState.adaptStateControls);
        const aResolvedStates = await Promise.all(aControls.filter(function (oControl) {
          return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
        }).map(oControl => {
          return this.retrieveControlState(oControl).then(vResult => {
            return {
              key: this.getStateKey(oControl),
              value: vResult
            };
          });
        }));
        oViewState = aResolvedStates.reduce(function (oStates, mState) {
          const oCurrentState = {};
          oCurrentState[mState.key] = mState.value;
          return mergeObjects(oStates, oCurrentState);
        }, {});
        const mAdditionalStates = await Promise.resolve(this._retrieveAdditionalStates());
        if (mAdditionalStates && Object.keys(mAdditionalStates).length) {
          oViewState[ADDITIONAL_STATES_KEY] = mAdditionalStates;
        }
      } finally {
        --this._iRetrievingStateCounter;
      }
      return this._iRetrievingStateCounter === 0 ? oViewState : undefined;
    }

    /**
     * Extend the map of additional states (not control bound) to be added to the current view state of the given view.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param mAdditionalStates The additional state
     * @alias sap.fe.core.controllerextensions.ViewState#retrieveAdditionalStates
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    retrieveAdditionalStates = function retrieveAdditionalStates(mAdditionalStates) {
      // to be overridden if needed
    }

    /**
     * Returns a map of additional states (not control bound) to be added to the current view state of the given view.
     *
     * @returns Additional view states
     */;
    _proto._retrieveAdditionalStates = function _retrieveAdditionalStates() {
      const mAdditionalStates = {};
      this.base.viewState.retrieveAdditionalStates(mAdditionalStates);
      return mAdditionalStates;
    }

    /**
     * Returns the current state for the given control.
     *
     * @param oControl The object to get the state for
     * @returns The state for the given control
     */;
    _proto.retrieveControlState = function retrieveControlState(oControl) {
      const aControlStateHandlers = this.getControlStateHandler(oControl);
      return Promise.all(aControlStateHandlers.map(mControlStateHandler => {
        if (typeof mControlStateHandler.retrieve !== "function") {
          throw new Error(`controlStateHandler.retrieve is not a function for control: ${oControl.getMetadata().getName()}`);
        }
        return mControlStateHandler.retrieve.call(this, oControl);
      })).then(aStates => {
        return aStates.reduce(function (oFinalState, oCurrentState) {
          return mergeObjects(oFinalState, oCurrentState);
        }, {});
      });
    }

    /**
     * Defines whether the view state should only be applied once initially.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.Instead}.
     *
     * Important:
     * You should only override this method for custom pages and not for the standard ListReportPage and ObjectPage!
     *
     * @returns If <code>true</code>, only the initial view state is applied once,
     * else any new view state is also applied on follow-up calls (default)
     * @alias sap.fe.core.controllerextensions.ViewState#applyInitialStateOnly
     * @protected
     */;
    _proto.applyInitialStateOnly = function applyInitialStateOnly() {
      return true;
    }

    /**
     * Applies the given view state to this extensions view.
     *
     * @param oViewState The view state to apply (can be undefined)
     * @param oNavParameter The current navigation parameter
     * @param oNavParameter.navigationType The actual navigation type
     * @param oNavParameter.selectionVariant The selectionVariant from the navigation
     * @param oNavParameter.selectionVariantDefaults The selectionVariant defaults from the navigation
     * @param oNavParameter.requiresStandardVariant Defines whether the standard variant must be used in variant management
     * @returns Promise for async state handling
     * @alias sap.fe.core.controllerextensions.ViewState#applyViewState
     * @public
     */;
    _proto.applyViewState = async function applyViewState(oViewState, oNavParameter) {
      if (this.base.viewState.applyInitialStateOnly() && this._getInitialStateApplied()) {
        return;
      }
      try {
        await this.collectResults(this.base.viewState.onBeforeStateApplied, [], oNavParameter.navigationType);
        const aControls = await this.collectResults(this.base.viewState.adaptStateControls);
        this.viewStateControls = aControls;
        let oPromiseChain = Promise.resolve();
        let hasVariantManagement = false;
        /**
         * this ensures that variantManagement control is applied first to calculate initial state for delta logic
         */
        const sortedAdaptStateControls = aControls.reduce((modifiedControls, control) => {
          if (!control) {
            return modifiedControls;
          }
          const isVariantManagementControl = control.isA("sap.ui.fl.variants.VariantManagement");
          if (!hasVariantManagement) {
            hasVariantManagement = isVariantManagementControl;
          }
          modifiedControls = isVariantManagementControl ? [control, ...modifiedControls] : [...modifiedControls, control];
          return modifiedControls;
        }, []);

        // In case of no Variant Management, this ensures that initial states is set
        if (!hasVariantManagement) {
          this._setInitialStatesForDeltaCompute();
        }
        sortedAdaptStateControls.filter(function (oControl) {
          return oControl.isA("sap.ui.base.ManagedObject");
        }).forEach(oControl => {
          const sKey = this.getStateKey(oControl);
          oPromiseChain = oPromiseChain.then(this.applyControlState.bind(this, oControl, oViewState ? oViewState[sKey] : undefined, oNavParameter));
        });
        await oPromiseChain;
        if (oNavParameter.navigationType === NavType.iAppState || oNavParameter.navigationType === NavType.hybrid) {
          await this.collectResults(this.base.viewState.applyAdditionalStates, oViewState ? oViewState[ADDITIONAL_STATES_KEY] : undefined);
        } else {
          await this.collectResults(this.base.viewState.applyNavigationParameters, oNavParameter);
          await this.collectResults(this.base.viewState._applyNavigationParametersToFilterbar, oNavParameter);
        }
      } finally {
        try {
          await this.collectResults(this.base.viewState.onAfterStateApplied);
          this._setInitialStateApplied();
        } catch (e) {
          Log.error(e);
        }
      }
    };
    _proto._checkIfVariantIdIsAvailable = function _checkIfVariantIdIsAvailable(oVM, sVariantId) {
      const aVariants = oVM.getVariants();
      let bIsControlStateVariantAvailable = false;
      aVariants.forEach(function (oVariant) {
        if (oVariant.key === sVariantId) {
          bIsControlStateVariantAvailable = true;
        }
      });
      return bIsControlStateVariantAvailable;
    };
    _proto._setInitialStateApplied = function _setInitialStateApplied() {
      if (this._pInitialStateAppliedResolve) {
        const pInitialStateAppliedResolve = this._pInitialStateAppliedResolve;
        delete this._pInitialStateAppliedResolve;
        pInitialStateAppliedResolve();
      }
    };
    _proto._getInitialStateApplied = function _getInitialStateApplied() {
      return !this._pInitialStateAppliedResolve;
    }

    /**
     * Hook to react before a state for given view is applied.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @param navigationType Navigation type responsible for the applying the state
     * @alias sap.fe.core.controllerextensions.ViewState#onBeforeStateApplied
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeStateApplied = function onBeforeStateApplied(aPromises, navigationType) {
      // to be overriden
    }

    /**
     * Hook to react when state for given view was applied.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#onAfterStateApplied
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onAfterStateApplied = function onAfterStateApplied(aPromises) {
      // to be overriden
    }

    /**
     * Applying additional, not control related, states - is called only if navigation type is iAppState.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oViewState The current view state
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#applyAdditionalStates
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    applyAdditionalStates = function applyAdditionalStates(oViewState, aPromises) {
      // to be overridden if needed
    };
    _proto._applyNavigationParametersToFilterbar = function _applyNavigationParametersToFilterbar(_oNavParameter, _aPromises) {
      // to be overridden if needed
    }

    /**
     * Apply navigation parameters is not called if the navigation type is iAppState
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oNavParameter The current navigation parameter
     * @param oNavParameter.navigationType The actual navigation type
     * @param [oNavParameter.selectionVariant] The selectionVariant from the navigation
     * @param [oNavParameter.selectionVariantDefaults] The selectionVariant defaults from the navigation
     * @param [oNavParameter.requiresStandardVariant] Defines whether the standard variant must be used in variant management
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#applyNavigationParameters
     * @protected
     */;
    _proto.applyNavigationParameters = function applyNavigationParameters(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    oNavParameter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    aPromises) {
      // to be overridden if needed
    }

    /**
     * Applying the given state to the given control.
     *
     * @param oControl The object to apply the given state
     * @param oControlState The state for the given control
     * @param [oNavParameters] The current navigation parameters
     * @returns Return a promise for async state handling
     */;
    _proto.applyControlState = function applyControlState(oControl, oControlState, oNavParameters) {
      const aControlStateHandlers = this.getControlStateHandler(oControl);
      let oPromiseChain = Promise.resolve();
      aControlStateHandlers.forEach(mControlStateHandler => {
        if (typeof mControlStateHandler.apply !== "function") {
          throw new Error(`controlStateHandler.apply is not a function for control: ${oControl.getMetadata().getName()}`);
        }
        oPromiseChain = oPromiseChain.then(mControlStateHandler.apply.bind(this, oControl, oControlState, oNavParameters));
      });
      return oPromiseChain;
    };
    _proto.getInterface = function getInterface() {
      return this;
    }

    // method to get the control state for mdc controls applying the delta logic
    ;
    _proto._getControlState = function _getControlState(controlStateKey, controlState) {
      const initialControlStatesMapper = this.initialControlStatesMapper;
      if (Object.keys(initialControlStatesMapper).length > 0 && initialControlStatesMapper[controlStateKey]) {
        if (Object.keys(initialControlStatesMapper[controlStateKey]).length === 0) {
          initialControlStatesMapper[controlStateKey] = {
            ...controlState
          };
        }
        return {
          fullState: controlState,
          initialState: initialControlStatesMapper[controlStateKey]
        };
      }
      return controlState;
    }

    //method to store the initial states for delta computation of mdc controls
    ;
    // Attach event to save and select of Variant Management to update the initial Control States on variant change
    _proto._addEventListenersToVariantManagement = function _addEventListenersToVariantManagement(variantManagement, variantControls) {
      const oPayload = {
        variantManagedControls: variantControls
      };
      const fnEvent = () => {
        this._updateInitialStatesOnVariantChange(variantControls);
      };
      variantManagement.attachSave(oPayload, fnEvent, {});
      variantManagement.attachSelect(oPayload, fnEvent, {});
    };
    _proto._updateInitialStatesOnVariantChange = function _updateInitialStatesOnVariantChange(vmAssociatedControlsToReset) {
      const initialControlStatesMapper = this.initialControlStatesMapper;
      Object.keys(initialControlStatesMapper).forEach(controlKey => {
        for (const vmAssociatedcontrolKey of vmAssociatedControlsToReset) {
          if (vmAssociatedcontrolKey.indexOf(controlKey) > -1) {
            initialControlStatesMapper[controlKey] = {};
          }
        }
      });
    };
    _proto._isInitialStatesApplicable = function _isInitialStatesApplicable(initialState, control, isNavHybrid) {
      return initialState && this.invalidateInitialStateForApply.indexOf(control.getId()) === -1 && this.controlsVariantIdUnavailable.indexOf(control.getId()) === -1 && (isNavHybrid ?? true);
    };
    return ViewState;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "refreshViewBindings", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "refreshViewBindings"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptBindingRefreshControls", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptBindingRefreshControls"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "refreshControlBinding", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "refreshControlBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getControlRefreshBindingHandler", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "getControlRefreshBindingHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptBindingRefreshHandler", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptBindingRefreshHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onSuspend", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "onSuspend"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRestore", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onRestore"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "collectResults", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "collectResults"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptControlStateHandler", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptControlStateHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getControlStateHandler", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "getControlStateHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptStateControls", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptStateControls"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getStateKey", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "getStateKey"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "retrieveViewState", [_dec26, _dec27], Object.getOwnPropertyDescriptor(_class2.prototype, "retrieveViewState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "retrieveAdditionalStates", [_dec28, _dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "retrieveAdditionalStates"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "retrieveControlState", [_dec30, _dec31], Object.getOwnPropertyDescriptor(_class2.prototype, "retrieveControlState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyInitialStateOnly", [_dec32, _dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "applyInitialStateOnly"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyViewState", [_dec34, _dec35], Object.getOwnPropertyDescriptor(_class2.prototype, "applyViewState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_checkIfVariantIdIsAvailable", [_dec36], Object.getOwnPropertyDescriptor(_class2.prototype, "_checkIfVariantIdIsAvailable"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeStateApplied", [_dec37, _dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeStateApplied"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterStateApplied", [_dec39, _dec40], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterStateApplied"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyAdditionalStates", [_dec41, _dec42], Object.getOwnPropertyDescriptor(_class2.prototype, "applyAdditionalStates"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_applyNavigationParametersToFilterbar", [_dec43], Object.getOwnPropertyDescriptor(_class2.prototype, "_applyNavigationParametersToFilterbar"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyNavigationParameters", [_dec44, _dec45], Object.getOwnPropertyDescriptor(_class2.prototype, "applyNavigationParameters"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyControlState", [_dec46, _dec47], Object.getOwnPropertyDescriptor(_class2.prototype, "applyControlState"), _class2.prototype)), _class2)) || _class);
  return ViewState;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBRERJVElPTkFMX1NUQVRFU19LRVkiLCJOYXZUeXBlIiwiTmF2TGlicmFyeSIsIl9tQ29udHJvbFN0YXRlSGFuZGxlck1hcCIsInJldHJpZXZlIiwib1ZNIiwidmFyaWFudElkIiwiZ2V0Q3VycmVudFZhcmlhbnRLZXkiLCJhcHBseSIsImNvbnRyb2xTdGF0ZSIsInVuZGVmaW5lZCIsImlzVmFyaWFudElkQXZhaWxhYmxlIiwiX2NoZWNrSWZWYXJpYW50SWRJc0F2YWlsYWJsZSIsInNWYXJpYW50UmVmZXJlbmNlIiwiZ2V0U3RhbmRhcmRWYXJpYW50S2V5IiwiY29udHJvbHNWYXJpYW50SWRVbmF2YWlsYWJsZSIsInB1c2giLCJnZXRGb3IiLCJDb250cm9sVmFyaWFudEFwcGx5QVBJIiwiYWN0aXZhdGVWYXJpYW50IiwiZWxlbWVudCIsInZhcmlhbnRSZWZlcmVuY2UiLCJfc2V0SW5pdGlhbFN0YXRlc0ZvckRlbHRhQ29tcHV0ZSIsImVycm9yIiwiTG9nIiwiaW52YWxpZGF0ZUluaXRpYWxTdGF0ZUZvckFwcGx5Iiwib1RhYkJhciIsInNlbGVjdGVkS2V5IiwiZ2V0U2VsZWN0ZWRLZXkiLCJvQ29udHJvbFN0YXRlIiwib1NlbGVjdGVkSXRlbSIsImdldEl0ZW1zIiwiZmluZCIsIm9JdGVtIiwiZ2V0S2V5Iiwic2V0U2VsZWN0ZWRJdGVtIiwiZmlsdGVyQmFyIiwiY29udHJvbFN0YXRlS2V5IiwiZ2V0U3RhdGVLZXkiLCJmaWx0ZXJCYXJTdGF0ZSIsIlN0YXRlVXRpbCIsInJldHJpZXZlRXh0ZXJuYWxTdGF0ZSIsInByb3BlcnRpZXNJbmZvIiwiZ2V0UHJvcGVydHlJbmZvU2V0IiwiZmlsdGVyIiwiUHJvcGVydHlJbmZvIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsInBhdGgiLCJyZW1vdmVGcm9tQXBwU3RhdGUiLCJmb3JFYWNoIiwiX2dldENvbnRyb2xTdGF0ZSIsIm5hdlBhcmFtZXRlciIsImlzSW5pdGlhbFN0YXRlQXBwbGljYWJsZSIsIl9pc0luaXRpYWxTdGF0ZXNBcHBsaWNhYmxlIiwiaW5pdGlhbFN0YXRlIiwibmF2aWdhdGlvblR5cGUiLCJoeWJyaWQiLCJmdWxsU3RhdGUiLCJmaWx0ZXJCYXJQcm9wZXJ0eUluZm9zIiwiU2VsZWN0aW9uVmFyaWFudFRvU3RhdGVGaWx0ZXJzIiwiZ2V0RmlsdGVyQmFyU3VwcG9ydGVkRmllbGRzIiwiZmlsdGVyQmFySW5mb0ZvckNvbnZlcnNpb24iLCJnZXRGaWx0ZXJCYXJJbmZvRm9yQ29udmVyc2lvbiIsInhBcHBTdGF0ZUZpbHRlcnMiLCJnZXRDb25kaXRpb25zRnJvbVNWIiwic2VsZWN0aW9uVmFyaWFudCIsIm1lcmdlZEZ1bGxTdGF0ZSIsImFwcGx5RXh0ZXJuYWxTdGF0ZSIsImRpZmZTdGF0ZSIsInRhYmxlIiwidGFibGVTdGF0ZSIsIm5hdlBhcmFtZXRlcnMiLCJzdXBwbGVtZW50YXJ5Q29uZmlnIiwib0RpZmZTdGF0ZSIsInJlZnJlc2hCaW5kaW5nIiwib1RhYmxlIiwib1RhYmxlQmluZGluZyIsImdldFJvd0JpbmRpbmciLCJvUm9vdEJpbmRpbmciLCJnZXRSb290QmluZGluZyIsInJlZnJlc2giLCJvSGVhZGVyQ29udGV4dCIsImdldEhlYWRlckNvbnRleHQiLCJzR3JvdXBJZCIsImdldEdyb3VwSWQiLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aCIsImluZm8iLCJnZXRJZCIsIm9DaGFydCIsIm9PUExheW91dCIsInNlbGVjdGVkU2VjdGlvbiIsImdldFNlbGVjdGVkU2VjdGlvbiIsInNldFNlbGVjdGVkU2VjdGlvbiIsIm9CaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwib0JpbmRpbmciLCJnZXRCaW5kaW5nIiwic01ldGFQYXRoIiwiTW9kZWxIZWxwZXIiLCJnZXRNZXRhUGF0aEZvckNvbnRleHQiLCJzU3RyYXRlZ3kiLCJLZWVwQWxpdmVIZWxwZXIiLCJnZXRDb250cm9sUmVmcmVzaFN0cmF0ZWd5Rm9yQ29udGV4dFBhdGgiLCJvTW9kZWwiLCJnZXRNb2RlbCIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJvTmF2aWdhdGlvblByb3BlcnRpZXMiLCJDb21tb25VdGlscyIsImdldENvbnRleHRQYXRoUHJvcGVydGllcyIsIiRraW5kIiwiYU5hdlByb3BlcnRpZXNUb1JlcXVlc3QiLCJyZWR1Y2UiLCJhUHJldiIsInNOYXZQcm9wIiwiJGlzQ29sbGVjdGlvbiIsImFQcm9wZXJ0aWVzIiwiJFByb3BlcnR5UGF0aCIsImNvbmNhdCIsIm9TZWdtZW50ZWRCdXR0b24iLCJzZXRTZWxlY3RlZEtleSIsImdldFBhcmVudCIsImlzQSIsImZpcmVFdmVudCIsIm9TZWxlY3QiLCJvRHluYW1pY1BhZ2UiLCJoZWFkZXJFeHBhbmRlZCIsImdldEhlYWRlckV4cGFuZGVkIiwic2V0SGVhZGVyRXhwYW5kZWQiLCJvVmlldyIsIm9Db250cm9sbGVyIiwiZ2V0Q29udHJvbGxlciIsInZpZXdTdGF0ZSIsInJldHJpZXZlVmlld1N0YXRlIiwib05hdlBhcmFtZXRlcnMiLCJhcHBseVZpZXdTdGF0ZSIsInJlZnJlc2hWaWV3QmluZGluZ3MiLCJvQ29tcG9uZW50Q29udGFpbmVyIiwib0NvbXBvbmVudCIsImdldENvbXBvbmVudEluc3RhbmNlIiwicmV0cmlldmVDb250cm9sU3RhdGUiLCJnZXRSb290Q29udHJvbCIsImFwcGx5Q29udHJvbFN0YXRlIiwiVmlld1N0YXRlIiwiZGVmaW5lVUk1Q2xhc3MiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwicHJpdmF0ZUV4dGVuc2lvbiIsIkluc3RlYWQiLCJpbml0aWFsQ29udHJvbFN0YXRlc01hcHBlciIsInZpZXdTdGF0ZUNvbnRyb2xzIiwidmFyaWFudE1hbmFnZW1lbnQiLCJhZGFwdENvbnRyb2xzIiwiZXh0ZXJuYWxTdGF0ZVByb21pc2VzIiwiaW5pdGlhbENvbnRyb2xTdGF0ZXMiLCJ2YXJpYW50Q29udHJvbHMiLCJjb250cm9sIiwiaW5kZXhPZiIsIl9hZGRFdmVudExpc3RlbmVyc1RvVmFyaWFudE1hbmFnZW1lbnQiLCJleHRlcm5hbFN0YXRlUHJvbWlzZSIsIlByb21pc2UiLCJhbGwiLCJpbml0aWFsQ29udHJvbFN0YXRlIiwiaSIsImUiLCJfaVJldHJpZXZpbmdTdGF0ZUNvdW50ZXIiLCJfcEluaXRpYWxTdGF0ZUFwcGxpZWQiLCJyZXNvbHZlIiwiX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZSIsImFDb250cm9scyIsImNvbGxlY3RSZXN1bHRzIiwiYmFzZSIsImFkYXB0QmluZGluZ1JlZnJlc2hDb250cm9scyIsIm9Qcm9taXNlQ2hhaW4iLCJvQ29udHJvbCIsInRoZW4iLCJyZWZyZXNoQ29udHJvbEJpbmRpbmciLCJiaW5kIiwiYUNvbGxlY3RlZENvbnRyb2xzIiwib0NvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIiLCJnZXRDb250cm9sUmVmcmVzaEJpbmRpbmdIYW5kbGVyIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwib1JlZnJlc2hCaW5kaW5nSGFuZGxlciIsInNUeXBlIiwiYWRhcHRCaW5kaW5nUmVmcmVzaEhhbmRsZXIiLCJvQ29udHJvbEhhbmRsZXIiLCJvblN1c3BlbmQiLCJvblJlc3RvcmUiLCJkZXN0cm95IiwiZm5DYWxsIiwiYVJlc3VsdHMiLCJhcmdzIiwiYWRhcHRDb250cm9sU3RhdGVIYW5kbGVyIiwiYUNvbnRyb2xIYW5kbGVyIiwiZ2V0Q29udHJvbFN0YXRlSGFuZGxlciIsImFJbnRlcm5hbENvbnRyb2xTdGF0ZUhhbmRsZXIiLCJhQ3VzdG9tQ29udHJvbFN0YXRlSGFuZGxlciIsImFzc2lnbiIsImFkYXB0U3RhdGVDb250cm9scyIsImdldFZpZXciLCJnZXRMb2NhbElkIiwib1ZpZXdTdGF0ZSIsImFSZXNvbHZlZFN0YXRlcyIsIm1hcCIsInZSZXN1bHQiLCJrZXkiLCJ2YWx1ZSIsIm9TdGF0ZXMiLCJtU3RhdGUiLCJvQ3VycmVudFN0YXRlIiwibWVyZ2VPYmplY3RzIiwibUFkZGl0aW9uYWxTdGF0ZXMiLCJfcmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzIiwicmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzIiwiYUNvbnRyb2xTdGF0ZUhhbmRsZXJzIiwibUNvbnRyb2xTdGF0ZUhhbmRsZXIiLCJFcnJvciIsImNhbGwiLCJhU3RhdGVzIiwib0ZpbmFsU3RhdGUiLCJhcHBseUluaXRpYWxTdGF0ZU9ubHkiLCJvTmF2UGFyYW1ldGVyIiwiX2dldEluaXRpYWxTdGF0ZUFwcGxpZWQiLCJvbkJlZm9yZVN0YXRlQXBwbGllZCIsImhhc1ZhcmlhbnRNYW5hZ2VtZW50Iiwic29ydGVkQWRhcHRTdGF0ZUNvbnRyb2xzIiwibW9kaWZpZWRDb250cm9scyIsImlzVmFyaWFudE1hbmFnZW1lbnRDb250cm9sIiwic0tleSIsImlBcHBTdGF0ZSIsImFwcGx5QWRkaXRpb25hbFN0YXRlcyIsImFwcGx5TmF2aWdhdGlvblBhcmFtZXRlcnMiLCJfYXBwbHlOYXZpZ2F0aW9uUGFyYW1ldGVyc1RvRmlsdGVyYmFyIiwib25BZnRlclN0YXRlQXBwbGllZCIsIl9zZXRJbml0aWFsU3RhdGVBcHBsaWVkIiwic1ZhcmlhbnRJZCIsImFWYXJpYW50cyIsImdldFZhcmlhbnRzIiwiYklzQ29udHJvbFN0YXRlVmFyaWFudEF2YWlsYWJsZSIsIm9WYXJpYW50IiwicEluaXRpYWxTdGF0ZUFwcGxpZWRSZXNvbHZlIiwiYVByb21pc2VzIiwiX29OYXZQYXJhbWV0ZXIiLCJfYVByb21pc2VzIiwiZ2V0SW50ZXJmYWNlIiwib1BheWxvYWQiLCJ2YXJpYW50TWFuYWdlZENvbnRyb2xzIiwiZm5FdmVudCIsIl91cGRhdGVJbml0aWFsU3RhdGVzT25WYXJpYW50Q2hhbmdlIiwiYXR0YWNoU2F2ZSIsImF0dGFjaFNlbGVjdCIsInZtQXNzb2NpYXRlZENvbnRyb2xzVG9SZXNldCIsImNvbnRyb2xLZXkiLCJ2bUFzc29jaWF0ZWRjb250cm9sS2V5IiwiaXNOYXZIeWJyaWQiLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJWaWV3U3RhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgbWVyZ2VPYmplY3RzIGZyb20gXCJzYXAvYmFzZS91dGlsL21lcmdlXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXh0ZW5zaWJsZSwgZmluYWxFeHRlbnNpb24sIHByaXZhdGVFeHRlbnNpb24sIHB1YmxpY0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEtlZXBBbGl2ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9LZWVwQWxpdmVIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgTmF2TGlicmFyeSBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IHR5cGUgTWFuYWdlZE9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IHR5cGUgQmFzZU9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvT2JqZWN0XCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgQ29udHJvbFZhcmlhbnRBcHBseUFQSSBmcm9tIFwic2FwL3VpL2ZsL2FwcGx5L2FwaS9Db250cm9sVmFyaWFudEFwcGx5QVBJXCI7XG5pbXBvcnQgVmFyaWFudE1hbmFnZW1lbnQgZnJvbSBcInNhcC91aS9mbC92YXJpYW50cy9WYXJpYW50TWFuYWdlbWVudFwiO1xuLy8gaW1wb3J0IENoYXJ0IGZyb20gXCJzYXAvdWkvbWRjL0NoYXJ0XCI7XG5pbXBvcnQgU2VsZWN0aW9uVmFyaWFudFRvU3RhdGVGaWx0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9scy9maWx0ZXJiYXIvYWRhcHRlci9TZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnNcIjtcbmltcG9ydCBGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyXCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXJCYXJCYXNlIGZyb20gXCJzYXAvdWkvbWRjL2ZpbHRlcmJhci9GaWx0ZXJCYXJCYXNlXCI7XG5pbXBvcnQgU3RhdGVVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3AxM24vU3RhdGVVdGlsXCI7XG5pbXBvcnQgdHlwZSBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eUluZm8gfSBmcm9tIFwic2FwL3VpL21kYy91dGlsL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IE1ldGFNb2RlbE5hdlByb3BlcnR5IH0gZnJvbSBcInR5cGVzL21ldGFtb2RlbF90eXBlc1wiO1xuXG4vLyBhZGRpdGlvbmFsU3RhdGVzIGFyZSBzdG9yZWQgbmV4dCB0byBjb250cm9sIElEcywgc28gbmFtZSBjbGFzaCBhdm9pZGFuY2UgbmVlZGVkLiBGb3J0dW5hdGVseSBJRHMgaGF2ZSByZXN0cmljdGlvbnM6XG4vLyBcIkFsbG93ZWQgaXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIChjYXBpdGFsL2xvd2VyY2FzZSksIGRpZ2l0cywgdW5kZXJzY29yZXMsIGRhc2hlcywgcG9pbnRzIGFuZC9vciBjb2xvbnMuXCJcbi8vIFRoZXJlZm9yZSBhZGRpbmcgYSBzeW1ib2wgbGlrZSAjIG9yIEBcbmNvbnN0IEFERElUSU9OQUxfU1RBVEVTX0tFWSA9IFwiI2FkZGl0aW9uYWxTdGF0ZXNcIixcblx0TmF2VHlwZSA9IE5hdkxpYnJhcnkuTmF2VHlwZTtcblxuLyoqXG4gKiBEZWZpbml0aW9uIG9mIGEgY3VzdG9tIGFjdGlvbiB0byBiZSB1c2VkIGluc2lkZSB0aGUgdGFibGUgdG9vbGJhclxuICpcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUuTmF2aWdhdGlvblBhcmFtZXRlclxuICogQHB1YmxpY1xuICovXG5leHBvcnQgdHlwZSBOYXZpZ2F0aW9uUGFyYW1ldGVyID0ge1xuXHQvKipcblx0ICogIFRoZSBhY3R1YWwgbmF2aWdhdGlvbiB0eXBlLlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0bmF2aWdhdGlvblR5cGU6IHN0cmluZztcblx0LyoqXG5cdCAqIFRoZSBzZWxlY3Rpb25WYXJpYW50IGZyb20gdGhlIG5hdmlnYXRpb24uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHNlbGVjdGlvblZhcmlhbnQ/OiBvYmplY3Q7XG5cdC8qKlxuXHQgKiBUaGUgc2VsZWN0aW9uVmFyaWFudCBkZWZhdWx0cyBmcm9tIHRoZSBuYXZpZ2F0aW9uXG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHRzZWxlY3Rpb25WYXJpYW50RGVmYXVsdHM/OiBvYmplY3Q7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXRoZXIgdGhlIHN0YW5kYXJkIHZhcmlhbnQgbXVzdCBiZSB1c2VkIGluIHZhcmlhbnQgbWFuYWdlbWVudFxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0cmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQ/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgQ29udHJvbFN0YXRlID1cblx0fCAoe1xuXHRcdFx0aW5pdGlhbFN0YXRlPzoge1xuXHRcdFx0XHRzdXBwbGVtZW50YXJ5Q29uZmlnOiBvYmplY3QgfCB1bmRlZmluZWQ7XG5cdFx0XHR9O1xuXHRcdFx0ZnVsbFN0YXRlPzoge1xuXHRcdFx0XHRmaWx0ZXI6IG9iamVjdDtcblx0XHRcdH07XG5cdCAgfSAmIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVxuXHR8IHVuZGVmaW5lZDtcblxuZXhwb3J0IHR5cGUgRmlsdGVyQmFyU3RhdGUgPSB7XG5cdGZpbHRlcj86IFJlY29yZDxzdHJpbmcsIEFycmF5PG9iamVjdD4+O1xufSAmIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBtZXRob2RzIHRvIHJldHJpZXZlICYgYXBwbHkgc3RhdGVzIGZvciB0aGUgZGlmZmVyZW50IGNvbnRyb2xzIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmNvbnN0IF9tQ29udHJvbFN0YXRlSGFuZGxlck1hcDogUmVjb3JkPHN0cmluZywgYW55PiA9IHtcblx0XCJzYXAudWkuZmwudmFyaWFudHMuVmFyaWFudE1hbmFnZW1lbnRcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob1ZNOiBWYXJpYW50TWFuYWdlbWVudCk6IHsgdmFyaWFudElkOiBzdHJpbmcgfCBudWxsIH0ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dmFyaWFudElkOiBvVk0uZ2V0Q3VycmVudFZhcmlhbnRLZXkoKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBhc3luYyBmdW5jdGlvbiAob1ZNOiBWYXJpYW50TWFuYWdlbWVudCwgY29udHJvbFN0YXRlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKGNvbnRyb2xTdGF0ZSAmJiBjb250cm9sU3RhdGUudmFyaWFudElkICE9PSB1bmRlZmluZWQgJiYgY29udHJvbFN0YXRlLnZhcmlhbnRJZCAhPT0gb1ZNLmdldEN1cnJlbnRWYXJpYW50S2V5KCkpIHtcblx0XHRcdFx0XHRjb25zdCBpc1ZhcmlhbnRJZEF2YWlsYWJsZSA9IHRoaXMuX2NoZWNrSWZWYXJpYW50SWRJc0F2YWlsYWJsZShvVk0sIGNvbnRyb2xTdGF0ZS52YXJpYW50SWQpO1xuXHRcdFx0XHRcdGxldCBzVmFyaWFudFJlZmVyZW5jZTtcblx0XHRcdFx0XHRpZiAoaXNWYXJpYW50SWRBdmFpbGFibGUpIHtcblx0XHRcdFx0XHRcdHNWYXJpYW50UmVmZXJlbmNlID0gY29udHJvbFN0YXRlLnZhcmlhbnRJZDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c1ZhcmlhbnRSZWZlcmVuY2UgPSBvVk0uZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCk7XG5cdFx0XHRcdFx0XHR0aGlzLmNvbnRyb2xzVmFyaWFudElkVW5hdmFpbGFibGUucHVzaCguLi5vVk0uZ2V0Rm9yKCkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0YXdhaXQgQ29udHJvbFZhcmlhbnRBcHBseUFQSS5hY3RpdmF0ZVZhcmlhbnQoe1xuXHRcdFx0XHRcdFx0XHRlbGVtZW50OiBvVk0sXG5cdFx0XHRcdFx0XHRcdHZhcmlhbnRSZWZlcmVuY2U6IHNWYXJpYW50UmVmZXJlbmNlIGFzIHN0cmluZ1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLl9zZXRJbml0aWFsU3RhdGVzRm9yRGVsdGFDb21wdXRlKG9WTSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0XHRcdFx0dGhpcy5pbnZhbGlkYXRlSW5pdGlhbFN0YXRlRm9yQXBwbHkucHVzaCguLi5vVk0uZ2V0Rm9yKCkpO1xuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5fc2V0SW5pdGlhbFN0YXRlc0ZvckRlbHRhQ29tcHV0ZShvVk0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLl9zZXRJbml0aWFsU3RhdGVzRm9yRGVsdGFDb21wdXRlKG9WTSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG5cdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAubS5JY29uVGFiQmFyXCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9UYWJCYXI6IGFueSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c2VsZWN0ZWRLZXk6IG9UYWJCYXIuZ2V0U2VsZWN0ZWRLZXkoKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBmdW5jdGlvbiAob1RhYkJhcjogYW55LCBvQ29udHJvbFN0YXRlOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udHJvbFN0YXRlICYmIG9Db250cm9sU3RhdGUuc2VsZWN0ZWRLZXkpIHtcblx0XHRcdFx0Y29uc3Qgb1NlbGVjdGVkSXRlbSA9IG9UYWJCYXIuZ2V0SXRlbXMoKS5maW5kKGZ1bmN0aW9uIChvSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9JdGVtLmdldEtleSgpID09PSBvQ29udHJvbFN0YXRlLnNlbGVjdGVkS2V5O1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKG9TZWxlY3RlZEl0ZW0pIHtcblx0XHRcdFx0XHRvVGFiQmFyLnNldFNlbGVjdGVkSXRlbShvU2VsZWN0ZWRJdGVtKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAudWkubWRjLkZpbHRlckJhclwiOiB7XG5cdFx0cmV0cmlldmU6IGFzeW5jIGZ1bmN0aW9uIChmaWx0ZXJCYXI6IEZpbHRlckJhckJhc2UpIHtcblx0XHRcdGNvbnN0IGNvbnRyb2xTdGF0ZUtleSA9IHRoaXMuZ2V0U3RhdGVLZXkoZmlsdGVyQmFyKTtcblx0XHRcdGNvbnN0IGZpbHRlckJhclN0YXRlID0gYXdhaXQgU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShmaWx0ZXJCYXIpO1xuXHRcdFx0Ly8gcmVtb3ZlIHNlbnNpdGl2ZSBvciB2aWV3IHN0YXRlIGlycmVsZXZhbnQgZmllbGRzXG5cdFx0XHRjb25zdCBwcm9wZXJ0aWVzSW5mbyA9IGZpbHRlckJhci5nZXRQcm9wZXJ0eUluZm9TZXQoKTtcblx0XHRcdGNvbnN0IGZpbHRlciA9IGZpbHRlckJhclN0YXRlLmZpbHRlciB8fCB7fTtcblx0XHRcdHByb3BlcnRpZXNJbmZvXG5cdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKFByb3BlcnR5SW5mbzogUHJvcGVydHlJbmZvKSB7XG5cdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdE9iamVjdC5rZXlzKGZpbHRlcikubGVuZ3RoID4gMCAmJlxuXHRcdFx0XHRcdFx0UHJvcGVydHlJbmZvLnBhdGggJiZcblx0XHRcdFx0XHRcdGZpbHRlcltQcm9wZXJ0eUluZm8ucGF0aF0gJiZcblx0XHRcdFx0XHRcdChQcm9wZXJ0eUluZm8ucmVtb3ZlRnJvbUFwcFN0YXRlIHx8IGZpbHRlcltQcm9wZXJ0eUluZm8ucGF0aF0ubGVuZ3RoID09PSAwKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChQcm9wZXJ0eUluZm86IFByb3BlcnR5SW5mbykge1xuXHRcdFx0XHRcdGlmIChQcm9wZXJ0eUluZm8ucGF0aCkge1xuXHRcdFx0XHRcdFx0ZGVsZXRlIGZpbHRlcltQcm9wZXJ0eUluZm8ucGF0aF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdHJldHVybiB0aGlzLl9nZXRDb250cm9sU3RhdGUoY29udHJvbFN0YXRlS2V5LCBmaWx0ZXJCYXJTdGF0ZSk7XG5cdFx0fSxcblx0XHRhcHBseTogYXN5bmMgZnVuY3Rpb24gKGZpbHRlckJhcjogRmlsdGVyQmFyLCBjb250cm9sU3RhdGU6IENvbnRyb2xTdGF0ZSwgbmF2UGFyYW1ldGVyOiBOYXZpZ2F0aW9uUGFyYW1ldGVyKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAoY29udHJvbFN0YXRlKSB7XG5cdFx0XHRcdFx0Y29uc3QgaXNJbml0aWFsU3RhdGVBcHBsaWNhYmxlID0gdGhpcy5faXNJbml0aWFsU3RhdGVzQXBwbGljYWJsZShjb250cm9sU3RhdGU/LmluaXRpYWxTdGF0ZSwgZmlsdGVyQmFyKTtcblx0XHRcdFx0XHRjb25zdCBuYXZpZ2F0aW9uVHlwZSA9IG5hdlBhcmFtZXRlci5uYXZpZ2F0aW9uVHlwZTtcblx0XHRcdFx0XHQvL1dod24gbmF2aWdhdGlvbiB0eXBlIGlzIGh5YnJpZCwgd2Ugb3ZlcnJpZGUgdGhlIGZpbHRlciBjb25kaXRpb25zIGluIElBcHBTdGF0ZSB3aXRoIFNWIHJlY2VpdmVkIGZyb20gWGFwcFN0YXRlXG5cdFx0XHRcdFx0aWYgKG5hdmlnYXRpb25UeXBlID09PSBOYXZUeXBlLmh5YnJpZCAmJiBjb250cm9sU3RhdGUuZnVsbFN0YXRlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGZpbHRlckJhclByb3BlcnR5SW5mb3MgPSBhd2FpdCBTZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnMuZ2V0RmlsdGVyQmFyU3VwcG9ydGVkRmllbGRzKGZpbHRlckJhciksXG5cdFx0XHRcdFx0XHRcdGZpbHRlckJhckluZm9Gb3JDb252ZXJzaW9uID0gU2VsZWN0aW9uVmFyaWFudFRvU3RhdGVGaWx0ZXJzLmdldEZpbHRlckJhckluZm9Gb3JDb252ZXJzaW9uKGZpbHRlckJhciksXG5cdFx0XHRcdFx0XHRcdHhBcHBTdGF0ZUZpbHRlcnMgPSBTZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnMuZ2V0Q29uZGl0aW9uc0Zyb21TVihcblx0XHRcdFx0XHRcdFx0XHRuYXZQYXJhbWV0ZXIuc2VsZWN0aW9uVmFyaWFudCBhcyBTZWxlY3Rpb25WYXJpYW50LFxuXHRcdFx0XHRcdFx0XHRcdGZpbHRlckJhckluZm9Gb3JDb252ZXJzaW9uLFxuXHRcdFx0XHRcdFx0XHRcdGZpbHRlckJhclByb3BlcnR5SW5mb3Ncblx0XHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0Y29uc3QgbWVyZ2VkRnVsbFN0YXRlID0ge1xuXHRcdFx0XHRcdFx0XHQuLi5jb250cm9sU3RhdGUuZnVsbFN0YXRlLFxuXHRcdFx0XHRcdFx0XHRmaWx0ZXI6IHtcblx0XHRcdFx0XHRcdFx0XHQuLi5jb250cm9sU3RhdGUuZnVsbFN0YXRlLmZpbHRlcixcblx0XHRcdFx0XHRcdFx0XHQuLi54QXBwU3RhdGVGaWx0ZXJzXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdHJldHVybiBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKGZpbHRlckJhciwgbWVyZ2VkRnVsbFN0YXRlKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoaXNJbml0aWFsU3RhdGVBcHBsaWNhYmxlKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBkaWZmU3RhdGU6IG9iamVjdCA9IGF3YWl0IFN0YXRlVXRpbC5kaWZmU3RhdGUoXG5cdFx0XHRcdFx0XHRcdGZpbHRlckJhcixcblx0XHRcdFx0XHRcdFx0Y29udHJvbFN0YXRlLmluaXRpYWxTdGF0ZSBhcyBvYmplY3QsXG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xTdGF0ZS5mdWxsU3RhdGUgYXMgb2JqZWN0XG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUoZmlsdGVyQmFyLCBkaWZmU3RhdGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gU3RhdGVVdGlsLmFwcGx5RXh0ZXJuYWxTdGF0ZShmaWx0ZXJCYXIsIGNvbnRyb2xTdGF0ZT8uZnVsbFN0YXRlID8/IGNvbnRyb2xTdGF0ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG5cdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAudWkubWRjLlRhYmxlXCI6IHtcblx0XHRyZXRyaWV2ZTogYXN5bmMgZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSkge1xuXHRcdFx0Y29uc3QgY29udHJvbFN0YXRlS2V5ID0gdGhpcy5nZXRTdGF0ZUtleSh0YWJsZSk7XG5cdFx0XHRjb25zdCB0YWJsZVN0YXRlID0gYXdhaXQgU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZSh0YWJsZSk7XG5cdFx0XHRyZXR1cm4gdGhpcy5fZ2V0Q29udHJvbFN0YXRlKGNvbnRyb2xTdGF0ZUtleSwgdGFibGVTdGF0ZSk7XG5cdFx0fSxcblx0XHRhcHBseTogYXN5bmMgZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSwgY29udHJvbFN0YXRlOiBDb250cm9sU3RhdGUsIG5hdlBhcmFtZXRlcnM6IE5hdmlnYXRpb25QYXJhbWV0ZXIpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChjb250cm9sU3RhdGUpIHtcblx0XHRcdFx0XHQvLyBFeHRyYSBjb25kaXRpb24gYWRkZWQgdG8gYXBwbHkgdGhlIGRpZmYgc3RhdGUgbG9naWMgZm9yIG1kYyBjb250cm9sXG5cdFx0XHRcdFx0Y29uc3QgaXNJbml0aWFsU3RhdGVBcHBsaWNhYmxlID0gdGhpcy5faXNJbml0aWFsU3RhdGVzQXBwbGljYWJsZShcblx0XHRcdFx0XHRcdGNvbnRyb2xTdGF0ZT8uaW5pdGlhbFN0YXRlLFxuXHRcdFx0XHRcdFx0dGFibGUsXG5cdFx0XHRcdFx0XHRuYXZQYXJhbWV0ZXJzLm5hdmlnYXRpb25UeXBlICE9PSBOYXZUeXBlLmh5YnJpZFxuXHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRpZiAoaXNJbml0aWFsU3RhdGVBcHBsaWNhYmxlKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29udHJvbFN0YXRlLmluaXRpYWxTdGF0ZSAmJiAhY29udHJvbFN0YXRlLmluaXRpYWxTdGF0ZT8uc3VwcGxlbWVudGFyeUNvbmZpZykge1xuXHRcdFx0XHRcdFx0XHRjb250cm9sU3RhdGUuaW5pdGlhbFN0YXRlLnN1cHBsZW1lbnRhcnlDb25maWcgPSB7fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNvbnN0IG9EaWZmU3RhdGUgPSBhd2FpdCBTdGF0ZVV0aWwuZGlmZlN0YXRlKFxuXHRcdFx0XHRcdFx0XHR0YWJsZSxcblx0XHRcdFx0XHRcdFx0Y29udHJvbFN0YXRlLmluaXRpYWxTdGF0ZSBhcyBvYmplY3QsXG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xTdGF0ZS5mdWxsU3RhdGUgYXMgb2JqZWN0XG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUodGFibGUsIG9EaWZmU3RhdGUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAoIWNvbnRyb2xTdGF0ZS5zdXBwbGVtZW50YXJ5Q29uZmlnKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xTdGF0ZS5zdXBwbGVtZW50YXJ5Q29uZmlnID0ge307XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gU3RhdGVVdGlsLmFwcGx5RXh0ZXJuYWxTdGF0ZSh0YWJsZSwgY29udHJvbFN0YXRlPy5mdWxsU3RhdGUgPz8gY29udHJvbFN0YXRlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cmVmcmVzaEJpbmRpbmc6IGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdFx0Y29uc3Qgb1RhYmxlQmluZGluZyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0XHRpZiAob1RhYmxlQmluZGluZykge1xuXHRcdFx0XHRjb25zdCBvUm9vdEJpbmRpbmcgPSBvVGFibGVCaW5kaW5nLmdldFJvb3RCaW5kaW5nKCk7XG5cdFx0XHRcdGlmIChvUm9vdEJpbmRpbmcgPT09IG9UYWJsZUJpbmRpbmcpIHtcblx0XHRcdFx0XHQvLyBhYnNvbHV0ZSBiaW5kaW5nXG5cdFx0XHRcdFx0b1RhYmxlQmluZGluZy5yZWZyZXNoKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gcmVsYXRpdmUgYmluZGluZ1xuXHRcdFx0XHRcdGNvbnN0IG9IZWFkZXJDb250ZXh0ID0gb1RhYmxlQmluZGluZy5nZXRIZWFkZXJDb250ZXh0KCk7XG5cdFx0XHRcdFx0Y29uc3Qgc0dyb3VwSWQgPSBvVGFibGVCaW5kaW5nLmdldEdyb3VwSWQoKTtcblxuXHRcdFx0XHRcdGlmIChvSGVhZGVyQ29udGV4dCkge1xuXHRcdFx0XHRcdFx0b0hlYWRlckNvbnRleHQucmVxdWVzdFNpZGVFZmZlY3RzKFt7ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBcIlwiIH1dLCBzR3JvdXBJZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRMb2cuaW5mbyhgVGFibGU6ICR7b1RhYmxlLmdldElkKCl9IHdhcyBub3QgcmVmcmVzaGVkLiBObyBiaW5kaW5nIGZvdW5kIWApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAudWkubWRjLkNoYXJ0XCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9DaGFydDogYW55KSB7XG5cdFx0XHRyZXR1cm4gU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShvQ2hhcnQpO1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvQ2hhcnQ6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55KSB7XG5cdFx0XHRpZiAob0NvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gU3RhdGVVdGlsLmFwcGx5RXh0ZXJuYWxTdGF0ZShvQ2hhcnQsIG9Db250cm9sU3RhdGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBUT0RPOiB1bmNvbW1lbnQgYWZ0ZXIgbWRjIGZpeCBpcyBtZXJnZWRcblx0XHQvKiByZXRyaWV2ZTogYXN5bmMgZnVuY3Rpb24gKGNoYXJ0OiBDaGFydCkge1xuXHRcdFx0Y29uc3QgY29udHJvbFN0YXRlS2V5ID0gdGhpcy5nZXRTdGF0ZUtleShjaGFydCk7XG5cdFx0XHRjb25zdCBjaGFydFN0YXRlID0gYXdhaXQgU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShjaGFydCk7XG5cblx0XHRcdHJldHVybiB0aGlzLl9nZXRDb250cm9sU3RhdGUoY29udHJvbFN0YXRlS2V5LCBjaGFydFN0YXRlKTtcblx0XHR9LFxuXHRcdGFwcGx5OiBhc3luYyBmdW5jdGlvbiAoY2hhcnQ6IENoYXJ0LCBjb250cm9sU3RhdGU6IENvbnRyb2xTdGF0ZSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKGNvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRcdC8vIEV4dHJhIGNvbmRpdGlvbiBhZGRlZCB0byBhcHBseSB0aGUgZGlmZiBzdGF0ZSBsb2dpYyBmb3IgbWRjIGNvbnRyb2xcblx0XHRcdFx0XHRjb25zdCBpc0luaXRpYWxTdGF0ZUFwcGxpY2FibGUgPSBjb250cm9sU3RhdGU/LmluaXRpYWxTdGF0ZSAmJiB0aGlzLmludmFsaWRhdGVJbml0aWFsU3RhdGVGb3JBcHBseS5pbmRleE9mKGNoYXJ0LmdldElkKCkpID09PSAtMSAmJiB0aGlzLmNvbnRyb2xzVmFyaWFudElkVW5hdmFpbGFibGUuaW5kZXhPZihjaGFydC5nZXRJZCgpKSA9PT0gLTE7XG5cblx0XHRcdFx0XHRpZiAoaXNJbml0aWFsU3RhdGVBcHBsaWNhYmxlKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBkaWZmU3RhdGUgPSBhd2FpdCBTdGF0ZVV0aWwuZGlmZlN0YXRlKFxuXHRcdFx0XHRcdFx0XHRjaGFydCxcblx0XHRcdFx0XHRcdFx0Y29udHJvbFN0YXRlLmluaXRpYWxTdGF0ZSBhcyBvYmplY3QsXG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xTdGF0ZS5mdWxsU3RhdGUgYXMgb2JqZWN0XG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGF3YWl0IFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUoY2hhcnQsIGRpZmZTdGF0ZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBhd2FpdCBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKGNoYXJ0LCBjb250cm9sU3RhdGU/LmZ1bGxTdGF0ZSA/PyBjb250cm9sU3RhdGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0TG9nLmVycm9yKGVycm9yIGFzIHN0cmluZyk7XG5cdFx0XHR9XG5cdFx0fSAqL1xuXHR9LFxuXHRcInNhcC51eGFwLk9iamVjdFBhZ2VMYXlvdXRcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob09QTGF5b3V0OiBhbnkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHNlbGVjdGVkU2VjdGlvbjogb09QTGF5b3V0LmdldFNlbGVjdGVkU2VjdGlvbigpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvT1BMYXlvdXQ6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55KSB7XG5cdFx0XHRpZiAob0NvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRvT1BMYXlvdXQuc2V0U2VsZWN0ZWRTZWN0aW9uKG9Db250cm9sU3RhdGUuc2VsZWN0ZWRTZWN0aW9uKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHJlZnJlc2hCaW5kaW5nOiBmdW5jdGlvbiAob09QTGF5b3V0OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IG9PUExheW91dC5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0Y29uc3Qgb0JpbmRpbmcgPSBvQmluZGluZ0NvbnRleHQgJiYgb0JpbmRpbmdDb250ZXh0LmdldEJpbmRpbmcoKTtcblx0XHRcdGlmIChvQmluZGluZykge1xuXHRcdFx0XHRjb25zdCBzTWV0YVBhdGggPSBNb2RlbEhlbHBlci5nZXRNZXRhUGF0aEZvckNvbnRleHQob0JpbmRpbmdDb250ZXh0KTtcblx0XHRcdFx0Y29uc3Qgc1N0cmF0ZWd5ID0gS2VlcEFsaXZlSGVscGVyLmdldENvbnRyb2xSZWZyZXNoU3RyYXRlZ3lGb3JDb250ZXh0UGF0aChvT1BMYXlvdXQsIHNNZXRhUGF0aCk7XG5cdFx0XHRcdGlmIChzU3RyYXRlZ3kgPT09IFwic2VsZlwiKSB7XG5cdFx0XHRcdFx0Ly8gUmVmcmVzaCBtYWluIGNvbnRleHQgYW5kIDEtMSBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgb3IgT1Bcblx0XHRcdFx0XHRjb25zdCBvTW9kZWwgPSBvQmluZGluZ0NvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRcdFx0XHRvTmF2aWdhdGlvblByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIE1ldGFNb2RlbE5hdlByb3BlcnR5PiA9XG5cdFx0XHRcdFx0XHRcdChDb21tb25VdGlscy5nZXRDb250ZXh0UGF0aFByb3BlcnRpZXMob01ldGFNb2RlbCwgc01ldGFQYXRoLCB7XG5cdFx0XHRcdFx0XHRcdFx0JGtpbmQ6IFwiTmF2aWdhdGlvblByb3BlcnR5XCJcblx0XHRcdFx0XHRcdFx0fSkgYXMgUmVjb3JkPHN0cmluZywgTWV0YU1vZGVsTmF2UHJvcGVydHk+KSB8fCB7fSxcblx0XHRcdFx0XHRcdGFOYXZQcm9wZXJ0aWVzVG9SZXF1ZXN0ID0gT2JqZWN0LmtleXMob05hdmlnYXRpb25Qcm9wZXJ0aWVzKS5yZWR1Y2UoZnVuY3Rpb24gKGFQcmV2OiBhbnlbXSwgc05hdlByb3A6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0XHRpZiAob05hdmlnYXRpb25Qcm9wZXJ0aWVzW3NOYXZQcm9wXS4kaXNDb2xsZWN0aW9uICE9PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0YVByZXYucHVzaCh7ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBzTmF2UHJvcCB9KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYVByZXY7XG5cdFx0XHRcdFx0XHR9LCBbXSksXG5cdFx0XHRcdFx0XHRhUHJvcGVydGllcyA9IFt7ICRQcm9wZXJ0eVBhdGg6IFwiKlwiIH1dLFxuXHRcdFx0XHRcdFx0c0dyb3VwSWQgPSBvQmluZGluZy5nZXRHcm91cElkKCk7XG5cblx0XHRcdFx0XHRvQmluZGluZ0NvbnRleHQucmVxdWVzdFNpZGVFZmZlY3RzKGFQcm9wZXJ0aWVzLmNvbmNhdChhTmF2UHJvcGVydGllc1RvUmVxdWVzdCksIHNHcm91cElkKTtcblx0XHRcdFx0fSBlbHNlIGlmIChzU3RyYXRlZ3kgPT09IFwiaW5jbHVkaW5nRGVwZW5kZW50c1wiKSB7XG5cdFx0XHRcdFx0Ly8gQ29tcGxldGUgcmVmcmVzaFxuXHRcdFx0XHRcdG9CaW5kaW5nLnJlZnJlc2goKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0TG9nLmluZm8oYE9iamVjdFBhZ2U6ICR7b09QTGF5b3V0LmdldElkKCl9IHdhcyBub3QgcmVmcmVzaGVkLiBObyBiaW5kaW5nIGZvdW5kIWApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAubS5TZWdtZW50ZWRCdXR0b25cIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob1NlZ21lbnRlZEJ1dHRvbjogYW55KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRzZWxlY3RlZEtleTogb1NlZ21lbnRlZEJ1dHRvbi5nZXRTZWxlY3RlZEtleSgpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvU2VnbWVudGVkQnV0dG9uOiBhbnksIG9Db250cm9sU3RhdGU6IGFueSkge1xuXHRcdFx0aWYgKG9Db250cm9sU3RhdGU/LnNlbGVjdGVkS2V5ICYmIG9Db250cm9sU3RhdGUuc2VsZWN0ZWRLZXkgIT09IG9TZWdtZW50ZWRCdXR0b24uZ2V0U2VsZWN0ZWRLZXkoKSkge1xuXHRcdFx0XHRvU2VnbWVudGVkQnV0dG9uLnNldFNlbGVjdGVkS2V5KG9Db250cm9sU3RhdGUuc2VsZWN0ZWRLZXkpO1xuXHRcdFx0XHRpZiAob1NlZ21lbnRlZEJ1dHRvbi5nZXRQYXJlbnQoKT8uaXNBKFwic2FwLnVpLm1kYy5BY3Rpb25Ub29sYmFyXCIpKSB7XG5cdFx0XHRcdFx0b1NlZ21lbnRlZEJ1dHRvbi5maXJlRXZlbnQoXCJzZWxlY3Rpb25DaGFuZ2VcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFwic2FwLm0uU2VsZWN0XCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9TZWxlY3Q6IGFueSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c2VsZWN0ZWRLZXk6IG9TZWxlY3QuZ2V0U2VsZWN0ZWRLZXkoKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBmdW5jdGlvbiAob1NlbGVjdDogYW55LCBvQ29udHJvbFN0YXRlOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udHJvbFN0YXRlPy5zZWxlY3RlZEtleSAmJiBvQ29udHJvbFN0YXRlLnNlbGVjdGVkS2V5ICE9PSBvU2VsZWN0LmdldFNlbGVjdGVkS2V5KCkpIHtcblx0XHRcdFx0b1NlbGVjdC5zZXRTZWxlY3RlZEtleShvQ29udHJvbFN0YXRlLnNlbGVjdGVkS2V5KTtcblx0XHRcdFx0aWYgKG9TZWxlY3QuZ2V0UGFyZW50KCk/LmlzQShcInNhcC51aS5tZGMuQWN0aW9uVG9vbGJhclwiKSkge1xuXHRcdFx0XHRcdG9TZWxlY3QuZmlyZUV2ZW50KFwiY2hhbmdlXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC5mLkR5bmFtaWNQYWdlXCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9EeW5hbWljUGFnZTogYW55KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRoZWFkZXJFeHBhbmRlZDogb0R5bmFtaWNQYWdlLmdldEhlYWRlckV4cGFuZGVkKClcblx0XHRcdH07XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9EeW5hbWljUGFnZTogYW55LCBvQ29udHJvbFN0YXRlOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udHJvbFN0YXRlKSB7XG5cdFx0XHRcdG9EeW5hbWljUGFnZS5zZXRIZWFkZXJFeHBhbmRlZChvQ29udHJvbFN0YXRlLmhlYWRlckV4cGFuZGVkKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFwic2FwLnVpLmNvcmUubXZjLlZpZXdcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob1ZpZXc6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCk7XG5cdFx0XHRpZiAob0NvbnRyb2xsZXIgJiYgb0NvbnRyb2xsZXIudmlld1N0YXRlKSB7XG5cdFx0XHRcdHJldHVybiBvQ29udHJvbGxlci52aWV3U3RhdGUucmV0cmlldmVWaWV3U3RhdGUob0NvbnRyb2xsZXIudmlld1N0YXRlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB7fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBmdW5jdGlvbiAob1ZpZXc6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55LCBvTmF2UGFyYW1ldGVyczogYW55KSB7XG5cdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKTtcblx0XHRcdGlmIChvQ29udHJvbGxlciAmJiBvQ29udHJvbGxlci52aWV3U3RhdGUpIHtcblx0XHRcdFx0cmV0dXJuIG9Db250cm9sbGVyLnZpZXdTdGF0ZS5hcHBseVZpZXdTdGF0ZShvQ29udHJvbFN0YXRlLCBvTmF2UGFyYW1ldGVycyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRyZWZyZXNoQmluZGluZzogZnVuY3Rpb24gKG9WaWV3OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpO1xuXHRcdFx0aWYgKG9Db250cm9sbGVyICYmIG9Db250cm9sbGVyLnZpZXdTdGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRyb2xsZXIudmlld1N0YXRlLnJlZnJlc2hWaWV3QmluZGluZ3MoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFwic2FwLnVpLmNvcmUuQ29tcG9uZW50Q29udGFpbmVyXCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9Db21wb25lbnRDb250YWluZXI6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db21wb25lbnRDb250YWluZXIuZ2V0Q29tcG9uZW50SW5zdGFuY2UoKTtcblx0XHRcdGlmIChvQ29tcG9uZW50KSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnJldHJpZXZlQ29udHJvbFN0YXRlKG9Db21wb25lbnQuZ2V0Um9vdENvbnRyb2woKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ge307XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9Db21wb25lbnRDb250YWluZXI6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55LCBvTmF2UGFyYW1ldGVyczogYW55KSB7XG5cdFx0XHRjb25zdCBvQ29tcG9uZW50ID0gb0NvbXBvbmVudENvbnRhaW5lci5nZXRDb21wb25lbnRJbnN0YW5jZSgpO1xuXHRcdFx0aWYgKG9Db21wb25lbnQpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXBwbHlDb250cm9sU3RhdGUob0NvbXBvbmVudC5nZXRSb290Q29udHJvbCgpLCBvQ29udHJvbFN0YXRlLCBvTmF2UGFyYW1ldGVycyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuLyoqXG4gKiBBIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIG9mZmVyaW5nIGhvb2tzIGZvciBzdGF0ZSBoYW5kbGluZ1xuICpcbiAqIElmIHlvdSBuZWVkIHRvIG1haW50YWluIGEgc3BlY2lmaWMgc3RhdGUgZm9yIHlvdXIgYXBwbGljYXRpb24sIHlvdSBjYW4gdXNlIHRoZSBjb250cm9sbGVyIGV4dGVuc2lvbi5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS44NS4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZVwiKVxuY2xhc3MgVmlld1N0YXRlIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByaXZhdGUgX2lSZXRyaWV2aW5nU3RhdGVDb3VudGVyOiBudW1iZXI7XG5cblx0cHJpdmF0ZSBfcEluaXRpYWxTdGF0ZUFwcGxpZWQ6IFByb21pc2U8dW5rbm93bj47XG5cblx0cHJpdmF0ZSBfcEluaXRpYWxTdGF0ZUFwcGxpZWRSZXNvbHZlPzogRnVuY3Rpb247XG5cblx0cHJvdGVjdGVkIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblxuXHRpbml0aWFsQ29udHJvbFN0YXRlc01hcHBlcjogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblxuXHRjb250cm9sc1ZhcmlhbnRJZFVuYXZhaWxhYmxlOiBzdHJpbmdbXSA9IFtdO1xuXG5cdGludmFsaWRhdGVJbml0aWFsU3RhdGVGb3JBcHBseTogc3RyaW5nW10gPSBbXTtcblxuXHR2aWV3U3RhdGVDb250cm9sczogTWFuYWdlZE9iamVjdFtdID0gW107XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLl9pUmV0cmlldmluZ1N0YXRlQ291bnRlciA9IDA7XG5cdFx0dGhpcy5fcEluaXRpYWxTdGF0ZUFwcGxpZWQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0dGhpcy5fcEluaXRpYWxTdGF0ZUFwcGxpZWRSZXNvbHZlID0gcmVzb2x2ZTtcblx0XHR9KTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyByZWZyZXNoVmlld0JpbmRpbmdzKCkge1xuXHRcdGNvbnN0IGFDb250cm9scyA9IGF3YWl0IHRoaXMuY29sbGVjdFJlc3VsdHModGhpcy5iYXNlLnZpZXdTdGF0ZS5hZGFwdEJpbmRpbmdSZWZyZXNoQ29udHJvbHMpO1xuXHRcdGxldCBvUHJvbWlzZUNoYWluID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0YUNvbnRyb2xzXG5cdFx0XHQuZmlsdGVyKChvQ29udHJvbDogYW55KSA9PiB7XG5cdFx0XHRcdHJldHVybiBvQ29udHJvbCAmJiBvQ29udHJvbC5pc0EgJiYgb0NvbnRyb2wuaXNBKFwic2FwLnVpLmJhc2UuTWFuYWdlZE9iamVjdFwiKTtcblx0XHRcdH0pXG5cdFx0XHQuZm9yRWFjaCgob0NvbnRyb2w6IGFueSkgPT4ge1xuXHRcdFx0XHRvUHJvbWlzZUNoYWluID0gb1Byb21pc2VDaGFpbi50aGVuKHRoaXMucmVmcmVzaENvbnRyb2xCaW5kaW5nLmJpbmQodGhpcywgb0NvbnRyb2wpKTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiBvUHJvbWlzZUNoYWluO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIGFkZCBhbGwgY29udHJvbHMgcmVsZXZhbnQgZm9yIHJlZnJlc2hpbmcgdG8gdGhlIHByb3ZpZGVkIGNvbnRyb2wgYXJyYXkuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBhQ29sbGVjdGVkQ29udHJvbHMgVGhlIGNvbGxlY3RlZCBjb250cm9sc1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI2FkYXB0QmluZGluZ1JlZnJlc2hDb250cm9sc1xuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0YWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzKGFDb2xsZWN0ZWRDb250cm9sczogTWFuYWdlZE9iamVjdFtdKSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGVuXG5cdH1cblxuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHJlZnJlc2hDb250cm9sQmluZGluZyhvQ29udHJvbDogYW55KSB7XG5cdFx0Y29uc3Qgb0NvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIgPSB0aGlzLmdldENvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIob0NvbnRyb2wpO1xuXHRcdGxldCBvUHJvbWlzZUNoYWluID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0aWYgKHR5cGVvZiBvQ29udHJvbFJlZnJlc2hCaW5kaW5nSGFuZGxlci5yZWZyZXNoQmluZGluZyAhPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRMb2cuaW5mbyhgcmVmcmVzaEJpbmRpbmcgaGFuZGxlciBmb3IgY29udHJvbDogJHtvQ29udHJvbC5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKX0gaXMgbm90IHByb3ZpZGVkYCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9Qcm9taXNlQ2hhaW4gPSBvUHJvbWlzZUNoYWluLnRoZW4ob0NvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIucmVmcmVzaEJpbmRpbmcuYmluZCh0aGlzLCBvQ29udHJvbCkpO1xuXHRcdH1cblx0XHRyZXR1cm4gb1Byb21pc2VDaGFpbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgbWFwIG9mIDxjb2RlPnJlZnJlc2hCaW5kaW5nPC9jb2RlPiBmdW5jdGlvbiBmb3IgYSBjZXJ0YWluIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c2FwLnVpLmJhc2UuTWFuYWdlZE9iamVjdH0gb0NvbnRyb2wgVGhlIGNvbnRyb2wgdG8gZ2V0IHN0YXRlIGhhbmRsZXIgZm9yXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IEEgcGxhaW4gb2JqZWN0IHdpdGggb25lIGZ1bmN0aW9uOiA8Y29kZT5yZWZyZXNoQmluZGluZzwvY29kZT5cblx0ICovXG5cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRDb250cm9sUmVmcmVzaEJpbmRpbmdIYW5kbGVyKG9Db250cm9sOiBhbnkpOiBhbnkge1xuXHRcdGNvbnN0IG9SZWZyZXNoQmluZGluZ0hhbmRsZXI6IGFueSA9IHt9O1xuXHRcdGlmIChvQ29udHJvbCkge1xuXHRcdFx0Zm9yIChjb25zdCBzVHlwZSBpbiBfbUNvbnRyb2xTdGF0ZUhhbmRsZXJNYXApIHtcblx0XHRcdFx0aWYgKG9Db250cm9sLmlzQShzVHlwZSkpIHtcblx0XHRcdFx0XHQvLyBwYXNzIG9ubHkgdGhlIHJlZnJlc2hCaW5kaW5nIGhhbmRsZXIgaW4gYW4gb2JqZWN0IHNvIHRoYXQgOlxuXHRcdFx0XHRcdC8vIDEuIEFwcGxpY2F0aW9uIGhhcyBhY2Nlc3Mgb25seSB0byByZWZyZXNoQmluZGluZyBhbmQgbm90IGFwcGx5IGFuZCByZXRlcml2ZSBhdCB0aGlzIHN0YWdlXG5cdFx0XHRcdFx0Ly8gMi4gQXBwbGljYXRpb24gbW9kaWZpY2F0aW9ucyB0byB0aGUgb2JqZWN0IHdpbGwgYmUgcmVmbGVjdGVkIGhlcmUgKGFzIHdlIHBhc3MgYnkgcmVmZXJlbmNlKVxuXHRcdFx0XHRcdG9SZWZyZXNoQmluZGluZ0hhbmRsZXJbXCJyZWZyZXNoQmluZGluZ1wiXSA9IF9tQ29udHJvbFN0YXRlSGFuZGxlck1hcFtzVHlwZV0ucmVmcmVzaEJpbmRpbmcgfHwge307XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5iYXNlLnZpZXdTdGF0ZS5hZGFwdEJpbmRpbmdSZWZyZXNoSGFuZGxlcihvQ29udHJvbCwgb1JlZnJlc2hCaW5kaW5nSGFuZGxlcik7XG5cdFx0cmV0dXJuIG9SZWZyZXNoQmluZGluZ0hhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogQ3VzdG9taXplIHRoZSA8Y29kZT5yZWZyZXNoQmluZGluZzwvY29kZT4gZnVuY3Rpb24gZm9yIGEgY2VydGFpbiBjb250cm9sLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRyb2wgVGhlIGNvbnRyb2wgZm9yIHdoaWNoIHRoZSByZWZyZXNoIGhhbmRsZXIgaXMgYWRhcHRlZC5cblx0ICogQHBhcmFtIG9Db250cm9sSGFuZGxlciBBIHBsYWluIG9iamVjdCB3aGljaCBjYW4gaGF2ZSBvbmUgZnVuY3Rpb246IDxjb2RlPnJlZnJlc2hCaW5kaW5nPC9jb2RlPlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI2FkYXB0QmluZGluZ1JlZnJlc2hIYW5kbGVyXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRhZGFwdEJpbmRpbmdSZWZyZXNoSGFuZGxlcihvQ29udHJvbDogTWFuYWdlZE9iamVjdCwgb0NvbnRyb2xIYW5kbGVyOiBhbnlbXSkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRlblxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIHRoZSBhcHBsaWNhdGlvbiBpcyBzdXNwZW5kZWQgZHVlIHRvIGtlZXAtYWxpdmUgbW9kZS5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNvblN1c3BlbmRcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvblN1c3BlbmQoKSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGVuXG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gdGhlIGFwcGxpY2F0aW9uIGlzIHJlc3RvcmVkIGR1ZSB0byBrZWVwLWFsaXZlIG1vZGUuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjb25SZXN0b3JlXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25SZXN0b3JlKCkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRlblxuXHR9XG5cblx0LyoqXG5cdCAqIERlc3RydWN0b3IgbWV0aG9kIGZvciBvYmplY3RzLlxuXHQgKi9cblx0ZGVzdHJveSgpIHtcblx0XHRkZWxldGUgdGhpcy5fcEluaXRpYWxTdGF0ZUFwcGxpZWRSZXNvbHZlO1xuXHRcdHN1cGVyLmRlc3Ryb3koKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZnVuY3Rpb24gdG8gZW5hYmxlIG11bHRpIG92ZXJyaWRlLiBJdCBpcyBhZGRpbmcgYW4gYWRkaXRpb25hbCBwYXJhbWV0ZXIgKGFycmF5KSB0byB0aGUgcHJvdmlkZWRcblx0ICogZnVuY3Rpb24gKGFuZCBpdHMgcGFyYW1ldGVycyksIHRoYXQgd2lsbCBiZSBldmFsdWF0ZWQgdmlhIDxjb2RlPlByb21pc2UuYWxsPC9jb2RlPi5cblx0ICpcblx0ICogQHBhcmFtIGZuQ2FsbCBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkXG5cdCAqIEBwYXJhbSBhcmdzXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0byBiZSByZXNvbHZlZCB3aXRoIHRoZSByZXN1bHQgb2YgYWxsIG92ZXJyaWRlc1xuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRjb2xsZWN0UmVzdWx0cyhmbkNhbGw6IEZ1bmN0aW9uLCAuLi5hcmdzOiBhbnlbXSkge1xuXHRcdGNvbnN0IGFSZXN1bHRzOiBhbnlbXSA9IFtdO1xuXHRcdGFyZ3MucHVzaChhUmVzdWx0cyk7XG5cdFx0Zm5DYWxsLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdHJldHVybiBQcm9taXNlLmFsbChhUmVzdWx0cyk7XG5cdH1cblxuXHQvKipcblx0ICogQ3VzdG9taXplIHRoZSA8Y29kZT5yZXRyaWV2ZTwvY29kZT4gYW5kIDxjb2RlPmFwcGx5PC9jb2RlPiBmdW5jdGlvbnMgZm9yIGEgY2VydGFpbiBjb250cm9sLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRyb2wgVGhlIGNvbnRyb2wgdG8gZ2V0IHN0YXRlIGhhbmRsZXIgZm9yXG5cdCAqIEBwYXJhbSBhQ29udHJvbEhhbmRsZXIgQSBsaXN0IG9mIHBsYWluIG9iamVjdHMgd2l0aCB0d28gZnVuY3Rpb25zOiA8Y29kZT5yZXRyaWV2ZTwvY29kZT4gYW5kIDxjb2RlPmFwcGx5PC9jb2RlPlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI2FkYXB0Q29udHJvbFN0YXRlSGFuZGxlclxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0YWRhcHRDb250cm9sU3RhdGVIYW5kbGVyKG9Db250cm9sOiBNYW5hZ2VkT2JqZWN0LCBhQ29udHJvbEhhbmRsZXI6IG9iamVjdFtdKSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlbiBpZiBuZWVkZWRcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgbWFwIG9mIDxjb2RlPnJldHJpZXZlPC9jb2RlPiBhbmQgPGNvZGU+YXBwbHk8L2NvZGU+IGZ1bmN0aW9ucyBmb3IgYSBjZXJ0YWluIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udHJvbCBUaGUgY29udHJvbCB0byBnZXQgc3RhdGUgaGFuZGxlciBmb3Jcblx0ICogQHJldHVybnMgQSBwbGFpbiBvYmplY3Qgd2l0aCB0d28gZnVuY3Rpb25zOiA8Y29kZT5yZXRyaWV2ZTwvY29kZT4gYW5kIDxjb2RlPmFwcGx5PC9jb2RlPlxuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRDb250cm9sU3RhdGVIYW5kbGVyKG9Db250cm9sOiBhbnkpIHtcblx0XHRjb25zdCBhSW50ZXJuYWxDb250cm9sU3RhdGVIYW5kbGVyID0gW10sXG5cdFx0XHRhQ3VzdG9tQ29udHJvbFN0YXRlSGFuZGxlcjogYW55W10gPSBbXTtcblx0XHRpZiAob0NvbnRyb2wpIHtcblx0XHRcdGZvciAoY29uc3Qgc1R5cGUgaW4gX21Db250cm9sU3RhdGVIYW5kbGVyTWFwKSB7XG5cdFx0XHRcdGlmIChvQ29udHJvbC5pc0Eoc1R5cGUpKSB7XG5cdFx0XHRcdFx0Ly8gYXZvaWQgZGlyZWN0IG1hbmlwdWxhdGlvbiBvZiBpbnRlcm5hbCBfbUNvbnRyb2xTdGF0ZUhhbmRsZXJNYXBcblx0XHRcdFx0XHRhSW50ZXJuYWxDb250cm9sU3RhdGVIYW5kbGVyLnB1c2goT2JqZWN0LmFzc2lnbih7fSwgX21Db250cm9sU3RhdGVIYW5kbGVyTWFwW3NUeXBlXSkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuYmFzZS52aWV3U3RhdGUuYWRhcHRDb250cm9sU3RhdGVIYW5kbGVyKG9Db250cm9sLCBhQ3VzdG9tQ29udHJvbFN0YXRlSGFuZGxlcik7XG5cdFx0cmV0dXJuIGFJbnRlcm5hbENvbnRyb2xTdGF0ZUhhbmRsZXIuY29uY2F0KGFDdXN0b21Db250cm9sU3RhdGVIYW5kbGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBhZGQgYWxsIGNvbnRyb2xzIGZvciBnaXZlbiB2aWV3IHRoYXQgc2hvdWxkIGJlIGNvbnNpZGVyZWQgZm9yIHRoZSBzdGF0ZSBoYW5kbGluZyB0byB0aGUgcHJvdmlkZWQgY29udHJvbCBhcnJheS5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIGFDb2xsZWN0ZWRDb250cm9scyBUaGUgY29sbGVjdGVkIGNvbnRyb2xzXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjYWRhcHRTdGF0ZUNvbnRyb2xzXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRhZGFwdFN0YXRlQ29udHJvbHMoYUNvbGxlY3RlZENvbnRyb2xzOiBNYW5hZ2VkT2JqZWN0W10pIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuIGlmIG5lZWRlZFxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGtleSB0byBiZSB1c2VkIGZvciBnaXZlbiBjb250cm9sLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRyb2wgVGhlIGNvbnRyb2wgdG8gZ2V0IHN0YXRlIGtleSBmb3Jcblx0ICogQHJldHVybnMgVGhlIGtleSB0byBiZSB1c2VkIGZvciBzdG9yaW5nIHRoZSBjb250cm9scyBzdGF0ZVxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldFN0YXRlS2V5KG9Db250cm9sOiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCkuZ2V0TG9jYWxJZChvQ29udHJvbC5nZXRJZCgpKSB8fCBvQ29udHJvbC5nZXRJZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIHRoZSB2aWV3IHN0YXRlIG9mIHRoaXMgZXh0ZW5zaW9ucyB2aWV3LlxuXHQgKiBXaGVuIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIG1vcmUgdGhhbiBvbmNlIGJlZm9yZSBmaW5pc2hpbmcsIGFsbCBidXQgdGhlIGZpbmFsIHJlc3BvbnNlIHdpbGwgcmVzb2x2ZSB0byA8Y29kZT51bmRlZmluZWQ8L2NvZGU+LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgcmVzb2x2aW5nIHRoZSB2aWV3IHN0YXRlXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjcmV0cmlldmVWaWV3U3RhdGVcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIHJldHJpZXZlVmlld1N0YXRlKCkge1xuXHRcdCsrdGhpcy5faVJldHJpZXZpbmdTdGF0ZUNvdW50ZXI7XG5cdFx0bGV0IG9WaWV3U3RhdGU6IGFueTtcblxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCB0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZDtcblx0XHRcdGNvbnN0IGFDb250cm9sczogKE1hbmFnZWRPYmplY3QgfCB1bmRlZmluZWQpW10gPSBhd2FpdCB0aGlzLmNvbGxlY3RSZXN1bHRzKHRoaXMuYmFzZS52aWV3U3RhdGUuYWRhcHRTdGF0ZUNvbnRyb2xzKTtcblx0XHRcdGNvbnN0IGFSZXNvbHZlZFN0YXRlcyA9IGF3YWl0IFByb21pc2UuYWxsKFxuXHRcdFx0XHRhQ29udHJvbHNcblx0XHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChvQ29udHJvbDogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0NvbnRyb2wgJiYgb0NvbnRyb2wuaXNBICYmIG9Db250cm9sLmlzQShcInNhcC51aS5iYXNlLk1hbmFnZWRPYmplY3RcIik7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQubWFwKChvQ29udHJvbDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5yZXRyaWV2ZUNvbnRyb2xTdGF0ZShvQ29udHJvbCkudGhlbigodlJlc3VsdDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0a2V5OiB0aGlzLmdldFN0YXRlS2V5KG9Db250cm9sKSxcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogdlJlc3VsdFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0XHRvVmlld1N0YXRlID0gYVJlc29sdmVkU3RhdGVzLnJlZHVjZShmdW5jdGlvbiAob1N0YXRlczogYW55LCBtU3RhdGU6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvQ3VycmVudFN0YXRlOiBhbnkgPSB7fTtcblx0XHRcdFx0b0N1cnJlbnRTdGF0ZVttU3RhdGUua2V5XSA9IG1TdGF0ZS52YWx1ZTtcblx0XHRcdFx0cmV0dXJuIG1lcmdlT2JqZWN0cyhvU3RhdGVzLCBvQ3VycmVudFN0YXRlKTtcblx0XHRcdH0sIHt9KTtcblx0XHRcdGNvbnN0IG1BZGRpdGlvbmFsU3RhdGVzID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKHRoaXMuX3JldHJpZXZlQWRkaXRpb25hbFN0YXRlcygpKTtcblx0XHRcdGlmIChtQWRkaXRpb25hbFN0YXRlcyAmJiBPYmplY3Qua2V5cyhtQWRkaXRpb25hbFN0YXRlcykubGVuZ3RoKSB7XG5cdFx0XHRcdG9WaWV3U3RhdGVbQURESVRJT05BTF9TVEFURVNfS0VZXSA9IG1BZGRpdGlvbmFsU3RhdGVzO1xuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHQtLXRoaXMuX2lSZXRyaWV2aW5nU3RhdGVDb3VudGVyO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9pUmV0cmlldmluZ1N0YXRlQ291bnRlciA9PT0gMCA/IG9WaWV3U3RhdGUgOiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogRXh0ZW5kIHRoZSBtYXAgb2YgYWRkaXRpb25hbCBzdGF0ZXMgKG5vdCBjb250cm9sIGJvdW5kKSB0byBiZSBhZGRlZCB0byB0aGUgY3VycmVudCB2aWV3IHN0YXRlIG9mIHRoZSBnaXZlbiB2aWV3LlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gbUFkZGl0aW9uYWxTdGF0ZXMgVGhlIGFkZGl0aW9uYWwgc3RhdGVcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNyZXRyaWV2ZUFkZGl0aW9uYWxTdGF0ZXNcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdHJldHJpZXZlQWRkaXRpb25hbFN0YXRlcyhtQWRkaXRpb25hbFN0YXRlczogb2JqZWN0KSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlbiBpZiBuZWVkZWRcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgbWFwIG9mIGFkZGl0aW9uYWwgc3RhdGVzIChub3QgY29udHJvbCBib3VuZCkgdG8gYmUgYWRkZWQgdG8gdGhlIGN1cnJlbnQgdmlldyBzdGF0ZSBvZiB0aGUgZ2l2ZW4gdmlldy5cblx0ICpcblx0ICogQHJldHVybnMgQWRkaXRpb25hbCB2aWV3IHN0YXRlc1xuXHQgKi9cblx0X3JldHJpZXZlQWRkaXRpb25hbFN0YXRlcygpIHtcblx0XHRjb25zdCBtQWRkaXRpb25hbFN0YXRlcyA9IHt9O1xuXHRcdHRoaXMuYmFzZS52aWV3U3RhdGUucmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzKG1BZGRpdGlvbmFsU3RhdGVzKTtcblx0XHRyZXR1cm4gbUFkZGl0aW9uYWxTdGF0ZXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCBzdGF0ZSBmb3IgdGhlIGdpdmVuIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udHJvbCBUaGUgb2JqZWN0IHRvIGdldCB0aGUgc3RhdGUgZm9yXG5cdCAqIEByZXR1cm5zIFRoZSBzdGF0ZSBmb3IgdGhlIGdpdmVuIGNvbnRyb2xcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cmV0cmlldmVDb250cm9sU3RhdGUob0NvbnRyb2w6IGFueSkge1xuXHRcdGNvbnN0IGFDb250cm9sU3RhdGVIYW5kbGVycyA9IHRoaXMuZ2V0Q29udHJvbFN0YXRlSGFuZGxlcihvQ29udHJvbCk7XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKFxuXHRcdFx0YUNvbnRyb2xTdGF0ZUhhbmRsZXJzLm1hcCgobUNvbnRyb2xTdGF0ZUhhbmRsZXI6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAodHlwZW9mIG1Db250cm9sU3RhdGVIYW5kbGVyLnJldHJpZXZlICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYGNvbnRyb2xTdGF0ZUhhbmRsZXIucmV0cmlldmUgaXMgbm90IGEgZnVuY3Rpb24gZm9yIGNvbnRyb2w6ICR7b0NvbnRyb2wuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCl9YCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG1Db250cm9sU3RhdGVIYW5kbGVyLnJldHJpZXZlLmNhbGwodGhpcywgb0NvbnRyb2wpO1xuXHRcdFx0fSlcblx0XHQpLnRoZW4oKGFTdGF0ZXM6IGFueVtdKSA9PiB7XG5cdFx0XHRyZXR1cm4gYVN0YXRlcy5yZWR1Y2UoZnVuY3Rpb24gKG9GaW5hbFN0YXRlOiBhbnksIG9DdXJyZW50U3RhdGU6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gbWVyZ2VPYmplY3RzKG9GaW5hbFN0YXRlLCBvQ3VycmVudFN0YXRlKTtcblx0XHRcdH0sIHt9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXRoZXIgdGhlIHZpZXcgc3RhdGUgc2hvdWxkIG9ubHkgYmUgYXBwbGllZCBvbmNlIGluaXRpYWxseS5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkluc3RlYWR9LlxuXHQgKlxuXHQgKiBJbXBvcnRhbnQ6XG5cdCAqIFlvdSBzaG91bGQgb25seSBvdmVycmlkZSB0aGlzIG1ldGhvZCBmb3IgY3VzdG9tIHBhZ2VzIGFuZCBub3QgZm9yIHRoZSBzdGFuZGFyZCBMaXN0UmVwb3J0UGFnZSBhbmQgT2JqZWN0UGFnZSFcblx0ICpcblx0ICogQHJldHVybnMgSWYgPGNvZGU+dHJ1ZTwvY29kZT4sIG9ubHkgdGhlIGluaXRpYWwgdmlldyBzdGF0ZSBpcyBhcHBsaWVkIG9uY2UsXG5cdCAqIGVsc2UgYW55IG5ldyB2aWV3IHN0YXRlIGlzIGFsc28gYXBwbGllZCBvbiBmb2xsb3ctdXAgY2FsbHMgKGRlZmF1bHQpXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjYXBwbHlJbml0aWFsU3RhdGVPbmx5XG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5JbnN0ZWFkKVxuXHRhcHBseUluaXRpYWxTdGF0ZU9ubHkoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogQXBwbGllcyB0aGUgZ2l2ZW4gdmlldyBzdGF0ZSB0byB0aGlzIGV4dGVuc2lvbnMgdmlldy5cblx0ICpcblx0ICogQHBhcmFtIG9WaWV3U3RhdGUgVGhlIHZpZXcgc3RhdGUgdG8gYXBwbHkgKGNhbiBiZSB1bmRlZmluZWQpXG5cdCAqIEBwYXJhbSBvTmF2UGFyYW1ldGVyIFRoZSBjdXJyZW50IG5hdmlnYXRpb24gcGFyYW1ldGVyXG5cdCAqIEBwYXJhbSBvTmF2UGFyYW1ldGVyLm5hdmlnYXRpb25UeXBlIFRoZSBhY3R1YWwgbmF2aWdhdGlvbiB0eXBlXG5cdCAqIEBwYXJhbSBvTmF2UGFyYW1ldGVyLnNlbGVjdGlvblZhcmlhbnQgVGhlIHNlbGVjdGlvblZhcmlhbnQgZnJvbSB0aGUgbmF2aWdhdGlvblxuXHQgKiBAcGFyYW0gb05hdlBhcmFtZXRlci5zZWxlY3Rpb25WYXJpYW50RGVmYXVsdHMgVGhlIHNlbGVjdGlvblZhcmlhbnQgZGVmYXVsdHMgZnJvbSB0aGUgbmF2aWdhdGlvblxuXHQgKiBAcGFyYW0gb05hdlBhcmFtZXRlci5yZXF1aXJlc1N0YW5kYXJkVmFyaWFudCBEZWZpbmVzIHdoZXRoZXIgdGhlIHN0YW5kYXJkIHZhcmlhbnQgbXVzdCBiZSB1c2VkIGluIHZhcmlhbnQgbWFuYWdlbWVudFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhc3luYyBzdGF0ZSBoYW5kbGluZ1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI2FwcGx5Vmlld1N0YXRlXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBhcHBseVZpZXdTdGF0ZShvVmlld1N0YXRlOiBhbnksIG9OYXZQYXJhbWV0ZXI6IE5hdmlnYXRpb25QYXJhbWV0ZXIpOiBQcm9taXNlPGFueT4ge1xuXHRcdGlmICh0aGlzLmJhc2Uudmlld1N0YXRlLmFwcGx5SW5pdGlhbFN0YXRlT25seSgpICYmIHRoaXMuX2dldEluaXRpYWxTdGF0ZUFwcGxpZWQoKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCB0aGlzLmNvbGxlY3RSZXN1bHRzKHRoaXMuYmFzZS52aWV3U3RhdGUub25CZWZvcmVTdGF0ZUFwcGxpZWQsIFtdLCBvTmF2UGFyYW1ldGVyLm5hdmlnYXRpb25UeXBlKTtcblx0XHRcdGNvbnN0IGFDb250cm9sczogTWFuYWdlZE9iamVjdFtdID0gYXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyh0aGlzLmJhc2Uudmlld1N0YXRlLmFkYXB0U3RhdGVDb250cm9scyk7XG5cdFx0XHR0aGlzLnZpZXdTdGF0ZUNvbnRyb2xzID0gYUNvbnRyb2xzO1xuXHRcdFx0bGV0IG9Qcm9taXNlQ2hhaW4gPSBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdGxldCBoYXNWYXJpYW50TWFuYWdlbWVudCA9IGZhbHNlO1xuXHRcdFx0LyoqXG5cdFx0XHQgKiB0aGlzIGVuc3VyZXMgdGhhdCB2YXJpYW50TWFuYWdlbWVudCBjb250cm9sIGlzIGFwcGxpZWQgZmlyc3QgdG8gY2FsY3VsYXRlIGluaXRpYWwgc3RhdGUgZm9yIGRlbHRhIGxvZ2ljXG5cdFx0XHQgKi9cblx0XHRcdGNvbnN0IHNvcnRlZEFkYXB0U3RhdGVDb250cm9scyA9IGFDb250cm9scy5yZWR1Y2UoKG1vZGlmaWVkQ29udHJvbHM6IE1hbmFnZWRPYmplY3RbXSwgY29udHJvbCkgPT4ge1xuXHRcdFx0XHRpZiAoIWNvbnRyb2wpIHtcblx0XHRcdFx0XHRyZXR1cm4gbW9kaWZpZWRDb250cm9scztcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBpc1ZhcmlhbnRNYW5hZ2VtZW50Q29udHJvbCA9IGNvbnRyb2wuaXNBKFwic2FwLnVpLmZsLnZhcmlhbnRzLlZhcmlhbnRNYW5hZ2VtZW50XCIpO1xuXHRcdFx0XHRpZiAoIWhhc1ZhcmlhbnRNYW5hZ2VtZW50KSB7XG5cdFx0XHRcdFx0aGFzVmFyaWFudE1hbmFnZW1lbnQgPSBpc1ZhcmlhbnRNYW5hZ2VtZW50Q29udHJvbDtcblx0XHRcdFx0fVxuXHRcdFx0XHRtb2RpZmllZENvbnRyb2xzID0gaXNWYXJpYW50TWFuYWdlbWVudENvbnRyb2wgPyBbY29udHJvbCwgLi4ubW9kaWZpZWRDb250cm9sc10gOiBbLi4ubW9kaWZpZWRDb250cm9scywgY29udHJvbF07XG5cdFx0XHRcdHJldHVybiBtb2RpZmllZENvbnRyb2xzO1xuXHRcdFx0fSwgW10pO1xuXG5cdFx0XHQvLyBJbiBjYXNlIG9mIG5vIFZhcmlhbnQgTWFuYWdlbWVudCwgdGhpcyBlbnN1cmVzIHRoYXQgaW5pdGlhbCBzdGF0ZXMgaXMgc2V0XG5cdFx0XHRpZiAoIWhhc1ZhcmlhbnRNYW5hZ2VtZW50KSB7XG5cdFx0XHRcdHRoaXMuX3NldEluaXRpYWxTdGF0ZXNGb3JEZWx0YUNvbXB1dGUoKTtcblx0XHRcdH1cblxuXHRcdFx0c29ydGVkQWRhcHRTdGF0ZUNvbnRyb2xzXG5cdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9Db250cm9sLmlzQShcInNhcC51aS5iYXNlLk1hbmFnZWRPYmplY3RcIik7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mb3JFYWNoKChvQ29udHJvbCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHNLZXkgPSB0aGlzLmdldFN0YXRlS2V5KG9Db250cm9sKTtcblx0XHRcdFx0XHRvUHJvbWlzZUNoYWluID0gb1Byb21pc2VDaGFpbi50aGVuKFxuXHRcdFx0XHRcdFx0dGhpcy5hcHBseUNvbnRyb2xTdGF0ZS5iaW5kKHRoaXMsIG9Db250cm9sLCBvVmlld1N0YXRlID8gb1ZpZXdTdGF0ZVtzS2V5XSA6IHVuZGVmaW5lZCwgb05hdlBhcmFtZXRlcilcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0YXdhaXQgb1Byb21pc2VDaGFpbjtcblx0XHRcdGlmIChvTmF2UGFyYW1ldGVyLm5hdmlnYXRpb25UeXBlID09PSBOYXZUeXBlLmlBcHBTdGF0ZSB8fCBvTmF2UGFyYW1ldGVyLm5hdmlnYXRpb25UeXBlID09PSBOYXZUeXBlLmh5YnJpZCkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLmNvbGxlY3RSZXN1bHRzKFxuXHRcdFx0XHRcdHRoaXMuYmFzZS52aWV3U3RhdGUuYXBwbHlBZGRpdGlvbmFsU3RhdGVzLFxuXHRcdFx0XHRcdG9WaWV3U3RhdGUgPyBvVmlld1N0YXRlW0FERElUSU9OQUxfU1RBVEVTX0tFWV0gOiB1bmRlZmluZWRcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMuY29sbGVjdFJlc3VsdHModGhpcy5iYXNlLnZpZXdTdGF0ZS5hcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzLCBvTmF2UGFyYW1ldGVyKTtcblx0XHRcdFx0YXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyh0aGlzLmJhc2Uudmlld1N0YXRlLl9hcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzVG9GaWx0ZXJiYXIsIG9OYXZQYXJhbWV0ZXIpO1xuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLmNvbGxlY3RSZXN1bHRzKHRoaXMuYmFzZS52aWV3U3RhdGUub25BZnRlclN0YXRlQXBwbGllZCk7XG5cdFx0XHRcdHRoaXMuX3NldEluaXRpYWxTdGF0ZUFwcGxpZWQoKTtcblx0XHRcdH0gY2F0Y2ggKGU6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRfY2hlY2tJZlZhcmlhbnRJZElzQXZhaWxhYmxlKG9WTTogYW55LCBzVmFyaWFudElkOiBhbnkpIHtcblx0XHRjb25zdCBhVmFyaWFudHMgPSBvVk0uZ2V0VmFyaWFudHMoKTtcblx0XHRsZXQgYklzQ29udHJvbFN0YXRlVmFyaWFudEF2YWlsYWJsZSA9IGZhbHNlO1xuXHRcdGFWYXJpYW50cy5mb3JFYWNoKGZ1bmN0aW9uIChvVmFyaWFudDogYW55KSB7XG5cdFx0XHRpZiAob1ZhcmlhbnQua2V5ID09PSBzVmFyaWFudElkKSB7XG5cdFx0XHRcdGJJc0NvbnRyb2xTdGF0ZVZhcmlhbnRBdmFpbGFibGUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBiSXNDb250cm9sU3RhdGVWYXJpYW50QXZhaWxhYmxlO1xuXHR9XG5cblx0X3NldEluaXRpYWxTdGF0ZUFwcGxpZWQoKSB7XG5cdFx0aWYgKHRoaXMuX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZSkge1xuXHRcdFx0Y29uc3QgcEluaXRpYWxTdGF0ZUFwcGxpZWRSZXNvbHZlID0gdGhpcy5fcEluaXRpYWxTdGF0ZUFwcGxpZWRSZXNvbHZlO1xuXHRcdFx0ZGVsZXRlIHRoaXMuX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZTtcblx0XHRcdHBJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZSgpO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRJbml0aWFsU3RhdGVBcHBsaWVkKCkge1xuXHRcdHJldHVybiAhdGhpcy5fcEluaXRpYWxTdGF0ZUFwcGxpZWRSZXNvbHZlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhvb2sgdG8gcmVhY3QgYmVmb3JlIGEgc3RhdGUgZm9yIGdpdmVuIHZpZXcgaXMgYXBwbGllZC5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIGFQcm9taXNlcyBFeHRlbnNpYmxlIGFycmF5IG9mIHByb21pc2VzIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nXG5cdCAqIEBwYXJhbSBuYXZpZ2F0aW9uVHlwZSBOYXZpZ2F0aW9uIHR5cGUgcmVzcG9uc2libGUgZm9yIHRoZSBhcHBseWluZyB0aGUgc3RhdGVcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNvbkJlZm9yZVN0YXRlQXBwbGllZFxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0b25CZWZvcmVTdGF0ZUFwcGxpZWQoYVByb21pc2VzOiBQcm9taXNlPGFueT4sIG5hdmlnYXRpb25UeXBlPzogc3RyaW5nKSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGVuXG5cdH1cblxuXHQvKipcblx0ICogSG9vayB0byByZWFjdCB3aGVuIHN0YXRlIGZvciBnaXZlbiB2aWV3IHdhcyBhcHBsaWVkLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gYVByb21pc2VzIEV4dGVuc2libGUgYXJyYXkgb2YgcHJvbWlzZXMgdG8gYmUgcmVzb2x2ZWQgYmVmb3JlIGNvbnRpbnVpbmdcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNvbkFmdGVyU3RhdGVBcHBsaWVkXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRvbkFmdGVyU3RhdGVBcHBsaWVkKGFQcm9taXNlczogUHJvbWlzZTxhbnk+KSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGVuXG5cdH1cblxuXHQvKipcblx0ICogQXBwbHlpbmcgYWRkaXRpb25hbCwgbm90IGNvbnRyb2wgcmVsYXRlZCwgc3RhdGVzIC0gaXMgY2FsbGVkIG9ubHkgaWYgbmF2aWdhdGlvbiB0eXBlIGlzIGlBcHBTdGF0ZS5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIG9WaWV3U3RhdGUgVGhlIGN1cnJlbnQgdmlldyBzdGF0ZVxuXHQgKiBAcGFyYW0gYVByb21pc2VzIEV4dGVuc2libGUgYXJyYXkgb2YgcHJvbWlzZXMgdG8gYmUgcmVzb2x2ZWQgYmVmb3JlIGNvbnRpbnVpbmdcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNhcHBseUFkZGl0aW9uYWxTdGF0ZXNcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdGFwcGx5QWRkaXRpb25hbFN0YXRlcyhvVmlld1N0YXRlOiBvYmplY3QsIGFQcm9taXNlczogUHJvbWlzZTxhbnk+KSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlbiBpZiBuZWVkZWRcblx0fVxuXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0X2FwcGx5TmF2aWdhdGlvblBhcmFtZXRlcnNUb0ZpbHRlcmJhcihcblx0XHRfb05hdlBhcmFtZXRlcjoge1xuXHRcdFx0bmF2aWdhdGlvblR5cGU6IGFueTtcblx0XHRcdHNlbGVjdGlvblZhcmlhbnQ/OiBvYmplY3QgfCB1bmRlZmluZWQ7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50RGVmYXVsdHM/OiBvYmplY3QgfCB1bmRlZmluZWQ7XG5cdFx0XHRyZXF1aXJlc1N0YW5kYXJkVmFyaWFudD86IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cdFx0fSxcblx0XHRfYVByb21pc2VzOiBQcm9taXNlPGFueT5cblx0KSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlbiBpZiBuZWVkZWRcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBseSBuYXZpZ2F0aW9uIHBhcmFtZXRlcnMgaXMgbm90IGNhbGxlZCBpZiB0aGUgbmF2aWdhdGlvbiB0eXBlIGlzIGlBcHBTdGF0ZVxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gb05hdlBhcmFtZXRlciBUaGUgY3VycmVudCBuYXZpZ2F0aW9uIHBhcmFtZXRlclxuXHQgKiBAcGFyYW0gb05hdlBhcmFtZXRlci5uYXZpZ2F0aW9uVHlwZSBUaGUgYWN0dWFsIG5hdmlnYXRpb24gdHlwZVxuXHQgKiBAcGFyYW0gW29OYXZQYXJhbWV0ZXIuc2VsZWN0aW9uVmFyaWFudF0gVGhlIHNlbGVjdGlvblZhcmlhbnQgZnJvbSB0aGUgbmF2aWdhdGlvblxuXHQgKiBAcGFyYW0gW29OYXZQYXJhbWV0ZXIuc2VsZWN0aW9uVmFyaWFudERlZmF1bHRzXSBUaGUgc2VsZWN0aW9uVmFyaWFudCBkZWZhdWx0cyBmcm9tIHRoZSBuYXZpZ2F0aW9uXG5cdCAqIEBwYXJhbSBbb05hdlBhcmFtZXRlci5yZXF1aXJlc1N0YW5kYXJkVmFyaWFudF0gRGVmaW5lcyB3aGV0aGVyIHRoZSBzdGFuZGFyZCB2YXJpYW50IG11c3QgYmUgdXNlZCBpbiB2YXJpYW50IG1hbmFnZW1lbnRcblx0ICogQHBhcmFtIGFQcm9taXNlcyBFeHRlbnNpYmxlIGFycmF5IG9mIHByb21pc2VzIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjYXBwbHlOYXZpZ2F0aW9uUGFyYW1ldGVyc1xuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdGFwcGx5TmF2aWdhdGlvblBhcmFtZXRlcnMoXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRcdG9OYXZQYXJhbWV0ZXI6IHtcblx0XHRcdG5hdmlnYXRpb25UeXBlOiBhbnk7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50Pzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudERlZmF1bHRzPzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0cmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQ/OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXHRcdH0sXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRcdGFQcm9taXNlczogUHJvbWlzZTxhbnk+XG5cdCkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW4gaWYgbmVlZGVkXG5cdH1cblxuXHQvKipcblx0ICogQXBwbHlpbmcgdGhlIGdpdmVuIHN0YXRlIHRvIHRoZSBnaXZlbiBjb250cm9sLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRyb2wgVGhlIG9iamVjdCB0byBhcHBseSB0aGUgZ2l2ZW4gc3RhdGVcblx0ICogQHBhcmFtIG9Db250cm9sU3RhdGUgVGhlIHN0YXRlIGZvciB0aGUgZ2l2ZW4gY29udHJvbFxuXHQgKiBAcGFyYW0gW29OYXZQYXJhbWV0ZXJzXSBUaGUgY3VycmVudCBuYXZpZ2F0aW9uIHBhcmFtZXRlcnNcblx0ICogQHJldHVybnMgUmV0dXJuIGEgcHJvbWlzZSBmb3IgYXN5bmMgc3RhdGUgaGFuZGxpbmdcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXBwbHlDb250cm9sU3RhdGUob0NvbnRyb2w6IGFueSwgb0NvbnRyb2xTdGF0ZTogb2JqZWN0LCBvTmF2UGFyYW1ldGVycz86IG9iamVjdCkge1xuXHRcdGNvbnN0IGFDb250cm9sU3RhdGVIYW5kbGVycyA9IHRoaXMuZ2V0Q29udHJvbFN0YXRlSGFuZGxlcihvQ29udHJvbCk7XG5cdFx0bGV0IG9Qcm9taXNlQ2hhaW4gPSBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRhQ29udHJvbFN0YXRlSGFuZGxlcnMuZm9yRWFjaCgobUNvbnRyb2xTdGF0ZUhhbmRsZXI6IGFueSkgPT4ge1xuXHRcdFx0aWYgKHR5cGVvZiBtQ29udHJvbFN0YXRlSGFuZGxlci5hcHBseSAhPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgY29udHJvbFN0YXRlSGFuZGxlci5hcHBseSBpcyBub3QgYSBmdW5jdGlvbiBmb3IgY29udHJvbDogJHtvQ29udHJvbC5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKX1gKTtcblx0XHRcdH1cblx0XHRcdG9Qcm9taXNlQ2hhaW4gPSBvUHJvbWlzZUNoYWluLnRoZW4obUNvbnRyb2xTdGF0ZUhhbmRsZXIuYXBwbHkuYmluZCh0aGlzLCBvQ29udHJvbCwgb0NvbnRyb2xTdGF0ZSwgb05hdlBhcmFtZXRlcnMpKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gb1Byb21pc2VDaGFpbjtcblx0fVxuXG5cdGdldEludGVyZmFjZSgpIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8vIG1ldGhvZCB0byBnZXQgdGhlIGNvbnRyb2wgc3RhdGUgZm9yIG1kYyBjb250cm9scyBhcHBseWluZyB0aGUgZGVsdGEgbG9naWNcblx0X2dldENvbnRyb2xTdGF0ZShjb250cm9sU3RhdGVLZXk6IHN0cmluZywgY29udHJvbFN0YXRlOiBDb250cm9sU3RhdGUpIHtcblx0XHRjb25zdCBpbml0aWFsQ29udHJvbFN0YXRlc01hcHBlciA9IHRoaXMuaW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXI7XG5cdFx0aWYgKE9iamVjdC5rZXlzKGluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyKS5sZW5ndGggPiAwICYmIGluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyW2NvbnRyb2xTdGF0ZUtleV0pIHtcblx0XHRcdGlmIChPYmplY3Qua2V5cyhpbml0aWFsQ29udHJvbFN0YXRlc01hcHBlcltjb250cm9sU3RhdGVLZXldIGFzIG9iamVjdCkubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdGluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyW2NvbnRyb2xTdGF0ZUtleV0gPSB7IC4uLmNvbnRyb2xTdGF0ZSB9O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHsgZnVsbFN0YXRlOiBjb250cm9sU3RhdGUsIGluaXRpYWxTdGF0ZTogaW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXJbY29udHJvbFN0YXRlS2V5XSB9O1xuXHRcdH1cblx0XHRyZXR1cm4gY29udHJvbFN0YXRlO1xuXHR9XG5cblx0Ly9tZXRob2QgdG8gc3RvcmUgdGhlIGluaXRpYWwgc3RhdGVzIGZvciBkZWx0YSBjb21wdXRhdGlvbiBvZiBtZGMgY29udHJvbHNcblx0X3NldEluaXRpYWxTdGF0ZXNGb3JEZWx0YUNvbXB1dGUgPSBhc3luYyAodmFyaWFudE1hbmFnZW1lbnQ/OiBWYXJpYW50TWFuYWdlbWVudCkgPT4ge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBhZGFwdENvbnRyb2xzID0gdGhpcy52aWV3U3RhdGVDb250cm9scztcblxuXHRcdFx0Y29uc3QgZXh0ZXJuYWxTdGF0ZVByb21pc2VzOiBQcm9taXNlPG9iamVjdD5bXSA9IFtdO1xuXHRcdFx0Y29uc3QgY29udHJvbFN0YXRlS2V5OiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0bGV0IGluaXRpYWxDb250cm9sU3RhdGVzOiBvYmplY3RbXSA9IFtdO1xuXHRcdFx0Y29uc3QgdmFyaWFudENvbnRyb2xzOiBzdHJpbmdbXSA9IHZhcmlhbnRNYW5hZ2VtZW50Py5nZXRGb3IoKSA/PyBbXTtcblxuXHRcdFx0YWRhcHRDb250cm9sc1xuXHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChjb250cm9sKSB7XG5cdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdGNvbnRyb2wgJiZcblx0XHRcdFx0XHRcdCghdmFyaWFudE1hbmFnZW1lbnQgfHwgdmFyaWFudENvbnRyb2xzLmluZGV4T2YoY29udHJvbC5nZXRJZCgpKSA+IC0xKSAmJlxuXHRcdFx0XHRcdFx0KGNvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSB8fFxuXHRcdFx0XHRcdFx0XHQoY29udHJvbCBhcyBCYXNlT2JqZWN0KS5pc0EoXCJzYXAudWkubWRjLkZpbHRlckJhclwiKSB8fFxuXHRcdFx0XHRcdFx0XHQoY29udHJvbCBhcyBCYXNlT2JqZWN0KS5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mb3JFYWNoKChjb250cm9sKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHZhcmlhbnRNYW5hZ2VtZW50KSB7XG5cdFx0XHRcdFx0XHR0aGlzLl9hZGRFdmVudExpc3RlbmVyc1RvVmFyaWFudE1hbmFnZW1lbnQodmFyaWFudE1hbmFnZW1lbnQsIHZhcmlhbnRDb250cm9scyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3QgZXh0ZXJuYWxTdGF0ZVByb21pc2UgPSBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKGNvbnRyb2wgYXMgb2JqZWN0KTtcblx0XHRcdFx0XHRleHRlcm5hbFN0YXRlUHJvbWlzZXMucHVzaChleHRlcm5hbFN0YXRlUHJvbWlzZSk7XG5cdFx0XHRcdFx0Y29udHJvbFN0YXRlS2V5LnB1c2godGhpcy5nZXRTdGF0ZUtleShjb250cm9sKSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRpbml0aWFsQ29udHJvbFN0YXRlcyA9IGF3YWl0IFByb21pc2UuYWxsKGV4dGVybmFsU3RhdGVQcm9taXNlcyk7XG5cdFx0XHRpbml0aWFsQ29udHJvbFN0YXRlcy5mb3JFYWNoKChpbml0aWFsQ29udHJvbFN0YXRlOiBvYmplY3QsIGk6IG51bWJlcikgPT4ge1xuXHRcdFx0XHR0aGlzLmluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyW2NvbnRyb2xTdGF0ZUtleVtpXV0gPSBpbml0aWFsQ29udHJvbFN0YXRlO1xuXHRcdFx0fSk7XG5cdFx0fSBjYXRjaCAoZTogdW5rbm93bikge1xuXHRcdFx0TG9nLmVycm9yKGUgYXMgc3RyaW5nKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQXR0YWNoIGV2ZW50IHRvIHNhdmUgYW5kIHNlbGVjdCBvZiBWYXJpYW50IE1hbmFnZW1lbnQgdG8gdXBkYXRlIHRoZSBpbml0aWFsIENvbnRyb2wgU3RhdGVzIG9uIHZhcmlhbnQgY2hhbmdlXG5cdF9hZGRFdmVudExpc3RlbmVyc1RvVmFyaWFudE1hbmFnZW1lbnQodmFyaWFudE1hbmFnZW1lbnQ6IFZhcmlhbnRNYW5hZ2VtZW50LCB2YXJpYW50Q29udHJvbHM6IHN0cmluZ1tdKSB7XG5cdFx0Y29uc3Qgb1BheWxvYWQgPSB7IHZhcmlhbnRNYW5hZ2VkQ29udHJvbHM6IHZhcmlhbnRDb250cm9scyB9O1xuXHRcdGNvbnN0IGZuRXZlbnQgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLl91cGRhdGVJbml0aWFsU3RhdGVzT25WYXJpYW50Q2hhbmdlKHZhcmlhbnRDb250cm9scyk7XG5cdFx0fTtcblx0XHR2YXJpYW50TWFuYWdlbWVudC5hdHRhY2hTYXZlKG9QYXlsb2FkLCBmbkV2ZW50LCB7fSk7XG5cdFx0dmFyaWFudE1hbmFnZW1lbnQuYXR0YWNoU2VsZWN0KG9QYXlsb2FkLCBmbkV2ZW50LCB7fSk7XG5cdH1cblxuXHRfdXBkYXRlSW5pdGlhbFN0YXRlc09uVmFyaWFudENoYW5nZSh2bUFzc29jaWF0ZWRDb250cm9sc1RvUmVzZXQ6IHN0cmluZ1tdKSB7XG5cdFx0Y29uc3QgaW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXIgPSB0aGlzLmluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyO1xuXHRcdE9iamVjdC5rZXlzKGluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyKS5mb3JFYWNoKChjb250cm9sS2V5KSA9PiB7XG5cdFx0XHRmb3IgKGNvbnN0IHZtQXNzb2NpYXRlZGNvbnRyb2xLZXkgb2Ygdm1Bc3NvY2lhdGVkQ29udHJvbHNUb1Jlc2V0KSB7XG5cdFx0XHRcdGlmICh2bUFzc29jaWF0ZWRjb250cm9sS2V5LmluZGV4T2YoY29udHJvbEtleSkgPiAtMSkge1xuXHRcdFx0XHRcdGluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyW2NvbnRyb2xLZXldID0ge307XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdF9pc0luaXRpYWxTdGF0ZXNBcHBsaWNhYmxlKGluaXRpYWxTdGF0ZTogb2JqZWN0LCBjb250cm9sOiBGaWx0ZXJCYXIgfCBUYWJsZSwgaXNOYXZIeWJyaWQ/OiBib29sZWFuKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIChcblx0XHRcdGluaXRpYWxTdGF0ZSAmJlxuXHRcdFx0dGhpcy5pbnZhbGlkYXRlSW5pdGlhbFN0YXRlRm9yQXBwbHkuaW5kZXhPZihjb250cm9sLmdldElkKCkpID09PSAtMSAmJlxuXHRcdFx0dGhpcy5jb250cm9sc1ZhcmlhbnRJZFVuYXZhaWxhYmxlLmluZGV4T2YoY29udHJvbC5nZXRJZCgpKSA9PT0gLTEgJiZcblx0XHRcdChpc05hdkh5YnJpZCA/PyB0cnVlKVxuXHRcdCk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmlld1N0YXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O0VBd0JBO0VBQ0E7RUFDQTtFQUNBLE1BQU1BLHFCQUFxQixHQUFHLG1CQUFtQjtJQUNoREMsT0FBTyxHQUFHQyxVQUFVLENBQUNELE9BQU87O0VBRTdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUEyQ0E7RUFDQTtFQUNBOztFQUVBLE1BQU1FLHdCQUE2QyxHQUFHO0lBQ3JELHNDQUFzQyxFQUFFO01BQ3ZDQyxRQUFRLEVBQUUsVUFBVUMsR0FBc0IsRUFBZ0M7UUFDekUsT0FBTztVQUNOQyxTQUFTLEVBQUVELEdBQUcsQ0FBQ0Usb0JBQW9CO1FBQ3BDLENBQUM7TUFDRixDQUFDO01BQ0RDLEtBQUssRUFBRSxnQkFBZ0JILEdBQXNCLEVBQUVJLFlBQWlELEVBQWlCO1FBQ2hILElBQUk7VUFDSCxJQUFJQSxZQUFZLElBQUlBLFlBQVksQ0FBQ0gsU0FBUyxLQUFLSSxTQUFTLElBQUlELFlBQVksQ0FBQ0gsU0FBUyxLQUFLRCxHQUFHLENBQUNFLG9CQUFvQixFQUFFLEVBQUU7WUFDbEgsTUFBTUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDQyw0QkFBNEIsQ0FBQ1AsR0FBRyxFQUFFSSxZQUFZLENBQUNILFNBQVMsQ0FBQztZQUMzRixJQUFJTyxpQkFBaUI7WUFDckIsSUFBSUYsb0JBQW9CLEVBQUU7Y0FDekJFLGlCQUFpQixHQUFHSixZQUFZLENBQUNILFNBQVM7WUFDM0MsQ0FBQyxNQUFNO2NBQ05PLGlCQUFpQixHQUFHUixHQUFHLENBQUNTLHFCQUFxQixFQUFFO2NBQy9DLElBQUksQ0FBQ0MsNEJBQTRCLENBQUNDLElBQUksQ0FBQyxHQUFHWCxHQUFHLENBQUNZLE1BQU0sRUFBRSxDQUFDO1lBQ3hEO1lBQ0EsSUFBSTtjQUNILE1BQU1DLHNCQUFzQixDQUFD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