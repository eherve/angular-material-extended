import { SortFacetEntriesPipe } from './sort-facet-entries.pipe';

describe('SortFacetEntriesPipe', () => {
  it('should sort entries without mutating the source array', () => {
    const pipe = new SortFacetEntriesPipe();
    const entries = [
      { _id: 'second', value: 2 },
      { _id: 'first', value: 1 },
      { _id: 'unknown', value: 3 },
    ];
    const sourceOrder = [...entries];

    const result = pipe.transform(entries, [
      { value: 'first', name: 'First' },
      { value: 'second', name: 'Second' },
    ]);

    expect(result).not.toBe(entries);
    expect(result.map(entry => entry._id)).toEqual(['first', 'second', 'unknown']);
    expect(entries).toEqual(sourceOrder);
  });
});
