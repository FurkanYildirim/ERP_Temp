/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/StableIdHelper","sap/fe/core/templating/PropertyFormatters","sap/fe/core/templating/UIFormatters","sap/fe/macros/field/FieldTemplating","sap/fe/macros/internal/valuehelp/ValueHelpTemplating","../../field/FieldHelper"],function(e,t,a,i,l,n,d,o){"use strict";var r=n.getTextAlignment;var s=n.getMultipleLinesForDataField;var u=i.getRelativePropertyPath;var p=a.generate;var c=e.xml;const m={getLayoutData(e){let t="";if(e.collaborationEnabled){t=c`<layoutData>
				<FlexItemData growFactor="9" />
			</layoutData>`}return t},getDateTimePickerGeneric(e,a){const i=t.getInvolvedDataModelObjects(e.dataField,e.entitySet);const l=r(i,e.formatOptions,e.editModeAsObject);return c`<${a}
			xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
			xmlns="sap.m"
			xmlns:core="sap.ui.core"
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
			log:sourcePath="${e.dataSourcePath}"
			id="${e.editStyleId}"
			width="100%"
			editable="${e.editableExpression}"
			enabled="${e.enabledExpression}"
			required="${e.requiredExpression}"
			change="${a==="DateTimePicker"?e.onChange||"FieldRuntime.handleChange($controller, $event)":"FieldRuntime.handleChange($controller, $event)"}"
			textAlign="${l}"
			validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
			ariaLabelledBy="${e.ariaLabelledBy}"
			value="${e.valueBindingExpression}"
			fieldGroupIds="${e.fieldGroupIds}"
			showTimezone="${e.showTimezone}"
			afterValueHelpOpen="${e.collaborationEnabled?"FieldRuntime.handleOpenPicker":undefined}"
			afterValueHelpClose="${e.collaborationEnabled?"FieldRuntime.handleClosePicker":undefined}"
			liveChange="${e.collaborationEnabled?"FieldRuntime.handleLiveChange":undefined}"
	>

	</${a}>
	`},getInputTemplate(e){const a=t.getInvolvedDataModelObjects(e.dataField,e.entitySet);const i=r(a,e.formatOptions,e.editModeAsObject);return c`
			<Input
				xmlns="sap.m"
				xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
				log:sourcePath="${e.dataSourcePath}"
		        core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				id="${e.editStyleId}"
				value="${e.valueBindingExpression}"
				placeholder="${e.editStylePlaceholder}"
				width="100%"
				editable="${e.editableExpression}"
				enabled="${e.enabledExpression}"
				required="${e.requiredExpression}"
				change="FieldRuntime.handleChange($controller, $event)"
				liveChange="${e.collaborationEnabled?"FieldRuntime.handleLiveChange":undefined}"
				fieldGroupIds="${e.fieldGroupIds}"
				textAlign="${i}"
				validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
				ariaLabelledBy="${e.ariaLabelledBy}"
			>
				${m.getLayoutData(e)}
			</Input>`},getInputWithUnitTemplate(e){const a=t.getInvolvedDataModelObjects(e.dataField,e.entitySet);const i=r(a,e.formatOptions,e.editModeAsObject);if(e.staticUnit===undefined){return c`
			<Input
				xmlns="sap.m"
				xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
				log:sourcePath="${e.dataSourcePath}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				id="${e.editStyleId}"
				value="${e.valueBindingExpression}"
				width="${e.valueInputWidth}"
				fieldWidth="${e.valueInputFieldWidth}"
				description="${e.descriptionBindingExpression}"
				editable="${e.editableExpression}"
				enabled="${e.enabledExpression}"
				required="${e.requiredExpression}"
				change="FieldRuntime.handleChange($controller, $event)"
				liveChange="${e.collaborationEnabled?"FieldRuntime.handleLiveChange":undefined}"
				textAlign="${i}"
				fieldGroupIds="${e.fieldGroupIds}"
				validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
			>
				${m.getLayoutData(e)}
			</Input>
			<Input
				xmlns="sap.m"
				xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
				log:sourcePath="${e.dataSourcePath}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				id="${e.idPrefix?p([e.idPrefix,"Field-unitEdit"]):undefined}"
				value="${e.unitBindingExpression}"
				width="30%"
				editable="${e.unitEditable}"
				enabled="${e.enabledExpression}"
				change="FieldRuntime.handleChange($controller, $event)"
				liveChange="${e.collaborationEnabled?"FieldRuntime.handleLiveChange":undefined}"
				textAlign="Begin"
				fieldGroupIds="${e.fieldGroupIds}"
				validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
				visible="${e.unitInputVisible}"
			>
				${m.getLayoutData(e)}
			</Input>
			`}else{return c`
			<Input
				xmlns="sap.m"
				xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
				log:sourcePath="${e.dataSourcePath}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				id="${e.editStyleId}"
				value="${e.valueBindingExpression}"
				placeholder="${e.editStylePlaceholder}"
				width="100%"
				fieldWidth="70%"
				description="${e.staticUnit}"
				editable="${e.editableExpression}"
				enabled="${e.enabledExpression}"
				required="${e.requiredExpression}"
				change="FieldRuntime.handleChange($controller, $event)"
				liveChange="${e.collaborationEnabled?"FieldRuntime.handleLiveChange":undefined}"
				textAlign="${i}"
				fieldGroupIds="${e.fieldGroupIds}"
				validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
			>
				${m.getLayoutData(e)}
			</Input>`}},getInputWithValueHelpTemplate(e){var a,i;const n=t.getInvolvedDataModelObjects(e.dataField,e.entitySet);const p=n.targetObject.Value.$target;const m=o.computeFieldBaseDelegate("sap/fe/macros/field/FieldBaseDelegate",e.formatOptions.retrieveTextFromValueList);const $=l.getFieldDisplay(p,e.formatOptions.displayMode,e.editModeAsObject);const g=s(e,p.type,(a=p.annotations)===null||a===void 0?void 0:a.UI.MultiLineText);const h=e.dataField.getModel().createBindingContext("Value",e.dataField);const x=e.dataField.getModel().createBindingContext(o.valueHelpProperty(h));const f=d.generateID(e._vhFlexId,e.vhIdPrefix,u(h,{context:h}),u(x,{context:x}));const v=r(n,e.formatOptions,e.editModeAsObject);const F=o.computeLabelText(e,{context:e.dataField});let b="";if(p.type==="Edm.String"&&(i=p.annotations)!==null&&i!==void 0&&i.UI.MultiLineText){b=c`<mdc:contentEdit xmlns:mdc="sap.ui.mdc">
				<TextArea
					xmlns="sap.m"
					value="${e.valueBindingExpression}"
					required="${e.requiredExpression}"
					rows="${e.formatOptions.textLinesEdit}"
					growing="${e.formatOptions.textMaxLines>0?true:undefined}"
					growingMaxLines="${e.formatOptions.textMaxLines}"
					width="100%"
					change="FieldRuntime.handleChange($controller, $event)"
					fieldGroupIds="${e.fieldGroupIds}"
				/>
			</mdc:contentEdit>`}let I="";if(e.collaborationEnabled===true){I=c`<mdc:layoutData xmlns:mdc="sap.ui.mdc">
				<FlexItemData xmlns="sap.m" growFactor="9" />
			</mdc:layoutData>`}return c`<mdc:Field
			xmlns:mdc="sap.ui.mdc"
			xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
			delegate="${m}"
			id="${e.editStyleId}"
			log:sourcePath="${e.dataSourcePath}"
			value="${e.valueBindingExpression}"
			placeholder="${e.editStylePlaceholder}"
			valueState="${e.valueState}"
			editMode="${e.editMode}"
			width="100%"
			required="${e.requiredExpression}"
			additionalValue="${e.textBindingExpression}"
			display="${$}"
			multipleLines="${g}"
			fieldHelp="${f}"
			fieldGroupIds="${e.fieldGroupIds}"
			change="FieldRuntime.handleChange($controller, $event)"
			liveChange="${e.collaborationEnabled===true?"FieldRuntime.handleLiveChange":undefined}"
			textAlign="${v}"
			validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
			ariaLabelledBy="${e.ariaLabelledBy}"
			label="${F}"
		>
			${b}
			${I}
		</mdc:Field>`},getCheckBoxTemplate(e){return c`
		    <CheckBox
                xmlns="sap.m"
                xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		        macrodata:sourcePath="${e.dataSourcePath}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				id="${e.editStyleId}"
		        selected="${e.valueBindingExpression}"
		        editable="${e.editableExpression}"
		        enabled="${e.enabledExpression}"
		        select="FieldRuntime.handleChange($controller, $event)"
		        fieldGroupIds="${e.fieldGroupIds}"
		        validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
		        ariaLabelledBy="${e.ariaLabelledBy}"
	    />
        `},getTextAreaTemplate(e){const t=e.collaborationEnabled||e.formatOptions.textMaxLength?"FieldRuntime.handleLiveChange":undefined;const a=e.formatOptions.textMaxLines?true:false;let i="";if(e.collaborationEnabled){i=c`<field:layoutData>
			<FlexItemData xmlns="sap.m" growFactor="9" />
		</field:layoutData>`}return c`<field:TextAreaEx
			xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
			xmlns:field="sap.fe.macros.field"
			xmlns:core="sap.ui.core"
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
			log:sourcePath="${e.dataSourcePath}"
			id="${e.editStyleId}"
			value="${e.valueBindingExpression}"
			placeholder="${e.editStylePlaceholder}"
			required="${e.requiredExpression}"
			rows="${e.formatOptions.textLinesEdit}"
			growing="${a}"
			growingMaxLines="${e.formatOptions.textMaxLines}"
			width="100%"
			editable="${e.editableExpression}"
			enabled="${e.enabledExpression}"
			change="FieldRuntime.handleChange($controller, $event)"
			fieldGroupIds="${e.fieldGroupIds}"
			validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
			ariaLabelledBy="${e.ariaLabelledBy}"
			liveChange="${t}"
			maxLength="${e.formatOptions.textMaxLength}"
			showExceededText="true"
		>
			${i}
		</field:TextAreaEx>
		`},getRatingIndicatorTemplate:e=>{const t=e.ratingIndicatorTooltip||"{sap.fe.i18n>T_COMMON_RATING_INDICATOR_TITLE_LABEL}";return c`<RatingIndicator
			xmlns="sap.m"
			id="${e.editStyleId}"
			maxValue="${e.ratingIndicatorTargetValue}"
			value="${e.valueBindingExpression}"
			tooltip="${t}"
			iconSize="1.375rem"
			class="sapUiTinyMarginTopBottom"
			editable="true"
		>
		${m.getLayoutData(e)}
		</RatingIndicator>
		`},getTemplate:e=>{let t;switch(e.editStyle){case"CheckBox":t=m.getCheckBoxTemplate(e);break;case"DatePicker":case"DateTimePicker":case"TimePicker":{t=m.getDateTimePickerGeneric(e,e.editStyle);break}case"Input":{t=m.getInputTemplate(e);break}case"InputWithUnit":{t=m.getInputWithUnitTemplate(e);break}case"InputWithValueHelp":{t=m.getInputWithValueHelpTemplate(e);break}case"RatingIndicator":t=m.getRatingIndicatorTemplate(e);break;case"TextArea":t=m.getTextAreaTemplate(e);break;default:}return t}};return m},false);
//# sourceMappingURL=EditStyle.js.map