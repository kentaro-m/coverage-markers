/* global atom */

import { CompositeDisposable } from 'event-kit';
import Coverage from './coverage';
import { removeMarkers } from './coverage-report';

module.exports = class CoverageMarkers {
  constructor() {
    this.commandSubscriptions = new CompositeDisposable();
    this.editorSubscriptions = null;
    this.isVisible = false;
    this.coverages = [];
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
    try {
      await Promise.all(atom.project.getPaths().map(async (path) => {
        const coverage = new Coverage(path);
        await coverage.loadFromProjectPath();
        this.coverages.push(coverage);
      }));

      await Promise.all(atom.workspace.getTextEditors().map(async (editor) => {
        this.coverages.forEach((coverage) => {
          coverage.show(editor);
        });
      }));

      this.editorSubscriptions = atom.workspace.observeTextEditors((editor) => {
        this.coverages.forEach((coverage) => {
          coverage.show(editor);
        });
      });

      await Promise.all(this.coverages.map((coverage) => {
        coverage.watch();
      }));
    } catch (error) {
      atom.notifications.addError(error.message);
    }
  }

  hide() {
    try {
      if (this.editorSubscriptions) {
        this.editorSubscriptions.dispose();
      }

      atom.workspace.getTextEditors().forEach(async (editor) => {
        removeMarkers(editor);
      });
      this.coverages.forEach((coverage) => {
        coverage.unwatch();
      });
    } catch (error) {
      atom.notifications.addError(error.message);
    }
  }

  async toggle() {
    this.isVisible ? this.hide() : await this.show();
    this.isVisible = !this.isVisible;
  }
};
