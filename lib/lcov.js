'use babel';

import { Report } from '@cedx/lcov';
import { InvalidLcovInfoFormatError, NotFoundLcovFileError } from './error';
import Marker from './marker';
import Promise from 'bluebird';
const readFile = Promise.promisify(require('fs').readFile);

export function searchLcovPath() {
  const paths = atom.project.getPaths();
  const lcovPath = `${paths[0]}/coverage/lcov.info`;
  return lcovPath;
}

function readLcovFile(lcovPath) {
  return new Promise((resolve, reject) => {
    readFile(lcovPath, 'utf8')
    .then((data) => {
      resolve(data);
    })
    .catch((error) => {
      reject(new NotFoundLcovFileError('lcov file could not be found.'));
    });
  });
}

function parseLcovInfo(lcovInfo) {
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

function getTargetLcovInfo(editorPath, lcovInfo) {
  return new Promise((resolve, reject) => {
    const targetLcovInfo = lcovInfo.filter((record, index) => {
      if (editorPath === record.sourceFile) return true;
    });
    resolve(targetLcovInfo);
  });
}

function addMarkers(editor, linesInfo) {
  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
    const marker = new Marker(editor);
    marker.remove();
    resolve();
  });
}

export function showCoverage(editor) {
  return new Promise((resolve, reject) => {
    const lcovPath = searchLcovPath();

    return readLcovFile(lcovPath)
    .then((lcovInfo) => {
      return parseLcovInfo(lcovInfo);
    })
    .then((records) => {
      return getTargetLcovInfo(editor.getPath(), records);
    })
    .then((targetLcovInfo) => {
      const linesInfo = targetLcovInfo['0'].lines.data;
      addMarkers(editor, linesInfo);
    })
    .catch((error) => {
      reject(error);
    });
  });
}
