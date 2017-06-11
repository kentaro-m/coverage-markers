'use babel';

import CoverageReportView from './coverage-report-view';
import Marker from './marker';
import parseLcov from './parseLcov';
import { CompositeDisposable } from 'atom';

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
      const marker = new Marker(editor);

      parseLcov(lcovPath, editorPath, (err, data) => {
        if (err) {
          atom.notifications.addError('lcov file could not be found.');
          return;
        }

        const lines = data['0'].lines.details;

        lines.filter((item, index) => {
          if (item.hit === 0) {
            marker.addTestUncovered(item.line);
          } else {
            marker.addTestCovered(item.line);
          }
        });
      });
    });
  },

  dismiss() {
    console.log('dismiss');
    const activeEditors = atom.workspace.getTextEditors();
    activeEditors.forEach((editor) => {
      const marker = new Marker(editor);
      marker.remove();
    });
    this.textEditors.dispose();
  },
};
