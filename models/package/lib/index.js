'use strict';

const pkgDir = require('pkg-dir').sync
const path = require('path')

const {isObject} = require("@xhlhq-cli/utils")
const formatPath = require('@xhlhq-cli/format-path')

class Package {
    constructor(options) {
        if(!options || !isObject(options)) {
            throw new Error('Package类的options不能为空且必须为对象类型!!')
        }
        // package的路径
        this.targetPath = options.targetPath;
        // package的name
        this.packageName = options.packageName;
        // package的version
        this.packageVersion = options.packageVersion;
    }
    // 判断当前Package是否存在
    exists() {

    }
    // 安装Package
    install() {

    }
    // 更新Package
    update() {

    }
    // 获取入口文件路径
    getRootFilePath() {
        // 获取package.json的路径

        const dir = pkgDir(this.targetPath)
        // console.log('dir',dir)
        if(dir) {
            // 读取package.json
            const pkgFile = require(path.resolve(dir, 'package.json'))
            // 寻找 main/lib
            if(pkgFile && pkgFile.main){
                // 如果存在则返回package中设置的入口文件的路径
                // 路径兼容
                return formatPath(path.resolve(dir,pkgFile.main))
            }
        }
        return null
    }
}

module.exports = Package;
