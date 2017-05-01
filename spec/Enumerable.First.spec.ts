import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('First', () => {
        it('Should throw an error for no items', () => {
            const source = [1, 3];

            const expected = null;

            expect(() => {
                const result =
                    Enumerable.Of(source)
                        .Where((s: number) => s % 2 === 0)
                        .First();
            }).toThrow(new Error('Sequence contains no elements'));
        });

        it('Should return the first item if there\'s no predicate', () => {
            const source = [1, 3];

            const expected = 1;

            const result =
                Enumerable.Of(source)
                    .First();

            expect(result).toEqual(expected);
        });

        it('Should return the first item which matches the predicate predicate', () => {
            const source = [1, 3, 4];

            const expected = 3;

            const result =
                Enumerable.Of(source)
                    .First(i => i > 2);

            expect(result).toEqual(expected);
        });
    });
});