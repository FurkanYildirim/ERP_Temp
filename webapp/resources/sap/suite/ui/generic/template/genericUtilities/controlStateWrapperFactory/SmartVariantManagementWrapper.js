sap.ui.define([],function(){"use strict";function t(t,e,a,n){var r,o,i;var c=new Promise(function(t){o=t});if(typeof t!=="string"){f(t)}n.managedControlWrappers=n.managedControlWrappers.map(a.getSuppressChangeEventWhenApplyingWrapper);n.managedControlWrappers.forEach(function(t){if(!t.bVMConnection){t.attachStateChanged(function(){r.currentVariantSetModified(true)})}});function f(t){r=t;o(r)}var u=n.managedControlWrappers.find(function(t){return t.setSVMWrapperCallbacks});if(u){u.setSVMWrapperCallbacks({getManagedControlStates:function(){var t=Object.create(null);n.managedControlWrappers.forEach(function(e){if(!e.bVMConnection){t[e.getLocalId()]=e.getState()}});return t},setManagedControlStates:function(t){n.managedControlWrappers.forEach(function(e){if(!e.bVMConnection){e.setState(t[e.getLocalId()])}})},setHeaderState:function(t){n.dynamicPageWrapper.setHeaderState(e,t)}})}function d(t){if(u){u.suppressSelection(true)}r.setCurrentVariantId(t);if(u){u.suppressSelection(false)}}function s(t){n.managedControlWrappers.forEach(function(e){e.setState(t.managedControlStates[e.getLocalId()])})}function p(){if(!r){return i}var t=Object.create(null);n.managedControlWrappers.forEach(function(e){t[e.getLocalId()]=e.getState()});return{variantId:r.getCurrentVariantId(),modified:r.currentVariantGetModified(),managedControlStates:t}}function l(t){i=t;c.then(function(){if(!i){d(r.getDefaultVariantId());return}if(i.modified){d("");r.currentVariantSetModified(true);s(i)}else{d(i.variantId);if(i.managedControlStates){if(u){u.setState(i.managedControlStates[u.getLocalId()])}if(i.variantId!==r.getCurrentVariantId()){r.currentVariantSetModified(true)}}}})}function g(t){c.then(function(){r.attachSelect(t);r.attachAfterSave(t);n.managedControlWrappers.forEach(function(e){e.attachStateChanged(t)})})}return{getState:p,setState:l,setControl:f,attachStateChanged:g}}return t});
//# sourceMappingURL=SmartVariantManagementWrapper.js.map