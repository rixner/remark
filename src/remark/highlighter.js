/*
 * This file is now a wrapper around the global `hljs` object,
 * which is expected to be loaded via a separate script tag.
 */

module.exports = {
  get engine() {
    return window.hljs || {
      highlightElement: function() {
        console.warn('highlight.js not found. Code blocks will not be highlighted.');
      }
    };
  },
  styles: {}
};
