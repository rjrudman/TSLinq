import { Enumerable, ResetableIterator, Grouping } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('GroupBy', () => {
        it('Should return enumerable of Groupings based on the provided selector', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = <Grouping<boolean, number>[]>[
                { Key: false, Values: Enumerable.Of([1, 3, 5]) },
                { Key: true, Values: Enumerable.Of([2, 4]) },
            ];

            const result =
                Enumerable.Of(source)
                    .GroupBy(a => a % 2 === 0)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should return nothing if the sequence is empty', () => {
            const source: number[] = [];

             const expected = <Grouping<boolean, number>[]>[];

            const result =
                Enumerable.Of(source)
                    .GroupBy(a => a % 2 === 0)
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});
