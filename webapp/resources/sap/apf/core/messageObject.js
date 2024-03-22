/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2018 SAP AG. All rights reserved
 */
sap.ui.define([],function(){"use strict";function t(t){var e=t.code;var r=t.aParameters||[];var n=t.oCallingObject;var i="";var s="";var a;var u=new Date;var o=t.rawText;this.type="messageObject";this.getCode=function(){return e};this.setCode=function(t){e=t};this.hasRawText=function(){return o!==undefined};this.getRawText=function(){return o};this.getMessage=function(){return i};this.setMessage=function(t){i=t};this.setSeverity=function(t){s=t};this.getSeverity=function(){return s};this.setPrevious=function(t){a=t};this.getPrevious=function(){return a};this.getCallingObject=function(){return n};this.getParameters=function(){return r};this.getStack=function(){if(this.stack){return this.stack}return""};this.getTimestamp=function(){return u.getTime()};this.getTimestampAsdateObject=function(){return u};this.getJQueryVersion=function(){return jQuery().jquery};this.getSapUi5Version=function(){return sap.ui.version}}sap.apf=sap.apf||{};sap.apf.core=sap.apf.core||{};sap.apf.core.MessageObject=t;t.prototype=new Error;t.prototype.constructor=sap.apf.core.MessageObject;return t},true);
//# sourceMappingURL=messageObject.js.map