import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('Intersect', () => {
        it('Should return the distinct items which are in both sequences', () => {
            const source = [1, 1, 2, 3, 4, 8];
            const source2 = [1, 3, 4, 5, 5];

            const expected = [1, 3, 4];

            const result =
                Enumerable.Of(source)
                    .Intersect(source2)
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});
