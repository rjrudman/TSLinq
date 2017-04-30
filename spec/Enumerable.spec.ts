import { Enumerable, ResetableIterator } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('Where', () => {
        it('Filter items based on predicate', () => {
            const source = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const expected = [2, 4, 6, 8, 10];
            const result = Enumerable.Of(source).Where((s: number) => s % 2 === 0).ToArray();

            expect(result).toEqual(expected);
        });
    });

    describe('FirstOrDefault', () => {
        it('Should not throw an error for no items', () => {
            const source = [1, 3];

            const expected = null;

            const result =
                Enumerable.Of(source)
                    .Where((s: number) => s % 2 === 0)
                    .FirstOrDefault();

            expect(result).toEqual(expected);
        });

        it('Should filter based on a predicate if provided', () => {
            const source = [1, 3];

            const expected = null;

            const result =
                Enumerable.Of(source)
                    .FirstOrDefault((s: number) => s % 2 === 0);

            expect(result).toEqual(expected);
        });
    });

    describe('Select', () => {
        it('Should return me the transformed items', () => {
            const source = [1, 3];

            const expected = [2, 4];

            const result =
                Enumerable.Of(source)
                    .Select(s => s + 1)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should return an empty sequence if the input was empty', () => {
            const source: number[] = [];

            const expected: number[] = [];

            const result =
                Enumerable.Of(source)
                    .Select(s => s + 1)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should be lazily executed', () => {
            const generator: ResetableIterator<number> = {
                next: function () {
                    throw new Error('Generator should not be invoked when the enumerable hasn\'t been materialized');
                },
                reset: function () { },
                clone: function () { return generator; }
            }

            const result = Enumerable.Of(generator).Select(s => s + 1);
        });
    });

    describe('Skip', () => {
        it('Should skip n number of elements', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = [3, 4, 5];

            const result =
                Enumerable.Of(source)
                    .Skip(2)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail when skipping more than the number of elements', () => {
            const source = [1, 2, 3, 4, 5];

            const expected: number[] = [];

            const result =
                Enumerable.Of(source)
                    .Skip(7)
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });

    describe('Take', () => {
        it('Should give me n number of elements', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = [1, 2, 3];

            const result =
                Enumerable.Of(source)
                    .Take(3)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail when taking more than the number of elements', () => {
            const source = [1, 2, 3, 4, 5];

            const expected: number[] = [1, 2, 3, 4, 5];

            const result =
                Enumerable.Of(source)
                    .Take(7)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should not fail when taking zero elements', () => {
            const source = [1, 2, 3, 4, 5];

            const expected: number[] = [];

            const result =
                Enumerable.Of(source)
                    .Take(0)
                    .ToArray();

            expect(result).toEqual(expected);
        });

        it('Should be lazily executed', () => {
            let i = 0;
            const generator: ResetableIterator<number> = {
                next: function () {
                    if (i >= 3) {
                        throw new Error('Generator should not be invoked when the enumerable hasn\'t been materialized');
                    }
                    return { done: false, value: i++ };
                },
                reset: function () { },
                clone: function () { return generator; }
            };

            const expected: number[] = [0, 1, 2];
            const result =
                Enumerable.Of(generator)
                    .Take(3)
                    .ToArray();

            expect(result).toEqual(expected);
        })
    });
});
