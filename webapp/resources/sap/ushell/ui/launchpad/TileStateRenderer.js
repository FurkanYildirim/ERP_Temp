// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,t){e.openStart("div",t);e.class("sapUshellGT");e.openEnd();var a=t.getState();e.openStart("div",t.getId()+"-overlay");e.class("sapUshellOverlay");if(a==="Failed"){e.attr("title",t._sFailedToLoad)}e.openEnd();switch(a){case"Loading":var l=t._getBusyContainer();e.renderControl(l);break;case"Failed":e.openStart("div",t.getId()+"-failed-ftr");e.class("sapUshellTileStateFtrFld");e.openEnd();e.openStart("div",t.getId()+"-failed-icon");e.class("sapUshellTileStateFtrFldIcn");e.openEnd();e.renderControl(t._oWarningIcon);e.close("div");e.openStart("div",t.getId()+"-failed-text");e.class("sapUshellTileStateFtrFldTxt");e.openEnd();e.text(t._sFailedToLoad);e.close("div");e.close("div");break;default:}e.close("div");e.close("div")};return e},true);
//# sourceMappingURL=TileStateRenderer.js.map