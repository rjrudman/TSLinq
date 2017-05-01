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

            const dictionary = new Dictionary<string, number>();
            dictionary.Add(strA, 5);

            expect(dictionary.Get(strA)).toBe(5);
            expect(dictionary.Get(strB)).toBe(5);
            expect(dictionary.TryGetValue(strC)).toBe(<any>undefined);
        });

        it('Should properly distinguish between strings', () => {
            const intA = 1;
            const intB = 1;
            const intC = 2;

            const dictionary = new Dictionary<number, number>();
            dictionary.Add(intA, 5);

            expect(dictionary.Get(intA)).toBe(5);
            expect(dictionary.Get(intB)).toBe(5);
            expect(dictionary.TryGetValue(intC)).toBe(<any>undefined);
        });

        it('Should throw an error if the key doesn\'t exist when using Get', () => {
            const dictionary = new Dictionary<number, number>();
            expect(() => {
                dictionary.Get(5);
            }).toThrow(new Error('The given key was not present in the dictionary.'))
        });

        it('Should return undefined if the key doesn\'t exist when using TryGetValue', () => {
            const dictionary = new Dictionary<number, number>();
            const result = dictionary.TryGetValue(5);
            expect(result).toBe(undefined);
        });

        it('Should throw an error if the key already exists when using Add', () => {
            const dictionary = new Dictionary<number, number>();
            dictionary.Add(5, 5)
            expect(() => {
                dictionary.Add(5, 6);
            }).toThrow(new Error('An item with the same key has already been added.'))
        });

        it('Should successfully insert if the key already exists when using AddOrReplace', () => {
            const dictionary = new Dictionary<number, number>();
            dictionary.Add(5, 5);
            dictionary.AddOrReplace(5, 6);
            const result = dictionary.Get(5);
            expect(result).toBe(6);
        });

        it('Should be able to iterate the dictionary', () => {
            const dictionary = new Dictionary<number, number>();
            dictionary.Add(5, 5);
            dictionary.Add(10, 15);

            const valOne = dictionary.next();
            expect(valOne.done).toBe(false);
            expect(valOne.value).toEqual({ Key: 5, Value: 5 });

            const valTwo = dictionary.next();
            expect(valTwo.done).toBe(false);
            expect(valTwo.value).toEqual({ Key: 10, Value: 15 });
        });

        it('Should be able to iterate the keys', () => {
            const dictionary = new Dictionary<number, number>();
            dictionary.Add(5, 5);
            dictionary.Add(10, 15);

            const keys = dictionary.Keys.ToArray();
            expect(keys[0]).toEqual(5);
            expect(keys[1]).toEqual(10);
        });

        it('Should be able to iterate the values', () => {
            const dictionary = new Dictionary<number, number>();
            dictionary.Add(5, 5);
            dictionary.Add(10, 15);

            const values = dictionary.Values.ToArray();
            expect(values[0]).toEqual(5);
            expect(values[1]).toEqual(15);
        });
    });
});