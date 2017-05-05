export class ArrayIterator<T> implements Iterator<T> {
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

    clone(): ArrayIterator<T> {
        return new ArrayIterator<T>(this.source);
    }

    public Count(): number {
        return this.source.length;
    }
    public ElementAt(index: number): T {
        return this.source[index];
    }
}
