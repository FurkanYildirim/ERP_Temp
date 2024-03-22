sap.ui.define(["sap/ui/thirdparty/jquery","./library","sap/ui/core/Control","./CalculationBuilderItem","sap/m/List","sap/m/StandardListItem","sap/m/Popover","sap/m/Button","sap/m/Menu","sap/m/MenuButton","sap/m/MenuItem","sap/m/OverflowToolbar","sap/m/ToolbarSeparator","sap/m/ToolbarSpacer","sap/m/Title","sap/m/OverflowToolbarToggleButton","sap/ui/core/CustomData","sap/ui/model/Sorter","sap/ui/model/json/JSONModel","sap/ui/Device","sap/ui/dom/containsOrEquals","sap/m/library"],function(jQuery,t,e,i,n,o,r,s,a,u,p,l,h,g,f,c,d,_,C,S,y,T){"use strict";var m=T.ButtonType;var I=T.PlacementType;var v=T.ListMode;var b="&nbsp;&nbsp;";var L="┘┘";var x=t.CalculationBuilderItemType,E=t.CalculationBuilderValidationMode;var w=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");var O=function(t){if(typeof t.which==="undefined"){return true}else if(typeof t.which==="number"&&t.which>0){return!t.ctrlKey&&!t.metaKey&&!t.altKey&&t.which!==8}return false};var P=function(t,e){var i,n="",o=0;if(t instanceof jQuery){t=t[0]}var r=t.nodeType;if(!r){while(i=t[o++]){n+=P(i,e)}}else if(r===1||r===9||r===11){for(t=t.firstChild;t;t=t.nextSibling){n+=P(t,e)}}else if(r===3||r===4){n+=e&&jQuery(t).parent().hasClass("sapCalculationBuilderItemTextEmpty")&&t.nodeValue==="  "?"┘┘":t.nodeValue}return n};var A=e.extend("sap.suite.ui.commons.CalculationBuilderInput",{metadata:{library:"sap.suite.ui.commons",events:{change:{parameters:{value:"String",position:"integer",validate:"boolean"}}}},renderer:{apiVersion:2,render:function(t,e){if(e.getParent().getShowInputToolbar()&&!e._bReadOnly){t.openStart("div");t.class("sapCalculationBuilderInputToolbarWrapper");t.openEnd();t.renderControl(e._oInputToolbar);t.close("div")}t.openStart("div",e);t.class("sapCalculationBuilderInputWrapper");t.attr("aria-label","");t.openEnd();t.openStart("div");t.attr("aria-label","");t.attr("aria-describedby",e.getId()+"-error");t.attr("spellcheck","false");if(!e._bReadOnly){t.attr("contenteditable","true")}t.attr("id",e.getId()+"-input");t.class("sapCalculationBuilderInput");t.openEnd();t.close("div");t.openStart("div");t.attr("id",e.getId()+"-error");t.class("sapCalculationBuilderInputErrorArea");t.openEnd();t.close("div");t.close("div")}}});A.prototype.init=function(){this._setupSuggestionList();this._iCarretPosition=0;this._sSuggestionText="";this._aVariables=[];this._oInputToolbar=new l(this.getId()+"-toolbar").addStyleClass("sapCalculationBuilderInputToolbar");this.addDependent(this._oInputToolbar)};A.prototype.exit=function(){if(this._oPopup){this._oPopup.destroy()}if(this._oInputToolbar){this._oInputToolbar.destroy()}};A.prototype.onAfterRendering=function(){this._setupKeyPress();this._setupEvents();this._setupAriaLabel()};A.prototype.onBeforeRendering=function(){this._aFunctions=this.getParent()._getAllFunctions();this._fillInputToolbar()};A.prototype.getFocusDomRef=function(){return this.getDomRef("input")};A.prototype._setupEvents=function(){var t=this.$("input");t.blur(function(){this._lastRangeSelection=this._getSelectionRange()}.bind(this));t.on("mouseup",function(t){this._iCarretPosition=this._getCaretPosition()}.bind(this))};A.prototype._validate=function(t){var e=this.getParent();if(e&&e.getValidationMode()===E.FocusOut){this.getParent()._validateInput(P(this.$("input")),t?this._iCarretPosition:0)}};A.prototype._setupKeyPress=function(){var t=this,e=this.getParent(),i=e&&e.getAllowSuggestions()&&S.system.desktop,n="paste input";this.$("input").on("focus",function(){var t=jQuery(this);t.data("before",P(t[0]))}).on(n,function(e){var n=jQuery(this),o=n.data("before"),r=e.key,s=P(n[0]);if(t._oPopup.isOpen()&&r==="Enter"){return}if(o!==s){var a=t._iCarretPosition=t._getCaretPosition();t._storeCurrent();t.fireChange({position:Math.max(0,a),value:P(n[0],true)});if(i){t._checkSuggestions(a,s,O(e));if(t._sSuggestionText.length>0){t._filterSuggestionList(t._sSuggestionText);if(t._oSuggestionList.getItems().length===0){t._oPopup.close()}else{t._findCurrentSpan();if(!t._oPopup.isOpen()){var u=sap.ui.getCore().getConfiguration().getRTL(),p=jQuery(t._oCurrentSpan),l=u?-(n.width()-p.position().left-p.width()):p.position().left;var h=parseInt(l,10),g=t.$("input").outerHeight()-(parseInt(jQuery(t._oCurrentSpan).position().top,10)+jQuery(t._oCurrentSpan).height())-10;t._iSuggestionSelectedIndex=-1;t._oPopup.setOffsetX(h);t._oPopup.setOffsetY(-g);t._oPopup.openBy(t.getDomRef("input"))}}}}}})};A.prototype._createItemSpan=function(t,e){var i=function(){if(!t){return"sapCalculationBuilderItemTextEmpty"}if(e){return"sapCalculationBuilderItemTextError"}if(this._isOperator(t)){return"sapCalculationBuilderItemTextOperator"}return"sapCalculationBuilderItemTextDefault"}.bind(this);var n=t?"text":"html";var o=jQuery("<span></span>",{title:e?e.title:"",class:i()})[n](t||b);return o};A.prototype._findCurrentSpan=function(){var t;if(window.getSelection&&window.getSelection().getRangeAt){t=window.getSelection();this._oCurrentSpan=t.anchorNode.parentNode;if(!jQuery(this._oCurrentSpan).is("span")){this._oCurrentSpan=this.$("input").children().first()[0]}}return this._oCurrentSpan};A.prototype._setupSuggestionList=function(){var t=new _({path:"grouptitle",descending:false,group:function(t){return t.getProperty("grouptitle")}});var e=function(t){var e=this._createItemSpan(t);jQuery(this._oCurrentSpan).after(e);return e}.bind(this);var i=function(t){var e=t.innerText,i=this._sSuggestionText.toLowerCase(),n=i.length,o=e.toLowerCase(),r="",s=(" "+o).indexOf(" "+i),a;if(s>-1){r+=e.substring(0,s);a=e.substring(s,s+n);r+='<span class="sapMInputHighlight">'+a+"</span>";r+=e.substring(s+n)}else{r=e}return r}.bind(this);this._oSuggestionList=new n({mode:v.SingleSelectMaster,showNoData:false,enableBusyIndicator:false,rememberSelections:false,items:{path:"/data",factory:function(t,e){var i=e.getProperty(e.oModel.sPath),n=new o({title:i.title,customData:[new d({key:"key",value:i.key})]});n.addStyleClass("sapCalculationBuilderSuggestionItem");return n},sorter:t},selectionChange:function(t){var i=t.getParameter("listItem"),n,o,r,s,a;if(i){s=i.getCustomData()[0].getValue();r=this._getFunction(s);jQuery(this._oCurrentSpan).text(r?s+"(":s+"");jQuery(this._oCurrentSpan).removeClass("sapCalculationBuilderItemTextError").addClass("sapCalculationBuilderItemTextDefault");this._iCarretPosition+=(s||"").length+1;if(r){a=this._getFunctionTemplateItems(r);n=a.length;if(n>0){a.forEach(function(t,i){this._oCurrentSpan=e(t)[0];if(!t&&!o){o=this._oCurrentSpan}if(!o&&t){this._iCarretPosition+=t.length}if(t&&i!==n-1){this._oCurrentSpan=e(" ")}}.bind(this))}else{o=this._oCurrentSpan=e("")[0]}var u=e(")");if(!o){this._oCurrentSpan=u[0]}}this._storeCurrent();var p=o||this._oCurrentSpan,l=p&&p.textContent&&p.textContent.length||0;this.fireChange({position:this._getCaretPosition(p,r?1:l),value:P(this.$("input")[0],true)})}this._oPopup.close()}.bind(this)});this._oSuggestionList.addEventDelegate({onAfterRendering:function(){this._oSuggestionList.$().find(".sapMDLILabel, .sapMSLITitleOnly, .sapMDLIValue").each(function(){this.innerHTML=i(this)});this._oSuggestionList.$().find(".sapMGHLI").addClass("sapCalculationBuilderSuggestionListHeader")}.bind(this)});this._oPopup=new r(this.getId()+"-popup",{contentWidth:"300px",showArrow:false,showHeader:false,placement:I.Vertical,horizontalScrolling:true,content:this._oSuggestionList,initialFocus:this}).attachAfterClose(function(t){this._clearSuggestion()}.bind(this))};A.prototype._checkSuggestions=function(t,e,i){var n=e[Math.max(t-1,0)];var o=function(t){return this._isOperator(t)||this._isEmptySpace(t)}.bind(this);if(!n||o(n)){this._clearSuggestion();return}var r=i?n:"",s=i?2:1;t=Math.max(t,0);for(var a=t-s;a>=0;a--){if(o(e[a])){break}r=e[a]+r}for(a=t;a<e.length;a++){if(o(e[a])){break}r=r+e[a]}if(!r){this._clearSuggestion()}this._sSuggestionText=r||""};A.prototype._clearSuggestion=function(){this._sSuggestionText="";this._oCurrentSpan={};this._oPopup.close()};A.prototype._filterSuggestionList=function(t){var e=[];var i=function(i,n,o,r){var s=(n||i).toLowerCase(),a=t.toLowerCase();if((" "+s).indexOf(" "+a)!==-1){e.push({title:n||i,key:i,type:o,grouptitle:r})}};var n=this.getParent();n.getOperators().forEach(function(t){i(t.getKey(),t.getText(),x.CustomOperator,w.getText("CALCULATION_BUILDER_OPERATORS_TITLE"))});this._aVariables.forEach(function(t){var e=t.getGroup(),o,r=w.getText("CALCULATION_BUILDER_VARIABLES_TITLE");if(e){o=n.getGroups().filter(function(t){return t.getKey()===e})[0];r=o?o.getTitle():r}i(t.getKey(),t.getLabel(),x.Variable,r)});this._aFunctions.forEach(function(t){i(t.key,t.title,x.Function,w.getText("CALCULATION_BUILDER_FUNCTIONS_TITLE"))});e.sort(function(t,e){return t.title.toUpperCase()<e.title.toUpperCase()?-1:1});this._oSuggestionList.setModel(new C({data:e}))};A.prototype._getCaretPosition=function(t,e){var i,n,o,r=0;var s=function(e){return t&&e===t||!t&&(e===n.anchorNode||e===n.anchorNode.parentNode)};var a=function(t){var e;if(s(t)){return false}if(t.nodeType===3){r+=t.textContent.length}else{for(var i=0;i<t.childNodes.length;i++){e=t.childNodes[i];if(s(e)){return false}r+=e.textContent.length}}return true};try{if(window.getSelection&&window.getSelection().getRangeAt){i=window.getSelection().getRangeAt(0);n=window.getSelection();o=this.$("input")[0].childNodes;for(var u=0;u<o.length;u++){if(!a(o[u])){break}}return(e||i.startOffset)+r}}catch(t){return this._iCarretPosition}return 0};A.prototype._getSelectionRange=function(){var t,e=0,i=this.$("input")[0];if(typeof window.getSelection!=="undefined"){try{var n=window.getSelection().getRangeAt(0),o=n.cloneRange();if(!y(i,n.startContainer)){return this._lastRangeSelection}o.selectNodeContents(i);o.setEnd(n.startContainer,n.startOffset);t=o.toString().length;e=t+n.toString().length}catch(i){e=t=this._iCarretPosition||0}}return{start:t,length:e-t}};A.prototype._setCaretPosition=function(t){var e=window.getSelection(),i=this.$("input"),n,o,r,s,a;var u=function(t){var e=i.children(),n,o,r=0;for(var s=0;s<e.length;s++){n=e[s];o=n.innerText||"";if(r+o.length>t){return{spanIndex:s,position:r+o.length-t}}r+=o.length}return{spanIndex:Math.max(s-1,0),position:100}};if(typeof t==="number"){t=u(t)}r=t&&t.span;if(t){n=i[0];if(!r){r=n&&n.children&&n.children.length>t.spanIndex?n.childNodes[t.spanIndex]:null}if(r){o=document.createRange();s=r.firstChild?r.firstChild:r;a=Math.min(s.length,t.position);o.setStart(s,a);o.collapse(true);e.removeAllRanges();e.addRange(o)}}};A.prototype._recreateText=function(t){var e=function(e){var i;if(e){if(!this._isEmptySpace(e)){i=jQuery.grep(t.errors,function(t){return t.index===s})[0]}if(e==="┘"){e=""}o+=this._createItemSpan(e,i)[0].outerHTML;if(!this._isEmptySpace(e)){s++}p++}}.bind(this);var i=function(){for(;f<r.length;f++){n();if(!this._isEmptySpace(r[f])&&r[f]!=="("){f--;break}h+=r[f];if(r[f]==="("){break}}e(h);h=""}.bind(this);var n=function(e){if(!l&&t.position===f){l={spanIndex:p-(e||0),position:e||h.length}}};var o="",r,s=0,a=this.getParent().getAllowStringLiterals(),u=false,p=0,l=null,h="",g;r=t.text||P(this.$("input")[0],true);for(var f=0;f<r.length;f++){g=r[f];n();if(g==='"'&&a){u=!u}if(u){h+=g;continue}if(g==="┘"||this._isEmptySpace(g)||this._isOperator(g)){if(this._isFunction(h)){i()}else{e(h);e(g);h=""}if(g==="┘"){f++;n(1)}}else{h+=g}}e(h);var c=this.$("input");c.html(o);if(c.is(":focus")){this._showErrorText(true,t.errors)}if(t.position>0){this._setCaretPosition(l||{spanIndex:p-1,position:Number.MAX_SAFE_INTEGER})}};A.prototype._setupAriaLabel=function(){var t,e,i;t=this.getParent();e=t._oExpressionBuilder._aErrors;i=w.getText("CALCULATION_BUILDER_EXPRESSION_TITLE")+": "+t.getExpression();if(e.length>0){i+=". "+w.getText("CALCULATION_BUILDER_ERROR_TITLE")+": ";e.forEach(function(t){i+=t.title+" "})}this.$().attr("aria-label",i)};A.prototype._showErrorText=function(t,e){var i=this.$("error"),n=this.getParent();e=e||n.getErrors();if(e&&e.length>0&&t){i.show();i.text(n._createErrorText())}else{i.hide()}};A.prototype._stringToItems=function(t){var e=[],n="",o="",r=0,s=false;var a=function(){var n,s="";if(o){n=this._getFunction(o);if(n){if(t[r]!=="("){s=x.Error;for(;r<t.length;r++){if(t[r]==="("){s="";break}if(!this._isEmptySpace(t[r])){r--;break}}}}var a=new i({key:o});a._sType=s;e.push(a)}o="";return!!n||!!s}.bind(this);if(typeof t==="undefined"){var u=this.$("input")[0];t=u?P(this.$("input")[0],true):""}for(;r<t.length;r++){n=t[r];if(n==='"'&&this.getParent().getAllowStringLiterals()){o+='"';if(s){e.push(new i({key:o}));o=""}s=!s;continue}if(s){o+=n;continue}if(n==="┘"){e.push(new i);r++;continue}if(this._isEmptySpace(n)){if(o){a()}continue}var p=t[r+1];if(p&&this._isOperator(n+p,false)){n+=p;r++}var l=this._isOperator(n,false);if(l){if(a()){continue}e.push(new i({key:n}))}else{o+=n}}a();return e};A.prototype._itemsToString=function(t){var e=t.items,i="",n="",o=t.createInputText!==false,r,s;for(var a=0;a<e.length;a++){var u=e[a],p=u.getKey(),l=this._isFunction(p);if(o){r=jQuery.grep(t.errors,function(t){return t.index===a})[0]}var h=p!==","&&p!==")"&&s!=="("&&s;if(o){h?n+=this._createItemSpan(" ",r)[0].outerHTML:"";n+=this._createItemSpan(p+(l?"(":""),r)[0].outerHTML}i+=(h?" ":"")+p+(l?"(":"");s=l?"(":p}if(o){this.$("input").html(n)}return i};A.prototype.onfocusin=function(t){if(this._bSetCaretOnFocus){this._setCaretPosition(this._iCarretPosition)}this._bSetCaretOnFocus=false;this._showErrorText(true)};A.prototype.onsapfocusleave=function(t){if(t.relatedControlId&&y(this._oPopup.getDomRef(),sap.ui.getCore().byId(t.relatedControlId).getFocusDomRef())){if(sap.ui.getCore().isMobile()||S.browser.safari){this._bSetCaretOnFocus=true}this.focus()}else{this._showErrorText(false);this._validate(false)}};A.prototype.onsappageup=function(t){this._suggestionListKeyHandling({event:t,add:true,toEnd:true});if(!this._oPopup.isOpen()){this._iCarretPosition=P(this.$("input")).length-1}};A.prototype.onsapnext=function(t){if(this._iCarretPosition<P(this.$("input")).length-1){this._iCarretPosition++}};A.prototype.onsapprev=function(t){if(this._iCarretPosition>0){this._iCarretPosition--}};A.prototype.onsappagedown=function(t){this._suggestionListKeyHandling({event:t,add:false,toEnd:true});if(!this._oPopup.isOpen()){this._iCarretPosition=0}};A.prototype.onsapdown=function(t){this._suggestionListKeyHandling({event:t,add:true})};A.prototype.onsapescape=function(t){if(this._oPopup.isOpen()){this._oPopup.close()}};A.prototype.onsapup=function(t){this._suggestionListKeyHandling({event:t,add:false})};A.prototype.onsapenter=function(t){if(this._oPopup.isOpen()){this._oSuggestionList.fireSelectionChange({listItem:this._oSuggestionList.getSelectedItem()})}else{this._validate(true)}t.preventDefault();t.stopPropagation()};A.prototype._suggestionListKeyHandling=function(t){var e=t.event,i=t.add,n=t.toEnd,o,r;if(!this._oPopup.isOpen()||!e){return}i?this._iSuggestionSelectedIndex++:this._iSuggestionSelectedIndex--;o=this._oSuggestionList.$().find(".sapCalculationBuilderSuggestionItem");r=o.length;if(this._iSuggestionSelectedIndex<0||!i&&n){this._iSuggestionSelectedIndex=r-1}else if(this._iSuggestionSelectedIndex>=r||i&&n){this._iSuggestionSelectedIndex=0}this._oSuggestionList.removeSelections(true);sap.ui.getCore().byId(o[this._iSuggestionSelectedIndex].id).setSelected(true).focus();e.preventDefault();e.stopPropagation()};A.prototype._displayError=function(t){this.$("input")[t?"addClass":"removeClass"]("sapCalculationBuilderInputError")};A.prototype._insertItemFromToolbar=function(t){var e=this.$("input"),i,n,o;var r=" "+t+" ",s=this._getFunction(t),a=r.length,u;var p=function(){return{start:e.text().length,length:0}};o=this._getSelectionRange()||p();e.focus();this._lastRangeSelection={};i=P(e[0],true);if(i[o.start]==="┘"&&i[o.start-1]==="┘"&&o.length===0){o.start--;o.length+=2}if(s){r=" "+t+"(";u=this._getFunctionTemplateItems(s);if(u.length>0){u.forEach(function(t){r+=t?t:L})}else{r+=L}r+=") ";a=r.indexOf(L)+1}n=[i.slice(0,o.start),r,i.slice(o.start+o.length)].join("");this.fireChange({value:n,position:o.start+a});this._storeCurrent()};A.prototype._convertEmptyHashes=function(t){return t?t.replace(new RegExp(L,"g"),"  "):""};A.prototype._fillInputToolbar=function(){var e=function(t,e){return new s({type:m.Transparent,text:t,press:this._insertItemFromToolbar.bind(this,t)}).addStyleClass("sapCalculationBuilderInputToolbarButtons "+e)}.bind(this);var i=function(t){if(t){return t.map(function(t){return new p({key:t.getKey(),text:t._getLabel()})}).sort(function(t,e){return t.getText().localeCompare(e.getText())})}return[]};var n=function(t){return t.map(function(t){return new p({key:t.getKey(),text:t.getText()?t.getText():t.getKey()})}).sort(function(t,e){return t.getText().localeCompare(e.getText())})};var o=function(t){return t.map(function(t){return new p({key:t,text:t})})};var r=function(){var t=this.getParent(),e=t.getAllowComparisonOperators(),i=t.getAllowLogicalOperators(),r=t.getOperators(),s=r.length>0,a,u,l,h=[];if(e){a=o(Object.keys(d));h.push(new p({text:w.getText("CALCULATION_BUILDER_COMPARISON_TITLE"),items:a}))}if(i){u=o(Object.keys(_));h.push(new p({text:w.getText("CALCULATION_BUILDER_LOGICAL_TITLE"),items:o(Object.keys(_))}))}if(s){l=n(r);h.push(new p({text:w.getText("CALCULATION_BUILDER_ADDITIONAL_OPERATOR"),items:l}))}if(h.length>1){return h}if(e){return a}if(i){return u}if(s){return l}return[]}.bind(this);var l=function(t){return new u({text:t,menu:new a({itemSelected:function(t){this._insertItemFromToolbar(t.getParameters().item.getKey())}.bind(this)})}).addStyleClass("sapCalculationBuilderInputToolbarFunctionMenu").addStyleClass("sapCalculationBuilderInputToolbarMenuButtons")}.bind(this);var c=t.CalculationBuilderOperatorType,d=t.CalculationBuilderComparisonOperatorType,_=t.CalculationBuilderLogicalOperatorType,C=r(),S=this.getParent(),y=!!S.getTitle()&&S.getLayoutType()===t.CalculationBuilderLayoutType.TextualOnly,T;this._oInputToolbar.removeAllContent();this._oInputToolbar.addContent(new f({text:S.getTitle(),visible:y}));this._oInputToolbar.addContent(new g);Object.keys(c).forEach(function(t){this._oInputToolbar.addContent(e(c[t],""))}.bind(this));this._oInputToolbar.addContent((new h).addStyleClass("sapUiSmallMarginBeginEnd"));if(C.length>0){this._oInputToolbar.addContent(new u({text:w.getText("CALCULATION_BUILDER_OPERATORS_TITLE"),menu:new a({itemSelected:function(t){this._insertItemFromToolbar(t.getParameters().item.getKey())}.bind(this),items:C})}).addStyleClass("sapCalculationBuilderInputToolbarMenuButtons"))}T=this._aFunctions.map(function(t){return new p({key:t.key,text:t.title})});var I=l(w.getText("CALCULATION_BUILDER_FUNCTIONS_AND_VARIABLES_TITLE"));if(T.length>0){I.getMenu().addItem(new p({text:w.getText("CALCULATION_BUILDER_FUNCTIONS_TITLE"),items:[T]}))}var v=S._getGroupMap(),b=S.getGroups(),L=v["##DEFAULT##"];if(L&&L.length>0){I.getMenu().addItem(new p({text:w.getText("CALCULATION_BUILDER_VARIABLES_TITLE"),items:i(L)}))}b.forEach(function(t){var e=v[t.getKey()];if(e&&e.length>0){I.getMenu().addItem(new p({text:t._getTitle(),items:i(e)}))}});this._oInputToolbar.addContent(I)};A.prototype._isOperator=function(t,e){return this.getParent()&&this.getParent()._isOperator(t,e)};A.prototype._getFunctionTemplateItems=function(t){return this.getParent()._getFunctionTemplateItems(t)};A.prototype._isEmptySpace=function(t){return t===String.fromCharCode(160)||t===" "};A.prototype._isEmptyItem=function(t){return t===b};A.prototype._getText=function(){return this.$("input").text()};A.prototype._isFunction=function(t){return!!this._getFunction(t)};A.prototype._getFunction=function(t){var e=this.getParent();return e&&e._isTokenAllowed(t)&&e._getFunctionDefinition(t)};A.prototype._storeCurrent=function(t){var e=this.$("input");e.data("before",e.text())};return A});
//# sourceMappingURL=CalculationBuilderInput.js.map