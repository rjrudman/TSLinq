function isIterator<T>(obj: any): obj is Iterator<T> {
    let it = <Iterator<T>>obj;
    return it.next !== undefined;
}

export class Enumerable<T> implements Iterable<T> {
    private iterator: Iterator<T>;

    public static Of<T>(source: T[] | Iterator<T>): Enumerable<T> {        
        if (isIterator(source)) {
            return new Enumerable<T>(source);
        }
        return new Enumerable<T>(new EmptyIterator<T>(source));
    }

    protected constructor(iterator: Iterator<T>) {
        this.iterator = iterator;
    }

    [Symbol.iterator]() {
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

    public ToArray(): T[] {
        const items = [];
        let currentItem = this.iterator.next();
        while (!currentItem.done) {
            items.push(currentItem.value)
            currentItem = this.iterator.next();
        }
        return items;
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
            this.pointer = 0;
            return {
                done: true,
                value: <any>null
            }
        }
    }
}

class WhereIterator<T> implements Iterator<T> {
    private sourceIterator: Iterator<T>;
    private predicate: ((item: T) => boolean) | undefined;

    public constructor(sourceIterator: Iterator<T>, predicate: ((item: T) => boolean) | undefined) {
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
}
