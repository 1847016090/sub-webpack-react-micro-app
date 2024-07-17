// webpack.base.js
const path = require('path')
const webpack = require('webpack')

// 把最终构建好的静态资源都引入到一个html文件中,这样才能在浏览器中运行
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const ESLintWebpackPlugin = require('eslint-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development' // 是否是开发模式

module.exports = {
  entry: path.join(__dirname, '../src/index.tsx'), // 入口文件
  // 打包文件出口
  output: {
    //     hash：跟整个项目的构建相关,只要项目里有文件更改,整个项目构建的hash值都会更改,并且全部文件都共用相同的hash值
    // chunkhash：不同的入口文件进行依赖文件解析、构建对应的chunk,生成对应的哈希值,文件本身修改或者依赖文件修改,chunkhash值会变化
    // contenthash：每个文件自己单独的 hash 值,文件的改动只会影响自身的 hash 值
    // 因为js我们在生产环境里会把一些公共库和程序入口文件区分开,单独打包构建,采用chunkhash的方式生成哈希值,
    // 那么只要我们不改动公共库的代码,就可以保证其哈希值不会受影响,可以继续使用浏览器缓存,所以js适合使用chunkhash。

    // css和图片资源媒体资源一般都是单独存在的,可以采用contenthash,只有文件本身变化后会生成新hash值。
    filename: 'static/js/[name].[chunkhash:8].js', // 每个输出js的名称
    path: path.join(__dirname, '../dist'), // 打包结果输出路径
    clean: true, // webpack4 需要配置 clean-webpack-plugin 来删除 dist 文件,webpack5内置了
    publicPath: '/' // 打包后文件的公共前缀路径
  },
  cache: {
    type: 'filesystem' // 使用文件缓存
  },
  module: {
    rules: [
      {
        test: /.(ts|tsx)$/, // 匹配 .ts, .tsx文件
        // webpack 的 loader 默认在单线程执行,现代电脑一般都有多核cpu,可以借助多核cpu开启多线程loader解析,
        // 可以极大地提升loader解析的速度,thread-loader就是用来开启多进程解析loader的,
        // 使用时,需将此 loader 放置在其他 loader 之前。放置在此 loader 之后的 loader 会在一个独立的 worker 池中运行
        // 由于thread-loader不支持抽离css插件MiniCssExtractPlugin.loader(下面会讲),所以这里只配置了多进程解析js,
        // 开启多线程也是需要启动时间,大约600ms左右,所以适合规模比较大的项目
        use: ['thread-loader', 'babel-loader'],
        include: [path.resolve(__dirname, '../src')] // 只对项目src文件的ts,tsx进行loader解析
      },
      {
        // 从右往左,从下往上的,遇到less文件,使用less-loader解析为css
        // 匹配到css文件后先用css-loader解析css, 最后借助style-loader把css插入到头部style标签中
        test: /.css$/, //匹配 css和less 文件
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader, // 开发环境使用style-looader,打包模式抽离css
          'css-loader',
          // 新增
          // postcss-loader：处理css时自动加前缀
          // autoprefixer：决定添加哪些浏览器前缀到css中
          'postcss-loader'
          //   可以拆分上面配置的less和css, 避免让less-loader再去解析css文件
          //   loader在webpack构建过程中使用的位置是在webpack构建模块依赖关系引入新文件时，
          //   会根据文件后缀来倒序遍历rules数组，如果文件后缀和test正则匹配到了，
          //   就会使用该rule中配置的loader依次对文件源代码进行处理，最终拿到处理后的sourceCode结果，
          //   可以通过避免使用无用的loader解析来提升构建速度，比如使用less-loader解析css文件
          //   "less-loader",
        ]
      },
      {
        // 从右往左,从下往上的,遇到less文件,使用less-loader解析为css
        // 匹配到css文件后先用css-loader解析css, 最后借助style-loader把css插入到头部style标签中
        test: /.less$/, //匹配 css和less 文件
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader, // 开发环境使用style-looader,打包模式抽离css
          'css-loader',
          // 新增
          // postcss-loader：处理css时自动加前缀
          // autoprefixer：决定添加哪些浏览器前缀到css中
          'postcss-loader',
          'less-loader'
        ]
      },
      {
        // 对于图片文件,webpack4使用file-loader和url-loader来处理的,但webpack5不使用这两个loader了,而是采用自带的asset-module来处理
        test: /.(png|jpg|jpeg|gif|svg)$/, // 匹配图片文件
        type: 'asset', // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 小于10kb转base64位
          }
        },
        generator: {
          filename: 'static/images/[name].[contenthash:8][ext]' // 加上[contenthash:8]
        }
      },
      {
        test: /.(woff2?|eot|ttf|otf)$/, // 匹配字体图标文件
        type: 'asset', // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 小于10kb转base64位
          }
        },
        generator: {
          filename: 'static/fonts/[name].[contenthash:8][ext]' // 文件输出目录和命名
        }
      },
      {
        test: /.(mp4|webm|ogg|mp3|wav|flac|aac)$/, // 匹配媒体文件
        type: 'asset', // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 小于10kb转base64位
          }
        },
        generator: {
          filename: 'static/media/[name].[contenthash:8][ext]' // 文件输出目录和命名
        }
      }
    ]
  },
  resolve: {
    // 在引入模块时不带文件后缀时，会来该配置数组里面依次添加后缀查找文件，因为ts不支持引入以 .ts, tsx为后缀的文件，
    // 所以要在extensions中配置，而第三方库里面很多引入js文件没有带后缀，所以也要配置下js
    // 修改webpack.base.js，注意把高频出现的文件后缀放在前面
    extensions: ['.js', '.tsx', '.ts'],
    // 设置别名alias,设置别名可以让后续引用的地方减少路径的复杂度
    alias: {
      '@': path.join(__dirname, '../src')
    },
    // 使用require和import引入模块时如果有准确的相对或者绝对路径,就会去按路径查询,如果引入的模块没有路径,
    // 会优先查询node核心模块,如果没有找到会去当前目录下node_modules中寻找,
    // 如果没有找到会查从父级文件夹查找node_modules,一直查到系统node全局模块。

    // 这样会有两个问题,一个是当前项目没有安装某个依赖,但是上一级目录下node_modules或者全局模块有安装,就也会引入成功,
    // 但是部署到服务器时可能就会找不到造成报错,另一个问题就是一级一级查询比较消耗时间。可以告诉webpack搜索目录范围,来规避这两个问题
    modules: [path.resolve(__dirname, '../node_modules')] // 查找第三方模块只在本项目的node_modules中查找
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'), // 模板取定义root节点的模板
      inject: true // 自动注入静态资源
    }),
    //需要把process.env.BASE_ENV注入到业务代码里面,就可以通过该环境变量设置对应环境的接口地址和其他数据
    new webpack.DefinePlugin({
      'process.env.BASE_ENV': JSON.stringify(process.env.BASE_ENV)
    }),
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname, 'src')
    })
  ]
}
