/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ui/core/Control","sap/ui/model/json/JSONModel","sap/ovp/cards/v4/charts/Utils","sap/ovp/cards/AnnotationHelper","sap/ovp/app/resources","sap/base/util/each","sap/base/util/merge"],function(e,t,a,r,s,n,i){"use strict";return e.extend("sap.ovp.cards.v4.charts.OVPVizDataHandler",{metadata:{aggregations:{data:{type:"sap.ui.core.Element"},aggregateData:{type:"sap.ui.core.Element"},content:{multiple:false}},properties:{chartType:{defaultValue:false},dependentDataReceived:{defaultValue:false},scale:{defaultValue:""},entitySet:{}}},renderer:function(e,t){e.openStart("div",t).openEnd();if(t.getContent()){e.renderControl(t.getContent())}e.close("div")},mergeDatasets:function(e,a,r){var o=this;var l=this.getModel();var u=e.mParameters;var p=i([],this.dataSet);if(u){var c=u["$apply"]}var d=e.getPath().substring(1);var g=-1;if(d){g=d.indexOf("Parameters")}if(g>=0){d=d.substr(0,d.indexOf("Parameters"))}var v=l.getMetaModel();var f=this.getEntitySet();var h=v.getData("/")["$Annotations"];var m=[];var y=[];for(var D in h){if(h[D]["@com.sap.vocabularies.Analytics.v1.Measure"]){if(c&&c.includes(D.split("/")[1])){m.push(D.split("/")[1])}}else{if(c&&c.includes(D.split("/")[1])){y.push(D.split("/")[1])}}}if(p){for(var b=0;b<p.length-2;b++){for(var C=0;C<m.length;C++){if(p[0]){p[0][m[C]]=Number(p[0][m[C]])+Number(p[b+1][m[C]])}}}p.__count=p.length;var S=p.__count-p.length;var P={};P.results=[];P.results[0]=p[0];var A;if(p.__count>p.length){var O=i({},this.aggregateSet);if(O&&O.results&&p.results.length<p.__count){n(m,function(e){O.results[0][m[e]]=String(Number(o.aggregateSet.results[0][m[e]])-Number(P.results[0][m[e]]))});n(y,function(e){O.results[0][y[e]]=s.getText("OTHERS_DONUT",[S+1])});O.results[0].$isOthers=true;A=O.results[0];if(A){a.results.splice(-1,1)}}}if(A){a.results.push(A)}var x=r.getModel("ovpCardProperties");var M=x&&x.getProperty("/bEnableStableColors");var T=x&&x.getProperty("/colorPalette");var E=h[f]["@"+(x&&x.getProperty("/chartAnnotationPath"))];if(E.DimensionAttributes.length===1&&M&&r.getVizType()==="donut"&&T&&T instanceof Object){var I=E.DimensionAttributes[0].Dimension.$PropertyPath;if(T instanceof Array){var k=T.map(function(e){return e.color});var R=k.slice()}else{var w=JSON.parse(JSON.stringify(T))}var B=r.getVizProperties();if(!B){var N={plotArea:{dataPointStyle:{rules:[]}}};B=N}else if(B&&!B.plotArea){B.plotArea={dataPointStyle:{rules:[]}}}if(r&&B&&B.plotArea){if(!B.plotArea.dataPointStyle){B.plotArea.dataPointStyle={rules:[]}}else{B.plotArea.dataPointStyle.rules=[]}var V=x.getProperty("/entityType");var _=v.getData()["$Annotations"][V.$Type+"/"+I];if(_){var $=_["@com.sap.vocabularies.Common.v1.Label"]?_["@com.sap.vocabularies.Common.v1.Label"]:I;var j;if(_["@com.sap.vocabularies.Common.v1.Text"]){j=_["@com.sap.vocabularies.Common.v1.Text"]["$Path"]}else if(_["sap:text"]){j=_["sap:text"]}else{j=_}var U=function(e,t,r,s){var n={dataContext:{},properties:{color:k&&k[e]||r&&r[s]},displayName:a.results[t][j]};n.dataContext[$]=a.results[t][I];return n};if(T instanceof Array){n(T,function(e,t){for(var r=0;r<a.results.length;r++){if(a.results[r][I]===t.dimensionValue){var s=U(e,r,t);B.plotArea.dataPointStyle["rules"].push(s);R.splice(e,1)}}})}else{for(var Y=0;Y<a.results.length;Y++){if(T.hasOwnProperty(a.results[Y][I])){var D=a.results[Y][I];var z={};z[D]=T[D];var F=U(b,Y,z,D);B.plotArea.dataPointStyle["rules"].push(F);delete w[D]}}}if(O){B.plotArea.dataPointStyle["rules"].push({callback:function(e){if(e&&e[$].lastIndexOf("Others")!=-1){return true}},properties:{color:R&&R.length?k[k.length-1]:Object.keys(w).length&&w[Object.keys(w)[0]]},displayName:O.results[0][I]})}}}r.setVizProperties(B)}}var H=new t;var J=[];for(var b=0;b<a.results.length;b++){var q={};for(var Y=0;Y<y.length;Y++){q[y[Y]]=a.results[b]&&a.results[b][y[Y]]}for(var L=0;L<m.length;L++){q[m[L]]=a.results[b]&&(a.results[b][m[L]+"Aggregate"]||a.results[b][m[L]])}J.push(q)}H.setData(J);r.setModel(H,"analyticalmodel")},updateBindingContext:function(){var s=this.getBinding("data");var o=this.getBinding("aggregateData");var l=this;if(this.chartBinding==s){return}else{this.chartBinding=s;if(s){var l=this;s.attachEvent("dataReceived",function(e){if(a.checkIfDataExistInEvent(e)){l.dataSet=e&&e.getSource().getCurrentContexts().map(function(e){return e&&e.getObject()});l.oDataClone={results:i([],l.dataSet)};if(l.getChartType()=="donut"&&l.getBinding("aggregateData")!==undefined){if(l.getDependentDataReceived()===true||l.getDependentDataReceived()==="true"){l.mergeDatasets(s,l.oDataClone,l.getContent());l.setDependentDataReceived(false)}else{l.setDependentDataReceived(true)}}else{var o=new t;if(l.dataSet){var u=l.getEntitySet().split(".")[l.getEntitySet().split(".").length-1];var p=s.getModel();var c=a.cacheODataMetadata(p);var d=[];var g={};var v=c[u];if(v){var f=Object.keys(v)}if(f&&f.length){n(f,function(e,t){if(v[t].$Type==="Edm.String"){var a=l.getModel().getMetaModel().getObject("/"+l.getEntitySet()+"/"+t+"@");if(a["@com.sap.vocabularies.Common.v1.IsCalendarYearMonth"]){d.push(t);g[t]={"sap:semantics":"yearmonth"}}else if(a["@com.sap.vocabularies.Common.v1.IsCalendarYearQuarter"]){d.push(t);g[t]={"sap:semantics":"yearquarter"}}else if(a["@com.sap.vocabularies.Common.v1.IsCalendarYearWeek"]){d.push(t);g[t]={"sap:semantics":"yearweek"}}else if(a["@com.sap.vocabularies.Common.v1.IsFiscalYearPeriod"]){d.push(t);g[t]={"sap:semantics":"fiscalyearperiod"}}}})}if(d&&d.length){if(l.dataSet&&l.dataSet.length){n(l.dataSet,function(e,t){n(d,function(e,a){if(t&&t.hasOwnProperty(a)){var s=t[a];var n,i,o,l,u,p,c;switch(g[a]["sap:semantics"]){case"yearmonth":n=parseInt(s.substr(0,4),10);i=s.substr(4);u=parseInt(i,10)-1;t[a]=new Date(Date.UTC(n,u));break;case"yearquarter":n=parseInt(s.substr(0,4),10);o=s.substr(4);l=parseInt(o,10)*3-2;u=l-1;t[a]=new Date(Date.UTC(n,u));break;case"yearweek":n=parseInt(s.substr(0,4),10);p=s.substr(4);var c=1+(parseInt(p,10)-1)*7;t[a]=new Date(Date.UTC(n,0,c));break;case"fiscalyearperiod":var d="com.sap.vocabularies.Common.v1.IsFiscalYearPeriod";var v=r.getFormattedFiscalData(s,d);t[a]=v;break;default:break}}})})}}o.setData(l.dataSet);l.oDataClone={results:i([],l.dataSet)}}l.getContent().setModel(o,"analyticalmodel");l.mergeDatasets(s,l.oDataClone,l.getContent())}}})}e.prototype.updateBindingContext.apply(this,arguments)}if(this.chartAggrBinding==o){return}else{this.chartAggrBinding=o;if(o){var l=this;o.attachEvent("dataReceived",function(e){l.aggregateSet=e&&e.getParameter("data");if(l.getChartType()=="donut"){if(l.getDependentDataReceived()===true||l.getDependentDataReceived()==="true"){l.oDataClone=i({},l.dataSet);l.mergeDatasets(s,l.oDataClone,l.getContent());l.setDependentDataReceived(false)}else{l.setDependentDataReceived(true)}}else{var a=new t;a.setData(l.aggregateSet.results);l.getContent().setModel(a,"analyticalmodel")}})}e.prototype.updateBindingContext.apply(this,arguments)}}})});
//# sourceMappingURL=OVPVizDataHandler.js.map