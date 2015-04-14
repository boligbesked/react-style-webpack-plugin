'use strict';

var recast    = require('recast');
var types     = recast.types;
var n         = types.namedTypes;
var b         = types.builders;

function annotateStyleName(tree, prefix, query) {

  return recast.visit(tree, {
    visitCallExpression: function(path) {
      var node = path.value;
      if (this.isStyleDeclaration(path)) {
        var styleName;
        if (node.arguments.length === 1) {
          styleName = this.getStyleClassName(path);
        }
        else if (node.arguments.length === 2) {
          styleName = this.getStyleClassName(path);
//          styleName = this.getStyleName(prefix, node.arguments[1].value);
        }
        if (styleName) {
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
        node.callee.object.name === 'StyleSheet' &&
        n.Identifier.check(node.callee.property) &&
        node.callee.property.name === 'create'
        );
    },

    buildStyleClassDeclaration: function(callee, style, styleName) {
      return b.callExpression(callee, [style, b.literal(styleName), b.literal(true)]);
    },

    getStyleClassName: function(path) {
      var styleClassName = '';

      // development time className
      if (path.parent.value.key && path.parent.value.key.name) {
        styleClassName = path.parent.value.key.name;
      }

      // user defined className
      if (n.VariableDeclarator.check(path.parentPath.value)) {
        styleClassName = path.parentPath.value.id.name;
      }

      if (prefix) {
        styleClassName = prefix + '_' + styleClassName;
      }

      return styleClassName;
    }

  });
}

module.exports = annotateStyleName;
