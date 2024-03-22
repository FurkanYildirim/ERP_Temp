sap.ui.define(["sap/rules/ui/parser/businessLanguage/lib/parsingBackendMediator","sap/rules/ui/parser/ruleBody/lib/constants","sap/rules/ui/parser/infrastructure/errorHandling/hrfException","sap/rules/ui/parser/infrastructure/messageHandling/lib/responseCollector","sap/rules/ui/parser/infrastructure/util/utilsBase","sap/rules/ui/parser/ruleBody/lib/decisionTableCell"],function(t,e,r,a,i,s){"use strict";var n=new t.parsingBackendMediatorLib;var o=new i.utilsBaseLib;var a=a.ResponseCollector;var l=function(t){if(t===null||t===undefined||t===""){return true}return false};function u(){this.ruleType="";this.ruleBodyCopy=null;this.needDeserializeInput=false;this.serializedHeaders=[]}u.prototype.initTraversalParts=function t(r){this.traversalParts={};if(r!==undefined&&r!==null){this.traversalParts[e.traversalEnum.condition]=r.hasOwnProperty(e.traversalEnum.condition)?r[e.traversalEnum.condition]:true;this.traversalParts[e.traversalEnum.outputParams]=r.hasOwnProperty(e.traversalEnum.outputParams)?r[e.traversalEnum.outputParams]:true;this.traversalParts[e.traversalEnum.actionParams]=r.hasOwnProperty(e.traversalEnum.actionParams)?r[e.traversalEnum.actionParams]:true;this.traversalParts[e.traversalEnum.actions]=r.hasOwnProperty(e.traversalEnum.actions)?r[e.traversalEnum.actions]:true}else{this.traversalParts[e.traversalEnum.condition]=true;this.traversalParts[e.traversalEnum.outputParams]=true;this.traversalParts[e.traversalEnum.actionParams]=true;this.traversalParts[e.traversalEnum.actions]=true}};u.prototype.traverse=function t(r,a,i,s,n){jQuery.sap.log.debug("Traverse rule --\x3e "+JSON.stringify(r));this.initTraversalParts(s);this.vocabulary=a;this.vocaRTServ=i;if(r!==null&&r!==undefined){if(r.hasOwnProperty(e.RULE_BODY_TYPE)){this.ruleType=r.type;this.setHitPolicy(r);this.ruleBodyCopy=JSON.parse(JSON.stringify(r));if(this.ruleType===e.SINGLE_TEXT){this.traverseText(this.ruleBodyCopy,n)}else if(this.ruleType===e.DECISION_TABLE||this.ruleType===e.RULE_SET){this.traverseDecisionTable(this.ruleBodyCopy,n)}}}return this};u.prototype.traverseText=function t(r,a){var i;var s;if(r.hasOwnProperty(e.RULE_CONTENT)){this.initResult();var n=this.initRowResult(r.content,0);s=o.buildJsonPath(a,e.RULE_CONTENT);if(r.content.hasOwnProperty(e.CONDITION)&&this.traversalParts[e.traversalEnum.condition]===true){s=o.buildJsonPath(s,e.CONDITION);n=this.handleTextCondition(r.content.condition,n,s)}if(r.content.hasOwnProperty(e.RULE_OUTPUTS)&&this.traversalParts[e.traversalEnum.outputParams]===true){this.initTextOutputsResult();var l;for(i=0;i<r.content.outputs.length;i++){s=o.buildJsonPath(a,e.RULE_OUTPUTS,i);l=r.content.outputs[i];if(l.hasOwnProperty(e.RULE_CONTENT)){n=this.handleTextOutputParameter(l,n,s)}}}if(r.content.hasOwnProperty(e.RULE_PARAMETERS)&&this.traversalParts[e.traversalEnum.actionParams]===true){this.initTextParametersResult();var u;for(i=0;i<r.content.parameters.length;i++){s=o.buildJsonPath(a,e.RULE_PARAMETERS,i);u=r.content.parameters[i];if(u.hasOwnProperty(e.RULE_CONTENT)){n=this.handleTextActionParameter(u,n,i,s)}}}if(r.content.hasOwnProperty(e.RULE_ACTIONS)&&this.traversalParts[e.traversalEnum.actionParams]===true){this.initTextActionsResult();var p;for(i=0;i<r.content.actions.length;i++){s=o.buildJsonPath(a,e.RULE_ACTIONS,i);p=r.content.actions[i];n=this.handleTextAction(p,n,s)}}this.addRowResult(n)}else{this.handleEmptyRuleBody()}};u.prototype.traverseDecisionTable=function t(r,a){var i,s;var n;var o;var l=null;if(r.hasOwnProperty(e.RULE_CONTENT)&&r.content.hasOwnProperty(e.RULE_ROWS)&&r.content.hasOwnProperty(e.RULE_HEADERS)){n=r.content;this.initResult();o=this.handleHeaders(n);var u,p;for(i=0;i<n.rows.length;i++){u=n.rows[i];if(u.hasOwnProperty(e.RULE_ROW)&&u.hasOwnProperty(e.RULE_ROW_ID)){p=this.initRowResult(n,i);for(s=0;s<u.row.length;s++){if(u.row[s].hasOwnProperty(e.RULE_COL_ID)){l=null;if(o.hasOwnProperty(u.row[s].colID)){l=o[u.row[s].colID]}if(l&&l.hasOwnProperty(e.RULE_CELL_TYPE)){if(l.type===e.CONDITION&&this.traversalParts[e.traversalEnum.condition]===true){p=this.handleDecisionTableCondition(l,u,s,p)}else if(l.type===e.PARAM&&this.traversalParts[e.traversalEnum.actionParams]===true){p=this.handleDecisionTableActionParameter(l,u,s,p)}else if(l.type===e.OUTPUT_PARAM&&this.traversalParts[e.traversalEnum.outputParams]===true){p=this.handleDecisionTableOutputParameter(l,u,s,p)}else if(l.type===e.ACTION_PARAM&&this.traversalParts[e.traversalEnum.actions]===true){p=this.handleDecisionTableAction(l,u,s,p)}}}}this.addRowResult(p)}}this.finalizeResult(r)}else{this.handleEmptyRuleBody()}};u.prototype.handleTextCondition=function t(e,r,a){};u.prototype.initTextOutputsResult=function t(){};u.prototype.handleTextOutputParameter=function t(e,r,a){};u.prototype.initTextParametersResult=function t(){};u.prototype.handleTextActionParameter=function t(e,r,a,i){};u.prototype.initTextActionsResult=function t(){};u.prototype.handleTextAction=function t(e,r,a){};u.prototype.handleHeaders=function t(e){return[]};u.prototype.handleDecisionTableCondition=function t(r,a,i,n){if(a.row[i].hasOwnProperty(e.RULE_CONTENT)){if(this.needDeserializeInput){a.row[i][e.RULE_CONTENT]=a.row[i][e.RULE_CONTENT]?s.deserializeExpression(a.row[i][e.RULE_CONTENT]).text:null}if(r.hasOwnProperty(e.afterConversionParts.fixedOperator)&&r.fixedOperator.operator){a.row[i][e.RULE_CONTENT]=r.fixedOperator.operator+" "+a.row[i][e.RULE_CONTENT]}}};u.prototype.handleDecisionTableActionParameter=function t(e,r,a,i){return i};u.prototype.handleDecisionTableOutputParameter=function t(r,a,i,n){if(a.row[i].hasOwnProperty(e.RULE_CONTENT)&&this.needDeserializeInput){a.row[i][e.RULE_CONTENT]=a.row[i][e.RULE_CONTENT]?s.deserializeExpression(a.row[i][e.RULE_CONTENT]).text:null}};u.prototype.handleDecisionTableAction=function t(e,r,a,i){return i};u.prototype.traverseDecisionTableHeaders=function t(r,a){var i=0,n=0;var o={};if(r.hasOwnProperty(e.RULE_HEADERS)){n=r.headers.length;for(i=0;i<n;i++){o=r.headers[i];if(this.needDeserializeInput&&!this.serializedHeaders.hasOwnProperty(i)&&!this.serializedHeaders[i]){if(o[e.RULE_DT_EXPRESSION]){o[e.RULE_DT_EXPRESSION]=o[e.RULE_DT_EXPRESSION]?s.deserializeExpression(o[e.RULE_DT_EXPRESSION]).text:null}if(o.hasOwnProperty(e.afterConversionParts.fixedOperator)){o.fixedOperator.operator=o.fixedOperator.operator?s.deserializeExpression(o.fixedOperator.operator).text:null}this.serializedHeaders[i]=true}if(o.hasOwnProperty(e.RULE_COL_ID)){if(a!==null){a(o)}}}}};u.prototype.buildHeadersMap=function t(e){var r=[];this.traverseDecisionTableHeaders(e,function(t){r[t.colID]=t});return r};u.prototype.concatToDecisionTableCondition=function t(e,r,a){return s.concatToDecisionTableCondition(e,r,a)};u.prototype.splitDecisionTableCondition=function t(e,r,a){return s.splitDecisionTableCondition(e,r,a)};u.prototype.initResult=function t(){};u.prototype.initRowResult=function t(e,r){};u.prototype.addRowResult=function t(e){};u.prototype.finalizeResult=function t(e){};u.prototype.handleEmptyRuleBody=function t(){};u.prototype.getParserAST=function t(e,i,s,o,u){var p=n.parseInputRT(e,i,this.vocaRTServ,s,o,this.vocabulary,u);jQuery.sap.log.debug("****************************************************************************************************");jQuery.sap.log.debug("expresstion to parser: "+e+" type: "+o+" vocabulary: "+this.vocabulary+" "+i);jQuery.sap.log.debug("*****************************************************************************************************");if(p===undefined||p===null&&l(e)===false){a.getInstance().addMessage("error_in_parsing_expression",[e]);throw new r.HrfException("error_in_parsing_expression: "+e,false)}if(i===n.PARSE_MODE){if(p!==null&&p.status==="Error"){throw new r.HrfException("",false)}}jQuery.sap.log.debug(JSON.stringify(p));return p};u.prototype.setHitPolicy=function t(r){if(r.hasOwnProperty(e.HIT_POLICY_PROPERTY)){this.hitPolicy=r.hitPolicy}else{this.hitPolicy=e.ALL_MATCH}};u.prototype.getHitPolicy=function t(){return this.hitPolicy};return{RuleBody:u}},true);
//# sourceMappingURL=ruleBody.js.map