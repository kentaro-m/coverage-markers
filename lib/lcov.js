'use babel';

/* global atom */

import Promise from 'bluebird';
import { Report } from '@cedx/lcov';
import { InvalidLcovInfoFormatError, NotFoundLcovFileError } from './error';
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

    return yield Promise.reject(new NotFoundLcovFileError('lcov file could not be found.'));
  })()
  .catch((error) => {
    return Promise.reject(new Error('lcov file could not be found.'));
  });
}

export function readLcovFile(lcovPath) {
  return new Promise((resolve, reject) => {
    fs.readFileAsync(lcovPath, 'utf8')
    .then((data) => {
      resolve(data);
    })
    .catch((error) => {
      reject(new NotFoundLcovFileError('lcov file could not be found.'));
    });
  });
}

export function parseLcovInfo(lcovInfo) {
  return new Promise((resolve, reject) => {
    try {
      const report = Report.parse(lcovInfo);
      const coverage = report.toJSON();
      const records = coverage.records;
      resolve(records);
    } catch (error) {
      reject(new InvalidLcovInfoFormatError('does not conform to the expected format for a lcov info'));
    }
  });
}

export function getTargetLcovInfo(editorPath, lcovInfo) {
  return new Promise((resolve) => {
    const targetLcovInfo = lcovInfo.filter((record, index) => {
      if (editorPath === record.sourceFile) return true;
    });
    resolve(targetLcovInfo);
  });
}

function addMarkers(editor, linesInfo) {
  return new Promise((resolve) => {
    const marker = new Marker(editor);
    linesInfo.filter((line, index) => {
      if (line.executionCount === 0) {
        marker.addTestUncovered(line.lineNumber);
      } else {
        marker.addTestCovered(line.lineNumber);
      }
    });
    resolve();
  });
}

export function removeMarkers(editor) {
  return new Promise((resolve) => {
    const marker = new Marker(editor);
    marker.remove();
    resolve();
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
