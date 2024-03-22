/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Component", "sap/ui/core/Core"], function (Component, Core) {
  "use strict";

  var _exports = {};
  let UserStatus;
  (function (UserStatus) {
    UserStatus[UserStatus["NotYetInvited"] = 0] = "NotYetInvited";
    UserStatus[UserStatus["NoChangesMade"] = 1] = "NoChangesMade";
    UserStatus[UserStatus["ChangesMade"] = 2] = "ChangesMade";
    UserStatus[UserStatus["CurrentlyEditing"] = 3] = "CurrentlyEditing";
  })(UserStatus || (UserStatus = {}));
  _exports.UserStatus = UserStatus;
  let UserEditingState;
  (function (UserEditingState) {
    UserEditingState["NoChanges"] = "N";
    UserEditingState["InProgress"] = "P";
  })(UserEditingState || (UserEditingState = {}));
  _exports.UserEditingState = UserEditingState;
  let Activity;
  (function (Activity) {
    Activity["Join"] = "JOIN";
    Activity["JoinEcho"] = "JOINECHO";
    Activity["Leave"] = "LEAVE";
    Activity["Change"] = "CHANGE";
    Activity["Create"] = "CREATE";
    Activity["Delete"] = "DELETE";
    Activity["Action"] = "ACTION";
    Activity["LiveChange"] = "LIVECHANGE";
    Activity["Activate"] = "ACTIVATE";
    Activity["Discard"] = "DISCARD";
    Activity["Undo"] = "UNDO";
  })(Activity || (Activity = {}));
  _exports.Activity = Activity;
  function formatInitials(fullName) {
    // remove titles - those are the ones from S/4 to be checked if there are others
    const academicTitles = ["Dr.", "Prof.", "Prof. Dr.", "B.A.", "MBA", "Ph.D."];
    academicTitles.forEach(function (academicTitle) {
      fullName = fullName.replace(academicTitle, "");
    });
    let initials;
    const parts = fullName.trimStart().split(" ");
    if (parts.length > 1) {
      var _parts$shift, _parts$pop;
      initials = ((parts === null || parts === void 0 ? void 0 : (_parts$shift = parts.shift()) === null || _parts$shift === void 0 ? void 0 : _parts$shift.charAt(0)) || "") + ((_parts$pop = parts.pop()) === null || _parts$pop === void 0 ? void 0 : _parts$pop.charAt(0));
    } else {
      initials = fullName.substring(0, 2);
    }
    return initials.toUpperCase();
  }
  function getUserColor(UserID, activeUsers, invitedUsers) {
    // search if user is known
    const user = activeUsers.find(u => u.id === UserID);
    if (user) {
      return user.color;
    } else {
      // search for next free color
      for (let i = 1; i <= 10; i++) {
        if (activeUsers.findIndex(u => u.color === i) === -1 && invitedUsers.findIndex(u => u.color === i) === -1) {
          return i;
        }
      }
      // this seems to be a popular object :) for now just return 10 for all.
      // for invited we should start from 1 again so the colors are different
      return 10;
    }
  }

  // copied from CommonUtils. Due to a cycle dependency I can't use CommonUtils here.
  // That's to be fixed. the discard popover thingy shouldn't be in the common utils at all
  function getAppComponent(oControl) {
    if (oControl.isA("sap.fe.core.AppComponent")) {
      return oControl;
    }
    const oOwner = Component.getOwnerComponentFor(oControl);
    if (!oOwner) {
      return oControl;
    } else {
      return getAppComponent(oOwner);
    }
  }
  function getMe(view) {
    const shellServiceHelper = getAppComponent(view).getShellServices();
    if (!shellServiceHelper || !shellServiceHelper.hasUShell()) {
      throw "No Shell... No User";
    }
    return {
      initials: shellServiceHelper.getUser().getInitials(),
      id: shellServiceHelper.getUser().getId(),
      name: `${shellServiceHelper.getUser().getFullName()} (${getText("C_COLLABORATIONDRAFT_YOU")})`,
      initialName: shellServiceHelper.getUser().getFullName(),
      color: 6,
      //  same color as FLP...
      me: true,
      status: UserStatus.CurrentlyEditing
    };
  }
  function getText(textId) {
    const oResourceModel = Core.getLibraryResourceBundle("sap.fe.core");
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    return oResourceModel.getText(textId, args);
  }
  _exports.getText = getText;
  const CollaborationUtils = {
    formatInitials: formatInitials,
    getUserColor: getUserColor,
    getMe: getMe,
    getAppComponent: getAppComponent,
    getText: getText
  };
  _exports.CollaborationUtils = CollaborationUtils;
  function shareObject(bindingContext) {
    let users = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    const model = bindingContext.getModel();
    const metaModel = model.getMetaModel();
    const entitySet = metaModel.getMetaPath(bindingContext);
    const shareActionName = metaModel.getObject(`${entitySet}@com.sap.vocabularies.Common.v1.DraftRoot/ShareAction`);
    const shareAction = model.bindContext(`${shareActionName}(...)`, bindingContext);
    shareAction.setParameter("Users", users);
    shareAction.setParameter("ShareAll", true);
    return shareAction.execute();
  }
  _exports.shareObject = shareObject;
  function getActivityKeyFromPath(path) {
    return path.substring(path.lastIndexOf("(") + 1, path.lastIndexOf(")"));
  }
  _exports.getActivityKeyFromPath = getActivityKeyFromPath;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVc2VyU3RhdHVzIiwiVXNlckVkaXRpbmdTdGF0ZSIsIkFjdGl2aXR5IiwiZm9ybWF0SW5pdGlhbHMiLCJmdWxsTmFtZSIsImFjYWRlbWljVGl0bGVzIiwiZm9yRWFjaCIsImFjYWRlbWljVGl0bGUiLCJyZXBsYWNlIiwiaW5pdGlhbHMiLCJwYXJ0cyIsInRyaW1TdGFydCIsInNwbGl0IiwibGVuZ3RoIiwic2hpZnQiLCJjaGFyQXQiLCJwb3AiLCJzdWJzdHJpbmciLCJ0b1VwcGVyQ2FzZSIsImdldFVzZXJDb2xvciIsIlVzZXJJRCIsImFjdGl2ZVVzZXJzIiwiaW52aXRlZFVzZXJzIiwidXNlciIsImZpbmQiLCJ1IiwiaWQiLCJjb2xvciIsImkiLCJmaW5kSW5kZXgiLCJnZXRBcHBDb21wb25lbnQiLCJvQ29udHJvbCIsImlzQSIsIm9Pd25lciIsIkNvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwiZ2V0TWUiLCJ2aWV3Iiwic2hlbGxTZXJ2aWNlSGVscGVyIiwiZ2V0U2hlbGxTZXJ2aWNlcyIsImhhc1VTaGVsbCIsImdldFVzZXIiLCJnZXRJbml0aWFscyIsImdldElkIiwibmFtZSIsImdldEZ1bGxOYW1lIiwiZ2V0VGV4dCIsImluaXRpYWxOYW1lIiwibWUiLCJzdGF0dXMiLCJDdXJyZW50bHlFZGl0aW5nIiwidGV4dElkIiwib1Jlc291cmNlTW9kZWwiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiYXJncyIsIkNvbGxhYm9yYXRpb25VdGlscyIsInNoYXJlT2JqZWN0IiwiYmluZGluZ0NvbnRleHQiLCJ1c2VycyIsIm1vZGVsIiwiZ2V0TW9kZWwiLCJtZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJlbnRpdHlTZXQiLCJnZXRNZXRhUGF0aCIsInNoYXJlQWN0aW9uTmFtZSIsImdldE9iamVjdCIsInNoYXJlQWN0aW9uIiwiYmluZENvbnRleHQiLCJzZXRQYXJhbWV0ZXIiLCJleGVjdXRlIiwiZ2V0QWN0aXZpdHlLZXlGcm9tUGF0aCIsInBhdGgiLCJsYXN0SW5kZXhPZiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ29sbGFib3JhdGlvbkNvbW1vbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuXG5leHBvcnQgZW51bSBVc2VyU3RhdHVzIHtcblx0Tm90WWV0SW52aXRlZCA9IDAsXG5cdE5vQ2hhbmdlc01hZGUgPSAxLFxuXHRDaGFuZ2VzTWFkZSA9IDIsXG5cdEN1cnJlbnRseUVkaXRpbmcgPSAzXG59XG5cbmV4cG9ydCBlbnVtIFVzZXJFZGl0aW5nU3RhdGUge1xuXHROb0NoYW5nZXMgPSBcIk5cIixcblx0SW5Qcm9ncmVzcyA9IFwiUFwiXG59XG5cbmV4cG9ydCB0eXBlIFVzZXIgPSB7XG5cdGlkOiBzdHJpbmc7XG5cdGluaXRpYWxzPzogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cdGNvbG9yPzogbnVtYmVyO1xuXHR0cmFuc2llbnQ/OiBib29sZWFuO1xuXHRzdGF0dXM/OiBVc2VyU3RhdHVzO1xuXHRtZT86IGJvb2xlYW47XG5cdGluaXRpYWxOYW1lPzogc3RyaW5nO1xufTtcblxuLy8gYmFja2VuZCByZXByZXNlbnRhdGlvbiBvZiBhIHVzZXIgYWNjb3JkaW5nIHRvIGNvbGxhYm9yYXRpb24gZHJhZnQgc3BlY1xuZXhwb3J0IHR5cGUgQmFja2VuZFVzZXIgPSB7XG5cdFVzZXJJRDogc3RyaW5nO1xuXHRVc2VyQWNjZXNzUm9sZTogc3RyaW5nO1xuXHRVc2VyRWRpdGluZ1N0YXRlPzogVXNlckVkaXRpbmdTdGF0ZTtcblx0VXNlckRlc2NyaXB0aW9uPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgVXNlckFjdGl2aXR5ID0gVXNlciAmIHtcblx0a2V5Pzogc3RyaW5nO1xufTtcblxuZXhwb3J0IGVudW0gQWN0aXZpdHkge1xuXHRKb2luID0gXCJKT0lOXCIsXG5cdEpvaW5FY2hvID0gXCJKT0lORUNIT1wiLFxuXHRMZWF2ZSA9IFwiTEVBVkVcIixcblx0Q2hhbmdlID0gXCJDSEFOR0VcIixcblx0Q3JlYXRlID0gXCJDUkVBVEVcIixcblx0RGVsZXRlID0gXCJERUxFVEVcIixcblx0QWN0aW9uID0gXCJBQ1RJT05cIixcblx0TGl2ZUNoYW5nZSA9IFwiTElWRUNIQU5HRVwiLFxuXHRBY3RpdmF0ZSA9IFwiQUNUSVZBVEVcIixcblx0RGlzY2FyZCA9IFwiRElTQ0FSRFwiLFxuXHRVbmRvID0gXCJVTkRPXCJcbn1cblxuZXhwb3J0IHR5cGUgTWVzc2FnZSA9IHtcblx0dXNlckRlc2NyaXB0aW9uOiBzdHJpbmc7XG5cdHVzZXJJRDogc3RyaW5nO1xuXHR1c2VyQWN0aW9uOiBzdHJpbmc7XG5cdGNsaWVudEFjdGlvbjogc3RyaW5nO1xuXHRjbGllbnRUcmlnZ2VyZWRBY3Rpb25OYW1lPzogc3RyaW5nO1xuXHRjbGllbnRSZWZyZXNoTGlzdEJpbmRpbmc/OiBzdHJpbmc7XG5cdGNsaWVudFJlcXVlc3RlZFByb3BlcnRpZXM/OiBzdHJpbmc7XG5cdGNsaWVudENvbnRlbnQ6IHN0cmluZztcbn07XG5cbmZ1bmN0aW9uIGZvcm1hdEluaXRpYWxzKGZ1bGxOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuXHQvLyByZW1vdmUgdGl0bGVzIC0gdGhvc2UgYXJlIHRoZSBvbmVzIGZyb20gUy80IHRvIGJlIGNoZWNrZWQgaWYgdGhlcmUgYXJlIG90aGVyc1xuXHRjb25zdCBhY2FkZW1pY1RpdGxlcyA9IFtcIkRyLlwiLCBcIlByb2YuXCIsIFwiUHJvZi4gRHIuXCIsIFwiQi5BLlwiLCBcIk1CQVwiLCBcIlBoLkQuXCJdO1xuXHRhY2FkZW1pY1RpdGxlcy5mb3JFYWNoKGZ1bmN0aW9uIChhY2FkZW1pY1RpdGxlKSB7XG5cdFx0ZnVsbE5hbWUgPSBmdWxsTmFtZS5yZXBsYWNlKGFjYWRlbWljVGl0bGUsIFwiXCIpO1xuXHR9KTtcblxuXHRsZXQgaW5pdGlhbHM6IHN0cmluZztcblx0Y29uc3QgcGFydHMgPSBmdWxsTmFtZS50cmltU3RhcnQoKS5zcGxpdChcIiBcIik7XG5cblx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRpbml0aWFscyA9IChwYXJ0cz8uc2hpZnQoKT8uY2hhckF0KDApIHx8IFwiXCIpICsgcGFydHMucG9wKCk/LmNoYXJBdCgwKTtcblx0fSBlbHNlIHtcblx0XHRpbml0aWFscyA9IGZ1bGxOYW1lLnN1YnN0cmluZygwLCAyKTtcblx0fVxuXG5cdHJldHVybiBpbml0aWFscy50b1VwcGVyQ2FzZSgpO1xufVxuXG5mdW5jdGlvbiBnZXRVc2VyQ29sb3IoVXNlcklEOiBzdHJpbmcsIGFjdGl2ZVVzZXJzOiBVc2VyW10sIGludml0ZWRVc2VyczogVXNlcltdKSB7XG5cdC8vIHNlYXJjaCBpZiB1c2VyIGlzIGtub3duXG5cdGNvbnN0IHVzZXIgPSBhY3RpdmVVc2Vycy5maW5kKCh1KSA9PiB1LmlkID09PSBVc2VySUQpO1xuXHRpZiAodXNlcikge1xuXHRcdHJldHVybiB1c2VyLmNvbG9yO1xuXHR9IGVsc2Uge1xuXHRcdC8vIHNlYXJjaCBmb3IgbmV4dCBmcmVlIGNvbG9yXG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPD0gMTA7IGkrKykge1xuXHRcdFx0aWYgKGFjdGl2ZVVzZXJzLmZpbmRJbmRleCgodSkgPT4gdS5jb2xvciA9PT0gaSkgPT09IC0xICYmIGludml0ZWRVc2Vycy5maW5kSW5kZXgoKHUpID0+IHUuY29sb3IgPT09IGkpID09PSAtMSkge1xuXHRcdFx0XHRyZXR1cm4gaTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gdGhpcyBzZWVtcyB0byBiZSBhIHBvcHVsYXIgb2JqZWN0IDopIGZvciBub3cganVzdCByZXR1cm4gMTAgZm9yIGFsbC5cblx0XHQvLyBmb3IgaW52aXRlZCB3ZSBzaG91bGQgc3RhcnQgZnJvbSAxIGFnYWluIHNvIHRoZSBjb2xvcnMgYXJlIGRpZmZlcmVudFxuXHRcdHJldHVybiAxMDtcblx0fVxufVxuXG4vLyBjb3BpZWQgZnJvbSBDb21tb25VdGlscy4gRHVlIHRvIGEgY3ljbGUgZGVwZW5kZW5jeSBJIGNhbid0IHVzZSBDb21tb25VdGlscyBoZXJlLlxuLy8gVGhhdCdzIHRvIGJlIGZpeGVkLiB0aGUgZGlzY2FyZCBwb3BvdmVyIHRoaW5neSBzaG91bGRuJ3QgYmUgaW4gdGhlIGNvbW1vbiB1dGlscyBhdCBhbGxcbmZ1bmN0aW9uIGdldEFwcENvbXBvbmVudChvQ29udHJvbDogYW55KTogQXBwQ29tcG9uZW50IHtcblx0aWYgKG9Db250cm9sLmlzQShcInNhcC5mZS5jb3JlLkFwcENvbXBvbmVudFwiKSkge1xuXHRcdHJldHVybiBvQ29udHJvbDtcblx0fVxuXHRjb25zdCBvT3duZXIgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob0NvbnRyb2wpO1xuXHRpZiAoIW9Pd25lcikge1xuXHRcdHJldHVybiBvQ29udHJvbDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZ2V0QXBwQ29tcG9uZW50KG9Pd25lcik7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0TWUodmlldzogVmlldyk6IFVzZXIge1xuXHRjb25zdCBzaGVsbFNlcnZpY2VIZWxwZXIgPSBnZXRBcHBDb21wb25lbnQodmlldykuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRpZiAoIXNoZWxsU2VydmljZUhlbHBlciB8fCAhc2hlbGxTZXJ2aWNlSGVscGVyLmhhc1VTaGVsbCgpKSB7XG5cdFx0dGhyb3cgXCJObyBTaGVsbC4uLiBObyBVc2VyXCI7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRpbml0aWFsczogc2hlbGxTZXJ2aWNlSGVscGVyLmdldFVzZXIoKS5nZXRJbml0aWFscygpLFxuXHRcdGlkOiBzaGVsbFNlcnZpY2VIZWxwZXIuZ2V0VXNlcigpLmdldElkKCksXG5cdFx0bmFtZTogYCR7c2hlbGxTZXJ2aWNlSGVscGVyLmdldFVzZXIoKS5nZXRGdWxsTmFtZSgpfSAoJHtnZXRUZXh0KFwiQ19DT0xMQUJPUkFUSU9ORFJBRlRfWU9VXCIpfSlgLFxuXHRcdGluaXRpYWxOYW1lOiBzaGVsbFNlcnZpY2VIZWxwZXIuZ2V0VXNlcigpLmdldEZ1bGxOYW1lKCksXG5cdFx0Y29sb3I6IDYsIC8vICBzYW1lIGNvbG9yIGFzIEZMUC4uLlxuXHRcdG1lOiB0cnVlLFxuXHRcdHN0YXR1czogVXNlclN0YXR1cy5DdXJyZW50bHlFZGl0aW5nXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZXh0KHRleHRJZDogc3RyaW5nLCAuLi5hcmdzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG5cdGNvbnN0IG9SZXNvdXJjZU1vZGVsID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0cmV0dXJuIG9SZXNvdXJjZU1vZGVsLmdldFRleHQodGV4dElkLCBhcmdzKTtcbn1cblxuZXhwb3J0IGNvbnN0IENvbGxhYm9yYXRpb25VdGlscyA9IHtcblx0Zm9ybWF0SW5pdGlhbHM6IGZvcm1hdEluaXRpYWxzLFxuXHRnZXRVc2VyQ29sb3I6IGdldFVzZXJDb2xvcixcblx0Z2V0TWU6IGdldE1lLFxuXHRnZXRBcHBDb21wb25lbnQ6IGdldEFwcENvbXBvbmVudCxcblx0Z2V0VGV4dDogZ2V0VGV4dFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNoYXJlT2JqZWN0KGJpbmRpbmdDb250ZXh0OiBDb250ZXh0LCB1c2VyczogQmFja2VuZFVzZXJbXSA9IFtdKTogUHJvbWlzZTx2b2lkPiB7XG5cdGNvbnN0IG1vZGVsID0gYmluZGluZ0NvbnRleHQuZ2V0TW9kZWwoKTtcblx0Y29uc3QgbWV0YU1vZGVsID0gbW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdGNvbnN0IGVudGl0eVNldCA9IG1ldGFNb2RlbC5nZXRNZXRhUGF0aChiaW5kaW5nQ29udGV4dCBhcyBhbnkpO1xuXHRjb25zdCBzaGFyZUFjdGlvbk5hbWUgPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KGAke2VudGl0eVNldH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdC9TaGFyZUFjdGlvbmApO1xuXHRjb25zdCBzaGFyZUFjdGlvbiA9IG1vZGVsLmJpbmRDb250ZXh0KGAke3NoYXJlQWN0aW9uTmFtZX0oLi4uKWAsIGJpbmRpbmdDb250ZXh0KTtcblx0c2hhcmVBY3Rpb24uc2V0UGFyYW1ldGVyKFwiVXNlcnNcIiwgdXNlcnMpO1xuXHRzaGFyZUFjdGlvbi5zZXRQYXJhbWV0ZXIoXCJTaGFyZUFsbFwiLCB0cnVlKTtcblx0cmV0dXJuIHNoYXJlQWN0aW9uLmV4ZWN1dGUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdGl2aXR5S2V5RnJvbVBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0cmV0dXJuIHBhdGguc3Vic3RyaW5nKHBhdGgubGFzdEluZGV4T2YoXCIoXCIpICsgMSwgcGF0aC5sYXN0SW5kZXhPZihcIilcIikpO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztNQU1ZQSxVQUFVO0VBQUEsV0FBVkEsVUFBVTtJQUFWQSxVQUFVLENBQVZBLFVBQVU7SUFBVkEsVUFBVSxDQUFWQSxVQUFVO0lBQVZBLFVBQVUsQ0FBVkEsVUFBVTtJQUFWQSxVQUFVLENBQVZBLFVBQVU7RUFBQSxHQUFWQSxVQUFVLEtBQVZBLFVBQVU7RUFBQTtFQUFBLElBT1ZDLGdCQUFnQjtFQUFBLFdBQWhCQSxnQkFBZ0I7SUFBaEJBLGdCQUFnQjtJQUFoQkEsZ0JBQWdCO0VBQUEsR0FBaEJBLGdCQUFnQixLQUFoQkEsZ0JBQWdCO0VBQUE7RUFBQSxJQTRCaEJDLFFBQVE7RUFBQSxXQUFSQSxRQUFRO0lBQVJBLFFBQVE7SUFBUkEsUUFBUTtJQUFS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