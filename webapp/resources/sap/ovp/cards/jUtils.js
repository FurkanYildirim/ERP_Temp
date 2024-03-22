/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([],function(){"use strict";return{setAttributeToMultipleElements:function(e,t,n){var r=document.querySelectorAll(e);for(var l=0;l<r.length;l++){r[l].setAttribute(t,n)}},getElementWidth:function(e){return parseFloat(getComputedStyle(e.getDomRef(),null).width.replace("px",""))},getElementHeight:function(e){return parseFloat(getComputedStyle(e.getDomRef(),null).height.replace("px",""))},removeElementById:function(e){var t=document.getElementById(e);if(t){t.parentNode.removeChild(t)}return},addClassToAllElements:function(e,t){if(e){if(e.length){e.forEach(function(e){e.classList.add(t)})}else{e.classList.add(t)}}},removeClassToAllElements:function(e,t){if(e){if(e.length){e.forEach(function(e){e.classList.remove(t)})}else{e.classList.remove(t)}}},checkIfFunction:function(e){if(typeof e==="function"){return true}return false},getIndex:function(e){var t=e.parentNode.childNodes;var n=0;for(var r=0;r<t.length;r++){if(t[r]==e){return n}if(t[r].nodeType==1){n++}}return-1},addStyleToAllElements:function(e,t,n){if(e){if(e.length){e.forEach(function(e){e.style[t]=n})}else{e.style[t]=n}}},addAttributeToAllElements:function(e,t,n){if(e){if(e.length){e.forEach(function(e){e.setAttribute(t,n)})}else{e.setAttribute(t,n)}}},getOuterHeight:function(e){var t=e.offsetHeight;var n=getComputedStyle(e);t+=parseInt(n.marginTop,10)+parseInt(n.marginBottom,10);return t},removeAttributesFromAll:function(e,t,n){if(e){e.forEach(function(e){var r=e.querySelectorAll(t);if(r){for(var l=0;l<r.length;l++){r[l].removeAttribute(n)}}})}}}},true);
//# sourceMappingURL=jUtils.js.map