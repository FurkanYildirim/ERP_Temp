/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/PropertyHelper", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "../templating/DataModelPathHelper"], function (Log, MetaModelConverter, TypeGuards, PropertyHelper, Service, ServiceFactory, DataModelPathHelper) {
  "use strict";

  var _exports = {};
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getTargetNavigationPath = DataModelPathHelper.getTargetNavigationPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var getAssociatedTextPropertyPath = PropertyHelper.getAssociatedTextPropertyPath;
  var isProperty = TypeGuards.isProperty;
  var isEntityType = TypeGuards.isEntityType;
  var isComplexType = TypeGuards.isComplexType;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var convertTypes = MetaModelConverter.convertTypes;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let SideEffectsService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(SideEffectsService, _Service);
    function SideEffectsService() {
      return _Service.apply(this, arguments) || this;
    }
    _exports.SideEffectsService = SideEffectsService;
    var _proto = SideEffectsService.prototype;
    // !: means that we know it will be assigned before usage
    _proto.init = function init() {
      this.sideEffectsRegistry = {
        oData: {
          entities: {},
          actions: {}
        },
        control: {}
      };
      this.isInitialized = false;
      this.initPromise = Promise.resolve(this);
    }

    /**
     * Adds a SideEffects control
     * SideEffects definition is added by a control to keep data up to date
     * These SideEffects get limited scope compared with SideEffects coming from an OData service:
     * - Only one SideEffects definition can be defined for the combination entity type - control Id
     * - Only SideEffects source properties are recognized and used to trigger SideEffects
     *
     * Ensure the sourceControlId matches the associated SAPUI5 control ID.
     *
     * @ui5-restricted
     * @param entityType Name of the entity type
     * @param sideEffect SideEffects definition
     */;
    _proto.addControlSideEffects = function addControlSideEffects(entityType, sideEffect) {
      if (sideEffect.sourceControlId) {
        const controlSideEffect = {
          ...sideEffect,
          fullyQualifiedName: `${entityType}/SideEffectsForControl/${sideEffect.sourceControlId}`
        };
        const entityControlSideEffects = this.sideEffectsRegistry.control[entityType] || {};
        entityControlSideEffects[controlSideEffect.sourceControlId] = controlSideEffect;
        this.sideEffectsRegistry.control[entityType] = entityControlSideEffects;
      }
    }

    /**
     * Executes SideEffects action.
     *
     * @ui5-restricted
     * @param triggerAction Name of the action
     * @param context Context
     * @param groupId The group ID to be used for the request
     * @returns A promise that is resolved without data or with a return value context when the action call succeeded
     */;
    _proto.executeAction = function executeAction(triggerAction, context, groupId) {
      const action = context.getModel().bindContext(`${triggerAction}(...)`, context);
      return action.execute(groupId || context.getBinding().getUpdateGroupId());
    }

    /**
     * Gets converted OData metaModel.
     *
     * @ui5-restricted
     * @returns Converted OData metaModel
     */;
    _proto.getConvertedMetaModel = function getConvertedMetaModel() {
      return convertTypes(this.getMetaModel(), this.capabilities);
    }

    /**
     * Gets the entity type of a context.
     *
     * @param context Context
     * @returns Entity Type
     */;
    _proto.getEntityTypeFromContext = function getEntityTypeFromContext(context) {
      const metaModel = context.getModel().getMetaModel(),
        metaPath = metaModel.getMetaPath(context.getPath()),
        entityType = metaModel.getObject(metaPath)["$Type"];
      return entityType;
    }

    /**
     * Gets the SideEffects that come from an OData service.
     *
     * @ui5-restricted
     * @param entityTypeName Name of the entity type
     * @returns SideEffects dictionary
     */;
    _proto.getODataEntitySideEffects = function getODataEntitySideEffects(entityTypeName) {
      return this.sideEffectsRegistry.oData.entities[entityTypeName] || {};
    }

    /**
     * Gets the global SideEffects that come from an OData service.
     *
     * @ui5-restricted
     * @param entityTypeName Name of the entity type
     * @returns Global SideEffects
     */;
    _proto.getGlobalODataEntitySideEffects = function getGlobalODataEntitySideEffects(entityTypeName) {
      const entitySideEffects = this.getODataEntitySideEffects(entityTypeName);
      const globalSideEffects = [];
      for (const key in entitySideEffects) {
        const sideEffects = entitySideEffects[key];
        if (!sideEffects.sourceEntities && !sideEffects.sourceProperties) {
          globalSideEffects.push(sideEffects);
        }
      }
      return globalSideEffects;
    }

    /**
     * Gets the SideEffects that come from an OData service.
     *
     * @ui5-restricted
     * @param actionName Name of the action
     * @param context Context
     * @returns SideEffects definition
     */;
    _proto.getODataActionSideEffects = function getODataActionSideEffects(actionName, context) {
      if (context) {
        const entityType = this.getEntityTypeFromContext(context);
        if (entityType) {
          var _this$sideEffectsRegi;
          return (_this$sideEffectsRegi = this.sideEffectsRegistry.oData.actions[entityType]) === null || _this$sideEffectsRegi === void 0 ? void 0 : _this$sideEffectsRegi[actionName];
        }
      }
      return undefined;
    }

    /**
     * Generates the dictionary for the SideEffects.
     *
     * @ui5-restricted
     * @param capabilities The current capabilities
     */;
    _proto.initializeSideEffects = function initializeSideEffects(capabilities) {
      this.capabilities = capabilities;
      if (!this.isInitialized) {
        const sideEffectSources = {
          entities: {},
          properties: {}
        };
        const convertedMetaModel = this.getConvertedMetaModel();
        convertedMetaModel.entityTypes.forEach(entityType => {
          this.sideEffectsRegistry.oData.entities[entityType.fullyQualifiedName] = this.retrieveODataEntitySideEffects(entityType);
          this.sideEffectsRegistry.oData.actions[entityType.fullyQualifiedName] = this.retrieveODataActionsSideEffects(entityType); // only bound actions are analyzed since unbound ones don't get SideEffects
          this.mapSideEffectSources(entityType, sideEffectSources);
        });
        this.sourcesToSideEffectMappings = sideEffectSources;
        this.isInitialized = true;
      }
    }

    /**
     * Removes all SideEffects related to a control.
     *
     * @ui5-restricted
     * @param controlId Control Id
     */;
    _proto.removeControlSideEffects = function removeControlSideEffects(controlId) {
      Object.keys(this.sideEffectsRegistry.control).forEach(sEntityType => {
        if (this.sideEffectsRegistry.control[sEntityType][controlId]) {
          delete this.sideEffectsRegistry.control[sEntityType][controlId];
        }
      });
    }

    /**
     * Requests the SideEffects on a specific context.
     *
     * @param pathExpressions Targets of SideEffects to be executed
     * @param context Context where SideEffects need to be executed
     * @param groupId The group ID to be used for the request
     * @returns Promise on SideEffects request
     */;
    _proto.requestSideEffects = function requestSideEffects(pathExpressions, context, groupId) {
      this.logRequest(pathExpressions, context);
      return context.requestSideEffects(pathExpressions, groupId);
    }

    /**
     * Requests the SideEffects for an OData action.
     *
     * @param sideEffects SideEffects definition
     * @param context Context where SideEffects need to be executed
     * @returns Promise on SideEffects requests and action execution
     */;
    _proto.requestSideEffectsForODataAction = function requestSideEffectsForODataAction(sideEffects, context) {
      var _sideEffects$triggerA, _sideEffects$pathExpr;
      let promises;
      if ((_sideEffects$triggerA = sideEffects.triggerActions) !== null && _sideEffects$triggerA !== void 0 && _sideEffects$triggerA.length) {
        promises = sideEffects.triggerActions.map(actionName => {
          return this.executeAction(actionName, context);
        });
      } else {
        promises = [];
      }
      if ((_sideEffects$pathExpr = sideEffects.pathExpressions) !== null && _sideEffects$pathExpr !== void 0 && _sideEffects$pathExpr.length) {
        promises.push(this.requestSideEffects(sideEffects.pathExpressions, context));
      }
      return promises.length ? Promise.all(promises) : Promise.resolve([]);
    }

    /**
     * Requests the SideEffects for a navigation property on a specific context.
     *
     * @function
     * @param navigationProperty Navigation property
     * @param context Context where SideEffects need to be executed
     * @param groupId Batch group for the query
     * @returns SideEffects request on SAPUI5 context
     */;
    _proto.requestSideEffectsForNavigationProperty = function requestSideEffectsForNavigationProperty(navigationProperty, context, groupId) {
      const baseEntityType = this.getEntityTypeFromContext(context);
      if (baseEntityType) {
        const navigationPath = `${navigationProperty}/`;
        const entitySideEffects = this.getODataEntitySideEffects(baseEntityType);
        let targetProperties = [];
        let targetEntities = [];
        let sideEffectsTargets = [];
        Object.keys(entitySideEffects).filter(
        // Keep relevant SideEffects
        // 1. SourceEntities match OR
        // 2. Only 1 SourceProperties and match
        annotationName => {
          var _sideEffects$sourcePr;
          const sideEffects = entitySideEffects[annotationName];
          return (sideEffects.sourceEntities || []).some(navigation => navigation.$NavigationPropertyPath === navigationProperty) || ((_sideEffects$sourcePr = sideEffects.sourceProperties) === null || _sideEffects$sourcePr === void 0 ? void 0 : _sideEffects$sourcePr.length) === 1 && sideEffects.sourceProperties.some(propertyPath => propertyPath.startsWith(navigationPath) && propertyPath.replace(navigationPath, "").indexOf("/") === -1);
        }).forEach(sAnnotationName => {
          const sideEffects = entitySideEffects[sAnnotationName];
          if (sideEffects.triggerAction) {
            this.executeAction(sideEffects.triggerAction, context, groupId);
          }
          targetProperties = targetProperties.concat(sideEffects.targetProperties);
          targetEntities = targetEntities.concat(sideEffects.targetEntities);
        });
        // Remove duplicate targets
        const sideEffectsTargetDefinition = this.removeDuplicateTargets({
          targetProperties: targetProperties,
          targetEntities: targetEntities
        });
        sideEffectsTargets = [...sideEffectsTargetDefinition.targetProperties, ...sideEffectsTargetDefinition.targetEntities];
        if (sideEffectsTargets.length) {
          return this.requestSideEffects(sideEffectsTargets, context, groupId).catch(error => Log.error(`SideEffects - Error while processing SideEffects for Navigation Property ${navigationProperty}`, error));
        }
      }
      return Promise.resolve();
    }

    /**
     * Gets the SideEffects that come from controls.
     *
     * @ui5-restricted
     * @param entityTypeName Entity type Name
     * @returns SideEffects dictionary
     */;
    _proto.getControlEntitySideEffects = function getControlEntitySideEffects(entityTypeName) {
      return this.sideEffectsRegistry.control[entityTypeName] || {};
    }

    /**
     * Gets SideEffects' qualifier and owner entity where this entity is used as source.
     *
     * @param entityTypeName Entity type fully qualified name
     * @returns Array of sideEffects info
     */;
    _proto.getSideEffectWhereEntityIsSource = function getSideEffectWhereEntityIsSource(entityTypeName) {
      return this.sourcesToSideEffectMappings.entities[entityTypeName] || [];
    }

    /**
     * Common method to get the field groupIds for a source entity and a source property.
     *
     * @param sourceEntityType
     * @param sourceProperty
     * @returns A collection of fieldGroupIds
     */;
    _proto.computeFieldGroupIds = function computeFieldGroupIds(sourceEntityType, sourceProperty) {
      const entityFieldGroupIds = this.getSideEffectWhereEntityIsSource(sourceEntityType).map(sideEffectInfo => this.getFieldGroupIdForSideEffect(sideEffectInfo, true));
      return entityFieldGroupIds.concat(this.getSideEffectWherePropertyIsSource(sourceProperty).map(sideEffectInfo => this.getFieldGroupIdForSideEffect(sideEffectInfo)));
    }

    /**
     * Gets SideEffects' qualifier and owner entity where this property is used as source.
     *
     * @param propertyName Property fully qualified name
     * @returns Array of sideEffects info
     */;
    _proto.getSideEffectWherePropertyIsSource = function getSideEffectWherePropertyIsSource(propertyName) {
      return this.sourcesToSideEffectMappings.properties[propertyName] || [];
    }

    /**
     * Adds the text properties required for SideEffects
     * If a property has an associated text then this text needs to be added as targetProperties.
     *
     * @ui5-restricted
     * @param sideEffectsTargets SideEffects Targets
     * @param entityType Entity type
     * @returns SideEffects definition with added text properties
     */;
    _proto.addTextProperties = function addTextProperties(sideEffectsTargets, entityType) {
      const setOfProperties = new Set(sideEffectsTargets.targetProperties);
      const setOfEntities = new Set(sideEffectsTargets.targetEntities.map(target => target.$NavigationPropertyPath));

      // Generate all dataModelPath for the properties to analyze (cover "*" and /*)
      const propertiesToAnalyze = sideEffectsTargets.targetProperties.reduce((dataModelPropertyPaths, propertyPath) => {
        return dataModelPropertyPaths.concat(this.getDataModelPropertiesFromAPath(propertyPath, entityType));
      }, []);

      // Generate all paths related to the text properties and not already covered by the SideEffects
      for (const dataModelPropertyPath of propertiesToAnalyze) {
        const associatedTextPath = getAssociatedTextPropertyPath(dataModelPropertyPath.targetObject);
        if (associatedTextPath) {
          const dataModelTextPath = enhanceDataModelPath(dataModelPropertyPath, associatedTextPath);
          const relativeNavigation = getTargetNavigationPath(dataModelTextPath, true);
          const targetPath = getTargetObjectPath(dataModelTextPath, true);
          if (isProperty(dataModelTextPath.targetObject) && !setOfProperties.has(targetPath) &&
          // the property is already listed
          !setOfProperties.has(`${relativeNavigation}${dataModelTextPath.navigationProperties.length ? "/" : ""}*`) &&
          // the property is already listed thanks to the "*"
          !setOfEntities.has(`${relativeNavigation}`) // the property is not part of a TargetEntities
          ) {
            // The Text association is added as TargetEntities if
            //  - it's contained on a different entitySet than the SideEffects
            //  -  and it's contained on a different entitySet than the sourced property
            // Otherwise it's added as targetProperties
            if (dataModelPropertyPath.targetEntitySet !== dataModelTextPath.targetEntitySet && dataModelTextPath.navigationProperties && dataModelTextPath.targetEntityType) {
              setOfEntities.add(relativeNavigation);
            } else {
              setOfProperties.add(targetPath);
            }
          }
        }
      }
      return {
        targetProperties: Array.from(setOfProperties),
        targetEntities: Array.from(setOfEntities).map(navigation => {
          return {
            $NavigationPropertyPath: navigation
          };
        })
      };
    }

    /**
     * Converts the SideEffects to expected format
     *  - Set TriggerAction as string
     *  - Converts SideEffects targets to expected format
     *  - Removes binding parameter from SideEffects targets properties
     *  - Adds the text properties
     *  - Replaces TargetProperties having reference to Source Properties for a SideEffects.
     *
     * @ui5-restricted
     * @param sideEffects SideEffects definition
     * @param entityType Entity type
     * @param bindingParameter Name of the binding parameter
     * @returns SideEffects definition
     */;
    _proto.convertSideEffects = function convertSideEffects(sideEffects, entityType, bindingParameter) {
      const triggerAction = sideEffects.TriggerAction;
      const newSideEffects = this.convertSideEffectsFormat(sideEffects);
      let sideEffectsTargets = {
        targetProperties: newSideEffects.targetProperties,
        targetEntities: newSideEffects.targetEntities
      };
      sideEffectsTargets = this.removeBindingParameter(sideEffectsTargets, bindingParameter);
      sideEffectsTargets = this.addTextProperties(sideEffectsTargets, entityType);
      sideEffectsTargets = this.removeDuplicateTargets(sideEffectsTargets);
      return {
        ...newSideEffects,
        ...{
          targetEntities: sideEffectsTargets.targetEntities,
          targetProperties: sideEffectsTargets.targetProperties,
          triggerAction
        }
      };
    }

    /**
     * Converts the SideEffects targets (TargetEntities and TargetProperties) to expected format
     *  - TargetProperties as array of string
     *  - TargetEntities as array of object with property $NavigationPropertyPath.
     *
     * @ui5-restricted
     * @param sideEffects SideEffects definition
     * @returns Converted SideEffects
     */;
    _proto.convertSideEffectsFormat = function convertSideEffectsFormat(sideEffects) {
      const formatProperties = properties => {
        return properties ? properties.reduce((targetProperties, target) => {
          const path = target.type && target.value || target;
          if (path) {
            targetProperties.push(path);
          } else {
            Log.error(`SideEffects - Error while processing TargetProperties for SideEffects ${sideEffects.fullyQualifiedName}`);
          }
          return targetProperties;
        }, []) : properties;
      };
      const formatEntities = entities => {
        return entities ? entities.map(targetEntity => {
          return {
            $NavigationPropertyPath: targetEntity.value
          };
        }) : entities;
      };
      return {
        fullyQualifiedName: sideEffects.fullyQualifiedName,
        sourceProperties: formatProperties(sideEffects.SourceProperties),
        sourceEntities: formatEntities(sideEffects.SourceEntities),
        targetProperties: formatProperties(sideEffects.TargetProperties) ?? [],
        targetEntities: formatEntities(sideEffects.TargetEntities) ?? []
      };
    }

    /**
     * Gets all dataModelObjectPath related to properties listed by a path
     *
     * The path can be:
     *  - a path targeting a property on a complexType or an EntityType
     *  - a path with a star targeting all properties on a complexType or an EntityType.
     *
     * @ui5-restricted
     * @param path The path to analyze
     * @param entityType Entity type
     * @returns Array of dataModelObjectPath representing the properties
     */;
    _proto.getDataModelPropertiesFromAPath = function getDataModelPropertiesFromAPath(path, entityType) {
      let dataModelObjectPaths = [];
      const convertedMetaModel = this.getConvertedMetaModel();
      const entitySet = convertedMetaModel.entitySets.find(relatedEntitySet => relatedEntitySet.entityType === entityType) || convertedMetaModel.singletons.find(singleton => singleton.entityType === entityType);
      if (entitySet) {
        const metaModel = this.getMetaModel(),
          entitySetContext = metaModel.createBindingContext(`/${entitySet.name}`);
        if (entitySetContext) {
          const dataModelEntitySet = getInvolvedDataModelObjects(entitySetContext);
          const dataModelObjectPath = enhanceDataModelPath(dataModelEntitySet, path.replace("*", "") || "/"),
            // "*" is replaced by "/" to target the current EntityType
            targetObject = dataModelObjectPath.targetObject;
          if (isProperty(targetObject)) {
            if (isComplexType(targetObject.targetType)) {
              dataModelObjectPaths = dataModelObjectPaths.concat(targetObject.targetType.properties.map(property => enhanceDataModelPath(dataModelObjectPath, property.name)));
            } else {
              dataModelObjectPaths.push(dataModelObjectPath);
            }
          } else if (isEntityType(targetObject)) {
            dataModelObjectPaths = dataModelObjectPaths.concat(dataModelObjectPath.targetEntityType.entityProperties.map(entityProperty => {
              return enhanceDataModelPath(dataModelObjectPath, entityProperty.name);
            }));
          }
          entitySetContext.destroy();
        }
      }
      return dataModelObjectPaths.filter(dataModelObjectPath => dataModelObjectPath.targetObject);
    }

    /**
     * Gets the Odata metamodel.
     *
     * @ui5-restricted
     * @returns The OData metamodel
     */;
    _proto.getMetaModel = function getMetaModel() {
      const oContext = this.getContext();
      const oComponent = oContext.scopeObject;
      return oComponent.getModel().getMetaModel();
    }

    /**
     * Gets the SideEffects related to an entity type or action that come from an OData Service
     * Internal routine to get, from converted oData metaModel, SideEffects related to a specific entity type or action
     * and to convert these SideEffects with expected format.
     *
     * @ui5-restricted
     * @param source Entity type or action
     * @returns Array of SideEffects
     */;
    _proto.getSideEffectsFromSource = function getSideEffectsFromSource(source) {
      var _source$annotations;
      let bindingAlias = "";
      const isSourceEntityType = isEntityType(source);
      const entityType = isSourceEntityType ? source : source.sourceEntityType;
      const commonAnnotation = (_source$annotations = source.annotations) === null || _source$annotations === void 0 ? void 0 : _source$annotations.Common;
      if (entityType && commonAnnotation) {
        if (!isSourceEntityType) {
          var _source$parameters;
          const bindingParameter = (_source$parameters = source.parameters) === null || _source$parameters === void 0 ? void 0 : _source$parameters.find(parameter => parameter.type === entityType.fullyQualifiedName);
          bindingAlias = (bindingParameter === null || bindingParameter === void 0 ? void 0 : bindingParameter.fullyQualifiedName.split("/")[1]) ?? "";
        }
        return this.getSideEffectsAnnotationFromSource(source).map(sideEffectAnno => this.convertSideEffects(sideEffectAnno, entityType, bindingAlias));
      }
      return [];
    }
    /**
     * Gets the SideEffects related to an entity type or action that come from an OData Service
     * Internal routine to get, from converted oData metaModel, SideEffects related to a specific entity type or action.
     *
     * @param source Entity type or action
     * @returns Array of SideEffects
     */;
    _proto.getSideEffectsAnnotationFromSource = function getSideEffectsAnnotationFromSource(source) {
      var _source$annotations2;
      const sideEffects = [];
      const commonAnnotation = (_source$annotations2 = source.annotations) === null || _source$annotations2 === void 0 ? void 0 : _source$annotations2.Common;
      for (const key in commonAnnotation) {
        const annotation = commonAnnotation[key];
        if (this.isSideEffectsAnnotation(annotation)) {
          sideEffects.push(annotation);
        }
      }
      return sideEffects;
    }

    /**
     * Checks if the annotation is a SideEffects annotation.
     *
     * @ui5-restricted
     * @param annotation Annotation
     * @returns Boolean
     */;
    _proto.isSideEffectsAnnotation = function isSideEffectsAnnotation(annotation) {
      return (annotation === null || annotation === void 0 ? void 0 : annotation.$Type) === "com.sap.vocabularies.Common.v1.SideEffectsType";
    }

    /**
     * Logs the SideEffects request.
     *
     * @ui5-restricted
     * @param pathExpressions SideEffects targets
     * @param context Context
     */;
    _proto.logRequest = function logRequest(pathExpressions, context) {
      const targetPaths = pathExpressions.reduce(function (paths, target) {
        return `${paths}\n\t\t${target.$NavigationPropertyPath || target || ""}`;
      }, "");
      Log.debug(`SideEffects - Request:\n\tContext path : ${context.getPath()}\n\tProperty paths :${targetPaths}`);
    }

    /**
     * Removes the name of the binding parameter on the SideEffects targets.
     *
     * @ui5-restricted
     * @param sideEffectsTargets SideEffects Targets
     * @param bindingParameterName Name of binding parameter
     * @returns SideEffects definition
     */;
    _proto.removeBindingParameter = function removeBindingParameter(sideEffectsTargets, bindingParameterName) {
      if (bindingParameterName) {
        const replaceBindingParameter = function (value) {
          return value.replace(new RegExp(`^${bindingParameterName}/?`), "");
        };
        return {
          targetProperties: sideEffectsTargets.targetProperties.map(targetProperty => replaceBindingParameter(targetProperty)),
          targetEntities: sideEffectsTargets.targetEntities.map(targetEntity => {
            return {
              $NavigationPropertyPath: replaceBindingParameter(targetEntity.$NavigationPropertyPath)
            };
          })
        };
      }
      return {
        targetProperties: sideEffectsTargets.targetProperties,
        targetEntities: sideEffectsTargets.targetEntities
      };
    }

    /**
     * Remove duplicates in SideEffects targets.
     *
     * @ui5-restricted
     * @param sideEffectsTargets SideEffects Targets
     * @returns SideEffects targets without duplicates
     */;
    _proto.removeDuplicateTargets = function removeDuplicateTargets(sideEffectsTargets) {
      const targetEntitiesPaths = sideEffectsTargets.targetEntities.map(targetEntity => targetEntity.$NavigationPropertyPath);
      const uniqueTargetedEntitiesPath = new Set(targetEntitiesPaths);
      const uniqueTargetProperties = new Set(sideEffectsTargets.targetProperties);
      const uniqueTargetedEntities = Array.from(uniqueTargetedEntitiesPath).map(entityPath => {
        return {
          $NavigationPropertyPath: entityPath
        };
      });
      return {
        targetProperties: Array.from(uniqueTargetProperties),
        targetEntities: uniqueTargetedEntities
      };
    }

    /**
     * Gets SideEffects action type that come from an OData Service
     * Internal routine to get, from converted oData metaModel, SideEffects on actions
     * related to a specific entity type and to convert these SideEffects with
     * expected format.
     *
     * @ui5-restricted
     * @param entityType Entity type
     * @returns Entity type SideEffects dictionary
     */;
    _proto.retrieveODataActionsSideEffects = function retrieveODataActionsSideEffects(entityType) {
      const sideEffects = {};
      const actions = entityType.actions;
      if (actions) {
        Object.keys(actions).forEach(actionName => {
          const action = entityType.actions[actionName];
          const triggerActions = new Set();
          let targetProperties = [];
          let targetEntities = [];
          this.getSideEffectsFromSource(action).forEach(oDataSideEffect => {
            const triggerAction = oDataSideEffect.triggerAction;
            targetProperties = targetProperties.concat(oDataSideEffect.targetProperties);
            targetEntities = targetEntities.concat(oDataSideEffect.targetEntities);
            if (triggerAction) {
              triggerActions.add(triggerAction);
            }
          });
          const sideEffectsTargets = this.removeDuplicateTargets({
            targetProperties,
            targetEntities
          });
          sideEffects[actionName] = {
            pathExpressions: [...sideEffectsTargets.targetProperties, ...sideEffectsTargets.targetEntities],
            triggerActions: Array.from(triggerActions)
          };
        });
      }
      return sideEffects;
    }

    /**
     * Gets SideEffects entity type that come from an OData Service
     * Internal routine to get, from converted oData metaModel, SideEffects
     * related to a specific entity type and to convert these SideEffects with
     * expected format.
     *
     * @ui5-restricted
     * @param entityType Entity type
     * @returns Entity type SideEffects dictionary
     */;
    _proto.retrieveODataEntitySideEffects = function retrieveODataEntitySideEffects(entityType) {
      const entitySideEffects = {};
      this.getSideEffectsFromSource(entityType).forEach(sideEffects => {
        entitySideEffects[sideEffects.fullyQualifiedName] = sideEffects;
      });
      return entitySideEffects;
    }

    /**
     * Defines a map for the Sources of sideEffect on the entity to track where those sources are used in SideEffects annotation.
     *
     * @param entityType The entityType we look for side Effects annotation
     * @param sideEffectsSources The mapping object in construction
     * @param sideEffectsSources.entities
     * @param sideEffectsSources.properties
     */;
    _proto.mapSideEffectSources = function mapSideEffectSources(entityType, sideEffectsSources) {
      for (const sideEffectDefinition of this.getSideEffectsAnnotationFromSource(entityType)) {
        var _sideEffectDefinition;
        for (const sourceEntity of sideEffectDefinition.SourceEntities ?? []) {
          var _sourceEntity$$target;
          const targetEntityType = sourceEntity.value ? (_sourceEntity$$target = sourceEntity.$target) === null || _sourceEntity$$target === void 0 ? void 0 : _sourceEntity$$target.targetType : entityType;
          if (targetEntityType) {
            if (!sideEffectsSources.entities[targetEntityType.fullyQualifiedName]) {
              sideEffectsSources.entities[targetEntityType.fullyQualifiedName] = [];
            }
            sideEffectsSources.entities[targetEntityType.fullyQualifiedName].push({
              entity: entityType.fullyQualifiedName,
              qualifier: sideEffectDefinition.qualifier
            });
          }
        }
        const hasUniqueSourceProperty = ((_sideEffectDefinition = sideEffectDefinition.SourceProperties) === null || _sideEffectDefinition === void 0 ? void 0 : _sideEffectDefinition.length) === 1;
        for (const sourceProperty of sideEffectDefinition.SourceProperties ?? []) {
          var _sourceProperty$$targ, _sourceProperty$$targ3;
          if (!sideEffectsSources.properties[(_sourceProperty$$targ = sourceProperty.$target) === null || _sourceProperty$$targ === void 0 ? void 0 : _sourceProperty$$targ.fullyQualifiedName]) {
            var _sourceProperty$$targ2;
            sideEffectsSources.properties[(_sourceProperty$$targ2 = sourceProperty.$target) === null || _sourceProperty$$targ2 === void 0 ? void 0 : _sourceProperty$$targ2.fullyQualifiedName] = [];
          }
          sideEffectsSources.properties[(_sourceProperty$$targ3 = sourceProperty.$target) === null || _sourceProperty$$targ3 === void 0 ? void 0 : _sourceProperty$$targ3.fullyQualifiedName].push({
            entity: entityType.fullyQualifiedName,
            qualifier: sideEffectDefinition.qualifier,
            hasUniqueSourceProperty
          });
        }
      }
    }

    /**
     * Get the fieldGroupId based on the stored information on th side effect.
     *
     * @param sideEffectInfo
     * @param isImmediate
     * @returns A string for the fieldGroupId.
     */;
    _proto.getFieldGroupIdForSideEffect = function getFieldGroupIdForSideEffect(sideEffectInfo) {
      let isImmediate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      const sideEffectWithQualifier = sideEffectInfo.qualifier ? `${sideEffectInfo.entity}#${sideEffectInfo.qualifier}` : sideEffectInfo.entity;
      return isImmediate || sideEffectInfo.hasUniqueSourceProperty === true ? `${sideEffectWithQualifier}$$ImmediateRequest` : sideEffectWithQualifier;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return SideEffectsService;
  }(Service);
  _exports.SideEffectsService = SideEffectsService;
  let SideEffectsServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(SideEffectsServiceFactory, _ServiceFactory);
    function SideEffectsServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto2 = SideEffectsServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      const SideEffectsServiceService = new SideEffectsService(oServiceContext);
      return SideEffectsServiceService.initPromise;
    };
    return SideEffectsServiceFactory;
  }(ServiceFactory);
  return SideEffectsServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaWRlRWZmZWN0c1NlcnZpY2UiLCJpbml0Iiwic2lkZUVmZmVjdHNSZWdpc3RyeSIsIm9EYXRhIiwiZW50aXRpZXMiLCJhY3Rpb25zIiwiY29udHJvbCIsImlzSW5pdGlhbGl6ZWQiLCJpbml0UHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiYWRkQ29udHJvbFNpZGVFZmZlY3RzIiwiZW50aXR5VHlwZSIsInNpZGVFZmZlY3QiLCJzb3VyY2VDb250cm9sSWQiLCJjb250cm9sU2lkZUVmZmVjdCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImVudGl0eUNvbnRyb2xTaWRlRWZmZWN0cyIsImV4ZWN1dGVBY3Rpb24iLCJ0cmlnZ2VyQWN0aW9uIiwiY29udGV4dCIsImdyb3VwSWQiLCJhY3Rpb24iLCJnZXRNb2RlbCIsImJpbmRDb250ZXh0IiwiZXhlY3V0ZSIsImdldEJpbmRpbmciLCJnZXRVcGRhdGVHcm91cElkIiwiZ2V0Q29udmVydGVkTWV0YU1vZGVsIiwiY29udmVydFR5cGVzIiwiZ2V0TWV0YU1vZGVsIiwiY2FwYWJpbGl0aWVzIiwiZ2V0RW50aXR5VHlwZUZyb21Db250ZXh0IiwibWV0YU1vZGVsIiwibWV0YVBhdGgiLCJnZXRNZXRhUGF0aCIsImdldFBhdGgiLCJnZXRPYmplY3QiLCJnZXRPRGF0YUVudGl0eVNpZGVFZmZlY3RzIiwiZW50aXR5VHlwZU5hbWUiLCJnZXRHbG9iYWxPRGF0YUVudGl0eVNpZGVFZmZlY3RzIiwiZW50aXR5U2lkZUVmZmVjdHMiLCJnbG9iYWxTaWRlRWZmZWN0cyIsImtleSIsInNpZGVFZmZlY3RzIiwic291cmNlRW50aXRpZXMiLCJzb3VyY2VQcm9wZXJ0aWVzIiwicHVzaCIsImdldE9EYXRhQWN0aW9uU2lkZUVmZmVjdHMiLCJhY3Rpb25OYW1lIiwidW5kZWZpbmVkIiwiaW5pdGlhbGl6ZVNpZGVFZmZlY3RzIiwic2lkZUVmZmVjdFNvdXJjZXMiLCJwcm9wZXJ0aWVzIiwiY29udmVydGVkTWV0YU1vZGVsIiwiZW50aXR5VHlwZXMiLCJmb3JFYWNoIiwicmV0cmlldmVPRGF0YUVudGl0eVNpZGVFZmZlY3RzIiwicmV0cmlldmVPRGF0YUFjdGlvbnNTaWRlRWZmZWN0cyIsIm1hcFNpZGVFZmZlY3RTb3VyY2VzIiwic291cmNlc1RvU2lkZUVmZmVjdE1hcHBpbmdzIiwicmVtb3ZlQ29udHJvbFNpZGVFZmZlY3RzIiwiY29udHJvbElkIiwiT2JqZWN0Iiwia2V5cyIsInNFbnRpdHlUeXBlIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwicGF0aEV4cHJlc3Npb25zIiwibG9nUmVxdWVzdCIsInJlcXVlc3RTaWRlRWZmZWN0c0Zvck9EYXRhQWN0aW9uIiwicHJvbWlzZXMiLCJ0cmlnZ2VyQWN0aW9ucyIsImxlbmd0aCIsIm1hcCIsImFsbCIsInJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eSIsIm5hdmlnYXRpb25Qcm9wZXJ0eSIsImJhc2VFbnRpdHlUeXBlIiwibmF2aWdhdGlvblBhdGgiLCJ0YXJnZXRQcm9wZXJ0aWVzIiwidGFyZ2V0RW50aXRpZXMiLCJzaWRlRWZmZWN0c1RhcmdldHMiLCJmaWx0ZXIiLCJhbm5vdGF0aW9uTmFtZSIsInNvbWUiLCJuYXZpZ2F0aW9uIiwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJwcm9wZXJ0eVBhdGgiLCJzdGFydHNXaXRoIiwicmVwbGFjZSIsImluZGV4T2YiLCJzQW5ub3RhdGlvbk5hbWUiLCJjb25jYXQiLCJzaWRlRWZmZWN0c1RhcmdldERlZmluaXRpb24iLCJyZW1vdmVEdXBsaWNhdGVUYXJnZXRzIiwiY2F0Y2giLCJlcnJvciIsIkxvZyIsImdldENvbnRyb2xFbnRpdHlTaWRlRWZmZWN0cyIsImdldFNpZGVFZmZlY3RXaGVyZUVudGl0eUlzU291cmNlIiwiY29tcHV0ZUZpZWxkR3JvdXBJZHMiLCJzb3VyY2VFbnRpdHlUeXBlIiwic291cmNlUHJvcGVydHkiLCJlbnRpdHlGaWVsZEdyb3VwSWRzIiwic2lkZUVmZmVjdEluZm8iLCJnZXRGaWVsZEdyb3VwSWRGb3JTaWRlRWZmZWN0IiwiZ2V0U2lkZUVmZmVjdFdoZXJlUHJvcGVydHlJc1NvdXJjZSIsInByb3BlcnR5TmFtZSIsImFkZFRleHRQcm9wZXJ0aWVzIiwic2V0T2ZQcm9wZXJ0aWVzIiwiU2V0Iiwic2V0T2ZFbnRpdGllcyIsInRhcmdldCIsInByb3BlcnRpZXNUb0FuYWx5emUiLCJyZWR1Y2UiLCJkYXRhTW9kZWxQcm9wZXJ0eVBhdGhzIiwiZ2V0RGF0YU1vZGVsUHJvcGVydGllc0Zyb21BUGF0aCIsImRhdGFNb2RlbFByb3BlcnR5UGF0aCIsImFzc29jaWF0ZWRUZXh0UGF0aCIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoIiwidGFyZ2V0T2JqZWN0IiwiZGF0YU1vZGVsVGV4dFBhdGgiLCJlbmhhbmNlRGF0YU1vZGVsUGF0aCIsInJlbGF0aXZlTmF2aWdhdGlvbiIsImdldFRhcmdldE5hdmlnYXRpb25QYXRoIiwidGFyZ2V0UGF0aCIsImdldFRhcmdldE9iamVjdFBhdGgiLCJpc1Byb3BlcnR5IiwiaGFzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJ0YXJnZXRFbnRpdHlTZXQiLCJ0YXJnZXRFbnRpdHlUeXBlIiwiYWRkIiwiQXJyYXkiLCJmcm9tIiwiY29udmVydFNpZGVFZmZlY3RzIiwiYmluZGluZ1BhcmFtZXRlciIsIlRyaWdnZXJBY3Rpb24iLCJuZXdTaWRlRWZmZWN0cyIsImNvbnZlcnRTaWRlRWZmZWN0c0Zvcm1hdCIsInJlbW92ZUJpbmRpbmdQYXJhbWV0ZXIiLCJmb3JtYXRQcm9wZXJ0aWVzIiwicGF0aCIsInR5cGUiLCJ2YWx1ZSIsImZvcm1hdEVudGl0aWVzIiwidGFyZ2V0RW50aXR5IiwiU291cmNlUHJvcGVydGllcyIsIlNvdXJjZUVudGl0aWVzIiwiVGFyZ2V0UHJvcGVydGllcyIsIlRhcmdldEVudGl0aWVzIiwiZGF0YU1vZGVsT2JqZWN0UGF0aHMiLCJlbnRpdHlTZXQiLCJlbnRpdHlTZXRzIiwiZmluZCIsInJlbGF0ZWRFbnRpdHlTZXQiLCJzaW5nbGV0b25zIiwic2luZ2xldG9uIiwiZW50aXR5U2V0Q29udGV4dCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwibmFtZSIsImRhdGFNb2RlbEVudGl0eVNldCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJpc0NvbXBsZXhUeXBlIiwidGFyZ2V0VHlwZSIsInByb3BlcnR5IiwiaXNFbnRpdHlUeXBlIiwiZW50aXR5UHJvcGVydGllcyIsImVudGl0eVByb3BlcnR5IiwiZGVzdHJveSIsIm9Db250ZXh0IiwiZ2V0Q29udGV4dCIsIm9Db21wb25lbnQiLCJzY29wZU9iamVjdCIsImdldFNpZGVFZmZlY3RzRnJvbVNvdXJjZSIsInNvdXJjZSIsImJpbmRpbmdBbGlhcyIsImlzU291cmNlRW50aXR5VHlwZSIsImNvbW1vbkFubm90YXRpb24iLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsInBhcmFtZXRlcnMiLCJwYXJhbWV0ZXIiLCJzcGxpdCIsImdldFNpZGVFZmZlY3RzQW5ub3RhdGlvbkZyb21Tb3VyY2UiLCJzaWRlRWZmZWN0QW5ubyIsImFubm90YXRpb24iLCJpc1NpZGVFZmZlY3RzQW5ub3RhdGlvbiIsIiRUeXBlIiwidGFyZ2V0UGF0aHMiLCJwYXRocyIsImRlYnVnIiwiYmluZGluZ1BhcmFtZXRlck5hbWUiLCJyZXBsYWNlQmluZGluZ1BhcmFtZXRlciIsIlJlZ0V4cCIsInRhcmdldFByb3BlcnR5IiwidGFyZ2V0RW50aXRpZXNQYXRocyIsInVuaXF1ZVRhcmdldGVkRW50aXRpZXNQYXRoIiwidW5pcXVlVGFyZ2V0UHJvcGVydGllcyIsInVuaXF1ZVRhcmdldGVkRW50aXRpZXMiLCJlbnRpdHlQYXRoIiwib0RhdGFTaWRlRWZmZWN0Iiwic2lkZUVmZmVjdHNTb3VyY2VzIiwic2lkZUVmZmVjdERlZmluaXRpb24iLCJzb3VyY2VFbnRpdHkiLCIkdGFyZ2V0IiwiZW50aXR5IiwicXVhbGlmaWVyIiwiaGFzVW5pcXVlU291cmNlUHJvcGVydHkiLCJpc0ltbWVkaWF0ZSIsInNpZGVFZmZlY3RXaXRoUXVhbGlmaWVyIiwiZ2V0SW50ZXJmYWNlIiwiU2VydmljZSIsIlNpZGVFZmZlY3RzU2VydmljZUZhY3RvcnkiLCJjcmVhdGVJbnN0YW5jZSIsIm9TZXJ2aWNlQ29udGV4dCIsIlNpZGVFZmZlY3RzU2VydmljZVNlcnZpY2UiLCJTZXJ2aWNlRmFjdG9yeSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2lkZUVmZmVjdHNTZXJ2aWNlRmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFjdGlvbiwgQ29udmVydGVkTWV0YWRhdGEsIEVudGl0eVR5cGUsIE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsIFByb3BlcnR5UGF0aCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBTaWRlRWZmZWN0c1R5cGUgYXMgQ29tbW9uU2lkZUVmZmVjdHNUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB7IENvbW1vbkFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IGNvbnZlcnRUeXBlcywgRW52aXJvbm1lbnRDYXBhYmlsaXRpZXMsIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgaXNDb21wbGV4VHlwZSwgaXNFbnRpdHlUeXBlLCBpc1Byb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHsgZ2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eVBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBTZXJ2aWNlQ29udGV4dCB9IGZyb20gXCJ0eXBlcy9tZXRhbW9kZWxfdHlwZXNcIjtcbmltcG9ydCB7IERhdGFNb2RlbE9iamVjdFBhdGgsIGVuaGFuY2VEYXRhTW9kZWxQYXRoLCBnZXRUYXJnZXROYXZpZ2F0aW9uUGF0aCwgZ2V0VGFyZ2V0T2JqZWN0UGF0aCB9IGZyb20gXCIuLi90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcblxudHlwZSBTaWRlRWZmZWN0c1NldHRpbmdzID0ge307XG5cbmV4cG9ydCB0eXBlIFNpZGVFZmZlY3RzRW50aXR5VHlwZSA9IHtcblx0JE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBTaWRlRWZmZWN0c1RhcmdldCA9IFNpZGVFZmZlY3RzRW50aXR5VHlwZSB8IHN0cmluZztcblxuZXhwb3J0IHR5cGUgU2lkZUVmZmVjdHNUYXJnZXRUeXBlID0ge1xuXHR0YXJnZXRQcm9wZXJ0aWVzOiBzdHJpbmdbXTtcblx0dGFyZ2V0RW50aXRpZXM6IFNpZGVFZmZlY3RzRW50aXR5VHlwZVtdO1xufTtcblxudHlwZSBCYXNlU2lkZUVmZmVjdHNUeXBlID0ge1xuXHRzb3VyY2VQcm9wZXJ0aWVzPzogc3RyaW5nW107XG5cdHNvdXJjZUVudGl0aWVzPzogU2lkZUVmZmVjdHNFbnRpdHlUeXBlW107XG5cdGZ1bGx5UXVhbGlmaWVkTmFtZTogc3RyaW5nO1xufSAmIFNpZGVFZmZlY3RzVGFyZ2V0VHlwZTtcblxuZXhwb3J0IHR5cGUgT0RhdGFTaWRlRWZmZWN0c1R5cGUgPSBCYXNlU2lkZUVmZmVjdHNUeXBlICYge1xuXHR0cmlnZ2VyQWN0aW9uPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgQWN0aW9uU2lkZUVmZmVjdHNUeXBlID0ge1xuXHRwYXRoRXhwcmVzc2lvbnM6IFNpZGVFZmZlY3RzVGFyZ2V0W107XG5cdHRyaWdnZXJBY3Rpb25zPzogc3RyaW5nW107XG59O1xuXG5leHBvcnQgdHlwZSBDb250cm9sU2lkZUVmZmVjdHNUeXBlID0gUGFydGlhbDxCYXNlU2lkZUVmZmVjdHNUeXBlPiAmIHtcblx0ZnVsbHlRdWFsaWZpZWROYW1lOiBzdHJpbmc7XG5cdHNvdXJjZVByb3BlcnRpZXM6IHN0cmluZ1tdO1xuXHRzb3VyY2VDb250cm9sSWQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFNpZGVFZmZlY3RzVHlwZSA9IENvbnRyb2xTaWRlRWZmZWN0c1R5cGUgfCBPRGF0YVNpZGVFZmZlY3RzVHlwZTtcblxuLy9UT0RPIGZpeCB0aGlzIHR5cGUgaW4gdGhlIHV4IHZvY2FidWxhcmllc1xudHlwZSBDb21tb25TaWRlRWZmZWN0VHlwZVdpdGhRdWFsaWZpZXIgPSBDb21tb25TaWRlRWZmZWN0c1R5cGUgJiB7IHF1YWxpZmllcj86IHN0cmluZyB9O1xuXG5leHBvcnQgdHlwZSBPRGF0YVNpZGVFZmZlY3RzRW50aXR5RGljdGlvbmFyeSA9IFJlY29yZDxzdHJpbmcsIE9EYXRhU2lkZUVmZmVjdHNUeXBlPjtcbmV4cG9ydCB0eXBlIE9EYXRhU2lkZUVmZmVjdHNBY3Rpb25EaWN0aW9uYXJ5ID0gUmVjb3JkPHN0cmluZywgQWN0aW9uU2lkZUVmZmVjdHNUeXBlPjtcbmV4cG9ydCB0eXBlIENvbnRyb2xTaWRlRWZmZWN0c0VudGl0eURpY3Rpb25hcnkgPSBSZWNvcmQ8c3RyaW5nLCBDb250cm9sU2lkZUVmZmVjdHNUeXBlPjtcblxuZXhwb3J0IHR5cGUgU2lkZUVmZmVjdEluZm9Gb3JTb3VyY2UgPSB7IGVudGl0eTogc3RyaW5nOyBxdWFsaWZpZXI/OiBzdHJpbmc7IGhhc1VuaXF1ZVNvdXJjZVByb3BlcnR5PzogYm9vbGVhbiB9O1xuXG50eXBlIFNpZGVFZmZlY3RzT3JpZ2luUmVnaXN0cnkgPSB7XG5cdG9EYXRhOiB7XG5cdFx0ZW50aXRpZXM6IHtcblx0XHRcdFtlbnRpdHk6IHN0cmluZ106IFJlY29yZDxzdHJpbmcsIE9EYXRhU2lkZUVmZmVjdHNUeXBlPjtcblx0XHR9O1xuXHRcdGFjdGlvbnM6IHtcblx0XHRcdFtlbnRpdHk6IHN0cmluZ106IFJlY29yZDxzdHJpbmcsIEFjdGlvblNpZGVFZmZlY3RzVHlwZT47XG5cdFx0fTtcblx0fTtcblx0Y29udHJvbDoge1xuXHRcdFtlbnRpdHk6IHN0cmluZ106IFJlY29yZDxzdHJpbmcsIENvbnRyb2xTaWRlRWZmZWN0c1R5cGU+O1xuXHR9O1xufTtcblxuZXhwb3J0IGNsYXNzIFNpZGVFZmZlY3RzU2VydmljZSBleHRlbmRzIFNlcnZpY2U8U2lkZUVmZmVjdHNTZXR0aW5ncz4ge1xuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8U2lkZUVmZmVjdHNTZXJ2aWNlPjtcblxuXHRwcml2YXRlIHNpZGVFZmZlY3RzUmVnaXN0cnkhOiBTaWRlRWZmZWN0c09yaWdpblJlZ2lzdHJ5O1xuXG5cdHByaXZhdGUgY2FwYWJpbGl0aWVzITogRW52aXJvbm1lbnRDYXBhYmlsaXRpZXMgfCB1bmRlZmluZWQ7XG5cblx0cHJpdmF0ZSBpc0luaXRpYWxpemVkITogYm9vbGVhbjtcblxuXHRwcml2YXRlIHNvdXJjZXNUb1NpZGVFZmZlY3RNYXBwaW5ncyE6IHtcblx0XHRlbnRpdGllczogUmVjb3JkPHN0cmluZywgU2lkZUVmZmVjdEluZm9Gb3JTb3VyY2VbXT47XG5cdFx0cHJvcGVydGllczogUmVjb3JkPHN0cmluZywgU2lkZUVmZmVjdEluZm9Gb3JTb3VyY2VbXT47XG5cdH07XG5cblx0Ly8gITogbWVhbnMgdGhhdCB3ZSBrbm93IGl0IHdpbGwgYmUgYXNzaWduZWQgYmVmb3JlIHVzYWdlXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5zaWRlRWZmZWN0c1JlZ2lzdHJ5ID0ge1xuXHRcdFx0b0RhdGE6IHtcblx0XHRcdFx0ZW50aXRpZXM6IHt9LFxuXHRcdFx0XHRhY3Rpb25zOiB7fVxuXHRcdFx0fSxcblx0XHRcdGNvbnRyb2w6IHt9XG5cdFx0fTtcblx0XHR0aGlzLmlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHR0aGlzLmluaXRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHRoaXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBTaWRlRWZmZWN0cyBjb250cm9sXG5cdCAqIFNpZGVFZmZlY3RzIGRlZmluaXRpb24gaXMgYWRkZWQgYnkgYSBjb250cm9sIHRvIGtlZXAgZGF0YSB1cCB0byBkYXRlXG5cdCAqIFRoZXNlIFNpZGVFZmZlY3RzIGdldCBsaW1pdGVkIHNjb3BlIGNvbXBhcmVkIHdpdGggU2lkZUVmZmVjdHMgY29taW5nIGZyb20gYW4gT0RhdGEgc2VydmljZTpcblx0ICogLSBPbmx5IG9uZSBTaWRlRWZmZWN0cyBkZWZpbml0aW9uIGNhbiBiZSBkZWZpbmVkIGZvciB0aGUgY29tYmluYXRpb24gZW50aXR5IHR5cGUgLSBjb250cm9sIElkXG5cdCAqIC0gT25seSBTaWRlRWZmZWN0cyBzb3VyY2UgcHJvcGVydGllcyBhcmUgcmVjb2duaXplZCBhbmQgdXNlZCB0byB0cmlnZ2VyIFNpZGVFZmZlY3RzXG5cdCAqXG5cdCAqIEVuc3VyZSB0aGUgc291cmNlQ29udHJvbElkIG1hdGNoZXMgdGhlIGFzc29jaWF0ZWQgU0FQVUk1IGNvbnRyb2wgSUQuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZSBOYW1lIG9mIHRoZSBlbnRpdHkgdHlwZVxuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdCBTaWRlRWZmZWN0cyBkZWZpbml0aW9uXG5cdCAqL1xuXHRwdWJsaWMgYWRkQ29udHJvbFNpZGVFZmZlY3RzKGVudGl0eVR5cGU6IHN0cmluZywgc2lkZUVmZmVjdDogT21pdDxDb250cm9sU2lkZUVmZmVjdHNUeXBlLCBcImZ1bGx5UXVhbGlmaWVkTmFtZVwiPik6IHZvaWQge1xuXHRcdGlmIChzaWRlRWZmZWN0LnNvdXJjZUNvbnRyb2xJZCkge1xuXHRcdFx0Y29uc3QgY29udHJvbFNpZGVFZmZlY3Q6IENvbnRyb2xTaWRlRWZmZWN0c1R5cGUgPSB7XG5cdFx0XHRcdC4uLnNpZGVFZmZlY3QsXG5cdFx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5VHlwZX0vU2lkZUVmZmVjdHNGb3JDb250cm9sLyR7c2lkZUVmZmVjdC5zb3VyY2VDb250cm9sSWR9YFxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IGVudGl0eUNvbnRyb2xTaWRlRWZmZWN0cyA9IHRoaXMuc2lkZUVmZmVjdHNSZWdpc3RyeS5jb250cm9sW2VudGl0eVR5cGVdIHx8IHt9O1xuXHRcdFx0ZW50aXR5Q29udHJvbFNpZGVFZmZlY3RzW2NvbnRyb2xTaWRlRWZmZWN0LnNvdXJjZUNvbnRyb2xJZF0gPSBjb250cm9sU2lkZUVmZmVjdDtcblx0XHRcdHRoaXMuc2lkZUVmZmVjdHNSZWdpc3RyeS5jb250cm9sW2VudGl0eVR5cGVdID0gZW50aXR5Q29udHJvbFNpZGVFZmZlY3RzO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBFeGVjdXRlcyBTaWRlRWZmZWN0cyBhY3Rpb24uXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gdHJpZ2dlckFjdGlvbiBOYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIGNvbnRleHQgQ29udGV4dFxuXHQgKiBAcGFyYW0gZ3JvdXBJZCBUaGUgZ3JvdXAgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3Rcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aG91dCBkYXRhIG9yIHdpdGggYSByZXR1cm4gdmFsdWUgY29udGV4dCB3aGVuIHRoZSBhY3Rpb24gY2FsbCBzdWNjZWVkZWRcblx0ICovXG5cdHB1YmxpYyBleGVjdXRlQWN0aW9uKHRyaWdnZXJBY3Rpb246IHN0cmluZywgY29udGV4dDogQ29udGV4dCwgZ3JvdXBJZD86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGFjdGlvbiA9IGNvbnRleHQuZ2V0TW9kZWwoKS5iaW5kQ29udGV4dChgJHt0cmlnZ2VyQWN0aW9ufSguLi4pYCwgY29udGV4dCk7XG5cdFx0cmV0dXJuIGFjdGlvbi5leGVjdXRlKGdyb3VwSWQgfHwgY29udGV4dC5nZXRCaW5kaW5nKCkuZ2V0VXBkYXRlR3JvdXBJZCgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGNvbnZlcnRlZCBPRGF0YSBtZXRhTW9kZWwuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcmV0dXJucyBDb252ZXJ0ZWQgT0RhdGEgbWV0YU1vZGVsXG5cdCAqL1xuXHRwdWJsaWMgZ2V0Q29udmVydGVkTWV0YU1vZGVsKCk6IENvbnZlcnRlZE1ldGFkYXRhIHtcblx0XHRyZXR1cm4gY29udmVydFR5cGVzKHRoaXMuZ2V0TWV0YU1vZGVsKCksIHRoaXMuY2FwYWJpbGl0aWVzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBlbnRpdHkgdHlwZSBvZiBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHRcblx0ICogQHJldHVybnMgRW50aXR5IFR5cGVcblx0ICovXG5cdHB1YmxpYyBnZXRFbnRpdHlUeXBlRnJvbUNvbnRleHQoY29udGV4dDogQ29udGV4dCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gY29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0bWV0YVBhdGggPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgoY29udGV4dC5nZXRQYXRoKCkpLFxuXHRcdFx0ZW50aXR5VHlwZSA9IG1ldGFNb2RlbC5nZXRPYmplY3QobWV0YVBhdGgpW1wiJFR5cGVcIl07XG5cdFx0cmV0dXJuIGVudGl0eVR5cGU7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgU2lkZUVmZmVjdHMgdGhhdCBjb21lIGZyb20gYW4gT0RhdGEgc2VydmljZS5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlTmFtZSBOYW1lIG9mIHRoZSBlbnRpdHkgdHlwZVxuXHQgKiBAcmV0dXJucyBTaWRlRWZmZWN0cyBkaWN0aW9uYXJ5XG5cdCAqL1xuXHRwdWJsaWMgZ2V0T0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhlbnRpdHlUeXBlTmFtZTogc3RyaW5nKTogUmVjb3JkPHN0cmluZywgT0RhdGFTaWRlRWZmZWN0c1R5cGU+IHtcblx0XHRyZXR1cm4gdGhpcy5zaWRlRWZmZWN0c1JlZ2lzdHJ5Lm9EYXRhLmVudGl0aWVzW2VudGl0eVR5cGVOYW1lXSB8fCB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBnbG9iYWwgU2lkZUVmZmVjdHMgdGhhdCBjb21lIGZyb20gYW4gT0RhdGEgc2VydmljZS5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlTmFtZSBOYW1lIG9mIHRoZSBlbnRpdHkgdHlwZVxuXHQgKiBAcmV0dXJucyBHbG9iYWwgU2lkZUVmZmVjdHNcblx0ICovXG5cdHB1YmxpYyBnZXRHbG9iYWxPRGF0YUVudGl0eVNpZGVFZmZlY3RzKGVudGl0eVR5cGVOYW1lOiBzdHJpbmcpOiBPRGF0YVNpZGVFZmZlY3RzVHlwZVtdIHtcblx0XHRjb25zdCBlbnRpdHlTaWRlRWZmZWN0cyA9IHRoaXMuZ2V0T0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhlbnRpdHlUeXBlTmFtZSk7XG5cdFx0Y29uc3QgZ2xvYmFsU2lkZUVmZmVjdHM6IE9EYXRhU2lkZUVmZmVjdHNUeXBlW10gPSBbXTtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBlbnRpdHlTaWRlRWZmZWN0cykge1xuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHMgPSBlbnRpdHlTaWRlRWZmZWN0c1trZXldO1xuXHRcdFx0aWYgKCFzaWRlRWZmZWN0cy5zb3VyY2VFbnRpdGllcyAmJiAhc2lkZUVmZmVjdHMuc291cmNlUHJvcGVydGllcykge1xuXHRcdFx0XHRnbG9iYWxTaWRlRWZmZWN0cy5wdXNoKHNpZGVFZmZlY3RzKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGdsb2JhbFNpZGVFZmZlY3RzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIFNpZGVFZmZlY3RzIHRoYXQgY29tZSBmcm9tIGFuIE9EYXRhIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gYWN0aW9uTmFtZSBOYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIGNvbnRleHQgQ29udGV4dFxuXHQgKiBAcmV0dXJucyBTaWRlRWZmZWN0cyBkZWZpbml0aW9uXG5cdCAqL1xuXHRwdWJsaWMgZ2V0T0RhdGFBY3Rpb25TaWRlRWZmZWN0cyhhY3Rpb25OYW1lOiBzdHJpbmcsIGNvbnRleHQ/OiBDb250ZXh0KTogQWN0aW9uU2lkZUVmZmVjdHNUeXBlIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAoY29udGV4dCkge1xuXHRcdFx0Y29uc3QgZW50aXR5VHlwZSA9IHRoaXMuZ2V0RW50aXR5VHlwZUZyb21Db250ZXh0KGNvbnRleHQpO1xuXHRcdFx0aWYgKGVudGl0eVR5cGUpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc2lkZUVmZmVjdHNSZWdpc3RyeS5vRGF0YS5hY3Rpb25zW2VudGl0eVR5cGVdPy5bYWN0aW9uTmFtZV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBkaWN0aW9uYXJ5IGZvciB0aGUgU2lkZUVmZmVjdHMuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gY2FwYWJpbGl0aWVzIFRoZSBjdXJyZW50IGNhcGFiaWxpdGllc1xuXHQgKi9cblx0cHVibGljIGluaXRpYWxpemVTaWRlRWZmZWN0cyhjYXBhYmlsaXRpZXM/OiBFbnZpcm9ubWVudENhcGFiaWxpdGllcyk6IHZvaWQge1xuXHRcdHRoaXMuY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0aWVzO1xuXHRcdGlmICghdGhpcy5pc0luaXRpYWxpemVkKSB7XG5cdFx0XHRjb25zdCBzaWRlRWZmZWN0U291cmNlczoge1xuXHRcdFx0XHRlbnRpdGllczogUmVjb3JkPHN0cmluZywgU2lkZUVmZmVjdEluZm9Gb3JTb3VyY2VbXT47XG5cdFx0XHRcdHByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIFNpZGVFZmZlY3RJbmZvRm9yU291cmNlW10+O1xuXHRcdFx0fSA9IHtcblx0XHRcdFx0ZW50aXRpZXM6IHt9LFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7fVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IGNvbnZlcnRlZE1ldGFNb2RlbCA9IHRoaXMuZ2V0Q29udmVydGVkTWV0YU1vZGVsKCk7XG5cdFx0XHRjb252ZXJ0ZWRNZXRhTW9kZWwuZW50aXR5VHlwZXMuZm9yRWFjaCgoZW50aXR5VHlwZTogRW50aXR5VHlwZSkgPT4ge1xuXHRcdFx0XHR0aGlzLnNpZGVFZmZlY3RzUmVnaXN0cnkub0RhdGEuZW50aXRpZXNbZW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWVdID0gdGhpcy5yZXRyaWV2ZU9EYXRhRW50aXR5U2lkZUVmZmVjdHMoZW50aXR5VHlwZSk7XG5cdFx0XHRcdHRoaXMuc2lkZUVmZmVjdHNSZWdpc3RyeS5vRGF0YS5hY3Rpb25zW2VudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lXSA9IHRoaXMucmV0cmlldmVPRGF0YUFjdGlvbnNTaWRlRWZmZWN0cyhlbnRpdHlUeXBlKTsgLy8gb25seSBib3VuZCBhY3Rpb25zIGFyZSBhbmFseXplZCBzaW5jZSB1bmJvdW5kIG9uZXMgZG9uJ3QgZ2V0IFNpZGVFZmZlY3RzXG5cdFx0XHRcdHRoaXMubWFwU2lkZUVmZmVjdFNvdXJjZXMoZW50aXR5VHlwZSwgc2lkZUVmZmVjdFNvdXJjZXMpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnNvdXJjZXNUb1NpZGVFZmZlY3RNYXBwaW5ncyA9IHNpZGVFZmZlY3RTb3VyY2VzO1xuXHRcdFx0dGhpcy5pc0luaXRpYWxpemVkID0gdHJ1ZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgU2lkZUVmZmVjdHMgcmVsYXRlZCB0byBhIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gY29udHJvbElkIENvbnRyb2wgSWRcblx0ICovXG5cdHB1YmxpYyByZW1vdmVDb250cm9sU2lkZUVmZmVjdHMoY29udHJvbElkOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRPYmplY3Qua2V5cyh0aGlzLnNpZGVFZmZlY3RzUmVnaXN0cnkuY29udHJvbCkuZm9yRWFjaCgoc0VudGl0eVR5cGUpID0+IHtcblx0XHRcdGlmICh0aGlzLnNpZGVFZmZlY3RzUmVnaXN0cnkuY29udHJvbFtzRW50aXR5VHlwZV1bY29udHJvbElkXSkge1xuXHRcdFx0XHRkZWxldGUgdGhpcy5zaWRlRWZmZWN0c1JlZ2lzdHJ5LmNvbnRyb2xbc0VudGl0eVR5cGVdW2NvbnRyb2xJZF07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgdGhlIFNpZGVFZmZlY3RzIG9uIGEgc3BlY2lmaWMgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIHBhdGhFeHByZXNzaW9ucyBUYXJnZXRzIG9mIFNpZGVFZmZlY3RzIHRvIGJlIGV4ZWN1dGVkXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgd2hlcmUgU2lkZUVmZmVjdHMgbmVlZCB0byBiZSBleGVjdXRlZFxuXHQgKiBAcGFyYW0gZ3JvdXBJZCBUaGUgZ3JvdXAgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3Rcblx0ICogQHJldHVybnMgUHJvbWlzZSBvbiBTaWRlRWZmZWN0cyByZXF1ZXN0XG5cdCAqL1xuXHRwdWJsaWMgcmVxdWVzdFNpZGVFZmZlY3RzKHBhdGhFeHByZXNzaW9uczogU2lkZUVmZmVjdHNUYXJnZXRbXSwgY29udGV4dDogQ29udGV4dCwgZ3JvdXBJZD86IHN0cmluZyk6IFByb21pc2U8dW5kZWZpbmVkPiB7XG5cdFx0dGhpcy5sb2dSZXF1ZXN0KHBhdGhFeHByZXNzaW9ucywgY29udGV4dCk7XG5cdFx0cmV0dXJuIGNvbnRleHQucmVxdWVzdFNpZGVFZmZlY3RzKHBhdGhFeHByZXNzaW9ucyBhcyBvYmplY3RbXSwgZ3JvdXBJZCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgdGhlIFNpZGVFZmZlY3RzIGZvciBhbiBPRGF0YSBhY3Rpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0cyBTaWRlRWZmZWN0cyBkZWZpbml0aW9uXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgd2hlcmUgU2lkZUVmZmVjdHMgbmVlZCB0byBiZSBleGVjdXRlZFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIG9uIFNpZGVFZmZlY3RzIHJlcXVlc3RzIGFuZCBhY3Rpb24gZXhlY3V0aW9uXG5cdCAqL1xuXHRwdWJsaWMgcmVxdWVzdFNpZGVFZmZlY3RzRm9yT0RhdGFBY3Rpb24oc2lkZUVmZmVjdHM6IEFjdGlvblNpZGVFZmZlY3RzVHlwZSwgY29udGV4dDogQ29udGV4dCk6IFByb21pc2U8KHZvaWQgfCB1bmRlZmluZWQpW10+IHtcblx0XHRsZXQgcHJvbWlzZXM6IFByb21pc2U8dm9pZCB8IHVuZGVmaW5lZD5bXTtcblxuXHRcdGlmIChzaWRlRWZmZWN0cy50cmlnZ2VyQWN0aW9ucz8ubGVuZ3RoKSB7XG5cdFx0XHRwcm9taXNlcyA9IHNpZGVFZmZlY3RzLnRyaWdnZXJBY3Rpb25zLm1hcCgoYWN0aW9uTmFtZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5leGVjdXRlQWN0aW9uKGFjdGlvbk5hbWUsIGNvbnRleHQpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHByb21pc2VzID0gW107XG5cdFx0fVxuXG5cdFx0aWYgKHNpZGVFZmZlY3RzLnBhdGhFeHByZXNzaW9ucz8ubGVuZ3RoKSB7XG5cdFx0XHRwcm9taXNlcy5wdXNoKHRoaXMucmVxdWVzdFNpZGVFZmZlY3RzKHNpZGVFZmZlY3RzLnBhdGhFeHByZXNzaW9ucywgY29udGV4dCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBwcm9taXNlcy5sZW5ndGggPyBQcm9taXNlLmFsbChwcm9taXNlcykgOiBQcm9taXNlLnJlc29sdmUoW10pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIHRoZSBTaWRlRWZmZWN0cyBmb3IgYSBuYXZpZ2F0aW9uIHByb3BlcnR5IG9uIGEgc3BlY2lmaWMgY29udGV4dC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBuYXZpZ2F0aW9uUHJvcGVydHkgTmF2aWdhdGlvbiBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gY29udGV4dCBDb250ZXh0IHdoZXJlIFNpZGVFZmZlY3RzIG5lZWQgdG8gYmUgZXhlY3V0ZWRcblx0ICogQHBhcmFtIGdyb3VwSWQgQmF0Y2ggZ3JvdXAgZm9yIHRoZSBxdWVyeVxuXHQgKiBAcmV0dXJucyBTaWRlRWZmZWN0cyByZXF1ZXN0IG9uIFNBUFVJNSBjb250ZXh0XG5cdCAqL1xuXHRwdWJsaWMgcmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5KFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0eTogc3RyaW5nLFxuXHRcdGNvbnRleHQ6IENvbnRleHQsXG5cdFx0Z3JvdXBJZD86IHN0cmluZ1xuXHQpOiBQcm9taXNlPHZvaWQgfCB1bmRlZmluZWQ+IHtcblx0XHRjb25zdCBiYXNlRW50aXR5VHlwZSA9IHRoaXMuZ2V0RW50aXR5VHlwZUZyb21Db250ZXh0KGNvbnRleHQpO1xuXHRcdGlmIChiYXNlRW50aXR5VHlwZSkge1xuXHRcdFx0Y29uc3QgbmF2aWdhdGlvblBhdGggPSBgJHtuYXZpZ2F0aW9uUHJvcGVydHl9L2A7XG5cdFx0XHRjb25zdCBlbnRpdHlTaWRlRWZmZWN0cyA9IHRoaXMuZ2V0T0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhiYXNlRW50aXR5VHlwZSk7XG5cdFx0XHRsZXQgdGFyZ2V0UHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblx0XHRcdGxldCB0YXJnZXRFbnRpdGllczogU2lkZUVmZmVjdHNFbnRpdHlUeXBlW10gPSBbXTtcblx0XHRcdGxldCBzaWRlRWZmZWN0c1RhcmdldHM6IFNpZGVFZmZlY3RzVGFyZ2V0W10gPSBbXTtcblx0XHRcdE9iamVjdC5rZXlzKGVudGl0eVNpZGVFZmZlY3RzKVxuXHRcdFx0XHQuZmlsdGVyKFxuXHRcdFx0XHRcdC8vIEtlZXAgcmVsZXZhbnQgU2lkZUVmZmVjdHNcblx0XHRcdFx0XHQvLyAxLiBTb3VyY2VFbnRpdGllcyBtYXRjaCBPUlxuXHRcdFx0XHRcdC8vIDIuIE9ubHkgMSBTb3VyY2VQcm9wZXJ0aWVzIGFuZCBtYXRjaFxuXHRcdFx0XHRcdChhbm5vdGF0aW9uTmFtZSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHM6IE9EYXRhU2lkZUVmZmVjdHNUeXBlID0gZW50aXR5U2lkZUVmZmVjdHNbYW5ub3RhdGlvbk5hbWVdO1xuXHRcdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdFx0KHNpZGVFZmZlY3RzLnNvdXJjZUVudGl0aWVzIHx8IFtdKS5zb21lKFxuXHRcdFx0XHRcdFx0XHRcdChuYXZpZ2F0aW9uKSA9PiBuYXZpZ2F0aW9uLiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoID09PSBuYXZpZ2F0aW9uUHJvcGVydHlcblx0XHRcdFx0XHRcdFx0KSB8fFxuXHRcdFx0XHRcdFx0XHQoc2lkZUVmZmVjdHMuc291cmNlUHJvcGVydGllcz8ubGVuZ3RoID09PSAxICYmXG5cdFx0XHRcdFx0XHRcdFx0c2lkZUVmZmVjdHMuc291cmNlUHJvcGVydGllcy5zb21lKFxuXHRcdFx0XHRcdFx0XHRcdFx0KHByb3BlcnR5UGF0aCkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0cHJvcGVydHlQYXRoLnN0YXJ0c1dpdGgobmF2aWdhdGlvblBhdGgpICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHByb3BlcnR5UGF0aC5yZXBsYWNlKG5hdmlnYXRpb25QYXRoLCBcIlwiKS5pbmRleE9mKFwiL1wiKSA9PT0gLTFcblx0XHRcdFx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdClcblx0XHRcdFx0LmZvckVhY2goKHNBbm5vdGF0aW9uTmFtZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHNpZGVFZmZlY3RzID0gZW50aXR5U2lkZUVmZmVjdHNbc0Fubm90YXRpb25OYW1lXTtcblx0XHRcdFx0XHRpZiAoc2lkZUVmZmVjdHMudHJpZ2dlckFjdGlvbikge1xuXHRcdFx0XHRcdFx0dGhpcy5leGVjdXRlQWN0aW9uKHNpZGVFZmZlY3RzLnRyaWdnZXJBY3Rpb24sIGNvbnRleHQsIGdyb3VwSWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0YXJnZXRQcm9wZXJ0aWVzID0gdGFyZ2V0UHJvcGVydGllcy5jb25jYXQoc2lkZUVmZmVjdHMudGFyZ2V0UHJvcGVydGllcyk7XG5cdFx0XHRcdFx0dGFyZ2V0RW50aXRpZXMgPSB0YXJnZXRFbnRpdGllcy5jb25jYXQoc2lkZUVmZmVjdHMudGFyZ2V0RW50aXRpZXMpO1xuXHRcdFx0XHR9KTtcblx0XHRcdC8vIFJlbW92ZSBkdXBsaWNhdGUgdGFyZ2V0c1xuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNUYXJnZXREZWZpbml0aW9uID0gdGhpcy5yZW1vdmVEdXBsaWNhdGVUYXJnZXRzKHtcblx0XHRcdFx0dGFyZ2V0UHJvcGVydGllczogdGFyZ2V0UHJvcGVydGllcyxcblx0XHRcdFx0dGFyZ2V0RW50aXRpZXM6IHRhcmdldEVudGl0aWVzXG5cdFx0XHR9KTtcblx0XHRcdHNpZGVFZmZlY3RzVGFyZ2V0cyA9IFsuLi5zaWRlRWZmZWN0c1RhcmdldERlZmluaXRpb24udGFyZ2V0UHJvcGVydGllcywgLi4uc2lkZUVmZmVjdHNUYXJnZXREZWZpbml0aW9uLnRhcmdldEVudGl0aWVzXTtcblx0XHRcdGlmIChzaWRlRWZmZWN0c1RhcmdldHMubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnJlcXVlc3RTaWRlRWZmZWN0cyhzaWRlRWZmZWN0c1RhcmdldHMsIGNvbnRleHQsIGdyb3VwSWQpLmNhdGNoKChlcnJvcikgPT5cblx0XHRcdFx0XHRMb2cuZXJyb3IoYFNpZGVFZmZlY3RzIC0gRXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBTaWRlRWZmZWN0cyBmb3IgTmF2aWdhdGlvbiBQcm9wZXJ0eSAke25hdmlnYXRpb25Qcm9wZXJ0eX1gLCBlcnJvcilcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIFNpZGVFZmZlY3RzIHRoYXQgY29tZSBmcm9tIGNvbnRyb2xzLlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIGVudGl0eVR5cGVOYW1lIEVudGl0eSB0eXBlIE5hbWVcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgZGljdGlvbmFyeVxuXHQgKi9cblx0cHVibGljIGdldENvbnRyb2xFbnRpdHlTaWRlRWZmZWN0cyhlbnRpdHlUeXBlTmFtZTogc3RyaW5nKTogUmVjb3JkPHN0cmluZywgQ29udHJvbFNpZGVFZmZlY3RzVHlwZT4ge1xuXHRcdHJldHVybiB0aGlzLnNpZGVFZmZlY3RzUmVnaXN0cnkuY29udHJvbFtlbnRpdHlUeXBlTmFtZV0gfHwge307XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBTaWRlRWZmZWN0cycgcXVhbGlmaWVyIGFuZCBvd25lciBlbnRpdHkgd2hlcmUgdGhpcyBlbnRpdHkgaXMgdXNlZCBhcyBzb3VyY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlTmFtZSBFbnRpdHkgdHlwZSBmdWxseSBxdWFsaWZpZWQgbmFtZVxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiBzaWRlRWZmZWN0cyBpbmZvXG5cdCAqL1xuXHRwdWJsaWMgZ2V0U2lkZUVmZmVjdFdoZXJlRW50aXR5SXNTb3VyY2UoZW50aXR5VHlwZU5hbWU6IHN0cmluZyk6IFNpZGVFZmZlY3RJbmZvRm9yU291cmNlW10ge1xuXHRcdHJldHVybiB0aGlzLnNvdXJjZXNUb1NpZGVFZmZlY3RNYXBwaW5ncy5lbnRpdGllc1tlbnRpdHlUeXBlTmFtZV0gfHwgW107XG5cdH1cblxuXHQvKipcblx0ICogQ29tbW9uIG1ldGhvZCB0byBnZXQgdGhlIGZpZWxkIGdyb3VwSWRzIGZvciBhIHNvdXJjZSBlbnRpdHkgYW5kIGEgc291cmNlIHByb3BlcnR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gc291cmNlRW50aXR5VHlwZVxuXHQgKiBAcGFyYW0gc291cmNlUHJvcGVydHlcblx0ICogQHJldHVybnMgQSBjb2xsZWN0aW9uIG9mIGZpZWxkR3JvdXBJZHNcblx0ICovXG5cdHB1YmxpYyBjb21wdXRlRmllbGRHcm91cElkcyhzb3VyY2VFbnRpdHlUeXBlOiBzdHJpbmcsIHNvdXJjZVByb3BlcnR5OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG5cdFx0Y29uc3QgZW50aXR5RmllbGRHcm91cElkcyA9IHRoaXMuZ2V0U2lkZUVmZmVjdFdoZXJlRW50aXR5SXNTb3VyY2Uoc291cmNlRW50aXR5VHlwZSkubWFwKChzaWRlRWZmZWN0SW5mbykgPT5cblx0XHRcdHRoaXMuZ2V0RmllbGRHcm91cElkRm9yU2lkZUVmZmVjdChzaWRlRWZmZWN0SW5mbywgdHJ1ZSlcblx0XHQpO1xuXHRcdHJldHVybiBlbnRpdHlGaWVsZEdyb3VwSWRzLmNvbmNhdChcblx0XHRcdHRoaXMuZ2V0U2lkZUVmZmVjdFdoZXJlUHJvcGVydHlJc1NvdXJjZShzb3VyY2VQcm9wZXJ0eSkubWFwKChzaWRlRWZmZWN0SW5mbykgPT5cblx0XHRcdFx0dGhpcy5nZXRGaWVsZEdyb3VwSWRGb3JTaWRlRWZmZWN0KHNpZGVFZmZlY3RJbmZvKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBTaWRlRWZmZWN0cycgcXVhbGlmaWVyIGFuZCBvd25lciBlbnRpdHkgd2hlcmUgdGhpcyBwcm9wZXJ0eSBpcyB1c2VkIGFzIHNvdXJjZS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBQcm9wZXJ0eSBmdWxseSBxdWFsaWZpZWQgbmFtZVxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiBzaWRlRWZmZWN0cyBpbmZvXG5cdCAqL1xuXHRwdWJsaWMgZ2V0U2lkZUVmZmVjdFdoZXJlUHJvcGVydHlJc1NvdXJjZShwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IFNpZGVFZmZlY3RJbmZvRm9yU291cmNlW10ge1xuXHRcdHJldHVybiB0aGlzLnNvdXJjZXNUb1NpZGVFZmZlY3RNYXBwaW5ncy5wcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gfHwgW107XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyB0aGUgdGV4dCBwcm9wZXJ0aWVzIHJlcXVpcmVkIGZvciBTaWRlRWZmZWN0c1xuXHQgKiBJZiBhIHByb3BlcnR5IGhhcyBhbiBhc3NvY2lhdGVkIHRleHQgdGhlbiB0aGlzIHRleHQgbmVlZHMgdG8gYmUgYWRkZWQgYXMgdGFyZ2V0UHJvcGVydGllcy5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0c1RhcmdldHMgU2lkZUVmZmVjdHMgVGFyZ2V0c1xuXHQgKiBAcGFyYW0gZW50aXR5VHlwZSBFbnRpdHkgdHlwZVxuXHQgKiBAcmV0dXJucyBTaWRlRWZmZWN0cyBkZWZpbml0aW9uIHdpdGggYWRkZWQgdGV4dCBwcm9wZXJ0aWVzXG5cdCAqL1xuXHRwcml2YXRlIGFkZFRleHRQcm9wZXJ0aWVzKHNpZGVFZmZlY3RzVGFyZ2V0czogU2lkZUVmZmVjdHNUYXJnZXRUeXBlLCBlbnRpdHlUeXBlOiBFbnRpdHlUeXBlKTogU2lkZUVmZmVjdHNUYXJnZXRUeXBlIHtcblx0XHRjb25zdCBzZXRPZlByb3BlcnRpZXMgPSBuZXcgU2V0KHNpZGVFZmZlY3RzVGFyZ2V0cy50YXJnZXRQcm9wZXJ0aWVzKTtcblx0XHRjb25zdCBzZXRPZkVudGl0aWVzID0gbmV3IFNldChzaWRlRWZmZWN0c1RhcmdldHMudGFyZ2V0RW50aXRpZXMubWFwKCh0YXJnZXQpID0+IHRhcmdldC4kTmF2aWdhdGlvblByb3BlcnR5UGF0aCkpO1xuXG5cdFx0Ly8gR2VuZXJhdGUgYWxsIGRhdGFNb2RlbFBhdGggZm9yIHRoZSBwcm9wZXJ0aWVzIHRvIGFuYWx5emUgKGNvdmVyIFwiKlwiIGFuZCAvKilcblx0XHRjb25zdCBwcm9wZXJ0aWVzVG9BbmFseXplID0gc2lkZUVmZmVjdHNUYXJnZXRzLnRhcmdldFByb3BlcnRpZXMucmVkdWNlKFxuXHRcdFx0KGRhdGFNb2RlbFByb3BlcnR5UGF0aHM6IERhdGFNb2RlbE9iamVjdFBhdGhbXSwgcHJvcGVydHlQYXRoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBkYXRhTW9kZWxQcm9wZXJ0eVBhdGhzLmNvbmNhdCh0aGlzLmdldERhdGFNb2RlbFByb3BlcnRpZXNGcm9tQVBhdGgocHJvcGVydHlQYXRoLCBlbnRpdHlUeXBlKSk7XG5cdFx0XHR9LFxuXHRcdFx0W11cblx0XHQpO1xuXG5cdFx0Ly8gR2VuZXJhdGUgYWxsIHBhdGhzIHJlbGF0ZWQgdG8gdGhlIHRleHQgcHJvcGVydGllcyBhbmQgbm90IGFscmVhZHkgY292ZXJlZCBieSB0aGUgU2lkZUVmZmVjdHNcblx0XHRmb3IgKGNvbnN0IGRhdGFNb2RlbFByb3BlcnR5UGF0aCBvZiBwcm9wZXJ0aWVzVG9BbmFseXplKSB7XG5cdFx0XHRjb25zdCBhc3NvY2lhdGVkVGV4dFBhdGggPSBnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aChkYXRhTW9kZWxQcm9wZXJ0eVBhdGgudGFyZ2V0T2JqZWN0KTtcblx0XHRcdGlmIChhc3NvY2lhdGVkVGV4dFBhdGgpIHtcblx0XHRcdFx0Y29uc3QgZGF0YU1vZGVsVGV4dFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChkYXRhTW9kZWxQcm9wZXJ0eVBhdGgsIGFzc29jaWF0ZWRUZXh0UGF0aCk7XG5cdFx0XHRcdGNvbnN0IHJlbGF0aXZlTmF2aWdhdGlvbiA9IGdldFRhcmdldE5hdmlnYXRpb25QYXRoKGRhdGFNb2RlbFRleHRQYXRoLCB0cnVlKTtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0UGF0aCA9IGdldFRhcmdldE9iamVjdFBhdGgoZGF0YU1vZGVsVGV4dFBhdGgsIHRydWUpO1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0aXNQcm9wZXJ0eShkYXRhTW9kZWxUZXh0UGF0aC50YXJnZXRPYmplY3QpICYmXG5cdFx0XHRcdFx0IXNldE9mUHJvcGVydGllcy5oYXModGFyZ2V0UGF0aCkgJiYgLy8gdGhlIHByb3BlcnR5IGlzIGFscmVhZHkgbGlzdGVkXG5cdFx0XHRcdFx0IXNldE9mUHJvcGVydGllcy5oYXMoYCR7cmVsYXRpdmVOYXZpZ2F0aW9ufSR7ZGF0YU1vZGVsVGV4dFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoID8gXCIvXCIgOiBcIlwifSpgKSAmJiAvLyB0aGUgcHJvcGVydHkgaXMgYWxyZWFkeSBsaXN0ZWQgdGhhbmtzIHRvIHRoZSBcIipcIlxuXHRcdFx0XHRcdCFzZXRPZkVudGl0aWVzLmhhcyhgJHtyZWxhdGl2ZU5hdmlnYXRpb259YCkgLy8gdGhlIHByb3BlcnR5IGlzIG5vdCBwYXJ0IG9mIGEgVGFyZ2V0RW50aXRpZXNcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0Ly8gVGhlIFRleHQgYXNzb2NpYXRpb24gaXMgYWRkZWQgYXMgVGFyZ2V0RW50aXRpZXMgaWZcblx0XHRcdFx0XHQvLyAgLSBpdCdzIGNvbnRhaW5lZCBvbiBhIGRpZmZlcmVudCBlbnRpdHlTZXQgdGhhbiB0aGUgU2lkZUVmZmVjdHNcblx0XHRcdFx0XHQvLyAgLSAgYW5kIGl0J3MgY29udGFpbmVkIG9uIGEgZGlmZmVyZW50IGVudGl0eVNldCB0aGFuIHRoZSBzb3VyY2VkIHByb3BlcnR5XG5cdFx0XHRcdFx0Ly8gT3RoZXJ3aXNlIGl0J3MgYWRkZWQgYXMgdGFyZ2V0UHJvcGVydGllc1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFByb3BlcnR5UGF0aC50YXJnZXRFbnRpdHlTZXQgIT09IGRhdGFNb2RlbFRleHRQYXRoLnRhcmdldEVudGl0eVNldCAmJlxuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsVGV4dFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMgJiZcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFRleHRQYXRoLnRhcmdldEVudGl0eVR5cGVcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdHNldE9mRW50aXRpZXMuYWRkKHJlbGF0aXZlTmF2aWdhdGlvbik7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNldE9mUHJvcGVydGllcy5hZGQodGFyZ2V0UGF0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRhcmdldFByb3BlcnRpZXM6IEFycmF5LmZyb20oc2V0T2ZQcm9wZXJ0aWVzKSxcblx0XHRcdHRhcmdldEVudGl0aWVzOiBBcnJheS5mcm9tKHNldE9mRW50aXRpZXMpLm1hcCgobmF2aWdhdGlvbikgPT4ge1xuXHRcdFx0XHRyZXR1cm4geyAkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogbmF2aWdhdGlvbiB9O1xuXHRcdFx0fSlcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIHRoZSBTaWRlRWZmZWN0cyB0byBleHBlY3RlZCBmb3JtYXRcblx0ICogIC0gU2V0IFRyaWdnZXJBY3Rpb24gYXMgc3RyaW5nXG5cdCAqICAtIENvbnZlcnRzIFNpZGVFZmZlY3RzIHRhcmdldHMgdG8gZXhwZWN0ZWQgZm9ybWF0XG5cdCAqICAtIFJlbW92ZXMgYmluZGluZyBwYXJhbWV0ZXIgZnJvbSBTaWRlRWZmZWN0cyB0YXJnZXRzIHByb3BlcnRpZXNcblx0ICogIC0gQWRkcyB0aGUgdGV4dCBwcm9wZXJ0aWVzXG5cdCAqICAtIFJlcGxhY2VzIFRhcmdldFByb3BlcnRpZXMgaGF2aW5nIHJlZmVyZW5jZSB0byBTb3VyY2UgUHJvcGVydGllcyBmb3IgYSBTaWRlRWZmZWN0cy5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0cyBTaWRlRWZmZWN0cyBkZWZpbml0aW9uXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlIEVudGl0eSB0eXBlXG5cdCAqIEBwYXJhbSBiaW5kaW5nUGFyYW1ldGVyIE5hbWUgb2YgdGhlIGJpbmRpbmcgcGFyYW1ldGVyXG5cdCAqIEByZXR1cm5zIFNpZGVFZmZlY3RzIGRlZmluaXRpb25cblx0ICovXG5cdHByaXZhdGUgY29udmVydFNpZGVFZmZlY3RzKFxuXHRcdHNpZGVFZmZlY3RzOiBDb21tb25TaWRlRWZmZWN0c1R5cGUsXG5cdFx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0XHRiaW5kaW5nUGFyYW1ldGVyPzogc3RyaW5nXG5cdCk6IE9EYXRhU2lkZUVmZmVjdHNUeXBlIHtcblx0XHRjb25zdCB0cmlnZ2VyQWN0aW9uID0gc2lkZUVmZmVjdHMuVHJpZ2dlckFjdGlvbiBhcyBzdHJpbmc7XG5cdFx0Y29uc3QgbmV3U2lkZUVmZmVjdHMgPSB0aGlzLmNvbnZlcnRTaWRlRWZmZWN0c0Zvcm1hdChzaWRlRWZmZWN0cyk7XG5cdFx0bGV0IHNpZGVFZmZlY3RzVGFyZ2V0cyA9IHsgdGFyZ2V0UHJvcGVydGllczogbmV3U2lkZUVmZmVjdHMudGFyZ2V0UHJvcGVydGllcywgdGFyZ2V0RW50aXRpZXM6IG5ld1NpZGVFZmZlY3RzLnRhcmdldEVudGl0aWVzIH07XG5cdFx0c2lkZUVmZmVjdHNUYXJnZXRzID0gdGhpcy5yZW1vdmVCaW5kaW5nUGFyYW1ldGVyKHNpZGVFZmZlY3RzVGFyZ2V0cywgYmluZGluZ1BhcmFtZXRlcik7XG5cdFx0c2lkZUVmZmVjdHNUYXJnZXRzID0gdGhpcy5hZGRUZXh0UHJvcGVydGllcyhzaWRlRWZmZWN0c1RhcmdldHMsIGVudGl0eVR5cGUpO1xuXHRcdHNpZGVFZmZlY3RzVGFyZ2V0cyA9IHRoaXMucmVtb3ZlRHVwbGljYXRlVGFyZ2V0cyhzaWRlRWZmZWN0c1RhcmdldHMpO1xuXHRcdHJldHVybiB7XG5cdFx0XHQuLi5uZXdTaWRlRWZmZWN0cyxcblx0XHRcdC4uLnsgdGFyZ2V0RW50aXRpZXM6IHNpZGVFZmZlY3RzVGFyZ2V0cy50YXJnZXRFbnRpdGllcywgdGFyZ2V0UHJvcGVydGllczogc2lkZUVmZmVjdHNUYXJnZXRzLnRhcmdldFByb3BlcnRpZXMsIHRyaWdnZXJBY3Rpb24gfVxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgdGhlIFNpZGVFZmZlY3RzIHRhcmdldHMgKFRhcmdldEVudGl0aWVzIGFuZCBUYXJnZXRQcm9wZXJ0aWVzKSB0byBleHBlY3RlZCBmb3JtYXRcblx0ICogIC0gVGFyZ2V0UHJvcGVydGllcyBhcyBhcnJheSBvZiBzdHJpbmdcblx0ICogIC0gVGFyZ2V0RW50aXRpZXMgYXMgYXJyYXkgb2Ygb2JqZWN0IHdpdGggcHJvcGVydHkgJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGguXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHMgU2lkZUVmZmVjdHMgZGVmaW5pdGlvblxuXHQgKiBAcmV0dXJucyBDb252ZXJ0ZWQgU2lkZUVmZmVjdHNcblx0ICovXG5cdHByaXZhdGUgY29udmVydFNpZGVFZmZlY3RzRm9ybWF0KHNpZGVFZmZlY3RzOiBDb21tb25TaWRlRWZmZWN0c1R5cGUpOiBPRGF0YVNpZGVFZmZlY3RzVHlwZSB7XG5cdFx0Y29uc3QgZm9ybWF0UHJvcGVydGllcyA9IChwcm9wZXJ0aWVzPzogKHN0cmluZyB8IFByb3BlcnR5UGF0aClbXSkgPT4ge1xuXHRcdFx0cmV0dXJuIHByb3BlcnRpZXNcblx0XHRcdFx0PyBwcm9wZXJ0aWVzLnJlZHVjZSgodGFyZ2V0UHJvcGVydGllczogc3RyaW5nW10sIHRhcmdldCkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3QgcGF0aCA9ICgodGFyZ2V0IGFzIFByb3BlcnR5UGF0aCkudHlwZSAmJiAodGFyZ2V0IGFzIFByb3BlcnR5UGF0aCkudmFsdWUpIHx8ICh0YXJnZXQgYXMgc3RyaW5nKTtcblx0XHRcdFx0XHRcdGlmIChwYXRoKSB7XG5cdFx0XHRcdFx0XHRcdHRhcmdldFByb3BlcnRpZXMucHVzaChwYXRoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcblx0XHRcdFx0XHRcdFx0XHRgU2lkZUVmZmVjdHMgLSBFcnJvciB3aGlsZSBwcm9jZXNzaW5nIFRhcmdldFByb3BlcnRpZXMgZm9yIFNpZGVFZmZlY3RzICR7c2lkZUVmZmVjdHMuZnVsbHlRdWFsaWZpZWROYW1lfWBcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiB0YXJnZXRQcm9wZXJ0aWVzO1xuXHRcdFx0XHQgIH0sIFtdKVxuXHRcdFx0XHQ6IHByb3BlcnRpZXM7XG5cdFx0fTtcblx0XHRjb25zdCBmb3JtYXRFbnRpdGllcyA9IChlbnRpdGllcz86IE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhbXSkgPT4ge1xuXHRcdFx0cmV0dXJuIGVudGl0aWVzXG5cdFx0XHRcdD8gZW50aXRpZXMubWFwKCh0YXJnZXRFbnRpdHkpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiB7ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiB0YXJnZXRFbnRpdHkudmFsdWUgfTtcblx0XHRcdFx0ICB9KVxuXHRcdFx0XHQ6IGVudGl0aWVzO1xuXHRcdH07XG5cdFx0cmV0dXJuIHtcblx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogc2lkZUVmZmVjdHMuZnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0c291cmNlUHJvcGVydGllczogZm9ybWF0UHJvcGVydGllcyhzaWRlRWZmZWN0cy5Tb3VyY2VQcm9wZXJ0aWVzKSxcblx0XHRcdHNvdXJjZUVudGl0aWVzOiBmb3JtYXRFbnRpdGllcyhzaWRlRWZmZWN0cy5Tb3VyY2VFbnRpdGllcyksXG5cdFx0XHR0YXJnZXRQcm9wZXJ0aWVzOiBmb3JtYXRQcm9wZXJ0aWVzKHNpZGVFZmZlY3RzLlRhcmdldFByb3BlcnRpZXMgYXMgKHN0cmluZyB8IFByb3BlcnR5UGF0aClbXSkgPz8gW10sXG5cdFx0XHR0YXJnZXRFbnRpdGllczogZm9ybWF0RW50aXRpZXMoc2lkZUVmZmVjdHMuVGFyZ2V0RW50aXRpZXMpID8/IFtdXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFsbCBkYXRhTW9kZWxPYmplY3RQYXRoIHJlbGF0ZWQgdG8gcHJvcGVydGllcyBsaXN0ZWQgYnkgYSBwYXRoXG5cdCAqXG5cdCAqIFRoZSBwYXRoIGNhbiBiZTpcblx0ICogIC0gYSBwYXRoIHRhcmdldGluZyBhIHByb3BlcnR5IG9uIGEgY29tcGxleFR5cGUgb3IgYW4gRW50aXR5VHlwZVxuXHQgKiAgLSBhIHBhdGggd2l0aCBhIHN0YXIgdGFyZ2V0aW5nIGFsbCBwcm9wZXJ0aWVzIG9uIGEgY29tcGxleFR5cGUgb3IgYW4gRW50aXR5VHlwZS5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIHRvIGFuYWx5emVcblx0ICogQHBhcmFtIGVudGl0eVR5cGUgRW50aXR5IHR5cGVcblx0ICogQHJldHVybnMgQXJyYXkgb2YgZGF0YU1vZGVsT2JqZWN0UGF0aCByZXByZXNlbnRpbmcgdGhlIHByb3BlcnRpZXNcblx0ICovXG5cdHByaXZhdGUgZ2V0RGF0YU1vZGVsUHJvcGVydGllc0Zyb21BUGF0aChwYXRoOiBzdHJpbmcsIGVudGl0eVR5cGU6IEVudGl0eVR5cGUpOiBEYXRhTW9kZWxPYmplY3RQYXRoW10ge1xuXHRcdGxldCBkYXRhTW9kZWxPYmplY3RQYXRoczogRGF0YU1vZGVsT2JqZWN0UGF0aFtdID0gW107XG5cdFx0Y29uc3QgY29udmVydGVkTWV0YU1vZGVsID0gdGhpcy5nZXRDb252ZXJ0ZWRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBlbnRpdHlTZXQgPVxuXHRcdFx0Y29udmVydGVkTWV0YU1vZGVsLmVudGl0eVNldHMuZmluZCgocmVsYXRlZEVudGl0eVNldCkgPT4gcmVsYXRlZEVudGl0eVNldC5lbnRpdHlUeXBlID09PSBlbnRpdHlUeXBlKSB8fFxuXHRcdFx0Y29udmVydGVkTWV0YU1vZGVsLnNpbmdsZXRvbnMuZmluZCgoc2luZ2xldG9uKSA9PiBzaW5nbGV0b24uZW50aXR5VHlwZSA9PT0gZW50aXR5VHlwZSk7XG5cblx0XHRpZiAoZW50aXR5U2V0KSB7XG5cdFx0XHRjb25zdCBtZXRhTW9kZWwgPSB0aGlzLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0XHRlbnRpdHlTZXRDb250ZXh0ID0gbWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAvJHtlbnRpdHlTZXQubmFtZX1gKTtcblx0XHRcdGlmIChlbnRpdHlTZXRDb250ZXh0KSB7XG5cdFx0XHRcdGNvbnN0IGRhdGFNb2RlbEVudGl0eVNldCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhlbnRpdHlTZXRDb250ZXh0KTtcblx0XHRcdFx0Y29uc3QgZGF0YU1vZGVsT2JqZWN0UGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKGRhdGFNb2RlbEVudGl0eVNldCwgcGF0aC5yZXBsYWNlKFwiKlwiLCBcIlwiKSB8fCBcIi9cIiksIC8vIFwiKlwiIGlzIHJlcGxhY2VkIGJ5IFwiL1wiIHRvIHRhcmdldCB0aGUgY3VycmVudCBFbnRpdHlUeXBlXG5cdFx0XHRcdFx0dGFyZ2V0T2JqZWN0ID0gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q7XG5cdFx0XHRcdGlmIChpc1Byb3BlcnR5KHRhcmdldE9iamVjdCkpIHtcblx0XHRcdFx0XHRpZiAoaXNDb21wbGV4VHlwZSh0YXJnZXRPYmplY3QudGFyZ2V0VHlwZSkpIHtcblx0XHRcdFx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGhzID0gZGF0YU1vZGVsT2JqZWN0UGF0aHMuY29uY2F0KFxuXHRcdFx0XHRcdFx0XHR0YXJnZXRPYmplY3QudGFyZ2V0VHlwZS5wcm9wZXJ0aWVzLm1hcCgocHJvcGVydHkpID0+IGVuaGFuY2VEYXRhTW9kZWxQYXRoKGRhdGFNb2RlbE9iamVjdFBhdGgsIHByb3BlcnR5Lm5hbWUpKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aHMucHVzaChkYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoaXNFbnRpdHlUeXBlKHRhcmdldE9iamVjdCkpIHtcblx0XHRcdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRocyA9IGRhdGFNb2RlbE9iamVjdFBhdGhzLmNvbmNhdChcblx0XHRcdFx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLm1hcCgoZW50aXR5UHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGVuaGFuY2VEYXRhTW9kZWxQYXRoKGRhdGFNb2RlbE9iamVjdFBhdGgsIGVudGl0eVByb3BlcnR5Lm5hbWUpO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVudGl0eVNldENvbnRleHQuZGVzdHJveSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZGF0YU1vZGVsT2JqZWN0UGF0aHMuZmlsdGVyKChkYXRhTW9kZWxPYmplY3RQYXRoKSA9PiBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgT2RhdGEgbWV0YW1vZGVsLlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHJldHVybnMgVGhlIE9EYXRhIG1ldGFtb2RlbFxuXHQgKi9cblx0cHJpdmF0ZSBnZXRNZXRhTW9kZWwoKTogT0RhdGFNZXRhTW9kZWwge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0O1xuXHRcdHJldHVybiBvQ29tcG9uZW50LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgU2lkZUVmZmVjdHMgcmVsYXRlZCB0byBhbiBlbnRpdHkgdHlwZSBvciBhY3Rpb24gdGhhdCBjb21lIGZyb20gYW4gT0RhdGEgU2VydmljZVxuXHQgKiBJbnRlcm5hbCByb3V0aW5lIHRvIGdldCwgZnJvbSBjb252ZXJ0ZWQgb0RhdGEgbWV0YU1vZGVsLCBTaWRlRWZmZWN0cyByZWxhdGVkIHRvIGEgc3BlY2lmaWMgZW50aXR5IHR5cGUgb3IgYWN0aW9uXG5cdCAqIGFuZCB0byBjb252ZXJ0IHRoZXNlIFNpZGVFZmZlY3RzIHdpdGggZXhwZWN0ZWQgZm9ybWF0LlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNvdXJjZSBFbnRpdHkgdHlwZSBvciBhY3Rpb25cblx0ICogQHJldHVybnMgQXJyYXkgb2YgU2lkZUVmZmVjdHNcblx0ICovXG5cdHByaXZhdGUgZ2V0U2lkZUVmZmVjdHNGcm9tU291cmNlKHNvdXJjZTogRW50aXR5VHlwZSB8IEFjdGlvbik6IE9EYXRhU2lkZUVmZmVjdHNUeXBlW10ge1xuXHRcdGxldCBiaW5kaW5nQWxpYXMgPSBcIlwiO1xuXHRcdGNvbnN0IGlzU291cmNlRW50aXR5VHlwZSA9IGlzRW50aXR5VHlwZShzb3VyY2UpO1xuXHRcdGNvbnN0IGVudGl0eVR5cGU6IEVudGl0eVR5cGUgfCB1bmRlZmluZWQgPSBpc1NvdXJjZUVudGl0eVR5cGUgPyBzb3VyY2UgOiBzb3VyY2Uuc291cmNlRW50aXR5VHlwZTtcblx0XHRjb25zdCBjb21tb25Bbm5vdGF0aW9uID0gc291cmNlLmFubm90YXRpb25zPy5Db21tb24gYXMgdW5kZWZpbmVkIHwgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nLCBDb21tb25Bbm5vdGF0aW9uVHlwZXM+O1xuXHRcdGlmIChlbnRpdHlUeXBlICYmIGNvbW1vbkFubm90YXRpb24pIHtcblx0XHRcdGlmICghaXNTb3VyY2VFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdGNvbnN0IGJpbmRpbmdQYXJhbWV0ZXIgPSBzb3VyY2UucGFyYW1ldGVycz8uZmluZCgocGFyYW1ldGVyKSA9PiBwYXJhbWV0ZXIudHlwZSA9PT0gZW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWUpO1xuXHRcdFx0XHRiaW5kaW5nQWxpYXMgPSBiaW5kaW5nUGFyYW1ldGVyPy5mdWxseVF1YWxpZmllZE5hbWUuc3BsaXQoXCIvXCIpWzFdID8/IFwiXCI7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRTaWRlRWZmZWN0c0Fubm90YXRpb25Gcm9tU291cmNlKHNvdXJjZSkubWFwKChzaWRlRWZmZWN0QW5ubykgPT5cblx0XHRcdFx0dGhpcy5jb252ZXJ0U2lkZUVmZmVjdHMoc2lkZUVmZmVjdEFubm8sIGVudGl0eVR5cGUsIGJpbmRpbmdBbGlhcylcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiBbXTtcblx0fVxuXHQvKipcblx0ICogR2V0cyB0aGUgU2lkZUVmZmVjdHMgcmVsYXRlZCB0byBhbiBlbnRpdHkgdHlwZSBvciBhY3Rpb24gdGhhdCBjb21lIGZyb20gYW4gT0RhdGEgU2VydmljZVxuXHQgKiBJbnRlcm5hbCByb3V0aW5lIHRvIGdldCwgZnJvbSBjb252ZXJ0ZWQgb0RhdGEgbWV0YU1vZGVsLCBTaWRlRWZmZWN0cyByZWxhdGVkIHRvIGEgc3BlY2lmaWMgZW50aXR5IHR5cGUgb3IgYWN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gc291cmNlIEVudGl0eSB0eXBlIG9yIGFjdGlvblxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiBTaWRlRWZmZWN0c1xuXHQgKi9cblx0cHJpdmF0ZSBnZXRTaWRlRWZmZWN0c0Fubm90YXRpb25Gcm9tU291cmNlKHNvdXJjZTogRW50aXR5VHlwZSB8IEFjdGlvbik6IENvbW1vblNpZGVFZmZlY3RUeXBlV2l0aFF1YWxpZmllcltdIHtcblx0XHRjb25zdCBzaWRlRWZmZWN0czogQ29tbW9uU2lkZUVmZmVjdHNUeXBlW10gPSBbXTtcblx0XHRjb25zdCBjb21tb25Bbm5vdGF0aW9uID0gc291cmNlLmFubm90YXRpb25zPy5Db21tb24gYXMgdW5kZWZpbmVkIHwgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nLCBDb21tb25TaWRlRWZmZWN0VHlwZVdpdGhRdWFsaWZpZXI+O1xuXHRcdGZvciAoY29uc3Qga2V5IGluIGNvbW1vbkFubm90YXRpb24pIHtcblx0XHRcdGNvbnN0IGFubm90YXRpb24gPSBjb21tb25Bbm5vdGF0aW9uW2tleV07XG5cdFx0XHRpZiAodGhpcy5pc1NpZGVFZmZlY3RzQW5ub3RhdGlvbihhbm5vdGF0aW9uKSkge1xuXHRcdFx0XHRzaWRlRWZmZWN0cy5wdXNoKGFubm90YXRpb24pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc2lkZUVmZmVjdHM7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBhbm5vdGF0aW9uIGlzIGEgU2lkZUVmZmVjdHMgYW5ub3RhdGlvbi5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBhbm5vdGF0aW9uIEFubm90YXRpb25cblx0ICogQHJldHVybnMgQm9vbGVhblxuXHQgKi9cblx0cHJpdmF0ZSBpc1NpZGVFZmZlY3RzQW5ub3RhdGlvbihhbm5vdGF0aW9uOiB1bmtub3duKTogYW5ub3RhdGlvbiBpcyBDb21tb25TaWRlRWZmZWN0c1R5cGUge1xuXHRcdHJldHVybiAoYW5ub3RhdGlvbiBhcyBDb21tb25TaWRlRWZmZWN0c1R5cGUpPy4kVHlwZSA9PT0gQ29tbW9uQW5ub3RhdGlvblR5cGVzLlNpZGVFZmZlY3RzVHlwZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2dzIHRoZSBTaWRlRWZmZWN0cyByZXF1ZXN0LlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHBhdGhFeHByZXNzaW9ucyBTaWRlRWZmZWN0cyB0YXJnZXRzXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHRcblx0ICovXG5cdHByaXZhdGUgbG9nUmVxdWVzdChwYXRoRXhwcmVzc2lvbnM6IFNpZGVFZmZlY3RzVGFyZ2V0W10sIGNvbnRleHQ6IENvbnRleHQpIHtcblx0XHRjb25zdCB0YXJnZXRQYXRocyA9IHBhdGhFeHByZXNzaW9ucy5yZWR1Y2UoZnVuY3Rpb24gKHBhdGhzLCB0YXJnZXQpIHtcblx0XHRcdHJldHVybiBgJHtwYXRoc31cXG5cXHRcXHQkeyh0YXJnZXQgYXMgU2lkZUVmZmVjdHNFbnRpdHlUeXBlKS4kTmF2aWdhdGlvblByb3BlcnR5UGF0aCB8fCB0YXJnZXQgfHwgXCJcIn1gO1xuXHRcdH0sIFwiXCIpO1xuXHRcdExvZy5kZWJ1ZyhgU2lkZUVmZmVjdHMgLSBSZXF1ZXN0OlxcblxcdENvbnRleHQgcGF0aCA6ICR7Y29udGV4dC5nZXRQYXRoKCl9XFxuXFx0UHJvcGVydHkgcGF0aHMgOiR7dGFyZ2V0UGF0aHN9YCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyB0aGUgbmFtZSBvZiB0aGUgYmluZGluZyBwYXJhbWV0ZXIgb24gdGhlIFNpZGVFZmZlY3RzIHRhcmdldHMuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHNUYXJnZXRzIFNpZGVFZmZlY3RzIFRhcmdldHNcblx0ICogQHBhcmFtIGJpbmRpbmdQYXJhbWV0ZXJOYW1lIE5hbWUgb2YgYmluZGluZyBwYXJhbWV0ZXJcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgZGVmaW5pdGlvblxuXHQgKi9cblx0cHJpdmF0ZSByZW1vdmVCaW5kaW5nUGFyYW1ldGVyKHNpZGVFZmZlY3RzVGFyZ2V0czogU2lkZUVmZmVjdHNUYXJnZXRUeXBlLCBiaW5kaW5nUGFyYW1ldGVyTmFtZT86IHN0cmluZyk6IFNpZGVFZmZlY3RzVGFyZ2V0VHlwZSB7XG5cdFx0aWYgKGJpbmRpbmdQYXJhbWV0ZXJOYW1lKSB7XG5cdFx0XHRjb25zdCByZXBsYWNlQmluZGluZ1BhcmFtZXRlciA9IGZ1bmN0aW9uICh2YWx1ZTogc3RyaW5nKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZS5yZXBsYWNlKG5ldyBSZWdFeHAoYF4ke2JpbmRpbmdQYXJhbWV0ZXJOYW1lfS8/YCksIFwiXCIpO1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHRhcmdldFByb3BlcnRpZXM6IHNpZGVFZmZlY3RzVGFyZ2V0cy50YXJnZXRQcm9wZXJ0aWVzLm1hcCgodGFyZ2V0UHJvcGVydHkpID0+IHJlcGxhY2VCaW5kaW5nUGFyYW1ldGVyKHRhcmdldFByb3BlcnR5KSksXG5cdFx0XHRcdHRhcmdldEVudGl0aWVzOiBzaWRlRWZmZWN0c1RhcmdldHMudGFyZ2V0RW50aXRpZXMubWFwKCh0YXJnZXRFbnRpdHkpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4geyAkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogcmVwbGFjZUJpbmRpbmdQYXJhbWV0ZXIodGFyZ2V0RW50aXR5LiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoKSB9O1xuXHRcdFx0XHR9KVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRhcmdldFByb3BlcnRpZXM6IHNpZGVFZmZlY3RzVGFyZ2V0cy50YXJnZXRQcm9wZXJ0aWVzLFxuXHRcdFx0dGFyZ2V0RW50aXRpZXM6IHNpZGVFZmZlY3RzVGFyZ2V0cy50YXJnZXRFbnRpdGllc1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlIGR1cGxpY2F0ZXMgaW4gU2lkZUVmZmVjdHMgdGFyZ2V0cy5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0c1RhcmdldHMgU2lkZUVmZmVjdHMgVGFyZ2V0c1xuXHQgKiBAcmV0dXJucyBTaWRlRWZmZWN0cyB0YXJnZXRzIHdpdGhvdXQgZHVwbGljYXRlc1xuXHQgKi9cblx0cHJpdmF0ZSByZW1vdmVEdXBsaWNhdGVUYXJnZXRzKHNpZGVFZmZlY3RzVGFyZ2V0czogU2lkZUVmZmVjdHNUYXJnZXRUeXBlKTogU2lkZUVmZmVjdHNUYXJnZXRUeXBlIHtcblx0XHRjb25zdCB0YXJnZXRFbnRpdGllc1BhdGhzID0gc2lkZUVmZmVjdHNUYXJnZXRzLnRhcmdldEVudGl0aWVzLm1hcCgodGFyZ2V0RW50aXR5KSA9PiB0YXJnZXRFbnRpdHkuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpO1xuXHRcdGNvbnN0IHVuaXF1ZVRhcmdldGVkRW50aXRpZXNQYXRoID0gbmV3IFNldDxzdHJpbmc+KHRhcmdldEVudGl0aWVzUGF0aHMpO1xuXHRcdGNvbnN0IHVuaXF1ZVRhcmdldFByb3BlcnRpZXMgPSBuZXcgU2V0PHN0cmluZz4oc2lkZUVmZmVjdHNUYXJnZXRzLnRhcmdldFByb3BlcnRpZXMpO1xuXG5cdFx0Y29uc3QgdW5pcXVlVGFyZ2V0ZWRFbnRpdGllcyA9IEFycmF5LmZyb20odW5pcXVlVGFyZ2V0ZWRFbnRpdGllc1BhdGgpLm1hcCgoZW50aXR5UGF0aCkgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0JE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IGVudGl0eVBhdGhcblx0XHRcdH07XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4geyB0YXJnZXRQcm9wZXJ0aWVzOiBBcnJheS5mcm9tKHVuaXF1ZVRhcmdldFByb3BlcnRpZXMpLCB0YXJnZXRFbnRpdGllczogdW5pcXVlVGFyZ2V0ZWRFbnRpdGllcyB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgU2lkZUVmZmVjdHMgYWN0aW9uIHR5cGUgdGhhdCBjb21lIGZyb20gYW4gT0RhdGEgU2VydmljZVxuXHQgKiBJbnRlcm5hbCByb3V0aW5lIHRvIGdldCwgZnJvbSBjb252ZXJ0ZWQgb0RhdGEgbWV0YU1vZGVsLCBTaWRlRWZmZWN0cyBvbiBhY3Rpb25zXG5cdCAqIHJlbGF0ZWQgdG8gYSBzcGVjaWZpYyBlbnRpdHkgdHlwZSBhbmQgdG8gY29udmVydCB0aGVzZSBTaWRlRWZmZWN0cyB3aXRoXG5cdCAqIGV4cGVjdGVkIGZvcm1hdC5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlIEVudGl0eSB0eXBlXG5cdCAqIEByZXR1cm5zIEVudGl0eSB0eXBlIFNpZGVFZmZlY3RzIGRpY3Rpb25hcnlcblx0ICovXG5cdHByaXZhdGUgcmV0cmlldmVPRGF0YUFjdGlvbnNTaWRlRWZmZWN0cyhlbnRpdHlUeXBlOiBFbnRpdHlUeXBlKTogUmVjb3JkPHN0cmluZywgQWN0aW9uU2lkZUVmZmVjdHNUeXBlPiB7XG5cdFx0Y29uc3Qgc2lkZUVmZmVjdHM6IFJlY29yZDxzdHJpbmcsIEFjdGlvblNpZGVFZmZlY3RzVHlwZT4gPSB7fTtcblx0XHRjb25zdCBhY3Rpb25zID0gZW50aXR5VHlwZS5hY3Rpb25zO1xuXHRcdGlmIChhY3Rpb25zKSB7XG5cdFx0XHRPYmplY3Qua2V5cyhhY3Rpb25zKS5mb3JFYWNoKChhY3Rpb25OYW1lKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGFjdGlvbiA9IGVudGl0eVR5cGUuYWN0aW9uc1thY3Rpb25OYW1lXTtcblx0XHRcdFx0Y29uc3QgdHJpZ2dlckFjdGlvbnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblx0XHRcdFx0bGV0IHRhcmdldFByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cdFx0XHRcdGxldCB0YXJnZXRFbnRpdGllczogU2lkZUVmZmVjdHNFbnRpdHlUeXBlW10gPSBbXTtcblxuXHRcdFx0XHR0aGlzLmdldFNpZGVFZmZlY3RzRnJvbVNvdXJjZShhY3Rpb24pLmZvckVhY2goKG9EYXRhU2lkZUVmZmVjdCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHRyaWdnZXJBY3Rpb24gPSBvRGF0YVNpZGVFZmZlY3QudHJpZ2dlckFjdGlvbjtcblx0XHRcdFx0XHR0YXJnZXRQcm9wZXJ0aWVzID0gdGFyZ2V0UHJvcGVydGllcy5jb25jYXQob0RhdGFTaWRlRWZmZWN0LnRhcmdldFByb3BlcnRpZXMpO1xuXHRcdFx0XHRcdHRhcmdldEVudGl0aWVzID0gdGFyZ2V0RW50aXRpZXMuY29uY2F0KG9EYXRhU2lkZUVmZmVjdC50YXJnZXRFbnRpdGllcyk7XG5cdFx0XHRcdFx0aWYgKHRyaWdnZXJBY3Rpb24pIHtcblx0XHRcdFx0XHRcdHRyaWdnZXJBY3Rpb25zLmFkZCh0cmlnZ2VyQWN0aW9uKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRjb25zdCBzaWRlRWZmZWN0c1RhcmdldHMgPSB0aGlzLnJlbW92ZUR1cGxpY2F0ZVRhcmdldHMoeyB0YXJnZXRQcm9wZXJ0aWVzLCB0YXJnZXRFbnRpdGllcyB9KTtcblx0XHRcdFx0c2lkZUVmZmVjdHNbYWN0aW9uTmFtZV0gPSB7XG5cdFx0XHRcdFx0cGF0aEV4cHJlc3Npb25zOiBbLi4uc2lkZUVmZmVjdHNUYXJnZXRzLnRhcmdldFByb3BlcnRpZXMsIC4uLnNpZGVFZmZlY3RzVGFyZ2V0cy50YXJnZXRFbnRpdGllc10sXG5cdFx0XHRcdFx0dHJpZ2dlckFjdGlvbnM6IEFycmF5LmZyb20odHJpZ2dlckFjdGlvbnMpXG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIHNpZGVFZmZlY3RzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgU2lkZUVmZmVjdHMgZW50aXR5IHR5cGUgdGhhdCBjb21lIGZyb20gYW4gT0RhdGEgU2VydmljZVxuXHQgKiBJbnRlcm5hbCByb3V0aW5lIHRvIGdldCwgZnJvbSBjb252ZXJ0ZWQgb0RhdGEgbWV0YU1vZGVsLCBTaWRlRWZmZWN0c1xuXHQgKiByZWxhdGVkIHRvIGEgc3BlY2lmaWMgZW50aXR5IHR5cGUgYW5kIHRvIGNvbnZlcnQgdGhlc2UgU2lkZUVmZmVjdHMgd2l0aFxuXHQgKiBleHBlY3RlZCBmb3JtYXQuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZSBFbnRpdHkgdHlwZVxuXHQgKiBAcmV0dXJucyBFbnRpdHkgdHlwZSBTaWRlRWZmZWN0cyBkaWN0aW9uYXJ5XG5cdCAqL1xuXHRwcml2YXRlIHJldHJpZXZlT0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhlbnRpdHlUeXBlOiBFbnRpdHlUeXBlKTogUmVjb3JkPHN0cmluZywgT0RhdGFTaWRlRWZmZWN0c1R5cGU+IHtcblx0XHRjb25zdCBlbnRpdHlTaWRlRWZmZWN0czogUmVjb3JkPHN0cmluZywgT0RhdGFTaWRlRWZmZWN0c1R5cGU+ID0ge307XG5cdFx0dGhpcy5nZXRTaWRlRWZmZWN0c0Zyb21Tb3VyY2UoZW50aXR5VHlwZSkuZm9yRWFjaCgoc2lkZUVmZmVjdHMpID0+IHtcblx0XHRcdGVudGl0eVNpZGVFZmZlY3RzW3NpZGVFZmZlY3RzLmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBzaWRlRWZmZWN0cztcblx0XHR9KTtcblx0XHRyZXR1cm4gZW50aXR5U2lkZUVmZmVjdHM7XG5cdH1cblxuXHQvKipcblx0ICogRGVmaW5lcyBhIG1hcCBmb3IgdGhlIFNvdXJjZXMgb2Ygc2lkZUVmZmVjdCBvbiB0aGUgZW50aXR5IHRvIHRyYWNrIHdoZXJlIHRob3NlIHNvdXJjZXMgYXJlIHVzZWQgaW4gU2lkZUVmZmVjdHMgYW5ub3RhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIGVudGl0eVR5cGUgd2UgbG9vayBmb3Igc2lkZSBFZmZlY3RzIGFubm90YXRpb25cblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzU291cmNlcyBUaGUgbWFwcGluZyBvYmplY3QgaW4gY29uc3RydWN0aW9uXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0c1NvdXJjZXMuZW50aXRpZXNcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzU291cmNlcy5wcm9wZXJ0aWVzXG5cdCAqL1xuXHRwcml2YXRlIG1hcFNpZGVFZmZlY3RTb3VyY2VzKFxuXHRcdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdFx0c2lkZUVmZmVjdHNTb3VyY2VzOiB7IGVudGl0aWVzOiBSZWNvcmQ8c3RyaW5nLCBTaWRlRWZmZWN0SW5mb0ZvclNvdXJjZVtdPjsgcHJvcGVydGllczogUmVjb3JkPHN0cmluZywgU2lkZUVmZmVjdEluZm9Gb3JTb3VyY2VbXT4gfVxuXHQpOiB2b2lkIHtcblx0XHRmb3IgKGNvbnN0IHNpZGVFZmZlY3REZWZpbml0aW9uIG9mIHRoaXMuZ2V0U2lkZUVmZmVjdHNBbm5vdGF0aW9uRnJvbVNvdXJjZShlbnRpdHlUeXBlKSkge1xuXHRcdFx0Zm9yIChjb25zdCBzb3VyY2VFbnRpdHkgb2Ygc2lkZUVmZmVjdERlZmluaXRpb24uU291cmNlRW50aXRpZXMgPz8gW10pIHtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0RW50aXR5VHlwZSA9IHNvdXJjZUVudGl0eS52YWx1ZSA/IHNvdXJjZUVudGl0eS4kdGFyZ2V0Py50YXJnZXRUeXBlIDogZW50aXR5VHlwZTtcblx0XHRcdFx0aWYgKHRhcmdldEVudGl0eVR5cGUpIHtcblx0XHRcdFx0XHRpZiAoIXNpZGVFZmZlY3RzU291cmNlcy5lbnRpdGllc1t0YXJnZXRFbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZV0pIHtcblx0XHRcdFx0XHRcdHNpZGVFZmZlY3RzU291cmNlcy5lbnRpdGllc1t0YXJnZXRFbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c2lkZUVmZmVjdHNTb3VyY2VzLmVudGl0aWVzW3RhcmdldEVudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lXS5wdXNoKHtcblx0XHRcdFx0XHRcdGVudGl0eTogZW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWUsXG5cdFx0XHRcdFx0XHRxdWFsaWZpZXI6IHNpZGVFZmZlY3REZWZpbml0aW9uLnF1YWxpZmllclxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBoYXNVbmlxdWVTb3VyY2VQcm9wZXJ0eSA9IHNpZGVFZmZlY3REZWZpbml0aW9uLlNvdXJjZVByb3BlcnRpZXM/Lmxlbmd0aCA9PT0gMTtcblx0XHRcdGZvciAoY29uc3Qgc291cmNlUHJvcGVydHkgb2Ygc2lkZUVmZmVjdERlZmluaXRpb24uU291cmNlUHJvcGVydGllcyA/PyBbXSkge1xuXHRcdFx0XHRpZiAoIXNpZGVFZmZlY3RzU291cmNlcy5wcm9wZXJ0aWVzW3NvdXJjZVByb3BlcnR5LiR0YXJnZXQ/LmZ1bGx5UXVhbGlmaWVkTmFtZV0pIHtcblx0XHRcdFx0XHRzaWRlRWZmZWN0c1NvdXJjZXMucHJvcGVydGllc1tzb3VyY2VQcm9wZXJ0eS4kdGFyZ2V0Py5mdWxseVF1YWxpZmllZE5hbWVdID0gW107XG5cdFx0XHRcdH1cblx0XHRcdFx0c2lkZUVmZmVjdHNTb3VyY2VzLnByb3BlcnRpZXNbc291cmNlUHJvcGVydHkuJHRhcmdldD8uZnVsbHlRdWFsaWZpZWROYW1lXS5wdXNoKHtcblx0XHRcdFx0XHRlbnRpdHk6IGVudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0XHRcdHF1YWxpZmllcjogc2lkZUVmZmVjdERlZmluaXRpb24ucXVhbGlmaWVyLFxuXHRcdFx0XHRcdGhhc1VuaXF1ZVNvdXJjZVByb3BlcnR5XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGZpZWxkR3JvdXBJZCBiYXNlZCBvbiB0aGUgc3RvcmVkIGluZm9ybWF0aW9uIG9uIHRoIHNpZGUgZWZmZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdEluZm9cblx0ICogQHBhcmFtIGlzSW1tZWRpYXRlXG5cdCAqIEByZXR1cm5zIEEgc3RyaW5nIGZvciB0aGUgZmllbGRHcm91cElkLlxuXHQgKi9cblx0cHJpdmF0ZSBnZXRGaWVsZEdyb3VwSWRGb3JTaWRlRWZmZWN0KHNpZGVFZmZlY3RJbmZvOiBTaWRlRWZmZWN0SW5mb0ZvclNvdXJjZSwgaXNJbW1lZGlhdGU6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG5cdFx0Y29uc3Qgc2lkZUVmZmVjdFdpdGhRdWFsaWZpZXIgPSBzaWRlRWZmZWN0SW5mby5xdWFsaWZpZXJcblx0XHRcdD8gYCR7c2lkZUVmZmVjdEluZm8uZW50aXR5fSMke3NpZGVFZmZlY3RJbmZvLnF1YWxpZmllcn1gXG5cdFx0XHQ6IHNpZGVFZmZlY3RJbmZvLmVudGl0eTtcblx0XHRyZXR1cm4gaXNJbW1lZGlhdGUgfHwgc2lkZUVmZmVjdEluZm8uaGFzVW5pcXVlU291cmNlUHJvcGVydHkgPT09IHRydWVcblx0XHRcdD8gYCR7c2lkZUVmZmVjdFdpdGhRdWFsaWZpZXJ9JCRJbW1lZGlhdGVSZXF1ZXN0YFxuXHRcdFx0OiBzaWRlRWZmZWN0V2l0aFF1YWxpZmllcjtcblx0fVxuXG5cdGdldEludGVyZmFjZSgpOiBTaWRlRWZmZWN0c1NlcnZpY2Uge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cbmNsYXNzIFNpZGVFZmZlY3RzU2VydmljZUZhY3RvcnkgZXh0ZW5kcyBTZXJ2aWNlRmFjdG9yeTxTaWRlRWZmZWN0c1NldHRpbmdzPiB7XG5cdGNyZWF0ZUluc3RhbmNlKG9TZXJ2aWNlQ29udGV4dDogU2VydmljZUNvbnRleHQ8U2lkZUVmZmVjdHNTZXR0aW5ncz4pOiBQcm9taXNlPFNpZGVFZmZlY3RzU2VydmljZT4ge1xuXHRcdGNvbnN0IFNpZGVFZmZlY3RzU2VydmljZVNlcnZpY2UgPSBuZXcgU2lkZUVmZmVjdHNTZXJ2aWNlKG9TZXJ2aWNlQ29udGV4dCk7XG5cdFx0cmV0dXJuIFNpZGVFZmZlY3RzU2VydmljZVNlcnZpY2UuaW5pdFByb21pc2U7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2lkZUVmZmVjdHNTZXJ2aWNlRmFjdG9yeTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztNQXdFYUEsa0JBQWtCO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBYzlCO0lBQUEsT0FDQUMsSUFB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