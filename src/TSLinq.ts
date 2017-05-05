import { DefaultEqual, DefaultCompare, EqualityEqualsMethod, EqualityGetHashCodeMethod, DefaultHash, EqualityComparer, DefaultEqualityComparer, EqualityCompareMethod } from './TSLinqEqualityComparisons';
import { ArrayIterator } from './TSLinqIterators';

function isEnumerable<T>(obj: any): obj is Enumerable<T> {
    return obj instanceof Enumerable;
}

function isArray<T>(obj: any): obj is T[] {
    if (!obj) {
        return false;
    }
    const objDefinition = {}.toString.call(obj);
    return objDefinition === '[object Array]';
}

function isGeneratorFunction<T>(obj: any): obj is (() => Iterator<T>) {
    if (!obj) {
        return false;
    }
    const objDefinition = {}.toString.call(obj);
    return objDefinition === '[object Function]'
        || objDefinition === '[object GeneratorFunction]';
}

function isConvertableToEnumerable<T>(obj: any): obj is ConvertableToEnumerable<T> {
    return isEnumerable(obj) || isArray(obj) || isGeneratorFunction<T>(obj);
}

export interface Grouping<T, TValue> {
    Key: T,
    Values: Enumerable<TValue>
}

export type ConvertableToEnumerable<T> = T[] | Enumerable<T> | (() => Iterator<T>);
export class Enumerable<T> implements Iterable<T> {
    protected iteratorGenerator: () => Iterator<T>;

    public static Empty<T>(): Enumerable<T> {
        return Enumerable.Of(() => {
            return {
                next: () => { return { done: true, value: <any>null } }
            };
        });
    }
    /**
     * Creates an Enumerable which encapsulates the provided source
     * @param source Either an Enumerable<T>, an array of T, or an Iterator<T>. An Iterator<T> can be manually created, or using function generators.
     */
    public static Of<T>(source: ConvertableToEnumerable<T>): Enumerable<T> {
        if (isArray(source)) {
            return new Enumerable<T>(() => new ArrayIterator<T>(source));
        } else if (isGeneratorFunction(source)) {
            return new Enumerable<T>(source);
        } else if (isEnumerable(source)) {
            return source;
        }

        throw new Error('Invalid type supplied. Only supports arrays, generator functions and enumerables.');
    }

    protected constructor(iteratorGetter: () => Iterator<T>) {
        this.iteratorGenerator = iteratorGetter;
    }

    [Symbol.iterator]() {
        return this.iteratorGenerator();
    }

    /**
     * Aggregates the enumerable with an initial seed and an accumulator function
     * @param seed The initial accumulator value
     * @param accumulator The accumulator function which is invoked on each element.
     */
    public Aggregate<TAccumulate>(seed: TAccumulate, accumulator: (accumulate: TAccumulate, next: T) => TAccumulate): TAccumulate;

    /**
     * Aggregates the enumerable with an initial seed and an accumulator function
     * @param seed The initial accumulator value
     * @param accumulator The accumulator function which is invoked on each element.
     * @param resultSelector A function which takes the final result and applies a transform.
     */
    public Aggregate<TAccumulate, TResult>(seed: TAccumulate, accumulator: (accumulate: TAccumulate, next: T) => TAccumulate, resultSelector: (item: TAccumulate) => TResult): TResult;
    public Aggregate<TAccumulate, TResult>(
        seed: TAccumulate,
        accumulator: (accumulate: TAccumulate, next: T) => TAccumulate,
        resultSelector?: (item: TAccumulate) => TResult
    ): TAccumulate | TResult {
        this.ForEach(a => {
            seed = accumulator(seed, a);
        });

        if (!resultSelector) {
            return seed;
        } else {
            return resultSelector(seed);
        }
    }

    /**
     * Returns whether every element in the sequence satisfies the supplied predicate
     * @param predicate The predicate to be invoked on each element
     */
    public All(predicate: (item: T) => boolean) {
        return !this.Any(i => !predicate(i));
    }

    /**
     * Returns whether the sequence contains any elements
     */
    public Any(): boolean;
    /**
     * Returns whether the sequence contains any elements which satisfy the supplied predicate
     * @param predicate The predicate to be invoked on each element
     */
    public Any(predicate: ((item: T) => boolean)): boolean;
    public Any(predicate?: (item: T) => boolean) {
        let enumerable = <Enumerable<T>>this;
        if (predicate) {
            enumerable = enumerable.Where(predicate);
        }
        return !enumerable.iteratorGenerator().next().done;
    }

    /**
     * Returns the average of the elements in the sequence. Only supports Enumerable<number>
     */
    public Average(): number;
    /**
     * Invokes the selector on each element in the sequence and returns the average
     * @param selector The selector to be invoked on each element
     */
    public Average(selector: (item: T) => number): number;
    public Average(selector?: (item: T) => number) {
        if (!selector) {
            selector = item => <number><any>item;
        }

        const enumerable = this.Select<number>(selector);
        let num = 0;
        let count = 0;
        enumerable.ForEach(i => {
            if (typeof (i) === 'number') {
                num += i;
                count++;
            } else {
                throw new Error('Average() is only valid on Enumerable<number>');
            }
        });

        if (num === 0) {
            throw new Error('Sequence contains no elements');
        }

        return num / count;
    }

    /**
     * Casts the sequence from Enumerable<T> to Enumerable<TReturnType>
     */
    public Cast<TReturnType>(): Enumerable<TReturnType> {
        return <Enumerable<TReturnType>><any>this;
    }

    /**
     * Concatenates the current sequence with the supplied sequence
     * @param second The sequence to concatenate
     */
    public Concat(second: ConvertableToEnumerable<T>): Enumerable<T> {
        return Enumerable.Of([this, Enumerable.Of(second)]).SelectMany(a => a);
    };

    /**
     * Returns whether or not the sequence contains the specified element
     * @param item The element to search for
     * @param compareFunction An optional parameter which provides a custom equality method
     */
    public Contains(element: T, equalFunction: EqualityEqualsMethod<T> = DefaultEqual): boolean {
        return this.Any(a => equalFunction(a, element));
    };

    /**
     * Returns the number of elements in the sequence
     */
    public Count(): number;
    /**
     * Returns the number of elements in the sequence which satisfy the predicate
     * @param predicate The predicate to be invoked on each element
     */
    public Count(predicate: ((item: T) => boolean)): number;
    public Count(predicate?: (item: T) => boolean) {
        let enumerable = <Enumerable<T>>this;
        if (predicate) {
            enumerable = enumerable.Where(predicate);
        }
        let i = 0;
        const iterator = enumerable.iteratorGenerator();
        while (!iterator.next().done) {
            i++;
        }
        return i;
    }

    /**
     * If the sequence contains no elements, returns a sequence containing only the supplied default value. Otherwise, returns itself.
     * @param defaultValue The default value to be added if the sequence is empty.
     */
    public DefaultIfEmpty(defaultValue: T): Enumerable<T> {
        if (this.Any()) {
            return this;
        }
        return Enumerable.Of<T>([defaultValue]);
    }

    /**
     * Returns the distinct items in the sequence
     * @param A custom comparerer to be used to judge distinctness
     * @param equalityComparer A custom comparer to be used to judge distinctness
     */
    public Distinct(equalityComparer: EqualityComparer<T> = new DefaultEqualityComparer<T>()): Enumerable<T> {
        return this.GroupBy(a => a).Select(g => g.Key);
    }

    /**
     * Returns the element at the specified position in the sequence. If the index is out of range, an error is thrown.
     * @param index The index of the element to be retrieved
     */
    public ElementAt(index: number): T {
        if (index < 0) {
            throw new Error('Index was out of range. Must be non-negative and less than the size of the collection');
        }
        const skippedItems = this.Skip(index);
        const nextItem = skippedItems.iteratorGenerator().next();
        if (nextItem.done) {
            throw new Error('Index was out of range. Must be non-negative and less than the size of the collection');
        } else {
            return nextItem.value;
        }
    }

    /**
     * Returns the element at the specified position in the sequence. If the index is out of range, null is returned.
     * @param index The index of the element to be retrieved
     */
    public ElementAtOrDefault(index: number): T | null {
        if (index < 0) {
            return null;
        }
        const skippedItems = this.Skip(index);
        const nextItem = skippedItems.iteratorGenerator().next();
        if (nextItem.done) {
            return null;
        } else {
            return nextItem.value;
        }
    }

    /**
     * Returns the distinct elements in the sequence which are not found in the provided sequence
     * @param other The sequence containing elements to be excluded
     * @param equalityComparer A custom comparer to be used to judge distinctness
     */
    public Except(other: ConvertableToEnumerable<T>, equalityComparer: EqualityComparer<T> = new DefaultEqualityComparer<T>()): Enumerable<T> {
        const otherArray = Enumerable.Of(other).ToArray();
        return this.Distinct(equalityComparer).Where(a => otherArray.indexOf(a) === -1);
    }

    /**
     * Returns the first element of the sequence. If the sequence is empty, an error is thrown.
     */
    public First(): T;
    /**
     * Returns the first element of the sequence which matches the supplied predicate. If no element is valid, or if the sequence is empty, an error is thrown.
     * @param predicate The predicate to be invoked on each element
     */
    public First(predicate: ((item: T) => boolean)): T;
    public First(predicate?: ((item: T) => boolean)): T {
        if (predicate !== undefined) {
            return this.Where(predicate).First();
        }
        const nextItem = this.iteratorGenerator().next();
        if (nextItem.done) {
            throw new Error('Sequence contains no elements');
        } else {
            return nextItem.value;
        }
    }

    /**
     * Returns the first element of the sequence. If the sequence is empty, null is returned.
     */
    public FirstOrDefault(): T | null;
    /**
     * Returns the first element of the sequence which matches the supplied predicate. If no element is valid, or if the sequence is empty, null is returned.
     * @param predicate The predicate to be invoked on each element
     */
    public FirstOrDefault(predicate: ((item: T) => boolean)): T | null;
    public FirstOrDefault(predicate?: ((item: T) => boolean)): T | null {
        if (predicate !== undefined) {
            return this.Where(predicate).FirstOrDefault();
        }
        const nextItem = this.iteratorGenerator().next();
        if (nextItem.done) {
            return null;
        } else {
            return nextItem.value;
        }
    }

    /**
     * Iterates the sequence and invokes the provided function on each element.
     * @param func The function to be invoked on each element
     */
    public ForEach(func: ((item: T) => void)): void {
        const iterator = this.iteratorGenerator();
        let item = iterator.next();
        while (!item.done) {
            func(item.value);
            item = iterator.next();
        }
    }

    /**
     * Returns an Enumerator for the sequence
     */
    public GetEnumerator(): Enumerator<T> {
        return new Enumerator<T>(this.iteratorGenerator);
    }

    /**
     * Groups elements in the sequence by the supplied key selector. This method is not lazily executed.
     * @param selector A selector which returns the key for the sequence to be grouped by
     * @param equalityComparer A custom comparer to be used to judge distinctness
     */
    public GroupBy<TValue>(selector: (item: T) => TValue, equalityComparer: EqualityComparer<TValue> = new DefaultEqualityComparer<TValue>()): Enumerable<Grouping<TValue, T>> {
        const dictionary = new Dictionary<TValue, T[]>(equalityComparer);
        this.ForEach(i => {
            const key = selector(i);
            if (!dictionary.ContainsKey(key)) {
                dictionary.Add(key, []);
            }
            dictionary.Get(key).push(i);
        });
        return dictionary.Select(d => {
            return {
                Key: d.Key,
                Values: Enumerable.Of(d.Value)
            }
        })
    }

    /**
     * Performs a left join of the sequences. Child rows are found as an Enumerable<TInner> on the result.
     * If no children are found, the array will be empty.
     * @param inner The second sequence
     * @param outerKeySelector Key selector for the outer sequence
     * @param innerKeySelector Key selector for the inner sequence
     * @param resultSelector Selector to transform the result
     * @param equalityComparer A custom comparer to be used to judge distinctness
     */
    public GroupJoin<TInner, TKey, TResult>(inner: ConvertableToEnumerable<TInner>,
        outerKeySelector: ((item: T) => TKey),
        innerKeySelector: ((item: TInner) => TKey),
        resultSelector: ((originalRow: T, innerRows: Enumerable<TInner>) => TResult),
        equalityComparer: EqualityComparer<TKey> = new DefaultEqualityComparer<TKey>()): Enumerable<TResult> {

        const innerEnumerable = Enumerable.Of(inner);
        const innerSet = innerEnumerable.GroupBy(i => innerKeySelector(i)).ToDictionary(a => a.Key, a => a.Values, equalityComparer);
        return this.Select(a => {
            const outerKey = outerKeySelector(a);
            let innerRows = innerSet.TryGetValue(outerKey);
            if (!innerRows) {
                innerRows = Enumerable.Empty<TInner>();
            }
            const result = resultSelector(a, innerRows);
            return result;
        });
    }

    /**
     * Returns distinct elements which are present in both sequences
     * @param inner The second sequence
     * @param equalityComparer A custom comparer to be used to judge distinctness
     */
    public Intersect(inner: ConvertableToEnumerable<T>, equalityComparer: EqualityComparer<T> = new DefaultEqualityComparer<T>()): Enumerable<T> {
        const innerEnumerable = Enumerable.Of(inner);
        return this.Where(x => innerEnumerable.Contains(x, equalityComparer.Equals.bind(equalityComparer))).Distinct(equalityComparer);
    }

    /**
     * Performs an inner join between the two sequences
     * @param inner The second sequence
     * @param outerKeySelector Key selector for the outer sequence
     * @param innerKeySelector Key selector for the inner sequence
     * @param resultSelector Selector to transform the result
     * @param equalityComparer A custom comparer to be used to judge distinctness
     */
    public Join<TInner, TKey, TResult>(inner: ConvertableToEnumerable<TInner>,
        outerKeySelector: ((item: T) => TKey),
        innerKeySelector: ((item: TInner) => TKey),
        resultSelector: ((originalRow: T, innerRow: TInner) => TResult),
        equalityComparer: EqualityComparer<TKey> = new DefaultEqualityComparer<TKey>()): Enumerable<TResult> {

        const innerEnumerable = Enumerable.Of(inner);
        const innerSet = innerEnumerable.GroupBy(i => innerKeySelector(i)).ToDictionary(a => a.Key, a => a.Values, equalityComparer);
        return this.SelectMany(a => {
            const outerKey = outerKeySelector(a);
            let innerRows = innerSet.TryGetValue(outerKey);
            if (!innerRows) {
                innerRows = Enumerable.Empty<TInner>();
            }
            return innerRows.Select(innerRow => {
                return resultSelector(a, innerRow);
            })
        });
    }

    /**
     * Returns the last element in the sequence. If the sequence is empty, an error is thrown.
     */
    public Last(): T;
    /**
     * Returns the last element in the sequence which matches the predicate. If no elements are valid, or the sequence is empty, an error is thrown.
     * @param predicate The predicate to be invoked on each element
     */
    public Last(predicate: ((item: T) => boolean)): T;
    public Last(predicate?: ((item: T) => boolean)): T {
        if (predicate) {
            return this.Reverse().First(predicate);
        } else {
            return this.Reverse().First();
        }
    }

    /**
     * Returns the last element in the sequence. If the sequence is empty, null is returned.
     */
    public LastOrDefault(): T | null;
    /**
     * Returns the last element in the sequence which matches the predicate. If no elements are valid, or the sequence is empty, null is returned.
     * @param predicate The predicate to be invoked on each element
     */
    public LastOrDefault(predicate: ((item: T) => boolean)): T | null;
    public LastOrDefault(predicate?: ((item: T) => boolean)): T | null {
        if (predicate) {
            return this.Reverse().FirstOrDefault(predicate);
        } else {
            return this.Reverse().FirstOrDefault();
        }
    }

    /**
     * Returns the max value of the sequence. Only supported on Enumerable<number>
     */
    public Max(): number;
    /**
     * Returns the max value of each element's result of the selector.
     * @param selector A selector to return the value to be compared
     */
    public Max(selector: (item: T) => number): number;
    public Max(selector?: (item: T) => number) {
        if (!selector) {
            selector = item => <number><any>item;
        }

        const enumerable = this.Select<number>(selector);
        let currentMax: number | undefined;
        enumerable.ForEach(i => {
            if (typeof (i) === 'number') {
                if (!currentMax || i > currentMax) {
                    currentMax = i;
                }
            } else {
                throw new Error('Max() is only valid on Enumerable<number>');
            }
        });
        if (currentMax === undefined) {
            throw new Error('Sequence contains no elements');
        }

        return currentMax;
    }

    /**
     * Materializes the sequence and wraps it in an Enumerable. This causes previous sequences to no longer be iterated.
     */
    public Materialize(): Enumerable<T> {
        return Enumerable.Of(this.ToArray());
    }

    /**
     * Returns the min value of the sequence. Only supported on Enumerable<number>
     */
    public Min(): number;
    /**
     * Returns the min value of each element's result of the selector.
     * @param selector A selector to return the value to be compared
     */
    public Min(selector: (item: T) => number): number;
    public Min(selector?: (item: T) => number) {
        if (!selector) {
            selector = item => <number><any>item;
        }

        const enumerable = this.Select<number>(selector);
        let currentMin: number | undefined;
        enumerable.ForEach(i => {
            if (typeof (i) === 'number') {
                if (!currentMin || i < currentMin) {
                    currentMin = i;
                }
            } else {
                throw new Error('Min() is only valid on Enumerable<number>');
            }
        });
        if (currentMin === undefined) {
            throw new Error('Sequence contains no elements');
        }

        return currentMin;
    }

    /**
     * Orders the sequence by the result of the selector in ascending order
     * @param selector The selector to be invoked on each element
     * @param compareMethod A custom comparison method
     */
    public OrderBy<TReturnType>(selector: (item: T) => TReturnType, compareMethod?: EqualityCompareMethod<T>): OrderedEnumerable<T> {
        return new OrderedEnumerable<T>(this.iteratorGenerator, [{ Selector: selector, Direction: 'ASC', CompareMethod: compareMethod }]);
    }

    /**
     * Orders the sequence by the result of the selector in descending order
     * @param selector The selector to be invoked on each element
     * @param compareMethod A custom comparison method
     */
    public OrderByDescending<TReturnType>(selector: (item: T) => TReturnType, compareMethod?: EqualityCompareMethod<T>): OrderedEnumerable<T> {
        return new OrderedEnumerable<T>(this.iteratorGenerator, [{ Selector: selector, Direction: 'DESC', CompareMethod: compareMethod }]);
    }

    /**
     * Reverses the sequence
     */
    public Reverse(): Enumerable<T> {
        return Enumerable.Of(this.ToArray().reverse());
    }

    /**
     * Projects each element of the sequence into a new result
     * @param selector The selector to be invoked on each element
     */
    public Select<TReturnType>(selector: (item: T) => TReturnType): Enumerable<TReturnType> {
        return this.SelectMany(a => [selector(a)]);
    }

    /**
     * Projects each element of the sequence into a new sequence, which is then flattened.
     * @param selector The selector to be invoked on each element
     */
    public SelectMany<TReturnType>(selector: (item: T) => ConvertableToEnumerable<TReturnType>): Enumerable<TReturnType> {
        function* selectManyIterator(src: Enumerable<T>) {
            for (const item of src) {
                for (const innerItem of Enumerable.Of(selector(item))) {
                    yield innerItem;
                }
            }
        }

        return Enumerable.Of(() => selectManyIterator(this));
    }

    /**
     * Returns whether or not two sequences are equal.
     * @param inner The second sequence
     * @param equalMethod A custom method used to determine equality
     */
    public SequenceEqual(inner: ConvertableToEnumerable<T>, equalMethod: EqualityEqualsMethod<T> = DefaultEqual): boolean {
        const currentEnumerator = this.GetEnumerator();
        const otherEnumerator = Enumerable.Of(inner).GetEnumerator();
        while (currentEnumerator.MoveNext()) {
            if (otherEnumerator.MoveNext()) {
                if (!(equalMethod(currentEnumerator.Current, otherEnumerator.Current))) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return !otherEnumerator.MoveNext();
    }

    /**
     * Returns the first element in the sequence. If the sequence is empty or has more than one element, an error is thrown.
     */
    public Single(): T;
    /**
     * Returns the first element in the sequence which matches the predicate. If no elements are valid, the sequence is empty or has more than one element, an error is thrown
     * @param predicate The predicate to be invoked on each element
     */
    public Single(predicate: ((item: T) => boolean)): T;
    public Single(predicate?: ((item: T) => boolean)): T {
        if (predicate !== undefined) {
            return this.Where(predicate).First();
        }

        const iterator = this.iteratorGenerator();
        const nextItem = iterator.next();
        if (nextItem.done) {
            throw new Error('Sequence contains no elements');
        } else if (!iterator.next().done) {
            throw new Error('Sequence contains more than one element');
        } else {
            return nextItem.value;
        }
    }

    /**
     * Returns the first element in the sequence. If the sequence is empty or has more than one element, null is returned.
     */
    public SingleOrDefault(): T | null;
    /**
     * Returns the first element in the sequence which matches the predicate. If no elements are valid, the sequence is empty or has more than one element, null is returned.
     * @param predicate The predicate to be invoked on each element
     */
    public SingleOrDefault(predicate: ((item: T) => boolean)): T | null;
    public SingleOrDefault(predicate?: ((item: T) => boolean)): T | null {
        if (predicate !== undefined) {
            return this.Where(predicate).First();
        }

        const iterator = this.iteratorGenerator();
        const nextItem = iterator.next();
        if (nextItem.done) {
            return null;
        } else if (!iterator.next().done) {
            return null;
        } else {
            return nextItem.value;
        }
    }

    /**
     * Skips the specified number of elements in the sequence. If num is less than or equal to zero, no elements are skipped.
     * @param num The number of elements to skip
     */
    public Skip(num: number): Enumerable<T> {
        if (num < 0) {
            num = 0;
        }
        let i = 0;
        return this.SkipWhile(item => i++ < num);
    }

    /**
     * Skips elements while the predicate returns false.
     * @param predicate The predicate to be invoked on each element.
     */
    public SkipWhile(predicate: (item: T) => boolean): Enumerable<T> {
        let skipping = true;
        return this.SelectMany(a => {
            skipping = skipping && predicate(a);
            if (!skipping) {
                return [a];
            }
            return [];
        });
    }

    /**
     * Returns the sum of the sequence. Only supported on Enumerable<number>
     */
    public Sum(): number;
    /**
    * Returns the sum of each element's result of the selector.
    * @param selector A selector to return the value to be compared
    */
    public Sum(selector: (item: T) => number): number;
    public Sum(selector?: (item: T) => number) {
        if (!selector) {
            selector = item => <number><any>item;
        }

        const enumerable = this.Select<number>(selector);
        let num = 0;
        enumerable.ForEach(i => {
            if (typeof (i) === 'number') {
                num += i;
            } else {
                throw new Error('Sum() is only valid on Enumerable<number>');
            }
        });

        return num;
    }

    /**
     * Takes only the specified number of elements in the sequence. If num is less than or equal to zero, no elements are taken.
     * @param num The number of elements to take
     */
    public Take(num: number): Enumerable<T> {
        function* takeIterator<T>(src: Enumerable<T>) {
            let i = 1;
            for (const item of src) {
                if (i <= num) {
                    yield item;
                }
                if (i === num) {
                    return;
                }
                i++;
            }
        }

        return Enumerable.Of(() => takeIterator(this));
    }

    /**
     * Takes only while the predicate is true.
     * @param predicate The predicate to be invoked on each element.
     */
    public TakeWhile(predicate: (item: T) => boolean): Enumerable<T> {
        function* takeWhileIterator(src: Enumerable<T>, ) {
            for (const item of src) {
                if (predicate(item)) {
                    yield item;
                } else {
                    return;
                }
            }
        }

        return Enumerable.Of(() => takeWhileIterator(this));
    }

    /**
     * Iterates the enumerable and returns an array of the values. This method is not lazily executed.
     */
    public ToArray(): T[] {
        const items: T[] = [];
        this.ForEach(a => items.push(a));
        return items;
    }

    /**
     * Iterates the enumerable and returns a dictionary. This method is not lazily executed.
     * @param keySelector The selector which returns the key for each element.
     */
    public ToDictionary<TKey, TValue>(keySelector: (item: T) => TKey): Dictionary<TKey, T>;

    /**
     * Iterates the enumerable and returns a dictionary. This method is not lazily executed.
     * @param keySelector The selector which returns the key for each element.
     * @param valueSelector The selector which returns the value for each element.
     * @param equalityComparer A custom comparer to be used to judge distinctness
     */
    public ToDictionary<TKey, TValue>(keySelector: (item: T) => TKey, valueSelector: (item: T) => TValue, equalityComparer?: EqualityComparer<TKey>): Dictionary<TKey, TValue>;
    public ToDictionary<TKey, TValue>(keySelector: (item: T) => TKey, valueSelector?: (item: T) => TValue, equalityComparer: EqualityComparer<TKey> = new DefaultEqualityComparer<TKey>()): Dictionary<TKey, TValue> | Dictionary<TKey, T> {
        if (valueSelector) {
            const returnDictionary = new Dictionary<TKey, TValue>(equalityComparer);
            this.ForEach(item => {
                const key = keySelector(item);
                const value = valueSelector(item);
                returnDictionary.Add(key, value);
            });
            return returnDictionary;
        } else {
            const returnDictionary = new Dictionary<TKey, T>(equalityComparer);
            this.ForEach(item => {
                const key = keySelector(item);
                const value = item;
                returnDictionary.Add(key, value);
            });
            return returnDictionary;
        }
    }

    /**
     * Iterates the enumerable and returns an immutable dictionary. This method is not lazily executed.
     * @param keySelector The selector which returns the key for each element.
     */
    public ToLookup<TKey, TValue>(keySelector: (item: T) => TKey): Lookup<TKey, T>;

    /**
     * Iterates the enumerable and returns an immutable dictionary. This method is not lazily executed.
     * @param keySelector The selector which returns the key for each element.
     * @param valueSelector The selector which returns the value for each element.
     * @param equalityComparer A custom comparer to be used to judge distinctness
     */
    public ToLookup<TKey, TValue>(keySelector: (item: T) => TKey, valueSelector: (item: T) => TValue, equalityComparer?: EqualityComparer<TKey>): Lookup<TKey, TValue>;
    public ToLookup<TKey, TValue>(keySelector: (item: T) => TKey, valueSelector?: (item: T) => TValue, equalityComparer: EqualityComparer<TKey> = new DefaultEqualityComparer<TKey>()): Lookup<TKey, TValue> | Lookup<TKey, T> {
        if (valueSelector) {
            return <Lookup<TKey, TValue>>this.ToDictionary(keySelector, valueSelector, equalityComparer);
        }
        return <Lookup<TKey, T>>this.ToDictionary(keySelector, v => v, equalityComparer);
    }

    /**
     * Concatenates this sequence with another, and returns only the distinct elements.
     * @param inner The second sequence
     * @param equalityComparer A custom comparer to be used to judge distinctness
     */
    public Union(inner: ConvertableToEnumerable<T>, equalityComparer: EqualityComparer<T> = new DefaultEqualityComparer<T>()): Enumerable<T> {
        return this.Concat(inner).Distinct(equalityComparer);
    }

    /**
     * Filters the sequence based on a predicate
     * @param predicate The predicate to invoke on each element
     */
    public Where(predicate: (item: T) => boolean) {
        return this.SelectMany(a => {
            if (predicate(a)) {
                return [a];
            } else {
                return [];
            }
        });
    }

    /**
     * Apples a function to the corresponding elements of two sequences, producing a single sequence.
     * @param inner The second sequence
     * @param selector The function to be applied to two correspending elements of the sequences.
     */
    public Zip<TInner, TResult>(inner: ConvertableToEnumerable<TInner>, selector: (left: T, right: TInner) => TResult): Enumerable<TResult> {
        const innerEnumerable = Enumerable.Of(inner);
        const innerIterator = innerEnumerable.iteratorGenerator();
        return this.SelectMany(a => {
            const nextInner = innerIterator.next();
            if (nextInner.done) {
                return [];
            } else {
                return [selector(a, nextInner.value)];
            }
        })
    }
}

export interface OrderInformation<T> {
    Selector: (item: T) => any;
    Direction: 'ASC' | 'DESC',
    CompareMethod?: EqualityCompareMethod<T>
}

function* orderingIterator<T>(src: Enumerable<T>, orders: OrderInformation<T>[]) {
    const srcArray = src.ToArray().sort((left: T, right: T) => {
        let currentResult = 0;
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const orderSelector = order.Selector;
            if (currentResult === 0) {
                const leftSelected = orderSelector(left);
                const rightSelected = orderSelector(right);

                const compareMethod = order.CompareMethod || DefaultCompare
                if (order.Direction === 'ASC') {
                    currentResult = compareMethod(leftSelected, rightSelected);
                } else {
                    currentResult = compareMethod(rightSelected, leftSelected);
                }
            }
        }
        return currentResult;
    });
    for (const item of srcArray) {
        yield item;
    }
}

export class OrderedEnumerable<T> extends Enumerable<T> {
    private orders: OrderInformation<T>[]
    public constructor(iteratorGetter: () => Iterator<T>, orders: OrderInformation<T>[]) {
        super(iteratorGetter);
        this.orders = orders;

        const initialIteratorGenerator = Enumerable.Of(this.iteratorGenerator);
        this.iteratorGenerator = () => orderingIterator(initialIteratorGenerator, orders);
    }

    /**
     * Provides subsequent ordering of the sequence in ascending order according to the selector
     * @param selector The function to provide the value to sort on
     * @param compareMethod A custom comparison method
     */
    public ThenBy<TReturnType>(selector: (item: T) => TReturnType, compareMethod?: EqualityCompareMethod<T>): OrderedEnumerable<T> {
        return new OrderedEnumerable<T>(this.iteratorGenerator, [...this.orders, { Selector: selector, Direction: 'ASC', CompareMethod: compareMethod }]);
    }

    /**
     * Provides subsequent ordering of the sequence in descending order according to the selector
     * @param selector The function to provide the value to sort on
     * @param compareMethod A custom comparison method
     */
    public ThenByDescending<TReturnType>(selector: (item: T) => TReturnType, compareMethod?: EqualityCompareMethod<T>): OrderedEnumerable<T> {
        return new OrderedEnumerable<T>(this.iteratorGenerator, [...this.orders, { Selector: selector, Direction: 'DESC', CompareMethod: compareMethod }]);
    }
}


export interface KeyValuePair<TKey, TValue> {
    Key: TKey,
    Value: TValue
}

export class Lookup<TKey, TValue> extends Enumerable<KeyValuePair<TKey, TValue>> implements Iterator<KeyValuePair<TKey, TValue>> {
    private pointer = 0;
    protected equalityComparer: EqualityComparer<TKey>;
    protected holder: { [index: string]: { Key: TKey, Value: TValue } } = {};
    protected keys: TKey[] = []

    protected constructor();
    protected constructor(equalityComparer: EqualityComparer<TKey>);
    protected constructor(source: ConvertableToEnumerable<KeyValuePair<TKey, TValue>>, equalityComparer?: EqualityComparer<TKey>);
    protected constructor(sourceOrEqualityComparer?: ConvertableToEnumerable<KeyValuePair<TKey, TValue>> | EqualityComparer<TKey>, equalityComparer?: EqualityComparer<TKey>) {
        super(() => this);
        let src: ConvertableToEnumerable<KeyValuePair<TKey, TValue>>;
        if (!sourceOrEqualityComparer && !equalityComparer) {
            // Empty constructor
            this.equalityComparer = new DefaultEqualityComparer<TKey>();
            src = Enumerable.Empty<KeyValuePair<TKey, TValue>>();
        } else if (sourceOrEqualityComparer && equalityComparer) {
            // We were passed both
            this.equalityComparer = equalityComparer;
            if (isConvertableToEnumerable(sourceOrEqualityComparer)) {
                src = sourceOrEqualityComparer;
            } else {
                // Won't happen with typescript usage due to our overload definitions
                throw new Error('Invalid constructor arguments');
            }
        } else if (sourceOrEqualityComparer && !equalityComparer) {
            if (isConvertableToEnumerable(sourceOrEqualityComparer)) {
                // We were only passed the source
                src = sourceOrEqualityComparer;
                this.equalityComparer = new DefaultEqualityComparer<TKey>();
            } else {
                // We were only passed the comparer
                this.equalityComparer = sourceOrEqualityComparer;
                src = Enumerable.Empty<KeyValuePair<TKey, TValue>>();
            }
        } else {
            // Won't happen with typescript usage due to our overload definitions
            throw new Error('Invalid constructor arguments');
        }
        Enumerable.Of(src).ForEach(kvp => {
            this.add(kvp.Key, kvp.Value);
        })
    }

    protected GetHashAndValue(key: TKey): { Hash: number | string, Value?: TValue } {
        const originalHash = this.equalityComparer.GetHashCode(key);
        let currentHash: string;
        if (typeof originalHash === 'number') {
            currentHash = originalHash + '';
        } else {
            currentHash = originalHash;
        }
        while (true) {
            const result = this.holder[currentHash];
            if (result === undefined) {
                return { Hash: currentHash, Value: undefined };
            }
            if (this.equalityComparer.Equals(key, result.Key)) {
                return { Hash: currentHash, Value: result.Value };
            }
            currentHash += '__KeyOffset';
        }
    }

    /**
     * Adds a key and value. If they key already exists, an error is thrown.
     * @param key The key to add.
     * @param value The value to add for the supplied key.
     */
    protected add(key: TKey, value: TValue): void {
        const hashAndValue = this.GetHashAndValue(key);
        if (hashAndValue.Value !== undefined) {
            throw new Error('An item with the same key has already been added.');
        }
        this.holder[hashAndValue.Hash] = { Key: key, Value: value };
        this.keys.push(key);
    }

    /**
     * Returns the value associated with the key. If the key is not present, an error is thrown
     * @param key The key to search for.
     */
    public Get(key: TKey): TValue {
        const result = this.TryGetValue(key);
        if (result === undefined) {
            throw new Error('The given key was not present in the dictionary.')
        }
        return result;
    }

    /**
     * Returns the value associated with the key. If the key is not present, undefined is return
     * @param key The key to search for.
     */
    public TryGetValue(key: TKey): TValue | undefined {
        return this.GetHashAndValue(key).Value;
    }

    /**
     * Returns whether or not the key is present
     * @param key The key to search for.
     */
    public ContainsKey(key: TKey): boolean {
        const result = this.TryGetValue(key);
        return result !== undefined;
    }

    /**
     * Returns a sequence of the keys.
     */
    public get Keys(): Enumerable<TKey> {
        return Enumerable.Of(this.keys);
    }

    /**
     * Returns a sequence of the values.
     */
    public get Values(): Enumerable<TValue> {
        return this.Select(s => this.Get(s.Key));
    }

    next(value?: any): IteratorResult<KeyValuePair<TKey, TValue>> {
        if (this.pointer < this.keys.length) {
            const key = this.keys[this.pointer++];
            return {
                done: false, value: {
                    Key: key,
                    Value: this.Get(key)
                }
            };
        } else {
            return {
                done: true,
                value: <any>null
            }
        }
    }
    reset(value?: any): IteratorResult<KeyValuePair<TKey, TValue>> {
        this.pointer = 0;
        return { done: true, value: <any>null };
    }
}

export class Dictionary<TKey, TValue> extends Lookup<TKey, TValue> {

    constructor();
    constructor(equalityComparer: EqualityComparer<TKey>);
    constructor(source: ConvertableToEnumerable<KeyValuePair<TKey, TValue>>, equalityComparer?: EqualityComparer<TKey>);
    constructor(sourceOrEqualityComparer?: ConvertableToEnumerable<KeyValuePair<TKey, TValue>> | EqualityComparer<TKey>, equalityComparer?: EqualityComparer<TKey>) {
        super(<any>sourceOrEqualityComparer, <any>equalityComparer);
    }

    /**
     * Adds a key and value. If they key already exists, an error is thrown.
     * @param key The key to add.
     * @param value The value to add for the supplied key.
     */
    public Add(key: TKey, value: TValue): void {
        this.add(key, value);
    }

    /**
     * Adds a key and value. If they key already exists, it is overwritten with the new value.
     * @param key The key to add.
     * @param value The value to add for the supplied key.
     */
    public AddOrReplace(key: TKey, value: TValue): void {
        const hashAndValue = this.GetHashAndValue(key);
        if (hashAndValue.Value === undefined) {
            this.keys.push(key);
        }
        this.holder[hashAndValue.Hash] = { Key: key, Value: value };
    }
}

export class Enumerator<T> {
    private iteratorGenerator: () => Iterator<T>;
    private src: Iterator<T>;
    private current?: T;
    private started: boolean;

    constructor(iteratorGenerator: (() => Iterator<T>)) {
        this.iteratorGenerator = iteratorGenerator;
        this.Reset();
    }

    /**
     * Advances the enumerator to the next element of the sequence. Returns false if the sequence has finished, otherwise true.
     */
    public MoveNext(): boolean {
        this.started = true;
        const next = this.src.next();
        if (next.done) {
            this.current = undefined;
            return false;
        } else {
            this.current = next.value;
            return true;
        }
    }

    /**
     * Gets the current element in the sequence
     */
    public get Current(): T {
        if (this.current) {
            return this.current;
        } else {
            if (this.started) {
                throw new Error('Enumeration already finished.');
            } else {
                throw new Error('Enumeration has not started. Call MoveNext.');
            }
        }
    }

    /**
     * Sets the enumerator to its initial position, which is before the first element in the sequence. MoveNext() must be called again before accessing Current.
     */
    public Reset(): void {
        this.src = this.iteratorGenerator();
        this.started = false;
    }
}
