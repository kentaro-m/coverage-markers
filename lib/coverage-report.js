'use babel';

import CoverageReportView from './coverage-report-view';
import { removeMarkers, showCoverage, searchLcovPath } from './lcov';
import { InvalidLcovInfoFormatException, NotFoundLcovFileException } from './error';
import { CompositeDisposable } from 'atom';
import chokidar from 'chokidar';
let watcher;

export default {

  coverageReportView: null,
  subscriptions: null,
  textEditors: null,

  activate(state) {
    this.coverageReportView = new CoverageReportView(state.coverageReportViewState);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'coverage-report:show': () => this.show(),
      'coverage-report:dismiss': () => this.dismiss(),
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.coverageReportView.destroy();
  },

  serialize() {
    return {
      coverageReportViewState: this.coverageReportView.serialize(),
    };
  },

  show() {
    this.textEditors = atom.workspace.observeTextEditors((editor) => {
      try {
        showCoverage(editor);

        const lcovPath = searchLcovPath();
        const options = {
          awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100,
          },
        };

        watcher = chokidar.watch(lcovPath, options);
        watcher.on('change', () => {
          removeMarkers(editor);
          showCoverage(editor);
        });
      } catch (error) {
        if (error instanceof InvalidLcovInfoFormatException) {
          atom.notifications.addError(error.message);
        } else if (error instanceof NotFoundLcovFileException) {
          atom.notifications.addError(error.message);
        }
      }
    });
  },

  dismiss() {
    if (watcher) {
      watcher.close();
    }
    const editors = atom.workspace.getTextEditors();
    editors.forEach((editor) => {
      removeMarkers(editor);
    });
    this.textEditors.dispose();
  },
};
