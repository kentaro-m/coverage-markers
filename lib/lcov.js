'use babel';

/* global atom */

import Promise from 'bluebird';
import { Report } from '@cedx/lcov';
// import { InvalidLcovInfoFormatError, NotFoundLcovFileError } from './error';
import Marker from './marker';
import path from 'path';

const fs = Promise.promisifyAll(require('fs'));

function searchLcovPath(dirPath) {
  return Promise.coroutine(function *() {
    if (dirPath.match(/.+(node_modules|\.git).+/)) {
      return yield Promise.resolve();
    }

    const files = yield fs.readdirAsync(dirPath);
    for (const dir of files) {
      const filePath = path.join(dirPath, dir);
      if (fs.statSync(filePath).isDirectory()) {
        yield searchLcovPath(filePath);
      } else {
        if (filePath.match(/.+lcov.info/)) {
          return yield Promise.resolve(filePath);
        }
      }
    }

    return yield Promise.resolve();
  })()
  .catch((error) => {
    return Promise.reject(new Error('lcov path could not be found.'));
  });
}

export function getLcovPath() {
  return Promise.coroutine(function *() {
    const paths = atom.project.getPaths();

    const files = yield fs.readdirAsync(paths[0]);
    let lcovPath;
    for (const dirName of files) {
      const dirPath = path.join(paths[0], dirName);
      if (fs.statSync(dirPath).isDirectory()) {
        lcovPath = yield searchLcovPath(dirPath);
      }
      if (lcovPath) {
        return lcovPath;
      }
    }

    return yield Promise.reject(new Error('lcov path could not be found.'));
  })()
  .catch((error) => {
    return Promise.reject(new Error('lcov path could not be found.'));
  });
}

export function readLcovFile(lcovPath) {
  return Promise.coroutine(function *() {
    return yield fs.readFileAsync(lcovPath, 'utf8');
  })()
  .catch((error) => {
    return Promise.reject(new Error('lcov file could not be read.'));
  });
}

export function parseLcovInfo(lcovInfo) {
  return Promise.coroutine(function *() {
    const report = Report.parse(lcovInfo);
    const coverage = report.toJSON();
    const records = coverage.records;
    return yield Promise.resolve(records);
  })()
  .catch((error) => {
    return Promise.reject(new Error('does not conform to the expected format for a lcov info'));
  });
}

export function getTargetLcovInfo(editorPath, lcovInfo) {
  return Promise.coroutine(function *() {
    const targetLcovInfo = lcovInfo.filter((record, index) => {
      if (editorPath === record.sourceFile) return true;
    });
    return yield Promise.resolve(targetLcovInfo);
  })()
  .catch((error) => {
    return Promise.reject(new Error('target lcov info could not be found.'));
  });
}

function addMarkers(editor, linesInfo) {
  return Promise.coroutine(function *() {
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
    return Promise.reject(new Error('failed to add markers'));
  });
}

export function removeMarkers(editor) {
  return Promise.coroutine(function *() {
    const marker = new Marker(editor);
    marker.remove();
    return yield Promise.resolve();
  })()
  .catch((error) => {
    return Promise.reject(new Error('failed to delete markers'));
  });
}

export function renderCoverage(editor, targetLcovInfo) {
  return Promise.coroutine(function *() {
    if (Object.keys(targetLcovInfo).length > 0) {
      const linesInfo = targetLcovInfo['0'].lines.data;
      yield removeMarkers(editor);
      yield addMarkers(editor, linesInfo);
    }
    return yield Promise.resolve();
  })()
  .catch((error) => {
    return Promise.reject(new Error('coverage could not be rendered.'));
  });
}
