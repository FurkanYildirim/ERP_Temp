/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("sap.ca.ui.model.format.QuantityFormat");jQuery.sap.require("sap.ca.ui.model.format.NumberFormat");jQuery.sap.require("sap.ui.core.format.NumberFormat");jQuery.sap.require("sap.ui.core.LocaleData");jQuery.sap.require("sap.ca.ui.model.format.FormatHelper");sap.ca.ui.model.format.QuantityFormat=function(){throw new Error};sap.ca.ui.model.format.QuantityFormat.oValueInfo={oDefaultFormatOptions:{style:"standard",minFractionDigits:0}};sap.ca.ui.model.format.QuantityFormat.oQuantityModel=null;sap.ca.ui.model.format.QuantityFormat.getInstance=function(t,a,o){return this.createInstance(t,a,o,this.oValueInfo)};sap.ca.ui.model.format.QuantityFormat.createInstance=function(t,a,o,r){var i=jQuery.sap.newObject(this.prototype);if(a instanceof sap.ui.core.Locale){o=a;a=undefined}if(!o){i.oLocale=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()}else{i.oLocale=new sap.ui.core.Locale(o)}i.oLocaleData=sap.ui.core.LocaleData.getInstance(i.oLocale);i.oFormatOptions=jQuery.extend(false,{},r.oDefaultFormatOptions,a);i.init(t,a);return i};sap.ca.ui.model.format.QuantityFormat.prototype.init=function(t,a){if(a){if(a.minFractionDigits!=undefined){this.oFormatOptions.minFractionDigits=sap.ca.ui.model.format.FormatHelper.toNumeric(a.minFractionDigits);return}}if(t){if(!sap.ca.ui.model.format.QuantityFormat.oQuantityModel){sap.ca.ui.model.format.QuantityFormat.oQuantityModel=new sap.ui.model.json.JSONModel;var o=jQuery.sap.getModulePath("sap.ca.ui");sap.ca.ui.model.format.QuantityFormat.oQuantityModel.loadData(o+"/model/unit.json","",false)}var r=sap.ca.ui.model.format.QuantityFormat.oQuantityModel.getData();var i=r.length;var e=0,n=0;for(e=0;e<i;e++){if(r[e].ISOCode===t){this.oFormatOptions.minFractionDigits=r[e].Decimals;n=1;return}}for(e=0;e<i;e++){if(r[e].Code===t){this.oFormatOptions.minFractionDigits=r[e].Decimals;break}}}};sap.ca.ui.model.format.QuantityFormat.prototype.format=function(t){if(this.oFormatOptions.style==="short"){this.oFormatOptions.decimals=this.oFormatOptions.minFractionDigits;return sap.ca.ui.model.format.NumberFormat.getInstance(this.oFormatOptions,this.oLocale).format(t)}var a=sap.ca.ui.model.format.FormatHelper.toNumeric(t);if(!isFinite(a)){return""}var o,r,i=0;var e=3;if(a>1e20){return sap.ca.ui.model.format.QuantityFormat.getInstance({style:"short"}).format(a)}o=a.toFixed(this.oFormatOptions.minFractionDigits+e);r=o.length-1;while(o.charAt(r)==="0"&&i<=e){++i;--r}o=o.substring(0,r+1);return sap.ui.core.format.NumberFormat.getInstance(this.oFormatOptions,this.oLocale).format(o)};sap.ca.ui.model.format.QuantityFormat.prototype.parse=function(t){var a=sap.ca.ui.model.format.NumberFormat.getInstance(this.oFormatOptions,this.oLocale);return a.parse(t)};sap.ca.ui.model.format.QuantityFormat.FormatQuantityShort=function(t,a,o){return sap.ca.ui.model.format.QuantityFormat.getInstance(a,{style:"short",minFractionDigits:o}).format(t)};sap.ca.ui.model.format.QuantityFormat.FormatQuantityStandard=function(t,a,o){return sap.ca.ui.model.format.QuantityFormat.getInstance(a,{style:"standard",minFractionDigits:o}).format(t)};
//# sourceMappingURL=QuantityFormat.js.map