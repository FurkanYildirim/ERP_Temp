declare module "sap/feedback/ui/flpplugin/controller/ControllerFactory" {
    import ResourceBundle from 'sap/base/i18n/ResourceBundle';
    import InitController from './InitController';
    import PluginController from './PluginController';
    import { PluginInfo } from '../common/Types';
    import PxApiWrapper from '../pxapi/PxApiWrapper';
    export default class ControllerFactory {
        static createPluginController(pxApiWrapper: PxApiWrapper, resourceBundle: ResourceBundle): PluginController;
        static createInitController(pluginInfo: PluginInfo): InitController;
    }
}
//# sourceMappingURL=ControllerFactory.d.ts.map