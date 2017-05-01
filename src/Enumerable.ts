function isIterator<T>(obj: any): obj is Iterator<T> {
    const it = <Iterator<T>>obj;
    return it.next !== undefined;
}

export interface Grouping<T, TValue> {
    Key: T,
    Values: Enumerable<TValue>
}

export class Enumerable<T> implements Iterable<T> {
    private iteratorGetter: () => Iterator<T>;

    public static Of<T>(source: T[] | Iterator<T>): Enumerable<T> {
        if (isIterator(source)) {
            return new Enumerable<T>(() => source);
        }
        return new Enumerable<T>(() => new EmptyIterator<T>(source));
    }

    private static makeIterator<T, TReturnIteratorType>(sourceIterator: Iterator<T>, next: ((sourceIterator: Iterator<T>) => IteratorResult<TReturnIteratorType>)) {
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

    public Aggregate<TAccumulate, TResult>(
        seed: TAccumulate,
        accumulator: (accumulate: TAccumulate, next: T) => TAccumulate,
        resultSelector: (item: TAccumulate) => TResult = (result) => <TResult><any>result
    ): TResult {
        this.ForEach(a => {
            seed = accumulator(seed, a);
        });

        return resultSelector(seed);
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
            throw new Error('Sequence contains no items');
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
        const keys: TValue[] = [];
        const values: T[][] = [];

        this.ForEach(i => {
            const key = selector(i);
            let keyIndex = keys.indexOf(key);
            if (keyIndex === -1) {
                keys.push(key);
                keyIndex = keys.length - 1;
                values[keyIndex] = [];
            }
            values[keyIndex].push(i);
        });

        const grouping: Grouping<TValue, T>[] = [];
        for (let i = 0; i < keys.length; i++) {
            grouping.push({
                Key: keys[i],
                Values: Enumerable.Of(values[i])
            });
        }

        return Enumerable.Of(grouping);
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

    public Join<TInner, TKey, TResult>(inner: Enumerable<TInner>,
        outerKeySelector: ((item: T) => TKey),
        innerKeySelector: ((item: TInner) => TKey),
        resultSelector: ((originalRow: T, innerRow: TInner) => TResult)): Enumerable<TResult> {

        let currentRow: T | undefined;
        let innerRowsIterator: Iterator<TInner>;
        const newIterator = Enumerable.makeIterator<T, TResult>(this.iteratorGetter(), function (sourceIterator) {
            while (true) {
                if (!currentRow) {
                    let nextItem = sourceIterator.next();
                    if (nextItem.done) {
                        return <IteratorResult<TResult>>{
                            done: true,
                            value: <any>null
                        };
                    }
                    
                    currentRow = nextItem.value;
                    let outerKey = outerKeySelector(currentRow);
                    innerRowsIterator = inner.Where(i => innerKeySelector(i) === outerKey).iteratorGetter();
                }

                let nextInner = innerRowsIterator.next();
                if (nextInner.done) {
                    currentRow = undefined
                } else {
                    let left = currentRow;
                    let right = nextInner.value;

                    let result = resultSelector(left, right);
                    return <IteratorResult<TResult>>{
                        done: false,
                        value: result
                    }
                }
            }
        });

        return Enumerable.Of(newIterator);
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

    public Skip(num: number): Enumerable<T> {
        if (num < 0) {
            num = 0;
        }
        let skipped = false;
        const newIterator = Enumerable.makeIterator<T, T>(this.iteratorGetter(), function (sourceIterator) {
            if (!skipped) {
                let i = 0;
                while (i < num) {
                    sourceIterator.next();
                    i++;
                }
                skipped = true;
            }
            return <IteratorResult<T>>sourceIterator.next()
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
