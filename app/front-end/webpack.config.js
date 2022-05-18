const webpack = require('webpack');
const path = require('path');
const colors = require('colors');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const optimizeCss = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const extractStyle = new ExtractTextWebpackPlugin({
  filename: '[name].css',
});
const NODE_ENV = process.env.NODE_ENV || 'production';
const DIST_DIR = path.join(__dirname, 'build'); // for 云构建

const cssModulesLocalIdentName =
  NODE_ENV === 'development'
    ? '[path][name]---[local]---[hash:base64:5]'
    : '[hash:base64:8]';

const vendors = ['react', 'react-dom'];
const svgDirs = [path.resolve(__dirname, 'src')];
//兼容antd高清方案
const theme = {
  hd: '2px',
};

const BaseWebpackConfig = {
  mode: NODE_ENV,
  devtool: NODE_ENV === 'production' ? 'source-map' : '',
  devServer: {
    publicPath: '/build/',
    contentBase: './',
    compress: true,
    port: 9000,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    disableHostCheck: true,
  },
  entry: {
    index: ['es6-shim', 'es7-shim', path.join(__dirname, './src/entry')],
    vendor: vendors,
  },
  output: {
    filename: '[name].js',
    path: DIST_DIR,
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    alias: {
      '@': path.join(__dirname, './src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.less$/,
        use: extractStyle.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  auto: true,
                  localIdentName: cssModulesLocalIdentName,
                },
              },
            },
            {
              loader: 'postcss-loader',
            },
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true,
                modifyVars: theme,
              },
            },
          ],
        }),
      },
      {
        test: /\.css$/,
        use: extractStyle.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  auto: true,
                  localIdentName: cssModulesLocalIdentName,
                },
              },
            },
            {
              loader: 'postcss-loader',
            },
          ],
        }),
        exclude: [
          //排除这个文件夹下面的less文件
          path.resolve(__dirname, 'node_modules'),
        ],
        include: [__dirname],
      },
      {
        test: /\.css$/,
        use: extractStyle.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  auto: false,
                },
              },
            },
            {
              loader: 'postcss-loader',
            },
          ],
        }),
        include: [
          //包含这个文件夹下面的css文件
          path.resolve(__dirname, 'node_modules'),
        ],
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      // {
      //   test: /\.json$/,
      //   use: 'json-loader',
      // },
      {
        test: /\.(png|gif|jpeg|jpg)$/,
        use: 'url-loader?limit=100000',
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'file-loader?name=res/[name].[ext]?[hash]',
      },
      {
        test: /\.(svg)$/i,
        loader: 'svg-sprite-loader',
        options: {
          runtimeCompat: true,
        },
        include: svgDirs,
      },
    ],
  },
  plugins: [extractStyle],
  optimization: {
    minimize: NODE_ENV === 'production',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          safari10: true,
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: new RegExp(
            vendors.map((lib) => 'node_modules.+' + lib).join('|'),
          ),
          chunks: 'all',
          name: 'vendor',
          priority: 10,
        },
      },
    },
  },
};
if (NODE_ENV === 'production') {
  console.log(colors.green('production mode'));
  BaseWebpackConfig.plugins = (BaseWebpackConfig.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new optimizeCss(),
  ]);
} else if (NODE_ENV === 'development') {
  BaseWebpackConfig.devtool = 'cheap-module-eval-source-map';
  BaseWebpackConfig.plugins.push(new webpack.NoEmitOnErrorsPlugin());
  BaseWebpackConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV || 'development'),
    }),
  );
} else if (NODE_ENV === 'analyzer') {
  BaseWebpackConfig.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      generateStatsFile: true,
    }),
  );
}
module.exports = BaseWebpackConfig;
