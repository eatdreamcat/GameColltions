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
    public init() {
        LoadGameSignal.inst.addListenerTwo<string, boolean>(this.onGameSelector, this)
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



        if (jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath() + this.gameName + "/project.manifest")) {
            console.log("  找到 manifest 缓存");
            let manifestStr = jsb.fileUtils.getStringFromFile(jsb.fileUtils.getWritablePath() + this.gameName + "/project.manifest");
            UpdateController.inst.setCustomManifest(manifestStr, jsb.fileUtils.getWritablePath() + this.gameName);

        } else {
            Downloader.DownloadText("https://vicat.wang/Remote-Hot-Update/" + this.gameName + "/project.manifest", this.onDownloadManifestComplete.bind(this));
        }
    }

    private onDownloadManifestComplete(err: any, text: string) {
        if (err) {
            console.error(err);
        } else {
            UpdateController.inst.setCustomManifest(text, jsb.fileUtils.getWritablePath() + this.gameName);
            let fullPath = jsb.fileUtils.getWritablePath() + this.gameName + "/";
            console.log("fullPath:", fullPath);
            if ((jsb.fileUtils.isDirectoryExist(fullPath) || jsb.fileUtils.createDirectory(fullPath)) && jsb.fileUtils.writeStringToFile(text, fullPath + "/project.manifest")) {
                console.log(this.gameName + " manifest write success...")
            } else {
                console.log(this.gameName + " manifest write fail...")
            }
        }
    }

    private doNativeSelectGame() {

    }
}
