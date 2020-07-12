// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseView from "../View/BaseView";
import UpdateController from "./UpdateController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UpdateView extends BaseView {

    @property({
        type: cc.Asset
    })
    manifest: cc.Asset = null


    get Progress() {
        return this.node.getChildByName("UpdateProgress").getComponent(cc.ProgressBar)
    }


    get RestartButton() {
        return this.node.getChildByName("RestartButton")
    }

    get ButtonTitle() {
        return this.RestartButton.getChildByName("Title").getComponent(cc.Label);
    }


    get Description() {
        return this.node.getChildByName("Description").getComponent(cc.Label);
    }

    get ProgressMsg() {
        return this.node.getChildByName("ProgressMsg").getComponent(cc.Label);
    }



    Hide() {
        console.log(" update view hide:", this.node.active);
        this.node.runAction(cc.sequence(cc.scaleTo(0.1, 0), cc.callFunc(() => {
            this.node.active = false;
        })));
    }

    onLoad() {
        super.onLoad();
        if (this.manifest) {
            UpdateController.inst.setManifest(this.manifest);
        }

        this.RestartButton.scale = 0;

        UpdateController.inst.addCompleteCallback(this.onComplete, this);
        UpdateController.inst.addErrorCallback(this, this.onError);
        UpdateController.inst.addProgressCallback(this, this.onProgress);
        UpdateController.inst.addStartCallback(this, this.onStart);
    }

    onComplete(msg: string, needRestart: boolean) {
        console.log(" update complete:", msg, needRestart);
        if (needRestart) {

            this.showButton("Restart", UpdateController.inst.restart)
        } else {
            this.Hide();

        }
    }

    showButton(title: string, callback: () => void) {
        this.ButtonTitle.string = title;
        this.RestartButton.stopAllActions();
        this.RestartButton.runAction(cc.sequence(cc.scaleTo(0.1, 1), cc.callFunc(() => {

            console.log("register button event")
            if (cc.sys.WIN32 == cc.sys.platform) {
                this.RestartButton.on(cc.Node.EventType.MOUSE_DOWN, () => {

                    console.log("restart")
                    this.RestartButton.targetOff(this);
                    this.RestartButton.runAction(cc.sequence(cc.scaleTo(0.1, 0), cc.callFunc(() => {
                        callback();
                    })));
                }, this);
            } else {
                this.RestartButton.on(cc.Node.EventType.TOUCH_END, () => {

                    console.log("restart")
                    this.RestartButton.targetOff(this);
                    this.RestartButton.runAction(cc.sequence(cc.scaleTo(0.1, 0), cc.callFunc(() => {
                        callback();
                    })));
                }, this);
            }

        })));
    }

    onError(msg: string, canRetry: boolean) {
        console.log("update error:", msg);
        if (canRetry) {
            this.showButton("Retry", UpdateController.inst.retry);
        } else {
            this.setDesprition(msg);
            this.showButton("Restart", UpdateController.inst.restart);
        }
    }

    onProgress(msg: string, progress: number) {
        this.Progress.progress = progress;
        this.ProgressMsg.string = msg;
    }

    setDesprition(msg: string = "Updating") {
        this.Description.string = msg;
    }

    onStart(msg: string, gotoAppStore: boolean) {
        console.log(" startUpdate:", msg, ",gotoAppStore:", gotoAppStore);
        this.Show();
        this.setDesprition();
    }
}
