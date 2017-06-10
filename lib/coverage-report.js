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
      const lcovPath = `${paths[0]}/coverage/lcov.info`;
      const editorPath = editor.getPath();

      this.parseLcov(lcovPath, editorPath, (err, data) => {
        if (err) {
          atom.notifications.addError('lcov file could not be found.');
          return;
        }

        data.filter((item, index) => {
          if (item.hit === 0) {
            this.addMark(editor, item.line);
          }
        });
      });
    });
  },

  dismiss() {
    console.log('dismiss');
    const activeEditors = atom.workspace.getTextEditors();
    activeEditors.forEach((editor) => {
      this.removeMark(editor);
    });
    this.textEditors.dispose();
  },

  parseLcov(lcovPath, editorPath, callback) {
    parse(lcovPath, (err, data) => {
      if (err) {
        callback(err, data);
        return;
      }

      const lcov = data.filter((item, index) => {
        if (editorPath === item.file) return true;
      });

      const lines = lcov['0'].lines.details;

      callback(err, lines);
    });
  },

  addMark(editor, line) {
    const range = new Range([line - 1, 0], [line - 1, 0]);
    const marker = editor.markBufferRange(range, { invalidate: 'never' });
    editor.decorateMarker(marker, { type: 'line-number', class: 'line-number-red' });
  },

  removeMark(editor) {
    const markers = editor.getMarkers();
    markers.forEach((marker) => {
      marker.destroy();
    });
  },
};
