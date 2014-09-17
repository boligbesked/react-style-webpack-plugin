'use strict';

var recast    = require('recast');
var types     = recast.types;
var n         = types.namedTypes;
var b         = types.builders;

function annotateStyleName(tree, prefix) {
  return recast.visit(tree, {
    visitCallExpression: function(path) {
      var node = path.value;
      if (this.isStyleDeclaration(path)) {
        if (node.arguments.length == 1) {
          var styleName = this.getStyleClassName(path);
          var replacement = this.buildStyleClassDeclaration(
            node.callee, node.arguments[0], styleName);
          path.replace(replacement);
        }
        return false;
      }
      this.traverse(path);
    },

    isStyleDeclaration: function(path) {
      var node = path.value;
      return (
        n.MemberExpression.check(node.callee) &&
        n.Identifier.check(node.callee.object) &&
        node.callee.object.name === 'ReactStyle' &&
        n.Identifier.check(node.callee.property) &&
        node.callee.property.name === 'create'
      ) || (
        n.Identifier.check(node.callee) &&
        node.callee.name === 'ReactStyle'
      );
    },

    buildStyleClassDeclaration: function(callee, style, styleName) {
      return b.callExpression(callee, [style, b.literal(styleName)]);
    },

    getStyleClassName: function(path) {
      var styleClassName = '';
      if (n.VariableDeclarator.check(path.parentPath.value)) {
        styleClassName = path.parentPath.value.id.name;
      }

      var loc = path.value.loc.start;
      styleClassName = styleClassName + '_' + loc.line + '_' + loc.column;
      if (prefix) {
        styleClassName = prefix + '_' + styleClassName;
      }
      return 'c' + styleClassName;
    },
  });
}

module.exports = annotateStyleName;
