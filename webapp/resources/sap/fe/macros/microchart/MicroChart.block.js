/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/BindingToolkit","sap/fe/core/templating/UIFormatters","sap/fe/macros/CommonHelper","sap/ui/model/odata/v4/AnnotationHelper"],function(e,t,r,a,i,n,o,l){"use strict";var u,c,s,p,m,f,b,h,g,d,y,C,v,M,P,T,w,z,B,x,O,N,I,k,F,L,U,A,D;var X={};var j=n.hasValidAnalyticalCurrencyOrUnit;var $=i.pathInModel;var E=i.or;var S=i.not;var _=i.equal;var q=a.getInvolvedDataModelObjects;var H=a.convertMetaModelContext;var W=r.xml;var G=t.defineBuildingBlock;var R=t.blockAttribute;function V(e,t,r,a){if(!r)return;Object.defineProperty(e,t,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(a):void 0})}function J(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function K(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;Q(e,t)}function Q(e,t){Q=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return Q(e,t)}function Y(e,t,r,a,i){var n={};Object.keys(a).forEach(function(e){n[e]=a[e]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=r.slice().reverse().reduce(function(r,a){return a(e,t,r)||r},n);if(i&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(i):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(e,t,n);n=null}return n}function Z(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let ee=(u=G({name:"MicroChart",namespace:"sap.fe.macros.internal",publicNamespace:"sap.fe.macros",returnTypes:["sap.fe.macros.controls.ConditionalWrapper","sap.fe.macros.microchart.MicroChartContainer"]}),c=R({type:"string",isPublic:true,required:true}),s=R({type:"sap.ui.model.Context",expectedTypes:["EntitySet","NavigationProperty"],isPublic:true}),p=R({type:"sap.ui.model.Context",isPublic:true,required:true}),m=R({type:"string",isPublic:true}),f=R({type:"string"}),b=R({type:"string"}),h=R({type:"string"}),g=R({type:"string"}),d=R({type:"sap.fe.macros.NavigationType"}),y=R({type:"function"}),C=R({type:"string",isPublic:true}),v=R({type:"boolean"}),M=R({type:"sap.ui.model.Context"}),u(P=(T=function(e){K(t,e);function t(t){var r;r=e.call(this,t)||this;V(r,"id",w,J(r));V(r,"contextPath",z,J(r));V(r,"metaPath",B,J(r));V(r,"showOnlyChart",x,J(r));V(r,"batchGroupId",O,J(r));V(r,"title",N,J(r));V(r,"hideOnNoData",I,J(r));V(r,"description",k,J(r));V(r,"navigationType",F,J(r));V(r,"onTitlePressed",L,J(r));V(r,"size",U,J(r));V(r,"isAnalytics",A,J(r));V(r,"DataPoint",D,J(r));r.metaPath=r.metaPath.getModel().createBindingContext(l.resolve$Path(r.metaPath));const a=o.getMeasureAttributeForMeasure(r.metaPath.getModel().createBindingContext("Measures/0",r.metaPath));if(a){r.DataPoint=r.metaPath.getModel().createBindingContext(a)}return r}X=t;var r=t.prototype;r.getMicroChartContent=function e(){const t=H(this.metaPath);switch(t.ChartType){case"UI.ChartType/Bullet":return`<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.BulletMicroChart" type="XML" />`;case"UI.ChartType/Donut":return`<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.RadialMicroChart" type="XML" />`;case"UI.ChartType/Pie":return`<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.HarveyBallMicroChart" type="XML" />`;case"UI.ChartType/BarStacked":return`<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.StackedBarMicroChart" type="XML" />`;case"UI.ChartType/Area":return`<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.AreaMicroChart" type="XML" />`;case"UI.ChartType/Column":return`<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.ColumnMicroChart" type="XML" />`;case"UI.ChartType/Line":return`<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.LineMicroChart" type="XML" />`;case"UI.ChartType/Bar":return`<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.ComparisonMicroChart" type="XML" />`;default:return`<m:Text text="This chart type is not supported. Other Types yet to be implemented.." />`}};r.getTemplate=function e(){const t=q(this.metaPath.getModel().createBindingContext("Value/$Path",this.DataPoint),this.contextPath);const r=j(t);const a=E(S($("@$ui5.node.isExpanded")),_($("@$ui5.node.level"),0));if(this.isAnalytics){return W`<controls:ConditionalWrapper
				xmlns:controls="sap.fe.macros.controls"
				condition="${r}"
				visible="${a}" >
				<controls:contentTrue>
					${this.getMicroChartContent()}
				</controls:contentTrue>
				<controls:contentFalse>
					<m:Text text="*" />
				</controls:contentFalse>
			</controls:ConditionalWrapper>`}else{return this.getMicroChartContent()}};return t}(e),w=Y(T.prototype,"id",[c],{configurable:true,enumerable:true,writable:true,initializer:null}),z=Y(T.prototype,"contextPath",[s],{configurable:true,enumerable:true,writable:true,initializer:null}),B=Y(T.prototype,"metaPath",[p],{configurable:true,enumerable:true,writable:true,initializer:null}),x=Y(T.prototype,"showOnlyChart",[m],{configurable:true,enumerable:true,writable:true,initializer:function(){return false}}),O=Y(T.prototype,"batchGroupId",[f],{configurable:true,enumerable:true,writable:true,initializer:function(){return""}}),N=Y(T.prototype,"title",[b],{configurable:true,enumerable:true,writable:true,initializer:function(){return""}}),I=Y(T.prototype,"hideOnNoData",[h],{configurable:true,enumerable:true,writable:true,initializer:function(){return false}}),k=Y(T.prototype,"description",[g],{configurable:true,enumerable:true,writable:true,initializer:function(){return""}}),F=Y(T.prototype,"navigationType",[d],{configurable:true,enumerable:true,writable:true,initializer:function(){return"None"}}),L=Y(T.prototype,"onTitlePressed",[y],{configurable:true,enumerable:true,writable:true,initializer:null}),U=Y(T.prototype,"size",[C],{configurable:true,enumerable:true,writable:true,initializer:null}),A=Y(T.prototype,"isAnalytics",[v],{configurable:true,enumerable:true,writable:true,initializer:function(){return false}}),D=Y(T.prototype,"DataPoint",[M],{configurable:true,enumerable:true,writable:true,initializer:null}),T))||P);X=ee;return X},false);
//# sourceMappingURL=MicroChart.block.js.map