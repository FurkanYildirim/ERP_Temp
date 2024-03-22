/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CreateRectangleToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"../svg/Element"
], function(
	EventProvider,
	Element
) {
	"use strict";

	var CreateRectangleToolHandler = EventProvider.extend("sap.ui.vk.tools.CreateRectangleToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 30; // the priority of the handler
			this._tool = tool;
			this._rect = null;
		}
	});

	/**
	 * Calculates mouse position in world space.
	 * @param {object} event Mouse event.
	 * @returns {object} Mouse position in world space.
	 * @private
	 */
	CreateRectangleToolHandler.prototype._getPosition = function(event) {
		var pos = this._tool._viewport._camera._screenToWorld(event.x - this._rect.x, event.y - this._rect.y);
		var matrix = Element._invertMatrix(this._tool.getGizmo()._root._matrixWorld());
		return Element._transformPoint(pos.x, pos.y, matrix);
	};

	/**
	 * Mouse hover event handler.
	 * @param {object} event Event.
	 */
	CreateRectangleToolHandler.prototype.hover = function(event) { };

	/**
	 * Begin gesture event handler.
	 * @param {object} event Event.
	 */
	CreateRectangleToolHandler.prototype.beginGesture = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._inside(event)) {
			if (event.buttons === 1) {
				this._gesture = true;
				event.handled = true;
				gizmo._startAdding(this._getPosition(event));
			}
		}
	};

	/**
	 * Mouse move event handler.
	 * @param {object} event Event.
	 */
	CreateRectangleToolHandler.prototype.move = function(event) {
		if (this._gesture) {
			event.handled = true;
			this._tool.getGizmo()._update(this._getPosition(event), event.event && (sap.ui.Device.os.macintosh ? event.event.metaKey : event.event.ctrlKey));
		}
	};

	/**
	 * End gesture event handler.
	 * @param {object} event Event.
	 */
	CreateRectangleToolHandler.prototype.endGesture = function(event) {
		if (this._gesture) {
			this._gesture = false;
			event.handled = true;
			this._tool.getGizmo()._stopAdding(this._getPosition(event));
		}
	};

	/**
	 * Click event handler.
	 * @param {object} event Event.
	 */
	CreateRectangleToolHandler.prototype.click = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._inside(event)) {
			event.handled = true; // no viewport taps when the tool is activated
		}
	};

	/**
	 * Double-click event handler.
	 * @param {object} event Event.
	 */
	CreateRectangleToolHandler.prototype.doubleClick = function(event) { };

	/**
	 * Context menu open event handler.
	 * @param {object} event Event.
	 */
	CreateRectangleToolHandler.prototype.contextMenu = function(event) { };

	/**
	 * Returns the viewport to which this handler is attached.
	 * @return {sap.ui.vk.svg.Viewport} Viewport.
	 */
	CreateRectangleToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	CreateRectangleToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	CreateRectangleToolHandler.prototype._inside = function(event) {
		var id = this._tool._viewport.getIdForLabel();
		var domobj = document.getElementById(id);

		if (domobj == null) {
			return false;
		}

		var offset = this._getOffset(domobj);
		this._rect = {
			x: offset.x,
			y: offset.y,
			w: domobj.offsetWidth,
			h: domobj.offsetHeight
		};

		return (event.x >= this._rect.x && event.x <= this._rect.x + this._rect.w && event.y >= this._rect.y && event.y <= this._rect.y + this._rect.h);
	};

	return CreateRectangleToolHandler;
});