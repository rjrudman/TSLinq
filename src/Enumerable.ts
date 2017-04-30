function isIterator<T>(obj: any): obj is ResetableIterator<T> {
    const it = <ResetableIterator<T>>obj;
    return it.next !== undefined && it.reset !== undefined;
}

export interface ResetableIterator<T> extends Iterator<T> {
    reset(): void;
    clone(): ResetableIterator<T>;
}

export interface Grouping<T, TValue> {
    Key: T,
    Values: TValue[]
}

export class Enumerable<T> implements Iterable<T> {
    private iterator: ResetableIterator<T>;
    public static Of<T>(source: T[] | ResetableIterator<T>): Enumerable<T> {
        if (isIterator(source)) {
            return new Enumerable<T>(source);
        }
        return new Enumerable<T>(new EmptyIterator<T>(source));
    }

    private makeIterator<TReturnIteratorType>(sourceIterator: ResetableIterator<T>, next: ((sourceIterator: ResetableIterator<T>) => IteratorResult<TReturnIteratorType>)) {
        const clonedSourceIterator = sourceIterator.clone();
        const makeIterator = this.makeIterator;

        const iterator: ResetableIterator<TReturnIteratorType> = {
            next: function () {
                return next(clonedSourceIterator);
            },
            reset: function () {
                clonedSourceIterator.reset();
            },
            clone: function () {
                return makeIterator(clonedSourceIterator, next);
            }
        }
        return iterator;
    }

    protected constructor(iterator: ResetableIterator<T>) {
        this.iterator = iterator;
    }

    [Symbol.iterator]() {
        this.iterator.reset();
        return this.iterator;
    }

    public Any(): boolean;
    public Any(predicate: ((item: T) => boolean)): boolean;
    public Any(predicate?: (item: T) => boolean) {
        let enumerable = <Enumerable<T>>this;
        if (predicate) {
            enumerable = enumerable.Where(predicate);
        }
        return !enumerable.iterator.next().done;
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
        while (!enumerable.iterator.next().done) {
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
        const newIterator = this.makeIterator<T>(this.iterator, function (sourceIterator) {
            let nextItem = sourceIterator.next();
            if (!nextItem.done) {
                return nextItem;
            } else {
                nextItem = second.iterator.next();
            }
            return nextItem;
        });
        return Enumerable.Of(newIterator);
    };

    public Contains(item: T): boolean {
        return this.Any(a => a === item);
    };


    public Distinct(): Enumerable<T> {
        return this.GroupBy(a => a).Select(a => a.Key);
    }

    public GroupBy<TValue>(selector: (item: T) => TValue): Enumerable<Grouping<TValue, T>> {
        const mapping: any = {}

        this.ForEach(i => {
            const key = JSON.stringify(selector(i));
            if (mapping[key] === undefined) {
                mapping[key] = [];
            }
            mapping[key].push(i);
        });
        const grouping: Grouping<TValue, T>[] = [];
        for (const property in mapping) {
            if (mapping.hasOwnProperty(property)) {
                grouping.push({
                    Key: JSON.parse(property),
                    Values: mapping[property]
                });
            }
        }
        return Enumerable.Of(grouping);
    }

    public Where(predicate: (item: T) => boolean) {
        const newIterator = this.makeIterator<T>(this.iterator, function (sourceIterator) {
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

    public First(): T;
    public First(predicate: ((item: T) => boolean)): T;
    public First(predicate?: ((item: T) => boolean)): T {
        if (predicate !== undefined) {
            return this.Where(predicate).First();
        }
        const nextItem = this.iterator.next();
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
        const nextItem = this.iterator.next();
        if (nextItem.done) {
            return null;
        } else {
            return nextItem.value;
        }
    }

    public ForEach(func: ((item: T) => void)): void {
        let item = this.iterator.next();
        while (!item.done) {
            func(item.value);
            item = this.iterator.next();
        }
    }

    public Select<TReturnType>(selector: (item: T) => TReturnType): Enumerable<TReturnType> {
        const newIterator = this.makeIterator<TReturnType>(this.iterator, function (sourceIterator) {
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
        let skipped = false;
        const newIterator = this.makeIterator<T>(this.iterator, function (sourceIterator) {
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
        const newIterator = this.makeIterator<T>(this.iterator, function (sourceIterator) {
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
        let currentItem = this.iterator.next();
        while (!currentItem.done) {
            items.push(currentItem.value)
            currentItem = this.iterator.next();
        }
        return items;
    }
}

class EmptyIterator<T> implements ResetableIterator<T> {
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
