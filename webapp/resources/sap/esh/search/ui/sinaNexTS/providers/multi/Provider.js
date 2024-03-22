/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){function e(e,t,r){if(r){return t?t(e):e}if(!e||!e.then){e=Promise.resolve(e)}return t?e.then(t):e}sap.ui.define(["../AbstractProvider","./FacetMode","./FederationType","./ProviderHelper","../../sina/Sina","./FederationMethod","../../core/Log","../../sina/SinaConfiguration","../abap_odata/Provider","../hana_odata/Provider","../sample/Provider","../inav2/Provider","../dummy/Provider","../../core/errors"],function(t,r,a,i,o,n,u,s,c,l,d,f,p,v){function S(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function h(e,t){for(var r=0;r<t.length;r++){var a=t[r];a.enumerable=a.enumerable||false;a.configurable=true;if("value"in a)a.writable=true;Object.defineProperty(e,a.key,a)}}function y(e,t,r){if(t)h(e.prototype,t);if(r)h(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function m(e,t){if(typeof t!=="function"&&t!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:true,configurable:true}});Object.defineProperty(e,"prototype",{writable:false});if(t)g(e,t)}function g(e,t){g=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return g(e,t)}function b(e){var t=P();return function r(){var a=A(e),i;if(t){var o=A(this).constructor;i=Reflect.construct(a,arguments,o)}else{i=a.apply(this,arguments)}return D(this,i)}}function D(e,t){if(t&&(typeof t==="object"||typeof t==="function")){return t}else if(t!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return M(e)}function M(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function P(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function A(e){A=Object.setPrototypeOf?Object.getPrototypeOf.bind():function e(t){return t.__proto__||Object.getPrototypeOf(t)};return A(e)}function C(e,t,r){if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var O=t["AbstractProvider"];var k=r["FacetMode"];var R=a["FederationType"];var w=i["ProviderHelper"];var _=o["Sina"];var T=u["Log"];var j=s["AvailableProviders"];var F=s["_normalizeConfiguration"];var H=c["Provider"];var I=l["Provider"];var E=d["Provider"];var U=f["Provider"];var B=p["Provider"];var z=v["NotImplementedError"];var V;(function(e){e["All"]="All";e["UserCategory"]="UserCategory";e["BusinessObject"]="BusinessObject";e["Category"]="Category"})(V||(V={}));var q=function(t){m(a,t);var r=b(a);function a(){var e;S(this,a);for(var t=arguments.length,i=new Array(t),o=0;o<t;o++){i[o]=arguments[o]}e=r.call.apply(r,[this].concat(i));C(M(e),"id","multi");return e}y(a,[{key:"initAsync",value:function t(r){try{const t=this;var a=t;t.log=new T("MultiProvider");t.sina=r.sina;t.facetMode=k[r.facetMode]||k.flat;t.federationType=R[r.federationType]||R.advanced_round_robin;t.multiSina=[];t.multiDataSourceMap={};t.sina.dataSourceMap[t.sina.allDataSource.id]=t.sina.allDataSource;t.providerHelper=new w(t);switch(t.federationType){case R.advanced_round_robin:{t.federationMethod=new n.AdvancedRoundRobin;break}case R.ranking:{t.federationMethod=new n.Ranking;break}case R.round_robin:{t.federationMethod=new n.RoundRobin;break}}t.sina.capabilities=t.sina._createCapabilities({fuzzy:false});var i=[];r.subProviders.forEach(function(e){var t=a.createAsync(e).then(function(e){a.providerHelper.updateProviderId(e);for(var t=0;t<e.dataSources.length;t++){var r=e.dataSources[t];var i=a.providerHelper.calculateMultiDataSourceId(r.id,e.provider.id);a.providerHelper.createMultiDataSource(i,r);a.multiDataSourceMap[i]=r}a.multiSina.push(e);return e});i.push(t)});var o=false;return e(Promise.allSettled(i),function(e){e.forEach(function(e){if(e.status==="rejected"){a.log.warn("Error during creation of subprovider: ".concat(e.reason.stack))}else if(e.status==="fulfilled"){o=true;if(e.value.capabilities.fuzzy){a.sina.capabilities.fuzzy=true}}});if(!o){t.log.error("Error during creation of multi provider: no valid subproviders");return Promise.reject()}t.sina.dataSources.sort(function(e,t){return e.labelPlural.localeCompare(t.labelPlural)});return t.sina})}catch(e){return Promise.reject(e)}}},{key:"createAsync",value:function t(r){try{const t=this;t.log.debug("Creating new eshclient instance using provider ".concat(r.provider));return e(F(r),function(t){var i;switch(t.provider){case j.HANA_ODATA:{i=new I;break}case j.ABAP_ODATA:{i=new H;break}case j.INAV2:{i=new U;break}case j.MULTI:{i=new a;break}case j.SAMPLE:{i=new E;break}case j.DUMMY:{i=new B;break}default:{throw new Error("Unknown Provider: '".concat(r.provider,"' - Available Providers: ").concat(j.HANA_ODATA,", ").concat(j.ABAP_ODATA,", ").concat(j.INAV2,", ").concat(j.MULTI,", ").concat(j.SAMPLE,", ").concat(j.DUMMY,"."))}}var o=new _(i);return e(o.initAsync(t),function(){return o})})}catch(e){return Promise.reject(e)}}},{key:"getFilterDataSourceType",value:function e(t){if(t===this.sina.allDataSource){return V.All}if(t.type===this.sina.DataSourceType.UserCategory){return V.UserCategory}if(t.type===this.sina.DataSourceType.BusinessObject){return V.BusinessObject}if(t.type===this.sina.DataSourceType.Category){return V.Category}}},{key:"handleAllSearch",value:function e(t){try{const e=this;var r=e;var a;var i=[];var o=e.initializeSearchResultSet(t);var n=[];o.facets.push(e.sina._createDataSourceResultSet({title:t.filter.dataSource.label,items:[],query:t}));for(var u=0;u<e.multiSina.length;u++){a=e.multiSina[u].createSearchQuery({calculateFacets:t.calculateFacets,multiSelectFacets:t.multiSelectFacets,dataSource:e.multiSina[u].allDataSource,searchTerm:t.getSearchTerm(),top:t.top,skip:t.skip,sortOrder:t.sortOrder,sina:e.multiSina[u]});i.push(a.getResultSetAsync())}return Promise.all(i).then(function(e){for(var a=0;a<e.length;a++){var i=e[a];for(var u=0;u<i.items.length;u++){var s=i.items[u];var c=r.providerHelper.calculateMultiDataSourceId(s.dataSource.id,s.sina.provider.id);var l=r.sina.dataSourceMap[c];s.dataSource=l;s.sina=r.sina}o.totalCount+=i.totalCount;n.push(i.items);if(i.facets[0]){if(r.facetMode===k.tree){var d=r.sina.getDataSource(r.providerHelper.calculateMultiDataSourceId(i.query.filter.dataSource.id,i.sina.provider.id));o.facets[0].items.push(r.sina._createDataSourceResultSetItem({dataSource:d,dimensionValueFormatted:r.providerHelper.calculateMultiDataSourceLabel(i.query.filter.dataSource.label,i.sina.provider),measureValue:i.totalCount,measureValueFormatted:i.totalCount}))}else{var f=r.providerHelper.updateDataSourceFacets(i.facets);f[0].items.forEach(function(e){o.facets[0].items.push(e)})}}}o.items=r.federationMethod.sort(n);o.items=o.items.slice(t.skip,t.top);return o})}catch(e){return Promise.reject(e)}}},{key:"handleUserCategorySearch",value:function e(t){try{const e=this;var r=e;var a;var i=[];var o=e.initializeSearchResultSet(t);var n=[];var u=t.filter.dataSource;var s=[];e.multiSina.forEach(function(e){if(e.provider.id.startsWith("abap_odata")||e.provider.id.startsWith("sample")){var t=r.providerHelper.calculateMultiDataSourceId(u.id,e.provider.id);var a=r.multiDataSourceMap[t];if(!a){a=e.createDataSource({id:t,label:u.label,labelPlural:u.labelPlural,type:u.type,subDataSources:[],undefinedSubDataSourceIds:[]});r.multiDataSourceMap[t]=a}else{a.subDataSources=[]}}});u.subDataSources.forEach(function(e){var t=r.multiDataSourceMap[e.id];var a=t.sina;if(a.provider.id.startsWith("abap_odata")||a.provider.id.startsWith("sample")){var i=r.providerHelper.calculateMultiDataSourceId(u.id,a.provider.id);var o=r.multiDataSourceMap[i];if(o.subDataSources.length===0){s.push(o)}o.subDataSources.push(t)}else{s.push(t)}});s.forEach(function(e){a=e.sina.createSearchQuery({calculateFacets:t.calculateFacets,multiSelectFacets:t.multiSelectFacets,dataSource:e,searchTerm:t.getSearchTerm(),top:t.top,skip:t.skip,sortOrder:t.sortOrder,sina:e.sina});i.push(a.getResultSetAsync())});return Promise.all(i).then(function(e){o.facets.push(r.sina._createDataSourceResultSet({title:t.filter.dataSource.label,items:[],query:t}));for(var a=0;a<e.length;a++){var i=e[a];for(var u=0;u<i.items.length;u++){var s=i.items[u];var c=r.providerHelper.calculateMultiDataSourceId(s.dataSource.id,s.sina.provider.id);var l=r.sina.dataSourceMap[c];s.dataSource=l;s.sina=r.sina}o.totalCount+=i.totalCount;n.push(i.items);if(t.calculateFacets){var d=i.query.filter.dataSource;var f=i.sina._createDataSourceResultSet({title:d.label,items:[],query:i.query});if(i.facets.length===0&&i.items.length>0){f.items.push(i.sina._createDataSourceResultSetItem({dataSource:d.subDataSources[0],dimensionValueFormatted:d.subDataSources[0].label,measureValue:i.totalCount,measureValueFormatted:i.totalCount}));i.facets.push(f)}if(i.facets.length>0&&i.facets[0].type==="Chart"&&i.items.length>0){f.items.push(i.sina._createDataSourceResultSetItem({dataSource:d,dimensionValueFormatted:d.label,measureValue:i.totalCount,measureValueFormatted:i.totalCount}));i.facets=[f]}if(i.facets.length===1&&i.facets[0].type==="DataSource"){r.providerHelper.updateDataSourceFacets(i.facets);o.facets[0].items=o.facets[0].items.concat(i.facets[0].items)}}}o.items=r.federationMethod.sort(n);o.items=o.items.slice(t.skip,t.top);return o})}catch(e){return Promise.reject(e)}}},{key:"handleBusinessObjectSearch",value:function t(r){try{const t=this;var a=t;var i=t.multiDataSourceMap[r.filter.dataSource.id];var o=r.getRootCondition().clone();var n=t.initializeSearchResultSet(r);t.providerHelper.updateRootCondition(o,i.sina);var u=i.sina.createSearchQuery({calculateFacets:r.calculateFacets,multiSelectFacets:r.multiSelectFacets,dataSource:i,searchTerm:r.getSearchTerm(),rootCondition:r.getRootCondition(),top:r.top,skip:r.skip,sortOrder:r.sortOrder,sina:i.sina});return e(u.getResultSetAsync().then(function(e){n.items=e.items;n.totalCount=e.totalCount;for(var t=0;t<n.items.length;t++){var r=n.items[t];var i=a.providerHelper.calculateMultiDataSourceId(r.dataSource.id,r.sina.provider.id);a.providerHelper.updateAttributesMetadata(r.dataSource,a.sina.dataSourceMap[i]);r.dataSource=a.sina.dataSourceMap[i];r.sina=a.sina}var o;if(e.facets.length===1&&e.facets[0].items[0].dataSource){o=e.facets;o[0].title=a.providerHelper.calculateMultiDataSourceLabel(e.facets[0].title,e.facets[0].sina.provider);a.providerHelper.updateDataSourceFacets(o)}else{o=[];for(var u=0;u<e.facets.length;u++){var s=e.facets[u];o.push(a.providerHelper.createMultiChartResultSet(s))}}n.facets=o;return n}))}catch(e){return Promise.reject(e)}}},{key:"initializeSearchResultSet",value:function e(t){return this.sina._createSearchResultSet({title:"Search Multi Result List",query:t,items:[],totalCount:0,facets:[]})}},{key:"executeSearchQuery",value:function e(t){switch(this.getFilterDataSourceType(t.filter.dataSource)){case V.All:return this.handleAllSearch(t);case V.UserCategory:return this.handleUserCategorySearch(t);case V.BusinessObject:case V.Category:return this.handleBusinessObjectSearch(t)}}},{key:"executeChartQuery",value:function e(t){var r=this;var a=r.multiDataSourceMap[t.filter.dataSource.id];var i=t.getRootCondition().clone();r.providerHelper.updateRootCondition(i,a.sina);var o=a.sina.createChartQuery({dimension:t.dimension,dataSource:a,searchTerm:t.getSearchTerm(),rootCondition:i,top:t.top,skip:t.skip,sortOrder:t.sortOrder});return o.getResultSetAsync().then(function(e){return r.providerHelper.createMultiChartResultSet(e)})}},{key:"executeHierarchyQuery",value:function e(t){throw new z}},{key:"handleAllSuggestionSearch",value:function t(r){try{const t=this;var a=t;var i;var o=[];for(var u=0;u<t.multiSina.length;u++){i=t.multiSina[u].createSuggestionQuery({types:r.types,calculationModes:r.calculationModes,dataSource:t.multiSina[u].allDataSource,searchTerm:r.getSearchTerm(),top:r.top,skip:r.skip,sortOrder:r.sortOrder});o.push(i.getResultSetAsync())}return e(Promise.allSettled(o).then(function(e){var t=a.sina._createSuggestionResultSet({title:"Multi Suggestions",query:r,items:[]});for(var i=0;i<e.length;i++){var o=e[i];if(o.status==="fulfilled"){var u=a.providerHelper.updateSuggestionDataSource(o.value);t.items=(new n.RoundRobin).mergeMultiResults(t.items,u.items,i+1)}}return t}))}catch(e){return Promise.reject(e)}}},{key:"handleUserCategorySuggestionSearch",value:function t(r){try{const t=this;if(r.types.indexOf(t.sina.SuggestionType.DataSource)>=0){return e(t.handleAllSuggestionSearch(r))}else{var a=t.sina._createSuggestionResultSet({title:"Multi Suggestions - My Favorites",query:r,items:[]});return Promise.resolve(a)}}catch(e){return Promise.reject(e)}}},{key:"handleBusinessObjectSuggestionSearch",value:function t(r){try{const t=this;var a=t;var i=t.multiDataSourceMap[r.filter.dataSource.id];var o=i.sina.createSuggestionQuery({types:r.types,calculationModes:r.calculationModes,dataSource:i,searchTerm:r.getSearchTerm(),top:r.top,skip:r.skip,sortOrder:r.sortOrder});return e(o.getResultSetAsync().then(function(e){return a.providerHelper.updateSuggestionDataSource(e)}))}catch(e){return Promise.reject(e)}}},{key:"executeSuggestionQuery",value:function e(t){switch(this.getFilterDataSourceType(t.filter.dataSource)){case V.All:return this.handleAllSuggestionSearch(t);case V.UserCategory:return this.handleUserCategorySuggestionSearch(t);case V.BusinessObject:case V.Category:return this.handleBusinessObjectSuggestionSearch(t)}}}]);return a}(O);var Q={__esModule:true};Q.MultiProvider=q;return Q})})();
//# sourceMappingURL=Provider.js.map