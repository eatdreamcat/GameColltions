// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { SingleTon } from "../Utils/ToSingleton";

const { ccclass, property } = cc._decorator;



@ccclass
export default class UpdateController extends SingleTon<UpdateController>() {

    private constructor() {
        super();
        this.init();
    }

    private init() {
        if (window["jsb"]) {
            cc.sys.localStorage.removeItem(this.GameKey);
            if (!cc.sys.localStorage.getItem(this.HomeKey)) {
                console.log("app没有更新过，初始化一下home-page");
                cc.sys.localStorage.setItem(this.HomeKey, JSON.stringify(["@assets/"]));
            }
            this.assetsManager = new jsb.AssetsManager(this.MANIFEST_PAth, this.STORAGE_PATH, this.versionCompareHandle);
            this.assetsManager.setVerifyCallback(this.verifyCallback.bind(this));
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                // Some Android device may slow down the download process when concurrent tasks is too much.
                // The value may not be accurate, please do more test and find what's most suitable for your game.
                this.assetsManager.setMaxConcurrentTask(2);
            }
        }
    }





    private assetsManager: jsb.AssetsManager = null;
    private readonly STORAGE_PATH: string = ((window["jsb"] && jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'game-home');
    private readonly MANIFEST_PAth: string = ""

    private isUpdating: boolean = false;
    private manifest: cc.Asset = null;
    private isLoadGame: boolean = false;
    public HomeKey: string = "home-page";
    public GameKey: string = "select-game";
    private completeCallback: { target: any, callback: (msg: string, needRestart: boolean) => void }[] = [];
    private startCallback: { target: any, callback: (msg: string, go2AppStore: boolean) => void }[] = [];
    private errorCallback: { target: any, callback: (msg: string, canRetry: boolean) => void }[] = [];
    private progressCallback: { target: any, callback: (msg: string, progress: number) => void }[] = [];


    public setManifest(manifest: cc.Asset) {
        this.manifest = manifest;
    }

    public getVersion(): string {
        if (this.assetsManager == null) return "";
        if (this.assetsManager.getLocalManifest() == null) return "";
        return this.assetsManager.getLocalManifest().getVersion();
    }

    public get WritablePath() {
        return window["jsb"] && jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/';
    }


    clearAllCallbacks() {
        this.completeCallback = [];
        this.startCallback = [];
        this.progressCallback = [];
        this.errorCallback = [];
    }

    addCompleteCallback(callback: (msg: string, needRestart: boolean) => void, target: any) {

        this.completeCallback.push({
            target: target,
            callback: callback
        })
    }

    addErrorCallback(target: any, callback: (msg: string, canRetry: boolean) => void) {
        this.errorCallback.push({
            target: target,
            callback: callback
        })
    }

    addStartCallback(target: any, callback: (msg: string, go2AppStore: boolean) => void) {
        this.startCallback.push({
            target: target,
            callback: callback
        })
    }

    addProgressCallback(target: any, callback: (msg: string, progress: number) => void) {
        this.progressCallback.push({
            target: target,
            callback: callback
        })
    }

    public triggeError(msg: string, canRetry: boolean = false) {
        this.onError(msg, canRetry)
    }

    private onError(msg: string, canRetry: boolean = false) {
        console.log(" this.errorCallback:", this.errorCallback.length, "error:", msg);
        this.isUpdating = false;
        for (let method of this.errorCallback) {
            method.callback.apply(method.target, [msg, canRetry]);
        }
    }

    private onComplete(msg: string, needRestart: boolean = false) {
        console.log(" on update complete:", this.getVersion());
        console.log("storagePath:", this.getStoragePath());
        console.log("search path:", this.getSearchPaths());
        this.isUpdating = false;
        for (let method of this.completeCallback) {
            setTimeout(() => {
                method.callback.apply(method.target, [msg, needRestart]);
            }, 0);
        }
    }

    public getStoragePath() {
        return this.assetsManager ? this.assetsManager.getStoragePath() : ""
    }

    public getSearchPaths() {
        return window["jsb"] ? jsb.fileUtils.getSearchPaths() : ""
    }

    public getFilesCount() {
        return this.assetsManager ? this.assetsManager.getTotalFiles() : 0;
    }

    public getTotalBytes() {
        return this.assetsManager ? this.assetsManager.getTotalBytes() : 0;
    }

    private onStart(msg: string, go2AppStore: boolean = false) {
        console.log(" this.startCallback:", this.startCallback.length)
        for (let method of this.startCallback) {
            method.callback.apply(method.target, [msg, go2AppStore]);
        }
    }

    private onProgress(msg: string, progress: number) {

        for (let method of this.progressCallback) {
            method.callback.apply(method.target, [msg, progress]);
        }
    }

    loadCustomManifest(manifestStr: string, storagePath: string = this.STORAGE_PATH) {
        if (this.assetsManager == null) {
            return;
        }

        if (this.assetsManager.getState() == jsb.AssetsManager.State.UNINITED) {
            let manifest = new jsb.Manifest(manifestStr, storagePath);
            this.assetsManager.loadLocalManifest(manifest, storagePath);
        }

    }


    /** 重新创建一个assetManager */
    setCustomManifest(manifestStr: string, storagePath: string = this.STORAGE_PATH, isLoadGame: boolean = true) {

        this.isLoadGame = isLoadGame;
        this.assetsManager = null;

        this.assetsManager = new jsb.AssetsManager(this.MANIFEST_PAth, this.STORAGE_PATH, this.versionCompareHandle);
        this.assetsManager.setVerifyCallback(this.verifyCallback.bind(this));
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            this.assetsManager.setMaxConcurrentTask(2);
        }


        let manifest = new jsb.Manifest(manifestStr, storagePath);
        this.assetsManager.loadLocalManifest(manifest, storagePath);
        console.log("update customManifest:", this.assetsManager.getStoragePath());
    }

    checkForUpdate() {



        console.log("check for update");

        if (this.assetsManager == null) {
            this.onComplete("no need to update.")
            return;
        }

        if (this.isUpdating) {
            this.onError("Version update is on process...");
            return;
        }

        console.log(" start check for update ...");


        if (this.assetsManager.getState() === jsb.AssetsManager.State.UNINITED) {
            // Resolve md5 url
            var url = this.manifest.nativeUrl;
            console.log(" native url:", url)
            if (cc.loader.md5Pipe) {
                url = cc.loader.md5Pipe.transformURL(url);
            }
            this.assetsManager.loadLocalManifest(url);
        }

        if (!this.assetsManager.getLocalManifest() || !this.assetsManager.getLocalManifest().isLoaded()) {

            this.onError('Failed to load local manifest ...');
            return 'Failed to load local manifest ...';
        }

        this.assetsManager.setEventCallback(this.checkUpdateCallback.bind(this));

        this.assetsManager.checkUpdate();

        this.isUpdating = true;
    }

    private checkUpdateCallback(event: any) {
        console.log('checkUpdateCallback Code: ' + event.getEventCode());
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.onError("No local manifest file found, hot update skipped.");
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.onError("Fail to download manifest file, hot update skipped.");
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                let newVersionStr = this.assetsManager.getRemoteManifest() ? this.assetsManager.getRemoteManifest().getVersion() : " null";
                let oldVersionStr = this.assetsManager.getLocalManifest() ? this.assetsManager.getLocalManifest().getVersion() : "null";
                this.onComplete("Already up to date with the latest remote version :" + newVersionStr + ", local version :" + oldVersionStr);
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:

                this.isUpdating = false;
                let oldVersion = this.assetsManager.getLocalManifest() ? this.assetsManager.getLocalManifest().getVersion() : "null";
                let newVersion = this.assetsManager.getRemoteManifest() ? this.assetsManager.getRemoteManifest().getVersion() : "null";

                console.log("New version found, old:", oldVersion, ", new: ", newVersion);
                if (oldVersion == "null" || newVersion == "null") {

                } else {
                    // this.assetsManager.loadLocalManifest(this.assetsManager.getLocalManifest(), this.STORAGE_PATH + "-v" + newVersion);
                    console.log("storage path:", this.assetsManager.getStoragePath());
                    let bigOldVersion = oldVersion.split(".")[0];
                    let bigNewVersion = newVersion.split(".")[0];
                    if (bigNewVersion > bigOldVersion) {
                        this.onStart("new version found, go to store to download new app.", true);
                    } else {
                        this.onStart("new version found, update process start.", false);
                        this.updateVersion();
                    }
                }
                break;
            default:
                return;
        }




    }


    getUpdateDescription() {
        return "";
    }

    private updateVersion() {
        if (this.assetsManager == null) {
            return;
        }

        if (this.isUpdating) {
            return;
        }

        if ([jsb.AssetsManager.State.UPDATING,
        jsb.AssetsManager.State.UNZIPPING,
        jsb.AssetsManager.State.UP_TO_DATE].indexOf(this.assetsManager.getState()) >= 0) {

            this.onComplete("no need to update: " + this.assetsManager.getState(), false);
            return;
        }



        if (this.assetsManager.getState() === jsb.AssetsManager.State.UNINITED) {
            // Resolve md5 url
            var url = this.manifest.nativeUrl;
            if (cc.loader.md5Pipe) {
                url = cc.loader.md5Pipe.transformURL(url);
            }
            this.assetsManager.loadLocalManifest(url);
        }


        this.assetsManager.setEventCallback(this.updateCallback.bind(this));

        console.log(" start update ...:", this.assetsManager.getState());
        this.assetsManager.update();

        this.isUpdating = true;
    }


    private versionToInt(version: string) {
        return parseInt(version.toString().split(".").join(""))
    }

    private versionToString(version: number) {
        let a = Math.floor(version / 100);
        let b = Math.floor(version / 10) % 10;
        let c = Math.floor(version) % 10;
        return a + "." + b + "." + c
    }

    private updateCallback(event: any) {
        let needRestart = false;
        let failed = false;

        let completeCallback = null;
        // console.log("update event code:", event.getEventCode());
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.onError('No local manifest file found, hot update skipped.')
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                let percent = event.getPercent();
                if (percent == NaN || typeof percent != "number") percent = 0;

                this.onProgress(event.getMessage() ? "Updated file:" + event.getMessage() : "Updating:" + (percent * 100).toFixed(0) + "%", percent);
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.onError('Fail to download manifest file, hot update skipped.')
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                completeCallback = () => {
                    let newVersionStr = this.assetsManager.getRemoteManifest() ? this.assetsManager.getRemoteManifest().getVersion() : " null";
                    this.onComplete("Already up to date with the latest remote version :" + newVersionStr);

                }
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                completeCallback = () => {
                    let newVersionStr = this.assetsManager.getLocalManifest() ? this.assetsManager.getLocalManifest().getVersion() : " null";
                    this.onComplete('Update finished. new : ' + newVersionStr + event.getMessage(), true);

                }
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:

                this.onError('Update failed. ' + event.getMessage(), true);
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this.onError('Asset update error: ' + event.getAssetId() + ', ' + event.getMessage())
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.onError(event.getMessage())
                break;
            default:
                break;
        }

        if (failed) {
            this.assetsManager.setEventCallback(null);
            this.isUpdating = false;
        }

        if (needRestart) {
            this.assetsManager.setEventCallback(null);

            this.applyPaths();

            if (completeCallback) {

                completeCallback();
            }
        }
    }

    applyPaths() {
        // Prepend the manifest's search path
        let searchPaths = jsb.fileUtils.getSearchPaths();
        console.log("old searchPaths:", searchPaths)
        let newPaths = this.assetsManager.getLocalManifest().getSearchPaths();
        //newPaths[0] = newPaths[0] + ("v" + this.getVersion() + "/")
        console.log("new path:", JSON.stringify(newPaths));
        for (let path of newPaths) {
            if (searchPaths.indexOf(path) < 0) {
                Array.prototype.unshift.apply(searchPaths, path);
            }
        }


        // This value will be retrieved and appended to the default search path during game startup,
        // please refer to samples/js-tests/main.js for detailed usage.
        // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.


        if (this.isLoadGame == false) {

            // 删除游戏的选择记录
            //  cc.sys.localStorage.setItem("HotUpdateSearchPaths", JSON.stringify(searchPaths));
            cc.sys.localStorage.setItem(this.HomeKey, JSON.stringify(searchPaths));
            cc.sys.localStorage.removeItem(this.GameKey);
        } else {


            cc.sys.localStorage.setItem(this.GameKey, JSON.stringify(searchPaths));
            cc.sys.localStorage.removeItem("in-game");
        }

        if (!cc.sys.localStorage.getItem(this.HomeKey)) {
            console.log("app没有更新过，初始化一下home-page");
            cc.sys.localStorage.setItem(this.HomeKey, JSON.stringify(["@assets/"]));
        }
        console.log("isloadgame:", this.isLoadGame);
        console.log("home ：", cc.sys.localStorage.getItem(this.HomeKey));
        console.log("game :", cc.sys.localStorage.getItem("select-game"));

        jsb.fileUtils.setSearchPaths(searchPaths);
        console.log("new searchPaths:", JSON.stringify(searchPaths));
    }


    restart() {
        console.log("restart");
        UpdateController.inst.applyPaths();
        if (cc.audioEngine) cc.audioEngine.stopAll();
        cc.game.restart();
    }

    retry() {

        if (this.assetsManager == null) {
            return;
        }

        if (this.isUpdating == false) {
            this.assetsManager.downloadFailedAssets();
        }
    }

    private versionCompareHandle(versionA: string, versionB: string): number {
        cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
        let vA = versionA.split('.');
        let vB = versionB.split('.');
        for (let i = 0; i < vA.length; ++i) {
            let a = parseInt(vA[i]);
            let b = parseInt(vB[i] || '0');
            if (a === b) {
                continue;
            }
            else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        else {
            return 0;
        }
    }


    // Setup the verification callback, but we don't have md5 check function yet, so only print some message
    // Return true if the verification passed, otherwise return false
    private verifyCallback(path: string, asset: any) {
        // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
        let compressed = asset.compressed;
        // Retrieve the correct md5 value.
        let expectedMD5 = asset.md5;
        // asset.path is relative path and path is absolute.
        let relativePath = asset.path;
        // The size of asset file, but this value could be absent.
        let size = asset.size;

        let info = "";
        if (compressed) {
            info = "Verification passed : " + relativePath;
            return true;
        }
        else {
            info = "Verification passed : " + relativePath + ' (' + expectedMD5 + ')';
            return true;
        }
    }

    destory() {
        if (this.assetsManager) {
            this.assetsManager.setEventCallback(null);
        }

        this.startCallback = [];
        this.completeCallback = [];
        this.errorCallback = [];
        this.progressCallback = [];
    }
}
