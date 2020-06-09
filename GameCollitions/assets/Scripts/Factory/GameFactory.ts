import { HashMap } from "../Utils/HashMap";

class ObjPool {
  private _pool = [];
  private completeHandler: Function;
  private template: cc.Prefab;
  private totalSize: number = 0;
  private initTime: number[] = [];

  /** 对象的唯一标识 */
  hashKey: string;
  constructor(template: cc.Prefab, initSize: number, handle?: Function) {
    this.completeHandler = handle;
    this.template = template;
    this.totalSize = initSize;
    this.hashKey = "ObjPool:" + this.template.name + " - " + this.totalSize;
    this.initPool(initSize);
  }

  initPool(size: number, immediately: boolean = false) {
    if (immediately) {
      for (let i = 0; i < size; ++i) {
        this.initTime.push(Date.now());
        let newNode = cc.instantiate(this.template);
        this.put(newNode);
      }
    } else {
      for (let i = 0; i < size; ++i) {
        this.initTime.push(Date.now());
        setTimeout(() => {
          let newNode = cc.instantiate(this.template);
          this.put(newNode);
        }, i);
      }
    }
  }

  size() {
    return this._pool.length;
  }

  clear() {
    var count = this._pool.length;
    for (var i = 0; i < count; ++i) {
      this._pool[i].destroy && this._pool[i].destroy();
    }
    this._pool.length = 0;
  }

  put(obj: any) {
    if (obj && this._pool.indexOf(obj) === -1) {
      // Remove from parent, but don't cleanup
      obj.removeFromParent(false);
      //obj.setParent(null);
      // Invoke pool handler
      let handlers = obj.getComponents(cc.Component);
      for (let handler of handlers) {
        if (handler && handler.unuse) {
          handler.unuse.apply(handler);
        }
      }

      this._pool.push(obj);

      if (this.completeHandler) {
        // if (!CELER_X) {
        //   console.log(
        //     " pool:",
        //     this.template.name,
        //     ", now:",
        //     this._pool.length,
        //     ", total:",
        //     this.totalSize,
        //     ", cost:",
        //     (Date.now() - this.initTime[this._pool.length - 1]).toFixed(2) +
        //       "ms"
        //   );
        // }
        if (this.totalSize <= this._pool.length) {
          this.completeHandler();
          this.completeHandler = null;
        }
      }
    }
  }

  get(..._) {
    var last = this._pool.length - 1;
    if (last < 0) {
      console.warn(" last < 0 ");
      this.initPool(1, true);
    }
    last = this._pool.length - 1;
    // Pop the last object in pool
    var obj = this._pool[last];
    this._pool.length = last;

    // Invoke pool handler
    let handlers = obj.getComponents(cc.Component);
    for (let handler of handlers) {
      if (handler && handler.reuse) {
        handler.reuse.apply(handler, arguments);
      }
    }
    return obj;
  }
}

class GameFactory {
  private static ins: GameFactory;
  public static get inst() {
    return this.ins ? this.ins : (this.ins = new GameFactory());
  }
  private constructor() { }

  private doneCallback: Function;
  private count: number = 0;
  private totalCount: number = 0;
  private objPool: HashMap<string, ObjPool> = new HashMap();
  private startTime: number = 0;
  init(callback: Function) {
    this.doneCallback = callback;
    this.startTime = Date.now();
    cc.loader.loadResDir(
      "prefabs/",
      cc.Prefab,
      (err, res: cc.Prefab[], urls: string[]) => {
        if (err) {
          console.error(" Game Factory init failed:", err);
        } else {
          this.totalCount = res.length;
          for (let i = 0; i < res.length; i++) {
            let prefab = res[i];
            let nameSplit = prefab.name.split(".");
            let name = nameSplit[0];
            let count = nameSplit[1] ? parseInt(nameSplit[1]) : 30;
            console.log(" init pool:", name, ", count:", count);
            setTimeout(() => {
              let objPool = new ObjPool(
                prefab,
                count,
                this.addCount.bind(this)
              );
              this.objPool.add(name, objPool);
            }, i * 10);
          }
        }
      }
    );
  }

  addCount() {
    this.count++;
    if (this.count >= this.totalCount) {
      console.log(
        " factory cost time:",
        (Date.now() - this.startTime).toFixed(2) + "ms"
      );
      if (this.doneCallback) {
        this.doneCallback();
        this.doneCallback = null;
      }
    }
  }

  getObj(name: string, ...args): cc.Node {
    if (this.objPool.has(name)) {
      return this.objPool.get(name).get(args);
    } else {
      console.error(" objPool dosen't exists this obj:", name);
      return null;
    }
  }

  putObj(name: string, node: cc.Node) {
    if (this.objPool.has(name)) {
      return this.objPool.get(name).put(node);
    } else {
      console.error(" objPool dosen't exists this obj:", name);
    }
  }
}

export const gFactory = GameFactory.inst;
