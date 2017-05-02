import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('Distinct', () => {
        it('Should return distinct items not found in source2', () => {
            const source = [1, 2, 3, 4, 5];
            const source2 = [2, 4];

            const expected = [1, 3, 5];

            const result =
                Enumerable.Of(source)
                    .Except(source2)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should return distinct items if source2 is empty', () => {
            const source = [1, 2, 3, 4, 5];
            const source2: number[] = [];

            const expected = [1, 2, 3, 4, 5];

            const result =
                Enumerable.Of(source)
                    .Except(source2)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail if source is empty', () => {
            const source: number[] = [];
            const source2 = [3, 5];

            const expected: number[] = [];

            const result =
                Enumerable.Of(source)
                    .Except(source2)
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});
