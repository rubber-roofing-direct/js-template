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
 * @file Plop generator prompt types.
 * @author James Reid
 */

// @ts-check

// @@no-imports

// @@body
/**
 * @typedef {object} DocPromptData
 * @property {string} title
 * @property {string[]} children
 * @property {string} repoName
 * @property {boolean} shouldContinue - Should plop action be executed?
 */

/**
 * @typedef {object} PackagePromptData
 * @property {string} name
 * @property {string} version
 * @property {string} description
 * @property {string} keywords
 * @property {string} repository
 * @property {string} author
 * @property {string} bin
 * @property {boolean} shouldContinue - Should plop action be executed?
 */

/**
 * @typedef {object} ResetPromptData
 * @property {string} firstHash
 * @property {string} firstVersion
 * @property {string} badgeName
 * @property {string} badgeDetail
 * @property {string} shieldLabelColor
 * @property {string} shieldColor
 * @property {string} repoOwner
 * @property {string} repoName
 * @property {string} repoMainBranch
 * @property {string} copyrightYear
 * @property {string} copyrightOwner
 * @property {boolean} isPackage
 * @property {boolean} isScopedPackage
 * @property {string} packageOwner
 * @property {string} packageName
 * @property {string} readmeTitle
 * @property {boolean} isDemo
 * @property {string} demoUrl
 * @property {boolean} shouldContinue - Should plop action be executed?
 */

/**
 * @typedef {object} ScriptPromptData
 * @property {string} path
 * @property {string} copyrightYear
 * @property {string} copyrightOwner
 * @property {string} scriptDescription
 * @property {string} scriptAuthor
 * @property {boolean} shouldContinue - Should plop action be executed?
 */

// @@exports
/**
 * @ignore
 * @type {DocPromptData}
 */
export let DocPromptData

/**
 * @ignore
 * @type {PackagePromptData}
 */
export let PackagePromptData

/**
 * @ignore
 * @type {ResetPromptData}
 */
export let ResetPromptData

/**
 * @ignore
 * @type {ScriptPromptData}
 */
export let ScriptPromptData
