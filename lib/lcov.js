'use babel';

/* global atom */

import Promise from 'bluebird';
import { Report } from '@cedx/lcov';
import path from 'path';
import Marker from './marker';

const fs = Promise.promisifyAll(require('fs'));

function getFileList(projectPath) {
  return fs.readdirAsync(projectPath)
  .then((dirList) => {
    return Promise.all(dirList.map((file) => {
      const filePath = path.join(projectPath, file);
      return fs.statAsync(filePath)
      .then((stat) => {
        if (stat.isDirectory() && !(filePath.match(/node_modules/))) {
          return getFileList(filePath);
        }

        return Promise.resolve(filePath);
      });
    }));
  })
  .then((fileList) => {
    return Promise.resolve(Array.prototype.concat.apply([], fileList));
  })
  .catch((error) => {
    return Promise.reject(new Error('Failed to create file list.'));
  });
}

export function getLcovPath() {
  return Promise.coroutine(function* () {
    const paths = atom.project.getPaths();

    const fileList = yield getFileList(paths[0]);

    const lcovPath = fileList.filter((filePath, index) => {
      if (filePath.match(/.+lcov\.info/)) return true;
    });

    if (lcovPath.length > 0) {
      return Promise.resolve(lcovPath[0]);
    }

    return Promise.reject();
  })()
  .catch((error) => {
    return Promise.reject(new Error('Lcov path could not be found.'));
  });
}

export function readLcovFile(lcovPath) {
  return Promise.coroutine(function* () {
    return yield fs.readFileAsync(lcovPath, 'utf8');
  })()
  .catch((error) => {
    return Promise.reject(new Error('Lcov file could not be read.'));
  });
}

export function parseLcovInfo(lcovInfo) {
  return Promise.coroutine(function* () {
    const report = Report.parse(lcovInfo);
    const coverage = report.toJSON();
    const records = coverage.records;
    return yield Promise.resolve(records);
  })()
  .catch((error) => {
    return Promise.reject(new Error('Does not conform to the expected format for a lcov info'));
  });
}

export function getTargetLcovInfo(editorPath, lcovInfo) {
  return Promise.coroutine(function* () {
    const targetLcovInfo = lcovInfo.filter((record, index) => {
      if (editorPath === record.sourceFile) return true;
    });
    return yield Promise.resolve(targetLcovInfo);
  })()
  .catch((error) => {
    return Promise.reject(new Error('Target lcov info could not be found.'));
  });
}

function addMarkers(editor, linesInfo) {
  return Promise.coroutine(function* () {
    const marker = new Marker(editor);
    linesInfo.filter((line, index) => {
      if (line.executionCount === 0) {
        marker.addTestUncovered(line.lineNumber);
      } else {
        marker.addTestCovered(line.lineNumber);
      }
    });
    return yield Promise.resolve();
  })()
  .catch((error) => {
    return Promise.reject(new Error('Failed to add markers'));
  });
}

export function removeMarkers(editor) {
  return Promise.coroutine(function* () {
    const marker = new Marker(editor);
    marker.remove();
    return yield Promise.resolve();
  })()
  .catch((error) => {
    return Promise.reject(new Error('Failed to delete markers'));
  });
}

export function renderCoverage(editor, targetLcovInfo) {
  return Promise.coroutine(function* () {
    if (Object.keys(targetLcovInfo).length > 0) {
      const linesInfo = targetLcovInfo['0'].lines.data;
      yield removeMarkers(editor);
      yield addMarkers(editor, linesInfo);
    }
    return yield Promise.resolve();
  })()
  .catch((error) => {
    return Promise.reject(new Error('Coverage could not be rendered.'));
  });
}
