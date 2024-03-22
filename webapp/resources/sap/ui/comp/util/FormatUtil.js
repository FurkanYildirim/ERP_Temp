/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/format/NumberFormat","sap/ui/core/format/DateFormat","sap/m/P13nConditionPanel","sap/ui/comp/odata/ODataType","sap/ui/model/odata/type/Currency","sap/ui/model/odata/type/Unit","sap/base/strings/whitespaceReplacer"],function(e,t,r,n,i,a,o){"use strict";var u={CHAR_FIGURE_SPACE:" ",CHAR_PUNCTUATION_SPACE:" ",MAX_CURRENCY_DIGITS:3,getFormattedExpressionFromDisplayBehaviour:function(e,t,r){return u.getFormatterFunctionFromDisplayBehaviour(e)(t,r)},getFormatterFunctionFromDisplayBehaviour:function(e,t,r){var n=t?"Whitespace":"";var i=r?"OverrideNoData":"";if(i){switch(e){case"descriptionAndId":return u["_get"+i+"TextFormatterForDescriptionAndId"].bind(r);case"idAndDescription":return u["_get"+i+"TextFormatterForIdAndDescription"].bind(r);case"descriptionOnly":return u["_get"+i+"TextFormatterForDescriptionOnly"].bind(r);default:return u["_get"+i+"TextFormatterForIdOnly"].bind(r)}}switch(e){case"descriptionAndId":return u["_get"+n+i+"TextFormatterForDescriptionAndId"];case"idAndDescription":return u["_get"+n+i+"TextFormatterForIdAndDescription"];case"descriptionOnly":return u["_get"+n+i+"TextFormatterForDescriptionOnly"];default:return u["_get"+n+i+"TextFormatterForIdOnly"]}},_processText:function(e,t){if(t){return e}return e.secondText?e.firstText+" ("+e.secondText+")":e.firstText},_getTextFormatterForDescriptionAndId:function(e,t,r){return u._processText({firstText:t?t:e,secondText:t?e:undefined},r)},_getTextFormatterForIdAndDescription:function(e,t,r){return u._processText({firstText:e,secondText:t?t:undefined},r)},_getTextFormatterForDescriptionOnly:function(e,t,r){return u._processText({firstText:t,secondText:undefined},r)},_getTextFormatterForIdOnly:function(e,t,r){return u._processText({firstText:e,secondText:undefined},r)},_getWhitespaceTextFormatterForDescriptionAndId:function(e,t,r){return o(u._getTextFormatterForDescriptionAndId.apply(u,arguments))},_getWhitespaceTextFormatterForIdAndDescription:function(e,t,r){return o(u._getTextFormatterForIdAndDescription.apply(u,arguments))},_getWhitespaceTextFormatterForDescriptionOnly:function(e,t,r){return o(u._getTextFormatterForDescriptionOnly.apply(u,arguments))},_getWhitespaceTextFormatterForIdOnly:function(e,t,r){return o(u._getTextFormatterForIdOnly.apply(u,arguments))},_getOverrideNoDataTextFormatterForDescriptionAndId:function(e,t,r){if(e==""&&t==""){return this.getNotAssignedText()}return u._getTextFormatterForDescriptionAndId.apply(u,arguments)},_getOverrideNoDataTextFormatterForIdAndDescription:function(e,t,r){if(e==""&&t==""){return this.getNotAssignedText()}return u._getTextFormatterForIdAndDescription.apply(u,arguments)},_getOverrideNoDataTextFormatterForDescriptionOnly:function(e,t,r){if(t==""){return this.getNotAssignedText()}return u._getTextFormatterForDescriptionOnly.apply(u,arguments)},_getOverrideNoDataTextFormatterForIdOnly:function(e,t,r){if(e==""){return this.getNotAssignedText()}return u._getTextFormatterForIdOnly.apply(u,arguments)},getTextsFromDisplayBehaviour:function(e,t,r){return u.getFormatterFunctionFromDisplayBehaviour(e)(t,r,true)},getFormattedRangeText:function(e,t,n,i){return r.getFormatedConditionText(e,t,n,i)},_initialiseCurrencyFormatter:function(){if(!u._oCurrencyFormatter){u._oCurrencyFormatter=e.getCurrencyInstance({showMeasure:false})}if(!u._fAmountCurrencyFormatter){u._fAmountCurrencyFormatter=function(e,t){var r,n;r=u._oCurrencyFormatter.format(e,t);n=u._oCurrencyFormatter.oLocaleData.getCurrencyDigits(t);return u._applyPadding(r,n,u.MAX_CURRENCY_DIGITS)}}},_initialiseUnitFormatter:function(){if(!u._oUnitFormatter){u._oUnitFormatter=e.getUnitInstance({showMeasure:false,maxFractionDigits:3,minFractionDigits:3})}if(!u._fMeasureUnitFormatter){u._fMeasureUnitFormatter=function(e,t){return u._oUnitFormatter.format(e,t)}}},_applyPadding:function(e,t,r){var n;if(typeof e!=="string"){return""}if(t===0&&r>0){e+=u.CHAR_PUNCTUATION_SPACE}n=r-t;if(n){e=e.padEnd(e.length+n,u.CHAR_FIGURE_SPACE)}return e},_getFractionDigitDifference:function(e,t,r,n){if(!t){return 0}var i=t.indexOf(e.oOutputFormat.oFormatOptions.decimalSeparator);if(i<0){return 0}var a=t.substr(i+1).length;if(a<=n&&a>r){return a-r}if(a>n&&r<n){return n-r}return 0},getAmountCurrencyFormatter:function(e){var t=0,r,n;u._initialiseCurrencyFormatter();return function(i,a,o){var s,c;if(i===undefined||i===null||a==="*"){return""}if(!o){return u._fAmountCurrencyFormatter(i,a)}if(!n){n=o;t=u._getMaxCurrencyFractionDigits(n);if(!r){r=u._getCurrencyInstance(e)}}c=n&&n[a]?n[a].UnitSpecificScale:u._oCurrencyFormatter.oLocaleData.getCurrencyDigits(a);s=r.formatValue([i,a||null,n],"string");if(e){c+=u._getFractionDigitDifference(r,s,c,t)}return u._applyPadding(s,c,t)}},_getMaxCurrencyFractionDigits:function(e){var t=0;for(var r in e){if(e[r].UnitSpecificScale&&e[r].UnitSpecificScale>t){t=e[r].UnitSpecificScale}}return t},_getCurrencyInstance:function(e){return new i({showMeasure:false,preserveDecimals:e})},getCurrencySymbolFormatter:function(){u._initialiseCurrencyFormatter();if(!u._fCurrencySymbolFormatter){u._fCurrencySymbolFormatter=function(e){if(!e||e==="*"){return""}return u._oCurrencyFormatter.oLocaleData.getCurrencySymbol(e)}}return u._fCurrencySymbolFormatter},getMeasureUnitFormatter:function(e){u._initialiseUnitFormatter();var t=0,r,n;return function(i,a,o){if(i===undefined||i===null||a==="*"){return""}if(o){if(!n){n=o;t=u._getMaxMeasureUnitFractionDigit(n);if(!r){r=u._getUnitInstance(e,t)}}i=r.formatValue([i,a,n],"string");var s=n[a]&&n[a].UnitSpecificScale!=null?n[a].UnitSpecificScale:t;if(e){s+=u._getFractionDigitDifference(r,i,s,t)}return u._applyPadding(i,s,t)}return u._fMeasureUnitFormatter(i,a)+u.CHAR_FIGURE_SPACE}},getInlineMeasureUnitFormatter:function(e){var t=0,r,n;if(!u._fInlineMeasureFormatter){u._fInlineMeasureFormatter=function(e,t){if(e===undefined||e===null||t==="*"){return""}if(!t){return e}return e+u.CHAR_FIGURE_SPACE+t}}return function(i,a,o){if(o){if(!n){n=o;t=u._getMaxMeasureUnitFractionDigit(n);if(!r){r=u._getUnitInstance(e,t)}}i=r.formatValue([i,a,n],"string");return i+u.CHAR_FIGURE_SPACE+a}return u._fInlineMeasureFormatter(i,a)}},_getUnitInstance:function(e,t){return new a({showMeasure:false,preserveDecimals:e,maxFractionDigits:t})},_getMaxMeasureUnitFractionDigit:function(e){var t=0;for(var r in e){var n=e[r].UnitSpecificScale;if(n>3){e[r].UnitSpecificScale=3;n=3}if(t<3&&n>t&&n<=3){t=n}}return t},getInlineAmountFormatter:function(e){var t,r;u._initialiseCurrencyFormatter();if(!u._fInlineAmountFormatter){u._fInlineAmountFormatter=function(e,t){var r;if(e===undefined||e===null||t==="*"){return""}r=u._oCurrencyFormatter.format(e,t);return r+u.CHAR_FIGURE_SPACE+t}}return function(n,i,a){if(n===undefined||n===null||i==="*"){return""}if(!a){return u._fInlineAmountFormatter(n,i)}if(!r){r=a;if(!t){t=u._getCurrencyInstance(e)}}var o=t.formatValue([n,i||null,r],"string");return o+u.CHAR_FIGURE_SPACE+i}},getInlineGroupFormatterFunction:function(e,t,r,i,a,o){var s=e.type==="Edm.String"&&!e.isCalendarDate&&!e.isDigitSequence;if(e.unit){return u.getRelevantUnitFormatterFunction(o,e,i)}else if(!t&&s&&e.description){return u.getFormatterFunctionFromDisplayBehaviour(e.displayBehaviour,a)}else if(e.type==="Edm.DateTime"&&e.displayFormat==="Date"&&r&&r["UTC"]){var c={displayFormat:"Date"};var f={isCalendarDate:e.isCalendarDate};var m=n.getType(e.type,r,c,f);return function(e){return m.formatValue(e,"string")}}else if(e.modelType){return function(t){return e.modelType.formatValue(t,"string")}}},getWidth:function(e,t,r){var n=e.maxLength||e.precision,i,a;if(!t){t=30}if(!r){r=3;a=true}if(e.type==="Edm.DateTime"&&e.displayFormat==="Date"||e.isCalendarDate){n="9em"}else if(n){if(e.type==="Edm.String"&&e.description&&e.displayBehaviour&&(e.displayBehaviour==="descriptionAndId"||e.displayBehaviour==="descriptionOnly")){n="Max"}if(n==="Max"){n=t+""}i=parseInt(n);if(!isNaN(i)){i+=.75;if(i>t){i=t}else if(i<r){i=r}n=i+"em"}else{n=null}}if(!n){if(e.type==="Edm.Boolean"){if(a){r+=.25}n=r+"em"}else{n=t+"em"}}return n},getEdmTimeFromDate:function(e){if(!u._oTimeFormat){u._oTimeFormat=t.getTimeInstance({pattern:"'PT'HH'H'mm'M'ss'S'"})}return u._oTimeFormat.format(e)},parseFilterNumericIntervalData:function(e){var t=[],r=e.match(RegExp("^(-?[^-]*)-(-?[^-]*)$"));if(r&&r.length>=2){t.push(r[1]);t.push(r[2])}return t},parseDateTimeOffsetInterval:function(e){var t=e.split("-"),r=[e],n=0;if(t.length%2===0){r=[];for(var i=0;i<t.length/2;i++){n=e.indexOf("-",++n)}r.push(e.substr(0,n).replace(/\s+/g,""));r.push(e.substr(n+1).replace(/\s+/g,""))}return r},_getFilterType:function(e){if(e.isFiscalDate){return"date"}else if(e.isDigitSequence){return"numc"}else if(n.isNumeric(e.type)){return"numeric"}else if(e.type==="Edm.DateTime"&&e.displayFormat==="Date"){return"date"}else if(e.type==="Edm.DateTimeOffset"){return"datetime"}else if(e.type==="Edm.String"){if(e.isCalendarDate){return"stringdate"}return"string"}else if(e.type==="Edm.Guid"){return"guid"}else if(e.type==="Edm.Boolean"){return"boolean"}else if(e.type==="Edm.Time"){return"time"}return undefined},getWhitespaceReplacer:function(e){return e?o:undefined},getDateTimeWithTimezoneFormatter:function(e){if(!e&&!u._oDateTimeWithTimezone){u._oDateTimeWithTimezone=t.getDateTimeWithTimezoneInstance()}return function(r,n){if(!r){return""}return e?t.getDateTimeWithTimezoneInstance(e).format(r,n):u._oDateTimeWithTimezone.format(r,n)}},getRelevantUnitFormatterFunction:function(e,t,r){var n,i=t.isCurrencyField,a=i?u.getInlineAmountFormatter(r):u.getInlineMeasureUnitFormatter(r);if(e){if(i){e.requestCurrencyCodes().then(function(e){n=e})}else{e.requestUnitsOfMeasure().then(function(e){n=e})}}return function(e,r){if(!n){if(i){return a(e,r)}if(t.modelType){e=t.modelType.formatValue(e,"string")}return a(e,r)}return a(e,r,n)}}};return u},true);
//# sourceMappingURL=FormatUtil.js.map