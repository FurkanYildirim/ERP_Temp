/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ovp/cards/AnnotationHelper","sap/ui/model/odata/AnnotationHelper","sap/ovp/cards/MetadataAnalyser"],function(e,t,r){"use strict";function a(e){var t=[];var r,a;var n=e.getProperty("/sortBy");if(n){var i=e.getProperty("/sortOrder");if(i&&i.toLowerCase()!=="descending"){a=false}else{a=true}r={path:n,descending:a};t.push(r)}return t}function n(t,n,i){var o=t.getSetting("ovpCardProperties");var s=o.getProperty("/metaModel");var f=e.isODataV4Context(t);var u=f?n:s.getODataEntityType(n.entityType);var l=f?"/"+o.getProperty("/entitySet"):"/"+n.name;var d;var p=o.getProperty("/selectionAnnotationPath");if(f&&p){var g="@"+p;d=s.getData()["$Annotations"][u.$Type][g]}else{d=u[p]}var c;var y=o.getProperty("/layoutDetail");if(y==="resizable"){var v=o.getProperty("/cardLayout");if(v){if(o.getProperty("/listFlavor")==="standard"){var P="";for(var x in i){P+=x}var m=o.getProperty("/cardLayout/iRowHeigthPx");if(m===undefined){m=16}var h;if(o.getProperty("/densityStyle")==="cozy"){h=72;if(P.indexOf("Description")===-1&&(P.indexOf("Title")>0&&P.indexOf("ImageUrl")>0||P.indexOf("Title")>0&&P.indexOf("TypeImageUrl")>0)){h=56}else if(P.indexOf("Description")===-1&&P.indexOf("Title")>0){h=48}}else{h=60;if(P.indexOf("Description")===-1&&(P.indexOf("Title")>0&&P.indexOf("ImageUrl")>0||P.indexOf("Title")>0&&P.indexOf("TypeImageUrl")>0)){h=48}else if(P.indexOf("Description")===-1&&P.indexOf("Title")>0){h=40}}o.setProperty("/cardLayout/itemHeight",h);if(!o.getProperty("/defaultSpan")&&o.getProperty("/cardLayout/autoSpan")){c=o.getProperty("/cardLayout/noOfItems");var O=Math.ceil((c*h+o.getProperty("/cardLayout/headerHeight")+2*o.getProperty("/cardLayout/iCardBorderPx"))/m);o.setProperty("/cardLayout/noOfItems",O)}else{var I=Math.floor(v.rowSpan*m-o.getProperty("/cardLayout/headerHeight")-2*o.getProperty("/cardLayout/iCardBorderPx"));c=Math.floor(I/h)*v.colSpan}}}}else{c=6}var C=t.getSetting("ovpCardProperties"),S=C.getProperty("/parameters");if(d||!!S){if(d&&d.Parameters||!!S){l=r.resolveParameterizedEntitySet(t.getSetting("dataModel"),n,d,S)}}var L="{path: '"+l+"', length: "+c;var w=a(o);if(w.length>0){L=L+", sorter:"+JSON.stringify(w)}var D=e.getFilters(o,d,f);if(D.length>0){L=L+", filters:"+JSON.stringify(D)}var U=e.checkFilterPreference(o);if(f){if(U){L=L+", parameters:{custom: {cardId: '"+o.getProperty("/cardId")+"'}}"}}else{if(U){L=L+", parameters:{custom: {cardId: '"+o.getProperty("/cardId")+"', _requestFrom: 'ovp_internal'}}"}else{L=L+", parameters:{custom: {_requestFrom: 'ovp_internal'}}"}}L=L+"}";return L}n.requiresIContext=true;function i(e,t){var r=e.getModel().getProperty("/baseUrl");return p(r,t)}i.requiresIContext=true;function o(e,r){var a=true;var n=t.format(e,r);if(n.toLowerCase().indexOf("icon")>0){a=false}return a}o.requiresIContext=true;function s(e){var t=true;if(!e){return null}else if(e.toLowerCase().indexOf("icon")>0){t=false}return t}function f(e){var t=new RegExp("http(s)?://(www.)?[a-z0-9]+([-.]{1}[a-z0-9]+)*.[a-z]{2,5}(:[0-9]{1,5})?(/.*)?","i");return t.test(e)}function u(t,r){var a=e.isODataV4Context(t);var n;if(!a){if(r.hasOwnProperty("Path")){n="{"+r.Path+"}"}else{n=r.String}}else{if(r.hasOwnProperty("$Path")){n="{"+r.$Path+"}"}else{n=r}}return n}u.requiresIContext=true;function l(t,r){var a=e.isODataV4Context(t);return a?"{"+r+"}":"{"+r.String+"}"}l.requiresIContext=true;function d(e){if(e){return 1}return 0}function p(e,t){if(!t){return undefined}else if(t.lastIndexOf(e,0)===0||t.indexOf("://")>0){return t}else if(t.lastIndexOf("/",0)===0){return e+t}else{return e+"/"+t}}function g(e,t,r){var a;if(typeof r==="object"){a=r[e]}else{a=typeof r==="boolean"?r:true}return!t[e]&&a}function c(e,t,r){var a="";if(e){if(t&&r){a="#"+t+"-"+r;for(var n=0;n<e.length;n++){if(e[n].value===a){return e[n].name}}a=""}else{return e[0].name}}return a}function y(e,t){return p(e.baseUrl,t)}function v(e){return this.getModel("contentRow").aBindings[0].getContext().getPath().replace("/staticContent/","")}function P(t,r){var a=e.isODataV4Context(t);if(!a){return r.Path&&"{"+r.Path+"}"||r.String||""}else{return r.$Path&&"{"+r.$Path+"}"||r||""}}P.requiresIContext=true;return{formatItems:n,formatUrl:i,isImageUrl:o,isImageUrlStaticData:s,isValidURL:f,getIconPath:u,formatString:l,linkedAction:d,formUrl:p,isVisible:g,getApplicationName:c,getImageUrl:y,contentRowIndex:v,getAvatarInitials:P,getSorters:a}},true);
//# sourceMappingURL=AnnotationHelper.js.map