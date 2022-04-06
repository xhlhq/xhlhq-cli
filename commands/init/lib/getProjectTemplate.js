const request = require('@xhlhq-cli/request')

module.exports = function() {
  return request({
    url: '/api/template'
  })
}