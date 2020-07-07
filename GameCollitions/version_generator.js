var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var manifest = {
    packageUrl: 'https://vicat.wang/Remote-Hot-Update/Arcade/',
    remoteManifestUrl: 'https://vicat.wang/Remote-Hot-Update/Arcade/project.manifest',
    remoteVersionUrl: 'https://vicat.wang/Remote-Hot-Update/Arcade/version.manifest',
    version: '1.0.0',
    assets: {},
    searchPaths: []
};

var dest = './remote-assets/';
var src = './jsb/';

// Parse arguments
var i = 2;
while (i < process.argv.length) {
    var arg = process.argv[i];

    switch (arg) {
        case '--url':
        case '-u':
            var url = process.argv[i + 1];
            manifest.packageUrl = url;
            manifest.remoteManifestUrl = url + 'project.manifest';
            manifest.remoteVersionUrl = url + 'version.manifest';
            i += 2;
            break;
        case '--version':
        case '-v':
            manifest.version = process.argv[i + 1];
            i += 2;
            break;
        case '--src':
        case '-s':
            src = process.argv[i + 1];
            i += 2;
            break;
        case '--dest':
        case '-d':
            dest = process.argv[i + 1];
            i += 2;
            break;
        default:
            i++;
            break;
    }
}


function readDir(dir, obj) {
    var stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        return;
    }
    var subpaths = fs.readdirSync(dir),
        subpath, size, md5, compressed, relative;
    for (var i = 0; i < subpaths.length; ++i) {
        if (subpaths[i][0] === '.') {
            continue;
        }
        subpath = path.join(dir, subpaths[i]);
        stat = fs.statSync(subpath);
        if (stat.isDirectory()) {
            readDir(subpath, obj);
        } else if (stat.isFile()) {
            // Size in Bytes
            size = stat['size'];
            md5 = crypto.createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
            compressed = path.extname(subpath).toLowerCase() === '.zip';

            relative = path.relative(src, subpath);
            relative = relative.replace(/\\/g, '/');
            relative = encodeURI(relative);
            obj[relative] = {
                'size': size,
                'md5': md5
            };
            if (compressed) {
                obj[relative].compressed = true;
            }
        }
    }
}

let mkdirSync = function (path) {
    try {
        fs.mkdirSync(path);
    } catch (e) {
        if (e.code != 'EEXIST') throw e;
    }
}

let generatedVersion = function () {

    let version = 100;
    if (fs.existsSync("./version")) {
        version = fs.readFileSync("./version").toString();
    }

    let newVersion = version2str(version2Int(version) + 1)
    console.log("old version:", version, ", new version:", newVersion);
    fs.writeFileSync("./version", newVersion);
    manifest.version = newVersion;
}

/**
 * 100 to 1.0.0
 * @param {*} version 
 */
let version2str = function (version) {

    let a = Math.floor(version / 100);
    let b = Math.floor(version / 10) % 10;
    let c = Math.floor(version) % 10;
    return a + "." + b + "." + c
}

let version2Int = function (version) {

    return parseInt(version.toString().split(".").join(""))
}


// 1. 更新版本信息

generatedVersion();

//2. Iterate assets and src folder
readDir(path.join(src, '/build/jsb-link/src'), manifest.assets);
readDir(path.join(src, '/build/jsb-link/res'), manifest.assets);

var destManifest = path.join(dest, 'project.manifest');
var destVersion = path.join(dest, 'version.manifest');

mkdirSync(dest);

fs.writeFile(destManifest, JSON.stringify(manifest), (err) => {
    if (err) throw err;
    console.log('Manifest successfully generated');
});

delete manifest.assets;
delete manifest.searchPaths;
fs.writeFile(destVersion, JSON.stringify(manifest), (err) => {
    if (err) throw err;
    console.log('Version successfully generated');
});