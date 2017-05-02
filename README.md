# TSLinq

[![Version](https://img.shields.io/npm/v/tslinq.svg)](https://npmjs.com/packages/tslinq)
[![Build Status](https://travis-ci.org/rjrudman/TSLinq.svg?branch=master)](https://travis-ci.org/rjrudman/TSLinq)
[![dependencies Status](https://david-dm.org/rjrudman/tslinq/status.svg)](https://david-dm.org/rjrudman/tslinq)
[![devDependencies Status](https://david-dm.org/rjrudman/tslinq/dev-status.svg)](https://david-dm.org/rjrudman/tslinq?type=dev)
[![Downloads](https://img.shields.io/npm/dm/tslinq.svg)](https://npmjs.com/packages/tslinq)

## Details
TSLinq is an ES5 compatible port of [.NET's LINQ library](https://msdn.microsoft.com/en-us/library/bb308959.aspx) which tries to be as true to the original as possible. 

TSLinq utilises lazily evaluated `Enumerable<T>`'s, rather than eager evaluation found in other libraries. In addition, it supports [ES6 generators](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/function*) allowing for powerful data manipulation.

## Install

```
npm install tslinq
```

## Usage

```
import { Enumerable } from 'tslinq'

let things = Enumerable.Of([1, 2, 3])
    .Select(a => a + 2)
    .Where(a => a < 5)
    .Distinct()
    .ToArray();
    
console.Log(things);

// Outputs [ 3, 4 ]
```

## Using ES6 generator functions

```
function* GetNumbers() {
    let i = 0;
    while(true) {
        yield i++;
    }
}

let FirstTenNumbers = Enumerable.Of(GetNumbers())
    .Take(10)
    .ToArray();
    
console.log(FirstTenNumbers);

// Outputs [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
```

## Using manually created generator functions

```
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