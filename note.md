## 1. 安装 webpack、webpack-cli

## 2. wepback 零配置


## 3. 手动配置 webpack

## 4. npx 可以执行 全局或者本地的 node.js 命令

## 5. webpack --config config-file 指定 webpack 启动时加载的配置文件

## 6. webpack-dev-server

## 7. 配置 html-webpack-plugin 复制、压缩、HASH、删除空行、删除双引号

## 8. 配置 style-loader css-loader less-loader 解析 CSS

## 9. 配置 mini-css-extract-plugin 抽离 CSS 文件的插件
    9.1 配置 plugin
    9.2 修改 CSS 的 loader 配置为 MiniCSSExtratPlugin.loader
    9.3 postcss-loader 在配置 autoprefixer 之前处理 CSS，还要给 postcss 配置 postcss.config.js 在其中导出一个对象，对象配置使用 autoprefixer 插件


## 10. 配置优化项: 配置 optimization 项
    10.1 optimize-css-assets-webpack-plugin 插件 优化压缩 CSS 文件，将抽离出来的 CSS 文件压缩称为一行；不过使用这一个插件后，默认 JS 文件不再压缩了，所以还需要单独配置 uglifyjs-webpack-plugin

## 11. babel 配置：
    11.1 安装 babel-loader、@babel/core、@babel/preset-env
    11.2 在配置 loader 时配置预设：presets: ['@babel/preset-env']
    11.3 如果要使用更高级的语法如 class-properties 需要安装 @babel/plugin-proposal-class-properties；使用装饰器：@babel/plugin-proposal-decorators；并且在 babel 的 plugins 数组中增加两项，并且装饰器要放在 class-properties 前面
    11.4 async/await 、generator 函数有问题， 需要配置 @babel/plugin-transform-runtime

## 12. 配置 ESLint
    12.1 安装 eslint-loader，并且在 modules 中配置该 loader，在该 loader 的 options 中增加 enforce 的属性，值 为 pre 表示在 某个 loader 之前进行语法检查

## 13. 暴露全局变量的 loader
    loader 分为：pre 前置 loader；normal 普通 loader；post 后置 loader；内联 loader

    13.1 通过 expose-loader 可以把 jq 等暴露到全局上去；内联的写法：import $ from 'expose-loader?$!jquery'; 或者在 modules 处配置
    13.2 使用 webpack 的 ProvidePlugin；是相当于在每个模块中注入 jquery
    13.3 配置 externals 把通用库放在 CDN 上；然后，打包的时候不会把这些库打进去; 丝毫不影响 import 和 前面的 webpack.ProvidePlugin 的注入

## 14. webpack 使用图片：
    14.1 在 js 中动态创建图片：结合import 或者 require 都可以使用 file-loader 实现
    14.2 import 图片
    14.3 html 中的图片：需要这 html-withimg-loader
    14.4 css 中的图片： css-loader 会处理成 require(图片路径)
    14.5 url-loader 是个好东西，可以把设置小于某个值的图片或者文件打包成 base64，如果超过这个值自动输出为文件；不过不能和 file-loader 一起处理相同的文件；

## 15. 设置文件输出的目录：
    15.1 设置图片的输出目录是在 url-loader options 设置 outputPath；css 文件是在压缩 CSS 插件的 filename 中设置前面有路径名；
    15.2 在 output 选项中设置 publicPath 配置 CDN 域名，会为所有引用资源的 url 前面添加上公共域名

## 16.
