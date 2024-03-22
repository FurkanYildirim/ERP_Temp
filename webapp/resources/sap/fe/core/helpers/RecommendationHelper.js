/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";var e={};const t={sortRecommendationsData(e){const t=e.recommendations;t.sort((e,t)=>{if(e.probability<t.probability){return 1}else if(e.probability>t.probability){return-1}else{return 0}});const r=e;delete r["recommendations"];r.additionalValues=t},transformRecommendationsForInternalStorage(e){if(e.hasOwnProperty("recommendations")){this.sortRecommendationsData(e);return}else if(Array.isArray(e)){e.forEach(e=>{Object.values(e).forEach(e=>{if(typeof e==="object"){this.transformRecommendationsForInternalStorage(e)}})})}else{Object.values(e).forEach(e=>{if(typeof e==="object"){this.transformRecommendationsForInternalStorage(e)}})}}};e.recommendationHelper=t;return e},false);
//# sourceMappingURL=RecommendationHelper.js.map