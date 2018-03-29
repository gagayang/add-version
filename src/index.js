#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const md5 = require("md5")
const argv = require('yargs').argv


/****
 * 遍历输入地址的所有文件 在使用的地方增加md5
 ****/

const filePath = argv.path
const basePath = filePath;
const fileNames = ['js', 'css', 'png', 'jpg', 'gif', 'jpeg']
const replaceFiles = ['html', 'jsp', 'css']
const checkList = {}
const changeVersionList = []
const start = new Date()
console.log("增加版本开始" + start)
getFileList(filePath, changeVersionList, checkList)

getHtmlOrJspFileList(filePath, checkList, changeVersionList)

console.log("版本增加完成" + new Date())

/***
 * 替换html / css / jsp 中使用的文件 追加版本号
 * @param filePath
 */

function getHtmlOrJspFileList(filePath, checkList, changeVersionList){
    var files = fs.readdirSync(filePath)
    files.forEach(function(filename) {
        var stats = fs.statSync(path.join(filePath, filename))
        if(stats.isFile()){
            const fileName = getdir(filename)
            if (replaceFiles.indexOf(fileName) !== -1) {
                var contents = readFileSync(path.join(filePath, filename))
                operatorAllFile(contents, path.join(filePath, filename), checkList, changeVersionList)
            }
        }else if(stats.isDirectory()) {
            getHtmlOrJspFileList(path.join(filePath, filename), checkList, changeVersionList)
        }
    })
}

function operatorAllFile(contents, filename, checkList, changeVersionList){
    if (contents) {
        changeVersionList.forEach(function(item, index) {
            var md5 = checkList[item]['md5'];
            contents = replaceall(item, item+"?"+md5, contents);
        })
        writeFileBack(contents, filename);
    }
}

/***
 获取所有 css\图片\js 文件的md5
 **/
function getFileList(filePath, changeList, checkList){
    var files = fs.readdirSync(filePath)
    files.forEach(function(filename) {
        var stats = fs.statSync(path.join(filePath, filename))
        if (stats.isFile()) {
            const fileType = getdir(filename)
            if (fileNames.indexOf(fileType) !== -1) {
                var fileMd5 = md5(readFileSync(path.join(filePath, filename)))
                var allPath = path.join(filePath, filename);
                var endPath = allPath.substr(basePath.length, allPath.length - 1)
                changeList.push(endPath);
                checkList[endPath] = {
                    'md5': fileMd5
                }
                // checkList[endPath]['md5'] = fileMd5
            }
        }else if(stats.isDirectory()){
            getFileList(path.join(filePath,filename), changeList, checkList);
        }
    })
}
// 同步读取文件
function readFileSync(filename) {
    return fs.readFileSync(filename, 'utf-8');
}
//获取后缀名
function getdir(url) {
    var arr = url.split('.');
    var len = arr.length;
    return arr[len-1];
}
// 把文件操作完毕要写回来
function writeFileBack(contents, filename, msg) {
    fs.writeFileSync(filename, contents);
    if (msg) {
        console.log(msg)
    }
}
// 增加版本
function replaceall(replaceThis, withThis, inThis) {
    withThis = withThis.replace(/\$/g,"$$$$")
    return inThis.replace(new RegExp(replaceThis.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&])/g,"\\$&"),"g"), withThis)
}