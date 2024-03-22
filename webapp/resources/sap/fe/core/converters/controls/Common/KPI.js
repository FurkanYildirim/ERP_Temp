/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/IssueManager","sap/fe/core/converters/helpers/SelectionVariantHelper","sap/fe/core/formatters/TableFormatterTypes","sap/fe/core/helpers/TypeGuards","../../helpers/Aggregation","../../helpers/ID","./Criticality"],function(e,t,a,i,n,o,l){"use strict";var r={};var u=l.getMessageTypeFromCriticalityType;var c=o.getKPIID;var s=n.AggregationHelper;var d=i.isPathAnnotationExpression;var v=i.isAnnotationOfType;var p=a.MessageType;var f=t.getFilterDefinitionsFromSelectionVariant;var g=e.IssueType;var y=e.IssueSeverity;var C=e.IssueCategory;const h={"UI.TrendType/StrongUp":"Up","UI.TrendType/Up":"Up","UI.TrendType/StrongDown":"Down","UI.TrendType/Down":"Down","UI.TrendType/Sideways":"None"};const T={"UI.ChartType/ColumnStacked":"StackedColumn","UI.ChartType/BarStacked":"StackedBar","UI.ChartType/Donut":"Donut","UI.ChartType/Line":"Line","UI.ChartType/Bubble":"bubble","UI.ChartType/Column":"column","UI.ChartType/Bar":"bar","UI.ChartType/VerticalBullet":"vertical_bullet","UI.ChartType/Combination":"combination","UI.ChartType/Scatter":"scatter"};function m(e,t){var a,i;if(e.Measures===undefined){return undefined}const n=e.Dimensions?e.Dimensions.map(t=>{var a,i,n,o;const l=(a=e.DimensionAttributes)===null||a===void 0?void 0:a.find(e=>{var a;return((a=e.Dimension)===null||a===void 0?void 0:a.value)===t.value});return{name:t.value,label:((i=t.$target.annotations.Common)===null||i===void 0?void 0:(n=i.Label)===null||n===void 0?void 0:n.toString())||t.value,role:l===null||l===void 0?void 0:(o=l.Role)===null||o===void 0?void 0:o.replace("UI.ChartDimensionRoleType/","")}}):[];const o=e.Measures.map(t=>{var a,i,n,o;const l=(a=e.MeasureAttributes)===null||a===void 0?void 0:a.find(e=>{var a;return((a=e.Measure)===null||a===void 0?void 0:a.value)===t.value});return{name:t.value,label:((i=t.$target.annotations.Common)===null||i===void 0?void 0:(n=i.Label)===null||n===void 0?void 0:n.toString())||t.value,role:l===null||l===void 0?void 0:(o=l.Role)===null||o===void 0?void 0:o.replace("UI.ChartMeasureRoleType/","")}});return{chartType:T[e.ChartType]||"Line",dimensions:n,measures:o,sortOrder:t===null||t===void 0?void 0:(a=t.SortOrder)===null||a===void 0?void 0:a.map(e=>{var t;return{name:((t=e.Property)===null||t===void 0?void 0:t.value)||"",descending:!!e.Descending}}),maxItems:t===null||t===void 0?void 0:(i=t.MaxItems)===null||i===void 0?void 0:i.valueOf()}}function I(e,t){var a,i;const n=e.Value.$target;if((a=n.annotations.Measures)!==null&&a!==void 0&&a.ISOCurrency){var o;const e=(o=n.annotations.Measures)===null||o===void 0?void 0:o.ISOCurrency;if(d(e)){t.datapoint.unit={value:e.$target.name,isCurrency:true,isPath:true}}else{t.datapoint.unit={value:e.toString(),isCurrency:true,isPath:false}}}else if((i=n.annotations.Measures)!==null&&i!==void 0&&i.Unit){var l;const e=(l=n.annotations.Measures)===null||l===void 0?void 0:l.Unit;if(d(e)){t.datapoint.unit={value:e.$target.name,isCurrency:false,isPath:true}}else{t.datapoint.unit={value:e.toString(),isCurrency:false,isPath:false}}}}function S(e,t,a){if(e.Criticality){if(typeof e.Criticality==="object"){const i=e.Criticality.$target;if(t.isPropertyAggregatable(i)){a.datapoint.criticalityPath=e.Criticality.path}else{a.datapoint.criticalityValue=p.None}}else{a.datapoint.criticalityValue=u(e.Criticality)}}else if(e.CriticalityCalculation){a.datapoint.criticalityCalculationMode=e.CriticalityCalculation.ImprovementDirection;a.datapoint.criticalityCalculationThresholds=[];switch(a.datapoint.criticalityCalculationMode){case"UI.ImprovementDirectionType/Target":a.datapoint.criticalityCalculationThresholds.push(e.CriticalityCalculation.DeviationRangeLowValue);a.datapoint.criticalityCalculationThresholds.push(e.CriticalityCalculation.ToleranceRangeLowValue);a.datapoint.criticalityCalculationThresholds.push(e.CriticalityCalculation.AcceptanceRangeLowValue);a.datapoint.criticalityCalculationThresholds.push(e.CriticalityCalculation.AcceptanceRangeHighValue);a.datapoint.criticalityCalculationThresholds.push(e.CriticalityCalculation.ToleranceRangeHighValue);a.datapoint.criticalityCalculationThresholds.push(e.CriticalityCalculation.DeviationRangeHighValue);break;case"UI.ImprovementDirectionType/Minimize":a.datapoint.criticalityCalculationThresholds.push(e.CriticalityCalculation.AcceptanceRangeHighValue);a.datapoint.criticalityCalculationThresholds.push(e.CriticalityCalculation.ToleranceRangeHighValue);a.datapoint.criticalityCalculationThresholds.push(e.CriticalityCalculation.DeviationRangeHighValue);break;case"UI.ImprovementDirectionType/Maximize":default:a.datapoint.criticalityCalculationThresholds.push(e.CriticalityCalculation.DeviationRangeLowValue);a.datapoint.criticalityCalculationThresholds.push(e.CriticalityCalculation.ToleranceRangeLowValue);a.datapoint.criticalityCalculationThresholds.push(e.CriticalityCalculation.AcceptanceRangeLowValue)}}else{a.datapoint.criticalityValue=p.None}}function D(e,t,a){if(e.Trend){if(typeof e.Trend==="object"){const i=e.Trend.$target;if(t.isPropertyAggregatable(i)){a.datapoint.trendPath=e.Trend.path}else{a.datapoint.trendValue="None"}}else{a.datapoint.trendValue=h[e.Trend]||"None"}}else if(e.TrendCalculation){a.datapoint.trendCalculationIsRelative=e.TrendCalculation.IsRelativeDifference?true:false;if(e.TrendCalculation.ReferenceValue.$target){const i=e.TrendCalculation.ReferenceValue.$target;if(t.isPropertyAggregatable(i)){a.datapoint.trendCalculationReferencePath=e.TrendCalculation.ReferenceValue.path}else{a.datapoint.trendValue="None"}}else{a.datapoint.trendCalculationReferenceValue=e.TrendCalculation.ReferenceValue}if(a.datapoint.trendCalculationReferencePath!==undefined||a.datapoint.trendCalculationReferenceValue!==undefined){a.datapoint.trendCalculationTresholds=[e.TrendCalculation.StrongDownDifference.valueOf(),e.TrendCalculation.DownDifference.valueOf(),e.TrendCalculation.UpDifference.valueOf(),e.TrendCalculation.StrongUpDifference.valueOf()]}}else{a.datapoint.trendValue="None"}}function b(e,t,a){if(e.TargetValue){if(e.TargetValue.$target){const i=e.TargetValue.$target;if(t.isPropertyAggregatable(i)){a.datapoint.targetPath=e.TargetValue.path}}else{a.datapoint.targetValue=e.TargetValue}}}function V(e){const t=e.annotations["Common"]||{};let a;Object.keys(t).forEach(e=>{const i=t[e];if(i.term==="com.sap.vocabularies.Common.v1.SemanticObject"){if(!i.qualifier||!a){a=i}}});if(a){const e={semanticObject:a.toString(),unavailableActions:[]};const i=Object.keys(t).find(e=>{var i;return t[e].term==="com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"&&t[e].qualifier===((i=a)===null||i===void 0?void 0:i.qualifier)});if(i){e.unavailableActions=t[i]}return e}else{return undefined}}function U(e,t,a){var i,n;const o=a.getConverterContextFor(`/${t.entitySet}`);const l=new s(o.getEntityType(),o);if(!l.isAnalyticsSupported()){a.getDiagnostics().addIssue(C.Annotation,y.Medium,g.KPI_ISSUES.NO_ANALYTICS+t.entitySet);return undefined}let r;let u;let d;let p;let h;const T=o.getAnnotationsByTerm("UI","com.sap.vocabularies.UI.v1.KPI");const U=T.find(e=>e.qualifier===t.qualifier);if(U){var P,A,R,O,M;u=U.DataPoint;r=U.SelectionVariant;d=(P=U.Detail)===null||P===void 0?void 0:P.DefaultPresentationVariant;p=(A=d)===null||A===void 0?void 0:(R=A.Visualizations)===null||R===void 0?void 0:(O=R.find(e=>v(e.$target,"com.sap.vocabularies.UI.v1.ChartDefinitionType")))===null||O===void 0?void 0:O.$target;if((M=U.Detail)!==null&&M!==void 0&&M.SemanticObject){var N;h={semanticObject:U.Detail.SemanticObject.toString(),action:(N=U.Detail.Action)===null||N===void 0?void 0:N.toString(),unavailableActions:[]}}}else{const e=o.getAnnotationsByTerm("UI","com.sap.vocabularies.UI.v1.SelectionPresentationVariant");const i=e.find(e=>e.qualifier===t.qualifier);if(i){var $,w,L,_,E,j;r=i.SelectionVariant;d=i.PresentationVariant;u=($=d)===null||$===void 0?void 0:(w=$.Visualizations)===null||w===void 0?void 0:(L=w.find(e=>v(e.$target,"com.sap.vocabularies.UI.v1.DataPointType")))===null||L===void 0?void 0:L.$target;p=(_=d)===null||_===void 0?void 0:(E=_.Visualizations)===null||E===void 0?void 0:(j=E.find(e=>v(e.$target,"com.sap.vocabularies.UI.v1.ChartDefinitionType")))===null||j===void 0?void 0:j.$target}else{a.getDiagnostics().addIssue(C.Annotation,y.Medium,g.KPI_ISSUES.KPI_NOT_FOUND+t.qualifier);return undefined}}if(!d||!u||!p){a.getDiagnostics().addIssue(C.Annotation,y.Medium,g.KPI_ISSUES.KPI_DETAIL_NOT_FOUND+t.qualifier);return undefined}const q=u.Value.$target;if(!l.isPropertyAggregatable(q)){a.getDiagnostics().addIssue(C.Annotation,y.Medium,g.KPI_ISSUES.MAIN_PROPERTY_NOT_AGGREGATABLE+t.qualifier);return undefined}const K=m(p,d);if(!K){return undefined}const k={id:c(e),entitySet:t.entitySet,datapoint:{propertyPath:u.Value.path,annotationPath:o.getEntitySetBasedAnnotationPath(u.fullyQualifiedName),title:(i=u.Title)===null||i===void 0?void 0:i.toString(),description:(n=u.Description)===null||n===void 0?void 0:n.toString()},selectionVariantFilterDefinitions:r?f(r):undefined,chart:K};if(!h){if(t.detailNavigation){h={outboundNavigation:t.detailNavigation}}else{h=V(q)}}if(h){k.navigation=h}I(u,k);S(u,l,k);D(u,l,k);b(u,l,k);return k}function P(e){const t=e.getManifestWrapper().getKPIConfiguration(),a=[];Object.keys(t).forEach(i=>{const n=U(i,t[i],e);if(n){a.push(n)}});return a}r.getKPIDefinitions=P;return r},false);
//# sourceMappingURL=KPI.js.map