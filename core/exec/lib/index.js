'use strict';

const path = require('path')

const Package = require('@xhlhq-cli/package')
const log = require('@xhlhq-cli/log')


const SETTINGS = {
    init: '@xhlhq-cli/init'
}
const CACHE_DIR = 'dependencies'
// 1. targetPath -> modulePath
// 2. modulePath -> package(npm包)
// 3. package.getRootFile(获取入口文件)
// 4. package.update || package.install
async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH
    const homePath = process.env.CLI_HOME_PATH
    let storeDir = null
    let pkg = null
    log.verbose('targetPath',targetPath)
    log.verbose('homePath',homePath)
    const comdObj = arguments[arguments.length - 1]
    // 命令名
    const cmdName = comdObj.name()
    const packageName = SETTINGS[cmdName]
    const packageVersion = 'latest'
    // 如果命令中未指定路径
    if(!targetPath) {
        //生成缓存路径
        targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules')
        log.verbose('targetPath',targetPath)
        log.verbose('homePath',homePath)

        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        })
        if(await pkg.exists()) {
            // 存在pkg，则更新package
            await pkg.update()
        }else{
            // 不存在。安装pkg
            await pkg.install()
        }
    }  else{
        // 命令中指定了路径
        // xhlhq-cli init pkg1 -f --targetPath D:\xhlhq\xhlhq-cli\commands\init\lib
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        })
    }
    
    // 获取倒要执行的文件路径
    const rootFilePath = pkg.getRootFilePath()
    // 通过require获取到文件并执行文件
    if(rootFilePath) {
        require(rootFilePath).apply(null,arguments)
    }
}

module.exports = exec;
