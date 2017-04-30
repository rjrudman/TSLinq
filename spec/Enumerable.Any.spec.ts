import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
   describe('Any', () => {
        it('Should return true if there are elements', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = true;

            const result =
                Enumerable.Of(source)
                    .Any();

            expect(result).toEqual(expected);
        });

        it('Should return false if there are no elements', () => {
            const source: number[] = [];

            const expected = false;

            const result =
                Enumerable.Of(source)
                    .Any();

            expect(result).toEqual(expected);
        });

        it('Should return true if there are elements which match the predicate', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = true;

            const result =
                Enumerable.Of(source)
                    .Any(i => i % 2 === 0);

            expect(result).toEqual(expected);
        });

        it('Should return false if there are no elements which match the predicate', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = false;

            const result =
                Enumerable.Of(source)
                    .Any(i => i > 5);

            expect(result).toEqual(expected);
        });
    });
});