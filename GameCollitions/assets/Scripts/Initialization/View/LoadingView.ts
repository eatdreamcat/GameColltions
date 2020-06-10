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
import { StartUpSignal } from "../../GamePlay/Command/StartUpSignal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingView extends BaseView {



    get Title() {
        return this.node.getChildByName("Title").getComponent(cc.Label);
    }

    get Progress() {
        return this.node.getChildByName("Progress").getComponent(cc.ProgressBar)
    }
    onLoad() {

        this.node.scale = 1;
        this.BindMedaitor(LoadingMediator);
    }

    private progress = 0;
    update(dt: number) {

        this.progress += dt * 0.3;
        this.progress = Math.min(this.progress, InitialFacade.inst.LoadPercent)
        this.Title.string = "Loading " + (this.progress * 100).toFixed(0) + '%';
        this.Progress.progress = this.progress;

        if (this.Progress.progress >= 1) {
            setTimeout(() => {
                StartUpSignal.inst.dispatch();
            }, 500);
            this.enabled = false;
        }
    }


}
