import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('GroupJoin', () => {
        it('Should return an Enumerable of original rows and their joined inner rows', () => {
            const source = [1, 2, 3, 4];
            const source2 = [1, 1, 2, 2, 2, 3, 5];

            const expected = [
                { originalRow: 1, innerRows: [1, 1] },
                { originalRow: 2, innerRows: [2, 2, 2] },
                { originalRow: 3, innerRows: [3] },
                { originalRow: 4, innerRows: [] },
            ];

            const result =
                Enumerable.Of(source)
                    .GroupJoin(Enumerable.Of(source2), a => a, a => a, (originalRow, innerRows) => {
                        return {
                            originalRow,
                            innerRows
                        }
                    })
                    .Select(a => {
                        return {
                            originalRow: a.originalRow,
                            innerRows: a.innerRows.ToArray()
                        }
                    })
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});
