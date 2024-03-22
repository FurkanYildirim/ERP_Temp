/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./definitions"],function(e){
/** Copyright 2019 SAP SE or an SAP affiliate company. All rights reserved. */
var t=e["Term"];var a=e["Phrase"];var r=e["Expression"];var i=e["SearchQueryLogicalOperator"];var o=e["CustomFunction"];var n=e["FilterFunction"];var s=e["LogicalOperator"];var c=e["SEARCH_DEFAULTS"];var u=e["escapeQuery"];var f;(function(e){e[e["Term"]=0]="Term";e[e["Phrase"]=1]="Phrase"})(f||(f={}));var p=function e(){var t;var a=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};if(a.metadataCall){var i=a.resourcePath?a.resourcePath:"/$metadata";if(a.metadataObjects){if(a.metadataObjects.entitySets){i+="/EntitySets("+a.metadataObjects.entitySets+")"}else{if(a.metadataObjects.format){i+="?$format="+a.metadataObjects.format}if(a.metadataObjects.collectionReference){i+="#"+a.metadataObjects.collectionReference}if(a.metadataObjects.contextEntitySet&&a.metadataObjects.primitiveTyp){i+="#"+a.metadataObjects.contextEntitySet+"("+a.metadataObjects.primitiveTyp+")"}else if(a.metadataObjects.contextEntitySet){i+="#"+a.metadataObjects.contextEntitySet}else if(a.metadataObjects.primitiveTyp){i+="#"+a.metadataObjects.primitiveTyp}}}return{path:i,parameters:{}}}var f="/$all";if(a.resourcePath){f=a.resourcePath}if((t=a)!==null&&t!==void 0&&t.suggestTerm){f+="/".concat(encodeURIComponent("GetSuggestion(term='"+a.suggestTerm.replace(/'/g,"''")+"')"))}if(a.eshParameters){var p=[];for(var m=0,g=Object.keys(a.eshParameters);m<g.length;m++){var y=g[m];p.push(y+"='"+encodeURIComponent(a.eshParameters[y])+"'")}if(p.length>0){f+="("+p.join(",")+")"}}var b=new r({operator:s.and,items:[]});if(!a){a={query:c.query,scope:c.scope,$select:[],facets:[]}}else{if(!a.query){a.query=c.query}if(!a.$select){a.$select=[]}if(!a.facets){a.facets=[]}}if(a.oDataFilter){b.items.push(a.oDataFilter)}if(b.items.length>0){a.oDataFilter=b}var h=f;var v=a.scope?"SCOPE:"+a.scope:"";if(a.searchQueryFilter){var d=a.searchQueryFilter.toStatement().trim();if(d.length>0){if(v!==""){v+=" "}v+=d}}if(a.freeStyleText){if(v!==""){v+=" "}var j=l(a.freeStyleText);v+=j.toStatement()}if(a.query&&a.query!==""){if(v!==""){v+=" "}v+=u(a.query)}var S={};for(var $=0,O=Object.keys(a);$<O.length;$++){var T=O[$];switch(T){case"query":if(a.$apply){break}var k=v===""?"":"filter(Search.search(query='"+v+"')";if(a.oDataFilter&&a.oDataFilter.items.length>0){k+=" and "+a.oDataFilter.toStatement()}if(v!==""){k+=")"}if(a.groupby&&a.groupby.properties&&a.groupby.properties.length>0){k+="/groupby((".concat(a.groupby.properties.join(","),")");if(a.groupby.aggregateCountAlias&&a.groupby.aggregateCountAlias!==""){k+=",aggregate($count as ".concat(a.groupby.aggregateCountAlias,")")}k+=")"}if(k!==""){S.$apply=k}break;case"$orderby":if(a.$orderby&&a.$orderby.length>0){S.$orderby=a.$orderby.map(function(e){return e.order?"".concat(e.key," ").concat(e.order):e.key}).join(",")}break;case"facets":if(a.facets&&a.facets.length>0){S[T]=a.facets.join(",")}break;case"$select":if(a.$select&&a.$select.length>0){S[T]=a.$select.join(",")}break;case"facetroot":if(a.facetroot&&a.facetroot.length>0){S.facetroot=a.facetroot.map(function(e){return e.toStatement()}).join(",")}break;case"$top":case"$skip":case"$count":case"whyfound":case"estimate":case"wherefound":case"facetlimit":case"valuehierarchy":case"filteredgroupby":S[T]=a[T];break;case"dynamicview":if(a.dynamicview){S[T]=a.dynamicview.map(function(e){return e.toStatement()}).join(" ")}break;case"$apply":if(a[T]instanceof o||a[T]instanceof n){var C=a[T].toStatement();if(a.groupby&&a.groupby.properties&&a.groupby.properties.length>0){C+="/groupby((".concat(a.groupby.properties.join(","),")");if(a.groupby.aggregateCountAlias&&a.groupby.aggregateCountAlias!==""){C+=",aggregate($count as ".concat(a.groupby.aggregateCountAlias,")")}C+=")"}S[T]=C}break;default:break}}return{path:h,parameters:S}};var m=function e(t){var a=p(t);var r=Object.keys(a.parameters).map(function(e){return encodeURIComponent(e)+"="+encodeURIComponent(a.parameters[e])}).join("&");if(r&&r!==""){return"".concat(a.path,"?").concat(r)}return a.path};var l=function e(o){var n=[];var s="";var c=f.Term;for(var u=0;u<o.length;u++){var p=o[u];if(p==='"'){if(c==f.Term){if(o.substring(u+1).indexOf('"')>=0){n.push(new t({term:s.trim()}));c=f.Phrase;s=""}else{n.push(new t({term:(s+o.substring(u)).trim()}));s="";break}}else{n.push(new a({phrase:s}));c=f.Term;s=""}}else{s+=o[u]}}if(s.length>0){n.push(new t({term:s.trim()}))}return new r({operator:i.TIGHT_AND,items:n})};var g={__esModule:true};g.createEshSearchQuery=p;g.getEshSearchQuery=m;g.parseFreeStyleText=l;return g})})();
//# sourceMappingURL=utils.js.map