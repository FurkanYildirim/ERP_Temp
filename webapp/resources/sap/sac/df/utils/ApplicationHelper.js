/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/utils/ApplicationHelper",["sap/base/Log","sap/sac/df/thirdparty/lodash"],function(e,t){"use strict";e.info("ApplicationHelper loaded");function s(){function e(e,t,s,i){var a=e.createSystem();a.setName(i.systemName);a.setTimeout(1e4);a.setAuthenticationType(sap.firefly.AuthenticationType[i.authentication||"NONE"]);var r=sap.firefly.SystemType[i.systemType];a.setSystemType(r);a.setProtocolType(sap.firefly.ProtocolType[i.protocol]);a.setHost(i.host);a.setPort(i.port);if(s>0){a.setKeepAliveIntervalMs(s*1e3);a.setKeepAliveDelayMs(s*2*1e3)}e.setSystemByDescription(a);if(r===sap.firefly.SystemType.BW){a.setSessionCarrierType(sap.firefly.SessionCarrierType.SAP_CONTEXT_ID_HEADER);t.getConnectionPool().setMaximumSharedConnections(i.systemName,10)}}this.createApplication=function(s,i,a){var r=new Promise(function(e,t){sap.firefly.ApplicationFactory.createApplicationForDragonfly(function(s){if(s.hasErrors()){t(s.getErrors())}else{e(s.getData())}})});return r.then(function(r){var n=r.getProcess().getKernel().getSubSystemContainer(sap.firefly.SubSystemType.SYSTEM_LANDSCAPE);var o=n.getMainApi();r.setSystemLandscape(o);t.forEach(s,e.bind(null,o,r,a));o.setMasterSystemName(i);return r})}}return new s});
//# sourceMappingURL=ApplicationHelper.js.map