/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","./library","./ColumnType","sap/ui/core/Control","sap/m/TableSelectDialog","./Progress","./InternalColumns"],function(jQuery,e,t,a,n,r,i){"use strict";var l=a.extend("sap.ui.vtm.SelectColumnsDialog",{metadata:{properties:{tree:{type:"object"},selectableColumns:{type:"sap.ui.vtm.Column[]"}}},init:function(){this._oDialog=this._createDialog()},renderer:function(e,t){},_createDialog:function(){var e=sap.ui.vtm.getResourceBundle();var t=new sap.m.TableSelectDialog(this.getId()+"-Dialog",{multiSelect:true,columns:[new sap.m.Column({visible:false}),new sap.m.Column({visible:false}),new sap.m.Column({header:new sap.m.Label({text:e.getText("COLUMNNAME_NAME")})})],noDataText:e.getText("SELECTCOLUMNSDIALOG_NOCOLUMNSAVAILABLE")});var a=new sap.m.ColumnListItem({type:"Active",unread:false,cells:[new sap.m.Label({text:"{mProperties/type}"}),new sap.m.Label({text:"{mProperties/descriptor}"}),new sap.m.Label({text:"{mProperties/label}"})]});t.bindItems({path:"/items",template:a});return t},open:function(){var e=this.getTree();if(!e){throw"The tree property has not been set"}var t=this.getSelectableColumns();if(!t){throw"The selectableColumns property has not been set"}t=t.slice();var a=this._oDialog;var n=sap.ui.vtm.getResourceBundle();var r=jQuery.sap.debug();if(r){var i=t.filter(function(e){return e.type===sap.ui.vtm.ColumnType.Internal}).map(function(e){return e.id});var l=[sap.ui.vtm.InternalColumns.createTreeItemIdColumn(),sap.ui.vtm.InternalColumns.createAbsoluteMatrixColumn(),sap.ui.vtm.InternalColumns.createRelativeMatrixColumn(),sap.ui.vtm.InternalColumns.createSceneNodeIdsColumn(),sap.ui.vtm.InternalColumns.createOpacityColumn(),sap.ui.vtm.InternalColumns.createHighlightColorColumn()];l.forEach(function(e){if(i.indexOf(e.id)==-1){t.push(e)}})}var o=function(e,t){return e.getLabel().localeCompare(t.getLabel())};t.sort(o);var s=function(e,t){return JSON.stringify({type:e,descriptor:t})};var u=new Map;t.forEach(function(e){var t=s(e.getType(),e.getDescriptor());u.set(t,e)});var m=function(e){var t=e.getParameter("value");var a=e.getParameter("itemsBinding");if(t!==undefined&&t.length>0){var n=[new sap.ui.model.Filter("mProperties/label",sap.ui.model.FilterOperator.Contains,t)];a.filter(new sap.ui.model.Filter(n,false),"Application")}else{a.filter([])}};var c=function(t){var n=e.getDataColumns().map(function(e){return s(e.getType(),e.getDescriptor())});var r=a.getItems();r.forEach(function(e){var t=e.getCells();var a=s(t[0].getText(),t[1].getText());var r=n.indexOf(a)!=-1;e.setSelected(r)})};var p,v;var f=function(e){a.attachConfirm(e,p);a.attachCancel(e,v);a.attachSearch(e,m);a.attachModelContextChange(e,c)};var g=function(){a.detachConfirm(p);a.detachCancel(v);a.detachSearch(m);a.detachModelContextChange(c)};p=function(t){g();var a=t.getParameter("selectedItems");var n=e.getDataColumns().map(function(e){return s(e.getType(),e.getDescriptor())});var r=a.map(function(e){var t=e.getCells();return s(t[0].getText(),t[1].getText())});var i=r.filter(function(e){return n.indexOf(e)===-1});var l=n.filter(function(e){return r.indexOf(e)!==-1});var m=l.map(function(e){return u.get(e)});var c=i.map(function(e){return u.get(e)});c.sort(o);var p=m.concat(c);e.setDataColumns(p)};v=function(e){g()};var C=e.getPanel().getTitle();var d=n.getText("SELECTCOLUMNSDIALOG_SELECT_0_COLUMNS",[C]);a.setTitle(d);f(e);var h=new sap.ui.model.json.JSONModel;h.setData({items:t});a.setModel(h);a.open();return this}});return l});
//# sourceMappingURL=SelectColumnsDialog.js.map