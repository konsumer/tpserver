import { resolve } from 'path'
import { DefinePlugin, HotModuleReplacementPlugin } from 'webpack'

const config = {
  entry: ['webpack-hot-middleware/client', './src/client.js'],

  output: {
    filename: 'bundle.js',
    path: resolve(__dirname, 'public/build'),
    publicPath: '/build/'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader']
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.svg$/,
        use: ['file-loader']
      }
    ]
  },

  devServer: {
    historyApiFallback: true,
    quiet: true,
    contentBase: resolve(__dirname, 'public'),
    publicPath: '/build/',
    hot: true,
    logLevel: 'debug',
    logTime: true
  },

  plugins: [
    new DefinePlugin({NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')}),
    new HotModuleReplacementPlugin()
  ]
}

if (process.env.NODE_ENV !== 'production') {
  config.devtool = 'cheap-module-eval-source-map'
}

export default config
