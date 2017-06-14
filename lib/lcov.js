'use babel';

import { Report } from '@cedx/lcov';
import { InvalidLcovInfoFormatException, NotFoundLcovFileException } from './error';
import { readFileSync } from 'fs';
import Marker from './marker';

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

export function showCoverage(editor, lcovPath) {
  const lcovInfo = readLcovFile(lcovPath);
  const records = parseLcovInfo(lcovInfo);
  const targetLcovInfo = getTargetLcovInfo(editor.getPath(), records);

  const linesInfo = targetLcovInfo['0'].lines.data;
  addMarkers(editor, linesInfo);
}
