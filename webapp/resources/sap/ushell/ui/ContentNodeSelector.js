// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/util/deepClone","sap/m/Token","sap/ui/core/Core","sap/ui/core/Fragment","sap/ui/core/XMLComposite","sap/ui/Device","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/json/JSONModel","sap/ushell/Config","sap/ushell/library","sap/ushell/resources"],function(e,t,o,n,i,a,s,r,l,d,u,p){"use strict";var g=u.ContentNodeType;var c=i.extend("sap.ushell.ui.ContentNodeSelector",{metadata:{library:"sap.ushell",associations:{labelId:{type:"sap.ui.core.Control",multiple:false}},events:{selectionChanged:{},valueHelpEndButtonPressed:{}}}});c.prototype.init=function(){this._oModel=new l({items:[],suggestions:[],isSpaces:d.last("/core/spaces/enabled")});this._oDeviceModel=new l(a);this.setModel(this._oModel,"_internal");this.setModel(this._oDeviceModel,"_device");this.setModel(p.getTranslationModel(),"_i18n");var e=this.getAggregation("_content");e.addValidator(this._validateItem.bind(this));this.setBusyIndicatorDelay(0);this._loadContentNodes().then(this._overwriteLabel.bind(this))};c.prototype._overwriteLabel=function(){var e=this.getLabelId();var t=o.byId(e);if(t&&typeof t.setText==="function"){if(this._oModel.getProperty("/isSpaces")){t.setText(p.i18n.getText("contentNodeSelectorHomepagePages"))}else{t.setText(p.i18n.getText("contentNodeSelectorHomepageGroups"))}}if(t&&typeof t.setRequired==="function"&&t.isPropertyInitial("required")){t.setRequired(true)}if(t&&typeof t.setLabelFor==="function"){t.setLabelFor(this)}};c.prototype.exit=function(){this._oModel.destroy();this._oDeviceModel.destroy()};c.prototype.getSelectedContentNodes=function(){var t=this.getAggregation("_content");var o=t.getTokens();return o.map(function(t){var o=t.getBindingContext("_internal").getObject();var n=e(o);delete n.selected;delete n.spaceTitles;return n})};c.prototype._getMyHomeEnablement=function(){return new Promise(function(e,t){var o=d.last("/core/spaces/myHome/enabled");var n=sap.ushell.Container.getUser().getShowMyHome();e(o&&n)})};c.prototype._filterPersonalizableContentNodes=function(e){if(!Array.isArray(e)){return[]}return e.reduce(function(e,t){if(this._bShowOnlyMyHome&&t.id!==this._sMyHomeSpaceId&&t.id!==this._sMyHomePageId){return e}t.children=this._filterPersonalizableContentNodes(t.children);if(t.type===g.HomepageGroup||t.type===g.Space||t.type===g.Page&&t.isContainer){e.push(t)}return e}.bind(this),[])};c.prototype._loadContentNodes=function(){this.setBusy(true);return Promise.all([sap.ushell.Container.getServiceAsync("Bookmark"),this._getMyHomeEnablement()]).then(function(t){var o=t[0];var n=t[1];var i=d.last("/core/shell/enablePersonalization");this._bShowOnlyMyHome=!i&&n;this._sMyHomeSpaceId=d.last("/core/spaces/myHome/myHomeSpaceId");this._sMyHomePageId=d.last("/core/spaces/myHome/myHomePageId");return o.getContentNodes().then(function(t){t=e(t);t=this._filterPersonalizableContentNodes(t);c._normalizeContentNodes(t);this._oModel.setProperty("/items",t);var o=c._getSuggestions(t);for(var n=0;n<o.length;n++){o[n].selected=false}this._oModel.setProperty("/suggestions",o);this.setBusy(false)}.bind(this))}.bind(this))};c.prototype._showValueHelp=function(e){var t=e.getSource();var o=t.getValue();if(!this._oValueHelpDialog){n.load({id:this.getId()+"-ValueHelpDialog",name:"sap.ushell.ui.ContentNodeSelectorValueHelp",controller:this}).then(function(e){this.addDependent(e);this._oValueHelpDialog=e;this._openValueHelpDialog(o)}.bind(this))}else{this._openValueHelpDialog(o)}};c.prototype._openValueHelpDialog=function(e){var t=n.byId(this.getId()+"-ValueHelpDialog","ContentNodesTree");t.expandToLevel(1);this._oValueHelpDialog.open();var o=n.byId(this.getId()+"-ValueHelpDialog","ContentNodesSearch");o.setValue(e);this._onValueHelpSearch()};c.prototype._onValueHelpSearch=function(){var e=n.byId(this.getId()+"-ValueHelpDialog","ContentNodesSearch");var t=e.getValue();var o=n.byId(this.getId()+"-ValueHelpDialog","ContentNodesTree");var i=o.getBinding("items");i.filter(new s({path:"label",operator:r.Contains,value1:t}))};c.prototype._onValueHelpBeginButtonPressed=function(){var e=n.byId(this.getId()+"-ValueHelpDialog","ContentNodesTree");var t=e.getSelectedContextPaths();var o=this.getAggregation("_content");o.destroyTokens();var i;var a;for(var s=0;s<t.length;s++){a=t[s];var r=this.getModel("_internal");var l=o.getAggregation("tokens").map(function(e){return e.getProperty("key")}).indexOf(r.getProperty(a).id);if(l<0){i=this._createToken(a);o.addValidateToken({token:i})}}o.setValue("");this._oValueHelpDialog.close()};c.prototype._onValueHelpEndButtonPressed=function(){this.fireValueHelpEndButtonPressed();this._oValueHelpDialog.close()};c.prototype._onTokenUpdate=function(e){var t=e.getParameter("addedTokens");var o=e.getParameter("removedTokens");this._setTokensSelected(t,true);this._setTokensSelected(o,false);setTimeout(this.fireSelectionChanged.bind(this),0)};c.prototype._setTokensSelected=function(e,t){var o;for(var n=0;n<e.length;n++){o=e[n].getBindingContext("_internal");o.getModel().setProperty(o.getPath("selected"),t)}};c.prototype._validateItem=function(e){if(e.suggestedToken){return e.suggestedToken}var t=e.suggestionObject;if(!t){return null}var o=t.getBindingContext("_internal");return this._createToken(o.getPath())};c.prototype._createToken=function(e){var o=new t({key:"{_internal>id}",text:"{_internal>label}"});o.bindObject({path:e,model:"_internal"});return o};c._getSuggestions=function(e){var t=[];c._getChildren(e,t);return t};c._getChildren=function(e,t){var o;for(var n=0;n<e.length;n++){o=e[n];if(o.isContainer&&t.indexOf(o)===-1){t.push(o)}if(o.children){c._getChildren(o.children,t)}}};c._normalizeContentNodes=function(e){var t={};c._visitPages(e,function(e,o){o.spaceTitles=o.spaceTitles||[];if(t[o.id]){t[o.id].spaceTitles.push(e.label);return t[o.id]}o.spaceTitles.push(e.label);t[o.id]=o;return o})};c._visitPages=function(e,t){if(e===undefined||e===null){return}for(var o=0;o<e.length;o++){var n=e[o];if(n.type!==g.Space){return}if(n.children){for(var i=0;i<n.children.length;i++){var a=n.children[i];n.children[i]=t(n,a)}}}};c.prototype.clearSelection=function(){var e=this.getAggregation("_content");var t=e.getTokens();t.forEach(function(e){var t=e.getBindingContext("_internal");this._oModel.setProperty(t.getPath("selected"),false)}.bind(this));e.destroyTokens()};c.prototype.setValueState=function(e){var t=this.getAggregation("_content");t.setValueState(e)};c.prototype.setValueStateText=function(e){var t=this.getAggregation("_content");t.setValueStateText(e)};return c});
//# sourceMappingURL=ContentNodeSelector.js.map