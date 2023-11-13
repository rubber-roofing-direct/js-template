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
 * @file Plop package.json file generator.
 * @author James Reid
 */

// @ts-check

// @@imports-node
import { execSync } from "child_process"

// @@imports-utils
import { parsePackage } from "../../scripts/utils/index.js"

// @@imports-types
/* eslint-disable no-unused-vars -- Types only used in comments. */
import { PackagePromptData } from "./types/index.js"
import * as plop from "plop"
/* eslint-enable no-unused-vars -- Close disable-enable pair. */

// @@body
// Infer git remote url from system call.
const remoteUrl = execSync("git ls-remote --get-url origin")
    .toString()
    .split("\n")
    .shift()

// Match github repo owner and name from remote url found above.
const regex = /^https:\/\/github\.com\/(?<owner>.*)\/(?<repo>.*)\.git$/
const { owner, repo } = remoteUrl?.match(regex)?.groups || {}

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
        name: "name",
        message: "Input name of package:",
        default: `@${owner}/${repo}`
    },
    {
        type: "input",
        name: "version",
        message: "Input current version of package:",
        default: "0.0.1",
        validate: (/** @type {string} */ version) => {
            // Check input is semver number of form "x.y.z".
            return !!version.match(/^\d*\.\d*\.\d*$/)
        }
    },
    {
        type: "input",
        name: "description",
        message: "Input brief description of package:",
    },
    {
        type: "input",
        name: "keywords",
        message: "Input package keywords separated by spaces:",
    },
    {
        type: "input",
        name: "repository",
        message: "Input remote repository URL:",
        default: remoteUrl
    },
    {
        type: "input",
        name: "author",
        message: "Input package author:",
        default: author
    },
    {
        type: "input",
        name: "bin",
        message: "Input name of main executable (leave blank if not required):"
    },
    {
        type: "confirm",
        name: "shouldContinue",
        message: "This action will change the package.json file, continue?",
        default: false
    }
]

/**
 * Parse inquirer prompt output data/options as required, and return an array of
 * plop actions to be executed. These actions form the output of the generator.
 *
 * @param {PackagePromptData} data - Generator options from inquirer prompts.
 * @returns {plop.ActionType[]} Array of plop actions to be executed.
 */
const actions = data => {
    // Return no plop actions if the generator is not confirmed in the cli.
    if (!data.shouldContinue) { return [] }

    // Match github base url (i.e. excluding ".git" from the url of the git
    // remote) from inquirer prompt input.
    const githubUrl = data.repository.match(/.*(?=\.git$)/)?.toString() || ""

    // Generate package.json fragment from inquirer prompt input. Override the
    // properties which are not string-only, and must be built from the string
    // input passed in the cli.
    const packageFragment = {
        ...data,
        keywords: data.keywords ? data.keywords.split(" ") : [],
        homepage: githubUrl ? `${githubUrl}#readme` : "",
        repository: {
            type: "git",
            url: `git+${data.repository}`
        },
        bugs: githubUrl ? { url: `${githubUrl}/issues` } : {},
        bin: data.bin ? { [data.bin]: "./dist/bin/index.js" } : {}
    }

    // Plop action for modifying repo package.json file.
    const modifyPackageFile = {
        type: "modify",
        path: "../../package.json",
        transform: (/** @type {string} */ file) => {
            // Parse file string into object, and assign values from package
            // fragment object to the existing parsed package object.
            const packageObject = JSON.parse(file)
            Object.assign(packageObject, packageFragment)

            // Delete field(s) from the inquirer prompts which should not exist
            // as properties in the package.json file.
            delete packageObject.shouldContinue

            // Return stringified object with pretty print.
            return JSON.stringify(packageObject, null, 4)
        }
    }

    return [modifyPackageFile]
}

// Build plop generator with description field displayed when choosing.
const packageGenerator = {
    description: "Modify existing repository package.json file.",
    prompts,
    actions
}

// @@exports
export { packageGenerator }
