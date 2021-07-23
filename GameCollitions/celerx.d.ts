/**   celerx SDK */

/** Running with celerx SDK*/
declare let CELER_X: boolean;
declare let MENU_SCENE: boolean;

/** 匹配信息 */
declare interface MatchInfo {
  /** 匹配ID */
  matchId: string;
  /** 随机种子 */
  sharedRandomSeed: number;
  /** 难度信息(目前根据游戏有的游戏不需要用到) */
  difficultyLevel: number;
  /** 是否  新手 */
  shouldLaunchTutorial: boolean;
  /** 语种 en_US|zh_CN|pt_BR */
  locale: string;
  /** 兑换比例 */
  ratio?: number;
}

declare class celerSDK {
  /** onStart触发后获取随机种子等信息 */
  static getMatch(): MatchInfo;

  /**
   * 结算提交分数，调用该接口后则游戏结束，webview关闭
   * @param score
   */
  static submitScore(score: number);

  /** 游戏加载完成后，通知app游戏可以开始 */
  static ready(): void;

  /**
   *  app展示webview游戏显示时触发
   * @param callback 游戏正式开始的逻辑
   */
  static onStart(callback: () => void);

  /**
   * 玩家中途退出时app获取游戏分数的接口
   * @param callback 获取当前总得分的方法
   */
  static provideScore(callback: () => number);

  /**
   * 发送log给app端
   * @param msg string
   */
  static log(msg: string): void;

  /**
   * app切后台触发
   * @param callback
   */
  static onPause(callback: () => void);

  /**
   * app切回前台触发
   * @param callback
   */
  static onResume(callback: () => void);
  /**
   * 请求看广告
   * @param sequenceId 广告对应的ID, 每个广告的结束回调会回传这个ID
   */
  static showAd(sequenceId: string);

  /** 判断有没有接口 */
  static hasMethod(name: string): boolean;
  /**
   * 注册看广告完成的回调
   * @param callback
   */
  static onAdPlayFinished(callback: (sequenceId: string) => void);
  /**
   * 注册看广告失败的回调
   * @param callback
   */
  static onAdPlayFailed(callback: (sequenceId: string) => void);

  // private method
  private static onStateReceived(callback: () => void);
  private static onCourtModeStarted(callback: () => void);
  private static showCourtModeDialog(): void;
  private static start(): void;
  private static sendState(arr: []): void;
  private static draw(arr: []): void;
  private static win(arr: []): void;
  private static lose(arr: []): void;
  private static surrender(arr: []): void;
  private static applyAction(arr: [], callback: () => void);
  private static getOnChainState(callback: () => void);
  private static getOnChainActionDeadline(callback: () => void);
  private static getCurrentBlockNumber(): number;
  private static finalizeOnChainGame(callback: () => void);
}

/**
 * 多语言转换
 */
declare class lan {
  /**
   * 配置语言
   * @param lan
   * @param stringMap
   */
  static define(
    lan: string,
    stringMap: { [key: number]: { [key: number]: string } }
  );

  /** 设置语种 */
  static set(lan: string);

  /**
   * 翻译
   * @param key 界面key
   * @param contentKey 内容key
   * @param replace 替换文本
   */
  static t(key: number, contentKey: number, replace?: string[]): string;
}
