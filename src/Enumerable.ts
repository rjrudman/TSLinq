function isIterator<T>(obj: any): obj is ResetableIterator<T> {
    const it = <ResetableIterator<T>>obj;
    return it.next !== undefined && it.reset !== undefined;
}

export interface ResetableIterator<T> extends Iterator<T> {
    reset(): void;
}

export class Enumerable<T> implements Iterable<T> {
    private iterator: ResetableIterator<T>;

    public static Of<T>(source: T[] | ResetableIterator<T>): Enumerable<T> {
        if (isIterator(source)) {
            return new Enumerable<T>(source);
        }
        return new Enumerable<T>(new EmptyIterator<T>(source));
    }

    protected constructor(iterator: ResetableIterator<T>) {
        this.iterator = iterator;
    }

    [Symbol.iterator]() {
        this.iterator.reset();
        return this.iterator;
    }

    public Where(predicate: (item: T) => boolean) {
        return new Enumerable<T>(new WhereIterator<T>(this.iterator, predicate));
    }

    public First(predicate: ((item: T) => boolean) | undefined = undefined): T {
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
        return new Enumerable<TReturnType>(new SelectIterator<T, TReturnType>(this.iterator, selector));
    }

    public Skip(num: number): Enumerable<T> {
        for (let i = 0; i < num; i++) {
            const currentItem = this.iterator.next();
            if (currentItem.done) {
                break;
            }
        }
        return Enumerable.Of(this.iterator);
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
}

class WhereIterator<T> implements ResetableIterator<T> {
    private sourceIterator: ResetableIterator<T>;
    private predicate: ((item: T) => boolean) | undefined;

    public constructor(sourceIterator: ResetableIterator<T>, predicate: ((item: T) => boolean) | undefined) {
        this.sourceIterator = sourceIterator;
        this.predicate = predicate;
    }

    public next(): IteratorResult<T> {
        let nextItem = this.sourceIterator.next();
        if (nextItem.done) {
            return nextItem;
        }
        while (!nextItem.done) {
            if (!this.predicate || this.predicate(nextItem.value)) {
                return nextItem;
            }
            nextItem = this.sourceIterator.next();
        }

        return {
            done: true,
            value: <any>null
        }
    }

    public reset(): void {
        this.sourceIterator.reset();
    }
}

class SelectIterator<TSourceType, TReturnType> implements ResetableIterator<TReturnType> {
    private sourceIterator: ResetableIterator<TSourceType>;
    private selector: (item: TSourceType) => TReturnType;

    public constructor(sourceIterator: ResetableIterator<TSourceType>, selector: (item: TSourceType) => TReturnType) {
        this.sourceIterator = sourceIterator;
        this.selector = selector;
    }

    public next(): IteratorResult<TReturnType> {
        const nextItem = this.sourceIterator.next();
        if (nextItem.done) {
            return {
                done: true,
                value: <any>null
            }
        }
        return {
            done: false,
            value: this.selector(nextItem.value)
        };
    }

    public reset(): void {
        this.sourceIterator.reset();
    }
}
