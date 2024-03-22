/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/chart/coloring/gradation/rankedMeasureValues/RankedMeasureValues","sap/chart/coloring/gradation/DelineatedMeasures","sap/chart/coloring/gradation/DelineatedDimensionValues","sap/chart/coloring/ColorPalette","sap/chart/coloring/ColoringUtils","sap/chart/data/MeasureSemantics","sap/chart/ChartLog"],function(e,a,r,n,t,i,s){"use strict";var o=["DelineatedDimensionValues","RankedMeasureValues","DelineatedMeasures"];function l(a){return function(){var r,n;if(a.bMBC){r=e.createScales(a)}else{var t=u(a);n={plotArea:{dataPointStyle:{rules:t}}}}return{colorScale:r,properties:n}}}function u(e){var a=[];e.forEach(function(r,i){if(r.chartLog){throw r.chartLog}var s=r.dim;var o=r.setting[s].Levels;var l=n.GRADATION.SingleColorScheme[r.parsed.singleColorScheme];l=t.assignColor(l,o.length);if(r.parsed.saturation==="DarkToLight"){l=l.reverse()}o.forEach(function(n,t){var i={callback:r.parsed.callbacks[n],properties:{color:l[t]},displayName:r.parsed.legend[n]};if(e.bIsLine){i.properties.lineColor=i.properties.color}a.push(i)})});return a}function c(e,a){var r=[];a.forEach(function(a){var n=a.msr.getName();e.forEach(function(e){Object.keys(i).forEach(function(a){var t=i[a];if(e[t]===n){e.order=[];e.order.push(t);r.push(e)}})})});e.splice(0,e.length);e.push.apply(e,r)}return{getCandidateSetting:function(n,i,s,u,d,f,p){var g=n.Gradation||{},h=i.parameters||{};var v=t.dimOrMsrUse(g,h,o,"Gradation");var m={};var D;switch(v){case"RankedMeasureValues":var M=h.measure||Object.keys(g.RankedMeasureValues);if(typeof M==="string"||M instanceof String){M=[M]}D=e.qualify(g.RankedMeasureValues,M,u,f);if(D&&D.sMethod){D.forEach(function(a){a.parsed=e.parse(a)});m.contextHandler=e.getContextHandler(D);m.qualifiedSettings=D;m.ruleGenerator=l(D);D.bMBC=f.bMBC}break;case"DelineatedMeasures":D=a.qualify(g.DelineatedMeasures,s,u,f);if(D){m.qualifiedSettings=D;D.forEach(function(e){e.type=v;e.parsed=a.parse(e)});c(s,D)}break;case"DelineatedDimensionValues":var S=h.dimension||Object.keys(g.DelineatedDimensionValues).filter(function(e){return e!=="SingleColorScheme"&&e!=="Saturation"});if(typeof S==="string"||S instanceof String){S=[S]}D=r.qualify(g.DelineatedDimensionValues,S,s,u,f);if(D){m.qualifiedSettings=D;D.parsed=r.parse(D);m.contextHandler=r.getContextHandler(D);var b=[D];m.ruleGenerator=l(b);b.bIsLine=f.bIsLine}break;default:return{}}if(D&&D.length){m.subType=v}return m}}});
//# sourceMappingURL=Gradation.js.map