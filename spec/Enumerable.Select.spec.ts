import { Enumerable } from '../src/TSLinq';

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
            const generator = () => {
                return {
                    next: function (): IteratorResult<number> {
                        throw new Error('Generator should not be invoked when the enumerable hasn\'t been materialized');
                    }
                }
            };

            const result = Enumerable.Of(generator).Select(s => s + 1);
        });
    });
});