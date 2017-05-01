import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('DefaultIfEmpty', () => {
        it('Should return itself if sequence has items', () => {
            const originalSource = [1, 2, 3, 4, 5];
            const source = Enumerable.Of(originalSource);

            const expected = originalSource;

            const result = source.DefaultIfEmpty(1).ToArray();

            expect(result).toEqual(expected);
        });

        it('Should return an a sequence with the default value if the sequence is empty', () => {
            const source = Enumerable.Of(<number[]>[]);

            const expected = [1];

            const result = source.DefaultIfEmpty(1).ToArray();

            expect(result).toEqual(expected);
        });
    });
});
