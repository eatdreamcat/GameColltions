import { StartUpSignal } from "../../GamePlay/Command/StartUpSignal";

export class StartGameCommond extends puremvc.SimpleCommand {
  execute(notification: puremvc.INotification) {
    console.log("--------- excute StartGameCommond ---------");

  }
}
