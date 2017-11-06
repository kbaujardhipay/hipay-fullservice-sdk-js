/*
 * ! https://github.com/davidchambers/Base64.js
 */
;(function () {

    var object = typeof exports != 'undefined' ? exports : this; // #8: web
    // workers
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    function InvalidCharacterError(message) {
        this.message = message;
    }
    InvalidCharacterError.prototype = new Error;
    InvalidCharacterError.prototype.name = 'InvalidCharacterError';

    // encoder
    // [https://gist.github.com/999166] by [https://github.com/nignag]
    object.btoa || (
        object.btoa = function (input) {
            for (
                // initialize result and counter
                var block, charCode, idx = 0, map = chars, output = '';
                // if the next input index does not exist:
                // change the mapping table to "="
                // check if d has no fractional digits
                input.charAt(idx | 0) || (map = '=', idx % 1);
                // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
                output += map.charAt(63 & block >> 8 - idx % 1 * 8)
            ) {
                charCode = input.charCodeAt(idx += 3/4);
                if (charCode > 0xFF) {
                    throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
                }
                block = block << 8 | charCode;
            }
            return output;
        });

    // decoder
    // [https://gist.github.com/1020396] by [https://github.com/atk]
    object.atob || (
        object.atob = function (input) {
            input = input.replace(/=+$/, '')
            if (input.length % 4 == 1) {
                throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
            }
            for (
                // initialize result and counters
                var bc = 0, bs, buffer, idx = 0, output = '';
                // get next character
                buffer = input.charAt(idx++);
                // character found in table? initialize bit storage and add its ascii
                // value;
                ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                    // and if not first of each 4 characters,
                    // convert the first 8 bits to one ascii character
                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
            ) {
                // try to find character in table (0-63, not found => -1)
                buffer = chars.indexOf(buffer);
            }
            return output;
        });

}());
;
/**
 * Created by jkurc on 28/07/17.
 */
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
    // Detect the `define` function exposed by asynchronous module loaders. The
    // strict `define` check is necessary for compatibility with `r.js`.
    var isLoader = typeof define === "function" && define.amd;

    // A set of types used to distinguish objects from primitives.
    var objectTypes = {
        "function": true,
        "object": true
    };

    // Detect the `exports` object exposed by CommonJS implementations.
    var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

    // Use the `global` object exposed by Node (including Browserify via
    // `insert-module-globals`), Narwhal, and Ringo as the default context,
    // and the `window` object in browsers. Rhino exports a `global` function
    // instead.
    var root = objectTypes[typeof window] && window || this,
        freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

    if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
        root = freeGlobal;
    }

    // Public: Initializes JSON 3 using the given `context` object, attaching the
    // `stringify` and `parse` functions to the specified `exports` object.
    function runInContext(context, exports) {
        context || (context = root["Object"]());
        exports || (exports = root["Object"]());

        // Native constructor aliases.
        var Number = context["Number"] || root["Number"],
            String = context["String"] || root["String"],
            Object = context["Object"] || root["Object"],
            Date = context["Date"] || root["Date"],
            SyntaxError = context["SyntaxError"] || root["SyntaxError"],
            TypeError = context["TypeError"] || root["TypeError"],
            Math = context["Math"] || root["Math"],
            nativeJSON = context["JSON"] || root["JSON"];

        // Delegate to the native `stringify` and `parse` implementations.
        if (typeof nativeJSON == "object" && nativeJSON) {
            exports.stringify = nativeJSON.stringify;
            exports.parse = nativeJSON.parse;
        }

        // Convenience aliases.
        var objectProto = Object.prototype,
            getClass = objectProto.toString,
            isProperty, forEach, undef;

        // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
        var isExtended = new Date(-3509827334573292);
        try {
            // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
            // results for certain dates in Opera >= 10.53.
            isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
                // Safari < 2.0.2 stores the internal millisecond time value correctly,
                // but clips the values returned by the date methods to the range of
                // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
                isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
        } catch (exception) {}

        // Internal: Determines whether the native `JSON.stringify` and `parse`
        // implementations are spec-compliant. Based on work by Ken Snyder.
        function has(name) {
            if (has[name] !== undef) {
                // Return cached feature test result.
                return has[name];
            }
            var isSupported;
            if (name == "bug-string-char-index") {
                // IE <= 7 doesn't support accessing string characters using square
                // bracket notation. IE 8 only supports this for primitives.
                isSupported = "a"[0] != "a";
            } else if (name == "json") {
                // Indicates whether both `JSON.stringify` and `JSON.parse` are
                // supported.
                isSupported = has("json-stringify") && has("json-parse");
            } else {
                var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
                // Test `JSON.stringify`.
                if (name == "json-stringify") {
                    var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
                    if (stringifySupported) {
                        // A test function object with a custom `toJSON` method.
                        (value = function () {
                            return 1;
                        }).toJSON = value;
                        try {
                            stringifySupported =
                                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                                // primitives as object literals.
                                stringify(0) === "0" &&
                                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                                // literals.
                                stringify(new Number()) === "0" &&
                                stringify(new String()) == '""' &&
                                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                                // does not define a canonical JSON representation (this applies to
                                // objects with `toJSON` properties as well, *unless* they are nested
                                // within an object or array).
                                stringify(getClass) === undef &&
                                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                                // FF 3.1b3 pass this test.
                                stringify(undef) === undef &&
                                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                                // respectively, if the value is omitted entirely.
                                stringify() === undef &&
                                // FF 3.1b1, 2 throw an error if the given value is not a number,
                                // string, array, object, Boolean, or `null` literal. This applies to
                                // objects with custom `toJSON` methods as well, unless they are nested
                                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                                // methods entirely.
                                stringify(value) === "1" &&
                                stringify([value]) == "[1]" &&
                                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                                // `"[null]"`.
                                stringify([undef]) == "[null]" &&
                                // YUI 3.0.0b1 fails to serialize `null` literals.
                                stringify(null) == "null" &&
                                // FF 3.1b1, 2 halts serialization if an array contains a function:
                                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                                // elides non-JSON values from objects and arrays, unless they
                                // define custom `toJSON` methods.
                                stringify([undef, getClass, null]) == "[null,null,null]" &&
                                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                                stringify(null, value) === "1" &&
                                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                                // serialize extended years.
                                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                                // The milliseconds are optional in ES 5, but required in 5.1.
                                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                                // four-digit years instead of six-digit years. Credits: @Yaffle.
                                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                                // values less than 1000. Credits: @Yaffle.
                                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
                        } catch (exception) {
                            stringifySupported = false;
                        }
                    }
                    isSupported = stringifySupported;
                }
                // Test `JSON.parse`.
                if (name == "json-parse") {
                    var parse = exports.parse;
                    if (typeof parse == "function") {
                        try {
                            // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
                            // Conforming implementations should also coerce the initial argument to
                            // a string prior to parsing.
                            if (parse("0") === 0 && !parse(false)) {
                                // Simple parsing test.
                                value = parse(serialized);
                                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                                if (parseSupported) {
                                    try {
                                        // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                                        parseSupported = !parse('"\t"');
                                    } catch (exception) {}
                                    if (parseSupported) {
                                        try {
                                            // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                                            // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                                            // certain octal literals.
                                            parseSupported = parse("01") !== 1;
                                        } catch (exception) {}
                                    }
                                    if (parseSupported) {
                                        try {
                                            // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                                            // points. These environments, along with FF 3.1b1 and 2,
                                            // also allow trailing commas in JSON objects and arrays.
                                            parseSupported = parse("1.") !== 1;
                                        } catch (exception) {}
                                    }
                                }
                            }
                        } catch (exception) {
                            parseSupported = false;
                        }
                    }
                    isSupported = parseSupported;
                }
            }
            return has[name] = !!isSupported;
        }

        if (!has("json")) {
            // Common `[[Class]]` name aliases.
            var functionClass = "[object Function]",
                dateClass = "[object Date]",
                numberClass = "[object Number]",
                stringClass = "[object String]",
                arrayClass = "[object Array]",
                booleanClass = "[object Boolean]";

            // Detect incomplete support for accessing string characters by index.
            var charIndexBuggy = has("bug-string-char-index");

            // Define additional utility methods if the `Date` methods are buggy.
            if (!isExtended) {
                var floor = Math.floor;
                // A mapping between the months of the year and the number of days between
                // January 1st and the first of the respective month.
                var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
                // Internal: Calculates the number of days between the Unix epoch and the
                // first day of the given month.
                var getDay = function (year, month) {
                    return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
                };
            }

            // Internal: Determines if a property is a direct property of the given
            // object. Delegates to the native `Object#hasOwnProperty` method.
            if (!(isProperty = objectProto.hasOwnProperty)) {
                isProperty = function (property) {
                    var members = {}, constructor;
                    if ((members.__proto__ = null, members.__proto__ = {
                            // The *proto* property cannot be set multiple times in recent
                            // versions of Firefox and SeaMonkey.
                            "toString": 1
                        }, members).toString != getClass) {
                        // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
                        // supports the mutable *proto* property.
                        isProperty = function (property) {
                            // Capture and break the object's prototype chain (see section 8.6.2
                            // of the ES 5.1 spec). The parenthesized expression prevents an
                            // unsafe transformation by the Closure Compiler.
                            var original = this.__proto__, result = property in (this.__proto__ = null, this);
                            // Restore the original prototype chain.
                            this.__proto__ = original;
                            return result;
                        };
                    } else {
                        // Capture a reference to the top-level `Object` constructor.
                        constructor = members.constructor;
                        // Use the `constructor` property to simulate `Object#hasOwnProperty` in
                        // other environments.
                        isProperty = function (property) {
                            var parent = (this.constructor || constructor).prototype;
                            return property in this && !(property in parent && this[property] === parent[property]);
                        };
                    }
                    members = null;
                    return isProperty.call(this, property);
                };
            }

            // Internal: Normalizes the `for...in` iteration algorithm across
            // environments. Each enumerated key is yielded to a `callback` function.
            forEach = function (object, callback) {
                var size = 0, Properties, members, property;

                // Tests for bugs in the current environment's `for...in` algorithm. The
                // `valueOf` property inherits the non-enumerable flag from
                // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
                (Properties = function () {
                    this.valueOf = 0;
                }).prototype.valueOf = 0;

                // Iterate over a new instance of the `Properties` class.
                members = new Properties();
                for (property in members) {
                    // Ignore all properties inherited from `Object.prototype`.
                    if (isProperty.call(members, property)) {
                        size++;
                    }
                }
                Properties = members = null;

                // Normalize the iteration algorithm.
                if (!size) {
                    // A list of non-enumerable properties inherited from `Object.prototype`.
                    members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
                    // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
                    // properties.
                    forEach = function (object, callback) {
                        var isFunction = getClass.call(object) == functionClass, property, length;
                        var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
                        for (property in object) {
                            // Gecko <= 1.0 enumerates the `prototype` property of functions under
                            // certain conditions; IE does not.
                            if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                                callback(property);
                            }
                        }
                        // Manually invoke the callback for each non-enumerable property.
                        for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
                    };
                } else if (size == 2) {
                    // Safari <= 2.0.4 enumerates shadowed properties twice.
                    forEach = function (object, callback) {
                        // Create a set of iterated properties.
                        var members = {}, isFunction = getClass.call(object) == functionClass, property;
                        for (property in object) {
                            // Store each property name to prevent double enumeration. The
                            // `prototype` property of functions is not enumerated due to cross-
                            // environment inconsistencies.
                            if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                                callback(property);
                            }
                        }
                    };
                } else {
                    // No bugs detected; use the standard `for...in` algorithm.
                    forEach = function (object, callback) {
                        var isFunction = getClass.call(object) == functionClass, property, isConstructor;
                        for (property in object) {
                            if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                                callback(property);
                            }
                        }
                        // Manually invoke the callback for the `constructor` property due to
                        // cross-environment inconsistencies.
                        if (isConstructor || isProperty.call(object, (property = "constructor"))) {
                            callback(property);
                        }
                    };
                }
                return forEach(object, callback);
            };

            // Public: Serializes a JavaScript `value` as a JSON string. The optional
            // `filter` argument may specify either a function that alters how object and
            // array members are serialized, or an array of strings and numbers that
            // indicates which properties should be serialized. The optional `width`
            // argument may be either a string or number that specifies the indentation
            // level of the output.
            if (!has("json-stringify")) {
                // Internal: A map of control characters and their escaped equivalents.
                var Escapes = {
                    92: "\\\\",
                    34: '\\"',
                    8: "\\b",
                    12: "\\f",
                    10: "\\n",
                    13: "\\r",
                    9: "\\t"
                };

                // Internal: Converts `value` into a zero-padded string such that its
                // length is at least equal to `width`. The `width` must be <= 6.
                var leadingZeroes = "000000";
                var toPaddedString = function (width, value) {
                    // The `|| 0` expression is necessary to work around a bug in
                    // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
                    return (leadingZeroes + (value || 0)).slice(-width);
                };

                // Internal: Double-quotes a string `value`, replacing all ASCII control
                // characters (characters with code unit values between 0 and 31) with
                // their escaped equivalents. This is an implementation of the
                // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
                var unicodePrefix = "\\u00";
                var quote = function (value) {
                    var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
                    var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
                    for (; index < length; index++) {
                        var charCode = value.charCodeAt(index);
                        // If the character is a control character, append its Unicode or
                        // shorthand escape sequence; otherwise, append the character as-is.
                        switch (charCode) {
                            case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                            result += Escapes[charCode];
                            break;
                            default:
                                if (charCode < 32) {
                                    result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                                    break;
                                }
                                result += useCharIndex ? symbols[index] : value.charAt(index);
                        }
                    }
                    return result + '"';
                };

                // Internal: Recursively serializes an object. Implements the
                // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
                var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
                    var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
                    try {
                        // Necessary for host object support.
                        value = object[property];
                    } catch (exception) {}
                    if (typeof value == "object" && value) {
                        className = getClass.call(value);
                        if (className == dateClass && !isProperty.call(value, "toJSON")) {
                            if (value > -1 / 0 && value < 1 / 0) {
                                // Dates are serialized according to the `Date#toJSON` method
                                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                                // for the ISO 8601 date time string format.
                                if (getDay) {
                                    // Manually compute the year, month, date, hours, minutes,
                                    // seconds, and milliseconds if the `getUTC*` methods are
                                    // buggy. Adapted from @Yaffle's `date-shim` project.
                                    date = floor(value / 864e5);
                                    for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                                    for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                                    date = 1 + date - getDay(year, month);
                                    // The `time` value specifies the time within the day (see ES
                                    // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                                    // to compute `A modulo B`, as the `%` operator does not
                                    // correspond to the `modulo` operation for negative numbers.
                                    time = (value % 864e5 + 864e5) % 864e5;
                                    // The hours, minutes, seconds, and milliseconds are obtained by
                                    // decomposing the time within the day. See section 15.9.1.10.
                                    hours = floor(time / 36e5) % 24;
                                    minutes = floor(time / 6e4) % 60;
                                    seconds = floor(time / 1e3) % 60;
                                    milliseconds = time % 1e3;
                                } else {
                                    year = value.getUTCFullYear();
                                    month = value.getUTCMonth();
                                    date = value.getUTCDate();
                                    hours = value.getUTCHours();
                                    minutes = value.getUTCMinutes();
                                    seconds = value.getUTCSeconds();
                                    milliseconds = value.getUTCMilliseconds();
                                }
                                // Serialize extended years correctly.
                                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                                    "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                                    // Months, dates, hours, minutes, and seconds should have two
                                    // digits; milliseconds should have three.
                                    "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                                    // Milliseconds are optional in ES 5.0, but required in 5.1.
                                    "." + toPaddedString(3, milliseconds) + "Z";
                            } else {
                                value = null;
                            }
                        } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
                            // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
                            // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
                            // ignores all `toJSON` methods on these objects unless they are
                            // defined directly on an instance.
                            value = value.toJSON(property);
                        }
                    }
                    if (callback) {
                        // If a replacement function was provided, call it to obtain the value
                        // for serialization.
                        value = callback.call(object, property, value);
                    }
                    if (value === null) {
                        return "null";
                    }
                    className = getClass.call(value);
                    if (className == booleanClass) {
                        // Booleans are represented literally.
                        return "" + value;
                    } else if (className == numberClass) {
                        // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
                        // `"null"`.
                        return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
                    } else if (className == stringClass) {
                        // Strings are double-quoted and escaped.
                        return quote("" + value);
                    }
                    // Recursively serialize objects and arrays.
                    if (typeof value == "object") {
                        // Check for cyclic structures. This is a linear search; performance
                        // is inversely proportional to the number of unique nested objects.
                        for (length = stack.length; length--;) {
                            if (stack[length] === value) {
                                // Cyclic structures cannot be serialized by `JSON.stringify`.
                                throw TypeError();
                            }
                        }
                        // Add the object to the stack of traversed objects.
                        stack.push(value);
                        results = [];
                        // Save the current indentation level and indent one additional level.
                        prefix = indentation;
                        indentation += whitespace;
                        if (className == arrayClass) {
                            // Recursively serialize array elements.
                            for (index = 0, length = value.length; index < length; index++) {
                                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                                results.push(element === undef ? "null" : element);
                            }
                            result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
                        } else {
                            // Recursively serialize object members. Members are selected from
                            // either a user-specified list of property names, or the object
                            // itself.
                            forEach(properties || value, function (property) {
                                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                                if (element !== undef) {
                                    // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                                    // is not the empty string, let `member` {quote(property) + ":"}
                                    // be the concatenation of `member` and the `space` character."
                                    // The "`space` character" refers to the literal space
                                    // character, not the `space` {width} argument provided to
                                    // `JSON.stringify`.
                                    results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                                }
                            });
                            result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
                        }
                        // Remove the object from the traversed object stack.
                        stack.pop();
                        return result;
                    }
                };

                // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
                exports.stringify = function (source, filter, width) {
                    var whitespace, callback, properties, className;
                    if (objectTypes[typeof filter] && filter) {
                        if ((className = getClass.call(filter)) == functionClass) {
                            callback = filter;
                        } else if (className == arrayClass) {
                            // Convert the property names array into a makeshift set.
                            properties = {};
                            for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
                        }
                    }
                    if (width) {
                        if ((className = getClass.call(width)) == numberClass) {
                            // Convert the `width` to an integer and create a string containing
                            // `width` number of space characters.
                            if ((width -= width % 1) > 0) {
                                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
                            }
                        } else if (className == stringClass) {
                            whitespace = width.length <= 10 ? width : width.slice(0, 10);
                        }
                    }
                    // Opera <= 7.54u2 discards the values associated with empty string keys
                    // (`""`) only if they are used directly within an object member list
                    // (e.g., `!("" in { "": 1})`).
                    return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
                };
            }

            // Public: Parses a JSON source string.
            if (!has("json-parse")) {
                var fromCharCode = String.fromCharCode;

                // Internal: A map of escaped control characters and their unescaped
                // equivalents.
                var Unescapes = {
                    92: "\\",
                    34: '"',
                    47: "/",
                    98: "\b",
                    116: "\t",
                    110: "\n",
                    102: "\f",
                    114: "\r"
                };

                // Internal: Stores the parser state.
                var Index, Source;

                // Internal: Resets the parser state and throws a `SyntaxError`.
                var abort = function () {
                    Index = Source = null;
                    throw SyntaxError();
                };

                // Internal: Returns the next token, or `"$"` if the parser has reached
                // the end of the source string. A token may be a string, number, `null`
                // literal, or Boolean literal.
                var lex = function () {
                    var source = Source, length = source.length, value, begin, position, isSigned, charCode;
                    while (Index < length) {
                        charCode = source.charCodeAt(Index);
                        switch (charCode) {
                            case 9: case 10: case 13: case 32:
                            // Skip whitespace tokens, including tabs, carriage returns, line
                            // feeds, and space characters.
                            Index++;
                            break;
                            case 123: case 125: case 91: case 93: case 58: case 44:
                            // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                            // the current position.
                            value = charIndexBuggy ? source.charAt(Index) : source[Index];
                            Index++;
                            return value;
                            case 34:
                                // `"` delimits a JSON string; advance to the next character and
                                // begin parsing the string. String tokens are prefixed with the
                                // sentinel `@` character to distinguish them from punctuators and
                                // end-of-string tokens.
                                for (value = "@", Index++; Index < length;) {
                                    charCode = source.charCodeAt(Index);
                                    if (charCode < 32) {
                                        // Unescaped ASCII control characters (those with a code unit
                                        // less than the space character) are not permitted.
                                        abort();
                                    } else if (charCode == 92) {
                                        // A reverse solidus (`\`) marks the beginning of an escaped
                                        // control character (including `"`, `\`, and `/`) or Unicode
                                        // escape sequence.
                                        charCode = source.charCodeAt(++Index);
                                        switch (charCode) {
                                            case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                                            // Revive escaped control characters.
                                            value += Unescapes[charCode];
                                            Index++;
                                            break;
                                            case 117:
                                                // `\u` marks the beginning of a Unicode escape sequence.
                                                // Advance to the first character and validate the
                                                // four-digit code point.
                                                begin = ++Index;
                                                for (position = Index + 4; Index < position; Index++) {
                                                    charCode = source.charCodeAt(Index);
                                                    // A valid sequence comprises four hexdigits (case-
                                                    // insensitive) that form a single hexadecimal value.
                                                    if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                                                        // Invalid Unicode escape sequence.
                                                        abort();
                                                    }
                                                }
                                                // Revive the escaped character.
                                                value += fromCharCode("0x" + source.slice(begin, Index));
                                                break;
                                            default:
                                                // Invalid escape sequence.
                                                abort();
                                        }
                                    } else {
                                        if (charCode == 34) {
                                            // An unescaped double-quote character marks the end of the
                                            // string.
                                            break;
                                        }
                                        charCode = source.charCodeAt(Index);
                                        begin = Index;
                                        // Optimize for the common case where a string is valid.
                                        while (charCode >= 32 && charCode != 92 && charCode != 34) {
                                            charCode = source.charCodeAt(++Index);
                                        }
                                        // Append the string as-is.
                                        value += source.slice(begin, Index);
                                    }
                                }
                                if (source.charCodeAt(Index) == 34) {
                                    // Advance to the next character and return the revived string.
                                    Index++;
                                    return value;
                                }
                                // Unterminated string.
                                abort();
                            default:
                                // Parse numbers and literals.
                                begin = Index;
                                // Advance past the negative sign, if one is specified.
                                if (charCode == 45) {
                                    isSigned = true;
                                    charCode = source.charCodeAt(++Index);
                                }
                                // Parse an integer or floating-point value.
                                if (charCode >= 48 && charCode <= 57) {
                                    // Leading zeroes are interpreted as octal literals.
                                    if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                                        // Illegal octal literal.
                                        abort();
                                    }
                                    isSigned = false;
                                    // Parse the integer component.
                                    for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                                    // Floats cannot contain a leading decimal point; however, this
                                    // case is already accounted for by the parser.
                                    if (source.charCodeAt(Index) == 46) {
                                        position = ++Index;
                                        // Parse the decimal component.
                                        for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                                        if (position == Index) {
                                            // Illegal trailing decimal.
                                            abort();
                                        }
                                        Index = position;
                                    }
                                    // Parse exponents. The `e` denoting the exponent is
                                    // case-insensitive.
                                    charCode = source.charCodeAt(Index);
                                    if (charCode == 101 || charCode == 69) {
                                        charCode = source.charCodeAt(++Index);
                                        // Skip past the sign following the exponent, if one is
                                        // specified.
                                        if (charCode == 43 || charCode == 45) {
                                            Index++;
                                        }
                                        // Parse the exponential component.
                                        for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                                        if (position == Index) {
                                            // Illegal empty exponent.
                                            abort();
                                        }
                                        Index = position;
                                    }
                                    // Coerce the parsed value to a JavaScript number.
                                    return +source.slice(begin, Index);
                                }
                                // A negative sign may only precede numbers.
                                if (isSigned) {
                                    abort();
                                }
                                // `true`, `false`, and `null` literals.
                                if (source.slice(Index, Index + 4) == "true") {
                                    Index += 4;
                                    return true;
                                } else if (source.slice(Index, Index + 5) == "false") {
                                    Index += 5;
                                    return false;
                                } else if (source.slice(Index, Index + 4) == "null") {
                                    Index += 4;
                                    return null;
                                }
                                // Unrecognized token.
                                abort();
                        }
                    }
                    // Return the sentinel `$` character if the parser has reached the end
                    // of the source string.
                    return "$";
                };

                // Internal: Parses a JSON `value` token.
                var get = function (value) {
                    var results, hasMembers;
                    if (value == "$") {
                        // Unexpected end of input.
                        abort();
                    }
                    if (typeof value == "string") {
                        if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
                            // Remove the sentinel `@` character.
                            return value.slice(1);
                        }
                        // Parse object and array literals.
                        if (value == "[") {
                            // Parses a JSON array, returning a new JavaScript array.
                            results = [];
                            for (;; hasMembers || (hasMembers = true)) {
                                value = lex();
                                // A closing square bracket marks the end of the array literal.
                                if (value == "]") {
                                    break;
                                }
                                // If the array literal contains elements, the current token
                                // should be a comma separating the previous element from the
                                // next.
                                if (hasMembers) {
                                    if (value == ",") {
                                        value = lex();
                                        if (value == "]") {
                                            // Unexpected trailing `,` in array literal.
                                            abort();
                                        }
                                    } else {
                                        // A `,` must separate each array element.
                                        abort();
                                    }
                                }
                                // Elisions and leading commas are not permitted.
                                if (value == ",") {
                                    abort();
                                }
                                results.push(get(value));
                            }
                            return results;
                        } else if (value == "{") {
                            // Parses a JSON object, returning a new JavaScript object.
                            results = {};
                            for (;; hasMembers || (hasMembers = true)) {
                                value = lex();
                                // A closing curly brace marks the end of the object literal.
                                if (value == "}") {
                                    break;
                                }
                                // If the object literal contains members, the current token
                                // should be a comma separator.
                                if (hasMembers) {
                                    if (value == ",") {
                                        value = lex();
                                        if (value == "}") {
                                            // Unexpected trailing `,` in object literal.
                                            abort();
                                        }
                                    } else {
                                        // A `,` must separate each object member.
                                        abort();
                                    }
                                }
                                // Leading commas are not permitted, object property names must be
                                // double-quoted strings, and a `:` must separate each property
                                // name and value.
                                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                                    abort();
                                }
                                results[value.slice(1)] = get(lex());
                            }
                            return results;
                        }
                        // Unexpected token encountered.
                        abort();
                    }
                    return value;
                };

                // Internal: Updates a traversed object member.
                var update = function (source, property, callback) {
                    var element = walk(source, property, callback);
                    if (element === undef) {
                        delete source[property];
                    } else {
                        source[property] = element;
                    }
                };

                // Internal: Recursively traverses a parsed JSON object, invoking the
                // `callback` function for each value. This is an implementation of the
                // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
                var walk = function (source, property, callback) {
                    var value = source[property], length;
                    if (typeof value == "object" && value) {
                        // `forEach` can't be used to traverse an array in Opera <= 8.54
                        // because its `Object#hasOwnProperty` implementation returns `false`
                        // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
                        if (getClass.call(value) == arrayClass) {
                            for (length = value.length; length--;) {
                                update(value, length, callback);
                            }
                        } else {
                            forEach(value, function (property) {
                                update(value, property, callback);
                            });
                        }
                    }
                    return callback.call(source, property, value);
                };

                // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
                exports.parse = function (source, callback) {
                    var result, value;
                    Index = 0;
                    Source = "" + source;
                    result = get(lex());
                    // If a JSON string contains multiple tokens, it is invalid.
                    if (lex() != "$") {
                        abort();
                    }
                    // Reset the parser state.
                    Index = Source = null;
                    return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
                };
            }
        }

        exports["runInContext"] = runInContext;
        return exports;
    }

    if (freeExports && !isLoader) {
        // Export for CommonJS environments.
        runInContext(root, freeExports);
    } else {
        // Export for web browsers and JavaScript engines.
        var nativeJSON = root.JSON,
            previousJSON = root["JSON3"],
            isRestored = false;

        var JSON3 = runInContext(root, (root["JSON3"] = {
            // Public: Restores the original value of the global `JSON` object and
            // returns a reference to the `JSON3` object.
            "noConflict": function () {
                if (!isRestored) {
                    isRestored = true;
                    root.JSON = nativeJSON;
                    root["JSON3"] = previousJSON;
                    nativeJSON = previousJSON = null;
                }
                return JSON3;
            }
        }));

        root.JSON = {
            "parse": JSON3.parse,
            "stringify": JSON3.stringify
        };
    }

    // Export for asynchronous module loaders.
    if (isLoader) {
        define(function () {
            return JSON3;
        });
    }
}).call(this);
;

/**
 * HiPay Fullservice library
 *
 * @class HiPay
 * @param {HiPay} HiPay
 *
 */
var HiPay = (function (HiPay) {

    var HiPay = {};

    /**
     *
     * @class HiPay.Form
     *
     */
    HiPay.Form = {};
    /**
     * Locale fr_FR ...
     * @attribute HiPay.Form.locale
     *
     */
    HiPay.Form.locale = "fr_FR";

    var _endPointTokenize = {
        stage: 'https://stage-secure2-vault.hipay-tpp.com/rest/v2/token/create.json',
        prod: 'https://secure2-vault.hipay-tpp.com/rest/v2/token/create.json'
    };
    var _translationJSON = {
        "en_EN" : {
            "FORM_CVV_3_HELP_MESSAGE": "For security reasons, you have to enter your card security code (CVC). It's the 3-digits number on the back of your card for VISA®, MASTERCARD® and MAESTRO®.",
            "FORM_CVV_4_HELP_MESSAGE": "For security reasons, you have to enter your card security code (CVC). The AMERICAN EXPRESS security code is the 4-digits number on the front of your card.",

            // error message
            "FORM_ERROR_INVALID_CARD_NUMBER": "Invalid card number.",
            "FORM_ERROR_INVALID_EXPIRY_DATE_PAST": "The expiration date is already past.",
            "FORM_ERROR_INVALID_MONTH_EXPIRY_DATE": "The month field must be between 1 and 12.",
            "FORM_ERROR_INVALID_CVV": "The CVV field must contain %NUMBER% digits.",
            "FORM_ERROR_DEFAULT": "An error occured.",


        },
        "fr_FR" : {
            "FORM_CVV_3_HELP_MESSAGE" : "Pour des raisons de sécurité, vous devez indiquer le code de sécurité (CVC). Ce code correspond aux 3 chiffres visibles au verso de votre carte VISA®, MASTERCARD® and MAESTRO®.",
            "FORM_CVV_4_HELP_MESSAGE" : "Pour des raisons de sécurité, vous devez indiquer le code de sécurité (CVC). Le code de securité AMERICAN EXPRESS est un nombre à 4 chiffres au recto de votre carte.",
            // error message
            "FORM_ERROR_INVALID_CARD_NUMBER": "Numéro de carte invalide.",
            "FORM_ERROR_INVALID_EXPIRY_DATE_PAST": "La date est inférieure à la date actuelle.",
            "FORM_ERROR_INVALID_MONTH_EXPIRY_DATE": "Le mois doit être compris entre 1 et 12.",
            "FORM_ERROR_INVALID_CVV": "Le champ CVV doit contenir %NUMBER% caractères.",
            "FORM_ERROR_DEFAULT": "Une erreur est survenue.",
        },
    };

    var _getLocaleTranslationWithId = function(id) {
        return _translationJSON[HiPay.Form.locale][id];
    };

    var _colorInput = {
        'default': '#005a94',
        'error': '#ff0000',
    };

    var _cvvContainerId = "container-cvv-help-message";

    var _idInputMapper = {
        cardNumber: 'input-card',
        cardType: 'card-type',
        cardHolder: 'input-name',
        cardExpiryDate: 'input-expiry-date',
        // expiryMonth: 'input-month',
        // expiryYear: 'input-year',
        cardCVV: 'input-cvv'
    };

    var _idCVVMapper = {
        card_visa_info: "CVV",
        card_mastercard_info: "CVC",
        card_american_express_info: "CID"

    };
    var _cardImg = {
        card_visa_info: "ic_credit_card_visa.png",
        card_mastercard_info: "ic_credit_card_mastercard.png",
        card_diners_info: "ic_credit_card_diners.png",
        card_american_express_info: "ic_credit_card_amex.png",
        card_maestro_info: "ic_credit_card_maestro.png"
    }

    var _cardFormatDefinition = {
        card_visa_info:
            {
                "ranges":[
                    {
                        "first": 4,
                        "variable": null
                    }
                ],

                "lengths": {
                    "length": 16,
                    "variable": null
                },

                "format":[4,4,4]
            },
        card_mastercard_info:
            {
                "ranges":[

                    {
                        "first": 51,
                        "variable": 4
                    }
                ],

                "lengths": {
                    "length": 16,
                    "variable": null
                },

                "format":[4,4,4]
            },
        card_diners_info:
            {
                "ranges":[

                    {
                        "first": 300,
                        "variable": 5
                    },

                    {
                        "first": 38,
                        "variable": 1
                    },

                    {
                        "first": 2014,
                        "variable": null
                    },

                    {
                        "first": 2149,
                        "variable": null
                    },

                    {
                        "first": 309,
                        "variable": null
                    },

                    {
                        "first": 36,
                        "variable": null
                    }
                ],
                "lengths": {
                    "length": 14,
                    "variable": 1
                },

                "format":[4,6]
            },
        card_american_express_info:
            {
                "ranges":[

                    {
                        "first": 34,
                        "variable": null
                    },

                    {
                        "first": 37,
                        "variable": null
                    }

                ],

                "lengths": {
                    "length": 15,
                    "variable": null
                },

                "format":[4,6]
            },
        card_maestro_info:
            {
                "ranges":[

                    {
                        "first": 50,
                        "variable": null
                    },

                    {
                        "first": 56,
                        "variable": 13
                    }

                ],

                "lengths": {
                    "length": 12,
                    "variable": 7
                },

                "format":[4,4,4,4]
            }
    };





    function isIE () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    };
    /**
     * dump
     */
    function dump(obj) {
        var out = '';
        for (var i in obj) {
            out += i + ": " + obj[i] + " - ";
        }

        alert(out);

        // or, if you wanted to avoid alerts...

        // var pre = document.createElement('pre');
        // pre.innerHTML = out;
        // document.body.appendChild(pre)
    };

    var _isBrowser=new Function("try {return this===window;}catch(e){ return false;}");


    var _extend = function () {

        // Variablesbtoa
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;

        // Check if a deep merge
        if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
            deep = arguments[0];
            i++;
        }

        // Merge the object into the extended object
        var merge = function (obj) {
            for ( var prop in obj ) {
                if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                    // If deep merge and property is an object, merge properties
                    if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                        extended[prop] = extend( true, extended[prop], obj[prop] );
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for ( ; i < length; i++ ) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;

    };



    var _Error = function (code, message) {
        _processObjectPayload(this, {
            code: code,
            message: message
        });
    };

    // Properties: browser compatibility
    var _canDefineProperty = (typeof Object.defineProperty === 'function');

    if (_canDefineProperty) {
        try {
            Object.defineProperty({}, 'x', {});
        } catch (e) {
            _canDefineProperty = false;
        }
    }

    if (_canDefineProperty) {
        Object.defineProperties(HiPay, {

            allowedParameters: {
                enumerable: true, writable: true, value:{
                    'card_number':true,
                    'card_holder':true,
                    'card_expiry_month':true,
                    'card_expiry_year':true,
                    'cvc':true,
                    'multi_use':true,
                    'generate_request_id':true
                }
            },

            /**
             * The target type stage or production to make API calls in stage or production.
             *
             * @property target
             * @default "production"
             * @type string
             * @example
             *    HiPay.target = "stage";
             */

            target: {enumerable: true, writable: true, value:'production'},

            /**
             * The username. You must provide this value in order to be able to make API calls.
             *
             * @property username
             * @type string
             */

            username: {enumerable: false, writable: true},

            /**
             * The user public key. You must provide this value in order to be able to make API calls.
             *
             * @property publicKey
             * @type string
             */

            publicKey: {enumerable: false, writable: true}
        });
    }

    else {
        allowedParameters = {
            enumerable: true, writable: true, value:{
                'card_number':true,
                'card_holder':true,
                'card_expiry_month':true,
                'card_expiry_year':true,
                'cvc':true,
                'multi_use':true,
                'generate_request_id':true
            }
        }
        HiPayPrivate.target = 'production';
    }

    // Define property helper
    var _defineProperties = function(object, properties) {
        for (var key in properties) {
            // properties[key].propertyDescriptors = Object.assign({}, {enumerable: true, writable: false, configurable: false}, properties[key].propertyDescriptors || {});
            properties[key].propertyDescriptors = _extend({}, {enumerable: true, writable: false, configurable: false}, properties[key].propertyDescriptors || {});

        }
        // var mapping = Object.assign({}, object.prototype._mapping || {}, properties);
        var mapping = _extend({}, object.prototype._mapping || {}, properties);


        if (_canDefineProperty) {
            Object.defineProperties(object.prototype, {
                "_mapping": {
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: mapping
                }
            });

        } else {
            object.prototype._mapping = mapping;
        }

        if (_canDefineProperty) {
            var propConfig = {};
            for (var key in properties) {
                var valueProp = properties[key];
                propConfig[valueProp.name] = valueProp.propertyDescriptors;
            }

            Object.defineProperties(object.prototype, propConfig);
        }
    };

    var _bootstrapInstanceProperties = function (instance) {
        if (_canDefineProperty) {
            var propertyConfig = [];
            for (var key in instance._mapping) {
                // $.each(instance._mapping, function (key, val) {
                var val =  instance._mapping[key];
                propertyConfig[val.name] = _extend({}, true, val.propertyDescriptors.clone, {
                    writable: true,
                    configurable: true
                });
                // });
            }
            Object.defineProperties(instance, propertyConfig);
        }
    };

    var _doGetCaretPosition = function (ctrl)
    {
        var CaretPos = 0;

        if (ctrl.selectionStart || ctrl.selectionStart == 0)
        {// Standard.
            CaretPos = ctrl.selectionStart;
        }
        else if (document.selection)
        {// Legacy IE
            ctrl.focus ();
            var Sel = document.selection.createRange ();
            Sel.moveStart ('character', -ctrl.value.length);
            CaretPos = Sel.text.length;
        }

        return (CaretPos);
    }

    var _setCaretPosition = function(ctrl,pos)
    {
        if (ctrl.setSelectionRange)
        {
            ctrl.focus();
            ctrl.setSelectionRange(pos,pos);
        }
        else if (ctrl.createTextRange)
        {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    var _getSelection = function (target) {
        var s = {start: 0, end:0};
        if (typeof target.selectionStart == "number"
            && typeof target.selectionEnd == "number") {
            // Firefox (and others)
            s.start = target.selectionStart;
            s.end = target.selectionEnd;
        } else if (document.selection) {
            // IE
            var bookmark = document.selection.createRange().getBookmark();
            var sel = target.createTextRange();
            var bfr = sel.duplicate();
            sel.moveToBookmark(bookmark);
            bfr.setEndPoint("EndToStart", sel);
            s.start = bfr.text.length;
            s.end = s.start + sel.text.length;
        }
        return s;
    }


    var _instanceServiceCreditCard = null;

    var _serviceCreditCard = function(charCode) {

        var serviceCreditCard = {};

        serviceCreditCard.creditCardHolderLengthMax = 60;
        serviceCreditCard.creditCardCVVLengthMax = 3;
        serviceCreditCard.cardFormatArray = [];

        serviceCreditCard.getCreditCardHolderInput = function() {
            return document.getElementById(_idInputMapper.cardHolder);
        };

        serviceCreditCard.getCreditCardNumberInput = function() {
            return document.getElementById(_idInputMapper.cardNumber);
        };

        serviceCreditCard.getCreditCardNumberValue = function() {
            return serviceCreditCard.getCreditCardNumberInput().value;
        };



        serviceCreditCard.getCardFormatArray = function() {

        };

        serviceCreditCard.getCreditCardCVVLengthMax = function(forceReload) {
            if (serviceCreditCard.creditCardCVVLengthMax == undefined || forceReload == undefined || forceReload == true) {


                var arrayFormatCVV = ['34', '35', '36', '37'];
                var creditCardNumber = document.getElementById(_idInputMapper.cardNumber).value;
                for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length; indexFormatCVV++) {

                    if (creditCardNumber.value != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }
            }
            return serviceCreditCard.creditCardCVVLengthMax;
        };



        /* @ todo clean init */
        serviceCreditCard.getCardTypeId = function() {
            serviceCreditCard.initInfoCardWithCardNumber();
            return serviceCreditCard.idType;
        }


        serviceCreditCard.getTypeWithCardNumber = function(creditCardNumber) {


            var cardType;
            for (var propt in _cardFormatDefinition) {

                /* range */

                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (creditCardNumber.indexOf(startNumber) === 0) {

                                serviceCreditCard.idType = propt;
                                cardType = propt;


                                break;
                            } else {

                            }
                        }
                    } else {

                        if (creditCardNumber.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            serviceCreditCard.idType = propt;
                            cardType = propt;
                            break;
                        }
                    }
                }
                /* ./ range */
            }

            return cardType;

        };


        serviceCreditCard.initInfoCardWithCardNumber = function(creditCardNumber) {

            if (creditCardNumber == undefined) {
                creditCardNumber = document.getElementById(_idInputMapper.cardNumber).value;
            }


            if (document.getElementById(_idInputMapper.cardType)) {
                // document.getElementById(_idInputMapper.cardType).src = undefined;
                document.getElementById(_idInputMapper.cardType).src = "";
                document.getElementById(_idInputMapper.cardType).setAttribute('style', 'display:none;');
            }
            for (var propt in _cardFormatDefinition) {

                /* range */

                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (creditCardNumber.indexOf(startNumber) === 0) {

                                // document.getElementById(_idInputMapper.cardType).innerHTML = propt;

                                serviceCreditCard.idType = propt;
                                // document.getElementById(_idInputMapper.cardType).innerHTML = '<img width="28px" src="./assets/type/' + _cardImg[propt] + '">';
                                document.getElementById(_idInputMapper.cardType).src = "./assets/type/" + _cardImg[propt];
                                document.getElementById(_idInputMapper.cardType).setAttribute('style','display:block;');


                                serviceCreditCard.cardFormatArray = _cardFormatDefinition[propt]["format"];
                                /* length */
                                serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                                if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                    serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                                }
                                /* ./ length */

                                break;
                            } else {

                            }
                        }
                    } else {

                        if (creditCardNumber.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            // document.getElementById(_idInputMapper.cardType).innerHTML = propt;
                            serviceCreditCard.idType = propt;
                            // document.getElementById(_idInputMapper.cardType).innerHTML = '<img width="28px" src="./assets/type/' + _cardImg[propt] + '">';

                            document.getElementById(_idInputMapper.cardType).src = "./assets/type/" + _cardImg[propt];
                            document.getElementById(_idInputMapper.cardType).setAttribute('style','display:block;');


                            serviceCreditCard.cardFormatArray = _cardFormatDefinition[propt]["format"];
                            /* length */
                            serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                            if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                            }

                            /* ./ length */
                            break;
                        }
                    }
                }
                /* ./ range */
            }

        };




        serviceCreditCard.unformatCreditCardNumber = function(cardNumberStringFormatted) {
            if (cardNumberStringFormatted != undefined) {
                return cardNumberStringFormatted.split(' ').join('');
            }
            return cardNumberStringFormatted;
        }
        // var _inputCCFinish = function(element, cardNumberString, cardLengthMin, cardLengthMax) {
        var _inputCCNumberFinish = function(element) {

            var validatorCreditCardNumber = serviceCreditCard.validatorCreditCardNumber([]);





            // document.getElementById("creditCardNumberMessageContainer").innerHTML="";
            // document.getElementById(_idInputMapper.cardNumber).setAttribute('style', 'color:'+ _colorInput["default"] + ' !important');
            document.getElementById(_idInputMapper.cardCVV).disabled = false;
            if ( serviceCreditCard.cardNumberStringFormatAfter != '' && validatorCreditCardNumber.isValid( document.getElementById(_idInputMapper.cardNumber).value) ) {

                // if maestro cvc disabled

                if (serviceCreditCard.idType == 'card_maestro_info') {

                    var cvvElement =  document.getElementById(_idInputMapper.cardCVV);
                    cvvElement.value = "";
                    // cvvElement.setAttribute('style', 'color:#333333 !important');


                    if (!cvvElement.classList.contains('inputdisabled')) {
                        // The box that we clicked has a class of bad so let's remove it and add the good class
                        // this.classList.remove('bad');
                        cvvElement.classList.add('inputdisabled');
                    } else {
                        cvvElement.classList.remove('inputdisabled');
                        // The user obviously can't follow instructions so let's alert them of what is supposed to happen next

                    }


                    // inputdisable
                    cvvElement.disabled = true;

                }
                element.focus();
            } else {
                if (serviceCreditCard.cardLengthMax == serviceCreditCard.cardNumberStringAfter.length && !validatorCreditCardNumber.isValid(document.getElementById(_idInputMapper.cardNumber).value)) {



                    // validatorCreditCardNumber.displayErrorMessage()

                    //  document.getElementById("creditCardNumberMessageContainer").innerHTML="Le format de la carte n'est pas valide";
                    //  document.bgColor = _colorInput["error"];
                    // document.getElementById(_idInputMapper.cardNumber).setAttribute('style', 'color:'+ _colorInput["error"] + ' !important');

                }
            }
        };

        var _inputCardExpiryDateFinish = function(element) {

            var validatorCreditCardExpiryDate = serviceCreditCard.validatorCreditCardExpiryDate([]);




            if ( 7 == document.getElementById(_idInputMapper.cardExpiryDate).value.length && validatorCreditCardExpiryDate.isValid( document.getElementById(_idInputMapper.cardExpiryDate).value) === true ) {


                element.focus();
            } else {
                if (7 == document.getElementById(_idInputMapper.cardExpiryDate).value.length && validatorCreditCardExpiryDate.isValid(document.getElementById(_idInputMapper.cardExpiryDate).value) === false) {


                }
            }
        };


        serviceCreditCard.validatorCreditCardNumber = function(errorArray) {
            var validatorCreditCardNumber = {};


            validatorCreditCardNumber.errorCollection = errorArray || [];


            validatorCreditCardNumber.isPotentiallyValid = function(creditCardNumber) {

                var isPotentiallyValid = false;
                var startNumberArray = [];
                for (var propt in _cardFormatDefinition) {

                    /* range */
                    for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                        if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                            for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                                startNumberArray.push([_cardFormatDefinition[propt]["ranges"][i]["first"] + j, propt]);
                            }




                        } else {
                            startNumberArray.push([_cardFormatDefinition[propt]["ranges"][i]["first"], propt]);

                        }
                    }
                    /* ./ range */
                }



                var startNumber;
                var startNumberToCompare;


                var cardNumberMaxLength = 23;

                var propt;
                for (var indexNumber = 0; indexNumber < startNumberArray.length; indexNumber++) {


                    startNumber = startNumberArray[indexNumber][0].toString();
                    propt = startNumberArray[indexNumber][1].toString();
                    startNumberToCompare = startNumber.substr(0,Math.min(startNumber.length, creditCardNumber.length));
                    if (creditCardNumber.indexOf(startNumberToCompare) === 0) {


                        cardNumberMaxLength = _cardFormatDefinition[propt]["lengths"]["length"];
                        if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                            cardNumberMaxLength = cardNumberMaxLength + _cardFormatDefinition[propt]["lengths"]["variable"];
                        }


                        if(creditCardNumber.length < cardNumberMaxLength) {
                            isPotentiallyValid = true;
                            break;
                        } else if(creditCardNumber.length == cardNumberMaxLength) {
                            if (_isLuhnValid(creditCardNumber) === true) {
                                isPotentiallyValid = true;
                                break;
                            }
                        }
                    }
                }



                if (isPotentiallyValid == false) {
                    validatorCreditCardNumber.isValid(creditCardNumber);
                }
                return isPotentiallyValid;
            }













            validatorCreditCardNumber.isValid = function (creditCardNumberUnformatted) {

                // var value = serviceCreditCard.cardNumberStringFormatAfter;

                // var creditCardNumberUnformated = serviceCreditCard.cardNumberStringAfter.split(' ').join('');

                if (creditCardNumberUnformatted != undefined) {

                    creditCardNumberUnformatted = creditCardNumberUnformatted.split(' ').join('');
                }






                if (_isTypeValid(serviceCreditCard.getCardTypeId()) === false) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    return false;
                }


                if (/[^0-9-\s]+/.test(creditCardNumberUnformatted)) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    return false;
                }



                if (_isLengthValid(creditCardNumberUnformatted) === false) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    return false;
                }

                if (_isLuhnValid(creditCardNumberUnformatted) === false) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    return false;
                }

                return true;
            };

            var _isTypeValid =function(cardTypeId) {
                if (_cardFormatDefinition.hasOwnProperty(cardTypeId) === false) {
                    return false;
                }
            }

            var _isLengthValid = function (value) {
                if (value.length < serviceCreditCard.cardLengthMin || (serviceCreditCard.cardLengthMax != null && value.length > serviceCreditCard.cardLengthMax) ) {
                    return false;
                }
                return true;
            }

            var _isLuhnValid = function (value) {
                // The Luhn Algorithm. It's so pretty.
                var nCheck = 0, nDigit = 0, bEven = false;
                value = value.replace(/\D/g, "");

                for (var n = value.length - 1; n >= 0; n--) {
                    var cDigit = value.charAt(n),
                        nDigit = parseInt(cDigit, 10);

                    if (bEven) {
                        if ((nDigit *= 2) > 9) nDigit -= 9;
                    }

                    nCheck += nDigit;
                    bEven = !bEven;
                }

                return (nCheck % 10) == 0;

            };
            return validatorCreditCardNumber;
        };

        serviceCreditCard.validatorCreditCardHolder = function(errorArray) {
            var validatorCreditCardHolder = {};


            validatorCreditCardHolder.errorCollection = errorArray || [];

            validatorCreditCardHolder.isValid = function (creditCardHolderString) {
                if (creditCardHolderString == "" || creditCardHolderString == undefined || creditCardHolderString == null) {
                    return false;
                }

                if (creditCardHolderString.length > serviceCreditCard.creditCardHolderLengthMax ) {
                    return false;
                }
                return true;
            }


            validatorCreditCardHolder.isPotentiallyValid = function(creditCardHolderString) {

                var isPotentiallyValid = false;

                if (creditCardHolderString.length <= serviceCreditCard.creditCardHolderLengthMax ) {
                    isPotentiallyValid = true;
                }


                return isPotentiallyValid;
            }

            return validatorCreditCardHolder;

        };

        /**
         *
         * @param errorCollection
         * @returns {{}}
         * @constructor
         */
        serviceCreditCard.validatorCreditCardExpiryDate = function (errorCollection) {

            var validatorExpiryDate = {};
            validatorExpiryDate.errorCollection = errorCollection || [];

            validatorExpiryDate.isPotentiallyValid = function(creditCardExpiryDate) {
                var isPotentiallyValid = false;



                var splitExpiryDate = creditCardExpiryDate.split(' / ');

                if (splitExpiryDate.length < 2) {

                    if (splitExpiryDate <= 12) {
                        isPotentiallyValid = true;
                    }
                } else {

                    if (splitExpiryDate.length == 2) {
                        var month = splitExpiryDate[0];
                        var year = splitExpiryDate[1];
                        if (year.length < 2) {

                            if (month <= 12 && year >= 1) {
                                isPotentiallyValid = true;
                            }
                        } else {

                            // Return today's date and time
                            var currentTime = new Date();

                            // returns the month (from 0 to 11)
                            var currentMonth = currentTime.getMonth() + 1;

                            // returns the year (four digits)
                            var currentYear = currentTime.getFullYear();

                            var yearYYYY = "20" + year;
                            if(yearYYYY > currentYear) {
                                isPotentiallyValid = true;
                            } else if(yearYYYY == currentYear && month >= currentMonth) {
                                isPotentiallyValid = true;
                            }



                        }


                    }
                }



                if (isPotentiallyValid == false) {
                    validatorExpiryDate.isValid(creditCardExpiryDate);
                }


                return isPotentiallyValid;

            };

            validatorExpiryDate.isValid = function(creditCardExpiryDate) {

                if (creditCardExpiryDate == undefined) {
                    creditCardExpiryDate = document.getElementById(_idInputMapper.cardExpiryDate).value;
                }
                var splitExpiryDate = creditCardExpiryDate.split(' / ');
                if (splitExpiryDate.length != 2) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, 'format de date non valide'));
                    return false;
                }

                var month = splitExpiryDate[0];
                var year = splitExpiryDate[1];

                // Return today's date and time
                var currentTime = new Date();

                // returns the month (from 0 to 11)
                var currentMonth = currentTime.getMonth() + 1;

                // returns the year (four digits)
                var currentYear = currentTime.getFullYear();


                year = "20" + year;

                if(month > 12) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_MONTH_EXPIRY_DATE")));
                    return false;
                } else if(year < currentYear) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_EXPIRY_DATE_PAST")));
                    return false;
                }
                else if(year == currentYear && month < currentMonth || year < currentYear) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_EXPIRY_DATE_PAST")));
                    return false;
                }
                return true;
            };

            return validatorExpiryDate;


        };

        serviceCreditCard.validatorCreditCardCVV = function(errorArray,validateAll) {
            var validatorCreditCardCVV = {};



            validatorCreditCardCVV.errorCollection = errorArray || [];





            validatorCreditCardCVV.isPotentiallyValid = function (creditCardCVVString,creditCardNumber) {


                var isPotentiallyValid = false;

                var arrayFormatCVV = ['34', '35', '36', '37'];
                for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length;indexFormatCVV++ ) {

                    if (document.getElementById(_idInputMapper.cardNumber).value != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }



                if (creditCardCVVString != "" && creditCardCVVString.length <= serviceCreditCard.creditCardCVVLengthMax ) {
                    isPotentiallyValid = true;
                }




                if (isPotentiallyValid == false) {
                    validatorCreditCardCVV.isValid(creditCardCVVString);
                }


                return isPotentiallyValid;
            };


            validatorCreditCardCVV.isValid = function (creditCardCVVString) {
                if (creditCardCVVString == "" || creditCardCVVString == undefined || creditCardCVVString == null) {


                    return false;
                }

                // cvv amex

                var creditCardNumber = document.getElementById(_idInputMapper.cardNumber).value;
                var arrayFormatCVV = ['34','35','36','37'];
                for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length;indexFormatCVV++ ) {

                    if (document.getElementById(_idInputMapper.cardNumber).value != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }



                if (creditCardCVVString.length > serviceCreditCard.creditCardCVVLengthMax ) {
                    // validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, 'Le champ CVC doit contenir '+serviceCreditCard.creditCardCVVLengthMax+' digits'));





                    validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_CVV").replace("%NUMBER%", serviceCreditCard.creditCardCVVLengthMax)));
                    return false;
                }


                if ((validateAll == undefined || validateAll == true) && creditCardCVVString.length < serviceCreditCard.creditCardCVVLengthMax ) {
                    // validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, 'Le champ CVC doit contenir '+serviceCreditCard.creditCardCVVLengthMax+' digits'));
                    validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_CVV").replace("%NUMBER%", serviceCreditCard.creditCardCVVLengthMax)));

                    return false;
                }




                return true;
            };

            return validatorCreditCardCVV;

        };

        serviceCreditCard.validatorCreditCard = function(errorCollection) {

            var validatorCreditCard = {};
            // validatorCreditCard.errorCollection = errorCollection;
            validatorCreditCard.errorCollection = [];


            validatorCreditCard.isValid = function(params) {

                var hasError = false;
                var validatorCreditCardNumber = serviceCreditCard.validatorCreditCardNumber();
                if (!validatorCreditCardNumber.isValid(serviceCreditCard.unformatCreditCardNumber(params['card_number']))) {
                    validatorCreditCard.errorCollection['creditCardNumber'] = validatorCreditCardNumber.errorCollection;
                    hasError = true;
                    // return false;
                }

                var validatorCreditCardHolder = serviceCreditCard.validatorCreditCardHolder(validatorCreditCard.errorCollection);
                if (!validatorCreditCardHolder.isValid(params['card_holder'])) {

                    hasError = true;
                    // return false;
                }

                var validatorCreditCardExpiryDate = serviceCreditCard.validatorCreditCardExpiryDate(validatorCreditCard.errorCollection);
                if (!validatorCreditCardExpiryDate.isValid(params['card_expiry_date'])) {
                    hasError = true;
                    // return false;
                }


                var validatorCreditCardCVV = serviceCreditCard.validatorCreditCardCVV(validatorCreditCard.errorCollection);
                if (!validatorCreditCardCVV.isValid(params['cvc'])) {
                    hasError = true;
                    // return false;
                }

                if (hasError) {
                    return false;
                }

                // document.getElementById("creditCardExpiryDateMessageContainer").innerHTML=validatorCreditCardExpiryDate.errorCollection[0]['message'];



                return true;
            };



            return validatorCreditCard;




        };

        serviceCreditCard.initCreditCardNumber = function(charCode){

            serviceCreditCard.lastCharCode = charCode;

            if (charCode == undefined || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharString = '';
            }
            else {
                serviceCreditCard.lastCharString = String.fromCharCode(charCode);
            }


            if (serviceCreditCard.lastCharString === '') {

            }

            serviceCreditCard.cardNumberStringFormatBefore = document.getElementById(_idInputMapper.cardNumber).value;
            serviceCreditCard.cardNumberStringFormatedBefore = document.getElementById(_idInputMapper.cardNumber).value;

            //realposition cursor in number
            var splitFormatBeforetemp = serviceCreditCard.cardNumberStringFormatBefore;
            serviceCreditCard.cardNumberStringUnformatedBefore = splitFormatBeforetemp.split(' ').join('');

            var getStartEndCursor = _getSelection(document.getElementById(_idInputMapper.cardNumber));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;

            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.cardNumberStringFormatedBefore.substr(0, startBFormat);
            var splitSubStringStart = subStringStart.split(' ');
            var nbSpaceStart = splitSubStringStart.length - 1;

            var subStringEnd =  serviceCreditCard.cardNumberStringFormatedBefore.substr(0, endBFormat);
            var splitSubStringEnd = subStringEnd.split(' ');
            var nbSpaceEnd = splitSubStringEnd.length - 1;

            var startB = parseInt(startBFormat) - parseInt(nbSpaceStart);
            var endB = parseInt(endBFormat) - parseInt(nbSpaceEnd);


            var startA = startB;
            var endA = endB;

            // string after

            var newTempStringAfter = serviceCreditCard.cardNumberStringUnformatedBefore;



            if (startB >= 0 && endB > 0 && startB < endB) {

                // if(charCode == 46) {
                //
                //     startA = startA - 1;
                // }


                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = startA;
                    // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore;

            }
            else if (startB > 0) {
                if(charCode == 8) {

                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB) - 1));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB)), newTempStringAfter.length);
                    // dump(tempStringAfterDebut);
                    // dump(tempStringAfterFin);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                    startA = startA - 1;

                } else if(charCode == 46) {
                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;


                }
                endA = startA;
            } else if(startB == 0) {
                if(charCode == 46) {
                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;


                }
                endA = startA;
            }



            var tempStringAfter = "";


            var startAtemp = startA;
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {


                if (nbBefore == startA) {


                    if (charCode == 8 || charCode == 46) {

                    } else {
                        tempStringAfter += serviceCreditCard.lastCharString;
                        startAtemp = startAtemp + 1;


                    }


                }

                tempStringAfter += newTempStringAfter.charAt(nbBefore);

            }
            startA = startAtemp;


// formatage du numero

            serviceCreditCard.cardLengthMin = 0;
            serviceCreditCard.cardLengthMax = null;

            serviceCreditCard.idType = null;






            for (var propt in _cardFormatDefinition) {

                /* range */

                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (tempStringAfter.indexOf(startNumber) === 0) {

                                // document.getElementById(_idInputMapper.cardType).innerHTML = propt;

                                serviceCreditCard.idType = propt;



                                // document.getElementById(_idInputMapper.cardType).innerHTML = '<img width="28px" src="./assets/type/' + _cardImg[propt] + '">';




                                var my_elem = document.getElementById(_idInputMapper.cardNumber);

                                // var span = document.createElement('img');
                                //
                                // span.className = 'asterisk';
                                //
                                // my_elem.parentNode.insertBefore(span, my_elem);






                                serviceCreditCard.cardFormatArray = _cardFormatDefinition[propt]["format"];
                                /* length */
                                serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                                if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                    serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                                }
                                /* ./ length */

                                break;
                            } else {

                            }
                        }
                    } else {

                        if (tempStringAfter.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            // document.getElementById(_idInputMapper.cardType).innerHTML = propt;
                            serviceCreditCard.idType = propt;

                            // document.getElementById(_idInputMapper.cardType).innerHTML = '<img width="28px" src="./assets/type/' + _cardImg[propt] + '">';








                            serviceCreditCard.cardFormatArray = _cardFormatDefinition[propt]["format"];
                            /* length */
                            serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                            if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                            }

                            /* ./ length */
                            break;
                        }
                    }
                }
                /* ./ range */
            }

            if (serviceCreditCard.cardLengthMax == null || tempStringAfter.length <= serviceCreditCard.cardLengthMax) {
                serviceCreditCard.cardNumberStringAfter = tempStringAfter;
            }
            else {
                serviceCreditCard.cardNumberStringAfter = serviceCreditCard.cardNumberStringUnformatedBefore;
                startA = startB;
            }


            var numberFormatTotal = 0;

            var tempForStringAfter = "";
            if ( serviceCreditCard.cardFormatArray.length > 0) {
                var positionSpaceArray = [];
                var startFormat = 0;
                for (var i = 0; i < serviceCreditCard.cardFormatArray.length; i++) {


                    positionSpaceArray[(startFormat + serviceCreditCard.cardFormatArray[i])] = 1;
                    startFormat += serviceCreditCard.cardFormatArray[i];

                }


            }


            // var deltaCursorAfterFormat = 0;
            var numberSpaceBeforeStartFormated= 0;
            for (var nb=0; nb< serviceCreditCard.cardNumberStringAfter.length;nb++) {
                //
                //
                if (positionSpaceArray != undefined && positionSpaceArray[nb]===1) {

                    if (nb < startA) {
                        numberSpaceBeforeStartFormated +=1;
                    }
                    tempForStringAfter += ' ';


                }
                tempForStringAfter += serviceCreditCard.cardNumberStringAfter.charAt(nb);
            }

            serviceCreditCard.cardNumberStringFormatAfter = tempForStringAfter;

            var startAFormat = startA + numberSpaceBeforeStartFormated;

            document.getElementById(_idInputMapper.cardNumber).value = serviceCreditCard.cardNumberStringFormatAfter;
            _setCaretPosition(document.getElementById(_idInputMapper.cardNumber), startAFormat);


            // focus next input + change color input on error

            _inputCCNumberFinish( document.getElementById(_idInputMapper.cardHolder), serviceCreditCard);




            // })(charCode);
        };

        serviceCreditCard.initCreditCardHolder = function(charCode){

            serviceCreditCard.lastCharCodeCreditCardHolder = charCode;
            if (charCode == undefined || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardHolder = '';
            }
            else {
                serviceCreditCard.lastCharStringCreditCardHolder = String.fromCharCode(charCode);
            }

            serviceCreditCard.cardHolderStringFormatedBefore = document.getElementById(_idInputMapper.cardHolder).value;

            var getStartEndCursor = _getSelection(document.getElementById(_idInputMapper.cardHolder));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;

            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.cardHolderStringFormatedBefore.substr(0, startBFormat);


            var subStringEnd =  serviceCreditCard.cardHolderStringFormatedBefore.substr(0, endBFormat);


            var startB = parseInt(startBFormat);
            var endB = parseInt(endBFormat);


            var startA = startB;
            var endA = endB;

            // string after

            var newTempStringAfter = serviceCreditCard.cardHolderStringFormatedBefore;

            if (startB >= 0 && endB > 0 && startB < endB) {

                newTempStringAfter = newTempStringAfter.substring(0,startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                endA = startA;
                // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore;

            }
            else if (startB > 0) {
                if(charCode == 8) {

                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB) - 1));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB)), newTempStringAfter.length);
                    // dump(tempStringAfterDebut);
                    // dump(tempStringAfterFin);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                    startA = startA - 1;

                } else if(charCode == 46) {
                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                }
                endA = startA;
            } else if(startB == 0) {
                if(charCode == 46) {
                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;


                }
                endA = startA;
            }



            var startA = startBFormat;

            var tempStringAfter = "";


            var startAtemp = startA;
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {

                // if (nbBefore == realCursorPositionInNumberBefore) {
                if (nbBefore == startA) {


                    if (charCode == 8 || charCode == 46) {

                    } else {
                        tempStringAfter += serviceCreditCard.lastCharStringCreditCardHolder;
                        // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore + 1;
                        startAtemp = startAtemp + 1;


                    }


                }

                tempStringAfter += newTempStringAfter.charAt(nbBefore);

            }
            startA = startAtemp;



            if (serviceCreditCard.creditCardHolderLengthMax == null || tempStringAfter.length <= serviceCreditCard.creditCardHolderLengthMax) {
                serviceCreditCard.cardHolderStringAfter = tempStringAfter;
            }
            else {
                serviceCreditCard.cardHolderStringAfter = serviceCreditCard.cardHolderStringFormatedBefore;
                startA = startBFormat;
            }


            document.getElementById(_idInputMapper.cardHolder).value = serviceCreditCard.cardHolderStringAfter;
            _setCaretPosition(document.getElementById(_idInputMapper.cardHolder), startA);





            // })(charCode);
        };




        serviceCreditCard.initCreditCardExpiryDate = function(charCode){

            serviceCreditCard.lastCharCodeCreditCardExpiryDate = charCode;
            if (charCode == undefined || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardExpiryDate = '';
            }
            else {
                serviceCreditCard.lastCharStringCreditCardExpiryDate = String.fromCharCode(charCode);
            }

            serviceCreditCard.creditCardExpiryDateFormattedBefore = document.getElementById(_idInputMapper.cardExpiryDate).value;







            //realposition cursor in number
            var splitFormatBeforetemp = serviceCreditCard.creditCardExpiryDateFormattedBefore;
            serviceCreditCard.creditCardExpiryDateUnformattedBefore = splitFormatBeforetemp.split(' / ').join('');




            var getStartEndCursor = _getSelection(document.getElementById(_idInputMapper.cardExpiryDate));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;




            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.creditCardExpiryDateFormattedBefore.substr(0, startBFormat);

            var splitSubStringStart = subStringStart.split(' / ');
            var nbSpaceStart = (splitSubStringStart.length - 1)*3;


            var subStringEnd =  serviceCreditCard.creditCardExpiryDateFormattedBefore.substr(0, endBFormat);


            var splitSubStringEnd = subStringEnd.split(' / ');
            var nbSpaceEnd = (splitSubStringEnd.length - 1)*3;

            var startB = parseInt(startBFormat) - parseInt(nbSpaceStart);
            var endB = parseInt(endBFormat) - parseInt(nbSpaceEnd);

            var startA = startB;
            var endA = endB;

            var newTempStringAfter = serviceCreditCard.creditCardExpiryDateUnformattedBefore;

            if (startB >= 0 && endB > 0 && startB < endB) {

                newTempStringAfter = newTempStringAfter.substring(0,startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                endA = startA;

            }
            else if (startB > 0) {
                if(charCode == 8) {

                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB) - 1));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB)), newTempStringAfter.length);

                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                    startA = startA - 1;

                } else if(charCode == 46) {
                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                }
                endA = startA;
            } else if(startB == 0) {
                if(charCode == 46) {
                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;


                }
                endA = startA;
            }





            var tempStringAfter = "";




            var startAtemp = startA;


            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {
                if (nbBefore == startA) {
                    if (charCode == 8 || charCode == 46) {
                    } else {
                        tempStringAfter += serviceCreditCard.lastCharStringCreditCardExpiryDate;
                        startAtemp = startAtemp + 1;
                    }
                }

                tempStringAfter += newTempStringAfter.charAt(nbBefore);
            }
            startA = startAtemp;

            if (tempStringAfter.length <= 4) {
                serviceCreditCard.cardExpiryDateStringAfter = tempStringAfter;
            }
            else {
                serviceCreditCard.cardExpiryDateStringAfter = serviceCreditCard.creditCardExpiryDateFormattedBefore;
                startA = startBFormat;
            }

            serviceCreditCard.cardExpiryDateStringFormattedAfter =  serviceCreditCard.cardExpiryDateStringAfter;
            if ( serviceCreditCard.cardExpiryDateStringFormattedAfter.length === 1) {
                if (serviceCreditCard.cardExpiryDateStringFormattedAfter.charAt(0) > 1) {
                    serviceCreditCard.cardExpiryDateStringFormattedAfter = "0"+serviceCreditCard.cardExpiryDateStringFormattedAfter;
                    startA = startA + 1;
                }
            }

            if ( serviceCreditCard.cardExpiryDateStringFormattedAfter.length >= 2) {

                if (serviceCreditCard.cardExpiryDateStringFormattedAfter.split(' / ').length < 2) {
                    serviceCreditCard.cardExpiryDateStringFormattedAfter = serviceCreditCard.cardExpiryDateStringFormattedAfter.substring(0, 2) + " / " + serviceCreditCard.cardExpiryDateStringFormattedAfter.substring(2, serviceCreditCard.cardExpiryDateStringFormattedAfter.length);
                    startA = startA + 3;
                }
            }

            document.getElementById(_idInputMapper.cardExpiryDate).value = serviceCreditCard.cardExpiryDateStringFormattedAfter;
            _setCaretPosition(document.getElementById(_idInputMapper.cardExpiryDate), startA);
            _inputCardExpiryDateFinish( document.getElementById(_idInputMapper.cardCVV), serviceCreditCard);

        };


        serviceCreditCard.initCreditCardCVV = function(charCode){

            serviceCreditCard.lastCharCodeCreditCardCVV = charCode;
            if (charCode == undefined || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardCVV = '';
            }
            else {
                serviceCreditCard.lastCharStringCreditCardCVV = String.fromCharCode(charCode);
            }

            serviceCreditCard.cardCVVStringFormatedBefore = document.getElementById(_idInputMapper.cardCVV).value;

            var getStartEndCursor = _getSelection(document.getElementById(_idInputMapper.cardCVV));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;

            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.cardCVVStringFormatedBefore.substr(0, startBFormat);


            var subStringEnd =  serviceCreditCard.cardCVVStringFormatedBefore.substr(0, endBFormat);


            var startB = parseInt(startBFormat);
            var endB = parseInt(endBFormat);


            var startA = startB;
            var endA = endB;

            // string after

            var newTempStringAfter = serviceCreditCard.cardCVVStringFormatedBefore;
            if (startB >= 0 && endB > 0 && startB < endB) {
                newTempStringAfter = newTempStringAfter.substring(0,startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                endA = startA;


            }
            else if (startB > 0) {
                if(charCode == 8) {

                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB) - 1));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB)), newTempStringAfter.length);

                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                    startA = startA - 1;

                } else if(charCode == 46) {
                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                }
                endA = startA;
            } else if(startB == 0) {
                if(charCode == 46) {
                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;


                }
                endA = startA;
            }

            var startA = startBFormat;
            var tempStringAfter = "";
            var startAtemp = startA;
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {
                if (nbBefore == startA) {
                    if (charCode == 8 || charCode == 46) {
                    } else {
                        tempStringAfter += serviceCreditCard.lastCharStringCreditCardCVV;
                        // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore + 1;
                        startAtemp = startAtemp + 1;
                    }
                }
                tempStringAfter += newTempStringAfter.charAt(nbBefore);
            }
            startA = startAtemp;

            var arrayFormatCVV = ['34','35','36','37'];
            var creditCardNumber = document.getElementById(_idInputMapper.cardNumber).value;
            for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length;indexFormatCVV++ ) {
                if (creditCardNumber.value != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                    serviceCreditCard.creditCardCVVLengthMax = 4;
                }
            }

            if (serviceCreditCard.creditCardCVVLengthMax == null || tempStringAfter.length <= serviceCreditCard.creditCardCVVLengthMax) {
                serviceCreditCard.cardCVVStringAfter = tempStringAfter;
            }
            else {
                serviceCreditCard.cardCVVStringAfter = serviceCreditCard.cardCVVStringFormatedBefore;
                startA = startBFormat;
            }

            document.getElementById(_idInputMapper.cardCVV).value = serviceCreditCard.cardCVVStringAfter;
            _setCaretPosition(document.getElementById(_idInputMapper.cardCVV), startA);

        };
        return serviceCreditCard;
    }

    /**
     *
     */
    var _callbackEventFormChange = new Function();

    /**
     *
     * @private
     */
    var _initErrorHandler = function(e){

       // var evt = e || window.event;



        // _callbackEventFormChange();
        for (var indexInput in _idInputMapper) {
            if (indexInput != "cardType") {

                if (document.getElementById(_idInputMapper[indexInput]).classList.contains('error-card-form')) {
                    document.getElementById(_idInputMapper[indexInput]).classList.remove('error-card-form');
                }
                if (!document.getElementById(_idInputMapper[indexInput]).classList.contains('default-card-form')) {
                    document.getElementById(_idInputMapper[indexInput]).classList.add('default-card-form');
                }
                    // document.getElementById(_idInputMapper[indexInput]).setAttribute('style', 'color:' + _colorInput["default"] + ' !important');
            }
        }

        var errors = HiPay.Form.paymentFormDataGetErrors();

        for (var indexError in errors) {
            if (!document.getElementById(_idInputMapper[indexInput]).classList.contains('error-card-form')) {
                // The box that we clicked has a class of bad so let's remove it and add the good class
                document.getElementById(_idInputMapper[indexError]).classList.add('error-card-form');
            }
            if (document.getElementById(_idInputMapper[indexError]).classList.contains('default-card-form')) {
                document.getElementById(_idInputMapper[indexError]).classList.remove('default-card-form');
            }


            // document.getElementById(_idInputMapper[indexError]).setAttribute('style', 'color:#ff0000 !important');

        }
    };

    /**
     *
     * @param idElement
     * @param s
     * @param fn
     * @private
     */
    var _addListenerMulti = function (idElement, s, fn) {
        var eventList = s.split(' ');
        for(var eventIndex = 0; eventIndex < eventList.length; eventIndex++) {
            document.getElementById(idElement).addEventListener(eventList[eventIndex], function (e) {fn();},false);
        }
    };

    /**
     *
     * @param idElement
     * @private
     */
    var _initListenEvent = function(idElement){
        _addListenerMulti(idElement, 'keydown keypress blur focus', _initErrorHandler);
    };

    /* add listener on all input form */
    window.onload = function() {

        // HiPay.Form.setLocale("en_EN");

        // create ico card type
        // card type
        var my_elem = document.getElementById(_idInputMapper.cardNumber);

        var imgType = document.createElement('img');
        // span.innerHTML = '*';
        imgType.className = 'asterisk';
        imgType.id = _idInputMapper['cardType'];
        imgType.src = undefined;
        imgType.setAttribute('style','display:none;');

        my_elem.parentNode.insertBefore(imgType, my_elem.nextSibling);


        for(var propt in _idInputMapper){


            if (propt == 'cardNumber') {

                document.getElementById(_idInputMapper['cardNumber']).addEventListener('keydown', function (e) {

                    evt = e || window.event;

                    var charCode = evt.keyCode || evt.which;
                    if (charCode == 8 || charCode == 46) {

                        // _instanceServiceCreditCard = new _serviceCreditCard(charCode);
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardNumber(charCode);
                        evt.preventDefault();
                        // _callbackEventFormChange();
                    } else {
                        // evt.preventDefault();
                    }

                    _callbackEventFormChange();

                    // HiPay.Form.paymentFormDataGetErrors();

                });


                document.getElementById(_idInputMapper['cardNumber']).addEventListener('keypress', function (e) {
                    // return false;
                    evt = e || window.event;


                    var charCode = evt.keyCode || evt.which;

                    evt.preventDefault();
                    if (charCode >= 48 && charCode <= 57) {
                        /* is valid add char */
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardNumber(charCode);
                    }

                    _callbackEventFormChange();

                });






                // _initListenEvent(_idInputMapper[propt]);

            }
            else if (propt == 'cardHolder') {

                document.getElementById(_idInputMapper[propt]).addEventListener('keydown', function (e) {


                    evt = e || window.event;

                    var charCode = evt.keyCode || evt.which;
                    if (charCode == 8 || charCode == 46) {
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardHolder(charCode);
                        evt.preventDefault();

                    } else {


                    }
                    _callbackEventFormChange();




                });

                document.getElementById(_idInputMapper[propt]).addEventListener('keypress', function (e) {

                    evt = e || window.event;

                    var charCode = evt.keyCode || evt.which;

                    if (charCode == 8 || charCode == 46) {

                    } else {

                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardHolder(charCode);
                        evt.preventDefault();
                    }
                    _callbackEventFormChange();
                });



            }
            else if (propt == 'cardExpiryDate') {

                document.getElementById(_idInputMapper[propt]).addEventListener('keydown', function (e) {


                    evt = e || window.event;

                    var charCode = evt.keyCode || evt.which;
                    if (charCode == 8 || charCode == 46) {
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardExpiryDate(charCode);
                        evt.preventDefault();
                    } else {

                    }
                    _callbackEventFormChange();



                });

                document.getElementById(_idInputMapper[propt]).addEventListener('keypress', function (e) {

                    evt = e || window.event;

                    var charCode = evt.keyCode || evt.which;
                    evt.preventDefault();
                    if (charCode >= 48 && charCode <= 57) {

                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardExpiryDate(charCode);

                    }
                    _callbackEventFormChange();
                });

            }

            else if (propt == 'cardCVV') {

                document.getElementById(_idInputMapper['cardCVV']).addEventListener('keydown', function (e) {



                    var evt = e || window.event;

                    var charCode = evt.keyCode || evt.which;
                    if (charCode == 8 || charCode == 46) {
                        // _instanceServiceCreditCard = new _serviceCreditCard(charCode);
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardCVV(charCode);
                        evt.preventDefault();

                    }




                    // var validatorCreditCardCVV = _instanceServiceCreditCard.validatorCreditCardCVV();


                    _callbackEventFormChange();


                });


                document.getElementById(_idInputMapper['cardCVV']).addEventListener('keypress', function (e) {



                    var evt = e || window.event;


                    var charCode = evt.keyCode || evt.which;

                    evt.preventDefault();
                    if (charCode >= 48 && charCode <= 57) {
                        /* is valid add char */

                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardCVV(charCode);
                    }
                    _callbackEventFormChange();
                });


                // document.getElementById(_idInputMapper['cardCVV']).addEventListener('blur', function (e) {
                //     _instanceServiceCreditCard = new _serviceCreditCard();
                //     var validatorCreditCardCVV = _instanceServiceCreditCard.validatorCreditCardCVV();
                // });
            }
            else {
            }

            document.getElementById(_idInputMapper[propt]).addEventListener('blur', function (e) {
                _callbackEventFormChange();

            });
            _initListenEvent(_idInputMapper[propt]);

        }


    };

    /**
     *
     * @returns {{card_number, card_expiry_month: string, card_expiry_year: string, card_holder, cvv, multi_use: string, generate_request_id: string}}
     * @private
     */
    var _getParamsFromForm = function() {
        var creditCardExpiryDate = document.getElementById(_idInputMapper.cardExpiryDate).value;


        var explodeExpiryDate = creditCardExpiryDate.split(' / ');



        var month = "";
        var year = "";
        if (explodeExpiryDate.length == 2) {
            month = explodeExpiryDate[0];


            year = explodeExpiryDate[1];

        } else {
            month = explodeExpiryDate[0];
        }
        return  {
            card_number: document.getElementById(_idInputMapper.cardNumber).value,
            card_expiry_month: month,
            card_expiry_year: year,
            card_holder: document.getElementById(_idInputMapper.cardHolder).value,
            cvv: document.getElementById(_idInputMapper.cardCVV).value,
            multi_use: '0',
            generate_request_id: '0'
        };
    };

    /**
     *
     * @returns {{type: *, length: *}}
     */


    /**
     * CVV information by card (name and length of CVV)
     * @method HiPay.getCVVInformation
     * @return {object}
     */
    HiPay.getCVVInformation = function() {
        _instanceServiceCreditCard = new _serviceCreditCard();

        var CVVLength = _instanceServiceCreditCard.getCreditCardCVVLengthMax();
        if (CVVLength == undefined) {
            CVVLength = 3;
        }

        var idType = _instanceServiceCreditCard.getTypeWithCardNumber(_instanceServiceCreditCard.getCreditCardNumberValue());
        return {type:_idCVVMapper[idType],
        length: CVVLength};
    }

    /**
     * Get errors in form
     *
     * @method HiPay.Form.paymentFormDataGetErrors
     * @return errorCollection
     */
    HiPay.Form.paymentFormDataGetErrors = function() {

        _instanceServiceCreditCard = new _serviceCreditCard();
        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();
        var params = _getParamsFromForm();
        var errorCollection = {};
        var hasError = false;
        // Credit card number
        var validatorCreditCardNumber = _instanceServiceCreditCard.validatorCreditCardNumber();
        var creditCardNumberUnformatted = _instanceServiceCreditCard.unformatCreditCardNumber(params['card_number']);

        if (creditCardNumberUnformatted != "") {

            if (!validatorCreditCardNumber.isPotentiallyValid(creditCardNumberUnformatted) ||
                (!validatorCreditCardNumber.isValid(creditCardNumberUnformatted) && document.getElementById(_idInputMapper.cardNumber) !== document.activeElement )
            ) {
                errorCollection['cardNumber'] = validatorCreditCardNumber.errorCollection[0]['message'];
            }
        }




        // Credit card holder
        var validatorCreditCardHolder = _instanceServiceCreditCard.validatorCreditCardHolder();
        var creditCardHolderString = params['card_holder'];

        if (creditCardHolderString != "") {
            if (!validatorCreditCardHolder.isPotentiallyValid(creditCardHolderString) ||
                (!validatorCreditCardHolder.isValid(creditCardHolderString) && document.getElementById(_idInputMapper.cardHolder) !== document.activeElement )
            ) {
                errorCollection['cardHolder'] = validatorCreditCardHolder.errorCollection[0]['message'];
            }
        }

        // Credit card expiry date
        var validatorCreditCardExpiryDate = _instanceServiceCreditCard.validatorCreditCardExpiryDate();
        var creditCardExpiryDateString = params['card_expiry_month'];
        if (params['card_expiry_year'] != "") {
            creditCardExpiryDateString +=  " / " + params['card_expiry_year'];
        }

        if (creditCardExpiryDateString != "") {
            if (!validatorCreditCardExpiryDate.isPotentiallyValid(creditCardExpiryDateString) ||
                (!validatorCreditCardExpiryDate.isValid(creditCardExpiryDateString) && document.getElementById(_idInputMapper.cardExpiryDate) !== document.activeElement )
            ) {
                errorCollection['cardExpiryDate'] = validatorCreditCardExpiryDate.errorCollection[0]['message'];
            }
        }



// Credit card security code
        var validatorCreditCardCVV = _instanceServiceCreditCard.validatorCreditCardCVV();
        var creditCardCVVString = params['cvv'];
        if (creditCardCVVString != "") {
            if (!validatorCreditCardCVV.isPotentiallyValid(creditCardCVVString,creditCardNumberUnformatted) ||
                (!validatorCreditCardCVV.isValid(creditCardCVVString) && document.getElementById(_idInputMapper.cardCVV) !== document.activeElement )
            ) {
                errorCollection['cardCVV'] = validatorCreditCardCVV.errorCollection[0]['message'];
            }
        }


        return errorCollection;

    };

    /**
     * Callback on form change
     *
     * @method HiPay.Form.change
     * @parameter {function} callback
     *
     */
    HiPay.Form.change = function(callback) {
        _callbackEventFormChange = callback;
    };

    /**
     * Is valid form data.
     *
     * @method HiPay.Form.paymentFormDataIsValid
     * @return {Boolean} Form is or is not valid
     *
     */
    HiPay.Form.paymentFormDataIsValid = function() {


        var params = {
            card_number: $('#input-card')[0].value,
            card_holder: $('#input-name')[0].value,
            cvc: $('#input-cvv')[0].value,
            card_expiry_date: $('#input-expiry-date')[0].value,

            multi_use: '0'
        };


        if (!_instanceServiceCreditCard) {

            _instanceServiceCreditCard = new _serviceCreditCard();
        }

        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();

        return validatorCreditCard.isValid(params);
    }

    /**
     *
     * @param instance
     * @param payload
     * @param specialValueCallback
     * @private
     */
    var _processObjectPayload = function (instance, payload, specialValueCallback) {
        var propertyConfig = [];

        for (var key in payload || {}) {

            if (typeof instance._mapping === 'object') {

                var mapping = instance._mapping[key];

                if (typeof mapping === 'object') {
                    value = typeof specialValueCallback !== 'undefined' ? (specialValueCallback(key, payload[key]) || payload[key]) : payload[key];

                    // Property is writable, value can directly be set
                    if (!_canDefineProperty || mapping.propertyDescriptors.writable) {
                        instance[mapping.name] = value;
                    }

                    // Property not writable, should be redefined
                    else {
                        propertyConfig[mapping.name] =_extend({}, mapping.propertyDescriptors, {
                            value: value,
                            configurable: true // Values might be refreshed later
                        });

                    }
                }
            }
        }

        if (_canDefineProperty) {
            Object.defineProperties(instance, propertyConfig);
        }
    };

    // IE classlist
    if(Object.defineProperty && isIE() == 8) {
    Object.defineProperty(Element.prototype, 'classList', {
        // _defineProperties(Element.prototype, 'classList', {
            get: function () {
                var self = this, bValue = self.className.split(" ")

                bValue.add = function () {
                    var b;
                    for (i in arguments) {
                        b = true;
                        for (var j = 0; j < bValue.length; j++)
                            if (bValue[j] == arguments[i]) {
                                b = false
                                break
                            }
                        if (b)
                            self.className += (self.className ? " " : "") + arguments[i]
                    }
                }
                bValue.remove = function () {
                    self.className = ""
                    for (i in arguments)
                        for (var j = 0; j < bValue.length; j++)
                            if (bValue[j] != arguments[i])
                                self.className += (self.className ? " " : "") + bValue[j]
                }
                bValue.toggle = function (x) {
                    var b;
                    if (x) {
                        self.className = ""
                        b = false;
                        for (var j = 0; j < bValue.length; j++)
                            if (bValue[j] != x) {
                                self.className += (self.className ? " " : "") + bValue[j]
                                b = false
                            } else b = true
                        if (!b)
                            self.className += (self.className ? " " : "") + x
                    } else throw new TypeError("Failed to execute 'toggle': 1 argument required")
                    return !b;
                }
                // bValue.contains = function () {
                //     var b;
                //     for (i in arguments) {
                //         b = false;
                //         for (var j = 0; j < bValue.length; j++)
                //             if (bValue[j] == arguments[i]) {
                //                 b = true
                //                 break
                //             }
                //
                //         return b;
                //     }
                // }

                return bValue;
            },
            enumerable: true,
            configurable: true
        });

    }




    /**
     *
     * @type {{APIIncorrectCredentials: number, APIIncorrectSignature: number, APIAccountNotActive: number, APIAccountLocked: number, APIInsufficientPermissions: number, APIForbiddenAccess: number, APIUnsupportedVersion: number, APITemporarilyUnavailable: number, APINotAllowed: number, APIMethodNotAllowedGateway: number, APIInvalidParameter: number, APIMethodNotAllowedSecureVault: number, APIInvalidCardToken: number, APIRequiredParameterMissing: number, APIInvalidParameterFormat: number, APIInvalidParameterLength: number, APIInvalidParameterNonAlpha: number, APIInvalidParameterNonNum: number, APIInvalidParameterNonDecimal: number, APIInvalidDate: number, APIInvalidTime: number, APIInvalidIPAddress: number, APIInvalidEmailAddress: number, APIInvalidSoftDescriptorCodeMessage: number, APINoRouteToAcquirer: number, APIUnsupportedECIDescription: number, APIUnsupported: number, APIUnknownOrder: number, APIUnknownTransaction: number, APIUnknownMerchant: number, APIUnsupportedOperation: number, APIUnknownIPAddress: number, APISuspicionOfFraud: number, APIFraudSuspicion: number, APIUnknownToken: number, APILuhnCheckFailed: number, APIUnsupportedCurrency: number, APIAmountLimitExceeded: number, APIMaxAttemptsExceeded: number, APIDuplicateOrder: number, APICheckoutSessionExpired: number, APIOrderCompleted: number, APIOrderExpired: number, APIOrderVoided: number, APIAuthorizationExpired: number, APIAllowableAmountLimitExceeded: number, APINotEnabled: number, APINotAllowedCapture: number, APINotAllowedPartialCapture: number, APIPermissionDenied: number, APICurrencyMismatch: number, APIAuthorizationCompleted: number, APINoMore: number, APIInvalidAmount: number, APIAmountLimitExceededCapture: number, APIAmountLimitExceededPartialCapture: number, APIOperationNotPermittedClosed: number, APIOperationNotPermittedFraud: number, APIRefundNotEnabled: number, APIRefundNotAllowed: number, APIPartialRefundNotAllowed: number, APIRefundPermissionDenied: number, APIRefundCurrencyMismatch: number, APIAlreadyRefunded: number, APIRefundNoMore: number, APIRefundInvalidAmount: number, APIRefundAmountLimitExceeded: number, APIRefundAmountLimitExceededPartial: number, APIOperationNotPermitted: number, APITooLate: number, APIReauthorizationNotEnabled: number, APIReauthorizationNotAllowed: number, APICannotReauthorize: number, APIMaxLimitExceeded: number, APIVoidNotAllowed: number, APICannotVoid: number, APIAuthorizationVoided: number, APIDeclinedAcquirer: number, APIDeclinedFinancialInstituion: number, APIInsufficientFundsAccount: number, APITechnicalProblem: number, APICommunicationFailure: number, APIAcquirerUnavailable: number, APIDuplicateTransaction: number, APIPaymentCancelledByTheCustomer: number, APIInvalidTransaction: number, APIPleaseCallTheAcquirerSupportCallNumber: number, APIAuthenticationFailedPleaseRetryOrCancel: number, APINoUIDConfiguredForThisOperation: number, APIRefusalNoExplicitReason: number, APIIssuerNotAvailable: number, APIInsufficientFundsCredit: number, APITransactionNotPermitted: number, APIInvalidCardNumber: number, APIUnsupportedCard: number, APICardExpired: number, APIExpiryDateIncorrect: number, APICVCRequired: number, APICVCError: number, APIAVSFailed: number, APIRetainCard: number, APILostOrStolenCard: number, APIRestrictedCard: number, APICardLimitExceeded: number, APICardBlacklisted: number, APIUnauthorisedIPAddressCountry: number, APICardnotInAuthorisersDatabase: number}}
     */
    HiPay.ErrorReason = {
        APIIncorrectCredentials: 1000001,
        APIIncorrectSignature: 1000002,
        APIAccountNotActive: 1000003,
        APIAccountLocked: 1000004,
        APIInsufficientPermissions: 1000005,
        APIForbiddenAccess: 1000006,
        APIUnsupportedVersion: 1000007,
        APITemporarilyUnavailable: 1000008,
        APINotAllowed: 1000009,
        APIMethodNotAllowedGateway: 1010001,
        APIInvalidParameter: 1010002,
        APIMethodNotAllowedSecureVault: 1010003,
        APIInvalidCardToken: 1012003,
        APIRequiredParameterMissing: 1010101,
        APIInvalidParameterFormat: 1010201,
        APIInvalidParameterLength: 1010202,
        APIInvalidParameterNonAlpha: 1010203,
        APIInvalidParameterNonNum: 1010204,
        APIInvalidParameterNonDecimal: 1010205,
        APIInvalidDate: 1010206,
        APIInvalidTime: 1010207,
        APIInvalidIPAddress: 1010208,
        APIInvalidEmailAddress: 1010209,
        APIInvalidSoftDescriptorCodeMessage: 1010301,
        APINoRouteToAcquirer: 1020001,
        APIUnsupportedECIDescription: 1020002,
        APIUnsupported: 1020003,

        // Validation errors
        APIUnknownOrder: 3000001,
        APIUnknownTransaction: 3000002,
        APIUnknownMerchant: 3000003,
        APIUnsupportedOperation: 3000101,
        APIUnknownIPAddress: 3000102,
        APISuspicionOfFraud: 3000201,
        APIFraudSuspicion: 3040001,
        APIUnknownToken: 3030001,
        APILuhnCheckFailed: 409,

        // Error codes relating to the Checkout Process
        APIUnsupportedCurrency: 3010001,
        APIAmountLimitExceeded: 3010002,
        APIMaxAttemptsExceeded: 3010003,
        APIDuplicateOrder: 3010004,
        APICheckoutSessionExpired: 3010005,
        APIOrderCompleted: 3010006,
        APIOrderExpired: 3010007,
        APIOrderVoided: 3010008,

        // Error codes relating to Maintenance Operations
        APIAuthorizationExpired: 3020001,
        APIAllowableAmountLimitExceeded: 3020002,
        APINotEnabled: 3020101,
        APINotAllowedCapture: 3020102,
        APINotAllowedPartialCapture: 3020103,
        APIPermissionDenied: 3020104,
        APICurrencyMismatch: 3020105,
        APIAuthorizationCompleted: 3020106,
        APINoMore: 3020107,
        APIInvalidAmount: 3020108,
        APIAmountLimitExceededCapture: 3020109,
        APIAmountLimitExceededPartialCapture: 3020110,
        APIOperationNotPermittedClosed: 3020111,
        APIOperationNotPermittedFraud: 3020112,
        APIRefundNotEnabled: 3020201,
        APIRefundNotAllowed: 3020202,
        APIPartialRefundNotAllowed: 3020203,
        APIRefundPermissionDenied: 3020204,
        APIRefundCurrencyMismatch: 3020205,
        APIAlreadyRefunded: 3020206,
        APIRefundNoMore: 3020207,
        APIRefundInvalidAmount: 3020208,
        APIRefundAmountLimitExceeded: 3020209,
        APIRefundAmountLimitExceededPartial: 3020210,
        APIOperationNotPermitted: 3020211,
        APITooLate: 3020212,
        APIReauthorizationNotEnabled: 3020301,
        APIReauthorizationNotAllowed: 3020302,
        APICannotReauthorize: 3020303,
        APIMaxLimitExceeded: 3020304,
        APIVoidNotAllowed: 3020401,
        APICannotVoid: 3020402,
        APIAuthorizationVoided: 3020403,

        // Acquirer Reason Codes
        APIDeclinedAcquirer: 4000001,
        APIDeclinedFinancialInstituion: 4000002,
        APIInsufficientFundsAccount: 4000003,
        APITechnicalProblem: 4000004,
        APICommunicationFailure: 4000005,
        APIAcquirerUnavailable: 4000006,
        APIDuplicateTransaction: 4000007,
        APIPaymentCancelledByTheCustomer: 4000008,
        APIInvalidTransaction: 4000009,
        APIPleaseCallTheAcquirerSupportCallNumber: 4000010,
        APIAuthenticationFailedPleaseRetryOrCancel: 4000011,
        APINoUIDConfiguredForThisOperation: 4000012,
        APIRefusalNoExplicitReason: 4010101,
        APIIssuerNotAvailable: 4010102,
        APIInsufficientFundsCredit: 4010103,
        APITransactionNotPermitted: 4010201,
        APIInvalidCardNumber: 4010202,
        APIUnsupportedCard: 4010203,
        APICardExpired: 4010204,
        APIExpiryDateIncorrect: 4010205,
        APICVCRequired: 4010206,
        APICVCError: 4010207,
        APIAVSFailed: 4010301,
        APIRetainCard: 4010302,
        APILostOrStolenCard: 4010303,
        APIRestrictedCard: 4010304,
        APICardLimitExceeded: 4010305,
        APICardBlacklisted: 4010306,
        APIUnauthorisedIPAddressCountry: 4010307,
        APICardnotInAuthorisersDatabase: 4010309
    }

    /**
     *
     * @param responseJSON
     * @constructor
     */
    HiPay.Token = function (responseJSON) {
        var payload;

        if (typeof responseJSON.data !== 'undefined') {
            payload = responseJSON.data;
        }
        if (typeof payload === 'object') {
            _processObjectPayload(this, $.extend({}, payload, {
                token: payload.token
            }));
        } else {
            _processObjectPayload(this, $.extend({}, payload, {
                token: payload.token
            }));
        }
    };

    /**
     *
     * @constructor
     */
    HiPay.Token = function() {
        _bootstrapInstanceProperties(this);
    }

    /**
     *
     * @param context
     * @param payload
     * @returns {*}
     */
    HiPay.Token.populateProperties = function (context, payload) {
        _processObjectPayload(context, payload,  function (key, val){
            // switch (key) {
            // case 'token':
            //     break;
            // }
        });
        return context;
    };
    /**
     *
     * @param target
     */
    HiPay.setTarget = function(target) {
        HiPay.target = target;
    };

    /**
     *
     * @returns {*}
     */
    HiPay.getTarget = function() {
        return HiPay.target;
    };

    /**
     *
     * @param username
     * @param publicKey
     */
    HiPay.setCredentials = function(username, publicKey) {
        HiPay.username = username;
        HiPay.publicKey = publicKey;
    };

    // HiPay.getFormCC = function(containerId) {
    //
    //     var containerHtml = document.getElementById(containerId);
    //
    //
    //     if (!containerHtml) {
    //         return false;
    //     }
    //
    //     containerHtml.innerHTML += '<div style="margin-top: 50px">'
    //         + '<div id="my-card-1" class="card-js" data-capture-name="true" data-icon-colour="#158CBA"></div>'
    //         + '</div>';
    //
    // }


    // API Calls

    var _makeRequest = function(opts) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(opts.method, opts.url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            if (opts.headers) {
                Object.keys(opts.headers).forEach(function (key) {
                    xhr.setRequestHeader(key, opts.headers[key]);
                });
            }
            var params = opts.params;
            // We'll need to stringify if we've been given an object
            // If we have a string, this is skipped.
            if (params && typeof params === 'object') {
                params = Object.keys(params).map(function (key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                }).join('&');
            }
            xhr.send(params);
        });
    };

    /**
     *
     * @param endpoint
     * @param requestParams
     * @param returnPromise
     * @param checkKey
     * @returns {Promise}
     * @private
     */
    var _performAPICall = function (endpoint, requestParams, returnPromise, checkKey) {
        if ((typeof checkKey === 'undefined' || checkKey) && (typeof HiPay.publicKey === 'undefined' || typeof HiPay.username === 'undefined')) {
            throw new _Error('missing_public_key', 'You have to provide a HiPay username and public key in order to perform API calls.');
            // {"code":'+APIInvalidCardToken+',
        }

        try{
            var authEncoded = window.btoa(HiPay.username + ':' + HiPay.publicKey);
        }catch(e) {
            throw new _Error('missing_public_key');
        }

        // Ne fonctionne pas avec IE 10 ?
        if ('XDomainRequest' in window && window.XDomainRequest !== null && isIE() != 10) {
            requestParams['Authorization'] = 'Basic ' + window.btoa(HiPay.username + ':' + HiPay.publicKey);
        }

        var config = {
            headers: {
                'Authorization': 'Basic ' + authEncoded,
                'contentType': 'application/json'
            }
        };

        // axios.post("http://localhost:8080/example/index5.php",{key: 'value'})
        //     .then(function (response) {

        //     })
        //     .catch(function (error) {

        //     });




        // if (isIE () == 8) {
        //     // IE8 code
        // } else {
        //     // Other versions IE or not IE
        // }
        //

        // if (isIE () && isIE () < 9) {
        //     var xdr;
        //     function err() {

        //     }
        //     function timeo() {

        //     }
        //     function loadd() {

        //     }
        //     function stopdata() {
        //         xdr.abort();
        //     }
        //
        //     xdr = new XDomainRequest();
        //     if (xdr) {
        //         xdr.onerror = err;
        //         xdr.ontimeout = timeo;
        //         xdr.onload = loadd;
        //         xdr.timeout = 10000;
        //         xdr.open('POST',endpoint);
        //         xdr.send(requestParams);
        //         xdr.header(config);
        //         //xdr.send('foo=<?php echo $foo; ?>'); to send php variable
        //     } else {

        //     }
        // } else {
        // is IE 9 and later or not IE


        //
        // var endpoint = 'https://secure2-vault.hipay-tpp.com/rest/v2/token/create.json';
        // if (HiPay.getTarget() == 'test' || HiPay.getTarget() == 'stage' ) {
        //     endpoint = 'https://stage-secure2-vault.hipay-tpp.com/rest/v2/token/create.json';
        // } else if (HiPay.getTarget() == 'dev') {
        //     endpoint = 'http://dev-secure2-vault.hipay-tpp.com/rest/v2/token/create.json';
        // }
        //
        // if (!("generate_request_id" in params)) {
        //     params['generate_request_id'] = 0;
        // }











        // console.info(requestParams);
//             var createCORSRequest = function(method, url) {
//                 var xhr = new XMLHttpRequest();
//                 if ("withCredentials" in xhr) {

//                     // Most browsers.
//                     xhr.open(method, url, true);
//                 } else if (typeof XDomainRequest != "undefined") {
//                     // IE8 & IE9

//                     xhr = new XDomainRequest();
//                     xhr.open(method, url);
//                 } else {
//                     // CORS not supported.
//                     xhr = null;
//                 }
//                 return xhr;
//             };
//
//             // var url = 'http://server.test-cors.org/server?id=6681318&enable=true&status=200&credentials=false';
//             var url = endpoint;
//             var method = 'POST';
//             var xhr = createCORSRequest(method, url);
//
//             xhr.onload = function() {
//                 // Success code goes here.
//             };
//
//             xhr.onerror = function() {
//                 // Error code goes here.
//             };
//
//             xhr.withCredentials = true;
//             xhr.send();



        // var url = "127.0.0.1";
        // xObj = new ActiveXObject("Microsoft.XMLHTTP");
        // if(xObj!=null)
        // {
        //     xObj.open("GET", url,false);
        //     xObj.send(null);
        // }

        // if (window.XDomainRequest) {
        //     var appliance = new XDomainRequest();
        //
        //
        //     appliance.onerror = err;
        //     appliance.ontimeout = timeo;
        //     appliance.onload = loadd;
        //     appliance.timeout = 10000;
        //     appliance.open('POST',endpoint);
        //     appliance.send(JSON.stringify(requestParams));
        //     appliance.header(config);
        //         //xdr.send('foo=<?php echo $foo; ?>'); to send php variable
        //
        //
        //
        //
        // }
        // else
//                 if (window.XMLHttpRequest) {
//                 var appliance = new XMLHttpRequest();
//
//                 appliance.onreadystatechange = function() {
//                     if (appliance.readyState === 4) {

//                         if (appliance.status === 200) {

//                             // success, use appliance.responseText
//                         } else {
//                             // error

//                         }
//                     }
//                 };
//                 appliance.open("POST", endpoint, true);
//                 // appliance.open("POST", 'http://localhost', true);
//                 appliance.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//
//
// //
//                 appliance.setRequestHeader('Authorization', 'Basic ' + authEncoded);
//                 // appliance.withCredentials = true; // to support sending cookies with CORS
//                 // requestParams = {toto : 'toto'};
//                 appliance.send(JSON.stringify(requestParams));

        // }
        // else {
        //     var appliance = new ActiveXObject("Microsoft.XMLHTTP");
        // }


        // if (window.XMLHttpRequest) {
        //     //Firefox, Opera, IE7, and other browsers will use the native object
        //     var appliance = new XMLHttpRequest();
        // } else {
        //     //IE 5 and 6 will use the ActiveX control
        //     var appliance = new ActiveXObject("Microsoft.XMLHTTP");
        // }

//
//             // var appliance = new window.XMLHttpRequest();

// dump(appliance.getAllResponseHeaders());

        // return Promise(function(resolve, reject){
        //
        // });


        // return _makeRequest({
        //     method: 'POST',
        //     url: endpoint,
        //     params: requestParams,
        //     headers: config['headers']
        // });

        return new Promise(function (resolve, reject) {
            axios.post(endpoint,requestParams,config)
                .then(function(responseJson) {

                    if( typeof responseJson['code'] != 'undefined' )  {
                        reject(new _APIError(responseJson));
                    }
                    else {

                        var cardToken = new HiPay.Token(responseJson);
                        cardToken.constructor.populateProperties(cardToken, responseJson.data);
                        resolve(cardToken);
                    }
                }).catch(function (error) {
                reject(new _APIError(error));









                // var appliance = new window.XDomainRequest();
                // appliance.onload = function() {
                //     // do something with appliance.responseText
                // };
                // appliance.onerror = function() {
                //     // error handling
                // };
                //
                // // (endpoint,requestParams,config
                // appliance.open("POST", endpoint, true);
                // appliance.send(requestParams);


                // returnPromise.reject(new _APIError(error));
            });
        });

    };


    /**
     *
     * @param data
     * @private
     */
    var _APIError = function (data) {

        var payload;


        // dump(data.response.data);
        if (typeof data.response.data !== 'undefined') {
            payload = data.response.data;
        }

        if (typeof payload === 'object') {
            _processObjectPayload(this, $.extend({}, payload, {
                code: payload.code,
                message: payload.message,
                description: payload.description,
            }));
        } else {
            _processObjectPayload(this, $.extend({}, payload, {
                code: 'code',
                message: 'other',
                description: 'description'
            }));
        }
    };

    _APIError.prototype = new _Error();

    /**
     *
     * @param code
     * @param message
     * @private
     */

    // var _InvalidParametersError = function (code, message)
    function _InvalidParametersError(code, message)
    {
        _processObjectPayload(this, {
            type: 'invalid_parameters',
            code: code,
            message: message
        });
    };

    _InvalidParametersError.prototype = new _Error();


    /**
     *
     * @param errorCollection
     * @private
     */
    var _InvalidFormTokenizationError = function (errorCollection) {
        _processObjectPayload(this, {
            type: 'invalid_cc_form',
            errorCollection: errorCollection
        });
    };

    _InvalidFormTokenizationError.prototype = new _Error();


    _defineProperties(HiPay.Token, {
        token: {name: 'token'},
        requestId: {name: 'request_id'},
        brand: {name: 'brand'},
        pan: {name: 'pan'},
        cardHolder: {name: 'card_holder'},
        cardExpiryMonth: {name: 'card_expiry_month'},
        cardExpiryYear: {name: 'card_expiry_year'},
        issuer: {name: 'issuer'},
        country: {name: 'country'},
        cardType: {name: 'card_type'}
    });



    _defineProperties(_APIError, {
        code: {name: 'code'},
        message: {name: 'message'},

    });


    _defineProperties(_InvalidParametersError, {
        code: {name: 'code'},
        message: {name: 'message'},
        server_response: {name: 'serverResponse'}
    });


    _defineProperties(_InvalidFormTokenizationError, {
        code: {name: 'code'},
        message: {name: 'message'},
        errorCollection: {name: 'errorCollection'},
        server_response: {name: 'serverResponse'}
    });

    /**
     * Get a token with credit card information.
     *
     * @method HiPay.tokenize
     * @param {String} cardNumber
     * @param {String} expiryMonth
     * @param {String} expiryYear
     * @param {String} cardHolder
     * @param {String} cvv
     * @param {Boolean} multiUse
     * @param {Boolean} generateRequestId
     *
     */
    HiPay.tokenize = function(cardNumber, expiryMonth, expiryYear, cardHolder, cvv, multiUse, generateRequestId) {


        var params = {
            card_expiry_month: expiryMonth,
            card_expiry_year: expiryYear,
            card_number: cardNumber,
            card_holder: cardHolder,
            cvc: cvv,
            multi_use: multiUse,
            generate_request_id: generateRequestId
        }


        var returnPromise = Promise;
        if(!_isBrowser()) {
            return returnPromise.reject(new _APIError('"message" : "cant tokenize on server side"}'));
        }

        if(params['card_expiry_month'].length < 2) {
            params['card_expiry_month'] = '0' + params['card_expiry_month'];
        }
        if( params['card_expiry_year'].length == 2) {
            params['card_expiry_year']  = '20' +  params['card_expiry_year'];
        }
        // var errorCollection = _isValidCCForm(params);

        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();

        // var errorCollection = _isValidCCForm(params);

        // if (errorCollection.length > 0) {


        if (validatorCreditCard.isValid(params) === false) {
            // var errorCollection = _isValidCCForm(params);
            var errorCollection = validatorCreditCard.errorCollection;


            // var customError = new Error('Form error');
            var customError = new _InvalidFormTokenizationError(errorCollection);
            customError.errorCollection = errorCollection;
            return Promise.reject(customError);
        }

        else {
            var endpoint = _endPointTokenize['prod'];
            if (HiPay.getTarget() == 'test' || HiPay.getTarget() == 'stage' ) {
                endpoint = _endPointTokenize['stage'];
            } else if (HiPay.getTarget() == 'dev') {
                endpoint = 'http://localhost:8080/example/dev-api-token.php';
            }

            if (!params['generate_request_id']) {
                params['generate_request_id'] = 0;
            }

            if (!params['multi_use']) {
                params['multi_use'] = 0;
            }

            var config = {
                headers: {'Authorization': 'Basic ' + window.btoa(HiPay.username + ':' + HiPay.publicKey)}
            };

            return _performAPICall(endpoint, params, returnPromise);
        }
    };

    /**
     *
     * @param localeString
     */
    HiPay.Form.setLocale = function(localeString) {
        HiPay.Form.locale = localeString;

    };


    /**
     * Helper to display CVC information
     * @method HiPay.Form.CVCHelpText
     */
    HiPay.Form.CVCHelpText = function() {

        var serviceCreditCard = new _serviceCreditCard();
        var CVVLength = serviceCreditCard.getCreditCardCVVLengthMax();
        if (CVVLength == undefined) {
            CVVLength = 3;
        }
        return _translationJSON[HiPay.Form.locale]["FORM_CVV_"+CVVLength+"_HELP_MESSAGE"];

    };

    /**
     * Tokenize form data.
     * @method HiPay.Form.tokenizePaymentFormData
     */

    HiPay.Form.tokenizePaymentFormData = function() {

        if (!HiPay.Form.paymentFormDataIsValid()) {
            return false;
        }

        var creditCardExpiryDate = document.getElementById(_idInputMapper.cardExpiryDate).value;
        var explodeExpiryDate = creditCardExpiryDate.split(' / ');
        var month = explodeExpiryDate[0];
        var year = "20"+explodeExpiryDate[1];
        var params = {
            card_number: document.getElementById(_idInputMapper.cardNumber).value,
            card_expiry_month: month,
            card_expiry_year: year,
            card_holder: document.getElementById(_idInputMapper.cardHolder).value,
            cvv: document.getElementById(_idInputMapper.cardCVV).value,
            multi_use: '0',
            generate_request_id: '0'
        };
        return HiPay.tokenize(params['card_number'], params['card_expiry_month'], params['card_expiry_year'], params['card_holder'], params['cvv'], params['multi_use'], params['generate_request_id'] )
//

    }


    return HiPay;

} (HiPay || {}));