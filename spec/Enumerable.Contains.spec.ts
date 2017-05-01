import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
   describe('Count', () => {
        it('Should return true if the element is found', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = true;

            const result =
                Enumerable.Of(source)
                    .Contains(3);

            expect(result).toEqual(expected);
        });

        it('Should return false if the element is not found', () => {
            const source = [1, 2, 3, 4, 5];

            const expected = false;

            const result =
                Enumerable.Of(source)
                    .Contains(7);

            expect(result).toEqual(expected);
        });
    });
});
