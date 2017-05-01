import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('TakeWhile', () => {
        it('Should take while the predicate is true', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = [1, 2, 3];

            const result =
                Enumerable.Of(source)
                    .TakeWhile(i => i <= 3)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should give me no elements if none match the predicate', () => {
            const source = [1, 2, 3, 4, 5];

            const expected: number[] = [];

            const result =
                Enumerable.Of(source)
                    .TakeWhile(i => false)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail when taking more than the number of elements', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = [1, 2, 3, 4, 5];

            const result =
                Enumerable.Of(source)
                    .TakeWhile(i => true)
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});