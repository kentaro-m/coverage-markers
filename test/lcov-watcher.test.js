import path from 'path';
import { CompositeDisposable } from 'event-kit';

import LcovWatcher from '../lib/lcov-watcher';

/* global describe, it, beforeEach, assert */

describe('LcovWatcher', () => {
  let subscriptions;

  beforeEach(() => {
    subscriptions = new CompositeDisposable();
  });

  it('Create LcovWatcher instance', () => {
    const lcovPath = path.resolve(__dirname, 'fixture/dummy_lcov.info');
    const lcovWatcher = new LcovWatcher(lcovPath, subscriptions);
    assert.instanceOf(lcovWatcher, LcovWatcher);
  });

  it('Watch the Lcov file', () => {
    const lcovPath = path.resolve(__dirname, 'fixture/dummy_lcov.info');
    const lcovWatcher = new LcovWatcher(lcovPath, subscriptions);
    lcovWatcher.watch();
    assert.isNotNull(lcovWatcher.watcher);
    lcovWatcher.unwatch();
  });

  it('Unwatch the Lcov file', () => {
    const lcovPath = path.resolve(__dirname, 'fixture/dummy_lcov.info');
    const lcovWatcher = new LcovWatcher(lcovPath, subscriptions);
    lcovWatcher.watch();
    lcovWatcher.unwatch();
    assert.isNull(lcovWatcher.watcher);
  });
});
