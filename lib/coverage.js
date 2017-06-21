'use babel';

/* global atom */

import Promise from 'bluebird';
import { getLcovPath, readLcovFile, parseLcovInfo, getTargetLcovInfo, renderCoverage, removeMarkers } from './lcov';
import LcovWatcher from './lcov-watcher';
// import { InvalidLcovInfoFormatError, NotFoundLcovFileError } from './error';

let lcovWatcher;

export function displayCoverage() {
  atom.workspace.observeTextEditors((editor) => {
    return Promise.coroutine(function *() {
      const lcovPath = yield getLcovPath();
      const lcovInfo = yield readLcovFile(lcovPath);
      const records = yield parseLcovInfo(lcovInfo);
      const targetLcovInfo = yield getTargetLcovInfo(editor.getPath(), records);
      yield renderCoverage(editor, targetLcovInfo);

      lcovWatcher = new LcovWatcher(editor, lcovPath);
      lcovWatcher.watch();
    })()
    .catch((error) => {
      atom.notifications.addError(error.message);
    });
  });
}

export function updateCoverage(lcovPath) {
  atom.workspace.observeTextEditors((editor) => {
    return Promise.coroutine(function *() {
      const lcovInfo = yield readLcovFile(lcovPath);
      const records = yield parseLcovInfo(lcovInfo);
      const targetLcovInfo = yield getTargetLcovInfo(editor.getPath(), records);
      yield renderCoverage(editor, targetLcovInfo);
    })()
    .catch((error) => {
      atom.notifications.addError(error.message);
    });
  });
}

export function removeCoverage() {
  return Promise.coroutine(function *() {
    if (lcovWatcher) {
      lcovWatcher.unwatch();
    }

    const editors = atom.workspace.getTextEditors();

    for (const editor of editors) {
      yield removeMarkers(editor);
    }
  })()
  .catch((error) => {
    console.log(error);
  });
}
