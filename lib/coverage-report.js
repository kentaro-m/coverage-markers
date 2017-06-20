'use babel';

/* global atom */

import CoverageReportView from './coverage-report-view';
import { displayCoverage, removeCoverage } from './lcov';
import { CompositeDisposable } from 'atom';

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
      displayCoverage(editor);
    });
  },

  dismiss() {
    const editors = atom.workspace.getTextEditors();
    removeCoverage(editors);
    this.textEditors.dispose();
  },
};
