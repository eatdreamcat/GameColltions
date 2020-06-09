import { SingleTon } from "../Utils/ToSingleton";


interface ConfigJson {
    gamePath: string;
    normalPath: string;
    specialPath: string;
    games: string[]
}
export class GameConfig extends SingleTon<GameConfig>() {


    public static readonly Path = "Config/gameConfig";

    public static get Url() {
        return CC_DEBUG ? "" : "https://vicat.wang/GameColltions/"
    }

    private config: ConfigJson;
    public loadConfig(callback: Function) {
        cc.loader.loadRes(GameConfig.Path, cc.JsonAsset, (err, res: cc.JsonAsset) => {
            if (err) {
                console.error(err);
            } else {
                this.config = res.json;
                callback();
            }
        });
    }

    get Config() {
        return this.config;
    }


}