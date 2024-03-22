/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("sap.ca.ui.utils.busydialog");jQuery.sap.require("sap.ca.ui.images.images");sap.ca.ui.utils.BUSYDIALOG_TIMEOUT=1500;sap.ca.ui.utils.busydialog=function(){var e="CA_BusyDialog";var a=null;var i=false;var u=0;var s=null;var l=function(u){if(!a){a=new sap.m.BusyDialog(e)}if(u&&u.text&&typeof u.text==="string"){a.setText(u.text)}if(!i){a.open();i=true}};var r=function(){if(s){jQuery.sap.clearDelayedCall(s);s=null}};var t=function(e){if(u>0){r();s=jQuery.sap.delayedCall(sap.ca.ui.utils.BUSYDIALOG_TIMEOUT,undefined,l,[e])}else{r();if(a){a.close();i=false;a.setText("")}}};return{requireBusyDialog:function(e){u++;t(e)},releaseBusyDialog:function(){u--;if(u<0){jQuery.sap.log.error("busy dialog released more often than required");u=0}t()},destroyBusyDialog:function(){if(a){a.destroy();a=null}}}}();
//# sourceMappingURL=busydialog.js.map