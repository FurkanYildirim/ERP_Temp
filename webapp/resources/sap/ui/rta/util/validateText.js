/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/BindingParser","sap/ui/core/Core"],function(r,e){"use strict";var t=" ";var a={noEmptyText:{validatorFunction:function(r){return r!==t},errorMessage:e.getLibraryResourceBundle("sap.ui.rta").getText("RENAME_EMPTY_ERROR_TEXT")}};function o(e,t){if(t===e){throw Error("sameTextError")}var a;var o;try{a=r.complexParser(e,undefined,true)}catch(r){o=true}if(a&&typeof a==="object"||o){throw Error(sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("RENAME_BINDING_ERROR_TEXT"))}}return function(r,e,t){o(r,e);var i;var n=t&&t.validators||[];n.some(function(e){var t;if(typeof e==="string"&&a[e]){t=a[e]}else{t=e}if(!t.validatorFunction(r)){i=t.errorMessage;return true}return false});if(i){throw Error(i)}}},true);
//# sourceMappingURL=validateText.js.map