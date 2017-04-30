import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('Distinct', () => {
        it('Should return only the distinct items in the sequence', () => {
            const source = [1, 1, 2, 3, 3, 3, 5];

            const expected = [1, 2, 3, 5];

            const result =
                Enumerable.Of(source)
                    .Distinct()
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should return nothing if the sequence is empty', () => {
            const source: number[] = [];

            const expected: number[] = [];

            const result =
                Enumerable.Of(source)
                    .Distinct()
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});
