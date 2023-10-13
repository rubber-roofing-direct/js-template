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
 * @file Github label and cli option types for update command.
 * @author James Reid
 */

// @ts-check

// @@no-imports

// @@body
/**
 * Type of object returned by github api when listing/requesting a label data.
 *
 * @typedef {object} GithubLabel
 * @property {number} id - Custom github label id.
 * @property {string} node_id - Custom string github label id.
 * @property {string} url - Github URL of label.
 * @property {string} name - Label name as displayed in repository.
 * @property {string} color - Colour used for "pill" of label on github.
 * @property {boolean} default - Label name as displayed in repository.
 * @property {string} description - Is label a default label as suggested or
 *      automatically added when a new repository is created on github.
 */

/**
 * Type of available cli options for github label update command.
 *
 * @typedef LabelCliOptions
 * @property {string} path - Relative path to label json file (containing array
 *      of label objects to be used for update) from repo package.json file.
 * @property {string} token - Github personal access token.
 * @property {string} repoOwner - Github owner (username or organisation name)
 *      of remote repository for labels to be updated.
 * @property {string} repoName - Github repository name of remote repository for
 *      labels to be updated.
 */

// @@exports
/**
 * @ignore
 * @type {GithubLabel}
 */
export let GithubLabel

/**
 * @ignore
 * @type {LabelCliOptions}
 */
export let LabelCliOptions
