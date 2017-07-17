/* global atom */

import { CompositeDisposable } from 'event-kit';
import { displayCoverage, removeCoverage } from './coverage';

let subscriptions;

function activate() {
  // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
  subscriptions = new CompositeDisposable();

  // Register command that toggles this view
  subscriptions.add(atom.commands.add('atom-workspace', {
    'coverage-markers:show': show,
    'coverage-markers:hide': hide,
  }));
}

function deactivate() {
  subscriptions.dispose();
}

function show() {
  displayCoverage(subscriptions);
}

function hide() {
  removeCoverage(subscriptions);
}

module.exports = {
  activate,
  deactivate,
  show,
  hide,
};
