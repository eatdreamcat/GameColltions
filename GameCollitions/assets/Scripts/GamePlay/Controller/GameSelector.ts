// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { SingleTon } from "../../Utils/ToSingleton";
import { LoadGameSignal, LoadNativeGameSignal } from "../Command/LoadGameSignal";
import UpdateController from "../../Update/UpdateController";
import Downloader from "../../Utils/Downloader";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameSelector extends SingleTon<GameSelector>() {



    private gameName: string = "";

    private progress: number = 0;
    private msg: string = "";
    public init() {
        LoadNativeGameSignal.inst.addListenerOne<string>(this.onGameSelector, this);

    }

    get Progress() {
        return this.progress;
    }

    get Msg() {
        return this.msg;
    }

    set Progress(val: number) {
        this.progress = val;
    }

    set Msg(val: string) {
        this.msg = val;
    }


    private name: string = "";

    private failCallback: {
        target: any,
        callback: (name: string) => void
    }[] = [];

    private startCallback: {
        target: any,
        callback: (name?: string) => void
    }[] = [];

    private completeCallback: {
        target: any,
        callback: (name: string) => void
    }[] = [];

    private onLoadNativeFail(name: string) {
        for (let listener of this.failCallback) {
            listener.callback.apply(listener.target)
        }
    }

    addFailListener(callback: (name: string) => void, target: any) {
        this.failCallback.push({
            target: target,
            callback: callback
        })
    }

    addStartListener(callback: (name?: string) => void, target: any) {
        this.startCallback.push({
            target: target,
            callback: callback
        })
    }


    private onStartLoadGame() {
        for (let listener of this.startCallback) {
            listener.callback.apply(listener.target, [this.name])
        }
    }

    addCompleteListener(callback: (name: string) => void, target: any) {
        this.completeCallback.push({
            target: target,
            callback: callback
        })
    }


    private onCompleteLoadGame() {
        for (let listener of this.completeCallback) {
            listener.callback.apply(listener.target, [this.name])
        }
    }




    onGameSelector(name: string) {
        console.log(" select game: ", name);

        this.name = name;
        this.gameName = name;
        if (window["jsb"]) {
            this.selectGameOnJsb();
        } else {
            this.selectGameOnWeb();
        }
    }

    private selectGameOnWeb() {
        this.onLoadNativeFail(this.name);
    }

    private selectGameOnJsb() {


        this.Msg = "加载游戏中...";
        this.Progress = 0;
        let self = this;
        GameSelector.inst.onStartLoadGame();
        if (jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath() + this.gameName + "/project.manifest")) {
            console.log("  找到 manifest 缓存");
            let manifestStr = jsb.fileUtils.getStringFromFile(jsb.fileUtils.getWritablePath() + this.gameName + "/project.manifest");
            UpdateController.inst.setCustomManifest(manifestStr, jsb.fileUtils.getWritablePath() + this.gameName, true);
            this.startLoadGame();

        } else {

            this.isFirstLoad = true;
            Downloader.DownloadText("https://vicat.wang/Remote-Hot-Update/" + this.gameName + "/project.manifest.old", this.onDownloadManifestComplete.bind(this), (progress: number, loaded: number, total: number) => {

                self.Msg = "首次初始化游戏可能耗时较长，如果您不想等，那就别玩了😕...";
                self.Progress = progress;
            });
        }
    }

    private onDownloadManifestComplete(err: any, text: string) {
        if (err) {
            console.error(JSON.stringify(err));
            this.Msg = "加载出错了，退下吧";
            this.onLoadNativeFail(this.name);
        } else {
            UpdateController.inst.setCustomManifest(text, jsb.fileUtils.getWritablePath() + this.gameName, true);
            let fullPath = jsb.fileUtils.getWritablePath() + this.gameName + "/";
            console.log("fullPath:", fullPath);
            if ((jsb.fileUtils.isDirectoryExist(fullPath) || jsb.fileUtils.createDirectory(fullPath)) && jsb.fileUtils.writeStringToFile(text, fullPath + "/project.manifest")) {
                console.log(this.gameName + " manifest write success...")
            } else {
                console.log(this.gameName + " manifest write fail...")
            }

            this.startLoadGame();
        }


    }


    private isFirstLoad = false;
    private filesCount: number = 0;
    private totalBytes: number = 0;
    private startLoadGame() {
        this.Msg = "正在检测游戏更新...";
        this.Progress = 0;
        UpdateController.inst.clearAllCallbacks();
        UpdateController.inst.addCompleteCallback(this.doNativeSelectGame, this);
        let self = this;
        UpdateController.inst.addProgressCallback(this, (msg: string, progress: number) => {

            this.Progress = progress;
            if (isNaN(this.Progress)) this.Progress = 0;
        });

        let retryCount = 0;
        UpdateController.inst.addErrorCallback(this, (msg: string, canRetry: boolean) => {

            this.onLoadNativeFail(this.name);

        });

        UpdateController.inst.addStartCallback(this, (msg: string, go2Store: boolean) => {
            console.log("start loading game:", msg);
            this.filesCount = UpdateController.inst.getFilesCount();
            this.totalBytes = UpdateController.inst.getTotalBytes();
            console.log("filesCount:", this.filesCount, ",totalBytes:", this.totalBytes)
            this.Msg = this.isFirstLoad ? "首次初始化游戏可能耗时较长，如果您不想等，那就别玩了🙄..." : "游戏更新中🤑...";
        });

        UpdateController.inst.checkForUpdate();
    }

    private doNativeSelectGame(msg: string, needRestart: boolean) {
        // 记录一下要进游戏
        console.log(" 游戏加载成功");
        this.Msg = "游戏加载成功";
        this.Progress = 1;
        this.onCompleteLoadGame();
    }
}
