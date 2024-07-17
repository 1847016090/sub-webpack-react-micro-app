// webpack.prod.js
const path = require("path");
const { merge } = require("webpack-merge");
const CopyPlugin = require("copy-webpack-plugin");
const baseConfig = require("./webpack.base.js");
// 在开发环境我们希望css嵌入在style标签里面,方便样式热替换,但打包时我们希望把css单独抽离出来,方便配置缓存策略
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 上面配置了打包时把css抽离为单独css文件的配置,打开打包后的文件查看,可以看到默认css是没有压缩的,需要手动配置一下压缩css的插件。
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// 设置mode为production时,webpack会使用内置插件terser-webpack-plugin压缩js文件,该插件默认支持多线程压缩,
// 但是上面配置optimization.minimizer压缩css后,js压缩就失效了,需要手动再添加一下,
// webpack内部安装了该插件,由于pnpm解决了幽灵依赖问题,如果用的pnpm的话,需要手动再安装一下依赖
const TerserPlugin = require("terser-webpack-plugin");

// s中会有未使用到的代码,css中也会有未被页面使用到的样式,可以通过purgecss-webpack-plugin插件打包的时候移除未使用到的css样式,
// 这个插件是和mini-css-extract-plugin插件配合使用的,在上面已经安装过,还需要glob-all来选择要检测哪些文件里面的类名和id还有标签名称
const globAll = require("glob-all");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");

// 前端代码在浏览器运行,需要从服务器把html,css,js资源下载执行,下载的资源体积越小,页面加载速度就会越快。
// 一般会采用gzip压缩,现在大部分浏览器和服务器都支持gzip,可以有效减少静态资源文件大小,压缩率在 70% 左右。

// nginx可以配置gzip: on来开启压缩,但是只在nginx层面开启,会在每次请求资源时都对资源进行压缩,
// 压缩文件会需要时间和占用服务器cpu资源，更好的方式是前端在打包的时候直接生成gzip资源,服务器接收到请求,
// 可以直接把对应压缩好的gzip文件返回给浏览器,节省时间和cpu。
const CompressionPlugin = require("compression-webpack-plugin");
module.exports = merge(baseConfig, {
  mode: "production", // 生产模式, 会开启tree-shaking和压缩代码,以及其他优化
  plugins: [
    // 复制文件插件
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../public"), // 复制public下文件
          to: path.resolve(__dirname, "../dist"), // 复制到dist目录中
          filter: (source) => {
            return !source.includes("index.html"); // 忽略index.html
          },
        },
      ],
    }),
    // 抽离css插件
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:8].css", // 抽离css的输出目录和名称
    }),
    // 清理无用css
    new PurgeCSSPlugin({
      // 检测src下所有tsx文件和public下index.html中使用的类名和id和标签名称
      // 只打包这些文件中用到的样式
      paths: globAll.sync([
        `${path.join(__dirname, "../src")}/**/*.tsx`,
        path.join(__dirname, "../public/index.html"),
      ]),
      // 插件本身也提供了一些白名单safelist属性,符合配置规则选择器都不会被删除掉,
      // 比如使用了组件库antd, purgecss-webpack-plugin插件检测src文件下tsx文件中使用的类名和id时,
      // 是检测不到在src中使用antd组件的类名的,打包的时候就会把antd的类名都给过滤掉,
      // 可以配置一下安全选择列表,避免删除antd组件库的前缀ant
      safelist: {
        standard: [/^ant-/], // 过滤以ant-开头的类名，哪怕没用到也不删除
      },
    }),
    new TerserPlugin({
      // 压缩js
      parallel: true, // 开启多线程压缩
      terserOptions: {
        compress: {
          pure_funcs: ["console.log"], // 删除console.log
        },
      },
    }),
    new CompressionPlugin({
      test: /.(js|css)$/, // 只生成css,js压缩文件
      filename: "[path][base].gz", // 文件命名
      algorithm: "gzip", // 压缩格式,默认是gzip
      test: /.(js|css)$/, // 只生成css,js压缩文件
      threshold: 10240, // 只有大小大于该值的资源会被处理。默认值是 10k
      minRatio: 0.8, // 压缩率,默认值是 0.8
    }),
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(), // 压缩css
    ],

    // 一般第三方包的代码变化频率比较小,可以单独把node_modules中的代码单独打包,
    // 当第三包代码没变化时,对应chunkhash值也不会变化,可以有效利用浏览器缓存，
    // 还有公共的模块也可以提取出来,避免重复打包加大代码整体体积, webpack提供了代码分隔功能,
    // 需要我们手动在优化项optimization中手动配置下代码分隔splitChunks规则
    splitChunks: {
      // 分隔代码
      cacheGroups: {
        vendors: {
          // 提取node_modules代码
          test: /node_modules/, // 只匹配node_modules里面的模块
          name: "vendors", // 提取文件命名为vendors,js后缀和chunkhash会自动加
          minChunks: 1, // 只要使用一次就提取出来
          chunks: "initial", // 只提取初始化就能获取到的模块,不管异步的
          minSize: 0, // 提取代码体积大于0就提取出来
          priority: 1, // 提取优先级为1
        },
        commons: {
          // 提取页面公共代码
          name: "commons", // 提取文件命名为commons
          minChunks: 2, // 只要使用两次就提取出来
          chunks: "initial", // 只提取初始化就能获取到的模块,不管异步的
          minSize: 0, // 提取代码体积大于0就提取出来
        },
      },
    },
  },
});
