// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/bootstrap/common/common.debug.mode"],function(r){"use strict";var e=new Promise(function(e){var i="sap/ushell_abap/thirdparty/sap-xhrlib-esm"+(r.isDebug()?"-dbg":"")+".js";var t=sap.ui.require.toUrl(i);import(t).then(function(r){e(r.xhrlib)})});return{getLib:function(){return e}}});
//# sourceMappingURL=abap.xhrlogon.LibLoader.js.map