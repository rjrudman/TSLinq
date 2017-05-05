import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('SingleOrDefault', () => {
        it('Should return me the first item if the sequence contains exactly one item', () => {
            const source = [1];

            const expected = 1;

            const result =
                Enumerable.Of(source)
                    .SingleOrDefault();

            expect(result).toEqual(expected);
        });

        it('Should return me the first item which matches the predicate', () => {
            const source = [1, 2];

            const expected = 2;

            const result =
                Enumerable.Of(source)
                    .Single(a => a > 1);

            expect(result).toEqual(expected);
        });

        it('Should return null if the sequence contains no items', () => {
            const source: number[] = [];

            const expected = null;

            const result =
                Enumerable.Of(source)
                    .SingleOrDefault();

            expect(result).toEqual(expected);
        });

        it('Should return null if the sequence contains more than one item', () => {
            const source = [1, 2];

            const expected = null;

            const result =
                Enumerable.Of(source)
                    .SingleOrDefault();

            expect(result).toEqual(expected);
        });


        it('Should return null if the sequence contains more than one which matches the predicate', () => {
            const source = [1, 2];

            const expected = null;

            const result =
                Enumerable.Of(source)
                    .SingleOrDefault(s => s < 3);

            expect(result).toEqual(expected);
        });
    });
});