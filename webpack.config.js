const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  context: process.cwd(), // 上下文目录
  mode: 'development', // 开发模式
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'monitor.js'
  },
  // devServer:{
  //   contentBase:path.resolve(__dirname,'dist') // devServer静态文件根目录
  // },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    // onBeforeSetupMiddleware (router) {
    //   router.get('/success', function (req, res) {
    //     res.json({ id: 1 })
    //   })
    //   router.get('/error', function (req, res) {
    //     res.sendStatus(500)
    //   })
    // },
    onBeforeSetupMiddleware: function (devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.get('/success', function (req, res) {
        res.json({ id: 1 })
      });
      devServer.app.get('/error', function (req, res) {
        res.sendStatus(500)
      });
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'head'
    })
  ]
}