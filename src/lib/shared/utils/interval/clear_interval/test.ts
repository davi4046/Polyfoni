import Interval from "../Interval";
import clearInterval from "./clearInterval";

describe("clearInterval", () => {
    let list: Interval[];

    beforeEach(() => {
        list = [new Interval(4, 8)];
    });

    test("crops overlapping interval with lesser start, lesser end", () => {
        clearInterval(list, new Interval(2, 6));
        expect(list).toEqual([new Interval(6, 8)]);
    });

    test("splits overlapping interval with lesser start, greater end", () => {
        clearInterval(list, new Interval(5, 7));
        expect(list).toEqual([new Interval(4, 5), new Interval(7, 8)]);
    });

    test("crops overlapping interval with lesser start, equal end", () => {
        clearInterval(list, new Interval(5, 7));
        expect(list).toEqual([new Interval(4, 5), new Interval(7, 8)]);
    });

    test("removes overlapping interval with greater start, lesser end", () => {
        clearInterval(list, new Interval(2, 10));
        expect(list).toEqual([]);
    });

    test("crops overlapping interval with greater start, greater end", () => {
        clearInterval(list, new Interval(2, 6));
        expect(list).toEqual([new Interval(6, 8)]);
    });

    test("removes overlapping interval with greater start, equal end", () => {
        clearInterval(list, new Interval(2, 8));
        expect(list).toEqual([]);
    });

    test("removes overlapping interval with equal start, lesser end", () => {
        clearInterval(list, new Interval(4, 10));
        expect(list).toEqual([]);
    });

    test("crops overlapping interval with equal start, greater end", () => {
        clearInterval(list, new Interval(4, 6));
        expect(list).toEqual([new Interval(6, 8)]);
    });

    test("removes interval with equal start, equal end", () => {
        clearInterval(list, new Interval(4, 8));
        expect(list).toEqual([]);
    });
});
