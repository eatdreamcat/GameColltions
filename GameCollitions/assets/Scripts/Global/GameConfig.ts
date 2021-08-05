import { SingleTon } from "../Utils/ToSingleton";
import Downloader from "../Utils/Downloader";
import { Type } from "../GamePlay/View/GameListView";
import { stringify } from "querystring";
import { BaseSignal } from "../Utils/Signal";

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

interface LocalConfig {
  root: string;
  releaseUrl: string;
  games: {
    name: string;
    url: string;
    cmd: string;
    icon: string;
  }[];
}

export class InitLocalConfigSignal extends BaseSignal {}
export class GameConfig extends SingleTon<GameConfig>() {
  public static readonly Path = "Config/gameConfig.json";

  public static get Url() {
    return "https://vicat.wang/GameRes/";
  }

  private config: ConfigJson;
  private localConfig: LocalConfig;

  private local: boolean = false;

  public isLocal: boolean = false;

  public isSpecial: boolean = false;

  get IconUrl() {
    return this.Config.Url + "/Icons/";
  }

  get LocalConfig() {
    return this.localConfig;
  }

  getGameList(type: Type): { name: string; url: string; icon: string }[] {
    let games: { name: string; url: string; icon: string }[] = [];
    console.log("get Game List:", Type[type]);
    switch (type) {
      case Type.Native:
        for (let game of GameConfig.inst.Config.nativeGames) {
          games.push({
            name: game,
            url: game,
            icon: game,
          });
        }
        break;
      case Type.Normal:
        if (this.isLocal == false) {
          for (let game of GameConfig.inst.Config.normalGames) {
            games.push({
              name: game,
              url: game,
              icon: game,
            });
          }
        } else {
          for (let game of GameConfig.inst.localConfig.games) {
            games.push({
              name: game.name,
              url: game.url,
              icon: game.icon,
            });
          }
        }
        break;
      case Type.Special:
        for (let game of GameConfig.inst.Config.specialGames) {
          games.push({
            name: game,
            url: game,
            icon: game,
          });
        }
        break;
    }
    return games;
  }

  getGameUrl(name: string) {
    if (this.isLocal) {
      for (let game of this.localConfig.games) {
        if (name == game.name) {
          return this.localConfig.root + game.url + "/web-mobile/";
        }
      }
    } else {
      let path = this.isSpecial
        ? this.Config.specialPath
        : this.Config.normalPath;

      return this.Config.Url + path + name;
    }
  }

  private loadLocalConfig(callback: Function) {
    let loadFunc = () => {
      cc.loader.load(
        this.config.LocalUrl + "/game_list.json?time=" + Date.now(),
        (err: any, res: LocalConfig) => {
          if (err) {
            console.error(JSON.stringify(err));
            this.local = false;
          } else {
            this.localConfig = res;
            this.local = true;
            console.log(this.localConfig);
            InitLocalConfigSignal.inst.dispatch();
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
            this.local = false;
          } else {
            console.log(res);
            this.localConfig = JSON.parse(res);
            this.local = true;
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
