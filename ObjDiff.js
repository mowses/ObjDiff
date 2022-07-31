export const ObjDiff = function (obj1, obj2) {
    if (obj2 === undefined || (obj2 === null && obj1 !== obj2)) return obj1;

    let item,
        diffs = null;

    if (Array.isArray(obj1)) {
        item = [];

        for (let i = 0, t = obj1.length; i < t; i++) {
            diffs = ObjDiff(obj1[i], obj2[i]);

            if (diffs === undefined && obj1[i] !== undefined) continue;

            item[i] = diffs;
        }

        if (!item.length && Array.isArray(obj2)) return undefined;

    } else if (ObjDiff.prototype.utils.isPlainObject(obj1)) {
        // prevent continue for non plain objects
        // do not use $.isPlainObject because it will fail the tests
        // using $.isPlainObject return FALSE for plain objects with __proto__. should return true
        if (obj1.constructor.name != 'Object') return undefined;

        item = {};

        for (let i in obj1) {
            if (!obj1.hasOwnProperty(i)) continue;
            diffs = ObjDiff(obj1[i], obj2[i]);

            if (diffs === undefined && obj1[i] !== undefined) continue;

            item[i] = diffs;
        }

        if (!Object.keys(item).length) return undefined;
    } else {
        if (obj1 === obj2) return undefined;

        item = obj1;
    }


    return item;
}

export const ObjDeleted = function (obj1, obj2) {
    if (!obj1) return undefined;

    let deleted,
        sub_deleted;

    // get deleted properties from obj1
    // its properties within obj2 that is not present in obj1
    if (Array.isArray(obj2)) {
        deleted = [];

        for (let i = 0, t = obj2.length; i < t; i++) {
            if (obj1[i] === undefined) {
                deleted.push(i);
                continue;
            }

            sub_deleted = ObjDeleted(obj1[i], obj2[i]);
            if (!ObjDiff.prototype.utils.isEmptyObject(sub_deleted)) {
                deleted.push([i, sub_deleted]);
            }
        }

        // check if array is empty (length === 0)
        if (!deleted.length) deleted = undefined;
    } else if (ObjDiff.prototype.utils.isPlainObject(obj2)) {
        // prevent continue for non plain objects
        // do not use $.isPlainObject because it will fail the tests
        // using $.isPlainObject return FALSE for plain objects with __proto__. should return true
        if (obj2.constructor.name != 'Object') return undefined;

        deleted = {};

        for (let i in obj2) {
            if (!obj2.hasOwnProperty(i)) continue;
            // changed line below. See previous version
            // now, we are working the __proto__ properties
            // instead of using "hasOwnProperty" which prevented accessing __proto__ properties
            // now we must travel inside its inherited properties to look for changes
            if (obj1[i] === undefined) {
                deleted[i] = true;  // set deleted items as true
                continue;
            }

            sub_deleted = ObjDeleted(obj1[i], obj2[i]);
            if (!ObjDiff.prototype.utils.isEmptyObject(sub_deleted)) {
                deleted[i] = sub_deleted;
            }

        }

        if (ObjDiff.prototype.utils.isEmptyObject(deleted)) deleted = undefined;
    }

    return deleted;
}

ObjDiff.prototype.utils = {
    isPlainObject: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    },

    isEmptyObject: function (obj) {
        // noinspection LoopStatementThatDoesntLoopJS
        for (const name in obj) {
            return false;
        }
        return true;
    },

    isFunction: function (obj) {
        // Support: Chrome <=57, Firefox <=52
        // In some browsers, typeof returns "function" for HTML <object> elements
        // (i.e., `typeof document.createElement( "object" ) === "function"`).
        // We don't want to classify *any* DOM node as a function.
        // Support: QtWeb <=3.8.5, WebKit <=534.34, wkhtmltopdf tool <=0.12.5
        // Plus for old WebKit, typeof returns "function" for HTML collections
        // (e.g., `typeof document.getElementsByTagName("div") === "function"`). (gh-4756)
        return typeof obj === "function" && typeof obj.nodeType !== "number" &&
            typeof obj.item !== "function";
    },

    isString: function (obj) {
        return typeof obj === 'string' || obj instanceof String;
    },

    inArray: function (elem, arr) {
        return (Array.isArray(arr) ? arr : []).indexOf(elem);
    },

    extend: function () {
        let options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;

            // Skip the boolean and the target
            target = arguments[i] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !ObjDiff.prototype.utils.isFunction(target)) {
            target = {};
        }

        // Extend jQuery itself if only one argument is passed
        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {

            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {

                // Extend the base object
                for (name in options) {
                    // noinspection JSUnfilteredForInLoop
                    let _name = name;
                    copy = options[_name];

                    // Prevent Object.prototype pollution
                    // Prevent never-ending loop
                    if (_name === "__proto__" || target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (ObjDiff.prototype.utils.isPlainObject(copy) ||
                        (copyIsArray = Array.isArray(copy)))) {
                        src = target[_name];

                        // Ensure proper type for the source value
                        if (copyIsArray && !Array.isArray(src)) {
                            clone = [];
                        } else if (!copyIsArray && !ObjDiff.prototype.utils.isPlainObject(src)) {
                            clone = {};
                        } else {
                            clone = src;
                        }
                        copyIsArray = false;

                        // Never move original objects, clone them
                        target[_name] = ObjDiff.prototype.utils.extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[_name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    },
};