const validateOptions = require('schema-utils');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ReplaceSource } = require('webpack-sources');
const { stringify } = require('qs');

const PLUGIN_NAME = 'HtmlWebpackInjectQsPlugin';

const schema = {
  type: 'object'
};

class HtmlWebpackInjectQsPlugin {
  constructor(opts = {}) {
    validateOptions(schema, opts);
    // this.qsObj = opts;
    this.qsStr = '?' + stringify(opts);
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
    scripts.forEach(script => {
      if (script.tagName === 'script') {
        script.attributes.src += this.qsStr;
      } else if (script.tagName === 'link') {
        script.attributes.href += this.qsStr;
      }
    })
  }

  injectLazyChunk(source) {
    const _source = new ReplaceSource(source);
    const _jsStart = _source.source().indexOf('".js"');
    const _cssStart = _source.source().indexOf('".css"');
    _jsStart !== -1 && _source.replace(_jsStart, _jsStart + 4, '".js' + this.qsStr + '"');
    _cssStart !== -1 && _source.replace(_cssStart, _cssStart + 5, '".css' + this.qsStr + '"');
    return _source;
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
    // afterCompile hook
    compiler.hooks.afterCompile.tap(PLUGIN_NAME, (compilation) => {
      for (const asset of Object.keys(compilation.assets)) {
        if (asset.endsWith('.js') && Object.keys(compilation.options.entry).some(entryName => asset.indexOf(entryName) !== -1)) {
          compilation.updateAsset(asset, this.injectLazyChunk.bind(this));
        }
      }
    });
  }
}

module.exports = HtmlWebpackInjectQsPlugin;