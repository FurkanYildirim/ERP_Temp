sap.ui.define(["sap/ui/thirdparty/jquery","./library","./CalculationBuilderItem","sap/ui/core/Control","sap/ui/core/Popup","sap/ui/core/delegate/ItemNavigation","sap/m/MessageBox","sap/m/OverflowToolbar","sap/m/OverflowToolbarToggleButton","sap/m/OverflowToolbarButton","sap/m/ToolbarSpacer","sap/m/Title","sap/m/Button","sap/m/FlexBox","sap/m/HBox","sap/m/VBox","sap/m/library","sap/m/SegmentedButton","sap/m/SegmentedButtonItem","sap/m/StepInput","sap/m/Input","sap/m/Page","sap/m/List","sap/m/StandardListItem","sap/m/NavContainer","sap/m/SearchField","sap/m/Label","sap/m/Panel","sap/m/ResponsivePopover","sap/m/Toolbar","sap/m/MessageStrip","./CalculationBuilderValidationResult","sap/suite/ui/commons/ControlProxy","sap/ui/core/Icon","sap/ui/core/library","sap/ui/thirdparty/jqueryui/jquery-ui-core","sap/ui/thirdparty/jqueryui/jquery-ui-widget","sap/ui/thirdparty/jqueryui/jquery-ui-mouse","sap/ui/thirdparty/jqueryui/jquery-ui-draggable","sap/ui/thirdparty/jqueryui/jquery-ui-droppable","sap/ui/thirdparty/jqueryui/jquery-ui-selectable"],function(jQuery,e,t,i,r,n,a,s,o,l,u,p,c,d,_,h,g,f,I,m,C,E,T,A,L,v,y,B,R,b,O,S,N,x,P){"use strict";var U=g.PlacementType;var D=g.ListType;var w=g.ListMode;var F=g.FlexRendertype;var V=P.TextAlign;var K=P.ValueState;var G=e.CalculationBuilderItemType,M=e.CalculationBuilderOperatorType,k=e.CalculationBuilderComparisonOperatorType,j=e.CalculationBuilderLogicalOperatorType,Y=e.CalculationBuilderLayoutType,$=g.FlexDirection;var X=Object.freeze({PAGE_MAIN:"-pagemain",PAGE_OPERATORS:"-pageoperators",PAGE_VARIABLE:"-pagevariable",PAGE_FUNCTIONS:"-pagefunctions",LABEL_LITERALS:"-literalInput-label",INPUT_LITERALS:"-literalInput-field"});var q=Object.freeze({OPERATORS_CATEGORY:"sap-icon://attachment-html",LITERALS_CATEGORY:"sap-icon://grid",VARIABLES_CATEGORY:"sap-icon://notes",FUNCTIONS_CATEGORY:"sap-icon://chalkboard",DELETE:"sap-icon://delete"});var H=Object.freeze({KEY_PREVIOUS:"previous",KEY_NEXT:"next",MOUSE:"mouse"});var z="##DEFAULT##";var W=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");var Q=i.extend("sap.suite.ui.commons.CalculationBuilderExpression",{metadata:{library:"sap.suite.ui.commons",defaultAggregation:"items",aggregations:{items:{type:"sap.suite.ui.commons.CalculationBuilderItem",multiple:true,singularName:"item",bindable:"bindable"},variables:{type:"sap.suite.ui.commons.CalculationBuilderVariable",multiple:true,singularName:"Variable"},functions:{type:"sap.suite.ui.commons.CalculationBuilderFunction",multiple:true,singularName:"Function"},operators:{type:"sap.ui.core.Item",multiple:true,singularName:"operator"},groups:{type:"sap.suite.ui.commons.CalculationBuilderGroup",multiple:true,singularName:"Group"}},events:{change:{}}},renderer:{apiVersion:2,render:function(e,t){e.openStart("div",t);e.class("sapCalculationBuilderInner");e.openEnd();t._renderDelimiter(e,0);t.getItems().forEach(function(i,r){i._iIndex=r;i._bReadOnly=t._bReadOnly;e.renderControl(i);t._renderDelimiter(e,r+1)},this);if(!t._bReadOnly){e.renderControl(t._getNewItem())}e.openStart("div");e.class("sapCalculationBuilderSelected");e.openEnd();e.close("div");e.close("div");e.openStart("div",t.getId()+"-erroricon");e.class("sapCalculationBuilderExpressionErrorIcon");e.openEnd();e.renderControl(t._getErrorIcon());e.close("div")}}});Q.prototype.init=function(){this._aErrors=[];this._bAreSelectedItemsDeleting=false;this._bDragging=false;this._bIsCalculationBuilderRendering=false};Q.prototype._renderDelimiter=function(e,t){e.openStart("div");e.attr("index",t);e.class("sapCalculationBuilderDelimiter").class("sapCalculationBuilderDroppable");e.openEnd();e.openStart("div");e.class("sapCalculationBuilderDroppableLine");e.openEnd();e.close("div");e.openStart("div");e.class("sapCalculationBuilderDroppableCircle");e.openEnd();e.close("div");e.openStart("div");e.class("sapCalculationBuilderDelimiterNewButton");e.openEnd();e.openStart("span");e.attr("role","presentation");e.attr("aria-hidden","true");e.attr("data-sap-ui-icon-content","");e.class("sapUiIcon").class("sapUiIconMirrorInRTL").class("sapCalculationBuilderDelimiterNewButtonIcon").class("sapCalculationBuilderExpressionSAPFont");e.openEnd();e.close("span");e.close("div");e.close("div")};Q.prototype.onBeforeRendering=function(){if(!this.getParent()._oInput._aVariables.length){this._createVariablesMap();this.getParent()._oInput._aVariables=this.getParent().getVariables()}this._reset();this._createPopup();this.getParent()._enableOrDisableExpandAllButton();this._aErrors=this._validateSyntax();this._fireAfterValidation();this._bIsCalculationBuilderRendering=true;this._bRendered=false};Q.prototype.onAfterRendering=function(){this._bIsCalculationBuilderRendering=false;if(!this._bReadOnly){this._setupDroppable();this._setupSelectable();this._setupNewButtonEvents()}this._setupKeyboard();this._bRendered=true;var e=this.getParent();if(e._bRendered){e._setExpression(e._oInput._itemsToString({items:this.getItems(),errors:this._aErrors}));e._oInput._displayError(this._aErrors.length!==0)}};Q.prototype.onsapfocusleave=function(){if(!this._bAreSelectedItemsDeleting){this._deselect()}};Q.prototype.onsapenter=function(e){this._handleEnter(e)};Q.prototype.onsapspace=function(e){if(jQuery(e.target).hasClass("sapCalculationBuilderItem")){this._handleSpace(e)}};Q.prototype.onsappreviousmodifiers=function(e){if(e.ctrlKey){this._handleCtrlPrevious(e)}};Q.prototype.onsapnextmodifiers=function(e){if(e.ctrlKey){this._handleCtrlNext(e)}};Q.prototype.onsapdelete=function(e){this._handleDelete(e)};Q.prototype.exit=function(){if(this._oPopover){this._oPopover.destroy()}if(this._oItemNavigation){this.removeDelegate(this._oItemNavigation);this._oItemNavigation.destroy()}if(this._oErrorIcon){this._oErrorIcon.destroy();this._oErrorIcon=null}};Q.prototype._getErrorIcon=function(){if(!this._oErrorIcon){this._oErrorIcon=new x({src:"sap-icon://message-error",useIconTooltip:false,size:"20px"})}return this._oErrorIcon};Q.prototype._createPopup=function(){var e={footerButtons:[]};this._createPopoverLayout(e);this._createPopoverFunctionsItems(e);this._createPopoverOperatorsItems(e);this._createPopoverNavContainer(e);this._createPopover(e)};Q.prototype._reset=function(){this.getItems().forEach(function(e){e._reset()});if(this._oPopover){this._oPopover.destroy();this._oPopover=null}};Q.prototype._createPopoverLayout=function(e){var t=function(e){return new c({text:e,press:this._updateOrCreateItem.bind(this,{type:G.Operator,key:e})}).addStyleClass("sapUiTinyMarginEnd")}.bind(this);var i=new _({renderType:F.Div,width:"100%"});i.addStyleClass("sapCalculationBuilderItemPopupOperators");i.addStyleClass("sapCalculationBuilderItemPopupOptionItem");Object.keys(M).forEach(function(e){if(this.getParent()._isTokenAllowed(e)){var r=t(M[e]);if(e===M[","]){this._attachAriaLabelToButton(r,W.getText("CALCULATION_BUILDER_COMMA_ARIA_LABEL"))}else if(e===M["-"]){this._attachAriaLabelToButton(r,W.getText("CALCULATION_BUILDER_MINUS_ARIA_LABEL"))}i.addItem(r)}}.bind(this));var r=this._createPopoverLiteralLabelAndInput(e);var n=new h({items:[i,r],alignItems:"Start"});n.addStyleClass("sapCalculationBuilderItemPopupOperatorsAndInputWrapper");e.layout=n.getItems().length>0?n:null};Q.prototype._createPopoverLiteralLabelAndInput=function(e){var t=new y({id:this.getId()+X.LABEL_LITERALS,text:W.getText("CALCULATION_BUILDER_LITERAL_INPUT_LABEL")});var i;if(this.getParent().getAllowStringLiterals()){i=new C({id:this.getId()+X.INPUT_LITERALS,width:"100%",placeholder:W.getText("CALCULATION_BUILDER_ADD_LITERAL_FIELD_PLACEHOLDER_ANY_STRING"),valueStateText:W.getText("CALCULATION_BUILDER_ADD_LITERAL_FIELD_PLACEHOLDER_ERROR"),liveChange:function(t){var i=t.getSource(),r=t.getParameter("value"),n=r.indexOf('"')===-1;i.setValueState(n?K.None:K.Error);e.footerButtons.okButton.setEnabled(n)},submit:function(e){this._submitLiteralInput(i)}.bind(this)})}else{i=new m({width:"100%",placeholder:W.getText("CALCULATION_BUILDER_ADD_LITERAL_FIELD_PLACEHOLDER"),textAlign:V.Right,valueStateText:W.getText("CALCULATION_BUILDER_ADD_LITERAL_FIELD_ERROR_TEXT"),displayValuePrecision:3,change:function(){e.footerButtons.okButton.setEnabled(true)}});if(i._getInput){var r=i._getInput();if(r){r.attachSubmit(function(e){this._submitLiteralInput(i)},this)}}}i.addAriaLabelledBy(t);e.literalInput=i;var n=new h({renderType:F.Div,items:[t,i],width:"100%"});n.addStyleClass("sapCalculationBuilderItemPopupOptionItem");n.addStyleClass("sapCalculationBuilderItemPopupLiteralLabelAndInput");return n};Q.prototype._createPopoverVariablesItems=function(e){if(!e){return[]}var t=[];e.forEach(function(e){var i=new A({title:e._getLabel()});i._calculationBuilderKey=e.getKey();t.push(i)},this);t=t.sort(function(e,t){return e.getTitle().localeCompare(t.getTitle())});var i=new T({mode:w.SingleSelectMaster,selectionChange:function(e){this._updateOrCreateItem({type:G.Variable,key:e.getParameter("listItem")._calculationBuilderKey})}.bind(this),items:t});this._oSearchField=new v({placeholder:W.getText("CALCULATION_BUILDER_SEARCH_VARIABLE"),liveChange:function(e){var r=e.getSource().getValue();if(r||r===""){i.removeAllItems();t.forEach(function(e){if(e.getTitle().toLowerCase().indexOf(r.toLowerCase())!==-1){i.addItem(e)}})}}});this._aVariableLists.push(i);return[this._oSearchField,i]};Q.prototype._createPopoverFunctionsItems=function(e){var t=this,i=this.getParent();var r=function(e){return new A({title:e.title,description:e.description,type:D.Active,customData:[{key:"functionKey",value:e.key}],press:e.press})};e.functionList=new T({mode:w.SingleSelectMaster,itemPress:function(){this.getSelectedItem().firePress()}});i._getAllFunctions().forEach(function(i){e.functionList.addItem(r({key:i.key,title:i.title,description:i.description,press:t._updateOrCreateItem.bind(t,{key:i.key,type:i.type,functionObject:i.functionObject})}))})};Q.prototype._createPopoverOperatorsItems=function(e){var t=this.getParent();var i=function(e,i){var r=[];Object.keys(e).forEach(function(n){var a,s,o=e[n];if(t._isTokenAllowed(n)){if(typeof o==="object"){s=o.getText();a=o.getKey()}else{a=s=o}var l=new c({text:s,press:this._updateOrCreateItem.bind(this,{type:i,key:a})}).addStyleClass("sapCalculationBuilderPopoverOperatorsButton").addStyleClass("sapUiTinyMarginEnd");if(n===k["!="]){this._attachAriaLabelToButton(l,W.getText("CALCULATION_BUILDER_NOT_EQUAL_ARIA_LABEL"))}r.push(l)}}.bind(this));return r}.bind(this);var r=function(e,t,r){var n=i(t,r);if(n.length>0){return new B({content:[new y({width:"100%",text:e}).addStyleClass("sapUiTinyMarginBottom"),n]})}return null};e.operatorsItems=[];if(this.getParent().getAllowComparisonOperators()){var n=r(W.getText("CALCULATION_BUILDER_COMPARISON_TITLE_SELECT"),k,G.Operator);n&&e.operatorsItems.push(n)}if(this.getParent().getAllowLogicalOperators()){var a=r(W.getText("CALCULATION_BUILDER_LOGICAL_TITLE_SELECT"),j,G.Operator);a&&e.operatorsItems.push(a)}var s=this.getParent().getOperators();if(s.length>0){e.operatorsItems.push(r(W.getText("CALCULATION_BUILDER_OPERATORS_TITLE"),s,G.CustomOperator))}};Q.prototype._createPopoverNavContainer=function(e){var t=function(e){var t=o.getPage(e);o.to(t)};var i=function(){var e=new O({type:"Error",showIcon:true}).addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginEnd sapUiTinyMarginTop");this._aStrips.push(e);return e}.bind(this);this._aStrips=[];var r=[];var n=this._createPopoverVariablesItems(this._mGroups[z]);if(n.length>0){r.push(new A({title:W.getText("CALCULATION_BUILDER_VARIABLES_TITLE"),description:W.getText("CALCULATION_BUILDER_VARIABLES_CATEGORY_DESCRIPTION"),wrapping:true,icon:q.VARIABLES_CATEGORY,press:t.bind(this,this.getId()+X.PAGE_VARIABLE),type:D.Active}))}var a=e.functionList.getItems();if(a.length>0){r.push(new A({title:W.getText("CALCULATION_BUILDER_FUNCTIONS_TITLE"),type:D.Active,description:W.getText("CALCULATION_BUILDER_FUNCTIONS_CATEGORY_DESCRIPTION"),wrapping:true,icon:q.FUNCTIONS_CATEGORY,press:t.bind(this,this.getId()+X.PAGE_FUNCTIONS)}))}if(e.operatorsItems.length>0){r.unshift(new A({title:W.getText("CALCULATION_BUILDER_OPERATORS_TITLE"),type:D.Active,description:W.getText("CALCULATION_BUILDER_OPERATORS_CATEGORY_DESCRIPTION"),wrapping:true,icon:q.OPERATORS_CATEGORY,press:t.bind(this,this.getId()+X.PAGE_OPERATORS)}))}this.getGroups().forEach(function(e){r.push(new A({title:e._getTitle(),type:D.Active,description:e.getDescription(),icon:e.getIcon(),press:t.bind(this,this.getId()+e.getKey())}))}.bind(this));var s=new E({id:this.getId()+X.PAGE_MAIN,title:W.getText("CALCULATION_BUILDER_DIALOG_TITLE"),content:[i(),e.layout,new d({direction:$.Column,items:[new T({items:r})]}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop").addStyleClass("sapCalculationBuilderNavMainPage")]});s.setFooter(this._getPageFooter(s.getId(),e));var o=new L({defaultTransitionName:"show",navigate:function(t){var i=t.getParameters().to;i.setFooter(this._getPageFooter(i.getId(),e))}.bind(this),pages:[s]});if(e.operatorsItems.length>0){o.addPage(new E({id:this.getId()+X.PAGE_OPERATORS,content:[i(),new d({direction:$.Column,items:[e.operatorsItems]}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop")],showNavButton:true,title:W.getText("CALCULATION_BUILDER_OPERATORS_PAGE_TITLE"),navButtonPress:t.bind(this,this.getId()+X.PAGE_MAIN)}))}if(n.length>0){o.addPage(new E({id:this.getId()+X.PAGE_VARIABLE,content:[i(),new d({direction:$.Column,items:n}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop")],showNavButton:true,title:W.getText("CALCULATION_BUILDER_VARIABLES_PAGE_TITLE"),navButtonPress:t.bind(this,this.getId()+X.PAGE_MAIN)}))}if(a.length>0){o.addPage(new E({id:this.getId()+X.PAGE_FUNCTIONS,content:[i(),new d({direction:$.Column,items:[e.functionList]}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop")],showNavButton:true,title:W.getText("CALCULATION_BUILDER_FUNCTIONS_PAGE_TITLE"),navButtonPress:t.bind(this,this.getId()+X.PAGE_MAIN)}))}this.getGroups().forEach(function(e){var r=new E({id:this.getId()+e.getKey(),showNavButton:true,title:e._getTitle(),navButtonPress:t.bind(this,this.getId()+X.PAGE_MAIN),content:i()});var n=e.getCustomView();if(n){var a=new N;a.setAssociation("control",n);r.addContent(a)}else{r.addContent(new d({direction:$.Column,items:this._createPopoverVariablesItems(this._mGroups[e.getKey()])}).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiTinyMarginTop"))}o.addPage(r)}.bind(this));e.navContainer=o};Q.prototype._callFunctionFireSelection=function(e){this.getGroups().forEach(function(t){if(t.getCustomView()){t.fireSetSelection({key:e})}})};Q.prototype._clearVariableLists=function(){this._aVariableLists.forEach(function(e){var t=e.getSelectedItem();if(t){e.setSelectedItem(t,false)}});this._callFunctionFireSelection()};Q.prototype._setVariableListSelection=function(e){for(var t=0;t<this._aVariableLists.length;t++){var i=this._aVariableLists[t],r=this._aVariableLists[t].getItems();for(var n=0;n<r.length;n++){if(r[n]._calculationBuilderKey===e){i.setSelectedItem(r[n],true);return}}}this._callFunctionFireSelection(e)};Q.prototype._sanitizeStringLiteral=function(e){if(this.getParent()._isStringLiteral(e)){e=e.substring(1,e.length-1)}return e};Q.prototype._clearSearchField=function(){if(this._oSearchField){this._oSearchField.setValue("");this._oSearchField.fireLiveChange()}};Q.prototype._createPopover=function(e){var t=function(){var t=this._oCurrentItem,i=e.navContainer.getCurrentPage().getId(),r=e.functionList.getSelectedItem(),n,a,s;var o=this.getParent().getAllowStringLiterals()?"":0;e.literalInput.setValue(o);this._clearVariableLists();this._clearSearchField();if(r){e.functionList.setSelectedItem(r,false)}if(!t){n=this.getId()+X.PAGE_MAIN}else{if(t._isFunction()){s=t.getKey();n=this.getId()+X.PAGE_FUNCTIONS;a=e.functionList.getItems();for(var l=0;l<a.length;l++){var u=a[l].data("functionKey");if((u&&u.toLowerCase())===s.toLowerCase()){e.functionList.setSelectedItem(a[l],true);break}}}else if(t._isLiteral()){var p=this._sanitizeStringLiteral(t.getKey());e.literalInput.setValue(p);e.literalInput.setValueState(K.None);n=this.getId()+X.PAGE_MAIN}else if(t._isVariable()){this._setVariableListSelection(t.getKey());var c=t._oVariable||t.getVariable(),d=c&&c.getGroup()||X.PAGE_VARIABLE;n=this.getId()+d}else if(t._isSecondaryOperator()){n=this.getId()+X.PAGE_OPERATORS}else{n=this.getId()+X.PAGE_MAIN}}if(n!==i){if(n!==this.getId()+X.PAGE_MAIN){e.navContainer.backToPage(this.getId()+X.PAGE_MAIN)}e.navContainer.to(e.navContainer.getPage(n),"show")}else{e.navContainer.getCurrentPage().setFooter(this._getPageFooter(i,e))}var _=this._oCurrentItem&&this._oCurrentItem._getItemError(),h=_&&" "+_.title;this._aStrips.forEach(function(e){e.setVisible(!!_);e.setText(h?W.getText("CALCULATION_BUILDER_INCORRECT_SYNTAX")+h:"")})}.bind(this);this._oPopover=new R({showHeader:false,resizable:true,placement:U.PreferredBottomOrFlip,contentWidth:"400px",contentHeight:"450px",content:[e.navContainer],beforeOpen:t,afterClose:function(){this._bDragging=false;this._clearNewButtonPositions()}.bind(this)})};Q.prototype._submitLiteralInput=function(e){var t=e.getValue();if(this.getParent()&&this.getParent().getAllowStringLiterals()&&!jQuery.isNumeric(t)){t='"'+t+'"'}this._updateOrCreateItem({type:G.Literal,key:t});e.setValueState(K.None)};Q.prototype._getPageFooter=function(e,t){var i=false,r=false,n=false;if(this._oCurrentItem&&!this._oCurrentItem._bIsNew){r=true;n=this._oCurrentItem._isLiteral()}i=t.literalInput.getValueState()===K.None&&e===this.getId()+X.PAGE_MAIN&&n;t.footerButtons.okButton=new c({enabled:i,text:W.getText("CALCULATION_BUILDER_CONFIRM_BUTTON"),press:function(e){this._submitLiteralInput(t.literalInput)}.bind(this)});t.footerButtons.deleteButton=new c({enabled:r,text:W.getText("CALCULATION_BUILDER_DELETE_BUTTON"),press:this._deleteItem.bind(this)});t.footerButtons.closeButton=new c({text:W.getText("CALCULATION_BUILDER_CLOSE_BUTTON"),press:this._instantClose.bind(this)});return new b({content:[new u,t.footerButtons.okButton,t.footerButtons.deleteButton,t.footerButtons.closeButton]})};Q.prototype._insertFunctionItems=function(e,t){var i=function(t){e.push(t)};if(t&&t.length>0){t.forEach(function(e){i(e)})}else{i("")}i(")")};Q.prototype._updateOrCreateItem=function(e){var t=!this._oCurrentItem||this._oCurrentItem._bIsNew,i=this._oCurrentItem&&!this._oCurrentItem.getKey(),r=this.getParent(),n=e.functionObject,a=this.getItems();var s=function(){var t=e.type===G.Function?n.template:r._convertToTemplate(n.getItems());this._insertFunctionItems(u,t)}.bind(this);var o=function(){var e=isNaN(this._iCurrentIndex)?this.getItems().length:this._iCurrentIndex,t=this._getKeys();this._smartRender(t.slice(0,e).concat(u,t.slice(e)))}.bind(this);var l=function(){for(var e=0;e<a.length;e++){if(a[e]===this._oCurrentItem){return e+1}}return null}.bind(this);if(t){var u=[e.key];if(n){s()}o()}else{this._oCurrentItem.setKey(e.key);if(e.type){this._oCurrentItem._sType=e.type}if(i&&n){var u=[];this._iCurrentIndex=l();s();o()}}this._instantClose();this._fireChange()};Q.prototype._expandAllVariables=function(){this.getItems().forEach(function(e){if(e.isExpandable()){e._expandVariable(false)}});this._fireChange()};Q.prototype._handleDelete=function(e){if(this._isEmptySelected()){return}this._bAreSelectedItemsDeleting=true;a.show(W.getText("CALCULATION_BUILDER_DELETE_MESSAGE_TEXT"),{icon:a.Icon.WARNING,title:W.getText("CALCULATION_BUILDER_DELETE_MESSAGE_TITLE"),actions:[a.Action.YES,a.Action.CANCEL],onClose:function(e){if(e===a.Action.YES){var t=this.$().find(".sapCalculationBuilderSelected .sapCalculationBuilderItem"),i=t.length,r=t.first(),n=sap.ui.getCore().byId(r.attr("id"));if(n){var s=this._getKeys();s.splice(n._iIndex,i);this._smartRender(s);this._fireChange()}}this._bAreSelectedItemsDeleting=false}.bind(this)})};Q.prototype._handleEnter=function(e){var t=jQuery(e.target),i;if(this._oItemNavigation&&!this._bReadOnly){if(t.hasClass("sapCalculationBuilderNewItem")){i=this._getNewItem();if(i){i._buttonPress(e)}}else if(t.hasClass("sapCalculationBuilderItem")){i=this._getItemById(t[0].id);if(i){i._buttonPress(e)}}else if(t.hasClass("sapCalculationBuilderItemExpandButton")){i=this._getItemById(t.closest(".sapCalculationBuilderItem")[0].id);if(i){i._expandButtonPress(e)}}}};Q.prototype._createVariablesMap=function(){this._mGroups={};this._aVariableLists=[];this.getVariables().forEach(function(e){var t=e.getGroup()||z;if(!this._mGroups[t]){this._mGroups[t]=[]}this._mGroups[t].push(e)}.bind(this))};Q.prototype._handleSpace=function(e){this._selectItem(e.target)};Q.prototype._handleCtrlNext=function(e){this._moveItems(H.KEY_NEXT)};Q.prototype._handleCtrlPrevious=function(e){this._moveItems(H.KEY_PREVIOUS)};Q.prototype._getVariableByKey=function(e){var t=this.getVariables();if(!e){return null}e=e.toLowerCase();for(var i=0;i<t.length;i++){if(t[i].getKey().toLowerCase()===e){return t[i]}}return null};Q.prototype.setTitle=function(e){var t=this._oToolbarTitle;if(t){t.setText(e);t.setVisible(!!e)}this.setProperty("title",e)};Q.prototype._getKeys=function(){return this.getItems().map(function(e){return e.getKey()})};Q.prototype._deleteItem=function(){var e=this._getKeys();e.splice(this._oCurrentItem._iIndex,1);this._smartRender(e);this._instantClose();this._fireChange()};Q.prototype._openDialog=function(e){this._oCurrentItem=e.currentItem;this._iCurrentIndex=e.index;this._oPopover.openBy(e.opener)};Q.prototype._setupDroppable=function(e){var t=this;e=e||this.$().find(".sapCalculationBuilderDroppable");e.droppable({scope:t.getId()+"-scope",tolerance:"pointer",activeClass:"sapCalculationBuilderDroppableActive",hoverClass:"sapCalculationBuilderDroppableActive",drop:function(e,i){if(!i.draggable.hasClass("sapCalculationBuilderSelected")){t._selectItem(i.draggable[0])}t._moveItems(H.MOUSE,parseInt(jQuery(this).attr("index"),10));t._bDragging=false},over:function(e,i){t._bDragging=true}})};Q.prototype._clearNewButtonPositions=function(){var e=this.$();e.find(".sapCalculationBuilderDelimiterNewButton").hide(200);e.find(".sapCalculationBuilderItem").animate({left:0},300)};Q.prototype._setupNewButtonEvents=function(){var e=13,t=300;var i=this.$().find(".sapCalculationBuilderDelimiter[data-events!='bound']"),r=this.$().find(".sapCalculationBuilderDelimiterNewButton[data-events!='bound']"),n=this,a,s;var o=function(e,i){e.prev().animate({left:-i},t);e.next().animate({left:i},t)};r.on("click",function(e){var t=jQuery(this),i=parseInt(t.parent().attr("index"),10);t.css("opacity",1);n._oCurrentItem=null;n._iCurrentIndex=i;n._openDialog({opener:this,index:i})});r.attr("data-events","bound");i.on("mouseover",function(t){var i=jQuery(this);if(!n._bDragging&&!n._oPopover.isOpen()){a=true;s=setTimeout(function(){if(a){a=false;o(i,e);i.find(".sapCalculationBuilderDelimiterNewButton").show(200)}},400)}});i.on("mouseout",function(e){var t=jQuery(this).find(".sapCalculationBuilderDelimiterNewButton"),i=jQuery(this);if(e.target===t[0]&&e.relatedTarget===i[0]){return}a=false;clearTimeout(s);if(n._bDragging||n._oPopover.isOpen()){return}if(!t.is(":hover")){o(i,0);t.hide(200)}});i.attr("data-events","bound")};Q.prototype._setupSelectable=function(){this.$().selectable({cancel:".sapCalculationBuilderCancelSelectable",distance:5,start:function(){this._deselect();this._instantClose()}.bind(this),stop:function(){this._selectItems(this.$().find(".sapCalculationBuilderItem.ui-selected"))}.bind(this)})};Q.prototype._selectItemsTo=function(e){var t=jQuery(e.next(".sapCalculationBuilderDelimiter")[0]),i=t.attr("index")-1,r=this.$(),n,a,s,o,l;if(e.parent().hasClass("sapCalculationBuilderSelected")||this._isEmptySelected()){this._selectItem(e);return}if(i>this._iLastSelectedIndex){n=this._iFirstSelectedIndex;a=i+1}else{n=i;a=this._iLastSelectedIndex+1}this._deselect();o=r.find('.sapCalculationBuilderDelimiter[index="'+n+'"]');l=r.find('.sapCalculationBuilderDelimiter[index="'+a+'"]');s=o.nextUntil(l,".sapCalculationBuilderItem");this._selectItems(s)};Q.prototype._selectItems=function(e){for(var t=0;t<e.length;t++){this._selectItem(e[t])}};Q.prototype._selectItem=function(e){var t=this.$().find(".sapCalculationBuilderSelected"),i=jQuery(e),r=jQuery(i.next(".sapCalculationBuilderDelimiter")[0]),n=t[0].children.length,a=r.attr("index")-1,s=true;if(!this._oItemNavigation||!this._getItemById(i[0].id)||this._bReadOnly){return}if(n===0){this._iFirstSelectedIndex=a;this._iLastSelectedIndex=a}else{if(i.parent().hasClass("sapCalculationBuilderSelected")){if(this._iFirstSelectedIndex===a){this._iFirstSelectedIndex++;this._deselectItem(i,false)}else if(this._iLastSelectedIndex===a){this._iLastSelectedIndex--;this._deselectItem(i,true)}else{this._deselect()}this._setCorrectFocus();return}if(this._iFirstSelectedIndex-a===1){this._iFirstSelectedIndex=a;s=false}else if(a-this._iLastSelectedIndex===1){this._iLastSelectedIndex=a;s=true}else{this._iFirstSelectedIndex=a;this._iLastSelectedIndex=a;this._deselect()}}var o=this.$();if(this._isEmptySelected()){t.detach().insertBefore(i);t.draggable({revert:"invalid",cursor:"move",axis:"x",scope:this.getId()+"-scope",helper:function(e){var i=t.clone();i.removeClass("sapCalculationBuilderSelected");i.addClass("sapCalculationBuilderDraggingSelectedClone");return i},start:function(){t.addClass("sapCalculationBuilderDragging");o.find(".sapCalculationBuilderItemContent").css("cursor","move")},stop:function(){t.removeClass("sapCalculationBuilderDragging");o.find(".sapCalculationBuilderItemContent").css("cursor","pointer")}})}if(s){i.detach().appendTo(t);r.detach().appendTo(t)}else{r.detach().prependTo(t);i.detach().prependTo(t)}if(i.hasClass("sapCalculationBuilderItem")){i.draggable("disable");i.addClass("ui-selected")}this._setCorrectFocus()};Q.prototype._isEmptySelected=function(){var e=this.$().find(".sapCalculationBuilderSelected");if(e){return e.is(":empty")}return true};Q.prototype._deselectItem=function(e,t){var i=this.$().find(".sapCalculationBuilderSelected"),r=jQuery(e.next(".sapCalculationBuilderDelimiter")[0]);if(!e.hasClass("ui-selected")){return}if(t){r.detach().insertAfter(i);e.detach().insertAfter(i)}else{e.detach().insertBefore(i);r.detach().insertBefore(i)}e.draggable("enable");e.removeClass("ui-selected")};Q.prototype._deselect=function(){var e=this.$().find(".sapCalculationBuilderSelected");if(this._isEmptySelected()){return}this.$().find(".sapCalculationBuilderSelected .ui-selected").removeClass("ui-selected");e.children().each(function(){var t=jQuery(this);if(t.hasClass("sapCalculationBuilderItem")){t.draggable("enable")}t.detach().insertBefore(e)})};Q.prototype._setupKeyboard=function(){var e=this.getDomRef(),t=[];this.getItems().forEach(function(e){t.push(e.getFocusDomRef());if(e.isExpandable()){t.push(e.$("expandbutton"))}});t.push(this._getNewItem().getFocusDomRef());if(!this._oItemNavigation){this._oItemNavigation=new n;this.addDelegate(this._oItemNavigation)}this._oItemNavigation.setRootDomRef(e);this._oItemNavigation.setItemDomRefs(t);this._oItemNavigation.setCycling(true);this._oItemNavigation.setPageSize(250)};Q.prototype._setCorrectFocus=function(){jQuery(this._oItemNavigation.getFocusedDomRef()).focus()};Q.prototype._getItemById=function(e){return this.getItems().filter(function(t){return t.getId()===e})[0]};Q.prototype._getNewItem=function(){if(!this._oNewItem){this._oNewItem=new t;this._oNewItem._bIsNew=true;this._oNewItem.setParent(this,null,true)}return this._oNewItem};Q.prototype._instantClose=function(){var e=this._oPopover.getAggregation("_popup");if(e&&e.oPopup&&e.oPopup.close){e.oPopup.close(0);this._setCorrectFocus()}};Q.prototype._attachAriaLabelToButton=function(e,t){e.addEventDelegate({onAfterRendering:function(e){e.srcControl.$("content").attr("aria-label",t)}})};Q.prototype._printErrors=function(){this.getItems().forEach(function(e){var t=e._getItemError(),i=e.$(),r=!!t?"addClass":"removeClass";i[r]("sapCalculationBuilderItemErrorSyntax")});if(this.getParent().getLayoutType()===Y.VisualOnly){this._showErrorIcon()}};Q.prototype._validateSyntax=function(e){var t=function(){var e=this.getItems()[f],t=e.getKey();return!e._isOperator()||t==="("||t==="+"||t==="-"||t.toLowerCase()==="not"}.bind(this);var i=function(){var e=this.getItems(),t=e[I-1];return!t._isOperator()||t.getKey()===")"}.bind(this);var r=function(e){var t=e.getKey().toLowerCase();if(e._isOperator()){return t==="not"||t==="("||t===")"?t:"#op#"}return e._isFunction()?"#fun#":"#col#"};var n=function(e){return{index:T,item:e,items:[],text:e.getKey()+(e._isFunction()?"(":"")}};var a=function(e){var t=1,i=T;T++;for(;T<p.length;T++){var r=p[T],s=r.getKey(),o=n(r);e.items.push(o);switch(s){case")":t--;break;case"(":t++;break;case",":t=1;break}if(r._isFunction()){a(o);e.text+=o.text}else{e.text+=s}if(t===0){return e}}E.push({index:i,title:W.getText("CALCULATION_BUILDER_CLOSING_BRACKET_ERROR_TEXT")});return e};var s=function(e){var t=this.getParent()._getFunctionAllowParametersCount(e.item.getKey()),i=[],r=[];e.items.forEach(function(e){if(e.item._isComma()){i.push(r);r=[]}else{r.push(e)}});if(r.length>0&&r[r.length-1].text===")"){r.pop()}i.push(r);if(i.length!==t){E.push({index:e.index,title:W.getText(i.length<t?"CALCULATION_BUILDER_TOO_LITTLE_PARAMETERS":"CALCULATION_BUILDER_TOO_MANY_PARAMETERS")})}if(i.length>0){i.forEach(function(t){if(t.length>0){jQuery.merge(E,this._validateSyntax({from:t[0].index,to:t[t.length-1].index+1}))}else{E.push({index:e.index,title:W.getText("CALCULATION_BUILDER_EMPTY_PARAMETER")})}}.bind(this))}}.bind(this);var o=0;var l=function(){var e=_.getKey()==="+"||_.getKey()==="-";if(e){o++;if(o>2){E.push({index:T,title:W.getText("CALCULATION_BUILDER_SYNTAX_ERROR_TEXT")})}}else{o=0}};var u={"#op#":["(","#col#","#fun#","not","+","-"],"(":["(","+","-","#col#","#fun#","not"],")":["#op#",")"],"#col#":["#op#",")"],"#fun#":["(","+","-","#col#","#fun#"],not:["#col#","#fun#","not","("]};e=e||{};var p=e.items||this.getItems(),c,d,_,h,g,f=e.from||0,I=e.to||p.length,m=f===0&&I===p.length,C=[],E=[];if(p.length>0){if(!t()){E.push({index:f,title:W.getText("CALCULATION_BUILDER_FIRST_CHAR_ERROR_TEXT")})}if(!i()){E.push({index:I-1,title:W.getText("CALCULATION_BUILDER_LAST_CHAR_ERROR_TEXT")})}}for(var T=f;T<I;T++){_=p[T];if(_._getType()===G.Error){E.push({index:T,title:W.getText("CALCULATION_BUILDER_SYNTAX_ERROR_TEXT")});continue}l();if(!e.skipCustomValidation&&_._isFunction()){var A=_._getCustomFunction(),L=a(n(_));if(A&&!A.getUseDefaultValidation()){var v=new S;this.getParent().fireValidateFunction({definition:L,customFunction:A,result:v});jQuery.merge(E,v.getErrors())}else{s(L)}}if(T<I-1){h=p[T+1];c=r(p[T]);d=r(h);g=h?h.getKey().toLowerCase():"";var y=h._isCustomOperator()||_._isCustomOperator();if(u[c].indexOf(d)===-1&&u[c].indexOf(g)===-1&&!y){var B={index:T+1};if(_._isOperator()&&h._isOperator()){B.title=W.getText("CALCULATION_BUILDER_BEFORE_OPERATOR_ERROR_TEXT",h.getKey())}else if(!_._isOperator()&&!h._isOperator()){B.title=W.getText("CALCULATION_BUILDER_BETWEEN_NOT_OPERATORS_ERROR_TEXT",[_.getKey(),h.getKey()])}else if(_.getKey()===")"&&!h._isOperator()){B.title=W.getText("CALCULATION_BUILDER_AFTER_CLOSING_BRACKET_ERROR_TEXT")}else if(!_._isOperator()&&h.getKey()==="("){B.title=W.getText("CALCULATION_BUILDER_BEFORE_OPENING_BRACKET_ERROR_TEXT")}else{B.title=W.getText("CALCULATION_BUILDER_CHAR_ERROR_TEXT")}E.push(B)}}if(_._isFunction()){continue}if(m&&_.getKey()===","){E.push({index:T,title:W.getText("CALCULATION_BUILDER_WRONG_PARAMETER_MARK")})}if(_._isOperator()&&_.getKey()==="("||_._isFunction()){C.push(T)}if(_._isOperator()&&_.getKey()===")"){if(C.length===0){E.push({index:T,title:W.getText("CALCULATION_BUILDER_OPENING_BRACKET_ERROR_TEXT")})}else{C.pop()}}}for(T=0;T<C.length;T++){E.push({index:C[T],title:W.getText("CALCULATION_BUILDER_CLOSING_BRACKET_ERROR_TEXT")})}return E};Q.prototype._getType=function(e){return this.getParent()&&this.getParent()._getType(e)};Q.prototype._moveItems=function(e,t){var i=[],r=this.$(),n=this.getItems(),a=r.find(".sapCalculationBuilderSelected"),s,o,l,u;if(this._isEmptySelected()){return}u=a.length>1?jQuery(a[0]).children():a.children();if(e===H.KEY_PREVIOUS){o=this._iFirstSelectedIndex-1}else if(e===H.KEY_NEXT){o=this._iLastSelectedIndex+2}else if(e===H.MOUSE){o=t}if(o<0||o===n.length+1){return}s=this.$().find('.sapCalculationBuilderDelimiter[index="'+o+'"]');for(var p=0;p<n.length+1;p++){l=n[p];if(o===p){u.each(function(){var e=jQuery(this),t;if(e.hasClass("sapCalculationBuilderItem")){t=sap.ui.getCore().byId(jQuery(this)[0].id);i.push(t);t._bMovingItem=true;e.draggable("enable")}e.css("left",0+"px");e.detach().insertAfter(s).removeClass("");s=e})}if(l&&!l.$().parent().hasClass("sapCalculationBuilderSelected")&&!l._bMovingItem){i.push(l)}}a.css("left","");r.find(".sapCalculationBuilderDelimiter").each(function(e){jQuery(this).attr("index",e)});this.removeAllAggregation("items",true);i.forEach(function(e,t){e._bMovingItem=false;e._iIndex=t;this.addAggregation("items",e,true)}.bind(this));this._setupKeyboard();this._selectItems(u.filter(function(e,t){return jQuery(t).hasClass("sapCalculationBuilderItem")}));this._fireChange()};Q.prototype._fireAfterValidation=function(){this.getParent().fireAfterValidation()};Q.prototype._setItems=function(e){this.removeAllAggregation("items",true);(e||[]).forEach(function(e){this.addAggregation("items",this._convertFromNewItem(e),true)}.bind(this))};Q.prototype._getKeyFromCreatedItem=function(e){return typeof e==="object"?e.getKey():e};Q.prototype._convertFromNewItem=function(e){return typeof e==="object"?e:new t({key:e})};Q.prototype._showErrorIcon=function(){var e=this.$("erroricon"),t=this.getParent(),i=t._createErrorText(null,true);if(i){e.show();e.attr("title",t._createErrorText(null,true))}else{e.hide()}};Q.prototype._smartRender=function(e){var t,i=this.$(),r=[],n=this.getItems(),a=n.length,s=sap.ui.getCore().createRenderManager();var o=function(e){e=this._convertFromNewItem(e);this.addAggregation("items",e,true);e._iIndex=t;if(i[0]){e._render(s);this._renderDelimiter(s,t+1)}e.bOutput=true;r.push(e)}.bind(this);if(!this.getParent()._isExpressionVisible()){this._setItems(e);return}this._bRendered=false;this._bIsCalculationBuilderRendering=true;this._deselect();for(var t=0;t<e.length;t++){var l=n[t],u=e[t],p=typeof u==="object"&&u.getKey?u.getKey():u,c=u._sType?u._sType:"";if(!l){o(e[t])}else if(l.getKey()!==p||l._sType!==c){l.setKey(p,true);l._sType=c;var d=l.$();l._innerRender(s,d[0]);d.attr("class",l._getClass(null,s,true));d.attr("title",l._getTooltip());l._setEvents()}}if(e.length<a){for(var t=e.length;t<n.length;t++){var d=n[t].$();d.next().remove();d.remove();this.removeAggregation("items",n[t],true)}}if(i[0]&&r.length>0){s.flush(i[0],false,i.children().index(i.find(".sapCalculationBuilderDelimiter").last()[0])+1);r.forEach(function(e){e._afterRendering()});this._setupDroppable(i.find(".sapCalculationBuilderDroppable").filter(function(){return parseInt(jQuery(this).attr("index"),10)>a}))}this._bRendered=true;this._setupKeyboard();this._setupNewButtonEvents();this._bIsCalculationBuilderRendering=false};Q.prototype._fireChange=function(){this.fireEvent("change")};return Q});
//# sourceMappingURL=CalculationBuilderExpression.js.map