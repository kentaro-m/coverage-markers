'use babel';

import parse from 'lcov-parse';

export default function parseLcov(lcovPath, editorPath, callback) {
  parse(lcovPath, (err, data) => {
    if (err) {
      callback(err, data);
      return;
    }

    const lcov = data.filter((item, index) => {
      if (editorPath === item.file) return true;
    });

    if (lcov.length > 0) {
      const lines = lcov['0'].lines.details;
      callback(err, lines);
    }

    callback(err, data);
  });
}
