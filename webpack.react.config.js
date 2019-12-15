let path = require('path');
let webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    react: ['react', 'react-dom']
  },
  output: {
    filename: '__dll_xx.js', // 产生的 js 文件名
    path: path.resolve(__dirname, 'dist'),
    library: '__dll_xx', // 和下面的 libraryTarget 配合使用；把文件打成一个库，这个字段的值将会成为一个变量，这个变量代表的是上面 entry 的导出内容；可以修改，同样支持 [name] 的方式
    libraryTarget: 'var' // 和上面的 library 配合生效；表示用什么方式把 entry 导出的内容赋值给变量，默认值是 var
    // 所以 library 和 libraryTarget 设置的结论就是: var __dll_xx = react+react-dom 导出的内容;
  },
  plugins: [
    new webpack.DllPlugin({
      name: '__dll_xx',
      path: path.resolve(__dirname, 'dist', 'manifest.json')
    })
  ]
}
