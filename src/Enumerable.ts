function isIterator<T>(obj: any): obj is ResetableIterator<T> {
    const it = <ResetableIterator<T>>obj;
    return it.next !== undefined && it.reset !== undefined;
}

export interface ResetableIterator<T> extends Iterator<T> {
    reset(): void;
    clone(): ResetableIterator<T>;
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
            next: function() {
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
