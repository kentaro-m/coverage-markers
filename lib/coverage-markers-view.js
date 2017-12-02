/* global atom */

module.exports = class CoverageMarkersView {
  static enableGutterStyle(editor) {
    const gutters = atom.views.getView(editor).getElementsByClassName('gutter line-numbers');
    if (gutters.length > 0) {
      Array.prototype.forEach.call(gutters, (gutter) => {
        if (!gutter.classList.contains('coverage-markers-gutter')) {
          gutter.classList.add('coverage-markers-gutter');
        }
      });
    }
  }

  static disableGutterStyle(editor) {
    const gutters = atom.views.getView(editor).getElementsByClassName('gutter line-numbers coverage-markers-gutter');
    if (gutters.length > 0) {
      Array.prototype.forEach.call(gutters, (gutter) => {
        gutter.classList.remove('coverage-markers-gutter');
      });
    }
  }
};
