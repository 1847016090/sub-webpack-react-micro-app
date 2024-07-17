// webpack.dev.js
const path = require('path')
// webpack.dev.js
// 现在开发模式下修改css和less文件，页面样式可以在不刷新浏览器的情况实时生效，因为此时样式都在style标签里面，
// style-loader做了替换样式的热替换功能。但是修改App.tsx,浏览器会自动刷新后再显示修改后的内容,
// 但我们想要的不是刷新浏览器,而是在不需要刷新浏览器的前提下模块热更新,并且能够保留react组件的状态。
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

// 合并配置
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.js')

// 合并公共配置,并添加开发环境配置
module.exports = merge(baseConfig, {
  mode: 'development', // 开发模式,打包更加快速,省了代码优化步骤
  // 本地开发首次打包慢点没关系,因为 eval 缓存的原因, 热更新会很快
  // 开发中,我们每行代码不会写的太长,只需要定位到行就行,所以加上 cheap
  // 我们希望能够找到源代码的错误,而不是打包后的,所以需要加上 module
  devtool: 'eval-cheap-module-source-map', // 源码调试模式,后面会讲
  devServer: {
    port: 8000, // 服务端口号
    compress: false, // gzip压缩,开发环境不开启,提升热更新速度
    hot: true, // 开启热更新，后面会讲react模块热替换具体配置
    historyApiFallback: true, // 解决history路由404问题
    static: {
      directory: path.join(__dirname, '../public') //托管静态资源public文件夹
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },

  plugins: [
    new ReactRefreshWebpackPlugin() // 添加热更新插件
  ]
})
