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
 * Type of inquirer prompt data for documentation file plop generator.
 *
 * @typedef {object} DocPromptData
 * @property {string} title - Title of documentation file (kebab-case filename
 *      will be inferred from this title).
 * @property {string[]} children - Children of documentation file to be listed
 *      in yaml frontmatter of file.
 * @property {string} repoName - Repository name for shields.io banner badge.
 * @property {boolean} shouldContinue - Should plop action be executed?
 */

/**
 * Type of inquirer prompt data for package.json modification plop generator.
 *
 * @typedef {object} PackagePromptData
 * @property {string} name - Package name.
 * @property {string} version - Initial package version.
 * @property {string} description - Package description.
 * @property {string} keywords - Space separated package keywords.
 * @property {string} repository - Package repository url (assumed git).
 * @property {string} author - Package author.
 * @property {string} bin - Name of main executable package script.
 * @property {boolean} shouldContinue - Should plop action be executed?
 */

/**
 * Type of inquirer prompt data for documentation file reset plop generator.
 *
 * @typedef {object} ResetPromptData
 * @property {string} firstHash - First hash to appear in changelog file.
 * @property {string} firstVersion - First version to appear in changelog file.
 * @property {string} badgeName - Left text for banner badge.
 * @property {string} badgeDetail - Right text for banner badge.
 * @property {string} shieldLabelColor - Left color of badges excluding banner.
 * @property {string} shieldColor - Right color of badges excluding banner.
 * @property {string} repoOwner - Github repo owner.
 * @property {string} repoName - Github repo name.
 * @property {string} repoMainBranch - Main branch of repo.
 * @property {string} copyrightYear - Repo license file copyright year.
 * @property {string} copyrightOwner - Repo license file copyright owner.
 * @property {boolean} isPackage - Does this repository export a package?
 * @property {boolean} isScopedPackage - Is the exported package org scoped?
 * @property {string} packageOwner - Owner or scope of exported package.
 * @property {string} packageName - Name of exported package.
 * @property {string} readmeTitle - Title used in README documentation file.
 * @property {boolean} isDemo - Does this repository provide a demo site?
 * @property {string} demoUrl - Url of demo site.
 * @property {boolean} shouldContinue - Should plop action be executed?
 */

/**
 * Type of inquirer prompt data for script file plop generator.
 *
 * @typedef {object} ScriptPromptData
 * @property {string} path - Path to file (including filename).
 * @property {string} copyrightYear - Copyright year of file.
 * @property {string} copyrightOwner - Copyright owner of file.
 * @property {string} scriptDescription - Description of module script.
 * @property {string} scriptAuthor - Main script author.
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
