'use babel';

import CoverageReportView from './coverage-report-view';
import { CompositeDisposable, Range } from 'atom';
import { readFileSync } from 'fs';
const parse = require('lcov-parse');

export default {

  coverageReportView: null,
  subscriptions: null,

  activate(state) {
    this.coverageReportView = new CoverageReportView(state.coverageReportViewState);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'coverage-report:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.coverageReportView.destroy();
  },

  serialize() {
    return {
      coverageReportViewState: this.coverageReportView.serialize()
    };
  },

  toggle() {
    console.log('CoverageReport was toggled!');

    atom.workspace.observeTextEditors((editor) => {
      const paths = atom.project.getPaths();

      parse(`${paths[0]}/coverage/lcov.info`, function(err, data) {
          const path = editor.getPath();

          const lcov = data.filter((item, index) => {
            if (path === item.file) return true;
          });

          if (lcov.length > 0) {
            console.log(lcov);
            const lines = lcov["0"].lines.details;
            console.log(lines);

            lines.filter((item, index) => {
              if (item.hit === 0) {
                const range = new Range([item.line - 1, 0], [item.line - 1, 0]);
                const marker = editor.markBufferRange(range, { invalidate: 'never' })
                editor.decorateMarker(marker, { type: 'line-number', class: 'line-number-red' });
              }
            });
          }
      });
    });
  }

};
