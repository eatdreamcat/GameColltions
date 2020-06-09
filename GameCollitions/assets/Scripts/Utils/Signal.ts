import { SingleTon } from "./ToSingleton";


interface Listener {
    callback: Function;
    target: any
}

export abstract class BaseSignal extends SingleTon<BaseSignal>() {
    private listenerMap: Listener[] = [];
    private onceListenerMap: Listener[] = [];

    private doDispatch(...args) {
        this.excuteListener(...args);
        this.excuteOnce(...args);
    }

    private excuteListener(...args) {
        if (this.listenerMap && this.listenerMap.length > 0) {
            for (let listener of this.listenerMap) {
                listener.callback.apply(listener.target, args);
            }
        }
    }

    private excuteOnce(...args) {
        if (this.onceListenerMap && this.onceListenerMap.length > 0) {
            for (let listener of this.onceListenerMap) {
                listener.callback.apply(listener.target, args);
            }

            this.onceListenerMap.length = 0;
        }
    }

    private listen(callback: Function, target: any) {
        this.listenerMap.push({
            callback: callback,
            target: target
        })
    }

    private listenOnce(callback: Function, target: any) {
        this.onceListenerMap.push({
            callback: callback,
            target: target
        })
    }

    removeListener(callback: Function, target: any) {
        if (this.listenerMap && this.listenerMap.length > 0) {

            for (let i = 0; i < this.listenerMap.length; ++i) {
                let listener = this.listenerMap[i];
                if (listener.callback == callback && listener.target == target) {
                    this.listenerMap.splice(i, 1);
                    --i;
                }
            }
        }
    }

    removeTarget(target: any) {
        if (this.listenerMap && this.listenerMap.length > 0) {

            for (let i = 0; i < this.listenerMap.length; ++i) {
                let listener = this.listenerMap[i];
                if (listener.target == target) {
                    this.listenerMap.splice(i, 1);
                    --i;
                }
            }
        }
    }


    dispatch() {
        this.doDispatch(null);
    }

    dispatchOne<T>(val: T) {
        this.doDispatch(val);
    }

    dispatchTwo<T, U>(val1: T, val2: U) {
        this.doDispatch(val1, val2);
    }

    dispatchThree<T, U, O>(val1: T, val2: U, val3: O) {
        this.doDispatch(val1, val2, val3);
    }

    dispatchFour<T, U, O, P>(val1: T, val2: U, val3: O, val4: P) {
        this.doDispatch(val1, val2, val3, val4);
    }

    dispatchFive<T, U, O, P, L>(val1: T, val2: U, val3: O, val4: P, val5: L) {
        this.doDispatch(val1, val2, val3, val4, val5);
    }

    addListener(callback: () => void, target: any) {
        this.listen(callback, target);
    }

    addOnce(callback: () => void, target: any) {
        this.listenOnce(callback, target);
    }



    addListenerOne<T>(callback: (val: T) => void, target: any) {
        this.listen(callback, target);
    }

    addListenerTwo<T, U>(callback: (val1: T, val2: U) => void, target: any) {
        this.listen(callback, target);
    }

    addListenerThree<T, U, O>(callback: (val1: T, val2: U, val3: O) => void, target: any) {
        this.listen(callback, target);
    }

    addListenerFour<T, U, O, P>(callback: (val1: T, val2: U, val3: O, val4: P) => void, target: any) {
        this.listen(callback, target);
    }

    addListenerFive<T, U, O, P, L>(callback: (val1: T, val2: U, val3: O, val4: P, val5: L) => void, target: any) {
        this.listen(callback, target);
    }


    addOnceOne<T>(callback: (val: T) => void, target: any) {
        this.listenOnce(callback, target);
    }

    addOnceTwo<T, U>(callback: (val1: T, val2: U) => void, target: any) {
        this.listenOnce(callback, target);
    }

    addOnceThree<T, U, O>(callback: (val1: T, val2: U, val3: O) => void, target: any) {
        this.listenOnce(callback, target);
    }

    addOnceFour<T, U, O, P>(callback: (val1: T, val2: U, val3: O, val4: P) => void, target: any) {
        this.listenOnce(callback, target);
    }

    addOnceFive<T, U, O, P, L>(callback: (val1: T, val2: U, val3: O, val4: P, val5: L) => void, target: any) {
        this.listenOnce(callback, target);
    }




}



