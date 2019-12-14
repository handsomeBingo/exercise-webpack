let webpackMerge = require('webpack-merge');
let base= require('./webpack.base.config');
module.exports = webpackMerge.smart(base, {
  mode: 'production'
})
