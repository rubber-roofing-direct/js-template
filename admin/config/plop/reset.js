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
// Declare all regexps required for modifying existing documentation files:
//      - badgeRegex: Match shields.io badge text fragment of url
//      - yamlFrontmatterRegex: Match yaml frontmatter of file
//      - changelogRegex: Match existing changelog entries in file
//      - issuesRegex: Match repo owner and name fragment of issues url
//      - copyrightRegex: Match year and owner fragment of license file
const badgeRegex = /(?<=shields\.io\/badge\/).*(?=-inactive?)(?=.*\n<\/p>)/
const yamlFrontmatterRegex = /(?<=^---\n)(.*\n)*(?=---\n)/
const changelogRegex = /(?<=<!-- LOG_START -->\n)(.*\n)*(?=<!-- LOG_END -->)/
const issuesRegex = /(?<=repository]\(https:\/\/github.com\/).*(?=\/issues\))/
const copyrightRegex = /(?<=\nCopyright\s\(c\)\s)\d{4}\s.*(?=\n)/

// Get hash of last commit. At time of execution of this plop generator script
// (immediately after template repository duplication), the hash of the last
// commit should also be the hash of the first commit in the repo (i.e. the also
// the first commit which may appear in the changelog).
const hash = execSync("git rev-list HEAD --max-count=1")
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
// See each prompt for the appropriate defaults and validations where required.
const prompts = [
    {
        type: "input",
        name: "firstHash",
        message: "Input first hash for changelog generation:",
        default: hash,
        validate: (/** @type {string} */ hash) => {
            // Check input is 4 to 40 chars of lowercase hex chars.
            return !!hash.match(/^[0-9|a-f]{4,40}$/)
        }
    },
    {
        type: "input",
        name: "firstVersion",
        message: "Input first version number for changelog generation:",
        default: /** @type {string|undefined} */ packageObject.version,
        validate: (/** @type {string} */ version) => {
            // Check input is semver number of form "x.y.z".
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
        default: "191a1a",
        validate: (/** @type {string} */ color) => {
            // Check input is 6 chars of lowercase or uppercase hex chars.
            return !!color.match(/^[a-fA-F\d]{6}$/)
        }
    },
    {
        type: "input",
        name: "shieldColor",
        message: "Input right hand shield color for code information badges:",
        default: "779966",
        validate: (/** @type {string} */ color) => {
            // Check input is 6 chars of lowercase or uppercase hex chars.
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
            // Check that branch by given name exists.
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
            // Check that input is a 4 digit year.
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
    // Return no plop actions if the generator is not confirmed in the cli.
    if (!data.shouldContinue) { return [] }

    // Sanitize badge name and detail for shields.io url fragment.
    data.badgeName = sanitizeShieldUrlString(data.badgeName)
    data.badgeDetail = sanitizeShieldUrlString(data.badgeDetail)

    // Infer if a demo site will be provided by this repository based on if the
    // given inquirer prompt field has been populated or not.
    data.isDemo = !!data.demoUrl

    // Infer package owner and name from the name property in the package.json
    // file. If the package is *not* org scoped (i.e. if the package name is of
    // the form "<name>" rather than "@<scope>/<name>"), then the packageOwner
    // variable will be undefined. Throw error if no name property found.
    if (typeof packageObject.name === "undefined") {
        const msg = "Name unset, cannot infer package owner or name"
        packageError(new Error(msg))
    }
    const packageRegex = /^(@(?<packageOwner>.*)\/)?(?<packageName>.*)$/
    const { packageOwner, packageName } = /** @type {string} */
        (packageObject.name)?.match(packageRegex)?.groups || {}

    // Assign package owner and name properties to data object passed by cli,
    // and infer if package is org scoped.
    Object.assign(data, { packageOwner, packageName })
    data.isScopedPackage = !!data.packageOwner

    // Generate badgeUrlFragment for shields.io documentation file banner badge.
    const badgeUrlFragment = `${data.badgeName}-${data.badgeDetail}`

    // Plop action for modifying repo CHANGELOG file.
    const modifyChangelogFile = {
        type: "modify",
        path: "../../CHANGELOG.md",
        transform: (/** @type {string} */ file) => {
            // Generate yaml frontmatter string with initial version and commit
            // for changelog file.
            const yamlFrontmatter = YAML.stringify({
                "last-hash": data.firstHash,
                "last-tag": `v${data.firstVersion}`
            })

            // Return file string modified using regexps declared in top level.
            return file
                .replace(yamlFrontmatterRegex, yamlFrontmatter)
                .replace(badgeRegex, badgeUrlFragment)
                .replace(changelogRegex, "\n")
        }
    }

    // Plop action for modifying repo CONTRIBUTING file.
    const modifyContributingFile = {
        type: "modify",
        path: "../../CONTRIBUTING.md",
        transform: (/** @type {string} */ file) => {
            // Generate issue url fragment for contributing file from new repo
            // owner and name.
            const issueUrlFragment = `${data.repoOwner}/${data.repoName}`

            // Return file string modified using regexps declared in top level.
            return file
                .replace(badgeRegex, badgeUrlFragment)
                .replace(issuesRegex, issueUrlFragment)
        }
    }

    // Plop action for modifying repo LICENSE file.
    const modifyLicenseFile = {
        type: "modify",
        path: "../../LICENSE.md",
        transform: (/** @type {string} */ file) => {
            // Generate copyright year and owner fragment for license file.
            const copyrightTextFragment =
                `${data.copyrightYear} ${data.copyrightOwner}`

            // Return file string modified using regexps declared in top level.
            return file.replace(copyrightRegex, copyrightTextFragment)
        }
    }

    // Plop action for modifying repo README file.
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
