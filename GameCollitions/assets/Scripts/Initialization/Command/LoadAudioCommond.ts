import { InitialFacade } from "../Facade/InitialFacade";
import { GameConfig } from "../../Global/GameConfig";

export class LoadAudioCommond extends puremvc.SimpleCommand {
  public static STEP: string = "LoadAudio";
  execute(notification: puremvc.INotification) {
    console.log(" start load audio...")
    if (notification) {
      let body = notification.getBody<InitialFacade>();
      if (body && body.step) {
        body.step(LoadAudioCommond.STEP);
      } else {
        console.error(" load Audio: body is null");
      }
    } else {
      console.error(" LoadAudioCommond: notification is null");
    }
  }
}
