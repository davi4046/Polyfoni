import type Interval from "../Interval";

import clearInterval from "./clearInterval";

describe("clearInterval", () => {
    let list: Interval[];

    beforeEach(() => {
        list = [{ start: 4, end: 8 }];
    });

    test("crops overlapping interval with lesser start, lesser end", () => {
        clearInterval(list, { start: 2, end: 6 });
        expect(list).toEqual([{ start: 6, end: 8 }]);
    });

    test("splits overlapping interval with lesser start, greater end", () => {
        clearInterval(list, { start: 5, end: 7 });
        expect(list).toEqual([
            { start: 4, end: 5 },
            { start: 7, end: 8 },
        ]);
    });

    test("crops overlapping interval with lesser start, equal end", () => {
        clearInterval(list, { start: 5, end: 7 });
        expect(list).toEqual([
            { start: 4, end: 5 },
            { start: 7, end: 8 },
        ]);
    });

    test("removes overlapping interval with greater start, lesser end", () => {
        clearInterval(list, { start: 2, end: 8 });
        expect(list).toEqual([]);
    });

    test("crops overlapping interval with greater start, greater end", () => {
        clearInterval(list, { start: 2, end: 6 });
        expect(list).toEqual([{ start: 6, end: 8 }]);
    });

    test("removes overlapping interval with greater start, equal end", () => {
        clearInterval(list, { start: 2, end: 8 });
        expect(list).toEqual([]);
    });

    test("removes overlapping interval with equal start, lesser end", () => {
        clearInterval(list, { start: 4, end: 10 });
        expect(list).toEqual([]);
    });

    test("crops overlapping interval with equal start, greater end", () => {
        clearInterval(list, { start: 4, end: 6 });
        expect(list).toEqual([{ start: 6, end: 8 }]);
    });

    test("removes interval with equal start, equal end", () => {
        clearInterval(list, { start: 4, end: 8 });
        expect(list).toEqual([]);
    });
});
