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
 * @file Plop documentation reset generator.
 * @author James Reid
 */

// @ts-check

// @@imports-node
import { execSync } from "child_process"

// @@imports-dependencies
import YAML from "yaml"

// @@imports-utils
import {
    parsePackage,
    getRemote,
    sanitizeShieldUrlString
} from "../../scripts/utils/index.js"

// @@imports-types
/* eslint-disable no-unused-vars -- Types only used in comments. */
import { ResetPromptData } from "./types/index.js"
import * as plop from "plop"
/* eslint-enable no-unused-vars -- Close disable-enable pair. */

// @@body
//
const badgeRegex = /(?<=shields\.io\/badge\/).*(?=-inactive?)(?=.*\n<\/p>)/
const yamlFrontmatterRegex = /(?<=^---\n)(.*\n)*(?=---\n)/
const changelogRegex = /(?<=<!-- LOG_START -->\n)(.*\n)*(?=<!-- LOG_END -->)/
const issuesRegex = /(?<=repository]\(https:\/\/github.com\/).*(?=\/issues\))/
const copyrightRegex = /(?<=\nCopyright\s\(c\)\s)\d{4}\s.*(?=\n)/

const hash = execSync("git rev-list HEAD~1..HEAD")
    .toString()
    .split("\n")
    .shift()

// Fetch owner (username or organisation name) and repo name of repo on github,
// and fetch package object from package.json file.
const { owner, repo } = getRemote()
const { packageObject, packageError } = parsePackage()

// Inquirer prompts for plop generator. See inquirer readme here
// https://github.com/SBoudrias/Inquirer.js, or see inquirer packages readme
// here https://github.com/SBoudrias/Inquirer.js/tree/master/packages/inquirer.
const prompts = [
    {
        type: "input",
        name: "firstHash",
        message: "Input first hash for changelog generation:",
        default: hash,
        validate: (/** @type {string} */ hash) => {
            return !!hash.match(/^[0-9|a-f]{4,40}$/)
        }
    },
    {
        type: "input",
        name: "firstVersion",
        message: "Input first version number for changelog generation:",
        default: /** @type {string|undefined} */ packageObject.version,
        validate: (/** @type {string} */ version) => {
            return !!version.match(/^\d*\.\d*\.\d*$/)
        }
    },
    {
        type: "input",
        name: "badgeName",
        message: "Input badge left hand text for main documentation files:",
        default: "blameitonyourisp"
    },
    {
        type: "input",
        name: "badgeDetail",
        message: "Input badge right hand text for main documentation files:",
        default: "13"
    },
    {
        type: "input",
        name: "shieldLabelColor",
        message: "Input left hand shield color for code information badges:",
        default: "BAC99C",
        validate: (/** @type {string} */ color) => {
            return !!color.match(/^[a-fA-F\d]{6}$/)
        }
    },
    {
        type: "input",
        name: "shieldColor",
        message: "Input right hand shield color for code information badges:",
        default: "779966",
        validate: (/** @type {string} */ color) => {
            return !!color.match(/^[a-fA-F\d]{6}$/)
        }
    },
    {
        type: "input",
        name: "repoOwner",
        message: "Input github repo owner of repository:",
        default: owner
    },
    {
        type: "input",
        name: "repoName",
        message: "Input github repo name of repository:",
        default: repo
    },
    {
        type: "input",
        name: "repoMainBranch",
        message: "Input name of main branch of this repository:",
        default: "main",
        validate: (/** @type {string} */ branch) => {
            try {
                execSync(`git rev-parse --verify --quiet ${branch}`)
                return true
            }
            catch { return false }
        }
    },
    {
        type: "input",
        name: "copyrightYear",
        message: "Input copyright year of repository:",
        default: new Date().getUTCFullYear().toString(),
        validate: (/** @type {string} */ year) => {
            return !!year.match(/^\d{4}$/)
        }
    },
    {
        type: "input",
        name: "copyrightOwner",
        message: "Input copyright owner of repository:",
        default: /** @type {string|undefined} */ packageObject.author
    },
    {
        type: "confirm",
        name: "isPackage",
        message: "Does this repository export a package?",
        default: true
    },
    {
        type: "input",
        name: "readmeTitle",
        message: "Input readme title:",
        default: repo
    },
    {
        type: "input",
        name: "demoUrl",
        message: "Input demo site URL (leave blank if no site exists):"
    },
    {
        type: "confirm",
        name: "shouldContinue",
        message: "This action will reset documentation files, continue?",
        default: false
    }
]

/**
 * Parse inquirer prompt output data/options as required, and return an array of
 * plop actions to be executed. These actions form the output of the generator.
 *
 * @param {ResetPromptData} data - Generator options from inquirer prompts.
 * @returns {plop.ActionType[]} Array of plop actions to be executed.
 */
const actions = data => {
    //
    if (!data.shouldContinue) { return [] }

    //
    data.badgeName = sanitizeShieldUrlString(data.badgeName)
    data.badgeDetail = sanitizeShieldUrlString(data.badgeDetail)

    //
    data.isDemo = !!data.demoUrl

    //
    if (typeof packageObject.name === "undefined") {
        const msg = "Name unset, cannot infer package owner or name"
        packageError(new Error(msg))
    }
    const packageRegex = /^(@(?<packageOwner>.*)\/)?(?<packageName>.*)$/
    const { packageOwner, packageName } = /** @type {string} */
        (packageObject.name)?.match(packageRegex)?.groups || {}

    //
    Object.assign(data, { packageOwner, packageName })
    data.isScopedPackage = !!data.packageOwner

    const badgeUrlFragment = `${data.badgeName}-${data.badgeDetail}`

    //
    const modifyChangelogFile = {
        type: "modify",
        path: "../../CHANGELOG.md",
        transform: (/** @type {string} */ file) => {
            const yamlFrontmatter = YAML.stringify({
                "last-hash": data.firstHash,
                "last-tag": `v${data.firstVersion}`
            })

            return file
                .replace(yamlFrontmatterRegex, yamlFrontmatter)
                .replace(badgeRegex, badgeUrlFragment)
                .replace(changelogRegex, "\n")
        }
    }

    //
    const modifyContributingFile = {
        type: "modify",
        path: "../../CONTRIBUTING.md",
        transform: (/** @type {string} */ file) => {
            const issueUrlFragment = `${data.repoOwner}/${data.repoName}`

            return file
                .replace(badgeRegex, badgeUrlFragment)
                .replace(issuesRegex, issueUrlFragment)
        }
    }

    //
    const modifyLicenseFile = {
        type: "modify",
        path: "../../LICENSE.md",
        transform: (/** @type {string} */ file) => {
            const copyrightTextFragment =
                `${data.copyrightYear} ${data.copyrightOwner}`

            return file.replace(copyrightRegex, copyrightTextFragment)
        }
    }

    //
    const modifyReadmeFile = {
        type: "modify",
        path: "../../README.md",
        pattern: /^(.*\n?)*$/,
        templateFile: "../templates/readme.hbs"
    }

    return [
        modifyChangelogFile,
        modifyContributingFile,
        modifyLicenseFile,
        modifyReadmeFile
    ]
}

// Build plop generator with description field displayed when choosing.
const resetGenerator = {
    description: "Overwrite README file, and modify main documentation files.",
    prompts,
    actions
}

// @@exports
export { resetGenerator }
