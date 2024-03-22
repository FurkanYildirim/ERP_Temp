/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/core/mvc/ControllerExtension", "../CommonUtils", "../helpers/ClassSupport"], function (Log, ControllerExtension, CommonUtils, ClassSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  const IMMEDIATE_REQUEST = "$$ImmediateRequest";
  let SideEffectsControllerExtension = (_dec = defineUI5Class("sap.fe.core.controllerextensions.SideEffects"), _dec2 = methodOverride(), _dec3 = publicExtension(), _dec4 = finalExtension(), _dec5 = publicExtension(), _dec6 = finalExtension(), _dec7 = publicExtension(), _dec8 = finalExtension(), _dec9 = publicExtension(), _dec10 = finalExtension(), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = publicExtension(), _dec14 = finalExtension(), _dec15 = publicExtension(), _dec16 = finalExtension(), _dec17 = publicExtension(), _dec18 = finalExtension(), _dec19 = publicExtension(), _dec20 = finalExtension(), _dec21 = publicExtension(), _dec22 = finalExtension(), _dec23 = publicExtension(), _dec24 = finalExtension(), _dec25 = publicExtension(), _dec26 = finalExtension(), _dec27 = privateExtension(), _dec28 = finalExtension(), _dec29 = publicExtension(), _dec30 = finalExtension(), _dec31 = privateExtension(), _dec32 = finalExtension(), _dec33 = privateExtension(), _dec34 = finalExtension(), _dec35 = privateExtension(), _dec36 = finalExtension(), _dec37 = publicExtension(), _dec38 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(SideEffectsControllerExtension, _ControllerExtension);
    function SideEffectsControllerExtension() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = SideEffectsControllerExtension.prototype;
    _proto.onInit = function onInit() {
      this._view = this.base.getView();
      this._sideEffectsService = CommonUtils.getAppComponent(this._view).getSideEffectsService();
      this._registeredFieldGroupMap = {};
      this._fieldGroupInvalidity = {};
      this._registeredFailedSideEffects = {};
    }

    /**
     * Adds a SideEffects control.
     *
     * @function
     * @name addControlSideEffects
     * @param entityType Name of the entity where the SideEffects control will be registered
     * @param controlSideEffects SideEffects to register. Ensure the sourceControlId matches the associated SAPUI5 control ID.
     */;
    _proto.addControlSideEffects = function addControlSideEffects(entityType, controlSideEffects) {
      this._sideEffectsService.addControlSideEffects(entityType, controlSideEffects);
    }

    /**
     * Removes SideEffects created by a control.
     *
     * @function
     * @name removeControlSideEffects
     * @param control SAPUI5 Control
     */;
    _proto.removeControlSideEffects = function removeControlSideEffects(control) {
      var _control$isA;
      const controlId = ((_control$isA = control.isA) === null || _control$isA === void 0 ? void 0 : _control$isA.call(control, "sap.ui.base.ManagedObject")) && control.getId();
      if (controlId) {
        this._sideEffectsService.removeControlSideEffects(controlId);
      }
    }

    /**
     * Gets the appropriate context on which SideEffects can be requested.
     * The correct one must have the binding parameter $$patchWithoutSideEffects.
     *
     * @function
     * @name getContextForSideEffects
     * @param bindingContext Initial binding context
     * @param sideEffectEntityType EntityType of the sideEffects
     * @returns SAPUI5 Context or undefined
     */;
    _proto.getContextForSideEffects = function getContextForSideEffects(bindingContext, sideEffectEntityType) {
      let contextForSideEffects = bindingContext,
        entityType = this._sideEffectsService.getEntityTypeFromContext(bindingContext);
      if (sideEffectEntityType !== entityType) {
        contextForSideEffects = bindingContext.getBinding().getContext();
        if (contextForSideEffects) {
          entityType = this._sideEffectsService.getEntityTypeFromContext(contextForSideEffects);
          if (sideEffectEntityType !== entityType) {
            contextForSideEffects = contextForSideEffects.getBinding().getContext();
            if (contextForSideEffects) {
              entityType = this._sideEffectsService.getEntityTypeFromContext(contextForSideEffects);
              if (sideEffectEntityType !== entityType) {
                return undefined;
              }
            }
          }
        }
      }
      return contextForSideEffects || undefined;
    }

    /**
     * Gets the SideEffects map for a field
     * These SideEffects are
     * - listed into FieldGroupIds (coming from an OData Service)
     * - generated by a control or controls and that configure this field as SourceProperties.
     *
     * @function
     * @name getFieldSideEffectsMap
     * @param field Field control
     * @returns SideEffects map
     */;
    _proto.getFieldSideEffectsMap = function getFieldSideEffectsMap(field) {
      let sideEffectsMap = {};
      const fieldGroupIds = field.getFieldGroupIds(),
        viewEntitySetSetName = this._view.getViewData().entitySet,
        viewEntitySet = this._sideEffectsService.getConvertedMetaModel().entitySets.find(entitySet => {
          return entitySet.name === viewEntitySetSetName;
        });

      // SideEffects coming from an OData Service
      sideEffectsMap = this.getSideEffectsMapForFieldGroups(fieldGroupIds, field.getBindingContext());

      // SideEffects coming from control(s)
      if (viewEntitySetSetName && viewEntitySet) {
        const viewEntityType = viewEntitySet.entityType.fullyQualifiedName,
          fieldPath = this.getTargetProperty(field),
          context = this.getContextForSideEffects(field.getBindingContext(), viewEntityType);
        if (fieldPath && context) {
          const controlSideEffectsEntityType = this._sideEffectsService.getControlEntitySideEffects(viewEntityType);
          Object.keys(controlSideEffectsEntityType).forEach(sideEffectsName => {
            const oControlSideEffects = controlSideEffectsEntityType[sideEffectsName];
            if (oControlSideEffects.sourceProperties.includes(fieldPath)) {
              const name = `${sideEffectsName}::${viewEntityType}`;
              sideEffectsMap[name] = {
                name: name,
                immediate: true,
                sideEffects: oControlSideEffects,
                context: context
              };
            }
          });
        }
      }
      return sideEffectsMap;
    }

    /**
     * Gets the sideEffects map for fieldGroups.
     *
     * @function
     * @name getSideEffectsMapForFieldGroups
     * @param fieldGroupIds Field group ids
     * @param fieldContext Field binding context
     * @returns SideEffects map
     */;
    _proto.getSideEffectsMapForFieldGroups = function getSideEffectsMapForFieldGroups(fieldGroupIds, fieldContext) {
      const mSideEffectsMap = {};
      fieldGroupIds.forEach(fieldGroupId => {
        const {
          name,
          immediate,
          sideEffects,
          sideEffectEntityType
        } = this._getSideEffectsPropertyForFieldGroup(fieldGroupId);
        const oContext = fieldContext ? this.getContextForSideEffects(fieldContext, sideEffectEntityType) : undefined;
        if (sideEffects && (!fieldContext || fieldContext && oContext)) {
          mSideEffectsMap[name] = {
            name,
            immediate,
            sideEffects
          };
          if (fieldContext) {
            mSideEffectsMap[name].context = oContext;
          }
        }
      });
      return mSideEffectsMap;
    }

    /**
     * Clear recorded validation status for all properties.
     *
     * @function
     * @name clearFieldGroupsValidity
     */;
    _proto.clearFieldGroupsValidity = function clearFieldGroupsValidity() {
      this._fieldGroupInvalidity = {};
    }

    /**
     * Clear recorded validation status for all properties.
     *
     * @function
     * @name isFieldGroupValid
     * @param fieldGroupId Field group id
     * @param context Context
     * @returns SAPUI5 Context or undefined
     */;
    _proto.isFieldGroupValid = function isFieldGroupValid(fieldGroupId, context) {
      const id = this._getFieldGroupIndex(fieldGroupId, context);
      return Object.keys(this._fieldGroupInvalidity[id] ?? {}).length === 0;
    }

    /**
     * Gets the relative target property related to the Field.
     *
     * @function
     * @name getTargetProperty
     * @param field Field control
     * @returns Relative target property
     */;
    _proto.getTargetProperty = function getTargetProperty(field) {
      var _this$_view$getBindin;
      const fieldPath = field.data("sourcePath");
      const metaModel = this._view.getModel().getMetaModel();
      const viewBindingPath = (_this$_view$getBindin = this._view.getBindingContext()) === null || _this$_view$getBindin === void 0 ? void 0 : _this$_view$getBindin.getPath();
      const viewMetaModelPath = viewBindingPath ? `${metaModel.getMetaPath(viewBindingPath)}/` : "";
      return fieldPath === null || fieldPath === void 0 ? void 0 : fieldPath.replace(viewMetaModelPath, "");
    }

    /**
     * Manages the workflow for SideEffects with related changes to a field
     * The following scenarios are managed:
     *  - Register: caches deferred SideEffects that will be executed when the FieldGroup is unfocused
     *  - Execute: triggers immediate SideEffects requests if the promise for the field event is fulfilled.
     *
     * @function
     * @name handleFieldChange
     * @param event SAPUI5 event that comes from a field change
     * @param fieldValidity
     * @param fieldGroupPreRequisite Promise to be fulfilled before executing deferred SideEffects
     * @returns  Promise on SideEffects request(s)
     */;
    _proto.handleFieldChange = async function handleFieldChange(event, fieldValidity, fieldGroupPreRequisite) {
      const field = event.getSource();
      this._saveFieldPropertiesStatus(field, fieldValidity);
      if (!fieldValidity) {
        return;
      }
      const sideEffectsMap = this.getFieldSideEffectsMap(field);

      // register field group SideEffects
      Object.keys(sideEffectsMap).filter(sideEffectsName => sideEffectsMap[sideEffectsName].immediate !== true).forEach(sideEffectsName => {
        const sideEffectsProperties = sideEffectsMap[sideEffectsName];
        this.registerFieldGroupSideEffects(sideEffectsProperties, fieldGroupPreRequisite);
      });

      // wait for field validation
      try {
        await (event.getParameter("promise") ?? Promise.resolve());
      } catch (e) {
        Log.debug("Prerequisites on Field for the SideEffects have been rejected", e);
        return;
      }
      return this._manageSideEffectsFromField(field);
    }

    /**
     * Manages SideEffects with a related 'focus out' to a field group.
     *
     * @function
     * @name handleFieldGroupChange
     * @param event SAPUI5 Event
     * @returns Promise returning true if the SideEffects have been successfully executed
     */;
    _proto.handleFieldGroupChange = function handleFieldGroupChange(event) {
      const field = event.getSource(),
        fieldGroupIds = event.getParameter("fieldGroupIds"),
        fieldGroupsSideEffects = fieldGroupIds.reduce((results, fieldGroupId) => {
          return results.concat(this.getRegisteredSideEffectsForFieldGroup(fieldGroupId));
        }, []);
      return Promise.all(fieldGroupsSideEffects.map(fieldGroupSideEffects => {
        return this._requestFieldGroupSideEffects(fieldGroupSideEffects);
      })).catch(error => {
        var _field$getBindingCont;
        const contextPath = (_field$getBindingCont = field.getBindingContext()) === null || _field$getBindingCont === void 0 ? void 0 : _field$getBindingCont.getPath();
        Log.debug(`Error while processing FieldGroup SideEffects on context ${contextPath}`, error);
      });
    }

    /**
     * Request SideEffects on a specific context.
     *
     * @function
     * @name requestSideEffects
     * @param sideEffects SideEffects to be executed
     * @param context Context where SideEffects need to be executed
     * @param groupId
     * @param fnGetTargets The callback function which will give us the targets and actions if it was coming through some specific handling.
     * @returns SideEffects request on SAPUI5 context
     */;
    _proto.requestSideEffects = async function requestSideEffects(sideEffects, context, groupId, fnGetTargets) {
      let targets, triggerAction;
      if (fnGetTargets) {
        const targetsAndActionData = await fnGetTargets(sideEffects);
        targets = targetsAndActionData["aTargets"];
        triggerAction = targetsAndActionData["TriggerAction"];
      } else {
        targets = [...(sideEffects.targetEntities ?? []), ...(sideEffects.targetProperties ?? [])];
        triggerAction = sideEffects.triggerAction;
      }
      if (triggerAction) {
        this._sideEffectsService.executeAction(triggerAction, context, groupId);
      }
      if (targets.length) {
        return this._sideEffectsService.requestSideEffects(targets, context, groupId).catch(error => {
          this.registerFailedSideEffects(sideEffects, context);
          throw error;
        });
      }
    }

    /**
     * Gets failed SideEffects.
     *
     * @function
     * @name getRegisteredFailedRequests
     * @returns Registered SideEffects requests that have failed
     */;
    _proto.getRegisteredFailedRequests = function getRegisteredFailedRequests() {
      return this._registeredFailedSideEffects;
    }

    /**
     * Adds SideEffects to the queue of the failed SideEffects
     * The SideEffects are retriggered on the next change on the same context.
     *
     * @function
     * @name registerFailedSideEffects
     * @param sideEffects SideEffects that need to be retriggered
     * @param context Context where SideEffects have failed
     */;
    _proto.registerFailedSideEffects = function registerFailedSideEffects(sideEffects, context) {
      const contextPath = context.getPath();
      this._registeredFailedSideEffects[contextPath] = this._registeredFailedSideEffects[contextPath] ?? [];
      const isNotAlreadyListed = this._registeredFailedSideEffects[contextPath].every(mFailedSideEffects => sideEffects.fullyQualifiedName !== mFailedSideEffects.fullyQualifiedName);
      if (isNotAlreadyListed) {
        this._registeredFailedSideEffects[contextPath].push(sideEffects);
      }
    }

    /**
     * Deletes SideEffects to the queue of the failed SideEffects for a context.
     *
     * @function
     * @name unregisterFailedSideEffectsForAContext
     * @param contextPath Context path where SideEffects have failed
     */;
    _proto.unregisterFailedSideEffectsForAContext = function unregisterFailedSideEffectsForAContext(contextPath) {
      delete this._registeredFailedSideEffects[contextPath];
    }

    /**
     * Deletes SideEffects to the queue of the failed SideEffects.
     *
     * @function
     * @name unregisterFailedSideEffects
     * @param sideEffectsFullyQualifiedName SideEffects that need to be retriggered
     * @param context Context where SideEffects have failed
     */;
    _proto.unregisterFailedSideEffects = function unregisterFailedSideEffects(sideEffectsFullyQualifiedName, context) {
      var _this$_registeredFail;
      const contextPath = context.getPath();
      if ((_this$_registeredFail = this._registeredFailedSideEffects[contextPath]) !== null && _this$_registeredFail !== void 0 && _this$_registeredFail.length) {
        this._registeredFailedSideEffects[contextPath] = this._registeredFailedSideEffects[contextPath].filter(sideEffects => sideEffects.fullyQualifiedName !== sideEffectsFullyQualifiedName);
      }
    }

    /**
     * Adds SideEffects to the queue of a FieldGroup
     * The SideEffects are triggered when event related to the field group change is fired.
     *
     * @function
     * @name registerFieldGroupSideEffects
     * @param sideEffectsProperties SideEffects properties
     * @param fieldGroupPreRequisite Promise to fullfil before executing the SideEffects
     */;
    _proto.registerFieldGroupSideEffects = function registerFieldGroupSideEffects(sideEffectsProperties, fieldGroupPreRequisite) {
      const id = this._getFieldGroupIndex(sideEffectsProperties.name, sideEffectsProperties.context);
      if (!this._registeredFieldGroupMap[id]) {
        this._registeredFieldGroupMap[id] = {
          promise: fieldGroupPreRequisite ?? Promise.resolve(),
          sideEffectProperty: sideEffectsProperties
        };
      }
    }

    /**
     * Deletes SideEffects to the queue of a FieldGroup.
     *
     * @function
     * @name unregisterFieldGroupSideEffects
     * @param sideEffectsProperties SideEffects properties
     */;
    _proto.unregisterFieldGroupSideEffects = function unregisterFieldGroupSideEffects(sideEffectsProperties) {
      const {
        context,
        name
      } = sideEffectsProperties;
      const id = this._getFieldGroupIndex(name, context);
      delete this._registeredFieldGroupMap[id];
    }

    /**
     * Gets the registered SideEffects into the queue for a field group id.
     *
     * @function
     * @name getRegisteredSideEffectsForFieldGroup
     * @param fieldGroupId Field group id
     * @returns Array of registered SideEffects and their promise
     */;
    _proto.getRegisteredSideEffectsForFieldGroup = function getRegisteredSideEffectsForFieldGroup(fieldGroupId) {
      const sideEffects = [];
      for (const registryIndex of Object.keys(this._registeredFieldGroupMap)) {
        if (registryIndex.startsWith(`${fieldGroupId}_`)) {
          sideEffects.push(this._registeredFieldGroupMap[registryIndex]);
        }
      }
      return sideEffects;
    }

    /**
     * Gets a status index.
     *
     * @function
     * @name _getFieldGroupIndex
     * @param fieldGroupId The field group id
     * @param context SAPUI5 Context
     * @returns Index
     */;
    _proto._getFieldGroupIndex = function _getFieldGroupIndex(fieldGroupId, context) {
      return `${fieldGroupId}_${context.getPath()}`;
    }

    /**
     * Gets sideEffects properties from a field group id
     * The properties are:
     *  - name
     *  - sideEffects definition
     *  - sideEffects entity type
     *  - immediate sideEffects.
     *
     * @function
     * @name _getSideEffectsPropertyForFieldGroup
     * @param fieldGroupId
     * @returns SideEffects properties
     */;
    _proto._getSideEffectsPropertyForFieldGroup = function _getSideEffectsPropertyForFieldGroup(fieldGroupId) {
      var _this$_sideEffectsSer;
      /**
       * string "$$ImmediateRequest" is added to the SideEffects name during templating to know
       * if this SideEffects must be immediately executed requested (on field change) or must
       * be deferred (on field group focus out)
       *
       */
      const immediate = fieldGroupId.indexOf(IMMEDIATE_REQUEST) !== -1,
        name = fieldGroupId.replace(IMMEDIATE_REQUEST, ""),
        sideEffectParts = name.split("#"),
        sideEffectEntityType = sideEffectParts[0],
        sideEffectPath = `${sideEffectEntityType}@com.sap.vocabularies.Common.v1.SideEffects${sideEffectParts.length === 2 ? `#${sideEffectParts[1]}` : ""}`,
        sideEffects = (_this$_sideEffectsSer = this._sideEffectsService.getODataEntitySideEffects(sideEffectEntityType)) === null || _this$_sideEffectsSer === void 0 ? void 0 : _this$_sideEffectsSer[sideEffectPath];
      return {
        name,
        immediate,
        sideEffects,
        sideEffectEntityType
      };
    }

    /**
     * Manages the SideEffects for a field.
     *
     * @function
     * @name _manageSideEffectsFromField
     * @param field Field control
     * @returns Promise related to the requested immediate sideEffects
     */;
    _proto._manageSideEffectsFromField = async function _manageSideEffectsFromField(field) {
      const sideEffectsMap = this.getFieldSideEffectsMap(field);
      try {
        const failedSideEffectsPromises = [];
        const sideEffectsPromises = Object.keys(sideEffectsMap).filter(sideEffectsName => sideEffectsMap[sideEffectsName].immediate === true).map(sideEffectsName => {
          const sideEffectsProperties = sideEffectsMap[sideEffectsName];
          // if this SideEffects is recorded as failed SideEffects, need to remove it.
          this.unregisterFailedSideEffects(sideEffectsProperties.sideEffects.fullyQualifiedName, sideEffectsProperties.context);
          return this.requestSideEffects(sideEffectsProperties.sideEffects, sideEffectsProperties.context);
        });

        //Replay failed SideEffects related to the view or Field
        for (const context of [field.getBindingContext(), this._view.getBindingContext()]) {
          if (context) {
            const contextPath = context.getPath();
            const failedSideEffects = this._registeredFailedSideEffects[contextPath] ?? [];
            this.unregisterFailedSideEffectsForAContext(contextPath);
            for (const failedSideEffect of failedSideEffects) {
              failedSideEffectsPromises.push(this.requestSideEffects(failedSideEffect, context));
            }
          }
        }
        await Promise.all(sideEffectsPromises.concat(failedSideEffectsPromises));
      } catch (e) {
        Log.debug(`Error while managing Field SideEffects`, e);
      }
    }

    /**
     * Requests the SideEffects for a fieldGroup.
     *
     * @function
     * @name _requestFieldGroupSideEffects
     * @param fieldGroupSideEffects Field group sideEffects with its promise
     * @returns Promise returning true if the SideEffects have been successfully executed
     */;
    _proto._requestFieldGroupSideEffects = async function _requestFieldGroupSideEffects(fieldGroupSideEffects) {
      this.unregisterFieldGroupSideEffects(fieldGroupSideEffects.sideEffectProperty);
      try {
        await fieldGroupSideEffects.promise;
      } catch (e) {
        Log.debug(`Error while processing FieldGroup SideEffects`, e);
        return;
      }
      try {
        const {
          sideEffects,
          context,
          name
        } = fieldGroupSideEffects.sideEffectProperty;
        if (this.isFieldGroupValid(name, context)) {
          await this.requestSideEffects(sideEffects, context);
        }
      } catch (e) {
        Log.debug(`Error while executing FieldGroup SideEffects`, e);
      }
    }

    /**
     * Saves the validation status of properties related to a field control.
     *
     * @param field The field control
     * @param success Status of the field validation
     */;
    _proto._saveFieldPropertiesStatus = function _saveFieldPropertiesStatus(field, success) {
      const sideEffectsMap = this.getFieldSideEffectsMap(field);
      Object.keys(sideEffectsMap).forEach(key => {
        const {
          name,
          immediate,
          context
        } = sideEffectsMap[key];
        if (!immediate) {
          const id = this._getFieldGroupIndex(name, context);
          if (success) {
            var _this$_fieldGroupInva;
            (_this$_fieldGroupInva = this._fieldGroupInvalidity[id]) === null || _this$_fieldGroupInva === void 0 ? true : delete _this$_fieldGroupInva[field.getId()];
          } else {
            this._fieldGroupInvalidity[id] = {
              ...this._fieldGroupInvalidity[id],
              ...{
                [field.getId()]: true
              }
            };
          }
        }
      });
    };
    return SideEffectsControllerExtension;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "addControlSideEffects", [_dec3, _dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "addControlSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "removeControlSideEffects", [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "removeControlSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getContextForSideEffects", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "getContextForSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getFieldSideEffectsMap", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "getFieldSideEffectsMap"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getSideEffectsMapForFieldGroups", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "getSideEffectsMapForFieldGroups"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "clearFieldGroupsValidity", [_dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "clearFieldGroupsValidity"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isFieldGroupValid", [_dec15, _dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "isFieldGroupValid"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getTargetProperty", [_dec17, _dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "getTargetProperty"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleFieldChange", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "handleFieldChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleFieldGroupChange", [_dec21, _dec22], Object.getOwnPropertyDescriptor(_class2.prototype, "handleFieldGroupChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "requestSideEffects", [_dec23, _dec24], Object.getOwnPropertyDescriptor(_class2.prototype, "requestSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getRegisteredFailedRequests", [_dec25, _dec26], Object.getOwnPropertyDescriptor(_class2.prototype, "getRegisteredFailedRequests"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "registerFailedSideEffects", [_dec27, _dec28], Object.getOwnPropertyDescriptor(_class2.prototype, "registerFailedSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "unregisterFailedSideEffectsForAContext", [_dec29, _dec30], Object.getOwnPropertyDescriptor(_class2.prototype, "unregisterFailedSideEffectsForAContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "unregisterFailedSideEffects", [_dec31, _dec32], Object.getOwnPropertyDescriptor(_class2.prototype, "unregisterFailedSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "registerFieldGroupSideEffects", [_dec33, _dec34], Object.getOwnPropertyDescriptor(_class2.prototype, "registerFieldGroupSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "unregisterFieldGroupSideEffects", [_dec35, _dec36], Object.getOwnPropertyDescriptor(_class2.prototype, "unregisterFieldGroupSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getRegisteredSideEffectsForFieldGroup", [_dec37, _dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "getRegisteredSideEffectsForFieldGroup"), _class2.prototype)), _class2)) || _class);
  return SideEffectsControllerExtension;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJTU1FRElBVEVfUkVRVUVTVCIsIlNpZGVFZmZlY3RzQ29udHJvbGxlckV4dGVuc2lvbiIsImRlZmluZVVJNUNsYXNzIiwibWV0aG9kT3ZlcnJpZGUiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsInByaXZhdGVFeHRlbnNpb24iLCJvbkluaXQiLCJfdmlldyIsImJhc2UiLCJnZXRWaWV3IiwiX3NpZGVFZmZlY3RzU2VydmljZSIsIkNvbW1vblV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiX3JlZ2lzdGVyZWRGaWVsZEdyb3VwTWFwIiwiX2ZpZWxkR3JvdXBJbnZhbGlkaXR5IiwiX3JlZ2lzdGVyZWRGYWlsZWRTaWRlRWZmZWN0cyIsImFkZENvbnRyb2xTaWRlRWZmZWN0cyIsImVudGl0eVR5cGUiLCJjb250cm9sU2lkZUVmZmVjdHMiLCJyZW1vdmVDb250cm9sU2lkZUVmZmVjdHMiLCJjb250cm9sIiwiY29udHJvbElkIiwiaXNBIiwiZ2V0SWQiLCJnZXRDb250ZXh0Rm9yU2lkZUVmZmVjdHMiLCJiaW5kaW5nQ29udGV4dCIsInNpZGVFZmZlY3RFbnRpdHlUeXBlIiwiY29udGV4dEZvclNpZGVFZmZlY3RzIiwiZ2V0RW50aXR5VHlwZUZyb21Db250ZXh0IiwiZ2V0QmluZGluZyIsImdldENvbnRleHQiLCJ1bmRlZmluZWQiLCJnZXRGaWVsZFNpZGVFZmZlY3RzTWFwIiwiZmllbGQiLCJzaWRlRWZmZWN0c01hcCIsImZpZWxkR3JvdXBJZHMiLCJnZXRGaWVsZEdyb3VwSWRzIiwidmlld0VudGl0eVNldFNldE5hbWUiLCJnZXRWaWV3RGF0YSIsImVudGl0eVNldCIsInZpZXdFbnRpdHlTZXQiLCJnZXRDb252ZXJ0ZWRNZXRhTW9kZWwiLCJlbnRpdHlTZXRzIiwiZmluZCIsIm5hbWUiLCJnZXRTaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXBzIiwiZ2V0QmluZGluZ0NvbnRleHQiLCJ2aWV3RW50aXR5VHlwZSIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImZpZWxkUGF0aCIsImdldFRhcmdldFByb3BlcnR5IiwiY29udGV4dCIsImNvbnRyb2xTaWRlRWZmZWN0c0VudGl0eVR5cGUiLCJnZXRDb250cm9sRW50aXR5U2lkZUVmZmVjdHMiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsInNpZGVFZmZlY3RzTmFtZSIsIm9Db250cm9sU2lkZUVmZmVjdHMiLCJzb3VyY2VQcm9wZXJ0aWVzIiwiaW5jbHVkZXMiLCJpbW1lZGlhdGUiLCJzaWRlRWZmZWN0cyIsImZpZWxkQ29udGV4dCIsIm1TaWRlRWZmZWN0c01hcCIsImZpZWxkR3JvdXBJZCIsIl9nZXRTaWRlRWZmZWN0c1Byb3BlcnR5Rm9yRmllbGRHcm91cCIsIm9Db250ZXh0IiwiY2xlYXJGaWVsZEdyb3Vwc1ZhbGlkaXR5IiwiaXNGaWVsZEdyb3VwVmFsaWQiLCJpZCIsIl9nZXRGaWVsZEdyb3VwSW5kZXgiLCJsZW5ndGgiLCJkYXRhIiwibWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJ2aWV3QmluZGluZ1BhdGgiLCJnZXRQYXRoIiwidmlld01ldGFNb2RlbFBhdGgiLCJnZXRNZXRhUGF0aCIsInJlcGxhY2UiLCJoYW5kbGVGaWVsZENoYW5nZSIsImV2ZW50IiwiZmllbGRWYWxpZGl0eSIsImZpZWxkR3JvdXBQcmVSZXF1aXNpdGUiLCJnZXRTb3VyY2UiLCJfc2F2ZUZpZWxkUHJvcGVydGllc1N0YXR1cyIsImZpbHRlciIsInNpZGVFZmZlY3RzUHJvcGVydGllcyIsInJlZ2lzdGVyRmllbGRHcm91cFNpZGVFZmZlY3RzIiwiZ2V0UGFyYW1ldGVyIiwiUHJvbWlzZSIsInJlc29sdmUiLCJlIiwiTG9nIiwiZGVidWciLCJfbWFuYWdlU2lkZUVmZmVjdHNGcm9tRmllbGQiLCJoYW5kbGVGaWVsZEdyb3VwQ2hhbmdlIiwiZmllbGRHcm91cHNTaWRlRWZmZWN0cyIsInJlZHVjZSIsInJlc3VsdHMiLCJjb25jYXQiLCJnZXRSZWdpc3RlcmVkU2lkZUVmZmVjdHNGb3JGaWVsZEdyb3VwIiwiYWxsIiwibWFwIiwiZmllbGRHcm91cFNpZGVFZmZlY3RzIiwiX3JlcXVlc3RGaWVsZEdyb3VwU2lkZUVmZmVjdHMiLCJjYXRjaCIsImVycm9yIiwiY29udGV4dFBhdGgiLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCJncm91cElkIiwiZm5HZXRUYXJnZXRzIiwidGFyZ2V0cyIsInRyaWdnZXJBY3Rpb24iLCJ0YXJnZXRzQW5kQWN0aW9uRGF0YSIsInRhcmdldEVudGl0aWVzIiwidGFyZ2V0UHJvcGVydGllcyIsImV4ZWN1dGVBY3Rpb24iLCJyZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzIiwiZ2V0UmVnaXN0ZXJlZEZhaWxlZFJlcXVlc3RzIiwiaXNOb3RBbHJlYWR5TGlzdGVkIiwiZXZlcnkiLCJtRmFpbGVkU2lkZUVmZmVjdHMiLCJwdXNoIiwidW5yZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzRm9yQUNvbnRleHQiLCJ1bnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHMiLCJzaWRlRWZmZWN0c0Z1bGx5UXVhbGlmaWVkTmFtZSIsInByb21pc2UiLCJzaWRlRWZmZWN0UHJvcGVydHkiLCJ1bnJlZ2lzdGVyRmllbGRHcm91cFNpZGVFZmZlY3RzIiwicmVnaXN0cnlJbmRleCIsInN0YXJ0c1dpdGgiLCJpbmRleE9mIiwic2lkZUVmZmVjdFBhcnRzIiwic3BsaXQiLCJzaWRlRWZmZWN0UGF0aCIsImdldE9EYXRhRW50aXR5U2lkZUVmZmVjdHMiLCJmYWlsZWRTaWRlRWZmZWN0c1Byb21pc2VzIiwic2lkZUVmZmVjdHNQcm9taXNlcyIsImZhaWxlZFNpZGVFZmZlY3RzIiwiZmFpbGVkU2lkZUVmZmVjdCIsInN1Y2Nlc3MiLCJrZXkiLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJTaWRlRWZmZWN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IEZFVmlldyB9IGZyb20gXCJzYXAvZmUvY29yZS9CYXNlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUge1xuXHRDb250cm9sU2lkZUVmZmVjdHNUeXBlLFxuXHRPRGF0YVNpZGVFZmZlY3RzVHlwZSxcblx0U2lkZUVmZmVjdHNTZXJ2aWNlLFxuXHRTaWRlRWZmZWN0c1RhcmdldCxcblx0U2lkZUVmZmVjdHNUeXBlXG59IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb250cm9sbGVyRXh0ZW5zaW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlckV4dGVuc2lvblwiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcIi4uL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBCYXNlTWFuaWZlc3RTZXR0aW5ncyB9IGZyb20gXCIuLi9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBmaW5hbEV4dGVuc2lvbiwgbWV0aG9kT3ZlcnJpZGUsIHByaXZhdGVFeHRlbnNpb24sIHB1YmxpY0V4dGVuc2lvbiB9IGZyb20gXCIuLi9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IFBhZ2VDb250cm9sbGVyIGZyb20gXCIuLi9QYWdlQ29udHJvbGxlclwiO1xuXG50eXBlIEJhc2VTaWRlRWZmZWN0UHJvcGVydHlUeXBlID0ge1xuXHRuYW1lOiBzdHJpbmc7XG5cdGltbWVkaWF0ZT86IGJvb2xlYW47XG5cdHNpZGVFZmZlY3RzOiBTaWRlRWZmZWN0c1R5cGU7XG59O1xuXG5leHBvcnQgdHlwZSBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZSA9IEJhc2VTaWRlRWZmZWN0UHJvcGVydHlUeXBlO1xuXG5leHBvcnQgdHlwZSBGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGUgPSBCYXNlU2lkZUVmZmVjdFByb3BlcnR5VHlwZSAmIHtcblx0Y29udGV4dDogQ29udGV4dDtcbn07XG5cbmV4cG9ydCB0eXBlIEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkgPSBSZWNvcmQ8c3RyaW5nLCBGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGU+O1xuXG5leHBvcnQgdHlwZSBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkgPSBSZWNvcmQ8c3RyaW5nLCBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZT47XG5cbnR5cGUgRmFpbGVkU2lkZUVmZmVjdERpY3Rpb25hcnkgPSBSZWNvcmQ8c3RyaW5nLCBTaWRlRWZmZWN0c1R5cGVbXT47XG5cbmV4cG9ydCB0eXBlIEZpZWxkR3JvdXBTaWRlRWZmZWN0VHlwZSA9IHtcblx0cHJvbWlzZTogUHJvbWlzZTxhbnk+O1xuXHRzaWRlRWZmZWN0UHJvcGVydHk6IEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZTtcbn07XG5cbmNvbnN0IElNTUVESUFURV9SRVFVRVNUID0gXCIkJEltbWVkaWF0ZVJlcXVlc3RcIjtcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlNpZGVFZmZlY3RzXCIpXG5jbGFzcyBTaWRlRWZmZWN0c0NvbnRyb2xsZXJFeHRlbnNpb24gZXh0ZW5kcyBDb250cm9sbGVyRXh0ZW5zaW9uIHtcblx0cHJvdGVjdGVkIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblxuXHRwcml2YXRlIF92aWV3ITogRkVWaWV3O1xuXG5cdHByaXZhdGUgX3JlZ2lzdGVyZWRGaWVsZEdyb3VwTWFwITogUmVjb3JkPHN0cmluZywgRmllbGRHcm91cFNpZGVFZmZlY3RUeXBlPjtcblxuXHRwcml2YXRlIF9maWVsZEdyb3VwSW52YWxpZGl0eSE6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+PjtcblxuXHRwcml2YXRlIF9zaWRlRWZmZWN0c1NlcnZpY2UhOiBTaWRlRWZmZWN0c1NlcnZpY2U7XG5cblx0cHJpdmF0ZSBfcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzITogRmFpbGVkU2lkZUVmZmVjdERpY3Rpb25hcnk7XG5cblx0QG1ldGhvZE92ZXJyaWRlKClcblx0b25Jbml0KCkge1xuXHRcdHRoaXMuX3ZpZXcgPSB0aGlzLmJhc2UuZ2V0VmlldygpO1xuXHRcdHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZSA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzLl92aWV3KS5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTtcblx0XHR0aGlzLl9yZWdpc3RlcmVkRmllbGRHcm91cE1hcCA9IHt9O1xuXHRcdHRoaXMuX2ZpZWxkR3JvdXBJbnZhbGlkaXR5ID0ge307XG5cdFx0dGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzID0ge307XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIFNpZGVFZmZlY3RzIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBhZGRDb250cm9sU2lkZUVmZmVjdHNcblx0ICogQHBhcmFtIGVudGl0eVR5cGUgTmFtZSBvZiB0aGUgZW50aXR5IHdoZXJlIHRoZSBTaWRlRWZmZWN0cyBjb250cm9sIHdpbGwgYmUgcmVnaXN0ZXJlZFxuXHQgKiBAcGFyYW0gY29udHJvbFNpZGVFZmZlY3RzIFNpZGVFZmZlY3RzIHRvIHJlZ2lzdGVyLiBFbnN1cmUgdGhlIHNvdXJjZUNvbnRyb2xJZCBtYXRjaGVzIHRoZSBhc3NvY2lhdGVkIFNBUFVJNSBjb250cm9sIElELlxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFkZENvbnRyb2xTaWRlRWZmZWN0cyhlbnRpdHlUeXBlOiBzdHJpbmcsIGNvbnRyb2xTaWRlRWZmZWN0czogT21pdDxDb250cm9sU2lkZUVmZmVjdHNUeXBlLCBcImZ1bGx5UXVhbGlmaWVkTmFtZVwiPik6IHZvaWQge1xuXHRcdHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5hZGRDb250cm9sU2lkZUVmZmVjdHMoZW50aXR5VHlwZSwgY29udHJvbFNpZGVFZmZlY3RzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIFNpZGVFZmZlY3RzIGNyZWF0ZWQgYnkgYSBjb250cm9sLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgcmVtb3ZlQ29udHJvbFNpZGVFZmZlY3RzXG5cdCAqIEBwYXJhbSBjb250cm9sIFNBUFVJNSBDb250cm9sXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cmVtb3ZlQ29udHJvbFNpZGVFZmZlY3RzKGNvbnRyb2w6IENvbnRyb2wpOiB2b2lkIHtcblx0XHRjb25zdCBjb250cm9sSWQgPSBjb250cm9sLmlzQT8uKFwic2FwLnVpLmJhc2UuTWFuYWdlZE9iamVjdFwiKSAmJiBjb250cm9sLmdldElkKCk7XG5cblx0XHRpZiAoY29udHJvbElkKSB7XG5cdFx0XHR0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UucmVtb3ZlQ29udHJvbFNpZGVFZmZlY3RzKGNvbnRyb2xJZCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGFwcHJvcHJpYXRlIGNvbnRleHQgb24gd2hpY2ggU2lkZUVmZmVjdHMgY2FuIGJlIHJlcXVlc3RlZC5cblx0ICogVGhlIGNvcnJlY3Qgb25lIG11c3QgaGF2ZSB0aGUgYmluZGluZyBwYXJhbWV0ZXIgJCRwYXRjaFdpdGhvdXRTaWRlRWZmZWN0cy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldENvbnRleHRGb3JTaWRlRWZmZWN0c1xuXHQgKiBAcGFyYW0gYmluZGluZ0NvbnRleHQgSW5pdGlhbCBiaW5kaW5nIGNvbnRleHRcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RFbnRpdHlUeXBlIEVudGl0eVR5cGUgb2YgdGhlIHNpZGVFZmZlY3RzXG5cdCAqIEByZXR1cm5zIFNBUFVJNSBDb250ZXh0IG9yIHVuZGVmaW5lZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldENvbnRleHRGb3JTaWRlRWZmZWN0cyhiaW5kaW5nQ29udGV4dDogYW55LCBzaWRlRWZmZWN0RW50aXR5VHlwZTogc3RyaW5nKTogQ29udGV4dCB8IHVuZGVmaW5lZCB7XG5cdFx0bGV0IGNvbnRleHRGb3JTaWRlRWZmZWN0cyA9IGJpbmRpbmdDb250ZXh0LFxuXHRcdFx0ZW50aXR5VHlwZSA9IHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5nZXRFbnRpdHlUeXBlRnJvbUNvbnRleHQoYmluZGluZ0NvbnRleHQpO1xuXG5cdFx0aWYgKHNpZGVFZmZlY3RFbnRpdHlUeXBlICE9PSBlbnRpdHlUeXBlKSB7XG5cdFx0XHRjb250ZXh0Rm9yU2lkZUVmZmVjdHMgPSBiaW5kaW5nQ29udGV4dC5nZXRCaW5kaW5nKCkuZ2V0Q29udGV4dCgpO1xuXHRcdFx0aWYgKGNvbnRleHRGb3JTaWRlRWZmZWN0cykge1xuXHRcdFx0XHRlbnRpdHlUeXBlID0gdGhpcy5fc2lkZUVmZmVjdHNTZXJ2aWNlLmdldEVudGl0eVR5cGVGcm9tQ29udGV4dChjb250ZXh0Rm9yU2lkZUVmZmVjdHMpO1xuXHRcdFx0XHRpZiAoc2lkZUVmZmVjdEVudGl0eVR5cGUgIT09IGVudGl0eVR5cGUpIHtcblx0XHRcdFx0XHRjb250ZXh0Rm9yU2lkZUVmZmVjdHMgPSBjb250ZXh0Rm9yU2lkZUVmZmVjdHMuZ2V0QmluZGluZygpLmdldENvbnRleHQoKTtcblx0XHRcdFx0XHRpZiAoY29udGV4dEZvclNpZGVFZmZlY3RzKSB7XG5cdFx0XHRcdFx0XHRlbnRpdHlUeXBlID0gdGhpcy5fc2lkZUVmZmVjdHNTZXJ2aWNlLmdldEVudGl0eVR5cGVGcm9tQ29udGV4dChjb250ZXh0Rm9yU2lkZUVmZmVjdHMpO1xuXHRcdFx0XHRcdFx0aWYgKHNpZGVFZmZlY3RFbnRpdHlUeXBlICE9PSBlbnRpdHlUeXBlKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNvbnRleHRGb3JTaWRlRWZmZWN0cyB8fCB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgU2lkZUVmZmVjdHMgbWFwIGZvciBhIGZpZWxkXG5cdCAqIFRoZXNlIFNpZGVFZmZlY3RzIGFyZVxuXHQgKiAtIGxpc3RlZCBpbnRvIEZpZWxkR3JvdXBJZHMgKGNvbWluZyBmcm9tIGFuIE9EYXRhIFNlcnZpY2UpXG5cdCAqIC0gZ2VuZXJhdGVkIGJ5IGEgY29udHJvbCBvciBjb250cm9scyBhbmQgdGhhdCBjb25maWd1cmUgdGhpcyBmaWVsZCBhcyBTb3VyY2VQcm9wZXJ0aWVzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0RmllbGRTaWRlRWZmZWN0c01hcFxuXHQgKiBAcGFyYW0gZmllbGQgRmllbGQgY29udHJvbFxuXHQgKiBAcmV0dXJucyBTaWRlRWZmZWN0cyBtYXBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRGaWVsZFNpZGVFZmZlY3RzTWFwKGZpZWxkOiBDb250cm9sKTogRmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeSB7XG5cdFx0bGV0IHNpZGVFZmZlY3RzTWFwOiBGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5ID0ge307XG5cdFx0Y29uc3QgZmllbGRHcm91cElkcyA9IGZpZWxkLmdldEZpZWxkR3JvdXBJZHMoKSxcblx0XHRcdHZpZXdFbnRpdHlTZXRTZXROYW1lID0gKHRoaXMuX3ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBCYXNlTWFuaWZlc3RTZXR0aW5ncykuZW50aXR5U2V0LFxuXHRcdFx0dmlld0VudGl0eVNldCA9IHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5nZXRDb252ZXJ0ZWRNZXRhTW9kZWwoKS5lbnRpdHlTZXRzLmZpbmQoKGVudGl0eVNldCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gZW50aXR5U2V0Lm5hbWUgPT09IHZpZXdFbnRpdHlTZXRTZXROYW1lO1xuXHRcdFx0fSk7XG5cblx0XHQvLyBTaWRlRWZmZWN0cyBjb21pbmcgZnJvbSBhbiBPRGF0YSBTZXJ2aWNlXG5cdFx0c2lkZUVmZmVjdHNNYXAgPSB0aGlzLmdldFNpZGVFZmZlY3RzTWFwRm9yRmllbGRHcm91cHMoXG5cdFx0XHRmaWVsZEdyb3VwSWRzLFxuXHRcdFx0ZmllbGQuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0IHwgbnVsbCB8IHVuZGVmaW5lZFxuXHRcdCkgYXMgRmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeTtcblxuXHRcdC8vIFNpZGVFZmZlY3RzIGNvbWluZyBmcm9tIGNvbnRyb2wocylcblx0XHRpZiAodmlld0VudGl0eVNldFNldE5hbWUgJiYgdmlld0VudGl0eVNldCkge1xuXHRcdFx0Y29uc3Qgdmlld0VudGl0eVR5cGUgPSB2aWV3RW50aXR5U2V0LmVudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0XHRmaWVsZFBhdGggPSB0aGlzLmdldFRhcmdldFByb3BlcnR5KGZpZWxkKSxcblx0XHRcdFx0Y29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dEZvclNpZGVFZmZlY3RzKGZpZWxkLmdldEJpbmRpbmdDb250ZXh0KCksIHZpZXdFbnRpdHlUeXBlKTtcblxuXHRcdFx0aWYgKGZpZWxkUGF0aCAmJiBjb250ZXh0KSB7XG5cdFx0XHRcdGNvbnN0IGNvbnRyb2xTaWRlRWZmZWN0c0VudGl0eVR5cGUgPSB0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UuZ2V0Q29udHJvbEVudGl0eVNpZGVFZmZlY3RzKHZpZXdFbnRpdHlUeXBlKTtcblx0XHRcdFx0T2JqZWN0LmtleXMoY29udHJvbFNpZGVFZmZlY3RzRW50aXR5VHlwZSkuZm9yRWFjaCgoc2lkZUVmZmVjdHNOYW1lKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qgb0NvbnRyb2xTaWRlRWZmZWN0cyA9IGNvbnRyb2xTaWRlRWZmZWN0c0VudGl0eVR5cGVbc2lkZUVmZmVjdHNOYW1lXTtcblx0XHRcdFx0XHRpZiAob0NvbnRyb2xTaWRlRWZmZWN0cy5zb3VyY2VQcm9wZXJ0aWVzLmluY2x1ZGVzKGZpZWxkUGF0aCkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBgJHtzaWRlRWZmZWN0c05hbWV9Ojoke3ZpZXdFbnRpdHlUeXBlfWA7XG5cdFx0XHRcdFx0XHRzaWRlRWZmZWN0c01hcFtuYW1lXSA9IHtcblx0XHRcdFx0XHRcdFx0bmFtZTogbmFtZSxcblx0XHRcdFx0XHRcdFx0aW1tZWRpYXRlOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRzaWRlRWZmZWN0czogb0NvbnRyb2xTaWRlRWZmZWN0cyxcblx0XHRcdFx0XHRcdFx0Y29udGV4dDogY29udGV4dFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc2lkZUVmZmVjdHNNYXA7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgc2lkZUVmZmVjdHMgbWFwIGZvciBmaWVsZEdyb3Vwcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFNpZGVFZmZlY3RzTWFwRm9yRmllbGRHcm91cHNcblx0ICogQHBhcmFtIGZpZWxkR3JvdXBJZHMgRmllbGQgZ3JvdXAgaWRzXG5cdCAqIEBwYXJhbSBmaWVsZENvbnRleHQgRmllbGQgYmluZGluZyBjb250ZXh0XG5cdCAqIEByZXR1cm5zIFNpZGVFZmZlY3RzIG1hcFxuXHQgKi9cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0U2lkZUVmZmVjdHNNYXBGb3JGaWVsZEdyb3Vwcyhcblx0XHRmaWVsZEdyb3VwSWRzOiBzdHJpbmdbXSxcblx0XHRmaWVsZENvbnRleHQ/OiBDb250ZXh0IHwgbnVsbFxuXHQpOiBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkgfCBGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5IHtcblx0XHRjb25zdCBtU2lkZUVmZmVjdHNNYXA6IE1hc3NFZGl0RmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeSB8IEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkgPSB7fTtcblx0XHRmaWVsZEdyb3VwSWRzLmZvckVhY2goKGZpZWxkR3JvdXBJZCkgPT4ge1xuXHRcdFx0Y29uc3QgeyBuYW1lLCBpbW1lZGlhdGUsIHNpZGVFZmZlY3RzLCBzaWRlRWZmZWN0RW50aXR5VHlwZSB9ID0gdGhpcy5fZ2V0U2lkZUVmZmVjdHNQcm9wZXJ0eUZvckZpZWxkR3JvdXAoZmllbGRHcm91cElkKTtcblx0XHRcdGNvbnN0IG9Db250ZXh0ID0gZmllbGRDb250ZXh0ID8gKHRoaXMuZ2V0Q29udGV4dEZvclNpZGVFZmZlY3RzKGZpZWxkQ29udGV4dCwgc2lkZUVmZmVjdEVudGl0eVR5cGUpIGFzIENvbnRleHQpIDogdW5kZWZpbmVkO1xuXHRcdFx0aWYgKHNpZGVFZmZlY3RzICYmICghZmllbGRDb250ZXh0IHx8IChmaWVsZENvbnRleHQgJiYgb0NvbnRleHQpKSkge1xuXHRcdFx0XHRtU2lkZUVmZmVjdHNNYXBbbmFtZV0gPSB7XG5cdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRpbW1lZGlhdGUsXG5cdFx0XHRcdFx0c2lkZUVmZmVjdHNcblx0XHRcdFx0fTtcblx0XHRcdFx0aWYgKGZpZWxkQ29udGV4dCkge1xuXHRcdFx0XHRcdChtU2lkZUVmZmVjdHNNYXBbbmFtZV0gYXMgRmllbGRTaWRlRWZmZWN0UHJvcGVydHlUeXBlKS5jb250ZXh0ID0gb0NvbnRleHQhO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG1TaWRlRWZmZWN0c01hcDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDbGVhciByZWNvcmRlZCB2YWxpZGF0aW9uIHN0YXR1cyBmb3IgYWxsIHByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBjbGVhckZpZWxkR3JvdXBzVmFsaWRpdHlcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRjbGVhckZpZWxkR3JvdXBzVmFsaWRpdHkoKTogdm9pZCB7XG5cdFx0dGhpcy5fZmllbGRHcm91cEludmFsaWRpdHkgPSB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDbGVhciByZWNvcmRlZCB2YWxpZGF0aW9uIHN0YXR1cyBmb3IgYWxsIHByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc0ZpZWxkR3JvdXBWYWxpZFxuXHQgKiBAcGFyYW0gZmllbGRHcm91cElkIEZpZWxkIGdyb3VwIGlkXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHRcblx0ICogQHJldHVybnMgU0FQVUk1IENvbnRleHQgb3IgdW5kZWZpbmVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0aXNGaWVsZEdyb3VwVmFsaWQoZmllbGRHcm91cElkOiBzdHJpbmcsIGNvbnRleHQ6IENvbnRleHQpOiBib29sZWFuIHtcblx0XHRjb25zdCBpZCA9IHRoaXMuX2dldEZpZWxkR3JvdXBJbmRleChmaWVsZEdyb3VwSWQsIGNvbnRleHQpO1xuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9maWVsZEdyb3VwSW52YWxpZGl0eVtpZF0gPz8ge30pLmxlbmd0aCA9PT0gMDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSByZWxhdGl2ZSB0YXJnZXQgcHJvcGVydHkgcmVsYXRlZCB0byB0aGUgRmllbGQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRUYXJnZXRQcm9wZXJ0eVxuXHQgKiBAcGFyYW0gZmllbGQgRmllbGQgY29udHJvbFxuXHQgKiBAcmV0dXJucyBSZWxhdGl2ZSB0YXJnZXQgcHJvcGVydHlcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRUYXJnZXRQcm9wZXJ0eShmaWVsZDogQ29udHJvbCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgZmllbGRQYXRoID0gZmllbGQuZGF0YShcInNvdXJjZVBhdGhcIikgYXMgc3RyaW5nO1xuXHRcdGNvbnN0IG1ldGFNb2RlbCA9IHRoaXMuX3ZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCB2aWV3QmluZGluZ1BhdGggPSB0aGlzLl92aWV3LmdldEJpbmRpbmdDb250ZXh0KCk/LmdldFBhdGgoKTtcblx0XHRjb25zdCB2aWV3TWV0YU1vZGVsUGF0aCA9IHZpZXdCaW5kaW5nUGF0aCA/IGAke21ldGFNb2RlbC5nZXRNZXRhUGF0aCh2aWV3QmluZGluZ1BhdGgpfS9gIDogXCJcIjtcblx0XHRyZXR1cm4gZmllbGRQYXRoPy5yZXBsYWNlKHZpZXdNZXRhTW9kZWxQYXRoLCBcIlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNYW5hZ2VzIHRoZSB3b3JrZmxvdyBmb3IgU2lkZUVmZmVjdHMgd2l0aCByZWxhdGVkIGNoYW5nZXMgdG8gYSBmaWVsZFxuXHQgKiBUaGUgZm9sbG93aW5nIHNjZW5hcmlvcyBhcmUgbWFuYWdlZDpcblx0ICogIC0gUmVnaXN0ZXI6IGNhY2hlcyBkZWZlcnJlZCBTaWRlRWZmZWN0cyB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgRmllbGRHcm91cCBpcyB1bmZvY3VzZWRcblx0ICogIC0gRXhlY3V0ZTogdHJpZ2dlcnMgaW1tZWRpYXRlIFNpZGVFZmZlY3RzIHJlcXVlc3RzIGlmIHRoZSBwcm9taXNlIGZvciB0aGUgZmllbGQgZXZlbnQgaXMgZnVsZmlsbGVkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaGFuZGxlRmllbGRDaGFuZ2Vcblx0ICogQHBhcmFtIGV2ZW50IFNBUFVJNSBldmVudCB0aGF0IGNvbWVzIGZyb20gYSBmaWVsZCBjaGFuZ2Vcblx0ICogQHBhcmFtIGZpZWxkVmFsaWRpdHlcblx0ICogQHBhcmFtIGZpZWxkR3JvdXBQcmVSZXF1aXNpdGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWQgYmVmb3JlIGV4ZWN1dGluZyBkZWZlcnJlZCBTaWRlRWZmZWN0c1xuXHQgKiBAcmV0dXJucyAgUHJvbWlzZSBvbiBTaWRlRWZmZWN0cyByZXF1ZXN0KHMpXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgaGFuZGxlRmllbGRDaGFuZ2UoZXZlbnQ6IEV2ZW50LCBmaWVsZFZhbGlkaXR5OiBib29sZWFuLCBmaWVsZEdyb3VwUHJlUmVxdWlzaXRlPzogUHJvbWlzZTxhbnk+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgZmllbGQgPSBldmVudC5nZXRTb3VyY2UoKSBhcyBDb250cm9sO1xuXHRcdHRoaXMuX3NhdmVGaWVsZFByb3BlcnRpZXNTdGF0dXMoZmllbGQsIGZpZWxkVmFsaWRpdHkpO1xuXHRcdGlmICghZmllbGRWYWxpZGl0eSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBzaWRlRWZmZWN0c01hcCA9IHRoaXMuZ2V0RmllbGRTaWRlRWZmZWN0c01hcChmaWVsZCk7XG5cblx0XHQvLyByZWdpc3RlciBmaWVsZCBncm91cCBTaWRlRWZmZWN0c1xuXHRcdE9iamVjdC5rZXlzKHNpZGVFZmZlY3RzTWFwKVxuXHRcdFx0LmZpbHRlcigoc2lkZUVmZmVjdHNOYW1lKSA9PiBzaWRlRWZmZWN0c01hcFtzaWRlRWZmZWN0c05hbWVdLmltbWVkaWF0ZSAhPT0gdHJ1ZSlcblx0XHRcdC5mb3JFYWNoKChzaWRlRWZmZWN0c05hbWUpID0+IHtcblx0XHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNQcm9wZXJ0aWVzID0gc2lkZUVmZmVjdHNNYXBbc2lkZUVmZmVjdHNOYW1lXTtcblx0XHRcdFx0dGhpcy5yZWdpc3RlckZpZWxkR3JvdXBTaWRlRWZmZWN0cyhzaWRlRWZmZWN0c1Byb3BlcnRpZXMsIGZpZWxkR3JvdXBQcmVSZXF1aXNpdGUpO1xuXHRcdFx0fSk7XG5cblx0XHQvLyB3YWl0IGZvciBmaWVsZCB2YWxpZGF0aW9uXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IChldmVudC5nZXRQYXJhbWV0ZXIoXCJwcm9taXNlXCIpID8/IFByb21pc2UucmVzb2x2ZSgpKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRMb2cuZGVidWcoXCJQcmVyZXF1aXNpdGVzIG9uIEZpZWxkIGZvciB0aGUgU2lkZUVmZmVjdHMgaGF2ZSBiZWVuIHJlamVjdGVkXCIsIGUgYXMgc3RyaW5nKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fbWFuYWdlU2lkZUVmZmVjdHNGcm9tRmllbGQoZmllbGQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1hbmFnZXMgU2lkZUVmZmVjdHMgd2l0aCBhIHJlbGF0ZWQgJ2ZvY3VzIG91dCcgdG8gYSBmaWVsZCBncm91cC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGhhbmRsZUZpZWxkR3JvdXBDaGFuZ2Vcblx0ICogQHBhcmFtIGV2ZW50IFNBUFVJNSBFdmVudFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJldHVybmluZyB0cnVlIGlmIHRoZSBTaWRlRWZmZWN0cyBoYXZlIGJlZW4gc3VjY2Vzc2Z1bGx5IGV4ZWN1dGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0aGFuZGxlRmllbGRHcm91cENoYW5nZShldmVudDogRXZlbnQpOiBQcm9taXNlPHZvaWQgfCB2b2lkW10+IHtcblx0XHRjb25zdCBmaWVsZCA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2wsXG5cdFx0XHRmaWVsZEdyb3VwSWRzOiBzdHJpbmdbXSA9IGV2ZW50LmdldFBhcmFtZXRlcihcImZpZWxkR3JvdXBJZHNcIiksXG5cdFx0XHRmaWVsZEdyb3Vwc1NpZGVFZmZlY3RzID0gZmllbGRHcm91cElkcy5yZWR1Y2UoKHJlc3VsdHM6IEZpZWxkR3JvdXBTaWRlRWZmZWN0VHlwZVtdLCBmaWVsZEdyb3VwSWQpID0+IHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdHMuY29uY2F0KHRoaXMuZ2V0UmVnaXN0ZXJlZFNpZGVFZmZlY3RzRm9yRmllbGRHcm91cChmaWVsZEdyb3VwSWQpKTtcblx0XHRcdH0sIFtdKTtcblxuXHRcdHJldHVybiBQcm9taXNlLmFsbChcblx0XHRcdGZpZWxkR3JvdXBzU2lkZUVmZmVjdHMubWFwKChmaWVsZEdyb3VwU2lkZUVmZmVjdHMpID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX3JlcXVlc3RGaWVsZEdyb3VwU2lkZUVmZmVjdHMoZmllbGRHcm91cFNpZGVFZmZlY3RzKTtcblx0XHRcdH0pXG5cdFx0KS5jYXRjaCgoZXJyb3IpID0+IHtcblx0XHRcdGNvbnN0IGNvbnRleHRQYXRoID0gZmllbGQuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpO1xuXHRcdFx0TG9nLmRlYnVnKGBFcnJvciB3aGlsZSBwcm9jZXNzaW5nIEZpZWxkR3JvdXAgU2lkZUVmZmVjdHMgb24gY29udGV4dCAke2NvbnRleHRQYXRofWAsIGVycm9yKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0IFNpZGVFZmZlY3RzIG9uIGEgc3BlY2lmaWMgY29udGV4dC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHJlcXVlc3RTaWRlRWZmZWN0c1xuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHMgU2lkZUVmZmVjdHMgdG8gYmUgZXhlY3V0ZWRcblx0ICogQHBhcmFtIGNvbnRleHQgQ29udGV4dCB3aGVyZSBTaWRlRWZmZWN0cyBuZWVkIHRvIGJlIGV4ZWN1dGVkXG5cdCAqIEBwYXJhbSBncm91cElkXG5cdCAqIEBwYXJhbSBmbkdldFRhcmdldHMgVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdoaWNoIHdpbGwgZ2l2ZSB1cyB0aGUgdGFyZ2V0cyBhbmQgYWN0aW9ucyBpZiBpdCB3YXMgY29taW5nIHRocm91Z2ggc29tZSBzcGVjaWZpYyBoYW5kbGluZy5cblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgcmVxdWVzdCBvbiBTQVBVSTUgY29udGV4dFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIHJlcXVlc3RTaWRlRWZmZWN0cyhzaWRlRWZmZWN0czogU2lkZUVmZmVjdHNUeXBlLCBjb250ZXh0OiBDb250ZXh0LCBncm91cElkPzogc3RyaW5nLCBmbkdldFRhcmdldHM/OiBGdW5jdGlvbik6IFByb21pc2U8dW5rbm93bj4ge1xuXHRcdGxldCB0YXJnZXRzOiBTaWRlRWZmZWN0c1RhcmdldFtdLCB0cmlnZ2VyQWN0aW9uO1xuXHRcdGlmIChmbkdldFRhcmdldHMpIHtcblx0XHRcdGNvbnN0IHRhcmdldHNBbmRBY3Rpb25EYXRhID0gYXdhaXQgZm5HZXRUYXJnZXRzKHNpZGVFZmZlY3RzKTtcblx0XHRcdHRhcmdldHMgPSB0YXJnZXRzQW5kQWN0aW9uRGF0YVtcImFUYXJnZXRzXCJdO1xuXHRcdFx0dHJpZ2dlckFjdGlvbiA9IHRhcmdldHNBbmRBY3Rpb25EYXRhW1wiVHJpZ2dlckFjdGlvblwiXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFyZ2V0cyA9IFsuLi4oc2lkZUVmZmVjdHMudGFyZ2V0RW50aXRpZXMgPz8gW10pLCAuLi4oc2lkZUVmZmVjdHMudGFyZ2V0UHJvcGVydGllcyA/PyBbXSldO1xuXHRcdFx0dHJpZ2dlckFjdGlvbiA9IChzaWRlRWZmZWN0cyBhcyBPRGF0YVNpZGVFZmZlY3RzVHlwZSkudHJpZ2dlckFjdGlvbjtcblx0XHR9XG5cdFx0aWYgKHRyaWdnZXJBY3Rpb24pIHtcblx0XHRcdHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5leGVjdXRlQWN0aW9uKHRyaWdnZXJBY3Rpb24sIGNvbnRleHQsIGdyb3VwSWQpO1xuXHRcdH1cblxuXHRcdGlmICh0YXJnZXRzLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5yZXF1ZXN0U2lkZUVmZmVjdHModGFyZ2V0cywgY29udGV4dCwgZ3JvdXBJZCkuY2F0Y2goKGVycm9yOiB1bmtub3duKSA9PiB7XG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0cyhzaWRlRWZmZWN0cywgY29udGV4dCk7XG5cdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgZmFpbGVkIFNpZGVFZmZlY3RzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0UmVnaXN0ZXJlZEZhaWxlZFJlcXVlc3RzXG5cdCAqIEByZXR1cm5zIFJlZ2lzdGVyZWQgU2lkZUVmZmVjdHMgcmVxdWVzdHMgdGhhdCBoYXZlIGZhaWxlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHB1YmxpYyBnZXRSZWdpc3RlcmVkRmFpbGVkUmVxdWVzdHMoKTogRmFpbGVkU2lkZUVmZmVjdERpY3Rpb25hcnkge1xuXHRcdHJldHVybiB0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBTaWRlRWZmZWN0cyB0byB0aGUgcXVldWUgb2YgdGhlIGZhaWxlZCBTaWRlRWZmZWN0c1xuXHQgKiBUaGUgU2lkZUVmZmVjdHMgYXJlIHJldHJpZ2dlcmVkIG9uIHRoZSBuZXh0IGNoYW5nZSBvbiB0aGUgc2FtZSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgcmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0c1xuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHMgU2lkZUVmZmVjdHMgdGhhdCBuZWVkIHRvIGJlIHJldHJpZ2dlcmVkXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgd2hlcmUgU2lkZUVmZmVjdHMgaGF2ZSBmYWlsZWRcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0cyhzaWRlRWZmZWN0czogU2lkZUVmZmVjdHNUeXBlLCBjb250ZXh0OiBDb250ZXh0KTogdm9pZCB7XG5cdFx0Y29uc3QgY29udGV4dFBhdGggPSBjb250ZXh0LmdldFBhdGgoKTtcblx0XHR0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHNbY29udGV4dFBhdGhdID0gdGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzW2NvbnRleHRQYXRoXSA/PyBbXTtcblx0XHRjb25zdCBpc05vdEFscmVhZHlMaXN0ZWQgPSB0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHNbY29udGV4dFBhdGhdLmV2ZXJ5KFxuXHRcdFx0KG1GYWlsZWRTaWRlRWZmZWN0cykgPT4gc2lkZUVmZmVjdHMuZnVsbHlRdWFsaWZpZWROYW1lICE9PSBtRmFpbGVkU2lkZUVmZmVjdHMuZnVsbHlRdWFsaWZpZWROYW1lXG5cdFx0KTtcblx0XHRpZiAoaXNOb3RBbHJlYWR5TGlzdGVkKSB7XG5cdFx0XHR0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHNbY29udGV4dFBhdGhdLnB1c2goc2lkZUVmZmVjdHMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIFNpZGVFZmZlY3RzIHRvIHRoZSBxdWV1ZSBvZiB0aGUgZmFpbGVkIFNpZGVFZmZlY3RzIGZvciBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSB1bnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHNGb3JBQ29udGV4dFxuXHQgKiBAcGFyYW0gY29udGV4dFBhdGggQ29udGV4dCBwYXRoIHdoZXJlIFNpZGVFZmZlY3RzIGhhdmUgZmFpbGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0dW5yZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzRm9yQUNvbnRleHQoY29udGV4dFBhdGg6IHN0cmluZykge1xuXHRcdGRlbGV0ZSB0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHNbY29udGV4dFBhdGhdO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgU2lkZUVmZmVjdHMgdG8gdGhlIHF1ZXVlIG9mIHRoZSBmYWlsZWQgU2lkZUVmZmVjdHMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSB1bnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHNcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzRnVsbHlRdWFsaWZpZWROYW1lIFNpZGVFZmZlY3RzIHRoYXQgbmVlZCB0byBiZSByZXRyaWdnZXJlZFxuXHQgKiBAcGFyYW0gY29udGV4dCBDb250ZXh0IHdoZXJlIFNpZGVFZmZlY3RzIGhhdmUgZmFpbGVkXG5cdCAqL1xuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHVucmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0cyhzaWRlRWZmZWN0c0Z1bGx5UXVhbGlmaWVkTmFtZTogc3RyaW5nLCBjb250ZXh0OiBDb250ZXh0KTogdm9pZCB7XG5cdFx0Y29uc3QgY29udGV4dFBhdGggPSBjb250ZXh0LmdldFBhdGgoKTtcblx0XHRpZiAodGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzW2NvbnRleHRQYXRoXT8ubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHNbY29udGV4dFBhdGhdID0gdGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzW2NvbnRleHRQYXRoXS5maWx0ZXIoXG5cdFx0XHRcdChzaWRlRWZmZWN0cykgPT4gc2lkZUVmZmVjdHMuZnVsbHlRdWFsaWZpZWROYW1lICE9PSBzaWRlRWZmZWN0c0Z1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBTaWRlRWZmZWN0cyB0byB0aGUgcXVldWUgb2YgYSBGaWVsZEdyb3VwXG5cdCAqIFRoZSBTaWRlRWZmZWN0cyBhcmUgdHJpZ2dlcmVkIHdoZW4gZXZlbnQgcmVsYXRlZCB0byB0aGUgZmllbGQgZ3JvdXAgY2hhbmdlIGlzIGZpcmVkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgcmVnaXN0ZXJGaWVsZEdyb3VwU2lkZUVmZmVjdHNcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzUHJvcGVydGllcyBTaWRlRWZmZWN0cyBwcm9wZXJ0aWVzXG5cdCAqIEBwYXJhbSBmaWVsZEdyb3VwUHJlUmVxdWlzaXRlIFByb21pc2UgdG8gZnVsbGZpbCBiZWZvcmUgZXhlY3V0aW5nIHRoZSBTaWRlRWZmZWN0c1xuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRyZWdpc3RlckZpZWxkR3JvdXBTaWRlRWZmZWN0cyhzaWRlRWZmZWN0c1Byb3BlcnRpZXM6IEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZSwgZmllbGRHcm91cFByZVJlcXVpc2l0ZT86IFByb21pc2U8dW5rbm93bj4pIHtcblx0XHRjb25zdCBpZCA9IHRoaXMuX2dldEZpZWxkR3JvdXBJbmRleChzaWRlRWZmZWN0c1Byb3BlcnRpZXMubmFtZSwgc2lkZUVmZmVjdHNQcm9wZXJ0aWVzLmNvbnRleHQpO1xuXHRcdGlmICghdGhpcy5fcmVnaXN0ZXJlZEZpZWxkR3JvdXBNYXBbaWRdKSB7XG5cdFx0XHR0aGlzLl9yZWdpc3RlcmVkRmllbGRHcm91cE1hcFtpZF0gPSB7XG5cdFx0XHRcdHByb21pc2U6IGZpZWxkR3JvdXBQcmVSZXF1aXNpdGUgPz8gUHJvbWlzZS5yZXNvbHZlKCksXG5cdFx0XHRcdHNpZGVFZmZlY3RQcm9wZXJ0eTogc2lkZUVmZmVjdHNQcm9wZXJ0aWVzXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIFNpZGVFZmZlY3RzIHRvIHRoZSBxdWV1ZSBvZiBhIEZpZWxkR3JvdXAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSB1bnJlZ2lzdGVyRmllbGRHcm91cFNpZGVFZmZlY3RzXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0c1Byb3BlcnRpZXMgU2lkZUVmZmVjdHMgcHJvcGVydGllc1xuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHR1bnJlZ2lzdGVyRmllbGRHcm91cFNpZGVFZmZlY3RzKHNpZGVFZmZlY3RzUHJvcGVydGllczogRmllbGRTaWRlRWZmZWN0UHJvcGVydHlUeXBlKSB7XG5cdFx0Y29uc3QgeyBjb250ZXh0LCBuYW1lIH0gPSBzaWRlRWZmZWN0c1Byb3BlcnRpZXM7XG5cdFx0Y29uc3QgaWQgPSB0aGlzLl9nZXRGaWVsZEdyb3VwSW5kZXgobmFtZSwgY29udGV4dCk7XG5cdFx0ZGVsZXRlIHRoaXMuX3JlZ2lzdGVyZWRGaWVsZEdyb3VwTWFwW2lkXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSByZWdpc3RlcmVkIFNpZGVFZmZlY3RzIGludG8gdGhlIHF1ZXVlIGZvciBhIGZpZWxkIGdyb3VwIGlkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0UmVnaXN0ZXJlZFNpZGVFZmZlY3RzRm9yRmllbGRHcm91cFxuXHQgKiBAcGFyYW0gZmllbGRHcm91cElkIEZpZWxkIGdyb3VwIGlkXG5cdCAqIEByZXR1cm5zIEFycmF5IG9mIHJlZ2lzdGVyZWQgU2lkZUVmZmVjdHMgYW5kIHRoZWlyIHByb21pc2Vcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRSZWdpc3RlcmVkU2lkZUVmZmVjdHNGb3JGaWVsZEdyb3VwKGZpZWxkR3JvdXBJZDogc3RyaW5nKTogRmllbGRHcm91cFNpZGVFZmZlY3RUeXBlW10ge1xuXHRcdGNvbnN0IHNpZGVFZmZlY3RzID0gW107XG5cdFx0Zm9yIChjb25zdCByZWdpc3RyeUluZGV4IG9mIE9iamVjdC5rZXlzKHRoaXMuX3JlZ2lzdGVyZWRGaWVsZEdyb3VwTWFwKSkge1xuXHRcdFx0aWYgKHJlZ2lzdHJ5SW5kZXguc3RhcnRzV2l0aChgJHtmaWVsZEdyb3VwSWR9X2ApKSB7XG5cdFx0XHRcdHNpZGVFZmZlY3RzLnB1c2godGhpcy5fcmVnaXN0ZXJlZEZpZWxkR3JvdXBNYXBbcmVnaXN0cnlJbmRleF0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc2lkZUVmZmVjdHM7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIHN0YXR1cyBpbmRleC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIF9nZXRGaWVsZEdyb3VwSW5kZXhcblx0ICogQHBhcmFtIGZpZWxkR3JvdXBJZCBUaGUgZmllbGQgZ3JvdXAgaWRcblx0ICogQHBhcmFtIGNvbnRleHQgU0FQVUk1IENvbnRleHRcblx0ICogQHJldHVybnMgSW5kZXhcblx0ICovXG5cdHByaXZhdGUgX2dldEZpZWxkR3JvdXBJbmRleChmaWVsZEdyb3VwSWQ6IHN0cmluZywgY29udGV4dDogQ29udGV4dCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGAke2ZpZWxkR3JvdXBJZH1fJHtjb250ZXh0LmdldFBhdGgoKX1gO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc2lkZUVmZmVjdHMgcHJvcGVydGllcyBmcm9tIGEgZmllbGQgZ3JvdXAgaWRcblx0ICogVGhlIHByb3BlcnRpZXMgYXJlOlxuXHQgKiAgLSBuYW1lXG5cdCAqICAtIHNpZGVFZmZlY3RzIGRlZmluaXRpb25cblx0ICogIC0gc2lkZUVmZmVjdHMgZW50aXR5IHR5cGVcblx0ICogIC0gaW1tZWRpYXRlIHNpZGVFZmZlY3RzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2dldFNpZGVFZmZlY3RzUHJvcGVydHlGb3JGaWVsZEdyb3VwXG5cdCAqIEBwYXJhbSBmaWVsZEdyb3VwSWRcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgcHJvcGVydGllc1xuXHQgKi9cblx0cHJpdmF0ZSBfZ2V0U2lkZUVmZmVjdHNQcm9wZXJ0eUZvckZpZWxkR3JvdXAoZmllbGRHcm91cElkOiBzdHJpbmcpIHtcblx0XHQvKipcblx0XHQgKiBzdHJpbmcgXCIkJEltbWVkaWF0ZVJlcXVlc3RcIiBpcyBhZGRlZCB0byB0aGUgU2lkZUVmZmVjdHMgbmFtZSBkdXJpbmcgdGVtcGxhdGluZyB0byBrbm93XG5cdFx0ICogaWYgdGhpcyBTaWRlRWZmZWN0cyBtdXN0IGJlIGltbWVkaWF0ZWx5IGV4ZWN1dGVkIHJlcXVlc3RlZCAob24gZmllbGQgY2hhbmdlKSBvciBtdXN0XG5cdFx0ICogYmUgZGVmZXJyZWQgKG9uIGZpZWxkIGdyb3VwIGZvY3VzIG91dClcblx0XHQgKlxuXHRcdCAqL1xuXHRcdGNvbnN0IGltbWVkaWF0ZSA9IGZpZWxkR3JvdXBJZC5pbmRleE9mKElNTUVESUFURV9SRVFVRVNUKSAhPT0gLTEsXG5cdFx0XHRuYW1lID0gZmllbGRHcm91cElkLnJlcGxhY2UoSU1NRURJQVRFX1JFUVVFU1QsIFwiXCIpLFxuXHRcdFx0c2lkZUVmZmVjdFBhcnRzID0gbmFtZS5zcGxpdChcIiNcIiksXG5cdFx0XHRzaWRlRWZmZWN0RW50aXR5VHlwZSA9IHNpZGVFZmZlY3RQYXJ0c1swXSxcblx0XHRcdHNpZGVFZmZlY3RQYXRoID0gYCR7c2lkZUVmZmVjdEVudGl0eVR5cGV9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TaWRlRWZmZWN0cyR7XG5cdFx0XHRcdHNpZGVFZmZlY3RQYXJ0cy5sZW5ndGggPT09IDIgPyBgIyR7c2lkZUVmZmVjdFBhcnRzWzFdfWAgOiBcIlwiXG5cdFx0XHR9YCxcblx0XHRcdHNpZGVFZmZlY3RzOiBPRGF0YVNpZGVFZmZlY3RzVHlwZSB8IHVuZGVmaW5lZCA9XG5cdFx0XHRcdHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5nZXRPRGF0YUVudGl0eVNpZGVFZmZlY3RzKHNpZGVFZmZlY3RFbnRpdHlUeXBlKT8uW3NpZGVFZmZlY3RQYXRoXTtcblx0XHRyZXR1cm4geyBuYW1lLCBpbW1lZGlhdGUsIHNpZGVFZmZlY3RzLCBzaWRlRWZmZWN0RW50aXR5VHlwZSB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIE1hbmFnZXMgdGhlIFNpZGVFZmZlY3RzIGZvciBhIGZpZWxkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX21hbmFnZVNpZGVFZmZlY3RzRnJvbUZpZWxkXG5cdCAqIEBwYXJhbSBmaWVsZCBGaWVsZCBjb250cm9sXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVsYXRlZCB0byB0aGUgcmVxdWVzdGVkIGltbWVkaWF0ZSBzaWRlRWZmZWN0c1xuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBfbWFuYWdlU2lkZUVmZmVjdHNGcm9tRmllbGQoZmllbGQ6IENvbnRyb2wpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBzaWRlRWZmZWN0c01hcCA9IHRoaXMuZ2V0RmllbGRTaWRlRWZmZWN0c01hcChmaWVsZCk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGZhaWxlZFNpZGVFZmZlY3RzUHJvbWlzZXM6IFByb21pc2U8dW5rbm93bj5bXSA9IFtdO1xuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNQcm9taXNlcyA9IE9iamVjdC5rZXlzKHNpZGVFZmZlY3RzTWFwKVxuXHRcdFx0XHQuZmlsdGVyKChzaWRlRWZmZWN0c05hbWUpID0+IHNpZGVFZmZlY3RzTWFwW3NpZGVFZmZlY3RzTmFtZV0uaW1tZWRpYXRlID09PSB0cnVlKVxuXHRcdFx0XHQubWFwKChzaWRlRWZmZWN0c05hbWUpID0+IHtcblx0XHRcdFx0XHRjb25zdCBzaWRlRWZmZWN0c1Byb3BlcnRpZXMgPSBzaWRlRWZmZWN0c01hcFtzaWRlRWZmZWN0c05hbWVdO1xuXHRcdFx0XHRcdC8vIGlmIHRoaXMgU2lkZUVmZmVjdHMgaXMgcmVjb3JkZWQgYXMgZmFpbGVkIFNpZGVFZmZlY3RzLCBuZWVkIHRvIHJlbW92ZSBpdC5cblx0XHRcdFx0XHR0aGlzLnVucmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0cyhzaWRlRWZmZWN0c1Byb3BlcnRpZXMuc2lkZUVmZmVjdHMuZnVsbHlRdWFsaWZpZWROYW1lLCBzaWRlRWZmZWN0c1Byb3BlcnRpZXMuY29udGV4dCk7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMucmVxdWVzdFNpZGVFZmZlY3RzKHNpZGVFZmZlY3RzUHJvcGVydGllcy5zaWRlRWZmZWN0cywgc2lkZUVmZmVjdHNQcm9wZXJ0aWVzLmNvbnRleHQpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0Ly9SZXBsYXkgZmFpbGVkIFNpZGVFZmZlY3RzIHJlbGF0ZWQgdG8gdGhlIHZpZXcgb3IgRmllbGRcblx0XHRcdGZvciAoY29uc3QgY29udGV4dCBvZiBbZmllbGQuZ2V0QmluZGluZ0NvbnRleHQoKSwgdGhpcy5fdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpXSkge1xuXHRcdFx0XHRpZiAoY29udGV4dCkge1xuXHRcdFx0XHRcdGNvbnN0IGNvbnRleHRQYXRoID0gY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRcdFx0Y29uc3QgZmFpbGVkU2lkZUVmZmVjdHMgPSB0aGlzLl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHNbY29udGV4dFBhdGhdID8/IFtdO1xuXHRcdFx0XHRcdHRoaXMudW5yZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzRm9yQUNvbnRleHQoY29udGV4dFBhdGgpO1xuXHRcdFx0XHRcdGZvciAoY29uc3QgZmFpbGVkU2lkZUVmZmVjdCBvZiBmYWlsZWRTaWRlRWZmZWN0cykge1xuXHRcdFx0XHRcdFx0ZmFpbGVkU2lkZUVmZmVjdHNQcm9taXNlcy5wdXNoKHRoaXMucmVxdWVzdFNpZGVFZmZlY3RzKGZhaWxlZFNpZGVFZmZlY3QsIGNvbnRleHQgYXMgQ29udGV4dCkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbChzaWRlRWZmZWN0c1Byb21pc2VzLmNvbmNhdChmYWlsZWRTaWRlRWZmZWN0c1Byb21pc2VzKSk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0TG9nLmRlYnVnKGBFcnJvciB3aGlsZSBtYW5hZ2luZyBGaWVsZCBTaWRlRWZmZWN0c2AsIGUgYXMgc3RyaW5nKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgdGhlIFNpZGVFZmZlY3RzIGZvciBhIGZpZWxkR3JvdXAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfcmVxdWVzdEZpZWxkR3JvdXBTaWRlRWZmZWN0c1xuXHQgKiBAcGFyYW0gZmllbGRHcm91cFNpZGVFZmZlY3RzIEZpZWxkIGdyb3VwIHNpZGVFZmZlY3RzIHdpdGggaXRzIHByb21pc2Vcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXR1cm5pbmcgdHJ1ZSBpZiB0aGUgU2lkZUVmZmVjdHMgaGF2ZSBiZWVuIHN1Y2Nlc3NmdWxseSBleGVjdXRlZFxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBfcmVxdWVzdEZpZWxkR3JvdXBTaWRlRWZmZWN0cyhmaWVsZEdyb3VwU2lkZUVmZmVjdHM6IEZpZWxkR3JvdXBTaWRlRWZmZWN0VHlwZSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRoaXMudW5yZWdpc3RlckZpZWxkR3JvdXBTaWRlRWZmZWN0cyhmaWVsZEdyb3VwU2lkZUVmZmVjdHMuc2lkZUVmZmVjdFByb3BlcnR5KTtcblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgZmllbGRHcm91cFNpZGVFZmZlY3RzLnByb21pc2U7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0TG9nLmRlYnVnKGBFcnJvciB3aGlsZSBwcm9jZXNzaW5nIEZpZWxkR3JvdXAgU2lkZUVmZmVjdHNgLCBlIGFzIHN0cmluZyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCB7IHNpZGVFZmZlY3RzLCBjb250ZXh0LCBuYW1lIH0gPSBmaWVsZEdyb3VwU2lkZUVmZmVjdHMuc2lkZUVmZmVjdFByb3BlcnR5O1xuXHRcdFx0aWYgKHRoaXMuaXNGaWVsZEdyb3VwVmFsaWQobmFtZSwgY29udGV4dCkpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5yZXF1ZXN0U2lkZUVmZmVjdHMoc2lkZUVmZmVjdHMsIGNvbnRleHQpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdExvZy5kZWJ1ZyhgRXJyb3Igd2hpbGUgZXhlY3V0aW5nIEZpZWxkR3JvdXAgU2lkZUVmZmVjdHNgLCBlIGFzIHN0cmluZyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNhdmVzIHRoZSB2YWxpZGF0aW9uIHN0YXR1cyBvZiBwcm9wZXJ0aWVzIHJlbGF0ZWQgdG8gYSBmaWVsZCBjb250cm9sLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmllbGQgVGhlIGZpZWxkIGNvbnRyb2xcblx0ICogQHBhcmFtIHN1Y2Nlc3MgU3RhdHVzIG9mIHRoZSBmaWVsZCB2YWxpZGF0aW9uXG5cdCAqL1xuXHRwcml2YXRlIF9zYXZlRmllbGRQcm9wZXJ0aWVzU3RhdHVzKGZpZWxkOiBDb250cm9sLCBzdWNjZXNzOiBib29sZWFuKTogdm9pZCB7XG5cdFx0Y29uc3Qgc2lkZUVmZmVjdHNNYXAgPSB0aGlzLmdldEZpZWxkU2lkZUVmZmVjdHNNYXAoZmllbGQpO1xuXHRcdE9iamVjdC5rZXlzKHNpZGVFZmZlY3RzTWFwKS5mb3JFYWNoKChrZXkpID0+IHtcblx0XHRcdGNvbnN0IHsgbmFtZSwgaW1tZWRpYXRlLCBjb250ZXh0IH0gPSBzaWRlRWZmZWN0c01hcFtrZXldO1xuXHRcdFx0aWYgKCFpbW1lZGlhdGUpIHtcblx0XHRcdFx0Y29uc3QgaWQgPSB0aGlzLl9nZXRGaWVsZEdyb3VwSW5kZXgobmFtZSwgY29udGV4dCk7XG5cdFx0XHRcdGlmIChzdWNjZXNzKSB7XG5cdFx0XHRcdFx0ZGVsZXRlIHRoaXMuX2ZpZWxkR3JvdXBJbnZhbGlkaXR5W2lkXT8uW2ZpZWxkLmdldElkKCldO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuX2ZpZWxkR3JvdXBJbnZhbGlkaXR5W2lkXSA9IHtcblx0XHRcdFx0XHRcdC4uLnRoaXMuX2ZpZWxkR3JvdXBJbnZhbGlkaXR5W2lkXSxcblx0XHRcdFx0XHRcdC4uLnsgW2ZpZWxkLmdldElkKCldOiB0cnVlIH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2lkZUVmZmVjdHNDb250cm9sbGVyRXh0ZW5zaW9uO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O0VBeUNBLE1BQU1BLGlCQUFpQixHQUFHLG9CQUFvQjtFQUFDLElBRXpDQyw4QkFBOEIsV0FEbkNDLGNBQWMsQ0FBQyw4Q0FBOEMsQ0FBQyxVQWM3REMsY0FBYyxFQUFFLFVBaUJoQkMsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsVUFZaEJELGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBbUJoQkQsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsVUFtQ2hCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQWtEaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBNkJoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0FjaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBY2hCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQXNCaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBb0NoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0E2QmhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQThCaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBY2hCQyxnQkFBZ0IsRUFBRSxXQUNsQkQsY0FBYyxFQUFFLFdBbUJoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0FhaEJDLGdCQUFnQixFQUFFLFdBQ2xCRCxjQUFjLEVBQUUsV0Ft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