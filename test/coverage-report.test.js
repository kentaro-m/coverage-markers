import Promise from 'bluebird';
import sinon from 'sinon';
import { TextEditor } from 'atom';
import { findCoverageReportFilePath, renderCoverageMarkers, removeCoverageMarkers, __RewireAPI__ as CoverageReportRewireAPI } from '../lib/coverage-report';

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

  describe('renderCoverageMarkers', () => {
    beforeEach(() => {
      CoverageReportRewireAPI.__Rewire__('readCoverageReportFile', () => {
        return Promise.resolve('hoge');
      });

      const coverageRecords = [{
        sourceFile: '/test-project/index.js',
        lines: {
          data: [
            { checksum: '', executionCount: 0, lineNumber: 16 },
            { checksum: '', executionCount: 1, lineNumber: 17 },
            { checksum: '', executionCount: 0, lineNumber: 22 },
            { checksum: '', executionCount: 1, lineNumber: 29 },
            { checksum: '', executionCount: 0, lineNumber: 33 },
          ],
        },
      }];

      CoverageReportRewireAPI.__Rewire__('convertCoverageReportForVisibleEditors', () => {
        return coverageRecords;
      });

      CoverageReportRewireAPI.__Rewire__('findCoverageReportForActiveEditor', () => {
        return coverageRecords;
      });
    });

    afterEach(() => {
      CoverageReportRewireAPI.__ResetDependency__('readCoverageReportFile');
      CoverageReportRewireAPI.__ResetDependency__('convertCoverageReportForVisibleEditors');
      CoverageReportRewireAPI.__ResetDependency__('findCoverageReportForActiveEditor');
    });

    it('Render markers based on the active editor.', async () => {
      const editor = new TextEditor();
      await renderCoverageMarkers(editor, 'hoge');
      const markers = editor.getMarkers();
      assert.isAbove(markers.length, 0);
    });
  });

  describe('removeCoverageMarkers', () => {
    let editor;

    beforeEach(async () => {
      CoverageReportRewireAPI.__Rewire__('readCoverageReportFile', () => {
        return Promise.resolve('hoge');
      });

      const coverageRecords = [{
        sourceFile: '/test-project/index.js',
        lines: {
          data: [
            { checksum: '', executionCount: 0, lineNumber: 16 },
            { checksum: '', executionCount: 1, lineNumber: 17 },
            { checksum: '', executionCount: 0, lineNumber: 22 },
            { checksum: '', executionCount: 1, lineNumber: 29 },
            { checksum: '', executionCount: 0, lineNumber: 33 },
          ],
        },
      }];

      CoverageReportRewireAPI.__Rewire__('convertCoverageReportForVisibleEditors', () => {
        return coverageRecords;
      });

      CoverageReportRewireAPI.__Rewire__('findCoverageReportForActiveEditor', () => {
        return coverageRecords;
      });

      editor = new TextEditor();
      await renderCoverageMarkers(editor, 'hoge');
    });

    afterEach(() => {
      CoverageReportRewireAPI.__ResetDependency__('readCoverageReportFile');
      CoverageReportRewireAPI.__ResetDependency__('convertCoverageReportForVisibleEditors');
      CoverageReportRewireAPI.__ResetDependency__('findCoverageReportForActiveEditor');
    });

    it('Remove all markers from visible editors.', () => {
      removeCoverageMarkers(editor);
      const markers = editor.getMarkers();
      assert.equal(markers.length, 0);
    });
  });
});
