/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  /**
   * Indicates that the property shall be declared as an xml attribute that can be used from the outside of the building block.
   *
   * If defining a runtime Building Block, please make sure to use the correct typings: Depending on its metadata,
   * a property can either be a {@link sap.ui.model.Context} (<code>type: 'sap.ui.model.Context'</code>),
   * a constant (<code>bindable: false</code>), or a {@link BindingToolkitExpression} (<code>bindable: true</code>).
   *
   * This decorator should only be used for properties that are to be set from outside or are used in inner XML templating.
   * If you just need simple computed properties, use undecorated, private TypeScript properties.
   *
   * @param attributeDefinition
   * @returns The decorated property
   */
  function blockAttribute(attributeDefinition) {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = target.constructor.metadata;
      if (attributeDefinition.defaultValue === undefined) {
        var _propertyDescriptor$i;
        // If there is no defaultValue we can take the value from the initializer (natural way of defining defaults)
        attributeDefinition.defaultValue = (_propertyDescriptor$i = propertyDescriptor.initializer) === null || _propertyDescriptor$i === void 0 ? void 0 : _propertyDescriptor$i.call(propertyDescriptor);
      }
      delete propertyDescriptor.initializer;
      if (metadata.properties[propertyKey.toString()] === undefined) {
        metadata.properties[propertyKey.toString()] = attributeDefinition;
      }
      return propertyDescriptor;
    }; // Needed to make TS happy with those decorators;
  }

  /**
   * Decorator for building blocks.
   *
   * This is an alias for @blockAttribute({ type: "function" }).
   *
   * @returns The decorated property
   */
  _exports.blockAttribute = blockAttribute;
  function blockEvent() {
    return blockAttribute({
      type: "function"
    });
  }

  /**
   * Indicates that the property shall be declared as an xml aggregation that can be used from the outside of the building block.
   *
   * @param aggregationDefinition
   * @returns The decorated property
   */
  _exports.blockEvent = blockEvent;
  function blockAggregation(aggregationDefinition) {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = target.constructor.metadata;
      delete propertyDescriptor.initializer;
      if (metadata.aggregations[propertyKey] === undefined) {
        metadata.aggregations[propertyKey] = aggregationDefinition;
      }
      if (aggregationDefinition.isDefault === true) {
        metadata.defaultAggregation = propertyKey;
      }
      return propertyDescriptor;
    };
  }
  _exports.blockAggregation = blockAggregation;
  function defineBuildingBlock(oBuildingBlockDefinition) {
    return function (classDefinition) {
      const metadata = classDefinition.metadata;
      metadata.namespace = oBuildingBlockDefinition.namespace;
      metadata.publicNamespace = oBuildingBlockDefinition.publicNamespace;
      metadata.name = oBuildingBlockDefinition.name;
      metadata.xmlTag = oBuildingBlockDefinition.xmlTag;
      metadata.fragment = oBuildingBlockDefinition.fragment;
      metadata.designtime = oBuildingBlockDefinition.designtime;
      metadata.isOpen = oBuildingBlockDefinition.isOpen;
    };
  }
  _exports.defineBuildingBlock = defineBuildingBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJibG9ja0F0dHJpYnV0ZSIsImF0dHJpYnV0ZURlZmluaXRpb24iLCJ0YXJnZXQiLCJwcm9wZXJ0eUtleSIsInByb3BlcnR5RGVzY3JpcHRvciIsIm1ldGFkYXRhIiwiY29uc3RydWN0b3IiLCJkZWZhdWx0VmFsdWUiLCJ1bmRlZmluZWQiLCJpbml0aWFsaXplciIsInByb3BlcnRpZXMiLCJ0b1N0cmluZyIsImJsb2NrRXZlbnQiLCJ0eXBlIiwiYmxvY2tBZ2dyZWdhdGlvbiIsImFnZ3JlZ2F0aW9uRGVmaW5pdGlvbiIsImFnZ3JlZ2F0aW9ucyIsImlzRGVmYXVsdCIsImRlZmF1bHRBZ2dyZWdhdGlvbiIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJvQnVpbGRpbmdCbG9ja0RlZmluaXRpb24iLCJjbGFzc0RlZmluaXRpb24iLCJuYW1lc3BhY2UiLCJwdWJsaWNOYW1lc3BhY2UiLCJuYW1lIiwieG1sVGFnIiwiZnJhZ21lbnQiLCJkZXNpZ250aW1lIiwiaXNPcGVuIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJCdWlsZGluZ0Jsb2NrU3VwcG9ydC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBCdWlsZGluZ0Jsb2NrQmFzZSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0Jhc2VcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5cbmV4cG9ydCB0eXBlIE9iamVjdFZhbHVlMiA9IHN0cmluZyB8IGJvb2xlYW4gfCBudW1iZXIgfCBDb250ZXh0IHwgdW5kZWZpbmVkIHwgb2JqZWN0IHwgbnVsbDtcbnR5cGUgT2JqZWN0VmFsdWUzPFQ+ID0gVCB8IFJlY29yZDxzdHJpbmcsIFQ+IHwgVFtdO1xuZXhwb3J0IHR5cGUgT2JqZWN0VmFsdWUgPSBPYmplY3RWYWx1ZTM8T2JqZWN0VmFsdWUyIHwgUmVjb3JkPHN0cmluZywgT2JqZWN0VmFsdWUyPiB8IE9iamVjdFZhbHVlMltdPjtcblxuLyoqXG4gKiBUeXBlIGZvciB0aGUgYWNjZXNzb3IgZGVjb3JhdG9yIHRoYXQgd2UgZW5kIHVwIHdpdGggaW4gYmFiZWwuXG4gKi9cbnR5cGUgQWNjZXNzb3JEZXNjcmlwdG9yPFQ+ID0gVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8VD4gJiB7IGluaXRpYWxpemVyPzogKCkgPT4gVCB9O1xudHlwZSBCYXNlQnVpbGRpbmdCbG9ja1Byb3BlcnR5RGVmaW5pdGlvbiA9IHtcblx0dHlwZTogc3RyaW5nO1xuXHRpc1B1YmxpYz86IGJvb2xlYW47XG5cdC8qKiBAZGVwcmVjYXRlZCBQcmVmZXIgdGhlIG5hdGl2ZSBUeXBlU2NyaXB0IGluaXRpYWxpemVyICovXG5cdGRlZmF1bHRWYWx1ZT86IHVua25vd247XG5cdC8qKiBNYWtlIHN1cmUgdG8gdHlwZSB0aGUgb3B0aW9uYWxpdHkgb2YgeW91ciBUeXBlU2NyaXB0IHByb3BlcnR5IGNvcnJlY3RseSAqL1xuXHRyZXF1aXJlZD86IGJvb2xlYW47XG5cdC8qKiBUaGlzIHByb3BlcnR5IGlzIG9ubHkgY29uc2lkZXJlZCBmb3IgcnVudGltZSBidWlsZGluZyBibG9ja3MgKi9cblx0YmluZGFibGU/OiBib29sZWFuO1xuXHQvKiogRnVuY3Rpb24gdGhhdCBhbGxvd3MgdG8gdmFsaWRhdGUgb3IgdHJhbnNmb3JtIHRoZSBnaXZlbiBpbnB1dCAqL1xuXHR2YWxpZGF0ZT86IEZ1bmN0aW9uO1xufTtcbmV4cG9ydCB0eXBlIEJ1aWxkaW5nQmxvY2tNZXRhZGF0YUNvbnRleHREZWZpbml0aW9uID0gQmFzZUJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24gJiB7XG5cdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIjtcblx0ZXhwZWN0ZWRUeXBlczogc3RyaW5nW107XG5cdGV4cGVjdGVkQW5ub3RhdGlvblR5cGVzOiBzdHJpbmdbXTtcbn07XG4vKipcbiAqIEF2YWlsYWJsZSBwcm9wZXJ0aWVzIHRvIGRlZmluZSBhIGJ1aWxkaW5nIGJsb2NrIHByb3BlcnR5XG4gKi9cbmV4cG9ydCB0eXBlIEJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24gPSBCYXNlQnVpbGRpbmdCbG9ja1Byb3BlcnR5RGVmaW5pdGlvbiB8IEJ1aWxkaW5nQmxvY2tNZXRhZGF0YUNvbnRleHREZWZpbml0aW9uO1xuXG4vKipcbiAqIEF2YWlsYWJsZSBwcm9wZXJ0aWVzIHRvIGRlZmluZSBhIGJ1aWxkaW5nIGJsb2NrIGFnZ3JlZ2F0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIEJ1aWxkaW5nQmxvY2tBZ2dyZWdhdGlvbkRlZmluaXRpb24gPSB7XG5cdGlzUHVibGljPzogYm9vbGVhbjtcblx0dHlwZTogc3RyaW5nO1xuXHRzbG90Pzogc3RyaW5nO1xuXHRpc0RlZmF1bHQ/OiBib29sZWFuO1xuXHQvKiogRGVmaW5lcyB3aGV0aGVyIHRoZSBlbGVtZW50IGlzIGJhc2VkIG9uIGFuIGFjdHVhbCBub2RlIHRoYXQgd2lsbCBiZSByZW5kZXJlZCBvciBvbmx5IG9uIFhNTCB0aGF0IHdpbGwgYmUgaW50ZXJwcmV0ZWQgKi9cblx0aGFzVmlydHVhbE5vZGU/OiBib29sZWFuO1xuXHRwcm9jZXNzQWdncmVnYXRpb25zPzogRnVuY3Rpb247XG59O1xuXG4vKipcbiAqIEF2YWlsYWJsZSBwcm9wZXJ0aWVzIHRvIGRlZmluZSBhIGJ1aWxkaW5nIGJsb2NrIGNsYXNzXG4gKi9cbmV4cG9ydCB0eXBlIEJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uID0ge1xuXHRuYW1lOiBzdHJpbmc7XG5cdG5hbWVzcGFjZT86IHN0cmluZztcblx0cHVibGljTmFtZXNwYWNlPzogc3RyaW5nO1xuXHR4bWxUYWc/OiBzdHJpbmc7XG5cdGZyYWdtZW50Pzogc3RyaW5nO1xuXHRkZXNpZ250aW1lPzogc3RyaW5nO1xuXHRpc09wZW4/OiBib29sZWFuO1xuXHRyZXR1cm5UeXBlcz86IHN0cmluZ1tdO1xufSAmICh7IG5hbWVzcGFjZTogc3RyaW5nIH0gfCB7IHB1YmxpY05hbWVzcGFjZTogc3RyaW5nIH0pO1xuXG4vKipcbiAqIE1ldGFkYXRhIGF0dGFjaGVkIHRvIGVhY2ggYnVpbGRpbmcgYmxvY2sgY2xhc3NcbiAqL1xuZXhwb3J0IHR5cGUgQnVpbGRpbmdCbG9ja01ldGFkYXRhID0gQnVpbGRpbmdCbG9ja0RlZmluaXRpb24gJiB7XG5cdHByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24+O1xuXHRhZ2dyZWdhdGlvbnM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tBZ2dyZWdhdGlvbkRlZmluaXRpb24+O1xuXHRzdGVyZW90eXBlOiBzdHJpbmc7XG5cdGRlZmF1bHRBZ2dyZWdhdGlvbj86IHN0cmluZztcbn07XG5cbi8qKlxuICogSW5kaWNhdGVzIHRoYXQgdGhlIHByb3BlcnR5IHNoYWxsIGJlIGRlY2xhcmVkIGFzIGFuIHhtbCBhdHRyaWJ1dGUgdGhhdCBjYW4gYmUgdXNlZCBmcm9tIHRoZSBvdXRzaWRlIG9mIHRoZSBidWlsZGluZyBibG9jay5cbiAqXG4gKiBJZiBkZWZpbmluZyBhIHJ1bnRpbWUgQnVpbGRpbmcgQmxvY2ssIHBsZWFzZSBtYWtlIHN1cmUgdG8gdXNlIHRoZSBjb3JyZWN0IHR5cGluZ3M6IERlcGVuZGluZyBvbiBpdHMgbWV0YWRhdGEsXG4gKiBhIHByb3BlcnR5IGNhbiBlaXRoZXIgYmUgYSB7QGxpbmsgc2FwLnVpLm1vZGVsLkNvbnRleHR9ICg8Y29kZT50eXBlOiAnc2FwLnVpLm1vZGVsLkNvbnRleHQnPC9jb2RlPiksXG4gKiBhIGNvbnN0YW50ICg8Y29kZT5iaW5kYWJsZTogZmFsc2U8L2NvZGU+KSwgb3IgYSB7QGxpbmsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9ufSAoPGNvZGU+YmluZGFibGU6IHRydWU8L2NvZGU+KS5cbiAqXG4gKiBUaGlzIGRlY29yYXRvciBzaG91bGQgb25seSBiZSB1c2VkIGZvciBwcm9wZXJ0aWVzIHRoYXQgYXJlIHRvIGJlIHNldCBmcm9tIG91dHNpZGUgb3IgYXJlIHVzZWQgaW4gaW5uZXIgWE1MIHRlbXBsYXRpbmcuXG4gKiBJZiB5b3UganVzdCBuZWVkIHNpbXBsZSBjb21wdXRlZCBwcm9wZXJ0aWVzLCB1c2UgdW5kZWNvcmF0ZWQsIHByaXZhdGUgVHlwZVNjcmlwdCBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSBhdHRyaWJ1dGVEZWZpbml0aW9uXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBibG9ja0F0dHJpYnV0ZShhdHRyaWJ1dGVEZWZpbml0aW9uOiBCdWlsZGluZ0Jsb2NrUHJvcGVydHlEZWZpbml0aW9uKTogUHJvcGVydHlEZWNvcmF0b3Ige1xuXHRyZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogQnVpbGRpbmdCbG9ja0Jhc2UsIHByb3BlcnR5S2V5OiBzdHJpbmcgfCBTeW1ib2wsIHByb3BlcnR5RGVzY3JpcHRvcjogQWNjZXNzb3JEZXNjcmlwdG9yPHVua25vd24+KSB7XG5cdFx0Y29uc3QgbWV0YWRhdGEgPSAodGFyZ2V0LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBCdWlsZGluZ0Jsb2NrQmFzZSkubWV0YWRhdGE7XG5cdFx0aWYgKGF0dHJpYnV0ZURlZmluaXRpb24uZGVmYXVsdFZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIElmIHRoZXJlIGlzIG5vIGRlZmF1bHRWYWx1ZSB3ZSBjYW4gdGFrZSB0aGUgdmFsdWUgZnJvbSB0aGUgaW5pdGlhbGl6ZXIgKG5hdHVyYWwgd2F5IG9mIGRlZmluaW5nIGRlZmF1bHRzKVxuXHRcdFx0YXR0cmlidXRlRGVmaW5pdGlvbi5kZWZhdWx0VmFsdWUgPSBwcm9wZXJ0eURlc2NyaXB0b3IuaW5pdGlhbGl6ZXI/LigpO1xuXHRcdH1cblx0XHRkZWxldGUgcHJvcGVydHlEZXNjcmlwdG9yLmluaXRpYWxpemVyO1xuXHRcdGlmIChtZXRhZGF0YS5wcm9wZXJ0aWVzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdG1ldGFkYXRhLnByb3BlcnRpZXNbcHJvcGVydHlLZXkudG9TdHJpbmcoKV0gPSBhdHRyaWJ1dGVEZWZpbml0aW9uO1xuXHRcdH1cblxuXHRcdHJldHVybiBwcm9wZXJ0eURlc2NyaXB0b3I7XG5cdH0gYXMgdW5rbm93biBhcyBQcm9wZXJ0eURlY29yYXRvcjsgLy8gTmVlZGVkIHRvIG1ha2UgVFMgaGFwcHkgd2l0aCB0aG9zZSBkZWNvcmF0b3JzO1xufVxuXG4vKipcbiAqIERlY29yYXRvciBmb3IgYnVpbGRpbmcgYmxvY2tzLlxuICpcbiAqIFRoaXMgaXMgYW4gYWxpYXMgZm9yIEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiZnVuY3Rpb25cIiB9KS5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBibG9ja0V2ZW50KCk6IFByb3BlcnR5RGVjb3JhdG9yIHtcblx0cmV0dXJuIGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJmdW5jdGlvblwiIH0pO1xufVxuXG4vKipcbiAqIEluZGljYXRlcyB0aGF0IHRoZSBwcm9wZXJ0eSBzaGFsbCBiZSBkZWNsYXJlZCBhcyBhbiB4bWwgYWdncmVnYXRpb24gdGhhdCBjYW4gYmUgdXNlZCBmcm9tIHRoZSBvdXRzaWRlIG9mIHRoZSBidWlsZGluZyBibG9jay5cbiAqXG4gKiBAcGFyYW0gYWdncmVnYXRpb25EZWZpbml0aW9uXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBibG9ja0FnZ3JlZ2F0aW9uKGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbjogQnVpbGRpbmdCbG9ja0FnZ3JlZ2F0aW9uRGVmaW5pdGlvbik6IFByb3BlcnR5RGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IEJ1aWxkaW5nQmxvY2tCYXNlLCBwcm9wZXJ0eUtleTogc3RyaW5nLCBwcm9wZXJ0eURlc2NyaXB0b3I6IEFjY2Vzc29yRGVzY3JpcHRvcjx1bmtub3duPikge1xuXHRcdGNvbnN0IG1ldGFkYXRhID0gKHRhcmdldC5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQnVpbGRpbmdCbG9ja0Jhc2UpLm1ldGFkYXRhO1xuXHRcdGRlbGV0ZSBwcm9wZXJ0eURlc2NyaXB0b3IuaW5pdGlhbGl6ZXI7XG5cdFx0aWYgKG1ldGFkYXRhLmFnZ3JlZ2F0aW9uc1twcm9wZXJ0eUtleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0bWV0YWRhdGEuYWdncmVnYXRpb25zW3Byb3BlcnR5S2V5XSA9IGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbjtcblx0XHR9XG5cdFx0aWYgKGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbi5pc0RlZmF1bHQgPT09IHRydWUpIHtcblx0XHRcdG1ldGFkYXRhLmRlZmF1bHRBZ2dyZWdhdGlvbiA9IHByb3BlcnR5S2V5O1xuXHRcdH1cblxuXHRcdHJldHVybiBwcm9wZXJ0eURlc2NyaXB0b3I7XG5cdH0gYXMgdW5rbm93biBhcyBQcm9wZXJ0eURlY29yYXRvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUJ1aWxkaW5nQmxvY2sob0J1aWxkaW5nQmxvY2tEZWZpbml0aW9uOiBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbik6IENsYXNzRGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChjbGFzc0RlZmluaXRpb246IFBhcnRpYWw8dHlwZW9mIEJ1aWxkaW5nQmxvY2tCYXNlPikge1xuXHRcdGNvbnN0IG1ldGFkYXRhID0gY2xhc3NEZWZpbml0aW9uLm1ldGFkYXRhITtcblx0XHRtZXRhZGF0YS5uYW1lc3BhY2UgPSBvQnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubmFtZXNwYWNlO1xuXHRcdG1ldGFkYXRhLnB1YmxpY05hbWVzcGFjZSA9IG9CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5wdWJsaWNOYW1lc3BhY2U7XG5cdFx0bWV0YWRhdGEubmFtZSA9IG9CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5uYW1lO1xuXHRcdG1ldGFkYXRhLnhtbFRhZyA9IG9CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi54bWxUYWc7XG5cdFx0bWV0YWRhdGEuZnJhZ21lbnQgPSBvQnVpbGRpbmdCbG9ja0RlZmluaXRpb24uZnJhZ21lbnQ7XG5cdFx0bWV0YWRhdGEuZGVzaWdudGltZSA9IG9CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5kZXNpZ250aW1lO1xuXHRcdG1ldGFkYXRhLmlzT3BlbiA9IG9CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5pc09wZW47XG5cdH07XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBc0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sU0FBU0EsY0FBYyxDQUFDQyxtQkFBb0QsRUFBcUI7SUFDdkcsT0FBTyxVQUFVQyxNQUF5QixFQUFFQyxXQUE0QixFQUFFQyxrQkFBK0MsRUFBRTtNQUMxSCxNQUFNQyxRQUFRLEdBQUlILE1BQU0sQ0FBQ0ksV0FBVyxDQUE4QkQsUUFBUTtNQUMxRSxJQUFJSixtQkFBbUIsQ0FBQ00sWUFBWSxLQUFLQyxTQUFTLEVBQUU7UUFBQTtRQUNuRDtRQUNBUCxtQkFBbUIsQ0FBQ00sWUFBWSw0QkFBR0gsa0JBQWtCLENBQUNLLFdBQVcsMERBQTlCLDJCQUFBTCxrQkFBa0IsQ0FBZ0I7TUFDdEU7TUFDQSxPQUFPQSxrQkFBa0IsQ0FBQ0ssV0FBVztNQUNyQyxJQUFJSixRQUFRLENBQUNLLFVBQVUsQ0FBQ1AsV0FBVyxDQUFDUSxRQUFRLEVBQUUsQ0FBQyxLQUFLSCxTQUFTLEVBQUU7UUFDOURILFFBQVEsQ0FBQ0ssVUFBVSxDQUFDUCxXQUFXLENBQUNRLFFBQVEsRUFBRSxDQUFDLEdBQUdWLG1CQUFtQjtNQUNsRTtNQUVBLE9BQU9HLGtCQUFrQjtJQUMxQixDQUFDLENBQWlDLENBQUM7RUFDcEM7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9PLFNBQVNRLFVBQVUsR0FBc0I7SUFDL0MsT0FBT1osY0FBYyxDQUFDO01BQUVhLElBQUksRUFBRTtJQUFXLENBQUMsQ0FBQztFQUM1Qzs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQTtFQU1PLFNBQVNDLGdCQUFnQixDQUFDQyxxQkFBeUQsRUFBcUI7SUFDOUcsT0FBTyxVQUFVYixNQUF5QixFQUFFQyxXQUFtQixFQUFFQyxrQkFBK0MsRUFBRTtNQUNqSCxNQUFNQyxRQUFRLEdBQUlILE1BQU0sQ0FBQ0ksV0FBVyxDQUE4QkQsUUFBUTtNQUMxRSxPQUFPRCxrQkFBa0IsQ0FBQ0ssV0FBVztNQUNyQyxJQUFJSixRQUFRLENBQUNXLFlBQVksQ0FBQ2IsV0FBVyxDQUFDLEtBQUtLLFNBQVMsRUFBRTtRQUNyREgsUUFBUSxDQUFDVyxZQUFZLENBQUNiLFdBQVcsQ0FBQyxHQUFHWSxxQkFBcUI7TUFDM0Q7TUFDQSxJQUFJQSxxQkFBcUIsQ0FBQ0UsU0FBUyxLQUFLLElBQUksRUFBRTtRQUM3Q1osUUFBUSxDQUFDYSxrQkFBa0IsR0FBR2YsV0FBVztNQUMxQztNQUVBLE9BQU9DLGtCQUFrQjtJQUMxQixDQUFDO0VBQ0Y7RUFBQztFQUVNLFNBQVNlLG1CQUFtQixDQUFDQyx3QkFBaUQsRUFBa0I7SUFDdEcsT0FBTyxVQUFVQyxlQUFrRCxFQUFFO01BQ3BFLE1BQU1oQixRQUFRLEdBQUdnQixlQUFlLENBQUNoQixRQUFTO01BQzFDQSxRQUFRLENBQUNpQixTQUFTLEdBQUdGLHdCQUF3QixDQUFDRSxTQUFTO01BQ3ZEakIsUUFBUSxDQUFDa0IsZUFBZSxHQUFHSCx3QkFBd0IsQ0FBQ0csZUFBZTtNQUNuRWxCLFFBQVEsQ0FBQ21CLElBQUksR0FBR0osd0JBQXdCLENBQUNJLElBQUk7TUFDN0NuQixRQUFRLENBQUNvQixNQUFNLEdBQUdMLHdCQUF3QixDQUFDSyxNQUFNO01BQ2pEcEIsUUFBUSxDQUFDcUIsUUFBUSxHQUFHTix3QkFBd0IsQ0FBQ00sUUFBUTtNQUNyRHJCLFFBQVEsQ0FBQ3NCLFVBQVUsR0FBR1Asd0JBQXdCLENBQUNPLFVBQVU7TUFDekR0QixRQUFRLENBQUN1QixNQUFNLEdBQUdSLHdCQUF3QixDQUFDUSxNQUFNO0lBQ2xELENBQUM7RUFDRjtFQUFDO0VBQUE7QUFBQSJ9