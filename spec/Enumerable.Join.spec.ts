import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('Join', () => {
        it('Should join the two sequences based on their join key', () => {
            const source = [1, 2, 3, 4];
            const source2 = [1, 3, 4, 5];

            const expected = [
                { originalRow: 1, innerRow: 1 },
                { originalRow: 3, innerRow: 3 },
                { originalRow: 4, innerRow: 4 },
            ];

            const result =
                Enumerable.Of(source)
                    .Join(Enumerable.Of(source2), i => i, i => i, (originalRow, innerRow) => {
                        return {
                            originalRow, innerRow
                        }
                    })
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});
