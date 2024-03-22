//Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/f/library"],function(t){"use strict";var i=t.NavigationDirection;var o=function(){this._oFocusHistory={oLastGrid:null,sLastDirection:null,iLastRow:null,iTargetRow:null}};o.prototype._handleBorderReached=function(t,i){var o=this._getCurrentFocusElement();var r=t.getSource().getAggregation("_gridContainer");var e=t.getParameter("direction");var n=t.getParameter("row");var s=t.getParameter("column");if(this._isOppositeDirection(e)&&this._oFocusHistory.oLastGrid&&!this._oFocusHistory.oLastGrid.isDestroyed()&&n===this._oFocusHistory.iTargetRow){this._oFocusHistory.oLastGrid.focusItemByDirection(e,this._oFocusHistory.iLastRow,s);this._saveFocusHistory(r,e,n)}else{var a=this._findNextGrid(o,i,e);if(a){var u=this._findSuitableRowInGrid(a,o,e);a.focusItemByDirection(e,u,s);this._saveFocusHistory(r,e,n,u)}}};o.prototype._isOppositeDirection=function(t){switch(this._oFocusHistory.sLastDirection){case i.Right:return t===i.Left;case i.Left:return t===i.Right;case i.Up:return t===i.Down;case i.Down:return t===i.Up;default:return false}};o.prototype._findNextGrid=function(t,i,o){var r=this._getAllGrids(i);var e=[];r.forEach(function(i){if(i===t){return}var r=this._getDistanceToElementInDirection(t,i.getDomRef(),o);if(r){e.push({oGrid:i,iDistance:r})}}.bind(this));var n=e.sort(function(t,i){return t.iDistance-i.iDistance});return n[0]?n[0].oGrid:null};o.prototype._getAllGrids=function(t){var i=t.getRows();var o=[];i.forEach(function(t){var i=t.getColumns();i.forEach(function(t){var i=t.getCells();i.forEach(function(t){var i=t.getAggregation("_gridContainer");if(i){o.push(i)}})})});return o};o.prototype._findSuitableRowInGrid=function(t,i,o){var r=t.getNavigationMatrix();var e;var n;e=r.findIndex(function(t){return t.find(function(t){if(t===false||t===n){return false}n=t;if(this._getDistanceToElementInDirection(i,t,o)!==null){return true}}.bind(this))}.bind(this));return e>=0?e:0};o.prototype._getDistanceToElementInDirection=function(t,o,r){var e=o.getBoundingClientRect();var n=t.getBoundingClientRect();switch(r){case i.Right:if(n.right<e.left&&n.bottom>e.top&&n.top<e.bottom){return e.left-n.right}break;case i.Left:if(n.left>e.right&&n.bottom>e.top&&n.top<e.bottom){return n.left-e.right}break;case i.Down:if(n.bottom<e.top&&n.left<e.right&&n.right>e.left){return e.top-n.bottom}break;case i.Up:if(n.top>e.bottom&&n.left<e.right&&n.right>e.left){return n.top-e.bottom}break;default:break}return null};o.prototype._saveFocusHistory=function(t,i,o,r){this._oFocusHistory.oLastGrid=t;this._oFocusHistory.sLastDirection=i;this._oFocusHistory.iLastRow=o;this._oFocusHistory.iTargetRow=r};o.prototype._getCurrentFocusElement=function(){return document.activeElement};return o});
//# sourceMappingURL=WorkPageBuilder.accessibility.js.map