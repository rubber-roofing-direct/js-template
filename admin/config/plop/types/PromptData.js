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
 * @file Plop generator prompt types.
 * @ignore
 * @author James Reid
 */

// @ts-check

// @@no-imports

// @@body
/**
 * Type of inquirer prompt data for documentation file plop generator.
 * @typedef {object} DocPromptData
 * @property {string} title - Title of documentation file (kebab-case filename
 * will be inferred from this title).
 * @property {string[]} children - Children of documentation file to be listed
 * in yaml frontmatter of file.
 * @property {string} repoName - Repository name for shields.io banner badge.
 * @property {boolean} shouldContinue - Should plop action be executed?
 */

/**
 * Type of inquirer prompt data for package.json modification plop generator.
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
 * @typedef {object} ResetPromptData
 * @property {string} firstHash - First hash to appear in changelog file.
 * @property {string} firstVersion - First version to appear in changelog file.
 * @property {string} badgeName - Left text for banner badge.
 * @property {string} badgeDetail - Right text for banner badge.
 * @property {string} shieldLabelColor - Left color of badges excluding banner.
 * @property {string} shieldColor - Right color of badges excluding banner.
 * @property {string} repoOwner - Github repo owner.
 * @property {string} repoName - Github repo name.
 * @property {string} repoMainBranch - Main branch name of repo.
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
 * @type {DocPromptData}
 * @ignore
 */
export let DocPromptData

/**
 * @type {PackagePromptData}
 * @ignore
 */
export let PackagePromptData

/**
 * @type {ResetPromptData}
 * @ignore
 */
export let ResetPromptData

/**
 * @type {ScriptPromptData}
 * @ignore
 */
export let ScriptPromptData
