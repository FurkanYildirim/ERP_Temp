/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/UriParameters", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/TypeGuards"], function (UriParameters, MetaModelConverter, TypeGuards) {
  "use strict";

  var isEntitySet = TypeGuards.isEntitySet;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  const ModelHelper = {
    /**
     * Method to determine if the programming model is sticky.
     *
     * @function
     * @name isStickySessionSupported
     * @param metaModel ODataModelMetaModel to check for sticky enabled entity
     * @returns Returns true if sticky, else false
     */
    isStickySessionSupported: function (metaModel) {
      const entityContainer = metaModel.getObject("/");
      for (const entitySetName in entityContainer) {
        if (entityContainer[entitySetName].$kind === "EntitySet" && metaModel.getObject(`/${entitySetName}@com.sap.vocabularies.Session.v1.StickySessionSupported`)) {
          return true;
        }
      }
      return false;
    },
    /**
     * Method to determine if the programming model is draft.
     *
     * @function
     * @name isDraftSupported
     * @param metaModel ODataModelMetaModel of the context for which draft support shall be checked
     * @param path Path for which draft support shall be checked
     * @returns Returns true if draft, else false
     */
    isDraftSupported: function (metaModel, path) {
      const metaContext = metaModel.getMetaContext(path);
      const objectPath = getInvolvedDataModelObjects(metaContext);
      return this.isObjectPathDraftSupported(objectPath);
    },
    /**
     * Checks if draft is supported for the data model object path.
     *
     * @param dataModelObjectPath
     * @returns `true` if it is supported
     */
    isObjectPathDraftSupported: function (dataModelObjectPath) {
      var _dataModelObjectPath$, _dataModelObjectPath$2, _dataModelObjectPath$3, _dataModelObjectPath$4, _dataModelObjectPath$5, _dataModelObjectPath$6, _dataModelObjectPath$7;
      const currentEntitySet = dataModelObjectPath.targetEntitySet;
      const bIsDraftRoot = ModelHelper.isDraftRoot(currentEntitySet);
      const bIsDraftNode = ModelHelper.isDraftNode(currentEntitySet);
      const bIsDraftParentEntityForContainment = (_dataModelObjectPath$ = dataModelObjectPath.targetObject) !== null && _dataModelObjectPath$ !== void 0 && _dataModelObjectPath$.containsTarget && ((_dataModelObjectPath$2 = dataModelObjectPath.startingEntitySet) !== null && _dataModelObjectPath$2 !== void 0 && (_dataModelObjectPath$3 = _dataModelObjectPath$2.annotations) !== null && _dataModelObjectPath$3 !== void 0 && (_dataModelObjectPath$4 = _dataModelObjectPath$3.Common) !== null && _dataModelObjectPath$4 !== void 0 && _dataModelObjectPath$4.DraftRoot || (_dataModelObjectPath$5 = dataModelObjectPath.startingEntitySet) !== null && _dataModelObjectPath$5 !== void 0 && (_dataModelObjectPath$6 = _dataModelObjectPath$5.annotations) !== null && _dataModelObjectPath$6 !== void 0 && (_dataModelObjectPath$7 = _dataModelObjectPath$6.Common) !== null && _dataModelObjectPath$7 !== void 0 && _dataModelObjectPath$7.DraftNode) ? true : false;
      return bIsDraftRoot || bIsDraftNode || !currentEntitySet && bIsDraftParentEntityForContainment;
    },
    /**
     * Method to determine if the service, supports collaboration draft.
     *
     * @function
     * @name isCollaborationDraftSupported
     * @param metaObject MetaObject to be used for determination
     * @param templateInterface API provided by UI5 templating if used
     * @returns Returns true if the service supports collaboration draft, else false
     */
    isCollaborationDraftSupported: function (metaObject, templateInterface) {
      // We'll hide the first version of the collaboration draft behind a URL parameter
      if (UriParameters.fromQuery(window.location.search).get("sap-fe-xx-enableCollaborationDraft") === "true") {
        var _templateInterface$co;
        const oMetaModel = (templateInterface === null || templateInterface === void 0 ? void 0 : (_templateInterface$co = templateInterface.context) === null || _templateInterface$co === void 0 ? void 0 : _templateInterface$co.getModel()) || metaObject;
        const oEntityContainer = oMetaModel.getObject("/");
        for (const sEntitySet in oEntityContainer) {
          if (oEntityContainer[sEntitySet].$kind === "EntitySet" && oMetaModel.getObject(`/${sEntitySet}@com.sap.vocabularies.Common.v1.DraftRoot/ShareAction`)) {
            return true;
          }
        }
      }
      return false;
    },
    /**
     * Method to get the path of the DraftRoot path according to the provided context.
     *
     * @function
     * @name getDraftRootPath
     * @param oContext OdataModel context
     * @returns Returns the path of the draftRoot entity, or undefined if no draftRoot is found
     */
    getDraftRootPath: function (oContext) {
      const oMetaModel = oContext.getModel().getMetaModel();
      const getRootPath = function (sPath, model) {
        var _RegExp$exec;
        let firstIteration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        const sIterationPath = firstIteration ? sPath : (_RegExp$exec = new RegExp(/.*(?=\/)/).exec(sPath)) === null || _RegExp$exec === void 0 ? void 0 : _RegExp$exec[0]; // *Regex to get the ancestor
        if (sIterationPath && sIterationPath !== "/") {
          var _mDataModel$targetEnt, _mDataModel$targetEnt2;
          const sEntityPath = oMetaModel.getMetaPath(sIterationPath);
          const mDataModel = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.getContext(sEntityPath));
          if ((_mDataModel$targetEnt = mDataModel.targetEntitySet) !== null && _mDataModel$targetEnt !== void 0 && (_mDataModel$targetEnt2 = _mDataModel$targetEnt.annotations.Common) !== null && _mDataModel$targetEnt2 !== void 0 && _mDataModel$targetEnt2.DraftRoot) {
            return sIterationPath;
          }
          return getRootPath(sIterationPath, model, false);
        }
        return undefined;
      };
      return getRootPath(oContext.getPath(), oContext.getModel());
    },
    /**
     * Method to get the path of the StickyRoot path according to the provided context.
     *
     * @function
     * @name getStickyRootPath
     * @param oContext OdataModel context
     * @returns Returns the path of the StickyRoot entity, or undefined if no StickyRoot is found
     */
    getStickyRootPath: function (oContext) {
      const oMetaModel = oContext.getModel().getMetaModel();
      const getRootPath = function (sPath, model) {
        var _RegExp$exec2;
        let firstIteration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        const sIterationPath = firstIteration ? sPath : (_RegExp$exec2 = new RegExp(/.*(?=\/)/).exec(sPath)) === null || _RegExp$exec2 === void 0 ? void 0 : _RegExp$exec2[0]; // *Regex to get the ancestor
        if (sIterationPath && sIterationPath !== "/") {
          var _mDataModel$targetEnt3, _mDataModel$targetEnt4, _mDataModel$targetEnt5;
          const sEntityPath = oMetaModel.getMetaPath(sIterationPath);
          const mDataModel = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.getContext(sEntityPath));
          if ((_mDataModel$targetEnt3 = mDataModel.targetEntitySet) !== null && _mDataModel$targetEnt3 !== void 0 && (_mDataModel$targetEnt4 = _mDataModel$targetEnt3.annotations) !== null && _mDataModel$targetEnt4 !== void 0 && (_mDataModel$targetEnt5 = _mDataModel$targetEnt4.Session) !== null && _mDataModel$targetEnt5 !== void 0 && _mDataModel$targetEnt5.StickySessionSupported) {
            return sIterationPath;
          }
          return getRootPath(sIterationPath, model, false);
        }
        return undefined;
      };
      return getRootPath(oContext.getPath(), oContext.getModel());
    },
    /**
     * Returns the path to the target entity set via navigation property binding.
     *
     * @function
     * @name getTargetEntitySet
     * @param oContext Context for which the target entity set will be determined
     * @returns Returns the path to the target entity set
     */
    getTargetEntitySet: function (oContext) {
      const sPath = oContext.getPath();
      if (oContext.getObject("$kind") === "EntitySet" || oContext.getObject("$kind") === "Action" || oContext.getObject("0/$kind") === "Action") {
        return sPath;
      }
      const sEntitySetPath = ModelHelper.getEntitySetPath(sPath);
      return `/${oContext.getObject(sEntitySetPath)}`;
    },
    /**
     * Returns complete path to the entity set via using navigation property binding. Note: To be used only after the metamodel has loaded.
     *
     * @function
     * @name getEntitySetPath
     * @param path Path for which complete entitySet path needs to be determined from entityType path
     * @param odataMetaModel Metamodel to be used.(Optional in normal scenarios, but needed for parameterized service scenarios)
     * @returns Returns complete path to the entity set
     */
    getEntitySetPath: function (path, odataMetaModel) {
      let entitySetPath = "";
      if (!odataMetaModel) {
        // Previous implementation for getting entitySetPath from entityTypePath
        entitySetPath = `/${path.split("/").filter(ModelHelper.filterOutNavPropBinding).join("/$NavigationPropertyBinding/")}`;
      } else {
        // Calculating the entitySetPath from MetaModel.
        const pathParts = path.split("/").filter(ModelHelper.filterOutNavPropBinding);
        if (pathParts.length > 1) {
          const initialPathObject = {
            growingPath: "/",
            pendingNavPropBinding: ""
          };
          const pathObject = pathParts.reduce((pathUnderConstruction, pathPart, idx) => {
            const delimiter = !!idx && "/$NavigationPropertyBinding/" || "";
            let {
              growingPath,
              pendingNavPropBinding
            } = pathUnderConstruction;
            const tempPath = growingPath + delimiter;
            const navPropBindings = odataMetaModel.getObject(tempPath);
            const navPropBindingToCheck = pendingNavPropBinding ? `${pendingNavPropBinding}/${pathPart}` : pathPart;
            if (navPropBindings && Object.keys(navPropBindings).length > 0 && navPropBindings.hasOwnProperty(navPropBindingToCheck)) {
              growingPath = tempPath + navPropBindingToCheck.replace("/", "%2F");
              pendingNavPropBinding = "";
            } else {
              pendingNavPropBinding += pendingNavPropBinding ? `/${pathPart}` : pathPart;
            }
            return {
              growingPath,
              pendingNavPropBinding
            };
          }, initialPathObject);
          entitySetPath = pathObject.growingPath;
        } else {
          entitySetPath = `/${pathParts[0]}`;
        }
      }
      return entitySetPath;
    },
    /**
     * Gets the path for the items property of MultiValueField parameters.
     *
     * @function
     * @name getActionParameterItemsModelPath
     * @param oParameter Action Parameter
     * @returns Returns the complete model path for the items property of MultiValueField parameters
     */
    getActionParameterItemsModelPath: function (oParameter) {
      return oParameter && oParameter.$Name ? `{path: 'mvfview>/${oParameter.$Name}'}` : undefined;
    },
    filterOutNavPropBinding: function (sPathPart) {
      return sPathPart !== "" && sPathPart !== "$NavigationPropertyBinding";
    },
    /**
     * Adds a setProperty to the created binding contexts of the internal JSON model.
     *
     * @function
     * @name enhanceInternalJSONModel
     * @param {sap.ui.model.json.JSONModel} Internal JSON Model which is enhanced
     */

    enhanceInternalJSONModel: function (oInternalModel) {
      const fnBindContext = oInternalModel.bindContext;
      oInternalModel.bindContext = function (sPath, oContext, mParameters) {
        for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
          args[_key - 3] = arguments[_key];
        }
        oContext = fnBindContext.apply(this, [sPath, oContext, mParameters, ...args]);
        const fnGetBoundContext = oContext.getBoundContext;
        oContext.getBoundContext = function () {
          for (var _len2 = arguments.length, subArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            subArgs[_key2] = arguments[_key2];
          }
          const oBoundContext = fnGetBoundContext.apply(this, ...subArgs);
          if (oBoundContext && !oBoundContext.setProperty) {
            oBoundContext.setProperty = function (sSetPropPath, value) {
              if (this.getObject() === undefined) {
                // initialize
                this.getModel().setProperty(this.getPath(), {});
              }
              this.getModel().setProperty(sSetPropPath, value, this);
            };
          }
          return oBoundContext;
        };
        return oContext;
      };
    },
    /**
     * Adds an handler on propertyChange.
     * The property "/editMode" is changed according to property '/isEditable' when this last one is set
     * in order to be compliant with former versions where building blocks use the property "/editMode"
     *
     * @function
     * @name enhanceUiJSONModel
     * @param {sap.ui.model.json.JSONModel} uiModel JSON Model which is enhanced
     * @param {object} library Core library of SAP Fiori elements
     */

    enhanceUiJSONModel: function (uiModel, library) {
      const fnSetProperty = uiModel.setProperty;
      uiModel.setProperty = function () {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        const value = args[1];
        if (args[0] === "/isEditable") {
          uiModel.setProperty("/editMode", value ? library.EditMode.Editable : library.EditMode.Display, args[2], args[3]);
        }
        return fnSetProperty.apply(this, [...args]);
      };
    },
    /**
     * Returns whether filtering on the table is case sensitive.
     *
     * @param oMetaModel The instance of the meta model
     * @returns Returns 'false' if FilterFunctions annotation supports 'tolower', else 'true'
     */
    isFilteringCaseSensitive: function (oMetaModel) {
      if (!oMetaModel) {
        return undefined;
      }
      const aFilterFunctions = oMetaModel.getObject("/@Org.OData.Capabilities.V1.FilterFunctions");
      // Get filter functions defined at EntityContainer and check for existence of 'tolower'
      return aFilterFunctions ? aFilterFunctions.indexOf("tolower") === -1 : true;
    },
    /**
     * Get MetaPath for the context.
     *
     * @param oContext Context to be used
     * @returns Returns the metapath for the context.
     */
    getMetaPathForContext: function (oContext) {
      const oModel = oContext.getModel(),
        oMetaModel = oModel.getMetaModel(),
        sPath = oContext.getPath();
      return oMetaModel && sPath && oMetaModel.getMetaPath(sPath);
    },
    /**
     * Get MetaPath for the context.
     *
     * @param contextPath MetaPath to be used
     * @returns Returns the root entity set path.
     */
    getRootEntitySetPath: function (contextPath) {
      let rootEntitySetPath = "";
      const aPaths = contextPath ? contextPath.split("/") : [];
      if (aPaths.length > 1) {
        rootEntitySetPath = aPaths[1];
      }
      return rootEntitySetPath;
    },
    /**
     * Get MetaPath for the listBinding.
     *
     * @param oView View of the control using listBinding
     * @param vListBinding ODataListBinding object or the binding path for a temporary list binding
     * @returns Returns the metapath for the listbinding.
     */
    getAbsoluteMetaPathForListBinding: function (oView, vListBinding) {
      const oMetaModel = oView.getModel().getMetaModel();
      let sMetaPath;
      if (typeof vListBinding === "string") {
        if (vListBinding.startsWith("/")) {
          // absolute path
          sMetaPath = oMetaModel.getMetaPath(vListBinding);
        } else {
          // relative path
          const oBindingContext = oView.getBindingContext();
          const sRootContextPath = oBindingContext.getPath();
          sMetaPath = oMetaModel.getMetaPath(`${sRootContextPath}/${vListBinding}`);
        }
      } else {
        // we already get a list binding use this one
        const oBinding = vListBinding;
        const oRootBinding = oBinding.getRootBinding();
        if (oBinding === oRootBinding) {
          // absolute path
          sMetaPath = oMetaModel.getMetaPath(oBinding.getPath());
        } else {
          // relative path
          const sRootBindingPath = oRootBinding.getPath();
          const sRelativePath = oBinding.getPath();
          sMetaPath = oMetaModel.getMetaPath(`${sRootBindingPath}/${sRelativePath}`);
        }
      }
      return sMetaPath;
    },
    /**
     * Method to determine whether the argument is a draft root.
     *
     * @function
     * @name isDraftRoot
     * @param entitySet EntitySet | Singleton | undefined
     * @returns Whether the argument is a draft root
     */
    isDraftRoot: function (entitySet) {
      return this.getDraftRoot(entitySet) !== undefined;
    },
    /**
     * Method to determine whether the argument is a draft node.
     *
     * @function
     * @name isDraftNode
     * @param entitySet EntitySet | Singleton | undefined
     * @returns Whether the argument is a draft node
     */
    isDraftNode: function (entitySet) {
      return this.getDraftNode(entitySet) !== undefined;
    },
    /**
     * Method to determine whether the argument is a sticky session root.
     *
     * @function
     * @name isSticky
     * @param entitySet EntitySet | Singleton | undefined
     * @returns Whether the argument is a sticky session root
     */
    isSticky: function (entitySet) {
      return this.getStickySession(entitySet) !== undefined;
    },
    /**
     * Method to determine if entity is updatable or not.
     *
     * @function
     * @name isUpdateHidden
     * @param entitySet EntitySet | Singleton | undefined
     * @param entityType EntityType
     * @returns True if updatable else false
     */
    isUpdateHidden: function (entitySet, entityType) {
      if (isEntitySet(entitySet)) {
        var _entitySet$annotation, _entityType$annotatio;
        return ((_entitySet$annotation = entitySet.annotations.UI) === null || _entitySet$annotation === void 0 ? void 0 : _entitySet$annotation.UpdateHidden) ?? (entityType === null || entityType === void 0 ? void 0 : (_entityType$annotatio = entityType.annotations.UI) === null || _entityType$annotatio === void 0 ? void 0 : _entityType$annotatio.UpdateHidden) ?? false;
      } else {
        return false;
      }
    },
    /**
     * Gets the @Common.DraftRoot annotation if the argument is an EntitySet.
     *
     * @function
     * @name getDraftRoot
     * @param entitySet EntitySet | Singleton | undefined
     * @returns DraftRoot
     */
    getDraftRoot: function (entitySet) {
      var _entitySet$annotation2;
      return isEntitySet(entitySet) ? (_entitySet$annotation2 = entitySet.annotations.Common) === null || _entitySet$annotation2 === void 0 ? void 0 : _entitySet$annotation2.DraftRoot : undefined;
    },
    /**
     * Gets the @Common.DraftNode annotation if the argument is an EntitySet.
     *
     * @function
     * @name getDraftNode
     * @param entitySet EntitySet | Singleton | undefined
     * @returns DraftRoot
     */
    getDraftNode: function (entitySet) {
      var _entitySet$annotation3;
      return isEntitySet(entitySet) ? (_entitySet$annotation3 = entitySet.annotations.Common) === null || _entitySet$annotation3 === void 0 ? void 0 : _entitySet$annotation3.DraftNode : undefined;
    },
    /**
     * Helper method to get sticky session.
     *
     * @function
     * @name getStickySession
     * @param entitySet EntitySet | Singleton | undefined
     * @returns Session StickySessionSupported
     */
    getStickySession: function (entitySet) {
      var _entitySet$annotation4;
      return isEntitySet(entitySet) ? (_entitySet$annotation4 = entitySet.annotations.Session) === null || _entitySet$annotation4 === void 0 ? void 0 : _entitySet$annotation4.StickySessionSupported : undefined;
    },
    /**
     * Method to get the visibility state of delete button.
     *
     * @function
     * @name getDeleteHidden
     * @param entitySet EntitySet | Singleton | undefined
     * @param entityType EntityType
     * @returns True if delete button is hidden
     */
    getDeleteHidden: function (entitySet, entityType) {
      if (isEntitySet(entitySet)) {
        var _entitySet$annotation5, _entityType$annotatio2;
        return ((_entitySet$annotation5 = entitySet.annotations.UI) === null || _entitySet$annotation5 === void 0 ? void 0 : _entitySet$annotation5.DeleteHidden) ?? ((_entityType$annotatio2 = entityType.annotations.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : _entityType$annotatio2.DeleteHidden);
      } else {
        return false;
      }
    }
  };
  return ModelHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNb2RlbEhlbHBlciIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIm1ldGFNb2RlbCIsImVudGl0eUNvbnRhaW5lciIsImdldE9iamVjdCIsImVudGl0eVNldE5hbWUiLCIka2luZCIsImlzRHJhZnRTdXBwb3J0ZWQiLCJwYXRoIiwibWV0YUNvbnRleHQiLCJnZXRNZXRhQ29udGV4dCIsIm9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJpc09iamVjdFBhdGhEcmFmdFN1cHBvcnRlZCIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJjdXJyZW50RW50aXR5U2V0IiwidGFyZ2V0RW50aXR5U2V0IiwiYklzRHJhZnRSb290IiwiaXNEcmFmdFJvb3QiLCJiSXNEcmFmdE5vZGUiLCJpc0RyYWZ0Tm9kZSIsImJJc0RyYWZ0UGFyZW50RW50aXR5Rm9yQ29udGFpbm1lbnQiLCJ0YXJnZXRPYmplY3QiLCJjb250YWluc1RhcmdldCIsInN0YXJ0aW5nRW50aXR5U2V0IiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJEcmFmdFJvb3QiLCJEcmFmdE5vZGUiLCJpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCIsIm1ldGFPYmplY3QiLCJ0ZW1wbGF0ZUludGVyZmFjZSIsIlVyaVBhcmFtZXRlcnMiLCJmcm9tUXVlcnkiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInNlYXJjaCIsImdldCIsIm9NZXRhTW9kZWwiLCJjb250ZXh0IiwiZ2V0TW9kZWwiLCJvRW50aXR5Q29udGFpbmVyIiwic0VudGl0eVNldCIsImdldERyYWZ0Um9vdFBhdGgiLCJvQ29udGV4dCIsImdldE1ldGFNb2RlbCIsImdldFJvb3RQYXRoIiwic1BhdGgiLCJtb2RlbCIsImZpcnN0SXRlcmF0aW9uIiwic0l0ZXJhdGlvblBhdGgiLCJSZWdFeHAiLCJleGVjIiwic0VudGl0eVBhdGgiLCJnZXRNZXRhUGF0aCIsIm1EYXRhTW9kZWwiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJnZXRDb250ZXh0IiwidW5kZWZpbmVkIiwiZ2V0UGF0aCIsImdldFN0aWNreVJvb3RQYXRoIiwiU2Vzc2lvbiIsIlN0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJnZXRUYXJnZXRFbnRpdHlTZXQiLCJzRW50aXR5U2V0UGF0aCIsImdldEVudGl0eVNldFBhdGgiLCJvZGF0YU1ldGFNb2RlbCIsImVudGl0eVNldFBhdGgiLCJzcGxpdCIsImZpbHRlciIsImZpbHRlck91dE5hdlByb3BCaW5kaW5nIiwiam9pbiIsInBhdGhQYXJ0cyIsImxlbmd0aCIsImluaXRpYWxQYXRoT2JqZWN0IiwiZ3Jvd2luZ1BhdGgiLCJwZW5kaW5nTmF2UHJvcEJpbmRpbmciLCJwYXRoT2JqZWN0IiwicmVkdWNlIiwicGF0aFVuZGVyQ29uc3RydWN0aW9uIiwicGF0aFBhcnQiLCJpZHgiLCJkZWxpbWl0ZXIiLCJ0ZW1wUGF0aCIsIm5hdlByb3BCaW5kaW5ncyIsIm5hdlByb3BCaW5kaW5nVG9DaGVjayIsIk9iamVjdCIsImtleXMiLCJoYXNPd25Qcm9wZXJ0eSIsInJlcGxhY2UiLCJnZXRBY3Rpb25QYXJhbWV0ZXJJdGVtc01vZGVsUGF0aCIsIm9QYXJhbWV0ZXIiLCIkTmFtZSIsInNQYXRoUGFydCIsImVuaGFuY2VJbnRlcm5hbEpTT05Nb2RlbCIsIm9JbnRlcm5hbE1vZGVsIiwiZm5CaW5kQ29udGV4dCIsImJpbmRDb250ZXh0IiwibVBhcmFtZXRlcnMiLCJhcmdzIiwiYXBwbHkiLCJmbkdldEJvdW5kQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsInN1YkFyZ3MiLCJvQm91bmRDb250ZXh0Iiwic2V0UHJvcGVydHkiLCJzU2V0UHJvcFBhdGgiLCJ2YWx1ZSIsImVuaGFuY2VVaUpTT05Nb2RlbCIsInVpTW9kZWwiLCJsaWJyYXJ5IiwiZm5TZXRQcm9wZXJ0eSIsIkVkaXRNb2RlIiwiRWRpdGFibGUiLCJEaXNwbGF5IiwiaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlIiwiYUZpbHRlckZ1bmN0aW9ucyIsImluZGV4T2YiLCJnZXRNZXRhUGF0aEZvckNvbnRleHQiLCJvTW9kZWwiLCJnZXRSb290RW50aXR5U2V0UGF0aCIsImNvbnRleHRQYXRoIiwicm9vdEVudGl0eVNldFBhdGgiLCJhUGF0aHMiLCJnZXRBYnNvbHV0ZU1ldGFQYXRoRm9yTGlzdEJpbmRpbmciLCJvVmlldyIsInZMaXN0QmluZGluZyIsInNNZXRhUGF0aCIsInN0YXJ0c1dpdGgiLCJvQmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsInNSb290Q29udGV4dFBhdGgiLCJvQmluZGluZyIsIm9Sb290QmluZGluZyIsImdldFJvb3RCaW5kaW5nIiwic1Jvb3RCaW5kaW5nUGF0aCIsInNSZWxhdGl2ZVBhdGgiLCJlbnRpdHlTZXQiLCJnZXREcmFmdFJvb3QiLCJnZXREcmFmdE5vZGUiLCJpc1N0aWNreSIsImdldFN0aWNreVNlc3Npb24iLCJpc1VwZGF0ZUhpZGRlbiIsImVudGl0eVR5cGUiLCJpc0VudGl0eVNldCIsIlVJIiwiVXBkYXRlSGlkZGVuIiwiZ2V0RGVsZXRlSGlkZGVuIiwiRGVsZXRlSGlkZGVuIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNb2RlbEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBUaGlzIGNsYXNzIGNvbnRhaW5zIGhlbHBlcnMgdG8gYmUgdXNlZCBhdCBydW50aW1lIHRvIHJldHJpZXZlIGZ1cnRoZXIgaW5mb3JtYXRpb24gb24gdGhlIG1vZGVsICovXG5pbXBvcnQgdHlwZSB7IEVudGl0eVNldCwgRW50aXR5VHlwZSwgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWUsIFNpbmdsZXRvbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBEcmFmdE5vZGUsIERyYWZ0Um9vdCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSB7IFN0aWNreVNlc3Npb25TdXBwb3J0ZWQgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1Nlc3Npb25cIjtcbmltcG9ydCB0eXBlIHsgRGVsZXRlSGlkZGVuIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IFVyaVBhcmFtZXRlcnMgZnJvbSBcInNhcC9iYXNlL3V0aWwvVXJpUGFyYW1ldGVyc1wiO1xuaW1wb3J0IHsgRkVWaWV3IH0gZnJvbSBcInNhcC9mZS9jb3JlL0Jhc2VDb250cm9sbGVyXCI7XG5pbXBvcnQgKiBhcyBNZXRhTW9kZWxDb252ZXJ0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGlzRW50aXR5U2V0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHR5cGUgQmFzZUNvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCIuLi90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcblxuY29uc3QgTW9kZWxIZWxwZXIgPSB7XG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGV0ZXJtaW5lIGlmIHRoZSBwcm9ncmFtbWluZyBtb2RlbCBpcyBzdGlja3kuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWRcblx0ICogQHBhcmFtIG1ldGFNb2RlbCBPRGF0YU1vZGVsTWV0YU1vZGVsIHRvIGNoZWNrIGZvciBzdGlja3kgZW5hYmxlZCBlbnRpdHlcblx0ICogQHJldHVybnMgUmV0dXJucyB0cnVlIGlmIHN0aWNreSwgZWxzZSBmYWxzZVxuXHQgKi9cblx0aXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkOiBmdW5jdGlvbiAobWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCkge1xuXHRcdGNvbnN0IGVudGl0eUNvbnRhaW5lciA9IG1ldGFNb2RlbC5nZXRPYmplY3QoXCIvXCIpO1xuXHRcdGZvciAoY29uc3QgZW50aXR5U2V0TmFtZSBpbiBlbnRpdHlDb250YWluZXIpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0ZW50aXR5Q29udGFpbmVyW2VudGl0eVNldE5hbWVdLiRraW5kID09PSBcIkVudGl0eVNldFwiICYmXG5cdFx0XHRcdG1ldGFNb2RlbC5nZXRPYmplY3QoYC8ke2VudGl0eVNldE5hbWV9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZGApXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGRldGVybWluZSBpZiB0aGUgcHJvZ3JhbW1pbmcgbW9kZWwgaXMgZHJhZnQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc0RyYWZ0U3VwcG9ydGVkXG5cdCAqIEBwYXJhbSBtZXRhTW9kZWwgT0RhdGFNb2RlbE1ldGFNb2RlbCBvZiB0aGUgY29udGV4dCBmb3Igd2hpY2ggZHJhZnQgc3VwcG9ydCBzaGFsbCBiZSBjaGVja2VkXG5cdCAqIEBwYXJhbSBwYXRoIFBhdGggZm9yIHdoaWNoIGRyYWZ0IHN1cHBvcnQgc2hhbGwgYmUgY2hlY2tlZFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgZHJhZnQsIGVsc2UgZmFsc2Vcblx0ICovXG5cdGlzRHJhZnRTdXBwb3J0ZWQ6IGZ1bmN0aW9uIChtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBwYXRoOiBzdHJpbmcpIHtcblx0XHRjb25zdCBtZXRhQ29udGV4dCA9IG1ldGFNb2RlbC5nZXRNZXRhQ29udGV4dChwYXRoKTtcblx0XHRjb25zdCBvYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG1ldGFDb250ZXh0KTtcblx0XHRyZXR1cm4gdGhpcy5pc09iamVjdFBhdGhEcmFmdFN1cHBvcnRlZChvYmplY3RQYXRoKTtcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGRyYWZ0IGlzIHN1cHBvcnRlZCBmb3IgdGhlIGRhdGEgbW9kZWwgb2JqZWN0IHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRhTW9kZWxPYmplY3RQYXRoXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBzdXBwb3J0ZWRcblx0ICovXG5cdGlzT2JqZWN0UGF0aERyYWZ0U3VwcG9ydGVkOiBmdW5jdGlvbiAoZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGN1cnJlbnRFbnRpdHlTZXQgPSBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVNldCBhcyBFbnRpdHlTZXQ7XG5cdFx0Y29uc3QgYklzRHJhZnRSb290ID0gTW9kZWxIZWxwZXIuaXNEcmFmdFJvb3QoY3VycmVudEVudGl0eVNldCk7XG5cdFx0Y29uc3QgYklzRHJhZnROb2RlID0gTW9kZWxIZWxwZXIuaXNEcmFmdE5vZGUoY3VycmVudEVudGl0eVNldCk7XG5cdFx0Y29uc3QgYklzRHJhZnRQYXJlbnRFbnRpdHlGb3JDb250YWlubWVudCA9XG5cdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uY29udGFpbnNUYXJnZXQgJiZcblx0XHRcdCgoZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldCBhcyBFbnRpdHlTZXQpPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5EcmFmdFJvb3QgfHxcblx0XHRcdFx0KGRhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uRHJhZnROb2RlKVxuXHRcdFx0XHQ/IHRydWVcblx0XHRcdFx0OiBmYWxzZTtcblxuXHRcdHJldHVybiBiSXNEcmFmdFJvb3QgfHwgYklzRHJhZnROb2RlIHx8ICghY3VycmVudEVudGl0eVNldCAmJiBiSXNEcmFmdFBhcmVudEVudGl0eUZvckNvbnRhaW5tZW50KTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGRldGVybWluZSBpZiB0aGUgc2VydmljZSwgc3VwcG9ydHMgY29sbGFib3JhdGlvbiBkcmFmdC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkXG5cdCAqIEBwYXJhbSBtZXRhT2JqZWN0IE1ldGFPYmplY3QgdG8gYmUgdXNlZCBmb3IgZGV0ZXJtaW5hdGlvblxuXHQgKiBAcGFyYW0gdGVtcGxhdGVJbnRlcmZhY2UgQVBJIHByb3ZpZGVkIGJ5IFVJNSB0ZW1wbGF0aW5nIGlmIHVzZWRcblx0ICogQHJldHVybnMgUmV0dXJucyB0cnVlIGlmIHRoZSBzZXJ2aWNlIHN1cHBvcnRzIGNvbGxhYm9yYXRpb24gZHJhZnQsIGVsc2UgZmFsc2Vcblx0ICovXG5cdGlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkOiBmdW5jdGlvbiAobWV0YU9iamVjdDogYW55LCB0ZW1wbGF0ZUludGVyZmFjZT86IGFueSkge1xuXHRcdC8vIFdlJ2xsIGhpZGUgdGhlIGZpcnN0IHZlcnNpb24gb2YgdGhlIGNvbGxhYm9yYXRpb24gZHJhZnQgYmVoaW5kIGEgVVJMIHBhcmFtZXRlclxuXHRcdGlmIChVcmlQYXJhbWV0ZXJzLmZyb21RdWVyeSh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoXCJzYXAtZmUteHgtZW5hYmxlQ29sbGFib3JhdGlvbkRyYWZ0XCIpID09PSBcInRydWVcIikge1xuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9ICh0ZW1wbGF0ZUludGVyZmFjZT8uY29udGV4dD8uZ2V0TW9kZWwoKSB8fCBtZXRhT2JqZWN0KSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRcdGNvbnN0IG9FbnRpdHlDb250YWluZXIgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcIi9cIik7XG5cdFx0XHRmb3IgKGNvbnN0IHNFbnRpdHlTZXQgaW4gb0VudGl0eUNvbnRhaW5lcikge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0b0VudGl0eUNvbnRhaW5lcltzRW50aXR5U2V0XS4ka2luZCA9PT0gXCJFbnRpdHlTZXRcIiAmJlxuXHRcdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtzRW50aXR5U2V0fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290L1NoYXJlQWN0aW9uYClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBwYXRoIG9mIHRoZSBEcmFmdFJvb3QgcGF0aCBhY2NvcmRpbmcgdG8gdGhlIHByb3ZpZGVkIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXREcmFmdFJvb3RQYXRoXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBPZGF0YU1vZGVsIGNvbnRleHRcblx0ICogQHJldHVybnMgUmV0dXJucyB0aGUgcGF0aCBvZiB0aGUgZHJhZnRSb290IGVudGl0eSwgb3IgdW5kZWZpbmVkIGlmIG5vIGRyYWZ0Um9vdCBpcyBmb3VuZFxuXHQgKi9cblx0Z2V0RHJhZnRSb290UGF0aDogZnVuY3Rpb24gKG9Db250ZXh0OiBDb250ZXh0KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBnZXRSb290UGF0aCA9IGZ1bmN0aW9uIChzUGF0aDogc3RyaW5nLCBtb2RlbDogT0RhdGFNb2RlbCwgZmlyc3RJdGVyYXRpb24gPSB0cnVlKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRcdGNvbnN0IHNJdGVyYXRpb25QYXRoID0gZmlyc3RJdGVyYXRpb24gPyBzUGF0aCA6IG5ldyBSZWdFeHAoLy4qKD89XFwvKS8pLmV4ZWMoc1BhdGgpPy5bMF07IC8vICpSZWdleCB0byBnZXQgdGhlIGFuY2VzdG9yXG5cdFx0XHRpZiAoc0l0ZXJhdGlvblBhdGggJiYgc0l0ZXJhdGlvblBhdGggIT09IFwiL1wiKSB7XG5cdFx0XHRcdGNvbnN0IHNFbnRpdHlQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChzSXRlcmF0aW9uUGF0aCk7XG5cdFx0XHRcdGNvbnN0IG1EYXRhTW9kZWwgPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9NZXRhTW9kZWwuZ2V0Q29udGV4dChzRW50aXR5UGF0aCkpO1xuXHRcdFx0XHRpZiAoKG1EYXRhTW9kZWwudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zLkNvbW1vbj8uRHJhZnRSb290KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHNJdGVyYXRpb25QYXRoO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBnZXRSb290UGF0aChzSXRlcmF0aW9uUGF0aCwgbW9kZWwsIGZhbHNlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fTtcblx0XHRyZXR1cm4gZ2V0Um9vdFBhdGgob0NvbnRleHQuZ2V0UGF0aCgpLCBvQ29udGV4dC5nZXRNb2RlbCgpKTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgcGF0aCBvZiB0aGUgU3RpY2t5Um9vdCBwYXRoIGFjY29yZGluZyB0byB0aGUgcHJvdmlkZWQgY29udGV4dC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFN0aWNreVJvb3RQYXRoXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBPZGF0YU1vZGVsIGNvbnRleHRcblx0ICogQHJldHVybnMgUmV0dXJucyB0aGUgcGF0aCBvZiB0aGUgU3RpY2t5Um9vdCBlbnRpdHksIG9yIHVuZGVmaW5lZCBpZiBubyBTdGlja3lSb290IGlzIGZvdW5kXG5cdCAqL1xuXHRnZXRTdGlja3lSb290UGF0aDogZnVuY3Rpb24gKG9Db250ZXh0OiBDb250ZXh0KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBnZXRSb290UGF0aCA9IGZ1bmN0aW9uIChzUGF0aDogc3RyaW5nLCBtb2RlbDogT0RhdGFNb2RlbCwgZmlyc3RJdGVyYXRpb24gPSB0cnVlKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRcdGNvbnN0IHNJdGVyYXRpb25QYXRoID0gZmlyc3RJdGVyYXRpb24gPyBzUGF0aCA6IG5ldyBSZWdFeHAoLy4qKD89XFwvKS8pLmV4ZWMoc1BhdGgpPy5bMF07IC8vICpSZWdleCB0byBnZXQgdGhlIGFuY2VzdG9yXG5cdFx0XHRpZiAoc0l0ZXJhdGlvblBhdGggJiYgc0l0ZXJhdGlvblBhdGggIT09IFwiL1wiKSB7XG5cdFx0XHRcdGNvbnN0IHNFbnRpdHlQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChzSXRlcmF0aW9uUGF0aCk7XG5cdFx0XHRcdGNvbnN0IG1EYXRhTW9kZWwgPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9NZXRhTW9kZWwuZ2V0Q29udGV4dChzRW50aXR5UGF0aCkpO1xuXHRcdFx0XHRpZiAoKG1EYXRhTW9kZWwudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5TZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHNJdGVyYXRpb25QYXRoO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBnZXRSb290UGF0aChzSXRlcmF0aW9uUGF0aCwgbW9kZWwsIGZhbHNlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fTtcblx0XHRyZXR1cm4gZ2V0Um9vdFBhdGgob0NvbnRleHQuZ2V0UGF0aCgpLCBvQ29udGV4dC5nZXRNb2RlbCgpKTtcblx0fSxcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHBhdGggdG8gdGhlIHRhcmdldCBlbnRpdHkgc2V0IHZpYSBuYXZpZ2F0aW9uIHByb3BlcnR5IGJpbmRpbmcuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRUYXJnZXRFbnRpdHlTZXRcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSB0YXJnZXQgZW50aXR5IHNldCB3aWxsIGJlIGRldGVybWluZWRcblx0ICogQHJldHVybnMgUmV0dXJucyB0aGUgcGF0aCB0byB0aGUgdGFyZ2V0IGVudGl0eSBzZXRcblx0ICovXG5cdGdldFRhcmdldEVudGl0eVNldDogZnVuY3Rpb24gKG9Db250ZXh0OiBCYXNlQ29udGV4dCkge1xuXHRcdGNvbnN0IHNQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGlmIChcblx0XHRcdG9Db250ZXh0LmdldE9iamVjdChcIiRraW5kXCIpID09PSBcIkVudGl0eVNldFwiIHx8XG5cdFx0XHRvQ29udGV4dC5nZXRPYmplY3QoXCIka2luZFwiKSA9PT0gXCJBY3Rpb25cIiB8fFxuXHRcdFx0b0NvbnRleHQuZ2V0T2JqZWN0KFwiMC8ka2luZFwiKSA9PT0gXCJBY3Rpb25cIlxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHNQYXRoO1xuXHRcdH1cblx0XHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IE1vZGVsSGVscGVyLmdldEVudGl0eVNldFBhdGgoc1BhdGgpO1xuXHRcdHJldHVybiBgLyR7b0NvbnRleHQuZ2V0T2JqZWN0KHNFbnRpdHlTZXRQYXRoKX1gO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGNvbXBsZXRlIHBhdGggdG8gdGhlIGVudGl0eSBzZXQgdmlhIHVzaW5nIG5hdmlnYXRpb24gcHJvcGVydHkgYmluZGluZy4gTm90ZTogVG8gYmUgdXNlZCBvbmx5IGFmdGVyIHRoZSBtZXRhbW9kZWwgaGFzIGxvYWRlZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEVudGl0eVNldFBhdGhcblx0ICogQHBhcmFtIHBhdGggUGF0aCBmb3Igd2hpY2ggY29tcGxldGUgZW50aXR5U2V0IHBhdGggbmVlZHMgdG8gYmUgZGV0ZXJtaW5lZCBmcm9tIGVudGl0eVR5cGUgcGF0aFxuXHQgKiBAcGFyYW0gb2RhdGFNZXRhTW9kZWwgTWV0YW1vZGVsIHRvIGJlIHVzZWQuKE9wdGlvbmFsIGluIG5vcm1hbCBzY2VuYXJpb3MsIGJ1dCBuZWVkZWQgZm9yIHBhcmFtZXRlcml6ZWQgc2VydmljZSBzY2VuYXJpb3MpXG5cdCAqIEByZXR1cm5zIFJldHVybnMgY29tcGxldGUgcGF0aCB0byB0aGUgZW50aXR5IHNldFxuXHQgKi9cblx0Z2V0RW50aXR5U2V0UGF0aDogZnVuY3Rpb24gKHBhdGg6IHN0cmluZywgb2RhdGFNZXRhTW9kZWw/OiBPRGF0YU1ldGFNb2RlbCkge1xuXHRcdGxldCBlbnRpdHlTZXRQYXRoOiBzdHJpbmcgPSBcIlwiO1xuXHRcdGlmICghb2RhdGFNZXRhTW9kZWwpIHtcblx0XHRcdC8vIFByZXZpb3VzIGltcGxlbWVudGF0aW9uIGZvciBnZXR0aW5nIGVudGl0eVNldFBhdGggZnJvbSBlbnRpdHlUeXBlUGF0aFxuXHRcdFx0ZW50aXR5U2V0UGF0aCA9IGAvJHtwYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoTW9kZWxIZWxwZXIuZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmcpLmpvaW4oXCIvJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvXCIpfWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIENhbGN1bGF0aW5nIHRoZSBlbnRpdHlTZXRQYXRoIGZyb20gTWV0YU1vZGVsLlxuXHRcdFx0Y29uc3QgcGF0aFBhcnRzID0gcGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKE1vZGVsSGVscGVyLmZpbHRlck91dE5hdlByb3BCaW5kaW5nKTtcblx0XHRcdGlmIChwYXRoUGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRjb25zdCBpbml0aWFsUGF0aE9iamVjdCA9IHtcblx0XHRcdFx0XHRncm93aW5nUGF0aDogXCIvXCIsXG5cdFx0XHRcdFx0cGVuZGluZ05hdlByb3BCaW5kaW5nOiBcIlwiXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y29uc3QgcGF0aE9iamVjdCA9IHBhdGhQYXJ0cy5yZWR1Y2UoKHBhdGhVbmRlckNvbnN0cnVjdGlvbjogYW55LCBwYXRoUGFydDogc3RyaW5nLCBpZHg6IG51bWJlcikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGRlbGltaXRlciA9ICghIWlkeCAmJiBcIi8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZy9cIikgfHwgXCJcIjtcblx0XHRcdFx0XHRsZXQgeyBncm93aW5nUGF0aCwgcGVuZGluZ05hdlByb3BCaW5kaW5nIH0gPSBwYXRoVW5kZXJDb25zdHJ1Y3Rpb247XG5cdFx0XHRcdFx0Y29uc3QgdGVtcFBhdGggPSBncm93aW5nUGF0aCArIGRlbGltaXRlcjtcblx0XHRcdFx0XHRjb25zdCBuYXZQcm9wQmluZGluZ3MgPSBvZGF0YU1ldGFNb2RlbC5nZXRPYmplY3QodGVtcFBhdGgpO1xuXHRcdFx0XHRcdGNvbnN0IG5hdlByb3BCaW5kaW5nVG9DaGVjayA9IHBlbmRpbmdOYXZQcm9wQmluZGluZyA/IGAke3BlbmRpbmdOYXZQcm9wQmluZGluZ30vJHtwYXRoUGFydH1gIDogcGF0aFBhcnQ7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0bmF2UHJvcEJpbmRpbmdzICYmXG5cdFx0XHRcdFx0XHRPYmplY3Qua2V5cyhuYXZQcm9wQmluZGluZ3MpLmxlbmd0aCA+IDAgJiZcblx0XHRcdFx0XHRcdG5hdlByb3BCaW5kaW5ncy5oYXNPd25Qcm9wZXJ0eShuYXZQcm9wQmluZGluZ1RvQ2hlY2spXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRncm93aW5nUGF0aCA9IHRlbXBQYXRoICsgbmF2UHJvcEJpbmRpbmdUb0NoZWNrLnJlcGxhY2UoXCIvXCIsIFwiJTJGXCIpO1xuXHRcdFx0XHRcdFx0cGVuZGluZ05hdlByb3BCaW5kaW5nID0gXCJcIjtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cGVuZGluZ05hdlByb3BCaW5kaW5nICs9IHBlbmRpbmdOYXZQcm9wQmluZGluZyA/IGAvJHtwYXRoUGFydH1gIDogcGF0aFBhcnQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB7IGdyb3dpbmdQYXRoLCBwZW5kaW5nTmF2UHJvcEJpbmRpbmcgfTtcblx0XHRcdFx0fSwgaW5pdGlhbFBhdGhPYmplY3QgYXMgYW55KTtcblxuXHRcdFx0XHRlbnRpdHlTZXRQYXRoID0gcGF0aE9iamVjdC5ncm93aW5nUGF0aDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVudGl0eVNldFBhdGggPSBgLyR7cGF0aFBhcnRzWzBdfWA7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVudGl0eVNldFBhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHBhdGggZm9yIHRoZSBpdGVtcyBwcm9wZXJ0eSBvZiBNdWx0aVZhbHVlRmllbGQgcGFyYW1ldGVycy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEFjdGlvblBhcmFtZXRlckl0ZW1zTW9kZWxQYXRoXG5cdCAqIEBwYXJhbSBvUGFyYW1ldGVyIEFjdGlvbiBQYXJhbWV0ZXJcblx0ICogQHJldHVybnMgUmV0dXJucyB0aGUgY29tcGxldGUgbW9kZWwgcGF0aCBmb3IgdGhlIGl0ZW1zIHByb3BlcnR5IG9mIE11bHRpVmFsdWVGaWVsZCBwYXJhbWV0ZXJzXG5cdCAqL1xuXHRnZXRBY3Rpb25QYXJhbWV0ZXJJdGVtc01vZGVsUGF0aDogZnVuY3Rpb24gKG9QYXJhbWV0ZXI6IGFueSkge1xuXHRcdHJldHVybiBvUGFyYW1ldGVyICYmIG9QYXJhbWV0ZXIuJE5hbWUgPyBge3BhdGg6ICdtdmZ2aWV3Pi8ke29QYXJhbWV0ZXIuJE5hbWV9J31gIDogdW5kZWZpbmVkO1xuXHR9LFxuXG5cdGZpbHRlck91dE5hdlByb3BCaW5kaW5nOiBmdW5jdGlvbiAoc1BhdGhQYXJ0OiBhbnkpIHtcblx0XHRyZXR1cm4gc1BhdGhQYXJ0ICE9PSBcIlwiICYmIHNQYXRoUGFydCAhPT0gXCIkTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgc2V0UHJvcGVydHkgdG8gdGhlIGNyZWF0ZWQgYmluZGluZyBjb250ZXh0cyBvZiB0aGUgaW50ZXJuYWwgSlNPTiBtb2RlbC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGVuaGFuY2VJbnRlcm5hbEpTT05Nb2RlbFxuXHQgKiBAcGFyYW0ge3NhcC51aS5tb2RlbC5qc29uLkpTT05Nb2RlbH0gSW50ZXJuYWwgSlNPTiBNb2RlbCB3aGljaCBpcyBlbmhhbmNlZFxuXHQgKi9cblxuXHRlbmhhbmNlSW50ZXJuYWxKU09OTW9kZWw6IGZ1bmN0aW9uIChvSW50ZXJuYWxNb2RlbDogYW55KSB7XG5cdFx0Y29uc3QgZm5CaW5kQ29udGV4dCA9IG9JbnRlcm5hbE1vZGVsLmJpbmRDb250ZXh0O1xuXHRcdG9JbnRlcm5hbE1vZGVsLmJpbmRDb250ZXh0ID0gZnVuY3Rpb24gKHNQYXRoOiBhbnksIG9Db250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnksIC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0XHRvQ29udGV4dCA9IGZuQmluZENvbnRleHQuYXBwbHkodGhpcywgW3NQYXRoLCBvQ29udGV4dCwgbVBhcmFtZXRlcnMsIC4uLmFyZ3NdKTtcblx0XHRcdGNvbnN0IGZuR2V0Qm91bmRDb250ZXh0ID0gb0NvbnRleHQuZ2V0Qm91bmRDb250ZXh0O1xuXG5cdFx0XHRvQ29udGV4dC5nZXRCb3VuZENvbnRleHQgPSBmdW5jdGlvbiAoLi4uc3ViQXJnczogYW55W10pIHtcblx0XHRcdFx0Y29uc3Qgb0JvdW5kQ29udGV4dCA9IGZuR2V0Qm91bmRDb250ZXh0LmFwcGx5KHRoaXMsIC4uLnN1YkFyZ3MpO1xuXHRcdFx0XHRpZiAob0JvdW5kQ29udGV4dCAmJiAhb0JvdW5kQ29udGV4dC5zZXRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdG9Cb3VuZENvbnRleHQuc2V0UHJvcGVydHkgPSBmdW5jdGlvbiAoc1NldFByb3BQYXRoOiBhbnksIHZhbHVlOiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmdldE9iamVjdCgpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0Ly8gaW5pdGlhbGl6ZVxuXHRcdFx0XHRcdFx0XHR0aGlzLmdldE1vZGVsKCkuc2V0UHJvcGVydHkodGhpcy5nZXRQYXRoKCksIHt9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHRoaXMuZ2V0TW9kZWwoKS5zZXRQcm9wZXJ0eShzU2V0UHJvcFBhdGgsIHZhbHVlLCB0aGlzKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBvQm91bmRDb250ZXh0O1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiBvQ29udGV4dDtcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIGhhbmRsZXIgb24gcHJvcGVydHlDaGFuZ2UuXG5cdCAqIFRoZSBwcm9wZXJ0eSBcIi9lZGl0TW9kZVwiIGlzIGNoYW5nZWQgYWNjb3JkaW5nIHRvIHByb3BlcnR5ICcvaXNFZGl0YWJsZScgd2hlbiB0aGlzIGxhc3Qgb25lIGlzIHNldFxuXHQgKiBpbiBvcmRlciB0byBiZSBjb21wbGlhbnQgd2l0aCBmb3JtZXIgdmVyc2lvbnMgd2hlcmUgYnVpbGRpbmcgYmxvY2tzIHVzZSB0aGUgcHJvcGVydHkgXCIvZWRpdE1vZGVcIlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZW5oYW5jZVVpSlNPTk1vZGVsXG5cdCAqIEBwYXJhbSB7c2FwLnVpLm1vZGVsLmpzb24uSlNPTk1vZGVsfSB1aU1vZGVsIEpTT04gTW9kZWwgd2hpY2ggaXMgZW5oYW5jZWRcblx0ICogQHBhcmFtIHtvYmplY3R9IGxpYnJhcnkgQ29yZSBsaWJyYXJ5IG9mIFNBUCBGaW9yaSBlbGVtZW50c1xuXHQgKi9cblxuXHRlbmhhbmNlVWlKU09OTW9kZWw6IGZ1bmN0aW9uICh1aU1vZGVsOiBKU09OTW9kZWwsIGxpYnJhcnk6IGFueSkge1xuXHRcdGNvbnN0IGZuU2V0UHJvcGVydHkgPSB1aU1vZGVsLnNldFByb3BlcnR5IGFzIGFueTtcblx0XHR1aU1vZGVsLnNldFByb3BlcnR5ID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IGFyZ3NbMV07XG5cdFx0XHRpZiAoYXJnc1swXSA9PT0gXCIvaXNFZGl0YWJsZVwiKSB7XG5cdFx0XHRcdHVpTW9kZWwuc2V0UHJvcGVydHkoXCIvZWRpdE1vZGVcIiwgdmFsdWUgPyBsaWJyYXJ5LkVkaXRNb2RlLkVkaXRhYmxlIDogbGlicmFyeS5FZGl0TW9kZS5EaXNwbGF5LCBhcmdzWzJdLCBhcmdzWzNdKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmblNldFByb3BlcnR5LmFwcGx5KHRoaXMsIFsuLi5hcmdzXSk7XG5cdFx0fTtcblx0fSxcblx0LyoqXG5cdCAqIFJldHVybnMgd2hldGhlciBmaWx0ZXJpbmcgb24gdGhlIHRhYmxlIGlzIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgaW5zdGFuY2Ugb2YgdGhlIG1ldGEgbW9kZWxcblx0ICogQHJldHVybnMgUmV0dXJucyAnZmFsc2UnIGlmIEZpbHRlckZ1bmN0aW9ucyBhbm5vdGF0aW9uIHN1cHBvcnRzICd0b2xvd2VyJywgZWxzZSAndHJ1ZSdcblx0ICovXG5cdGlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZTogZnVuY3Rpb24gKG9NZXRhTW9kZWw6IGFueSkge1xuXHRcdGlmICghb01ldGFNb2RlbCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0Y29uc3QgYUZpbHRlckZ1bmN0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFwiL0BPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlckZ1bmN0aW9uc1wiKTtcblx0XHQvLyBHZXQgZmlsdGVyIGZ1bmN0aW9ucyBkZWZpbmVkIGF0IEVudGl0eUNvbnRhaW5lciBhbmQgY2hlY2sgZm9yIGV4aXN0ZW5jZSBvZiAndG9sb3dlcidcblx0XHRyZXR1cm4gYUZpbHRlckZ1bmN0aW9ucyA/IGFGaWx0ZXJGdW5jdGlvbnMuaW5kZXhPZihcInRvbG93ZXJcIikgPT09IC0xIDogdHJ1ZTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IE1ldGFQYXRoIGZvciB0aGUgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gYmUgdXNlZFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBtZXRhcGF0aCBmb3IgdGhlIGNvbnRleHQuXG5cdCAqL1xuXHRnZXRNZXRhUGF0aEZvckNvbnRleHQ6IGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRyZXR1cm4gb01ldGFNb2RlbCAmJiBzUGF0aCAmJiBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IE1ldGFQYXRoIGZvciB0aGUgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRQYXRoIE1ldGFQYXRoIHRvIGJlIHVzZWRcblx0ICogQHJldHVybnMgUmV0dXJucyB0aGUgcm9vdCBlbnRpdHkgc2V0IHBhdGguXG5cdCAqL1xuXHRnZXRSb290RW50aXR5U2V0UGF0aDogZnVuY3Rpb24gKGNvbnRleHRQYXRoOiBzdHJpbmcpIHtcblx0XHRsZXQgcm9vdEVudGl0eVNldFBhdGggPSBcIlwiO1xuXHRcdGNvbnN0IGFQYXRocyA9IGNvbnRleHRQYXRoID8gY29udGV4dFBhdGguc3BsaXQoXCIvXCIpIDogW107XG5cdFx0aWYgKGFQYXRocy5sZW5ndGggPiAxKSB7XG5cdFx0XHRyb290RW50aXR5U2V0UGF0aCA9IGFQYXRoc1sxXTtcblx0XHR9XG5cdFx0cmV0dXJuIHJvb3RFbnRpdHlTZXRQYXRoO1xuXHR9LFxuXHQvKipcblx0ICogR2V0IE1ldGFQYXRoIGZvciB0aGUgbGlzdEJpbmRpbmcuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVmlldyBWaWV3IG9mIHRoZSBjb250cm9sIHVzaW5nIGxpc3RCaW5kaW5nXG5cdCAqIEBwYXJhbSB2TGlzdEJpbmRpbmcgT0RhdGFMaXN0QmluZGluZyBvYmplY3Qgb3IgdGhlIGJpbmRpbmcgcGF0aCBmb3IgYSB0ZW1wb3JhcnkgbGlzdCBiaW5kaW5nXG5cdCAqIEByZXR1cm5zIFJldHVybnMgdGhlIG1ldGFwYXRoIGZvciB0aGUgbGlzdGJpbmRpbmcuXG5cdCAqL1xuXHRnZXRBYnNvbHV0ZU1ldGFQYXRoRm9yTGlzdEJpbmRpbmc6IGZ1bmN0aW9uIChvVmlldzogRkVWaWV3LCB2TGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcgfCBzdHJpbmcpIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1ZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRsZXQgc01ldGFQYXRoO1xuXG5cdFx0aWYgKHR5cGVvZiB2TGlzdEJpbmRpbmcgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh2TGlzdEJpbmRpbmcuc3RhcnRzV2l0aChcIi9cIikpIHtcblx0XHRcdFx0Ly8gYWJzb2x1dGUgcGF0aFxuXHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHZMaXN0QmluZGluZyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyByZWxhdGl2ZSBwYXRoXG5cdFx0XHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0XHRcdGNvbnN0IHNSb290Q29udGV4dFBhdGggPSBvQmluZGluZ0NvbnRleHQhLmdldFBhdGgoKTtcblx0XHRcdFx0c01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChgJHtzUm9vdENvbnRleHRQYXRofS8ke3ZMaXN0QmluZGluZ31gKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gd2UgYWxyZWFkeSBnZXQgYSBsaXN0IGJpbmRpbmcgdXNlIHRoaXMgb25lXG5cdFx0XHRjb25zdCBvQmluZGluZyA9IHZMaXN0QmluZGluZztcblx0XHRcdGNvbnN0IG9Sb290QmluZGluZyA9IG9CaW5kaW5nLmdldFJvb3RCaW5kaW5nKCk7XG5cdFx0XHRpZiAob0JpbmRpbmcgPT09IG9Sb290QmluZGluZykge1xuXHRcdFx0XHQvLyBhYnNvbHV0ZSBwYXRoXG5cdFx0XHRcdHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0JpbmRpbmcuZ2V0UGF0aCgpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIHJlbGF0aXZlIHBhdGhcblx0XHRcdFx0Y29uc3Qgc1Jvb3RCaW5kaW5nUGF0aCA9IG9Sb290QmluZGluZyEuZ2V0UGF0aCgpO1xuXHRcdFx0XHRjb25zdCBzUmVsYXRpdmVQYXRoID0gb0JpbmRpbmcuZ2V0UGF0aCgpO1xuXHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKGAke3NSb290QmluZGluZ1BhdGh9LyR7c1JlbGF0aXZlUGF0aH1gKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHNNZXRhUGF0aDtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhIGRyYWZ0IHJvb3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc0RyYWZ0Um9vdFxuXHQgKiBAcGFyYW0gZW50aXR5U2V0IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZFxuXHQgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhIGRyYWZ0IHJvb3Rcblx0ICovXG5cdGlzRHJhZnRSb290OiBmdW5jdGlvbiAoZW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWQpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5nZXREcmFmdFJvb3QoZW50aXR5U2V0KSAhPT0gdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEgZHJhZnQgbm9kZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzRHJhZnROb2RlXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkXG5cdCAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEgZHJhZnQgbm9kZVxuXHQgKi9cblx0aXNEcmFmdE5vZGU6IGZ1bmN0aW9uIChlbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmdldERyYWZ0Tm9kZShlbnRpdHlTZXQpICE9PSB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSBzdGlja3kgc2Vzc2lvbiByb290LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNTdGlja3lcblx0ICogQHBhcmFtIGVudGl0eVNldCBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWRcblx0ICogQHJldHVybnMgV2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSBzdGlja3kgc2Vzc2lvbiByb290XG5cdCAqL1xuXHRpc1N0aWNreTogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0U3RpY2t5U2Vzc2lvbihlbnRpdHlTZXQpICE9PSB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgaWYgZW50aXR5IGlzIHVwZGF0YWJsZSBvciBub3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc1VwZGF0ZUhpZGRlblxuXHQgKiBAcGFyYW0gZW50aXR5U2V0IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZFxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZSBFbnRpdHlUeXBlXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgdXBkYXRhYmxlIGVsc2UgZmFsc2Vcblx0ICovXG5cdGlzVXBkYXRlSGlkZGVuOiBmdW5jdGlvbiAoZW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWQsIGVudGl0eVR5cGU6IEVudGl0eVR5cGUpOiBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxib29sZWFuPiB7XG5cdFx0aWYgKGlzRW50aXR5U2V0KGVudGl0eVNldCkpIHtcblx0XHRcdHJldHVybiAoZW50aXR5U2V0LmFubm90YXRpb25zLlVJPy5VcGRhdGVIaWRkZW4gPz9cblx0XHRcdFx0ZW50aXR5VHlwZT8uYW5ub3RhdGlvbnMuVUk/LlVwZGF0ZUhpZGRlbiA/P1xuXHRcdFx0XHRmYWxzZSkgYXMgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8Ym9vbGVhbj47XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBAQ29tbW9uLkRyYWZ0Um9vdCBhbm5vdGF0aW9uIGlmIHRoZSBhcmd1bWVudCBpcyBhbiBFbnRpdHlTZXQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXREcmFmdFJvb3Rcblx0ICogQHBhcmFtIGVudGl0eVNldCBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWRcblx0ICogQHJldHVybnMgRHJhZnRSb290XG5cdCAqL1xuXHRnZXREcmFmdFJvb3Q6IGZ1bmN0aW9uIChlbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCk6IERyYWZ0Um9vdCB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIGlzRW50aXR5U2V0KGVudGl0eVNldCkgPyBlbnRpdHlTZXQuYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdFJvb3QgOiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIEBDb21tb24uRHJhZnROb2RlIGFubm90YXRpb24gaWYgdGhlIGFyZ3VtZW50IGlzIGFuIEVudGl0eVNldC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldERyYWZ0Tm9kZVxuXHQgKiBAcGFyYW0gZW50aXR5U2V0IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZFxuXHQgKiBAcmV0dXJucyBEcmFmdFJvb3Rcblx0ICovXG5cdGdldERyYWZ0Tm9kZTogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkKTogRHJhZnROb2RlIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gaXNFbnRpdHlTZXQoZW50aXR5U2V0KSA/IGVudGl0eVNldC5hbm5vdGF0aW9ucy5Db21tb24/LkRyYWZ0Tm9kZSA6IHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogSGVscGVyIG1ldGhvZCB0byBnZXQgc3RpY2t5IHNlc3Npb24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRTdGlja3lTZXNzaW9uXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkXG5cdCAqIEByZXR1cm5zIFNlc3Npb24gU3RpY2t5U2Vzc2lvblN1cHBvcnRlZFxuXHQgKi9cblx0Z2V0U3RpY2t5U2Vzc2lvbjogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkKTogU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIGlzRW50aXR5U2V0KGVudGl0eVNldCkgPyBlbnRpdHlTZXQuYW5ub3RhdGlvbnMuU2Vzc2lvbj8uU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCA6IHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgdmlzaWJpbGl0eSBzdGF0ZSBvZiBkZWxldGUgYnV0dG9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0RGVsZXRlSGlkZGVuXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlIEVudGl0eVR5cGVcblx0ICogQHJldHVybnMgVHJ1ZSBpZiBkZWxldGUgYnV0dG9uIGlzIGhpZGRlblxuXHQgKi9cblx0Z2V0RGVsZXRlSGlkZGVuOiBmdW5jdGlvbiAoZW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWQsIGVudGl0eVR5cGU6IEVudGl0eVR5cGUpOiBEZWxldGVIaWRkZW4gfCBCb29sZWFuIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAoaXNFbnRpdHlTZXQoZW50aXR5U2V0KSkge1xuXHRcdFx0cmV0dXJuIGVudGl0eVNldC5hbm5vdGF0aW9ucy5VST8uRGVsZXRlSGlkZGVuID8/IGVudGl0eVR5cGUuYW5ub3RhdGlvbnMuVUk/LkRlbGV0ZUhpZGRlbjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IHR5cGUgSW50ZXJuYWxNb2RlbENvbnRleHQgPSB7IGdldE1vZGVsKCk6IEpTT05Nb2RlbCB9ICYgQmFzZUNvbnRleHQgJiB7XG5cdFx0c2V0UHJvcGVydHkoc1BhdGg6IHN0cmluZywgdlZhbHVlOiBhbnkpOiB2b2lkO1xuXHR9O1xuXG5leHBvcnQgZGVmYXVsdCBNb2RlbEhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7O0VBa0JBLE1BQU1BLFdBQVcsR0FBRztJQUNuQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLHdCQUF3QixFQUFFLFVBQVVDLFNBQXlCLEVBQUU7TUFDOUQsTUFBTUMsZUFBZSxHQUFHRCxTQUFTLENBQUNFLFNBQVMsQ0FBQyxHQUFHLENBQUM7TUFDaEQsS0FBSyxNQUFNQyxhQUFhLElBQUlGLGVBQWUsRUFBRTtRQUM1QyxJQUNDQSxlQUFlLENBQUNFLGFBQWEsQ0FBQyxDQUFDQyxLQUFLLEtBQUssV0FBVyxJQUNwREosU0FBUyxDQUFDRSxTQUFTLENBQUUsSUFBR0MsYUFBYyx5REFBd0QsQ0FBQyxFQUM5RjtVQUNELE9BQU8sSUFBSTtRQUNaO01BQ0Q7TUFDQSxPQUFPLEtBQUs7SUFDYixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NFLGdCQUFnQixFQUFFLFVBQVVMLFNBQXlCLEVBQUVNLElBQVksRUFBRTtNQUNwRSxNQUFNQyxXQUFXLEdBQUdQLFNBQVMsQ0FBQ1EsY0FBYyxDQUFDRixJQUFJLENBQUM7TUFDbEQsTUFBTUcsVUFBVSxHQUFHQywyQkFBMkIsQ0FBQ0gsV0FBVyxDQUFDO01BQzNELE9BQU8sSUFBSSxDQUFDSSwwQkFBMEIsQ0FBQ0YsVUFBVSxDQUFDO0lBQ25ELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0UsMEJBQTBCLEVBQUUsVUFBVUMsbUJBQXdDLEVBQVc7TUFBQTtNQUN4RixNQUFNQyxnQkFBZ0IsR0FBR0QsbUJBQW1CLENBQUNFLGVBQTRCO01BQ3pFLE1BQU1DLFlBQVksR0FBR2pCLFdBQVcsQ0FBQ2tCLFdBQVcsQ0FBQ0gsZ0JBQWdCLENBQUM7TUFDOUQsTUFBTUksWUFBWSxHQUFHbkIsV0FBVyxDQUFDb0IsV0FBVyxDQUFDTCxnQkFBZ0IsQ0FBQztNQUM5RCxNQUFNTSxrQ0FBa0MsR0FDdkMseUJBQUFQLG1CQUFtQixDQUFDUSxZQUFZLGtEQUFoQyxzQkFBa0NDLGNBQWMsS0FDL0MsMEJBQUNULG1CQUFtQixDQUFDVSxpQkFBaUIsNkVBQXRDLHVCQUFzREMsV0FBVyw2RUFBakUsdUJBQW1FQyxNQUFNLG1EQUF6RSx1QkFBMkVDLFNBQVMsOEJBQ25GYixtQkFBbUIsQ0FBQ1UsaUJBQWlCLDZFQUF0Qyx1QkFBc0RDLFdBQVcsNkVBQWpFLHVCQUFtRUMsTUFBTSxtREFBekUsdUJBQTJFRSxTQUFTLENBQUMsR0FDbkYsSUFBSSxHQUNKLEtBQUs7TUFFVCxPQUFPWCxZQUFZLElBQUlFLFlBQVksSUFBSyxDQUFDSixnQkFBZ0IsSUFBSU0sa0NBQW1DO0lBQ2pHLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ1EsNkJBQTZCLEVBQUUsVUFBVUMsVUFBZSxFQUFFQyxpQkFBdUIsRUFBRTtNQUNsRjtNQUNBLElBQUlDLGFBQWEsQ0FBQ0MsU0FBUyxDQUFDQyxNQUFNLENBQUNDLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDLENBQUNDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxLQUFLLE1BQU0sRUFBRTtRQUFBO1FBQ3pHLE1BQU1DLFVBQVUsR0FBSSxDQUFBUCxpQkFBaUIsYUFBakJBLGlCQUFpQixnREFBakJBLGlCQUFpQixDQUFFUSxPQUFPLDBEQUExQixzQkFBNEJDLFFBQVEsRUFBRSxLQUFJVixVQUE2QjtRQUMzRixNQUFNVyxnQkFBZ0IsR0FBR0gsVUFBVSxDQUFDbEMsU0FBUyxDQUFDLEdBQUcsQ0FBQztRQUNsRCxLQUFLLE1BQU1zQyxVQUFVLElBQUlELGdCQUFnQixFQUFFO1VBQzFDLElBQ0NBLGdCQUFnQixDQUFDQyxVQUFVLENBQUMsQ0FBQ3BDLEtBQUssS0FBSyxXQUFXLElBQ2xEZ0MsVUFBVSxDQUFDbEMsU0FBUyxDQUFFLElBQUdzQyxVQUFXLHVEQUFzRCxDQUFDLEVBQzFGO1lBQ0QsT0FBTyxJQUFJO1VBQ1o7UUFDRDtNQUNEO01BQ0EsT0FBTyxLQUFLO0lBQ2IsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsZ0JBQWdCLEVBQUUsVUFBVUMsUUFBaUIsRUFBc0I7TUFDbEUsTUFBTU4sVUFBVSxHQUFHTSxRQUFRLENBQUNKLFFBQVEsRUFBRSxDQUFDSyxZQUFZLEVBQUU7TUFDckQsTUFBTUMsV0FBVyxHQUFHLFVBQVVDLEtBQWEsRUFBRUMsS0FBaUIsRUFBNkM7UUFBQTtRQUFBLElBQTNDQyxjQUFjLHVFQUFHLElBQUk7UUFDcEYsTUFBTUMsY0FBYyxHQUFHRCxjQUFjLEdBQUdGLEtBQUssbUJBQUcsSUFBSUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDQyxJQUFJLENBQUNMLEtBQUssQ0FBQyxpREFBbEMsYUFBcUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RixJQUFJRyxjQUFjLElBQUlBLGNBQWMsS0FBSyxHQUFHLEVBQUU7VUFBQTtVQUM3QyxNQUFNRyxXQUFXLEdBQUdmLFVBQVUsQ0FBQ2dCLFdBQVcsQ0FBQ0osY0FBYyxDQUFDO1VBQzFELE1BQU1LLFVBQVUsR0FBR0Msa0JBQWtCLENBQUM1QywyQkFBMkIsQ0FBQzBCLFVBQVUsQ0FBQ21CLFVBQVUsQ0FBQ0osV0FBVyxDQUFDLENBQUM7VUFDckcsNkJBQUtFLFVBQVUsQ0FBQ3ZDLGVBQWUsNEVBQTNCLHNCQUEyQ1MsV0FBVyxDQUFDQyxNQUFNLG1EQUE3RCx1QkFBK0RDLFNBQVMsRUFBRTtZQUM3RSxPQUFPdUIsY0FBYztVQUN0QjtVQUNBLE9BQU9KLFdBQVcsQ0FBQ0ksY0FBYyxFQUFFRixLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ2pEO1FBQ0EsT0FBT1UsU0FBUztNQUNqQixDQUFDO01BQ0QsT0FBT1osV0FBVyxDQUFDRixRQUFRLENBQUNlLE9BQU8sRUFBRSxFQUFFZixRQUFRLENBQUNKLFFBQVEsRUFBRSxDQUFDO0lBQzVELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NvQixpQkFBaUIsRUFBRSxVQUFVaEIsUUFBaUIsRUFBc0I7TUFDbkUsTUFBTU4sVUFBVSxHQUFHTSxRQUFRLENBQUNKLFFBQVEsRUFBRSxDQUFDSyxZQUFZLEVBQUU7TUFDckQsTUFBTUMsV0FBVyxHQUFHLFVBQVVDLEtBQWEsRUFBRUMsS0FBaUIsRUFBNkM7UUFBQTtRQUFBLElBQTNDQyxjQUFjLHVFQUFHLElBQUk7UUFDcEYsTUFBTUMsY0FBYyxHQUFHRCxjQUFjLEdBQUdGLEtBQUssb0JBQUcsSUFBSUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDQyxJQUFJLENBQUNMLEtBQUssQ0FBQyxrREFBbEMsY0FBcUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RixJQUFJRyxjQUFjLElBQUlBLGNBQWMsS0FBSyxHQUFHLEVBQUU7VUFBQTtVQUM3QyxNQUFNRyxXQUFXLEdBQUdmLFVBQVUsQ0FBQ2dCLFdBQVcsQ0FBQ0osY0FBYyxDQUFDO1VBQzFELE1BQU1LLFVBQVUsR0FBR0Msa0JBQWtCLENBQUM1QywyQkFBMkIsQ0FBQzBCLFVBQVUsQ0FBQ21CLFVBQVUsQ0FBQ0osV0FBVyxDQUFDLENBQUM7VUFDckcsOEJBQUtFLFVBQVUsQ0FBQ3ZDLGVBQWUsNkVBQTNCLHVCQUEyQ1MsV0FBVyw2RUFBdEQsdUJBQXdEb0MsT0FBTyxtREFBL0QsdUJBQWlFQyxzQkFBc0IsRUFBRTtZQUM1RixPQUFPWixjQUFjO1VBQ3RCO1VBQ0EsT0FBT0osV0FBVyxDQUFDSSxjQUFjLEVBQUVGLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDakQ7UUFDQSxPQUFPVSxTQUFTO01BQ2pCLENBQUM7TUFDRCxPQUFPWixXQUFXLENBQUNGLFFBQVEsQ0FBQ2UsT0FBTyxFQUFFLEVBQUVmLFFBQVEsQ0FBQ0osUUFBUSxFQUFFLENBQUM7SUFDNUQsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ3VCLGtCQUFrQixFQUFFLFVBQVVuQixRQUFxQixFQUFFO01BQ3BELE1BQU1HLEtBQUssR0FBR0gsUUFBUSxDQUFDZSxPQUFPLEVBQUU7TUFDaEMsSUFDQ2YsUUFBUSxDQUFDeEMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLFdBQVcsSUFDM0N3QyxRQUFRLENBQUN4QyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxJQUN4Q3dDLFFBQVEsQ0FBQ3hDLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxRQUFRLEVBQ3pDO1FBQ0QsT0FBTzJDLEtBQUs7TUFDYjtNQUNBLE1BQU1pQixjQUFjLEdBQUdoRSxXQUFXLENBQUNpRSxnQkFBZ0IsQ0FBQ2xCLEtBQUssQ0FBQztNQUMxRCxPQUFRLElBQUdILFFBQVEsQ0FBQ3hDLFNBQVMsQ0FBQzRELGNBQWMsQ0FBRSxFQUFDO0lBQ2hELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsZ0JBQWdCLEVBQUUsVUFBVXpELElBQVksRUFBRTBELGNBQStCLEVBQUU7TUFDMUUsSUFBSUMsYUFBcUIsR0FBRyxFQUFFO01BQzlCLElBQUksQ0FBQ0QsY0FBYyxFQUFFO1FBQ3BCO1FBQ0FDLGFBQWEsR0FBSSxJQUFHM0QsSUFBSSxDQUFDNEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDQyxNQUFNLENBQUNyRSxXQUFXLENBQUNzRSx1QkFBdUIsQ0FBQyxDQUFDQyxJQUFJLENBQUMsOEJBQThCLENBQUUsRUFBQztNQUN2SCxDQUFDLE1BQU07UUFDTjtRQUNBLE1BQU1DLFNBQVMsR0FBR2hFLElBQUksQ0FBQzRELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQ0MsTUFBTSxDQUFDckUsV0FBVyxDQUFDc0UsdUJBQXVCLENBQUM7UUFDN0UsSUFBSUUsU0FBUyxDQUFDQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQ3pCLE1BQU1DLGlCQUFpQixHQUFHO1lBQ3pCQyxXQUFXLEVBQUUsR0FBRztZQUNoQkMscUJBQXFCLEVBQUU7VUFDeEIsQ0FBQztVQUVELE1BQU1DLFVBQVUsR0FBR0wsU0FBUyxDQUFDTSxNQUFNLENBQUMsQ0FBQ0MscUJBQTBCLEVBQUVDLFFBQWdCLEVBQUVDLEdBQVcsS0FBSztZQUNsRyxNQUFNQyxTQUFTLEdBQUksQ0FBQyxDQUFDRCxHQUFHLElBQUksOEJBQThCLElBQUssRUFBRTtZQUNqRSxJQUFJO2NBQUVOLFdBQVc7Y0FBRUM7WUFBc0IsQ0FBQyxHQUFHRyxxQkFBcUI7WUFDbEUsTUFBTUksUUFBUSxHQUFHUixXQUFXLEdBQUdPLFNBQVM7WUFDeEMsTUFBTUUsZUFBZSxHQUFHbEIsY0FBYyxDQUFDOUQsU0FBUyxDQUFDK0UsUUFBUSxDQUFDO1lBQzFELE1BQU1FLHFCQUFxQixHQUFHVCxxQkFBcUIsR0FBSSxHQUFFQSxxQkFBc0IsSUFBR0ksUUFBUyxFQUFDLEdBQUdBLFFBQVE7WUFDdkcsSUFDQ0ksZUFBZSxJQUNmRSxNQUFNLENBQUNDLElBQUksQ0FBQ0gsZUFBZSxDQUFDLENBQUNYLE1BQU0sR0FBRyxDQUFDLElBQ3ZDVyxlQUFlLENBQUNJLGNBQWMsQ0FBQ0gscUJBQXFCLENBQUMsRUFDcEQ7Y0FDRFYsV0FBVyxHQUFHUSxRQUFRLEdBQUdFLHFCQUFxQixDQUFDSSxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztjQUNsRWIscUJBQXFCLEdBQUcsRUFBRTtZQUMzQixDQUFDLE1BQU07Y0FDTkEscUJBQXFCLElBQUlBLHFCQUFxQixHQUFJLElBQUdJLFFBQVMsRUFBQyxHQUFHQSxRQUFRO1lBQzNFO1lBQ0EsT0FBTztjQUFFTCxXQUFXO2NBQUVDO1lBQXNCLENBQUM7VUFDOUMsQ0FBQyxFQUFFRixpQkFBaUIsQ0FBUTtVQUU1QlAsYUFBYSxHQUFHVSxVQUFVLENBQUNGLFdBQVc7UUFDdkMsQ0FBQyxNQUFNO1VBQ05SLGFBQWEsR0FBSSxJQUFHSyxTQUFTLENBQUMsQ0FBQyxDQUFFLEVBQUM7UUFDbkM7TUFDRDtNQUVBLE9BQU9MLGFBQWE7SUFDckIsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ3VCLGdDQUFnQyxFQUFFLFVBQVVDLFVBQWUsRUFBRTtNQUM1RCxPQUFPQSxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsS0FBSyxHQUFJLG9CQUFtQkQsVUFBVSxDQUFDQyxLQUFNLElBQUcsR0FBR2xDLFNBQVM7SUFDN0YsQ0FBQztJQUVEWSx1QkFBdUIsRUFBRSxVQUFVdUIsU0FBYyxFQUFFO01BQ2xELE9BQU9BLFNBQVMsS0FBSyxFQUFFLElBQUlBLFNBQVMsS0FBSyw0QkFBNEI7SUFDdEUsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztJQUVDQyx3QkFBd0IsRUFBRSxVQUFVQyxjQUFtQixFQUFFO01BQ3hELE1BQU1DLGFBQWEsR0FBR0QsY0FBYyxDQUFDRSxXQUFXO01BQ2hERixjQUFjLENBQUNFLFdBQVcsR0FBRyxVQUFVbEQsS0FBVSxFQUFFSCxRQUFhLEVBQUVzRCxXQUFnQixFQUFrQjtRQUFBLGtDQUFiQyxJQUFJO1VBQUpBLElBQUk7UUFBQTtRQUMxRnZELFFBQVEsR0FBR29ELGFBQWEsQ0FBQ0ksS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDckQsS0FBSyxFQUFFSCxRQUFRLEVBQUVzRCxXQUFXLEVBQUUsR0FBR0MsSUFBSSxDQUFDLENBQUM7UUFDN0UsTUFBTUUsaUJBQWlCLEdBQUd6RCxRQUFRLENBQUMwRCxlQUFlO1FBRWxEMUQsUUFBUSxDQUFDMEQsZUFBZSxHQUFHLFlBQTZCO1VBQUEsbUNBQWhCQyxPQUFPO1lBQVBBLE9BQU87VUFBQTtVQUM5QyxNQUFNQyxhQUFhLEdBQUdILGlCQUFpQixDQUFDRCxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUdHLE9BQU8sQ0FBQztVQUMvRCxJQUFJQyxhQUFhLElBQUksQ0FBQ0EsYUFBYSxDQUFDQyxXQUFXLEVBQUU7WUFDaERELGFBQWEsQ0FBQ0MsV0FBVyxHQUFHLFVBQVVDLFlBQWlCLEVBQUVDLEtBQVUsRUFBRTtjQUNwRSxJQUFJLElBQUksQ0FBQ3ZHLFNBQVMsRUFBRSxLQUFLc0QsU0FBUyxFQUFFO2dCQUNuQztnQkFDQSxJQUFJLENBQUNsQixRQUFRLEVBQUUsQ0FBQ2lFLFdBQVcsQ0FBQyxJQUFJLENBQUM5QyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztjQUNoRDtjQUNBLElBQUksQ0FBQ25CLFFBQVEsRUFBRSxDQUFDaUUsV0FBVyxDQUFDQyxZQUFZLEVBQUVDLEtBQUssRUFBRSxJQUFJLENBQUM7WUFDdkQsQ0FBQztVQUNGO1VBQ0EsT0FBT0gsYUFBYTtRQUNyQixDQUFDO1FBQ0QsT0FBTzVELFFBQVE7TUFDaEIsQ0FBQztJQUNGLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7SUFFQ2dFLGtCQUFrQixFQUFFLFVBQVVDLE9BQWtCLEVBQUVDLE9BQVksRUFBRTtNQUMvRCxNQUFNQyxhQUFhLEdBQUdGLE9BQU8sQ0FBQ0osV0FBa0I7TUFDaERJLE9BQU8sQ0FBQ0osV0FBVyxHQUFHLFlBQTBCO1FBQUEsbUNBQWJOLElBQUk7VUFBSkEsSUFBSTtRQUFBO1FBQ3RDLE1BQU1RLEtBQUssR0FBR1IsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJQSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssYUFBYSxFQUFFO1VBQzlCVSxPQUFPLENBQUNKLFdBQVcsQ0FBQyxXQUFXLEVBQUVFLEtBQUssR0FBR0csT0FBTyxDQUFDRSxRQUFRLENBQUNDLFFBQVEsR0FBR0gsT0FBTyxDQUFDRSxRQUFRLENBQUNFLE9BQU8sRUFBRWYsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakg7UUFDQSxPQUFPWSxhQUFhLENBQUNYLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHRCxJQUFJLENBQUMsQ0FBQztNQUM1QyxDQUFDO0lBQ0YsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDZ0Isd0JBQXdCLEVBQUUsVUFBVTdFLFVBQWUsRUFBRTtNQUNwRCxJQUFJLENBQUNBLFVBQVUsRUFBRTtRQUNoQixPQUFPb0IsU0FBUztNQUNqQjtNQUNBLE1BQU0wRCxnQkFBZ0IsR0FBRzlFLFVBQVUsQ0FBQ2xDLFNBQVMsQ0FBQyw2Q0FBNkMsQ0FBQztNQUM1RjtNQUNBLE9BQU9nSCxnQkFBZ0IsR0FBR0EsZ0JBQWdCLENBQUNDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJO0lBQzVFLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MscUJBQXFCLEVBQUUsVUFBVTFFLFFBQWEsRUFBRTtNQUMvQyxNQUFNMkUsTUFBTSxHQUFHM0UsUUFBUSxDQUFDSixRQUFRLEVBQUU7UUFDakNGLFVBQVUsR0FBR2lGLE1BQU0sQ0FBQzFFLFlBQVksRUFBRTtRQUNsQ0UsS0FBSyxHQUFHSCxRQUFRLENBQUNlLE9BQU8sRUFBRTtNQUMzQixPQUFPckIsVUFBVSxJQUFJUyxLQUFLLElBQUlULFVBQVUsQ0FBQ2dCLFdBQVcsQ0FBQ1AsS0FBSyxDQUFDO0lBQzVELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ3lFLG9CQUFvQixFQUFFLFVBQVVDLFdBQW1CLEVBQUU7TUFDcEQsSUFBSUMsaUJBQWlCLEdBQUcsRUFBRTtNQUMxQixNQUFNQyxNQUFNLEdBQUdGLFdBQVcsR0FBR0EsV0FBVyxDQUFDckQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7TUFDeEQsSUFBSXVELE1BQU0sQ0FBQ2xELE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDdEJpRCxpQkFBaUIsR0FBR0MsTUFBTSxDQUFDLENBQUMsQ0FBQztNQUM5QjtNQUNBLE9BQU9ELGlCQUFpQjtJQUN6QixDQUFDO0lBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0UsaUNBQWlDLEVBQUUsVUFBVUMsS0FBYSxFQUFFQyxZQUF1QyxFQUFFO01BQ3BHLE1BQU14RixVQUFVLEdBQUd1RixLQUFLLENBQUNyRixRQUFRLEVBQUUsQ0FBQ0ssWUFBWSxFQUFFO01BQ2xELElBQUlrRixTQUFTO01BRWIsSUFBSSxPQUFPRCxZQUFZLEtBQUssUUFBUSxFQUFFO1FBQ3JDLElBQUlBLFlBQVksQ0FBQ0UsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1VBQ2pDO1VBQ0FELFNBQVMsR0FBR3pGLFVBQVUsQ0FBQ2dCLFdBQVcsQ0FBQ3dFLFlBQVksQ0FBQztRQUNqRCxDQUFDLE1BQU07VUFDTjtVQUNBLE1BQU1HLGVBQWUsR0FBR0osS0FBSyxDQUFDSyxpQkFBaUIsRUFBRTtVQUNqRCxNQUFNQyxnQkFBZ0IsR0FBR0YsZUFBZSxDQUFFdEUsT0FBTyxFQUFFO1VBQ25Eb0UsU0FBUyxHQUFHekYsVUFBVSxDQUFDZ0IsV0FBVyxDQUFFLEdBQUU2RSxnQkFBaUIsSUFBR0wsWUFBYSxFQUFDLENBQUM7UUFDMUU7TUFDRCxDQUFDLE1BQU07UUFDTjtRQUNBLE1BQU1NLFFBQVEsR0FBR04sWUFBWTtRQUM3QixNQUFNTyxZQUFZLEdBQUdELFFBQVEsQ0FBQ0UsY0FBYyxFQUFFO1FBQzlDLElBQUlGLFFBQVEsS0FBS0MsWUFBWSxFQUFFO1VBQzlCO1VBQ0FOLFNBQVMsR0FBR3pGLFVBQVUsQ0FBQ2dCLFdBQVcsQ0FBQzhFLFFBQVEsQ0FBQ3pFLE9BQU8sRUFBRSxDQUFDO1FBQ3ZELENBQUMsTUFBTTtVQUNOO1VBQ0EsTUFBTTRFLGdCQUFnQixHQUFHRixZQUFZLENBQUUxRSxPQUFPLEVBQUU7VUFDaEQsTUFBTTZFLGFBQWEsR0FBR0osUUFBUSxDQUFDekUsT0FBTyxFQUFFO1VBQ3hDb0UsU0FBUyxHQUFHekYsVUFBVSxDQUFDZ0IsV0FBVyxDQUFFLEdBQUVpRixnQkFBaUIsSUFBR0MsYUFBYyxFQUFDLENBQUM7UUFDM0U7TUFDRDtNQUNBLE9BQU9ULFNBQVM7SUFDakIsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQzdHLFdBQVcsRUFBRSxVQUFVdUgsU0FBNEMsRUFBVztNQUM3RSxPQUFPLElBQUksQ0FBQ0MsWUFBWSxDQUFDRCxTQUFTLENBQUMsS0FBSy9FLFNBQVM7SUFDbEQsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ3RDLFdBQVcsRUFBRSxVQUFVcUgsU0FBNEMsRUFBVztNQUM3RSxPQUFPLElBQUksQ0FBQ0UsWUFBWSxDQUFDRixTQUFTLENBQUMsS0FBSy9FLFNBQVM7SUFDbEQsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ2tGLFFBQVEsRUFBRSxVQUFVSCxTQUE0QyxFQUFXO01BQzFFLE9BQU8sSUFBSSxDQUFDSSxnQkFBZ0IsQ0FBQ0osU0FBUyxDQUFDLEtBQUsvRSxTQUFTO0lBQ3RELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ29GLGNBQWMsRUFBRSxVQUFVTCxTQUE0QyxFQUFFTSxVQUFzQixFQUFvQztNQUNqSSxJQUFJQyxXQUFXLENBQUNQLFNBQVMsQ0FBQyxFQUFFO1FBQUE7UUFDM0IsT0FBUSwwQkFBQUEsU0FBUyxDQUFDaEgsV0FBVyxDQUFDd0gsRUFBRSwwREFBeEIsc0JBQTBCQyxZQUFZLE1BQzdDSCxVQUFVLGFBQVZBLFVBQVUsZ0RBQVZBLFVBQVUsQ0FBRXRILFdBQVcsQ0FBQ3dILEVBQUUsMERBQTFCLHNCQUE0QkMsWUFBWSxLQUN4QyxLQUFLO01BQ1AsQ0FBQyxNQUFNO1FBQ04sT0FBTyxLQUFLO01BQ2I7SUFDRCxDQUFDO0lBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDUixZQUFZLEVBQUUsVUFBVUQsU0FBNEMsRUFBeUI7TUFBQTtNQUM1RixPQUFPTyxXQUFXLENBQUNQLFNBQVMsQ0FBQyw2QkFBR0EsU0FBUyxDQUFDaEgsV0FBVyxDQUFDQyxNQUFNLDJEQUE1Qix1QkFBOEJDLFNBQVMsR0FBRytCLFNBQVM7SUFDcEYsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ2lGLFlBQVksRUFBRSxVQUFVRixTQUE0QyxFQUF5QjtNQUFBO01BQzVGLE9BQU9PLFdBQVcsQ0FBQ1AsU0FBUyxDQUFDLDZCQUFHQSxTQUFTLENBQUNoSCxXQUFXLENBQUNDLE1BQU0sMkRBQTVCLHVCQUE4QkUsU0FBUyxHQUFHOEIsU0FBUztJQUNwRixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDbUYsZ0JBQWdCLEVBQUUsVUFBVUosU0FBNEMsRUFBc0M7TUFBQTtNQUM3RyxPQUFPTyxXQUFXLENBQUNQLFNBQVMsQ0FBQyw2QkFBR0EsU0FBUyxDQUFDaEgsV0FBVyxDQUFDb0MsT0FBTywyREFBN0IsdUJBQStCQyxzQkFBc0IsR0FBR0osU0FBUztJQUNsRyxDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0N5RixlQUFlLEVBQUUsVUFBVVYsU0FBNEMsRUFBRU0sVUFBc0IsRUFBc0M7TUFDcEksSUFBSUMsV0FBVyxDQUFDUCxTQUFTLENBQUMsRUFBRTtRQUFBO1FBQzNCLE9BQU8sMkJBQUFBLFNBQVMsQ0FBQ2hILFdBQVcsQ0FBQ3dILEVBQUUsMkRBQXhCLHVCQUEwQkcsWUFBWSxnQ0FBSUwsVUFBVSxDQUFDdEgsV0FBVyxDQUFDd0gsRUFBRSwyREFBekIsdUJBQTJCRyxZQUFZO01BQ3pGLENBQUMsTUFBTTtRQUNOLE9BQU8sS0FBSztNQUNiO0lBQ0Q7RUFDRCxDQUFDO0VBQUMsT0FNYXBKLFdBQVc7QUFBQSJ9