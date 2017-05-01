import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('Min', () => {
        it('Should give me the min of the elements', () => {
            const source = [1, 2, 3];

            const expected = 1;

            const result =
                Enumerable.Of(source)
                    .Min();

            expect(result).toEqual(expected);
        });

        it('Should fail when there are no elements', () => {
            const source: never[] = [];

            expect(() => {
                const result =
                    Enumerable.Of(source)
                        .Min();
            }).toThrow(new Error('Sequence contains no elements'));
        });

        it('Should fail when the enumerable is not enumerable<number>', () => {
            const source = ['a', 'b', 'c'];

            expect(() => {
                const result =
                    Enumerable.Of(source)
                        .Min();
            }).toThrow(new Error('Min() is only valid on Enumerable<number>'))
        });
    });
});
