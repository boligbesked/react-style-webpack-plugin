'use strict';

module.exports = function entry(src) {
  if (this && this.cacheable) {
    this.cacheable();
  }
  return [
    'var __ReactStyle = require("react-style");',
    '__ReactStyle.startCaptureStyles();',
    src,
    '__ReactStyle.stopCaptureStyles();',
    'var __ReactStyle_result = __ReactStyle.compileCapturedStyles();',
    'module.exports = [[module.id, __ReactStyle_result.css, ""]];',
    'module.exports.__classNames = __ReactStyle_result.classNames;'
  ].join('\n');
};
