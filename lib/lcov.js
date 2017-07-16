
/* global atom */

import Promise from 'bluebird';
import { Report } from '@cedx/lcov';
import path from 'path';
import Marker from './marker';

const fs = Promise.promisifyAll(require('fs'));

export async function getFileList(projectPath) {
  try {
    const dirList = await fs.readdirAsync(projectPath);
    const fileList = await Promise.all(dirList.map(async function (file) {
      const filePath = path.join(projectPath, file);
      const stat = await fs.statAsync(filePath);

      if (stat.isDirectory() && !(filePath.match(/node_modules/) || filePath.match(/\/\..+/))) {
        return getFileList(filePath);
      }

      return filePath;
    }));

    return Array.prototype.concat.apply([], fileList);
  } catch (error) {
    throw new Error('Failed to create file list.');
  }
}

export async function getLcovPath() {
  try {
    const paths = atom.project.getPaths();

    const fileList = await getFileList(paths[0]);

    const lcovPath = fileList.filter((filePath, index) => {
      if (filePath.match(/.+lcov\.info/)) return true;
    });

    if (lcovPath.length > 0) {
      return lcovPath[0];
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

export function parseLcovInfo(lcovInfo) {
  try {
    const report = Report.parse(lcovInfo);
    const coverage = report.toJSON();
    return coverage.records;
  } catch (error) {
    throw new Error('Does not conform to the expected format for a lcov info');
  }
}

export function getTargetLcovInfo(editorPath, lcovInfo) {
  try {
    const targetLcovInfo = lcovInfo.filter((record, index) => {
      if (editorPath === record.sourceFile) return true;
    });
    return targetLcovInfo;
  } catch (error) {
    throw new Error('Target lcov info could not be found.');
  }
}

export function addMarkers(editor, linesInfo) {
  try {
    const marker = new Marker(editor);
    linesInfo.filter((line, index) => {
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

export function removeMarkers(editor) {
  try {
    const marker = new Marker(editor);
    marker.remove();
  } catch (error) {
    throw new Error('Failed to delete markers');
  }
}

export function renderCoverage(editor, targetLcovInfo) {
  try {
    if (Object.keys(targetLcovInfo).length > 0) {
      const linesInfo = targetLcovInfo['0'].lines.data;
      removeMarkers(editor);
      addMarkers(editor, linesInfo);
    }
  } catch (error) {
    throw new Error('Coverage could not be rendered.');
  }
}
