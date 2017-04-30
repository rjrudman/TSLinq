import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('ElementAt', () => {
        it('Should return element at the requested index', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = 3;

            const result =
                Enumerable.Of(source)
                    .ElementAt(2);

            expect(result).toEqual(expected);
        });

        it('Should fail if the index is less than zero', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = null;
            const result = Enumerable.Of(source).ElementAtOrDefault(-1);

            expect(result).toEqual(expected);
        });

        it('Should fail if the index is greater than the number of elements in the sequence', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = null;
            const result = Enumerable.Of(source).ElementAtOrDefault(8);

            expect(result).toEqual(expected);
        });
    });
});
