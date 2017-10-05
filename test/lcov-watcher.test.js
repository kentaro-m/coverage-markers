import LcovWatcher from '../lib/lcov-watcher';
import { TextEditor } from 'atom';
import path from 'path';

/* global describe, it, beforeEach, assert */

describe('LcovWatcher', () => {
  let editor;

  beforeEach(() => {
    editor = new TextEditor();
  });

  it('Create LcovWatcher instance', () => {
    const lcovPath = path.resolve(__dirname, 'fixture/dummy_lcov.info');
    const lcovWatcher = new LcovWatcher(editor, lcovPath);
    assert.instanceOf(lcovWatcher, LcovWatcher);
  });

  it('Watch the Lcov file', () => {
    const lcovPath = path.resolve(__dirname, 'fixture/dummy_lcov.info');
    const lcovWatcher = new LcovWatcher(editor, lcovPath);
    lcovWatcher.watch();
    assert.isNotNull(lcovWatcher.watcher);
    lcovWatcher.unwatch();
  });

  it('Unwatch the Lcov file', () => {
    const lcovPath = path.resolve(__dirname, 'fixture/dummy_lcov.info');
    const lcovWatcher = new LcovWatcher(editor, lcovPath);
    lcovWatcher.watch();
    lcovWatcher.unwatch();
    assert.isNull(lcovWatcher.watcher);
  });
});
