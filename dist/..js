"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Composition: () => Composition,
  Config: () => Config,
  HexaUrlError: () => HexaUrlError,
  HexaUrlErrorCode: () => HexaUrlErrorCode,
  createAllowedDelimiterRules: () => createAllowedDelimiterRules,
  createConfig: () => createConfig,
  createDelimiterRules: () => createDelimiterRules,
  isEncodingSafe: () => isEncodingSafe,
  validate: () => validate
});
module.exports = __toCommonJS(src_exports);

// src/config.ts
var Composition = /* @__PURE__ */ ((Composition2) => {
  Composition2[Composition2["Alphanumeric"] = 0] = "Alphanumeric";
  Composition2[Composition2["AlphanumericHyphen"] = 1] = "AlphanumericHyphen";
  Composition2[Composition2["AlphanumericUnderscore"] = 2] = "AlphanumericUnderscore";
  Composition2[Composition2["AlphanumericHyphenUnderscore"] = 3] = "AlphanumericHyphenUnderscore";
  return Composition2;
})(Composition || {});
var _Config = class _Config {
  constructor(minLength = _Config.DEFAULT_MIN_LENGTH, maxLength = null, composition = 1 /* AlphanumericHyphen */, delimiter = null) {
    this.minLength = minLength;
    this.maxLength = maxLength;
    this.composition = composition;
    this.delimiter = delimiter;
    this.toString = () => `Config(minLength=${this.minLength}, maxLength=${this.maxLength}, composition=${this.composition}, delimiter=${JSON.stringify(this.delimiter)})`;
    this.validate();
  }
  /** Creates a new Config from options */
  static create(options = {}) {
    return new _Config(
      options.minLength ?? _Config.DEFAULT_MIN_LENGTH,
      options.maxLength ?? null,
      options.composition ?? 1 /* AlphanumericHyphen */,
      options.delimiter ?? null
    );
  }
  /** Creates a minimal config with relaxed rules */
  static minimal() {
    return new _Config(
      null,
      null,
      3 /* AlphanumericHyphenUnderscore */,
      createAllowedDelimiterRules()
    );
  }
  /** Validates the config values */
  validate() {
    if (this.minLength !== null && this.maxLength !== null && this.minLength > this.maxLength) {
      throw new Error("Minimum length cannot be greater than maximum length");
    }
  }
};
_Config.DEFAULT_MIN_LENGTH = 3;
var Config = _Config;
var createDelimiterRules = (o = {}) => ({
  allowLeadingTrailingHyphens: false,
  allowLeadingTrailingUnderscores: false,
  allowConsecutiveHyphens: false,
  allowConsecutiveUnderscores: false,
  allowAdjacentHyphenUnderscore: false,
  ...o
});
var createAllowedDelimiterRules = () => ({
  allowLeadingTrailingHyphens: true,
  allowLeadingTrailingUnderscores: true,
  allowConsecutiveHyphens: true,
  allowConsecutiveUnderscores: true,
  allowAdjacentHyphenUnderscore: true
});
var createConfig = (o = {}) => Config.create(o);

// src/error.ts
var HexaUrlError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
};
var HexaUrlErrorCode = /* @__PURE__ */ ((HexaUrlErrorCode2) => {
  HexaUrlErrorCode2[HexaUrlErrorCode2["StringTooLong"] = 0] = "StringTooLong";
  HexaUrlErrorCode2[HexaUrlErrorCode2["StringTooShort"] = 1] = "StringTooShort";
  HexaUrlErrorCode2[HexaUrlErrorCode2["BytesTooLong"] = 2] = "BytesTooLong";
  HexaUrlErrorCode2[HexaUrlErrorCode2["BytesTooShort"] = 3] = "BytesTooShort";
  HexaUrlErrorCode2[HexaUrlErrorCode2["InvalidCharacter"] = 4] = "InvalidCharacter";
  HexaUrlErrorCode2[HexaUrlErrorCode2["InvalidConfig"] = 5] = "InvalidConfig";
  HexaUrlErrorCode2[HexaUrlErrorCode2["InvalidLength"] = 6] = "InvalidLength";
  HexaUrlErrorCode2[HexaUrlErrorCode2["LeadingTrailingHyphen"] = 7] = "LeadingTrailingHyphen";
  HexaUrlErrorCode2[HexaUrlErrorCode2["LeadingTrailingUnderscore"] = 8] = "LeadingTrailingUnderscore";
  HexaUrlErrorCode2[HexaUrlErrorCode2["ConsecutiveHyphens"] = 9] = "ConsecutiveHyphens";
  HexaUrlErrorCode2[HexaUrlErrorCode2["ConsecutiveUnderscores"] = 10] = "ConsecutiveUnderscores";
  HexaUrlErrorCode2[HexaUrlErrorCode2["AdjacentHyphenUnderscore"] = 11] = "AdjacentHyphenUnderscore";
  return HexaUrlErrorCode2;
})(HexaUrlErrorCode || {});

// src/validate.ts
var PATTERNS = {
  ALPHANUMERIC: /^[0-9A-Za-z]+$/,
  ALPHANUMERIC_HYPHEN: /^[0-9A-Za-z-]+$/,
  ALPHANUMERIC_UNDERSCORE: /^[0-9A-Za-z_]+$/,
  ALPHANUMERIC_HYPHEN_UNDERSCORE: /^[0-9A-Za-z\-_]+$/
};
var calcStrLen = (n) => n * 4 / 3;
var validate = (input, config = Config.create(), byteSize = 16) => {
  const len = input.length;
  const effectiveMax = config.maxLength !== null ? Math.min(config.maxLength, calcStrLen(byteSize)) : calcStrLen(byteSize);
  if (config.minLength !== null && effectiveMax < config.minLength) {
    throwError(
      5 /* InvalidConfig */,
      `Maximum length (${effectiveMax}) cannot be less than minimum length (${config.minLength})`
    );
  }
  config.minLength !== null && len < config.minLength && throwError(
    1 /* StringTooShort */,
    `Too short: minimum length is ${config.minLength} characters`
  );
  len > effectiveMax && throwError(
    0 /* StringTooLong */,
    `Too long: maximum length is ${effectiveMax} characters`
  );
  const [pattern, allowedChars] = getPatternForComposition(config.composition);
  !pattern.test(input) && throwError(
    4 /* InvalidCharacter */,
    `Invalid character: only ${allowedChars} are allowed`
  );
  validateDelimiters(input, config.delimiter ?? createDelimiterRules());
};
var getPatternForComposition = (composition) => {
  switch (composition) {
    case 0 /* Alphanumeric */:
      return [PATTERNS.ALPHANUMERIC, "alphabets or numbers"];
    case 1 /* AlphanumericHyphen */:
      return [PATTERNS.ALPHANUMERIC_HYPHEN, "alphabets, numbers, or hyphens"];
    case 2 /* AlphanumericUnderscore */:
      return [
        PATTERNS.ALPHANUMERIC_UNDERSCORE,
        "alphabets, numbers, or underscores"
      ];
    case 3 /* AlphanumericHyphenUnderscore */:
      return [
        PATTERNS.ALPHANUMERIC_HYPHEN_UNDERSCORE,
        "alphabets, numbers, hyphens, or underscores"
      ];
  }
};
var validateDelimiters = (input, rules) => {
  !rules.allowLeadingTrailingHyphens && (input.startsWith("-") || input.endsWith("-")) && throwError(
    7 /* LeadingTrailingHyphen */,
    "Cannot start or end with hyphens (-)"
  );
  !rules.allowLeadingTrailingUnderscores && (input.startsWith("_") || input.endsWith("_")) && throwError(
    8 /* LeadingTrailingUnderscore */,
    "Cannot start or end with underscores (_)"
  );
  !rules.allowConsecutiveHyphens && input.includes("--") && throwError(
    9 /* ConsecutiveHyphens */,
    "Cannot contain consecutive hyphens (--)"
  );
  !rules.allowConsecutiveUnderscores && input.includes("__") && throwError(
    10 /* ConsecutiveUnderscores */,
    "Cannot contain consecutive underscores (__)"
  );
  !rules.allowAdjacentHyphenUnderscore && (input.includes("-_") || input.includes("_-")) && throwError(
    11 /* AdjacentHyphenUnderscore */,
    "Cannot contain adjacent hyphen and underscore combinations (-_ or _-)"
  );
};
var throwError = (code, message) => {
  throw new HexaUrlError(message, code);
};
var isEncodingSafe = (input, byteSize = 16) => input.length <= calcStrLen(byteSize) && /^[\x00-\x7F]*$/.test(input);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Composition,
  Config,
  HexaUrlError,
  HexaUrlErrorCode,
  createAllowedDelimiterRules,
  createConfig,
  createDelimiterRules,
  isEncodingSafe,
  validate
});
/*!
 * hexaurl-validate-js
 * Copyright (c) 2025 Inomoto, Yota
 * Released under the MIT and Apache 2.0 Licenses
 * https://opensource.org/licenses/MIT
 * https://www.apache.org/licenses/LICENSE-2.0
 */
//# sourceMappingURL=..js.map