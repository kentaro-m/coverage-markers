'use babel';

/* global atom */

import { CompositeDisposable } from 'atom';
import { displayCoverage, removeCoverage } from './coverage';

export default {

  subscriptions: null,

  activate(state) {
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
  },

  show() {
    displayCoverage();
  },

  dismiss() {
    removeCoverage();
  },
};
