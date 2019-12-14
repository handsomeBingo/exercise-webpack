---
title: webpack掠影-6
date: 2019-12-09 21:46:00
tags: webpack
---

[webpack 掠影-代码](https://github.com/handsomeBingo/exercise-webpack "webpack 掠影")

## 1. resolve

resolve 是用来修改 webpack 的模块解析规则的，webpack 虽然提供了默认的模块解析规则，但是仍然可以进一步修改，关于模块解析的细节，请移步 [webpack 官方文档 Module Resolution](https://webpack.js.org/concepts/module-resolution/)；

### 1.1 resolve.alias

当你导入（import / require）一个路径层级较深的模块时，配置 alias 就是给这个比较深的路径映射一个短名（别名）；

+ 没有 alias 时

``` javascript
import 'bootstrap/dist/css/bootstrap.min.css'
```

+ 配置 alias

``` javascript
const path = require('path');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin'); // 抽离 css文件

const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩合并 css 文件
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin'); // 压缩混淆 js 文件

const webpack= require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  // entry: './src/index.js',
  mode: 'development',
  // mode: 'production',
  devtool: 'eval-source-map',
  entry: {
    home: './src/index.js',
    other: './src/other.js',
    x: './src/x.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js' // 配合多页面应用 [name] 表示文件名，  [hash:5] 生成文件名后跟随 5 位 hash 戳记
  },
  devServer: {
    // 开发服务器的配置
    contentBase: './dist', // 静态资源文件目录
    port: 8080, // 开发服务器启动的端口
    open: true, // 是否自动启动浏览器
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
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(jpeg|png|jpg|ttf|svg|woff(\d?)|eot)$/, // 导入 bootstrap 时需要处理字体
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
      template: './src/index.html',
      filename: "index.html",
      chunks: ['home']
    }),
    new HTMLWebpackPlugin({
      template: './src/other.html',
      filename: "other.html",
      chunks: ['other']
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
    ],
    splitChunks: { // 拆分代码 webpack4.x 以后用此功能代替之前的 CommonChunksPlugin
      cacheGroups: { // 缓存组
        common: {
          chunks: 'initial', // 标识哪些模块会被优化
          minSize: 0, // 打包后的代码超过该限制后的代码块会被提取成为公共模块，如果不超过该限制还是会打包到代码中，不会成为单独的模块
          minChunks: 2, // 代码块被会被提取成公共模块需要被引用的最小次数
        },
        vendors: { // 提取第三方代码
          priority: 1, // 优先级，优先提取第三方代码
          test: /node_modules/,
          chunks: 'initial',
          minSize: 0,
          minChunks: 2
        }
      }
    }
  },

+  // 模块解析规则
+  resolve: {
+    alias: {
+      bootstrapCss: 'bootstrap/dist/css/bootstrap.min.css'
+    }
+  },

  // 配置 externals
  externals: {
    vue: 'Vue' // import Vue from 'vue' 时，就会寻找 window.vue
  }
}

```

+ 修改引入方式

``` javascript
import 'bootstrapCss' // bootstrapCss 是上面 resolve.alias 配置的别名
```

### 1.2 resolve.extensions

我们开发时经常采用以下方式导入模块：

``` javascript
import {x, y} from 'sth/b' // 代表 b.js ，但是这里省略了 .js
```

但是在这里我们会发现报了一个错误：

![wbp-loader-css](http://47.105.181.88/cdn_assets/webpack-img/wbp6-no-alias.png)


这是为什么呢？为了在导入模块时省略模块的扩展名，我们需要配置一个模块的扩展名优先级顺序；

+ 修改配置文件

``` javascript
const path = require('path');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin'); // 抽离 css文件

const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩合并 css 文件
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin'); // 压缩混淆 js 文件

const webpack= require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  // entry: './src/index.js',
  // mode: 'development',
  mode: 'production',
  devtool: 'eval-source-map',
  entry: {
    home: './src/index.js',
    other: './src/other.js',
    x: './src/x.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js' // 配合多页面应用 [name] 表示文件名，  [hash:5] 生成文件名后跟随 5 位 hash 戳记
  },
  devServer: {
    // 开发服务器的配置
    contentBase: './dist', // 静态资源文件目录
    port: 8081, // 开发服务器启动的端口
    open: true, // 是否自动启动浏览器
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
        test: /\.(jpeg|png|jpg|ttf|woff(\d?)|eot|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 5 * 1024,
            outputPath: 'img/',
            name: '[name].[hash:5].[ext]',
            publicPath: '/img/' // 这个 publicPath 可以解决 css 文件中的图片使用相对路径引用时报错的问题，这是因为这个东西会在 图片的引用路径前面拼接这个 publicPath
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
      template: './src/index.html',
      filename: "index.html",
      trunks: ['home']
    }),
    new HTMLWebpackPlugin({
      template: './src/other.html',
      filename: "other.html",
      trunks: ['other']
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

  // 模块解析规则
  resolve: {
   alias: {
      bootstrapCss: 'bootstrap/dist/css/bootstrap.min.css'
    },
+    extensions: ['.js', '.css', '.json', '.vue']
  },

  // 配置 externals
  externals: {
    vue: 'Vue' // import Vue from 'vue' 时，就会寻找 window.vue
  }
}

```

这个 extensions 指定的数组是一个顺序，表示的是当导入模块不写扩展名的时候，会按照这个顺序去查找对应的文件。例如上面导入 sthjs/b webpack 在解析的时候，会首先从 sthjs 目录下按照 b.js 、b.css、b.json、b.vue 的顺序查找模块，如果找到一个，就停止查找；配置 extension 后注意文件不要重复命名，例如 x.js 和 x.json 这样可能会导致你的代码不会按照预期的方式工作；




### 1.3 resolve.modules

告诉 webpack 在解析模块的时候从哪些目录查找；它可以设置为一个相对路径或者是一个绝对路径，但是设置相对路径和相对路径的的表现略显不同；如果设置一个相对路径，那么 webpack 在解析模块的时候的行为就和 Node 在 node_modules 查找时的行为类似：首先在当前目录中检索，如果没有再去父级目录查找；如果是绝对路径，那么就会它只查找该指定的目录；

+ 修改配置文件

``` javascript
const path = require('path');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin'); // 抽离 css文件

const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩合并 css 文件
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin'); // 压缩混淆 js 文件

const webpack= require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  // entry: './src/index.js',
  // mode: 'development',
  mode: 'production',
  devtool: 'eval-source-map',
  entry: {
    home: './src/index.js',
    other: './src/other.js',
    x: './src/x.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js' // 配合多页面应用 [name] 表示文件名，  [hash:5] 生成文件名后跟随 5 位 hash 戳记
  },
  devServer: {
    // 开发服务器的配置
    contentBase: './dist', // 静态资源文件目录
    port: 8081, // 开发服务器启动的端口
    open: true, // 是否自动启动浏览器
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
        test: /\.(jpeg|png|jpg|ttf|woff(\d?)|eot|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 5 * 1024,
            outputPath: 'img/',
            name: '[name].[hash:5].[ext]',
            publicPath: '/img/' // 这个 publicPath 可以解决 css 文件中的图片使用相对路径引用时报错的问题，这是因为这个东西会在 图片的引用路径前面拼接这个 publicPath
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
      template: './src/index.html',
      filename: "index.html",
      trunks: ['home']
    }),
    new HTMLWebpackPlugin({
      template: './src/other.html',
      filename: "other.html",
      trunks: ['other']
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

  // 模块解析规则
  resolve: {
    alias: {
      bootstrapCss: 'bootstrap/dist/css/bootstrap.min.css'
    },
    extensions: ['.js', '.css', '.json', '.vue'],
+    modules: [path.resolve('node_modules')] // 设置 webpack 从当前目录下的 node_modules 查找
  },

  // 配置 externals
  externals: {
    vue: 'Vue' // import Vue from 'vue' 时，就会寻找 window.vue
  }
}
```

## 2 HMR （hot-module-replacement）

在开发中程序运行中添加、修改、删除模块，而不会刷新页面，可以快速提升开发效率；如果以在开发一个单页面应用且页面中有很多的状态，如果页面刷新后，所有的状态全部丢失。但是 HMR 可以解决你这个痛苦，它会把被修改的部分替换掉，没有修改的部分就不会收到影响，如此一来节省宝贵的开发时间；

### 使用 HMR

1. 在 devServer 中启用 HMR，设置 hot: true

``` javascript
module.exports = {
  ...,
  devServer: {
+    hot: true
  },
  ....
}
```

2. 在 plugins 中配置 webpack.HotModuleReplacementPlugin()

``` javascript
module.exports = {
  ...,
  plugins: [
+    new webpack.HotModuleReplacementPlugin(),
    ...
  ]
  ....
}
```

3. 在代码中需要订增加判断并订阅模块的更新

+ 在 index.js 增加如下代码
``` javascript
async function renderX(e) {
  let p = await import('./test-hmr')
  console.log(p)
  let getP = document.getElementById('px1');
  if (getP) return getP.innerText = p.p;
  let newP = document.createElement('p');
  newP.innerText = p.p;
  newP.id = 'px1';
  document.body.appendChild(newP);
}
renderX();

// 如果开启 HMR module.hot 为 true
if (module.hot) {
  // hot.accept() 第一个参数表示要订阅模块的变更，第二个参数是回调，模块更新时会调用该回调
  module.hot.accept('./test-hmr', renderX)
}
```

+ 在 src 目录下增加 test-hmr.js

``` javascript
export const p = '1234446666'
```

接着我们修改 test-hmr.js 中的内容，我们会发现页面中的 p 标签的内容自动被更新；

+ 完整配置文件

``` javascript

```

## 3. webpack-merge 合并 webpack 打包文件

在日常开发的过程中，开发环境的打包配置往往和生产环境的打包有许多不同点，如果总是修改同一份配置文件开发体验一定会很差。所以一般常见的的解决方案都是有多份配置文件，例如 dev（开发）、qa（测试）、prod（生产）;这些配置文件你可以写多份不同的，也可以有一份基础的，然后针对具体的环境做出具体的配置；在这里我们会用到一个 webpack-merge 的 smart 功能，这个功能可以合并配置文件，产出合并后的配置对象；

### 3.1 安装 webpack-merge

``` shell
yarn add webpack-merge -D
```

### 3.2 在根目录下新建 config 文件夹，拆分配置文件

将文件中的基础配置抽离成 webpack.base.config.js，但是注意 devServer.contentBase 和 output.path 修改为 ../dist 这是因为 __dirname 发生了改变；

``` javascript
const path = require('path');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin'); // 抽离 css文件

const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩合并 css 文件
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin'); // 压缩混淆 js 文件

const webpack= require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  devtool: 'eval-source-map',
  entry: {
    home: './src/index.js',
    other: './src/other.js',
    x: './src/x.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].[hash].js' // 配合多页面应用 [name] 表示文件名，  [hash:5] 生成文件名后跟随 5 位 hash 戳记
  },
  devServer: {
    // 开发服务器的配置
    hot: true, // 启用 HMR
    contentBase: '../dist', // 静态资源文件目录
    port: 8081, // 开发服务器启动的端口
    open: true, // 是否自动启动浏览器
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
        test: /\.(jpeg|png|jpg|ttf|woff(\d?)|eot|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 5 * 1024,
            outputPath: 'img/',
            name: '[name].[hash:5].[ext]',
            publicPath: '/img/' // 这个 publicPath 可以解决 css 文件中的图片使用相对路径引用时报错的问题，这是因为这个东西会在 图片的引用路径前面拼接这个 publicPath
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
      template: './src/index.html',
      filename: "index.html",
      trunks: ['home']
    }),
    new HTMLWebpackPlugin({
      template: './src/other.html',
      filename: "other.html",
      trunks: ['other']
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

  // 模块解析规则
  resolve: {
    alias: {
      bootstrapCss: 'bootstrap/dist/css/bootstrap.min.css'
    },
    extensions: ['.js', '.css', '.json', '.vue'],
    modules: [path.resolve('node_modules')] // 设置 webpack 从当前目录下的 node_modules 查找
  },

  // 配置 externals
  externals: {
    vue: 'Vue' // import Vue from 'vue' 时，就会寻找 window.vue
  }
}
```

### 3.2 在 config 目录下新建 webpack.dev.config.js

``` javascript
let webpackMerge = require('webpack-merge');
let base= require('./webpack.base.config');

// 使用 webpackMerge 的 smart 方法合并配置文件
module.exports = webpackMerge.smart(base, {
  mode: 'development' // 导出的配置文件中的 mode 就是 development
})

```

### 3.3 在 config 目录下新建 webpack.prod.config.js

``` javascript
let webpackMerge = require('webpack-merge');
let base= require('./webpack.base.config');
module.exports = webpackMerge.smart(base, {
  mode: 'production'
})
```

### 3.4 修改 package.json

前面我们自定义了配置文件，还记得之前我们在 package.json 中配置了 dev 和 build 两个 script 吗？此时我们希望执行 dev 脚本时按照 config/webpack.dev.config.js 进行打包，而执行 build 时按照 config/webpack.prod.config.js 的配置打包，就需要在对应的名字后指定配置文件（webpack 打包时默认的配置文件名叫做 webpack.config.js)

``` json
{
  "name": "test",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
+    "dev": "webpack-dev-server --config ./config/webpack.dev.config.js",
+    "build": "webpack --config ./config/webpack.prod.config.js"
  },
  "devDependencies": {
    ...
  },
  "dependencies": {
    ...
  }
}

```




+ 效果如图
![wbp-loader-css](http://47.105.181.88/cdn_assets/webpack-img/wbp6-no-alias.png)
