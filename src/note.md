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

## 16. 多入口打包

## 17. sourceMap

## 18. watch

## 19. 内置插件：clean/copyWebpack/bannerPlugin

## 20. 配置跨域

## 21. wepback-dev-middle node.js 手动启动 webpack

## 22. resolve
    22.1 配置 node_modules 的查找范围
    22.2 配置 alias 短路径，方便书写
    23.3 extension 配置，方便引用书写

## 23. webpack.definePlugin() 定义环境变量

## 24. webpack-merge 智能合并，区分开发或者生产环境的配置文件

## 25. 启用 HMR
    25.1 在 devServer 中配置 hot: true
    25.2 在 plugins 中加入一个 new Webpack.HotModuleReplacementPlugin()
    25.3 在需要热更新的模块中加入判断 if (module.hot) {module.hot.accept([依赖], 依赖更新后的 callback)}

## 26. webpack 的优化
    26.1 在 module 中配置 noParse 来取消对某些模块的依赖
    26.2 在 plugins 中配置 webpack.IgnorePlugin(/被忽略的包/, /依赖包（前面的是该依赖的子依赖）/)

## 27. 动态链接库（dllPlugin）: 把一些第三方的库，单独打包起来
    例如我们使用 react、reactDOM，我们可以把其单独打包，等开发的时候直接使用打包后的文件，一旦文件变更，就不需要打包 webpack 了;
    27.1 首先配置一个打包文件，去把第三方的库打成动态链接库，当然还要写一个 webpack 的配置文件，在 plugins 中使用 webpack.DllPlugin；output 中配置 library、libraryTarget 等值；使用这个插件会单独打包成一个包和一个 manifest.json 文件，这个 json 是个对照表；
    27.2 在模板中手动引入第一步打出来的动态链接库的 js 文件；
    27.3 在主打包文件中使用动态链接库：需要使用 webpack.DllReferencePlugin({manifest: path.resolve(__dirname, 'dist', 'manifest')})；完成以上步骤后，会发现，如果我们 import 第三方的库，它回去动态链接库中查找，找到就不会打包了；

## 28. happypack 多线程打包
    28.1 安装 happypack 模块，并导入
    28.2 修改 module 中相关 loader 的配置，改为 happypack/loader?id=someFileId 这个 someFileId 下面会用
    28.3 在 plugins 中增加 happypack 实例，例如 new Happypack({id: 上面的 someFileId, use: [对应文件类型的 loader 及配置]})

## 29. webpack 自带的优化功能（自动的）
    29.1 tree-shaking 使用 import 在生产环境下 会自动去除掉没有用的代码；tree-shaking 把没有用到的代码移除掉，只支持 import 语法
    29.2 scope-hosting 在 webpack 会自动简化一些代码

## 30. 抽离公共代码：设置 optimization 中
    30.1 使用 splitChunks
    30.2 使用 vendor

## 31. 懒加载 import() 语法

## 32. HMR
    32.1 在 devServer 配置 hot true
    32.2 在 plugins 配置 webpack.HotModuleReplacementPlugin()
    32.3 在需要热更新的地方增加判断：if (module.hot) {module.hot.accept([...modules], afterUpdateCallback)}

