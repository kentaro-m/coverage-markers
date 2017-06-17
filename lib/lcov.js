'use babel';

import { readFileSync } from 'fs';
import { Report } from '@cedx/lcov';
import { InvalidLcovInfoFormatException, NotFoundLcovFileException } from './error';
import Marker from './marker';

export function searchLcovPath() {
  const paths = atom.project.getPaths();
  const lcovPath = `${paths[0]}/coverage/lcov.info`;
  return lcovPath;
}

function readLcovFile(lcovPath) {
  try {
    return readFileSync(lcovPath, 'utf8');
  } catch (error) {
    throw new NotFoundLcovFileException();
  }
}

function parseLcovInfo(lcovInfo) {
  try {
    const report = Report.parse(lcovInfo);
    const coverage = report.toJSON();
    const records = coverage.records;
    return records;
  } catch (error) {
    throw new InvalidLcovInfoFormatException();
  }
}

function getTargetLcovInfo(editorPath, lcovInfo) {
  return lcovInfo.filter((record, index) => {
    if (editorPath === record.sourceFile) return true;
  });
}

function addMarkers(editor, linesInfo) {
  const marker = new Marker(editor);
  linesInfo.filter((line, index) => {
    if (line.executionCount === 0) {
      marker.addTestUncovered(line.lineNumber);
    } else {
      marker.addTestCovered(line.lineNumber);
    }
  });
}

export function removeMarkers(editor) {
  const marker = new Marker(editor);
  marker.remove();
}

export function showCoverage(editor) {
  const lcovPath = searchLcovPath();
  const lcovInfo = readLcovFile(lcovPath);
  const records = parseLcovInfo(lcovInfo);
  const targetLcovInfo = getTargetLcovInfo(editor.getPath(), records);
  const linesInfo = targetLcovInfo['0'].lines.data;
  addMarkers(editor, linesInfo);
}
