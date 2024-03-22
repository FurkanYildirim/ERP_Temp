// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/util/extend","sap/ui/core/Configuration","sap/ui/Device","sap/ui/model/json/JSONModel","sap/ushell/Config"],function(e,n,i,t,s){"use strict";var o;function a(){var a=s.last("/core");var l={groups:[],rtl:n.getRTL(),personalization:a.shell.enablePersonalization,tagList:[],selectedTags:[],userPreferences:{entries:[]},enableHelp:a.extension.enableHelp,enableTileActionsIcon:i.system.desktop?a.home.enableTileActionsIcon:false};l=e({},a.catalog,a.home,l);o=new t(l);o.setSizeLimit(1e4)}function l(e){o.setProperty("/isPhoneWidth",!e.matches)}function r(){var e=window.matchMedia("(min-width: 800px)");if(e.addListener){e.addListener(l);l(e)}}return{getModel:function(){if(!o){a();r()}return o},_resetModel:function(){if(o!=undefined){o.destroy();o=undefined}}}},false);
//# sourceMappingURL=common.load.model.js.map