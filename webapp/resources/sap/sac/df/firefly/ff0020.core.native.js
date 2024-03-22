function _typeof(t){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},_typeof(t)
/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */}sap.ui.define(["sap/sac/df/firefly/ff0010.core"],function(t){"use strict";Object.keys=Object.keys||function(){var t=Object.prototype.hasOwnProperty,r=!{toString:null}.propertyIsEnumerable("toString"),e=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],i=e.length;return function(n){if(_typeof(n)!=="object"&&typeof n!=="function"||n===null){throw new TypeError("Object.keys called on a non-object")}var o=[];for(var a in n){if(t.call(n,a)){o.push(a)}}if(r){for(var s=0;s<i;s++){if(t.call(n,e[s])){o.push(e[s])}}}return o}}();t.XArrayWrapper=function(t){if(t){this.m_list=t.slice()}else{this.m_list=[]}};t.XArrayWrapper.prototype=new t.XObject;t.XArrayWrapper.prototype.releaseObject=function(){this.m_list=null;t.XObject.prototype.releaseObject.call(this)};t.XArrayWrapper.prototype.size=function(){return this.m_list.length};Object.defineProperty(t.XArrayWrapper.prototype,"length",{get:function t(){return this.m_list.length}});t.XArrayWrapper.prototype.isEmpty=function(){return this.m_list.length===0};t.XArrayWrapper.prototype.hasElements=function(){return this.m_list.length!==0};t.XArrayWrapper.prototype.toString=function(){return"["+this.m_list.join(",")+"]"};t.XArrayWrapper.prototype.set=function(t,r){if(t<0||t>=this.m_list.length){throw new Error("Illegal Argument: illegal index")}this.m_list[t]=r};t.XArrayWrapper.prototype.get=function(t){if(t<0||t>=this.m_list.length){throw new Error("Illegal Argument: illegal index")}return this.m_list[t]};t.XArrayWrapper.prototype.createArrayCopy=function(){return new t.XArray(-1,this.m_list)};t.XArrayWrapper.prototype.getListFromImplementation=function(){return this.m_list};t.XArrayWrapper.prototype.concat=function(){return this.m_list.concat.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.copyWithin=function(){return this.m_list.copyWithin.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.entries=function(){return this.m_list.entries.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.every=function(){return this.m_list.every.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.fill=function(){return this.m_list.fill.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.filter=function(){return this.m_list.filter.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.find=function(){return this.m_list.find.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.findIndex=function(){return this.m_list.findIndex.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.forEach=function(){return this.m_list.forEach.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.includes=function(){return this.m_list.includes.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.indexOf=function(){return this.m_list.indexOf.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.map=function(){return this.m_list.map.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.pop=function(){return this.m_list.pop.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.push=function(){return this.m_list.push.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.reduce=function(){return this.m_list.reduce.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.reduceRight=function(){return this.m_list.reduceRight.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.reverse=function(){return this.m_list.reverse.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.shift=function(){return this.m_list.shift.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.slice=function(){return this.m_list.slice.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.some=function(){return this.m_list.some.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.sort=function(){return this.m_list.sort.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.splice=function(){return this.m_list.splice.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.toLocaleString=function(){return this.m_list.toLocaleString.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.unshift=function(){return this.m_list.unshift.apply(this.m_list,arguments)};t.XArrayWrapper.prototype.values=function(){return this.m_list.values.apply(this.m_list,arguments)};t.QueuedCallbackProcessorHandle=function(t,r){if(t===null){throw new Error("Illegal State: illegal native callback")}this.m_nativeCallback=t;this.m_isErrorCallback=r;this._ff_c="QueuedCallbackProcessorHandle"};t.QueuedCallbackProcessorHandle.prototype={releaseObject:function r(){this.m_nativeCallback=null;t.QueuedCallbackProcessorHandle.$superclass.releaseObject.call(this)},processCallback:function t(){this.m_nativeCallback()},isErrorCallback:function t(){return this.m_isErrorCallback}};t.QueuedCallbackProcessorHandle.create=function(r,e){return new t.QueuedCallbackProcessorHandle(r,e)};t.XNativeComparator=function(t){this.m_xComparator=t;this.m_enclosing=null;this._ff_c="XNativeComparator"};t.XNativeComparator.prototype=new t.XObject;t.XNativeComparator.prototype.releaseObject=function(){this.m_xComparator=null;this.m_enclosing=null;t.XObject.prototype.releaseObject.call(this)};t.XNativeComparator.prototype.compare=function(t,r){return this.m_xComparator.compare(t,r)};t.XComparator=function(r){this._ff_c="XComparator";this.m_comparatorStrategy=r;this.m_nativeComparator=new t.XNativeComparator(this)};t.XComparator.prototype=new t.XObject;t.XComparator.create=function(r){return new t.XComparator(r)};t.XComparator.prototype.releaseObject=function(){this.m_comparatorStrategy=null;this.m_nativeComparator=t.XObjectExt.release(this.m_nativeComparator);t.XObject.prototype.releaseObject.call(this)};t.XComparator.prototype.getComparatorStrategy=function(){return this.m_comparatorStrategy};t.XComparator.prototype.compare=function(t,r){return this.m_comparatorStrategy.compare(t,r)};t.XComparator.prototype.getNativeComparator=function(){return this.m_nativeComparator};t.XNativeComparatorOfString=t.XNativeComparator;t.XComparatorOfString=function(r){this._ff_c="XComparatorOfString";this.m_comparatorStrategy=r;this.m_nativeComparator=new t.XNativeComparatorOfString(this)};t.XComparatorOfString.prototype=new t.XObject;t.XComparatorOfString.create=function(r){return new t.XComparatorOfString(r)};t.XComparatorOfString.prototype.releaseObject=function(){this.m_comparatorStrategy=null;this.m_nativeComparator=t.XObjectExt.release(this.m_nativeComparator);t.XObject.prototype.releaseObject.call(this)};t.XComparatorOfString.prototype.getStringComparatorStrategy=function(){return this.m_comparatorStrategy};t.XComparatorOfString.prototype.compare=function(t,r){return this.m_comparatorStrategy.compare(t,r)};t.XComparatorOfString.prototype.getNativeComparator=function(){return this.m_nativeComparator};t.XHashMapByString=function(){t.DfAbstractMapByString.call(this);this._ff_c="XHashMapByString";this.m_native={}};t.XHashMapByString.prototype=new t.DfAbstractMapByString;t.XHashMapByString.create=function(){return new t.XHashMapByString};t.XHashMapByString.prototype.createMapByStringCopy=function(){var r=new t.XHashMapByString;r.m_native=this.createMapCopyInternal();return r};t.XHashMapByString.prototype.clone=t.XHashMapByString.prototype.createMapByStringCopy;t.XHashMapByString.prototype.releaseObject=function(){this.m_native=null;t.DfAbstractKeyBagOfString.prototype.releaseObject.call(this)};t.XHashMapByString.prototype.getKeysAsIteratorOfString=function(){return this.getKeysAsReadOnlyListOfString().getIterator()};t.XHashMapByString.prototype.createMapCopyInternal=function(){var t={};for(var r in this.m_native){if(this.m_native.hasOwnProperty(r)){t[r]=this.m_native[r]}}return t};t.XHashMapByString.prototype.clear=function(){this.m_native={}};t.XHashMapByString.prototype.size=function(){return Object.keys(this.m_native).length};t.XHashMapByString.prototype.hasElements=function(){for(var t in this.m_native){if(this.m_native.hasOwnProperty(t)){return true}}return false};t.XHashMapByString.prototype.containsKey=function(t){if(t===null||t===undefined){return false}return this.m_native.hasOwnProperty(t)};t.XHashMapByString.prototype.contains=function(t){for(var r in this.m_native){if(this.m_native.hasOwnProperty(r)){var e=this.m_native[r];if(e===t||e!==null&&e.isEqualTo(t)){return true}}}return false};t.XHashMapByString.prototype.getByKey=function(t){var r=this.m_native[t];if(r===undefined){return null}return r};t.XHashMapByString.prototype.put=function(t,r){if(t===null||t===undefined){throw new Error("Illegal Argument: Key is null")}this.m_native[t]=r};t.XHashMapByString.prototype.remove=function(t){if(t!==null&&t!==undefined){var r=this.m_native[t];delete this.m_native[t];return r===undefined?null:r}return null};t.XHashMapByString.prototype.getKeysAsReadOnlyList=function(){var r=new t.XListOfString;for(var e in this.m_native){if(this.m_native.hasOwnProperty(e)){r.add(e)}}r.sortByDirection(t.XSortDirection.ASCENDING);return r};t.XHashMapByString.prototype.getKeysAsReadOnlyListOfString=t.XHashMapByString.prototype.getKeysAsReadOnlyList;t.XHashMapByString.prototype.getValuesAsReadOnlyList=function(){var r=new t.XList;for(var e in this.m_native){if(this.m_native.hasOwnProperty(e)){r.add(this.m_native[e])}}return r};t.XHashMapByString.prototype.getMapFromImplementation=function(){return this.m_native};t.XHashMapByString.prototype.toString=function(){return this.m_native.toString()};t.XHashMapOfStringByString=function(){t.DfAbstractMapOfStringByString.call(this);this._ff_c="XHashMapOfStringByString";this.m_native={}};t.XHashMapOfStringByString.prototype=new t.DfAbstractMapOfStringByString;t.XHashMapOfStringByString.create=function(){return new t.XHashMapOfStringByString};t.XHashMapOfStringByString.createMapOfStringByStringStaticCopy=function(r){if(r===null||r===undefined){return null}var e=new t.XHashMapOfStringByString;var i=r.getKeysAsIteratorOfString();while(i.hasNext()){var n=i.next();e.put(n,r.getByKey(n))}return e};t.XHashMapOfStringByString.prototype.createMapOfStringByStringCopy=function(){var r=new t.XHashMapOfStringByString;r.m_native=this.createMapCopyInternal();return r};t.XHashMapOfStringByString.prototype.releaseObject=function(){this.m_native=null;t.DfAbstractKeyBagOfString.prototype.releaseObject.call(this)};t.XHashMapOfStringByString.prototype.getValuesAsReadOnlyListOfString=function(){var r=new t.XListOfString;for(var e in this.m_native){if(this.m_native.hasOwnProperty(e)){r.add(this.m_native[e])}}r.sortByDirection(t.XSortDirection.ASCENDING);return r};t.XHashMapOfStringByString.prototype.getKeysAsReadOnlyListOfString=function(){var r=new t.XListOfString;for(var e in this.m_native){if(this.m_native.hasOwnProperty(e)){r.add(e)}}r.sortByDirection(t.XSortDirection.ASCENDING);return r};t.XHashMapOfStringByString.prototype.getKeysAsIteratorOfString=function(){return this.getKeysAsReadOnlyListOfString().getIterator()};t.XHashMapOfStringByString.prototype.contains=function(t){for(var r in this.m_native){if(this.m_native.hasOwnProperty(r)){var e=this.m_native[r];if(e===t){return true}}}return false};t.XHashMapOfStringByString.prototype.createMapCopyInternal=function(){var t={};for(var r in this.m_native){if(this.m_native.hasOwnProperty(r)){t[r]=this.m_native[r]}}return t};t.XHashMapOfStringByString.prototype.clear=function(){this.m_native={}};t.XHashMapOfStringByString.prototype.size=function(){return Object.keys(this.m_native).length};t.XHashMapOfStringByString.prototype.hasElements=function(){for(var t in this.m_native){if(this.m_native.hasOwnProperty(t)){return true}}return false};t.XHashMapOfStringByString.prototype.containsKey=function(t){if(t===null){return false}return this.m_native.hasOwnProperty(t)};t.XHashMapOfStringByString.prototype.getByKey=function(t){var r=this.m_native[t];return r===undefined?null:r};t.XHashMapOfStringByString.prototype.putIfNotNull=function(t,r){if(r!==null&&r!==undefined){this.put(t,r)}};t.XHashMapOfStringByString.prototype.put=function(t,r){if(t===null||t===undefined){throw new Error("Illegal Argument: Key is null")}this.m_native[t]=r};t.XHashMapOfStringByString.prototype.remove=function(t){if(t!==null&&t!==undefined){var r=this.m_native[t];delete this.m_native[t];return r===undefined?null:r}return null};t.XHashMapOfStringByString.prototype.getKeysAsReadOnlyList=function(){var r=new t.XListOfString;for(var e in this.m_native){if(this.m_native.hasOwnProperty(e)){r.add(e)}}r.sortByDirection(t.XSortDirection.ASCENDING);return r};t.XHashMapOfStringByString.prototype.getValuesAsReadOnlyList=function(){var r=new t.XList;for(var e in this.m_native){if(this.m_native.hasOwnProperty(e)){r.add(this.m_native[e])}}return r};t.XHashMapOfStringByString.prototype.getKeysAsIterator=function(){return new t.XIterator(this.getKeysAsReadOnlyList())};t.XHashMapOfStringByString.prototype.getMapFromImplementation=function(){return this.m_native};t.XHashMapOfStringByString.prototype.toString=function(){var r=this.getKeysAsIterator();var e=new t.XStringBuffer;while(r.hasNext()){var i=r.next();var n=this.getByKey(i);e.append(i+"="+n);if(r.hasNext()){e.append(",")}}return e.toString()};t.XHashSetOfString=function(){t.DfAbstractKeyBagOfString.call(this);this.m_native={};this._ff_c="XHashSetOfString"};t.XHashSetOfString.prototype=new t.DfAbstractSetOfString;t.XHashSetOfString.create=function(){return new t.XHashSetOfString};t.XHashSetOfString.prototype.createSetCopy=function(){var r=new t.XHashSetOfString;for(var e in this.m_native){if(this.m_native.hasOwnProperty(e)){r.m_native[e]=this.m_native[e]}}return r};t.XHashSetOfString.prototype.clone=t.XHashSetOfString.prototype.createSetCopy;t.XHashSetOfString.prototype.releaseObject=function(){this.m_native=null;t.XObject.prototype.releaseObject.call(this)};t.XHashSetOfString.prototype.clear=function(){for(var t in this.m_native){if(this.m_native.hasOwnProperty(t)){delete this.m_native[t]}}};t.XHashSetOfString.prototype.size=function(){return Object.keys(this.m_native).length};t.XHashSetOfString.prototype.hasElements=function(){for(var t in this.m_native){if(this.m_native.hasOwnProperty(t)){return true}}return false};t.XHashSetOfString.prototype.contains=function(t){if(t===null){return false}return this.m_native.hasOwnProperty(t)};t.XHashSetOfString.prototype.add=function(r){if(r===null){throw t.XException.createIllegalArgumentException("XHashSetOfString doesn't support null values")}this.m_native[r]=true};t.XHashSetOfString.prototype.removeElement=function(t){if(t!==null){delete this.m_native[t]}return t};t.XHashSetOfString.prototype.getValuesAsReadOnlyListOfString=function(){var r=new t.XListOfString;for(var e in this.m_native){if(this.m_native.hasOwnProperty(e)){r.add(e)}}r.sortByDirection(t.XSortDirection.ASCENDING);return r};t.XHashSetOfString.prototype.getValuesAsIterator=function(){return new t.XIterator(this.getValuesAsReadOnlyListOfString())};t.XHashSetOfString.prototype.toString=function(){return this.m_native.toString()};t.XIterator=function(t){this.m_readOnlyValues=t;this.m_position=-1;this._ff_c="XIterator"};t.XIterator.prototype=new t.XObject;t.XIterator.createFromList=function(r){return new t.XIterator(r)};t.XIterator.prototype.releaseObject=function(){this.m_readOnlyValues=null;this.m_position=null;t.XObject.prototype.releaseObject.call(this)};t.XIterator.prototype.hasNext=function(){return this.m_position+1<this.m_readOnlyValues.size()};t.XIterator.prototype.next=function(){return this.m_readOnlyValues.get(++this.m_position)};t.XList=function(r){t.XArrayWrapper.call(this,r);this._ff_c="XList"};t.XList.prototype=new t.XArrayWrapper;t.XList.create=function(){return new t.XList};t.XList.nativeSortAscending=function(t,r){return t.compareTo(r)};t.XList.nativeSortDescending=function(t,r){return r.compareTo(t)};t.XList.prototype.createListCopy=function(){return new t.XList(this.m_list)};t.XList.prototype.sublist=function(r,e){var i=e===-1?this.m_list.length:e;return new t.XList(this.m_list.slice(r,i))};t.XList.prototype.addAll=function(r){t.XListUtils.addAllObjects(r,this)};t.XList.prototype.add=function(t){this.m_list[this.m_list.length]=t};t.XList.prototype.isEqualTo=function(t){if(t===null){return false}if(this===t){return true}var r=this.m_list.length;if(r!==t.m_list.length){return false}var e,i;for(var n=0;n<r;n++){e=this.m_list[n];i=t.m_list[n];if(e===null&&i===null){continue}if(e===null||i===null){return false}if(!e.isEqualTo(i)){return false}}return true};t.XList.prototype.insert=function(t,r){var e=this.m_list.length;if(t<0||t>e){throw new Error("Illegal Argument: illegal index")}t=t||0;while(e>t){this.m_list[e]=this.m_list[--e]}this.m_list[t]=r};t.XList.prototype.clear=function(){this.m_list.length=0};t.XList.prototype.getIndex=function(t){var r=this.m_list.length;var e;var i;for(e=0;e<r;e++){i=this.m_list[e];if(i===t){return e}if(i!==null&&i.isEqualTo(t)){return e}}return-1};t.XList.prototype.contains=function(t){var r=this.m_list.length;var e;var i;for(e=0;e<r;e++){i=this.m_list[e];if(i===t){return true}if(i!==null&&i.isEqualTo(t)){return true}}return false};t.XList.prototype.moveElement=function(t,r){var e=this.m_list.length;if(t<0||t>=e){throw new Error("Illegal Argument: illegal fromIndex")}if(r<0||r>=e){throw new Error("Illegal Argument: illegal toIndex")}if(r!==t){t=t||0;r=r||0;var i=this.m_list[t];while(t<e){this.m_list[t]=this.m_list[++t]}--e;while(e>r){this.m_list[e]=this.m_list[--e]}this.m_list[r]=i}};t.XList.prototype.removeAt=function(t){var r=this.m_list.length;if(t<0||t>=r){throw new Error("Illegal Argument: illegal index")}t=t||0;var e=this.m_list[t];while(t<r){this.m_list[t]=this.m_list[++t]}--this.m_list.length;return e};t.XList.prototype.removeElement=function(t){var r;var e=this.m_list.length;var i;for(r=0;r<e;r++){i=this.m_list[r];if(i===t){break}if(i!==null&&i.isEqualTo(t)){break}}if(r<e){while(r<e){this.m_list[r]=this.m_list[++r]}--this.m_list.length}return t};t.XList.prototype.getIterator=function(){return new t.XIterator(this)};t.XList.prototype.getValuesAsReadOnlyList=function(){return this};t.XList.prototype.sortByDirection=function(t){var r=sap.firefly;if(t===r.XSortDirection.ASCENDING){this.m_list.sort(r.XList.nativeSortAscending)}else if(t===r.XSortDirection.DESCENDING){this.m_list.sort(r.XList.nativeSortDescending)}else{throw new Error("Illegal Argument: illegal sort direction")}};t.XList.prototype.sortByComparator=function(t){this.m_list.sort(function(r,e){return t.compare(r,e)})};t.XList.prototype.toString=function(){return"["+this.m_list.join(", ")+"]"};t.XListOfString=function(r){t.XList.call(this,r);this._ff_c="XListOfString"};t.XListOfString.prototype=new t.XList;t.XListOfString.create=function(){return new t.XListOfString};t.XListOfString.createFromReadOnlyList=function(r){return new t.XListOfString(r.m_list)};t.XListOfString.prototype.createListOfStringCopy=function(){return new t.XListOfString(this.m_list)};t.XListOfString.prototype.getIndex=function(t){var r=this.m_list.length;var e;for(e=0;e<r;e++){if(this.m_list[e]===t){return e}}return-1};t.XListOfString.prototype.addAll=function(r){t.XListUtils.addAllStrings(r,this)};t.XListOfString.prototype.removeElement=function(t){var r;var e=this.m_list.length;var i;for(r=0;r<e;r++){i=this.m_list[r];if(i===t){break}}if(r<e){while(r<e){this.m_list[r]=this.m_list[++r]}--this.m_list.length}return t};t.XListOfString.prototype.contains=function(t){var r=this.m_list.length;var e;for(e=0;e<r;e++){if(this.m_list[e]===t){return true}}return false};t.XListOfString.prototype.sortByDirection=function(r){if(r===t.XSortDirection.ASCENDING){this.m_list.sort()}else if(r===t.XSortDirection.DESCENDING){this.m_list.sort().reverse()}else{throw new Error("Illegal Argument: illegal sort direction")}};t.XListOfString.prototype.isEqualTo=function(t){if(t===null){return false}if(this===t){return true}var r=this.m_list.length;if(r!==t.m_list.length){return false}for(var e=0;e<r;e++){if(this.m_list[e]!==t.m_list[e]){return false}}return true};t.XListOfString.prototype.getIterator=function(){return new t.XIterator(this)};t.XListOfString.prototype.getValuesAsReadOnlyListOfString=function(){return this};t.XListOfString.prototype.copyFromExt=function(t,r,e,i){};t.XListOfString.prototype.createCopyByIndex=function(t,r){return null};t.XArray=function(r,e){this._ff_c="XArray";t.XArrayWrapper.call(this,e);var i;if(e===undefined&&r){this.m_list.length=r;for(i=0;i<r;i++){this.m_list[i]=null}}};t.XArray.prototype=new t.XArrayWrapper;t.XArray.create=function(r){return new t.XArray(r)};t.XArray.prototype.assertIndexIsValid=function(t){if(t>=this.m_list.length){throw new Error("Illegal Argument: Index exceeds size of this array")}};t.XArray.prototype.clear=function(){var t=this.m_list.length;var r;for(r=0;r<t;r++){this.m_list[r]=null}};t.XArrayOfInt=function(r,e){t.XArray.call(this,r,e);this._ff_c="XArrayOfInt";var i;if(e===undefined&&r){this.m_list.length=r;for(i=0;i<r;i++){this.m_list[i]=0}}};t.XArrayOfInt.prototype=new t.XArray;t.XArrayOfInt.create=function(r){return new t.XArrayOfInt(r)};t.XArrayOfInt.prototype.clear=function(){var t=this.m_list.length;var r;for(r=0;r<t;r++){this.m_list[r]=0}};t.XArrayOfInt.prototype.copyFromExt=function(t,r,e,i){if(r<0||e<0||i<0){throw new Error("Illegal Argument: Index must be >= 0")}if(e+i>this.m_list.length){throw new Error("Illegal Argument: DestinationIndex will exceed size of this array")}if(r+i>t.m_list.length){throw new Error("Illegal Argument: SourceIndex will exceed size of source array")}var n;for(n=0;n<i;n++){this.m_list[n+e]=t.m_list[n+r]}};t.XArrayOfInt.prototype.clone=function(){return new t.XArrayOfInt(-1,this.m_list)};t.XArrayOfInt.prototype.createCopyByIndex=function(r,e){var i=new t.XArrayOfInt(e);i.copyFromExt(this,r,0,e);return i};t.XArrayOfString=function(r,e){t.XArray.call(this,r,e);this._ff_c="XArrayOfString"};t.XArrayOfString.prototype=new t.XArray;t.XArrayOfString.create=function(r){return new t.XArrayOfString(r)};t.XArrayOfString.prototype.copyFromExt=function(t,r,e,i){if(r<0||e<0||i<0){throw new Error("Illegal Argument: Index must be >= 0")}if(e+i>this.m_list.length){throw new Error("Illegal Argument: DestinationIndex will exceed size of this array")}if(r+i>t.m_list.length){throw new Error("Illegal Argument: SourceIndex will exceed size of source array")}var n;for(n=0;n<i;n++){this.m_list[n+e]=t.m_list[n+r]}};t.XArrayOfString.prototype.clone=function(){return new t.XArrayOfString(-1,this.m_list)};t.XArrayOfString.prototype.createCopyByIndex=function(r,e){var i=new t.XArrayOfString(e);i.copyFromExt(this,r,0,e);return i};t.NativeXRegex=function(){this._ff_c="NativeXRegex"};t.NativeXRegex.prototype=new t.XRegex;t.NativeXRegex.staticSetup=function(){t.XRegex.setInstance(new t.NativeXRegex)};t.NativeXRegex.prototype.getFirstGroupOfMatch=function(t,r){var e=new RegExp(r);var i=t.match(e);return i&&i[1]?i[1]:null};t.PlatformModule=function(){t.DfModule.call(this);this._ff_c="PlatformModule"};t.PlatformModule.prototype=new t.DfModule;t.PlatformModule.s_module=null;t.PlatformModule.getInstance=function(){if(t.PlatformModule.s_module===null){if(t.CoreModule.getInstance()===null){throw new Error("Initialization Exception")}t.PlatformModule.s_module=t.DfModule.startExt(new t.PlatformModule);t.XLanguage.setLanguage(t.XLanguage.JAVASCRIPT);t.XPlatform.setPlatform(t.XPlatform.BROWSER);t.XSyncEnv.setSyncEnv(t.XSyncEnv.EXTERNAL_MAIN_LOOP);t.NativeXRegex.staticSetup();t.DfModule.stopExt(t.PlatformModule.s_module)}return t.PlatformModule.s_module};t.PlatformModule.prototype.getName=function(){return"ff0020.core.native"};t.PlatformModule.getInstance();return sap.firefly});
//# sourceMappingURL=ff0020.core.native.js.map