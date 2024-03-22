/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var n=function(n,r){var t;if(typeof n==="string"){if(n.length&&n.endsWith("\r\n")){n=n.substring(0,n.lastIndexOf("\r\n"))}if(r){t=n.split(/\r\n|\r|\n|\t/g)}else{t=n.split(/\r\n|\r|\n/g)}}else{t=[n]}return t};return n});
//# sourceMappingURL=splitValue.js.map