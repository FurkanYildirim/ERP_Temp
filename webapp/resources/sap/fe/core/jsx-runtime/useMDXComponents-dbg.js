/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/jsx-runtime/ViewLoader", "sap/fe/macros/macroLibrary", "sap/m/FormattedText", "sap/m/HBox", "sap/m/Panel", "sap/m/Title", "sap/ui/codeeditor/CodeEditor", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/util/XMLPreprocessor", "sap/fe/core/jsx-runtime/jsx"], function (Log, BuildingBlockTemplateProcessor, ClassSupport, MDXViewLoader, macroLibrary, FormattedText, HBox, Panel, Title, CodeEditor, Fragment, library, XMLPreprocessor, _jsx) {
  "use strict";

  var TitleLevel = library.TitleLevel;
  var createReference = ClassSupport.createReference;
  var parseXMLString = BuildingBlockTemplateProcessor.parseXMLString;
  function p(strValue) {
    const content = Array.isArray(strValue.children) ? strValue.children.map(child => {
      let output;
      if (typeof child === "string") {
        output = child;
      } else {
        switch (child.getMetadata().getName()) {
          case "sap.m.Link":
            output = `<a href="${child.getHref()}">${child.getText()}</a>`;
            break;
          case "sap.ui.codeeditor.CodeEditor":
            output = `<code>${child.getValue()}</code>`;
            break;
        }
      }
      return output;
    }).join("") : strValue.children;
    return _jsx(FormattedText, {
      htmlText: content,
      class: "sapUiTinyMarginBottom"
    });
  }
  function h1(strValue) {
    return _jsx(Title, {
      text: strValue.children,
      level: TitleLevel.H1,
      class: "sapUiTinyMarginBottom"
    });
  }
  function a(strValue) {
    return `<a href={strValue.href}>${strValue.children}</a>`;
  }
  function ul(strValue) {
    const ulContent = `<ul>${Array.isArray(strValue.children) ? strValue.children.join("") : strValue.children}</ul>`;
    return _jsx(FormattedText, {
      htmlText: ulContent
    });
  }
  function li(strValue) {
    return `<li>${Array.isArray(strValue.children) ? strValue.children.join("") : strValue.children}</li>`;
  }
  function h2(strValue) {
    return _jsx(Title, {
      text: strValue.children,
      level: TitleLevel.H2,
      class: "sapUiSmallMarginTop sapUiTinyMarginBottom"
    });
  }
  function pre(content) {
    return content.children;
  }
  function BuildingBlockPlayground(inValue) {
    const sourceHBox = createReference();
    const binding = inValue.binding ? {
      path: inValue.binding
    } : undefined;
    const target = _jsx(Panel, {
      headerText: inValue.headerText || "",
      class: "sapUiSmallMarginTop",
      children: _jsx(HBox, {
        ref: sourceHBox
      })
    });
    // 	<TabContainer>
    // 		{{
    // 			items: [
    // 				<TabContainerItem name={"Sample"}>{{ content:  }},</TabContainerItem>,
    // 				<TabContainerItem name={"Source"}>
    // 					{{
    // 						content: (
    // 							<CodeBlock editable={false} lineNumbers={true} type={"xml"} lineCount={10}>
    // 								{inValue.children}
    // 							</CodeBlock>
    // 						)
    // 					}}
    // 				</TabContainerItem>
    // 			]
    // 		}}
    // 	</TabContainer>
    // );
    if (binding) {
      target.bindElement(binding);
    }
    macroLibrary.register();
    const fragmentOrPromise = XMLPreprocessor.process(parseXMLString(`<root>${inValue.children}</root>`, true)[0], {
      name: "myBuildingBlockFragment"
    }, MDXViewLoader.preprocessorData);
    Promise.resolve(fragmentOrPromise).then(fragment => {
      return Fragment.load({
        definition: fragment.firstElementChild,
        controller: MDXViewLoader.controller
      });
    }).then(fragmentContent => {
      sourceHBox.current.removeAllItems();
      sourceHBox.current.addItem(fragmentContent);
    }).catch(err => {
      Log.error(err);
    });
    return target;
  }
  function CodeBlock(inValue) {
    var _inValue$children, _snippet$split, _inValue$className;
    const snippet = ((_inValue$children = inValue.children) === null || _inValue$children === void 0 ? void 0 : _inValue$children.trim()) || "";
    const lineCount = inValue.lineCount || Math.max((_snippet$split = snippet.split("\n")) === null || _snippet$split === void 0 ? void 0 : _snippet$split.length, 3);
    const type = inValue.type || (inValue === null || inValue === void 0 ? void 0 : (_inValue$className = inValue.className) === null || _inValue$className === void 0 ? void 0 : _inValue$className.split("-")[1]) || "js";
    const myCodeEditor = _jsx(CodeEditor, {
      class: "sapUiTinyMargin",
      lineNumbers: inValue.lineNumbers || false,
      type: type,
      editable: inValue.editable || false,
      maxLines: lineCount,
      height: "auto",
      width: "98%"
    });
    myCodeEditor.setValue(snippet);
    if (inValue.source) {
      fetch(inValue.source).then(res => res.text()).then(text => {
        let splittedText = text.split("\n");
        if (inValue.start) {
          splittedText = splittedText.slice(inValue.start - 1, inValue.end);
        }
        const newLineCount = Math.max(splittedText.length, 3);
        myCodeEditor.setMaxLines(newLineCount);
        myCodeEditor.setValue(splittedText.join("\n"));
        return;
      }).catch(e => {
        myCodeEditor.setValue(e.message);
      });
    }
    return myCodeEditor;
  }
  const provideComponenents = function () {
    return {
      p: p,
      a: a,
      h1: h1,
      h2: h2,
      ul: ul,
      li: li,
      pre: pre,
      code: CodeBlock,
      CodeBlock: CodeBlock,
      BuildingBlockPlayground: BuildingBlockPlayground
    };
  };
  return provideComponenents;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwIiwic3RyVmFsdWUiLCJjb250ZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiY2hpbGRyZW4iLCJtYXAiLCJjaGlsZCIsIm91dHB1dCIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsImdldEhyZWYiLCJnZXRUZXh0IiwiZ2V0VmFsdWUiLCJqb2luIiwiaDEiLCJUaXRsZUxldmVsIiwiSDEiLCJhIiwidWwiLCJ1bENvbnRlbnQiLCJsaSIsImgyIiwiSDIiLCJwcmUiLCJCdWlsZGluZ0Jsb2NrUGxheWdyb3VuZCIsImluVmFsdWUiLCJzb3VyY2VIQm94IiwiY3JlYXRlUmVmZXJlbmNlIiwiYmluZGluZyIsInBhdGgiLCJ1bmRlZmluZWQiLCJ0YXJnZXQiLCJoZWFkZXJUZXh0IiwiYmluZEVsZW1lbnQiLCJtYWNyb0xpYnJhcnkiLCJyZWdpc3RlciIsImZyYWdtZW50T3JQcm9taXNlIiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsInBhcnNlWE1MU3RyaW5nIiwibmFtZSIsIk1EWFZpZXdMb2FkZXIiLCJwcmVwcm9jZXNzb3JEYXRhIiwiUHJvbWlzZSIsInJlc29sdmUiLCJ0aGVuIiwiZnJhZ21lbnQiLCJGcmFnbWVudCIsImxvYWQiLCJkZWZpbml0aW9uIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJjb250cm9sbGVyIiwiZnJhZ21lbnRDb250ZW50IiwiY3VycmVudCIsInJlbW92ZUFsbEl0ZW1zIiwiYWRkSXRlbSIsImNhdGNoIiwiZXJyIiwiTG9nIiwiZXJyb3IiLCJDb2RlQmxvY2siLCJzbmlwcGV0IiwidHJpbSIsImxpbmVDb3VudCIsIk1hdGgiLCJtYXgiLCJzcGxpdCIsImxlbmd0aCIsInR5cGUiLCJjbGFzc05hbWUiLCJteUNvZGVFZGl0b3IiLCJsaW5lTnVtYmVycyIsImVkaXRhYmxlIiwic2V0VmFsdWUiLCJzb3VyY2UiLCJmZXRjaCIsInJlcyIsInRleHQiLCJzcGxpdHRlZFRleHQiLCJzdGFydCIsInNsaWNlIiwiZW5kIiwibmV3TGluZUNvdW50Iiwic2V0TWF4TGluZXMiLCJlIiwibWVzc2FnZSIsInByb3ZpZGVDb21wb25lbmVudHMiLCJjb2RlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJ1c2VNRFhDb21wb25lbnRzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IHBhcnNlWE1MU3RyaW5nIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHsgY3JlYXRlUmVmZXJlbmNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgTURYVmlld0xvYWRlciBmcm9tIFwic2FwL2ZlL2NvcmUvanN4LXJ1bnRpbWUvVmlld0xvYWRlclwiO1xuaW1wb3J0IG1hY3JvTGlicmFyeSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9tYWNyb0xpYnJhcnlcIjtcbmltcG9ydCBGb3JtYXR0ZWRUZXh0IGZyb20gXCJzYXAvbS9Gb3JtYXR0ZWRUZXh0XCI7XG5pbXBvcnQgSEJveCBmcm9tIFwic2FwL20vSEJveFwiO1xuaW1wb3J0IFBhbmVsIGZyb20gXCJzYXAvbS9QYW5lbFwiO1xuaW1wb3J0IFRpdGxlIGZyb20gXCJzYXAvbS9UaXRsZVwiO1xuaW1wb3J0IENvZGVFZGl0b3IgZnJvbSBcInNhcC91aS9jb2RlZWRpdG9yL0NvZGVFZGl0b3JcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCB7IFRpdGxlTGV2ZWwgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmZ1bmN0aW9uIHAoc3RyVmFsdWU6IGFueSkge1xuXHRjb25zdCBjb250ZW50ID0gQXJyYXkuaXNBcnJheShzdHJWYWx1ZS5jaGlsZHJlbilcblx0XHQ/IHN0clZhbHVlLmNoaWxkcmVuXG5cdFx0XHRcdC5tYXAoKGNoaWxkOiBhbnkpID0+IHtcblx0XHRcdFx0XHRsZXQgb3V0cHV0O1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgY2hpbGQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRcdG91dHB1dCA9IGNoaWxkO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzd2l0Y2ggKGNoaWxkLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJzYXAubS5MaW5rXCI6XG5cdFx0XHRcdFx0XHRcdFx0b3V0cHV0ID0gYDxhIGhyZWY9XCIke2NoaWxkLmdldEhyZWYoKX1cIj4ke2NoaWxkLmdldFRleHQoKX08L2E+YDtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0Y2FzZSBcInNhcC51aS5jb2RlZWRpdG9yLkNvZGVFZGl0b3JcIjpcblx0XHRcdFx0XHRcdFx0XHRvdXRwdXQgPSBgPGNvZGU+JHtjaGlsZC5nZXRWYWx1ZSgpfTwvY29kZT5gO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gb3V0cHV0O1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuam9pbihcIlwiKVxuXHRcdDogc3RyVmFsdWUuY2hpbGRyZW47XG5cdHJldHVybiA8Rm9ybWF0dGVkVGV4dCBodG1sVGV4dD17Y29udGVudH0gY2xhc3M9e1wic2FwVWlUaW55TWFyZ2luQm90dG9tXCJ9IC8+O1xufVxuXG5mdW5jdGlvbiBoMShzdHJWYWx1ZTogYW55KSB7XG5cdHJldHVybiA8VGl0bGUgdGV4dD17c3RyVmFsdWUuY2hpbGRyZW59IGxldmVsPXtUaXRsZUxldmVsLkgxfSBjbGFzcz17XCJzYXBVaVRpbnlNYXJnaW5Cb3R0b21cIn0gLz47XG59XG5mdW5jdGlvbiBhKHN0clZhbHVlOiBhbnkpIHtcblx0cmV0dXJuIGA8YSBocmVmPXtzdHJWYWx1ZS5ocmVmfT4ke3N0clZhbHVlLmNoaWxkcmVufTwvYT5gO1xufVxuZnVuY3Rpb24gdWwoc3RyVmFsdWU6IGFueSkge1xuXHRjb25zdCB1bENvbnRlbnQgPSBgPHVsPiR7QXJyYXkuaXNBcnJheShzdHJWYWx1ZS5jaGlsZHJlbikgPyBzdHJWYWx1ZS5jaGlsZHJlbi5qb2luKFwiXCIpIDogc3RyVmFsdWUuY2hpbGRyZW59PC91bD5gO1xuXHRyZXR1cm4gPEZvcm1hdHRlZFRleHQgaHRtbFRleHQ9e3VsQ29udGVudH0gLz47XG59XG5mdW5jdGlvbiBsaShzdHJWYWx1ZTogYW55KSB7XG5cdHJldHVybiBgPGxpPiR7QXJyYXkuaXNBcnJheShzdHJWYWx1ZS5jaGlsZHJlbikgPyBzdHJWYWx1ZS5jaGlsZHJlbi5qb2luKFwiXCIpIDogc3RyVmFsdWUuY2hpbGRyZW59PC9saT5gO1xufVxuZnVuY3Rpb24gaDIoc3RyVmFsdWU6IGFueSkge1xuXHRyZXR1cm4gPFRpdGxlIHRleHQ9e3N0clZhbHVlLmNoaWxkcmVufSBsZXZlbD17VGl0bGVMZXZlbC5IMn0gY2xhc3M9e1wic2FwVWlTbWFsbE1hcmdpblRvcCBzYXBVaVRpbnlNYXJnaW5Cb3R0b21cIn0gLz47XG59XG5mdW5jdGlvbiBwcmUoY29udGVudDogYW55KSB7XG5cdHJldHVybiBjb250ZW50LmNoaWxkcmVuO1xufVxuXG5mdW5jdGlvbiBCdWlsZGluZ0Jsb2NrUGxheWdyb3VuZChpblZhbHVlOiBhbnkpIHtcblx0Y29uc3Qgc291cmNlSEJveCA9IGNyZWF0ZVJlZmVyZW5jZTxIQm94PigpO1xuXHRjb25zdCBiaW5kaW5nID0gaW5WYWx1ZS5iaW5kaW5nID8geyBwYXRoOiBpblZhbHVlLmJpbmRpbmcgfSA6IHVuZGVmaW5lZDtcblx0Y29uc3QgdGFyZ2V0ID0gKFxuXHRcdDxQYW5lbCBoZWFkZXJUZXh0PXtpblZhbHVlLmhlYWRlclRleHQgfHwgXCJcIn0gY2xhc3M9e1wic2FwVWlTbWFsbE1hcmdpblRvcFwifT5cblx0XHRcdDxIQm94IHJlZj17c291cmNlSEJveH0+PC9IQm94PlxuXHRcdDwvUGFuZWw+XG5cdCk7XG5cdC8vIFx0PFRhYkNvbnRhaW5lcj5cblx0Ly8gXHRcdHt7XG5cdC8vIFx0XHRcdGl0ZW1zOiBbXG5cdC8vIFx0XHRcdFx0PFRhYkNvbnRhaW5lckl0ZW0gbmFtZT17XCJTYW1wbGVcIn0+e3sgY29udGVudDogIH19LDwvVGFiQ29udGFpbmVySXRlbT4sXG5cdC8vIFx0XHRcdFx0PFRhYkNvbnRhaW5lckl0ZW0gbmFtZT17XCJTb3VyY2VcIn0+XG5cdC8vIFx0XHRcdFx0XHR7e1xuXHQvLyBcdFx0XHRcdFx0XHRjb250ZW50OiAoXG5cdC8vIFx0XHRcdFx0XHRcdFx0PENvZGVCbG9jayBlZGl0YWJsZT17ZmFsc2V9IGxpbmVOdW1iZXJzPXt0cnVlfSB0eXBlPXtcInhtbFwifSBsaW5lQ291bnQ9ezEwfT5cblx0Ly8gXHRcdFx0XHRcdFx0XHRcdHtpblZhbHVlLmNoaWxkcmVufVxuXHQvLyBcdFx0XHRcdFx0XHRcdDwvQ29kZUJsb2NrPlxuXHQvLyBcdFx0XHRcdFx0XHQpXG5cdC8vIFx0XHRcdFx0XHR9fVxuXHQvLyBcdFx0XHRcdDwvVGFiQ29udGFpbmVySXRlbT5cblx0Ly8gXHRcdFx0XVxuXHQvLyBcdFx0fX1cblx0Ly8gXHQ8L1RhYkNvbnRhaW5lcj5cblx0Ly8gKTtcblx0aWYgKGJpbmRpbmcpIHtcblx0XHR0YXJnZXQuYmluZEVsZW1lbnQoYmluZGluZyk7XG5cdH1cblx0bWFjcm9MaWJyYXJ5LnJlZ2lzdGVyKCk7XG5cdGNvbnN0IGZyYWdtZW50T3JQcm9taXNlID0gWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0cGFyc2VYTUxTdHJpbmcoYDxyb290PiR7aW5WYWx1ZS5jaGlsZHJlbn08L3Jvb3Q+YCwgdHJ1ZSlbMF0sXG5cdFx0eyBuYW1lOiBcIm15QnVpbGRpbmdCbG9ja0ZyYWdtZW50XCIgfSxcblx0XHRNRFhWaWV3TG9hZGVyLnByZXByb2Nlc3NvckRhdGFcblx0KTtcblx0UHJvbWlzZS5yZXNvbHZlKGZyYWdtZW50T3JQcm9taXNlKVxuXHRcdC50aGVuKChmcmFnbWVudDogRWxlbWVudCkgPT4ge1xuXHRcdFx0cmV0dXJuIEZyYWdtZW50LmxvYWQoeyBkZWZpbml0aW9uOiBmcmFnbWVudC5maXJzdEVsZW1lbnRDaGlsZCBhcyBhbnksIGNvbnRyb2xsZXI6IE1EWFZpZXdMb2FkZXIuY29udHJvbGxlciB9KTtcblx0XHR9KVxuXHRcdC50aGVuKChmcmFnbWVudENvbnRlbnQ6IGFueSkgPT4ge1xuXHRcdFx0c291cmNlSEJveC5jdXJyZW50LnJlbW92ZUFsbEl0ZW1zKCk7XG5cdFx0XHRzb3VyY2VIQm94LmN1cnJlbnQuYWRkSXRlbShmcmFnbWVudENvbnRlbnQpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKChlcnI6IGFueSkgPT4ge1xuXHRcdFx0TG9nLmVycm9yKGVycik7XG5cdFx0fSk7XG5cdHJldHVybiB0YXJnZXQ7XG59XG5mdW5jdGlvbiBDb2RlQmxvY2soaW5WYWx1ZTogYW55KSB7XG5cdGNvbnN0IHNuaXBwZXQgPSBpblZhbHVlLmNoaWxkcmVuPy50cmltKCkgfHwgXCJcIjtcblx0Y29uc3QgbGluZUNvdW50ID0gaW5WYWx1ZS5saW5lQ291bnQgfHwgTWF0aC5tYXgoc25pcHBldC5zcGxpdChcIlxcblwiKT8ubGVuZ3RoLCAzKTtcblx0Y29uc3QgdHlwZSA9IGluVmFsdWUudHlwZSB8fCBpblZhbHVlPy5jbGFzc05hbWU/LnNwbGl0KFwiLVwiKVsxXSB8fCBcImpzXCI7XG5cdGNvbnN0IG15Q29kZUVkaXRvciA9IChcblx0XHQ8Q29kZUVkaXRvclxuXHRcdFx0Y2xhc3M9XCJzYXBVaVRpbnlNYXJnaW5cIlxuXHRcdFx0bGluZU51bWJlcnM9e2luVmFsdWUubGluZU51bWJlcnMgfHwgZmFsc2V9XG5cdFx0XHR0eXBlPXt0eXBlfVxuXHRcdFx0ZWRpdGFibGU9e2luVmFsdWUuZWRpdGFibGUgfHwgZmFsc2V9XG5cdFx0XHRtYXhMaW5lcz17bGluZUNvdW50fVxuXHRcdFx0aGVpZ2h0PXtcImF1dG9cIn1cblx0XHRcdHdpZHRoPXtcIjk4JVwifVxuXHRcdD48L0NvZGVFZGl0b3I+XG5cdCk7XG5cdG15Q29kZUVkaXRvci5zZXRWYWx1ZShzbmlwcGV0KTtcblx0aWYgKGluVmFsdWUuc291cmNlKSB7XG5cdFx0ZmV0Y2goaW5WYWx1ZS5zb3VyY2UpXG5cdFx0XHQudGhlbigocmVzKSA9PiByZXMudGV4dCgpKVxuXHRcdFx0LnRoZW4oKHRleHQpID0+IHtcblx0XHRcdFx0bGV0IHNwbGl0dGVkVGV4dCA9IHRleHQuc3BsaXQoXCJcXG5cIik7XG5cdFx0XHRcdGlmIChpblZhbHVlLnN0YXJ0KSB7XG5cdFx0XHRcdFx0c3BsaXR0ZWRUZXh0ID0gc3BsaXR0ZWRUZXh0LnNsaWNlKGluVmFsdWUuc3RhcnQgLSAxLCBpblZhbHVlLmVuZCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgbmV3TGluZUNvdW50ID0gTWF0aC5tYXgoc3BsaXR0ZWRUZXh0Lmxlbmd0aCwgMyk7XG5cdFx0XHRcdG15Q29kZUVkaXRvci5zZXRNYXhMaW5lcyhuZXdMaW5lQ291bnQpO1xuXHRcdFx0XHRteUNvZGVFZGl0b3Iuc2V0VmFsdWUoc3BsaXR0ZWRUZXh0LmpvaW4oXCJcXG5cIikpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKChlKSA9PiB7XG5cdFx0XHRcdG15Q29kZUVkaXRvci5zZXRWYWx1ZShlLm1lc3NhZ2UpO1xuXHRcdFx0fSk7XG5cdH1cblx0cmV0dXJuIG15Q29kZUVkaXRvcjtcbn1cblxuY29uc3QgcHJvdmlkZUNvbXBvbmVuZW50cyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHtcblx0XHRwOiBwLFxuXHRcdGE6IGEsXG5cdFx0aDE6IGgxLFxuXHRcdGgyOiBoMixcblx0XHR1bDogdWwsXG5cdFx0bGk6IGxpLFxuXHRcdHByZTogcHJlLFxuXHRcdGNvZGU6IENvZGVCbG9jayxcblx0XHRDb2RlQmxvY2s6IENvZGVCbG9jayxcblx0XHRCdWlsZGluZ0Jsb2NrUGxheWdyb3VuZDogQnVpbGRpbmdCbG9ja1BsYXlncm91bmRcblx0fTtcbn07XG5leHBvcnQgZGVmYXVsdCBwcm92aWRlQ29tcG9uZW5lbnRzO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O0VBYUEsU0FBU0EsQ0FBQyxDQUFDQyxRQUFhLEVBQUU7SUFDekIsTUFBTUMsT0FBTyxHQUFHQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0gsUUFBUSxDQUFDSSxRQUFRLENBQUMsR0FDN0NKLFFBQVEsQ0FBQ0ksUUFBUSxDQUNoQkMsR0FBRyxDQUFFQyxLQUFVLElBQUs7TUFDcEIsSUFBSUMsTUFBTTtNQUNWLElBQUksT0FBT0QsS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM5QkMsTUFBTSxHQUFHRCxLQUFLO01BQ2YsQ0FBQyxNQUFNO1FBQ04sUUFBUUEsS0FBSyxDQUFDRSxXQUFXLEVBQUUsQ0FBQ0MsT0FBTyxFQUFFO1VBQ3BDLEtBQUssWUFBWTtZQUNoQkYsTUFBTSxHQUFJLFlBQVdELEtBQUssQ0FBQ0ksT0FBTyxFQUFHLEtBQUlKLEtBQUssQ0FBQ0ssT0FBTyxFQUFHLE1BQUs7WUFDOUQ7VUFDRCxLQUFLLDhCQUE4QjtZQUNsQ0osTUFBTSxHQUFJLFNBQVFELEtBQUssQ0FBQ00sUUFBUSxFQUFHLFNBQVE7WUFDM0M7UUFBTTtNQUVUO01BQ0EsT0FBT0wsTUFBTTtJQUNkLENBQUMsQ0FBQyxDQUNETSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQ1RiLFFBQVEsQ0FBQ0ksUUFBUTtJQUNwQixPQUFPLEtBQUMsYUFBYTtNQUFDLFFBQVEsRUFBRUgsT0FBUTtNQUFDLEtBQUssRUFBRTtJQUF3QixFQUFHO0VBQzVFO0VBRUEsU0FBU2EsRUFBRSxDQUFDZCxRQUFhLEVBQUU7SUFDMUIsT0FBTyxLQUFDLEtBQUs7TUFBQyxJQUFJLEVBQUVBLFFBQVEsQ0FBQ0ksUUFBUztNQUFDLEtBQUssRUFBRVcsVUFBVSxDQUFDQyxFQUFHO01BQUMsS0FBSyxFQUFFO0lBQXdCLEVBQUc7RUFDaEc7RUFDQSxT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