import Promise from 'bluebird';
import sinon from 'sinon';
import * as CoverageReport from '../lib/coverage-report';

const {
  findCoverageReportFilePath,
} = CoverageReport;

const glob = require('glob');

/* global describe, it, beforeEach, afterEach, assert */

describe('CoverageReport', () => {
  describe('findCoverageReportFilePath', () => {
    let globStub;

    const dummyValidFileList = [
      '/test-project/app/coverage/lcov.info',
    ];

    beforeEach(() => {
      globStub = sinon.stub(glob, 'globAsync');
    });

    afterEach(() => {
      globStub.restore();
    });

    it('Get the coverage report path, when the coverage report is found', () => {
      globStub.callsFake(() => {
        return Promise.resolve(dummyValidFileList);
      });

      return assert.eventually.equal(findCoverageReportFilePath('/test-project'), '/test-project/app/coverage/lcov.info');
    });

    it('Throw error, when the coverage report is not found', () => {
      globStub.callsFake(() => {
        return Promise.resolve([]);
      });

      return assert.isRejected(findCoverageReportFilePath('/test-project'), 'coverage report file path could not be found.');
    });
  });
});
