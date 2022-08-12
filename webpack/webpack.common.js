const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const { glob } = require('glob')

module.exports = {
  entry: glob.sync('./src/**/*.*').reduce((obj, el) => {
    obj[path.parse(el).name] = el
    return obj
  }, {}),
  output: {
    path: path.join(__dirname, '../dist/js'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', 'jsx'],
    fallback: {
      util: false,
      url: false,
      buffer: false,
      path: false,
      http: false,
      https: false,
      os: false,
      zlib: false,
      stream: false,
      crypto: false,
      string_decoder: false,
      assert: false,
      fs: false,
      tls: false,
      net: false,
      child_process: false,
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: '.', to: '../', context: 'public' }],
      options: {},
    }),
  ],
  performance: {
    hints: false,
  },
}
