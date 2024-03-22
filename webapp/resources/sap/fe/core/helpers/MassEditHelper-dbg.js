/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/library", "sap/fe/core/TemplateModel", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/table/TableHelper", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageToast", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/enum/EditMode", "sap/ui/model/json/JSONModel", "../controllerextensions/messageHandler/messageHandling", "../controls/Any", "../converters/MetaModelConverter", "../templating/FieldControlHelper", "../templating/UIFormatters"], function (Log, CommonUtils, BindingToolkit, TypeGuards, FELibrary, TemplateModel, DataModelPathHelper, PropertyHelper, FieldTemplating, TableHelper, Button, Dialog, MessageToast, Core, Fragment, XMLPreprocessor, XMLTemplateProcessor, EditMode, JSONModel, messageHandling, Any, MetaModelConverter, FieldControlHelper, UIFormatters) {
  "use strict";

  var isMultiValueField = UIFormatters.isMultiValueField;
  var getRequiredExpression = UIFormatters.getRequiredExpression;
  var getEditMode = UIFormatters.getEditMode;
  var isReadOnlyExpression = FieldControlHelper.isReadOnlyExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;
  var setEditStyleProperties = FieldTemplating.setEditStyleProperties;
  var getTextBinding = FieldTemplating.getTextBinding;
  var hasValueHelpWithFixedValues = PropertyHelper.hasValueHelpWithFixedValues;
  var hasValueHelp = PropertyHelper.hasValueHelp;
  var hasUnit = PropertyHelper.hasUnit;
  var hasCurrency = PropertyHelper.hasCurrency;
  var getAssociatedUnitPropertyPath = PropertyHelper.getAssociatedUnitPropertyPath;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isProperty = TypeGuards.isProperty;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  const MassEditHelper = {
    /**
     * Initializes the value at final or deepest level path with a blank array.
     * Return an empty array pointing to the final or deepest level path.
     *
     * @param sPath Property path
     * @param aValues Array instance where the default data needs to be added
     * @returns The final path
     */
    initLastLevelOfPropertyPath: function (sPath, aValues) {
      let aFinalPath;
      let index = 0;
      const aPaths = sPath.split("/");
      let sFullPath = "";
      aPaths.forEach(function (sPropertyPath) {
        if (!aValues[sPropertyPath] && index === 0) {
          aValues[sPropertyPath] = {};
          aFinalPath = aValues[sPropertyPath];
          sFullPath = sFullPath + sPropertyPath;
          index++;
        } else if (!aFinalPath[sPropertyPath]) {
          sFullPath = `${sFullPath}/${sPropertyPath}`;
          if (sFullPath !== sPath) {
            aFinalPath[sPropertyPath] = {};
            aFinalPath = aFinalPath[sPropertyPath];
          } else {
            aFinalPath[sPropertyPath] = [];
          }
        }
      });
      return aFinalPath;
    },
    /**
     * Method to get unique values for given array values.
     *
     * @param sValue Property value
     * @param index Index of the property value
     * @param self Instance of the array
     * @returns The unique value
     */
    getUniqueValues: function (sValue, index, self) {
      return sValue != undefined && sValue != null ? self.indexOf(sValue) === index : undefined;
    },
    /**
     * Gets the property value for a multi-level path (for example: _Materials/Material_Details gets the value of Material_Details under _Materials Object).
     * Returns the propertyValue, which can be of any type (string, number, etc..).
     *
     * @param sDataPropertyPath Property path
     * @param oValues Object of property values
     * @returns The property value
     */
    getValueForMultiLevelPath: function (sDataPropertyPath, oValues) {
      let result;
      if (sDataPropertyPath && sDataPropertyPath.indexOf("/") > 0) {
        const aPropertyPaths = sDataPropertyPath.split("/");
        aPropertyPaths.forEach(function (sPath) {
          result = oValues && oValues[sPath] ? oValues[sPath] : result && result[sPath];
        });
      }
      return result;
    },
    /**
     * Gets the key path for the key of a combo box that must be selected initially when the dialog opens:
     * => If propertyValue for all selected contexts is different, then < Keep Existing Values > is preselected.
     * => If propertyValue for all selected contexts is the same, then the propertyValue is preselected.
     * => If propertyValue for all selected contexts is empty, then < Leave Blank > is preselected.
     *
     *
     * @param aContexts Contexts for mass edit
     * @param sDataPropertyPath Data property path
     * @returns The key path
     */
    getDefaultSelectionPathComboBox: function (aContexts, sDataPropertyPath) {
      let result;
      if (sDataPropertyPath && aContexts.length > 0) {
        const oSelectedContext = aContexts,
          aPropertyValues = [];
        oSelectedContext.forEach(function (oContext) {
          const oDataObject = oContext.getObject();
          const sMultiLevelPathCondition = sDataPropertyPath.indexOf("/") > -1 && oDataObject.hasOwnProperty(sDataPropertyPath.split("/")[0]);
          if (oContext && (oDataObject.hasOwnProperty(sDataPropertyPath) || sMultiLevelPathCondition)) {
            aPropertyValues.push(oContext.getObject(sDataPropertyPath));
          }
        });
        const aUniquePropertyValues = aPropertyValues.filter(MassEditHelper.getUniqueValues);
        if (aUniquePropertyValues.length > 1) {
          result = `Default/${sDataPropertyPath}`;
        } else if (aUniquePropertyValues.length === 0) {
          result = `Empty/${sDataPropertyPath}`;
        } else if (aUniquePropertyValues.length === 1) {
          result = `${sDataPropertyPath}/${aUniquePropertyValues[0]}`;
        }
      }
      return result;
    },
    /**
     * Checks hidden annotation value [both static and path based] for table's selected context.
     *
     * @param hiddenValue Hidden annotation value / path for field
     * @param aContexts Contexts for mass edit
     * @returns The hidden annotation value
     */
    getHiddenValueForContexts: function (hiddenValue, aContexts) {
      if (hiddenValue && hiddenValue.$Path) {
        return !aContexts.some(function (oSelectedContext) {
          return oSelectedContext.getObject(hiddenValue.$Path) === false;
        });
      }
      return hiddenValue;
    },
    getInputType: function (propertyInfo, dataFieldConverted, oDataModelPath) {
      const editStyleProperties = {};
      let inputType;
      if (propertyInfo) {
        setEditStyleProperties(editStyleProperties, dataFieldConverted, oDataModelPath, true);
        inputType = (editStyleProperties === null || editStyleProperties === void 0 ? void 0 : editStyleProperties.editStyle) || "";
      }
      const isValidForMassEdit = inputType && ["DatePicker", "TimePicker", "DateTimePicker", "RatingIndicator"].indexOf(inputType) === -1 && !isMultiValueField(oDataModelPath) && !hasValueHelpWithFixedValues(propertyInfo);
      return (isValidForMassEdit || "") && inputType;
    },
    getIsFieldGrp: function (dataFieldConverted) {
      return dataFieldConverted && dataFieldConverted.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && dataFieldConverted.Target && dataFieldConverted.Target.value && dataFieldConverted.Target.value.indexOf("FieldGroup") > -1;
    },
    /**
     * Get text path for the mass edit field.
     *
     * @param property Property path
     * @param textBinding Text Binding Info
     * @param displayMode Display mode
     * @returns Text Property Path if it exists
     */
    getTextPath: function (property, textBinding, displayMode) {
      let descriptionPath;
      if (textBinding && (textBinding.path || textBinding.parameters && textBinding.parameters.length) && property) {
        if (textBinding.path && displayMode === "Description") {
          descriptionPath = textBinding.path;
        } else if (textBinding.parameters) {
          textBinding.parameters.forEach(function (props) {
            if (props.path && props.path !== property) {
              descriptionPath = props.path;
            }
          });
        }
      }
      return descriptionPath;
    },
    /**
     * Initializes a JSON Model for properties of dialog fields [label, visiblity, dataproperty, etc.].
     *
     * @param oTable Instance of Table
     * @param aContexts Contexts for mass edit
     * @param aDataArray Array containing data related to the dialog used by both the static and the runtime model
     * @returns The model
     */
    prepareDataForDialog: function (oTable, aContexts, aDataArray) {
      const oMetaModel = oTable && oTable.getModel().getMetaModel(),
        sCurrentEntitySetName = oTable.data("metaPath"),
        aTableFields = MassEditHelper.getTableFields(oTable),
        oEntityTypeContext = oMetaModel.getContext(`${sCurrentEntitySetName}/@`),
        oEntitySetContext = oMetaModel.getContext(sCurrentEntitySetName),
        oDataModelObjectPath = getInvolvedDataModelObjects(oEntityTypeContext);
      const oDataFieldModel = new JSONModel();
      let oResult;
      let sLabelText;
      let bValueHelpEnabled;
      let sUnitPropertyPath;
      let bValueHelpEnabledForUnit;
      let oTextBinding;
      aTableFields.forEach(function (oColumnInfo) {
        if (!oColumnInfo.annotationPath) {
          return;
        }
        const sDataPropertyPath = oColumnInfo.dataProperty;
        if (sDataPropertyPath) {
          var _oDataFieldConverted$, _oDataFieldConverted$2, _oDataFieldConverted$3, _oDataFieldConverted$4, _oPropertyInfo, _oPropertyInfo$annota, _oPropertyInfo$annota2, _unitPropertyInfo$ann, _unitPropertyInfo$ann2;
          let oPropertyInfo = sDataPropertyPath && oMetaModel.getObject(`${sCurrentEntitySetName}/${sDataPropertyPath}@`);
          sLabelText = oColumnInfo.label || oPropertyInfo && oPropertyInfo["@com.sap.vocabularies.Common.v1.Label"] || sDataPropertyPath;
          if (oDataModelObjectPath) {
            oDataModelObjectPath.targetObject = oDataModelObjectPath.targetEntityType.entityProperties.filter(function (oProperty) {
              return oProperty.name === sDataPropertyPath;
            });
          }
          oDataModelObjectPath.targetObject = oDataModelObjectPath.targetObject[0] || {};
          oTextBinding = getTextBinding(oDataModelObjectPath, {}, true) || {};
          const oFieldContext = oMetaModel.getContext(oColumnInfo.annotationPath),
            oDataFieldConverted = convertMetaModelContext(oFieldContext),
            oPropertyContext = oMetaModel.getContext(`${sCurrentEntitySetName}/${sDataPropertyPath}@`),
            oInterface = oPropertyContext && oPropertyContext.getInterface();
          let oDataModelPath = getInvolvedDataModelObjects(oFieldContext, oEntitySetContext);
          if ((oDataFieldConverted === null || oDataFieldConverted === void 0 ? void 0 : (_oDataFieldConverted$ = oDataFieldConverted.Value) === null || _oDataFieldConverted$ === void 0 ? void 0 : (_oDataFieldConverted$2 = _oDataFieldConverted$.path) === null || _oDataFieldConverted$2 === void 0 ? void 0 : _oDataFieldConverted$2.length) > 0) {
            oDataModelPath = enhanceDataModelPath(oDataModelPath, sDataPropertyPath);
          }
          const bHiddenField = MassEditHelper.getHiddenValueForContexts(oFieldContext && oFieldContext.getObject()["@com.sap.vocabularies.UI.v1.Hidden"], aContexts) || false;
          const isImage = oPropertyInfo && oPropertyInfo["@com.sap.vocabularies.UI.v1.IsImageURL"];
          oInterface.context = {
            getModel: function () {
              return oInterface.getModel();
            },
            getPath: function () {
              return `${sCurrentEntitySetName}/${sDataPropertyPath}`;
            }
          };
          oPropertyInfo = isProperty(oDataFieldConverted) ? oDataFieldConverted : (oDataFieldConverted === null || oDataFieldConverted === void 0 ? void 0 : (_oDataFieldConverted$3 = oDataFieldConverted.Value) === null || _oDataFieldConverted$3 === void 0 ? void 0 : _oDataFieldConverted$3.$target) ?? (oDataFieldConverted === null || oDataFieldConverted === void 0 ? void 0 : (_oDataFieldConverted$4 = oDataFieldConverted.Target) === null || _oDataFieldConverted$4 === void 0 ? void 0 : _oDataFieldConverted$4.$target);
          // Datafield is not included in the FieldControl calculation, needs to be implemented

          const chartProperty = oPropertyInfo && oPropertyInfo.term && oPropertyInfo.term === "com.sap.vocabularies.UI.v1.Chart";
          const isAction = !!oDataFieldConverted.Action;
          const isFieldGrp = MassEditHelper.getIsFieldGrp(oDataFieldConverted);
          if (isImage || bHiddenField || chartProperty || isAction || isFieldGrp) {
            return;
          }

          // ValueHelp properties
          sUnitPropertyPath = (hasCurrency(oPropertyInfo) || hasUnit(oPropertyInfo)) && getAssociatedUnitPropertyPath(oPropertyInfo) || "";
          const unitPropertyInfo = sUnitPropertyPath && getAssociatedUnitProperty(oPropertyInfo);
          bValueHelpEnabled = hasValueHelp(oPropertyInfo);
          bValueHelpEnabledForUnit = unitPropertyInfo && hasValueHelp(unitPropertyInfo);
          const hasContextDependentVH = (bValueHelpEnabled || bValueHelpEnabledForUnit) && (((_oPropertyInfo = oPropertyInfo) === null || _oPropertyInfo === void 0 ? void 0 : (_oPropertyInfo$annota = _oPropertyInfo.annotations) === null || _oPropertyInfo$annota === void 0 ? void 0 : (_oPropertyInfo$annota2 = _oPropertyInfo$annota.Common) === null || _oPropertyInfo$annota2 === void 0 ? void 0 : _oPropertyInfo$annota2.ValueListRelevantQualifiers) || unitPropertyInfo && (unitPropertyInfo === null || unitPropertyInfo === void 0 ? void 0 : (_unitPropertyInfo$ann = unitPropertyInfo.annotations) === null || _unitPropertyInfo$ann === void 0 ? void 0 : (_unitPropertyInfo$ann2 = _unitPropertyInfo$ann.Common) === null || _unitPropertyInfo$ann2 === void 0 ? void 0 : _unitPropertyInfo$ann2.ValueListRelevantQualifiers));
          if (hasContextDependentVH) {
            // context dependent VH is not supported for Mass Edit.
            return;
          }

          // EditMode and InputType
          const propertyForFieldControl = oPropertyInfo && oPropertyInfo.Value ? oPropertyInfo.Value : oPropertyInfo;
          const expBinding = getEditMode(propertyForFieldControl, oDataModelPath, false, false, oDataFieldConverted, constant(true));
          const editModeValues = Object.keys(EditMode);
          const editModeIsStatic = !!expBinding && editModeValues.includes(expBinding);
          const editable = !!expBinding && (editModeIsStatic && expBinding === EditMode.Editable || !editModeIsStatic);
          const navPropertyWithValueHelp = sDataPropertyPath.includes("/") && bValueHelpEnabled;
          if (!editable || navPropertyWithValueHelp) {
            return;
          }
          const inputType = MassEditHelper.getInputType(oPropertyInfo, oDataFieldConverted, oDataModelPath);
          if (inputType) {
            const relativePath = getRelativePaths(oDataModelPath);
            const isReadOnly = isReadOnlyExpression(oPropertyInfo, relativePath);
            const displayMode = CommonUtils.computeDisplayMode(oPropertyContext.getObject());
            const isValueHelpEnabled = bValueHelpEnabled ? bValueHelpEnabled : false;
            const isValueHelpEnabledForUnit = bValueHelpEnabledForUnit && !sUnitPropertyPath.includes("/") ? bValueHelpEnabledForUnit : false;
            const unitProperty = sUnitPropertyPath && !sDataPropertyPath.includes("/") ? sUnitPropertyPath : false;
            oResult = {
              label: sLabelText,
              dataProperty: sDataPropertyPath,
              isValueHelpEnabled: bValueHelpEnabled ? bValueHelpEnabled : false,
              unitProperty,
              isFieldRequired: getRequiredExpression(oPropertyInfo, oDataFieldConverted, true, false, {}, oDataModelPath),
              defaultSelectionPath: sDataPropertyPath ? MassEditHelper.getDefaultSelectionPathComboBox(aContexts, sDataPropertyPath) : false,
              defaultSelectionUnitPath: sUnitPropertyPath ? MassEditHelper.getDefaultSelectionPathComboBox(aContexts, sUnitPropertyPath) : false,
              entitySet: sCurrentEntitySetName,
              display: displayMode,
              descriptionPath: MassEditHelper.getTextPath(sDataPropertyPath, oTextBinding, displayMode),
              nullable: oPropertyInfo.nullable !== undefined ? oPropertyInfo.nullable : true,
              isPropertyReadOnly: isReadOnly !== undefined ? isReadOnly : false,
              inputType: inputType,
              editMode: editable ? expBinding : undefined,
              propertyInfo: {
                hasVH: isValueHelpEnabled,
                runtimePath: "fieldsInfo>/values/",
                relativePath: sDataPropertyPath,
                propertyFullyQualifiedName: oPropertyInfo.fullyQualifiedName,
                propertyPathForValueHelp: `${sCurrentEntitySetName}/${sDataPropertyPath}`
              },
              unitInfo: unitProperty && {
                hasVH: isValueHelpEnabledForUnit,
                runtimePath: "fieldsInfo>/unitData/",
                relativePath: unitProperty,
                propertyPathForValueHelp: `${sCurrentEntitySetName}/${unitProperty}`
              }
            };
            aDataArray.push(oResult);
          }
        }
      });
      oDataFieldModel.setData(aDataArray);
      return oDataFieldModel;
    },
    getTableFields: function (oTable) {
      const aColumns = oTable && oTable.getColumns() || [];
      const columnsData = oTable && oTable.getParent().getTableDefinition().columns;
      return aColumns.map(function (oColumn) {
        const sDataProperty = oColumn && oColumn.getDataProperty(),
          aRealtedColumnInfo = columnsData && columnsData.filter(function (oColumnInfo) {
            return oColumnInfo.name === sDataProperty && oColumnInfo.type === "Annotation";
          });
        return {
          dataProperty: sDataProperty,
          label: oColumn.getHeader(),
          annotationPath: aRealtedColumnInfo && aRealtedColumnInfo[0] && aRealtedColumnInfo[0].annotationPath
        };
      });
    },
    getDefaultTextsForDialog: function (oResourceBundle, iSelectedContexts, oTable) {
      // The confirm button text is "Save" for table in Display mode and "Apply" for table in edit mode. This can be later exposed if needed.
      const bDisplayMode = oTable.data("displayModePropertyBinding") === "true";
      return {
        keepExistingPrefix: "< Keep",
        leaveBlankValue: "< Leave Blank >",
        clearFieldValue: "< Clear Values >",
        massEditTitle: oResourceBundle.getText("C_MASS_EDIT_DIALOG_TITLE", iSelectedContexts.toString()),
        applyButtonText: bDisplayMode ? oResourceBundle.getText("C_MASS_EDIT_SAVE_BUTTON_TEXT") : oResourceBundle.getText("C_MASS_EDIT_APPLY_BUTTON_TEXT"),
        useValueHelpValue: "< Use Value Help >",
        cancelButtonText: oResourceBundle.getText("C_COMMON_OBJECT_PAGE_CANCEL"),
        noFields: oResourceBundle.getText("C_MASS_EDIT_NO_EDITABLE_FIELDS"),
        okButtonText: oResourceBundle.getText("C_COMMON_DIALOG_OK")
      };
    },
    /**
     * Adds a suffix to the 'keep existing' property of the comboBox.
     *
     * @param sInputType InputType of the field
     * @returns The modified string
     */
    // getSuffixForKeepExisiting: function (sInputType: string) {
    // 	let sResult = "Values";

    // 	switch (sInputType) {
    // 		//TODO - Add for other control types as well (Radio Button, Email, Input, MDC Fields, Image etc.)
    // 		case "DatePicker":
    // 			sResult = "Dates";
    // 			break;
    // 		case "CheckBox":
    // 			sResult = "Settings";
    // 			break;
    // 		default:
    // 			sResult = "Values";
    // 	}
    // 	return sResult;
    // },

    /**
     * Adds default values to the model [Keep Existing Values, Leave Blank].
     *
     * @param aValues Array instance where the default data needs to be added
     * @param oDefaultValues Default values from Application Manifest
     * @param oPropertyInfo Property information
     * @param bUOMField
     */
    setDefaultValuesToDialog: function (aValues, oDefaultValues, oPropertyInfo, bUOMField) {
      const sPropertyPath = bUOMField ? oPropertyInfo.unitProperty : oPropertyInfo.dataProperty,
        sInputType = oPropertyInfo.inputType,
        bPropertyRequired = oPropertyInfo.isFieldRequired;
      // const sSuffixForKeepExisting = MassEditHelper.getSuffixForKeepExisiting(sInputType);
      const sSuffixForKeepExisting = "Values";
      aValues.defaultOptions = aValues.defaultOptions || [];
      const selectOptionsExist = aValues.selectOptions && aValues.selectOptions.length > 0;
      const keepEntry = {
        text: `${oDefaultValues.keepExistingPrefix} ${sSuffixForKeepExisting} >`,
        key: `Default/${sPropertyPath}`
      };
      if (sInputType === "CheckBox") {
        const falseEntry = {
          text: "No",
          key: `${sPropertyPath}/false`,
          textInfo: {
            value: false
          }
        };
        const truthyEntry = {
          text: "Yes",
          key: `${sPropertyPath}/true`,
          textInfo: {
            value: true
          }
        };
        aValues.unshift(falseEntry);
        aValues.defaultOptions.unshift(falseEntry);
        aValues.unshift(truthyEntry);
        aValues.defaultOptions.unshift(truthyEntry);
        aValues.unshift(keepEntry);
        aValues.defaultOptions.unshift(keepEntry);
      } else {
        var _oPropertyInfo$proper, _oPropertyInfo$unitIn;
        if (oPropertyInfo !== null && oPropertyInfo !== void 0 && (_oPropertyInfo$proper = oPropertyInfo.propertyInfo) !== null && _oPropertyInfo$proper !== void 0 && _oPropertyInfo$proper.hasVH || oPropertyInfo !== null && oPropertyInfo !== void 0 && (_oPropertyInfo$unitIn = oPropertyInfo.unitInfo) !== null && _oPropertyInfo$unitIn !== void 0 && _oPropertyInfo$unitIn.hasVH && bUOMField) {
          const vhdEntry = {
            text: oDefaultValues.useValueHelpValue,
            key: `UseValueHelpValue/${sPropertyPath}`
          };
          aValues.unshift(vhdEntry);
          aValues.defaultOptions.unshift(vhdEntry);
        }
        if (selectOptionsExist) {
          if (bPropertyRequired !== "true" && !bUOMField) {
            const clearEntry = {
              text: oDefaultValues.clearFieldValue,
              key: `ClearFieldValue/${sPropertyPath}`
            };
            aValues.unshift(clearEntry);
            aValues.defaultOptions.unshift(clearEntry);
          }
          aValues.unshift(keepEntry);
          aValues.defaultOptions.unshift(keepEntry);
        } else {
          const emptyEntry = {
            text: oDefaultValues.leaveBlankValue,
            key: `Default/${sPropertyPath}`
          };
          aValues.unshift(emptyEntry);
          aValues.defaultOptions.unshift(emptyEntry);
        }
      }
    },
    /**
     * Get text arrangement info for a context property.
     *
     * @param property Property Path
     * @param descriptionPath Path to text association of the property
     * @param displayMode Display mode of the property and text association
     * @param selectedContext Context to find the full text
     * @returns The text arrangement
     */
    getTextArrangementInfo: function (property, descriptionPath, displayMode, selectedContext) {
      let value = selectedContext.getObject(property),
        descriptionValue,
        fullText;
      if (descriptionPath && property) {
        switch (displayMode) {
          case "Description":
            descriptionValue = selectedContext.getObject(descriptionPath) || "";
            fullText = descriptionValue;
            break;
          case "Value":
            value = selectedContext.getObject(property) || "";
            fullText = value;
            break;
          case "ValueDescription":
            value = selectedContext.getObject(property) || "";
            descriptionValue = selectedContext.getObject(descriptionPath) || "";
            fullText = descriptionValue ? `${value} (${descriptionValue})` : value;
            break;
          case "DescriptionValue":
            value = selectedContext.getObject(property) || "";
            descriptionValue = selectedContext.getObject(descriptionPath) || "";
            fullText = descriptionValue ? `${descriptionValue} (${value})` : value;
            break;
          default:
            Log.info(`Display Property not applicable: ${property}`);
            break;
        }
      }
      return {
        textArrangement: displayMode,
        valuePath: property,
        descriptionPath: descriptionPath,
        value: value,
        description: descriptionValue,
        fullText: fullText
      };
    },
    /**
     * Return the visibility valuue for the ManagedObject Any.
     *
     * @param any The ManagedObject Any to be used to calculate the visible value of the binding.
     * @returns Returns true if the mass edit field is editable.
     */
    isEditable: function (any) {
      const binding = any.getBinding("any");
      const value = binding.getExternalValue();
      return value === EditMode.Editable;
    },
    /**
     * Calculate and update the visibility of mass edit field on change of the ManagedObject Any binding.
     *
     * @param oDialogDataModel Model to be used runtime.
     * @param dataProperty Field name.
     */
    onContextEditableChange: function (oDialogDataModel, dataProperty) {
      const objectsForVisibility = oDialogDataModel.getProperty(`/values/${dataProperty}/objectsForVisibility`) || [];
      const editable = objectsForVisibility.some(MassEditHelper.isEditable);
      if (editable) {
        oDialogDataModel.setProperty(`/values/${dataProperty}/visible`, editable);
      }
    },
    /**
     * Update Managed Object Any for visibility of the mass edit fields.
     *
     * @param mOToUse The ManagedObject Any to be used to calculate the visible value of the binding.
     * @param oDialogDataModel Model to be used runtime.
     * @param dataProperty Field name.
     * @param values Values of the field.
     */
    updateOnContextChange: function (mOToUse, oDialogDataModel, dataProperty, values) {
      const binding = mOToUse.getBinding("any");
      values.objectsForVisibility = values.objectsForVisibility || [];
      values.objectsForVisibility.push(mOToUse);
      binding === null || binding === void 0 ? void 0 : binding.attachChange(MassEditHelper.onContextEditableChange.bind(null, oDialogDataModel, dataProperty));
    },
    /**
     * Get bound object to calculate the visibility of contexts.
     *
     * @param expBinding Binding String object.
     * @param context Context the binding value.
     * @returns The ManagedObject Any to be used to calculate the visible value of the binding.
     */
    getBoundObject: function (expBinding, context) {
      const mOToUse = new Any({
        any: expBinding
      });
      const model = context.getModel();
      mOToUse.setModel(model);
      mOToUse.setBindingContext(context);
      return mOToUse;
    },
    /**
     * Get the visibility of the field.
     *
     * @param expBinding Binding String object.
     * @param oDialogDataModel Model to be used runtime.
     * @param dataProperty Field name.
     * @param values Values of the field.
     * @param context Context the binding value.
     * @returns Returns true if the mass edit field is editable.
     */
    getFieldVisiblity: function (expBinding, oDialogDataModel, dataProperty, values, context) {
      const mOToUse = MassEditHelper.getBoundObject(expBinding, context);
      const isContextEditable = MassEditHelper.isEditable(mOToUse);
      if (!isContextEditable) {
        MassEditHelper.updateOnContextChange(mOToUse, oDialogDataModel, dataProperty, values);
      }
      return isContextEditable;
    },
    /**
     * Initializes a runtime model:
     * => The model consists of values shown in the comboBox of the dialog (Leave Blank, Keep Existing Values, or any property value for the selected context, etc.)
     * => The model will capture runtime changes in the results property (the value entered in the comboBox).
     *
     * @param aContexts Contexts for mass edit
     * @param aDataArray Array containing data related to the dialog used by both the static and the runtime model
     * @param oDefaultValues Default values from i18n
     * @param dialogContext Transient context for mass edit dialog.
     * @returns The runtime model
     */
    setRuntimeModelOnDialog: function (aContexts, aDataArray, oDefaultValues, dialogContext) {
      const aValues = [];
      const aUnitData = [];
      const aResults = [];
      const textPaths = [];
      const aReadOnlyFieldInfo = [];
      const oData = {
        values: aValues,
        unitData: aUnitData,
        results: aResults,
        readablePropertyData: aReadOnlyFieldInfo,
        selectedKey: undefined,
        textPaths: textPaths,
        noFields: oDefaultValues.noFields
      };
      const oDialogDataModel = new JSONModel(oData);
      aDataArray.forEach(function (oInData) {
        let oTextInfo;
        let sPropertyKey;
        let sUnitPropertyName;
        const oDistinctValueMap = {};
        const oDistinctUnitMap = {};
        if (oInData.dataProperty && oInData.dataProperty.indexOf("/") > -1) {
          const aFinalPath = MassEditHelper.initLastLevelOfPropertyPath(oInData.dataProperty, aValues /*, dialogContext */);
          const aPropertyPaths = oInData.dataProperty.split("/");
          for (const context of aContexts) {
            const sMultiLevelPathValue = context.getObject(oInData.dataProperty);
            sPropertyKey = `${oInData.dataProperty}/${sMultiLevelPathValue}`;
            if (!oDistinctValueMap[sPropertyKey] && aFinalPath[aPropertyPaths[aPropertyPaths.length - 1]]) {
              oTextInfo = MassEditHelper.getTextArrangementInfo(oInData.dataProperty, oInData.descriptionPath, oInData.display, context);
              aFinalPath[aPropertyPaths[aPropertyPaths.length - 1]].push({
                text: oTextInfo && oTextInfo.fullText || sMultiLevelPathValue,
                key: sPropertyKey,
                textInfo: oTextInfo
              });
              oDistinctValueMap[sPropertyKey] = sMultiLevelPathValue;
            }
          }
          // if (Object.keys(oDistinctValueMap).length === 1) {
          // 	dialogContext.setProperty(oData.dataProperty, sPropertyKey && oDistinctValueMap[sPropertyKey]);
          // }

          aFinalPath[aPropertyPaths[aPropertyPaths.length - 1]].textInfo = {
            descriptionPath: oInData.descriptionPath,
            valuePath: oInData.dataProperty,
            displayMode: oInData.display
          };
        } else {
          aValues[oInData.dataProperty] = aValues[oInData.dataProperty] || [];
          aValues[oInData.dataProperty]["selectOptions"] = aValues[oInData.dataProperty]["selectOptions"] || [];
          if (oInData.unitProperty) {
            aUnitData[oInData.unitProperty] = aUnitData[oInData.unitProperty] || [];
            aUnitData[oInData.unitProperty]["selectOptions"] = aUnitData[oInData.unitProperty]["selectOptions"] || [];
          }
          for (const context of aContexts) {
            const oDataObject = context.getObject();
            sPropertyKey = `${oInData.dataProperty}/${oDataObject[oInData.dataProperty]}`;
            if (oInData.dataProperty && oDataObject[oInData.dataProperty] && !oDistinctValueMap[sPropertyKey]) {
              if (oInData.inputType != "CheckBox") {
                oTextInfo = MassEditHelper.getTextArrangementInfo(oInData.dataProperty, oInData.descriptionPath, oInData.display, context);
                const entry = {
                  text: oTextInfo && oTextInfo.fullText || oDataObject[oInData.dataProperty],
                  key: sPropertyKey,
                  textInfo: oTextInfo
                };
                aValues[oInData.dataProperty].push(entry);
                aValues[oInData.dataProperty]["selectOptions"].push(entry);
              }
              oDistinctValueMap[sPropertyKey] = oDataObject[oInData.dataProperty];
            }
            if (oInData.unitProperty && oDataObject[oInData.unitProperty]) {
              sUnitPropertyName = `${oInData.unitProperty}/${oDataObject[oInData.unitProperty]}`;
              if (!oDistinctUnitMap[sUnitPropertyName]) {
                if (oInData.inputType != "CheckBox") {
                  oTextInfo = MassEditHelper.getTextArrangementInfo(oInData.unitProperty, oInData.descriptionPath, oInData.display, context);
                  const unitEntry = {
                    text: oTextInfo && oTextInfo.fullText || oDataObject[oInData.unitProperty],
                    key: sUnitPropertyName,
                    textInfo: oTextInfo
                  };
                  aUnitData[oInData.unitProperty].push(unitEntry);
                  aUnitData[oInData.unitProperty]["selectOptions"].push(unitEntry);
                }
                oDistinctUnitMap[sUnitPropertyName] = oDataObject[oInData.unitProperty];
              }
            }
          }
          aValues[oInData.dataProperty].textInfo = {
            descriptionPath: oInData.descriptionPath,
            valuePath: oInData.dataProperty,
            displayMode: oInData.display
          };
          if (Object.keys(oDistinctValueMap).length === 1) {
            dialogContext.setProperty(oInData.dataProperty, sPropertyKey && oDistinctValueMap[sPropertyKey]);
          }
          if (Object.keys(oDistinctUnitMap).length === 1) {
            dialogContext.setProperty(oInData.unitProperty, sUnitPropertyName && oDistinctUnitMap[sUnitPropertyName]);
          }
        }
        textPaths[oInData.dataProperty] = oInData.descriptionPath ? [oInData.descriptionPath] : [];
      });
      aDataArray.forEach(function (oInData) {
        let values = {};
        if (oInData.dataProperty.indexOf("/") > -1) {
          const sMultiLevelPropPathValue = MassEditHelper.getValueForMultiLevelPath(oInData.dataProperty, aValues);
          if (!sMultiLevelPropPathValue) {
            sMultiLevelPropPathValue.push({
              text: oDefaultValues.leaveBlankValue,
              key: `Empty/${oInData.dataProperty}`
            });
          } else {
            MassEditHelper.setDefaultValuesToDialog(sMultiLevelPropPathValue, oDefaultValues, oInData);
          }
          values = sMultiLevelPropPathValue;
        } else if (aValues[oInData.dataProperty]) {
          aValues[oInData.dataProperty] = aValues[oInData.dataProperty] || [];
          MassEditHelper.setDefaultValuesToDialog(aValues[oInData.dataProperty], oDefaultValues, oInData);
          values = aValues[oInData.dataProperty];
        }
        if (aUnitData[oInData.unitProperty] && aUnitData[oInData.unitProperty].length) {
          MassEditHelper.setDefaultValuesToDialog(aUnitData[oInData.unitProperty], oDefaultValues, oInData, true);
          aUnitData[oInData.unitProperty].textInfo = {};
          aUnitData[oInData.unitProperty].selectedKey = MassEditHelper.getDefaultSelectionPathComboBox(aContexts, oInData.unitProperty);
          aUnitData[oInData.unitProperty].inputType = oInData.inputType;
        } else if (oInData.dataProperty && aValues[oInData.dataProperty] && !aValues[oInData.dataProperty].length || oInData.unitProperty && aUnitData[oInData.unitProperty] && !aUnitData[oInData.unitProperty].length) {
          const bClearFieldOrBlankValueExists = aValues[oInData.dataProperty] && aValues[oInData.dataProperty].some(function (obj) {
            return obj.text === "< Clear Values >" || obj.text === "< Leave Blank >";
          });
          if (oInData.dataProperty && !bClearFieldOrBlankValueExists) {
            aValues[oInData.dataProperty].push({
              text: oDefaultValues.leaveBlankValue,
              key: `Empty/${oInData.dataProperty}`
            });
          }
          const bClearFieldOrBlankUnitValueExists = aUnitData[oInData.unitProperty] && aUnitData[oInData.unitProperty].some(function (obj) {
            return obj.text === "< Clear Values >" || obj.text === "< Leave Blank >";
          });
          if (oInData.unitProperty) {
            if (!bClearFieldOrBlankUnitValueExists) {
              aUnitData[oInData.unitProperty].push({
                text: oDefaultValues.leaveBlankValue,
                key: `Empty/${oInData.unitProperty}`
              });
            }
            aUnitData[oInData.unitProperty].textInfo = {};
            aUnitData[oInData.unitProperty].selectedKey = MassEditHelper.getDefaultSelectionPathComboBox(aContexts, oInData.unitProperty);
            aUnitData[oInData.unitProperty].inputType = oInData.inputType;
          }
        }
        if (oInData.isPropertyReadOnly && typeof oInData.isPropertyReadOnly === "boolean") {
          aReadOnlyFieldInfo.push({
            property: oInData.dataProperty,
            value: oInData.isPropertyReadOnly,
            type: "Default"
          });
        } else if (oInData.isPropertyReadOnly && oInData.isPropertyReadOnly.operands && oInData.isPropertyReadOnly.operands[0] && oInData.isPropertyReadOnly.operands[0].operand1 && oInData.isPropertyReadOnly.operands[0].operand2) {
          // This needs to be refactored in accordance with the ReadOnlyExpression change
          aReadOnlyFieldInfo.push({
            property: oInData.dataProperty,
            propertyPath: oInData.isPropertyReadOnly.operands[0].operand1.path,
            propertyValue: oInData.isPropertyReadOnly.operands[0].operand2.value,
            type: "Path"
          });
        }

        // Setting visbility of the mass edit field.
        if (oInData.editMode) {
          values.visible = oInData.editMode === EditMode.Editable || aContexts.some(MassEditHelper.getFieldVisiblity.bind(MassEditHelper, oInData.editMode, oDialogDataModel, oInData.dataProperty, values));
        } else {
          values.visible = true;
        }
        values.selectedKey = MassEditHelper.getDefaultSelectionPathComboBox(aContexts, oInData.dataProperty);
        values.inputType = oInData.inputType;
        values.unitProperty = oInData.unitProperty;
      });
      return oDialogDataModel;
    },
    /**
     * Gets transient context for dialog.
     *
     * @param table Instance of Table.
     * @param dialog Mass Edit Dialog.
     * @returns Promise returning instance of dialog.
     */
    getDialogContext: function (table, dialog) {
      let transCtx = dialog === null || dialog === void 0 ? void 0 : dialog.getBindingContext();
      if (!transCtx) {
        const model = table.getModel();
        const listBinding = table.getRowBinding();
        const transientListBinding = model.bindList(listBinding.getPath(), listBinding.getContext(), [], [], {
          $$updateGroupId: "submitLater"
        });
        transientListBinding.refreshInternal = function () {
          /* */
        };
        transCtx = transientListBinding.create({}, true);
      }
      return transCtx;
    },
    onDialogOpen: function (event) {
      const source = event.getSource();
      const fieldsInfoModel = source.getModel("fieldsInfo");
      fieldsInfoModel.setProperty("/isOpen", true);
    },
    closeDialog: function (oDialog) {
      oDialog.close();
      oDialog.destroy();
    },
    messageHandlingForMassEdit: async function (oTable, aContexts, oController, oInDialog, aResults, errorContexts) {
      var _oController$getView, _oController$getView$, _oController$getView4, _oController$getView5;
      const DraftStatus = FELibrary.DraftStatus;
      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
      (_oController$getView = oController.getView()) === null || _oController$getView === void 0 ? void 0 : (_oController$getView$ = _oController$getView.getBindingContext("internal")) === null || _oController$getView$ === void 0 ? void 0 : _oController$getView$.setProperty("getBoundMessagesForMassEdit", true);
      oController.messageHandler.showMessages({
        onBeforeShowMessage: function (messages, showMessageParameters) {
          //messages.concatenate(messageHandling.getMessages(true, true));
          showMessageParameters.fnGetMessageSubtitle = messageHandling.setMessageSubtitle.bind({}, oTable, aContexts);
          const unboundErrors = [];
          messages.forEach(function (message) {
            if (!message.getTarget()) {
              unboundErrors.push(message);
            }
          });
          if (aResults.length > 0 && errorContexts.length === 0) {
            oController.editFlow.setDraftStatus(DraftStatus.Saved);
            const successToast = oResourceBundle.getText("C_MASS_EDIT_SUCCESS_TOAST");
            MessageToast.show(successToast);
          } else if (errorContexts.length < oTable.getSelectedContexts().length) {
            oController.editFlow.setDraftStatus(DraftStatus.Saved);
          } else if (errorContexts.length === oTable.getSelectedContexts().length) {
            oController.editFlow.setDraftStatus(DraftStatus.Clear);
          }
          if (oController.getModel("ui").getProperty("/isEditable") && unboundErrors.length === 0) {
            showMessageParameters.showMessageBox = false;
            showMessageParameters.showMessageDialog = false;
          }
          return showMessageParameters;
        }
      });
      if (oInDialog.isOpen()) {
        var _oController$getView2, _oController$getView3;
        MassEditHelper.closeDialog(oInDialog);
        (_oController$getView2 = oController.getView()) === null || _oController$getView2 === void 0 ? void 0 : (_oController$getView3 = _oController$getView2.getBindingContext("internal")) === null || _oController$getView3 === void 0 ? void 0 : _oController$getView3.setProperty("skipPatchHandlers", false);
      }
      (_oController$getView4 = oController.getView()) === null || _oController$getView4 === void 0 ? void 0 : (_oController$getView5 = _oController$getView4.getBindingContext("internal")) === null || _oController$getView5 === void 0 ? void 0 : _oController$getView5.setProperty("getBoundMessagesForMassEdit", false);
    },
    /**
     * This function generates side effects map from side effects ids(which is a combination of entity type and qualifier).
     *
     * @param oEntitySetContext
     * @param appComponent
     * @param oController
     * @param aResults
     * @returns Side effect map with data.
     */
    getSideEffectDataForKey: function (oEntitySetContext, appComponent, oController, aResults) {
      const sOwnerEntityType = oEntitySetContext.getProperty("$Type");
      const baseSideEffectsMapArray = {};
      aResults.forEach(result => {
        const sPath = result.keyValue;
        const sideEffectService = appComponent.getSideEffectsService();
        const fieldGroupIds = sideEffectService.computeFieldGroupIds(sOwnerEntityType, result.propertyFullyQualifiedName ?? "") ?? [];
        baseSideEffectsMapArray[sPath] = oController._sideEffects.getSideEffectsMapForFieldGroups(fieldGroupIds);
      });
      return baseSideEffectsMapArray;
    },
    /**
     * Give the entity type for a given spath for e.g.RequestedQuantity.
     *
     * @param sPath
     * @param sEntityType
     * @param oMetaModel
     * @returns Object having entity, spath and navigation path.
     */
    fnGetPathForSourceProperty: function (sPath, sEntityType, oMetaModel) {
      // if the property path has a navigation, get the target entity type of the navigation
      const sNavigationPath = sPath.indexOf("/") > 0 ? "/" + sEntityType + "/" + sPath.substr(0, sPath.lastIndexOf("/") + 1) + "@sapui.name" : false,
        pOwnerEntity = !sNavigationPath ? Promise.resolve(sEntityType) : oMetaModel.requestObject(sNavigationPath);
      sPath = sNavigationPath ? sPath.substr(sPath.lastIndexOf("/") + 1) : sPath;
      return {
        sPath,
        pOwnerEntity,
        sNavigationPath
      };
    },
    fnGetEntityTypeOfOwner: function (oMetaModel, baseNavPath, oEntitySetContext, targetEntity, aTargets) {
      const ownerEntityType = oEntitySetContext.getProperty("$Type");
      const {
        $Type: pOwner,
        $Partner: ownerNavPath
      } = oMetaModel.getObject(`${oEntitySetContext}/${baseNavPath}`); // nav path
      if (ownerNavPath) {
        const entityObjOfOwnerPartner = oMetaModel.getObject(`/${pOwner}/${ownerNavPath}`);
        if (entityObjOfOwnerPartner) {
          const entityTypeOfOwnerPartner = entityObjOfOwnerPartner["$Type"];
          // if the entity types defer, then base nav path is not from owner
          if (entityTypeOfOwnerPartner !== ownerEntityType) {
            // if target Prop is not from owner, we add it as immediate
            aTargets.push(targetEntity);
          }
        }
      } else {
        // if there is no $Partner attribute, it may not be from owner
        aTargets.push(targetEntity);
      }
      return aTargets;
    },
    /**
     * Give targets that are immediate or deferred based on the entity type of that target.
     *
     *
     * @param sideEffectsData
     * @param oEntitySetContext
     * @param sEntityType
     * @param oMetaModel
     * @returns Targets to request side effects.
     */
    fnGetTargetsForMassEdit: function (sideEffectsData, oEntitySetContext, sEntityType, oMetaModel) {
      const {
        targetProperties: aTargetProperties,
        targetEntities: aTargetEntities
      } = sideEffectsData;
      const aPromises = [];
      let aTargets = [];
      const ownerEntityType = oEntitySetContext.getProperty("$Type");
      if (sEntityType === ownerEntityType) {
        // if SalesOrdr Item
        aTargetEntities === null || aTargetEntities === void 0 ? void 0 : aTargetEntities.forEach(targetEntity => {
          targetEntity = targetEntity["$NavigationPropertyPath"];
          let baseNavPath;
          if (targetEntity.includes("/")) {
            baseNavPath = targetEntity.split("/")[0];
          } else {
            baseNavPath = targetEntity;
          }
          aTargets = MassEditHelper.fnGetEntityTypeOfOwner(oMetaModel, baseNavPath, oEntitySetContext, targetEntity, aTargets);
        });
      }
      if (aTargetProperties.length) {
        aTargetProperties.forEach(targetProp => {
          const {
            pOwnerEntity
          } = MassEditHelper.fnGetPathForSourceProperty(targetProp, sEntityType, oMetaModel);
          aPromises.push(pOwnerEntity.then(resultEntity => {
            // if entity is SalesOrderItem, Target Property is from Items table
            if (resultEntity === ownerEntityType) {
              aTargets.push(targetProp); // get immediate targets
            } else if (targetProp.includes("/")) {
              const baseNavPath = targetProp.split("/")[0];
              aTargets = MassEditHelper.fnGetEntityTypeOfOwner(oMetaModel, baseNavPath, oEntitySetContext, targetProp, aTargets);
            }
            return Promise.resolve(aTargets);
          }));
        });
      } else {
        aPromises.push(Promise.resolve(aTargets));
      }
      return Promise.all(aPromises);
    },
    /**
     * This function checks if in the given side Effects Obj, if _Item is set as Target Entity for any side Effects on
     * other entity set.
     *
     * @param sideEffectsMap
     * @param oEntitySetContext
     * @returns Length of sideEffectsArray where current Entity is set as Target Entity
     */
    checkIfEntityExistsAsTargetEntity: (sideEffectsMap, oEntitySetContext) => {
      const ownerEntityType = oEntitySetContext.getProperty("$Type");
      const sideEffectsOnOtherEntity = Object.values(sideEffectsMap).filter(obj => {
        return obj.name.indexOf(ownerEntityType) == -1;
      });
      const entitySetName = oEntitySetContext.getPath().split("/").pop();
      const sideEffectsWithCurrentEntityAsTarget = sideEffectsOnOtherEntity.filter(obj => {
        const targetEntitiesArray = obj.sideEffects.targetEntities;
        return targetEntitiesArray !== null && targetEntitiesArray !== void 0 && targetEntitiesArray.filter(innerObj => innerObj["$NavigationPropertyPath"] === entitySetName).length ? obj : false;
      });
      return sideEffectsWithCurrentEntityAsTarget.length;
    },
    /**
     * Upon updating the field, array of immediate and deferred side effects for that field are created.
     * If there are any failed side effects for that context, they will also be used to generate the map.
     * If the field has text associated with it, then add it to request side effects.
     *
     * @param mParams
     * @param mParams.oController Controller
     * @param mParams.oFieldPromise Promise to update field
     * @param mParams.sideEffectMap SideEffectsMap for the field
     * @param mParams.textPaths TextPaths of the field if any
     * @param mParams.groupId Group Id to used to group requests
     * @param mParams.key KeyValue of the field
     * @param mParams.oEntitySetContext EntitySetcontext
     * @param mParams.oMetaModel Metamodel data
     * @param mParams.selectedContext Selected row context
     * @param mParams.deferredTargetsForAQualifiedName Deferred targets data
     * @returns Promise for all immediately requested side effects.
     */
    handleMassEditFieldUpdateAndRequestSideEffects: async function (mParams) {
      const {
        oController,
        oFieldPromise,
        sideEffectsMap,
        textPaths,
        groupId,
        key,
        oEntitySetContext,
        oMetaModel,
        oSelectedContext,
        deferredTargetsForAQualifiedName
      } = mParams;
      const immediateSideEffectsPromises = [oFieldPromise];
      const ownerEntityType = oEntitySetContext.getProperty("$Type");
      const oAppComponent = CommonUtils.getAppComponent(oController.getView());
      const oSideEffectsService = oAppComponent.getSideEffectsService();
      const isSideEffectsWithCurrentEntityAsTarget = MassEditHelper.checkIfEntityExistsAsTargetEntity(sideEffectsMap, oEntitySetContext);
      if (sideEffectsMap) {
        const allEntityTypesWithQualifier = Object.keys(sideEffectsMap);
        const sideEffectsDataForField = Object.values(sideEffectsMap);
        const mVisitedSideEffects = {};
        deferredTargetsForAQualifiedName[key] = {};
        for (const [index, data] of sideEffectsDataForField.entries()) {
          const entityTypeWithQualifier = allEntityTypesWithQualifier[index];
          const sEntityType = entityTypeWithQualifier.split("#")[0];
          const oContext = oController._sideEffects.getContextForSideEffects(oSelectedContext, sEntityType);
          data.context = oContext;
          const allFailedSideEffects = oController._sideEffects.getRegisteredFailedRequests();
          const aFailedSideEffects = allFailedSideEffects[oContext.getPath()];
          oController._sideEffects.unregisterFailedSideEffectsForAContext(oContext);
          let sideEffectsForCurrentContext = [data.sideEffects];
          sideEffectsForCurrentContext = aFailedSideEffects && aFailedSideEffects.length ? sideEffectsForCurrentContext.concat(aFailedSideEffects) : sideEffectsForCurrentContext;
          mVisitedSideEffects[oContext] = {};
          for (const aSideEffect of sideEffectsForCurrentContext) {
            if (!mVisitedSideEffects[oContext].hasOwnProperty(aSideEffect.fullyQualifiedName)) {
              mVisitedSideEffects[oContext][aSideEffect.fullyQualifiedName] = true;
              let aImmediateTargets = [],
                allTargets = [],
                triggerActionName;
              const fnGetImmediateTargetsAndActions = async function (mSideEffect) {
                const {
                  targetProperties: aTargetProperties,
                  targetEntities: aTargetEntities
                } = mSideEffect;
                const sideEffectEntityType = mSideEffect.fullyQualifiedName.split("@")[0];
                const targetsArrayForAllProperties = await MassEditHelper.fnGetTargetsForMassEdit(mSideEffect, oEntitySetContext, sideEffectEntityType, oMetaModel);
                aImmediateTargets = targetsArrayForAllProperties[0];
                allTargets = (aTargetProperties || []).concat(aTargetEntities || []);
                const actionName = mSideEffect.triggerAction;
                const aDeferredTargets = allTargets.filter(target => {
                  return !aImmediateTargets.includes(target);
                });
                deferredTargetsForAQualifiedName[key][mSideEffect.fullyQualifiedName] = {
                  aTargets: aDeferredTargets,
                  oContext: oContext,
                  mSideEffect
                };

                // if entity is other than items table then action is defered
                if (actionName && sideEffectEntityType === ownerEntityType) {
                  // static action is on collection, so we defer it, else add to immediate requests array
                  const isStaticAction = TableHelper._isStaticAction(oMetaModel.getObject(`/${actionName}`), actionName);
                  if (!isStaticAction) {
                    triggerActionName = actionName;
                  } else {
                    deferredTargetsForAQualifiedName[key][mSideEffect.fullyQualifiedName]["TriggerAction"] = actionName;
                  }
                } else {
                  deferredTargetsForAQualifiedName[key][mSideEffect.fullyQualifiedName]["TriggerAction"] = actionName;
                }
                if (isSideEffectsWithCurrentEntityAsTarget) {
                  aImmediateTargets = [];
                }
                return {
                  aTargets: aImmediateTargets,
                  TriggerAction: triggerActionName
                };
              };
              immediateSideEffectsPromises.push(oController._sideEffects.requestSideEffects(aSideEffect, oContext, groupId, fnGetImmediateTargetsAndActions));
            }
          }
        }
      }
      if (textPaths !== null && textPaths !== void 0 && textPaths[key] && textPaths[key].length) {
        immediateSideEffectsPromises.push(oSideEffectsService.requestSideEffects(textPaths[key], oSelectedContext, groupId));
      }
      return Promise.allSettled(immediateSideEffectsPromises);
    },
    /**
     * Create the mass edit dialog.
     *
     * @param oTable Instance of Table
     * @param aContexts Contexts for mass edit
     * @param oController Controller for the view
     * @returns Promise returning instance of dialog.
     */
    createDialog: async function (oTable, aContexts, oController) {
      const sFragmentName = "sap/fe/core/controls/massEdit/MassEditDialog",
        aDataArray = [],
        oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
        oDefaultValues = MassEditHelper.getDefaultTextsForDialog(oResourceBundle, aContexts.length, oTable),
        oDataFieldModel = MassEditHelper.prepareDataForDialog(oTable, aContexts, aDataArray),
        dialogContext = MassEditHelper.getDialogContext(oTable),
        oDialogDataModel = MassEditHelper.setRuntimeModelOnDialog(aContexts, aDataArray, oDefaultValues, dialogContext),
        model = oTable.getModel(),
        metaModel = model.getMetaModel(),
        itemsModel = new TemplateModel(oDataFieldModel.getData(), metaModel);
      const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
      const oCreatedFragment = await Promise.resolve(XMLPreprocessor.process(oFragment, {
        name: sFragmentName
      }, {
        bindingContexts: {
          dataFieldModel: itemsModel.createBindingContext("/"),
          metaModel: metaModel.createBindingContext("/"),
          contextPath: metaModel.createBindingContext(metaModel.getMetaPath(dialogContext.getPath()))
        },
        models: {
          dataFieldModel: itemsModel,
          metaModel: metaModel,
          contextPath: metaModel
        }
      }));
      const oDialogContent = await Fragment.load({
        definition: oCreatedFragment
      });
      const oDialog = new Dialog({
        resizable: true,
        title: oDefaultValues.massEditTitle,
        content: [oDialogContent],
        afterOpen: MassEditHelper.onDialogOpen,
        beginButton: new Button({
          text: MassEditHelper.helpers.getExpBindingForApplyButtonTxt(oDefaultValues, oDataFieldModel.getObject("/")),
          type: "Emphasized",
          press: async function (oEvent) {
            var _oController$getView6, _oController$getView7;
            messageHandling.removeBoundTransitionMessages();
            messageHandling.removeUnboundTransitionMessages();
            (_oController$getView6 = oController.getView()) === null || _oController$getView6 === void 0 ? void 0 : (_oController$getView7 = _oController$getView6.getBindingContext("internal")) === null || _oController$getView7 === void 0 ? void 0 : _oController$getView7.setProperty("skipPatchHandlers", true);
            const appComponent = CommonUtils.getAppComponent(oController.getView());
            const oInDialog = oEvent.getSource().getParent();
            const oModel = oInDialog.getModel("fieldsInfo");
            const aResults = oModel.getProperty("/results");
            const oMetaModel = oTable && oTable.getModel().getMetaModel(),
              sCurrentEntitySetName = oTable.data("metaPath"),
              oEntitySetContext = oMetaModel.getContext(sCurrentEntitySetName);
            const errorContexts = [];
            const textPaths = oModel.getProperty("/textPaths");
            const aPropertyReadableInfo = oModel.getProperty("/readablePropertyData");
            let groupId;
            let allSideEffects;
            const massEditPromises = [];
            const failedFieldsData = {};
            const selectedRowsLength = aContexts.length;
            const deferredTargetsForAQualifiedName = {};
            const baseSideEffectsMapArray = MassEditHelper.getSideEffectDataForKey(oEntitySetContext, appComponent, oController, aResults);
            //const changePromise: any[] = [];
            //let bReadOnlyField = false;
            //const errorContexts: object[] = [];

            aContexts.forEach(function (oSelectedContext, idx) {
              allSideEffects = [];
              aResults.forEach(async function (oResult) {
                if (!failedFieldsData.hasOwnProperty(oResult.keyValue)) {
                  failedFieldsData[oResult.keyValue] = 0;
                }
                //TODO - Add save implementation for Value Help.
                if (baseSideEffectsMapArray[oResult.keyValue]) {
                  allSideEffects[oResult.keyValue] = baseSideEffectsMapArray[oResult.keyValue];
                }
                if (aPropertyReadableInfo) {
                  aPropertyReadableInfo.some(function (oPropertyInfo) {
                    if (oResult.keyValue === oPropertyInfo.property) {
                      if (oPropertyInfo.type === "Default") {
                        return oPropertyInfo.value === true;
                      } else if (oPropertyInfo.type === "Path" && oPropertyInfo.propertyValue && oPropertyInfo.propertyPath) {
                        return oSelectedContext.getObject(oPropertyInfo.propertyPath) === oPropertyInfo.propertyValue;
                      }
                    }
                  });
                }
                groupId = `$auto.${idx}`;
                const oFieldPromise = oSelectedContext.setProperty(oResult.keyValue, oResult.value, groupId).catch(function (oError) {
                  errorContexts.push(oSelectedContext.getObject());
                  Log.error("Mass Edit: Something went wrong in updating entries.", oError);
                  failedFieldsData[oResult.keyValue] = failedFieldsData[oResult.keyValue] + 1;
                  return Promise.reject({
                    isFieldUpdateFailed: true
                  });
                });
                const dataToUpdateFieldAndSideEffects = {
                  oController,
                  oFieldPromise,
                  sideEffectsMap: baseSideEffectsMapArray[oResult.keyValue],
                  textPaths,
                  groupId,
                  key: oResult.keyValue,
                  oEntitySetContext,
                  oMetaModel,
                  oSelectedContext,
                  deferredTargetsForAQualifiedName
                };
                massEditPromises.push(MassEditHelper.handleMassEditFieldUpdateAndRequestSideEffects(dataToUpdateFieldAndSideEffects));
              });
            });
            await Promise.allSettled(massEditPromises).then(async function () {
              groupId = `$auto.massEditDeferred`;
              const deferredRequests = [];
              const sideEffectsDataForAllKeys = Object.values(deferredTargetsForAQualifiedName);
              const keysWithSideEffects = Object.keys(deferredTargetsForAQualifiedName);
              sideEffectsDataForAllKeys.forEach((aSideEffect, index) => {
                const currentKey = keysWithSideEffects[index];
                if (failedFieldsData[currentKey] !== selectedRowsLength) {
                  const deferredSideEffectsData = Object.values(aSideEffect);
                  deferredSideEffectsData.forEach(req => {
                    const {
                      aTargets,
                      oContext,
                      TriggerAction,
                      mSideEffect
                    } = req;
                    const fnGetDeferredTargets = function () {
                      return aTargets;
                    };
                    const fnGetDeferredTargetsAndActions = function () {
                      return {
                        aTargets: fnGetDeferredTargets(),
                        TriggerAction: TriggerAction
                      };
                    };
                    deferredRequests.push(
                    // if some deferred is rejected, it will be add to failed queue
                    oController._sideEffects.requestSideEffects(mSideEffect, oContext, groupId, fnGetDeferredTargetsAndActions));
                  });
                }
              });
            }).then(function () {
              MassEditHelper.messageHandlingForMassEdit(oTable, aContexts, oController, oInDialog, aResults, errorContexts);
            }).catch(e => {
              MassEditHelper.closeDialog(oDialog);
              return Promise.reject(e);
            });
          }
        }),
        endButton: new Button({
          text: oDefaultValues.cancelButtonText,
          visible: MassEditHelper.helpers.hasEditableFieldsBinding(oDataFieldModel.getObject("/"), true),
          press: function (oEvent) {
            const oInDialog = oEvent.getSource().getParent();
            MassEditHelper.closeDialog(oInDialog);
          }
        })
      });
      oDialog.setModel(oDialogDataModel, "fieldsInfo");
      oDialog.setModel(model);
      oDialog.setBindingContext(dialogContext);
      return oDialog;
    },
    helpers: {
      getBindingExpForHasEditableFields: (fields, editable) => {
        const totalExp = fields.reduce((expression, field) => or(expression, pathInModel("/values/" + field.dataProperty + "/visible", "fieldsInfo")), constant(false));
        return editable ? totalExp : not(totalExp);
      },
      getExpBindingForApplyButtonTxt: (defaultValues, fields) => {
        const editableExp = MassEditHelper.helpers.getBindingExpForHasEditableFields(fields, true);
        const totalExp = ifElse(editableExp, constant(defaultValues.applyButtonText), constant(defaultValues.okButtonText));
        return compileExpression(totalExp);
      },
      hasEditableFieldsBinding: (fields, editable) => {
        const ret = compileExpression(MassEditHelper.helpers.getBindingExpForHasEditableFields(fields, editable));
        if (ret === "true") {
          return true;
        } else if (ret === "false") {
          return false;
        } else {
          return ret;
        }
      }
    }
  };
  return MassEditHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXNzRWRpdEhlbHBlciIsImluaXRMYXN0TGV2ZWxPZlByb3BlcnR5UGF0aCIsInNQYXRoIiwiYVZhbHVlcyIsImFGaW5hbFBhdGgiLCJpbmRleCIsImFQYXRocyIsInNwbGl0Iiwic0Z1bGxQYXRoIiwiZm9yRWFjaCIsInNQcm9wZXJ0eVBhdGgiLCJnZXRVbmlxdWVWYWx1ZXMiLCJzVmFsdWUiLCJzZWxmIiwidW5kZWZpbmVkIiwiaW5kZXhPZiIsImdldFZhbHVlRm9yTXVsdGlMZXZlbFBhdGgiLCJzRGF0YVByb3BlcnR5UGF0aCIsIm9WYWx1ZXMiLCJyZXN1bHQiLCJhUHJvcGVydHlQYXRocyIsImdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3giLCJhQ29udGV4dHMiLCJsZW5ndGgiLCJvU2VsZWN0ZWRDb250ZXh0IiwiYVByb3BlcnR5VmFsdWVzIiwib0NvbnRleHQiLCJvRGF0YU9iamVjdCIsImdldE9iamVjdCIsInNNdWx0aUxldmVsUGF0aENvbmRpdGlvbiIsImhhc093blByb3BlcnR5IiwicHVzaCIsImFVbmlxdWVQcm9wZXJ0eVZhbHVlcyIsImZpbHRlciIsImdldEhpZGRlblZhbHVlRm9yQ29udGV4dHMiLCJoaWRkZW5WYWx1ZSIsIiRQYXRoIiwic29tZSIsImdldElucHV0VHlwZSIsInByb3BlcnR5SW5mbyIsImRhdGFGaWVsZENvbnZlcnRlZCIsIm9EYXRhTW9kZWxQYXRoIiwiZWRpdFN0eWxlUHJvcGVydGllcyIsImlucHV0VHlwZSIsInNldEVkaXRTdHlsZVByb3BlcnRpZXMiLCJlZGl0U3R5bGUiLCJpc1ZhbGlkRm9yTWFzc0VkaXQiLCJpc011bHRpVmFsdWVGaWVsZCIsImhhc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcyIsImdldElzRmllbGRHcnAiLCIkVHlwZSIsIlRhcmdldCIsInZhbHVlIiwiZ2V0VGV4dFBhdGgiLCJwcm9wZXJ0eSIsInRleHRCaW5kaW5nIiwiZGlzcGxheU1vZGUiLCJkZXNjcmlwdGlvblBhdGgiLCJwYXRoIiwicGFyYW1ldGVycyIsInByb3BzIiwicHJlcGFyZURhdGFGb3JEaWFsb2ciLCJvVGFibGUiLCJhRGF0YUFycmF5Iiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic0N1cnJlbnRFbnRpdHlTZXROYW1lIiwiZGF0YSIsImFUYWJsZUZpZWxkcyIsImdldFRhYmxlRmllbGRzIiwib0VudGl0eVR5cGVDb250ZXh0IiwiZ2V0Q29udGV4dCIsIm9FbnRpdHlTZXRDb250ZXh0Iiwib0RhdGFNb2RlbE9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJvRGF0YUZpZWxkTW9kZWwiLCJKU09OTW9kZWwiLCJvUmVzdWx0Iiwic0xhYmVsVGV4dCIsImJWYWx1ZUhlbHBFbmFibGVkIiwic1VuaXRQcm9wZXJ0eVBhdGgiLCJiVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQiLCJvVGV4dEJpbmRpbmciLCJvQ29sdW1uSW5mbyIsImFubm90YXRpb25QYXRoIiwiZGF0YVByb3BlcnR5Iiwib1Byb3BlcnR5SW5mbyIsImxhYmVsIiwidGFyZ2V0T2JqZWN0IiwidGFyZ2V0RW50aXR5VHlwZSIsImVudGl0eVByb3BlcnRpZXMiLCJvUHJvcGVydHkiLCJuYW1lIiwiZ2V0VGV4dEJpbmRpbmciLCJvRmllbGRDb250ZXh0Iiwib0RhdGFGaWVsZENvbnZlcnRlZCIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0Iiwib1Byb3BlcnR5Q29udGV4dCIsIm9JbnRlcmZhY2UiLCJnZXRJbnRlcmZhY2UiLCJWYWx1ZSIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwiYkhpZGRlbkZpZWxkIiwiaXNJbWFnZSIsImNvbnRleHQiLCJnZXRQYXRoIiwiaXNQcm9wZXJ0eSIsIiR0YXJnZXQiLCJjaGFydFByb3BlcnR5IiwidGVybSIsImlzQWN0aW9uIiwiQWN0aW9uIiwiaXNGaWVsZEdycCIsImhhc0N1cnJlbmN5IiwiaGFzVW5pdCIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoIiwidW5pdFByb3BlcnR5SW5mbyIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkiLCJoYXNWYWx1ZUhlbHAiLCJoYXNDb250ZXh0RGVwZW5kZW50VkgiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlZhbHVlTGlzdFJlbGV2YW50UXVhbGlmaWVycyIsInByb3BlcnR5Rm9yRmllbGRDb250cm9sIiwiZXhwQmluZGluZyIsImdldEVkaXRNb2RlIiwiY29uc3RhbnQiLCJlZGl0TW9kZVZhbHVlcyIsIk9iamVjdCIsImtleXMiLCJFZGl0TW9kZSIsImVkaXRNb2RlSXNTdGF0aWMiLCJpbmNsdWRlcyIsImVkaXRhYmxlIiwiRWRpdGFibGUiLCJuYXZQcm9wZXJ0eVdpdGhWYWx1ZUhlbHAiLCJyZWxhdGl2ZVBhdGgiLCJnZXRSZWxhdGl2ZVBhdGhzIiwiaXNSZWFkT25seSIsImlzUmVhZE9ubHlFeHByZXNzaW9uIiwiQ29tbW9uVXRpbHMiLCJjb21wdXRlRGlzcGxheU1vZGUiLCJpc1ZhbHVlSGVscEVuYWJsZWQiLCJpc1ZhbHVlSGVscEVuYWJsZWRGb3JVbml0IiwidW5pdFByb3BlcnR5IiwiaXNGaWVsZFJlcXVpcmVkIiwiZ2V0UmVxdWlyZWRFeHByZXNzaW9uIiwiZGVmYXVsdFNlbGVjdGlvblBhdGgiLCJkZWZhdWx0U2VsZWN0aW9uVW5pdFBhdGgiLCJlbnRpdHlTZXQiLCJkaXNwbGF5IiwibnVsbGFibGUiLCJpc1Byb3BlcnR5UmVhZE9ubHkiLCJlZGl0TW9kZSIsImhhc1ZIIiwicnVudGltZVBhdGgiLCJwcm9wZXJ0eUZ1bGx5UXVhbGlmaWVkTmFtZSIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInByb3BlcnR5UGF0aEZvclZhbHVlSGVscCIsInVuaXRJbmZvIiwic2V0RGF0YSIsImFDb2x1bW5zIiwiZ2V0Q29sdW1ucyIsImNvbHVtbnNEYXRhIiwiZ2V0UGFyZW50IiwiZ2V0VGFibGVEZWZpbml0aW9uIiwiY29sdW1ucyIsIm1hcCIsIm9Db2x1bW4iLCJzRGF0YVByb3BlcnR5IiwiZ2V0RGF0YVByb3BlcnR5IiwiYVJlYWx0ZWRDb2x1bW5JbmZvIiwidHlwZSIsImdldEhlYWRlciIsImdldERlZmF1bHRUZXh0c0ZvckRpYWxvZyIsIm9SZXNvdXJjZUJ1bmRsZSIsImlTZWxlY3RlZENvbnRleHRzIiwiYkRpc3BsYXlNb2RlIiwia2VlcEV4aXN0aW5nUHJlZml4IiwibGVhdmVCbGFua1ZhbHVlIiwiY2xlYXJGaWVsZFZhbHVlIiwibWFzc0VkaXRUaXRsZSIsImdldFRleHQiLCJ0b1N0cmluZyIsImFwcGx5QnV0dG9uVGV4dCIsInVzZVZhbHVlSGVscFZhbHVlIiwiY2FuY2VsQnV0dG9uVGV4dCIsIm5vRmllbGRzIiwib2tCdXR0b25UZXh0Iiwic2V0RGVmYXVsdFZhbHVlc1RvRGlhbG9nIiwib0RlZmF1bHRWYWx1ZXMiLCJiVU9NRmllbGQiLCJzSW5wdXRUeXBlIiwiYlByb3BlcnR5UmVxdWlyZWQiLCJzU3VmZml4Rm9yS2VlcEV4aXN0aW5nIiwiZGVmYXVsdE9wdGlvbnMiLCJzZWxlY3RPcHRpb25zRXhpc3QiLCJzZWxlY3RPcHRpb25zIiwia2VlcEVudHJ5IiwidGV4dCIsImtleSIsImZhbHNlRW50cnkiLCJ0ZXh0SW5mbyIsInRydXRoeUVudHJ5IiwidW5zaGlmdCIsInZoZEVudHJ5IiwiY2xlYXJFbnRyeSIsImVtcHR5RW50cnkiLCJnZXRUZXh0QXJyYW5nZW1lbnRJbmZvIiwic2VsZWN0ZWRDb250ZXh0IiwiZGVzY3JpcHRpb25WYWx1ZSIsImZ1bGxUZXh0IiwiTG9nIiwiaW5mbyIsInRleHRBcnJhbmdlbWVudCIsInZhbHVlUGF0aCIsImRlc2NyaXB0aW9uIiwiaXNFZGl0YWJsZSIsImFueSIsImJpbmRpbmciLCJnZXRCaW5kaW5nIiwiZ2V0RXh0ZXJuYWxWYWx1ZSIsIm9uQ29udGV4dEVkaXRhYmxlQ2hhbmdlIiwib0RpYWxvZ0RhdGFNb2RlbCIsIm9iamVjdHNGb3JWaXNpYmlsaXR5IiwiZ2V0UHJvcGVydHkiLCJzZXRQcm9wZXJ0eSIsInVwZGF0ZU9uQ29udGV4dENoYW5nZSIsIm1PVG9Vc2UiLCJ2YWx1ZXMiLCJhdHRhY2hDaGFuZ2UiLCJiaW5kIiwiZ2V0Qm91bmRPYmplY3QiLCJBbnkiLCJtb2RlbCIsInNldE1vZGVsIiwic2V0QmluZGluZ0NvbnRleHQiLCJnZXRGaWVsZFZpc2libGl0eSIsImlzQ29udGV4dEVkaXRhYmxlIiwic2V0UnVudGltZU1vZGVsT25EaWFsb2ciLCJkaWFsb2dDb250ZXh0IiwiYVVuaXREYXRhIiwiYVJlc3VsdHMiLCJ0ZXh0UGF0aHMiLCJhUmVhZE9ubHlGaWVsZEluZm8iLCJvRGF0YSIsInVuaXREYXRhIiwicmVzdWx0cyIsInJlYWRhYmxlUHJvcGVydHlEYXRhIiwic2VsZWN0ZWRLZXkiLCJvSW5EYXRhIiwib1RleHRJbmZvIiwic1Byb3BlcnR5S2V5Iiwic1VuaXRQcm9wZXJ0eU5hbWUiLCJvRGlzdGluY3RWYWx1ZU1hcCIsIm9EaXN0aW5jdFVuaXRNYXAiLCJzTXVsdGlMZXZlbFBhdGhWYWx1ZSIsImVudHJ5IiwidW5pdEVudHJ5Iiwic011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlIiwiYkNsZWFyRmllbGRPckJsYW5rVmFsdWVFeGlzdHMiLCJvYmoiLCJiQ2xlYXJGaWVsZE9yQmxhbmtVbml0VmFsdWVFeGlzdHMiLCJvcGVyYW5kcyIsIm9wZXJhbmQxIiwib3BlcmFuZDIiLCJwcm9wZXJ0eVBhdGgiLCJwcm9wZXJ0eVZhbHVlIiwidmlzaWJsZSIsImdldERpYWxvZ0NvbnRleHQiLCJ0YWJsZSIsImRpYWxvZyIsInRyYW5zQ3R4IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJsaXN0QmluZGluZyIsImdldFJvd0JpbmRpbmciLCJ0cmFuc2llbnRMaXN0QmluZGluZyIsImJpbmRMaXN0IiwiJCR1cGRhdGVHcm91cElkIiwicmVmcmVzaEludGVybmFsIiwiY3JlYXRlIiwib25EaWFsb2dPcGVuIiwiZXZlbnQiLCJzb3VyY2UiLCJnZXRTb3VyY2UiLCJmaWVsZHNJbmZvTW9kZWwiLCJjbG9zZURpYWxvZyIsIm9EaWFsb2ciLCJjbG9zZSIsImRlc3Ryb3kiLCJtZXNzYWdlSGFuZGxpbmdGb3JNYXNzRWRpdCIsIm9Db250cm9sbGVyIiwib0luRGlhbG9nIiwiZXJyb3JDb250ZXh0cyIsIkRyYWZ0U3RhdHVzIiwiRkVMaWJyYXJ5IiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImdldFZpZXciLCJtZXNzYWdlSGFuZGxlciIsInNob3dNZXNzYWdlcyIsIm9uQmVmb3JlU2hvd01lc3NhZ2UiLCJtZXNzYWdlcyIsInNob3dNZXNzYWdlUGFyYW1ldGVycyIsImZuR2V0TWVzc2FnZVN1YnRpdGxlIiwibWVzc2FnZUhhbmRsaW5nIiwic2V0TWVzc2FnZVN1YnRpdGxlIiwidW5ib3VuZEVycm9ycyIsIm1lc3NhZ2UiLCJnZXRUYXJnZXQiLCJlZGl0RmxvdyIsInNldERyYWZ0U3RhdHVzIiwiU2F2ZWQiLCJzdWNjZXNzVG9hc3QiLCJNZXNzYWdlVG9hc3QiLCJzaG93IiwiZ2V0U2VsZWN0ZWRDb250ZXh0cyIsIkNsZWFyIiwic2hvd01lc3NhZ2VCb3giLCJzaG93TWVzc2FnZURpYWxvZyIsImlzT3BlbiIsImdldFNpZGVFZmZlY3REYXRhRm9yS2V5IiwiYXBwQ29tcG9uZW50Iiwic093bmVyRW50aXR5VHlwZSIsImJhc2VTaWRlRWZmZWN0c01hcEFycmF5Iiwia2V5VmFsdWUiLCJzaWRlRWZmZWN0U2VydmljZSIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsImZpZWxkR3JvdXBJZHMiLCJjb21wdXRlRmllbGRHcm91cElkcyIsIl9zaWRlRWZmZWN0cyIsImdldFNpZGVFZmZlY3RzTWFwRm9yRmllbGRHcm91cHMiLCJmbkdldFBhdGhGb3JTb3VyY2VQcm9wZXJ0eSIsInNFbnRpdHlUeXBlIiwic05hdmlnYXRpb25QYXRoIiwic3Vic3RyIiwibGFzdEluZGV4T2YiLCJwT3duZXJFbnRpdHkiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlcXVlc3RPYmplY3QiLCJmbkdldEVudGl0eVR5cGVPZk93bmVyIiwiYmFzZU5hdlBhdGgiLCJ0YXJnZXRFbnRpdHkiLCJhVGFyZ2V0cyIsIm93bmVyRW50aXR5VHlwZSIsInBPd25lciIsIiRQYXJ0bmVyIiwib3duZXJOYXZQYXRoIiwiZW50aXR5T2JqT2ZPd25lclBhcnRuZXIiLCJlbnRpdHlUeXBlT2ZPd25lclBhcnRuZXIiLCJmbkdldFRhcmdldHNGb3JNYXNzRWRpdCIsInNpZGVFZmZlY3RzRGF0YSIsInRhcmdldFByb3BlcnRpZXMiLCJhVGFyZ2V0UHJvcGVydGllcyIsInRhcmdldEVudGl0aWVzIiwiYVRhcmdldEVudGl0aWVzIiwiYVByb21pc2VzIiwidGFyZ2V0UHJvcCIsInRoZW4iLCJyZXN1bHRFbnRpdHkiLCJhbGwiLCJjaGVja0lmRW50aXR5RXhpc3RzQXNUYXJnZXRFbnRpdHkiLCJzaWRlRWZmZWN0c01hcCIsInNpZGVFZmZlY3RzT25PdGhlckVudGl0eSIsImVudGl0eVNldE5hbWUiLCJwb3AiLCJzaWRlRWZmZWN0c1dpdGhDdXJyZW50RW50aXR5QXNUYXJnZXQiLCJ0YXJnZXRFbnRpdGllc0FycmF5Iiwic2lkZUVmZmVjdHMiLCJpbm5lck9iaiIsImhhbmRsZU1hc3NFZGl0RmllbGRVcGRhdGVBbmRSZXF1ZXN0U2lkZUVmZmVjdHMiLCJtUGFyYW1zIiwib0ZpZWxkUHJvbWlzZSIsImdyb3VwSWQiLCJkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZSIsImltbWVkaWF0ZVNpZGVFZmZlY3RzUHJvbWlzZXMiLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50Iiwib1NpZGVFZmZlY3RzU2VydmljZSIsImlzU2lkZUVmZmVjdHNXaXRoQ3VycmVudEVudGl0eUFzVGFyZ2V0IiwiYWxsRW50aXR5VHlwZXNXaXRoUXVhbGlmaWVyIiwic2lkZUVmZmVjdHNEYXRhRm9yRmllbGQiLCJtVmlzaXRlZFNpZGVFZmZlY3RzIiwiZW50cmllcyIsImVudGl0eVR5cGVXaXRoUXVhbGlmaWVyIiwiZ2V0Q29udGV4dEZvclNpZGVFZmZlY3RzIiwiYWxsRmFpbGVkU2lkZUVmZmVjdHMiLCJnZXRSZWdpc3RlcmVkRmFpbGVkUmVxdWVzdHMiLCJhRmFpbGVkU2lkZUVmZmVjdHMiLCJ1bnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHNGb3JBQ29udGV4dCIsInNpZGVFZmZlY3RzRm9yQ3VycmVudENvbnRleHQiLCJjb25jYXQiLCJhU2lkZUVmZmVjdCIsImFJbW1lZGlhdGVUYXJnZXRzIiwiYWxsVGFyZ2V0cyIsInRyaWdnZXJBY3Rpb25OYW1lIiwiZm5HZXRJbW1lZGlhdGVUYXJnZXRzQW5kQWN0aW9ucyIsIm1TaWRlRWZmZWN0Iiwic2lkZUVmZmVjdEVudGl0eVR5cGUiLCJ0YXJnZXRzQXJyYXlGb3JBbGxQcm9wZXJ0aWVzIiwiYWN0aW9uTmFtZSIsInRyaWdnZXJBY3Rpb24iLCJhRGVmZXJyZWRUYXJnZXRzIiwidGFyZ2V0IiwiaXNTdGF0aWNBY3Rpb24iLCJUYWJsZUhlbHBlciIsIl9pc1N0YXRpY0FjdGlvbiIsIlRyaWdnZXJBY3Rpb24iLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCJhbGxTZXR0bGVkIiwiY3JlYXRlRGlhbG9nIiwic0ZyYWdtZW50TmFtZSIsIm1ldGFNb2RlbCIsIml0ZW1zTW9kZWwiLCJUZW1wbGF0ZU1vZGVsIiwiZ2V0RGF0YSIsIm9GcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwib0NyZWF0ZWRGcmFnbWVudCIsIlhNTFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJiaW5kaW5nQ29udGV4dHMiLCJkYXRhRmllbGRNb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiY29udGV4dFBhdGgiLCJnZXRNZXRhUGF0aCIsIm1vZGVscyIsIm9EaWFsb2dDb250ZW50IiwiRnJhZ21lbnQiLCJsb2FkIiwiZGVmaW5pdGlvbiIsIkRpYWxvZyIsInJlc2l6YWJsZSIsInRpdGxlIiwiY29udGVudCIsImFmdGVyT3BlbiIsImJlZ2luQnV0dG9uIiwiQnV0dG9uIiwiaGVscGVycyIsImdldEV4cEJpbmRpbmdGb3JBcHBseUJ1dHRvblR4dCIsInByZXNzIiwib0V2ZW50IiwicmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwib01vZGVsIiwiYVByb3BlcnR5UmVhZGFibGVJbmZvIiwiYWxsU2lkZUVmZmVjdHMiLCJtYXNzRWRpdFByb21pc2VzIiwiZmFpbGVkRmllbGRzRGF0YSIsInNlbGVjdGVkUm93c0xlbmd0aCIsImlkeCIsImNhdGNoIiwib0Vycm9yIiwiZXJyb3IiLCJyZWplY3QiLCJpc0ZpZWxkVXBkYXRlRmFpbGVkIiwiZGF0YVRvVXBkYXRlRmllbGRBbmRTaWRlRWZmZWN0cyIsImRlZmVycmVkUmVxdWVzdHMiLCJzaWRlRWZmZWN0c0RhdGFGb3JBbGxLZXlzIiwia2V5c1dpdGhTaWRlRWZmZWN0cyIsImN1cnJlbnRLZXkiLCJkZWZlcnJlZFNpZGVFZmZlY3RzRGF0YSIsInJlcSIsImZuR2V0RGVmZXJyZWRUYXJnZXRzIiwiZm5HZXREZWZlcnJlZFRhcmdldHNBbmRBY3Rpb25zIiwiZSIsImVuZEJ1dHRvbiIsImhhc0VkaXRhYmxlRmllbGRzQmluZGluZyIsImdldEJpbmRpbmdFeHBGb3JIYXNFZGl0YWJsZUZpZWxkcyIsImZpZWxkcyIsInRvdGFsRXhwIiwicmVkdWNlIiwiZXhwcmVzc2lvbiIsImZpZWxkIiwib3IiLCJwYXRoSW5Nb2RlbCIsIm5vdCIsImRlZmF1bHRWYWx1ZXMiLCJlZGl0YWJsZUV4cCIsImlmRWxzZSIsImNvbXBpbGVFeHByZXNzaW9uIiwicmV0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNYXNzRWRpdEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB0eXBlIHtcblx0RmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeSxcblx0TWFzc0VkaXRGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5LFxuXHRNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZVxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2lkZUVmZmVjdHNcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBjb21waWxlRXhwcmVzc2lvbiwgY29uc3RhbnQsIGlmRWxzZSwgbm90LCBvciwgcGF0aEluTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgaXNQcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCBGRUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgeyBPRGF0YVNpZGVFZmZlY3RzVHlwZSwgU2lkZUVmZmVjdHNFbnRpdHlUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1NpZGVFZmZlY3RzU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCBUZW1wbGF0ZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBlbmhhbmNlRGF0YU1vZGVsUGF0aCwgZ2V0UmVsYXRpdmVQYXRocyB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7XG5cdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHksXG5cdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoLFxuXHRoYXNDdXJyZW5jeSxcblx0aGFzVW5pdCxcblx0aGFzVmFsdWVIZWxwLFxuXHRoYXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXNcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB7IGdldFRleHRCaW5kaW5nLCBzZXRFZGl0U3R5bGVQcm9wZXJ0aWVzIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgdHlwZSB7IEZpZWxkUHJvcGVydGllcyB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL0ludGVybmFsRmllbGQuYmxvY2tcIjtcbmltcG9ydCBUYWJsZUhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUhlbHBlclwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBNZXNzYWdlVG9hc3QgZnJvbSBcInNhcC9tL01lc3NhZ2VUb2FzdFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgRWRpdE1vZGUgZnJvbSBcInNhcC91aS9tZGMvZW51bS9FZGl0TW9kZVwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YVY0Q29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuaW1wb3J0IG1lc3NhZ2VIYW5kbGluZyBmcm9tIFwiLi4vY29udHJvbGxlcmV4dGVuc2lvbnMvbWVzc2FnZUhhbmRsZXIvbWVzc2FnZUhhbmRsaW5nXCI7XG5pbXBvcnQgdHlwZSB7IEFueVR5cGUgfSBmcm9tIFwiLi4vY29udHJvbHMvQW55XCI7XG5pbXBvcnQgQW55IGZyb20gXCIuLi9jb250cm9scy9BbnlcIjtcbmltcG9ydCB7IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0LCBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwiLi4vY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGlzUmVhZE9ubHlFeHByZXNzaW9uIH0gZnJvbSBcIi4uL3RlbXBsYXRpbmcvRmllbGRDb250cm9sSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRFZGl0TW9kZSwgZ2V0UmVxdWlyZWRFeHByZXNzaW9uLCBpc011bHRpVmFsdWVGaWVsZCB9IGZyb20gXCIuLi90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbE1vZGVsQ29udGV4dCB9IGZyb20gXCIuL01vZGVsSGVscGVyXCI7XG5cbi8qIFRoaXMgY2xhc3MgY29udGFpbnMgaGVscGVycyB0byBiZSB1c2VkIGZvciBtYXNzIGVkaXQgZnVuY3Rpb25hbGl0eSAqL1xudHlwZSBUZXh0QXJyYW5nZW1lbnRJbmZvID0ge1xuXHR0ZXh0QXJyYW5nZW1lbnQ6IHN0cmluZztcblx0dmFsdWVQYXRoOiBzdHJpbmc7XG5cdGRlc2NyaXB0aW9uUGF0aD86IHN0cmluZztcblx0dmFsdWU6IHN0cmluZztcblx0ZGVzY3JpcHRpb246IHN0cmluZztcblx0ZnVsbFRleHQ6IHN0cmluZztcbn07XG5cbnR5cGUgQmluZGluZ0luZm8gPSB7XG5cdHBhdGg/OiBzdHJpbmc7XG5cdG1vZGVsPzogc3RyaW5nIHwgb2JqZWN0O1xuXHRwYXJhbWV0ZXJzPzogQXJyYXk8QmluZGluZ0luZm8+O1xufTtcblxuZXhwb3J0IHR5cGUgRGF0YVRvVXBkYXRlRmllbGRBbmRTaWRlRWZmZWN0c1R5cGUgPSB7XG5cdG9Db250cm9sbGVyOiBQYWdlQ29udHJvbGxlcjtcblx0b0ZpZWxkUHJvbWlzZTogUHJvbWlzZTxhbnk+O1xuXHRzaWRlRWZmZWN0c01hcDogTWFzc0VkaXRGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5IHwgRmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeTtcblx0dGV4dFBhdGhzOiBhbnk7XG5cdGdyb3VwSWQ6IHN0cmluZztcblx0a2V5OiBzdHJpbmc7XG5cdG9FbnRpdHlTZXRDb250ZXh0OiBDb250ZXh0O1xuXHRvTWV0YU1vZGVsOiBhbnk7XG5cdG9TZWxlY3RlZENvbnRleHQ6IGFueTtcblx0ZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWU6IGFueTtcbn07XG5cbmNvbnN0IE1hc3NFZGl0SGVscGVyID0ge1xuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIHZhbHVlIGF0IGZpbmFsIG9yIGRlZXBlc3QgbGV2ZWwgcGF0aCB3aXRoIGEgYmxhbmsgYXJyYXkuXG5cdCAqIFJldHVybiBhbiBlbXB0eSBhcnJheSBwb2ludGluZyB0byB0aGUgZmluYWwgb3IgZGVlcGVzdCBsZXZlbCBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGggUHJvcGVydHkgcGF0aFxuXHQgKiBAcGFyYW0gYVZhbHVlcyBBcnJheSBpbnN0YW5jZSB3aGVyZSB0aGUgZGVmYXVsdCBkYXRhIG5lZWRzIHRvIGJlIGFkZGVkXG5cdCAqIEByZXR1cm5zIFRoZSBmaW5hbCBwYXRoXG5cdCAqL1xuXHRpbml0TGFzdExldmVsT2ZQcm9wZXJ0eVBhdGg6IGZ1bmN0aW9uIChzUGF0aDogc3RyaW5nLCBhVmFsdWVzOiBhbnkgLyosIHRyYW5zQ3R4OiBDb250ZXh0ICovKSB7XG5cdFx0bGV0IGFGaW5hbFBhdGg6IGFueTtcblx0XHRsZXQgaW5kZXggPSAwO1xuXHRcdGNvbnN0IGFQYXRocyA9IHNQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRsZXQgc0Z1bGxQYXRoID0gXCJcIjtcblx0XHRhUGF0aHMuZm9yRWFjaChmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0XHRpZiAoIWFWYWx1ZXNbc1Byb3BlcnR5UGF0aF0gJiYgaW5kZXggPT09IDApIHtcblx0XHRcdFx0YVZhbHVlc1tzUHJvcGVydHlQYXRoXSA9IHt9O1xuXHRcdFx0XHRhRmluYWxQYXRoID0gYVZhbHVlc1tzUHJvcGVydHlQYXRoXTtcblx0XHRcdFx0c0Z1bGxQYXRoID0gc0Z1bGxQYXRoICsgc1Byb3BlcnR5UGF0aDtcblx0XHRcdFx0aW5kZXgrKztcblx0XHRcdH0gZWxzZSBpZiAoIWFGaW5hbFBhdGhbc1Byb3BlcnR5UGF0aF0pIHtcblx0XHRcdFx0c0Z1bGxQYXRoID0gYCR7c0Z1bGxQYXRofS8ke3NQcm9wZXJ0eVBhdGh9YDtcblx0XHRcdFx0aWYgKHNGdWxsUGF0aCAhPT0gc1BhdGgpIHtcblx0XHRcdFx0XHRhRmluYWxQYXRoW3NQcm9wZXJ0eVBhdGhdID0ge307XG5cdFx0XHRcdFx0YUZpbmFsUGF0aCA9IGFGaW5hbFBhdGhbc1Byb3BlcnR5UGF0aF07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YUZpbmFsUGF0aFtzUHJvcGVydHlQYXRoXSA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGFGaW5hbFBhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdW5pcXVlIHZhbHVlcyBmb3IgZ2l2ZW4gYXJyYXkgdmFsdWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1ZhbHVlIFByb3BlcnR5IHZhbHVlXG5cdCAqIEBwYXJhbSBpbmRleCBJbmRleCBvZiB0aGUgcHJvcGVydHkgdmFsdWVcblx0ICogQHBhcmFtIHNlbGYgSW5zdGFuY2Ugb2YgdGhlIGFycmF5XG5cdCAqIEByZXR1cm5zIFRoZSB1bmlxdWUgdmFsdWVcblx0ICovXG5cdGdldFVuaXF1ZVZhbHVlczogZnVuY3Rpb24gKHNWYWx1ZTogc3RyaW5nLCBpbmRleDogbnVtYmVyLCBzZWxmOiBhbnlbXSkge1xuXHRcdHJldHVybiBzVmFsdWUgIT0gdW5kZWZpbmVkICYmIHNWYWx1ZSAhPSBudWxsID8gc2VsZi5pbmRleE9mKHNWYWx1ZSkgPT09IGluZGV4IDogdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBwcm9wZXJ0eSB2YWx1ZSBmb3IgYSBtdWx0aS1sZXZlbCBwYXRoIChmb3IgZXhhbXBsZTogX01hdGVyaWFscy9NYXRlcmlhbF9EZXRhaWxzIGdldHMgdGhlIHZhbHVlIG9mIE1hdGVyaWFsX0RldGFpbHMgdW5kZXIgX01hdGVyaWFscyBPYmplY3QpLlxuXHQgKiBSZXR1cm5zIHRoZSBwcm9wZXJ0eVZhbHVlLCB3aGljaCBjYW4gYmUgb2YgYW55IHR5cGUgKHN0cmluZywgbnVtYmVyLCBldGMuLikuXG5cdCAqXG5cdCAqIEBwYXJhbSBzRGF0YVByb3BlcnR5UGF0aCBQcm9wZXJ0eSBwYXRoXG5cdCAqIEBwYXJhbSBvVmFsdWVzIE9iamVjdCBvZiBwcm9wZXJ0eSB2YWx1ZXNcblx0ICogQHJldHVybnMgVGhlIHByb3BlcnR5IHZhbHVlXG5cdCAqL1xuXHRnZXRWYWx1ZUZvck11bHRpTGV2ZWxQYXRoOiBmdW5jdGlvbiAoc0RhdGFQcm9wZXJ0eVBhdGg6IHN0cmluZywgb1ZhbHVlczogYW55KSB7XG5cdFx0bGV0IHJlc3VsdDogYW55O1xuXHRcdGlmIChzRGF0YVByb3BlcnR5UGF0aCAmJiBzRGF0YVByb3BlcnR5UGF0aC5pbmRleE9mKFwiL1wiKSA+IDApIHtcblx0XHRcdGNvbnN0IGFQcm9wZXJ0eVBhdGhzID0gc0RhdGFQcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0YVByb3BlcnR5UGF0aHMuZm9yRWFjaChmdW5jdGlvbiAoc1BhdGg6IHN0cmluZykge1xuXHRcdFx0XHRyZXN1bHQgPSBvVmFsdWVzICYmIG9WYWx1ZXNbc1BhdGhdID8gb1ZhbHVlc1tzUGF0aF0gOiByZXN1bHQgJiYgcmVzdWx0W3NQYXRoXTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBrZXkgcGF0aCBmb3IgdGhlIGtleSBvZiBhIGNvbWJvIGJveCB0aGF0IG11c3QgYmUgc2VsZWN0ZWQgaW5pdGlhbGx5IHdoZW4gdGhlIGRpYWxvZyBvcGVuczpcblx0ICogPT4gSWYgcHJvcGVydHlWYWx1ZSBmb3IgYWxsIHNlbGVjdGVkIGNvbnRleHRzIGlzIGRpZmZlcmVudCwgdGhlbiA8IEtlZXAgRXhpc3RpbmcgVmFsdWVzID4gaXMgcHJlc2VsZWN0ZWQuXG5cdCAqID0+IElmIHByb3BlcnR5VmFsdWUgZm9yIGFsbCBzZWxlY3RlZCBjb250ZXh0cyBpcyB0aGUgc2FtZSwgdGhlbiB0aGUgcHJvcGVydHlWYWx1ZSBpcyBwcmVzZWxlY3RlZC5cblx0ICogPT4gSWYgcHJvcGVydHlWYWx1ZSBmb3IgYWxsIHNlbGVjdGVkIGNvbnRleHRzIGlzIGVtcHR5LCB0aGVuIDwgTGVhdmUgQmxhbmsgPiBpcyBwcmVzZWxlY3RlZC5cblx0ICpcblx0ICpcblx0ICogQHBhcmFtIGFDb250ZXh0cyBDb250ZXh0cyBmb3IgbWFzcyBlZGl0XG5cdCAqIEBwYXJhbSBzRGF0YVByb3BlcnR5UGF0aCBEYXRhIHByb3BlcnR5IHBhdGhcblx0ICogQHJldHVybnMgVGhlIGtleSBwYXRoXG5cdCAqL1xuXHRnZXREZWZhdWx0U2VsZWN0aW9uUGF0aENvbWJvQm94OiBmdW5jdGlvbiAoYUNvbnRleHRzOiBhbnlbXSwgc0RhdGFQcm9wZXJ0eVBhdGg6IHN0cmluZykge1xuXHRcdGxldCByZXN1bHQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRpZiAoc0RhdGFQcm9wZXJ0eVBhdGggJiYgYUNvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IG9TZWxlY3RlZENvbnRleHQgPSBhQ29udGV4dHMsXG5cdFx0XHRcdGFQcm9wZXJ0eVZhbHVlczogYW55W10gPSBbXTtcblx0XHRcdG9TZWxlY3RlZENvbnRleHQuZm9yRWFjaChmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvRGF0YU9iamVjdCA9IG9Db250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRjb25zdCBzTXVsdGlMZXZlbFBhdGhDb25kaXRpb24gPVxuXHRcdFx0XHRcdHNEYXRhUHJvcGVydHlQYXRoLmluZGV4T2YoXCIvXCIpID4gLTEgJiYgb0RhdGFPYmplY3QuaGFzT3duUHJvcGVydHkoc0RhdGFQcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpWzBdKTtcblx0XHRcdFx0aWYgKG9Db250ZXh0ICYmIChvRGF0YU9iamVjdC5oYXNPd25Qcm9wZXJ0eShzRGF0YVByb3BlcnR5UGF0aCkgfHwgc011bHRpTGV2ZWxQYXRoQ29uZGl0aW9uKSkge1xuXHRcdFx0XHRcdGFQcm9wZXJ0eVZhbHVlcy5wdXNoKG9Db250ZXh0LmdldE9iamVjdChzRGF0YVByb3BlcnR5UGF0aCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IGFVbmlxdWVQcm9wZXJ0eVZhbHVlcyA9IGFQcm9wZXJ0eVZhbHVlcy5maWx0ZXIoTWFzc0VkaXRIZWxwZXIuZ2V0VW5pcXVlVmFsdWVzKTtcblx0XHRcdGlmIChhVW5pcXVlUHJvcGVydHlWYWx1ZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRyZXN1bHQgPSBgRGVmYXVsdC8ke3NEYXRhUHJvcGVydHlQYXRofWA7XG5cdFx0XHR9IGVsc2UgaWYgKGFVbmlxdWVQcm9wZXJ0eVZhbHVlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0cmVzdWx0ID0gYEVtcHR5LyR7c0RhdGFQcm9wZXJ0eVBhdGh9YDtcblx0XHRcdH0gZWxzZSBpZiAoYVVuaXF1ZVByb3BlcnR5VmFsdWVzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRyZXN1bHQgPSBgJHtzRGF0YVByb3BlcnR5UGF0aH0vJHthVW5pcXVlUHJvcGVydHlWYWx1ZXNbMF19YDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIGhpZGRlbiBhbm5vdGF0aW9uIHZhbHVlIFtib3RoIHN0YXRpYyBhbmQgcGF0aCBiYXNlZF0gZm9yIHRhYmxlJ3Mgc2VsZWN0ZWQgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIGhpZGRlblZhbHVlIEhpZGRlbiBhbm5vdGF0aW9uIHZhbHVlIC8gcGF0aCBmb3IgZmllbGRcblx0ICogQHBhcmFtIGFDb250ZXh0cyBDb250ZXh0cyBmb3IgbWFzcyBlZGl0XG5cdCAqIEByZXR1cm5zIFRoZSBoaWRkZW4gYW5ub3RhdGlvbiB2YWx1ZVxuXHQgKi9cblx0Z2V0SGlkZGVuVmFsdWVGb3JDb250ZXh0czogZnVuY3Rpb24gKGhpZGRlblZhbHVlOiBhbnksIGFDb250ZXh0czogYW55W10pIHtcblx0XHRpZiAoaGlkZGVuVmFsdWUgJiYgaGlkZGVuVmFsdWUuJFBhdGgpIHtcblx0XHRcdHJldHVybiAhYUNvbnRleHRzLnNvbWUoZnVuY3Rpb24gKG9TZWxlY3RlZENvbnRleHQ6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb1NlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QoaGlkZGVuVmFsdWUuJFBhdGgpID09PSBmYWxzZTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gaGlkZGVuVmFsdWU7XG5cdH0sXG5cblx0Z2V0SW5wdXRUeXBlOiBmdW5jdGlvbiAocHJvcGVydHlJbmZvOiBhbnksIGRhdGFGaWVsZENvbnZlcnRlZDogYW55LCBvRGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IHN0cmluZyB7XG5cdFx0Y29uc3QgZWRpdFN0eWxlUHJvcGVydGllcyA9IHt9IGFzIEZpZWxkUHJvcGVydGllcztcblx0XHRsZXQgaW5wdXRUeXBlITogc3RyaW5nO1xuXHRcdGlmIChwcm9wZXJ0eUluZm8pIHtcblx0XHRcdHNldEVkaXRTdHlsZVByb3BlcnRpZXMoZWRpdFN0eWxlUHJvcGVydGllcywgZGF0YUZpZWxkQ29udmVydGVkLCBvRGF0YU1vZGVsUGF0aCwgdHJ1ZSk7XG5cdFx0XHRpbnB1dFR5cGUgPSBlZGl0U3R5bGVQcm9wZXJ0aWVzPy5lZGl0U3R5bGUgfHwgXCJcIjtcblx0XHR9XG5cdFx0Y29uc3QgaXNWYWxpZEZvck1hc3NFZGl0ID1cblx0XHRcdGlucHV0VHlwZSAmJlxuXHRcdFx0W1wiRGF0ZVBpY2tlclwiLCBcIlRpbWVQaWNrZXJcIiwgXCJEYXRlVGltZVBpY2tlclwiLCBcIlJhdGluZ0luZGljYXRvclwiXS5pbmRleE9mKGlucHV0VHlwZSkgPT09IC0xICYmXG5cdFx0XHQhaXNNdWx0aVZhbHVlRmllbGQob0RhdGFNb2RlbFBhdGgpICYmXG5cdFx0XHQhaGFzVmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzKHByb3BlcnR5SW5mbyk7XG5cblx0XHRyZXR1cm4gKGlzVmFsaWRGb3JNYXNzRWRpdCB8fCBcIlwiKSAmJiBpbnB1dFR5cGU7XG5cdH0sXG5cblx0Z2V0SXNGaWVsZEdycDogZnVuY3Rpb24gKGRhdGFGaWVsZENvbnZlcnRlZDogYW55KTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIChcblx0XHRcdGRhdGFGaWVsZENvbnZlcnRlZCAmJlxuXHRcdFx0ZGF0YUZpZWxkQ29udmVydGVkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIiAmJlxuXHRcdFx0ZGF0YUZpZWxkQ29udmVydGVkLlRhcmdldCAmJlxuXHRcdFx0ZGF0YUZpZWxkQ29udmVydGVkLlRhcmdldC52YWx1ZSAmJlxuXHRcdFx0ZGF0YUZpZWxkQ29udmVydGVkLlRhcmdldC52YWx1ZS5pbmRleE9mKFwiRmllbGRHcm91cFwiKSA+IC0xXG5cdFx0KTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHRleHQgcGF0aCBmb3IgdGhlIG1hc3MgZWRpdCBmaWVsZC5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5IFByb3BlcnR5IHBhdGhcblx0ICogQHBhcmFtIHRleHRCaW5kaW5nIFRleHQgQmluZGluZyBJbmZvXG5cdCAqIEBwYXJhbSBkaXNwbGF5TW9kZSBEaXNwbGF5IG1vZGVcblx0ICogQHJldHVybnMgVGV4dCBQcm9wZXJ0eSBQYXRoIGlmIGl0IGV4aXN0c1xuXHQgKi9cblx0Z2V0VGV4dFBhdGg6IGZ1bmN0aW9uIChwcm9wZXJ0eTogc3RyaW5nLCB0ZXh0QmluZGluZzogYW55LCBkaXNwbGF5TW9kZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRsZXQgZGVzY3JpcHRpb25QYXRoO1xuXHRcdGlmICh0ZXh0QmluZGluZyAmJiAodGV4dEJpbmRpbmcucGF0aCB8fCAodGV4dEJpbmRpbmcucGFyYW1ldGVycyAmJiB0ZXh0QmluZGluZy5wYXJhbWV0ZXJzLmxlbmd0aCkpICYmIHByb3BlcnR5KSB7XG5cdFx0XHRpZiAodGV4dEJpbmRpbmcucGF0aCAmJiBkaXNwbGF5TW9kZSA9PT0gXCJEZXNjcmlwdGlvblwiKSB7XG5cdFx0XHRcdGRlc2NyaXB0aW9uUGF0aCA9IHRleHRCaW5kaW5nLnBhdGg7XG5cdFx0XHR9IGVsc2UgaWYgKHRleHRCaW5kaW5nLnBhcmFtZXRlcnMpIHtcblx0XHRcdFx0dGV4dEJpbmRpbmcucGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wczogQmluZGluZ0luZm8pIHtcblx0XHRcdFx0XHRpZiAocHJvcHMucGF0aCAmJiBwcm9wcy5wYXRoICE9PSBwcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb25QYXRoID0gcHJvcHMucGF0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZGVzY3JpcHRpb25QYXRoO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyBhIEpTT04gTW9kZWwgZm9yIHByb3BlcnRpZXMgb2YgZGlhbG9nIGZpZWxkcyBbbGFiZWwsIHZpc2libGl0eSwgZGF0YXByb3BlcnR5LCBldGMuXS5cblx0ICpcblx0ICogQHBhcmFtIG9UYWJsZSBJbnN0YW5jZSBvZiBUYWJsZVxuXHQgKiBAcGFyYW0gYUNvbnRleHRzIENvbnRleHRzIGZvciBtYXNzIGVkaXRcblx0ICogQHBhcmFtIGFEYXRhQXJyYXkgQXJyYXkgY29udGFpbmluZyBkYXRhIHJlbGF0ZWQgdG8gdGhlIGRpYWxvZyB1c2VkIGJ5IGJvdGggdGhlIHN0YXRpYyBhbmQgdGhlIHJ1bnRpbWUgbW9kZWxcblx0ICogQHJldHVybnMgVGhlIG1vZGVsXG5cdCAqL1xuXHRwcmVwYXJlRGF0YUZvckRpYWxvZzogZnVuY3Rpb24gKG9UYWJsZTogVGFibGUsIGFDb250ZXh0czogYW55W10sIGFEYXRhQXJyYXk6IGFueVtdKSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9UYWJsZSAmJiAob1RhYmxlLmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRzQ3VycmVudEVudGl0eVNldE5hbWUgPSBvVGFibGUuZGF0YShcIm1ldGFQYXRoXCIpLFxuXHRcdFx0YVRhYmxlRmllbGRzID0gTWFzc0VkaXRIZWxwZXIuZ2V0VGFibGVGaWVsZHMob1RhYmxlKSxcblx0XHRcdG9FbnRpdHlUeXBlQ29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0Q29udGV4dChgJHtzQ3VycmVudEVudGl0eVNldE5hbWV9L0BgKSxcblx0XHRcdG9FbnRpdHlTZXRDb250ZXh0ID0gb01ldGFNb2RlbC5nZXRDb250ZXh0KHNDdXJyZW50RW50aXR5U2V0TmFtZSksXG5cdFx0XHRvRGF0YU1vZGVsT2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvRW50aXR5VHlwZUNvbnRleHQpO1xuXG5cdFx0Y29uc3Qgb0RhdGFGaWVsZE1vZGVsID0gbmV3IEpTT05Nb2RlbCgpO1xuXHRcdGxldCBvUmVzdWx0O1xuXHRcdGxldCBzTGFiZWxUZXh0O1xuXHRcdGxldCBiVmFsdWVIZWxwRW5hYmxlZDtcblx0XHRsZXQgc1VuaXRQcm9wZXJ0eVBhdGg7XG5cdFx0bGV0IGJWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdDtcblx0XHRsZXQgb1RleHRCaW5kaW5nO1xuXG5cdFx0YVRhYmxlRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKG9Db2x1bW5JbmZvOiBhbnkpIHtcblx0XHRcdGlmICghb0NvbHVtbkluZm8uYW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3Qgc0RhdGFQcm9wZXJ0eVBhdGggPSBvQ29sdW1uSW5mby5kYXRhUHJvcGVydHk7XG5cdFx0XHRpZiAoc0RhdGFQcm9wZXJ0eVBhdGgpIHtcblx0XHRcdFx0bGV0IG9Qcm9wZXJ0eUluZm8gPSBzRGF0YVByb3BlcnR5UGF0aCAmJiBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQ3VycmVudEVudGl0eVNldE5hbWV9LyR7c0RhdGFQcm9wZXJ0eVBhdGh9QGApO1xuXHRcdFx0XHRzTGFiZWxUZXh0ID1cblx0XHRcdFx0XHRvQ29sdW1uSW5mby5sYWJlbCB8fCAob1Byb3BlcnR5SW5mbyAmJiBvUHJvcGVydHlJbmZvW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbFwiXSkgfHwgc0RhdGFQcm9wZXJ0eVBhdGg7XG5cblx0XHRcdFx0aWYgKG9EYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdFx0XHRcdFx0b0RhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0ID0gb0RhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLmZpbHRlcihmdW5jdGlvbiAoXG5cdFx0XHRcdFx0XHRvUHJvcGVydHk6IGFueVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9Qcm9wZXJ0eS5uYW1lID09PSBzRGF0YVByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgPSBvRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3RbMF0gfHwge307XG5cdFx0XHRcdG9UZXh0QmluZGluZyA9IGdldFRleHRCaW5kaW5nKG9EYXRhTW9kZWxPYmplY3RQYXRoLCB7fSwgdHJ1ZSkgfHwge307XG5cdFx0XHRcdGNvbnN0IG9GaWVsZENvbnRleHQgPSBvTWV0YU1vZGVsLmdldENvbnRleHQob0NvbHVtbkluZm8uYW5ub3RhdGlvblBhdGgpLFxuXHRcdFx0XHRcdG9EYXRhRmllbGRDb252ZXJ0ZWQgPSBjb252ZXJ0TWV0YU1vZGVsQ29udGV4dChvRmllbGRDb250ZXh0KSxcblx0XHRcdFx0XHRvUHJvcGVydHlDb250ZXh0ID0gb01ldGFNb2RlbC5nZXRDb250ZXh0KGAke3NDdXJyZW50RW50aXR5U2V0TmFtZX0vJHtzRGF0YVByb3BlcnR5UGF0aH1AYCksXG5cdFx0XHRcdFx0b0ludGVyZmFjZSA9IG9Qcm9wZXJ0eUNvbnRleHQgJiYgKG9Qcm9wZXJ0eUNvbnRleHQuZ2V0SW50ZXJmYWNlKCkgYXMgYW55KTtcblxuXHRcdFx0XHRsZXQgb0RhdGFNb2RlbFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob0ZpZWxkQ29udGV4dCwgb0VudGl0eVNldENvbnRleHQpO1xuXHRcdFx0XHRpZiAob0RhdGFGaWVsZENvbnZlcnRlZD8uVmFsdWU/LnBhdGg/Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRvRGF0YU1vZGVsUGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKG9EYXRhTW9kZWxQYXRoLCBzRGF0YVByb3BlcnR5UGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgYkhpZGRlbkZpZWxkID1cblx0XHRcdFx0XHRNYXNzRWRpdEhlbHBlci5nZXRIaWRkZW5WYWx1ZUZvckNvbnRleHRzKFxuXHRcdFx0XHRcdFx0b0ZpZWxkQ29udGV4dCAmJiBvRmllbGRDb250ZXh0LmdldE9iamVjdCgpW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXSxcblx0XHRcdFx0XHRcdGFDb250ZXh0c1xuXHRcdFx0XHRcdCkgfHwgZmFsc2U7XG5cdFx0XHRcdGNvbnN0IGlzSW1hZ2UgPSBvUHJvcGVydHlJbmZvICYmIG9Qcm9wZXJ0eUluZm9bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSXNJbWFnZVVSTFwiXTtcblxuXHRcdFx0XHRvSW50ZXJmYWNlLmNvbnRleHQgPSB7XG5cdFx0XHRcdFx0Z2V0TW9kZWw6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvSW50ZXJmYWNlLmdldE1vZGVsKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRnZXRQYXRoOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYCR7c0N1cnJlbnRFbnRpdHlTZXROYW1lfS8ke3NEYXRhUHJvcGVydHlQYXRofWA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRvUHJvcGVydHlJbmZvID0gaXNQcm9wZXJ0eShvRGF0YUZpZWxkQ29udmVydGVkKVxuXHRcdFx0XHRcdD8gb0RhdGFGaWVsZENvbnZlcnRlZFxuXHRcdFx0XHRcdDogb0RhdGFGaWVsZENvbnZlcnRlZD8uVmFsdWU/LiR0YXJnZXQgPz8gb0RhdGFGaWVsZENvbnZlcnRlZD8uVGFyZ2V0Py4kdGFyZ2V0O1xuXHRcdFx0XHQvLyBEYXRhZmllbGQgaXMgbm90IGluY2x1ZGVkIGluIHRoZSBGaWVsZENvbnRyb2wgY2FsY3VsYXRpb24sIG5lZWRzIHRvIGJlIGltcGxlbWVudGVkXG5cblx0XHRcdFx0Y29uc3QgY2hhcnRQcm9wZXJ0eSA9IG9Qcm9wZXJ0eUluZm8gJiYgb1Byb3BlcnR5SW5mby50ZXJtICYmIG9Qcm9wZXJ0eUluZm8udGVybSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFwiO1xuXHRcdFx0XHRjb25zdCBpc0FjdGlvbiA9ICEhb0RhdGFGaWVsZENvbnZlcnRlZC5BY3Rpb247XG5cdFx0XHRcdGNvbnN0IGlzRmllbGRHcnAgPSBNYXNzRWRpdEhlbHBlci5nZXRJc0ZpZWxkR3JwKG9EYXRhRmllbGRDb252ZXJ0ZWQpO1xuXHRcdFx0XHRpZiAoaXNJbWFnZSB8fCBiSGlkZGVuRmllbGQgfHwgY2hhcnRQcm9wZXJ0eSB8fCBpc0FjdGlvbiB8fCBpc0ZpZWxkR3JwKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVmFsdWVIZWxwIHByb3BlcnRpZXNcblx0XHRcdFx0c1VuaXRQcm9wZXJ0eVBhdGggPVxuXHRcdFx0XHRcdCgoaGFzQ3VycmVuY3kob1Byb3BlcnR5SW5mbykgfHwgaGFzVW5pdChvUHJvcGVydHlJbmZvKSkgJiYgZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eVBhdGgob1Byb3BlcnR5SW5mbykpIHx8IFwiXCI7XG5cdFx0XHRcdGNvbnN0IHVuaXRQcm9wZXJ0eUluZm8gPSBzVW5pdFByb3BlcnR5UGF0aCAmJiBnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5KG9Qcm9wZXJ0eUluZm8pO1xuXHRcdFx0XHRiVmFsdWVIZWxwRW5hYmxlZCA9IGhhc1ZhbHVlSGVscChvUHJvcGVydHlJbmZvKTtcblx0XHRcdFx0YlZhbHVlSGVscEVuYWJsZWRGb3JVbml0ID0gdW5pdFByb3BlcnR5SW5mbyAmJiBoYXNWYWx1ZUhlbHAodW5pdFByb3BlcnR5SW5mbyk7XG5cblx0XHRcdFx0Y29uc3QgaGFzQ29udGV4dERlcGVuZGVudFZIID1cblx0XHRcdFx0XHQoYlZhbHVlSGVscEVuYWJsZWQgfHwgYlZhbHVlSGVscEVuYWJsZWRGb3JVbml0KSAmJlxuXHRcdFx0XHRcdChvUHJvcGVydHlJbmZvPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5WYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnMgfHxcblx0XHRcdFx0XHRcdCh1bml0UHJvcGVydHlJbmZvICYmIHVuaXRQcm9wZXJ0eUluZm8/LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdFJlbGV2YW50UXVhbGlmaWVycykpO1xuXHRcdFx0XHRpZiAoaGFzQ29udGV4dERlcGVuZGVudFZIKSB7XG5cdFx0XHRcdFx0Ly8gY29udGV4dCBkZXBlbmRlbnQgVkggaXMgbm90IHN1cHBvcnRlZCBmb3IgTWFzcyBFZGl0LlxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIEVkaXRNb2RlIGFuZCBJbnB1dFR5cGVcblx0XHRcdFx0Y29uc3QgcHJvcGVydHlGb3JGaWVsZENvbnRyb2wgPSBvUHJvcGVydHlJbmZvICYmIG9Qcm9wZXJ0eUluZm8uVmFsdWUgPyBvUHJvcGVydHlJbmZvLlZhbHVlIDogb1Byb3BlcnR5SW5mbztcblx0XHRcdFx0Y29uc3QgZXhwQmluZGluZyA9IGdldEVkaXRNb2RlKHByb3BlcnR5Rm9yRmllbGRDb250cm9sLCBvRGF0YU1vZGVsUGF0aCwgZmFsc2UsIGZhbHNlLCBvRGF0YUZpZWxkQ29udmVydGVkLCBjb25zdGFudCh0cnVlKSk7XG5cdFx0XHRcdGNvbnN0IGVkaXRNb2RlVmFsdWVzID0gT2JqZWN0LmtleXMoRWRpdE1vZGUpO1xuXHRcdFx0XHRjb25zdCBlZGl0TW9kZUlzU3RhdGljID0gISFleHBCaW5kaW5nICYmIGVkaXRNb2RlVmFsdWVzLmluY2x1ZGVzKGV4cEJpbmRpbmcgYXMgRWRpdE1vZGUpO1xuXHRcdFx0XHRjb25zdCBlZGl0YWJsZSA9ICEhZXhwQmluZGluZyAmJiAoKGVkaXRNb2RlSXNTdGF0aWMgJiYgZXhwQmluZGluZyA9PT0gRWRpdE1vZGUuRWRpdGFibGUpIHx8ICFlZGl0TW9kZUlzU3RhdGljKTtcblx0XHRcdFx0Y29uc3QgbmF2UHJvcGVydHlXaXRoVmFsdWVIZWxwID0gc0RhdGFQcm9wZXJ0eVBhdGguaW5jbHVkZXMoXCIvXCIpICYmIGJWYWx1ZUhlbHBFbmFibGVkO1xuXHRcdFx0XHRpZiAoIWVkaXRhYmxlIHx8IG5hdlByb3BlcnR5V2l0aFZhbHVlSGVscCkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGlucHV0VHlwZSA9IE1hc3NFZGl0SGVscGVyLmdldElucHV0VHlwZShvUHJvcGVydHlJbmZvLCBvRGF0YUZpZWxkQ29udmVydGVkLCBvRGF0YU1vZGVsUGF0aCk7XG5cblx0XHRcdFx0aWYgKGlucHV0VHlwZSkge1xuXHRcdFx0XHRcdGNvbnN0IHJlbGF0aXZlUGF0aCA9IGdldFJlbGF0aXZlUGF0aHMob0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0XHRcdGNvbnN0IGlzUmVhZE9ubHkgPSBpc1JlYWRPbmx5RXhwcmVzc2lvbihvUHJvcGVydHlJbmZvLCByZWxhdGl2ZVBhdGgpO1xuXHRcdFx0XHRcdGNvbnN0IGRpc3BsYXlNb2RlID0gQ29tbW9uVXRpbHMuY29tcHV0ZURpc3BsYXlNb2RlKG9Qcm9wZXJ0eUNvbnRleHQuZ2V0T2JqZWN0KCkpO1xuXHRcdFx0XHRcdGNvbnN0IGlzVmFsdWVIZWxwRW5hYmxlZCA9IGJWYWx1ZUhlbHBFbmFibGVkID8gYlZhbHVlSGVscEVuYWJsZWQgOiBmYWxzZTtcblx0XHRcdFx0XHRjb25zdCBpc1ZhbHVlSGVscEVuYWJsZWRGb3JVbml0ID1cblx0XHRcdFx0XHRcdGJWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdCAmJiAhc1VuaXRQcm9wZXJ0eVBhdGguaW5jbHVkZXMoXCIvXCIpID8gYlZhbHVlSGVscEVuYWJsZWRGb3JVbml0IDogZmFsc2U7XG5cdFx0XHRcdFx0Y29uc3QgdW5pdFByb3BlcnR5ID0gc1VuaXRQcm9wZXJ0eVBhdGggJiYgIXNEYXRhUHJvcGVydHlQYXRoLmluY2x1ZGVzKFwiL1wiKSA/IHNVbml0UHJvcGVydHlQYXRoIDogZmFsc2U7XG5cblx0XHRcdFx0XHRvUmVzdWx0ID0ge1xuXHRcdFx0XHRcdFx0bGFiZWw6IHNMYWJlbFRleHQsXG5cdFx0XHRcdFx0XHRkYXRhUHJvcGVydHk6IHNEYXRhUHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdFx0aXNWYWx1ZUhlbHBFbmFibGVkOiBiVmFsdWVIZWxwRW5hYmxlZCA/IGJWYWx1ZUhlbHBFbmFibGVkIDogZmFsc2UsXG5cdFx0XHRcdFx0XHR1bml0UHJvcGVydHksXG5cdFx0XHRcdFx0XHRpc0ZpZWxkUmVxdWlyZWQ6IGdldFJlcXVpcmVkRXhwcmVzc2lvbihvUHJvcGVydHlJbmZvLCBvRGF0YUZpZWxkQ29udmVydGVkLCB0cnVlLCBmYWxzZSwge30sIG9EYXRhTW9kZWxQYXRoKSxcblx0XHRcdFx0XHRcdGRlZmF1bHRTZWxlY3Rpb25QYXRoOiBzRGF0YVByb3BlcnR5UGF0aFxuXHRcdFx0XHRcdFx0XHQ/IE1hc3NFZGl0SGVscGVyLmdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3goYUNvbnRleHRzLCBzRGF0YVByb3BlcnR5UGF0aClcblx0XHRcdFx0XHRcdFx0OiBmYWxzZSxcblx0XHRcdFx0XHRcdGRlZmF1bHRTZWxlY3Rpb25Vbml0UGF0aDogc1VuaXRQcm9wZXJ0eVBhdGhcblx0XHRcdFx0XHRcdFx0PyBNYXNzRWRpdEhlbHBlci5nZXREZWZhdWx0U2VsZWN0aW9uUGF0aENvbWJvQm94KGFDb250ZXh0cywgc1VuaXRQcm9wZXJ0eVBhdGgpXG5cdFx0XHRcdFx0XHRcdDogZmFsc2UsXG5cdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IHNDdXJyZW50RW50aXR5U2V0TmFtZSxcblx0XHRcdFx0XHRcdGRpc3BsYXk6IGRpc3BsYXlNb2RlLFxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb25QYXRoOiBNYXNzRWRpdEhlbHBlci5nZXRUZXh0UGF0aChzRGF0YVByb3BlcnR5UGF0aCwgb1RleHRCaW5kaW5nLCBkaXNwbGF5TW9kZSksXG5cdFx0XHRcdFx0XHRudWxsYWJsZTogb1Byb3BlcnR5SW5mby5udWxsYWJsZSAhPT0gdW5kZWZpbmVkID8gb1Byb3BlcnR5SW5mby5udWxsYWJsZSA6IHRydWUsXG5cdFx0XHRcdFx0XHRpc1Byb3BlcnR5UmVhZE9ubHk6IGlzUmVhZE9ubHkgIT09IHVuZGVmaW5lZCA/IGlzUmVhZE9ubHkgOiBmYWxzZSxcblx0XHRcdFx0XHRcdGlucHV0VHlwZTogaW5wdXRUeXBlLFxuXHRcdFx0XHRcdFx0ZWRpdE1vZGU6IGVkaXRhYmxlID8gZXhwQmluZGluZyA6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdHByb3BlcnR5SW5mbzoge1xuXHRcdFx0XHRcdFx0XHRoYXNWSDogaXNWYWx1ZUhlbHBFbmFibGVkLFxuXHRcdFx0XHRcdFx0XHRydW50aW1lUGF0aDogXCJmaWVsZHNJbmZvPi92YWx1ZXMvXCIsXG5cdFx0XHRcdFx0XHRcdHJlbGF0aXZlUGF0aDogc0RhdGFQcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0XHRcdHByb3BlcnR5RnVsbHlRdWFsaWZpZWROYW1lOiBvUHJvcGVydHlJbmZvLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdFx0XHRcdFx0cHJvcGVydHlQYXRoRm9yVmFsdWVIZWxwOiBgJHtzQ3VycmVudEVudGl0eVNldE5hbWV9LyR7c0RhdGFQcm9wZXJ0eVBhdGh9YFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHVuaXRJbmZvOiB1bml0UHJvcGVydHkgJiYge1xuXHRcdFx0XHRcdFx0XHRoYXNWSDogaXNWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdCxcblx0XHRcdFx0XHRcdFx0cnVudGltZVBhdGg6IFwiZmllbGRzSW5mbz4vdW5pdERhdGEvXCIsXG5cdFx0XHRcdFx0XHRcdHJlbGF0aXZlUGF0aDogdW5pdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0eVBhdGhGb3JWYWx1ZUhlbHA6IGAke3NDdXJyZW50RW50aXR5U2V0TmFtZX0vJHt1bml0UHJvcGVydHl9YFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0YURhdGFBcnJheS5wdXNoKG9SZXN1bHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0b0RhdGFGaWVsZE1vZGVsLnNldERhdGEoYURhdGFBcnJheSk7XG5cdFx0cmV0dXJuIG9EYXRhRmllbGRNb2RlbDtcblx0fSxcblxuXHRnZXRUYWJsZUZpZWxkczogZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0Y29uc3QgYUNvbHVtbnMgPSAob1RhYmxlICYmIG9UYWJsZS5nZXRDb2x1bW5zKCkpIHx8IFtdO1xuXHRcdGNvbnN0IGNvbHVtbnNEYXRhID0gb1RhYmxlICYmIG9UYWJsZS5nZXRQYXJlbnQoKS5nZXRUYWJsZURlZmluaXRpb24oKS5jb2x1bW5zO1xuXHRcdHJldHVybiBhQ29sdW1ucy5tYXAoZnVuY3Rpb24gKG9Db2x1bW46IGFueSkge1xuXHRcdFx0Y29uc3Qgc0RhdGFQcm9wZXJ0eSA9IG9Db2x1bW4gJiYgb0NvbHVtbi5nZXREYXRhUHJvcGVydHkoKSxcblx0XHRcdFx0YVJlYWx0ZWRDb2x1bW5JbmZvID1cblx0XHRcdFx0XHRjb2x1bW5zRGF0YSAmJlxuXHRcdFx0XHRcdGNvbHVtbnNEYXRhLmZpbHRlcihmdW5jdGlvbiAob0NvbHVtbkluZm86IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9Db2x1bW5JbmZvLm5hbWUgPT09IHNEYXRhUHJvcGVydHkgJiYgb0NvbHVtbkluZm8udHlwZSA9PT0gXCJBbm5vdGF0aW9uXCI7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRkYXRhUHJvcGVydHk6IHNEYXRhUHJvcGVydHksXG5cdFx0XHRcdGxhYmVsOiBvQ29sdW1uLmdldEhlYWRlcigpLFxuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogYVJlYWx0ZWRDb2x1bW5JbmZvICYmIGFSZWFsdGVkQ29sdW1uSW5mb1swXSAmJiBhUmVhbHRlZENvbHVtbkluZm9bMF0uYW5ub3RhdGlvblBhdGhcblx0XHRcdH07XG5cdFx0fSk7XG5cdH0sXG5cblx0Z2V0RGVmYXVsdFRleHRzRm9yRGlhbG9nOiBmdW5jdGlvbiAob1Jlc291cmNlQnVuZGxlOiBhbnksIGlTZWxlY3RlZENvbnRleHRzOiBhbnksIG9UYWJsZTogYW55KSB7XG5cdFx0Ly8gVGhlIGNvbmZpcm0gYnV0dG9uIHRleHQgaXMgXCJTYXZlXCIgZm9yIHRhYmxlIGluIERpc3BsYXkgbW9kZSBhbmQgXCJBcHBseVwiIGZvciB0YWJsZSBpbiBlZGl0IG1vZGUuIFRoaXMgY2FuIGJlIGxhdGVyIGV4cG9zZWQgaWYgbmVlZGVkLlxuXHRcdGNvbnN0IGJEaXNwbGF5TW9kZSA9IG9UYWJsZS5kYXRhKFwiZGlzcGxheU1vZGVQcm9wZXJ0eUJpbmRpbmdcIikgPT09IFwidHJ1ZVwiO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGtlZXBFeGlzdGluZ1ByZWZpeDogXCI8IEtlZXBcIixcblx0XHRcdGxlYXZlQmxhbmtWYWx1ZTogXCI8IExlYXZlIEJsYW5rID5cIixcblx0XHRcdGNsZWFyRmllbGRWYWx1ZTogXCI8IENsZWFyIFZhbHVlcyA+XCIsXG5cdFx0XHRtYXNzRWRpdFRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUFTU19FRElUX0RJQUxPR19USVRMRVwiLCBpU2VsZWN0ZWRDb250ZXh0cy50b1N0cmluZygpKSxcblx0XHRcdGFwcGx5QnV0dG9uVGV4dDogYkRpc3BsYXlNb2RlXG5cdFx0XHRcdD8gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01BU1NfRURJVF9TQVZFX0JVVFRPTl9URVhUXCIpXG5cdFx0XHRcdDogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01BU1NfRURJVF9BUFBMWV9CVVRUT05fVEVYVFwiKSxcblx0XHRcdHVzZVZhbHVlSGVscFZhbHVlOiBcIjwgVXNlIFZhbHVlIEhlbHAgPlwiLFxuXHRcdFx0Y2FuY2VsQnV0dG9uVGV4dDogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9PQkpFQ1RfUEFHRV9DQU5DRUxcIiksXG5cdFx0XHRub0ZpZWxkczogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01BU1NfRURJVF9OT19FRElUQUJMRV9GSUVMRFNcIiksXG5cdFx0XHRva0J1dHRvblRleHQ6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX09LXCIpXG5cdFx0fTtcblx0fSxcblxuXHQvKipcblx0ICogQWRkcyBhIHN1ZmZpeCB0byB0aGUgJ2tlZXAgZXhpc3RpbmcnIHByb3BlcnR5IG9mIHRoZSBjb21ib0JveC5cblx0ICpcblx0ICogQHBhcmFtIHNJbnB1dFR5cGUgSW5wdXRUeXBlIG9mIHRoZSBmaWVsZFxuXHQgKiBAcmV0dXJucyBUaGUgbW9kaWZpZWQgc3RyaW5nXG5cdCAqL1xuXHQvLyBnZXRTdWZmaXhGb3JLZWVwRXhpc2l0aW5nOiBmdW5jdGlvbiAoc0lucHV0VHlwZTogc3RyaW5nKSB7XG5cdC8vIFx0bGV0IHNSZXN1bHQgPSBcIlZhbHVlc1wiO1xuXG5cdC8vIFx0c3dpdGNoIChzSW5wdXRUeXBlKSB7XG5cdC8vIFx0XHQvL1RPRE8gLSBBZGQgZm9yIG90aGVyIGNvbnRyb2wgdHlwZXMgYXMgd2VsbCAoUmFkaW8gQnV0dG9uLCBFbWFpbCwgSW5wdXQsIE1EQyBGaWVsZHMsIEltYWdlIGV0Yy4pXG5cdC8vIFx0XHRjYXNlIFwiRGF0ZVBpY2tlclwiOlxuXHQvLyBcdFx0XHRzUmVzdWx0ID0gXCJEYXRlc1wiO1xuXHQvLyBcdFx0XHRicmVhaztcblx0Ly8gXHRcdGNhc2UgXCJDaGVja0JveFwiOlxuXHQvLyBcdFx0XHRzUmVzdWx0ID0gXCJTZXR0aW5nc1wiO1xuXHQvLyBcdFx0XHRicmVhaztcblx0Ly8gXHRcdGRlZmF1bHQ6XG5cdC8vIFx0XHRcdHNSZXN1bHQgPSBcIlZhbHVlc1wiO1xuXHQvLyBcdH1cblx0Ly8gXHRyZXR1cm4gc1Jlc3VsdDtcblx0Ly8gfSxcblxuXHQvKipcblx0ICogQWRkcyBkZWZhdWx0IHZhbHVlcyB0byB0aGUgbW9kZWwgW0tlZXAgRXhpc3RpbmcgVmFsdWVzLCBMZWF2ZSBCbGFua10uXG5cdCAqXG5cdCAqIEBwYXJhbSBhVmFsdWVzIEFycmF5IGluc3RhbmNlIHdoZXJlIHRoZSBkZWZhdWx0IGRhdGEgbmVlZHMgdG8gYmUgYWRkZWRcblx0ICogQHBhcmFtIG9EZWZhdWx0VmFsdWVzIERlZmF1bHQgdmFsdWVzIGZyb20gQXBwbGljYXRpb24gTWFuaWZlc3Rcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eUluZm8gUHJvcGVydHkgaW5mb3JtYXRpb25cblx0ICogQHBhcmFtIGJVT01GaWVsZFxuXHQgKi9cblx0c2V0RGVmYXVsdFZhbHVlc1RvRGlhbG9nOiBmdW5jdGlvbiAoYVZhbHVlczogYW55LCBvRGVmYXVsdFZhbHVlczogYW55LCBvUHJvcGVydHlJbmZvOiBhbnksIGJVT01GaWVsZD86IGJvb2xlYW4pIHtcblx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gYlVPTUZpZWxkID8gb1Byb3BlcnR5SW5mby51bml0UHJvcGVydHkgOiBvUHJvcGVydHlJbmZvLmRhdGFQcm9wZXJ0eSxcblx0XHRcdHNJbnB1dFR5cGUgPSBvUHJvcGVydHlJbmZvLmlucHV0VHlwZSxcblx0XHRcdGJQcm9wZXJ0eVJlcXVpcmVkID0gb1Byb3BlcnR5SW5mby5pc0ZpZWxkUmVxdWlyZWQ7XG5cdFx0Ly8gY29uc3Qgc1N1ZmZpeEZvcktlZXBFeGlzdGluZyA9IE1hc3NFZGl0SGVscGVyLmdldFN1ZmZpeEZvcktlZXBFeGlzaXRpbmcoc0lucHV0VHlwZSk7XG5cdFx0Y29uc3Qgc1N1ZmZpeEZvcktlZXBFeGlzdGluZyA9IFwiVmFsdWVzXCI7XG5cdFx0YVZhbHVlcy5kZWZhdWx0T3B0aW9ucyA9IGFWYWx1ZXMuZGVmYXVsdE9wdGlvbnMgfHwgW107XG5cdFx0Y29uc3Qgc2VsZWN0T3B0aW9uc0V4aXN0ID0gYVZhbHVlcy5zZWxlY3RPcHRpb25zICYmIGFWYWx1ZXMuc2VsZWN0T3B0aW9ucy5sZW5ndGggPiAwO1xuXHRcdGNvbnN0IGtlZXBFbnRyeSA9IHtcblx0XHRcdHRleHQ6IGAke29EZWZhdWx0VmFsdWVzLmtlZXBFeGlzdGluZ1ByZWZpeH0gJHtzU3VmZml4Rm9yS2VlcEV4aXN0aW5nfSA+YCxcblx0XHRcdGtleTogYERlZmF1bHQvJHtzUHJvcGVydHlQYXRofWBcblx0XHR9O1xuXG5cdFx0aWYgKHNJbnB1dFR5cGUgPT09IFwiQ2hlY2tCb3hcIikge1xuXHRcdFx0Y29uc3QgZmFsc2VFbnRyeSA9IHsgdGV4dDogXCJOb1wiLCBrZXk6IGAke3NQcm9wZXJ0eVBhdGh9L2ZhbHNlYCwgdGV4dEluZm86IHsgdmFsdWU6IGZhbHNlIH0gfTtcblx0XHRcdGNvbnN0IHRydXRoeUVudHJ5ID0geyB0ZXh0OiBcIlllc1wiLCBrZXk6IGAke3NQcm9wZXJ0eVBhdGh9L3RydWVgLCB0ZXh0SW5mbzogeyB2YWx1ZTogdHJ1ZSB9IH07XG5cdFx0XHRhVmFsdWVzLnVuc2hpZnQoZmFsc2VFbnRyeSk7XG5cdFx0XHRhVmFsdWVzLmRlZmF1bHRPcHRpb25zLnVuc2hpZnQoZmFsc2VFbnRyeSk7XG5cdFx0XHRhVmFsdWVzLnVuc2hpZnQodHJ1dGh5RW50cnkpO1xuXHRcdFx0YVZhbHVlcy5kZWZhdWx0T3B0aW9ucy51bnNoaWZ0KHRydXRoeUVudHJ5KTtcblx0XHRcdGFWYWx1ZXMudW5zaGlmdChrZWVwRW50cnkpO1xuXHRcdFx0YVZhbHVlcy5kZWZhdWx0T3B0aW9ucy51bnNoaWZ0KGtlZXBFbnRyeSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChvUHJvcGVydHlJbmZvPy5wcm9wZXJ0eUluZm8/Lmhhc1ZIIHx8IChvUHJvcGVydHlJbmZvPy51bml0SW5mbz8uaGFzVkggJiYgYlVPTUZpZWxkKSkge1xuXHRcdFx0XHRjb25zdCB2aGRFbnRyeSA9IHsgdGV4dDogb0RlZmF1bHRWYWx1ZXMudXNlVmFsdWVIZWxwVmFsdWUsIGtleTogYFVzZVZhbHVlSGVscFZhbHVlLyR7c1Byb3BlcnR5UGF0aH1gIH07XG5cdFx0XHRcdGFWYWx1ZXMudW5zaGlmdCh2aGRFbnRyeSk7XG5cdFx0XHRcdGFWYWx1ZXMuZGVmYXVsdE9wdGlvbnMudW5zaGlmdCh2aGRFbnRyeSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoc2VsZWN0T3B0aW9uc0V4aXN0KSB7XG5cdFx0XHRcdGlmIChiUHJvcGVydHlSZXF1aXJlZCAhPT0gXCJ0cnVlXCIgJiYgIWJVT01GaWVsZCkge1xuXHRcdFx0XHRcdGNvbnN0IGNsZWFyRW50cnkgPSB7IHRleHQ6IG9EZWZhdWx0VmFsdWVzLmNsZWFyRmllbGRWYWx1ZSwga2V5OiBgQ2xlYXJGaWVsZFZhbHVlLyR7c1Byb3BlcnR5UGF0aH1gIH07XG5cdFx0XHRcdFx0YVZhbHVlcy51bnNoaWZ0KGNsZWFyRW50cnkpO1xuXHRcdFx0XHRcdGFWYWx1ZXMuZGVmYXVsdE9wdGlvbnMudW5zaGlmdChjbGVhckVudHJ5KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhVmFsdWVzLnVuc2hpZnQoa2VlcEVudHJ5KTtcblx0XHRcdFx0YVZhbHVlcy5kZWZhdWx0T3B0aW9ucy51bnNoaWZ0KGtlZXBFbnRyeSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBlbXB0eUVudHJ5ID0geyB0ZXh0OiBvRGVmYXVsdFZhbHVlcy5sZWF2ZUJsYW5rVmFsdWUsIGtleTogYERlZmF1bHQvJHtzUHJvcGVydHlQYXRofWAgfTtcblx0XHRcdFx0YVZhbHVlcy51bnNoaWZ0KGVtcHR5RW50cnkpO1xuXHRcdFx0XHRhVmFsdWVzLmRlZmF1bHRPcHRpb25zLnVuc2hpZnQoZW1wdHlFbnRyeSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgdGV4dCBhcnJhbmdlbWVudCBpbmZvIGZvciBhIGNvbnRleHQgcHJvcGVydHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eSBQcm9wZXJ0eSBQYXRoXG5cdCAqIEBwYXJhbSBkZXNjcmlwdGlvblBhdGggUGF0aCB0byB0ZXh0IGFzc29jaWF0aW9uIG9mIHRoZSBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gZGlzcGxheU1vZGUgRGlzcGxheSBtb2RlIG9mIHRoZSBwcm9wZXJ0eSBhbmQgdGV4dCBhc3NvY2lhdGlvblxuXHQgKiBAcGFyYW0gc2VsZWN0ZWRDb250ZXh0IENvbnRleHQgdG8gZmluZCB0aGUgZnVsbCB0ZXh0XG5cdCAqIEByZXR1cm5zIFRoZSB0ZXh0IGFycmFuZ2VtZW50XG5cdCAqL1xuXHRnZXRUZXh0QXJyYW5nZW1lbnRJbmZvOiBmdW5jdGlvbiAoXG5cdFx0cHJvcGVydHk6IHN0cmluZyxcblx0XHRkZXNjcmlwdGlvblBhdGg6IHN0cmluZyxcblx0XHRkaXNwbGF5TW9kZTogc3RyaW5nLFxuXHRcdHNlbGVjdGVkQ29udGV4dDogT0RhdGFWNENvbnRleHRcblx0KTogVGV4dEFycmFuZ2VtZW50SW5mbyB7XG5cdFx0bGV0IHZhbHVlID0gc2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChwcm9wZXJ0eSksXG5cdFx0XHRkZXNjcmlwdGlvblZhbHVlLFxuXHRcdFx0ZnVsbFRleHQ7XG5cdFx0aWYgKGRlc2NyaXB0aW9uUGF0aCAmJiBwcm9wZXJ0eSkge1xuXHRcdFx0c3dpdGNoIChkaXNwbGF5TW9kZSkge1xuXHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0XHRkZXNjcmlwdGlvblZhbHVlID0gc2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChkZXNjcmlwdGlvblBhdGgpIHx8IFwiXCI7XG5cdFx0XHRcdFx0ZnVsbFRleHQgPSBkZXNjcmlwdGlvblZhbHVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiVmFsdWVcIjpcblx0XHRcdFx0XHR2YWx1ZSA9IHNlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QocHJvcGVydHkpIHx8IFwiXCI7XG5cdFx0XHRcdFx0ZnVsbFRleHQgPSB2YWx1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIlZhbHVlRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0XHR2YWx1ZSA9IHNlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QocHJvcGVydHkpIHx8IFwiXCI7XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25WYWx1ZSA9IHNlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QoZGVzY3JpcHRpb25QYXRoKSB8fCBcIlwiO1xuXHRcdFx0XHRcdGZ1bGxUZXh0ID0gZGVzY3JpcHRpb25WYWx1ZSA/IGAke3ZhbHVlfSAoJHtkZXNjcmlwdGlvblZhbHVlfSlgIDogdmFsdWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblZhbHVlXCI6XG5cdFx0XHRcdFx0dmFsdWUgPSBzZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KHByb3BlcnR5KSB8fCBcIlwiO1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uVmFsdWUgPSBzZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KGRlc2NyaXB0aW9uUGF0aCkgfHwgXCJcIjtcblx0XHRcdFx0XHRmdWxsVGV4dCA9IGRlc2NyaXB0aW9uVmFsdWUgPyBgJHtkZXNjcmlwdGlvblZhbHVlfSAoJHt2YWx1ZX0pYCA6IHZhbHVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdExvZy5pbmZvKGBEaXNwbGF5IFByb3BlcnR5IG5vdCBhcHBsaWNhYmxlOiAke3Byb3BlcnR5fWApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR0ZXh0QXJyYW5nZW1lbnQ6IGRpc3BsYXlNb2RlLFxuXHRcdFx0dmFsdWVQYXRoOiBwcm9wZXJ0eSxcblx0XHRcdGRlc2NyaXB0aW9uUGF0aDogZGVzY3JpcHRpb25QYXRoLFxuXHRcdFx0dmFsdWU6IHZhbHVlLFxuXHRcdFx0ZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uVmFsdWUsXG5cdFx0XHRmdWxsVGV4dDogZnVsbFRleHRcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIHZpc2liaWxpdHkgdmFsdXVlIGZvciB0aGUgTWFuYWdlZE9iamVjdCBBbnkuXG5cdCAqXG5cdCAqIEBwYXJhbSBhbnkgVGhlIE1hbmFnZWRPYmplY3QgQW55IHRvIGJlIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSB2aXNpYmxlIHZhbHVlIG9mIHRoZSBiaW5kaW5nLlxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgdGhlIG1hc3MgZWRpdCBmaWVsZCBpcyBlZGl0YWJsZS5cblx0ICovXG5cdGlzRWRpdGFibGU6IGZ1bmN0aW9uIChhbnk6IEFueVR5cGUpOiBib29sZWFuIHtcblx0XHRjb25zdCBiaW5kaW5nID0gYW55LmdldEJpbmRpbmcoXCJhbnlcIik7XG5cdFx0Y29uc3QgdmFsdWUgPSAoYmluZGluZyBhcyBhbnkpLmdldEV4dGVybmFsVmFsdWUoKTtcblx0XHRyZXR1cm4gdmFsdWUgPT09IEVkaXRNb2RlLkVkaXRhYmxlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxjdWxhdGUgYW5kIHVwZGF0ZSB0aGUgdmlzaWJpbGl0eSBvZiBtYXNzIGVkaXQgZmllbGQgb24gY2hhbmdlIG9mIHRoZSBNYW5hZ2VkT2JqZWN0IEFueSBiaW5kaW5nLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RpYWxvZ0RhdGFNb2RlbCBNb2RlbCB0byBiZSB1c2VkIHJ1bnRpbWUuXG5cdCAqIEBwYXJhbSBkYXRhUHJvcGVydHkgRmllbGQgbmFtZS5cblx0ICovXG5cdG9uQ29udGV4dEVkaXRhYmxlQ2hhbmdlOiBmdW5jdGlvbiAob0RpYWxvZ0RhdGFNb2RlbDogSlNPTk1vZGVsLCBkYXRhUHJvcGVydHk6IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnN0IG9iamVjdHNGb3JWaXNpYmlsaXR5ID0gb0RpYWxvZ0RhdGFNb2RlbC5nZXRQcm9wZXJ0eShgL3ZhbHVlcy8ke2RhdGFQcm9wZXJ0eX0vb2JqZWN0c0ZvclZpc2liaWxpdHlgKSB8fCBbXTtcblx0XHRjb25zdCBlZGl0YWJsZSA9IG9iamVjdHNGb3JWaXNpYmlsaXR5LnNvbWUoTWFzc0VkaXRIZWxwZXIuaXNFZGl0YWJsZSk7XG5cblx0XHRpZiAoZWRpdGFibGUpIHtcblx0XHRcdG9EaWFsb2dEYXRhTW9kZWwuc2V0UHJvcGVydHkoYC92YWx1ZXMvJHtkYXRhUHJvcGVydHl9L3Zpc2libGVgLCBlZGl0YWJsZSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgTWFuYWdlZCBPYmplY3QgQW55IGZvciB2aXNpYmlsaXR5IG9mIHRoZSBtYXNzIGVkaXQgZmllbGRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gbU9Ub1VzZSBUaGUgTWFuYWdlZE9iamVjdCBBbnkgdG8gYmUgdXNlZCB0byBjYWxjdWxhdGUgdGhlIHZpc2libGUgdmFsdWUgb2YgdGhlIGJpbmRpbmcuXG5cdCAqIEBwYXJhbSBvRGlhbG9nRGF0YU1vZGVsIE1vZGVsIHRvIGJlIHVzZWQgcnVudGltZS5cblx0ICogQHBhcmFtIGRhdGFQcm9wZXJ0eSBGaWVsZCBuYW1lLlxuXHQgKiBAcGFyYW0gdmFsdWVzIFZhbHVlcyBvZiB0aGUgZmllbGQuXG5cdCAqL1xuXHR1cGRhdGVPbkNvbnRleHRDaGFuZ2U6IGZ1bmN0aW9uIChtT1RvVXNlOiBBbnlUeXBlLCBvRGlhbG9nRGF0YU1vZGVsOiBKU09OTW9kZWwsIGRhdGFQcm9wZXJ0eTogc3RyaW5nLCB2YWx1ZXM6IGFueSkge1xuXHRcdGNvbnN0IGJpbmRpbmcgPSBtT1RvVXNlLmdldEJpbmRpbmcoXCJhbnlcIik7XG5cblx0XHR2YWx1ZXMub2JqZWN0c0ZvclZpc2liaWxpdHkgPSB2YWx1ZXMub2JqZWN0c0ZvclZpc2liaWxpdHkgfHwgW107XG5cdFx0dmFsdWVzLm9iamVjdHNGb3JWaXNpYmlsaXR5LnB1c2gobU9Ub1VzZSk7XG5cblx0XHRiaW5kaW5nPy5hdHRhY2hDaGFuZ2UoTWFzc0VkaXRIZWxwZXIub25Db250ZXh0RWRpdGFibGVDaGFuZ2UuYmluZChudWxsLCBvRGlhbG9nRGF0YU1vZGVsLCBkYXRhUHJvcGVydHkpKTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IGJvdW5kIG9iamVjdCB0byBjYWxjdWxhdGUgdGhlIHZpc2liaWxpdHkgb2YgY29udGV4dHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBleHBCaW5kaW5nIEJpbmRpbmcgU3RyaW5nIG9iamVjdC5cblx0ICogQHBhcmFtIGNvbnRleHQgQ29udGV4dCB0aGUgYmluZGluZyB2YWx1ZS5cblx0ICogQHJldHVybnMgVGhlIE1hbmFnZWRPYmplY3QgQW55IHRvIGJlIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSB2aXNpYmxlIHZhbHVlIG9mIHRoZSBiaW5kaW5nLlxuXHQgKi9cblx0Z2V0Qm91bmRPYmplY3Q6IGZ1bmN0aW9uIChleHBCaW5kaW5nOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgY29udGV4dDogT0RhdGFWNENvbnRleHQpOiBBbnlUeXBlIHtcblx0XHRjb25zdCBtT1RvVXNlID0gbmV3IEFueSh7IGFueTogZXhwQmluZGluZyB9KTtcblx0XHRjb25zdCBtb2RlbCA9IGNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRtT1RvVXNlLnNldE1vZGVsKG1vZGVsKTtcblx0XHRtT1RvVXNlLnNldEJpbmRpbmdDb250ZXh0KGNvbnRleHQpO1xuXG5cdFx0cmV0dXJuIG1PVG9Vc2U7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZmllbGQuXG5cdCAqXG5cdCAqIEBwYXJhbSBleHBCaW5kaW5nIEJpbmRpbmcgU3RyaW5nIG9iamVjdC5cblx0ICogQHBhcmFtIG9EaWFsb2dEYXRhTW9kZWwgTW9kZWwgdG8gYmUgdXNlZCBydW50aW1lLlxuXHQgKiBAcGFyYW0gZGF0YVByb3BlcnR5IEZpZWxkIG5hbWUuXG5cdCAqIEBwYXJhbSB2YWx1ZXMgVmFsdWVzIG9mIHRoZSBmaWVsZC5cblx0ICogQHBhcmFtIGNvbnRleHQgQ29udGV4dCB0aGUgYmluZGluZyB2YWx1ZS5cblx0ICogQHJldHVybnMgUmV0dXJucyB0cnVlIGlmIHRoZSBtYXNzIGVkaXQgZmllbGQgaXMgZWRpdGFibGUuXG5cdCAqL1xuXHRnZXRGaWVsZFZpc2libGl0eTogZnVuY3Rpb24gKFxuXHRcdGV4cEJpbmRpbmc6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRcdG9EaWFsb2dEYXRhTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRkYXRhUHJvcGVydHk6IHN0cmluZyxcblx0XHR2YWx1ZXM6IGFueSxcblx0XHRjb250ZXh0OiBPRGF0YVY0Q29udGV4dFxuXHQpOiBib29sZWFuIHtcblx0XHRjb25zdCBtT1RvVXNlID0gTWFzc0VkaXRIZWxwZXIuZ2V0Qm91bmRPYmplY3QoZXhwQmluZGluZywgY29udGV4dCk7XG5cdFx0Y29uc3QgaXNDb250ZXh0RWRpdGFibGUgPSBNYXNzRWRpdEhlbHBlci5pc0VkaXRhYmxlKG1PVG9Vc2UpO1xuXG5cdFx0aWYgKCFpc0NvbnRleHRFZGl0YWJsZSkge1xuXHRcdFx0TWFzc0VkaXRIZWxwZXIudXBkYXRlT25Db250ZXh0Q2hhbmdlKG1PVG9Vc2UsIG9EaWFsb2dEYXRhTW9kZWwsIGRhdGFQcm9wZXJ0eSwgdmFsdWVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIGlzQ29udGV4dEVkaXRhYmxlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyBhIHJ1bnRpbWUgbW9kZWw6XG5cdCAqID0+IFRoZSBtb2RlbCBjb25zaXN0cyBvZiB2YWx1ZXMgc2hvd24gaW4gdGhlIGNvbWJvQm94IG9mIHRoZSBkaWFsb2cgKExlYXZlIEJsYW5rLCBLZWVwIEV4aXN0aW5nIFZhbHVlcywgb3IgYW55IHByb3BlcnR5IHZhbHVlIGZvciB0aGUgc2VsZWN0ZWQgY29udGV4dCwgZXRjLilcblx0ICogPT4gVGhlIG1vZGVsIHdpbGwgY2FwdHVyZSBydW50aW1lIGNoYW5nZXMgaW4gdGhlIHJlc3VsdHMgcHJvcGVydHkgKHRoZSB2YWx1ZSBlbnRlcmVkIGluIHRoZSBjb21ib0JveCkuXG5cdCAqXG5cdCAqIEBwYXJhbSBhQ29udGV4dHMgQ29udGV4dHMgZm9yIG1hc3MgZWRpdFxuXHQgKiBAcGFyYW0gYURhdGFBcnJheSBBcnJheSBjb250YWluaW5nIGRhdGEgcmVsYXRlZCB0byB0aGUgZGlhbG9nIHVzZWQgYnkgYm90aCB0aGUgc3RhdGljIGFuZCB0aGUgcnVudGltZSBtb2RlbFxuXHQgKiBAcGFyYW0gb0RlZmF1bHRWYWx1ZXMgRGVmYXVsdCB2YWx1ZXMgZnJvbSBpMThuXG5cdCAqIEBwYXJhbSBkaWFsb2dDb250ZXh0IFRyYW5zaWVudCBjb250ZXh0IGZvciBtYXNzIGVkaXQgZGlhbG9nLlxuXHQgKiBAcmV0dXJucyBUaGUgcnVudGltZSBtb2RlbFxuXHQgKi9cblx0c2V0UnVudGltZU1vZGVsT25EaWFsb2c6IGZ1bmN0aW9uIChhQ29udGV4dHM6IGFueVtdLCBhRGF0YUFycmF5OiBhbnlbXSwgb0RlZmF1bHRWYWx1ZXM6IGFueSwgZGlhbG9nQ29udGV4dDogT0RhdGFWNENvbnRleHQpIHtcblx0XHRjb25zdCBhVmFsdWVzOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IGFVbml0RGF0YTogYW55W10gPSBbXTtcblx0XHRjb25zdCBhUmVzdWx0czogYW55W10gPSBbXTtcblx0XHRjb25zdCB0ZXh0UGF0aHM6IGFueVtdID0gW107XG5cdFx0Y29uc3QgYVJlYWRPbmx5RmllbGRJbmZvOiBhbnlbXSA9IFtdO1xuXG5cdFx0Y29uc3Qgb0RhdGEgPSB7XG5cdFx0XHR2YWx1ZXM6IGFWYWx1ZXMsXG5cdFx0XHR1bml0RGF0YTogYVVuaXREYXRhLFxuXHRcdFx0cmVzdWx0czogYVJlc3VsdHMsXG5cdFx0XHRyZWFkYWJsZVByb3BlcnR5RGF0YTogYVJlYWRPbmx5RmllbGRJbmZvLFxuXHRcdFx0c2VsZWN0ZWRLZXk6IHVuZGVmaW5lZCxcblx0XHRcdHRleHRQYXRoczogdGV4dFBhdGhzLFxuXHRcdFx0bm9GaWVsZHM6IG9EZWZhdWx0VmFsdWVzLm5vRmllbGRzXG5cdFx0fTtcblx0XHRjb25zdCBvRGlhbG9nRGF0YU1vZGVsID0gbmV3IEpTT05Nb2RlbChvRGF0YSk7XG5cdFx0YURhdGFBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChvSW5EYXRhOiBhbnkpIHtcblx0XHRcdGxldCBvVGV4dEluZm87XG5cdFx0XHRsZXQgc1Byb3BlcnR5S2V5O1xuXHRcdFx0bGV0IHNVbml0UHJvcGVydHlOYW1lO1xuXHRcdFx0Y29uc3Qgb0Rpc3RpbmN0VmFsdWVNYXA6IGFueSA9IHt9O1xuXHRcdFx0Y29uc3Qgb0Rpc3RpbmN0VW5pdE1hcDogYW55ID0ge307XG5cdFx0XHRpZiAob0luRGF0YS5kYXRhUHJvcGVydHkgJiYgb0luRGF0YS5kYXRhUHJvcGVydHkuaW5kZXhPZihcIi9cIikgPiAtMSkge1xuXHRcdFx0XHRjb25zdCBhRmluYWxQYXRoID0gTWFzc0VkaXRIZWxwZXIuaW5pdExhc3RMZXZlbE9mUHJvcGVydHlQYXRoKG9JbkRhdGEuZGF0YVByb3BlcnR5LCBhVmFsdWVzIC8qLCBkaWFsb2dDb250ZXh0ICovKTtcblx0XHRcdFx0Y29uc3QgYVByb3BlcnR5UGF0aHMgPSBvSW5EYXRhLmRhdGFQcm9wZXJ0eS5zcGxpdChcIi9cIik7XG5cblx0XHRcdFx0Zm9yIChjb25zdCBjb250ZXh0IG9mIGFDb250ZXh0cykge1xuXHRcdFx0XHRcdGNvbnN0IHNNdWx0aUxldmVsUGF0aFZhbHVlID0gY29udGV4dC5nZXRPYmplY3Qob0luRGF0YS5kYXRhUHJvcGVydHkpO1xuXHRcdFx0XHRcdHNQcm9wZXJ0eUtleSA9IGAke29JbkRhdGEuZGF0YVByb3BlcnR5fS8ke3NNdWx0aUxldmVsUGF0aFZhbHVlfWA7XG5cdFx0XHRcdFx0aWYgKCFvRGlzdGluY3RWYWx1ZU1hcFtzUHJvcGVydHlLZXldICYmIGFGaW5hbFBhdGhbYVByb3BlcnR5UGF0aHNbYVByb3BlcnR5UGF0aHMubGVuZ3RoIC0gMV1dKSB7XG5cdFx0XHRcdFx0XHRvVGV4dEluZm8gPSBNYXNzRWRpdEhlbHBlci5nZXRUZXh0QXJyYW5nZW1lbnRJbmZvKFxuXHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRhdGFQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdFx0b0luRGF0YS5kZXNjcmlwdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRcdG9JbkRhdGEuZGlzcGxheSxcblx0XHRcdFx0XHRcdFx0Y29udGV4dFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGFGaW5hbFBhdGhbYVByb3BlcnR5UGF0aHNbYVByb3BlcnR5UGF0aHMubGVuZ3RoIC0gMV1dLnB1c2goe1xuXHRcdFx0XHRcdFx0XHR0ZXh0OiAob1RleHRJbmZvICYmIG9UZXh0SW5mby5mdWxsVGV4dCkgfHwgc011bHRpTGV2ZWxQYXRoVmFsdWUsXG5cdFx0XHRcdFx0XHRcdGtleTogc1Byb3BlcnR5S2V5LFxuXHRcdFx0XHRcdFx0XHR0ZXh0SW5mbzogb1RleHRJbmZvXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdG9EaXN0aW5jdFZhbHVlTWFwW3NQcm9wZXJ0eUtleV0gPSBzTXVsdGlMZXZlbFBhdGhWYWx1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gaWYgKE9iamVjdC5rZXlzKG9EaXN0aW5jdFZhbHVlTWFwKS5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0Ly8gXHRkaWFsb2dDb250ZXh0LnNldFByb3BlcnR5KG9EYXRhLmRhdGFQcm9wZXJ0eSwgc1Byb3BlcnR5S2V5ICYmIG9EaXN0aW5jdFZhbHVlTWFwW3NQcm9wZXJ0eUtleV0pO1xuXHRcdFx0XHQvLyB9XG5cblx0XHRcdFx0YUZpbmFsUGF0aFthUHJvcGVydHlQYXRoc1thUHJvcGVydHlQYXRocy5sZW5ndGggLSAxXV0udGV4dEluZm8gPSB7XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25QYXRoOiBvSW5EYXRhLmRlc2NyaXB0aW9uUGF0aCxcblx0XHRcdFx0XHR2YWx1ZVBhdGg6IG9JbkRhdGEuZGF0YVByb3BlcnR5LFxuXHRcdFx0XHRcdGRpc3BsYXlNb2RlOiBvSW5EYXRhLmRpc3BsYXlcblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldID0gYVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0gfHwgW107XG5cdFx0XHRcdGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldW1wic2VsZWN0T3B0aW9uc1wiXSA9IGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldW1wic2VsZWN0T3B0aW9uc1wiXSB8fCBbXTtcblx0XHRcdFx0aWYgKG9JbkRhdGEudW5pdFByb3BlcnR5KSB7XG5cdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XSA9IGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0gfHwgW107XG5cdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XVtcInNlbGVjdE9wdGlvbnNcIl0gPSBhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldW1wic2VsZWN0T3B0aW9uc1wiXSB8fCBbXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKGNvbnN0IGNvbnRleHQgb2YgYUNvbnRleHRzKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0RhdGFPYmplY3QgPSBjb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdHNQcm9wZXJ0eUtleSA9IGAke29JbkRhdGEuZGF0YVByb3BlcnR5fS8ke29EYXRhT2JqZWN0W29JbkRhdGEuZGF0YVByb3BlcnR5XX1gO1xuXHRcdFx0XHRcdGlmIChvSW5EYXRhLmRhdGFQcm9wZXJ0eSAmJiBvRGF0YU9iamVjdFtvSW5EYXRhLmRhdGFQcm9wZXJ0eV0gJiYgIW9EaXN0aW5jdFZhbHVlTWFwW3NQcm9wZXJ0eUtleV0pIHtcblx0XHRcdFx0XHRcdGlmIChvSW5EYXRhLmlucHV0VHlwZSAhPSBcIkNoZWNrQm94XCIpIHtcblx0XHRcdFx0XHRcdFx0b1RleHRJbmZvID0gTWFzc0VkaXRIZWxwZXIuZ2V0VGV4dEFycmFuZ2VtZW50SW5mbyhcblx0XHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRhdGFQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRlc2NyaXB0aW9uUGF0aCxcblx0XHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRpc3BsYXksXG5cdFx0XHRcdFx0XHRcdFx0Y29udGV4dFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBlbnRyeSA9IHtcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiAob1RleHRJbmZvICYmIG9UZXh0SW5mby5mdWxsVGV4dCkgfHwgb0RhdGFPYmplY3Rbb0luRGF0YS5kYXRhUHJvcGVydHldLFxuXHRcdFx0XHRcdFx0XHRcdGtleTogc1Byb3BlcnR5S2V5LFxuXHRcdFx0XHRcdFx0XHRcdHRleHRJbmZvOiBvVGV4dEluZm9cblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0ucHVzaChlbnRyeSk7XG5cdFx0XHRcdFx0XHRcdGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldW1wic2VsZWN0T3B0aW9uc1wiXS5wdXNoKGVudHJ5KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9EaXN0aW5jdFZhbHVlTWFwW3NQcm9wZXJ0eUtleV0gPSBvRGF0YU9iamVjdFtvSW5EYXRhLmRhdGFQcm9wZXJ0eV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChvSW5EYXRhLnVuaXRQcm9wZXJ0eSAmJiBvRGF0YU9iamVjdFtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHRcdHNVbml0UHJvcGVydHlOYW1lID0gYCR7b0luRGF0YS51bml0UHJvcGVydHl9LyR7b0RhdGFPYmplY3Rbb0luRGF0YS51bml0UHJvcGVydHldfWA7XG5cdFx0XHRcdFx0XHRpZiAoIW9EaXN0aW5jdFVuaXRNYXBbc1VuaXRQcm9wZXJ0eU5hbWVdKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvSW5EYXRhLmlucHV0VHlwZSAhPSBcIkNoZWNrQm94XCIpIHtcblx0XHRcdFx0XHRcdFx0XHRvVGV4dEluZm8gPSBNYXNzRWRpdEhlbHBlci5nZXRUZXh0QXJyYW5nZW1lbnRJbmZvKFxuXHRcdFx0XHRcdFx0XHRcdFx0b0luRGF0YS51bml0UHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRlc2NyaXB0aW9uUGF0aCxcblx0XHRcdFx0XHRcdFx0XHRcdG9JbkRhdGEuZGlzcGxheSxcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHRcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHVuaXRFbnRyeSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdHRleHQ6IChvVGV4dEluZm8gJiYgb1RleHRJbmZvLmZ1bGxUZXh0KSB8fCBvRGF0YU9iamVjdFtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0sXG5cdFx0XHRcdFx0XHRcdFx0XHRrZXk6IHNVbml0UHJvcGVydHlOYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0dGV4dEluZm86IG9UZXh0SW5mb1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XS5wdXNoKHVuaXRFbnRyeSk7XG5cdFx0XHRcdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XVtcInNlbGVjdE9wdGlvbnNcIl0ucHVzaCh1bml0RW50cnkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdG9EaXN0aW5jdFVuaXRNYXBbc1VuaXRQcm9wZXJ0eU5hbWVdID0gb0RhdGFPYmplY3Rbb0luRGF0YS51bml0UHJvcGVydHldO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XS50ZXh0SW5mbyA9IHtcblx0XHRcdFx0XHRkZXNjcmlwdGlvblBhdGg6IG9JbkRhdGEuZGVzY3JpcHRpb25QYXRoLFxuXHRcdFx0XHRcdHZhbHVlUGF0aDogb0luRGF0YS5kYXRhUHJvcGVydHksXG5cdFx0XHRcdFx0ZGlzcGxheU1vZGU6IG9JbkRhdGEuZGlzcGxheVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRpZiAoT2JqZWN0LmtleXMob0Rpc3RpbmN0VmFsdWVNYXApLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRcdGRpYWxvZ0NvbnRleHQuc2V0UHJvcGVydHkob0luRGF0YS5kYXRhUHJvcGVydHksIHNQcm9wZXJ0eUtleSAmJiBvRGlzdGluY3RWYWx1ZU1hcFtzUHJvcGVydHlLZXldKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoT2JqZWN0LmtleXMob0Rpc3RpbmN0VW5pdE1hcCkubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdFx0ZGlhbG9nQ29udGV4dC5zZXRQcm9wZXJ0eShvSW5EYXRhLnVuaXRQcm9wZXJ0eSwgc1VuaXRQcm9wZXJ0eU5hbWUgJiYgb0Rpc3RpbmN0VW5pdE1hcFtzVW5pdFByb3BlcnR5TmFtZV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0ZXh0UGF0aHNbb0luRGF0YS5kYXRhUHJvcGVydHldID0gb0luRGF0YS5kZXNjcmlwdGlvblBhdGggPyBbb0luRGF0YS5kZXNjcmlwdGlvblBhdGhdIDogW107XG5cdFx0fSk7XG5cdFx0YURhdGFBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChvSW5EYXRhOiBhbnkpIHtcblx0XHRcdGxldCB2YWx1ZXM6IGFueSA9IHt9O1xuXHRcdFx0aWYgKG9JbkRhdGEuZGF0YVByb3BlcnR5LmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdFx0Y29uc3Qgc011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlID0gTWFzc0VkaXRIZWxwZXIuZ2V0VmFsdWVGb3JNdWx0aUxldmVsUGF0aChvSW5EYXRhLmRhdGFQcm9wZXJ0eSwgYVZhbHVlcyk7XG5cdFx0XHRcdGlmICghc011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlKSB7XG5cdFx0XHRcdFx0c011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlLnB1c2goeyB0ZXh0OiBvRGVmYXVsdFZhbHVlcy5sZWF2ZUJsYW5rVmFsdWUsIGtleTogYEVtcHR5LyR7b0luRGF0YS5kYXRhUHJvcGVydHl9YCB9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRNYXNzRWRpdEhlbHBlci5zZXREZWZhdWx0VmFsdWVzVG9EaWFsb2coc011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlLCBvRGVmYXVsdFZhbHVlcywgb0luRGF0YSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFsdWVzID0gc011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlO1xuXHRcdFx0fSBlbHNlIGlmIChhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XSkge1xuXHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XSA9IGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldIHx8IFtdO1xuXHRcdFx0XHRNYXNzRWRpdEhlbHBlci5zZXREZWZhdWx0VmFsdWVzVG9EaWFsb2coYVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0sIG9EZWZhdWx0VmFsdWVzLCBvSW5EYXRhKTtcblx0XHRcdFx0dmFsdWVzID0gYVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV07XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldICYmIGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0ubGVuZ3RoKSB7XG5cdFx0XHRcdE1hc3NFZGl0SGVscGVyLnNldERlZmF1bHRWYWx1ZXNUb0RpYWxvZyhhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLCBvRGVmYXVsdFZhbHVlcywgb0luRGF0YSwgdHJ1ZSk7XG5cdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0udGV4dEluZm8gPSB7fTtcblx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XS5zZWxlY3RlZEtleSA9IE1hc3NFZGl0SGVscGVyLmdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3goXG5cdFx0XHRcdFx0YUNvbnRleHRzLFxuXHRcdFx0XHRcdG9JbkRhdGEudW5pdFByb3BlcnR5XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0uaW5wdXRUeXBlID0gb0luRGF0YS5pbnB1dFR5cGU7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHQob0luRGF0YS5kYXRhUHJvcGVydHkgJiYgYVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0gJiYgIWFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldLmxlbmd0aCkgfHxcblx0XHRcdFx0KG9JbkRhdGEudW5pdFByb3BlcnR5ICYmIGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0gJiYgIWFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0ubGVuZ3RoKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IGJDbGVhckZpZWxkT3JCbGFua1ZhbHVlRXhpc3RzID1cblx0XHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XSAmJlxuXHRcdFx0XHRcdGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldLnNvbWUoZnVuY3Rpb24gKG9iajogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb2JqLnRleHQgPT09IFwiPCBDbGVhciBWYWx1ZXMgPlwiIHx8IG9iai50ZXh0ID09PSBcIjwgTGVhdmUgQmxhbmsgPlwiO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAob0luRGF0YS5kYXRhUHJvcGVydHkgJiYgIWJDbGVhckZpZWxkT3JCbGFua1ZhbHVlRXhpc3RzKSB7XG5cdFx0XHRcdFx0YVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0ucHVzaCh7IHRleHQ6IG9EZWZhdWx0VmFsdWVzLmxlYXZlQmxhbmtWYWx1ZSwga2V5OiBgRW1wdHkvJHtvSW5EYXRhLmRhdGFQcm9wZXJ0eX1gIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGJDbGVhckZpZWxkT3JCbGFua1VuaXRWYWx1ZUV4aXN0cyA9XG5cdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XSAmJlxuXHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0uc29tZShmdW5jdGlvbiAob2JqOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvYmoudGV4dCA9PT0gXCI8IENsZWFyIFZhbHVlcyA+XCIgfHwgb2JqLnRleHQgPT09IFwiPCBMZWF2ZSBCbGFuayA+XCI7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChvSW5EYXRhLnVuaXRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdGlmICghYkNsZWFyRmllbGRPckJsYW5rVW5pdFZhbHVlRXhpc3RzKSB7XG5cdFx0XHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLnB1c2goe1xuXHRcdFx0XHRcdFx0XHR0ZXh0OiBvRGVmYXVsdFZhbHVlcy5sZWF2ZUJsYW5rVmFsdWUsXG5cdFx0XHRcdFx0XHRcdGtleTogYEVtcHR5LyR7b0luRGF0YS51bml0UHJvcGVydHl9YFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0udGV4dEluZm8gPSB7fTtcblx0XHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLnNlbGVjdGVkS2V5ID0gTWFzc0VkaXRIZWxwZXIuZ2V0RGVmYXVsdFNlbGVjdGlvblBhdGhDb21ib0JveChcblx0XHRcdFx0XHRcdGFDb250ZXh0cyxcblx0XHRcdFx0XHRcdG9JbkRhdGEudW5pdFByb3BlcnR5XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLmlucHV0VHlwZSA9IG9JbkRhdGEuaW5wdXRUeXBlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAob0luRGF0YS5pc1Byb3BlcnR5UmVhZE9ubHkgJiYgdHlwZW9mIG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5ID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0XHRhUmVhZE9ubHlGaWVsZEluZm8ucHVzaCh7IHByb3BlcnR5OiBvSW5EYXRhLmRhdGFQcm9wZXJ0eSwgdmFsdWU6IG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5LCB0eXBlOiBcIkRlZmF1bHRcIiB9KTtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5ICYmXG5cdFx0XHRcdG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5Lm9wZXJhbmRzICYmXG5cdFx0XHRcdG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5Lm9wZXJhbmRzWzBdICYmXG5cdFx0XHRcdG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5Lm9wZXJhbmRzWzBdLm9wZXJhbmQxICYmXG5cdFx0XHRcdG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5Lm9wZXJhbmRzWzBdLm9wZXJhbmQyXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gVGhpcyBuZWVkcyB0byBiZSByZWZhY3RvcmVkIGluIGFjY29yZGFuY2Ugd2l0aCB0aGUgUmVhZE9ubHlFeHByZXNzaW9uIGNoYW5nZVxuXHRcdFx0XHRhUmVhZE9ubHlGaWVsZEluZm8ucHVzaCh7XG5cdFx0XHRcdFx0cHJvcGVydHk6IG9JbkRhdGEuZGF0YVByb3BlcnR5LFxuXHRcdFx0XHRcdHByb3BlcnR5UGF0aDogb0luRGF0YS5pc1Byb3BlcnR5UmVhZE9ubHkub3BlcmFuZHNbMF0ub3BlcmFuZDEucGF0aCxcblx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlOiBvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kc1swXS5vcGVyYW5kMi52YWx1ZSxcblx0XHRcdFx0XHR0eXBlOiBcIlBhdGhcIlxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU2V0dGluZyB2aXNiaWxpdHkgb2YgdGhlIG1hc3MgZWRpdCBmaWVsZC5cblx0XHRcdGlmIChvSW5EYXRhLmVkaXRNb2RlKSB7XG5cdFx0XHRcdHZhbHVlcy52aXNpYmxlID1cblx0XHRcdFx0XHRvSW5EYXRhLmVkaXRNb2RlID09PSBFZGl0TW9kZS5FZGl0YWJsZSB8fFxuXHRcdFx0XHRcdGFDb250ZXh0cy5zb21lKFxuXHRcdFx0XHRcdFx0TWFzc0VkaXRIZWxwZXIuZ2V0RmllbGRWaXNpYmxpdHkuYmluZChcblx0XHRcdFx0XHRcdFx0TWFzc0VkaXRIZWxwZXIsXG5cdFx0XHRcdFx0XHRcdG9JbkRhdGEuZWRpdE1vZGUsXG5cdFx0XHRcdFx0XHRcdG9EaWFsb2dEYXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdG9JbkRhdGEuZGF0YVByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHR2YWx1ZXNcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsdWVzLnZpc2libGUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0dmFsdWVzLnNlbGVjdGVkS2V5ID0gTWFzc0VkaXRIZWxwZXIuZ2V0RGVmYXVsdFNlbGVjdGlvblBhdGhDb21ib0JveChhQ29udGV4dHMsIG9JbkRhdGEuZGF0YVByb3BlcnR5KTtcblx0XHRcdHZhbHVlcy5pbnB1dFR5cGUgPSBvSW5EYXRhLmlucHV0VHlwZTtcblx0XHRcdHZhbHVlcy51bml0UHJvcGVydHkgPSBvSW5EYXRhLnVuaXRQcm9wZXJ0eTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBvRGlhbG9nRGF0YU1vZGVsO1xuXHR9LFxuXHQvKipcblx0ICogR2V0cyB0cmFuc2llbnQgY29udGV4dCBmb3IgZGlhbG9nLlxuXHQgKlxuXHQgKiBAcGFyYW0gdGFibGUgSW5zdGFuY2Ugb2YgVGFibGUuXG5cdCAqIEBwYXJhbSBkaWFsb2cgTWFzcyBFZGl0IERpYWxvZy5cblx0ICogQHJldHVybnMgUHJvbWlzZSByZXR1cm5pbmcgaW5zdGFuY2Ugb2YgZGlhbG9nLlxuXHQgKi9cblx0Z2V0RGlhbG9nQ29udGV4dDogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSwgZGlhbG9nPzogRGlhbG9nKTogT0RhdGFWNENvbnRleHQge1xuXHRcdGxldCB0cmFuc0N0eCA9IGRpYWxvZz8uZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBPRGF0YVY0Q29udGV4dCB8IHVuZGVmaW5lZDtcblxuXHRcdGlmICghdHJhbnNDdHgpIHtcblx0XHRcdGNvbnN0IG1vZGVsID0gdGFibGUuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsO1xuXHRcdFx0Y29uc3QgbGlzdEJpbmRpbmcgPSB0YWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0XHRjb25zdCB0cmFuc2llbnRMaXN0QmluZGluZyA9IG1vZGVsLmJpbmRMaXN0KGxpc3RCaW5kaW5nLmdldFBhdGgoKSwgbGlzdEJpbmRpbmcuZ2V0Q29udGV4dCgpLCBbXSwgW10sIHtcblx0XHRcdFx0JCR1cGRhdGVHcm91cElkOiBcInN1Ym1pdExhdGVyXCJcblx0XHRcdH0pO1xuXHRcdFx0KHRyYW5zaWVudExpc3RCaW5kaW5nIGFzIGFueSkucmVmcmVzaEludGVybmFsID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQvKiAqL1xuXHRcdFx0fTtcblx0XHRcdHRyYW5zQ3R4ID0gdHJhbnNpZW50TGlzdEJpbmRpbmcuY3JlYXRlKHt9LCB0cnVlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJhbnNDdHg7XG5cdH0sXG5cblx0b25EaWFsb2dPcGVuOiBmdW5jdGlvbiAoZXZlbnQ6IGFueSk6IHZvaWQge1xuXHRcdGNvbnN0IHNvdXJjZSA9IGV2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGNvbnN0IGZpZWxkc0luZm9Nb2RlbCA9IHNvdXJjZS5nZXRNb2RlbChcImZpZWxkc0luZm9cIik7XG5cdFx0ZmllbGRzSW5mb01vZGVsLnNldFByb3BlcnR5KFwiL2lzT3BlblwiLCB0cnVlKTtcblx0fSxcblxuXHRjbG9zZURpYWxvZzogZnVuY3Rpb24gKG9EaWFsb2c6IGFueSkge1xuXHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRvRGlhbG9nLmRlc3Ryb3koKTtcblx0fSxcblxuXHRtZXNzYWdlSGFuZGxpbmdGb3JNYXNzRWRpdDogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdG9UYWJsZTogVGFibGUsXG5cdFx0YUNvbnRleHRzOiBhbnksXG5cdFx0b0NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyLFxuXHRcdG9JbkRpYWxvZzogYW55LFxuXHRcdGFSZXN1bHRzOiBhbnksXG5cdFx0ZXJyb3JDb250ZXh0czogYW55XG5cdCkge1xuXHRcdGNvbnN0IERyYWZ0U3RhdHVzID0gRkVMaWJyYXJ5LkRyYWZ0U3RhdHVzO1xuXHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0KG9Db250cm9sbGVyLmdldFZpZXcoKT8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCk/LnNldFByb3BlcnR5KFwiZ2V0Qm91bmRNZXNzYWdlc0Zvck1hc3NFZGl0XCIsIHRydWUpO1xuXHRcdG9Db250cm9sbGVyLm1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcyh7XG5cdFx0XHRvbkJlZm9yZVNob3dNZXNzYWdlOiBmdW5jdGlvbiAobWVzc2FnZXM6IGFueSwgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRcdFx0Ly9tZXNzYWdlcy5jb25jYXRlbmF0ZShtZXNzYWdlSGFuZGxpbmcuZ2V0TWVzc2FnZXModHJ1ZSwgdHJ1ZSkpO1xuXHRcdFx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnMuZm5HZXRNZXNzYWdlU3VidGl0bGUgPSBtZXNzYWdlSGFuZGxpbmcuc2V0TWVzc2FnZVN1YnRpdGxlLmJpbmQoe30sIG9UYWJsZSwgYUNvbnRleHRzKTtcblx0XHRcdFx0Y29uc3QgdW5ib3VuZEVycm9yczogYW55W10gPSBbXTtcblx0XHRcdFx0bWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbiAobWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdFx0aWYgKCFtZXNzYWdlLmdldFRhcmdldCgpKSB7XG5cdFx0XHRcdFx0XHR1bmJvdW5kRXJyb3JzLnB1c2gobWVzc2FnZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoYVJlc3VsdHMubGVuZ3RoID4gMCAmJiBlcnJvckNvbnRleHRzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdG9Db250cm9sbGVyLmVkaXRGbG93LnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLlNhdmVkKTtcblx0XHRcdFx0XHRjb25zdCBzdWNjZXNzVG9hc3QgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUFTU19FRElUX1NVQ0NFU1NfVE9BU1RcIik7XG5cdFx0XHRcdFx0TWVzc2FnZVRvYXN0LnNob3coc3VjY2Vzc1RvYXN0KTtcblx0XHRcdFx0fSBlbHNlIGlmIChlcnJvckNvbnRleHRzLmxlbmd0aCA8IChvVGFibGUgYXMgYW55KS5nZXRTZWxlY3RlZENvbnRleHRzKCkubGVuZ3RoKSB7XG5cdFx0XHRcdFx0b0NvbnRyb2xsZXIuZWRpdEZsb3cuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuU2F2ZWQpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGVycm9yQ29udGV4dHMubGVuZ3RoID09PSAob1RhYmxlIGFzIGFueSkuZ2V0U2VsZWN0ZWRDb250ZXh0cygpLmxlbmd0aCkge1xuXHRcdFx0XHRcdG9Db250cm9sbGVyLmVkaXRGbG93LnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLkNsZWFyKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvQ29udHJvbGxlci5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikgJiYgdW5ib3VuZEVycm9ycy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnMuc2hvd01lc3NhZ2VCb3ggPSBmYWxzZTtcblx0XHRcdFx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnMuc2hvd01lc3NhZ2VEaWFsb2cgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGlmIChvSW5EaWFsb2cuaXNPcGVuKCkpIHtcblx0XHRcdE1hc3NFZGl0SGVscGVyLmNsb3NlRGlhbG9nKG9JbkRpYWxvZyk7XG5cdFx0XHQob0NvbnRyb2xsZXIuZ2V0VmlldygpPy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0KT8uc2V0UHJvcGVydHkoXCJza2lwUGF0Y2hIYW5kbGVyc1wiLCBmYWxzZSk7XG5cdFx0fVxuXHRcdChvQ29udHJvbGxlci5nZXRWaWV3KCk/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpPy5zZXRQcm9wZXJ0eShcImdldEJvdW5kTWVzc2FnZXNGb3JNYXNzRWRpdFwiLCBmYWxzZSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gZ2VuZXJhdGVzIHNpZGUgZWZmZWN0cyBtYXAgZnJvbSBzaWRlIGVmZmVjdHMgaWRzKHdoaWNoIGlzIGEgY29tYmluYXRpb24gb2YgZW50aXR5IHR5cGUgYW5kIHF1YWxpZmllcikuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRW50aXR5U2V0Q29udGV4dFxuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50XG5cdCAqIEBwYXJhbSBvQ29udHJvbGxlclxuXHQgKiBAcGFyYW0gYVJlc3VsdHNcblx0ICogQHJldHVybnMgU2lkZSBlZmZlY3QgbWFwIHdpdGggZGF0YS5cblx0ICovXG5cdGdldFNpZGVFZmZlY3REYXRhRm9yS2V5OiBmdW5jdGlvbiAob0VudGl0eVNldENvbnRleHQ6IGFueSwgYXBwQ29tcG9uZW50OiBhbnksIG9Db250cm9sbGVyOiBQYWdlQ29udHJvbGxlciwgYVJlc3VsdHM6IGFueSkge1xuXHRcdGNvbnN0IHNPd25lckVudGl0eVR5cGUgPSBvRW50aXR5U2V0Q29udGV4dC5nZXRQcm9wZXJ0eShcIiRUeXBlXCIpO1xuXHRcdGNvbnN0IGJhc2VTaWRlRWZmZWN0c01hcEFycmF5OiBhbnkgPSB7fTtcblxuXHRcdGFSZXN1bHRzLmZvckVhY2goKHJlc3VsdDogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBzUGF0aCA9IHJlc3VsdC5rZXlWYWx1ZTtcblx0XHRcdGNvbnN0IHNpZGVFZmZlY3RTZXJ2aWNlID0gYXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpO1xuXHRcdFx0Y29uc3QgZmllbGRHcm91cElkcyA9IHNpZGVFZmZlY3RTZXJ2aWNlLmNvbXB1dGVGaWVsZEdyb3VwSWRzKHNPd25lckVudGl0eVR5cGUsIHJlc3VsdC5wcm9wZXJ0eUZ1bGx5UXVhbGlmaWVkTmFtZSA/PyBcIlwiKSA/PyBbXTtcblx0XHRcdGJhc2VTaWRlRWZmZWN0c01hcEFycmF5W3NQYXRoXSA9IG9Db250cm9sbGVyLl9zaWRlRWZmZWN0cy5nZXRTaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXBzKGZpZWxkR3JvdXBJZHMpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBiYXNlU2lkZUVmZmVjdHNNYXBBcnJheTtcblx0fSxcblxuXHQvKipcblx0ICogR2l2ZSB0aGUgZW50aXR5IHR5cGUgZm9yIGEgZ2l2ZW4gc3BhdGggZm9yIGUuZy5SZXF1ZXN0ZWRRdWFudGl0eS5cblx0ICpcblx0ICogQHBhcmFtIHNQYXRoXG5cdCAqIEBwYXJhbSBzRW50aXR5VHlwZVxuXHQgKiBAcGFyYW0gb01ldGFNb2RlbFxuXHQgKiBAcmV0dXJucyBPYmplY3QgaGF2aW5nIGVudGl0eSwgc3BhdGggYW5kIG5hdmlnYXRpb24gcGF0aC5cblx0ICovXG5cdGZuR2V0UGF0aEZvclNvdXJjZVByb3BlcnR5OiBmdW5jdGlvbiAoc1BhdGg6IGFueSwgc0VudGl0eVR5cGU6IGFueSwgb01ldGFNb2RlbDogYW55KSB7XG5cdFx0Ly8gaWYgdGhlIHByb3BlcnR5IHBhdGggaGFzIGEgbmF2aWdhdGlvbiwgZ2V0IHRoZSB0YXJnZXQgZW50aXR5IHR5cGUgb2YgdGhlIG5hdmlnYXRpb25cblx0XHRjb25zdCBzTmF2aWdhdGlvblBhdGggPVxuXHRcdFx0XHRzUGF0aC5pbmRleE9mKFwiL1wiKSA+IDAgPyBcIi9cIiArIHNFbnRpdHlUeXBlICsgXCIvXCIgKyBzUGF0aC5zdWJzdHIoMCwgc1BhdGgubGFzdEluZGV4T2YoXCIvXCIpICsgMSkgKyBcIkBzYXB1aS5uYW1lXCIgOiBmYWxzZSxcblx0XHRcdHBPd25lckVudGl0eSA9ICFzTmF2aWdhdGlvblBhdGggPyBQcm9taXNlLnJlc29sdmUoc0VudGl0eVR5cGUpIDogb01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KHNOYXZpZ2F0aW9uUGF0aCk7XG5cdFx0c1BhdGggPSBzTmF2aWdhdGlvblBhdGggPyBzUGF0aC5zdWJzdHIoc1BhdGgubGFzdEluZGV4T2YoXCIvXCIpICsgMSkgOiBzUGF0aDtcblx0XHRyZXR1cm4geyBzUGF0aCwgcE93bmVyRW50aXR5LCBzTmF2aWdhdGlvblBhdGggfTtcblx0fSxcblxuXHRmbkdldEVudGl0eVR5cGVPZk93bmVyOiBmdW5jdGlvbiAob01ldGFNb2RlbDogYW55LCBiYXNlTmF2UGF0aDogc3RyaW5nLCBvRW50aXR5U2V0Q29udGV4dDogYW55LCB0YXJnZXRFbnRpdHk6IHN0cmluZywgYVRhcmdldHM6IGFueSkge1xuXHRcdGNvbnN0IG93bmVyRW50aXR5VHlwZSA9IG9FbnRpdHlTZXRDb250ZXh0LmdldFByb3BlcnR5KFwiJFR5cGVcIik7XG5cdFx0Y29uc3QgeyAkVHlwZTogcE93bmVyLCAkUGFydG5lcjogb3duZXJOYXZQYXRoIH0gPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtvRW50aXR5U2V0Q29udGV4dH0vJHtiYXNlTmF2UGF0aH1gKTsgLy8gbmF2IHBhdGhcblx0XHRpZiAob3duZXJOYXZQYXRoKSB7XG5cdFx0XHRjb25zdCBlbnRpdHlPYmpPZk93bmVyUGFydG5lciA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtwT3duZXJ9LyR7b3duZXJOYXZQYXRofWApO1xuXHRcdFx0aWYgKGVudGl0eU9iak9mT3duZXJQYXJ0bmVyKSB7XG5cdFx0XHRcdGNvbnN0IGVudGl0eVR5cGVPZk93bmVyUGFydG5lciA9IGVudGl0eU9iak9mT3duZXJQYXJ0bmVyW1wiJFR5cGVcIl07XG5cdFx0XHRcdC8vIGlmIHRoZSBlbnRpdHkgdHlwZXMgZGVmZXIsIHRoZW4gYmFzZSBuYXYgcGF0aCBpcyBub3QgZnJvbSBvd25lclxuXHRcdFx0XHRpZiAoZW50aXR5VHlwZU9mT3duZXJQYXJ0bmVyICE9PSBvd25lckVudGl0eVR5cGUpIHtcblx0XHRcdFx0XHQvLyBpZiB0YXJnZXQgUHJvcCBpcyBub3QgZnJvbSBvd25lciwgd2UgYWRkIGl0IGFzIGltbWVkaWF0ZVxuXHRcdFx0XHRcdGFUYXJnZXRzLnB1c2godGFyZ2V0RW50aXR5KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiB0aGVyZSBpcyBubyAkUGFydG5lciBhdHRyaWJ1dGUsIGl0IG1heSBub3QgYmUgZnJvbSBvd25lclxuXHRcdFx0YVRhcmdldHMucHVzaCh0YXJnZXRFbnRpdHkpO1xuXHRcdH1cblx0XHRyZXR1cm4gYVRhcmdldHM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdpdmUgdGFyZ2V0cyB0aGF0IGFyZSBpbW1lZGlhdGUgb3IgZGVmZXJyZWQgYmFzZWQgb24gdGhlIGVudGl0eSB0eXBlIG9mIHRoYXQgdGFyZ2V0LlxuXHQgKlxuXHQgKlxuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHNEYXRhXG5cdCAqIEBwYXJhbSBvRW50aXR5U2V0Q29udGV4dFxuXHQgKiBAcGFyYW0gc0VudGl0eVR5cGVcblx0ICogQHBhcmFtIG9NZXRhTW9kZWxcblx0ICogQHJldHVybnMgVGFyZ2V0cyB0byByZXF1ZXN0IHNpZGUgZWZmZWN0cy5cblx0ICovXG5cdGZuR2V0VGFyZ2V0c0Zvck1hc3NFZGl0OiBmdW5jdGlvbiAoc2lkZUVmZmVjdHNEYXRhOiBPRGF0YVNpZGVFZmZlY3RzVHlwZSwgb0VudGl0eVNldENvbnRleHQ6IGFueSwgc0VudGl0eVR5cGU6IGFueSwgb01ldGFNb2RlbDogYW55KSB7XG5cdFx0Y29uc3QgeyB0YXJnZXRQcm9wZXJ0aWVzOiBhVGFyZ2V0UHJvcGVydGllcywgdGFyZ2V0RW50aXRpZXM6IGFUYXJnZXRFbnRpdGllcyB9ID0gc2lkZUVmZmVjdHNEYXRhO1xuXHRcdGNvbnN0IGFQcm9taXNlczogYW55ID0gW107XG5cdFx0bGV0IGFUYXJnZXRzOiBhbnkgPSBbXTtcblx0XHRjb25zdCBvd25lckVudGl0eVR5cGUgPSBvRW50aXR5U2V0Q29udGV4dC5nZXRQcm9wZXJ0eShcIiRUeXBlXCIpO1xuXG5cdFx0aWYgKHNFbnRpdHlUeXBlID09PSBvd25lckVudGl0eVR5cGUpIHtcblx0XHRcdC8vIGlmIFNhbGVzT3JkciBJdGVtXG5cdFx0XHRhVGFyZ2V0RW50aXRpZXM/LmZvckVhY2goKHRhcmdldEVudGl0eTogYW55KSA9PiB7XG5cdFx0XHRcdHRhcmdldEVudGl0eSA9IHRhcmdldEVudGl0eVtcIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCJdO1xuXHRcdFx0XHRsZXQgYmFzZU5hdlBhdGg6IHN0cmluZztcblx0XHRcdFx0aWYgKHRhcmdldEVudGl0eS5pbmNsdWRlcyhcIi9cIikpIHtcblx0XHRcdFx0XHRiYXNlTmF2UGF0aCA9IHRhcmdldEVudGl0eS5zcGxpdChcIi9cIilbMF07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YmFzZU5hdlBhdGggPSB0YXJnZXRFbnRpdHk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YVRhcmdldHMgPSBNYXNzRWRpdEhlbHBlci5mbkdldEVudGl0eVR5cGVPZk93bmVyKG9NZXRhTW9kZWwsIGJhc2VOYXZQYXRoLCBvRW50aXR5U2V0Q29udGV4dCwgdGFyZ2V0RW50aXR5LCBhVGFyZ2V0cyk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoYVRhcmdldFByb3BlcnRpZXMubGVuZ3RoKSB7XG5cdFx0XHRhVGFyZ2V0UHJvcGVydGllcy5mb3JFYWNoKCh0YXJnZXRQcm9wOiBhbnkpID0+IHtcblx0XHRcdFx0Y29uc3QgeyBwT3duZXJFbnRpdHkgfSA9IE1hc3NFZGl0SGVscGVyLmZuR2V0UGF0aEZvclNvdXJjZVByb3BlcnR5KHRhcmdldFByb3AsIHNFbnRpdHlUeXBlLCBvTWV0YU1vZGVsKTtcblx0XHRcdFx0YVByb21pc2VzLnB1c2goXG5cdFx0XHRcdFx0cE93bmVyRW50aXR5LnRoZW4oKHJlc3VsdEVudGl0eTogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHQvLyBpZiBlbnRpdHkgaXMgU2FsZXNPcmRlckl0ZW0sIFRhcmdldCBQcm9wZXJ0eSBpcyBmcm9tIEl0ZW1zIHRhYmxlXG5cdFx0XHRcdFx0XHRpZiAocmVzdWx0RW50aXR5ID09PSBvd25lckVudGl0eVR5cGUpIHtcblx0XHRcdFx0XHRcdFx0YVRhcmdldHMucHVzaCh0YXJnZXRQcm9wKTsgLy8gZ2V0IGltbWVkaWF0ZSB0YXJnZXRzXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHRhcmdldFByb3AuaW5jbHVkZXMoXCIvXCIpKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGJhc2VOYXZQYXRoID0gdGFyZ2V0UHJvcC5zcGxpdChcIi9cIilbMF07XG5cdFx0XHRcdFx0XHRcdGFUYXJnZXRzID0gTWFzc0VkaXRIZWxwZXIuZm5HZXRFbnRpdHlUeXBlT2ZPd25lcihcblx0XHRcdFx0XHRcdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRcdGJhc2VOYXZQYXRoLFxuXHRcdFx0XHRcdFx0XHRcdG9FbnRpdHlTZXRDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdHRhcmdldFByb3AsXG5cdFx0XHRcdFx0XHRcdFx0YVRhcmdldHNcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoYVRhcmdldHMpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YVByb21pc2VzLnB1c2goUHJvbWlzZS5yZXNvbHZlKGFUYXJnZXRzKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFQcm9taXNlcyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2hlY2tzIGlmIGluIHRoZSBnaXZlbiBzaWRlIEVmZmVjdHMgT2JqLCBpZiBfSXRlbSBpcyBzZXQgYXMgVGFyZ2V0IEVudGl0eSBmb3IgYW55IHNpZGUgRWZmZWN0cyBvblxuXHQgKiBvdGhlciBlbnRpdHkgc2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHNNYXBcblx0ICogQHBhcmFtIG9FbnRpdHlTZXRDb250ZXh0XG5cdCAqIEByZXR1cm5zIExlbmd0aCBvZiBzaWRlRWZmZWN0c0FycmF5IHdoZXJlIGN1cnJlbnQgRW50aXR5IGlzIHNldCBhcyBUYXJnZXQgRW50aXR5XG5cdCAqL1xuXHRjaGVja0lmRW50aXR5RXhpc3RzQXNUYXJnZXRFbnRpdHk6IChcblx0XHRzaWRlRWZmZWN0c01hcDogTWFzc0VkaXRGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5IHwgRmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeSxcblx0XHRvRW50aXR5U2V0Q29udGV4dDogQ29udGV4dFxuXHQpID0+IHtcblx0XHRjb25zdCBvd25lckVudGl0eVR5cGUgPSBvRW50aXR5U2V0Q29udGV4dC5nZXRQcm9wZXJ0eShcIiRUeXBlXCIpO1xuXHRcdGNvbnN0IHNpZGVFZmZlY3RzT25PdGhlckVudGl0eTogTWFzc0VkaXRGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGVbXSA9IE9iamVjdC52YWx1ZXMoc2lkZUVmZmVjdHNNYXApLmZpbHRlcihcblx0XHRcdChvYmo6IE1hc3NFZGl0RmllbGRTaWRlRWZmZWN0UHJvcGVydHlUeXBlKSA9PiB7XG5cdFx0XHRcdHJldHVybiBvYmoubmFtZS5pbmRleE9mKG93bmVyRW50aXR5VHlwZSkgPT0gLTE7XG5cdFx0XHR9XG5cdFx0KTtcblxuXHRcdGNvbnN0IGVudGl0eVNldE5hbWUgPSBvRW50aXR5U2V0Q29udGV4dC5nZXRQYXRoKCkuc3BsaXQoXCIvXCIpLnBvcCgpO1xuXHRcdGNvbnN0IHNpZGVFZmZlY3RzV2l0aEN1cnJlbnRFbnRpdHlBc1RhcmdldCA9IHNpZGVFZmZlY3RzT25PdGhlckVudGl0eS5maWx0ZXIoKG9iajogTWFzc0VkaXRGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGUpID0+IHtcblx0XHRcdGNvbnN0IHRhcmdldEVudGl0aWVzQXJyYXk6IFNpZGVFZmZlY3RzRW50aXR5VHlwZVtdIHwgdW5kZWZpbmVkID0gb2JqLnNpZGVFZmZlY3RzLnRhcmdldEVudGl0aWVzO1xuXHRcdFx0cmV0dXJuIHRhcmdldEVudGl0aWVzQXJyYXk/LmZpbHRlcigoaW5uZXJPYmo6IFNpZGVFZmZlY3RzRW50aXR5VHlwZSkgPT4gaW5uZXJPYmpbXCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiXSA9PT0gZW50aXR5U2V0TmFtZSlcblx0XHRcdFx0Lmxlbmd0aFxuXHRcdFx0XHQ/IG9ialxuXHRcdFx0XHQ6IGZhbHNlO1xuXHRcdH0pO1xuXHRcdHJldHVybiBzaWRlRWZmZWN0c1dpdGhDdXJyZW50RW50aXR5QXNUYXJnZXQubGVuZ3RoO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcG9uIHVwZGF0aW5nIHRoZSBmaWVsZCwgYXJyYXkgb2YgaW1tZWRpYXRlIGFuZCBkZWZlcnJlZCBzaWRlIGVmZmVjdHMgZm9yIHRoYXQgZmllbGQgYXJlIGNyZWF0ZWQuXG5cdCAqIElmIHRoZXJlIGFyZSBhbnkgZmFpbGVkIHNpZGUgZWZmZWN0cyBmb3IgdGhhdCBjb250ZXh0LCB0aGV5IHdpbGwgYWxzbyBiZSB1c2VkIHRvIGdlbmVyYXRlIHRoZSBtYXAuXG5cdCAqIElmIHRoZSBmaWVsZCBoYXMgdGV4dCBhc3NvY2lhdGVkIHdpdGggaXQsIHRoZW4gYWRkIGl0IHRvIHJlcXVlc3Qgc2lkZSBlZmZlY3RzLlxuXHQgKlxuXHQgKiBAcGFyYW0gbVBhcmFtc1xuXHQgKiBAcGFyYW0gbVBhcmFtcy5vQ29udHJvbGxlciBDb250cm9sbGVyXG5cdCAqIEBwYXJhbSBtUGFyYW1zLm9GaWVsZFByb21pc2UgUHJvbWlzZSB0byB1cGRhdGUgZmllbGRcblx0ICogQHBhcmFtIG1QYXJhbXMuc2lkZUVmZmVjdE1hcCBTaWRlRWZmZWN0c01hcCBmb3IgdGhlIGZpZWxkXG5cdCAqIEBwYXJhbSBtUGFyYW1zLnRleHRQYXRocyBUZXh0UGF0aHMgb2YgdGhlIGZpZWxkIGlmIGFueVxuXHQgKiBAcGFyYW0gbVBhcmFtcy5ncm91cElkIEdyb3VwIElkIHRvIHVzZWQgdG8gZ3JvdXAgcmVxdWVzdHNcblx0ICogQHBhcmFtIG1QYXJhbXMua2V5IEtleVZhbHVlIG9mIHRoZSBmaWVsZFxuXHQgKiBAcGFyYW0gbVBhcmFtcy5vRW50aXR5U2V0Q29udGV4dCBFbnRpdHlTZXRjb250ZXh0XG5cdCAqIEBwYXJhbSBtUGFyYW1zLm9NZXRhTW9kZWwgTWV0YW1vZGVsIGRhdGFcblx0ICogQHBhcmFtIG1QYXJhbXMuc2VsZWN0ZWRDb250ZXh0IFNlbGVjdGVkIHJvdyBjb250ZXh0XG5cdCAqIEBwYXJhbSBtUGFyYW1zLmRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lIERlZmVycmVkIHRhcmdldHMgZGF0YVxuXHQgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhbGwgaW1tZWRpYXRlbHkgcmVxdWVzdGVkIHNpZGUgZWZmZWN0cy5cblx0ICovXG5cdGhhbmRsZU1hc3NFZGl0RmllbGRVcGRhdGVBbmRSZXF1ZXN0U2lkZUVmZmVjdHM6IGFzeW5jIGZ1bmN0aW9uIChtUGFyYW1zOiBEYXRhVG9VcGRhdGVGaWVsZEFuZFNpZGVFZmZlY3RzVHlwZSkge1xuXHRcdGNvbnN0IHtcblx0XHRcdG9Db250cm9sbGVyLFxuXHRcdFx0b0ZpZWxkUHJvbWlzZSxcblx0XHRcdHNpZGVFZmZlY3RzTWFwLFxuXHRcdFx0dGV4dFBhdGhzLFxuXHRcdFx0Z3JvdXBJZCxcblx0XHRcdGtleSxcblx0XHRcdG9FbnRpdHlTZXRDb250ZXh0LFxuXHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdG9TZWxlY3RlZENvbnRleHQsXG5cdFx0XHRkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZVxuXHRcdH0gPSBtUGFyYW1zO1xuXHRcdGNvbnN0IGltbWVkaWF0ZVNpZGVFZmZlY3RzUHJvbWlzZXMgPSBbb0ZpZWxkUHJvbWlzZV07XG5cdFx0Y29uc3Qgb3duZXJFbnRpdHlUeXBlID0gb0VudGl0eVNldENvbnRleHQuZ2V0UHJvcGVydHkoXCIkVHlwZVwiKTtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9Db250cm9sbGVyLmdldFZpZXcoKSk7XG5cdFx0Y29uc3Qgb1NpZGVFZmZlY3RzU2VydmljZSA9IG9BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cblx0XHRjb25zdCBpc1NpZGVFZmZlY3RzV2l0aEN1cnJlbnRFbnRpdHlBc1RhcmdldCA9IE1hc3NFZGl0SGVscGVyLmNoZWNrSWZFbnRpdHlFeGlzdHNBc1RhcmdldEVudGl0eShzaWRlRWZmZWN0c01hcCwgb0VudGl0eVNldENvbnRleHQpO1xuXG5cdFx0aWYgKHNpZGVFZmZlY3RzTWFwKSB7XG5cdFx0XHRjb25zdCBhbGxFbnRpdHlUeXBlc1dpdGhRdWFsaWZpZXIgPSBPYmplY3Qua2V5cyhzaWRlRWZmZWN0c01hcCk7XG5cdFx0XHRjb25zdCBzaWRlRWZmZWN0c0RhdGFGb3JGaWVsZDogYW55ID0gT2JqZWN0LnZhbHVlcyhzaWRlRWZmZWN0c01hcCk7XG5cblx0XHRcdGNvbnN0IG1WaXNpdGVkU2lkZUVmZmVjdHM6IGFueSA9IHt9O1xuXHRcdFx0ZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWVba2V5XSA9IHt9O1xuXHRcdFx0Zm9yIChjb25zdCBbaW5kZXgsIGRhdGFdIG9mIHNpZGVFZmZlY3RzRGF0YUZvckZpZWxkLmVudHJpZXMoKSkge1xuXHRcdFx0XHRjb25zdCBlbnRpdHlUeXBlV2l0aFF1YWxpZmllciA9IGFsbEVudGl0eVR5cGVzV2l0aFF1YWxpZmllcltpbmRleF07XG5cdFx0XHRcdGNvbnN0IHNFbnRpdHlUeXBlID0gZW50aXR5VHlwZVdpdGhRdWFsaWZpZXIuc3BsaXQoXCIjXCIpWzBdO1xuXHRcdFx0XHRjb25zdCBvQ29udGV4dDogYW55ID0gb0NvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLmdldENvbnRleHRGb3JTaWRlRWZmZWN0cyhvU2VsZWN0ZWRDb250ZXh0LCBzRW50aXR5VHlwZSk7XG5cdFx0XHRcdGRhdGEuY29udGV4dCA9IG9Db250ZXh0O1xuXG5cdFx0XHRcdGNvbnN0IGFsbEZhaWxlZFNpZGVFZmZlY3RzID0gb0NvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLmdldFJlZ2lzdGVyZWRGYWlsZWRSZXF1ZXN0cygpO1xuXHRcdFx0XHRjb25zdCBhRmFpbGVkU2lkZUVmZmVjdHMgPSBhbGxGYWlsZWRTaWRlRWZmZWN0c1tvQ29udGV4dC5nZXRQYXRoKCldO1xuXHRcdFx0XHRvQ29udHJvbGxlci5fc2lkZUVmZmVjdHMudW5yZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzRm9yQUNvbnRleHQob0NvbnRleHQpO1xuXHRcdFx0XHRsZXQgc2lkZUVmZmVjdHNGb3JDdXJyZW50Q29udGV4dCA9IFtkYXRhLnNpZGVFZmZlY3RzXTtcblx0XHRcdFx0c2lkZUVmZmVjdHNGb3JDdXJyZW50Q29udGV4dCA9XG5cdFx0XHRcdFx0YUZhaWxlZFNpZGVFZmZlY3RzICYmIGFGYWlsZWRTaWRlRWZmZWN0cy5sZW5ndGhcblx0XHRcdFx0XHRcdD8gc2lkZUVmZmVjdHNGb3JDdXJyZW50Q29udGV4dC5jb25jYXQoYUZhaWxlZFNpZGVFZmZlY3RzKVxuXHRcdFx0XHRcdFx0OiBzaWRlRWZmZWN0c0ZvckN1cnJlbnRDb250ZXh0O1xuXHRcdFx0XHRtVmlzaXRlZFNpZGVFZmZlY3RzW29Db250ZXh0XSA9IHt9O1xuXHRcdFx0XHRmb3IgKGNvbnN0IGFTaWRlRWZmZWN0IG9mIHNpZGVFZmZlY3RzRm9yQ3VycmVudENvbnRleHQpIHtcblx0XHRcdFx0XHRpZiAoIW1WaXNpdGVkU2lkZUVmZmVjdHNbb0NvbnRleHRdLmhhc093blByb3BlcnR5KGFTaWRlRWZmZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZSkpIHtcblx0XHRcdFx0XHRcdG1WaXNpdGVkU2lkZUVmZmVjdHNbb0NvbnRleHRdW2FTaWRlRWZmZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSB0cnVlO1xuXHRcdFx0XHRcdFx0bGV0IGFJbW1lZGlhdGVUYXJnZXRzOiBhbnlbXSA9IFtdLFxuXHRcdFx0XHRcdFx0XHRhbGxUYXJnZXRzOiBhbnlbXSA9IFtdLFxuXHRcdFx0XHRcdFx0XHR0cmlnZ2VyQWN0aW9uTmFtZTogU3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBmbkdldEltbWVkaWF0ZVRhcmdldHNBbmRBY3Rpb25zID0gYXN5bmMgZnVuY3Rpb24gKG1TaWRlRWZmZWN0OiBPRGF0YVNpZGVFZmZlY3RzVHlwZSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCB7IHRhcmdldFByb3BlcnRpZXM6IGFUYXJnZXRQcm9wZXJ0aWVzLCB0YXJnZXRFbnRpdGllczogYVRhcmdldEVudGl0aWVzIH0gPSBtU2lkZUVmZmVjdDtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lkZUVmZmVjdEVudGl0eVR5cGUgPSBtU2lkZUVmZmVjdC5mdWxseVF1YWxpZmllZE5hbWUuc3BsaXQoXCJAXCIpWzBdO1xuXHRcdFx0XHRcdFx0XHRjb25zdCB0YXJnZXRzQXJyYXlGb3JBbGxQcm9wZXJ0aWVzID0gYXdhaXQgTWFzc0VkaXRIZWxwZXIuZm5HZXRUYXJnZXRzRm9yTWFzc0VkaXQoXG5cdFx0XHRcdFx0XHRcdFx0bVNpZGVFZmZlY3QsXG5cdFx0XHRcdFx0XHRcdFx0b0VudGl0eVNldENvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFx0c2lkZUVmZmVjdEVudGl0eVR5cGUsXG5cdFx0XHRcdFx0XHRcdFx0b01ldGFNb2RlbFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRhSW1tZWRpYXRlVGFyZ2V0cyA9IHRhcmdldHNBcnJheUZvckFsbFByb3BlcnRpZXNbMF07XG5cdFx0XHRcdFx0XHRcdGFsbFRhcmdldHMgPSAoYVRhcmdldFByb3BlcnRpZXMgfHwgW10pLmNvbmNhdCgoYVRhcmdldEVudGl0aWVzIGFzIGFueVtdKSB8fCBbXSk7XG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgYWN0aW9uTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gbVNpZGVFZmZlY3QudHJpZ2dlckFjdGlvbjtcblx0XHRcdFx0XHRcdFx0Y29uc3QgYURlZmVycmVkVGFyZ2V0cyA9IGFsbFRhcmdldHMuZmlsdGVyKCh0YXJnZXQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiAhYUltbWVkaWF0ZVRhcmdldHMuaW5jbHVkZXModGFyZ2V0KTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0ZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWVba2V5XVttU2lkZUVmZmVjdC5mdWxseVF1YWxpZmllZE5hbWVdID0ge1xuXHRcdFx0XHRcdFx0XHRcdGFUYXJnZXRzOiBhRGVmZXJyZWRUYXJnZXRzLFxuXHRcdFx0XHRcdFx0XHRcdG9Db250ZXh0OiBvQ29udGV4dCxcblx0XHRcdFx0XHRcdFx0XHRtU2lkZUVmZmVjdFxuXHRcdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRcdC8vIGlmIGVudGl0eSBpcyBvdGhlciB0aGFuIGl0ZW1zIHRhYmxlIHRoZW4gYWN0aW9uIGlzIGRlZmVyZWRcblx0XHRcdFx0XHRcdFx0aWYgKGFjdGlvbk5hbWUgJiYgc2lkZUVmZmVjdEVudGl0eVR5cGUgPT09IG93bmVyRW50aXR5VHlwZSkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIHN0YXRpYyBhY3Rpb24gaXMgb24gY29sbGVjdGlvbiwgc28gd2UgZGVmZXIgaXQsIGVsc2UgYWRkIHRvIGltbWVkaWF0ZSByZXF1ZXN0cyBhcnJheVxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGlzU3RhdGljQWN0aW9uID0gVGFibGVIZWxwZXIuX2lzU3RhdGljQWN0aW9uKG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHthY3Rpb25OYW1lfWApLCBhY3Rpb25OYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIWlzU3RhdGljQWN0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0cmlnZ2VyQWN0aW9uTmFtZSA9IGFjdGlvbk5hbWU7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lW2tleV1bbVNpZGVFZmZlY3QuZnVsbHlRdWFsaWZpZWROYW1lXVtcIlRyaWdnZXJBY3Rpb25cIl0gPSBhY3Rpb25OYW1lO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZVtrZXldW21TaWRlRWZmZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZV1bXCJUcmlnZ2VyQWN0aW9uXCJdID0gYWN0aW9uTmFtZTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChpc1NpZGVFZmZlY3RzV2l0aEN1cnJlbnRFbnRpdHlBc1RhcmdldCkge1xuXHRcdFx0XHRcdFx0XHRcdGFJbW1lZGlhdGVUYXJnZXRzID0gW107XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRhVGFyZ2V0czogYUltbWVkaWF0ZVRhcmdldHMsXG5cdFx0XHRcdFx0XHRcdFx0VHJpZ2dlckFjdGlvbjogdHJpZ2dlckFjdGlvbk5hbWVcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpbW1lZGlhdGVTaWRlRWZmZWN0c1Byb21pc2VzLnB1c2goXG5cdFx0XHRcdFx0XHRcdG9Db250cm9sbGVyLl9zaWRlRWZmZWN0cy5yZXF1ZXN0U2lkZUVmZmVjdHMoYVNpZGVFZmZlY3QsIG9Db250ZXh0LCBncm91cElkLCBmbkdldEltbWVkaWF0ZVRhcmdldHNBbmRBY3Rpb25zKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHRleHRQYXRocz8uW2tleV0gJiYgdGV4dFBhdGhzW2tleV0ubGVuZ3RoKSB7XG5cdFx0XHRpbW1lZGlhdGVTaWRlRWZmZWN0c1Byb21pc2VzLnB1c2gob1NpZGVFZmZlY3RzU2VydmljZS5yZXF1ZXN0U2lkZUVmZmVjdHModGV4dFBhdGhzW2tleV0sIG9TZWxlY3RlZENvbnRleHQsIGdyb3VwSWQpKTtcblx0XHR9XG5cdFx0cmV0dXJuIChQcm9taXNlIGFzIGFueSkuYWxsU2V0dGxlZChpbW1lZGlhdGVTaWRlRWZmZWN0c1Byb21pc2VzKTtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIHRoZSBtYXNzIGVkaXQgZGlhbG9nLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RhYmxlIEluc3RhbmNlIG9mIFRhYmxlXG5cdCAqIEBwYXJhbSBhQ29udGV4dHMgQ29udGV4dHMgZm9yIG1hc3MgZWRpdFxuXHQgKiBAcGFyYW0gb0NvbnRyb2xsZXIgQ29udHJvbGxlciBmb3IgdGhlIHZpZXdcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXR1cm5pbmcgaW5zdGFuY2Ugb2YgZGlhbG9nLlxuXHQgKi9cblx0Y3JlYXRlRGlhbG9nOiBhc3luYyBmdW5jdGlvbiAob1RhYmxlOiBUYWJsZSwgYUNvbnRleHRzOiBhbnlbXSwgb0NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyKTogUHJvbWlzZTxhbnk+IHtcblx0XHRjb25zdCBzRnJhZ21lbnROYW1lID0gXCJzYXAvZmUvY29yZS9jb250cm9scy9tYXNzRWRpdC9NYXNzRWRpdERpYWxvZ1wiLFxuXHRcdFx0YURhdGFBcnJheTogYW55W10gPSBbXSxcblx0XHRcdG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIiksXG5cdFx0XHRvRGVmYXVsdFZhbHVlcyA9IE1hc3NFZGl0SGVscGVyLmdldERlZmF1bHRUZXh0c0ZvckRpYWxvZyhvUmVzb3VyY2VCdW5kbGUsIGFDb250ZXh0cy5sZW5ndGgsIG9UYWJsZSksXG5cdFx0XHRvRGF0YUZpZWxkTW9kZWwgPSBNYXNzRWRpdEhlbHBlci5wcmVwYXJlRGF0YUZvckRpYWxvZyhvVGFibGUsIGFDb250ZXh0cywgYURhdGFBcnJheSksXG5cdFx0XHRkaWFsb2dDb250ZXh0ID0gTWFzc0VkaXRIZWxwZXIuZ2V0RGlhbG9nQ29udGV4dChvVGFibGUpLFxuXHRcdFx0b0RpYWxvZ0RhdGFNb2RlbCA9IE1hc3NFZGl0SGVscGVyLnNldFJ1bnRpbWVNb2RlbE9uRGlhbG9nKGFDb250ZXh0cywgYURhdGFBcnJheSwgb0RlZmF1bHRWYWx1ZXMsIGRpYWxvZ0NvbnRleHQpLFxuXHRcdFx0bW9kZWwgPSBvVGFibGUuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsLFxuXHRcdFx0bWV0YU1vZGVsID0gbW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRpdGVtc01vZGVsID0gbmV3IFRlbXBsYXRlTW9kZWwob0RhdGFGaWVsZE1vZGVsLmdldERhdGEoKSwgbWV0YU1vZGVsKTtcblxuXHRcdGNvbnN0IG9GcmFnbWVudCA9IFhNTFRlbXBsYXRlUHJvY2Vzc29yLmxvYWRUZW1wbGF0ZShzRnJhZ21lbnROYW1lLCBcImZyYWdtZW50XCIpO1xuXG5cdFx0Y29uc3Qgb0NyZWF0ZWRGcmFnbWVudCA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShcblx0XHRcdFhNTFByZXByb2Nlc3Nvci5wcm9jZXNzKFxuXHRcdFx0XHRvRnJhZ21lbnQsXG5cdFx0XHRcdHsgbmFtZTogc0ZyYWdtZW50TmFtZSB9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0XHRkYXRhRmllbGRNb2RlbDogaXRlbXNNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogbWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG1ldGFNb2RlbC5nZXRNZXRhUGF0aChkaWFsb2dDb250ZXh0LmdldFBhdGgoKSkpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRcdGRhdGFGaWVsZE1vZGVsOiBpdGVtc01vZGVsLFxuXHRcdFx0XHRcdFx0bWV0YU1vZGVsOiBtZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogbWV0YU1vZGVsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHQpXG5cdFx0KTtcblx0XHRjb25zdCBvRGlhbG9nQ29udGVudCA9IGF3YWl0IEZyYWdtZW50LmxvYWQoeyBkZWZpbml0aW9uOiBvQ3JlYXRlZEZyYWdtZW50IH0pO1xuXHRcdGNvbnN0IG9EaWFsb2cgPSBuZXcgRGlhbG9nKHtcblx0XHRcdHJlc2l6YWJsZTogdHJ1ZSxcblx0XHRcdHRpdGxlOiBvRGVmYXVsdFZhbHVlcy5tYXNzRWRpdFRpdGxlLFxuXHRcdFx0Y29udGVudDogW29EaWFsb2dDb250ZW50IGFzIGFueV0sXG5cdFx0XHRhZnRlck9wZW46IE1hc3NFZGl0SGVscGVyLm9uRGlhbG9nT3Blbixcblx0XHRcdGJlZ2luQnV0dG9uOiBuZXcgQnV0dG9uKHtcblx0XHRcdFx0dGV4dDogTWFzc0VkaXRIZWxwZXIuaGVscGVycy5nZXRFeHBCaW5kaW5nRm9yQXBwbHlCdXR0b25UeHQob0RlZmF1bHRWYWx1ZXMsIG9EYXRhRmllbGRNb2RlbC5nZXRPYmplY3QoXCIvXCIpKSxcblx0XHRcdFx0dHlwZTogXCJFbXBoYXNpemVkXCIsXG5cdFx0XHRcdHByZXNzOiBhc3luYyBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0XHRcdChvQ29udHJvbGxlci5nZXRWaWV3KCk/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpPy5zZXRQcm9wZXJ0eShcInNraXBQYXRjaEhhbmRsZXJzXCIsIHRydWUpO1xuXHRcdFx0XHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvQ29udHJvbGxlci5nZXRWaWV3KCkpO1xuXHRcdFx0XHRcdGNvbnN0IG9JbkRpYWxvZyA9IG9FdmVudC5nZXRTb3VyY2UoKS5nZXRQYXJlbnQoKTtcblx0XHRcdFx0XHRjb25zdCBvTW9kZWwgPSBvSW5EaWFsb2cuZ2V0TW9kZWwoXCJmaWVsZHNJbmZvXCIpO1xuXHRcdFx0XHRcdGNvbnN0IGFSZXN1bHRzID0gb01vZGVsLmdldFByb3BlcnR5KFwiL3Jlc3VsdHNcIik7XG5cblx0XHRcdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1RhYmxlICYmIChvVGFibGUuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsKS5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0XHRcdHNDdXJyZW50RW50aXR5U2V0TmFtZSA9IG9UYWJsZS5kYXRhKFwibWV0YVBhdGhcIiksXG5cdFx0XHRcdFx0XHRvRW50aXR5U2V0Q29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0Q29udGV4dChzQ3VycmVudEVudGl0eVNldE5hbWUpO1xuXHRcdFx0XHRcdGNvbnN0IGVycm9yQ29udGV4dHM6IGFueVtdID0gW107XG5cdFx0XHRcdFx0Y29uc3QgdGV4dFBhdGhzID0gb01vZGVsLmdldFByb3BlcnR5KFwiL3RleHRQYXRoc1wiKTtcblx0XHRcdFx0XHRjb25zdCBhUHJvcGVydHlSZWFkYWJsZUluZm8gPSBvTW9kZWwuZ2V0UHJvcGVydHkoXCIvcmVhZGFibGVQcm9wZXJ0eURhdGFcIik7XG5cdFx0XHRcdFx0bGV0IGdyb3VwSWQ6IHN0cmluZztcblx0XHRcdFx0XHRsZXQgYWxsU2lkZUVmZmVjdHM6IGFueVtdO1xuXHRcdFx0XHRcdGNvbnN0IG1hc3NFZGl0UHJvbWlzZXM6IGFueSA9IFtdO1xuXHRcdFx0XHRcdGNvbnN0IGZhaWxlZEZpZWxkc0RhdGE6IGFueSA9IHt9O1xuXHRcdFx0XHRcdGNvbnN0IHNlbGVjdGVkUm93c0xlbmd0aCA9IGFDb250ZXh0cy5sZW5ndGg7XG5cdFx0XHRcdFx0Y29uc3QgZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWU6IGFueSA9IHt9O1xuXHRcdFx0XHRcdGNvbnN0IGJhc2VTaWRlRWZmZWN0c01hcEFycmF5ID0gTWFzc0VkaXRIZWxwZXIuZ2V0U2lkZUVmZmVjdERhdGFGb3JLZXkoXG5cdFx0XHRcdFx0XHRvRW50aXR5U2V0Q29udGV4dCxcblx0XHRcdFx0XHRcdGFwcENvbXBvbmVudCxcblx0XHRcdFx0XHRcdG9Db250cm9sbGVyLFxuXHRcdFx0XHRcdFx0YVJlc3VsdHNcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdC8vY29uc3QgY2hhbmdlUHJvbWlzZTogYW55W10gPSBbXTtcblx0XHRcdFx0XHQvL2xldCBiUmVhZE9ubHlGaWVsZCA9IGZhbHNlO1xuXHRcdFx0XHRcdC8vY29uc3QgZXJyb3JDb250ZXh0czogb2JqZWN0W10gPSBbXTtcblxuXHRcdFx0XHRcdGFDb250ZXh0cy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VsZWN0ZWRDb250ZXh0OiBhbnksIGlkeDogbnVtYmVyKSB7XG5cdFx0XHRcdFx0XHRhbGxTaWRlRWZmZWN0cyA9IFtdO1xuXHRcdFx0XHRcdFx0YVJlc3VsdHMuZm9yRWFjaChhc3luYyBmdW5jdGlvbiAob1Jlc3VsdDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdGlmICghZmFpbGVkRmllbGRzRGF0YS5oYXNPd25Qcm9wZXJ0eShvUmVzdWx0LmtleVZhbHVlKSkge1xuXHRcdFx0XHRcdFx0XHRcdGZhaWxlZEZpZWxkc0RhdGFbb1Jlc3VsdC5rZXlWYWx1ZV0gPSAwO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8vVE9ETyAtIEFkZCBzYXZlIGltcGxlbWVudGF0aW9uIGZvciBWYWx1ZSBIZWxwLlxuXHRcdFx0XHRcdFx0XHRpZiAoYmFzZVNpZGVFZmZlY3RzTWFwQXJyYXlbb1Jlc3VsdC5rZXlWYWx1ZV0pIHtcblx0XHRcdFx0XHRcdFx0XHRhbGxTaWRlRWZmZWN0c1tvUmVzdWx0LmtleVZhbHVlXSA9IGJhc2VTaWRlRWZmZWN0c01hcEFycmF5W29SZXN1bHQua2V5VmFsdWVdO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGFQcm9wZXJ0eVJlYWRhYmxlSW5mbykge1xuXHRcdFx0XHRcdFx0XHRcdGFQcm9wZXJ0eVJlYWRhYmxlSW5mby5zb21lKGZ1bmN0aW9uIChvUHJvcGVydHlJbmZvOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChvUmVzdWx0LmtleVZhbHVlID09PSBvUHJvcGVydHlJbmZvLnByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHlJbmZvLnR5cGUgPT09IFwiRGVmYXVsdFwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9Qcm9wZXJ0eUluZm8udmFsdWUgPT09IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mby50eXBlID09PSBcIlBhdGhcIiAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9Qcm9wZXJ0eUluZm8ucHJvcGVydHlWYWx1ZSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9Qcm9wZXJ0eUluZm8ucHJvcGVydHlQYXRoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvU2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChvUHJvcGVydHlJbmZvLnByb3BlcnR5UGF0aCkgPT09IG9Qcm9wZXJ0eUluZm8ucHJvcGVydHlWYWx1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGdyb3VwSWQgPSBgJGF1dG8uJHtpZHh9YDtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb0ZpZWxkUHJvbWlzZSA9IG9TZWxlY3RlZENvbnRleHRcblx0XHRcdFx0XHRcdFx0XHQuc2V0UHJvcGVydHkob1Jlc3VsdC5rZXlWYWx1ZSwgb1Jlc3VsdC52YWx1ZSwgZ3JvdXBJZClcblx0XHRcdFx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRlcnJvckNvbnRleHRzLnB1c2gob1NlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QoKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJNYXNzIEVkaXQ6IFNvbWV0aGluZyB3ZW50IHdyb25nIGluIHVwZGF0aW5nIGVudHJpZXMuXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0XHRcdFx0XHRmYWlsZWRGaWVsZHNEYXRhW29SZXN1bHQua2V5VmFsdWVdID0gZmFpbGVkRmllbGRzRGF0YVtvUmVzdWx0LmtleVZhbHVlXSArIDE7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoeyBpc0ZpZWxkVXBkYXRlRmFpbGVkOiB0cnVlIH0pO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGRhdGFUb1VwZGF0ZUZpZWxkQW5kU2lkZUVmZmVjdHM6IERhdGFUb1VwZGF0ZUZpZWxkQW5kU2lkZUVmZmVjdHNUeXBlID0ge1xuXHRcdFx0XHRcdFx0XHRcdG9Db250cm9sbGVyLFxuXHRcdFx0XHRcdFx0XHRcdG9GaWVsZFByb21pc2UsXG5cdFx0XHRcdFx0XHRcdFx0c2lkZUVmZmVjdHNNYXA6IGJhc2VTaWRlRWZmZWN0c01hcEFycmF5W29SZXN1bHQua2V5VmFsdWVdLFxuXHRcdFx0XHRcdFx0XHRcdHRleHRQYXRocyxcblx0XHRcdFx0XHRcdFx0XHRncm91cElkLFxuXHRcdFx0XHRcdFx0XHRcdGtleTogb1Jlc3VsdC5rZXlWYWx1ZSxcblx0XHRcdFx0XHRcdFx0XHRvRW50aXR5U2V0Q29udGV4dCxcblx0XHRcdFx0XHRcdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRcdG9TZWxlY3RlZENvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFx0ZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWVcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0bWFzc0VkaXRQcm9taXNlcy5wdXNoKFxuXHRcdFx0XHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLmhhbmRsZU1hc3NFZGl0RmllbGRVcGRhdGVBbmRSZXF1ZXN0U2lkZUVmZmVjdHMoZGF0YVRvVXBkYXRlRmllbGRBbmRTaWRlRWZmZWN0cylcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0YXdhaXQgKFByb21pc2UgYXMgYW55KVxuXHRcdFx0XHRcdFx0LmFsbFNldHRsZWQobWFzc0VkaXRQcm9taXNlcylcblx0XHRcdFx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0Z3JvdXBJZCA9IGAkYXV0by5tYXNzRWRpdERlZmVycmVkYDtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZGVmZXJyZWRSZXF1ZXN0cyA9IFtdO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzaWRlRWZmZWN0c0RhdGFGb3JBbGxLZXlzOiBhbnkgPSBPYmplY3QudmFsdWVzKGRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lKTtcblx0XHRcdFx0XHRcdFx0Y29uc3Qga2V5c1dpdGhTaWRlRWZmZWN0czogYW55W10gPSBPYmplY3Qua2V5cyhkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZSk7XG5cblx0XHRcdFx0XHRcdFx0c2lkZUVmZmVjdHNEYXRhRm9yQWxsS2V5cy5mb3JFYWNoKChhU2lkZUVmZmVjdDogYW55LCBpbmRleDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgY3VycmVudEtleSA9IGtleXNXaXRoU2lkZUVmZmVjdHNbaW5kZXhdO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChmYWlsZWRGaWVsZHNEYXRhW2N1cnJlbnRLZXldICE9PSBzZWxlY3RlZFJvd3NMZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGRlZmVycmVkU2lkZUVmZmVjdHNEYXRhID0gT2JqZWN0LnZhbHVlcyhhU2lkZUVmZmVjdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRkZWZlcnJlZFNpZGVFZmZlY3RzRGF0YS5mb3JFYWNoKChyZXE6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCB7IGFUYXJnZXRzLCBvQ29udGV4dCwgVHJpZ2dlckFjdGlvbiwgbVNpZGVFZmZlY3QgfSA9IHJlcTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgZm5HZXREZWZlcnJlZFRhcmdldHMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGFUYXJnZXRzO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBmbkdldERlZmVycmVkVGFyZ2V0c0FuZEFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFUYXJnZXRzOiBmbkdldERlZmVycmVkVGFyZ2V0cygpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0VHJpZ2dlckFjdGlvbjogVHJpZ2dlckFjdGlvblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmZXJyZWRSZXF1ZXN0cy5wdXNoKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIGlmIHNvbWUgZGVmZXJyZWQgaXMgcmVqZWN0ZWQsIGl0IHdpbGwgYmUgYWRkIHRvIGZhaWxlZCBxdWV1ZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9Db250cm9sbGVyLl9zaWRlRWZmZWN0cy5yZXF1ZXN0U2lkZUVmZmVjdHMoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtU2lkZUVmZmVjdCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Z3JvdXBJZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZuR2V0RGVmZXJyZWRUYXJnZXRzQW5kQWN0aW9uc1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRNYXNzRWRpdEhlbHBlci5tZXNzYWdlSGFuZGxpbmdGb3JNYXNzRWRpdChvVGFibGUsIGFDb250ZXh0cywgb0NvbnRyb2xsZXIsIG9JbkRpYWxvZywgYVJlc3VsdHMsIGVycm9yQ29udGV4dHMpO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC5jYXRjaCgoZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLmNsb3NlRGlhbG9nKG9EaWFsb2cpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSksXG5cdFx0XHRlbmRCdXR0b246IG5ldyBCdXR0b24oe1xuXHRcdFx0XHR0ZXh0OiBvRGVmYXVsdFZhbHVlcy5jYW5jZWxCdXR0b25UZXh0LFxuXHRcdFx0XHR2aXNpYmxlOiBNYXNzRWRpdEhlbHBlci5oZWxwZXJzLmhhc0VkaXRhYmxlRmllbGRzQmluZGluZyhvRGF0YUZpZWxkTW9kZWwuZ2V0T2JqZWN0KFwiL1wiKSwgdHJ1ZSksXG5cdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBvSW5EaWFsb2cgPSBvRXZlbnQuZ2V0U291cmNlKCkuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdFx0TWFzc0VkaXRIZWxwZXIuY2xvc2VEaWFsb2cob0luRGlhbG9nKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9KTtcblx0XHRvRGlhbG9nLnNldE1vZGVsKG9EaWFsb2dEYXRhTW9kZWwsIFwiZmllbGRzSW5mb1wiKTtcblx0XHRvRGlhbG9nLnNldE1vZGVsKG1vZGVsKTtcblx0XHRvRGlhbG9nLnNldEJpbmRpbmdDb250ZXh0KGRpYWxvZ0NvbnRleHQpO1xuXHRcdHJldHVybiBvRGlhbG9nO1xuXHR9LFxuXG5cdGhlbHBlcnM6IHtcblx0XHRnZXRCaW5kaW5nRXhwRm9ySGFzRWRpdGFibGVGaWVsZHM6IChmaWVsZHM6IGFueSwgZWRpdGFibGU6IGJvb2xlYW4pID0+IHtcblx0XHRcdGNvbnN0IHRvdGFsRXhwID0gZmllbGRzLnJlZHVjZShcblx0XHRcdFx0KGV4cHJlc3Npb246IGFueSwgZmllbGQ6IGFueSkgPT5cblx0XHRcdFx0XHRvcihcblx0XHRcdFx0XHRcdGV4cHJlc3Npb24sXG5cdFx0XHRcdFx0XHRwYXRoSW5Nb2RlbChcIi92YWx1ZXMvXCIgKyBmaWVsZC5kYXRhUHJvcGVydHkgKyBcIi92aXNpYmxlXCIsIFwiZmllbGRzSW5mb1wiKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5cblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRjb25zdGFudChmYWxzZSlcblx0XHRcdCk7XG5cdFx0XHRyZXR1cm4gZWRpdGFibGUgPyB0b3RhbEV4cCA6IG5vdCh0b3RhbEV4cCk7XG5cdFx0fSxcblxuXHRcdGdldEV4cEJpbmRpbmdGb3JBcHBseUJ1dHRvblR4dDogKGRlZmF1bHRWYWx1ZXM6IGFueSwgZmllbGRzOiBib29sZWFuKSA9PiB7XG5cdFx0XHRjb25zdCBlZGl0YWJsZUV4cCA9IE1hc3NFZGl0SGVscGVyLmhlbHBlcnMuZ2V0QmluZGluZ0V4cEZvckhhc0VkaXRhYmxlRmllbGRzKGZpZWxkcywgdHJ1ZSk7XG5cdFx0XHRjb25zdCB0b3RhbEV4cCA9IGlmRWxzZShlZGl0YWJsZUV4cCwgY29uc3RhbnQoZGVmYXVsdFZhbHVlcy5hcHBseUJ1dHRvblRleHQpLCBjb25zdGFudChkZWZhdWx0VmFsdWVzLm9rQnV0dG9uVGV4dCkpO1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKHRvdGFsRXhwKTtcblx0XHR9LFxuXG5cdFx0aGFzRWRpdGFibGVGaWVsZHNCaW5kaW5nOiAoZmllbGRzOiBhbnksIGVkaXRhYmxlOiBib29sZWFuKSA9PiB7XG5cdFx0XHRjb25zdCByZXQgPSBjb21waWxlRXhwcmVzc2lvbihNYXNzRWRpdEhlbHBlci5oZWxwZXJzLmdldEJpbmRpbmdFeHBGb3JIYXNFZGl0YWJsZUZpZWxkcyhmaWVsZHMsIGVkaXRhYmxlKSk7XG5cdFx0XHRpZiAocmV0ID09PSBcInRydWVcIikge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAocmV0ID09PSBcImZhbHNlXCIpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHJldDtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IE1hc3NFZGl0SGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUE2RUEsTUFBTUEsY0FBYyxHQUFHO0lBQ3RCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsMkJBQTJCLEVBQUUsVUFBVUMsS0FBYSxFQUFFQyxPQUFZLEVBQTJCO01BQzVGLElBQUlDLFVBQWU7TUFDbkIsSUFBSUMsS0FBSyxHQUFHLENBQUM7TUFDYixNQUFNQyxNQUFNLEdBQUdKLEtBQUssQ0FBQ0ssS0FBSyxDQUFDLEdBQUcsQ0FBQztNQUMvQixJQUFJQyxTQUFTLEdBQUcsRUFBRTtNQUNsQkYsTUFBTSxDQUFDRyxPQUFPLENBQUMsVUFBVUMsYUFBcUIsRUFBRTtRQUMvQyxJQUFJLENBQUNQLE9BQU8sQ0FBQ08sYUFBYSxDQUFDLElBQUlMLEtBQUssS0FBSyxDQUFDLEVBQUU7VUFDM0NG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