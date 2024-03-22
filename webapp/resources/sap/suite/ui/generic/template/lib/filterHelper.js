sap.ui.define(["sap/suite/ui/generic/template/genericUtilities/metadataAnalyser","sap/suite/ui/generic/template/lib/CommonUtils","sap/fe/navigation/SelectionVariant","sap/suite/ui/generic/template/lib/multipleViews/MultipleViewsHandler"],function(e,t,a,r){"use strict";var n={};function i(e){if(e){if(e.hasOwnProperty("SelectionVariantID")){delete e.SelectionVariantID}else if(e.hasOwnProperty("PresentationVariantID")){delete e.PresentationVariantID}delete e.Text;delete e.ODataFilterExpression;delete e.Version;delete e.FilterContextUrl;delete e.ParameterContextUrl;return e}return e}function o(e,t,a){var r;e.forEach(function(e){r=e&&e.Ranges;t.massAddSelectOption(a,r)})}function l(e){var t,r,n;var l=0;for(var s in e){var u=new a;if(e.hasOwnProperty(s)&&e[s]){t=e[s].value;if(t&&typeof t==="string"&&A(t)){t=JSON.parse(t);if(typeof t!=="object"){e[s].value=t.toString();continue}r=t.SelectOptions&&t.SelectOptions[0];if(r&&r.Ranges&&r.Ranges.length===1){n=r.Ranges[0]||{};if(n.Option==="EQ"&&!n.Low){r.Ranges=[];e[s].value=JSON.stringify(t)}}}else if(t&&Array.isArray(t)){var f,c;for(l=0;l<t.length;l++){f=JSON.parse(t[l]);c=f&&f.SelectOptions||[];o(c,u,s)}u=i(u&&u.toJSONObject());e[s].value=JSON.stringify(u)}}}}function s(e,t){var a,r="";t&&t.getAllFiltersWithValues().filter(function(n){a=n.getName();if(a.includes(e)||a===e){r=t&&t.getFilterData()&&t.getFilterData()[a]||""}});return r}function u(t,a,n,i){var o=[];var l=e.checkAnalyticalParameterisedEntitySet(t,a.name);var s=e.getParametersByEntitySet(t,a.name);if(l){o=r.fnResolveParameterizedEntitySet(a,s)||[]}else{if(s&&s.entitySetName){o=e.getPropertyOfEntitySet(t,s.entitySetName)||[]}}return o.filter(function(e){return e&&e.name===n})}function f(e,t,a,r){if(a){var n=u(e,t,a,r)||[],i=n[0]||{},o=i["com.sap.vocabularies.Common.v1.FilterDefaultValue"]||{},l=Object.keys(o)||[];return o[l[0]]||i.defaultValue}}function c(e,t){var a=t&&t.getFilterData();var r=a._CUSTOM&&a._CUSTOM["sap.suite.ui.generic.template.customData"];if(a&&(a["$Parameter."+e]||a[e])){return a["$Parameter."+e]||a[e]||""}else if(r&&(r["$Parameter."+e]||r[e])){return r["$Parameter."+e]||r[e]||""}}function g(e,t){var a=[];if(e){a=t&&t.property&&t.property.filter(function(t){return t&&t.name===e})||[]}var r=a&&a.length?a[0]:{};var n=r&&r["com.sap.vocabularies.Common.v1.FilterDefaultValue"]||{};var i=Object.keys(n);return r&&(i&&i.length&&n[i[0]]||r.defaultValue)}function p(e){var t;var a=[];if(e&&Array.isArray(e)){e.forEach(function(e){if(e){t=i(JSON.parse(e));a.push(JSON.stringify(t))}});return a}else if(e&&A(e)){t=i(JSON.parse(e));return JSON.stringify(t)}}function v(e){var t="";if(!e){return null}if(e.type){t=e.type.startsWith("Edm.")?e.type.split("Edm.")[1]:e.type}var a={Boolean:"boolean",Byte:"integer",SByte:"integer",Int16:"integer",Int32:"integer",Int64:"number",Single:"number",Double:"number",Float:"number",Decimal:"number",Guid:"string",String:"string",Date:"date",DateTime:"datetime",DateTimeOffset:"datetime",Time:"datetime",Binary:"",Stream:"",TimeOfDay:"",Duration:""};if(t&&t==="string"){return t}else if(t&&a[t]){return a[t]}else{return"string"}}function m(e){var t=[];var a=e&&e.RequestAtLeast||undefined;if(a){for(var r=0;r<a.length;r++){if(a[r].PropertyPath){t.push(a[r].PropertyPath)}}}return t}function d(e,t,a,r){var n="";if(Array.isArray(t)){t.filter(function(t){if(t&&t.includes(e.Low)){n=t}})}else if(typeof t==="string"){n=t}if(!n&&e.Low&&e.High){var i=a&&a.getFilterData()||{},o=i[r]||{};if(o.ranges){var l=o.ranges||[];var s=l.filter(function(t){return t.value1===e.Low});var u=s[0]||{};n=u.tokenText||""}}return n}function S(e,t,a,r){var n=e&&e.getUiState(),i=n&&n.getSelectionVariant(),o=i&&i.SelectOptions||[],l=false;o.filter(function(e){return e&&e["PropertyName"]===t}).map(function(n){l=true;var i=n&&n.Ranges||[];i.forEach(function(n){var i=d(n,r,e,t);a.addSelectOption(t,n.Sign,n.Option,n.Low,n.High,i)})});if(!l){a.addSelectOption(t,"I","EQ","")}}function y(e,t){var a;var r=/'/g;switch(e.Option){case"BT":a=t+" ge "+"'"+e.Low.replace(r,"''")+"'"+" and "+t+" le "+"'"+e.High.replace(r,"''")+"'";break;case"NB":a=t+" lt "+"'"+e.Low.replace(r,"''")+"'"+" or "+t+" gt "+"'"+e.High.replace(r,"''")+"'";break;case"EQ":case"GE":case"GT":case"LE":case"LT":case"NE":a=t+" "+e.Option.toLowerCase()+" "+"'"+e.Low.replace(r,"''")+"'";break;case"Contains":case"EndsWith":case"NotContains":case"NotEndsWith":case"NotStartsWith":case"StartsWith":a=e.Option.toLowerCase().replace("not","not ")+"("+t+","+"'"+e.Low.replace(r,"''")+"'"+")";break;default:throw new Error("Unsupported operator: "+e.Option)}return a}function O(e){var t=e["component"].getModel("_templPriv"),a=t.getProperty("/listReport/datePropertiesSettings");if(a){return a}}function T(e,t){var a=O(e);var r=t&&t.name;var n=a&&Object.keys(a);if(n&&n.length&&r){return n&&n.indexOf(r)>-1}else if(L(t)){var i=e["component"].getFilterSettings();return i&&i.dateSettings&&i.dateSettings.useDateRange}}function D(e){var t=O(e);var a=t&&Object.keys(t);if(a&&a.length){a.forEach(function(e){if(n[e]){var a=t[e]&&Object.keys(t[e])||[];a.forEach(function(a){if(a&&a!=="defaultValue"&&a!=="customDateRangeImplementation"){n[e][a]=t[e][a]}})}})}return n}function E(e,t){if(t){n[e.name]={"sap:filter-restriction":"single-value"}}else{n[e.name]={"sap:filter-restriction":e["sap:filter-restriction"]}}}function h(e){var t=Object.keys(n)||[];if(t.length&&e){return t.some(function(t){return e&&e.indexOf(t)>-1})}}function V(e,t){var a=O(e);if(a&&a[t]&&a[t]["defaultValue"]){return a[t]["defaultValue"]["operation"]}else{var r=e["component"].getFilterSettings();var n=r&&r.dateSettings&&r.dateSettings.fields;return n&&n[t]&&n[t]["defaultValue"]&&n[t]["defaultValue"]["operation"]}}function b(e,t){var a=e&&e.getUiState(),r=a&&a.getSelectionVariant(),n=r&&r.SelectOptions||[];var i=n.filter(function(e){return e&&e["PropertyName"]===t});i=i&&i[0]||[];var o=i.Ranges||[];return o&&o[0]}function R(e,t,a,r,n){if(e&&a){var i=e.conditionTypeInfo;return i&&i.data&&i.data["operation"]}if(!a){var o=c(t.name,r);var i=o&&o.conditionTypeInfo;var l=i&&i.data&&i.data["operation"];var s=o&&o["ranges"];var u=s&&s[0];if(l){switch(l){case"DATE":case"DATERANGE":case"SPECIFICMONTH":case"FROM":case"TO":var f=d({Low:u.Low},n,r,t.name);var g=b(r,t.name);if(g){g.Text=f;return g}break;case"LASTDAYS":case"LASTWEEKS":case"LASTMONTHS":case"LASTQUARTERS":case"LASTYEARS":case"NEXTDAYS":case"NEXTWEEKS":case"NEXTMONTHS":case"NEXTQUARTERS":case"NEXTYEARS":var p=i&&i.data&&i.data.value1;var f=d({Low:p},n,r,t.name);return{Low:l,High:p.toString(),Option:"BT",Text:f};case"TODAYFROMTO":var v=i&&i.data&&i.data.value1;var m=i&&i.data&&i.data.value2;var f=d({Low:v},n,r,t.name);return{Low:l,High:v.toString()+","+m.toString(),Option:"BT",Text:f};default:var f=d({Low:l},n,r,t.name)||"";f=f.substring(0,f.indexOf("(")-1);return{Low:l,High:null,Option:"EQ",Text:f}}}}}function N(e,t,a,r,n){var i=e.oSmartFilterbar,o=V(e,t.name)||a,l=R(null,t,false,i,n);if(l){r.addSelectOption(t.name,"I",l.Option,l.Low,l.High,l.Text)}else if(o){r.addSelectOption(t.name,"I","EQ",o,null,o)}}function P(e,t){if(t&&e){var a=t.getFiltersWithValues()||[],r="",n=a.filter(function(t){r=t&&t.getName();return r===e||"$Parameter."+e===r});var i=n&&n[0]&&n[0].getControl();if(i&&i.getMetadata()&&i.getMetadata().getName()==="sap.m.DynamicDateRange"){var o=i.getIdForLabel()||"";o=o.substring(0,o.lastIndexOf("-"));if(o){var l=sap.ui.getCore().byId(o);return l&&l.getValue()}}else if(i&&i.hasOwnProperty("value")){return i.getProperty("value")}else if(i&&typeof i.getTokens==="function"){var s=i.getTokens()||[],u=s.map(function(e){return e.getText()});return{type:"filters",value:u}}}}function w(e,t,a,r,n,i){var o=P(e,t);if(o&&typeof o==="string"){if(!a[e]){a[e]={}}a[e]["label"]=o;if(n){o=i?n:o}return o}else if(o&&o.value&&o.type==="filters"){return o.value}}function L(e){if((e["type"]==="Edm.DateTime"&&e["sap:display-format"]==="Date"||e["type"]==="Edm.String"&&e["com.sap.vocabularies.Common.v1.IsCalendarDate"]&&e["com.sap.vocabularies.Common.v1.IsCalendarDate"].Bool==="true")&&(e["sap:filter-restriction"]==="interval"||e["sap:filter-restriction"]==="single-value"||e["_filterRestriction"]==="single-value")){return true}return false}function A(e){try{if(JSON.parse(e)){return true}}catch(e){return false}}return{enhanceVariant:p,updateRangeValue:l,getPropertyType:v,getParameterValue:s,getRequestAtLeastFields:m,getFilterDefaultValue:g,getParameterDefaultValue:f,addFiltervalues:S,getParameterActualValue:c,removeExtraInfoVariant:i,getSingleFilterValue:y,getSemanticDateConfiguration:D,IsSemanticDateRangeValid:T,getDateRangeValue:R,getLabelForConfigParams:w,getRelatedTextToRange:d,setFilterRestrictionToSemanticDateRange:E,addDateRangeValueToSV:N,getDateRangeDefaultValue:V,IsSemanticDateExistsInUrl:h,isJSONData:A,isDate:L}});
//# sourceMappingURL=filterHelper.js.map