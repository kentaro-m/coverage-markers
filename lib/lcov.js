'use babel';

import { Report } from '@cedx/lcov';
import { InvalidLcovInfoFormatException, NotFoundLcovFileException } from './error';
import { readFileSync } from 'fs';
import Marker from './marker';

export function readLcovFile(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    throw new NotFoundLcovFileException();
  }
}

export function parseLcovInfo(lcovInfo) {
  try {
    const report = Report.parse(lcovInfo);
    const coverage = report.toJSON();
    const records = coverage.records;
    return records;
  } catch (error) {
    throw new InvalidLcovInfoFormatException();
  }
}

export function getTargetLcovInfo(editorPath, lcovInfo) {
  return lcovInfo.filter((record, index) => {
    if (editorPath === record.sourceFile) return true;
  });
}

export function addMarkers(editor, linesInfo) {
  const marker = new Marker(editor);
  linesInfo.filter((line, index) => {
    if (line.executionCount === 0) {
      marker.addTestUncovered(line.lineNumber);
    } else {
      marker.addTestCovered(line.lineNumber);
    }
  });
}
