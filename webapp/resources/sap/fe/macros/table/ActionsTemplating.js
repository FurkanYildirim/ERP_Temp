/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/converters/annotations/DataField","sap/fe/core/converters/controls/Common/Action","sap/fe/core/converters/ManifestSettings","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/StableIdHelper","sap/fe/core/templating/UIFormatters","../CommonHelper","../internal/helpers/DefaultActionHandler","./TableHelper"],function(t,e,n,a,o,i,l,c,r,s){"use strict";var d={};var u=l.getDataModelObjectPath;var m=i.generate;var b=a.ActionType;var p=n.ButtonType;var v=e.isDataModelObjectPathForActionWithDialog;var f=e.isDataFieldForIntentBasedNavigation;var A=e.isDataFieldForAction;var $=t.xml;function x(t,e,n,a){var i,l,r,d,u;if(!n.annotationPath)return;const m=c.getActionContext(a.metaPath.getModel().createBindingContext(n.annotationPath+"/Action"));const b=a.metaPath.getModel().createBindingContext(m);const p=b?o.getInvolvedDataModelObjects(b,a.collection):undefined;const v=(i=t.ActionTarget)===null||i===void 0?void 0:i.isBound;const f=((l=t.ActionTarget)===null||l===void 0?void 0:(r=l.annotations)===null||r===void 0?void 0:(d=r.Core)===null||d===void 0?void 0:(u=d.OperationAvailable)===null||u===void 0?void 0:u.valueOf())!==false;const A=n.command?"cmd:"+n.command:s.pressEventDataFieldForActionButton({contextObjectPath:a.contextObjectPath,id:a.id},t,a.collectionEntity.name,a.tableDefinition.operationAvailableMap,b.getObject(),e.isNavigable,n.enableAutoScroll,n.defaultValuesExtensionFunction);const x=n.enabled!==undefined?n.enabled:s.isDataFieldForActionEnabled(a.tableDefinition,t.Action,!!v,b.getObject(),n.enableOnSelect,p===null||p===void 0?void 0:p.targetEntityType);if(v!==true||f){return $`<MenuItem
				text="${t.Label}"
				press="${A}"
				enabled="${x}"
				visible="${n.visible}"
				/>`}}function g(t,e,n){const a=e.annotationPath?n.metaPath.getModel().createBindingContext(e.annotationPath):null;return $`<MenuItem xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
			text="${t.Label}"
			press="${e.command?"cmd:"+e.command:c.getPressHandlerForDataFieldForIBN(a===null||a===void 0?void 0:a.getObject(),"${internal>selectedContexts}",!n.tableDefinition.enableAnalytics)}"
			enabled="${e.enabled!==undefined?e.enabled:s.isDataFieldForIBNEnabled({collection:n.collection,tableDefinition:n.tableDefinition},t,t.RequiresContext,t.NavigationAvailable)}"
			visible="${e.visible}"
			macrodata:IBNData="${!t.RequiresContext?`{semanticObject: '${t.SemanticObject}' , action : '${t.Action}'}`:undefined}"
		/>`}function D(t,e,n){const a=e.annotationPath?n.convertedMetaData.resolvePath(e.annotationPath).target:undefined;switch(a&&e.type){case"ForAction":if(A(a)){return x(a,t,e,n)}break;case"ForNavigation":if(f(a)){return g(a,e,n)}break;default:}const o=e.noWrap?e.press:c.buildActionWrapper(e,{id:n.id});return $`<MenuItem
				core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
				text="${e===null||e===void 0?void 0:e.text}"
				press="${e.command?"cmd:"+e.command:o}"
				visible="${e.visible}"
				enabled="${e.enabled}"
			/>`}function T(t,e,n){var a;const i=n.metaPath.getModel().createBindingContext(e.annotationPath+"/Action");const l=c.getActionContext(i);const r=n.metaPath.getModel().createBindingContext(l);const d=r?o.getInvolvedDataModelObjects(r,n.collection):undefined;const b=(a=t.ActionTarget)===null||a===void 0?void 0:a.isBound;const f=e.command?"cmd:"+e.command:s.pressEventDataFieldForActionButton({contextObjectPath:n.contextObjectPath,id:n.id},t,n.collectionEntity.name,n.tableDefinition.operationAvailableMap,r.getObject(),e.isNavigable,e.enableAutoScroll,e.defaultValuesExtensionFunction);const A=e.enabled!==undefined?e.enabled:s.isDataFieldForActionEnabled(n.tableDefinition,t.Action,!!b,r.getObject(),e.enableOnSelect,d===null||d===void 0?void 0:d.targetEntityType);return $`<Button xmlns="sap.m"
					id="${m([n.id,t])}"
					text="${t.Label}"
					ariaHasPopup="${v(u({},{context:i}))}"
					press="${f}"
					type="${p.Transparent}"
					enabled="${A}"
					visible="${e.visible}"
				/>`}function h(t,e,n){const a=e.annotationPath?n.metaPath.getModel().createBindingContext(e.annotationPath):null;return $`<Button xmlns="sap.m"
					id="${m([n.id,t])}"
					text="${t.Label}"
					press="${e.command?"cmd:"+e.command:c.getPressHandlerForDataFieldForIBN(a===null||a===void 0?void 0:a.getObject(),"${internal>selectedContexts}",!n.tableDefinition.enableAnalytics)}"
					type="${p.Transparent}"
					enabled="${e.enabled!==undefined?e.enabled:s.isDataFieldForIBNEnabled({collection:n.collection,tableDefinition:n.tableDefinition},t,t.RequiresContext,t.NavigationAvailable)}"
					visible="${e.visible}"
					macrodata:IBNData="${!t.RequiresContext?"{semanticObject: '"+t.SemanticObject+"' , action : '"+t.Action+"'}":undefined}"
				/>`}function M(t,e){const n=t.annotationPath?e.convertedMetaData.resolvePath(t.annotationPath).target:undefined;let a="";if(!n){return a}switch(t.type){case"ForAction":if(A(n)){var o,i,l,c,r;const s=(o=n.ActionTarget)===null||o===void 0?void 0:o.isBound;const d=((i=n.ActionTarget)===null||i===void 0?void 0:(l=i.annotations)===null||l===void 0?void 0:(c=l.Core)===null||c===void 0?void 0:(r=c.OperationAvailable)===null||r===void 0?void 0:r.valueOf())!==false;if(s!==true||d){a+=T(n,t,e)}}break;case"ForNavigation":if(f(n)){a+=h(n,t,e)}break;default:}return a!==""?`<mdcat:ActionToolbarAction\n\t\t\txmlns="sap.m"\n\t\t\txmlns:mdcat="sap.ui.mdc.actiontoolbar"\n\t\t\txmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">\n\t\t\t${a}\n\t\t\t</mdcat:ActionToolbarAction>`:""}function P(t,e){var n;let a=`<mdcat:ActionToolbarAction\n\t\t\t\t\t\txmlns="sap.m"\n\t\t\t\t\t\txmlns:mdcat="sap.ui.mdc.actiontoolbar">`;const o=t.defaultAction;const i=o!==null&&o!==void 0&&o.annotationPath?e.convertedMetaData.resolvePath(o.annotationPath).target:null;const l=o!==null&&o!==void 0&&o.annotationPath?c.getActionContext(e.metaPath.getModel().createBindingContext(o.annotationPath+"/Action")):null;a+=$`<MenuButton
						text="${t.text}"
						type="${p.Transparent}"
						menuPosition="BeginBottom"
						id="${m([e.id,t.id])}"
						visible="${t.visible}"
						enabled="${t.enabled}"
						useDefaultActionOnly="${r.getUseDefaultActionOnly(t)}"
						buttonMode="${r.getButtonMode(t)}"
						defaultAction="${r.getDefaultActionHandler(e,t,i,l)}"
						>
					<menu>
						<Menu>`;(n=t.menu)===null||n===void 0?void 0:n.forEach(n=>{if(typeof n!=="string"){a+=D(t,n,e)}});a+=`</Menu>\n\t\t\t\t</menu>\n\t\t\t</MenuButton>\n\t\t</mdcat:ActionToolbarAction>`;return a}function B(t,e){const n=t.noWrap?t.press:c.buildActionWrapper(t,{id:e.id});return $`<mdcat:ActionToolbarAction
		xmlns="sap.m"
		xmlns:mdcat="sap.ui.mdc.actiontoolbar">
		<Button
			core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
			id="${m([e.id,t.id])}"
			text="${t.text}"
			press="${t.command?"cmd:"+t.command:n}"
			type="${p.Transparent}"
			visible="${t.visible}"
			enabled="${t.enabled}"
		/>
	</mdcat:ActionToolbarAction>`}function F(t){return t.tableDefinition.actions.map(e=>{switch(e.type){case"Default":if("noWrap"in e){return B(e,t)}break;case"Menu":return P(e,t);default:}return M(e,t)}).join("")}function O(t,e){if(e.tableDefinition.annotation.standardActions.isInsertUpdateTemplated&&t.create.isTemplated!=="false"){return $`<mdcat:ActionToolbarAction
					xmlns="sap.m"
					xmlns:mdcat="sap.ui.mdc.actiontoolbar"
					xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">
						<Button
							id="${m([e.id,"StandardAction","Create"])}"
							text="{sap.fe.i18n>M_COMMON_TABLE_CREATE}"
							press="cmd:Create"
							type="${p.Transparent}"
							visible="${t.create.visible}"
							enabled="${t.create.enabled}"
							macrodata:IBNData="${s.getIBNData(e.createOutboundDetail)}"
						/>
					</mdcat:ActionToolbarAction>`}return""}function C(t,e){if(t.delete.isTemplated!=="false"){return $`<mdcat:ActionToolbarAction
					xmlns="sap.m"
					xmlns:mdcat="sap.ui.mdc.actiontoolbar">
					<Button
						id="${m([e.id,"StandardAction","Delete"])}"
						text="{sap.fe.i18n>M_COMMON_TABLE_DELETE}"
						press="cmd:DeleteEntry"
						type="${p.Transparent}"
						visible="${t.delete.visible}"
						enabled="${t.delete.enabled}"
					/>
				</mdcat:ActionToolbarAction>`}return""}function E(t){let e=``;const n=t.tableDefinition.annotation.standardActions.actions;e+=O(n,t);t.tableDefinition.actions.filter(t=>t.type===b.Copy).forEach(n=>{const a=n.annotationPath?t.convertedMetaData.resolvePath(n.annotationPath).target:undefined;e+=`<mdcat:ActionToolbarAction\n\t\t\t\t\txmlns="sap.m"\n\t\t\t\t\txmlns:mdcat="sap.ui.mdc.actiontoolbar">`;e+=$`<Button
							id="${m([t.id,a])}"
							text="${n.text}"
							press="${a?s.pressEventDataFieldForActionButton({contextObjectPath:t.contextObjectPath,id:t.id},a,t.collectionEntity.name,t.tableDefinition.operationAvailableMap,"${internal>selectedContexts}",n.isNavigable,n.enableAutoScroll,n.defaultValuesExtensionFunction):undefined}"
							type="${p.Transparent}"
							enabled="${n.enabled}"
							visible="${n.visible}"
						/>`;e+=`</mdcat:ActionToolbarAction>`});e+=C(n,t);if(t.tableDefinition.annotation.standardActions.isInsertUpdateTemplated&&n.massEdit.isTemplated!=="false"){e+=$`<mdcat:ActionToolbarAction xmlns="sap.m" xmlns:mdcat="sap.ui.mdc.actiontoolbar">
			<Button
				id="${m([t.id,"StandardAction","MassEdit"])}"
				text="{sap.fe.i18n>M_COMMON_TABLE_MASSEDIT}"
				press="API.onMassEditButtonPressed($event, $controller)"
				visible="${n.massEdit.visible}"
				enabled="${n.massEdit.enabled}"
			/>
		</mdcat:ActionToolbarAction>`}if(n.insights.isTemplated!=="false"){e+=$`<mdcat:ActionToolbarAction xmlns="sap.m" xmlns:mdcat="sap.ui.mdc.actiontoolbar">
			<Button
				id="${m([t.id,"StandardAction","Insights"])}"
				text="{sap.fe.i18n>M_COMMON_INSIGHTS_CARD}"
				press="API.onAddCardToInsightsPressed($event, $controller)"
				visible="${n.insights.visible}"
				enabled="${n.insights.enabled}"
			>
				<layoutData>
					<OverflowToolbarLayoutData priority="AlwaysOverflow" />
				</layoutData>
			</Button>
		</mdcat:ActionToolbarAction>`}return e}function y(t){if(t.useBasicSearch){return $`<mdcat:ActionToolbarAction xmlns:mdcat="sap.ui.mdc.actiontoolbar" xmlns:macroTable="sap.fe.macros.table">
						<macroTable:BasicSearch id="${t.filterBarId}" useDraftEditState="${t._collectionIsDraftEnabled}"/>
					</mdcat:ActionToolbarAction>`}return""}function I(t){if(t.enableFullScreen){return $`<mdcat:ActionToolbarAction xmlns:mdcat="sap.ui.mdc.actiontoolbar" xmlns:macroTable="sap.fe.macros.table">
						<macroTable:TableFullScreenDialog id="${m([t.id,"StandardAction","FullScreen"])}" />
					</mdcat:ActionToolbarAction>`}return""}function S(t){return y(t)+F(t)+E(t)+I(t)}d.getTableActionTemplate=S;return d},false);
//# sourceMappingURL=ActionsTemplating.js.map