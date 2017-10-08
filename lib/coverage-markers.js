/* global atom */

import { CompositeDisposable } from 'event-kit';
import { showCoverage, hideCoverage } from './coverage';

let commands;
let subscriptions;
let isVisible;

function activate() {
  commands = new CompositeDisposable();
  isVisible = false;

  commands.add(
    atom.commands.add('atom-workspace', {
      'coverage-markers:toggle': () => this.toggle(),
    }),
  );
}

function deactivate() {
  if (commands) {
    commands.dispose();
  }

  if (subscriptions) {
    subscriptions.dispose();
  }

  isVisible = false;
}

function show() {
  subscriptions = new CompositeDisposable();
  subscriptions.add(
    atom.workspace.observeTextEditors(async (editor) => {
      showCoverage(editor, subscriptions);
    }),
  );
}

function hide() {
  subscriptions.add(
    atom.workspace.observeTextEditors(async (editor) => {
      hideCoverage(editor);
    }),
  );
  if (subscriptions) {
    subscriptions.dispose();
  }
}

function toggle() {
  isVisible ? hide() : show();
  isVisible = !isVisible;
}

module.exports = {
  activate,
  deactivate,
  show,
  hide,
  toggle,
};
