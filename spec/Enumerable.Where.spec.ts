import { Enumerable, ResetableIterator } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('Where', () => {
        it('Filter items based on predicate', () => {
            const source = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const expected = [2, 4, 6, 8, 10];
            const result = Enumerable.Of(source).Where((s: number) => s % 2 === 0).ToArray();

            expect(result).toEqual(expected);
        });
    });
});