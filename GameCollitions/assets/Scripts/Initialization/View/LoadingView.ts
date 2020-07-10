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
import UpdateController from "../../Update/UpdateController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingView extends BaseView {



    get Title() {
        return this.Progress.getChildByName("Title").getComponent(cc.Label);
    }

    get Progress() {
        return this.node.getChildByName("Progress")
    }

    get Bar() {
        return this.Progress.getChildByName("Mask").getChildByName("bar")
    }




    onLoad() {
        console.log(" Loading View onLoad ")
        this.node.scale = 1;
        this.Bar.x = this.StartX;
        this.BindMedaitor(LoadingMediator);

        this.Progress.opacity = 0;


        UpdateController.inst.addCompleteCallback((msg: string) => {
            this.Progress.runAction(cc.fadeIn(0.3));

        }, this);
    }

    private progress = 0;

    private readonly StartX = -410;
    private readonly EndX = -138;
    update(dt: number) {

        this.progress += dt * 0.3;
        this.progress = Math.min(this.progress, InitialFacade.inst.LoadPercent);


        this.Title.string = "Loading " + (this.progress * 100).toFixed(0) + '%';
        this.Bar.x = (this.EndX - this.StartX) * this.progress + this.StartX;

        if (this.Bar.x >= this.EndX) {
            setTimeout(() => {
                StartUpSignal.inst.dispatch();
            }, 500);
            this.enabled = false;
        }
    }


}
