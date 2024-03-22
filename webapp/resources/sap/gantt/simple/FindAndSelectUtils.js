sap.ui.define(["./GanttUtils","sap/gantt/misc/Format","sap/gantt/misc/Utility","sap/gantt/simple/AggregationUtils","sap/ui/core/Core"],function(e,t,a,s,i){"use strict";var n=i.getLibraryResourceBundle("sap.gantt");var l={scrollToShape:function(i,n){var l=this;var o=null,h=[],r;function g(e,t,a,s){if(!e||e.isA("sap.gantt.simple.Relationship")){return}if(e.isA("sap.gantt.simple.BaseConditionalShape")){e=e._getActiveShapeElement()}if(e.isPseudoShape){var i=e.aShapeIds;var n=t.getTable().getRows();var o=e.getParentRowSettings().getParent().getIndex()-n[0].getIndex();var h=n[o];t.oOverlapShapeIds=t.oOverlapShapeIds?t.oOverlapShapeIds:{};var r=t.oOverlapShapeIds[h.getIndex()]?t.oOverlapShapeIds[h.getIndex()]:[];var d=i.length>0&&(r.length==0||r.indexOf(i[0])==-1);for(var c=0;c<i.length&&!l._oFoundShape&&d;c++){if(i[c]===a.shapeID[0]){l._bExpandPseudoShape=true;l._oFoundShape=e}}}if(e&&((e.getShapeId()===a.shapeID[0]||s===a.shapeID[0])&&e.getTime())){l._oFoundShape=e}else if(e instanceof sap.gantt.simple.BaseGroup&&!l._oFoundShape){if(t.getSelectOnlyGraphicalShape()){e._eachChildOfGroup(e,function(s,i){i.forEach(function(s){if(!l._oFoundShape){g(s,t,a,e.getShapeId())}})})}else{e._eachChildOfGroup(e,function(s){if(!l._oFoundShape){g(s,t,a,e.getShapeId())}})}}}function d(){l._oFoundShape=null;l._bExpandPseudoShape=false;var e=sap.ui.getCore().byId(r.parentElement.id);if(e){var t=s.getAllNonLazyAggregations(e);var a=Object.keys(t).filter(function(e){return e.indexOf("calendars")===-1&&e!=="relationships"}).map(function(t){return e.getAggregation(t)||[]});a.forEach(function(e){if(e&&e.length>0&&!l._oFoundShape){var t=0;while(t<e.length&&!l._oFoundShape){g(e[t],n,i);t++}}})}}function c(){var s=l._oFoundShape&&l._oFoundShape.getTime()||i.startTime;n.jumpToPosition(t.abapTimestampToDate(s));e.getShapeByShapeId(n.getId(),i.shapeID).forEach(function(e){if(!o){o=a.parseUid(e.getShapeUid());if(l.rowIndex!==parseInt(o.rowIndex,10)){l.rowIndex=parseInt(o.rowIndex,10);n.getTable().setFirstVisibleRow(l.rowIndex)}}if(e.getHighlightable()){l.isShapeHighlightable=true;h.push({ShapeId:e.getShapeId(),Highlighted:true})}else{l.isShapeHighlightable=false;h.push({ShapeId:e.getShapeId(),Selected:true})}});if(l.isShapeHighlightable){n.oHighlight.clearAllHighlightedShapeIds();n.oHighlight.updateHighlightedShapes(h)}else{n.oSelection.clearAllSelectedShapeIds();n.oSelection.updateSelectedShapes(h)}}var u=document.getElementById(n.getId());r=u?u.querySelector("[data-sap-gantt-row-id="+"'"+i.rowID+"'"+"]"):document.querySelector("[data-sap-gantt-row-id="+"'"+i.rowID+"'"+"]");if(r){d();if(this._bExpandPseudoShape){this._oFoundShape.onclick();n.getInnerGantt().resolveWhenReady(true).then(function(){d();c()})}else{c()}}else{var S=n.getTable(),p=S.isA("sap.ui.table.TreeTable")?S.getBinding().getNodes(0,n._iNodesLength,0):S.getBinding().getContexts(0,n._iNodesLength,0),f=function(){var e=u?u.querySelector("[data-sap-gantt-row-id='"+i.rowID+"']"):document.querySelector("[data-sap-gantt-row-id='"+i.rowID+"']");if(e){clearInterval(this.setTime);this.setTime=null;this.scrollToShape(i,n)}};for(var I=0;I<p.length;I++){var _=n._getRowIdPath();var m=(p[I].context||p[I]).getObject()[_];if(m===i.rowID){this.rowIndex=I;S.setFirstVisibleRow(I);this.setTime=setInterval(f.bind(this),100);break}}}},navigateToSearchResult:function(e,t){if(t.isA("sap.gantt.simple.GanttSearchSidePanel")){t._oSearchSidePanel.getItems()[3].getContent()[0].setSelectedItem("listItem"+this._selectedIndex);t._oSearchSidePanel.getItems()[3].getContent()[0].getSelectedItem().getDomRef().children[0].focus()}this.updateShapeSelectionANDHighlight(e,this.previousGanttID);var a=this._ganttSearchResults[this._selectedIndex],s=null;if(a){if(this.previousGanttID!==a.ganttID){this.previousGanttID=a.ganttID;s=e[this.previousGanttID]}else{s=e[this.previousGanttID]}if(t.isA("sap.gantt.simple.GanttSearchSidePanel")){t.setContainerHeight(t._oSearchSidePanel.getItems()[3].getContent()[0].getSelectedItem())}this.scrollToShape(a,s);if(!t.isA("sap.gantt.simple.GanttSearchSidePanel")){this.toggleNavigationState(t._searchFlexBox.getItems()[1],t._searchFlexBox.getItems()[3])}else{this.toggleNavigationState(t._oSearchSidePanel.getItems()[2].getContent()[0].getItems()[1].getItems()[0],t._oSearchSidePanel.getItems()[2].getContent()[0].getItems()[1].getItems()[1],true)}}},updateShapeSelectionANDHighlight:function(e,t){if(e.length>0){var a=e[t]?e[t]:e[0];if(this.isShapeHighlightable){var s=a.getHighlight();s.clearAllHighlightedShapeIds();s.updateShape(null,{highlighted:false,ctrl:false})}else{var i=a.getSelection();i.clearAllSelectedShapeIds();i.updateShape(null,{selected:false,ctrl:false})}}},triggerSearchEvent:function(e,t,a,s,i){var o=t[0].getParent();var h=o.getEnableAutoSelectOnFind();var r=function(){var n=[],r,g;t.forEach(function(t,a){t._bTimeContinuousShapes=false;t._hasTimeContinuousShapes(t.getTable().getRowSettingsTemplate());if(!t._bTimeContinuousShapes){var s=t.getFindBy(),i=t._getRowIdPath();n=t.findAll(e,s);n.forEach(function(e){e.ganttID=a;this.aSearchData.push(e)}.bind(this));var l=t.getTable().getBinding().getNodes&&t.getTable().getBinding().getNodes(0,t._iNodesLength,0)||t.getTable().getBinding().getContexts&&t.getTable().getBinding().getContexts(0,t._iNodesLength,0),o=[],h=Object.keys(t._oExpandModel.mExpanded),d=false,c=false,u=function(e,a){if(a.includes(e)){d=true;if(t._oExpandModel.mExpanded[a].length<=1){c=true}}};r=t.getTable().isA("sap.ui.table.TreeTable")?false:true;for(var S=0;S<l.length;S++){for(var p=0;p<n.length;p++){g=r||l[S].nodeState;if(g&&(l[S].context||l[S]).getObject()[i]===n[p].rowID){var f="PATH:"+n[p].rowID+"|SCHEME:"+t.getPrimaryShapeScheme().getKey();d=false;h.forEach(u.bind(null,f));if(d){if(n[p].isExpandable){if(n[p].hasOwnProperty("isParent")){if(n[p].isParent||c||t.getUseParentShapeOnExpand()){o.push(n[p])}}else if(!t.getUseParentShapeOnExpand()){o.push(n[p])}}}else if(n[p].hasOwnProperty("isParent")){o.push(n[p])}}}}this._ganttSearchResults=this._ganttSearchResults.concat(o)}}.bind(this));o.setProperty("customSearchResults",this._ganttSearchResults,true);o.fireCustomGanttSearchResult({searchResults:this._ganttSearchResults});this._ganttSearchResults=o.getCustomSearchResults();if(a){if(i.list){i.list.destroyItems()}i.getParent().fireGanttSearchSidePanelList({searchResults:this._ganttSearchResults});i._updateContent()}o.setBusy(false);this._searchResultsCount=this._ganttSearchResults.length;for(var d=0;d<this._ganttSearchResults.length;d++){if(document.querySelector("[data-sap-gantt-shape-id='"+this._ganttSearchResults[d].shapeID[0]+"']")){this._selectedIndex=d;break}}if(this._selectedIndex<0){this._selectedIndex=0}if(a&&h){i._oSearchSidePanel.getItems()[3].getContent()[0].setSelectedItem("listItem"+this._selectedIndex);if(i._oSearchSidePanel.getItems()[3].getContent()[0].getSelectedItem()){i._oSearchSidePanel.getItems()[3].getContent()[0].getSelectedItem().getDomRef().children[0].focus()}}if(!o._bPreventShapeScroll&&h){this.updateShapeSelectionANDHighlight(t,this.previousGanttID)}var c=this._ganttSearchResults[this._selectedIndex],u=null;if(c){s._searchFlexBox.getItems()[2].setText("("+(this._selectedIndex+1)+"/"+this._searchResultsCount+")");if(this.previousGanttID!==c.ganttID){this.previousGanttID=c.ganttID;u=t[this.previousGanttID]}else{u=t[this.previousGanttID]}if(!o._bPreventShapeScroll&&h){l.scrollToShape(c,u)}this._toggleNavigationStateUtil(a,s,i)}else{if(a){i.setEmptyListInfo(false)}this._toggleNavigationStateUtil(a,s,i)}o._bPreventShapeScroll=false}.bind(this);this._ganttSearchResults=[];this._selectedIndex=0;this._searchResultsCount=0;s._searchFlexBox.getItems()[0].setValue(e);s._searchFlexBox.getItems()[2].setText(n.getText("GNT_EMPTY_RESULT_INFO_TOOLBAR"));if(e){this.aSearchData=[];o.setBusyIndicatorDelay(0);o.setBusy(true);setTimeout(function(){r()},o.getBusyIndicatorDelay())}else{if(!o._bPreventShapeScroll){this.updateShapeSelectionANDHighlight(t,this.previousGanttID)}if(a){i._updateContent();i.setEmptyListInfo(true)}this._toggleNavigationStateUtil(a,s,i);o._bPreventShapeScroll=false}if(!a||!h){setTimeout(function(){var e=a?i._oSearchSidePanel.getItems()[2].getContent()[0].getItems()[1].getItems()[1]:s._searchFlexBox.getItems()[3];var t=a?i._oSearchSidePanel.getItems()[2].getContent()[0].getItems()[1].getItems()[0]:s._searchFlexBox.getItems()[1];if(e.getEnabled()){e.focus()}else{t.focus()}},0)}},_toggleNavigationStateUtil:function(e,t,a){if(!e){this.toggleNavigationState(t._searchFlexBox.getItems()[1],t._searchFlexBox.getItems()[3])}else{this.toggleNavigationState(a._oSearchSidePanel.getItems()[2].getContent()[0].getItems()[1].getItems()[0],a._oSearchSidePanel.getItems()[2].getContent()[0].getItems()[1].getItems()[1],true)}},toggleNavigationState:function(e,t,a,s){if(this._selectedIndex===0&&this._searchResultsCount>1){e.setEnabled(false);t.setEnabled(true);if(!a){t.focus()}}else if(this._selectedIndex===this._searchResultsCount-1&&this._selectedIndex>0){t.setEnabled(false);e.setEnabled(true);if(!a){e.focus()}}else if(this._selectedIndex===0&&this._searchResultsCount===0||this._selectedIndex===this._searchResultsCount-1){e.setEnabled(false);t.setEnabled(false)}else{e.setEnabled(true);t.setEnabled(true);if(s){t.focus()}}e.rerender();t.rerender()},updateToolbarItems:function(e,t,a){var s=e.getAllToolbarItems(),i=false,n=-1;s.forEach(function(e,a){if(e.isA("sap.m.ToolbarSpacer")){n=a}if(e.getId().includes("findAndSelectSearchButton")){e.setVisible(!t)}if(e.getId().includes("findAndSelectFlexBox")){i=true;e.setVisible(t)}});if(!i){if(n>-1){e.insertContent(e._searchFlexBox,n+1)}else{e.insertContent(e._searchFlexBox,1)}}setTimeout(function(){var s=e._searchFlexBox.getItems()[0];if(a&&this._searchResultsCount>1){this.toggleNavigationState(e._searchFlexBox.getItems()[1],e._searchFlexBox.getItems()[3],false,true)}else if(s.getDomRef()){var i=s.getValue().length;var n=s.getDomRef().getElementsByTagName("input")[0];s.focus();var l=a?i:0;n.setSelectionRange(l,i)}else if(!t){var o=e._oSearchButton.getDomRef();if(o){o.focus()}}}.bind(this),0)}};return l});
//# sourceMappingURL=FindAndSelectUtils.js.map