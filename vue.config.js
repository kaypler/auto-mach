// https://cli.vuejs.org/zh/config/
module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  publicPath: '/auto-match/',
  devServer: {
    proxy: 'https://parkutil.smartmideazy.com'
  }
}
