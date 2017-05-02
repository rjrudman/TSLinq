import { Enumerable } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('Materialize', () => {
        it('Not materializing should iterate all sequences each time we iterate', () => {
            let numTimesIterated = 0;
            const generator = () => {
                let currentItem = 0;
                return {
                    next: function (): IteratorResult<number> {
                        numTimesIterated++;
                        return { done: false, value: currentItem++ };
                    }
                }
            };

            const src = Enumerable.Of(generator).Take(5);

            let result = src.ToArray();

            expect(result).toEqual([0, 1, 2, 3, 4]);
            expect(numTimesIterated).toBe(5);

            result = src.ToArray();

            expect(result).toEqual([0, 1, 2, 3, 4]);
            expect(numTimesIterated).toBe(10);
        });

        it('Materializing should not iterate sub sequences each time we iterate', () => {
            let numTimesIterated = 0;
            const generator = () => {
                let currentItem = 0;
                return {
                    next: function (): IteratorResult<number> {
                        numTimesIterated++;
                        return { done: false, value: currentItem++ };
                    }
                }
            };

            const src = Enumerable.Of(generator).Take(5).Materialize();

            let result = src.ToArray();

            expect(result).toEqual([0, 1, 2, 3, 4]);
            expect(numTimesIterated).toBe(5);

            result = src.ToArray();

            expect(result).toEqual([0, 1, 2, 3, 4]);
            expect(numTimesIterated).toBe(5);
        });
    });
});
