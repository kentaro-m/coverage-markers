/* global atom */

import { findCoverageReportFilePath, readCoverageReportFile, convertCoverageReportForVisibleEditors, findCoverageReportForActiveEditor } from './coverage-report';
import createWatcher from './coverage-report-watcher';
import Marker from './marker';

export default class Coverage {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.coverageFilePath = '';
    this.coverageReport = {};
    this.coverageReportWatcher = null;
  }

  async load() {
    try {
      this.coverageFilePath = await findCoverageReportFilePath(this.projectPath);
      const coverageFile = await readCoverageReportFile(this.coverageFilePath);
      this.coverageReport = convertCoverageReportForVisibleEditors(coverageFile);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  show(editor) {
    try {
      const results = findCoverageReportForActiveEditor(editor.getPath(), this.coverageReport);

      if (results.length > 0) {
        const lines = results['0'].lines.data;
        const marker = new Marker(editor);
        marker.remove();
        lines.forEach((line) => {
          if (line.executionCount === 0) {
            marker.addTestUncovered(line.lineNumber);
          } else {
            marker.addTestCovered(line.lineNumber);
          }
        });
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  watch() {
    try {
      if (this.coverageFilePath) {
        this.coverageReportWatcher = createWatcher(this.coverageFilePath);
        this.coverageReportWatcher.on('change', async () => {
          const coverageFile = await readCoverageReportFile(this.coverageFilePath);
          this.coverageReport = convertCoverageReportForVisibleEditors(coverageFile);
          const editors = atom.workspace.getTextEditors();
          editors.forEach((editor) => {
            this.show(editor);
          });
        });
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  unwatch() {
    try {
      if (this.coverageReportWatcher) {
        this.coverageReportWatcher.close();
        this.coverageReportWatcher = null;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
