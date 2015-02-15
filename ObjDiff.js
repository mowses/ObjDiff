/**
 * return deep object differences from 2 objects / arrays
 * @return {object} computed differences
 */

(function($) {

    function ObjDiff(obj1, obj2) {
        var item,
            type_obj1 = $.type(obj1),
            type_obj2 = $.type(obj2),
            diffs = null;

        if (type_obj2 === 'undefined' || type_obj2 === 'null') return obj1;

        switch (type_obj1) {
            case 'array':

                item = [];

                for (var i = 0; i < obj1.length; i++) {
                    diffs = ObjDiff(obj1[i], obj2[i]);

                    if (diffs === undefined && obj1[i] !== undefined) continue;

                    item[i] = diffs;
                }

                if (!item.length && type_obj1 == type_obj2) return undefined;

                break;

            case 'object':

                item = {};

                for (var i in obj1) {
                    diffs = ObjDiff(obj1[i], obj2[i]);

                    if (diffs === undefined && obj1[i] !== undefined) continue;

                    item[i] = diffs;
                }

                if (!Object.keys(item).length) return undefined;

                break;

            default:

                if (obj1 === obj2) return undefined;

                item = obj1;
        }

        return item;
    }

    function ObjDeleted(obj1, obj2) {
        var type_obj1 = $.type(obj1),
            type_obj2 = $.type(obj2),
            deleted,
            sub_deleted;

        if (!obj1) return deleted;

        // get deleted properties from obj1
        // its properties within obj2 that is not present in obj1
        switch (type_obj2) {

            case 'array':
                deleted = [];

                for (var i = 0, t = obj2.length; i < t; i++) {
                    if ($.type(obj1[i]) == 'undefined') {
                        deleted.push(i);
                        continue;
                    }

                    sub_deleted = ObjDeleted(obj1[i], obj2[i]);
                    if (!$.isEmptyObject(sub_deleted)) {
                        deleted.push([i, sub_deleted]);
                    }
                }

                // check if array is empty (length === 0)
                if (!deleted.length) deleted = undefined;

                break;

            case 'object':
                deleted = {};

                for (var i in obj2) {
                    if (!obj1.hasOwnProperty(i)) {
                        deleted[i] = null;
                        continue;
                    }

                    sub_deleted = ObjDeleted(obj1[i], obj2[i]);
                    if (!$.isEmptyObject(sub_deleted)) {
                        deleted[i] = sub_deleted;
                    }

                }

                if ($.isEmptyObject(deleted)) deleted = undefined;

                break;

            default:
        }

        return deleted;
    }

    function delete_properties(obj, properties) {
        if (!obj) return obj;

        switch ($.type(obj)) {
            case 'object':
                obj = $.extend({}, obj);
                break;

            case 'array':
                obj = $.merge([], obj);
                break;

            default:
        }

        switch ($.type(properties)) {

            case 'object':
                $.each(properties, function(key, item) {
                    obj[key] = delete_properties(obj[key], item);
                    if (obj[key] === undefined) {
                        delete obj[key];
                    }
                });
                break;

            case 'array':
                $.each(properties, function(i, index) {
                    obj[index] = delete_properties(obj[index], index);
                });

                obj = $.grep(obj, function(i) {
                    return i === undefined;
                }, true);
                break;

            default:
                obj = undefined;
        }

        return obj;
    }

    // Node: Export function
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.ObjDiff = ObjDiff;
        module.exports.ObjDeleted = ObjDeleted;
        module.exports.delete_properties = delete_properties;
    }
    // AMD/requirejs: Define the module
    else if (typeof define === 'function' && define.amd) {
        define(function() {
            return {
                ObjDiff: ObjDiff,
                ObjDeleted: ObjDeleted,
                delete_properties: delete_properties
            };
        });
    }
    // Browser: Expose to window
    else {
        window.ObjDiff = ObjDiff;
        window.ObjDeleted = ObjDeleted;
        window.delete_properties = delete_properties;
    }

})(jQuery);