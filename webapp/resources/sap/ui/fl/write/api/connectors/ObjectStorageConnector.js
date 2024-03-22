/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/strings/hash","sap/base/util/restricted/_uniqBy","sap/base/util/each","sap/base/util/merge","sap/ui/fl/write/connectors/BaseConnector","sap/ui/fl/initial/_internal/StorageUtils","sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils"],function(e,t,n,r,i,a,o){"use strict";function s(e){var t=[];return o.forEachObjectInStorage(e,function(e){t.push(e.changeDefinition)}).then(function(){return t})}function c(e,t){var n=true;if(e.selectorIds){if(t.selector){n=e.selectorIds.indexOf(t.selector.id)>-1}else{n=false}}if(n&&e.changeTypes){n=e.changeTypes.indexOf(t.changeType)>-1}return n}function u(e,t){if(!e.creation){var n=Date.now()+t;e.creation=new Date(n).toISOString()}return e}function f(t){return e(t.reduce(function(e,t){return e+new Date(t.creation).getTime()},""))}function l(e,t){n(e,function(e,r){r.forEach(function(e){n(e,function(e,n){t(n,e)})})})}function g(e,t){var n=[];var r=0;l(e,function(e,i){var a=o.createFlexKey(i);var s=t.find(function(t){return t.getId()===e.fileName});if(!s.getCreation()){var c=Date.now()+r;r++;s.setCreation(new Date(c).toISOString())}n.push({key:a,value:s})});return n}function h(e,t){var n=[];l(e,function(e,r){var i=o.createFlexKey(r);var a;t.some(function(e){if(e.getId()===r){a=e;return true}});n.push({key:i,value:a})});return n}function v(e,t){var r=[];n(e,function(e,n){if(n.length<2){return}var i=t.filter(function(t){return t.getFileType()===e});i.forEach(function(e,t){if(n.indexOf(e.getId())>-1&&t<i.length-1){var a=i[t+1];var s=new Date(e.getCreation());var c=new Date(a.getCreation());if(a&&s>=c){var u=s.getTime()+1;a.setCreation(new Date(u).toISOString());var f=o.createFlexKey(a.getId());r.push({key:f,value:a})}}})});return r}function d(e){var t=[];if(e){Object.values(e).forEach(function(e){e.forEach(function(e){var n=o.createFlexKey(e);t.push(this.storage.removeItem(n))}.bind(this))}.bind(this))}return t}var b=r({},i,{storage:undefined,layers:["ALL"],loadFlexData:function(e){return s({storage:this.storage,reference:e.reference}).then(function(e){a.sortFlexObjects(e);var t=a.getGroupedFlexObjects(e);var n=a.filterAndSortResponses(t);if(n.length){n[0].cacheKey=f(e)}return n})},write:function(e){var t=e.flexObjects.map(function(e,t){var n=o.createFlexObjectKey(e);e=u(e,++t);var r=this.storage._itemsStoredAsObjects?e:JSON.stringify(e);return this.storage.setItem(n,r)}.bind(this));return Promise.all(t).then(function(){})},update:function(e){var t=e.flexObject;var n=o.createFlexObjectKey(e.flexObject);var r=this.storage._itemsStoredAsObjects?t:JSON.stringify(t);var i=this.storage.setItem(n,r);return Promise.resolve(i)},reset:function(e){return o.forEachObjectInStorage({storage:this.storage,reference:e.reference,layer:e.layer},function(t){if(c(e,t.changeDefinition)){return Promise.resolve(this.storage.removeItem(t.key)).then(function(){return{fileName:t.changeDefinition&&t.changeDefinition.fileName}})}}.bind(this)).then(function(e){return{response:e.filter(function(e){return!!e})}})},remove:function(e){var t=o.createFlexObjectKey(e.flexObject);this.storage.removeItem(t);var n=this.storage.removeItem(t);return Promise.resolve(n)},loadFeatures:function(){return Promise.resolve({isKeyUser:true,isVariantSharingEnabled:true,isProductiveSystem:false,isCondensingEnabled:true,isContextSharingEnabled:false})},getFlexInfo:function(e){e.storage=this.storage;return o.getAllFlexObjects(e).then(function(e){return{isResetEnabled:e.length>0}})},condense:function(e){var n=e.flexObjects;var r=[];r=r.concat(g(n.create,e.condensedChanges));r=r.concat(h(n.update,e.condensedChanges));r=r.concat(v(n.reorder,e.condensedChanges));r=t(r,"key");var i=[];i=i.concat(d.call(this,n.delete));r.forEach(function(e){var t=e.value.convertToFileContent();var n=this.storage._itemsStoredAsObjects?t:JSON.stringify(t);i.push(this.storage.setItem(e.key,n))}.bind(this));return Promise.all(i)}});return b});
//# sourceMappingURL=ObjectStorageConnector.js.map