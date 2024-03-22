/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){function e(){}function t(t,r){if(!r){return t&&t.then?t.then(e):Promise.resolve()}}function r(e,t){var r=e();if(r&&r.then){return r.then(t)}return t(r)}function a(e,t,r){if(r){return t?t(e):e}if(!e||!e.then){e=Promise.resolve(e)}return t?e.then(t):e}sap.ui.define(["../core/core","../core/errors","../core/util","./AttributeType","./AttributeFormatType","./AttributeGroupTextArrangement","./DataSourceType","./MatchingStrategy","./LogicalOperator","./ComparisonOperator","./FacetType","./SuggestionCalculationMode","./SuggestionType","./SortOrder","./ConditionType","../providers/tools/cds/CDSAnnotationsParser","../providers/tools/sors/NavigationTargetGenerator","./SearchResultSet","./SearchResultSetItem","./SearchResultSetItemAttribute","./ObjectSuggestion","./SearchQuery","./ChartQuery","./SuggestionQuery","./DataSourceQuery","./Filter","./ComplexCondition","./SimpleCondition","./AttributeMetadata","./AttributeGroupMetadata","./AttributeGroupMembership","./SearchResultSetItemAttributeGroup","./SearchResultSetItemAttributeGroupMembership","./SearchTermSuggestion","./SearchTermAndDataSourceSuggestion","./DataSourceSuggestion","./SuggestionResultSet","./ChartResultSet","./DataSourceResultSet","./ChartResultSetItem","./DataSourceResultSetItem","./Capabilities","./Configuration","./NavigationTarget","./formatters/Formatter","./DataSource","./UserCategoryDataSource","../providers/tools/ItemPostParser","../providers/tools/fiori/SuvNavTargetResolver","../providers/tools/fiori/NavigationTargetForIntent","../providers/tools/fiori/FioriIntentsResolver","./formatters/ResultValueFormatter","./formatters/NavtargetsInResultSetFormatter","./formatters/HierarchyResultSetFormatter","./formatters/ConfigSearchResultSetFormatter","./formatters/ConfigMetadataFormatter","./FilteredDataSource","../providers/inav2/Provider","../providers/abap_odata/Provider","./HierarchyQuery","./HierarchyNode","./HierarchyResultSet","../providers/inav2/typeConverter","./HierarchyNodePath","./HierarchyDisplayType"],function(e,i,o,n,s,c,u,h,l,S,v,y,f,d,p,m,g,b,F,C,A,D,R,O,T,j,w,_,I,P,M,N,k,H,x,G,Q,L,E,J,U,B,$,V,z,q,K,W,X,Y,Z,ee,te,re,ae,ie,oe,ne,se,ce,ue,he,le,Se,ve){function ye(e,t){var r=typeof Symbol!=="undefined"&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=fe(e))||t&&e&&typeof e.length==="number"){if(r)e=r;var a=0;var i=function(){};return{s:i,n:function(){if(a>=e.length)return{done:true};return{done:false,value:e[a++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o=true,n=false,s;return{s:function(){r=r.call(e)},n:function(){var e=r.next();o=e.done;return e},e:function(e){n=true;s=e},f:function(){try{if(!o&&r.return!=null)r.return()}finally{if(n)throw s}}}}function fe(e,t){if(!e)return;if(typeof e==="string")return de(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor)r=e.constructor.name;if(r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return de(e,t)}function de(e,t){if(t==null||t>e.length)t=e.length;for(var r=0,a=new Array(t);r<t;r++)a[r]=e[r];return a}function pe(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function me(e,t){for(var r=0;r<t.length;r++){var a=t[r];a.enumerable=a.enumerable||false;a.configurable=true;if("value"in a)a.writable=true;Object.defineProperty(e,a.key,a)}}function ge(e,t,r){if(t)me(e.prototype,t);if(r)me(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function be(e,t,r){if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}var Fe=n["AttributeType"];var Ce=s["AttributeFormatType"];var Ae=c["AttributeGroupTextArrangement"];var De=u["DataSourceSubType"];var Re=u["DataSourceType"];var Oe=h["MatchingStrategy"];var Te=l["LogicalOperator"];var je=S["ComparisonOperator"];var we=v["FacetType"];var _e=y["SuggestionCalculationMode"];var Ie=f["SuggestionType"];var Pe=d["SortOrder"];var Me=p["ConditionType"];var Ne=m["CDSAnnotationsParser"];var ke=g["NavigationTargetGenerator"];var He=b["SearchResultSet"];var xe=F["SearchResultSetItem"];var Ge=C["SearchResultSetItemAttribute"];var Qe=A["ObjectSuggestion"];var Le=D["SearchQuery"];var Ee=R["ChartQuery"];var Je=O["SuggestionQuery"];var Ue=T["DataSourceQuery"];var Be=j["Filter"];var $e=w["ComplexCondition"];var Ve=_["SimpleCondition"];var ze=I["AttributeMetadata"];var qe=P["AttributeGroupMetadata"];var Ke=M["AttributeGroupMembership"];var We=N["SearchResultSetItemAttributeGroup"];var Xe=k["SearchResultSetItemAttributeGroupMembership"];var Ye=H["SearchTermSuggestion"];var Ze=x["SearchTermAndDataSourceSuggestion"];var et=G["DataSourceSuggestion"];var tt=Q["SuggestionResultSet"];var rt=L["ChartResultSet"];var at=E["DataSourceResultSet"];var it=J["ChartResultSetItem"];var ot=U["DataSourceResultSetItem"];var nt=B["Capabilities"];var st=$["Configuration"];var ct=V["NavigationTarget"];var ut=z["Formatter"];var ht=q["DataSource"];var lt=K["UserCategoryDataSource"];var St=W["ItemPostParser"];var vt=X["SuvNavTargetResolver"];var yt=Y["NavigationTargetForIntent"];var ft=Z["FioriIntentsResolver"];var dt=ee["ResultValueFormatter"];var pt=te["NavtargetsInResultSetFormatter"];var mt=re["HierarchyResultSetFormatter"];var gt=ae["ConfigSearchResultSetFormatter"];var bt=ie["ConfigMetadataFormatter"];var Ft=oe["FilteredDataSource"];var Ct=ne["Provider"];var At=se["Provider"];var Dt=ce["HierarchyQuery"];var Rt=ue["HierarchyNode"];var Ot=he["HierarchyResultSet"];var Tt=Se["HierarchyNodePath"];var jt=ve["HierarchyDisplayType"];var wt=function(){function n(t){pe(this,n);be(this,"isNeededCache",{});this.core=e;this.errors=i;this.util=o;this.inav2TypeConverter=le;this.provider=t;this.createSearchQuery=this.createSinaObjectFactory(Le);this.createChartQuery=this.createSinaObjectFactory(Ee);this.createHierarchyQuery=this.createSinaObjectFactory(Dt);this.createSuggestionQuery=this.createSinaObjectFactory(Je);this.createDataSourceQuery=this.createSinaObjectFactory(Ue);this.createFilter=this.createSinaObjectFactory(Be);this.createComplexCondition=this.createSinaObjectFactory($e);this.createSimpleCondition=this.createSinaObjectFactory(Ve);this.createHierarchyNode=this.createSinaObjectFactory(Rt);this.createHierarchyNodePath=this.createSinaObjectFactory(Tt);this._createAttributeMetadata=this.createSinaObjectFactory(ze);this._createAttributeGroupMetadata=this.createSinaObjectFactory(qe);this._createAttributeGroupMembership=this.createSinaObjectFactory(Ke);this._createSearchResultSetItemAttribute=this.createSinaObjectFactory(Ge);this._createSearchResultSetItemAttributeGroup=this.createSinaObjectFactory(We);this._createSearchResultSetItemAttributeGroupMembership=this.createSinaObjectFactory(Xe);this._createSearchResultSetItem=this.createSinaObjectFactory(xe);this._createSearchResultSet=this.createSinaObjectFactory(He);this._createSearchTermSuggestion=this.createSinaObjectFactory(Ye);this._createSearchTermAndDataSourceSuggestion=this.createSinaObjectFactory(Ze);this._createDataSourceSuggestion=this.createSinaObjectFactory(et);this._createObjectSuggestion=this.createSinaObjectFactory(Qe);this._createSuggestionResultSet=this.createSinaObjectFactory(tt);this._createChartResultSet=this.createSinaObjectFactory(rt);this._createHierarchyResultSet=this.createSinaObjectFactory(Ot);this._createChartResultSetItem=this.createSinaObjectFactory(it);this._createDataSourceResultSetItem=this.createSinaObjectFactory(ot);this._createCapabilities=this.createSinaObjectFactory(nt);this._createConfiguration=this.createSinaObjectFactory(st);this._createNavigationTarget=this.createSinaObjectFactory(ct);this._createSorsNavigationTargetGenerator=this.createSinaObjectFactory(ke);this._createFioriIntentsResolver=this.createSinaObjectFactory(ft);this._createNavigationTargetForIntent=this.createSinaObjectFactory(yt);this._createCDSAnnotationsParser=this.createSinaObjectFactory(Ne);this._createItemPostParser=this.createSinaObjectFactory(St);this._createSuvNavTargetResolver=this.createSinaObjectFactory(vt);this.searchResultSetFormatters=[];this.suggestionResultSetFormatters=[];this.chartResultSetFormatters=[];this.metadataFormatters=[];this.dataSources=[];this.dataSourceMap={};this.allDataSource=this.createDataSource({id:"All",label:"All",type:Re.Category});this.searchResultSetFormatters.push(new pt);this.searchResultSetFormatters.push(new mt);this.searchResultSetFormatters.push(new dt);this.DataSourceType=Re;this.DataSourceSubType=De;this.HierarchyDisplayType=jt;this.AttributeGroupTextArrangement=Ae;this.AttributeType=Fe;this.AttributeFormatType=Ce;this.FacetType=we;this.SuggestionType=Ie;this.ConditionType=Me;this.SuggestionCalculationMode=_e;this.SortOrder=Pe;this.MatchingStrategy=Oe;this.ComparisonOperator=je;this.LogicalOperator=Te}ge(n,[{key:"initAsync",value:function e(o){try{const e=this;e.configuration=o;e.isDummyProvider=o.provider.indexOf("dummy")>-1;e.provider.label=o.label;return a(e._evaluateConfigurationAsync(o),function(){o.sina=e;return a(e.provider.initAsync(o),function(n){n=n||{capabilities:null};e.capabilities=n.capabilities||e._createCapabilities({sina:e});return a(e._formatMetadataAsync(),function(){return r(function(){if(o.initAsync){return t(o.initAsync(e))}},function(){if(e.getBusinessObjectDataSources().length===0&&!e.isDummyProvider){throw new i.ESHNotActiveError("Not active - no datasources")}})})})})}catch(e){return Promise.reject(e)}}},{key:"_formatMetadataAsync",value:function t(){return e.executeSequentialAsync(this.metadataFormatters,function(e){return e.formatAsync({dataSources:this.dataSources})}.bind(this))}},{key:"_evaluateConfigurationAsync",value:function e(t){try{const e=this;var r=[];if(t.searchResultSetFormatters){for(var a=0;a<t.searchResultSetFormatters.length;++a){var i=t.searchResultSetFormatters[a];if(!(i instanceof ut)&&!i.formatAsync){i=new gt(i)}e.searchResultSetFormatters.push(i);if(i.initAsync){r.push(i.initAsync())}}}if(t.suggestionResultSetFormatters){for(var o=0;o<t.suggestionResultSetFormatters.length;++o){var n=t.suggestionResultSetFormatters[o];e.suggestionResultSetFormatters.push(n);if(n.initAsync){r.push(n.initAsync())}}}if(t.chartResultSetFormatters){for(var s=0;s<t.chartResultSetFormatters.length;++s){var c=t.chartResultSetFormatters[s];e.chartResultSetFormatters.push(c);if(c.initAsync){r.push(c.initAsync())}}}if(t.metadataFormatters){for(var u=0;u<t.metadataFormatters.length;++u){var h=t.metadataFormatters[u];if(!(h instanceof ut)&&!h.formatAsync){h=new bt(h)}e.metadataFormatters.push(h);if(h.initAsync){r.push(h.initAsync())}}}return Promise.all(r)}catch(e){return Promise.reject(e)}}},{key:"loadMetadata",value:function e(t){try{const e=this;if(e.provider instanceof Ct){if(e.provider.loadMetadata){return a(e.provider.loadMetadata(t))}}return Promise.resolve()}catch(e){return Promise.reject(e)}}},{key:"createDataSourceMap",value:function e(t){var r={};for(var a=0;a<t.length;++a){var i=t[a];r[i.id]=i}return r}},{key:"createSinaObjectFactory",value:function e(t){return function(e){var r;e=(r=e)!==null&&r!==void 0?r:{sina:this};e.sina=this;return new t(e)}}},{key:"_createDataSourceResultSet",value:function e(t){var r=this.removeHierarchyHelperDataSources(t.items,function(e){return e.dataSource});t.items=r;var a=new at(t);a.sina=this;return a}},{key:"removeHierarchyHelperDataSources",value:function e(t,r){var a=this;var i=function e(t){var r=a.isNeededCache[t.id];if(typeof r!=="undefined"){return r}var i=ye(a.dataSources),o;try{for(i.s();!(o=i.n()).done;){var n=o.value;var s=ye(n.attributesMetadata),c;try{for(s.s();!(c=s.n()).done;){var u=c.value;if(u.hierarchyName===t.hierarchyName&&u.hierarchyDisplayType===jt.HierarchyResultView){a.isNeededCache[t.id]=true;return true}}}catch(e){s.e(e)}finally{s.f()}}}catch(e){i.e(e)}finally{i.f()}a.isNeededCache[t.id]=false;return false};for(var o=0;o<t.length;o++){var n=t[o];var s=r(n);if(!s.isHierarchyDefinition){continue}if(!i(s)){t.splice(o,1);o--}}return t}},{key:"createDataSource",value:function e(t){t.sina=this;var r;switch(t.type){case Re.BusinessObject:switch(t.subType){case De.Filtered:r=new Ft(t);break;default:r=new ht(t)}break;case Re.UserCategory:r=new lt(t);break;default:r=new ht(t)}if(this.dataSourceMap[r.id]){throw new i.CanNotCreateAlreadyExistingDataSourceError('cannot create an already existing datasource: "'+r.id+'"')}this._addDataSource(r);return r}},{key:"_createDataSource",value:function e(t){return this.createDataSource(t)}},{key:"_addDataSource",value:function e(t){if(t.type===Re.BusinessObject&&t.subType===De.Filtered){var r=-1;for(var a=this.dataSources.length-1;a>=1;--a){var i=this.dataSources[a];if(i.type===Re.BusinessObject&&i.subType===De.Filtered){r=a;break}}if(r>=0){this.dataSources.splice(r+1,0,t)}else{this.dataSources.push(t)}}else{this.dataSources.push(t)}this.dataSourceMap[t.id]=t}},{key:"getAllDataSource",value:function e(){return this.allDataSource}},{key:"getBusinessObjectDataSources",value:function e(){var t=[];for(var r=0;r<this.dataSources.length;++r){var a=this.dataSources[r];if(!a.hidden&&a.type===Re.BusinessObject&&a.subType!==De.Filtered){t.push(a)}}return this.removeHierarchyHelperDataSources(t,function(e){return e})}},{key:"getDataSource",value:function e(t){return this.dataSourceMap[t]}},{key:"getConfigurationAsync",value:function e(){try{const e=arguments,r=this;var t=e.length>0&&e[0]!==undefined?e[0]:{};if(r.provider instanceof Ct||r.provider instanceof At){if(r.configurationPromise&&!t.forceReload){return a(r.configurationPromise)}r.configurationPromise=r.provider.getConfigurationAsync();return a(r.configurationPromise)}return Promise.resolve(r._createConfiguration({personalizedSearch:false,isPersonalizedSearchEditable:false}))}catch(e){return Promise.reject(e)}}},{key:"logUserEvent",value:function e(t){if(this.provider instanceof Ct||this.provider instanceof At){this.provider.logUserEvent(t)}}},{key:"getDebugInfo",value:function e(){return this.provider.getDebugInfo()}},{key:"parseDataSourceFromJson",value:function e(t){var r=this.getDataSource(t.id);if(r){return r}if(t.type!==Re.Category){throw new i.DataSourceInURLDoesNotExistError("Datasource in URL does not exist "+t.id)}r=this._createDataSource(t);return r}},{key:"parseSimpleConditionFromJson",value:function t(r){var a;if(e.isObject(r.value)){a=o.dateFromJson(r.value)}else{a=r.value}var i;if(r.userDefined){i=true}else{i=false}var n;if(r.dynamic){n=true}else{n=false}return this.createSimpleCondition({operator:r.operator,attribute:r.attribute,value:a,attributeLabel:r.attributeLabel,valueLabel:r.valueLabel,userDefined:i,isDynamicValue:n})}},{key:"parseComplexConditionFromJson",value:function e(t){var r=[];for(var a=0;a<t.conditions.length;++a){var i=t.conditions[a];r.push(this.parseConditionFromJson(i))}var o;if(t.userDefined){o=true}else{o=false}return this.createComplexCondition({operator:t.operator,conditions:r,attributeLabel:t.attributeLabel,valueLabel:t.valueLabel,userDefined:o})}},{key:"parseConditionFromJson",value:function e(t){switch(t.type){case Me.Simple:return this.parseSimpleConditionFromJson(t);case Me.Complex:return this.parseComplexConditionFromJson(t);default:throw new i.UnknownConditionTypeError('unknown condition type "'+t.type+'"')}}},{key:"parseFilterFromJson",value:function e(t){var r=this.parseConditionFromJson(t.rootCondition);if(r instanceof $e){return this.createFilter({searchTerm:t===null||t===void 0?void 0:t.searchTerm,rootCondition:r,dataSource:this.parseDataSourceFromJson(t.dataSource)})}else{throw new i.UnknownConditionTypeError("Only complex condition is allowed in Filter JSON")}}},{key:"createStaticHierarchySearchNavigationTarget",value:function e(t,r,a,i,o){if(!o){o=a.hierarchyAttribute;if(!o){if(a.hierarchyHelperDatasource&&a.hierarchyHelperDatasource.hierarchyAttribute){o=a.hierarchyHelperDatasource.hierarchyAttribute}else{return null}}}var n=new Be({dataSource:a,searchTerm:"",sina:this});if(t!=="$$ROOT$$"){var s=new Ve({attribute:o,operator:je.DescendantOf,value:t,valueLabel:r});n.autoInsertCondition(s)}return this.createSearchNavigationTarget(n,i||"Children Folders")}}]);return n}();var _t={__esModule:true};_t.Sina=wt;return _t})})();
//# sourceMappingURL=Sina.js.map