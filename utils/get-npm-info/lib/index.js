'use strict';

const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

/**
 * 
 * @param {String} npmName 
 * @param {String} registry 
 * @returns {Object}
 */
function getNpmInfo(npmName, registry) {
    if(!npmName) {
        return null
    }
    const registryUrl = registry || getDefaultRegistry()
    const npmInfoUrl = urlJoin(registryUrl,npmName)
    // 调取接口获取package信息
    return axios.get(npmInfoUrl).then(res => {
        if(res.status === 200) {
            return res.data
        }else{
            return null
        }
    }).catch(err => {
        return Promise.reject(err)
    })
}
/**
 * 
 * @param {String} npmName 
 * @param {String} registry 
 * @returns {Array}
 */
// 获取所有版本号
async function getNpmVersion(npmName,registry) {
    const data = await getNpmInfo(npmName,registry)
    if(data){
        return Object.keys(data.versions)
    }else{
        return []
    }
}
/**
 * 获取所有满足条件的版本号
 * @param {String} baseVersion 
 * @param {String} versions 
 * @returns {Array}
 */
 function getNpmVersionSemver(baseVersion,versions) {
    const versionArr = versions.filter(v => semver.satisfies(v,`^${baseVersion}`)).sort((a,b) => semver.gt(b,a))
    return versionArr
}
/**
 * 获取最新的版本号
 * @param {String} npmName 
 * @param {String} baseVersion 
 * @param {String} registry 
 * @returns {String}
 */
async function getSemverVersion(npmName,baseVersion,registry) {
    const versions = await getNpmVersion(npmName,registry)
    const newVersion = getNpmVersionSemver(baseVersion,versions)
    if(newVersion && newVersion.length > 0) {
        return newVersion[0]
    }
    return null
}
/**
 * 
 * @param {String} isOriginal 
 * @returns {String}
 */
function getDefaultRegistry(isOriginal = false){
    return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}
module.exports = {
    getNpmInfo,
    getNpmVersion,
    getNpmVersionSemver,
    getSemverVersion,
    getDefaultRegistry
};