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
 * @file Helper methods for creating shields.io badges.
 * @author James Reid
 */

// @ts-check

// @@no-imports

// @@body
/**
 * Sanitize spaces, underscores and hyphens in strings used in URLs when
 * creating badges using shields.io endpoints.
 * @param {string} string Input string.
 * @returns {string} Sanitized string for URL.
 */
const sanitizeShieldUrlString = string => {
    return string
        .replaceAll("-", "--")
        .replaceAll("_", "__")
        .replaceAll(" ", "_")
}

// @@exports
export { sanitizeShieldUrlString }
