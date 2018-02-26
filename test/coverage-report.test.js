import Promise from 'bluebird';
import sinon from 'sinon';
import { TextEditor } from 'atom';
import Marker from '../lib/marker';
import * as CoverageReport from '../lib/coverage-file';

const {
  findCoverageFilePath,
  removeMarkers,
  findCoverageDataForActiveEditor,
  readCoverageFile,
  parseCoverageFile,
} = CoverageReport;

const glob = require('glob');

/* global describe, it, beforeEach, afterEach, assert */

describe('CoverageReport', () => {
  describe('findCoverageFilePath', () => {
    let globStub;

    const dummyValidFileList = ['/test-project/app/coverage/lcov.info'];

    beforeEach(() => {
      globStub = sinon.stub(glob, 'globAsync');
    });

    afterEach(() => {
      globStub.restore();
    });

    it('Get the coverage path, when the coverage file is found', () => {
      globStub.callsFake(() => {
        return Promise.resolve(dummyValidFileList);
      });

      return assert.eventually.equal(
        findCoverageFilePath('/test-project'),
        '/test-project/app/coverage/lcov.info'
      );
    });

    it('Throw the error, when the coverage file is not found', () => {
      globStub.callsFake(() => {
        return Promise.resolve([]);
      });

      return assert.isRejected(
        findCoverageFilePath('/test-project'),
        'coverage file path could not be found.'
      );
    });
  });

  describe('readCoverageFile', () => {
    it('Throw the error, when the coverage file path is invalid', () => {
      assert.isRejected(
        readCoverageFile(
          '/test-project/lcov.info',
          'coverage file could not be read.'
        )
      );
    });
  });

  describe('parseCoverageFile', () => {
    it('Get the coverage data, when the coverage file is valid', async () => {
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

      const coverageReport = parseCoverageFile(coverageFile);
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
        parseCoverageFile(coverageFile);
      }, 'coverage file could not be parsed.');
    });
  });

  describe('findCoverageDataForActiveEditor', () => {
    it('Get the coverage data for active editor, when the coverage file is valid', () => {
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

      const result = findCoverageDataForActiveEditor(
        '/test-project/bar.js',
        coverageRecords
      );
      assert.equal(result[0].sourceFile, '/test-project/bar.js');
    });
  });

  describe('removeMarkers', () => {
    let editor;

    beforeEach(async () => {
      editor = new TextEditor();
      const marker = new Marker(editor);
      marker.addTestCovered(2);
      marker.addTestUncovered(5);
    });

    it('Remove all markers from visible editors.', () => {
      removeMarkers(editor);
      const markers = editor.getMarkers();
      assert.equal(markers.length, 0);
    });
  });
});
