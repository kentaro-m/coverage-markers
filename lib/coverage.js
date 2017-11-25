/* global atom */

import { findCoverageReportFilePath, renderCoverageMarkers, removeCoverageMarkers } from './coverage-report';
import CoverageReportWatcher from './coverage-report-watcher';
import findActiveProjectPath from './utils';

let coverageReportWatcher = null;

export async function showCoverage(editor) {
  try {
    const projectPath = findActiveProjectPath(editor);
    const coverageFilePath = await findCoverageReportFilePath(projectPath);
    await renderCoverageMarkers(editor, coverageFilePath);
  } catch (error) {
    atom.notifications.addError(error.message);
  }
}

export function hideCoverage(editor) {
  try {
    removeCoverageMarkers(editor);
    if (coverageReportWatcher) {
      coverageReportWatcher.unwatch();
    }
  } catch (error) {
    atom.notifications.addError(error.message);
  }
}

export async function watchCoverage() {
  try {
    const editors = atom.workspace.getTextEditors();
    const projectPath = findActiveProjectPath(editors[0]);
    const coverageFilePath = await findCoverageReportFilePath(projectPath);
    coverageReportWatcher = new CoverageReportWatcher();
    coverageReportWatcher.watch(coverageFilePath);
  } catch (error) {
    atom.notifications.addError(error.message);
  }
}
