/*!
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/zen/dsh/utils/BaseHandler","sap/zen/dsh/widgets/utilities/SDKUtilsHelper","sap/zen/dsh/widgets/charts/ChartException"],function(jQuery,e,i,t){"use strict";var s=function(){var e={type:"analysisAxis",index:1};var s={type:"analysisAxis",index:2};var n={type:"measureNamesDimension"};var r={type:"measureValuesGroup",index:4};var u=function(i,t){if(i==="COLUMNS"&&t===0){return e}else{return s}};var a=function(i,t){if(t>0){if(i>0){return[s]}else{return[e]}}return[]};var f=function(i){if(i>0)return[e];return[]};this.getUtilsHelper=function(){if(this._utilsHelper!=null||this._utilsHelper!=undefined){return this._utilsHelper}this._utilsHelper=new i;return this._utilsHelper};this.getDataFeedingColor=function(e,i,t,s){var r=[];var a=u(e,t);if(e==="ROWS"){r.push(n)}if(s>0){if(i>0){r.unshift(a)}else{r.push(a)}}return r};this.getDataFeedingAxis=function(i,t,s,r){var u=[];if(i=="ROWS"&&s==0&&r==0){u.push(e)}else if(i=="COLUMNS"&&s==0&&r==0){u.push(n)}else{if(i=="COLUMNS"){if(s==0)u.push(n);else{if(t-s==0){u.push(e);u.push(n)}else{u.push(n);u.push(e)}}}else{u.push(e)}}return u};this.getDataDualFeedingColor=function(e,i,t){var r=[];if(t==0&&i>0){if(e-t==0){r.push(n);r.push(s)}else{r.push(s);r.push(n)}}if(t>0&&i==0){r.push(n)}if(t>0&&i>0){if(e-t==0){r.push(n);r.push(s)}else{r.push(s);r.push(n)}}if(t==0&&i==0){r.push(n)}return r};this.getDataBubbleFeedingColor=function(e,i){return f(e,i)};this.getDataBubbleFeedingHeight=function(e){var i=[];if(e)i.push(r);return i};this.getDataBubbleFeedingShape=function(e,i){return a(e,i)};this.getDataMultiRadarFeedingColor=function(e,i,t,r){var u=[];if(e=="ROWS"&&t==0&&r==0){u.push(n)}else if(t!=0){u.push(s)}return u};this.getDataRadarFeedingColor=function(i,t,r,u){var a=[];if(i=="ROWS"&&r==0&&u==0){a.push(n)}else if(r!=0){if(i=="ROWS"){if(t-u==0){a.push(n);a.push(s)}else{a.push(s);a.push(n)}}else if(u==0){a.push(e)}else{a.push(s)}}else if(r==0&&u>0){a.push(n)}return a};this.getDataMultiRadarFeedingAxes=function(i,t,r){var u=[];if(i=="ROWS"&&t==0&&r==0){u.push(s)}else if(i=="COLUMNS"&&t==0&&r==0){u.push(n)}else if(r==0&&t>0){u.push(n)}else if(t==0&&r>0){u.push(s)}else if(t!=0&&r!=0){u.push(e)}return u};this.getDataMultiRadarFeedingMultiplier=function(i,t){var s=[];if(i!=0&&t!=0){s.push(n)}else{s.push(e)}return s};this.getDataRadarFeedingAxes=function(i,t){var s=[];if(i=="COLUMNS"&&t==0){s.push(n)}else{s.push(e)}return s};this.getDataScatterFeedingColor=function(e,i,t,s){return f(t,s)};this.getDataScatterFeedingShape=function(e,i,t,s){return a(t,s)};this.getAnalysisAxisIndex1=function(){return e};this.checkFeedDefValid=function(e,i,s,n){if(s!=0){return}for(var r in n){var u=n[r];if(u.indexOf(i)!=-1){throw new t(e.data.messages.feedingerror,"\nDimensions are not in the expected Axis")}}};this.genericDataFeeding=function(e,i,t,s,n){var r=e.newChartOptionsProperties;var u=e.cvomType;var a=this.getUtilsHelper().getMetadataFeedsArray(u,"Measure");var f=this.getUtilsHelper().getMetadataFeedsArray(u,"Dimension");var h=[];if(s==0||n==0){var l=e.getAxesSwapped()?n:s;this.checkFeedDefValid(e,"ROWS",l,r.feeds);l=e.getAxesSwapped()?s:n;this.checkFeedDefValid(e,"COLUMNS",l,r.feeds)}var p=false;var d=false;for(var o=f.length-1;o>-1;o--){var g=f[o];var c={};var v=[];if(r!=undefined){var D=r.feeds[g.id.replace(/\./g,"_")];if(D!=null&&D!=="BLANK"){v.push({type:"analysisAxis",index:p==true?1:g.aaIndex})}}if(v.length==0&&g.acceptMND>=0){if(!d){v.push({type:"measureNamesDimension"});d=true}if(g.aaIndex==1)p=true}c.feedId=g.id;c.binding=v;h.push(c)}for(var x=a.length-1;x>-1;x--){var S=a[x];if(r!=undefined){var F=r.feeds[S.id.replace(/\./g,"_")];if(F!=undefined&&F!==""){var m={};v=[];v.push({type:"measureValuesGroup",index:S.mgIndex});m.feedId=S.id;m.binding=v;h.push(m)}}}return h};this.updateMultiLayout=function(e,i){var t=e.feeds.multiplier;var s=t.indexOf("#");var n={multiLayout:{numberOfDimensionsInColumn:s!=-1?t.substring(s+1,t.length):0}};jQuery.extend(i,n)}};return s});
//# sourceMappingURL=SDKChartDataFeedingHelper.js.map