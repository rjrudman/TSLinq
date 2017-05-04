import { Enumerable } from '../src/TSLinq';

describe('Enumerator', () => {
    describe('MoveNext', () => {
        it('Should return whether more elements are available', () => {
            const enumerator = Enumerable.Of([1, 2]).GetEnumerator();
            expect(enumerator.MoveNext()).toBe(true);
            expect(enumerator.Current).toBe(1);
            expect(enumerator.MoveNext()).toBe(true);
            expect(enumerator.Current).toBe(2);
            expect(enumerator.MoveNext()).toBe(false);
        });
    });
    describe('Current', () => {
        it('Should throw an error if MoveNext() has never been called', () => {
            const enumerator = Enumerable.Of([1, 2]).GetEnumerator();
            expect(() => {
                const currentItem = enumerator.Current;
            }).toThrow(new Error('Enumeration has not started. Call MoveNext.'))
        });

        it('Should throw an error if no more elements are available', () => {
            const enumerator = Enumerable.Of([1, 2]).GetEnumerator();

            expect(enumerator.MoveNext()).toBe(true);
            expect(enumerator.Current).toBe(1);
            expect(enumerator.MoveNext()).toBe(true);
            expect(enumerator.Current).toBe(2);
            expect(enumerator.MoveNext()).toBe(false);

            expect(() => {
                const currentItem = enumerator.Current;
            }).toThrow(new Error('Enumeration already finished.'))
        });

        it('Should throw an error if MoveNext() has never been called after a reset', () => {
            const enumerator = Enumerable.Of([1, 2]).GetEnumerator();

            expect(enumerator.MoveNext()).toBe(true);
            expect(enumerator.Current).toBe(1);
            expect(enumerator.MoveNext()).toBe(true);
            expect(enumerator.Current).toBe(2);
            expect(enumerator.MoveNext()).toBe(false);

            enumerator.Reset();

            expect(() => {
                const currentItem = enumerator.Current;
            }).toThrow(new Error('Enumeration has not started. Call MoveNext.'))
        });

        describe('Reset', () => {
            it('Should reset the enumerator to its initial position', () => {
                const enumerator = Enumerable.Of([1, 2]).GetEnumerator();

                expect(enumerator.MoveNext()).toBe(true);
                expect(enumerator.Current).toBe(1);
                expect(enumerator.MoveNext()).toBe(true);
                expect(enumerator.Current).toBe(2);
                expect(enumerator.MoveNext()).toBe(false);

                enumerator.Reset();

                expect(enumerator.MoveNext()).toBe(true);
                expect(enumerator.Current).toBe(1);
                expect(enumerator.MoveNext()).toBe(true);
                expect(enumerator.Current).toBe(2);
                expect(enumerator.MoveNext()).toBe(false);
            })
        })
    })
});
