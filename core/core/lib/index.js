'use strict';

module.exports = core;

const path = require('path')
const log = require('@xhlhq-cli/log')
const colors = require('colors/safe')
const semver = require('semver')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const {Command} = require('commander')

const init = require('@xhlhq-cli/init')
const exec = require('@xhlhq-cli/exec')

const pkg = require('../package.json')
const constant = require('./const')

const program = new Command();

async function core() {
    try {
        prepare()
        registerCommand()
    } catch (error) {
        log.error(error.message)
        // 在debug模式下打印错误的详细信息
        if(process.env.LOG_LEVEL === 'verbose') {
            console.log(error)
        }
    }
}
// 准备阶段操作
async function prepare() {
    checkPkgVersion();
    // checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkEnv()
    checkGlobalUpdate()
}
// 检查脚手架版本号
function checkPkgVersion() {
    log.info('xhlhq-cli',pkg.version);
}

// 检查node版本号
function checkNodeVersion() {
    // 获取当前版本号
    const currentNodeVersion = process.version
    // 获取最低版本号
    const lowestNodeVersion = constant.LOWEST_NODE_VERSION
    // 如果当前版本号没有大于或等于最低版本号，则抛出异常
    if(!semver.gte(currentNodeVersion,lowestNodeVersion)) {
        throw new Error(colors.red(`xhlhq-cli 需要安装 v${lowestNodeVersion}以上版本的 node.js`))
    }
}

// 检查当前用户是否为管理员，如果是管理员则设置为普通用户，因为管理员不可增删文件
function checkRoot() {
    const rootCheck = require('root-check')
    rootCheck();
}

// 检查用户主目录
function checkUserHome() {
    if(!userHome || !pathExists(userHome)){
        throw new Error(colors.red('当前登录用户主目录不存在！'))
    }
}

// 检查环境变量
function checkEnv() {
    const dotenv = require('dotenv')
    // 查找环境变量的位置,放在主目录下的 .env 中
    const dotenvPath = path.resolve(userHome, '.env')
    // 如果存在则获取环境变量
    if(pathExists(dotenvPath)) {
        dotenv.config({
            path: dotenvPath
        })
    }
    // config = createDefaultConfig()
    createDefaultConfig()
}

// 当用户未配置环境变量时，默认的环境变量配置
function createDefaultConfig() {
    const cliConfig = {
        home: userHome
    }
    if(process.env.CLI_HOME){
        // 如果配置了环境变量
        cliConfig['cliHome'] = path.join(userHome,process.env.CLI_HOME);
    }else{
        // 没有配置环境变量则采用默认配置
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME);
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome
    return cliConfig
}

// 检查脚手架版本
async function checkGlobalUpdate() {
    //1.获取当前的版本和模块名
    const currentNodeVersion = pkg.version;
    const npmName = pkg.name;
    //2.调用npm API,获取最新版本号
    const { getSemverVersion } = require('@xhlhq-cli/get-npm-info')

    const lastVersions = await getSemverVersion(npmName,currentNodeVersion)
    //3.比对当前版本号和最新版本号
    //4.根据对比提示用户是否更新到最新版本号
    // 判断是否有最新的version并且最新的version大于当前version
    if(lastVersions && semver.gt(lastVersions,currentNodeVersion)){
        log.warn(colors.yellow('版本更新',`请手动更新${npmName}，当前版本为：${currentNodeVersion}，最新版本为：${lastVersions}
            更新命令：npm install -g ${npmName}`))
    }
}

// 注册脚手架命令
function registerCommand() {
    program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug','是否开启调试模式',false)
    .option('-tp, --targetPath <targetPath>','是否指定本地调试文件路径','')
    // 注册命令
    program
    .command('init [projectName]')
    .option('-f, --force','是否强制初始化项目')
    .description('初始化脚手架项目')
    .action(exec);
    // 监听debug，确定是否开启debug模式
    program.on('option:debug',function() {
        const options = program.opts()
        if(options.debug){
            process.env.LOG_LEVEL = 'verbose'
        }else{
            process.env.LOG_LEVEL = 'info'
        }
        log.level = process.env.LOG_LEVEL
        log.verbose('debug模式启动')
    })
    // 监听本地调试文件路径
    program.on('option:targetPath',function() {
        const options = program.opts()
        process.env.CLI_TARGET_PATH = options.targetPath
    })
    // 错误命令后的提示
    program.showHelpAfterError();
    // 当用户不输入option时，打印help
    if(process.argv.length < 3) {
        console.log()
        program.outputHelp();
        console.log()
    }

    program.parse(process.argv)
}