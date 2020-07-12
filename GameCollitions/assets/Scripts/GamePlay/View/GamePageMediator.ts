
import GamePageView from "./GamePageView";
import BaseMediator from "../../View/BaseMediator";
import { LoadGameSignal } from "../Command/LoadGameSignal";
import { GameConfig } from "../../Global/GameConfig";
import GameSelector from "../Controller/GameSelector";

export class GamePageMediator extends BaseMediator<GamePageView> {



    get WebView() {
        return this.node.getChildByName("GameView");
    }

    get CloseButton() {
        return this.node.getChildByName("Close");
    }

    get RefreshButton() {
        return this.node.getChildByName("Refresh")
    }

    private webViewNode: cc.Node;

    onRegister() {

        console.log("GamePageMediator onRegister ")
        this.WebView.on("error", this.onGameLoadFail, this);
        this.WebView.on("loaded", this.onGameLoadSuccess, this);
        this.WebView.on("loading", this.onGameLoadProgress, this);

        this.CloseButton.on(cc.Node.EventType.TOUCH_END, this.Close, this);
        this.RefreshButton.on(cc.Node.EventType.TOUCH_END, this.Refresh, this);

        GameSelector.inst.onLoadNativeFail = this.startLoadGame.bind(this);
        // LoadGameSignal.inst.addListenerTwo(this.startLoadGame, this);
    }


    Refresh() {
        if (this.webViewNode == null || cc.isValid(this.webViewNode, true) == false) return;
        let webView = this.webViewNode.getComponent(cc.WebView);
        if (webView) {
            webView.url = webView.url.split("?")[0] + Date.now();
        }
    }

    Close() {
        this.WebView.active = false;
        this.webViewNode.removeComponent(cc.WebView);
        this.webViewNode.destroy();
        this.webViewNode = null;
        this.View.Hide();
        this.CloseButton.active = false;
        this.RefreshButton.active = false;
    }

    startLoadGame(name: string, special: boolean) {

        if (cc.sys.WIN32 == cc.sys.platform) return;


        console.log(" load game in webview:", name, ", special:", special);

        let gameUrl = special ? GameConfig.inst.Config.specialPath : GameConfig.inst.Config.normalPath;
        this.WebView.active = true;
        this.WebView.width = cc.view.getFrameSize().width;
        this.WebView.height = cc.view.getFrameSize().height;
        if (this.webViewNode != null && this.webViewNode.destroy) {
            this.webViewNode.destroy();
        }
        this.webViewNode = new cc.Node();
        this.webViewNode.width = this.WebView.width;
        this.webViewNode.height = this.WebView.height;
        this.WebView.addChild(this.webViewNode);

        let webView = this.webViewNode.addComponent(cc.WebView)
        webView.url = GameConfig.inst.Config.Url + gameUrl + name + "?time=" + Date.now();
        console.log(webView.url);
        this.View.Show();
        this.CloseButton.active = true;
        this.RefreshButton.active = true;

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