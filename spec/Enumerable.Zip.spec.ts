import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('Zip', () => {
        it('Should return me the zipped items', () => {
            const source = [1, 2];
            const source2 = [3, 4]
            const expected = [{ left: 1, right: 3 }, { left: 2, right: 4 }];

            const result =
                Enumerable.Of(source)
                    .Zip(Enumerable.Of(source2), (left, right) => { return { left, right } })
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail when the second sequence is shorter', () => {
            const source = [1, 2];
            const source2 = [3]
            const expected = [{ left: 1, right: 3 }];

            const result =
                Enumerable.Of(source)
                    .Zip(Enumerable.Of(source2), (left, right) => { return { left, right } })
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail when the first sequence is shorter', () => {
            const source = [1];
            const source2 = [3, 4]
            const expected = [{ left: 1, right: 3 }];

            const result =
                Enumerable.Of(source)
                    .Zip(Enumerable.Of(source2), (left, right) => { return { left, right } })
                    .ToArray();

            expect(result).toEqual(expected);
        });


        it('Should not fail when the first sequence is empty', () => {
            const source: number[] = [];
            const source2 = [3, 4]
            const expected: { left: number, right: number }[] = [];

            const result =
                Enumerable.Of(source)
                    .Zip(Enumerable.Of(source2), (left, right) => { return { left, right } })
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail when the second sequence is empty', () => {
            const source = [1, 2]
            const source2: number[] = [];
            const expected: { left: number, right: number }[] = [];

            const result =
                Enumerable.Of(source)
                    .Zip(Enumerable.Of(source2), (left, right) => { return { left, right } })
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});