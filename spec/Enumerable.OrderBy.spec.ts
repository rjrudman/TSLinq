import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('OrderBy', () => {
        it('Should return me the sorted array', () => {
            const source = [23, 5, 2, 1, 6, 4, 24];

            const expected = [1, 2, 4, 5, 6, 23, 24];

            const result =
                Enumerable.Of(source)
                    .OrderBy(a => a)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should return me the sorted array via property', () => {
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
                { Key: 'd', Rank: 1 },
                { Key: 'c', Rank: 2 },
                { Key: 'f', Rank: 4 },
                { Key: 'b', Rank: 5 },
                { Key: 'e', Rank: 6 },
                { Key: 'a', Rank: 23 },
                { Key: 'g', Rank: 24 },
            ];

            const result =
                Enumerable.Of(source)
                    .OrderBy(a => a.Rank)
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