// Copyright (c) 2022 James Reid. All rights reserved.
//
// This source code file is licensed under the terms of the MIT license, a copy
// of which may be found in the LICENSE.md file in the root of this repository.
//
// For a template copy of the license see one of the following 3rd party sites:
//      - <https://opensource.org/licenses/MIT>
//      - <https://choosealicense.com/licenses/mit>
//      - <https://spdx.org/licenses/MIT>

/**
 * @ignore
 * @file Insert
 * @author James Reid
 */

// @ts-check

// @imports-types
/* eslint-disable no-unused-vars */
import { decorateFg, padEndDecorated } from "./decorate-cli.js"
import { CliOption, CliArgument } from "./types/index.js"
/* eslint-enable no-unused-vars */

// @body
/**
 * Convert kebab-case string to camelCase string, removing all hyphens in input
 * string, and capitalising the first character following each hyphen. Options
 * available for generating UpperCamelCase strings, and spaced strings too.
 *
 * @summary Convert kebab-case string to camelCase string.
 * @param {string} kebabCaseString - Input kebab-case string.
 * @param {boolean} isUpper - Should return string be in UpperCamelCase?
 * @param {boolean} isSpaced - Should return string replace hyphens with
 *      whitespace characters?
 * @returns {string} camelCase string version of input.
 */
// eslint-disable-next-line no-unused-vars
const toCamelCase = (kebabCaseString, isUpper = false, isSpaced = false) => {
    // Reduce split input string with starting value object containing an empty
    // string and flag set to isUpper for if next character should be capital.
    return (kebabCaseString.split("").reduce((acc, cur) => {
        // Ignore hyphens, or replace with spaces as required.
        if (cur === "-") {
            return isSpaced
                ? { string: `${acc.string} `, isCapital: true }
                : { ...acc, isCapital: true }
        }

        // Concatenate string with next character set to uppercase if required.
        const nextChar = acc.isCapital ? cur.toUpperCase() : cur
        return { string: `${acc.string}${nextChar}`, isCapital: false }
    }, { string: "", isCapital: isUpper }).string)
}

// @no-exports
