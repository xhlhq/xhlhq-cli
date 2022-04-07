'use strict';
// lerna publish
const log = require('npmlog')

//定义前缀
log.heading = 'xhlhq'
log.headingStyle = {fg: 'blue', bg: 'black'}

// log.level 小于该值的log不会展示出来
// 可用于debug
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'
// 定制log样式
log.addLevel('sucess', 2000, {fg: 'green', bold: true})

module.exports = log;
