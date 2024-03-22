(function(){function e(e,r,o){var t=n(e);e.operation(function(){if(!o)return;t.query=c(o);t.posFrom=t.posTo=e.getCursor();l(e,r,true);e.markText({line:t.posFrom.line,ch:t.posFrom.ch},{line:t.posTo.line,ch:t.posTo.ch},{readOnly:true,inclusiveLeft:true,atomic:true,className:"CodeMirror-readOnlyPrefix"})})}function r(e,r){if(typeof e=="string")e=new RegExp(e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&"),r?"gi":"g");else if(!e.global)e=new RegExp(e.source,e.ignoreCase?"gi":"g");return{token:function(r){e.lastIndex=r.pos;var o=e.exec(r.string);if(o&&o.index==r.pos){r.pos+=o[0].length;return"searching"}else if(o){r.pos=o.index}else{r.skipToEnd()}}}}function o(){this.posFrom=this.posTo=this.query=null;this.overlay=null}function n(e){return e.state.search||(e.state.search=new o)}function t(e){return typeof e=="string"&&e==e.toLowerCase()}function i(e,r,o){return e.getSearchCursor(r,o,t(r))}function a(e,r,o,n,t){if(e.openDialog)e.openDialog(r,t,{value:n});else t(prompt(o,n))}function s(e,r,o,n){if(e.openConfirm)e.openConfirm(r,n);else if(confirm(o))n[0]()}function c(e){var r=e.match(/^\/(.*)\/([a-z]*)$/);if(r){e=new RegExp(r[1],r[2].indexOf("i")==-1?"":"i");if(e.test(""))e=/x^/}else if(e==""){e=/x^/}return e}var f='Search: <input type="text" class="inputSearch"/> <span class="spanColor">(Use /re/ syntax for regexp search)</span>';function u(e,o){var i=n(e);if(i.query)return l(e,o);a(e,f,"Search for:",e.getSelection(),function(n){e.operation(function(){if(!n||i.query)return;i.query=c(n);e.removeOverlay(i.overlay,t(i.query));i.overlay=r(i.query,t(i.query));e.addOverlay(i.overlay);i.posFrom=i.posTo=e.getCursor();l(e,o)})})}function l(e,r,o){e.operation(function(){var t=n(e);var a=i(e,t.query,r?t.posFrom:t.posTo);if(!a.find(r)){a=i(e,t.query,r?CodeMirror.Pos(e.lastLine()):CodeMirror.Pos(e.firstLine(),0));if(!a.find(r))return}if(!o){e.setSelection(a.from(),a.to());e.scrollIntoView({from:a.from(),to:a.to()})}t.posFrom=a.from();t.posTo=a.to()})}function p(e){e.operation(function(){var r=n(e);if(!r.query)return;r.query=null;e.removeOverlay(r.overlay)})}var m='Replace: <input type="text" class="inputSearch"/> <span class="spanColor">(Use /re/ syntax for regexp search)</span>';var d='With: <input type="text" class="inputSearch"/>';var y="Replace? <button>Yes</button> <button>No</button> <button>Stop</button>";function g(e,r){a(e,m,"Replace:",e.getSelection(),function(o){if(!o)return;o=c(o);a(e,d,"Replace with:","",function(n){if(r){e.operation(function(){for(var r=i(e,o);r.findNext();){if(typeof o!="string"){var t=e.getRange(r.from(),r.to()).match(o);r.replace(n.replace(/\$(\d)/g,function(e,r){return t[r]}))}else r.replace(n)}})}else{p(e);var t=i(e,o,e.getCursor());var a=function(){var r=t.from(),n;if(!(n=t.findNext())){t=i(e,o);if(!(n=t.findNext())||r&&t.from().line==r.line&&t.from().ch==r.ch)return}e.setSelection(t.from(),t.to());e.scrollIntoView({from:t.from(),to:t.to()});s(e,y,"Replace?",[function(){c(n)},a])};var c=function(e){t.replace(typeof o=="string"?n:n.replace(/\$(\d)/g,function(r,o){return e[o]}));a()};a()}})})}CodeMirror.commands.find=function(e){p(e);u(e)};CodeMirror.commands.findNext=u;CodeMirror.commands.findPrev=function(e){u(e,true)};CodeMirror.commands.clearSearch=p;CodeMirror.commands.replace=g;CodeMirror.commands.replaceAll=function(e){g(e,true)};CodeMirror.commands.setPrefixReadOnly=function(r){e(r,undefined,r.readOnlyText)}})();
//# sourceMappingURL=search.js.map