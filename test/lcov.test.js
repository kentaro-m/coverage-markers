import Promise from 'bluebird';
import fs from 'fs';
import sinon from 'sinon';
import { TextEditor } from 'atom';
import * as Lcov from '../lib/lcov';

const {
  readLcovFile,
  findLcovFilePath,
  parseLcovFile,
  addMarkers,
  deleteMarkers,
  renderMarkers,
} = Lcov;
const glob = require('glob');

/* global describe, it, beforeEach, afterEach, before, after, assert */

describe('Lcov', () => {
  describe('findLcovFilePath', () => {
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

    it('Get the lcov path, when the lcov file is found', () => {
      globStub.callsFake(() => {
        return Promise.resolve(dummyValidFileList);
      });

      return assert.eventually.equal(findLcovFilePath('/test-project'), '/test-project/app/coverage/lcov.info');
    });

    it('Throw error, when the lcov file is not found', () => {
      globStub.callsFake(() => {
        return Promise.resolve([]);
      });

      return assert.isRejected(findLcovFilePath('/test-project'), 'Lcov path could not be found.');
    });
  });

  describe('readLcovFile', () => {
    let readdirAsyncStub;

    before(() => {
      readdirAsyncStub = sinon.stub(fs, 'readdirAsync').returns(new Error('no such file or directory'));
    });

    after(() => {
      readdirAsyncStub.restore();
    });

    it('Throw error, when lcov file can not be read', () => {
      return assert.isRejected(readLcovFile('hoge'), 'Lcov file could not be read.');
    });
  });

  describe('parseLcovFile', () => {
    it.skip('Lcov object returns, when the lcov info is valid', () => {
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

    it('Throw error, when the lcov info is invalid', () => {
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

  describe('addMarkers', () => {
    let editor;

    before(() => {
      editor = new TextEditor();
    });

    it('Add markers based on lines statement', () => {
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

  describe('deleteMarkers', () => {
    let editor;

    before(() => {
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

    it('Delete all markers associated with the editor', () => {
      deleteMarkers(editor);
      const markers = editor.getMarkers();
      assert.equal(markers.length, 0);
    });
  });

  describe('renderMarkers', () => {
    let editor;
    let lcovInfo;

    before(() => {
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

    it('Markers can be displayed to the editor', () => {
      renderMarkers(editor, lcovInfo);
      const markers = editor.getMarkers();
      assert.isAbove(markers.length, 0);
    });
  });
});
