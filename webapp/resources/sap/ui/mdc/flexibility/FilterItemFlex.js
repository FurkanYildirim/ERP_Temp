/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./ItemBaseFlex"],function(e){"use strict";var n=Object.assign({},e);n.findItem=function(e,n,t){return n.find(function(n){var i;if(e.targets==="jsControlTree"){i=n.getPropertyKey()}else{i=n.getAttribute("conditions");if(i){var r,a=i.indexOf("/conditions/");if(a>=0){i=i.slice(a+12);r=i.indexOf("}");if(r>=0){i=i.slice(0,r)}}}}return i===t})};n.beforeApply=function(e){if(e.applyConditionsAfterChangesApplied){e.applyConditionsAfterChangesApplied()}};n.addFilter=n.createAddChangeHandler();n.removeFilter=n.createRemoveChangeHandler();n.moveFilter=n.createMoveChangeHandler();return n},true);
//# sourceMappingURL=FilterItemFlex.js.map