---
title: webpack掠影-4
date: 2019-12-09 23:23:45
tags: webpack
---

[webpack 掠影-代码](https://github.com/handsomeBingo/exercise-webpack "webpack 掠影")

前面我们练习 webpack 中暴露全局变量和 webpack 内置插件的使用；今天我们练习多页面应用的配置和 sourceMap；

## 1. sourceMap

为了提升代码的性能，我们开启了 webpack 压缩混淆代码的功能，但是如果代码运行时报错，压缩混淆后的代码十分不利于调试，为了解决这个问题，我们需要一个叫做 sourceMap 的机制。sourceMap 是浏览器的一种功能，可以根据 sourceMap 配置将压缩混淆后的代码虚拟还原成源码的样子。webpack 内置了相关配置，我们在打包时通过配置 devtool 选项来开启 sourceMap；sourceMap 有如下可选值：

+ source-map ，生成 source-map 并且是全码映射，单独输出 .map 文件
+ eval-source-map 生成带有行和列策映射，但是不会产生单独的 source-map 文件
+ cheap-module-source-map 生成的 source-map 不带有行和列，产出单独 .map 文件
+ cheap-module-eval-source-map 生成 source-map，不带有行和列，不输出 .map 文件

值得一提的是，上面的顺序是按照详细程度降序排列的，越靠后表示详细程度越低。靠前的虽然详细程度很高，但是会拖慢打包的速度，一般用 eval-source-map；但是具体情况还要视情况而定，如果你的项目中需要 source-map 文件，如使用 sentry 等错误监控系统，那么就需要配置产出文件的方式；

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
  entry: './src/index.js',
  // mode: 'development',
  mode: 'production',
+  devtool: "eval-source-map", // source-map
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

```

+ 效果如图
![wbp-loader-css](http://47.105.181.88/cdn_assets/webpack-img/wbp5-source-map.png)

## 2. webpack 配置多页面应用

之前我们的示例中都是以时下很流行的单页面应用配置的，但是有很多情况下我们会遇到多页面应用，webpack 同样支持多页面应用的处理；多页面涉及到几个问题：

+ 多入口，js 文件的入口不再是一个 js 文件；
+ 多出口，多个页面依赖不同的 js 文件，所以对应需要输出多个 js 文件
+ 公用模块分离问题，项目中多个页面可能依赖相同的模块，这些模块并不需要打包多次

### 1. 多入口问题和多出口的问题

解决多入口，我们需要在 webpack 的 entry 配置一个对象；解决多出口问题，需要修改 output 配置项，之前 output 的输出的 filename 是一个固定的 bundle.js ；但是多页面应用，的名字应该由的它的入口文件决定，所以不能写死成一个固定字符串；
最后，每个页面还需要引入特定的 js 文件，这个同样也不能混乱，例如打包区 index.html 引入的是 index.js，other.html 引入的是 other.js，那么打包后还要维持这种引入的关系，所以此时我们需要修改 HTMLWebpackPlugin 的配置了，此时 HTMLWebpackPlugin 的实例就不再试一个了，而是每个页面一个，并且在每个实例的配置中加入 chunks 配置字段，标识当前 HTML 文件需要的代码块是哪些。配置这些内容后，在 webpack 打包后，会自动将原来属于这个页面的 js 代码块插入到页面中，这样我们就初步实现了一个多页面应用程序的配置；

+ 修改 webpack 配置文件

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
+    // 为每个 HTML 文件设置一个 html-webpack-plugin 实例，chunks 属性是当前页面需要引入的 js 文件，如果有多个，就在数组中设置多项
+    new HTMLWebpackPlugin({
+      template: './src/index.html',
+      filename: "index.html",
+      chunks: ['home']
+    }),
+    new HTMLWebpackPlugin({
+      template: './src/other.html',
+      filename: "other.html",
+      chunks: ['other']
+    }),
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
```

经过上面配置后，即可实现一个多页面应用的打包；此时，如果 index.js 和 other.js 同时都依赖于 x.js 这个模块，打包后我们会发现 x 这个模块既被 index.js 打包了进去，又被 other.js 打包了进去；如果这个模块被更多的模块依赖，那么将会被更多次打包，这样一来就会增大代码的体积；为了解决这个问题，我们需要配置提取公共模块；

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
+    splitChunks: { // 拆分代码 webpack4.x 以后用此功能代替之前的 CommonChunksPlugin
+      cacheGroups: { // 缓存组
+        common: {
+          chunks: 'initial', // 标识哪些模块会被优化
+          minSize: 0, // 打包后的代码超过该限制后的代码块会被提取成为公共模块，如果不超过该限制还是会打包到代码中，不会成为单独的模块
+          minChunks: 2, // 代码块被会被提取成公共模块需要被引用的最小次数
+        },
+        vendors: { // 提取第三方代码
+          priority: 1, // 优先级，优先提取第三方代码
+          test: /node_modules/,
+          chunks: 'initial',
+          minSize: 0,
+          minChunks: 2
+        }
+      }
+    }
  },

  // 配置 externals
  externals: {
    vue: 'Vue' // import Vue from 'vue' 时，就会寻找 window.vue
  }
}

```

经过上面的配置后，我们再次执行打包的命令，再次检查打包输出的文件，我们发现会多出一个文件，文件名字中有 ~ 字符，这个文件就是提取出来的公共模块，包括这个 ~ 都是可以配置的。

