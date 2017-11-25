import Promise from 'bluebird';
import { Report } from '@cedx/lcov';
import Marker from './marker';

const fs = Promise.promisifyAll(require('fs'));
const glob = Promise.promisifyAll(require('glob'));

export async function findCoverageReportFilePath(projectPath) {
  try {
    const ignore = [`${projectPath}/**/node_modules/**`];
    const matchPaths = await glob.globAsync(`${projectPath}/**/lcov.info`, { ignore, dot: false });

    if (matchPaths.length > 0) {
      return matchPaths[0];
    }

    throw new Error('coverage report file path could not be found.');
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function readCoverageReportFile(coverageFilePath) {
  try {
    const coverageFile = await fs.readFileAsync(coverageFilePath, 'utf8');
    return coverageFile;
  } catch (error) {
    throw new Error('coverage report file could not be read.');
  }
}

export function convertCoverageReportForVisibleEditors(coverageFile) {
  try {
    const report = Report.fromCoverage(coverageFile);
    const coverage = report.toJSON();
    return coverage.records;
  } catch (error) {
    throw new Error('coverage report could not be converted.');
  }
}

export function findCoverageReportForActiveEditor(editorPath, coverageReport) {
  try {
    const results = coverageReport.filter((record) => { return editorPath === record.sourceFile; });
    return results;
  } catch (error) {
    throw new Error('coverage report could not be found in the active editor.');
  }
}

export function removeCoverage(editor) {
  try {
    const marker = new Marker(editor);
    marker.remove();
  } catch (error) {
    throw new Error(error.message);
  }
}
