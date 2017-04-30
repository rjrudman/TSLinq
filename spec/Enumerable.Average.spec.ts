import { Enumerable, ResetableIterator } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('Average', () => {
        it('Should return the average of integers', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = 3;

            const result =
                Enumerable.Of(source)
                    .Average();

            expect(result).toEqual(expected);
        });

        it('Should return the average of doubles', () => {
            const source = [1.2, 2.6, 3, 3.5, 5.7];

            const expected = 3.2;

            const result =
                Enumerable.Of(source)
                    .Average();

            expect(result).toEqual(expected);
        });

        it('Should fail with an empty sequence', () => {
            const source: number[] = [];

            expect(() => {
                const result = Enumerable.Of(source).Average();
            }).toThrow(new Error('Sequence contains no elements'))
        });

    });
});
