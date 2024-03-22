sap.ui.define("sap/sac/df/variablebar/FieldBaseDelegate",["sap/ui/mdc/field/FieldBaseDelegate","sap/sac/df/variablebar/TypeUtil"],function(e,t){"use strict";var r=Object.assign({},e);r.apiVersion=2;r._getDataProvider=function(e){var t=e.getParent();if(t.isA("sap.sac.df.FilterBar")){return t._oFilterBarHandler._getDataProvider()}else if(t.isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar")){return sap.ui.getCore().byId(t.getAdaptationControl())._oFilterBarHandler._getDataProvider()}return null};r.getDescription=function(e,t,r,a,i,n,l,u,s,o){var v=o.getFieldPath();var d="";var f=o.getConditions(v).find(function(e){return e.values[0]===r});if(f.values.length>1){return Promise.resolve(f.values[1])}var g=o.getParent();if(g.isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar")){var c=sap.ui.getCore().byId(g.getAdaptationControl()).getFilterItems();var p=c.find(function(e){return e.getFieldPath()===v});var h=p&&p.getConditions().find(function(e){return e.values[0]===f.values[0]});if(h&&h.values.length>1){return Promise.resolve(h.values[1])}}var P=this._getDataProvider(o);if(P){var b=P.Variables[v];var m=b.MemberFilter.find(function(e){return r===e.Low});d=m&&m.LowText!==m.Low?m.LowText:"";if(!d){return this._requestText(P,v,r)}}return Promise.resolve(d)};r.getItemForValue=function(e,t,r){if(!r.value){return Promise.resolve()}var a=r.control;var i=this._getDataProvider(a);if(i&&r.value){return this._requestText(i,a.getFieldPath(),r.value)}return Promise.resolve()};r._requestText=function(e,t,a){return e.searchVariableValues(t,a,false,true,true).then(function(e){if(!e.length){return Promise.resolve()}var t=this._getResult(e);var r={key:t.Key};r.description=e.length===1&&t.Key!==t.Text?t.Text:"";return r}.bind(r))};r._getResult=function(e){var t=e[0];while(t.Children){t=t.Children[0]}return t};r.isInvalidInputAllowed=function(){return false};r.isInputValidationEnabled=function(e){var t=e.getPayload();return t.supportsValueHelp&&!t.valueType.includes("Date")&&!t.valueType.includes("Time")};r.getDataTypeClass=function(e,r){return t.getDataTypeClassName(r)};r.getTypeUtil=function(){return t};return r});
//# sourceMappingURL=FieldBaseDelegate.js.map