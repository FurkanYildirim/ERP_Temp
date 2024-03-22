/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./DateUtils","sap/ui/core/date/UI5Date"],function(e,t){"use strict";var i=function(){throw new Error};i.calculateFeedItemAge=function(i){var r="";if(!e.isValidDate(i)){return r}var a=t.getInstance();i.setMilliseconds(0);a.setMilliseconds(0);var s=sap.ui.getCore().getConfiguration().getLanguage();var g=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons",s);var T=6e4;var n=T*60;var E=n*24;if(a.getTime()-i.getTime()>=E){var u=parseInt((a.getTime()-i.getTime())/E,10);if(u===1){r=g.getText("FEEDTILE_DAY_AGO",[u])}else{r=g.getText("FEEDTILE_DAYS_AGO",[u])}}else if(a.getTime()-i.getTime()>=n){var o=parseInt((a.getTime()-i.getTime())/n,10);if(o===1){r=g.getText("FEEDTILE_HOUR_AGO",[o])}else{r=g.getText("FEEDTILE_HOURS_AGO",[o])}}else{var l=parseInt((a.getTime()-i.getTime())/T,10);if(l===1){r=g.getText("FEEDTILE_MINUTE_AGO",[l])}else{r=g.getText("FEEDTILE_MINUTES_AGO",[l])}}return r};return i},true);
//# sourceMappingURL=FeedItemUtils.js.map