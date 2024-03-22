declare module "sap/feedback/ui/flpplugin/ui/InvitationDialog" {
    import { SurveyInvitationDialogEventData, SurveyInvitationResultData } from '@sap-px/pxapi/dist/api/common/Types';
    import ResourceBundle from 'sap/base/i18n/ResourceBundle';
    export default class InvitationDialog {
        private _resourceBundle;
        private _dialog;
        private _resolveSurveyInvitation;
        constructor(resourceBundle: ResourceBundle);
        surveyInvitationDialogShowCallback(eventData: SurveyInvitationDialogEventData): Promise<SurveyInvitationResultData>;
        private show;
        private setDismissButtonText;
        private onDialogClose;
        private getText;
        private createFeedbackButton;
        private createDismissButton;
        private createDialog;
        private handleEscape;
    }
}
//# sourceMappingURL=InvitationDialog.d.ts.map