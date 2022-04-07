'use strict';
// lerna publish
const pkgDir = require('pkg-dir').sync
const path = require('path')
const npminstall = require('npminstall')
const pathExists = require('path-exists').sync
const fsExtra = require('fs-extra')

const {isObject} = require("@xhlhq-cli/utils")
const formatPath = require('@xhlhq-cli/format-path')
const { getDefaultRegistry,getNpmLatestVersion } = require('@xhlhq-cli/get-npm-info')
 
class Package {
    constructor(options) {
        if(!options || !isObject(options)) {
            throw new Error('Package类的options不能为空且必须为对象类型!!')
        }
        // package的路径
        this.targetPath = options.targetPath;
        // 缓存的路径
        this.storeDir = options.storeDir;
        // package的name
        this.packageName = options.packageName;
        // package的version
        this.packageVersion = options.packageVersion;
        // 缓存文件目录的前缀
        this.chcheFilePathPrefix = this.packageName.replace('/','_')
    }
    // 获取缓存文件路径
    get cahceFilePath() {
        // 例子：_@xhlhq-cli_init@1.0.8@@xhlhq-cli
        return path.resolve(this.storeDir,`_${this.chcheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
    }
    // 生成指定版本的文件路径
    getSpecificCacheFilePath(version) {
        return path.resolve(this.storeDir,`_${this.chcheFilePathPrefix}@${version}@${this.packageName}`)
    }
    async prepare() {
        
        // 当缓存路径不存在的时候
        if(this.storeDir && !pathExists(this.storeDir)){
            // 根据路径创建文件目录
            fsExtra.mkdirpSync(this.storeDir)
        }
        // 获取最新的version
        if(this.packageVersion === 'latest') {
            this.packageVersion = await getNpmLatestVersion(this.packageName)
        }
    }
    // 判断当前Package是否存在
    async exists() {
        if(this.storeDir) {
            // 缓存模式
            await this.prepare()
            return pathExists(this.cahceFilePath)
        }else{
            // 非缓存模式
            return pathExists(this.targetPath)
        }
    }
    // 安装Package
    async install() {
        await this.prepare()
        return npminstall({
            // install root dir
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [
                { name: this.packageName, version: this.packageVersion },
            ],
        });
    }
    // 更新Package
    async update() {
        await this.prepare()
        // 1.获取最新的版本号
        const latestPackageVersion = await getNpmLatestVersion(this.packageName)
        // 2.查询最新版本对应的路径是否存在
        const latestPath = this.getSpecificCacheFilePath(latestPackageVersion)
        // 3.如果不存在则说明当前版本不是最新版本，则直接安装最新版本
        if(!pathExists(latestPath)){
            await npminstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(),
                pkgs: [
                    { name: this.packageName, version: latestPackageVersion },
                ],
            });
            this.packageVersion = latestPackageVersion
        }
        console.log('当前版本为最新版本：',latestPackageVersion)
        return latestPath
    }
    // 获取入口文件路径
    getRootFilePath() {
        function _getRootFile(targetPath) {
            const dir = pkgDir(targetPath)
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
        // 获取package.json的路径
        if(this.storeDir){
            // 当存在缓存路径时，返回缓存目录
            return _getRootFile(this.cahceFilePath)
        }else{
            return _getRootFile(this.targetPath)
        }
    }
}

module.exports = Package;
