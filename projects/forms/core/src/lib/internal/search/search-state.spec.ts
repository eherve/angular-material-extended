import { SearchState, sameSearchValue } from "./search-state";

type Item = { _id: string; name?: string };
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
describe("SearchState", () => {
  it("keepsNewestSearchResults", async () => {
    const old = deferred<{ data: Item[]; matchCount: number }>();
    const latest = deferred<{ data: Item[]; matchCount: number }>();
    const state = new SearchState<Item>((_limit, _skip, text) =>
      text === "old" ? old.promise : latest.promise,
    );
    const first = state.search("old");
    const second = state.search("new");
    latest.resolve({ data: [{ _id: "new" }], matchCount: 1 });
    await second;
    old.resolve({ data: [{ _id: "old" }], matchCount: 1 });
    await first;
    expect(state.options().map((item) => item._id)).toEqual(["new"]);
    expect(state.loading()).toBeFalse();
  });
  it("loadsNextPageWithoutLosingSelection", async () => {
    const selected = [{ _id: "selected" }];
    const pages: number[] = [];
    const state = new SearchState<Item>(
      async (_limit, skip, _text, selection) => {
        expect(selection).toBe(selected);
        pages.push(skip);
        return { data: [{ _id: String(skip) }], matchCount: 2 };
      },
      () => selected,
      1,
    );
    await state.search("");
    await state.more();
    expect(pages).toEqual([0, 1]);
    expect(state.options().map((item) => item._id)).toEqual(["0", "1"]);
    expect(selected).toEqual([{ _id: "selected" }]);
  });
  it("recoversAfterSearchFailure", async () => {
    let fail = true;
    const state = new SearchState<Item>(async () => {
      if (fail) throw Error("offline");
      return { data: [{ _id: "ok" }], matchCount: 1 };
    });
    await state.search("x");
    expect(state.failed()).toBeTrue();
    expect(state.loading()).toBeFalse();
    fail = false;
    await state.search("x");
    expect(state.failed()).toBeFalse();
    expect(state.options()).toEqual([{ _id: "ok" }]);
  });
  it("deduplicatesEqualEntityIds across pages", async () => {
    const state = new SearchState<Item>(
      async (_limit, skip) => ({
        data: [{ _id: "same", name: String(skip) }],
        matchCount: 2,
      }),
      undefined,
      1,
    );
    await state.search("");
    await state.more();
    expect(state.options().length).toBe(1);
    expect(sameSearchValue({ _id: "same" }, { _id: "same" })).toBeTrue();
    expect(sameSearchValue(0, false)).toBeFalse();
  });
});

describe("search request lifecycle", () => {
  it("ignores a response invalidated before the debounced next search starts", async () => {
    const pending = deferred<{ data: Item[]; matchCount: number }>();
    const state = new SearchState<Item>(() => pending.promise);
    const request = state.search("old");
    state.invalidate();
    pending.resolve({ data: [{ _id: "stale" }], matchCount: 1 });
    await request;
    expect(state.options()).toEqual([]);
    expect(state.loading()).toBeFalse();
  });
  it("does not update destroyed state from pending response", async () => {
    const pending = deferred<{ data: Item[]; matchCount: number }>();
    const state = new SearchState<Item>(() => pending.promise);
    const request = state.search("old");
    state.destroy();
    pending.resolve({ data: [{ _id: "stale" }], matchCount: 1 });
    await request;
    expect(state.options()).toEqual([]);
  });
});

describe("pagination invalidation boundary", () => {
  it("suspends the old query pagination until a new search starts", async () => {
    const pending = deferred<{ data: Item[]; matchCount: number }>();
    const requested: string[] = [];
    const state = new SearchState<Item>(
      async (_limit, skip, text) => {
        requested.push(`${text}:${skip}`);
        if (text === "old" && skip === 1) return pending.promise;
        return { data: [{ _id: text }], matchCount: 3 };
      },
      undefined,
      1,
    );
    await state.search("old");
    const page = state.more();
    state.invalidate();
    void state.more();
    expect(requested).toEqual(["old:0", "old:1"]);
    expect(state.hasMore()).toBeFalse();
    await state.search("new");
    await state.more();
    pending.resolve({ data: [{ _id: "stale" }], matchCount: 3 });
    await page;
    expect(requested).toEqual(["old:0", "old:1", "new:0", "new:1"]);
    expect(state.options()).toEqual([{ _id: "new" }]);
  });
});
