// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseMediator from "../../View/BaseMediator";
import LoadingView from "./LoadingView";
import { StartUpSignal } from "../../GamePlay/Command/StartUpSignal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingMediator extends BaseMediator<LoadingView> {


    onRegister() {
        StartUpSignal.inst.addListener(this.onGameStart, this);
    }

    onGameStart() {
        this.View.Hide();
    }
}
