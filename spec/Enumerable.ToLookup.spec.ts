import { Enumerable, Grouping } from '../src/TSLinq';

describe('Enumerable', () => {
    describe('ToLookup', () => {
        it('Should return a dictionary based on the key selector', () => {
            const source = [
                { Boss: 'Rob', Name: 'Tim' },
                { Boss: 'Mike', Name: 'Anne' },
                { Boss: 'Jessica', Name: 'Matt' }
            ]

            const result =
                Enumerable.Of(source)
                    .ToLookup(a => a.Boss);

            expect(result.Get('Rob')).toEqual({ Boss: 'Rob', Name: 'Tim' });
            expect(result.Get('Mike')).toEqual({ Boss: 'Mike', Name: 'Anne' });
            expect(result.Get('Jessica')).toEqual({ Boss: 'Jessica', Name: 'Matt' });
        });

        it('Should return a dictionary based on the key selector with values according to the value selector', () => {
             const source = [
                { Boss: 'Rob', Name: 'Tim' },
                { Boss: 'Mike', Name: 'Anne' },
                { Boss: 'Jessica', Name: 'Matt' }
            ]

            const result =
                Enumerable.Of(source)
                    .ToLookup(a => a.Boss, a => a.Name);

            expect(result.Get('Rob')).toEqual('Tim');
            expect(result.Get('Mike')).toEqual('Anne');
            expect(result.Get('Jessica')).toEqual('Matt');
        });

    });
});
