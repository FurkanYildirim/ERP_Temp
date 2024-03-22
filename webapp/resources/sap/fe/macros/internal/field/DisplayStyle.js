/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/StableIdHelper","sap/fe/core/templating/CriticalityFormatters","sap/fe/core/templating/DataModelPathHelper","sap/fe/core/templating/UIFormatters","sap/fe/macros/field/FieldHelper","sap/ui/mdc/enum/EditMode"],function(e,t,a,i,n,r,l,s){"use strict";var o=r.hasValidAnalyticalCurrencyOrUnit;var d=n.enhanceDataModelPath;var c=i.buildExpressionForCriticalityIcon;var p=i.buildExpressionForCriticalityColor;var m=i.buildExpressionForCriticalityButtonType;var u=a.generate;var $=e.xml;const f={getAmountWithCurrencyTemplate(e){if(e.formatOptions.isAnalytics){return $`<controls:ConditionalWrapper xmlns:controls="sap.fe.macros.controls" visible="${e.displayVisible}" condition="${e.hasValidAnalyticalCurrencyOrUnit}">
			<controls:contentTrue>
				<u:Currency
					xmlns:u="sap.ui.unified"
					stringValue="${e.valueAsStringBindingExpression}"
					currency="${e.unitBindingExpression}"
					useSymbol="false"
					maxPrecision="5"
				/>
			</controls:contentTrue>
			<controls:contentFalse>
				<u:Currency xmlns:u="sap.ui.unified" stringValue="" currency="*" useSymbol="false" />
			</controls:contentFalse>
		</controls:ConditionalWrapper>`}else{return $`<coreControls:FormElementWrapper xmlns:coreControls="sap.fe.core.controls"
			formDoNotAdjustWidth="true"
			width="${e.formatOptions.textAlignMode==="Table"?"100%":undefined}"
		>
			<u:Currency
				xmlns:u="sap.ui.unified"
				visible="${e.displayVisible}"
				stringValue="${e.valueAsStringBindingExpression}"
				currency="${e.unitBindingExpression}"
				useSymbol="false"
				maxPrecision="5"
			/>
		</coreControls:FormElementWrapper>`}},getAvatarTemplate(e){let t;if(e._flexId){t=e._flexId}else if(e.idPrefix){t=u([e.idPrefix,"Field-content"])}return $`
				<controls:FormElementWrapper
					xmlns:controls="sap.fe.core.controls"
					visible="${e.avatarVisible}"
				>
				<Avatar
					xmlns="sap.m"
					id="${t}"
					src="${e.avatarSrc}"
					displaySize="S"
					class="sapUiSmallMarginEnd"
					displayShape="Square"
				/>
			</controls:FormElementWrapper>`},getButtonTemplate:e=>{var a,i,n;const r=t.convertMetaModelContext(e.dataField);const s=t.getInvolvedDataModelObjects(e.dataField,e.entitySet);const o=((a=e.formatOptions)===null||a===void 0?void 0:a.showIconUrl)??false?r.IconUrl:undefined;const d=!(((i=e.formatOptions)===null||i===void 0?void 0:i.showIconUrl)??false)?r.Label:undefined;const c=((n=e.formatOptions)===null||n===void 0?void 0:n.showIconUrl)??false?r.Label:undefined;let p="";if(r.$Type==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"){p=$`<Button
				xmlns="sap.m"
				visible="${e.visible}"
				text="${d}"
				icon="${o}"
				enabled="${e.navigationAvailable}"
				tooltip="${c}"
				press="${e.buttonPress}"
			/>`}else if(l.isDataFieldActionButtonVisible(void 0,r,e.buttonIsBound,e.buttonOperationAvailable)){const t=l.isDataFieldActionButtonEnabled(r,e.buttonIsBound,e.buttonOperationAvailable,e.buttonOperationAvailableFormatted);const a=m(s);p=$`<Button
				xmlns="sap.m"
			    class="${e.class}"
				text="${d}"
				icon="${o}"
				tooltip="${c}"
				press="${e.buttonPress}"
				enabled="${t}"
				visible="${e.visible}"
				type="${a}"
				/>`}return p},getContactTemplate(e){const t=e.dataField.getModel().createBindingContext("Target/$AnnotationPath",e.dataField);return $`
		<macros:Contact
			idPrefix="${e.idPrefix}"
			ariaLabelledBy="${e.ariaLabelledBy}"
			metaPath="${t}"
			contextPath="${e.entitySet}"
			_flexId="${e._flexId}"
			visible="${e.contactVisible}"
		/>`},getDataPointInnerPart(e,a){const i=t.convertMetaModelContext(e.dataField);const n=i.$Type==="com.sap.vocabularies.UI.v1.DataFieldForAnnotation"?e.dataField.getModel().createBindingContext("Target/$AnnotationPath",e.dataField):e.dataField;const r=$`<internalMacro:formatOptions
				xmlns:internalMacro="sap.fe.macros.internal"
				measureDisplayMode="${e.formatOptions.measureDisplayMode}"
				showEmptyIndicator="${e.formatOptions.showEmptyIndicator}"
				isAnalytics="${e.formatOptions.isAnalytics}"
			/>`;return $`<internalMacro:DataPoint
			xmlns:internalMacro="sap.fe.macros.internal"
			idPrefix="${e.idPrefix}"
			visible="${!a?e.displayVisible:""}"
			ariaLabelledBy="${e.ariaLabelledBy}"
			_flexId="${e._flexId}"
			metaPath="${n}"
			contextPath="${e.entitySet}"
		>
			${r}
		</internalMacro:DataPoint>`},getDataPointTemplate(e){if((e.formatOptions.isAnalytics??false)&&(e.hasUnitOrCurrency??false)){return $`<controls:ConditionalWrapper xmlns:controls="sap.fe.macros.controls" visible="${e.displayVisible}" condition="${e.hasValidAnalyticalCurrencyOrUnit}">
				<controls:contentTrue>
					 ${this.getDataPointInnerPart(e,true)}
				</controls:contentTrue>
					<controls:contentFalse>
						<Text xmlns="sap.m" text="*" />
				</controls:contentFalse>
			</controls:ConditionalWrapper>`}else{return this.getDataPointInnerPart(e,false)}},getExpandableText(e){var t,a;return $`
			<ExpandableText
				xmlns="sap.m"
				id="${e===null||e===void 0?void 0:e.noWrapperId}"
				visible="${e===null||e===void 0?void 0:e.displayVisible}"
				text="${e===null||e===void 0?void 0:e.text}"
				overflowMode="${e===null||e===void 0?void 0:(t=e.formatOptions)===null||t===void 0?void 0:t.textExpandBehaviorDisplay}"
				maxCharacters="${e===null||e===void 0?void 0:(a=e.formatOptions)===null||a===void 0?void 0:a.textMaxCharactersDisplay}"
				emptyIndicatorMode="${e===null||e===void 0?void 0:e.emptyIndicatorMode}"
		/>`},getFileTemplate(e){let t;if(e.fileIsImage){t=$`
			<controls:avatar xmlns:controls="sap.fe.macros.controls">
				<Avatar
					xmlns="sap.m"
					visible="${e.displayVisible}"
					src="${e.fileAvatarSrc}"
					displaySize="S"
					class="sapUiSmallMarginEnd"
					displayShape="Square">
					<customData>
						<ImageCustomData paramName="xcache" />
					</customData>
				</Avatar>
			</controls:avatar>`}else{t=$`
			<controls:icon xmlns:controls="sap.fe.macros.controls">
				<core:Icon src="${e.fileIconSrc}" class="sapUiSmallMarginEnd" visible="${e.fileStreamNotEmpty}" />
			</controls:icon>
			<controls:link>
				<Link
					xmlns="sap.m"
					text="${e.fileLinkText}"
					target="_blank"
					href="${e.fileLinkHref}"
					visible="${e.fileStreamNotEmpty}"
					wrapping="true"
				/>
			</controls:link>
			<controls:text>
				<Text xmlns="sap.m" emptyIndicatorMode="On" text="" visible="${e.fileTextVisible}" />
			</controls:text>`}if(e.editMode!==s.Display){const a=e.collaborationEnabled?"FIELDRUNTIME.handleOpenUploader":undefined;const i=e.collaborationEnabled?"FIELDRUNTIME.handleCloseUploader":undefined;t+=$`
			<controls:fileUploader xmlns:controls="sap.fe.macros.controls">
				<u:FileUploader
					xmlns:u="sap.ui.unified"
					name="FEV4FileUpload"
					visible="${e.editableExpression}"
					buttonOnly="true"
					iconOnly="true"
					multiple="false"
					tooltip="{sap.fe.i18n>M_FIELD_FILEUPLOADER_UPLOAD_BUTTON_TOOLTIP}"
					icon="sap-icon://upload"
					style="Transparent"
					sendXHR="true"
					useMultipart="false"
					sameFilenameAllowed="true"
					mimeType="${e.fileAcceptableMediaTypes}"
					typeMissmatch="FIELDRUNTIME.handleTypeMissmatch"
					maximumFileSize="${e.fileMaximumSize}"
					fileSizeExceed="FIELDRUNTIME.handleFileSizeExceed"
					uploadOnChange="false"
					uploadComplete="FIELDRUNTIME.handleUploadComplete($event, ${e.fileFilenameExpression||"undefined"}, '${e.fileRelativePropertyPath}', $controller)"
					httpRequestMethod="Put"
					change="FIELDRUNTIME.uploadStream($controller, $event)"
					beforeDialogOpen="${a}"
					afterDialogClose="${i}"
					uploadStart="FIELDRUNTIME.handleOpenUploader"
				/>
			</controls:fileUploader>
			<controls:deleteButton>
				<Button
					xmlns="sap.m"
					icon="sap-icon://sys-cancel"
					type="Transparent"
					press="FIELDRUNTIME.removeStream($event, ${e.fileFilenameExpression||"undefined"}, '${e.fileRelativePropertyPath}', $controller)"
					tooltip="{sap.fe.i18n>M_FIELD_FILEUPLOADER_DELETE_BUTTON_TOOLTIP}"
					visible="${e.editableExpression}"
					enabled="${e.fileStreamNotEmpty}"
				/>
			</controls:deleteButton>`}return $`
			<controls:FileWrapper
				xmlns:controls="sap.fe.macros.controls"
				core:require="{FIELDRUNTIME: 'sap/fe/macros/field/FieldRuntime'}"
				visible="${e.visible}"
				uploadUrl="${e.fileUploadUrl}"
				propertyPath="${e.fileRelativePropertyPath}"
				filename="${e.fileFilenamePath}"
				mediaType="${e.fileMediaType}"
				fieldGroupIds="${e.fieldGroupIds}"
				validateFieldGroup="FIELDRUNTIME.onValidateFieldGroup($controller, $event)"
				customData:sourcePath="${e.dataSourcePath}"
			>${t}</controls:FileWrapper>`},getLinkTemplate(e){if(e.linkIsDataFieldWithNavigationPath){return $`<Link
				xmlns="sap.m"
				id="${e.noWrapperId}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				visible="${e.displayVisible}"
				text="${e.text}"
				press="${e.linkPress}"
				ariaLabelledBy="${e.ariaLabelledBy}"
				emptyIndicatorMode="${e.emptyIndicatorMode}"
				class="sapMTextRenderWhitespaceWrap"
			/>`}else if(e.linkIsDataFieldWithIntentBasedNavigation){return $`<Link
				xmlns="sap.m"
				id="${e.noWrapperId}"
				core:require="{WSR: 'sap/base/strings/whitespaceReplacer'}"
				visible="${e.displayVisible}"
				text="${e.text}"
				press="${e.linkPress}"
				ariaLabelledBy="${e.ariaLabelledBy}"
				emptyIndicatorMode="${e.emptyIndicatorMode}"
				class="sapMTextRenderWhitespaceWrap"
			/>`}else if(e.linkIsEmailAddress||e.linkIsPhoneNumber){return $`<Link
				xmlns="sap.m"
				id="${e.noWrapperId}"
				core:require="{WSR: 'sap/base/strings/whitespaceReplacer'}"
				visible="${e.displayVisible}"
				text="${e.text}"
				href="${e.linkUrl}"
				ariaLabelledBy="${e.ariaLabelledBy}"
				emptyIndicatorMode="${e.emptyIndicatorMode}"
				class="sapMTextRenderWhitespaceWrap"
			/>`}else if(e.linkIsDataFieldWithAction){return $`<Link
				xmlns="sap.m"
				id="${e.noWrapperId}"
				visible="${e.displayVisible}"
				text="${e.text}"
				press="${e.linkPress}"
				ariaLabelledBy="${e.ariaLabelledBy}"
				emptyIndicatorMode="${e.emptyIndicatorMode}"
				class="sapMTextRenderWhitespaceWrap"
			/>`}else if(e.iconUrl){return $`<ObjectStatus
				xmlns="sap.m"
				core:require="{WSR: 'sap/base/strings/whitespaceReplacer', FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				id="${e.noWrapperId}"
				icon="${e.iconUrl}"
				visible="${e.displayVisible}"
				text="${e.text}"
				press="FieldRuntime.openExternalLink"
				active="true"
				emptyIndicatorMode="${e.emptyIndicatorMode}"
				customData:url="${e.linkUrl}"
			/>`}else{return $`<Link
				xmlns="sap.m"
				id="${e.noWrapperId}"
				core:require="{WSR: 'sap/base/strings/whitespaceReplacer'}"
				visible="${e.displayVisible}"
				text="${e.text}"
				href="${e.linkUrl}"
				target="_top"
				wrapping="${e.wrap===undefined?true:e.wrap}"
				ariaLabelledBy="${e.ariaLabelledBy}"
				emptyIndicatorMode="${e.emptyIndicatorMode}"
			/>`}},getLinkWithQuickViewTemplate(e){return $`<Link
			xmlns="sap.m"
			xmlns:core="sap.ui.core"
			id="${e.noWrapperId}"
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime', WSR: 'sap/base/strings/whitespaceReplacer'}"
			text="${e.formatOptions.retrieveTextFromValueList?e.textFromValueList:e.text}"
			visible="${e.displayVisible}"
			wrapping="${e.wrap===undefined?true:e.wrap}"
			press="FieldRuntime.pressLink"
			ariaLabelledBy="${e.ariaLabelledBy}"
			emptyIndicatorMode="${e.emptyIndicatorMode}"
		>
			<dependents>
				<macro:QuickView xmlns:macro="sap.fe.macros" dataField="${e.dataField}" semanticObject="${e.semanticObject}" contextPath="${e.entitySet}" />
			</dependents>
		</Link>`},getTextTemplate(e){if(e.formatOptions.isAnalytics&&e.hasUnitOrCurrency){return $`<controls:ConditionalWrapper xmlns:controls="sap.fe.macros.controls" visible="${e.displayVisible}" condition="${e.hasValidAnalyticalCurrencyOrUnit}">
			<controls:contentTrue>
					<Text xmlns="sap.m"
						id="${e.noWrapperId}"
						text="${e.text}"
						emptyIndicatorMode="${e.emptyIndicatorMode}"
						renderWhitespace="true"
						wrapping="${e.wrap}"
					/>
				</controls:contentTrue>
				<controls:contentFalse>
					<Text xmlns="sap.m" id="${e.noWrapperId}" text="*" />
				</controls:contentFalse>
			</controls:ConditionalWrapper>
		`}else if(e.formatOptions.retrieveTextFromValueList){return $`<Text
				xmlns="sap.m"
				id="${e.noWrapperId}"
				visible="${e.displayVisible}"
				text="${e.textFromValueList}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				emptyIndicatorMode="${e.emptyIndicatorMode}"
				renderWhitespace="true"
			/>`}else{return $`<Text
				xmlns="sap.m"
				id="${e.noWrapperId}"
				visible="${e.displayVisible}"
				text="${e.text}"
				wrapping="${e.wrap}"
				emptyIndicatorMode="${e.emptyIndicatorMode}"
				renderWhitespace="true"
		/>`}},getObjectIdentifier(e){const t=e.hasQuickView?$`<dependents>
	<macro:QuickView xmlns:macro="sap.fe.macros" dataField="${e.dataField}" semanticObject="${e.semanticObject}" contextPath="${e.entitySet}" />
</dependents>`:"";let a=$`<ObjectIdentifier
	xmlns="sap.m"
	core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
	id="${e.noWrapperId}"
	title="${e.identifierTitle}"
	text="${e.identifierText}"
	titleActive="${e.hasQuickView}"
	titlePress="FieldRuntime.pressLink"
	ariaLabelledBy="${e.ariaLabelledBy}"
	emptyIndicatorMode="${e.emptyIndicatorMode}">
${t}</ObjectIdentifier>`;if(e.hasSituationsIndicator){a=$`<HBox xmlns="sap.m" alignItems="Center" justifyContent="SpaceBetween" width="100%">
							${a}
							<SituationsIndicator
								xmlns="sap.fe.macros.internal.situations"
								entitySet="${e.entitySet}"
								propertyPath="${e.situationsIndicatorPropertyPath}"
							/>
						</HBox>`}if(e.showErrorIndicator){a=$`<VBox xmlns="sap.m">
				${a}
					<ObjectStatus
						xmlns="sap.m"
						visible="${e.showErrorObjectStatus}"
						class="sapUiSmallMarginBottom"
						text="{sap.fe.i18n>Contains_Errors}"
						state="Error"
					/>
			</VBox>`}return $`${a}`},getObjectStatus(e){let a;const i=t.getInvolvedDataModelObjects(e.dataField,e.entitySet);const n=d(i,i.targetObject.Value.path);const r=o(n);const l=t.getInvolvedDataModelObjects(e.dataField);const s=c(l);const m=p(l);if(e.formatOptions.isAnalytics&&e.hasUnitOrCurrency){a=$`<controls:ConditionalWrapper xmlns:controls="sap.fe.macros.controls"
			id="${e.noWrapperId}"
			condition="${r}"
		>
			<controls:contentTrue>
				<ObjectStatus
					xmlns="sap.m"
					icon="${s}"
					state="${m}"
					visible="${e.displayVisible}"
					text="${e.text}"
					emptyIndicatorMode="${e.emptyIndicatorMode}"
					class="sapMTextRenderWhitespaceWrap"
				/>
			</controls:contentTrue>
			<controls:contentFalse>
				<ObjectStatus xmlns="sap.m" text="*" visible="${e.displayVisible}" />
			</controls:contentFalse>
		</controls:ConditionalWrapper>`}else{let t="";let i=false;let n;if(e.hasQuickView){t=$`<dependents>
					<macro:QuickView xmlns:macro="sap.fe.macros" dataField="${e.dataField}" semanticObject="${e.semanticObject}" contextPath="${e.entitySet}" />
				</dependents>`;i=true;n="FieldRuntime.pressLink"}if(e.linkUrl){i=true;n="FieldRuntime.openExternalLink"}a=$`<ObjectStatus
				xmlns="sap.m"
				id="${e.noWrapperId}"
				icon="${s}"
				state="${m}"
				text="${e.text}"
				visible="${e.displayVisible}"
				emptyIndicatorMode="${e.emptyIndicatorMode}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				active="${i}"
				press="${n}"
				customData:url="${e.linkUrl}"
			>
			${t}
		</ObjectStatus>`}return a},getLabelSemanticKey(e){if(e.hasQuickView){return $`<Link
				xmlns="sap.m"
				text="${e.text}"
				wrapping="true"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				press="FieldRuntime.pressLink"
				ariaLabelledBy="${e.ariaLabelledBy}"
				emptyIndicatorMode="${e.emptyIndicatorMode}">
					<dependents>
						<macro:QuickView xmlns:macro="sap.fe.macros" dataField="${e.dataField}" semanticObject="${e.semanticObject}" contextPath="${e.entitySet}" />
					</dependents>
				</Link>`}return $`<Label
				xmlns="sap.m"
				id="${e.noWrapperId}"
				visible="${e.displayVisible}"
				text="${e.identifierTitle}"
				design="Bold"/>`},getSemanticKeyWithDraftIndicatorTemplate(e){let t=e.formatOptions.semanticKeyStyle==="ObjectIdentifier"?f.getObjectIdentifier(e):f.getLabelSemanticKey(e);if(!e.formatOptions.fieldGroupDraftIndicatorPropertyPath){t=$`<controls:FormElementWrapper
										xmlns:controls="sap.fe.core.controls"
										visible="${e.displayVisible}">
										<VBox
										xmlns="sap.m"
										class="${l.getMarginClass(e.formatOptions.compactSemanticKey)}">
											${t}
											<macro:DraftIndicator
												xmlns:macro="sap.fe.macros"
												draftIndicatorType="IconAndText"
												entitySet="${e.entitySet}"
												isDraftIndicatorVisible="${e.draftIndicatorVisible}"
												ariaLabelledBy="${e.ariaLabelledBy}"/>
										</VBox>
									</controls:FormElementWrapper>`}return t},getTemplate:e=>{let t;switch(e.displayStyle){case"AmountWithCurrency":t=f.getAmountWithCurrencyTemplate(e);break;case"Avatar":t=f.getAvatarTemplate(e);break;case"Button":t=f.getButtonTemplate(e);break;case"Contact":t=f.getContactTemplate(e);break;case"DataPoint":t=f.getDataPointTemplate(e);break;case"ExpandableText":t=f.getExpandableText(e);break;case"File":t=f.getFileTemplate(e);break;case"Link":t=f.getLinkTemplate(e);break;case"LinkWithQuickView":t=f.getLinkWithQuickViewTemplate(e);break;case"ObjectIdentifier":t=f.getObjectIdentifier(e);break;case"ObjectStatus":{t=f.getObjectStatus(e);break}case"LabelSemanticKey":t=f.getLabelSemanticKey(e);break;case"SemanticKeyWithDraftIndicator":t=f.getSemanticKeyWithDraftIndicatorTemplate(e);break;case"Text":t=f.getTextTemplate(e);break}return t}};return f},false);
//# sourceMappingURL=DisplayStyle.js.map