import Promise from 'bluebird';
import sinon from 'sinon';
import { TextEditor } from 'atom';
import Marker from '../lib/marker';
import * as CoverageReport from '../lib/coverage-report';

const {
  findCoverageReportFilePath,
  removeCoverage,
  findCoverageReportForActiveEditor,
  readCoverageReportFile,
  convertCoverageReportForVisibleEditors,
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

    it('Throw the error, when the coverage report is not found', () => {
      globStub.callsFake(() => {
        return Promise.resolve([]);
      });

      return assert.isRejected(findCoverageReportFilePath('/test-project'), 'coverage report file path could not be found.');
    });
  });

  describe('readCoverageReportFile', () => {
    it('Throw the error, when the coverage file path is invalid', () => {
      assert.isRejected(readCoverageReportFile('/test-project/lcov.info', 'coverage report file could not be read.'));
    });
  });

  describe('convertCoverageReportForVisibleEditors', () => {
    it('Get the coverage report, when the coverage file is valid', async () => {
      const coverageFile = `
        TN:
        SF:/test-project/index.js
        DA:16,0
        DA:17,0
        DA:22,0
        DA:29,0
        DA:33,0
        LF:7
        LH:0
        BRF:0
        BRH:0
        end_of_record`;

        const coverageReport = convertCoverageReportForVisibleEditors(coverageFile);
        assert.equal(coverageReport[0].sourceFile, '/test-project/index.js');
    });

    it('Throw the error, when the coverage file is invalid', () => {
      const coverageFile = `
        TN:
        DA:16,0
        DA:17,0
        DA:22,0
        DA:29,0
        DA:33,0
        LF:7
        LH:0
        BRF:0
        BRH:0
        end_of_record`;

        assert.throws(() => {
          convertCoverageReportForVisibleEditors(coverageFile);
        }, 'coverage report could not be converted.');
    });
  });

  describe('findCoverageReportForActiveEditor', () => {
    it('Get the coverage report for active editor, when the coverage report is valid', () => {
      const coverageRecords = [
        {
          sourceFile: '/test-project/foo.js',
          lines: {
            data: [
              { checksum: '', executionCount: 0, lineNumber: 16 },
              { checksum: '', executionCount: 1, lineNumber: 17 },
              { checksum: '', executionCount: 0, lineNumber: 22 },
              { checksum: '', executionCount: 1, lineNumber: 29 },
              { checksum: '', executionCount: 0, lineNumber: 33 },
            ],
          },
        },
        {
          sourceFile: '/test-project/bar.js',
          lines: {
            data: [
              { checksum: '', executionCount: 0, lineNumber: 16 },
              { checksum: '', executionCount: 1, lineNumber: 17 },
              { checksum: '', executionCount: 0, lineNumber: 22 },
              { checksum: '', executionCount: 1, lineNumber: 29 },
              { checksum: '', executionCount: 0, lineNumber: 33 },
            ],
          },
        },
      ];

      const result = findCoverageReportForActiveEditor('/test-project/bar.js', coverageRecords);
      assert.equal(result[0].sourceFile, '/test-project/bar.js');
    });
  });

  describe('removeCoverage', () => {
    let editor;

    beforeEach(async () => {
      editor = new TextEditor();
      const marker = new Marker(editor);
      marker.addTestCovered(2);
      marker.addTestUncovered(5);
    });

    it('Remove all markers from visible editors.', () => {
      removeCoverage(editor);
      const markers = editor.getMarkers();
      assert.equal(markers.length, 0);
    });
  });
});
