sap.ui.define(["sap/rules/ui/parser/resources/vocabulary/lib/vocabularyDataProviderBaseContext","sap/rules/ui/parser/resources/vocabulary/lib/vocabularyDataProvider"],function(r,a){"use strict";function t(){}t.prototype.getVocabularyDataProvider=function(t){var o=this.getVocabularyDataProvider.prototype.rtsVocaInst;if(t instanceof r.vocaDataProviderBaseContextLib||t&&t.hasOwnProperty("connection")){o=new a.vocabularyDataProvider(t);this.getVocabularyDataProvider.prototype.rtsVocaInst=o;o.rtContext.loadAll(o.allVocaObjects)}else if(!this.getVocabularyDataProvider.prototype.hasOwnProperty("rtsVocaInst")){}return o};return{vocaDataProviderFactoryLib:t}},true);
//# sourceMappingURL=vocabularyDataProviderFactory.js.map