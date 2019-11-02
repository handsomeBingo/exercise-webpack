let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin'); // 自动把打包后的 js 引入到 html 中，并且把模板复制到某个目录

let MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 抽离 CSS 文件

let OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin'); // 优化 css

let UglifyJSWebpackPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
  mode: 'production', // production 生产 development 打包模式
  entry: './src/index.js', // 入口
  output: {
    filename: 'bundle.[hash:8].js', // 打包后的文件名， 可以指定 HASH
    path: path.resolve(__dirname, 'build') // 打包后的文件路径，路径必须是一个绝对路径
  },
  devServer: {
    // 开发服务器配置
    contentBase: './build', // 静态资源服务启动的目录
    port: 3000,
    open: true,
    progress: true
  },
  module: {
    rules: [
      {
        test: /\.(css|less)$/, // 规则
        // css-loader 解决 css 中的 @import 语法
        // style-loader 把 css 插入 head 标签中
        // loader 可以接受一个字符串，多个写一个数组，还可以写对象进行配置
        // loader 默认从右向左解析
        // 还可以解析 less
        use: [
        /*  {
            loader: 'style-loader',
            options: {
              insert: 'head',
              // injectType: 'linkTag' 处理成 link标签，不过要提取单独的 CSS 文件
            }
          },*/
          MiniCssExtractPlugin.loader, // 如果 less 和 css 分开处理的，这个 loader 也要改多次
          'css-loader',
          'postcss-loader',
          'less-loader' // 处理 less
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true, // 给引入的 js 文件加 hash
      template: './src/index.html',
      filename: 'index.html', // 复制出来的 HTML 文件名字
      minify: { // 压缩复制出来的 HTML 文件
        removeAttributeQuotes: true, // 删除属性的双引号
        collapseWhitespace: true // 删除空行
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'main.css'
    })
  ],

  // 配置优化项
  optimization: {
    minimizer: [
      new OptimizeCSSPlugin(), // 压缩 CSS 的插件，配置该插件后就需要配置如下的 UglifyjsWebpackPlugin 否则 js 不压缩
      new UglifyJSWebpackPlugin({
        cache: true, // 是否缓存
        parallel: true, // 并发打包
        sourceMap: true // 是否开启 sourceMap
      })
    ]
  }
}
