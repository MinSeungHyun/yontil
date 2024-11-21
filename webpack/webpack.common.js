const webpack = require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const srcDir = path.join(__dirname, '..', 'src')

module.exports = {
  entry: {
    background: path.join(srcDir, 'entry', 'background.ts'),
    'content-scripts/learnus-login-page': path.join(
      srcDir,
      'entry',
      'content-scripts',
      'learnus-login-page.ts'
    ),
    'content-scripts/infra-login-page': path.join(
      srcDir,
      'entry',
      'content-scripts',
      'infra-login-page.ts'
    ),
    'content-scripts/learnus-all-pages': path.join(
      srcDir,
      'entry',
      'content-scripts',
      'learnus-all-pages.tsx'
    ),
    'content-scripts/yonsei-all-pages': path.join(
      srcDir,
      'entry',
      'content-scripts',
      'yonsei-all-pages.ts'
    ),
  },
  output: {
    path: path.join(__dirname, '../dist/js'),
    filename: '[name].js',
  },
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks(chunk) {
        return chunk.name !== 'background'
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        include: srcDir,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: '.', to: '../', context: 'public' }],
      options: {},
    }),
  ],
}
