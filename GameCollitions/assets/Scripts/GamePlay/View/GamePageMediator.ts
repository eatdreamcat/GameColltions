
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

    get Dialog() {
        return this.node.getChildByName("Dialog")
    }

    get DialogYes() {
        return this.Dialog.getChildByName("Yes");
    }

    get DialogNo() {
        return this.Dialog.getChildByName("No");
    }

    private webViewNode: cc.Node;


    private isMove = false;
    private startPos = null;
    onRegister() {


        celerSDK.onBackPressed(this.Close.bind(this));
        this.HideDialog();


        this.DialogYes.on(cc.Node.EventType.TOUCH_END, this.leaveGame, this);

        this.DialogYes.on(cc.Node.EventType.TOUCH_END, this.HideDialog, this);

        console.log("GamePageMediator onRegister ");
        this.WebView.on("error", this.onGameLoadFail, this);
        this.WebView.on("loaded", this.onGameLoadSuccess, this);
        this.WebView.on("loading", this.onGameLoadProgress, this);
        this.RefreshButton.on(cc.Node.EventType.TOUCH_END, this.Refresh, this);

        GameSelector.inst.addFailListener(this.startLoadGame, this);
        // LoadGameSignal.inst.addListenerTwo(this.startLoadGame, this);
    }

    ShowDialog() {
        if (this.Dialog.active) return;
        this.Dialog.active = true;
        this.Dialog.runAction(cc.sequence(
            cc.scaleTo(0.1, 1),
            cc.callFunc(() => {



            })
        ))
    }

    HideDialog(callback?: () => void) {
        if (this.Dialog.active == false) return;
        console.log("hideDialog");
        this.Dialog.runAction(cc.sequence(
            cc.scaleTo(0.1, 0),
            cc.callFunc(() => {
                if (callback) callback();
                this.Dialog.active = false;

            })
        ))
    }

    leaveGame() {
        this.HideDialog(() => {
            this.Close();
        })
    }

    Refresh() {
        if (this.webViewNode == null || cc.isValid(this.webViewNode, true) == false) return;
        let webView = this.webViewNode.getComponent(cc.WebView);
        if (webView) {
            webView.url = webView.url.split("?")[0] + Date.now();
        }
    }

    Close() {
        if (this.WebView.active == false) return;
        if (window["jsb"] && this.webViewNode && this.webViewNode.getComponent) {
            let webView = this.webViewNode.getComponent(cc.WebView);
            webView && webView.evaluateJS("if (cc.audioEngine) cc.audioEngine.stopAll();")
        }
        this.WebView.active = false;
        if (this.webViewNode && this.webViewNode.removeComponent) {
            this.webViewNode.removeComponent(cc.WebView);
            this.webViewNode.destroy();
            this.webViewNode = null;
        }
        this.View.Hide();
        this.CloseButton.active = false;
        this.RefreshButton.active = false;
    }



    startLoadGame(name: string, special: boolean) {



        console.log(JSON.stringify(cc.sys.getSafeAreaRect()));

        if (cc.sys.WIN32 == cc.sys.platform) return;


        console.log(" load game in webview:", name, ", special:", special);

        let gameUrl = special ? GameConfig.inst.Config.specialPath : GameConfig.inst.Config.normalPath;
        this.WebView.active = true;
        this.WebView.width = cc.sys.getSafeAreaRect().width;
        this.WebView.height = cc.sys.getSafeAreaRect().height;

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