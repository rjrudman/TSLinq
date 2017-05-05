import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('Range', () => {
        it('Should return items in the specified sequence', () => {
            const expected = [0, 1, 2, 3, 4];

            const result =
                Enumerable.Range(0, 5)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should throw an error if count is negative', () => {
            expect(() => {
                const result =
                    Enumerable.Range(0, -1);
            }).toThrow(new Error('Specified argument was out of the range of valid values. Parameter name: count'))
        });
    });
});
