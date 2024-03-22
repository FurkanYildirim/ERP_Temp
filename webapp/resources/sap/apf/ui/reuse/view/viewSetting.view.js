/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/m/ViewSettingsDialog","sap/m/ViewSettingsItem","sap/ui/core/mvc/JSView"],function(e,t){"use strict";sap.ui.jsview("sap.apf.ui.reuse.view.viewSetting",{getControllerName:function(){return"sap.apf.ui.reuse.controller.viewSetting"},createContent:function(a){var n=this.getViewData().oTableInstance;var i=n.tableControl;var r=[];i.getColumns().forEach(function(e){var a=new t({text:e.getCustomData()[0].getValue().text,key:e.getCustomData()[0].getValue().key});r.push(a)});var o=new e({sortItems:r,confirm:a.handleConfirmForSort.bind(a),cancel:a.handleCancel.bind(a)});return o}})});
//# sourceMappingURL=viewSetting.view.js.map