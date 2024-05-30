const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const basePath = process.cwd();

// Create an array of HTMLWebpackPlugin instances for each .njk file
const pages = glob.sync('**/*.njk', {
  cwd: path.join(basePath, 'src/templates/pages/'),
  root: '/',
}).map(page => new HTMLWebpackPlugin({
  filename: page.replace('njk', 'html'),
  template: `src/templates/pages/${page}`,
}));

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    entry: {
      bundle: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].js',
      clean: true,
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      port: isProduction ? 8080 : 9000,
      open: true,
      hot: true,
      compress: true,
      historyApiFallback: true,
    },
    module: {
      rules: [
        // Rule for handling CSS and SASS files
        {
          test: /\.((c|sa|sc)ss)$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
        },
        // Rule for handling JavaScript files with Babel
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.(png|gif|jpe?g|svg)$/i,
          type: 'asset',
          generator: {
            filename: 'images/[name].[hash:6][ext]',
          },
        },
        // Rule for handling font files
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
        // Rule for handling .njk files with simple-nunjucks-loader
        {
          test: /\.njk$/,
          use: [
            {
              loader: 'simple-nunjucks-loader',
              options: {},
            },
          ],
        },
      ],
    },
    plugins: [
      ...pages,
      new MiniCssExtractPlugin({
        filename: 'css/[name].css',
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
      }),
      new CleanWebpackPlugin({
        verbose: true,
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "src/assets/images", to: "images/" }
        ],
      }),
      new BundleAnalyzerPlugin(),
    ],
  };
};
