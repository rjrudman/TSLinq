import { Enumerable } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('Single', () => {
        it('Should return me the first item if the sequence contains exactly one item', () => {
            const source = [1];

            const expected = 1;

            const result =
                Enumerable.Of(source)
                    .Single();

            expect(result).toEqual(expected);
        });

        it('Should fail if the sequence contains no items', () => {
            const source: number[] = [];

            expect(() => {
                const result =
                    Enumerable.Of(source)
                        .Single();
            }).toThrow(new Error('Sequence contains no elements'));
        });

        it('Should fail if the sequence contains more than one item', () => {
            const source = [1, 2];

            expect(() => {
                const result =
                    Enumerable.Of(source)
                        .Single();
            }).toThrow(new Error('Sequence contains more than one element'));
        });
    });
});