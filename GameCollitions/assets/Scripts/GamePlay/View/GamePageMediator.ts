
import GamePageView from "./GamePageView";
import BaseMediator from "../../View/BaseMediator";
import { LoadGameSignal } from "../Command/LoadGameSignal";
import { GameConfig } from "../../Global/GameConfig";

export class GamePageMediator extends BaseMediator<GamePageView> {



    get WebView() {
        return this.node.getChildByName("GameView").getComponent(cc.WebView);
    }

    get CloseButton() {
        return this.node.getChildByName("Close");
    }

    onRegister() {

        this.WebView.node.on("error", this.onGameLoadFail, this);
        this.WebView.node.on("loaded", this.onGameLoadSuccess, this);
        this.WebView.node.on("loading", this.onGameLoadProgress, this);

        this.CloseButton.on(cc.Node.EventType.TOUCH_END, this.Close, this);

        LoadGameSignal.inst.addListenerTwo(this.startLoadGame, this);
    }


    Close() {
        this.WebView.node.active = false;
        this.View.Hide();
    }

    startLoadGame(name: string, special: boolean) {
        console.log(" load game:", name, ", special:", special);

        let gameUrl = special ? GameConfig.inst.Config.specialPath : GameConfig.inst.Config.normalPath;
        this.WebView.node.active = true;

        this.WebView.url = GameConfig.inst.Config.Url + gameUrl + name + "?time=" + Date.now();
        console.log(this.WebView.url);
        this.View.Show();


    }

    onGameLoadSuccess() {

        console.log(" game load success ");
    }

    onGameLoadFail() {
        console.log(" game load fail ");
    }

    onGameLoadProgress() {
        console.log(" game load progress ");
    }
}