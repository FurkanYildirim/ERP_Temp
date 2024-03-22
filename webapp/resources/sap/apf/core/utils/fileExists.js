/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/core/utils/checkForTimeout","sap/ui/model/odata/ODataUtils","sap/ui/thirdparty/jquery"],function(e,t,jQuery){"use strict";var a=function(a){var i={};var s=a&&a.functions&&a.functions.ajax;var n=a&&a.functions&&a.functions.getSapSystem&&a.functions.getSapSystem();this.check=function(a,r){if(n&&!r){a=t.setOrigin(a,{force:true,alias:n})}if(i[a]!==undefined){return i[a]}var u=false;var f={url:a,type:"HEAD",success:function(t,a,i){var s=e(i);if(s===undefined){u=true}else{u=false}},error:function(){u=false},async:false};if(s){s(f)}else{jQuery.ajax(f)}i[a]=u;return u}};sap.apf.core.utils.FileExists=a;return a},true);
//# sourceMappingURL=fileExists.js.map