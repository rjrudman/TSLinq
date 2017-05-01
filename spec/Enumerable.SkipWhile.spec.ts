import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('SkipWhile', () => {
        it('Should skip while the predicate is true', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = [4, 5];

            const result =
                Enumerable.Of(source)
                    .SkipWhile(i => i <= 3)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should give me all if we don\'t skip any', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = [1, 2, 3, 4, 5];

            const result =
                Enumerable.Of(source)
                    .SkipWhile(i => false)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail when skipping more than the number of elements', () => {
            const source = [1, 2, 3, 4, 5];

            const expected: number[] = [];

            const result =
                Enumerable.Of(source)
                    .SkipWhile(i => true)
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});