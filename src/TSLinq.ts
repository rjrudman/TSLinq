import * as ObjectId from './ObjectId.js';
const getObjectId: ((obj: any) => number) = ObjectId.getObjectIdFunc();

function isIterator<T>(obj: any): obj is Iterator<T> {
    const it = <Iterator<T>>obj;
    return it.next !== undefined;
}

export interface Grouping<T, TValue> {
    Key: T,
    Values: Enumerable<TValue>
}

export class Enumerable<T> implements Iterable<T> {
    protected iteratorGetter: () => Iterator<T>;

    /**
     * Creates an Enumerable which encapsulates the provided source
     * @param source Either an array of T, or an Iterator<T>. An Iterator<T> can be manually created, or using function generators.
     */
    public static Of<T>(source: T[] | Iterator<T>): Enumerable<T> {
        if (isIterator(source)) {
            return new Enumerable<T>(() => source);
        }
        return new Enumerable<T>(() => new EmptyIterator<T>(source));
    }

    protected static makeIterator<T, TReturnIteratorType>(sourceIterator: Iterator<T>, next: ((sourceIterator: Iterator<T>) => IteratorResult<TReturnIteratorType>)) {
        const iterator: Iterator<TReturnIteratorType> = {
            next: function () {
                return next(sourceIterator);
            }
        }
        if (sourceIterator.return) {
            iterator.return = <any>(sourceIterator.return);
        }
        return iterator;
    }

    protected constructor(iteratorGetter: () => Iterator<T>) {
        this.iteratorGetter = iteratorGetter;
    }

    [Symbol.iterator]() {
        return this.iteratorGetter();
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

    public All(predicate: (item: T) => boolean) {
        return !this.Any(i => !predicate(i));
    }

    public Any(): boolean;
    public Any(predicate: ((item: T) => boolean)): boolean;
    public Any(predicate?: (item: T) => boolean) {
        let enumerable = <Enumerable<T>>this;
        if (predicate) {
            enumerable = enumerable.Where(predicate);
        }
        return !enumerable.iteratorGetter().next().done;
    }

    public Average(): number;
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
                throw new Error('Sum() is only valid on Enumerable<number>');
            }
        });

        if (num === 0) {
            throw new Error('Sequence contains no elements');
        }

        return num / count;
    }

    public Cast<TReturnType>(): Enumerable<TReturnType> {
        return <Enumerable<TReturnType>><any>this;
    }

    public Concat(second: Enumerable<T>): Enumerable<T> {
        const secondIterator = second.iteratorGetter();
        const newIterator = Enumerable.makeIterator<T, T>(this.iteratorGetter(), function (sourceIterator) {
            let nextItem = sourceIterator.next();
            if (!nextItem.done) {
                return nextItem;
            } else {
                nextItem = secondIterator.next();
            }
            return nextItem;
        });
        return Enumerable.Of(newIterator);
    };

    public Contains(item: T): boolean {
        return this.Any(a => a === item);
    };

    public Count(): number;
    public Count(predicate: ((item: T) => boolean)): number;
    public Count(predicate?: (item: T) => boolean) {
        let enumerable = <Enumerable<T>>this;
        if (predicate) {
            enumerable = enumerable.Where(predicate);
        }
        let i = 0;
        const iterator = enumerable.iteratorGetter();
        while (!iterator.next().done) {
            i++;
        }
        return i;
    }

    public DefaultIfEmpty(defaultValue: T): Enumerable<T> {
        if (this.Any()) {
            return this;
        }
        return Enumerable.Of<T>([defaultValue]);
    }

    public Distinct(): Enumerable<T> {
        return this.DistinctBy(a => a);
    }

    public DistinctBy<TValue>(selector: (item: T) => TValue): Enumerable<T> {
        const seenItems: TValue[] = [];
        const newIterator = Enumerable.makeIterator<T, T>(this.iteratorGetter(), function (sourceIterator) {
            let nextItem = sourceIterator.next();
            while (!nextItem.done) {
                const key = selector(nextItem.value);
                if (seenItems.indexOf(key) === -1) {
                    seenItems.push(key);
                    return nextItem;
                }
                nextItem = sourceIterator.next();
            }
            return nextItem;
        });

        return Enumerable.Of(newIterator);
    }

    public ElementAt(index: number): T {
        if (index < 0) {
            throw new Error('Index was out of range. Must be non-negative and less than the size of the collection');
        }
        const skippedItems = this.Skip(index);
        const nextItem = skippedItems.iteratorGetter().next();
        if (nextItem.done) {
            throw new Error('Index was out of range. Must be non-negative and less than the size of the collection');
        } else {
            return nextItem.value;
        }
    }

    public ElementAtOrDefault(index: number): T | null {
        if (index < 0) {
            return null;
        }
        const skippedItems = this.Skip(index);
        const nextItem = skippedItems.iteratorGetter().next();
        if (nextItem.done) {
            return null;
        } else {
            return nextItem.value;
        }
    }

    public Except(other: Enumerable<T>): Enumerable<T> {
        const otherArray = other.ToArray();
        return this.Distinct().Where(a => otherArray.indexOf(a) === -1);
    }

    public First(): T;
    public First(predicate: ((item: T) => boolean)): T;
    public First(predicate?: ((item: T) => boolean)): T {
        if (predicate !== undefined) {
            return this.Where(predicate).First();
        }
        const nextItem = this.iteratorGetter().next();
        if (nextItem.done) {
            throw new Error('Sequence contains no elements');
        } else {
            return nextItem.value;
        }
    }

    public FirstOrDefault(): T | null;
    public FirstOrDefault(predicate: ((item: T) => boolean)): T | null;
    public FirstOrDefault(predicate?: ((item: T) => boolean)): T | null {
        if (predicate !== undefined) {
            return this.Where(predicate).FirstOrDefault();
        }
        const nextItem = this.iteratorGetter().next();
        if (nextItem.done) {
            return null;
        } else {
            return nextItem.value;
        }
    }

    public ForEach(func: ((item: T) => void)): void {
        const iterator = this.iteratorGetter();
        let item = iterator.next();
        while (!item.done) {
            func(item.value);
            item = iterator.next();
        }
    }

    public GroupBy<TValue>(selector: (item: T) => TValue): Enumerable<Grouping<TValue, T>> {
        const dictionary = new Dictionary<TValue, T[]>();
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

    public GroupJoin<TInner, TKey, TResult>(inner: Enumerable<TInner>,
        outerKeySelector: ((item: T) => TKey),
        innerKeySelector: ((item: TInner) => TKey),
        resultSelector: ((originalRow: T, innerRows: Enumerable<TInner>) => TResult)): Enumerable<TResult> {

        const newIterator = Enumerable.makeIterator<T, TResult>(this.iteratorGetter(), function (sourceIterator) {
            const nextItem = sourceIterator.next();
            if (!nextItem.done) {
                const outerKey = outerKeySelector(nextItem.value);
                const innerRows = inner.Where(i => innerKeySelector(i) === outerKey);
                const result = resultSelector(nextItem.value, innerRows);

                return {
                    done: false,
                    value: result
                }
            }
            return {
                done: true,
                value: <any>null
            }
        });

        return Enumerable.Of(newIterator);
    }

    public Intersect(inner: Enumerable<T>): Enumerable<T> {
        return this.Where(x => inner.Contains(x)).Distinct();
    }

    public Join<TInner, TKey, TResult>(inner: Enumerable<TInner>,
        outerKeySelector: ((item: T) => TKey),
        innerKeySelector: ((item: TInner) => TKey),
        resultSelector: ((originalRow: T, innerRow: TInner) => TResult)): Enumerable<TResult> {

        let currentRow: T | undefined;
        let innerRowsIterator: Iterator<TInner>;
        const newIterator = Enumerable.makeIterator<T, TResult>(this.iteratorGetter(), function (sourceIterator) {
            while (true) {
                if (!currentRow) {
                    const nextItem = sourceIterator.next();
                    if (nextItem.done) {
                        return <IteratorResult<TResult>>{
                            done: true,
                            value: <any>null
                        };
                    }

                    currentRow = nextItem.value;
                    const outerKey = outerKeySelector(currentRow);
                    innerRowsIterator = inner.Where(i => innerKeySelector(i) === outerKey).iteratorGetter();
                }

                const nextInner = innerRowsIterator.next();
                if (nextInner.done) {
                    currentRow = undefined
                } else {
                    const left = currentRow;
                    const right = nextInner.value;

                    const result = resultSelector(left, right);
                    return <IteratorResult<TResult>>{
                        done: false,
                        value: result
                    }
                }
            }
        });

        return Enumerable.Of(newIterator);
    }

    public Last(): T;
    public Last(predicate: ((item: T) => boolean)): T;
    public Last(predicate?: ((item: T) => boolean)): T {
        if (predicate) {
            return this.Reverse().First(predicate);
        } else {
            return this.Reverse().First();
        }
    }

    public LastOrDefault(): T | null;
    public LastOrDefault(predicate: ((item: T) => boolean)): T | null;
    public LastOrDefault(predicate?: ((item: T) => boolean)): T | null {
        if (predicate) {
            return this.Reverse().FirstOrDefault(predicate);
        } else {
            return this.Reverse().FirstOrDefault();
        }
    }

    public Max(): number;
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

    public Min(): number;
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

    public OrderBy(selector: (item: T) => any): OrderedEnumerable<T> {
        return new OrderedEnumerable<T>(this.iteratorGetter, [{ Selector: selector, Direction: 'ASC' }]);
    }

    public OrderByDescending<TReturnType>(selector: (item: T) => TReturnType): OrderedEnumerable<T> {
        return new OrderedEnumerable<T>(this.iteratorGetter, [{ Selector: selector, Direction: 'DESC' }]);
    }

    public Reverse(): Enumerable<T> {
        const src = this.ToArray();
        let pointer = src.length - 1;
        return Enumerable.Of({
            next: function () {
                if (pointer < 0) {
                    return { done: true, value: <any>null }
                }
                return { done: false, value: <T>src[pointer--] }
            }
        });
    }

    public Select<TReturnType>(selector: (item: T) => TReturnType): Enumerable<TReturnType> {
        const newIterator = Enumerable.makeIterator<T, TReturnType>(this.iteratorGetter(), function (sourceIterator) {
            const nextItem = sourceIterator.next();
            if (nextItem.done) {
                return {
                    done: true,
                    value: <any>null
                }
            }
            return {
                done: false,
                value: selector(nextItem.value)
            };
        });
        return Enumerable.Of<TReturnType>(newIterator);
    }

    public SelectMany<TReturnType>(selector: (item: T) => Enumerable<TReturnType>): Enumerable<TReturnType> {
        const foreignRows = this.Select(selector);
        const foreignRowIterator = foreignRows.iteratorGetter();
        let currentRowIterator: Iterator<TReturnType> | undefined;
        const newIterator = Enumerable.makeIterator<T, TReturnType>(this.iteratorGetter(), function (sourceIterator) {
            while (true) {
                if (currentRowIterator) {
                    const nextRow = currentRowIterator.next();
                    if (!nextRow.done) {
                        return {
                            done: false,
                            value: nextRow.value
                        }
                    }
                }

                const nextSet = foreignRowIterator.next();
                if (nextSet.done) {
                    return {
                        done: true,
                        value: <any>null
                    }
                }
                currentRowIterator = nextSet.value.iteratorGetter();
            }
        });
        return Enumerable.Of<TReturnType>(newIterator);
    }

    public SequenceEqual(inner: Enumerable<T>): boolean {
        if (this.Count() !== inner.Count()) {
            return false;
        }

        return this.Zip(inner, (left, right) => { return { left, right } })
            .All(item => item.left === item.right);
    }

    public Single(): T;
    public Single(predicate: ((item: T) => boolean)): T;
    public Single(predicate?: ((item: T) => boolean)): T {
        if (predicate !== undefined) {
            return this.Where(predicate).First();
        }

        const iterator = this.iteratorGetter();
        const nextItem = iterator.next();
        if (nextItem.done) {
            throw new Error('Sequence contains no elements');
        } else if (!iterator.next().done) {
            throw new Error('Sequence contains more than one element');
        } else {
            return nextItem.value;
        }
    }

    public SingleOrDefault(): T | null;
    public SingleOrDefault(predicate: ((item: T) => boolean)): T | null;
    public SingleOrDefault(predicate?: ((item: T) => boolean)): T | null {
        if (predicate !== undefined) {
            return this.Where(predicate).First();
        }

        const iterator = this.iteratorGetter();
        const nextItem = iterator.next();
        if (nextItem.done) {
            return null;
        } else if (!iterator.next().done) {
            return null;
        } else {
            return nextItem.value;
        }
    }

    public Skip(num: number): Enumerable<T> {
        if (num < 0) {
            num = 0;
        }
        let i = 0;
        return this.SkipWhile(item => i++ < num);
    }

    public SkipWhile(predicate: (item: T) => boolean): Enumerable<T> {
        let skipped = false;
        const newIterator = Enumerable.makeIterator<T, T>(this.iteratorGetter(), function (sourceIterator) {
            let currentItem = sourceIterator.next();
            if (!skipped) {
                if (currentItem.done) {
                    return { done: true, value: <any>null };
                }

                while (predicate(currentItem.value)) {
                    currentItem = sourceIterator.next();
                    if (currentItem.done) {
                        return { done: true, value: <any>null };
                    }
                }
                skipped = true;
            }
            return currentItem;
        });

        return Enumerable.Of(newIterator);
    }

    public Sum(): number;
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

    public Take(num: number): Enumerable<T> {
        if (num < 0) {
            num = 0;
        }
        let numTaken = 0;
        const newIterator = Enumerable.makeIterator<T, T>(this.iteratorGetter(), function (sourceIterator) {
            if (numTaken >= num) {
                return { done: true, value: <any>null };
            } else {
                numTaken++;
                return sourceIterator.next();
            }
        });

        return Enumerable.Of(newIterator);
    }

    public TakeWhile(predicate: (item: T) => boolean): Enumerable<T> {
        const newIterator = Enumerable.makeIterator<T, T>(this.iteratorGetter(), function (sourceIterator) {
            const currentItem = sourceIterator.next();
            if (currentItem.done || predicate(currentItem.value)) {
                return currentItem;
            } else {
                return { done: true, value: <any>null };
            }
        });

        return Enumerable.Of(newIterator);
    }

    public ToArray(): T[] {
        const items: T[] = [];
        const iterator = this.iteratorGetter();
        let currentItem = iterator.next();
        while (!currentItem.done) {
            items.push(currentItem.value)
            currentItem = iterator.next();
        }
        return items;
    }

    public ToDictionary<TKey, TValue>(keySelector: (item: T) => TKey): Dictionary<TKey, T>;
    public ToDictionary<TKey, TValue>(keySelector: (item: T) => TKey, valueSelector: (item: T) => TValue): Dictionary<TKey, TValue>;
    public ToDictionary<TKey, TValue>(keySelector: (item: T) => TKey, valueSelector?: (item: T) => TValue): Dictionary<TKey, TValue> | Dictionary<TKey, T> {
        if (valueSelector) {
            const returnDictionary = new Dictionary<TKey, TValue>();
            this.ForEach(item => {
                const key = keySelector(item);
                const value = valueSelector(item);
                returnDictionary.Add(key, value);
            });
            return returnDictionary;
        } else {
            const returnDictionary = new Dictionary<TKey, T>();
            this.ForEach(item => {
                const key = keySelector(item);
                const value = item;
                returnDictionary.Add(key, value);
            });
            return returnDictionary;
        }
    }

    public ToLookup<TKey, TValue>(keySelector: (item: T) => TKey): Lookup<TKey, T>;
    public ToLookup<TKey, TValue>(keySelector: (item: T) => TKey, valueSelector: (item: T) => TValue): Lookup<TKey, TValue>;
    public ToLookup<TKey, TValue>(keySelector: (item: T) => TKey, valueSelector?: (item: T) => TValue): Lookup<TKey, TValue> | Lookup<TKey, T> {
        if (valueSelector) {
            return <Lookup<TKey, TValue>>this.ToDictionary(keySelector, valueSelector);
        }
        return <Lookup<TKey, T>>this.ToDictionary(keySelector);
    }

    public Union(inner: Enumerable<T>): Enumerable<T> {
        return this.Concat(inner).Distinct();
    }

    public Where(predicate: (item: T) => boolean) {
        const newIterator = Enumerable.makeIterator<T, T>(this.iteratorGetter(), function (sourceIterator) {
            let nextItem = sourceIterator.next();
            if (nextItem.done) {
                return nextItem;
            }
            while (!nextItem.done) {
                if (!predicate || predicate(nextItem.value)) {
                    return nextItem;
                }
                nextItem = sourceIterator.next();
            }

            return {
                done: true,
                value: <any>null
            }
        });
        return Enumerable.Of(newIterator);
    }

    public Zip<TInner, TResult>(inner: Enumerable<TInner>, selector: (left: T, right: TInner) => TResult): Enumerable<TResult> {
        const innerIterator = inner.iteratorGetter();
        const newIterator = Enumerable.makeIterator<T, TResult>(this.iteratorGetter(), function (sourceIterator) {
            const left = sourceIterator.next();
            if (left.done) {
                return { done: true, value: <any>null };
            }
            const right = innerIterator.next();
            if (right.done) {
                return { done: true, value: <any>null };
            }
            const result = selector(left.value, right.value);
            return { done: false, value: result };
        });
        return Enumerable.Of(newIterator);
    }
}

export interface OrderInformation<T> {
    Selector: (item: T) => any;
    Direction: 'ASC' | 'DESC'
}

export class OrderedEnumerable<T> extends Enumerable<T> {
    private orders: OrderInformation<T>[]
    public constructor(iteratorGetter: () => Iterator<T>, orders: OrderInformation<T>[]) {
        super(iteratorGetter);
        this.orders = orders;

        const currentSrc = new Enumerable<T>(iteratorGetter);
        let pointer = 0;
        let srcArray: T[] | undefined;
        this.iteratorGetter = () => {
            return {
                next: function () {
                    if (!srcArray) {
                        srcArray = currentSrc.ToArray().sort((left: T, right: T) => {
                            let currentResult = 0;
                            for (let i = 0; i < orders.length; i++) {
                                const order = orders[i];
                                const orderSelector = order.Selector;
                                if (currentResult === 0) {
                                    if (order.Direction === 'ASC') {
                                        currentResult = orderSelector(left) - orderSelector(right);
                                    } else {
                                        currentResult = orderSelector(right) - orderSelector(left);
                                    }
                                }
                            }
                            return currentResult;
                        });
                    }

                    if (pointer >= srcArray.length) {
                        return { done: true, value: <T><any>null };
                    }
                    return { done: false, value: <T>srcArray[pointer++] };
                }
            }
        };
    }

    public ThenBy<TReturnType>(selector: (item: T) => TReturnType): Enumerable<T> {
        return new OrderedEnumerable<T>(this.iteratorGetter, [...this.orders, { Selector: selector, Direction: 'ASC' }]);
    }

    public ThenByDescending<TReturnType>(selector: (item: T) => TReturnType): Enumerable<T> {
        return new OrderedEnumerable<T>(this.iteratorGetter, [...this.orders, { Selector: selector, Direction: 'DESC' }]);
    }
}

export interface KeyValuePair<TKey, TValue> {
    Key: TKey,
    Value: TValue
}

export class Lookup<TKey, TValue> extends Enumerable<KeyValuePair<TKey, TValue>> implements Iterator<KeyValuePair<TKey, TValue>> {
    private pointer = 0;
    protected holder: any = {};
    protected keys: TKey[] = []
    protected values: TValue[] = [];

    protected constructor() {
        super(() => this);
    }

    protected getKey(key: TKey) {
        if (typeof (key) === 'object') {
            return getObjectId(key);
        }
        return JSON.stringify(key);
    }

    public Get(key: TKey): TValue {
        const id = this.getKey(key);
        const result = this.holder[id];
        if (result === undefined) {
            throw new Error('The given key was not present in the dictionary.')
        }
        return result;
    }

    public TryGetValue(key: TKey): TValue | undefined {
        const id = this.getKey(key);
        const result = this.holder[id];
        return result;
    }

    public ContainsKey(key: TKey): boolean {
        const id = this.getKey(key);
        const result = this.holder[id];
        return result !== undefined;
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
    constructor() {
        super();
    }

    public Add(key: TKey, value: TValue): void {
        if (this.TryGetValue(key)) {
            throw new Error('An item with the same key has already been added.');
        }
        const id = this.getKey(key);
        this.holder[id] = value;
        this.keys.push(key);
    }

    public AddOrReplace(key: TKey, value: TValue): void {
        const id = this.getKey(key);
        this.holder[id] = value;
        this.keys.push(key);
    }

    public get Keys(): Enumerable<TKey> {
        return Enumerable.Of(this.keys);
    }

    public get Values(): Enumerable<TValue> {
        return Enumerable.Of(this.values);
    }
}

class EmptyIterator<T> implements Iterator<T> {
    private source: T[];
    private pointer = 0;
    public constructor(source: T[]) {
        this.source = source;
    }
    next(value?: any): IteratorResult<T> {
        if (this.pointer < this.source.length) {
            return {
                done: false,
                value: this.source[this.pointer++]
            }
        } else {
            return {
                done: true,
                value: <any>null
            }
        }
    }

    reset(): void {
        this.pointer = 0;
    }

    clone(): EmptyIterator<T> {
        return new EmptyIterator<T>(this.source);
    }
}
