const path = require('path')
const BUILD_DIR = path.join(__dirname, '/')
const APP_DIR = path.join(__dirname, '/src/')
const webpack = require('webpack')

const babelConfig = require('./.babelrc.js');

module.exports = {
  mode: "production",
  entry: APP_DIR + 'index.ts',
  output: {
    filename: 'index.js',
    path: BUILD_DIR,
    library: 'pk-date-helpers',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },

  devtool: 'cheap-module-eval-source-map',

  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        loader: 'babel-loader',
        include: [path.join(__dirname, 'src')],
        query: babelConfig.env.production
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],

  optimization: {
    minimize: true,
    nodeEnv: 'production',
  },

  resolve: {
    extensions: ['.webpack.js', '.jsx', '.js', '.ts', '.tsx']
  }
}