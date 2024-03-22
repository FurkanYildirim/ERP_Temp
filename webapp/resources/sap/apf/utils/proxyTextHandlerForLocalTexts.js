/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2018 SAP SE. All rights reserved
 */
sap.ui.define(["sap/apf/utils/exportToGlobal","sap/apf/utils/hashtable","sap/apf/utils/parseTextPropertyFile","sap/apf/utils/utils"],function(e,t,n,r){"use strict";var a=function(e){var a=e.instances.messageHandler;var i={};this.initApplicationTexts=function(e,r){var s=i[e]||new t(a);if(r===""||r===null){i[e]=s;return}var l=n(r,{instances:{messageHandler:a}});l.TextElements.forEach(function(e){if(e.TextElement){s.setItem(e.TextElement,e)}});i[e]=s};this.createTextFileOfApplication=function(e){if(!i[e]){return""}var t=r.renderHeaderOfTextPropertyFile(e,a);return t+r.renderTextEntries(i[e],a)};this.getTextElements=function(e){if(!i[e]){return[]}var t=[];i[e].each(function(e,n){t.push(n)});return t};this.addText=function(e){if(!e.TextElement){e.TextElement=r.createPseudoGuid(32)}var n=i[e.Application]||new t(a);n.setItem(e.TextElement,e);i[e.Application]=n;return e.TextElement};this.removeText=function(e){var n=e.application;var r=e.inputParameters[0].value;var s=i[n]||new t(a);if(s.hasItem(r)){s.removeItem(r)}}};e("sap.apf.utils.ProxyTextHandlerForLocalTexts",a);return a},true);
//# sourceMappingURL=proxyTextHandlerForLocalTexts.js.map