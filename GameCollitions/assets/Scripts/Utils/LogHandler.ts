import { SingleTon } from "./ToSingleton";

export class LogHandler extends SingleTon<LogHandler>() {


  constructor() {
    super();
    if (window.addEventListener) {
      for (let event of LogHandler.LISTENNING_EVENTS) {
        let funcName =
          "trigger" + event.charAt(0).toLocaleUpperCase() + event.substring(1);
        if (this[funcName] && typeof this[funcName] == "function") {
          window.addEventListener(event, this[funcName].bind(this));
        }
      }
    }
  }

  private logFunc: Function = console.log;
  private logMsg: any = null;
  private static readonly VERSION = "Game template : ";
  private frameTimes = 0;
  private now = 0;
  private Frame = 20;
  public totalFrames = 0;
  public startTime = 0;

  dumpFrameInfo() {
    let timeCost = (Date.now() - this.startTime) / 1000;
    let perFrame = timeCost / this.totalFrames;
    this.log(
      " total frames:",
      this.totalFrames,
      " ,total cost time:",
      timeCost + "s",
      " , per frame cost time ave:" + perFrame + "s"
    );
  }

  log(...args) {
    this.addLog(...args);
    this.sendLog();
  }

  initLog(callback: Function) {
    cc.director.once(
      cc.Director.EVENT_AFTER_SCENE_LAUNCH,
      () => {
        this.frameTimes = 0;
        this.now = Date.now();
        this.startTime = Date.now();
      },
      this
    );

    cc.director.on(
      cc.Director.EVENT_AFTER_DRAW,
      () => {
        this.frameTimes++;
        this.totalFrames++;
        if (this.frameTimes >= this.Frame) {
          this.frameTimes = 0;
          // this.addLog(
          //   " draw " +
          //     this.Frame +
          //     " frames cost:" +
          //     (Date.now() - this.now) +
          //     " ms"
          // );
          this.now = Date.now();
          // this.sendLog();
        }
      },
      this
    );

    this.logFunc = callback;
    console.error = function (...args) {
      LogHandler.inst.log("[ERROR]", args);
    };

    console.warn = function (...args) {
      LogHandler.inst.log("[WARN]", ...args);
    };

    console.log = function (...args) {
      LogHandler.inst.log("[INFO]", ...args);
    };
  }

  formatLogArguments(..._) {
    let logString = "";
    for (let i = 0; i < arguments.length; i++) {
      let type = typeof arguments[i];
      if (type == "string" || type == "number") {
        logString += " " + arguments[i];
      } else if (type == "object") {
        logString += " " + JSON.stringify(arguments[i]);
      } else if (type == "boolean" && arguments[i].toString) {
        logString += arguments[i].toString();
      }
    }
    return logString;
  }

  addLog(...args) {
    if (this.logMsg == null) {
      this.logMsg = {};
    }

    let msg = this.formatLogArguments(...args);

    let fullTime = this.getFullTime(new Date());
    this.logMsg[fullTime] = LogHandler.VERSION + msg;
  }

  getFullTime(date: Date): string {
    let fullTime = "";
    let year = date.getFullYear();
    fullTime += year;
    let month = date.getMonth();
    fullTime += "-" + (month >= 10 ? month : "0" + month);
    let day = date.getDate();
    fullTime += "-" + (day >= 10 ? day : "0" + day);

    let hour = date.getHours();
    fullTime += "  " + (hour >= 10 ? hour : "0" + hour);

    let minute = date.getMinutes();
    fullTime += ":" + (minute >= 10 ? minute : "0" + minute);
    let second = date.getSeconds();
    fullTime += ":" + (second >= 10 ? second : "0" + second);

    return fullTime;
  }

  sendLog() {
    if (!this.logFunc) return;
    if (this.logMsg == null) return;
    this.logFunc(JSON.stringify(this.logMsg));
    // if (CELER_X) {
    //   if (window["webkit"]) {
    //     window["webkit"].messageHandlers["log"].postMessage(
    //       JSON.stringify(this.logMsg)
    //     );
    //   }
    // }
    this.logMsg = null;
  }

  /**
   * window的事件监听回调，方法格式trigger + 事件名 首字母大写
   */
  private static LISTENNING_EVENTS = [
    "error",
    /*"unload",
    "load",
    "focus",
    "blur",
    "abort",
    "suspend",
    "beforeunload",
    "onunload",
    "close",*/
  ];

  triggerClose(ev: Event) {
    this.addLog("triggerClose");
    this.sendLog();
  }

  triggerLoad(ev: Event) {
    this.addLog("triggerLoad");
    this.sendLog();
  }
  triggerUnload(ev: Event) {
    this.addLog("triggerUnload");
    this.sendLog();
  }

  triggerOnunload(ev: Event) {
    this.addLog("triggerUnload");
    this.sendLog();
  }

  triggerError(err: ErrorEvent) {
    this.addLog("triggerError");
    this.addLog(err.message);
    this.sendLog();
  }
  triggerFocus(foc: FocusEvent) {
    this.addLog("triggerFocus");
    this.sendLog();
  }

  triggerBlur(foc: FocusEvent) {
    this.addLog("triggerBlur");
    this.sendLog();
  }

  triggerAbort(ui: UIEvent) {
    this.addLog("triggerAbort");
    this.sendLog();
  }
  triggerSuspend(sus: Event) {
    this.addLog("triggerSuspend");
    this.sendLog();
  }

  beforeunload(bf: BeforeUnloadEvent) {
    this.addLog("beforeunload");
    this.sendLog();
  }
}
CC_DEBUG && (window["LogHandler"] = LogHandler);
