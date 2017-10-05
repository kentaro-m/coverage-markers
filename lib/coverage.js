/* global atom */

import { findLcovFilePath, readLcovFile, parseLcovFile, findLcovInfo, renderMarkers, deleteMarkers } from './lcov';
import LcovWatcher from './lcov-watcher';

let lcovWatcher;

export function showCoverage(subscriptions) {
  subscriptions.add(
    atom.workspace.observeTextEditors(async (editor) => {
      try {
        const lcovPath = await findLcovFilePath();
        const lcovInfo = await readLcovFile(lcovPath);
        const records = parseLcovFile(lcovInfo);
        const results = findLcovInfo(editor.getPath(), records);
        renderMarkers(editor, results);

        lcovWatcher = new LcovWatcher(editor, lcovPath, subscriptions);
        lcovWatcher.watch();
      } catch (error) {
        if (lcovWatcher) {
          lcovWatcher.unwatch();
        }
        atom.notifications.addError(error.message);
        subscriptions.dispose();
      }
    }),
  );
}

export function updateCoverage(lcovPath, subscriptions) {
  subscriptions.add(
    atom.workspace.observeTextEditors(async (editor) => {
      try {
        const lcovInfo = await readLcovFile(lcovPath);
        const records = parseLcovFile(lcovInfo);
        const results = findLcovInfo(editor.getPath(), records);
        renderMarkers(editor, results);
      } catch (error) {
        if (lcovWatcher) {
          lcovWatcher.unwatch();
        }
        atom.notifications.addError(error.message);
        subscriptions.dispose();
      }
    }),
  );
}

export function hideCoverage() {
  try {
    if (lcovWatcher) {
      lcovWatcher.unwatch();
    }

    const editors = atom.workspace.getTextEditors();

    for (const editor of editors) {
      deleteMarkers(editor);
    }
  } catch (error) {
    if (lcovWatcher) {
      lcovWatcher.unwatch();
    }
  }
}
