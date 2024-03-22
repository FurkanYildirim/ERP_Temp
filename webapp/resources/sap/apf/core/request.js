/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/utils/utils","sap/apf/core/utils/filter","sap/apf/core/utils/filterTerm","sap/apf/core/utils/filterSimplify","sap/ui/thirdparty/jquery"],function(e,t,a,r,jQuery){"use strict";var s=function(t,a){var s=t.instances.messageHandler;var n=t.instances.coreApi;var i=a.service;var o=a.selectProperties;var c=n.getUriGenerator();var u;if(i===undefined){u=s.createMessageObject({code:"5015",aParameters:[a.id]});s.putMessage(u)}var d=n.getMetadata(i);this.type=a.type;this.sendGetInBatch=function(t,u,p,g){d.done(function(d){n.getXsrfToken(i).done(function(f){var v=d.getUriComponents(a.entityType);var l,b;if(v){l=v.entitySet;b=v.navigationProperty}s.check(l!==undefined,"Invalid request configuration: An entityset does not exist under the service "+a.entityType);s.check(b!==undefined,"Invalid request configuration: A usable navigation does not exist for the service "+a.entityType);var h;var _;A(t);if(t&&t.getProperties){h=t.restrictToProperties(d.getFilterableProperties(l));if(n.getStartParameterFacade().isFilterReductionActive()){_=new r.FilterReduction;h=_.reduceFilter(s,h)}}k(p);var y=p&&p.paging;var m=p&&p.orderby;var P=c.buildUri(s,l,o,h,t,m,y,undefined,T,b,d);var M=[{requestUri:P,method:"GET",headers:{"Accept-Language":sap.ui.getCore().getConfiguration().getLanguage(),"x-csrf-token":f}}];F();var O=c.getAbsolutePath(i);O=O+"$batch";var R={method:"POST",headers:{"x-csrf-token":f},requestUri:O,serviceMetadata:d.getODataModel().getServiceMetadata(),data:{__batchRequests:M}};var q=function(t,r){var i={};n.getEntityTypeMetadata(a.service,a.entityType).done(function(a){var n;try{var o="";if(t&&t.__batchResponses&&t.__batchResponses[0].data){i.data=t.__batchResponses[0].data.results;i.metadata=a;if(t.__batchResponses[0].data.__count){i.count=parseInt(t.__batchResponses[0].data.__count,10)}if(t.__batchResponses[1]&&t.__batchResponses[1].data){i.selectionValidation=t.__batchResponses[1].data.results}u(i,true)}else if(t&&t.__batchResponses[0]&&t.__batchResponses[0].response&&t.__batchResponses[0].message){o=r.requestUri;var c=t.__batchResponses[0].message;var d=t.__batchResponses[0].response.body;n=e.extractOdataErrorResponse(d);var p=t.__batchResponses[0].response.statusCode;i=s.createMessageObject({code:"5001",aParameters:[p,c,n,o]});s.putMessage(i)}else{o=r.requestUri||P;i=s.createMessageObject({code:"5001",aParameters:["unknown","unknown error","unknown error",o]});s.putMessage(i)}}catch(e){n=e&&e.message||"";window.console.trace("sap.apf.core.request catch exception: "+n);if(!s.isOwnException(e)){s.putMessage(s.createMessageObject({code:"5042",aParameters:[n]}))}}})};var j=function(e){var t="unknown error";var a;var r="unknown error";var n=P;if(e.message!==undefined){t=e.message}var i="unknown";if(e.response&&e.response.statusCode){i=e.response.statusCode;r=e.response.statusText||"";n=e.response.requestUri||P}if(e.messageObject&&e.messageObject.type==="messageObject"){s.putMessage(e.messageObject);u(e.messageObject)}else{a=s.createMessageObject({code:"5001",aParameters:[i,t,r,n]});s.putMessage(a);u(a)}};n.odataRequest(R,q,j,OData.batchHandler);function F(){if(g&&g.requiredFilterProperties&&g.selectionFilter){var e=h.copy();e.addAnd(g.selectionFilter);if(n.getStartParameterFacade().isFilterReductionActive()){e=_.reduceFilter(s,e)}var a=c.buildUri(s,l,g.requiredFilterProperties,e,t,undefined,undefined,undefined,T,b,d);M.push({requestUri:a,method:"GET",headers:{"Accept-Language":sap.ui.getCore().getConfiguration().getLanguage(),"x-csrf-token":f}})}}function T(t,a){var r="'";var s=d.getPropertyMetadata(l,t);if(s&&s.dataType){return e.formatValue(a,s)}if(typeof a==="number"){return a}return r+e.escapeOdata(a)+r}function k(e){var t,a;if(!e){return}t=Object.getOwnPropertyNames(e);for(a=0;a<t.length;a++){if(t[a]!=="orderby"&&t[a]!=="paging"){s.putMessage(s.createMessageObject({code:"5032",aParameters:[l,t[a]]}))}}}function A(e){var t=d.getFilterableProperties(l);var a="";var r=d.getEntityTypeAnnotations(l);var n;if(r.requiresFilter!==undefined&&r.requiresFilter==="true"){if(r.requiredProperties!==undefined){a=r.requiredProperties}}if(a===""){return}if(jQuery.inArray(a,t)===-1){n=s.createMessageObject({code:"5006",aParameters:[l,a]});s.putMessage(n)}var i=e.getProperties();if(jQuery.inArray(a,i)===-1){n=s.createMessageObject({code:"5005",aParameters:[l,a]});s.putMessage(n)}}})})}};sap.apf.core.Request=s;return s},true);
//# sourceMappingURL=request.js.map