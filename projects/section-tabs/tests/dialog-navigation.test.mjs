import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Subject } from 'rxjs';
import { DialogNavigationController } from '../src/lib/dialog-navigation.ts';

test('resolves stable accessible ids and reports normalization', () => {
  const changes = [];
  const navigation = new DialogNavigationController();
  navigation.bind({ initialState: { tab: 'hidden', section: 'motor' }, onChange: state => changes.push(state) });
  navigation.setTabs(['general', 'technical']);
  assert.equal(navigation.selectedIndex, 0);
  assert.deepEqual(changes, [{ tab: 'general', section: 'motor' }]);
});

test('external restoration preserves pending embedded section without echo', () => {
  const external = new Subject();
  const changes = [];
  const navigation = new DialogNavigationController();
  navigation.bind({ initialState: { tab: 'general' }, stateChanges: external, onChange: state => changes.push(state) });
  navigation.setTabs(['general', 'technical']);
  const technical = navigation.child('technical');
  external.next({ tab: 'technical', section: 'motor' });
  assert.equal(navigation.selectedIndex, 1);
  assert.deepEqual(technical.initialState, { section: 'motor' });
  assert.deepEqual(changes, []);
});

test('ignores stale inactive embedded events and clears section on user tab change', () => {
  const changes = [];
  const navigation = new DialogNavigationController();
  navigation.bind({ initialState: { tab: 'technical', section: 'motor' }, onChange: state => changes.push(state) });
  navigation.setTabs(['general', 'technical']);
  const technical = navigation.child('technical');
  navigation.selectTab(0);
  technical.onChange({ section: 'stale' });
  assert.deepEqual(changes, [{ tab: 'general' }]);
});

test('disposes external streams when rebound or destroyed', () => {
  const external = new Subject();
  const navigation = new DialogNavigationController();
  navigation.bind({ stateChanges: external });
  assert.equal(external.observed, true);
  navigation.destroy();
  assert.equal(external.observed, false);
});

test('legacy selection survives runtime refresh without navigation opt-in', () => {
  const navigation = new DialogNavigationController();
  navigation.bind(undefined);
  navigation.setTabs(['general', 'technical']);
  navigation.selectTab(1);
  navigation.setTabs(['general', 'technical']);
  assert.equal(navigation.selectedIndex, 1);
});

test('section-only embedded navigation never invents a root tab', () => {
  const changes = [];
  const navigation = new DialogNavigationController();
  navigation.bind({ initialState: { section: 'motor' }, onChange: state => changes.push(state) });
  const child = navigation.child();
  child.onChange({ section: 'doors' });
  assert.deepEqual(changes, [{ section: 'doors' }]);
  assert.deepEqual(child.initialState, { section: 'doors' });
});

test('disposed embedded callbacks cannot update a replacement dialog', () => {
  const changes = [];
  const navigation = new DialogNavigationController();
  navigation.bind({ initialState: { tab: 'technical' } });
  navigation.setTabs(['technical']);
  const stale = navigation.child('technical');
  navigation.bind({ initialState: { tab: 'technical' }, onChange: state => changes.push(state) });
  navigation.setTabs(['technical']);
  stale.onChange({ section: 'stale' });
  assert.deepEqual(changes, []);
});

test('normalizes an obsolete root tab for section-only content after readiness', () => {
  const changes = [];
  const navigation = new DialogNavigationController();
  navigation.bind({ initialState: { tab: 'obsolete', section: 'motor' }, onChange: state => changes.push(state) });
  navigation.setTabs([]);
  assert.deepEqual(navigation.child().initialState, { section: 'motor' });
  assert.deepEqual(changes, [{ section: 'motor' }]);
});

test('retains an external target received while record and embedded content load asynchronously', async () => {
  const external = new Subject();
  const changes = [];
  const navigation = new DialogNavigationController();
  navigation.bind({ stateChanges: external, onChange: state => changes.push(state) });
  external.next({ tab: 'technical', section: 'motor' });
  await Promise.resolve();
  navigation.setTabs(['general', 'technical']);
  await Promise.resolve();
  const embedded = navigation.child('technical');
  assert.equal(navigation.selectedIndex, 1);
  assert.deepEqual(embedded.initialState, { section: 'motor' });
  embedded.onChange({ section: 'motor' });
  assert.deepEqual(changes, []);
});

test('reports section normalization once and prevents a restore feedback loop', () => {
  const external = new Subject();
  const changes = [];
  const navigation = new DialogNavigationController();
  navigation.bind({
    initialState: { tab: 'technical', section: 'missing' },
    stateChanges: external,
    onChange: state => { changes.push(state); external.next(state); },
  });
  navigation.setTabs(['technical']);
  const embedded = navigation.child('technical');
  embedded.onChange({ section: 'motor' });
  embedded.onChange({ section: 'motor' });
  assert.deepEqual(changes, [{ tab: 'technical', section: 'motor' }]);
});
