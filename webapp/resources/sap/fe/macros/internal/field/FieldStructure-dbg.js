/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/helpers/StableIdHelper", "sap/ui/mdc/enum/EditMode", "./DisplayStyle", "./EditStyle"], function (BuildingBlockTemplateProcessor, StableIdHelper, EditMode, DisplayStyle, EditStyle) {
  "use strict";

  var generate = StableIdHelper.generate;
  var xml = BuildingBlockTemplateProcessor.xml;
  function getTemplateWithFieldApi(internalField, template) {
    let id;
    if (internalField.formatOptions.fieldMode === "nowrapper" && internalField.editMode === EditMode.Display) {
      return template;
    }
    if (internalField._apiId) {
      id = internalField._apiId;
    } else if (internalField.idPrefix) {
      id = generate([internalField.idPrefix, "Field"]);
    } else {
      id = undefined;
    }
    if (internalField.onChange === null || internalField.onChange === "null") {
      internalField.onChange = undefined;
    }
    return xml`
			<macroField:FieldAPI
				xmlns:macroField="sap.fe.macros.field"
				change="${internalField.onChange}"
				id="${id}"
				required="${internalField.requiredExpression}"
				editable="${internalField.editableExpression}"
				collaborationEnabled="${internalField.collaborationEnabled}"
				visible="${internalField.visible}"
			>
				${template}
			</macroField:FieldAPI>
		`;
  }

  /**
   * Helps to calculate the content edit functionality / templating.
   *
   * @param internalField Reference to the current internal field instance
   * @returns An XML-based string with the definition of the field control
   */
  function getContentEdit(internalField) {
    let contentEdit;
    if (internalField.editMode !== EditMode.Display && !!internalField.editStyle) {
      const editStyleTemplate = EditStyle.getTemplate(internalField);
      let contentInnerEdit;
      if (internalField.collaborationEnabled ?? false) {
        contentInnerEdit = xml`<HBox xmlns="sap.m" width="100%">
            ${editStyleTemplate}
            <core:Fragment fragmentName="sap.fe.macros.internal.CollaborationAvatar" type="XML" />
        </HBox>`;
      } else {
        contentInnerEdit = editStyleTemplate;
      }
      contentEdit = xml`${contentInnerEdit}`;
    }
    return contentEdit || "";
  }

  /**
   * Create the fieldWrapper control for use cases with display and edit styles.
   *
   * @param internalField Reference to the current internal field instance
   * @returns An XML-based string with the definition of the field control
   */
  function createFieldWrapper(internalField) {
    let fieldWrapperID;
    if (internalField._flexId) {
      fieldWrapperID = internalField._flexId;
    } else if (internalField.idPrefix) {
      fieldWrapperID = generate([internalField.idPrefix, "Field-content"]);
    } else {
      fieldWrapperID = undefined;
    }

    // compute the display part and the edit part for the fieldwrapper control
    const contentDisplay = DisplayStyle.getTemplate(internalField);
    // content edit part needs to be wrapped further with an hbox in case of collaboration mode
    // that´s why we need to call this special helper here which finally calls the editStyle.getTemplate
    const contentEdit = getContentEdit(internalField);
    return xml`<controls:FieldWrapper
		xmlns:controls="sap.fe.macros.controls"
		id="${fieldWrapperID}"
		editMode="${internalField.editMode}"
		visible="${internalField.visible}"
		width="100%"
		textAlign="${internalField.textAlign}"
		class="${internalField.class}"
		>

		<controls:contentDisplay>
			${contentDisplay}
		</controls:contentDisplay>
		<controls:contentEdit>
			${contentEdit}
		</controls:contentEdit>

	</controls:FieldWrapper>`;
  }

  /**
   * Helps to calculate the field structure wrapper.
   *
   * @param internalField Reference to the current internal field instance
   * @returns An XML-based string with the definition of the field control
   */
  function getFieldStructureTemplate(internalField) {
    //compute the field in case of mentioned display styles
    if (internalField.displayStyle === "Avatar" || internalField.displayStyle === "Contact" || internalField.displayStyle === "Button" || internalField.displayStyle === "File") {
      // check for special handling in case a file type is used with the collaboration mode
      // (renders an avatar directly)
      if (internalField.displayStyle === "File" && (internalField.collaborationEnabled ?? false) && internalField.editMode !== EditMode.Display) {
        const box = xml`
				<HBox xmlns="sap.m" width="100%">
				<VBox width="100%">
					${DisplayStyle.getFileTemplate(internalField)}
				</VBox>
				<core:Fragment fragmentName="sap.fe.macros.internal.CollaborationAvatar" type="XML" />
			</HBox>`;
        return getTemplateWithFieldApi(internalField, box);
      } else {
        //for all other cases render the displayStyles with a field api wrapper
        return getTemplateWithFieldApi(internalField, DisplayStyle.getTemplate(internalField));
      }
    } else if (internalField.formatOptions.fieldMode === "nowrapper" && internalField.editMode === EditMode.Display) {
      //renders a display based building block (e.g. a button) that has no field api wrapper around it.
      return DisplayStyle.getTemplate(internalField);
    } else {
      //for all other cases create a field wrapper
      const fieldWrapper = createFieldWrapper(internalField);
      return getTemplateWithFieldApi(internalField, fieldWrapper);
    }
  }
  return getFieldStructureTemplate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRUZW1wbGF0ZVdpdGhGaWVsZEFwaSIsImludGVybmFsRmllbGQiLCJ0ZW1wbGF0ZSIsImlkIiwiZm9ybWF0T3B0aW9ucyIsImZpZWxkTW9kZSIsImVkaXRNb2RlIiwiRWRpdE1vZGUiLCJEaXNwbGF5IiwiX2FwaUlkIiwiaWRQcmVmaXgiLCJnZW5lcmF0ZSIsInVuZGVmaW5lZCIsIm9uQ2hhbmdlIiwieG1sIiwicmVxdWlyZWRFeHByZXNzaW9uIiwiZWRpdGFibGVFeHByZXNzaW9uIiwiY29sbGFib3JhdGlvbkVuYWJsZWQiLCJ2aXNpYmxlIiwiZ2V0Q29udGVudEVkaXQiLCJjb250ZW50RWRpdCIsImVkaXRTdHlsZSIsImVkaXRTdHlsZVRlbXBsYXRlIiwiRWRpdFN0eWxlIiwiZ2V0VGVtcGxhdGUiLCJjb250ZW50SW5uZXJFZGl0IiwiY3JlYXRlRmllbGRXcmFwcGVyIiwiZmllbGRXcmFwcGVySUQiLCJfZmxleElkIiwiY29udGVudERpc3BsYXkiLCJEaXNwbGF5U3R5bGUiLCJ0ZXh0QWxpZ24iLCJjbGFzcyIsImdldEZpZWxkU3RydWN0dXJlVGVtcGxhdGUiLCJkaXNwbGF5U3R5bGUiLCJib3giLCJnZXRGaWxlVGVtcGxhdGUiLCJmaWVsZFdyYXBwZXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpZWxkU3RydWN0dXJlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCBFZGl0TW9kZSBmcm9tIFwic2FwL3VpL21kYy9lbnVtL0VkaXRNb2RlXCI7XG5pbXBvcnQgSW50ZXJuYWxGaWVsZEJsb2NrIGZyb20gXCIuLi9JbnRlcm5hbEZpZWxkLmJsb2NrXCI7XG5pbXBvcnQgRGlzcGxheVN0eWxlIGZyb20gXCIuL0Rpc3BsYXlTdHlsZVwiO1xuaW1wb3J0IEVkaXRTdHlsZSBmcm9tIFwiLi9FZGl0U3R5bGVcIjtcblxuZnVuY3Rpb24gZ2V0VGVtcGxhdGVXaXRoRmllbGRBcGkoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrLCB0ZW1wbGF0ZTogc3RyaW5nKSB7XG5cdGxldCBpZDtcblxuXHRpZiAoaW50ZXJuYWxGaWVsZC5mb3JtYXRPcHRpb25zLmZpZWxkTW9kZSA9PT0gXCJub3dyYXBwZXJcIiAmJiBpbnRlcm5hbEZpZWxkLmVkaXRNb2RlID09PSBFZGl0TW9kZS5EaXNwbGF5KSB7XG5cdFx0cmV0dXJuIHRlbXBsYXRlO1xuXHR9XG5cblx0aWYgKGludGVybmFsRmllbGQuX2FwaUlkKSB7XG5cdFx0aWQgPSBpbnRlcm5hbEZpZWxkLl9hcGlJZDtcblx0fSBlbHNlIGlmIChpbnRlcm5hbEZpZWxkLmlkUHJlZml4KSB7XG5cdFx0aWQgPSBnZW5lcmF0ZShbaW50ZXJuYWxGaWVsZC5pZFByZWZpeCwgXCJGaWVsZFwiXSk7XG5cdH0gZWxzZSB7XG5cdFx0aWQgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHRpZiAoaW50ZXJuYWxGaWVsZC5vbkNoYW5nZSA9PT0gbnVsbCB8fCBpbnRlcm5hbEZpZWxkLm9uQ2hhbmdlID09PSBcIm51bGxcIikge1xuXHRcdGludGVybmFsRmllbGQub25DaGFuZ2UgPSB1bmRlZmluZWQ7XG5cdH1cblx0cmV0dXJuIHhtbGBcblx0XHRcdDxtYWNyb0ZpZWxkOkZpZWxkQVBJXG5cdFx0XHRcdHhtbG5zOm1hY3JvRmllbGQ9XCJzYXAuZmUubWFjcm9zLmZpZWxkXCJcblx0XHRcdFx0Y2hhbmdlPVwiJHtpbnRlcm5hbEZpZWxkLm9uQ2hhbmdlfVwiXG5cdFx0XHRcdGlkPVwiJHtpZH1cIlxuXHRcdFx0XHRyZXF1aXJlZD1cIiR7aW50ZXJuYWxGaWVsZC5yZXF1aXJlZEV4cHJlc3Npb259XCJcblx0XHRcdFx0ZWRpdGFibGU9XCIke2ludGVybmFsRmllbGQuZWRpdGFibGVFeHByZXNzaW9ufVwiXG5cdFx0XHRcdGNvbGxhYm9yYXRpb25FbmFibGVkPVwiJHtpbnRlcm5hbEZpZWxkLmNvbGxhYm9yYXRpb25FbmFibGVkfVwiXG5cdFx0XHRcdHZpc2libGU9XCIke2ludGVybmFsRmllbGQudmlzaWJsZX1cIlxuXHRcdFx0PlxuXHRcdFx0XHQke3RlbXBsYXRlfVxuXHRcdFx0PC9tYWNyb0ZpZWxkOkZpZWxkQVBJPlxuXHRcdGA7XG59XG5cbi8qKlxuICogSGVscHMgdG8gY2FsY3VsYXRlIHRoZSBjb250ZW50IGVkaXQgZnVuY3Rpb25hbGl0eSAvIHRlbXBsYXRpbmcuXG4gKlxuICogQHBhcmFtIGludGVybmFsRmllbGQgUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGludGVybmFsIGZpZWxkIGluc3RhbmNlXG4gKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcbiAqL1xuZnVuY3Rpb24gZ2V0Q29udGVudEVkaXQoaW50ZXJuYWxGaWVsZDogSW50ZXJuYWxGaWVsZEJsb2NrKSB7XG5cdGxldCBjb250ZW50RWRpdDtcblxuXHRpZiAoaW50ZXJuYWxGaWVsZC5lZGl0TW9kZSAhPT0gRWRpdE1vZGUuRGlzcGxheSAmJiAhIWludGVybmFsRmllbGQuZWRpdFN0eWxlKSB7XG5cdFx0Y29uc3QgZWRpdFN0eWxlVGVtcGxhdGUgPSBFZGl0U3R5bGUuZ2V0VGVtcGxhdGUoaW50ZXJuYWxGaWVsZCk7XG5cdFx0bGV0IGNvbnRlbnRJbm5lckVkaXQ7XG5cdFx0aWYgKGludGVybmFsRmllbGQuY29sbGFib3JhdGlvbkVuYWJsZWQgPz8gZmFsc2UpIHtcblx0XHRcdGNvbnRlbnRJbm5lckVkaXQgPSB4bWxgPEhCb3ggeG1sbnM9XCJzYXAubVwiIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgICAgICAgJHtlZGl0U3R5bGVUZW1wbGF0ZX1cbiAgICAgICAgICAgIDxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuQ29sbGFib3JhdGlvbkF2YXRhclwiIHR5cGU9XCJYTUxcIiAvPlxuICAgICAgICA8L0hCb3g+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29udGVudElubmVyRWRpdCA9IGVkaXRTdHlsZVRlbXBsYXRlO1xuXHRcdH1cblxuXHRcdGNvbnRlbnRFZGl0ID0geG1sYCR7Y29udGVudElubmVyRWRpdH1gO1xuXHR9XG5cdHJldHVybiBjb250ZW50RWRpdCB8fCBcIlwiO1xufVxuXG4vKipcbiAqIENyZWF0ZSB0aGUgZmllbGRXcmFwcGVyIGNvbnRyb2wgZm9yIHVzZSBjYXNlcyB3aXRoIGRpc3BsYXkgYW5kIGVkaXQgc3R5bGVzLlxuICpcbiAqIEBwYXJhbSBpbnRlcm5hbEZpZWxkIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBpbnRlcm5hbCBmaWVsZCBpbnN0YW5jZVxuICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUZpZWxkV3JhcHBlcihpbnRlcm5hbEZpZWxkOiBJbnRlcm5hbEZpZWxkQmxvY2spIHtcblx0bGV0IGZpZWxkV3JhcHBlcklEO1xuXHRpZiAoaW50ZXJuYWxGaWVsZC5fZmxleElkKSB7XG5cdFx0ZmllbGRXcmFwcGVySUQgPSBpbnRlcm5hbEZpZWxkLl9mbGV4SWQ7XG5cdH0gZWxzZSBpZiAoaW50ZXJuYWxGaWVsZC5pZFByZWZpeCkge1xuXHRcdGZpZWxkV3JhcHBlcklEID0gZ2VuZXJhdGUoW2ludGVybmFsRmllbGQuaWRQcmVmaXgsIFwiRmllbGQtY29udGVudFwiXSk7XG5cdH0gZWxzZSB7XG5cdFx0ZmllbGRXcmFwcGVySUQgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHQvLyBjb21wdXRlIHRoZSBkaXNwbGF5IHBhcnQgYW5kIHRoZSBlZGl0IHBhcnQgZm9yIHRoZSBmaWVsZHdyYXBwZXIgY29udHJvbFxuXHRjb25zdCBjb250ZW50RGlzcGxheSA9IERpc3BsYXlTdHlsZS5nZXRUZW1wbGF0ZShpbnRlcm5hbEZpZWxkKTtcblx0Ly8gY29udGVudCBlZGl0IHBhcnQgbmVlZHMgdG8gYmUgd3JhcHBlZCBmdXJ0aGVyIHdpdGggYW4gaGJveCBpbiBjYXNlIG9mIGNvbGxhYm9yYXRpb24gbW9kZVxuXHQvLyB0aGF0wrRzIHdoeSB3ZSBuZWVkIHRvIGNhbGwgdGhpcyBzcGVjaWFsIGhlbHBlciBoZXJlIHdoaWNoIGZpbmFsbHkgY2FsbHMgdGhlIGVkaXRTdHlsZS5nZXRUZW1wbGF0ZVxuXHRjb25zdCBjb250ZW50RWRpdCA9IGdldENvbnRlbnRFZGl0KGludGVybmFsRmllbGQpO1xuXHRyZXR1cm4geG1sYDxjb250cm9sczpGaWVsZFdyYXBwZXJcblx0XHR4bWxuczpjb250cm9scz1cInNhcC5mZS5tYWNyb3MuY29udHJvbHNcIlxuXHRcdGlkPVwiJHtmaWVsZFdyYXBwZXJJRH1cIlxuXHRcdGVkaXRNb2RlPVwiJHtpbnRlcm5hbEZpZWxkLmVkaXRNb2RlfVwiXG5cdFx0dmlzaWJsZT1cIiR7aW50ZXJuYWxGaWVsZC52aXNpYmxlfVwiXG5cdFx0d2lkdGg9XCIxMDAlXCJcblx0XHR0ZXh0QWxpZ249XCIke2ludGVybmFsRmllbGQudGV4dEFsaWdufVwiXG5cdFx0Y2xhc3M9XCIke2ludGVybmFsRmllbGQuY2xhc3N9XCJcblx0XHQ+XG5cblx0XHQ8Y29udHJvbHM6Y29udGVudERpc3BsYXk+XG5cdFx0XHQke2NvbnRlbnREaXNwbGF5fVxuXHRcdDwvY29udHJvbHM6Y29udGVudERpc3BsYXk+XG5cdFx0PGNvbnRyb2xzOmNvbnRlbnRFZGl0PlxuXHRcdFx0JHtjb250ZW50RWRpdH1cblx0XHQ8L2NvbnRyb2xzOmNvbnRlbnRFZGl0PlxuXG5cdDwvY29udHJvbHM6RmllbGRXcmFwcGVyPmA7XG59XG5cbi8qKlxuICogSGVscHMgdG8gY2FsY3VsYXRlIHRoZSBmaWVsZCBzdHJ1Y3R1cmUgd3JhcHBlci5cbiAqXG4gKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2VcbiAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZmllbGQgY29udHJvbFxuICovXG5mdW5jdGlvbiBnZXRGaWVsZFN0cnVjdHVyZVRlbXBsYXRlKGludGVybmFsRmllbGQ6IEludGVybmFsRmllbGRCbG9jaykge1xuXHQvL2NvbXB1dGUgdGhlIGZpZWxkIGluIGNhc2Ugb2YgbWVudGlvbmVkIGRpc3BsYXkgc3R5bGVzXG5cdGlmIChcblx0XHRpbnRlcm5hbEZpZWxkLmRpc3BsYXlTdHlsZSA9PT0gXCJBdmF0YXJcIiB8fFxuXHRcdGludGVybmFsRmllbGQuZGlzcGxheVN0eWxlID09PSBcIkNvbnRhY3RcIiB8fFxuXHRcdGludGVybmFsRmllbGQuZGlzcGxheVN0eWxlID09PSBcIkJ1dHRvblwiIHx8XG5cdFx0aW50ZXJuYWxGaWVsZC5kaXNwbGF5U3R5bGUgPT09IFwiRmlsZVwiXG5cdCkge1xuXHRcdC8vIGNoZWNrIGZvciBzcGVjaWFsIGhhbmRsaW5nIGluIGNhc2UgYSBmaWxlIHR5cGUgaXMgdXNlZCB3aXRoIHRoZSBjb2xsYWJvcmF0aW9uIG1vZGVcblx0XHQvLyAocmVuZGVycyBhbiBhdmF0YXIgZGlyZWN0bHkpXG5cdFx0aWYgKFxuXHRcdFx0aW50ZXJuYWxGaWVsZC5kaXNwbGF5U3R5bGUgPT09IFwiRmlsZVwiICYmXG5cdFx0XHQoaW50ZXJuYWxGaWVsZC5jb2xsYWJvcmF0aW9uRW5hYmxlZCA/PyBmYWxzZSkgJiZcblx0XHRcdGludGVybmFsRmllbGQuZWRpdE1vZGUgIT09IEVkaXRNb2RlLkRpc3BsYXlcblx0XHQpIHtcblx0XHRcdGNvbnN0IGJveCA9IHhtbGBcblx0XHRcdFx0PEhCb3ggeG1sbnM9XCJzYXAubVwiIHdpZHRoPVwiMTAwJVwiPlxuXHRcdFx0XHQ8VkJveCB3aWR0aD1cIjEwMCVcIj5cblx0XHRcdFx0XHQke0Rpc3BsYXlTdHlsZS5nZXRGaWxlVGVtcGxhdGUoaW50ZXJuYWxGaWVsZCl9XG5cdFx0XHRcdDwvVkJveD5cblx0XHRcdFx0PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5Db2xsYWJvcmF0aW9uQXZhdGFyXCIgdHlwZT1cIlhNTFwiIC8+XG5cdFx0XHQ8L0hCb3g+YDtcblx0XHRcdHJldHVybiBnZXRUZW1wbGF0ZVdpdGhGaWVsZEFwaShpbnRlcm5hbEZpZWxkLCBib3gpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL2ZvciBhbGwgb3RoZXIgY2FzZXMgcmVuZGVyIHRoZSBkaXNwbGF5U3R5bGVzIHdpdGggYSBmaWVsZCBhcGkgd3JhcHBlclxuXHRcdFx0cmV0dXJuIGdldFRlbXBsYXRlV2l0aEZpZWxkQXBpKGludGVybmFsRmllbGQsIERpc3BsYXlTdHlsZS5nZXRUZW1wbGF0ZShpbnRlcm5hbEZpZWxkKSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGludGVybmFsRmllbGQuZm9ybWF0T3B0aW9ucy5maWVsZE1vZGUgPT09IFwibm93cmFwcGVyXCIgJiYgaW50ZXJuYWxGaWVsZC5lZGl0TW9kZSA9PT0gRWRpdE1vZGUuRGlzcGxheSkge1xuXHRcdC8vcmVuZGVycyBhIGRpc3BsYXkgYmFzZWQgYnVpbGRpbmcgYmxvY2sgKGUuZy4gYSBidXR0b24pIHRoYXQgaGFzIG5vIGZpZWxkIGFwaSB3cmFwcGVyIGFyb3VuZCBpdC5cblx0XHRyZXR1cm4gRGlzcGxheVN0eWxlLmdldFRlbXBsYXRlKGludGVybmFsRmllbGQpO1xuXHR9IGVsc2Uge1xuXHRcdC8vZm9yIGFsbCBvdGhlciBjYXNlcyBjcmVhdGUgYSBmaWVsZCB3cmFwcGVyXG5cdFx0Y29uc3QgZmllbGRXcmFwcGVyID0gY3JlYXRlRmllbGRXcmFwcGVyKGludGVybmFsRmllbGQpO1xuXHRcdHJldHVybiBnZXRUZW1wbGF0ZVdpdGhGaWVsZEFwaShpbnRlcm5hbEZpZWxkLCBmaWVsZFdyYXBwZXIpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldEZpZWxkU3RydWN0dXJlVGVtcGxhdGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7OztFQU9BLFNBQVNBLHVCQUF1QixDQUFDQyxhQUFpQyxFQUFFQyxRQUFnQixFQUFFO0lBQ3JGLElBQUlDLEVBQUU7SUFFTixJQUFJRixhQUFhLENBQUNHLGFBQWEsQ0FBQ0MsU0FBUyxLQUFLLFdBQVcsSUFBSUosYUFBYSxDQUFDSyxRQUFRLEtBQUtDLFFBQVEsQ0FBQ0MsT0FBTyxFQUFFO01BQ3pHLE9BQU9OLFFBQVE7SUFDaEI7SUFFQSxJQUFJRCxhQUFhLENBQUNRLE1BQU0sRUFBRTtNQUN6Qk4sRUFBRSxHQUFHRixhQUFhLENBQUNRLE1BQU07SUFDMUIsQ0FBQyxNQUFNLElBQUlSLGFBQWEsQ0FBQ1MsUUFBUSxFQUFFO01BQ2xDUCxFQUFFLEdBQUdRLFFBQVEsQ0FBQyxDQUFDVixhQUFhLENBQUNTLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqRCxDQUFDLE1BQU07TUFDTlAsRUFBRSxHQUFHUyxTQUFTO0lBQ2Y7SUFFQSxJQUFJWCxhQUFhLENBQUNZLFFBQVEsS0FBSyxJQUFJLElBQUlaLGFBQWEsQ0FBQ1ksUUFBUSxLQUFLLE1BQU0sRUFBRTtNQUN6RVosYUFBYSxDQUFDWSxRQUFRLEdBQUdELFNBQVM7SUFDbkM7SUFDQSxPQUFPRSxHQUFJO0FBQ1o7QUFDQTtBQUNBLGNBQWNiLGFBQWEsQ0FBQ1ksUUFBUztBQUNyQyxVQUFVVixFQUFHO0FBQ2IsZ0JBQWdCRixhQUFhLENBQUNjLGtCQUFtQjtBQUNqRCxnQkFBZ0JkLGFBQWEsQ0FBQ2Usa0JBQW1CO0FBQ2pELDRCQUE0QmYsYUFBYSxDQUFDZ0Isb0JBQXFCO0FBQy9ELGVBQWVoQixhQUFhLENBQUNpQixPQUFRO0FBQ3JDO0FBQ0EsTUFBTWhCLFFBQVM7QUFDZjtBQUNBLEdBQUc7RUFDSDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTaUIsY0FBYyxDQUFDbEIsYUFBaUMsRUFBRTtJQUMxRCxJQUFJbUIsV0FBVztJQUVmLElBQUluQixhQUFhLENBQUNLLFFBQVEsS0FBS0MsUUFBUSxDQUFDQyxPQUFPLElBQUksQ0FBQyxDQUFDUCxhQUFhLENBQUNvQixTQUFTLEVBQUU7TUFDN0UsTUFBTUMsaUJBQWlCLEdBQUdDLFNBQVMsQ0FBQ0MsV0FBVyxDQUFDdkIsYUFBYSxDQUFDO01BQzlELElBQUl3QixnQkFBZ0I7TUFDcEIsSUFBSXhCLGFBQWEsQ0FBQ2dCLG9CQUFvQixJQUFJLEtBQUssRUFBRTtRQUNoRFEsZ0JBQWdCLEdBQUdYLEdBQUk7QUFDMUIsY0FBY1EsaUJBQWtCO0FBQ2hDO0FBQ0EsZ0JBQWdCO01BQ2QsQ0FBQyxNQUFNO1FBQ05HLGdCQUFnQixHQUFHSCxpQkFBaUI7TUFDckM7TUFFQUYsV0FBVyxHQUFHTixHQUFJLEdBQUVXLGdCQUFpQixFQUFDO0lBQ3ZDO0lBQ0EsT0FBT0wsV0FBVyxJQUFJLEVBQUU7RUFDekI7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU00sa0JBQWtCLENBQUN6QixhQUFpQyxFQUFFO0lBQzlELElBQUkwQixjQUFjO0lBQ2xCLElBQUkxQixhQUFhLENBQUMyQixPQUFPLEVBQUU7TUFDMUJELGNBQWMsR0FBRzFCLGFBQWEsQ0FBQzJCLE9BQU87SUFDdkMsQ0FBQyxNQUFNLElBQUkzQixhQUFhLENBQUNTLFFBQVEsRUFBRTtNQUNsQ2lCLGNBQWMsR0FBR2hCLFFBQVEsQ0FBQyxDQUFDVixhQUFhLENBQUNTLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNyRSxDQUFDLE1BQU07TUFDTmlCLGNBQWMsR0FBR2YsU0FBUztJQUMzQjs7SUFFQTtJQUNBLE1BQU1pQixjQUFjLEdBQUdDLFlBQVksQ0FBQ04sV0FBVyxDQUFDdkIsYUFBYSxDQUFDO0lBQzlEO0lBQ0E7SUFDQSxNQUFNbUIsV0FBVyxHQUFHRCxjQUFjLENBQUNsQixhQUFhLENBQUM7SUFDakQsT0FBT2EsR0FBSTtBQUNaO0FBQ0EsUUFBUWEsY0FBZTtBQUN2QixjQUFjMUIsYUFBYSxDQUFDSyxRQUFTO0FBQ3JDLGFBQWFMLGFBQWEsQ0FBQ2lCLE9BQVE7QUFDbkM7QUFDQSxlQUFlakIsYUFBYSxDQUFDOEIsU0FBVTtBQUN2QyxXQUFXOUIsYUFBYSxDQUFDK0IsS0FBTTtBQUMvQjtBQUNBO0FBQ0E7QUFDQSxLQUFLSCxjQUFlO0FBQ3BCO0FBQ0E7QUFDQSxLQUFLVCxXQUFZO0FBQ2pCO0FBQ0E7QUFDQSwwQkFBMEI7RUFDMUI7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU2EseUJBQXlCLENBQUNoQyxhQUFpQyxFQUFFO0lBQ3JFO0lBQ0EsSUFDQ0EsYUFBYSxDQUFDaUMsWUFBWSxLQUFLLFFBQVEsSUFDdkNqQyxhQUFhLENBQUNpQyxZQUFZLEtBQUssU0FBUyxJQUN4Q2pDLGFBQWEsQ0FBQ2lDLFlBQVksS0FBSyxRQUFRLElBQ3ZDakMsYUFBYSxDQUFDaUMsWUFBWSxLQUFLLE1BQU0sRUFDcEM7TUFDRDtNQUNBO01BQ0EsSUFDQ2pDLGFBQWEsQ0FBQ2lDLFlBQVksS0FBSyxNQUFNLEtBQ3BDakMsYUFBYSxDQUFDZ0Isb0JBQW9CLElBQUksS0FBSyxDQUFDLElBQzdDaEIsYUFBYSxDQUFDSyxRQUFRLEtBQUtDLFFBQVEsQ0FBQ0MsT0FBTyxFQUMxQztRQUNELE1BQU0yQixHQUFHLEdBQUdyQixHQUFJO0FBQ25CO0FBQ0E7QUFDQSxPQUFPZ0IsWUFBWSxDQUFDTSxlQUFlLENBQUNuQyxhQUFhLENBQUU7QUFDbkQ7QUFDQTtBQUNBLFdBQVc7UUFDUixPQUFPRCx1QkFBdUIsQ0FBQ0MsYUFBYSxFQUFFa0MsR0FBRyxDQUFDO01BQ25ELENBQUMsTUFBTTtRQUNOO1FBQ0EsT0FBT25DLHVCQUF1QixDQUFDQyxhQUFhLEVBQUU2QixZQUFZLENBQUNOLFdBQVcsQ0FBQ3ZCLGFBQWEsQ0FBQyxDQUFDO01BQ3ZGO0lBQ0QsQ0FBQyxNQUFNLElBQUlBLGFBQWEsQ0FBQ0csYUFBYSxDQUFDQyxTQUFTLEtBQUssV0FBVyxJQUFJSixhQUFhLENBQUNLLFFBQVEsS0FBS0MsUUFBUSxDQUFDQyxPQUFPLEVBQUU7TUFDaEg7TUFDQSxPQUFPc0IsWUFBWSxDQUFDTixXQUFXLENBQUN2QixhQUFhLENBQUM7SUFDL0MsQ0FBQyxNQUFNO01BQ047TUFDQSxNQUFNb0MsWUFBWSxHQUFHWCxrQkFBa0IsQ0FBQ3pCLGFBQWEsQ0FBQztNQUN0RCxPQUFPRCx1QkFBdUIsQ0FBQ0MsYUFBYSxFQUFFb0MsWUFBWSxDQUFDO0lBQzVEO0VBQ0Q7RUFBQyxPQUVjSix5QkFBeUI7QUFBQSJ9