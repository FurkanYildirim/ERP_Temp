/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/CriticalityFormatters", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/field/FieldHelper", "sap/ui/mdc/enum/EditMode"], function (BuildingBlockTemplateProcessor, MetaModelConverter, StableIdHelper, CriticalityFormatters, DataModelPathHelper, UIFormatters, FieldHelper, EditMode) {
  "use strict";

  var hasValidAnalyticalCurrencyOrUnit = UIFormatters.hasValidAnalyticalCurrencyOrUnit;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var buildExpressionForCriticalityIcon = CriticalityFormatters.buildExpressionForCriticalityIcon;
  var buildExpressionForCriticalityColor = CriticalityFormatters.buildExpressionForCriticalityColor;
  var buildExpressionForCriticalityButtonType = CriticalityFormatters.buildExpressionForCriticalityButtonType;
  var generate = StableIdHelper.generate;
  var xml = BuildingBlockTemplateProcessor.xml;
  const DisplayStyle = {
    /**
     * Generates the AmountWithCurrency template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getAmountWithCurrencyTemplate(internalField) {
      if (internalField.formatOptions.isAnalytics) {
        return xml`<controls:ConditionalWrapper xmlns:controls="sap.fe.macros.controls" visible="${internalField.displayVisible}" condition="${internalField.hasValidAnalyticalCurrencyOrUnit}">
			<controls:contentTrue>
				<u:Currency
					xmlns:u="sap.ui.unified"
					stringValue="${internalField.valueAsStringBindingExpression}"
					currency="${internalField.unitBindingExpression}"
					useSymbol="false"
					maxPrecision="5"
				/>
			</controls:contentTrue>
			<controls:contentFalse>
				<u:Currency xmlns:u="sap.ui.unified" stringValue="" currency="*" useSymbol="false" />
			</controls:contentFalse>
		</controls:ConditionalWrapper>`;
      } else {
        return xml`<coreControls:FormElementWrapper xmlns:coreControls="sap.fe.core.controls"
			formDoNotAdjustWidth="true"
			width="${internalField.formatOptions.textAlignMode === "Table" ? "100%" : undefined}"
		>
			<u:Currency
				xmlns:u="sap.ui.unified"
				visible="${internalField.displayVisible}"
				stringValue="${internalField.valueAsStringBindingExpression}"
				currency="${internalField.unitBindingExpression}"
				useSymbol="false"
				maxPrecision="5"
			/>
		</coreControls:FormElementWrapper>`;
      }
    },
    /**
     * Generates the Avatar template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getAvatarTemplate(internalField) {
      let avatarId;
      if (internalField._flexId) {
        avatarId = internalField._flexId;
      } else if (internalField.idPrefix) {
        avatarId = generate([internalField.idPrefix, "Field-content"]);
      }
      return xml`
				<controls:FormElementWrapper
					xmlns:controls="sap.fe.core.controls"
					visible="${internalField.avatarVisible}"
				>
				<Avatar
					xmlns="sap.m"
					id="${avatarId}"
					src="${internalField.avatarSrc}"
					displaySize="S"
					class="sapUiSmallMarginEnd"
					displayShape="Square"
				/>
			</controls:FormElementWrapper>`;
    },
    /**
     * Generates the button template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getButtonTemplate: internalField => {
      var _internalField$format, _internalField$format2, _internalField$format3;
      const convertedDataField = MetaModelConverter.convertMetaModelContext(internalField.dataField);
      const oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(internalField.dataField, internalField.entitySet);
      const icon = ((_internalField$format = internalField.formatOptions) === null || _internalField$format === void 0 ? void 0 : _internalField$format.showIconUrl) ?? false ? convertedDataField.IconUrl : undefined;
      const text = !(((_internalField$format2 = internalField.formatOptions) === null || _internalField$format2 === void 0 ? void 0 : _internalField$format2.showIconUrl) ?? false) ? convertedDataField.Label : undefined;
      const tooltip = ((_internalField$format3 = internalField.formatOptions) === null || _internalField$format3 === void 0 ? void 0 : _internalField$format3.showIconUrl) ?? false ? convertedDataField.Label : undefined;
      let button = "";
      if (convertedDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
        button = xml`<Button
				xmlns="sap.m"
				visible="${internalField.visible}"
				text="${text}"
				icon="${icon}"
				enabled="${internalField.navigationAvailable}"
				tooltip="${tooltip}"
				press="${internalField.buttonPress}"
			/>`;
      } else if (FieldHelper.isDataFieldActionButtonVisible(void 0, convertedDataField, internalField.buttonIsBound, internalField.buttonOperationAvailable)) {
        const enabled = FieldHelper.isDataFieldActionButtonEnabled(convertedDataField, internalField.buttonIsBound, internalField.buttonOperationAvailable, internalField.buttonOperationAvailableFormatted);
        const type = buildExpressionForCriticalityButtonType(oDataModelPath);
        button = xml`<Button
				xmlns="sap.m"
			    class="${internalField.class}"
				text="${text}"
				icon="${icon}"
				tooltip="${tooltip}"
				press="${internalField.buttonPress}"
				enabled="${enabled}"
				visible="${internalField.visible}"
				type="${type}"
				/>`;
      }
      return button;
    },
    /**
     * Generates the Contact template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getContactTemplate(internalField) {
      const contextMetaPath = internalField.dataField.getModel().createBindingContext("Target/$AnnotationPath", internalField.dataField);
      return xml`
		<macros:Contact
			idPrefix="${internalField.idPrefix}"
			ariaLabelledBy="${internalField.ariaLabelledBy}"
			metaPath="${contextMetaPath}"
			contextPath="${internalField.entitySet}"
			_flexId="${internalField._flexId}"
			visible="${internalField.contactVisible}"
		/>`;
    },
    /**
     * Generates the innerpart of the data point to be used in getDataPointTemplate.
     *
     * @param internalField Reference to the current internal field instance
     * @param withConditionalWrapper Boolean value to determine whether the DataPoint
     * 					  			shall be generated for the conditional wrapper case
     * @returns An XML-based string with the definition of the field control
     */
    getDataPointInnerPart(internalField, withConditionalWrapper) {
      const convertedDataField = MetaModelConverter.convertMetaModelContext(internalField.dataField);
      const metaPath = convertedDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" ? internalField.dataField.getModel().createBindingContext("Target/$AnnotationPath", internalField.dataField) : internalField.dataField;
      const formatOptions = xml`<internalMacro:formatOptions
				xmlns:internalMacro="sap.fe.macros.internal"
				measureDisplayMode="${internalField.formatOptions.measureDisplayMode}"
				showEmptyIndicator="${internalField.formatOptions.showEmptyIndicator}"
				isAnalytics="${internalField.formatOptions.isAnalytics}"
			/>`;
      return xml`<internalMacro:DataPoint
			xmlns:internalMacro="sap.fe.macros.internal"
			idPrefix="${internalField.idPrefix}"
			visible="${!withConditionalWrapper ? internalField.displayVisible : ""}"
			ariaLabelledBy="${internalField.ariaLabelledBy}"
			_flexId="${internalField._flexId}"
			metaPath="${metaPath}"
			contextPath="${internalField.entitySet}"
		>
			${formatOptions}
		</internalMacro:DataPoint>`;
    },
    /**
     * Generates the DataPoint template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getDataPointTemplate(internalField) {
      if ((internalField.formatOptions.isAnalytics ?? false) && (internalField.hasUnitOrCurrency ?? false)) {
        return xml`<controls:ConditionalWrapper xmlns:controls="sap.fe.macros.controls" visible="${internalField.displayVisible}" condition="${internalField.hasValidAnalyticalCurrencyOrUnit}">
				<controls:contentTrue>
					 ${this.getDataPointInnerPart(internalField, true)}
				</controls:contentTrue>
					<controls:contentFalse>
						<Text xmlns="sap.m" text="*" />
				</controls:contentFalse>
			</controls:ConditionalWrapper>`;
      } else {
        return this.getDataPointInnerPart(internalField, false);
      }
    },
    /**
     * Generates the ExpandableText template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getExpandableText(internalField) {
      var _internalField$format4, _internalField$format5;
      return xml`
			<ExpandableText
				xmlns="sap.m"
				id="${internalField === null || internalField === void 0 ? void 0 : internalField.noWrapperId}"
				visible="${internalField === null || internalField === void 0 ? void 0 : internalField.displayVisible}"
				text="${internalField === null || internalField === void 0 ? void 0 : internalField.text}"
				overflowMode="${internalField === null || internalField === void 0 ? void 0 : (_internalField$format4 = internalField.formatOptions) === null || _internalField$format4 === void 0 ? void 0 : _internalField$format4.textExpandBehaviorDisplay}"
				maxCharacters="${internalField === null || internalField === void 0 ? void 0 : (_internalField$format5 = internalField.formatOptions) === null || _internalField$format5 === void 0 ? void 0 : _internalField$format5.textMaxCharactersDisplay}"
				emptyIndicatorMode="${internalField === null || internalField === void 0 ? void 0 : internalField.emptyIndicatorMode}"
		/>`;
    },
    /**
     * Generates the File template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getFileTemplate(internalField) {
      let innerFilePart;
      if (internalField.fileIsImage) {
        innerFilePart = xml`
			<controls:avatar xmlns:controls="sap.fe.macros.controls">
				<Avatar
					xmlns="sap.m"
					visible="${internalField.displayVisible}"
					src="${internalField.fileAvatarSrc}"
					displaySize="S"
					class="sapUiSmallMarginEnd"
					displayShape="Square">
					<customData>
						<ImageCustomData paramName="xcache" />
					</customData>
				</Avatar>
			</controls:avatar>`;
      } else {
        innerFilePart = xml`
			<controls:icon xmlns:controls="sap.fe.macros.controls">
				<core:Icon src="${internalField.fileIconSrc}" class="sapUiSmallMarginEnd" visible="${internalField.fileStreamNotEmpty}" />
			</controls:icon>
			<controls:link>
				<Link
					xmlns="sap.m"
					text="${internalField.fileLinkText}"
					target="_blank"
					href="${internalField.fileLinkHref}"
					visible="${internalField.fileStreamNotEmpty}"
					wrapping="true"
				/>
			</controls:link>
			<controls:text>
				<Text xmlns="sap.m" emptyIndicatorMode="On" text="" visible="${internalField.fileTextVisible}" />
			</controls:text>`;
      }
      if (internalField.editMode !== EditMode.Display) {
        const beforeDialogOpen = internalField.collaborationEnabled ? "FIELDRUNTIME.handleOpenUploader" : undefined;
        const afterDialogOpen = internalField.collaborationEnabled ? "FIELDRUNTIME.handleCloseUploader" : undefined;
        innerFilePart += xml`
			<controls:fileUploader xmlns:controls="sap.fe.macros.controls">
				<u:FileUploader
					xmlns:u="sap.ui.unified"
					name="FEV4FileUpload"
					visible="${internalField.editableExpression}"
					buttonOnly="true"
					iconOnly="true"
					multiple="false"
					tooltip="{sap.fe.i18n>M_FIELD_FILEUPLOADER_UPLOAD_BUTTON_TOOLTIP}"
					icon="sap-icon://upload"
					style="Transparent"
					sendXHR="true"
					useMultipart="false"
					sameFilenameAllowed="true"
					mimeType="${internalField.fileAcceptableMediaTypes}"
					typeMissmatch="FIELDRUNTIME.handleTypeMissmatch"
					maximumFileSize="${internalField.fileMaximumSize}"
					fileSizeExceed="FIELDRUNTIME.handleFileSizeExceed"
					uploadOnChange="false"
					uploadComplete="FIELDRUNTIME.handleUploadComplete($event, ${internalField.fileFilenameExpression || "undefined"}, '${internalField.fileRelativePropertyPath}', $controller)"
					httpRequestMethod="Put"
					change="FIELDRUNTIME.uploadStream($controller, $event)"
					beforeDialogOpen="${beforeDialogOpen}"
					afterDialogClose="${afterDialogOpen}"
					uploadStart="FIELDRUNTIME.handleOpenUploader"
				/>
			</controls:fileUploader>
			<controls:deleteButton>
				<Button
					xmlns="sap.m"
					icon="sap-icon://sys-cancel"
					type="Transparent"
					press="FIELDRUNTIME.removeStream($event, ${internalField.fileFilenameExpression || "undefined"}, '${internalField.fileRelativePropertyPath}', $controller)"
					tooltip="{sap.fe.i18n>M_FIELD_FILEUPLOADER_DELETE_BUTTON_TOOLTIP}"
					visible="${internalField.editableExpression}"
					enabled="${internalField.fileStreamNotEmpty}"
				/>
			</controls:deleteButton>`;
      }
      return xml`
			<controls:FileWrapper
				xmlns:controls="sap.fe.macros.controls"
				core:require="{FIELDRUNTIME: 'sap/fe/macros/field/FieldRuntime'}"
				visible="${internalField.visible}"
				uploadUrl="${internalField.fileUploadUrl}"
				propertyPath="${internalField.fileRelativePropertyPath}"
				filename="${internalField.fileFilenamePath}"
				mediaType="${internalField.fileMediaType}"
				fieldGroupIds="${internalField.fieldGroupIds}"
				validateFieldGroup="FIELDRUNTIME.onValidateFieldGroup($controller, $event)"
				customData:sourcePath="${internalField.dataSourcePath}"
			>${innerFilePart}</controls:FileWrapper>`;
    },
    /**
     * Generates the Link template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getLinkTemplate(internalField) {
      if (internalField.linkIsDataFieldWithNavigationPath) {
        return xml`<Link
				xmlns="sap.m"
				id="${internalField.noWrapperId}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				visible="${internalField.displayVisible}"
				text="${internalField.text}"
				press="${internalField.linkPress}"
				ariaLabelledBy="${internalField.ariaLabelledBy}"
				emptyIndicatorMode="${internalField.emptyIndicatorMode}"
				class="sapMTextRenderWhitespaceWrap"
			/>`;
      } else if (internalField.linkIsDataFieldWithIntentBasedNavigation) {
        return xml`<Link
				xmlns="sap.m"
				id="${internalField.noWrapperId}"
				core:require="{WSR: 'sap/base/strings/whitespaceReplacer'}"
				visible="${internalField.displayVisible}"
				text="${internalField.text}"
				press="${internalField.linkPress}"
				ariaLabelledBy="${internalField.ariaLabelledBy}"
				emptyIndicatorMode="${internalField.emptyIndicatorMode}"
				class="sapMTextRenderWhitespaceWrap"
			/>`;
      } else if (internalField.linkIsEmailAddress || internalField.linkIsPhoneNumber) {
        return xml`<Link
				xmlns="sap.m"
				id="${internalField.noWrapperId}"
				core:require="{WSR: 'sap/base/strings/whitespaceReplacer'}"
				visible="${internalField.displayVisible}"
				text="${internalField.text}"
				href="${internalField.linkUrl}"
				ariaLabelledBy="${internalField.ariaLabelledBy}"
				emptyIndicatorMode="${internalField.emptyIndicatorMode}"
				class="sapMTextRenderWhitespaceWrap"
			/>`;
      } else if (internalField.linkIsDataFieldWithAction) {
        return xml`<Link
				xmlns="sap.m"
				id="${internalField.noWrapperId}"
				visible="${internalField.displayVisible}"
				text="${internalField.text}"
				press="${internalField.linkPress}"
				ariaLabelledBy="${internalField.ariaLabelledBy}"
				emptyIndicatorMode="${internalField.emptyIndicatorMode}"
				class="sapMTextRenderWhitespaceWrap"
			/>`;
      } else if (internalField.iconUrl) {
        return xml`<ObjectStatus
				xmlns="sap.m"
				core:require="{WSR: 'sap/base/strings/whitespaceReplacer', FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				id="${internalField.noWrapperId}"
				icon="${internalField.iconUrl}"
				visible="${internalField.displayVisible}"
				text="${internalField.text}"
				press="FieldRuntime.openExternalLink"
				active="true"
				emptyIndicatorMode="${internalField.emptyIndicatorMode}"
				customData:url="${internalField.linkUrl}"
			/>`;
      } else {
        return xml`<Link
				xmlns="sap.m"
				id="${internalField.noWrapperId}"
				core:require="{WSR: 'sap/base/strings/whitespaceReplacer'}"
				visible="${internalField.displayVisible}"
				text="${internalField.text}"
				href="${internalField.linkUrl}"
				target="_top"
				wrapping="${internalField.wrap === undefined ? true : internalField.wrap}"
				ariaLabelledBy="${internalField.ariaLabelledBy}"
				emptyIndicatorMode="${internalField.emptyIndicatorMode}"
			/>`;
      }
    },
    /**
     * Generates the LinkWithQuickView template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getLinkWithQuickViewTemplate(internalField) {
      return xml`<Link
			xmlns="sap.m"
			xmlns:core="sap.ui.core"
			id="${internalField.noWrapperId}"
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime', WSR: 'sap/base/strings/whitespaceReplacer'}"
			text="${internalField.formatOptions.retrieveTextFromValueList ? internalField.textFromValueList : internalField.text}"
			visible="${internalField.displayVisible}"
			wrapping="${internalField.wrap === undefined ? true : internalField.wrap}"
			press="FieldRuntime.pressLink"
			ariaLabelledBy="${internalField.ariaLabelledBy}"
			emptyIndicatorMode="${internalField.emptyIndicatorMode}"
		>
			<dependents>
				<macro:QuickView xmlns:macro="sap.fe.macros" dataField="${internalField.dataField}" semanticObject="${internalField.semanticObject}" contextPath="${internalField.entitySet}" />
			</dependents>
		</Link>`;
    },
    /**
     * Generates the Text template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getTextTemplate(internalField) {
      if (internalField.formatOptions.isAnalytics && internalField.hasUnitOrCurrency) {
        return xml`<controls:ConditionalWrapper xmlns:controls="sap.fe.macros.controls" visible="${internalField.displayVisible}" condition="${internalField.hasValidAnalyticalCurrencyOrUnit}">
			<controls:contentTrue>
					<Text xmlns="sap.m"
						id="${internalField.noWrapperId}"
						text="${internalField.text}"
						emptyIndicatorMode="${internalField.emptyIndicatorMode}"
						renderWhitespace="true"
						wrapping="${internalField.wrap}"
					/>
				</controls:contentTrue>
				<controls:contentFalse>
					<Text xmlns="sap.m" id="${internalField.noWrapperId}" text="*" />
				</controls:contentFalse>
			</controls:ConditionalWrapper>
		`;
      } else if (internalField.formatOptions.retrieveTextFromValueList) {
        return xml`<Text
				xmlns="sap.m"
				id="${internalField.noWrapperId}"
				visible="${internalField.displayVisible}"
				text="${internalField.textFromValueList}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				emptyIndicatorMode="${internalField.emptyIndicatorMode}"
				renderWhitespace="true"
			/>`;
      } else {
        return xml`<Text
				xmlns="sap.m"
				id="${internalField.noWrapperId}"
				visible="${internalField.displayVisible}"
				text="${internalField.text}"
				wrapping="${internalField.wrap}"
				emptyIndicatorMode="${internalField.emptyIndicatorMode}"
				renderWhitespace="true"
		/>`;
      }
    },
    /**
     * Generates the ObjectIdentifier template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getObjectIdentifier(internalField) {
      const dependents = internalField.hasQuickView ? xml`<dependents>
	<macro:QuickView xmlns:macro="sap.fe.macros" dataField="${internalField.dataField}" semanticObject="${internalField.semanticObject}" contextPath="${internalField.entitySet}" />
</dependents>` : "";
      let identifier = xml`<ObjectIdentifier
	xmlns="sap.m"
	core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
	id="${internalField.noWrapperId}"
	title="${internalField.identifierTitle}"
	text="${internalField.identifierText}"
	titleActive="${internalField.hasQuickView}"
	titlePress="FieldRuntime.pressLink"
	ariaLabelledBy="${internalField.ariaLabelledBy}"
	emptyIndicatorMode="${internalField.emptyIndicatorMode}">
${dependents}</ObjectIdentifier>`;
      if (internalField.hasSituationsIndicator) {
        identifier = xml`<HBox xmlns="sap.m" alignItems="Center" justifyContent="SpaceBetween" width="100%">
							${identifier}
							<SituationsIndicator
								xmlns="sap.fe.macros.internal.situations"
								entitySet="${internalField.entitySet}"
								propertyPath="${internalField.situationsIndicatorPropertyPath}"
							/>
						</HBox>`;
      }
      if (internalField.showErrorIndicator) {
        identifier = xml`<VBox xmlns="sap.m">
				${identifier}
					<ObjectStatus
						xmlns="sap.m"
						visible="${internalField.showErrorObjectStatus}"
						class="sapUiSmallMarginBottom"
						text="{sap.fe.i18n>Contains_Errors}"
						state="Error"
					/>
			</VBox>`;
      }
      return xml`${identifier}`;
    },
    /**
     * Generates the ObjectStatus template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getObjectStatus(internalField) {
      let objectStatus;
      const dataModelObjectPath = MetaModelConverter.getInvolvedDataModelObjects(internalField.dataField, internalField.entitySet);
      const enhancedValueDataModelPath = enhanceDataModelPath(dataModelObjectPath, dataModelObjectPath.targetObject.Value.path);
      const condition = hasValidAnalyticalCurrencyOrUnit(enhancedValueDataModelPath);
      const convertedDataField = MetaModelConverter.getInvolvedDataModelObjects(internalField.dataField);
      const criticalityIcon = buildExpressionForCriticalityIcon(convertedDataField);
      const state = buildExpressionForCriticalityColor(convertedDataField);
      if (internalField.formatOptions.isAnalytics && internalField.hasUnitOrCurrency) {
        objectStatus = xml`<controls:ConditionalWrapper xmlns:controls="sap.fe.macros.controls"
			id="${internalField.noWrapperId}"
			condition="${condition}"
		>
			<controls:contentTrue>
				<ObjectStatus
					xmlns="sap.m"
					icon="${criticalityIcon}"
					state="${state}"
					visible="${internalField.displayVisible}"
					text="${internalField.text}"
					emptyIndicatorMode="${internalField.emptyIndicatorMode}"
					class="sapMTextRenderWhitespaceWrap"
				/>
			</controls:contentTrue>
			<controls:contentFalse>
				<ObjectStatus xmlns="sap.m" text="*" visible="${internalField.displayVisible}" />
			</controls:contentFalse>
		</controls:ConditionalWrapper>`;
      } else {
        let dependents = "";
        let active = false;
        let pressAction;
        if (internalField.hasQuickView) {
          dependents = xml`<dependents>
					<macro:QuickView xmlns:macro="sap.fe.macros" dataField="${internalField.dataField}" semanticObject="${internalField.semanticObject}" contextPath="${internalField.entitySet}" />
				</dependents>`;
          active = true;
          pressAction = "FieldRuntime.pressLink";
        }
        if (internalField.linkUrl) {
          active = true;
          pressAction = "FieldRuntime.openExternalLink";
        }
        objectStatus = xml`<ObjectStatus
				xmlns="sap.m"
				id="${internalField.noWrapperId}"
				icon="${criticalityIcon}"
				state="${state}"
				text="${internalField.text}"
				visible="${internalField.displayVisible}"
				emptyIndicatorMode="${internalField.emptyIndicatorMode}"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				active="${active}"
				press="${pressAction}"
				customData:url="${internalField.linkUrl}"
			>
			${dependents}
		</ObjectStatus>`;
      }
      return objectStatus;
    },
    /**
     * Generates the LabelSemantickey template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getLabelSemanticKey(internalField) {
      if (internalField.hasQuickView) {
        return xml`<Link
				xmlns="sap.m"
				text="${internalField.text}"
				wrapping="true"
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				press="FieldRuntime.pressLink"
				ariaLabelledBy="${internalField.ariaLabelledBy}"
				emptyIndicatorMode="${internalField.emptyIndicatorMode}">
					<dependents>
						<macro:QuickView xmlns:macro="sap.fe.macros" dataField="${internalField.dataField}" semanticObject="${internalField.semanticObject}" contextPath="${internalField.entitySet}" />
					</dependents>
				</Link>`;
      }
      return xml`<Label
				xmlns="sap.m"
				id="${internalField.noWrapperId}"
				visible="${internalField.displayVisible}"
				text="${internalField.identifierTitle}"
				design="Bold"/>`;
    },
    /**
     * Generates the semantic key with draft indicator template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getSemanticKeyWithDraftIndicatorTemplate(internalField) {
      let semanticKeyTemplate = internalField.formatOptions.semanticKeyStyle === "ObjectIdentifier" ? DisplayStyle.getObjectIdentifier(internalField) : DisplayStyle.getLabelSemanticKey(internalField);
      if (!internalField.formatOptions.fieldGroupDraftIndicatorPropertyPath) {
        // if the draftIndicator is not handled at the fieldGroup level
        //TODO could this be a boolean no draftIndicator
        semanticKeyTemplate = xml`<controls:FormElementWrapper
										xmlns:controls="sap.fe.core.controls"
										visible="${internalField.displayVisible}">
										<VBox
										xmlns="sap.m"
										class="${FieldHelper.getMarginClass(internalField.formatOptions.compactSemanticKey)}">
											${semanticKeyTemplate}
											<macro:DraftIndicator
												xmlns:macro="sap.fe.macros"
												draftIndicatorType="IconAndText"
												entitySet="${internalField.entitySet}"
												isDraftIndicatorVisible="${internalField.draftIndicatorVisible}"
												ariaLabelledBy="${internalField.ariaLabelledBy}"/>
										</VBox>
									</controls:FormElementWrapper>`;
      }
      return semanticKeyTemplate;
    },
    /**
     * Entry point for further templating processings.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getTemplate: internalField => {
      let innerFieldContent;
      switch (internalField.displayStyle) {
        case "AmountWithCurrency":
          innerFieldContent = DisplayStyle.getAmountWithCurrencyTemplate(internalField);
          break;
        case "Avatar":
          innerFieldContent = DisplayStyle.getAvatarTemplate(internalField);
          break;
        case "Button":
          innerFieldContent = DisplayStyle.getButtonTemplate(internalField);
          break;
        case "Contact":
          innerFieldContent = DisplayStyle.getContactTemplate(internalField);
          break;
        case "DataPoint":
          innerFieldContent = DisplayStyle.getDataPointTemplate(internalField);
          break;
        case "ExpandableText":
          innerFieldContent = DisplayStyle.getExpandableText(internalField);
          break;
        case "File":
          innerFieldContent = DisplayStyle.getFileTemplate(internalField);
          break;
        case "Link":
          innerFieldContent = DisplayStyle.getLinkTemplate(internalField);
          break;
        case "LinkWithQuickView":
          innerFieldContent = DisplayStyle.getLinkWithQuickViewTemplate(internalField);
          break;
        case "ObjectIdentifier":
          innerFieldContent = DisplayStyle.getObjectIdentifier(internalField);
          break;
        case "ObjectStatus":
          {
            innerFieldContent = DisplayStyle.getObjectStatus(internalField);
            break;
          }
        case "LabelSemanticKey":
          innerFieldContent = DisplayStyle.getLabelSemanticKey(internalField);
          break;
        case "SemanticKeyWithDraftIndicator":
          innerFieldContent = DisplayStyle.getSemanticKeyWithDraftIndicatorTemplate(internalField);
          break;
        case "Text":
          innerFieldContent = DisplayStyle.getTextTemplate(internalField);
          break;
      }
      return innerFieldContent;
    }
  };
  return DisplayStyle;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaXNwbGF5U3R5bGUiLCJnZXRBbW91bnRXaXRoQ3VycmVuY3lUZW1wbGF0ZSIsImludGVybmFsRmllbGQiLCJmb3JtYXRPcHRpb25zIiwiaXNBbmFseXRpY3MiLCJ4bWwiLCJkaXNwbGF5VmlzaWJsZSIsImhhc1ZhbGlkQW5hbHl0aWNhbEN1cnJlbmN5T3JVbml0IiwidmFsdWVBc1N0cmluZ0JpbmRpbmdFeHByZXNzaW9uIiwidW5pdEJpbmRpbmdFeHByZXNzaW9uIiwidGV4dEFsaWduTW9kZSIsInVuZGVmaW5lZCIsImdldEF2YXRhclRlbXBsYXRlIiwiYXZhdGFySWQiLCJfZmxleElkIiwiaWRQcmVmaXgiLCJnZW5lcmF0ZSIsImF2YXRhclZpc2libGUiLCJhdmF0YXJTcmMiLCJnZXRCdXR0b25UZW1wbGF0ZSIsImNvbnZlcnRlZERhdGFGaWVsZCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0IiwiZGF0YUZpZWxkIiwib0RhdGFNb2RlbFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJlbnRpdHlTZXQiLCJpY29uIiwic2hvd0ljb25VcmwiLCJJY29uVXJsIiwidGV4dCIsIkxhYmVsIiwidG9vbHRpcCIsImJ1dHRvbiIsIiRUeXBlIiwidmlzaWJsZSIsIm5hdmlnYXRpb25BdmFpbGFibGUiLCJidXR0b25QcmVzcyIsIkZpZWxkSGVscGVyIiwiaXNEYXRhRmllbGRBY3Rpb25CdXR0b25WaXNpYmxlIiwiYnV0dG9uSXNCb3VuZCIsImJ1dHRvbk9wZXJhdGlvbkF2YWlsYWJsZSIsImVuYWJsZWQiLCJpc0RhdGFGaWVsZEFjdGlvbkJ1dHRvbkVuYWJsZWQiLCJidXR0b25PcGVyYXRpb25BdmFpbGFibGVGb3JtYXR0ZWQiLCJ0eXBlIiwiYnVpbGRFeHByZXNzaW9uRm9yQ3JpdGljYWxpdHlCdXR0b25UeXBlIiwiY2xhc3MiLCJnZXRDb250YWN0VGVtcGxhdGUiLCJjb250ZXh0TWV0YVBhdGgiLCJnZXRNb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiYXJpYUxhYmVsbGVkQnkiLCJjb250YWN0VmlzaWJsZSIsImdldERhdGFQb2ludElubmVyUGFydCIsIndpdGhDb25kaXRpb25hbFdyYXBwZXIiLCJtZXRhUGF0aCIsIm1lYXN1cmVEaXNwbGF5TW9kZSIsInNob3dFbXB0eUluZGljYXRvciIsImdldERhdGFQb2ludFRlbXBsYXRlIiwiaGFzVW5pdE9yQ3VycmVuY3kiLCJnZXRFeHBhbmRhYmxlVGV4dCIsIm5vV3JhcHBlcklkIiwidGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheSIsInRleHRNYXhDaGFyYWN0ZXJzRGlzcGxheSIsImVtcHR5SW5kaWNhdG9yTW9kZSIsImdldEZpbGVUZW1wbGF0ZSIsImlubmVyRmlsZVBhcnQiLCJmaWxlSXNJbWFnZSIsImZpbGVBdmF0YXJTcmMiLCJmaWxlSWNvblNyYyIsImZpbGVTdHJlYW1Ob3RFbXB0eSIsImZpbGVMaW5rVGV4dCIsImZpbGVMaW5rSHJlZiIsImZpbGVUZXh0VmlzaWJsZSIsImVkaXRNb2RlIiwiRWRpdE1vZGUiLCJEaXNwbGF5IiwiYmVmb3JlRGlhbG9nT3BlbiIsImNvbGxhYm9yYXRpb25FbmFibGVkIiwiYWZ0ZXJEaWFsb2dPcGVuIiwiZWRpdGFibGVFeHByZXNzaW9uIiwiZmlsZUFjY2VwdGFibGVNZWRpYVR5cGVzIiwiZmlsZU1heGltdW1TaXplIiwiZmlsZUZpbGVuYW1lRXhwcmVzc2lvbiIsImZpbGVSZWxhdGl2ZVByb3BlcnR5UGF0aCIsImZpbGVVcGxvYWRVcmwiLCJmaWxlRmlsZW5hbWVQYXRoIiwiZmlsZU1lZGlhVHlwZSIsImZpZWxkR3JvdXBJZHMiLCJkYXRhU291cmNlUGF0aCIsImdldExpbmtUZW1wbGF0ZSIsImxpbmtJc0RhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aCIsImxpbmtQcmVzcyIsImxpbmtJc0RhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJsaW5rSXNFbWFpbEFkZHJlc3MiLCJsaW5rSXNQaG9uZU51bWJlciIsImxpbmtVcmwiLCJsaW5rSXNEYXRhRmllbGRXaXRoQWN0aW9uIiwiaWNvblVybCIsIndyYXAiLCJnZXRMaW5rV2l0aFF1aWNrVmlld1RlbXBsYXRlIiwicmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCIsInRleHRGcm9tVmFsdWVMaXN0Iiwic2VtYW50aWNPYmplY3QiLCJnZXRUZXh0VGVtcGxhdGUiLCJnZXRPYmplY3RJZGVudGlmaWVyIiwiZGVwZW5kZW50cyIsImhhc1F1aWNrVmlldyIsImlkZW50aWZpZXIiLCJpZGVudGlmaWVyVGl0bGUiLCJpZGVudGlmaWVyVGV4dCIsImhhc1NpdHVhdGlvbnNJbmRpY2F0b3IiLCJzaXR1YXRpb25zSW5kaWNhdG9yUHJvcGVydHlQYXRoIiwic2hvd0Vycm9ySW5kaWNhdG9yIiwic2hvd0Vycm9yT2JqZWN0U3RhdHVzIiwiZ2V0T2JqZWN0U3RhdHVzIiwib2JqZWN0U3RhdHVzIiwiZGF0YU1vZGVsT2JqZWN0UGF0aCIsImVuaGFuY2VkVmFsdWVEYXRhTW9kZWxQYXRoIiwiZW5oYW5jZURhdGFNb2RlbFBhdGgiLCJ0YXJnZXRPYmplY3QiLCJWYWx1ZSIsInBhdGgiLCJjb25kaXRpb24iLCJjcml0aWNhbGl0eUljb24iLCJidWlsZEV4cHJlc3Npb25Gb3JDcml0aWNhbGl0eUljb24iLCJzdGF0ZSIsImJ1aWxkRXhwcmVzc2lvbkZvckNyaXRpY2FsaXR5Q29sb3IiLCJhY3RpdmUiLCJwcmVzc0FjdGlvbiIsImdldExhYmVsU2VtYW50aWNLZXkiLCJnZXRTZW1hbnRpY0tleVdpdGhEcmFmdEluZGljYXRvclRlbXBsYXRlIiwic2VtYW50aWNLZXlUZW1wbGF0ZSIsInNlbWFudGljS2V5U3R5bGUiLCJmaWVsZEdyb3VwRHJhZnRJbmRpY2F0b3JQcm9wZXJ0eVBhdGgiLCJnZXRNYXJnaW5DbGFzcyIsImNvbXBhY3RTZW1hbnRpY0tleSIsImRyYWZ0SW5kaWNhdG9yVmlzaWJsZSIsImdldFRlbXBsYXRlIiwiaW5uZXJGaWVsZENvbnRlbnQiLCJkaXNwbGF5U3R5bGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkRpc3BsYXlTdHlsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB7XG5cdGJ1aWxkRXhwcmVzc2lvbkZvckNyaXRpY2FsaXR5QnV0dG9uVHlwZSxcblx0YnVpbGRFeHByZXNzaW9uRm9yQ3JpdGljYWxpdHlDb2xvcixcblx0YnVpbGRFeHByZXNzaW9uRm9yQ3JpdGljYWxpdHlJY29uXG59IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0NyaXRpY2FsaXR5Rm9ybWF0dGVyc1wiO1xuaW1wb3J0IHsgZW5oYW5jZURhdGFNb2RlbFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBoYXNWYWxpZEFuYWx5dGljYWxDdXJyZW5jeU9yVW5pdCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IEZpZWxkSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkSGVscGVyXCI7XG5pbXBvcnQgRWRpdE1vZGUgZnJvbSBcInNhcC91aS9tZGMvZW51bS9FZGl0TW9kZVwiO1xuaW1wb3J0IHR5cGUgSW50ZXJuYWxGaWVsZEJsb2NrIGZyb20gXCIuLi9JbnRlcm5hbEZpZWxkLmJsb2NrXCI7XG5pbXBvcnQgdHlwZSB7IERpc3BsYXlTdHlsZSBhcyBEaXNwbGF5U3R5bGVUeXBlIH0gZnJvbSBcIi4uL0ludGVybmFsRmllbGQuYmxvY2tcIjtcblxuY29uc3QgRGlzcGxheVN0eWxlID0ge1xuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBBbW91bnRXaXRoQ3VycmVuY3kgdGVtcGxhdGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBpbnRlcm5hbEZpZWxkIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBpbnRlcm5hbCBmaWVsZCBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldEFtb3VudFdpdGhDdXJyZW5jeVRlbXBsYXRlKGludGVybmFsRmllbGQ6IEludGVybmFsRmllbGRCbG9jaykge1xuXHRcdGlmIChpbnRlcm5hbEZpZWxkLmZvcm1hdE9wdGlvbnMuaXNBbmFseXRpY3MpIHtcblx0XHRcdHJldHVybiB4bWxgPGNvbnRyb2xzOkNvbmRpdGlvbmFsV3JhcHBlciB4bWxuczpjb250cm9scz1cInNhcC5mZS5tYWNyb3MuY29udHJvbHNcIiB2aXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmRpc3BsYXlWaXNpYmxlfVwiIGNvbmRpdGlvbj1cIiR7aW50ZXJuYWxGaWVsZC5oYXNWYWxpZEFuYWx5dGljYWxDdXJyZW5jeU9yVW5pdH1cIj5cblx0XHRcdDxjb250cm9sczpjb250ZW50VHJ1ZT5cblx0XHRcdFx0PHU6Q3VycmVuY3lcblx0XHRcdFx0XHR4bWxuczp1PVwic2FwLnVpLnVuaWZpZWRcIlxuXHRcdFx0XHRcdHN0cmluZ1ZhbHVlPVwiJHtpbnRlcm5hbEZpZWxkLnZhbHVlQXNTdHJpbmdCaW5kaW5nRXhwcmVzc2lvbn1cIlxuXHRcdFx0XHRcdGN1cnJlbmN5PVwiJHtpbnRlcm5hbEZpZWxkLnVuaXRCaW5kaW5nRXhwcmVzc2lvbn1cIlxuXHRcdFx0XHRcdHVzZVN5bWJvbD1cImZhbHNlXCJcblx0XHRcdFx0XHRtYXhQcmVjaXNpb249XCI1XCJcblx0XHRcdFx0Lz5cblx0XHRcdDwvY29udHJvbHM6Y29udGVudFRydWU+XG5cdFx0XHQ8Y29udHJvbHM6Y29udGVudEZhbHNlPlxuXHRcdFx0XHQ8dTpDdXJyZW5jeSB4bWxuczp1PVwic2FwLnVpLnVuaWZpZWRcIiBzdHJpbmdWYWx1ZT1cIlwiIGN1cnJlbmN5PVwiKlwiIHVzZVN5bWJvbD1cImZhbHNlXCIgLz5cblx0XHRcdDwvY29udHJvbHM6Y29udGVudEZhbHNlPlxuXHRcdDwvY29udHJvbHM6Q29uZGl0aW9uYWxXcmFwcGVyPmA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB4bWxgPGNvcmVDb250cm9sczpGb3JtRWxlbWVudFdyYXBwZXIgeG1sbnM6Y29yZUNvbnRyb2xzPVwic2FwLmZlLmNvcmUuY29udHJvbHNcIlxuXHRcdFx0Zm9ybURvTm90QWRqdXN0V2lkdGg9XCJ0cnVlXCJcblx0XHRcdHdpZHRoPVwiJHtpbnRlcm5hbEZpZWxkLmZvcm1hdE9wdGlvbnMudGV4dEFsaWduTW9kZSA9PT0gXCJUYWJsZVwiID8gXCIxMDAlXCIgOiB1bmRlZmluZWR9XCJcblx0XHQ+XG5cdFx0XHQ8dTpDdXJyZW5jeVxuXHRcdFx0XHR4bWxuczp1PVwic2FwLnVpLnVuaWZpZWRcIlxuXHRcdFx0XHR2aXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmRpc3BsYXlWaXNpYmxlfVwiXG5cdFx0XHRcdHN0cmluZ1ZhbHVlPVwiJHtpbnRlcm5hbEZpZWxkLnZhbHVlQXNTdHJpbmdCaW5kaW5nRXhwcmVzc2lvbn1cIlxuXHRcdFx0XHRjdXJyZW5jeT1cIiR7aW50ZXJuYWxGaWVsZC51bml0QmluZGluZ0V4cHJlc3Npb259XCJcblx0XHRcdFx0dXNlU3ltYm9sPVwiZmFsc2VcIlxuXHRcdFx0XHRtYXhQcmVjaXNpb249XCI1XCJcblx0XHRcdC8+XG5cdFx0PC9jb3JlQ29udHJvbHM6Rm9ybUVsZW1lbnRXcmFwcGVyPmA7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgdGhlIEF2YXRhciB0ZW1wbGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIGludGVybmFsRmllbGQgUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGludGVybmFsIGZpZWxkIGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZmllbGQgY29udHJvbFxuXHQgKi9cblx0Z2V0QXZhdGFyVGVtcGxhdGUoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrKSB7XG5cdFx0bGV0IGF2YXRhcklkO1xuXHRcdGlmIChpbnRlcm5hbEZpZWxkLl9mbGV4SWQpIHtcblx0XHRcdGF2YXRhcklkID0gaW50ZXJuYWxGaWVsZC5fZmxleElkO1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJuYWxGaWVsZC5pZFByZWZpeCkge1xuXHRcdFx0YXZhdGFySWQgPSBnZW5lcmF0ZShbaW50ZXJuYWxGaWVsZC5pZFByZWZpeCwgXCJGaWVsZC1jb250ZW50XCJdKTtcblx0XHR9XG5cblx0XHRyZXR1cm4geG1sYFxuXHRcdFx0XHQ8Y29udHJvbHM6Rm9ybUVsZW1lbnRXcmFwcGVyXG5cdFx0XHRcdFx0eG1sbnM6Y29udHJvbHM9XCJzYXAuZmUuY29yZS5jb250cm9sc1wiXG5cdFx0XHRcdFx0dmlzaWJsZT1cIiR7aW50ZXJuYWxGaWVsZC5hdmF0YXJWaXNpYmxlfVwiXG5cdFx0XHRcdD5cblx0XHRcdFx0PEF2YXRhclxuXHRcdFx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHRcdGlkPVwiJHthdmF0YXJJZH1cIlxuXHRcdFx0XHRcdHNyYz1cIiR7aW50ZXJuYWxGaWVsZC5hdmF0YXJTcmN9XCJcblx0XHRcdFx0XHRkaXNwbGF5U2l6ZT1cIlNcIlxuXHRcdFx0XHRcdGNsYXNzPVwic2FwVWlTbWFsbE1hcmdpbkVuZFwiXG5cdFx0XHRcdFx0ZGlzcGxheVNoYXBlPVwiU3F1YXJlXCJcblx0XHRcdFx0Lz5cblx0XHRcdDwvY29udHJvbHM6Rm9ybUVsZW1lbnRXcmFwcGVyPmA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlcyB0aGUgYnV0dG9uIHRlbXBsYXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRCdXR0b25UZW1wbGF0ZTogKGludGVybmFsRmllbGQ6IEludGVybmFsRmllbGRCbG9jaykgPT4ge1xuXHRcdGNvbnN0IGNvbnZlcnRlZERhdGFGaWVsZCA9IE1ldGFNb2RlbENvbnZlcnRlci5jb252ZXJ0TWV0YU1vZGVsQ29udGV4dChpbnRlcm5hbEZpZWxkLmRhdGFGaWVsZCk7XG5cdFx0Y29uc3Qgb0RhdGFNb2RlbFBhdGggPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKGludGVybmFsRmllbGQuZGF0YUZpZWxkLCBpbnRlcm5hbEZpZWxkLmVudGl0eVNldCk7XG5cblx0XHRjb25zdCBpY29uID0gaW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zPy5zaG93SWNvblVybCA/PyBmYWxzZSA/IGNvbnZlcnRlZERhdGFGaWVsZC5JY29uVXJsIDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IHRleHQgPSAhKGludGVybmFsRmllbGQuZm9ybWF0T3B0aW9ucz8uc2hvd0ljb25VcmwgPz8gZmFsc2UpID8gY29udmVydGVkRGF0YUZpZWxkLkxhYmVsIDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IHRvb2x0aXAgPSBpbnRlcm5hbEZpZWxkLmZvcm1hdE9wdGlvbnM/LnNob3dJY29uVXJsID8/IGZhbHNlID8gY29udmVydGVkRGF0YUZpZWxkLkxhYmVsIDogdW5kZWZpbmVkO1xuXHRcdGxldCBidXR0b24gPSBcIlwiO1xuXHRcdGlmIChjb252ZXJ0ZWREYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0YnV0dG9uID0geG1sYDxCdXR0b25cblx0XHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdHZpc2libGU9XCIke2ludGVybmFsRmllbGQudmlzaWJsZX1cIlxuXHRcdFx0XHR0ZXh0PVwiJHt0ZXh0fVwiXG5cdFx0XHRcdGljb249XCIke2ljb259XCJcblx0XHRcdFx0ZW5hYmxlZD1cIiR7aW50ZXJuYWxGaWVsZC5uYXZpZ2F0aW9uQXZhaWxhYmxlfVwiXG5cdFx0XHRcdHRvb2x0aXA9XCIke3Rvb2x0aXB9XCJcblx0XHRcdFx0cHJlc3M9XCIke2ludGVybmFsRmllbGQuYnV0dG9uUHJlc3N9XCJcblx0XHRcdC8+YDtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0RmllbGRIZWxwZXIuaXNEYXRhRmllbGRBY3Rpb25CdXR0b25WaXNpYmxlKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRjb252ZXJ0ZWREYXRhRmllbGQsXG5cdFx0XHRcdGludGVybmFsRmllbGQuYnV0dG9uSXNCb3VuZCxcblx0XHRcdFx0aW50ZXJuYWxGaWVsZC5idXR0b25PcGVyYXRpb25BdmFpbGFibGVcblx0XHRcdClcblx0XHQpIHtcblx0XHRcdGNvbnN0IGVuYWJsZWQgPSBGaWVsZEhlbHBlci5pc0RhdGFGaWVsZEFjdGlvbkJ1dHRvbkVuYWJsZWQoXG5cdFx0XHRcdGNvbnZlcnRlZERhdGFGaWVsZCxcblx0XHRcdFx0aW50ZXJuYWxGaWVsZC5idXR0b25Jc0JvdW5kIGFzIHVua25vd24gYXMgYm9vbGVhbixcblx0XHRcdFx0aW50ZXJuYWxGaWVsZC5idXR0b25PcGVyYXRpb25BdmFpbGFibGUsXG5cdFx0XHRcdGludGVybmFsRmllbGQuYnV0dG9uT3BlcmF0aW9uQXZhaWxhYmxlRm9ybWF0dGVkIGFzIHN0cmluZ1xuXHRcdFx0KTtcblx0XHRcdGNvbnN0IHR5cGUgPSBidWlsZEV4cHJlc3Npb25Gb3JDcml0aWNhbGl0eUJ1dHRvblR5cGUob0RhdGFNb2RlbFBhdGgpO1xuXG5cdFx0XHRidXR0b24gPSB4bWxgPEJ1dHRvblxuXHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdCAgICBjbGFzcz1cIiR7aW50ZXJuYWxGaWVsZC5jbGFzc31cIlxuXHRcdFx0XHR0ZXh0PVwiJHt0ZXh0fVwiXG5cdFx0XHRcdGljb249XCIke2ljb259XCJcblx0XHRcdFx0dG9vbHRpcD1cIiR7dG9vbHRpcH1cIlxuXHRcdFx0XHRwcmVzcz1cIiR7aW50ZXJuYWxGaWVsZC5idXR0b25QcmVzc31cIlxuXHRcdFx0XHRlbmFibGVkPVwiJHtlbmFibGVkfVwiXG5cdFx0XHRcdHZpc2libGU9XCIke2ludGVybmFsRmllbGQudmlzaWJsZX1cIlxuXHRcdFx0XHR0eXBlPVwiJHt0eXBlfVwiXG5cdFx0XHRcdC8+YDtcblx0XHR9XG5cdFx0cmV0dXJuIGJ1dHRvbjtcblx0fSxcblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBDb250YWN0IHRlbXBsYXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRDb250YWN0VGVtcGxhdGUoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrKSB7XG5cdFx0Y29uc3QgY29udGV4dE1ldGFQYXRoID0gaW50ZXJuYWxGaWVsZC5kYXRhRmllbGQuZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIlRhcmdldC8kQW5ub3RhdGlvblBhdGhcIiwgaW50ZXJuYWxGaWVsZC5kYXRhRmllbGQpO1xuXG5cdFx0cmV0dXJuIHhtbGBcblx0XHQ8bWFjcm9zOkNvbnRhY3Rcblx0XHRcdGlkUHJlZml4PVwiJHtpbnRlcm5hbEZpZWxkLmlkUHJlZml4fVwiXG5cdFx0XHRhcmlhTGFiZWxsZWRCeT1cIiR7aW50ZXJuYWxGaWVsZC5hcmlhTGFiZWxsZWRCeX1cIlxuXHRcdFx0bWV0YVBhdGg9XCIke2NvbnRleHRNZXRhUGF0aH1cIlxuXHRcdFx0Y29udGV4dFBhdGg9XCIke2ludGVybmFsRmllbGQuZW50aXR5U2V0fVwiXG5cdFx0XHRfZmxleElkPVwiJHtpbnRlcm5hbEZpZWxkLl9mbGV4SWR9XCJcblx0XHRcdHZpc2libGU9XCIke2ludGVybmFsRmllbGQuY29udGFjdFZpc2libGV9XCJcblx0XHQvPmA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlcyB0aGUgaW5uZXJwYXJ0IG9mIHRoZSBkYXRhIHBvaW50IHRvIGJlIHVzZWQgaW4gZ2V0RGF0YVBvaW50VGVtcGxhdGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBpbnRlcm5hbEZpZWxkIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBpbnRlcm5hbCBmaWVsZCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gd2l0aENvbmRpdGlvbmFsV3JhcHBlciBCb29sZWFuIHZhbHVlIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBEYXRhUG9pbnRcblx0ICogXHRcdFx0XHRcdCAgXHRcdFx0c2hhbGwgYmUgZ2VuZXJhdGVkIGZvciB0aGUgY29uZGl0aW9uYWwgd3JhcHBlciBjYXNlXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZmllbGQgY29udHJvbFxuXHQgKi9cblx0Z2V0RGF0YVBvaW50SW5uZXJQYXJ0KGludGVybmFsRmllbGQ6IEludGVybmFsRmllbGRCbG9jaywgd2l0aENvbmRpdGlvbmFsV3JhcHBlcjogYm9vbGVhbikge1xuXHRcdGNvbnN0IGNvbnZlcnRlZERhdGFGaWVsZCA9IE1ldGFNb2RlbENvbnZlcnRlci5jb252ZXJ0TWV0YU1vZGVsQ29udGV4dChpbnRlcm5hbEZpZWxkLmRhdGFGaWVsZCk7XG5cblx0XHRjb25zdCBtZXRhUGF0aCA9XG5cdFx0XHRjb252ZXJ0ZWREYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb25cblx0XHRcdFx0PyBpbnRlcm5hbEZpZWxkLmRhdGFGaWVsZC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aFwiLCBpbnRlcm5hbEZpZWxkLmRhdGFGaWVsZClcblx0XHRcdFx0OiBpbnRlcm5hbEZpZWxkLmRhdGFGaWVsZDtcblxuXHRcdGNvbnN0IGZvcm1hdE9wdGlvbnMgPSB4bWxgPGludGVybmFsTWFjcm86Zm9ybWF0T3B0aW9uc1xuXHRcdFx0XHR4bWxuczppbnRlcm5hbE1hY3JvPVwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiXG5cdFx0XHRcdG1lYXN1cmVEaXNwbGF5TW9kZT1cIiR7aW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zLm1lYXN1cmVEaXNwbGF5TW9kZX1cIlxuXHRcdFx0XHRzaG93RW1wdHlJbmRpY2F0b3I9XCIke2ludGVybmFsRmllbGQuZm9ybWF0T3B0aW9ucy5zaG93RW1wdHlJbmRpY2F0b3J9XCJcblx0XHRcdFx0aXNBbmFseXRpY3M9XCIke2ludGVybmFsRmllbGQuZm9ybWF0T3B0aW9ucy5pc0FuYWx5dGljc31cIlxuXHRcdFx0Lz5gO1xuXG5cdFx0cmV0dXJuIHhtbGA8aW50ZXJuYWxNYWNybzpEYXRhUG9pbnRcblx0XHRcdHhtbG5zOmludGVybmFsTWFjcm89XCJzYXAuZmUubWFjcm9zLmludGVybmFsXCJcblx0XHRcdGlkUHJlZml4PVwiJHtpbnRlcm5hbEZpZWxkLmlkUHJlZml4fVwiXG5cdFx0XHR2aXNpYmxlPVwiJHshd2l0aENvbmRpdGlvbmFsV3JhcHBlciA/IGludGVybmFsRmllbGQuZGlzcGxheVZpc2libGUgOiBcIlwifVwiXG5cdFx0XHRhcmlhTGFiZWxsZWRCeT1cIiR7aW50ZXJuYWxGaWVsZC5hcmlhTGFiZWxsZWRCeX1cIlxuXHRcdFx0X2ZsZXhJZD1cIiR7aW50ZXJuYWxGaWVsZC5fZmxleElkfVwiXG5cdFx0XHRtZXRhUGF0aD1cIiR7bWV0YVBhdGh9XCJcblx0XHRcdGNvbnRleHRQYXRoPVwiJHtpbnRlcm5hbEZpZWxkLmVudGl0eVNldH1cIlxuXHRcdD5cblx0XHRcdCR7Zm9ybWF0T3B0aW9uc31cblx0XHQ8L2ludGVybmFsTWFjcm86RGF0YVBvaW50PmA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlcyB0aGUgRGF0YVBvaW50IHRlbXBsYXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXREYXRhUG9pbnRUZW1wbGF0ZShpbnRlcm5hbEZpZWxkOiBJbnRlcm5hbEZpZWxkQmxvY2spIHtcblx0XHRpZiAoKGludGVybmFsRmllbGQuZm9ybWF0T3B0aW9ucy5pc0FuYWx5dGljcyA/PyBmYWxzZSkgJiYgKGludGVybmFsRmllbGQuaGFzVW5pdE9yQ3VycmVuY3kgPz8gZmFsc2UpKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxjb250cm9sczpDb25kaXRpb25hbFdyYXBwZXIgeG1sbnM6Y29udHJvbHM9XCJzYXAuZmUubWFjcm9zLmNvbnRyb2xzXCIgdmlzaWJsZT1cIiR7XG5cdFx0XHRcdGludGVybmFsRmllbGQuZGlzcGxheVZpc2libGVcblx0XHRcdH1cIiBjb25kaXRpb249XCIke2ludGVybmFsRmllbGQuaGFzVmFsaWRBbmFseXRpY2FsQ3VycmVuY3lPclVuaXR9XCI+XG5cdFx0XHRcdDxjb250cm9sczpjb250ZW50VHJ1ZT5cblx0XHRcdFx0XHQgJHt0aGlzLmdldERhdGFQb2ludElubmVyUGFydChpbnRlcm5hbEZpZWxkLCB0cnVlKX1cblx0XHRcdFx0PC9jb250cm9sczpjb250ZW50VHJ1ZT5cblx0XHRcdFx0XHQ8Y29udHJvbHM6Y29udGVudEZhbHNlPlxuXHRcdFx0XHRcdFx0PFRleHQgeG1sbnM9XCJzYXAubVwiIHRleHQ9XCIqXCIgLz5cblx0XHRcdFx0PC9jb250cm9sczpjb250ZW50RmFsc2U+XG5cdFx0XHQ8L2NvbnRyb2xzOkNvbmRpdGlvbmFsV3JhcHBlcj5gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXREYXRhUG9pbnRJbm5lclBhcnQoaW50ZXJuYWxGaWVsZCwgZmFsc2UpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBFeHBhbmRhYmxlVGV4dCB0ZW1wbGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIGludGVybmFsRmllbGQgUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGludGVybmFsIGZpZWxkIGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZmllbGQgY29udHJvbFxuXHQgKi9cblx0Z2V0RXhwYW5kYWJsZVRleHQoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrKSB7XG5cdFx0cmV0dXJuIHhtbGBcblx0XHRcdDxFeHBhbmRhYmxlVGV4dFxuXHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0aWQ9XCIke2ludGVybmFsRmllbGQ/Lm5vV3JhcHBlcklkfVwiXG5cdFx0XHRcdHZpc2libGU9XCIke2ludGVybmFsRmllbGQ/LmRpc3BsYXlWaXNpYmxlfVwiXG5cdFx0XHRcdHRleHQ9XCIke2ludGVybmFsRmllbGQ/LnRleHR9XCJcblx0XHRcdFx0b3ZlcmZsb3dNb2RlPVwiJHtpbnRlcm5hbEZpZWxkPy5mb3JtYXRPcHRpb25zPy50ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5fVwiXG5cdFx0XHRcdG1heENoYXJhY3RlcnM9XCIke2ludGVybmFsRmllbGQ/LmZvcm1hdE9wdGlvbnM/LnRleHRNYXhDaGFyYWN0ZXJzRGlzcGxheX1cIlxuXHRcdFx0XHRlbXB0eUluZGljYXRvck1vZGU9XCIke2ludGVybmFsRmllbGQ/LmVtcHR5SW5kaWNhdG9yTW9kZX1cIlxuXHRcdC8+YDtcblx0fSxcblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBGaWxlIHRlbXBsYXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRGaWxlVGVtcGxhdGUoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrKSB7XG5cdFx0bGV0IGlubmVyRmlsZVBhcnQ7XG5cdFx0aWYgKGludGVybmFsRmllbGQuZmlsZUlzSW1hZ2UpIHtcblx0XHRcdGlubmVyRmlsZVBhcnQgPSB4bWxgXG5cdFx0XHQ8Y29udHJvbHM6YXZhdGFyIHhtbG5zOmNvbnRyb2xzPVwic2FwLmZlLm1hY3Jvcy5jb250cm9sc1wiPlxuXHRcdFx0XHQ8QXZhdGFyXG5cdFx0XHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdFx0dmlzaWJsZT1cIiR7aW50ZXJuYWxGaWVsZC5kaXNwbGF5VmlzaWJsZX1cIlxuXHRcdFx0XHRcdHNyYz1cIiR7aW50ZXJuYWxGaWVsZC5maWxlQXZhdGFyU3JjfVwiXG5cdFx0XHRcdFx0ZGlzcGxheVNpemU9XCJTXCJcblx0XHRcdFx0XHRjbGFzcz1cInNhcFVpU21hbGxNYXJnaW5FbmRcIlxuXHRcdFx0XHRcdGRpc3BsYXlTaGFwZT1cIlNxdWFyZVwiPlxuXHRcdFx0XHRcdDxjdXN0b21EYXRhPlxuXHRcdFx0XHRcdFx0PEltYWdlQ3VzdG9tRGF0YSBwYXJhbU5hbWU9XCJ4Y2FjaGVcIiAvPlxuXHRcdFx0XHRcdDwvY3VzdG9tRGF0YT5cblx0XHRcdFx0PC9BdmF0YXI+XG5cdFx0XHQ8L2NvbnRyb2xzOmF2YXRhcj5gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpbm5lckZpbGVQYXJ0ID0geG1sYFxuXHRcdFx0PGNvbnRyb2xzOmljb24geG1sbnM6Y29udHJvbHM9XCJzYXAuZmUubWFjcm9zLmNvbnRyb2xzXCI+XG5cdFx0XHRcdDxjb3JlOkljb24gc3JjPVwiJHtpbnRlcm5hbEZpZWxkLmZpbGVJY29uU3JjfVwiIGNsYXNzPVwic2FwVWlTbWFsbE1hcmdpbkVuZFwiIHZpc2libGU9XCIke2ludGVybmFsRmllbGQuZmlsZVN0cmVhbU5vdEVtcHR5fVwiIC8+XG5cdFx0XHQ8L2NvbnRyb2xzOmljb24+XG5cdFx0XHQ8Y29udHJvbHM6bGluaz5cblx0XHRcdFx0PExpbmtcblx0XHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0XHR0ZXh0PVwiJHtpbnRlcm5hbEZpZWxkLmZpbGVMaW5rVGV4dH1cIlxuXHRcdFx0XHRcdHRhcmdldD1cIl9ibGFua1wiXG5cdFx0XHRcdFx0aHJlZj1cIiR7aW50ZXJuYWxGaWVsZC5maWxlTGlua0hyZWZ9XCJcblx0XHRcdFx0XHR2aXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmZpbGVTdHJlYW1Ob3RFbXB0eX1cIlxuXHRcdFx0XHRcdHdyYXBwaW5nPVwidHJ1ZVwiXG5cdFx0XHRcdC8+XG5cdFx0XHQ8L2NvbnRyb2xzOmxpbms+XG5cdFx0XHQ8Y29udHJvbHM6dGV4dD5cblx0XHRcdFx0PFRleHQgeG1sbnM9XCJzYXAubVwiIGVtcHR5SW5kaWNhdG9yTW9kZT1cIk9uXCIgdGV4dD1cIlwiIHZpc2libGU9XCIke2ludGVybmFsRmllbGQuZmlsZVRleHRWaXNpYmxlfVwiIC8+XG5cdFx0XHQ8L2NvbnRyb2xzOnRleHQ+YDtcblx0XHR9XG5cblx0XHRpZiAoaW50ZXJuYWxGaWVsZC5lZGl0TW9kZSAhPT0gRWRpdE1vZGUuRGlzcGxheSkge1xuXHRcdFx0Y29uc3QgYmVmb3JlRGlhbG9nT3BlbiA9IGludGVybmFsRmllbGQuY29sbGFib3JhdGlvbkVuYWJsZWQgPyBcIkZJRUxEUlVOVElNRS5oYW5kbGVPcGVuVXBsb2FkZXJcIiA6IHVuZGVmaW5lZDtcblx0XHRcdGNvbnN0IGFmdGVyRGlhbG9nT3BlbiA9IGludGVybmFsRmllbGQuY29sbGFib3JhdGlvbkVuYWJsZWQgPyBcIkZJRUxEUlVOVElNRS5oYW5kbGVDbG9zZVVwbG9hZGVyXCIgOiB1bmRlZmluZWQ7XG5cblx0XHRcdGlubmVyRmlsZVBhcnQgKz0geG1sYFxuXHRcdFx0PGNvbnRyb2xzOmZpbGVVcGxvYWRlciB4bWxuczpjb250cm9scz1cInNhcC5mZS5tYWNyb3MuY29udHJvbHNcIj5cblx0XHRcdFx0PHU6RmlsZVVwbG9hZGVyXG5cdFx0XHRcdFx0eG1sbnM6dT1cInNhcC51aS51bmlmaWVkXCJcblx0XHRcdFx0XHRuYW1lPVwiRkVWNEZpbGVVcGxvYWRcIlxuXHRcdFx0XHRcdHZpc2libGU9XCIke2ludGVybmFsRmllbGQuZWRpdGFibGVFeHByZXNzaW9ufVwiXG5cdFx0XHRcdFx0YnV0dG9uT25seT1cInRydWVcIlxuXHRcdFx0XHRcdGljb25Pbmx5PVwidHJ1ZVwiXG5cdFx0XHRcdFx0bXVsdGlwbGU9XCJmYWxzZVwiXG5cdFx0XHRcdFx0dG9vbHRpcD1cIntzYXAuZmUuaTE4bj5NX0ZJRUxEX0ZJTEVVUExPQURFUl9VUExPQURfQlVUVE9OX1RPT0xUSVB9XCJcblx0XHRcdFx0XHRpY29uPVwic2FwLWljb246Ly91cGxvYWRcIlxuXHRcdFx0XHRcdHN0eWxlPVwiVHJhbnNwYXJlbnRcIlxuXHRcdFx0XHRcdHNlbmRYSFI9XCJ0cnVlXCJcblx0XHRcdFx0XHR1c2VNdWx0aXBhcnQ9XCJmYWxzZVwiXG5cdFx0XHRcdFx0c2FtZUZpbGVuYW1lQWxsb3dlZD1cInRydWVcIlxuXHRcdFx0XHRcdG1pbWVUeXBlPVwiJHtpbnRlcm5hbEZpZWxkLmZpbGVBY2NlcHRhYmxlTWVkaWFUeXBlc31cIlxuXHRcdFx0XHRcdHR5cGVNaXNzbWF0Y2g9XCJGSUVMRFJVTlRJTUUuaGFuZGxlVHlwZU1pc3NtYXRjaFwiXG5cdFx0XHRcdFx0bWF4aW11bUZpbGVTaXplPVwiJHtpbnRlcm5hbEZpZWxkLmZpbGVNYXhpbXVtU2l6ZX1cIlxuXHRcdFx0XHRcdGZpbGVTaXplRXhjZWVkPVwiRklFTERSVU5USU1FLmhhbmRsZUZpbGVTaXplRXhjZWVkXCJcblx0XHRcdFx0XHR1cGxvYWRPbkNoYW5nZT1cImZhbHNlXCJcblx0XHRcdFx0XHR1cGxvYWRDb21wbGV0ZT1cIkZJRUxEUlVOVElNRS5oYW5kbGVVcGxvYWRDb21wbGV0ZSgkZXZlbnQsICR7aW50ZXJuYWxGaWVsZC5maWxlRmlsZW5hbWVFeHByZXNzaW9uIHx8IFwidW5kZWZpbmVkXCJ9LCAnJHtcblx0XHRcdFx0aW50ZXJuYWxGaWVsZC5maWxlUmVsYXRpdmVQcm9wZXJ0eVBhdGhcblx0XHRcdH0nLCAkY29udHJvbGxlcilcIlxuXHRcdFx0XHRcdGh0dHBSZXF1ZXN0TWV0aG9kPVwiUHV0XCJcblx0XHRcdFx0XHRjaGFuZ2U9XCJGSUVMRFJVTlRJTUUudXBsb2FkU3RyZWFtKCRjb250cm9sbGVyLCAkZXZlbnQpXCJcblx0XHRcdFx0XHRiZWZvcmVEaWFsb2dPcGVuPVwiJHtiZWZvcmVEaWFsb2dPcGVufVwiXG5cdFx0XHRcdFx0YWZ0ZXJEaWFsb2dDbG9zZT1cIiR7YWZ0ZXJEaWFsb2dPcGVufVwiXG5cdFx0XHRcdFx0dXBsb2FkU3RhcnQ9XCJGSUVMRFJVTlRJTUUuaGFuZGxlT3BlblVwbG9hZGVyXCJcblx0XHRcdFx0Lz5cblx0XHRcdDwvY29udHJvbHM6ZmlsZVVwbG9hZGVyPlxuXHRcdFx0PGNvbnRyb2xzOmRlbGV0ZUJ1dHRvbj5cblx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHRcdGljb249XCJzYXAtaWNvbjovL3N5cy1jYW5jZWxcIlxuXHRcdFx0XHRcdHR5cGU9XCJUcmFuc3BhcmVudFwiXG5cdFx0XHRcdFx0cHJlc3M9XCJGSUVMRFJVTlRJTUUucmVtb3ZlU3RyZWFtKCRldmVudCwgJHtpbnRlcm5hbEZpZWxkLmZpbGVGaWxlbmFtZUV4cHJlc3Npb24gfHwgXCJ1bmRlZmluZWRcIn0sICcke1xuXHRcdFx0XHRpbnRlcm5hbEZpZWxkLmZpbGVSZWxhdGl2ZVByb3BlcnR5UGF0aFxuXHRcdFx0fScsICRjb250cm9sbGVyKVwiXG5cdFx0XHRcdFx0dG9vbHRpcD1cIntzYXAuZmUuaTE4bj5NX0ZJRUxEX0ZJTEVVUExPQURFUl9ERUxFVEVfQlVUVE9OX1RPT0xUSVB9XCJcblx0XHRcdFx0XHR2aXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmVkaXRhYmxlRXhwcmVzc2lvbn1cIlxuXHRcdFx0XHRcdGVuYWJsZWQ9XCIke2ludGVybmFsRmllbGQuZmlsZVN0cmVhbU5vdEVtcHR5fVwiXG5cdFx0XHRcdC8+XG5cdFx0XHQ8L2NvbnRyb2xzOmRlbGV0ZUJ1dHRvbj5gO1xuXHRcdH1cblxuXHRcdHJldHVybiB4bWxgXG5cdFx0XHQ8Y29udHJvbHM6RmlsZVdyYXBwZXJcblx0XHRcdFx0eG1sbnM6Y29udHJvbHM9XCJzYXAuZmUubWFjcm9zLmNvbnRyb2xzXCJcblx0XHRcdFx0Y29yZTpyZXF1aXJlPVwie0ZJRUxEUlVOVElNRTogJ3NhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lJ31cIlxuXHRcdFx0XHR2aXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLnZpc2libGV9XCJcblx0XHRcdFx0dXBsb2FkVXJsPVwiJHtpbnRlcm5hbEZpZWxkLmZpbGVVcGxvYWRVcmx9XCJcblx0XHRcdFx0cHJvcGVydHlQYXRoPVwiJHtpbnRlcm5hbEZpZWxkLmZpbGVSZWxhdGl2ZVByb3BlcnR5UGF0aH1cIlxuXHRcdFx0XHRmaWxlbmFtZT1cIiR7aW50ZXJuYWxGaWVsZC5maWxlRmlsZW5hbWVQYXRofVwiXG5cdFx0XHRcdG1lZGlhVHlwZT1cIiR7aW50ZXJuYWxGaWVsZC5maWxlTWVkaWFUeXBlfVwiXG5cdFx0XHRcdGZpZWxkR3JvdXBJZHM9XCIke2ludGVybmFsRmllbGQuZmllbGRHcm91cElkc31cIlxuXHRcdFx0XHR2YWxpZGF0ZUZpZWxkR3JvdXA9XCJGSUVMRFJVTlRJTUUub25WYWxpZGF0ZUZpZWxkR3JvdXAoJGNvbnRyb2xsZXIsICRldmVudClcIlxuXHRcdFx0XHRjdXN0b21EYXRhOnNvdXJjZVBhdGg9XCIke2ludGVybmFsRmllbGQuZGF0YVNvdXJjZVBhdGh9XCJcblx0XHRcdD4ke2lubmVyRmlsZVBhcnR9PC9jb250cm9sczpGaWxlV3JhcHBlcj5gO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgdGhlIExpbmsgdGVtcGxhdGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBpbnRlcm5hbEZpZWxkIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBpbnRlcm5hbCBmaWVsZCBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldExpbmtUZW1wbGF0ZShpbnRlcm5hbEZpZWxkOiBJbnRlcm5hbEZpZWxkQmxvY2spIHtcblx0XHRpZiAoaW50ZXJuYWxGaWVsZC5saW5rSXNEYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGgpIHtcblx0XHRcdHJldHVybiB4bWxgPExpbmtcblx0XHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdGlkPVwiJHtpbnRlcm5hbEZpZWxkLm5vV3JhcHBlcklkfVwiXG5cdFx0XHRcdGNvcmU6cmVxdWlyZT1cIntGaWVsZFJ1bnRpbWU6ICdzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkUnVudGltZSd9XCJcblx0XHRcdFx0dmlzaWJsZT1cIiR7aW50ZXJuYWxGaWVsZC5kaXNwbGF5VmlzaWJsZX1cIlxuXHRcdFx0XHR0ZXh0PVwiJHtpbnRlcm5hbEZpZWxkLnRleHR9XCJcblx0XHRcdFx0cHJlc3M9XCIke2ludGVybmFsRmllbGQubGlua1ByZXNzfVwiXG5cdFx0XHRcdGFyaWFMYWJlbGxlZEJ5PVwiJHtpbnRlcm5hbEZpZWxkLmFyaWFMYWJlbGxlZEJ5fVwiXG5cdFx0XHRcdGVtcHR5SW5kaWNhdG9yTW9kZT1cIiR7aW50ZXJuYWxGaWVsZC5lbXB0eUluZGljYXRvck1vZGV9XCJcblx0XHRcdFx0Y2xhc3M9XCJzYXBNVGV4dFJlbmRlcldoaXRlc3BhY2VXcmFwXCJcblx0XHRcdC8+YDtcblx0XHR9IGVsc2UgaWYgKGludGVybmFsRmllbGQubGlua0lzRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0cmV0dXJuIHhtbGA8TGlua1xuXHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0aWQ9XCIke2ludGVybmFsRmllbGQubm9XcmFwcGVySWR9XCJcblx0XHRcdFx0Y29yZTpyZXF1aXJlPVwie1dTUjogJ3NhcC9iYXNlL3N0cmluZ3Mvd2hpdGVzcGFjZVJlcGxhY2VyJ31cIlxuXHRcdFx0XHR2aXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmRpc3BsYXlWaXNpYmxlfVwiXG5cdFx0XHRcdHRleHQ9XCIke2ludGVybmFsRmllbGQudGV4dH1cIlxuXHRcdFx0XHRwcmVzcz1cIiR7aW50ZXJuYWxGaWVsZC5saW5rUHJlc3N9XCJcblx0XHRcdFx0YXJpYUxhYmVsbGVkQnk9XCIke2ludGVybmFsRmllbGQuYXJpYUxhYmVsbGVkQnl9XCJcblx0XHRcdFx0ZW1wdHlJbmRpY2F0b3JNb2RlPVwiJHtpbnRlcm5hbEZpZWxkLmVtcHR5SW5kaWNhdG9yTW9kZX1cIlxuXHRcdFx0XHRjbGFzcz1cInNhcE1UZXh0UmVuZGVyV2hpdGVzcGFjZVdyYXBcIlxuXHRcdFx0Lz5gO1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJuYWxGaWVsZC5saW5rSXNFbWFpbEFkZHJlc3MgfHwgaW50ZXJuYWxGaWVsZC5saW5rSXNQaG9uZU51bWJlcikge1xuXHRcdFx0cmV0dXJuIHhtbGA8TGlua1xuXHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0aWQ9XCIke2ludGVybmFsRmllbGQubm9XcmFwcGVySWR9XCJcblx0XHRcdFx0Y29yZTpyZXF1aXJlPVwie1dTUjogJ3NhcC9iYXNlL3N0cmluZ3Mvd2hpdGVzcGFjZVJlcGxhY2VyJ31cIlxuXHRcdFx0XHR2aXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmRpc3BsYXlWaXNpYmxlfVwiXG5cdFx0XHRcdHRleHQ9XCIke2ludGVybmFsRmllbGQudGV4dH1cIlxuXHRcdFx0XHRocmVmPVwiJHtpbnRlcm5hbEZpZWxkLmxpbmtVcmx9XCJcblx0XHRcdFx0YXJpYUxhYmVsbGVkQnk9XCIke2ludGVybmFsRmllbGQuYXJpYUxhYmVsbGVkQnl9XCJcblx0XHRcdFx0ZW1wdHlJbmRpY2F0b3JNb2RlPVwiJHtpbnRlcm5hbEZpZWxkLmVtcHR5SW5kaWNhdG9yTW9kZX1cIlxuXHRcdFx0XHRjbGFzcz1cInNhcE1UZXh0UmVuZGVyV2hpdGVzcGFjZVdyYXBcIlxuXHRcdFx0Lz5gO1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJuYWxGaWVsZC5saW5rSXNEYXRhRmllbGRXaXRoQWN0aW9uKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxMaW5rXG5cdFx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHRpZD1cIiR7aW50ZXJuYWxGaWVsZC5ub1dyYXBwZXJJZH1cIlxuXHRcdFx0XHR2aXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmRpc3BsYXlWaXNpYmxlfVwiXG5cdFx0XHRcdHRleHQ9XCIke2ludGVybmFsRmllbGQudGV4dH1cIlxuXHRcdFx0XHRwcmVzcz1cIiR7aW50ZXJuYWxGaWVsZC5saW5rUHJlc3N9XCJcblx0XHRcdFx0YXJpYUxhYmVsbGVkQnk9XCIke2ludGVybmFsRmllbGQuYXJpYUxhYmVsbGVkQnl9XCJcblx0XHRcdFx0ZW1wdHlJbmRpY2F0b3JNb2RlPVwiJHtpbnRlcm5hbEZpZWxkLmVtcHR5SW5kaWNhdG9yTW9kZX1cIlxuXHRcdFx0XHRjbGFzcz1cInNhcE1UZXh0UmVuZGVyV2hpdGVzcGFjZVdyYXBcIlxuXHRcdFx0Lz5gO1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJuYWxGaWVsZC5pY29uVXJsKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxPYmplY3RTdGF0dXNcblx0XHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdGNvcmU6cmVxdWlyZT1cIntXU1I6ICdzYXAvYmFzZS9zdHJpbmdzL3doaXRlc3BhY2VSZXBsYWNlcicsIEZpZWxkUnVudGltZTogJ3NhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lJ31cIlxuXHRcdFx0XHRpZD1cIiR7aW50ZXJuYWxGaWVsZC5ub1dyYXBwZXJJZH1cIlxuXHRcdFx0XHRpY29uPVwiJHtpbnRlcm5hbEZpZWxkLmljb25Vcmx9XCJcblx0XHRcdFx0dmlzaWJsZT1cIiR7aW50ZXJuYWxGaWVsZC5kaXNwbGF5VmlzaWJsZX1cIlxuXHRcdFx0XHR0ZXh0PVwiJHtpbnRlcm5hbEZpZWxkLnRleHR9XCJcblx0XHRcdFx0cHJlc3M9XCJGaWVsZFJ1bnRpbWUub3BlbkV4dGVybmFsTGlua1wiXG5cdFx0XHRcdGFjdGl2ZT1cInRydWVcIlxuXHRcdFx0XHRlbXB0eUluZGljYXRvck1vZGU9XCIke2ludGVybmFsRmllbGQuZW1wdHlJbmRpY2F0b3JNb2RlfVwiXG5cdFx0XHRcdGN1c3RvbURhdGE6dXJsPVwiJHtpbnRlcm5hbEZpZWxkLmxpbmtVcmx9XCJcblx0XHRcdC8+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHhtbGA8TGlua1xuXHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0aWQ9XCIke2ludGVybmFsRmllbGQubm9XcmFwcGVySWR9XCJcblx0XHRcdFx0Y29yZTpyZXF1aXJlPVwie1dTUjogJ3NhcC9iYXNlL3N0cmluZ3Mvd2hpdGVzcGFjZVJlcGxhY2VyJ31cIlxuXHRcdFx0XHR2aXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmRpc3BsYXlWaXNpYmxlfVwiXG5cdFx0XHRcdHRleHQ9XCIke2ludGVybmFsRmllbGQudGV4dH1cIlxuXHRcdFx0XHRocmVmPVwiJHtpbnRlcm5hbEZpZWxkLmxpbmtVcmx9XCJcblx0XHRcdFx0dGFyZ2V0PVwiX3RvcFwiXG5cdFx0XHRcdHdyYXBwaW5nPVwiJHtpbnRlcm5hbEZpZWxkLndyYXAgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBpbnRlcm5hbEZpZWxkLndyYXB9XCJcblx0XHRcdFx0YXJpYUxhYmVsbGVkQnk9XCIke2ludGVybmFsRmllbGQuYXJpYUxhYmVsbGVkQnl9XCJcblx0XHRcdFx0ZW1wdHlJbmRpY2F0b3JNb2RlPVwiJHtpbnRlcm5hbEZpZWxkLmVtcHR5SW5kaWNhdG9yTW9kZX1cIlxuXHRcdFx0Lz5gO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBMaW5rV2l0aFF1aWNrVmlldyB0ZW1wbGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIGludGVybmFsRmllbGQgUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGludGVybmFsIGZpZWxkIGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZmllbGQgY29udHJvbFxuXHQgKi9cblx0Z2V0TGlua1dpdGhRdWlja1ZpZXdUZW1wbGF0ZShpbnRlcm5hbEZpZWxkOiBJbnRlcm5hbEZpZWxkQmxvY2spIHtcblx0XHRyZXR1cm4geG1sYDxMaW5rXG5cdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdHhtbG5zOmNvcmU9XCJzYXAudWkuY29yZVwiXG5cdFx0XHRpZD1cIiR7aW50ZXJuYWxGaWVsZC5ub1dyYXBwZXJJZH1cIlxuXHRcdFx0Y29yZTpyZXF1aXJlPVwie0ZpZWxkUnVudGltZTogJ3NhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lJywgV1NSOiAnc2FwL2Jhc2Uvc3RyaW5ncy93aGl0ZXNwYWNlUmVwbGFjZXInfVwiXG5cdFx0XHR0ZXh0PVwiJHtpbnRlcm5hbEZpZWxkLmZvcm1hdE9wdGlvbnMucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCA/IGludGVybmFsRmllbGQudGV4dEZyb21WYWx1ZUxpc3QgOiBpbnRlcm5hbEZpZWxkLnRleHR9XCJcblx0XHRcdHZpc2libGU9XCIke2ludGVybmFsRmllbGQuZGlzcGxheVZpc2libGV9XCJcblx0XHRcdHdyYXBwaW5nPVwiJHtpbnRlcm5hbEZpZWxkLndyYXAgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBpbnRlcm5hbEZpZWxkLndyYXB9XCJcblx0XHRcdHByZXNzPVwiRmllbGRSdW50aW1lLnByZXNzTGlua1wiXG5cdFx0XHRhcmlhTGFiZWxsZWRCeT1cIiR7aW50ZXJuYWxGaWVsZC5hcmlhTGFiZWxsZWRCeX1cIlxuXHRcdFx0ZW1wdHlJbmRpY2F0b3JNb2RlPVwiJHtpbnRlcm5hbEZpZWxkLmVtcHR5SW5kaWNhdG9yTW9kZX1cIlxuXHRcdD5cblx0XHRcdDxkZXBlbmRlbnRzPlxuXHRcdFx0XHQ8bWFjcm86UXVpY2tWaWV3IHhtbG5zOm1hY3JvPVwic2FwLmZlLm1hY3Jvc1wiIGRhdGFGaWVsZD1cIiR7aW50ZXJuYWxGaWVsZC5kYXRhRmllbGR9XCIgc2VtYW50aWNPYmplY3Q9XCIke1xuXHRcdFx0aW50ZXJuYWxGaWVsZC5zZW1hbnRpY09iamVjdFxuXHRcdH1cIiBjb250ZXh0UGF0aD1cIiR7aW50ZXJuYWxGaWVsZC5lbnRpdHlTZXR9XCIgLz5cblx0XHRcdDwvZGVwZW5kZW50cz5cblx0XHQ8L0xpbms+YDtcblx0fSxcblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBUZXh0IHRlbXBsYXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRUZXh0VGVtcGxhdGUoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrKSB7XG5cdFx0aWYgKGludGVybmFsRmllbGQuZm9ybWF0T3B0aW9ucy5pc0FuYWx5dGljcyAmJiBpbnRlcm5hbEZpZWxkLmhhc1VuaXRPckN1cnJlbmN5KSB7XG5cdFx0XHRyZXR1cm4geG1sYDxjb250cm9sczpDb25kaXRpb25hbFdyYXBwZXIgeG1sbnM6Y29udHJvbHM9XCJzYXAuZmUubWFjcm9zLmNvbnRyb2xzXCIgdmlzaWJsZT1cIiR7aW50ZXJuYWxGaWVsZC5kaXNwbGF5VmlzaWJsZX1cIiBjb25kaXRpb249XCIke2ludGVybmFsRmllbGQuaGFzVmFsaWRBbmFseXRpY2FsQ3VycmVuY3lPclVuaXR9XCI+XG5cdFx0XHQ8Y29udHJvbHM6Y29udGVudFRydWU+XG5cdFx0XHRcdFx0PFRleHQgeG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdFx0XHRpZD1cIiR7aW50ZXJuYWxGaWVsZC5ub1dyYXBwZXJJZH1cIlxuXHRcdFx0XHRcdFx0dGV4dD1cIiR7aW50ZXJuYWxGaWVsZC50ZXh0fVwiXG5cdFx0XHRcdFx0XHRlbXB0eUluZGljYXRvck1vZGU9XCIke2ludGVybmFsRmllbGQuZW1wdHlJbmRpY2F0b3JNb2RlfVwiXG5cdFx0XHRcdFx0XHRyZW5kZXJXaGl0ZXNwYWNlPVwidHJ1ZVwiXG5cdFx0XHRcdFx0XHR3cmFwcGluZz1cIiR7aW50ZXJuYWxGaWVsZC53cmFwfVwiXG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9jb250cm9sczpjb250ZW50VHJ1ZT5cblx0XHRcdFx0PGNvbnRyb2xzOmNvbnRlbnRGYWxzZT5cblx0XHRcdFx0XHQ8VGV4dCB4bWxucz1cInNhcC5tXCIgaWQ9XCIke2ludGVybmFsRmllbGQubm9XcmFwcGVySWR9XCIgdGV4dD1cIipcIiAvPlxuXHRcdFx0XHQ8L2NvbnRyb2xzOmNvbnRlbnRGYWxzZT5cblx0XHRcdDwvY29udHJvbHM6Q29uZGl0aW9uYWxXcmFwcGVyPlxuXHRcdGA7XG5cdFx0fSBlbHNlIGlmIChpbnRlcm5hbEZpZWxkLmZvcm1hdE9wdGlvbnMucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCkge1xuXHRcdFx0cmV0dXJuIHhtbGA8VGV4dFxuXHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0aWQ9XCIke2ludGVybmFsRmllbGQubm9XcmFwcGVySWR9XCJcblx0XHRcdFx0dmlzaWJsZT1cIiR7aW50ZXJuYWxGaWVsZC5kaXNwbGF5VmlzaWJsZX1cIlxuXHRcdFx0XHR0ZXh0PVwiJHtpbnRlcm5hbEZpZWxkLnRleHRGcm9tVmFsdWVMaXN0fVwiXG5cdFx0XHRcdGNvcmU6cmVxdWlyZT1cIntGaWVsZFJ1bnRpbWU6ICdzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkUnVudGltZSd9XCJcblx0XHRcdFx0ZW1wdHlJbmRpY2F0b3JNb2RlPVwiJHtpbnRlcm5hbEZpZWxkLmVtcHR5SW5kaWNhdG9yTW9kZX1cIlxuXHRcdFx0XHRyZW5kZXJXaGl0ZXNwYWNlPVwidHJ1ZVwiXG5cdFx0XHQvPmA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB4bWxgPFRleHRcblx0XHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdGlkPVwiJHtpbnRlcm5hbEZpZWxkLm5vV3JhcHBlcklkfVwiXG5cdFx0XHRcdHZpc2libGU9XCIke2ludGVybmFsRmllbGQuZGlzcGxheVZpc2libGV9XCJcblx0XHRcdFx0dGV4dD1cIiR7aW50ZXJuYWxGaWVsZC50ZXh0fVwiXG5cdFx0XHRcdHdyYXBwaW5nPVwiJHtpbnRlcm5hbEZpZWxkLndyYXB9XCJcblx0XHRcdFx0ZW1wdHlJbmRpY2F0b3JNb2RlPVwiJHtpbnRlcm5hbEZpZWxkLmVtcHR5SW5kaWNhdG9yTW9kZX1cIlxuXHRcdFx0XHRyZW5kZXJXaGl0ZXNwYWNlPVwidHJ1ZVwiXG5cdFx0Lz5gO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBPYmplY3RJZGVudGlmaWVyIHRlbXBsYXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRPYmplY3RJZGVudGlmaWVyKGludGVybmFsRmllbGQ6IEludGVybmFsRmllbGRCbG9jaykge1xuXHRcdGNvbnN0IGRlcGVuZGVudHMgPSBpbnRlcm5hbEZpZWxkLmhhc1F1aWNrVmlld1xuXHRcdFx0PyB4bWxgPGRlcGVuZGVudHM+XG5cdDxtYWNybzpRdWlja1ZpZXcgeG1sbnM6bWFjcm89XCJzYXAuZmUubWFjcm9zXCIgZGF0YUZpZWxkPVwiJHtpbnRlcm5hbEZpZWxkLmRhdGFGaWVsZH1cIiBzZW1hbnRpY09iamVjdD1cIiR7aW50ZXJuYWxGaWVsZC5zZW1hbnRpY09iamVjdH1cIiBjb250ZXh0UGF0aD1cIiR7aW50ZXJuYWxGaWVsZC5lbnRpdHlTZXR9XCIgLz5cbjwvZGVwZW5kZW50cz5gXG5cdFx0XHQ6IFwiXCI7XG5cdFx0bGV0IGlkZW50aWZpZXIgPSB4bWxgPE9iamVjdElkZW50aWZpZXJcblx0eG1sbnM9XCJzYXAubVwiXG5cdGNvcmU6cmVxdWlyZT1cIntGaWVsZFJ1bnRpbWU6ICdzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkUnVudGltZSd9XCJcblx0aWQ9XCIke2ludGVybmFsRmllbGQubm9XcmFwcGVySWR9XCJcblx0dGl0bGU9XCIke2ludGVybmFsRmllbGQuaWRlbnRpZmllclRpdGxlfVwiXG5cdHRleHQ9XCIke2ludGVybmFsRmllbGQuaWRlbnRpZmllclRleHR9XCJcblx0dGl0bGVBY3RpdmU9XCIke2ludGVybmFsRmllbGQuaGFzUXVpY2tWaWV3fVwiXG5cdHRpdGxlUHJlc3M9XCJGaWVsZFJ1bnRpbWUucHJlc3NMaW5rXCJcblx0YXJpYUxhYmVsbGVkQnk9XCIke2ludGVybmFsRmllbGQuYXJpYUxhYmVsbGVkQnl9XCJcblx0ZW1wdHlJbmRpY2F0b3JNb2RlPVwiJHtpbnRlcm5hbEZpZWxkLmVtcHR5SW5kaWNhdG9yTW9kZX1cIj5cbiR7ZGVwZW5kZW50c308L09iamVjdElkZW50aWZpZXI+YDtcblx0XHRpZiAoaW50ZXJuYWxGaWVsZC5oYXNTaXR1YXRpb25zSW5kaWNhdG9yKSB7XG5cdFx0XHRpZGVudGlmaWVyID0geG1sYDxIQm94IHhtbG5zPVwic2FwLm1cIiBhbGlnbkl0ZW1zPVwiQ2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJTcGFjZUJldHdlZW5cIiB3aWR0aD1cIjEwMCVcIj5cblx0XHRcdFx0XHRcdFx0JHtpZGVudGlmaWVyfVxuXHRcdFx0XHRcdFx0XHQ8U2l0dWF0aW9uc0luZGljYXRvclxuXHRcdFx0XHRcdFx0XHRcdHhtbG5zPVwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5zaXR1YXRpb25zXCJcblx0XHRcdFx0XHRcdFx0XHRlbnRpdHlTZXQ9XCIke2ludGVybmFsRmllbGQuZW50aXR5U2V0fVwiXG5cdFx0XHRcdFx0XHRcdFx0cHJvcGVydHlQYXRoPVwiJHtpbnRlcm5hbEZpZWxkLnNpdHVhdGlvbnNJbmRpY2F0b3JQcm9wZXJ0eVBhdGh9XCJcblx0XHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHRcdDwvSEJveD5gO1xuXHRcdH1cblx0XHRpZiAoaW50ZXJuYWxGaWVsZC5zaG93RXJyb3JJbmRpY2F0b3IpIHtcblx0XHRcdGlkZW50aWZpZXIgPSB4bWxgPFZCb3ggeG1sbnM9XCJzYXAubVwiPlxuXHRcdFx0XHQke2lkZW50aWZpZXJ9XG5cdFx0XHRcdFx0PE9iamVjdFN0YXR1c1xuXHRcdFx0XHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdFx0XHR2aXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLnNob3dFcnJvck9iamVjdFN0YXR1c31cIlxuXHRcdFx0XHRcdFx0Y2xhc3M9XCJzYXBVaVNtYWxsTWFyZ2luQm90dG9tXCJcblx0XHRcdFx0XHRcdHRleHQ9XCJ7c2FwLmZlLmkxOG4+Q29udGFpbnNfRXJyb3JzfVwiXG5cdFx0XHRcdFx0XHRzdGF0ZT1cIkVycm9yXCJcblx0XHRcdFx0XHQvPlxuXHRcdFx0PC9WQm94PmA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHhtbGAke2lkZW50aWZpZXJ9YDtcblx0fSxcblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBPYmplY3RTdGF0dXMgdGVtcGxhdGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBpbnRlcm5hbEZpZWxkIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBpbnRlcm5hbCBmaWVsZCBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldE9iamVjdFN0YXR1cyhpbnRlcm5hbEZpZWxkOiBJbnRlcm5hbEZpZWxkQmxvY2spIHtcblx0XHRsZXQgb2JqZWN0U3RhdHVzO1xuXHRcdGNvbnN0IGRhdGFNb2RlbE9iamVjdFBhdGggPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKGludGVybmFsRmllbGQuZGF0YUZpZWxkLCBpbnRlcm5hbEZpZWxkLmVudGl0eVNldCk7XG5cdFx0Y29uc3QgZW5oYW5jZWRWYWx1ZURhdGFNb2RlbFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChkYXRhTW9kZWxPYmplY3RQYXRoLCBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5WYWx1ZS5wYXRoKTtcblx0XHRjb25zdCBjb25kaXRpb24gPSBoYXNWYWxpZEFuYWx5dGljYWxDdXJyZW5jeU9yVW5pdChlbmhhbmNlZFZhbHVlRGF0YU1vZGVsUGF0aCk7XG5cdFx0Y29uc3QgY29udmVydGVkRGF0YUZpZWxkID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhpbnRlcm5hbEZpZWxkLmRhdGFGaWVsZCk7XG5cdFx0Y29uc3QgY3JpdGljYWxpdHlJY29uID0gYnVpbGRFeHByZXNzaW9uRm9yQ3JpdGljYWxpdHlJY29uKGNvbnZlcnRlZERhdGFGaWVsZCk7XG5cdFx0Y29uc3Qgc3RhdGUgPSBidWlsZEV4cHJlc3Npb25Gb3JDcml0aWNhbGl0eUNvbG9yKGNvbnZlcnRlZERhdGFGaWVsZCk7XG5cblx0XHRpZiAoaW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zLmlzQW5hbHl0aWNzICYmIGludGVybmFsRmllbGQuaGFzVW5pdE9yQ3VycmVuY3kpIHtcblx0XHRcdG9iamVjdFN0YXR1cyA9IHhtbGA8Y29udHJvbHM6Q29uZGl0aW9uYWxXcmFwcGVyIHhtbG5zOmNvbnRyb2xzPVwic2FwLmZlLm1hY3Jvcy5jb250cm9sc1wiXG5cdFx0XHRpZD1cIiR7aW50ZXJuYWxGaWVsZC5ub1dyYXBwZXJJZH1cIlxuXHRcdFx0Y29uZGl0aW9uPVwiJHtjb25kaXRpb259XCJcblx0XHQ+XG5cdFx0XHQ8Y29udHJvbHM6Y29udGVudFRydWU+XG5cdFx0XHRcdDxPYmplY3RTdGF0dXNcblx0XHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0XHRpY29uPVwiJHtjcml0aWNhbGl0eUljb259XCJcblx0XHRcdFx0XHRzdGF0ZT1cIiR7c3RhdGV9XCJcblx0XHRcdFx0XHR2aXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmRpc3BsYXlWaXNpYmxlfVwiXG5cdFx0XHRcdFx0dGV4dD1cIiR7aW50ZXJuYWxGaWVsZC50ZXh0fVwiXG5cdFx0XHRcdFx0ZW1wdHlJbmRpY2F0b3JNb2RlPVwiJHtpbnRlcm5hbEZpZWxkLmVtcHR5SW5kaWNhdG9yTW9kZX1cIlxuXHRcdFx0XHRcdGNsYXNzPVwic2FwTVRleHRSZW5kZXJXaGl0ZXNwYWNlV3JhcFwiXG5cdFx0XHRcdC8+XG5cdFx0XHQ8L2NvbnRyb2xzOmNvbnRlbnRUcnVlPlxuXHRcdFx0PGNvbnRyb2xzOmNvbnRlbnRGYWxzZT5cblx0XHRcdFx0PE9iamVjdFN0YXR1cyB4bWxucz1cInNhcC5tXCIgdGV4dD1cIipcIiB2aXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmRpc3BsYXlWaXNpYmxlfVwiIC8+XG5cdFx0XHQ8L2NvbnRyb2xzOmNvbnRlbnRGYWxzZT5cblx0XHQ8L2NvbnRyb2xzOkNvbmRpdGlvbmFsV3JhcHBlcj5gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgZGVwZW5kZW50cyA9IFwiXCI7XG5cdFx0XHRsZXQgYWN0aXZlID0gZmFsc2U7XG5cdFx0XHRsZXQgcHJlc3NBY3Rpb247XG5cdFx0XHRpZiAoaW50ZXJuYWxGaWVsZC5oYXNRdWlja1ZpZXcpIHtcblx0XHRcdFx0ZGVwZW5kZW50cyA9IHhtbGA8ZGVwZW5kZW50cz5cblx0XHRcdFx0XHQ8bWFjcm86UXVpY2tWaWV3IHhtbG5zOm1hY3JvPVwic2FwLmZlLm1hY3Jvc1wiIGRhdGFGaWVsZD1cIiR7aW50ZXJuYWxGaWVsZC5kYXRhRmllbGR9XCIgc2VtYW50aWNPYmplY3Q9XCIke2ludGVybmFsRmllbGQuc2VtYW50aWNPYmplY3R9XCIgY29udGV4dFBhdGg9XCIke2ludGVybmFsRmllbGQuZW50aXR5U2V0fVwiIC8+XG5cdFx0XHRcdDwvZGVwZW5kZW50cz5gO1xuXHRcdFx0XHRhY3RpdmUgPSB0cnVlO1xuXHRcdFx0XHRwcmVzc0FjdGlvbiA9IFwiRmllbGRSdW50aW1lLnByZXNzTGlua1wiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGludGVybmFsRmllbGQubGlua1VybCkge1xuXHRcdFx0XHRhY3RpdmUgPSB0cnVlO1xuXHRcdFx0XHRwcmVzc0FjdGlvbiA9IFwiRmllbGRSdW50aW1lLm9wZW5FeHRlcm5hbExpbmtcIjtcblx0XHRcdH1cblxuXHRcdFx0b2JqZWN0U3RhdHVzID0geG1sYDxPYmplY3RTdGF0dXNcblx0XHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdGlkPVwiJHtpbnRlcm5hbEZpZWxkLm5vV3JhcHBlcklkfVwiXG5cdFx0XHRcdGljb249XCIke2NyaXRpY2FsaXR5SWNvbn1cIlxuXHRcdFx0XHRzdGF0ZT1cIiR7c3RhdGV9XCJcblx0XHRcdFx0dGV4dD1cIiR7aW50ZXJuYWxGaWVsZC50ZXh0fVwiXG5cdFx0XHRcdHZpc2libGU9XCIke2ludGVybmFsRmllbGQuZGlzcGxheVZpc2libGV9XCJcblx0XHRcdFx0ZW1wdHlJbmRpY2F0b3JNb2RlPVwiJHtpbnRlcm5hbEZpZWxkLmVtcHR5SW5kaWNhdG9yTW9kZX1cIlxuXHRcdFx0XHRjb3JlOnJlcXVpcmU9XCJ7RmllbGRSdW50aW1lOiAnc2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZFJ1bnRpbWUnfVwiXG5cdFx0XHRcdGFjdGl2ZT1cIiR7YWN0aXZlfVwiXG5cdFx0XHRcdHByZXNzPVwiJHtwcmVzc0FjdGlvbn1cIlxuXHRcdFx0XHRjdXN0b21EYXRhOnVybD1cIiR7aW50ZXJuYWxGaWVsZC5saW5rVXJsfVwiXG5cdFx0XHQ+XG5cdFx0XHQke2RlcGVuZGVudHN9XG5cdFx0PC9PYmplY3RTdGF0dXM+YDtcblx0XHR9XG5cblx0XHRyZXR1cm4gb2JqZWN0U3RhdHVzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgdGhlIExhYmVsU2VtYW50aWNrZXkgdGVtcGxhdGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBpbnRlcm5hbEZpZWxkIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBpbnRlcm5hbCBmaWVsZCBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldExhYmVsU2VtYW50aWNLZXkoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrKSB7XG5cdFx0aWYgKGludGVybmFsRmllbGQuaGFzUXVpY2tWaWV3KSB7XG5cdFx0XHRyZXR1cm4geG1sYDxMaW5rXG5cdFx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHR0ZXh0PVwiJHtpbnRlcm5hbEZpZWxkLnRleHR9XCJcblx0XHRcdFx0d3JhcHBpbmc9XCJ0cnVlXCJcblx0XHRcdFx0Y29yZTpyZXF1aXJlPVwie0ZpZWxkUnVudGltZTogJ3NhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lJ31cIlxuXHRcdFx0XHRwcmVzcz1cIkZpZWxkUnVudGltZS5wcmVzc0xpbmtcIlxuXHRcdFx0XHRhcmlhTGFiZWxsZWRCeT1cIiR7aW50ZXJuYWxGaWVsZC5hcmlhTGFiZWxsZWRCeX1cIlxuXHRcdFx0XHRlbXB0eUluZGljYXRvck1vZGU9XCIke2ludGVybmFsRmllbGQuZW1wdHlJbmRpY2F0b3JNb2RlfVwiPlxuXHRcdFx0XHRcdDxkZXBlbmRlbnRzPlxuXHRcdFx0XHRcdFx0PG1hY3JvOlF1aWNrVmlldyB4bWxuczptYWNybz1cInNhcC5mZS5tYWNyb3NcIiBkYXRhRmllbGQ9XCIke2ludGVybmFsRmllbGQuZGF0YUZpZWxkfVwiIHNlbWFudGljT2JqZWN0PVwiJHtpbnRlcm5hbEZpZWxkLnNlbWFudGljT2JqZWN0fVwiIGNvbnRleHRQYXRoPVwiJHtpbnRlcm5hbEZpZWxkLmVudGl0eVNldH1cIiAvPlxuXHRcdFx0XHRcdDwvZGVwZW5kZW50cz5cblx0XHRcdFx0PC9MaW5rPmA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHhtbGA8TGFiZWxcblx0XHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdGlkPVwiJHtpbnRlcm5hbEZpZWxkLm5vV3JhcHBlcklkfVwiXG5cdFx0XHRcdHZpc2libGU9XCIke2ludGVybmFsRmllbGQuZGlzcGxheVZpc2libGV9XCJcblx0XHRcdFx0dGV4dD1cIiR7aW50ZXJuYWxGaWVsZC5pZGVudGlmaWVyVGl0bGV9XCJcblx0XHRcdFx0ZGVzaWduPVwiQm9sZFwiLz5gO1xuXHR9LFxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBzZW1hbnRpYyBrZXkgd2l0aCBkcmFmdCBpbmRpY2F0b3IgdGVtcGxhdGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBpbnRlcm5hbEZpZWxkIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBpbnRlcm5hbCBmaWVsZCBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldFNlbWFudGljS2V5V2l0aERyYWZ0SW5kaWNhdG9yVGVtcGxhdGUoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrKSB7XG5cdFx0bGV0IHNlbWFudGljS2V5VGVtcGxhdGUgPVxuXHRcdFx0aW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zLnNlbWFudGljS2V5U3R5bGUgPT09IFwiT2JqZWN0SWRlbnRpZmllclwiXG5cdFx0XHRcdD8gRGlzcGxheVN0eWxlLmdldE9iamVjdElkZW50aWZpZXIoaW50ZXJuYWxGaWVsZClcblx0XHRcdFx0OiBEaXNwbGF5U3R5bGUuZ2V0TGFiZWxTZW1hbnRpY0tleShpbnRlcm5hbEZpZWxkKTtcblx0XHRpZiAoIWludGVybmFsRmllbGQuZm9ybWF0T3B0aW9ucy5maWVsZEdyb3VwRHJhZnRJbmRpY2F0b3JQcm9wZXJ0eVBhdGgpIHtcblx0XHRcdC8vIGlmIHRoZSBkcmFmdEluZGljYXRvciBpcyBub3QgaGFuZGxlZCBhdCB0aGUgZmllbGRHcm91cCBsZXZlbFxuXHRcdFx0Ly9UT0RPIGNvdWxkIHRoaXMgYmUgYSBib29sZWFuIG5vIGRyYWZ0SW5kaWNhdG9yXG5cdFx0XHRzZW1hbnRpY0tleVRlbXBsYXRlID0geG1sYDxjb250cm9sczpGb3JtRWxlbWVudFdyYXBwZXJcblx0XHRcdFx0XHRcdFx0XHRcdFx0eG1sbnM6Y29udHJvbHM9XCJzYXAuZmUuY29yZS5jb250cm9sc1wiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZpc2libGU9XCIke2ludGVybmFsRmllbGQuZGlzcGxheVZpc2libGV9XCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxWQm94XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjbGFzcz1cIiR7RmllbGRIZWxwZXIuZ2V0TWFyZ2luQ2xhc3MoaW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zLmNvbXBhY3RTZW1hbnRpY0tleSl9XCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JHtzZW1hbnRpY0tleVRlbXBsYXRlfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxtYWNybzpEcmFmdEluZGljYXRvclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0eG1sbnM6bWFjcm89XCJzYXAuZmUubWFjcm9zXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRyYWZ0SW5kaWNhdG9yVHlwZT1cIkljb25BbmRUZXh0XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGVudGl0eVNldD1cIiR7aW50ZXJuYWxGaWVsZC5lbnRpdHlTZXR9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlzRHJhZnRJbmRpY2F0b3JWaXNpYmxlPVwiJHtpbnRlcm5hbEZpZWxkLmRyYWZ0SW5kaWNhdG9yVmlzaWJsZX1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YXJpYUxhYmVsbGVkQnk9XCIke2ludGVybmFsRmllbGQuYXJpYUxhYmVsbGVkQnl9XCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1ZCb3g+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L2NvbnRyb2xzOkZvcm1FbGVtZW50V3JhcHBlcj5gO1xuXHRcdH1cblx0XHRyZXR1cm4gc2VtYW50aWNLZXlUZW1wbGF0ZTtcblx0fSxcblxuXHQvKipcblx0ICogRW50cnkgcG9pbnQgZm9yIGZ1cnRoZXIgdGVtcGxhdGluZyBwcm9jZXNzaW5ncy5cblx0ICpcblx0ICogQHBhcmFtIGludGVybmFsRmllbGQgUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGludGVybmFsIGZpZWxkIGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZmllbGQgY29udHJvbFxuXHQgKi9cblx0Z2V0VGVtcGxhdGU6IChpbnRlcm5hbEZpZWxkOiBJbnRlcm5hbEZpZWxkQmxvY2spID0+IHtcblx0XHRsZXQgaW5uZXJGaWVsZENvbnRlbnQ7XG5cdFx0c3dpdGNoIChpbnRlcm5hbEZpZWxkLmRpc3BsYXlTdHlsZSBhcyBEaXNwbGF5U3R5bGVUeXBlKSB7XG5cdFx0XHRjYXNlIFwiQW1vdW50V2l0aEN1cnJlbmN5XCI6XG5cdFx0XHRcdGlubmVyRmllbGRDb250ZW50ID0gRGlzcGxheVN0eWxlLmdldEFtb3VudFdpdGhDdXJyZW5jeVRlbXBsYXRlKGludGVybmFsRmllbGQpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJBdmF0YXJcIjpcblx0XHRcdFx0aW5uZXJGaWVsZENvbnRlbnQgPSBEaXNwbGF5U3R5bGUuZ2V0QXZhdGFyVGVtcGxhdGUoaW50ZXJuYWxGaWVsZCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJ1dHRvblwiOlxuXHRcdFx0XHRpbm5lckZpZWxkQ29udGVudCA9IERpc3BsYXlTdHlsZS5nZXRCdXR0b25UZW1wbGF0ZShpbnRlcm5hbEZpZWxkKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiQ29udGFjdFwiOlxuXHRcdFx0XHRpbm5lckZpZWxkQ29udGVudCA9IERpc3BsYXlTdHlsZS5nZXRDb250YWN0VGVtcGxhdGUoaW50ZXJuYWxGaWVsZCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkRhdGFQb2ludFwiOlxuXHRcdFx0XHRpbm5lckZpZWxkQ29udGVudCA9IERpc3BsYXlTdHlsZS5nZXREYXRhUG9pbnRUZW1wbGF0ZShpbnRlcm5hbEZpZWxkKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRXhwYW5kYWJsZVRleHRcIjpcblx0XHRcdFx0aW5uZXJGaWVsZENvbnRlbnQgPSBEaXNwbGF5U3R5bGUuZ2V0RXhwYW5kYWJsZVRleHQoaW50ZXJuYWxGaWVsZCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkZpbGVcIjpcblx0XHRcdFx0aW5uZXJGaWVsZENvbnRlbnQgPSBEaXNwbGF5U3R5bGUuZ2V0RmlsZVRlbXBsYXRlKGludGVybmFsRmllbGQpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJMaW5rXCI6XG5cdFx0XHRcdGlubmVyRmllbGRDb250ZW50ID0gRGlzcGxheVN0eWxlLmdldExpbmtUZW1wbGF0ZShpbnRlcm5hbEZpZWxkKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTGlua1dpdGhRdWlja1ZpZXdcIjpcblx0XHRcdFx0aW5uZXJGaWVsZENvbnRlbnQgPSBEaXNwbGF5U3R5bGUuZ2V0TGlua1dpdGhRdWlja1ZpZXdUZW1wbGF0ZShpbnRlcm5hbEZpZWxkKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiT2JqZWN0SWRlbnRpZmllclwiOlxuXHRcdFx0XHRpbm5lckZpZWxkQ29udGVudCA9IERpc3BsYXlTdHlsZS5nZXRPYmplY3RJZGVudGlmaWVyKGludGVybmFsRmllbGQpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJPYmplY3RTdGF0dXNcIjoge1xuXHRcdFx0XHRpbm5lckZpZWxkQ29udGVudCA9IERpc3BsYXlTdHlsZS5nZXRPYmplY3RTdGF0dXMoaW50ZXJuYWxGaWVsZCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBcIkxhYmVsU2VtYW50aWNLZXlcIjpcblx0XHRcdFx0aW5uZXJGaWVsZENvbnRlbnQgPSBEaXNwbGF5U3R5bGUuZ2V0TGFiZWxTZW1hbnRpY0tleShpbnRlcm5hbEZpZWxkKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiU2VtYW50aWNLZXlXaXRoRHJhZnRJbmRpY2F0b3JcIjpcblx0XHRcdFx0aW5uZXJGaWVsZENvbnRlbnQgPSBEaXNwbGF5U3R5bGUuZ2V0U2VtYW50aWNLZXlXaXRoRHJhZnRJbmRpY2F0b3JUZW1wbGF0ZShpbnRlcm5hbEZpZWxkKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiVGV4dFwiOlxuXHRcdFx0XHRpbm5lckZpZWxkQ29udGVudCA9IERpc3BsYXlTdHlsZS5nZXRUZXh0VGVtcGxhdGUoaW50ZXJuYWxGaWVsZCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbm5lckZpZWxkQ29udGVudDtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRGlzcGxheVN0eWxlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7OztFQWdCQSxNQUFNQSxZQUFZLEdBQUc7SUFDcEI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLDZCQUE2QixDQUFDQyxhQUFpQyxFQUFFO01BQ2hFLElBQUlBLGFBQWEsQ0FBQ0MsYUFBYSxDQUFDQyxXQUFXLEVBQUU7UUFDNUMsT0FBT0MsR0FBSSxpRkFBZ0ZILGFBQWEsQ0FBQ0ksY0FBZSxnQkFBZUosYUFBYSxDQUFDSyxnQ0FBaUM7QUFDekw7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CTCxhQUFhLENBQUNNLDhCQUErQjtBQUNqRSxpQkFBaUJOLGFBQWEsQ0FBQ08scUJBQXNCO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDO01BQy9CLENBQUMsTUFBTTtRQUNOLE9BQU9KLEdBQUk7QUFDZDtBQUNBLFlBQVlILGFBQWEsQ0FBQ0MsYUFBYSxDQUFDTyxhQUFhLEtBQUssT0FBTyxHQUFHLE1BQU0sR0FBR0MsU0FBVTtBQUN2RjtBQUNBO0FBQ0E7QUFDQSxlQUFlVCxhQUFhLENBQUNJLGNBQWU7QUFDNUMsbUJBQW1CSixhQUFhLENBQUNNLDhCQUErQjtBQUNoRSxnQkFBZ0JOLGFBQWEsQ0FBQ08scUJBQXNCO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQztNQUNuQztJQUNELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0csaUJBQWlCLENBQUNWLGFBQWlDLEVBQUU7TUFDcEQsSUFBSVcsUUFBUTtNQUNaLElBQUlYLGFBQWEsQ0FBQ1ksT0FBTyxFQUFFO1FBQzFCRCxRQUFRLEdBQUdYLGFBQWEsQ0FBQ1ksT0FBTztNQUNqQyxDQUFDLE1BQU0sSUFBSVosYUFBYSxDQUFDYSxRQUFRLEVBQUU7UUFDbENGLFFB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