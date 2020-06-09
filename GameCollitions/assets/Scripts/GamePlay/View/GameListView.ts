// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import { GameListMediator } from "./GameListMediator";
import BaseView from "../../View/BaseView";
import { GameConfig } from "../../Global/GameConfig";
import { LoadGameSignal } from "../Command/LoadGameSignal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameListView extends BaseView {


    onLoad() {
        super.onLoad();

        this.Toggle.node.on("toggle", () => {
            console.log("toggle")
        }, this);
        this.BindMedaitor(GameListMediator);
    }

    get ScrollView() {
        return this.getComponent(cc.ScrollView);
    }

    get Content() {
        return this.ScrollView.content;
    }

    get Toggle() {
        return this.node.getChildByName("Toggle").getComponent(cc.Toggle);
    }


    reFreshItems() {
        let itemCount = GameConfig.inst.Config.games.length;
        if (this.Content.childrenCount >= itemCount) return;

        console.log(" reFreshItems ");
        let self = this;
        let template = this.Content.children[0];
        function refreshIcon(node: cc.Node, index: number) {
            index = index % GameConfig.inst.Config.games.length;
            let loadFunc = GameConfig.Url == "" ? cc.loader.loadRes.bind(cc.loader) : cc.loader.load.bind(cc.loader);
            loadFunc(GameConfig.Url + "Icons/" + GameConfig.inst.Config.games[index] + ".jpg", (err, sp) => {
                if (err) {
                    console.error(err);
                } else {
                    node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(sp);
                    node.name = GameConfig.inst.Config.games[index];
                    node.targetOff(self);
                    node.on(cc.Node.EventType.TOUCH_END, () => {
                        LoadGameSignal.inst.dispatchTwo(node.name, self.Toggle.isChecked);

                    }, self);
                }
            })
        }
        refreshIcon(template, this.Content.childrenCount - 1)
        while (this.Content.childrenCount < itemCount) {
            let item = cc.instantiate(template);
            this.Content.addChild(item);
            refreshIcon(item, this.Content.childrenCount - 1);
        }
    }


}
