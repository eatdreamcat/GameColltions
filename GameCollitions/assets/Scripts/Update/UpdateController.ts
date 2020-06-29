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
import main from "../../../packages/hot-update/main";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UpdateController extends SingleTon<UpdateController>() {

    private constructor() {
        super();
        this.init();
    }

    private init() {
        if (jsb) {
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
    private readonly STORAGE_PATH: string = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'arcade-remote-asset');;
    private readonly MANIFEST_PAth: string = ""

    private isUpdating: boolean = false;
    private manifest: cc.Asset = null;
    private completeCallback: { target: any, callback: (msg: string, needRestart: boolean) => void }[] = [];
    private startCallback: { target: any, callback: (msg: string) => void }[] = [];
    private errorCallback: { target: any, callback: (msg: string, canRetry: boolean) => void }[] = [];
    private progressCallback: { target: any, callback: (msg: string, progress: number) => void }[] = [];


    public setManifest(manifest: cc.Asset) {
        this.manifest = manifest;
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

    addStartCallback(target: any, callback: (msg: string) => void) {
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

    private onError(msg: string, canRetry: boolean = false) {
        for (let method of this.errorCallback) {
            method.callback.apply(method.target, [msg, canRetry]);
        }
    }

    private onComplete(msg: string, needRestart: boolean = false) {
        for (let method of this.completeCallback) {
            method.callback.apply(method.target, [msg, needRestart]);
        }
    }

    private onStart(msg: string) {
        for (let method of this.startCallback) {
            method.callback.apply(method.target, msg);
        }
    }

    private onProgress(msg: string, progress: number) {
        for (let method of this.progressCallback) {
            method.callback.apply(method.target, [msg, progress]);
        }
    }

    loadCustomManifest(manifestStr: string) {
        if (this.assetsManager == null) {
            return;
        }

        if (this.assetsManager.getState() == jsb.AssetsManager.State.UNINITED) {
            let manifest = new jsb.Manifest(manifestStr, this.STORAGE_PATH);
            this.assetsManager.loadLocalManifest(manifest, this.STORAGE_PATH);
        }

    }

    checkForUpdate() {


        if (this.assetsManager == null) {
            this.onComplete("no need to update.")
            return;
        }

        if (this.isUpdating) {
            return "Version update is on process...";
        }


        if (this.assetsManager.getState() === jsb.AssetsManager.State.UNINITED) {
            // Resolve md5 url
            var url = this.manifest.nativeUrl;
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
        cc.log('Code: ' + event.getEventCode());
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.onError("No local manifest file found, hot update skipped.");
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.onError("Fail to download manifest file, hot update skipped.");
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.onComplete("Already up to date with the latest remote version.");
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:

                this.onStart('New version found, please try to update. (' + this.assetsManager.getTotalBytes() + ')');
                this.updateVersion();
                break;
            default:
                return;
        }

        this.assetsManager.setEventCallback(null);

        this.isUpdating = false;
    }

    private updateVersion() {
        if (this.assetsManager == null) {
            return;
        }

        if (this.isUpdating) {
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

        this.assetsManager.update();
        this.isUpdating = true;
    }


    private updateCallback(event: any) {
        let needRestart = false;
        let failed = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.onError('No local manifest file found, hot update skipped.')
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                this.onProgress(event.getMessage() ? "Updated file:" + event.getMessage() : "", event.getPercent());
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.onError('Fail to download manifest file, hot update skipped.')
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.onComplete('Already up to date with the latest remote version.')
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.onComplete('Update finished. ' + event.getMessage(), true);
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

            // Prepend the manifest's search path
            let searchPaths = jsb.fileUtils.getSearchPaths();
            let newPaths = this.assetsManager.getLocalManifest().getSearchPaths();
            console.log(JSON.stringify(newPaths));
            Array.prototype.unshift.apply(searchPaths, newPaths);
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);
        }
    }

    restart() {
        cc.audioEngine.stopAll();
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
        this.assetsManager.setEventCallback(null);
        this.startCallback = [];
        this.completeCallback = [];
        this.errorCallback = [];
        this.progressCallback = [];
    }
}