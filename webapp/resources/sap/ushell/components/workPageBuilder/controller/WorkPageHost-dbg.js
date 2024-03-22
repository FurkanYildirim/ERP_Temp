//Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file WorkPageHost for WorkPageBuilder
 * @version 1.115.1
 */

sap.ui.define([
  "sap/ui/integration/Host",
  "sap/ui/model/json/JSONModel"
], function (
  Host,
  JSONModel
) {
  "use strict";

  return function (sId, mSettings) {

    var oHost = new Host(sId, mSettings);

    oHost.setResolveDestination(function (sDestinationName) {
      if (!sDestinationName) {
        return Promise.reject();
      }
      return Promise.resolve("/dynamic_dest/" + sDestinationName);
    });

     /**
     * Resolves host context value based on a given content path
     *
     * @param {string} sPath The context path used at runtime, e.g "sap.workzone/currentUser/value".
     *
     * @returns {Promise} Promise that resolves to the context paths value.
     * @private
     * @since 1.115.0
     */
    oHost.getContextValue = function (sPath) {
      try {
        if (!sPath) {
            return Promise.reject();
        }
        if (sPath.charAt(0) === "/") {
          return oHost.getContextValue(sPath.substring(1));
        }
        return oHost.getContext().then(function () {
            return oHost._oHostContextModel.getProperty("/" + sPath);
        });
      } catch (ex) {
          return Promise.resolve();
      }
    };

    /**
     * Returns the promise with the host context information.
     *
     * The information is collected from the UserInfo service once and stored in
     * this.oHostContext member.
     * The context contains information for id, name, email and timezone of the user.
     *
     * Additionally this structure is used for the configuration editor of cards that can
     * select a corresponding value from a drop down. Label, placeholder and descriptions for
     * such configuration is also added.
     *
     * This structure is returned for the configuration editor of the card via the 'getContext' method of the host.
     *
     * For the Standard Edition the content object will contain:
     * {
     *    "sap.workzone": {
     *      currentUser: {
     *        id: {
     *          label: string
     *          description: string,
     *          placeholder: string,
     *          type: "string",
     *          value: The user id as string
     *        },
     *        name: {
     *          label: string
     *          description: string,
     *          placeholder: string,
     *          type: "string",
     *          value: The users full name as string
     *        },
     *        firstName: {
     *          label: string
     *          description: string,
     *          placeholder: string,
     *          type: "string",
     *          value: The firstName name as string
     *        },
     *        lastName: {
     *          label: string
     *          description: string,
     *          placeholder: string,
     *          type: "string",
     *          value: The users lastName as string
     *        },
     *        email: {
     *          label: string
     *          description: string,
     *          placeholder: string,
     *          type: "string",
     *          value: The users email as string
     *        }
     *      }
     *    }
     * }
     *
     * @returns {Promise} The sap.workzone context object
     *
     * @private
     * @since 1.115.0
     */
    oHost.getContext = function () {
      if (!oHost._oHostContext) {
        oHost._oHostContext = sap.ushell.Container.getServiceAsync("UserInfo").then(function (UserInfo) {
          var oBundle = oHost.getModel("i18n") && oHost.getModel("i18n").getResourceBundle();
          if (!oBundle) {
            oBundle = {
              getText: function (s) {
                return s;
              }
            };
          }
          oHost._oHostContext = {
            "sap.workzone": {
              label: oBundle.getText("WorkPage.Host.Context.WorkZone.Label"),
              currentUser: {
                label: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Label"),
                id: {
                  label: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Id.Label"),
                  type: "string",
                  tags: ["technical"],
                  placeholder: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Id.Placeholder"),
                  description: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Id.Desc"),
                  value: UserInfo.getId()
                },
                name: {
                  label: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Name.Label"),
                  type: "string",
                  placeholder: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Name.Placeholder"),
                  description: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Name.Desc"),
                  value: UserInfo.getFullName()
                },
                firstName: {
                  label: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.FirstName.Label"),
                  type: "string",
                  placeholder: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.FirstName.Placeholder"),
                  description: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.FirstName.Desc"),
                  value: UserInfo.getFirstName()
                },
                lastName: {
                  label: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.LastName.Label"),
                  type: "string",
                  placeholder: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.LastName.Placeholder"),
                  description: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.LastName.Desc"),
                  value: UserInfo.getLastName()
                },
                email: {
                  label: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Email.Label"),
                  type: "string",
                  placeholder: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Email.Placeholder"),
                  description: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Email.Desc"),
                  value: UserInfo.getEmail()
                }
              }
            }
          };
          oHost._oHostContextModel = new JSONModel(oHost._oHostContext);
          return oHost._oHostContext;
        });
      }
      return Promise.resolve(oHost._oHostContext);
    };
    return oHost;
  };
});
