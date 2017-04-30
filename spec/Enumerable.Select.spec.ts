import { Enumerable, ResetableIterator } from '../src/Enumerable';

describe('Enumerable', () => {
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
});