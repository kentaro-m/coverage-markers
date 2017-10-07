
/* global atom */

import Promise from 'bluebird';
import { Report } from '@cedx/lcov';
import Marker from './marker';

const fs = Promise.promisifyAll(require('fs'));
const glob = Promise.promisifyAll(require('glob'));

export async function findLcovFilePath(projectPath) {
  try {
    const ignore = [`${projectPath}/**/node_modules/**`];
    const matchPaths = await glob.globAsync(`${projectPath}/**/lcov.info`, { ignore, dot: false });

    if (matchPaths.length > 0) {
      return matchPaths[0];
    }

    throw new Error('Lcov path could not be found.');
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function readLcovFile(lcovPath) {
  try {
    const lcovFile = await fs.readFileAsync(lcovPath, 'utf8');
    return lcovFile;
  } catch (error) {
    throw new Error('Lcov file could not be read.');
  }
}

export function parseLcovFile(lcovInfo) {
  try {
    const report = Report.fromCoverage(lcovInfo);
    const coverage = report.toJSON();
    return coverage.records;
  } catch (error) {
    throw new Error('Does not conform to the expected format for a lcov info');
  }
}

export function findLcovInfo(editorPath, lcovInfo) {
  try {
    const results = lcovInfo.filter((record, index) => {
      if (editorPath === record.sourceFile) return true;
    });
    return results;
  } catch (error) {
    throw new Error('Lcov info could not be found in the active editor.');
  }
}

export function addMarkers(editor, linesData) {
  try {
    const marker = new Marker(editor);
    linesData.filter((line, index) => {
      if (line.executionCount === 0) {
        marker.addTestUncovered(line.lineNumber);
      } else {
        marker.addTestCovered(line.lineNumber);
      }
    });
  } catch (error) {
    throw new Error('Failed to add markers');
  }
}

export function deleteMarkers(editor) {
  try {
    const marker = new Marker(editor);
    marker.remove();
  } catch (error) {
    throw new Error('Failed to delete markers');
  }
}

export function renderMarkers(editor, targetLcovInfo) {
  try {
    if (Object.keys(targetLcovInfo).length > 0) {
      const linesInfo = targetLcovInfo['0'].lines.data;
      deleteMarkers(editor);
      addMarkers(editor, linesInfo);
    }
  } catch (error) {
    throw new Error('Failed to render markers');
  }
}
