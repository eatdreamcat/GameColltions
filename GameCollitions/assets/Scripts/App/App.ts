import { CelerSDK } from "../Utils/Celer/CelerSDK";
import { InitialFacade } from "../Initialization/Facade/InitialFacade";

const { ccclass, property } = cc._decorator;

@ccclass
export default class App extends cc.Component {


    onLoad() {
        console.log(" App onLoad ")

    }

    start() {

        InitialFacade.inst.start();
    }


    Onclick() {
        window.alert("您已成功支付 $ 999 , 谢谢惠顾")
    }

}
