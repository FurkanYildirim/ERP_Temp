/*!
 * (c) Copyright 2010-2019 SAP SE or an SAP affiliate company.
 */
sap.ui.define(["jquery.sap.global","sap/base/Log","sap/zen/crosstab/utils/Utils"],function(jQuery,e){"use strict";e.info("loaded drag drop utils");jQuery.sap.declare("sap.zen.crosstab.dragdrop.DragDropUtils");sap.zen.crosstab.dragdrop.DragDropUtils=function(e){var r=e.getHeaderInfo();var t;var o;var i;var a=this;var n=false;this.init=function(e){o=e};this.setOnlyMeasuresMode=function(e){n=e};this.isOnlyMeasuresMode=function(){return n};this.getDimensionNameDromDragDropPayload=function(){var e=sap.zen.Dispatcher.instance.getDragDropPayload();var r=null;var t=null;if(e){t=e.oDragDropInfo;if(t){r=t.sDimensionName}}return r};this.getAreaInfo=function(r,t){var o={};var i;i=r.data("xtabcellid");o.oJqCell=jQuery(document.getElementById(i));o.oCell=sap.ui.getCore().getControl(o.oJqCell.attr("id"));o.oDimInfo=e.getHeaderInfo().getDimensionInfoByRowCol(o.oCell,t);return o};this.getCellInfoFromDropArea=function(t,o){var i;var a;var n;var s;var l=-1;var p=-1;var g;var u;var d;if(o==="droparea_above"||o==="droparea_below"){g="COLS"}else if(o==="droparea_before"||o==="droparea_after"){g="ROWS"}d=jQuery(document.getElementById(t.target.id));u=this.getAreaInfo(d,g);i=u.oDimInfo;n=u.oCell;s=this.getDimensionNameDromDragDropPayload();if(n&&s&&i){p=n.getTableRow();l=n.getTableCol();a={};a.sDropDimensionName=i.sDimensionName;a.oDropCell=n;a.iDropCellTableRow=p;a.iDropCellTableCol=l;a.bDropCellIsBottomRight=p===e.getTableMaxDimHeaderRow()&&l===e.getTableMaxDimHeaderCol();a.sDragDimensionName=s;a.sDropAxisName=i.sAxisName;if(a.sDropAxisName==="ROWS"){a.iDropAxisIndex=r.getAbsoluteColIndexForDimension(a.sDropDimensionName)}else if(a.sDropAxisName==="COLS"){a.iDropAxisIndex=r.getAbsoluteRowIndexForDimension(a.sDropDimensionName)}}return a};this.isExternalDropOnNonRemovableStructure=function(e,r){var t=false;if(this.isInterComponentDrag(r)){if(!e){return false}return e.bIsStructure&&!e.bIsRemoveStructureAllowed}return t};this.isInterComponentDrag=function(r){return r.sComponentId!==e.getId()};this.checkAcceptCrossComponent=function(e){if(!sap.zen.Dispatcher.instance.isInterComponentDragDropEnabled()){if(this.isInterComponentDrag(e)){return false}}return true};this.isDragFromOtherCrosstab=function(r){var t;var o;o=sap.zen.Dispatcher.instance.getControlForId(r.sComponentId);t=o.zenControlType&&o.zenControlType==="xtable"&&r.sComponentId!==e.getId();return t};this.getCrosstabHeaderCellFromDraggable=function(e){var r=sap.ui.getCore().byId(e.attr("id"));if(r){if(r.isHeaderCell&&r.isHeaderCell()){return r}}return null};this.getAxisNameFromAreaType=function(e){if(e==="droparea_above"||e==="droparea_below"){return"COLS"}return"ROWS"};this.checkDropAreaAccept=function(t,o,i,a){var n;var s=-1;var l=-1;var p=-1;var g=e.getTableMaxDimHeaderRow();var u=e.getTableMaxDimHeaderCol();var d=null;var c;var f;var D;var m;var h;if(this.isDragFromOtherCrosstab(i)===true){return false}m=this.getAxisNameFromAreaType(a);s=o.getTableRow();l=o.getTableCol();D=r.getDimensionInfoByRowCol(o,m);f=i.oDragDropInfo.sAxisName;if(!f||f&&f.length===0){f=m}if(i.sComponentId===e.getId()){n=this.getCrosstabHeaderCellFromDraggable(t);if(n.getId()===o.getId()){if(f!==D.sAxisName){return true}}}if(D){c=i.oDragDropInfo.sDimensionName;if(c===D.sDimensionName){return false}h=a==="droparea_above"||a==="droparea_before";if(!h&&f===D.sAxisName){if(D.sAxisName=="ROWS"){p=l+o.getColSpan();if(p<=u){d=r.getDimensionInfoByCol(p)}}else if(D.sAxisName==="COLS"){p=s+o.getRowSpan();if(p<=g){d=r.getDimensionInfoByRow(p)}}if(d){if(d.sDimensionName===c){return false}}}}else{return false}return true};this.returnFromGenericDimMoveToAreasCheck=function(e,r){e.data("xtabrevertdrop",!r);sap.zen.Dispatcher.instance.setDropAccepted(e.attr("id"),r);return r};this.checkAcceptExternalDimension=function(r){if(r&&r.oDragDropInfo){if(this.isInterComponentDrag(r)){if(e.getHeaderInfo().isDimensionInCrosstab(r.oDragDropInfo.sDimensionName)){return false}}}return true};this.checkGenericDimMoveToAreasAccept=function(r,t,i,a,s,l){var p;var g=o.getCurrentDropArea();p=sap.zen.Dispatcher.instance.getDragDropPayload();if(e.isBlocked()||!p||p&&p.oDragDropInfo.bIsMemberDrag){return this.returnFromGenericDimMoveToAreasCheck(r,false)}if(!this.checkAcceptExternalDimension(p)){return this.returnFromGenericDimMoveToAreasCheck(r,false)}if(l){if(!this.checkDroppableInArea(r,this.determineValidHeaderRect())){return this.returnFromGenericDimMoveToAreasCheck(r,false)}}if(g){if(r.attr("id")!==g.attr("id")){return this.returnFromGenericDimMoveToAreasCheck(r,false)}}if(this.isInterComponentDrag(p)){if(!this.checkAcceptCrossComponent(p)){return this.returnFromGenericDimMoveToAreasCheck(r,false)}}if(!n){if(!this.checkDropAreaAccept(t,a,p,s)){return this.returnFromGenericDimMoveToAreasCheck(r,false)}}return this.returnFromGenericDimMoveToAreasCheck(r,true)};this.checkMouseInRenderSizeDiv=function(r){var t=false;var o;o=e.getRenderSizeDiv()[0].getBoundingClientRect();t=r.clientX>o.left&&r.clientX<o.right;t=t&&(r.clientY>o.top&&r.clientY<o.bottom);return t};this.determineValidHeaderRect=function(){var r;var t;r=e.getDimHeaderAreaDiv();if(r.length===0){r=e.getRowHeaderAreaDiv()}t=this.getBoundingClientRect(r[0]);return t};this.checkDroppableInArea=function(r,t){var o;if(!e.isHeaderHScrolling()){return true}o=r[0].getBoundingClientRect();if(o.right>t.left&&o.right<t.right||(o.left<t.right&&o.right>t.right||o.left>t.left&&o.right<t.right)){return true}return false};this.setCurrentJqDragCell=function(e){t=e};this.getCurrentJqDragCell=function(){return t};this.checkDragRevert=function(e){var r;var t;var o;var i;var n;i=jQuery(this).data("oRevertPosInfo");if(i){n=a.getRevertPosition(i);jQuery(this).data("uiDraggable").originalPosition=n}if(!sap.zen.Dispatcher.instance.isDragDropCanceled()){t=jQuery(e).data("xtabcellid");if(t&&t.length>0){o=jQuery(e).data("xtabrevertdrop");return o}else{t=jQuery(e).attr("id");r=sap.ui.getCore().getControl(t);if(r&&r.isRevertDrop){return r.isRevertDrop()}return false}}return true};this.resetDragDrop=function(){sap.zen.Dispatcher.instance.setDragDropCanceled(false);e.setDragAction(false);i=null};this.buildDimensionDragDropInfo=function(e){var r={};if(e){if(e.sDimensionName&&e.sDimensionName.length>0){r.sDimensionName=e.sDimensionName}if(e.sAttributeName&&e.sAttributeName.length>0){r.sAttributeName=e.sAttributeName}if(e.sAxisName&&e.sAxisName.length>0){r.sAxisName=e.sAxisName}if(e.bIsMeasureStructure===true){r.bIsMeasureStructure=true}if(e.bIsStructure===true){r.bIsStructure=true;r.bIsRemoveStructureAllowed=e.bIsRemoveStructureAllowed}}r.bIsMemberDrag=false;r.iMemberRow=-1;r.iMemberCol=-1;return r};this.makeDropAreaDroppable=function(e,r,t,i){e.droppable();e.droppable("option","hoverClass",r+"Active");e.droppable("option","addClasses",false);e.droppable("option","greedy",true);e.droppable("option","tolerance","pointer");e.droppable("option","accept",t);e.droppable("option","drop",i);e.droppable("option","over",o.onDropAreaOver);e.droppable("option","out",o.onDropAreaOut)};this.makeCellDroppable=function(e,r,t){e.droppable();e.droppable("option","addClasses",false);e.droppable("option","greedy",true);e.droppable("option","tolerance","pointer");e.droppable("option","accept",r);e.droppable("option","drop",t);e.droppable("option","over",o.onDropCellOver);e.droppable("option","out",o.onDropCellOut)};this.makeCellDraggable=function(r,t){r.draggable();r.draggable("option","cursor","move");r.draggable("option","cursorAt",{top:-5});r.draggable("option","appendTo",document.getElementById(e.getId()));r.draggable("option","addClasses",true);r.draggable("option","helper",t);r.draggable("option","revert",this.checkDragRevert);r.draggable("option","stop",this.resetDragDrop);o.provideDraggableCellCursor(r);jQuery(r.draggable()).mousedown(function(e){if(sap.zen.crosstab.utils.Utils.isDispatcherAvailable){sap.zen.Dispatcher.instance.closeContextMenu()}sap.zen.crosstab.utils.Utils.cancelEvent(e)})};this.getDropAreaTypeFromDropAreaId=function(e){return e.substring(e.indexOf("droparea_"))};this.checkDropAllowedOnCrosstabElement=function(e){return!sap.zen.Dispatcher.instance.isDragDropCanceled()&&!e.buttons&&this.checkMouseInRenderSizeDiv(e)};this.findCell=function(r){var t=r.closest("div");var o=e.getUtils().getCellIdFromContenDivId(t.attr("id"));var i=sap.ui.getCore().byId(o);return i};this.getBoundingClientRect=function(r){return e.getUtils().getRtlAwareBoundingClientRect(r)};this.getDeleteDragGhostCellRowHtml=function(r){var t="<tr><td colspan="+r+">";t+='<div id="'+e.getId()+'_dragtrash" class="sapzencrosstab-Trashcan"></div>';t+="</td></tr>";return t};this.setCurrentDragHelper=function(e){i=e};this.saveRevertCellPosInfo=function(e,r,t){var o={};var i;o.oCell=e;o.aCells=r;o.sAxisName=t;i=jQuery(document.getElementById(e.getId()));i.data("oRevertPosInfo",o)};this.getRevertPosition=function(r){var t;var o;var a;var n;var s=r.oCell;var l=r.aCells;var p=r.sAxisName;n=l[0];t=jQuery(document.getElementById(n.getId()));o=t.position();if(e.getPropertyBag().isRtl()||s.isSplitPivotCell()){if(l.length>1){n=l[l.length-1];t=jQuery(document.getElementById(n.getId()))}}if(e.getPropertyBag().isRtl()){o.left=t.position().left+(e.isVScrolling()?e.getRenderEngine().getMeasuringHelper().getBrowserScrollbarWidth():0)}if(n.isSplitPivotCell()&&p&&p==="COLS"){a=e.getUtils().getRtlAwareBoundingClientRect(t[0]);if(e.getPropertyBag().isRtl()){o.left=o.left-(i?Math.round(i.outerWidth()/2):Math.round(a.width/2))}else{o.left=o.left+Math.round(a.width/2)}}return o};this.setCursorAt=function(r,t){var o=0;var i=0;var a=jQuery(document.getElementById(e.getId()));var n=jQuery(document.getElementById(r.getId()));a.append(t);o=t.outerWidth();t.remove();i=Math.round(o/2);n.draggable("option","cursorAt",{top:-5,left:i})};this.getAllMemberCellsInRowOrCol=function(e){var r=e.getArea();var t=0;var o;var i=[];if(r.isRowHeaderArea()){while(t<r.getColCnt()){o=r.getCellWithColSpan(e.getRow(),t);if(o){i.push(o);t=t+o.getColSpan()}else{t++}}}else if(r.isColHeaderArea()){while(t<r.getRowCnt()){o=r.getCellWithRowSpan(t,e.getCol());if(o){i.push(o);t=t+o.getRowSpan()}else{t++}}}return i};this.getEffectiveCell=function(r){var t=r;var o=null;if(r&&e.getPropertyBag().isRepeatTexts()){o=r.getArea();if(o.isRowHeaderArea()){t=o.getCellWithColSpan(r.getRow(),o.getColCnt()-1)}else if(o.isColHeaderArea()){t=o.getCellWithRowSpan(o.getRowCnt()-1,r.getCol())}}return t}};return sap.zen.crosstab.dragdrop.DragDropUtils});
//# sourceMappingURL=DragDropUtils.js.map