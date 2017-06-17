'use babel';

/* global atom */

import chokidar from 'chokidar';
import Promise from 'bluebird';
import CoverageReportView from './coverage-report-view';
import { removeMarkers, showCoverage, searchLcovPath } from './lcov';
import { InvalidLcovInfoFormatError, NotFoundLcovFileError } from './error';
import { CompositeDisposable } from 'atom';

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
      Promise.coroutine(function *() {
        yield showCoverage(editor);
      })()
      .catch(InvalidLcovInfoFormatError, (error) => {
        atom.notifications.addError(error.message);
      })
      .catch(NotFoundLcovFileError, (error) => {
        atom.notifications.addError(error.message);
      })
      .catch((error) => {
        console.log(error);
      });


      const lcovPath = searchLcovPath();
      const options = {
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 100,
        },
      };

      watcher = chokidar.watch(lcovPath, options);
      watcher.on('change', () => {
        Promise.coroutine(function *() {
          yield removeMarkers(editor);
          yield showCoverage(editor);
        })()
        .catch(InvalidLcovInfoFormatError, (error) => {
          atom.notifications.addError(error.message);
        })
        .catch(NotFoundLcovFileError, (error) => {
          atom.notifications.addError(error.message);
        })
        .catch((error) => {
          console.log(error);
        });
      });
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
