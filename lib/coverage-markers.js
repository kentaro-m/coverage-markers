/* global atom */

import { CompositeDisposable } from 'event-kit';
import { showCoverage, hideCoverage, watchCoverage } from './coverage';

module.exports = class CoverageMarkers {
  constructor() {
    this.commandSubscriptions = new CompositeDisposable();
    this.editorSubscriptions = null;
    this.isVisible = false;
    this.coverage = null;
  }

  activate() {
    this.isVisible = false;

    this.commandSubscriptions.add(
      atom.commands.add('atom-workspace', {
        'coverage-markers:toggle': () => this.toggle(),
      }),
    );
  }

  deactivate() {
    if (this.commandSubscriptions) {
      this.commandSubscriptions.dispose();
    }

    if (this.editorSubscriptions) {
      this.editorSubscriptions.dispose();
    }

    this.isVisible = false;
  }

  async show() {
    this.editorSubscriptions = atom.workspace.observeTextEditors(async (editor) => {
      await showCoverage(editor);
    });
    await watchCoverage();
  }

  hide() {
    if (this.editorSubscriptions) {
      this.editorSubscriptions.dispose();
    }

    const editors = atom.workspace.getTextEditors();

    editors.forEach(async (editor) => {
      await hideCoverage(editor);
    });
  }

  async toggle() {
    this.isVisible ? this.hide() : await this.show();
    this.isVisible = !this.isVisible;
  }
};
