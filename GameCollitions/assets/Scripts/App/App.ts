import { CelerSDK } from "../Utils/Celer/CelerSDK";
import { InitialFacade } from "../Initialization/Facade/InitialFacade";
import UpdateController from "../Update/UpdateController";
import GameSelector from "../GamePlay/Controller/GameSelector";
import JavaCaller from "../Utils/JavaCaller";

const { ccclass, property } = cc._decorator;

@ccclass
export default class App extends cc.Component {

    get VersionInfo() {
        return this.node.getChildByName("VersionInfo").getComponent(cc.Label);
    }


    onLoad() {
        console.log(" App onLoad ");
        JavaCaller.setInNativeGame(false);
        GameSelector.inst.init();

        this.VersionInfo.string = UpdateController.inst.getVersion();
        UpdateController.inst.addCompleteCallback((msg: string, needRestart: boolean) => {

            console.log("App: update complete ...");
            if (needRestart == false) {
                InitialFacade.inst.start();
            }
            this.VersionInfo.string = UpdateController.inst.getVersion();

        }, this);




    }

    start() {

        UpdateController.inst.checkForUpdate();
        //InitialFacade.inst.start();

    }


    Onclick() {
        window.alert("您已成功支付 $ 999 , 谢谢惠顾")
    }

    onDestroy() {
        UpdateController.inst.destory();
    }

}
