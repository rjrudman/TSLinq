import { Dictionary } from '../src/TSLinq';

describe('Dictionary', () => {
    describe('Add', () => {
        it('Should properly distinguish between objects', () => {
            const objectA: any = {};
            const objectB: any = {};

            const dictionary = new Dictionary<any, number>();
            dictionary.Add(objectA, 5);

            expect(dictionary.Get(objectA)).toBe(5);
            expect(dictionary.TryGetValue(objectB)).toBe(<any>undefined);
        });

        it('Should properly distinguish between strings', () => {
            const strA = 'testing';
            const strB = 'testing';
            const strC = 'testinga';

            const dictionary = new Dictionary<any, number>();
            dictionary.Add(strA, 5);

            expect(dictionary.Get(strA)).toBe(5);
            expect(dictionary.Get(strB)).toBe(5);
            expect(dictionary.TryGetValue(strC)).toBe(<any>undefined);
        });
    });
});
