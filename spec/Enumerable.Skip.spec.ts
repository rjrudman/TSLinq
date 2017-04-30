import { Enumerable, ResetableIterator } from '../src/Enumerable';

describe('Enumerable', () => {
   describe('Skip', () => {
        it('Should skip n number of elements', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = [3, 4, 5];

            const result =
                Enumerable.Of(source)
                    .Skip(2)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail when skipping more than the number of elements', () => {
            const source = [1, 2, 3, 4, 5];

            const expected: number[] = [];

            const result =
                Enumerable.Of(source)
                    .Skip(7)
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});