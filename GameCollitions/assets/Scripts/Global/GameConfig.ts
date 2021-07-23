import { SingleTon } from "../Utils/ToSingleton";
import Downloader from "../Utils/Downloader";

interface ConfigJson {
  gamePath: string;
  normalPath: string;
  specialPath: string;
  Url: string;
  LocalUrl: string;
  releaseUrl: string;
  normalGames: string[];
  specialGames: string[];
  nativeGames: string[];
  new: string[];
}

interface LocalConfig {}
export class GameConfig extends SingleTon<GameConfig>() {
  public static readonly Path = "Config/gameConfig.json";

  public static get Url() {
    return "https://vicat.wang/GameRes/";
  }

  private config: ConfigJson;
  private localConfig: LocalConfig;

  public isLocal: boolean = false;

  private loadLocalConfig(callback: Function) {
    let loadFunc = () => {
      cc.loader.load(
        this.config.LocalUrl + "/game_list.json?time=" + Date.now(),
        (err: any, res: ConfigJson) => {
          if (err) {
            console.error(JSON.stringify(err));
            this.isLocal = false;
          } else {
            console.log(res);
            this.localConfig = res;
            this.isLocal = true;
          }
          callback();
        }
      );
    };

    let loadFuncInNative = () => {
      this.loadConfigInNative(
        this.config.LocalUrl + "/game_list.json?time=" + Date.now(),
        (err: any, res: string) => {
          if (err) {
            console.error(JSON.stringify(err));
            this.isLocal = false;
          } else {
            console.log(res);
            this.localConfig = JSON.parse(res);
            this.isLocal = true;
          }
          callback();
        }
      );
    };

    if (cc.sys.isNative) {
      loadFuncInNative();
    } else {
      loadFunc();
    }
  }

  public loadConfig(callback: Function) {
    let loadFunc = () => {
      cc.loader.load(
        GameConfig.Url + GameConfig.Path + "?time=" + Date.now(),
        (err: any, res: ConfigJson) => {
          if (err) {
            console.error(JSON.stringify(err));
            setTimeout(() => {
              loadFunc();
            }, 2000);
          } else {
            console.log(res);
            this.config = res;
            this.loadLocalConfig(callback);
          }
        }
      );
    };

    let loadFuncInNative = () => {
      this.loadConfigInNative(
        GameConfig.Url + GameConfig.Path + "?time=" + Date.now(),
        (err: any, res: string) => {
          if (err) {
            console.error(JSON.stringify(err));
            setTimeout(() => {
              loadFuncInNative();
            }, 2000);
          } else {
            console.log(res);
            this.config = JSON.parse(res);
            this.loadLocalConfig(callback);
          }
        }
      );
    };

    if (cc.sys.isNative) {
      loadFuncInNative();
    } else {
      loadFunc();
    }
  }

  get Config() {
    return this.config;
  }

  public loadConfigInNative(
    url: string,
    callback: (err: any, res: string) => void
  ) {
    Downloader.DownloadText(url, callback);
  }
}
