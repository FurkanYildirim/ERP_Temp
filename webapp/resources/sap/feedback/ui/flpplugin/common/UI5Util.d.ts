declare module "sap/feedback/ui/flpplugin/common/UI5Util" {
    import { ThemeId } from '@sap-px/pxapi';
    import Configuration from 'sap/ui/core/Configuration';
    import EventBus from 'sap/ui/core/EventBus';
    import Container from 'sap/ushell/Container';
    import AppLifeCycle from 'sap/ushell/services/AppLifeCycle';
    export default class UI5Util {
        static getShellContainer(): Container;
        static getAppLifeCycleService(): Promise<AppLifeCycle>;
        static getCurrentApp(): Promise<object | undefined>;
        static getAppConfig(): Configuration;
        static getTheme(): string;
        static getThemeId(): ThemeId | undefined;
        static getLanguage(): string;
        static getEventBus(): EventBus;
    }
}
//# sourceMappingURL=UI5Util.d.ts.map