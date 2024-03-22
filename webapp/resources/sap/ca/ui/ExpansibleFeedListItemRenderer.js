/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("sap.ca.ui.ExpansibleFeedListItemRenderer");jQuery.sap.require("sap.ui.core.Renderer");jQuery.sap.require("sap.m.FeedListItemRenderer");sap.ca.ui.ExpansibleFeedListItemRenderer=sap.ui.core.Renderer.extend(sap.m.FeedListItemRenderer);sap.ca.ui.ExpansibleFeedListItemRenderer.renderLIContent=function(e,t){var i=t.getId(),s=jQuery.device.is.phone;e.write("<article");e.writeControlData(t);e.addClass("sapMFeedListItem");e.addClass("sapCaUiExpansibleFeedListItem");e.writeClasses();e.write(">");if(!!t.getShowIcon()){e.write('<figure id="'+i+'-figure" class ="sapMFeedListItemFigure');if(!!t.getIcon()){e.write('">')}else{e.write(' sapMFeedListItemIsDefaultIcon">')}if(!!t.getIconActive()){e.write('<a id="'+i+'-iconRef" >')}e.renderControl(t._getAvatar());if(!!t.getIconActive()){e.write("</a>")}e.write("</figure>")}if(s){e.write('<div class= "sapMFeedListItemHeader ');if(!!t.getShowIcon()){e.write("sapMFeedListItemHasFigure ")}if(!!t.getSender()&&!!t.getTimestamp()){e.write("sapMFeedListItemFullHeight")}e.write('" >');if(!!t.getSender()){e.write('<p id="'+i+'-name" class="sapMFeedListItemTextName">');e.renderControl(t._getLinkControl());e.write("</p>")}if(!!t.getTimestamp()){e.write('<p class="sapMFeedListItemTimestamp">');e.writeEscaped(t.getTimestamp());e.write("</p>")}e.write("</div>");e.write('<p id="'+i+'-text" class="sapMFeedListItemText">');e.writeEscaped(t.getText(),true);e.write("</p>");if(t.getMaxLines()>0){sap.ca.ui.ExpansibleFeedListItemRenderer.renderSeeMoreContent(e,t)}if(!!t.getInfo()){e.write('<p class="sapMFeedListItemFooter">');if(!!t.getInfo()){e.write('<span class="sapMFeedListItemInfo">');e.writeEscaped(t.getInfo());e.write("</span>")}}}else{e.write('<div class= "sapMFeedListItemText ');if(!!t.getShowIcon()){e.write("sapMFeedListItemHasFigure ")}e.write('" >');e.write('<p id="'+i+'-text" class="sapMFeedListItemTextText">');if(!!t.getSender()){e.write('<span id="'+i+'-name" class="sapMFeedListItemTextName">');e.renderControl(t._getLinkControl());e.write(": ");e.write("</span>")}e.writeEscaped(t.getText(),true);if(t.getMaxLines()>0){sap.ca.ui.ExpansibleFeedListItemRenderer.renderSeeMoreContent(e,t)}if(!!t.getInfo()||!!t.getTimestamp()){e.write('<p class="sapMFeedListItemFooter">');if(!!t.getInfo()){e.writeEscaped(t.getInfo());if(!!t.getTimestamp()){e.write("&#160;&#160;&#x00B7;&#160;&#160;")}}if(!!t.getTimestamp()){e.writeEscaped(t.getTimestamp())}}e.write("</p>");e.write("</div>")}e.write("</article>")};sap.ca.ui.ExpansibleFeedListItemRenderer.renderSeeMoreContent=function(e,t){e.write("<div");e.addClass("sapCaUiExpansibleFeedListItemSeeMoreLink");e.writeClasses();e.write(">");e.write("<p");e.addClass("sapCaUiExpansibleFeedListItemSeeMoreLinkDots");e.writeClasses();e.write(">...</p>");e.renderControl(t._getSeeMoreLink());e.write("</div>")};
//# sourceMappingURL=ExpansibleFeedListItemRenderer.js.map