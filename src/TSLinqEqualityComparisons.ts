// Thanks to http://stackoverflow.com/a/1997811/563532
export const GetObjectIdentity: ((obj: any) => number) = function () {
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

export type EqualityEqualsMethod<T> = (left: T, right: T) => boolean;
export type EqualityGetHashCodeMethod<T> = (item: T) => number | string;
export type EqualityCompareMethod<T> = (left: T, right: T) => number;

export interface EqualityComparer<T> {
    Equals: EqualityEqualsMethod<T>
    GetHashCode: EqualityGetHashCodeMethod<T>;
}

export class DefaultEqualityComparer<T> implements EqualityComparer<T> {
    public Equals(left: T, right: T): boolean {
        return this.GetHashCode(left) === this.GetHashCode(right);
    }
    public GetHashCode(item: T): number | string {
        return DefaultHash(item);
    }
}

export function DefaultHash(item: any): string | number {
    if (typeof (item) === 'object') {
        return GetObjectIdentity(item);
    }
    return JSON.stringify(item);
}
export function DefaultCompare(leftItem: any, rightItem: any): number {
    return leftItem - rightItem;
}
export function DefaultEqual(leftItem: any, rightItem: any): boolean {
    return DefaultHash(leftItem) === DefaultHash(rightItem);
}
