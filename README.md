# html-webpack-inject-qs-plugin
This plugin can auto inject query strings to chunks based on HtmlWebpackPlugin.
## Installation  
```
npm i -D html-webpack-inject-qs-plugin
```

## Usage  

Simply add the plugin behind the HtmlWebpackPlugin:  

#### webpack.config.js  

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjectQsPlugin = require('html-webpack-inject-qs-plugin');
module.exports = {
   plugins: [
     new HtmlWebpackPlugin(),
     new HtmlWebpackInjectQsPlugin({
       version: '1.0.0',
       test: 'abc'
     })
   ]
 };
```