/* global atom */

import Promise from 'bluebird';
import { CompositeDisposable } from 'atom';
import { getLcovPath, readLcovFile, parseLcovInfo, getTargetLcovInfo, renderCoverage, removeMarkers } from './lcov';
import LcovWatcher from './lcov-watcher';

let lcovWatcher;
const subscriptions = new CompositeDisposable();

export function displayCoverage() {
  return new Promise((resolve, reject) => {
    subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      return Promise.coroutine(function* () {
        const lcovPath = yield getLcovPath();
        const lcovInfo = yield readLcovFile(lcovPath);
        const records = yield parseLcovInfo(lcovInfo);
        const targetLcovInfo = yield getTargetLcovInfo(editor.getPath(), records);
        yield renderCoverage(editor, targetLcovInfo);

        lcovWatcher = new LcovWatcher(editor, lcovPath);
        lcovWatcher.watch();
        resolve();
      })()
      .catch((error) => {
        reject(new Error(error.message));
      });
    }));
  })
  .catch((error) => {
    if (lcovWatcher) {
      lcovWatcher.unwatch();
    }
    atom.notifications.addError(error.message);
    subscriptions.dispose();
  });
}

export function updateCoverage(lcovPath) {
  return new Promise((resolve, reject) => {
    subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      return Promise.coroutine(function* () {
        const lcovInfo = yield readLcovFile(lcovPath);
        const records = yield parseLcovInfo(lcovInfo);
        const targetLcovInfo = yield getTargetLcovInfo(editor.getPath(), records);
        yield renderCoverage(editor, targetLcovInfo);
        resolve();
      })()
      .catch((error) => {
        reject(new Error(error.message));
      });
    }));
  })
  .catch((error) => {
    if (lcovWatcher) {
      lcovWatcher.unwatch();
    }
    atom.notifications.addError(error.message);
    subscriptions.dispose();
  });
}

export function removeCoverage() {
  return Promise.coroutine(function* () {
    if (lcovWatcher) {
      lcovWatcher.unwatch();
    }

    const editors = atom.workspace.getTextEditors();

    for (const editor of editors) {
      yield removeMarkers(editor);
    }
  })()
  .catch((error) => {
    if (lcovWatcher) {
      lcovWatcher.unwatch();
    }
    console.log(error);
  });
}
