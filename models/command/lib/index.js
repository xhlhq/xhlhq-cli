'use strict';
// lerna publish
const colors = require('colors/safe')
const semver = require('semver')

const log = require('@xhlhq-cli/log');
const { isArray } = require('@xhlhq-cli/utils')


const LOWEST_NODE_VERSION = '12.0.0'

class Command {
    constructor(argv) {
        if (!argv) {
            throw new Error('参数不能为空！！')
        }
        if (!isArray(argv)) {
            throw new Error('参数必须是数组！！')
        }
        if (argv.length < 1) {
            throw new Error('参数列表不能为空！！')
        }
        this._argv = argv

        let runner = new Promise((resolve, reject) => {
            let chain = Promise.resolve();

            // 检查node版本
            chain = chain.then(() => this.checkNodeVersion())
            // 初始化命令行参数
            chain = chain.then(() => this.initArgv())

            // 运行其他用户自定义的函数
            chain = chain.then(() => this.init())
            chain = chain.then(() => this.exec())

            // 监听异常
            chain.catch(err => {
                log.error(err.message)
            })
        })
    }
    // 检查node版本号
    checkNodeVersion() {
        // 获取当前版本号
        const currentNodeVersion = process.version
        // 获取最低版本号
        const lowestNodeVersion = LOWEST_NODE_VERSION
        // 如果当前版本号没有大于或等于最低版本号，则抛出异常
        if (!semver.gte(currentNodeVersion, lowestNodeVersion)) {
            throw new Error(colors.red(`xhlhq-cli 需要安装 v${lowestNodeVersion}以上版本的 node.js`))
        }
    }
    // 初始化命令行参数
    initArgv() {
        this._cmd = this._argv[this._argv.length - 1]
        this._argv = this._argv.slice(0, this._argv.length - 1)
        // console.log('cmd', this._cmd, this._argv)
    }


    init() {
        throw new Error('必须实现init')
    }

    exec() {
        throw new Error('必须实现exec')
    }
}

module.exports = Command;
