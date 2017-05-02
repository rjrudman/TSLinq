import { HashFunction, DefaultHash } from './TSLinqExt';
import { Enumerable } from './TSLinq';

export interface KeyValuePair<TKey, TValue> {
    Key: TKey,
    Value: TValue
}

export class Lookup<TKey, TValue> extends Enumerable<KeyValuePair<TKey, TValue>> implements Iterator<KeyValuePair<TKey, TValue>> {
    private pointer = 0;
    protected hashFunction: HashFunction;
    protected holder: any = {};
    protected keys: TKey[] = []
    protected values: TValue[] = [];

    protected constructor(hashFunction: HashFunction = DefaultHash) {
        super(() => this);
        this.hashFunction = hashFunction;
    }

    /**
     * Returns the value associated with the key. If the key is not present, an error is thrown
     * @param key The key to search for.
     */
    public Get(key: TKey): TValue {
        const id = this.hashFunction(key);
        const result = this.holder[id];
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
        const id = this.hashFunction(key);
        const result = this.holder[id];
        return result;
    }

    /**
     * Returns whether or not the key is present
     * @param key The key to search for.
     */
    public ContainsKey(key: TKey): boolean {
        const id = this.hashFunction(key);
        const result = this.holder[id];
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
        return Enumerable.Of(this.values);
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
