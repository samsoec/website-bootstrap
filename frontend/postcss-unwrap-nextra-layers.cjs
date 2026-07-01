/**
 * Custom PostCSS plugin that unwraps @layer rules from nextra-theme-docs CSS
 * BEFORE Tailwind v3 sees them, so Tailwind v3 doesn't reject them.
 *
 * Uses the Once hook to process the entire AST before any other plugin.
 */
module.exports = () => ({
  postcssPlugin: 'unwrap-nextra-layers',
  Once(root) {
    const file = root.source?.input?.file || '';
    if (!file.includes('nextra-theme-docs')) return;

    // Walk all @layer at-rules and unwrap them
    root.walkAtRules('layer', (atRule) => {
      if (atRule.nodes && atRule.nodes.length > 0) {
        atRule.replaceWith(atRule.nodes);
      } else {
        atRule.remove();
      }
    });
  },
});

module.exports.postcss = true;
