/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/utils/exportToGlobal","sap/apf/utils/hashtable","sap/ui/thirdparty/jquery","sap/base/security/encodeXML","sap/base/strings/formatMessage","sap/ui/model/resource/ResourceModel"],function(e,t,jQuery,n,r,s){"use strict";function i(e){var i=e.instances.messageHandler;var u;var a=new t(i);var o=new t(i);var c=new t(i);var l={};var f=e.constructors&&e.constructors.ResourceModel||s;var d;this.getTextNotHtmlEncoded=function(e,t){var n;var r;var s;if(typeof e==="string"){r=e}else{i.check(e!==undefined&&e.kind!==undefined&&e.kind==="text"&&e.key!==undefined,"Error - oLabel is not compatible");r=e.key}s=JSON.stringify({textKey:r,parameters:t});if(a.hasItem(s)){return a.getItem(s)}n=g(r,t);a.setItem(s,n);return n};this.getTextHtmlEncoded=function(e,t){return n(this.getTextNotHtmlEncoded(e,t))};this.getMessageText=function(e,t){return h(e,t,false)};this.loadTextElements=function(e){var t,n;n=e.length;for(t=0;t<n;t++){o.setItem(e[t].TextElement,e[t].TextElementDescription)}};this.registerTextWithKey=function(e,t){l[e]=t};this.loadResourceModelAsPromise=function(e,t,n){var r=jQuery.Deferred();d=new f({bundleUrl:e,async:true});if(t!==undefined&&t!==""){d.enhance({bundleUrl:t,async:true}).then(function(){if(n!==undefined&&n!==""){d.enhance({bundleUrl:n,async:true}).then(function(){d.getResourceBundle().then(function(e){u=e;r.resolve()})})}else{d.getResourceBundle().then(function(e){u=e;r.resolve()})}})}else if(n!==undefined&&n!==""){d.enhance({bundleUrl:n,async:true}).then(function(){d.getResourceBundle().then(function(e){u=e;r.resolve()})})}else{d.getResourceBundle().then(function(e){u=e;r.resolve()})}return r.promise()};function h(e,t,n){if(t&&t.length===0){return u.getText(e,undefined,n)}return u.getText(e,t,n)}function g(e,t){var n;if(e===sap.apf.core.constants.textKeyForInitialText){return""}else if(l[e]){if(t&&t.length>0){return r(l[e],t)}return l[e]}else if(o.hasItem(e)){n=h(e,t,true);if(typeof n!=="string"||n===e){return o.getItem(e)}return n}else if(c.hasItem(e)){return c.getItem(e)}n=h(e,t,true);if(typeof n==="string"){return n}i.putMessage(i.createMessageObject({code:"3001",aParameters:[e],oCallingObject:this}));var s="# text not available: "+e;c.setItem(e,s);return s}}e("sap.apf.core.TextResourceHandler",i);return i});
//# sourceMappingURL=textResourceHandler.js.map