'use strict';

function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]'
}
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]'
}

module.exports = {
    isObject,
    isArray
};