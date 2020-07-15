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
import { LoadGameSignal, LoadNativeGameSignal } from "../Command/LoadGameSignal";
import { networkInterfaces } from "os";

const { ccclass, property } = cc._decorator;


enum Type {
    Normal,
    Special,
    Native
}
@ccclass
export default class GameListView extends BaseView {




    private type: Type = Type.Special;

    private readonly SELECTED_COLOR = cc.color(12, 130, 254)
    onLoad() {
        super.onLoad();

        this.type = Type.Special;

        // 默认选中特殊

        this.updateType();


        this.SpecialNode.on(cc.Node.EventType.TOUCH_START, () => {

            this.Special.color = this.SELECTED_COLOR;

        }, this);

        this.SpecialNode.on(cc.Node.EventType.TOUCH_CANCEL, () => {

            this.updateType();

        }, this);

        this.SpecialNode.on(cc.Node.EventType.TOUCH_END, () => {
            this.type = Type.Special;
            this.updateType();
            this.reFreshItems();
        }, this);


        this.NormalNode.on(cc.Node.EventType.TOUCH_START, () => {

            this.Normal.color = this.SELECTED_COLOR;
        }, this);

        this.NormalNode.on(cc.Node.EventType.TOUCH_END, () => {

            this.type = Type.Normal;
            this.updateType();
            this.reFreshItems();
        }, this);

        this.NormalNode.on(cc.Node.EventType.TOUCH_CANCEL, () => {

            this.updateType();

        }, this);

        this.NativeNode.on(cc.Node.EventType.TOUCH_START, () => {

            this.Native.color = this.SELECTED_COLOR;
        }, this);

        this.NativeNode.on(cc.Node.EventType.TOUCH_END, () => {

            this.type = Type.Native;
            this.updateType();
            this.reFreshItems();
        }, this);

        this.NativeNode.on(cc.Node.EventType.TOUCH_CANCEL, () => {

            this.updateType();

        }, this);








        this.Icon.active = false;
        this.Icon.getChildByName("new").scale = 0;

        this.BindMedaitor(GameListMediator);


    }

    updateType() {

        switch (this.type) {
            case Type.Special:
                this.Special.color = this.SELECTED_COLOR;
                this.Normal.color = cc.Color.WHITE;
                this.Native.color = cc.Color.WHITE;
                break;
            case Type.Normal:
                this.Special.color = cc.Color.WHITE;
                this.Native.color = cc.Color.WHITE;
                this.Normal.color = this.SELECTED_COLOR;
                break;
            case Type.Native:
                this.Special.color = cc.Color.WHITE;
                this.Native.color = this.SELECTED_COLOR;
                this.Normal.color = cc.Color.WHITE;
                break;

            default:
                break;
        }

    }

    get ScrollView() {
        return this.getComponent(cc.ScrollView);
    }

    get Content() {
        return this.ScrollView.content;
    }


    get Icon() {
        return this.node.getChildByName("Icon")
    }

    getIconSprite(node: cc.Node) {
        return node.getChildByName("Mask").getChildByName("icon512").getComponent(cc.Sprite)
    }


    get Selection() {
        return this.node.getChildByName("TypeSelection")
    }

    get Normal() {
        return this.Selection.getChildByName("Normal").getChildByName("Label");
    }

    get Special() {
        return this.Selection.getChildByName("Special").getChildByName("Label")
    }

    get NormalNode() {
        return this.Selection.getChildByName("Normal")
    }

    get SpecialNode() {
        return this.Selection.getChildByName("Special")
    }

    get isSpecial() {
        return this.type == Type.Special;
    }

    get Native() {
        return this.Selection.getChildByName("Native").getChildByName("Label")
    }

    get NativeNode() {
        return this.Selection.getChildByName("Native")
    }


    iconCache: {} = {}
    reFreshItems() {
        let games = [];

        switch (this.type) {
            case Type.Native:
                games = GameConfig.inst.Config.nativeGames;
                break;
            case Type.Normal:
                games = GameConfig.inst.Config.normalGames;
                break;
            case Type.Special:
                games = GameConfig.inst.Config.specialGames;
                break;
        }

        let newGames = GameConfig.inst.Config.new;

        let itemCount = games.length;

        this.Content.removeAllChildren();



        console.log(" reFreshItems: ", Type[this.type]);
        let self = this;

        function refreshIcon(node: cc.Node, index: number) {
            index = index % games.length;

            if (self.iconCache[games[index]]) {
                initIcon(node, self.iconCache[games[index]], index);
                return;
            }

            let loadFunc = GameConfig.Url == "" ? cc.loader.loadRes.bind(cc.loader) : cc.loader.load.bind(cc.loader);
            loadFunc(GameConfig.Url + "Icons/" + games[index] + ".jpg?time=" + Date.now(), (err, sp) => {
                if (err) {
                    console.error(err);
                } else {
                    self.iconCache[games[index]] = sp;
                    initIcon(node, sp, index);
                }
            })
        }

        function initIcon(node: cc.Node, sp: cc.Texture2D, index: number) {

            self.getIconSprite(node).spriteFrame = new cc.SpriteFrame(sp);
            node.name = games[index];

            node.targetOff(self);


            node.runAction(cc.sequence(cc.scaleTo(0.1, 1), cc.callFunc(() => {
                if (newGames.indexOf(node.name) >= 0) {
                    node.getChildByName("new").runAction(cc.scaleTo(0.1, 1))
                }

                node.on(cc.Node.EventType.TOUCH_END, () => {
                    if (self.type == Type.Native) {
                        LoadNativeGameSignal.inst.dispatchOne(node.name);
                    } else {
                        LoadGameSignal.inst.dispatchTwo(node.name, self.isSpecial);
                    }

                }, self);
            })))
        }

        while (this.Content.childrenCount < itemCount) {
            let item = cc.instantiate(this.Icon);
            item.getChildByName("new").scale = 0;
            item.active = true;
            item.scale = 0;
            this.Content.addChild(item);
            refreshIcon(item, this.Content.childrenCount - 1);
        }
    }


}
