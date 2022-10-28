const Path = require('path');
const Dotenv = require('dotenv');

const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

const srcPath = Path.join(__dirname, 'apps', 'frontend', 'src');
const distPath = Path.join(__dirname, 'dist', 'apps', 'frontend', 'src');
const srcPublicPath = Path.join(srcPath, 'public');
const distPublicPath = Path.join(distPath, 'public');
const distPublicWebpackPath = Path.join(distPublicPath, 'webpack');

const envPath = Path.join(__dirname, 'config', '.env');
const envs = Dotenv.config({
    path: envPath,
});

const ConfigFrontend = {};
if (!envs.error) {
    Object.keys(envs.parsed).forEach((propName) => {
        let exposedVariable = true
        for (let i = propName.length; i-- > 0;) {
            if (propName[i] >= 'a' && propName[i] <= 'z') {
                exposedVariable = false;
            }
        }

        const targetPropName = propName.toUpperCase();
        if (exposedVariable === true) {
            ConfigFrontend[targetPropName] = envs.parsed[propName];
        }
    });
} else {
    console.warn('There was an error parsing .env file', envs.error);
}

module.exports = function (options, webpack) {
    let devTool, optimization;
    if (process.env.NODE_ENV === 'production') {
        devTool = false;
        optimization = {
            minimizer: [
                '...',
                new CssMinimizerPlugin(),
            ],
        };
    } else {
        devTool = 'inline-source-map';
        optimization = {
            minimize: false,
        }
    }

    const config = {
        target: 'web',
        mode: process.env.APP_NODE_ENV,
        externals: [],
        devtool: devTool,
        optimization,
        entry: Path.join(srcPath, 'main.tsx'),
        output: {
            filename: '[name]-[fullhash].js',
            path: distPublicWebpackPath,
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name]-[fullhash].css',
            }),
            new webpack.DefinePlugin({
                Config: JSON.stringify(ConfigFrontend),
                process: {
                    env: {
                        NODE_ENV: JSON.stringify(process.env.APP_NODE_ENV),
                    },
                },
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: srcPublicPath,
                        to: distPublicPath,
                        globOptions: {
                            ignore: ['**.html'],
                        },
                    },
                ],
            }),
            new HtmlWebpackPlugin({
                filename: Path.join(distPublicPath, 'index.html'),
                template: Path.join(srcPublicPath, 'index.html'),
            }),
            new CleanWebpackPlugin(),
        ],
        module: {
            rules: [{
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        'loader': 'css-loader',
                        'options': {
                            'url': false,
                        },
                    },
                ],
            }, {
                test: /\.js$|\.jsx$|\.ts$|\.tsx$/,
                exclude: [/node_modules/],
                use: {
                    loader: 'babel-loader',
                    options: {
                        'presets': [
                            [
                                '@babel/env',
                                {
                                    targets: {
                                        chrome: 90,
                                        safari: 13,
                                        edge: 90,
                                    },
                                    useBuiltIns: 'entry',
                                    corejs: { version: 3, proposals: false },
                                },
                            ],
                            '@babel/preset-react',
                            '@babel/typescript',
                        ],
                        plugins: [
                            ['@babel/plugin-proposal-decorators', { 'legacy': true }],
                            ['@babel/plugin-proposal-class-properties', { 'loose': false }],
                            '@babel/proposal-object-rest-spread',
                            // '@babel/plugin-transform-regenerator',
                        ],
                        cacheDirectory: '/tmp',
                        configFile: false,
                        babelrc: false,
                    },
                },
            }, {
                test: /\.svg$/,
                exclude: [/node_modules/],
                use: {
                    loader: 'raw-loader',
                },
            }],
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
            fallback: {
                'crypto': require.resolve('crypto-browserify'),
                'stream': require.resolve('stream-browserify'),
                'path': require.resolve('path-browserify'),
            },
        },
    };

    // const configWithMeasure = new SpeedMeasurePlugin().wrap(config);
    // configWithMeasure.plugins.push(new MiniCssExtractPlugin({
    //     filename: '[name]-[fullhash].css',
    // }));

    return config;
}
