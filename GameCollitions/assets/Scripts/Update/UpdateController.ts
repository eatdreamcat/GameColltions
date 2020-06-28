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
    private manifestUrl: any;
    checkForUpdate(): string {
        if (this.isUpdating) {
            return "Version update is on process...";
        }


        if (this.assetsManager.getState() === jsb.AssetsManager.State.UNINITED) {
            // Resolve md5 url
            var url = this.manifestUrl.nativeUrl;
            if (cc.loader.md5Pipe) {
                url = cc.loader.md5Pipe.transformURL(url);
            }
            this.assetsManager.loadLocalManifest(url);
        }
        if (!this.assetsManager.getLocalManifest() || !this.assetsManager.getLocalManifest().isLoaded()) {
            
            return 'Failed to load local manifest ...';
        }
        this.assetsManager.setEventCallback(this.checkUpdateCallback.bind(this));

        this.assetsManager.checkUpdate();

        this.isUpdating = true;
    }

    checkUpdateCallback (event: any) {
        cc.log('Code: ' + event.getEventCode());
        let info = ""
        switch (event.getEventCode())
        
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                info = "No local manifest file found, hot update skipped.";
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                info = "Fail to download manifest file, hot update skipped.";
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                info = "Already up to date with the latest remote version.";
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                info = 'New version found, please try to update. (' + this.assetsManager.getTotalBytes() + ')';
            
                break;
            default:
                return;
        }
        
        this.assetsManager.setEventCallback(null);
      
        this.isUpdating = false;
    }

    updateVersion() {

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
    }
}
