'use strict';

module.exports = function entry(src) {
  if (this && this.cacheable) {
    this.cacheable();
  }
  return [
    'var autoprefixer = require("autoprefixer-core");',
    'var cleancss = new require("clean-css")();',
    'var __ReactStyle = require("react-style");',
    src,
    'var __ReactStyle_result = __ReactStyle.compile(__ReactStyle.maxOverridesLength || 5);',
    'var styles = cleancss.minify( autoprefixer.process( __ReactStyle_result.css ).css ).styles;',
    'module.exports = [[module.id, styles, ""]];',
    'module.exports.__classNames = __ReactStyle_result.classNames;'
  ].join('\n');
};
