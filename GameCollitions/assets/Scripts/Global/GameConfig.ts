import { SingleTon } from "../Utils/ToSingleton";


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
        return "http://123.56.12.185/GameRes/"
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

    public loadConfigInNative(url: string, callback) {
        var xhr = cc.loader.getXMLHttpRequest(),
            errInfo = 'Load text file failed: ' + url;
        xhr.open('GET', url, true);
        if (xhr.overrideMimeType) xhr.overrideMimeType('text\/plain; charset=utf-8');
        xhr.onload = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    callback(null, xhr.responseText);
                }
                else {
                    callback({ status: xhr.status, errorMessage: errInfo + '(wrong status)' });
                }
            }
            else {
                callback({ status: xhr.status, errorMessage: errInfo + '(wrong readyState)' });
            }
        };
        xhr.onerror = function () {
            callback({ status: xhr.status, errorMessage: errInfo + '(error)' });
        };
        xhr.ontimeout = function () {
            callback({ status: xhr.status, errorMessage: errInfo + '(time out)' });
        };
        xhr.send(null);
    }

}