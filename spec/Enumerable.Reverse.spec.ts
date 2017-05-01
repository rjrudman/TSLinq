import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('Reverse', () => {
        it('Should return the sequence in reverse order', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = [5, 4, 3, 2, 1];

            const result =
                Enumerable.Of(source)
                    .Reverse()
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should return an empty sequence if the input was empty', () => {
            const source: number[] = [];

            const expected: number[] = [];

            const result =
                Enumerable.Of(source)
                    .Reverse()
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});