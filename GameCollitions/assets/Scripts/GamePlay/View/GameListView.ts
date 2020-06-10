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
            setTimeout(() => {
                this.reFreshItems();
            }, 0);
        }, this);
        this.BindMedaitor(GameListMediator);

        this.Icon.active = false;
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

    get Icon() {
        return this.node.getChildByName("Icon")
    }

    getIconSprite(node: cc.Node) {
        return node.getChildByName("Mask").getChildByName("icon512").getComponent(cc.Sprite)
    }


    reFreshItems() {
        let games = this.Toggle.isChecked ? GameConfig.inst.Config.specialGames : GameConfig.inst.Config.normalGames;

        let itemCount = games.length;

        this.Content.removeAllChildren();



        console.log(" reFreshItems ");
        let self = this;

        function refreshIcon(node: cc.Node, index: number) {
            index = index % games.length;
            let loadFunc = GameConfig.Url == "" ? cc.loader.loadRes.bind(cc.loader) : cc.loader.load.bind(cc.loader);
            loadFunc(GameConfig.Url + "Icons/" + games[index] + ".jpg?time=" + Date.now(), (err, sp) => {
                if (err) {
                    console.error(err);
                } else {
                    self.getIconSprite(node).spriteFrame = new cc.SpriteFrame(sp);
                    node.name = games[index];
                    node.targetOff(self);
                    node.on(cc.Node.EventType.TOUCH_END, () => {
                        LoadGameSignal.inst.dispatchTwo(node.name, self.Toggle.isChecked);

                    }, self);
                    node.runAction(cc.scaleTo(0.1, 1))
                }
            })
        }

        while (this.Content.childrenCount < itemCount) {
            let item = cc.instantiate(this.Icon);
            item.active = true;
            item.scale = 0;
            this.Content.addChild(item);
            refreshIcon(item, this.Content.childrenCount - 1);
        }
    }


}
