'use babel';

import chokidar from 'chokidar';
import Coverage from './coverage';

export default class LcovWatcher {
  constructor(editor, lcovPath) {
    this.watcher = null;
    this.editor = editor;
    this.lcovPath = lcovPath;
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

      const coverage = new Coverage();

      this.watcher = chokidar
      .watch(this.lcovPath, options)
      .on('change', () => {
        coverage.update(this.lcovPath);
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
