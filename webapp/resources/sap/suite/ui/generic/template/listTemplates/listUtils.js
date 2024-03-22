sap.ui.define(["sap/ui/core/library","sap/ui/generic/app/navigation/service/SelectionVariant","sap/ui/model/odata/AnnotationHelper","sap/base/util/extend","sap/ui/model/Context"],function(e,t,r,a,n){"use strict";var o=e.MessageType;var i="msg";function s(e,t,r){var a=t.getParameter("bindingParams");a.events=a.events||{};a.events.aggregatedDataStateChange=function(t){var a=e.oServices.oApplication.getBusyHelper();if(a.isBusy()||t.getSource().getLength()){return}var n=t.getParameter("dataState");var s=n.getMessages().filter(function(e){var a=!r.oMessageStripHelper||!r.oMessageStripHelper.isCustomMessage(e);return e.target===t.getSource().getPath()&&e.getType()===o.Error&&a});if(s.length){var c=sap.ui.getCore().getMessageManager();c.removeMessages(s);var g,p,u;e.oCommonUtils.getDialogFragmentAsync("sap.suite.ui.generic.template.listTemplates.fragments.MessagesOnRetrieval",{itemSelected:function(){p.setProperty("/backbtnvisibility",true)},onBackButtonPress:function(){u.navigateBack();p.setProperty("/backbtnvisibility",false)},onReject:function(){u.navigateBack();g.close()}},i,function(e){u=e.getContent()[0]}).then(function(e){g=e;p=g.getModel(i);p.setProperty("/messages",s);p.setProperty("/backbtnvisibility",false);g.open()})}}}function c(e){var r=new t;var a,n;e.forEach(function(e){a=e.getSelectOptionsPropertyNames();a.forEach(function(t){r.removeParameter(t);r.removeSelectOption(t);r.massAddSelectOption(t,e.getSelectOption(t))});n=e.getParameterNames();n.forEach(function(t){r.removeParameter(t);r.removeSelectOption(t);r.addParameter(t,e.getParameter(t))})});return r}function g(e,a){var o=e.SelectOptions;var i=e.Parameters?p(e.Parameters):[];var s=new n(null,"/");var c={};if(o){o.forEach(function(e){e.PropertyName=e.PropertyName.PropertyPath;e.Ranges.forEach(function(e){e.Sign=e.Sign.EnumMember.split("/")[1];e.Option=e.Option.EnumMember.split("/")[1];e.Low=e.Low&&r.format(s,e.Low);e.High=e.High&&r.format(s,e.High)})});c.SelectOptions=o}if(a.getConsiderAnalyticalParameters()){i.forEach(function(e){e.PropertyName=e.PropertyName.PropertyPath;e.PropertyValue=r.format(s,e.PropertyValue)||null});c.Parameters=i}return new t(c)}function p(e){var t=e&&e.map(function(e){return a({},e,{PropertyName:{PropertyPath:e.PropertyName.PropertyPath.split("/").pop()}})});return t}return{handleErrorsOnTableOrChart:s,getMergedVariants:c,createSVObject:g,getSelectionVariantParameterNamesWithoutNavigation:p}});
//# sourceMappingURL=listUtils.js.map