// Copyright (C) 2024 Rubber Roofing Direct. All rights reserved.
//
// This source code file is a part of free software licensed under the terms of
// the MIT License as published by the Massachusetts Institute of Technology:
// you can use, copy, modify and distribute any part of it without limitation,
// subject to the conditions contained within that license.
//
// This source code file, and the software it forms a part of, IS PROVIDED "AS
// IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. See the MIT License
// for more details.
//
// You should have received a copy of the MIT License along with this source
// code file in the root of this repository. If not, see one of the following
// 3rd party sites for a copy of the license template:
// - <https://opensource.org/licenses/MIT>
// - <https://choosealicense.com/licenses/mit>
// - <https://spdx.org/licenses/MIT>

/**
 * @file Config file for custom eslint configuration. This file is an
 * opinionated eslint configuration. In terms of number of rules specified in
 * this file, it is a reasonably detailed/specific configuration. For more
 * information for getting started with eslint, see here:
 * https://eslint.org/docs/latest/use/getting-started. For more information
 * specifically on configuring eslint with a .eslintrc, see here:
 * https://eslint.org/docs/latest/use/configure.
 * @ignore
 * @author James Reid
 */

// @ts-check

// @ts-nocheck

// @@imports-dependencies
import js from "@eslint/js"
import globals from "globals"
import eslintPluginEslintComments from "eslint-plugin-eslint-comments"
import eslintPluginRegex from "eslint-plugin-regex"
import jsdoc from "eslint-plugin-jsdoc"

// @@body
const config = [
    // Default option set provided by eslint, which the rules object below
    // either add to or overwrite.
    js.configs.recommended,

    {
        // File patterns to ignore (replaces .eslintignore file from v8 and
        // and below). For more information, see here:
        // https://eslint.org/docs/latest/use/configure/ignore#ignoring-files.
        ignores: [
            "build/*",
            "dist/*",
            ".cache/*"
        ],

        // Language option configuration, for more information, see here:
        // https://eslint.org/docs/latest/use/configure/language-options#specifying-environments.
        languageOptions: {
            // Predefined global variables which should be available in a given
            // script, and therefore should not trigger the "no-undef" error.
            // For more information, see here:
            // https://eslint.org/docs/latest/use/configure/language-options#predefined-global-variables.
            globals: {
                ...globals.browser,
                ...globals.es2021,
                ...globals.node
            },

            // Specify language options which should be supported, most notably
            // node modules instead of commonjs. For more information, see here:
            // https://eslint.org/docs/latest/use/configure/language-options#specifying-parser-options.
            parserOptions: {
                ecmaVersion: "latest",
                sourceTyp: "module"
            }
        },

        // Specify plugins used by this configuration, for more information, see
        // here: https://eslint.org/docs/latest/use/configure/plugins.
        plugins: {
            eslintPluginEslintComments,
            eslintPluginRegex,
            jsdoc
        },

        // Rules which add to or overwrite the existing default rule set implied
        // by the "extends" field. For more information on rule configuration,
        // see here: https://eslint.org/docs/latest/rules. For more information
        // on any rule set below, see https://eslint.org/docs/latest/rules/<rule-name>.
        // Note that not ALL rules are explicitly set/unset below. Use of ESLint
        // warnings, which may often be ignored, is generally avoided in favour
        // of throwing an error for any incorrect formatting.
        rules: {
            // Plugin-specific eslint configurations.

            // Plugin configuration for the eslint-comments plugin, mainly for
            // ensuring that there are no unused, unrestricted or unclosed
            // eslint directives. For more information, please see the plugin
            // page here: https://mysticatea.github.io/eslint-plugin-eslint-comments/.

            // Best practice rules for eslint-comments plugin.
            "eslintPluginEslintComments/disable-enable-pair": "error",
            "eslintPluginEslintComments/no-aggregating-enable": "off",
            "eslintPluginEslintComments/no-duplicate-disable": "error",
            "eslintPluginEslintComments/no-unlimited-disable": "error",
            "eslintPluginEslintComments/no-unused-disable": "error",
            "eslintPluginEslintComments/no-unused-enable": "error",

            // Stylistic suggestions for eslint-comments plugin.
            "eslintPluginEslintComments/no-restricted-disable": "off",
            "eslintPluginEslintComments/no-use": "off",
            "eslintPluginEslintComments/require-description": "error",

            // Regex plugin configuration used for ensuring that specific
            // patterns are/are not matched in any given script. For more
            // information on configuration, see here: https://github.com/gmullerb/eslint-plugin-regex.

            // Invalid regex configuration - i.e. patterns which are not valid
            // in any script. Plugin provides replacement method for
            // regex/invalid rules to automatically resolve a given issue. As
            // such these patterns are preferred over the regex/required
            // patterns.
            "eslintPluginRegex/invalid": ["error", [
                // Ensure that each file starts with the required header,
                // including license text, jsdoc file description, and @ts-check
                // or @ts-nocheck directive (in listed order). Note that no
                // rules are included to check for/prevent duplicate header
                // elements elsewhere in a script, although these should be very
                // obvious to spot any time someone is working on a given
                // script.
                {
                    "id": "noMissingScriptHeader",
                    "regex": "(?<!.|\n)(?!\\/\\/ Copyright \\(C\\) \\d{4} .*\\. All rights reserved\\.\n\\/\\/\n\\/\\/ This source code file is a part of free software licensed under the terms of\n\\/\\/ the MIT License as published by the Massachusetts Institute of Technology:\n\\/\\/ you can use, copy, modify and distribute any part of it without limitation,\n\\/\\/ subject to the conditions contained within that license\\.\n\\/\\/\n\\/\\/ This source code file, and the software it forms a part of, IS PROVIDED \"AS\n\\/\\/ IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED\\. See the MIT License\n\\/\\/ for more details\\.\n\\/\\/\n\\/\\/ You should have received a copy of the MIT License along with this source\n\\/\\/ code file in the root of this repository\\. If not, see one of the following\n\\/\\/ 3rd party sites for a copy of the license template:\n\\/\\/ - <https://opensource\\.org/licenses/MIT>\n\\/\\/ - <https://choosealicense\\.com/licenses/mit>\n\\/\\/ - <https://spdx\\.org/licenses/MIT>\n\n\\/\\*\\*\\s*\n(\\s*\\*\\s*.*(?!\\*\\/)\\s*\n)*(\\s*\\*\\s*@file\\s.*\n)(\\s*\\*\\s*.*(?!\\*\\/)\\s*\n)*(\\s*\\*\\s*@author\\s.*\n)+(\\s*\\*\\s*.*(?!\\*\\/)\\s*\n)*\\s*\\*\\/\n\n\\/\\/ (@ts-check|@ts-nocheck)(\n| .*\n)\n)",
                    "message": "Script must start with license information, file description, and @ts-check or @ts-nocheck directive.",
                    "replacement": {
                        // Insert placeholder header at start of file.
                        /*
                        eslint-disable-next-line eslintPluginRegex/invalid --
                        Following string contains blocks considered to be
                        missing header details.
                        */
                        "function": "return `// Copyright (C) <INSERT_YEAR_HERE> <INSERT_OWNER_HERE>. All rights reserved.\n//\n// This source code file is a part of free software licensed under the terms of\n// the MIT License as published by the Massachusetts Institute of Technology:\n// you can use, copy, modify and distribute any part of it without limitation,\n// subject to the conditions contained within that license.\n//\n// This source code file, and the software it forms a part of, IS PROVIDED \"AS\n// IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. See the MIT License\n// for more details.\n//\n// You should have received a copy of the MIT License along with this source\n// code file in the root of this repository. If not, see one of the following\n// 3rd party sites for a copy of the license template:\n// - <https://opensource.org/licenses/MIT>\n// - <https://choosealicense.com/licenses/mit>\n// - <https://spdx.org/licenses/MIT>\n\n/**\n * @file <INSERT_FILE_DESCRIPTION_HERE>\n * @author <INSERT_AUTHOR_HERE>\n */\n\n// @ts-check\n\n`"
                    }
                },

                // Ensure that all placeholder header details have been
                // populated when the header has been added using the
                // regex/invalid replacement function.
                {
                    "id": "noMissingHeaderDetails",
                    "regex": "(?<=//.*|/\\*\\*.*\n([^\\*]|(\\*(?!/)))*\\s*\\*.*)<INSERT_[_A-Z]*_HERE>",
                    "message": "All header details must be populated."
                },

                // Ensure that no invalid block tags are used in a scripts
                // (mainly for enforcing correct block tags when using multiple
                // import blocks).
                {
                    "id": "noInvalidBlockTags",
                    "regex": "(?<=// )@@(?!((no-)?(body|exports|imports)|imports(-(node|dependencies|utils|package|module|submodule|types)))\\s)",
                    "message": "Invalid @@<block> block tags not permitted. Remove block tag, or use a valid tag.",
                    "replacement": {
                        // Remove @@ in front of matched invalid tag.
                        "function": "return ``"
                    }
                },

                /*
                eslint-disable eslintPluginRegex/invalid --
                Regex strings in the following rule definitions are themselves
                considered to be invalid block tags.
                */

                // Ensure that no block tag has a description (i.e. a newline
                // character immediately follows the end of the tag).
                {
                    "id": "noBlockTagDescriptions",
                    "regex": "(?<=// @@[-a-z]*) .*",
                    "message": "Block tag descriptions are not permitted.",
                    "replacement": {
                        // Remove any matched block tag description.
                        "function": "return ``"
                    }
                },

                // Ensure that every block tag is preceded by a blank line. New
                // lines AFTER block tags at the end of a file are enforced by
                // the eslint "eol-last" setting.
                {
                    "id": "noBlockTagPreviousLine",
                    "regex": "(?<!\n\n)// @@.*",
                    "message": "Block tags must be preceded by a blank line.",
                    "replacement": {
                        // Insert extra newline before matched tag.
                        "function": "return `\n${text}`"
                    }
                },

                // Ensure that any block with the "no-" prefix has no content
                // contained within it before the start of the next block.
                {
                    "id": "noUsedEmptyBlocks",
                    "regex": "(?<=// @@)no-.*(?=\n)(?!\n*(// @@.*|$(?!\n)))",
                    "message": "Cannot use @@no-<block> to mark a non-empty block, use @@<block> instead.",
                    "replacement": {
                        // Remove "no-" prefix from matched tag.
                        "function": "return `${text.replace('no-', '')}`"
                    }
                },

                // Ensure that any block without the "no-" prefix has some
                // content contained within it before the start of the next
                // block.
                {
                    "id": "noUnusedBlocks",
                    "regex": "(?<=// @@)[^no-].*(?=\n*(// @@.*|$(?!\n)))",
                    "message": "Cannot use @@<block> to mark an empty block, use @@no-<block> instead.",
                    "replacement": {
                        // Add "no-" prefix tp matched tag.
                        "function": "return `no-${text}`"
                    }
                },

                // Ensure that body or export blocks do not appear more than
                // once in a given script.
                {
                    "id": "noDuplicateUniqueBlocks",
                    "regex": "(?<=// @@(no-)?body(.*\n)*)// @@(no-)?body|(?<=// @@(no-)?exports(.*\n)*)// @@(no-)?exports",
                    "message": "Unique blocks @@body and @@export cannot appear more than once in a script.",
                    "replacement": {
                        // Remove duplicate matched tag.
                        "function": "return ``"
                    }
                },

                // Ensure that every script has one or more import block(s), a
                // body block, and and export block. Additionally ensures that
                // these blocks appear in the correct order.
                {
                    "id": "noMissingBlocks",
                    "regex": "(?<!.|\n)(?!(.*\n)*// @@((no-)?imports|imports-[a-z]*)\\s(.*\n)*// @@(no-)?body\\s(.*\n)*// @@(no-)?exports\\s)",
                    "message": "One or more @@<block> tags missing, or blocks are in incorrect order."
                },

                //
                {
                    "id": "noInvalidOptionalDestructuredParametersDescription",
                    "regex": "(?<=\n\\s*\\*\\s*@param\\s*{object}\\s*obj)(?! Optional destructured parameters object\\.).*",
                    "message": "Optional destructured parameters object jsdoc description incorrect.",
                    "replacement": {
                        "function": "return ` Optional destructured parameters object.`"
                    }
                }

                /*
                eslint-enable eslintPluginRegex/invalid --
                Enable previously disabled lint rule, since regex rules have all
                been declared.
                */
            ]],

            // Plugin configuration for the jsdoc plugin, mainly for ensuring
            // that jsdoc comments are consistently formatted, and don't contain
            // any invalid or incorrectly used tags. For more information,
            // please see the plugin github here: https://github.com/gajus/eslint-plugin-jsdoc.
            // See the following notes for reasons some useful rules are off:
            //      - check-examples: Extensive configuration required to match
            //      existing eslint checks, and do not use @examples tag often.
            //      - check-types: Type checking is offloaded on tsc.
            //      - imports-as-dependencies: Local type imports not allowed.
            //      - valid-types: Type checking is offloaded on tsc.
            // See the following note for reasons some rules are on:
            //      - no-undefined-types: Marks type imports as "used" as
            //      side effect, removing need for eslint directives for type
            //      imports.
            "jsdoc/check-access": "error",
            "jsdoc/check-alignment": "error",
            "jsdoc/check-examples": "off",
            "jsdoc/check-indentation": "error",
            "jsdoc/check-line-alignment": "off",
            "jsdoc/check-param-names": "error",
            "jsdoc/check-property-names": "error",
            "jsdoc/check-syntax": "error",
            "jsdoc/check-tag-names": "off",
            "jsdoc/check-types": "off",
            "jsdoc/check-values": "error",
            "jsdoc/empty-tags": "error",
            "jsdoc/implements-on-classes": "error",
            "jsdoc/imports-as-dependencies": "off",
            "jsdoc/informative-docs": "error",
            "jsdoc/match-description": "error",
            "jsdoc/match-name": "off",
            "jsdoc/multiline-blocks": ["error", {
                "noSingleLineBlocks": true,
                "singleLineTags": [
                    "lends",
                    "type",
                    "enum",
                    "package",
                    "private",
                    "protected",
                    "public"
                ]
            }],
            "jsdoc/no-bad-blocks": "error",
            "jsdoc/no-blank-block-descriptions": "error",
            "jsdoc/no-blank-blocks": "error",
            "jsdoc/no-defaults": "off",
            "jsdoc/no-missing-syntax": "off",
            "jsdoc/no-multi-asterisks": "error",
            "jsdoc/no-restricted-syntax": "off",
            "jsdoc/no-types": "off",
            "jsdoc/no-undefined-types": "error",
            "jsdoc/require-asterisk-prefix": "error",
            "jsdoc/require-description-complete-sentence": ["error", {
                "abbreviations": ["etc", "i.e", "e.g"],
                "newlineBeforeCapsAssumesBadSentenceEnd": false
            }],
            "jsdoc/require-description": "error",
            "jsdoc/require-example": "off",
            "jsdoc/require-file-overview": "error",
            "jsdoc/require-hyphen-before-param-description": ["error", "never"],
            "jsdoc/require-jsdoc": "error",
            "jsdoc/require-param-description": "error",
            "jsdoc/require-param-name": "error",
            "jsdoc/require-param-type": "error",
            "jsdoc/require-param": "error",
            "jsdoc/require-property-description": "error",
            "jsdoc/require-property-name": "error",
            "jsdoc/require-property-type": "error",
            "jsdoc/require-property": "error",
            "jsdoc/require-returns-check": "error",
            "jsdoc/require-returns-description": "error",
            "jsdoc/require-returns-type": "error",
            "jsdoc/require-returns": ["error", {
                "checkGetters": false
            }],
            "jsdoc/require-throws": "error",
            "jsdoc/require-yields-check": "error",
            "jsdoc/require-yields": "error",
            "jsdoc/sort-tags": "error",
            "jsdoc/tag-lines": ["error", "never"],
            "jsdoc/text-escaping": "off",
            "jsdoc/valid-types": "off",

            // Eslint "problems" relating to possible logic errors in code. Most
            // rules turned on by default, the following configuration turns off
            // or changes inconvenient default settings. For more information,
            // see here: https://eslint.org/docs/latest/rules/#possible-problems.
            "no-control-regex": "off",
            "no-duplicate-imports": "error",
            "no-ex-assign": "off",
            "no-unused-private-class-members": "error",

            // Eslint "suggestions" relating to alternate ways of organising
            // code which will not give rise to logical errors if not followed,
            // but may be preferable for reducing unnecessary blocks, or
            // enforcing naming conventions etc. Most rules in this category are
            // disabled by default, and this configuration only enables a
            // selection. For more information on all available rules in this
            // category, see here: https://eslint.org/docs/latest/rules/#suggestions.
            "curly": ["error", "all"],
            "default-case": ["error", {
                "commentPattern": "^@no-default"
            }],
            "default-case-last": "error",
            "default-param-last": "error",
            "eqeqeq": "error",
            "func-style": ["error", "declaration", {
                "allowArrowFunctions": true
            }],
            "grouped-accessor-pairs": "error",
            "guard-for-in": "off",
            "id-denylist": ["error", "err", "e", "ev", "cb"],
            "id-match": ["error", "(^[A-Z]?[a-z0-9]*([A-Z][a-z0-9]*)*$)|(^([A-Z0-9]+_?)*$)", {
                "properties": false,
                "classFields": false,
                "onlyDeclarations": true,
                "ignoreDestructuring": true
            }],
            "multiline-comment-style": ["error", "separate-lines"],
            "new-cap": ["error", {
                "newIsCap": true,
                "capIsNew": true,
                "capIsNewExceptions": ["Array"]
            }],
            "no-else-return": "error",
            "no-extra-label": "error",
            "no-label-var": "error",
            "no-lone-blocks": "error",
            "no-useless-return": "error",
            "no-var": "error",
            "prefer-const": "error",
            "spaced-comment": ["error", "always"],
            "yoda": "error",

            // Eslint "layout" rules which have no impact on how the code runs,
            // and only relate to how the code appears in the editor. The
            // majority of these rules are turned off by default, and this
            // configuration sets ALL rules in this category. If the rule should
            // remain off, this configuration explicitly sets it to off below.
            // For more information, see here: https://eslint.org/docs/latest/rules/#layout--formatting.
            "array-bracket-newline": ["error", "consistent"],
            "array-bracket-spacing": ["error", "never"],
            "array-element-newline": ["error", "consistent"],
            "arrow-parens": ["error", "as-needed"],
            "arrow-spacing": ["error", {
                "before": true,
                "after": true
            }],
            "block-spacing": ["error", "always"],
            "brace-style": ["error", "stroustrup", {
                "allowSingleLine": true
            }],
            "comma-dangle": ["error", "only-multiline"],
            "comma-spacing": ["error", {
                "before": false,
                "after": true
            }],
            "comma-style": ["error", "last"],
            "computed-property-spacing": ["error", "never", {
                "enforceForClassMembers": true
            }],
            "dot-location": ["error", "property"],
            "eol-last": ["error", "always"],
            "func-call-spacing": ["error", "never"],
            "function-call-argument-newline": ["error", "consistent"],
            "function-paren-newline": ["error", "consistent"],
            "generator-star-spacing": ["error", {
                "before": false,
                "after": true
            }],
            "implicit-arrow-linebreak": ["error", "beside"],
            "indent": ["error", 4, {
                "ignoredNodes": ["ConditionalExpression"],
                "SwitchCase": 1
            }],
            "jsx-quotes": ["error", "prefer-double"],
            "key-spacing": ["error", {
                "beforeColon": false,
                "afterColon": true,
                "mode": "strict"
            }],
            "keyword-spacing": ["error", {
                "before": true,
                "after": true
            }],
            "line-comment-position": ["off"],
            "linebreak-style": ["error", "unix"],
            "lines-around-comment": ["off"],
            "lines-between-class-members": ["error", {
                "enforce": [
                    { "blankLine": "always", "prev": "method", "next": "method" },
                    { "blankLine": "always", "prev": "method", "next": "field" },
                    { "blankLine": "always", "prev": "field", "next": "method" },
                    { "blankLine": "never", "prev": "field", "next": "field" }
                ]
            }],
            "max-len": ["error", {
                "code": 80,
                "tabWidth": 4,
                "comments": 80,
                "ignorePattern": "^.*@no-wrap$",
                "ignoreUrls": true,
                "ignoreStrings": true,
                "ignoreTemplateLiterals": true,
                "ignoreRegExpLiterals": true
            }],
            "new-parens": ["error", "always"],
            "newline-per-chained-call": ["error", {
                "ignoreChainWithDepth": 3
            }],
            "no-extra-parens": ["off"],
            "no-mixed-spaces-and-tabs": "error",
            "no-multi-spaces": ["error", {
                "ignoreEOLComments": false,
                "exceptions": { "Property": false }
            }],
            "no-multiple-empty-lines": ["error", {
                "max": 1,
                "maxEOF": 1,
                "maxBOF": 1
            }],
            "no-tabs": "error",
            "no-trailing-spaces": ["error", {
                "skipBlankLines": false,
                "ignoreComments": false
            }],
            "no-whitespace-before-property": "error",
            "nonblock-statement-body-position": ["error", "beside"],
            "object-curly-newline": ["error", {
                "consistent": true
            }],
            "object-curly-spacing": ["error", "always"],
            "operator-linebreak": ["error", "after", {
                "overrides": {
                    ":": "before",
                    "?": "before"
                }
            }],
            "padded-blocks": ["error", "never"],
            "padding-line-between-statements": ["off"],
            "quotes": ["error", "double"],
            "rest-spread-spacing": ["error", "never"],
            "semi": ["error", "never"],
            "semi-spacing": ["error", {
                "before": false,
                "after": true
            }],
            "semi-style": ["error", "last"],
            "space-before-blocks": ["error", "always"],
            "space-before-function-paren": ["error", {
                "anonymous": "always",
                "named": "never",
                "asyncArrow": "always"
            }],
            "space-in-parens": ["error", "never"],
            "space-infix-ops": "error",
            "space-unary-ops": ["error", {
                "words": true,
                "nonwords": true,
                "overrides": {
                    "++": false,
                    "--": false,
                    "!": false,
                    "~": false
                }
            }],
            "switch-colon-spacing": ["error", {
                "before": false,
                "after": true
            }],
            "template-curly-spacing": ["error", "never"],
            "template-tag-spacing": ["error", "never"],
            "unicode-bom": ["error", "never"],
            "wrap-iife": ["error", "inside"],
            "yield-star-spacing": ["error", {
                "before": false,
                "after": true
            }]
        }
    }
]

// @@exports
export default config
