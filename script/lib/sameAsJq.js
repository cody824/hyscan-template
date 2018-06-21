(function(window) {

    var getProto = Object.getPrototypeOf;

    var jQuery = {
        isFunction: function(obj) {
            return typeof obj === "function";
        },

        isPlainObject: function(obj) {
            var proto, Ctor;

            // Detect obvious negatives
            // Use toString instead of jQuery.type to catch host objects
            if (!obj || toString.call(obj) !== "[object Object]") {
                return false;
            }

            proto = getProto(obj);

            // Objects with no prototype (e.g., `Object.create( null )`) are plain
            if (!proto) {
                return true;
            }

            // Objects with prototype are plain iff they were constructed by a global Object function
            Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
            return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
        },

        extend: function() {
            var options, name, src, copy, copyIsArray, clone,
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
            if (typeof target !== "object" && !jQuery.isFunction(target)) {
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
                        src = target[name];
                        copy = options[name];

                        // Prevent never-ending loop
                        if (target === copy) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if (deep && copy && (jQuery.isPlainObject(copy) ||
                                (copyIsArray = Array.isArray(copy)))) {

                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && Array.isArray(src) ? src : [];

                            } else {
                                clone = src && jQuery.isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[name] = jQuery.extend(deep, clone, copy);

                            // Don't bring in undefined values
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        },

        remove : function(selector){
            var list = $api.domAll(selector);
            for (var i = 0; i < list.length; i++){
                $api.remove(list[i]);
            }
        },

        prepend : function(selector, html){
            var list = $api.domAll(selector);
            for (var i = 0; i < list.length; i++){
                $api.prepend(list[i], html);
            }
        },

        append : function(selector, html){
            var list = $api.domAll(selector);
            for (var i = 0; i < list.length; i++){
                $api.append(list[i], html);
            }
        }

    };


    window.$ = jQuery;
})(window);
