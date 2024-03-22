/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(["jquery.sap.global","sap/ui/core/Element","sap/rules/ui/parser/businessLanguage/lib/parsingBackendMediator","sap/rules/ui/parser/ruleBody/lib/ruleServices","sap/rules/ui/parser/resources/common/lib/resourcesConvertor","sap/rules/ui/parser/resources/vocabulary/lib/vocabularyDataProviderInitiator","sap/rules/ui/parser/infrastructure/messageHandling/lib/responseCollector","sap/ui/core/Locale","sap/ui/core/LocaleData","sap/rules/ui/parser/resources/vocabulary/lib/constants","sap/rules/ui/library"],function(jQuery,e,t,r,s,a,i,o,n,u){"use strict";u=u;var l=e.extend("sap.rules.ui.services.ExpressionLanguage",{metadata:{library:"sap.rule.ui",properties:{valueHelpCallback:{type:"any"},bindingContextPath:{type:"string",group:"Misc"}},publicMethods:["setData","validateExpression","getSuggestions","getExpressionMetadata","getValueListAttribute"],events:{dataChange:{}}}});l.prototype._initLocale=function(){var e=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();var t=n.getInstance(e);var r=t.getDatePattern("short");var s=t.getTimePattern("medium");var a=-(new Date).getTimezoneOffset();var i=t.getNumberSymbol("decimal");var o=t.getNumberSymbol("group");this._localeSettings={dateFormat:r,timeFormat:s,timeZoneOffset:a,number:{groupSeparator:o,decimalSeparator:i}}};l.prototype.init=function(){this._hasValueSource="HasValueSource";this._valueListName="valueListName";this._ofModifier=" of the ";this._initLocale();this.attachModelContextChange(this._setDataFromModel.bind(this))};l.prototype._setDataFromModel=function(){if(this.hasModel()&&this.getBindingContextPath()){this.getModel().read(this.getBindingContextPath(),{urlParameters:{$expand:"DataObjects/Associations,DataObjects/Attributes,ValueHelps,Rules"},success:this.setData.bind(this),error:this.makeJavaServiceCall()})}};l.prototype.makeJavaServiceCall=function(){this.isJavaService=true;if(this.hasModel()&&this.getBindingContextPath()){this.getModel().read(this.getBindingContextPath(),{urlParameters:{$expand:"DataObjects/Associations,DataObjects/Attributes,ValueSources"},success:this.setData.bind(this)})}};l.prototype.setBindingContextPath=function(e){this.setProperty("bindingContextPath",e,false);this.fireModelContextChange();return this};l.prototype._initVocaRuntimeService=function(){var e=this._CopyAndRemoveOdataTags(this._data);this._vocabularyName=e.Id||e.id;var t={connection:null,vocaLoadingType:"json",resourceID:this._vocabularyName,resourceContent:e,termModes:this._getTermModes()};var r=a;var s=new r.vocaDataProviderInitiatorLib;this._runtimeService=s.init(t)};l.prototype._initBackendParser=function(){var e=t;this._backendParser=new e.parsingBackendMediatorLib};l.prototype._initParser=function(){this._initVocaRuntimeService();this._initBackendParser()};l.prototype.setData=function(e){if(e.Rules&&!e.Rules.results){e.Rules.results=[];delete e.Rules.__deferred}this._data=e;this._initParser();this.fireDataChange({data:e})};l.prototype._isDataExist=function(){if(!this._data){return false}return true};l.prototype._removeOdataTags=function(e){for(var t in e){if(e[t]&&typeof e[t]==="object"){if(Array.isArray(e[t].results)){e[t]=e[t].results}this._removeOdataTags(e[t])}}};l.prototype._CopyAndRemoveOdataTags=function(e){var t={};if(e){t=JSON.parse(JSON.stringify(e));this._removeOdataTags(t)}return t};l.prototype._addOdataTags=function(e){for(var t in e){if(typeof e[t]==="object"){this._addOdataTags(e[t]);if(Array.isArray(e[t])&&t!=="results"){e[t]={results:e[t]}}}}};l.prototype._CopyAndAddOdataTags=function(e){var t;if(e){t=JSON.parse(JSON.stringify(e));this._addOdataTags(t)}return t};l.prototype._getTermModes=function(){return["byName","byDescription"]};l.prototype._initResponseCollector=function(e){var t=i.ResponseCollector;var r=t.getInstance();r.clear();r.addSubject(e);return t};l.prototype.convertRuleToDisplayValues=function(e){var t={source:"codeText",target:"displayText"};var r=this._buildFlagsObject(t,null,null,true);return this._validateRule(e,r)};l.prototype.convertRuleToCodeValues=function(e){var t={source:"displayText",target:"codeText"};var r=this._buildFlagsObject(t);return this._validateRule(e,r)};l.prototype.validateRule=function(e){return this._validateRule(e)};l.prototype._fnValidateRule=function(e,t){t=t||{};t.isCollection=false;t.tokensOutput=true;var s=this._CopyAndRemoveOdataTags(e);var a=this._initResponseCollector("Rule Validation");var i=a.getInstance();var o="************* RULE: "+JSON.stringify(s)+"\n\n\n\n"+"*************    VOCABULARY: "+JSON.stringify(this._data)+"\n\n\n\n";i.trace(a.severity().debug,o);i.setOpMessage("RuleValidation","failure");var n=r.validateRule(s,this._vocabularyName,this._runtimeService,t);if(n.status=="Success"){i.setOpMessage("RuleValidation","success")}if(n&&n.hasOwnProperty("decisionTableData")){this._addOdataTags(n.decisionTableData)}i.setOutput(n);return i.build()};l.prototype._validateRule=function(e,t){if(!this._isDataExist()){return null}var r=this._fnValidateRule(e,t);var s=r.output.valueHelp&&r.output.valueHelp.info.length>0;var a=this.getValueHelpCallback();var i=a&&typeof a==="function";if(s&&!i&&!r.output.valueHelp.info[0].metadata.hasOwnProperty(this._hasValueSource)){this._raiseError({},"Value help callback function is not set or is not a function")}if(s&&i){var o=r.output.valueHelp.info;a.call(this,o);var n=true;for(var u=0;u<o.length;u++){if(!o[u].model){this._raiseError({},"value help model is not provided");n=false;break}else if(!(o[u].model instanceof sap.ui.model.odata.v2.ODataModel)){this._raiseError({},"value help model is not an oData V2 model");n=false;break}}if(n){var l=this._buildValueHelpMap(o);this._buildDeferredResponse(l,t,r,o);var p=new jQuery.Deferred;r.deferredResult=p.promise();r.valueHelpMapDeferred.done(function(t){p.resolve(this._fnValidateRule(e,t))}.bind(this));r.valueHelpMapDeferred.fail(function(){p.resolve(r)}.bind(this));o.forEach(function(e){if(e.model.isMetadataLoadingFailed()){p.resolve(r);return}})}}return r};l.prototype._validateExpression=function(e,t,r,s,a){this._initResponseCollector("Parsing");var i=this._backendParser.parseExpression(e,sap.rules.ui.BackendParserRequest.Validate,this._runtimeService,null,t,this._vocabularyName,a);var o={};o.status=i.status;if(i.valueHelp){o.valueHelp=i.valueHelp}if(o.status==="Error"){o.errorDetails=i.errorDetails;o.cursorPosition=i.cursorPosition}else{o.actualReturnType=i.actualReturnType}if(i.tokens){o.tokens=i.tokens}return o};l.prototype._raiseError=function(e,t){e.status="Error";e.cursorPosition=-1;var r=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");e.errorDetails=r.getText("valueHelpTechnicalError");window.console.log(t)};l.prototype.validateExpression=function(e,t,r,s){if(!this._isDataExist()){return null}var a=this._buildFlagsObject(null,r,s,true);var i=this._validateExpression(e,t,r,s,a);var o=i.valueHelp&&i.valueHelp.info.length>0;if(o){if(typeof this.getValueHelpCallback()!=="function"&&!i.valueHelp.info[0].metadata.hasOwnProperty(this._hasValueSource)){this._raiseError(i,"value help callback is not set or is not a function")}else if(i.status==="Success"&&!i.valueHelp.info[0].metadata.hasOwnProperty(this._hasValueSource)){var n=i.valueHelp.info;var u=this.getValueHelpCallback();u.call(this,n);var l=true;for(var p=0;p<n.length;p++){if(!n[p].model){this._raiseError(i,"value help model is not provided");l=false;break}else if(!(n[p].model instanceof sap.ui.model.odata.v2.ODataModel)){this._raiseError(i,"value help model is not an oData V2 model");l=false;break}}if(l){var c=this._buildValueHelpMap(n);this._buildDeferredResponse(c,a,i,n);var g=new jQuery.Deferred;i.deferredResult=g.promise();i.valueHelpMapDeferred.done(function(i){var o=this._validateExpression(e,t,r,s,a);g.resolve(o)}.bind(this));i.valueHelpMapDeferred.fail(function(e){this._raiseError(e,"failed to read from value help oData service");g.resolve(e)}.bind(this))}}}return i};l.prototype._buildFlagsObject=function(e,t,r,s){if(!t){t=false}if(r===undefined||r===null){r=true}var a={isCollection:t,tokensOutput:r};if(this._localeSettings){a.locale={localeSettings:this._localeSettings}}if(e){a.locale={localeSettings:this._localeSettings,convert:e};a.termMode={convert:e};a.ASTOutput=true}if(s){a.valueHelp={collectInfo:true}}return a};l.prototype.getSuggestions=function(e,t,r,s,a){if(!this._isDataExist()){return null}this._initResponseCollector("Parsing");var i=this._buildFlagsObject(null,r,s);var o=this._backendParser.parseExpression(e,sap.rules.ui.BackendParserRequest.Suggests,this._runtimeService,null,t,this._vocabularyName,i,a);var n="valueList";for(var u=0;u<o.suggs.length;u++){if(o.suggs[u].tokenType===n){var l=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");o.suggs[u].text=l.getText("valueHelp")}}var p={};p.suggs=o.suggs;if(o.tokens){p.tokens=o.tokens}return p};l.prototype.getValueListAttribute=function(e){var t;if(this._runtimeService){var r=this._runtimeService.getAllVocaObjects().allValueLists;if(r){for(var s=0;s<r.length;s++){if(r[s].name.indexOf(e)>1){t=this._getValueAttrInfo(e);if(t){t.attributeValueList=r[s].name;return t}}}}}};l.prototype._getValueAttrInfo=function(e){var t=this._runtimeService.getAllVocaObjects().allAttr;for(var r=0;r<t.length;r++){if(t[r].hasOwnProperty(this._valueListName)&&t[r].valueListName&&t[r].valueListName.indexOf(e)>1){return{navPath:t[r].name+this._ofModifier+t[r].objectName}}}};l.prototype.getSuggestionsByCategories=function(e,t){e=e?e:"";var r=this.getSuggestions(e,sap.rules.ui.ExpressionType.BooleanEnhanced,false).suggs;r=r?r:[];if(!t){return r}var s=[];for(var a=0;a<t.length;a++){var i=t[a];for(var o=0;o<r.length;o++){if(i.tokenType===undefined||i.tokenType===r[o].tokenType||i.hasOwnProperty("tokenType")===false){if(r[o].hasOwnProperty("info")===false){if(i.hasOwnProperty("tokenCategory")===false&&i.hasOwnProperty("tokenBusinessType")===false||i.tokenCategory===undefined&&i.tokenBusinessType===undefined){s.push(r[o])}}else if((i.tokenCategory===undefined||i.tokenCategory===r[o].info.category||i.hasOwnProperty("tokenCategory")===false)&&(i.tokenBusinessType===undefined||i.tokenBusinessType===r[o].info.type||i.hasOwnProperty("tokenBusinessType")===false)){s.push(r[o])}}}}return s};l.prototype.getExpressionMetadata=function(e){if(!this._isDataExist()){return null}this._initResponseCollector("Parsing");var t=this._backendParser.parseExpression(e,sap.rules.ui.BackendParserRequest.GetMetadata,this._runtimeService,null,null,this._vocabularyName,null);var r={};r.tokens=t.tokens;return r};l.prototype.getResultInfo=function(e){if(!this._isDataExist()){return null}var t=null;t=this._runtimeService.getOutput(this._vocabularyName,e,null);if(t&&t.name){this._getResultRequiredParamIds(t)}return t};l.prototype.getResults=function(){if(!this._isDataExist()){return null}var e=null;var t=[];e=this._runtimeService.getOutputs(this._vocabularyName).outputs;for(var r=0;r<e.length;r++){if(e[r].Type!==u.PROPERTY_DATA_OBJECT_TYPE_ELEMENT){var s=e[r].Label?e[r].Label:e[r].name;t.push({id:e[r].id,name:e[r].name,label:s,description:e[r].description,columns:e[r].requiredParams})}}if(this.isJavaService||this._data.DataObjects){e=this._data.DataObjects.results;for(var a=0;a<e.length;a++){if(e[a].Type!==u.PROPERTY_DATA_OBJECT_TYPE_ELEMENT){var i=e[a].Label?e[a].Label:e[a].Name;t.push({id:e[a].Id,name:e[a].Name,label:i,description:e[a].Description})}}}return t};l.prototype.getResultColumnDescription=function(e,t,r){if(!this._isDataExist()){return r?r:e}var s=null;var a=[];var i=0;s=this._runtimeService.getOutputs(this._vocabularyName).outputs;for(i=0;i<s.length;i++){if(s[i].id===t){a=s[i].requiredParams;break}}for(i=0;i<a.length;i++){if(a[i].name===e){if(a[i].description!==""){return a[i].description}}}return r?r:e};l.prototype._getResultRequiredParamIds=function(e){var t,r,s;var a=JSON.parse(JSON.stringify(this._data));if(a.DataObjects&&a.DataObjects.results){a.DataObjects=a.DataObjects.results;for(t=0;t<a.DataObjects.length;t++){if(a.DataObjects[t].Attributes&&a.DataObjects[t].Attributes.results&&a.DataObjects[t].Name==e.name&&a.DataObjects[t].Usage=="RESULT"&&e.requiredParams){a.DataObjects[t].Attributes=a.DataObjects[t].Attributes.results;for(r=0;r<a.DataObjects[t].Attributes.length;r++){for(s=0;s<e.requiredParams.length;s++){if(e.requiredParams[s].name===a.DataObjects[t].Attributes[r].Name){e.requiredParams[s].paramId=a.DataObjects[t].Attributes[r].Id}}}return}}}return};l.prototype._setConfigurationForBasic=function(){this.suggestAfterMap={initial:["vocabulary,undefined"],"vocabulary,undefined":["reservedword,comparisonOp","reservedword,comparisonBetweenOp","reservedword,comparisonExistOp"],"reservedword,comparisonOp":["constant,dynamic","constant,fixed","reservedword,value"],"reservedword,comparisonBetweenOp":["constant,dynamic","reservedword,value"],"reservedword,comparisonExistOp":["constant,dynamic","constant,fixed","reservedword,value"],"reservedword,UOM":["reservedword,null","reservedword,conjunctionOp"],"reservedword,function":["vocabulary,undefined"],"reservedword,conjunctionOp":["initial"],"reservedword,value":["reservedword,null","reservedword,conjunctionOp"],"reservedword,null":["reservedword,conjunctionOp"],"constant.dynamic":["reservedword,UOM","reservedword,null","reservedword,conjunctionOp"],"constant.fixed":["reservedword,null","reservedword,conjunctionOp"],"unknown,undefined":[]};this.filterByTypeMap={"vocabulary,undefined":[{tokenType:sap.rules.ui.ExpressionTokenType.vocabulary}],"reservedword,comparisonOp":[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.comparisonOp}],"reservedword,comparisonBetweenOp":[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.comparisonBetweenOp}],"reservedword,comparisonExistOp":[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.comparisonExistOp}],"reservedword,UOM":[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.UOM}],"reservedword,function":[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.func}],"reservedword,conjunctionOp":[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.conjunctionOp}],"reservedword,value":[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.value}],"reservedword,null":[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:null}],"constant.dynamic":[{tokenType:sap.rules.ui.ExpressionTokenType.constant,tokenCategory:sap.rules.ui.ExpressionCategory.dynamic}],"constant.fixed":[{tokenType:sap.rules.ui.ExpressionTokenType.constant,tokenCategory:sap.rules.ui.ExpressionCategory.fixed}]}};l.prototype.getSuggestionsForBasic=function(e,t,r){var s=[];var a=this.getSuggestions(e,t,r,true);if(!a||!a.suggs||!a.suggs.length){return s}s=this._filterSuggestionsForBasic(a);return s};l.prototype._filterSuggestionsForBasic=function(e){var t=this._groupTokensByTokenType(e.tokens);var r=null;if(t&&t.length>0){r=t[t.length-1]}var s=this._getCategoryForToken(r);var a=this.suggestAfterMap[s];var i=this._getFilterForTokenTypes(a);var o=this._filterSuggestionsByCategories(e,i);return{suggs:o,afterTokenType:r&&r.tokenType}};l.prototype._getCategoryForToken=function(e){if(!e){return"initial"}var t=e.tokenType;var r=e.info&&e.info.category;return t+","+r};l.prototype._getFilterForTokenTypes=function(e){var t=[];for(var r=0;r<e.length;r++){var s=e[r];var a=this.filterByTypeMap[s];if(a){t.push(a)}}return t};l.prototype._filterSuggestionsByCategories=function(e,t){var r=[];if(!e||!t){return r}for(var s=0;s<t.length;s++){var a=t[s];for(var i=0;i<e.length;i++){if(a.tokenType===undefined||a.tokenType===e[i].tokenType||a.hasOwnProperty("tokenType")===false){if(e[i].hasOwnProperty("info")===false){if(a.hasOwnProperty("tokenCategory")===false&&a.hasOwnProperty("tokenBusinessType")===false||a.tokenCategory===undefined&&a.tokenBusinessType===undefined){r.push(e[i])}}else if((a.tokenCategory===undefined||a.tokenCategory===e[i].info.category||a.hasOwnProperty("tokenCategory")===false)&&(a.tokenBusinessType===undefined||a.tokenBusinessType===e[i].info.type||a.hasOwnProperty("tokenBusinessType")===false)){r.push(e[i])}}}}return r};l.prototype._groupTokensByTokenType=function(e){var t=[];if(!e||!e.length){return t}var r="";for(var s=0;s<e.length;s++){var a=e[s];if(a.tokenType===sap.rules.ui.ExpressionTokenType.whitespace){continue}else if(a.tokenType!==sap.rules.ui.ExpressionTokenType.vocabulary){t.push(a);r=a.tokenType}else{if(r!==sap.rules.ui.ExpressionTokenType.vocabulary){t.push(a)}else{t[t.length-1].token+=" "+a.token;t[t.length-1].end=a.end}r=a.tokenType}}return t};l.prototype._getSubExpressions=function(e,t){if(!e){e=this.validateExpression(t)}var r=[];var s;var a;for(s=e.tokens.length-1;s>=0;s--){if(e.tokens[s].info){var i=e.tokens[s].info;if(i.category===sap.rules.ui.ExpressionCategory.comparisonOp||i.category===sap.rules.ui.ExpressionCategory.comparisonBetweenOp||i.category===sap.rules.ui.ExpressionCategory.comparisonExistOp){a=e.tokens[s];break}}}r.push({exp:""});var o=0;while(o<e.tokens.length&&e.tokens[o]!==a){r[0].exp+=e.tokens[o].token;o++}r[0].exp=r[0].exp.replace(/  +/g," ");if(!r[0].exp){return r}if(r[0].exp.slice(-1)===" "){r[0].exp=r[0].exp.slice("",-1)}o++;if(!a){return r}r.push({exp:a.token.replace(/  +/g," "),type:this._getCompType(this.exp)});if(o<e.tokens.length){r.push({exp:""});for(;o<e.tokens.length;o++){r[2].exp+=e.tokens[o].token}}return r};l.prototype._getBasicSuggestions=function(e,t){if(!t){t=sap.rules.ui.SuggestionsPart.all}var r=this.validateExpression(e);var s=[];var a=this._getSubExpressions(r);var i=a[0]&&a[0].exp?a[0].exp:"";if(t===sap.rules.ui.SuggestionsPart.all){s.push(this._getLeftSuggestions("",i));if(i===""){return s}}var o=a[1]&&a[1].exp?a[1].exp:"";var n=""||a[1]&&a[1].type;if(t===sap.rules.ui.SuggestionsPart.all||t===sap.rules.ui.SuggestionsPart.compPart){s.push(this._getCompSuggestions(i,o,n));if(a.length===1){return s}}if(t===sap.rules.ui.SuggestionsPart.all||t===sap.rules.ui.SuggestionsPart.rightPart){var u=a[2]&&a[2].exp?a[2].exp:"";n=t===sap.rules.ui.SuggestionsPart.all?s[1].type:null;var l=this._getRightSuggestions(i,o,u,n,r);s.push.apply(s,l)}return s};l.prototype._getLeftSuggestions=function(e,t){var r=this._createEmptySuggestion(1)[0];var s=[{tokenType:sap.rules.ui.ExpressionTokenType.vocabulary}];var a=this.getSuggestionsByCategories(e,s);for(var i=0;i<a.length;i++){r.sugg.push(a[i].text)}r.currentValue=t;r.tokenCategory=sap.rules.ui.ExpressionTokenType.vocabulary;return r};l.prototype._getCompSuggestions=function(e,t,r){var s=this._createEmptySuggestion(1)[0];var a=[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.comparisonOp},{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.comparisonBetweenOp}];var i=this.getSuggestionsByCategories(e,a);s.type=r||this._getCompType(t);for(var o=0;o<i.length;o++){s.sugg.push(i[o].text)}s.currentValue=t;return s};l.prototype._getRightSuggestions=function(e,t,r,s,a){var i;var o=e+" "+t;var n=this._getLeftBusinessDataType(e);if(!s){s=this._getCompType(t)}switch(s){case sap.rules.ui.ExpressionCategory.comparisonOp:i=this._getRightForComparisonOp(n,o,r);break;case sap.rules.ui.ExpressionCategory.comparisonBetweenOp:i=this._geRightForBetweenOp(n,o,r);break;case sap.rules.ui.ExpressionCategory.comparisonExistOp:break;default:break}if(!i){return[{}]}return i};l.prototype._getRightForComparisonOp=function(e,t,r){var s=this._createEmptySuggestion(1);var a;s[0].BDT=e;var i;var o;i=[{tokenType:sap.rules.ui.ExpressionTokenType.valueList}];a=this.getSuggestionsByCategories(t+" ",i);s[0].currentValue=jQuery.trim(r);if(a.length){s[0].valueListObject=a[0].info;s[0].isValueList=true}s[0].currentValue=jQuery.trim(r);if(s[0].isValueList){return s}if(e===sap.rules.ui.ExpressionType.TimeSpan){s.push.apply(s,this._createEmptySuggestion(1));i=[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.UOM}];var n=this._splitStringBySeperator(r," ");s[0].currentValue=n[0];s[1].currentValue=n[1];a=this.getSuggestionsByCategories(t+" 5",i);for(o=0;o<a.length;o++){s[1].sugg.push(a[o].text)}}else if(e===sap.rules.ui.ExpressionType.Date){i=[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.value},{tokenType:sap.rules.ui.ExpressionTokenType.constant,tokenCategory:sap.rules.ui.ExpressionCategory.dynamic}];a=this.getSuggestionsByCategories(t+" ",i);for(o=0;o<a.length;o++){s[0].sugg.push(a[o].text)}s[0].currentValue=jQuery.trim(r)}return s};l.prototype._geRightForBetweenOp=function(e,t,r){(function(){var e=this.validateExpression(r).tokens;if(e){for(var t=0;t<e.length;t++){if(e[t].info&&(e[t].info.category===sap.rules.ui.ExpressionCategory.comparisonOp||e[t].info.category===sap.rules.ui.ExpressionCategory.comparisonBetweenOp||e[t].info.category===sap.rules.ui.ExpressionCategory.comparisonExistOp)){r="";return}}}}).bind(this)();var s=this._createEmptySuggestion(1);var a;var i,o,n;s[0].BDT=e;if(e!==sap.rules.ui.ExpressionType.TimeSpan&&e!==sap.rules.ui.ExpressionType.Date){i=this._getRightExpressionsForTimeStamp(r)}else{i=this._splitStringBySeperator(r," ")}if(e===sap.rules.ui.ExpressionType.TimeSpan){s.push.apply(s,this._createEmptySuggestion(4));s[3].BDT=e;o=[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.UOM}];a=this.getSuggestionsByCategories(t+" 5",o);for(n=0;n<a.length;n++){s[1].sugg.push(a[n].text);s[4].sugg.push(a[n].text)}}else if(e===sap.rules.ui.ExpressionType.Date){s.push.apply(s,this._createEmptySuggestion(2));s[2].BDT=e;o=[{tokenType:sap.rules.ui.ExpressionTokenType.reservedWord,tokenCategory:sap.rules.ui.ExpressionCategory.value},{tokenType:sap.rules.ui.ExpressionTokenType.constant,tokenCategory:sap.rules.ui.ExpressionCategory.dynamic}];a=this.getSuggestionsByCategories(t+" ",o);for(n=0;n<a.length;n++){s[0].sugg.push(a[n].text);s[2].sugg.push(a[n].text)}}else{s.push.apply(s,this._createEmptySuggestion(2));s[2].BDT=e;o=[{tokenType:sap.rules.ui.ExpressionTokenType.valueList}];a=this.getSuggestionsByCategories(t+" ",o);s[0].currentValue=jQuery.trim(r);if(a.length){s[0].valueListObject=a[0].info;s[0].isValueList=true;s[2].valueListObject=a[0].info;s[2].isValueList=true}}for(n=0;n<s.length;n++){if(i[n]==="to"||n===2&&e===sap.rules.ui.ExpressionType.TimeSpan||n===1&&e===sap.rules.ui.ExpressionType.Date||n===1&&e!==sap.rules.ui.ExpressionType.Date&&(n===1&&e!=sap.rules.ui.ExpressionType.TimeSpan)){s[n].tokenCategory="reservedword.undefined";s[n].currentValue=i[n]==="to"||i[n]==="and"?i[n]:"to"}else if(e===sap.rules.ui.ExpressionType.Date){s[n].currentValue=jQuery.trim(i[n]||"''")}else if(e===sap.rules.ui.ExpressionType.TimeSpan){s[n].currentValue=jQuery.trim(i[n]||"''")}else{s[n].currentValue=jQuery.trim(i[n])}}return s};l.prototype._geRightForExistOp=function(e,t,r,s){var a=this._createEmptySuggestion(1);a[0].BDT=e;var i;if(e===sap.rules.ui.ExpressionType.TimeSpan){i=s.tokens.filter(function(e){if(e.info){return e.info.category===sap.rules.ui.ExpressionCategory.UOM||e.tokenType===sap.rules.ui.ExpressionTokenType.constant}return null});i.forEach(function(e,t){})}else if(e===sap.rules.ui.ExpressionType.Date){i=s.tokens.filter(function(e){if(e.info){return e.info.category===sap.rules.ui.ExpressionCategory.value}return null});i.forEach(function(e,t){})}return a};l.prototype._getLeftBusinessDataType=function(e){var t=this.validateExpression(e);var r=t.actualReturnType;if(r){return r}return t};l.prototype._splitStringBySeperator=function(e,t){return e.split(t).filter(function e(t){return t!==""})};l.prototype._getCompType=function(e){if(e){return this.getExpressionMetadata(e).tokens[0].info.category}else{return null}};l.prototype._createEmptySuggestion=function(e){var t=[];for(var r=0;r<e;r++){t.push({sugg:[]})}return t};l.prototype._getRightExpressionsForTimeStamp=function(e){if(!String.prototype.includes){String.prototype.includes=function(){return String.prototype.indexOf.apply(this,arguments)!==-1}}var t;if(e.indexOf("to")!==-1){t=this._splitStringBySeperator(e,"to");t.splice(1,0,"to");return t}else if(e.indexOf("and")!==-1){t=this._splitStringBySeperator(e,"and");t.splice(1,0,"and");return t}return[e,"to"]};l.prototype.convertDecisionTableExpressionToDisplayValue=function(e,t,r,s){var a={source:"codeText",target:"displayText"};var i=this._buildFlagsObject(a);var o=this._validateDecisionTableExpression(e,t,r,s,i,"RuleServiceValidation");return o};l.prototype.getDecisionTableCellTokens=function(e,t,s,a){var i=this._buildFlagsObject(null,"",true,false);var o=r.validateDecisionTableExpression(e,t,s,a,this._vocabularyName,this._runtimeService,null,i);return o};l.prototype.convertDecisionTableExpressionToModelValue=function(e,t,r,s,a){var i={source:"displayText",target:"codeText"};var o=this._buildFlagsObject(i,"","",true);var n=this._validateDecisionTableExpression(e,t,r,s,o,"RuleServiceValidation",a);return n};l.prototype._validateDecisionTableExpression=function(e,t,s,a,i,o,n){var u=this._initResponseCollector(o);var l=u.getInstance();l.setOpMessage(o,"failure");var p=r.validateDecisionTableExpression(e,t,s,a,this._vocabularyName,this._runtimeService,n,i);if(p.status=="Success"){l.setOpMessage("RuleServiceValidation","success")}l.setOutput(p);var c=l.build();return c};l.prototype._buildDeferredResponse=function(e,t,r,s){var a=e.length;var i=0;t.valueHelp={collectInfo:false,info:[]};t.valueHelpInfo=s;r.valueHelpMapDeferred=new jQuery.Deferred;for(var o=0;o<a;o++){e[o].done(function(e,s,o){i++;var n={};n.id=s;n.values={};for(var u=0;u<t.valueHelpInfo.length;u++){if(t.valueHelpInfo[u].id==s){for(var l=0;l<t.valueHelpInfo[u].values.length;l++){n.values[t.valueHelpInfo[u].values[l]]=null}for(var p=0;p<e.results.length;p++){n.values[e.results[p][o]]=e.results[p][o]}break}}t.valueHelp.info.push(n);if(i==a){delete t.valueHelpInfo;r.valueHelpMapDeferred.resolve(t)}});e[o].fail(function(){r.valueHelpMapDeferred.reject(r)})}};l.prototype._buildValueHelpMap=function(e){var t=[];function r(e){var t=e.model;var r=e.metadata.propertyPath;var s=new sap.ui.comp.odata.MetadataAnalyser(t);var a=s.getValueListAnnotation(r);if(!a.primaryValueListAnnotation){e.deferred.reject("Failed to read value help annotation");return}var i="/"+a.primaryValueListAnnotation.annotation.CollectionPath.String+"/";var o=a.primaryValueListAnnotation.keyField;var n=a.primaryValueListAnnotation.keys;var u=[];if(n.length>1){for(var l=0;l<n.length;l++){if(n[l]!==o){u.push(new sap.ui.model.Filter(n[l],"EQ",null))}}}for(var p=0;p<e.values.length;p++){u.push(new sap.ui.model.Filter(o,"EQ",e.values[p]))}var c=e.id;t.read(i,{filters:u,success:function(t){e.deferred.resolve(t,c,o)}.bind(this),error:function(t){e.deferred.reject("Failed to read value help values");window.console.log("Failed to read value help values")}})}for(var s=0;s<e.length;s++){this.oValueHelpInfo=e[s];this.oValueHelpInfo.deferred=new jQuery.Deferred;t.push(this.oValueHelpInfo.deferred);if(!this.oValueHelpInfo.model.getMetaModel().oModel){this.oValueHelpInfo.model.attachMetadataLoaded(function(){r(this)}.bind(this.oValueHelpInfo));this.oValueHelpInfo.model.attachMetadataFailed(function(){if(this.deferred){this.deferred.reject("Failed to load value help model metadata")}}.bind(this.oValueHelpInfo))}else{r(this.oValueHelpInfo)}}return t};l.prototype.getExpressionLanguageVersion=function(){return r.getParserExprLangVersion()};return l},true);
//# sourceMappingURL=ExpressionLanguage.js.map