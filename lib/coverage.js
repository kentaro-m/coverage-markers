/* global atom */

import { getLcovPath, readLcovFile, parseLcovInfo, getTargetLcovInfo, renderCoverage, removeMarkers } from './lcov';
import LcovWatcher from './lcov-watcher';

let lcovWatcher;

export function displayCoverage(subscriptions) {
  subscriptions.add(
    atom.workspace.observeTextEditors(async function (editor) {
      try {
        const lcovPath = await getLcovPath();
        const lcovInfo = await readLcovFile(lcovPath);
        const records = parseLcovInfo(lcovInfo);
        const targetLcovInfo = getTargetLcovInfo(editor.getPath(), records);
        renderCoverage(editor, targetLcovInfo);

        lcovWatcher = new LcovWatcher(editor, lcovPath, subscriptions);
        lcovWatcher.watch();
      } catch (error) {
        if (lcovWatcher) {
          lcovWatcher.unwatch();
        }
        atom.notifications.addError(error.message);
        subscriptions.dispose();
      }
    })
  );
}

export function updateCoverage(lcovPath, subscriptions) {
  subscriptions.add(
    atom.workspace.observeTextEditors(async function (editor) {
      try {
        const lcovInfo = await readLcovFile(lcovPath);
        const records = parseLcovInfo(lcovInfo);
        const targetLcovInfo = getTargetLcovInfo(editor.getPath(), records);
        renderCoverage(editor, targetLcovInfo);
      } catch (error) {
        if (lcovWatcher) {
          lcovWatcher.unwatch();
        }
        atom.notifications.addError(error.message);
        subscriptions.dispose();
      }
    })
  );
}

export function removeCoverage(subscriptions) {
  try {
    if (lcovWatcher) {
      lcovWatcher.unwatch();
    }

    const editors = atom.workspace.getTextEditors();

    for (const editor of editors) {
      removeMarkers(editor);
    }
    subscriptions.dispose();
  } catch (error) {
    if (lcovWatcher) {
      lcovWatcher.unwatch();
    }
  }
}
