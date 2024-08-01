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
 * @file Github label and cli option types for update command.
 * @ignore
 * @author James Reid
 */

// @ts-check

// @@no-imports

// @@body
/**
 * Type of object returned by github api when listing/requesting a label data.
 * @typedef {object} GithubLabel
 * @property {number} id Custom github label id.
 * @property {string} node_id Custom string github label id.
 * @property {string} url Github URL of label.
 * @property {string} name Label name as displayed in repository.
 * @property {string} color Colour used for "pill" of label on github.
 * @property {boolean} default Label name as displayed in repository.
 * @property {string} description Is label a default label as suggested or
 * automatically added when a new repository is created on github.
 */

/**
 * Type of available cli options for github label update command.
 * @typedef LabelCliOptions
 * @property {string} path Relative path to label json file (containing array
 * of label objects to be used for update) from repo package.json file.
 * @property {string} token Github personal access token.
 * @property {string} repoOwner Github owner (username or organisation name)
 * of remote repository for labels to be updated.
 * @property {string} repoName Github repository name of remote repository for
 * labels to be updated.
 */

// @@exports
/**
 * @type {GithubLabel}
 * @ignore
 */
export let GithubLabel

/**
 * @type {LabelCliOptions}
 * @ignore
 */
export let LabelCliOptions
