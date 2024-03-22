/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
jQuery.sap.declare("sap.uiext.inbox.InboxUtils");jQuery.sap.require("sap.ui.model.odata.Filter");jQuery.sap.require("sap.uiext.inbox.InboxConstants");sap.uiext.inbox.InboxUtils=function(){throw new Error};sap.uiext.inbox.InboxUtils._getCategoryFilter=function(e){return new sap.ui.model.Filter("TaskDefinitionData/Category",sap.ui.model.FilterOperator.EQ,e)};sap.uiext.inbox.InboxUtils._getStatusFilters=function(e){return new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,e)};sap.uiext.inbox.InboxUtils._getPriorityFilters=function(e){return new sap.ui.model.Filter("Priority",sap.ui.model.FilterOperator.EQ,e)};sap.uiext.inbox.InboxUtils._getDueDateFilters=function(e){var t=new Date(0);var a=undefined;switch(e){case"Today":a=this._getFormattedDueDateTimeOff(1);break;case"Next_7_days":a=this._getFormattedDueDateTimeOff(7);break;case"Next_15_days":a=this._getFormattedDueDateTimeOff(15);break;case"Next_30_days":a=this._getFormattedDueDateTimeOff(30);break;case"No_Due_Date":return new sap.ui.model.Filter("CompletionDeadLine",sap.ui.model.FilterOperator.EQ,null)}return new sap.ui.model.odata.Filter("CompletionDeadLine",[{operator:sap.ui.model.FilterOperator.LE,value1:a.toUTCString()},{operator:sap.ui.model.FilterOperator.GE,value1:t.toUTCString()}],true)};sap.uiext.inbox.InboxUtils._getDateTimeFilters=function(e){var t=undefined;switch(e){case"Today":t=this._getFormattedDateTimeOff(0,false);break;case"Last_7_days":t=this._getFormattedDateTimeOff(7,false);break;case"Last_15_days":t=this._getFormattedDateTimeOff(15,false);break;case"Last_30_days":t=this._getFormattedDateTimeOff(30,false);break}return new sap.ui.model.Filter("CreatedOn",sap.ui.model.FilterOperator.GE,t.toUTCString())};sap.uiext.inbox.InboxUtils._getFormattedDueDateTimeOff=function(e){var t=new Date;t.setDate(t.getDate()+e);t.setMinutes(0);t.setHours(0);t.setSeconds(0);return t};sap.uiext.inbox.InboxUtils._getFormattedDateTimeOff=function(e,t){var a=new Date;a.setDate(a.getDate()-e);if(!t){a.setMinutes(0);a.setHours(0);a.setSeconds(0)}return a};sap.uiext.inbox.InboxUtils.inArray=function(e,t){var a=-1;jQuery.each(t,function(t,i){if(i[e]===e){a=t;return false}});return a};sap.uiext.inbox.InboxUtils._dateFormat=function(e){if(e!=undefined&&typeof e=="string"&&e!=""){var t;if(e.indexOf("Date")!=-1){t=new Date;t.setTime(e.substring(e.indexOf("(")+1,e.indexOf(")")))}else{t=new Date(e.substring(e.indexOf("'")+1,e.length-1))}e=t}if(e!=undefined&&e!=""){var a=sap.ui.core.format.DateFormat.getDateInstance({style:"medium"});return a.format(e)}return""};sap.uiext.inbox.InboxUtils.scrub=function(e){e=decodeURIComponent(e);e=e.replace(/[-:.\/]/g,"");e=e.replace(/-/g,"--");e=e.replace(/\s+/g,"-");if(!/^([A-Za-z_][-A-Za-z0-9_.:]*)$/.test(e)){if(/^[^A-Za-z_]/.test(e)){e=e.replace(/^[^A-Za-z_]/,"_")}e.replace(/[^-\w_.:]/g,"_")}return e};sap.uiext.inbox.InboxUtils.setCookieValue=function(e,t,a){var i="";if(a&&a>0){var n=new Date;n.setTime(n.getTime()+3600*1e3*24*365*a);i="expires="+n.toGMTString()}document.cookie=e+"="+escape(t)+"; "+i};sap.uiext.inbox.InboxUtils.getCookieValue=function(e){var t,a,i,n=document.cookie.split(";");for(t=0;t<n.length;t++){a=n[t].substr(0,n[t].indexOf("="));i=n[t].substr(n[t].indexOf("=")+1);a=a.replace(/^\s+|\s+$/g,"");if(a==e){return unescape(i)}}};sap.uiext.inbox.InboxUtils.deleteCookie=function(e){var t=new Date;document.cookie=e+"="+";expires=Thu, 01-Jan-1970 00:00:01 GMT"};sap.uiext.inbox.InboxUtils.reselectRowsinTable=function(e,t){var a=e[0];for(var i=0;i<e.length;i++){t.addSelectionInterval(e[i],e[i]);a=Math.min(e[i],a)}if(a){var n=Math.floor(a/10)*10;t.setFirstVisibleRow(n)}};sap.uiext.inbox.InboxUtils.deSelectOtherActionButtonsinStreamView=function(e){var t=e.getParent().getParent();if(t){var a=t.getCells();var i=a.length;for(var n=0;n<i;n++){var r=a[n].getContent()[0];if(r&&r!==e&&r instanceof sap.ui.commons.ToggleButton){if(r.getVisible()&&r.getPressed()){r.setPressed(false);r.firePress(false)}}}}};sap.uiext.inbox.InboxUtils._getDefaultFilter=function(){return new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.NE,"COMPLETED")};sap.uiext.inbox.InboxUtils._hasFilter=function(e,t,a,i,n){var r=false;if(e&&e.length>0){jQuery.each(e,function(e,o){if(o.sPath===t&&o.sOperator===a&&o.oValue1===i&&o.oValue2===n){r=true;return false}})}return r};sap.uiext.inbox.InboxUtils.tooltipFormatForDateTime=function(e){if(e!=undefined&&typeof e=="string"&&e!=""){var t;if(e.indexOf("Date")!=-1){t=new Date;t.setTime(e.substring(e.indexOf("(")+1,e.indexOf(")")))}else{t=new Date(e.substring(e.indexOf("'")+1,e.length-1))}e=t}if(e!=undefined&&e!=""){var a=sap.ui.core.format.DateFormat.getDateTimeInstance({style:"full"});return a.format(e)}return""};sap.uiext.inbox.InboxUtils.dateTimeFormat=function(e,t){if(e!=undefined&&typeof e=="string"&&e!=""){var a;if(e.indexOf("Date")!=-1){a=new Date;a.setTime(e.substring(e.indexOf("(")+1,e.indexOf(")")))}else{a=new Date(e.substring(e.indexOf("'")+1,e.length-1))}e=a}if(e!=undefined&&e!=""){var i=sap.ui.core.format.DateFormat.getDateInstance({style:"medium"});var n=sap.ui.core.format.DateFormat.getTimeInstance({style:"short"});if(t&&t===true)return i.format(e);else return i.format(e)+" "+n.format(e)}return""};sap.uiext.inbox.InboxUtils._isOverDue=function(e){if(e===undefined||e===null||e==="")return false;var t=(new Date).getTime();var a;if(typeof e==="string"){var i=e.substring(e.indexOf("(")+1,e.indexOf(")")-1);a=parseInt(i)-t<0?true:false}else{a=e.getTime()-t<0?true:false}return a};sap.uiext.inbox.InboxUtils.getUserMediaResourceURL=function(e,t,a){return e+"/"+sap.uiext.inbox.InboxConstants.UserInfoCollection+"("+sap.uiext.inbox.InboxConstants.sapOrigin+"='"+t+"',UniqueName='"+a+"')/$value"};sap.uiext.inbox.InboxUtils._getUniqueArray=function(e){function t(e,t){var a=[];var i,n;var r=e.length;var o=t.length;for(i=0;i<r;i++){for(n=0;n<o;n++){if(e[i]===t[n]){a.push(e[i])}}}return a}if(e.length==0)return[];else if(e.length==1)return e[0];var a=e[0];for(var i=1;i<e.length;i++){a=t(a,e[i])}return a};sap.uiext.inbox.InboxUtils._getFileTypeIcon=function(e){var t;switch(e){case"text/plain":t="attachment-text-file";break;case"image/jpeg":case"image/png":case"image/gif":case"image/x-icon":t="attachment-photo";break;case"application/pdf":t="pdf-attachment";break;case"application/mspowerpoint":case"application/vnd.ms-powerpoint":case"application/powerpoint":case"application/x-mspowerpoint":t="ppt-attachment";break;case"application/excel":case"application/x-excel":case"application/x-msexcel":case"application/vnd.ms-excel":t="excel-attachment";break;case"application/msword":t="doc-attachment";break;case"application/zip":t="attachment-zip-file";break;default:t="document"}return sap.ui.core.IconPool.getIconURI(t)};sap.uiext.inbox.InboxUtils._getFileSize=function(e){if(e){var t=["Bytes","KB","MB","GB","TB"];if(e==0)return"0 Byte";var a=parseInt(Math.floor(Math.log(e)/Math.log(1024)));var i;if(a>1){i=(e/Math.pow(1024,a)).toFixed(2)}else{i=Math.round(e/Math.pow(1024,a),2)}var n=i.toString()+" "+t[a];return n}};sap.uiext.inbox.InboxUtils.appendThemingParameters=function(e,t){var a=new URI(e);var i=a.search();a.search((!i?"?":i+"&")+t.replace(/^(\?|&)/,""));return a.toString()};sap.uiext.inbox.InboxUtils.calculateLengthofAssociativeArray=function(e){var t=0,a;for(a in e){if(e.hasOwnProperty(a))t++}return t};sap.uiext.inbox.InboxUtils.getErrorMessageFromODataErrorObject=function(e){var t="";var a="";if(e.hasOwnProperty("response")){try{a=JSON.parse(e.response.body)}catch(e){t=e.name+" : "+e.message;console.log(e.stack);return t}t=a.error.message.value+"\n"}return t};
//# sourceMappingURL=InboxUtils.js.map