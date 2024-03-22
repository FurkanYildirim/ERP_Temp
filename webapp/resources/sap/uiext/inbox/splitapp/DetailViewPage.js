/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
jQuery.sap.declare("sap.uiext.inbox.splitapp.DetailViewPage");jQuery.sap.require("sap.m.MessageToast");jQuery.sap.require("sap.m.SelectDialog");jQuery.sap.require("sap.uiext.inbox.InboxConstants");jQuery.sap.require("sap.uiext.inbox.InboxUtils");sap.ui.base.Object.extend("sap.uiext.inbox.splitapp.DetailViewPage",{constructor:function(t){sap.ui.base.Object.apply(this);this.oCore=sap.ui.getCore();this.Id=t;this.constants=sap.uiext.inbox.InboxConstants;this._oBundle=this.oCore.getLibraryResourceBundle("sap.uiext.inbox");this.utils=sap.uiext.inbox.InboxUtils;this.useBatch=false;this.isCommentsSupported=false;this.bPhoneDevice=jQuery.device.is.phone;this.detailViewPage=this._create()}});sap.uiext.inbox.splitapp.DetailViewPage.prototype._create=function(){var t=this.oCore.byId(this.Id+"-detailPage");if(!t){var e=this;var a=new Array;var i=new sap.m.Button(this.Id+"-claimBtn",{text:this._oBundle.getText("INBOX_ACTION_BUTTON_CLAIM"),icon:"sap-icon://locked",enabled:"{SupportsClaim}"});i.attachPress(this,this._handleClaim);a.push(i);var s=new sap.m.Button(this.Id+"-releaseBtn",{text:this._oBundle.getText("INBOX_ACTION_BUTTON_RELEASE"),icon:"sap-icon://unlocked",enabled:"{SupportsRelease}"});s.attachPress(this,this._handleRelease);a.push(s);var o=new sap.m.Bar(this.Id+"-actionsBar",{contentMiddle:a});t=new sap.m.Page(this.Id+"-detailPage",{title:"{"+this.constants.PROPERTY_NAME_TASK_DEFINITION_NAME+"}",footer:o,showNavButton:jQuery.device.is.phone}).attachNavButtonPress(function(t){sap.ui.getCore().getEventBus().publish("sap.uiext.inbox","detailPageNavButtonTapped")});var n=new sap.m.ObjectHeader(this.Id+"-objHeader",{title:"{"+this.constants.PROPERTY_NAME_TASK_TITLE+"}",attributes:[new sap.m.ObjectAttribute(this.Id+"-objDesc",{text:"{Description/Description}"}),(new sap.m.ObjectAttribute).bindProperty("text",this.constants.PROPERTY_NAME_PRIORITY,function(t){if(t){var a=e._oBundle.getText(e.constants.prioTooltip[t]);a=a==""?t:a;a=e._oBundle.getText("INBOX_PRIORITY")+" : "+a;this.setTooltip(a);return a}return""}),(new sap.m.ObjectAttribute).bindProperty("text","CompletionDeadLine",function(t){if(t!=null&&t!=""){var a=e._oBundle.getText("INBOX_DUE_DATE")+" : "+e.utils._dateFormat(t);this.setTooltip(a);return a}})]}).setTitleActive(true);n.attachTitlePress(this,this._handleTaskTitlePress);t.addContent(n);var r=new sap.m.IconTabBar(this.Id+"-iconTabBar",{items:[new sap.m.IconTabFilter(this.Id+"-custAttrTab",{icon:"sap-icon://hint",iconColor:sap.ui.core.IconColor.Default,key:"customAttr"})]});r.attachSelect(this,this._handleSelectIconTabFilter);t.addContent(r);t.addDelegate({onAfterRendering:function(){}})}return t};sap.uiext.inbox.splitapp.DetailViewPage.prototype._setTcmServiceURL=function(t){this.tcmServiceURL=t};sap.uiext.inbox.splitapp.DetailViewPage.prototype._setTcmConfiguration=function(t){this.useBatch=t.useBatch?t.useBatch:false;this.isCommentsSupported=t.isCommentsSupported?t.isCommentsSupported:false;this._createCommentsView()};sap.uiext.inbox.splitapp.DetailViewPage.prototype._createCommentsView=function(){var t=this.oCore.byId(this.Id+"-iconTabBar");if(this.isCommentsSupported){t.addItem(new sap.m.IconTabFilter(this.Id+"-commentsTab",{icon:"sap-icon://collaborate",iconColor:sap.ui.core.IconColor.Default,key:"comments"}))}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._getOModel=function(){if(!this.oTCMModel){this.oTCMModel=this.detailViewPage.getModel("inboxTCMModel")}return this.oTCMModel};sap.uiext.inbox.splitapp.DetailViewPage.prototype._getPageModel=function(){if(!this.model){this.model=this.detailViewPage.getModel()}return this.model};sap.uiext.inbox.splitapp.DetailViewPage.prototype.getPage=function(){return this.detailViewPage};sap.uiext.inbox.splitapp.DetailViewPage.prototype._handleClaim=function(t,e){e.executeActionOnTask("Claim")};sap.uiext.inbox.splitapp.DetailViewPage.prototype._handleRelease=function(t,e){e.executeActionOnTask("Release")};sap.uiext.inbox.splitapp.DetailViewPage.prototype._handleForward=function(t,e){e.executeActionOnTask("Forward")};sap.uiext.inbox.splitapp.DetailViewPage.prototype._handleTaskTitlePress=function(t,e){e.oCore.getEventBus().publish("sap.uiext.inbox","detailPageTaskTitleSelected",{context:e.detailViewPage.getBindingContext()})};sap.uiext.inbox.splitapp.DetailViewPage.prototype.executeActionOnTask=function(t,e){var a=t==="Forward"?true:false;var e=a?e:"";var i=[],s=[],o=[],n=[];var r=[];var p="'",l="'",d="'";var u,c;var g=this.detailViewPage.getBindingContext();u=this._getPageModel().getProperty("InstanceID",g);c=this._getPageModel().getProperty("SAP__Origin",g);s.push(g);i.push(u);o.push(c);p=p+u+"'";l=l+c+"'";if(a){d="'"+e+"'"}if(i!=null||i.length>0){var h,_,m,C;if(t==="Complete"){t="Complete"}if(t==="Claim"){t="Claim"}if(t==="Release"){t="Release"}if(a){t="Forward"}this.defaultActionHandler(t,p,l,i,o,s,d)}};sap.uiext.inbox.splitapp.DetailViewPage.prototype.defaultActionHandler=function(t,e,a,i,s,o,n){var r,p,l,d;var u=t==="Forward"?true:false;var c=o;var g=this;var h=i.length;var _=g._getPageModel().getProperty("TaskTitle",o[0]);r="/"+t+"?InstanceID="+e+"&SAP__Origin="+a+"&$format=json";if(t==="Release"){t=g._oBundle.getText("INBOX_ACTION_BUTTON_RELEASE")}else if(t==="Claim"){t=g._oBundle.getText("INBOX_ACTION_BUTTON_CLAIM")}else if(t==="Forward"){t=g._oBundle.getText("INBOX_ACTION_BUTTON_FORWARD")}var m=function(e){sap.m.MessageToast.show(g._oBundle.getText("INBOX_MSG_ACTION_FAILED",[t,_]))};if(u){r=r+"&ForwardTo="+n}p=this.tcmServiceURL+r;var C=this._getOModel().oHeaders["x-csrf-token"];if(!C){this._getOModel().refreshSecurityToken(null,null,false);C=this._getOModel().oHeaders["x-csrf-token"]}l={async:true,requestUri:p,method:"POST",headers:{Accept:"application/json","x-csrf-token":C}};OData.request(l,function(e,a){g._handleActionCompleted(e);sap.m.MessageToast.show(g._oBundle.getText("INBOX_MSG_ACTION_SUCCESS",[t,e.TaskTitle]))},m)};sap.uiext.inbox.splitapp.DetailViewPage.prototype._renderCustomActions=function(){var t=[];if(this.detailViewPage.getBindingContext()){var e=this.detailViewPage.getBindingContext();var a=this._getPageModel().getProperty("InstanceID",e);var i=this._getPageModel().getProperty("SAP__Origin",e);var s=this;this._getOModel().read(this.constants.decisionOptionsFunctionImport,null,["InstanceID='"+a+"'&SAP__Origin='"+i+"'",this.constants.formatJSONURLParam],true,function(e,a){t=e.results;s._createCustomActions(t)},function(t){var e=JSON.parse(String(t.response.body));sap.m.MessageToast.show(s._oBundle.getText("INBOX_LP_MSG_ERROR_WHILE_FETCHING_CUSTOM_ACTIONS"),{width:"55em",autoClose:false})})}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._createCustomActions=function(t){var e=this;var a=this.oCore.byId(this.Id+"-actionsBar");this._deleteCustomActions(t,a);var i=t.length;var s=3,o,n,r;if(this.bPhoneDevice){var p=0}else{var p=7}if(i>p){o=t.slice(0,p+1);n=t.slice(p,i);i=p;r=true}for(var l=0;l<i;l++){var d=t[l];var u=e._createCustomActionButton(d);a.insertContentMiddle(u,s);s++}if(r){var c=this.oCore.byId(this.Id+"--"+"customActionMoreButton");if(!c){c=new sap.m.Button(this.Id+"--"+"customActionMoreButton",{icon:"sap-icon://open-command-field"}).data("type",this.constants.customAction).attachPress({that:e,aCustomActionsTobeRendered:n},e._openCustomActionSheet)}a.insertContentMiddle(c,s)}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._openCustomActionSheet=function(t,e){var a=e.that;var i=e.aCustomActionsTobeRendered;var s=a.oCore.byId(a.Id+"--"+"customActionSheet");if(!s){s=new sap.m.ActionSheet(a.Id+"--"+"customActionSheet",{title:"Custom Action",showCancelButton:true,placement:sap.m.PlacementType.Top})}jQuery.each(i,function(t,e){var i=a._createCustomActionButton(e);i.data("source","actionSheet");s.addButton(a._createCustomActionButton(e))});s.openBy(t.getSource())};sap.uiext.inbox.splitapp.DetailViewPage.prototype._createCustomActionButton=function(t){var e=this.oCore.byId(this.Id+"--"+t.DecisionKey+"button");if(!e){var a=t.DecisionText!==undefined&&t.DecisionText!==""?t.DecisionText:t.DecisionKey;var e=new sap.m.Button(this.Id+"--"+t.DecisionKey+"button",{icon:"sap-icon://complete",text:a,tooltip:t.Description}).data("type",this.constants.customAction).data("key",t.DecisionKey).data("text",a);e.attachPress(this,this._handleCustomAction)}return e};sap.uiext.inbox.splitapp.DetailViewPage.prototype._deleteCustomActions=function(t,e){var a=this;var i=e.getContentMiddle();for(var s=0;s<i.length;s++){var o=i[s];if(o instanceof sap.m.Button&&o.data("type")===a.constants.customAction){e.removeContentMiddle(o);o.destroy()}}var n=a.oCore.byId(a.Id+"--"+"customActionSheet");if(n){n.destroy()}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._getPropertyValue=function(t){var e=this.detailViewPage.getBindingContext();if(e){return this._getPageModel().getProperty(t,e)}return null};sap.uiext.inbox.splitapp.DetailViewPage.prototype._handleCustomAction=function(t,e){var a=t.getSource();var i=a.data("key");var s=e.oCore.byId(e.Id+"--"+i+"cAinPopUp");if(!s){s=new sap.m.Button(e.Id+"--"+i+"cAinPopUp",{text:a.data("text"),press:function(t){var a=e.oCore.byId(e.Id+"--"+"addCommentsInputBtn").getValue();e._executeCustomAction(a,i);e.oCore.byId(e.Id+"--"+"customActionWithComments").close()}}).data("key",i)}var o=e.oCore.byId(e.Id+"--"+"customActionWithComments");if(!o){o=new sap.m.ResponsivePopover(e.Id+"--"+"customActionWithComments",{placement:sap.m.PlacementType.Top,content:new sap.m.TextArea(e.Id+"--"+"addCommentsInputBtn",{placeholder:e._oBundle.getText("INBOX_LP_ADD_COMMENT"),maxLength:500,width:"100%"})});if(e.bPhoneDevice){o.setTitle(e._getPageModel().getProperty("TaskTitle",e.detailViewPage.getBindingContext()));o.setShowHeader(e.bPhoneDevice)}}o.setBeginButton(s);var n=e.oCore.byId(e.Id+"--"+"addCommentsInputBtn");if(n){n.setValue("")}if(a.data("source")==="actionSheet"){o.openBy(e.oCore.byId(e.Id+"--"+"customActionMoreButton"))}else{o.openBy(a)}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._executeCustomAction=function(t,e){var a=[],i=[],s=[];var o=[];var n="'",r="'";var p=[];var l,d;var u=this;var c=this.detailViewPage.getBindingContext();var g=this._getPageModel().getProperty("TaskTitle",c);l=this._getPageModel().getProperty("InstanceID",c);d=this._getPageModel().getProperty("SAP__Origin",c);i.push(c);a.push(l);s.push(d);n=n+l+"'";r=r+d+"'";var h,_,m,C,v;v=a.length;h=this.constants.forwardSlash+this.constants.decisionExecutionFunctionImport+this.constants.query+"InstanceID="+n+this.constants.amperSand+"SAP__Origin="+r+this.constants.amperSand+"DecisionKey='"+e+"'"+this.constants.amperSand+this.constants.formatJSONURLParam;if(t)h=h+"&Comments='"+t+"'";_=this.tcmServiceURL+h;var f=this._getOModel().oHeaders["x-csrf-token"];if(!f){this._getOModel().refreshSecurityToken(null,null,false);f=this._getOModel().oHeaders["x-csrf-token"]}m={async:true,requestUri:_,method:"POST",headers:{Accept:this.constants.acceptHeaderforJSON,"x-csrf-token":f}};OData.request(m,function(t,a){u._handleActionCompleted(t);sap.m.MessageToast.show(u._oBundle.getText("INBOX_MSG_ACTION_SUCCESS",[e,t.TaskTitle]))},function(t){sap.m.MessageToast.show(u._oBundle.getText("INBOX_MSG_ACTION_FAILED",[e,g]))})};sap.uiext.inbox.splitapp.DetailViewPage.prototype._createCustomAttributes=function(){if(this.detailViewPage.getBindingContext()){var t=this._getPropertyValue("TaskDefinitionID");var e=this._getPropertyValue("SAP__Origin");var a=this._getPropertyValue("InstanceID");this._getCustomAttributeMetaData(t,e,a)}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._getCustomAttributeMetaData=function(t,e,a){var i=this;var s=this.constants;var o=s.TaskDefinitionCollection;var n=s.oTaskDefinitionCustomAttributesMap[t];if(!n){var r=this._getRequestURLCustomAttributeMetaData(o,t,e);var p=this.tcmServiceURL+r;var l={async:true,requestUri:p,method:"GET",headers:{Accept:s.acceptHeaderforJSON}};OData.request(l,function(o,n){s.oTaskDefinitionCustomAttributesMap[t]=o.results;i.showHideIconTabFilters(a,e,o.results)},function(t){var e=JSON.parse(String(t.response.body));sap.m.MessageToast.show(i._oBundle.getText("INBOX_LP_MSG_ERROR_WHILE_FETCHING_CUSTOM_ATTR"),{width:"55em",autoClose:false})})}else{i.showHideIconTabFilters(a,e,n)}};sap.uiext.inbox.splitapp.DetailViewPage.prototype.showHideIconTabFilters=function(t,e,a){var i=sap.ui.getCore().byId(this.Id+"-iconTabBar");var s=i.getItems();var o=i.getSelectedKey();if(a.length>0){s[0].setVisible(true);if(o==="customAttr"&&i.getExpanded()===true){this._addBusyIndicatorForTaskDetails(s[0]);this._getCustomAttributeData(t,e,a)}else if(o==="comments"&&i.getExpanded()===true){this._handleSelectComments(s[1])}}else{s[0].setVisible(false);if(!(o==="comments")){i.setSelectedKey("comments")}if(i.getExpanded()===true){this._handleSelectComments(s[1])}}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._getCustomAttributeData=function(t,e,a){var i=this;var s=this.constants;var o=s.TaskCollection;var n=s.oTaskInstanceCustomAttributeValuesMap;var r=n[t];var p=sap.ui.getCore().byId(i.Id+"-iconTabBar");if(!r){var l=this._getRequestURLCustomAttributeData(o,t,e);var d=this._getOModel().sServiceUrl+l;var u={async:true,requestUri:d,method:"GET",headers:{Accept:s.acceptHeaderforJSON}};OData.request(u,function(e,o){var n=i._transformCustomAttributeJsonToArray(e.results);s.oTaskInstanceCustomAttributeValuesMap[t]=n;p.getItems()[0].addContent(i._renderCustomAttributes(a,n))},function(t){sap.m.MessageToast.show(i._oBundle.getText("INBOX_MSG_FETCH_CUSTOM_ATTRIBUTES_FAILS"))})}else{p.getItems()[0].addContent(i._renderCustomAttributes(a,r))}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._handleSelectIconTabFilter=function(t,e){var a=e.oCore.byId(e.Id+"-iconTabBar");var i=a.getItems();if(a.getSelectedKey()==="customAttr"){e._createCustomAttributes()}else if(a.getSelectedKey()==="comments"&&a.getExpanded()===true){e._handleSelectComments(i[1])}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._createCustomAttributesLayout=function(t,e){var a=this.oCore.byId(this.Id+"-iconTabBar");var i=this.oCore.byId(this.Id+"-custAttrTab");i.removeAllContent();var s=t.length;if(s>0){var o=this.oCore.byId(this.Id+"-custAttrScrollCont");if(!o){o=new sap.m.ScrollContainer(this.Id+"-custAttrScrollCont",{vertical:true,width:"auto"}).addStyleClass("inbox_split_app_scrollContainer")}o.removeAllContent();var n=this.oCore.byId(this.Id+"-custAttForm");if(!n){n=new sap.ui.layout.form.SimpleForm(this.Id+"-custAttForm",{})}n.removeAllContent();for(var r=0;r<s;r++){n.addContent(new sap.m.Label({text:t[r].Label}));n.addContent(new sap.m.Text({text:e[t[r].Name]}))}o.addContent(n);return o}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._handleActionCompleted=function(t){this.oCore.getEventBus().publish("sap.uiext.inbox","taskActionCompleted",{taskData:t})};sap.uiext.inbox.splitapp.DetailViewPage.prototype._rerenderTaskDescription=function(t){var e=this._getPageModel().getProperty(this.detailViewPage.getBindingContext().getPath(),this.detailViewPage.getBindingContext());if(e.Description){e.Description.Description=t}else{e.Description={Description:t}}this._getPageModel().checkUpdate(false)};sap.uiext.inbox.splitapp.DetailViewPage.prototype.renderDetailsPage=function(t){if(this.useBatch){this._renderDetailsPageBatchProcessing()}else{this._renderDetailsPageNonBatchProcessing(t)}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._renderDetailsPageBatchProcessing=function(){var t=this;var e=this._addReadCustomAttributeMetaDatatoBatch();var a=this._addReadCustomAttributeDataToBatch();var i=this._addReadTaskDescriptiontoBatch();var s=this._addReadCustomActionstoBatch();if(s||e||a){this._getOModel().submitBatch(function(o,n){var r=t.detailViewPage.getBindingContext();var p=t._getPageModel().getProperty("TaskDefinitionID",r);var l=t._getPageModel().getProperty("InstanceID",r);var d=0;var u,c,g,h,_;if(e){g=t._processCustomAttributeDefinitionResponse(t,o.__batchResponses[d++],p)}if(a){h=t._processCustomAttributeResponse(t,o.__batchResponses[d++],p,l)}if(i){u=t._processTaskDescriptionResponse(t,o.__batchResponses[d++],l)}if(s){c=t._processCustomActionResponse(t,o.__batchResponses[d++],p)}if(u){_=u}if(c){_=_?_+c:c}if(g){_=_?_+g:g}if(h){_=_?_+h:h}if(_){sap.m.MessageToast.show(_,{width:"55em",autoClose:false})}},function(e){var a=JSON.parse(String(e.response.body));sap.m.MessageToast.show(t._oBundle.getText("INBOX_LP_MSG_ERROR_WHILE_LOADING_DETAIL_PAGE"),{width:"55em",autoClose:false})},true)}else{}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._processTaskDescriptionResponse=function(t,e,a){if(e&&e.statusCode&&e.statusCode==200){t.constants.taskDescriptionsMap[a]=e.data.Description;t._rerenderTaskDescription(e.data.Description)}else{if(e){var i;if(e.response){i=JSON.parse(String(e.response.body)).error.message.value}var s=t._oBundle.getText("INBOX_LP_MSG_ERROR_WHILE_FETCHING_TASK_DESC");return s}}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._processCustomActionResponse=function(t,e,a){if(e&&e.statusCode&&e.statusCode==200){t.constants.taskDefinitionDecisionOptionsMap[a]=e.data.results;t._createCustomActions(e.data.results)}else{if(e){var i;if(e.response){i=JSON.parse(String(e.response.body)).error.message.value}var s=t._oBundle.getText("INBOX_LP_MSG_ERROR_WHILE_FETCHING_CUSTOM_ACTIONS");return s}}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._processCustomAttributeDefinitionResponse=function(t,e,a){if(e&&e.statusCode&&e.statusCode==200){t.constants.oTaskDefinitionCustomAttributesMap[a]=e.data.results}else{if(e&&!e.statusCode){var i;if(e.response){i=JSON.parse(String(e.response.body)).errorBody.error.message.value}var s=t._oBundle.getText("INBOX_LP_MSG_ERROR_WHILE_FETCHING_CUSTOM_ATTR");return s}}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._processCustomAttributeResponse=function(t,e,a,i){if(e&&e.statusCode&&e.statusCode==200){var s=t.oCore.byId(t.Id+"-iconTabBar");if(s.getSelectedKey()==="customAttr"){var o=t._transformCustomAttributeJsonToArray(e.data.results);t.constants.oTaskInstanceCustomAttributeValuesMap[i]=o;s.getItems()[0].addContent(t._renderCustomAttributes(t.constants.oTaskDefinitionCustomAttributesMap[a],o))}}else{if(e&&!e.statusCode){var n;if(e.response){n=JSON.parse(String(e.response.body)).errorBody.error.message.value}var r=t._oBundle.getText("INBOX_LP_MSG_ERROR_WHILE_FETCHING_CUSTOM_ATTR");return r}}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._addReadTaskDescriptiontoBatch=function(){if(this.detailViewPage.getBindingContext()){var t=this.detailViewPage.getBindingContext();var e=this._getPageModel().getProperty("InstanceID",t);var a=this._getPageModel().getProperty("SAP__Origin",t);var i=this.constants;var s=i.TaskCollection;var o=i.taskDescriptionsMap[e];if(o){this._rerenderTaskDescription(o);return false}else{var n=this._getRequestURLTaskDescription(s,e,a);var r=this._getOModel().createBatchOperation(n,"GET",null);this._getOModel().addBatchReadOperations([r]);return true}}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._getRequestURLTaskDescription=function(t,e,a){var i=this.constants;var s=i.forwardSlash+t.entityName+"("+t.properties.instanceID+"='"+e+"',"+i.sapOrigin+"='"+a+"')"+i.forwardSlash+t.navParam.taskDescription;return s};sap.uiext.inbox.splitapp.DetailViewPage.prototype._addReadCustomActionstoBatch=function(){if(this.detailViewPage.getBindingContext()){var t=this.detailViewPage.getBindingContext();var e=this._getPageModel().getProperty("InstanceID",t);var a=this._getPageModel().getProperty("SAP__Origin",t);var i=this._getPageModel().getProperty("TaskDefinitionID",t);var s=this.constants;var o=s.taskDefinitionDecisionOptionsMap;var n=o[i];if(n){this._createCustomActions(n);return false}else{var r=this.constants.decisionOptionsFunctionImport+this.constants.query+"InstanceID='"+e+"'&SAP__Origin='"+a+"'";var p=this._getOModel().createBatchOperation(r,"GET");this._getOModel().addBatchReadOperations([p]);return true}}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._addReadCustomAttributeMetaDatatoBatch=function(){if(this.detailViewPage.getBindingContext()){var t=this.detailViewPage.getBindingContext();var e=this._getPageModel().getProperty("TaskDefinitionID",t);var a=this._getPageModel().getProperty("SAP__Origin",t);var i=this.constants;var s=i.TaskDefinitionCollection;var o=i.oTaskDefinitionCustomAttributesMap;var n=o[e];if(!n){var r=this._getRequestURLCustomAttributeMetaData(s,e,a);var p=this._getOModel().createBatchOperation(r,"GET");this._getOModel().addBatchReadOperations([p]);return true}else{return false}}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._getRequestURLCustomAttributeMetaData=function(t,e,a){var i=this.constants;var s=i.forwardSlash+t.entityName+"("+t.properties.taskDefnID+"='"+e+"',"+i.sapOrigin+"='"+a+"')"+i.forwardSlash+t.navParam.customAttrDefn;return s};sap.uiext.inbox.splitapp.DetailViewPage.prototype._addReadCustomAttributeDataToBatch=function(){if(this.detailViewPage.getBindingContext()){var t=this.detailViewPage.getBindingContext();var e=this._getPageModel().getProperty("TaskDefinitionID",t);var a=this._getPageModel().getProperty("InstanceID",t);var i=this._getPageModel().getProperty("SAP__Origin",t);var s=this.constants;var o=s.TaskCollection;var n=s.oTaskInstanceCustomAttributeValuesMap;var r=n[a];if(r){var p=this.oCore.byId(this.Id+"-iconTabBar");if(p.getSelectedKey()==="customAttr"){var l=s.oTaskDefinitionCustomAttributesMap;var d=l[e];p.getItems()[0].addContent(this._renderCustomAttributes(d,r))}return false}else{var u=this._getRequestURLCustomAttributeData(o,a,i);var c=this._getOModel().createBatchOperation(u,"GET");this._getOModel().addBatchReadOperations([c]);return true}}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._getRequestURLCustomAttributeData=function(t,e,a){var i=this.constants;var s=i.forwardSlash+t.entityName+"("+t.properties.instanceID+"='"+e+"',"+i.sapOrigin+"='"+a+"')"+i.forwardSlash+t.navParam.customAttrValues;return s};sap.uiext.inbox.splitapp.DetailViewPage.prototype._renderCustomAttributes=function(t,e){var a=this.oCore.byId(this.Id+"-iconTabBar");return this._createCustomAttributesLayout(t,e)};sap.uiext.inbox.splitapp.DetailViewPage.prototype._transformCustomAttributeJsonToArray=function(t){var e=this.detailViewPage.getBindingContext();var a=this.constants.oTaskInstanceCustomAttributeValuesMap;var i=this._getPageModel().getProperty("InstanceID",e);var s={};var s;for(var o=0;o<t.length;o++){s[t[o].Name]=t[o].Value;a[i]=s}return s};sap.uiext.inbox.splitapp.DetailViewPage.prototype._renderDetailsPageNonBatchProcessing=function(t){this._renderTaskDescription();this._renderCustomActions();this._createCustomAttributes()};sap.uiext.inbox.splitapp.DetailViewPage.prototype._renderTaskDescription=function(){var t=this;var e=this.constants;var a=e.TaskCollection;var i=this.detailViewPage.getBindingContext();var s=this._getPageModel().getProperty("InstanceID",i);var o=this._getPageModel().getProperty("SAP__Origin",i);var n=e.taskDescriptionsMap[s];if(n){this._rerenderTaskDescription(n)}else{var r=this._getRequestURLTaskDescription(a,s,o);var p=this.tcmServiceURL+r;var l={async:true,requestUri:p,method:"GET",headers:{Accept:e.acceptHeaderforJSON}};OData.request(l,function(a,i){e.taskDescriptionsMap[s]=a.Description;t._rerenderTaskDescription(a.Description)},function(e){var a=JSON.parse(String(e.response.body));sap.m.MessageToast.show(t._oBundle.getText("INBOX_LP_MSG_ERROR_WHILE_FETCHING_TASK_DESC"),{width:"55em",autoClose:false})})}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._handleSelectComments=function(t){t.removeAllContent();var e=this.oCore.byId(this.Id+"-commentsScrollCont");if(!e){e=new sap.m.ScrollContainer(this.Id+"-commentsScrollCont",{vertical:true,width:"100%"})}e.removeAllContent();var a=this.oCore.byId("commentsBI");if(!a){a=new sap.m.BusyIndicator("commentsBI",{text:this._oBundle.getText("INBOX_LP_LOADING")})}e.addContent(a);var i=this.oCore.byId("addCommentContainer");if(!i){i=new sap.m.FlexBox("addCommentContainer",{width:"100%",items:[new sap.m.TextArea("addCommentsInput",{type:sap.m.InputType.Text,placeholder:this._oBundle.getText("INBOX_LP_ADD_COMMENT"),maxLength:500,rows:3}).addStyleClass("inbox_split_app_addCommentInput"),new sap.m.Button("addCommentsButton",{text:this._oBundle.getText("INBOX_LP_ADD_BUTTON_TEXT")}).attachPress(this,this._handleCommentAdded).addStyleClass("inbox_split_app_addCommentBtn")],fitContainer:true}).addStyleClass("inbox_split_app_addCommentContainer")}else{var s=i.getItems()[0];if(s){s.setValue("")}}e.addContent(i);t.addContent(e);this._getComments()};sap.uiext.inbox.splitapp.DetailViewPage.prototype._getComments=function(){if(this.detailViewPage.getBindingContext()){var t=this.detailViewPage.getBindingContext();var e=this._getPageModel().getProperty("InstanceID",t);var a=this._getPageModel().getProperty("SAP__Origin",t);var i=this._loadCommentsFromServer(e,a);return true}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._handleCommentAdded=function(t,e){var a=jQuery.sap._sanitizeHTML(e.oCore.byId("addCommentsInput").getValue());if(e.detailViewPage.getBindingContext()&&a){var i=e.detailViewPage.getBindingContext();var s=e._getPageModel().getProperty("InstanceID",i);var o=e._getPageModel().getProperty("SAP__Origin",i);var n=e._getOModel();var r=e.tcmServiceURL+"/AddComment?InstanceID='"+s+"'&SAP__Origin='"+o+"'&Text='"+encodeURIComponent(a)+"'&$format=json";var p=n.oHeaders["x-csrf-token"];if(!p){e._getOModel().refreshSecurityToken(null,null,false);p=n.oHeaders["x-csrf-token"]}var l={async:false,requestUri:r,method:"POST",headers:{Accept:e.constants.acceptHeaderforJSON,"x-csrf-token":p}};OData.request(l,function(t,a){var i=e.oCore.byId(e.Id+"--commentsList");e._loadCommentsFromServer(s,o);sap.m.MessageToast.show(e._oBundle.getText("INBOX_MSG_COMMENT_ADD_SUCCESS"));e.oCore.byId("addCommentsInput").setValue()},function(t){sap.m.MessageToast.show(e._oBundle.getText("INBOX_MSG_COMMENT_ADD_ERROR"))})}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._loadCommentsFromServer=function(t,e){var a=this;var i=this.constants;var s=i.TaskCollection;var o=i.forwardSlash+s.entityName+"("+s.properties.instanceID+"='"+t+"',"+i.sapOrigin+"='"+e+"')"+i.forwardSlash+s.navParam.comments;var n=this.tcmServiceURL+o;var r=[];var p={async:true,requestUri:n,method:"GET",headers:{Accept:i.acceptHeaderforJSON}};OData.request(p,function(t,e){a._displayComments(t.results)},function(t){sap.m.MessageToast.show(a._oBundle.getText("INBOX_MSG_FETCH_COMMENTS_FAILS"))})};sap.uiext.inbox.splitapp.DetailViewPage.prototype._displayComments=function(t){var e=this;var a=t&&t.length>0;var i=this.oCore.byId(this.Id+"-commentsScrollCont");var s=this.oCore.byId("commentsBI");if(a){var o=this.oCore.byId(this.Id+"--commentsList");var n;if(!o){var o=new sap.m.List(this.Id+"--"+"commentsList").addStyleClass("inbox_split_app_CommentsList");o.setShowSeparators(sap.m.ListSeparators.All);n=new sap.ui.model.json.JSONModel;o.setModel(n)}else{n=o.getModel()}n.setData(t);var r=new sap.m.FeedListItem({sender:"{CreatedByName}",text:"{Text}"});r.bindProperty("timestamp","CreatedAt",this.utils.dateTimeFormat);r.bindProperty("icon","CreatedBy",function(t){if(this.getBindingContext()){return e.utils.getUserMediaResourceURL(e.tcmServiceURL,this.getBindingContext().getProperty("SAP__Origin"),t)}else{return"sap-icon://person-placeholder"}});o.bindAggregation("items",{path:"/",template:r});i.removeContent(s);i.insertContent(o,0)}else{i.removeContent(s)}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._displayCommentsIfCommentsSelectedinIconBar=function(){var t=this.oCore.byId(this.Id+"-iconTabBar");if(t.getSelectedKey()==="comments"&&t.getExpanded()===true){this._handleSelectComments(t.getItems()[1])}};sap.uiext.inbox.splitapp.DetailViewPage.prototype._addBusyIndicatorForTaskDetails=function(t){var e=this.oCore.byId(this.Id+"-custAttrScrollCont");if(!e){e=new sap.m.ScrollContainer(this.Id+"-custAttrScrollCont",{vertical:true,width:"auto"}).addStyleClass("inbox_split_app_scrollContainer")}e.removeAllContent();var a=this.oCore.byId("customAttrBI");if(!a){a=new sap.m.BusyIndicator("customAttrBI",{text:this._oBundle.getText("INBOX_LP_LOADING")})}e.addContent(a);t.addContent(e)};sap.uiext.inbox.splitapp.DetailViewPage.prototype.updateTaskDataInModel=function(t){var e=t.Status=="COMPLETED"?true:false;var a=this.detailViewPage.getBindingContext().getPath();var i=a.split("/");if(e){this.detailViewPage.getModel().oData.TaskCollection.splice(i[2],1)}else{this.detailViewPage.getModel().oData.TaskCollection[i[2]]=t}this.detailViewPage.getModel().checkUpdate(false)};
//# sourceMappingURL=DetailViewPage.js.map