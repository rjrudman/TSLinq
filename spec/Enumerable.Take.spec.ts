import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
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
            const generator = () => {
                return {
                    next: function () {
                        if (i >= 3) {
                            throw new Error('Generator should not be invoked when the enumerable hasn\'t been materialized');
                        }
                        return { done: false, value: i++ };
                    }
                };
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