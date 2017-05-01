import { Enumerable } from '../src/TSLinq';

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

            expect(() => {
                const result =
                    Enumerable.Of(source)
                        .ElementAt(-1);
            }).toThrow(new Error('Index was out of range. Must be non-negative and less than the size of the collection'));

        });

        it('Should fail if the index is greater than the number of elements in the sequence', () => {
            const source = [1, 2, 3, 4, 5];

            expect(() => {
                const result =
                    Enumerable.Of(source)
                        .ElementAt(8);
            }).toThrow(new Error('Index was out of range. Must be non-negative and less than the size of the collection'));

        });
    });
});
