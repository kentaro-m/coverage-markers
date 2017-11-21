/* global atom */

import { findLcovFilePath, readLcovFile, parseLcovFile, findLcovInfo, renderMarkers, deleteMarkers } from './lcov';
import LcovWatcher from './lcov-watcher';

let lcovWatcher;

export async function showCoverage(editor, subscriptions) {
  try {
    const projectPaths = atom.project.getPaths();
    const filePath = editor.getPath();
    const [targetProjectPath] = projectPaths.filter(p => filePath.indexOf(p) > -1);
    const lcovPath = await findLcovFilePath(targetProjectPath);
    const lcovInfo = await readLcovFile(lcovPath);
    const records = parseLcovFile(lcovInfo);
    const results = findLcovInfo(editor.getPath(), records);
    renderMarkers(editor, results);

    lcovWatcher = new LcovWatcher(lcovPath, subscriptions);
    lcovWatcher.watch();
  } catch (error) {
    if (lcovWatcher) {
      lcovWatcher.unwatch();
    }
    atom.notifications.addError(error.message);
    subscriptions.dispose();
  }
}

export async function updateCoverage(editor, lcovPath, subscriptions) {
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
}

export function hideCoverage(editor) {
  try {
    if (lcovWatcher) {
      lcovWatcher.unwatch();
    }
    deleteMarkers(editor);
  } catch (error) {
    if (lcovWatcher) {
      lcovWatcher.unwatch();
    }
  }
}
