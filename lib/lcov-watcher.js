import chokidar from 'chokidar';
import { updateCoverage } from './coverage';

export default class LcovWatcher {
  constructor(editor, lcovPath, subscriptions) {
    this.watcher = null;
    this.editor = editor;
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
        updateCoverage(this.lcovPath, this.subscriptions);
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
