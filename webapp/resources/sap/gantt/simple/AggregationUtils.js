/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery"],function(jQuery){"use strict";var t=function(t,e){if(!t||!e){return false}return t.isA(e)};var e={isParentRowSetting:function(t){return t.getParent().isA("sap.gantt.simple.GanttRowSettings")},getParentControlOf:function(e,a){if(t(a,e)){return a}var n=a.getParent(),r;while(n&&t(n,e)===false){n=n.getParent()}r=n;return r},isDeltaLine:function(t){return t.getParent().isA("sap.gantt.simple.DeltaLine")},isLazyAggregation:function(t){var e=t.getParent();if(!e){return false}var a=e.getMetadata().getAggregation(t.sParentAggregationName);return this._hasLazyConfiguration(a)},isAdhocLine:function(t){return t.getParent().isA("sap.gantt.simple.AdhocLine")},isLazy:function(t,e){return Object.keys(this.getLazyAggregations(t)).indexOf(e)!==-1},getLazyAggregations:function(t){return this._filterAggregationBy(t,function(t){return e._hasLazyConfiguration(t)})},getLazyElementsByScheme:function(t,e){var a=this.getLazyAggregations(t);var n=[];Object.keys(a).forEach(function(a){var r=t.getAggregation(a);if(r&&!jQuery.isArray(r)){r=[r]}if(r&&r.length>0&&e.indexOf(r[0].getScheme())>-1){n.push(r)}});return[].concat.apply([],n)},getNonLazyElementsByScheme:function(t,e){var a=this.getNonLazyAggregations(t);var n=[];Object.keys(a).forEach(function(r){var i=a[r];var g=t.getAggregation(r);if(g&&!jQuery.isArray(g)){g=[g]}if(g&&g.length>0&&(e.indexOf(g[0].getScheme())>-1||!e.length&&i.appData!==null&&i.appData.sapGanttOrder===1)){n.push(g)}});return[].concat.apply([],n)},_hasLazyConfiguration:function(t){return t.appData&&t.appData.sapGanttLazy===true},getNonLazyAggregations:function(t){return this._filterAggregationBy(t,function(t){return t.appData===null||!t.appData.sapGanttLazy})},getAllNonLazyAggregations:function(t){return this._filterAggregationBy(t,function(t){return t.appData===null||!t.appData.sapGanttLazy},true)},_filterAggregationBy:function(t,e,a){var n=t.getMetadata(),r;if(a||t.isPseudoShape){r=n.getAllAggregations()}else{r=n.getAggregations()}var i={};for(var g in r){if(r.hasOwnProperty(g)){var s=r[g];if(e(s)){i[g]=s}}}return i},_isLabelText:function(t){return t.isA("sap.gantt.simple.BaseText")&&t.getIsLabel()?true:false},_isLabelEnabled:function(){return this.oGantt&&this.oGantt.getSelectOnlyGraphicalShape()?true:false},eachNonLazyAggregation:function(t,e){var a=[],n=[];this.oGantt=t.getGanttChartBase();var r=this.getNonLazyAggregations(t);var i=Object.keys(r).sort(function(t,e){var a=r[t].appData?r[t].appData.sapGanttOrder||0:0;var n=r[e].appData?r[e].appData.sapGanttOrder||0:0;return a-n});i.forEach(function(i){var g=r[i];var s=t[g._sGetter]();if(Array.isArray(s)){s.forEach(function(t){if(this._isLabelEnabled()){if(t.getVisible()&&t.renderElement){if(this._isLabelText(t)){n.push(t)}else{a.push(t)}}}else{e(t)}}.bind(this))}else if(s){if(this._isLabelEnabled()){if(s.getVisible()&&s.renderElement){if(this._isLabelText(s)){n.push(s)}else{a.push(s)}}}else{e(s)}}}.bind(this));if(a.length>0||n.length>0){e(n,a)}}};return e},true);
//# sourceMappingURL=AggregationUtils.js.map