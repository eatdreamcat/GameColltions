import { InitialFacade } from "../Facade/InitialFacade";
import { GameConfig } from "../../Global/GameConfig";

export class LoadConfigCommond extends puremvc.SimpleCommand {
    public static STEP: string = "LoadConfig";
    execute(notification: puremvc.INotification) {
        console.log(" start load config...")
        if (notification) {
            let body = notification.getBody<InitialFacade>();
            if (body && body.step) {
                GameConfig.inst.loadConfig(() => {
                    body.step(LoadConfigCommond.STEP);
                })
            } else {
                console.error(" load Config: body is null");
            }
        } else {
            console.error(" LoadConfigCommond: notification is null");
        }
    }
}
