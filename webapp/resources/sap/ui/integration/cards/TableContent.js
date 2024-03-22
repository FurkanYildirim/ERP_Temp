/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./BaseListContent","./TableContentRenderer","sap/ui/integration/library","sap/f/cards/loading/TablePlaceholder","sap/m/Table","sap/m/Column","sap/m/ColumnListItem","sap/m/Text","sap/m/Link","sap/m/ProgressIndicator","sap/m/ObjectIdentifier","sap/ui/integration/controls/ObjectStatus","sap/m/Avatar","sap/ui/core/library","sap/m/library","sap/ui/integration/util/BindingResolver","sap/ui/integration/util/BindingHelper","sap/base/Log"],function(t,e,i,n,r,a,o,s,l,c,d,h,g,p,u,f,m,v){"use strict";var y=u.AvatarSize;var C=u.AvatarColor;var b=p.VerticalAlign;var I=u.ListSeparators;var w=u.ListType;var A=i.CardActionArea;var _=t.extend("sap.ui.integration.cards.TableContent",{metadata:{library:"sap.ui.integration"},renderer:e});_.prototype.onBeforeRendering=function(){t.prototype.onBeforeRendering.apply(this,arguments);this._getTable().setBackgroundDesign(this.getDesign())};_.prototype.exit=function(){t.prototype.exit.apply(this,arguments);if(this._oItemTemplate){this._oItemTemplate.destroy();this._oItemTemplate=null}};_.prototype.createLoadingPlaceholder=function(t){var i=this.getCardInstance(),r=i.getContentMinItems(t);return new n({minItems:r!==null?r:2,itemHeight:e.getItemMinHeight(t,this)+"rem",columns:t.row?t.row.columns.length||2:2})};_.prototype._getTable=function(){if(this._bIsBeingDestroyed){return null}var t=this.getAggregation("_content");if(!t){t=new r({id:this.getId()+"-Table",showSeparators:I.None,ariaLabelledBy:this.getHeaderTitleId()});t.addEventDelegate({onfocusin:function(t){if(!(t.srcControl instanceof o)){return}var e=t.target.getBoundingClientRect().bottom;var i=this.getDomRef().getBoundingClientRect().bottom;var n=Math.abs(e-i);var r=10;if(n<r){t.srcControl.addStyleClass("sapUiIntTCIRoundedCorners")}}},this);this.setAggregation("_content",t)}return t};_.prototype.applyConfiguration=function(){t.prototype.applyConfiguration.apply(this,arguments);var e=this.getParsedConfiguration();if(!e){return}if(e.rows&&e.columns){this._setStaticColumns(e.rows,e.columns);return}if(e.row&&e.row.columns){this._setColumns(e.row)}};_.prototype.getStaticConfiguration=function(){var t=this.getInnerList().getItems(),e=this.getParsedConfiguration(),i=t[0]&&t[0].isA("sap.m.GroupHeaderListItem"),n=[],r=[],a=[],o,s;(e.row.columns||[]).forEach(function(t){t=f.resolveValue(t,this,this.getBindingContext().getPath());n.push({title:t.title,width:t.width,hAlign:t.hAlign,visible:t.visible,identifier:t.identifier})}.bind(this));t.forEach(function(t){if(t.isA("sap.m.GroupHeaderListItem")){if(s){a.push(s)}r=[];s={title:t.getTitle(),rows:r}}else{o=f.resolveValue(e.row,this,t.getBindingContext().getPath());(o.columns||[]).forEach(function(t){delete t.title;delete t.width;delete t.hAlign;delete t.visible;delete t.identifier});r.push(o)}}.bind(this));if(s){a.push(s)}var l={headers:n};if(i){l.groups=a}else{l.groups=[{rows:r}]}return l};_.prototype.onDataChanged=function(){t.prototype.onDataChanged.apply(this,arguments);this._checkHiddenNavigationItems(this.getParsedConfiguration().row)};_.prototype._setColumns=function(t){var e=[],i=this._getTable(),n=t.columns;n.forEach(function(t){i.addColumn(new a({header:new s({text:t.title}),width:t.width,hAlign:t.hAlign,visible:t.visible}));e.push(this._createCell(t))}.bind(this));this._oItemTemplate=new o({cells:e,vAlign:b.Middle,highlight:t.highlight,highlightText:t.highlightText});this._oActions.attach({area:A.ContentItem,actions:t.actions,control:this,actionControl:this._oItemTemplate,enabledPropertyName:"type",enabledPropertyValue:w.Active,disabledPropertyValue:w.Inactive});var r=this.getParsedConfiguration().group;if(r){this._oSorter=this._getGroupSorter(r)}var l={template:this._oItemTemplate,sorter:this._oSorter};this._bindAggregationToControl("items",i,l)};_.prototype._setStaticColumns=function(t,e){var i=this._getTable();e.forEach(function(t){i.addColumn(new a({header:new s({text:t.title}),width:t.width,hAlign:t.hAlign}))});t.forEach(function(t){var e=new o({vAlign:b.Middle,highlight:t.highlight,highlightText:t.highlightText});if(t.cells&&Array.isArray(t.cells)){for(var n=0;n<t.cells.length;n++){e.addCell(this._createCell(t.cells[n]))}}if(t.actions&&Array.isArray(t.actions)){this._oActions.attach({area:A.ContentItem,actions:t.actions,control:this,actionControl:e,enabledPropertyName:"type",enabledPropertyValue:w.Active,disabledPropertyValue:w.Inactive})}i.addItem(e)}.bind(this));this.fireEvent("_actionContentReady")};_.prototype._createCell=function(t){var e;if(t.identifier){if(typeof t.identifier=="object"){if(!m.isBindingInfo(t.identifier)){v.warning("Usage of object type for column property 'identifier' is deprecated.",null,"sap.ui.integration.widgets.Card")}if(t.identifier.url){t.actions=[{type:"Navigation",parameters:{url:t.identifier.url,target:t.identifier.target}}]}}e=new d({title:t.value,text:t.additionalText});if(t.actions){e.setTitleActive(true);this._oActions.attach({area:A.ContentItemDetail,actions:t.actions,control:this,actionControl:e,enabledPropertyName:"titleActive",eventName:"titlePress"})}return e}if(t.url){v.warning("Usage of column property 'url' is deprecated. Use card actions for navigation.",null,"sap.ui.integration.widgets.Card");t.actions=[{type:"Navigation",parameters:{url:t.url,target:t.target}}]}if(t.actions){e=new l({text:t.value});this._oActions.attach({area:A.ContentItemDetail,actions:t.actions,control:this,actionControl:e,enabledPropertyName:"enabled"});return e}if(t.state){return new h({text:t.value,state:t.state,showStateIcon:t.showStateIcon,icon:t.customStateIcon})}if(t.value){return new s({text:t.value})}if(t.icon){var i=m.formattedProperty(t.icon.src,function(t){return this._oIconFormatter.formatSrc(t)}.bind(this));var n=t.icon.initials||t.icon.text;return new g({src:i,displayShape:t.icon.shape,displaySize:t.icon.size||y.XS,tooltip:t.icon.alt,initials:n,backgroundColor:t.icon.backgroundColor||(n?undefined:C.Transparent),visible:t.icon.visible}).addStyleClass("sapFCardIcon")}if(t.progressIndicator){return new c({percentValue:t.progressIndicator.percent,displayValue:t.progressIndicator.text,state:t.progressIndicator.state})}};_.prototype.getInnerList=function(){return this._getTable()};return _});
//# sourceMappingURL=TableContent.js.map