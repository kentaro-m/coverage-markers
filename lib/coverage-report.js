'use babel';

/* global atom */

import CoverageReportView from './coverage-report-view';
import { CompositeDisposable } from 'atom';
import Coverage from './coverage';

export default {

  coverageReportView: null,
  subscriptions: null,
  textEditors: null,
  coverage: null,

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
    this.coverage = new Coverage();
    this.coverage.display();
  },

  dismiss() {
    this.coverage.remove();
  },
};
