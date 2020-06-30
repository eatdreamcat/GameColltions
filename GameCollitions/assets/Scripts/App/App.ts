import { CelerSDK } from "../Utils/Celer/CelerSDK";
import { InitialFacade } from "../Initialization/Facade/InitialFacade";
import UpdateController from "../Update/UpdateController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class App extends cc.Component {


    onLoad() {
        console.log(" App onLoad ")

    }

    start() {

        UpdateController.inst.addCompleteCallback((msg: string, needRestart: boolean) => {

            if (needRestart == false) {
                InitialFacade.inst.start();
            }

        }, this);

        UpdateController.inst.checkForUpdate();
    }


    Onclick() {
        window.alert("您已成功支付 $ 999 , 谢谢惠顾")
    }

    onDestroy() {
        UpdateController.inst.destory();
    }

}
