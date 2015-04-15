'use strict';

module.exports = function entry(src) {
  if (this && this.cacheable) {
    this.cacheable();
  }

  return [
    'var __ReactStyle = require("react-style");',
    '__ReactStyle.setForceUseClasses(true);',
    src,
    'module.exports = [[module.id, "", ""]];',
    '__ReactStyle.compile(__ReactStyle.maxOverridesLength, "http://gen.reactstyle/fixme.css", function(err, __ReactStyle_result) {',
    '  // FIXME: error handling',
    '  var CleanCSS = require("clean-css");',
    '  module.exports = [[module.id, new CleanCSS().minify(__ReactStyle_result.css).styles, ""]];',
    '  module.exports.__classNames = __ReactStyle_result.classNames;',
    '});'
  ].join('\n');
};
