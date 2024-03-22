/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/formatters/TableFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "../../../helpers/BindingHelper", "../../../helpers/InsightsHelpers", "../../../ManifestSettings"], function (tableFormatters, BindingToolkit, ModelHelper, TypeGuards, DataModelPathHelper, BindingHelper, InsightsHelpers, ManifestSettings) {
  "use strict";

  var _exports = {};
  var TemplateType = ManifestSettings.TemplateType;
  var CreationMode = ManifestSettings.CreationMode;
  var getInsightsVisibility = InsightsHelpers.getInsightsVisibility;
  var UI = BindingHelper.UI;
  var singletonPathVisitor = BindingHelper.singletonPathVisitor;
  var isPathUpdatable = DataModelPathHelper.isPathUpdatable;
  var isPathInsertable = DataModelPathHelper.isPathInsertable;
  var isPathDeletable = DataModelPathHelper.isPathDeletable;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var isEntitySet = TypeGuards.isEntitySet;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var notEqual = BindingToolkit.notEqual;
  var not = BindingToolkit.not;
  var length = BindingToolkit.length;
  var isPathInModelExpression = BindingToolkit.isPathInModelExpression;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var greaterThan = BindingToolkit.greaterThan;
  var greaterOrEqual = BindingToolkit.greaterOrEqual;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var AnnotationHiddenProperty;
  (function (AnnotationHiddenProperty) {
    AnnotationHiddenProperty["CreateHidden"] = "CreateHidden";
    AnnotationHiddenProperty["DeleteHidden"] = "DeleteHidden";
    AnnotationHiddenProperty["UpdateHidden"] = "UpdateHidden";
  })(AnnotationHiddenProperty || (AnnotationHiddenProperty = {}));
  /**
   * Generates the context for the standard actions.
   *
   * @param converterContext
   * @param creationMode
   * @param tableManifestConfiguration
   * @param viewConfiguration
   * @param isInsightsEnabled
   * @returns  The context for table actions
   */
  function generateStandardActionsContext(converterContext, creationMode, tableManifestConfiguration, viewConfiguration, isInsightsEnabled) {
    return {
      collectionPath: getTargetObjectPath(converterContext.getDataModelObjectPath()),
      hiddenAnnotation: {
        create: isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.CreateHidden),
        delete: isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.DeleteHidden),
        update: isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.UpdateHidden)
      },
      creationMode: creationMode,
      isDraftOrStickySupported: isDraftOrStickySupported(converterContext),
      isViewWithMultipleVisualizations: viewConfiguration ? converterContext.getManifestWrapper().hasMultipleVisualizations(viewConfiguration) : false,
      newAction: getNewAction(converterContext),
      tableManifestConfiguration: tableManifestConfiguration,
      restrictions: getRestrictions(converterContext),
      isInsightsEnabled: isInsightsEnabled
    };
  }

  /**
   * Checks if sticky or draft is supported.
   *
   * @param converterContext
   * @returns `true` if it is supported
   */
  _exports.generateStandardActionsContext = generateStandardActionsContext;
  function isDraftOrStickySupported(converterContext) {
    var _dataModelObjectPath$, _dataModelObjectPath$2, _dataModelObjectPath$3;
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    const bIsDraftSupported = ModelHelper.isObjectPathDraftSupported(dataModelObjectPath);
    const bIsStickySessionSupported = (_dataModelObjectPath$ = dataModelObjectPath.startingEntitySet) !== null && _dataModelObjectPath$ !== void 0 && (_dataModelObjectPath$2 = _dataModelObjectPath$.annotations) !== null && _dataModelObjectPath$2 !== void 0 && (_dataModelObjectPath$3 = _dataModelObjectPath$2.Session) !== null && _dataModelObjectPath$3 !== void 0 && _dataModelObjectPath$3.StickySessionSupported ? true : false;
    return bIsDraftSupported || bIsStickySessionSupported;
  }

  /**
   * Gets the configured newAction into annotation.
   *
   * @param converterContext
   * @returns The new action info
   */
  _exports.isDraftOrStickySupported = isDraftOrStickySupported;
  function getNewAction(converterContext) {
    var _currentEntitySet$ann, _currentEntitySet$ann2, _currentEntitySet$ann3, _currentEntitySet$ann4;
    const currentEntitySet = converterContext.getEntitySet();
    const newAction = isEntitySet(currentEntitySet) ? ((_currentEntitySet$ann = currentEntitySet.annotations.Common) === null || _currentEntitySet$ann === void 0 ? void 0 : (_currentEntitySet$ann2 = _currentEntitySet$ann.DraftRoot) === null || _currentEntitySet$ann2 === void 0 ? void 0 : _currentEntitySet$ann2.NewAction) ?? ((_currentEntitySet$ann3 = currentEntitySet.annotations.Session) === null || _currentEntitySet$ann3 === void 0 ? void 0 : (_currentEntitySet$ann4 = _currentEntitySet$ann3.StickySessionSupported) === null || _currentEntitySet$ann4 === void 0 ? void 0 : _currentEntitySet$ann4.NewAction) : undefined;
    const newActionName = newAction === null || newAction === void 0 ? void 0 : newAction.toString();
    if (newActionName) {
      var _converterContext$get, _converterContext$get2, _converterContext$get3, _converterContext$get4;
      let availableProperty = converterContext === null || converterContext === void 0 ? void 0 : (_converterContext$get = converterContext.getEntityType().actions[newActionName]) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.annotations) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.Core) === null || _converterContext$get3 === void 0 ? void 0 : (_converterContext$get4 = _converterContext$get3.OperationAvailable) === null || _converterContext$get4 === void 0 ? void 0 : _converterContext$get4.valueOf();
      availableProperty = availableProperty !== undefined ? availableProperty : true;
      return {
        name: newActionName,
        available: getExpressionFromAnnotation(availableProperty)
      };
    }
    return undefined;
  }

  /**
   * Gets the binding expression for the action visibility configured into annotation.
   *
   * @param converterContext
   * @param sAnnotationTerm
   * @param bWithNavigationPath
   * @returns The binding expression for the action visibility
   */
  _exports.getNewAction = getNewAction;
  function isActionAnnotatedHidden(converterContext, sAnnotationTerm) {
    var _currentEntitySet$ann5;
    let bWithNavigationPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    const currentEntitySet = converterContext.getEntitySet();
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    // Consider only the last level of navigation. The others are already considered in the element binding of the page.
    const visitedNavigationPaths = dataModelObjectPath.navigationProperties.length > 0 && bWithNavigationPath ? [dataModelObjectPath.navigationProperties[dataModelObjectPath.navigationProperties.length - 1].name] : [];
    const actionAnnotationValue = (currentEntitySet === null || currentEntitySet === void 0 ? void 0 : (_currentEntitySet$ann5 = currentEntitySet.annotations.UI) === null || _currentEntitySet$ann5 === void 0 ? void 0 : _currentEntitySet$ann5[sAnnotationTerm]) || false;
    return currentEntitySet ? getExpressionFromAnnotation(actionAnnotationValue, visitedNavigationPaths, undefined, path => singletonPathVisitor(path, converterContext.getConvertedTypes(), visitedNavigationPaths)) : constant(false);
  }

  /**
   * Gets the annotated restrictions for the actions.
   *
   * @param converterContext
   * @returns The restriction information
   */
  _exports.isActionAnnotatedHidden = isActionAnnotatedHidden;
  function getRestrictions(converterContext) {
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    const restrictionsDef = [{
      key: "isInsertable",
      function: isPathInsertable
    }, {
      key: "isUpdatable",
      function: isPathUpdatable
    }, {
      key: "isDeletable",
      function: isPathDeletable
    }];
    const result = {};
    restrictionsDef.forEach(function (def) {
      const defFunction = def["function"];
      result[def.key] = {
        expression: defFunction.apply(null, [dataModelObjectPath, {
          pathVisitor: (path, navigationPaths) => singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths)
        }]),
        navigationExpression: defFunction.apply(null, [dataModelObjectPath, {
          ignoreTargetCollection: true,
          authorizeUnresolvable: true,
          pathVisitor: (path, navigationPaths) => singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths)
        }])
      };
    });
    return result;
  }

  /**
   * Checks if templating for insert/update actions is mandatory.
   *
   * @param standardActionsContext
   * @param isDraftOrSticky
   * @returns True if we need to template insert or update actions, false otherwise
   */
  _exports.getRestrictions = getRestrictions;
  function getInsertUpdateActionsTemplating(standardActionsContext, isDraftOrSticky) {
    return isDraftOrSticky || standardActionsContext.creationMode === CreationMode.External;
  }

  /**
   * Gets the binding expressions for the properties of the 'Create' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The standard action info
   */
  _exports.getInsertUpdateActionsTemplating = getInsertUpdateActionsTemplating;
  function getStandardActionCreate(converterContext, standardActionsContext) {
    const createVisibility = getCreateVisibility(converterContext, standardActionsContext);
    return {
      isTemplated: compileExpression(getCreateTemplating(standardActionsContext, createVisibility)),
      visible: compileExpression(createVisibility),
      enabled: compileExpression(getCreateEnablement(converterContext, standardActionsContext, createVisibility))
    };
  }

  /**
   * Gets the binding expressions for the properties of the 'Delete' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The binding expressions for the properties of the 'Delete' action.
   */
  _exports.getStandardActionCreate = getStandardActionCreate;
  function getStandardActionDelete(converterContext, standardActionsContext) {
    const deleteVisibility = getDeleteVisibility(converterContext, standardActionsContext);
    return {
      isTemplated: compileExpression(getDefaultTemplating(deleteVisibility)),
      visible: compileExpression(deleteVisibility),
      enabled: compileExpression(getDeleteEnablement(converterContext, standardActionsContext, deleteVisibility))
    };
  }

  /**
   * @param converterContext
   * @param standardActionsContext
   * @returns StandardActionConfigType
   */
  _exports.getStandardActionDelete = getStandardActionDelete;
  function getCreationRow(converterContext, standardActionsContext) {
    const creationRowVisibility = getCreateVisibility(converterContext, standardActionsContext, true);
    return {
      isTemplated: compileExpression(getCreateTemplating(standardActionsContext, creationRowVisibility, true)),
      visible: compileExpression(creationRowVisibility),
      enabled: compileExpression(getCreationRowEnablement(converterContext, standardActionsContext, creationRowVisibility))
    };
  }

  /**
   * Gets the binding expressions for the properties of the 'Paste' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param isInsertUpdateActionsTemplated
   * @returns The binding expressions for the properties of the 'Paste' action.
   */
  _exports.getCreationRow = getCreationRow;
  function getStandardActionPaste(converterContext, standardActionsContext, isInsertUpdateActionsTemplated) {
    const createVisibility = getCreateVisibility(converterContext, standardActionsContext);
    const createEnablement = getCreateEnablement(converterContext, standardActionsContext, createVisibility);
    const pasteVisibility = getPasteVisibility(converterContext, standardActionsContext, createVisibility, isInsertUpdateActionsTemplated);
    return {
      visible: compileExpression(pasteVisibility),
      enabled: compileExpression(getPasteEnablement(pasteVisibility, createEnablement))
    };
  }

  /**
   * Gets the binding expressions for the properties of the 'MassEdit' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The binding expressions for the properties of the 'MassEdit' action.
   */
  _exports.getStandardActionPaste = getStandardActionPaste;
  function getStandardActionMassEdit(converterContext, standardActionsContext) {
    const massEditVisibility = getMassEditVisibility(converterContext, standardActionsContext);
    return {
      isTemplated: compileExpression(getDefaultTemplating(massEditVisibility)),
      visible: compileExpression(massEditVisibility),
      enabled: compileExpression(getMassEditEnablement(converterContext, standardActionsContext, massEditVisibility))
    };
  }

  /**
   * Gets the binding expressions for the properties of the 'AddCardsToInsights' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param visualizationPath
   * @returns The binding expressions for the properties of the 'AddCardsToInsights' action.
   */
  _exports.getStandardActionMassEdit = getStandardActionMassEdit;
  function getStandardActionInsights(converterContext, standardActionsContext, visualizationPath) {
    const insightsVisibility = (standardActionsContext.isInsightsEnabled ?? false) && getInsightsVisibility("Table", converterContext, visualizationPath, standardActionsContext);
    return {
      isTemplated: compileExpression(insightsVisibility),
      visible: compileExpression(insightsVisibility),
      enabled: compileExpression(insightsVisibility)
    };
  }

  /**
   * Gets the binding expression for the templating of the 'Create' action.
   *
   * @param standardActionsContext
   * @param createVisibility
   * @param isForCreationRow
   * @returns The create binding expression
   */
  _exports.getStandardActionInsights = getStandardActionInsights;
  function getCreateTemplating(standardActionsContext, createVisibility) {
    let isForCreationRow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    //Templating of Create Button is not done:
    // 	 - If Button is never visible(covered the External create button, new Action)
    //	 - or CreationMode is on CreationRow for Create Button
    //	 - or CreationMode is not on CreationRow for CreationRow Button

    return and(
    //XNOR gate
    or(and(isForCreationRow, standardActionsContext.creationMode === CreationMode.CreationRow), and(!isForCreationRow, standardActionsContext.creationMode !== CreationMode.CreationRow)), or(not(isConstant(createVisibility)), createVisibility));
  }

  /**
   * Gets the binding expression for the templating of the non-Create actions.
   *
   * @param actionVisibility
   * @returns The binding expression for the templating of the non-Create actions.
   */
  _exports.getCreateTemplating = getCreateTemplating;
  function getDefaultTemplating(actionVisibility) {
    return or(not(isConstant(actionVisibility)), actionVisibility);
  }

  /**
   * Gets the binding expression for the 'visible' property of the 'Create' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param isForCreationRow
   * @returns The binding expression for the 'visible' property of the 'Create' action.
   */
  _exports.getDefaultTemplating = getDefaultTemplating;
  function getCreateVisibility(converterContext, standardActionsContext) {
    var _standardActionsConte, _standardActionsConte2;
    let isForCreationRow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const isInsertable = standardActionsContext.restrictions.isInsertable.expression;
    const isCreateHidden = isForCreationRow ? isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.CreateHidden, false) : standardActionsContext.hiddenAnnotation.create;
    const newAction = standardActionsContext.newAction;
    //Create Button is visible:
    // 	 - If the creation mode is external
    //      - If we're on the list report and create is not hidden
    //		- Otherwise this depends on the value of the UI.IsEditable
    //	 - Otherwise
    //		- If any of the following conditions is valid then create button isn't visible
    //			- no newAction available
    //			- It's not insertable and there is not a new action
    //			- create is hidden
    //			- There are multiple visualizations
    //			- It's an Analytical List Page
    //			- Uses InlineCreationRows mode and a Responsive table type, with the parameter inlineCreationRowsHiddenInEditMode to true while not in create mode
    //   - Otherwise
    // 	 	- If we're on the list report ->
    // 	 		- If UI.CreateHidden points to a property path -> provide a negated binding to this path
    // 	 		- Otherwise, create is visible
    // 	 	- Otherwise
    // 	  	 - This depends on the value of the UI.IsEditable
    return ifElse(standardActionsContext.creationMode === CreationMode.External, and(not(isCreateHidden), or(converterContext.getTemplateType() === TemplateType.ListReport, UI.IsEditable)), ifElse(or(and(isConstant(newAction === null || newAction === void 0 ? void 0 : newAction.available), equal(newAction === null || newAction === void 0 ? void 0 : newAction.available, false)), and(isConstant(isInsertable), equal(isInsertable, false), !newAction), and(isConstant(isCreateHidden), equal(isCreateHidden, true)), and(standardActionsContext.creationMode === CreationMode.InlineCreationRows, ((_standardActionsConte = standardActionsContext.tableManifestConfiguration) === null || _standardActionsConte === void 0 ? void 0 : _standardActionsConte.type) === "ResponsiveTable", ifElse((standardActionsContext === null || standardActionsContext === void 0 ? void 0 : (_standardActionsConte2 = standardActionsContext.tableManifestConfiguration) === null || _standardActionsConte2 === void 0 ? void 0 : _standardActionsConte2.inlineCreationRowsHiddenInEditMode) === false, true, UI.IsCreateMode))), false, ifElse(converterContext.getTemplateType() === TemplateType.ListReport, or(not(isPathInModelExpression(isCreateHidden)), not(isCreateHidden)), and(not(isCreateHidden), UI.IsEditable))));
  }

  /**
   * Gets the binding expression for the 'visible' property of the 'Delete' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The binding expression for the 'visible' property of the 'Delete' action.
   */
  _exports.getCreateVisibility = getCreateVisibility;
  function getDeleteVisibility(converterContext, standardActionsContext) {
    const isDeleteHidden = standardActionsContext.hiddenAnnotation.delete;
    const pathDeletableExpression = standardActionsContext.restrictions.isDeletable.expression;

    //Delete Button is visible:
    // 	 Prerequisites:
    //	 - If we're not on ALP
    //   - If restrictions on deletable set to false -> not visible
    //   - Otherwise
    //			- If UI.DeleteHidden is true -> not visible
    //			- Otherwise
    // 	 			- If we're on OP -> depending if UI is editable and restrictions on deletable
    //				- Otherwise
    //				 	- If UI.DeleteHidden points to a property path -> provide a negated binding to this path
    //	 	 		 	- Otherwise, delete is visible

    return ifElse(converterContext.getTemplateType() === TemplateType.AnalyticalListPage, false, ifElse(and(isConstant(pathDeletableExpression), equal(pathDeletableExpression, false)), false, ifElse(and(isConstant(isDeleteHidden), equal(isDeleteHidden, constant(true))), false, ifElse(converterContext.getTemplateType() !== TemplateType.ListReport, and(not(isDeleteHidden), UI.IsEditable), not(and(isPathInModelExpression(isDeleteHidden), isDeleteHidden))))));
  }

  /**
   * Gets the binding expression for the 'visible' property of the 'Paste' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param createVisibility
   * @param isInsertUpdateActionsTemplated
   * @returns The binding expression for the 'visible' property of the 'Paste' action.
   */
  _exports.getDeleteVisibility = getDeleteVisibility;
  function getPasteVisibility(converterContext, standardActionsContext, createVisibility, isInsertUpdateActionsTemplated) {
    // If Create is visible, enablePaste is not disabled into manifest and we are on OP/blocks outside Fiori elements templates
    // Then button will be visible according to insertable restrictions and create visibility
    // Otherwise it's not visible
    return and(notEqual(standardActionsContext.tableManifestConfiguration.enablePaste, false), createVisibility, isInsertUpdateActionsTemplated, [TemplateType.ListReport, TemplateType.AnalyticalListPage].indexOf(converterContext.getTemplateType()) === -1, standardActionsContext.restrictions.isInsertable.expression);
  }

  /**
   * Gets the binding expression for the 'visible' property of the 'MassEdit' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The binding expression for the 'visible' property of the 'MassEdit' action.
   */
  _exports.getPasteVisibility = getPasteVisibility;
  function getMassEditVisibility(converterContext, standardActionsContext) {
    var _standardActionsConte3;
    const isUpdateHidden = standardActionsContext.hiddenAnnotation.update,
      pathUpdatableExpression = standardActionsContext.restrictions.isUpdatable.expression,
      bMassEditEnabledInManifest = ((_standardActionsConte3 = standardActionsContext.tableManifestConfiguration) === null || _standardActionsConte3 === void 0 ? void 0 : _standardActionsConte3.enableMassEdit) || false;
    const templateBindingExpression = converterContext.getTemplateType() === TemplateType.ObjectPage ? UI.IsEditable : converterContext.getTemplateType() === TemplateType.ListReport;
    //MassEdit is visible
    // If
    //		- there is no static restrictions set to false
    //		- and enableMassEdit is not set to false into the manifest
    //		- and the selectionMode is relevant
    //	Then MassEdit is always visible in LR or dynamically visible in OP according to ui>Editable and hiddenAnnotation
    //  Button is hidden for all other cases
    return and(not(and(isConstant(pathUpdatableExpression), equal(pathUpdatableExpression, false))), bMassEditEnabledInManifest, templateBindingExpression, not(isUpdateHidden));
  }

  /**
   * Gets the binding expression for the 'enabled' property of the creationRow.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param creationRowVisibility
   * @returns The binding expression for the 'enabled' property of the creationRow.
   */
  _exports.getMassEditVisibility = getMassEditVisibility;
  function getCreationRowEnablement(converterContext, standardActionsContext, creationRowVisibility) {
    const restrictionsInsertable = isPathInsertable(converterContext.getDataModelObjectPath(), {
      ignoreTargetCollection: true,
      authorizeUnresolvable: true,
      pathVisitor: (path, navigationPaths) => {
        if (path.indexOf("/") === 0) {
          path = singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths);
          return path;
        }
        const navigationProperties = converterContext.getDataModelObjectPath().navigationProperties;
        if (navigationProperties) {
          const lastNav = navigationProperties[navigationProperties.length - 1];
          const partner = isNavigationProperty(lastNav) && lastNav.partner;
          if (partner) {
            path = `${partner}/${path}`;
          }
        }
        return path;
      }
    });
    const isInsertable = restrictionsInsertable._type === "Unresolvable" ? isPathInsertable(converterContext.getDataModelObjectPath(), {
      pathVisitor: path => singletonPathVisitor(path, converterContext.getConvertedTypes(), [])
    }) : restrictionsInsertable;
    return and(creationRowVisibility, isInsertable, or(!standardActionsContext.tableManifestConfiguration.disableAddRowButtonForEmptyData, formatResult([pathInModel("creationRowFieldValidity", "internal")], tableFormatters.validateCreationRowFields)));
  }

  /**
   * Gets the binding expression for the 'enabled' property of the 'Create' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param createVisibility
   * @returns The binding expression for the 'enabled' property of the 'Create' action.
   */
  _exports.getCreationRowEnablement = getCreationRowEnablement;
  function getCreateEnablement(converterContext, standardActionsContext, createVisibility) {
    let condition;
    if (standardActionsContext.creationMode === CreationMode.InlineCreationRows) {
      // for Inline creation rows create can be hidden via manifest and this should not impact its enablement
      condition = not(standardActionsContext.hiddenAnnotation.create);
    } else {
      condition = createVisibility;
    }
    const isInsertable = standardActionsContext.restrictions.isInsertable.expression;
    const CollectionType = converterContext.resolveAbsolutePath(standardActionsContext.collectionPath).target;
    return and(condition, or(isEntitySet(CollectionType), and(isInsertable, or(converterContext.getTemplateType() !== TemplateType.ObjectPage, UI.IsEditable))));
  }

  /**
   * Gets the binding expression for the 'enabled' property of the 'Delete' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param deleteVisibility
   * @returns The binding expression for the 'enabled' property of the 'Delete' action.
   */
  _exports.getCreateEnablement = getCreateEnablement;
  function getDeleteEnablement(converterContext, standardActionsContext, deleteVisibility) {
    // The following contexts are filled at runtime when a user selects one or more items from a list.
    // Checks are then made in function updateDeleteInfoForSelectedContexts in file DeleteHelper to see if there
    // are items that can be deleted, thus the delete button should be enabled in these cases.
    const deletableContexts = pathInModel("deletableContexts", "internal");
    const unSavedContexts = pathInModel("unSavedContexts", "internal");
    const draftsWithDeletableActive = pathInModel("draftsWithDeletableActive", "internal");
    const draftsWithNonDeletableActive = pathInModel("draftsWithNonDeletableActive", "internal");

    // "Unresolvable" in navigationExpression is interpreted to mean that there are no navigationExpressions
    // defined.
    // standardActionsContext.restrictions.isDeletable.expression is a binding expression that comes
    // from the Delete restrictions defined in NavigationRestrictions for this entity. In order to
    // be deletable, the item must also be allowed to be deletable according to the Delete Restrictions
    // on the entity itself.
    return and(deleteVisibility, or(standardActionsContext.restrictions.isDeletable.navigationExpression._type === "Unresolvable", standardActionsContext.restrictions.isDeletable.expression), or(and(notEqual(deletableContexts, undefined), greaterThan(length(deletableContexts), 0)), and(notEqual(draftsWithDeletableActive, undefined), greaterThan(length(draftsWithDeletableActive), 0)), and(notEqual(draftsWithNonDeletableActive, undefined), greaterThan(length(draftsWithNonDeletableActive), 0)), and(notEqual(unSavedContexts, undefined), greaterThan(length(unSavedContexts), 0))));
  }

  /**
   * Gets the binding expression for the 'enabled' property of the 'Paste' action.
   *
   * @param pasteVisibility
   * @param createEnablement
   * @returns The binding expression for the 'enabled' property of the 'Paste' action.
   */
  _exports.getDeleteEnablement = getDeleteEnablement;
  function getPasteEnablement(pasteVisibility, createEnablement) {
    return and(pasteVisibility, createEnablement);
  }

  /**
   * Gets the binding expression for the 'enabled' property of the 'MassEdit' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param massEditVisibility
   * @returns The binding expression for the 'enabled' property of the 'MassEdit' action.
   */
  _exports.getPasteEnablement = getPasteEnablement;
  function getMassEditEnablement(converterContext, standardActionsContext, massEditVisibility) {
    const pathUpdatableExpression = standardActionsContext.restrictions.isUpdatable.expression;
    const isOnlyDynamicOnCurrentEntity = !isConstant(pathUpdatableExpression) && standardActionsContext.restrictions.isUpdatable.navigationExpression._type === "Unresolvable";
    const numberOfSelectedContexts = greaterOrEqual(pathInModel("numberOfSelectedContexts", "internal"), 1);
    const numberOfUpdatableContexts = greaterOrEqual(length(pathInModel("updatableContexts", "internal")), 1);
    const bIsDraftSupported = ModelHelper.isObjectPathDraftSupported(converterContext.getDataModelObjectPath());
    const bDisplayMode = isInDisplayMode(converterContext);

    // numberOfUpdatableContexts needs to be added to the binding in case
    // 1. Update is dependent on current entity property (isOnlyDynamicOnCurrentEntity is true).
    // 2. The table is read only and draft enabled(like LR), in this case only active contexts can be mass edited.
    //    So, update depends on 'IsActiveEntity' value which needs to be checked runtime.
    const runtimeBinding = ifElse(or(and(bDisplayMode, bIsDraftSupported), isOnlyDynamicOnCurrentEntity), and(numberOfSelectedContexts, numberOfUpdatableContexts), and(numberOfSelectedContexts));
    return and(massEditVisibility, ifElse(isOnlyDynamicOnCurrentEntity, runtimeBinding, and(runtimeBinding, pathUpdatableExpression)));
  }

  /**
   * Tells if the table in template is in display mode.
   *
   * @param converterContext
   * @param viewConfiguration
   * @returns `true` if the table is in display mode
   */
  _exports.getMassEditEnablement = getMassEditEnablement;
  function isInDisplayMode(converterContext, viewConfiguration) {
    const templateType = converterContext.getTemplateType();
    if (templateType === TemplateType.ListReport || templateType === TemplateType.AnalyticalListPage || viewConfiguration && converterContext.getManifestWrapper().hasMultipleVisualizations(viewConfiguration)) {
      return true;
    }
    // updatable will be handled at the property level
    return false;
  }
  _exports.isInDisplayMode = isInDisplayMode;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbm5vdGF0aW9uSGlkZGVuUHJvcGVydHkiLCJnZW5lcmF0ZVN0YW5kYXJkQWN0aW9uc0NvbnRleHQiLCJjb252ZXJ0ZXJDb250ZXh0IiwiY3JlYXRpb25Nb2RlIiwidGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24iLCJ2aWV3Q29uZmlndXJhdGlvbiIsImlzSW5zaWdodHNFbmFibGVkIiwiY29sbGVjdGlvblBhdGgiLCJnZXRUYXJnZXRPYmplY3RQYXRoIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCIsImhpZGRlbkFubm90YXRpb24iLCJjcmVhdGUiLCJpc0FjdGlvbkFubm90YXRlZEhpZGRlbiIsIkNyZWF0ZUhpZGRlbiIsImRlbGV0ZSIsIkRlbGV0ZUhpZGRlbiIsInVwZGF0ZSIsIlVwZGF0ZUhpZGRlbiIsImlzRHJhZnRPclN0aWNreVN1cHBvcnRlZCIsImlzVmlld1dpdGhNdWx0aXBsZVZpc3VhbGl6YXRpb25zIiwiZ2V0TWFuaWZlc3RXcmFwcGVyIiwiaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyIsIm5ld0FjdGlvbiIsImdldE5ld0FjdGlvbiIsInJlc3RyaWN0aW9ucyIsImdldFJlc3RyaWN0aW9ucyIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJiSXNEcmFmdFN1cHBvcnRlZCIsIk1vZGVsSGVscGVyIiwiaXNPYmplY3RQYXRoRHJhZnRTdXBwb3J0ZWQiLCJiSXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJhbm5vdGF0aW9ucyIsIlNlc3Npb24iLCJTdGlja3lTZXNzaW9uU3VwcG9ydGVkIiwiY3VycmVudEVudGl0eVNldCIsImdldEVudGl0eVNldCIsImlzRW50aXR5U2V0IiwiQ29tbW9uIiwiRHJhZnRSb290IiwiTmV3QWN0aW9uIiwidW5kZWZpbmVkIiwibmV3QWN0aW9uTmFtZSIsInRvU3RyaW5nIiwiYXZhaWxhYmxlUHJvcGVydHkiLCJnZXRFbnRpdHlUeXBlIiwiYWN0aW9ucyIsIkNvcmUiLCJPcGVyYXRpb25BdmFpbGFibGUiLCJ2YWx1ZU9mIiwibmFtZSIsImF2YWlsYWJsZSIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsInNBbm5vdGF0aW9uVGVybSIsImJXaXRoTmF2aWdhdGlvblBhdGgiLCJ2aXNpdGVkTmF2aWdhdGlvblBhdGhzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJsZW5ndGgiLCJhY3Rpb25Bbm5vdGF0aW9uVmFsdWUiLCJVSSIsInBhdGgiLCJzaW5nbGV0b25QYXRoVmlzaXRvciIsImdldENvbnZlcnRlZFR5cGVzIiwiY29uc3RhbnQiLCJyZXN0cmljdGlvbnNEZWYiLCJrZXkiLCJmdW5jdGlvbiIsImlzUGF0aEluc2VydGFibGUiLCJpc1BhdGhVcGRhdGFibGUiLCJpc1BhdGhEZWxldGFibGUiLCJyZXN1bHQiLCJmb3JFYWNoIiwiZGVmIiwiZGVmRnVuY3Rpb24iLCJleHByZXNzaW9uIiwiYXBwbHkiLCJwYXRoVmlzaXRvciIsIm5hdmlnYXRpb25QYXRocyIsIm5hdmlnYXRpb25FeHByZXNzaW9uIiwiaWdub3JlVGFyZ2V0Q29sbGVjdGlvbiIsImF1dGhvcml6ZVVucmVzb2x2YWJsZSIsImdldEluc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0aW5nIiwic3RhbmRhcmRBY3Rpb25zQ29udGV4dCIsImlzRHJhZnRPclN0aWNreSIsIkNyZWF0aW9uTW9kZSIsIkV4dGVybmFsIiwiZ2V0U3RhbmRhcmRBY3Rpb25DcmVhdGUiLCJjcmVhdGVWaXNpYmlsaXR5IiwiZ2V0Q3JlYXRlVmlzaWJpbGl0eSIsImlzVGVtcGxhdGVkIiwiY29tcGlsZUV4cHJlc3Npb24iLCJnZXRDcmVhdGVUZW1wbGF0aW5nIiwidmlzaWJsZSIsImVuYWJsZWQiLCJnZXRDcmVhdGVFbmFibGVtZW50IiwiZ2V0U3RhbmRhcmRBY3Rpb25EZWxldGUiLCJkZWxldGVWaXNpYmlsaXR5IiwiZ2V0RGVsZXRlVmlzaWJpbGl0eSIsImdldERlZmF1bHRUZW1wbGF0aW5nIiwiZ2V0RGVsZXRlRW5hYmxlbWVudCIsImdldENyZWF0aW9uUm93IiwiY3JlYXRpb25Sb3dWaXNpYmlsaXR5IiwiZ2V0Q3JlYXRpb25Sb3dFbmFibGVtZW50IiwiZ2V0U3RhbmRhcmRBY3Rpb25QYXN0ZSIsImlzSW5zZXJ0VXBkYXRlQWN0aW9uc1RlbXBsYXRlZCIsImNyZWF0ZUVuYWJsZW1lbnQiLCJwYXN0ZVZpc2liaWxpdHkiLCJnZXRQYXN0ZVZpc2liaWxpdHkiLCJnZXRQYXN0ZUVuYWJsZW1lbnQiLCJnZXRTdGFuZGFyZEFjdGlvbk1hc3NFZGl0IiwibWFzc0VkaXRWaXNpYmlsaXR5IiwiZ2V0TWFzc0VkaXRWaXNpYmlsaXR5IiwiZ2V0TWFzc0VkaXRFbmFibGVtZW50IiwiZ2V0U3RhbmRhcmRBY3Rpb25JbnNpZ2h0cyIsInZpc3VhbGl6YXRpb25QYXRoIiwiaW5zaWdodHNWaXNpYmlsaXR5IiwiZ2V0SW5zaWdodHNWaXNpYmlsaXR5IiwiaXNGb3JDcmVhdGlvblJvdyIsImFuZCIsIm9yIiwiQ3JlYXRpb25Sb3ciLCJub3QiLCJpc0NvbnN0YW50IiwiYWN0aW9uVmlzaWJpbGl0eSIsImlzSW5zZXJ0YWJsZSIsImlzQ3JlYXRlSGlkZGVuIiwiaWZFbHNlIiwiZ2V0VGVtcGxhdGVUeXBlIiwiVGVtcGxhdGVUeXBlIiwiTGlzdFJlcG9ydCIsIklzRWRpdGFibGUiLCJlcXVhbCIsIklubGluZUNyZWF0aW9uUm93cyIsInR5cGUiLCJpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlIiwiSXNDcmVhdGVNb2RlIiwiaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24iLCJpc0RlbGV0ZUhpZGRlbiIsInBhdGhEZWxldGFibGVFeHByZXNzaW9uIiwiaXNEZWxldGFibGUiLCJBbmFseXRpY2FsTGlzdFBhZ2UiLCJub3RFcXVhbCIsImVuYWJsZVBhc3RlIiwiaW5kZXhPZiIsImlzVXBkYXRlSGlkZGVuIiwicGF0aFVwZGF0YWJsZUV4cHJlc3Npb24iLCJpc1VwZGF0YWJsZSIsImJNYXNzRWRpdEVuYWJsZWRJbk1hbmlmZXN0IiwiZW5hYmxlTWFzc0VkaXQiLCJ0ZW1wbGF0ZUJpbmRpbmdFeHByZXNzaW9uIiwiT2JqZWN0UGFnZSIsInJlc3RyaWN0aW9uc0luc2VydGFibGUiLCJsYXN0TmF2IiwicGFydG5lciIsImlzTmF2aWdhdGlvblByb3BlcnR5IiwiX3R5cGUiLCJkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhIiwiZm9ybWF0UmVzdWx0IiwicGF0aEluTW9kZWwiLCJ0YWJsZUZvcm1hdHRlcnMiLCJ2YWxpZGF0ZUNyZWF0aW9uUm93RmllbGRzIiwiY29uZGl0aW9uIiwiQ29sbGVjdGlvblR5cGUiLCJyZXNvbHZlQWJzb2x1dGVQYXRoIiwidGFyZ2V0IiwiZGVsZXRhYmxlQ29udGV4dHMiLCJ1blNhdmVkQ29udGV4dHMiLCJkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlIiwiZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSIsImdyZWF0ZXJUaGFuIiwiaXNPbmx5RHluYW1pY09uQ3VycmVudEVudGl0eSIsIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyIsImdyZWF0ZXJPckVxdWFsIiwibnVtYmVyT2ZVcGRhdGFibGVDb250ZXh0cyIsImJEaXNwbGF5TW9kZSIsImlzSW5EaXNwbGF5TW9kZSIsInJ1bnRpbWVCaW5kaW5nIiwidGVtcGxhdGVUeXBlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJTdGFuZGFyZEFjdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXQsIFByb3BlcnR5QW5ub3RhdGlvblZhbHVlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IEVudGl0eVNldEFubm90YXRpb25zX1VJIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSV9FZG1cIjtcbmltcG9ydCB0YWJsZUZvcm1hdHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL2Zvcm1hdHRlcnMvVGFibGVGb3JtYXR0ZXJcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQge1xuXHRhbmQsXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRjb25zdGFudCxcblx0ZXF1YWwsXG5cdGZvcm1hdFJlc3VsdCxcblx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLFxuXHRncmVhdGVyT3JFcXVhbCxcblx0Z3JlYXRlclRoYW4sXG5cdGlmRWxzZSxcblx0aXNDb25zdGFudCxcblx0aXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24sXG5cdGxlbmd0aCxcblx0bm90LFxuXHRub3RFcXVhbCxcblx0b3IsXG5cdHBhdGhJbk1vZGVsXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGlzRW50aXR5U2V0LCBpc05hdmlnYXRpb25Qcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB7IGdldFRhcmdldE9iamVjdFBhdGgsIGlzUGF0aERlbGV0YWJsZSwgaXNQYXRoSW5zZXJ0YWJsZSwgaXNQYXRoVXBkYXRhYmxlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vLi4vLi4vQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgc2luZ2xldG9uUGF0aFZpc2l0b3IsIFVJIH0gZnJvbSBcIi4uLy4uLy4uL2hlbHBlcnMvQmluZGluZ0hlbHBlclwiO1xuaW1wb3J0IHsgZ2V0SW5zaWdodHNWaXNpYmlsaXR5IH0gZnJvbSBcIi4uLy4uLy4uL2hlbHBlcnMvSW5zaWdodHNIZWxwZXJzXCI7XG5pbXBvcnQgdHlwZSB7IFZpZXdQYXRoQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBDcmVhdGlvbk1vZGUsIFRlbXBsYXRlVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgdHlwZSB7IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vVGFibGVcIjtcblxuZW51bSBBbm5vdGF0aW9uSGlkZGVuUHJvcGVydHkge1xuXHRDcmVhdGVIaWRkZW4gPSBcIkNyZWF0ZUhpZGRlblwiLFxuXHREZWxldGVIaWRkZW4gPSBcIkRlbGV0ZUhpZGRlblwiLFxuXHRVcGRhdGVIaWRkZW4gPSBcIlVwZGF0ZUhpZGRlblwiXG59XG5cbmV4cG9ydCB0eXBlIFN0YW5kYXJkQWN0aW9uQ29uZmlnVHlwZSA9IHtcblx0aXNUZW1wbGF0ZWQ/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0dmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGVuYWJsZWQ6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xufTtcblxudHlwZSBFeHByZXNzaW9uUmVzdHJpY3Rpb25zVHlwZSA9IHtcblx0ZXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHRuYXZpZ2F0aW9uRXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+O1xufTtcbnR5cGUgU3RhbmRhcmRBY3Rpb25zUmVzdHJpY3Rpb25zVHlwZSA9IFJlY29yZDxzdHJpbmcsIEV4cHJlc3Npb25SZXN0cmljdGlvbnNUeXBlPjtcblxuZXhwb3J0IHR5cGUgU3RhbmRhcmRBY3Rpb25zQ29udGV4dCA9IHtcblx0Y29sbGVjdGlvblBhdGg6IHN0cmluZztcblx0aGlkZGVuQW5ub3RhdGlvbjoge1xuXHRcdGNyZWF0ZTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHRcdGRlbGV0ZTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHRcdHVwZGF0ZTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHR9O1xuXHRjcmVhdGlvbk1vZGU6IENyZWF0aW9uTW9kZTtcblx0aXNEcmFmdE9yU3RpY2t5U3VwcG9ydGVkOiBib29sZWFuO1xuXHRpc1ZpZXdXaXRoTXVsdGlwbGVWaXN1YWxpemF0aW9uczogYm9vbGVhbjtcblx0bmV3QWN0aW9uPzoge1xuXHRcdG5hbWU6IHN0cmluZztcblx0XHRhdmFpbGFibGU6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPjtcblx0fTtcblx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb246IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb247XG5cdHJlc3RyaWN0aW9uczogU3RhbmRhcmRBY3Rpb25zUmVzdHJpY3Rpb25zVHlwZTtcblx0aXNJbnNpZ2h0c0VuYWJsZWQ/OiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIGNvbnRleHQgZm9yIHRoZSBzdGFuZGFyZCBhY3Rpb25zLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gY3JlYXRpb25Nb2RlXG4gKiBAcGFyYW0gdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSB2aWV3Q29uZmlndXJhdGlvblxuICogQHBhcmFtIGlzSW5zaWdodHNFbmFibGVkXG4gKiBAcmV0dXJucyAgVGhlIGNvbnRleHQgZm9yIHRhYmxlIGFjdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU3RhbmRhcmRBY3Rpb25zQ29udGV4dChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0Y3JlYXRpb25Nb2RlOiBDcmVhdGlvbk1vZGUsXG5cdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uOiBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uLFxuXHR2aWV3Q29uZmlndXJhdGlvbj86IFZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0aXNJbnNpZ2h0c0VuYWJsZWQ/OiBib29sZWFuXG4pOiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0IHtcblx0cmV0dXJuIHtcblx0XHRjb2xsZWN0aW9uUGF0aDogZ2V0VGFyZ2V0T2JqZWN0UGF0aChjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSksXG5cdFx0aGlkZGVuQW5ub3RhdGlvbjoge1xuXHRcdFx0Y3JlYXRlOiBpc0FjdGlvbkFubm90YXRlZEhpZGRlbihjb252ZXJ0ZXJDb250ZXh0LCBBbm5vdGF0aW9uSGlkZGVuUHJvcGVydHkuQ3JlYXRlSGlkZGVuKSxcblx0XHRcdGRlbGV0ZTogaXNBY3Rpb25Bbm5vdGF0ZWRIaWRkZW4oY29udmVydGVyQ29udGV4dCwgQW5ub3RhdGlvbkhpZGRlblByb3BlcnR5LkRlbGV0ZUhpZGRlbiksXG5cdFx0XHR1cGRhdGU6IGlzQWN0aW9uQW5ub3RhdGVkSGlkZGVuKGNvbnZlcnRlckNvbnRleHQsIEFubm90YXRpb25IaWRkZW5Qcm9wZXJ0eS5VcGRhdGVIaWRkZW4pXG5cdFx0fSxcblx0XHRjcmVhdGlvbk1vZGU6IGNyZWF0aW9uTW9kZSxcblx0XHRpc0RyYWZ0T3JTdGlja3lTdXBwb3J0ZWQ6IGlzRHJhZnRPclN0aWNreVN1cHBvcnRlZChjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRpc1ZpZXdXaXRoTXVsdGlwbGVWaXN1YWxpemF0aW9uczogdmlld0NvbmZpZ3VyYXRpb25cblx0XHRcdD8gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKHZpZXdDb25maWd1cmF0aW9uKVxuXHRcdFx0OiBmYWxzZSxcblx0XHRuZXdBY3Rpb246IGdldE5ld0FjdGlvbihjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHR0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbjogdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24sXG5cdFx0cmVzdHJpY3Rpb25zOiBnZXRSZXN0cmljdGlvbnMoY29udmVydGVyQ29udGV4dCksXG5cdFx0aXNJbnNpZ2h0c0VuYWJsZWQ6IGlzSW5zaWdodHNFbmFibGVkXG5cdH07XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHN0aWNreSBvciBkcmFmdCBpcyBzdXBwb3J0ZWQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBzdXBwb3J0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRHJhZnRPclN0aWNreVN1cHBvcnRlZChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogYm9vbGVhbiB7XG5cdGNvbnN0IGRhdGFNb2RlbE9iamVjdFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKTtcblx0Y29uc3QgYklzRHJhZnRTdXBwb3J0ZWQgPSBNb2RlbEhlbHBlci5pc09iamVjdFBhdGhEcmFmdFN1cHBvcnRlZChkYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0Y29uc3QgYklzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCA9IChkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5TZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkXG5cdFx0PyB0cnVlXG5cdFx0OiBmYWxzZTtcblxuXHRyZXR1cm4gYklzRHJhZnRTdXBwb3J0ZWQgfHwgYklzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBjb25maWd1cmVkIG5ld0FjdGlvbiBpbnRvIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBuZXcgYWN0aW9uIGluZm9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5ld0FjdGlvbihjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KSB7XG5cdGNvbnN0IGN1cnJlbnRFbnRpdHlTZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpO1xuXHRjb25zdCBuZXdBY3Rpb24gPSBpc0VudGl0eVNldChjdXJyZW50RW50aXR5U2V0KVxuXHRcdD8gY3VycmVudEVudGl0eVNldC5hbm5vdGF0aW9ucy5Db21tb24/LkRyYWZ0Um9vdD8uTmV3QWN0aW9uID8/XG5cdFx0ICBjdXJyZW50RW50aXR5U2V0LmFubm90YXRpb25zLlNlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQ/Lk5ld0FjdGlvblxuXHRcdDogdW5kZWZpbmVkO1xuXHRjb25zdCBuZXdBY3Rpb25OYW1lOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiA9IG5ld0FjdGlvbj8udG9TdHJpbmcoKTtcblx0aWYgKG5ld0FjdGlvbk5hbWUpIHtcblx0XHRsZXQgYXZhaWxhYmxlUHJvcGVydHkgPSBjb252ZXJ0ZXJDb250ZXh0Py5nZXRFbnRpdHlUeXBlKCkuYWN0aW9uc1tuZXdBY3Rpb25OYW1lXT8uYW5ub3RhdGlvbnM/LkNvcmU/Lk9wZXJhdGlvbkF2YWlsYWJsZT8udmFsdWVPZigpO1xuXHRcdGF2YWlsYWJsZVByb3BlcnR5ID0gYXZhaWxhYmxlUHJvcGVydHkgIT09IHVuZGVmaW5lZCA/IGF2YWlsYWJsZVByb3BlcnR5IDogdHJ1ZTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bmFtZTogbmV3QWN0aW9uTmFtZSxcblx0XHRcdGF2YWlsYWJsZTogZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uPGJvb2xlYW4+KGF2YWlsYWJsZVByb3BlcnR5IGFzIHVua25vd24gYXMgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8Ym9vbGVhbj4pXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIGFjdGlvbiB2aXNpYmlsaXR5IGNvbmZpZ3VyZWQgaW50byBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gc0Fubm90YXRpb25UZXJtXG4gKiBAcGFyYW0gYldpdGhOYXZpZ2F0aW9uUGF0aFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIGFjdGlvbiB2aXNpYmlsaXR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0FjdGlvbkFubm90YXRlZEhpZGRlbihcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c0Fubm90YXRpb25UZXJtOiBrZXlvZiBFbnRpdHlTZXRBbm5vdGF0aW9uc19VSSxcblx0YldpdGhOYXZpZ2F0aW9uUGF0aCA9IHRydWVcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGN1cnJlbnRFbnRpdHlTZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpO1xuXHRjb25zdCBkYXRhTW9kZWxPYmplY3RQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk7XG5cdC8vIENvbnNpZGVyIG9ubHkgdGhlIGxhc3QgbGV2ZWwgb2YgbmF2aWdhdGlvbi4gVGhlIG90aGVycyBhcmUgYWxyZWFkeSBjb25zaWRlcmVkIGluIHRoZSBlbGVtZW50IGJpbmRpbmcgb2YgdGhlIHBhZ2UuXG5cdGNvbnN0IHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMgPVxuXHRcdGRhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoID4gMCAmJiBiV2l0aE5hdmlnYXRpb25QYXRoXG5cdFx0XHQ/IFtkYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzW2RhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoIC0gMV0ubmFtZV1cblx0XHRcdDogW107XG5cdGNvbnN0IGFjdGlvbkFubm90YXRpb25WYWx1ZSA9XG5cdFx0KChjdXJyZW50RW50aXR5U2V0Py5hbm5vdGF0aW9ucy5VSSBhcyBFbnRpdHlTZXRBbm5vdGF0aW9uc19VSSk/LltzQW5ub3RhdGlvblRlcm1dIGFzIFByb3BlcnR5QW5ub3RhdGlvblZhbHVlPGJvb2xlYW4+KSB8fCBmYWxzZTtcblxuXHRyZXR1cm4gY3VycmVudEVudGl0eVNldFxuXHRcdD8gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGFjdGlvbkFubm90YXRpb25WYWx1ZSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgdW5kZWZpbmVkLCAocGF0aDogc3RyaW5nKSA9PlxuXHRcdFx0XHRzaW5nbGV0b25QYXRoVmlzaXRvcihwYXRoLCBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlZFR5cGVzKCksIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMpXG5cdFx0ICApXG5cdFx0OiBjb25zdGFudChmYWxzZSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYW5ub3RhdGVkIHJlc3RyaWN0aW9ucyBmb3IgdGhlIGFjdGlvbnMuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSByZXN0cmljdGlvbiBpbmZvcm1hdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVzdHJpY3Rpb25zKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBTdGFuZGFyZEFjdGlvbnNSZXN0cmljdGlvbnNUeXBlIHtcblx0Y29uc3QgZGF0YU1vZGVsT2JqZWN0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpO1xuXHRjb25zdCByZXN0cmljdGlvbnNEZWYgPSBbXG5cdFx0e1xuXHRcdFx0a2V5OiBcImlzSW5zZXJ0YWJsZVwiLFxuXHRcdFx0ZnVuY3Rpb246IGlzUGF0aEluc2VydGFibGVcblx0XHR9LFxuXHRcdHtcblx0XHRcdGtleTogXCJpc1VwZGF0YWJsZVwiLFxuXHRcdFx0ZnVuY3Rpb246IGlzUGF0aFVwZGF0YWJsZVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0a2V5OiBcImlzRGVsZXRhYmxlXCIsXG5cdFx0XHRmdW5jdGlvbjogaXNQYXRoRGVsZXRhYmxlXG5cdFx0fVxuXHRdO1xuXHRjb25zdCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIEV4cHJlc3Npb25SZXN0cmljdGlvbnNUeXBlPiA9IHt9O1xuXHRyZXN0cmljdGlvbnNEZWYuZm9yRWFjaChmdW5jdGlvbiAoZGVmKSB7XG5cdFx0Y29uc3QgZGVmRnVuY3Rpb24gPSBkZWZbXCJmdW5jdGlvblwiXTtcblx0XHRyZXN1bHRbZGVmLmtleV0gPSB7XG5cdFx0XHRleHByZXNzaW9uOiBkZWZGdW5jdGlvbi5hcHBseShudWxsLCBbXG5cdFx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwYXRoVmlzaXRvcjogKHBhdGg6IHN0cmluZywgbmF2aWdhdGlvblBhdGhzOiBzdHJpbmdbXSkgPT5cblx0XHRcdFx0XHRcdHNpbmdsZXRvblBhdGhWaXNpdG9yKHBhdGgsIGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVkVHlwZXMoKSwgbmF2aWdhdGlvblBhdGhzKVxuXHRcdFx0XHR9XG5cdFx0XHRdKSxcblx0XHRcdG5hdmlnYXRpb25FeHByZXNzaW9uOiBkZWZGdW5jdGlvbi5hcHBseShudWxsLCBbXG5cdFx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZ25vcmVUYXJnZXRDb2xsZWN0aW9uOiB0cnVlLFxuXHRcdFx0XHRcdGF1dGhvcml6ZVVucmVzb2x2YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRwYXRoVmlzaXRvcjogKHBhdGg6IHN0cmluZywgbmF2aWdhdGlvblBhdGhzOiBzdHJpbmdbXSkgPT5cblx0XHRcdFx0XHRcdHNpbmdsZXRvblBhdGhWaXNpdG9yKHBhdGgsIGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVkVHlwZXMoKSwgbmF2aWdhdGlvblBhdGhzKVxuXHRcdFx0XHR9XG5cdFx0XHRdKVxuXHRcdH07XG5cdH0pO1xuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0ZW1wbGF0aW5nIGZvciBpbnNlcnQvdXBkYXRlIGFjdGlvbnMgaXMgbWFuZGF0b3J5LlxuICpcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcGFyYW0gaXNEcmFmdE9yU3RpY2t5XG4gKiBAcmV0dXJucyBUcnVlIGlmIHdlIG5lZWQgdG8gdGVtcGxhdGUgaW5zZXJ0IG9yIHVwZGF0ZSBhY3Rpb25zLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0aW5nKHN0YW5kYXJkQWN0aW9uc0NvbnRleHQ6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHQsIGlzRHJhZnRPclN0aWNreTogYm9vbGVhbik6IGJvb2xlYW4ge1xuXHRyZXR1cm4gaXNEcmFmdE9yU3RpY2t5IHx8IHN0YW5kYXJkQWN0aW9uc0NvbnRleHQuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuRXh0ZXJuYWw7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9ucyBmb3IgdGhlIHByb3BlcnRpZXMgb2YgdGhlICdDcmVhdGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBzdGFuZGFyZCBhY3Rpb24gaW5mb1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RhbmRhcmRBY3Rpb25DcmVhdGUoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQ6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbik6IFN0YW5kYXJkQWN0aW9uQ29uZmlnVHlwZSB7XG5cdGNvbnN0IGNyZWF0ZVZpc2liaWxpdHkgPSBnZXRDcmVhdGVWaXNpYmlsaXR5KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpO1xuXHRyZXR1cm4ge1xuXHRcdGlzVGVtcGxhdGVkOiBjb21waWxlRXhwcmVzc2lvbihnZXRDcmVhdGVUZW1wbGF0aW5nKHN0YW5kYXJkQWN0aW9uc0NvbnRleHQsIGNyZWF0ZVZpc2liaWxpdHkpKSxcblx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihjcmVhdGVWaXNpYmlsaXR5KSxcblx0XHRlbmFibGVkOiBjb21waWxlRXhwcmVzc2lvbihnZXRDcmVhdGVFbmFibGVtZW50KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQsIGNyZWF0ZVZpc2liaWxpdHkpKVxuXHR9O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSAnRGVsZXRlJyBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9ucyBmb3IgdGhlIHByb3BlcnRpZXMgb2YgdGhlICdEZWxldGUnIGFjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN0YW5kYXJkQWN0aW9uRGVsZXRlKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4pOiBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGUge1xuXHRjb25zdCBkZWxldGVWaXNpYmlsaXR5ID0gZ2V0RGVsZXRlVmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KTtcblxuXHRyZXR1cm4ge1xuXHRcdGlzVGVtcGxhdGVkOiBjb21waWxlRXhwcmVzc2lvbihnZXREZWZhdWx0VGVtcGxhdGluZyhkZWxldGVWaXNpYmlsaXR5KSksXG5cdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24oZGVsZXRlVmlzaWJpbGl0eSksXG5cdFx0ZW5hYmxlZDogY29tcGlsZUV4cHJlc3Npb24oZ2V0RGVsZXRlRW5hYmxlbWVudChjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBkZWxldGVWaXNpYmlsaXR5KSlcblx0fTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEByZXR1cm5zIFN0YW5kYXJkQWN0aW9uQ29uZmlnVHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3JlYXRpb25Sb3coXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQ6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbik6IFN0YW5kYXJkQWN0aW9uQ29uZmlnVHlwZSB7XG5cdGNvbnN0IGNyZWF0aW9uUm93VmlzaWJpbGl0eSA9IGdldENyZWF0ZVZpc2liaWxpdHkoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCwgdHJ1ZSk7XG5cblx0cmV0dXJuIHtcblx0XHRpc1RlbXBsYXRlZDogY29tcGlsZUV4cHJlc3Npb24oZ2V0Q3JlYXRlVGVtcGxhdGluZyhzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBjcmVhdGlvblJvd1Zpc2liaWxpdHksIHRydWUpKSxcblx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihjcmVhdGlvblJvd1Zpc2liaWxpdHkpLFxuXHRcdGVuYWJsZWQ6IGNvbXBpbGVFeHByZXNzaW9uKGdldENyZWF0aW9uUm93RW5hYmxlbWVudChjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBjcmVhdGlvblJvd1Zpc2liaWxpdHkpKVxuXHR9O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSAnUGFzdGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEBwYXJhbSBpc0luc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0ZWRcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb25zIGZvciB0aGUgcHJvcGVydGllcyBvZiB0aGUgJ1Bhc3RlJyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdGFuZGFyZEFjdGlvblBhc3RlKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHRpc0luc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0ZWQ6IGJvb2xlYW5cbik6IFN0YW5kYXJkQWN0aW9uQ29uZmlnVHlwZSB7XG5cdGNvbnN0IGNyZWF0ZVZpc2liaWxpdHkgPSBnZXRDcmVhdGVWaXNpYmlsaXR5KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpO1xuXHRjb25zdCBjcmVhdGVFbmFibGVtZW50ID0gZ2V0Q3JlYXRlRW5hYmxlbWVudChjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBjcmVhdGVWaXNpYmlsaXR5KTtcblx0Y29uc3QgcGFzdGVWaXNpYmlsaXR5ID0gZ2V0UGFzdGVWaXNpYmlsaXR5KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQsIGNyZWF0ZVZpc2liaWxpdHksIGlzSW5zZXJ0VXBkYXRlQWN0aW9uc1RlbXBsYXRlZCk7XG5cdHJldHVybiB7XG5cdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24ocGFzdGVWaXNpYmlsaXR5KSxcblx0XHRlbmFibGVkOiBjb21waWxlRXhwcmVzc2lvbihnZXRQYXN0ZUVuYWJsZW1lbnQocGFzdGVWaXNpYmlsaXR5LCBjcmVhdGVFbmFibGVtZW50KSlcblx0fTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb25zIGZvciB0aGUgcHJvcGVydGllcyBvZiB0aGUgJ01hc3NFZGl0JyBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9ucyBmb3IgdGhlIHByb3BlcnRpZXMgb2YgdGhlICdNYXNzRWRpdCcgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RhbmRhcmRBY3Rpb25NYXNzRWRpdChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuKTogU3RhbmRhcmRBY3Rpb25Db25maWdUeXBlIHtcblx0Y29uc3QgbWFzc0VkaXRWaXNpYmlsaXR5ID0gZ2V0TWFzc0VkaXRWaXNpYmlsaXR5KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpO1xuXG5cdHJldHVybiB7XG5cdFx0aXNUZW1wbGF0ZWQ6IGNvbXBpbGVFeHByZXNzaW9uKGdldERlZmF1bHRUZW1wbGF0aW5nKG1hc3NFZGl0VmlzaWJpbGl0eSkpLFxuXHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKG1hc3NFZGl0VmlzaWJpbGl0eSksXG5cdFx0ZW5hYmxlZDogY29tcGlsZUV4cHJlc3Npb24oZ2V0TWFzc0VkaXRFbmFibGVtZW50KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQsIG1hc3NFZGl0VmlzaWJpbGl0eSkpXG5cdH07XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9ucyBmb3IgdGhlIHByb3BlcnRpZXMgb2YgdGhlICdBZGRDYXJkc1RvSW5zaWdodHMnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEBwYXJhbSB2aXN1YWxpemF0aW9uUGF0aFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSAnQWRkQ2FyZHNUb0luc2lnaHRzJyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdGFuZGFyZEFjdGlvbkluc2lnaHRzKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nXG4pOiBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGUge1xuXHRjb25zdCBpbnNpZ2h0c1Zpc2liaWxpdHkgPVxuXHRcdChzdGFuZGFyZEFjdGlvbnNDb250ZXh0LmlzSW5zaWdodHNFbmFibGVkID8/IGZhbHNlKSAmJlxuXHRcdGdldEluc2lnaHRzVmlzaWJpbGl0eShcIlRhYmxlXCIsIGNvbnZlcnRlckNvbnRleHQsIHZpc3VhbGl6YXRpb25QYXRoLCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KTtcblxuXHRyZXR1cm4ge1xuXHRcdGlzVGVtcGxhdGVkOiBjb21waWxlRXhwcmVzc2lvbihpbnNpZ2h0c1Zpc2liaWxpdHkpLFxuXHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKGluc2lnaHRzVmlzaWJpbGl0eSksXG5cdFx0ZW5hYmxlZDogY29tcGlsZUV4cHJlc3Npb24oaW5zaWdodHNWaXNpYmlsaXR5KVxuXHR9O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIHRlbXBsYXRpbmcgb2YgdGhlICdDcmVhdGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHBhcmFtIGNyZWF0ZVZpc2liaWxpdHlcbiAqIEBwYXJhbSBpc0ZvckNyZWF0aW9uUm93XG4gKiBAcmV0dXJucyBUaGUgY3JlYXRlIGJpbmRpbmcgZXhwcmVzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3JlYXRlVGVtcGxhdGluZyhcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0Y3JlYXRlVmlzaWJpbGl0eTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+LFxuXHRpc0ZvckNyZWF0aW9uUm93ID0gZmFsc2Vcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdC8vVGVtcGxhdGluZyBvZiBDcmVhdGUgQnV0dG9uIGlzIG5vdCBkb25lOlxuXHQvLyBcdCAtIElmIEJ1dHRvbiBpcyBuZXZlciB2aXNpYmxlKGNvdmVyZWQgdGhlIEV4dGVybmFsIGNyZWF0ZSBidXR0b24sIG5ldyBBY3Rpb24pXG5cdC8vXHQgLSBvciBDcmVhdGlvbk1vZGUgaXMgb24gQ3JlYXRpb25Sb3cgZm9yIENyZWF0ZSBCdXR0b25cblx0Ly9cdCAtIG9yIENyZWF0aW9uTW9kZSBpcyBub3Qgb24gQ3JlYXRpb25Sb3cgZm9yIENyZWF0aW9uUm93IEJ1dHRvblxuXG5cdHJldHVybiBhbmQoXG5cdFx0Ly9YTk9SIGdhdGVcblx0XHRvcihcblx0XHRcdGFuZChpc0ZvckNyZWF0aW9uUm93LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LmNyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93KSxcblx0XHRcdGFuZCghaXNGb3JDcmVhdGlvblJvdywgc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5jcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdylcblx0XHQpLFxuXHRcdG9yKG5vdChpc0NvbnN0YW50KGNyZWF0ZVZpc2liaWxpdHkpKSwgY3JlYXRlVmlzaWJpbGl0eSlcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSB0ZW1wbGF0aW5nIG9mIHRoZSBub24tQ3JlYXRlIGFjdGlvbnMuXG4gKlxuICogQHBhcmFtIGFjdGlvblZpc2liaWxpdHlcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSB0ZW1wbGF0aW5nIG9mIHRoZSBub24tQ3JlYXRlIGFjdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0VGVtcGxhdGluZyhhY3Rpb25WaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gb3Iobm90KGlzQ29uc3RhbnQoYWN0aW9uVmlzaWJpbGl0eSkpLCBhY3Rpb25WaXNpYmlsaXR5KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdDcmVhdGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEBwYXJhbSBpc0ZvckNyZWF0aW9uUm93XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ3Zpc2libGUnIHByb3BlcnR5IG9mIHRoZSAnQ3JlYXRlJyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDcmVhdGVWaXNpYmlsaXR5KFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHRpc0ZvckNyZWF0aW9uUm93ID0gZmFsc2Vcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGlzSW5zZXJ0YWJsZSA9IHN0YW5kYXJkQWN0aW9uc0NvbnRleHQucmVzdHJpY3Rpb25zLmlzSW5zZXJ0YWJsZS5leHByZXNzaW9uO1xuXHRjb25zdCBpc0NyZWF0ZUhpZGRlbiA9IGlzRm9yQ3JlYXRpb25Sb3dcblx0XHQ/IGlzQWN0aW9uQW5ub3RhdGVkSGlkZGVuKGNvbnZlcnRlckNvbnRleHQsIEFubm90YXRpb25IaWRkZW5Qcm9wZXJ0eS5DcmVhdGVIaWRkZW4sIGZhbHNlKVxuXHRcdDogc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5oaWRkZW5Bbm5vdGF0aW9uLmNyZWF0ZTtcblx0Y29uc3QgbmV3QWN0aW9uID0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5uZXdBY3Rpb247XG5cdC8vQ3JlYXRlIEJ1dHRvbiBpcyB2aXNpYmxlOlxuXHQvLyBcdCAtIElmIHRoZSBjcmVhdGlvbiBtb2RlIGlzIGV4dGVybmFsXG5cdC8vICAgICAgLSBJZiB3ZSdyZSBvbiB0aGUgbGlzdCByZXBvcnQgYW5kIGNyZWF0ZSBpcyBub3QgaGlkZGVuXG5cdC8vXHRcdC0gT3RoZXJ3aXNlIHRoaXMgZGVwZW5kcyBvbiB0aGUgdmFsdWUgb2YgdGhlIFVJLklzRWRpdGFibGVcblx0Ly9cdCAtIE90aGVyd2lzZVxuXHQvL1x0XHQtIElmIGFueSBvZiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgaXMgdmFsaWQgdGhlbiBjcmVhdGUgYnV0dG9uIGlzbid0IHZpc2libGVcblx0Ly9cdFx0XHQtIG5vIG5ld0FjdGlvbiBhdmFpbGFibGVcblx0Ly9cdFx0XHQtIEl0J3Mgbm90IGluc2VydGFibGUgYW5kIHRoZXJlIGlzIG5vdCBhIG5ldyBhY3Rpb25cblx0Ly9cdFx0XHQtIGNyZWF0ZSBpcyBoaWRkZW5cblx0Ly9cdFx0XHQtIFRoZXJlIGFyZSBtdWx0aXBsZSB2aXN1YWxpemF0aW9uc1xuXHQvL1x0XHRcdC0gSXQncyBhbiBBbmFseXRpY2FsIExpc3QgUGFnZVxuXHQvL1x0XHRcdC0gVXNlcyBJbmxpbmVDcmVhdGlvblJvd3MgbW9kZSBhbmQgYSBSZXNwb25zaXZlIHRhYmxlIHR5cGUsIHdpdGggdGhlIHBhcmFtZXRlciBpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlIHRvIHRydWUgd2hpbGUgbm90IGluIGNyZWF0ZSBtb2RlXG5cdC8vICAgLSBPdGhlcndpc2Vcblx0Ly8gXHQgXHQtIElmIHdlJ3JlIG9uIHRoZSBsaXN0IHJlcG9ydCAtPlxuXHQvLyBcdCBcdFx0LSBJZiBVSS5DcmVhdGVIaWRkZW4gcG9pbnRzIHRvIGEgcHJvcGVydHkgcGF0aCAtPiBwcm92aWRlIGEgbmVnYXRlZCBiaW5kaW5nIHRvIHRoaXMgcGF0aFxuXHQvLyBcdCBcdFx0LSBPdGhlcndpc2UsIGNyZWF0ZSBpcyB2aXNpYmxlXG5cdC8vIFx0IFx0LSBPdGhlcndpc2Vcblx0Ly8gXHQgIFx0IC0gVGhpcyBkZXBlbmRzIG9uIHRoZSB2YWx1ZSBvZiB0aGUgVUkuSXNFZGl0YWJsZVxuXHRyZXR1cm4gaWZFbHNlKFxuXHRcdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuRXh0ZXJuYWwsXG5cdFx0YW5kKG5vdChpc0NyZWF0ZUhpZGRlbiksIG9yKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0LCBVSS5Jc0VkaXRhYmxlKSksXG5cdFx0aWZFbHNlKFxuXHRcdFx0b3IoXG5cdFx0XHRcdGFuZChpc0NvbnN0YW50KG5ld0FjdGlvbj8uYXZhaWxhYmxlKSwgZXF1YWwobmV3QWN0aW9uPy5hdmFpbGFibGUsIGZhbHNlKSksXG5cdFx0XHRcdGFuZChpc0NvbnN0YW50KGlzSW5zZXJ0YWJsZSksIGVxdWFsKGlzSW5zZXJ0YWJsZSwgZmFsc2UpLCAhbmV3QWN0aW9uKSxcblx0XHRcdFx0YW5kKGlzQ29uc3RhbnQoaXNDcmVhdGVIaWRkZW4pLCBlcXVhbChpc0NyZWF0ZUhpZGRlbiwgdHJ1ZSkpLFxuXHRcdFx0XHRhbmQoXG5cdFx0XHRcdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dC5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5JbmxpbmVDcmVhdGlvblJvd3MsXG5cdFx0XHRcdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dC50YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbj8udHlwZSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIixcblx0XHRcdFx0XHRpZkVsc2UoXG5cdFx0XHRcdFx0XHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0Py50YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbj8uaW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZSA9PT0gZmFsc2UsXG5cdFx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdFx0VUkuSXNDcmVhdGVNb2RlXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpLFxuXHRcdFx0ZmFsc2UsXG5cdFx0XHRpZkVsc2UoXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0LFxuXHRcdFx0XHRvcihub3QoaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24oaXNDcmVhdGVIaWRkZW4pKSwgbm90KGlzQ3JlYXRlSGlkZGVuKSksXG5cdFx0XHRcdGFuZChub3QoaXNDcmVhdGVIaWRkZW4pLCBVSS5Jc0VkaXRhYmxlKVxuXHRcdFx0KVxuXHRcdClcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdEZWxldGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdEZWxldGUnIGFjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlbGV0ZVZpc2liaWxpdHkoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQ6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGlzRGVsZXRlSGlkZGVuID0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5oaWRkZW5Bbm5vdGF0aW9uLmRlbGV0ZTtcblx0Y29uc3QgcGF0aERlbGV0YWJsZUV4cHJlc3Npb24gPSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LnJlc3RyaWN0aW9ucy5pc0RlbGV0YWJsZS5leHByZXNzaW9uO1xuXG5cdC8vRGVsZXRlIEJ1dHRvbiBpcyB2aXNpYmxlOlxuXHQvLyBcdCBQcmVyZXF1aXNpdGVzOlxuXHQvL1x0IC0gSWYgd2UncmUgbm90IG9uIEFMUFxuXHQvLyAgIC0gSWYgcmVzdHJpY3Rpb25zIG9uIGRlbGV0YWJsZSBzZXQgdG8gZmFsc2UgLT4gbm90IHZpc2libGVcblx0Ly8gICAtIE90aGVyd2lzZVxuXHQvL1x0XHRcdC0gSWYgVUkuRGVsZXRlSGlkZGVuIGlzIHRydWUgLT4gbm90IHZpc2libGVcblx0Ly9cdFx0XHQtIE90aGVyd2lzZVxuXHQvLyBcdCBcdFx0XHQtIElmIHdlJ3JlIG9uIE9QIC0+IGRlcGVuZGluZyBpZiBVSSBpcyBlZGl0YWJsZSBhbmQgcmVzdHJpY3Rpb25zIG9uIGRlbGV0YWJsZVxuXHQvL1x0XHRcdFx0LSBPdGhlcndpc2Vcblx0Ly9cdFx0XHRcdCBcdC0gSWYgVUkuRGVsZXRlSGlkZGVuIHBvaW50cyB0byBhIHByb3BlcnR5IHBhdGggLT4gcHJvdmlkZSBhIG5lZ2F0ZWQgYmluZGluZyB0byB0aGlzIHBhdGhcblx0Ly9cdCBcdCBcdFx0IFx0LSBPdGhlcndpc2UsIGRlbGV0ZSBpcyB2aXNpYmxlXG5cblx0cmV0dXJuIGlmRWxzZShcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlLFxuXHRcdGZhbHNlLFxuXHRcdGlmRWxzZShcblx0XHRcdGFuZChpc0NvbnN0YW50KHBhdGhEZWxldGFibGVFeHByZXNzaW9uKSwgZXF1YWwocGF0aERlbGV0YWJsZUV4cHJlc3Npb24sIGZhbHNlKSksXG5cdFx0XHRmYWxzZSxcblx0XHRcdGlmRWxzZShcblx0XHRcdFx0YW5kKGlzQ29uc3RhbnQoaXNEZWxldGVIaWRkZW4pLCBlcXVhbChpc0RlbGV0ZUhpZGRlbiwgY29uc3RhbnQodHJ1ZSkpKSxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdGlmRWxzZShcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpICE9PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCxcblx0XHRcdFx0XHRhbmQobm90KGlzRGVsZXRlSGlkZGVuKSwgVUkuSXNFZGl0YWJsZSksXG5cdFx0XHRcdFx0bm90KGFuZChpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbihpc0RlbGV0ZUhpZGRlbiksIGlzRGVsZXRlSGlkZGVuKSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdClcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdQYXN0ZScgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHBhcmFtIGNyZWF0ZVZpc2liaWxpdHlcbiAqIEBwYXJhbSBpc0luc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0ZWRcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdQYXN0ZScgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFzdGVWaXNpYmlsaXR5KFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHRjcmVhdGVWaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4sXG5cdGlzSW5zZXJ0VXBkYXRlQWN0aW9uc1RlbXBsYXRlZDogYm9vbGVhblxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Ly8gSWYgQ3JlYXRlIGlzIHZpc2libGUsIGVuYWJsZVBhc3RlIGlzIG5vdCBkaXNhYmxlZCBpbnRvIG1hbmlmZXN0IGFuZCB3ZSBhcmUgb24gT1AvYmxvY2tzIG91dHNpZGUgRmlvcmkgZWxlbWVudHMgdGVtcGxhdGVzXG5cdC8vIFRoZW4gYnV0dG9uIHdpbGwgYmUgdmlzaWJsZSBhY2NvcmRpbmcgdG8gaW5zZXJ0YWJsZSByZXN0cmljdGlvbnMgYW5kIGNyZWF0ZSB2aXNpYmlsaXR5XG5cdC8vIE90aGVyd2lzZSBpdCdzIG5vdCB2aXNpYmxlXG5cdHJldHVybiBhbmQoXG5cdFx0bm90RXF1YWwoc3RhbmRhcmRBY3Rpb25zQ29udGV4dC50YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5lbmFibGVQYXN0ZSwgZmFsc2UpLFxuXHRcdGNyZWF0ZVZpc2liaWxpdHksXG5cdFx0aXNJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGVkLFxuXHRcdFtUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCwgVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZV0uaW5kZXhPZihjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpKSA9PT0gLTEsXG5cdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dC5yZXN0cmljdGlvbnMuaXNJbnNlcnRhYmxlLmV4cHJlc3Npb25cblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdNYXNzRWRpdCcgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICd2aXNpYmxlJyBwcm9wZXJ0eSBvZiB0aGUgJ01hc3NFZGl0JyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXNzRWRpdFZpc2liaWxpdHkoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQ6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGlzVXBkYXRlSGlkZGVuID0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5oaWRkZW5Bbm5vdGF0aW9uLnVwZGF0ZSxcblx0XHRwYXRoVXBkYXRhYmxlRXhwcmVzc2lvbiA9IHN0YW5kYXJkQWN0aW9uc0NvbnRleHQucmVzdHJpY3Rpb25zLmlzVXBkYXRhYmxlLmV4cHJlc3Npb24sXG5cdFx0Yk1hc3NFZGl0RW5hYmxlZEluTWFuaWZlc3Q6IGJvb2xlYW4gPSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LnRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uPy5lbmFibGVNYXNzRWRpdCB8fCBmYWxzZTtcblx0Y29uc3QgdGVtcGxhdGVCaW5kaW5nRXhwcmVzc2lvbiA9XG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLk9iamVjdFBhZ2Vcblx0XHRcdD8gVUkuSXNFZGl0YWJsZVxuXHRcdFx0OiBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydDtcblx0Ly9NYXNzRWRpdCBpcyB2aXNpYmxlXG5cdC8vIElmXG5cdC8vXHRcdC0gdGhlcmUgaXMgbm8gc3RhdGljIHJlc3RyaWN0aW9ucyBzZXQgdG8gZmFsc2Vcblx0Ly9cdFx0LSBhbmQgZW5hYmxlTWFzc0VkaXQgaXMgbm90IHNldCB0byBmYWxzZSBpbnRvIHRoZSBtYW5pZmVzdFxuXHQvL1x0XHQtIGFuZCB0aGUgc2VsZWN0aW9uTW9kZSBpcyByZWxldmFudFxuXHQvL1x0VGhlbiBNYXNzRWRpdCBpcyBhbHdheXMgdmlzaWJsZSBpbiBMUiBvciBkeW5hbWljYWxseSB2aXNpYmxlIGluIE9QIGFjY29yZGluZyB0byB1aT5FZGl0YWJsZSBhbmQgaGlkZGVuQW5ub3RhdGlvblxuXHQvLyAgQnV0dG9uIGlzIGhpZGRlbiBmb3IgYWxsIG90aGVyIGNhc2VzXG5cdHJldHVybiBhbmQoXG5cdFx0bm90KGFuZChpc0NvbnN0YW50KHBhdGhVcGRhdGFibGVFeHByZXNzaW9uKSwgZXF1YWwocGF0aFVwZGF0YWJsZUV4cHJlc3Npb24sIGZhbHNlKSkpLFxuXHRcdGJNYXNzRWRpdEVuYWJsZWRJbk1hbmlmZXN0LFxuXHRcdHRlbXBsYXRlQmluZGluZ0V4cHJlc3Npb24sXG5cdFx0bm90KGlzVXBkYXRlSGlkZGVuKVxuXHQpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgY3JlYXRpb25Sb3cuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcGFyYW0gY3JlYXRpb25Sb3dWaXNpYmlsaXR5XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSBjcmVhdGlvblJvdy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENyZWF0aW9uUm93RW5hYmxlbWVudChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0Y3JlYXRpb25Sb3dWaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IHJlc3RyaWN0aW9uc0luc2VydGFibGUgPSBpc1BhdGhJbnNlcnRhYmxlKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLCB7XG5cdFx0aWdub3JlVGFyZ2V0Q29sbGVjdGlvbjogdHJ1ZSxcblx0XHRhdXRob3JpemVVbnJlc29sdmFibGU6IHRydWUsXG5cdFx0cGF0aFZpc2l0b3I6IChwYXRoOiBzdHJpbmcsIG5hdmlnYXRpb25QYXRoczogc3RyaW5nW10pID0+IHtcblx0XHRcdGlmIChwYXRoLmluZGV4T2YoXCIvXCIpID09PSAwKSB7XG5cdFx0XHRcdHBhdGggPSBzaW5nbGV0b25QYXRoVmlzaXRvcihwYXRoLCBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlZFR5cGVzKCksIG5hdmlnYXRpb25QYXRocyk7XG5cdFx0XHRcdHJldHVybiBwYXRoO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnRpZXMgPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKS5uYXZpZ2F0aW9uUHJvcGVydGllcztcblx0XHRcdGlmIChuYXZpZ2F0aW9uUHJvcGVydGllcykge1xuXHRcdFx0XHRjb25zdCBsYXN0TmF2ID0gbmF2aWdhdGlvblByb3BlcnRpZXNbbmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoIC0gMV07XG5cdFx0XHRcdGNvbnN0IHBhcnRuZXIgPSBpc05hdmlnYXRpb25Qcm9wZXJ0eShsYXN0TmF2KSAmJiBsYXN0TmF2LnBhcnRuZXI7XG5cdFx0XHRcdGlmIChwYXJ0bmVyKSB7XG5cdFx0XHRcdFx0cGF0aCA9IGAke3BhcnRuZXJ9LyR7cGF0aH1gO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcGF0aDtcblx0XHR9XG5cdH0pO1xuXHRjb25zdCBpc0luc2VydGFibGUgPVxuXHRcdHJlc3RyaWN0aW9uc0luc2VydGFibGUuX3R5cGUgPT09IFwiVW5yZXNvbHZhYmxlXCJcblx0XHRcdD8gaXNQYXRoSW5zZXJ0YWJsZShjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSwge1xuXHRcdFx0XHRcdHBhdGhWaXNpdG9yOiAocGF0aDogc3RyaW5nKSA9PiBzaW5nbGV0b25QYXRoVmlzaXRvcihwYXRoLCBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlZFR5cGVzKCksIFtdKVxuXHRcdFx0ICB9KVxuXHRcdFx0OiByZXN0cmljdGlvbnNJbnNlcnRhYmxlO1xuXG5cdHJldHVybiBhbmQoXG5cdFx0Y3JlYXRpb25Sb3dWaXNpYmlsaXR5LFxuXHRcdGlzSW5zZXJ0YWJsZSxcblx0XHRvcihcblx0XHRcdCFzdGFuZGFyZEFjdGlvbnNDb250ZXh0LnRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGEsXG5cdFx0XHRmb3JtYXRSZXN1bHQoW3BhdGhJbk1vZGVsKFwiY3JlYXRpb25Sb3dGaWVsZFZhbGlkaXR5XCIsIFwiaW50ZXJuYWxcIildLCB0YWJsZUZvcm1hdHRlcnMudmFsaWRhdGVDcmVhdGlvblJvd0ZpZWxkcylcblx0XHQpXG5cdCk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSAnQ3JlYXRlJyBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcGFyYW0gY3JlYXRlVmlzaWJpbGl0eVxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgJ0NyZWF0ZScgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3JlYXRlRW5hYmxlbWVudChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0Y3JlYXRlVmlzaWJpbGl0eTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRsZXQgY29uZGl0aW9uO1xuXHRpZiAoc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5JbmxpbmVDcmVhdGlvblJvd3MpIHtcblx0XHQvLyBmb3IgSW5saW5lIGNyZWF0aW9uIHJvd3MgY3JlYXRlIGNhbiBiZSBoaWRkZW4gdmlhIG1hbmlmZXN0IGFuZCB0aGlzIHNob3VsZCBub3QgaW1wYWN0IGl0cyBlbmFibGVtZW50XG5cdFx0Y29uZGl0aW9uID0gbm90KHN0YW5kYXJkQWN0aW9uc0NvbnRleHQuaGlkZGVuQW5ub3RhdGlvbi5jcmVhdGUpO1xuXHR9IGVsc2Uge1xuXHRcdGNvbmRpdGlvbiA9IGNyZWF0ZVZpc2liaWxpdHk7XG5cdH1cblx0Y29uc3QgaXNJbnNlcnRhYmxlID0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5yZXN0cmljdGlvbnMuaXNJbnNlcnRhYmxlLmV4cHJlc3Npb247XG5cdGNvbnN0IENvbGxlY3Rpb25UeXBlID0gY29udmVydGVyQ29udGV4dC5yZXNvbHZlQWJzb2x1dGVQYXRoPEVudGl0eVNldD4oc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5jb2xsZWN0aW9uUGF0aCkudGFyZ2V0O1xuXHRyZXR1cm4gYW5kKFxuXHRcdGNvbmRpdGlvbixcblx0XHRvcihcblx0XHRcdGlzRW50aXR5U2V0KENvbGxlY3Rpb25UeXBlKSxcblx0XHRcdGFuZChpc0luc2VydGFibGUsIG9yKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgIT09IFRlbXBsYXRlVHlwZS5PYmplY3RQYWdlLCBVSS5Jc0VkaXRhYmxlKSlcblx0XHQpXG5cdCk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSAnRGVsZXRlJyBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcGFyYW0gZGVsZXRlVmlzaWJpbGl0eVxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgJ0RlbGV0ZScgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVsZXRlRW5hYmxlbWVudChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0ZGVsZXRlVmlzaWJpbGl0eTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHQvLyBUaGUgZm9sbG93aW5nIGNvbnRleHRzIGFyZSBmaWxsZWQgYXQgcnVudGltZSB3aGVuIGEgdXNlciBzZWxlY3RzIG9uZSBvciBtb3JlIGl0ZW1zIGZyb20gYSBsaXN0LlxuXHQvLyBDaGVja3MgYXJlIHRoZW4gbWFkZSBpbiBmdW5jdGlvbiB1cGRhdGVEZWxldGVJbmZvRm9yU2VsZWN0ZWRDb250ZXh0cyBpbiBmaWxlIERlbGV0ZUhlbHBlciB0byBzZWUgaWYgdGhlcmVcblx0Ly8gYXJlIGl0ZW1zIHRoYXQgY2FuIGJlIGRlbGV0ZWQsIHRodXMgdGhlIGRlbGV0ZSBidXR0b24gc2hvdWxkIGJlIGVuYWJsZWQgaW4gdGhlc2UgY2FzZXMuXG5cdGNvbnN0IGRlbGV0YWJsZUNvbnRleHRzID0gcGF0aEluTW9kZWwoXCJkZWxldGFibGVDb250ZXh0c1wiLCBcImludGVybmFsXCIpO1xuXHRjb25zdCB1blNhdmVkQ29udGV4dHMgPSBwYXRoSW5Nb2RlbChcInVuU2F2ZWRDb250ZXh0c1wiLCBcImludGVybmFsXCIpO1xuXHRjb25zdCBkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlID0gcGF0aEluTW9kZWwoXCJkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlXCIsIFwiaW50ZXJuYWxcIik7XG5cdGNvbnN0IGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUgPSBwYXRoSW5Nb2RlbChcImRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmVcIiwgXCJpbnRlcm5hbFwiKTtcblxuXHQvLyBcIlVucmVzb2x2YWJsZVwiIGluIG5hdmlnYXRpb25FeHByZXNzaW9uIGlzIGludGVycHJldGVkIHRvIG1lYW4gdGhhdCB0aGVyZSBhcmUgbm8gbmF2aWdhdGlvbkV4cHJlc3Npb25zXG5cdC8vIGRlZmluZWQuXG5cdC8vIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQucmVzdHJpY3Rpb25zLmlzRGVsZXRhYmxlLmV4cHJlc3Npb24gaXMgYSBiaW5kaW5nIGV4cHJlc3Npb24gdGhhdCBjb21lc1xuXHQvLyBmcm9tIHRoZSBEZWxldGUgcmVzdHJpY3Rpb25zIGRlZmluZWQgaW4gTmF2aWdhdGlvblJlc3RyaWN0aW9ucyBmb3IgdGhpcyBlbnRpdHkuIEluIG9yZGVyIHRvXG5cdC8vIGJlIGRlbGV0YWJsZSwgdGhlIGl0ZW0gbXVzdCBhbHNvIGJlIGFsbG93ZWQgdG8gYmUgZGVsZXRhYmxlIGFjY29yZGluZyB0byB0aGUgRGVsZXRlIFJlc3RyaWN0aW9uc1xuXHQvLyBvbiB0aGUgZW50aXR5IGl0c2VsZi5cblx0cmV0dXJuIGFuZChcblx0XHRkZWxldGVWaXNpYmlsaXR5LFxuXHRcdG9yKFxuXHRcdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dC5yZXN0cmljdGlvbnMuaXNEZWxldGFibGUubmF2aWdhdGlvbkV4cHJlc3Npb24uX3R5cGUgPT09IFwiVW5yZXNvbHZhYmxlXCIsXG5cdFx0XHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0LnJlc3RyaWN0aW9ucy5pc0RlbGV0YWJsZS5leHByZXNzaW9uXG5cdFx0KSxcblx0XHRvcihcblx0XHRcdGFuZChub3RFcXVhbChkZWxldGFibGVDb250ZXh0cywgdW5kZWZpbmVkKSwgZ3JlYXRlclRoYW4obGVuZ3RoKGRlbGV0YWJsZUNvbnRleHRzKSwgMCkpLFxuXHRcdFx0YW5kKG5vdEVxdWFsKGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUsIHVuZGVmaW5lZCksIGdyZWF0ZXJUaGFuKGxlbmd0aChkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlKSwgMCkpLFxuXHRcdFx0YW5kKG5vdEVxdWFsKGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUsIHVuZGVmaW5lZCksIGdyZWF0ZXJUaGFuKGxlbmd0aChkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlKSwgMCkpLFxuXHRcdFx0YW5kKG5vdEVxdWFsKHVuU2F2ZWRDb250ZXh0cywgdW5kZWZpbmVkKSwgZ3JlYXRlclRoYW4obGVuZ3RoKHVuU2F2ZWRDb250ZXh0cyksIDApKVxuXHRcdClcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgdGhlICdQYXN0ZScgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBwYXN0ZVZpc2liaWxpdHlcbiAqIEBwYXJhbSBjcmVhdGVFbmFibGVtZW50XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSAnUGFzdGUnIGFjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBhc3RlRW5hYmxlbWVudChcblx0cGFzdGVWaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4sXG5cdGNyZWF0ZUVuYWJsZW1lbnQ6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPlxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0cmV0dXJuIGFuZChwYXN0ZVZpc2liaWxpdHksIGNyZWF0ZUVuYWJsZW1lbnQpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgJ01hc3NFZGl0JyBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcGFyYW0gbWFzc0VkaXRWaXNpYmlsaXR5XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSAnTWFzc0VkaXQnIGFjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1hc3NFZGl0RW5hYmxlbWVudChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0bWFzc0VkaXRWaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IHBhdGhVcGRhdGFibGVFeHByZXNzaW9uID0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5yZXN0cmljdGlvbnMuaXNVcGRhdGFibGUuZXhwcmVzc2lvbjtcblx0Y29uc3QgaXNPbmx5RHluYW1pY09uQ3VycmVudEVudGl0eSA9XG5cdFx0IWlzQ29uc3RhbnQocGF0aFVwZGF0YWJsZUV4cHJlc3Npb24pICYmXG5cdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dC5yZXN0cmljdGlvbnMuaXNVcGRhdGFibGUubmF2aWdhdGlvbkV4cHJlc3Npb24uX3R5cGUgPT09IFwiVW5yZXNvbHZhYmxlXCI7XG5cdGNvbnN0IG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9IGdyZWF0ZXJPckVxdWFsKHBhdGhJbk1vZGVsKFwibnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzXCIsIFwiaW50ZXJuYWxcIiksIDEpO1xuXHRjb25zdCBudW1iZXJPZlVwZGF0YWJsZUNvbnRleHRzID0gZ3JlYXRlck9yRXF1YWwobGVuZ3RoKHBhdGhJbk1vZGVsKFwidXBkYXRhYmxlQ29udGV4dHNcIiwgXCJpbnRlcm5hbFwiKSksIDEpO1xuXHRjb25zdCBiSXNEcmFmdFN1cHBvcnRlZCA9IE1vZGVsSGVscGVyLmlzT2JqZWN0UGF0aERyYWZ0U3VwcG9ydGVkKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpKTtcblx0Y29uc3QgYkRpc3BsYXlNb2RlID0gaXNJbkRpc3BsYXlNb2RlKGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdC8vIG51bWJlck9mVXBkYXRhYmxlQ29udGV4dHMgbmVlZHMgdG8gYmUgYWRkZWQgdG8gdGhlIGJpbmRpbmcgaW4gY2FzZVxuXHQvLyAxLiBVcGRhdGUgaXMgZGVwZW5kZW50IG9uIGN1cnJlbnQgZW50aXR5IHByb3BlcnR5IChpc09ubHlEeW5hbWljT25DdXJyZW50RW50aXR5IGlzIHRydWUpLlxuXHQvLyAyLiBUaGUgdGFibGUgaXMgcmVhZCBvbmx5IGFuZCBkcmFmdCBlbmFibGVkKGxpa2UgTFIpLCBpbiB0aGlzIGNhc2Ugb25seSBhY3RpdmUgY29udGV4dHMgY2FuIGJlIG1hc3MgZWRpdGVkLlxuXHQvLyAgICBTbywgdXBkYXRlIGRlcGVuZHMgb24gJ0lzQWN0aXZlRW50aXR5JyB2YWx1ZSB3aGljaCBuZWVkcyB0byBiZSBjaGVja2VkIHJ1bnRpbWUuXG5cdGNvbnN0IHJ1bnRpbWVCaW5kaW5nID0gaWZFbHNlKFxuXHRcdG9yKGFuZChiRGlzcGxheU1vZGUsIGJJc0RyYWZ0U3VwcG9ydGVkKSwgaXNPbmx5RHluYW1pY09uQ3VycmVudEVudGl0eSksXG5cdFx0YW5kKG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cywgbnVtYmVyT2ZVcGRhdGFibGVDb250ZXh0cyksXG5cdFx0YW5kKG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cylcblx0KTtcblxuXHRyZXR1cm4gYW5kKG1hc3NFZGl0VmlzaWJpbGl0eSwgaWZFbHNlKGlzT25seUR5bmFtaWNPbkN1cnJlbnRFbnRpdHksIHJ1bnRpbWVCaW5kaW5nLCBhbmQocnVudGltZUJpbmRpbmcsIHBhdGhVcGRhdGFibGVFeHByZXNzaW9uKSkpO1xufVxuXG4vKipcbiAqIFRlbGxzIGlmIHRoZSB0YWJsZSBpbiB0ZW1wbGF0ZSBpcyBpbiBkaXNwbGF5IG1vZGUuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSB2aWV3Q29uZmlndXJhdGlvblxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSB0YWJsZSBpcyBpbiBkaXNwbGF5IG1vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSW5EaXNwbGF5TW9kZShjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCB2aWV3Q29uZmlndXJhdGlvbj86IFZpZXdQYXRoQ29uZmlndXJhdGlvbik6IGJvb2xlYW4ge1xuXHRjb25zdCB0ZW1wbGF0ZVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpO1xuXHRpZiAoXG5cdFx0dGVtcGxhdGVUeXBlID09PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCB8fFxuXHRcdHRlbXBsYXRlVHlwZSA9PT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZSB8fFxuXHRcdCh2aWV3Q29uZmlndXJhdGlvbiAmJiBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnModmlld0NvbmZpZ3VyYXRpb24pKVxuXHQpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHQvLyB1cGRhdGFibGUgd2lsbCBiZSBoYW5kbGVkIGF0IHRoZSBwcm9wZXJ0eSBsZXZlbFxuXHRyZXR1cm4gZmFs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