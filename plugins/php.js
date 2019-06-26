new Canv('canvas', {
    setup() {
        // https://www.exakat.io/top-100-php-functions/



        const php = {
            "count": arr => arr.length,
            "is_array": arr => Array.isArray(arr),
            "substr": (str, start, len) => str.substr(start, len),
            "in_array": (needle, haystack) => haystack.includes(needle),
            "explode": (delim, str) => str.split(delim),
            "str_replace": (search, replace, subject) => subject.split(search).join(replace),
            "implode": (glue, pieces) => pieces.join(glue),
            "strlen": str => str.length,
            "array_merge": function () {
                return [].concat.apply([], Array.from(arguments));
            },
            "strpos": (haystack, needle) => haystack.indexOf(needle),
            // "preg_match",
            // "sprintf",
            // "trim",
            "strtolower": str => str.toLowerCase(),
            "file_exists": path => { try { return fs.open(path)||fs.open(path, "dir") ? true : false; } catch(e) { return false } },
            "is_string": str => typeof str === "string",
            // "preg_replace",
            "file_get_contents": path => { try { return fs.open(path) ? fs.open(path).contents : false; } catch(e) { return false } },
            "array_key_exists": (key, arr) => arr[key] ? true : false,
            "array_keys": arr => Object.keys(arr),
            // "dirname",
            "function_exists": fn_name => eval("typeof " + fn_name) === "function",
            "array_map":  (fn, arr) => arr.map(fn),
            // "get_class",
            // "class_exists",
            // "is_object",
            // "time",
            "json_encode": (value, replacer, space) => JSON.stringify(value, replacer, space),
            // "date",
            "is_null": variable => variable == null,
            "is_numeric": num => !isNaN(num),
            "array_shift": arr => arr.shift(),
            // "defined",
            "is_dir": path => { try { return fs.open(path, "dir") ? true : false; } catch(e) { return false } },
            "json_decode": (value, reviver) => JSON.parse(value, reviver),
            // "header",
            "strtoupper": str => str.toUpperCase(),
            "array_values": arr => Object.values(arr),
            // "md5",
            // "method_exists": php.function_exists,
            // "file_put_contents",
            "rtrim": str => str.trimEnd(),
            "array_pop": arr => arr.pop(),
            // "unlink",
            // "basename",
            // "realpath",
            // "call_user_func",
            // "call_user_func_array",
            // "fopen",
            // "microtime",
            // "fclose"
            "is_int": num => typeof num === "Number",
            // "is_file",
            "array_slice": (arr, start, end) => arr.slice(start, end),
            // "preg_match_all",
            "ucfirst": str => str.charAt(0).toUpperCase() + str.slice(1),
            "intval": val => parseInt(val),
            "str_repeat": (input, mult) => input.repeat(mult),
            // "serialize",
            "array_filter": (arr, fn) => arr.filter(fn),
            // "mkdir",
            // "is_callable",
            "ltrim": str => str.trimStart(),
            // "ob_start",
            "round": val => Math.round(val),
            // "fwrite",
            "array_unique": arr => {
                arr = Array.from(new Set(arr));
                return arr;
            },
            // "array_search",
            // "reset",
            // "array_unshift",
            // "parse_url",
            // "func_get_args",
            // "end",
            "base_encode": val => btoa(val),
            // "unserialize",
            "max": function (arr) {
                return (typeof arr === "array") ? Math.max(...arr) : Math.max(...arguments)
            },
            // "preg_split",
            "gettype": val => typeof val,
            // "strpos",
            // "version_compare",
            "array_push": (arr, val) => arr.push(val),
            "floor": val => Math.floor(val),
            // "strtotime",
            // "htmlspecialchars",
            // "init_get",
            // "init_set",
            // "chr",
            // "extension_loaded",
            "is_bool": val => typeof val === "boolean",
            // "ksort",
            "array_reverse": arr => arr.reverse(),
            // "ord",
            // "uniqid",
            // "strtr",
            // "array_diff",
            // "error_reporting",
            "ceil": val => Math.ceil(val),
            // "urlencode",
            "min": function (arr) {
                return (typeof arr === "array") ? Math.min(...arr) : Math.min(...arguments)
            },
            "print_r": val => console.log(val),
            "hexdec": hex_string => parseInt(hex_string, 16),
            "dechex": dec => dec.toString(16),
            "base64_decode": val => atob(val),
            "array": function () {
                return Array(...arguments)
            },
            "ARRAY": function () {
                return Array(...arguments)
            }

        };


        cmd.registerSuggestions(Object.keys(php));
        Object.keys(php).forEach(func_name => {
            window[func_name] = php[func_name];
        });



    }
})