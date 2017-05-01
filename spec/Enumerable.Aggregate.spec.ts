import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('Aggregate', () => {
        it('Should return me the aggregated items', () => {
            const source = [1, 2, 2, 3];

            const expected = 8;

            const result =
                Enumerable.Of(source)
                    .Aggregate(0, (left, right) => left + right);

            expect(result).toEqual(expected);
        });

        it('Should return me the aggregated items with a result selector', () => {
            const source = [1, 2, 2, 3];

            const expected = 13;

            const result =
                Enumerable.Of(source)
                    .Aggregate(0, (left, right) => left + right, (res) => res + 5);

            expect(result).toEqual(expected);
        });

        it('Should not fail when sequence is empty', () => {
            const source: number[] = [];

            const expected = 0

            const result =
                Enumerable.Of(source)
                    .Aggregate(0, (left, right) => left + right);

            expect(result).toEqual(expected);
        });
    });
});
