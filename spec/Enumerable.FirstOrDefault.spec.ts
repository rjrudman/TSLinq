import { Enumerable } from '../src/TSLinq';

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

        it('Should return the first item if there\'s no predicate', () => {
            const source = [1, 3];

            const expected = 1;

            const result =
                Enumerable.Of(source)
                    .FirstOrDefault();

            expect(result).toEqual(expected);
        });

        it('Should return the first item which matches the predicate predicate', () => {
            const source = [1, 3, 4];

            const expected = 3;

            const result =
                Enumerable.Of(source)
                    .FirstOrDefault(i => i > 2);

            expect(result).toEqual(expected);
        });
    });
});