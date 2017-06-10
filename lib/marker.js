'use babel';

import { Range } from 'atom';

export default class Marker {
  constructor(editor) {
    this.editor = editor;
  }

  add(line) {
    const range = new Range([line - 1, 0], [line - 1, 0]);
    const marker = this.editor.markBufferRange(range, { invalidate: 'never' });
    this.editor.decorateMarker(marker, { type: 'line-number', class: 'line-number-red' });
  }

  remove() {
    const markers = this.editor.getMarkers();
    markers.forEach((marker) => {
      marker.destroy();
    });
  }
}
