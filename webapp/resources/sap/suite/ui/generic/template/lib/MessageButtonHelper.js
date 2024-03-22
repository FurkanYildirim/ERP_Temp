sap.ui.define(["sap/ui/base/Object","sap/m/MessagePopover","sap/m/MessagePopoverItem","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/json/JSONModel","sap/suite/ui/generic/template/lib/MessageUtils","sap/suite/ui/generic/template/genericUtilities/testableHelper","sap/ui/core/Element","sap/base/util/extend","sap/suite/ui/generic/template/genericUtilities/oDataModelHelper"],function(e,t,r,n,a,o,s,i,l,u,c){"use strict";n=i.observableConstructor(n,true);var p=new n({path:"persistent",operator:a.EQ,value1:false});var f=new n({path:"technical",operator:a.EQ,value1:false});var g=new n({path:"validation",operator:a.EQ,value1:true});var v=new n({filters:[g,new n({path:"validation",operator:a.EQ,value1:false})],and:true});function m(e,t,r){var i=t.controller;var l=i.getOwnerComponent();var u=l.getModel("ui");var m=new o({isPopoverOpen:false,messageToGroupName:Object.create(null)});var d=i.byId("showMessages");var P=e.oComponentUtils.isDraftEnabled();var h=false;var b;var M;var T;var y;var O=[];function C(t,r,n){var a=!!(n&&r&&e.oCommonUtils.getPositionableControlId(r));var o=a&&m.getProperty("/messageToUpdateFunction");var s=o&&o[t];(s||Function.prototype)();return a}function S(e,t,r,n){var a=n&&e&&t&&y?y.getSubtitle(e,r):r;return a}var E=r&&!P?u.getProperty.bind(u,"/createMode"):function(){return false};var w=v;var U,B;e.oCommonUtils.getDialogFragment("sap.suite.ui.generic.template.fragments.MessagePopover",{afterClose:function(){m.setProperty("/isPopoverOpen",false);B.sort([])},beforeOpen:function(){U.navigateBack();m.setProperty("/isPopoverOpen",true)},isPositionable:C,getSubtitle:S,titlePressed:function(t){s.navigateFromMessageTitleEvent(e,t,l,P,b)}}).then(function(t){U=t;U.setModel(sap.ui.getCore().getMessageManager().getMessageModel(),"msg");U.setModel(m,"helper");B=U.getBinding("items");B.filter(w);var r=e.oComponentUtils.getTemplatePrivateModel();r.setProperty("/generic/messageButtonInfo",{count:0,tooltip:e.oCommonUtils.getText("MESSAGE_BUTTON_TOOLTIP_P",0)});B.attachChange(function(t){var n=B.getLength();var a=0;var o={count:n};if(n>0){if(m.getProperty("/isPopoverOpen")){var s=t.getParameters();if(s.reason!=="sort"){Y(true)}}var i=B.getAllCurrentContexts();var l,u,c;i.forEach(function(e){var t=e.getObject();switch(t.type){case"Error":a++;break;case"Warning":l=true;break;case"Success":u=true;break;default:c=true}});if(a>0){o.severity="Negative";o.icon="sap-icon://message-error"}else if(l){o.severity="Critical";o.icon="sap-icon://message-warning"}else if(c){o.severity="Neutral";o.icon="sap-icon://message-information"}else if(u){o.severity="Success";o.icon="sap-icon://message-success"}}o.label=""+(a||"");o.tooltip=e.oCommonUtils.getText(n===1?"MESSAGE_BUTTON_TOOLTIP_S":"MESSAGE_BUTTON_TOOLTIP_P",n);r.setProperty("/generic/messageButtonInfo",o);O.forEach(function(e){e()})})});var F=new n({filters:[g,new n({path:"controlIds",test:function(t){return!!e.oCommonUtils.getPositionableControlId(t)},caseSensitive:true})],and:true});var x=[];var I=0;var A;var _;function N(e){if(Array.isArray(e)){var t=false;for(var r=0;r<e.length;r++){t=N(e[r])||t}return t}if(e instanceof Promise){e.then(A);return false}_.push(e);return true}function j(e){w=e;if(B){B.filter(w)}}function L(){if(h){M=new n({filters:_,and:false});var t=[M,p];if(e.oServices.oApplication.needsToSuppressTechnicalStateMessages()){t.push(f)}T=new n({filters:t,and:true});j(new n({filters:[T,F],and:false}))}}function D(e,t){if(e===I&&N(t)){L()}}function H(e){var t=e();return N(t)}function k(){x.forEach(H)}function G(e){b=e;I++;A=D.bind(null,I);var t=E();_=r?[new n(t?{path:"target",operator:a.StartsWith,value1:b}:{path:"aFullTargets",test:function(e){return e.some(function(e){return e.startsWith(b)})},caseSensitive:true})]:[];k();L()}function Q(e){x.push(e);if(b!==undefined&&H(e)){L()}}var W;function J(){W=W||function(){if(B.getLength()>0){U.openBy(d)}};setTimeout(function(){var e=Y();e.then(W)},0)}function q(e){h=e;if(e){if(_){L()}}else{_=null;j(v)}}function z(e){return e?F:w}function K(e){return e?T:M}function R(e){var t=E(),r=!t&&c.analyseContextPath(b,e),n=t?b:r.canonicalPath,a=b;return{target:n,fullTarget:a}}function V(){var e=m.getProperty("/isPopoverOpen")?Promise.resolve():Y();e.then(function(){U.toggle(d)})}var X=Object.create(null);function Y(r){var n=e.oServices.oApplication.getBusyHelper();var a=Object.create(null);var o=false;var s=B.getAllCurrentContexts().map(function(e){var t=e.getObject();o=o||!X[t.id];a[t.id]=t;return t});X=o?a:X;var i=o&&t.getPrepareMessageDisplayPromise?t.getPrepareMessageDisplayPromise(s,B,m,b):Promise.resolve(y);if(!r){e.oServices.oApplication.setNextFocus(Function.prototype);n.setBusy(i)}return i.then(function(e){y=e})}function Z(e){O.push(e)}return{adaptToContext:G,toggleMessagePopover:V,showMessagePopover:J,registerMessageFilterProvider:Q,setEnabled:q,getMessageFilters:z,getContextFilter:K,getTargetInfo:R,registerExternalListener:Z}}return e.extend("sap.suite.ui.generic.template.lib.MessageButtonHelper",{constructor:function(e,t,r){u(this,i.testableStatic(m,"MessageButtonHelper")(e,t,r))}})});
//# sourceMappingURL=MessageButtonHelper.js.map