/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","sap/base/util/extend","sap/ui/core/CalendarType","sap/ui/core/format/DateFormat","sap/ui/model/FormatException","sap/ui/model/ParseException","sap/ui/model/ValidateException","sap/ui/model/odata/type/ODataType"],function(t,e,o,i,n,a,r,s){"use strict";function l(t){return sap.ui.getCore().getLibraryResourceBundle().getText("EnterTime",[t.formatValue("23:59:58","string")])}function u(t){var o;if(!t.oUiFormat){o=e({strictParsing:true},t.oFormatOptions);o.UTC=true;t.oUiFormat=i.getTimeInstance(o)}return t.oUiFormat}function f(e,o){var i,n;e.oConstraints=undefined;if(o){i=o.nullable;n=o.precision;if(i===false){e.oConstraints={nullable:false}}else if(i!==undefined&&i!==true){t.warning("Illegal nullable: "+i,null,e.getName())}if(n===Math.floor(n)&&n>0&&n<=12){e.oConstraints=e.oConstraints||{};e.oConstraints.precision=n}else if(n!==undefined&&n!==0){t.warning("Illegal precision: "+n,null,e.getName())}}}var p=s.extend("sap.ui.model.odata.type.TimeOfDay",{constructor:function(t,e){s.apply(this,arguments);this.oModelFormat=undefined;this.rTimeOfDay=undefined;this.oUiFormat=undefined;f(this,e);this.oFormatOptions=t}});p.prototype._handleLocalizationChange=function(){this.oUiFormat=null};p.prototype._resetModelFormatter=function(){this.oModelFormat=undefined};p.prototype.formatValue=function(t,e){var o,i,a;if(t===undefined||t===null){return null}a=this.getPrimitiveType(e);switch(a){case"any":return t;case"object":case"string":i=t.indexOf(".");if(i>=0){t=t.slice(0,i+4)}o=this.getModelFormat().parse(t);if(o){if(a==="object"){return new Date(1970,0,1,o.getUTCHours(),o.getUTCMinutes(),o.getUTCSeconds())}return u(this).format(o)}throw new n("Illegal "+this.getName()+" value: "+t);default:throw new n("Don't know how to format "+this.getName()+" to "+e)}};p.prototype.getFormat=function(){return u(this)};p.prototype.getModelFormat=function(){var t="HH:mm:ss",e;if(!this.oModelFormat){e=this.oConstraints&&this.oConstraints.precision;if(e){t+="."+"".padEnd(e,"S")}this.oModelFormat=i.getTimeInstance({calendarType:o.Gregorian,pattern:t,strictParsing:true,UTC:true})}return this.oModelFormat};p.prototype.getName=function(){return"sap.ui.model.odata.type.TimeOfDay"};p.prototype.parseValue=function(t,e){var o;if(t===""||t===null){return null}switch(this.getPrimitiveType(e)){case"object":return this.getModelFormat().format(t,false);case"string":o=u(this).parse(t);if(!o){throw new a(l(this))}return this.getModelFormat().format(o);default:throw new a("Don't know how to parse "+this.getName()+" from "+e)}};p.prototype.validateValue=function(t){var e;if(t===null){if(this.oConstraints&&this.oConstraints.nullable===false){throw new r(l(this))}return}if(!this.rTimeOfDay){e=this.oConstraints&&this.oConstraints.precision;this.rTimeOfDay=new RegExp("^(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d"+(e?"(\\.\\d{1,"+e+"})?":"")+")?$")}if(!this.rTimeOfDay.test(t)){throw new r("Illegal sap.ui.model.odata.type.TimeOfDay value: "+t)}};return p});
//# sourceMappingURL=TimeOfDay.js.map