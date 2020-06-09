
import GamePageView from "./GamePageView";
import BaseMediator from "../../View/BaseMediator";
import { LoadGameSignal } from "../Command/LoadGameSignal";
import { GameConfig } from "../../Global/GameConfig";

export class GamePageMediator extends BaseMediator<GamePageView> {



    get WebView() {
        return this.node.getChildByName("GameView");
    }

    get CloseButton() {
        return this.node.getChildByName("Close");
    }

    onRegister() {

        this.WebView.on("error", this.onGameLoadFail, this);
        this.WebView.on("loaded", this.onGameLoadSuccess, this);
        this.WebView.on("loading", this.onGameLoadProgress, this);

        this.CloseButton.on(cc.Node.EventType.TOUCH_END, this.Close, this);

        LoadGameSignal.inst.addListenerTwo(this.startLoadGame, this);
    }


    Close() {
        this.WebView.active = false;
        this.WebView.removeComponent(cc.WebView);
        this.View.Hide();
    }

    startLoadGame(name: string, special: boolean) {
        console.log(" load game:", name, ", special:", special);

        let gameUrl = special ? GameConfig.inst.Config.specialPath : GameConfig.inst.Config.normalPath;
        this.WebView.active = true;

        let webView = this.WebView.addComponent(cc.WebView)
        webView.url = GameConfig.inst.Config.Url + gameUrl + name + "?time=" + Date.now();
        console.log(webView.url);
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