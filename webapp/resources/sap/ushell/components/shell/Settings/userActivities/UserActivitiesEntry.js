// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/XMLView","sap/base/Log","sap/ushell/resources"],function(e,t,i){"use strict";function n(){var n="userActivitiesSetting",r="sap.ushell.components.shell.Settings.userActivities.UserActivitiesSetting",s;return{id:"userActivitiesEntry",entryHelpID:"userActivitiesEntry",title:i.i18n.getText("userActivities"),valueResult:null,contentResult:null,icon:"sap-icon://laptop",valueArgument:null,groupingEnablement:true,groupingId:"userActivities",groupingTabHelpId:"userActivitiesEntryTab",groupingTabTitle:i.i18n.getText("userActivitiesTabName"),contentFunc:function(){return e.create({id:n,viewName:r}).then(function(e){s=e;return e})},onSave:function(){if(s){return s.getController().onSave()}t.warning("Save operation for user account settings was not executed, because the userActivities view was not initialized");return Promise.resolve()},onCancel:function(){if(s){s.getController().onCancel();return}t.warning("Cancel operation for user account settings was not executed, because the userActivities view was not initialized")}}}return{getEntry:n}});
//# sourceMappingURL=UserActivitiesEntry.js.map