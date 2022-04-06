'use strict';

const fs = require('fs')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const semver = require('semver')

const Command = require('@xhlhq-cli/command')
const log = require('@xhlhq-cli/log')

const getProjectTemplate = require('./getProjectTemplate')

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || null
        this.force = !!this._argv[1].force;
        log.verbose('projectName', this.projectName)
        log.verbose('force', this.force)
    }
    async exec() {
        try {
            // 1. 准备阶段
            const projectInfo = await this.prepare()
            if (projectInfo) {
                log.verbose('projectInfo', projectInfo)
                this.projectInfo = projectInfo
                // 2. 下载模板
                this.downloadTemplate()
                // 3. 安装模板
            }
        } catch (error) {
            log.error(error.message)
        }
    }
    // 前置准备工作
    async prepare() {
        // 判断项目模板是否存在
        const template = await getProjectTemplate()
        console.log('template',template)
        if(!template.list || template.list.length === 0) {
            throw new Error('项目模板不存在')
        }
        this.template = template.list
        // 当前文件目录路径
        const localPath = process.cwd();
        // 1. 判断当前目录是否为空
        if (!this.ifCwdEmpty(localPath)) {
            let ifContinue = false;
            if (!this.force) {
                // 目录不为空，询问用户是否继续创建
                ifContinue = (await inquirer.prompt({
                    type: 'confirm',
                    name: 'ifContinue',
                    message: '当前文件夹不为空，是否继续创建项目？'
                })).ifContinue;
                if (!ifContinue) {
                    return;
                }
            }
            // 2. 是否自动强制更新
            if (ifContinue || this.force) {
                // 二次确认是否清空文件夹
                const { confirmDelete } = await inquirer.prompt({
                    type: 'confirm',
                    name: 'confirmDelete',
                    default: false,
                    message: '请再次确认是否清空当前文件夹？'
                })
                if (confirmDelete) {
                    // 清空文件夹
                    fse.emptyDirSync(localPath);
                }
            }
        }
        // 3. 选择创建项目或组件
        // 4. 获取项目的基本信息
        return this.getProjectInfo()
    }
    // 下载项目模板
    downloadTemplate() {
        console.log('projectInfo',this.projectInfo,'template',this.template)
        // 1 通过项目模板api获取项目模板信息
        // 1.1 通过egg.js搭建一套后端系统
        // 1.2 通过npm存储项目模板
        // 1.3 将项目模板信息存储到mongodb中
        // 1.4 通过egg.js获取mongodb中的数据并返回
    }
    // 判断当前文件夹是否为空
    ifCwdEmpty(localPath) {
        // 获取当前目录下的文件
        let fileList = fs.readdirSync(localPath);
        fileList = fileList.filter(file => {
            return !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
        })
        return !fileList || fileList.length <= 0
    }
    async getProjectInfo() {
        let projectInfo = {};
        // 3. 选择创建项目或组件
        const { type } = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: '请选择初始化类型',
            default: TYPE_PROJECT,
            choices: [
                {
                    name: '项目',
                    value: TYPE_PROJECT
                },
                {
                    name: '组件',
                    value: TYPE_COMPONENT
                }
            ]
        })
        if (type === TYPE_PROJECT) {
            // 获取项目的基本信息
            const info = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'projectName',
                    message: '请输入项目名称',
                    default: '',
                    validate: function (v) {
                        //1.首字符必须为英文字符
                        //2. 尾字符必须为数字或英文
                        //3. 字符仅允许以（-_）连接
                        // Declare function as asynchronous, and save the done callback
                        const done = this.async();

                        // Do async stuff
                        setTimeout(function () {
                            if (!(/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v))) {
                                // Pass the return value in the done callback
                                done('请输入合法的项目名称');
                                return;
                            }
                            // Pass the return value in the done callback
                            done(null, true);
                        }, 0);
                        // return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v);
                    },
                    filter: function (v) {
                        return v;
                    }
                },
                {
                    type: 'input',
                    name: 'projectVersion',
                    message: '请输入项目版本号',
                    default: '1.0.0',
                    validate: function (v) {
                        const done = this.async();
                        setTimeout(function () {
                            if (!semver.valid(v)) {
                                done('请输入合法的版本名称');
                                return;
                            }
                            done(null, true);
                        }, 0);
                        // return !!semver.valid(v);
                    },
                    filter: function (v) {
                        if (!!semver.valid(v)) {
                            return semver.valid(v);
                        } else {
                            return v
                        }
                    }
                }
            ])
            projectInfo = {
                type,
                ...info
            }
        } else if (type === TYPE_COMPONENT) {

        }

        // 4. 获取项目的基本信息
        return projectInfo
    }
}


function init(argv) {
    // TODO
    // console.log('projectName:',projectName,'Options:',Options,'cmdObj:',cmdObj)
    return new InitCommand(argv)
}


module.exports = init;
module.exports.InitCommand = InitCommand;