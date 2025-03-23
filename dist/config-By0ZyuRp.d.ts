/** Valid options for identifier composition */
declare enum Composition {
    /** Letters and digits */
    Alphanumeric = 0,
    /** Letters, digits and hyphen */
    AlphanumericHyphen = 1,
    /** Letters, digits and underscore */
    AlphanumericUnderscore = 2,
    /** Letters, digits, hyphen and underscore */
    AlphanumericHyphenUnderscore = 3
}
/** Rules for how delimiters can be used */
interface DelimiterRules {
    allowLeadingTrailingHyphens: boolean;
    allowLeadingTrailingUnderscores: boolean;
    allowConsecutiveHyphens: boolean;
    allowConsecutiveUnderscores: boolean;
    allowAdjacentHyphenUnderscore: boolean;
}
/** Optional configuration parameters */
interface ConfigOptions {
    minLength?: number | null;
    maxLength?: number | null;
    composition?: Composition;
    delimiter?: DelimiterRules | null;
}
/** Configuration for validation rules */
declare class Config {
    readonly minLength: number | null;
    readonly maxLength: number | null;
    readonly composition: Composition;
    readonly delimiter: DelimiterRules | null;
    private static readonly DEFAULT_MIN_LENGTH;
    constructor(minLength?: number | null, maxLength?: number | null, composition?: Composition, delimiter?: DelimiterRules | null);
    /** Creates a new Config from options */
    static create(options?: ConfigOptions): Config;
    /** Creates a minimal config with relaxed rules */
    static minimal(): Config;
    /** Validates the config values */
    private validate;
    toString: () => string;
}
/** Creates delimiter rules with specified options */
declare const createDelimiterRules: (o?: Partial<DelimiterRules>) => DelimiterRules;
/** Creates delimiter rules with all options enabled */
declare const createAllowedDelimiterRules: () => DelimiterRules;
/** Creates a new Config with provided options */
declare const createConfig: (o?: ConfigOptions) => Config;

export { Config as C, type DelimiterRules as D, type ConfigOptions as a, Composition as b, createConfig as c, createDelimiterRules as d, createAllowedDelimiterRules as e };
