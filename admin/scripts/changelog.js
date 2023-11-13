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
 * This script auto generates a new section of a changelog based on commits
 * following the lightweight commit format. Any missing data, or data which this
 * script cannot parse will cause an error to be thrown, and the process will
 * terminate without updating the changelog.
 *
 * @ignore
 * @file Generates changelog prompts based on git history.
 * @author James Reid
 */

// @ts-check

// @@imports-node
import fs from "fs"

// @@imports-dependencies
import Mustache from "mustache"
/* eslint-disable-next-line id-match -- YAML id does not follow pattern. */
import YAML, { YAMLMap } from "yaml"

// @@imports-utils
import {
    DecoratedError,
    parseCliArguments,
    getLongHash,
    getRevList,
    parseCommit,
    checkRemote,
    getRemote
} from "./utils/index.js"

// @@imports-types
/* eslint-disable no-unused-vars -- Types only used in comments. */
import {
    Frontmatter,
    ChangelogCliOptions,
    ChangelogView
} from "./types/index.js"
/* eslint-enable no-unused-vars -- Close disable-enable pair. */

// @@body
/**
 * Render new autogenerated section of changelog prompts to the existing
 * changelog file in the repository using mustache templates for changelog
 * prompts/release notes.
 *
 * @summary Render autogenerated changelog prompts to existing changelog file.
 * @param {{markdown:string, frontmatter:Frontmatter}} changelog - Separated
 *      markdown and frontmatter extracted from existing changelog file.
 * @param {string} template - Template for release notes section of changelog.
 * @param {ChangelogView} view - View containing changelog release note data for
 *      rendering main mustache template.
 * @param {Object.<string,string>} partials - Partial templates required for
 *      rendering main mustache template.
 * @returns {void}
 */
const renderPrompts = (changelog, template, view, partials) => {
    // Stringify frontmatter object, and render changelog section.
    const yamlFrontmatter = YAML.stringify(changelog.frontmatter)
    const releaseNotes = Mustache.render(template, view, partials)

    // Replace old frontmatter with new frontmatter, and inject changelog
    // section at marker comment.
    const yamlFrontmatterRegex = /(?<=^---\n)(.*\n)*(?=---\n)/
    const releaseNotesRegex = /^<!-- LOG_START -->$/m
    changelog.markdown = changelog.markdown
        .replace(yamlFrontmatterRegex, yamlFrontmatter)
        .replace(releaseNotesRegex, releaseNotes)

    // Write updated markdown to existing changelog file.
    fs.writeFileSync(cli.path, changelog.markdown)
}

/**
 * Generate next major, minor, and patch version tag strings from the current
 * supplied version string by incrementing/resetting the appropriate numbers in
 * the string.
 *
 * @summary Generate next major, minor, and patch version tag strings.
 * @param {string} tag - Original version string of form "(v)major.minor.patch".
 * @returns {Object.<string,string>} Object of next versions.
 */
const getVersions = tag => {
    // Fetch major, minor, and patch version numbers from input tag string using
    // regex. Throw error if the tag string format is not recognised.
    let /** @type {?RegExpMatchArray} */ match
    try {
        match = tag.match(/^v?(?<major>\d*)\.(?<minor>\d*)\.(?<patch>\d*)$/)
        if (!match) {
            throw new Error(`Expected format "(v)x.y.z", but received ${tag}`)
        }
    }
    catch (error) {
        throw new DecoratedError({
            name: "VersionError",
            message: "Invalid version string format",
            detail: /** @type {Error} */ (error).message
        })
    }
    const { major, minor, patch } = /** @type {Object.<string,string>} */
        (match.groups)

    // Return object of next version strings by incrementing the target number,
    // resetting less significant version numbers, and preserving more
    // significant version numbers.
    return {
        major: `v${parseInt(major) + 1}.0.0`,
        minor: `v${major}.${parseInt(minor) + 1}.0`,
        patch: `v${major}.${minor}.${parseInt(patch) + 1}`
    }
}

/**
 * Rank semver string as a power of 2 bitmask. Convert string to bitmask, where
 * each bit in the 3-bit bitmask identifies a unique semver string. The semver
 * changes are ordered in descending order (major -> minor -> patch), from most
 * significant bit in the bitmask, to least significant bit. Unknown changes
 * return 0.
 *
 * @summary Rank semver string as bitmask number (power of 2).
 * @param {string} semverString - Changelog prompt semver string to be ranked,
 *      for example "minor", "patch" etc.
 * @returns {number} Bitmask number of semver change.
 */
const rankSemver = semverString => {
    return semverString.match(/^\**breaking\schange\**$/i) ? 4 // 100
        : semverString.match(/^\**minor\**$/i) ? 2 // 010
        : semverString.match(/^\**patch\**$/i) ? 1 // 001
        : 0 // 000
}

// Fetch owner (username or organisation name) and repo name of repo on github.
const { owner, repo } = getRemote()

// Parse options from cli with appropriate defaults.
const defaults = {
    path: {
        name: "path",
        aliases: ["p"],
        value: "CHANGELOG.md",
        description: "Relative path to changelog from repo package.json file."
    },
    lastTag: {
        name: "last-tag",
        aliases: ["t"],
        value: null,
        description: "Last tag generated or listed in changelog."
    },
    startHash: {
        name: "start-hash",
        aliases: ["h"],
        value: null,
        description: "Start hash of revision list to generate changelog."
    },
    endHash: {
        name: "end-hash",
        aliases: ["H"],
        value: "HEAD",
        description: "End hash of revision list to generate changelog."
    },
    branch: {
        name: "branch",
        aliases: ["b"],
        value: "main",
        description: "Deployment branch containing commits in revision list."
    },
    repoOwner: {
        name: "repo-owner",
        aliases: ["o"],
        value: owner,
        description: "Github owner (user or organisation) of remote repository."
    },
    repoName: {
        name: "repo-name",
        aliases: ["n"],
        value: repo,
        description: "Github repository name of remote repository."
    }
}
const cli = /** @type {ChangelogCliOptions} */ (parseCliArguments(defaults))

// Check that git repository exists on github.
await checkRemote(cli.repoOwner, cli.repoName)

// Object for markdown and frontmatter props to be rendered to as final step.
const changelog = /** @type {{markdown:string, frontmatter:Frontmatter}} */ ({})

// Load and parse existing changelog file including relevant frontmatter.
try {
    // Fetch markdown changelog, and extract frontmatter, throwing if not found.
    changelog.markdown = fs.readFileSync(cli.path).toString()
    const yamlMap = YAML.parseAllDocuments(changelog.markdown)?.[0]?.contents
    if (!(yamlMap instanceof YAMLMap)) { throw new Error("No frontmatter") }

    // Parse frontmatter, and use properties to fill missing cli arguments.
    changelog.frontmatter = JSON.parse(yamlMap.toString())
    cli.startHash ??= changelog.frontmatter["last-hash"]
    cli.lastTag ??= changelog.frontmatter["last-tag"] || "v0.0.1"

    // Throw error if cli last-hash non existent.
    if (!cli.startHash) {
        throw new Error("Frontmatter has no property named 'last-hash'")
    }
}
catch (error) {
    throw new DecoratedError({
        name: "ChangelogError",
        message: "Error parsing existing changelog",
        path: `${process.cwd()}/${cli.path}`,
        detail: /** @type {Error} */ (error).message
    })
}

// Get revision list of commit hashes based on start and end hashes from cli.
const revList = getRevList(cli.startHash, cli.endHash, cli.branch)
const currentCommit = parseCommit(revList[0])

// Initiate changelog view object required for rendering the mustache template
// of the new auto generated changelog section. All default categories are
// pre-populated in the correct order. Empty categories are pruned after all
// commits are parsed.
/** @type {ChangelogView} */
const view = {
    repoOwner: cli.repoOwner,
    repoName: cli.repoName,
    tag: cli.lastTag,
    ...currentCommit.details,
    categories: [
        { title: "Added", commits: [] },
        { title: "Rewritten", commits: [] },
        { title: "Changed", commits: [] },
        { title: "Modified", commits: [] },
        { title: "Removed", commits: [] },
        { title: "Deprecated", commits: [] },
        { title: "Fixed", commits: [] },
        { title: "Security", commits: [] },
        { title: "Performance", commits: [] },
        { title: "Dependencies", commits: [] },
        { title: "Other", commits: [] }
    ]
}

// Initiate version flag to 0, representing no semver version change.
let versionFlag = 0

// Loop over hashes from revision list and parse commits into view object.
for (const hash of revList) {
    // Ignore hash if not 40 chars of lowercase hexadecimal, otherwise parse
    // commit details into object.
    if (!hash.match(/^[0-9|a-f]{40}$/)) { continue }
    const commit = parseCommit(hash)

    // Skip commits with "=" (no change) semver flag.
    // NOTE: Build and revert commits containing the "?" semver flag, or commits
    // which have no recognisable semver flag will have a title semver value of
    // "Unknown Change" rather than an empty string, therefore non-standard,
    // build, and revert commits will *not* be skipped.
    if (!commit.title.semver) { continue }

    // If commit is a revert, find reverted commit, remove that hash from the
    // remaining revision list, and continue without including either commit in
    // generated changelog. If hash is not in remaining revision list, revert
    // commit will instead be added to "Other" section of changelog.
    if (commit.isRevert) {
        // Declare variable for full hash of reverted commit.
        let /** @type {string} */ revertedHash

        // Fetch short reverted commit hash from commit title, note that for git
        // log to uniquely identify the commit, the short hash must be at least
        // 4 characters long.
        try {
            const regex = /^Revert\s(?<revertedHash>[0-9|a-f]{4,40})$/i;
            ({ revertedHash } = commit.title.summary.match(regex)?.groups || {})
            if (!revertedHash) { throw new Error("No revert hash given") }
        }
        catch (error) {
            throw new DecoratedError({
                name: "CommitError",
                message: "Could not find reverted hash in commit summary",
                detail: /** @type {Error} */ (error).message
            })
        }

        // Fetch full hash of reverted commit from the short hash in title.
        revertedHash = getLongHash(revertedHash, cli.branch)

        // Find index of reverted hash in remaining revision list and remove.
        const index = revList.findIndex(hash => hash === revertedHash)
        if (index) {
            revList.splice(index, 1)
            continue
        }
    }

    // Update version flag using a bitmask for each different version change.
    versionFlag = versionFlag | rankSemver(commit.title.semver)

    // Fetch category from existing view object, or create new category array.
    let category = view.categories.find(obj => {
        return obj.title === commit.title.category
    })
    if (!category) {
        category = { title: commit.title.category, commits: [] }
        view.categories.push(category)
    }

    // Update view object.
    category.commits.push({
        ...commit.details,
        ...commit.title,
        repoOwner: cli.repoOwner,
        repoName: cli.repoName,
        trailers: commit.trailers
    })
}

// Prune mustache view categories with no commit prompts.
view.categories = view.categories.filter(category => category.commits.length)

// Sort commits within each category such that more significant changes
// (breaking changes) are sorted and rendered above less significant changes
// (patch changes). Note that commits are already sorted by date from generated
// revision list.
for (const category of view.categories) {
    category.commits.sort((commitA, commitB) => {
        return rankSemver(commitB.semver) - rankSemver(commitA.semver)
    })
}

// Update version tag choosing between generated next version strings for major,
// minor and patch versions.
const { major, minor, patch } = getVersions(view.tag)
view.tag = versionFlag << (32 - 3) >>> 31 ? major
    : versionFlag << (32 - 2) >>> 31 ? minor
    : versionFlag << (32 - 1) >>> 31 ? patch
    : view.tag

// Update frontmatter with existing view long hash and updated tag.
changelog.frontmatter["last-hash"] = view.longHash
changelog.frontmatter["last-tag"] = view.tag

// Declare variable for mustache root template and object for partials.
let /** @type {string} */ template
const partials = /** @type {Object.<string,string>} */ ({})

// Fetch templates for auto generating new changelog section.
try {
    template = fs
        .readFileSync("./admin/templates/changelog-release.hbs")
        .toString()
    partials.category = fs
        .readFileSync("./admin/templates/changelog-category.hbs")
        .toString()
    partials.prompt = fs
        .readFileSync("./admin/templates/changelog-prompt.hbs")
        .toString()
}
catch (error) {
    throw new DecoratedError({
        name: "TemplateError",
        message: "Template not found",
        detail: /** @type {Error} */ (error).message
    })
}

// Render all parsed changes to changelog.
renderPrompts(changelog, template, view, partials)

// @@no-exports
