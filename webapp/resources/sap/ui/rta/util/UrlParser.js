/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var e={};e.getParam=function(r){return e.getParams()[r]};e.getParams=function(e){e=e||e===""?e:document.location.search;return e.replace(/^\?/,"").split("&").reduce(function(e,r){var t=r.split("=");var a=t[1];switch(a){case"true":a=true;break;case"false":a=false;break;default:break}e[t[0]]=a;return e},{})};return e},true);
//# sourceMappingURL=UrlParser.js.map