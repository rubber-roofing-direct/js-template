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
 * @file Type definitions for required data parsed from git commits.
 * @author James Reid
 */

// @ts-check

// @@no-imports

// @@body
/**
 * Wrapper object for all data parsed from a given commit required for rendering
 * a changelog prompt.
 *
 * @typedef {object} ParsedCommit
 * @property {CommitDetails} details - Hash and date of commit.
 * @property {CommitTitle} title - Parsed title with summary, category etc.
 * @property {{key:string, value:string}[]} trailers - Git trailers parsed from
 *      the end of the commit body.
 * @property {boolean} isRevert - Boolean value for if commit reverts changes.
 */

/**
 * Type of data parsed from commit title required for rendering a changelog
 * prompt.
 *
 * @typedef {object} CommitTitle
 * @property {string} semver - Semver version change string, inferred from
 *      semver flag found in commit title.
 * @property {string} category - Changelog category of changes made, inferred
 *      from 3 letter commit noun acronym in commit title.
 * @property {string} summary - Summary of changes made, inferred from commit
 *      title ignoring category and semver flag.
 */

/**
 * Type of date parse from commit details required for rendering a changelog
 * prompt.
 *
 * @typedef {object} CommitDetails
 * @property {string} longHash - Long/full hash of commit (40 characters long).
 * @property {string} shortHash - Short hash of commit as given by the "%h"
 *      placeholder when logging using a custom pretty format string.
 * @property {string} date - Date of commit in format "YYYY-MM-DD".
 */

// @@exports
/**
 * @ignore
 * @type {ParsedCommit}
 */
export let ParsedCommit

/**
 * @ignore
 * @type {CommitTitle}
 */
export let CommitTitle
