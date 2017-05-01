import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('SelectMany', () => {
        it('Should return me child collections', () => {
            const source = [
                { key: 1, children: [1, 2, 3, 4] },
                { key: 2, children: [4, 5, 6, 7] },
                { key: 3, children: [] },
            ];

            const expected = [1, 2, 3, 4, 4, 5, 6, 7];

            const result =
                Enumerable.Of(source)
                    .SelectMany(a => Enumerable.Of(a.children))
                    .ToArray();

            expect(result).toEqual(expected);
        });
    });
});