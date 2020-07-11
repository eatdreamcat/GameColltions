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
import UpdateController from "../../Update/UpdateController";
import GameSelector from "../Controller/GameSelector";
import { LoadGameSignal } from "../Command/LoadGameSignal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameLoadPageView extends BaseView {

    get Msg() {
        return this.node.getChildByName("Msg").getComponent(cc.Label);
    }

    get Progress() {
        return this.node.getChildByName("Progress")
    }

    get Bar() {
        return this.Progress.getChildByName("Mask").getChildByName("bar")
    }
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        super.onLoad();
        this.Bar.x = this.StartX;
        LoadGameSignal.inst.addListener(this.Show, this);
    }

    start() {

    }

    private progress = 0;

    private readonly StartX = -410;
    private readonly EndX = -138;
    update(dt: number) {

        this.progress += dt * 0.3;
        this.progress = Math.min(this.progress, GameSelector.inst.Progress);


        this.Msg.string = GameSelector.inst.Msg;
        this.Bar.x = (this.EndX - this.StartX) * this.progress + this.StartX;

        if (this.Bar.x >= this.EndX) {

            this.enabled = false;
        }
    }
}
