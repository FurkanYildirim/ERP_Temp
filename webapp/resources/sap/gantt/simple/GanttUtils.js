/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/base/Log","sap/ui/core/Core","sap/ui/core/CalendarType","sap/gantt/misc/Utility","sap/ui/core/format/DateFormat","sap/ui/core/Locale","sap/m/OverflowToolbar","sap/ui/core/theming/Parameters","sap/ui/Device","./CoordinateUtils","sap/gantt/misc/Format","sap/gantt/library"],function(jQuery,e,t,r,a,n,i,s,o,l,g,c,u){"use strict";var f={};var h={};var p=false;var d=false;var m={SHAPE_ID_DATASET_KEY:"data-sap-gantt-shape-id",ROW_ID_DATASET_KEY:"data-sap-gantt-row-id",CONNECTABLE_DATASET_KEY:"data-sap-gantt-connectable",SELECT_FOR_DATASET_KEY:"sap-gantt-select-for",SHAPE_CONNECT_FOR_DATASET_KEY:"sap-gantt-shape-connect-for",SHAPE_CONNECT_INDICATOR_WIDTH:10,oDateFormat:n.getDateInstance({pattern:"yyyyMMddHHmmss",calendarType:r.Gregorian}),shapeElementById:function(e,t){var r=window.document.getElementById(t),a=r.querySelector("g.sapGanttChartShapes");var n=a.querySelectorAll("["+m.SHAPE_ID_DATASET_KEY+"='"+e+"']");var i=n[0];if(i){return jQuery(i).control(0)}return null},isRelationshipConnectedToPseudoShapes:function(e,t){var r=sap.ui.getCore().byId(t);var a=r.getTable().getRows();var n=false,i;a.forEach(function(t){if(!n){var r=t.getAggregation("_settings");i=r.getTasks&&r.getTasks().filter(function(e){return e.isPseudoShape}).filter(function(t){return t.aShapeIds.indexOf(e)>-1})[0];if(i){n=true}}});if(n&&document.getElementById(i.getId())){return i}},getValueX:function(r){var a;var n=r.getMetadata().getProperty("x");if(n){a=r.getProperty(n.name);if(a!==null&&a!==undefined){return a}}var i=t.getConfiguration().getRTL(),s=i?r.getEndTime()||r.getTime():r.getTime();if(s){a=r.getXByTime(s)}if(!jQuery.isNumeric(a)){e.warning("couldn't convert timestamp to x with value: "+s)}return a},getRowInstance:function(e,t){var r=jQuery(e.target).closest("rect.sapGanttBackgroundSVGRow").data("sapUiIndex");if(r!=null){return t.getRows()[r]}},getRowInstancefromShape:function(e){var t=e.getParentRowSettings();if(t!=null){return t.getParentRow()}},_get2dContext:function(e,t,r){if(!f.context){f.context=document.createElement("canvas").getContext("2d")}if(f.fontSize!==e||f.fontFamily!==t||f.fontWeight!==r){f.context.font=r+" "+e+"px "+t;f.fontSize=e;f.fontFamily=t;f.fontWeight=r}return f.context},getShapeTextWidth:function(e,t,r,a){return this._get2dContext(t,r,a).measureText(e).width},getSelectedTableRowSettings:function(e,t){var r=e.getRows(),a=e.getFirstVisibleRow();if(r.length===0){return null}var n=r[0].getIndex();var i=t-a;if(n!==a){i+=Math.abs(n-a)}if(!r[i]){return null}return r[i].getAggregation("_settings")},updateGanttRows:function(e,t,r){var a=e.getParent().getParent();var n=jQuery(document.getElementById(a.getId()+"-svg")),i=n.find("rect.sapGanttBackgroundSVGRow");if(a.getEnableChartSelectionState()){i.eq(r).toggleClass("sapGanttBackgroundSVGRowSelected",!!t[r].selected)}if(a.getEnableChartHoverState()){i.eq(r).toggleClass("sapGanttBackgroundSVGRowHovered",!!t[r].hovered)}},getShapesWithUid:function(e,t){var r=function(t){var r=a.parseUid(t),n=r.shapeId;var i=["[id='",e,"']"," ["+m.SHAPE_ID_DATASET_KEY+"='",n,"']"].join("");return jQuery(i).control().filter(function(e){return e.getShapeUid()===t})[0]};return t.map(r)},getShapeByShapeId:function(e,t){var r=[];t.forEach(function(t){var a=["[id='",e,"']"," ["+m.SHAPE_ID_DATASET_KEY+"='",t,"']"].join("");var n=document.querySelector(a);if(n){var i=sap.ui.getCore().byId(n.id);r.push(i)}});return r},getShapesInRowsById:function(e,t){var r=document.getElementById(e);var a=[];t.forEach(function(e){if(r){var t=r.querySelector("[data-sap-gantt-row-id='"+e+"']");if(t){a=Array.from(t.children).filter(function(e){return e.id!==""}).reduce(function(e,t){return e.concat(sap.ui.getCore().byId(t.id))},a)}}});return a},getShapeIdFromShapeUid:function(e){return e.map(function(e){var t=a.parseUid(e);return t.shapeId})},getTimeFormaterBySmallInterval:function(e){var r=e.getAxisTimeStrategy(),a=r.getTimeLineOption().smallInterval,s=a.unit;var o=r.getCalendarType(),l=r.getLocale()?r.getLocale():new i(t.getConfiguration().getLanguage().toLowerCase());var g="yyyyMMMddhhms";if(!(s===sap.gantt.config.TimeUnit.minute||s===sap.gantt.config.TimeUnit.hour)){g="yyyyMMMdd"}return n.getDateTimeInstance({format:g,style:a.style,calendarType:o},a.locale?new i(a.locale):l)},getFormatedDateByTimeZone:function(e){var t=this.oDateFormat.format(e);return c.abapTimestampToDate(t)},resetStrokeDasharray:function(e){if(!e){return}var t=e.getSimpleAdhocLines().find(function(e){return e._getSelected()});if(t){t._setSelected(false);var r=document.getElementById(t._getHeaderLine().sId);var a=document.getElementById(t._getLine().sId);var n=document.getElementById(t._getMarker().getId());n.style.cursor="pointer";if(a&&r){a.style.strokeDasharray=t.getStrokeDasharray();r.style.strokeDasharray=t.getStrokeDasharray();a.style.strokeWidth=t._getStrokeWidth();r.style.strokeWidth=t._getStrokeWidth()}}var i=e.getDeltaLines().find(function(e){return e._getIsSelected()});if(i){var s=i._getChartDeltaArea();if(s){var l=document.getElementById(s.sId);if(i._getEnableChartDeltaAreaHighlight()===true){l.style.opacity=0}}var g=document.getElementById(i._getForwardMarker().sId);var c=document.getElementById(i._getBackwardMarker().sId);var u=document.getElementById(i._getHeaderDeltaArea().sId);var f=o.get("sapUiChartDataPointBorderColor");if(i.getVisibleDeltaStartEndLines()){var h=document.getElementById(i._getStartLine().sId);var p=document.getElementById(i._getEndLine().sId);var d=document.getElementById(i._getHeaderStartLine().sId);var m=document.getElementById(i._getHeaderEndLine().sId);h.style.strokeDasharray=i.getStrokeDasharray();p.style.strokeDasharray=i.getStrokeDasharray();d.style.strokeDasharray=i.getStrokeDasharray();m.style.strokeDasharray=i.getStrokeDasharray();h.style.strokeWidth=i._getStrokeWidth();p.style.strokeWidth=i._getStrokeWidth();d.style.strokeWidth=i._getStrokeWidth();m.style.strokeWidth=i._getStrokeWidth()}g.style.fillOpacity=0;c.style.fillOpacity=0;u.style.opacity=1;u.style.cursor="pointer";g.style.stroke=null;c.style.stroke=null;if(i._getVisibleMarker()===true){g.style.fillOpacity=1;c.style.fillOpacity=1;g.style.stroke=f;c.style.stroke=f}var T=e._getResizeExtension();T.clearAllDeltaOutline();i._setIsSelected(false)}},adhocLinesPresentAndEnabled:function(e){return e.getSimpleAdhocLines().filter(function(e){return e.MarkerType!=sap.gantt.simple.MarkerType.None}).length>0&&e.getEnableAdhocLine()},addToolbarToTable:function(e,t,r){if(r){if(t.getExtension().length==0){var a=new s;a.addContent(e.oExportTableToExcelButton);t.addExtension(a)}else{t.getExtension()[0].addContent(e.oExportTableToExcelButton)}}},findSpaceInLevel:function(e,t,r,a){for(var n=0;n<h[e].length;n++){if(d){return}var i=a,s=a,o=a;if(t instanceof sap.gantt.simple.AdhocLine){i=r}if(h[e][n]instanceof sap.gantt.simple.AdhocLine){s=r}if(h[e][n+1]instanceof sap.gantt.simple.AdhocLine){o=r}if(h[e].length>1){if(n===0&&(t[i]()<=h[e][n][r]()||t[i]()>h[e][n][r]()&&t[i]()-h[e][n][r]()<=1e3)&&!(this._stringToDateObject(t[r]()).getTime()===this._stringToDateObject(h[e][n][r]()).getTime()&&this._stringToDateObject(t[i]()).getTime()===this._stringToDateObject(h[e][n][s]()).getTime())){h[e].push(t);p=true}else if(h[e][n+1]!==undefined&&(t[r]()>=h[e][n][s]()&&t[i]()<=h[e][n+1][r]()||t[r]()<h[e][n][s]()&&h[e][n][s]()-t[r]()<=1e3&&(t[i]()>h[e][n+1][r]()&&t[i]()-h[e][n+1][r]()<=1e3||t[i]()<=h[e][n+1][r]())||t[i]()>h[e][n+1][r]()&&t[i]()-h[e][n+1][r]()<=1e3&&(t[r]()>=h[e][n][s]()||t[r]()<h[e][n][s]()&&h[e][n][s]()-t[r]()<=1e3))&&!(this._stringToDateObject(t[r]()).getTime()===this._stringToDateObject(h[e][n][r]()).getTime()&&this._stringToDateObject(t[i]()).getTime()===this._stringToDateObject(h[e][n][s]()).getTime()||this._stringToDateObject(t[r]()).getTime()===this._stringToDateObject(h[e][n+1][r]()).getTime()&&this._stringToDateObject(t[i]()).getTime()===this._stringToDateObject(h[e][n+1][o]()).getTime())){h[e].push(t);p=true}else if(n===h[e].length-1&&(t[r]()>=h[e][n][s]()||t[r]()<h[e][n][s]()&&h[e][n][s]()-t[r]()<=1e3)&&!(this._stringToDateObject(t[r]()).getTime()===this._stringToDateObject(h[e][n][r]()).getTime()&&this._stringToDateObject(t[i]()).getTime()===this._stringToDateObject(h[e][n][s]()).getTime())){h[e].push(t);p=true}else if(this._stringToDateObject(t[r]()).getTime()===this._stringToDateObject(h[e][n][r]()).getTime()&&this._stringToDateObject(t[i]()).getTime()===this._stringToDateObject(h[e][n][s]()).getTime()){if(parseInt(e,10)===Object.keys(h).length-1){h[parseInt(e,10)+1]=[t];p=true}else{p=false}}else{if(n===h[e].length-1&&parseInt(e,10)===Object.keys(h).length-1){h[parseInt(e,10)+1]=[t];p=true}else{p=false}}}else{if((t[r]()>=h[e][n][s]()||t[r]()<h[e][n][s]()&&h[e][n][s]()-t[r]()<=1e3||(t[i]()<=h[e][n][r]()||t[i]()>h[e][n][r]()&&t[i]()-h[e][n][r]()<=1e3))&&!(this._stringToDateObject(t[r]()).getTime()===this._stringToDateObject(h[e][n][r]()).getTime()&&this._stringToDateObject(t[i]()).getTime()===this._stringToDateObject(h[e][n][s]()).getTime())){h[e].push(t);p=true}else if(this._stringToDateObject(t[r]()).getTime()===this._stringToDateObject(h[e][n][r]()).getTime()&&this._stringToDateObject(t[i]()).getTime()===this._stringToDateObject(h[e][n][s]()).getTime()){if(parseInt(e,10)===Object.keys(h).length-1){h[parseInt(e,10)+1]=[t];p=true}else{p=false}}else{if(parseInt(e,10)===Object.keys(h).length-1){h[parseInt(e,10)+1]=[t];p=true}else{p=false}}}if(p){n=h[e].length;d=true;h=this.sortShapesByTime(h,e,r)}}},sortShapesByTime:function(e,t,r){var a=e[t].length;var n;do{n=false;for(var i=0;i<a;i++){if(e[t][i+1]!==undefined){if(e[t][i][r]()>e[t][i+1][r]()){var s=e[t][i];e[t][i]=e[t][i+1];e[t][i+1]=s;n=true}}}}while(n);return e},_partitionShapesIntoOverlappingRanges:function(e,t,r){h={};var a="get"+t.charAt(0).toUpperCase()+t.slice(1);var n="get"+r.charAt(0).toUpperCase()+r.slice(1);if(e.length>0){h[0]=[e[0]]}for(var i=1,s=e.length;i<s;i++){d=false;for(var o in h){this.findSpaceInLevel(o,e[i],a,n)}}return h},_stringToDateObject:function(e){if(typeof e==="string"&&e.length>0){return c.abapTimestampToDate(e)}return e},_getExpandedChildArray:function(e,t,r,a){var n,i;e.forEach(function(e){if(e instanceof sap.gantt.simple.BaseConditionalShape){var s=e._getActiveShapeElement();if(r.indexOf(s.getScheme())>-1||t.getEnablePseudoShapes()){if(s instanceof sap.gantt.simple.BaseGroup){n=null;i=null;s.getShapes().forEach(function(e){if(!n&&!i){n=e.getTime();i=e.getEndTime()}else{if(e.getTime()>=n){n=n}else{n=e.getTime()}if(e.getEndTime()>=i){i=e.getEndTime()}else{i=i}}});s.setProperty("time",n,true);s.setProperty("endTime",i,true);a=a.concat(s)}else if(s){a=a.concat(s)}}}else if(e instanceof sap.gantt.simple.BaseGroup){n=null;i=null;e.getShapes().forEach(function(e){if(!n&&!i){n=e.getTime();i=e.getEndTime()}else{if(e.getTime()>=n){n=n}else{n=e.getTime()}if(e.getEndTime()>=i){i=e.getEndTime()}else{i=i}}});e.setProperty("time",n,true);e.setProperty("endTime",i,true);a=a.concat(e)}else{a=a.concat(e)}});return a},calculateLevelForShapes:function(e,t,r,a){var n=function(e){return e.reduce(function(e,t){return e.concat(Array.isArray(t)?n(t):t)},[])};var i=this._partitionShapesIntoOverlappingRanges(e,t,r);var s=0;var o=Object.values(i).map(function(e,t){e.map(function(e){var r=t+1;if(e._setLevel){e._setLevel(r)}e._level=r;if(s<r){s=r}return e});return e});var l=n(o);var g={};if(a){g={adhocLines:l.filter(function(e){if(sap.gantt.simple.AdhocLine){return e instanceof sap.gantt.simple.AdhocLine}}),deltaLines:l.filter(function(e){if(sap.gantt.simple.DeltaLine){return e instanceof sap.gantt.simple.DeltaLine}}),maxLevel:s}}else{g={shapes:l,maxLevel:s}}return g},getShapeSuccessors:function(e,t){var r=[];if(e.getEnableChainSelection()){var a=this._getVisibleRelationships(t);var n=a.filter(function(t){return t.getPredecessor()===e.getShapeId()});n.forEach(function(e){var a=e.getRelatedInRowShapes(t.getId());if(a.successor){r.push(a.successor)}});r=Array.from(new Set(r))}return r},getShapePredeccessors:function(e,t){var r=[];if(e.getEnableChainSelection()){var a=this._getVisibleRelationships(t);var n=a.filter(function(t){return t.getSuccessor()===e.getShapeId()});n.forEach(function(e){var a=e.getRelatedInRowShapes(t.getId());if(a.predecessor){r.push(a.predecessor)}});r=Array.from(new Set(r))}return r},selectAssociatedShapes:function(e,t){var r=e.shape;var a=t._getDragDropExtension();var n=!r.getSelected();if(a.shapeSelectedOnMouseDown&&!a.initiallySelected&&!t.getEnableSelectAndDrag()){n=a.shapeSelectedOnMouseDown}var i=[r];if(r.getEnableChainSelection()){i=this._getShapesToSelect(r,t);i.forEach(function(e){this.oSelection.updateShape(e.getShapeUid(),{selected:n,ctrl:true,draggable:e.getDraggable(),time:e.getTime(),endTime:e.getEndTime()})}.bind(t))}return i},_getShapesToSelect:function(e,t){var r=[e];var a=this._getVisibleRelationships(t);var n=a.filter(function(t){return t.getPredecessor()===e.getShapeId()||t.getSuccessor()===e.getShapeId()});n.forEach(function(e){var a=e.getRelatedInRowShapes(t.getId());if(a.predecessor&&a.predecessor.getSelectableInChainSelection()){r.push(a.predecessor)}if(a.successor&&a.successor.getSelectableInChainSelection()){r.push(a.successor)}});r=Array.from(new Set(r));return r},_getVisibleRelationships:function(e){var t=[];e.getTable().getRows().forEach(function(e){var r=e.getAggregation("_settings").getRelationships();t=t.concat(r)});t=Array.from(new Set(t));return t},rerenderAssociatedRelationships:function(e,r){var a=t.createRenderManager();var n=[];var i=this._getVisibleRelationships(e);i.forEach(function(e){if(e.getSuccessor()===r.getShapeId()||e.getPredecessor()===r.getShapeId()){n.push(e)}});n.forEach(function(t){t.renderElement(a,t,e.getId())})},getFilteredShapeType:function(e){e=Array.from(new Set(e));return e.filter(function(e){return e!=="None"})},getPathCorners:function(e,t){var r=e.replace(/([A-Z])/g," $1");var a=[],n;var i=r.split(/[,\s]/).reduce(function(e,t){var r=t.match("([a-zA-Z])(.+)");if(r){e.push(r[1]);e.push(r[2])}else{e.push(t)}return e},[]);var s=i.reduce(function(e,t){if(parseFloat(t)==t&&e.length){e[e.length-1].push(t)}else{e.push([t])}return e},[]);function o(e,t,r){var a=t.x-e.x;var n=t.y-e.y;var i=Math.sqrt(a*a+n*n);return l(e,t,Math.min(1,r/i))}function l(e,t,r){return{x:e.x+(t.x-e.x)*r,y:e.y+(t.y-e.y)*r}}function g(e,t){if(e.length>2){e[e.length-2]=t.x;e[e.length-1]=t.y}}function c(e){return{x:parseFloat(e[e.length-2]),y:parseFloat(e[e.length-1])}}if(s.length>1){var u=c(s[0]),f=null;if(s[s.length-1][0]=="Z"&&s[0].length>2){f=["L",u.x,u.y];s[s.length-1]=f}a.push(s[0]);for(var h=1;h<s.length;h++){var p=a[a.length-1],d=s[h],m=d==f?s[1]:s[h+1],T=t;if(m&&p&&p.length>2&&d[0]=="L"&&m.length>2&&m[0]=="L"){var y=c(p),S=c(d),v=c(m),_,E,I=Math.abs(y.x-S.x)+Math.abs(y.y-S.y),b=Math.abs(v.x-S.x)+Math.abs(v.y-S.y),D=Math.max(Math.min(T,I,b/2),1);_=o(S,y,D);E=o(S,v,D);g(d,_);d.origPoint=S;a.push(d);var A=l(_,S,.5),x=l(S,E,.5),C=["C",A.x,A.y,x.x,x.y,E.x,E.y];C.origPoint=S;a.push(C)}else{a.push(d)}}if(f){var O=c(a[a.length-1]);a.push(["Z"]);g(a[0],O)}}else{a=s}n=a.reduce(function(e,t){return e+t.join(" ")+" "},"");return n},arrayMove:function(e,t,r){if(r>=e.length){var a=r-e.length+1;while(a--){e.push(undefined)}}e.splice(r,0,e.splice(t,1)[0]);return e},getEdgePoint:function(e){var t=2;var r=["Arrow","None"];var a=this._getVisibleRelationships(e);a.forEach(function(a){if(a.getPredecessor()!==undefined&&a.getSuccessor()!==undefined&&(a.getShapeTypeStart()!=="None"||r.indexOf(a.getShapeTypeEnd())==-1)||e.getRelationshipShapeSize()==sap.gantt.simple.relationshipShapeSize.Large){t=3}});return t},getTimeLabel:function(e,t,r,n){var i=g.getEventSVGPoint(n,e),s=c.dateToAbapTimestamp(t.viewToTime(i.x)),o=c._convertUTCToLocalTime(s,r),l=t.getZoomStrategy();var u=l.getLowerRowFormatter().format(o);return a.getLowerCaseLabel(u)},getVisibleElements:function(e,t,r){return Array.from(e.querySelectorAll(t)).reduce(function(e,t){return e.concat(Array.from(t.querySelectorAll(r)))},[])},isDynamicText:function(){var e=u.simple.horizontalTextAlignment;var r=false;var a=Array.from(document.querySelectorAll(".sapGanttChartSvg .sapGanttChartShapes .baseShapeSelection")).filter(function(e){if(!e.classList.contains("sapGanttTextNoPointerEvents")&&e.tagName!="text"){return e}});a.forEach(function(a){var n=a.closest("[data-sap-ui]").getAttribute("data-sap-ui");var i=t.byId(n);if(i&&!r){if(i instanceof sap.gantt.simple.BaseConditionalShape){var s=i._getActiveShapeElement();if(s instanceof sap.gantt.simple.BaseGroup){s.getShapes().forEach(function(t){if(t.getHorizontalTextAlignment()===e.Dynamic){r=true}})}else{if(i.getHorizontalTextAlignment()===e.Dynamic){r=true}}}else if(i instanceof sap.gantt.simple.MultiActivityGroup){if(i.getTask().getHorizontalTextAlignment()===e.Dynamic){r=true}}else if(i instanceof sap.gantt.simple.BaseGroup){i.getShapes().forEach(function(t){if(t.getHorizontalTextAlignment()===e.Dynamic){r=true}})}else{if(i.getHorizontalTextAlignment()===e.Dynamic){r=true}}}});if(!r){var n=Array.from(document.querySelectorAll(".sapGanttChartSvg .sapGanttChartCalendar .baseShapeSelection")).filter(function(e){if(!e.classList.contains("sapGanttTextNoPointerEvents")&&e.tagName!="text"){return e}});n.forEach(function(a){if(!r){var n=a.closest("[data-sap-ui]").getAttribute("data-sap-ui");var i=t.byId(n);if(i.getHorizontalTextAlignment()===e.Dynamic){r=true}}})}return r},setLmarker:function(e,r,a){var n=r.mAnchors.predecessor.x,i=r.mAnchors.predecessor.y;var s=r.mAnchors.successor.x,o=r.mAnchors.successor.y;r.setProperty("_lMarker","",true);var l=r.getProcessedType();var g=e._edgePoint;if(l===1&&n<=s){if(t.getConfiguration().getRTL()?r.getLShapeForTypeSF():r.getLShapeForTypeFS()){if(g==2&&r.getShapeTypeStart()=="None"||g==3&&Math.abs(n-s)>=g*6){if(i>o){r.setProperty("_lMarker","rightUp",true)}else{r.setProperty("_lMarker","rightDown",true)}}}}else if(l===2&&n>=s){if(t.getConfiguration().getRTL()?r.getLShapeForTypeFS():r.getLShapeForTypeSF()){if(g==2&&r.getShapeTypeStart()=="None"||g==3&&Math.abs(n-s)>=g*6){if(i>o){r.setProperty("_lMarker","leftUp",true)}else{r.setProperty("_lMarker","leftDown",true)}}}}if(a){e.relSet[r.getShapeId()]=r}else{e.relSetFake[r.getShapeId()]=r}},pseudoShapeGroupAfterEdit:function(e,t){var r=[],a=0,n=e.oOverlapShapeIds&&e.oOverlapShapeIds[t];if(n){if(n[0]){var i=m.getShapeByShapeId(e.getId(),[n[0]])[0];i&&r.push({iShapeCount:1,startTime:i.getTime(),endTime:i.getEndTime()})}for(var s=1;s<n.length;s++){var o=m.getShapeByShapeId(e.getId(),[n[s]])[0];if(o){var l=o.getTime(),g=o.getEndTime(),c=r[a],u=c.startTime,f=c.endTime;if(l>=u&&g<=f){c.iShapeCount++}else if(l>=u&&l<f&&g>f){c.iShapeCount++;c.endTime=g}else if(l>=f&&g>=f){a++;r.push({iShapeCount:1,startTime:l,endTime:g})}}}}return r},relationexist:function(e,t){t.mRelatedShapes=t.getRelatedInRowShapes(e.getId());var r=t.getProcessedType();t.mAnchors=t.getRlsAnchors(r,t.mRelatedShapes);if(!t.getVisible()){return false}if(!t.mRelatedShapes.predecessor&&!t.mRelatedShapes.successor){return false}var a=function(e){return!isNaN(parseFloat(e.x))&&isFinite(e.x)&&!isNaN(parseFloat(e.y))&&isFinite(e.y)};if(!a(t.mAnchors.predecessor)||!a(t.mAnchors.successor)){return false}return true},geNumberOfTruncatedCharacters:function(e,t,r,a,n,i,s){var o=0;s=s?s:1;if(e>t){if(t>0&&r.length>0){o=Math.round(t/Math.ceil(e/r.length));while(true){if(o<0){break}var l=n.apply(a,[r.slice(0,o)]);var g=n.apply(a,[r.slice(0,o+1)]);l=i?l.width:l*s;g=i?g.width:g*s;if(l>t){o--;continue}if(l!=g&&g<t){o++;continue}break}}}else{return r?r.length:0}return o>=0&&o<=r.length?o:0}};return m},true);
//# sourceMappingURL=GanttUtils.js.map