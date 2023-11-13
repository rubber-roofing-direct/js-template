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
 * @file Helper methods for creating shields.io badges.
 * @author James Reid
 */

// @ts-check

// @@no-imports

// @@body
/**
 * Sanitize spaces, underscores and hyphens in strings used in URLs when
 * creating badges using shields.io endpoints.
 *
 * @param {string} string - Input string.
 * @returns Sanitized string for URL.
 */
const sanitizeShieldUrlString = string => {
    return string
        .replaceAll("-", "--")
        .replaceAll("_", "__")
        .replaceAll(" ", "_")
}

// @@exports
export { sanitizeShieldUrlString }
