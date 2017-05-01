import { Enumerable, Grouping } from '../src/Enumerable';

describe('Enumerable', () => {
    describe('ToDictionary', () => {
        it('Should return a dictionary based on the key selector', () => {
            const source = [
                { Boss: 'Rob', Name: 'Tim' },
                { Boss: 'Rob', Name: 'John' },
                { Boss: 'Mike', Name: 'Anne' },
                { Boss: 'Jessica', Name: 'Matt' },
                { Boss: 'Jessica', Name: 'Tom' },
            ]

            const result =
                Enumerable.Of(source)
                    .ToDictionary(a => a.Boss);

            expect(result['Rob'].ToArray()).toEqual(
                [
                    { Boss: 'Rob', Name: 'Tim' },
                    { Boss: 'Rob', Name: 'John' }
                ]
            );
            expect(result['Mike'].ToArray()).toEqual(
                [
                    { Boss: 'Mike', Name: 'Anne' }
                ]
            );
            expect(result['Jessica'].ToArray()).toEqual(
                [
                    { Boss: 'Jessica', Name: 'Matt' },
                    { Boss: 'Jessica', Name: 'Tom' }
                ]
            );
        });

        it('Should return a dictionary based on the key selector with values according to the value selector', () => {
            const source = [
                { Boss: 'Rob', Name: 'Tim' },
                { Boss: 'Rob', Name: 'John' },
                { Boss: 'Mike', Name: 'Anne' },
                { Boss: 'Jessica', Name: 'Matt' },
                { Boss: 'Jessica', Name: 'Tom' },
            ]

            const result =
                Enumerable.Of(source)
                    .ToDictionary(a => a.Boss, a => a.Name);

            expect(result['Rob'].ToArray()).toEqual(['Tim', 'John']);
            expect(result['Mike'].ToArray()).toEqual(['Anne']);
            expect(result['Jessica'].ToArray()).toEqual(['Matt', 'Tom']);
        });

    });
});
