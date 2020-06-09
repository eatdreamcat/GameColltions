// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseView from "../../View/BaseView";
import LoadingMediator from "./LoadingMediator";
import { InitialFacade } from "../Facade/InitialFacade";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingView extends BaseView {



    get Title() {
        return this.node.getChildByName("Title").getComponent(cc.Label);
    }
    onLoad() {

        this.node.scale = 1;
        this.BindMedaitor(LoadingMediator);
    }

    update() {
        this.Title.string = "Loading " + (InitialFacade.inst.LoadPercent * 100).toFixed(1) + '%';
    }
}
