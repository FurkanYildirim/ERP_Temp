/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){function e(e,t,r){if(r){return t?t(e):e}if(!e||!e.then){e=Promise.resolve(e)}return t?e.then(t):e}sap.ui.define(["../core/core","../core/util","./SinaObject","./Filter","./LogicalOperator","../core/errors","./FilteredDataSource"],function(t,r,n,i,o,u,l){function s(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function a(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function c(e,t,r){if(t)a(e.prototype,t);if(r)a(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function f(e,t){if(typeof t!=="function"&&t!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:true,configurable:true}});Object.defineProperty(e,"prototype",{writable:false});if(t)d(e,t)}function d(e,t){d=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return d(e,t)}function h(e){var t=p();return function r(){var n=S(e),i;if(t){var o=S(this).constructor;i=Reflect.construct(n,arguments,o)}else{i=n.apply(this,arguments)}return y(this,i)}}function y(e,t){if(t&&(typeof t==="object"||typeof t==="function")){return t}else if(t!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return v(e)}function v(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function p(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function S(e){S=Object.setPrototypeOf?Object.getPrototypeOf.bind():function e(t){return t.__proto__||Object.getPrototypeOf(t)};return S(e)}function b(e,t,r){if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}var m=n["SinaObject"];var _=i["Filter"];var k=o["LogicalOperator"];var O=u["QueryIsReadOnlyError"];var C=l["FilteredDataSource"];var R=function(n){f(o,n);var i=h(o);function o(e){var t,n,u,l,a;var c;s(this,o);c=i.call(this,e);b(v(c),"requestTimeout",false);c.top=(t=e.top)!==null&&t!==void 0?t:10;c.skip=(n=e.skip)!==null&&n!==void 0?n:0;c.sortOrder=(u=e.sortOrder)!==null&&u!==void 0?u:[];c.filter=(l=(a=e.filter)!==null&&a!==void 0?a:c.filter)!==null&&l!==void 0?l:new _({sina:c.sina});c.icon=e.icon;c.label=e.label;if(e.dataSource){c.filter.setDataSource(e.dataSource)}if(e.searchTerm){c.filter.setSearchTerm(e.searchTerm)}if(e.rootCondition){c.filter.setRootCondition(e.rootCondition)}if(c.requestTimeout){}c._execute=r.refuseOutdatedResponsesDecorator(c._execute);return c}c(o,[{key:"setTop",value:function e(){var t=arguments.length>0&&arguments[0]!==undefined?arguments[0]:10;this.top=t}},{key:"setSkip",value:function e(){var t=arguments.length>0&&arguments[0]!==undefined?arguments[0]:0;this.skip=t}},{key:"setSortOrder",value:function e(t){this.sortOrder=t}},{key:"_execute",value:function e(){try{return Promise.resolve()}catch(e){return Promise.reject(e)}}},{key:"clone",value:function e(){return}},{key:"equals",value:function e(r){return r instanceof o&&this.icon===r.icon&&this.label===r.label&&this.top===r.top&&this.skip===r.skip&&this.filter.equals(r.filter)&&t.equals(this.sortOrder,r.sortOrder)}},{key:"abort",value:function e(){}},{key:"getResultSetAsync",value:function t(){try{const t=this;if(t._lastQuery){if(t.equals(t._lastQuery)){return e(t._resultSetPromise)}if(!t.filter.equals(t._lastQuery.filter)){t.setSkip(0)}}t._lastQuery=t._createReadOnlyClone();var r;t._resultSetPromise=Promise.resolve().then(function(){return this._execute(this._lastQuery)}.bind(t)).then(function(e){r=e;return this._formatResultSetAsync(r)}.bind(t)).then(function(){return r}.bind(t));return e(t._resultSetPromise)}catch(e){return Promise.reject(e)}}},{key:"_genericFilteredQueryTransform",value:function e(t){if(!(t.filter.dataSource instanceof C)){return t}var r;if(t.filter.dataSource.filterCondition){if(t.filter.rootCondition.conditions.length>0){r=this.sina.createComplexCondition({operator:k.And,conditions:[t.filter.dataSource.filterCondition,t.filter.rootCondition]})}else{r=t.filter.dataSource.filterCondition}}else{r=t.filter.rootCondition}var n=this.sina.createFilter({dataSource:t.filter.dataSource.dataSource,searchTerm:t.filter.searchTerm,rootCondition:r});var i=t.clone();i.filter=n;return i}},{key:"_formatResultSetAsync",value:function e(t){return Promise.resolve()}},{key:"_setResultSet",value:function e(t){this._lastQuery=this._createReadOnlyClone();this._resultSetPromise=Promise.resolve().then(function(){return this._formatResultSetAsync(t)}.bind(this)).then(function(){return t});return this._resultSetPromise}},{key:"_createReadOnlyClone",value:function e(){var t=this.clone();t.getResultSetAsync=function(){throw new O("this query is readonly")};return t}},{key:"resetResultSet",value:function e(){this._lastQuery=null;this._resultSetPromise=null}},{key:"getSearchTerm",value:function e(){return this.filter.searchTerm}},{key:"getDataSource",value:function e(){return this.filter.dataSource}},{key:"getRootCondition",value:function e(){return this.filter.rootCondition}},{key:"setSearchTerm",value:function e(t){this.filter.setSearchTerm(t)}},{key:"setDataSource",value:function e(t){this.filter.setDataSource(t)}},{key:"setRootCondition",value:function e(t){this.filter.setRootCondition(t)}},{key:"resetConditions",value:function e(){this.filter.resetConditions()}},{key:"autoInsertCondition",value:function e(t){this.filter.autoInsertCondition(t)}},{key:"autoRemoveCondition",value:function e(t){this.filter.autoRemoveCondition(t)}},{key:"setFilter",value:function e(t){if(!this.filter.equals(t)){this.setSkip(0)}this.filter=t}}]);return o}(m);var P={__esModule:true};P.Query=R;return P})})();
//# sourceMappingURL=Query.js.map