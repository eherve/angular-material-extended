import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CommercialDocumentEditorComponent } from '../../../dist/commercial-document-editor/fesm2022/eherve-angular-material-commercial-document-editor.mjs';

test('root and child action events preserve node and parent identity', () => {
  const injector = createEnvironmentInjector([]);
  const component = runInInjectionContext(injector, () => new CommercialDocumentEditorComponent());
  const root = { id: 'root', title: 'Root', data: {} };
  const child = { id: 'child', title: 'Child', data: {} };
  const removed = []; const moved = [];
  component.removeNode.subscribe(event => removed.push(event));
  component.moveNode.subscribe(event => moved.push(event));
  component.remove(root, null); component.move(child, root, -1);
  assert.deepEqual(removed, [{node: root, parent: null}]);
  assert.deepEqual(moved, [{node: child, parent: root, direction: -1}]);
  assert.equal(component.context(child, root).data, child.data);
  injector.destroy();
});

test('node and parent locks and action permissions prevent mutation events', () => {
  const injector = createEnvironmentInjector([]);
  const component = runInInjectionContext(injector, () => new CommercialDocumentEditorComponent());
  const root = { id: 'root', title: 'Root', data: {}, readOnly: true };
  const child = { id: 'child', title: 'Child', data: {} };
  let events = 0;
  component.removeNode.subscribe(() => events++); component.moveNode.subscribe(() => events++);
  component.remove(root, null); component.move(root, null, 1);
  component.remove(child, root); component.move(child, root, -1);
  component.remove({...child, canRemove:false}, null); component.move({...child, canMove:false}, null, 1);
  assert.equal(events, 0); assert.equal(component.context(child, root).readOnly, true);
  injector.destroy();
});
