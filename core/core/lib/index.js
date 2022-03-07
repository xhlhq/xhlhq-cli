'use strict';

module.exports = core;

const log = require('@xhlhq-cli/log')
const colors = require('colors/safe')
const semver = require('semver')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const minimist = require('minimist')

const pkg = require('../package.json')
const constant = require('./const')

let args;

function core() {
    try {
        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
        checkUserHome();
        chectInputArgs();
        // debug模式
        log.verbose('debug','test debug log');
    } catch (error) {
        log.error(error.message)
    }
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

// 检查入参
function chectInputArgs() {
    args = minimist(process.argv.slice(2))
    console.log('参数',args)
    checkArgs()
}

// 处理参数
function checkArgs() {
    if(args.debug){
        process.env.LOG_LEVEL = 'verbose'
    }else{
        process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
}