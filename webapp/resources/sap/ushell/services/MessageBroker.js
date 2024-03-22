// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/_MessageBroker/MessageBrokerEngine","sap/base/Log"],function(e,n){"use strict";var t={};var r=function(r,i,o){t=o&&o.config||{};e.setEnabled(this.isEnabled());if(!this.isEnabled()){n.warning("FLP's message broker service is disabled by shell configuration")}};r.prototype.isEnabled=function(){if(t.enabled===undefined||t.enabled===true){return true}return false};r.prototype.connect=function(n){return e.connect(n)};r.prototype.disconnect=function(n){return e.disconnect(n)};r.prototype.subscribe=function(n,t,r,i){return e.subscribe(n,t,r,i)};r.prototype.unsubscribe=function(n,t){return e.unsubscribe(n,t)};r.prototype.publish=function(n,t,r,i,o,s){return e.publish(n,t,r,i,o,s)};r.prototype.addAcceptedOrigin=function(n){e.addAcceptedOrigin(n)};r.prototype.removeAcceptedOrigin=function(n){e.removeAcceptedOrigin(n)};r.prototype.getAcceptedOrigins=function(){return e.getAcceptedOrigins()};r.hasNoAdapter=true;return r},false);
//# sourceMappingURL=MessageBroker.js.map