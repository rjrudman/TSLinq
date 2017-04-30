import { Enumerable, ResetableIterator } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('FirstOrDefault', () => {
        it('Should not throw an error for no items', () => {
            const source = [1, 3];

            const expected = null;

            const result =
                Enumerable.Of(source)
                    .Where((s: number) => s % 2 === 0)
                    .FirstOrDefault();

            expect(result).toEqual(expected);
        });

        it('Should filter based on a predicate if provided', () => {
            const source = [1, 3];

            const expected = null;

            const result =
                Enumerable.Of(source)
                    .FirstOrDefault((s: number) => s % 2 === 0);

            expect(result).toEqual(expected);
        });
    });
});