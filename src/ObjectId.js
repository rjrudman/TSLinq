// Thanks to http://stackoverflow.com/a/1997811/563532
export function getObjectIdFunc() {
    var id = 0;
    return function (o) {
        if (typeof o.__uniqueid == "undefined") {
            Object.defineProperty(o, "__uniqueid", {
                value: ++id,
                enumerable: false,
                // This could go either way, depending on your 
                // interpretation of what an "id" is
                writable: false
            });
        }

        return o.__uniqueid;
    };
};