var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
const { error } = require("console");

var manifest = {
  packageUrl: "https://vicat.wang/Remote-Hot-Update/Arcade/",
  remoteManifestUrl:
    "https://vicat.wang/Remote-Hot-Update/Arcade/project.manifest",
  remoteVersionUrl:
    "https://vicat.wang/Remote-Hot-Update/Arcade/version.manifest",
  version: "1.0.0",
  assets: {},
  searchPaths: [],
};

var dest = "./remote-assets/";
var src = "./jsb/";
var versionNameMatch = "";
// Parse arguments
var i = 2;
while (i < process.argv.length) {
  var arg = process.argv[i];

  switch (arg) {
    case "--url":
    case "-u":
      var url = process.argv[i + 1];
      manifest.packageUrl = url;
      manifest.remoteManifestUrl = url + "project.manifest";
      manifest.remoteVersionUrl = url + "version.manifest";
      i += 2;
      break;
    case "--version":
    case "-v":
      versionNameMatch = "-" + process.argv[i + 1];
      i += 2;
      break;
    case "--src":
    case "-s":
      src = process.argv[i + 1];
      i += 2;
      break;
    case "--dest":
    case "-d":
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
    subpath,
    size,
    md5,
    compressed,
    relative;
  for (var i = 0; i < subpaths.length; ++i) {
    if (subpaths[i][0] === ".") {
      continue;
    }
    subpath = path.join(dir, subpaths[i]);
    stat = fs.statSync(subpath);
    if (stat.isDirectory()) {
      readDir(subpath, obj);
    } else if (stat.isFile()) {
      // Size in Bytes
      size = stat["size"];
      md5 = crypto
        .createHash("md5")
        .update(fs.readFileSync(subpath))
        .digest("hex");
      compressed = path.extname(subpath).toLowerCase() === ".zip";

      relative = path.relative(src, subpath);
      relative = relative.replace(/\\/g, "/");
      relative = encodeURI(relative);
      obj[relative] = {
        size: size,
        md5: md5,
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
    if (e.code != "EEXIST") throw e;
  }
};

// 生成版本号
let generatedVersion = function () {
  let version = 100;
  if (fs.existsSync("./version" + versionNameMatch)) {
    version = fs.readFileSync("./version" + versionNameMatch).toString();
  }

  let newVersion = version2str(version2Int(version) + 1);
  console.log(
    "old version " + versionNameMatch + ":",
    version,
    ", new version " + versionNameMatch + ":",
    newVersion
  );
  fs.writeFileSync("./version" + versionNameMatch, newVersion);
  manifest.version = newVersion;
};

/**
 * 100 to 1.0.0
 * @param {*} version
 */
let version2str = function (version) {
  let a = Math.floor(version / 100);
  let b = Math.floor(version / 10) % 10;
  let c = Math.floor(version) % 10;
  return a + "." + b + "." + c;
};

let version2Int = function (version) {
  return parseInt(version.toString().split(".").join(""));
};

function deleteFolder(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      let curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function CopyDirectory(src, dest) {
  if (fs.existsSync(dest) == false) {
    fs.mkdirSync(dest);
  }
  if (fs.existsSync(src) == false) {
    return false;
  }
  // console.log("src:" + src + ", dest:" + dest);
  // 拷贝新的内容进去
  var dirs = fs.readdirSync(src);
  dirs.forEach(function (item) {
    var item_path = path.join(src, item);
    var temp = fs.statSync(item_path);
    if (temp.isFile()) {
      // 是文件
      // console.log("Item Is File:" + item);
      fs.copyFileSync(item_path, path.join(dest, item));
    } else if (temp.isDirectory()) {
      // 是目录
      // console.log("Item Is Directory:" + item);
      CopyDirectory(item_path, path.join(dest, item));
    }
  });
}

// 拷贝资源
let copyAssets = function (from, dest) {
  if (fs.existsSync(dest)) deleteFolder(dest);

  console.log(from);
  if (!fs.existsSync(from)) {
    throw new error(from, "资源不存在");
  }

  if (!fs.existsSync(from + "src")) {
    throw new error("src资源不存在");
  }

  if (!fs.existsSync(from + "res")) {
    throw new error("res");
  }

  mkdirSync(dest);

  mkdirSync(dest + "/src");
  mkdirSync(dest + "/res");

  console.log("目标资源路径：", dest);
  CopyDirectory(from + "/src", dest + "/src");
  CopyDirectory(from + "/res", dest + "/res");
  console.log(from + " 拷贝成功");
};

// 1.拷贝资源
copyAssets("./build/jsb-link/", src);

// 2. 更新版本信息

generatedVersion();

//3. 根据资源路径生成manifest
readDir(path.join(src, "/src"), manifest.assets);
readDir(path.join(src, "/res"), manifest.assets);

var destManifest = path.join(dest, "project.manifest");
var destVersion = path.join(dest, "version.manifest");

mkdirSync(dest);

fs.writeFileSync(destManifest, JSON.stringify(manifest));
fs.copyFileSync(destManifest, path.join("./hot-update/", "project.manifest"));
console.log("Manifest successfully generated");

delete manifest.assets;
delete manifest.searchPaths;
fs.writeFileSync(destVersion, JSON.stringify(manifest));
fs.copyFileSync(destVersion, path.join("./hot-update/", "version.manifest"));
console.log("Version successfully generated");
