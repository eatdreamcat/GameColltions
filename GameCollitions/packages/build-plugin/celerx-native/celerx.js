window["celerSDK"] = {
  onStateReceived: function (callback) {

  },
  onCourtModeStarted: function (callback) {

  },
  getMatch: function () {

  },
  showCourtModeDialog: function () {

  },
  start: function () {

  },
  sendState: function (arr) {

  },
  draw: function (arr) {

  },
  win: function (arr) {

  },
  lose: function (arr) {

  },
  surrender: function (arr) {

  },
  applyAction: function (arr, callback) {

  },
  getOnChainState: function (callback) {

  },
  getOnChainActionDeadline: function (callback) {

  },
  getCurrentBlockNumber: function () {

  },
  finalizeOnChainGame: function (callback) {

  },
  submitScore: function (score) {
    console.log("submit score:", e);
    localStorage.removeItem('select-game');
    localStorage.removeItem('in-game');
    cc.game.restart();
  },
  ready: function () {
    if (sdkBridge && sdkBridge.ready) {
      sdkBridge.ready();
    }

  },
  onStart: function (callback) {
    if (sdkBridge) {
      sdkBridge.start = callback;
    }
  },

  provideScore: function (callback) {
    if (sdkBridge) {
      sdkBridge.getGameScore = callback;
    }
  },
  provideCurrentFrameData: function (callback) {

  },
  didTakeSnapshot: function (e) {

  },
  log: function (e) {
    if (sdkBridge && sdkBridge.addLog) {
      sdkBridge.addLog(e);
    }
  },

  onResume: function (callback) {

    if (sdkBridge) {
      sdkBridge.resume = callback
    }

  },
  onPause: function (callback) {

    if (sdkBridge) {
      sdkBridge.pause = callback
    }

  }
};