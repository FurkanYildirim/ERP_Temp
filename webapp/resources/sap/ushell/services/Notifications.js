// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/ui/core/Core","sap/ui/core/Configuration","sap/ui/core/ws/SapPcpWebSocket","sap/ui/model/json/JSONModel","sap/ui/thirdparty/datajs","sap/ui/thirdparty/hasher","sap/ui/thirdparty/jquery","sap/ushell/utils"],function(e,t,i,s,n,o,r,jQuery,a){"use strict";var c="/sap/bc/apc/iwngw/notification_push_apc";var u=60;function f(f,d,l){var g=new n,h=new Date,p=l&&l.config,N={getNotifications:{},getNotificationsByType:{},getNotificationsInGroup:{},getBadgeNumber:{},resetBadgeNumber:{},getNotificationTypesSettings:{},getNotificationsGroupHeaders:{},getMobileSupportSettings:{},getEmailSupportSettings:{},getWebSocketValidity:{},getNotificationCount:{}},v,_,S,T,I=[],C=[],m=[],b=false,y=[],D=false,E=false,A=true,P,O,B=5e3,R=6e3,k=false,U={NOTIFICATIONS:0,NOTIFICATIONS_BY_TYPE:1,GET_BADGE_NUMBER:2,RESET_BADGE_NUMBER:3,GET_SETTINGS:4,GET_MOBILE_SUPPORT_SETTINGS:5,NOTIFICATIONS_GROUP_HEADERS:6,NOTIFICATIONS_IN_GROUP:7,GET_NOTIFICATIONS_COUNT:8,VALIDATE_WEBSOCKET_CHANNEL:9,GET_EMAIL_SUPPORT_SETTINGS:10,NOTIFICATIONS_BY_DATE_DESCENDING:"notificationsByDateDescending",NOTIFICATIONS_BY_DATE_ASCENDING:"notificationsByDateAscending",NOTIFICATIONS_BY_PRIORITY_DESCENDING:"notificationsByPriorityDescending",NOTIFICATIONS_BY_TYPE_DESCENDING:"notificationsByTypeDescending"},F={PACKAGED_APP:0,FIORI_CLIENT:1,WEB_SOCKET:2,POLLING:3},G,q=false,w=true,L=false,M=new jQuery.Deferred,H=new jQuery.Deferred,j,W,X=M.promise(),x=false,$={},z=10,J=false,Y=false,V=[];this.isEnabled=function(){if(!p.enabled||!p.serviceUrl){A=false;if(p.enabled&&!p.serviceUrl){e.warning("No serviceUrl was found in the service configuration")}}else{A=true}return A};this.init=function(){if(!D&&this.isEnabled()){t.getEventBus().subscribe("launchpad","sessionTimeout",this.destroy,this);this.lastNotificationDate=new Date;this._setWorkingMode();D=true;this.bUpdateDependencyInitiatorExists=false;this._userSettingInitialization()}t.getEventBus().subscribe("launchpad","setConnectionToServer",this._onSetConnectionToServer,this)};this._onSetConnectionToServer=function(e,t,i){if(i.active){this._resumeConnection()}else{this._closeConnection()}};this.getUnseenNotificationsCount=function(){var e=new jQuery.Deferred;e.resolve(g.getProperty("/UnseenCount"));return e.promise()};this.getNotificationsCount=function(){return g.getProperty("/NotificationsCount")?g.getProperty("/NotificationsCount"):"0"};this.getNotificationsByTypeWithGroupHeaders=function(){var t={"Accept-Language":i.getLanguageTag()},s,n=new jQuery.Deferred,r=this._getRequestURI(U.NOTIFICATIONS_BY_TYPE);s={requestUri:r};if(!this._getHeaderXcsrfToken()){t["X-CSRF-Token"]="fetch"}s.headers=t;o.request(s,function(e){n.resolve(e)},function(t){if(t.response&&t.response.statusCode===200&&t.response.body){n.resolve(t.response.body)}else{n.reject(t);e.error("Notification service - oData executeAction failed: ",t,"sap.ushell.services.Notifications")}});return n.promise()};this.getNotificationsGroupHeaders=function(){var t={"Accept-Language":i.getLanguageTag()},s,n=new jQuery.Deferred,r=this._getRequestURI(U.NOTIFICATIONS_GROUP_HEADERS);s={requestUri:r};if(!this._getHeaderXcsrfToken()){t["X-CSRF-Token"]="fetch"}s.headers=t;o.request(s,function(e){n.resolve(e)},function(t){if(t.response&&t.response.statusCode===200&&t.response.body){n.resolve(t.response.body)}else{n.reject();e.error("Notification service - oData executeAction failed: ",t,"sap.ushell.services.Notifications")}});return n.promise()};this.getNotificationsBufferInGroup=function(t,s,n){var r=this,a={"Accept-Language":i.getLanguageTag()},c,u=new jQuery.Deferred,f={group:t,skip:s,top:n},d,l,g=this._getRequestURI(U.NOTIFICATIONS_IN_GROUP,f);if(x===true){d=$[U.NOTIFICATIONS_IN_GROUP].slice(s,s+n);l=JSON.stringify({"@odata.context":"$metadata#Notifications",value:d});setTimeout(function(){u.resolve(l)},1e3)}else{c={requestUri:g};if(!this._getHeaderXcsrfToken()){a["X-CSRF-Token"]="fetch"}c.headers=a;o.request(c,function(e){r._updateCSRF(e.response);u.resolve(e.value)},function(t){if(t.response&&t.response.statusCode===200&&t.response.body){r._updateCSRF(t.response);u.resolve(JSON.parse(t.response.body).value)}else{u.reject();e.error("Notification service - oData executeAction failed: ",t,"sap.ushell.services.Notifications")}})}return u.promise()};this.getNotificationsBufferBySortingType=function(t,s,n){var r=this,a={"Accept-Language":i.getLanguageTag()},c,u=new jQuery.Deferred,f={skip:s,top:n},d,l,g=this._getRequestURI(t,f);if(x===true){d=$[t].slice(s,s+n);l=JSON.stringify({"@odata.context":"$metadata#Notifications",value:d});setTimeout(function(){u.resolve(l)},1e3)}else{c={requestUri:g};if(!this._getHeaderXcsrfToken()){a["X-CSRF-Token"]="fetch"}c.headers=a;o.request(c,function(e){r._updateCSRF(e.response);u.resolve(e.value)},function(t){if(t.response&&t.response.statusCode===200&&t.response.body){r._updateCSRF(t.response);u.resolve(JSON.parse(t.response.body).value)}else{u.reject();e.error("Notification service - oData executeAction failed: ",t,"sap.ushell.services.Notifications")}})}return u.promise()};this.getNotifications=function(){var e,t=new jQuery.Deferred;if(G===F.FIORI_CLIENT||G===F.PACKAGED_APP){e=this._readNotificationsData(false);e.done(function(){t.resolve(g.getProperty("/Notifications"))}).fail(function(){t.reject()})}else{t.resolve(g.getProperty("/Notifications"))}return t.promise()};this.executeBulkAction=function(e,t){var i=new jQuery.Deferred,s=[],n=[],o={succededNotifications:s,failedNotifications:n},r=this;r.sendBulkAction(e,t).done(function(e){e.forEach(function(e,t){var i=e.NotificationId,o=e.Success;if(o){s.push(i)}else{n.push(i)}});if(n.length){i.reject(o)}else{i.resolve(o)}}).fail(function(){i.reject(o)});return i.promise()};this.dismissBulkNotifications=function(e){var t=new jQuery.Deferred,i=this;i.sendBulkDismiss(e).done(function(){t.resolve()}).fail(function(){t.reject()});return t.promise()};this.executeAction=function(t,i){var s=this,n=p.serviceUrl+"/ExecuteAction",r={NotificationId:t,ActionId:i},a={requestUri:n,method:"POST",data:r,headers:{"X-Requested-With":"XMLHttpRequest","Content-Type":"application/json",DataServiceVersion:O,"X-CSRF-Token":P}},c=new jQuery.Deferred;o.request(a,function(e){var t,i={isSucessfull:true,message:""};if(e&&e.response&&e.response.statusCode===200&&e.response.body){t=JSON.parse(e.response.body);i.isSucessfull=t.Success;i.message=t.MessageText}c.resolve(i)},function(n){var o,r={isSucessfull:false,message:""};if(n.response&&n.response.statusCode===200&&n.response.body){o=JSON.parse(n.response.body);r.isSucessfull=o.Success;r.message=o.MessageText;c.resolve(r)}else if(s._csrfTokenInvalid(n)&&J===false){s._invalidCsrfTokenRecovery(c,s.executeAction,[t,i])}else{c.reject(n);e.error("Notification service - oData executeAction failed: ",n,"sap.ushell.services.Notifications")}});return c.promise()};this.sendBulkAction=function(t,i){var s=this,n=p.serviceUrl+"/BulkActionByHeader",r={ParentId:t,ActionId:i},a={requestUri:n,method:"POST",data:r,headers:{"X-Requested-With":"XMLHttpRequest","Content-Type":"application/json",DataServiceVersion:O,"X-CSRF-Token":P}},c=new jQuery.Deferred;o.request(a,function(e){var t,i;if(e&&e.response&&e.response.statusCode===200&&e.response.body){t=JSON.parse(e.response.body);i=t.value}c.resolve(i)},function(n){var o,r;if(n.response&&n.response.statusCode===200&&n.response.body){o=JSON.parse(n.response.body);r=o.value;c.resolve(r)}else if(s._csrfTokenInvalid(n)&&J===false){s._invalidCsrfTokenRecovery(c,s.sendBulkAction,[t,i])}else{c.reject();e.error("Notification service - oData executeBulkAction failed: ",n.message,"sap.ushell.services.Notifications")}});return c.promise()};this.sendBulkDismiss=function(t){var i=this,s=p.serviceUrl+"/DismissAll",n={ParentId:t},r={requestUri:s,method:"POST",data:n,headers:{"X-Requested-With":"XMLHttpRequest","Content-Type":"application/json",DataServiceVersion:O,"X-CSRF-Token":P}},a=new jQuery.Deferred;o.request(r,function(){a.resolve()},function(s){if(s.response&&s.response.statusCode===200){a.resolve()}else if(i._csrfTokenInvalid(s)&&J===false){i._invalidCsrfTokenRecovery(a,i.sendBulkDismiss,[t])}else{a.reject();var n=s?s.message:"";e.error("Notification service - oData executeBulkAction failed: ",n,"sap.ushell.services.Notifications")}});return a.promise()};this.markRead=function(t){var i=this,s=p.serviceUrl+"/MarkRead",n={NotificationId:t},r={requestUri:s,method:"POST",data:n,headers:{"X-Requested-With":"XMLHttpRequest","Content-Type":"application/json",DataServiceVersion:O,"X-CSRF-Token":P}},a=new jQuery.Deferred;o.request(r,function(){a.resolve()},function(s){if(i._csrfTokenInvalid(s)&&J===false){i._invalidCsrfTokenRecovery(a,i.markRead,[t])}else{e.error("Notification service - oData reset badge number failed: ",s,"sap.ushell.services.Notifications");a.reject(s)}});return a.promise()};this.dismissNotification=function(t){var i=p.serviceUrl+"/Dismiss",s=this,n={NotificationId:t},r={requestUri:i,method:"POST",data:n,headers:{"X-Requested-With":"XMLHttpRequest","Content-Type":"application/json",DataServiceVersion:O,"X-CSRF-Token":P}},a=new jQuery.Deferred;o.request(r,function(){s._addDismissNotifications(t);a.resolve()},function(i){if(s._csrfTokenInvalid(i)&&J===false){s._invalidCsrfTokenRecovery(a,s.dismissNotification,[t])}else{a.reject(i);e.error("Notification service - oData dismiss notification failed: ",i,"sap.ushell.services.Notifications")}});return a.promise()};this.registerNotificationsUpdateCallback=function(e){I.push(e)};this.registerDependencyNotificationsUpdateCallback=function(e,t){if(t===false){this.bUpdateDependencyInitiatorExists=true}C.push({callback:e,dependent:t})};this.registerNotificationCountUpdateCallback=function(e){m.push(e)};this.notificationsSeen=function(){this._setNotificationsAsSeen()};this.isFirstDataLoaded=function(){return q};this.readSettings=function(){var e;e=this._readSettingsFromServer();return e};this.saveSettingsEntry=function(e){var t=this._writeSettingsEntryToServer(e);return t};this.getUserSettingsFlags=function(){var e=new jQuery.Deferred;if(L===true){e.resolve({highPriorityBannerEnabled:w})}else{X.done(function(){e.resolve({highPriorityBannerEnabled:w})})}return e.promise()};this.setUserSettingsFlags=function(e){w=e.highPriorityBannerEnabled;this._writeUserSettingsFlagsToPersonalization(e)};this._getNotificationSettingsMobileSupport=function(){return j};this._getDismissNotifications=function(){return V};this.filterDismisssedItems=function(e,t){return e.filter(function(e){return!t.some(function(t){return t===e.originalItemId})})};this._addDismissNotifications=function(e){if(V.indexOf(e)===-1){V.push(e)}};this._initializeDismissNotifications=function(){V=[]};this._getNotificationSettingsEmailSupport=function(){return W};this.destroy=function(){E=true;if(_){clearTimeout(_)}else if(S){clearTimeout(S)}else if(T){clearTimeout(T)}if(G===F.WEB_SOCKET&&v){v.close()}t.getEventBus().unsubscribe("launchpad","sessionTimeout",this.destroy,this);t.getEventBus().unsubscribe("launchpad","setConnectionToServer",this._onSetConnectionToServer,this)};this._readUnseenNotificationsCount=function(t){var s=this,n=new jQuery.Deferred,r=this._getRequestURI(U.GET_BADGE_NUMBER),a={requestUri:r,headers:{"Accept-Language":i.getLanguageTag()}};o.read(a,function(e,t){g.setProperty("/UnseenCount",t.data.GetBadgeNumber.Number);s._setNativeIconBadge(t.data.GetBadgeNumber.Number);n.resolve(t.data.GetBadgeNumber.Number)},function(t){if(t.response&&t.response.statusCode===200&&t.response.body){var i=JSON.parse(t.response.body);g.setProperty("/UnseenCount",i.value);s._setNativeIconBadge(i.value);n.resolve(i.value)}else{e.error("Notification service - oData read unseen notifications count failed: ",t.message,"sap.ushell.services.Notifications");n.reject(t)}});return n.promise()};this.readNotificationsCount=function(){var t=new jQuery.Deferred,s=this._getRequestURI(U.GET_NOTIFICATIONS_COUNT),n={requestUri:s,headers:{"Accept-Language":i.getLanguageTag()}};o.read(n,function(e,i){t.resolve(i.data)},function(i){if(i.response&&i.response.statusCode===200&&i.response.body){var s=JSON.parse(i.response.body);t.resolve(s.value)}else{e.error("Notification service - oData read notifications count failed: ",i.message,"sap.ushell.services.Notifications");t.reject(i)}});return t.promise()};this._getNotificationSettingsAvailability=function(){return H.promise()};this._setNotificationsAsSeen=function(){var t=this,i=new jQuery.Deferred,s=this._getRequestURI(U.RESET_BADGE_NUMBER),n={requestUri:s,method:"POST",headers:{"X-Requested-With":"XMLHttpRequest","Content-Type":"application/json",DataServiceVersion:O,"X-CSRF-Token":P}};if(this._isFioriClientMode()===true||this._isPackagedMode()===true){this._setNativeIconBadge(0)}o.request(n,function(){i.resolve()},function(s){if(t._csrfTokenInvalid(s)&&J===false){t._invalidCsrfTokenRecovery(i,t._setNotificationsAsSeen)}else{e.error("Notification service - oData reset badge number failed: ",s,"sap.ushell.services.Notifications");i.reject(s)}});return i.promise()};this._readNotificationsData=function(e){var t=this,i,s,n,o=new jQuery.Deferred,r=[];i=this._readUnseenNotificationsCount(e);r.push(i);n=this.readNotificationsCount();n.done(function(e){g.setProperty("/NotificationsCount",e)});s=this.getNotificationsBufferBySortingType(U.NOTIFICATIONS_BY_DATE_DESCENDING,0,z);r.push(s);jQuery.when.apply(jQuery,r).then(function(){r[0].done(function(){if(e===true){t._updateNotificationsCountConsumers()}});r[1].done(function(i){g.setProperty("/Notifications",i);t._notificationAlert(i);if(e===true){t._updateNotificationsConsumers();t._updateDependentNotificationsConsumers()}o.resolve()})});return o.promise()};this._getHeaderXcsrfToken=function(){return P};this._getDataServiceVersion=function(){return O};this._getRequestURI=function(e,t){var i,s=encodeURI(this._getConsumedIntents(e));switch(e){case U.NOTIFICATIONS:if(N.getNotifications.basic===undefined){N.getNotifications.basic=p.serviceUrl+"/Notifications?$expand=Actions,NavigationTargetParams&$filter=IsGroupHeader%20eq%20false"}if(this._isIntentBasedConsumption()){if(N.getNotifications.byIntents===undefined){N.getNotifications.byIntents=N.getNotifications.basic.concat("&intents%20eq%20"+s)}return N.getNotifications.byIntents}return N.getNotifications.basic;case U.NOTIFICATIONS_BY_TYPE:if(N.getNotificationsByType.basic===undefined){N.getNotificationsByType.basic=p.serviceUrl+"/Notifications?$expand=Actions,NavigationTargetParams"}if(this._isIntentBasedConsumption()){if(N.getNotificationsByType.byIntents===undefined){N.getNotificationsByType.byIntents=N.getNotificationsByType.basic.concat("&$filter=intents%20eq%20"+s)}return N.getNotificationsByType.byIntents}return N.getNotificationsByType.basic;case U.NOTIFICATIONS_GROUP_HEADERS:if(N.getNotificationsGroupHeaders.basic===undefined){N.getNotificationsGroupHeaders.basic=p.serviceUrl+"/Notifications?$expand=Actions,NavigationTargetParams&$filter=IsGroupHeader%20eq%20true"}if(this._isIntentBasedConsumption()){if(N.getNotificationsGroupHeaders.byIntents===undefined){N.getNotificationsGroupHeaders.byIntents=N.getNotificationsGroupHeaders.basic.concat("&intents%20eq%20"+s)}return N.getNotificationsGroupHeaders.byIntents}return N.getNotificationsGroupHeaders.basic;case U.NOTIFICATIONS_IN_GROUP:i=p.serviceUrl+"/Notifications?$expand=Actions,NavigationTargetParams&$orderby=CreatedAt desc&$filter=IsGroupHeader eq false and ParentId eq "+t.group+"&$skip="+t.skip+"&$top="+t.top;if(this._isIntentBasedConsumption()===true){i=i.concat("&intents%20eq%20"+s)}break;case U.GET_BADGE_NUMBER:if(N.getBadgeNumber.basic===undefined){N.getBadgeNumber.basic=p.serviceUrl+"/GetBadgeNumber()"}if(this._isIntentBasedConsumption()){if(N.getBadgeNumber.byIntents===undefined){N.getBadgeNumber.byIntents=p.serviceUrl+"/GetBadgeCountByIntent("+s+")"}return N.getBadgeNumber.byIntents}return N.getBadgeNumber.basic;case U.GET_NOTIFICATIONS_COUNT:if(N.getNotificationCount.basic===undefined){N.getNotificationCount.basic=p.serviceUrl+"/Notifications/$count"}return N.getNotificationCount.basic;case U.RESET_BADGE_NUMBER:if(N.resetBadgeNumber.basic===undefined){N.resetBadgeNumber.basic=p.serviceUrl+"/ResetBadgeNumber"}return N.resetBadgeNumber.basic;case U.GET_SETTINGS:if(N.getNotificationTypesSettings.basic===undefined){N.getNotificationTypesSettings.basic=p.serviceUrl+"/NotificationTypePersonalizationSet"}return N.getNotificationTypesSettings.basic;case U.GET_MOBILE_SUPPORT_SETTINGS:if(N.getMobileSupportSettings.basic===undefined){N.getMobileSupportSettings.basic=p.serviceUrl+"/Channels(ChannelId='SAP_SMP')"}return N.getMobileSupportSettings.basic;case U.GET_EMAIL_SUPPORT_SETTINGS:if(N.getEmailSupportSettings.basic===undefined){N.getEmailSupportSettings.basic=p.serviceUrl+"/Channels(ChannelId='SAP_EMAIL')"}return N.getEmailSupportSettings.basic;case U.VALIDATE_WEBSOCKET_CHANNEL:if(N.getWebSocketValidity.basic===undefined){N.getWebSocketValidity.basic=p.serviceUrl+"/Channels('SAP_WEBSOCKET')"}return N.getWebSocketValidity.basic;case U.NOTIFICATIONS_BY_DATE_DESCENDING:i=p.serviceUrl+"/Notifications?$expand=Actions,NavigationTargetParams&$orderby=CreatedAt%20desc&$filter=IsGroupHeader%20eq%20false&$skip="+t.skip+"&$top="+t.top;if(this._isIntentBasedConsumption()===true){i=i.concat("&intents%20eq%20"+s)}break;case U.NOTIFICATIONS_BY_DATE_ASCENDING:i=p.serviceUrl+"/Notifications?$expand=Actions,NavigationTargetParams&$orderby=CreatedAt%20asc&$filter=IsGroupHeader%20eq%20false&$skip="+t.skip+"&$top="+t.top;if(this._isIntentBasedConsumption()===true){i=i.concat("&intents%20eq%20"+s)}break;case U.NOTIFICATIONS_BY_PRIORITY_DESCENDING:i=p.serviceUrl+"/Notifications?$expand=Actions,NavigationTargetParams&$orderby=Priority%20desc&$filter=IsGroupHeader%20eq%20false&$skip="+t.skip+"&$top="+t.top;if(this._isIntentBasedConsumption()===true){i=i.concat("&intents%20eq%20"+s)}break;default:i=""}return i};this._readSettingsFromServer=function(){var t=this._getRequestURI(U.GET_SETTINGS),s={requestUri:t,headers:{"Accept-Language":i.getLanguageTag()}},n=new jQuery.Deferred;o.request(s,function(e){n.resolve(e.results)},function(t){if(t.response&&t.response.statusCode===200&&t.response.body){n.resolve(t.response.body)}else{n.reject(t);e.error("Notification service - oData get settings failed: ",t,"sap.ushell.services.Notifications")}});return n.promise()};this._readMobileSettingsFromServer=function(){return this._readChannelSettingsFromServer(U.GET_MOBILE_SUPPORT_SETTINGS)};this._readEmailSettingsFromServer=function(){return this._readChannelSettingsFromServer(U.GET_EMAIL_SUPPORT_SETTINGS)};this._readChannelSettingsFromServer=function(t){var s=this._getRequestURI(t),n={requestUri:s,headers:{"Accept-Language":i.getLanguageTag()}},r=new jQuery.Deferred,a,c;o.request(n,function(e){if(typeof e.results==="string"){a=JSON.parse(e.results);a.successStatus=true;c=JSON.stringify(a);r.resolve(c)}else{e.results.successStatus=true;r.resolve(e.results)}},function(t){if(t.response&&t.response.statusCode===200&&t.response.body){a=JSON.parse(t.response.body);a.successStatus=true;c=JSON.stringify(a);r.resolve(c)}else{r.resolve(JSON.stringify({successStatus:false}));e.error("Notification service - oData get settings failed: ",t,"sap.ushell.services.Notifications")}});return r.promise()};this._checkWebSocketActivity=function(){var t=this._getRequestURI(U.VALIDATE_WEBSOCKET_CHANNEL),s={requestUri:t,headers:{"Accept-Language":i.getLanguageTag()}},n=new jQuery.Deferred,r;o.request(s,function(e){if(typeof e.results==="string"){r=JSON.parse(e.results);n.resolve(r.IsActive)}else{n.resolve(false)}},function(t){if(t.response&&t.response.statusCode===200&&t.response.body){r=JSON.parse(t.response.body);n.resolve(r.IsActive)}else{n.resolve(false);e.error("Notification service - oData get settings failed: ",t,"sap.ushell.services.Notifications")}});return n.promise()};this._writeSettingsEntryToServer=function(t){var i=this,s,n=this._getRequestURI(U.GET_SETTINGS)+"(NotificationTypeId="+t.NotificationTypeId+")",r={requestUri:n,method:"PUT",headers:{"X-Requested-With":"XMLHttpRequest","Content-Type":"application/json",DataServiceVersion:O,"X-CSRF-Token":P}};r.data=JSON.parse(JSON.stringify(t));r.data["@odata.context"]="$metadata#NotificationTypePersonalizationSet/$entity";s=new jQuery.Deferred;o.request(r,function(e){s.resolve(e)},function(n){if(n.response&&n.response.statusCode===200&&n.response.body){s.resolve(n.response.body)}else if(i._csrfTokenInvalid(n)&&J===false){i._invalidCsrfTokenRecovery(s,i._writeSettingsEntryToServer,[t])}else{s.reject(n);e.error("Notification service - oData set settings entry failed: ",n,"sap.ushell.services.Notifications")}});return s.promise()};this._updateNotificationsConsumers=function(){I.forEach(function(e){e()})};this._updateDependentNotificationsConsumers=function(){var e=this,t=new jQuery.Deferred;C.forEach(function(i){if(e.bUpdateDependencyInitiatorExists===false){i.callback()}else if(i.dependent===true){i.callback(t.promise())}else{i.callback(t)}})};this._updateNotificationsCountConsumers=function(){m.forEach(function(e){e()})};this._updateAllConsumers=function(){this._updateNotificationsConsumers();this._updateNotificationsCountConsumers();this._updateDependentNotificationsConsumers()};this._getModel=function(){return g};this._getMode=function(){return G};this._setWorkingMode=function(){var e;if(p.intentBasedConsumption===true){y=this._getIntentsFromConfiguration(p.consumedIntents);if(y.length>0){b=true}}if(this._isPackagedMode()){G=F.PACKAGED_APP;e=this._getIntentsFromConfiguration(window.fiori_client_appConfig.applications);if(e.length>0){y=e}if(y.length>0){b=true}this._registerForPush();this._readNotificationsData(true);this._setNativeIconBadgeWithDelay();return}this._performFirstRead()};this._performFirstRead=function(){var t=this,i,s=this._readNotificationsData(true);s.done(function(){i=t._getFioriClientRemainingDelay();if(i<=0){t._fioriClientStep()}else{_=setTimeout(function(){t._fioriClientStep()},i)}q=true}).fail(function(t){e.error("Notifications oData read failed. Error: "+t);return})};this._fioriClientStep=function(){if(this._isFioriClientMode()){G=F.FIORI_CLIENT;this._addPushNotificationHandler();this.getUnseenNotificationsCount().done(function(e){this._setNativeIconBadge(e,function(){})}.bind(this)).fail(function(){})}else{this._webSocketStep()}};this._webSocketStep=function(){G=F.WEB_SOCKET;this._establishWebSocketConnection()};this._webSocketRecoveryStep=function(){if(k===false){k=true;S=setTimeout(function(){this._webSocketStep()}.bind(this),B)}else{this._activatePollingAfterInterval()}};this._activatePollingAfterInterval=function(){var e=p.pollingIntervalInSeconds||u;clearTimeout(T);T=setTimeout(this._activatePolling.bind(this),a.sanitizeTimeoutDelay(e*1e3))};this._activatePolling=function(){var e=p.pollingIntervalInSeconds||u;G=F.POLLING;this._readNotificationsData(true);clearTimeout(T);T=setTimeout(this._activatePolling.bind(this,e,false),a.sanitizeTimeoutDelay(e*1e3))};this._formatAsDate=function(e){return new Date(e)};this._notificationAlert=function(e){if(w===false){return}var i,s=[],n=0;for(i in e){if(this.lastNotificationDate&&this._formatAsDate(e[i].CreatedAt)>this.lastNotificationDate){if(e[i].Priority==="HIGH"){s.push(e[i])}}if(n<this._formatAsDate(e[i].CreatedAt)){n=this._formatAsDate(e[i].CreatedAt)}}if(this.lastNotificationDate&&s&&s.length>0){t.getEventBus().publish("sap.ushell.services.Notifications","onNewNotifications",s)}this.lastNotificationDate=n};this._getFioriClientRemainingDelay=function(){return R-(new Date-h)};this._establishWebSocketConnection=function(){var t=this,i=false,n;try{v=this._getWebSocketObjectObject(p.webSocketUrl||c,[s.SUPPORTED_PROTOCOLS.v10]);v.attachMessage(this,function(e){n=e.getParameter("pcpFields");if(n&&n.Command&&n.Command==="Notification"){t._readNotificationsData(true)}});v.attachOpen(this,function(){t._checkWebSocketActivity().done(function(e){if(!e){i=true;v.close();t._activatePollingAfterInterval()}});e.info("Notifications UShell service WebSocket: webSocket connection opened")});v.attachClose(this,function(s){e.warning("Notifications UShell service WebSocket: attachClose called with code: "+s.mParameters.code+" and reason: "+s.mParameters.reason);if(!E&&!i){t._webSocketRecoveryStep()}});v.attachError(this,function(){e.warning("Notifications UShell service WebSocket: attachError called!")})}catch(t){e.error("Exception occurred while creating new sap.ui.core.ws.SapPcpWebSocket. Message: "+t.message)}};this._isFioriClientMode=function(){return!(sap.FioriClient===undefined)};this._isPackagedMode=function(){return window.fiori_client_appConfig&&window.fiori_client_appConfig.prepackaged===true};this._setNativeIconBadge=function(e){if(sap.Push!==undefined&&sap.Push.setBadgeNumber!==undefined){sap.Push.setBadgeNumber(e,function(){})}};this._setNativeIconBadgeWithDelay=function(){setTimeout(function(){this.getUnseenNotificationsCount().done(function(e){this._setNativeIconBadge(e)}.bind(this)).fail(function(){})}.bind(this),4e3)};this._getIntentsFromConfiguration=function(e){var t=[];if(e&&e.length>0){var i;for(var s=0;s<e.length;s++){i=e[s].intent;t.push(i)}}return t};this._handlePushedNotification=function(e){var i,s,n,o,c=[],u;if(e!==undefined){if(e.additionalData===undefined||e.additionalData.foreground===true){this._readNotificationsData(true)}else{if(e.additionalData&&e.additionalData.NavigationTargetObject){s=e.additionalData.NavigationTargetObject}else{s=e.NavigationTargetObject}if(e.additionalData&&e.additionalData.NavigationTargetAction){n=e.additionalData.NavigationTargetAction}else{n=e.NavigationTargetAction}if(e.additionalData&&e.additionalData.NavigationTargetParam){o=e.additionalData.NavigationTargetParam}else{o=e.NavigationTargetParam}if(o){if(typeof o==="string"||o instanceof String){c[0]=o}else if(Array.isArray(o)===true){c=o}}i=e.NotificationId;if(s&&n){if(typeof r!=="undefined"&&r.getHash()===s+"-"+n){u=t.byId("viewPortContainer");if(u){u.switchState("Center")}}a.toExternalWithParameters(s,n,c)}this.markRead(i);this._readNotificationsData(true)}}};this._registerForPush=function(){sap.Push.initPush(this._handlePushedNotification.bind(this))};this._addPushNotificationHandler=function(){document.addEventListener("deviceready",this._registerForPush.bind(this),false)};this._isIntentBasedConsumption=function(){return b};this._getConsumedIntents=function(e){var t="",i;if(!this._isIntentBasedConsumption()){return t}if(y.length>0){if(e!==U.GET_BADGE_NUMBER){t="&"}for(i=0;i<y.length;i++){if(e===U.GET_BADGE_NUMBER){if(i===0){t=y[i]}else{t=t+","+y[i]}}else{t=t+"NavigationIntent%20eq%20%27"+y[i]+"%27"}}}return t};this._revalidateCsrfToken=function(){var e;P=undefined;Y=false;e=this.getNotificationsBufferBySortingType(U.NOTIFICATIONS_BY_DATE_DESCENDING,0,1);return e.promise()};this._csrfTokenInvalid=function(e){var t=e.response;var i=t&&t.statusCode===403;var s=t?t.headers["x-csrf-token"]:"";var n=s.toLowerCase()==="required";return i&&n};this._invalidCsrfTokenRecovery=function(t,i,s){var n=this,o=this._revalidateCsrfToken(),r;J=true;o.done(function(){r=i.apply(n,s);r.done(function(e){J=false;t.resolve(e)});r.fail(function(e){J=false;if(e.response&&e.response.statusCode===200&&e.response.body){t.resolve(e.response.body)}else{t.reject(e)}})});o.fail(function(i){J=false;t.reject(i);e.error("Notification service - oData markRead failed: ",i.message,"sap.ushell.services.Notifications")})};this._notificationsAscendingSortBy=function(e,t){e.sort(function(e,i){var s=e[t],n=i[t];if(s===n){s=e.id;n=i.id}return n>s?-1:1});return e};this._getWebSocketObjectObject=function(e,t){return new s(e,t)};this.getOperationEnum=function(){return U};this._readUserSettingsFlagsFromPersonalization=function(){this._getUserSettingsPersonalizer().then(function(t){t.getPersData().done(function(e){if(e===undefined){this._writeUserSettingsFlagsToPersonalization({highPriorityBannerEnabled:w})}else{w=e.highPriorityBannerEnabled}L=true;M.resolve()}.bind(this)).fail(function(){e.error("Reading User Settings flags from Personalization service failed")})}.bind(this)).catch(function(t){e.error("Personalization service does not work:");e.error(t.name+": "+t.message);e.error("Reading User Settings flags from Personalization service failed")})};this._writeUserSettingsFlagsToPersonalization=function(t){var i=new jQuery.Deferred;this._getUserSettingsPersonalizer().then(function(e){e.setPersData(t).done(i.resolve).fail(i.reject)}).catch(function(t){e.error("Personalization service does not work:");e.error(t.name+": "+t.message);i.reject(t)});return i.promise()};this._getUserSettingsPersonalizer=function(){if(!this.oUserSettingsPersonalizerPromise){this.oUserSettingsPersonalizerPromise=sap.ushell.Container.getServiceAsync("Personalization").then(function(e){var t={keyCategory:e.constants.keyCategory.FIXED_KEY,writeFrequency:e.constants.writeFrequency.LOW,clientStorageAllowed:true};var i={container:"sap.ushell.services.Notifications",item:"userSettingsData"};return e.getPersonalizer(i,t)})}return this.oUserSettingsPersonalizerPromise};this._updateCSRF=function(e){if(Y===true||e.headers===undefined){return}if(!this._getHeaderXcsrfToken()){P=e.headers["x-csrf-token"]||e.headers["X-CSRF-Token"]||e.headers["X-Csrf-Token"]}if(!this._getDataServiceVersion()){O=e.headers.DataServiceVersion||e.headers["odata-version"]}Y=true};this._userSettingInitialization=function(){var e,t,i,s={settingsAvailable:false,mobileAvailable:false,emailAvailable:false},n,o,r,a;this._readUserSettingsFlagsFromPersonalization();e=this._readSettingsFromServer();t=this._readMobileSettingsFromServer();i=this._readEmailSettingsFromServer();n=[e,t,i];e.done(function(){s.settingsAvailable=true});t.done(function(e){o=JSON.parse(e);r=o.successStatus;if(r){j=e?o.IsActive:false;s.mobileAvailable=j}else{j=false;s.mobileAvailable=false}});i.done(function(e){o=JSON.parse(e);a=o.successStatus;if(a){W=e?o.IsActive:false;s.emailAvailable=W}else{W=false;s.emailAvailable=false}});jQuery.when.apply(jQuery,n).then(function(){H.resolve(s)})};this._closeConnection=function(){if(!E){if(G===F.WEB_SOCKET&&v){v.close();E=true}if(G===F.POLLING&&T){clearTimeout(T);E=true}}};this._resumeConnection=function(){if(E){E=false;this._webSocketStep()}}}f.hasNoAdapter=true;return f},true);
//# sourceMappingURL=Notifications.js.map