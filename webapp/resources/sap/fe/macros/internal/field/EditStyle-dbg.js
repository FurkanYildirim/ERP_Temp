/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/PropertyFormatters", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/valuehelp/ValueHelpTemplating", "../../field/FieldHelper"], function (BuildingBlockTemplateProcessor, MetaModelConverter, StableIdHelper, PropertyFormatters, UIFormatter, FieldTemplating, ValueHelpTemplating, FieldHelper) {
  "use strict";

  var getTextAlignment = FieldTemplating.getTextAlignment;
  var getMultipleLinesForDataField = FieldTemplating.getMultipleLinesForDataField;
  var getRelativePropertyPath = PropertyFormatters.getRelativePropertyPath;
  var generate = StableIdHelper.generate;
  var xml = BuildingBlockTemplateProcessor.xml;
  const EditStyle = {
    /**
     * An internal helper to retrieve the reused layout data.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getLayoutData(internalField) {
      let layoutData = "";
      if (internalField.collaborationEnabled) {
        layoutData = xml`<layoutData>
				<FlexItemData growFactor="9" />
			</layoutData>`;
      }
      return layoutData;
    },
    /**
     * Generates a template for one of the pickers reference in the type.
     *
     * @param internalField Reference to the current internal field instance
     * @param type Reference to one of the edit style picker types
     * @returns An XML-based string with the definition of the field control
     */
    getDateTimePickerGeneric(internalField, type) {
      const dataModelObjectPath = MetaModelConverter.getInvolvedDataModelObjects(internalField.dataField, internalField.entitySet);
      const textAlign = getTextAlignment(dataModelObjectPath, internalField.formatOptions, internalField.editModeAsObject);
      return xml`<${type}
			xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
			xmlns="sap.m"
			xmlns:core="sap.ui.core"
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
			log:sourcePath="${internalField.dataSourcePath}"
			id="${internalField.editStyleId}"
			width="100%"
			editable="${internalField.editableExpression}"
			enabled="${internalField.enabledExpression}"
			required="${internalField.requiredExpression}"
			change="${type === "DateTimePicker" ? internalField.onChange || "FieldRuntime.handleChange($controller, $event)" : "FieldRuntime.handleChange($controller, $event)"}"
			textAlign="${textAlign}"
			validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
			ariaLabelledBy="${internalField.ariaLabelledBy}"
			value="${internalField.valueBindingExpression}"
			fieldGroupIds="${internalField.fieldGroupIds}"
			showTimezone="${internalField.showTimezone}"
			afterValueHelpOpen="${internalField.collaborationEnabled ? "FieldRuntime.handleOpenPicker" : undefined}"
			afterValueHelpClose="${internalField.collaborationEnabled ? "FieldRuntime.handleClosePicker" : undefined}"
			liveChange="${internalField.collaborationEnabled ? "FieldRuntime.handleLiveChange" : undefined}"
	>

	</${type}>
	`;
    },
    /**
     * Generates the Input template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getInputTemplate(internalField) {
      const dataModelObjectPath = MetaModelConverter.getInvolvedDataModelObjects(internalField.dataField, internalField.entitySet);
      const textAlign = getTextAlignment(dataModelObjectPath, internalField.formatOptions, internalField.editModeAsObject);
      return xml`
			<Input
				xmlns="sap.m"
				xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
				log:sourcePath="${internalField.dataSourcePath}"
		        core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				id="${internalField.editStyleId}"
				value="${internalField.valueBindingExpression}"
				placeholder="${internalField.editStylePlaceholder}"
				width="100%"
				editable="${internalField.editableExpression}"
				enabled="${internalField.enabledExpression}"
				required="${internalField.requiredExpression}"
				change="FieldRuntime.handleChange($controller, $event)"
				liveChange="${internalField.collaborationEnabled ? "FieldRuntime.handleLiveChange" : undefined}"
				fieldGroupIds="${internalField.fieldGroupIds}"
				textAlign="${textAlign}"
				validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
				ariaLabelledBy="${internalField.ariaLabelledBy}"
			>
				${EditStyle.getLayoutData(internalField)}
			</Input>`;
    },
    /**
     * Generates the InputWithUnit template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getInputWithUnitTemplate(internalField) {
      const dataModelObjectPath = MetaModelConverter.getInvolvedDataModelObjects(internalField.dataField, internalField.entitySet);
      const textAlign = getTextAlignment(dataModelObjectPath, internalField.formatOptions, internalField.editModeAsObject);
      if (internalField.staticUnit === undefined) {
        return xml`
			<Input
				xmlns="sap.m"
				xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
				log:sourcePath="${internalField.dataSourcePath}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				id="${internalField.editStyleId}"
				value="${internalField.valueBindingExpression}"
				width="${internalField.valueInputWidth}"
				fieldWidth="${internalField.valueInputFieldWidth}"
				description="${internalField.descriptionBindingExpression}"
				editable="${internalField.editableExpression}"
				enabled="${internalField.enabledExpression}"
				required="${internalField.requiredExpression}"
				change="FieldRuntime.handleChange($controller, $event)"
				liveChange="${internalField.collaborationEnabled ? "FieldRuntime.handleLiveChange" : undefined}"
				textAlign="${textAlign}"
				fieldGroupIds="${internalField.fieldGroupIds}"
				validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
			>
				${EditStyle.getLayoutData(internalField)}
			</Input>
			<Input
				xmlns="sap.m"
				xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
				log:sourcePath="${internalField.dataSourcePath}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				id="${internalField.idPrefix ? generate([internalField.idPrefix, "Field-unitEdit"]) : undefined}"
				value="${internalField.unitBindingExpression}"
				width="30%"
				editable="${internalField.unitEditable}"
				enabled="${internalField.enabledExpression}"
				change="FieldRuntime.handleChange($controller, $event)"
				liveChange="${internalField.collaborationEnabled ? "FieldRuntime.handleLiveChange" : undefined}"
				textAlign="Begin"
				fieldGroupIds="${internalField.fieldGroupIds}"
				validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
				visible="${internalField.unitInputVisible}"
			>
				${EditStyle.getLayoutData(internalField)}
			</Input>
			`;
      } else {
        return xml`
			<Input
				xmlns="sap.m"
				xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
				log:sourcePath="${internalField.dataSourcePath}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				id="${internalField.editStyleId}"
				value="${internalField.valueBindingExpression}"
				placeholder="${internalField.editStylePlaceholder}"
				width="100%"
				fieldWidth="70%"
				description="${internalField.staticUnit}"
				editable="${internalField.editableExpression}"
				enabled="${internalField.enabledExpression}"
				required="${internalField.requiredExpression}"
				change="FieldRuntime.handleChange($controller, $event)"
				liveChange="${internalField.collaborationEnabled ? "FieldRuntime.handleLiveChange" : undefined}"
				textAlign="${textAlign}"
				fieldGroupIds="${internalField.fieldGroupIds}"
				validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
			>
				${EditStyle.getLayoutData(internalField)}
			</Input>`;
      }
    },
    /**
     * Generates the InputWithValueHelp template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getInputWithValueHelpTemplate(internalField) {
      var _property$annotations, _property$annotations2;
      const dataFieldDataModelObjectPath = MetaModelConverter.getInvolvedDataModelObjects(internalField.dataField, internalField.entitySet);
      const property = dataFieldDataModelObjectPath.targetObject.Value.$target;
      const delegate = FieldHelper.computeFieldBaseDelegate("sap/fe/macros/field/FieldBaseDelegate", internalField.formatOptions.retrieveTextFromValueList);
      const display = UIFormatter.getFieldDisplay(property, internalField.formatOptions.displayMode, internalField.editModeAsObject);
      const multipleLines = getMultipleLinesForDataField(internalField, property.type, (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : _property$annotations.UI.MultiLineText);
      const propertyContext = internalField.dataField.getModel().createBindingContext("Value", internalField.dataField);
      const valueHelpPropertyContext = internalField.dataField.getModel().createBindingContext(FieldHelper.valueHelpProperty(propertyContext));
      const fieldHelp = ValueHelpTemplating.generateID(internalField._vhFlexId, internalField.vhIdPrefix, getRelativePropertyPath(propertyContext, {
        context: propertyContext
      }), getRelativePropertyPath(valueHelpPropertyContext, {
        context: valueHelpPropertyContext
      }));
      const textAlign = getTextAlignment(dataFieldDataModelObjectPath, internalField.formatOptions, internalField.editModeAsObject);
      const label = FieldHelper.computeLabelText(internalField, {
        context: internalField.dataField
      });
      let optionalContentEdit = "";
      if (property.type === "Edm.String" && (_property$annotations2 = property.annotations) !== null && _property$annotations2 !== void 0 && _property$annotations2.UI.MultiLineText) {
        optionalContentEdit = xml`<mdc:contentEdit xmlns:mdc="sap.ui.mdc">
				<TextArea
					xmlns="sap.m"
					value="${internalField.valueBindingExpression}"
					required="${internalField.requiredExpression}"
					rows="${internalField.formatOptions.textLinesEdit}"
					growing="${internalField.formatOptions.textMaxLines > 0 ? true : undefined}"
					growingMaxLines="${internalField.formatOptions.textMaxLines}"
					width="100%"
					change="FieldRuntime.handleChange($controller, $event)"
					fieldGroupIds="${internalField.fieldGroupIds}"
				/>
			</mdc:contentEdit>`;
      }
      let optionalLayoutData = "";
      if (internalField.collaborationEnabled === true) {
        optionalLayoutData = xml`<mdc:layoutData xmlns:mdc="sap.ui.mdc">
				<FlexItemData xmlns="sap.m" growFactor="9" />
			</mdc:layoutData>`;
      }
      return xml`<mdc:Field
			xmlns:mdc="sap.ui.mdc"
			xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
			delegate="${delegate}"
			id="${internalField.editStyleId}"
			log:sourcePath="${internalField.dataSourcePath}"
			value="${internalField.valueBindingExpression}"
			placeholder="${internalField.editStylePlaceholder}"
			valueState="${internalField.valueState}"
			editMode="${internalField.editMode}"
			width="100%"
			required="${internalField.requiredExpression}"
			additionalValue="${internalField.textBindingExpression}"
			display="${display}"
			multipleLines="${multipleLines}"
			fieldHelp="${fieldHelp}"
			fieldGroupIds="${internalField.fieldGroupIds}"
			change="FieldRuntime.handleChange($controller, $event)"
			liveChange="${internalField.collaborationEnabled === true ? "FieldRuntime.handleLiveChange" : undefined}"
			textAlign="${textAlign}"
			validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
			ariaLabelledBy="${internalField.ariaLabelledBy}"
			label="${label}"
		>
			${optionalContentEdit}
			${optionalLayoutData}
		</mdc:Field>`;
    },
    /**
     * Generates the CheckBox template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getCheckBoxTemplate(internalField) {
      return xml`
		    <CheckBox
                xmlns="sap.m"
                xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		        macrodata:sourcePath="${internalField.dataSourcePath}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				id="${internalField.editStyleId}"
		        selected="${internalField.valueBindingExpression}"
		        editable="${internalField.editableExpression}"
		        enabled="${internalField.enabledExpression}"
		        select="FieldRuntime.handleChange($controller, $event)"
		        fieldGroupIds="${internalField.fieldGroupIds}"
		        validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
		        ariaLabelledBy="${internalField.ariaLabelledBy}"
	    />
        `;
    },
    /**
     * Generates the TextArea template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getTextAreaTemplate(internalField) {
      const liveChange = internalField.collaborationEnabled || internalField.formatOptions.textMaxLength ? "FieldRuntime.handleLiveChange" : undefined;
      const growing = internalField.formatOptions.textMaxLines ? true : false;

      //unfortunately this one is a "different" layoutData than the others, therefore the reuse function from above cannot be used for the textArea template
      let layoutData = "";
      if (internalField.collaborationEnabled) {
        layoutData = xml`<field:layoutData>
			<FlexItemData xmlns="sap.m" growFactor="9" />
		</field:layoutData>`;
      }
      return xml`<field:TextAreaEx
			xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
			xmlns:field="sap.fe.macros.field"
			xmlns:core="sap.ui.core"
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
			log:sourcePath="${internalField.dataSourcePath}"
			id="${internalField.editStyleId}"
			value="${internalField.valueBindingExpression}"
			placeholder="${internalField.editStylePlaceholder}"
			required="${internalField.requiredExpression}"
			rows="${internalField.formatOptions.textLinesEdit}"
			growing="${growing}"
			growingMaxLines="${internalField.formatOptions.textMaxLines}"
			width="100%"
			editable="${internalField.editableExpression}"
			enabled="${internalField.enabledExpression}"
			change="FieldRuntime.handleChange($controller, $event)"
			fieldGroupIds="${internalField.fieldGroupIds}"
			validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
			ariaLabelledBy="${internalField.ariaLabelledBy}"
			liveChange="${liveChange}"
			maxLength="${internalField.formatOptions.textMaxLength}"
			showExceededText="true"
		>
			${layoutData}
		</field:TextAreaEx>
		`;
    },
    /**
     * Generates the RatingIndicator template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getRatingIndicatorTemplate: internalField => {
      const tooltip = internalField.ratingIndicatorTooltip || "{sap.fe.i18n>T_COMMON_RATING_INDICATOR_TITLE_LABEL}";
      return xml`<RatingIndicator
			xmlns="sap.m"
			id="${internalField.editStyleId}"
			maxValue="${internalField.ratingIndicatorTargetValue}"
			value="${internalField.valueBindingExpression}"
			tooltip="${tooltip}"
			iconSize="1.375rem"
			class="sapUiTinyMarginTopBottom"
			editable="true"
		>
		${EditStyle.getLayoutData(internalField)}
		</RatingIndicator>
		`;
    },
    /**
     * Entry point for further templating processings.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getTemplate: internalField => {
      let innerFieldContent;
      switch (internalField.editStyle) {
        case "CheckBox":
          innerFieldContent = EditStyle.getCheckBoxTemplate(internalField);
          break;
        case "DatePicker":
        case "DateTimePicker":
        case "TimePicker":
          {
            innerFieldContent = EditStyle.getDateTimePickerGeneric(internalField, internalField.editStyle);
            break;
          }
        case "Input":
          {
            innerFieldContent = EditStyle.getInputTemplate(internalField);
            break;
          }
        case "InputWithUnit":
          {
            innerFieldContent = EditStyle.getInputWithUnitTemplate(internalField);
            break;
          }
        case "InputWithValueHelp":
          {
            innerFieldContent = EditStyle.getInputWithValueHelpTemplate(internalField);
            break;
          }
        case "RatingIndicator":
          innerFieldContent = EditStyle.getRatingIndicatorTemplate(internalField);
          break;
        case "TextArea":
          innerFieldContent = EditStyle.getTextAreaTemplate(internalField);
          break;
        default:
      }
      return innerFieldContent;
    }
  };
  return EditStyle;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFZGl0U3R5bGUiLCJnZXRMYXlvdXREYXRhIiwiaW50ZXJuYWxGaWVsZCIsImxheW91dERhdGEiLCJjb2xsYWJvcmF0aW9uRW5hYmxlZCIsInhtbCIsImdldERhdGVUaW1lUGlja2VyR2VuZXJpYyIsInR5cGUiLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwiTWV0YU1vZGVsQ29udmVydGVyIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiZGF0YUZpZWxkIiwiZW50aXR5U2V0IiwidGV4dEFsaWduIiwiZ2V0VGV4dEFsaWdubWVudCIsImZvcm1hdE9wdGlvbnMiLCJlZGl0TW9kZUFzT2JqZWN0IiwiZGF0YVNvdXJjZVBhdGgiLCJlZGl0U3R5bGVJZCIsImVkaXRhYmxlRXhwcmVzc2lvbiIsImVuYWJsZWRFeHByZXNzaW9uIiwicmVxdWlyZWRFeHByZXNzaW9uIiwib25DaGFuZ2UiLCJhcmlhTGFiZWxsZWRCeSIsInZhbHVlQmluZGluZ0V4cHJlc3Npb24iLCJmaWVsZEdyb3VwSWRzIiwic2hvd1RpbWV6b25lIiwidW5kZWZpbmVkIiwiZ2V0SW5wdXRUZW1wbGF0ZSIsImVkaXRTdHlsZVBsYWNlaG9sZGVyIiwiZ2V0SW5wdXRXaXRoVW5pdFRlbXBsYXRlIiwic3RhdGljVW5pdCIsInZhbHVlSW5wdXRXaWR0aCIsInZhbHVlSW5wdXRGaWVsZFdpZHRoIiwiZGVzY3JpcHRpb25CaW5kaW5nRXhwcmVzc2lvbiIsImlkUHJlZml4IiwiZ2VuZXJhdGUiLCJ1bml0QmluZGluZ0V4cHJlc3Npb24iLCJ1bml0RWRpdGFibGUiLCJ1bml0SW5wdXRWaXNpYmxlIiwiZ2V0SW5wdXRXaXRoVmFsdWVIZWxwVGVtcGxhdGUiLCJkYXRhRmllbGREYXRhTW9kZWxPYmplY3RQYXRoIiwicHJvcGVydHkiLCJ0YXJnZXRPYmplY3QiLCJWYWx1ZSIsIiR0YXJnZXQiLCJkZWxlZ2F0ZSIsIkZpZWxkSGVscGVyIiwiY29tcHV0ZUZpZWxkQmFzZURlbGVnYXRlIiwicmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCIsImRpc3BsYXkiLCJVSUZvcm1hdHRlciIsImdldEZpZWxkRGlzcGxheSIsImRpc3BsYXlNb2RlIiwibXVsdGlwbGVMaW5lcyIsImdldE11bHRpcGxlTGluZXNGb3JEYXRhRmllbGQiLCJhbm5vdGF0aW9ucyIsIlVJIiwiTXVsdGlMaW5lVGV4dCIsInByb3BlcnR5Q29udGV4dCIsImdldE1vZGVsIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJ2YWx1ZUhlbHBQcm9wZXJ0eUNvbnRleHQiLCJ2YWx1ZUhlbHBQcm9wZXJ0eSIsImZpZWxkSGVscCIsIlZhbHVlSGVscFRlbXBsYXRpbmciLCJnZW5lcmF0ZUlEIiwiX3ZoRmxleElkIiwidmhJZFByZWZpeCIsImdldFJlbGF0aXZlUHJvcGVydHlQYXRoIiwiY29udGV4dCIsImxhYmVsIiwiY29tcHV0ZUxhYmVsVGV4dCIsIm9wdGlvbmFsQ29udGVudEVkaXQiLCJ0ZXh0TGluZXNFZGl0IiwidGV4dE1heExpbmVzIiwib3B0aW9uYWxMYXlvdXREYXRhIiwidmFsdWVTdGF0ZSIsImVkaXRNb2RlIiwidGV4dEJpbmRpbmdFeHByZXNzaW9uIiwiZ2V0Q2hlY2tCb3hUZW1wbGF0ZSIsImdldFRleHRBcmVhVGVtcGxhdGUiLCJsaXZlQ2hhbmdlIiwidGV4dE1heExlbmd0aCIsImdyb3dpbmciLCJnZXRSYXRpbmdJbmRpY2F0b3JUZW1wbGF0ZSIsInRvb2x0aXAiLCJyYXRpbmdJbmRpY2F0b3JUb29sdGlwIiwicmF0aW5nSW5kaWNhdG9yVGFyZ2V0VmFsdWUiLCJnZXRUZW1wbGF0ZSIsImlubmVyRmllbGRDb250ZW50IiwiZWRpdFN0eWxlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJFZGl0U3R5bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0UmVsYXRpdmVQcm9wZXJ0eVBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUZvcm1hdHRlcnNcIjtcbmltcG9ydCAqIGFzIFVJRm9ybWF0dGVyIGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHsgTWV0YU1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHsgZ2V0TXVsdGlwbGVMaW5lc0ZvckRhdGFGaWVsZCwgZ2V0VGV4dEFsaWdubWVudCB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuaW1wb3J0ICogYXMgVmFsdWVIZWxwVGVtcGxhdGluZyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVmFsdWVIZWxwVGVtcGxhdGluZ1wiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgRmllbGRIZWxwZXIgZnJvbSBcIi4uLy4uL2ZpZWxkL0ZpZWxkSGVscGVyXCI7XG5pbXBvcnQgSW50ZXJuYWxGaWVsZEJsb2NrIGZyb20gXCIuLi9JbnRlcm5hbEZpZWxkLmJsb2NrXCI7XG5cbmNvbnN0IEVkaXRTdHlsZSA9IHtcblx0LyoqXG5cdCAqIEFuIGludGVybmFsIGhlbHBlciB0byByZXRyaWV2ZSB0aGUgcmV1c2VkIGxheW91dCBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRMYXlvdXREYXRhKGludGVybmFsRmllbGQ6IEludGVybmFsRmllbGRCbG9jaykge1xuXHRcdGxldCBsYXlvdXREYXRhID0gXCJcIjtcblx0XHRpZiAoaW50ZXJuYWxGaWVsZC5jb2xsYWJvcmF0aW9uRW5hYmxlZCkge1xuXHRcdFx0bGF5b3V0RGF0YSA9IHhtbGA8bGF5b3V0RGF0YT5cblx0XHRcdFx0PEZsZXhJdGVtRGF0YSBncm93RmFjdG9yPVwiOVwiIC8+XG5cdFx0XHQ8L2xheW91dERhdGE+YDtcblx0XHR9XG5cdFx0cmV0dXJuIGxheW91dERhdGE7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlcyBhIHRlbXBsYXRlIGZvciBvbmUgb2YgdGhlIHBpY2tlcnMgcmVmZXJlbmNlIGluIHRoZSB0eXBlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2Vcblx0ICogQHBhcmFtIHR5cGUgUmVmZXJlbmNlIHRvIG9uZSBvZiB0aGUgZWRpdCBzdHlsZSBwaWNrZXIgdHlwZXNcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXREYXRlVGltZVBpY2tlckdlbmVyaWMoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrLCB0eXBlOiBcIkRhdGVQaWNrZXJcIiB8IFwiRGF0ZVRpbWVQaWNrZXJcIiB8IFwiVGltZVBpY2tlclwiKSB7XG5cdFx0Y29uc3QgZGF0YU1vZGVsT2JqZWN0UGF0aCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoaW50ZXJuYWxGaWVsZC5kYXRhRmllbGQsIGludGVybmFsRmllbGQuZW50aXR5U2V0KTtcblx0XHRjb25zdCB0ZXh0QWxpZ24gPSBnZXRUZXh0QWxpZ25tZW50KGRhdGFNb2RlbE9iamVjdFBhdGgsIGludGVybmFsRmllbGQuZm9ybWF0T3B0aW9ucywgaW50ZXJuYWxGaWVsZC5lZGl0TW9kZUFzT2JqZWN0KTtcblxuXHRcdHJldHVybiB4bWxgPCR7dHlwZX1cblx0XHRcdHhtbG5zOmxvZz1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIlxuXHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHR4bWxuczpjb3JlPVwic2FwLnVpLmNvcmVcIlxuXHRcdFx0Y29yZTpyZXF1aXJlPVwie0ZpZWxkUnVudGltZTogJ3NhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lJ31cIlxuXHRcdFx0bG9nOnNvdXJjZVBhdGg9XCIke2ludGVybmFsRmllbGQuZGF0YVNvdXJjZVBhdGh9XCJcblx0XHRcdGlkPVwiJHtpbnRlcm5hbEZpZWxkLmVkaXRTdHlsZUlkfVwiXG5cdFx0XHR3aWR0aD1cIjEwMCVcIlxuXHRcdFx0ZWRpdGFibGU9XCIke2ludGVybmFsRmllbGQuZWRpdGFibGVFeHByZXNzaW9ufVwiXG5cdFx0XHRlbmFibGVkPVwiJHtpbnRlcm5hbEZpZWxkLmVuYWJsZWRFeHByZXNzaW9ufVwiXG5cdFx0XHRyZXF1aXJlZD1cIiR7aW50ZXJuYWxGaWVsZC5yZXF1aXJlZEV4cHJlc3Npb259XCJcblx0XHRcdGNoYW5nZT1cIiR7XG5cdFx0XHRcdHR5cGUgPT09IFwiRGF0ZVRpbWVQaWNrZXJcIlxuXHRcdFx0XHRcdD8gaW50ZXJuYWxGaWVsZC5vbkNoYW5nZSB8fCBcIkZpZWxkUnVudGltZS5oYW5kbGVDaGFuZ2UoJGNvbnRyb2xsZXIsICRldmVudClcIlxuXHRcdFx0XHRcdDogXCJGaWVsZFJ1bnRpbWUuaGFuZGxlQ2hhbmdlKCRjb250cm9sbGVyLCAkZXZlbnQpXCJcblx0XHRcdH1cIlxuXHRcdFx0dGV4dEFsaWduPVwiJHt0ZXh0QWxpZ259XCJcblx0XHRcdHZhbGlkYXRlRmllbGRHcm91cD1cIkZpZWxkUnVudGltZS5vblZhbGlkYXRlRmllbGRHcm91cCgkY29udHJvbGxlciwgJGV2ZW50KVwiXG5cdFx0XHRhcmlhTGFiZWxsZWRCeT1cIiR7aW50ZXJuYWxGaWVsZC5hcmlhTGFiZWxsZWRCeX1cIlxuXHRcdFx0dmFsdWU9XCIke2ludGVybmFsRmllbGQudmFsdWVCaW5kaW5nRXhwcmVzc2lvbn1cIlxuXHRcdFx0ZmllbGRHcm91cElkcz1cIiR7aW50ZXJuYWxGaWVsZC5maWVsZEdyb3VwSWRzfVwiXG5cdFx0XHRzaG93VGltZXpvbmU9XCIke2ludGVybmFsRmllbGQuc2hvd1RpbWV6b25lfVwiXG5cdFx0XHRhZnRlclZhbHVlSGVscE9wZW49XCIke2ludGVybmFsRmllbGQuY29sbGFib3JhdGlvbkVuYWJsZWQgPyBcIkZpZWxkUnVudGltZS5oYW5kbGVPcGVuUGlja2VyXCIgOiB1bmRlZmluZWR9XCJcblx0XHRcdGFmdGVyVmFsdWVIZWxwQ2xvc2U9XCIke2ludGVybmFsRmllbGQuY29sbGFib3JhdGlvbkVuYWJsZWQgPyBcIkZpZWxkUnVudGltZS5oYW5kbGVDbG9zZVBpY2tlclwiIDogdW5kZWZpbmVkfVwiXG5cdFx0XHRsaXZlQ2hhbmdlPVwiJHtpbnRlcm5hbEZpZWxkLmNvbGxhYm9yYXRpb25FbmFibGVkID8gXCJGaWVsZFJ1bnRpbWUuaGFuZGxlTGl2ZUNoYW5nZVwiIDogdW5kZWZpbmVkfVwiXG5cdD5cblxuXHQ8LyR7dHlwZX0+XG5cdGA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlcyB0aGUgSW5wdXQgdGVtcGxhdGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBpbnRlcm5hbEZpZWxkIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBpbnRlcm5hbCBmaWVsZCBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldElucHV0VGVtcGxhdGUoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrKSB7XG5cdFx0Y29uc3QgZGF0YU1vZGVsT2JqZWN0UGF0aCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoaW50ZXJuYWxGaWVsZC5kYXRhRmllbGQsIGludGVybmFsRmllbGQuZW50aXR5U2V0KTtcblx0XHRjb25zdCB0ZXh0QWxpZ24gPSBnZXRUZXh0QWxpZ25tZW50KGRhdGFNb2RlbE9iamVjdFBhdGgsIGludGVybmFsRmllbGQuZm9ybWF0T3B0aW9ucywgaW50ZXJuYWxGaWVsZC5lZGl0TW9kZUFzT2JqZWN0KTtcblxuXHRcdHJldHVybiB4bWxgXG5cdFx0XHQ8SW5wdXRcblx0XHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdHhtbG5zOmxvZz1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIlxuXHRcdFx0XHRsb2c6c291cmNlUGF0aD1cIiR7aW50ZXJuYWxGaWVsZC5kYXRhU291cmNlUGF0aH1cIlxuXHRcdCAgICAgICAgY29yZTpyZXF1aXJlPVwie0ZpZWxkUnVudGltZTogJ3NhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lJ31cIlxuXHRcdFx0XHRpZD1cIiR7aW50ZXJuYWxGaWVsZC5lZGl0U3R5bGVJZH1cIlxuXHRcdFx0XHR2YWx1ZT1cIiR7aW50ZXJuYWxGaWVsZC52YWx1ZUJpbmRpbmdFeHByZXNzaW9ufVwiXG5cdFx0XHRcdHBsYWNlaG9sZGVyPVwiJHtpbnRlcm5hbEZpZWxkLmVkaXRTdHlsZVBsYWNlaG9sZGVyfVwiXG5cdFx0XHRcdHdpZHRoPVwiMTAwJVwiXG5cdFx0XHRcdGVkaXRhYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmVkaXRhYmxlRXhwcmVzc2lvbn1cIlxuXHRcdFx0XHRlbmFibGVkPVwiJHtpbnRlcm5hbEZpZWxkLmVuYWJsZWRFeHByZXNzaW9ufVwiXG5cdFx0XHRcdHJlcXVpcmVkPVwiJHtpbnRlcm5hbEZpZWxkLnJlcXVpcmVkRXhwcmVzc2lvbn1cIlxuXHRcdFx0XHRjaGFuZ2U9XCJGaWVsZFJ1bnRpbWUuaGFuZGxlQ2hhbmdlKCRjb250cm9sbGVyLCAkZXZlbnQpXCJcblx0XHRcdFx0bGl2ZUNoYW5nZT1cIiR7aW50ZXJuYWxGaWVsZC5jb2xsYWJvcmF0aW9uRW5hYmxlZCA/IFwiRmllbGRSdW50aW1lLmhhbmRsZUxpdmVDaGFuZ2VcIiA6IHVuZGVmaW5lZH1cIlxuXHRcdFx0XHRmaWVsZEdyb3VwSWRzPVwiJHtpbnRlcm5hbEZpZWxkLmZpZWxkR3JvdXBJZHN9XCJcblx0XHRcdFx0dGV4dEFsaWduPVwiJHt0ZXh0QWxpZ259XCJcblx0XHRcdFx0dmFsaWRhdGVGaWVsZEdyb3VwPVwiRmllbGRSdW50aW1lLm9uVmFsaWRhdGVGaWVsZEdyb3VwKCRjb250cm9sbGVyLCAkZXZlbnQpXCJcblx0XHRcdFx0YXJpYUxhYmVsbGVkQnk9XCIke2ludGVybmFsRmllbGQuYXJpYUxhYmVsbGVkQnl9XCJcblx0XHRcdD5cblx0XHRcdFx0JHtFZGl0U3R5bGUuZ2V0TGF5b3V0RGF0YShpbnRlcm5hbEZpZWxkKX1cblx0XHRcdDwvSW5wdXQ+YDtcblx0fSxcblx0LyoqXG5cdCAqIEdlbmVyYXRlcyB0aGUgSW5wdXRXaXRoVW5pdCB0ZW1wbGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIGludGVybmFsRmllbGQgUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGludGVybmFsIGZpZWxkIGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZmllbGQgY29udHJvbFxuXHQgKi9cblx0Z2V0SW5wdXRXaXRoVW5pdFRlbXBsYXRlKGludGVybmFsRmllbGQ6IEludGVybmFsRmllbGRCbG9jaykge1xuXHRcdGNvbnN0IGRhdGFNb2RlbE9iamVjdFBhdGggPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKGludGVybmFsRmllbGQuZGF0YUZpZWxkLCBpbnRlcm5hbEZpZWxkLmVudGl0eVNldCk7XG5cdFx0Y29uc3QgdGV4dEFsaWduID0gZ2V0VGV4dEFsaWdubWVudChkYXRhTW9kZWxPYmplY3RQYXRoLCBpbnRlcm5hbEZpZWxkLmZvcm1hdE9wdGlvbnMsIGludGVybmFsRmllbGQuZWRpdE1vZGVBc09iamVjdCk7XG5cdFx0aWYgKGludGVybmFsRmllbGQuc3RhdGljVW5pdCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4geG1sYFxuXHRcdFx0PElucHV0XG5cdFx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHR4bWxuczpsb2c9XCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9leHRlbnNpb24vc2FwLnVpLmNvcmUuQ3VzdG9tRGF0YS8xXCJcblx0XHRcdFx0bG9nOnNvdXJjZVBhdGg9XCIke2ludGVybmFsRmllbGQuZGF0YVNvdXJjZVBhdGh9XCJcblx0XHRcdFx0Y29yZTpyZXF1aXJlPVwie0ZpZWxkUnVudGltZTogJ3NhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lJ31cIlxuXHRcdFx0XHRpZD1cIiR7aW50ZXJuYWxGaWVsZC5lZGl0U3R5bGVJZH1cIlxuXHRcdFx0XHR2YWx1ZT1cIiR7aW50ZXJuYWxGaWVsZC52YWx1ZUJpbmRpbmdFeHByZXNzaW9ufVwiXG5cdFx0XHRcdHdpZHRoPVwiJHtpbnRlcm5hbEZpZWxkLnZhbHVlSW5wdXRXaWR0aH1cIlxuXHRcdFx0XHRmaWVsZFdpZHRoPVwiJHtpbnRlcm5hbEZpZWxkLnZhbHVlSW5wdXRGaWVsZFdpZHRofVwiXG5cdFx0XHRcdGRlc2NyaXB0aW9uPVwiJHtpbnRlcm5hbEZpZWxkLmRlc2NyaXB0aW9uQmluZGluZ0V4cHJlc3Npb259XCJcblx0XHRcdFx0ZWRpdGFibGU9XCIke2ludGVybmFsRmllbGQuZWRpdGFibGVFeHByZXNzaW9ufVwiXG5cdFx0XHRcdGVuYWJsZWQ9XCIke2ludGVybmFsRmllbGQuZW5hYmxlZEV4cHJlc3Npb259XCJcblx0XHRcdFx0cmVxdWlyZWQ9XCIke2ludGVybmFsRmllbGQucmVxdWlyZWRFeHByZXNzaW9ufVwiXG5cdFx0XHRcdGNoYW5nZT1cIkZpZWxkUnVudGltZS5oYW5kbGVDaGFuZ2UoJGNvbnRyb2xsZXIsICRldmVudClcIlxuXHRcdFx0XHRsaXZlQ2hhbmdlPVwiJHtpbnRlcm5hbEZpZWxkLmNvbGxhYm9yYXRpb25FbmFibGVkID8gXCJGaWVsZFJ1bnRpbWUuaGFuZGxlTGl2ZUNoYW5nZVwiIDogdW5kZWZpbmVkfVwiXG5cdFx0XHRcdHRleHRBbGlnbj1cIiR7dGV4dEFsaWdufVwiXG5cdFx0XHRcdGZpZWxkR3JvdXBJZHM9XCIke2ludGVybmFsRmllbGQuZmllbGRHcm91cElkc31cIlxuXHRcdFx0XHR2YWxpZGF0ZUZpZWxkR3JvdXA9XCJGaWVsZFJ1bnRpbWUub25WYWxpZGF0ZUZpZWxkR3JvdXAoJGNvbnRyb2xsZXIsICRldmVudClcIlxuXHRcdFx0PlxuXHRcdFx0XHQke0VkaXRTdHlsZS5nZXRMYXlvdXREYXRhKGludGVybmFsRmllbGQpfVxuXHRcdFx0PC9JbnB1dD5cblx0XHRcdDxJbnB1dFxuXHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0eG1sbnM6bG9nPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiXG5cdFx0XHRcdGxvZzpzb3VyY2VQYXRoPVwiJHtpbnRlcm5hbEZpZWxkLmRhdGFTb3VyY2VQYXRofVwiXG5cdFx0XHRcdGNvcmU6cmVxdWlyZT1cIntGaWVsZFJ1bnRpbWU6ICdzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkUnVudGltZSd9XCJcblx0XHRcdFx0aWQ9XCIke2ludGVybmFsRmllbGQuaWRQcmVmaXggPyBnZW5lcmF0ZShbaW50ZXJuYWxGaWVsZC5pZFByZWZpeCwgXCJGaWVsZC11bml0RWRpdFwiXSkgOiB1bmRlZmluZWR9XCJcblx0XHRcdFx0dmFsdWU9XCIke2ludGVybmFsRmllbGQudW5pdEJpbmRpbmdFeHByZXNzaW9ufVwiXG5cdFx0XHRcdHdpZHRoPVwiMzAlXCJcblx0XHRcdFx0ZWRpdGFibGU9XCIke2ludGVybmFsRmllbGQudW5pdEVkaXRhYmxlfVwiXG5cdFx0XHRcdGVuYWJsZWQ9XCIke2ludGVybmFsRmllbGQuZW5hYmxlZEV4cHJlc3Npb259XCJcblx0XHRcdFx0Y2hhbmdlPVwiRmllbGRSdW50aW1lLmhhbmRsZUNoYW5nZSgkY29udHJvbGxlciwgJGV2ZW50KVwiXG5cdFx0XHRcdGxpdmVDaGFuZ2U9XCIke2ludGVybmFsRmllbGQuY29sbGFib3JhdGlvbkVuYWJsZWQgPyBcIkZpZWxkUnVudGltZS5oYW5kbGVMaXZlQ2hhbmdlXCIgOiB1bmRlZmluZWR9XCJcblx0XHRcdFx0dGV4dEFsaWduPVwiQmVnaW5cIlxuXHRcdFx0XHRmaWVsZEdyb3VwSWRzPVwiJHtpbnRlcm5hbEZpZWxkLmZpZWxkR3JvdXBJZHN9XCJcblx0XHRcdFx0dmFsaWRhdGVGaWVsZEdyb3VwPVwiRmllbGRSdW50aW1lLm9uVmFsaWRhdGVGaWVsZEdyb3VwKCRjb250cm9sbGVyLCAkZXZlbnQpXCJcblx0XHRcdFx0dmlzaWJsZT1cIiR7aW50ZXJuYWxGaWVsZC51bml0SW5wdXRWaXNpYmxlfVwiXG5cdFx0XHQ+XG5cdFx0XHRcdCR7RWRpdFN0eWxlLmdldExheW91dERhdGEoaW50ZXJuYWxGaWVsZCl9XG5cdFx0XHQ8L0lucHV0PlxuXHRcdFx0YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHhtbGBcblx0XHRcdDxJbnB1dFxuXHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0eG1sbnM6bG9nPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiXG5cdFx0XHRcdGxvZzpzb3VyY2VQYXRoPVwiJHtpbnRlcm5hbEZpZWxkLmRhdGFTb3VyY2VQYXRofVwiXG5cdFx0XHRcdGNvcmU6cmVxdWlyZT1cIntGaWVsZFJ1bnRpbWU6ICdzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkUnVudGltZSd9XCJcblx0XHRcdFx0aWQ9XCIke2ludGVybmFsRmllbGQuZWRpdFN0eWxlSWR9XCJcblx0XHRcdFx0dmFsdWU9XCIke2ludGVybmFsRmllbGQudmFsdWVCaW5kaW5nRXhwcmVzc2lvbn1cIlxuXHRcdFx0XHRwbGFjZWhvbGRlcj1cIiR7aW50ZXJuYWxGaWVsZC5lZGl0U3R5bGVQbGFjZWhvbGRlcn1cIlxuXHRcdFx0XHR3aWR0aD1cIjEwMCVcIlxuXHRcdFx0XHRmaWVsZFdpZHRoPVwiNzAlXCJcblx0XHRcdFx0ZGVzY3JpcHRpb249XCIke2ludGVybmFsRmllbGQuc3RhdGljVW5pdH1cIlxuXHRcdFx0XHRlZGl0YWJsZT1cIiR7aW50ZXJuYWxGaWVsZC5lZGl0YWJsZUV4cHJlc3Npb259XCJcblx0XHRcdFx0ZW5hYmxlZD1cIiR7aW50ZXJuYWxGaWVsZC5lbmFibGVkRXhwcmVzc2lvbn1cIlxuXHRcdFx0XHRyZXF1aXJlZD1cIiR7aW50ZXJuYWxGaWVsZC5yZXF1aXJlZEV4cHJlc3Npb259XCJcblx0XHRcdFx0Y2hhbmdlPVwiRmllbGRSdW50aW1lLmhhbmRsZUNoYW5nZSgkY29udHJvbGxlciwgJGV2ZW50KVwiXG5cdFx0XHRcdGxpdmVDaGFuZ2U9XCIke2ludGVybmFsRmllbGQuY29sbGFib3JhdGlvbkVuYWJsZWQgPyBcIkZpZWxkUnVudGltZS5oYW5kbGVMaXZlQ2hhbmdlXCIgOiB1bmRlZmluZWR9XCJcblx0XHRcdFx0dGV4dEFsaWduPVwiJHt0ZXh0QWxpZ259XCJcblx0XHRcdFx0ZmllbGRHcm91cElkcz1cIiR7aW50ZXJuYWxGaWVsZC5maWVsZEdyb3VwSWRzfVwiXG5cdFx0XHRcdHZhbGlkYXRlRmllbGRHcm91cD1cIkZpZWxkUnVudGltZS5vblZhbGlkYXRlRmllbGRHcm91cCgkY29udHJvbGxlciwgJGV2ZW50KVwiXG5cdFx0XHQ+XG5cdFx0XHRcdCR7RWRpdFN0eWxlLmdldExheW91dERhdGEoaW50ZXJuYWxGaWVsZCl9XG5cdFx0XHQ8L0lucHV0PmA7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgdGhlIElucHV0V2l0aFZhbHVlSGVscCB0ZW1wbGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIGludGVybmFsRmllbGQgUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGludGVybmFsIGZpZWxkIGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZmllbGQgY29udHJvbFxuXHQgKi9cblx0Z2V0SW5wdXRXaXRoVmFsdWVIZWxwVGVtcGxhdGUoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrKSB7XG5cdFx0Y29uc3QgZGF0YUZpZWxkRGF0YU1vZGVsT2JqZWN0UGF0aCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoXG5cdFx0XHRpbnRlcm5hbEZpZWxkLmRhdGFGaWVsZCxcblx0XHRcdGludGVybmFsRmllbGQuZW50aXR5U2V0XG5cdFx0KTtcblx0XHRjb25zdCBwcm9wZXJ0eSA9IGRhdGFGaWVsZERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlZhbHVlLiR0YXJnZXQ7XG5cblx0XHRjb25zdCBkZWxlZ2F0ZSA9IEZpZWxkSGVscGVyLmNvbXB1dGVGaWVsZEJhc2VEZWxlZ2F0ZShcblx0XHRcdFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZEJhc2VEZWxlZ2F0ZVwiLFxuXHRcdFx0aW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zLnJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QgYXMgYm9vbGVhblxuXHRcdCk7XG5cdFx0Y29uc3QgZGlzcGxheSA9IFVJRm9ybWF0dGVyLmdldEZpZWxkRGlzcGxheShcblx0XHRcdHByb3BlcnR5LFxuXHRcdFx0aW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zLmRpc3BsYXlNb2RlIGFzIHN0cmluZyxcblx0XHRcdGludGVybmFsRmllbGQuZWRpdE1vZGVBc09iamVjdFxuXHRcdCk7XG5cdFx0Y29uc3QgbXVsdGlwbGVMaW5lcyA9IGdldE11bHRpcGxlTGluZXNGb3JEYXRhRmllbGQoaW50ZXJuYWxGaWVsZCwgcHJvcGVydHkudHlwZSwgcHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJLk11bHRpTGluZVRleHQpO1xuXG5cdFx0Y29uc3QgcHJvcGVydHlDb250ZXh0ID0gaW50ZXJuYWxGaWVsZC5kYXRhRmllbGQuZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIlZhbHVlXCIsIGludGVybmFsRmllbGQuZGF0YUZpZWxkKTtcblx0XHRjb25zdCB2YWx1ZUhlbHBQcm9wZXJ0eUNvbnRleHQgPSBpbnRlcm5hbEZpZWxkLmRhdGFGaWVsZFxuXHRcdFx0LmdldE1vZGVsKClcblx0XHRcdC5jcmVhdGVCaW5kaW5nQ29udGV4dChGaWVsZEhlbHBlci52YWx1ZUhlbHBQcm9wZXJ0eShwcm9wZXJ0eUNvbnRleHQpKTtcblxuXHRcdGNvbnN0IGZpZWxkSGVscCA9IFZhbHVlSGVscFRlbXBsYXRpbmcuZ2VuZXJhdGVJRChcblx0XHRcdGludGVybmFsRmllbGQuX3ZoRmxleElkLFxuXHRcdFx0aW50ZXJuYWxGaWVsZC52aElkUHJlZml4LFxuXHRcdFx0Z2V0UmVsYXRpdmVQcm9wZXJ0eVBhdGgocHJvcGVydHlDb250ZXh0IGFzIHVua25vd24gYXMgTWV0YU1vZGVsQ29udGV4dCwge1xuXHRcdFx0XHRjb250ZXh0OiBwcm9wZXJ0eUNvbnRleHRcblx0XHRcdH0pLFxuXHRcdFx0Z2V0UmVsYXRpdmVQcm9wZXJ0eVBhdGgodmFsdWVIZWxwUHJvcGVydHlDb250ZXh0IGFzIHVua25vd24gYXMgTWV0YU1vZGVsQ29udGV4dCwge1xuXHRcdFx0XHRjb250ZXh0OiB2YWx1ZUhlbHBQcm9wZXJ0eUNvbnRleHQgYXMgQ29udGV4dFxuXHRcdFx0fSlcblx0XHQpO1xuXG5cdFx0Y29uc3QgdGV4dEFsaWduID0gZ2V0VGV4dEFsaWdubWVudChkYXRhRmllbGREYXRhTW9kZWxPYmplY3RQYXRoLCBpbnRlcm5hbEZpZWxkLmZvcm1hdE9wdGlvbnMsIGludGVybmFsRmllbGQuZWRpdE1vZGVBc09iamVjdCk7XG5cdFx0Y29uc3QgbGFiZWwgPSBGaWVsZEhlbHBlci5jb21wdXRlTGFiZWxUZXh0KGludGVybmFsRmllbGQsIHsgY29udGV4dDogaW50ZXJuYWxGaWVsZC5kYXRhRmllbGQgfSk7XG5cblx0XHRsZXQgb3B0aW9uYWxDb250ZW50RWRpdCA9IFwiXCI7XG5cdFx0aWYgKHByb3BlcnR5LnR5cGUgPT09IFwiRWRtLlN0cmluZ1wiICYmIHByb3BlcnR5LmFubm90YXRpb25zPy5VSS5NdWx0aUxpbmVUZXh0KSB7XG5cdFx0XHRvcHRpb25hbENvbnRlbnRFZGl0ID0geG1sYDxtZGM6Y29udGVudEVkaXQgeG1sbnM6bWRjPVwic2FwLnVpLm1kY1wiPlxuXHRcdFx0XHQ8VGV4dEFyZWFcblx0XHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0XHR2YWx1ZT1cIiR7aW50ZXJuYWxGaWVsZC52YWx1ZUJpbmRpbmdFeHByZXNzaW9ufVwiXG5cdFx0XHRcdFx0cmVxdWlyZWQ9XCIke2ludGVybmFsRmllbGQucmVxdWlyZWRFeHByZXNzaW9ufVwiXG5cdFx0XHRcdFx0cm93cz1cIiR7aW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zLnRleHRMaW5lc0VkaXR9XCJcblx0XHRcdFx0XHRncm93aW5nPVwiJHsoaW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zLnRleHRNYXhMaW5lcyBhcyB1bmtub3duIGFzIG51bWJlcikgPiAwID8gdHJ1ZSA6IHVuZGVmaW5lZH1cIlxuXHRcdFx0XHRcdGdyb3dpbmdNYXhMaW5lcz1cIiR7aW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zLnRleHRNYXhMaW5lc31cIlxuXHRcdFx0XHRcdHdpZHRoPVwiMTAwJVwiXG5cdFx0XHRcdFx0Y2hhbmdlPVwiRmllbGRSdW50aW1lLmhhbmRsZUNoYW5nZSgkY29udHJvbGxlciwgJGV2ZW50KVwiXG5cdFx0XHRcdFx0ZmllbGRHcm91cElkcz1cIiR7aW50ZXJuYWxGaWVsZC5maWVsZEdyb3VwSWRzfVwiXG5cdFx0XHRcdC8+XG5cdFx0XHQ8L21kYzpjb250ZW50RWRpdD5gO1xuXHRcdH1cblxuXHRcdGxldCBvcHRpb25hbExheW91dERhdGEgPSBcIlwiO1xuXHRcdGlmIChpbnRlcm5hbEZpZWxkLmNvbGxhYm9yYXRpb25FbmFibGVkID09PSB0cnVlKSB7XG5cdFx0XHRvcHRpb25hbExheW91dERhdGEgPSB4bWxgPG1kYzpsYXlvdXREYXRhIHhtbG5zOm1kYz1cInNhcC51aS5tZGNcIj5cblx0XHRcdFx0PEZsZXhJdGVtRGF0YSB4bWxucz1cInNhcC5tXCIgZ3Jvd0ZhY3Rvcj1cIjlcIiAvPlxuXHRcdFx0PC9tZGM6bGF5b3V0RGF0YT5gO1xuXHRcdH1cblxuXHRcdHJldHVybiB4bWxgPG1kYzpGaWVsZFxuXHRcdFx0eG1sbnM6bWRjPVwic2FwLnVpLm1kY1wiXG5cdFx0XHR4bWxuczpsb2c9XCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9leHRlbnNpb24vc2FwLnVpLmNvcmUuQ3VzdG9tRGF0YS8xXCJcblx0XHRcdGNvcmU6cmVxdWlyZT1cIntGaWVsZFJ1bnRpbWU6ICdzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkUnVudGltZSd9XCJcblx0XHRcdGRlbGVnYXRlPVwiJHtkZWxlZ2F0ZX1cIlxuXHRcdFx0aWQ9XCIke2ludGVybmFsRmllbGQuZWRpdFN0eWxlSWR9XCJcblx0XHRcdGxvZzpzb3VyY2VQYXRoPVwiJHtpbnRlcm5hbEZpZWxkLmRhdGFTb3VyY2VQYXRofVwiXG5cdFx0XHR2YWx1ZT1cIiR7aW50ZXJuYWxGaWVsZC52YWx1ZUJpbmRpbmdFeHByZXNzaW9ufVwiXG5cdFx0XHRwbGFjZWhvbGRlcj1cIiR7aW50ZXJuYWxGaWVsZC5lZGl0U3R5bGVQbGFjZWhvbGRlcn1cIlxuXHRcdFx0dmFsdWVTdGF0ZT1cIiR7aW50ZXJuYWxGaWVsZC52YWx1ZVN0YXRlfVwiXG5cdFx0XHRlZGl0TW9kZT1cIiR7aW50ZXJuYWxGaWVsZC5lZGl0TW9kZX1cIlxuXHRcdFx0d2lkdGg9XCIxMDAlXCJcblx0XHRcdHJlcXVpcmVkPVwiJHtpbnRlcm5hbEZpZWxkLnJlcXVpcmVkRXhwcmVzc2lvbn1cIlxuXHRcdFx0YWRkaXRpb25hbFZhbHVlPVwiJHtpbnRlcm5hbEZpZWxkLnRleHRCaW5kaW5nRXhwcmVzc2lvbn1cIlxuXHRcdFx0ZGlzcGxheT1cIiR7ZGlzcGxheX1cIlxuXHRcdFx0bXVsdGlwbGVMaW5lcz1cIiR7bXVsdGlwbGVMaW5lc31cIlxuXHRcdFx0ZmllbGRIZWxwPVwiJHtmaWVsZEhlbHB9XCJcblx0XHRcdGZpZWxkR3JvdXBJZHM9XCIke2ludGVybmFsRmllbGQuZmllbGRHcm91cElkc31cIlxuXHRcdFx0Y2hhbmdlPVwiRmllbGRSdW50aW1lLmhhbmRsZUNoYW5nZSgkY29udHJvbGxlciwgJGV2ZW50KVwiXG5cdFx0XHRsaXZlQ2hhbmdlPVwiJHtpbnRlcm5hbEZpZWxkLmNvbGxhYm9yYXRpb25FbmFibGVkID09PSB0cnVlID8gXCJGaWVsZFJ1bnRpbWUuaGFuZGxlTGl2ZUNoYW5nZVwiIDogdW5kZWZpbmVkfVwiXG5cdFx0XHR0ZXh0QWxpZ249XCIke3RleHRBbGlnbn1cIlxuXHRcdFx0dmFsaWRhdGVGaWVsZEdyb3VwPVwiRmllbGRSdW50aW1lLm9uVmFsaWRhdGVGaWVsZEdyb3VwKCRjb250cm9sbGVyLCAkZXZlbnQpXCJcblx0XHRcdGFyaWFMYWJlbGxlZEJ5PVwiJHtpbnRlcm5hbEZpZWxkLmFyaWFMYWJlbGxlZEJ5fVwiXG5cdFx0XHRsYWJlbD1cIiR7bGFiZWx9XCJcblx0XHQ+XG5cdFx0XHQke29wdGlvbmFsQ29udGVudEVkaXR9XG5cdFx0XHQke29wdGlvbmFsTGF5b3V0RGF0YX1cblx0XHQ8L21kYzpGaWVsZD5gO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgdGhlIENoZWNrQm94IHRlbXBsYXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRDaGVja0JveFRlbXBsYXRlKGludGVybmFsRmllbGQ6IEludGVybmFsRmllbGRCbG9jaykge1xuXHRcdHJldHVybiB4bWxgXG5cdFx0ICAgIDxDaGVja0JveFxuICAgICAgICAgICAgICAgIHhtbG5zPVwic2FwLm1cIlxuICAgICAgICAgICAgICAgIHhtbG5zOm1hY3JvZGF0YT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIlxuXHRcdCAgICAgICAgbWFjcm9kYXRhOnNvdXJjZVBhdGg9XCIke2ludGVybmFsRmllbGQuZGF0YVNvdXJjZVBhdGh9XCJcblx0XHRcdFx0Y29yZTpyZXF1aXJlPVwie0ZpZWxkUnVudGltZTogJ3NhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lJ31cIlxuXHRcdFx0XHRpZD1cIiR7aW50ZXJuYWxGaWVsZC5lZGl0U3R5bGVJZH1cIlxuXHRcdCAgICAgICAgc2VsZWN0ZWQ9XCIke2ludGVybmFsRmllbGQudmFsdWVCaW5kaW5nRXhwcmVzc2lvbn1cIlxuXHRcdCAgICAgICAgZWRpdGFibGU9XCIke2ludGVybmFsRmllbGQuZWRpdGFibGVFeHByZXNzaW9ufVwiXG5cdFx0ICAgICAgICBlbmFibGVkPVwiJHtpbnRlcm5hbEZpZWxkLmVuYWJsZWRFeHByZXNzaW9ufVwiXG5cdFx0ICAgICAgICBzZWxlY3Q9XCJGaWVsZFJ1bnRpbWUuaGFuZGxlQ2hhbmdlKCRjb250cm9sbGVyLCAkZXZlbnQpXCJcblx0XHQgICAgICAgIGZpZWxkR3JvdXBJZHM9XCIke2ludGVybmFsRmllbGQuZmllbGRHcm91cElkc31cIlxuXHRcdCAgICAgICAgdmFsaWRhdGVGaWVsZEdyb3VwPVwiRmllbGRSdW50aW1lLm9uVmFsaWRhdGVGaWVsZEdyb3VwKCRjb250cm9sbGVyLCAkZXZlbnQpXCJcblx0XHQgICAgICAgIGFyaWFMYWJlbGxlZEJ5PVwiJHtpbnRlcm5hbEZpZWxkLmFyaWFMYWJlbGxlZEJ5fVwiXG5cdCAgICAvPlxuICAgICAgICBgO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgdGhlIFRleHRBcmVhIHRlbXBsYXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRUZXh0QXJlYVRlbXBsYXRlKGludGVybmFsRmllbGQ6IEludGVybmFsRmllbGRCbG9jaykge1xuXHRcdGNvbnN0IGxpdmVDaGFuZ2UgPVxuXHRcdFx0aW50ZXJuYWxGaWVsZC5jb2xsYWJvcmF0aW9uRW5hYmxlZCB8fCBpbnRlcm5hbEZpZWxkLmZvcm1hdE9wdGlvbnMudGV4dE1heExlbmd0aCA/IFwiRmllbGRSdW50aW1lLmhhbmRsZUxpdmVDaGFuZ2VcIiA6IHVuZGVmaW5lZDtcblxuXHRcdGNvbnN0IGdyb3dpbmcgPSBpbnRlcm5hbEZpZWxkLmZvcm1hdE9wdGlvbnMudGV4dE1heExpbmVzID8gdHJ1ZSA6IGZhbHNlO1xuXG5cdFx0Ly91bmZvcnR1bmF0ZWx5IHRoaXMgb25lIGlzIGEgXCJkaWZmZXJlbnRcIiBsYXlvdXREYXRhIHRoYW4gdGhlIG90aGVycywgdGhlcmVmb3JlIHRoZSByZXVzZSBmdW5jdGlvbiBmcm9tIGFib3ZlIGNhbm5vdCBiZSB1c2VkIGZvciB0aGUgdGV4dEFyZWEgdGVtcGxhdGVcblx0XHRsZXQgbGF5b3V0RGF0YSA9IFwiXCI7XG5cdFx0aWYgKGludGVybmFsRmllbGQuY29sbGFib3JhdGlvbkVuYWJsZWQpIHtcblx0XHRcdGxheW91dERhdGEgPSB4bWxgPGZpZWxkOmxheW91dERhdGE+XG5cdFx0XHQ8RmxleEl0ZW1EYXRhIHhtbG5zPVwic2FwLm1cIiBncm93RmFjdG9yPVwiOVwiIC8+XG5cdFx0PC9maWVsZDpsYXlvdXREYXRhPmA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHhtbGA8ZmllbGQ6VGV4dEFyZWFFeFxuXHRcdFx0eG1sbnM6bG9nPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiXG5cdFx0XHR4bWxuczpmaWVsZD1cInNhcC5mZS5tYWNyb3MuZmllbGRcIlxuXHRcdFx0eG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCJcblx0XHRcdGNvcmU6cmVxdWlyZT1cIntGaWVsZFJ1bnRpbWU6ICdzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkUnVudGltZSd9XCJcblx0XHRcdGxvZzpzb3VyY2VQYXRoPVwiJHtpbnRlcm5hbEZpZWxkLmRhdGFTb3VyY2VQYXRofVwiXG5cdFx0XHRpZD1cIiR7aW50ZXJuYWxGaWVsZC5lZGl0U3R5bGVJZH1cIlxuXHRcdFx0dmFsdWU9XCIke2ludGVybmFsRmllbGQudmFsdWVCaW5kaW5nRXhwcmVzc2lvbn1cIlxuXHRcdFx0cGxhY2Vob2xkZXI9XCIke2ludGVybmFsRmllbGQuZWRpdFN0eWxlUGxhY2Vob2xkZXJ9XCJcblx0XHRcdHJlcXVpcmVkPVwiJHtpbnRlcm5hbEZpZWxkLnJlcXVpcmVkRXhwcmVzc2lvbn1cIlxuXHRcdFx0cm93cz1cIiR7aW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zLnRleHRMaW5lc0VkaXR9XCJcblx0XHRcdGdyb3dpbmc9XCIke2dyb3dpbmd9XCJcblx0XHRcdGdyb3dpbmdNYXhMaW5lcz1cIiR7aW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zLnRleHRNYXhMaW5lc31cIlxuXHRcdFx0d2lkdGg9XCIxMDAlXCJcblx0XHRcdGVkaXRhYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmVkaXRhYmxlRXhwcmVzc2lvbn1cIlxuXHRcdFx0ZW5hYmxlZD1cIiR7aW50ZXJuYWxGaWVsZC5lbmFibGVkRXhwcmVzc2lvbn1cIlxuXHRcdFx0Y2hhbmdlPVwiRmllbGRSdW50aW1lLmhhbmRsZUNoYW5nZSgkY29udHJvbGxlciwgJGV2ZW50KVwiXG5cdFx0XHRmaWVsZEdyb3VwSWRzPVwiJHtpbnRlcm5hbEZpZWxkLmZpZWxkR3JvdXBJZHN9XCJcblx0XHRcdHZhbGlkYXRlRmllbGRHcm91cD1cIkZpZWxkUnVudGltZS5vblZhbGlkYXRlRmllbGRHcm91cCgkY29udHJvbGxlciwgJGV2ZW50KVwiXG5cdFx0XHRhcmlhTGFiZWxsZWRCeT1cIiR7aW50ZXJuYWxGaWVsZC5hcmlhTGFiZWxsZWRCeX1cIlxuXHRcdFx0bGl2ZUNoYW5nZT1cIiR7bGl2ZUNoYW5nZX1cIlxuXHRcdFx0bWF4TGVuZ3RoPVwiJHtpbnRlcm5hbEZpZWxkLmZvcm1hdE9wdGlvbnMudGV4dE1heExlbmd0aH1cIlxuXHRcdFx0c2hvd0V4Y2VlZGVkVGV4dD1cInRydWVcIlxuXHRcdD5cblx0XHRcdCR7bGF5b3V0RGF0YX1cblx0XHQ8L2ZpZWxkOlRleHRBcmVhRXg+XG5cdFx0YDtcblx0fSxcblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBSYXRpbmdJbmRpY2F0b3IgdGVtcGxhdGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBpbnRlcm5hbEZpZWxkIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBpbnRlcm5hbCBmaWVsZCBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldFJhdGluZ0luZGljYXRvclRlbXBsYXRlOiAoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrKSA9PiB7XG5cdFx0Y29uc3QgdG9vbHRpcCA9IGludGVybmFsRmllbGQucmF0aW5nSW5kaWNhdG9yVG9vbHRpcCB8fCBcIntzYXAuZmUuaTE4bj5UX0NPTU1PTl9SQVRJTkdfSU5ESUNBVE9SX1RJVExFX0xBQkVMfVwiO1xuXG5cdFx0cmV0dXJuIHhtbGA8UmF0aW5nSW5kaWNhdG9yXG5cdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdGlkPVwiJHtpbnRlcm5hbEZpZWxkLmVkaXRTdHlsZUlkfVwiXG5cdFx0XHRtYXhWYWx1ZT1cIiR7aW50ZXJuYWxGaWVsZC5yYXRpbmdJbmRpY2F0b3JUYXJnZXRWYWx1ZX1cIlxuXHRcdFx0dmFsdWU9XCIke2ludGVybmFsRmllbGQudmFsdWVCaW5kaW5nRXhwcmVzc2lvbn1cIlxuXHRcdFx0dG9vbHRpcD1cIiR7dG9vbHRpcH1cIlxuXHRcdFx0aWNvblNpemU9XCIxLjM3NXJlbVwiXG5cdFx0XHRjbGFzcz1cInNhcFVpVGlueU1hcmdpblRvcEJvdHRvbVwiXG5cdFx0XHRlZGl0YWJsZT1cInRydWVcIlxuXHRcdD5cblx0XHQke0VkaXRTdHlsZS5nZXRMYXlvdXREYXRhKGludGVybmFsRmllbGQpfVxuXHRcdDwvUmF0aW5nSW5kaWNhdG9yPlxuXHRcdGA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEVudHJ5IHBvaW50IGZvciBmdXJ0aGVyIHRlbXBsYXRpbmcgcHJvY2Vzc2luZ3MuXG5cdCAqXG5cdCAqIEBwYXJhbSBpbnRlcm5hbEZpZWxkIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBpbnRlcm5hbCBmaWVsZCBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldFRlbXBsYXRlOiAoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrKSA9PiB7XG5cdFx0bGV0IGlubmVyRmllbGRDb250ZW50O1xuXG5cdFx0c3dpdGNoIChpbnRlcm5hbEZpZWxkLmVkaXRTdHlsZSkge1xuXHRcdFx0Y2FzZSBcIkNoZWNrQm94XCI6XG5cdFx0XHRcdGlubmVyRmllbGRDb250ZW50ID0gRWRpdFN0eWxlLmdldENoZWNrQm94VGVtcGxhdGUoaW50ZXJuYWxGaWVsZCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkRhdGVQaWNrZXJcIjpcblx0XHRcdGNhc2UgXCJEYXRlVGltZVBpY2tlclwiOlxuXHRcdFx0Y2FzZSBcIlRpbWVQaWNrZXJcIjoge1xuXHRcdFx0XHRpbm5lckZpZWxkQ29udGVudCA9IEVkaXRTdHlsZS5nZXREYXRlVGltZVBpY2tlckdlbmVyaWMoaW50ZXJuYWxGaWVsZCwgaW50ZXJuYWxGaWVsZC5lZGl0U3R5bGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGNhc2UgXCJJbnB1dFwiOiB7XG5cdFx0XHRcdGlubmVyRmllbGRDb250ZW50ID0gRWRpdFN0eWxlLmdldElucHV0VGVtcGxhdGUoaW50ZXJuYWxGaWVsZCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBcIklucHV0V2l0aFVuaXRcIjoge1xuXHRcdFx0XHRpbm5lckZpZWxkQ29udGVudCA9IEVkaXRTdHlsZS5nZXRJbnB1dFdpdGhVbml0VGVtcGxhdGUoaW50ZXJuYWxGaWVsZCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBcIklucHV0V2l0aFZhbHVlSGVscFwiOiB7XG5cdFx0XHRcdGlubmVyRmllbGRDb250ZW50ID0gRWRpdFN0eWxlLmdldElucHV0V2l0aFZhbHVlSGVscFRlbXBsYXRlKGludGVybmFsRmllbGQpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGNhc2UgXCJSYXRpbmdJbmRpY2F0b3JcIjpcblx0XHRcdFx0aW5uZXJGaWVsZENvbnRlbnQgPSBFZGl0U3R5bGUuZ2V0UmF0aW5nSW5kaWNhdG9yVGVtcGxhdGUoaW50ZXJuYWxGaWVsZCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlRleHRBcmVhXCI6XG5cdFx0XHRcdGlubmVyRmllbGRDb250ZW50ID0gRWRpdFN0eWxlLmdldFRleHRBcmVhVGVtcGxhdGUoaW50ZXJuYWxGaWVsZCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHR9XG5cblx0XHRyZXR1cm4gaW5uZXJGaWVsZENvbnRlbnQ7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEVkaXRTdHlsZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7O0VBWUEsTUFBTUEsU0FBUyxHQUFHO0lBQ2pCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxhQUFhLENBQUNDLGFBQWlDLEVBQUU7TUFDaEQsSUFBSUMsVUFBVSxHQUFHLEVBQUU7TUFDbkIsSUFBSUQsYUFBYSxDQUFDRSxvQkFBb0IsRUFBRTtRQUN2Q0QsVUFBVSxHQUFHRSxHQUFJO0FBQ3BCO0FBQ0EsaUJBQWlCO01BQ2Y7TUFDQSxPQUFPRixVQUFVO0lBQ2xCLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDRyx3QkFBd0IsQ0FBQ0osYUFBaUMsRUFBRUssSUFBb0QsRUFBRTtNQUNqSCxNQUFNQyxtQkFBbUIsR0FBR0Msa0JBQWtCLENBQUNDLDJCQUEyQixDQUFDUixhQUFhLENBQUNTLFNBQVMsRUFBRVQsYUFBYSxDQUFDVSxTQUFTLENBQUM7TUFDNUgsTUFBTUMsU0FBUyxHQUFHQyxnQkFBZ0IsQ0FBQ04sbUJBQW1CLEVBQUVOLGFBQWEsQ0FBQ2EsYUFBYSxFQUFFYixhQUFhLENBQUNjLGdCQUFnQixDQUFDO01BRXBILE9BQU9YLEdBQUksSUFBR0UsSUFBSztBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQkwsYUFBYSxDQUFDZSxjQUFlO0FBQ2xELFNBQVNmLGFBQWEsQ0FBQ2dCLFdBQVk7QUFDbkM7QUFDQSxlQUFlaEIsYUFBYSxDQUFDaUIsa0JBQW1CO0FBQ2hELGNBQWNqQixhQUFhLENBQUNrQixp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