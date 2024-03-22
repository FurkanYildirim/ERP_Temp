/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ui/integration/widgets/Card","sap/ovp/cards/Integration/Helpers/IntegrationCardPersonalization","sap/ovp/app/OVPLogger","sap/ovp/app/NavigationHelper","sap/ovp/cards/Integration/Helpers/AnalyticalCard","sap/ovp/cards/Integration/Helpers/i18n","sap/ovp/cards/Integration/Helpers/Batch","sap/ovp/cards/Integration/Helpers/Filters","sap/ovp/app/resources","sap/ui/core/Fragment","sap/ui/model/json/JSONModel","sap/ovp/cards/MetadataAnalyser","sap/ovp/helpers/ODataDelegator","sap/ovp/cards/Integration/Helpers/CardHeader","sap/fe/navigation/SelectionVariant","sap/ovp/cards/CommonUtils","sap/ui/core/Core","sap/ovp/cards/Integration/Helpers/ListContentHelper","sap/ovp/cards/Integration/Helpers/ContentHelper","sap/ovp/cards/Integration/Helpers/TableContentHelper","sap/insights/CardHelper","sap/m/MessageToast","sap/ovp/cards/Integration/Helpers/CardAction","sap/ovp/cards/NavigationHelper"],function(e,t,a,r,n,i,o,s,l,p,d,u,c,v,g,f,m,h,y,P,b,C,T,S){"use strict";var D=new a("sap.ovp.cards.Integration.IntegrationCard");var O="module:sap/insights/CardExtension";var V="";var w=function(e,t,a,r,n){var i=e&&e.getBinding(t);var o,s,l,p,d,u;var c,v,g;var f=r&&n!="sap.ovp.cards.charts.analytical"&&n!="sap.ovp.cards.charts.smart.chart";if(i){o=i.aApplicationFilters;s=i.getPath();l=i.mParameters.select;p=k(l&&l.split(","));l=p&&p.join();d=i.sSortParams;u=i.sRangeParams;c=i&&i.sCustomParams;v=c&&c.split("&");v=v&&v.filter(function(e){return e.indexOf("$expand")>-1});g=v&&v[0]}var m=u&&u.split("&")||[];var h,y;for(var P=0;P<m.length;P++){var b=m[P];if(b.indexOf("$skip")>-1){h=b.split("&")[0]}if(b.indexOf("$top")>-1){y=b.split("&")[0]}}if(f&&a&&a.length){var C=l&&l.split(",")||[];a.forEach(function(e){if(!C.includes(e)){C.push(e)}});l=C.join(",")}return{sBindingPath:s,aApplicationFilters:o,sSelect:l?"$select="+l:"",sSortParameters:d?d:"",skip:h?h:"",top:y?y:"",sExpandParam:g||""}};var I=function(e,t){var a=e.view.getController(),r=a.oCardComponentData&&a.oCardComponentData.mainComponent,n=S.getEntityNavigationParameters(r,a.getModel(),e.cardComponentData,a.getCardPropertiesModel(),a.getEntityType()),i=n&&n.sNavSelectionVariant,o=i&&JSON.parse(i),s=o&&o.SelectOptions||[];return s.filter(function(e){return t.indexOf(e["PropertyName"])>-1})};var M=function(e,t,a,r,n){var i=n.view.getModel(),o=n&&n.entityType,s=o&&o.property;var l,p=[],d,c,v=o&&o.name,g=t&&t.name;var f=i.oMetadata._getEntityTypeByName(v);var m=a&&a.oMetadata._getEntityTypeByName(g);if(!f&&!m){return}else if(f&&!m){p=[f.property]}else if(f&&m){p=[f.property,m.property]}for(var h=0;h<p.length;h++){s=JSON.parse(JSON.stringify(p[h]));for(var y=0;y<s.length;y++){if(s[y].name===e){l=s[y];return l}if("P_"+s[y].name===e||s[y].name==="P_"+e||"$Parameter.P_"+s[y].name===e||s[y].name==="$Parameter.P_"+e){l=s[y];if(l&&u.checkAnalyticalParameterisedEntitySet(i,n.entitySet.name)){d=r.length&&F(e,r)}return d&&d.length?d[0]:l}}}if(u.checkAnalyticalParameterisedEntitySet(i,n.entitySet.name)){c=r.length&&F(e,r);if((!c||!c.length)&&e.includes("/")){var P=e.split("/");c=P.length&&F(P[P.length-1],r)}}if(c&&c.length){return c[0]}return undefined};var x=function(e,t){var a;if(e&&e[t]){return e[t]}else if(e&&e.extensions){a=e.extensions;for(var r=0;r<a.length;r++){if(a[r].name===t){return a[r].value}}}return""};var F=function(e,t){return t.filter(function(t){if(t.name===e||"P_"+t.name===e||t.name==="P_"+e||"$Parameter.P_"+t.name===e||t.name==="$Parameter.P_"+e||t.name==="$Parameter."+e||"$Parameter."+t.name===e){return t}})};var N=function(e){return e["sap:filterable"]?e["sap:filterable"]!=="false":true};var R=function(e,t,a){var r=t.filter(function(t){var a=e.some(function(e){return e===t.name});return N(t)&&a})||[];if(a&&a.length>0){e.forEach(function(e){var t="P_"+e.name;if(a.includes(t)){r.push(e)}})}return r};var E=function(e){var t=[];if(e&&e.extensions){t=e.extensions;for(var a=0;a<t.length;a++){if(t[a].name==="parameter"&&t[a].value==="mandatory"){return e.name}else if(t[a].name==="required-in-filter"&&t[a].value==="true"){return e.name}}}};var A=function(e,t){if(t&&t.length){var a=t.filter(function(t){return t.name===e.name});return a&&a[0]}};var _=function(e,t,a,r,n,i,o){var l=o.cardComponentData.mainComponent.oGlobalFilter,p=o.view.getModel("ovpCardProperties"),d=p&&p.getProperty("/bInsightRTEnabled");var u="";if(e["PropertyName"]&&e["PropertyName"]["PropertyPath"]){var c=e["PropertyName"]["PropertyPath"],v=l&&l.getEntityType(),f=l&&l.getModel(),m=f&&f.getMetaModel(),h=m.getODataEntityType(v),y=l.getConsiderAnalyticalParameters();var P;if(y){P=a.filter(function(e){return e.name===c})[0]}if(!P){P=M(c,h,f,a,o)}if(e["PropertyValue"]&&e["PropertyValue"]["String"]){c=P&&P.name?P.name:c;var b=E(P);var C=s.getParameterActualValue(c,l);var T=s.IsSemanticDateRangeValid(o,P);if(b&&r.includes(b)){n.push(b);if(!T){t[c]={value:d&&C?C:e["PropertyValue"]["String"],type:s.getPropertyType(P),description:P&&P.description?P.description:null,label:s.getLabelForConfigParams(c,l,t,o,e["PropertyValue"]["String"])}}else{u=s.getDateRangeControlValue(c,o)}t[c]["description"]=u||x(P,"description")}else if(b){i.push(b);var S=new g;var D=s.getLabelForConfigParams(c,l,t,o,e["PropertyValue"]["String"])||[];var O="";if(d&&C){O=s.getRelatedTextToRange({Low:C},D,l,c);S.addSelectOption(c,"I","EQ",C,null,O)}else{O=s.getRelatedTextToRange({Low:e["PropertyValue"]["String"]},D,l,c);S.addSelectOption(c,"I","EQ",e["PropertyValue"]["String"],null,O)}var T=s.IsSemanticDateRangeValid(o,P);if(!T){t[c]={value:S.toJSONString(),type:s.getPropertyType(P),description:P&&P.description?P.description:null};t[c].value=s.enhanceVariant(t[c].value)}else{u=s.getDateRangeControlValue(c,o)}t[c]["description"]=u||x(P,"description")}}}};var k=function(e){return e&&e.filter(function(t,a){return e.indexOf(t)===a})};var L=function(e,t){if(!f.isODataV4(t)){return e.property.map(function(e){return e.name})}else{return Object.keys(e.property)}};var H=function(e){var t={filters:{}};var a=t.filters;var n=e.cardComponentData.mainComponent.oGlobalFilter;var i=n&&n.getModel();var o=n&&n.getEntityType();var l=e.view.getModel();var p=e.entityType,d,v=[];var f=[],m=[],h=[],y=[],P,b,C=[];var T=[];var S=i&&i.getMetaModel();var D=S&&S.getODataEntityContainer();var O=S.getODataEntityType(o);var V=D&&D.entitySet&&D.entitySet.filter(function(e){return e.entityType===o});var w=V&&V.length>0?V[0]:{};var F=[];if(i){var N=u.checkAnalyticalParameterisedEntitySet(i,w&&w.name);if(N){var H=c.getParametersByEntitySet(i,w);if(H.entitySetName){F=H.parameters||[]}}}var j=c.getParametersByEntitySet(l,e.entitySet).parameters;s.handleConsiderAnalyticalParameters(e,j);var U=e.view.getModel("ovpCardProperties");var J=U&&U.getProperty("/bInsightRTEnabled");var Q="";j.forEach(function(t){var r="";var o=E(t);var p=s.getParameterDefaultValue(i,w,o,e);var d=s.getParameterDefaultValue(l,e.entitySet,o,e);var u=p||d||t.defaultValue||"";var c=s.getParameterActualValue(t.name,n);Q=s.getLabelForConfigParams(t.name,n,a,e,u);var g=s.IsSemanticDateRangeValid(e,t);if(g){var f=c.conditionTypeInfo;var m=f&&f.data&&f.data["operation"];s.setFilterRestrictionToSemanticDateRange(t,true);u=s.getDateRangeDefaultValue(e,t.name)||u;c=s.getDateRangeValueForParameters(c)||c;var y=s.getDateOperationValue(m)||false;if(!y){if(J&&Q&&typeof Q==="string"){Q=Q.substring(0,Q.indexOf("(")-1)}else if(u){Q=u;s.getLabelForConfigParams(t.name,n,a,e,u,true)}}r=s.getDateRangeControlValue(t.name,e)}if(o){h.push(t.name)}a[t.name]={value:J&&c?c:u,type:s.getPropertyType(t),description:r||t&&t.description,label:Q||""};a[t.name]["description"]=r||x(t,"description");v.push(t.name);C.push(t.name)});F=F.filter(function(e){return!C.includes(e)});if(p&&p.property&&O&&O.property){var $=L(p,l);T=R($,O.property,F)}for(var B=0;B<T.length;B++){var q="";var K=T[B],W="";var z=A(K,p.property);var X=E(z);var G=s.getFilterDefaultValue(K.name,O,p)||K.defaultValue||"";var Y=s.getParameterActualValue(K.name,n);if(C.includes(K.name)){Q=s.getLabelForConfigParams(K.name,n,a,e,G);var Z=s.IsSemanticDateRangeValid(e,K);if(Z){s.setFilterRestrictionToSemanticDateRange(K,true);G=s.getDateRangeDefaultValue(e,K.name)||G;Y=s.getDateRangeValueForParameters(Y)||Y;if(J&&Q&&typeof Q==="string"){Q=Q.substring(0,Q.indexOf("(")-1)}else if(G){Q=G;s.getLabelForConfigParams(K.name,n,a,e,G,true)}q=s.getDateRangeControlValue(K.name,e)}a[K.name]={value:J&&Y?Y:G,type:s.getPropertyType(K),description:q||K&&K.description,label:Q};if(X){h.push(X)}v.push(K.name)}else{P=new g;var ee=s.getLabelForConfigParams(K.name,n,a,e,G);var Y;var Z=s.IsSemanticDateRangeValid(e,K);if(Z){s.setFilterRestrictionToSemanticDateRange(K,false);s.addDateRangeValueToSV(e,K,G,P,ee);q=s.getDateRangeControlValue(K.name,e)}else{if(J){s.addFiltervalues(n,K.name,P,ee)}else if(G){var te=s.getRelatedTextToRange({Low:G},ee,n,K.name);P.addSelectOption(K.name,"I","EQ",G,null,te)}else{P.addSelectOption(K.name,"I","EQ",W)}}a[K.name]={value:P.toJSONString(),type:s.getPropertyType(K),description:q||K&&K.description};a[K.name].value=s.enhanceVariant(a[K.name].value);if(X){y.push(X)}f.push(K.name)}a[K.name]["description"]=q||x(K,"description")}var ae=e.cardComponentData.settings["selectionAnnotationPath"];var re=e.entityType[ae]&&JSON.parse(JSON.stringify(e.entityType[ae]));var ne=[],ie;var oe;for(var se in re){if(re.hasOwnProperty(se)){ie="";var le=Array.isArray(re[se])&&re[se];if(se==="Parameters"){for(var pe=0;le&&pe<le.length;pe++){if(le[pe]["PropertyName"][["PropertyPath"]].includes("/")){var de=le[pe]["PropertyName"][["PropertyPath"]].split("/");v.push(de[de.length-1])}else{v.push(le[pe]["PropertyName"][["PropertyPath"]])}ie=le[pe];_(ie,a,j,C,h,y,e)}}else if(se==="SelectOptions"){ne=re["SelectOptions"];for(var ue=0;le&&ue<le.length;ue++){oe=ne[ue]["PropertyName"]["PropertyPath"];oe=oe&&oe.replace("/",".");var ce=e.view;var ve=ce.getController();var ge=r.getNavigationParameters(ve,e);var fe=ge.staticParams.sensitiveProperties;if(ne[ue].Ranges){if(m.indexOf(oe)===-1&&fe.indexOf(oe)===-1){m.push(oe);f.push(oe)}}else{f.push(oe);ie=le[ue];_(ie,a,j,C,h,y,e)}}b=I(e,m)}}}if(b){b.forEach(function(t){var r=t&&t.PropertyName;var o=s.getLabelForConfigParams(r,n,a,e)||[];var l=t&&t.Ranges||[];l.forEach(function(e){var t=s.getRelatedTextToRange(e,o,n,r);if(t){e.Text=t}});var p={Parameters:[],SelectOptions:[t]};var u=M(r,O,i,j,e);if(u){r=u.name}a[r]={value:JSON.stringify(p),type:s.getPropertyType(u),description:u&&u.description};a[r]["description"]=x(d,"description");var c=E(u);if(c&&C.includes(c)){h.push(c)}else if(c){y.push(c)}})}var me=k(f);var he=k(v);var ye=k(h);var Pe=k(y);var be=s.addCustomNavigationParametersToManifest(e,a);s.updateRangeValue(a);a["_relevantODataFilters"]={value:me};a["_relevantODataParameters"]={value:he};a["_mandatoryODataParameters"]={value:ye};a["_mandatoryODataFilters"]={value:Pe};a["_customFilters"]={value:be};return t};var j=function(e,t,a){var r="";if(t){for(var n=0;n<e.length;n++){r=r+"${"+e[n]+"},"}}if(a){if(t){return"{= extension.formatters.formatValueColor("+r+JSON.stringify(t)+")}"}else if(e.length){return"{= extension.formatters.kpiValueCriticality(${"+e[0]+"})}"}}else{return"{= extension.formatters.formatTrendIcon("+r+JSON.stringify(t)+")}"}};var U=function(e,t,a){var r=e.view.getModel("ovpCardProperties");var n=e.entityType[r.getProperty("/presentationAnnotationPath")];var i=s.getRequestAtLeastFields(n);var o=r.getProperty("/addODataSelect");var l=r.getProperty("/template");if(e){var p,d="";switch(e.cardComponentName){case"Analytical":var u=e.vizFrame;p=u&&u.getParent();d="data";break;case"List":p=e.view.byId("ovpList");d="items";break;case"Table":p=e.view.byId("ovpTable");d="items";break}var c=w(p,d,i,o,l);a["_contentSkipQuery"]={value:c.skip};if(e.cardComponentName==="List"||e.cardComponentName==="Table"){a["_contentTopQuery"]={value:"$top=13"}}else{a["_contentTopQuery"]={value:c.top}}a["_contentSortQuery"]={value:c.sSortParameters};a["_contentSelectQuery"]={value:c.sSelect};a["_contentExpandQuery"]={value:c.sExpandParam}}if(t==="Numeric"){var v=e.view.byId("kpiHBoxNumeric");var g=w(v,"items",i,o,l);a["_headerSkipQuery"]={value:g.skip};a["_headerTopQuery"]={value:g.top};a["_headerSortQuery"]={value:g.sSortParameters};a["_headerSelectQuery"]={value:g.sSelect};a["_headerExpandQuery"]={value:g.sExpandParam}}};var J=function(e,t){var a=e.cardComponentData.settings;var n=e.view;var i=n&&n.getController();var o=i.oCardComponentData&&i.oCardComponentData.mainComponent;var s=S.getEntityNavigationParameters(o,i.getModel(),e.cardComponentData,i.getCardPropertiesModel(),i.getEntityType()).sNavSelectionVariant;s=s?JSON.parse(s):"";var l=s&&s.SelectOptions;var p=a.requireAppAuthorization;var d={},u={},c={},v={};if(p){d=r.getNavigationIntentFromAuthString(p);c=d.parameters}var g=Object.keys(c);if(g.length>0){for(var m=0;m<g.length;m++){if(!Array.isArray(c[g[m]])){u[g[m]]={defaultValue:{value:c[g[m]]}}}}}if(l&&l.length){l.forEach(function(e){var a=e["PropertyName"];var r=t.filters._relevantODataFilters.value.includes(a),n=t.filters._relevantODataParameters.value.includes(e["PropertyName"]);var i;if(e&&a&&!u[a]&&e.Ranges.length&&e.Ranges[0].Option==="EQ"&&!(r||n)){i=e.Ranges[0].Low;if(i!==undefined||i!==null){try{i=JSON.parse(e.Ranges[0].Low)}catch(e){}if(!Array.isArray(i)){u[a]=i}}}})}v={inbounds:{intent:{signature:{additionalParameters:"allowed"}}}};f.updatePropertyValueForObject(v.inbounds.intent,d.semanticObject,"semanticObject");f.updatePropertyValueForObject(v.inbounds.intent,d.action,"action");f.updatePropertyValueForObject(v.inbounds.intent.signature,u&&Object.keys(u).length?u:null,"parameters");return v};var Q=function(e,t){if(!e||!t){return}var a=e.getMetaModel();var r=a&&a.getODataEntityContainer();var n=r&&r.entitySet;if(!n||!Array.isArray(n)){return}var i=n.length;for(var o=0;o<i;o++){if(n[o].entityType===t){return n[o].name}}};var $=function(e,t,a){if(e.startsWith("/sap/opu/odata")&&!e.endsWith(".xml")){return{uri:e,type:"ODataAnnotation"}}else if((!e.startsWith("/sap/opu/odata")||e.startsWith("/sap/opu/odata"))&&e.endsWith(".xml")){if(t&&a["sap.platform.abap"]){var r=a["sap.platform.abap"].uri;if(e.indexOf("./")===0){e=e.replace("./","")}else if(e.indexOf("/")===0){e=e.replace("/","")}else if(e.indexOf("../")===0){e=e.replace("../","")}e=r+"/"+e}return{uri:e,type:"XML"}}};var B=function(e,t){var a=e.cardComponentData.model.sServiceUrl;var r=e.view.getModel();var n;if(!f.isODataV4(r)){n="{{destinations.service}}"+a+"/$batch"}else{n="{{destinations.service}}"+a+"$batch"}var i={};var s=o.getBatchObject(e,t["configuration"]);i["request"]={url:n,method:"POST",headers:{Accept:"multipart/mixed","X-CSRF-Token":"{{csrfTokens.token1}}"},batch:s};if(i.request.batch.header){i.request.batch.header.url="{{parameters._headerDataUrl}}"}i.request.batch.content.url="{{parameters._contentDataUrl}}";if(!s.header){var l=i["request"].batch.content;l.headers["X-CSRF-Token"]="{{csrfTokens.token1}}";if(!f.isODataV4(r)){l.url="{{destinations.service}}"+a+"/"+l.url}else{l.url="{{destinations.service}}"+a+l.url}i["request"]=l}return i};var q=function(e){var t=e.cardComponentData.model.sServiceUrl;var a={};a["parameters"]=H(e)["filters"];a["destinations"]={service:{name:"(default)",defaultUrl:"/"}};a["csrfTokens"]={token1:{data:{request:{url:"{{destinations.service}}"+t,method:"HEAD",headers:{"X-CSRF-Token":"Fetch"}}}}};return a};var K=function(e,t,a){var r=v.getHeaderDetails(e),s=e.cardComponentData.cardId,l=e.cardComponentData.appComponent.getManifestObject().getRawJson(),p=l["sap.ovp"]["cards"][s].settings,d=e.cardComponentData.settings,u=d&&d.selectedKey,c,g=e.view.getModel();U(e,r,t["configuration"]["parameters"]);var m=t.extension&&r==="Numeric"?v.mainIndicatorDetails(e):"";var h=m&&m.path&&m.path.length?v.mainIndicatorNumberPath(m.path,m.ovpProp):"";i.createKeysFromText(s,p.title,"Title","card Title","header.title");i.createKeysFromText(s,p.subTitle,"Title","card subTitle","header.subTitle");var P=m&&m.valueColor?j(m.valueColor.path,m.valueColor.ovpProp,true):null;var b=m&&m.indicator?j(m.indicator.path,m.indicator.ovpProp,false):null;var C=m&&m.target?m.target:null;var T=m&&m.deviation?m.deviation:null;var S="",D,O="",V,w=[],I={},M={};if(C&&C.parts.length){S=v.targetDeviationValuePath(C,e.view.getModel("ovpCardProperties"),"targetValueFormatter");D=e.view.getModel("ovpCardProperties").getProperty("/bPercentageAvailableForTarget")?"%":null;if(S){f.updatePropertyValueForObject(M,m.target.text,"title");f.updatePropertyValueForObject(M,S,"number");f.updatePropertyValueForObject(M,D,"unit");w.push(M)}}if(m&&m.ovpProp){V=v.mainIndicatorNumberPath(m.path,m.ovpProp,true)}if(T&&T.parts.length){O=v.targetDeviationValuePath(T,e.view.getModel("ovpCardProperties"),"returnPercentageChange");M={};if(O){f.updatePropertyValueForObject(M,m.deviation.text,"title");f.updatePropertyValueForObject(M,O,"number");w.push(M)}}var x=n.getUoMForSubTitle(s);if(r!=="Default"){I={type:r,title:p.title,subTitle:p.subTitle,details:v.generateDetailsExpression(t,p,s,u)};f.updatePropertyValueForObject(I,x,"unitOfMeasurement");f.updatePropertyValueForObject(I,w,"sideIndicators");if(h){I["mainIndicator"]={};f.updatePropertyValueForObject(I.mainIndicator,h,"number");f.updatePropertyValueForObject(I.mainIndicator,P,"state");f.updatePropertyValueForObject(I.mainIndicator,b,"trend");f.updatePropertyValueForObject(I.mainIndicator,V,"unit")}c=I}else{c={type:r,title:p.title,subTitle:p.subTitle,details:v.generateDetailsExpression(t,p,s,u)}}if(a){c.data={path:o.getBatchRequestPath("/header/d/results/0",g)}}if(c.details){c.type="Numeric"}if(t["type"]==="List"||t["type"]==="Table"){c.status=y.getHeaderStatus(a,g)}return c};var W=function(e,t){var a=e.cardComponentData.settings;var r;switch(t["type"]){case"Analytical":r=n.createChartContent(e,a.chartAnnotationPath,t);r.chartProperties["title"]=r.title;delete r.title;break;case"List":r=h.getListContent(e,t);break;case"Table":r=P.getTableContent(e,t);break;default:r={};break}return r};var z=function(e){var t={},a=e.cardComponentData.cardId;t["extension"]=O;t["type"]=e.cardComponentName;t["configuration"]=q(e);t["data"]=B(e,t);t["header"]=K(e,t,t["data"].request.batch);t["content"]=W(e,t);var r=s.getSemanticDateConfiguration(e)||{};if(Object.keys(r).length){t["configuration"]["parameters"]["_semanticDateRangeSetting"]={value:JSON.stringify(r)}}i.replaceStringsWithKeys(t,a);var n=e.view.getModel("ovpCardProperties");var l=n&&n.getProperty("/bInsightDTEnabled");if(l){o.updateBatchObject(e,t["configuration"],true)}return t};var X=function(e){var t=e.cardComponentData.appComponent.getManifest()["sap.app"],a=t.id,r=e.cardComponentData.settings,n=e.cardComponentData.cardId,o=e.cardComponentData.appComponent.getManifestObject().getRawJson(),s=o["sap.app"].i18n&&o["sap.app"].i18n.bundleUrl||o["sap.app"].i18n,l=o["sap.platform.abap"]&&o["sap.platform.abap"].uri,p=r&&r.selectedKey,d=e.view.getModel("ovpCardProperties"),u=d&&d.getProperty("/bInsightRTEnabled");var c=o["sap.fiori"]&&o["sap.fiori"].registrationIds&&o["sap.fiori"].registrationIds[0]||a,v=p?c+".cards."+n+".tab_"+p:c+".cards."+n;var g=p?"../../../":"../../";V=g+s;if(l){if(l.startsWith("/")){l=l.substring(1)}s=l+"/"+s}if(u){v="user."+v+"."+Date.now()}var f;if(u){f={title:t&&t.title||"",subtitle:t&&(t.subtitle||t.description)||""}}else{f=i.getKeysForAppProperties(t,o,e)}var m=f&&f.title,h=f&&f.subtitle,y=H(e),P={id:v,type:"card",embeddedBy:g,i18n:g+s,tags:{keywords:["Analytical","Card","Line","Sample"]},crossNavigation:J(e,y),dataSources:{}};if(m){P.title=m}if(h){P.subTitle=h}var b=e.cardComponentData.appComponent.getManifest()["sap.ovp"];var C=b.globalFilterModel;var T=e.cardComponentData.appComponent.getManifest()["sap.ui5"].models[C].dataSource;var S=t.dataSources;var D=S[T];var O={},w=[],I="",M;if(D&&D.settings){var x=D.settings.annotations,F;x.length&&x.forEach(function(e){for(var t in S){F=S[e].uri;if(t===e&&F){w.push(t);O[t]=$(F,u,o);break}}});if(D&&D.uri){M=$(D.uri,u,o)}I=D.settings&&D.settings["odataVersion"]}P.dataSources=O;P.dataSources["filterService"]={uri:D&&D.uri,settings:{annotations:w,odataVersion:I?I:"2.0"},type:M&&M.type};return P};var G=function(e){var t=e.cardComponentData.appComponent.getManifest()["sap.app"],a=t.id,r=e.cardComponentData.appComponent.getManifest()["sap.ovp"],n=e.view.getModel("ovpCardProperties"),i=n&&n.getProperty("/bInsightRTEnabled"),o="",s=e.cardComponentData.mainComponent.oGlobalFilter,l=s&&s.getEntityType(),p=e.cardComponentData.mainComponent.getOwnerComponent(),d=p.oOvpConfig.sapUICoreVersionInfo||{};if(!r.globalFilterEntitySet){o=Q(s&&s.getModel(),l)}return{templateName:"OVP",parentAppId:a,filterEntitySet:r.globalFilterEntitySet?r.globalFilterEntitySet:o,cardType:i?"RT":"DT",versions:{ui5:d.version+"-"+d.buildTimestamp}}};var Y=function(e){var t={};t["sap.card"]=z(e);t["sap.app"]=X(e);t["sap.insights"]=G(e);var a=T.getCardActions(e,t["sap.card"]);if(a.header.enabled){t["sap.card"].header.actions=a.header.actions}if(a.content.enabled){switch(e.cardComponentName){case"Analytical":t["sap.card"].content.actions=a.content.actions;break;case"List":t["sap.card"].content.item.actions=a.content.actions;break;case"Table":t["sap.card"].content.row.actions=a.content.actions;break}}s.resetSemanticDateRangeConfig();return t};var Z=function(e,t,a){var r=e["sap.card"]["header"][a];if(r&&r.startsWith("{{")){var n=r.split("{{")[1].split("}}")[0];var i=t.view.getModel("@i18n")||t.view.getModel("i18n");r=i?i.getProperty(n):undefined}return r?r:""};var ee=function(e,t,a,r){r.valueState=t;r.valueStateText=a;e.setValueState(r.valueState);e.setValueStateText(r.valueStateText)};var te={createManifestFor:Y,saveCardManifest:function(e,a){t.create().then(function(t){if(!a){var r=e["sap.app"].id;t.writeManifest(r,e)}})},downloadCardManifest:function(e){},createCard:function(t){var a=Y(t),r=window.location.origin,n=r+"/resources",i=new e({height:"533px",width:"314px",manifest:a,baseUrl:n});return i},UpdateManifestDeltaChanges:function(e,t,a,r){var n={_version:"1.1.0",contentDensities:{compact:true,cozy:true},dependencies:{libs:{"sap.insights":{lazy:false}}}};e["sap.ui5"]=n;if(e["sap.app"]["i18n"]!==V){e["sap.app"]["i18n"]=V}o.enhanceHeaderAndContentURLForSemanticDate(e["sap.card"]);o.enhanceHeaderAndContentURL(e["sap.card"]);var s=t.view.getModel("ovpCardProperties");var l=s&&s.getProperty("/bInsightRTEnabled");var p=s&&s.getProperty("/bInsightDTEnabled");if(p){var d=Z(e,t,"title");var u=Z(e,t,"subTitle");var c=m.byId(a+"--titleTextInput");if(c&&c.getValue()){var v=m.byId(a+"--subTitleTextInput");var g=t.cardComponentData.cardId;if(this.titleChanged&&c.getValue()!==d){i.createKeysFromText(g,c.getValue(),"Title","card Title","header.title");this.titleChanged=false}var f=v.getValue();var h=v&&f&&this.subTitleChanged&&f!==u;if(h){i.createKeysFromText(g,f,"Title","card subTitle","header.subTitle");this.subTitleChanged=false}else if(v&&!f){this.subTitleChanged=false;delete e["sap.card"].header.subTitle}}i.inserti18nKeysManifest(e["sap.card"]);i.writei18nPayload();o.updateBatchObject(t,e["sap.card"]["configuration"],false);if(r==="Create"){this.saveCardManifest(e,l)}else if(r==="Download"){this.downloadCardManifest(e)}i.reseti18nProperties()}else if(l){var y=t.view.getModel("@i18n")||t.view.getModel("i18n");if(e["sap.card"].type==="Analytical"){e["sap.card"]["content"].chartProperties.title.text=i.getI18nValueOrDefaultString(e["sap.card"]["content"].chartProperties.title.text,y)}else if(e["sap.card"].type==="Table"){var P=e["sap.card"].content.row.columns;if(Array.isArray(P)&&P.length){P.forEach(function(e,t){P[t].title=i.getI18nValueOrDefaultString(e.title,y)})}}else if(e["sap.card"].type==="List"){var b=e["sap.card"]["content"];var C=(((b||{}).item||{}).info||{}).value;var T=C&&C.split(",").slice(-1);var S=T&&T[0]&&T[0].split("/")[1];var D=e["sap.card"].configuration.parameters;var O=D[S]&&D[S].value;if(O&&O.startsWith("{{")){D[S].value=y.getProperty(S)}}i.fnReplacei18nKeysWithText(e,y)}},showCard:function(e){var t=e.view.getModel("ovpCardProperties"),a=t&&t.getProperty("/bInsightRTEnabled"),r=t&&t.getProperty("/bInsightDTEnabled"),n=this.createCard(e),o=n.getManifest();if(a){this.UpdateManifestDeltaChanges(o,e);return b.getServiceAsync("UIService").then(function(e){return e.showCardPreview(o).then(function(){return Promise.resolve(o)})}).catch(function(e){C.show(e.message)})}else if(r){return new Promise(function(t,a){var r=l.oResourceModel,s=Z(o,e,"title"),u=Z(o,e,"subTitle"),c={draggable:true,cardTitle:s,cardSubTitle:u,valueState:s?"None":"Error",valueStateText:s?"":l.getText("INT_Preview_Title_ValueStateText")},v=new d({dialogSettings:c}),g=f.getApp().getOwnerComponent(),h=g.createId("integrationCardPreview");this.handleCancel=function(){this.previewDialogPromise.then(function(e){e.close();i.reseti18nProperties();e.destroy();this.titleChanged=false;this.subTitleChanged=false}.bind(this))};this.handleTitleLiveChange=function(e){var t=e.getSource();var a=t.getValue();this.previewDialogPromise.then(function(){if(a&&n.getCardHeader().getTitle()!==a){ee(t,"None","",c);n.getCardHeader().setTitle(a);this.titleChanged=true}else if(!a){this.titleChanged=true;ee(t,"Error",l.getText("INT_Preview_Title_ValueStateText"),c)}else{ee(t,"None","",c)}}.bind(this))};this.handleSubTitleLiveChange=function(e){var t=e.getSource();var a=t.getValue();this.previewDialogPromise.then(function(){if(n.getCardHeader().getSubtitle()!==a){n.getCardHeader().setSubtitle(a);this.subTitleChanged=true}}.bind(this))};this.confirmActionHandler=function(){var a=m.byId(h+"--titleTextInput");var r=a&&a.getValue()&&a.getValue().trim();if(r.length===0){ee(a,"Error",l.getText("INT_Preview_Title_ValueStateText"),c);a.focus()}else{this.previewDialogPromise.then(function(a){this.UpdateManifestDeltaChanges(o,e,h,"Create");a.close();a.destroy();t(o)}.bind(this))}};this.downloadCardManifestHandler=function(){this.previewDialogPromise.then(function(a){this.UpdateManifestDeltaChanges(o,e,h,"Download");a.close();a.destroy();t(o)}.bind(this))};this.previewDialogPromise=p.load({id:h,type:"XML",name:"sap.ovp.cards.Integration.Preview",controller:this}).then(function(t){t.setModel(v);t.setModel(e.view.getModel("i18n"),"i18n");t.setModel(r,"ovpResourceModel");var a=m.byId(h+"--subFlexBoxNew");a.addItem(n);this.titleChanged=false;this.subTitleChanged=false;if(e.cardComponentName!=="Analytical"){m.byId(h+"--ovpIntPreviewOverflowLayer").setVisible(true)}t.open();return t}.bind(this)).catch(function(e){D.error("Integration card preview fragment failed to load, "+e)})}.bind(this))}},getFilterDetails:H};return te},true);
//# sourceMappingURL=IntegrationCard.js.map