import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { getRelativePropertyPath } from "sap/fe/core/templating/PropertyFormatters";
import * as UIFormatter from "sap/fe/core/templating/UIFormatters";
import { MetaModelContext } from "sap/fe/core/templating/UIFormatters";
import { getMultipleLinesForDataField, getTextAlignment } from "sap/fe/macros/field/FieldTemplating";
import * as ValueHelpTemplating from "sap/fe/macros/internal/valuehelp/ValueHelpTemplating";
import Context from "sap/ui/model/Context";
import FieldHelper from "../../field/FieldHelper";
import InternalFieldBlock from "../InternalField.block";

const EditStyle = {
	/**
	 * An internal helper to retrieve the reused layout data.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getLayoutData(internalField: InternalFieldBlock) {
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
	getDateTimePickerGeneric(internalField: InternalFieldBlock, type: "DatePicker" | "DateTimePicker" | "TimePicker") {
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
			change="${
				type === "DateTimePicker"
					? internalField.onChange || "FieldRuntime.handleChange($controller, $event)"
					: "FieldRuntime.handleChange($controller, $event)"
			}"
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
	getInputTemplate(internalField: InternalFieldBlock) {
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
	getInputWithUnitTemplate(internalField: InternalFieldBlock) {
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
	getInputWithValueHelpTemplate(internalField: InternalFieldBlock) {
		const dataFieldDataModelObjectPath = MetaModelConverter.getInvolvedDataModelObjects(
			internalField.dataField,
			internalField.entitySet
		);
		const property = dataFieldDataModelObjectPath.targetObject.Value.$target;

		const delegate = FieldHelper.computeFieldBaseDelegate(
			"sap/fe/macros/field/FieldBaseDelegate",
			internalField.formatOptions.retrieveTextFromValueList as boolean
		);
		const display = UIFormatter.getFieldDisplay(
			property,
			internalField.formatOptions.displayMode as string,
			internalField.editModeAsObject
		);
		const multipleLines = getMultipleLinesForDataField(internalField, property.type, property.annotations?.UI.MultiLineText);

		const propertyContext = internalField.dataField.getModel().createBindingContext("Value", internalField.dataField);
		const valueHelpPropertyContext = internalField.dataField
			.getModel()
			.createBindingContext(FieldHelper.valueHelpProperty(propertyContext));

		const fieldHelp = ValueHelpTemplating.generateID(
			internalField._vhFlexId,
			internalField.vhIdPrefix,
			getRelativePropertyPath(propertyContext as unknown as MetaModelContext, {
				context: propertyContext
			}),
			getRelativePropertyPath(valueHelpPropertyContext as unknown as MetaModelContext, {
				context: valueHelpPropertyContext as Context
			})
		);

		const textAlign = getTextAlignment(dataFieldDataModelObjectPath, internalField.formatOptions, internalField.editModeAsObject);
		const label = FieldHelper.computeLabelText(internalField, { context: internalField.dataField });

		let optionalContentEdit = "";
		if (property.type === "Edm.String" && property.annotations?.UI.MultiLineText) {
			optionalContentEdit = xml`<mdc:contentEdit xmlns:mdc="sap.ui.mdc">
				<TextArea
					xmlns="sap.m"
					value="${internalField.valueBindingExpression}"
					required="${internalField.requiredExpression}"
					rows="${internalField.formatOptions.textLinesEdit}"
					growing="${(internalField.formatOptions.textMaxLines as unknown as number) > 0 ? true : undefined}"
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
	getCheckBoxTemplate(internalField: InternalFieldBlock) {
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
	getTextAreaTemplate(internalField: InternalFieldBlock) {
		const liveChange =
			internalField.collaborationEnabled || internalField.formatOptions.textMaxLength ? "FieldRuntime.handleLiveChange" : undefined;

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
	getRatingIndicatorTemplate: (internalField: InternalFieldBlock) => {
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
	getTemplate: (internalField: InternalFieldBlock) => {
		let innerFieldContent;

		switch (internalField.editStyle) {
			case "CheckBox":
				innerFieldContent = EditStyle.getCheckBoxTemplate(internalField);
				break;
			case "DatePicker":
			case "DateTimePicker":
			case "TimePicker": {
				innerFieldContent = EditStyle.getDateTimePickerGeneric(internalField, internalField.editStyle);
				break;
			}
			case "Input": {
				innerFieldContent = EditStyle.getInputTemplate(internalField);
				break;
			}
			case "InputWithUnit": {
				innerFieldContent = EditStyle.getInputWithUnitTemplate(internalField);
				break;
			}
			case "InputWithValueHelp": {
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

export default EditStyle;
