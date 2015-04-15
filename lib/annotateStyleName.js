'use strict';

var recast    = require('recast');
var bases     = require('bases');
var types     = recast.types;
var n         = types.namedTypes;
var b         = types.builders;
var nextClassNameNumeric = 0;

function annotateStyleName(tree, prefix, query, sourceFile, fullSourceFile, styleNameMapping) {

  return recast.visit(tree, {
    visitCallExpression: function(path) {
      var node = path.value;
      if (this.isStyleDeclaration(path)) {
        if (node.arguments.length === 1) {
          var replacement = this.buildStyleClassDeclaration(
            node.callee, node.arguments[0], null, sourceFile, fullSourceFile, styleNameMapping);
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
        ) && (path.parent.parent.parent.value.type == 'Program' || path.parent.parent.parent.value.type == 'File');
    },

    buildStyleClassDeclaration: function(callee, style, styleName, sourceFile, fullSourceFile, styleNameMapping) {
      var properties = [];
      var styleNames = [];

      for (var i=0; i < style.properties.length; ++i) {
        if (style.properties[i].key.type === 'Identifier') {

          var cacheKey = fullSourceFile + ":" + style.properties[i].key.name;
          var uniqueName = styleNameMapping[cacheKey];
          if (!uniqueName) {
            uniqueName = bases.toBase52(nextClassNameNumeric++);
            styleNameMapping[cacheKey] = uniqueName;
          }
          styleNames.push(b.literal(
            "production" === process.env.NODE_ENV ?
              uniqueName :
              style.properties[i].key.name + '_' + uniqueName));

          var firstItem, lastItem;

          firstItem = lastItem = style.properties[i].value;

          if (firstItem.properties.length > 0) {
            firstItem = firstItem.properties[0];
            lastItem = lastItem.properties[lastItem.properties.length - 1];
          }

          properties.push(b.property(
            'init',
            b.literal(style.properties[i].key.name),
            b.objectExpression([
              b.property('init',
                         b.literal('start'),
                         b.objectExpression([
                           b.property('init',
                                      b.literal('line'),
                                      b.literal(firstItem.loc.start.line)),
                           b.property('init',
                                      b.literal('column'),
                                      b.literal(firstItem.loc.start.column)),
                         ])),
              b.property('init',
                         b.literal('end'),
                         b.objectExpression([
                           b.property('init',
                                      b.literal('line'),
                                      b.literal(lastItem.loc.end.line)),
                           b.property('init',
                                      b.literal('column'),
                                      b.literal(lastItem.loc.end.column)),
                         ]))])));
        }
      }
      var options = b.objectExpression([
        b.property('init',
                   b.literal('useClassName'),
                   b.arrayExpression(styleNames)),
        b.property('init',
                   b.literal('file'),
                   b.literal(sourceFile)),
        b.property('init',
                   b.literal('sourcemap'),
                   b.objectExpression(properties))]);

      return b.callExpression(callee, [style, options]);
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
