'use strict';

var Fs = require("fs");
var Path = require("fire-path");


module.exports = {
    load: function () {
        // 当 package 被正确加载的时候执行
    },

    unload: function () {
        // 当 package 被正确卸载的时候执行
    },

    messages: {
        'editor:build-finished': function (event, target) {

            let root = Path.normalize(target.dest);

            let mainjsName = "main.js";
            let projectjsName = "project.js";
            let md5Key = "";
            let projectmd5Key = "";
            if (target.md5Cache) {
                // md5 cache 获取一下md5的值


                // 1.读取目录下所有文件名

                let fileList = Fs.readdirSync(target.dest);
                for (let fileName of fileList) {
                    // 2.找到main.js获取md5
                    if (/main.[0-9a-zA-Z]{0,}.js/.test(fileName)) {
                        md5Key = fileName.split(".")[1];
                        mainjsName = fileName;
                    }
                }

                // 3. 获取project的md5

                let fileList2 = Fs.readdirSync(target.dest + "/src");
                Editor.success("fileList2 " + fileList2);
                for (let fileName of fileList2) {
                    if (/project.[0-9a-zA-Z]{0,}.js/.test(fileName)) {
                        projectmd5Key = fileName.split(".")[1];
                        projectjsName = fileName;
                    }
                }

                if (md5Key != "") {
                    Editor.success(" mainjs md5 key is:" + md5Key + ", project md5 key:" + projectmd5Key);
                } else {
                    Editor.fail("get md5 key fail!!");
                    return;
                }
            }
            let refPath = target.actualPlatform == "web-mobile" ? "celerx-web/" : "celerx-native/";
            let url = Path.join(root, mainjsName);

            if (Fs.existsSync(url)) {

                Fs.unlinkSync(url);
                Editor.success("delete " + url);
                try {
                    let mainjsStr = Fs.readFileSync(Editor.url("packages://build-plugin/" + refPath + "main.js")).toString();

                    Editor.success("start inject celerx ...");


                    let celerx = Fs.readFileSync(Editor.url("packages://build-plugin/" + refPath + "celerx.js")).toString();

                    Fs.writeFileSync(url, mainjsStr.replace("PROJECT_JS_PATH", projectjsName).replace("$CELER_X_SDK_INIT_CONTENT$", celerx));
                    Editor.success("inject celerx done...");
                } catch (error) {
                    Editor.success("faild " + error);
                }

            }

        }
    }
};