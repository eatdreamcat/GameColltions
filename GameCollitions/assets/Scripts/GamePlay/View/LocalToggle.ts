// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { GameConfig, InitLocalConfigSignal } from "../../Global/GameConfig";
import { BaseSignal } from "../../Utils/Signal";

const { ccclass, property } = cc._decorator;

export class UpdateToggleSignal extends BaseSignal {}

@ccclass
export default class LocalToggle extends cc.Component {
  get Toggle() {
    return this.getComponent(cc.Toggle);
  }

  onLoad() {
    InitLocalConfigSignal.inst.addListener(() => {
      if (GameConfig.inst.LocalConfig) {
        this.node.active = true;
        GameConfig.inst.isLocal = this.Toggle.isChecked;
        UpdateToggleSignal.inst.dispatch();
      }
    }, this);

    this.node.on(
      "toggle",
      () => {
        GameConfig.inst.isLocal = this.Toggle.isChecked;
        UpdateToggleSignal.inst.dispatch();
      },
      this
    );

    this.node.active = false;
  }
}
