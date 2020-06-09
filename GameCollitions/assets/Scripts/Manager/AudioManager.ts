import { HashMap } from "../Utils/HashMap";

interface AudioItem {
    loop: boolean;
    volume: number;
    clipName: string;
    supTime: number;
    skip: boolean;
    isBgm: boolean;
}

if (window.oncanplay) {
    window.oncanplay = function () {
        AudioController.canPlay = true;
    };
}

const PATH = "sounds/";

class AudioController {
    private static ins: AudioController;
    private static PlayedList: AudioItem[] = [];
    public static canPlay: boolean = false;
    private static hasBindTouch: boolean = false;

    private audioID = {};
    private constructor() { }
    public static get inst() {
        return this.ins ? this.ins : (this.ins = new AudioController());
    }

    private clips: HashMap<string, cc.AudioClip> = new HashMap();
    init(callback: Function) {
        console.warn(" start load AudioClip ");

        let self = this;
        cc.loader.loadRes(PATH + "bgm", cc.AudioClip, function (err, clip) {
            if (err) {
                console.error(err);
            } else {
                if (CC_DEBUG) {
                    if (
                        typeof clip["_audio"] == "string" &&
                        cc.loader["_cache"] &&
                        cc.loader["_cache"][clip["_audio"]] &&
                        cc.loader["_cache"][clip["_audio"]]["buffer"]
                    ) {
                        clip["_audio"] = cc.loader["_cache"][clip["_audio"]]["buffer"];
                    }
                }
                self.clips.add(clip.name, clip);
                callback && callback();
            }
        });

        cc.loader.loadRes(PATH + "mouse_bgm", function (err, clip) {
            if (err) {
                console.error(err);
            } else {
                self.clips.add(clip.name, clip);
            }
        });

        cc.loader.loadRes(PATH + "bgm_30", function (err, clip) {
            if (err) {
                console.error(err);
            } else {
                self.clips.add(clip.name, clip);
            }
        });

        cc.loader.loadResDir(PATH, (err, res, urls) => {
            if (err) {
                console.error(err);
            } else {
                for (let clip of res) {
                    if (!this.clips.has(clip.name)) {
                        this.clips.add(clip.name, clip);
                    }
                }
            }
        });
    }



    playEffect(name: string, loop: boolean = false, finishCallback?: Function) {
        if (!AudioController.canPlay) {
            this.bindTouch();
            return;
        }

        if (cc.audioEngine.getEffectsVolume() <= 0.05) return;

        let effect = this.clips.get(name);
        // if (this.audioID[name]) return;

        if (effect) {
            this.audioID[name] = cc.audioEngine.playEffect(effect, loop);
            // cc.audioEngine.setFinishCallback(this.audioID[name], () => {
            //   this.audioID[name] = null;
            // });
            cc.audioEngine.setFinishCallback(this.audioID[name], () => {
                finishCallback && finishCallback();
            });
        } else {
            cc.loader.loadRes(PATH + name, cc.AudioClip, (err, res) => {
                if (err) {
                    console.error(err);
                } else {
                    if (CC_DEBUG) {
                        if (
                            typeof res["_audio"] == "string" &&
                            cc.loader["_cache"] &&
                            cc.loader["_cache"][res["_audio"]] &&
                            cc.loader["_cache"][res["_audio"]]["buffer"]
                        ) {
                            res["_audio"] = cc.loader["_cache"][res["_audio"]]["buffer"];
                        }
                    }
                    this.clips.add(res.name, res);
                    // if (this.audioID[name]) return;
                    this.audioID[name] = cc.audioEngine.playEffect(res, loop);
                    cc.audioEngine.setFinishCallback(this.audioID[name], () => {
                        finishCallback && finishCallback();
                    });
                    // cc.audioEngine.setFinishCallback(this.audioID[name], () => {
                    //   this.audioID[name] = null;
                    // });
                }
            });
        }
    }

    playMusic(name: string, loop: boolean = true) {
        if (!AudioController.canPlay) {
            this.bindTouch();
            AudioController.PlayedList.push({
                loop: true,
                volume: 1,
                clipName: name,
                supTime: Date.now(),
                skip: false,
                isBgm: true,
            });
            return;
        }

        let music = this.clips.get(name);
        if (music) {
            cc.audioEngine.playMusic(music, loop);
        } else {
            cc.loader.loadRes(PATH + name, cc.AudioClip, (err, res) => {
                if (err) {
                    console.error(err);
                } else {
                    if (
                        typeof res["_audio"] == "string" &&
                        cc.loader["_cache"] &&
                        cc.loader["_cache"][res["_audio"]] &&
                        cc.loader["_cache"][res["_audio"]]["buffer"]
                    ) {
                        res["_audio"] = cc.loader["_cache"][res["_audio"]]["buffer"];
                    }
                    this.clips.add(res.name, res);
                    cc.audioEngine.playMusic(res, loop);
                }
            });
        }
    }

    private bindTouch() {
        if (!AudioController.hasBindTouch) {
            let self = this;
            let playFunc = function () {
                cc.game.canvas.removeEventListener("touchstart", playFunc);
                AudioController.canPlay = true;
                let item: AudioItem;
                while (
                    (item = AudioController.PlayedList.pop()) &&
                    self.clips.get(item.clipName) &&
                    !item.skip
                ) {
                    cc.audioEngine.playMusic(self.clips.get(item.clipName), item.loop);
                }
            };
            AudioController.hasBindTouch = true;
            cc.game.canvas.addEventListener("touchstart", playFunc);
        }
    }
}
/**
 * 只管理游戏内音频，UI的全部交给FairyUI
 */
export const gAudio = AudioController.inst;