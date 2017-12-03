/* global atom */

import { findCoverageFilePath, readCoverageFile, parseCoverageFile, findCoverageDataForActiveEditor } from './coverage-file';
import createWatcher from './utils';
import Marker from './marker';
import CoverageMarkersView from './coverage-markers-view';

export default class Coverage {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.coverageFilePath = '';
    this.coverageReport = {};
    this.coverageReportWatcher = null;
  }

  async loadFromProjectPath() {
    try {
      this.coverageFilePath = await findCoverageFilePath(this.projectPath);
      const coverageFile = await readCoverageFile(this.coverageFilePath);
      this.coverageReport = parseCoverageFile(coverageFile);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async loadFromCoveragePath() {
    try {
      const coverageFile = await readCoverageFile(this.coverageFilePath);
      this.coverageReport = parseCoverageFile(coverageFile);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  show(editor) {
    try {
      const results = findCoverageDataForActiveEditor(editor.getPath(), this.coverageReport);

      if (results.length > 0) {
        CoverageMarkersView.enableGutterStyle(editor);
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
          await this.loadFromCoveragePath();
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
