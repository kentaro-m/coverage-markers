/* global atom */

import { CompositeDisposable } from 'event-kit';
import { displayCoverage, removeCoverage } from './coverage';

let subscriptions;
let isVisible;

function activate() {
  // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
  subscriptions = new CompositeDisposable();
  isVisible = false;

  // Register command that toggles this view
  subscriptions.add(atom.commands.add('atom-workspace', {
    'coverage-markers:toggle': toggle
  }));
}

function deactivate() {
  subscriptions.dispose();
}

function show() {
  displayCoverage(subscriptions);
  isVisible = true;
}

function hide() {
  removeCoverage(subscriptions);
  isVisible = false;
}

function toggle() {
  isVisible ? hide() : show();
}

module.exports = {
  activate,
  deactivate,
  show,
  hide,
  toggle,
};
