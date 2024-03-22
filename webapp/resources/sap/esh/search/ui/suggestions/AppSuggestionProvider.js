/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){function e(e,t,r){if(r){return t?t(e):e}if(!e||!e.then){e=Promise.resolve(e)}return t?e.then(t):e}sap.ui.define(["../i18n","sap/esh/search/ui/SearchHelper","./SuggestionType"],function(t,r,n){function i(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach(function(t){u(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function u(e,t,r){if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}function s(e,t){var r=typeof Symbol!=="undefined"&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=l(e))||t&&e&&typeof e.length==="number"){if(r)e=r;var n=0;var i=function(){};return{s:i,n:function(){if(n>=e.length)return{done:true};return{done:false,value:e[n++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o=true,a=false,u;return{s:function(){r=r.call(e)},n:function(){var e=r.next();o=e.done;return e},e:function(e){a=true;u=e},f:function(){try{if(!o&&r.return!=null)r.return()}finally{if(a)throw u}}}}function l(e,t){if(!e)return;if(typeof e==="string")return c(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor)r=e.constructor.name;if(r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return c(e,t)}function c(e,t){if(t==null||t>e.length)t=e.length;for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function p(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function f(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function g(e,t,r){if(t)f(e.prototype,t);if(r)f(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}var d=i(t);var v=n["Type"];var h=n["SuggestionType"];var y=function(){function t(e){p(this,t);this.model=e.model;this.suggestionHandler=e.suggestionHandler;this.suggestApplications=r.refuseOutdatedRequests(this.suggestApplicationsNotDecorated)}g(t,[{key:"abortSuggestions",value:function e(){this.suggestApplications.abort()}},{key:"combineSuggestionsWithIdenticalTitle",value:function e(t){var r;var n={};for(var i=0;i<t.length;i++){r=t[i];var o=n[r.title+r.subtitle];if(o){if(!o.combinedSuggestionExists){var a={title:"combinedAppSuggestion"+i,subtitle:r.subtitle,sortIndex:o.sortIndex,url:this.model.searchUrlParser.renderFromParameters(this.model.appTopDefault,this.model.sinaNext.createFilter({dataSource:this.model.appDataSource,searchTerm:r.title}),false),label:d.getText("suggestion_in_apps",r.label),icon:"sap-icon://none",keywords:"",uiSuggestionType:v.App};var u=d.getText("suggestion_in_apps",[""]);a.label=a.label.replace(u,"<i>"+u+"</i>");n[a.title+a.subtitle]=a;o.combinedSuggestionExists=true}}else{r.sortIndex=i;n[r.title+r.subtitle]=r}}t=[];for(var s in n){if(Object.prototype.hasOwnProperty.call(n,s)){r=n[s];if(!r.combinedSuggestionExists){t.push(r)}}}t.sort(function(e,t){return e.sortIndex-t.sortIndex});return t}},{key:"addAsterisk4ShowAllApps",value:function e(t){var r=t.match(/\S+/g);if(r.length>0){var n;var i=[];for(var o=0;o<r.length;o++){n=r[o];if(n&&n.lastIndexOf("*")!==n.length-1){i.push(n+"*")}else{i.push(n)}}t=i.join(" ")}return t}},{key:"createShowMoreSuggestion",value:function e(t){var r=d.getText("showAllNApps",[t]);r=r.replace(/"/g,"");var n=r;var i="<i>"+r+"</i>";return{title:r,tooltip:n,label:i,dataSource:this.model.appDataSource,labelRaw:this.model.getProperty("/uiFilter/searchTerm"),uiSuggestionType:v.SearchTermData,searchTerm:this.model.getProperty("/uiFilter/searchTerm")||""}}},{key:"getSuggestions",value:function t(r){try{const t=this;var n;var i=t.model.getDataSource();var o=t.model.userCategoryManager;var u=(o===null||o===void 0?void 0:o.isFavActive())&&(o===null||o===void 0?void 0:(n=o.getCategory("MyFavorites"))===null||n===void 0?void 0:n.includeApps);if(i!==t.model.allDataSource&&i!==t.model.appDataSource&&!(i===t.model.favDataSource&&u)){return Promise.resolve([])}var l=t.model.getProperty("/uiFilter/searchTerm");return e(t.suggestApplications(l),function(e){var r=e.getElements();r=t.combineSuggestionsWithIdenticalTitle(r);var n=[];var o=s(r),u;try{for(o.s();!(u=o.n()).done;){var l=u.value;var c=a(a({},l),{},{uiSuggestionType:v.App,dataSource:t.model.appDataSource,position:h.properties.App.position,key:h.App+l.url+l.icon});n.push(c)}}catch(e){o.e(e)}finally{o.f()}var p=t.suggestionHandler.getSuggestionLimit(v.App);n=n.slice(0,p);if(e.totalResults>p&&i===t.model.appDataSource){n.push(t.createShowMoreSuggestion(e.totalResults))}return n})}catch(e){return Promise.reject(e)}}},{key:"suggestApplicationsNotDecorated",value:function e(t){return sap.ushell.Container.getServiceAsync("Search").then(function(e){return e.queryApplications({searchTerm:t,suggestion:true})})}}]);return t}();return y})})();
//# sourceMappingURL=AppSuggestionProvider.js.map