/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";const n={scrollTableToRow:function(n,e){var t,o;const i=n.getRowBinding();const d=function(){if(n.data("tableType")==="GridTable"){return i.getContexts(0)}else{return i.getCurrentContexts()}};const u=function(){const t=d().find(function(n){return n&&n.getPath()===e});if(t&&t.getIndex()!==undefined){n.scrollToIndex(t.getIndex())}};if((n.getGroupConditions()===undefined||((t=n.getGroupConditions())===null||t===void 0?void 0:(o=t.groupLevels)===null||o===void 0?void 0:o.length)===0)&&i){const n=d();if(n.length===0&&i.getLength()>0||n.some(function(n){return n===undefined})){i.attachEventOnce("dataReceived",u)}else{u()}}}};return n},false);
//# sourceMappingURL=TableScroller.js.map