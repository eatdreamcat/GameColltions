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
import { LoadGameSignal } from "../Command/LoadGameSignal";
import UpdateController from "../../Update/UpdateController";
import Downloader from "../../Utils/Downloader";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameSelector extends SingleTon<GameSelector>() {



    private gameName: string = "";

    private progress: number = 0;
    private msg: string = "";
    public init() {
        LoadGameSignal.inst.addListenerTwo<string, boolean>(this.onGameSelector, this);

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

    onGameSelector(name: string, special: boolean) {
        console.log(" select game: ", name, ", is special version:", special);
        this.gameName = name + "-" + (special ? "Special" : "Normal");
        if (window["jsb"]) {
            this.selectGameOnJsb();
        } else {
            this.selectGameOnWeb();
        }
    }

    private selectGameOnWeb() {
        Downloader.DownloadText("https://vicat.wang/Remote-Hot-Update/" + this.gameName + "/project.manifest", this.onDownloadManifestComplete.bind(this));
    }

    private selectGameOnJsb() {


        this.Msg = "加载游戏中...";
        this.Progress = 0;

        if (jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath() + this.gameName + "/project.manifest")) {
            console.log("  找到 manifest 缓存");
            let manifestStr = jsb.fileUtils.getStringFromFile(jsb.fileUtils.getWritablePath() + this.gameName + "/project.manifest");
            UpdateController.inst.setCustomManifest(manifestStr, jsb.fileUtils.getWritablePath() + this.gameName);

        } else {
            Downloader.DownloadText("https://vicat.wang/Remote-Hot-Update/" + this.gameName + "/project.manifest", this.onDownloadManifestComplete.bind(this), (progress: number, loaded: number, total: number) => {

                this.Msg = "首次初始化游戏可能耗时较长，如果您不想等，那就别玩了😕...";
                this.Progress = progress;
            });
        }
    }

    private onDownloadManifestComplete(err: any, text: string) {
        if (err) {
            console.error(err);
            this.Msg = "加载出错了，退下吧";
        } else {
            UpdateController.inst.setCustomManifest(text, jsb.fileUtils.getWritablePath() + this.gameName);
            let fullPath = jsb.fileUtils.getWritablePath() + this.gameName + "/";
            console.log("fullPath:", fullPath);
            if ((jsb.fileUtils.isDirectoryExist(fullPath) || jsb.fileUtils.createDirectory(fullPath)) && jsb.fileUtils.writeStringToFile(text, fullPath + "/project.manifest")) {
                console.log(this.gameName + " manifest write success...")
            } else {
                console.log(this.gameName + " manifest write fail...")
            }

            this.Msg = "正在检测游戏更新...";
            this.Progress = 0;
            UpdateController.inst.clearAllCallbacks();
            UpdateController.inst.addCompleteCallback(this.doNativeSelectGame, this);
            UpdateController.inst.addProgressCallback(this, (msg: string, progress: number) => {
                this.Progress = progress == NaN ? 0 : progress;
            });

            let retryCount = 0;
            UpdateController.inst.addErrorCallback(this, (msg: string, canRetry: boolean) => {

                UpdateController.inst.restart();

            });
            UpdateController.inst.checkForUpdate();
        }
    }

    private doNativeSelectGame(msg: string, needRestart: boolean) {
        // 记录一下要进游戏
        UpdateController.inst.restart();
    }
}
