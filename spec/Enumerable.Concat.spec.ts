import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('Concat', () => {
        it('Should two concatenated sources', () => {
            const source = [1, 2, 3];
            const source2 = [4, 5];

            const expected = [1, 2, 3, 4, 5];

            const result =
                Enumerable.Of(source)
                    .Concat(Enumerable.Of(source2))
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail when the left source is empty', () => {
            const source: number[] = [];
            const source2 = [4, 5];

            const expected = [4, 5];

            const result =
                Enumerable.Of(source)
                    .Concat(Enumerable.Of(source2))
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail when the right source is empty', () => {
            const source = [1, 2, 3];
            const source2: number[] = [];

            const expected = [1, 2, 3];

            const result =
                Enumerable.Of(source)
                    .Concat(Enumerable.Of(source2))
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail when both sources are empty', () => {
            const source: number[] = [];
            const source2: number[] = [];

            const expected: number[] = [];

            const result =
                Enumerable.Of(source)
                    .Concat(Enumerable.Of(source2))
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});
