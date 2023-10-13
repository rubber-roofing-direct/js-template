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
 * @file Parse git commits into object of information for changelog generation.
 * @author James Reid
 */

// @ts-check

// @@imports-node
import { execSync } from "child_process"

// @@imports-utils
import { DecoratedError } from "./decorate-cli.js"

// @@imports-types
/* eslint-disable no-unused-vars -- Types only used in comments. */
import { ParsedCommit } from "../types/index.js"
/* eslint-enable no-unused-vars -- Close disable-enable pair. */

// @@body
/**
 * Get revision list of commits between specified hashes. Checks that commits
 * are on the specified target branch, and ignores merge commits. Result is
 * exclusive of start hash, and inclusive of end hash.
 *
 * @summary Get revision list of commits between specified hashes.
 * @param {string} startHash - Oldest hash to generate revision list. Git
 *      revision lists are exclusive of the start commit, so this hash will NOT
 *      be included in the returned revision list.
 * @param {string} endHash - Newest hash to generate revision list. Git
 *      revision lists are inclusive of the start commit, so this hash WILL be
 *      included in the returned revision list.
 * @param {string} branch - Target branch current and last commits should be on.
 * @returns {string[]} Revision list of commits between supplied commit hashes.
 */
const getRevList = (startHash, endHash, branch) => {
    // Uniquely identify supplied commit hashes.
    startHash = getLongHash(startHash, branch)
    endHash = getLongHash(endHash, branch)

    // Get revision list of long commit hashes, ignoring commits with more than
    // 1 parent (i.e. ignoring merge commits).
    const options = `--max-parents=1 ${startHash}..${endHash}`
    const revList = execSync(`git rev-list ${options}`)
        .toString()
        .split("\n")

    return revList
}

/**
 * Find long hash from supplied short hash. The supplied short hash should
 * uniquely identify a commit in the git log, and must optionally be on a
 * specified branch.
 *
 * @summary Find long hash from commit short hash.
 * @param {string} shortHash - Short hash of commit (minimum 4 characters).
 * @param {string} [branch=master] - Target branch to check if commit is on.
 * @param {boolean} [checkBranch=true] - Flag to check if commit is on branch.
 * @returns {string} Long hash of unique commit identified by short hash.
 */
const getLongHash = (shortHash, branch = "master", checkBranch = true) => {
    let /** @type {string|undefined} */ longHash

    // Find long hash from supplied argument using by executing git commands.
    try {
        // Find long hash from supplied short hash, throwing if not unique.
        longHash = execSync(`git log ${shortHash} -1 --pretty="%H"`).toString()
        longHash = longHash.match(/(?<=^)[0-9|a-f]{40}(?=\n$)/)?.[0]
        if (!longHash) { throw new Error("Commit not unique") }

        if (checkBranch) {
            // Check that commit exists on the specified branch, throwing error
            // if the commit is not on branch.
            const options = `--contains ${longHash} --list "${branch}"`
            const isDeployBranch = execSync(`git branch ${options}`).toString()
            if (!isDeployBranch) {
                throw new Error(`Commit not on specified branch ${branch}`)
            }
        }
    }
    catch (error) {
        // Throw error - commits must be uniquely identifiable or on required
        // branch, changelog generation should not complete otherwise.
        longHash = typeof longHash === "string" ? longHash : "unknown"
        throw new DecoratedError({
            name: "",
            message: "Error with supplied commit hash or identifier",
            "short-hash": shortHash,
            "long-hash": longHash,
            detail: /** @type {Error} */ (error).message
        })
    }

    return longHash
}

/**
 * Parse commit to an object containing data for changelog prompt. Fetches data
 * primarily with git log, using a specified pretty format placeholders to log
 * the required data to a newline separated string. This data is then parsed to
 * infer commit semver impact, category etc.
 *
 * See here https://git-scm.com/docs/git-log#_pretty_formats for more
 * information on pretty format placeholders when logging git commits.
 *
 * @summary Parse commit to an object containing data for changelog prompt.
 * @param {string} hash - Hash of commit to fetch and parse.
 * @returns {ParsedCommit}
 */
const parseCommit = hash => {
    // Use git pretty format to log only required information about commit, and
    // destructure result to const values.
    const prettyFormat = "%H%n%h%n%as%n%s%n%(trailers)"
    const [longHash, shortHash, date, rawTitle, ...stringTrailers] =
        execSync(`git log ${hash} -1 --pretty="${prettyFormat}"`)
            .toString()
            .split("\n")

    // Fetch commit semver flag and leading imperative verb of commit summary.
    const lightweightRegex = /^[a-z]{3}(?<flag>[!^~=?])\s(?<verb>[a-zA-Z]*).*$/
    const { flag, verb } = rawTitle.match(lightweightRegex)?.groups || {}

    // Fetch summary from raw title (summary is remaining commit title after the
    // noun abbreviation and flag) - if title is of unknown format, then the
    // summary defaults to the entire title.
    const summaryRegex = /^([a-z]{3}[!^~=?]\s)?(?<summary>.*)$/
    const { summary } = rawTitle.match(summaryRegex)?.groups || {}

    // Determine semver change based on flag in git title - if regex fails to
    // isolate valid semver flag, then semver is undefined, otherwise null if no
    // semver change made (i.e. if flag is "=").
    const semver = flag === "!" ? "**BREAKING CHANGE**"
        : flag === "^" ? "*Minor*"
        : flag === "~" ? "*Patch*"
        : flag === "=" ? "" // Evaluates false when checking for semver changes
        : "*Unknown Change*"

    // Determine commit category based on leading imperative verb in summary.
    const dependencyRegex = /^((bump)|(update)|(upgrade)|(migrate))$/i
    const category = verb?.match(/add/i) ? "Added"
        : verb?.match(/^rewrite$/i) ? "Rewritten"
        : verb?.match(/^change$/i) ? "Changed"
        : verb?.match(/^modify$/i) ? "Modified"
        : verb?.match(/^remove$/i) ? "Removed"
        : verb?.match(/^deprecate$/i) ? "Deprecated"
        : verb?.match(/^fix$/i) ? "Fixed"
        : verb?.match(/^secure$/i) ? "Security"
        : verb?.match(/^improve$/i) ? "Performance"
        : verb?.match(dependencyRegex) ? "Dependencies"
        : "Other"

    // Parse git trailers into an array of git trailer objects.
    const trailers = /** @type {{key:string, value:string}[]} */ ([])
    for (const trailer of stringTrailers) {
        // Find key and value of current trailer.
        const regex = /^(?<key>.+):\s(?<value>.+)$/
        const { key, value } = trailer.match(regex)?.groups || {}

        // If key or value not found, continue, otherwise push to array.
        if (!key || !value) { continue }
        trailers.push({ key, value })
    }

    return {
        details: { longHash, shortHash, date },
        title: { semver, category, summary },
        trailers,
        isRevert: !!verb?.match(/revert/i)
    }
}

// @@exports
export { getRevList, getLongHash, parseCommit }
