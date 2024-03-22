/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/TitleHelper", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldTemplating", "sap/m/library", "sap/ui/base/ManagedObject", "sap/ui/model/odata/v4/AnnotationHelper"], function (BindingHelper, BindingToolkit, ModelHelper, TitleHelper, CommonHelper, FieldTemplating, mLibrary, ManagedObject, ODataModelAnnotationHelper) {
  "use strict";

  var _exports = {};
  var getTextBindingExpression = FieldTemplating.getTextBindingExpression;
  var formatValueRecursively = FieldTemplating.formatValueRecursively;
  var addTextArrangementToBindingExpression = FieldTemplating.addTextArrangementToBindingExpression;
  var getTitleBindingExpression = TitleHelper.getTitleBindingExpression;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  var Draft = BindingHelper.Draft;
  const ButtonType = mLibrary.ButtonType;
  const getExpressionForTitle = function (fullContextPath, viewData, headerInfo) {
    return getTitleBindingExpression(fullContextPath, getTextBindingExpression, undefined, headerInfo, viewData);
  };

  /**
   * Retrieves the expression for the description of an object page.
   *
   * @param fullContextPath The full context path used to reach that object page
   * @param oHeaderInfo The @UI.HeaderInfo annotation content
   * @param oHeaderInfo.Description
   * @returns The binding expression for the object page description
   */
  _exports.getExpressionForTitle = getExpressionForTitle;
  const getExpressionForDescription = function (fullContextPath, oHeaderInfo) {
    var _oHeaderInfo$Descript, _oHeaderInfo$Descript2, _oHeaderInfo$Descript3, _oHeaderInfo$Descript4, _oHeaderInfo$Descript5, _oHeaderInfo$Descript6, _oHeaderInfo$Descript7, _oHeaderInfo$Descript8, _oHeaderInfo$Descript9;
    let pathInModel = getExpressionFromAnnotation(oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Descript = oHeaderInfo.Description) === null || _oHeaderInfo$Descript === void 0 ? void 0 : _oHeaderInfo$Descript.Value);
    if (oHeaderInfo !== null && oHeaderInfo !== void 0 && (_oHeaderInfo$Descript2 = oHeaderInfo.Description) !== null && _oHeaderInfo$Descript2 !== void 0 && (_oHeaderInfo$Descript3 = _oHeaderInfo$Descript2.Value) !== null && _oHeaderInfo$Descript3 !== void 0 && (_oHeaderInfo$Descript4 = _oHeaderInfo$Descript3.$target) !== null && _oHeaderInfo$Descript4 !== void 0 && (_oHeaderInfo$Descript5 = _oHeaderInfo$Descript4.annotations) !== null && _oHeaderInfo$Descript5 !== void 0 && (_oHeaderInfo$Descript6 = _oHeaderInfo$Descript5.Common) !== null && _oHeaderInfo$Descript6 !== void 0 && (_oHeaderInfo$Descript7 = _oHeaderInfo$Descript6.Text) !== null && _oHeaderInfo$Descript7 !== void 0 && (_oHeaderInfo$Descript8 = _oHeaderInfo$Descript7.annotations) !== null && _oHeaderInfo$Descript8 !== void 0 && (_oHeaderInfo$Descript9 = _oHeaderInfo$Descript8.UI) !== null && _oHeaderInfo$Descript9 !== void 0 && _oHeaderInfo$Descript9.TextArrangement) {
      // In case an explicit text arrangement was set we make use of it in the description as well
      pathInModel = addTextArrangementToBindingExpression(pathInModel, fullContextPath);
    }
    return compileExpression(formatValueRecursively(pathInModel, fullContextPath));
  };

  /**
   * Return the expression for the save button.
   *
   * @param oViewData The current view data
   * @param fullContextPath The path used up until here
   * @returns The binding expression that shows the right save button text
   */
  _exports.getExpressionForDescription = getExpressionForDescription;
  const getExpressionForSaveButton = function (oViewData, fullContextPath) {
    var _annotations$Session;
    const saveButtonText = oViewData.resourceModel.getText("T_OP_OBJECT_PAGE_SAVE");
    const createButtonText = oViewData.resourceModel.getText("T_OP_OBJECT_PAGE_CREATE");
    let saveExpression;
    if ((_annotations$Session = fullContextPath.startingEntitySet.annotations.Session) !== null && _annotations$Session !== void 0 && _annotations$Session.StickySessionSupported) {
      // If we're in sticky mode AND the ui is in create mode, show Create, else show Save
      saveExpression = ifElse(UI.IsCreateMode, createButtonText, saveButtonText);
    } else {
      // If we're in draft AND the draft is a new object (!IsActiveEntity && !HasActiveEntity), show create, else show save
      saveExpression = ifElse(Draft.IsNewObject, createButtonText, saveButtonText);
    }
    return compileExpression(saveExpression);
  };

  /**
   * Method returns Whether the action type is manifest or not.
   *
   * @function
   * @name isManifestAction
   * @param oAction The action object
   * @returns `true` if action is coming from manifest, `false` otherwise
   */
  _exports.getExpressionForSaveButton = getExpressionForSaveButton;
  const isManifestAction = function (oAction) {
    const aActions = ["Primary", "DefaultApply", "Secondary", "ForAction", "ForNavigation", "SwitchToActiveObject", "SwitchToDraftObject", "DraftActions", "Copy"];
    return aActions.indexOf(oAction.type) < 0;
  };

  /**
   * Returns a compiled expression to determine Emphasized  button type based on Criticality across all actions
   * If critical action is rendered, its considered to be the primary action. Hence template's default primary action is set back to Default.
   *
   * @function
   * @static
   * @name sap.fe.templates.ObjectPage.ObjectPageTemplating.buildEmphasizedButtonExpression
   * @memberof sap.fe.templates.ObjectPage.ObjectPageTemplating
   * @param dataContextPath The dataModelObjectPath related to the context
   * @returns An expression to deduce if button type is Default or Emphasized
   * @private
   * @ui5-restricted
   */
  _exports.isManifestAction = isManifestAction;
  const buildEmphasizedButtonExpression = function (dataContextPath) {
    var _dataContextPath$targ, _dataContextPath$targ2, _dataContextPath$targ3;
    const identification = (_dataContextPath$targ = dataContextPath.targetEntityType) === null || _dataContextPath$targ === void 0 ? void 0 : (_dataContextPath$targ2 = _dataContextPath$targ.annotations) === null || _dataContextPath$targ2 === void 0 ? void 0 : (_dataContextPath$targ3 = _dataContextPath$targ2.UI) === null || _dataContextPath$targ3 === void 0 ? void 0 : _dataContextPath$targ3.Identification;
    const dataFieldsWithCriticality = (identification === null || identification === void 0 ? void 0 : identification.filter(dataField => dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && dataField.Criticality)) || [];
    const dataFieldsBindingExpressions = dataFieldsWithCriticality.length ? dataFieldsWithCriticality.map(dataField => {
      var _dataField$annotation, _dataField$annotation2;
      const criticalityVisibleBindingExpression = getExpressionFromAnnotation(dataField.Criticality);
      return and(not(equal(getExpressionFromAnnotation((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : _dataField$annotation2.Hidden), true)), or(equal(criticalityVisibleBindingExpression, "UI.CriticalityType/Negative"), equal(criticalityVisibleBindingExpression, "1"), equal(criticalityVisibleBindingExpression, 1), equal(criticalityVisibleBindingExpression, "UI.CriticalityType/Positive"), equal(criticalityVisibleBindingExpression, "3"), equal(criticalityVisibleBindingExpression, 3)));
    }) : [constant(false)];

    // If there is at least one visible dataField with criticality negative or positive, the type is set as Default
    // else it is emphasized
    return compileExpression(ifElse(or(...dataFieldsBindingExpressions), ButtonType.Default, ButtonType.Emphasized));
  };
  _exports.buildEmphasizedButtonExpression = buildEmphasizedButtonExpression;
  const getElementBinding = function (sPath) {
    const sNavigationPath = ODataModelAnnotationHelper.getNavigationPath(sPath);
    if (sNavigationPath) {
      return "{path:'" + sNavigationPath + "'}";
    } else {
      //no navigation property needs empty object
      return "{path: ''}";
    }
  };

  /**
   * Function to check if draft pattern is supported.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns the Boolean value based on draft state
   */
  _exports.getElementBinding = getElementBinding;
  const checkDraftState = function (oAnnotations) {
    if (oAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] && oAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"]["EditAction"]) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Function to get the visibility for the SwitchToActive button in the object page or subobject page.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns expression binding or Boolean value based on the draft state
   */
  _exports.checkDraftState = checkDraftState;
  const getSwitchToActiveVisibility = function (oAnnotations) {
    if (checkDraftState(oAnnotations)) {
      return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( ${ui>/isEditable} && !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
    } else {
      return false;
    }
  };

  /**
   * Function to get the visibility for the SwitchToDraft button in the object page or subobject page.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns expression binding or Boolean value based on the draft state
   */
  _exports.getSwitchToActiveVisibility = getSwitchToActiveVisibility;
  const getSwitchToDraftVisibility = function (oAnnotations) {
    if (checkDraftState(oAnnotations)) {
      return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !(${ui>/isEditable}) && !${ui>createMode} && ${HasDraftEntity} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
    } else {
      return false;
    }
  };

  /**
   * Function to get the visibility for the SwitchDraftAndActive button in the object page or subobject page.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns expression binding or Boolean value based on the draft state
   */
  _exports.getSwitchToDraftVisibility = getSwitchToDraftVisibility;
  const getSwitchDraftAndActiveVisibility = function (oAnnotations) {
    if (checkDraftState(oAnnotations)) {
      return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
    } else {
      return false;
    }
  };

  /**
   * Function to find an action from the array of header actions in the converter context.
   *
   * @param aConverterContextHeaderActions Array of 'header' actions on the object page.
   * @param sActionType The action type
   * @returns The action with the matching action type
   * @private
   */
  _exports.getSwitchDraftAndActiveVisibility = getSwitchDraftAndActiveVisibility;
  const _findAction = function (aConverterContextHeaderActions, sActionType) {
    let oAction;
    if (aConverterContextHeaderActions && aConverterContextHeaderActions.length) {
      oAction = aConverterContextHeaderActions.find(function (oHeaderAction) {
        return oHeaderAction.type === sActionType;
      });
    }
    return oAction;
  };

  /**
   * Function to format the 'enabled' property for the Delete button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports._findAction = _findAction;
  const getDeleteCommandExecutionEnabled = function (aConverterContextHeaderActions) {
    const oDeleteAction = _findAction(aConverterContextHeaderActions, "Secondary");
    return oDeleteAction ? oDeleteAction.enabled : "true";
  };

  /**
   * Function to format the 'visible' property for the Delete button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getDeleteCommandExecutionEnabled = getDeleteCommandExecutionEnabled;
  const getDeleteCommandExecutionVisible = function (aConverterContextHeaderActions) {
    const oDeleteAction = _findAction(aConverterContextHeaderActions, "Secondary");
    return oDeleteAction ? oDeleteAction.visible : "true";
  };

  /**
   * Function to format the 'visible' property for the Edit button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getDeleteCommandExecutionVisible = getDeleteCommandExecutionVisible;
  const getEditCommandExecutionVisible = function (aConverterContextHeaderActions) {
    const oEditAction = _findAction(aConverterContextHeaderActions, "Primary");
    return oEditAction ? oEditAction.visible : "false";
  };

  /**
   * Function to format the 'enabled' property for the Edit button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getEditCommandExecutionVisible = getEditCommandExecutionVisible;
  const getEditCommandExecutionEnabled = function (aConverterContextHeaderActions) {
    const oEditAction = _findAction(aConverterContextHeaderActions, "Primary");
    return oEditAction ? oEditAction.enabled : "false";
  };

  /**
   * Function to get the EditAction from the based on a draft-enabled application or a sticky application.
   *
   * @param [oEntitySet] The value from the expression.
   * @returns Returns expression binding or Boolean value based on vRawValue & oDraftNode
   */
  _exports.getEditCommandExecutionEnabled = getEditCommandExecutionEnabled;
  const getEditAction = function (oEntitySet) {
    const sPath = oEntitySet.getPath();
    const aPaths = sPath.split("/");
    const rootEntitySetPath = "/" + aPaths[1];
    // get the edit action from root entity sets
    const rootEntitySetAnnnotations = oEntitySet.getObject(rootEntitySetPath + "@");
    const bDraftRoot = rootEntitySetAnnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftRoot");
    const bDraftNode = rootEntitySetAnnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftNode");
    const bStickySession = rootEntitySetAnnnotations.hasOwnProperty("@com.sap.vocabularies.Session.v1.StickySessionSupported");
    let sActionName;
    if (bDraftRoot) {
      sActionName = oEntitySet.getObject(`${rootEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot/EditAction`);
    } else if (bDraftNode) {
      sActionName = oEntitySet.getObject(`${rootEntitySetPath}@com.sap.vocabularies.Common.v1.DraftNode/EditAction`);
    } else if (bStickySession) {
      sActionName = oEntitySet.getObject(`${rootEntitySetPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/EditAction`);
    }
    return !sActionName ? sActionName : `${rootEntitySetPath}/${sActionName}`;
  };
  _exports.getEditAction = getEditAction;
  const isReadOnlyFromStaticAnnotations = function (oAnnotations, oFieldControl) {
    let bComputed, bImmutable, bReadOnly;
    if (oAnnotations && oAnnotations["@Org.OData.Core.V1.Computed"]) {
      bComputed = oAnnotations["@Org.OData.Core.V1.Computed"].Bool ? oAnnotations["@Org.OData.Core.V1.Computed"].Bool == "true" : true;
    }
    if (oAnnotations && oAnnotations["@Org.OData.Core.V1.Immutable"]) {
      bImmutable = oAnnotations["@Org.OData.Core.V1.Immutable"].Bool ? oAnnotations["@Org.OData.Core.V1.Immutable"].Bool == "true" : true;
    }
    bReadOnly = bComputed || bImmutable;
    if (oFieldControl) {
      bReadOnly = bReadOnly || oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly";
    }
    if (bReadOnly) {
      return true;
    } else {
      return false;
    }
  };
  _exports.isReadOnlyFromStaticAnnotations = isReadOnlyFromStaticAnnotations;
  const readOnlyExpressionFromDynamicAnnotations = function (oFieldControl) {
    let sIsFieldControlPathReadOnly;
    if (oFieldControl) {
      if (ManagedObject.bindingParser(oFieldControl)) {
        sIsFieldControlPathReadOnly = "%" + oFieldControl + " === 1 ";
      }
    }
    if (sIsFieldControlPathReadOnly) {
      return "{= " + sIsFieldControlPathReadOnly + "? false : true }";
    } else {
      return undefined;
    }
  };

  /*
   * Function to get the expression for chart Title Press
   *
   * @functionw
   * @param {oConfiguration} [oConfigurations] control configuration from manifest
   *  @param {oManifest} [oManifest] Outbounds from manifest
   * returns {String} [sCollectionName] Collection Name of the Micro Chart
   *
   * returns {String} [Expression] Handler Expression for the title press
   *
   */
  _exports.readOnlyExpressionFromDynamicAnnotations = readOnlyExpressionFromDynamicAnnotations;
  const getExpressionForMicroChartTitlePress = function (oConfiguration, oManifestOutbound, sCollectionName) {
    if (oConfiguration) {
      if (oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"] || oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"] && oConfiguration["targetSections"]) {
        return ".handlers.onDataPointTitlePressed($controller, ${$source>/},'" + JSON.stringify(oManifestOutbound) + "','" + oConfiguration["targetOutbound"]["outbound"] + "','" + sCollectionName + "' )";
      } else if (oConfiguration["targetSections"]) {
        return ".handlers.navigateToSubSection($controller, '" + JSON.stringify(oConfiguration["targetSections"]) + "')";
      } else {
        return undefined;
      }
    }
  };

  /*
   * Function to render Chart Title as Link
   *
   * @function
   * @param {oControlConfiguration} [oConfigurations] control configuration from manifest
   * returns {String} [sKey] For the TargetOutbound and TargetSection
   *
   */
  _exports.getExpressionForMicroChartTitlePress = getExpressionForMicroChartTitlePress;
  const getMicroChartTitleAsLink = function (oControlConfiguration) {
    if (oControlConfiguration && (oControlConfiguration["targetOutbound"] || oControlConfiguration["targetOutbound"] && oControlConfiguration["targetSections"])) {
      return "External";
    } else if (oControlConfiguration && oControlConfiguration["targetSections"]) {
      return "InPage";
    } else {
      return "None";
    }
  };

  /* Get groupId from control configuration
   *
   * @function
   * @param {Object} [oConfigurations] control configuration from manifest
   * @param {String} [sAnnotationPath] Annotation Path for the configuration
   * @description Used to get the groupId for DataPoints and MicroCharts in the Header.
   *
   */
  _exports.getMicroChartTitleAsLink = getMicroChartTitleAsLink;
  const getGroupIdFromConfig = function (oConfigurations, sAnnotationPath, sDefaultGroupId) {
    const oConfiguration = oConfigurations[sAnnotationPath],
      aAutoPatterns = ["Heroes", "Decoration", "Workers", "LongRunners"];
    let sGroupId = sDefaultGroupId;
    if (oConfiguration && oConfiguration.requestGroupId && aAutoPatterns.some(function (autoPattern) {
      return autoPattern === oConfiguration.requestGroupId;
    })) {
      sGroupId = "$auto." + oConfiguration.requestGroupId;
    }
    return sGroupId;
  };

  /*
   * Get Context Binding with groupId from control configuration
   *
   * @function
   * @param {Object} [oConfigurations] control configuration from manifest
   * @param {String} [sKey] Annotation Path for of the configuration
   * @description Used to get the binding for DataPoints in the Header.
   *
   */
  _exports.getGroupIdFromConfig = getGroupIdFromConfig;
  const getBindingWithGroupIdFromConfig = function (oConfigurations, sKey) {
    const sGroupId = getGroupIdFromConfig(oConfigurations, sKey);
    let sBinding;
    if (sGroupId) {
      sBinding = "{ path : '', parameters : { $$groupId : '" + sGroupId + "' } }";
    }
    return sBinding;
  };

  /**
   * Method to check whether a FieldGroup consists of only 1 DataField with MultiLine Text annotation.
   *
   * @param aFormElements A collection of form elements used in the current field group
   * @returns Returns true if only 1 data field with Multiline Text annotation exists.
   */
  _exports.getBindingWithGroupIdFromConfig = getBindingWithGroupIdFromConfig;
  const doesFieldGroupContainOnlyOneMultiLineDataField = function (aFormElements) {
    return aFormElements && aFormElements.length === 1 && !!aFormElements[0].isValueMultilineText;
  };

  /*
   * Get visiblity of breadcrumbs.
   *
   * @function
   * @param {Object} [oViewData] ViewData model
   * returns {*} Expression or Boolean value
   */
  _exports.doesFieldGroupContainOnlyOneMultiLineDataField = doesFieldGroupContainOnlyOneMultiLineDataField;
  const getVisibleExpressionForBreadcrumbs = function (oViewData) {
    return oViewData.showBreadCrumbs && oViewData.fclEnabled !== undefined ? "{fclhelper>/breadCrumbIsVisible}" : oViewData.showBreadCrumbs;
  };

  /**
   *
   * @param viewData Specifies the ViewData model
   * @returns Expression or Boolean value
   */
  _exports.getVisibleExpressionForBreadcrumbs = getVisibleExpressionForBreadcrumbs;
  const getShareButtonVisibility = function (viewData) {
    let sShareButtonVisibilityExp = "!${ui>createMode}";
    if (viewData.fclEnabled) {
      sShareButtonVisibilityExp = "${fclhelper>/showShareIcon} && " + sShareButtonVisibilityExp;
    }
    if (viewData.isShareButtonVisibleForMyInbox === false) {
      return "false";
    }
    return "{= " + sShareButtonVisibilityExp + " }";
  };

  /*
   * Gets the visibility of the header info in edit mode
   *
   * If either the title or description field from the header annotations are editable, then the
   * editable header info is visible.
   *
   * @function
   * @param {object} [oAnnotations] Annotations object for given entity set
   * @param {object} [oFieldControl] field control
   * returns {*}  binding expression or boolean value resolved form funcitons isReadOnlyFromStaticAnnotations and isReadOnlyFromDynamicAnnotations
   */
  _exports.getShareButtonVisibility = getShareButtonVisibility;
  const getVisiblityOfHeaderInfo = function (oTitleAnnotations, oDescriptionAnnotations, oFieldTitleFieldControl, oFieldDescriptionFieldControl) {
    // Check Annotations for Title Field
    // Set to true and don't take into account, if there are no annotations, i.e. no title exists
    const bIsTitleReadOnly = oTitleAnnotations ? isReadOnlyFromStaticAnnotations(oTitleAnnotations, oFieldTitleFieldControl) : true;
    const titleExpression = readOnlyExpressionFromDynamicAnnotations(oFieldTitleFieldControl);
    // There is no expression and the title is not ready only, this is sufficient for an editable header
    if (!bIsTitleReadOnly && !titleExpression) {
      return true;
    }

    // Check Annotations for Description Field
    // Set to true and don't take into account, if there are no annotations, i.e. no description exists
    const bIsDescriptionReadOnly = oDescriptionAnnotations ? isReadOnlyFromStaticAnnotations(oDescriptionAnnotations, oFieldDescriptionFieldControl) : true;
    const descriptionExpression = readOnlyExpressionFromDynamicAnnotations(oFieldDescriptionFieldControl);
    // There is no expression and the description is not ready only, this is sufficient for an editable header
    if (!bIsDescriptionReadOnly && !descriptionExpression) {
      return true;
    }

    // Both title and description are not editable and there are no dynamic annotations
    if (bIsTitleReadOnly && bIsDescriptionReadOnly && !titleExpression && !descriptionExpression) {
      return false;
    }

    // Now combine expressions
    if (titleExpression && !descriptionExpression) {
      return titleExpression;
    } else if (!titleExpression && descriptionExpression) {
      return descriptionExpression;
    } else {
      return combineTitleAndDescriptionExpression(oFieldTitleFieldControl, oFieldDescriptionFieldControl);
    }
  };
  _exports.getVisiblityOfHeaderInfo = getVisiblityOfHeaderInfo;
  const combineTitleAndDescriptionExpression = function (oTitleFieldControl, oDescriptionFieldControl) {
    // If both header and title field are based on dynmaic field control, the editable header
    // is visible if at least one of these is not ready only
    return "{= %" + oTitleFieldControl + " === 1 ? ( %" + oDescriptionFieldControl + " === 1 ? false : true ) : true }";
  };

  /*
   * Get Expression of press event of delete button.
   *
   * @function
   * @param {string} [sEntitySetName] Entity set name
   * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
   */
  _exports.combineTitleAndDescriptionExpression = combineTitleAndDescriptionExpression;
  const getPressExpressionForDelete = function (entitySet, oInterface) {
    const sDeletableContexts = "${$view>/getBindingContext}",
      sTitle = "${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedHeading/getItems/1/getText}",
      sDescription = "${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedContent/0/getItems/0/getText}";
    const esContext = oInterface && oInterface.context;
    const contextPath = esContext.getPath();
    const contextPathParts = contextPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    const sEntitySetName = contextPathParts.length > 1 ? esContext.getModel().getObject(`/${contextPathParts.join("/")}@sapui.name`) : contextPathParts[0];
    const oParams = {
      title: sTitle,
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      description: sDescription
    };
    return CommonHelper.generateFunction(".editFlow.deleteDocument", sDeletableContexts, CommonHelper.objectToString(oParams));
  };
  getPressExpressionForDelete.requiresIContext = true;

  /*
   * Get Expression of press event of Edit button.
   *
   * @function
   * @param {object} [oDataField] Data field object
   * @param {string} [sEntitySetName] Entity set name
   * @param {object} [oHeaderAction] Header action object
   * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
   */
  _exports.getPressExpressionForDelete = getPressExpressionForDelete;
  const getPressExpressionForEdit = function (oDataField, sEntitySetName, oHeaderAction) {
    const sEditableContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
      sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
      sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    const oParams = {
      contexts: "${$view>/getBindingContext}",
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(oDataField && oDataField.Label, true),
      isNavigable: oHeaderAction && oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
    };
    return CommonHelper.generateFunction(".handlers.onCallAction", "${$view>/}", sEditableContexts, CommonHelper.objectToString(oParams));
  };

  /*
   * Method to get the expression for the 'press' event for footer annotation actions
   *
   * @function
   * @param {object} [oDataField] Data field object
   * @param {string} [sEntitySetName] Entity set name
   * @param {object} [oHeaderAction] Header action object
   * returns {string}  Binding expression or function string that is generated from the Commonhelper's function generateFunction
   */
  _exports.getPressExpressionForEdit = getPressExpressionForEdit;
  const getPressExpressionForFooterAnnotationAction = function (dataField, sEntitySetName, oHeaderAction) {
    const sActionContexts = CommonHelper.addSingleQuotes(dataField.Action),
      sDataFieldEnumMember = dataField.InvocationGrouping,
      sInvocationGroup = sDataFieldEnumMember === "UI.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    const oParams = {
      contexts: "${$view>/#fe::ObjectPage/}.getBindingContext()",
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(dataField.Label, true),
      isNavigable: oHeaderAction && oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
    };
    return CommonHelper.generateFunction(".handlers.onCallAction", "${$view>/}", sActionContexts, CommonHelper.objectToString(oParams));
  };

  /*
   * Get Expression of execute event expression of primary action.
   *
   * @function
   * @param {object} [oDataField] Data field object
   * @param {string} [sEntitySetName] Entity set name
   * @param {object} [oHeaderAction] Header action object
   * @param {CompiledBindingToolkitExpression | string} The visibility of sematic positive action
   * @param {CompiledBindingToolkitExpression | string} The enablement of semantic positive action
   * @param {CompiledBindingToolkitExpression | string} The Edit button visibility
   * @param {CompiledBindingToolkitExpression | string} The enablement of Edit button
   * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
   */
  _exports.getPressExpressionForFooterAnnotationAction = getPressExpressionForFooterAnnotationAction;
  const getPressExpressionForPrimaryAction = function (oDataField, sEntitySetName, oHeaderAction, positiveActionVisible, positiveActionEnabled, editActionVisible, editActionEnabled) {
    const sActionContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
      sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
      sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    const oParams = {
      contexts: "${$view>/#fe::ObjectPage/}.getBindingContext()",
      entitySetName: sEntitySetName ? CommonHelper.addSingleQuotes(sEntitySetName) : "",
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(oDataField === null || oDataField === void 0 ? void 0 : oDataField.Label, true),
      isNavigable: oHeaderAction === null || oHeaderAction === void 0 ? void 0 : oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction !== null && oHeaderAction !== void 0 && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
    };
    const oConditions = {
      positiveActionVisible,
      positiveActionEnabled,
      editActionVisible,
      editActionEnabled
    };
    return CommonHelper.generateFunction(".handlers.onPrimaryAction", "$controller", "${$view>/}", "${$view>/getBindingContext}", sActionContexts, CommonHelper.objectToString(oParams), CommonHelper.objectToString(oConditions));
  };

  /*
   * Gets the binding of the container HBox for the header facet.
   *
   * @function
   * @param {object} [oControlConfiguration] The control configuration form of the viewData model
   * @param {object} [oHeaderFacet] The object of the header facet
   * returns {*}  The binding expression from function getBindingWithGroupIdFromConfig or undefined.
   */
  _exports.getPressExpressionForPrimaryAction = getPressExpressionForPrimaryAction;
  const getStashableHBoxBinding = function (oControlConfiguration, oHeaderFacet) {
    if (oHeaderFacet && oHeaderFacet.Facet && oHeaderFacet.Facet.targetAnnotationType === "DataPoint") {
      return getBindingWithGroupIdFromConfig(oControlConfiguration, oHeaderFacet.Facet.targetAnnotationValue);
    }
  };

  /*
   * Gets the 'Press' event expression for the external and internal data point link.
   *
   * @function
   * @param {object} [oConfiguration] Control configuration from manifest
   * @param {object} [oManifestOutbound] Outbounds from manifest
   * returns {string} The runtime binding of the 'Press' event
   */
  _exports.getStashableHBoxBinding = getStashableHBoxBinding;
  const getPressExpressionForLink = function (oConfiguration, oManifestOutbound) {
    if (oConfiguration) {
      if (oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"]) {
        return ".handlers.onDataPointTitlePressed($controller, ${$source>}, " + JSON.stringify(oManifestOutbound) + "," + JSON.stringify(oConfiguration["targetOutbound"]["outbound"]) + ")";
      } else if (oConfiguration["targetSections"]) {
        return ".handlers.navigateToSubSection($controller, '" + JSON.stringify(oConfiguration["targetSections"]) + "')";
      } else {
        return undefined;
      }
    }
  };
  _exports.getPressExpressionForLink = getPressExpressionForLink;
  const getHeaderFormHboxRenderType = function (dataField) {
    var _dataField$targetObje;
    if ((dataField === null || dataField === void 0 ? void 0 : (_dataField$targetObje = dataField.targetObject) === null || _dataField$targetObje === void 0 ? void 0 : _dataField$targetObje.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      return undefined;
    }
    return "Bare";
  };

  /**
   * The default action group handler that is invoked when adding the menu button handling appropriately.
   *
   * @param oCtx The current context in which the handler is called
   * @param oAction The current action context
   * @param oDataFieldForDefaultAction The current dataField for the default action
   * @param defaultActionContextOrEntitySet The current context for the default action
   * @returns The appropriate expression string
   */
  _exports.getHeaderFormHboxRenderType = getHeaderFormHboxRenderType;
  function getDefaultActionHandler(oCtx, oAction, oDataFieldForDefaultAction, defaultActionContextOrEntitySet) {
    if (oAction.defaultAction) {
      try {
        switch (oAction.defaultAction.type) {
          case "ForAction":
            {
              return getPressExpressionForEdit(oDataFieldForDefaultAction, defaultActionContextOrEntitySet, oAction.defaultAction);
            }
          case "ForNavigation":
            {
              if (oAction.defaultAction.command) {
                return "cmd:" + oAction.defaultAction.command;
              } else {
                return oAction.defaultAction.press;
              }
            }
          default:
            {
              if (oAction.defaultAction.command) {
                return "cmd:" + oAction.defaultAction.command;
              }
              if (oAction.defaultAction.noWrap) {
                return oAction.defaultAction.press;
              } else {
                return CommonHelper.buildActionWrapper(oAction.defaultAction, {
                  id: "forTheObjectPage"
                });
              }
            }
        }
      } catch (ioEx) {
        return "binding for the default action is not working as expected";
      }
    }
    return undefined;
  }

  /**
   * Check if the sub section visualization is part of preview.
   *
   * @param subSection The sub section visualization
   * @returns A Boolean value
   */
  _exports.getDefaultActionHandler = getDefaultActionHandler;
  function isVisualizationIsPartOfPreview(subSection) {
    return subSection.isPartOfPreview === true || subSection.presentation.visualizations[0].type !== "Table";
  }
  _exports.isVisualizationIsPartOfPreview = isVisualizationIsPartOfPreview;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b25UeXBlIiwibUxpYnJhcnkiLCJnZXRFeHByZXNzaW9uRm9yVGl0bGUiLCJmdWxsQ29udGV4dFBhdGgiLCJ2aWV3RGF0YSIsImhlYWRlckluZm8iLCJnZXRUaXRsZUJpbmRpbmdFeHByZXNzaW9uIiwiZ2V0VGV4dEJpbmRpbmdFeHByZXNzaW9uIiwidW5kZWZpbmVkIiwiZ2V0RXhwcmVzc2lvbkZvckRlc2NyaXB0aW9uIiwib0hlYWRlckluZm8iLCJwYXRoSW5Nb2RlbCIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsIkRlc2NyaXB0aW9uIiwiVmFsdWUiLCIkdGFyZ2V0IiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJUZXh0IiwiVUkiLCJUZXh0QXJyYW5nZW1lbnQiLCJhZGRUZXh0QXJyYW5nZW1lbnRUb0JpbmRpbmdFeHByZXNzaW9uIiwiY29tcGlsZUV4cHJlc3Npb24iLCJmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5IiwiZ2V0RXhwcmVzc2lvbkZvclNhdmVCdXR0b24iLCJvVmlld0RhdGEiLCJzYXZlQnV0dG9uVGV4dCIsInJlc291cmNlTW9kZWwiLCJnZXRUZXh0IiwiY3JlYXRlQnV0dG9uVGV4dCIsInNhdmVFeHByZXNzaW9uIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJTZXNzaW9uIiwiU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsImlmRWxzZSIsIklzQ3JlYXRlTW9kZSIsIkRyYWZ0IiwiSXNOZXdPYmplY3QiLCJpc01hbmlmZXN0QWN0aW9uIiwib0FjdGlvbiIsImFBY3Rpb25zIiwiaW5kZXhPZiIsInR5cGUiLCJidWlsZEVtcGhhc2l6ZWRCdXR0b25FeHByZXNzaW9uIiwiZGF0YUNvbnRleHRQYXRoIiwiaWRlbnRpZmljYXRpb24iLCJ0YXJnZXRFbnRpdHlUeXBlIiwiSWRlbnRpZmljYXRpb24iLCJkYXRhRmllbGRzV2l0aENyaXRpY2FsaXR5IiwiZmlsdGVyIiwiZGF0YUZpZWxkIiwiJFR5cGUiLCJDcml0aWNhbGl0eSIsImRhdGFGaWVsZHNCaW5kaW5nRXhwcmVzc2lvbnMiLCJsZW5ndGgiLCJtYXAiLCJjcml0aWNhbGl0eVZpc2libGVCaW5kaW5nRXhwcmVzc2lvbiIsImFuZCIsIm5vdCIsImVxdWFsIiwiSGlkZGVuIiwib3IiLCJjb25zdGFudCIsIkRlZmF1bHQiLCJFbXBoYXNpemVkIiwiZ2V0RWxlbWVudEJpbmRpbmciLCJzUGF0aCIsInNOYXZpZ2F0aW9uUGF0aCIsIk9EYXRhTW9kZWxBbm5vdGF0aW9uSGVscGVyIiwiZ2V0TmF2aWdhdGlvblBhdGgiLCJjaGVja0RyYWZ0U3RhdGUiLCJvQW5ub3RhdGlvbnMiLCJnZXRTd2l0Y2hUb0FjdGl2ZVZpc2liaWxpdHkiLCJnZXRTd2l0Y2hUb0RyYWZ0VmlzaWJpbGl0eSIsImdldFN3aXRjaERyYWZ0QW5kQWN0aXZlVmlzaWJpbGl0eSIsIl9maW5kQWN0aW9uIiwiYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zIiwic0FjdGlvblR5cGUiLCJmaW5kIiwib0hlYWRlckFjdGlvbiIsImdldERlbGV0ZUNvbW1hbmRFeGVjdXRpb25FbmFibGVkIiwib0RlbGV0ZUFjdGlvbiIsImVuYWJsZWQiLCJnZXREZWxldGVDb21tYW5kRXhlY3V0aW9uVmlzaWJsZSIsInZpc2libGUiLCJnZXRFZGl0Q29tbWFuZEV4ZWN1dGlvblZpc2libGUiLCJvRWRpdEFjdGlvbiIsImdldEVkaXRDb21tYW5kRXhlY3V0aW9uRW5hYmxlZCIsImdldEVkaXRBY3Rpb24iLCJvRW50aXR5U2V0IiwiZ2V0UGF0aCIsImFQYXRocyIsInNwbGl0Iiwicm9vdEVudGl0eVNldFBhdGgiLCJyb290RW50aXR5U2V0QW5ubm90YXRpb25zIiwiZ2V0T2JqZWN0IiwiYkRyYWZ0Um9vdCIsImhhc093blByb3BlcnR5IiwiYkRyYWZ0Tm9kZSIsImJTdGlja3lTZXNzaW9uIiwic0FjdGlvbk5hbWUiLCJpc1JlYWRPbmx5RnJvbVN0YXRpY0Fubm90YXRpb25zIiwib0ZpZWxkQ29udHJvbCIsImJDb21wdXRlZCIsImJJbW11dGFibGUiLCJiUmVhZE9ubHkiLCJCb29sIiwicmVhZE9ubHlFeHByZXNzaW9uRnJvbUR5bmFtaWNBbm5vdGF0aW9ucyIsInNJc0ZpZWxkQ29udHJvbFBhdGhSZWFkT25seSIsIk1hbmFnZWRPYmplY3QiLCJiaW5kaW5nUGFyc2VyIiwiZ2V0RXhwcmVzc2lvbkZvck1pY3JvQ2hhcnRUaXRsZVByZXNzIiwib0NvbmZpZ3VyYXRpb24iLCJvTWFuaWZlc3RPdXRib3VuZCIsInNDb2xsZWN0aW9uTmFtZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJnZXRNaWNyb0NoYXJ0VGl0bGVBc0xpbmsiLCJvQ29udHJvbENvbmZpZ3VyYXRpb24iLCJnZXRHcm91cElkRnJvbUNvbmZpZyIsIm9Db25maWd1cmF0aW9ucyIsInNBbm5vdGF0aW9uUGF0aCIsInNEZWZhdWx0R3JvdXBJZCIsImFBdXRvUGF0dGVybnMiLCJzR3JvdXBJZCIsInJlcXVlc3RHcm91cElkIiwic29tZSIsImF1dG9QYXR0ZXJuIiwiZ2V0QmluZGluZ1dpdGhHcm91cElkRnJvbUNvbmZpZyIsInNLZXkiLCJzQmluZGluZyIsImRvZXNGaWVsZEdyb3VwQ29udGFpbk9ubHlPbmVNdWx0aUxpbmVEYXRhRmllbGQiLCJhRm9ybUVsZW1lbnRzIiwiaXNWYWx1ZU11bHRpbGluZVRleHQiLCJnZXRWaXNpYmxlRXhwcmVzc2lvbkZvckJyZWFkY3J1bWJzIiwic2hvd0JyZWFkQ3J1bWJzIiwiZmNsRW5hYmxlZCIsImdldFNoYXJlQnV0dG9uVmlzaWJpbGl0eSIsInNTaGFyZUJ1dHRvblZpc2liaWxpdHlFeHAiLCJpc1NoYXJlQnV0dG9uVmlzaWJsZUZvck15SW5ib3giLCJnZXRWaXNpYmxpdHlPZkhlYWRlckluZm8iLCJvVGl0bGVBbm5vdGF0aW9ucyIsIm9EZXNjcmlwdGlvbkFubm90YXRpb25zIiwib0ZpZWxkVGl0bGVGaWVsZENvbnRyb2wiLCJvRmllbGREZXNjcmlwdGlvbkZpZWxkQ29udHJvbCIsImJJc1RpdGxlUmVhZE9ubHkiLCJ0aXRsZUV4cHJlc3Npb24iLCJiSXNEZXNjcmlwdGlvblJlYWRPbmx5IiwiZGVzY3JpcHRpb25FeHByZXNzaW9uIiwiY29tYmluZVRpdGxlQW5kRGVzY3JpcHRpb25FeHByZXNzaW9uIiwib1RpdGxlRmllbGRDb250cm9sIiwib0Rlc2NyaXB0aW9uRmllbGRDb250cm9sIiwiZ2V0UHJlc3NFeHByZXNzaW9uRm9yRGVsZXRlIiwiZW50aXR5U2V0Iiwib0ludGVyZmFjZSIsInNEZWxldGFibGVDb250ZXh0cyIsInNUaXRsZSIsInNEZXNjcmlwdGlvbiIsImVzQ29udGV4dCIsImNvbnRleHQiLCJjb250ZXh0UGF0aCIsImNvbnRleHRQYXRoUGFydHMiLCJNb2RlbEhlbHBlciIsImZpbHRlck91dE5hdlByb3BCaW5kaW5nIiwic0VudGl0eVNldE5hbWUiLCJnZXRNb2RlbCIsImpvaW4iLCJvUGFyYW1zIiwidGl0bGUiLCJlbnRpdHlTZXROYW1lIiwiQ29tbW9uSGVscGVyIiwiYWRkU2luZ2xlUXVvdGVzIiwiZGVzY3JpcHRpb24iLCJnZW5lcmF0ZUZ1bmN0aW9uIiwib2JqZWN0VG9TdHJpbmciLCJyZXF1aXJlc0lDb250ZXh0IiwiZ2V0UHJlc3NFeHByZXNzaW9uRm9yRWRpdCIsIm9EYXRhRmllbGQiLCJzRWRpdGFibGVDb250ZXh0cyIsIkFjdGlvbiIsInNEYXRhRmllbGRFbnVtTWVtYmVyIiwiSW52b2NhdGlvbkdyb3VwaW5nIiwic0ludm9jYXRpb25Hcm91cCIsImNvbnRleHRzIiwiaW52b2NhdGlvbkdyb3VwaW5nIiwibW9kZWwiLCJsYWJlbCIsIkxhYmVsIiwiaXNOYXZpZ2FibGUiLCJkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24iLCJnZXRQcmVzc0V4cHJlc3Npb25Gb3JGb290ZXJBbm5vdGF0aW9uQWN0aW9uIiwic0FjdGlvbkNvbnRleHRzIiwiZ2V0UHJlc3NFeHByZXNzaW9uRm9yUHJpbWFyeUFjdGlvbiIsInBvc2l0aXZlQWN0aW9uVmlzaWJsZSIsInBvc2l0aXZlQWN0aW9uRW5hYmxlZCIsImVkaXRBY3Rpb25WaXNpYmxlIiwiZWRpdEFjdGlvbkVuYWJsZWQiLCJvQ29uZGl0aW9ucyIsImdldFN0YXNoYWJsZUhCb3hCaW5kaW5nIiwib0hlYWRlckZhY2V0IiwiRmFjZXQiLCJ0YXJnZXRBbm5vdGF0aW9uVHlwZSIsInRhcmdldEFubm90YXRpb25WYWx1ZSIsImdldFByZXNzRXhwcmVzc2lvbkZvckxpbmsiLCJnZXRIZWFkZXJGb3JtSGJveFJlbmRlclR5cGUiLCJ0YXJnZXRPYmplY3QiLCJnZXREZWZhdWx0QWN0aW9uSGFuZGxlciIsIm9DdHgiLCJvRGF0YUZpZWxkRm9yRGVmYXVsdEFjdGlvbiIsImRlZmF1bHRBY3Rpb25Db250ZXh0T3JFbnRpdHlTZXQiLCJkZWZhdWx0QWN0aW9uIiwiY29tbWFuZCIsInByZXNzIiwibm9XcmFwIiwiYnVpbGRBY3Rpb25XcmFwcGVyIiwiaWQiLCJpb0V4IiwiaXNWaXN1YWxpemF0aW9uSXNQYXJ0T2ZQcmV2aWV3Iiwic3ViU2VjdGlvbiIsImlzUGFydE9mUHJldmlldyIsInByZXNlbnRhdGlvbiIsInZpc3VhbGl6YXRpb25zIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJPYmplY3RQYWdlVGVtcGxhdGluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBGb3JtYXR0ZXJzIGZvciB0aGUgT2JqZWN0IFBhZ2VcbmltcG9ydCB7IEVudGl0eVNldCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBEYXRhRmllbGRGb3JBY3Rpb24sIERhdGFGaWVsZFR5cGVzLCBIZWFkZXJJbmZvVHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHR5cGUgeyBCYXNlQWN0aW9uLCBDdXN0b21BY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9PYmplY3RQYWdlL1N1YlNlY3Rpb25cIjtcbmltcG9ydCB7IERyYWZ0LCBVSSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQmluZGluZ0hlbHBlclwiO1xuaW1wb3J0IHtcblx0YW5kLFxuXHRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uc3RhbnQsXG5cdGVxdWFsLFxuXHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sXG5cdGlmRWxzZSxcblx0bm90LFxuXHRvclxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRUaXRsZUJpbmRpbmdFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVGl0bGVIZWxwZXJcIjtcbmltcG9ydCB7IFZpZXdEYXRhIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1RlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgQ29tcHV0ZWRBbm5vdGF0aW9uSW50ZXJmYWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IHtcblx0YWRkVGV4dEFycmFuZ2VtZW50VG9CaW5kaW5nRXhwcmVzc2lvbixcblx0Zm9ybWF0VmFsdWVSZWN1cnNpdmVseSxcblx0Z2V0VGV4dEJpbmRpbmdFeHByZXNzaW9uXG59IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuaW1wb3J0IG1MaWJyYXJ5IGZyb20gXCJzYXAvbS9saWJyYXJ5XCI7XG5pbXBvcnQgTWFuYWdlZE9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IE9EYXRhTW9kZWxBbm5vdGF0aW9uSGVscGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQW5ub3RhdGlvbkhlbHBlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcblxuY29uc3QgQnV0dG9uVHlwZSA9IG1MaWJyYXJ5LkJ1dHRvblR5cGU7XG5cbmV4cG9ydCBjb25zdCBnZXRFeHByZXNzaW9uRm9yVGl0bGUgPSBmdW5jdGlvbiAoXG5cdGZ1bGxDb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0dmlld0RhdGE6IFZpZXdEYXRhLFxuXHRoZWFkZXJJbmZvPzogSGVhZGVySW5mb1R5cGVcbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0cmV0dXJuIGdldFRpdGxlQmluZGluZ0V4cHJlc3Npb24oZnVsbENvbnRleHRQYXRoLCBnZXRUZXh0QmluZGluZ0V4cHJlc3Npb24sIHVuZGVmaW5lZCwgaGVhZGVySW5mbywgdmlld0RhdGEpO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGV4cHJlc3Npb24gZm9yIHRoZSBkZXNjcmlwdGlvbiBvZiBhbiBvYmplY3QgcGFnZS5cbiAqXG4gKiBAcGFyYW0gZnVsbENvbnRleHRQYXRoIFRoZSBmdWxsIGNvbnRleHQgcGF0aCB1c2VkIHRvIHJlYWNoIHRoYXQgb2JqZWN0IHBhZ2VcbiAqIEBwYXJhbSBvSGVhZGVySW5mbyBUaGUgQFVJLkhlYWRlckluZm8gYW5ub3RhdGlvbiBjb250ZW50XG4gKiBAcGFyYW0gb0hlYWRlckluZm8uRGVzY3JpcHRpb25cbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBvYmplY3QgcGFnZSBkZXNjcmlwdGlvblxuICovXG5leHBvcnQgY29uc3QgZ2V0RXhwcmVzc2lvbkZvckRlc2NyaXB0aW9uID0gZnVuY3Rpb24gKFxuXHRmdWxsQ29udGV4dFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdG9IZWFkZXJJbmZvPzogSGVhZGVySW5mb1R5cGVcbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0bGV0IHBhdGhJbk1vZGVsID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKChvSGVhZGVySW5mbz8uRGVzY3JpcHRpb24gYXMgRGF0YUZpZWxkVHlwZXMpPy5WYWx1ZSk7XG5cdGlmICgob0hlYWRlckluZm8/LkRlc2NyaXB0aW9uIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWU/LiR0YXJnZXQ/LmFubm90YXRpb25zPy5Db21tb24/LlRleHQ/LmFubm90YXRpb25zPy5VST8uVGV4dEFycmFuZ2VtZW50KSB7XG5cdFx0Ly8gSW4gY2FzZSBhbiBleHBsaWNpdCB0ZXh0IGFycmFuZ2VtZW50IHdhcyBzZXQgd2UgbWFrZSB1c2Ugb2YgaXQgaW4gdGhlIGRlc2NyaXB0aW9uIGFzIHdlbGxcblx0XHRwYXRoSW5Nb2RlbCA9IGFkZFRleHRBcnJhbmdlbWVudFRvQmluZGluZ0V4cHJlc3Npb24ocGF0aEluTW9kZWwsIGZ1bGxDb250ZXh0UGF0aCk7XG5cdH1cblxuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oZm9ybWF0VmFsdWVSZWN1cnNpdmVseShwYXRoSW5Nb2RlbCwgZnVsbENvbnRleHRQYXRoKSk7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgZXhwcmVzc2lvbiBmb3IgdGhlIHNhdmUgYnV0dG9uLlxuICpcbiAqIEBwYXJhbSBvVmlld0RhdGEgVGhlIGN1cnJlbnQgdmlldyBkYXRhXG4gKiBAcGFyYW0gZnVsbENvbnRleHRQYXRoIFRoZSBwYXRoIHVzZWQgdXAgdW50aWwgaGVyZVxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiB0aGF0IHNob3dzIHRoZSByaWdodCBzYXZlIGJ1dHRvbiB0ZXh0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeHByZXNzaW9uRm9yU2F2ZUJ1dHRvbiA9IGZ1bmN0aW9uIChcblx0b1ZpZXdEYXRhOiBWaWV3RGF0YSxcblx0ZnVsbENvbnRleHRQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoXG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGNvbnN0IHNhdmVCdXR0b25UZXh0ID0gb1ZpZXdEYXRhLnJlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfT1BfT0JKRUNUX1BBR0VfU0FWRVwiKTtcblx0Y29uc3QgY3JlYXRlQnV0dG9uVGV4dCA9IG9WaWV3RGF0YS5yZXNvdXJjZU1vZGVsLmdldFRleHQoXCJUX09QX09CSkVDVF9QQUdFX0NSRUFURVwiKTtcblx0bGV0IHNhdmVFeHByZXNzaW9uO1xuXG5cdGlmICgoZnVsbENvbnRleHRQYXRoLnN0YXJ0aW5nRW50aXR5U2V0IGFzIEVudGl0eVNldCkuYW5ub3RhdGlvbnMuU2Vzc2lvbj8uU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCkge1xuXHRcdC8vIElmIHdlJ3JlIGluIHN0aWNreSBtb2RlIEFORCB0aGUgdWkgaXMgaW4gY3JlYXRlIG1vZGUsIHNob3cgQ3JlYXRlLCBlbHNlIHNob3cgU2F2ZVxuXHRcdHNhdmVFeHByZXNzaW9uID0gaWZFbHNlKFVJLklzQ3JlYXRlTW9kZSwgY3JlYXRlQnV0dG9uVGV4dCwgc2F2ZUJ1dHRvblRleHQpO1xuXHR9IGVsc2Uge1xuXHRcdC8vIElmIHdlJ3JlIGluIGRyYWZ0IEFORCB0aGUgZHJhZnQgaXMgYSBuZXcgb2JqZWN0ICghSXNBY3RpdmVFbnRpdHkgJiYgIUhhc0FjdGl2ZUVudGl0eSksIHNob3cgY3JlYXRlLCBlbHNlIHNob3cgc2F2ZVxuXHRcdHNhdmVFeHByZXNzaW9uID0gaWZFbHNlKERyYWZ0LklzTmV3T2JqZWN0LCBjcmVhdGVCdXR0b25UZXh0LCBzYXZlQnV0dG9uVGV4dCk7XG5cdH1cblx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKHNhdmVFeHByZXNzaW9uKTtcbn07XG5cbi8qKlxuICogTWV0aG9kIHJldHVybnMgV2hldGhlciB0aGUgYWN0aW9uIHR5cGUgaXMgbWFuaWZlc3Qgb3Igbm90LlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgaXNNYW5pZmVzdEFjdGlvblxuICogQHBhcmFtIG9BY3Rpb24gVGhlIGFjdGlvbiBvYmplY3RcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBhY3Rpb24gaXMgY29taW5nIGZyb20gbWFuaWZlc3QsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBjb25zdCBpc01hbmlmZXN0QWN0aW9uID0gZnVuY3Rpb24gKG9BY3Rpb246IGFueSk6IG9BY3Rpb24gaXMgQ3VzdG9tQWN0aW9uIHtcblx0Y29uc3QgYUFjdGlvbnMgPSBbXG5cdFx0XCJQcmltYXJ5XCIsXG5cdFx0XCJEZWZhdWx0QXBwbHlcIixcblx0XHRcIlNlY29uZGFyeVwiLFxuXHRcdFwiRm9yQWN0aW9uXCIsXG5cdFx0XCJGb3JOYXZpZ2F0aW9uXCIsXG5cdFx0XCJTd2l0Y2hUb0FjdGl2ZU9iamVjdFwiLFxuXHRcdFwiU3dpdGNoVG9EcmFmdE9iamVjdFwiLFxuXHRcdFwiRHJhZnRBY3Rpb25zXCIsXG5cdFx0XCJDb3B5XCJcblx0XTtcblx0cmV0dXJuIGFBY3Rpb25zLmluZGV4T2Yob0FjdGlvbi50eXBlKSA8IDA7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBjb21waWxlZCBleHByZXNzaW9uIHRvIGRldGVybWluZSBFbXBoYXNpemVkICBidXR0b24gdHlwZSBiYXNlZCBvbiBDcml0aWNhbGl0eSBhY3Jvc3MgYWxsIGFjdGlvbnNcbiAqIElmIGNyaXRpY2FsIGFjdGlvbiBpcyByZW5kZXJlZCwgaXRzIGNvbnNpZGVyZWQgdG8gYmUgdGhlIHByaW1hcnkgYWN0aW9uLiBIZW5jZSB0ZW1wbGF0ZSdzIGRlZmF1bHQgcHJpbWFyeSBhY3Rpb24gaXMgc2V0IGJhY2sgdG8gRGVmYXVsdC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBuYW1lIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5PYmplY3RQYWdlVGVtcGxhdGluZy5idWlsZEVtcGhhc2l6ZWRCdXR0b25FeHByZXNzaW9uXG4gKiBAbWVtYmVyb2Ygc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLk9iamVjdFBhZ2VUZW1wbGF0aW5nXG4gKiBAcGFyYW0gZGF0YUNvbnRleHRQYXRoIFRoZSBkYXRhTW9kZWxPYmplY3RQYXRoIHJlbGF0ZWQgdG8gdGhlIGNvbnRleHRcbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gdG8gZGVkdWNlIGlmIGJ1dHRvbiB0eXBlIGlzIERlZmF1bHQgb3IgRW1waGFzaXplZFxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5leHBvcnQgY29uc3QgYnVpbGRFbXBoYXNpemVkQnV0dG9uRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChkYXRhQ29udGV4dFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0Y29uc3QgaWRlbnRpZmljYXRpb24gPSBkYXRhQ29udGV4dFBhdGgudGFyZ2V0RW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LlVJPy5JZGVudGlmaWNhdGlvbjtcblx0Y29uc3QgZGF0YUZpZWxkc1dpdGhDcml0aWNhbGl0eSA9XG5cdFx0aWRlbnRpZmljYXRpb24/LmZpbHRlcigoZGF0YUZpZWxkKSA9PiBkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbiAmJiBkYXRhRmllbGQuQ3JpdGljYWxpdHkpIHx8IFtdO1xuXG5cdGNvbnN0IGRhdGFGaWVsZHNCaW5kaW5nRXhwcmVzc2lvbnMgPSBkYXRhRmllbGRzV2l0aENyaXRpY2FsaXR5Lmxlbmd0aFxuXHRcdD8gZGF0YUZpZWxkc1dpdGhDcml0aWNhbGl0eS5tYXAoKGRhdGFGaWVsZCkgPT4ge1xuXHRcdFx0XHRjb25zdCBjcml0aWNhbGl0eVZpc2libGVCaW5kaW5nRXhwcmVzc2lvbiA9IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGQuQ3JpdGljYWxpdHkpO1xuXHRcdFx0XHRyZXR1cm4gYW5kKFxuXHRcdFx0XHRcdG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuKSwgdHJ1ZSkpLFxuXHRcdFx0XHRcdG9yKFxuXHRcdFx0XHRcdFx0ZXF1YWwoY3JpdGljYWxpdHlWaXNpYmxlQmluZGluZ0V4cHJlc3Npb24sIFwiVUkuQ3JpdGljYWxpdHlUeXBlL05lZ2F0aXZlXCIpLFxuXHRcdFx0XHRcdFx0ZXF1YWwoY3JpdGljYWxpdHlWaXNpYmxlQmluZGluZ0V4cHJlc3Npb24sIFwiMVwiKSxcblx0XHRcdFx0XHRcdGVxdWFsKGNyaXRpY2FsaXR5VmlzaWJsZUJpbmRpbmdFeHByZXNzaW9uIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxudW1iZXI+LCAxKSxcblx0XHRcdFx0XHRcdGVxdWFsKGNyaXRpY2FsaXR5VmlzaWJsZUJpbmRpbmdFeHByZXNzaW9uLCBcIlVJLkNyaXRpY2FsaXR5VHlwZS9Qb3NpdGl2ZVwiKSxcblx0XHRcdFx0XHRcdGVxdWFsKGNyaXRpY2FsaXR5VmlzaWJsZUJpbmRpbmdFeHByZXNzaW9uLCBcIjNcIiksXG5cdFx0XHRcdFx0XHRlcXVhbChjcml0aWNhbGl0eVZpc2libGVCaW5kaW5nRXhwcmVzc2lvbiBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248bnVtYmVyPiwgMylcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCk7XG5cdFx0ICB9KVxuXHRcdDogKFtjb25zdGFudChmYWxzZSldIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPltdKTtcblxuXHQvLyBJZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgdmlzaWJsZSBkYXRhRmllbGQgd2l0aCBjcml0aWNhbGl0eSBuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgdGhlIHR5cGUgaXMgc2V0IGFzIERlZmF1bHRcblx0Ly8gZWxzZSBpdCBpcyBlbXBoYXNpemVkXG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihpZkVsc2Uob3IoLi4uZGF0YUZpZWxkc0JpbmRpbmdFeHByZXNzaW9ucyksIEJ1dHRvblR5cGUuRGVmYXVsdCwgQnV0dG9uVHlwZS5FbXBoYXNpemVkKSk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0RWxlbWVudEJpbmRpbmcgPSBmdW5jdGlvbiAoc1BhdGg6IGFueSkge1xuXHRjb25zdCBzTmF2aWdhdGlvblBhdGggPSBPRGF0YU1vZGVsQW5ub3RhdGlvbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChzUGF0aCk7XG5cdGlmIChzTmF2aWdhdGlvblBhdGgpIHtcblx0XHRyZXR1cm4gXCJ7cGF0aDonXCIgKyBzTmF2aWdhdGlvblBhdGggKyBcIid9XCI7XG5cdH0gZWxzZSB7XG5cdFx0Ly9ubyBuYXZpZ2F0aW9uIHByb3BlcnR5IG5lZWRzIGVtcHR5IG9iamVjdFxuXHRcdHJldHVybiBcIntwYXRoOiAnJ31cIjtcblx0fVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGVjayBpZiBkcmFmdCBwYXR0ZXJuIGlzIHN1cHBvcnRlZC5cbiAqXG4gKiBAcGFyYW0gb0Fubm90YXRpb25zIEFubm90YXRpb25zIG9mIHRoZSBjdXJyZW50IGVudGl0eSBzZXQuXG4gKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBCb29sZWFuIHZhbHVlIGJhc2VkIG9uIGRyYWZ0IHN0YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBjaGVja0RyYWZ0U3RhdGUgPSBmdW5jdGlvbiAob0Fubm90YXRpb25zOiBhbnkpIHtcblx0aWYgKFxuXHRcdG9Bbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCJdICYmXG5cdFx0b0Fubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3RcIl1bXCJFZGl0QWN0aW9uXCJdXG5cdCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBnZXQgdGhlIHZpc2liaWxpdHkgZm9yIHRoZSBTd2l0Y2hUb0FjdGl2ZSBidXR0b24gaW4gdGhlIG9iamVjdCBwYWdlIG9yIHN1Ym9iamVjdCBwYWdlLlxuICpcbiAqIEBwYXJhbSBvQW5ub3RhdGlvbnMgQW5ub3RhdGlvbnMgb2YgdGhlIGN1cnJlbnQgZW50aXR5IHNldC5cbiAqIEByZXR1cm5zIFJldHVybnMgZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW4gdmFsdWUgYmFzZWQgb24gdGhlIGRyYWZ0IHN0YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTd2l0Y2hUb0FjdGl2ZVZpc2liaWxpdHkgPSBmdW5jdGlvbiAob0Fubm90YXRpb25zOiBhbnkpOiBhbnkge1xuXHRpZiAoY2hlY2tEcmFmdFN0YXRlKG9Bbm5vdGF0aW9ucykpIHtcblx0XHRyZXR1cm4gXCJ7PSAoJXtEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9EcmFmdElzQ3JlYXRlZEJ5TWV9KSA/ICggJHt1aT4vaXNFZGl0YWJsZX0gJiYgISR7dWk+Y3JlYXRlTW9kZX0gJiYgJXtEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9EcmFmdElzQ3JlYXRlZEJ5TWV9ICkgOiBmYWxzZSB9XCI7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGdldCB0aGUgdmlzaWJpbGl0eSBmb3IgdGhlIFN3aXRjaFRvRHJhZnQgYnV0dG9uIGluIHRoZSBvYmplY3QgcGFnZSBvciBzdWJvYmplY3QgcGFnZS5cbiAqXG4gKiBAcGFyYW0gb0Fubm90YXRpb25zIEFubm90YXRpb25zIG9mIHRoZSBjdXJyZW50IGVudGl0eSBzZXQuXG4gKiBAcmV0dXJucyBSZXR1cm5zIGV4cHJlc3Npb24gYmluZGluZyBvciBCb29sZWFuIHZhbHVlIGJhc2VkIG9uIHRoZSBkcmFmdCBzdGF0ZVxuICovXG5leHBvcnQgY29uc3QgZ2V0U3dpdGNoVG9EcmFmdFZpc2liaWxpdHkgPSBmdW5jdGlvbiAob0Fubm90YXRpb25zOiBhbnkpOiBhbnkge1xuXHRpZiAoY2hlY2tEcmFmdFN0YXRlKG9Bbm5vdGF0aW9ucykpIHtcblx0XHRyZXR1cm4gXCJ7PSAoJXtEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9EcmFmdElzQ3JlYXRlZEJ5TWV9KSA/ICggISgke3VpPi9pc0VkaXRhYmxlfSkgJiYgISR7dWk+Y3JlYXRlTW9kZX0gJiYgJHtIYXNEcmFmdEVudGl0eX0gJiYgJXtEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9EcmFmdElzQ3JlYXRlZEJ5TWV9ICkgOiBmYWxzZSB9XCI7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGdldCB0aGUgdmlzaWJpbGl0eSBmb3IgdGhlIFN3aXRjaERyYWZ0QW5kQWN0aXZlIGJ1dHRvbiBpbiB0aGUgb2JqZWN0IHBhZ2Ugb3Igc3Vib2JqZWN0IHBhZ2UuXG4gKlxuICogQHBhcmFtIG9Bbm5vdGF0aW9ucyBBbm5vdGF0aW9ucyBvZiB0aGUgY3VycmVudCBlbnRpdHkgc2V0LlxuICogQHJldHVybnMgUmV0dXJucyBleHByZXNzaW9uIGJpbmRpbmcgb3IgQm9vbGVhbiB2YWx1ZSBiYXNlZCBvbiB0aGUgZHJhZnQgc3RhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFN3aXRjaERyYWZ0QW5kQWN0aXZlVmlzaWJpbGl0eSA9IGZ1bmN0aW9uIChvQW5ub3RhdGlvbnM6IGFueSk6IGFueSB7XG5cdGlmIChjaGVja0RyYWZ0U3RhdGUob0Fubm90YXRpb25zKSkge1xuXHRcdHJldHVybiBcIns9ICgle0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0SXNDcmVhdGVkQnlNZX0pID8gKCAhJHt1aT5jcmVhdGVNb2RlfSAmJiAle0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0SXNDcmVhdGVkQnlNZX0gKSA6IGZhbHNlIH1cIjtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZmluZCBhbiBhY3Rpb24gZnJvbSB0aGUgYXJyYXkgb2YgaGVhZGVyIGFjdGlvbnMgaW4gdGhlIGNvbnZlcnRlciBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSBhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMgQXJyYXkgb2YgJ2hlYWRlcicgYWN0aW9ucyBvbiB0aGUgb2JqZWN0IHBhZ2UuXG4gKiBAcGFyYW0gc0FjdGlvblR5cGUgVGhlIGFjdGlvbiB0eXBlXG4gKiBAcmV0dXJucyBUaGUgYWN0aW9uIHdpdGggdGhlIG1hdGNoaW5nIGFjdGlvbiB0eXBlXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgX2ZpbmRBY3Rpb24gPSBmdW5jdGlvbiAoYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zOiBhbnlbXSwgc0FjdGlvblR5cGU6IHN0cmluZykge1xuXHRsZXQgb0FjdGlvbjtcblx0aWYgKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucyAmJiBhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0b0FjdGlvbiA9IGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucy5maW5kKGZ1bmN0aW9uIChvSGVhZGVyQWN0aW9uOiBhbnkpIHtcblx0XHRcdHJldHVybiBvSGVhZGVyQWN0aW9uLnR5cGUgPT09IHNBY3Rpb25UeXBlO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBvQWN0aW9uO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmb3JtYXQgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBmb3IgdGhlIERlbGV0ZSBidXR0b24gb24gdGhlIG9iamVjdCBwYWdlIG9yIHN1Ym9iamVjdCBwYWdlIGluIGNhc2Ugb2YgYSBDb21tYW5kIEV4ZWN1dGlvbi5cbiAqXG4gKiBAcGFyYW0gYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zIEFycmF5IG9mIGhlYWRlciBhY3Rpb25zIG9uIHRoZSBvYmplY3QgcGFnZVxuICogQHJldHVybnMgUmV0dXJucyBleHByZXNzaW9uIGJpbmRpbmcgb3IgQm9vbGVhbiB2YWx1ZSBmcm9tIHRoZSBjb252ZXJ0ZXIgb3V0cHV0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXREZWxldGVDb21tYW5kRXhlY3V0aW9uRW5hYmxlZCA9IGZ1bmN0aW9uIChhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnM6IGFueVtdKSB7XG5cdGNvbnN0IG9EZWxldGVBY3Rpb24gPSBfZmluZEFjdGlvbihhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMsIFwiU2Vjb25kYXJ5XCIpO1xuXHRyZXR1cm4gb0RlbGV0ZUFjdGlvbiA/IG9EZWxldGVBY3Rpb24uZW5hYmxlZCA6IFwidHJ1ZVwiO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmb3JtYXQgdGhlICd2aXNpYmxlJyBwcm9wZXJ0eSBmb3IgdGhlIERlbGV0ZSBidXR0b24gb24gdGhlIG9iamVjdCBwYWdlIG9yIHN1Ym9iamVjdCBwYWdlIGluIGNhc2Ugb2YgYSBDb21tYW5kIEV4ZWN1dGlvbi5cbiAqXG4gKiBAcGFyYW0gYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zIEFycmF5IG9mIGhlYWRlciBhY3Rpb25zIG9uIHRoZSBvYmplY3QgcGFnZVxuICogQHJldHVybnMgUmV0dXJucyBleHByZXNzaW9uIGJpbmRpbmcgb3IgQm9vbGVhbiB2YWx1ZSBmcm9tIHRoZSBjb252ZXJ0ZXIgb3V0cHV0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXREZWxldGVDb21tYW5kRXhlY3V0aW9uVmlzaWJsZSA9IGZ1bmN0aW9uIChhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnM6IGFueVtdKSB7XG5cdGNvbnN0IG9EZWxldGVBY3Rpb24gPSBfZmluZEFjdGlvbihhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMsIFwiU2Vjb25kYXJ5XCIpO1xuXHRyZXR1cm4gb0RlbGV0ZUFjdGlvbiA/IG9EZWxldGVBY3Rpb24udmlzaWJsZSA6IFwidHJ1ZVwiO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmb3JtYXQgdGhlICd2aXNpYmxlJyBwcm9wZXJ0eSBmb3IgdGhlIEVkaXQgYnV0dG9uIG9uIHRoZSBvYmplY3QgcGFnZSBvciBzdWJvYmplY3QgcGFnZSBpbiBjYXNlIG9mIGEgQ29tbWFuZCBFeGVjdXRpb24uXG4gKlxuICogQHBhcmFtIGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucyBBcnJheSBvZiBoZWFkZXIgYWN0aW9ucyBvbiB0aGUgb2JqZWN0IHBhZ2VcbiAqIEByZXR1cm5zIFJldHVybnMgZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW4gdmFsdWUgZnJvbSB0aGUgY29udmVydGVyIG91dHB1dFxuICovXG5leHBvcnQgY29uc3QgZ2V0RWRpdENvbW1hbmRFeGVjdXRpb25WaXNpYmxlID0gZnVuY3Rpb24gKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9uczogYW55W10pIHtcblx0Y29uc3Qgb0VkaXRBY3Rpb24gPSBfZmluZEFjdGlvbihhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMsIFwiUHJpbWFyeVwiKTtcblx0cmV0dXJuIG9FZGl0QWN0aW9uID8gb0VkaXRBY3Rpb24udmlzaWJsZSA6IFwiZmFsc2VcIjtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZm9ybWF0IHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgZm9yIHRoZSBFZGl0IGJ1dHRvbiBvbiB0aGUgb2JqZWN0IHBhZ2Ugb3Igc3Vib2JqZWN0IHBhZ2UgaW4gY2FzZSBvZiBhIENvbW1hbmQgRXhlY3V0aW9uLlxuICpcbiAqIEBwYXJhbSBhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMgQXJyYXkgb2YgaGVhZGVyIGFjdGlvbnMgb24gdGhlIG9iamVjdCBwYWdlXG4gKiBAcmV0dXJucyBSZXR1cm5zIGV4cHJlc3Npb24gYmluZGluZyBvciBCb29sZWFuIHZhbHVlIGZyb20gdGhlIGNvbnZlcnRlciBvdXRwdXRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEVkaXRDb21tYW5kRXhlY3V0aW9uRW5hYmxlZCA9IGZ1bmN0aW9uIChhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnM6IGFueVtdKSB7XG5cdGNvbnN0IG9FZGl0QWN0aW9uID0gX2ZpbmRBY3Rpb24oYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zLCBcIlByaW1hcnlcIik7XG5cdHJldHVybiBvRWRpdEFjdGlvbiA/IG9FZGl0QWN0aW9uLmVuYWJsZWQgOiBcImZhbHNlXCI7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGdldCB0aGUgRWRpdEFjdGlvbiBmcm9tIHRoZSBiYXNlZCBvbiBhIGRyYWZ0LWVuYWJsZWQgYXBwbGljYXRpb24gb3IgYSBzdGlja3kgYXBwbGljYXRpb24uXG4gKlxuICogQHBhcmFtIFtvRW50aXR5U2V0XSBUaGUgdmFsdWUgZnJvbSB0aGUgZXhwcmVzc2lvbi5cbiAqIEByZXR1cm5zIFJldHVybnMgZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW4gdmFsdWUgYmFzZWQgb24gdlJhd1ZhbHVlICYgb0RyYWZ0Tm9kZVxuICovXG5leHBvcnQgY29uc3QgZ2V0RWRpdEFjdGlvbiA9IGZ1bmN0aW9uIChvRW50aXR5U2V0OiBDb250ZXh0KSB7XG5cdGNvbnN0IHNQYXRoID0gb0VudGl0eVNldC5nZXRQYXRoKCk7XG5cdGNvbnN0IGFQYXRocyA9IHNQYXRoLnNwbGl0KFwiL1wiKTtcblx0Y29uc3Qgcm9vdEVudGl0eVNldFBhdGggPSBcIi9cIiArIGFQYXRoc1sxXTtcblx0Ly8gZ2V0IHRoZSBlZGl0IGFjdGlvbiBmcm9tIHJvb3QgZW50aXR5IHNldHNcblx0Y29uc3Qgcm9vdEVudGl0eVNldEFubm5vdGF0aW9ucyA9IG9FbnRpdHlTZXQuZ2V0T2JqZWN0KHJvb3RFbnRpdHlTZXRQYXRoICsgXCJAXCIpO1xuXHRjb25zdCBiRHJhZnRSb290ID0gcm9vdEVudGl0eVNldEFubm5vdGF0aW9ucy5oYXNPd25Qcm9wZXJ0eShcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCIpO1xuXHRjb25zdCBiRHJhZnROb2RlID0gcm9vdEVudGl0eVNldEFubm5vdGF0aW9ucy5oYXNPd25Qcm9wZXJ0eShcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnROb2RlXCIpO1xuXHRjb25zdCBiU3RpY2t5U2Vzc2lvbiA9IHJvb3RFbnRpdHlTZXRBbm5ub3RhdGlvbnMuaGFzT3duUHJvcGVydHkoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkXCIpO1xuXHRsZXQgc0FjdGlvbk5hbWU7XG5cdGlmIChiRHJhZnRSb290KSB7XG5cdFx0c0FjdGlvbk5hbWUgPSBvRW50aXR5U2V0LmdldE9iamVjdChgJHtyb290RW50aXR5U2V0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdC9FZGl0QWN0aW9uYCk7XG5cdH0gZWxzZSBpZiAoYkRyYWZ0Tm9kZSkge1xuXHRcdHNBY3Rpb25OYW1lID0gb0VudGl0eVNldC5nZXRPYmplY3QoYCR7cm9vdEVudGl0eVNldFBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGUvRWRpdEFjdGlvbmApO1xuXHR9IGVsc2UgaWYgKGJTdGlja3lTZXNzaW9uKSB7XG5cdFx0c0FjdGlvbk5hbWUgPSBvRW50aXR5U2V0LmdldE9iamVjdChgJHtyb290RW50aXR5U2V0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkL0VkaXRBY3Rpb25gKTtcblx0fVxuXHRyZXR1cm4gIXNBY3Rpb25OYW1lID8gc0FjdGlvbk5hbWUgOiBgJHtyb290RW50aXR5U2V0UGF0aH0vJHtzQWN0aW9uTmFtZX1gO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzUmVhZE9ubHlGcm9tU3RhdGljQW5ub3RhdGlvbnMgPSBmdW5jdGlvbiAob0Fubm90YXRpb25zOiBhbnksIG9GaWVsZENvbnRyb2w6IGFueSkge1xuXHRsZXQgYkNvbXB1dGVkLCBiSW1tdXRhYmxlLCBiUmVhZE9ubHk7XG5cdGlmIChvQW5ub3RhdGlvbnMgJiYgb0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkNvbXB1dGVkXCJdKSB7XG5cdFx0YkNvbXB1dGVkID0gb0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkNvbXB1dGVkXCJdLkJvb2wgPyBvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWRcIl0uQm9vbCA9PSBcInRydWVcIiA6IHRydWU7XG5cdH1cblx0aWYgKG9Bbm5vdGF0aW9ucyAmJiBvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuSW1tdXRhYmxlXCJdKSB7XG5cdFx0YkltbXV0YWJsZSA9IG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5JbW11dGFibGVcIl0uQm9vbCA/IG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5JbW11dGFibGVcIl0uQm9vbCA9PSBcInRydWVcIiA6IHRydWU7XG5cdH1cblx0YlJlYWRPbmx5ID0gYkNvbXB1dGVkIHx8IGJJbW11dGFibGU7XG5cblx0aWYgKG9GaWVsZENvbnRyb2wpIHtcblx0XHRiUmVhZE9ubHkgPSBiUmVhZE9ubHkgfHwgb0ZpZWxkQ29udHJvbCA9PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xUeXBlL1JlYWRPbmx5XCI7XG5cdH1cblx0aWYgKGJSZWFkT25seSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IHJlYWRPbmx5RXhwcmVzc2lvbkZyb21EeW5hbWljQW5ub3RhdGlvbnMgPSBmdW5jdGlvbiAob0ZpZWxkQ29udHJvbDogYW55KSB7XG5cdGxldCBzSXNGaWVsZENvbnRyb2xQYXRoUmVhZE9ubHk7XG5cdGlmIChvRmllbGRDb250cm9sKSB7XG5cdFx0aWYgKChNYW5hZ2VkT2JqZWN0IGFzIGFueSkuYmluZGluZ1BhcnNlcihvRmllbGRDb250cm9sKSkge1xuXHRcdFx0c0lzRmllbGRDb250cm9sUGF0aFJlYWRPbmx5ID0gXCIlXCIgKyBvRmllbGRDb250cm9sICsgXCIgPT09IDEgXCI7XG5cdFx0fVxuXHR9XG5cdGlmIChzSXNGaWVsZENvbnRyb2xQYXRoUmVhZE9ubHkpIHtcblx0XHRyZXR1cm4gXCJ7PSBcIiArIHNJc0ZpZWxkQ29udHJvbFBhdGhSZWFkT25seSArIFwiPyBmYWxzZSA6IHRydWUgfVwiO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG5cbi8qXG4gKiBGdW5jdGlvbiB0byBnZXQgdGhlIGV4cHJlc3Npb24gZm9yIGNoYXJ0IFRpdGxlIFByZXNzXG4gKlxuICogQGZ1bmN0aW9ud1xuICogQHBhcmFtIHtvQ29uZmlndXJhdGlvbn0gW29Db25maWd1cmF0aW9uc10gY29udHJvbCBjb25maWd1cmF0aW9uIGZyb20gbWFuaWZlc3RcbiAqICBAcGFyYW0ge29NYW5pZmVzdH0gW29NYW5pZmVzdF0gT3V0Ym91bmRzIGZyb20gbWFuaWZlc3RcbiAqIHJldHVybnMge1N0cmluZ30gW3NDb2xsZWN0aW9uTmFtZV0gQ29sbGVjdGlvbiBOYW1lIG9mIHRoZSBNaWNybyBDaGFydFxuICpcbiAqIHJldHVybnMge1N0cmluZ30gW0V4cHJlc3Npb25dIEhhbmRsZXIgRXhwcmVzc2lvbiBmb3IgdGhlIHRpdGxlIHByZXNzXG4gKlxuICovXG5leHBvcnQgY29uc3QgZ2V0RXhwcmVzc2lvbkZvck1pY3JvQ2hhcnRUaXRsZVByZXNzID0gZnVuY3Rpb24gKG9Db25maWd1cmF0aW9uOiBhbnksIG9NYW5pZmVzdE91dGJvdW5kOiBhbnksIHNDb2xsZWN0aW9uTmFtZTogYW55KSB7XG5cdGlmIChvQ29uZmlndXJhdGlvbikge1xuXHRcdGlmIChcblx0XHRcdChvQ29uZmlndXJhdGlvbltcInRhcmdldE91dGJvdW5kXCJdICYmIG9Db25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl1bXCJvdXRib3VuZFwiXSkgfHxcblx0XHRcdChvQ29uZmlndXJhdGlvbltcInRhcmdldE91dGJvdW5kXCJdICYmIG9Db25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl1bXCJvdXRib3VuZFwiXSAmJiBvQ29uZmlndXJhdGlvbltcInRhcmdldFNlY3Rpb25zXCJdKVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XCIuaGFuZGxlcnMub25EYXRhUG9pbnRUaXRsZVByZXNzZWQoJGNvbnRyb2xsZXIsICR7JHNvdXJjZT4vfSwnXCIgK1xuXHRcdFx0XHRKU09OLnN0cmluZ2lmeShvTWFuaWZlc3RPdXRib3VuZCkgK1xuXHRcdFx0XHRcIicsJ1wiICtcblx0XHRcdFx0b0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXVtcIm91dGJvdW5kXCJdICtcblx0XHRcdFx0XCInLCdcIiArXG5cdFx0XHRcdHNDb2xsZWN0aW9uTmFtZSArXG5cdFx0XHRcdFwiJyApXCJcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChvQ29uZmlndXJhdGlvbltcInRhcmdldFNlY3Rpb25zXCJdKSB7XG5cdFx0XHRyZXR1cm4gXCIuaGFuZGxlcnMubmF2aWdhdGVUb1N1YlNlY3Rpb24oJGNvbnRyb2xsZXIsICdcIiArIEpTT04uc3RyaW5naWZ5KG9Db25maWd1cmF0aW9uW1widGFyZ2V0U2VjdGlvbnNcIl0pICsgXCInKVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxufTtcblxuLypcbiAqIEZ1bmN0aW9uIHRvIHJlbmRlciBDaGFydCBUaXRsZSBhcyBMaW5rXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29Db250cm9sQ29uZmlndXJhdGlvbn0gW29Db25maWd1cmF0aW9uc10gY29udHJvbCBjb25maWd1cmF0aW9uIGZyb20gbWFuaWZlc3RcbiAqIHJldHVybnMge1N0cmluZ30gW3NLZXldIEZvciB0aGUgVGFyZ2V0T3V0Ym91bmQgYW5kIFRhcmdldFNlY3Rpb25cbiAqXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRNaWNyb0NoYXJ0VGl0bGVBc0xpbmsgPSBmdW5jdGlvbiAob0NvbnRyb2xDb25maWd1cmF0aW9uOiBhbnkpIHtcblx0aWYgKFxuXHRcdG9Db250cm9sQ29uZmlndXJhdGlvbiAmJlxuXHRcdChvQ29udHJvbENvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXSB8fCAob0NvbnRyb2xDb25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl0gJiYgb0NvbnRyb2xDb25maWd1cmF0aW9uW1widGFyZ2V0U2VjdGlvbnNcIl0pKVxuXHQpIHtcblx0XHRyZXR1cm4gXCJFeHRlcm5hbFwiO1xuXHR9IGVsc2UgaWYgKG9Db250cm9sQ29uZmlndXJhdGlvbiAmJiBvQ29udHJvbENvbmZpZ3VyYXRpb25bXCJ0YXJnZXRTZWN0aW9uc1wiXSkge1xuXHRcdHJldHVybiBcIkluUGFnZVwiO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBcIk5vbmVcIjtcblx0fVxufTtcblxuLyogR2V0IGdyb3VwSWQgZnJvbSBjb250cm9sIGNvbmZpZ3VyYXRpb25cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb0NvbmZpZ3VyYXRpb25zXSBjb250cm9sIGNvbmZpZ3VyYXRpb24gZnJvbSBtYW5pZmVzdFxuICogQHBhcmFtIHtTdHJpbmd9IFtzQW5ub3RhdGlvblBhdGhdIEFubm90YXRpb24gUGF0aCBmb3IgdGhlIGNvbmZpZ3VyYXRpb25cbiAqIEBkZXNjcmlwdGlvbiBVc2VkIHRvIGdldCB0aGUgZ3JvdXBJZCBmb3IgRGF0YVBvaW50cyBhbmQgTWljcm9DaGFydHMgaW4gdGhlIEhlYWRlci5cbiAqXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRHcm91cElkRnJvbUNvbmZpZyA9IGZ1bmN0aW9uIChvQ29uZmlndXJhdGlvbnM6IGFueSwgc0Fubm90YXRpb25QYXRoOiBhbnksIHNEZWZhdWx0R3JvdXBJZD86IGFueSkge1xuXHRjb25zdCBvQ29uZmlndXJhdGlvbiA9IG9Db25maWd1cmF0aW9uc1tzQW5ub3RhdGlvblBhdGhdLFxuXHRcdGFBdXRvUGF0dGVybnMgPSBbXCJIZXJvZXNcIiwgXCJEZWNvcmF0aW9uXCIsIFwiV29ya2Vyc1wiLCBcIkxvbmdSdW5uZXJzXCJdO1xuXHRsZXQgc0dyb3VwSWQgPSBzRGVmYXVsdEdyb3VwSWQ7XG5cdGlmIChcblx0XHRvQ29uZmlndXJhdGlvbiAmJlxuXHRcdG9Db25maWd1cmF0aW9uLnJlcXVlc3RHcm91cElkICYmXG5cdFx0YUF1dG9QYXR0ZXJucy5zb21lKGZ1bmN0aW9uIChhdXRvUGF0dGVybjogc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gYXV0b1BhdHRlcm4gPT09IG9Db25maWd1cmF0aW9uLnJlcXVlc3RHcm91cElkO1xuXHRcdH0pXG5cdCkge1xuXHRcdHNHcm91cElkID0gXCIkYXV0by5cIiArIG9Db25maWd1cmF0aW9uLnJlcXVlc3RHcm91cElkO1xuXHR9XG5cdHJldHVybiBzR3JvdXBJZDtcbn07XG5cbi8qXG4gKiBHZXQgQ29udGV4dCBCaW5kaW5nIHdpdGggZ3JvdXBJZCBmcm9tIGNvbnRyb2wgY29uZmlndXJhdGlvblxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtPYmplY3R9IFtvQ29uZmlndXJhdGlvbnNdIGNvbnRyb2wgY29uZmlndXJhdGlvbiBmcm9tIG1hbmlmZXN0XG4gKiBAcGFyYW0ge1N0cmluZ30gW3NLZXldIEFubm90YXRpb24gUGF0aCBmb3Igb2YgdGhlIGNvbmZpZ3VyYXRpb25cbiAqIEBkZXNjcmlwdGlvbiBVc2VkIHRvIGdldCB0aGUgYmluZGluZyBmb3IgRGF0YVBvaW50cyBpbiB0aGUgSGVhZGVyLlxuICpcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEJpbmRpbmdXaXRoR3JvdXBJZEZyb21Db25maWcgPSBmdW5jdGlvbiAob0NvbmZpZ3VyYXRpb25zOiBhbnksIHNLZXk6IGFueSkge1xuXHRjb25zdCBzR3JvdXBJZCA9IGdldEdyb3VwSWRGcm9tQ29uZmlnKG9Db25maWd1cmF0aW9ucywgc0tleSk7XG5cdGxldCBzQmluZGluZztcblx0aWYgKHNHcm91cElkKSB7XG5cdFx0c0JpbmRpbmcgPSBcInsgcGF0aCA6ICcnLCBwYXJhbWV0ZXJzIDogeyAkJGdyb3VwSWQgOiAnXCIgKyBzR3JvdXBJZCArIFwiJyB9IH1cIjtcblx0fVxuXHRyZXR1cm4gc0JpbmRpbmc7XG59O1xuXG4vKipcbiAqIE1ldGhvZCB0byBjaGVjayB3aGV0aGVyIGEgRmllbGRHcm91cCBjb25zaXN0cyBvZiBvbmx5IDEgRGF0YUZpZWxkIHdpdGggTXVsdGlMaW5lIFRleHQgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gYUZvcm1FbGVtZW50cyBBIGNvbGxlY3Rpb24gb2YgZm9ybSBlbGVtZW50cyB1c2VkIGluIHRoZSBjdXJyZW50IGZpZWxkIGdyb3VwXG4gKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgb25seSAxIGRhdGEgZmllbGQgd2l0aCBNdWx0aWxpbmUgVGV4dCBhbm5vdGF0aW9uIGV4aXN0cy5cbiAqL1xuZXhwb3J0IGNvbnN0IGRvZXNGaWVsZEdyb3VwQ29udGFpbk9ubHlPbmVNdWx0aUxpbmVEYXRhRmllbGQgPSBmdW5jdGlvbiAoYUZvcm1FbGVtZW50czogYW55W10pIHtcblx0cmV0dXJuIGFGb3JtRWxlbWVudHMgJiYgYUZvcm1FbGVtZW50cy5sZW5ndGggPT09IDEgJiYgISFhRm9ybUVsZW1lbnRzWzBdLmlzVmFsdWVNdWx0aWxpbmVUZXh0O1xufTtcblxuLypcbiAqIEdldCB2aXNpYmxpdHkgb2YgYnJlYWRjcnVtYnMuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gW29WaWV3RGF0YV0gVmlld0RhdGEgbW9kZWxcbiAqIHJldHVybnMgeyp9IEV4cHJlc3Npb24gb3IgQm9vbGVhbiB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZ2V0VmlzaWJsZUV4cHJlc3Npb25Gb3JCcmVhZGNydW1icyA9IGZ1bmN0aW9uIChvVmlld0RhdGE6IGFueSkge1xuXHRyZXR1cm4gb1ZpZXdEYXRhLnNob3dCcmVhZENydW1icyAmJiBvVmlld0RhdGEuZmNsRW5hYmxlZCAhPT0gdW5kZWZpbmVkID8gXCJ7ZmNsaGVscGVyPi9icmVhZENydW1iSXNWaXNpYmxlfVwiIDogb1ZpZXdEYXRhLnNob3dCcmVhZENydW1icztcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB2aWV3RGF0YSBTcGVjaWZpZXMgdGhlIFZpZXdEYXRhIG1vZGVsXG4gKiBAcmV0dXJucyBFeHByZXNzaW9uIG9yIEJvb2xlYW4gdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFNoYXJlQnV0dG9uVmlzaWJpbGl0eSA9IGZ1bmN0aW9uICh2aWV3RGF0YTogYW55KSB7XG5cdGxldCBzU2hhcmVCdXR0b25WaXNpYmlsaXR5RXhwID0gXCIhJHt1aT5jcmVhdGVNb2RlfVwiO1xuXHRpZiAodmlld0RhdGEuZmNsRW5hYmxlZCkge1xuXHRcdHNTaGFyZUJ1dHRvblZpc2liaWxpdHlFeHAgPSBcIiR7ZmNsaGVscGVyPi9zaG93U2hhcmVJY29ufSAmJiBcIiArIHNTaGFyZUJ1dHRvblZpc2liaWxpdHlFeHA7XG5cdH1cblx0aWYgKHZpZXdEYXRhLmlzU2hhcmVCdXR0b25WaXNpYmxlRm9yTXlJbmJveCA9PT0gZmFsc2UpIHtcblx0XHRyZXR1cm4gXCJmYWxzZVwiO1xuXHR9XG5cdHJldHVybiBcIns9IFwiICsgc1NoYXJlQnV0dG9uVmlzaWJpbGl0eUV4cCArIFwiIH1cIjtcbn07XG5cbi8qXG4gKiBHZXRzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBoZWFkZXIgaW5mbyBpbiBlZGl0IG1vZGVcbiAqXG4gKiBJZiBlaXRoZXIgdGhlIHRpdGxlIG9yIGRlc2NyaXB0aW9uIGZpZWxkIGZyb20gdGhlIGhlYWRlciBhbm5vdGF0aW9ucyBhcmUgZWRpdGFibGUsIHRoZW4gdGhlXG4gKiBlZGl0YWJsZSBoZWFkZXIgaW5mbyBpcyB2aXNpYmxlLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IFtvQW5ub3RhdGlvbnNdIEFubm90YXRpb25zIG9iamVjdCBmb3IgZ2l2ZW4gZW50aXR5IHNldFxuICogQHBhcmFtIHtvYmplY3R9IFtvRmllbGRDb250cm9sXSBmaWVsZCBjb250cm9sXG4gKiByZXR1cm5zIHsqfSAgYmluZGluZyBleHByZXNzaW9uIG9yIGJvb2xlYW4gdmFsdWUgcmVzb2x2ZWQgZm9ybSBmdW5jaXRvbnMgaXNSZWFkT25seUZyb21TdGF0aWNBbm5vdGF0aW9ucyBhbmQgaXNSZWFkT25seUZyb21EeW5hbWljQW5ub3RhdGlvbnNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFZpc2libGl0eU9mSGVhZGVySW5mbyA9IGZ1bmN0aW9uIChcblx0b1RpdGxlQW5ub3RhdGlvbnM6IGFueSxcblx0b0Rlc2NyaXB0aW9uQW5ub3RhdGlvbnM6IGFueSxcblx0b0ZpZWxkVGl0bGVGaWVsZENvbnRyb2w6IGFueSxcblx0b0ZpZWxkRGVzY3JpcHRpb25GaWVsZENvbnRyb2w6IGFueVxuKSB7XG5cdC8vIENoZWNrIEFubm90YXRpb25zIGZvciBUaXRsZSBGaWVsZFxuXHQvLyBTZXQgdG8gdHJ1ZSBhbmQgZG9uJ3QgdGFrZSBpbnRvIGFjY291bnQsIGlmIHRoZXJlIGFyZSBubyBhbm5vdGF0aW9ucywgaS5lLiBubyB0aXRsZSBleGlzdHNcblx0Y29uc3QgYklzVGl0bGVSZWFkT25seSA9IG9UaXRsZUFubm90YXRpb25zID8gaXNSZWFkT25seUZyb21TdGF0aWNBbm5vdGF0aW9ucyhvVGl0bGVBbm5vdGF0aW9ucywgb0ZpZWxkVGl0bGVGaWVsZENvbnRyb2wpIDogdHJ1ZTtcblx0Y29uc3QgdGl0bGVFeHByZXNzaW9uID0gcmVhZE9ubHlFeHByZXNzaW9uRnJvbUR5bmFtaWNBbm5vdGF0aW9ucyhvRmllbGRUaXRsZUZpZWxkQ29udHJvbCk7XG5cdC8vIFRoZXJlIGlzIG5vIGV4cHJlc3Npb24gYW5kIHRoZSB0aXRsZSBpcyBub3QgcmVhZHkgb25seSwgdGhpcyBpcyBzdWZmaWNpZW50IGZvciBhbiBlZGl0YWJsZSBoZWFkZXJcblx0aWYgKCFiSXNUaXRsZVJlYWRPbmx5ICYmICF0aXRsZUV4cHJlc3Npb24pIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIENoZWNrIEFubm90YXRpb25zIGZvciBEZXNjcmlwdGlvbiBGaWVsZFxuXHQvLyBTZXQgdG8gdHJ1ZSBhbmQgZG9uJ3QgdGFrZSBpbnRvIGFjY291bnQsIGlmIHRoZXJlIGFyZSBubyBhbm5vdGF0aW9ucywgaS5lLiBubyBkZXNjcmlwdGlvbiBleGlzdHNcblx0Y29uc3QgYklzRGVzY3JpcHRpb25SZWFkT25seSA9IG9EZXNjcmlwdGlvbkFubm90YXRpb25zXG5cdFx0PyBpc1JlYWRPbmx5RnJvbVN0YXRpY0Fubm90YXRpb25zKG9EZXNjcmlwdGlvbkFubm90YXRpb25zLCBvRmllbGREZXNjcmlwdGlvbkZpZWxkQ29udHJvbClcblx0XHQ6IHRydWU7XG5cdGNvbnN0IGRlc2NyaXB0aW9uRXhwcmVzc2lvbiA9IHJlYWRPbmx5RXhwcmVzc2lvbkZyb21EeW5hbWljQW5ub3RhdGlvbnMob0ZpZWxkRGVzY3JpcHRpb25GaWVsZENvbnRyb2wpO1xuXHQvLyBUaGVyZSBpcyBubyBleHByZXNzaW9uIGFuZCB0aGUgZGVzY3JpcHRpb24gaXMgbm90IHJlYWR5IG9ubHksIHRoaXMgaXMgc3VmZmljaWVudCBmb3IgYW4gZWRpdGFibGUgaGVhZGVyXG5cdGlmICghYklzRGVzY3JpcHRpb25SZWFkT25seSAmJiAhZGVzY3JpcHRpb25FeHByZXNzaW9uKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvLyBCb3RoIHRpdGxlIGFuZCBkZXNjcmlwdGlvbiBhcmUgbm90IGVkaXRhYmxlIGFuZCB0aGVyZSBhcmUgbm8gZHluYW1pYyBhbm5vdGF0aW9uc1xuXHRpZiAoYklzVGl0bGVSZWFkT25seSAmJiBiSXNEZXNjcmlwdGlvblJlYWRPbmx5ICYmICF0aXRsZUV4cHJlc3Npb24gJiYgIWRlc2NyaXB0aW9uRXhwcmVzc2lvbikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIE5vdyBjb21iaW5lIGV4cHJlc3Npb25zXG5cdGlmICh0aXRsZUV4cHJlc3Npb24gJiYgIWRlc2NyaXB0aW9uRXhwcmVzc2lvbikge1xuXHRcdHJldHVybiB0aXRsZUV4cHJlc3Npb247XG5cdH0gZWxzZSBpZiAoIXRpdGxlRXhwcmVzc2lvbiAmJiBkZXNjcmlwdGlvbkV4cHJlc3Npb24pIHtcblx0XHRyZXR1cm4gZGVzY3JpcHRpb25FeHByZXNzaW9uO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBjb21iaW5lVGl0bGVBbmREZXNjcmlwdGlvbkV4cHJlc3Npb24ob0ZpZWxkVGl0bGVGaWVsZENvbnRyb2wsIG9GaWVsZERlc2NyaXB0aW9uRmllbGRDb250cm9sKTtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGNvbWJpbmVUaXRsZUFuZERlc2NyaXB0aW9uRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChvVGl0bGVGaWVsZENvbnRyb2w6IGFueSwgb0Rlc2NyaXB0aW9uRmllbGRDb250cm9sOiBhbnkpIHtcblx0Ly8gSWYgYm90aCBoZWFkZXIgYW5kIHRpdGxlIGZpZWxkIGFyZSBiYXNlZCBvbiBkeW5tYWljIGZpZWxkIGNvbnRyb2wsIHRoZSBlZGl0YWJsZSBoZWFkZXJcblx0Ly8gaXMgdmlzaWJsZSBpZiBhdCBsZWFzdCBvbmUgb2YgdGhlc2UgaXMgbm90IHJlYWR5IG9ubHlcblx0cmV0dXJuIFwiez0gJVwiICsgb1RpdGxlRmllbGRDb250cm9sICsgXCIgPT09IDEgPyAoICVcIiArIG9EZXNjcmlwdGlvbkZpZWxkQ29udHJvbCArIFwiID09PSAxID8gZmFsc2UgOiB0cnVlICkgOiB0cnVlIH1cIjtcbn07XG5cbi8qXG4gKiBHZXQgRXhwcmVzc2lvbiBvZiBwcmVzcyBldmVudCBvZiBkZWxldGUgYnV0dG9uLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IFtzRW50aXR5U2V0TmFtZV0gRW50aXR5IHNldCBuYW1lXG4gKiByZXR1cm5zIHtzdHJpbmd9ICBiaW5kaW5nIGV4cHJlc3Npb24gLyBmdW5jdGlvbiBzdHJpbmcgZ2VuZXJhdGVkIGZyb20gY29tbWFuaGVscGVyJ3MgZnVuY3Rpb24gZ2VuZXJhdGVGdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZ2V0UHJlc3NFeHByZXNzaW9uRm9yRGVsZXRlID0gZnVuY3Rpb24gKGVudGl0eVNldDogT2JqZWN0LCBvSW50ZXJmYWNlOiBDb21wdXRlZEFubm90YXRpb25JbnRlcmZhY2UpOiBzdHJpbmcge1xuXHRjb25zdCBzRGVsZXRhYmxlQ29udGV4dHMgPSBcIiR7JHZpZXc+L2dldEJpbmRpbmdDb250ZXh0fVwiLFxuXHRcdHNUaXRsZSA9IFwiJHskdmlldz4vI2ZlOjpPYmplY3RQYWdlL2dldEhlYWRlclRpdGxlL2dldEV4cGFuZGVkSGVhZGluZy9nZXRJdGVtcy8xL2dldFRleHR9XCIsXG5cdFx0c0Rlc2NyaXB0aW9uID0gXCIkeyR2aWV3Pi8jZmU6Ok9iamVjdFBhZ2UvZ2V0SGVhZGVyVGl0bGUvZ2V0RXhwYW5kZWRDb250ZW50LzAvZ2V0SXRlbXMvMC9nZXRUZXh0fVwiO1xuXHRjb25zdCBlc0NvbnRleHQgPSBvSW50ZXJmYWNlICYmIG9JbnRlcmZhY2UuY29udGV4dDtcblx0Y29uc3QgY29udGV4dFBhdGggPSBlc0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRjb25zdCBjb250ZXh0UGF0aFBhcnRzID0gY29udGV4dFBhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZyk7XG5cdGNvbnN0IHNFbnRpdHlTZXROYW1lID1cblx0XHRjb250ZXh0UGF0aFBhcnRzLmxlbmd0aCA+IDEgPyBlc0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRPYmplY3QoYC8ke2NvbnRleHRQYXRoUGFydHMuam9pbihcIi9cIil9QHNhcHVpLm5hbWVgKSA6IGNvbnRleHRQYXRoUGFydHNbMF07XG5cdGNvbnN0IG9QYXJhbXMgPSB7XG5cdFx0dGl0bGU6IHNUaXRsZSxcblx0XHRlbnRpdHlTZXROYW1lOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNFbnRpdHlTZXROYW1lKSxcblx0XHRkZXNjcmlwdGlvbjogc0Rlc2NyaXB0aW9uXG5cdH07XG5cdHJldHVybiBDb21tb25IZWxwZXIuZ2VuZXJhdGVGdW5jdGlvbihcIi5lZGl0Rmxvdy5kZWxldGVEb2N1bWVudFwiLCBzRGVsZXRhYmxlQ29udGV4dHMsIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvUGFyYW1zKSk7XG59O1xuXG5nZXRQcmVzc0V4cHJlc3Npb25Gb3JEZWxldGUucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG5cbi8qXG4gKiBHZXQgRXhwcmVzc2lvbiBvZiBwcmVzcyBldmVudCBvZiBFZGl0IGJ1dHRvbi5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0RhdGFGaWVsZF0gRGF0YSBmaWVsZCBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc0VudGl0eVNldE5hbWVdIEVudGl0eSBzZXQgbmFtZVxuICogQHBhcmFtIHtvYmplY3R9IFtvSGVhZGVyQWN0aW9uXSBIZWFkZXIgYWN0aW9uIG9iamVjdFxuICogcmV0dXJucyB7c3RyaW5nfSAgYmluZGluZyBleHByZXNzaW9uIC8gZnVuY3Rpb24gc3RyaW5nIGdlbmVyYXRlZCBmcm9tIGNvbW1hbmhlbHBlcidzIGZ1bmN0aW9uIGdlbmVyYXRlRnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFByZXNzRXhwcmVzc2lvbkZvckVkaXQgPSBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBzRW50aXR5U2V0TmFtZTogYW55LCBvSGVhZGVyQWN0aW9uOiBhbnkpIHtcblx0Y29uc3Qgc0VkaXRhYmxlQ29udGV4dHMgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQgJiYgb0RhdGFGaWVsZC5BY3Rpb24pLFxuXHRcdHNEYXRhRmllbGRFbnVtTWVtYmVyID0gb0RhdGFGaWVsZCAmJiBvRGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZyAmJiBvRGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZ1tcIiRFbnVtTWVtYmVyXCJdLFxuXHRcdHNJbnZvY2F0aW9uR3JvdXAgPSBzRGF0YUZpZWxkRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5PcGVyYXRpb25Hcm91cGluZ1R5cGUvQ2hhbmdlU2V0XCIgPyBcIkNoYW5nZVNldFwiIDogXCJJc29sYXRlZFwiO1xuXHRjb25zdCBvUGFyYW1zID0ge1xuXHRcdGNvbnRleHRzOiBcIiR7JHZpZXc+L2dldEJpbmRpbmdDb250ZXh0fVwiLFxuXHRcdGVudGl0eVNldE5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0VudGl0eVNldE5hbWUpLFxuXHRcdGludm9jYXRpb25Hcm91cGluZzogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzSW52b2NhdGlvbkdyb3VwKSxcblx0XHRtb2RlbDogXCIkeyRzb3VyY2U+L30uZ2V0TW9kZWwoKVwiLFxuXHRcdGxhYmVsOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQgJiYgb0RhdGFGaWVsZC5MYWJlbCwgdHJ1ZSksXG5cdFx0aXNOYXZpZ2FibGU6IG9IZWFkZXJBY3Rpb24gJiYgb0hlYWRlckFjdGlvbi5pc05hdmlnYWJsZSxcblx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246XG5cdFx0XHRvSGVhZGVyQWN0aW9uICYmIG9IZWFkZXJBY3Rpb24uZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uID8gYCcke29IZWFkZXJBY3Rpb24uZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9ufSdgIDogdW5kZWZpbmVkXG5cdH07XG5cdHJldHVybiBDb21tb25IZWxwZXIuZ2VuZXJhdGVGdW5jdGlvbihcIi5oYW5kbGVycy5vbkNhbGxBY3Rpb25cIiwgXCIkeyR2aWV3Pi99XCIsIHNFZGl0YWJsZUNvbnRleHRzLCBDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob1BhcmFtcykpO1xufTtcblxuLypcbiAqIE1ldGhvZCB0byBnZXQgdGhlIGV4cHJlc3Npb24gZm9yIHRoZSAncHJlc3MnIGV2ZW50IGZvciBmb290ZXIgYW5ub3RhdGlvbiBhY3Rpb25zXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gW29EYXRhRmllbGRdIERhdGEgZmllbGQgb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gW3NFbnRpdHlTZXROYW1lXSBFbnRpdHkgc2V0IG5hbWVcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0hlYWRlckFjdGlvbl0gSGVhZGVyIGFjdGlvbiBvYmplY3RcbiAqIHJldHVybnMge3N0cmluZ30gIEJpbmRpbmcgZXhwcmVzc2lvbiBvciBmdW5jdGlvbiBzdHJpbmcgdGhhdCBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgQ29tbW9uaGVscGVyJ3MgZnVuY3Rpb24gZ2VuZXJhdGVGdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZ2V0UHJlc3NFeHByZXNzaW9uRm9yRm9vdGVyQW5ub3RhdGlvbkFjdGlvbiA9IGZ1bmN0aW9uIChcblx0ZGF0YUZpZWxkOiBEYXRhRmllbGRGb3JBY3Rpb24sXG5cdHNFbnRpdHlTZXROYW1lOiBhbnksXG5cdG9IZWFkZXJBY3Rpb246IGFueVxuKSB7XG5cdGNvbnN0IHNBY3Rpb25Db250ZXh0cyA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoZGF0YUZpZWxkLkFjdGlvbiBhcyBzdHJpbmcpLFxuXHRcdHNEYXRhRmllbGRFbnVtTWVtYmVyID0gZGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZyxcblx0XHRzSW52b2NhdGlvbkdyb3VwID0gc0RhdGFGaWVsZEVudW1NZW1iZXIgPT09IFwiVUkuT3BlcmF0aW9uR3JvdXBpbmdUeXBlL0NoYW5nZVNldFwiID8gXCJDaGFuZ2VTZXRcIiA6IFwiSXNvbGF0ZWRcIjtcblx0Y29uc3Qgb1BhcmFtcyA9IHtcblx0XHRjb250ZXh0czogXCIkeyR2aWV3Pi8jZmU6Ok9iamVjdFBhZ2UvfS5nZXRCaW5kaW5nQ29udGV4dCgpXCIsXG5cdFx0ZW50aXR5U2V0TmFtZTogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzRW50aXR5U2V0TmFtZSksXG5cdFx0aW52b2NhdGlvbkdyb3VwaW5nOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNJbnZvY2F0aW9uR3JvdXApLFxuXHRcdG1vZGVsOiBcIiR7JHNvdXJjZT4vfS5nZXRNb2RlbCgpXCIsXG5cdFx0bGFiZWw6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoZGF0YUZpZWxkLkxhYmVsIGFzIHN0cmluZywgdHJ1ZSksXG5cdFx0aXNOYXZpZ2FibGU6IG9IZWFkZXJBY3Rpb24gJiYgb0hlYWRlckFjdGlvbi5pc05hdmlnYWJsZSxcblx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246XG5cdFx0XHRvSGVhZGVyQWN0aW9uICYmIG9IZWFkZXJBY3Rpb24uZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uID8gYCcke29IZWFkZXJBY3Rpb24uZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9ufSdgIDogdW5kZWZpbmVkXG5cdH07XG5cdHJldHVybiBDb21tb25IZWxwZXIuZ2VuZXJhdGVGdW5jdGlvbihcIi5oYW5kbGVycy5vbkNhbGxBY3Rpb25cIiwgXCIkeyR2aWV3Pi99XCIsIHNBY3Rpb25Db250ZXh0cywgQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9QYXJhbXMpKTtcbn07XG5cbi8qXG4gKiBHZXQgRXhwcmVzc2lvbiBvZiBleGVjdXRlIGV2ZW50IGV4cHJlc3Npb24gb2YgcHJpbWFyeSBhY3Rpb24uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gW29EYXRhRmllbGRdIERhdGEgZmllbGQgb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gW3NFbnRpdHlTZXROYW1lXSBFbnRpdHkgc2V0IG5hbWVcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0hlYWRlckFjdGlvbl0gSGVhZGVyIGFjdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7Q29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCBzdHJpbmd9IFRoZSB2aXNpYmlsaXR5IG9mIHNlbWF0aWMgcG9zaXRpdmUgYWN0aW9uXG4gKiBAcGFyYW0ge0NvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgc3RyaW5nfSBUaGUgZW5hYmxlbWVudCBvZiBzZW1hbnRpYyBwb3NpdGl2ZSBhY3Rpb25cbiAqIEBwYXJhbSB7Q29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCBzdHJpbmd9IFRoZSBFZGl0IGJ1dHRvbiB2aXNpYmlsaXR5XG4gKiBAcGFyYW0ge0NvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgc3RyaW5nfSBUaGUgZW5hYmxlbWVudCBvZiBFZGl0IGJ1dHRvblxuICogcmV0dXJucyB7c3RyaW5nfSAgYmluZGluZyBleHByZXNzaW9uIC8gZnVuY3Rpb24gc3RyaW5nIGdlbmVyYXRlZCBmcm9tIGNvbW1hbmhlbHBlcidzIGZ1bmN0aW9uIGdlbmVyYXRlRnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFByZXNzRXhwcmVzc2lvbkZvclByaW1hcnlBY3Rpb24gPSBmdW5jdGlvbiAoXG5cdG9EYXRhRmllbGQ6IGFueSxcblx0c0VudGl0eVNldE5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0b0hlYWRlckFjdGlvbjogQmFzZUFjdGlvbiB8IG51bGwsXG5cdHBvc2l0aXZlQWN0aW9uVmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCBzdHJpbmcsXG5cdHBvc2l0aXZlQWN0aW9uRW5hYmxlZDogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCBzdHJpbmcsXG5cdGVkaXRBY3Rpb25WaXNpYmxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHN0cmluZyxcblx0ZWRpdEFjdGlvbkVuYWJsZWQ6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgc3RyaW5nXG4pIHtcblx0Y29uc3Qgc0FjdGlvbkNvbnRleHRzID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvRGF0YUZpZWxkICYmIG9EYXRhRmllbGQuQWN0aW9uKSxcblx0XHRzRGF0YUZpZWxkRW51bU1lbWJlciA9IG9EYXRhRmllbGQgJiYgb0RhdGFGaWVsZC5JbnZvY2F0aW9uR3JvdXBpbmcgJiYgb0RhdGFGaWVsZC5JbnZvY2F0aW9uR3JvdXBpbmdbXCIkRW51bU1lbWJlclwiXSxcblx0XHRzSW52b2NhdGlvbkdyb3VwID0gc0RhdGFGaWVsZEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuT3BlcmF0aW9uR3JvdXBpbmdUeXBlL0NoYW5nZVNldFwiID8gXCJDaGFuZ2VTZXRcIiA6IFwiSXNvbGF0ZWRcIjtcblx0Y29uc3Qgb1BhcmFtcyA9IHtcblx0XHRjb250ZXh0czogXCIkeyR2aWV3Pi8jZmU6Ok9iamVjdFBhZ2UvfS5nZXRCaW5kaW5nQ29udGV4dCgpXCIsXG5cdFx0ZW50aXR5U2V0TmFtZTogc0VudGl0eVNldE5hbWUgPyBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNFbnRpdHlTZXROYW1lKSA6IFwiXCIsXG5cdFx0aW52b2NhdGlvbkdyb3VwaW5nOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNJbnZvY2F0aW9uR3JvdXApLFxuXHRcdG1vZGVsOiBcIiR7JHNvdXJjZT4vfS5nZXRNb2RlbCgpXCIsXG5cdFx0bGFiZWw6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZD8uTGFiZWwsIHRydWUpLFxuXHRcdGlzTmF2aWdhYmxlOiBvSGVhZGVyQWN0aW9uPy5pc05hdmlnYWJsZSxcblx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246IG9IZWFkZXJBY3Rpb24/LmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvblxuXHRcdFx0PyBgJyR7b0hlYWRlckFjdGlvbi5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb259J2Bcblx0XHRcdDogdW5kZWZpbmVkXG5cdH07XG5cdGNvbnN0IG9Db25kaXRpb25zID0ge1xuXHRcdHBvc2l0aXZlQWN0aW9uVmlzaWJsZSxcblx0XHRwb3NpdGl2ZUFjdGlvbkVuYWJsZWQsXG5cdFx0ZWRpdEFjdGlvblZpc2libGUsXG5cdFx0ZWRpdEFjdGlvbkVuYWJsZWRcblx0fTtcblx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFxuXHRcdFwiLmhhbmRsZXJzLm9uUHJpbWFyeUFjdGlvblwiLFxuXHRcdFwiJGNvbnRyb2xsZXJcIixcblx0XHRcIiR7JHZpZXc+L31cIixcblx0XHRcIiR7JHZpZXc+L2dldEJpbmRpbmdDb250ZXh0fVwiLFxuXHRcdHNBY3Rpb25Db250ZXh0cyxcblx0XHRDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob1BhcmFtcyksXG5cdFx0Q29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9Db25kaXRpb25zKVxuXHQpO1xufTtcblxuLypcbiAqIEdldHMgdGhlIGJpbmRpbmcgb2YgdGhlIGNvbnRhaW5lciBIQm94IGZvciB0aGUgaGVhZGVyIGZhY2V0LlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IFtvQ29udHJvbENvbmZpZ3VyYXRpb25dIFRoZSBjb250cm9sIGNvbmZpZ3VyYXRpb24gZm9ybSBvZiB0aGUgdmlld0RhdGEgbW9kZWxcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0hlYWRlckZhY2V0XSBUaGUgb2JqZWN0IG9mIHRoZSBoZWFkZXIgZmFjZXRcbiAqIHJldHVybnMgeyp9ICBUaGUgYmluZGluZyBleHByZXNzaW9uIGZyb20gZnVuY3Rpb24gZ2V0QmluZGluZ1dpdGhHcm91cElkRnJvbUNvbmZpZyBvciB1bmRlZmluZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTdGFzaGFibGVIQm94QmluZGluZyA9IGZ1bmN0aW9uIChvQ29udHJvbENvbmZpZ3VyYXRpb246IGFueSwgb0hlYWRlckZhY2V0OiBhbnkpIHtcblx0aWYgKG9IZWFkZXJGYWNldCAmJiBvSGVhZGVyRmFjZXQuRmFjZXQgJiYgb0hlYWRlckZhY2V0LkZhY2V0LnRhcmdldEFubm90YXRpb25UeXBlID09PSBcIkRhdGFQb2ludFwiKSB7XG5cdFx0cmV0dXJuIGdldEJpbmRpbmdXaXRoR3JvdXBJZEZyb21Db25maWcob0NvbnRyb2xDb25maWd1cmF0aW9uLCBvSGVhZGVyRmFjZXQuRmFjZXQudGFyZ2V0QW5ub3RhdGlvblZhbHVlKTtcblx0fVxufTtcblxuLypcbiAqIEdldHMgdGhlICdQcmVzcycgZXZlbnQgZXhwcmVzc2lvbiBmb3IgdGhlIGV4dGVybmFsIGFuZCBpbnRlcm5hbCBkYXRhIHBvaW50IGxpbmsuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gW29Db25maWd1cmF0aW9uXSBDb250cm9sIGNvbmZpZ3VyYXRpb24gZnJvbSBtYW5pZmVzdFxuICogQHBhcmFtIHtvYmplY3R9IFtvTWFuaWZlc3RPdXRib3VuZF0gT3V0Ym91bmRzIGZyb20gbWFuaWZlc3RcbiAqIHJldHVybnMge3N0cmluZ30gVGhlIHJ1bnRpbWUgYmluZGluZyBvZiB0aGUgJ1ByZXNzJyBldmVudFxuICovXG5leHBvcnQgY29uc3QgZ2V0UHJlc3NFeHByZXNzaW9uRm9yTGluayA9IGZ1bmN0aW9uIChvQ29uZmlndXJhdGlvbjogYW55LCBvTWFuaWZlc3RPdXRib3VuZDogYW55KSB7XG5cdGlmIChvQ29uZmlndXJhdGlvbikge1xuXHRcdGlmIChvQ29uZmlndXJhdGlvbltcInRhcmdldE91dGJvdW5kXCJdICYmIG9Db25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl1bXCJvdXRib3VuZFwiXSkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XCIuaGFuZGxlcnMub25EYXRhUG9pbnRUaXRsZVByZXNzZWQoJGNvbnRyb2xsZXIsICR7JHNvdXJjZT59LCBcIiArXG5cdFx0XHRcdEpTT04uc3RyaW5naWZ5KG9NYW5pZmVzdE91dGJvdW5kKSArXG5cdFx0XHRcdFwiLFwiICtcblx0XHRcdFx0SlNPTi5zdHJpbmdpZnkob0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXVtcIm91dGJvdW5kXCJdKSArXG5cdFx0XHRcdFwiKVwiXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAob0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRTZWN0aW9uc1wiXSkge1xuXHRcdFx0cmV0dXJuIFwiLmhhbmRsZXJzLm5hdmlnYXRlVG9TdWJTZWN0aW9uKCRjb250cm9sbGVyLCAnXCIgKyBKU09OLnN0cmluZ2lmeShvQ29uZmlndXJhdGlvbltcInRhcmdldFNlY3Rpb25zXCJdKSArIFwiJylcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRIZWFkZXJGb3JtSGJveFJlbmRlclR5cGUgPSBmdW5jdGlvbiAoZGF0YUZpZWxkOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKGRhdGFGaWVsZD8udGFyZ2V0T2JqZWN0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0cmV0dXJuIFwiQmFyZVwiO1xufTtcblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBhY3Rpb24gZ3JvdXAgaGFuZGxlciB0aGF0IGlzIGludm9rZWQgd2hlbiBhZGRpbmcgdGhlIG1lbnUgYnV0dG9uIGhhbmRsaW5nIGFwcHJvcHJpYXRlbHkuXG4gKlxuICogQHBhcmFtIG9DdHggVGhlIGN1cnJlbnQgY29udGV4dCBpbiB3aGljaCB0aGUgaGFuZGxlciBpcyBjYWxsZWRcbiAqIEBwYXJhbSBvQWN0aW9uIFRoZSBjdXJyZW50IGFjdGlvbiBjb250ZXh0XG4gKiBAcGFyYW0gb0RhdGFGaWVsZEZvckRlZmF1bHRBY3Rpb24gVGhlIGN1cnJlbnQgZGF0YUZpZWxkIGZvciB0aGUgZGVmYXVsdCBhY3Rpb25cbiAqIEBwYXJhbSBkZWZhdWx0QWN0aW9uQ29udGV4dE9yRW50aXR5U2V0IFRoZSBjdXJyZW50IGNvbnRleHQgZm9yIHRoZSBkZWZhdWx0IGFjdGlvblxuICogQHJldHVybnMgVGhlIGFwcHJvcHJpYXRlIGV4cHJlc3Npb24gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0QWN0aW9uSGFuZGxlcihvQ3R4OiBhbnksIG9BY3Rpb246IGFueSwgb0RhdGFGaWVsZEZvckRlZmF1bHRBY3Rpb246IGFueSwgZGVmYXVsdEFjdGlvbkNvbnRleHRPckVudGl0eVNldDogYW55KSB7XG5cdGlmIChvQWN0aW9uLmRlZmF1bHRBY3Rpb24pIHtcblx0XHR0cnkge1xuXHRcdFx0c3dpdGNoIChvQWN0aW9uLmRlZmF1bHRBY3Rpb24udHlwZSkge1xuXHRcdFx0XHRjYXNlIFwiRm9yQWN0aW9uXCI6IHtcblx0XHRcdFx0XHRyZXR1cm4gZ2V0UHJlc3NFeHByZXNzaW9uRm9yRWRpdChvRGF0YUZpZWxkRm9yRGVmYXVsdEFjdGlvbiwgZGVmYXVsdEFjdGlvbkNvbnRleHRPckVudGl0eVNldCwgb0FjdGlvbi5kZWZhdWx0QWN0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIFwiRm9yTmF2aWdhdGlvblwiOiB7XG5cdFx0XHRcdFx0aWYgKG9BY3Rpb24uZGVmYXVsdEFjdGlvbi5jb21tYW5kKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJjbWQ6XCIgKyBvQWN0aW9uLmRlZmF1bHRBY3Rpb24uY29tbWFuZDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9BY3Rpb24uZGVmYXVsdEFjdGlvbi5wcmVzcztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRcdGlmIChvQWN0aW9uLmRlZmF1bHRBY3Rpb24uY29tbWFuZCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIFwiY21kOlwiICsgb0FjdGlvbi5kZWZhdWx0QWN0aW9uLmNvbW1hbmQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChvQWN0aW9uLmRlZmF1bHRBY3Rpb24ubm9XcmFwKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0FjdGlvbi5kZWZhdWx0QWN0aW9uLnByZXNzO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLmJ1aWxkQWN0aW9uV3JhcHBlcihvQWN0aW9uLmRlZmF1bHRBY3Rpb24sIHsgaWQ6IFwiZm9yVGhlT2JqZWN0UGFnZVwiIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGlvRXgpIHtcblx0XHRcdHJldHVybiBcImJpbmRpbmcgZm9yIHRoZSBkZWZhdWx0IGFjdGlvbiBpcyBub3Qgd29ya2luZyBhcyBleHBlY3RlZFwiO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBzdWIgc2VjdGlvbiB2aXN1YWxpemF0aW9uIGlzIHBhcnQgb2YgcHJldmlldy5cbiAqXG4gKiBAcGFyYW0gc3ViU2VjdGlvbiBUaGUgc3ViIHNlY3Rpb24gdmlzdWFsaXphdGlvblxuICogQHJldHVybnMgQSBCb29sZWFuIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Zpc3VhbGl6YXRpb25Jc1BhcnRPZlByZXZpZXcoc3ViU2VjdGlvbjogRGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uKSB7XG5cdHJldHVybiBzdWJTZWN0aW9uLmlzUGFydE9mUHJldmlldyA9PT0gdHJ1ZSB8fCBzdWJTZWN0aW9uLnByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9uc1swXS50eXBlICE9PSBcIlRhYmxlXCI7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFtQ0EsTUFBTUEsVUFBVSxHQUFHQyxRQUFRLENBQUNELFVBQVU7RUFFL0IsTUFBTUUscUJBQXFCLEdBQUcsVUFDcENDLGVBQW9DLEVBQ3BDQyxRQUFrQixFQUNsQkMsVUFBMkIsRUFDUTtJQUNuQyxPQUFPQyx5QkFBeUIsQ0FBQ0gsZUFBZSxFQUFFSSx3QkFBd0IsRUFBRUMsU0FBUyxFQUFFSCxVQUFVLEVBQUVELFFBQVEsQ0FBQztFQUM3RyxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFQQTtFQVFPLE1BQU1LLDJCQUEyQixHQUFHLFVBQzFDTixlQUFvQyxFQUNwQ08sV0FBNEIsRUFDTztJQUFBO0lBQ25DLElBQUlDLFdBQVcsR0FBR0MsMkJBQTJCLENBQUVGLFdBQVcsYUFBWEEsV0FBVyxnREFBWEEsV0FBVyxDQUFFRyxXQUFXLDBEQUF6QixzQkFBOENDLEtBQUssQ0FBQztJQUNsRyxJQUFLSixXQUFXLGFBQVhBLFdBQVcseUNBQVhBLFdBQVcsQ0FBRUcsV0FBVyw2RUFBekIsdUJBQThDQyxLQUFLLDZFQUFuRCx1QkFBcURDLE9BQU8sNkVBQTVELHVCQUE4REMsV0FBVyw2RUFBekUsdUJBQTJFQyxNQUFNLDZFQUFqRix1QkFBbUZDLElBQUksNkVBQXZGLHVCQUF5RkYsV0FBVyw2RUFBcEcsdUJBQXNHRyxFQUFFLG1EQUF4Ryx1QkFBMEdDLGVBQWUsRUFBRTtNQUM5SDtNQUNBVCxXQUFXLEdBQUdVLHFDQUFxQyxDQUFDVixXQUFXLEVBQUVSLGVB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