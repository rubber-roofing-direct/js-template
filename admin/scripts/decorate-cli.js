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
 * @file Functions for decorating cli strings.
 * @author James Reid
 */

// @ts-check

// @no-imports

// @body
/**
 * Decorate a string with control characters for changing cli string colors and
 * text decoration. Adds supplied list of modifiers for the string, then uses
 * reset character to set text back to default.
 *
 * @summary Return original string decorated with control characters.
 * @param {string} string - String to be decorated.
 * @param {object} options - Options object.
 * @param {string[]=} options.modifiers - String array of modifiers/control
 *      characters to apply input string.
 * @param {number=} options.tabs - Number of tab indents to include on string.
 * @param {number=} options.tabSize - Number of spaces for each tab.
 * @returns {string} Original string decorated with control characters.
 */
const decorate = (string, { modifiers = [], tabs = 0, tabSize = 4 } = {}) => {
    // Make compound modifier string form array of supplied control characters.
    let compoundModifier = ""
    for (const modifier of modifiers) {
        compoundModifier = `${compoundModifier}${modifier}`
    }

    // Wrap input string with control characters and reset character.
    const reset = cliModifiers.decorations.reset
    const indent = " ".repeat(tabs * tabSize)
    return `${compoundModifier}${indent}${string}${reset}`
}

/**
 * Wrapper around decorate function to decorate a string with a foreground
 * colour control character, and optional number of tab indents.
 *
 * @summary Decorate a string with a foreground colour control character.
 * @param {string} string - String to be decorated.
 * @param {string} color - Desired foreground colour of string.
 * @param {number} [tabs=0] - Number of tab indents to include on string.
 * @returns {string} Original string decorated with color control character.
 */
const decorateFg = (string, color, tabs = 0) => {
    const colorModifier = cliModifiers.fgColors[color]
    // Return decorated string depending on if color resolves to valid control
    // character from object of cli modifiers.
    return colorModifier
        ? decorate(string, { modifiers: [colorModifier], tabs })
        : decorate(string, { tabs })
}

/**
 * Wrapper around decorate function to decorate a string with a background
 * colour control character, and optional number of tab indents.
 *
 * @summary Decorate a string with a background colour control character.
 * @param {string} string - String to be decorated.
 * @param {string} color - Desired background colour of string.
 * @param {number} [tabs=0] - Number of tab indents to include on string.
 * @returns {string} Original string decorated with color control character.
 */
const decorateBg = (string, color, tabs = 0) => {
    const colorModifier = cliModifiers.bgColors[color]
    // Return decorated string depending on if color resolves to valid control
    // character from object of cli modifiers.
    return colorModifier
        ? decorate(string, { modifiers: [colorModifier], tabs })
        : decorate(string, { tabs })
}

/**
 * Wrapper around String.prototype.padEnd method, which pads end of string
 * whilst ignoring length of control characters which will not be rendered by
 * the console (i.e. pad string such that the displayed string will be the
 * correct length when logged in the console).
 *
 * @summary Pad end of string, ignoring length of control characters.
 * @param {string} string - String to be padded.
 * @param {number} maxLength - Maximum length of string.
 * @param {string} [fillString] - Optional fill string passed to
 *      String.prototype.padEnd method
 * @returns {string} Original string padded at end, ignoring length of control
 *      characters.
 */
const padEndDecorated = (string, maxLength, fillString) => {
    // Calculate length of decorators in a string using control regex.
    const decoratorLength = string.match(/\x1b\[\d*m/g)?.join("").length || 0
    return string.padEnd(maxLength + decoratorLength, fillString)
}

/**
 * Wrapper around String.prototype.padStart method, which pads start of string
 * whilst ignoring length of control characters which will not be rendered by
 * the console (i.e. pad string such that the displayed string will be the
 * correct length when logged in the console).
 *
 * @summary Pad start of string, ignoring length of control characters.
 * @param {string} string - String to be padded.
 * @param {number} maxLength - Maximum length of string.
 * @param {string} [fillString] - Optional fill string passed to
 *      String.prototype.padStart method
 * @returns {string} Original string padded at end, ignoring length of control
 *      characters.
 */
const padStartDecorated = (string, maxLength, fillString) => {
    // Calculate length of decorators in a string using control regex.
    const decoratorLength = string.match(/\x1b\[\d*m/g)?.join("").length || 0
    return string.padStart(maxLength + decoratorLength, fillString)
}

// Object of cli control strings for decorations etc.
const cliModifiers = {
    // Foreground modifiers.
    /** @type {Object.<string,string>} */
    fgColors: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m"
    },

    // Background modifiers.
    /** @type {Object.<string,string>} */
    bgColors: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        gray: "\x1b[100m"
    },

    // Decoration modifiers.
    /** @type {Object.<string,string>} */
    decorations: {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underline: "\x1b[4m",
        blink: "\x1b[5m",
        reverse: "\x1b[7m",
        hidden: "\x1b[8m"
    }
}

// @exports
export {
    decorate,
    decorateFg,
    decorateBg,
    padEndDecorated,
    padStartDecorated,
    cliModifiers
}
