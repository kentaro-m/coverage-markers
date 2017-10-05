import Promise from 'bluebird';
import path from 'path';
import fs from 'fs';
import sinon from 'sinon';
import { TextEditor } from 'atom';
import * as Lcov from '../lib/lcov';

const { getFileList, readLcovFile, findLcovFilePath, parseLcovFile, addMarkers, deleteMarkers, renderMarkers } = Lcov;

/* global atom, describe, it, beforeEach, afterEach, before, after, assert */

describe('Lcov', function () {

  describe('getFileList', function () {
    beforeEach(function () {
      atom.project.addPath(path.resolve(__dirname, '../'));
    });

    it('Get project file list, when file list can be created', function () {
      const paths = atom.project.getPaths();

      return assert.eventually.isArray(getFileList(paths[0]));
    });

    it('Throw error, when file list can not be created', function () {
      return assert.isRejected(getFileList('hoge'), 'Failed to create file list.');
    });
  });

  describe.skip('findLcovFilePath', function () {
    let getFileListStub;

    const dummyValidFileList = [
      '/coverage-report/README.md',
      '/coverage-report/coverage/lcov.info',
      '/coverage-report/lib/coverage-markers.js',
      '/coverage-report/lib/coverage.js',
      '/coverage-report/lib/lcov-watcher.js',
      '/coverage-report/lib/lcov.js',
      '/coverage-report/lib/marker.js',
    ];

    const dummyInvalidFileList = [
      '/coverage-report/README.md',
      '/coverage-report/lib/coverage-markers.js',
      '/coverage-report/lib/coverage.js',
      '/coverage-report/lib/lcov-watcher.js',
      '/coverage-report/lib/lcov.js',
      '/coverage-report/lib/marker.js',
    ];

    beforeEach(function () {
      atom.project.addPath(path.resolve(__dirname, '../'));
      getFileListStub = sinon.stub(Lcov, 'getFileList');
    });

    afterEach(function () {
      getFileListStub.restore();
    });

    it('Get the lcov path, when the lcov file is found', function () {
      // NOTE: Can not create a stub for getFileList
      getFileListStub.onFirstCall().callsFake(function () {
        return Promise.resolve(Array.prototype.concat.apply([], dummyValidFileList));
      });

      return assert.eventually.equal(findLcovFilePath(), '/coverage-report/coverage/lcov.info');
    });

    it('Throw error, when the lcov file is not found', function () {
      // NOTE: Can not create a stub for getFileList
      getFileListStub.onFirstCall().callsFake(function () {
        return Promise.resolve(Array.prototype.concat.apply([], dummyInvalidFileList));
      });

      return assert.isRejected(findLcovFilePath(), 'Lcov path could not be found.');
    });
  });

  describe('readLcovFile', function () {
    let readdirAsyncStub;

    before(function () {
      readdirAsyncStub = sinon.stub(fs, 'readdirAsync').returns(new Error('no such file or directory'));
    });

    after(function () {
      readdirAsyncStub.restore();
    });

    it('Throw error, when lcov file can not be read', function () {
      return assert.isRejected(readLcovFile('hoge'), 'Lcov file could not be read.');
    });
  });

  describe('parseLcovFile', function () {
    it.skip('Lcov object returns, when the lcov info is valid', function () {
      const dummyLcovInfo = `
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

      return assert.isArray(parseLcovFile(dummyLcovInfo));
    });

    it('Throw error, when the lcov info is invalid', function () {
      const dummyLcovInfo = `
      DA:0
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
        parseLcovFile(dummyLcovInfo);
      }, 'Does not conform to the expected format for a lcov info');
    });
  });

  describe('addMarkers', function () {
    let editor;

    before(function () {
      editor = new TextEditor();
    });

    it('Add markers based on lines statement', function () {
      const linesData = [
        { checksum: '', executionCount: 0, lineNumber: 16 },
        { checksum: '', executionCount: 1, lineNumber: 17 },
        { checksum: '', executionCount: 0, lineNumber: 22 },
        { checksum: '', executionCount: 1, lineNumber: 29 },
        { checksum: '', executionCount: 0, lineNumber: 33 },
      ];

      addMarkers(editor, linesData);
      const markers = editor.getMarkers();
      assert.isAbove(markers.length, 0);
    });
  });

  describe('deleteMarkers', function () {
    let editor;

    before(function () {
      editor = new TextEditor();
      const linesData = [
        { checksum: '', executionCount: 0, lineNumber: 16 },
        { checksum: '', executionCount: 1, lineNumber: 17 },
        { checksum: '', executionCount: 0, lineNumber: 22 },
        { checksum: '', executionCount: 1, lineNumber: 29 },
        { checksum: '', executionCount: 0, lineNumber: 33 },
      ];

      return addMarkers(editor, linesData);
    });

    it('Delete all markers associated with the editor', function () {
      deleteMarkers(editor);
      const markers = editor.getMarkers();
      assert.equal(markers.length, 0);
    });
  });

  describe('renderMarkers', function () {
    let editor;
    let lcovInfo;

    before(function () {
      editor = new TextEditor();
      lcovInfo = [
        {
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
    });

    it('Markers can be displayed to the editor', function () {
      renderMarkers(editor, lcovInfo);
      const markers = editor.getMarkers();
      assert.isAbove(markers.length, 0);
    });
  });
});
