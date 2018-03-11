import Promise from 'bluebird';
import { Report } from '@cedx/lcov';
import Marker from './marker';
import fg from 'fast-glob';

const fs = Promise.promisifyAll(require('fs'));

export async function findCoverageFilePath(projectPath) {
  try {
    const globConfig = {
      ignore: ['**/node_modules/**', '**/.*'],
      lcovFileName: 'lcov.info',
    };

    const matchPaths = await fg.async(`**/${globConfig.lcovFileName}`, {
      cwd: projectPath,
      absolute: true,
      ignore: globConfig.ignore,
    });

    if (matchPaths.length > 0) {
      return matchPaths[0];
    }

    throw new Error('coverage file path could not be found.');
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function readCoverageFile(coverageFilePath) {
  try {
    const coverageFile = await fs.readFileAsync(coverageFilePath, 'utf8');
    return coverageFile;
  } catch (error) {
    throw new Error('coverage file could not be read.');
  }
}

export function parseCoverageFile(coverageFile) {
  try {
    const report = Report.fromCoverage(coverageFile);
    const coverage = report.toJSON();
    return coverage.records;
  } catch (error) {
    throw new Error('coverage file could not be parsed.');
  }
}

export function findCoverageDataForActiveEditor(editorPath, coverageReport) {
  try {
    const results = coverageReport.filter(record => {
      return editorPath === record.sourceFile;
    });
    return results;
  } catch (error) {
    throw new Error('coverage data could not be found in the active editor.');
  }
}

export function removeMarkers(editor) {
  try {
    const marker = new Marker(editor);
    marker.remove();
  } catch (error) {
    throw new Error(error.message);
  }
}
