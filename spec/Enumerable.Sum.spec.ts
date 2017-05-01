import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
   describe('Sum', () => {
        it('Should give me the sum of the elements', () => {
            const source = [1, 2, 3];

            const expected = 6;

            const result =
                Enumerable.Of(source)
                    .Sum();

            expect(result).toEqual(expected);
        });

        it('Should give me zero when there are no elements', () => {
            const source: never[] = [];

            const expected = 0;

            const result =
                Enumerable.Of(source)
                    .Sum();

            expect(result).toEqual(expected);
        });

        it('Should fail when the enumerable is not enumerable<number>', () => {
            const source = ['a', 'b', 'c'];

            expect(() => {
            const result =
                Enumerable.Of(source)
                    .Sum();
            }).toThrow(new Error('Sum() is only valid on Enumerable<number>'))
        });
    });
});
