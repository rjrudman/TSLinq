import { Enumerable, ResetableIterator } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('DefaultIfEmpty', () => {
        it('Should return itself if sequence has items', () => {
            const source = Enumerable.Of([1, 2, 3, 4, 5]);

            const expected = source;

            const result = source.DefaultIfEmpty(1);

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
