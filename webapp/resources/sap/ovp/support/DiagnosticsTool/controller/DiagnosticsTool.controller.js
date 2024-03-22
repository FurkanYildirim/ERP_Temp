/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/MessageToast","sap/m/MessageBox","sap/ovp/support/lib/Documentation","sap/ui/thirdparty/jquery","sap/ovp/app/OVPLogger"],function(e,t,o,a,jQuery,r){"use strict";var i=new r("OVP.controller.DiagnosticsTool");function n(){this.getView().attachAfterRendering(function(){u()})}function s(){var e=this.getView().getModel("data");if(e.getProperty("/status")==="Loading"){t.show("Application is still loading");return}var o=(new Date).toLocaleTimeString([],{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"});e.setData({properties:null,retrieval:o,copyEnabled:false});e.updateBindings();this.getView().getViewData().plugin.onRefresh()}function l(){var e="\r\n";var r="- ";var i=this.getView().getModel("data").getData();if(!(i&&i.properties&&i.url)){o.error("Could not copy data to your clipboard! No data collected",{title:"Error"});return}var n=i.properties;var s="*************+Extracted by SAP Fiori Elements Diagnostics Plugin [FEDiagnosticOVP]+*************"+e;s+=r+"Extracted on "+(new Date).toUTCString()+e;s+=r+"Host: "+i.origin+e;s+=r+"Application status: "+i.status+e;if(i.statusMessage){s+=r+"Notice: "+i.statusMessage+e}s+=r+"Documentation: "+a.getDocuURL()+e;s+=e;s+="APP DATA"+e;for(var l=0,c=n.length;l<c;l++){if(n[l].type==="string"){s+=r+n[l].name+": "+n[l].value+e}else if(n[l].type==="link"){s+=r+n[l].name+": "+n[l].target+e}else if(n[l].type==="group"){s+="Group: "+n[l].name+e}}s+=e;s+="**************************"+e;s+=e;s+=e;s+="PROVIDE"+e;s+=r+"User/Password: <user>/<password>"+e;s+=r+"Steps to recreate the issue: <maybe also provide master data, pictures or video…>"+e;var d=this.getView().byId("CopyDataTextArea").getId();var u=document.getElementById(d);u.style.display="block";u.value=s;u.select();try{var p=document.execCommand("copy");if(p){t.show("Ticket relevant information copied to clip board")}else{o.error("Could not copy data to your clipboard! You can copy it manually from here: "+e+e+s,{title:"Error"})}}catch(t){o.error("Could not copy data to your clipboard! You can copy it manually from here: "+e+e+s,{title:"Error"})}finally{u.style.display="none"}}function c(){var e="<br/>",r="</span>"+e,i="<span>",n=i+"- ",s=this.getView().getModel("data").getData();if(!(s&&s.properties&&s.url)){o.error("Could not copy data to your clipboard! No data collected",{title:"Error"});return}var c=s.properties,d=document.getElementById(this.getView().byId("CopyDataHTML").getId()),u=d[0];var p=i+"*************+Extracted by SAP Fiori Elements Diagnostics Plugin [FEDiagnosticOVP]+*************"+r;p+=n+"Extracted on "+(new Date).toUTCString()+r;p+=n+'Host: <a href="'+s.url+'" rel="noopener noreferrer">'+s.origin+"</a>"+r;p+=n+"Application status: "+s.status+r;if(s.statusMessage){p+=n+"Notice: "+s.statusMessage+r}p+=n+"Documentation: "+'<a href="'+a.getDocuURL()+'" rel="noopener noreferrer">'+a.getDocuURL()+"</a>"+r;p+=e;p+=i+"APP DATA"+r;for(var g=0,f=c.length;g<f;g++){if(c[g].type==="string"){p+=n+c[g].name+": "+c[g].value+r}else if(c[g].type==="link"){p+=n+c[g].name+': <a href="'+c[g].target+'" rel="noopener noreferrer">'+c[g].value+"</a>"+r}else if(c[g].type==="group"){p+=i+"Group: "+c[g].name+r}}p+=i+"**************************"+r;p+=e;p+=i+"PROVIDE"+r;p+=i+"User/Password: &lt;user&gt;/&lt;password&gt;"+r;p+=i+"Steps to recreate the issue: &lt;maybe also provide master data, pictures or video…&gt;"+r;function m(){try{document.getSelection().removeAllRanges()}catch(e){return function(){}}}d.empty();u.insertAdjacentHTML("beforeend",p);try{var y=document.createRange();m();y.selectNode(u);document.getSelection().addRange(y);document.execCommand("copy");m();t.show("Ticket relevant information copied to clip board with HTML format")}catch(e){m();l()}finally{d.empty()}}function d(){a.openDocumentation()}function u(){var e=jQuery(".diagnosticPropertiesGroupHeaderContent");if(e.length===0){i.debug("No headers found which should be customized");return}var t,o,a;for(var r=0;r<e.length;r++){t=jQuery(e[r]);o=t.parents("td:first");a=jQuery("#"+o[0].id);a.addClass("diagnosticPropertiesGroupHeader");a.attr("colspan",2);a.next().remove()}}function p(e,t){var o=this.getView().getModel("data");o.setData({timeLeft:e,status:t})}function g(){if(window.fioriElementsPluginID){var e=document.getElementById(window.fioriElementsPluginID);if(e&&e.parent()&&!e.parent().hasClass("sapUiSupportHidden")){t.show("Data refreshed")}}}return e.extend("sap.ovp.support.DiagnosticsTool.controller.DiagnosticsTool",{onInit:n,onRefreshData:s,onCopyDataPlain:l,onCopyDataHTML:c,onShowDocumentation:d,updateStatus:p,showDataRefreshed:g})});
//# sourceMappingURL=DiagnosticsTool.controller.js.map