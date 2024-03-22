/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/thirdparty/jquery"],function(t,jQuery){"use strict";var e=t.extend("sap.ui.comp.navpopover.Log",{constructor:function(){this.reset()}});e.prototype.reset=function(){this._oLog={semanticObjects:[],intents:[]};return this};e.prototype.createSemanticObjectStructure=function(t){this._oLog.semanticObjects[t]={attributes:{},intents:[]}};e.prototype.addIntent=function(t){this._oLog.intents.push(t);return this};e.prototype.addSemanticObjectAttribute=function(t,e,n){if(!this._oLog.semanticObjects[t]){this.createSemanticObjectStructure(t)}this._oLog.semanticObjects[t].attributes[e]=n;return this};e.prototype.addSemanticObjectIntent=function(t,e){if(!this._oLog.semanticObjects[t]){this.createSemanticObjectStructure(t)}this._oLog.semanticObjects[t].intents.push(e);return this};e.prototype.updateSemanticObjectAttributes=function(t,e,n){if(!this._oLog.semanticObjects[t]){this.createSemanticObjectStructure(t)}var i,r;var o=Object.keys(n);for(var s in n){if(this._oLog.semanticObjects[t].attributes[s]){i=this._oLog.semanticObjects[t].attributes[s].transformations;r=i[i.length-1];if(n[s]!==r["value"]){this._oLog.semanticObjects[t].attributes[s].transformations.push({value:n[s],description:"ℹ Value of the attribute has been changed in an event handler.",reason:"🔴 Is changed in the event handler of the event BeforePopoverOpens for the SmartLink control. Please check the implementation if the result is not what you expected."})}}else{this.addSemanticObjectAttribute(t,s,{transformations:[{value:n[s],description:"ℹ The attribute has been added in an event handler.",reason:"🔴 Is added in the event handler of the event BeforePopoverOpens for the SmartLink control. Please check the implementation if the result is not what you expected."}]})}}for(var a in e){if(o.indexOf(a)<0&&this._oLog.semanticObjects[t].attributes[a]){this._oLog.semanticObjects[t].attributes[a].transformations.push({value:undefined,description:"ℹ The attribute has been removed in an event handler.",reason:"🔴 Is removed in the event handler of the event BeforePopoverOpens for the SmartLink control. Please check the implementation if the result is not what you expected."})}}return this};e.prototype.getFormattedText=function(){var t=function(t){return typeof t==="string"?"'"+t+"'":t};var e=function(e,n){var i={value:"• "+n+" : ",description:""};e.forEach(function(e,n){i.value=i.value+(n>0?"  ➜  ":"")+t(e["value"]);i.description=i.description+"…   "+e["description"]+"\n";if(e["reason"]){i.description=i.description+"…   "+e["reason"]+"\n"}});return i};var n=function(t){var e="";t.forEach(function(t){e+="• '"+t.text+"' : "+t.intent+"\n"});return e};var i=function(t){try{var e=sap.ui.getCore().getConfiguration().getLocale().toString();if(typeof window.Intl!=="undefined"){var n=window.Intl.Collator(e,{numeric:true});t.sort(function(t,e){return n.compare(t,e)})}else{t.sort(function(t,n){return t.localeCompare(n,e,{numeric:true})})}}catch(t){}};var r="";for(var o in this._oLog.semanticObjects){r=r+"\n⬤"+" "+o+"\n";if(jQuery.isEmptyObject(this._oLog.semanticObjects[o].attributes)){r+="……  🔴 No semantic attributes available for semantic object "+o+". Please be aware "+"that without semantic attributes no URL parameters can be created.\n"}else{var s=Object.keys(this._oLog.semanticObjects[o].attributes);i(s);for(var a=0;a<s.length;a++){var c=s[a];var u=e(this._oLog.semanticObjects[o].attributes[c].transformations,c);r+=u.value+"\n";r+=u.description}}if(this._oLog.semanticObjects[o].intents.length){r+="\nIntents returned by FLP for semantic object "+o+":\n";r+=n(this._oLog.semanticObjects[o].intents)}}if(this._oLog.intents.length){r+="\nIntents returned by event handler:\n";r+=n(this._oLog.intents)}return r};return e});
//# sourceMappingURL=Log.js.map