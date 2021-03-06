const path = require('path');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin'); // 抽离 css文件

const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩合并 css 文件
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin'); // 压缩混淆 js 文件

const webpack= require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  entry: './src/index.js',
  // mode: 'development',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    // 开发服务器的配置
    contentBase: './dist', // 静态资源文件目录
    port: 3000, // 开发服务器启动的端口
    // open: true, // 是否自动启动浏览器
    progress: true, // 进度条
    proxy: { // 配置代理
      '/api': { // 将带有 /api 的请求，转发值 target 指向的域名
        target: 'http://domain.com/somet/api',
        changeOrigin: true,
        secure: false
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              ['@babel/plugin-proposal-decorators', { legacy: true }], // 使用装饰器
              ['@babel/plugin-proposal-class-properties', { loose: true }], // 使用 class-properties
              ['@babel/plugin-transform-runtime'] // 使用 async/await/generator
            ]
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCSSExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCSSExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      },
      {
        test: /\.(jpeg|png|jpg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 5 * 1024,
            outputPath: '/img/'
          }
        }
      },
      {
        test: /\.(htm|html)$/,
        use:  'html-withimg-loader' // 处理 html 中的 img 引用的图片
      },
      {
        test: require.resolve('jquery'),
        use: 'expose-loader?$' // 等效的内联 import $ from 'expose-loader?$!jquery'; ?$!jquery 是传递给 expose-loader 的参数
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './src/index.html', // 需要引入输出文件的 html 文件模板
      hash: true, // 给引入的 js 加hash
      filename: 'index.html', // 输出的 html 文件的名字（插件会把模板 html 复制到输出目录中）
      minify: { // 压缩优化输出的 html 文件配置
        removeAttributeQuotes: true, // 删除行内属性的双引号
        collapseWhitespace: true // 删除换行，使内容保持在一行
      }
    }),
    // 抽离 css 文件
    new MiniCSSExtractPlugin({
      filename: 'css/main.[hash:5].css'
    }),

    // 注入模块: key 是模块中可以访问的变量，value 是对应的模块
    new webpack.ProvidePlugin({
      $1: 'jquery',
      _: 'lodash'
    }),

    // 定义数据
    new webpack.DefinePlugin({
      // 在这个对象中 key 将来会变成一个变量，value 就是 js 代码表达式
      DEV: JSON.stringify('dev')
    }),

    // 清空打包的内容
    new CleanWebpackPlugin(),

    // 复制文件内容: 接收一个数组，数组项是对象，对象中的 from 表示被复制的目录或者文件，to 表示输出的目录
    new CopyWebpackPlugin([
      {
        from: './src/doc',
        to: path.resolve(__dirname, './dist/doc')
      }
    ]),

    // 在打包后的代码中输出必要信息
    new webpack.BannerPlugin('发上等愿，结中等缘，享下等福；择高处立，寻平处住，想宽处行')
  ],

  // 配置优化配置项
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsWebpackPlugin(), // 压缩 CSS 文件，配置该插件后需要配置如下的 UglifyjsWebpackPlugin
      new UglifyjsWebpackPlugin({
        cache: true, // 是否缓存
        parallel: true, // 是否并发打包
        sourceMap: true // 是否开启 sourceMap
      })
    ]
  },

  // 配置 externals
  externals: {
    vue: 'Vue' // import Vue from 'vue' 时，就会寻找 window.vue
  }
}
