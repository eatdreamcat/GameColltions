import { InitialCommond } from "../Command/InititalCommond";
import { StartGameCommond } from "../Command/StartGameCommond";
import { LoadAudioCommond } from "../Command/LoadAudioCommond";
import { LoadPrefabCommond } from "../Command/LoadPrefabCommond";
import { CelerSDK } from "../../Utils/Celer/CelerSDK";
import { LoadConfigCommond } from "../Command/LoadConfigCommond";

export class InitialFacade {
  public static MULTITON_KEY: string = "INITIAL_FCADE";

  private static INITIALIZATION: string = "initialization";
  private static START_UP: string = "startup";

  private static instance: InitialFacade;

  private facade: puremvc.Facade;

  public static get inst() {
    return this.instance
      ? this.instance
      : (this.instance = new InitialFacade(InitialFacade.MULTITON_KEY));
  }

  constructor(key: string) {
    this.facade = <puremvc.Facade>puremvc.Facade.getInstance(key);
  }

  get Facade() {
    console.assert(this.facade == null, " facade is null");
    return this.facade;
  }

  private register() {
    this.facade.registerCommand(InitialFacade.INITIALIZATION, InitialCommond);
    this.facade.registerCommand(InitialFacade.START_UP, StartGameCommond);

    CelerSDK.inst.init(() => {
      this.facade.sendNotification(InitialFacade.START_UP, this);
    });
  }

  private unregister() {
    this.facade.removeCommand(InitialFacade.INITIALIZATION);
    this.facade.removeCommand(InitialFacade.START_UP);
  }

  start() {
    this.register();
    for (let key of InitialFacade.TOTAL_STEPS) {
      this.loadTime[key] = Date.now();
    }
    this.facade.sendNotification(InitialFacade.INITIALIZATION, this);
    console.log(" start ")
  }


  private loadTime = {};
  private steps: string[] = [];
  private static TOTAL_STEPS: string[] = [
    LoadAudioCommond.STEP,
    LoadPrefabCommond.STEP,
    LoadConfigCommond.STEP
  ];

  get LoadPercent() {
    return this.steps.length / InitialFacade.TOTAL_STEPS.length;
  }

  step(commandName: string) {
    console.log(" initialization step:", commandName);
    if (this.steps.indexOf(commandName) < 0) {
      this.steps.push(commandName);
      this.steps.sort();
      InitialFacade.TOTAL_STEPS.sort();

      let now = this.steps.join("-");
      let total = InitialFacade.TOTAL_STEPS.join("-");
      console.log(
        " cur-steps：",
        now,
        ", total:",
        total,
        ", ",
        commandName,
        " cost:",
        (Date.now() - this.loadTime[commandName]).toFixed(2),
        "ms"
      );
      if (total === now) {
        if (CelerSDK.inst.isOnCelerPlatform()) {
          CelerSDK.inst.celerXReady();
        } else {
          this.facade.sendNotification(InitialFacade.START_UP, this);
        }
      }
    }
  }
}
