let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin'); // 自动把打包后的 js 引入到 html 中，并且把模板复制到某个目录

let MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 抽离 CSS 文件

let OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin'); // 优化 css

let UglifyJSWebpackPlugin = require('uglifyjs-webpack-plugin');

let  { ProvidePlugin } = require('webpack')
module.exports = {
  mode: 'production', // production 生产 development 打包模式
  entry: './src/index.js', // 入口
  output: {
    filename: 'bundle.[hash:8].js', // 打包后的文件名， 可以指定 HASH
    path: path.resolve(__dirname, 'build'), // 打包后的文件路径，路径必须是一个绝对路径
    publicPath: 'https://www.dahai.com/'
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
    /*  {
        test: /\.js$/,
        use: {
          loader: 'eslint-loader',
          options: {
            enforce: 'pre' // 强制 previous 在 babel 之前执行；post 表示在某个 loader 之后执行
          }
        },
        exclude: /node_modulse/
      },*/
      {
        test: require.resolve('jquery'),
        use: 'expose-loader?$' // 等效的内联 import $ from 'expose-loader?$!jquery'
      },
      // {
      //   test: /\.(jpeg|png|jpg)$/,
      //   use: 'file-loader'
      // },
      {
        test: /\.(jpeg|png|jpg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 200 * 1024,
            outputPath: 'img/', // 图片输出到的目录
            publicPath: 'https://www.dahai.com/' // 给图片设置单独的 CDN 路径
          }
        }
      },
      {
        test: /\.html$/,
        use: 'html-withimg-loader' // 处理 html 中的 img 引用的图片
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              // 配置 presets 预设
              presets: ['@babel/preset-env'],
              plugins: [
                ["@babel/plugin-proposal-decorators",  { 'legacy': true }], // 使用装饰器
                ["@babel/plugin-proposal-class-properties", { "loose": true }], // 使用 class-properties；并且这个应该在后面
                ["@babel/plugin-transform-runtime"], // 使用 generator 函数和 async/await 语法时需要使用配置转换 runtime ；还可以让在使用 @babel/polyfill 中的诸如 includes 等实例方法时，babel 自己实现一份，更加安全
              ]
            }
          }
        ],
        exclude: /node_modules/
      },
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
      // filename: 'main.css' // 这个 filename 可以在前面写上路径 如 'css/main.css'
      filename: 'css/main.css' // 这个 filename 可以在前面写上路径 如 'css/main.css'
    }),
    new ProvidePlugin({ // webpack.ProvidePlugin 是向每个模块中注入 $ 作为 jq，以后就不用 import 了
      $: 'jquery'
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
  },
  externals: {
    jquery: 'jQuery' // 使用 import 的时候就是使用全局变量 window.jQuery
  }
}
