import { SingleTon } from "../Utils/ToSingleton";


interface ConfigJson {
    gamePath: string;
    normalPath: string;
    specialPath: string;
    Url: string;
    games: string[]
}
export class GameConfig extends SingleTon<GameConfig>() {


    public static readonly Path = "Config/gameConfig.json";

    public static get Url() {
        return CC_DEBUG ? "https://vicat.wang/GameRes/" : "https://vicat.wang/GameRes/"
    }

    private config: ConfigJson;
    public loadConfig(callback: Function) {
        cc.loader.load(GameConfig.Url + GameConfig.Path + "?time=" + Date.now(), (err, res: ConfigJson) => {
            if (err) {
                console.error(err);
            } else {
                console.log(res)
                this.config = res;
                callback();
            }
        });
    }

    get Config() {
        return this.config;
    }


}