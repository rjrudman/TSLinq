import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('All', () => {
        it('Should return false if there are elements which don\'t match the predicate', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = false;

            const result =
                Enumerable.Of(source)
                    .All(i => i % 2 === 0);

            expect(result).toEqual(expected);
        });

        it('Should return false if there are no elements which match the predicate', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = false;

            const result =
                Enumerable.Of(source)
                    .All(i => i > 5);

            expect(result).toEqual(expected);
        });

        it('Should return true if there are no elements which don\'t match the predicate', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = true;

            const result =
                Enumerable.Of(source)
                    .All(i => i <= 5);

            expect(result).toEqual(expected);
        });

        it('Should return true if there are no elements', () => {
            const source: number[] = [];

            const expected = true;

            const result =
                Enumerable.Of(source)
                    .All(i => i <= 5);

            expect(result).toEqual(expected);
        });
    });
});
