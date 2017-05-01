import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
   describe('Count', () => {
        it('Should return the number of elements', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = 5;

            const result =
                Enumerable.Of(source)
                    .Count();

            expect(result).toEqual(expected);
        });

        it('Should return zero if there are no elements', () => {
            const source: number[] = [];

            const expected = 0;

            const result =
                Enumerable.Of(source)
                    .Count();

            expect(result).toEqual(expected);
        });
    });
});
