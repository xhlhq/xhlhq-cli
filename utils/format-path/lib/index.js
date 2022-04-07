'use strict';
// lerna publish
const path = require('path')

function formatPath(p) {
    if(p && typeof p === 'string') {
        // 分割符，在mac上是 / ,在window上是 \
        const sep = path.sep;
        if(sep === '/'){
            return p;
        }else{
            return p.replace(/\\/g,'/');
        }
    }
    return p
}

module.exports = formatPath;
