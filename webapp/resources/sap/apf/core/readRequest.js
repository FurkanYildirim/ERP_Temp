/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/core/request","sap/apf/utils/exportToGlobal"],function(e,t){"use strict";function a(e,t,a,s){var n=e.instances.coreApi;var r=e.instances.messageHandler;this.type="readRequest";this.send=function(e,a,s){var n;var i=function(e,t){var s;var n;var i=[];if(e&&e.type&&e.type==="messageObject"){r.putMessage(e);s=e}else{i=e.data;n=e.metadata}a(i,n,s)};if(e){n=e.getInternalFilter()}else{n=new sap.apf.core.utils.Filter(r)}t.sendGetInBatch(n,i,s)};this.getMetadata=function(){return n.getEntityTypeMetadata(a,s)};this.getMetadataFacade=function(){return n.getMetadataFacade(a)}}t("sap.apf.core.ReadRequest",a);return a});
//# sourceMappingURL=readRequest.js.map