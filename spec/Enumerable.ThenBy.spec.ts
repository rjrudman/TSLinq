import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('ThenBy', () => {
        it('Should return me the sorted array with multiple steps', () => {
            const source = [
                { A: 1, B: 1 },
                { A: 1, B: 3 },
                { A: 3, B: 95 },
                { A: 1, B: 2 },
                { A: 3, B: 2 },
                { A: 2, B: 27 },
            ]

            const expected = [
                { A: 1, B: 1 },
                { A: 1, B: 2 },
                { A: 1, B: 3 },
                { A: 2, B: 27 },
                { A: 3, B: 2 },
                { A: 3, B: 95 },
            ]

            const result =
                Enumerable.Of(source)
                    .OrderBy(a => a.A).ThenBy(a => a.B)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should return me the sorted array with multiple steps and descending', () => {
            const source = [
                { A: 1, B: 1 },
                { A: 1, B: 3 },
                { A: 3, B: 95 },
                { A: 1, B: 2 },
                { A: 3, B: 2 },
                { A: 2, B: 27 },
            ]

            const expected = [
                { A: 3, B: 2 },
                { A: 3, B: 95 },
                { A: 2, B: 27 },
                { A: 1, B: 1 },
                { A: 1, B: 2 },
                { A: 1, B: 3 },
            ]

            const result =
                Enumerable.Of(source)
                    .OrderByDescending(a => a.A).ThenBy(a => a.B)
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});