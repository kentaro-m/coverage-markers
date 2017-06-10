'use babel';

import CoverageReportView from './coverage-report-view';
import { CompositeDisposable, Range } from 'atom';
const parse = require('lcov-parse');

export default {

  coverageReportView: null,
  subscriptions: null,
  textEditors: null,

  activate(state) {
    this.coverageReportView = new CoverageReportView(state.coverageReportViewState);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'coverage-report:show': () => this.show(),
      'coverage-report:dismiss': () => this.dismiss(),
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.coverageReportView.destroy();
  },

  serialize() {
    return {
      coverageReportViewState: this.coverageReportView.serialize(),
    };
  },

  show() {
    console.log('show');
    this.textEditors = atom.workspace.observeTextEditors((editor) => {
      const paths = atom.project.getPaths();

      parse(`${paths[0]}/coverage/lcov.info`, (err, data) => {
        if (err) {
          atom.notifications.addError('lcov file could not be found.');
          return;
        }

        const path = editor.getPath();

        const lcov = data.filter((item, index) => {
          if (path === item.file) return true;
        });

        if (lcov.length > 0) {
          console.log('lcov');
          console.log(lcov);
          const lines = lcov['0'].lines.details;

          lines.filter((item, index) => {
            if (item.hit === 0) {
              const range = new Range([item.line - 1, 0], [item.line - 1, 0]);
              const marker = editor.markBufferRange(range, { invalidate: 'never' });
              editor.decorateMarker(marker, { type: 'line-number', class: 'line-number-red' });
            }
          });
        }
      });
    });
  },

  dismiss() {
    console.log('dismiss');
    const activeEditors = atom.workspace.getTextEditors();
    activeEditors.forEach((editor) => {
      const markers = editor.getMarkers();
      markers.forEach((marker) => {
        marker.destroy();
      });
    });
    this.textEditors.dispose();
  },

};
