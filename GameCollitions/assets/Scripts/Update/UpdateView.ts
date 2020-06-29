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

    @property(cc.TextAsset)
    manifest: cc.TextAsset = null


    onLoad() {
        super.onLoad();
        if (this.manifest) {
            UpdateController.inst.setManifest(this.manifest);
        }
    }
}
