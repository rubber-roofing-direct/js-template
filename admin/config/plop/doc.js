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
 * @file Plop documentation file generator.
 * @author James Reid
 */

// @ts-check

// @@imports-node
import fs from "fs"

// @@imports-dependencies
/* eslint-disable-next-line id-match -- YAML id does not follow pattern. */
import YAML, { YAMLMap } from "yaml"

// @@imports-utils
import {
    DecoratedError,
    parsePackage,
    toKebabCase
} from "../../scripts/utils/index.js"

// @@imports-types
/* eslint-disable no-unused-vars -- Types only used in comments. */
import { DocPromptData } from "./types/index.js"
import * as plop from "plop"
/* eslint-enable no-unused-vars -- Close disable-enable pair. */

// @@body
/**
 *
 * @param {string[]} [choices=[]]
 * @returns {string[]}
 */
const getTitles = (choices = []) => {
    //
    const filenames = fs.readdirSync("./docs").filter(filename => {
        return !!filename.match(/^.*\.md$/)
    })

    //
    for (const pathname of filenames.map(filename => `./docs/${filename}`)) {
        try {
            const markdown = fs.readFileSync(pathname).toString()
            const yamlMap = YAML.parseAllDocuments(markdown)?.[0]?.contents
            if (yamlMap instanceof YAMLMap) {
                const frontmatter = JSON.parse(yamlMap.toString())
                if (!frontmatter.title) { throw new Error("No title") }
                choices.push(frontmatter.title)
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

    return choices
}

/**
 *
 * @returns
 */
const getPackage = () => {
    const { packageObject, packageError } = parsePackage()
    if (!packageObject.name) { packageError(new Error("Name unset")) }
    return packageObject.name
}

//
const titles = getTitles()

// Inquirer prompts for plop generator. See inquirer readme here
// https://github.com/SBoudrias/Inquirer.js, or see inquirer packages readme
// here https://github.com/SBoudrias/Inquirer.js/tree/master/packages/inquirer.
const prompts = [
    {
        type: "input",
        name: "title",
        message: "Input title of documentation file:",
        validate: (/** @type {string} */ title) => {
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
        message: "Input package name of repository if no default found:",
        default: getPackage()
    }
]

/**
 * Parse inquirer prompt output data/options as required, and return an array of
 * plop actions to be executed. These actions form the output of the generator.
 *
 * @param {DocPromptData} data - Generator options from inquirer prompts.
 * @returns {plop.ActionType[]} Array of plop actions to be executed.
 */
const actions = data => {
    //
    data.repoName = data.repoName
        .replaceAll("-", "--")
        .replaceAll("_", "__")
        .replaceAll(" ", "_")

    //
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
