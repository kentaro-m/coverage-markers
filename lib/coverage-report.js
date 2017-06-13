'use babel';

import CoverageReportView from './coverage-report-view';
import Marker from './marker';
import { parseLcovInfo, readLcovFile, getTargetLcovInfo, addMarkers } from './lcov';
import { InvalidLcovInfoFormatException, NotFoundLcovFileException } from './error';
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
      try {
        const paths = atom.project.getPaths();
        const lcovPath = `${paths[0]}/coverage/lcov.info`;

        const lcovInfo = readLcovFile(lcovPath);
        const records = parseLcovInfo(lcovInfo);
        const targetLcovInfo = getTargetLcovInfo(editor.getPath(), records);

        const linesInfo = targetLcovInfo['0'].lines.data;
        addMarkers(editor, linesInfo);
      } catch (error) {
        if (error instanceof InvalidLcovInfoFormatException) {
          atom.notifications.addError(error.message);
        } else if (error instanceof NotFoundLcovFileException) {
          atom.notifications.addError(error.message);
        }
      }
    });
  },

  dismiss() {
    console.log('dismiss');
    const editors = atom.workspace.getTextEditors();
    editors.forEach((editor) => {
      const marker = new Marker(editor);
      marker.remove();
    });
    this.textEditors.dispose();
  },
};
