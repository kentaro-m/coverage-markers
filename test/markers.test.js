import { TextEditor } from 'atom';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const { assert } = chai;
import Marker from '../lib/marker';

/* global describe, it, beforeEach */

describe('Markers', () => {
  let editor;

  beforeEach(() => {
    editor = new TextEditor();
  });

  it('Create Marker instance', () => {
    const marker = new Marker(editor);
    assert.instanceOf(marker, Marker);
  });

  it('Test covered marker can be added to the editor', () => {
    const marker = new Marker(editor);
    marker.addTestUncovered(1);
    const markers = editor.getMarkers();
    assert.isAbove(markers.length, 0);
  });

  it('Test uncovered marker can be added to the editor', () => {
    const marker = new Marker(editor);
    marker.addTestCovered(1);
    const markers = editor.getMarkers();
    assert.isAbove(markers.length, 0);
  });

  it('Marker can be deleted from the editor', () => {
    const marker = new Marker(editor);
    marker.addTestUncovered(1);
    marker.addTestCovered(3);
    marker.remove();
    const markers = editor.getMarkers();
    assert.equal(markers.length, 0);
  });
});
