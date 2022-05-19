const validateOptions = require('schema-utils');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { stringify } = require('qs');

const PLUGIN_NAME = 'HtmlWebpackInjectQsPlugin';

const schema = {
  type: 'object'
};

class HtmlWebpackInjectQsPlugin {
  constructor(opts = {}) {
    validateOptions(schema, opts);
    this.qsObj = opts;
  }

  alterAssetTags(data) {
    if (data.assetTags) {
      this.inject(data.assetTags.scripts);
      this.inject(data.assetTags.styles);
    } else {
      this.inject(data.head);
      this.inject(data.body);
    }
    return data;
  }

  inject(scripts = []) {
    const qsStr = '?' + stringify(this.qsObj);
    scripts.forEach(script => {
      if (script.tagName === 'script') {
        script.attributes.src += qsStr;
      } else if (script.tagName === 'link') {
        script.attributes.href += qsStr;
      }
    })
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      if(compilation.hooks) {
        // webpack 4.x and later
        if(compilation.hooks.htmlWebpackPluginAlterAssetTags) {
          compilation.hooks.htmlWebpackPluginAlterAssetTags.tap(PLUGIN_NAME, this.alterAssetTags.bind(this));
        } else {
          // HtmlWebpackPlugin 4.x and later
          const hooks = HtmlWebpackPlugin.getHooks(compilation);
          hooks.alterAssetTags.tap(PLUGIN_NAME, this.alterAssetTags.bind(this));
        }
      } else {
        // webpack 3.x and earlier
        throw new Error(`${PLUGIN_NAME} can only work with webpack 4.x and later`);
      }
    });
  }
}

module.exports = HtmlWebpackInjectQsPlugin;