/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/base/util/uid","sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/converters/annotations/DataField","sap/fe/core/converters/controls/Common/DataVisualization","sap/fe/core/converters/helpers/Aggregation","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/ModelHelper","sap/fe/core/helpers/StableIdHelper","sap/fe/core/templating/DataModelPathHelper","sap/fe/macros/CommonHelper","sap/ui/core/library","sap/ui/model/json/JSONModel","../internal/helpers/ActionHelper","../internal/helpers/DefaultActionHandler","./ChartHelper"],function(e,t,n,a,i,r,o,s,l,c,u,d,g,p,h,m,b,f,v){"use strict";var P,A,y,C,x,M,$,D,I,T,O,B,_,S,z,w,V,E,j,F,k,N,H,L,U,R,W,q,G,X,J,K,Y,Q,Z,ee,te,ne,ae,ie,re,oe,se,le,ce,ue,de,ge,pe,he,me,be,fe,ve,Pe,Ae,ye,Ce,xe,Me,$e,De;var Ie={};var Te=h.TitleLevel;var Oe=g.getContextRelativeTargetObjectPath;var Be=d.generate;var _e=c.resolveBindingString;var Se=l.getInvolvedDataModelObjects;var ze=s.AggregationHelper;var we=o.getVisualizationsFromPresentationVariant;var Ve=o.getDataVisualizationConfiguration;var Ee=r.isDataModelObjectPathForActionWithDialog;var je=i.xml;var Fe=i.escapeXMLAttributeValue;var ke=a.defineBuildingBlock;var Ne=a.blockEvent;var He=a.blockAttribute;var Le=a.blockAggregation;function Ue(e,t,n,a){if(!n)return;Object.defineProperty(e,t,{enumerable:n.enumerable,configurable:n.configurable,writable:n.writable,value:n.initializer?n.initializer.call(a):void 0})}function Re(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function We(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;qe(e,t)}function qe(e,t){qe=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,n){t.__proto__=n;return t};return qe(e,t)}function Ge(e,t,n,a,i){var r={};Object.keys(a).forEach(function(e){r[e]=a[e]});r.enumerable=!!r.enumerable;r.configurable=!!r.configurable;if("value"in r||r.initializer){r.writable=true}r=n.slice().reverse().reduce(function(n,a){return a(e,t,n)||n},r);if(i&&r.initializer!==void 0){r.value=r.initializer?r.initializer.call(i):void 0;r.initializer=undefined}if(r.initializer===void 0){Object.defineProperty(e,t,r);r=null}return r}function Xe(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}const Je={"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1":"axis1","com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2":"axis2","com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3":"axis3","com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis4":"axis4"};var Ke;(function(e){e["Sort"]="Sort";e["Type"]="Type";e["Item"]="Item";e["Filter"]="Filter"})(Ke||(Ke={}));const Ye=function(e){var t;let n=null;const a=e;let i=[];const r=(t=a.getAttribute("key"))===null||t===void 0?void 0:t.replace("InlineXML_","");if(a.children.length&&a.localName==="ActionGroup"&&a.namespaceURI&&["sap.fe.macros","sap.fe.macros.chart"].indexOf(a.namespaceURI)>-1){const e=Array.prototype.slice.apply(a.children);let t=0;n=e.reduce((e,n)=>{var a;const i=((a=n.getAttribute("key"))===null||a===void 0?void 0:a.replace("InlineXML_",""))||r+"_Menu_"+t;const o={key:i,text:n.getAttribute("text"),__noWrap:true,press:n.getAttribute("press"),requiresSelection:n.getAttribute("requiresSelection")==="true",enabled:n.getAttribute("enabled")===null?true:n.getAttribute("enabled")};e[o.key]=o;t++;return e},{});i=Object.values(n).slice(-a.children.length).map(function(e){return e.key})}return{key:r,text:a.getAttribute("text"),position:{placement:a.getAttribute("placement"),anchor:a.getAttribute("anchor")},__noWrap:true,press:a.getAttribute("press"),requiresSelection:a.getAttribute("requiresSelection")==="true",enabled:a.getAttribute("enabled")===null?true:a.getAttribute("enabled"),menu:i.length?i:null,menuContentActions:n}};let Qe=(P=ke({name:"Chart",namespace:"sap.fe.macros.internal",publicNamespace:"sap.fe.macros",returnTypes:["sap.fe.macros.chart.ChartAPI"]}),A=He({type:"string",isPublic:true}),y=He({type:"object"}),C=He({type:"sap.ui.model.Context",isPublic:true}),x=He({type:"sap.ui.model.Context",isPublic:true}),M=He({type:"string"}),$=He({type:"string"}),D=He({type:"string",isPublic:true}),I=He({type:"boolean",isPublic:true}),T=He({type:"sap.ui.core.TitleLevel",isPublic:true}),O=He({type:"string",isPublic:true}),B=He({type:"string|boolean",isPublic:true}),_=He({type:"string",isPublic:true}),S=He({type:"string"}),z=He({type:"string"}),w=He({type:"string"}),V=He({type:"sap.ui.model.Context"}),E=He({type:"boolean"}),j=He({type:"boolean"}),F=He({type:"string"}),k=He({type:"string"}),N=He({type:"string"}),H=He({type:"string"}),L=He({type:"boolean"}),U=He({type:"string",isPublic:true}),R=Ne(),W=Ne(),q=Le({type:"sap.fe.macros.internal.chart.Action | sap.fe.macros.internal.chart.ActionGroup",isPublic:true,processAggregations:Ye}),G=Ne(),X=Ne(),P(J=(K=(De=function(n){We(a,n);function a(i,r,o){var s;s=n.call(this,i,r,o)||this;Ue(s,"id",Y,Re(s));Ue(s,"chartDefinition",Q,Re(s));Ue(s,"metaPath",Z,Re(s));Ue(s,"contextPath",ee,Re(s));Ue(s,"height",te,Re(s));Ue(s,"width",ne,Re(s));Ue(s,"header",ae,Re(s));Ue(s,"headerVisible",ie,Re(s));Ue(s,"headerLevel",re,Re(s));Ue(s,"selectionMode",oe,Re(s));Ue(s,"personalization",se,Re(s));Ue(s,"filterBar",le,Re(s));Ue(s,"noDataText",ce,Re(s));Ue(s,"chartDelegate",ue,Re(s));Ue(s,"vizProperties",de,Re(s));Ue(s,"chartActions",ge,Re(s));Ue(s,"draftSupported",pe,Re(s));Ue(s,"autoBindOnInit",he,Re(s));Ue(s,"visible",me,Re(s));Ue(s,"navigationPath",be,Re(s));Ue(s,"filter",fe,Re(s));Ue(s,"measures",ve,Re(s));Ue(s,"_applyIdToContent",Pe,Re(s));Ue(s,"variantManagement",Ae,Re(s));Ue(s,"variantSelected",ye,Re(s));Ue(s,"variantSaved",Ce,Re(s));Ue(s,"actions",xe,Re(s));Ue(s,"selectionChange",Me,Re(s));Ue(s,"stateChange",$e,Re(s));s._commandActions=[];s.createChartDefinition=(e,t,n)=>{var i,r;let o=Oe(t);if(((i=s.metaPath)===null||i===void 0?void 0:(r=i.getObject())===null||r===void 0?void 0:r.$Type)==="com.sap.vocabularies.UI.v1.PresentationVariantType"){const e=s.metaPath.getObject().Visualizations;o=a.checkChartVisualizationPath(e,o)}if(!o||n.indexOf(o)===-1){o=`@${"com.sap.vocabularies.UI.v1.Chart"}`}const l=Ve(o,s.useCondensedLayout,e,undefined,undefined,undefined,true);return l.visualizations[0]};s.createBindingContext=function(e,n){const a=`/${t()}`;n.models.converterContext.setProperty(a,e);return n.models.converterContext.createBindingContext(a)};s.getChartMeasures=(t,n)=>{const a=t.chartDefinition.annotationPath.split("/");const i=a.filter(function(e,t){return a.indexOf(e)==t}).toString().replaceAll(",","/");const r=Se(s.metaPath.getModel().createBindingContext(i),s.contextPath).targetObject;const o=n.getAggregatedProperties("AggregatedProperty");let l=[];const c=t.metaPath.getPath();const u=n.getAggregatedProperties("AggregatedProperties");const d=r.Measures?r.Measures:[];const g=r.DynamicMeasures?r.DynamicMeasures:[];const p=u[0]?u[0].filter(function(e){return d.some(function(t){return e.Name===t.value})}):undefined;const h=c.replace(/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant|SelectionPresentationVariant).*/,"");const b=t.chartDefinition.transAgg;const f=t.chartDefinition.customAgg;if(o.length>0&&!g&&p.length>0){e.warning("The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly.")}const v=d.some(e=>{const t=s.getCustomAggMeasure(f,e);return!!t});if(o.length>0&&!(g!==null&&g!==void 0&&g.length)&&!v){throw new Error("Please configure DynamicMeasures for the chart")}if(o.length>0){for(const e of g){l=s.getDynamicMeasures(l,e,h,r)}}for(const e of d){const t=e.value;const n=s.getCustomAggMeasure(f,e);const a={};if(n){l=s.setCustomAggMeasure(l,a,n,t)}else if(o.length===0&&b[t]){l=s.setTransAggMeasure(l,a,b,t)}s.setChartMeasureAttributes(s._chart.MeasureAttributes,h,a)}const P=new m(l);P.$$valueAsPromise=true;return P.createBindingContext("/")};s.setCustomAggMeasure=(t,n,a,i)=>{if(i.indexOf("/")>-1){e.error(`$expand is not yet supported. Measure: ${i} from an association cannot be used`)}n.key=a.value;n.role="axis1";n.label=a.label;n.propertyPath=a.value;t.push(n);return t};s.setTransAggMeasure=(e,t,n,a)=>{const i=n[a];t.key=i.name;t.role="axis1";t.propertyPath=a;t.aggregationMethod=i.aggregationMethod;t.label=i.label||t.label;e.push(t);return e};s.getDynamicMeasures=(t,n,a,i)=>{var r;const o=n.value||"";const l=Se(s.metaPath.getModel().createBindingContext(a+o),s.contextPath).targetObject;if(o.indexOf("/")>-1){e.error(`$expand is not yet supported. Measure: ${o} from an association cannot be used`)}else if(!l){throw new Error(`Please provide the right AnnotationPath to the Dynamic Measure ${n.value}`)}else if(((r=n.value)===null||r===void 0?void 0:r.startsWith(`@${"com.sap.vocabularies.Analytics.v1.AggregatedProperty"}`))===null){throw new Error(`Please provide the right AnnotationPath to the Dynamic Measure ${n.value}`)}else{var c;const e={key:l.Name,role:"axis1"};e.propertyPath=l.AggregatableProperty.value;e.aggregationMethod=l.AggregationMethod;e.label=_e(((c=l.annotations.Common)===null||c===void 0?void 0:c.Label)||Se(s.metaPath.getModel().createBindingContext(a+e.propertyPath+`@${"com.sap.vocabularies.Common.v1.Label"}`),s.contextPath).targetObject);s.setChartMeasureAttributes(i.MeasureAttributes,a,e);t.push(e)}return t};s.getCustomAggMeasure=(e,t)=>{if(t.value&&e[t.value]){var n;t.label=(n=e[t.value])===null||n===void 0?void 0:n.label;return t}return null};s.setChartMeasureAttributes=(e,t,n)=>{if(e!==null&&e!==void 0&&e.length){for(const a of e){s._setChartMeasureAttribute(a,t,n)}}};s._setChartMeasureAttribute=(e,t,n)=>{var a,i,r;const o=e.DynamicMeasure?e===null||e===void 0?void 0:(a=e.DynamicMeasure)===null||a===void 0?void 0:a.value:e===null||e===void 0?void 0:(i=e.Measure)===null||i===void 0?void 0:i.value;const l=e.DataPoint?e===null||e===void 0?void 0:(r=e.DataPoint)===null||r===void 0?void 0:r.value:null;const c=e.Role;const u=l&&Se(s.metaPath.getModel().createBindingContext(t+l),s.contextPath).targetObject;if(n.key===o){s.setMeasureRole(n,c);s.setMeasureDataPoint(n,u)}};s.setMeasureDataPoint=(e,t)=>{if(t&&t.Value.$Path==e.key){e.dataPoint=v.formatJSONToString(s.createDataPointProperty(t))||""}};s.setMeasureRole=(e,t)=>{if(t){const n=t.$EnumMember;e.role=Je[n]}};s.getDependents=e=>{if(s._commandActions.length>0){return s._commandActions.map(t=>s.getActionCommand(t,e))}return""};s.checkPersonalizationInChartProperties=e=>{if(e.personalization){if(e.personalization==="false"){s.personalization=undefined}else if(e.personalization==="true"){s.personalization=Object.values(Ke).join(",")}else if(s.verifyValidPersonlization(e.personalization)===true){s.personalization=e.personalization}else{s.personalization=undefined}}};s.verifyValidPersonlization=e=>{let t=true;const n=e.split(",");const a=Object.values(Ke);n.forEach(e=>{if(!a.includes(e)){t=false}});return t};s.getVariantManagement=(e,t)=>{let n=e.variantManagement?e.variantManagement:t.variantManagement;n=s.personalization===undefined?"None":n;return n};s.createVariantManagement=()=>{const t=s.personalization;if(t){const e=s.variantManagement;if(e==="Control"){return je`
					<mdc:variant>
					<variant:VariantManagement
						id="${Be([s.id,"VM"])}"
						for="${s.id}"
						showSetAsDefault="${true}"
						select="${s.variantSelected}"
						headerLevel="${s.headerLevel}"
						save="${s.variantSaved}"
					/>
					</mdc:variant>
			`}else if(e==="None"||e==="Page"){return""}}else if(!t){e.warning("Variant Management cannot be enabled when personalization is disabled")}return""};s.getPersistenceProvider=()=>{if(s.variantManagement==="None"){return je`<p13n:PersistenceProvider id="${Be([s.id,"PersistenceProvider"])}" for="${s.id}"/>`}return""};s.pushActionCommand=(e,t,n,a)=>{if(t){const i={actionContext:e,onExecuteAction:v.getPressEventForDataFieldForActionButton(s.id,t,n||""),onExecuteIBN:p.getPressHandlerForDataFieldForIBN(t,`\${internal>selectedContexts}`,false),onExecuteManifest:p.buildActionWrapper(a,Re(s))};s._commandActions.push(i)}};s.getActionCommand=(e,t)=>{const n=e.actionContext.getObject();const a=n.annotationPath&&s.contextPath.getModel().createBindingContext(n.annotationPath);const i=a&&a.getObject();const r=s.contextPath.getModel().createBindingContext(n.annotationPath+"/Action");const o=p.getActionContext(r);const l=p.getPathToBoundActionOverload(r);const c=s.contextPath.getModel().createBindingContext(l).getObject();const u=Fe(v.getOperationAvailableMap(t.getObject(),{context:t}));const d=n.enabled?n.enabled:v.isDataFieldForActionButtonEnabled(c&&c.$IsBound,i.Action,s.contextPath,u||"",n.enableOnSelect||"");let g;if(n.enabled){g=n.enabled}else if(i.RequiresContext){g="{= %{internal>numberOfSelectedContexts} >= 1}"}const h=je`<internalMacro:ActionCommand
		action="${n}"
		onExecuteAction="${e.onExecuteAction}"
		onExecuteIBN="${e.onExecuteIBN}"
		onExecuteManifest="${e.onExecuteManifest}"
		isIBNEnabled="${g}"
		isActionEnabled="${d}"
		visible="${s.getVisible(a)}"
	/>`;if(n.type=="ForAction"&&(!c||c.IsBound!==true||o[`@${"Org.OData.Core.V1.OperationAvailable"}`]!==false)){return h}else if(n.type=="ForAction"){return""}else{return h}};s.getItems=e=>{if(s._chart){const t=[];const n=[];if(s._chart.Dimensions){v.formatDimensions(e).getObject().forEach(e=>{e.id=Be([s.id,"dimension",e.key]);t.push(s.getItem({id:e.id,key:e.key,label:e.label,role:e.role},"_fe_groupable_","groupable"))})}if(s.measures){v.formatMeasures(s.measures).forEach(e=>{e.id=Be([s.id,"measure",e.key]);n.push(s.getItem({id:e.id,key:e.key,label:e.label,role:e.role},"_fe_aggregatable_","aggregatable"))})}if(t.length&&n.length){return t.concat(n)}}return""};s.getItem=(e,t,n)=>je`<chart:Item
			id="${e.id}"
			name="${t+e.key}"
			type="${n}"
			label="${_e(e.label,"string")}"
			role="${e.role}"
		/>`;s.getToolbarActions=(e,t)=>{var n;const a=s.getActions(e);if((n=s.chartDefinition)!==null&&n!==void 0&&n.onSegmentedButtonPressed){a.push(s.getSegmentedButton())}if(t){a.push(s.getStandardActions(t))}if(a.length>0){return je`<mdc:actions>${a}</mdc:actions>`}return""};s.getStandardActions=e=>{if(e){return je`<mdcat:ActionToolbarAction visible="${e}">
				<Button
					text="{sap.fe.i18n>M_COMMON_INSIGHTS_CARD}"
					core:require="{API: 'sap/fe/macros/chart/ChartAPI'}"
					press="API.onAddCardToInsightsPressed($event)"
					visible="${e}"
					enabled="${e}"
				>
					<layoutData>
						<OverflowToolbarLayoutData priority="AlwaysOverflow" />
					</layoutData>
				</Button>
			</mdcat:ActionToolbarAction>`}};s.getActions=e=>{var t;let n=(t=s.chartActions)===null||t===void 0?void 0:t.getObject();n=s.removeMenuItems(n);return n.map(t=>{if(t.annotationPath){return s.getAction(t,e,false)}else if(t.hasOwnProperty("noWrap")){return s.getCustomActions(t,e)}})};s.removeMenuItems=e=>{for(const t of e){if(t.menu){t.menu.forEach(t=>{if(e.indexOf(t)!==-1){e.splice(e.indexOf(t),1)}})}}return e};s.getCustomActions=(e,t)=>{let n=e.enabled;if((e.requiresSelection??false)&&e.enabled==="true"){n="{= %{internal>numberOfSelectedContexts} >= 1}"}if(e.type==="Default"){return s.getActionToolbarAction(e,{id:Be([s.id,e.id]),unittestid:"DataFieldForActionButtonAction",label:e.text?e.text:"",ariaHasPopup:undefined,press:e.press?e.press:"",enabled:n,visible:e.visible?e.visible:false},false)}else if(e.type==="Menu"){return s.getActionToolbarMenuAction({id:Be([s.id,e.id]),text:e.text,visible:e.visible,enabled:n,useDefaultActionOnly:f.getUseDefaultActionOnly(e),buttonMode:f.getButtonMode(e),defaultAction:undefined,actions:e},t)}};s.getMenuItemFromMenu=(e,t)=>{let n;if(e.annotationPath){return s.getAction(e,t,true)}if(e.command){n="cmd:"+e.command}else if(e.noWrap??false){n=e.press}else{n=p.buildActionWrapper(e,Re(s))}return je`<MenuItem
		core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
		text="${e.text}"
		press="${n}"
		visible="${e.visible}"
		enabled="${e.enabled}"
	/>`};s.getActionToolbarMenuAction=(e,t)=>{var n,a;const i=(n=e.actions)===null||n===void 0?void 0:(a=n.menu)===null||a===void 0?void 0:a.map(e=>s.getMenuItemFromMenu(e,t));return je`<mdcat:ActionToolbarAction>
			<MenuButton
			text="${e.text}"
			type="Transparent"
			menuPosition="BeginBottom"
			id="${e.id}"
			visible="${e.visible}"
			enabled="${e.enabled}"
			useDefaultActionOnly="${e.useDefaultActionOnly}"
			buttonMode="${e.buttonMode}"
			defaultAction="${e.defaultAction}"
			>
				<menu>
					<Menu>
						${i}
					</Menu>
				</menu>
			</MenuButton>
		</mdcat:ActionToolbarAction>`};s.getAction=(e,t,n)=>{const a=s.contextPath.getModel().createBindingContext(e.annotationPath||"");if(e.type==="ForNavigation"){return s.getNavigationActions(e,a,n)}else if(e.type==="ForAction"){return s.getAnnotationActions(t,e,a,n)}return""};s.getNavigationActions=(e,t,n)=>{let a="true";const i=t.getObject();if(e.enabled!==undefined){a=e.enabled}else if(i.RequiresContext){a="{= %{internal>numberOfSelectedContexts} >= 1}"}return s.getActionToolbarAction(e,{id:undefined,unittestid:"DataFieldForIntentBasedNavigationButtonAction",label:i.Label,ariaHasPopup:undefined,press:p.getPressHandlerForDataFieldForIBN(i,`\${internal>selectedContexts}`,false),enabled:a,visible:s.getVisible(t)},n)};s.getAnnotationActions=(e,t,n,a)=>{const i=s.contextPath.getModel().createBindingContext(t.annotationPath+"/Action");const r=s.contextPath.getModel().createBindingContext(p.getActionContext(i));const o=r.getObject();const l=p.getPathToBoundActionOverload(i);const c=s.contextPath.getModel().createBindingContext(l).getObject();const u=n.getObject();if(!c||c.$IsBound!==true||o[`@${"Org.OData.Core.V1.OperationAvailable"}`]!==false){const i=s.getAnnotationActionsEnabled(t,c,u,e);const r=Se(s.contextPath.getModel().createBindingContext(t.annotationPath));const o=Ee(r);const l=Fe(v.getOperationAvailableMap(e.getObject(),{context:e}))||"";return s.getActionToolbarAction(t,{id:Be([s.id,Se(n)]),unittestid:"DataFieldForActionButtonAction",label:u.Label,ariaHasPopup:o,press:v.getPressEventForDataFieldForActionButton(s.id,u,l),enabled:i,visible:s.getVisible(n)},a)}return""};s.getActionToolbarAction=(e,t,n)=>{if(n){return je`
			<MenuItem
				text="${t.label}"
				press="${e.command?"cmd:"+e.command:t.press}"
				enabled="${t.enabled}"
				visible="${t.visible}"
			/>`}else{return s.buildAction(e,t)}};s.buildAction=(e,t)=>{let n="";if(e.hasOwnProperty("noWrap")){if(e.command){n="cmd:"+e.command}else if(e.noWrap===true){n=t.press}else if(!e.annotationPath){n=p.buildActionWrapper(e,Re(s))}return je`<mdcat:ActionToolbarAction>
			<Button
				core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
				unittest:id="${t.unittestid}"
				id="${t.id}"
				text="${t.label}"
				ariaHasPopup="${t.ariaHasPopup}"
				press="${n}"
				enabled="${t.enabled}"
				visible="${t.visible}"
			/>
		   </mdcat:ActionToolbarAction>`}else{return je`<mdcat:ActionToolbarAction>
			<Button
				unittest:id="${t.unittestid}"
				id="${t.id}"
				text="${t.label}"
				ariaHasPopup="${t.ariaHasPopup}"
				press="${e.command?"cmd:"+e.command:t.press}"
				enabled="${t.enabled}"
				visible="${t.visible}"
			/>
		</mdcat:ActionToolbarAction>`}};s.getAnnotationActionsEnabled=(e,t,n,a)=>e.enabled!==undefined?e.enabled:v.isDataFieldForActionButtonEnabled(t&&t.$IsBound,n.Action,s.contextPath,v.getOperationAvailableMap(a.getObject(),{context:a}),e.enableOnSelect||"");s.getSegmentedButton=()=>je`<mdcat:ActionToolbarAction layoutInformation="{
			aggregationName: 'end',
			alignment: 'End'
		}">
			<SegmentedButton
				id="${Be([s.id,"SegmentedButton","TemplateContentView"])}"
				select="${s.chartDefinition.onSegmentedButtonPressed}"
				visible="{= \${pageInternal>alpContentView} !== 'Table' }"
				selectedKey="{pageInternal>alpContentView}"
			>
				<items>
					${s.getSegmentedButtonItems()}
				</items>
			</SegmentedButton>
		</mdcat:ActionToolbarAction>`;s.getSegmentedButtonItems=()=>{const e=[];if(p.isDesktop()){e.push(s.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_HYBRID_SEGMENTED_BUTTON_ITEM_TOOLTIP}","Hybrid","sap-icon://chart-table-view"))}e.push(s.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_CHART_SEGMENTED_BUTTON_ITEM_TOOLTIP}","Chart","sap-icon://bar-chart"));e.push(s.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_TABLE_SEGMENTED_BUTTON_ITEM_TOOLTIP}","Table","sap-icon://table-view"));return e};s.getSegmentedButtonItem=(e,t,n)=>je`<SegmentedButtonItem
			tooltip="${e}"
			key="${t}"
			icon="${n}"
		/>`;s.getVisible=e=>{const t=e.getObject();if(t[`@${"com.sap.vocabularies.UI.v1.Hidden"}`]&&t[`@${"com.sap.vocabularies.UI.v1.Hidden"}`].$Path){const n=s.contextPath.getModel().createBindingContext(e.getPath()+`/@${"com.sap.vocabularies.UI.v1.Hidden"}/$Path`,t[`@${"com.sap.vocabularies.UI.v1.Hidden"}`].$Path);return v.getHiddenPathExpressionForTableActionsAndIBN(t[`@${"com.sap.vocabularies.UI.v1.Hidden"}`].$Path,{context:n})}else if(t[`@${"com.sap.vocabularies.UI.v1.Hidden"}`]){return!t[`@${"com.sap.vocabularies.UI.v1.Hidden"}`]}else{return true}};s.getContextPath=()=>s.contextPath.getPath().lastIndexOf("/")===s.contextPath.getPath().length-1?s.contextPath.getPath().replaceAll("/",""):s.contextPath.getPath().split("/")[s.contextPath.getPath().split("/").length-1];const l=Se(s.metaPath,s.contextPath);const c=s.getConverterContext(l,undefined,o);const d=a.getVisualizationPath(Re(s),l,c);const g=a.getExtraParams(Re(s),d);const h=s.getConverterContext(l,undefined,o,g);const P=new ze(h.getEntityType(),h,true);s._chartContext=v.getUiChart(s.metaPath);s._chart=s._chartContext.getObject();if(s._applyIdToContent??false){s._apiId=s.id+"::Chart";s._contentId=s.id}else{s._apiId=s.id;s._contentId=s.getContentId(s.id)}if(s._chart){var A,y,C,x,M,$,D;s.chartDefinition=s.chartDefinition===undefined||s.chartDefinition===null?s.createChartDefinition(h,l,s._chartContext.getPath()):s.chartDefinition;s.navigationPath=s.chartDefinition.navigationPath;s.autoBindOnInit=s.chartDefinition.autoBindOnInit;s.vizProperties=s.chartDefinition.vizProperties;s.chartActions=s.createBindingContext(s.chartDefinition.actions,o);s.selectionMode=s.selectionMode.toUpperCase();if(s.filterBar){s.filter=s.getContentId(s.filterBar)}else if(!s.filter){s.filter=s.chartDefinition.filterId}s.checkPersonalizationInChartProperties(Re(s));s.variantManagement=s.getVariantManagement(Re(s),s.chartDefinition);s.visible=s.chartDefinition.visible;let e=s.contextPath.getPath();e=e[e.length-1]==="/"?e.slice(0,-1):e;s.draftSupported=u.isDraftSupported(o.models.metaModel,e);s._chartType=v.formatChartType(s._chart.ChartType);const t=v.getOperationAvailableMap(s._chart,{context:s._chartContext});if(Object.keys((A=s.chartDefinition)===null||A===void 0?void 0:A.commandActions).length>0){var I;Object.keys((I=s.chartDefinition)===null||I===void 0?void 0:I.commandActions).forEach(e=>{var n;const a=(n=s.chartDefinition)===null||n===void 0?void 0:n.commandActions[e];const i=s.createBindingContext(a,o);const r=a.annotationPath&&s.contextPath.getModel().createBindingContext(a.annotationPath);const l=r&&r.getObject();const c=Fe(t);s.pushActionCommand(i,l,c,a)})}s.measures=s.getChartMeasures(Re(s),P);const n=p.createPresentationPathContext(s.metaPath);s._sortCondtions=v.getSortConditions(s.metaPath,s.metaPath.getObject(),n.getPath(),s.chartDefinition.applySupported);const a=s.contextPath.getModel().createBindingContext(s._chartContext.getPath()+"/Actions",s._chart.Actions);const i=s.contextPath.getModel().createBindingContext(s.contextPath.getPath(),s.contextPath);const r=p.getContextPath(s.contextPath,{context:i});const c=p.getTargetCollectionPath(s.contextPath);const d=s.contextPath.getModel().createBindingContext(c,s.contextPath);const g=(y=l.convertedTypes.resolvePath(a.getPath()))===null||y===void 0?void 0:y.target;s._customData={targetCollectionPath:r,entitySet:typeof d.getObject()==="string"?d.getObject():d.getObject("@sapui.name"),entityType:r+"/",operationAvailableMap:p.stringifyCustomData(JSON.parse(t)),multiSelectDisabledActions:b.getMultiSelectDisabledActions(g)+"",segmentedButtonId:Be([s.id,"SegmentedButton","TemplateContentView"]),customAgg:p.stringifyCustomData((C=s.chartDefinition)===null||C===void 0?void 0:C.customAgg),transAgg:p.stringifyCustomData((x=s.chartDefinition)===null||x===void 0?void 0:x.transAgg),applySupported:p.stringifyCustomData((M=s.chartDefinition)===null||M===void 0?void 0:M.applySupported),vizProperties:s.vizProperties,draftSupported:s.draftSupported,multiViews:($=s.chartDefinition)===null||$===void 0?void 0:$.multiViews,selectionPresentationVariantPath:p.stringifyCustomData({data:(D=s.chartDefinition)===null||D===void 0?void 0:D.selectionPresentationVariantPath})};s._actions=s.chartActions?s.getToolbarActions(s._chartContext,s.chartDefinition.isInsightsEnabled??false):""}else{s.autoBindOnInit=false;s.visible="true";s.navigationPath="";s._actions="";s._customData={targetCollectionPath:"",entitySet:"",entityType:"",operationAvailableMap:"",multiSelectDisabledActions:"",segmentedButtonId:"",customAgg:"",transAgg:"",applySupported:"",vizProperties:""}}return s}Ie=a;var i=a.prototype;i.getContentId=function e(t){return`${t}-content`};a.getExtraParams=function e(t,n){const a={};if(t.actions){var i;(i=Object.values(t.actions))===null||i===void 0?void 0:i.forEach(e=>{t.actions={...t.actions,...e.menuContentActions};delete e.menuContentActions})}if(n){a[n]={actions:t.actions}}return a};i.createDataPointProperty=function e(t){const n={};if(t.TargetValue){n.targetValue=t.TargetValue.$Path}if(t.ForeCastValue){n.foreCastValue=t.ForeCastValue.$Path}let a=null;if(t.Criticality){if(t.Criticality.$Path){a={Calculated:t.Criticality.$Path}}else{a={Static:t.Criticality.$EnumMember.replace("com.sap.vocabularies.UI.v1.CriticalityType/","")}}}else if(t.CriticalityCalculation){const e={};const n=this.buildThresholds(e,t.CriticalityCalculation);if(n){a={ConstantThresholds:e}}else{a={DynamicThresholds:e}}}if(a){n.criticality=a}return n};i.buildThresholds=function e(t,n){const a=["AcceptanceRangeLowValue","AcceptanceRangeHighValue","ToleranceRangeLowValue","ToleranceRangeHighValue","DeviationRangeLowValue","DeviationRangeHighValue"];let i=true,r,o,s;t.ImprovementDirection=n.ImprovementDirection.$EnumMember.replace("com.sap.vocabularies.UI.v1.ImprovementDirectionType/","");const l={oneSupplied:false,usedMeasures:[]};const c={oneSupplied:false};for(o=0;o<a.length;o++){r=a[o];l[r]=n[r]?n[r].$Path:undefined;l.oneSupplied=l.oneSupplied||l[r];if(!l.oneSupplied){c[r]=n[r];c.oneSupplied=c.oneSupplied||c[r]}else if(l[r]){l.usedMeasures.push(l[r])}}if(l.oneSupplied){i=false;for(o=0;o<a.length;o++){if(l[a[o]]){t[a[o]]=l[a[o]]}}t.usedMeasures=l.usedMeasures}else{let e;t.AggregationLevels=[];if(c.oneSupplied){e={VisibleDimensions:null};for(o=0;o<a.length;o++){if(c[a[o]]){e[a[o]]=c[a[o]]}}t.AggregationLevels.push(e)}if(n.ConstantThresholds&&n.ConstantThresholds.length>0){for(o=0;o<n.ConstantThresholds.length;o++){const i=n.ConstantThresholds[o];const r=i.AggregationLevel?[]:null;if(i.AggregationLevel&&i.AggregationLevel.length>0){for(s=0;s<i.AggregationLevel.length;s++){r.push(i.AggregationLevel[s].$PropertyPath)}}e={VisibleDimensions:r};for(s=0;s<a.length;s++){const t=i[a[s]];if(t){e[a[s]]=t}}t.AggregationLevels.push(e)}}}return i};i.getTemplate=function e(){let t="";if(this._customData.targetCollectionPath===""){this.noDataText=this.getTranslatedText("M_CHART_NO_ANNOTATION_SET_TEXT")}if(this.chartDelegate){t=this.chartDelegate}else{const e=this.getContextPath();t="{name:'sap/fe/macros/chart/ChartDelegate', payload: {collectionName: '"+e+"', contextPath: '"+e+"', parameters:{$$groupId:'$auto.Workers'}, selectionMode: '"+this.selectionMode+"'}}"}const n="{internal>controls/"+this.id+"}";if(!this.header){var a,i;this.header=(a=this._chart)===null||a===void 0?void 0:(i=a.Title)===null||i===void 0?void 0:i.toString()}return je`
			<macro:ChartAPI xmlns="sap.m" xmlns:macro="sap.fe.macros.chart" xmlns:variant="sap.ui.fl.variants" xmlns:p13n="sap.ui.mdc.p13n" xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1" xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1" xmlns:internalMacro="sap.fe.macros.internal" xmlns:chart="sap.ui.mdc.chart" xmlns:mdc="sap.ui.mdc" xmlns:mdcat="sap.ui.mdc.actiontoolbar" xmlns:core="sap.ui.core" id="${this._apiId}" selectionChange="${this.selectionChange}" stateChange="${this.stateChange}">
				<macro:layoutData>
					<FlexItemData growFactor="1" shrinkFactor="1" />
				</macro:layoutData>
				<mdc:Chart
					binding="${n}"
					unittest:id="ChartMacroFragment"
					id="${this._contentId}"
					chartType="${this._chartType}"
					sortConditions="${this._sortCondtions}"
					header="${this.header}"
					headerVisible="${this.headerVisible}"
					height="${this.height}"
					width="${this.width}"
					headerLevel="${this.headerLevel}"
					p13nMode="${this.personalization}"
					filter="${this.filter}"
					noDataText="${this.noDataText}"
					autoBindOnInit="${this.autoBindOnInit}"
					delegate="${t}"
					macrodata:targetCollectionPath="${this._customData.targetCollectionPath}"
					macrodata:entitySet="${this._customData.entitySet}"
					macrodata:entityType="${this._customData.entityType}"
					macrodata:operationAvailableMap="${this._customData.operationAvailableMap}"
					macrodata:multiSelectDisabledActions="${this._customData.multiSelectDisabledActions}"
					macrodata:segmentedButtonId="${this._customData.segmentedButtonId}"
					macrodata:customAgg="${this._customData.customAgg}"
					macrodata:transAgg="${this._customData.transAgg}"
					macrodata:applySupported="${this._customData.applySupported}"
					macrodata:vizProperties="${this._customData.vizProperties}"
					macrodata:draftSupported="${this._customData.draftSupported}"
					macrodata:multiViews="${this._customData.multiViews}"
					macrodata:selectionPresentationVariantPath="${this._customData.selectionPresentationVariantPath}"
					visible="${this.visible}"
				>
				<mdc:dependents>
					${this.getDependents(this._chartContext)}
					${this.getPersistenceProvider()}
				</mdc:dependents>
				<mdc:items>
					${this.getItems(this._chartContext)}
				</mdc:items>
				${this._actions}
				${this.createVariantManagement()}
			</mdc:Chart>
		</macro:ChartAPI>`};return a}(n),De.checkChartVisualizationPath=(e,t)=>{e.forEach(function(e){if(e.$AnnotationPath.indexOf(`@${"com.sap.vocabularies.UI.v1.Chart"}`)>-1){t=e.$AnnotationPath}});return t},De.getVisualizationPath=(t,n,a)=>{var i;const r=Oe(n);if(!r){e.error(`Missing metapath parameter for Chart`);return`@${"com.sap.vocabularies.UI.v1.Chart"}`}if(n.targetObject.term==="com.sap.vocabularies.UI.v1.Chart"){return r}const o=a.getEntityTypeAnnotation(r);let s=[];switch((i=n.targetObject)===null||i===void 0?void 0:i.term){case"com.sap.vocabularies.UI.v1.SelectionPresentationVariant":if(n.targetObject.PresentationVariant){s=we(n.targetObject.PresentationVariant,r,o.converterContext,true)}break;case"com.sap.vocabularies.UI.v1.PresentationVariant":s=we(n.targetObject,r,o.converterContext,true);break}const l=s.find(e=>e.visualization.term==="com.sap.vocabularies.UI.v1.Chart");if(l){return l.annotationPath}else{e.error(`Bad metapath parameter for chart: ${n.targetObject.term}`);return`@${"com.sap.vocabularies.UI.v1.Chart"}`}},De),Y=Ge(K.prototype,"id",[A],{configurable:true,enumerable:true,writable:true,initializer:null}),Q=Ge(K.prototype,"chartDefinition",[y],{configurable:true,enumerable:true,writable:true,initializer:null}),Z=Ge(K.prototype,"metaPath",[C],{configurable:true,enumerable:true,writable:true,initializer:null}),ee=Ge(K.prototype,"contextPath",[x],{configurable:true,enumerable:true,writable:true,initializer:null}),te=Ge(K.prototype,"height",[M],{configurable:true,enumerable:true,writable:true,initializer:function(){return"100%"}}),ne=Ge(K.prototype,"width",[$],{configurable:true,enumerable:true,writable:true,initializer:function(){return"100%"}}),ae=Ge(K.prototype,"header",[D],{configurable:true,enumerable:true,writable:true,initializer:null}),ie=Ge(K.prototype,"headerVisible",[I],{configurable:true,enumerable:true,writable:true,initializer:null}),re=Ge(K.prototype,"headerLevel",[T],{configurable:true,enumerable:true,writable:true,initializer:function(){return Te.Auto}}),oe=Ge(K.prototype,"selectionMode",[O],{configurable:true,enumerable:true,writable:true,initializer:function(){return"MULTIPLE"}}),se=Ge(K.prototype,"personalization",[B],{configurable:true,enumerable:true,writable:true,initializer:null}),le=Ge(K.prototype,"filterBar",[_],{configurable:true,enumerable:true,writable:true,initializer:null}),ce=Ge(K.prototype,"noDataText",[S],{configurable:true,enumerable:true,writable:true,initializer:null}),ue=Ge(K.prototype,"chartDelegate",[z],{configurable:true,enumerable:true,writable:true,initializer:null}),de=Ge(K.prototype,"vizProperties",[w],{configurable:true,enumerable:true,writable:true,initializer:null}),ge=Ge(K.prototype,"chartActions",[V],{configurable:true,enumerable:true,writable:true,initializer:null}),pe=Ge(K.prototype,"draftSupported",[E],{configurable:true,enumerable:true,writable:true,initializer:null}),he=Ge(K.prototype,"autoBindOnInit",[j],{configurable:true,enumerable:true,writable:true,initializer:null}),me=Ge(K.prototype,"visible",[F],{configurable:true,enumerable:true,writable:true,initializer:null}),be=Ge(K.prototype,"navigationPath",[k],{configurable:true,enumerable:true,writable:true,initializer:null}),fe=Ge(K.prototype,"filter",[N],{configurable:true,enumerable:true,writable:true,initializer:null}),ve=Ge(K.prototype,"measures",[H],{configurable:true,enumerable:true,writable:true,initializer:null}),Pe=Ge(K.prototype,"_applyIdToContent",[L],{configurable:true,enumerable:true,writable:true,initializer:function(){return false}}),Ae=Ge(K.prototype,"variantManagement",[U],{configurable:true,enumerable:true,writable:true,initializer:null}),ye=Ge(K.prototype,"variantSelected",[R],{configurable:true,enumerable:true,writable:true,initializer:null}),Ce=Ge(K.prototype,"variantSaved",[W],{configurable:true,enumerable:true,writable:true,initializer:null}),xe=Ge(K.prototype,"actions",[q],{configurable:true,enumerable:true,writable:true,initializer:null}),Me=Ge(K.prototype,"selectionChange",[G],{configurable:true,enumerable:true,writable:true,initializer:null}),$e=Ge(K.prototype,"stateChange",[X],{configurable:true,enumerable:true,writable:true,initializer:null}),K))||J);Ie=Qe;return Ie},false);
//# sourceMappingURL=Chart.block.js.map