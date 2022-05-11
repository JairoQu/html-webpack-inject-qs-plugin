const validateOptions = require('schema-utils');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { stringify } = require('qs');

const PLUGIN_NAME = 'HtmlWebpackInjectQsPlugin'

const schema = {
  type: 'object'
};

class HtmlWebpackInjectQsPlugin {
  constructor(opts = {}) {
    validateOptions(schema, opts);
    this.qsObj = opts
  }

  alterAssetTags(data) {
    if (data.assetTags) {
      this.inject(data.assetTags.scripts);
    } else {
      this.inject(data.head);
      this.inject(data.body);
    }
    return data;
  }

  inject(scripts = []) {
    const qsStr = '?' + stringify(this.qsObj)
    scripts.forEach(script => {
      if (script.tagName === 'script') {
        script.attributes.src += qsStr
      } else if (script.tagName === 'link') {
        script.attributes.href += qsStr
      }
    })
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      // html-webpack-plugin v4
      if (HtmlWebpackPlugin.getHooks) {
        const hooks = HtmlWebpackPlugin.getHooks(compilation);
        hooks.alterAssetTags.tap(PLUGIN_NAME, this.alterAssetTags.bind(this));
      } else {
        // html-webpack-plugin v3
        const hooks = compilation.hooks;
        hooks.htmlWebpackPluginAlterAssetTags.tap(PLUGIN_NAME, this.alterAssetTags.bind(this));
      }
    });
  }
}

module.exports = HtmlWebpackInjectQsPlugin;