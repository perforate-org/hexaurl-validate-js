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
    `String is too short: minimum length is ${config.minLength} characters`
  );
  len > effectiveMax && throwError(
    0 /* StringTooLong */,
    `String is too long: maximum length is ${effectiveMax} characters`
  );
  !getPatternForComposition(config.composition).test(input) && throwError(
    4 /* InvalidCharacter */,
    "Invalid character in this type of HexaURL"
  );
  validateDelimiters(input, config.delimiter ?? createDelimiterRules());
};
var getPatternForComposition = (composition) => {
  switch (composition) {
    case 0 /* Alphanumeric */:
      return PATTERNS.ALPHANUMERIC;
    case 1 /* AlphanumericHyphen */:
      return PATTERNS.ALPHANUMERIC_HYPHEN;
    case 2 /* AlphanumericUnderscore */:
      return PATTERNS.ALPHANUMERIC_UNDERSCORE;
    case 3 /* AlphanumericHyphenUnderscore */:
      return PATTERNS.ALPHANUMERIC_HYPHEN_UNDERSCORE;
  }
};
var validateDelimiters = (input, rules) => {
  !rules.allowLeadingTrailingHyphens && (input.startsWith("-") || input.endsWith("-")) && throwError(
    7 /* LeadingTrailingHyphen */,
    "Hyphens cannot start or end this type of HexaURL"
  );
  !rules.allowLeadingTrailingUnderscores && (input.startsWith("_") || input.endsWith("_")) && throwError(
    8 /* LeadingTrailingUnderscore */,
    "Underscores cannot start or end this type of HexaURL"
  );
  !rules.allowConsecutiveHyphens && input.includes("--") && throwError(
    9 /* ConsecutiveHyphens */,
    "This type of HexaURL cannot include consecutive hyphens"
  );
  !rules.allowConsecutiveUnderscores && input.includes("__") && throwError(
    10 /* ConsecutiveUnderscores */,
    "This type of HexaURL cannot include consecutive underscores"
  );
  !rules.allowAdjacentHyphenUnderscore && (input.includes("-_") || input.includes("_-")) && throwError(
    11 /* AdjacentHyphenUnderscore */,
    "This type of HexaURL cannot include adjacent hyphens and underscores"
  );
};
var throwError = (code, message) => {
  throw new HexaUrlError(message, code);
};
var isEncodingSafe = (input, byteSize = 16) => input.length <= calcStrLen(byteSize) && /^[\x00-\x7F]*$/.test(input);
export {
  Composition,
  Config,
  HexaUrlError,
  HexaUrlErrorCode,
  createAllowedDelimiterRules,
  createConfig,
  createDelimiterRules,
  isEncodingSafe,
  validate
};
/*!
 * hexaurl-validate-js
 * Copyright (c) 2025 Inomoto, Yota
 * Released under the MIT and Apache 2.0 Licenses
 * https://opensource.org/licenses/MIT
 * https://www.apache.org/licenses/LICENSE-2.0
 */
//# sourceMappingURL=index.mjs.map