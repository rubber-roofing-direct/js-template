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
 * @file Plop documentation file generator.
 * @ignore
 * @author James Reid
 */

// @ts-check

// @@imports-node
import fs from "fs"

// @@imports-dependencies
import YAML, { YAMLMap } from "yaml"

// @@imports-utils
import {
    DecoratedError,
    parsePackage,
    toKebabCase,
    sanitizeShieldUrlString
} from "../../scripts/utils/index.js"

// @@imports-types
import { DocPromptData } from "./types/index.js"
import * as plop from "plop"

// @@body
/**
 * Get titles of all documentation files found in the "./docs" directory. The
 * title of each file is extracted from the yaml frontmatter of the given file
 * rather than being inferred from the filename.
 * @param {string[]} [titles=[]] Current array of additional default
 * documentation file titles defaulting to an empty array.
 * @returns {string[]} Array of all existing documentation file titles.
 * @throws {Error} Throws when:
 * - Frontmatter not found.
 * - Frontmatter incorrectly formatted.
 */
const getTitles = (titles = []) => {
    // Fetch all markdown documentation filenames in "./docs" directory.
    const filenames = fs.readdirSync("./docs").filter(filename => {
        return !!filename.match(/^.*\.md$/)
    })

    // For each filename found above, fetch the file and push the document title
    // to the array of existing titles.
    for (const pathname of filenames.map(filename => `./docs/${filename}`)) {
        try {
            // Fetch file and parse yaml frontmatter.
            const markdown = fs.readFileSync(pathname).toString()
            const yamlMap = YAML.parseAllDocuments(markdown)?.[0]?.contents

            // Fetch title of documentation file from frontmatter.
            if (yamlMap instanceof YAMLMap) {
                const frontmatter = JSON.parse(yamlMap.toString())
                if (!frontmatter.title) { throw new Error("No title") }
                titles.push(frontmatter.title)
            }
            else { throw new Error("No frontmatter") }
        }
        catch (error) {
            throw new DecoratedError({
                name: "DocGeneratorError",
                message: "Error parsing markdown documentation file",
                path: `${process.cwd()}/${pathname}`,
                detail: /** @type {Error} */ (error).message
            })
        }
    }

    return titles
}

// Fetch titles of existing markdown documentation files.
const titles = getTitles()

// Inquirer prompts for plop generator. See inquirer readme here
// https://github.com/SBoudrias/Inquirer.js, or see inquirer packages readme
// here https://github.com/SBoudrias/Inquirer.js/tree/master/packages/inquirer.
// See each prompt for the appropriate defaults and validations where required.
const prompts = [
    {
        type: "input",
        name: "title",
        message: "Input title of documentation file:",
        validate: (/** @type {string} */ title) => {
            // Check that input is not already used as a document title, and is
            // not "Home", as that is a reserved name in the github wiki.
            return !!title && !titles.includes(title) && title !== "Home"
        }
    },
    {
        type: "checkbox",
        name: "children",
        message: "Select children of documentation file:",
        choices: titles
    },
    {
        type: "input",
        name: "repoName",
        message: "Input package name of repository:",
        default: /** @type {string|undefined} */ (parsePackage()
            .packageObject
            .name)
            ?.match(/^(?:@.*\/)?(?<repoName>.*)$/)
            ?.groups
            ?.repoName || ""
    },
    {
        type: "confirm",
        name: "shouldContinue",
        message: "This action will add a new documentation file, continue?",
        default: false
    }
]

/**
 * Parse inquirer prompt output data/options as required, and return an array of
 * plop actions to be executed. These actions form the output of the generator.
 * @param {DocPromptData} data Generator options from inquirer prompts.
 * @returns {plop.ActionType[]} Array of plop actions to be executed.
 */
const actions = data => {
    // Return no plop actions if the generator is not confirmed in the cli.
    if (!data.shouldContinue) { return [] }

    // Sanitize repo name for shields.io url fragment.
    data.repoName = sanitizeShieldUrlString(data.repoName)

    // Plop action for adding documentation file.
    const addDocFile = {
        type: "add",
        path: `../../docs/${toKebabCase(data.title)}.md`,
        templateFile: "../templates/doc.hbs"
    }

    return [addDocFile]
}

// Build plop generator with description field displayed when choosing.
const docGenerator = {
    description: "Add new markdown documentation file.",
    prompts,
    actions
}

// @@exports
export { docGenerator }
