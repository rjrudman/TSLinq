import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('DistinctBy', () => {
        it('Should return only the distinct items by the selector in the sequence', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = [1, 2];

            const result =
                Enumerable.Of(source)
                    .DistinctBy(a => a % 2 === 0)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should return nothing if the sequence is empty', () => {
            const source: number[] = [];

            const expected: number[] = [];

            const result =
                Enumerable.Of(source)
                    .DistinctBy(a => a % 2 === 0)
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});
