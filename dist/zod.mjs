// src/zod/index.ts
import { ZodString } from "zod";

// src/config.ts
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

// src/error.ts
var HexaUrlError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
};

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

// src/zod/index.ts
ZodString.prototype.hexaurl = function(config = Config.create(), byteSize = 16) {
  return this.superRefine((value, ctx) => {
    try {
      validate(value, config, byteSize);
    } catch (err) {
      if (err instanceof HexaUrlError) {
        ctx.addIssue({
          code: "custom",
          message: err.message + ` (code: ${err.code})`
        });
      } else {
        ctx.addIssue({
          code: "custom",
          message: "Unknown error during HexaURL validation"
        });
      }
    }
  });
};
/*!
 * hexaurl-validate-js
 * Copyright (c) 2025 Inomoto, Yota
 * Released under the MIT and Apache 2.0 Licenses
 * https://opensource.org/licenses/MIT
 * https://www.apache.org/licenses/LICENSE-2.0
 */
//# sourceMappingURL=zod.mjs.map