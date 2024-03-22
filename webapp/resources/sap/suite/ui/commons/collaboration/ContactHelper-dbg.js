/* eslint-disable no-console */
/* eslint-disable no-undef */

sap.ui.loader.config({
	shim: {
		'sap/suite/ui/commons/thirdparty/msal-browser': {
			amd: true,
			exports: 'msal-browser'
		}
	}
});
// eslint-disable-next-line no-undef
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/suite/ui/commons/collaboration/GraphApiConfig",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/model/resource/ResourceModel",
	"sap/suite/ui/commons/thirdparty/msal-browser"
],function (Controller, GraphApiConfig, Fragment, JSONModel, mLibrary, Core, ResourceModel) {
		"use strict";

		var oi18nModel = Core.getLibraryResourceBundle("sap.suite.ui.commons");
		var i18nModel = new ResourceModel({ bundle: oi18nModel });

		return Controller.extend("sap.suite.ui.commons.collaboration.ContactHelper", {
			constructor: function (oProviderConfig) {
				// var userInfo;
				// // eslint-disable-next-line no-undef
				// if (sap.ushell && sap.ushell.Container) {
				// 	// eslint-disable-next-line no-undef
				// 	userInfo = sap.ushell.Container.getService("UserInfo");
				// }
				// this.sUserName = userInfo ? userInfo.getEmail() : "";
				this.oGraphApiConfig = GraphApiConfig.getConfig(oProviderConfig);
				// eslint-disable-next-line no-undef
				this.myMSALObj = new msal.PublicClientApplication(this.oGraphApiConfig.msalConfig);
			},

			handleMultipleAccounts: function () {
				// eslint-disable-next-line no-undef
				var aCurrentAccounts = myMSALObj.getAllAccounts();
				if (aCurrentAccounts.length === 0) {
					// eslint-disable-next-line no-console
					console.warn("No account detected.");
				} else if (aCurrentAccounts.length > 1) {
					// eslint-disable-next-line no-console
					console.warn("Multiple accounts detected.");
				} else if (aCurrentAccounts.length === 1) {
					this.sUserName = aCurrentAccounts[0].username;
				}
			},

			callApi: function (endpoint, token) {
				var oHeaders = new Headers();
				var sBearer = "Bearer " + token;

				oHeaders.append("Authorization", sBearer);

				return fetch(endpoint, {
					method: "GET",
					headers: oHeaders
				});
			},

			signIn: function () {
				return this.myMSALObj.loginPopup(this.oGraphApiConfig.loginRequest).then(function(response){
					if (response !== null) {
						this.sUserName = response.account.username;
					} else {
						this.handleMultipleAccounts();
					}
					return Promise.resolve(this.myMSALObj.getAccountByUsername(this.sUserName));
				}.bind(this)).catch(function(error) {
					return Promise.reject(error);
				});
			},

			getAccount: function () {
				if (this.sUserName) {
					return Promise.resolve(this.myMSALObj.getAccountByUsername(this.sUserName));
				} else {
					return this.signIn();
				}
			},

			getToken: function (request) {
				return new Promise(function (resolve, reject){
					this.getAccount()
					.then(function(account){
						request.account = account;
						return this.myMSALObj.acquireTokenSilent(request);
					}.bind(this))
					.then(function(token){
						this.loginResponse = token;
						resolve(token);
					}.bind(this))
					.catch(function(error) {
						// eslint-disable-next-line no-undef
						if (error instanceof msal.InteractionRequiredAuthError) {
							this.myMSALObj.acquireTokenPopup(request).then(function(token){
								this.loginResponse = token;
								resolve(token);
							}).catch(function(){
								// eslint-disable-next-line no-console
								console.error(error);
								reject(error);
							});
						} else {
							// eslint-disable-next-line no-console
							console.error(error);
							reject(error);
						}
					});
				}.bind(this));
			},

			getFullProfileByEmail: function (email) {
				return this.getToken(this.oGraphApiConfig.loginRequest).then(function(loginResponse){
					var oUserProfilePromise = this.callApi(
						this.oGraphApiConfig.graphApiEndpoints.graphUserEndpoint + "/" + email + "?$select=displayName,jobTitle,mail,mobilePhone,officeLocation,businessPhones,department,employeeOrgData",
						loginResponse.accessToken
					).then(function(response){
						return response.json();
					});
					var oUserPresencePromise = this.callApi(
						this.oGraphApiConfig.graphApiEndpoints.graphUserEndpoint + "/" + email + "/presence",
						loginResponse.accessToken
					).then(function(response){
						return response.json();
					});
					var oUserPhotoPromise = this.getPhotoByEmail(email);
					return Promise.all([oUserProfilePromise, oUserPresencePromise, oUserPhotoPromise]).then(function(data) {
						var oFullProfileData = Object.assign(data[0], data[1]);
						oFullProfileData.photo = data[2];
						return oFullProfileData;
					});
				}.bind(this));
			},

			getPhotoByEmail: function (email) {
				if (!email || email.length === 0) {
					return Promise.resolve();
				}
				return this.checkExistingToken().then(function(loginResponse){
					return this.callApi(
						this.oGraphApiConfig.graphApiEndpoints.graphUserEndpoint + "/" + email + "/photo/$value",
						loginResponse.accessToken
					);
				}.bind(this))
				.then(function(response){
					return response.blob();
				})
				.then(function(blob){
					return URL.createObjectURL(blob);
				});
			},

			checkExistingToken: function () {
				if (this.loginResponse) {
					return Promise.resolve(this.loginResponse);
				} else {
					return this.getToken(this.oGraphApiConfig.loginRequest);
				}
			},

			sendChatMessage: function () {
				var sMessage = sap.ui.getCore().byId("msTeamsQuickChat").getValue();
				this.checkExistingToken().then(function(loginResponse){
					this.oHeaders = new Headers();
					var sBearer = "Bearer " + loginResponse.accessToken;
					this.endpoint = "https://graph.microsoft.com/v1.0/chats";

					var body =
						"{\n" +
						'    "chatType": "oneOnOne",\n' +
						'    "members": [\n' +
						"        {\n" +
						'            "@odata.type": "#microsoft.graph.aadUserConversationMember",\n' +
						'            "roles": [\n' +
						'                "owner"\n' +
						"            ],\n" +
						'            "user@odata.bind": "https://graph.microsoft.com/v1.0/users(\'' + loginResponse.account.username + '\')"\n' +
						"        },\n" +
						"        {\n" +
						'            "@odata.type": "#microsoft.graph.aadUserConversationMember",\n' +
						'            "roles": [\n' +
						'                "owner"\n' +
						"            ],\n" +
						'            "user@odata.bind": "https://graph.microsoft.com/v1.0/users(\'' + this.sEmail + '\')"\n' +
						"        }\n" +
						"    ]\n" +
						"}";

					this.oHeaders.append("Authorization", sBearer);
					this.oHeaders.append("Content-Type", "application/json");

					return fetch(this.endpoint, {
						method: "POST",
						headers: this.oHeaders,
						body: body
					});
				}.bind(this))
				.then(function(createChat){
					return createChat.text();
				})
				.then(function(createChatResponseData){
					var createChatResponse = JSON.parse(createChatResponseData);
					var bodyMessage = "{\n" + '  "body": {\n' + '     "content": "' + sMessage + '" \n ' + "  }\n" + "}";
					return fetch(this.endpoint + "/" + encodeURIComponent(createChatResponse.id) + "/messages", {
						method: "POST",
						headers: this.oHeaders,
						body: bodyMessage
					});
				}.bind(this))
				.then(function(createChatMessage){
					console.log(createChatMessage);
				});
			},

			handleMSTeamsPress: function (event) {
				var email = event.getSource().data("email");
				var type = event.getSource().data("type");
				var url = "";
				switch (type) {
					case "chat":
						url = "https://teams.microsoft.com/l/chat/0/0?users=" + email;
						break;
					case "videoCall":
						url = "https://teams.microsoft.com/l/call/0/0?users=" + email + "&withVideo=true";
						break;
					case "call":
						url = "https://teams.microsoft.com/l/call/0/0?users=" + email;
						break;
					default:
						break;
				}
				mLibrary.URLHelper.redirect(url, true);
			},

			formatUri: function (sValue) {
				var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				if (mailregex.test(sValue)) {
					return "mailto:" + sValue;
				} else {
					return "tel:" + sValue;
				}
			},

			loadContactPopover: function (sEmail) {
				this.sEmail = sEmail;
				return this.getFullProfileByEmail(sEmail).then(function (data) {
					if (data && data.error) {
						return Promise.reject(data);
					}
					var oJsonModel = new JSONModel(data);
					oJsonModel.setData(data);
					return Fragment.load({
						name: "sap.suite.ui.commons.collaboration.ContactPopover",
						controller: this,
						type:  "XML"
					}).then(function (oPopover) {
						this._oContactPopover = oPopover;
						oPopover.setModel(oJsonModel, "userData");
						oPopover.setModel(i18nModel, "i18n");
						return oPopover;
					}.bind(this));
				}.bind(this));
			},

			afterClose: function() {
				this._oContactPopover.destroy();
			}
		});
	}
);