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
import JavaCaller from "../../Utils/JavaCaller";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameLoadPageView extends BaseView {

    get Msg() {
        return this.node.getChildByName("Msg").getComponent(cc.Label);
    }

    get Progress() {
        return this.node.getChildByName("Progress")
    }


    get ProgressTitle() {
        return this.Progress.getChildByName("Title").getComponent(cc.Label);
    }

    get Bar() {
        return this.Progress.getChildByName("Mask").getChildByName("bar")
    }

    get ReadyButton() {
        return this.node.getChildByName("ReadyButton")
    }

    get ExitButton() {
        return this.node.getChildByName("ExitButton")
    }
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        super.onLoad();

        this.Bar.x = this.StartX;
        this.ReadyButton.scale = 0;

        this.ExitButton.on(cc.Node.EventType.TOUCH_END, () => {
            this.Hide();
        }, this);
        GameSelector.inst.addStartListener(this.Show, this);
        GameSelector.inst.addFailListener((name: string) => {
            this.Msg.string = "加载失败，退下吧🙃";
            this.enabled = false;
            this.ExitButton.runAction(cc.repeat(cc.sequence(cc.moveBy(0.025, -5, 0), cc.moveBy(0.05, 10, 0), cc.moveBy(0.025, -5, 0)), 6));

        }, this);
        GameSelector.inst.addCompleteListener(this.onGameLoadComplete, this);

        this.Hide();
    }


    Show() {
        this.enabled = true;
        console.log(" show loading page ...");
        super.Show();
        this.ReadyButton.scale = 0;
    }
    onGameLoadComplete() {

        this.Msg.string = "游戏加载完成🤑🤑🤑🤑🤑🤑";
        this.scaleProgress = 1;



    }

    private progress = 0;
    private scaleProgress = 0.3

    private readonly StartX = -410;
    private readonly EndX = -138;
    update(dt: number) {

        this.progress += dt * this.scaleProgress;
        this.progress = Math.min(this.progress, GameSelector.inst.Progress);


        this.ProgressTitle.string = "Loading..." + Math.round((this.progress * 100)).toFixed(1) + "%";

        this.Msg.string = GameSelector.inst.Msg;
        this.Bar.x = (this.EndX - this.StartX) * this.progress + this.StartX;

        if (this.Bar.x >= this.EndX) {

            this.enabled = false;
            this.ReadyButton.runAction(cc.sequence(
                cc.scaleTo(0.1, 1.2),
                cc.scaleTo(0.1, 1),
                cc.callFunc(() => {
                    this.ReadyButton.once(cc.Node.EventType.TOUCH_END, () => {

                        this.ReadyButton.runAction(cc.sequence(cc.scaleTo(0.1, 0), cc.callFunc(() => {
                            JavaCaller.setInNativeGame(true);
                            setTimeout(() => {
                                UpdateController.inst.restart();
                            }, 100);
                        })))
                    }, this)
                })
            ));
        }
    }
}
