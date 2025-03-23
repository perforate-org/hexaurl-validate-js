import { C as Config } from './config-By0ZyuRp.mjs';
export { b as Composition, a as ConfigOptions, D as DelimiterRules, e as createAllowedDelimiterRules, c as createConfig, d as createDelimiterRules } from './config-By0ZyuRp.mjs';

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
declare const validate: (input: string, config?: Config, byteSize?: number) => void;
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
declare const isEncodingSafe: (input: string, byteSize?: number) => boolean;

/** Custom error class for HexaURL validation errors */
declare class HexaUrlError extends Error {
    /** Error code identifying the specific validation failure */
    readonly code: HexaUrlErrorCode;
    constructor(message: string, 
    /** Error code identifying the specific validation failure */
    code: HexaUrlErrorCode);
}
/** Enum of possible HexaURL validation error codes */
declare enum HexaUrlErrorCode {
    /** String exceeds maximum length */
    StringTooLong = 0,
    /** String is shorter than minimum length */
    StringTooShort = 1,
    /** Byte array exceeds maximum length */
    BytesTooLong = 2,
    /** Byte array is shorter than minimum length */
    BytesTooShort = 3,
    /** Contains invalid characters */
    InvalidCharacter = 4,
    /** Configuration is invalid */
    InvalidConfig = 5,
    /** Length is invalid for encoding type */
    InvalidLength = 6,
    /** Has hyphens at start/end when not allowed */
    LeadingTrailingHyphen = 7,
    /** Has underscores at start/end when not allowed */
    LeadingTrailingUnderscore = 8,
    /** Contains consecutive hyphens when not allowed */
    ConsecutiveHyphens = 9,
    /** Contains consecutive underscores when not allowed */
    ConsecutiveUnderscores = 10,
    /** Has adjacent hyphen+underscore when not allowed */
    AdjacentHyphenUnderscore = 11
}

export { Config, HexaUrlError, HexaUrlErrorCode, isEncodingSafe, validate };
