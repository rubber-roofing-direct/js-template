// Copyright (c) 2023 James Reid. All rights reserved.
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
 * @file Plop script file generator.
 * @author James Reid
 */

// @ts-check

// @@imports-utils
import { parsePackage } from "../../scripts/utils/index.js"

// @@imports-types
/* eslint-disable no-unused-vars -- Types only used in comments. */
import { ScriptPromptData } from "./types/index.js"
import * as plop from "plop"
/* eslint-enable no-unused-vars -- Close disable-enable pair. */

// @@body
// Get default author from package.json file.
/** @type {{author:string|undefined}} */
const { author } = parsePackage().packageObject

// Inquirer prompts for plop generator. See inquirer readme here
// https://github.com/SBoudrias/Inquirer.js, or see inquirer packages readme
// here https://github.com/SBoudrias/Inquirer.js/tree/master/packages/inquirer.
// See each prompt for the appropriate defaults and validations where required.
const prompts = [
    {
        type: "input",
        name: "path",
        message: "Input path of new script:",
        validate: (/** @type {string} */ path) => {
            // Check that input is a filename ending with a js extension.
            return !!path.match(/^.*\.(js|ts)x?$/)
        }
    },
    {
        type: "input",
        name: "copyrightYear",
        message: "Input copyright year of script:",
        default: new Date().getUTCFullYear().toString(),
        validate: (/** @type {string} */ year) => {
            // Check that input is a 4 digit year.
            return !!year.match(/^\d{4}$/)
        }
    },
    {
        type: "input",
        name: "copyrightOwner",
        message: "Input copyright owner of script:",
        default: author
    },
    {
        type: "input",
        name: "scriptDescription",
        message: "Input brief description of script:"
    },
    {
        type: "input",
        name: "scriptAuthor",
        message: "Input primary author of script:",
        default: author
    },
    {
        type: "confirm",
        name: "shouldContinue",
        message: "This action will add a script at the path shown, continue?",
        default: false
    }
]

/**
 * Parse inquirer prompt output data/options as required, and return an array of
 * plop actions to be executed. These actions form the output of the generator.
 *
 * @param {ScriptPromptData} data - Generator options from inquirer prompts.
 * @returns {plop.ActionType[]} Array of plop actions to be executed.
 */
const actions = data => {
    // Return no plop actions if the generator is not confirmed in the cli.
    if (!data.shouldContinue) { return [] }

    // Plop action for adding script file.
    const addScriptFile = {
        type: "add",
        path: `../../${data.path}`,
        templateFile: "../templates/script.hbs"
    }

    return [addScriptFile]
}

// Build plop generator with description field displayed when choosing.
const scriptGenerator = {
    description: "Add new formatted script file.",
    prompts,
    actions
}

// @@exports
export { scriptGenerator }
