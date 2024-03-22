/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/chart/coloring/CriticalityType","sap/fe/core/helpers/ClassSupport","sap/fe/macros/library","sap/m/FlexBox","sap/m/Label","sap/m/library","sap/suite/ui/microchart/AreaMicroChart","sap/suite/ui/microchart/ColumnMicroChart","sap/suite/ui/microchart/ComparisonMicroChart","sap/suite/ui/microchart/LineMicroChart","sap/ui/core/Control","sap/ui/core/format/NumberFormat","sap/ui/model/odata/v4/ODataListBinding","sap/ui/model/odata/v4/ODataMetaModel","sap/ui/model/type/Date"],function(e,t,i,r,a,n,o,l,s,u,c,f,g,h,p,d){"use strict";var b,m,y,C,v,P,L,_,w,A,O,T,x,V,z,N,B,D,M,R,E,I,S,F,j,$,U,k,Y,G,q,X,H,Q,J;var K=i.property;var W=i.event;var Z=i.defineUI5Class;var ee=i.aggregation;function te(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function ie(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function re(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;ae(e,t)}function ae(e,t){ae=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return ae(e,t)}function ne(e,t,i,r,a){var n={};Object.keys(r).forEach(function(e){n[e]=r[e]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},n);if(a&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(a):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(e,t,n);n=null}return n}function oe(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}const le=r.NavigationType;const se=o.ValueColor;let ue=(b=Z("sap.fe.macros.microchart.MicroChartContainer"),m=K({type:"boolean",defaultValue:false}),y=K({type:"string",defaultValue:undefined}),C=K({type:"string[]",defaultValue:[]}),v=K({type:"string",defaultValue:undefined}),P=K({type:"string[]",defaultValue:[]}),L=K({type:"int",defaultValue:undefined}),_=K({type:"int",defaultValue:1}),w=K({type:"int",defaultValue:undefined}),A=K({type:"string",defaultValue:""}),O=K({type:"string",defaultValue:""}),T=K({type:"sap.fe.macros.NavigationType",defaultValue:"None"}),x=K({type:"string",defaultValue:""}),V=W(),z=ee({type:"sap.ui.core.Control",multiple:false,isDefault:true}),N=ee({type:"sap.m.Label",multiple:false}),B=ee({type:"sap.ui.core.Control",multiple:true}),b(D=(M=function(i){re(r,i);function r(){var e;for(var t=arguments.length,r=new Array(t),a=0;a<t;a++){r[a]=arguments[a]}e=i.call(this,...r)||this;te(e,"showOnlyChart",R,ie(e));te(e,"uomPath",E,ie(e));te(e,"measures",I,ie(e));te(e,"dimension",S,ie(e));te(e,"dataPointQualifiers",F,ie(e));te(e,"measurePrecision",j,ie(e));te(e,"measureScale",$,ie(e));te(e,"dimensionPrecision",U,ie(e));te(e,"chartTitle",k,ie(e));te(e,"chartDescription",Y,ie(e));te(e,"navigationType",G,ie(e));te(e,"calendarPattern",q,ie(e));te(e,"onTitlePressed",X,ie(e));te(e,"microChart",H,ie(e));te(e,"_uomLabel",Q,ie(e));te(e,"microChartTitle",J,ie(e));return e}r.render=function e(t,i){t.openStart("div",i);t.openEnd();if(!i.showOnlyChart){const e=i.microChartTitle;if(e){e.forEach(function(e){t.openStart("div");t.openEnd();t.renderControl(e);t.close("div")})}t.openStart("div");t.openEnd();const r=new n({text:i.chartDescription});t.renderControl(r);t.close("div")}const r=i.microChart;if(r){r.addStyleClass("sapUiTinyMarginTopBottom");t.renderControl(r);if(!i.showOnlyChart&&i.uomPath){const e=i._checkIfChartRequiresRuntimeLabels()?undefined:{text:{path:i.uomPath}},r=new n(e),o=new a({alignItems:"Start",justifyContent:"End",items:[r]});t.renderControl(o);i.setAggregation("_uomLabel",r)}}t.close("div")};var o=r.prototype;o.onBeforeRendering=function e(){const t=this._getListBindingForRuntimeLabels();if(t){t.detachEvent("change",this._setRuntimeChartLabelsAndUnitOfMeasure,this);this._olistBinding=undefined}};o.onAfterRendering=function e(){const t=this._getListBindingForRuntimeLabels();if(!this._checkIfChartRequiresRuntimeLabels()){return}if(t){t.attachEvent("change",this._setRuntimeChartLabelsAndUnitOfMeasure,this);this._olistBinding=t}};o.setShowOnlyChart=function e(t){if(!t&&this._olistBinding){this._setChartLabels()}this.setProperty("showOnlyChart",t,false)};o._checkIfChartRequiresRuntimeLabels=function e(){const t=this.microChart;return Boolean(t instanceof l||t instanceof s||t instanceof c||t instanceof u)};o._checkForChartLabelAggregations=function e(){const t=this.microChart;return Boolean(t instanceof l&&t.getAggregation("firstYLabel")&&t.getAggregation("lastYLabel")&&t.getAggregation("firstXLabel")&&t.getAggregation("lastXLabel")||t instanceof s&&t.getAggregation("leftTopLabel")&&t.getAggregation("rightTopLabel")&&t.getAggregation("leftBottomLabel")&&t.getAggregation("rightBottomLabel")||t instanceof c)};o._getListBindingForRuntimeLabels=function e(){const t=this.microChart;let i;if(t instanceof l){const e=t.getChart();i=e&&e.getBinding("points")}else if(t instanceof s){i=t.getBinding("columns")}else if(t instanceof c){const e=t.getLines();i=e&&e.length&&e[0].getBinding("points")}else if(t instanceof u){i=t.getBinding("data")}return i instanceof h?i:false};o._setRuntimeChartLabelsAndUnitOfMeasure=async function e(){const t=this._olistBinding,i=t===null||t===void 0?void 0:t.getContexts(),r=this.measures,a=this.dimension,n=this.uomPath,o=this.microChart,l=this._uomLabel;if(l&&n&&i&&i.length&&!this.showOnlyChart){l.setText(i[0].getObject(n))}else if(l){l.setText("")}if(!this._checkForChartLabelAggregations()){return}if(!i||!i.length){this._setChartLabels();return}const s=i[0],u=i[i.length-1],f=[],g=o instanceof c,h=s.getObject(a),p=u.getObject(a);let d,b,m={value:Infinity},y={value:-Infinity},C={value:Infinity},v={value:-Infinity};m=h==undefined?m:{context:s,value:h};y=p==undefined?y:{context:u,value:p};if(r!==null&&r!==void 0&&r.length){r.forEach((e,t)=>{d=s.getObject(e);b=u.getObject(e);v=b>v.value?{context:u,value:b,index:g?t:0}:v;C=d<C.value?{context:s,value:d,index:g?t:0}:C;if(g){f.push(this._getCriticalityFromPoint({context:u,value:b,index:t}))}})}this._setChartLabels(C.value,v.value,m.value,y.value);if(g){const e=await Promise.all(f);if(e!==null&&e!==void 0&&e.length){const t=o.getLines();t.forEach(function(t,i){t.setColor(e[i])})}}else{await this._setChartLabelsColors(v,C)}};o._setChartLabelsColors=async function e(t,i){const r=this.microChart;const a=await Promise.all([this._getCriticalityFromPoint(i),this._getCriticalityFromPoint(t)]);if(r instanceof l){r.getAggregation("firstYLabel").setProperty("color",a[0],true);r.getAggregation("lastYLabel").setProperty("color",a[1],true)}else if(r instanceof s){r.getAggregation("leftTopLabel").setProperty("color",a[0],true);r.getAggregation("rightTopLabel").setProperty("color",a[1],true)}};o._setChartLabels=function e(t,i,r,a){const n=this.microChart;t=this._formatDateAndNumberValue(t,this.measurePrecision,this.measureScale);i=this._formatDateAndNumberValue(i,this.measurePrecision,this.measureScale);r=this._formatDateAndNumberValue(r,this.dimensionPrecision,undefined,this.calendarPattern);a=this._formatDateAndNumberValue(a,this.dimensionPrecision,undefined,this.calendarPattern);if(n instanceof l){n.getAggregation("firstYLabel").setProperty("label",t,false);n.getAggregation("lastYLabel").setProperty("label",i,false);n.getAggregation("firstXLabel").setProperty("label",r,false);n.getAggregation("lastXLabel").setProperty("label",a,false)}else if(n instanceof s){n.getAggregation("leftTopLabel").setProperty("label",t,false);n.getAggregation("rightTopLabel").setProperty("label",i,false);n.getAggregation("leftBottomLabel").setProperty("label",r,false);n.getAggregation("rightBottomLabel").setProperty("label",a,false)}else if(n instanceof c){n.setProperty("leftTopLabel",t,false);n.setProperty("rightTopLabel",i,false);n.setProperty("leftBottomLabel",r,false);n.setProperty("rightBottomLabel",a,false)}};o._getCriticalityFromPoint=async function e(t){if(t!==null&&t!==void 0&&t.context){const e=this.getModel()&&this.getModel().getMetaModel(),i=this.dataPointQualifiers,r=e instanceof p&&t.context.getPath()&&e.getMetaPath(t.context.getPath());if(e&&typeof r==="string"){const a=await e.requestObject(`${r}/@${"com.sap.vocabularies.UI.v1.DataPoint"}${t.index!==undefined&&i[t.index]?`#${i[t.index]}`:""}`);if(a){let e=se.Neutral;const i=t.context;if(a.Criticality){e=this._criticality(a.Criticality,i)}else if(a.CriticalityCalculation){const r=a.CriticalityCalculation;const n=function(e){let t;if(e!==null&&e!==void 0&&e.$Path){t=i.getObject(e.$Path)}else if(e!==null&&e!==void 0&&e.hasOwnProperty("$Decimal")){t=e.$Decimal}return t};e=this._criticalityCalculation(r.ImprovementDirection.$EnumMember,t.value,n(r.DeviationRangeLowValue),n(r.ToleranceRangeLowValue),n(r.AcceptanceRangeLowValue),n(r.AcceptanceRangeHighValue),n(r.ToleranceRangeHighValue),n(r.DeviationRangeHighValue))}return e}}}return Promise.resolve(se.Neutral)};o._criticality=function i(r,a){let n,o;if(r.$Path){n=a.getObject(r.$Path);if(n===t.Negative||n.toString()==="1"){o=se.Error}else if(n===t.Critical||n.toString()==="2"){o=se.Critical}else if(n===t.Positive||n.toString()==="3"){o=se.Good}}else if(r.$EnumMember){n=r.$EnumMember;if(n.indexOf("com.sap.vocabularies.UI.v1.CriticalityType/Negative")>-1){o=se.Error}else if(n.indexOf("com.sap.vocabularies.UI.v1.CriticalityType/Positive")>-1){o=se.Good}else if(n.indexOf("com.sap.vocabularies.UI.v1.CriticalityType/Critical")>-1){o=se.Critical}}if(o===undefined){e.warning("Case not supported, returning the default Value Neutral");return se.Neutral}return o};o._criticalityCalculation=function t(i,r,a,n,o,l,s,u){let c;a=a==undefined?-Infinity:a;n=n==undefined?a:n;o=o==undefined?n:o;u=u==undefined?Infinity:u;s=s==undefined?u:s;l=l==undefined?s:l;if(i.indexOf("Minimize")>-1){if(r<=l){c=se.Good}else if(r<=s){c=se.Neutral}else if(r<=u){c=se.Critical}else{c=se.Error}}else if(i.indexOf("Maximize")>-1){if(r>=o){c=se.Good}else if(r>=n){c=se.Neutral}else if(r>=a){c=se.Critical}else{c=se.Error}}else if(i.indexOf("Target")>-1){if(r<=l&&r>=o){c=se.Good}else if(r>=n&&r<o||r>l&&r<=s){c=se.Neutral}else if(r>=a&&r<n||r>s&&r<=u){c=se.Critical}else{c=se.Error}}if(c===undefined){e.warning("Case not supported, returning the default Value Neutral");return se.Neutral}return c};o._formatDateAndNumberValue=function e(t,i,r,a){if(a){return this._getSemanticsValueFormatter(a).formatValue(t,"string")}else if(!isNaN(t)){return this._getLabelNumberFormatter(i,r).format(t)}return t};o._getSemanticsValueFormatter=function e(t){if(!this._oDateType){this._oDateType=new d({style:"short",source:{pattern:t}})}return this._oDateType};o._getLabelNumberFormatter=function e(t,i){return g.getFloatInstance({style:"short",showScale:true,precision:typeof t==="number"&&t||0,decimals:typeof i==="number"&&i||0})};return r}(f),R=ne(M.prototype,"showOnlyChart",[m],{configurable:true,enumerable:true,writable:true,initializer:null}),E=ne(M.prototype,"uomPath",[y],{configurable:true,enumerable:true,writable:true,initializer:null}),I=ne(M.prototype,"measures",[C],{configurable:true,enumerable:true,writable:true,initializer:null}),S=ne(M.prototype,"dimension",[v],{configurable:true,enumerable:true,writable:true,initializer:null}),F=ne(M.prototype,"dataPointQualifiers",[P],{configurable:true,enumerable:true,writable:true,initializer:null}),j=ne(M.prototype,"measurePrecision",[L],{configurable:true,enumerable:true,writable:true,initializer:null}),$=ne(M.prototype,"measureScale",[_],{configurable:true,enumerable:true,writable:true,initializer:null}),U=ne(M.prototype,"dimensionPrecision",[w],{configurable:true,enumerable:true,writable:true,initializer:null}),k=ne(M.prototype,"chartTitle",[A],{configurable:true,enumerable:true,writable:true,initializer:null}),Y=ne(M.prototype,"chartDescription",[O],{configurable:true,enumerable:true,writable:true,initializer:null}),G=ne(M.prototype,"navigationType",[T],{configurable:true,enumerable:true,writable:true,initializer:null}),q=ne(M.prototype,"calendarPattern",[x],{configurable:true,enumerable:true,writable:true,initializer:null}),X=ne(M.prototype,"onTitlePressed",[V],{configurable:true,enumerable:true,writable:true,initializer:null}),H=ne(M.prototype,"microChart",[z],{configurable:true,enumerable:true,writable:true,initializer:null}),Q=ne(M.prototype,"_uomLabel",[N],{configurable:true,enumerable:true,writable:true,initializer:null}),J=ne(M.prototype,"microChartTitle",[B],{configurable:true,enumerable:true,writable:true,initializer:null}),M))||D);return ue},false);
//# sourceMappingURL=MicroChartContainer.js.map