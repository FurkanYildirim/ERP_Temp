/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.ca.ui.FileUpload");jQuery.sap.require("sap.ca.ui.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.ca.ui.FileUpload",{metadata:{deprecated:true,library:"sap.ca.ui",properties:{uploadUrl:{type:"string",group:"Misc",defaultValue:null},fileName:{type:"string",group:"Misc",defaultValue:null},size:{type:"string",group:"Misc",defaultValue:null},url:{type:"string",group:"Misc",defaultValue:null},uploadedDate:{type:"string",group:"Misc",defaultValue:null},contributor:{type:"string",group:"Misc",defaultValue:null},fileExtension:{type:"string",group:"Misc",defaultValue:null},mimeType:{type:"string",group:"Misc",defaultValue:null},items:{type:"string",group:"Misc",defaultValue:null},uploadEnabled:{type:"boolean",group:"Misc",defaultValue:null},fileId:{type:"string",group:"Misc",defaultValue:null},xsrfToken:{type:"string",group:"Misc",defaultValue:null},useMultipart:{type:"boolean",group:"Misc",defaultValue:false},acceptRequestHeader:{type:"string",group:"Misc",defaultValue:"application/json"},encodeUrl:{type:"string",group:"Misc",defaultValue:null},renameEnabled:{type:"boolean",group:"Misc",defaultValue:null},deleteEnabled:{type:"boolean",group:"Misc",defaultValue:null},multipleSelectionEnabled:{type:"boolean",group:"Misc",defaultValue:true},showNoData:{type:"boolean",group:"Misc",defaultValue:false},sequentialUploadsEnabled:{type:"boolean",group:"Misc",defaultValue:false},showAttachmentsLabel:{type:"boolean",group:"Misc",defaultValue:true},useEditControls:{type:"boolean",group:"Misc",defaultValue:false},showAttachmentsLabelInEditMode:{type:"boolean",group:"Misc",defaultValue:true,deprecated:true},editMode:{type:"boolean",group:"Misc",defaultValue:false,deprecated:true}},aggregations:{_fileList:{type:"sap.m.List",multiple:false,visibility:"hidden"},uploadProgressLabel:{type:"sap.m.Label",multiple:false},attachmentNumberLabel:{type:"sap.m.Label",multiple:false,deprecated:true},toolBar:{type:"sap.m.Toolbar",multiple:false}},events:{deleteFile:{},renameFile:{},uploadFile:{},fileUploadFailed:{},beforeUploadFile:{},saveClicked:{deprecated:true},cancelClicked:{deprecated:true}}}});jQuery.sap.require("sap.ca.ui.utils.resourcebundle");jQuery.sap.require("sap.ca.ui.dialog.factory");jQuery.sap.require("sap.ca.ui.model.format.FileSizeFormat");jQuery.sap.require("sap.ca.ui.model.type.Date");sap.ca.ui.FileUpload.prototype.init=function(){this._isDataBound=false;this._oCustomHeaderArray=[];this._oBundle=sap.ca.ui.utils.resourcebundle;this._sOverallUploadingText=this._oBundle.getText("FileUploader.uploadingOutOf",["{filesUploaded} "," {filesToUpload}"]);this._sDeleteFile=this._oBundle.getText("FileUploader.deleteFile");this._sContinue=this._oBundle.getText("FileUploader.continue");this._sDeleteQuestion=this._oBundle.getText("FileUploader.deleteQuestion");this._oAddButton=new sap.m.Button({icon:"sap-icon://add",type:sap.m.ButtonType.Transparent,press:jQuery.proxy(function(){jQuery.sap.domById(this.getId()+"-upload").click()},this),visible:this.getUploadEnabled()});this._setProgressLabel();this._oNumberOfAttachmentsLabel=new sap.m.Label(this.getId()+"-attachmentLabel",{design:sap.m.LabelDesign.Standard}).addStyleClass("sapCaUiFileUploadAttachmentLabel");this._oToolBar=new sap.m.Toolbar({content:[this._oAddButton,new sap.m.ToolbarSpacer,this._oNumberOfAttachmentsLabel]}).addStyleClass("sapCaUiFUToolbar");this._oUploadedDateLabel=new sap.m.Label(this.getId()+"-uploadedDate",{visible:"{isUploaded}"});this._oUploadingProgressLabel=new sap.m.Label(this.getId()+"-uploadProgressLabel",{textAlign:sap.ui.core.TextAlign.End,text:this._sOverallUploadingText}).addStyleClass("sapCaUiFileUploadProgressLabel");this._oFileExtensionLabel=new sap.m.Text(this.getId()+"-extension",{text:"{parsedFileExtension}"}).addStyleClass("sapCaUiFUExtension");this._oFileNameLabel=new sap.m.Link(this.getId()+"-filename",{target:"_blank"}).addStyleClass("sapCaUiFileUploadFileLoadedText");this._oFileNameEditBox=new sap.m.Input(this.getId()+"-editFileName",{type:sap.m.Input.Text,placeholder:this._oBundle.getText("FileUploader.inputPlaceholder")}).addStyleClass("sapCaUiFileUploadEditBox");this._oFileNameEditBox.setLayoutData(new sap.m.FlexItemData({growFactor:1}));this._oFileNameEditBox.attachChange(this._nameChanged,this);this._oDateSizeHL=new sap.ui.layout.HorizontalLayout(this.getId()+"-ba-datesizelayout",{content:[this._oUploadedDateLabel,this._oProgressLabel],allowWrapping:true}).addStyleClass("sapCaUiFUInnerHL");this._oInputExtensionHL=new sap.m.HBox({items:[this._oFileNameEditBox,this._oFileExtensionLabel],visible:"{isEditMode}"}).addStyleClass("sapCaUiInnerEditHL");var e=new sap.ui.layout.VerticalLayout(this.getId()+"-ba-inner",{content:[this._oFileNameLabel,this._oInputExtensionHL,this._oDateSizeHL]}).addStyleClass("sapCaUiFUInner");this._oItemIcon=new sap.ui.core.Icon(this.getId()+"-icon",{visible:{parts:[{path:"isPendingFileRename"},{path:"isUploaded"}],formatter:jQuery.proxy(function(e,t){return!e&&t},this)}}).addStyleClass("sapCaUiFileUploadItemIcon");var t=new sap.m.Button({id:this.getId()+"-cancelIcon",icon:"sap-icon://sys-cancel-2",type:sap.m.ButtonType.Transparent,press:jQuery.proxy(function(e){this._handleCancel(e.getSource())},this),visible:{parts:[{path:"/isDeleteEnabled"},{path:"isUploading"}],formatter:jQuery.proxy(function(e,t){return!e&&t},this)}}).addStyleClass("sapCaUiFileUploadCancelIcon");var i=new sap.m.Button({id:this.getId()+"-saveIcon",icon:"sap-icon://save",type:sap.m.ButtonType.Transparent,press:jQuery.proxy(this._handleSave,this),visible:{parts:[{path:"/isRenameEnabled"},{path:"isUploading"},{path:"isEditMode"}],formatter:jQuery.proxy(function(e,t,i){return e&&!t&&i},this)}}).addStyleClass("sapCaUiFileUploadEditIcon");var s=new sap.m.Button({id:this.getId()+"-editIcon",icon:"sap-icon://edit",type:sap.m.ButtonType.Transparent,press:jQuery.proxy(this._handleEdit,this),visible:{parts:[{path:"/isRenameEnabled"},{path:"isUploading"},{path:"isEditMode"}],formatter:jQuery.proxy(function(e,t,i){return e&&!t&&!i},this)}}).addStyleClass("sapCaUiFileUploadEditIcon");var a=new sap.ui.layout.HorizontalLayout(this.getId()+"-ba-hl",{content:[new sap.m.BusyIndicator({id:this.getId()+"-indicator",visible:{parts:[{path:"isPendingFileRename"},{path:"isUploading"}],formatter:jQuery.proxy(function(e,t){return e||t},this)}}).setSize("2.5rem").addStyleClass("sapCaUiFileUploadloadingIcon"),this._oItemIcon,e,t,s,i],allowWrapping:true}).addStyleClass("sapCaUiFUItemHL");this._oViewPageList=new sap.m.List({delete:[this._handleDelete,this]});this._oViewPageList.addStyleClass("sapCaFileUploadListBorder");this._oTemplate=new sap.m.CustomListItem({content:[a]});this._oViewPageList.addEventDelegate({onAfterRendering:jQuery.proxy(this._onListAfterRendering,this)});this.setAggregation("_fileList",this._oViewPageList);this.setAggregation("uploadProgressLabel",this._oUploadingProgressLabel);this.setAggregation("toolBar",this._oToolBar);this._editBtnPressedPath=null};sap.ca.ui.FileUpload.prototype.onAfterRendering=function(){var e=this.getUploadUrl();this._oViewPageList.setShowNoData(this.getShowNoData());var t=this.getId();t=t.replace(/[#;&,.+*~':"!^$[\]()=>|\/]/g,"\\$&");t="#"+t+"-upload";if(this._isIE9OrBelow()&&!this.getUseMultipart()){if(this.getEncodeUrl()===""){jQuery.sap.log.warning("FileUpload: encodeUrl property is empty (required by IE9 to base64 encode the file before sending it)")}e=this.getEncodeUrl()}if(jQuery(t).fileupload){jQuery(t).fileupload({multipart:this.getUseMultipart(),url:e,sequentialUploads:this.getSequentialUploadsEnabled(),add:jQuery.proxy(function(e,t){this.onAdd(e,t)},this),send:jQuery.proxy(function(e,t){this.sending(e,t)},this),progress:jQuery.proxy(function(e,t){this.calculateProgress(e,t)},this),done:jQuery.proxy(function(e,t){this.uploadDone(e,t)},this),fail:jQuery.proxy(function(e,t){this.handleUploadFailure(e,t)},this),beforeSend:jQuery.proxy(function(e,t){var i=this._findFileIndexByInternalId(t.files[0].internalId);this.getModel().setProperty(this.getItems()+"/"+i+"/abortUplXhr",jQuery.proxy(e.abort,e));if(this._isIE()&&!this.getUseMultipart()&&!t.contentType){var s=this._getMimeTypeFromExtension(this._findFileExtension(t.files[0].name));t.contentType=s;e.setRequestHeader("Content-Type",t.contentType)}this.fireBeforeUploadFile(t.files[0]);this._setRequestHeaders(e)},this)})}jQuery.support.xhrFileUpload=!!(window.ProgressEvent&&window.FileReader)};sap.ca.ui.FileUpload.prototype.exit=function(){this._oViewPageList.destroy();this._oViewPageList=null;this._oTemplate.destroy();this._oTemplate=null;this._oFileNameLabel.destroy();this._oFileNameLabel=null;this._oUploadedDateLabel.destroy();this._oUploadedDateLabel=null;this._oProgressLabel.destroy();this._oProgressLabel=null;if(this._oInputExtensionHL){this._oInputExtensionHL.destroy();this._oInputExtensionHL=null}if(this._oDateSizeHL){this._oDateSizeHL.destroy();this._oDateSizeHL=null}};sap.ca.ui.FileUpload.prototype.preventEdits=function(e){var t=this.getItems();this.getModel().setProperty(t+"/isEditEnabled",!e)};sap.ca.ui.FileUpload.prototype.removeFile=function(e){if(e instanceof Array&&e.length>0){e=e[0]}var t=[];var i=this.getModel().getProperty(this.getItems());for(var s=0;s<i.length;s++){if(i[s][this.getFileId()]!==e){t.push(i[s])}}t.isUploading=i.isUploading;t.filesToUpload=i.filesToUpload;t.filesUploaded=i.filesUploaded;t.isEditEnabled=i.isEditEnabled;this.getModel().setProperty(this.getItems(),t);this.commitPendingRenames(true)};sap.ca.ui.FileUpload.prototype.setModel=function(e){this._isDataBound=true;if(this._oProgressLabel){this._oProgressLabel.destroy()}sap.ui.core.Control.prototype.setModel.call(this,e);this._setProgressLabel();jQuery.each(this.getModel().getProperty(this.getItems()),jQuery.proxy(function(e,t){var i=this.getItems()+"/"+e;this.getModel().setProperty(i+"/isUploaded",true);this.getModel().setProperty(i+"/isUploading",false);this.getModel().setProperty(i+"/isEditMode",false);this.getModel().setProperty(i+"/isPending",false);this.getModel().setProperty(i+"/isDeleteVisible",false);this.getModel().setProperty(i+"/isPendingFileRename",false);this.getModel().setProperty(i+"/isFileNameSwapped",false);this.getModel().setProperty(i+"/isHiddenFile",false);var s=this.getModel().getProperty(i+"/"+this.getFileName()).split(".");if(s.length===1){s=""}else if(s[0]===""&&s.length===2){this.getModel().setProperty(i+"/isHiddenFile",true);s=""}else{s="."+s.pop()}this.getModel().setProperty(i+"/parsedFileExtension",s)},this));this._setIsUploading(false);this.getModel().setProperty(this.getItems()+"/filesToUpload",0);this.getModel().setProperty(this.getItems()+"/filesUploaded",1);this.getModel().setProperty(this.getItems()+"/isEditEnabled",true);this.getModel().setProperty("/isRenameEnabled",this.getRenameEnabled());this.getModel().setProperty("/isDeleteEnabled",this.getDeleteEnabled());this._oNumberOfAttachmentsLabel.bindProperty("text",this.getProperty("items")+"/length",function(e){var t=sap.ca.ui.utils.resourcebundle.getText("FileUploader.attachments")+" ("+e+")";return t});this._oNumberOfAttachmentsLabel.setVisible(this.getShowAttachmentsLabel());this._oUploadingProgressLabel.bindProperty("visible",this.getProperty("items")+"/isUploading");this._oUploadingProgressLabel.bindElement(this.getProperty("items"));this._oNumberOfAttachmentsLabel.bindElement(this.getProperty("items"));this._oViewPageList.bindItems(this.getProperty("items"),this._oTemplate,null,null);this._oViewPageList.bindProperty("mode",{path:"/isDeleteEnabled",formatter:function(e){return e?sap.m.ListMode.Delete:sap.m.ListMode.None}});this._oDateSizeHL.addContent(this._oProgressLabel)};sap.ca.ui.FileUpload.prototype._setProgressLabel=function(){this._oProgressLabel=new sap.m.Label(this.getId()+"-progress",{text:{path:"uploadPercent",formatter:function(e){var t=this.getBindingContext().getPath();var i=t+"/uploadPercent";var s=this.getModel().getProperty(i);var a=sap.ca.ui.utils.resourcebundle.getText("FileUploader.uploading",[s]);return a}},visible:{path:"isUploading",formatter:jQuery.proxy(function(e){if(this._isIE9OrBelow()){return false}return e},this)}})};sap.ca.ui.FileUpload.prototype.setCustomHeader=function(e,t){if(this._oCustomHeaderArray===[]){this._oCusomHeaderArray.push({key:e,value:t})}else{var i=this._oCustomHeaderArray.length;for(var s=0;s<i;s++){if(this._oCustomHeaderArray[s].key===e){this._oCustomHeaderArray[s].value=t;return}}this._oCustomHeaderArray.push({key:e,value:t})}};sap.ca.ui.FileUpload.prototype.removeCustomHeader=function(e){var t=-1;for(var i=0;i<this._oCustomHeaderArray.length;i++){if(this._oCustomHeaderArray[i].key===e){t=i}}if(t!==-1){this._oCustomHeaderArray.splice(t,1)}};sap.ca.ui.FileUpload.prototype.commitFileUpload=function(e){var t=sap.ca.ui.model.format.FileSizeFormat.getInstance();var i=decodeURI(e[this.getFileName()]);e.size=t.format(e.size);var s=this.getModel().getProperty(this.getItems()+"/").length;for(var a=0;a<s;a++){var o=this.getItems()+"/"+a;if(this.getModel().getProperty(o+"/"+this.getFileName())===i&&this.getModel().getProperty(o+"/isUploading")){if(this.getFileId()!=undefined&&this.getFileId()!==""){this.getModel().setProperty(o+"/"+this.getFileId(),e[this.getFileId()])}if(this.getFileExtension()!=undefined&&this.getFileExtension()!==""){this.getModel().setProperty(o+"/"+this.getFileExtension(),e[this.getFileExtension()])}if(this.getMimeType()!=undefined&&this.getMimeType()!==""){this.getModel().setProperty(o+"/"+this.getMimeType(),e[this.getMimeType()])}if(this.getContributor()!=undefined&&this.getContributor()!==""){this.getModel().setProperty(o+"/"+this.getContributor(),e[this.getContributor()])}if(this.getUploadedDate()!=undefined&&this.getUploadedDate()!==""){this.getModel().setProperty(o+"/"+this.getUploadedDate(),e[this.getUploadedDate()])}if(this.getFileName()!=undefined&&this.getFileName()!==""){this.getModel().setProperty(o+"/"+this.getFileName(),e[this.getFileName()])}if(this.getUrl()!=undefined&&this.getUrl()!==""){this.getModel().setProperty(o+"/"+this.getUrl(),e[this.getUrl()])}if(this.getSize()!=undefined&&this.getSize()!==""){this.getModel().setProperty(o+"/"+this.getSize(),e[this.getSize()])}this.getModel().setProperty(o+"/isHiddenFile",false);var r=i.split(".");if(r.length===1){r=""}else if(r[0]===""&&r.length===2){r="";this.getModel().setProperty(o+"/isHiddenFile",true)}else{r="."+r.pop()}this.getModel().setProperty(o+"/parsedFileExtension",r);this.getModel().setProperty(o+"/isPending",false);this.getModel().setProperty(o+"/isUploading",false);this.getModel().setProperty(o+"/isUploaded",true);this.getModel().setProperty(o+"/abortUpl",undefined);this.getModel().setProperty(this.getItems()+"/filesUploaded",this.getModel().getProperty(this.getItems()+"/filesUploaded")+1);this._maintainUploadingProgress()}}};sap.ca.ui.FileUpload.prototype.commitPendingRenames=function(){var e=this.getItems();var t=this.getModel().getProperty(e);for(var i=0;i<t.length;i++){if(t[i].newFilename!==undefined&&t[i][this.getFileName()]!==t[i].newFilename){var s=t[i]["isHiddenFile"];var a="";if(t[i].isPendingFileRename){if(s){a="."+t[i].newFilename}else{a=t[i].newFilename+t[i]["parsedFileExtension"]}}else if(t[i].isFileNameSwapped){if(s){a="."+t[i][this.getFileName()]}else{a=t[i][this.getFileName()]+t[i]["parsedFileExtension"]}}this.getModel().setProperty(e+"/"+i+"/"+this.getFileName(),a);this.getModel().setProperty(e+"/"+i+"/newFilename",undefined)}t[i].isPendingFileRename=false;this.getModel().setProperty(e+"/"+i+"/isPendingFileRename",false);t[i].isFileNameSwapped=false}};sap.ca.ui.FileUpload.prototype.commitPendingRename=function(e){var t=this.getItems();var i=this.getModel().getProperty(t);for(var s=0;s<i.length;s++){if(i[s][this.getFileId()]==e&&i[s].newFilename!==undefined&&i[s][this.getFileName()]!==i[s].newFilename){var a=i[s]["isHiddenFile"];var o="";if(i[s].isPendingFileRename){if(a){o="."+i[s].newFilename}else{o=i[s].newFilename+i[s]["parsedFileExtension"]}}else if(i[s].isFileNameSwapped){if(a){o="."+i[s][this.getFileName()]}else{o=i[s][this.getFileName()]+i[s]["parsedFileExtension"]}}this.getModel().setProperty(t+"/"+s+"/"+this.getFileName(),o);this.getModel().setProperty(t+"/"+s+"/newFilename",undefined);i[s].isPendingFileRename=false;this.getModel().setProperty(t+"/"+s+"/isPendingFileRename",false);i[s].isFileNameSwapped=false;return}}};sap.ca.ui.FileUpload.prototype.abandonPendingRenames=function(){var e=this.getItems();var t=this.getModel().getProperty(e);for(var i=0;i<t.length;i++){if(t[i].isFileNameSwapped){t[i][this.getFileName()]=t[i].newFilename}t[i].isPendingFileRename=false;this.getModel().setProperty(e+"/"+i+"/isPendingFileRename",false);t[i].isFileNameSwapped=false}};sap.ca.ui.FileUpload.prototype.abandonPendingRename=function(e){var t=this.getItems();var i=this.getModel().getProperty(t);for(var s=0;s<i.length;s++){if(i[s][this.getFileId()]==e){if(i[s].isFileNameSwapped){i[s][this.getFileName()]=i[s].newFilename}i[s].isPendingFileRename=false;this.getModel().setProperty(t+"/"+s+"/isPendingFileRename",false);i[s].isFileNameSwapped=false;return}}};sap.ca.ui.FileUpload.prototype.abortUpload=function(e){var t=this.getModel().getProperty(this.getItems());var i=[];var s=t.filesToUpload;if(e){jQuery.each(t,jQuery.proxy(function(t,a){if(a&&a.isUploading&&e.internalId===a[this.getFileId()]){a.abortUplXhr&&a.abortUplXhr();a.abortUpl&&a.abortUpl();s--}else if(a&&(a.isUploaded||a.isUploading)){i.push(a)}},this))}else{jQuery.each(t,jQuery.proxy(function(e,t){if(t&&t.isUploading){t.abortUplXhr&&t.abortUplXhr();t.abortUpl&&t.abortUpl();s--}else if(t&&t.isUploaded){i.push(t)}},this))}this.getModel().setProperty(this.getItems(),i);this.getModel().setProperty(this.getItems()+"/filesToUpload",s);this.getModel().setProperty(this.getItems()+"/filesUploaded",t.filesUploaded);this.getModel().setProperty(this.getItems()+"/isEditEnabled",t.isEditEnabled);this._setIsUploading(t.isUploading);this._maintainUploadingProgress()};sap.ca.ui.FileUpload.prototype.isUploading=function(){return this.getModel().getProperty(this.getItems()+"/isUploading")};sap.ca.ui.FileUpload.prototype._setUploadedDateBinding=function(e,t){if(e==null){e=this.getUploadedDate()}if(t==null){t=this.getContributor()}if(e==null||t==null){return}var i=function(e,t){if(e==null||t==null){return""}var i=sap.ca.ui.model.format.DateFormat.getDateInstance({style:"medium"});var s=i.format(e);if(this._isPhone()){return this._oBundle.getText("FileUploader.attached_phone",[s,t])}else{return this._oBundle.getText("FileUploader.attached",[s,t])}};this._oUploadedDateLabel.bindProperty("text",{parts:[{path:e},{path:t}],formatter:jQuery.proxy(i,this)})};sap.ca.ui.FileUpload.prototype.setItems=function(e){var t=this.getItems();if(t!==e){this._oFileNameLabel.bindProperty("visible",{parts:[{path:"isEditMode"},{path:"isUploading"}],formatter:function(e,t){return!e||t}});this._oInputExtensionHL.bindProperty("visible",{parts:[{path:"isEditMode"},{path:"isUploading"}],formatter:function(e,t){return e&&!t}});this._oDateSizeHL.bindProperty("visible",{parts:[{path:"isEditMode"},{path:"isUploading"}],formatter:function(e,t){return!(e&&!t)}});this._oFileNameEditBox.bindProperty("enabled",{parts:[{path:"isEditMode"},{path:"/isRenameEnabled"}],formatter:function(e,t){return e&&t}});this.setProperty("items",e)}};sap.ca.ui.FileUpload.prototype.setShowAttachmentsLabelInEditMode=function(e){this.setShowAttachmentsLabel(e);jQuery.sap.log.warning("ShowAttachmentsLabelInEditMode is deprecated.")};sap.ca.ui.FileUpload.prototype.setShowAttachmentsLabel=function(e){this.setProperty("showAttachmentsLabel",e);this._oNumberOfAttachmentsLabel.setVisible(e)};sap.ca.ui.FileUpload.prototype.setFileName=function(e){var t=this.getFileName();if(t!==e){this._oFileNameLabel.bindProperty("text",e);this._oFileNameEditBox.bindValue(e,function(e){var t=e&&e.substr(0,e.lastIndexOf("."))||e;return t},sap.ui.model.BindingMode.OneWay);this.setProperty("fileName",e)}};sap.ca.ui.FileUpload.prototype.setEditMode=function(e){jQuery.sap.log.warning("EditMode property is deprecated")};sap.ca.ui.FileUpload.prototype.setUseEditControls=function(e){this.setProperty("useEditControls",e);this.setRenameEnabled(e);this.setDeleteEnabled(e)};sap.ca.ui.FileUpload.prototype.setContributor=function(e){var t=this.getContributor();if(t!==e){this._setUploadedDateBinding(null,e);this.setProperty("contributor",e)}};sap.ca.ui.FileUpload.prototype.setUploadedDate=function(e){var t=this.getUploadedDate();if(t!==e){this._setUploadedDateBinding(e,null);this.setProperty("uploadedDate",e)}};sap.ca.ui.FileUpload.prototype.setSize=function(e){var t=this.getSize();if(t!==e){this.setProperty("size",e)}};sap.ca.ui.FileUpload.prototype.setUrl=function(e){var t=this.getUrl();if(t!==e){this._oFileNameLabel.bindProperty("href",{path:e,formatter:this._removeStartingSlash});this.setProperty("url",e)}};sap.ca.ui.FileUpload.prototype.setUploadEnabled=function(e){this._oAddButton.setVisible(e);this.setProperty("uploadEnabled",e)};sap.ca.ui.FileUpload.prototype.setDeleteEnabled=function(e){var t=this.getUseEditControls()?e:false;if(this.getModel()){this.getModel().setProperty("/isDeleteEnabled",t)}this.setProperty("deleteEnabled",t)};sap.ca.ui.FileUpload.prototype.setRenameEnabled=function(e){var t=this.getUseEditControls()?e:false;if(this.getModel()){this.getModel().setProperty("/isRenameEnabled",t)}this.setProperty("renameEnabled",t)};sap.ca.ui.FileUpload.prototype.setMimeType=function(e){var t=this.getMimeType();if(t!==e){this._oItemIcon.bindProperty("src",{path:e,formatter:this._getIconFromMimeType});this.setProperty("mimeType",e)}};sap.ca.ui.FileUpload.prototype.setFileExtension=function(e){var t=this.getFileExtension();if(t!==e&&!this.getProperty("mimeType")){this._oItemIcon.bindProperty("src",{path:e,formatter:this._getIconFromExtension});this.setProperty("fileExtension",e)}};sap.ca.ui.FileUpload.prototype.getAttachmentNumberLabel=function(){jQuery.sap.log.warning("FileUpload getAttachmentNumberLabel is deprecated !");return this._oNumberOfAttachmentsLabel};sap.ca.ui.FileUpload.prototype._findFileExtension=function(e){var t=/[.]/.exec(e)?/[^.]+$/.exec(e):undefined;if(jQuery.isArray(t))return t[0];else return""};sap.ca.ui.FileUpload.prototype._getMimeTypeFromExtension=function(e){switch(e){case"pptx":return"application/vnd.openxmlformats-officedocument.presentationml.presentation";case"ppt":return"application/vnd.ms-powerpoint";case"potx":return"application/vnd.openxmlformats-officedocument.presentationml.template";case"doc":return"application/msword";case"docx":return"application/vnd.openxmlformats-officedocument.wordprocessingml.document";case"dotx":return"application/vnd.openxmlformats-officedocument.wordprocessingml.template";case"csv":return"text/csv";case"xls":return"application/vnd.ms-excel";case"xlsx":return"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";case"xltx":return"application/vnd.openxmlformats-officedocument.spreadsheetml.template";case"pdf":return"application/pdf";case"xhtml":return"application/xhtml+xml";case"zip":return"application/zip";case"gzip":return"application/gzip";case"avi":return"video/avi";case"mpeg":return"video/mpeg";case"mp4":return"video/mp4";case"html":return"text/html";case"txt":return"text/plain";case"xml":return"text/xml";case"gif":return"image/gif";case"jpg":return"image/jpeg";case"jpeg":return"image/jpeg";case"pjpeg":return"image/pjpeg";case"png":return"image/png";case"bmp":return"image/bmp";case"tif":return"image/tiff";case"tiff":return"image/tiff";case"mp3":return"audio/mpeg3";case"wmv":return"audio/x-ms-wmv";default:return"application/octet-stream"}};sap.ca.ui.FileUpload.prototype._getIconFromExtension=function(e){if(e==="pdf"){return"sap-icon://pdf-attachment"}else if(e==="jpg"||e==="png"||e==="bmp"){return"sap-icon://attachment-photo"}else if(e==="txt"){return"sap-icon://document-text"}else if(e==="doc"||e==="docx"||e==="odt"){return"sap-icon://doc-attachment"}else if(e==="xls"||e==="csv"){return"sap-icon://excel-attachment"}else if(e==="ppt"||e==="pptx"){return"sap-icon://ppt-attachment"}else{return"sap-icon://document"}};sap.ca.ui.FileUpload.prototype._getIconFromMimeType=function(e){var t="";if(!e){return"sap-icon://document"}if(e.indexOf("image")===0){t="sap-icon://attachment-photo"}else if(e.indexOf("video")===0){t="sap-icon://attachment-video"}else if(e.indexOf("text")===0){t="sap-icon://attachment-text-file"}else if(e.indexOf("audio")===0){t="sap-icon://attachment-audio"}else if(e.indexOf("application")===0){switch(e){case"application/vnd.openxmlformats-officedocument.presentationml.presentation":case"application/vnd.ms-powerpoint":case"application/vnd.openxmlformats-officedocument.presentationml.template":t="sap-icon://ppt-attachment";break;case"application/msword":case"application/vnd.openxmlformats-officedocument.wordprocessingml.document":case"application/vnd.openxmlformats-officedocument.wordprocessingml.template":t="sap-icon://doc-attachment";break;case"application/vnd.ms-excel":case"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":case"application/vnd.openxmlformats-officedocument.spreadsheetml.template":t="sap-icon://excel-attachment";break;case"application/pdf":t="sap-icon://pdf-attachment";break;case"application/xhtml+xml":t="sap-icon://attachment-html";break;case"application/zip":case"application/gzip":t="sap-icon://attachment-zip-file";break;default:t="sap-icon://document"}}else{t="sap-icon://document"}return t};sap.ca.ui.FileUpload.prototype._removeStartingSlash=function(e){if(e&&e.charAt(0)==="/"){return e.substr(1)}return e};sap.ca.ui.FileUpload.prototype._maintainUploadingProgress=function(){if(this.getModel().getProperty(this.getItems()+"/filesUploaded")>this.getModel().getProperty(this.getItems()+"/filesToUpload")){this._setIsUploading(false);this.getModel().setProperty(this.getItems()+"/filesToUpload",0);this.getModel().setProperty(this.getItems()+"/filesUploaded",1)}};sap.ca.ui.FileUpload.prototype._cancelPendingUpload=function(e){var t=this.getModel().getProperty(this.getItems());var i=this.getModel().getProperty(this.getItems()+"/filesToUpload")-1;var s=[];jQuery.each(t,jQuery.proxy(function(t,i){if(i&&i[this.getFileId()]!==e){s.push(i)}},this));this.getModel().setProperty(this.getItems(),s);this.getModel().setProperty(this.getItems()+"/filesToUpload",i);this.getModel().setProperty(this.getItems()+"/filesUploaded",t.filesUploaded);this._setIsUploading(i>0);this.getModel().setProperty(this.getItems()+"/isEditEnabled",t.isEditEnabled);this._maintainUploadingProgress()};sap.ca.ui.FileUpload.prototype._isPhone=function(){return jQuery.device.is.phone};sap.ca.ui.FileUpload.prototype._isIE9OrBelow=function(){return sap.ui.Device.browser.name===sap.ui.Device.browser.BROWSER.INTERNET_EXPLORER&&sap.ui.Device.browser.version<10};sap.ca.ui.FileUpload.prototype._isIE=function(){return sap.ui.Device.browser.name===sap.ui.Device.browser.BROWSER.INTERNET_EXPLORER};sap.ca.ui.FileUpload.prototype._setRequestHeaders=function(e){if(this.getAcceptRequestHeader()){e.setRequestHeader("Accept",this.getAcceptRequestHeader())}if(this.getXsrfToken()){e.setRequestHeader("x-csrf-token",this.getXsrfToken())}for(var t=0;t<this._oCustomHeaderArray.length;t++){e.setRequestHeader(this._oCustomHeaderArray[t].key,this._oCustomHeaderArray[t].value)}};sap.ca.ui.FileUpload.prototype._onListAfterRendering=function(){jQuery("span[id*='-editIcon-']").mousedown(jQuery.proxy(function(e){var t=jQuery(e.currentTarget).attr("id");if(t){var i=sap.ui.getCore().byId(t);if(i){this._editBtnPressedPath=i.oPropagatedProperties.oBindingContexts[undefined].sPath}}},this))};sap.ca.ui.FileUpload.prototype._handleCancel=function(e){var t=e.getBindingContext().getPath();var i=e.getModel().getProperty(t+"/abortUplXhr");var s=e.getModel().getProperty(t+"/abortUpl");i&&i();s&&s();var a=t.split("/");var o=a[a.length-1];var r=e.getModel().getProperty(this.getItems());r.splice(o,1);e.getModel().setProperty(this.getItems(),r);e.getModel().setProperty(this.getItems()+"/filesToUpload",e.getModel().getProperty(this.getItems()+"/filesToUpload")-1);this._maintainUploadingProgress()};sap.ca.ui.FileUpload.prototype._handleDelete=function(e){var t=e.getParameter("listItem");var i=t.getBindingContext().getProperty();var s=t.getBindingContext().getPath();var a=t.getModel().getProperty(s+"/isUploading");if(!a){sap.ca.ui.dialog.confirmation.open({question:this._sDeleteQuestion,showNote:false,title:this._sDeleteFile,confirmButtonLabel:this._sContinue},jQuery.proxy(function(e){if(e.isConfirmed){this.fireDeleteFile(i)}},this))}else{this._handleCancel(t)}};sap.ca.ui.FileUpload.prototype._handleEdit=function(e){var t=e.getSource().oPropagatedProperties.oBindingContexts[undefined].getPath();var i=this.getModel().getProperty(t+"/isEditMode");if(!i){this.getModel().setProperty(t+"/isEditMode",true);var s=e.getSource().getParent();if(s&&s.getContent()&&s.getContent().length>=3){var a=s.getContent()[2];if(a&&a.getContent()&&a.getContent().length>=2){var o=a.getContent()[1];if(o&&o.getItems()&&o.getItems().length>=1){var r=o.getItems()[0];if(r){jQuery.sap.delayedCall(300,this,this._focusEdit,[s,r])}}}}}};sap.ca.ui.FileUpload.prototype._handleSave=function(e){this._nameChanged(e)};sap.ca.ui.FileUpload.prototype._focusEdit=function(e,t){if(!jQuery.os.iOS){var i=t.$();t.focus();i.one("focusout blur",jQuery.proxy(function(){this._revertToReadState(e.getBindingContext().getPath(),t)},this))}};sap.ca.ui.FileUpload.prototype._nameChanged=function(e){var t=e.getSource().getBindingContext().getProperty();t.newFilename=e.getSource().getValue();var i=e.getSource().getBindingContext().getPath();this.getModel().setProperty(i+"/newFilename",t.newFilename);this.getModel().setProperty(i+"/isPendingFileRename",true);this.fireRenameFile(t);this._revertToReadState(i,null);this.fireSaveClicked()};sap.ca.ui.FileUpload.prototype._revertToReadState=function(e,t){var i=this.getModel().getProperty(e+"/isEditMode");if(i){if(t!=null){var s=this.getModel().getProperty(e+"/parsedFileExtension");var a=t.getValue()+s;var o=this.getModel().getProperty(e+"/"+this.getFileName());if(a==o){this.fireCancelClicked()}else{this._nameChanged(new sap.ui.base.Event("",t))}}this.getModel().setProperty(e+"/isEditMode",false)}};sap.ca.ui.FileUpload.prototype._findFileIndexByInternalId=function(e){var t=this.getModel().getProperty(this.getItems());for(var i=0;i<t.length;i++){if(t[i][this.getFileId()]===e)return i}return-1};sap.ca.ui.FileUpload.prototype.sending=function(e,t){for(var i=0;i<t.files.length;i++){var s=t.files[i];var a=s.internalId;var o=this.getModel().getProperty(this.getItems()).length;for(var r=0;r<o;r++){var l=this.getItems()+"/"+r;if(this.getModel().getProperty(l)[this.getFileId()]===a&&this.getModel().getProperty(l).isPending){this.getModel().setProperty(l+"/isUploading",true);this.getModel().setProperty(l+"/isPending",false);this.getModel().setProperty(l+"/isUploaded",false)}}}};sap.ca.ui.FileUpload.prototype._setIsUploading=function(e){this.getModel().setProperty(this.getItems()+"/isUploading",e);this.toggleStyleClass("sapCaUiFUIsUploading",e)};sap.ca.ui.FileUpload.prototype.onAdd=function(e,t){var i=sap.ca.ui.model.format.FileSizeFormat.getInstance();for(var s=0;s<t.files.length;s++){var a=t.files[0];var o=Math.random().toString();t.files[0].internalId=o;var r=this.getModel().getProperty(this.getItems());var l={};l[this.getFileId()]=o;l[this.getFileName()]=a.name;l[this.getSize()]=i.format(a.size);l["isPending"]=false;l["isUploading"]=true;l["isUploaded"]=false;l["uploadPercent"]=0;l["isDeleteVisible"]=false;l["isPendingFileRename"]=false;l["isFileNameSwapped"]=false;l["isEditMode"]=false;r.unshift(l);this.getModel().setProperty(this.getItems(),r);this.getModel().setProperty(this.getItems()+"/0/abortUpl",jQuery.proxy(t.abort,t));this.getModel().setProperty(this.getItems()+"/filesToUpload",this.getModel().getProperty(this.getItems()+"/filesToUpload")+1);this.getModel().setProperty(this.getItems()+"/isUploading",true);var n=t.submit()}var p=this.getModel().getProperty(this.getItems()+"/").length;for(var d=0;d<p;d++){var u=this.getItems()+"/"+d;if(this.getModel().getProperty(u+"/isPendingFileRename")){var h=this.getModel().getProperty(u+"/"+this.getFileName());var g=this.getModel().getProperty(u+"/newFilename");this.getModel().setProperty(u+"/"+this.getFileName(),g);this.getModel().setProperty(u+"/newFilename",h);this.getModel().setProperty(u+"/isFileNameSwapped",true);this.getModel().setProperty(u+"/isPendingFileRename",false)}}};sap.ca.ui.FileUpload.prototype.calculateProgress=function(e,t){var i=this.getModel().getProperty(this.getItems()).length;for(var s=0;s<i;s++){var a=parseInt(t.loaded/t.total*100,10);var o=this.getItems()+"/"+s;var r=this.getModel().getProperty(o);if(r.isUploading&&r[this.getFileId()]===t.files[0].internalId){this.getModel().setProperty(o+"/uploadPercent",a);this.getModel().setProperty(o+"/isUploaded",false)}}};sap.ca.ui.FileUpload.prototype.handleUploadFailure=function(e,t){if(t.textStatus!=="abort"&&t.textStatus!=="canceled"){this._cancelPendingUpload(t.files[0].internalId);this.fireFileUploadFailed({exception:new Error(this._oBundle.getText("FileUploader.error.fileUploadFail")),response:t})}};sap.ca.ui.FileUpload.prototype.uploadDone=function(e,t){try{var i=this._findFileIndexByInternalId(t.files[0].internalId);if(i===-1)return;if(this._isIE9OrBelow()){var s;if(this.getUseMultipart()){s=jQuery("pre",t.result).text();var a=jQuery.parseJSON(s);this.fireUploadFile(a)}else{if(null!==t&&null!==t.result){var o=t.files[0].name;var r=t.files[0];s=jQuery("pre",t.result).text();var l;try{l=jQuery.parseJSON(s)}catch(e){}if(l&&l.error&&l.error.code&&l.error.code==="413"){throw new Error(this._oBundle.getText("FileUploader.error.fileUploadFail"))}var n;try{n=s.match(/^data\:(.*);base64,/)[1]}catch(e){throw new Error(this._oBundle.getText("FileUploader.error.fileUploadFail"))}s=s.replace(/^data\:(.*);base64,/,"");if(null!==s){var p=jQuery.ajax({contentType:n,data:s,type:"POST",url:this.getUploadUrl(),success:jQuery.proxy(function(e,t){var i=e.d?e.d:e;this.fireUploadFile(i)},this),error:function(e,t,i){if(t!=="abort")throw new Error(this._oBundle.getText("FileUploader.error.fileUploadFail")+" "+i)},beforeSend:jQuery.proxy(function(e,t){this.getModel().setProperty(this.getItems()+"/"+i+"/abortUplXhr",jQuery.proxy(e.abort,e));this.fireBeforeUploadFile(r);this._setRequestHeaders(e);e.setRequestHeader("Content-Transfer-Encoding","Base64");e.setRequestHeader("Content-Disposition",'attachment; filename="'+o+'"')},this)})}else if(null!==t.result[0]&&null!==t.result[0].title){throw new Error(this._oBundle.getText("FileUploader.error.base64Error")+": "+t.result[0].title)}else{throw new Error(this._oBundle.getText("FileUploader.error.base64Error"))}}}}else if(t&&t.result){this.fireUploadFile(t.result)}else{throw new Error(this._oBundle.getText("FileUploader.error.invalidResponse"))}}catch(e){this._cancelPendingUpload(t.files[0].internalId);this.fireFileUploadFailed({exception:e,response:t})}};sap.ca.ui.FileUpload.prototype.ontouchstart=function(e){if(jQuery.os.ios&&e.target.id===this.getId()+"-upload"){this._oAddButton._activeButton()}};sap.ca.ui.FileUpload.prototype.ontouchend=function(e){if(jQuery.os.ios){this._oAddButton._inactiveButton()}};sap.ca.ui.FileUpload.prototype.ontouchcancel=function(e){if(jQuery.os.ios){this._oAddButton._inactiveButton()}};sap.ca.ui.FileUpload.prototype.ontap=function(e){if(jQuery.os.ios&&e.target.id===this.getId()+"-upload"){this._oAddButton.fireTap()}};
//# sourceMappingURL=FileUpload.js.map