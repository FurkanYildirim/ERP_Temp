// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell_abap/pbServices/ui2/Chip","sap/ushell_abap/pbServices/ui2/Error"],function(n,i){"use strict";n.addContract("configurationUi",function(n){var t,e,o,u=false,f,c,r;this.attachCancel=function(n){if(typeof n!=="function"){throw new i("Cancel event handler is not a function","chip.configurationUi")}t=n};this.attachSave=function(n){if(typeof n!=="function"){throw new i("Save event handler is not a function","chip.configurationUi")}f=n};this.display=function(){if(e){e()}};this.isEnabled=function(){return u};this.isReadOnly=function(){return n.isReadOnly()};this.setDirtyProvider=function(n){o=n};this.setUiProvider=function(n){c=n};this.setAsyncUiProvider=function(n){r=n};return{attachDisplay:function(n){if(typeof n!=="function"){throw new i("Display event handler is not a function","ChipInstance")}e=n},fireCancel:function(){if(t){t()}},fireSave:function(){return f?f():undefined},getUi:function(n){return c?c(n):undefined},getUiAsync:function(n){return r?r(n):undefined},isDirty:function(){return o?o():undefined},setEnabled:function(n){u=n}}})});
//# sourceMappingURL=configurationUi.js.map