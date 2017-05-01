import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('LastOrDefault', () => {
        it('Should not throw an error for no items', () => {
            const source = [1, 3];

            const expected = null;

            const result =
                Enumerable.Of(source)
                    .Where((s: number) => s % 2 === 0)
                    .LastOrDefault();

            expect(result).toEqual(expected);
        });

        it('Should return the first item if there\'s no predicate', () => {
            const source = [1, 3];

            const expected = 3;

            const result =
                Enumerable.Of(source)
                    .LastOrDefault();

            expect(result).toEqual(expected);
        });

        it('Should return the first item which matches the predicate predicate', () => {
            const source = [1, 3, 4];

            const expected = 3;

            const result =
                Enumerable.Of(source)
                    .LastOrDefault(i => i < 4);

            expect(result).toEqual(expected);
        });
    });
});