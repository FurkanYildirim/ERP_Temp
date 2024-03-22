// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/m/library","sap/ui/core/mvc/Controller","sap/ui/Device","sap/ui/model/json/JSONModel","sap/ushell/components/applicationIntegration/AppLifeCycle","sap/ushell/Config","sap/ushell/EventHub","sap/ushell/library","sap/ushell/ui/shell/OverflowListItem"],function(e,t,i,n,a,r,o,s,l){"use strict";var u=e.ListType;var d=s.FloatingNumberType;return t.extend("sap.ushell.components._HeaderManager.ShellHeader",{onInit:function(){this.aDoables=[];this.aDoables.push(o.on("navigateBack").do(this.pressNavBackButton.bind(this)));this.aDoables.push(o.on("showEndItemOverflow").do(this.pressEndItemsOverflow.bind(this)));this.aDoables.push(o.on("navigateFromShellApplicationNavigationMenu").do(this.navigateFromShellApplicationNavigationMenu.bind(this)))},shellUpdateAggItem:function(e,t){return sap.ui.getCore().byId(t.getObject())},pressNavBackButton:function(){o.emit("showUserActionsMenu",false);a.service().navigateBack()},pressEndItemsOverflow:function(e){var t=sap.ui.getCore().byId("headEndItemsOverflow"),i=sap.ui.getCore().byId(e),a=Promise.resolve(),s;if(!i){return}if(!t){a=new Promise(function(e,t){sap.ui.require(["sap/ui/core/Fragment"],function(i){i.load({name:"sap.ushell.renderers.fiori2.HeadEndItemsOverflowPopover",type:"XML",controller:this}).then(e).catch(t)}.bind(this),t)}.bind(this)).then(function(e){t=e;var i=sap.ui.getCore().byId("headEndItemsOverflowList");i.enhanceAccessibilityState=function(e,t){if(e.getFloatingNumberType()!==d.None){t.describedby=e._oAriaDescribedbyText.getId()}return t};s=new n({headEndItems:r.last("/core/shellHeader/headEndItems")});t.setModel(s)})}a.then(function(){if(t.isOpen()){t.close()}else{if(sap.ui.getCore().byId("shellNotificationsPopover")){o.emit("showNotifications",false)}t.openBy(i)}})},headEndItemsOverflowItemFactory:function(e,t){var i=sap.ui.getCore().byId(t.getObject());var n=i.getBindingPath("floatingNumber");var a=i.getText();var r=i.getTooltip();var o=new l({id:e+"-"+i.getId(),icon:i.getIcon(),iconInset:true,tooltip:r!==a?r:null,title:a,type:u.Active,floatingNumber:n?{path:n}:undefined,floatingNumberMaxValue:i.getFloatingNumberMaxValue(),floatingNumberType:i.getFloatingNumberType(),press:function(){if(i){i.firePress();var e=i.getTarget();if(e){sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(t){t.toExternal({target:{shellHash:e}})})}}var t=sap.ui.getCore().byId("headEndItemsOverflow");if(t.isOpen()){t.close()}}});if(i._oAriaLabel){o.addAriaLabelledBy(i._oAriaLabel)}if(n){o.setModel(i.getModel())}return o},destroyHeadEndItemsOverflow:function(e){e.getSource().destroy()},isHeadEndItemInOverflow:function(e){return e!=="ENDITEMSOVERFLOWBTN"&&!this.isHeadEndItemNotInOverflow(e)},isHeadEndItemNotInOverflow:function(e){var t=this.isHeadEndItemOverflow();var n=i.media.getCurrentRange(i.media.RANGESETS.SAP_STANDARD).name;if(e==="ENDITEMSOVERFLOWBTN"){return t}if(!t){return true}if(["USERACTIONSMENUHEADERBUTTON","BACKBTN"].indexOf(e)>-1){return true}if(n==="Phone"){return false}if(["SF","FLOATINGCONTAINERBUTTON"].indexOf(e)>-1){return true}if(n==="Desktop"&&e==="COPILOTBTN"){return true}return false},isHeadEndItemOverflow:function(){var e=0,t,n=r.last("/core/shellHeader/headEndItems");if(n.indexOf("endItemsOverflowBtn")===-1){return false}var a=i.media.getCurrentRange(i.media.RANGESETS.SAP_STANDARD).name;var o=3;if(a==="Phone"){o=1}for(var s=0;s<n.length;s++){t=sap.ui.getCore().byId(n[s]);if(t&&t.getVisible()){e++}}if(sap.ui.getCore().byId("endItemsOverflowBtn").getVisible()){return e>o+1}return e>o},navigateFromShellApplicationNavigationMenu:function(e){if(window.hasher.getHash()!==e.substr(1)){o.emit("centerViewPort",Date.now());window.hasher.setHash(e)}var t=sap.ui.getCore().byId("shellAppTitle");if(t){t.close()}},onExit:function(){this.aDoables.forEach(function(e){e.off()})}})});
//# sourceMappingURL=ShellHeader.controller.js.map