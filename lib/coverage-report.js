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

async function readCoverageReportFile(coverageFilePath) {
  try {
    const coverageFile = await fs.readFileAsync(coverageFilePath, 'utf8');
    return coverageFile;
  } catch (error) {
    throw new Error('coverage report file could not be read.');
  }
}

function convertCoverageReport(coverageFile) {
  try {
    const report = Report.fromCoverage(coverageFile);
    const coverage = report.toJSON();
    return coverage.records;
  } catch (error) {
    throw new Error('coverage report could not be converted.');
  }
}

function findCoverageReportForActiveEditor(editorPath, coverageReport) {
  try {
    const results = coverageReport.filter((record) => { return editorPath === record.sourceFile; });
    return results;
  } catch (error) {
    throw new Error('coverage report could not be found in the active editor.');
  }
}

export async function renderCoverageMarkers(editor, coverageFilePath) {
  try {
    const coverageFile = await readCoverageReportFile(coverageFilePath);
    const coverageReport = convertCoverageReport(coverageFile);
    const results = findCoverageReportForActiveEditor(editor.getPath(), coverageReport);

    if (results.length > 0) {
      const lines = results['0'].lines.data;
      const marker = new Marker(editor);
      marker.remove();
      lines.forEach((line) => {
        if (line.executionCount === 0) {
          marker.addTestUncovered(line.lineNumber);
        } else {
          marker.addTestCovered(line.lineNumber);
        }
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export function removeCoverageMarkers(editor) {
  try {
    const marker = new Marker(editor);
    marker.remove();
  } catch (error) {
    throw new Error(error.message);
  }
}
