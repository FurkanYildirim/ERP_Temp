sap.ui.define([],function(){"use strict";function r(){}r.prototype.getFixedParamName=function(r){var e=null;e=r.replace(/^:/,"");return e};r.prototype.isEmptyArray=function(r){if(r.length===undefined||r.length===null||r.length===0){return true}return false};r.prototype.isInArray=function(r,e){return e.indexOf(r)>-1?true:false};r.prototype.removeInvertedCommas=function(r){var e=null;e=r.replace(/(^")|("$)/g,"");return e};r.prototype.removeSingleQuotes=function(r){var e=null;e=r.replace(/(^')|('$)/g,"");return e};r.prototype.removeDuplicate=function(r){var e={};var t=0;for(t=0;t<r.length;t++){e[r[t]]=true}var n=[];var o=null;for(o in e){if(e.hasOwnProperty(o)){n.push(o)}}return n};r.prototype.removeDupplicateByName=function(r){var e={};var t=0;for(t=0;t<r.length;t++){e[r[t].name]=r[t]}var n=[];var o=null;for(o in e){if(e.hasOwnProperty(o)){n.push(e[o])}}return n};r.prototype.addProperty=function(r,e,t){var n=this.capitaliseFirstLetter(e);var o=t;r["get"+n]=function(){return o}};r.prototype.addProperties=function(r,e,t,n){var o;for(o=0;o<t.length;++o){if(e.hasOwnProperty(t[o])){this.addProperty(r,t[o],e[t[o]])}else if(n!==undefined&&n!==null){this.addProperty(r,t[o],n[o])}}};r.prototype.capitaliseFirstLetter=function(r){var e=null;if(r!==undefined&&r!==null){e=r[0].toUpperCase()+r.slice(1)}return e};return r},true);
//# sourceMappingURL=utils.js.map