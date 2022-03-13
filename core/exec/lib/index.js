'use strict';

const Package = require('@xhlhq-cli/package')
const log = require('@xhlhq-cli/log')


const SETTINGS = {
    init: '@xhlhq-cli/init'
}

// 1. targetPath -> modulePath
// 2. modulePath -> package(npm包)
// 3. package.getRootFile(获取入口文件)
// 4. package.update || package.install
function exec() {
    let targetPath = process.env.CLI_TARGET_PATH
    const homePath = process.env.CLI_HOME_PATH
    log.info('targetPath',targetPath)
    log.info('homePath',homePath)
    const comdObj = arguments[arguments.length - 1]
    // 命令名
    const cmdName = comdObj.name()
    const packageName = SETTINGS[cmdName]
    const packageVersion = 'latest'
    // 如果路径不存在
    if(!targetPath) {
        //生成缓存路径
        targetPath = ''
    }
    const pkg = new Package({
        targetPath,
        packageName,
        packageVersion
    })
    const rootFilePath = pkg.getRootFilePath()
    console.log('rootFilePath',rootFilePath)
}

module.exports = exec;
