import chokidar from 'chokidar';
import { CompositeDisposable } from 'event-kit';
import { renderCoverageMarkers } from './coverage-report';

/* global atom */

export default class CoverageReportWatcher {
  constructor() {
    this.watcher = null;
    this.watcherSubscriptions = new CompositeDisposable();
  }

  watch(coverageFilePath) {
    if (this.watcher) {
      this.unwatch();
    }

    if (coverageFilePath) {
      const options = {
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 100,
        },
      };

      this.watcher = chokidar
      .watch(coverageFilePath, options)
      .on('change', () => {
        const editors = atom.workspace.getTextEditors();

        editors.forEach(async (editor) => {
          await renderCoverageMarkers(editor, coverageFilePath);
        });
      });
    }
  }

  unwatch() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
