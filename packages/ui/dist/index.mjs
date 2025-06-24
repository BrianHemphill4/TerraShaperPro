var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __restKey = (key) => typeof key === "symbol" ? key : key + "";
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../node_modules/tslib/tslib.es6.mjs
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
var extendStatics, __assign;
var init_tslib_es6 = __esm({
  "../../node_modules/tslib/tslib.es6.mjs"() {
    "use strict";
    extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    __assign = function() {
      __assign = Object.assign || function __assign2(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
  }
});

// ../../node_modules/@formatjs/fast-memoize/lib/index.js
var lib_exports = {};
__export(lib_exports, {
  memoize: () => memoize,
  strategies: () => strategies
});
function memoize(fn, options) {
  var cache = options && options.cache ? options.cache : cacheDefault;
  var serializer = options && options.serializer ? options.serializer : serializerDefault;
  var strategy = options && options.strategy ? options.strategy : strategyDefault;
  return strategy(fn, {
    cache,
    serializer
  });
}
function isPrimitive(value) {
  return value == null || typeof value === "number" || typeof value === "boolean";
}
function monadic(fn, cache, serializer, arg) {
  var cacheKey = isPrimitive(arg) ? arg : serializer(arg);
  var computedValue = cache.get(cacheKey);
  if (typeof computedValue === "undefined") {
    computedValue = fn.call(this, arg);
    cache.set(cacheKey, computedValue);
  }
  return computedValue;
}
function variadic(fn, cache, serializer) {
  var args = Array.prototype.slice.call(arguments, 3);
  var cacheKey = serializer(args);
  var computedValue = cache.get(cacheKey);
  if (typeof computedValue === "undefined") {
    computedValue = fn.apply(this, args);
    cache.set(cacheKey, computedValue);
  }
  return computedValue;
}
function assemble(fn, context, strategy, cache, serialize) {
  return strategy.bind(context, fn, cache, serialize);
}
function strategyDefault(fn, options) {
  var strategy = fn.length === 1 ? monadic : variadic;
  return assemble(fn, this, strategy, options.cache.create(), options.serializer);
}
function strategyVariadic(fn, options) {
  return assemble(fn, this, variadic, options.cache.create(), options.serializer);
}
function strategyMonadic(fn, options) {
  return assemble(fn, this, monadic, options.cache.create(), options.serializer);
}
var serializerDefault, ObjectWithoutPrototypeCache, cacheDefault, strategies;
var init_lib = __esm({
  "../../node_modules/@formatjs/fast-memoize/lib/index.js"() {
    "use strict";
    serializerDefault = function() {
      return JSON.stringify(arguments);
    };
    ObjectWithoutPrototypeCache = /** @class */
    function() {
      function ObjectWithoutPrototypeCache2() {
        this.cache = /* @__PURE__ */ Object.create(null);
      }
      ObjectWithoutPrototypeCache2.prototype.get = function(key) {
        return this.cache[key];
      };
      ObjectWithoutPrototypeCache2.prototype.set = function(key, value) {
        this.cache[key] = value;
      };
      return ObjectWithoutPrototypeCache2;
    }();
    cacheDefault = {
      create: function create() {
        return new ObjectWithoutPrototypeCache();
      }
    };
    strategies = {
      variadic: strategyVariadic,
      monadic: strategyMonadic
    };
  }
});

// ../../node_modules/@formatjs/icu-messageformat-parser/lib/error.js
var ErrorKind;
var init_error = __esm({
  "../../node_modules/@formatjs/icu-messageformat-parser/lib/error.js"() {
    "use strict";
    (function(ErrorKind2) {
      ErrorKind2[ErrorKind2["EXPECT_ARGUMENT_CLOSING_BRACE"] = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE";
      ErrorKind2[ErrorKind2["EMPTY_ARGUMENT"] = 2] = "EMPTY_ARGUMENT";
      ErrorKind2[ErrorKind2["MALFORMED_ARGUMENT"] = 3] = "MALFORMED_ARGUMENT";
      ErrorKind2[ErrorKind2["EXPECT_ARGUMENT_TYPE"] = 4] = "EXPECT_ARGUMENT_TYPE";
      ErrorKind2[ErrorKind2["INVALID_ARGUMENT_TYPE"] = 5] = "INVALID_ARGUMENT_TYPE";
      ErrorKind2[ErrorKind2["EXPECT_ARGUMENT_STYLE"] = 6] = "EXPECT_ARGUMENT_STYLE";
      ErrorKind2[ErrorKind2["INVALID_NUMBER_SKELETON"] = 7] = "INVALID_NUMBER_SKELETON";
      ErrorKind2[ErrorKind2["INVALID_DATE_TIME_SKELETON"] = 8] = "INVALID_DATE_TIME_SKELETON";
      ErrorKind2[ErrorKind2["EXPECT_NUMBER_SKELETON"] = 9] = "EXPECT_NUMBER_SKELETON";
      ErrorKind2[ErrorKind2["EXPECT_DATE_TIME_SKELETON"] = 10] = "EXPECT_DATE_TIME_SKELETON";
      ErrorKind2[ErrorKind2["UNCLOSED_QUOTE_IN_ARGUMENT_STYLE"] = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE";
      ErrorKind2[ErrorKind2["EXPECT_SELECT_ARGUMENT_OPTIONS"] = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS";
      ErrorKind2[ErrorKind2["EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE"] = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE";
      ErrorKind2[ErrorKind2["INVALID_PLURAL_ARGUMENT_OFFSET_VALUE"] = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE";
      ErrorKind2[ErrorKind2["EXPECT_SELECT_ARGUMENT_SELECTOR"] = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR";
      ErrorKind2[ErrorKind2["EXPECT_PLURAL_ARGUMENT_SELECTOR"] = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR";
      ErrorKind2[ErrorKind2["EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT"] = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT";
      ErrorKind2[ErrorKind2["EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT"] = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT";
      ErrorKind2[ErrorKind2["INVALID_PLURAL_ARGUMENT_SELECTOR"] = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR";
      ErrorKind2[ErrorKind2["DUPLICATE_PLURAL_ARGUMENT_SELECTOR"] = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR";
      ErrorKind2[ErrorKind2["DUPLICATE_SELECT_ARGUMENT_SELECTOR"] = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR";
      ErrorKind2[ErrorKind2["MISSING_OTHER_CLAUSE"] = 22] = "MISSING_OTHER_CLAUSE";
      ErrorKind2[ErrorKind2["INVALID_TAG"] = 23] = "INVALID_TAG";
      ErrorKind2[ErrorKind2["INVALID_TAG_NAME"] = 25] = "INVALID_TAG_NAME";
      ErrorKind2[ErrorKind2["UNMATCHED_CLOSING_TAG"] = 26] = "UNMATCHED_CLOSING_TAG";
      ErrorKind2[ErrorKind2["UNCLOSED_TAG"] = 27] = "UNCLOSED_TAG";
    })(ErrorKind || (ErrorKind = {}));
  }
});

// ../../node_modules/@formatjs/icu-messageformat-parser/lib/types.js
function isLiteralElement(el) {
  return el.type === TYPE.literal;
}
function isArgumentElement(el) {
  return el.type === TYPE.argument;
}
function isNumberElement(el) {
  return el.type === TYPE.number;
}
function isDateElement(el) {
  return el.type === TYPE.date;
}
function isTimeElement(el) {
  return el.type === TYPE.time;
}
function isSelectElement(el) {
  return el.type === TYPE.select;
}
function isPluralElement(el) {
  return el.type === TYPE.plural;
}
function isPoundElement(el) {
  return el.type === TYPE.pound;
}
function isTagElement(el) {
  return el.type === TYPE.tag;
}
function isNumberSkeleton(el) {
  return !!(el && typeof el === "object" && el.type === SKELETON_TYPE.number);
}
function isDateTimeSkeleton(el) {
  return !!(el && typeof el === "object" && el.type === SKELETON_TYPE.dateTime);
}
var TYPE, SKELETON_TYPE;
var init_types = __esm({
  "../../node_modules/@formatjs/icu-messageformat-parser/lib/types.js"() {
    "use strict";
    (function(TYPE2) {
      TYPE2[TYPE2["literal"] = 0] = "literal";
      TYPE2[TYPE2["argument"] = 1] = "argument";
      TYPE2[TYPE2["number"] = 2] = "number";
      TYPE2[TYPE2["date"] = 3] = "date";
      TYPE2[TYPE2["time"] = 4] = "time";
      TYPE2[TYPE2["select"] = 5] = "select";
      TYPE2[TYPE2["plural"] = 6] = "plural";
      TYPE2[TYPE2["pound"] = 7] = "pound";
      TYPE2[TYPE2["tag"] = 8] = "tag";
    })(TYPE || (TYPE = {}));
    (function(SKELETON_TYPE2) {
      SKELETON_TYPE2[SKELETON_TYPE2["number"] = 0] = "number";
      SKELETON_TYPE2[SKELETON_TYPE2["dateTime"] = 1] = "dateTime";
    })(SKELETON_TYPE || (SKELETON_TYPE = {}));
  }
});

// ../../node_modules/@formatjs/icu-messageformat-parser/lib/regex.generated.js
var SPACE_SEPARATOR_REGEX;
var init_regex_generated = __esm({
  "../../node_modules/@formatjs/icu-messageformat-parser/lib/regex.generated.js"() {
    "use strict";
    SPACE_SEPARATOR_REGEX = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/;
  }
});

// ../../node_modules/@formatjs/icu-skeleton-parser/lib/date-time.js
function parseDateTimeSkeleton(skeleton) {
  var result = {};
  skeleton.replace(DATE_TIME_REGEX, function(match) {
    var len = match.length;
    switch (match[0]) {
      // Era
      case "G":
        result.era = len === 4 ? "long" : len === 5 ? "narrow" : "short";
        break;
      // Year
      case "y":
        result.year = len === 2 ? "2-digit" : "numeric";
        break;
      case "Y":
      case "u":
      case "U":
      case "r":
        throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");
      // Quarter
      case "q":
      case "Q":
        throw new RangeError("`q/Q` (quarter) patterns are not supported");
      // Month
      case "M":
      case "L":
        result.month = ["numeric", "2-digit", "short", "long", "narrow"][len - 1];
        break;
      // Week
      case "w":
      case "W":
        throw new RangeError("`w/W` (week) patterns are not supported");
      case "d":
        result.day = ["numeric", "2-digit"][len - 1];
        break;
      case "D":
      case "F":
      case "g":
        throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");
      // Weekday
      case "E":
        result.weekday = len === 4 ? "long" : len === 5 ? "narrow" : "short";
        break;
      case "e":
        if (len < 4) {
          throw new RangeError("`e..eee` (weekday) patterns are not supported");
        }
        result.weekday = ["short", "long", "narrow", "short"][len - 4];
        break;
      case "c":
        if (len < 4) {
          throw new RangeError("`c..ccc` (weekday) patterns are not supported");
        }
        result.weekday = ["short", "long", "narrow", "short"][len - 4];
        break;
      // Period
      case "a":
        result.hour12 = true;
        break;
      case "b":
      // am, pm, noon, midnight
      case "B":
        throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");
      // Hour
      case "h":
        result.hourCycle = "h12";
        result.hour = ["numeric", "2-digit"][len - 1];
        break;
      case "H":
        result.hourCycle = "h23";
        result.hour = ["numeric", "2-digit"][len - 1];
        break;
      case "K":
        result.hourCycle = "h11";
        result.hour = ["numeric", "2-digit"][len - 1];
        break;
      case "k":
        result.hourCycle = "h24";
        result.hour = ["numeric", "2-digit"][len - 1];
        break;
      case "j":
      case "J":
      case "C":
        throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");
      // Minute
      case "m":
        result.minute = ["numeric", "2-digit"][len - 1];
        break;
      // Second
      case "s":
        result.second = ["numeric", "2-digit"][len - 1];
        break;
      case "S":
      case "A":
        throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");
      // Zone
      case "z":
        result.timeZoneName = len < 4 ? "short" : "long";
        break;
      case "Z":
      // 1..3, 4, 5: The ISO8601 varios formats
      case "O":
      // 1, 4: milliseconds in day short, long
      case "v":
      // 1, 4: generic non-location format
      case "V":
      // 1, 2, 3, 4: time zone ID or city
      case "X":
      // 1, 2, 3, 4: The ISO8601 varios formats
      case "x":
        throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead");
    }
    return "";
  });
  return result;
}
var DATE_TIME_REGEX;
var init_date_time = __esm({
  "../../node_modules/@formatjs/icu-skeleton-parser/lib/date-time.js"() {
    "use strict";
    DATE_TIME_REGEX = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
  }
});

// ../../node_modules/@formatjs/icu-skeleton-parser/lib/regex.generated.js
var WHITE_SPACE_REGEX;
var init_regex_generated2 = __esm({
  "../../node_modules/@formatjs/icu-skeleton-parser/lib/regex.generated.js"() {
    "use strict";
    WHITE_SPACE_REGEX = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;
  }
});

// ../../node_modules/@formatjs/icu-skeleton-parser/lib/number.js
function parseNumberSkeletonFromString(skeleton) {
  if (skeleton.length === 0) {
    throw new Error("Number skeleton cannot be empty");
  }
  var stringTokens = skeleton.split(WHITE_SPACE_REGEX).filter(function(x) {
    return x.length > 0;
  });
  var tokens = [];
  for (var _i = 0, stringTokens_1 = stringTokens; _i < stringTokens_1.length; _i++) {
    var stringToken = stringTokens_1[_i];
    var stemAndOptions = stringToken.split("/");
    if (stemAndOptions.length === 0) {
      throw new Error("Invalid number skeleton");
    }
    var stem = stemAndOptions[0], options = stemAndOptions.slice(1);
    for (var _a2 = 0, options_1 = options; _a2 < options_1.length; _a2++) {
      var option = options_1[_a2];
      if (option.length === 0) {
        throw new Error("Invalid number skeleton");
      }
    }
    tokens.push({ stem, options });
  }
  return tokens;
}
function icuUnitToEcma(unit) {
  return unit.replace(/^(.*?)-/, "");
}
function parseSignificantPrecision(str) {
  var result = {};
  if (str[str.length - 1] === "r") {
    result.roundingPriority = "morePrecision";
  } else if (str[str.length - 1] === "s") {
    result.roundingPriority = "lessPrecision";
  }
  str.replace(SIGNIFICANT_PRECISION_REGEX, function(_, g1, g2) {
    if (typeof g2 !== "string") {
      result.minimumSignificantDigits = g1.length;
      result.maximumSignificantDigits = g1.length;
    } else if (g2 === "+") {
      result.minimumSignificantDigits = g1.length;
    } else if (g1[0] === "#") {
      result.maximumSignificantDigits = g1.length;
    } else {
      result.minimumSignificantDigits = g1.length;
      result.maximumSignificantDigits = g1.length + (typeof g2 === "string" ? g2.length : 0);
    }
    return "";
  });
  return result;
}
function parseSign(str) {
  switch (str) {
    case "sign-auto":
      return {
        signDisplay: "auto"
      };
    case "sign-accounting":
    case "()":
      return {
        currencySign: "accounting"
      };
    case "sign-always":
    case "+!":
      return {
        signDisplay: "always"
      };
    case "sign-accounting-always":
    case "()!":
      return {
        signDisplay: "always",
        currencySign: "accounting"
      };
    case "sign-except-zero":
    case "+?":
      return {
        signDisplay: "exceptZero"
      };
    case "sign-accounting-except-zero":
    case "()?":
      return {
        signDisplay: "exceptZero",
        currencySign: "accounting"
      };
    case "sign-never":
    case "+_":
      return {
        signDisplay: "never"
      };
  }
}
function parseConciseScientificAndEngineeringStem(stem) {
  var result;
  if (stem[0] === "E" && stem[1] === "E") {
    result = {
      notation: "engineering"
    };
    stem = stem.slice(2);
  } else if (stem[0] === "E") {
    result = {
      notation: "scientific"
    };
    stem = stem.slice(1);
  }
  if (result) {
    var signDisplay = stem.slice(0, 2);
    if (signDisplay === "+!") {
      result.signDisplay = "always";
      stem = stem.slice(2);
    } else if (signDisplay === "+?") {
      result.signDisplay = "exceptZero";
      stem = stem.slice(2);
    }
    if (!CONCISE_INTEGER_WIDTH_REGEX.test(stem)) {
      throw new Error("Malformed concise eng/scientific notation");
    }
    result.minimumIntegerDigits = stem.length;
  }
  return result;
}
function parseNotationOptions(opt) {
  var result = {};
  var signOpts = parseSign(opt);
  if (signOpts) {
    return signOpts;
  }
  return result;
}
function parseNumberSkeleton(tokens) {
  var result = {};
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    switch (token.stem) {
      case "percent":
      case "%":
        result.style = "percent";
        continue;
      case "%x100":
        result.style = "percent";
        result.scale = 100;
        continue;
      case "currency":
        result.style = "currency";
        result.currency = token.options[0];
        continue;
      case "group-off":
      case ",_":
        result.useGrouping = false;
        continue;
      case "precision-integer":
      case ".":
        result.maximumFractionDigits = 0;
        continue;
      case "measure-unit":
      case "unit":
        result.style = "unit";
        result.unit = icuUnitToEcma(token.options[0]);
        continue;
      case "compact-short":
      case "K":
        result.notation = "compact";
        result.compactDisplay = "short";
        continue;
      case "compact-long":
      case "KK":
        result.notation = "compact";
        result.compactDisplay = "long";
        continue;
      case "scientific":
        result = __assign(__assign(__assign({}, result), { notation: "scientific" }), token.options.reduce(function(all, opt2) {
          return __assign(__assign({}, all), parseNotationOptions(opt2));
        }, {}));
        continue;
      case "engineering":
        result = __assign(__assign(__assign({}, result), { notation: "engineering" }), token.options.reduce(function(all, opt2) {
          return __assign(__assign({}, all), parseNotationOptions(opt2));
        }, {}));
        continue;
      case "notation-simple":
        result.notation = "standard";
        continue;
      // https://github.com/unicode-org/icu/blob/master/icu4c/source/i18n/unicode/unumberformatter.h
      case "unit-width-narrow":
        result.currencyDisplay = "narrowSymbol";
        result.unitDisplay = "narrow";
        continue;
      case "unit-width-short":
        result.currencyDisplay = "code";
        result.unitDisplay = "short";
        continue;
      case "unit-width-full-name":
        result.currencyDisplay = "name";
        result.unitDisplay = "long";
        continue;
      case "unit-width-iso-code":
        result.currencyDisplay = "symbol";
        continue;
      case "scale":
        result.scale = parseFloat(token.options[0]);
        continue;
      case "rounding-mode-floor":
        result.roundingMode = "floor";
        continue;
      case "rounding-mode-ceiling":
        result.roundingMode = "ceil";
        continue;
      case "rounding-mode-down":
        result.roundingMode = "trunc";
        continue;
      case "rounding-mode-up":
        result.roundingMode = "expand";
        continue;
      case "rounding-mode-half-even":
        result.roundingMode = "halfEven";
        continue;
      case "rounding-mode-half-down":
        result.roundingMode = "halfTrunc";
        continue;
      case "rounding-mode-half-up":
        result.roundingMode = "halfExpand";
        continue;
      // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
      case "integer-width":
        if (token.options.length > 1) {
          throw new RangeError("integer-width stems only accept a single optional option");
        }
        token.options[0].replace(INTEGER_WIDTH_REGEX, function(_, g1, g2, g3, g4, g5) {
          if (g1) {
            result.minimumIntegerDigits = g2.length;
          } else if (g3 && g4) {
            throw new Error("We currently do not support maximum integer digits");
          } else if (g5) {
            throw new Error("We currently do not support exact integer digits");
          }
          return "";
        });
        continue;
    }
    if (CONCISE_INTEGER_WIDTH_REGEX.test(token.stem)) {
      result.minimumIntegerDigits = token.stem.length;
      continue;
    }
    if (FRACTION_PRECISION_REGEX.test(token.stem)) {
      if (token.options.length > 1) {
        throw new RangeError("Fraction-precision stems only accept a single optional option");
      }
      token.stem.replace(FRACTION_PRECISION_REGEX, function(_, g1, g2, g3, g4, g5) {
        if (g2 === "*") {
          result.minimumFractionDigits = g1.length;
        } else if (g3 && g3[0] === "#") {
          result.maximumFractionDigits = g3.length;
        } else if (g4 && g5) {
          result.minimumFractionDigits = g4.length;
          result.maximumFractionDigits = g4.length + g5.length;
        } else {
          result.minimumFractionDigits = g1.length;
          result.maximumFractionDigits = g1.length;
        }
        return "";
      });
      var opt = token.options[0];
      if (opt === "w") {
        result = __assign(__assign({}, result), { trailingZeroDisplay: "stripIfInteger" });
      } else if (opt) {
        result = __assign(__assign({}, result), parseSignificantPrecision(opt));
      }
      continue;
    }
    if (SIGNIFICANT_PRECISION_REGEX.test(token.stem)) {
      result = __assign(__assign({}, result), parseSignificantPrecision(token.stem));
      continue;
    }
    var signOpts = parseSign(token.stem);
    if (signOpts) {
      result = __assign(__assign({}, result), signOpts);
    }
    var conciseScientificAndEngineeringOpts = parseConciseScientificAndEngineeringStem(token.stem);
    if (conciseScientificAndEngineeringOpts) {
      result = __assign(__assign({}, result), conciseScientificAndEngineeringOpts);
    }
  }
  return result;
}
var FRACTION_PRECISION_REGEX, SIGNIFICANT_PRECISION_REGEX, INTEGER_WIDTH_REGEX, CONCISE_INTEGER_WIDTH_REGEX;
var init_number = __esm({
  "../../node_modules/@formatjs/icu-skeleton-parser/lib/number.js"() {
    "use strict";
    init_tslib_es6();
    init_regex_generated2();
    FRACTION_PRECISION_REGEX = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g;
    SIGNIFICANT_PRECISION_REGEX = /^(@+)?(\+|#+)?[rs]?$/g;
    INTEGER_WIDTH_REGEX = /(\*)(0+)|(#+)(0+)|(0+)/g;
    CONCISE_INTEGER_WIDTH_REGEX = /^(0+)$/;
  }
});

// ../../node_modules/@formatjs/icu-skeleton-parser/lib/index.js
var init_lib2 = __esm({
  "../../node_modules/@formatjs/icu-skeleton-parser/lib/index.js"() {
    "use strict";
    init_date_time();
    init_number();
  }
});

// ../../node_modules/@formatjs/icu-messageformat-parser/lib/time-data.generated.js
var timeData;
var init_time_data_generated = __esm({
  "../../node_modules/@formatjs/icu-messageformat-parser/lib/time-data.generated.js"() {
    "use strict";
    timeData = {
      "001": [
        "H",
        "h"
      ],
      "419": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "AC": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "AD": [
        "H",
        "hB"
      ],
      "AE": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "AF": [
        "H",
        "hb",
        "hB",
        "h"
      ],
      "AG": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "AI": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "AL": [
        "h",
        "H",
        "hB"
      ],
      "AM": [
        "H",
        "hB"
      ],
      "AO": [
        "H",
        "hB"
      ],
      "AR": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "AS": [
        "h",
        "H"
      ],
      "AT": [
        "H",
        "hB"
      ],
      "AU": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "AW": [
        "H",
        "hB"
      ],
      "AX": [
        "H"
      ],
      "AZ": [
        "H",
        "hB",
        "h"
      ],
      "BA": [
        "H",
        "hB",
        "h"
      ],
      "BB": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "BD": [
        "h",
        "hB",
        "H"
      ],
      "BE": [
        "H",
        "hB"
      ],
      "BF": [
        "H",
        "hB"
      ],
      "BG": [
        "H",
        "hB",
        "h"
      ],
      "BH": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "BI": [
        "H",
        "h"
      ],
      "BJ": [
        "H",
        "hB"
      ],
      "BL": [
        "H",
        "hB"
      ],
      "BM": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "BN": [
        "hb",
        "hB",
        "h",
        "H"
      ],
      "BO": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "BQ": [
        "H"
      ],
      "BR": [
        "H",
        "hB"
      ],
      "BS": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "BT": [
        "h",
        "H"
      ],
      "BW": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "BY": [
        "H",
        "h"
      ],
      "BZ": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "CA": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "CC": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "CD": [
        "hB",
        "H"
      ],
      "CF": [
        "H",
        "h",
        "hB"
      ],
      "CG": [
        "H",
        "hB"
      ],
      "CH": [
        "H",
        "hB",
        "h"
      ],
      "CI": [
        "H",
        "hB"
      ],
      "CK": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "CL": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "CM": [
        "H",
        "h",
        "hB"
      ],
      "CN": [
        "H",
        "hB",
        "hb",
        "h"
      ],
      "CO": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "CP": [
        "H"
      ],
      "CR": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "CU": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "CV": [
        "H",
        "hB"
      ],
      "CW": [
        "H",
        "hB"
      ],
      "CX": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "CY": [
        "h",
        "H",
        "hb",
        "hB"
      ],
      "CZ": [
        "H"
      ],
      "DE": [
        "H",
        "hB"
      ],
      "DG": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "DJ": [
        "h",
        "H"
      ],
      "DK": [
        "H"
      ],
      "DM": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "DO": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "DZ": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "EA": [
        "H",
        "h",
        "hB",
        "hb"
      ],
      "EC": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "EE": [
        "H",
        "hB"
      ],
      "EG": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "EH": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "ER": [
        "h",
        "H"
      ],
      "ES": [
        "H",
        "hB",
        "h",
        "hb"
      ],
      "ET": [
        "hB",
        "hb",
        "h",
        "H"
      ],
      "FI": [
        "H"
      ],
      "FJ": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "FK": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "FM": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "FO": [
        "H",
        "h"
      ],
      "FR": [
        "H",
        "hB"
      ],
      "GA": [
        "H",
        "hB"
      ],
      "GB": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "GD": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "GE": [
        "H",
        "hB",
        "h"
      ],
      "GF": [
        "H",
        "hB"
      ],
      "GG": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "GH": [
        "h",
        "H"
      ],
      "GI": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "GL": [
        "H",
        "h"
      ],
      "GM": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "GN": [
        "H",
        "hB"
      ],
      "GP": [
        "H",
        "hB"
      ],
      "GQ": [
        "H",
        "hB",
        "h",
        "hb"
      ],
      "GR": [
        "h",
        "H",
        "hb",
        "hB"
      ],
      "GT": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "GU": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "GW": [
        "H",
        "hB"
      ],
      "GY": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "HK": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "HN": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "HR": [
        "H",
        "hB"
      ],
      "HU": [
        "H",
        "h"
      ],
      "IC": [
        "H",
        "h",
        "hB",
        "hb"
      ],
      "ID": [
        "H"
      ],
      "IE": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "IL": [
        "H",
        "hB"
      ],
      "IM": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "IN": [
        "h",
        "H"
      ],
      "IO": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "IQ": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "IR": [
        "hB",
        "H"
      ],
      "IS": [
        "H"
      ],
      "IT": [
        "H",
        "hB"
      ],
      "JE": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "JM": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "JO": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "JP": [
        "H",
        "K",
        "h"
      ],
      "KE": [
        "hB",
        "hb",
        "H",
        "h"
      ],
      "KG": [
        "H",
        "h",
        "hB",
        "hb"
      ],
      "KH": [
        "hB",
        "h",
        "H",
        "hb"
      ],
      "KI": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "KM": [
        "H",
        "h",
        "hB",
        "hb"
      ],
      "KN": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "KP": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "KR": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "KW": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "KY": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "KZ": [
        "H",
        "hB"
      ],
      "LA": [
        "H",
        "hb",
        "hB",
        "h"
      ],
      "LB": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "LC": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "LI": [
        "H",
        "hB",
        "h"
      ],
      "LK": [
        "H",
        "h",
        "hB",
        "hb"
      ],
      "LR": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "LS": [
        "h",
        "H"
      ],
      "LT": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "LU": [
        "H",
        "h",
        "hB"
      ],
      "LV": [
        "H",
        "hB",
        "hb",
        "h"
      ],
      "LY": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "MA": [
        "H",
        "h",
        "hB",
        "hb"
      ],
      "MC": [
        "H",
        "hB"
      ],
      "MD": [
        "H",
        "hB"
      ],
      "ME": [
        "H",
        "hB",
        "h"
      ],
      "MF": [
        "H",
        "hB"
      ],
      "MG": [
        "H",
        "h"
      ],
      "MH": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "MK": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "ML": [
        "H"
      ],
      "MM": [
        "hB",
        "hb",
        "H",
        "h"
      ],
      "MN": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "MO": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "MP": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "MQ": [
        "H",
        "hB"
      ],
      "MR": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "MS": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "MT": [
        "H",
        "h"
      ],
      "MU": [
        "H",
        "h"
      ],
      "MV": [
        "H",
        "h"
      ],
      "MW": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "MX": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "MY": [
        "hb",
        "hB",
        "h",
        "H"
      ],
      "MZ": [
        "H",
        "hB"
      ],
      "NA": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "NC": [
        "H",
        "hB"
      ],
      "NE": [
        "H"
      ],
      "NF": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "NG": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "NI": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "NL": [
        "H",
        "hB"
      ],
      "NO": [
        "H",
        "h"
      ],
      "NP": [
        "H",
        "h",
        "hB"
      ],
      "NR": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "NU": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "NZ": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "OM": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "PA": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "PE": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "PF": [
        "H",
        "h",
        "hB"
      ],
      "PG": [
        "h",
        "H"
      ],
      "PH": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "PK": [
        "h",
        "hB",
        "H"
      ],
      "PL": [
        "H",
        "h"
      ],
      "PM": [
        "H",
        "hB"
      ],
      "PN": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "PR": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "PS": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "PT": [
        "H",
        "hB"
      ],
      "PW": [
        "h",
        "H"
      ],
      "PY": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "QA": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "RE": [
        "H",
        "hB"
      ],
      "RO": [
        "H",
        "hB"
      ],
      "RS": [
        "H",
        "hB",
        "h"
      ],
      "RU": [
        "H"
      ],
      "RW": [
        "H",
        "h"
      ],
      "SA": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "SB": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "SC": [
        "H",
        "h",
        "hB"
      ],
      "SD": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "SE": [
        "H"
      ],
      "SG": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "SH": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "SI": [
        "H",
        "hB"
      ],
      "SJ": [
        "H"
      ],
      "SK": [
        "H"
      ],
      "SL": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "SM": [
        "H",
        "h",
        "hB"
      ],
      "SN": [
        "H",
        "h",
        "hB"
      ],
      "SO": [
        "h",
        "H"
      ],
      "SR": [
        "H",
        "hB"
      ],
      "SS": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "ST": [
        "H",
        "hB"
      ],
      "SV": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "SX": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "SY": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "SZ": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "TA": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "TC": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "TD": [
        "h",
        "H",
        "hB"
      ],
      "TF": [
        "H",
        "h",
        "hB"
      ],
      "TG": [
        "H",
        "hB"
      ],
      "TH": [
        "H",
        "h"
      ],
      "TJ": [
        "H",
        "h"
      ],
      "TL": [
        "H",
        "hB",
        "hb",
        "h"
      ],
      "TM": [
        "H",
        "h"
      ],
      "TN": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "TO": [
        "h",
        "H"
      ],
      "TR": [
        "H",
        "hB"
      ],
      "TT": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "TW": [
        "hB",
        "hb",
        "h",
        "H"
      ],
      "TZ": [
        "hB",
        "hb",
        "H",
        "h"
      ],
      "UA": [
        "H",
        "hB",
        "h"
      ],
      "UG": [
        "hB",
        "hb",
        "H",
        "h"
      ],
      "UM": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "US": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "UY": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "UZ": [
        "H",
        "hB",
        "h"
      ],
      "VA": [
        "H",
        "h",
        "hB"
      ],
      "VC": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "VE": [
        "h",
        "H",
        "hB",
        "hb"
      ],
      "VG": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "VI": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "VN": [
        "H",
        "h"
      ],
      "VU": [
        "h",
        "H"
      ],
      "WF": [
        "H",
        "hB"
      ],
      "WS": [
        "h",
        "H"
      ],
      "XK": [
        "H",
        "hB",
        "h"
      ],
      "YE": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "YT": [
        "H",
        "hB"
      ],
      "ZA": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "ZM": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "ZW": [
        "H",
        "h"
      ],
      "af-ZA": [
        "H",
        "h",
        "hB",
        "hb"
      ],
      "ar-001": [
        "h",
        "hB",
        "hb",
        "H"
      ],
      "ca-ES": [
        "H",
        "h",
        "hB"
      ],
      "en-001": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "en-HK": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "en-IL": [
        "H",
        "h",
        "hb",
        "hB"
      ],
      "en-MY": [
        "h",
        "hb",
        "H",
        "hB"
      ],
      "es-BR": [
        "H",
        "h",
        "hB",
        "hb"
      ],
      "es-ES": [
        "H",
        "h",
        "hB",
        "hb"
      ],
      "es-GQ": [
        "H",
        "h",
        "hB",
        "hb"
      ],
      "fr-CA": [
        "H",
        "h",
        "hB"
      ],
      "gl-ES": [
        "H",
        "h",
        "hB"
      ],
      "gu-IN": [
        "hB",
        "hb",
        "h",
        "H"
      ],
      "hi-IN": [
        "hB",
        "h",
        "H"
      ],
      "it-CH": [
        "H",
        "h",
        "hB"
      ],
      "it-IT": [
        "H",
        "h",
        "hB"
      ],
      "kn-IN": [
        "hB",
        "h",
        "H"
      ],
      "ml-IN": [
        "hB",
        "h",
        "H"
      ],
      "mr-IN": [
        "hB",
        "hb",
        "h",
        "H"
      ],
      "pa-IN": [
        "hB",
        "hb",
        "h",
        "H"
      ],
      "ta-IN": [
        "hB",
        "h",
        "hb",
        "H"
      ],
      "te-IN": [
        "hB",
        "h",
        "H"
      ],
      "zu-ZA": [
        "H",
        "hB",
        "hb",
        "h"
      ]
    };
  }
});

// ../../node_modules/@formatjs/icu-messageformat-parser/lib/date-time-pattern-generator.js
function getBestPattern(skeleton, locale) {
  var skeletonCopy = "";
  for (var patternPos = 0; patternPos < skeleton.length; patternPos++) {
    var patternChar = skeleton.charAt(patternPos);
    if (patternChar === "j") {
      var extraLength = 0;
      while (patternPos + 1 < skeleton.length && skeleton.charAt(patternPos + 1) === patternChar) {
        extraLength++;
        patternPos++;
      }
      var hourLen = 1 + (extraLength & 1);
      var dayPeriodLen = extraLength < 2 ? 1 : 3 + (extraLength >> 1);
      var dayPeriodChar = "a";
      var hourChar = getDefaultHourSymbolFromLocale(locale);
      if (hourChar == "H" || hourChar == "k") {
        dayPeriodLen = 0;
      }
      while (dayPeriodLen-- > 0) {
        skeletonCopy += dayPeriodChar;
      }
      while (hourLen-- > 0) {
        skeletonCopy = hourChar + skeletonCopy;
      }
    } else if (patternChar === "J") {
      skeletonCopy += "H";
    } else {
      skeletonCopy += patternChar;
    }
  }
  return skeletonCopy;
}
function getDefaultHourSymbolFromLocale(locale) {
  var hourCycle = locale.hourCycle;
  if (hourCycle === void 0 && // @ts-ignore hourCycle(s) is not identified yet
  locale.hourCycles && // @ts-ignore
  locale.hourCycles.length) {
    hourCycle = locale.hourCycles[0];
  }
  if (hourCycle) {
    switch (hourCycle) {
      case "h24":
        return "k";
      case "h23":
        return "H";
      case "h12":
        return "h";
      case "h11":
        return "K";
      default:
        throw new Error("Invalid hourCycle");
    }
  }
  var languageTag = locale.language;
  var regionTag;
  if (languageTag !== "root") {
    regionTag = locale.maximize().region;
  }
  var hourCycles = timeData[regionTag || ""] || timeData[languageTag || ""] || timeData["".concat(languageTag, "-001")] || timeData["001"];
  return hourCycles[0];
}
var init_date_time_pattern_generator = __esm({
  "../../node_modules/@formatjs/icu-messageformat-parser/lib/date-time-pattern-generator.js"() {
    "use strict";
    init_time_data_generated();
  }
});

// ../../node_modules/@formatjs/icu-messageformat-parser/lib/parser.js
function createLocation(start, end) {
  return { start, end };
}
function RE(s, flag) {
  return new RegExp(s, flag);
}
function _isAlpha(codepoint) {
  return codepoint >= 97 && codepoint <= 122 || codepoint >= 65 && codepoint <= 90;
}
function _isAlphaOrSlash(codepoint) {
  return _isAlpha(codepoint) || codepoint === 47;
}
function _isPotentialElementNameChar(c) {
  return c === 45 || c === 46 || c >= 48 && c <= 57 || c === 95 || c >= 97 && c <= 122 || c >= 65 && c <= 90 || c == 183 || c >= 192 && c <= 214 || c >= 216 && c <= 246 || c >= 248 && c <= 893 || c >= 895 && c <= 8191 || c >= 8204 && c <= 8205 || c >= 8255 && c <= 8256 || c >= 8304 && c <= 8591 || c >= 11264 && c <= 12271 || c >= 12289 && c <= 55295 || c >= 63744 && c <= 64975 || c >= 65008 && c <= 65533 || c >= 65536 && c <= 983039;
}
function _isWhiteSpace(c) {
  return c >= 9 && c <= 13 || c === 32 || c === 133 || c >= 8206 && c <= 8207 || c === 8232 || c === 8233;
}
function _isPatternSyntax(c) {
  return c >= 33 && c <= 35 || c === 36 || c >= 37 && c <= 39 || c === 40 || c === 41 || c === 42 || c === 43 || c === 44 || c === 45 || c >= 46 && c <= 47 || c >= 58 && c <= 59 || c >= 60 && c <= 62 || c >= 63 && c <= 64 || c === 91 || c === 92 || c === 93 || c === 94 || c === 96 || c === 123 || c === 124 || c === 125 || c === 126 || c === 161 || c >= 162 && c <= 165 || c === 166 || c === 167 || c === 169 || c === 171 || c === 172 || c === 174 || c === 176 || c === 177 || c === 182 || c === 187 || c === 191 || c === 215 || c === 247 || c >= 8208 && c <= 8213 || c >= 8214 && c <= 8215 || c === 8216 || c === 8217 || c === 8218 || c >= 8219 && c <= 8220 || c === 8221 || c === 8222 || c === 8223 || c >= 8224 && c <= 8231 || c >= 8240 && c <= 8248 || c === 8249 || c === 8250 || c >= 8251 && c <= 8254 || c >= 8257 && c <= 8259 || c === 8260 || c === 8261 || c === 8262 || c >= 8263 && c <= 8273 || c === 8274 || c === 8275 || c >= 8277 && c <= 8286 || c >= 8592 && c <= 8596 || c >= 8597 && c <= 8601 || c >= 8602 && c <= 8603 || c >= 8604 && c <= 8607 || c === 8608 || c >= 8609 && c <= 8610 || c === 8611 || c >= 8612 && c <= 8613 || c === 8614 || c >= 8615 && c <= 8621 || c === 8622 || c >= 8623 && c <= 8653 || c >= 8654 && c <= 8655 || c >= 8656 && c <= 8657 || c === 8658 || c === 8659 || c === 8660 || c >= 8661 && c <= 8691 || c >= 8692 && c <= 8959 || c >= 8960 && c <= 8967 || c === 8968 || c === 8969 || c === 8970 || c === 8971 || c >= 8972 && c <= 8991 || c >= 8992 && c <= 8993 || c >= 8994 && c <= 9e3 || c === 9001 || c === 9002 || c >= 9003 && c <= 9083 || c === 9084 || c >= 9085 && c <= 9114 || c >= 9115 && c <= 9139 || c >= 9140 && c <= 9179 || c >= 9180 && c <= 9185 || c >= 9186 && c <= 9254 || c >= 9255 && c <= 9279 || c >= 9280 && c <= 9290 || c >= 9291 && c <= 9311 || c >= 9472 && c <= 9654 || c === 9655 || c >= 9656 && c <= 9664 || c === 9665 || c >= 9666 && c <= 9719 || c >= 9720 && c <= 9727 || c >= 9728 && c <= 9838 || c === 9839 || c >= 9840 && c <= 10087 || c === 10088 || c === 10089 || c === 10090 || c === 10091 || c === 10092 || c === 10093 || c === 10094 || c === 10095 || c === 10096 || c === 10097 || c === 10098 || c === 10099 || c === 10100 || c === 10101 || c >= 10132 && c <= 10175 || c >= 10176 && c <= 10180 || c === 10181 || c === 10182 || c >= 10183 && c <= 10213 || c === 10214 || c === 10215 || c === 10216 || c === 10217 || c === 10218 || c === 10219 || c === 10220 || c === 10221 || c === 10222 || c === 10223 || c >= 10224 && c <= 10239 || c >= 10240 && c <= 10495 || c >= 10496 && c <= 10626 || c === 10627 || c === 10628 || c === 10629 || c === 10630 || c === 10631 || c === 10632 || c === 10633 || c === 10634 || c === 10635 || c === 10636 || c === 10637 || c === 10638 || c === 10639 || c === 10640 || c === 10641 || c === 10642 || c === 10643 || c === 10644 || c === 10645 || c === 10646 || c === 10647 || c === 10648 || c >= 10649 && c <= 10711 || c === 10712 || c === 10713 || c === 10714 || c === 10715 || c >= 10716 && c <= 10747 || c === 10748 || c === 10749 || c >= 10750 && c <= 11007 || c >= 11008 && c <= 11055 || c >= 11056 && c <= 11076 || c >= 11077 && c <= 11078 || c >= 11079 && c <= 11084 || c >= 11085 && c <= 11123 || c >= 11124 && c <= 11125 || c >= 11126 && c <= 11157 || c === 11158 || c >= 11159 && c <= 11263 || c >= 11776 && c <= 11777 || c === 11778 || c === 11779 || c === 11780 || c === 11781 || c >= 11782 && c <= 11784 || c === 11785 || c === 11786 || c === 11787 || c === 11788 || c === 11789 || c >= 11790 && c <= 11798 || c === 11799 || c >= 11800 && c <= 11801 || c === 11802 || c === 11803 || c === 11804 || c === 11805 || c >= 11806 && c <= 11807 || c === 11808 || c === 11809 || c === 11810 || c === 11811 || c === 11812 || c === 11813 || c === 11814 || c === 11815 || c === 11816 || c === 11817 || c >= 11818 && c <= 11822 || c === 11823 || c >= 11824 && c <= 11833 || c >= 11834 && c <= 11835 || c >= 11836 && c <= 11839 || c === 11840 || c === 11841 || c === 11842 || c >= 11843 && c <= 11855 || c >= 11856 && c <= 11857 || c === 11858 || c >= 11859 && c <= 11903 || c >= 12289 && c <= 12291 || c === 12296 || c === 12297 || c === 12298 || c === 12299 || c === 12300 || c === 12301 || c === 12302 || c === 12303 || c === 12304 || c === 12305 || c >= 12306 && c <= 12307 || c === 12308 || c === 12309 || c === 12310 || c === 12311 || c === 12312 || c === 12313 || c === 12314 || c === 12315 || c === 12316 || c === 12317 || c >= 12318 && c <= 12319 || c === 12320 || c === 12336 || c === 64830 || c === 64831 || c >= 65093 && c <= 65094;
}
var _a, SPACE_SEPARATOR_START_REGEX, SPACE_SEPARATOR_END_REGEX, hasNativeStartsWith, hasNativeFromCodePoint, hasNativeFromEntries, hasNativeCodePointAt, hasTrimStart, hasTrimEnd, hasNativeIsSafeInteger, isSafeInteger, REGEX_SUPPORTS_U_AND_Y, re, startsWith, fromCodePoint, fromEntries, codePointAt, trimStart, trimEnd, matchIdentifierAtIndex, IDENTIFIER_PREFIX_RE_1, Parser;
var init_parser = __esm({
  "../../node_modules/@formatjs/icu-messageformat-parser/lib/parser.js"() {
    "use strict";
    init_tslib_es6();
    init_error();
    init_types();
    init_regex_generated();
    init_lib2();
    init_date_time_pattern_generator();
    SPACE_SEPARATOR_START_REGEX = new RegExp("^".concat(SPACE_SEPARATOR_REGEX.source, "*"));
    SPACE_SEPARATOR_END_REGEX = new RegExp("".concat(SPACE_SEPARATOR_REGEX.source, "*$"));
    hasNativeStartsWith = !!String.prototype.startsWith && "_a".startsWith("a", 1);
    hasNativeFromCodePoint = !!String.fromCodePoint;
    hasNativeFromEntries = !!Object.fromEntries;
    hasNativeCodePointAt = !!String.prototype.codePointAt;
    hasTrimStart = !!String.prototype.trimStart;
    hasTrimEnd = !!String.prototype.trimEnd;
    hasNativeIsSafeInteger = !!Number.isSafeInteger;
    isSafeInteger = hasNativeIsSafeInteger ? Number.isSafeInteger : function(n) {
      return typeof n === "number" && isFinite(n) && Math.floor(n) === n && Math.abs(n) <= 9007199254740991;
    };
    REGEX_SUPPORTS_U_AND_Y = true;
    try {
      re = RE("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
      REGEX_SUPPORTS_U_AND_Y = ((_a = re.exec("a")) === null || _a === void 0 ? void 0 : _a[0]) === "a";
    } catch (_) {
      REGEX_SUPPORTS_U_AND_Y = false;
    }
    startsWith = hasNativeStartsWith ? (
      // Native
      function startsWith2(s, search, position) {
        return s.startsWith(search, position);
      }
    ) : (
      // For IE11
      function startsWith3(s, search, position) {
        return s.slice(position, position + search.length) === search;
      }
    );
    fromCodePoint = hasNativeFromCodePoint ? String.fromCodePoint : (
      // IE11
      function fromCodePoint2() {
        var codePoints = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          codePoints[_i] = arguments[_i];
        }
        var elements = "";
        var length = codePoints.length;
        var i = 0;
        var code;
        while (length > i) {
          code = codePoints[i++];
          if (code > 1114111)
            throw RangeError(code + " is not a valid code point");
          elements += code < 65536 ? String.fromCharCode(code) : String.fromCharCode(((code -= 65536) >> 10) + 55296, code % 1024 + 56320);
        }
        return elements;
      }
    );
    fromEntries = // native
    hasNativeFromEntries ? Object.fromEntries : (
      // Ponyfill
      function fromEntries2(entries) {
        var obj = {};
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
          var _a2 = entries_1[_i], k = _a2[0], v = _a2[1];
          obj[k] = v;
        }
        return obj;
      }
    );
    codePointAt = hasNativeCodePointAt ? (
      // Native
      function codePointAt2(s, index) {
        return s.codePointAt(index);
      }
    ) : (
      // IE 11
      function codePointAt3(s, index) {
        var size = s.length;
        if (index < 0 || index >= size) {
          return void 0;
        }
        var first = s.charCodeAt(index);
        var second;
        return first < 55296 || first > 56319 || index + 1 === size || (second = s.charCodeAt(index + 1)) < 56320 || second > 57343 ? first : (first - 55296 << 10) + (second - 56320) + 65536;
      }
    );
    trimStart = hasTrimStart ? (
      // Native
      function trimStart2(s) {
        return s.trimStart();
      }
    ) : (
      // Ponyfill
      function trimStart3(s) {
        return s.replace(SPACE_SEPARATOR_START_REGEX, "");
      }
    );
    trimEnd = hasTrimEnd ? (
      // Native
      function trimEnd2(s) {
        return s.trimEnd();
      }
    ) : (
      // Ponyfill
      function trimEnd3(s) {
        return s.replace(SPACE_SEPARATOR_END_REGEX, "");
      }
    );
    if (REGEX_SUPPORTS_U_AND_Y) {
      IDENTIFIER_PREFIX_RE_1 = RE("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
      matchIdentifierAtIndex = function matchIdentifierAtIndex2(s, index) {
        var _a2;
        IDENTIFIER_PREFIX_RE_1.lastIndex = index;
        var match = IDENTIFIER_PREFIX_RE_1.exec(s);
        return (_a2 = match[1]) !== null && _a2 !== void 0 ? _a2 : "";
      };
    } else {
      matchIdentifierAtIndex = function matchIdentifierAtIndex2(s, index) {
        var match = [];
        while (true) {
          var c = codePointAt(s, index);
          if (c === void 0 || _isWhiteSpace(c) || _isPatternSyntax(c)) {
            break;
          }
          match.push(c);
          index += c >= 65536 ? 2 : 1;
        }
        return fromCodePoint.apply(void 0, match);
      };
    }
    Parser = /** @class */
    function() {
      function Parser2(message, options) {
        if (options === void 0) {
          options = {};
        }
        this.message = message;
        this.position = { offset: 0, line: 1, column: 1 };
        this.ignoreTag = !!options.ignoreTag;
        this.locale = options.locale;
        this.requiresOtherClause = !!options.requiresOtherClause;
        this.shouldParseSkeletons = !!options.shouldParseSkeletons;
      }
      Parser2.prototype.parse = function() {
        if (this.offset() !== 0) {
          throw Error("parser can only be used once");
        }
        return this.parseMessage(0, "", false);
      };
      Parser2.prototype.parseMessage = function(nestingLevel, parentArgType, expectingCloseTag) {
        var elements = [];
        while (!this.isEOF()) {
          var char = this.char();
          if (char === 123) {
            var result = this.parseArgument(nestingLevel, expectingCloseTag);
            if (result.err) {
              return result;
            }
            elements.push(result.val);
          } else if (char === 125 && nestingLevel > 0) {
            break;
          } else if (char === 35 && (parentArgType === "plural" || parentArgType === "selectordinal")) {
            var position = this.clonePosition();
            this.bump();
            elements.push({
              type: TYPE.pound,
              location: createLocation(position, this.clonePosition())
            });
          } else if (char === 60 && !this.ignoreTag && this.peek() === 47) {
            if (expectingCloseTag) {
              break;
            } else {
              return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(this.clonePosition(), this.clonePosition()));
            }
          } else if (char === 60 && !this.ignoreTag && _isAlpha(this.peek() || 0)) {
            var result = this.parseTag(nestingLevel, parentArgType);
            if (result.err) {
              return result;
            }
            elements.push(result.val);
          } else {
            var result = this.parseLiteral(nestingLevel, parentArgType);
            if (result.err) {
              return result;
            }
            elements.push(result.val);
          }
        }
        return { val: elements, err: null };
      };
      Parser2.prototype.parseTag = function(nestingLevel, parentArgType) {
        var startPosition = this.clonePosition();
        this.bump();
        var tagName = this.parseTagName();
        this.bumpSpace();
        if (this.bumpIf("/>")) {
          return {
            val: {
              type: TYPE.literal,
              value: "<".concat(tagName, "/>"),
              location: createLocation(startPosition, this.clonePosition())
            },
            err: null
          };
        } else if (this.bumpIf(">")) {
          var childrenResult = this.parseMessage(nestingLevel + 1, parentArgType, true);
          if (childrenResult.err) {
            return childrenResult;
          }
          var children = childrenResult.val;
          var endTagStartPosition = this.clonePosition();
          if (this.bumpIf("</")) {
            if (this.isEOF() || !_isAlpha(this.char())) {
              return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
            }
            var closingTagNameStartPosition = this.clonePosition();
            var closingTagName = this.parseTagName();
            if (tagName !== closingTagName) {
              return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(closingTagNameStartPosition, this.clonePosition()));
            }
            this.bumpSpace();
            if (!this.bumpIf(">")) {
              return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
            }
            return {
              val: {
                type: TYPE.tag,
                value: tagName,
                children,
                location: createLocation(startPosition, this.clonePosition())
              },
              err: null
            };
          } else {
            return this.error(ErrorKind.UNCLOSED_TAG, createLocation(startPosition, this.clonePosition()));
          }
        } else {
          return this.error(ErrorKind.INVALID_TAG, createLocation(startPosition, this.clonePosition()));
        }
      };
      Parser2.prototype.parseTagName = function() {
        var startOffset = this.offset();
        this.bump();
        while (!this.isEOF() && _isPotentialElementNameChar(this.char())) {
          this.bump();
        }
        return this.message.slice(startOffset, this.offset());
      };
      Parser2.prototype.parseLiteral = function(nestingLevel, parentArgType) {
        var start = this.clonePosition();
        var value = "";
        while (true) {
          var parseQuoteResult = this.tryParseQuote(parentArgType);
          if (parseQuoteResult) {
            value += parseQuoteResult;
            continue;
          }
          var parseUnquotedResult = this.tryParseUnquoted(nestingLevel, parentArgType);
          if (parseUnquotedResult) {
            value += parseUnquotedResult;
            continue;
          }
          var parseLeftAngleResult = this.tryParseLeftAngleBracket();
          if (parseLeftAngleResult) {
            value += parseLeftAngleResult;
            continue;
          }
          break;
        }
        var location = createLocation(start, this.clonePosition());
        return {
          val: { type: TYPE.literal, value, location },
          err: null
        };
      };
      Parser2.prototype.tryParseLeftAngleBracket = function() {
        if (!this.isEOF() && this.char() === 60 && (this.ignoreTag || // If at the opening tag or closing tag position, bail.
        !_isAlphaOrSlash(this.peek() || 0))) {
          this.bump();
          return "<";
        }
        return null;
      };
      Parser2.prototype.tryParseQuote = function(parentArgType) {
        if (this.isEOF() || this.char() !== 39) {
          return null;
        }
        switch (this.peek()) {
          case 39:
            this.bump();
            this.bump();
            return "'";
          // '{', '<', '>', '}'
          case 123:
          case 60:
          case 62:
          case 125:
            break;
          case 35:
            if (parentArgType === "plural" || parentArgType === "selectordinal") {
              break;
            }
            return null;
          default:
            return null;
        }
        this.bump();
        var codePoints = [this.char()];
        this.bump();
        while (!this.isEOF()) {
          var ch = this.char();
          if (ch === 39) {
            if (this.peek() === 39) {
              codePoints.push(39);
              this.bump();
            } else {
              this.bump();
              break;
            }
          } else {
            codePoints.push(ch);
          }
          this.bump();
        }
        return fromCodePoint.apply(void 0, codePoints);
      };
      Parser2.prototype.tryParseUnquoted = function(nestingLevel, parentArgType) {
        if (this.isEOF()) {
          return null;
        }
        var ch = this.char();
        if (ch === 60 || ch === 123 || ch === 35 && (parentArgType === "plural" || parentArgType === "selectordinal") || ch === 125 && nestingLevel > 0) {
          return null;
        } else {
          this.bump();
          return fromCodePoint(ch);
        }
      };
      Parser2.prototype.parseArgument = function(nestingLevel, expectingCloseTag) {
        var openingBracePosition = this.clonePosition();
        this.bump();
        this.bumpSpace();
        if (this.isEOF()) {
          return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        if (this.char() === 125) {
          this.bump();
          return this.error(ErrorKind.EMPTY_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
        }
        var value = this.parseIdentifierIfPossible().value;
        if (!value) {
          return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
        }
        this.bumpSpace();
        if (this.isEOF()) {
          return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        switch (this.char()) {
          // Simple argument: `{name}`
          case 125: {
            this.bump();
            return {
              val: {
                type: TYPE.argument,
                // value does not include the opening and closing braces.
                value,
                location: createLocation(openingBracePosition, this.clonePosition())
              },
              err: null
            };
          }
          // Argument with options: `{name, format, ...}`
          case 44: {
            this.bump();
            this.bumpSpace();
            if (this.isEOF()) {
              return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
            }
            return this.parseArgumentOptions(nestingLevel, expectingCloseTag, value, openingBracePosition);
          }
          default:
            return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
        }
      };
      Parser2.prototype.parseIdentifierIfPossible = function() {
        var startingPosition = this.clonePosition();
        var startOffset = this.offset();
        var value = matchIdentifierAtIndex(this.message, startOffset);
        var endOffset = startOffset + value.length;
        this.bumpTo(endOffset);
        var endPosition = this.clonePosition();
        var location = createLocation(startingPosition, endPosition);
        return { value, location };
      };
      Parser2.prototype.parseArgumentOptions = function(nestingLevel, expectingCloseTag, value, openingBracePosition) {
        var _a2;
        var typeStartPosition = this.clonePosition();
        var argType = this.parseIdentifierIfPossible().value;
        var typeEndPosition = this.clonePosition();
        switch (argType) {
          case "":
            return this.error(ErrorKind.EXPECT_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
          case "number":
          case "date":
          case "time": {
            this.bumpSpace();
            var styleAndLocation = null;
            if (this.bumpIf(",")) {
              this.bumpSpace();
              var styleStartPosition = this.clonePosition();
              var result = this.parseSimpleArgStyleIfPossible();
              if (result.err) {
                return result;
              }
              var style = trimEnd(result.val);
              if (style.length === 0) {
                return this.error(ErrorKind.EXPECT_ARGUMENT_STYLE, createLocation(this.clonePosition(), this.clonePosition()));
              }
              var styleLocation = createLocation(styleStartPosition, this.clonePosition());
              styleAndLocation = { style, styleLocation };
            }
            var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
            if (argCloseResult.err) {
              return argCloseResult;
            }
            var location_1 = createLocation(openingBracePosition, this.clonePosition());
            if (styleAndLocation && startsWith(styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style, "::", 0)) {
              var skeleton = trimStart(styleAndLocation.style.slice(2));
              if (argType === "number") {
                var result = this.parseNumberSkeletonFromString(skeleton, styleAndLocation.styleLocation);
                if (result.err) {
                  return result;
                }
                return {
                  val: { type: TYPE.number, value, location: location_1, style: result.val },
                  err: null
                };
              } else {
                if (skeleton.length === 0) {
                  return this.error(ErrorKind.EXPECT_DATE_TIME_SKELETON, location_1);
                }
                var dateTimePattern = skeleton;
                if (this.locale) {
                  dateTimePattern = getBestPattern(skeleton, this.locale);
                }
                var style = {
                  type: SKELETON_TYPE.dateTime,
                  pattern: dateTimePattern,
                  location: styleAndLocation.styleLocation,
                  parsedOptions: this.shouldParseSkeletons ? parseDateTimeSkeleton(dateTimePattern) : {}
                };
                var type = argType === "date" ? TYPE.date : TYPE.time;
                return {
                  val: { type, value, location: location_1, style },
                  err: null
                };
              }
            }
            return {
              val: {
                type: argType === "number" ? TYPE.number : argType === "date" ? TYPE.date : TYPE.time,
                value,
                location: location_1,
                style: (_a2 = styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style) !== null && _a2 !== void 0 ? _a2 : null
              },
              err: null
            };
          }
          case "plural":
          case "selectordinal":
          case "select": {
            var typeEndPosition_1 = this.clonePosition();
            this.bumpSpace();
            if (!this.bumpIf(",")) {
              return this.error(ErrorKind.EXPECT_SELECT_ARGUMENT_OPTIONS, createLocation(typeEndPosition_1, __assign({}, typeEndPosition_1)));
            }
            this.bumpSpace();
            var identifierAndLocation = this.parseIdentifierIfPossible();
            var pluralOffset = 0;
            if (argType !== "select" && identifierAndLocation.value === "offset") {
              if (!this.bumpIf(":")) {
                return this.error(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, createLocation(this.clonePosition(), this.clonePosition()));
              }
              this.bumpSpace();
              var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, ErrorKind.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);
              if (result.err) {
                return result;
              }
              this.bumpSpace();
              identifierAndLocation = this.parseIdentifierIfPossible();
              pluralOffset = result.val;
            }
            var optionsResult = this.tryParsePluralOrSelectOptions(nestingLevel, argType, expectingCloseTag, identifierAndLocation);
            if (optionsResult.err) {
              return optionsResult;
            }
            var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
            if (argCloseResult.err) {
              return argCloseResult;
            }
            var location_2 = createLocation(openingBracePosition, this.clonePosition());
            if (argType === "select") {
              return {
                val: {
                  type: TYPE.select,
                  value,
                  options: fromEntries(optionsResult.val),
                  location: location_2
                },
                err: null
              };
            } else {
              return {
                val: {
                  type: TYPE.plural,
                  value,
                  options: fromEntries(optionsResult.val),
                  offset: pluralOffset,
                  pluralType: argType === "plural" ? "cardinal" : "ordinal",
                  location: location_2
                },
                err: null
              };
            }
          }
          default:
            return this.error(ErrorKind.INVALID_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
        }
      };
      Parser2.prototype.tryParseArgumentClose = function(openingBracePosition) {
        if (this.isEOF() || this.char() !== 125) {
          return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        this.bump();
        return { val: true, err: null };
      };
      Parser2.prototype.parseSimpleArgStyleIfPossible = function() {
        var nestedBraces = 0;
        var startPosition = this.clonePosition();
        while (!this.isEOF()) {
          var ch = this.char();
          switch (ch) {
            case 39: {
              this.bump();
              var apostrophePosition = this.clonePosition();
              if (!this.bumpUntil("'")) {
                return this.error(ErrorKind.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, createLocation(apostrophePosition, this.clonePosition()));
              }
              this.bump();
              break;
            }
            case 123: {
              nestedBraces += 1;
              this.bump();
              break;
            }
            case 125: {
              if (nestedBraces > 0) {
                nestedBraces -= 1;
              } else {
                return {
                  val: this.message.slice(startPosition.offset, this.offset()),
                  err: null
                };
              }
              break;
            }
            default:
              this.bump();
              break;
          }
        }
        return {
          val: this.message.slice(startPosition.offset, this.offset()),
          err: null
        };
      };
      Parser2.prototype.parseNumberSkeletonFromString = function(skeleton, location) {
        var tokens = [];
        try {
          tokens = parseNumberSkeletonFromString(skeleton);
        } catch (e) {
          return this.error(ErrorKind.INVALID_NUMBER_SKELETON, location);
        }
        return {
          val: {
            type: SKELETON_TYPE.number,
            tokens,
            location,
            parsedOptions: this.shouldParseSkeletons ? parseNumberSkeleton(tokens) : {}
          },
          err: null
        };
      };
      Parser2.prototype.tryParsePluralOrSelectOptions = function(nestingLevel, parentArgType, expectCloseTag, parsedFirstIdentifier) {
        var _a2;
        var hasOtherClause = false;
        var options = [];
        var parsedSelectors = /* @__PURE__ */ new Set();
        var selector = parsedFirstIdentifier.value, selectorLocation = parsedFirstIdentifier.location;
        while (true) {
          if (selector.length === 0) {
            var startPosition = this.clonePosition();
            if (parentArgType !== "select" && this.bumpIf("=")) {
              var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, ErrorKind.INVALID_PLURAL_ARGUMENT_SELECTOR);
              if (result.err) {
                return result;
              }
              selectorLocation = createLocation(startPosition, this.clonePosition());
              selector = this.message.slice(startPosition.offset, this.offset());
            } else {
              break;
            }
          }
          if (parsedSelectors.has(selector)) {
            return this.error(parentArgType === "select" ? ErrorKind.DUPLICATE_SELECT_ARGUMENT_SELECTOR : ErrorKind.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, selectorLocation);
          }
          if (selector === "other") {
            hasOtherClause = true;
          }
          this.bumpSpace();
          var openingBracePosition = this.clonePosition();
          if (!this.bumpIf("{")) {
            return this.error(parentArgType === "select" ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, createLocation(this.clonePosition(), this.clonePosition()));
          }
          var fragmentResult = this.parseMessage(nestingLevel + 1, parentArgType, expectCloseTag);
          if (fragmentResult.err) {
            return fragmentResult;
          }
          var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
          if (argCloseResult.err) {
            return argCloseResult;
          }
          options.push([
            selector,
            {
              value: fragmentResult.val,
              location: createLocation(openingBracePosition, this.clonePosition())
            }
          ]);
          parsedSelectors.add(selector);
          this.bumpSpace();
          _a2 = this.parseIdentifierIfPossible(), selector = _a2.value, selectorLocation = _a2.location;
        }
        if (options.length === 0) {
          return this.error(parentArgType === "select" ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, createLocation(this.clonePosition(), this.clonePosition()));
        }
        if (this.requiresOtherClause && !hasOtherClause) {
          return this.error(ErrorKind.MISSING_OTHER_CLAUSE, createLocation(this.clonePosition(), this.clonePosition()));
        }
        return { val: options, err: null };
      };
      Parser2.prototype.tryParseDecimalInteger = function(expectNumberError, invalidNumberError) {
        var sign = 1;
        var startingPosition = this.clonePosition();
        if (this.bumpIf("+")) {
        } else if (this.bumpIf("-")) {
          sign = -1;
        }
        var hasDigits = false;
        var decimal = 0;
        while (!this.isEOF()) {
          var ch = this.char();
          if (ch >= 48 && ch <= 57) {
            hasDigits = true;
            decimal = decimal * 10 + (ch - 48);
            this.bump();
          } else {
            break;
          }
        }
        var location = createLocation(startingPosition, this.clonePosition());
        if (!hasDigits) {
          return this.error(expectNumberError, location);
        }
        decimal *= sign;
        if (!isSafeInteger(decimal)) {
          return this.error(invalidNumberError, location);
        }
        return { val: decimal, err: null };
      };
      Parser2.prototype.offset = function() {
        return this.position.offset;
      };
      Parser2.prototype.isEOF = function() {
        return this.offset() === this.message.length;
      };
      Parser2.prototype.clonePosition = function() {
        return {
          offset: this.position.offset,
          line: this.position.line,
          column: this.position.column
        };
      };
      Parser2.prototype.char = function() {
        var offset = this.position.offset;
        if (offset >= this.message.length) {
          throw Error("out of bound");
        }
        var code = codePointAt(this.message, offset);
        if (code === void 0) {
          throw Error("Offset ".concat(offset, " is at invalid UTF-16 code unit boundary"));
        }
        return code;
      };
      Parser2.prototype.error = function(kind, location) {
        return {
          val: null,
          err: {
            kind,
            message: this.message,
            location
          }
        };
      };
      Parser2.prototype.bump = function() {
        if (this.isEOF()) {
          return;
        }
        var code = this.char();
        if (code === 10) {
          this.position.line += 1;
          this.position.column = 1;
          this.position.offset += 1;
        } else {
          this.position.column += 1;
          this.position.offset += code < 65536 ? 1 : 2;
        }
      };
      Parser2.prototype.bumpIf = function(prefix) {
        if (startsWith(this.message, prefix, this.offset())) {
          for (var i = 0; i < prefix.length; i++) {
            this.bump();
          }
          return true;
        }
        return false;
      };
      Parser2.prototype.bumpUntil = function(pattern) {
        var currentOffset = this.offset();
        var index = this.message.indexOf(pattern, currentOffset);
        if (index >= 0) {
          this.bumpTo(index);
          return true;
        } else {
          this.bumpTo(this.message.length);
          return false;
        }
      };
      Parser2.prototype.bumpTo = function(targetOffset) {
        if (this.offset() > targetOffset) {
          throw Error("targetOffset ".concat(targetOffset, " must be greater than or equal to the current offset ").concat(this.offset()));
        }
        targetOffset = Math.min(targetOffset, this.message.length);
        while (true) {
          var offset = this.offset();
          if (offset === targetOffset) {
            break;
          }
          if (offset > targetOffset) {
            throw Error("targetOffset ".concat(targetOffset, " is at invalid UTF-16 code unit boundary"));
          }
          this.bump();
          if (this.isEOF()) {
            break;
          }
        }
      };
      Parser2.prototype.bumpSpace = function() {
        while (!this.isEOF() && _isWhiteSpace(this.char())) {
          this.bump();
        }
      };
      Parser2.prototype.peek = function() {
        if (this.isEOF()) {
          return null;
        }
        var code = this.char();
        var offset = this.offset();
        var nextCode = this.message.charCodeAt(offset + (code >= 65536 ? 2 : 1));
        return nextCode !== null && nextCode !== void 0 ? nextCode : null;
      };
      return Parser2;
    }();
  }
});

// ../../node_modules/@formatjs/icu-messageformat-parser/lib/manipulator.js
var init_manipulator = __esm({
  "../../node_modules/@formatjs/icu-messageformat-parser/lib/manipulator.js"() {
    "use strict";
    init_types();
  }
});

// ../../node_modules/@formatjs/icu-messageformat-parser/lib/index.js
function pruneLocation(els) {
  els.forEach(function(el) {
    delete el.location;
    if (isSelectElement(el) || isPluralElement(el)) {
      for (var k in el.options) {
        delete el.options[k].location;
        pruneLocation(el.options[k].value);
      }
    } else if (isNumberElement(el) && isNumberSkeleton(el.style)) {
      delete el.style.location;
    } else if ((isDateElement(el) || isTimeElement(el)) && isDateTimeSkeleton(el.style)) {
      delete el.style.location;
    } else if (isTagElement(el)) {
      pruneLocation(el.children);
    }
  });
}
function parse(message, opts) {
  if (opts === void 0) {
    opts = {};
  }
  opts = __assign({ shouldParseSkeletons: true, requiresOtherClause: true }, opts);
  var result = new Parser(message, opts).parse();
  if (result.err) {
    var error = SyntaxError(ErrorKind[result.err.kind]);
    error.location = result.err.location;
    error.originalMessage = result.err.message;
    throw error;
  }
  if (!(opts === null || opts === void 0 ? void 0 : opts.captureLocation)) {
    pruneLocation(result.val);
  }
  return result.val;
}
var init_lib3 = __esm({
  "../../node_modules/@formatjs/icu-messageformat-parser/lib/index.js"() {
    "use strict";
    init_tslib_es6();
    init_error();
    init_parser();
    init_types();
    init_types();
    init_manipulator();
  }
});

// ../../node_modules/intl-messageformat/lib/src/error.js
var ErrorCode, FormatError, InvalidValueError, InvalidValueTypeError, MissingValueError;
var init_error2 = __esm({
  "../../node_modules/intl-messageformat/lib/src/error.js"() {
    "use strict";
    init_tslib_es6();
    (function(ErrorCode2) {
      ErrorCode2["MISSING_VALUE"] = "MISSING_VALUE";
      ErrorCode2["INVALID_VALUE"] = "INVALID_VALUE";
      ErrorCode2["MISSING_INTL_API"] = "MISSING_INTL_API";
    })(ErrorCode || (ErrorCode = {}));
    FormatError = /** @class */
    function(_super) {
      __extends(FormatError2, _super);
      function FormatError2(msg, code, originalMessage) {
        var _this = _super.call(this, msg) || this;
        _this.code = code;
        _this.originalMessage = originalMessage;
        return _this;
      }
      FormatError2.prototype.toString = function() {
        return "[formatjs Error: ".concat(this.code, "] ").concat(this.message);
      };
      return FormatError2;
    }(Error);
    InvalidValueError = /** @class */
    function(_super) {
      __extends(InvalidValueError2, _super);
      function InvalidValueError2(variableId, value, options, originalMessage) {
        return _super.call(this, 'Invalid values for "'.concat(variableId, '": "').concat(value, '". Options are "').concat(Object.keys(options).join('", "'), '"'), ErrorCode.INVALID_VALUE, originalMessage) || this;
      }
      return InvalidValueError2;
    }(FormatError);
    InvalidValueTypeError = /** @class */
    function(_super) {
      __extends(InvalidValueTypeError2, _super);
      function InvalidValueTypeError2(value, type, originalMessage) {
        return _super.call(this, 'Value for "'.concat(value, '" must be of type ').concat(type), ErrorCode.INVALID_VALUE, originalMessage) || this;
      }
      return InvalidValueTypeError2;
    }(FormatError);
    MissingValueError = /** @class */
    function(_super) {
      __extends(MissingValueError2, _super);
      function MissingValueError2(variableId, originalMessage) {
        return _super.call(this, 'The intl string context variable "'.concat(variableId, '" was not provided to the string "').concat(originalMessage, '"'), ErrorCode.MISSING_VALUE, originalMessage) || this;
      }
      return MissingValueError2;
    }(FormatError);
  }
});

// ../../node_modules/intl-messageformat/lib/src/formatters.js
function mergeLiteral(parts) {
  if (parts.length < 2) {
    return parts;
  }
  return parts.reduce(function(all, part) {
    var lastPart = all[all.length - 1];
    if (!lastPart || lastPart.type !== PART_TYPE.literal || part.type !== PART_TYPE.literal) {
      all.push(part);
    } else {
      lastPart.value += part.value;
    }
    return all;
  }, []);
}
function isFormatXMLElementFn(el) {
  return typeof el === "function";
}
function formatToParts(els, locales, formatters, formats, values, currentPluralValue, originalMessage) {
  if (els.length === 1 && isLiteralElement(els[0])) {
    return [
      {
        type: PART_TYPE.literal,
        value: els[0].value
      }
    ];
  }
  var result = [];
  for (var _i = 0, els_1 = els; _i < els_1.length; _i++) {
    var el = els_1[_i];
    if (isLiteralElement(el)) {
      result.push({
        type: PART_TYPE.literal,
        value: el.value
      });
      continue;
    }
    if (isPoundElement(el)) {
      if (typeof currentPluralValue === "number") {
        result.push({
          type: PART_TYPE.literal,
          value: formatters.getNumberFormat(locales).format(currentPluralValue)
        });
      }
      continue;
    }
    var varName = el.value;
    if (!(values && varName in values)) {
      throw new MissingValueError(varName, originalMessage);
    }
    var value = values[varName];
    if (isArgumentElement(el)) {
      if (!value || typeof value === "string" || typeof value === "number") {
        value = typeof value === "string" || typeof value === "number" ? String(value) : "";
      }
      result.push({
        type: typeof value === "string" ? PART_TYPE.literal : PART_TYPE.object,
        value
      });
      continue;
    }
    if (isDateElement(el)) {
      var style = typeof el.style === "string" ? formats.date[el.style] : isDateTimeSkeleton(el.style) ? el.style.parsedOptions : void 0;
      result.push({
        type: PART_TYPE.literal,
        value: formatters.getDateTimeFormat(locales, style).format(value)
      });
      continue;
    }
    if (isTimeElement(el)) {
      var style = typeof el.style === "string" ? formats.time[el.style] : isDateTimeSkeleton(el.style) ? el.style.parsedOptions : formats.time.medium;
      result.push({
        type: PART_TYPE.literal,
        value: formatters.getDateTimeFormat(locales, style).format(value)
      });
      continue;
    }
    if (isNumberElement(el)) {
      var style = typeof el.style === "string" ? formats.number[el.style] : isNumberSkeleton(el.style) ? el.style.parsedOptions : void 0;
      if (style && style.scale) {
        value = value * (style.scale || 1);
      }
      result.push({
        type: PART_TYPE.literal,
        value: formatters.getNumberFormat(locales, style).format(value)
      });
      continue;
    }
    if (isTagElement(el)) {
      var children = el.children, value_1 = el.value;
      var formatFn = values[value_1];
      if (!isFormatXMLElementFn(formatFn)) {
        throw new InvalidValueTypeError(value_1, "function", originalMessage);
      }
      var parts = formatToParts(children, locales, formatters, formats, values, currentPluralValue);
      var chunks = formatFn(parts.map(function(p) {
        return p.value;
      }));
      if (!Array.isArray(chunks)) {
        chunks = [chunks];
      }
      result.push.apply(result, chunks.map(function(c) {
        return {
          type: typeof c === "string" ? PART_TYPE.literal : PART_TYPE.object,
          value: c
        };
      }));
    }
    if (isSelectElement(el)) {
      var opt = el.options[value] || el.options.other;
      if (!opt) {
        throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
      }
      result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values));
      continue;
    }
    if (isPluralElement(el)) {
      var opt = el.options["=".concat(value)];
      if (!opt) {
        if (!Intl.PluralRules) {
          throw new FormatError('Intl.PluralRules is not available in this environment.\nTry polyfilling it using "@formatjs/intl-pluralrules"\n', ErrorCode.MISSING_INTL_API, originalMessage);
        }
        var rule = formatters.getPluralRules(locales, { type: el.pluralType }).select(value - (el.offset || 0));
        opt = el.options[rule] || el.options.other;
      }
      if (!opt) {
        throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
      }
      result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values, value - (el.offset || 0)));
      continue;
    }
  }
  return mergeLiteral(result);
}
var PART_TYPE;
var init_formatters = __esm({
  "../../node_modules/intl-messageformat/lib/src/formatters.js"() {
    "use strict";
    init_lib3();
    init_error2();
    (function(PART_TYPE2) {
      PART_TYPE2[PART_TYPE2["literal"] = 0] = "literal";
      PART_TYPE2[PART_TYPE2["object"] = 1] = "object";
    })(PART_TYPE || (PART_TYPE = {}));
  }
});

// ../../node_modules/intl-messageformat/lib/src/core.js
function mergeConfig(c1, c2) {
  if (!c2) {
    return c1;
  }
  return __assign(__assign(__assign({}, c1 || {}), c2 || {}), Object.keys(c1).reduce(function(all, k) {
    all[k] = __assign(__assign({}, c1[k]), c2[k] || {});
    return all;
  }, {}));
}
function mergeConfigs(defaultConfig, configs) {
  if (!configs) {
    return defaultConfig;
  }
  return Object.keys(defaultConfig).reduce(function(all, k) {
    all[k] = mergeConfig(defaultConfig[k], configs[k]);
    return all;
  }, __assign({}, defaultConfig));
}
function createFastMemoizeCache(store) {
  return {
    create: function() {
      return {
        get: function(key) {
          return store[key];
        },
        set: function(key, value) {
          store[key] = value;
        }
      };
    }
  };
}
function createDefaultFormatters(cache) {
  if (cache === void 0) {
    cache = {
      number: {},
      dateTime: {},
      pluralRules: {}
    };
  }
  return {
    getNumberFormat: memoize(function() {
      var _a2;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return new ((_a2 = Intl.NumberFormat).bind.apply(_a2, __spreadArray([void 0], args, false)))();
    }, {
      cache: createFastMemoizeCache(cache.number),
      strategy: strategies.variadic
    }),
    getDateTimeFormat: memoize(function() {
      var _a2;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return new ((_a2 = Intl.DateTimeFormat).bind.apply(_a2, __spreadArray([void 0], args, false)))();
    }, {
      cache: createFastMemoizeCache(cache.dateTime),
      strategy: strategies.variadic
    }),
    getPluralRules: memoize(function() {
      var _a2;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return new ((_a2 = Intl.PluralRules).bind.apply(_a2, __spreadArray([void 0], args, false)))();
    }, {
      cache: createFastMemoizeCache(cache.pluralRules),
      strategy: strategies.variadic
    })
  };
}
var IntlMessageFormat;
var init_core = __esm({
  "../../node_modules/intl-messageformat/lib/src/core.js"() {
    "use strict";
    init_tslib_es6();
    init_lib();
    init_lib3();
    init_formatters();
    IntlMessageFormat = /** @class */
    function() {
      function IntlMessageFormat2(message, locales, overrideFormats, opts) {
        if (locales === void 0) {
          locales = IntlMessageFormat2.defaultLocale;
        }
        var _this = this;
        this.formatterCache = {
          number: {},
          dateTime: {},
          pluralRules: {}
        };
        this.format = function(values) {
          var parts = _this.formatToParts(values);
          if (parts.length === 1) {
            return parts[0].value;
          }
          var result = parts.reduce(function(all, part) {
            if (!all.length || part.type !== PART_TYPE.literal || typeof all[all.length - 1] !== "string") {
              all.push(part.value);
            } else {
              all[all.length - 1] += part.value;
            }
            return all;
          }, []);
          if (result.length <= 1) {
            return result[0] || "";
          }
          return result;
        };
        this.formatToParts = function(values) {
          return formatToParts(_this.ast, _this.locales, _this.formatters, _this.formats, values, void 0, _this.message);
        };
        this.resolvedOptions = function() {
          var _a3;
          return {
            locale: ((_a3 = _this.resolvedLocale) === null || _a3 === void 0 ? void 0 : _a3.toString()) || Intl.NumberFormat.supportedLocalesOf(_this.locales)[0]
          };
        };
        this.getAst = function() {
          return _this.ast;
        };
        this.locales = locales;
        this.resolvedLocale = IntlMessageFormat2.resolveLocale(locales);
        if (typeof message === "string") {
          this.message = message;
          if (!IntlMessageFormat2.__parse) {
            throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");
          }
          var _a2 = opts || {}, formatters = _a2.formatters, parseOpts = __rest(_a2, ["formatters"]);
          this.ast = IntlMessageFormat2.__parse(message, __assign(__assign({}, parseOpts), { locale: this.resolvedLocale }));
        } else {
          this.ast = message;
        }
        if (!Array.isArray(this.ast)) {
          throw new TypeError("A message must be provided as a String or AST.");
        }
        this.formats = mergeConfigs(IntlMessageFormat2.formats, overrideFormats);
        this.formatters = opts && opts.formatters || createDefaultFormatters(this.formatterCache);
      }
      Object.defineProperty(IntlMessageFormat2, "defaultLocale", {
        get: function() {
          if (!IntlMessageFormat2.memoizedDefaultLocale) {
            IntlMessageFormat2.memoizedDefaultLocale = new Intl.NumberFormat().resolvedOptions().locale;
          }
          return IntlMessageFormat2.memoizedDefaultLocale;
        },
        enumerable: false,
        configurable: true
      });
      IntlMessageFormat2.memoizedDefaultLocale = null;
      IntlMessageFormat2.resolveLocale = function(locales) {
        if (typeof Intl.Locale === "undefined") {
          return;
        }
        var supportedLocales = Intl.NumberFormat.supportedLocalesOf(locales);
        if (supportedLocales.length > 0) {
          return new Intl.Locale(supportedLocales[0]);
        }
        return new Intl.Locale(typeof locales === "string" ? locales : locales[0]);
      };
      IntlMessageFormat2.__parse = parse;
      IntlMessageFormat2.formats = {
        number: {
          integer: {
            maximumFractionDigits: 0
          },
          currency: {
            style: "currency"
          },
          percent: {
            style: "percent"
          }
        },
        date: {
          short: {
            month: "numeric",
            day: "numeric",
            year: "2-digit"
          },
          medium: {
            month: "short",
            day: "numeric",
            year: "numeric"
          },
          long: {
            month: "long",
            day: "numeric",
            year: "numeric"
          },
          full: {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
          }
        },
        time: {
          short: {
            hour: "numeric",
            minute: "numeric"
          },
          medium: {
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
          },
          long: {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZoneName: "short"
          },
          full: {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZoneName: "short"
          }
        }
      };
      return IntlMessageFormat2;
    }();
  }
});

// ../../node_modules/intl-messageformat/lib/index.js
var lib_exports2 = {};
__export(lib_exports2, {
  ErrorCode: () => ErrorCode,
  FormatError: () => FormatError,
  IntlMessageFormat: () => IntlMessageFormat,
  InvalidValueError: () => InvalidValueError,
  InvalidValueTypeError: () => InvalidValueTypeError,
  MissingValueError: () => MissingValueError,
  PART_TYPE: () => PART_TYPE,
  default: () => lib_default,
  formatToParts: () => formatToParts,
  isFormatXMLElementFn: () => isFormatXMLElementFn
});
var lib_default;
var init_lib4 = __esm({
  "../../node_modules/intl-messageformat/lib/index.js"() {
    "use strict";
    init_core();
    init_core();
    init_error2();
    init_formatters();
    lib_default = IntlMessageFormat;
  }
});

// ../../node_modules/use-intl/dist/production/initializeConfig-AbYTngyP.js
var require_initializeConfig_AbYTngyP = __commonJS({
  "../../node_modules/use-intl/dist/production/initializeConfig-AbYTngyP.js"(exports) {
    "use strict";
    var e = (init_lib(), __toCommonJS(lib_exports));
    function t() {
      for (var e2 = arguments.length, t2 = new Array(e2), r2 = 0; r2 < e2; r2++) t2[r2] = arguments[r2];
      return t2.filter(Boolean).join(".");
    }
    function r(e2) {
      return t(e2.namespace, e2.key);
    }
    function a(e2) {
      console.error(e2);
    }
    function n(t2, r2) {
      return e.memoize(t2, { cache: (a2 = r2, { create: () => ({ get: (e2) => a2[e2], set(e2, t3) {
        a2[e2] = t3;
      } }) }), strategy: e.strategies.variadic });
      var a2;
    }
    function s(e2, t2) {
      return n(function() {
        for (var t3 = arguments.length, r2 = new Array(t3), a2 = 0; a2 < t3; a2++) r2[a2] = arguments[a2];
        return new e2(...r2);
      }, t2);
    }
    exports.createCache = function() {
      return { dateTime: {}, number: {}, message: {}, relativeTime: {}, pluralRules: {}, list: {}, displayNames: {} };
    }, exports.createIntlFormatters = function(e2) {
      return { getDateTimeFormat: s(Intl.DateTimeFormat, e2.dateTime), getNumberFormat: s(Intl.NumberFormat, e2.number), getPluralRules: s(Intl.PluralRules, e2.pluralRules), getRelativeTimeFormat: s(Intl.RelativeTimeFormat, e2.relativeTime), getListFormat: s(Intl.ListFormat, e2.list), getDisplayNames: s(Intl.DisplayNames, e2.displayNames) };
    }, exports.defaultGetMessageFallback = r, exports.defaultOnError = a, exports.initializeConfig = function(e2) {
      let _a2 = e2, { getMessageFallback: t2, messages: n2, onError: s2 } = _a2, i = __objRest(_a2, ["getMessageFallback", "messages", "onError"]);
      return __spreadProps(__spreadValues({}, i), { messages: n2, onError: s2 || a, getMessageFallback: t2 || r });
    }, exports.joinPath = t, exports.memoFn = n;
  }
});

// ../../node_modules/use-intl/dist/production/createFormatter-CZeYe_QF.js
var require_createFormatter_CZeYe_QF = __commonJS({
  "../../node_modules/use-intl/dist/production/createFormatter-CZeYe_QF.js"(exports) {
    "use strict";
    var e = (init_lib4(), __toCommonJS(lib_exports2));
    var t = __require("react");
    var r = require_initializeConfig_AbYTngyP();
    function n(e2) {
      return e2 && e2.__esModule ? e2 : { default: e2 };
    }
    var o = n(e);
    function a(e2, t2, r2) {
      return (t2 = function(e3) {
        var t3 = function(e4, t4) {
          if ("object" != typeof e4 || !e4) return e4;
          var r3 = e4[Symbol.toPrimitive];
          if (void 0 !== r3) {
            var n2 = r3.call(e4, t4 || "default");
            if ("object" != typeof n2) return n2;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return ("string" === t4 ? String : Number)(e4);
        }(e3, "string");
        return "symbol" == typeof t3 ? t3 : t3 + "";
      }(t2)) in e2 ? Object.defineProperty(e2, t2, { value: r2, enumerable: true, configurable: true, writable: true }) : e2[t2] = r2, e2;
    }
    var i = function(e2) {
      return e2.MISSING_MESSAGE = "MISSING_MESSAGE", e2.MISSING_FORMAT = "MISSING_FORMAT", e2.ENVIRONMENT_FALLBACK = "ENVIRONMENT_FALLBACK", e2.INSUFFICIENT_PATH = "INSUFFICIENT_PATH", e2.INVALID_MESSAGE = "INVALID_MESSAGE", e2.INVALID_KEY = "INVALID_KEY", e2.FORMATTING_ERROR = "FORMATTING_ERROR", e2;
    }({});
    var s = class extends Error {
      constructor(e2, t2) {
        let r2 = e2;
        t2 && (r2 += ": " + t2), super(r2), a(this, "code", void 0), a(this, "originalMessage", void 0), this.code = e2, t2 && (this.originalMessage = t2);
      }
    };
    function u(e2, t2) {
      return e2 ? Object.keys(e2).reduce((r2, n2) => (r2[n2] = __spreadValues({ timeZone: t2 }, e2[n2]), r2), {}) : e2;
    }
    function c(e2, t2, n2, o2) {
      const a2 = r.joinPath(o2, n2);
      if (!t2) throw new Error(a2);
      let i2 = t2;
      return n2.split(".").forEach((t3) => {
        const r2 = i2[t3];
        if (null == t3 || null == r2) throw new Error(a2 + " (".concat(e2, ")"));
        i2 = r2;
      }), i2;
    }
    var l = 60;
    var m = 60 * l;
    var f = 24 * m;
    var g = 7 * f;
    var E = f * (365 / 12);
    var d = 3 * E;
    var I = 365 * f;
    var S = { second: 1, seconds: 1, minute: l, minutes: l, hour: m, hours: m, day: f, days: f, week: g, weeks: g, month: E, months: E, quarter: d, quarters: d, year: I, years: I };
    exports.IntlError = s, exports.IntlErrorCode = i, exports.createBaseTranslator = function(e2) {
      const n2 = function(e3, t2, n3) {
        let o2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : r.defaultOnError;
        try {
          if (!t2) throw new Error(void 0);
          const r2 = n3 ? c(e3, t2, n3) : t2;
          if (!r2) throw new Error(n3);
          return r2;
        } catch (e4) {
          const t3 = new s(i.MISSING_MESSAGE, e4.message);
          return o2(t3), t3;
        }
      }(e2.locale, e2.messages, e2.namespace, e2.onError);
      return function(e3) {
        let { cache: n3, defaultTranslationValues: a2, formats: l2, formatters: m2, getMessageFallback: f2 = r.defaultGetMessageFallback, locale: g2, messagesOrError: E2, namespace: d2, onError: I2, timeZone: S2 } = e3;
        const y = E2 instanceof s;
        function T(e4, t2, r2) {
          const n4 = new s(t2, r2);
          return I2(n4), f2({ error: n4, key: e4, namespace: d2 });
        }
        function h(e4, s2, I3) {
          if (y) return f2({ error: E2, key: e4, namespace: d2 });
          const h2 = E2;
          let M2, N;
          try {
            M2 = c(g2, h2, e4, d2);
          } catch (t2) {
            return T(e4, i.MISSING_MESSAGE, t2.message);
          }
          if ("object" == typeof M2) {
            let t2, r2;
            return t2 = Array.isArray(M2) ? i.INVALID_MESSAGE : i.INSUFFICIENT_PATH, T(e4, t2, r2);
          }
          const A = function(e5, t2) {
            if (t2) return;
            const r2 = e5.replace(/'([{}])/gi, "$1");
            return /<|{/.test(r2) ? void 0 : r2;
          }(M2, s2);
          if (A) return A;
          m2.getMessageFormat || (m2.getMessageFormat = function(e5, t2) {
            const n4 = r.memoFn(function() {
              return new o.default(arguments.length <= 0 ? void 0 : arguments[0], arguments.length <= 1 ? void 0 : arguments[1], arguments.length <= 2 ? void 0 : arguments[2], __spreadValues({ formatters: t2 }, arguments.length <= 3 ? void 0 : arguments[3]));
            }, e5.message);
            return n4;
          }(n3, m2));
          try {
            N = m2.getMessageFormat(M2, g2, function(e5, t2) {
              const r2 = t2 ? __spreadProps(__spreadValues({}, e5), { dateTime: u(e5.dateTime, t2) }) : e5, n4 = o.default.formats.date, a3 = t2 ? u(n4, t2) : n4, i2 = o.default.formats.time, s3 = t2 ? u(i2, t2) : i2;
              return __spreadProps(__spreadValues({}, r2), { date: __spreadValues(__spreadValues({}, a3), r2.dateTime), time: __spreadValues(__spreadValues({}, s3), r2.dateTime) });
            }(__spreadValues(__spreadValues({}, l2), I3), S2), { formatters: __spreadProps(__spreadValues({}, m2), { getDateTimeFormat: (e5, t2) => m2.getDateTimeFormat(e5, __spreadValues({ timeZone: S2 }, t2)) }) });
          } catch (t2) {
            const r2 = t2;
            return T(e4, i.INVALID_MESSAGE, r2.message);
          }
          try {
            const e5 = N.format(function(e6) {
              if (0 === Object.keys(e6).length) return;
              const r2 = {};
              return Object.keys(e6).forEach((n4) => {
                let o2 = 0;
                const a3 = e6[n4];
                let i2;
                i2 = "function" == typeof a3 ? (e7) => {
                  const r3 = a3(e7);
                  return t.isValidElement(r3) ? t.cloneElement(r3, { key: n4 + o2++ }) : r3;
                } : a3, r2[n4] = i2;
              }), r2;
            }(__spreadValues(__spreadValues({}, a2), s2)));
            if (null == e5) throw new Error(void 0);
            return t.isValidElement(e5) || Array.isArray(e5) || "string" == typeof e5 ? e5 : String(e5);
          } catch (t2) {
            return T(e4, i.FORMATTING_ERROR, t2.message);
          }
        }
        function M(e4, t2, r2) {
          const n4 = h(e4, t2, r2);
          return "string" != typeof n4 ? T(e4, i.INVALID_MESSAGE, void 0) : n4;
        }
        return M.rich = h, M.markup = (e4, t2, r2) => {
          const n4 = h(e4, t2, r2);
          if ("string" != typeof n4) {
            const t3 = new s(i.FORMATTING_ERROR, void 0);
            return I2(t3), f2({ error: t3, key: e4, namespace: d2 });
          }
          return n4;
        }, M.raw = (e4) => {
          if (y) return f2({ error: E2, key: e4, namespace: d2 });
          const t2 = E2;
          try {
            return c(g2, t2, e4, d2);
          } catch (t3) {
            return T(e4, i.MISSING_MESSAGE, t3.message);
          }
        }, M.has = (e4) => {
          if (y) return false;
          try {
            return c(g2, E2, e4, d2), true;
          } catch (e5) {
            return false;
          }
        }, M;
      }(__spreadProps(__spreadValues({}, e2), { messagesOrError: n2 }));
    }, exports.createFormatter = function(e2) {
      let { _cache: t2 = r.createCache(), _formatters: n2 = r.createIntlFormatters(t2), formats: o2, locale: a2, now: u2, onError: c2 = r.defaultOnError, timeZone: d2 } = e2;
      function y(e3) {
        var t3;
        return null !== (t3 = e3) && void 0 !== t3 && t3.timeZone || (d2 ? e3 = __spreadProps(__spreadValues({}, e3), { timeZone: d2 }) : c2(new s(i.ENVIRONMENT_FALLBACK, void 0))), e3;
      }
      function T(e3, t3, r2, n3) {
        let o3;
        try {
          o3 = function(e4, t4) {
            let r3;
            if ("string" == typeof t4) {
              if (r3 = null == e4 ? void 0 : e4[t4], !r3) {
                const e5 = new s(i.MISSING_FORMAT, void 0);
                throw c2(e5), e5;
              }
            } else r3 = t4;
            return r3;
          }(t3, e3);
        } catch (e4) {
          return n3();
        }
        try {
          return r2(o3);
        } catch (e4) {
          return c2(new s(i.FORMATTING_ERROR, e4.message)), n3();
        }
      }
      function h(e3, t3) {
        return T(t3, null == o2 ? void 0 : o2.dateTime, (t4) => (t4 = y(t4), n2.getDateTimeFormat(a2, t4).format(e3)), () => String(e3));
      }
      function M() {
        return u2 || (c2(new s(i.ENVIRONMENT_FALLBACK, void 0)), /* @__PURE__ */ new Date());
      }
      return { dateTime: h, number: function(e3, t3) {
        return T(t3, null == o2 ? void 0 : o2.number, (t4) => n2.getNumberFormat(a2, t4).format(e3), () => String(e3));
      }, relativeTime: function(e3, t3) {
        try {
          let r2, o3;
          const i2 = {};
          t3 instanceof Date || "number" == typeof t3 ? r2 = new Date(t3) : t3 && (r2 = null != t3.now ? new Date(t3.now) : M(), o3 = t3.unit, i2.style = t3.style, i2.numberingSystem = t3.numberingSystem), r2 || (r2 = M());
          const s2 = (new Date(e3).getTime() - r2.getTime()) / 1e3;
          o3 || (o3 = function(e4) {
            const t4 = Math.abs(e4);
            return t4 < l ? "second" : t4 < m ? "minute" : t4 < f ? "hour" : t4 < g ? "day" : t4 < E ? "week" : t4 < I ? "month" : "year";
          }(s2)), i2.numeric = "second" === o3 ? "auto" : "always";
          const u3 = function(e4, t4) {
            return Math.round(e4 / S[t4]);
          }(s2, o3);
          return n2.getRelativeTimeFormat(a2, i2).format(u3, o3);
        } catch (t4) {
          return c2(new s(i.FORMATTING_ERROR, t4.message)), String(e3);
        }
      }, list: function(e3, t3) {
        const r2 = [], i2 = /* @__PURE__ */ new Map();
        let s2 = 0;
        for (const t4 of e3) {
          let e4;
          "object" == typeof t4 ? (e4 = String(s2), i2.set(e4, t4)) : e4 = String(t4), r2.push(e4), s2++;
        }
        return T(t3, null == o2 ? void 0 : o2.list, (e4) => {
          const t4 = n2.getListFormat(a2, e4).formatToParts(r2).map((e5) => "literal" === e5.type ? e5.value : i2.get(e5.value) || e5.value);
          return i2.size > 0 ? t4 : t4.join("");
        }, () => String(e3));
      }, dateTimeRange: function(e3, t3, r2) {
        return T(r2, null == o2 ? void 0 : o2.dateTime, (r3) => (r3 = y(r3), n2.getDateTimeFormat(a2, r3).formatRange(e3, t3)), () => [h(e3), h(t3)].join("\u2009\u2013\u2009"));
      } };
    }, exports.resolveNamespace = function(e2, t2) {
      return e2 === t2 ? void 0 : e2.slice((t2 + ".").length);
    };
  }
});

// ../../node_modules/use-intl/dist/production/core.js
var require_core = __commonJS({
  "../../node_modules/use-intl/dist/production/core.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var e = require_createFormatter_CZeYe_QF();
    var r = require_initializeConfig_AbYTngyP();
    init_lib4(), __require("react"), init_lib(), exports.IntlError = e.IntlError, exports.IntlErrorCode = e.IntlErrorCode, exports.createFormatter = e.createFormatter, exports._createCache = r.createCache, exports._createIntlFormatters = r.createIntlFormatters, exports.initializeConfig = r.initializeConfig, exports.createTranslator = function(t) {
      let _a2 = t, { _cache: a = r.createCache(), _formatters: s = r.createIntlFormatters(a), getMessageFallback: o = r.defaultGetMessageFallback, messages: c, namespace: n, onError: i = r.defaultOnError } = _a2, l = __objRest(_a2, ["_cache", "_formatters", "getMessageFallback", "messages", "namespace", "onError"]);
      return function(r2, t2) {
        let _a3 = r2, { messages: a2, namespace: s2 } = _a3, o2 = __objRest(_a3, ["messages", "namespace"]);
        return a2 = a2[t2], s2 = e.resolveNamespace(s2, t2), e.createBaseTranslator(__spreadProps(__spreadValues({}, o2), { messages: a2, namespace: s2 }));
      }(__spreadProps(__spreadValues({}, l), { onError: i, cache: a, formatters: s, getMessageFallback: o, messages: { "!": c }, namespace: n ? "!.".concat(n) : "!" }), "!");
    };
  }
});

// ../../node_modules/use-intl/dist/production/IntlContext-DcFt0tgW.js
var require_IntlContext_DcFt0tgW = __commonJS({
  "../../node_modules/use-intl/dist/production/IntlContext-DcFt0tgW.js"(exports) {
    "use strict";
    var t = __require("react").createContext(void 0);
    exports.IntlContext = t;
  }
});

// ../../node_modules/use-intl/dist/production/_IntlProvider.js
var require_IntlProvider = __commonJS({
  "../../node_modules/use-intl/dist/production/_IntlProvider.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var e = __require("react");
    var t = require_initializeConfig_AbYTngyP();
    var r = require_IntlContext_DcFt0tgW();
    function a(e2) {
      return e2 && e2.__esModule ? e2 : { default: e2 };
    }
    init_lib();
    var o = a(e);
    exports.IntlProvider = function(a2) {
      let { children: s, defaultTranslationValues: n, formats: l, getMessageFallback: i, locale: u, messages: c, now: m, onError: f, timeZone: d } = a2;
      const g = e.useMemo(() => t.createCache(), [u]), M = e.useMemo(() => t.createIntlFormatters(g), [g]), v = e.useMemo(() => __spreadProps(__spreadValues({}, t.initializeConfig({ locale: u, defaultTranslationValues: n, formats: l, getMessageFallback: i, messages: c, now: m, onError: f, timeZone: d })), { formatters: M, cache: g }), [g, n, l, M, i, u, c, m, f, d]);
      return o.default.createElement(r.IntlContext.Provider, { value: v }, s);
    };
  }
});

// ../../node_modules/use-intl/dist/production/_useLocale-CpTrqBDt.js
var require_useLocale_CpTrqBDt = __commonJS({
  "../../node_modules/use-intl/dist/production/_useLocale-CpTrqBDt.js"(exports) {
    "use strict";
    var t = __require("react");
    var e = require_IntlContext_DcFt0tgW();
    function r() {
      const r2 = t.useContext(e.IntlContext);
      if (!r2) throw new Error(void 0);
      return r2;
    }
    exports.useIntlContext = r, exports.useLocale = function() {
      return r().locale;
    };
  }
});

// ../../node_modules/use-intl/dist/production/react.js
var require_react = __commonJS({
  "../../node_modules/use-intl/dist/production/react.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var e = require_IntlProvider();
    var t = require_useLocale_CpTrqBDt();
    var r = __require("react");
    var o = require_createFormatter_CZeYe_QF();
    require_initializeConfig_AbYTngyP(), init_lib(), require_IntlContext_DcFt0tgW(), init_lib4();
    var n = false;
    var s = "undefined" == typeof window;
    function a() {
      return /* @__PURE__ */ new Date();
    }
    exports.IntlProvider = e.IntlProvider, exports.useLocale = t.useLocale, exports.useFormatter = function() {
      const { formats: e2, formatters: n2, locale: s2, now: a2, onError: u, timeZone: l } = t.useIntlContext();
      return r.useMemo(() => o.createFormatter({ formats: e2, locale: s2, now: a2, onError: u, timeZone: l, _formatters: n2 }), [e2, n2, a2, s2, u, l]);
    }, exports.useMessages = function() {
      const e2 = t.useIntlContext();
      if (!e2.messages) throw new Error(void 0);
      return e2.messages;
    }, exports.useNow = function(e2) {
      const o2 = null == e2 ? void 0 : e2.updateInterval, { now: n2 } = t.useIntlContext(), [s2, u] = r.useState(n2 || a());
      return r.useEffect(() => {
        if (!o2) return;
        const e3 = setInterval(() => {
          u(a());
        }, o2);
        return () => {
          clearInterval(e3);
        };
      }, [n2, o2]), null == o2 && n2 ? n2 : s2;
    }, exports.useTimeZone = function() {
      return t.useIntlContext().timeZone;
    }, exports.useTranslations = function(e2) {
      return function(e3, a2, u) {
        const { cache: l, defaultTranslationValues: i, formats: c, formatters: m, getMessageFallback: f, locale: I, onError: d, timeZone: x } = t.useIntlContext(), p = e3[u], v = o.resolveNamespace(a2, u);
        return x || n || !s || (n = true, d(new o.IntlError(o.IntlErrorCode.ENVIRONMENT_FALLBACK, void 0))), r.useMemo(() => o.createBaseTranslator({ cache: l, formatters: m, getMessageFallback: f, messages: p, defaultTranslationValues: i, namespace: v, onError: d, formats: c, locale: I, timeZone: x }), [l, m, f, p, i, v, d, c, I, x]);
      }({ "!": t.useIntlContext().messages }, e2 ? "!.".concat(e2) : "!", "!");
    };
  }
});

// ../../node_modules/use-intl/dist/production/index.js
var require_production = __commonJS({
  "../../node_modules/use-intl/dist/production/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var e = require_createFormatter_CZeYe_QF();
    var r = require_core();
    var t = require_initializeConfig_AbYTngyP();
    var s = require_IntlProvider();
    var o = require_react();
    var a = require_useLocale_CpTrqBDt();
    init_lib4(), __require("react"), init_lib(), require_IntlContext_DcFt0tgW(), exports.IntlError = e.IntlError, exports.IntlErrorCode = e.IntlErrorCode, exports.createFormatter = e.createFormatter, exports.createTranslator = r.createTranslator, exports._createCache = t.createCache, exports._createIntlFormatters = t.createIntlFormatters, exports.initializeConfig = t.initializeConfig, exports.IntlProvider = s.IntlProvider, exports.useFormatter = o.useFormatter, exports.useMessages = o.useMessages, exports.useNow = o.useNow, exports.useTimeZone = o.useTimeZone, exports.useTranslations = o.useTranslations, exports.useLocale = a.useLocale;
  }
});

// ../../node_modules/use-intl/dist/development/initializeConfig-BhfMSHP7.js
var require_initializeConfig_BhfMSHP7 = __commonJS({
  "../../node_modules/use-intl/dist/development/initializeConfig-BhfMSHP7.js"(exports) {
    "use strict";
    var fastMemoize = (init_lib(), __toCommonJS(lib_exports));
    function _defineProperty(e, r, t) {
      return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: true,
        configurable: true,
        writable: true
      }) : e[r] = t, e;
    }
    function _toPrimitive(t, r) {
      if ("object" != typeof t || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r ? String : Number)(t);
    }
    function _toPropertyKey(t) {
      var i = _toPrimitive(t, "string");
      return "symbol" == typeof i ? i : i + "";
    }
    var IntlErrorCode = /* @__PURE__ */ function(IntlErrorCode2) {
      IntlErrorCode2["MISSING_MESSAGE"] = "MISSING_MESSAGE";
      IntlErrorCode2["MISSING_FORMAT"] = "MISSING_FORMAT";
      IntlErrorCode2["ENVIRONMENT_FALLBACK"] = "ENVIRONMENT_FALLBACK";
      IntlErrorCode2["INSUFFICIENT_PATH"] = "INSUFFICIENT_PATH";
      IntlErrorCode2["INVALID_MESSAGE"] = "INVALID_MESSAGE";
      IntlErrorCode2["INVALID_KEY"] = "INVALID_KEY";
      IntlErrorCode2["FORMATTING_ERROR"] = "FORMATTING_ERROR";
      return IntlErrorCode2;
    }({});
    var IntlError = class extends Error {
      constructor(code, originalMessage) {
        let message = code;
        if (originalMessage) {
          message += ": " + originalMessage;
        }
        super(message);
        _defineProperty(this, "code", void 0);
        _defineProperty(this, "originalMessage", void 0);
        this.code = code;
        if (originalMessage) {
          this.originalMessage = originalMessage;
        }
      }
    };
    function joinPath() {
      for (var _len = arguments.length, parts = new Array(_len), _key = 0; _key < _len; _key++) {
        parts[_key] = arguments[_key];
      }
      return parts.filter(Boolean).join(".");
    }
    function defaultGetMessageFallback(props) {
      return joinPath(props.namespace, props.key);
    }
    function defaultOnError(error) {
      console.error(error);
    }
    function createCache() {
      return {
        dateTime: {},
        number: {},
        message: {},
        relativeTime: {},
        pluralRules: {},
        list: {},
        displayNames: {}
      };
    }
    function createMemoCache(store) {
      return {
        create() {
          return {
            get(key) {
              return store[key];
            },
            set(key, value) {
              store[key] = value;
            }
          };
        }
      };
    }
    function memoFn(fn, cache) {
      return fastMemoize.memoize(fn, {
        cache: createMemoCache(cache),
        strategy: fastMemoize.strategies.variadic
      });
    }
    function memoConstructor(ConstructorFn, cache) {
      return memoFn(function() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return new ConstructorFn(...args);
      }, cache);
    }
    function createIntlFormatters(cache) {
      const getDateTimeFormat = memoConstructor(Intl.DateTimeFormat, cache.dateTime);
      const getNumberFormat = memoConstructor(Intl.NumberFormat, cache.number);
      const getPluralRules = memoConstructor(Intl.PluralRules, cache.pluralRules);
      const getRelativeTimeFormat = memoConstructor(Intl.RelativeTimeFormat, cache.relativeTime);
      const getListFormat = memoConstructor(Intl.ListFormat, cache.list);
      const getDisplayNames = memoConstructor(Intl.DisplayNames, cache.displayNames);
      return {
        getDateTimeFormat,
        getNumberFormat,
        getPluralRules,
        getRelativeTimeFormat,
        getListFormat,
        getDisplayNames
      };
    }
    function validateMessagesSegment(messages, invalidKeyLabels, parentPath) {
      Object.entries(messages).forEach((_ref) => {
        let [key, messageOrMessages] = _ref;
        if (key.includes(".")) {
          let keyLabel = key;
          if (parentPath) keyLabel += " (at ".concat(parentPath, ")");
          invalidKeyLabels.push(keyLabel);
        }
        if (messageOrMessages != null && typeof messageOrMessages === "object") {
          validateMessagesSegment(messageOrMessages, invalidKeyLabels, joinPath(parentPath, key));
        }
      });
    }
    function validateMessages(messages, onError) {
      const invalidKeyLabels = [];
      validateMessagesSegment(messages, invalidKeyLabels);
      if (invalidKeyLabels.length > 0) {
        onError(new IntlError(IntlErrorCode.INVALID_KEY, 'Namespace keys can not contain the character "." as this is used to express nesting. Please remove it or replace it with another character.\n\nInvalid '.concat(invalidKeyLabels.length === 1 ? "key" : "keys", ": ").concat(invalidKeyLabels.join(", "), `

If you're migrating from a flat structure, you can convert your messages as follows:

import {set} from "lodash";

const input = {
  "one.one": "1.1",
  "one.two": "1.2",
  "two.one.one": "2.1.1"
};

const output = Object.entries(input).reduce(
  (acc, [key, value]) => set(acc, key, value),
  {}
);

// Output:
//
// {
//   "one": {
//     "one": "1.1",
//     "two": "1.2"
//   },
//   "two": {
//     "one": {
//       "one": "2.1.1"
//     }
//   }
// }
`)));
      }
    }
    function initializeConfig(_ref) {
      let _a2 = _ref, {
        getMessageFallback,
        messages,
        onError
      } = _a2, rest = __objRest(_a2, [
        "getMessageFallback",
        "messages",
        "onError"
      ]);
      const finalOnError = onError || defaultOnError;
      const finalGetMessageFallback = getMessageFallback || defaultGetMessageFallback;
      {
        if (messages) {
          validateMessages(messages, finalOnError);
        }
      }
      return __spreadProps(__spreadValues({}, rest), {
        messages,
        onError: finalOnError,
        getMessageFallback: finalGetMessageFallback
      });
    }
    exports.IntlError = IntlError;
    exports.IntlErrorCode = IntlErrorCode;
    exports.createCache = createCache;
    exports.createIntlFormatters = createIntlFormatters;
    exports.defaultGetMessageFallback = defaultGetMessageFallback;
    exports.defaultOnError = defaultOnError;
    exports.initializeConfig = initializeConfig;
    exports.joinPath = joinPath;
    exports.memoFn = memoFn;
  }
});

// ../../node_modules/use-intl/dist/development/createFormatter-QqAaZwGD.js
var require_createFormatter_QqAaZwGD = __commonJS({
  "../../node_modules/use-intl/dist/development/createFormatter-QqAaZwGD.js"(exports) {
    "use strict";
    var IntlMessageFormat2 = (init_lib4(), __toCommonJS(lib_exports2));
    var React29 = __require("react");
    var initializeConfig = require_initializeConfig_BhfMSHP7();
    function _interopDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var IntlMessageFormat__default = /* @__PURE__ */ _interopDefault(IntlMessageFormat2);
    function setTimeZoneInFormats(formats, timeZone) {
      if (!formats) return formats;
      return Object.keys(formats).reduce((acc, key) => {
        acc[key] = __spreadValues({
          timeZone
        }, formats[key]);
        return acc;
      }, {});
    }
    function convertFormatsToIntlMessageFormat(formats, timeZone) {
      const formatsWithTimeZone = timeZone ? __spreadProps(__spreadValues({}, formats), {
        dateTime: setTimeZoneInFormats(formats.dateTime, timeZone)
      }) : formats;
      const mfDateDefaults = IntlMessageFormat__default.default.formats.date;
      const defaultDateFormats = timeZone ? setTimeZoneInFormats(mfDateDefaults, timeZone) : mfDateDefaults;
      const mfTimeDefaults = IntlMessageFormat__default.default.formats.time;
      const defaultTimeFormats = timeZone ? setTimeZoneInFormats(mfTimeDefaults, timeZone) : mfTimeDefaults;
      return __spreadProps(__spreadValues({}, formatsWithTimeZone), {
        date: __spreadValues(__spreadValues({}, defaultDateFormats), formatsWithTimeZone.dateTime),
        time: __spreadValues(__spreadValues({}, defaultTimeFormats), formatsWithTimeZone.dateTime)
      });
    }
    function createMessageFormatter(cache, intlFormatters) {
      const getMessageFormat = initializeConfig.memoFn(function() {
        return new IntlMessageFormat__default.default(arguments.length <= 0 ? void 0 : arguments[0], arguments.length <= 1 ? void 0 : arguments[1], arguments.length <= 2 ? void 0 : arguments[2], __spreadValues({
          formatters: intlFormatters
        }, arguments.length <= 3 ? void 0 : arguments[3]));
      }, cache.message);
      return getMessageFormat;
    }
    function resolvePath(locale, messages, key, namespace) {
      const fullKey = initializeConfig.joinPath(namespace, key);
      if (!messages) {
        throw new Error("No messages available at `".concat(namespace, "`."));
      }
      let message = messages;
      key.split(".").forEach((part) => {
        const next = message[part];
        if (part == null || next == null) {
          throw new Error("Could not resolve `".concat(fullKey, "` in messages for locale `").concat(locale, "`."));
        }
        message = next;
      });
      return message;
    }
    function prepareTranslationValues(values) {
      if (Object.keys(values).length === 0) return void 0;
      const transformedValues = {};
      Object.keys(values).forEach((key) => {
        let index = 0;
        const value = values[key];
        let transformed;
        if (typeof value === "function") {
          transformed = (chunks) => {
            const result = value(chunks);
            return /* @__PURE__ */ React29.isValidElement(result) ? /* @__PURE__ */ React29.cloneElement(result, {
              key: key + index++
            }) : result;
          };
        } else {
          transformed = value;
        }
        transformedValues[key] = transformed;
      });
      return transformedValues;
    }
    function getMessagesOrError(locale, messages, namespace) {
      let onError = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : initializeConfig.defaultOnError;
      try {
        if (!messages) {
          throw new Error("No messages were configured on the provider.");
        }
        const retrievedMessages = namespace ? resolvePath(locale, messages, namespace) : messages;
        if (!retrievedMessages) {
          throw new Error("No messages for namespace `".concat(namespace, "` found."));
        }
        return retrievedMessages;
      } catch (error) {
        const intlError = new initializeConfig.IntlError(initializeConfig.IntlErrorCode.MISSING_MESSAGE, error.message);
        onError(intlError);
        return intlError;
      }
    }
    function getPlainMessage(candidate, values) {
      if (values) return void 0;
      const unescapedMessage = candidate.replace(/'([{}])/gi, "$1");
      const hasPlaceholders = /<|{/.test(unescapedMessage);
      if (!hasPlaceholders) {
        return unescapedMessage;
      }
      return void 0;
    }
    function createBaseTranslator(config) {
      const messagesOrError = getMessagesOrError(config.locale, config.messages, config.namespace, config.onError);
      return createBaseTranslatorImpl(__spreadProps(__spreadValues({}, config), {
        messagesOrError
      }));
    }
    function createBaseTranslatorImpl(_ref) {
      let {
        cache,
        defaultTranslationValues,
        formats: globalFormats,
        formatters,
        getMessageFallback = initializeConfig.defaultGetMessageFallback,
        locale,
        messagesOrError,
        namespace,
        onError,
        timeZone
      } = _ref;
      const hasMessagesError = messagesOrError instanceof initializeConfig.IntlError;
      function getFallbackFromErrorAndNotify(key, code, message) {
        const error = new initializeConfig.IntlError(code, message);
        onError(error);
        return getMessageFallback({
          error,
          key,
          namespace
        });
      }
      function translateBaseFn(key, values, formats) {
        if (hasMessagesError) {
          return getMessageFallback({
            error: messagesOrError,
            key,
            namespace
          });
        }
        const messages = messagesOrError;
        let message;
        try {
          message = resolvePath(locale, messages, key, namespace);
        } catch (error) {
          return getFallbackFromErrorAndNotify(key, initializeConfig.IntlErrorCode.MISSING_MESSAGE, error.message);
        }
        if (typeof message === "object") {
          let code, errorMessage;
          if (Array.isArray(message)) {
            code = initializeConfig.IntlErrorCode.INVALID_MESSAGE;
            {
              errorMessage = "Message at `".concat(initializeConfig.joinPath(namespace, key), "` resolved to an array, but only strings are supported. See https://next-intl.dev/docs/usage/messages#arrays-of-messages");
            }
          } else {
            code = initializeConfig.IntlErrorCode.INSUFFICIENT_PATH;
            {
              errorMessage = "Message at `".concat(initializeConfig.joinPath(namespace, key), "` resolved to an object, but only strings are supported. Use a `.` to retrieve nested messages. See https://next-intl.dev/docs/usage/messages#structuring-messages");
            }
          }
          return getFallbackFromErrorAndNotify(key, code, errorMessage);
        }
        let messageFormat;
        const plainMessage = getPlainMessage(message, values);
        if (plainMessage) return plainMessage;
        if (!formatters.getMessageFormat) {
          formatters.getMessageFormat = createMessageFormatter(cache, formatters);
        }
        try {
          messageFormat = formatters.getMessageFormat(message, locale, convertFormatsToIntlMessageFormat(__spreadValues(__spreadValues({}, globalFormats), formats), timeZone), {
            formatters: __spreadProps(__spreadValues({}, formatters), {
              getDateTimeFormat(locales, options) {
                return formatters.getDateTimeFormat(locales, __spreadValues({
                  timeZone
                }, options));
              }
            })
          });
        } catch (error) {
          const thrownError = error;
          return getFallbackFromErrorAndNotify(key, initializeConfig.IntlErrorCode.INVALID_MESSAGE, thrownError.message + ("originalMessage" in thrownError ? " (".concat(thrownError.originalMessage, ")") : ""));
        }
        try {
          const formattedMessage = messageFormat.format(
            // @ts-expect-error `intl-messageformat` expects a different format
            // for rich text elements since a recent minor update. This
            // needs to be evaluated in detail, possibly also in regards
            // to be able to format to parts.
            prepareTranslationValues(__spreadValues(__spreadValues({}, defaultTranslationValues), values))
          );
          if (formattedMessage == null) {
            throw new Error("Unable to format `".concat(key, "` in ").concat(namespace ? "namespace `".concat(namespace, "`") : "messages"));
          }
          return /* @__PURE__ */ React29.isValidElement(formattedMessage) || // Arrays of React elements
          Array.isArray(formattedMessage) || typeof formattedMessage === "string" ? formattedMessage : String(formattedMessage);
        } catch (error) {
          return getFallbackFromErrorAndNotify(key, initializeConfig.IntlErrorCode.FORMATTING_ERROR, error.message);
        }
      }
      function translateFn(key, values, formats) {
        const result = translateBaseFn(key, values, formats);
        if (typeof result !== "string") {
          return getFallbackFromErrorAndNotify(key, initializeConfig.IntlErrorCode.INVALID_MESSAGE, "The message `".concat(key, "` in ").concat(namespace ? "namespace `".concat(namespace, "`") : "messages", " didn't resolve to a string. If you want to format rich text, use `t.rich` instead."));
        }
        return result;
      }
      translateFn.rich = translateBaseFn;
      translateFn.markup = (key, values, formats) => {
        const result = translateBaseFn(
          key,
          // @ts-expect-error -- `MarkupTranslationValues` is practically a sub type
          // of `RichTranslationValues` but TypeScript isn't smart enough here.
          values,
          formats
        );
        if (typeof result !== "string") {
          const error = new initializeConfig.IntlError(initializeConfig.IntlErrorCode.FORMATTING_ERROR, "`t.markup` only accepts functions for formatting that receive and return strings.\n\nE.g. t.markup('markup', {b: (chunks) => `<b>${chunks}</b>`})");
          onError(error);
          return getMessageFallback({
            error,
            key,
            namespace
          });
        }
        return result;
      };
      translateFn.raw = (key) => {
        if (hasMessagesError) {
          return getMessageFallback({
            error: messagesOrError,
            key,
            namespace
          });
        }
        const messages = messagesOrError;
        try {
          return resolvePath(locale, messages, key, namespace);
        } catch (error) {
          return getFallbackFromErrorAndNotify(key, initializeConfig.IntlErrorCode.MISSING_MESSAGE, error.message);
        }
      };
      translateFn.has = (key) => {
        if (hasMessagesError) {
          return false;
        }
        try {
          resolvePath(locale, messagesOrError, key, namespace);
          return true;
        } catch (_unused) {
          return false;
        }
      };
      return translateFn;
    }
    function resolveNamespace(namespace, namespacePrefix) {
      return namespace === namespacePrefix ? void 0 : namespace.slice((namespacePrefix + ".").length);
    }
    var SECOND = 1;
    var MINUTE = SECOND * 60;
    var HOUR = MINUTE * 60;
    var DAY = HOUR * 24;
    var WEEK = DAY * 7;
    var MONTH = DAY * (365 / 12);
    var QUARTER = MONTH * 3;
    var YEAR = DAY * 365;
    var UNIT_SECONDS = {
      second: SECOND,
      seconds: SECOND,
      minute: MINUTE,
      minutes: MINUTE,
      hour: HOUR,
      hours: HOUR,
      day: DAY,
      days: DAY,
      week: WEEK,
      weeks: WEEK,
      month: MONTH,
      months: MONTH,
      quarter: QUARTER,
      quarters: QUARTER,
      year: YEAR,
      years: YEAR
    };
    function resolveRelativeTimeUnit(seconds) {
      const absValue = Math.abs(seconds);
      if (absValue < MINUTE) {
        return "second";
      } else if (absValue < HOUR) {
        return "minute";
      } else if (absValue < DAY) {
        return "hour";
      } else if (absValue < WEEK) {
        return "day";
      } else if (absValue < MONTH) {
        return "week";
      } else if (absValue < YEAR) {
        return "month";
      }
      return "year";
    }
    function calculateRelativeTimeValue(seconds, unit) {
      return Math.round(seconds / UNIT_SECONDS[unit]);
    }
    function createFormatter(_ref) {
      let {
        _cache: cache = initializeConfig.createCache(),
        _formatters: formatters = initializeConfig.createIntlFormatters(cache),
        formats,
        locale,
        now: globalNow,
        onError = initializeConfig.defaultOnError,
        timeZone: globalTimeZone
      } = _ref;
      function applyTimeZone(options) {
        var _options;
        if (!((_options = options) !== null && _options !== void 0 && _options.timeZone)) {
          if (globalTimeZone) {
            options = __spreadProps(__spreadValues({}, options), {
              timeZone: globalTimeZone
            });
          } else {
            onError(new initializeConfig.IntlError(initializeConfig.IntlErrorCode.ENVIRONMENT_FALLBACK, "The `timeZone` parameter wasn't provided and there is no global default configured. Consider adding a global default to avoid markup mismatches caused by environment differences. Learn more: https://next-intl.dev/docs/configuration#time-zone"));
          }
        }
        return options;
      }
      function resolveFormatOrOptions(typeFormats, formatOrOptions) {
        let options;
        if (typeof formatOrOptions === "string") {
          const formatName = formatOrOptions;
          options = typeFormats === null || typeFormats === void 0 ? void 0 : typeFormats[formatName];
          if (!options) {
            const error = new initializeConfig.IntlError(initializeConfig.IntlErrorCode.MISSING_FORMAT, "Format `".concat(formatName, "` is not available. You can configure it on the provider or provide custom options."));
            onError(error);
            throw error;
          }
        } else {
          options = formatOrOptions;
        }
        return options;
      }
      function getFormattedValue(formatOrOptions, typeFormats, formatter, getFallback) {
        let options;
        try {
          options = resolveFormatOrOptions(typeFormats, formatOrOptions);
        } catch (_unused) {
          return getFallback();
        }
        try {
          return formatter(options);
        } catch (error) {
          onError(new initializeConfig.IntlError(initializeConfig.IntlErrorCode.FORMATTING_ERROR, error.message));
          return getFallback();
        }
      }
      function dateTime(value, formatOrOptions) {
        return getFormattedValue(formatOrOptions, formats === null || formats === void 0 ? void 0 : formats.dateTime, (options) => {
          options = applyTimeZone(options);
          return formatters.getDateTimeFormat(locale, options).format(value);
        }, () => String(value));
      }
      function dateTimeRange(start, end, formatOrOptions) {
        return getFormattedValue(formatOrOptions, formats === null || formats === void 0 ? void 0 : formats.dateTime, (options) => {
          options = applyTimeZone(options);
          return formatters.getDateTimeFormat(locale, options).formatRange(start, end);
        }, () => [dateTime(start), dateTime(end)].join("\u2009\u2013\u2009"));
      }
      function number(value, formatOrOptions) {
        return getFormattedValue(formatOrOptions, formats === null || formats === void 0 ? void 0 : formats.number, (options) => formatters.getNumberFormat(locale, options).format(value), () => String(value));
      }
      function getGlobalNow() {
        if (globalNow) {
          return globalNow;
        } else {
          onError(new initializeConfig.IntlError(initializeConfig.IntlErrorCode.ENVIRONMENT_FALLBACK, "The `now` parameter wasn't provided and there is no global default configured. Consider adding a global default to avoid markup mismatches caused by environment differences. Learn more: https://next-intl.dev/docs/configuration#now"));
          return /* @__PURE__ */ new Date();
        }
      }
      function relativeTime(date, nowOrOptions) {
        try {
          let nowDate, unit;
          const opts = {};
          if (nowOrOptions instanceof Date || typeof nowOrOptions === "number") {
            nowDate = new Date(nowOrOptions);
          } else if (nowOrOptions) {
            if (nowOrOptions.now != null) {
              nowDate = new Date(nowOrOptions.now);
            } else {
              nowDate = getGlobalNow();
            }
            unit = nowOrOptions.unit;
            opts.style = nowOrOptions.style;
            opts.numberingSystem = nowOrOptions.numberingSystem;
          }
          if (!nowDate) {
            nowDate = getGlobalNow();
          }
          const dateDate = new Date(date);
          const seconds = (dateDate.getTime() - nowDate.getTime()) / 1e3;
          if (!unit) {
            unit = resolveRelativeTimeUnit(seconds);
          }
          opts.numeric = unit === "second" ? "auto" : "always";
          const value = calculateRelativeTimeValue(seconds, unit);
          return formatters.getRelativeTimeFormat(locale, opts).format(value, unit);
        } catch (error) {
          onError(new initializeConfig.IntlError(initializeConfig.IntlErrorCode.FORMATTING_ERROR, error.message));
          return String(date);
        }
      }
      function list(value, formatOrOptions) {
        const serializedValue = [];
        const richValues = /* @__PURE__ */ new Map();
        let index = 0;
        for (const item of value) {
          let serializedItem;
          if (typeof item === "object") {
            serializedItem = String(index);
            richValues.set(serializedItem, item);
          } else {
            serializedItem = String(item);
          }
          serializedValue.push(serializedItem);
          index++;
        }
        return getFormattedValue(
          formatOrOptions,
          formats === null || formats === void 0 ? void 0 : formats.list,
          // @ts-expect-error -- `richValues.size` is used to determine the return type, but TypeScript can't infer the meaning of this correctly
          (options) => {
            const result = formatters.getListFormat(locale, options).formatToParts(serializedValue).map((part) => part.type === "literal" ? part.value : richValues.get(part.value) || part.value);
            if (richValues.size > 0) {
              return result;
            } else {
              return result.join("");
            }
          },
          () => String(value)
        );
      }
      return {
        dateTime,
        number,
        relativeTime,
        list,
        dateTimeRange
      };
    }
    exports.createBaseTranslator = createBaseTranslator;
    exports.createFormatter = createFormatter;
    exports.resolveNamespace = resolveNamespace;
  }
});

// ../../node_modules/use-intl/dist/development/core.js
var require_core2 = __commonJS({
  "../../node_modules/use-intl/dist/development/core.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var initializeConfig = require_initializeConfig_BhfMSHP7();
    var createFormatter = require_createFormatter_QqAaZwGD();
    init_lib();
    init_lib4();
    __require("react");
    function createTranslatorImpl(_ref, namespacePrefix) {
      let _a2 = _ref, {
        messages,
        namespace
      } = _a2, rest = __objRest(_a2, [
        "messages",
        "namespace"
      ]);
      messages = messages[namespacePrefix];
      namespace = createFormatter.resolveNamespace(namespace, namespacePrefix);
      return createFormatter.createBaseTranslator(__spreadProps(__spreadValues({}, rest), {
        messages,
        namespace
      }));
    }
    function createTranslator(_ref) {
      let _a2 = _ref, {
        _cache = initializeConfig.createCache(),
        _formatters = initializeConfig.createIntlFormatters(_cache),
        getMessageFallback = initializeConfig.defaultGetMessageFallback,
        messages,
        namespace,
        onError = initializeConfig.defaultOnError
      } = _a2, rest = __objRest(_a2, [
        "_cache",
        "_formatters",
        "getMessageFallback",
        "messages",
        "namespace",
        "onError"
      ]);
      return createTranslatorImpl(__spreadProps(__spreadValues({}, rest), {
        onError,
        cache: _cache,
        formatters: _formatters,
        getMessageFallback,
        // @ts-expect-error `messages` is allowed to be `undefined` here and will be handled internally
        messages: {
          "!": messages
        },
        namespace: namespace ? "!.".concat(namespace) : "!"
      }), "!");
    }
    exports.IntlError = initializeConfig.IntlError;
    exports.IntlErrorCode = initializeConfig.IntlErrorCode;
    exports._createCache = initializeConfig.createCache;
    exports._createIntlFormatters = initializeConfig.createIntlFormatters;
    exports.initializeConfig = initializeConfig.initializeConfig;
    exports.createFormatter = createFormatter.createFormatter;
    exports.createTranslator = createTranslator;
  }
});

// ../../node_modules/use-intl/dist/development/IntlContext-BKfsnzBx.js
var require_IntlContext_BKfsnzBx = __commonJS({
  "../../node_modules/use-intl/dist/development/IntlContext-BKfsnzBx.js"(exports) {
    "use strict";
    var React29 = __require("react");
    var IntlContext = /* @__PURE__ */ React29.createContext(void 0);
    exports.IntlContext = IntlContext;
  }
});

// ../../node_modules/use-intl/dist/development/_IntlProvider.js
var require_IntlProvider2 = __commonJS({
  "../../node_modules/use-intl/dist/development/_IntlProvider.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var React29 = __require("react");
    var initializeConfig = require_initializeConfig_BhfMSHP7();
    var IntlContext = require_IntlContext_BKfsnzBx();
    init_lib();
    function _interopDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var React__default2 = /* @__PURE__ */ _interopDefault(React29);
    function IntlProvider(_ref) {
      let {
        children,
        defaultTranslationValues,
        formats,
        getMessageFallback,
        locale,
        messages,
        now,
        onError,
        timeZone
      } = _ref;
      const cache = React29.useMemo(() => {
        return initializeConfig.createCache();
      }, [locale]);
      const formatters = React29.useMemo(() => initializeConfig.createIntlFormatters(cache), [cache]);
      const value = React29.useMemo(() => __spreadProps(__spreadValues({}, initializeConfig.initializeConfig({
        locale,
        defaultTranslationValues,
        formats,
        getMessageFallback,
        messages,
        now,
        onError,
        timeZone
      })), {
        formatters,
        cache
      }), [cache, defaultTranslationValues, formats, formatters, getMessageFallback, locale, messages, now, onError, timeZone]);
      return /* @__PURE__ */ React__default2.default.createElement(IntlContext.IntlContext.Provider, {
        value
      }, children);
    }
    exports.IntlProvider = IntlProvider;
  }
});

// ../../node_modules/use-intl/dist/development/_useLocale-BK3jOeaA.js
var require_useLocale_BK3jOeaA = __commonJS({
  "../../node_modules/use-intl/dist/development/_useLocale-BK3jOeaA.js"(exports) {
    "use strict";
    var React29 = __require("react");
    var IntlContext = require_IntlContext_BKfsnzBx();
    function useIntlContext() {
      const context = React29.useContext(IntlContext.IntlContext);
      if (!context) {
        throw new Error("No intl context found. Have you configured the provider? See https://next-intl.dev/docs/usage/configuration#client-server-components");
      }
      return context;
    }
    function useLocale() {
      return useIntlContext().locale;
    }
    exports.useIntlContext = useIntlContext;
    exports.useLocale = useLocale;
  }
});

// ../../node_modules/use-intl/dist/development/react.js
var require_react2 = __commonJS({
  "../../node_modules/use-intl/dist/development/react.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _IntlProvider = require_IntlProvider2();
    var _useLocale = require_useLocale_BK3jOeaA();
    var React29 = __require("react");
    var createFormatter = require_createFormatter_QqAaZwGD();
    var initializeConfig = require_initializeConfig_BhfMSHP7();
    require_IntlContext_BKfsnzBx();
    init_lib4();
    init_lib();
    var hasWarnedForMissingTimezone = false;
    var isServer = typeof window === "undefined";
    function useTranslationsImpl(allMessagesPrefixed, namespacePrefixed, namespacePrefix) {
      const {
        cache,
        defaultTranslationValues,
        formats: globalFormats,
        formatters,
        getMessageFallback,
        locale,
        onError,
        timeZone
      } = _useLocale.useIntlContext();
      const allMessages = allMessagesPrefixed[namespacePrefix];
      const namespace = createFormatter.resolveNamespace(namespacePrefixed, namespacePrefix);
      if (!timeZone && !hasWarnedForMissingTimezone && isServer) {
        hasWarnedForMissingTimezone = true;
        onError(new initializeConfig.IntlError(initializeConfig.IntlErrorCode.ENVIRONMENT_FALLBACK, "There is no `timeZone` configured, this can lead to markup mismatches caused by environment differences. Consider adding a global default: https://next-intl.dev/docs/configuration#time-zone"));
      }
      const translate = React29.useMemo(() => createFormatter.createBaseTranslator({
        cache,
        formatters,
        getMessageFallback,
        messages: allMessages,
        defaultTranslationValues,
        namespace,
        onError,
        formats: globalFormats,
        locale,
        timeZone
      }), [cache, formatters, getMessageFallback, allMessages, defaultTranslationValues, namespace, onError, globalFormats, locale, timeZone]);
      return translate;
    }
    function useTranslations2(namespace) {
      const context = _useLocale.useIntlContext();
      const messages = context.messages;
      return useTranslationsImpl(
        {
          "!": messages
        },
        // @ts-expect-error
        namespace ? "!.".concat(namespace) : "!",
        "!"
      );
    }
    function getNow() {
      return /* @__PURE__ */ new Date();
    }
    function useNow(options) {
      const updateInterval = options === null || options === void 0 ? void 0 : options.updateInterval;
      const {
        now: globalNow
      } = _useLocale.useIntlContext();
      const [now, setNow] = React29.useState(globalNow || getNow());
      React29.useEffect(() => {
        if (!updateInterval) return;
        const intervalId = setInterval(() => {
          setNow(getNow());
        }, updateInterval);
        return () => {
          clearInterval(intervalId);
        };
      }, [globalNow, updateInterval]);
      return updateInterval == null && globalNow ? globalNow : now;
    }
    function useTimeZone() {
      return _useLocale.useIntlContext().timeZone;
    }
    function useMessages() {
      const context = _useLocale.useIntlContext();
      if (!context.messages) {
        throw new Error("No messages found. Have you configured them correctly? See https://next-intl.dev/docs/configuration#messages");
      }
      return context.messages;
    }
    function useFormatter() {
      const {
        formats,
        formatters,
        locale,
        now: globalNow,
        onError,
        timeZone
      } = _useLocale.useIntlContext();
      return React29.useMemo(() => createFormatter.createFormatter({
        formats,
        locale,
        now: globalNow,
        onError,
        timeZone,
        _formatters: formatters
      }), [formats, formatters, globalNow, locale, onError, timeZone]);
    }
    exports.IntlProvider = _IntlProvider.IntlProvider;
    exports.useLocale = _useLocale.useLocale;
    exports.useFormatter = useFormatter;
    exports.useMessages = useMessages;
    exports.useNow = useNow;
    exports.useTimeZone = useTimeZone;
    exports.useTranslations = useTranslations2;
  }
});

// ../../node_modules/use-intl/dist/development/index.js
var require_development = __commonJS({
  "../../node_modules/use-intl/dist/development/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var initializeConfig = require_initializeConfig_BhfMSHP7();
    var core = require_core2();
    var createFormatter = require_createFormatter_QqAaZwGD();
    var _IntlProvider = require_IntlProvider2();
    var react = require_react2();
    var _useLocale = require_useLocale_BK3jOeaA();
    init_lib();
    init_lib4();
    __require("react");
    require_IntlContext_BKfsnzBx();
    exports.IntlError = initializeConfig.IntlError;
    exports.IntlErrorCode = initializeConfig.IntlErrorCode;
    exports._createCache = initializeConfig.createCache;
    exports._createIntlFormatters = initializeConfig.createIntlFormatters;
    exports.initializeConfig = initializeConfig.initializeConfig;
    exports.createTranslator = core.createTranslator;
    exports.createFormatter = createFormatter.createFormatter;
    exports.IntlProvider = _IntlProvider.IntlProvider;
    exports.useFormatter = react.useFormatter;
    exports.useMessages = react.useMessages;
    exports.useNow = react.useNow;
    exports.useTimeZone = react.useTimeZone;
    exports.useTranslations = react.useTranslations;
    exports.useLocale = _useLocale.useLocale;
  }
});

// ../../node_modules/use-intl/dist/index.js
var require_dist = __commonJS({
  "../../node_modules/use-intl/dist/index.js"(exports, module) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module.exports = require_production();
    } else {
      module.exports = require_development();
    }
  }
});

// ../../node_modules/next-intl/dist/production/react-client/index.js
var require_react_client = __commonJS({
  "../../node_modules/next-intl/dist/production/react-client/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var e = require_dist();
    function t(e2, t2) {
      return function() {
        try {
          return t2(...arguments);
        } catch (e3) {
          throw new Error(void 0);
        }
      };
    }
    var r = t(0, e.useTranslations);
    var o = t(0, e.useFormatter);
    exports.useFormatter = o, exports.useTranslations = r, Object.keys(e).forEach(function(t2) {
      "default" === t2 || Object.prototype.hasOwnProperty.call(exports, t2) || Object.defineProperty(exports, t2, { enumerable: true, get: function() {
        return e[t2];
      } });
    });
  }
});

// ../../node_modules/@swc/helpers/cjs/_interop_require_default.cjs
var require_interop_require_default = __commonJS({
  "../../node_modules/@swc/helpers/cjs/_interop_require_default.cjs"(exports) {
    "use strict";
    exports._ = exports._interop_require_default = _interop_require_default;
    function _interop_require_default(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
  }
});

// ../../node_modules/next/dist/shared/lib/app-router-context.shared-runtime.js
var require_app_router_context_shared_runtime = __commonJS({
  "../../node_modules/next/dist/shared/lib/app-router-context.shared-runtime.js"(exports) {
    "use strict";
    "use client";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all) Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
      });
    }
    _export(exports, {
      AppRouterContext: function() {
        return AppRouterContext;
      },
      GlobalLayoutRouterContext: function() {
        return GlobalLayoutRouterContext;
      },
      LayoutRouterContext: function() {
        return LayoutRouterContext;
      },
      MissingSlotContext: function() {
        return MissingSlotContext;
      },
      TemplateContext: function() {
        return TemplateContext;
      }
    });
    var _interop_require_default = require_interop_require_default();
    var _react = /* @__PURE__ */ _interop_require_default._(__require("react"));
    var AppRouterContext = _react.default.createContext(null);
    var LayoutRouterContext = _react.default.createContext(null);
    var GlobalLayoutRouterContext = _react.default.createContext(null);
    var TemplateContext = _react.default.createContext(null);
    if (process.env.NODE_ENV !== "production") {
      AppRouterContext.displayName = "AppRouterContext";
      LayoutRouterContext.displayName = "LayoutRouterContext";
      GlobalLayoutRouterContext.displayName = "GlobalLayoutRouterContext";
      TemplateContext.displayName = "TemplateContext";
    }
    var MissingSlotContext = _react.default.createContext(/* @__PURE__ */ new Set());
  }
});

// ../../node_modules/next/dist/shared/lib/hooks-client-context.shared-runtime.js
var require_hooks_client_context_shared_runtime = __commonJS({
  "../../node_modules/next/dist/shared/lib/hooks-client-context.shared-runtime.js"(exports) {
    "use strict";
    "use client";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all) Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
      });
    }
    _export(exports, {
      PathParamsContext: function() {
        return PathParamsContext;
      },
      PathnameContext: function() {
        return PathnameContext;
      },
      SearchParamsContext: function() {
        return SearchParamsContext;
      }
    });
    var _react = __require("react");
    var SearchParamsContext = (0, _react.createContext)(null);
    var PathnameContext = (0, _react.createContext)(null);
    var PathParamsContext = (0, _react.createContext)(null);
    if (process.env.NODE_ENV !== "production") {
      SearchParamsContext.displayName = "SearchParamsContext";
      PathnameContext.displayName = "PathnameContext";
      PathParamsContext.displayName = "PathParamsContext";
    }
  }
});

// ../../node_modules/next/dist/client/components/router-reducer/reducers/get-segment-value.js
var require_get_segment_value = __commonJS({
  "../../node_modules/next/dist/client/components/router-reducer/reducers/get-segment-value.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "getSegmentValue", {
      enumerable: true,
      get: function() {
        return getSegmentValue;
      }
    });
    function getSegmentValue(segment) {
      return Array.isArray(segment) ? segment[1] : segment;
    }
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/dist/shared/lib/segment.js
var require_segment = __commonJS({
  "../../node_modules/next/dist/shared/lib/segment.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all) Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
      });
    }
    _export(exports, {
      DEFAULT_SEGMENT_KEY: function() {
        return DEFAULT_SEGMENT_KEY;
      },
      PAGE_SEGMENT_KEY: function() {
        return PAGE_SEGMENT_KEY;
      },
      isGroupSegment: function() {
        return isGroupSegment;
      }
    });
    function isGroupSegment(segment) {
      return segment[0] === "(" && segment.endsWith(")");
    }
    var PAGE_SEGMENT_KEY = "__PAGE__";
    var DEFAULT_SEGMENT_KEY = "__DEFAULT__";
  }
});

// ../../node_modules/next/dist/client/components/async-local-storage.js
var require_async_local_storage = __commonJS({
  "../../node_modules/next/dist/client/components/async-local-storage.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "createAsyncLocalStorage", {
      enumerable: true,
      get: function() {
        return createAsyncLocalStorage;
      }
    });
    var sharedAsyncLocalStorageNotAvailableError = new Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available");
    var FakeAsyncLocalStorage = class {
      disable() {
        throw sharedAsyncLocalStorageNotAvailableError;
      }
      getStore() {
        return void 0;
      }
      run() {
        throw sharedAsyncLocalStorageNotAvailableError;
      }
      exit() {
        throw sharedAsyncLocalStorageNotAvailableError;
      }
      enterWith() {
        throw sharedAsyncLocalStorageNotAvailableError;
      }
    };
    var maybeGlobalAsyncLocalStorage = globalThis.AsyncLocalStorage;
    function createAsyncLocalStorage() {
      if (maybeGlobalAsyncLocalStorage) {
        return new maybeGlobalAsyncLocalStorage();
      }
      return new FakeAsyncLocalStorage();
    }
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/dist/client/components/request-async-storage-instance.js
var require_request_async_storage_instance = __commonJS({
  "../../node_modules/next/dist/client/components/request-async-storage-instance.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "requestAsyncStorage", {
      enumerable: true,
      get: function() {
        return requestAsyncStorage;
      }
    });
    var _asynclocalstorage = require_async_local_storage();
    var requestAsyncStorage = (0, _asynclocalstorage.createAsyncLocalStorage)();
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/dist/client/components/request-async-storage.external.js
var require_request_async_storage_external = __commonJS({
  "../../node_modules/next/dist/client/components/request-async-storage.external.js"(exports, module) {
    "use strict";
    "TURBOPACK { transition: next-shared }";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all) Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
      });
    }
    _export(exports, {
      getExpectedRequestStore: function() {
        return getExpectedRequestStore;
      },
      requestAsyncStorage: function() {
        return _requestasyncstorageinstance.requestAsyncStorage;
      }
    });
    var _requestasyncstorageinstance = require_request_async_storage_instance();
    function getExpectedRequestStore(callingExpression) {
      const store = _requestasyncstorageinstance.requestAsyncStorage.getStore();
      if (store) return store;
      throw new Error("`" + callingExpression + "` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context");
    }
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/dist/client/components/action-async-storage-instance.js
var require_action_async_storage_instance = __commonJS({
  "../../node_modules/next/dist/client/components/action-async-storage-instance.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "actionAsyncStorage", {
      enumerable: true,
      get: function() {
        return actionAsyncStorage;
      }
    });
    var _asynclocalstorage = require_async_local_storage();
    var actionAsyncStorage = (0, _asynclocalstorage.createAsyncLocalStorage)();
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/dist/client/components/action-async-storage.external.js
var require_action_async_storage_external = __commonJS({
  "../../node_modules/next/dist/client/components/action-async-storage.external.js"(exports, module) {
    "use strict";
    "TURBOPACK { transition: next-shared }";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "actionAsyncStorage", {
      enumerable: true,
      get: function() {
        return _actionasyncstorageinstance.actionAsyncStorage;
      }
    });
    var _actionasyncstorageinstance = require_action_async_storage_instance();
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/dist/client/components/redirect-status-code.js
var require_redirect_status_code = __commonJS({
  "../../node_modules/next/dist/client/components/redirect-status-code.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "RedirectStatusCode", {
      enumerable: true,
      get: function() {
        return RedirectStatusCode;
      }
    });
    var RedirectStatusCode;
    (function(RedirectStatusCode2) {
      RedirectStatusCode2[RedirectStatusCode2["SeeOther"] = 303] = "SeeOther";
      RedirectStatusCode2[RedirectStatusCode2["TemporaryRedirect"] = 307] = "TemporaryRedirect";
      RedirectStatusCode2[RedirectStatusCode2["PermanentRedirect"] = 308] = "PermanentRedirect";
    })(RedirectStatusCode || (RedirectStatusCode = {}));
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/dist/client/components/redirect.js
var require_redirect = __commonJS({
  "../../node_modules/next/dist/client/components/redirect.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all) Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
      });
    }
    _export(exports, {
      RedirectType: function() {
        return RedirectType;
      },
      getRedirectError: function() {
        return getRedirectError;
      },
      getRedirectStatusCodeFromError: function() {
        return getRedirectStatusCodeFromError;
      },
      getRedirectTypeFromError: function() {
        return getRedirectTypeFromError;
      },
      getURLFromRedirectError: function() {
        return getURLFromRedirectError;
      },
      isRedirectError: function() {
        return isRedirectError;
      },
      permanentRedirect: function() {
        return permanentRedirect;
      },
      redirect: function() {
        return redirect;
      }
    });
    var _requestasyncstorageexternal = require_request_async_storage_external();
    var _actionasyncstorageexternal = require_action_async_storage_external();
    var _redirectstatuscode = require_redirect_status_code();
    var REDIRECT_ERROR_CODE = "NEXT_REDIRECT";
    var RedirectType;
    (function(RedirectType2) {
      RedirectType2["push"] = "push";
      RedirectType2["replace"] = "replace";
    })(RedirectType || (RedirectType = {}));
    function getRedirectError(url, type, statusCode) {
      if (statusCode === void 0) statusCode = _redirectstatuscode.RedirectStatusCode.TemporaryRedirect;
      const error = new Error(REDIRECT_ERROR_CODE);
      error.digest = REDIRECT_ERROR_CODE + ";" + type + ";" + url + ";" + statusCode + ";";
      const requestStore = _requestasyncstorageexternal.requestAsyncStorage.getStore();
      if (requestStore) {
        error.mutableCookies = requestStore.mutableCookies;
      }
      return error;
    }
    function redirect(url, type) {
      if (type === void 0) type = "replace";
      const actionStore = _actionasyncstorageexternal.actionAsyncStorage.getStore();
      throw getRedirectError(
        url,
        type,
        // If we're in an action, we want to use a 303 redirect
        // as we don't want the POST request to follow the redirect,
        // as it could result in erroneous re-submissions.
        (actionStore == null ? void 0 : actionStore.isAction) ? _redirectstatuscode.RedirectStatusCode.SeeOther : _redirectstatuscode.RedirectStatusCode.TemporaryRedirect
      );
    }
    function permanentRedirect(url, type) {
      if (type === void 0) type = "replace";
      const actionStore = _actionasyncstorageexternal.actionAsyncStorage.getStore();
      throw getRedirectError(
        url,
        type,
        // If we're in an action, we want to use a 303 redirect
        // as we don't want the POST request to follow the redirect,
        // as it could result in erroneous re-submissions.
        (actionStore == null ? void 0 : actionStore.isAction) ? _redirectstatuscode.RedirectStatusCode.SeeOther : _redirectstatuscode.RedirectStatusCode.PermanentRedirect
      );
    }
    function isRedirectError(error) {
      if (typeof error !== "object" || error === null || !("digest" in error) || typeof error.digest !== "string") {
        return false;
      }
      const [errorCode, type, destination, status] = error.digest.split(";", 4);
      const statusCode = Number(status);
      return errorCode === REDIRECT_ERROR_CODE && (type === "replace" || type === "push") && typeof destination === "string" && !isNaN(statusCode) && statusCode in _redirectstatuscode.RedirectStatusCode;
    }
    function getURLFromRedirectError(error) {
      if (!isRedirectError(error)) return null;
      return error.digest.split(";", 3)[2];
    }
    function getRedirectTypeFromError(error) {
      if (!isRedirectError(error)) {
        throw new Error("Not a redirect error");
      }
      return error.digest.split(";", 2)[1];
    }
    function getRedirectStatusCodeFromError(error) {
      if (!isRedirectError(error)) {
        throw new Error("Not a redirect error");
      }
      return Number(error.digest.split(";", 4)[3]);
    }
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/dist/client/components/not-found.js
var require_not_found = __commonJS({
  "../../node_modules/next/dist/client/components/not-found.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all) Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
      });
    }
    _export(exports, {
      isNotFoundError: function() {
        return isNotFoundError;
      },
      notFound: function() {
        return notFound;
      }
    });
    var NOT_FOUND_ERROR_CODE = "NEXT_NOT_FOUND";
    function notFound() {
      const error = new Error(NOT_FOUND_ERROR_CODE);
      error.digest = NOT_FOUND_ERROR_CODE;
      throw error;
    }
    function isNotFoundError(error) {
      if (typeof error !== "object" || error === null || !("digest" in error)) {
        return false;
      }
      return error.digest === NOT_FOUND_ERROR_CODE;
    }
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/dist/client/components/navigation.react-server.js
var require_navigation_react_server = __commonJS({
  "../../node_modules/next/dist/client/components/navigation.react-server.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all) Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
      });
    }
    _export(exports, {
      ReadonlyURLSearchParams: function() {
        return ReadonlyURLSearchParams;
      },
      RedirectType: function() {
        return _redirect.RedirectType;
      },
      notFound: function() {
        return _notfound.notFound;
      },
      permanentRedirect: function() {
        return _redirect.permanentRedirect;
      },
      redirect: function() {
        return _redirect.redirect;
      }
    });
    var _redirect = require_redirect();
    var _notfound = require_not_found();
    var ReadonlyURLSearchParamsError = class extends Error {
      constructor() {
        super("Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams");
      }
    };
    var ReadonlyURLSearchParams = class extends URLSearchParams {
      /** @deprecated Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams */
      append() {
        throw new ReadonlyURLSearchParamsError();
      }
      /** @deprecated Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams */
      delete() {
        throw new ReadonlyURLSearchParamsError();
      }
      /** @deprecated Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams */
      set() {
        throw new ReadonlyURLSearchParamsError();
      }
      /** @deprecated Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams */
      sort() {
        throw new ReadonlyURLSearchParamsError();
      }
    };
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs
var require_interop_require_wildcard = __commonJS({
  "../../node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs"(exports) {
    "use strict";
    function _getRequireWildcardCache(nodeInterop) {
      if (typeof WeakMap !== "function") return null;
      var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
      var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
      return (_getRequireWildcardCache = function(nodeInterop2) {
        return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
      })(nodeInterop);
    }
    exports._ = exports._interop_require_wildcard = _interop_require_wildcard;
    function _interop_require_wildcard(obj, nodeInterop) {
      if (!nodeInterop && obj && obj.__esModule) return obj;
      if (obj === null || typeof obj !== "object" && typeof obj !== "function") return { default: obj };
      var cache = _getRequireWildcardCache(nodeInterop);
      if (cache && cache.has(obj)) return cache.get(obj);
      var newObj = { __proto__: null };
      var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var key in obj) {
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
          if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
          else newObj[key] = obj[key];
        }
      }
      newObj.default = obj;
      if (cache) cache.set(obj, newObj);
      return newObj;
    }
  }
});

// ../../node_modules/next/dist/shared/lib/server-inserted-html.shared-runtime.js
var require_server_inserted_html_shared_runtime = __commonJS({
  "../../node_modules/next/dist/shared/lib/server-inserted-html.shared-runtime.js"(exports) {
    "use strict";
    "use client";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all) Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
      });
    }
    _export(exports, {
      ServerInsertedHTMLContext: function() {
        return ServerInsertedHTMLContext;
      },
      useServerInsertedHTML: function() {
        return useServerInsertedHTML;
      }
    });
    var _interop_require_wildcard = require_interop_require_wildcard();
    var _react = /* @__PURE__ */ _interop_require_wildcard._(__require("react"));
    var ServerInsertedHTMLContext = /* @__PURE__ */ _react.default.createContext(null);
    function useServerInsertedHTML(callback) {
      const addInsertedServerHTMLCallback = (0, _react.useContext)(ServerInsertedHTMLContext);
      if (addInsertedServerHTMLCallback) {
        addInsertedServerHTMLCallback(callback);
      }
    }
  }
});

// ../../node_modules/next/dist/shared/lib/lazy-dynamic/bailout-to-csr.js
var require_bailout_to_csr = __commonJS({
  "../../node_modules/next/dist/shared/lib/lazy-dynamic/bailout-to-csr.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all) Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
      });
    }
    _export(exports, {
      BailoutToCSRError: function() {
        return BailoutToCSRError;
      },
      isBailoutToCSRError: function() {
        return isBailoutToCSRError;
      }
    });
    var BAILOUT_TO_CSR = "BAILOUT_TO_CLIENT_SIDE_RENDERING";
    var BailoutToCSRError = class extends Error {
      constructor(reason) {
        super("Bail out to client-side rendering: " + reason);
        this.reason = reason;
        this.digest = BAILOUT_TO_CSR;
      }
    };
    function isBailoutToCSRError(err) {
      if (typeof err !== "object" || err === null || !("digest" in err)) {
        return false;
      }
      return err.digest === BAILOUT_TO_CSR;
    }
  }
});

// ../../node_modules/next/dist/client/components/static-generation-async-storage-instance.js
var require_static_generation_async_storage_instance = __commonJS({
  "../../node_modules/next/dist/client/components/static-generation-async-storage-instance.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "staticGenerationAsyncStorage", {
      enumerable: true,
      get: function() {
        return staticGenerationAsyncStorage;
      }
    });
    var _asynclocalstorage = require_async_local_storage();
    var staticGenerationAsyncStorage = (0, _asynclocalstorage.createAsyncLocalStorage)();
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/dist/client/components/static-generation-async-storage.external.js
var require_static_generation_async_storage_external = __commonJS({
  "../../node_modules/next/dist/client/components/static-generation-async-storage.external.js"(exports, module) {
    "use strict";
    "TURBOPACK { transition: next-shared }";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "staticGenerationAsyncStorage", {
      enumerable: true,
      get: function() {
        return _staticgenerationasyncstorageinstance.staticGenerationAsyncStorage;
      }
    });
    var _staticgenerationasyncstorageinstance = require_static_generation_async_storage_instance();
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/dist/client/components/bailout-to-client-rendering.js
var require_bailout_to_client_rendering = __commonJS({
  "../../node_modules/next/dist/client/components/bailout-to-client-rendering.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "bailoutToClientRendering", {
      enumerable: true,
      get: function() {
        return bailoutToClientRendering;
      }
    });
    var _bailouttocsr = require_bailout_to_csr();
    var _staticgenerationasyncstorageexternal = require_static_generation_async_storage_external();
    function bailoutToClientRendering(reason) {
      const staticGenerationStore = _staticgenerationasyncstorageexternal.staticGenerationAsyncStorage.getStore();
      if (staticGenerationStore == null ? void 0 : staticGenerationStore.forceStatic) return;
      if (staticGenerationStore == null ? void 0 : staticGenerationStore.isStaticGeneration) throw new _bailouttocsr.BailoutToCSRError(reason);
    }
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/dist/client/components/navigation.js
var require_navigation = __commonJS({
  "../../node_modules/next/dist/client/components/navigation.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all) Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
      });
    }
    _export(exports, {
      ReadonlyURLSearchParams: function() {
        return _navigationreactserver.ReadonlyURLSearchParams;
      },
      RedirectType: function() {
        return _navigationreactserver.RedirectType;
      },
      ServerInsertedHTMLContext: function() {
        return _serverinsertedhtmlsharedruntime.ServerInsertedHTMLContext;
      },
      notFound: function() {
        return _navigationreactserver.notFound;
      },
      permanentRedirect: function() {
        return _navigationreactserver.permanentRedirect;
      },
      redirect: function() {
        return _navigationreactserver.redirect;
      },
      useParams: function() {
        return useParams;
      },
      usePathname: function() {
        return usePathname;
      },
      useRouter: function() {
        return useRouter;
      },
      useSearchParams: function() {
        return useSearchParams;
      },
      useSelectedLayoutSegment: function() {
        return useSelectedLayoutSegment;
      },
      useSelectedLayoutSegments: function() {
        return useSelectedLayoutSegments;
      },
      useServerInsertedHTML: function() {
        return _serverinsertedhtmlsharedruntime.useServerInsertedHTML;
      }
    });
    var _react = __require("react");
    var _approutercontextsharedruntime = require_app_router_context_shared_runtime();
    var _hooksclientcontextsharedruntime = require_hooks_client_context_shared_runtime();
    var _getsegmentvalue = require_get_segment_value();
    var _segment = require_segment();
    var _navigationreactserver = require_navigation_react_server();
    var _serverinsertedhtmlsharedruntime = require_server_inserted_html_shared_runtime();
    function useSearchParams() {
      const searchParams = (0, _react.useContext)(_hooksclientcontextsharedruntime.SearchParamsContext);
      const readonlySearchParams = (0, _react.useMemo)(() => {
        if (!searchParams) {
          return null;
        }
        return new _navigationreactserver.ReadonlyURLSearchParams(searchParams);
      }, [
        searchParams
      ]);
      if (typeof window === "undefined") {
        const { bailoutToClientRendering } = require_bailout_to_client_rendering();
        bailoutToClientRendering("useSearchParams()");
      }
      return readonlySearchParams;
    }
    function usePathname() {
      return (0, _react.useContext)(_hooksclientcontextsharedruntime.PathnameContext);
    }
    function useRouter() {
      const router = (0, _react.useContext)(_approutercontextsharedruntime.AppRouterContext);
      if (router === null) {
        throw new Error("invariant expected app router to be mounted");
      }
      return router;
    }
    function useParams() {
      return (0, _react.useContext)(_hooksclientcontextsharedruntime.PathParamsContext);
    }
    function getSelectedLayoutSegmentPath(tree, parallelRouteKey, first, segmentPath) {
      if (first === void 0) first = true;
      if (segmentPath === void 0) segmentPath = [];
      let node;
      if (first) {
        node = tree[1][parallelRouteKey];
      } else {
        const parallelRoutes = tree[1];
        var _parallelRoutes_children;
        node = (_parallelRoutes_children = parallelRoutes.children) != null ? _parallelRoutes_children : Object.values(parallelRoutes)[0];
      }
      if (!node) return segmentPath;
      const segment = node[0];
      const segmentValue = (0, _getsegmentvalue.getSegmentValue)(segment);
      if (!segmentValue || segmentValue.startsWith(_segment.PAGE_SEGMENT_KEY)) {
        return segmentPath;
      }
      segmentPath.push(segmentValue);
      return getSelectedLayoutSegmentPath(node, parallelRouteKey, false, segmentPath);
    }
    function useSelectedLayoutSegments(parallelRouteKey) {
      if (parallelRouteKey === void 0) parallelRouteKey = "children";
      const context = (0, _react.useContext)(_approutercontextsharedruntime.LayoutRouterContext);
      if (!context) return null;
      return getSelectedLayoutSegmentPath(context.tree, parallelRouteKey);
    }
    function useSelectedLayoutSegment(parallelRouteKey) {
      if (parallelRouteKey === void 0) parallelRouteKey = "children";
      const selectedLayoutSegments = useSelectedLayoutSegments(parallelRouteKey);
      if (!selectedLayoutSegments || selectedLayoutSegments.length === 0) {
        return null;
      }
      const selectedLayoutSegment = parallelRouteKey === "children" ? selectedLayoutSegments[0] : selectedLayoutSegments[selectedLayoutSegments.length - 1];
      return selectedLayoutSegment === _segment.DEFAULT_SEGMENT_KEY ? null : selectedLayoutSegment;
    }
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  }
});

// ../../node_modules/next/navigation.js
var require_navigation2 = __commonJS({
  "../../node_modules/next/navigation.js"(exports, module) {
    "use strict";
    module.exports = require_navigation();
  }
});

// ../../node_modules/use-intl/dist/production/_useLocale.js
var require_useLocale = __commonJS({
  "../../node_modules/use-intl/dist/production/_useLocale.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var e = require_useLocale_CpTrqBDt();
    __require("react"), require_IntlContext_DcFt0tgW(), exports.useLocale = e.useLocale;
  }
});

// ../../node_modules/use-intl/dist/development/_useLocale.js
var require_useLocale2 = __commonJS({
  "../../node_modules/use-intl/dist/development/_useLocale.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _useLocale = require_useLocale_BK3jOeaA();
    __require("react");
    require_IntlContext_BKfsnzBx();
    exports.useLocale = _useLocale.useLocale;
  }
});

// ../../node_modules/use-intl/dist/_useLocale.js
var require_useLocale3 = __commonJS({
  "../../node_modules/use-intl/dist/_useLocale.js"(exports, module) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module.exports = require_useLocale();
    } else {
      module.exports = require_useLocale2();
    }
  }
});

// ../../node_modules/next-intl/dist/production/shared/constants.js
var require_constants = __commonJS({
  "../../node_modules/next-intl/dist/production/shared/constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HEADER_LOCALE_NAME = "X-NEXT-INTL-LOCALE", exports.LOCALE_SEGMENT_NAME = "locale";
  }
});

// ../../node_modules/next-intl/dist/production/react-client/useLocale.js
var require_useLocale4 = __commonJS({
  "../../node_modules/next-intl/dist/production/react-client/useLocale.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var e = require_navigation2();
    var t = require_useLocale3();
    var r = require_constants();
    exports.default = function() {
      const s = e.useParams();
      let u;
      try {
        u = t.useLocale();
      } catch (e2) {
        if ("string" != typeof (null == s ? void 0 : s[r.LOCALE_SEGMENT_NAME])) throw e2;
        u = s[r.LOCALE_SEGMENT_NAME];
      }
      return u;
    };
  }
});

// ../../node_modules/next-intl/dist/production/_virtual/_rollupPluginBabelHelpers.js
var require_rollupPluginBabelHelpers = __commonJS({
  "../../node_modules/next-intl/dist/production/_virtual/_rollupPluginBabelHelpers.js"(exports) {
    "use strict";
    function e() {
      return e = Object.assign ? Object.assign.bind() : function(e2) {
        for (var r = 1; r < arguments.length; r++) {
          var n = arguments[r];
          for (var t in n) ({}).hasOwnProperty.call(n, t) && (e2[t] = n[t]);
        }
        return e2;
      }, e.apply(null, arguments);
    }
    Object.defineProperty(exports, "__esModule", { value: true }), exports.extends = e;
  }
});

// ../../node_modules/use-intl/dist/_IntlProvider.js
var require_IntlProvider3 = __commonJS({
  "../../node_modules/use-intl/dist/_IntlProvider.js"(exports, module) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module.exports = require_IntlProvider();
    } else {
      module.exports = require_IntlProvider2();
    }
  }
});

// ../../node_modules/next-intl/dist/production/shared/NextIntlClientProvider.js
var require_NextIntlClientProvider = __commonJS({
  "../../node_modules/next-intl/dist/production/shared/NextIntlClientProvider.js"(exports) {
    "use strict";
    "use client";
    Object.defineProperty(exports, "__esModule", { value: true });
    var e = require_rollupPluginBabelHelpers();
    var r = __require("react");
    var t = require_IntlProvider3();
    function l(e2) {
      return e2 && e2.__esModule ? e2 : { default: e2 };
    }
    var u = l(r);
    exports.default = function(r2) {
      let _a2 = r2, { locale: l2 } = _a2, o = __objRest(_a2, ["locale"]);
      if (!l2) throw new Error(void 0);
      return u.default.createElement(t.IntlProvider, e.extends({ locale: l2 }, o));
    };
  }
});

// ../../node_modules/next-intl/dist/production/index.react-client.js
var require_index_react_client = __commonJS({
  "../../node_modules/next-intl/dist/production/index.react-client.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var e = require_react_client();
    var t = require_useLocale4();
    var r = require_NextIntlClientProvider();
    var s = require_dist();
    exports.useFormatter = e.useFormatter, exports.useTranslations = e.useTranslations, exports.useLocale = t.default, exports.NextIntlClientProvider = r.default, Object.keys(s).forEach(function(e2) {
      "default" === e2 || Object.prototype.hasOwnProperty.call(exports, e2) || Object.defineProperty(exports, e2, { enumerable: true, get: function() {
        return s[e2];
      } });
    });
  }
});

// ../../node_modules/next-intl/dist/development/react-client/index.js
var require_react_client2 = __commonJS({
  "../../node_modules/next-intl/dist/development/react-client/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var useIntl = require_dist();
    function callHook(name, hook) {
      return function() {
        try {
          return hook(...arguments);
        } catch (_unused) {
          throw new Error("Failed to call `".concat(name, "` because the context from `NextIntlClientProvider` was not found.\n\nThis can happen because:\n1) You intended to render this component as a Server Component, the render\n   failed, and therefore React attempted to render the component on the client\n   instead. If this is the case, check the console for server errors.\n2) You intended to render this component on the client side, but no context was found.\n   Learn more about this error here: https://next-intl.dev/docs/environments/server-client-components#missing-context"));
        }
      };
    }
    var useTranslations2 = callHook("useTranslations", useIntl.useTranslations);
    var useFormatter = callHook("useFormatter", useIntl.useFormatter);
    exports.useFormatter = useFormatter;
    exports.useTranslations = useTranslations2;
    Object.keys(useIntl).forEach(function(k) {
      if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
        enumerable: true,
        get: function() {
          return useIntl[k];
        }
      });
    });
  }
});

// ../../node_modules/next-intl/dist/development/shared/constants.js
var require_constants2 = __commonJS({
  "../../node_modules/next-intl/dist/development/shared/constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HEADER_LOCALE_NAME = "X-NEXT-INTL-LOCALE";
    var LOCALE_SEGMENT_NAME = "locale";
    exports.HEADER_LOCALE_NAME = HEADER_LOCALE_NAME;
    exports.LOCALE_SEGMENT_NAME = LOCALE_SEGMENT_NAME;
  }
});

// ../../node_modules/next-intl/dist/development/react-client/useLocale.js
var require_useLocale5 = __commonJS({
  "../../node_modules/next-intl/dist/development/react-client/useLocale.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var navigation = require_navigation2();
    var _useLocale = require_useLocale3();
    var constants = require_constants2();
    var hasWarnedForParams = false;
    function useLocale() {
      const params = navigation.useParams();
      let locale;
      try {
        locale = _useLocale.useLocale();
      } catch (error) {
        if (typeof (params === null || params === void 0 ? void 0 : params[constants.LOCALE_SEGMENT_NAME]) === "string") {
          if (!hasWarnedForParams) {
            console.warn("Deprecation warning: `useLocale` has returned a default from `useParams().locale` since no `NextIntlClientProvider` ancestor was found for the calling component. This behavior will be removed in the next major version. Please ensure all Client Components that use `next-intl` are wrapped in a `NextIntlClientProvider`.");
            hasWarnedForParams = true;
          }
          locale = params[constants.LOCALE_SEGMENT_NAME];
        } else {
          throw error;
        }
      }
      return locale;
    }
    exports.default = useLocale;
  }
});

// ../../node_modules/next-intl/dist/development/_virtual/_rollupPluginBabelHelpers.js
var require_rollupPluginBabelHelpers2 = __commonJS({
  "../../node_modules/next-intl/dist/development/_virtual/_rollupPluginBabelHelpers.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function _extends() {
      return _extends = Object.assign ? Object.assign.bind() : function(n) {
        for (var e = 1; e < arguments.length; e++) {
          var t = arguments[e];
          for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
        }
        return n;
      }, _extends.apply(null, arguments);
    }
    exports.extends = _extends;
  }
});

// ../../node_modules/next-intl/dist/development/shared/NextIntlClientProvider.js
var require_NextIntlClientProvider2 = __commonJS({
  "../../node_modules/next-intl/dist/development/shared/NextIntlClientProvider.js"(exports) {
    "use strict";
    "use client";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _rollupPluginBabelHelpers = require_rollupPluginBabelHelpers2();
    var React29 = __require("react");
    var _IntlProvider = require_IntlProvider3();
    function _interopDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var React__default2 = /* @__PURE__ */ _interopDefault(React29);
    function NextIntlClientProvider(_ref) {
      let _a2 = _ref, {
        locale
      } = _a2, rest = __objRest(_a2, [
        "locale"
      ]);
      if (!locale) {
        throw new Error("Failed to determine locale in `NextIntlClientProvider`, please provide the `locale` prop explicitly.\n\nSee https://next-intl.dev/docs/configuration#locale");
      }
      return /* @__PURE__ */ React__default2.default.createElement(_IntlProvider.IntlProvider, _rollupPluginBabelHelpers.extends({
        locale
      }, rest));
    }
    exports.default = NextIntlClientProvider;
  }
});

// ../../node_modules/next-intl/dist/development/index.react-client.js
var require_index_react_client2 = __commonJS({
  "../../node_modules/next-intl/dist/development/index.react-client.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var index = require_react_client2();
    var useLocale = require_useLocale5();
    var NextIntlClientProvider = require_NextIntlClientProvider2();
    var useIntl = require_dist();
    exports.useFormatter = index.useFormatter;
    exports.useTranslations = index.useTranslations;
    exports.useLocale = useLocale.default;
    exports.NextIntlClientProvider = NextIntlClientProvider.default;
    Object.keys(useIntl).forEach(function(k) {
      if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
        enumerable: true,
        get: function() {
          return useIntl[k];
        }
      });
    });
  }
});

// ../../node_modules/next-intl/dist/index.react-client.js
var require_index_react_client3 = __commonJS({
  "../../node_modules/next-intl/dist/index.react-client.js"(exports, module) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module.exports = require_index_react_client();
    } else {
      module.exports = require_index_react_client2();
    }
  }
});

// src/accordion.tsx
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronRight } from "lucide-react";
import * as React from "react";

// src/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/accordion.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var Accordion = AccordionPrimitive.Root;
var AccordionItem = React.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx(AccordionPrimitive.Item, __spreadValues({ ref, className: cn("border-b", className) }, props));
});
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = React.forwardRef((_a2, ref) => {
  var _b = _a2, { className, children } = _b, props = __objRest(_b, ["className", "children"]);
  return /* @__PURE__ */ jsx(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs(
    AccordionPrimitive.Trigger,
    __spreadProps(__spreadValues({
      ref,
      className: cn(
        "flex flex-1 items-center justify-between py-5 text-left text-lg font-medium transition-all hover:no-underline [&[data-state=open]>svg]:rotate-90",
        className
      )
    }, props), {
      children: [
        children,
        /* @__PURE__ */ jsx(ChevronRight, { className: "size-4 shrink-0 transition-transform duration-200" })
      ]
    })
  ) });
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
var AccordionContent = React.forwardRef((_a2, ref) => {
  var _b = _a2, { className, children } = _b, props = __objRest(_b, ["className", "children"]);
  return /* @__PURE__ */ jsx(
    AccordionPrimitive.Content,
    __spreadProps(__spreadValues({
      ref,
      className: "text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-base transition-all"
    }, props), {
      children: /* @__PURE__ */ jsx("div", { className: cn("pb-5 pt-0", className), children })
    })
  );
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// src/alert.tsx
import { cva } from "class-variance-authority";
import * as React2 from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
var alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        warning: "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-50 [&>svg]:text-orange-600",
        success: "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-50 [&>svg]:text-green-600"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
var Alert = React2.forwardRef((_a2, ref) => {
  var _b = _a2, { className, variant } = _b, props = __objRest(_b, ["className", "variant"]);
  return /* @__PURE__ */ jsx2("div", __spreadValues({ ref, role: "alert", className: cn(alertVariants({ variant }), className) }, props));
});
Alert.displayName = "Alert";
var AlertTitle = React2.forwardRef(
  (_a2, ref) => {
    var _b = _a2, { className, children } = _b, props = __objRest(_b, ["className", "children"]);
    return /* @__PURE__ */ jsx2(
      "h5",
      __spreadProps(__spreadValues({
        ref,
        className: cn("mb-1 font-medium leading-none tracking-tight", className)
      }, props), {
        children
      })
    );
  }
);
AlertTitle.displayName = "AlertTitle";
var AlertDescription = React2.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx2("div", __spreadValues({ ref, className: cn("text-sm [&_p]:leading-relaxed", className) }, props));
});
AlertDescription.displayName = "AlertDescription";

// src/badgeVariants.ts
import { cva as cva2 } from "class-variance-authority";
var badgeVariants = cva2(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

// src/badge.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
function Badge(_a2) {
  var _b = _a2, { className, variant } = _b, props = __objRest(_b, ["className", "variant"]);
  return /* @__PURE__ */ jsx3("div", __spreadValues({ className: cn(badgeVariants({ variant }), className) }, props));
}

// src/button.tsx
import { Slot } from "@radix-ui/react-slot";
import * as React3 from "react";

// src/buttonVariants.ts
import { cva as cva3 } from "class-variance-authority";
var buttonVariants = cva3(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

// src/button.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
var Button = React3.forwardRef(
  (_a2, ref) => {
    var _b = _a2, { className, variant, size, asChild = false } = _b, props = __objRest(_b, ["className", "variant", "size", "asChild"]);
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx4(Comp, __spreadValues({ className: cn(buttonVariants({ variant, size, className })), ref }, props));
  }
);
Button.displayName = "Button";

// src/card.tsx
import * as React4 from "react";
import { jsx as jsx5 } from "react/jsx-runtime";
var Card = React4.forwardRef(
  (_a2, ref) => {
    var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
    return /* @__PURE__ */ jsx5(
      "div",
      __spreadValues({
        ref,
        className: cn("bg-card text-card-foreground rounded-lg border shadow-sm", className)
      }, props)
    );
  }
);
Card.displayName = "Card";
var CardHeader = React4.forwardRef(
  (_a2, ref) => {
    var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
    return /* @__PURE__ */ jsx5("div", __spreadValues({ ref, className: cn("flex flex-col space-y-1.5 p-6", className) }, props));
  }
);
CardHeader.displayName = "CardHeader";
var CardTitle = React4.forwardRef(
  (_a2, ref) => {
    var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
    return /* @__PURE__ */ jsx5(
      "h3",
      __spreadValues({
        ref,
        className: cn("text-2xl font-semibold leading-none tracking-tight", className)
      }, props)
    );
  }
);
CardTitle.displayName = "CardTitle";
var CardDescription = React4.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx5("p", __spreadValues({ ref, className: cn("text-muted-foreground text-sm", className) }, props));
});
CardDescription.displayName = "CardDescription";
var CardContent = React4.forwardRef(
  (_a2, ref) => {
    var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
    return /* @__PURE__ */ jsx5("div", __spreadValues({ ref, className: cn("p-6 pt-0", className) }, props));
  }
);
CardContent.displayName = "CardContent";
var CardFooter = React4.forwardRef(
  (_a2, ref) => {
    var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
    return /* @__PURE__ */ jsx5("div", __spreadValues({ ref, className: cn("flex items-center p-6 pt-0", className) }, props));
  }
);
CardFooter.displayName = "CardFooter";

// src/checkbox.tsx
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React5 from "react";
import { jsx as jsx6 } from "react/jsx-runtime";
var Checkbox = React5.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx6(
    CheckboxPrimitive.Root,
    __spreadProps(__spreadValues({
      ref,
      className: cn(
        "border-primary ring-offset-background focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground peer h-4 w-4 shrink-0 rounded-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )
    }, props), {
      children: /* @__PURE__ */ jsx6(CheckboxPrimitive.Indicator, { className: cn("flex items-center justify-center text-current"), children: /* @__PURE__ */ jsx6(Check, { className: "size-3" }) })
    })
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// src/dialog.tsx
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React6 from "react";
import { jsx as jsx7, jsxs as jsxs2 } from "react/jsx-runtime";
var Dialog = DialogPrimitive.Root;
var DialogTrigger = DialogPrimitive.Trigger;
var DialogPortal = DialogPrimitive.Portal;
var DialogClose = DialogPrimitive.Close;
var DialogOverlay = React6.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx7(
    DialogPrimitive.Overlay,
    __spreadValues({
      ref,
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
        className
      )
    }, props)
  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
var DialogContent = React6.forwardRef((_a2, ref) => {
  var _b = _a2, { className, children } = _b, props = __objRest(_b, ["className", "children"]);
  return /* @__PURE__ */ jsxs2(DialogPortal, { children: [
    /* @__PURE__ */ jsx7(DialogOverlay, {}),
    /* @__PURE__ */ jsxs2(
      DialogPrimitive.Content,
      __spreadProps(__spreadValues({
        ref,
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg",
          className
        )
      }, props), {
        children: [
          children,
          /* @__PURE__ */ jsxs2(DialogPrimitive.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none", children: [
            /* @__PURE__ */ jsx7(X, { className: "size-4" }),
            /* @__PURE__ */ jsx7("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      })
    )
  ] });
});
DialogContent.displayName = DialogPrimitive.Content.displayName;
var DialogHeader = (_a2) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx7("div", __spreadValues({ className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className) }, props));
};
DialogHeader.displayName = "DialogHeader";
var DialogFooter = (_a2) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx7(
    "div",
    __spreadValues({
      className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)
    }, props)
  );
};
DialogFooter.displayName = "DialogFooter";
var DialogTitle = React6.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx7(
    DialogPrimitive.Title,
    __spreadValues({
      ref,
      className: cn("text-lg font-semibold leading-none tracking-tight", className)
    }, props)
  );
});
DialogTitle.displayName = DialogPrimitive.Title.displayName;
var DialogDescription = React6.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx7(
    DialogPrimitive.Description,
    __spreadValues({
      ref,
      className: cn("text-muted-foreground text-sm", className)
    }, props)
  );
});
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// src/dropdown-menu.tsx
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check as Check2, ChevronRight as ChevronRight2, Circle } from "lucide-react";
import * as React7 from "react";
import { jsx as jsx8, jsxs as jsxs3 } from "react/jsx-runtime";
var DropdownMenu = DropdownMenuPrimitive.Root;
var DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
var DropdownMenuGroup = DropdownMenuPrimitive.Group;
var DropdownMenuPortal = DropdownMenuPrimitive.Portal;
var DropdownMenuSub = DropdownMenuPrimitive.Sub;
var DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
var DropdownMenuSubTrigger = React7.forwardRef((_a2, ref) => {
  var _b = _a2, { className, inset, children } = _b, props = __objRest(_b, ["className", "inset", "children"]);
  return /* @__PURE__ */ jsxs3(
    DropdownMenuPrimitive.SubTrigger,
    __spreadProps(__spreadValues({
      ref,
      className: cn(
        "focus:bg-accent data-[state=open]:bg-accent flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        inset && "pl-8",
        className
      )
    }, props), {
      children: [
        children,
        /* @__PURE__ */ jsx8(ChevronRight2, { className: "ml-auto size-4" })
      ]
    })
  );
});
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
var DropdownMenuSubContent = React7.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx8(
    DropdownMenuPrimitive.SubContent,
    __spreadValues({
      ref,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )
    }, props)
  );
});
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
var DropdownMenuContent = React7.forwardRef((_a2, ref) => {
  var _b = _a2, { className, sideOffset = 4 } = _b, props = __objRest(_b, ["className", "sideOffset"]);
  return /* @__PURE__ */ jsx8(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx8(
    DropdownMenuPrimitive.Content,
    __spreadValues({
      ref,
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 overflow-hidden rounded-md border p-1 shadow-md",
        className
      )
    }, props)
  ) });
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
var DropdownMenuItem = React7.forwardRef((_a2, ref) => {
  var _b = _a2, { className, inset } = _b, props = __objRest(_b, ["className", "inset"]);
  return /* @__PURE__ */ jsx8(
    DropdownMenuPrimitive.Item,
    __spreadValues({
      ref,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )
    }, props)
  );
});
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
var DropdownMenuCheckboxItem = React7.forwardRef((_a2, ref) => {
  var _b = _a2, { className, children, checked } = _b, props = __objRest(_b, ["className", "children", "checked"]);
  return /* @__PURE__ */ jsxs3(
    DropdownMenuPrimitive.CheckboxItem,
    __spreadProps(__spreadValues({
      ref,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      ),
      checked
    }, props), {
      children: [
        /* @__PURE__ */ jsx8("span", { className: "absolute left-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ jsx8(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx8(Check2, { className: "size-4" }) }) }),
        children
      ]
    })
  );
});
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
var DropdownMenuRadioItem = React7.forwardRef((_a2, ref) => {
  var _b = _a2, { className, children } = _b, props = __objRest(_b, ["className", "children"]);
  return /* @__PURE__ */ jsxs3(
    DropdownMenuPrimitive.RadioItem,
    __spreadProps(__spreadValues({
      ref,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )
    }, props), {
      children: [
        /* @__PURE__ */ jsx8("span", { className: "absolute left-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ jsx8(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx8(Circle, { className: "size-2 fill-current" }) }) }),
        children
      ]
    })
  );
});
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
var DropdownMenuLabel = React7.forwardRef((_a2, ref) => {
  var _b = _a2, { className, inset } = _b, props = __objRest(_b, ["className", "inset"]);
  return /* @__PURE__ */ jsx8(
    DropdownMenuPrimitive.Label,
    __spreadValues({
      ref,
      className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)
    }, props)
  );
});
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
var DropdownMenuSeparator = React7.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx8(
    DropdownMenuPrimitive.Separator,
    __spreadValues({
      ref,
      className: cn("bg-muted -mx-1 my-1 h-px", className)
    }, props)
  );
});
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
var DropdownMenuShortcut = (_a2) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx8("span", __spreadValues({ className: cn("ml-auto text-xs tracking-widest opacity-60", className) }, props));
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// src/form.tsx
import { Slot as Slot2 } from "@radix-ui/react-slot";
import * as React11 from "react";

// ../../node_modules/react-hook-form/dist/index.esm.mjs
import * as React8 from "react";
import React__default from "react";
var isCheckBoxInput = (element) => element.type === "checkbox";
var isDateObject = (value) => value instanceof Date;
var isNullOrUndefined = (value) => value == null;
var isObjectType = (value) => typeof value === "object";
var isObject = (value) => !isNullOrUndefined(value) && !Array.isArray(value) && isObjectType(value) && !isDateObject(value);
var getEventValue = (event) => isObject(event) && event.target ? isCheckBoxInput(event.target) ? event.target.checked : event.target.value : event;
var getNodeParentName = (name) => name.substring(0, name.search(/\.\d+(\.|$)/)) || name;
var isNameInFieldArray = (names, name) => names.has(getNodeParentName(name));
var isPlainObject = (tempObject) => {
  const prototypeCopy = tempObject.constructor && tempObject.constructor.prototype;
  return isObject(prototypeCopy) && prototypeCopy.hasOwnProperty("isPrototypeOf");
};
var isWeb = typeof window !== "undefined" && typeof window.HTMLElement !== "undefined" && typeof document !== "undefined";
function cloneObject(data) {
  let copy;
  const isArray = Array.isArray(data);
  const isFileListInstance = typeof FileList !== "undefined" ? data instanceof FileList : false;
  if (data instanceof Date) {
    copy = new Date(data);
  } else if (data instanceof Set) {
    copy = new Set(data);
  } else if (!(isWeb && (data instanceof Blob || isFileListInstance)) && (isArray || isObject(data))) {
    copy = isArray ? [] : {};
    if (!isArray && !isPlainObject(data)) {
      copy = data;
    } else {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          copy[key] = cloneObject(data[key]);
        }
      }
    }
  } else {
    return data;
  }
  return copy;
}
var isKey = (value) => /^\w*$/.test(value);
var isUndefined = (val) => val === void 0;
var compact = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
var stringToPath = (input) => compact(input.replace(/["|']|\]/g, "").split(/\.|\[/));
var get = (object, path, defaultValue) => {
  if (!path || !isObject(object)) {
    return defaultValue;
  }
  const result = (isKey(path) ? [path] : stringToPath(path)).reduce((result2, key) => isNullOrUndefined(result2) ? result2 : result2[key], object);
  return isUndefined(result) || result === object ? isUndefined(object[path]) ? defaultValue : object[path] : result;
};
var isBoolean = (value) => typeof value === "boolean";
var set = (object, path, value) => {
  let index = -1;
  const tempPath = isKey(path) ? [path] : stringToPath(path);
  const length = tempPath.length;
  const lastIndex = length - 1;
  while (++index < length) {
    const key = tempPath[index];
    let newValue = value;
    if (index !== lastIndex) {
      const objValue = object[key];
      newValue = isObject(objValue) || Array.isArray(objValue) ? objValue : !isNaN(+tempPath[index + 1]) ? [] : {};
    }
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return;
    }
    object[key] = newValue;
    object = object[key];
  }
};
var EVENTS = {
  BLUR: "blur",
  FOCUS_OUT: "focusout",
  CHANGE: "change"
};
var VALIDATION_MODE = {
  onBlur: "onBlur",
  onChange: "onChange",
  onSubmit: "onSubmit",
  onTouched: "onTouched",
  all: "all"
};
var HookFormContext = React__default.createContext(null);
HookFormContext.displayName = "HookFormContext";
var useFormContext = () => React__default.useContext(HookFormContext);
var FormProvider = (props) => {
  const _a2 = props, { children } = _a2, data = __objRest(_a2, ["children"]);
  return React__default.createElement(HookFormContext.Provider, { value: data }, children);
};
var getProxyFormState = (formState, control, localProxyFormState, isRoot = true) => {
  const result = {
    defaultValues: control._defaultValues
  };
  for (const key in formState) {
    Object.defineProperty(result, key, {
      get: () => {
        const _key = key;
        if (control._proxyFormState[_key] !== VALIDATION_MODE.all) {
          control._proxyFormState[_key] = !isRoot || VALIDATION_MODE.all;
        }
        localProxyFormState && (localProxyFormState[_key] = true);
        return formState[_key];
      }
    });
  }
  return result;
};
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? React8.useLayoutEffect : React8.useEffect;
function useFormState(props) {
  const methods = useFormContext();
  const { control = methods.control, disabled, name, exact } = props || {};
  const [formState, updateFormState] = React__default.useState(control._formState);
  const _localProxyFormState = React__default.useRef({
    isDirty: false,
    isLoading: false,
    dirtyFields: false,
    touchedFields: false,
    validatingFields: false,
    isValidating: false,
    isValid: false,
    errors: false
  });
  useIsomorphicLayoutEffect(() => control._subscribe({
    name,
    formState: _localProxyFormState.current,
    exact,
    callback: (formState2) => {
      !disabled && updateFormState(__spreadValues(__spreadValues({}, control._formState), formState2));
    }
  }), [name, disabled, exact]);
  React__default.useEffect(() => {
    _localProxyFormState.current.isValid && control._setValid(true);
  }, [control]);
  return React__default.useMemo(() => getProxyFormState(formState, control, _localProxyFormState.current, false), [formState, control]);
}
var isString = (value) => typeof value === "string";
var generateWatchOutput = (names, _names, formValues, isGlobal, defaultValue) => {
  if (isString(names)) {
    isGlobal && _names.watch.add(names);
    return get(formValues, names, defaultValue);
  }
  if (Array.isArray(names)) {
    return names.map((fieldName) => (isGlobal && _names.watch.add(fieldName), get(formValues, fieldName)));
  }
  isGlobal && (_names.watchAll = true);
  return formValues;
};
function useWatch(props) {
  const methods = useFormContext();
  const { control = methods.control, name, defaultValue, disabled, exact } = props || {};
  const _defaultValue = React__default.useRef(defaultValue);
  const [value, updateValue] = React__default.useState(control._getWatch(name, _defaultValue.current));
  useIsomorphicLayoutEffect(() => control._subscribe({
    name,
    formState: {
      values: true
    },
    exact,
    callback: (formState) => !disabled && updateValue(generateWatchOutput(name, control._names, formState.values || control._formValues, false, _defaultValue.current))
  }), [name, control, disabled, exact]);
  React__default.useEffect(() => control._removeUnmounted());
  return value;
}
function useController(props) {
  const methods = useFormContext();
  const { name, disabled, control = methods.control, shouldUnregister } = props;
  const isArrayField = isNameInFieldArray(control._names.array, name);
  const value = useWatch({
    control,
    name,
    defaultValue: get(control._formValues, name, get(control._defaultValues, name, props.defaultValue)),
    exact: true
  });
  const formState = useFormState({
    control,
    name,
    exact: true
  });
  const _props = React__default.useRef(props);
  const _registerProps = React__default.useRef(control.register(name, __spreadValues(__spreadProps(__spreadValues({}, props.rules), {
    value
  }), isBoolean(props.disabled) ? { disabled: props.disabled } : {})));
  const fieldState = React__default.useMemo(() => Object.defineProperties({}, {
    invalid: {
      enumerable: true,
      get: () => !!get(formState.errors, name)
    },
    isDirty: {
      enumerable: true,
      get: () => !!get(formState.dirtyFields, name)
    },
    isTouched: {
      enumerable: true,
      get: () => !!get(formState.touchedFields, name)
    },
    isValidating: {
      enumerable: true,
      get: () => !!get(formState.validatingFields, name)
    },
    error: {
      enumerable: true,
      get: () => get(formState.errors, name)
    }
  }), [formState, name]);
  const onChange = React__default.useCallback((event) => _registerProps.current.onChange({
    target: {
      value: getEventValue(event),
      name
    },
    type: EVENTS.CHANGE
  }), [name]);
  const onBlur = React__default.useCallback(() => _registerProps.current.onBlur({
    target: {
      value: get(control._formValues, name),
      name
    },
    type: EVENTS.BLUR
  }), [name, control._formValues]);
  const ref = React__default.useCallback((elm) => {
    const field2 = get(control._fields, name);
    if (field2 && elm) {
      field2._f.ref = {
        focus: () => elm.focus && elm.focus(),
        select: () => elm.select && elm.select(),
        setCustomValidity: (message) => elm.setCustomValidity(message),
        reportValidity: () => elm.reportValidity()
      };
    }
  }, [control._fields, name]);
  const field = React__default.useMemo(() => __spreadProps(__spreadValues({
    name,
    value
  }, isBoolean(disabled) || formState.disabled ? { disabled: formState.disabled || disabled } : {}), {
    onChange,
    onBlur,
    ref
  }), [name, disabled, formState.disabled, onChange, onBlur, ref, value]);
  React__default.useEffect(() => {
    const _shouldUnregisterField = control._options.shouldUnregister || shouldUnregister;
    control.register(name, __spreadValues(__spreadValues({}, _props.current.rules), isBoolean(_props.current.disabled) ? { disabled: _props.current.disabled } : {}));
    const updateMounted = (name2, value2) => {
      const field2 = get(control._fields, name2);
      if (field2 && field2._f) {
        field2._f.mount = value2;
      }
    };
    updateMounted(name, true);
    if (_shouldUnregisterField) {
      const value2 = cloneObject(get(control._options.defaultValues, name));
      set(control._defaultValues, name, value2);
      if (isUndefined(get(control._formValues, name))) {
        set(control._formValues, name, value2);
      }
    }
    !isArrayField && control.register(name);
    return () => {
      (isArrayField ? _shouldUnregisterField && !control._state.action : _shouldUnregisterField) ? control.unregister(name) : updateMounted(name, false);
    };
  }, [name, control, isArrayField, shouldUnregister]);
  React__default.useEffect(() => {
    control._setDisabledField({
      disabled,
      name
    });
  }, [disabled, name, control]);
  return React__default.useMemo(() => ({
    field,
    formState,
    fieldState
  }), [field, formState, fieldState]);
}
var Controller = (props) => props.render(useController(props));
var defaultOptions = {
  mode: VALIDATION_MODE.onSubmit,
  reValidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true
};

// src/label.tsx
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva as cva4 } from "class-variance-authority";
import * as React9 from "react";
import { jsx as jsx9 } from "react/jsx-runtime";
var labelVariants = cva4(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
var Label2 = React9.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx9(LabelPrimitive.Root, __spreadValues({ ref, className: cn(labelVariants(), className) }, props));
});
Label2.displayName = LabelPrimitive.Root.displayName;

// src/useFormField.ts
import React10 from "react";
var FormFieldContext = React10.createContext(
  {}
);
var FormItemContext = React10.createContext(
  {}
);
var useFormField = () => {
  const fieldContext = React10.useContext(FormFieldContext);
  const itemContext = React10.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const { id } = itemContext;
  return __spreadValues({
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`
  }, fieldState);
};

// src/form.tsx
import { jsx as jsx10 } from "react/jsx-runtime";
var Form = FormProvider;
var FormField = (_a2) => {
  var props = __objRest(_a2, []);
  const formFieldName = React11.useMemo(() => ({ name: props.name }), []);
  return /* @__PURE__ */ jsx10(FormFieldContext.Provider, { value: formFieldName, children: /* @__PURE__ */ jsx10(Controller, __spreadValues({}, props)) });
};
var FormItem = React11.forwardRef(
  (_a2, ref) => {
    var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
    const id = React11.useId();
    const formItemId = React11.useMemo(() => ({ id }), []);
    return /* @__PURE__ */ jsx10(FormItemContext.Provider, { value: formItemId, children: /* @__PURE__ */ jsx10("div", __spreadValues({ ref, className: cn("space-y-2", className) }, props)) });
  }
);
FormItem.displayName = "FormItem";
var FormLabel = React11.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  const { error, formItemId } = useFormField();
  return /* @__PURE__ */ jsx10(
    Label2,
    __spreadValues({
      ref,
      className: cn(error && "text-destructive", className),
      htmlFor: formItemId
    }, props)
  );
});
FormLabel.displayName = "FormLabel";
var FormControl = React11.forwardRef((_a2, ref) => {
  var props = __objRest(_a2, []);
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return /* @__PURE__ */ jsx10(
    Slot2,
    __spreadValues({
      ref,
      id: formItemId,
      "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error
    }, props)
  );
});
FormControl.displayName = "FormControl";
var FormDescription = React11.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsx10(
    "p",
    __spreadValues({
      ref,
      id: formDescriptionId,
      className: cn("text-muted-foreground text-sm", className)
    }, props)
  );
});
FormDescription.displayName = "FormDescription";
var FormMessage = React11.forwardRef((_a2, ref) => {
  var _b = _a2, { className, children } = _b, props = __objRest(_b, ["className", "children"]);
  const { error, formMessageId } = useFormField();
  const body = error ? String(error == null ? void 0 : error.message) : children;
  if (!body) {
    return null;
  }
  return /* @__PURE__ */ jsx10(
    "p",
    __spreadProps(__spreadValues({
      ref,
      id: formMessageId,
      className: cn("text-destructive text-sm font-medium", className)
    }, props), {
      children: body
    })
  );
});
FormMessage.displayName = "FormMessage";

// src/input.tsx
import * as React12 from "react";
import { jsx as jsx11 } from "react/jsx-runtime";
var Input = React12.forwardRef(
  (_a2, ref) => {
    var _b = _a2, { className, type } = _b, props = __objRest(_b, ["className", "type"]);
    return /* @__PURE__ */ jsx11(
      "input",
      __spreadValues({
        type,
        className: cn(
          "border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref
      }, props)
    );
  }
);
Input.displayName = "Input";

// src/modal.tsx
import { useEffect as useEffect2, useRef } from "react";
import { jsx as jsx12, jsxs as jsxs4 } from "react/jsx-runtime";
function Modal({ isOpen, onClose, title, children, showCloseButton = true }) {
  const modalRef = useRef(null);
  useEffect2(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx12("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50", children: /* @__PURE__ */ jsxs4(
    "div",
    {
      ref: modalRef,
      className: "relative mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl",
      children: [
        (title || showCloseButton) && /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between border-b p-4", children: [
          title && /* @__PURE__ */ jsx12("h2", { className: "text-lg font-semibold", children: title }),
          showCloseButton && /* @__PURE__ */ jsx12(
            "button",
            {
              type: "button",
              onClick: onClose,
              className: "text-gray-400 transition-colors hover:text-gray-600",
              children: /* @__PURE__ */ jsx12("svg", { className: "size-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx12(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M6 18L18 6M6 6l12 12"
                }
              ) })
            }
          )
        ] }),
        /* @__PURE__ */ jsx12("div", { className: "p-4", children })
      ]
    }
  ) });
}
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default"
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  return /* @__PURE__ */ jsx12(Modal, { isOpen, onClose, title, showCloseButton: false, children: /* @__PURE__ */ jsxs4("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx12("p", { className: "text-gray-700", children: message }),
    /* @__PURE__ */ jsxs4("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx12(
        "button",
        {
          type: "button",
          onClick: onClose,
          className: "rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200",
          children: cancelText
        }
      ),
      /* @__PURE__ */ jsx12(
        "button",
        {
          type: "button",
          onClick: handleConfirm,
          className: `rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`,
          children: confirmText
        }
      )
    ] })
  ] }) });
}
function AlertModal({ isOpen, onClose, title, message, variant = "info" }) {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return /* @__PURE__ */ jsx12("div", { className: "mx-auto flex size-12 items-center justify-center rounded-full bg-green-100", children: /* @__PURE__ */ jsx12(
          "svg",
          {
            className: "size-6 text-green-600",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx12(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M5 13l4 4L19 7"
              }
            )
          }
        ) });
      case "error":
        return /* @__PURE__ */ jsx12("div", { className: "mx-auto flex size-12 items-center justify-center rounded-full bg-red-100", children: /* @__PURE__ */ jsx12(
          "svg",
          {
            className: "size-6 text-red-600",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx12(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              }
            )
          }
        ) });
      default:
        return /* @__PURE__ */ jsx12("div", { className: "mx-auto flex size-12 items-center justify-center rounded-full bg-blue-100", children: /* @__PURE__ */ jsx12(
          "svg",
          {
            className: "size-6 text-blue-600",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx12(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              }
            )
          }
        ) });
    }
  };
  const getDefaultTitle = () => {
    switch (variant) {
      case "success":
        return "Success";
      case "error":
        return "Error";
      default:
        return "Information";
    }
  };
  return /* @__PURE__ */ jsx12(Modal, { isOpen, onClose, showCloseButton: false, children: /* @__PURE__ */ jsxs4("div", { className: "space-y-4 text-center", children: [
    getIcon(),
    /* @__PURE__ */ jsx12("h3", { className: "text-lg font-medium text-gray-900", children: title || getDefaultTitle() }),
    /* @__PURE__ */ jsx12("p", { className: "text-sm text-gray-600", children: message }),
    /* @__PURE__ */ jsx12(
      "button",
      {
        type: "button",
        onClick: onClose,
        className: "w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700",
        children: "OK"
      }
    )
  ] }) });
}

// ../../node_modules/@radix-ui/react-progress/dist/index.mjs
import * as React15 from "react";

// ../../node_modules/@radix-ui/react-context/dist/index.mjs
import * as React13 from "react";
import { jsx as jsx13 } from "react/jsx-runtime";
function createContextScope(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext3(rootComponentName, defaultContext) {
    const BaseContext = React13.createContext(defaultContext);
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    const Provider3 = (props) => {
      var _b;
      const _a2 = props, { scope, children } = _a2, context = __objRest(_a2, ["scope", "children"]);
      const Context = ((_b = scope == null ? void 0 : scope[scopeName]) == null ? void 0 : _b[index]) || BaseContext;
      const value = React13.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ jsx13(Context.Provider, { value, children });
    };
    Provider3.displayName = rootComponentName + "Provider";
    function useContext2(consumerName, scope) {
      var _a2;
      const Context = ((_a2 = scope == null ? void 0 : scope[scopeName]) == null ? void 0 : _a2[index]) || BaseContext;
      const context = React13.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider3, useContext2];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return React13.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = (scope == null ? void 0 : scope[scopeName]) || scopeContexts;
      return React13.useMemo(
        () => ({ [`__scope${scopeName}`]: __spreadProps(__spreadValues({}, scope), { [scopeName]: contexts }) }),
        [scope, contexts]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
}
function composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = () => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return __spreadValues(__spreadValues({}, nextScopes2), currentScope);
      }, {});
      return React13.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}

// ../../node_modules/@radix-ui/react-primitive/dist/index.mjs
import * as React14 from "react";
import * as ReactDOM from "react-dom";
import { createSlot } from "@radix-ui/react-slot";
import { jsx as jsx14 } from "react/jsx-runtime";
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot3 = createSlot(`Primitive.${node}`);
  const Node = React14.forwardRef((props, forwardedRef) => {
    const _a2 = props, { asChild } = _a2, primitiveProps = __objRest(_a2, ["asChild"]);
    const Comp = asChild ? Slot3 : node;
    if (typeof window !== "undefined") {
      window[Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsx14(Comp, __spreadProps(__spreadValues({}, primitiveProps), { ref: forwardedRef }));
  });
  Node.displayName = `Primitive.${node}`;
  return __spreadProps(__spreadValues({}, primitive), { [node]: Node });
}, {});

// ../../node_modules/@radix-ui/react-progress/dist/index.mjs
import { jsx as jsx15 } from "react/jsx-runtime";
var PROGRESS_NAME = "Progress";
var DEFAULT_MAX = 100;
var [createProgressContext, createProgressScope] = createContextScope(PROGRESS_NAME);
var [ProgressProvider, useProgressContext] = createProgressContext(PROGRESS_NAME);
var Progress = React15.forwardRef(
  (props, forwardedRef) => {
    const _a2 = props, {
      __scopeProgress,
      value: valueProp = null,
      max: maxProp,
      getValueLabel = defaultGetValueLabel
    } = _a2, progressProps = __objRest(_a2, [
      "__scopeProgress",
      "value",
      "max",
      "getValueLabel"
    ]);
    if ((maxProp || maxProp === 0) && !isValidMaxNumber(maxProp)) {
      console.error(getInvalidMaxError(`${maxProp}`, "Progress"));
    }
    const max2 = isValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;
    if (valueProp !== null && !isValidValueNumber(valueProp, max2)) {
      console.error(getInvalidValueError(`${valueProp}`, "Progress"));
    }
    const value = isValidValueNumber(valueProp, max2) ? valueProp : null;
    const valueLabel = isNumber(value) ? getValueLabel(value, max2) : void 0;
    return /* @__PURE__ */ jsx15(ProgressProvider, { scope: __scopeProgress, value, max: max2, children: /* @__PURE__ */ jsx15(
      Primitive.div,
      __spreadProps(__spreadValues({
        "aria-valuemax": max2,
        "aria-valuemin": 0,
        "aria-valuenow": isNumber(value) ? value : void 0,
        "aria-valuetext": valueLabel,
        role: "progressbar",
        "data-state": getProgressState(value, max2),
        "data-value": value != null ? value : void 0,
        "data-max": max2
      }, progressProps), {
        ref: forwardedRef
      })
    ) });
  }
);
Progress.displayName = PROGRESS_NAME;
var INDICATOR_NAME = "ProgressIndicator";
var ProgressIndicator = React15.forwardRef(
  (props, forwardedRef) => {
    var _b;
    const _a2 = props, { __scopeProgress } = _a2, indicatorProps = __objRest(_a2, ["__scopeProgress"]);
    const context = useProgressContext(INDICATOR_NAME, __scopeProgress);
    return /* @__PURE__ */ jsx15(
      Primitive.div,
      __spreadProps(__spreadValues({
        "data-state": getProgressState(context.value, context.max),
        "data-value": (_b = context.value) != null ? _b : void 0,
        "data-max": context.max
      }, indicatorProps), {
        ref: forwardedRef
      })
    );
  }
);
ProgressIndicator.displayName = INDICATOR_NAME;
function defaultGetValueLabel(value, max2) {
  return `${Math.round(value / max2 * 100)}%`;
}
function getProgressState(value, maxValue) {
  return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading";
}
function isNumber(value) {
  return typeof value === "number";
}
function isValidMaxNumber(max2) {
  return isNumber(max2) && !isNaN(max2) && max2 > 0;
}
function isValidValueNumber(value, max2) {
  return isNumber(value) && !isNaN(value) && value <= max2 && value >= 0;
}
function getInvalidMaxError(propValue, componentName) {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
}
function getInvalidValueError(propValue, componentName) {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}
var Root6 = Progress;
var Indicator2 = ProgressIndicator;

// src/progress.tsx
import * as React16 from "react";
import { jsx as jsx16 } from "react/jsx-runtime";
var Progress2 = React16.forwardRef((_a2, ref) => {
  var _b = _a2, { className, value } = _b, props = __objRest(_b, ["className", "value"]);
  return /* @__PURE__ */ jsx16(
    Root6,
    __spreadProps(__spreadValues({
      ref,
      className: cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-200", className)
    }, props), {
      children: /* @__PURE__ */ jsx16(
        Indicator2,
        {
          className: "size-full flex-1 bg-blue-600 transition-all",
          style: { transform: `translateX(-${100 - (value || 0)}%)` }
        }
      )
    })
  );
});
Progress2.displayName = Root6.displayName;

// src/select.tsx
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check as Check3, ChevronDown } from "lucide-react";
import * as React17 from "react";
import { jsx as jsx17, jsxs as jsxs5 } from "react/jsx-runtime";
var Select = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = React17.forwardRef((_a2, ref) => {
  var _b = _a2, { className, children } = _b, props = __objRest(_b, ["className", "children"]);
  return /* @__PURE__ */ jsxs5(
    SelectPrimitive.Trigger,
    __spreadProps(__spreadValues({
      ref,
      className: cn(
        "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )
    }, props), {
      children: [
        children,
        /* @__PURE__ */ jsx17(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx17(ChevronDown, { className: "size-4 opacity-50" }) })
      ]
    })
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
var SelectContent = React17.forwardRef((_a2, ref) => {
  var _b = _a2, { className, children, position = "popper" } = _b, props = __objRest(_b, ["className", "children", "position"]);
  return /* @__PURE__ */ jsx17(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsx17(
    SelectPrimitive.Content,
    __spreadProps(__spreadValues({
      ref,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      ),
      position
    }, props), {
      children: /* @__PURE__ */ jsx17(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      )
    })
  ) });
});
SelectContent.displayName = SelectPrimitive.Content.displayName;
var SelectLabel = React17.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx17(
    SelectPrimitive.Label,
    __spreadValues({
      ref,
      className: cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)
    }, props)
  );
});
SelectLabel.displayName = SelectPrimitive.Label.displayName;
var SelectItem = React17.forwardRef((_a2, ref) => {
  var _b = _a2, { className, children } = _b, props = __objRest(_b, ["className", "children"]);
  return /* @__PURE__ */ jsxs5(
    SelectPrimitive.Item,
    __spreadProps(__spreadValues({
      ref,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )
    }, props), {
      children: [
        /* @__PURE__ */ jsx17("span", { className: "absolute left-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ jsx17(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx17(Check3, { className: "size-4" }) }) }),
        /* @__PURE__ */ jsx17(SelectPrimitive.ItemText, { children })
      ]
    })
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;
var SelectSeparator = React17.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx17(
    SelectPrimitive.Separator,
    __spreadValues({
      ref,
      className: cn("bg-muted -mx-1 my-1 h-px", className)
    }, props)
  );
});
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// src/separator.tsx
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as React18 from "react";
import { jsx as jsx18 } from "react/jsx-runtime";
var Separator3 = React18.forwardRef((_a2, ref) => {
  var _b = _a2, { className, orientation = "horizontal", decorative = true } = _b, props = __objRest(_b, ["className", "orientation", "decorative"]);
  return /* @__PURE__ */ jsx18(
    SeparatorPrimitive.Root,
    __spreadValues({
      ref,
      decorative,
      orientation,
      className: cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )
    }, props)
  );
});
Separator3.displayName = SeparatorPrimitive.Root.displayName;

// src/sheet.tsx
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva as cva5 } from "class-variance-authority";
import { X as X2 } from "lucide-react";
import * as React19 from "react";
import { jsx as jsx19, jsxs as jsxs6 } from "react/jsx-runtime";
var Sheet = SheetPrimitive.Root;
var SheetTrigger = SheetPrimitive.Trigger;
var SheetClose = SheetPrimitive.Close;
var SheetPortal = SheetPrimitive.Portal;
var SheetOverlay = React19.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx19(
    SheetPrimitive.Overlay,
    __spreadProps(__spreadValues({
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
        className
      )
    }, props), {
      ref
    })
  );
});
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
var sheetVariants = cva5(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
var SheetContent = React19.forwardRef((_a2, ref) => {
  var _b = _a2, { side = "right", className, children } = _b, props = __objRest(_b, ["side", "className", "children"]);
  return /* @__PURE__ */ jsxs6(SheetPortal, { children: [
    /* @__PURE__ */ jsx19(SheetOverlay, {}),
    /* @__PURE__ */ jsxs6(SheetPrimitive.Content, __spreadProps(__spreadValues({ ref, className: cn(sheetVariants({ side }), className) }, props), { children: [
      children,
      /* @__PURE__ */ jsxs6(SheetPrimitive.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none", children: [
        /* @__PURE__ */ jsx19(X2, { className: "size-4" }),
        /* @__PURE__ */ jsx19("span", { className: "sr-only", children: "Close" })
      ] })
    ] }))
  ] });
});
SheetContent.displayName = SheetPrimitive.Content.displayName;
var SheetHeader = (_a2) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx19("div", __spreadValues({ className: cn("flex flex-col space-y-2 text-center sm:text-left", className) }, props));
};
SheetHeader.displayName = "SheetHeader";
var SheetFooter = (_a2) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx19(
    "div",
    __spreadValues({
      className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)
    }, props)
  );
};
SheetFooter.displayName = "SheetFooter";
var SheetTitle = React19.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx19(
    SheetPrimitive.Title,
    __spreadValues({
      ref,
      className: cn("text-foreground text-lg font-semibold", className)
    }, props)
  );
});
SheetTitle.displayName = SheetPrimitive.Title.displayName;
var SheetDescription = React19.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx19(
    SheetPrimitive.Description,
    __spreadValues({
      ref,
      className: cn("text-muted-foreground text-sm", className)
    }, props)
  );
});
SheetDescription.displayName = SheetPrimitive.Description.displayName;

// src/skeleton.tsx
import { jsx as jsx20, jsxs as jsxs7 } from "react/jsx-runtime";
function Skeleton(_a2) {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx20("div", __spreadValues({ className: cn("bg-muted animate-pulse rounded-md", className) }, props));
}
function ProjectCardSkeleton() {
  return /* @__PURE__ */ jsxs7("div", { className: "space-y-3 rounded-lg border p-6", children: [
    /* @__PURE__ */ jsx20(Skeleton, { className: "h-[200px] w-full rounded-lg" }),
    /* @__PURE__ */ jsxs7("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx20(Skeleton, { className: "h-6 w-3/4" }),
      /* @__PURE__ */ jsx20(Skeleton, { className: "h-4 w-full" }),
      /* @__PURE__ */ jsx20(Skeleton, { className: "h-4 w-5/6" })
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-2 pt-2", children: [
      /* @__PURE__ */ jsx20(Skeleton, { className: "size-8 rounded-full" }),
      /* @__PURE__ */ jsx20(Skeleton, { className: "h-4 w-24" }),
      /* @__PURE__ */ jsx20(Skeleton, { className: "ml-auto h-4 w-16" })
    ] })
  ] });
}
function PlantCardSkeleton() {
  return /* @__PURE__ */ jsxs7("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx20(Skeleton, { className: "h-[160px] w-full rounded-lg" }),
    /* @__PURE__ */ jsxs7("div", { className: "space-y-2 p-3", children: [
      /* @__PURE__ */ jsx20(Skeleton, { className: "h-5 w-3/4" }),
      /* @__PURE__ */ jsx20(Skeleton, { className: "h-4 w-full" }),
      /* @__PURE__ */ jsxs7("div", { className: "mt-2 flex gap-2", children: [
        /* @__PURE__ */ jsx20(Skeleton, { className: "h-6 w-16 rounded-full" }),
        /* @__PURE__ */ jsx20(Skeleton, { className: "h-6 w-20 rounded-full" })
      ] })
    ] })
  ] });
}
function TableRowSkeleton({ columns = 4 }) {
  return /* @__PURE__ */ jsx20("tr", { className: "border-b", children: Array.from({ length: columns }).map((_, i) => /* @__PURE__ */ jsx20("td", { className: "p-4", children: /* @__PURE__ */ jsx20(Skeleton, { className: "h-4 w-full" }) }, i)) });
}
function ListItemSkeleton() {
  return /* @__PURE__ */ jsxs7("div", { className: "flex items-center space-x-4 p-4", children: [
    /* @__PURE__ */ jsx20(Skeleton, { className: "size-12 rounded-full" }),
    /* @__PURE__ */ jsxs7("div", { className: "flex-1 space-y-2", children: [
      /* @__PURE__ */ jsx20(Skeleton, { className: "h-4 w-1/4" }),
      /* @__PURE__ */ jsx20(Skeleton, { className: "h-4 w-3/4" })
    ] })
  ] });
}
function DashboardStatsSkeleton() {
  return /* @__PURE__ */ jsx20("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxs7("div", { className: "space-y-2 rounded-lg border p-6", children: [
    /* @__PURE__ */ jsx20(Skeleton, { className: "h-4 w-24" }),
    /* @__PURE__ */ jsx20(Skeleton, { className: "h-8 w-32" }),
    /* @__PURE__ */ jsx20(Skeleton, { className: "h-3 w-full" })
  ] }, i)) });
}

// src/switch.tsx
import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React20 from "react";
import { jsx as jsx21 } from "react/jsx-runtime";
var Switch = React20.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx21(
    SwitchPrimitives.Root,
    __spreadProps(__spreadValues({
      className: cn(
        "focus-visible:ring-ring focus-visible:ring-offset-background data-[state=checked]:bg-primary data-[state=unchecked]:bg-input peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )
    }, props), {
      ref,
      children: /* @__PURE__ */ jsx21(
        SwitchPrimitives.Thumb,
        {
          className: cn(
            "bg-background pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
          )
        }
      )
    })
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

// src/table.tsx
import * as React21 from "react";
import { jsx as jsx22 } from "react/jsx-runtime";
var Table = React21.forwardRef(
  (_a2, ref) => {
    var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
    return /* @__PURE__ */ jsx22("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsx22("table", __spreadValues({ ref, className: cn("w-full caption-bottom text-sm", className) }, props)) });
  }
);
Table.displayName = "Table";
var TableHeader = React21.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx22("thead", __spreadValues({ ref, className: cn("[&_tr]:border-b", className) }, props));
});
TableHeader.displayName = "TableHeader";
var TableBody = React21.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx22("tbody", __spreadValues({ ref, className: cn("[&_tr:last-child]:border-0", className) }, props));
});
TableBody.displayName = "TableBody";
var TableFooter = React21.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx22(
    "tfoot",
    __spreadValues({
      ref,
      className: cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)
    }, props)
  );
});
TableFooter.displayName = "TableFooter";
var TableRow = React21.forwardRef(
  (_a2, ref) => {
    var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
    return /* @__PURE__ */ jsx22(
      "tr",
      __spreadValues({
        ref,
        className: cn(
          "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
          className
        )
      }, props)
    );
  }
);
TableRow.displayName = "TableRow";
var TableHead = React21.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx22(
    "th",
    __spreadValues({
      ref,
      className: cn(
        "text-muted-foreground h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0",
        className
      )
    }, props)
  );
});
TableHead.displayName = "TableHead";
var TableCell = React21.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx22(
    "td",
    __spreadValues({
      ref,
      className: cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)
    }, props)
  );
});
TableCell.displayName = "TableCell";
var TableCaption = React21.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx22("caption", __spreadValues({ ref, className: cn("text-muted-foreground mt-4 text-sm", className) }, props));
});
TableCaption.displayName = "TableCaption";

// src/tabs.tsx
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React22 from "react";
import { jsx as jsx23 } from "react/jsx-runtime";
var Tabs = TabsPrimitive.Root;
var TabsList = React22.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx23(
    TabsPrimitive.List,
    __spreadValues({
      ref,
      className: cn(
        "bg-muted text-muted-foreground inline-flex items-center justify-center rounded-md p-1",
        className
      )
    }, props)
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;
var TabsTrigger = React22.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx23(
    TabsPrimitive.Trigger,
    __spreadValues({
      ref,
      className: cn(
        "ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex min-w-[80px] items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )
    }, props)
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
var TabsContent = React22.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx23(
    TabsPrimitive.Content,
    __spreadValues({
      ref,
      className: cn(
        "ring-offset-background focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className
      )
    }, props)
  );
});
TabsContent.displayName = TabsPrimitive.Content.displayName;

// src/textarea.tsx
import * as React23 from "react";
import { jsx as jsx24 } from "react/jsx-runtime";
var Textarea = React23.forwardRef(
  (_a2, ref) => {
    var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
    return /* @__PURE__ */ jsx24(
      "textarea",
      __spreadValues({
        className: cn(
          "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref
      }, props)
    );
  }
);
Textarea.displayName = "Textarea";

// src/toast.tsx
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva as cva6 } from "class-variance-authority";
import { X as X3 } from "lucide-react";
import * as React24 from "react";
import { jsx as jsx25 } from "react/jsx-runtime";
var ToastProvider = ToastPrimitives.Provider;
var ToastViewport = React24.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx25(
    ToastPrimitives.Viewport,
    __spreadValues({
      ref,
      className: cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )
    }, props)
  );
});
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
var toastVariants = cva6(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
var Toast = React24.forwardRef((_a2, ref) => {
  var _b = _a2, { className, variant } = _b, props = __objRest(_b, ["className", "variant"]);
  return /* @__PURE__ */ jsx25(
    ToastPrimitives.Root,
    __spreadValues({
      ref,
      className: cn(toastVariants({ variant }), className)
    }, props)
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;
var ToastAction = React24.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx25(
    ToastPrimitives.Action,
    __spreadValues({
      ref,
      className: cn(
        "ring-offset-background hover:bg-secondary focus:ring-ring group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )
    }, props)
  );
});
ToastAction.displayName = ToastPrimitives.Action.displayName;
var ToastClose = React24.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx25(
    ToastPrimitives.Close,
    __spreadProps(__spreadValues({
      ref,
      className: cn(
        "text-foreground/50 hover:text-foreground absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
        className
      ),
      "toast-close": ""
    }, props), {
      children: /* @__PURE__ */ jsx25(X3, { className: "size-4" })
    })
  );
});
ToastClose.displayName = ToastPrimitives.Close.displayName;
var ToastTitle = React24.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx25(ToastPrimitives.Title, __spreadValues({ ref, className: cn("text-sm font-semibold", className) }, props));
});
ToastTitle.displayName = ToastPrimitives.Title.displayName;
var ToastDescription = React24.forwardRef((_a2, ref) => {
  var _b = _a2, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx25(
    ToastPrimitives.Description,
    __spreadValues({
      ref,
      className: cn("text-sm opacity-90", className)
    }, props)
  );
});
ToastDescription.displayName = ToastPrimitives.Description.displayName;

// src/use-toast.ts
import * as React25 from "react";
var TOAST_LIMIT = 1;
var TOAST_REMOVE_DELAY = 1e6;
var count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
var toastTimeouts = /* @__PURE__ */ new Map();
var addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
var reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return __spreadProps(__spreadValues({}, state), {
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      });
    case "UPDATE_TOAST":
      return __spreadProps(__spreadValues({}, state), {
        toasts: state.toasts.map((t) => t.id === action.toast.id ? __spreadValues(__spreadValues({}, t), action.toast) : t)
      });
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return __spreadProps(__spreadValues({}, state), {
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? __spreadProps(__spreadValues({}, t), {
            open: false
          }) : t
        )
      });
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return __spreadProps(__spreadValues({}, state), {
          toasts: []
        });
      }
      return __spreadProps(__spreadValues({}, state), {
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      });
  }
};
var listeners = [];
var memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast(_a2) {
  var props = __objRest(_a2, []);
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: __spreadProps(__spreadValues({}, props2), { id })
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: __spreadProps(__spreadValues({}, props), {
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    })
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React25.useState(memoryState);
  React25.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return __spreadProps(__spreadValues({}, state), {
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  });
}

// src/toaster.tsx
import { jsx as jsx26, jsxs as jsxs8 } from "react/jsx-runtime";
function Toaster() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs8(ToastProvider, { children: [
    toasts.map((_a2) => {
      var _b = _a2, { id, title, description, action } = _b, props = __objRest(_b, ["id", "title", "description", "action"]);
      return /* @__PURE__ */ jsxs8(Toast, __spreadProps(__spreadValues({}, props), { children: [
        /* @__PURE__ */ jsxs8("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsx26(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsx26(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsx26(ToastClose, {})
      ] }), id);
    }),
    /* @__PURE__ */ jsx26(ToastViewport, {})
  ] });
}

// src/tooltip.tsx
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React26 from "react";
import { jsx as jsx27 } from "react/jsx-runtime";
var TooltipProvider = TooltipPrimitive.Provider;
var Tooltip = TooltipPrimitive.Root;
var TooltipTrigger = TooltipPrimitive.Trigger;
var TooltipContent = React26.forwardRef((_a2, ref) => {
  var _b = _a2, { className, sideOffset = 4 } = _b, props = __objRest(_b, ["className", "sideOffset"]);
  return /* @__PURE__ */ jsx27(
    TooltipPrimitive.Content,
    __spreadValues({
      ref,
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-md",
        className
      )
    }, props)
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// ../../node_modules/@tanstack/react-table/build/lib/index.mjs
import * as React27 from "react";

// ../../node_modules/@tanstack/table-core/build/lib/index.mjs
function functionalUpdate(updater, input) {
  return typeof updater === "function" ? updater(input) : updater;
}
function makeStateUpdater(key, instance) {
  return (updater) => {
    instance.setState((old) => {
      return __spreadProps(__spreadValues({}, old), {
        [key]: functionalUpdate(updater, old[key])
      });
    });
  };
}
function isFunction(d) {
  return d instanceof Function;
}
function isNumberArray(d) {
  return Array.isArray(d) && d.every((val) => typeof val === "number");
}
function flattenBy(arr, getChildren) {
  const flat = [];
  const recurse = (subArr) => {
    subArr.forEach((item) => {
      flat.push(item);
      const children = getChildren(item);
      if (children != null && children.length) {
        recurse(children);
      }
    });
  };
  recurse(arr);
  return flat;
}
function memo(getDeps, fn, opts) {
  let deps = [];
  let result;
  return (depArgs) => {
    let depTime;
    if (opts.key && opts.debug) depTime = Date.now();
    const newDeps = getDeps(depArgs);
    const depsChanged = newDeps.length !== deps.length || newDeps.some((dep, index) => deps[index] !== dep);
    if (!depsChanged) {
      return result;
    }
    deps = newDeps;
    let resultTime;
    if (opts.key && opts.debug) resultTime = Date.now();
    result = fn(...newDeps);
    opts == null || opts.onChange == null || opts.onChange(result);
    if (opts.key && opts.debug) {
      if (opts != null && opts.debug()) {
        const depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
        const resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
        const resultFpsPercentage = resultEndTime / 16;
        const pad = (str, num) => {
          str = String(str);
          while (str.length < num) {
            str = " " + str;
          }
          return str;
        };
        console.info(`%c\u23F1 ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`, `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * resultFpsPercentage, 120))}deg 100% 31%);`, opts == null ? void 0 : opts.key);
      }
    }
    return result;
  };
}
function getMemoOptions(tableOptions, debugLevel, key, onChange) {
  return {
    debug: () => {
      var _tableOptions$debugAl;
      return (_tableOptions$debugAl = tableOptions == null ? void 0 : tableOptions.debugAll) != null ? _tableOptions$debugAl : tableOptions[debugLevel];
    },
    key: process.env.NODE_ENV === "development" && key,
    onChange
  };
}
function createCell(table, row, column, columnId) {
  const getRenderValue = () => {
    var _cell$getValue;
    return (_cell$getValue = cell.getValue()) != null ? _cell$getValue : table.options.renderFallbackValue;
  };
  const cell = {
    id: `${row.id}_${column.id}`,
    row,
    column,
    getValue: () => row.getValue(columnId),
    renderValue: getRenderValue,
    getContext: memo(() => [table, column, row, cell], (table2, column2, row2, cell2) => ({
      table: table2,
      column: column2,
      row: row2,
      cell: cell2,
      getValue: cell2.getValue,
      renderValue: cell2.renderValue
    }), getMemoOptions(table.options, "debugCells", "cell.getContext"))
  };
  table._features.forEach((feature) => {
    feature.createCell == null || feature.createCell(cell, column, row, table);
  }, {});
  return cell;
}
function createColumn(table, columnDef, depth, parent) {
  var _ref, _resolvedColumnDef$id;
  const defaultColumn = table._getDefaultColumnDef();
  const resolvedColumnDef = __spreadValues(__spreadValues({}, defaultColumn), columnDef);
  const accessorKey = resolvedColumnDef.accessorKey;
  let id = (_ref = (_resolvedColumnDef$id = resolvedColumnDef.id) != null ? _resolvedColumnDef$id : accessorKey ? typeof String.prototype.replaceAll === "function" ? accessorKey.replaceAll(".", "_") : accessorKey.replace(/\./g, "_") : void 0) != null ? _ref : typeof resolvedColumnDef.header === "string" ? resolvedColumnDef.header : void 0;
  let accessorFn;
  if (resolvedColumnDef.accessorFn) {
    accessorFn = resolvedColumnDef.accessorFn;
  } else if (accessorKey) {
    if (accessorKey.includes(".")) {
      accessorFn = (originalRow) => {
        let result = originalRow;
        for (const key of accessorKey.split(".")) {
          var _result;
          result = (_result = result) == null ? void 0 : _result[key];
          if (process.env.NODE_ENV !== "production" && result === void 0) {
            console.warn(`"${key}" in deeply nested key "${accessorKey}" returned undefined.`);
          }
        }
        return result;
      };
    } else {
      accessorFn = (originalRow) => originalRow[resolvedColumnDef.accessorKey];
    }
  }
  if (!id) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(resolvedColumnDef.accessorFn ? `Columns require an id when using an accessorFn` : `Columns require an id when using a non-string header`);
    }
    throw new Error();
  }
  let column = {
    id: `${String(id)}`,
    accessorFn,
    parent,
    depth,
    columnDef: resolvedColumnDef,
    columns: [],
    getFlatColumns: memo(() => [true], () => {
      var _column$columns;
      return [column, ...(_column$columns = column.columns) == null ? void 0 : _column$columns.flatMap((d) => d.getFlatColumns())];
    }, getMemoOptions(table.options, "debugColumns", "column.getFlatColumns")),
    getLeafColumns: memo(() => [table._getOrderColumnsFn()], (orderColumns2) => {
      var _column$columns2;
      if ((_column$columns2 = column.columns) != null && _column$columns2.length) {
        let leafColumns = column.columns.flatMap((column2) => column2.getLeafColumns());
        return orderColumns2(leafColumns);
      }
      return [column];
    }, getMemoOptions(table.options, "debugColumns", "column.getLeafColumns"))
  };
  for (const feature of table._features) {
    feature.createColumn == null || feature.createColumn(column, table);
  }
  return column;
}
var debug = "debugHeaders";
function createHeader(table, column, options) {
  var _options$id;
  const id = (_options$id = options.id) != null ? _options$id : column.id;
  let header = {
    id,
    column,
    index: options.index,
    isPlaceholder: !!options.isPlaceholder,
    placeholderId: options.placeholderId,
    depth: options.depth,
    subHeaders: [],
    colSpan: 0,
    rowSpan: 0,
    headerGroup: null,
    getLeafHeaders: () => {
      const leafHeaders = [];
      const recurseHeader = (h) => {
        if (h.subHeaders && h.subHeaders.length) {
          h.subHeaders.map(recurseHeader);
        }
        leafHeaders.push(h);
      };
      recurseHeader(header);
      return leafHeaders;
    },
    getContext: () => ({
      table,
      header,
      column
    })
  };
  table._features.forEach((feature) => {
    feature.createHeader == null || feature.createHeader(header, table);
  });
  return header;
}
var Headers = {
  createTable: (table) => {
    table.getHeaderGroups = memo(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allColumns, leafColumns, left, right) => {
      var _left$map$filter, _right$map$filter;
      const leftColumns = (_left$map$filter = left == null ? void 0 : left.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _left$map$filter : [];
      const rightColumns = (_right$map$filter = right == null ? void 0 : right.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _right$map$filter : [];
      const centerColumns = leafColumns.filter((column) => !(left != null && left.includes(column.id)) && !(right != null && right.includes(column.id)));
      const headerGroups = buildHeaderGroups(allColumns, [...leftColumns, ...centerColumns, ...rightColumns], table);
      return headerGroups;
    }, getMemoOptions(table.options, debug, "getHeaderGroups"));
    table.getCenterHeaderGroups = memo(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allColumns, leafColumns, left, right) => {
      leafColumns = leafColumns.filter((column) => !(left != null && left.includes(column.id)) && !(right != null && right.includes(column.id)));
      return buildHeaderGroups(allColumns, leafColumns, table, "center");
    }, getMemoOptions(table.options, debug, "getCenterHeaderGroups"));
    table.getLeftHeaderGroups = memo(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.left], (allColumns, leafColumns, left) => {
      var _left$map$filter2;
      const orderedLeafColumns = (_left$map$filter2 = left == null ? void 0 : left.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _left$map$filter2 : [];
      return buildHeaderGroups(allColumns, orderedLeafColumns, table, "left");
    }, getMemoOptions(table.options, debug, "getLeftHeaderGroups"));
    table.getRightHeaderGroups = memo(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.right], (allColumns, leafColumns, right) => {
      var _right$map$filter2;
      const orderedLeafColumns = (_right$map$filter2 = right == null ? void 0 : right.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _right$map$filter2 : [];
      return buildHeaderGroups(allColumns, orderedLeafColumns, table, "right");
    }, getMemoOptions(table.options, debug, "getRightHeaderGroups"));
    table.getFooterGroups = memo(() => [table.getHeaderGroups()], (headerGroups) => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug, "getFooterGroups"));
    table.getLeftFooterGroups = memo(() => [table.getLeftHeaderGroups()], (headerGroups) => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug, "getLeftFooterGroups"));
    table.getCenterFooterGroups = memo(() => [table.getCenterHeaderGroups()], (headerGroups) => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug, "getCenterFooterGroups"));
    table.getRightFooterGroups = memo(() => [table.getRightHeaderGroups()], (headerGroups) => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug, "getRightFooterGroups"));
    table.getFlatHeaders = memo(() => [table.getHeaderGroups()], (headerGroups) => {
      return headerGroups.map((headerGroup) => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug, "getFlatHeaders"));
    table.getLeftFlatHeaders = memo(() => [table.getLeftHeaderGroups()], (left) => {
      return left.map((headerGroup) => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug, "getLeftFlatHeaders"));
    table.getCenterFlatHeaders = memo(() => [table.getCenterHeaderGroups()], (left) => {
      return left.map((headerGroup) => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug, "getCenterFlatHeaders"));
    table.getRightFlatHeaders = memo(() => [table.getRightHeaderGroups()], (left) => {
      return left.map((headerGroup) => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug, "getRightFlatHeaders"));
    table.getCenterLeafHeaders = memo(() => [table.getCenterFlatHeaders()], (flatHeaders) => {
      return flatHeaders.filter((header) => {
        var _header$subHeaders;
        return !((_header$subHeaders = header.subHeaders) != null && _header$subHeaders.length);
      });
    }, getMemoOptions(table.options, debug, "getCenterLeafHeaders"));
    table.getLeftLeafHeaders = memo(() => [table.getLeftFlatHeaders()], (flatHeaders) => {
      return flatHeaders.filter((header) => {
        var _header$subHeaders2;
        return !((_header$subHeaders2 = header.subHeaders) != null && _header$subHeaders2.length);
      });
    }, getMemoOptions(table.options, debug, "getLeftLeafHeaders"));
    table.getRightLeafHeaders = memo(() => [table.getRightFlatHeaders()], (flatHeaders) => {
      return flatHeaders.filter((header) => {
        var _header$subHeaders3;
        return !((_header$subHeaders3 = header.subHeaders) != null && _header$subHeaders3.length);
      });
    }, getMemoOptions(table.options, debug, "getRightLeafHeaders"));
    table.getLeafHeaders = memo(() => [table.getLeftHeaderGroups(), table.getCenterHeaderGroups(), table.getRightHeaderGroups()], (left, center, right) => {
      var _left$0$headers, _left$, _center$0$headers, _center$, _right$0$headers, _right$;
      return [...(_left$0$headers = (_left$ = left[0]) == null ? void 0 : _left$.headers) != null ? _left$0$headers : [], ...(_center$0$headers = (_center$ = center[0]) == null ? void 0 : _center$.headers) != null ? _center$0$headers : [], ...(_right$0$headers = (_right$ = right[0]) == null ? void 0 : _right$.headers) != null ? _right$0$headers : []].map((header) => {
        return header.getLeafHeaders();
      }).flat();
    }, getMemoOptions(table.options, debug, "getLeafHeaders"));
  }
};
function buildHeaderGroups(allColumns, columnsToGroup, table, headerFamily) {
  var _headerGroups$0$heade, _headerGroups$;
  let maxDepth = 0;
  const findMaxDepth = function(columns, depth) {
    if (depth === void 0) {
      depth = 1;
    }
    maxDepth = Math.max(maxDepth, depth);
    columns.filter((column) => column.getIsVisible()).forEach((column) => {
      var _column$columns;
      if ((_column$columns = column.columns) != null && _column$columns.length) {
        findMaxDepth(column.columns, depth + 1);
      }
    }, 0);
  };
  findMaxDepth(allColumns);
  let headerGroups = [];
  const createHeaderGroup = (headersToGroup, depth) => {
    const headerGroup = {
      depth,
      id: [headerFamily, `${depth}`].filter(Boolean).join("_"),
      headers: []
    };
    const pendingParentHeaders = [];
    headersToGroup.forEach((headerToGroup) => {
      const latestPendingParentHeader = [...pendingParentHeaders].reverse()[0];
      const isLeafHeader = headerToGroup.column.depth === headerGroup.depth;
      let column;
      let isPlaceholder = false;
      if (isLeafHeader && headerToGroup.column.parent) {
        column = headerToGroup.column.parent;
      } else {
        column = headerToGroup.column;
        isPlaceholder = true;
      }
      if (latestPendingParentHeader && (latestPendingParentHeader == null ? void 0 : latestPendingParentHeader.column) === column) {
        latestPendingParentHeader.subHeaders.push(headerToGroup);
      } else {
        const header = createHeader(table, column, {
          id: [headerFamily, depth, column.id, headerToGroup == null ? void 0 : headerToGroup.id].filter(Boolean).join("_"),
          isPlaceholder,
          placeholderId: isPlaceholder ? `${pendingParentHeaders.filter((d) => d.column === column).length}` : void 0,
          depth,
          index: pendingParentHeaders.length
        });
        header.subHeaders.push(headerToGroup);
        pendingParentHeaders.push(header);
      }
      headerGroup.headers.push(headerToGroup);
      headerToGroup.headerGroup = headerGroup;
    });
    headerGroups.push(headerGroup);
    if (depth > 0) {
      createHeaderGroup(pendingParentHeaders, depth - 1);
    }
  };
  const bottomHeaders = columnsToGroup.map((column, index) => createHeader(table, column, {
    depth: maxDepth,
    index
  }));
  createHeaderGroup(bottomHeaders, maxDepth - 1);
  headerGroups.reverse();
  const recurseHeadersForSpans = (headers) => {
    const filteredHeaders = headers.filter((header) => header.column.getIsVisible());
    return filteredHeaders.map((header) => {
      let colSpan = 0;
      let rowSpan = 0;
      let childRowSpans = [0];
      if (header.subHeaders && header.subHeaders.length) {
        childRowSpans = [];
        recurseHeadersForSpans(header.subHeaders).forEach((_ref) => {
          let {
            colSpan: childColSpan,
            rowSpan: childRowSpan
          } = _ref;
          colSpan += childColSpan;
          childRowSpans.push(childRowSpan);
        });
      } else {
        colSpan = 1;
      }
      const minChildRowSpan = Math.min(...childRowSpans);
      rowSpan = rowSpan + minChildRowSpan;
      header.colSpan = colSpan;
      header.rowSpan = rowSpan;
      return {
        colSpan,
        rowSpan
      };
    });
  };
  recurseHeadersForSpans((_headerGroups$0$heade = (_headerGroups$ = headerGroups[0]) == null ? void 0 : _headerGroups$.headers) != null ? _headerGroups$0$heade : []);
  return headerGroups;
}
var createRow = (table, id, original, rowIndex, depth, subRows, parentId) => {
  let row = {
    id,
    index: rowIndex,
    original,
    depth,
    parentId,
    _valuesCache: {},
    _uniqueValuesCache: {},
    getValue: (columnId) => {
      if (row._valuesCache.hasOwnProperty(columnId)) {
        return row._valuesCache[columnId];
      }
      const column = table.getColumn(columnId);
      if (!(column != null && column.accessorFn)) {
        return void 0;
      }
      row._valuesCache[columnId] = column.accessorFn(row.original, rowIndex);
      return row._valuesCache[columnId];
    },
    getUniqueValues: (columnId) => {
      if (row._uniqueValuesCache.hasOwnProperty(columnId)) {
        return row._uniqueValuesCache[columnId];
      }
      const column = table.getColumn(columnId);
      if (!(column != null && column.accessorFn)) {
        return void 0;
      }
      if (!column.columnDef.getUniqueValues) {
        row._uniqueValuesCache[columnId] = [row.getValue(columnId)];
        return row._uniqueValuesCache[columnId];
      }
      row._uniqueValuesCache[columnId] = column.columnDef.getUniqueValues(row.original, rowIndex);
      return row._uniqueValuesCache[columnId];
    },
    renderValue: (columnId) => {
      var _row$getValue;
      return (_row$getValue = row.getValue(columnId)) != null ? _row$getValue : table.options.renderFallbackValue;
    },
    subRows: subRows != null ? subRows : [],
    getLeafRows: () => flattenBy(row.subRows, (d) => d.subRows),
    getParentRow: () => row.parentId ? table.getRow(row.parentId, true) : void 0,
    getParentRows: () => {
      let parentRows = [];
      let currentRow = row;
      while (true) {
        const parentRow = currentRow.getParentRow();
        if (!parentRow) break;
        parentRows.push(parentRow);
        currentRow = parentRow;
      }
      return parentRows.reverse();
    },
    getAllCells: memo(() => [table.getAllLeafColumns()], (leafColumns) => {
      return leafColumns.map((column) => {
        return createCell(table, row, column, column.id);
      });
    }, getMemoOptions(table.options, "debugRows", "getAllCells")),
    _getAllCellsByColumnId: memo(() => [row.getAllCells()], (allCells) => {
      return allCells.reduce((acc, cell) => {
        acc[cell.column.id] = cell;
        return acc;
      }, {});
    }, getMemoOptions(table.options, "debugRows", "getAllCellsByColumnId"))
  };
  for (let i = 0; i < table._features.length; i++) {
    const feature = table._features[i];
    feature == null || feature.createRow == null || feature.createRow(row, table);
  }
  return row;
};
var ColumnFaceting = {
  createColumn: (column, table) => {
    column._getFacetedRowModel = table.options.getFacetedRowModel && table.options.getFacetedRowModel(table, column.id);
    column.getFacetedRowModel = () => {
      if (!column._getFacetedRowModel) {
        return table.getPreFilteredRowModel();
      }
      return column._getFacetedRowModel();
    };
    column._getFacetedUniqueValues = table.options.getFacetedUniqueValues && table.options.getFacetedUniqueValues(table, column.id);
    column.getFacetedUniqueValues = () => {
      if (!column._getFacetedUniqueValues) {
        return /* @__PURE__ */ new Map();
      }
      return column._getFacetedUniqueValues();
    };
    column._getFacetedMinMaxValues = table.options.getFacetedMinMaxValues && table.options.getFacetedMinMaxValues(table, column.id);
    column.getFacetedMinMaxValues = () => {
      if (!column._getFacetedMinMaxValues) {
        return void 0;
      }
      return column._getFacetedMinMaxValues();
    };
  }
};
var includesString = (row, columnId, filterValue) => {
  var _filterValue$toString, _row$getValue;
  const search = filterValue == null || (_filterValue$toString = filterValue.toString()) == null ? void 0 : _filterValue$toString.toLowerCase();
  return Boolean((_row$getValue = row.getValue(columnId)) == null || (_row$getValue = _row$getValue.toString()) == null || (_row$getValue = _row$getValue.toLowerCase()) == null ? void 0 : _row$getValue.includes(search));
};
includesString.autoRemove = (val) => testFalsey(val);
var includesStringSensitive = (row, columnId, filterValue) => {
  var _row$getValue2;
  return Boolean((_row$getValue2 = row.getValue(columnId)) == null || (_row$getValue2 = _row$getValue2.toString()) == null ? void 0 : _row$getValue2.includes(filterValue));
};
includesStringSensitive.autoRemove = (val) => testFalsey(val);
var equalsString = (row, columnId, filterValue) => {
  var _row$getValue3;
  return ((_row$getValue3 = row.getValue(columnId)) == null || (_row$getValue3 = _row$getValue3.toString()) == null ? void 0 : _row$getValue3.toLowerCase()) === (filterValue == null ? void 0 : filterValue.toLowerCase());
};
equalsString.autoRemove = (val) => testFalsey(val);
var arrIncludes = (row, columnId, filterValue) => {
  var _row$getValue4;
  return (_row$getValue4 = row.getValue(columnId)) == null ? void 0 : _row$getValue4.includes(filterValue);
};
arrIncludes.autoRemove = (val) => testFalsey(val);
var arrIncludesAll = (row, columnId, filterValue) => {
  return !filterValue.some((val) => {
    var _row$getValue5;
    return !((_row$getValue5 = row.getValue(columnId)) != null && _row$getValue5.includes(val));
  });
};
arrIncludesAll.autoRemove = (val) => testFalsey(val) || !(val != null && val.length);
var arrIncludesSome = (row, columnId, filterValue) => {
  return filterValue.some((val) => {
    var _row$getValue6;
    return (_row$getValue6 = row.getValue(columnId)) == null ? void 0 : _row$getValue6.includes(val);
  });
};
arrIncludesSome.autoRemove = (val) => testFalsey(val) || !(val != null && val.length);
var equals = (row, columnId, filterValue) => {
  return row.getValue(columnId) === filterValue;
};
equals.autoRemove = (val) => testFalsey(val);
var weakEquals = (row, columnId, filterValue) => {
  return row.getValue(columnId) == filterValue;
};
weakEquals.autoRemove = (val) => testFalsey(val);
var inNumberRange = (row, columnId, filterValue) => {
  let [min2, max2] = filterValue;
  const rowValue = row.getValue(columnId);
  return rowValue >= min2 && rowValue <= max2;
};
inNumberRange.resolveFilterValue = (val) => {
  let [unsafeMin, unsafeMax] = val;
  let parsedMin = typeof unsafeMin !== "number" ? parseFloat(unsafeMin) : unsafeMin;
  let parsedMax = typeof unsafeMax !== "number" ? parseFloat(unsafeMax) : unsafeMax;
  let min2 = unsafeMin === null || Number.isNaN(parsedMin) ? -Infinity : parsedMin;
  let max2 = unsafeMax === null || Number.isNaN(parsedMax) ? Infinity : parsedMax;
  if (min2 > max2) {
    const temp = min2;
    min2 = max2;
    max2 = temp;
  }
  return [min2, max2];
};
inNumberRange.autoRemove = (val) => testFalsey(val) || testFalsey(val[0]) && testFalsey(val[1]);
var filterFns = {
  includesString,
  includesStringSensitive,
  equalsString,
  arrIncludes,
  arrIncludesAll,
  arrIncludesSome,
  equals,
  weakEquals,
  inNumberRange
};
function testFalsey(val) {
  return val === void 0 || val === null || val === "";
}
var ColumnFiltering = {
  getDefaultColumnDef: () => {
    return {
      filterFn: "auto"
    };
  },
  getInitialState: (state) => {
    return __spreadValues({
      columnFilters: []
    }, state);
  },
  getDefaultOptions: (table) => {
    return {
      onColumnFiltersChange: makeStateUpdater("columnFilters", table),
      filterFromLeafRows: false,
      maxLeafRowFilterDepth: 100
    };
  },
  createColumn: (column, table) => {
    column.getAutoFilterFn = () => {
      const firstRow = table.getCoreRowModel().flatRows[0];
      const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
      if (typeof value === "string") {
        return filterFns.includesString;
      }
      if (typeof value === "number") {
        return filterFns.inNumberRange;
      }
      if (typeof value === "boolean") {
        return filterFns.equals;
      }
      if (value !== null && typeof value === "object") {
        return filterFns.equals;
      }
      if (Array.isArray(value)) {
        return filterFns.arrIncludes;
      }
      return filterFns.weakEquals;
    };
    column.getFilterFn = () => {
      var _table$options$filter, _table$options$filter2;
      return isFunction(column.columnDef.filterFn) ? column.columnDef.filterFn : column.columnDef.filterFn === "auto" ? column.getAutoFilterFn() : (
        // @ts-ignore
        (_table$options$filter = (_table$options$filter2 = table.options.filterFns) == null ? void 0 : _table$options$filter2[column.columnDef.filterFn]) != null ? _table$options$filter : filterFns[column.columnDef.filterFn]
      );
    };
    column.getCanFilter = () => {
      var _column$columnDef$ena, _table$options$enable, _table$options$enable2;
      return ((_column$columnDef$ena = column.columnDef.enableColumnFilter) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableColumnFilters) != null ? _table$options$enable : true) && ((_table$options$enable2 = table.options.enableFilters) != null ? _table$options$enable2 : true) && !!column.accessorFn;
    };
    column.getIsFiltered = () => column.getFilterIndex() > -1;
    column.getFilterValue = () => {
      var _table$getState$colum;
      return (_table$getState$colum = table.getState().columnFilters) == null || (_table$getState$colum = _table$getState$colum.find((d) => d.id === column.id)) == null ? void 0 : _table$getState$colum.value;
    };
    column.getFilterIndex = () => {
      var _table$getState$colum2, _table$getState$colum3;
      return (_table$getState$colum2 = (_table$getState$colum3 = table.getState().columnFilters) == null ? void 0 : _table$getState$colum3.findIndex((d) => d.id === column.id)) != null ? _table$getState$colum2 : -1;
    };
    column.setFilterValue = (value) => {
      table.setColumnFilters((old) => {
        const filterFn = column.getFilterFn();
        const previousFilter = old == null ? void 0 : old.find((d) => d.id === column.id);
        const newFilter = functionalUpdate(value, previousFilter ? previousFilter.value : void 0);
        if (shouldAutoRemoveFilter(filterFn, newFilter, column)) {
          var _old$filter;
          return (_old$filter = old == null ? void 0 : old.filter((d) => d.id !== column.id)) != null ? _old$filter : [];
        }
        const newFilterObj = {
          id: column.id,
          value: newFilter
        };
        if (previousFilter) {
          var _old$map;
          return (_old$map = old == null ? void 0 : old.map((d) => {
            if (d.id === column.id) {
              return newFilterObj;
            }
            return d;
          })) != null ? _old$map : [];
        }
        if (old != null && old.length) {
          return [...old, newFilterObj];
        }
        return [newFilterObj];
      });
    };
  },
  createRow: (row, _table) => {
    row.columnFilters = {};
    row.columnFiltersMeta = {};
  },
  createTable: (table) => {
    table.setColumnFilters = (updater) => {
      const leafColumns = table.getAllLeafColumns();
      const updateFn = (old) => {
        var _functionalUpdate;
        return (_functionalUpdate = functionalUpdate(updater, old)) == null ? void 0 : _functionalUpdate.filter((filter) => {
          const column = leafColumns.find((d) => d.id === filter.id);
          if (column) {
            const filterFn = column.getFilterFn();
            if (shouldAutoRemoveFilter(filterFn, filter.value, column)) {
              return false;
            }
          }
          return true;
        });
      };
      table.options.onColumnFiltersChange == null || table.options.onColumnFiltersChange(updateFn);
    };
    table.resetColumnFilters = (defaultState) => {
      var _table$initialState$c, _table$initialState;
      table.setColumnFilters(defaultState ? [] : (_table$initialState$c = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.columnFilters) != null ? _table$initialState$c : []);
    };
    table.getPreFilteredRowModel = () => table.getCoreRowModel();
    table.getFilteredRowModel = () => {
      if (!table._getFilteredRowModel && table.options.getFilteredRowModel) {
        table._getFilteredRowModel = table.options.getFilteredRowModel(table);
      }
      if (table.options.manualFiltering || !table._getFilteredRowModel) {
        return table.getPreFilteredRowModel();
      }
      return table._getFilteredRowModel();
    };
  }
};
function shouldAutoRemoveFilter(filterFn, value, column) {
  return (filterFn && filterFn.autoRemove ? filterFn.autoRemove(value, column) : false) || typeof value === "undefined" || typeof value === "string" && !value;
}
var sum = (columnId, _leafRows, childRows) => {
  return childRows.reduce((sum2, next) => {
    const nextValue = next.getValue(columnId);
    return sum2 + (typeof nextValue === "number" ? nextValue : 0);
  }, 0);
};
var min = (columnId, _leafRows, childRows) => {
  let min2;
  childRows.forEach((row) => {
    const value = row.getValue(columnId);
    if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
      min2 = value;
    }
  });
  return min2;
};
var max = (columnId, _leafRows, childRows) => {
  let max2;
  childRows.forEach((row) => {
    const value = row.getValue(columnId);
    if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
      max2 = value;
    }
  });
  return max2;
};
var extent = (columnId, _leafRows, childRows) => {
  let min2;
  let max2;
  childRows.forEach((row) => {
    const value = row.getValue(columnId);
    if (value != null) {
      if (min2 === void 0) {
        if (value >= value) min2 = max2 = value;
      } else {
        if (min2 > value) min2 = value;
        if (max2 < value) max2 = value;
      }
    }
  });
  return [min2, max2];
};
var mean = (columnId, leafRows) => {
  let count3 = 0;
  let sum2 = 0;
  leafRows.forEach((row) => {
    let value = row.getValue(columnId);
    if (value != null && (value = +value) >= value) {
      ++count3, sum2 += value;
    }
  });
  if (count3) return sum2 / count3;
  return;
};
var median = (columnId, leafRows) => {
  if (!leafRows.length) {
    return;
  }
  const values = leafRows.map((row) => row.getValue(columnId));
  if (!isNumberArray(values)) {
    return;
  }
  if (values.length === 1) {
    return values[0];
  }
  const mid = Math.floor(values.length / 2);
  const nums = values.sort((a, b) => a - b);
  return values.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};
var unique = (columnId, leafRows) => {
  return Array.from(new Set(leafRows.map((d) => d.getValue(columnId))).values());
};
var uniqueCount = (columnId, leafRows) => {
  return new Set(leafRows.map((d) => d.getValue(columnId))).size;
};
var count2 = (_columnId, leafRows) => {
  return leafRows.length;
};
var aggregationFns = {
  sum,
  min,
  max,
  extent,
  mean,
  median,
  unique,
  uniqueCount,
  count: count2
};
var ColumnGrouping = {
  getDefaultColumnDef: () => {
    return {
      aggregatedCell: (props) => {
        var _toString, _props$getValue;
        return (_toString = (_props$getValue = props.getValue()) == null || _props$getValue.toString == null ? void 0 : _props$getValue.toString()) != null ? _toString : null;
      },
      aggregationFn: "auto"
    };
  },
  getInitialState: (state) => {
    return __spreadValues({
      grouping: []
    }, state);
  },
  getDefaultOptions: (table) => {
    return {
      onGroupingChange: makeStateUpdater("grouping", table),
      groupedColumnMode: "reorder"
    };
  },
  createColumn: (column, table) => {
    column.toggleGrouping = () => {
      table.setGrouping((old) => {
        if (old != null && old.includes(column.id)) {
          return old.filter((d) => d !== column.id);
        }
        return [...old != null ? old : [], column.id];
      });
    };
    column.getCanGroup = () => {
      var _column$columnDef$ena, _table$options$enable;
      return ((_column$columnDef$ena = column.columnDef.enableGrouping) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableGrouping) != null ? _table$options$enable : true) && (!!column.accessorFn || !!column.columnDef.getGroupingValue);
    };
    column.getIsGrouped = () => {
      var _table$getState$group;
      return (_table$getState$group = table.getState().grouping) == null ? void 0 : _table$getState$group.includes(column.id);
    };
    column.getGroupedIndex = () => {
      var _table$getState$group2;
      return (_table$getState$group2 = table.getState().grouping) == null ? void 0 : _table$getState$group2.indexOf(column.id);
    };
    column.getToggleGroupingHandler = () => {
      const canGroup = column.getCanGroup();
      return () => {
        if (!canGroup) return;
        column.toggleGrouping();
      };
    };
    column.getAutoAggregationFn = () => {
      const firstRow = table.getCoreRowModel().flatRows[0];
      const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
      if (typeof value === "number") {
        return aggregationFns.sum;
      }
      if (Object.prototype.toString.call(value) === "[object Date]") {
        return aggregationFns.extent;
      }
    };
    column.getAggregationFn = () => {
      var _table$options$aggreg, _table$options$aggreg2;
      if (!column) {
        throw new Error();
      }
      return isFunction(column.columnDef.aggregationFn) ? column.columnDef.aggregationFn : column.columnDef.aggregationFn === "auto" ? column.getAutoAggregationFn() : (_table$options$aggreg = (_table$options$aggreg2 = table.options.aggregationFns) == null ? void 0 : _table$options$aggreg2[column.columnDef.aggregationFn]) != null ? _table$options$aggreg : aggregationFns[column.columnDef.aggregationFn];
    };
  },
  createTable: (table) => {
    table.setGrouping = (updater) => table.options.onGroupingChange == null ? void 0 : table.options.onGroupingChange(updater);
    table.resetGrouping = (defaultState) => {
      var _table$initialState$g, _table$initialState;
      table.setGrouping(defaultState ? [] : (_table$initialState$g = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.grouping) != null ? _table$initialState$g : []);
    };
    table.getPreGroupedRowModel = () => table.getFilteredRowModel();
    table.getGroupedRowModel = () => {
      if (!table._getGroupedRowModel && table.options.getGroupedRowModel) {
        table._getGroupedRowModel = table.options.getGroupedRowModel(table);
      }
      if (table.options.manualGrouping || !table._getGroupedRowModel) {
        return table.getPreGroupedRowModel();
      }
      return table._getGroupedRowModel();
    };
  },
  createRow: (row, table) => {
    row.getIsGrouped = () => !!row.groupingColumnId;
    row.getGroupingValue = (columnId) => {
      if (row._groupingValuesCache.hasOwnProperty(columnId)) {
        return row._groupingValuesCache[columnId];
      }
      const column = table.getColumn(columnId);
      if (!(column != null && column.columnDef.getGroupingValue)) {
        return row.getValue(columnId);
      }
      row._groupingValuesCache[columnId] = column.columnDef.getGroupingValue(row.original);
      return row._groupingValuesCache[columnId];
    };
    row._groupingValuesCache = {};
  },
  createCell: (cell, column, row, table) => {
    cell.getIsGrouped = () => column.getIsGrouped() && column.id === row.groupingColumnId;
    cell.getIsPlaceholder = () => !cell.getIsGrouped() && column.getIsGrouped();
    cell.getIsAggregated = () => {
      var _row$subRows;
      return !cell.getIsGrouped() && !cell.getIsPlaceholder() && !!((_row$subRows = row.subRows) != null && _row$subRows.length);
    };
  }
};
function orderColumns(leafColumns, grouping, groupedColumnMode) {
  if (!(grouping != null && grouping.length) || !groupedColumnMode) {
    return leafColumns;
  }
  const nonGroupingColumns = leafColumns.filter((col) => !grouping.includes(col.id));
  if (groupedColumnMode === "remove") {
    return nonGroupingColumns;
  }
  const groupingColumns = grouping.map((g) => leafColumns.find((col) => col.id === g)).filter(Boolean);
  return [...groupingColumns, ...nonGroupingColumns];
}
var ColumnOrdering = {
  getInitialState: (state) => {
    return __spreadValues({
      columnOrder: []
    }, state);
  },
  getDefaultOptions: (table) => {
    return {
      onColumnOrderChange: makeStateUpdater("columnOrder", table)
    };
  },
  createColumn: (column, table) => {
    column.getIndex = memo((position) => [_getVisibleLeafColumns(table, position)], (columns) => columns.findIndex((d) => d.id === column.id), getMemoOptions(table.options, "debugColumns", "getIndex"));
    column.getIsFirstColumn = (position) => {
      var _columns$;
      const columns = _getVisibleLeafColumns(table, position);
      return ((_columns$ = columns[0]) == null ? void 0 : _columns$.id) === column.id;
    };
    column.getIsLastColumn = (position) => {
      var _columns;
      const columns = _getVisibleLeafColumns(table, position);
      return ((_columns = columns[columns.length - 1]) == null ? void 0 : _columns.id) === column.id;
    };
  },
  createTable: (table) => {
    table.setColumnOrder = (updater) => table.options.onColumnOrderChange == null ? void 0 : table.options.onColumnOrderChange(updater);
    table.resetColumnOrder = (defaultState) => {
      var _table$initialState$c;
      table.setColumnOrder(defaultState ? [] : (_table$initialState$c = table.initialState.columnOrder) != null ? _table$initialState$c : []);
    };
    table._getOrderColumnsFn = memo(() => [table.getState().columnOrder, table.getState().grouping, table.options.groupedColumnMode], (columnOrder, grouping, groupedColumnMode) => (columns) => {
      let orderedColumns = [];
      if (!(columnOrder != null && columnOrder.length)) {
        orderedColumns = columns;
      } else {
        const columnOrderCopy = [...columnOrder];
        const columnsCopy = [...columns];
        while (columnsCopy.length && columnOrderCopy.length) {
          const targetColumnId = columnOrderCopy.shift();
          const foundIndex = columnsCopy.findIndex((d) => d.id === targetColumnId);
          if (foundIndex > -1) {
            orderedColumns.push(columnsCopy.splice(foundIndex, 1)[0]);
          }
        }
        orderedColumns = [...orderedColumns, ...columnsCopy];
      }
      return orderColumns(orderedColumns, grouping, groupedColumnMode);
    }, getMemoOptions(table.options, "debugTable", "_getOrderColumnsFn"));
  }
};
var getDefaultColumnPinningState = () => ({
  left: [],
  right: []
});
var ColumnPinning = {
  getInitialState: (state) => {
    return __spreadValues({
      columnPinning: getDefaultColumnPinningState()
    }, state);
  },
  getDefaultOptions: (table) => {
    return {
      onColumnPinningChange: makeStateUpdater("columnPinning", table)
    };
  },
  createColumn: (column, table) => {
    column.pin = (position) => {
      const columnIds = column.getLeafColumns().map((d) => d.id).filter(Boolean);
      table.setColumnPinning((old) => {
        var _old$left3, _old$right3;
        if (position === "right") {
          var _old$left, _old$right;
          return {
            left: ((_old$left = old == null ? void 0 : old.left) != null ? _old$left : []).filter((d) => !(columnIds != null && columnIds.includes(d))),
            right: [...((_old$right = old == null ? void 0 : old.right) != null ? _old$right : []).filter((d) => !(columnIds != null && columnIds.includes(d))), ...columnIds]
          };
        }
        if (position === "left") {
          var _old$left2, _old$right2;
          return {
            left: [...((_old$left2 = old == null ? void 0 : old.left) != null ? _old$left2 : []).filter((d) => !(columnIds != null && columnIds.includes(d))), ...columnIds],
            right: ((_old$right2 = old == null ? void 0 : old.right) != null ? _old$right2 : []).filter((d) => !(columnIds != null && columnIds.includes(d)))
          };
        }
        return {
          left: ((_old$left3 = old == null ? void 0 : old.left) != null ? _old$left3 : []).filter((d) => !(columnIds != null && columnIds.includes(d))),
          right: ((_old$right3 = old == null ? void 0 : old.right) != null ? _old$right3 : []).filter((d) => !(columnIds != null && columnIds.includes(d)))
        };
      });
    };
    column.getCanPin = () => {
      const leafColumns = column.getLeafColumns();
      return leafColumns.some((d) => {
        var _d$columnDef$enablePi, _ref, _table$options$enable;
        return ((_d$columnDef$enablePi = d.columnDef.enablePinning) != null ? _d$columnDef$enablePi : true) && ((_ref = (_table$options$enable = table.options.enableColumnPinning) != null ? _table$options$enable : table.options.enablePinning) != null ? _ref : true);
      });
    };
    column.getIsPinned = () => {
      const leafColumnIds = column.getLeafColumns().map((d) => d.id);
      const {
        left,
        right
      } = table.getState().columnPinning;
      const isLeft = leafColumnIds.some((d) => left == null ? void 0 : left.includes(d));
      const isRight = leafColumnIds.some((d) => right == null ? void 0 : right.includes(d));
      return isLeft ? "left" : isRight ? "right" : false;
    };
    column.getPinnedIndex = () => {
      var _table$getState$colum, _table$getState$colum2;
      const position = column.getIsPinned();
      return position ? (_table$getState$colum = (_table$getState$colum2 = table.getState().columnPinning) == null || (_table$getState$colum2 = _table$getState$colum2[position]) == null ? void 0 : _table$getState$colum2.indexOf(column.id)) != null ? _table$getState$colum : -1 : 0;
    };
  },
  createRow: (row, table) => {
    row.getCenterVisibleCells = memo(() => [row._getAllVisibleCells(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allCells, left, right) => {
      const leftAndRight = [...left != null ? left : [], ...right != null ? right : []];
      return allCells.filter((d) => !leftAndRight.includes(d.column.id));
    }, getMemoOptions(table.options, "debugRows", "getCenterVisibleCells"));
    row.getLeftVisibleCells = memo(() => [row._getAllVisibleCells(), table.getState().columnPinning.left], (allCells, left) => {
      const cells = (left != null ? left : []).map((columnId) => allCells.find((cell) => cell.column.id === columnId)).filter(Boolean).map((d) => __spreadProps(__spreadValues({}, d), {
        position: "left"
      }));
      return cells;
    }, getMemoOptions(table.options, "debugRows", "getLeftVisibleCells"));
    row.getRightVisibleCells = memo(() => [row._getAllVisibleCells(), table.getState().columnPinning.right], (allCells, right) => {
      const cells = (right != null ? right : []).map((columnId) => allCells.find((cell) => cell.column.id === columnId)).filter(Boolean).map((d) => __spreadProps(__spreadValues({}, d), {
        position: "right"
      }));
      return cells;
    }, getMemoOptions(table.options, "debugRows", "getRightVisibleCells"));
  },
  createTable: (table) => {
    table.setColumnPinning = (updater) => table.options.onColumnPinningChange == null ? void 0 : table.options.onColumnPinningChange(updater);
    table.resetColumnPinning = (defaultState) => {
      var _table$initialState$c, _table$initialState;
      return table.setColumnPinning(defaultState ? getDefaultColumnPinningState() : (_table$initialState$c = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.columnPinning) != null ? _table$initialState$c : getDefaultColumnPinningState());
    };
    table.getIsSomeColumnsPinned = (position) => {
      var _pinningState$positio;
      const pinningState = table.getState().columnPinning;
      if (!position) {
        var _pinningState$left, _pinningState$right;
        return Boolean(((_pinningState$left = pinningState.left) == null ? void 0 : _pinningState$left.length) || ((_pinningState$right = pinningState.right) == null ? void 0 : _pinningState$right.length));
      }
      return Boolean((_pinningState$positio = pinningState[position]) == null ? void 0 : _pinningState$positio.length);
    };
    table.getLeftLeafColumns = memo(() => [table.getAllLeafColumns(), table.getState().columnPinning.left], (allColumns, left) => {
      return (left != null ? left : []).map((columnId) => allColumns.find((column) => column.id === columnId)).filter(Boolean);
    }, getMemoOptions(table.options, "debugColumns", "getLeftLeafColumns"));
    table.getRightLeafColumns = memo(() => [table.getAllLeafColumns(), table.getState().columnPinning.right], (allColumns, right) => {
      return (right != null ? right : []).map((columnId) => allColumns.find((column) => column.id === columnId)).filter(Boolean);
    }, getMemoOptions(table.options, "debugColumns", "getRightLeafColumns"));
    table.getCenterLeafColumns = memo(() => [table.getAllLeafColumns(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allColumns, left, right) => {
      const leftAndRight = [...left != null ? left : [], ...right != null ? right : []];
      return allColumns.filter((d) => !leftAndRight.includes(d.id));
    }, getMemoOptions(table.options, "debugColumns", "getCenterLeafColumns"));
  }
};
function safelyAccessDocument(_document) {
  return _document || (typeof document !== "undefined" ? document : null);
}
var defaultColumnSizing = {
  size: 150,
  minSize: 20,
  maxSize: Number.MAX_SAFE_INTEGER
};
var getDefaultColumnSizingInfoState = () => ({
  startOffset: null,
  startSize: null,
  deltaOffset: null,
  deltaPercentage: null,
  isResizingColumn: false,
  columnSizingStart: []
});
var ColumnSizing = {
  getDefaultColumnDef: () => {
    return defaultColumnSizing;
  },
  getInitialState: (state) => {
    return __spreadValues({
      columnSizing: {},
      columnSizingInfo: getDefaultColumnSizingInfoState()
    }, state);
  },
  getDefaultOptions: (table) => {
    return {
      columnResizeMode: "onEnd",
      columnResizeDirection: "ltr",
      onColumnSizingChange: makeStateUpdater("columnSizing", table),
      onColumnSizingInfoChange: makeStateUpdater("columnSizingInfo", table)
    };
  },
  createColumn: (column, table) => {
    column.getSize = () => {
      var _column$columnDef$min, _ref, _column$columnDef$max;
      const columnSize = table.getState().columnSizing[column.id];
      return Math.min(Math.max((_column$columnDef$min = column.columnDef.minSize) != null ? _column$columnDef$min : defaultColumnSizing.minSize, (_ref = columnSize != null ? columnSize : column.columnDef.size) != null ? _ref : defaultColumnSizing.size), (_column$columnDef$max = column.columnDef.maxSize) != null ? _column$columnDef$max : defaultColumnSizing.maxSize);
    };
    column.getStart = memo((position) => [position, _getVisibleLeafColumns(table, position), table.getState().columnSizing], (position, columns) => columns.slice(0, column.getIndex(position)).reduce((sum2, column2) => sum2 + column2.getSize(), 0), getMemoOptions(table.options, "debugColumns", "getStart"));
    column.getAfter = memo((position) => [position, _getVisibleLeafColumns(table, position), table.getState().columnSizing], (position, columns) => columns.slice(column.getIndex(position) + 1).reduce((sum2, column2) => sum2 + column2.getSize(), 0), getMemoOptions(table.options, "debugColumns", "getAfter"));
    column.resetSize = () => {
      table.setColumnSizing((_ref2) => {
        var _a2;
        let _b = _ref2, {
          [_a2 = column.id]: _
        } = _b, rest = __objRest(_b, [
          __restKey(_a2)
        ]);
        return rest;
      });
    };
    column.getCanResize = () => {
      var _column$columnDef$ena, _table$options$enable;
      return ((_column$columnDef$ena = column.columnDef.enableResizing) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableColumnResizing) != null ? _table$options$enable : true);
    };
    column.getIsResizing = () => {
      return table.getState().columnSizingInfo.isResizingColumn === column.id;
    };
  },
  createHeader: (header, table) => {
    header.getSize = () => {
      let sum2 = 0;
      const recurse = (header2) => {
        if (header2.subHeaders.length) {
          header2.subHeaders.forEach(recurse);
        } else {
          var _header$column$getSiz;
          sum2 += (_header$column$getSiz = header2.column.getSize()) != null ? _header$column$getSiz : 0;
        }
      };
      recurse(header);
      return sum2;
    };
    header.getStart = () => {
      if (header.index > 0) {
        const prevSiblingHeader = header.headerGroup.headers[header.index - 1];
        return prevSiblingHeader.getStart() + prevSiblingHeader.getSize();
      }
      return 0;
    };
    header.getResizeHandler = (_contextDocument) => {
      const column = table.getColumn(header.column.id);
      const canResize = column == null ? void 0 : column.getCanResize();
      return (e) => {
        if (!column || !canResize) {
          return;
        }
        e.persist == null || e.persist();
        if (isTouchStartEvent(e)) {
          if (e.touches && e.touches.length > 1) {
            return;
          }
        }
        const startSize = header.getSize();
        const columnSizingStart = header ? header.getLeafHeaders().map((d) => [d.column.id, d.column.getSize()]) : [[column.id, column.getSize()]];
        const clientX = isTouchStartEvent(e) ? Math.round(e.touches[0].clientX) : e.clientX;
        const newColumnSizing = {};
        const updateOffset = (eventType, clientXPos) => {
          if (typeof clientXPos !== "number") {
            return;
          }
          table.setColumnSizingInfo((old) => {
            var _old$startOffset, _old$startSize;
            const deltaDirection = table.options.columnResizeDirection === "rtl" ? -1 : 1;
            const deltaOffset = (clientXPos - ((_old$startOffset = old == null ? void 0 : old.startOffset) != null ? _old$startOffset : 0)) * deltaDirection;
            const deltaPercentage = Math.max(deltaOffset / ((_old$startSize = old == null ? void 0 : old.startSize) != null ? _old$startSize : 0), -0.999999);
            old.columnSizingStart.forEach((_ref3) => {
              let [columnId, headerSize] = _ref3;
              newColumnSizing[columnId] = Math.round(Math.max(headerSize + headerSize * deltaPercentage, 0) * 100) / 100;
            });
            return __spreadProps(__spreadValues({}, old), {
              deltaOffset,
              deltaPercentage
            });
          });
          if (table.options.columnResizeMode === "onChange" || eventType === "end") {
            table.setColumnSizing((old) => __spreadValues(__spreadValues({}, old), newColumnSizing));
          }
        };
        const onMove = (clientXPos) => updateOffset("move", clientXPos);
        const onEnd = (clientXPos) => {
          updateOffset("end", clientXPos);
          table.setColumnSizingInfo((old) => __spreadProps(__spreadValues({}, old), {
            isResizingColumn: false,
            startOffset: null,
            startSize: null,
            deltaOffset: null,
            deltaPercentage: null,
            columnSizingStart: []
          }));
        };
        const contextDocument = safelyAccessDocument(_contextDocument);
        const mouseEvents = {
          moveHandler: (e2) => onMove(e2.clientX),
          upHandler: (e2) => {
            contextDocument == null || contextDocument.removeEventListener("mousemove", mouseEvents.moveHandler);
            contextDocument == null || contextDocument.removeEventListener("mouseup", mouseEvents.upHandler);
            onEnd(e2.clientX);
          }
        };
        const touchEvents = {
          moveHandler: (e2) => {
            if (e2.cancelable) {
              e2.preventDefault();
              e2.stopPropagation();
            }
            onMove(e2.touches[0].clientX);
            return false;
          },
          upHandler: (e2) => {
            var _e$touches$;
            contextDocument == null || contextDocument.removeEventListener("touchmove", touchEvents.moveHandler);
            contextDocument == null || contextDocument.removeEventListener("touchend", touchEvents.upHandler);
            if (e2.cancelable) {
              e2.preventDefault();
              e2.stopPropagation();
            }
            onEnd((_e$touches$ = e2.touches[0]) == null ? void 0 : _e$touches$.clientX);
          }
        };
        const passiveIfSupported = passiveEventSupported() ? {
          passive: false
        } : false;
        if (isTouchStartEvent(e)) {
          contextDocument == null || contextDocument.addEventListener("touchmove", touchEvents.moveHandler, passiveIfSupported);
          contextDocument == null || contextDocument.addEventListener("touchend", touchEvents.upHandler, passiveIfSupported);
        } else {
          contextDocument == null || contextDocument.addEventListener("mousemove", mouseEvents.moveHandler, passiveIfSupported);
          contextDocument == null || contextDocument.addEventListener("mouseup", mouseEvents.upHandler, passiveIfSupported);
        }
        table.setColumnSizingInfo((old) => __spreadProps(__spreadValues({}, old), {
          startOffset: clientX,
          startSize,
          deltaOffset: 0,
          deltaPercentage: 0,
          columnSizingStart,
          isResizingColumn: column.id
        }));
      };
    };
  },
  createTable: (table) => {
    table.setColumnSizing = (updater) => table.options.onColumnSizingChange == null ? void 0 : table.options.onColumnSizingChange(updater);
    table.setColumnSizingInfo = (updater) => table.options.onColumnSizingInfoChange == null ? void 0 : table.options.onColumnSizingInfoChange(updater);
    table.resetColumnSizing = (defaultState) => {
      var _table$initialState$c;
      table.setColumnSizing(defaultState ? {} : (_table$initialState$c = table.initialState.columnSizing) != null ? _table$initialState$c : {});
    };
    table.resetHeaderSizeInfo = (defaultState) => {
      var _table$initialState$c2;
      table.setColumnSizingInfo(defaultState ? getDefaultColumnSizingInfoState() : (_table$initialState$c2 = table.initialState.columnSizingInfo) != null ? _table$initialState$c2 : getDefaultColumnSizingInfoState());
    };
    table.getTotalSize = () => {
      var _table$getHeaderGroup, _table$getHeaderGroup2;
      return (_table$getHeaderGroup = (_table$getHeaderGroup2 = table.getHeaderGroups()[0]) == null ? void 0 : _table$getHeaderGroup2.headers.reduce((sum2, header) => {
        return sum2 + header.getSize();
      }, 0)) != null ? _table$getHeaderGroup : 0;
    };
    table.getLeftTotalSize = () => {
      var _table$getLeftHeaderG, _table$getLeftHeaderG2;
      return (_table$getLeftHeaderG = (_table$getLeftHeaderG2 = table.getLeftHeaderGroups()[0]) == null ? void 0 : _table$getLeftHeaderG2.headers.reduce((sum2, header) => {
        return sum2 + header.getSize();
      }, 0)) != null ? _table$getLeftHeaderG : 0;
    };
    table.getCenterTotalSize = () => {
      var _table$getCenterHeade, _table$getCenterHeade2;
      return (_table$getCenterHeade = (_table$getCenterHeade2 = table.getCenterHeaderGroups()[0]) == null ? void 0 : _table$getCenterHeade2.headers.reduce((sum2, header) => {
        return sum2 + header.getSize();
      }, 0)) != null ? _table$getCenterHeade : 0;
    };
    table.getRightTotalSize = () => {
      var _table$getRightHeader, _table$getRightHeader2;
      return (_table$getRightHeader = (_table$getRightHeader2 = table.getRightHeaderGroups()[0]) == null ? void 0 : _table$getRightHeader2.headers.reduce((sum2, header) => {
        return sum2 + header.getSize();
      }, 0)) != null ? _table$getRightHeader : 0;
    };
  }
};
var passiveSupported = null;
function passiveEventSupported() {
  if (typeof passiveSupported === "boolean") return passiveSupported;
  let supported = false;
  try {
    const options = {
      get passive() {
        supported = true;
        return false;
      }
    };
    const noop = () => {
    };
    window.addEventListener("test", noop, options);
    window.removeEventListener("test", noop);
  } catch (err) {
    supported = false;
  }
  passiveSupported = supported;
  return passiveSupported;
}
function isTouchStartEvent(e) {
  return e.type === "touchstart";
}
var ColumnVisibility = {
  getInitialState: (state) => {
    return __spreadValues({
      columnVisibility: {}
    }, state);
  },
  getDefaultOptions: (table) => {
    return {
      onColumnVisibilityChange: makeStateUpdater("columnVisibility", table)
    };
  },
  createColumn: (column, table) => {
    column.toggleVisibility = (value) => {
      if (column.getCanHide()) {
        table.setColumnVisibility((old) => __spreadProps(__spreadValues({}, old), {
          [column.id]: value != null ? value : !column.getIsVisible()
        }));
      }
    };
    column.getIsVisible = () => {
      var _ref, _table$getState$colum;
      const childColumns = column.columns;
      return (_ref = childColumns.length ? childColumns.some((c) => c.getIsVisible()) : (_table$getState$colum = table.getState().columnVisibility) == null ? void 0 : _table$getState$colum[column.id]) != null ? _ref : true;
    };
    column.getCanHide = () => {
      var _column$columnDef$ena, _table$options$enable;
      return ((_column$columnDef$ena = column.columnDef.enableHiding) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableHiding) != null ? _table$options$enable : true);
    };
    column.getToggleVisibilityHandler = () => {
      return (e) => {
        column.toggleVisibility == null || column.toggleVisibility(e.target.checked);
      };
    };
  },
  createRow: (row, table) => {
    row._getAllVisibleCells = memo(() => [row.getAllCells(), table.getState().columnVisibility], (cells) => {
      return cells.filter((cell) => cell.column.getIsVisible());
    }, getMemoOptions(table.options, "debugRows", "_getAllVisibleCells"));
    row.getVisibleCells = memo(() => [row.getLeftVisibleCells(), row.getCenterVisibleCells(), row.getRightVisibleCells()], (left, center, right) => [...left, ...center, ...right], getMemoOptions(table.options, "debugRows", "getVisibleCells"));
  },
  createTable: (table) => {
    const makeVisibleColumnsMethod = (key, getColumns) => {
      return memo(() => [getColumns(), getColumns().filter((d) => d.getIsVisible()).map((d) => d.id).join("_")], (columns) => {
        return columns.filter((d) => d.getIsVisible == null ? void 0 : d.getIsVisible());
      }, getMemoOptions(table.options, "debugColumns", key));
    };
    table.getVisibleFlatColumns = makeVisibleColumnsMethod("getVisibleFlatColumns", () => table.getAllFlatColumns());
    table.getVisibleLeafColumns = makeVisibleColumnsMethod("getVisibleLeafColumns", () => table.getAllLeafColumns());
    table.getLeftVisibleLeafColumns = makeVisibleColumnsMethod("getLeftVisibleLeafColumns", () => table.getLeftLeafColumns());
    table.getRightVisibleLeafColumns = makeVisibleColumnsMethod("getRightVisibleLeafColumns", () => table.getRightLeafColumns());
    table.getCenterVisibleLeafColumns = makeVisibleColumnsMethod("getCenterVisibleLeafColumns", () => table.getCenterLeafColumns());
    table.setColumnVisibility = (updater) => table.options.onColumnVisibilityChange == null ? void 0 : table.options.onColumnVisibilityChange(updater);
    table.resetColumnVisibility = (defaultState) => {
      var _table$initialState$c;
      table.setColumnVisibility(defaultState ? {} : (_table$initialState$c = table.initialState.columnVisibility) != null ? _table$initialState$c : {});
    };
    table.toggleAllColumnsVisible = (value) => {
      var _value;
      value = (_value = value) != null ? _value : !table.getIsAllColumnsVisible();
      table.setColumnVisibility(table.getAllLeafColumns().reduce((obj, column) => __spreadProps(__spreadValues({}, obj), {
        [column.id]: !value ? !(column.getCanHide != null && column.getCanHide()) : value
      }), {}));
    };
    table.getIsAllColumnsVisible = () => !table.getAllLeafColumns().some((column) => !(column.getIsVisible != null && column.getIsVisible()));
    table.getIsSomeColumnsVisible = () => table.getAllLeafColumns().some((column) => column.getIsVisible == null ? void 0 : column.getIsVisible());
    table.getToggleAllColumnsVisibilityHandler = () => {
      return (e) => {
        var _target;
        table.toggleAllColumnsVisible((_target = e.target) == null ? void 0 : _target.checked);
      };
    };
  }
};
function _getVisibleLeafColumns(table, position) {
  return !position ? table.getVisibleLeafColumns() : position === "center" ? table.getCenterVisibleLeafColumns() : position === "left" ? table.getLeftVisibleLeafColumns() : table.getRightVisibleLeafColumns();
}
var GlobalFaceting = {
  createTable: (table) => {
    table._getGlobalFacetedRowModel = table.options.getFacetedRowModel && table.options.getFacetedRowModel(table, "__global__");
    table.getGlobalFacetedRowModel = () => {
      if (table.options.manualFiltering || !table._getGlobalFacetedRowModel) {
        return table.getPreFilteredRowModel();
      }
      return table._getGlobalFacetedRowModel();
    };
    table._getGlobalFacetedUniqueValues = table.options.getFacetedUniqueValues && table.options.getFacetedUniqueValues(table, "__global__");
    table.getGlobalFacetedUniqueValues = () => {
      if (!table._getGlobalFacetedUniqueValues) {
        return /* @__PURE__ */ new Map();
      }
      return table._getGlobalFacetedUniqueValues();
    };
    table._getGlobalFacetedMinMaxValues = table.options.getFacetedMinMaxValues && table.options.getFacetedMinMaxValues(table, "__global__");
    table.getGlobalFacetedMinMaxValues = () => {
      if (!table._getGlobalFacetedMinMaxValues) {
        return;
      }
      return table._getGlobalFacetedMinMaxValues();
    };
  }
};
var GlobalFiltering = {
  getInitialState: (state) => {
    return __spreadValues({
      globalFilter: void 0
    }, state);
  },
  getDefaultOptions: (table) => {
    return {
      onGlobalFilterChange: makeStateUpdater("globalFilter", table),
      globalFilterFn: "auto",
      getColumnCanGlobalFilter: (column) => {
        var _table$getCoreRowMode;
        const value = (_table$getCoreRowMode = table.getCoreRowModel().flatRows[0]) == null || (_table$getCoreRowMode = _table$getCoreRowMode._getAllCellsByColumnId()[column.id]) == null ? void 0 : _table$getCoreRowMode.getValue();
        return typeof value === "string" || typeof value === "number";
      }
    };
  },
  createColumn: (column, table) => {
    column.getCanGlobalFilter = () => {
      var _column$columnDef$ena, _table$options$enable, _table$options$enable2, _table$options$getCol;
      return ((_column$columnDef$ena = column.columnDef.enableGlobalFilter) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableGlobalFilter) != null ? _table$options$enable : true) && ((_table$options$enable2 = table.options.enableFilters) != null ? _table$options$enable2 : true) && ((_table$options$getCol = table.options.getColumnCanGlobalFilter == null ? void 0 : table.options.getColumnCanGlobalFilter(column)) != null ? _table$options$getCol : true) && !!column.accessorFn;
    };
  },
  createTable: (table) => {
    table.getGlobalAutoFilterFn = () => {
      return filterFns.includesString;
    };
    table.getGlobalFilterFn = () => {
      var _table$options$filter, _table$options$filter2;
      const {
        globalFilterFn
      } = table.options;
      return isFunction(globalFilterFn) ? globalFilterFn : globalFilterFn === "auto" ? table.getGlobalAutoFilterFn() : (_table$options$filter = (_table$options$filter2 = table.options.filterFns) == null ? void 0 : _table$options$filter2[globalFilterFn]) != null ? _table$options$filter : filterFns[globalFilterFn];
    };
    table.setGlobalFilter = (updater) => {
      table.options.onGlobalFilterChange == null || table.options.onGlobalFilterChange(updater);
    };
    table.resetGlobalFilter = (defaultState) => {
      table.setGlobalFilter(defaultState ? void 0 : table.initialState.globalFilter);
    };
  }
};
var RowExpanding = {
  getInitialState: (state) => {
    return __spreadValues({
      expanded: {}
    }, state);
  },
  getDefaultOptions: (table) => {
    return {
      onExpandedChange: makeStateUpdater("expanded", table),
      paginateExpandedRows: true
    };
  },
  createTable: (table) => {
    let registered = false;
    let queued = false;
    table._autoResetExpanded = () => {
      var _ref, _table$options$autoRe;
      if (!registered) {
        table._queue(() => {
          registered = true;
        });
        return;
      }
      if ((_ref = (_table$options$autoRe = table.options.autoResetAll) != null ? _table$options$autoRe : table.options.autoResetExpanded) != null ? _ref : !table.options.manualExpanding) {
        if (queued) return;
        queued = true;
        table._queue(() => {
          table.resetExpanded();
          queued = false;
        });
      }
    };
    table.setExpanded = (updater) => table.options.onExpandedChange == null ? void 0 : table.options.onExpandedChange(updater);
    table.toggleAllRowsExpanded = (expanded) => {
      if (expanded != null ? expanded : !table.getIsAllRowsExpanded()) {
        table.setExpanded(true);
      } else {
        table.setExpanded({});
      }
    };
    table.resetExpanded = (defaultState) => {
      var _table$initialState$e, _table$initialState;
      table.setExpanded(defaultState ? {} : (_table$initialState$e = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.expanded) != null ? _table$initialState$e : {});
    };
    table.getCanSomeRowsExpand = () => {
      return table.getPrePaginationRowModel().flatRows.some((row) => row.getCanExpand());
    };
    table.getToggleAllRowsExpandedHandler = () => {
      return (e) => {
        e.persist == null || e.persist();
        table.toggleAllRowsExpanded();
      };
    };
    table.getIsSomeRowsExpanded = () => {
      const expanded = table.getState().expanded;
      return expanded === true || Object.values(expanded).some(Boolean);
    };
    table.getIsAllRowsExpanded = () => {
      const expanded = table.getState().expanded;
      if (typeof expanded === "boolean") {
        return expanded === true;
      }
      if (!Object.keys(expanded).length) {
        return false;
      }
      if (table.getRowModel().flatRows.some((row) => !row.getIsExpanded())) {
        return false;
      }
      return true;
    };
    table.getExpandedDepth = () => {
      let maxDepth = 0;
      const rowIds = table.getState().expanded === true ? Object.keys(table.getRowModel().rowsById) : Object.keys(table.getState().expanded);
      rowIds.forEach((id) => {
        const splitId = id.split(".");
        maxDepth = Math.max(maxDepth, splitId.length);
      });
      return maxDepth;
    };
    table.getPreExpandedRowModel = () => table.getSortedRowModel();
    table.getExpandedRowModel = () => {
      if (!table._getExpandedRowModel && table.options.getExpandedRowModel) {
        table._getExpandedRowModel = table.options.getExpandedRowModel(table);
      }
      if (table.options.manualExpanding || !table._getExpandedRowModel) {
        return table.getPreExpandedRowModel();
      }
      return table._getExpandedRowModel();
    };
  },
  createRow: (row, table) => {
    row.toggleExpanded = (expanded) => {
      table.setExpanded((old) => {
        var _a2;
        var _expanded;
        const exists = old === true ? true : !!(old != null && old[row.id]);
        let oldExpanded = {};
        if (old === true) {
          Object.keys(table.getRowModel().rowsById).forEach((rowId) => {
            oldExpanded[rowId] = true;
          });
        } else {
          oldExpanded = old;
        }
        expanded = (_expanded = expanded) != null ? _expanded : !exists;
        if (!exists && expanded) {
          return __spreadProps(__spreadValues({}, oldExpanded), {
            [row.id]: true
          });
        }
        if (exists && !expanded) {
          const _b = oldExpanded, {
            [_a2 = row.id]: _
          } = _b, rest = __objRest(_b, [
            __restKey(_a2)
          ]);
          return rest;
        }
        return old;
      });
    };
    row.getIsExpanded = () => {
      var _table$options$getIsR;
      const expanded = table.getState().expanded;
      return !!((_table$options$getIsR = table.options.getIsRowExpanded == null ? void 0 : table.options.getIsRowExpanded(row)) != null ? _table$options$getIsR : expanded === true || (expanded == null ? void 0 : expanded[row.id]));
    };
    row.getCanExpand = () => {
      var _table$options$getRow, _table$options$enable, _row$subRows;
      return (_table$options$getRow = table.options.getRowCanExpand == null ? void 0 : table.options.getRowCanExpand(row)) != null ? _table$options$getRow : ((_table$options$enable = table.options.enableExpanding) != null ? _table$options$enable : true) && !!((_row$subRows = row.subRows) != null && _row$subRows.length);
    };
    row.getIsAllParentsExpanded = () => {
      let isFullyExpanded = true;
      let currentRow = row;
      while (isFullyExpanded && currentRow.parentId) {
        currentRow = table.getRow(currentRow.parentId, true);
        isFullyExpanded = currentRow.getIsExpanded();
      }
      return isFullyExpanded;
    };
    row.getToggleExpandedHandler = () => {
      const canExpand = row.getCanExpand();
      return () => {
        if (!canExpand) return;
        row.toggleExpanded();
      };
    };
  }
};
var defaultPageIndex = 0;
var defaultPageSize = 10;
var getDefaultPaginationState = () => ({
  pageIndex: defaultPageIndex,
  pageSize: defaultPageSize
});
var RowPagination = {
  getInitialState: (state) => {
    return __spreadProps(__spreadValues({}, state), {
      pagination: __spreadValues(__spreadValues({}, getDefaultPaginationState()), state == null ? void 0 : state.pagination)
    });
  },
  getDefaultOptions: (table) => {
    return {
      onPaginationChange: makeStateUpdater("pagination", table)
    };
  },
  createTable: (table) => {
    let registered = false;
    let queued = false;
    table._autoResetPageIndex = () => {
      var _ref, _table$options$autoRe;
      if (!registered) {
        table._queue(() => {
          registered = true;
        });
        return;
      }
      if ((_ref = (_table$options$autoRe = table.options.autoResetAll) != null ? _table$options$autoRe : table.options.autoResetPageIndex) != null ? _ref : !table.options.manualPagination) {
        if (queued) return;
        queued = true;
        table._queue(() => {
          table.resetPageIndex();
          queued = false;
        });
      }
    };
    table.setPagination = (updater) => {
      const safeUpdater = (old) => {
        let newState = functionalUpdate(updater, old);
        return newState;
      };
      return table.options.onPaginationChange == null ? void 0 : table.options.onPaginationChange(safeUpdater);
    };
    table.resetPagination = (defaultState) => {
      var _table$initialState$p;
      table.setPagination(defaultState ? getDefaultPaginationState() : (_table$initialState$p = table.initialState.pagination) != null ? _table$initialState$p : getDefaultPaginationState());
    };
    table.setPageIndex = (updater) => {
      table.setPagination((old) => {
        let pageIndex = functionalUpdate(updater, old.pageIndex);
        const maxPageIndex = typeof table.options.pageCount === "undefined" || table.options.pageCount === -1 ? Number.MAX_SAFE_INTEGER : table.options.pageCount - 1;
        pageIndex = Math.max(0, Math.min(pageIndex, maxPageIndex));
        return __spreadProps(__spreadValues({}, old), {
          pageIndex
        });
      });
    };
    table.resetPageIndex = (defaultState) => {
      var _table$initialState$p2, _table$initialState;
      table.setPageIndex(defaultState ? defaultPageIndex : (_table$initialState$p2 = (_table$initialState = table.initialState) == null || (_table$initialState = _table$initialState.pagination) == null ? void 0 : _table$initialState.pageIndex) != null ? _table$initialState$p2 : defaultPageIndex);
    };
    table.resetPageSize = (defaultState) => {
      var _table$initialState$p3, _table$initialState2;
      table.setPageSize(defaultState ? defaultPageSize : (_table$initialState$p3 = (_table$initialState2 = table.initialState) == null || (_table$initialState2 = _table$initialState2.pagination) == null ? void 0 : _table$initialState2.pageSize) != null ? _table$initialState$p3 : defaultPageSize);
    };
    table.setPageSize = (updater) => {
      table.setPagination((old) => {
        const pageSize = Math.max(1, functionalUpdate(updater, old.pageSize));
        const topRowIndex = old.pageSize * old.pageIndex;
        const pageIndex = Math.floor(topRowIndex / pageSize);
        return __spreadProps(__spreadValues({}, old), {
          pageIndex,
          pageSize
        });
      });
    };
    table.setPageCount = (updater) => table.setPagination((old) => {
      var _table$options$pageCo;
      let newPageCount = functionalUpdate(updater, (_table$options$pageCo = table.options.pageCount) != null ? _table$options$pageCo : -1);
      if (typeof newPageCount === "number") {
        newPageCount = Math.max(-1, newPageCount);
      }
      return __spreadProps(__spreadValues({}, old), {
        pageCount: newPageCount
      });
    });
    table.getPageOptions = memo(() => [table.getPageCount()], (pageCount) => {
      let pageOptions = [];
      if (pageCount && pageCount > 0) {
        pageOptions = [...new Array(pageCount)].fill(null).map((_, i) => i);
      }
      return pageOptions;
    }, getMemoOptions(table.options, "debugTable", "getPageOptions"));
    table.getCanPreviousPage = () => table.getState().pagination.pageIndex > 0;
    table.getCanNextPage = () => {
      const {
        pageIndex
      } = table.getState().pagination;
      const pageCount = table.getPageCount();
      if (pageCount === -1) {
        return true;
      }
      if (pageCount === 0) {
        return false;
      }
      return pageIndex < pageCount - 1;
    };
    table.previousPage = () => {
      return table.setPageIndex((old) => old - 1);
    };
    table.nextPage = () => {
      return table.setPageIndex((old) => {
        return old + 1;
      });
    };
    table.firstPage = () => {
      return table.setPageIndex(0);
    };
    table.lastPage = () => {
      return table.setPageIndex(table.getPageCount() - 1);
    };
    table.getPrePaginationRowModel = () => table.getExpandedRowModel();
    table.getPaginationRowModel = () => {
      if (!table._getPaginationRowModel && table.options.getPaginationRowModel) {
        table._getPaginationRowModel = table.options.getPaginationRowModel(table);
      }
      if (table.options.manualPagination || !table._getPaginationRowModel) {
        return table.getPrePaginationRowModel();
      }
      return table._getPaginationRowModel();
    };
    table.getPageCount = () => {
      var _table$options$pageCo2;
      return (_table$options$pageCo2 = table.options.pageCount) != null ? _table$options$pageCo2 : Math.ceil(table.getRowCount() / table.getState().pagination.pageSize);
    };
    table.getRowCount = () => {
      var _table$options$rowCou;
      return (_table$options$rowCou = table.options.rowCount) != null ? _table$options$rowCou : table.getPrePaginationRowModel().rows.length;
    };
  }
};
var getDefaultRowPinningState = () => ({
  top: [],
  bottom: []
});
var RowPinning = {
  getInitialState: (state) => {
    return __spreadValues({
      rowPinning: getDefaultRowPinningState()
    }, state);
  },
  getDefaultOptions: (table) => {
    return {
      onRowPinningChange: makeStateUpdater("rowPinning", table)
    };
  },
  createRow: (row, table) => {
    row.pin = (position, includeLeafRows, includeParentRows) => {
      const leafRowIds = includeLeafRows ? row.getLeafRows().map((_ref) => {
        let {
          id
        } = _ref;
        return id;
      }) : [];
      const parentRowIds = includeParentRows ? row.getParentRows().map((_ref2) => {
        let {
          id
        } = _ref2;
        return id;
      }) : [];
      const rowIds = /* @__PURE__ */ new Set([...parentRowIds, row.id, ...leafRowIds]);
      table.setRowPinning((old) => {
        var _old$top3, _old$bottom3;
        if (position === "bottom") {
          var _old$top, _old$bottom;
          return {
            top: ((_old$top = old == null ? void 0 : old.top) != null ? _old$top : []).filter((d) => !(rowIds != null && rowIds.has(d))),
            bottom: [...((_old$bottom = old == null ? void 0 : old.bottom) != null ? _old$bottom : []).filter((d) => !(rowIds != null && rowIds.has(d))), ...Array.from(rowIds)]
          };
        }
        if (position === "top") {
          var _old$top2, _old$bottom2;
          return {
            top: [...((_old$top2 = old == null ? void 0 : old.top) != null ? _old$top2 : []).filter((d) => !(rowIds != null && rowIds.has(d))), ...Array.from(rowIds)],
            bottom: ((_old$bottom2 = old == null ? void 0 : old.bottom) != null ? _old$bottom2 : []).filter((d) => !(rowIds != null && rowIds.has(d)))
          };
        }
        return {
          top: ((_old$top3 = old == null ? void 0 : old.top) != null ? _old$top3 : []).filter((d) => !(rowIds != null && rowIds.has(d))),
          bottom: ((_old$bottom3 = old == null ? void 0 : old.bottom) != null ? _old$bottom3 : []).filter((d) => !(rowIds != null && rowIds.has(d)))
        };
      });
    };
    row.getCanPin = () => {
      var _ref3;
      const {
        enableRowPinning,
        enablePinning
      } = table.options;
      if (typeof enableRowPinning === "function") {
        return enableRowPinning(row);
      }
      return (_ref3 = enableRowPinning != null ? enableRowPinning : enablePinning) != null ? _ref3 : true;
    };
    row.getIsPinned = () => {
      const rowIds = [row.id];
      const {
        top,
        bottom
      } = table.getState().rowPinning;
      const isTop = rowIds.some((d) => top == null ? void 0 : top.includes(d));
      const isBottom = rowIds.some((d) => bottom == null ? void 0 : bottom.includes(d));
      return isTop ? "top" : isBottom ? "bottom" : false;
    };
    row.getPinnedIndex = () => {
      var _ref4, _visiblePinnedRowIds$;
      const position = row.getIsPinned();
      if (!position) return -1;
      const visiblePinnedRowIds = (_ref4 = position === "top" ? table.getTopRows() : table.getBottomRows()) == null ? void 0 : _ref4.map((_ref5) => {
        let {
          id
        } = _ref5;
        return id;
      });
      return (_visiblePinnedRowIds$ = visiblePinnedRowIds == null ? void 0 : visiblePinnedRowIds.indexOf(row.id)) != null ? _visiblePinnedRowIds$ : -1;
    };
  },
  createTable: (table) => {
    table.setRowPinning = (updater) => table.options.onRowPinningChange == null ? void 0 : table.options.onRowPinningChange(updater);
    table.resetRowPinning = (defaultState) => {
      var _table$initialState$r, _table$initialState;
      return table.setRowPinning(defaultState ? getDefaultRowPinningState() : (_table$initialState$r = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.rowPinning) != null ? _table$initialState$r : getDefaultRowPinningState());
    };
    table.getIsSomeRowsPinned = (position) => {
      var _pinningState$positio;
      const pinningState = table.getState().rowPinning;
      if (!position) {
        var _pinningState$top, _pinningState$bottom;
        return Boolean(((_pinningState$top = pinningState.top) == null ? void 0 : _pinningState$top.length) || ((_pinningState$bottom = pinningState.bottom) == null ? void 0 : _pinningState$bottom.length));
      }
      return Boolean((_pinningState$positio = pinningState[position]) == null ? void 0 : _pinningState$positio.length);
    };
    table._getPinnedRows = (visibleRows, pinnedRowIds, position) => {
      var _table$options$keepPi;
      const rows = ((_table$options$keepPi = table.options.keepPinnedRows) != null ? _table$options$keepPi : true) ? (
        //get all rows that are pinned even if they would not be otherwise visible
        //account for expanded parent rows, but not pagination or filtering
        (pinnedRowIds != null ? pinnedRowIds : []).map((rowId) => {
          const row = table.getRow(rowId, true);
          return row.getIsAllParentsExpanded() ? row : null;
        })
      ) : (
        //else get only visible rows that are pinned
        (pinnedRowIds != null ? pinnedRowIds : []).map((rowId) => visibleRows.find((row) => row.id === rowId))
      );
      return rows.filter(Boolean).map((d) => __spreadProps(__spreadValues({}, d), {
        position
      }));
    };
    table.getTopRows = memo(() => [table.getRowModel().rows, table.getState().rowPinning.top], (allRows, topPinnedRowIds) => table._getPinnedRows(allRows, topPinnedRowIds, "top"), getMemoOptions(table.options, "debugRows", "getTopRows"));
    table.getBottomRows = memo(() => [table.getRowModel().rows, table.getState().rowPinning.bottom], (allRows, bottomPinnedRowIds) => table._getPinnedRows(allRows, bottomPinnedRowIds, "bottom"), getMemoOptions(table.options, "debugRows", "getBottomRows"));
    table.getCenterRows = memo(() => [table.getRowModel().rows, table.getState().rowPinning.top, table.getState().rowPinning.bottom], (allRows, top, bottom) => {
      const topAndBottom = /* @__PURE__ */ new Set([...top != null ? top : [], ...bottom != null ? bottom : []]);
      return allRows.filter((d) => !topAndBottom.has(d.id));
    }, getMemoOptions(table.options, "debugRows", "getCenterRows"));
  }
};
var RowSelection = {
  getInitialState: (state) => {
    return __spreadValues({
      rowSelection: {}
    }, state);
  },
  getDefaultOptions: (table) => {
    return {
      onRowSelectionChange: makeStateUpdater("rowSelection", table),
      enableRowSelection: true,
      enableMultiRowSelection: true,
      enableSubRowSelection: true
      // enableGroupingRowSelection: false,
      // isAdditiveSelectEvent: (e: unknown) => !!e.metaKey,
      // isInclusiveSelectEvent: (e: unknown) => !!e.shiftKey,
    };
  },
  createTable: (table) => {
    table.setRowSelection = (updater) => table.options.onRowSelectionChange == null ? void 0 : table.options.onRowSelectionChange(updater);
    table.resetRowSelection = (defaultState) => {
      var _table$initialState$r;
      return table.setRowSelection(defaultState ? {} : (_table$initialState$r = table.initialState.rowSelection) != null ? _table$initialState$r : {});
    };
    table.toggleAllRowsSelected = (value) => {
      table.setRowSelection((old) => {
        value = typeof value !== "undefined" ? value : !table.getIsAllRowsSelected();
        const rowSelection = __spreadValues({}, old);
        const preGroupedFlatRows = table.getPreGroupedRowModel().flatRows;
        if (value) {
          preGroupedFlatRows.forEach((row) => {
            if (!row.getCanSelect()) {
              return;
            }
            rowSelection[row.id] = true;
          });
        } else {
          preGroupedFlatRows.forEach((row) => {
            delete rowSelection[row.id];
          });
        }
        return rowSelection;
      });
    };
    table.toggleAllPageRowsSelected = (value) => table.setRowSelection((old) => {
      const resolvedValue = typeof value !== "undefined" ? value : !table.getIsAllPageRowsSelected();
      const rowSelection = __spreadValues({}, old);
      table.getRowModel().rows.forEach((row) => {
        mutateRowIsSelected(rowSelection, row.id, resolvedValue, true, table);
      });
      return rowSelection;
    });
    table.getPreSelectedRowModel = () => table.getCoreRowModel();
    table.getSelectedRowModel = memo(() => [table.getState().rowSelection, table.getCoreRowModel()], (rowSelection, rowModel) => {
      if (!Object.keys(rowSelection).length) {
        return {
          rows: [],
          flatRows: [],
          rowsById: {}
        };
      }
      return selectRowsFn(table, rowModel);
    }, getMemoOptions(table.options, "debugTable", "getSelectedRowModel"));
    table.getFilteredSelectedRowModel = memo(() => [table.getState().rowSelection, table.getFilteredRowModel()], (rowSelection, rowModel) => {
      if (!Object.keys(rowSelection).length) {
        return {
          rows: [],
          flatRows: [],
          rowsById: {}
        };
      }
      return selectRowsFn(table, rowModel);
    }, getMemoOptions(table.options, "debugTable", "getFilteredSelectedRowModel"));
    table.getGroupedSelectedRowModel = memo(() => [table.getState().rowSelection, table.getSortedRowModel()], (rowSelection, rowModel) => {
      if (!Object.keys(rowSelection).length) {
        return {
          rows: [],
          flatRows: [],
          rowsById: {}
        };
      }
      return selectRowsFn(table, rowModel);
    }, getMemoOptions(table.options, "debugTable", "getGroupedSelectedRowModel"));
    table.getIsAllRowsSelected = () => {
      const preGroupedFlatRows = table.getFilteredRowModel().flatRows;
      const {
        rowSelection
      } = table.getState();
      let isAllRowsSelected = Boolean(preGroupedFlatRows.length && Object.keys(rowSelection).length);
      if (isAllRowsSelected) {
        if (preGroupedFlatRows.some((row) => row.getCanSelect() && !rowSelection[row.id])) {
          isAllRowsSelected = false;
        }
      }
      return isAllRowsSelected;
    };
    table.getIsAllPageRowsSelected = () => {
      const paginationFlatRows = table.getPaginationRowModel().flatRows.filter((row) => row.getCanSelect());
      const {
        rowSelection
      } = table.getState();
      let isAllPageRowsSelected = !!paginationFlatRows.length;
      if (isAllPageRowsSelected && paginationFlatRows.some((row) => !rowSelection[row.id])) {
        isAllPageRowsSelected = false;
      }
      return isAllPageRowsSelected;
    };
    table.getIsSomeRowsSelected = () => {
      var _table$getState$rowSe;
      const totalSelected = Object.keys((_table$getState$rowSe = table.getState().rowSelection) != null ? _table$getState$rowSe : {}).length;
      return totalSelected > 0 && totalSelected < table.getFilteredRowModel().flatRows.length;
    };
    table.getIsSomePageRowsSelected = () => {
      const paginationFlatRows = table.getPaginationRowModel().flatRows;
      return table.getIsAllPageRowsSelected() ? false : paginationFlatRows.filter((row) => row.getCanSelect()).some((d) => d.getIsSelected() || d.getIsSomeSelected());
    };
    table.getToggleAllRowsSelectedHandler = () => {
      return (e) => {
        table.toggleAllRowsSelected(e.target.checked);
      };
    };
    table.getToggleAllPageRowsSelectedHandler = () => {
      return (e) => {
        table.toggleAllPageRowsSelected(e.target.checked);
      };
    };
  },
  createRow: (row, table) => {
    row.toggleSelected = (value, opts) => {
      const isSelected = row.getIsSelected();
      table.setRowSelection((old) => {
        var _opts$selectChildren;
        value = typeof value !== "undefined" ? value : !isSelected;
        if (row.getCanSelect() && isSelected === value) {
          return old;
        }
        const selectedRowIds = __spreadValues({}, old);
        mutateRowIsSelected(selectedRowIds, row.id, value, (_opts$selectChildren = opts == null ? void 0 : opts.selectChildren) != null ? _opts$selectChildren : true, table);
        return selectedRowIds;
      });
    };
    row.getIsSelected = () => {
      const {
        rowSelection
      } = table.getState();
      return isRowSelected(row, rowSelection);
    };
    row.getIsSomeSelected = () => {
      const {
        rowSelection
      } = table.getState();
      return isSubRowSelected(row, rowSelection) === "some";
    };
    row.getIsAllSubRowsSelected = () => {
      const {
        rowSelection
      } = table.getState();
      return isSubRowSelected(row, rowSelection) === "all";
    };
    row.getCanSelect = () => {
      var _table$options$enable;
      if (typeof table.options.enableRowSelection === "function") {
        return table.options.enableRowSelection(row);
      }
      return (_table$options$enable = table.options.enableRowSelection) != null ? _table$options$enable : true;
    };
    row.getCanSelectSubRows = () => {
      var _table$options$enable2;
      if (typeof table.options.enableSubRowSelection === "function") {
        return table.options.enableSubRowSelection(row);
      }
      return (_table$options$enable2 = table.options.enableSubRowSelection) != null ? _table$options$enable2 : true;
    };
    row.getCanMultiSelect = () => {
      var _table$options$enable3;
      if (typeof table.options.enableMultiRowSelection === "function") {
        return table.options.enableMultiRowSelection(row);
      }
      return (_table$options$enable3 = table.options.enableMultiRowSelection) != null ? _table$options$enable3 : true;
    };
    row.getToggleSelectedHandler = () => {
      const canSelect = row.getCanSelect();
      return (e) => {
        var _target;
        if (!canSelect) return;
        row.toggleSelected((_target = e.target) == null ? void 0 : _target.checked);
      };
    };
  }
};
var mutateRowIsSelected = (selectedRowIds, id, value, includeChildren, table) => {
  var _row$subRows;
  const row = table.getRow(id, true);
  if (value) {
    if (!row.getCanMultiSelect()) {
      Object.keys(selectedRowIds).forEach((key) => delete selectedRowIds[key]);
    }
    if (row.getCanSelect()) {
      selectedRowIds[id] = true;
    }
  } else {
    delete selectedRowIds[id];
  }
  if (includeChildren && (_row$subRows = row.subRows) != null && _row$subRows.length && row.getCanSelectSubRows()) {
    row.subRows.forEach((row2) => mutateRowIsSelected(selectedRowIds, row2.id, value, includeChildren, table));
  }
};
function selectRowsFn(table, rowModel) {
  const rowSelection = table.getState().rowSelection;
  const newSelectedFlatRows = [];
  const newSelectedRowsById = {};
  const recurseRows = function(rows, depth) {
    return rows.map((row) => {
      var _row$subRows2;
      const isSelected = isRowSelected(row, rowSelection);
      if (isSelected) {
        newSelectedFlatRows.push(row);
        newSelectedRowsById[row.id] = row;
      }
      if ((_row$subRows2 = row.subRows) != null && _row$subRows2.length) {
        row = __spreadProps(__spreadValues({}, row), {
          subRows: recurseRows(row.subRows)
        });
      }
      if (isSelected) {
        return row;
      }
    }).filter(Boolean);
  };
  return {
    rows: recurseRows(rowModel.rows),
    flatRows: newSelectedFlatRows,
    rowsById: newSelectedRowsById
  };
}
function isRowSelected(row, selection) {
  var _selection$row$id;
  return (_selection$row$id = selection[row.id]) != null ? _selection$row$id : false;
}
function isSubRowSelected(row, selection, table) {
  var _row$subRows3;
  if (!((_row$subRows3 = row.subRows) != null && _row$subRows3.length)) return false;
  let allChildrenSelected = true;
  let someSelected = false;
  row.subRows.forEach((subRow) => {
    if (someSelected && !allChildrenSelected) {
      return;
    }
    if (subRow.getCanSelect()) {
      if (isRowSelected(subRow, selection)) {
        someSelected = true;
      } else {
        allChildrenSelected = false;
      }
    }
    if (subRow.subRows && subRow.subRows.length) {
      const subRowChildrenSelected = isSubRowSelected(subRow, selection);
      if (subRowChildrenSelected === "all") {
        someSelected = true;
      } else if (subRowChildrenSelected === "some") {
        someSelected = true;
        allChildrenSelected = false;
      } else {
        allChildrenSelected = false;
      }
    }
  });
  return allChildrenSelected ? "all" : someSelected ? "some" : false;
}
var reSplitAlphaNumeric = /([0-9]+)/gm;
var alphanumeric = (rowA, rowB, columnId) => {
  return compareAlphanumeric(toString(rowA.getValue(columnId)).toLowerCase(), toString(rowB.getValue(columnId)).toLowerCase());
};
var alphanumericCaseSensitive = (rowA, rowB, columnId) => {
  return compareAlphanumeric(toString(rowA.getValue(columnId)), toString(rowB.getValue(columnId)));
};
var text = (rowA, rowB, columnId) => {
  return compareBasic(toString(rowA.getValue(columnId)).toLowerCase(), toString(rowB.getValue(columnId)).toLowerCase());
};
var textCaseSensitive = (rowA, rowB, columnId) => {
  return compareBasic(toString(rowA.getValue(columnId)), toString(rowB.getValue(columnId)));
};
var datetime = (rowA, rowB, columnId) => {
  const a = rowA.getValue(columnId);
  const b = rowB.getValue(columnId);
  return a > b ? 1 : a < b ? -1 : 0;
};
var basic = (rowA, rowB, columnId) => {
  return compareBasic(rowA.getValue(columnId), rowB.getValue(columnId));
};
function compareBasic(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
function toString(a) {
  if (typeof a === "number") {
    if (isNaN(a) || a === Infinity || a === -Infinity) {
      return "";
    }
    return String(a);
  }
  if (typeof a === "string") {
    return a;
  }
  return "";
}
function compareAlphanumeric(aStr, bStr) {
  const a = aStr.split(reSplitAlphaNumeric).filter(Boolean);
  const b = bStr.split(reSplitAlphaNumeric).filter(Boolean);
  while (a.length && b.length) {
    const aa = a.shift();
    const bb = b.shift();
    const an = parseInt(aa, 10);
    const bn = parseInt(bb, 10);
    const combo = [an, bn].sort();
    if (isNaN(combo[0])) {
      if (aa > bb) {
        return 1;
      }
      if (bb > aa) {
        return -1;
      }
      continue;
    }
    if (isNaN(combo[1])) {
      return isNaN(an) ? -1 : 1;
    }
    if (an > bn) {
      return 1;
    }
    if (bn > an) {
      return -1;
    }
  }
  return a.length - b.length;
}
var sortingFns = {
  alphanumeric,
  alphanumericCaseSensitive,
  text,
  textCaseSensitive,
  datetime,
  basic
};
var RowSorting = {
  getInitialState: (state) => {
    return __spreadValues({
      sorting: []
    }, state);
  },
  getDefaultColumnDef: () => {
    return {
      sortingFn: "auto",
      sortUndefined: 1
    };
  },
  getDefaultOptions: (table) => {
    return {
      onSortingChange: makeStateUpdater("sorting", table),
      isMultiSortEvent: (e) => {
        return e.shiftKey;
      }
    };
  },
  createColumn: (column, table) => {
    column.getAutoSortingFn = () => {
      const firstRows = table.getFilteredRowModel().flatRows.slice(10);
      let isString2 = false;
      for (const row of firstRows) {
        const value = row == null ? void 0 : row.getValue(column.id);
        if (Object.prototype.toString.call(value) === "[object Date]") {
          return sortingFns.datetime;
        }
        if (typeof value === "string") {
          isString2 = true;
          if (value.split(reSplitAlphaNumeric).length > 1) {
            return sortingFns.alphanumeric;
          }
        }
      }
      if (isString2) {
        return sortingFns.text;
      }
      return sortingFns.basic;
    };
    column.getAutoSortDir = () => {
      const firstRow = table.getFilteredRowModel().flatRows[0];
      const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
      if (typeof value === "string") {
        return "asc";
      }
      return "desc";
    };
    column.getSortingFn = () => {
      var _table$options$sortin, _table$options$sortin2;
      if (!column) {
        throw new Error();
      }
      return isFunction(column.columnDef.sortingFn) ? column.columnDef.sortingFn : column.columnDef.sortingFn === "auto" ? column.getAutoSortingFn() : (_table$options$sortin = (_table$options$sortin2 = table.options.sortingFns) == null ? void 0 : _table$options$sortin2[column.columnDef.sortingFn]) != null ? _table$options$sortin : sortingFns[column.columnDef.sortingFn];
    };
    column.toggleSorting = (desc, multi) => {
      const nextSortingOrder = column.getNextSortingOrder();
      const hasManualValue = typeof desc !== "undefined" && desc !== null;
      table.setSorting((old) => {
        const existingSorting = old == null ? void 0 : old.find((d) => d.id === column.id);
        const existingIndex = old == null ? void 0 : old.findIndex((d) => d.id === column.id);
        let newSorting = [];
        let sortAction;
        let nextDesc = hasManualValue ? desc : nextSortingOrder === "desc";
        if (old != null && old.length && column.getCanMultiSort() && multi) {
          if (existingSorting) {
            sortAction = "toggle";
          } else {
            sortAction = "add";
          }
        } else {
          if (old != null && old.length && existingIndex !== old.length - 1) {
            sortAction = "replace";
          } else if (existingSorting) {
            sortAction = "toggle";
          } else {
            sortAction = "replace";
          }
        }
        if (sortAction === "toggle") {
          if (!hasManualValue) {
            if (!nextSortingOrder) {
              sortAction = "remove";
            }
          }
        }
        if (sortAction === "add") {
          var _table$options$maxMul;
          newSorting = [...old, {
            id: column.id,
            desc: nextDesc
          }];
          newSorting.splice(0, newSorting.length - ((_table$options$maxMul = table.options.maxMultiSortColCount) != null ? _table$options$maxMul : Number.MAX_SAFE_INTEGER));
        } else if (sortAction === "toggle") {
          newSorting = old.map((d) => {
            if (d.id === column.id) {
              return __spreadProps(__spreadValues({}, d), {
                desc: nextDesc
              });
            }
            return d;
          });
        } else if (sortAction === "remove") {
          newSorting = old.filter((d) => d.id !== column.id);
        } else {
          newSorting = [{
            id: column.id,
            desc: nextDesc
          }];
        }
        return newSorting;
      });
    };
    column.getFirstSortDir = () => {
      var _ref, _column$columnDef$sor;
      const sortDescFirst = (_ref = (_column$columnDef$sor = column.columnDef.sortDescFirst) != null ? _column$columnDef$sor : table.options.sortDescFirst) != null ? _ref : column.getAutoSortDir() === "desc";
      return sortDescFirst ? "desc" : "asc";
    };
    column.getNextSortingOrder = (multi) => {
      var _table$options$enable, _table$options$enable2;
      const firstSortDirection = column.getFirstSortDir();
      const isSorted = column.getIsSorted();
      if (!isSorted) {
        return firstSortDirection;
      }
      if (isSorted !== firstSortDirection && ((_table$options$enable = table.options.enableSortingRemoval) != null ? _table$options$enable : true) && // If enableSortRemove, enable in general
      (multi ? (_table$options$enable2 = table.options.enableMultiRemove) != null ? _table$options$enable2 : true : true)) {
        return false;
      }
      return isSorted === "desc" ? "asc" : "desc";
    };
    column.getCanSort = () => {
      var _column$columnDef$ena, _table$options$enable3;
      return ((_column$columnDef$ena = column.columnDef.enableSorting) != null ? _column$columnDef$ena : true) && ((_table$options$enable3 = table.options.enableSorting) != null ? _table$options$enable3 : true) && !!column.accessorFn;
    };
    column.getCanMultiSort = () => {
      var _ref2, _column$columnDef$ena2;
      return (_ref2 = (_column$columnDef$ena2 = column.columnDef.enableMultiSort) != null ? _column$columnDef$ena2 : table.options.enableMultiSort) != null ? _ref2 : !!column.accessorFn;
    };
    column.getIsSorted = () => {
      var _table$getState$sorti;
      const columnSort = (_table$getState$sorti = table.getState().sorting) == null ? void 0 : _table$getState$sorti.find((d) => d.id === column.id);
      return !columnSort ? false : columnSort.desc ? "desc" : "asc";
    };
    column.getSortIndex = () => {
      var _table$getState$sorti2, _table$getState$sorti3;
      return (_table$getState$sorti2 = (_table$getState$sorti3 = table.getState().sorting) == null ? void 0 : _table$getState$sorti3.findIndex((d) => d.id === column.id)) != null ? _table$getState$sorti2 : -1;
    };
    column.clearSorting = () => {
      table.setSorting((old) => old != null && old.length ? old.filter((d) => d.id !== column.id) : []);
    };
    column.getToggleSortingHandler = () => {
      const canSort = column.getCanSort();
      return (e) => {
        if (!canSort) return;
        e.persist == null || e.persist();
        column.toggleSorting == null || column.toggleSorting(void 0, column.getCanMultiSort() ? table.options.isMultiSortEvent == null ? void 0 : table.options.isMultiSortEvent(e) : false);
      };
    };
  },
  createTable: (table) => {
    table.setSorting = (updater) => table.options.onSortingChange == null ? void 0 : table.options.onSortingChange(updater);
    table.resetSorting = (defaultState) => {
      var _table$initialState$s, _table$initialState;
      table.setSorting(defaultState ? [] : (_table$initialState$s = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.sorting) != null ? _table$initialState$s : []);
    };
    table.getPreSortedRowModel = () => table.getGroupedRowModel();
    table.getSortedRowModel = () => {
      if (!table._getSortedRowModel && table.options.getSortedRowModel) {
        table._getSortedRowModel = table.options.getSortedRowModel(table);
      }
      if (table.options.manualSorting || !table._getSortedRowModel) {
        return table.getPreSortedRowModel();
      }
      return table._getSortedRowModel();
    };
  }
};
var builtInFeatures = [
  Headers,
  ColumnVisibility,
  ColumnOrdering,
  ColumnPinning,
  ColumnFaceting,
  ColumnFiltering,
  GlobalFaceting,
  //depends on ColumnFaceting
  GlobalFiltering,
  //depends on ColumnFiltering
  RowSorting,
  ColumnGrouping,
  //depends on RowSorting
  RowExpanding,
  RowPagination,
  RowPinning,
  RowSelection,
  ColumnSizing
];
function createTable(options) {
  var _options$_features, _options$initialState;
  if (process.env.NODE_ENV !== "production" && (options.debugAll || options.debugTable)) {
    console.info("Creating Table Instance...");
  }
  const _features = [...builtInFeatures, ...(_options$_features = options._features) != null ? _options$_features : []];
  let table = {
    _features
  };
  const defaultOptions2 = table._features.reduce((obj, feature) => {
    return Object.assign(obj, feature.getDefaultOptions == null ? void 0 : feature.getDefaultOptions(table));
  }, {});
  const mergeOptions = (options2) => {
    if (table.options.mergeOptions) {
      return table.options.mergeOptions(defaultOptions2, options2);
    }
    return __spreadValues(__spreadValues({}, defaultOptions2), options2);
  };
  const coreInitialState = {};
  let initialState = __spreadValues(__spreadValues({}, coreInitialState), (_options$initialState = options.initialState) != null ? _options$initialState : {});
  table._features.forEach((feature) => {
    var _feature$getInitialSt;
    initialState = (_feature$getInitialSt = feature.getInitialState == null ? void 0 : feature.getInitialState(initialState)) != null ? _feature$getInitialSt : initialState;
  });
  const queued = [];
  let queuedTimeout = false;
  const coreInstance = {
    _features,
    options: __spreadValues(__spreadValues({}, defaultOptions2), options),
    initialState,
    _queue: (cb) => {
      queued.push(cb);
      if (!queuedTimeout) {
        queuedTimeout = true;
        Promise.resolve().then(() => {
          while (queued.length) {
            queued.shift()();
          }
          queuedTimeout = false;
        }).catch((error) => setTimeout(() => {
          throw error;
        }));
      }
    },
    reset: () => {
      table.setState(table.initialState);
    },
    setOptions: (updater) => {
      const newOptions = functionalUpdate(updater, table.options);
      table.options = mergeOptions(newOptions);
    },
    getState: () => {
      return table.options.state;
    },
    setState: (updater) => {
      table.options.onStateChange == null || table.options.onStateChange(updater);
    },
    _getRowId: (row, index, parent) => {
      var _table$options$getRow;
      return (_table$options$getRow = table.options.getRowId == null ? void 0 : table.options.getRowId(row, index, parent)) != null ? _table$options$getRow : `${parent ? [parent.id, index].join(".") : index}`;
    },
    getCoreRowModel: () => {
      if (!table._getCoreRowModel) {
        table._getCoreRowModel = table.options.getCoreRowModel(table);
      }
      return table._getCoreRowModel();
    },
    // The final calls start at the bottom of the model,
    // expanded rows, which then work their way up
    getRowModel: () => {
      return table.getPaginationRowModel();
    },
    //in next version, we should just pass in the row model as the optional 2nd arg
    getRow: (id, searchAll) => {
      let row = (searchAll ? table.getPrePaginationRowModel() : table.getRowModel()).rowsById[id];
      if (!row) {
        row = table.getCoreRowModel().rowsById[id];
        if (!row) {
          if (process.env.NODE_ENV !== "production") {
            throw new Error(`getRow could not find row with ID: ${id}`);
          }
          throw new Error();
        }
      }
      return row;
    },
    _getDefaultColumnDef: memo(() => [table.options.defaultColumn], (defaultColumn) => {
      var _defaultColumn;
      defaultColumn = (_defaultColumn = defaultColumn) != null ? _defaultColumn : {};
      return __spreadValues(__spreadValues({
        header: (props) => {
          const resolvedColumnDef = props.header.column.columnDef;
          if (resolvedColumnDef.accessorKey) {
            return resolvedColumnDef.accessorKey;
          }
          if (resolvedColumnDef.accessorFn) {
            return resolvedColumnDef.id;
          }
          return null;
        },
        // footer: props => props.header.column.id,
        cell: (props) => {
          var _props$renderValue$to, _props$renderValue;
          return (_props$renderValue$to = (_props$renderValue = props.renderValue()) == null || _props$renderValue.toString == null ? void 0 : _props$renderValue.toString()) != null ? _props$renderValue$to : null;
        }
      }, table._features.reduce((obj, feature) => {
        return Object.assign(obj, feature.getDefaultColumnDef == null ? void 0 : feature.getDefaultColumnDef());
      }, {})), defaultColumn);
    }, getMemoOptions(options, "debugColumns", "_getDefaultColumnDef")),
    _getColumnDefs: () => table.options.columns,
    getAllColumns: memo(() => [table._getColumnDefs()], (columnDefs) => {
      const recurseColumns = function(columnDefs2, parent, depth) {
        if (depth === void 0) {
          depth = 0;
        }
        return columnDefs2.map((columnDef) => {
          const column = createColumn(table, columnDef, depth, parent);
          const groupingColumnDef = columnDef;
          column.columns = groupingColumnDef.columns ? recurseColumns(groupingColumnDef.columns, column, depth + 1) : [];
          return column;
        });
      };
      return recurseColumns(columnDefs);
    }, getMemoOptions(options, "debugColumns", "getAllColumns")),
    getAllFlatColumns: memo(() => [table.getAllColumns()], (allColumns) => {
      return allColumns.flatMap((column) => {
        return column.getFlatColumns();
      });
    }, getMemoOptions(options, "debugColumns", "getAllFlatColumns")),
    _getAllFlatColumnsById: memo(() => [table.getAllFlatColumns()], (flatColumns) => {
      return flatColumns.reduce((acc, column) => {
        acc[column.id] = column;
        return acc;
      }, {});
    }, getMemoOptions(options, "debugColumns", "getAllFlatColumnsById")),
    getAllLeafColumns: memo(() => [table.getAllColumns(), table._getOrderColumnsFn()], (allColumns, orderColumns2) => {
      let leafColumns = allColumns.flatMap((column) => column.getLeafColumns());
      return orderColumns2(leafColumns);
    }, getMemoOptions(options, "debugColumns", "getAllLeafColumns")),
    getColumn: (columnId) => {
      const column = table._getAllFlatColumnsById()[columnId];
      if (process.env.NODE_ENV !== "production" && !column) {
        console.error(`[Table] Column with id '${columnId}' does not exist.`);
      }
      return column;
    }
  };
  Object.assign(table, coreInstance);
  for (let index = 0; index < table._features.length; index++) {
    const feature = table._features[index];
    feature == null || feature.createTable == null || feature.createTable(table);
  }
  return table;
}
function getCoreRowModel() {
  return (table) => memo(() => [table.options.data], (data) => {
    const rowModel = {
      rows: [],
      flatRows: [],
      rowsById: {}
    };
    const accessRows = function(originalRows, depth, parentRow) {
      if (depth === void 0) {
        depth = 0;
      }
      const rows = [];
      for (let i = 0; i < originalRows.length; i++) {
        const row = createRow(table, table._getRowId(originalRows[i], i, parentRow), originalRows[i], i, depth, void 0, parentRow == null ? void 0 : parentRow.id);
        rowModel.flatRows.push(row);
        rowModel.rowsById[row.id] = row;
        rows.push(row);
        if (table.options.getSubRows) {
          var _row$originalSubRows;
          row.originalSubRows = table.options.getSubRows(originalRows[i], i);
          if ((_row$originalSubRows = row.originalSubRows) != null && _row$originalSubRows.length) {
            row.subRows = accessRows(row.originalSubRows, depth + 1, row);
          }
        }
      }
      return rows;
    };
    rowModel.rows = accessRows(data);
    return rowModel;
  }, getMemoOptions(table.options, "debugTable", "getRowModel", () => table._autoResetPageIndex()));
}

// ../../node_modules/@tanstack/react-table/build/lib/index.mjs
function flexRender(Comp, props) {
  return !Comp ? null : isReactComponent(Comp) ? /* @__PURE__ */ React27.createElement(Comp, props) : Comp;
}
function isReactComponent(component) {
  return isClassComponent(component) || typeof component === "function" || isExoticComponent(component);
}
function isClassComponent(component) {
  return typeof component === "function" && (() => {
    const proto = Object.getPrototypeOf(component);
    return proto.prototype && proto.prototype.isReactComponent;
  })();
}
function isExoticComponent(component) {
  return typeof component === "object" && typeof component.$$typeof === "symbol" && ["react.memo", "react.forward_ref"].includes(component.$$typeof.description);
}
function useReactTable(options) {
  const resolvedOptions = __spreadValues({
    state: {},
    // Dummy state
    onStateChange: () => {
    },
    // noop
    renderFallbackValue: null
  }, options);
  const [tableRef] = React27.useState(() => ({
    current: createTable(resolvedOptions)
  }));
  const [state, setState] = React27.useState(() => tableRef.current.initialState);
  tableRef.current.setOptions((prev) => __spreadProps(__spreadValues(__spreadValues({}, prev), options), {
    state: __spreadValues(__spreadValues({}, state), options.state),
    // Similarly, we'll maintain both our internal state and any user-provided
    // state.
    onStateChange: (updater) => {
      setState(updater);
      options.onStateChange == null || options.onStateChange(updater);
    }
  }));
  return tableRef.current;
}

// src/data-table.tsx
var import_next_intl = __toESM(require_index_react_client3());
import { jsx as jsx28, jsxs as jsxs9 } from "react/jsx-runtime";
function DataTable({ columns, data }) {
  var _a2;
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });
  const t = (0, import_next_intl.useTranslations)("DataTable");
  return /* @__PURE__ */ jsx28("div", { className: "bg-card rounded-md border", children: /* @__PURE__ */ jsxs9(Table, { children: [
    /* @__PURE__ */ jsx28(TableHeader, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx28(TableRow, { children: headerGroup.headers.map((header) => {
      return /* @__PURE__ */ jsx28(TableHead, { children: header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext()) }, header.id);
    }) }, headerGroup.id)) }),
    /* @__PURE__ */ jsx28(TableBody, { children: ((_a2 = table.getRowModel().rows) == null ? void 0 : _a2.length) ? table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx28(TableRow, { "data-state": row.getIsSelected() && "selected", children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx28(TableCell, { className: "whitespace-nowrap", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id)) }, row.id)) : /* @__PURE__ */ jsx28(TableRow, { children: /* @__PURE__ */ jsx28(TableCell, { colSpan: columns.length, className: "h-24 text-center", children: t("no_results") }) }) })
  ] }) });
}

// src/empty-states.tsx
import {
  FileText,
  FolderOpen,
  Inbox,
  Layers,
  MessageSquare,
  Flower2,
  Search,
  Users
} from "lucide-react";
import { jsx as jsx29, jsxs as jsxs10 } from "react/jsx-runtime";
function EmptyState({ icon: Icon2, title, description, action, className }) {
  return /* @__PURE__ */ jsxs10("div", { className: cn("flex flex-col items-center justify-center p-8 text-center", className), children: [
    /* @__PURE__ */ jsx29("div", { className: "bg-muted mb-4 rounded-full p-4", children: /* @__PURE__ */ jsx29(Icon2, { className: "text-muted-foreground size-8" }) }),
    /* @__PURE__ */ jsx29("h3", { className: "mb-2 text-lg font-semibold", children: title }),
    description && /* @__PURE__ */ jsx29("p", { className: "text-muted-foreground mb-6 max-w-sm text-sm", children: description }),
    action && /* @__PURE__ */ jsx29(Button, { onClick: action.onClick, variant: action.variant || "default", size: "sm", children: action.label })
  ] });
}
function NoProjectsEmptyState({ onCreateProject }) {
  return /* @__PURE__ */ jsx29(
    EmptyState,
    {
      icon: FolderOpen,
      title: "No projects yet",
      description: "Create your first landscape design project to get started.",
      action: {
        label: "Create Project",
        onClick: onCreateProject
      }
    }
  );
}
function NoTeamMembersEmptyState({ onInvite }) {
  return /* @__PURE__ */ jsx29(
    EmptyState,
    {
      icon: Users,
      title: "No team members",
      description: "Invite team members to collaborate on your landscape designs.",
      action: {
        label: "Invite Members",
        onClick: onInvite
      }
    }
  );
}
function NoResultsEmptyState({ query }) {
  return /* @__PURE__ */ jsx29(
    EmptyState,
    {
      icon: Search,
      title: "No results found",
      description: query ? `No results found for "${query}"` : "Try adjusting your search or filters."
    }
  );
}
function NoPlantsEmptyState() {
  return /* @__PURE__ */ jsx29(
    EmptyState,
    {
      icon: Flower2,
      title: "No plants in this category",
      description: "Try selecting a different category or adjusting your filters."
    }
  );
}
function NoLayersEmptyState({ onCreateLayer }) {
  return /* @__PURE__ */ jsx29(
    EmptyState,
    {
      icon: Layers,
      title: "No layers yet",
      description: "Organize your design by creating layers for different elements.",
      action: {
        label: "Create Layer",
        onClick: onCreateLayer,
        variant: "outline"
      }
    }
  );
}
function NoCommentsEmptyState() {
  return /* @__PURE__ */ jsx29(
    EmptyState,
    {
      icon: MessageSquare,
      title: "No comments yet",
      description: "Be the first to leave feedback on this design."
    }
  );
}
function EmptyInbox() {
  return /* @__PURE__ */ jsx29(
    EmptyState,
    {
      icon: Inbox,
      title: "All caught up!",
      description: "You have no new notifications at the moment."
    }
  );
}
function EmptyCanvas({ onAddElement }) {
  return /* @__PURE__ */ jsx29("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxs10("div", { className: "pointer-events-auto text-center", children: [
    /* @__PURE__ */ jsx29("div", { className: "bg-muted mx-auto mb-4 w-fit rounded-full p-6", children: /* @__PURE__ */ jsx29(FileText, { className: "text-muted-foreground size-12" }) }),
    /* @__PURE__ */ jsx29("h3", { className: "mb-2 text-xl font-semibold", children: "Start designing" }),
    /* @__PURE__ */ jsx29("p", { className: "text-muted-foreground mb-6 max-w-sm", children: "Add plants, draw garden beds, or import a base plan to begin." }),
    /* @__PURE__ */ jsxs10("div", { className: "flex justify-center gap-2", children: [
      /* @__PURE__ */ jsx29(Button, { onClick: onAddElement, size: "sm", children: "Add Element" }),
      /* @__PURE__ */ jsx29(Button, { variant: "outline", size: "sm", children: "Import Plan" })
    ] })
  ] }) });
}

// src/loading-states.tsx
import { Loader2 } from "lucide-react";
import { Fragment, jsx as jsx30, jsxs as jsxs11 } from "react/jsx-runtime";
function Spinner({ className, size = "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };
  return /* @__PURE__ */ jsx30(Loader2, { className: cn("text-primary animate-spin", sizeClasses[size], className) });
}
function LoadingOverlay({ children, className }) {
  return /* @__PURE__ */ jsx30(
    "div",
    {
      className: cn(
        "bg-background/80 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm",
        className
      ),
      children: /* @__PURE__ */ jsxs11("div", { className: "flex flex-col items-center gap-4", children: [
        /* @__PURE__ */ jsx30(Spinner, { size: "lg" }),
        children && /* @__PURE__ */ jsx30("div", { className: "text-muted-foreground text-sm", children })
      ] })
    }
  );
}
function PageLoader({ text: text2 = "Loading..." }) {
  return /* @__PURE__ */ jsx30("div", { className: "flex h-[50vh] items-center justify-center", children: /* @__PURE__ */ jsxs11("div", { className: "flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsx30(Spinner, { size: "lg" }),
    /* @__PURE__ */ jsx30("p", { className: "text-muted-foreground text-sm", children: text2 })
  ] }) });
}
function ButtonLoader({ loading, children, className }) {
  return /* @__PURE__ */ jsxs11("span", { className: cn("flex items-center gap-2", className), children: [
    loading && /* @__PURE__ */ jsx30(Spinner, { size: "sm" }),
    children
  ] });
}
function InlineLoader({ loading, children }) {
  if (loading) {
    return /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx30(Spinner, { size: "sm" }),
      /* @__PURE__ */ jsx30("span", { className: "text-muted-foreground text-sm", children: "Loading..." })
    ] });
  }
  return /* @__PURE__ */ jsx30(Fragment, { children });
}

// src/error-boundary.tsx
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import React28 from "react";
import { jsx as jsx31, jsxs as jsxs12 } from "react/jsx-runtime";
var ErrorBoundary = class extends React28.Component {
  constructor(props) {
    super(props);
    this.resetError = () => {
      this.setState({ hasError: false, error: null, errorInfo: null });
    };
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error, errorInfo: null };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return /* @__PURE__ */ jsx31(FallbackComponent, { error: this.state.error, resetError: this.resetError });
    }
    return this.props.children;
  }
};
function DefaultErrorFallback({ error, resetError }) {
  return /* @__PURE__ */ jsx31("div", { className: "flex min-h-[400px] items-center justify-center p-4", children: /* @__PURE__ */ jsxs12(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs12(CardHeader, { children: [
      /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx31(AlertTriangle, { className: "text-destructive size-5" }),
        /* @__PURE__ */ jsx31(CardTitle, { children: "Something went wrong" })
      ] }),
      /* @__PURE__ */ jsx31(CardDescription, { children: "An unexpected error occurred. We apologize for the inconvenience." })
    ] }),
    /* @__PURE__ */ jsx31(CardContent, { children: /* @__PURE__ */ jsxs12("details", { className: "bg-muted rounded-lg p-4", children: [
      /* @__PURE__ */ jsx31("summary", { className: "cursor-pointer text-sm font-medium", children: "Error details" }),
      /* @__PURE__ */ jsx31("pre", { className: "text-muted-foreground mt-2 whitespace-pre-wrap text-xs", children: error.message })
    ] }) }),
    /* @__PURE__ */ jsxs12(CardFooter, { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxs12(Button, { onClick: resetError, variant: "default", size: "sm", children: [
        /* @__PURE__ */ jsx31(RefreshCw, { className: "mr-2 size-4" }),
        "Try again"
      ] }),
      /* @__PURE__ */ jsxs12(Button, { onClick: () => window.location.href = "/", variant: "outline", size: "sm", children: [
        /* @__PURE__ */ jsx31(Home, { className: "mr-2 size-4" }),
        "Go home"
      ] })
    ] })
  ] }) });
}
function withErrorBoundary(Component, errorBoundaryProps) {
  const WrappedComponent = (props) => /* @__PURE__ */ jsx31(ErrorBoundary, __spreadProps(__spreadValues({}, errorBoundaryProps), { children: /* @__PURE__ */ jsx31(Component, __spreadValues({}, props)) }));
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
function PageErrorBoundary({ children }) {
  return /* @__PURE__ */ jsx31(
    ErrorBoundary,
    {
      fallback: PageErrorFallback,
      onError: (error, errorInfo) => {
        console.error("Page error:", error, errorInfo);
      },
      children
    }
  );
}
function PageErrorFallback({ error, resetError }) {
  return /* @__PURE__ */ jsx31("div", { className: "flex min-h-screen flex-col items-center justify-center p-4", children: /* @__PURE__ */ jsxs12("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx31(AlertTriangle, { className: "text-destructive mx-auto size-12" }),
    /* @__PURE__ */ jsx31("h1", { className: "mt-4 text-2xl font-bold", children: "Page Error" }),
    /* @__PURE__ */ jsx31("p", { className: "text-muted-foreground mt-2", children: "This page encountered an error and cannot be displayed." }),
    /* @__PURE__ */ jsxs12("div", { className: "mt-6 flex justify-center gap-4", children: [
      /* @__PURE__ */ jsx31(Button, { onClick: resetError, children: "Try Again" }),
      /* @__PURE__ */ jsx31(Button, { variant: "outline", onClick: () => window.location.href = "/", children: "Return Home" })
    ] })
  ] }) });
}

// src/animations.ts
var cardHover = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: { scale: 0.98 }
};
var buttonTap = {
  tap: { scale: 0.95 }
};
var fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};
var fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};
var modalAnimation = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: "easeIn"
    }
  }
};
var staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
var staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// src/billing/BillingAlerts.tsx
import { AlertCircle, Calendar, CreditCard, Zap } from "lucide-react";
import { jsx as jsx32, jsxs as jsxs13 } from "react/jsx-runtime";
function BillingAlerts({ alerts, onActionClick }) {
  if (!alerts || alerts.length === 0) {
    return null;
  }
  const getAlertIcon = (type) => {
    switch (type) {
      case "payment_failed":
        return CreditCard;
      case "subscription_expiring":
        return Calendar;
      case "usage_limit":
        return Zap;
      default:
        return AlertCircle;
    }
  };
  const getAlertVariant = (severity) => {
    return severity === "error" ? "destructive" : "default";
  };
  return /* @__PURE__ */ jsx32("div", { className: "space-y-3", children: alerts.map((alert) => {
    const Icon2 = getAlertIcon(alert.type);
    return /* @__PURE__ */ jsxs13(Alert, { variant: getAlertVariant(alert.severity), children: [
      /* @__PURE__ */ jsx32(Icon2, { className: "size-4" }),
      /* @__PURE__ */ jsx32(AlertTitle, { children: alert.title }),
      /* @__PURE__ */ jsx32(AlertDescription, { className: "mt-2", children: /* @__PURE__ */ jsxs13("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsx32("p", { children: alert.message }),
        alert.action && /* @__PURE__ */ jsx32(
          Button,
          {
            size: "sm",
            variant: alert.severity === "error" ? "default" : "outline",
            onClick: () => onActionClick == null ? void 0 : onActionClick(alert),
            children: alert.action.label
          }
        )
      ] }) })
    ] }, alert.id);
  }) });
}

// src/billing/InvoiceList.tsx
import { Download, ExternalLink, FileText as FileText2 } from "lucide-react";
import { Fragment as Fragment2, jsx as jsx33, jsxs as jsxs14 } from "react/jsx-runtime";
var statusColors = {
  paid: "bg-green-500",
  open: "bg-blue-500",
  draft: "bg-gray-500",
  void: "bg-gray-400",
  uncollectible: "bg-red-500"
};
function InvoiceList({
  invoices,
  total = 0,
  page = 0,
  pageSize = 10,
  onPageChange,
  onViewInvoice,
  onDownloadInvoice,
  formatDate = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}) {
  const totalPages = Math.ceil(total / pageSize);
  return /* @__PURE__ */ jsxs14(Card, { children: [
    /* @__PURE__ */ jsx33(CardHeader, { children: /* @__PURE__ */ jsxs14(CardTitle, { className: "flex items-center", children: [
      /* @__PURE__ */ jsx33(FileText2, { className: "mr-2 size-5" }),
      "Invoices"
    ] }) }),
    /* @__PURE__ */ jsx33(CardContent, { children: invoices.length === 0 ? /* @__PURE__ */ jsx33("div", { className: "py-8 text-center", children: /* @__PURE__ */ jsx33("p", { className: "text-gray-500", children: "No invoices yet" }) }) : /* @__PURE__ */ jsxs14(Fragment2, { children: [
      /* @__PURE__ */ jsxs14(Table, { children: [
        /* @__PURE__ */ jsx33(TableHeader, { children: /* @__PURE__ */ jsxs14(TableRow, { children: [
          /* @__PURE__ */ jsx33(TableHead, { children: "Invoice" }),
          /* @__PURE__ */ jsx33(TableHead, { children: "Date" }),
          /* @__PURE__ */ jsx33(TableHead, { children: "Amount" }),
          /* @__PURE__ */ jsx33(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx33(TableHead, { children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx33(TableBody, { children: invoices.map((invoice) => /* @__PURE__ */ jsxs14(TableRow, { children: [
          /* @__PURE__ */ jsx33(TableCell, { className: "font-medium", children: invoice.invoice_number || invoice.stripe_invoice_id }),
          /* @__PURE__ */ jsx33(TableCell, { children: formatDate(invoice.created_at) }),
          /* @__PURE__ */ jsxs14(TableCell, { children: [
            "$",
            invoice.amount_due.toFixed(2),
            " ",
            invoice.currency.toUpperCase()
          ] }),
          /* @__PURE__ */ jsx33(TableCell, { children: /* @__PURE__ */ jsx33(Badge, { className: statusColors[invoice.status], children: invoice.status }) }),
          /* @__PURE__ */ jsx33(TableCell, { children: /* @__PURE__ */ jsxs14("div", { className: "flex space-x-2", children: [
            invoice.stripe_hosted_invoice_url && /* @__PURE__ */ jsx33(
              Button,
              {
                size: "sm",
                variant: "ghost",
                onClick: () => onViewInvoice == null ? void 0 : onViewInvoice(invoice),
                children: /* @__PURE__ */ jsx33(ExternalLink, { className: "size-4" })
              }
            ),
            invoice.stripe_invoice_pdf && /* @__PURE__ */ jsx33(
              Button,
              {
                size: "sm",
                variant: "ghost",
                onClick: () => onDownloadInvoice == null ? void 0 : onDownloadInvoice(invoice),
                children: /* @__PURE__ */ jsx33(Download, { className: "size-4" })
              }
            )
          ] }) })
        ] }, invoice.id)) })
      ] }),
      totalPages > 1 && /* @__PURE__ */ jsxs14("div", { className: "mt-4 flex justify-center space-x-2", children: [
        /* @__PURE__ */ jsx33(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => onPageChange == null ? void 0 : onPageChange(page - 1),
            disabled: page === 0,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ jsxs14("span", { className: "flex items-center px-4 text-sm", children: [
          "Page ",
          page + 1,
          " of ",
          totalPages
        ] }),
        /* @__PURE__ */ jsx33(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => onPageChange == null ? void 0 : onPageChange(page + 1),
            disabled: page >= totalPages - 1,
            children: "Next"
          }
        )
      ] })
    ] }) })
  ] });
}

// src/billing/StorageUsage.tsx
import { AlertTriangle as AlertTriangle2, Database, FileImage, HardDrive, Layout } from "lucide-react";
import { jsx as jsx34, jsxs as jsxs15 } from "react/jsx-runtime";
var defaultFormatBytes = (bytes) => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};
function StorageUsage({
  current,
  limit,
  percentage,
  breakdown,
  currentTier = "current",
  onViewBreakdown,
  onUpgradeStorage,
  formatBytes = defaultFormatBytes,
  loading = false
}) {
  const isNearLimit = percentage > 80;
  const isOverLimit = percentage >= 100;
  if (loading) {
    return /* @__PURE__ */ jsxs15(Card, { children: [
      /* @__PURE__ */ jsxs15(CardHeader, { children: [
        /* @__PURE__ */ jsx34(CardTitle, { children: "Storage Usage" }),
        /* @__PURE__ */ jsx34(CardDescription, { children: "Loading storage information..." })
      ] }),
      /* @__PURE__ */ jsx34(CardContent, { children: /* @__PURE__ */ jsx34("div", { className: "h-20 animate-pulse rounded bg-muted" }) })
    ] });
  }
  return /* @__PURE__ */ jsxs15(Card, { children: [
    /* @__PURE__ */ jsxs15(CardHeader, { children: [
      /* @__PURE__ */ jsx34(CardTitle, { children: "Storage Usage" }),
      /* @__PURE__ */ jsx34(CardDescription, { children: "Track your organization's storage usage across all projects" })
    ] }),
    /* @__PURE__ */ jsxs15(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs15("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs15("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsx34("span", { className: "font-medium", children: "Total Storage Used" }),
          /* @__PURE__ */ jsxs15("span", { className: "text-muted-foreground", children: [
            current.toFixed(2),
            " GB /",
            " ",
            limit === -1 ? "Unlimited" : `${limit} GB`
          ] })
        ] }),
        /* @__PURE__ */ jsx34(
          Progress2,
          {
            value: limit === -1 ? 0 : percentage,
            className: isOverLimit ? "bg-destructive/20" : isNearLimit ? "bg-amber-500/20" : ""
          }
        ),
        isNearLimit && !isOverLimit && /* @__PURE__ */ jsxs15("p", { className: "mt-2 flex items-center gap-2 text-sm text-amber-600", children: [
          /* @__PURE__ */ jsx34(AlertTriangle2, { className: "size-4" }),
          "You're approaching your storage limit"
        ] }),
        isOverLimit && /* @__PURE__ */ jsxs15("p", { className: "mt-2 flex items-center gap-2 text-sm text-destructive", children: [
          /* @__PURE__ */ jsx34(AlertTriangle2, { className: "size-4" }),
          "Storage limit exceeded - uploads may be blocked"
        ] })
      ] }),
      breakdown && /* @__PURE__ */ jsxs15("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx34("h4", { className: "text-sm font-medium", children: "Storage Breakdown" }),
        /* @__PURE__ */ jsxs15("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs15("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs15("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx34(FileImage, { className: "size-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx34("span", { className: "text-sm", children: "Project Uploads" })
            ] }),
            /* @__PURE__ */ jsxs15("div", { className: "text-sm text-muted-foreground", children: [
              formatBytes(breakdown.project_uploads.bytes),
              " (",
              breakdown.project_uploads.count,
              " files)"
            ] })
          ] }),
          /* @__PURE__ */ jsxs15("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs15("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx34(HardDrive, { className: "size-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx34("span", { className: "text-sm", children: "Renders" })
            ] }),
            /* @__PURE__ */ jsxs15("div", { className: "text-sm text-muted-foreground", children: [
              formatBytes(breakdown.renders.bytes),
              " (",
              breakdown.renders.count,
              " files)"
            ] })
          ] }),
          /* @__PURE__ */ jsxs15("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs15("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx34(Layout, { className: "size-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx34("span", { className: "text-sm", children: "Templates" })
            ] }),
            /* @__PURE__ */ jsxs15("div", { className: "text-sm text-muted-foreground", children: [
              formatBytes(breakdown.templates.bytes),
              " (",
              breakdown.templates.count,
              " files)"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs15("div", { className: "flex gap-2", children: [
        !breakdown && onViewBreakdown && /* @__PURE__ */ jsxs15(Button, { variant: "outline", size: "sm", onClick: onViewBreakdown, children: [
          /* @__PURE__ */ jsx34(Database, { className: "mr-2 size-4" }),
          "View Breakdown"
        ] }),
        (isNearLimit || isOverLimit) && onUpgradeStorage && /* @__PURE__ */ jsx34(Button, { size: "sm", onClick: onUpgradeStorage, children: "Upgrade Storage" })
      ] }),
      /* @__PURE__ */ jsx34("div", { className: "border-t pt-4", children: /* @__PURE__ */ jsxs15("p", { className: "text-xs text-muted-foreground", children: [
        "Your ",
        currentTier,
        " plan includes",
        " ",
        limit === -1 ? "unlimited" : `${limit} GB of`,
        " storage.",
        limit !== -1 && " Additional storage may incur extra charges."
      ] }) })
    ] })
  ] });
}

// src/billing/PricingPlans.tsx
import { Check as Check4, X as X4 } from "lucide-react";
import { useState as useState3 } from "react";
import { jsx as jsx35, jsxs as jsxs16 } from "react/jsx-runtime";
function PricingPlans({
  plans,
  currentTier,
  onSubscribe,
  loading
}) {
  const [billingPeriod, setBillingPeriod] = useState3("monthly");
  return /* @__PURE__ */ jsxs16("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx35("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxs16("div", { className: "rounded-lg bg-gray-100 p-1", children: [
      /* @__PURE__ */ jsx35(
        "button",
        {
          className: `rounded px-4 py-2 text-sm font-medium transition ${billingPeriod === "monthly" ? "bg-white shadow" : "text-gray-600 hover:text-gray-900"}`,
          onClick: () => setBillingPeriod("monthly"),
          children: "Monthly"
        }
      ),
      /* @__PURE__ */ jsx35(
        "button",
        {
          className: `rounded px-4 py-2 text-sm font-medium transition ${billingPeriod === "yearly" ? "bg-white shadow" : "text-gray-600 hover:text-gray-900"}`,
          onClick: () => setBillingPeriod("yearly"),
          children: "Yearly (Save 20%)"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx35("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-4", children: plans.map((plan) => {
      const price = billingPeriod === "yearly" ? plan.price_yearly : plan.price_monthly;
      const isCurrentPlan = plan.tier === currentTier;
      const features = plan.features;
      return /* @__PURE__ */ jsxs16(Card, { className: isCurrentPlan ? "border-blue-500" : "", children: [
        /* @__PURE__ */ jsxs16(CardHeader, { children: [
          /* @__PURE__ */ jsxs16("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx35(CardTitle, { children: plan.name }),
            isCurrentPlan && /* @__PURE__ */ jsx35(Badge, { variant: "secondary", children: "Current Plan" })
          ] }),
          /* @__PURE__ */ jsxs16(CardDescription, { children: [
            /* @__PURE__ */ jsxs16("span", { className: "text-3xl font-bold", children: [
              "$",
              billingPeriod === "yearly" && price ? (price / 12).toFixed(0) : price
            ] }),
            /* @__PURE__ */ jsx35("span", { className: "text-gray-500", children: "/month" }),
            billingPeriod === "yearly" && price && /* @__PURE__ */ jsxs16("div", { className: "text-sm text-green-600", children: [
              "$",
              price,
              "/year"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs16(CardContent, { children: [
          /* @__PURE__ */ jsxs16("ul", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxs16("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx35(Check4, { className: "mr-2 size-4 text-green-500" }),
              plan.render_credits_monthly,
              " renders/month"
            ] }),
            /* @__PURE__ */ jsxs16("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx35(Check4, { className: "mr-2 size-4 text-green-500" }),
              plan.max_projects === -1 ? "Unlimited" : plan.max_projects,
              " projects"
            ] }),
            /* @__PURE__ */ jsxs16("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx35(Check4, { className: "mr-2 size-4 text-green-500" }),
              plan.max_team_members === -1 ? "Unlimited" : plan.max_team_members,
              " team members"
            ] }),
            /* @__PURE__ */ jsxs16("li", { className: "flex items-center", children: [
              features.watermark ? /* @__PURE__ */ jsx35(X4, { className: "mr-2 size-4 text-gray-400" }) : /* @__PURE__ */ jsx35(Check4, { className: "mr-2 size-4 text-green-500" }),
              features.watermark ? "Watermarked exports" : "No watermarks"
            ] }),
            features.exportFormats && /* @__PURE__ */ jsxs16("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx35(Check4, { className: "mr-2 size-4 text-green-500" }),
              "Export: ",
              features.exportFormats.join(", ")
            ] }),
            features.support && /* @__PURE__ */ jsxs16("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx35(Check4, { className: "mr-2 size-4 text-green-500" }),
              features.support,
              " support"
            ] }),
            features.customBranding && /* @__PURE__ */ jsxs16("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx35(Check4, { className: "mr-2 size-4 text-green-500" }),
              "Custom branding"
            ] }),
            features.apiAccess && /* @__PURE__ */ jsxs16("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx35(Check4, { className: "mr-2 size-4 text-green-500" }),
              "API access"
            ] }),
            features.sso && /* @__PURE__ */ jsxs16("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx35(Check4, { className: "mr-2 size-4 text-green-500" }),
              "SSO integration"
            ] })
          ] }),
          /* @__PURE__ */ jsx35(
            Button,
            {
              className: "mt-6 w-full",
              variant: isCurrentPlan ? "outline" : "default",
              disabled: isCurrentPlan || loading === plan.id,
              onClick: () => onSubscribe == null ? void 0 : onSubscribe(plan),
              children: loading === plan.id ? "Loading..." : isCurrentPlan ? "Current Plan" : plan.tier === "enterprise" ? "Contact Sales" : "Subscribe"
            }
          )
        ] })
      ] }, plan.id);
    }) })
  ] });
}
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertModal,
  AlertTitle,
  Badge,
  BillingAlerts,
  Button,
  ButtonLoader,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  ConfirmModal,
  DashboardStatsSkeleton,
  DataTable,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  EmptyCanvas,
  EmptyInbox,
  EmptyState,
  ErrorBoundary,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormFieldContext,
  FormItem,
  FormItemContext,
  FormLabel,
  FormMessage,
  InlineLoader,
  Input,
  InvoiceList,
  Label2 as Label,
  ListItemSkeleton,
  LoadingOverlay,
  Modal,
  NoCommentsEmptyState,
  NoLayersEmptyState,
  NoPlantsEmptyState,
  NoProjectsEmptyState,
  NoResultsEmptyState,
  NoTeamMembersEmptyState,
  PageErrorBoundary,
  PageLoader,
  PlantCardSkeleton,
  PricingPlans,
  Progress2 as Progress,
  ProjectCardSkeleton,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Separator3 as Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Spinner,
  StorageUsage,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableRowSkeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  badgeVariants,
  buttonTap,
  buttonVariants,
  cardHover,
  cn,
  fadeIn,
  fadeInUp,
  modalAnimation,
  reducer,
  staggerContainer,
  staggerItem,
  toast,
  useFormField,
  useToast,
  withErrorBoundary
};
/*! Bundled license information:

@tanstack/table-core/build/lib/index.mjs:
  (**
     * table-core
     *
     * Copyright (c) TanStack
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE.md file in the root directory of this source tree.
     *
     * @license MIT
     *)

@tanstack/react-table/build/lib/index.mjs:
  (**
     * react-table
     *
     * Copyright (c) TanStack
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE.md file in the root directory of this source tree.
     *
     * @license MIT
     *)
*/
//# sourceMappingURL=index.mjs.map