import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('OrderByDescending', () => {
        it('Should return me the sorted desc array', () => {
            const source = [23, 5, 2, 1, 6, 4, 24];

            const expected = [24, 23, 6, 5, 4, 2, 1];

            const result =
                Enumerable.Of(source)
                    .OrderByDescending(a => a)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should return me the sorted desc array via property', () => {
            const source = [
                { Key: 'a', Rank: 23 },
                { Key: 'b', Rank: 5 },
                { Key: 'c', Rank: 2 },
                { Key: 'd', Rank: 1 },
                { Key: 'e', Rank: 6 },
                { Key: 'f', Rank: 4 },
                { Key: 'g', Rank: 24 },
            ]

            const expected = [
                { Key: 'g', Rank: 24 },
                { Key: 'a', Rank: 23 },
                { Key: 'e', Rank: 6 },
                { Key: 'b', Rank: 5 },
                { Key: 'f', Rank: 4 },
                { Key: 'c', Rank: 2 },
                { Key: 'd', Rank: 1 },
            ];

            const result =
                Enumerable.Of(source)
                    .OrderByDescending(a => a.Rank)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should return nothing if the sequence is empty', () => {
            const source: number[] = [];

            const expected: number[] = [];

            const result =
                Enumerable.Of(source)
                    .OrderBy(a => a)
                    .ToArray();

            expect(result).toEqual(expected);
        });

    });
});