// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { findSourceMap } from "module";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Downloader {


    public static DownloadText(url: string, completeCallback: (errMsg: { status: number, errorMessage: string }, res: string) => void, progressCallback?: (progress: number, loaded: number, total: number) => void) {
        let xhr = cc.loader.getXMLHttpRequest();
        let errInfo = 'Load text file failed: ' + url;

        xhr.open('GET', url, true);
        if (xhr.overrideMimeType) xhr.overrideMimeType('text\/plain; charset=utf-8');

        xhr.onload = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    completeCallback(null, xhr.responseText);
                }
                else {
                    completeCallback({ status: xhr.status, errorMessage: errInfo + '(wrong status)' }, null);
                }
            }
            else {
                completeCallback({ status: xhr.status, errorMessage: errInfo + '(wrong readyState)' }, null);
            }
        };

        xhr.onerror = function () {
            completeCallback({ status: xhr.status, errorMessage: errInfo + '(error)' }, null);
        };

        xhr.ontimeout = function () {
            completeCallback({ status: xhr.status, errorMessage: errInfo + '(time out)' }, null);
        };

        xhr.onprogress = function (ev: ProgressEvent) {
            if (progressCallback) {
                progressCallback(ev.loaded / ev.total, ev.loaded, ev.total);
            }
        }

        xhr.send(null);
    }
}
