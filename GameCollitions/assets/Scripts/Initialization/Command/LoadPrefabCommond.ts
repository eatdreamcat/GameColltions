import { InitialFacade } from "../Facade/InitialFacade";
import { gFactory } from "../../Factory/GameFactory";

export class LoadPrefabCommond extends puremvc.SimpleCommand {
  public static STEP: string = "LoadPrefab";
  execute(notification: puremvc.INotification) {
    console.log(" start load prefab...")
    gFactory.init(() => {
      if (notification) {
        let body = notification.getBody<InitialFacade>();
        if (body && body.step) {
          body.step(LoadPrefabCommond.STEP);
        }
      }
    });
  }
}
