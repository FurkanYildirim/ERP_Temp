/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core", "sap/ui/core/library"], function (Core, _library) {
  "use strict";

  const ParamHandlingMode = {
    /**
     * The conflict resolution favors the SelectionVariant over URL parameters
     *
     * @public
     */
    SelVarWins: "SelVarWins",
    /**
     * The conflict resolution favors the URL parameters over the SelectionVariant. Caution: In case of cross-app navigation
     * a navigation parameter value from the source app is overwritten by a default, if a default is maintained in the launchpad
     * designer for this parameter in the target app!
     *
     * @public
     */
    URLParamWins: "URLParamWins",
    /**
     * The conflict resolution adds URL parameters to the SelectionVariant
     *
     * @public
     */
    InsertInSelOpt: "InsertInSelOpt"
  };
  const NavType = {
    /**
     * Initial startup without any navigation or default parameters
     *
     * @public
     */
    initial: "initial",
    /**
     * Basic cross-app navigation with URL parameters only (without sap-xapp-state) or initial start with default parameters
     *
     * @public
     */
    URLParams: "URLParams",
    /**
     * Cross-app navigation with sap-xapp-state parameter (and URL parameters), defaulted parameters may be added
     *
     * @public
     */
    xAppState: "xAppState",
    /**
     * Back navigation with sap-iapp-state parameter
     *
     * @public
     */
    iAppState: "iAppState",
    /**
     * Passing iapp-state data within xapp state in addition to existing values
     *
     * @private
     */
    hybrid: "hybrid"
  };
  const SuppressionBehavior = {
    /**
     * Standard suppression behavior: semantic attributes with a <code>null</code> or an <code>undefined</code> value are ignored,
     * the remaining attributes are mixed in to the selection variant
     *
     * @public
     */
    standard: 0,
    /**
     * Semantic attributes with an empty string are ignored, the remaining attributes are mixed in to the selection variant.
     * Warning! Consider the impact on Boolean variable values!
     *
     * @public
     */
    ignoreEmptyString: 1,
    /**
     * Semantic attributes with a <code>null</code> value lead to an {@link sap.fin.central.lib.error.Error error} of type NavigationHandler.INVALID_INPUT
     *
     * @public
     */
    raiseErrorOnNull: 2,
    /**
     * Semantic attributes with an <code>undefined</code> value lead to an {@link sap.fin.central.lib.error.Error error} of type NavigationHandler.INVALID_INPUT
     *
     * @public
     */
    raiseErrorOnUndefined: 4
  };
  const Mode = {
    /**
     * This is used for ODataV2 services to do some internal tasks like creation of appstate, removal of sensitive data etc.,
     *
     * @public
     */
    ODataV2: "ODataV2",
    /**
     * This is used for ODataV4 services to do some internal tasks like creation of appstate, removal of sensitive data etc.,
     *
     * @public
     */
    ODataV4: "ODataV4"
  };

  /**
   * Common library for all cross-application navigation functions.
   *
   * @public
   * @name sap.fe.navigation
   * @namespace
   * @since 1.83.0
   */
  const thisLib = Core.initLibrary({
    name: "sap.fe.navigation",
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.115.1",
    dependencies: ["sap.ui.core"],
    types: ["sap.fe.navigation.NavType", "sap.fe.navigation.ParamHandlingMode", "sap.fe.navigation.SuppressionBehavior"],
    interfaces: [],
    controls: [],
    elements: [],
    noLibraryCSS: true
  });

  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.ParamHandlingMode}.<br>
   * A static enumeration type which indicates the conflict resolution method when merging URL parameters into select options.
   *
   * @public
   * @name sap.fe.navigation.ParamHandlingMode
   * @enum {string}
   * @readonly
   * @since 1.83.0
   */
  thisLib.ParamHandlingMode = ParamHandlingMode;

  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.NavType}.<br>
   * A static enumeration type which indicates the type of inbound navigation.
   *
   * @public
   * @name sap.fe.navigation.NavType
   * @enum {string}
   * @readonly
   * @since 1.83.0
   */
  thisLib.NavType = NavType;

  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.SuppressionBehavior}.<br>
   * A static enumeration type which indicates whether semantic attributes with values <code>null</code>,
   * <code>undefined</code> or <code>""</code> (empty string) shall be suppressed, before they are mixed in to the selection variant in the
   * method {@link sap.fe.navigation.NavigationHandler.mixAttributesAndSelectionVariant mixAttributesAndSelectionVariant}
   * of the {@link sap.fe.navigation.NavigationHandler NavigationHandler}.
   *
   * @public
   * @name sap.fe.navigation.SuppressionBehavior
   * @enum {string}
   * @readonly
   * @since 1.83.0
   */
  thisLib.SuppressionBehavior = SuppressionBehavior;

  /**
   * A static enumeration type which indicates the Odata version used for runnning the Navigation Handler.
   *
   * @public
   * @name sap.fe.navigation.Mode
   * @enum {string}
   * @readonly
   * @since 1.83.0
   */
  thisLib.Mode = Mode;
  return thisLib;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYXJhbUhhbmRsaW5nTW9kZSIsIlNlbFZhcldpbnMiLCJVUkxQYXJhbVdpbnMiLCJJbnNlcnRJblNlbE9wdCIsIk5hdlR5cGUiLCJpbml0aWFsIiwiVVJMUGFyYW1zIiwieEFwcFN0YXRlIiwiaUFwcFN0YXRlIiwiaHlicmlkIiwiU3VwcHJlc3Npb25CZWhhdmlvciIsInN0YW5kYXJkIiwiaWdub3JlRW1wdHlTdHJpbmciLCJyYWlzZUVycm9yT25OdWxsIiwicmFpc2VFcnJvck9uVW5kZWZpbmVkIiwiTW9kZSIsIk9EYXRhVjIiLCJPRGF0YVY0IiwidGhpc0xpYiIsIkNvcmUiLCJpbml0TGlicmFyeSIsIm5hbWUiLCJ2ZXJzaW9uIiwiZGVwZW5kZW5jaWVzIiwidHlwZXMiLCJpbnRlcmZhY2VzIiwiY29udHJvbHMiLCJlbGVtZW50cyIsIm5vTGlicmFyeUNTUyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsibGlicmFyeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuXG5jb25zdCBQYXJhbUhhbmRsaW5nTW9kZSA9IHtcblx0LyoqXG5cdCAqIFRoZSBjb25mbGljdCByZXNvbHV0aW9uIGZhdm9ycyB0aGUgU2VsZWN0aW9uVmFyaWFudCBvdmVyIFVSTCBwYXJhbWV0ZXJzXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdFNlbFZhcldpbnM6IFwiU2VsVmFyV2luc1wiLFxuXG5cdC8qKlxuXHQgKiBUaGUgY29uZmxpY3QgcmVzb2x1dGlvbiBmYXZvcnMgdGhlIFVSTCBwYXJhbWV0ZXJzIG92ZXIgdGhlIFNlbGVjdGlvblZhcmlhbnQuIENhdXRpb246IEluIGNhc2Ugb2YgY3Jvc3MtYXBwIG5hdmlnYXRpb25cblx0ICogYSBuYXZpZ2F0aW9uIHBhcmFtZXRlciB2YWx1ZSBmcm9tIHRoZSBzb3VyY2UgYXBwIGlzIG92ZXJ3cml0dGVuIGJ5IGEgZGVmYXVsdCwgaWYgYSBkZWZhdWx0IGlzIG1haW50YWluZWQgaW4gdGhlIGxhdW5jaHBhZFxuXHQgKiBkZXNpZ25lciBmb3IgdGhpcyBwYXJhbWV0ZXIgaW4gdGhlIHRhcmdldCBhcHAhXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdFVSTFBhcmFtV2luczogXCJVUkxQYXJhbVdpbnNcIixcblxuXHQvKipcblx0ICogVGhlIGNvbmZsaWN0IHJlc29sdXRpb24gYWRkcyBVUkwgcGFyYW1ldGVycyB0byB0aGUgU2VsZWN0aW9uVmFyaWFudFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRJbnNlcnRJblNlbE9wdDogXCJJbnNlcnRJblNlbE9wdFwiXG59IGFzIGNvbnN0O1xuXG5jb25zdCBOYXZUeXBlID0ge1xuXHQvKipcblx0ICogSW5pdGlhbCBzdGFydHVwIHdpdGhvdXQgYW55IG5hdmlnYXRpb24gb3IgZGVmYXVsdCBwYXJhbWV0ZXJzXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGluaXRpYWw6IFwiaW5pdGlhbFwiLFxuXG5cdC8qKlxuXHQgKiBCYXNpYyBjcm9zcy1hcHAgbmF2aWdhdGlvbiB3aXRoIFVSTCBwYXJhbWV0ZXJzIG9ubHkgKHdpdGhvdXQgc2FwLXhhcHAtc3RhdGUpIG9yIGluaXRpYWwgc3RhcnQgd2l0aCBkZWZhdWx0IHBhcmFtZXRlcnNcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0VVJMUGFyYW1zOiBcIlVSTFBhcmFtc1wiLFxuXG5cdC8qKlxuXHQgKiBDcm9zcy1hcHAgbmF2aWdhdGlvbiB3aXRoIHNhcC14YXBwLXN0YXRlIHBhcmFtZXRlciAoYW5kIFVSTCBwYXJhbWV0ZXJzKSwgZGVmYXVsdGVkIHBhcmFtZXRlcnMgbWF5IGJlIGFkZGVkXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHhBcHBTdGF0ZTogXCJ4QXBwU3RhdGVcIixcblxuXHQvKipcblx0ICogQmFjayBuYXZpZ2F0aW9uIHdpdGggc2FwLWlhcHAtc3RhdGUgcGFyYW1ldGVyXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGlBcHBTdGF0ZTogXCJpQXBwU3RhdGVcIixcblxuXHQvKipcblx0ICogUGFzc2luZyBpYXBwLXN0YXRlIGRhdGEgd2l0aGluIHhhcHAgc3RhdGUgaW4gYWRkaXRpb24gdG8gZXhpc3RpbmcgdmFsdWVzXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRoeWJyaWQ6IFwiaHlicmlkXCJcbn0gYXMgY29uc3Q7XG5cbmNvbnN0IFN1cHByZXNzaW9uQmVoYXZpb3IgPSB7XG5cdC8qKlxuXHQgKiBTdGFuZGFyZCBzdXBwcmVzc2lvbiBiZWhhdmlvcjogc2VtYW50aWMgYXR0cmlidXRlcyB3aXRoIGEgPGNvZGU+bnVsbDwvY29kZT4gb3IgYW4gPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiB2YWx1ZSBhcmUgaWdub3JlZCxcblx0ICogdGhlIHJlbWFpbmluZyBhdHRyaWJ1dGVzIGFyZSBtaXhlZCBpbiB0byB0aGUgc2VsZWN0aW9uIHZhcmlhbnRcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0c3RhbmRhcmQ6IDAsXG5cblx0LyoqXG5cdCAqIFNlbWFudGljIGF0dHJpYnV0ZXMgd2l0aCBhbiBlbXB0eSBzdHJpbmcgYXJlIGlnbm9yZWQsIHRoZSByZW1haW5pbmcgYXR0cmlidXRlcyBhcmUgbWl4ZWQgaW4gdG8gdGhlIHNlbGVjdGlvbiB2YXJpYW50LlxuXHQgKiBXYXJuaW5nISBDb25zaWRlciB0aGUgaW1wYWN0IG9uIEJvb2xlYW4gdmFyaWFibGUgdmFsdWVzIVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRpZ25vcmVFbXB0eVN0cmluZzogMSxcblxuXHQvKipcblx0ICogU2VtYW50aWMgYXR0cmlidXRlcyB3aXRoIGEgPGNvZGU+bnVsbDwvY29kZT4gdmFsdWUgbGVhZCB0byBhbiB7QGxpbmsgc2FwLmZpbi5jZW50cmFsLmxpYi5lcnJvci5FcnJvciBlcnJvcn0gb2YgdHlwZSBOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJhaXNlRXJyb3JPbk51bGw6IDIsXG5cblx0LyoqXG5cdCAqIFNlbWFudGljIGF0dHJpYnV0ZXMgd2l0aCBhbiA8Y29kZT51bmRlZmluZWQ8L2NvZGU+IHZhbHVlIGxlYWQgdG8gYW4ge0BsaW5rIHNhcC5maW4uY2VudHJhbC5saWIuZXJyb3IuRXJyb3IgZXJyb3J9IG9mIHR5cGUgTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRyYWlzZUVycm9yT25VbmRlZmluZWQ6IDRcbn0gYXMgY29uc3Q7XG5cbmNvbnN0IE1vZGUgPSB7XG5cdC8qKlxuXHQgKiBUaGlzIGlzIHVzZWQgZm9yIE9EYXRhVjIgc2VydmljZXMgdG8gZG8gc29tZSBpbnRlcm5hbCB0YXNrcyBsaWtlIGNyZWF0aW9uIG9mIGFwcHN0YXRlLCByZW1vdmFsIG9mIHNlbnNpdGl2ZSBkYXRhIGV0Yy4sXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdE9EYXRhVjI6IFwiT0RhdGFWMlwiLFxuXG5cdC8qKlxuXHQgKiBUaGlzIGlzIHVzZWQgZm9yIE9EYXRhVjQgc2VydmljZXMgdG8gZG8gc29tZSBpbnRlcm5hbCB0YXNrcyBsaWtlIGNyZWF0aW9uIG9mIGFwcHN0YXRlLCByZW1vdmFsIG9mIHNlbnNpdGl2ZSBkYXRhIGV0Yy4sXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdE9EYXRhVjQ6IFwiT0RhdGFWNFwiXG59IGFzIGNvbnN0O1xuXG4vKipcbiAqIENvbW1vbiBsaWJyYXJ5IGZvciBhbGwgY3Jvc3MtYXBwbGljYXRpb24gbmF2aWdhdGlvbiBmdW5jdGlvbnMuXG4gKlxuICogQHB1YmxpY1xuICogQG5hbWUgc2FwLmZlLm5hdmlnYXRpb25cbiAqIEBuYW1lc3BhY2VcbiAqIEBzaW5jZSAxLjgzLjBcbiAqL1xuY29uc3QgdGhpc0xpYiA9IENvcmUuaW5pdExpYnJhcnkoe1xuXHRuYW1lOiBcInNhcC5mZS5uYXZpZ2F0aW9uXCIsXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10ZW1wbGF0ZS1jdXJseS1pbi1zdHJpbmdcblx0dmVyc2lvbjogXCIke3ZlcnNpb259XCIsXG5cdGRlcGVuZGVuY2llczogW1wic2FwLnVpLmNvcmVcIl0sXG5cdHR5cGVzOiBbXCJzYXAuZmUubmF2aWdhdGlvbi5OYXZUeXBlXCIsIFwic2FwLmZlLm5hdmlnYXRpb24uUGFyYW1IYW5kbGluZ01vZGVcIiwgXCJzYXAuZmUubmF2aWdhdGlvbi5TdXBwcmVzc2lvbkJlaGF2aW9yXCJdLFxuXHRpbnRlcmZhY2VzOiBbXSxcblx0Y29udHJvbHM6IFtdLFxuXHRlbGVtZW50czogW10sXG5cdG5vTGlicmFyeUNTUzogdHJ1ZVxufSkgYXMge1xuXHRba2V5OiBzdHJpbmddOiB1bmtub3duO1xuXHRQYXJhbUhhbmRsaW5nTW9kZTogdHlwZW9mIFBhcmFtSGFuZGxpbmdNb2RlO1xuXHROYXZUeXBlOiB0eXBlb2YgTmF2VHlwZTtcblx0U3VwcHJlc3Npb25CZWhhdmlvcjogdHlwZW9mIFN1cHByZXNzaW9uQmVoYXZpb3I7XG5cdE1vZGU6IHR5cGVvZiBNb2RlO1xufTtcblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBzdWNjZXNzb3Igb2Yge0BsaW5rIHNhcC51aS5nZW5lcmljLmFwcC5uYXZpZ2F0aW9uLnNlcnZpY2UuUGFyYW1IYW5kbGluZ01vZGV9Ljxicj5cbiAqIEEgc3RhdGljIGVudW1lcmF0aW9uIHR5cGUgd2hpY2ggaW5kaWNhdGVzIHRoZSBjb25mbGljdCByZXNvbHV0aW9uIG1ldGhvZCB3aGVuIG1lcmdpbmcgVVJMIHBhcmFtZXRlcnMgaW50byBzZWxlY3Qgb3B0aW9ucy5cbiAqXG4gKiBAcHVibGljXG4gKiBAbmFtZSBzYXAuZmUubmF2aWdhdGlvbi5QYXJhbUhhbmRsaW5nTW9kZVxuICogQGVudW0ge3N0cmluZ31cbiAqIEByZWFkb25seVxuICogQHNpbmNlIDEuODMuMFxuICovXG50aGlzTGliLlBhcmFtSGFuZGxpbmdNb2RlID0gUGFyYW1IYW5kbGluZ01vZGU7XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgc3VjY2Vzc29yIG9mIHtAbGluayBzYXAudWkuZ2VuZXJpYy5hcHAubmF2aWdhdGlvbi5zZXJ2aWNlLk5hdlR5cGV9Ljxicj5cbiAqIEEgc3RhdGljIGVudW1lcmF0aW9uIHR5cGUgd2hpY2ggaW5kaWNhdGVzIHRoZSB0eXBlIG9mIGluYm91bmQgbmF2aWdhdGlvbi5cbiAqXG4gKiBAcHVibGljXG4gKiBAbmFtZSBzYXAuZmUubmF2aWdhdGlvbi5OYXZUeXBlXG4gKiBAZW51bSB7c3RyaW5nfVxuICogQHJlYWRvbmx5XG4gKiBAc2luY2UgMS44My4wXG4gKi9cbnRoaXNMaWIuTmF2VHlwZSA9IE5hdlR5cGU7XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgc3VjY2Vzc29yIG9mIHtAbGluayBzYXAudWkuZ2VuZXJpYy5hcHAubmF2aWdhdGlvbi5zZXJ2aWNlLlN1cHByZXNzaW9uQmVoYXZpb3J9Ljxicj5cbiAqIEEgc3RhdGljIGVudW1lcmF0aW9uIHR5cGUgd2hpY2ggaW5kaWNhdGVzIHdoZXRoZXIgc2VtYW50aWMgYXR0cmlidXRlcyB3aXRoIHZhbHVlcyA8Y29kZT5udWxsPC9jb2RlPixcbiAqIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gb3IgPGNvZGU+XCJcIjwvY29kZT4gKGVtcHR5IHN0cmluZykgc2hhbGwgYmUgc3VwcHJlc3NlZCwgYmVmb3JlIHRoZXkgYXJlIG1peGVkIGluIHRvIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBpbiB0aGVcbiAqIG1ldGhvZCB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXIubWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQgbWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnR9XG4gKiBvZiB0aGUge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdmlnYXRpb25IYW5kbGVyIE5hdmlnYXRpb25IYW5kbGVyfS5cbiAqXG4gKiBAcHVibGljXG4gKiBAbmFtZSBzYXAuZmUubmF2aWdhdGlvbi5TdXBwcmVzc2lvbkJlaGF2aW9yXG4gKiBAZW51bSB7c3RyaW5nfVxuICogQHJlYWRvbmx5XG4gKiBAc2luY2UgMS44My4wXG4gKi9cbnRoaXNMaWIuU3VwcHJlc3Npb25CZWhhdmlvciA9IFN1cHByZXNzaW9uQmVoYXZpb3I7XG5cbi8qKlxuICogQSBzdGF0aWMgZW51bWVyYXRpb24gdHlwZSB3aGljaCBpbmRpY2F0ZXMgdGhlIE9kYXRhIHZlcnNpb24gdXNlZCBmb3IgcnVubm5pbmcgdGhlIE5hdmlnYXRpb24gSGFuZGxlci5cbiAqXG4gKiBAcHVibGljXG4gKiBAbmFtZSBzYXAuZmUubmF2aWdhdGlvbi5Nb2RlXG4gKiBAZW51bSB7c3RyaW5nfVxuICogQHJlYWRvbmx5XG4gKiBAc2luY2UgMS44My4wXG4gKi9cbnRoaXNMaWIuTW9kZSA9IE1vZGU7XG5cbmV4cG9ydCBkZWZhdWx0IHRoaXNMaWI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFHQSxNQUFNQSxpQkFBaUIsR0FBRztJQUN6QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLFVBQVUsRUFBRSxZQUFZO0lBRXhCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLFlBQVksRUFBRSxjQUFjO0lBRTVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsY0FBYyxFQUFFO0VBQ2pCLENBQVU7RUFFVixNQUFNQyxPQUFPLEdBQUc7SUFDZjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLE9BQU8sRUFBRSxTQUFTO0lBRWxCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsU0FBUyxFQUFFLFdBQVc7SUFFdEI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxTQUFTLEVBQUUsV0FBVztJQUV0QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLFNBQVMsRUFBRSxXQUFXO0lBRXRCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsTUFBTSxFQUFFO0VBQ1QsQ0FBVTtFQUVWLE1BQU1DLG1CQUFtQixHQUFHO0lBQzNCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxRQUFRLEVBQUUsQ0FBQztJQUVYO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxpQkFBaUIsRUFBRSxDQUFDO0lBRXBCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsZ0JBQWdCLEVBQUUsQ0FBQztJQUVuQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLHFCQUFxQixFQUFFO0VBQ3hCLENBQVU7RUFFVixNQUFNQyxJQUFJLEdBQUc7SUFDWjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLE9BQU8sRUFBRSxTQUFTO0lBRWxCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsT0FBTyxFQUFFO0VBQ1YsQ0FBVTs7RUFFVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUMsT0FBTyxHQUFHQyxJQUFJLENBQUNDLFdBQVcsQ0FBQztJQUNoQ0MsSUFBSSxFQUFFLG1CQUFtQjtJQUN6QjtJQUNBQyxPQUFPLEVBQUUsWUFBWTtJQUNyQkMsWUFBWSxFQUFFLENBQUMsYUFBYSxDQUFDO0lBQzdCQyxLQUFLLEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxxQ0FBcUMsRUFBRSx1Q0FBdUMsQ0FBQztJQUNwSEMsVUFBVSxFQUFFLEVBQUU7SUFDZEMsUUFBUSxFQUFFLEVBQUU7SUFDWkMsUUFBUSxFQUFFLEVBQUU7SUFDWkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQU1BOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0FWLE9BQU8sQ0FBQ2xCLGlCQUFpQixHQUFHQSxpQkFBaUI7O0VBRTdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0FrQixPQUFPLENBQUNkLE9BQU8sR0FBR0EsT0FBTzs7RUFFekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQWMsT0FBTyxDQUFDUixtQkFBbUIsR0FBR0EsbUJBQW1COztFQUVqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQVEsT0FBTyxDQUFDSCxJQUFJLEdBQUdBLElBQUk7RUFBQyxPQUVMRyxPQUFPO0FBQUEifQ==