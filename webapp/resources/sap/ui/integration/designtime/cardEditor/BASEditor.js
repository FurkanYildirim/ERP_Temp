/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/restricted/_CancelablePromise","sap/base/util/restricted/_isEqual","sap/base/util/restricted/_omit","sap/base/util/merge","sap/base/util/deepClone","sap/base/util/deepEqual","sap/base/util/ObjectPath","./CardEditor","sap/ui/integration/designtime/baseEditor/BaseEditor","sap/ui/integration/Designtime","sap/ui/integration/util/CardMerger","sap/base/util/LoaderExtensions","sap/base/Log"],function(e,t,i,a,n,s,r,o,f,l,u,g,p){"use strict";var m="";m=g.loadResource("sap/ui/integration/designtime/cardEditor/ConfigurationTemplate.js",{dataType:"text",failOnError:false,async:false});function c(e,t){t=t||0;var i="\n";var a="\n\t";for(var n=0;n<t;n++){a+="\t";i+="\t"}if(!e){return""}var r=Array.isArray(e);var o=[];var f=function(e){if(s(e,{})){return"{}"}if(typeof e==="object"&&e!==null){return c(e,t+1)}if(typeof e==="function"){return e.toString()}if(typeof e==="string"){return'"'+e+'"'}if(typeof e==="undefined"){return undefined}return e};for(var n in e){var l=f(e[n]);if(typeof l!=="undefined"){if(!r){l='"'+n+'": '+l}o.push(l)}}var u=o.join(","+a);if(r){u="["+a+u+i+"]"}else{u="{"+a+u+i+"}"}return u}var d=o.extend("sap.ui.integration.designtime.cardEditor.BASEditor",{metadata:{library:"sap.ui.integration",events:{configurationChange:{},createConfiguration:{},error:{},designtimeInited:{}}},renderer:o.getMetadata().getRenderer()});d.prototype.getManifest=function(){return this._oCurrent.manifest};d.prototype.getConfigurationClass=function(){return this._oCurrent.configurationclass};d.prototype.getConfiguration=function(){return this._oCurrent.configuration};d.prototype.getConfigurationString=function(){return this._oCurrent.configurationstring};d.prototype._generateDesigntimeJSConfig=function(){var e=this._formatExportedDesigntimeMetadata(this.getDesigntimeMetadata());var i=this.getJson();if(this._eventTimeout){clearTimeout(this._eventTimeout);this._eventTimeout=null}this._eventTimeout=setTimeout(function(){var n={form:{items:{}}};var o=a(n,this._oDesigntimeJSConfig);var f={};var u=[];var g;if(!r.get(["sap.card","configuration"],i)){r.set(["sap.card","configuration"],{parameters:{}},i)}else if(!r.get(["sap.card","configuration","parameters"],i)){r.set(["sap.card","configuration","parameters"],{},i)}var p=r.get(["sap.card","configuration","parameters"],i);var m={};var c={};if(i){var d=r.get(["sap.card","configuration","parameters"],this._oDesigntimeMetadataModel.getData());if(s(p,{})&&!d){this._oDesigntimeJSConfig.form.items={};this._oCurrent={configuration:this._cleanConfig(this._oDesigntimeJSConfig),manifest:this._cleanJson(),configurationclass:this._fnDesigntime,configurationstring:this._cleanConfig(this._oDesigntimeJSConfig,true)};this.fireConfigurationChange(this._oCurrent);return}var h=Object.keys(p);for(var v in o.form.items){g=a({},o.form.items[v]);if(!p[v]){if(d[v]){if(g.type==="group"||g.type==="separator"){p[v]={}}else if(g.manifestpath&&!g.manifestpath.startsWith("/sap.card/configuration/parameters")){var _=g.manifestpath;if(_.startsWith("/")){_=_.substring(1)}var y=r.get(_.split("/"),i)||"";p[v]={value:y}}}else{delete o.form.items[v];continue}}else if(g.manifestpath&&!g.manifestpath.startsWith("/sap.card/configuration/parameters")){var _=g.manifestpath;if(_.startsWith("/")){_=_.substring(1)}var C=_.split("/");var y=r.get(C,i);var b=r.get(C,this._oInitialJson);if(!t(y,b)){p[v].value=y}else{r.set(C,p[v].value,i)}}var D=h.indexOf(v);if(D>-1){h.splice(D,1)}if(p[v].visualization){m[v]=p[v].visualization}if(p[v].values){c[v]=p[v].values}o.form.items[v]=a(g,p[v]);if(!d[v].__value.visualization){delete o.form.items[v].visualization}else if(m[v]){o.form.items[v].visualization=m[v];delete m[v]}if(!d[v].__value.values){delete o.form.items[v].values}else if(c[v]){o.form.items[v].values=c[v];delete c[v]}if(g.type==="group"||g.type==="separator"){delete o.form.items[v].manifestpath}else if(!o.form.items[v].manifestpath){d[v].manifestpath="/sap.card/configuration/parameters/"+v+"/value";d[v].__value.manifestpath="/sap.card/configuration/parameters/"+v+"/value";o.form.items[v].manifestpath="/sap.card/configuration/parameters/"+v+"/value"}}if(h.length>0){for(var J=0;J<h.length;J++){var S=h[J];var I=p[S];var E="string";if(I.type){E=I.type}else if(d[S]&&d[S].__value){E=d[S].__value.type}o.form.items[S]={manifestpath:"/sap.card/configuration/parameters/"+S+"/value",type:E,label:I.label,translatable:false,editable:I.editable,visible:I.visible}}p[S]=a(o.form.items[S],p[S])}}if(e){if(o){for(var v in e){var z=e[v];var M=v.substring(v.lastIndexOf("/")+1);if(!v.startsWith("sap.card/configuration/parameters")){continue}var j=o.form.items[M]||{};if(j.visualization){m[v]=j.visualization}if(j.values){c[v]=j.values}g=a(j,p[M]);if(z.hasOwnProperty("label")){g.label=z.label}if(z.hasOwnProperty("position")){g.position=z.position}if(g.editable==="false"){g.editable=false}else if(g.editable==="true"){g.editable=false}if(g.visible==="false"){g.visible=false}else if(g.visible==="true"){g.visible=false}if(g.type==="group"||g.type==="separator"){delete g.manifestpath}if(m[M]){g.visualization=m[M];delete m[M]}if(c[M]){g.values=c[M];delete c[M]}g.__key=M;u[g.position]=g}for(var J=0;J<u.length;J++){g=u[J];if(!g){continue}f[g.__key]=g;delete g.__key;delete g.position}o.form.items=f}}this._oDesigntimeJSConfig=o;var T=this._cleanConfig(this._oDesigntimeJSConfig);this._fnDesigntime=function(e){return new l(e)}.bind(this,T);this._oCurrent={configuration:T,manifest:this._cleanJson(i),configurationclass:this._fnDesigntime,configurationstring:this._cleanConfig(this._oDesigntimeJSConfig,true)};this._oDataModel.setData(this._prepareData(i));this.fireConfigurationChange(this._oCurrent);this._oInitialJson=i}.bind(this),500)};d.prototype.init=function(){o.prototype.init.apply(this,arguments);this._oCurrent={configuration:null,manifest:null,configurationclass:null}};d.prototype._applyDefaultValue=function(e){if(e.value===undefined||e.value===null){switch(e.type){case"boolean":e.value=false;break;case"integer":case"number":e.value=0;break;case"string[]":e.value=[];break;default:e.value=""}}};d.prototype.getJson=function(e){if(e===true){return this._cleanJson()}else{return f.prototype.getJson.apply(this,arguments)}};d.prototype._cleanJson=function(e,t){e=e||this.getJson();var i=v(r.get(["sap.card","configuration","editor"],e)||"");if(i===""){i=v(r.get(["sap.card","designtime"],e)||"")}if(!i){r.set(["sap.card","designtime"],"sap/ui/integration/designtime/cardEditor/ConfigurationTemplate",e)}e=n(e);var t=t!==false;if(t){var a=r.get(["sap.card","configuration","parameters"],e);for(var s in a){var o=a[s];if(o&&(o.type==="group"||o.type==="separator")){delete a[s];continue}if(this._oDesigntimeJSConfig&&this._oDesigntimeJSConfig.form&&this._oDesigntimeJSConfig.form.items){var f=this._oDesigntimeJSConfig.form.items[s]||{};if(f.type==="group"||f.type==="separator"){delete a[s];continue}if(f.manifestpath&&!f.manifestpath.startsWith("/sap.card/configuration/parameters")){var l=f.manifestpath;if(l.startsWith("/")){l=l.substring(1)}if(f.type==="simpleicon"){f.type="string"}if(f.type==="string[]"){f.type="array"}r.set(l.split("/"),f.value,e);delete a[s];continue}}a[s]={value:a[s].value}}}if(this._i18n){r.set(["sap.app","i18n"],this._i18n,e)}return e};d.prototype._cleanConfig=function(e,t){var i=a({},e);for(var n in i.form.items){var s=i.form.items[n];if(s.type==="simpleicon"){if(!s.visualization){s.visualization={type:"IconSelect",settings:{value:"{currentSettings>value}",editable:"{currentSettings>editable}"}}}s.type="string"}if(s.type==="array"){s.type="string[]"}if(s.type==="objectArray"){s.type="object[]"}if(s.type!=="string[]"&&s.type!="string"&&s.type!=="object[]"&&s.type!="object"){delete s.values}delete s.value}if(t){var r=c(i);r=r.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g,function(e){return e.substring(3,e.length-3)});return r}return i};d.prototype._generateMetadataFromJSConfig=function(e){var t={};if(e){this._oDesigntimeJSConfig=a(this._oDesigntimeJSConfig,e)}if(this._oDesigntimeJSConfig){var i=this._oDesigntimeJSConfig.form.items;var n=0;for(var s in i){var o="sap.card/configuration/parameters/"+s,f=o.split("/"),l;t[o]=a({},i[s]);l=t[o];l.position=n++;if(l.visualization){if(l.visualization.type==="IconSelect"){l.type="simpleicon"}}if(l.type==="string[]"){l.type="array"}if(l.manifestpath&&(!l.manifestpath.startsWith("/sap.card/configuration/parameters/")||!r.get(f,this._oInitialJson))){r.set(f,l,this._oInitialJson)}if(!l.hasOwnProperty("type")){this.fireError({name:"Designtime Error",detail:{message:"Type of parameter "+s+" not exist"}})}else if(l.type===""){this.fireError({name:"Designtime Error",detail:{message:"Type of parameter "+s+" is Invalid"}})}if(l.type!=="group"&&l.type!=="separator"){if(!l.hasOwnProperty("value")){var u=l.manifestpath.substring(1).split("/"),g=r.get(u,this._oInitialJson);if(g!==undefined){l.value=g}else{this._applyDefaultValue(l)}}else{this._applyDefaultValue(l)}if(r.get(f,this._oInitialJson)){if(r.get(f,this._oInitialJson).value===undefined){r.get(f,this._oInitialJson).value=l.value}}}}}return t};d.prototype.setJson=function(t){if(!this._i18n){this._i18n=r.get(["sap.app","i18n"],t)}f.prototype.setJson.apply(this,arguments);if(!this.__generateDesigntimeJSConfigAttached){this.attachDesigntimeMetadataChange(this._generateDesigntimeJSConfig.bind(this));this.attachJsonChange(this._generateDesigntimeJSConfig.bind(this));this.__generateDesigntimeJSConfigAttached=true}var t=this.getJson();var i=r.get(["sap.app","id"],t);if(this._bDesigntimeInit&&this._bCardId!==i){if(this._oDesigntimePromise){this._oDesigntimePromise.cancel()}delete this._bCardId;delete this._bDesigntimeInit}if(!this._bDesigntimeInit){this.setPreventInitialization(true);this._bCardId=i;var a;var n=v(r.get(["sap.card","configuration","editor"],t)||"");if(n===""){n=v(r.get(["sap.card","designtime"],t)||"")}if(!n){var s=m;r.set(["sap.card","designtime"],"sap/ui/integration/designtime/cardEditor/ConfigurationTemplate",t);a="sap/ui/integration/designtime/cardEditor/ConfigurationTemplate";this.fireCreateConfiguration({file:"sap/ui/integration/designtime/cardEditor/ConfigurationTemplate.js",content:s,manifest:this._cleanJson(t,false)});return}var o=v(this.getBaseUrl()||""),l={},g=null,c=null,d=null,y=null;if(n&&n.indexOf("cardEditor/ConfigurationTemplate")>0){a=n;c=_(n);d=i.replace(/\./g,"/")+"/"+c;l[d]=c;l[d+"js"]=c.substring(0,c.lastIndexOf("/"));y=c.replace(l[d+"js"]+"/","")}else if(o&&n){g=v(o);c=_(n);var C=g+"/"+c;d=i.replace(/\./g,"/")+"/"+c;l[d]=C;l[d+"js"]=C.substring(0,C.lastIndexOf("/"));y=C.replace(l[d+"js"]+"/","")}if(o&&n){sap.ui.loader.config({paths:l});var b=this;this._oDesigntimePromise=new e(function(e){var t=d+"js"+"/"+y+".js";if(a){t=a+".js"}sap.ui.loader._.loadJSResourceAsync(t).then(function(t){if(!t){b.fireError({name:"Designtime Error",detail:{message:"Invalid file format"}})}else if(t){var i=new t;b._oDesigntimeJSConfig=i.getSettings();b._fnDesigntime=t;var a=b._generateMetadataFromJSConfig();t=i.getMetadata().getClass();e(a)}}).catch(function(e){p.error(e);b.fireError({name:"Designtime Error",detail:e})})});this._oDesigntimePromise.then(function(e){this.setPreventInitialization(false);var t=e;t=u.mergeCardDesigntimeMetadata(t,this.getDesigntimeChanges());this._oInitialDesigntimeMetadata=t;this.setDesigntimeMetadata(h(t),true);this._bDesigntimeInit=true;this.fireDesigntimeInited()}.bind(this))}else{this.setPreventInitialization(false)}}};d.prototype.initialize=function(){if(!this._bDesigntimeInit){this.attachEventOnce("designtimeInited",this.initialize);return}if(!this._bPreventInitialization){this._initialize()}};d.prototype.getConfigurationTemplate=function(){return m};d.prototype.updateDesigntimeMetadata=function(e,t){var i=this._generateMetadataFromJSConfig(e);this._oInitialDesigntimeMetadata=i;this.setDesigntimeMetadata(h(i),t)};d.prototype.setDestinations=function(e){if(Array.isArray(e)&&e.length>0){var t={properties:{destinations:{allowedValues:e}}};this.addConfig(t)}};function h(e){var t={};Object.keys(e).forEach(function(i){r.set(i.split("/"),{__value:n(e[i])},t)});return t}function v(e){return e.trim().replace(/\/*$/,"")}function _(e){return e.replace(/^\.\//,"")}return d});
//# sourceMappingURL=BASEditor.js.map