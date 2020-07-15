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
import JavaCaller from "../../Utils/JavaCaller";



const { ccclass, property } = cc._decorator;

@ccclass
export default class GamePageView extends BaseView {


    get Block() {
        return this.node.getChildByName("Block")
    }



    onLoad() {
        console.log(" Game PageView Onload ")
        super.onLoad();
        this.BindMedaitor(GamePageMediator);

        this.Block.active = false;

        setTimeout(() => {
            this.node.active = false;
        }, 0);

    }

    Show() {
        this.node.scale = 1;
        this.node.active = true;
        this.Block.active = true;
        JavaCaller.setInWebView(true);

    }

    Hide() {
        super.Hide();
        this.Block.active = false;
        JavaCaller.setInWebView(false);

    }
}
