const path = require('path');
const vueLoaderPlugin = require('vue-loader/lib/plugin');

const config = {
    entry: path.join(__dirname, 'src', 'app', 'main.js'),
    output: {
        path: path.join(__dirname, 'src','public', 'js', 'dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
          'vue$': 'vue/dist/vue.esm.js'
        }
    },
    module:{
        rules: [
           {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
           },
           {
                test: /\.vue$/,
                exclude: /node_modules/,
                loader: "vue-loader"
            }
        ]
    },
    plugins:[
        new vueLoaderPlugin()
    ]
}

module.exports = config;