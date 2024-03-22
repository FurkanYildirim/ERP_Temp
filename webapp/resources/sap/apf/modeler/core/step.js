/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
sap.ui.define(["sap/apf/utils/exportToGlobal","sap/ui/thirdparty/jquery"],function(e,jQuery){"use strict";function t(e,t,r){var n,i,o,s,p,a,u,c,f,l,g,h,d,y,v,m,P,b,T,E,F;P=t.instances.messageHandler;if(!r){n=new t.constructors.ElementContainer(e+"-Representation",t.constructors.Representation,t);i={};o=new t.constructors.ElementContainer("SelectProperty",undefined,t);s=new t.constructors.ElementContainer("FilterProperty",undefined,t);p={};a=new t.constructors.ElementContainer("SelectPropertyForFilterMapping",undefined,t);u=new t.constructors.ElementContainer("TargetPropertyForFilterMapping",undefined,t);f=false;c=new t.constructors.ElementContainer("NavigationTarget",undefined,t)}else{n=r.representationContainer;i=r.request;o=r.selectProperties;s=r.filterProperties;b=r.filterPropertyLabelKey;T=r.filterPropertyLabelDisplayOption;E=r.targetPropertyLabelKey;F=r.targetPropertyLabelDisplayOption;p=r.requestForFilterMapping;a=r.selectPropertiesForFilterMapping;u=r.targetPropertiesForFilterMapping;f=r.keepSourceForFilterMapping;c=r.navigationTargets;l=r.titleId;g=r.longTitleId;h=r.leftUpperCornerTextKey;d=r.rightUpperCornerTextKey;y=r.leftLowerCornerTextKey;v=r.rightLowerCornerTextKey;m=r.topNSettings}this.getType=function(){return"step"};this.getId=function(){return e};this.setTopN=function(e,t){if(t&&t instanceof Array&&t.length>0){this.resetTopN();m={};m.top=e;m.orderby=t}else{P.putMessage(P.createMessageObject({code:11016}));return}n.getElements().forEach(function(t){t.setTopN(e);m.orderby.forEach(function(e){t.addOrderbySpec(e.property,e.ascending)})})};this.setTopNValue=function(e){if(!m){m={}}m.top=e;if(m.orderby){S()}};this.setTopNSortProperties=function(e){if(!m){m={}}if(e&&e.length>0){e.forEach(function(e){if(e.ascending==="true"){e.ascending=true}})}m.orderby=e;if(m.top){S()}};function S(){n.getElements().forEach(function(e){e.setTopN(m.top);e.removeAllOrderbySpecs();m.orderby.forEach(function(t){e.addOrderbySpec(t.property,t.ascending)})})}this.getTopN=function(){if(m&&m.top>0){if(Array.isArray(m.orderby)){var e=this.getSelectProperties();var t;for(t=m.orderby.length-1;t>=0;t--){if(!e.includes(m.orderby[t].property)){m.orderby.splice(t,1);S()}}}return jQuery.extend({},true,m)}};this.resetTopN=function(){m=undefined;n.getElements().forEach(function(e){if(e.getTopN()){e.setTopN(undefined)}})};this.getService=function(){return i.service};this.setService=function(e){i.service=e};this.getEntitySet=function(){return i.entitySet};this.setEntitySet=function(e){i.entitySet=e};this.setTitleId=function(e){l=e};this.getTitleId=function(){return l};this.setLongTitleId=function(e){g=e};this.getLongTitleId=function(){return g};this.getSelectProperties=function(){var e=[];var t=o.getElements();t.forEach(function(t){e.push(t.getId())});return e};this.addSelectProperty=function(e){o.createElementWithProposedId(undefined,e)};this.removeSelectProperty=function(e){o.removeElement(e)};this.getFilterProperties=function(){var e=[];var t=s.getElements();t.forEach(function(t){e.push(t.getId())});return e};this.addFilterProperty=function(e){b=undefined;T=undefined;return s.createElementWithProposedId(undefined,e).getId()};this.removeFilterProperty=function(e){b=undefined;T=undefined;s.removeElement(e)};this.setFilterPropertyLabelKey=function(e){b=e};this.getFilterPropertyLabelKey=function(){return b};this.setFilterPropertyLabelDisplayOption=function(e){T=e};this.getFilterPropertyLabelDisplayOption=function(){return T};this.setFilterMappingService=function(e){p.service=e};this.getFilterMappingService=function(){return p.service};this.setFilterMappingEntitySet=function(e){p.entitySet=e};this.getFilterMappingEntitySet=function(){return p.entitySet};this.addFilterMappingTargetProperty=function(e){E=undefined;F=undefined;u.createElementWithProposedId(undefined,e)};this.getFilterMappingTargetProperties=function(){var e=[];var t=u.getElements();t.forEach(function(t){e.push(t.getId())});return e};this.removeFilterMappingTargetProperty=function(e){E=undefined;F=undefined;u.removeElement(e)};this.setFilterMappingTargetPropertyLabelKey=function(e){E=e};this.getFilterMappingTargetPropertyLabelKey=function(){return E};this.setFilterMappingTargetPropertyLabelDisplayOption=function(e){F=e};this.getFilterMappingTargetPropertyLabelDisplayOption=function(){return F};this.addNavigationTarget=function(e){c.createElementWithProposedId(undefined,e)};this.getNavigationTargets=function(){var e=[];var t=c.getElements();t.forEach(function(t){e.push(t.getId())});return e};this.removeNavigationTarget=function(e){c.removeElement(e)};this.setFilterMappingKeepSource=function(e){f=e};this.getFilterMappingKeepSource=function(){return f};this.getRepresentations=n.getElements;this.getRepresentation=n.getElement;this.createRepresentation=function(e){var t;if(e&&e.id){t=n.createElementWithProposedId(e,e.id)}else{t=n.createElement(e)}if(m&&m.top){t.setTopN(m.top);m.orderby.forEach(function(e){t.addOrderbySpec(e.property,e.ascending)})}return t};this.removeRepresentation=n.removeElement;this.copyRepresentation=n.copyElement;this.moveRepresentationBefore=function(e,t){return n.moveBefore(e,t)};this.moveRepresentationUpOrDown=function(e,t){return n.moveUpOrDown(e,t)};this.moveRepresentationToEnd=function(e){return n.moveToEnd(e)};this.setLeftUpperCornerTextKey=function(e){h=e};this.getLeftUpperCornerTextKey=function(){return h};this.setRightUpperCornerTextKey=function(e){d=e};this.getRightUpperCornerTextKey=function(){return d};this.setLeftLowerCornerTextKey=function(e){y=e};this.getLeftLowerCornerTextKey=function(){return y};this.setRightLowerCornerTextKey=function(e){v=e};this.getRightLowerCornerTextKey=function(){return v};this.getConsumablePropertiesForTopN=function(){var e=jQuery.Deferred();this.getAvailableProperties().done(function(t){var r=[];if(m&&m.orderby&&m.orderby.length>0){m.orderby.forEach(function(e){r.push(e.property)})}e.resolve({available:t,consumable:this.getConsumableProperties(t,r)})}.bind(this));return e.promise()};this.getConsumablePropertiesForRepresentation=function(e){var t=jQuery.Deferred();function r(e){var t=[];jQuery.merge(t,e.getDimensions());jQuery.merge(t,e.getMeasures());jQuery.merge(t,e.getProperties());return t}this.getAvailableProperties().done(function(i){if(this.getHierarchyProperty&&this.getHierarchyProperty()){i.push(this.getHierarchyProperty())}var o=[];var s=n.getElement(e);if(s){o=r(s);if(s.getHierarchyProperty){o.push(s.getHierarchyProperty())}}else{o=this.getSelectProperties()}t.resolve({available:i,consumable:this.getConsumableProperties(i,o)})}.bind(this));return t.promise()};this.getConsumableSortPropertiesForRepresentation=function(e){var t=jQuery.Deferred();this.getAvailableProperties().done(function(r){t.resolve({available:r,consumable:this.getConsumableProperties(r,this.getSortPropertiesFromRepresentation(e))})}.bind(this));return t.promise()};this.getSortPropertiesFromRepresentation=function(e){var t=[];var r=n.getElement(e);var i=r.getOrderbySpecifications();i.forEach(function(e){t.push(e.property)});return t};this.getConsumableProperties=function(e,t){var r=[];e.forEach(function(e){if(jQuery.inArray(e,t)===-1){r.push(e)}});return r};this.getAvailableProperties=function(){var e=jQuery.Deferred();var r=[];if(i.service&&i.entitySet){t.instances.metadataFactory.getMetadata(i.service).then(function(t){if(t){var n=t.getAllPropertiesOfEntitySet(i.entitySet);var o=this.getSelectProperties();o.forEach(function(e){if(jQuery.inArray(e,n)!==-1){r.push(e)}})}e.resolve(r)}.bind(this),function(){e.resolve([])})}else{e.resolve([])}return e.promise()};this.copy=function(e){var r=sap.apf.modeler.core.ConfigurationObjects.deepDataCopy(this.getDataForCopy());r.representationContainer=n.copy((e||this.getId())+"-Representation");return new sap.apf.modeler.core.Step(e||this.getId(),t,r)};this.getDataForCopy=function(){return{request:i,selectProperties:o,filterProperties:s,filterPropertyLabelKey:b,filterPropertyLabelDisplayOption:T,requestForFilterMapping:p,selectPropertiesForFilterMapping:a,targetPropertiesForFilterMapping:u,targetPropertyLabelKey:E,targetPropertyLabelDisplayOption:F,navigationTargets:c,keepSourceForFilterMapping:f,titleId:l,longTitleId:g,leftUpperCornerTextKey:h,rightUpperCornerTextKey:d,leftLowerCornerTextKey:y,rightLowerCornerTextKey:v,topNSettings:m}};this.getRepresentationContainer=function(){return n}}e("sap.apf.modeler.core.Step",t);return t});
//# sourceMappingURL=step.js.map