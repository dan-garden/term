new Canv('canvas', {
    setup() {
        // https://www.exakat.io/top-100-php-functions/
        window.count = arr => arr.length;
        window.is_array = arr => Array.isArray(arr);
        window.substr = (str, start, len) => str.substr(start, len);
        window.in_array = (needle, haystack) => haystack.includes(needle);
        window.explode = (delim, str) => str.split(delim);
        window.str_replace = (search, replace, subject) => subject.split(search).join(replace);
        window.implode = (glue, pieces) => pieces.join(glue);
        window.strlen = str => str.length;
        window.array_merge = function () {
            return [].concat.apply([], Array.from(arguments));
        }
        window.strpos = (haystack, needle) => haystack.indexOf(needle);
        // window.preg_match
        // window.sprintf
        // window.trim
        window.strtolower = str => str.toLowerCase();
        window.file_exists = path => { try { return fs.open(path)||fs.open(path, "dir") ? true : false; } catch(e) { return false } }
        window.is_string = str => typeof str === "string";
        // window.preg_replace
        window.file_get_contents = path => { try { return fs.open(path) ? fs.open(path).contents : false; } catch(e) { return false } }
        window.array_key_exists = (key, arr) => arr[key] ? true : false;
        window.array_keys = arr => Object.keys(arr);
        // window.dirname
        window.function_exists = fn_name => eval("typeof " + fn_name) === "function";
        window.array_map = (fn, arr) => arr.map(fn);
        // window.get_class 
        // window.class_exists
        // window.is_object
        // window.time
        window.json_encode = (value, replacer, space) => JSON.stringify(value, replacer, space);
        // window.date
        window.is_null = variable => variable == null;
        window.is_numeric = num => !isNaN(num);
        window.array_shift = arr => arr.shift();
        // window.defined
        window.is_dir = path => { try { return fs.open(path, "dir") ? true : false; } catch(e) { return false } }
        window.json_decode = (value, reviver) => JSON.parse(value, reviver);
        // window.header
        window.strtoupper = str => str.toUpperCase();
        window.array_values = arr => Object.values(arr);
        // window.md5
        window.method_exists = function_exists;
        // window.file_put_contents
        window.rtrim = str => str.trimEnd();
        window.array_pop = arr => arr.pop();
        // window.unlink
        // window.basename
        // window.realpath
        // window.call_user_func
        // window.call_user_func_array
        // window.fopen
        // window.microtime
        // window.fclose
        window.is_int = num => typeof num === "Number";
        // window.is_file
        window.array_slice = (arr, start, end) => arr.slice(start, end);
        // window.preg_match_all
        window.ucfirst = str => str.charAt(0).toUpperCase() + str.slice(1);
        window.intval = val => parseInt(val);
        window.str_repeat = (input, mult) => input.repeat(mult);
        // window.serialize
        window.array_filter = (arr, fn) => arr.filter(fn);
        // window.mkdir
        // window.is_callable
        window.ltrim = str => str.trimStart();
        // window.ob_start
        window.round = val => Math.round(val);
        // window.fwrite
        window.array_unique = arr => {
            arr = Array.from(new Set(arr));
            return arr;
        }
        // window.array_search
        // window.reset
        // window.array_unshift
        // window.parse_url
        // window.func_get_args
        // window.end
        window.base64_encode = val => btoa(val);
        // window.unserialize
        window.max = function (arr) {
            return (typeof arr === "array") ? Math.max(...arr) : Math.max(...arguments)
        };
        // window.preg_split
        window.gettype = val => typeof val;
        // window.strpos
        // window.version_compare
        window.array_push = (arr, val) => arr.push(val);
        window.floor = val => Math.floor(val);
        // window.strtotime
        // window.htmlspecialchars
        // window.init_get
        // window.init_set
        // window.chr
        // window.extension_loaded
        window.is_bool = val => typeof val === "boolean";
        // window.ksort
        window.array_reverse = arr => arr.reverse();
        // window.ord
        // window.uniqid
        // window.strtr
        // window.array_diff
        // window.error_reporting
        window.ceil = val => Math.ceil(val);
        // window.urlencode
        window.min = function (arr) {
            return (typeof arr === "array") ? Math.min(...arr) : Math.min(...arguments)
        }
        window.print_r = val => console.log(val);


        window.hexdec = hex_string => parseInt(hex_string, 16);
        window.dechex = dec => dec.toString(16);
        window.base64_decode = val => atob(val);

        window.array = function () {
            return Array(...arguments)
        };
        window.ARRAY = array;








    }
})