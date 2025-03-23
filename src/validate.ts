import {
  Config,
  Composition,
  DelimiterRules,
  createDelimiterRules,
} from "./config";
import { HexaUrlError, HexaUrlErrorCode } from "./error";

// Precompiled RegExp patterns for efficient text validation
const PATTERNS = {
  ALPHANUMERIC: /^[0-9A-Za-z]+$/,
  ALPHANUMERIC_HYPHEN: /^[0-9A-Za-z-]+$/,
  ALPHANUMERIC_UNDERSCORE: /^[0-9A-Za-z_]+$/,
  ALPHANUMERIC_HYPHEN_UNDERSCORE: /^[0-9A-Za-z\-_]+$/,
};

/**
 * Calculates the length of the decoded string based on the input byte count.
 * Uses SIXBIT 4:3 ratio.
 */
const calcStrLen = (n: number): number => (n * 4) / 3;

/**
 * Validates a HexaURL string against configurable rules.
 *
 * ---
 *
 * Performs validation checks in the following order:
 * 1. Length constraints (min/max) - throws InvalidLength error if minLength is greater than calculated max length
 * 2. Character composition based on identifier type
 * 3. Delimiter rules for hyphens and underscores
 *
 * ---
 *
 * Default configuration:
 * - Minimum length: 3 characters
 * - Maximum length: Based on byteSize parameter (16 bytes = 21 characters)
 * - Allowed chars: Alphanumeric with hyphens only
 * - Strict delimiter rules:
 *   - No leading/trailing delimiters
 *   - No consecutive delimiters
 *   - No adjacent hyphen-underscore pairs
 *
 * ---
 *
 * @param input The HexaURL string to validate
 * @param config Optional configuration for validation rules
 * @param byteSize The target byte array size after encoding (default 16)
 *
 * @throws {HexaUrlError} If any validation rule is violated, with specific error code and message
 */
export const validate = (
  input: string,
  config: Config = Config.create(),
  byteSize: number = 16,
): void => {
  const len = input.length;

  // Calculate effective maximum length
  const effectiveMax =
    config.maxLength !== null
      ? Math.min(config.maxLength, calcStrLen(byteSize))
      : calcStrLen(byteSize);

  // Check if effectiveMax is less than minLength
  if (config.minLength !== null && effectiveMax < config.minLength) {
    throwError(
      HexaUrlErrorCode.InvalidConfig,
      `Maximum length (${effectiveMax}) cannot be less than minimum length (${config.minLength})`,
    );
  }

  // Check minimum length
  config.minLength !== null &&
    len < config.minLength &&
    throwError(
      HexaUrlErrorCode.StringTooShort,
      `Too short: minimum length is ${config.minLength} characters`,
    );

  // Check maximum length
  len > effectiveMax &&
    throwError(
      HexaUrlErrorCode.StringTooLong,
      `Too long: maximum length is ${effectiveMax} characters`,
    );

  // Character validation based on identifier composition
  const [pattern, allowedChars] = getPatternForComposition(config.composition);
  !pattern.test(input) &&
    throwError(
      HexaUrlErrorCode.InvalidCharacter,
      `Invalid character: only ${allowedChars} are allowed`,
    );

  // Delimiter rules validation
  validateDelimiters(input, config.delimiter ?? createDelimiterRules());
};

/**
 * Maps identifier composition to corresponding RegExp pattern.
 * Patterns are precompiled for performance.
 */
const getPatternForComposition = (
  composition: Composition,
): [RegExp, string] => {
  switch (composition) {
    case Composition.Alphanumeric:
      return [PATTERNS.ALPHANUMERIC, "alphabets or numbers"];
    case Composition.AlphanumericHyphen:
      return [PATTERNS.ALPHANUMERIC_HYPHEN, "alphabets, numbers, or hyphens"];
    case Composition.AlphanumericUnderscore:
      return [
        PATTERNS.ALPHANUMERIC_UNDERSCORE,
        "alphabets, numbers, or underscores",
      ];
    case Composition.AlphanumericHyphenUnderscore:
      return [
        PATTERNS.ALPHANUMERIC_HYPHEN_UNDERSCORE,
        "alphabets, numbers, hyphens, or underscores",
      ];
  }
};

/**
 * Validates all delimiter-related rules against input string.
 * Checks both positional (leading/trailing) and sequential (consecutive/adjacent) rules.
 */
const validateDelimiters = (input: string, rules: DelimiterRules): void => {
  // Check leading/trailing delimiters
  !rules.allowLeadingTrailingHyphens &&
    (input.startsWith("-") || input.endsWith("-")) &&
    throwError(
      HexaUrlErrorCode.LeadingTrailingHyphen,
      "Cannot start or end with hyphens (-)",
    );

  !rules.allowLeadingTrailingUnderscores &&
    (input.startsWith("_") || input.endsWith("_")) &&
    throwError(
      HexaUrlErrorCode.LeadingTrailingUnderscore,
      "Cannot start or end with underscores (_)",
    );

  // Check consecutive delimiters
  !rules.allowConsecutiveHyphens &&
    input.includes("--") &&
    throwError(
      HexaUrlErrorCode.ConsecutiveHyphens,
      "Cannot contain consecutive hyphens (--)",
    );

  !rules.allowConsecutiveUnderscores &&
    input.includes("__") &&
    throwError(
      HexaUrlErrorCode.ConsecutiveUnderscores,
      "Cannot contain consecutive underscores (__)",
    );

  // Check adjacent different delimiters
  !rules.allowAdjacentHyphenUnderscore &&
    (input.includes("-_") || input.includes("_-")) &&
    throwError(
      HexaUrlErrorCode.AdjacentHyphenUnderscore,
      "Cannot contain adjacent hyphen and underscore combinations (-_ or _-)",
    );
};

/** Helper function to throw typed validation errors */
const throwError = (code: HexaUrlErrorCode, message: string): never => {
  throw new HexaUrlError(message, code);
};

/**
 * Performs a fast pre-validation safety check for HexaURL encoding to prevent errors and conflicts.
 *
 * Efficiently validates only string length constraints and ASCII character restriction, skipping full validation.
 *
 * Optimized for rapid pre-screening before search operations or other cases where generating an invalid
 * HexaURL temporarily is acceptable. The lighter validation makes it ideal for high-performance lookup scenarios
 * where a full validation pass is not required.
 *
 * ---
 *
 * @param input The string to check
 * @param byteSize The target byte array size after encoding (default 16)
 * @returns boolean indicating if the string is safe to encode
 */
export const isEncodingSafe = (input: string, byteSize: number = 16): boolean =>
  input.length <= calcStrLen(byteSize) && /^[\x00-\x7F]*$/.test(input);
