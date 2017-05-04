# TSLinq

[![Version](https://img.shields.io/npm/v/tslinq.svg)](https://npmjs.com/packages/tslinq)
[![Build Status](https://travis-ci.org/rjrudman/TSLinq.svg?branch=master)](https://travis-ci.org/rjrudman/TSLinq)
[![dependencies Status](https://david-dm.org/rjrudman/tslinq/status.svg)](https://david-dm.org/rjrudman/tslinq)
[![devDependencies Status](https://david-dm.org/rjrudman/tslinq/dev-status.svg)](https://david-dm.org/rjrudman/tslinq?type=dev)
[![Downloads](https://img.shields.io/npm/dm/tslinq.svg)](https://npmjs.com/packages/tslinq)

## Details
TSLinq is an ES5 compatible port of [.NET's LINQ library](https://msdn.microsoft.com/en-us/library/bb308959.aspx) which tries to be as true to the original as possible. 

TSLinq utilises lazily evaluated `Enumerable<T>`'s, rather than eager evaluation found in other libraries. In addition, it supports [ES6 generators](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/function*) allowing for powerful data manipulation.

Ships with a fully functional implementation of `Dictionary<TKey, TValue>()` which supports collision handling, proper identity hashing by default and custom equality comparers.

## Install

```
npm install tslinq
```

## Usage

```typescript
import { Enumerable } from 'tslinq'

let things = Enumerable.Of([1, 2, 3])
    .Select(a => a + 2)
    .Where(a => a < 5)
    .Distinct()
    .ToArray();
    
console.log(things);

// Outputs [ 3, 4 ]
```

## Using ES6 generator functions

```typescript
function* GetNumbers() {
    let i = 0;
    while(true) {
        yield i++;
    }
}

let FirstTenNumbers = Enumerable.Of(GetNumbers)
    .Take(10)
    .ToArray();
    
console.log(FirstTenNumbers);

// Outputs [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
```

## Using manually created generator functions

```typescript
let i = 0;
const generator = () => {
    return {
        next: function () {
            if (i >= 3) {
                throw new Error('Generator should not be invoked when the enumerable hasn\'t been materialized');
            }
            return { done: false, value: i++ };
        }
    };
};

const result =
    Enumerable.Of(generator)
        .Take(3)
        .ToArray();

console.log(result);

// Outputs [ 0, 1, 2 ]
```

### Using Dictionary<TKey, TValue>

#### Basic implementation

```typescript
const objectA: any = {};
const objectB: any = {};

const dictionary = new Dictionary<any, number>();
dictionary.Add(objectA, 5);
dictionary.Add(objectB, 10);

dictionary.Get(objectA); // Returns 5
dictionary.Get(objectB); // Returns 10
```

#### Using a custom equality comparer
```typescript
const objectA: any = {};
const objectB: any = {};

const equalityComparer = {
    Equals: (left: any, right: any) => true,
    GetHashCode: (item: any) => JSON.stringify(item)
};

const dictionary = new Dictionary<any, number>(equalityComparer);
dictionary.Add(objectA, 5);
dictionary.Add(objectB, 10); // Throws an exception, key already exists, as the JSON strings match, 
                             // and we always return true when comparing
```

```typescript
const objectA: any = {};
const objectB: any = {};

const equalityComparer = {
    Equals: (left: any, right: any) => left === right,
    GetHashCode: (item: any) => JSON.stringify(item)
};

const dictionary = new Dictionary<any, number>(equalityComparer);
dictionary.Add(objectA, 5);
dictionary.Add(objectB, 10); // Does not throw - collisions are properly handled,
                             // And we then check for identity equality
```
