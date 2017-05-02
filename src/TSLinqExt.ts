// Thanks to http://stackoverflow.com/a/1997811/563532
const getObjectId: ((obj: any) => number) = function () {
    let id = 0;
    return function (o: any) {
        if (typeof o.__uniqueid === 'undefined') {
            Object.defineProperty(o, '__uniqueid', {
                value: ++id,
                enumerable: false,
                writable: false
            });
        }

        return o.__uniqueid;
    };
}();

export type HashFunction = (item: any) => string | number;
export function DefaultHash(item: any): string | number {
    if (typeof (item) === 'object') {
        return getObjectId(item);
    }
    return JSON.stringify(item);
}

export type CompareFunction = (leftItem: any, rightItem: any) => number;
export function DefaultCompare(leftItem: any, rightItem: any): number {
    return leftItem - rightItem;
}

export type EqualFunction = (leftItem: any, rightItem: any) => boolean;
export function DefaultEqual(leftItem: any, rightItem: any): boolean {
    return DefaultHash(leftItem) === DefaultHash(rightItem);
}
