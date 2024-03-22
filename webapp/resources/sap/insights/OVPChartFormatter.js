/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/viz/library","sap/viz/ui5/format/ChartFormatter","sap/viz/ui5/api/env/Format","sap/ui/core/format/NumberFormat","sap/ui/core/format/DateFormat","sap/ui/core/date/UI5Date"],function(t,e,r,a,n,i){"use strict";var o=10;var s=[{prefix:"CURR",fn:f},{prefix:"axisFormatter",fn:u},{prefix:"0.0%",fn:m}];var c=["YearMonthDay","YearMonth","MMM","YearQuarter","Quarter","YearWeek","Week"];function f(t,e){var r;if(t===-1){r=a.getCurrencyInstance({style:"short",currencyCode:false})}else{r=a.getCurrencyInstance({style:"short",currencyCode:false,minFractionDigits:t,maxFractionDigits:t})}return r.format(Number(e))}function u(t,e){var r;if(t===-1){r=a.getFloatInstance({style:"short"})}else{r=a.getFloatInstance({style:"short",minFractionDigits:t,maxFractionDigits:t?t:1})}return r.format(Number(e))}function m(t,e){var r;if(t===-1){r=a.getPercentInstance({style:"short",minFractionDigits:1,maxFractionDigits:1})}else{r=a.getPercentInstance({style:"short",minFractionDigits:t,maxFractionDigits:t})}return r.format(Number(e))}function g(t,e){if(e.constructor===Date){var r=n.getDateTimeInstance({pattern:t});if(t==="YearMonthDay"){r=n.getDateInstance({style:"medium"})}if(t==="YearMonth"||t==="MMM"){r=n.getDateTimeInstance({format:"MMM"})}if(t==="YearQuarter"||t==="Quarter"){r=n.getDateTimeInstance({format:"QQQ"})}if(t==="YearWeek"||t==="Week"){r=n.getDateTimeInstance({format:"www"})}e=r.format(i.getInstance(e),true)}return e}return{registerCustomFormatters:function(){var t=e.getInstance();var a=[];s.forEach(function(t){a.push({name:t.prefix,fn:t.fn.bind(null,2)});for(var e=-1;e<=o;e++){var r="/"+e+"/";a.push({name:t.prefix+r,fn:t.fn.bind(null,e)})}});c.forEach(function(t){a.push({name:t,fn:g.bind(null,t)})});a.forEach(function(e){t.registerCustomFormatter(e.name,e.fn)});r.numericFormatter(t)}}});
//# sourceMappingURL=OVPChartFormatter.js.map