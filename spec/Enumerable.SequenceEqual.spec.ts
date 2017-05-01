import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('SequenceEqual', () => {
        it('Should return true if the sequences are equal', () => {
            const source = [1, 2, 3, 4, 5];
            const source2 = [1, 2, 3, 4, 5];
            const expected = true;

            const result =
                Enumerable.Of(source)
                    .SequenceEqual(Enumerable.Of(source2));

            expect(result).toEqual(expected);
        });

        it('Should return false if the first sequence is shorter', () => {
            const source = [1, 2, 3, 4];
            const source2 = [1, 2, 3, 4, 5];
            const expected = false;

            const result =
                Enumerable.Of(source)
                    .SequenceEqual(Enumerable.Of(source2));

            expect(result).toEqual(expected);
        });

        it('Should return false if the second sequence is shorter', () => {
            const source = [1, 2, 3, 4, 5];
            const source2 = [1, 2, 3, 4];
            const expected = false;

            const result =
                Enumerable.Of(source)
                    .SequenceEqual(Enumerable.Of(source2));

            expect(result).toEqual(expected);
        });

        it('Should return false when the first sequence is empty, and the second sequence is not', () => {
            const source: number[] = [];
            const source2 = [3, 4];
            const expected = false;

            const result =
                Enumerable.Of(source)
                    .SequenceEqual(Enumerable.Of(source2));

            expect(result).toEqual(expected);
        });

        it('Should return false when the second sequence is empty, and the first sequence is not', () => {
            const source = [1, 2];
            const source2: number[] = [];

            const expected = false;

            const result =
                Enumerable.Of(source)
                    .SequenceEqual(Enumerable.Of(source2));

            expect(result).toEqual(expected);
        });

        it('Should return true when both sequences are empty', () => {
            const source: number[] = [];
            const source2: number[] = [];

            const expected = true;

            const result =
                Enumerable.Of(source)
                    .SequenceEqual(Enumerable.Of(source2));

            expect(result).toEqual(expected);
        });
    });
});