import { CelerSDK } from "../Utils/Celer/CelerSDK";
import { InitialFacade } from "../Initialization/Facade/InitialFacade";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {


  onLoad() {
    InitialFacade.inst.start();
  }

  start() { }
}
