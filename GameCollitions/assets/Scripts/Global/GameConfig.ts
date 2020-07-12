import { SingleTon } from "../Utils/ToSingleton";
import Downloader from "../Utils/Downloader";


interface ConfigJson {
    gamePath: string;
    normalPath: string;
    specialPath: string;
    Url: string;
    normalGames: string[];
    specialGames: string[]
    new: string[]
}
export class GameConfig extends SingleTon<GameConfig>() {


    public static readonly Path = "Config/gameConfig.json";

    public static get Url() {
        return "https://vicat.wang/GameRes/"
    }

    private config: ConfigJson;
    public loadConfig(callback: Function) {

        let loadFunc = () => {
            cc.loader.load(GameConfig.Url + GameConfig.Path + "?time=" + Date.now(), (err: any, res: ConfigJson) => {
                if (err) {
                    console.error(JSON.stringify(err));
                    setTimeout(() => {
                        loadFunc();
                    }, 100);
                } else {
                    console.log(res)
                    this.config = res;
                    callback();
                }
            });
        }

        let loadFuncInNative = () => {
            this.loadConfigInNative(GameConfig.Url + GameConfig.Path + "?time=" + Date.now(), (err: any, res: string) => {
                if (err) {
                    console.error(JSON.stringify(err))
                    setTimeout(() => {
                        loadFuncInNative();
                    }, 100);
                } else {
                    console.log(res)
                    this.config = JSON.parse(res);
                    callback();
                }
            })
        }


        if (cc.sys.isNative) {
            loadFuncInNative();
        } else {
            loadFunc();
        }
    }

    get Config() {
        return this.config;
    }

    public loadConfigInNative(url: string, callback: (err: any, res: string) => void) {

        Downloader.DownloadText(url, callback);
    }

}