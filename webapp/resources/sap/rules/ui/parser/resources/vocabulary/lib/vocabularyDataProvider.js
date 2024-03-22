sap.ui.define(["sap/rules/ui/parser/resources/rule/lib/constantsBase","sap/rules/ui/parser/resources/vocabulary/lib/constants","sap/rules/ui/parser/resources/vocabulary/lib/runtimeServicesUtils","sap/rules/ui/parser/resources/vocabulary/lib/vocaObjects","sap/rules/ui/parser/resources/vocabulary/lib/vocaConversionUtils","sap/rules/ui/parser/businessLanguage/lib/constants"],function(t,l,a,e,s){"use strict";a=new a.runtimeServicesUtilsLib;function i(t){this.globalObjects=null;this.globalRuleAttributes=null;this.globalStaticRuleTemplateAttributes=null;this.globalDynamicRuleTemplateAttributes=null;this.globalStaticVocabularyAttributes=null;this.allVocaObjects={allAssocAttr:null,allAssoc:null,allObjects:null,allActions:null,allOutputs:null,allAliases:null,allTerms:null,allTermsModifiers:null,allValueLists:null,allAttr:null,allActionsStaticParams:null,allOutputsStaticParams:null,allActionsRequiredParams:null,allOutputsRequiredParams:null,allAdvancedFunctions:null,allVocabularies:null,allParameterInfos:null};this.rtContext=t}i.prototype.getTermModes=function(){var t=this.rtContext.termModes;if(!t){t=["byName"]}return t};i.prototype.refresh=function(){this.clearAll()};i.prototype.partialRefresh=function(t){if(t.hasOwnProperty(l.PARTIAL_REFRESH.ALIASES)){this.allVocaObjects.allAliases=null;var a;for(a in this.allVocaObjects.allVocabularies){if(this.allVocaObjects.allVocabularies.hasOwnProperty(a)){this.allVocaObjects.allVocabularies[a].aliases=null}}}else{this.clearAll()}};i.prototype.getAllVocaObjects=function(){return this.allVocaObjects};i.prototype.getParameters=function(){var t=null;if(this.allVocaObjects){t=this.allVocaObjects.allParameterInfos}return t};i.prototype.readValueListValues=function(t){if(t[l.VALUE_LIST_VALUES]){return t[l.VALUE_LIST_VALUES]}return this.rtContext.readValueListValues(t)};i.prototype.getValueListType=function(t,a){var e=null;var s=this.loadVoca(t,false,false,false,false,true,false,false);if(s){if(s.valueLists.hasOwnProperty(a)){e=s.valueLists[a];if(e.hasOwnProperty(l.PROPERTY_VALUE_LIST_METADATA)){return l.EXTERNAL_VALUE_LIST}}}return l.INTERNAL_VALUE_LIST};i.prototype.getValueListDescriptions=function(t,a,e){var s=[];var i;if(arguments.length>2&&e){i=e}else{i=null}var r;var o=this.loadVoca(t,false,false,false,false,true,false,false);if(o){if(o.valueLists.hasOwnProperty(a)){if(this.getValueListType(t,a)===l.INTERNAL_VALUE_LIST){o.valueLists[a].values=this.readValueListValues(o.valueLists[a]);var u=null;for(u in o.valueLists[a].values){if(o.valueLists[a].values.hasOwnProperty(u)){if(i===null||u.toLowerCase().indexOf(i.toLowerCase())===0){r=u.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t").replace(/\f/g,"\\f");s.push(r)}}}}}}return s};i.prototype.GetValueFromValueListDescription=function(t,a,e){var s=null;var i=this.loadVoca(t,false,false,false,false,true,false,false);if(i){if(i.valueLists.hasOwnProperty(a)){if(this.getValueListType(t,a)===l.INTERNAL_VALUE_LIST){i.valueLists[a].values=this.readValueListValues(i.valueLists[a]);if(i.valueLists[a].values.hasOwnProperty(e)){s=i.valueLists[a].values[e]}}}}return s};i.prototype.GetDescriptionFromValueListValue=function(t,a,e){var s,i;var r=this.loadVoca(t,false,false,false,false,true,false,false);if(r){if(r.valueLists.hasOwnProperty(a)){if(this.getValueListType(t,a)===l.INTERNAL_VALUE_LIST){s=this.readValueListValues(r.valueLists[a]);for(i in s){if(s.hasOwnProperty(i)&&("'"+s[i]+"'"===e||s[i]===e)){return i}}}}}return null};i.prototype.IsValueListDescriptionExist=function(t,a){var e=false;var s=this.loadVoca(t,false,false,false,false,true,false,false);if(s){if(s.valueLists.hasOwnProperty(a)){if(this.getValueListType(t,a)===l.INTERNAL_VALUE_LIST){if(s.valueLists[a].descriptionColumn){e=true}}}}return e};i.prototype.getValueList=function(t,l){var a=null;var e=this.loadVoca(t,false,false,false,false,true,false,false);if(e){if(e.valueLists.hasOwnProperty(l)){a=e.valueLists[l]}}return a};i.prototype.getObjects=function(t,l){var a=[];var e;if(arguments.length>1&&l){e=l}else{e=null}var s=this.loadVoca(t,true,false,false,false,false,false,false);if(s){var i=null;for(i in s.objects){if(s.objects.hasOwnProperty(i)&&(e===null||i.indexOf(e)===0)){a.push(this.getObject(t,i))}}}return{objects:a}};i.prototype.getAllActionNames=function(t,a){var e;var s={};this.loadAllActions(this.allVocaObjects);for(e=0;e<this.allVocaObjects.allActions.length;e++){if(this.allVocaObjects.allActions[e].isPrivate===true){continue}if(this.allVocaObjects.allActions[e].vocaName===a){continue}if(t===l.GLOBAL||(t===this.allVocaObjects.allActions[e].scope||this.allVocaObjects.allActions[e].scope===l.GLOBAL)){s[this.allVocaObjects.allActions[e].name]=this.allVocaObjects.allActions[e].vocaName}}return s};i.prototype.getAllOutputNames=function(t,a){var e;var s={};this.loadAllOutputs(this.allVocaObjects);for(e=0;e<this.allVocaObjects.allOutputs.length;e++){if(this.allVocaObjects.allOutputs[e].isPrivate===true){continue}if(this.allVocaObjects.allOutputs[e].vocaName===a){continue}if(t===l.GLOBAL||(t===this.allVocaObjects.allOutputs[e].scope||this.allVocaObjects.allOutputs[e].scope===l.GLOBAL)){s[this.allVocaObjects.allOutputs[e].name]=this.allVocaObjects.allOutputs[e].vocaName}}return s};i.prototype.getAllPersistedAliasNames=function(t,a,e){var s;var i={};this.loadAllAliases(this.allVocaObjects);for(s=0;s<this.allVocaObjects.allAliases.length;s++){if(this.allVocaObjects.allAliases[s].isPrivate===true&&(!e||this.allVocaObjects.allAliases[s].vocaName!==e)){continue}if(a&&this.allVocaObjects.allAliases[s].vocaName===a){continue}if(t===l.GLOBAL||(t===this.allVocaObjects.allAliases[s].scope||this.allVocaObjects.allAliases[s].scope===l.GLOBAL)){i[this.allVocaObjects.allAliases[s].name]=this.allVocaObjects.allAliases[s]}}return i};i.prototype.getAllPersistedValueListsNames=function(t,a,e){var s={};var i=null;var r;this.loadAllValueLists();for(r=0;r<this.allVocaObjects.allValueLists.length;r++){i=this.allVocaObjects.allValueLists[r];if(i.isPrivate===true&&(!e||i.vocaName!==e)){continue}if(a&&i.vocaName===a){continue}if(t===l.GLOBAL||(t===i.scope||i.scope===l.GLOBAL)){s[this.allVocaObjects.allValueLists[r].name]=i}}return s};i.prototype.isVocabularyExist=function(t,a){var e=l.ALL;if(a){e=a}var s=this.getVocabulariesNames(e,true);var i;for(i=0;i<s.length;i++){if(s[i].name===t){return true}}return false};i.prototype.isTermsExist=function(t){var l=this.loadVoca(t,false,false,false,false,false,true,false);if(!l){return null}var a="";for(a in l.terms){if(l.terms.hasOwnProperty(a)){return true}}return false};i.prototype.getAllObjectModelNames=function(t,a,e){var s;var i={};this.loadAllObjects(this.allVocaObjects);for(s=0;s<this.allVocaObjects.allObjects.length;s++){if(this.allVocaObjects.allObjects[s].isPrivate===true&&(!e||this.allVocaObjects.allObjects[s].vocaName!==e)){continue}if(a&&this.allVocaObjects.allObjects[s].vocaName===a){continue}if(t===l.GLOBAL||(t===this.allVocaObjects.allObjects[s].scope||this.allVocaObjects.allObjects[s].scope===l.GLOBAL)){i[this.allVocaObjects.allObjects[s].name]=this.allVocaObjects.allObjects[s].vocaName}}this.loadAllGlobalObjects();var r=null;for(r in this.globalObjects){if(this.globalObjects.hasOwnProperty(r)){i[r]=this.globalObjects[r].vocaName}}return i};i.prototype.getAllAttributesNames=function(t,a,e){var s;var i={};var r=null;this.loadRuleAttributes();for(r in this.globalRuleAttributes){if(this.globalRuleAttributes.hasOwnProperty(r)){i[r]=this.globalRuleAttributes[r]}}this.addStaticRuleTemplateAttributes();this.addDynamicRuleTemplateAttributes();this.addStaticVocabularyAttributes();for(r in this.globalStaticRuleTemplateAttributes){if(this.globalStaticRuleTemplateAttributes.hasOwnProperty(r)){i[r]=this.globalStaticRuleTemplateAttributes[r]}}for(r in this.globalDynamicRuleTemplateAttributes){if(this.globalDynamicRuleTemplateAttributes.hasOwnProperty(r)){i[r]=this.globalDynamicRuleTemplateAttributes[r]}}for(r in this.globalStaticVocabularyAttributes){if(this.globalStaticVocabularyAttributes.hasOwnProperty(r)){i[r]=this.globalStaticVocabularyAttributes[r]}}this.loadAllAttributes(this.allVocaObjects);for(s=0;s<this.allVocaObjects.allAttr.length;s++){if(this.allVocaObjects.allAttr[s].isPrivate===true&&(!e||this.allVocaObjects.allAttr[s].vocaName!==e)){continue}if(a&&this.allVocaObjects.allAttr[s].vocaName===a){continue}if(t===l.GLOBAL||(this.allVocaObjects.allAttr[s].scope===t||this.allVocaObjects.allAttr[s].scope===l.GLOBAL)){i[this.allVocaObjects.allAttr[s].name]=this.allVocaObjects.allAttr[s]}}return i};i.prototype.isAttributeExists=function(t,l){var a=this.getVocabularyScope(t);var e=this.getAllAttributesNames(a);if(e.hasOwnProperty(l)){return true}return false};i.prototype.getVocabulary=function(t,l,a){var e=this.loadVoca(t,true,true,true,true,true,false,true,l);if(!e){return null}var i=null;var r=s.getVocaConversionUtils().isValueListConversionDefined(a);if(r){i=JSON.parse(JSON.stringify(e))}else{i=e}var o=null;for(o in i.objects){if(i.objects.hasOwnProperty(o)){i.objects[o]=this.getObject(t,o)}}var u=null;for(u in i.actions){if(i.actions.hasOwnProperty(u)){i.actions[u]=this.getAction(t,u,a)}}var n=null;for(n in i.outputs){if(i.outputs.hasOwnProperty(n)){i.outputs[n]=this.getOutput(t,n,a)}}if(r){var c=null;for(c in i.aliases){if(i.aliases.hasOwnProperty(c)){i.aliases[c]=this.getAlias(t,c,a)}}}return i};i.prototype.getVocabularyScope=function(t){this.loadAllVocabularies();if(this.allVocaObjects.allVocabularies.hasOwnProperty(t)){return this.allVocaObjects.allVocabularies[t].scope}return null};i.prototype.getVocabulariesInScope=function(t){var l=this.getVocabularyScope(t);return this.getVocabulariesNames(l,true)};i.prototype.getIsIncludeGlobal=function(t){if(t===null||t===undefined){return true}if(t==="false"){return false}return true};i.prototype.getVocabulariesNames=function(t,a){var e=l.ALL;var s=this.getIsIncludeGlobal(a);if(t){e=t}this.loadAllVocabularies();var i=[];var r=null;for(r in this.allVocaObjects.allVocabularies){if(this.allVocaObjects.allVocabularies.hasOwnProperty(r)){if(s===false&&this.allVocaObjects.allVocabularies[r].scope===l.GLOBAL){continue}if(e===l.ALL){i.push({name:r})}else if(t===l.PUBLIC&&this.allVocaObjects.allVocabularies[r].isPrivate===false){i.push({name:r})}else if(t===l.PRIVATE&&this.allVocaObjects.allVocabularies[r].isPrivate===true){i.push({name:r})}else if(t===this.allVocaObjects.allVocabularies[r].scope||this.allVocaObjects.allVocabularies[r].scope===l.GLOBAL){i.push({name:r})}}}return i};i.prototype.getDefaultWritableForAppByVocabulary=function(t){var l=this.getVocabularyScope(t);return this.getDefaultWritableForAppByScope(l)};i.prototype.getDefaultWritableForAppByScope=function(t){this.loadAllVocabularies();var l=null;var a={vocabularies:[]};for(l in this.allVocaObjects.allVocabularies){if(this.allVocaObjects.allVocabularies.hasOwnProperty(l)){if(this.allVocaObjects.allVocabularies[l].scope===t&&this.allVocaObjects.allVocabularies[l].isWritable===true){a.vocabularies.push(l);a.scope=t;break}}}return a};i.prototype.isObjectExist=function(t,l){if(this.isGlobalObject(l)){return true}var a=this.loadVoca(t,true,false,false,false,false,false,false);if(!a){return false}return a.objects.hasOwnProperty(l)};i.prototype.isGlobalObject=function(t){this.loadAllGlobalObjects();return this.globalObjects.hasOwnProperty(t)};i.prototype.getObject=function(t,l){return this.loadObject(t,l,true,true)};i.prototype.getObjectIgnoreCase=function(t,l){return this.loadObjectIgnoreCase(t,l,true,true)};i.prototype.getObjectRuntimeInfo=function(t,l){var a=this.loadObject(t,l,false,false);if(!a){return null}return{schema:a.schema,runtime_name:a.runtimeName}};i.prototype.getObjectRuntimeName=function(t,l){var a=this.loadObject(t,l,false,false);if(!a){return null}return a.runtimeName};i.prototype.getObjectRuntimeSchemaName=function(t,l){var a=this.loadObject(t,l,false,false);if(!a){return null}return a.schema};i.prototype.getActionsNames=function(t,l){var a=[];var e;if(arguments.length>1&&l){e=l}else{e=null}var s=this.loadVoca(t,false,true,false,false,false,false,false);if(s){var i=null;for(i in s.actions){if(s.actions.hasOwnProperty(i)&&(e===null||i.indexOf(e)===0)){a.push({name:i})}}}return a};i.prototype.getVocaTerms=function(t){var l=[];var a;var e=this.getTerms(t);if(!e){return l}for(a=0;a<e.terms.length;a++){if(e.terms[a].isVocaRuleTerm===true){l.push(e.terms[a])}}return l};i.prototype.getTerms=function(t,a,e){var s=[];var i=null;var r=null;var o=null;var u=null;var n=null;if(a){u=a.toLowerCase()}if(e===l.TermModeRelated.TERM_MODE_BY_DESCRIPTION){o=l.TermModeRelated.TERM_PROPERTY_FRIENDLY_TERM}else{o=l.TermModeRelated.TERM_PROPERTY_DESCRIPTION}n=this.loadVoca(t,false,false,false,false,false,true,false);if(n){for(r in n.terms){if(n.terms.hasOwnProperty(r)){i=n.terms[r];if(u===null||i[o].toLowerCase().indexOf(u)===0){s.push(i)}}}}return{terms:s}};i.prototype.getActions=function(t,l,a){var e=[];var s;if(arguments.length>1&&l){s=l}else{s=null}var i=this.loadVoca(t,false,true,false,false,false,false,false);if(i){var r=null;for(r in i.actions){if(i.actions.hasOwnProperty(r)&&(s===null||r.indexOf(s)===0)){e.push(this.getAction(t,r,a))}}}return{actions:e}};i.prototype.getAction=function(t,l,a){var e=this.loadVoca(t,false,true,false,false,false,false,false);if(!e){return null}if(!e.actions[l]){return null}var i=e.actions[l];if(i){if(!i.staticParams){this.loadAllActionsStaticParams();i.staticParams=[];var r;for(r=0;r<this.allVocaObjects.allActionsStaticParams.length;r++){if(i.id===this.allVocaObjects.allActionsStaticParams[r].actionId){i.staticParams.push(this.allVocaObjects.allActionsStaticParams[r])}}}if(!i.requiredParams){this.loadAllActionsRequiredParams();i.requiredParams=[];var o;for(o=0;o<this.allVocaObjects.allActionsRequiredParams.length;o++){if(i.id===this.allVocaObjects.allActionsRequiredParams[o].actionId){i.requiredParams.push(this.allVocaObjects.allActionsRequiredParams[o])}}}}var u=s.getVocaConversionUtils().convertAction(this.rtContext.getConnection(),t,i,a);return u};i.prototype.getTerm=function(t,a,e){var s=null;var i=null;var r=null;var o=null;var u=this.loadVoca(t,false,false,false,false,false,true,false);if(!u){return null}if(e===l.TermModeRelated.TERM_MODE_BY_DESCRIPTION){o=l.TermModeRelated.TERM_PROPERTY_FRIENDLY_TERM}else{o=l.TermModeRelated.TERM_PROPERTY_DESCRIPTION}for(s in u.terms){if(u.terms.hasOwnProperty(s)){i=u.terms[s];if(i[o]===a){r=i;break}}}return r};i.prototype.isTermModifierEmpty=function(t){var l=this.loadVoca(t,false,false,false,false,false,true,false);if(!l){return null}if(!l.terms){return null}var a=true;var e;if(Object.keys(l.terms).length!==0){for(e in l.terms){if(l.terms.hasOwnProperty(e)){if(Object.keys(l.terms[e].modifiers).length!==0){a=false;break}}}}return a};i.prototype.isCurrentTermModifierEmpty=function(t){var a=this.loadVoca(t,false,false,false,false,false,true,false);if(!a){return null}if(!a.terms){return null}var e=true;var s;if(Object.keys(a.terms).length!==0){for(s in a.terms){if(a.terms.hasOwnProperty(s)){if(a.terms[s].modifiers&&a.terms[s].modifiers[l.TERM_MODIFIER_CURRENT]){e=false;break}}}}return e};i.prototype.getAlias=function(t,l,a){var e=this.rtContext.getTransientVocabulary();var i=null;if(e){i=e.getAlias(l)}if(i){return i}var r=this.loadVoca(t,false,false,false,true,false,false,false);if(!r){return null}i=r.aliases[l];if(!i){return null}var o=i;if(a){o=s.getVocaConversionUtils().convertAlias(this.rtContext.getConnection(),this,t,i,a)}return o};i.prototype.isAliasExist=function(t,l){var a=this.loadVoca(t,false,false,false,true,false,false,false);if(!a){return false}if(!a.aliases[l]){var e=this.rtContext.getTransientVocabulary();if(e&&e.getAlias(l)){return true}return false}return true};i.prototype.isActionExist=function(t,l){var a=this.loadVoca(t,false,true,false,false,false,false,false);if(!a){return false}if(!a.actions[l]){return false}return true};i.prototype.getAliasesNames=function(t,l){var a=[];var e;if(arguments.length>1&&l){e=l}else{e=null}var s=this.loadVoca(t,false,false,false,true,false,false,false);if(s){var i=null;for(i in s.aliases){if(s.aliases.hasOwnProperty(i)&&(e===null||i.indexOf(e)===0)){a.push({name:i})}}}return a};i.prototype.getOutputsNames=function(t,l){var a=[];var e;if(arguments.length>1&&l){e=l}else{e=null}var s=this.loadVoca(t,false,false,true,false,false,false,false);if(s){var i=null;for(i in s.outputs){if(s.outputs.hasOwnProperty(i)&&(e===null||i.indexOf(e)===0)){a.push({name:i})}}}return a};i.prototype.getOutputs=function(t,l,a){var e=[];var s;if(arguments.length>1&&l){s=l}else{s=null}var i=this.loadVoca(t,false,false,true,false,false,false,false);if(i){var r=null;for(r in i.outputs){if(i.outputs.hasOwnProperty(r)&&(s===null||r.indexOf(s)===0)){e.push(this.getOutput(t,r,a))}}}return{outputs:e}};i.prototype.getAliases=function(t,l,a){var e=[];var s;if(arguments.length>1&&l){s=l}else{s=null}var i=this.rtContext.getTransientVocabulary();var r=null;if(i){r=i.getAliasesMap();var o=null;for(o in r){if(r.hasOwnProperty(o)&&(s===null||o.toLowerCase().indexOf(s.toLowerCase())===0)){e.push(r[o])}}}var u=this.loadVoca(t,false,false,false,true,false,false,false);if(u){var n=null;for(n in u.aliases){if(u.aliases.hasOwnProperty(n)&&(s===null||n.toLowerCase().indexOf(s.toLowerCase())===0)){if(!r||!r[n]){e.push(this.getAlias(t,n,a))}}}}return{aliases:e}};i.prototype.getOutput=function(t,l,a){return this.getOutputByUsage(t,l,a,false)};i.prototype.getVocaRuleOutput=function(t,l,a){return this.getOutputByUsage(t,l,a,true)};i.prototype.getOutputByUsage=function(t,l,a,e){var i=this.loadVoca(t,false,false,true,false,false,false,false);if(!i){return null}if(e&&!i.vocaRulesOutputs[l]){return null}if(!e&&!i.outputs[l]){return null}var r=null;if(e){r=i.vocaRulesOutputs[l]}else{r=i.outputs[l]}if(r){if(!r.staticParams){this.loadAllOutputsStaticParams();r.staticParams=[];var o;for(o=0;o<this.allVocaObjects.allOutputsStaticParams.length;o++){if(r.id===this.allVocaObjects.allOutputsStaticParams[o].outputId){r.staticParams.push(this.allVocaObjects.allOutputsStaticParams[o])}}}if(!r.requiredParams){this.loadAllOutputsRequiredParams();r.requiredParams=[];var u;for(u=0;u<this.allVocaObjects.allOutputsRequiredParams.length;u++){if(r.id===this.allVocaObjects.allOutputsRequiredParams[u].outputId){r.requiredParams.push(this.allVocaObjects.allOutputsRequiredParams[u])}}}}var n=s.getVocaConversionUtils().convertOutput(this.rtContext.getConnection(),t,r,a);return n};i.prototype.isOutputExist=function(t,l){var a=this.loadVoca(t,false,false,true,false,false,false,false);if(!a){return false}if(!a.outputs[l]){return false}return true};i.prototype.getObjectsNames=function(t,l){var a=[];var e;if(arguments.length>1&&l){e=l}else{e=null}var s=this.loadVoca(t,true,false,false,false,false,false,false);if(s){var i=null;for(i in s.objects){if(s.objects.hasOwnProperty(i)&&(e===null||i.toLowerCase().indexOf(e.toLowerCase())===0)){a.push({name:i})}}}return a};i.prototype.getObjectAssociationsNames=function(t,l,a){var e=[];var s;if(arguments.length>1&&a){s=a}else{s=null}var i=this.loadObject(t,l,false,true);if(i){var r=null;for(r in i.associations){if(i.associations.hasOwnProperty(r)&&(s===null||r.toLowerCase().indexOf(s.toLowerCase())===0)){e.push({name:r})}}}return e};i.prototype.getObjectAttributesNames=function(t,l,a){var e=[];var s;if(arguments.length>1&&a){s=a}else{s=null}var i=this.loadObject(t,l,true,false);if(i){var r=null;for(r in i.attributes){if(i.attributes.hasOwnProperty(r)){if(s===null||r.toLowerCase().indexOf(s.toLowerCase())===0){e.push({name:r})}}}}return e};i.prototype.getObjectAttributesDescriptions=function(t,l,a){var e=[];var s;if(arguments.length>1&&a){s=a}else{s=null}var i=this.loadObject(t,l,true,false);if(i){var r=null;var o=null;for(r in i.attributes){if(i.attributes.hasOwnProperty(r)){o=i.attributes[r].description;if(s===null||o.toLowerCase().indexOf(s.toLowerCase())===0){e.push({name:r})}}}}return e};i.prototype.getObjectAttributesNamesByTermMode=function(t,a,e,s){if(s===l.TermModeRelated.TERM_MODE_BY_DESCRIPTION){return this.getObjectAttributesDescriptions(t,a,e)}return this.getObjectAttributesNames(t,a,e)};i.prototype.getAttribute=function(t,l,a){var e=this.loadObject(t,l,true,false);if(!e){return null}if(!e.attributes[a]){return null}return e.attributes[a]};i.prototype.getAttributeByDesc=function(t,l,a){var e=0;var s=this.loadObject(t,l,true,false);if(!s){return null}for(e in s.attributes){if(s.attributes.hasOwnProperty(e)){if(s.attributes[e].description===a){return s.attributes[e]}}}};i.prototype.getAttributeIgnoreCase=function(t,l,a){var e=this.loadObjectIgnoreCase(t,l,true,false);if(!e){return null}if(!e.attributes[a]){return null}return e.attributes[a]};i.prototype.getAttributeByTermMode=function(t,a,e,s){if(s===l.TermModeRelated.TERM_MODE_BY_DESCRIPTION){return this.getAttributeByDesc(t,a,e)}return this.getAttribute(t,a,e)};i.prototype.getAttributeDataType=function(t,l,a){var e=this.loadObject(t,l,true,false);if(!e){return null}if(!e.attributes[a]){return null}return e.attributes[a].dataType};i.prototype.getAttributeBusinessDataType=function(t,l,a){var e=this.loadObject(t,l,true,false);if(!e){return null}if(!e.attributes[a]){return null}return e.attributes[a].businessDataType};i.prototype.getAttributeRuntimeName=function(t,l,a){var e=this.loadObject(t,l,true,false);if(!e){return null}if(!e.attributes[a]){return null}return e.attributes[a].runtimeName};i.prototype.getAttributes=function(t,l){var a=[];var e=this.loadObject(t,l,true,false);if(e){var s=null;for(s in e.attributes){if(e.attributes.hasOwnProperty(s)){a.push(e.attributes[s])}}}return a};i.prototype.getAssociations=function(t,l,a){var e=[];var s;var i=this.loadObject(t,l,false,true);if(i){var r=null;for(r in i.associations){if(i.associations.hasOwnProperty(r)){s=i.associations[r];e.push(s);if(a){this.loadAssocAttr(s)}}}}return e};i.prototype.getAssociation=function(t,l,a,e){var s=this.loadObject(t,l,false,true);if(!s){return null}if(!s.associations[a]){return null}var i=s.associations[a];if(i&&e){this.loadAssocAttr(i)}return i};i.prototype.getAssociationIgnoreCase=function(t,l,a,e){var s=this.loadObjectIgnoreCase(t,l,false,true);if(!s){return null}if(!s.associations[a]){return null}var i=s.associations[a];if(i&&e){this.loadAssocAttr(i)}return i};i.prototype.getAdvancedFunctions=function(t,l){var a=[];var e;if(arguments.length>1&&l){e=l}else{e=null}var s=this.loadVoca(t,false,false,false,false,false,false,true);if(s){var i=null;for(i in s.advancedFunctions){if(s.advancedFunctions.hasOwnProperty(i)&&(e===null||i.indexOf(e)===0)){a.push(this.getAdvancedFunction(t,i))}}}return{advancedFunctions:a}};i.prototype.getAdvancedFunction=function(t,l){var a=this.loadVoca(t,false,false,false,false,false,false,true);if(!a){return null}if(!a.advancedFunctions[l]){return null}var e=a.advancedFunctions[l];return e};i.prototype.clearAll=function(){this.globalObjects=null;this.globalRuleAttributes=null;this.globalStaticRuleTemplateAttributes=null;this.globalDynamicRuleTemplateAttributes=null;this.globalStaticVocabularyAttributes=null;this.globalAttr=null;this.allVocaObjects.allAssocAttr=null;this.allVocaObjects.allAssoc=null;this.allVocaObjects.allObjects=null;this.allVocaObjects.allAttr=null;this.allVocaObjects.allActions=null;this.allVocaObjects.allOutputs=null;this.allVocaObjects.allAliases=null;this.allVocaObjects.allValueLists=null;this.allVocaObjects.allTerms=null;this.allVocaObjects.allTermsModifiers=null;this.allVocaObjects.allActionsStaticParams=null;this.allVocaObjects.allOutputsStaticParams=null;this.allVocaObjects.allActionsRequiredParams=null;this.allVocaObjects.allOutputsRequiredParams=null;this.allVocaObjects.allAdvancedFunctions=null;this.allVocaObjects.allVocabularies=null};i.prototype.loadAllVocabularies=function(){if(this.allVocaObjects.allVocabularies){return}this.rtContext.loadAllVocabularies(this.allVocaObjects)};i.prototype.loadVoca=function(t,l,a,e,s,i,r,o,u){this.loadAllVocabularies();if(!this.isVocabularyExist(t)){return null}var n=this.allVocaObjects.allVocabularies[t];if(l&&n.objects===null){this.loadVocaObjects(n,u)}if(a&&n.actions===null){this.loadVocaActions(n)}if(e&&n.outputs===null){this.loadVocaOutputs(n)}if(s&&n.aliases===null){this.loadVocaAliases(n)}if(i&&n.valueLists===null){this.loadVocaValueLists(n)}if(r&&n.terms===null){this.loadVocaTerms(n)}if(o&&n.advancedFunctions===null){this.loadVocaAdvancedFunctions(n)}return n};i.prototype.loadAllObjects=function(){if(this.allVocaObjects.allObjects){return}this.rtContext.loadAllObjects(this.allVocaObjects)};i.prototype.addStaticRuleAssocs=function(t){var a=new e.AssocInfo("","",l.DO_RULE_TEMPLATE,l.DO_RULE_TEMPLATE,l.CARDINALITY_MANY_TO_ONE,null);a.attrs=[];a.attrs.push(new e.AssocAttrInfo("",l.ATT_RULE__TEMPLATE_ID,l.ATT_ID));t.associations[a.name]=a;var s=new e.AssocInfo("","",l.ASSOC_VOCABULARY,l.DO_VOCABULARY,l.CARDINALITY_MANY_TO_ONE,null);s.attrs=[];s.attrs.push(new e.AssocAttrInfo("",l.ATT_VOCABULARY,l.ATT_VOCA_FULL_NAME));t.associations[s.name]=s};i.prototype.addStaticVocabularyAttributes=function(){if(this.globalStaticVocabularyAttributes){return}this.globalStaticVocabularyAttributes={};this.globalStaticVocabularyAttributes[l.ATT_VOCA_SCOPE]=new e.AttrInfo("",l.ATT_VOCA_SCOPE,l.DO_VOCABULARY,l.VOCABULARY_COL_SCOPE,"","NVARCHAR","String",512,"Data",l.VOCABULARY_COL_SCOPE,null,null,null,null);this.globalStaticVocabularyAttributes[l.ATT_VOCA_FULL_NAME]=new e.AttrInfo("",l.ATT_VOCA_FULL_NAME,l.DO_VOCABULARY,l.VOCABULARY_COL_PATH_FULL_NAME,"","NVARCHAR","String",512,"Data",l.VOCABULARY_COL_PATH_FULL_NAME,null,null,null,null)};i.prototype.addStaticRuleTemplateAttributes=function(){if(this.globalStaticRuleTemplateAttributes){return}this.globalStaticRuleTemplateAttributes={};this.globalStaticRuleTemplateAttributes[l.ATT_ID]=new e.AttrInfo("",l.ATT_ID,l.DO_RULE_TEMPLATE,t.COL_ID,"","CHAR","String",32,"Data",t.TABLE_RULE_TEMPLATE,null,null,null,null);this.globalStaticRuleTemplateAttributes[l.ATT_PACKAGE]=new e.AttrInfo("",l.ATT_PACKAGE,l.DO_RULE_TEMPLATE,t.COL_PACKAGE,"","NVARCHAR","String",256,"Data",t.TABLE_RULE_TEMPLATE,null,null,null,null);this.globalStaticRuleTemplateAttributes[l.ATT_NAME]=new e.AttrInfo("",l.ATT_NAME,l.DO_RULE_TEMPLATE,t.COL_NAME,"","NVARCHAR","String",256,"Data",t.TABLE_RULE_TEMPLATE,null,null,null,null);this.globalStaticRuleTemplateAttributes[l.ATT_DESC]=new e.AttrInfo("",l.ATT_DESC,l.DO_RULE_TEMPLATE,t.COL_DESCRIPTION,"","NVARCHAR","String",256,"Data",t.TABLE_RULE_TEMPLATE,null,null,null,null);this.globalStaticRuleTemplateAttributes[l.ATT_VOCABULARY]=new e.AttrInfo("",l.ATT_VOCABULARY,l.DO_RULE_TEMPLATE,t.COL_DEFAULT_VOCABULARY,"","NVARCHAR","String",256,"Data",t.TABLE_RULE_TEMPLATE,null,null,null,null);this.globalStaticRuleTemplateAttributes[l.ATT_OUTPUT]=new e.AttrInfo("",l.ATT_OUTPUT,l.DO_RULE_TEMPLATE,t.COL_OUTPUT,"","NVARCHAR","String",256,"Data",t.TABLE_RULE,null,null)};i.prototype.addDynamicRuleTemplateAttributes=function(){if(this.globalDynamicRuleTemplateAttributes){return}this.globalDynamicRuleTemplateAttributes=this.rtContext.getDynamicRuleTemplateAttributes()};i.prototype.addStaticRuleAttributes=function(){this.globalRuleAttributes[l.ATT_ID]=new e.AttrInfo("",l.ATT_ID,l.DO_RULE,t.COL_ID,"","CHAR","String",32,"Data",t.TABLE_RULE,null,null,null,null);this.globalRuleAttributes[l.ATT_PACKAGE]=new e.AttrInfo("",l.ATT_PACKAGE,l.DO_RULE,t.COL_PACKAGE,"","NVARCHAR","String",256,"Data",t.TABLE_RULE,null,null,null,null);this.globalRuleAttributes[l.ATT_NAME]=new e.AttrInfo("",l.ATT_NAME,l.DO_RULE,t.COL_NAME,"","NVARCHAR","String",256,"Data",t.TABLE_RULE,null,null,null,null);this.globalRuleAttributes[l.ATT_RULE__TEMPLATE_ID]=new e.AttrInfo("",l.ATT_RULE__TEMPLATE_ID,l.DO_RULE,t.COL_RULE_TEMPLATE_ID,"","CHAR","String",32,"Data",t.TABLE_RULE,null,null,null,null);this.globalRuleAttributes[l.ATT_DESC]=new e.AttrInfo("",l.ATT_DESC,l.DO_RULE,t.COL_DESCRIPTION,"","NVARCHAR","String",256,"Data",t.TABLE_RULE,null,null,null,null);this.globalRuleAttributes[l.ATT_RULE__STATUS]=new e.AttrInfo("",l.ATT_RULE__STATUS,l.DO_RULE,t.COL_STATUS,"","NVARCHAR","String",32,"Data",t.TABLE_RULE,null,null,null,null);this.globalRuleAttributes[l.ATT_OUTPUT]=new e.AttrInfo("",l.ATT_OUTPUT,l.DO_RULE,t.COL_OUTPUT,"","NVARCHAR","String",256,"Data",t.TABLE_RULE,null,null,null,null);this.globalRuleAttributes[l.ATT_SINGLE_CONSUMPTION]=new e.AttrInfo("",l.ATT_SINGLE_CONSUMPTION,l.DO_RULE,t.COL_SINGLE_CONSUMPTION,"","TINYINT","Boolean","Data",t.TABLE_RULE,null,null,null,null);this.globalRuleAttributes[l.ATT_VOCABULARY]=new e.AttrInfo("",l.ATT_VOCABULARY,l.DO_RULE,t.COL_VOCABULARY,"","NVARCHAR","String",256,"Data",t.TABLE_RULE,null,null,null,null);this.globalRuleAttributes[l.ATT_MANUAL_ASSIGNMENT]=new e.AttrInfo("",l.ATT_MANUAL_ASSIGNMENT,l.DO_RULE,t.COL_MANUAL_ASSIGNMENT,"","TINYINT","Boolean",1,"Data",t.TABLE_RULE,null,null,null,null)};i.prototype.loadRuleAttributes=function(){if(this.globalRuleAttributes){return}this.globalRuleAttributes={};this.addStaticRuleAttributes()};i.prototype.loadAllGlobalObjects=function(){if(this.globalObjects){return}var s={};var i=new e.ObjectInfo(null,null,l.HRF_MODEL,"",l.DO_VOCABULARY,l.TABLE_VOCABULARY,this.rtContext.getHRFSchema());s[i.name]=i;i.associations={};var r=new e.ObjectInfo(null,null,l.HRF_MODEL,"",l.DO_RULE_TEMPLATE,t.TABLE_RULE_TEMPLATE,this.rtContext.getHRFSchema());s[r.name]=r;r.associations={};var o=new e.AssocInfo("","",l.DO_RULE,l.DO_RULE,l.CARDINALITY_ONE_TO_MANY,null);o.attrs=[];o.attrs.push(new e.AssocAttrInfo("",l.ATT_ID,l.ATT_RULE__TEMPLATE_ID));r.associations[o.name]=o;var u=new e.ObjectInfo(null,null,l.HRF_MODEL,"",l.DO_RULE,t.TABLE_RULE,this.rtContext.getHRFSchema());s[u.name]=u;u.associations={};this.addStaticRuleAssocs(u);var n=this.rtContext.getDefinedTemplates();var c,f,A,b;for(c=0;c<n.length;c++){f=n[c].pack;A=n[c].name;b=new e.ObjectInfo(null,null,l.RULE_TEMPLATE,"",A,a.makeGlobalObjectRTName(f,A),this.rtContext.getHRFSchema());s[b.name]=b;o=new e.AssocInfo("","",A,A,l.CARDINALITY_ONE_TO_ONE,null);o.attrs=[];o.attrs.push(new e.AssocAttrInfo("",l.ATT_ID,l.ATT_ID));u.associations[o.name]=o}this.globalObjects=s};i.prototype.loadAllActions=function(){if(this.allVocaObjects.allActions){return}this.rtContext.loadAllActions(this.allVocaObjects)};i.prototype.loadAllAliases=function(){if(this.allVocaObjects.allAliases){return}this.rtContext.loadAllAliases(this.allVocaObjects)};i.prototype.loadAllValueLists=function(){if(this.allVocaObjects.allValueLists){return}this.rtContext.loadAllValueLists(this.allVocaObjects)};i.prototype.loadAllTerms=function(){if(this.allVocaObjects.allTerms){return}this.rtContext.loadAllTerms(this.allVocaObjects)};i.prototype.loadAllTermModifiers=function(){if(this.allVocaObjects.allTermsModifiers){return}this.rtContext.loadAllTermModifiers(this.allVocaObjects)};i.prototype.loadAllOutputs=function(){if(this.allVocaObjects.allOutputs){return}this.rtContext.loadAllOutputs(this.allVocaObjects)};i.prototype.loadAllActionsStaticParams=function(){if(this.allVocaObjects.allActionsStaticParams){return}this.rtContext.loadAllActionsStaticParams(this.allVocaObjects)};i.prototype.loadAllActionsRequiredParams=function(){if(this.allVocaObjects.allActionsRequiredParams){return}this.rtContext.loadAllActionsRequiredParams(this.allVocaObjects)};i.prototype.loadAllOutputsRequiredParams=function(){if(this.allVocaObjects.allOutputsRequiredParams){return}this.rtContext.loadAllOutputsRequiredParams(this.allVocaObjects)};i.prototype.loadAllOutputsStaticParams=function(){if(this.allVocaObjects.allOutputsStaticParams){return}this.rtContext.loadAllOutputsStaticParams(this.allVocaObjects)};i.prototype.loadAllAdvancedFunctions=function(){if(this.allVocaObjects.allAdvancedFunctions){return}this.rtContext.loadAllAdvancedFunctions(this.allVocaObjects)};i.prototype.loadVocaObjects=function(t,a){if(t.objects){return}this.loadAllObjects();t.objects={};var e=t.scope!==l.GLOBAL;var s;for(s=0;s<this.allVocaObjects.allObjects.length;s++){if(t.id===this.allVocaObjects.allObjects[s].vocaId||e&&(this.allVocaObjects.allObjects[s].scope===l.GLOBAL||this.allVocaObjects.allObjects[s].scope===t.scope)){t.objects[this.allVocaObjects.allObjects[s].name]=this.allVocaObjects.allObjects[s]}}this.loadAllGlobalObjects();if(!a){var i=null;for(i in this.globalObjects){if(this.globalObjects.hasOwnProperty(i)){t.objects[i]=this.globalObjects[i]}}}};i.prototype.loadVocaActions=function(t){if(t.actions){return}this.loadAllActions();t.actions={};var a=t.scope!==l.GLOBAL;var e;for(e=0;e<this.allVocaObjects.allActions.length;e++){if(t.id===this.allVocaObjects.allActions[e].vocaId||a&&(this.allVocaObjects.allActions[e].scope===l.GLOBAL||this.allVocaObjects.allActions[e].scope===t.scope&&this.allVocaObjects.allActions[e].isPrivate===false)){t.actions[this.allVocaObjects.allActions[e].name]=this.allVocaObjects.allActions[e]}}};i.prototype.loadVocaAliases=function(t){if(t.aliases){return}this.loadAllAliases();a.loadAllAliases(t,this.allVocaObjects.allAliases,this.rtContext)};i.prototype.loadVocaTerms=function(t){if(t.terms){return}this.loadAllTerms();this.loadAllTermModifiers();t.terms={};var a=t.scope!==l.GLOBAL;var e;var s,i;for(s=0;s<this.allVocaObjects.allTerms.length;s++){if(t.id===this.allVocaObjects.allTerms[s].vocaId||a&&(this.allVocaObjects.allTerms[s].scope===l.GLOBAL||this.allVocaObjects.allTerms[s].scope===t.scope&&this.allVocaObjects.allTerms[s].isPrivate===false)){t.terms[this.allVocaObjects.allTerms[s].description]=this.allVocaObjects.allTerms[s];e={};for(i=0;i<this.allVocaObjects.allTermsModifiers.length;i++){if(this.allVocaObjects.allTermsModifiers[i].termId===this.allVocaObjects.allTerms[s].termId){e[this.allVocaObjects.allTermsModifiers[i].modifier]=true}}t.terms[this.allVocaObjects.allTerms[s].description].modifiers=e}}};i.prototype.loadVocaValueLists=function(t){if(t.valueLists){return}this.loadAllValueLists();t.valueLists={};var a=t.scope!==l.GLOBAL;var e;for(e=0;e<this.allVocaObjects.allValueLists.length;e++){if(t.id===this.allVocaObjects.allValueLists[e].vocaId){t.valueLists[this.allVocaObjects.allValueLists[e].name]=this.allVocaObjects.allValueLists[e]}else if(a&&(this.allVocaObjects.allValueLists[e].scope===l.GLOBAL||this.allVocaObjects.allValueLists[e].scope===t.scope)){if(!t.valueLists[this.allVocaObjects.allValueLists[e].name]){t.valueLists[this.allVocaObjects.allValueLists[e].name]=this.allVocaObjects.allValueLists[e]}}}};i.prototype.loadVocaOutputs=function(t){if(t.outputs){return}this.loadAllOutputs();t.outputs={};t.vocaRulesOutputs={};var a=t.scope!==l.GLOBAL;var e;for(e=0;e<this.allVocaObjects.allOutputs.length;e++){if(t.id===this.allVocaObjects.allOutputs[e].vocaId||a&&(this.allVocaObjects.allOutputs[e].scope===l.GLOBAL||this.allVocaObjects.allOutputs[e].scope===t.scope&&this.allVocaObjects.allOutputs[e].isPrivate===false)){t.outputs[this.allVocaObjects.allOutputs[e].name]=this.allVocaObjects.allOutputs[e]}}if(this.allVocaObjects.hasOwnProperty("allVocaRulesOutputs")){for(e=0;e<this.allVocaObjects.allVocaRulesOutputs.length;e++){if(t.id===this.allVocaObjects.allVocaRulesOutputs[e].vocaId||a&&(this.allVocaObjects.allVocaRulesOutputs[e].scope===l.GLOBAL||this.allVocaObjects.allVocaRulesOutputs[e].scope===t.scope&&this.allVocaObjects.allVocaRulesOutputs[e].isPrivate===false)){t.vocaRulesOutputs[this.allVocaObjects.allVocaRulesOutputs[e].name]=this.allVocaObjects.allVocaRulesOutputs[e]}}}};i.prototype.loadVocaAdvancedFunctions=function(t){if(t.advancedFunctions){return}this.loadAllAdvancedFunctions();t.advancedFunctions={};var a=t.scope!==l.GLOBAL;var e;for(e=0;e<this.allVocaObjects.allAdvancedFunctions.length;e++){if(t.id===this.allVocaObjects.allAdvancedFunctions[e].vocaId||a&&(this.allVocaObjects.allAdvancedFunctions[e].scope===l.GLOBAL||this.allVocaObjects.allAdvancedFunctions[e].scope===t.scope&&this.allVocaObjects.allAdvancedFunctions[e].isPrivate===false)){t.advancedFunctions[this.allVocaObjects.allAdvancedFunctions[e].name]=this.allVocaObjects.allAdvancedFunctions[e]}}};i.prototype.loadObject=function(t,l,a,e){var s;var i=this.loadVoca(t,true,false,false,false,false,false,false);if(!i){return null}s=i.objects[l];if(!s){return null}if(a){this.loadObjectAttributes(i,s)}if(e){this.loadObjectAssociations(s)}return s};i.prototype.loadObjectIgnoreCase=function(t,l,a,e){var s=null;var i=this.loadVoca(t,true,false,false,false,false,false,false);if(!i){return null}var r=null;for(r in i.objects){if(i.objects.hasOwnProperty(r)){if(r.toLowerCase()===l.toLowerCase()){s=i.objects[r];break}}}if(!s){return null}if(a){this.loadObjectAttributes(i,s)}if(e){this.loadObjectAssociations(s)}return s};i.prototype.loadAssocAttr=function(t){if(t.attrs){return}this.loadAllAssocAttr();t.attrs=[];var l;for(l=0;l<this.allVocaObjects.allAssocAttr.length;l++){if(t.id===this.allVocaObjects.allAssocAttr[l].assocId){t.attrs.push(this.allVocaObjects.allAssocAttr[l])}}};i.prototype.loadAllAssocAttr=function(){if(this.allVocaObjects.allAssocAttr){return}this.rtContext.loadAllAssocAttr(this.allVocaObjects)};i.prototype.loadObjectAssociations=function(t){if(t.associations){return}t.associations={};if(t.vocaId){this.loadAllAssociations();var l;for(l=0;l<this.allVocaObjects.allAssoc.length;l++){if(t.id===this.allVocaObjects.allAssoc[l].objId){t.associations[this.allVocaObjects.allAssoc[l].name]=this.allVocaObjects.allAssoc[l]}}}else{this.addStaticRuleAssocs(t)}};i.prototype.loadObjectAttributes=function(t,a){if(a.attributes){return}a.attributes={};var e;if(!a.vocaId){var s=null;var i;if(a.name===l.DO_VOCABULARY){this.addStaticVocabularyAttributes();for(s in this.globalStaticVocabularyAttributes){if(this.globalStaticVocabularyAttributes.hasOwnProperty(s)){i=this.globalStaticVocabularyAttributes[s];a.attributes[s]=i}}}else if(a.name===l.DO_RULE){this.loadRuleAttributes();for(s in this.globalRuleAttributes){if(this.globalRuleAttributes.hasOwnProperty(s)){i=this.globalRuleAttributes[s];a.attributes[s]=i}}}else if(a.name===l.DO_RULE_TEMPLATE){this.addStaticRuleTemplateAttributes();for(s in this.globalStaticRuleTemplateAttributes){if(this.globalStaticRuleTemplateAttributes.hasOwnProperty(s)){i=this.globalStaticRuleTemplateAttributes[s];a.attributes[s]=i}}}else{this.addDynamicRuleTemplateAttributes();for(e=0;e<this.globalDynamicRuleTemplateAttributes.length;e++){i=this.globalDynamicRuleTemplateAttributes[e];if(a.name===i.objectName){a.attributes[i.name]=i}}}}else{this.loadAllAttributes(t.name);for(e=0;e<this.allVocaObjects.allAttr.length;e++){if(a.id===this.allVocaObjects.allAttr[e].objId){a.attributes[this.allVocaObjects.allAttr[e].name]=this.allVocaObjects.allAttr[e]}}}};i.prototype.loadAllAssociations=function(){if(this.allVocaObjects.allAssoc){return}this.rtContext.loadAllAssociations(this.allVocaObjects)};i.prototype.loadAllAttributes=function(){if(this.allVocaObjects.allAttr){return}this.rtContext.loadAllAttributes(this.allVocaObjects)};return{vocabularyDataProvider:i}},true);
//# sourceMappingURL=vocabularyDataProvider.js.map