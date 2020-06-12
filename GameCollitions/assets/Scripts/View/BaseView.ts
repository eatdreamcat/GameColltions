// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseView extends cc.Component {


    onLoad() {
        this.node.scale = 0;

    }

    Show() {
        this.node.runAction(cc.scaleTo(0.1, 1))
    }

    Hide() {
        this.node.runAction(cc.scaleTo(0.1, 0));
    }

    OnClick() {

    }


    BindMedaitor<T extends cc.Component>(type: { new(): T }): T {
        let comp = this.node.addComponent(type);
        if (comp["onRegister"]) {
            comp["onRegister"]();
        }
        return comp;
    }
}
