'use babel';

import { Range } from 'atom';

export default class Marker {
  constructor(editor) {
    this.editor = editor;
  }

  addTestUncovered(line) {
    const range = new Range([line - 1, 0], [line - 1, 0]);
    const marker = this.editor.markBufferRange(range, { invalidate: 'never' });
    this.editor.decorateMarker(marker, { type: 'line-number', class: 'line-number-red' });
  }

  addTestCovered(line) {
    const range = new Range([line - 1, 0], [line - 1, 0]);
    const marker = this.editor.markBufferRange(range, { invalidate: 'never' });
    this.editor.decorateMarker(marker, { type: 'line-number', class: 'line-number-green' });
  }

  remove() {
    const markers = this.editor.getMarkers();
    markers.forEach((marker) => {
      marker.destroy();
    });
  }
}
