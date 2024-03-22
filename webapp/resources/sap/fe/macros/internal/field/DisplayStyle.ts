import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import {
	buildExpressionForCriticalityButtonType,
	buildExpressionForCriticalityColor,
	buildExpressionForCriticalityIcon
} from "sap/fe/core/templating/CriticalityFormatters";
import { enhanceDataModelPath } from "sap/fe/core/templating/DataModelPathHelper";
import { hasValidAnalyticalCurrencyOrUnit } from "sap/fe/core/templating/UIFormatters";
import FieldHelper from "sap/fe/macros/field/FieldHelper";
import EditMode from "sap/ui/mdc/enum/EditMode";
import type InternalFieldBlock from "../InternalField.block";
import type { DisplayStyle as DisplayStyleType } from "../InternalField.block";

const DisplayStyle = {
	/**
	 * Generates the AmountWithCurrency template.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getAmountWithCurrencyTemplate(internalField: InternalFieldBlock) {
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
	getAvatarTemplate(internalField: InternalFieldBlock) {
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
	getButtonTemplate: (internalField: InternalFieldBlock) => {
		const convertedDataField = MetaModelConverter.convertMetaModelContext(internalField.dataField);
		const oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(internalField.dataField, internalField.entitySet);

		const icon = internalField.formatOptions?.showIconUrl ?? false ? convertedDataField.IconUrl : undefined;
		const text = !(internalField.formatOptions?.showIconUrl ?? false) ? convertedDataField.Label : undefined;
		const tooltip = internalField.formatOptions?.showIconUrl ?? false ? convertedDataField.Label : undefined;
		let button = "";
		if (convertedDataField.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation) {
			button = xml`<Button
				xmlns="sap.m"
				visible="${internalField.visible}"
				text="${text}"
				icon="${icon}"
				enabled="${internalField.navigationAvailable}"
				tooltip="${tooltip}"
				press="${internalField.buttonPress}"
			/>`;
		} else if (
			FieldHelper.isDataFieldActionButtonVisible(
				this,
				convertedDataField,
				internalField.buttonIsBound,
				internalField.buttonOperationAvailable
			)
		) {
			const enabled = FieldHelper.isDataFieldActionButtonEnabled(
				convertedDataField,
				internalField.buttonIsBound as unknown as boolean,
				internalField.buttonOperationAvailable,
				internalField.buttonOperationAvailableFormatted as string
			);
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
	getContactTemplate(internalField: InternalFieldBlock) {
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
	getDataPointInnerPart(internalField: InternalFieldBlock, withConditionalWrapper: boolean) {
		const convertedDataField = MetaModelConverter.convertMetaModelContext(internalField.dataField);

		const metaPath =
			convertedDataField.$Type === UIAnnotationTypes.DataFieldForAnnotation
				? internalField.dataField.getModel().createBindingContext("Target/$AnnotationPath", internalField.dataField)
				: internalField.dataField;

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
	getDataPointTemplate(internalField: InternalFieldBlock) {
		if ((internalField.formatOptions.isAnalytics ?? false) && (internalField.hasUnitOrCurrency ?? false)) {
			return xml`<controls:ConditionalWrapper xmlns:controls="sap.fe.macros.controls" visible="${
				internalField.displayVisible
			}" condition="${internalField.hasValidAnalyticalCurrencyOrUnit}">
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
	getExpandableText(internalField: InternalFieldBlock) {
		return xml`
			<ExpandableText
				xmlns="sap.m"
				id="${internalField?.noWrapperId}"
				visible="${internalField?.displayVisible}"
				text="${internalField?.text}"
				overflowMode="${internalField?.formatOptions?.textExpandBehaviorDisplay}"
				maxCharacters="${internalField?.formatOptions?.textMaxCharactersDisplay}"
				emptyIndicatorMode="${internalField?.emptyIndicatorMode}"
		/>`;
	},

	/**
	 * Generates the File template.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getFileTemplate(internalField: InternalFieldBlock) {
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
					uploadComplete="FIELDRUNTIME.handleUploadComplete($event, ${internalField.fileFilenameExpression || "undefined"}, '${
				internalField.fileRelativePropertyPath
			}', $controller)"
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
					press="FIELDRUNTIME.removeStream($event, ${internalField.fileFilenameExpression || "undefined"}, '${
				internalField.fileRelativePropertyPath
			}', $controller)"
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
	getLinkTemplate(internalField: InternalFieldBlock) {
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
	getLinkWithQuickViewTemplate(internalField: InternalFieldBlock) {
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
				<macro:QuickView xmlns:macro="sap.fe.macros" dataField="${internalField.dataField}" semanticObject="${
			internalField.semanticObject
		}" contextPath="${internalField.entitySet}" />
			</dependents>
		</Link>`;
	},

	/**
	 * Generates the Text template.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getTextTemplate(internalField: InternalFieldBlock) {
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
	getObjectIdentifier(internalField: InternalFieldBlock) {
		const dependents = internalField.hasQuickView
			? xml`<dependents>
	<macro:QuickView xmlns:macro="sap.fe.macros" dataField="${internalField.dataField}" semanticObject="${internalField.semanticObject}" contextPath="${internalField.entitySet}" />
</dependents>`
			: "";
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
	getObjectStatus(internalField: InternalFieldBlock) {
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
	getLabelSemanticKey(internalField: InternalFieldBlock) {
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
	getSemanticKeyWithDraftIndicatorTemplate(internalField: InternalFieldBlock) {
		let semanticKeyTemplate =
			internalField.formatOptions.semanticKeyStyle === "ObjectIdentifier"
				? DisplayStyle.getObjectIdentifier(internalField)
				: DisplayStyle.getLabelSemanticKey(internalField);
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
	getTemplate: (internalField: InternalFieldBlock) => {
		let innerFieldContent;
		switch (internalField.displayStyle as DisplayStyleType) {
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
			case "ObjectStatus": {
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

export default DisplayStyle;
