import chokidar from 'chokidar';
import { updateCoverage } from './coverage';

/* global atom */

export default class LcovWatcher {
  constructor(lcovPath, subscriptions) {
    this.watcher = null;
    this.lcovPath = lcovPath;
    this.subscriptions = subscriptions;
  }

  watch() {
    if (this.watcher) {
      this.unwatch();
    }

    if (this.lcovPath) {
      const options = {
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 100,
        },
      };

      this.watcher = chokidar
      .watch(this.lcovPath, options)
      .on('change', () => {
        const editors = atom.workspace.getTextEditors();

        editors.forEach(async (editor) => {
          updateCoverage(editor, this.lcovPath, this.subscriptions);
        });
      })
      .on('error', (error) => {
        console.log(error);
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
