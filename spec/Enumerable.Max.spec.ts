import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('Max', () => {
        it('Should give me the max of the elements', () => {
            const source = [1, 2, 3];

            const expected = 3;

            const result =
                Enumerable.Of(source)
                    .Max();

            expect(result).toEqual(expected);
        });

        it('Should fail when there are no elements', () => {
            const source: never[] = [];

            expect(() => {
                const result =
                    Enumerable.Of(source)
                        .Max();
            }).toThrow(new Error('Sequence contains no elements'));
        });

        it('Should fail when the enumerable is not enumerable<number>', () => {
            const source = ['a', 'b', 'c'];

            expect(() => {
                const result =
                    Enumerable.Of(source)
                        .Max();
            }).toThrow(new Error('Max() is only valid on Enumerable<number>'))
        });
    });
});
