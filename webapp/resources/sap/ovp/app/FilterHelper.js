/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ui/model/Filter"],function(t){"use strict";function n(t,n,r,a){var i=[];if(n.length>0&&t){var o=t.entityType;var f=e(t.property,n[0],t.name,o,r,a);if(f){i.push(f)}}return i}function e(n,a,i,o,f,p){if(!a._bMultiFilter){a.sPath=a.sPath.split("/").pop();var s=r(n,a.sPath,i,o,f,p);if(s){a.sPath=s;return a}}else{var u=a.aFilters;var m,v=[];if(u){for(var c=0;c<u.length;c++){m=e(n,u[c],i,o,f,p);if(m){v.push(m)}}if(v.length>0){return new t(v,a.bAnd)}}}}function r(t,n,e,r,a,i){var o,f;for(o=0;o<t.length;o++){if(t[o].name===n){f=t[o].name;return f}if("P_"+t[o].name===n||t[o].name==="P_"+n){f=t[o].name;return f}}if(!e||!r||!a||!i){return}var p=a&&a.oMetadata&&a.oMetadata._getEntityTypeByName(e);var s=i.oMetadata._getEntityTypeByName(r);if(!p||!s){return}var u="com.sap.vocabularies.Common.v1.SemanticObject";var m="com.sap.vocabularies.Common.v1.SemanticObjectMapping";var v=a.oAnnotations.getAnnotationsData();if(!v||!v.propertyAnnotations){return}var c=v.propertyAnnotations[p.namespace+"."+p.name];var l=i.oAnnotations.getAnnotationsData();if(!l||!l.propertyAnnotations){return}var y=l.propertyAnnotations[s.namespace+"."+s.name];var g=y&&y[n];if(!g||!g[u]){return}var h,P,A,b,d;for(h in c){P=c[h];if(P[u]&&P[u].String===g[u].String){A=P[m];if(!A){continue}b=A.length;d="";while(b--){if(A[b].SemanticObjectProperty.String===n){d=A[b].LocalProperty.PropertyPath;break}}if(d!==""){for(o=0;o<t.length;o++){if(t[o].name===d){f=t[o].name;return f}}}}}return f}function a(t,n){return t}return{getEntityRelevantFilters:n,mergeFilters:a}});
//# sourceMappingURL=FilterHelper.js.map