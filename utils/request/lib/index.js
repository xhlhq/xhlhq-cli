'use strict';
// lerna publish
const axios = require('axios')
const BASE_URL = process.env.XHLHQ_CLI_BASE_URL || 'http://localhost:3003'

const request = axios.create({
    baseURL: BASE_URL,
    timeout: 5000
})

// 添加请求拦截器
request.interceptors.request.use((config) => {
    // 在发送请求之前做些什么
    return config;
}, (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
request.interceptors.response.use((response) => {
    // 对响应数据做点什么
    if(response.status === 200) {
        return response.data
    }
    return response.data;
}, (error) => {
    // 对响应错误做点什么
    return Promise.reject(error);
});

module.exports = request;
