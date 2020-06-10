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
import { GamePageMediator } from "./GamePageMediator";



const { ccclass, property } = cc._decorator;

@ccclass
export default class GamePageView extends BaseView {


    get BlockEvent() {
        return this.getComponent(cc.BlockInputEvents)
    }



    onLoad() {
        console.log(" Game PageView Onload ")
        super.onLoad();
        this.BindMedaitor(GamePageMediator)
        this.BlockEvent.enabled = false;

    }

    Show() {
        super.Show();
        this.BlockEvent.enabled = true;
    }

    Hide() {
        super.Hide();
        this.BlockEvent.enabled = false;
    }
}
