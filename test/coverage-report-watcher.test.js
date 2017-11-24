import CoverageReportWatcher from '../lib/coverage-report-watcher';

/* global describe, it, assert */

describe('CoverageReportWatcher', () => {
  it('Create CoverageReportWatcher instance', () => {
    const coverageReportWatcher = new CoverageReportWatcher();
    assert.instanceOf(coverageReportWatcher, CoverageReportWatcher);
  });

  it('Watch the coverage report file', () => {
    const coverageReportWatcher = new CoverageReportWatcher();
    coverageReportWatcher.watch('dummyCoverageReportFilePath');
    assert.isNotNull(coverageReportWatcher.watcher);
    coverageReportWatcher.unwatch();
  });

  it('Unwatch the coverage report file', () => {
    const coverageReportWatcher = new CoverageReportWatcher();
    coverageReportWatcher.watch();
    coverageReportWatcher.unwatch();
    assert.isNull(coverageReportWatcher.watcher);
  });
});
