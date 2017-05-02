import { Lookup } from './TSLinqLookup';
import { HashFunction, DefaultHash } from './TSLinqExt';

export class Dictionary<TKey, TValue> extends Lookup<TKey, TValue> {
    constructor(hashFunction: HashFunction = DefaultHash) {
        super(hashFunction);
    }

    /**
     * Adds a key and value. If they key already exists, an error is thrown.
     * @param key The key to add.
     * @param value The value to add for the supplied key.
     */
    public Add(key: TKey, value: TValue): void {
        if (this.TryGetValue(key)) {
            throw new Error('An item with the same key has already been added.');
        }
        const id = this.hashFunction(key);
        this.holder[id] = value;
        this.keys.push(key);
        this.values.push(value);
    }

    /**
     * Adds a key and value. If they key already exists, it is overwritten with the new value.
     * @param key The key to add.
     * @param value The value to add for the supplied key.
     */
    public AddOrReplace(key: TKey, value: TValue): void {
        const id = this.hashFunction(key);
        const didExist = this.TryGetValue(key);

        if (!didExist) {
            this.keys.push(key);
        }
        this.holder[id] = value;
        this.values.push(value);
    }
}
