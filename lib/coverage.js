'use babel';

/* global atom */

import Promise from 'bluebird';
import { getLcovPath, readLcovFile, parseLcovInfo, getTargetLcovInfo, renderCoverage, removeMarkers } from './lcov';
import LcovWatcher from './lcov-watcher';
import { InvalidLcovInfoFormatError, NotFoundLcovFileError } from './error';

export default class Coverage {
  constructor() {
    this.lcovWatcher = null;
  }

  display() {
    atom.workspace.observeTextEditors((editor) => {
      return Promise.coroutine(function *() {
        const lcovPath = yield getLcovPath();
        const lcovInfo = yield readLcovFile(lcovPath);
        const records = yield parseLcovInfo(lcovInfo);
        const targetLcovInfo = yield getTargetLcovInfo(editor.getPath(), records);
        yield renderCoverage(editor, targetLcovInfo);

        this.lcovWatcher = new LcovWatcher(editor, lcovPath);
        this.lcovWatcher.watch();
      })()
      .catch(InvalidLcovInfoFormatError, (error) => {
        atom.notifications.addError(error.message);
      })
      .catch(NotFoundLcovFileError, (error) => {
        atom.notifications.addError(error.message);
      })
      .catch((error) => {
        atom.notifications.addError(error.message);
      });
    });
  }

  update(lcovPath) {
    atom.workspace.observeTextEditors((editor) => {
      return Promise.coroutine(function *() {
        const lcovInfo = yield readLcovFile(lcovPath);
        const records = yield parseLcovInfo(lcovInfo);
        const targetLcovInfo = yield getTargetLcovInfo(editor.getPath(), records);
        yield renderCoverage(editor, targetLcovInfo);
      })()
      .catch((error) => {
        atom.notifications.addError(error.message);
      });
    });
  }

  remove() {
    return Promise.coroutine(function *() {
      if (this.lcovWatcher) {
        this.lcovWatcher.unwatch();
      }

      const editors = atom.workspace.getTextEditors();

      for (const editor of editors) {
        yield removeMarkers(editor);
      }
    })()
    .catch((error) => {
      console.log(error);
    });
  }
}
