/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("sap.ca.ui.charts.BarListItemRenderer");jQuery.sap.require("sap.ui.core.Renderer");jQuery.sap.require("sap.m.ListItemBaseRenderer");sap.ca.ui.charts.BarListItemRenderer=sap.ui.core.Renderer.extend(sap.m.ListItemBaseRenderer);sap.ca.ui.charts.BarListItemRenderer.renderLIAttributes=function(e,r){e.addClass("sapMBLI")};sap.ca.ui.charts.BarListItemRenderer.renderLIContent=function(e,r){var a=r.getAxis();if(a){e.write("<p for='"+r.getId()+"-axis' class='sapMBLIAxis'>");e.writeEscaped(r.getAxis());e.write("</p>")}var s=r.getGroup();if(s){e.write("<label for='"+r.getId()+"-value' class='sapMBLIGroup'>");e.writeEscaped(r.getGroup());e.write("</label>")}var t=r.getValue();if(t){e.write("<div id='"+r.getId()+"-value' class='sapMBLIValue'>");e.writeEscaped(r.getValue());e.write("</div>")}};
//# sourceMappingURL=BarListItemRenderer.js.map