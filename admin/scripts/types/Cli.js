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
 * @file Types for cli arguments and option flags.
 * @ignore
 * @author James Reid
 */

// @ts-check

// @@no-imports

// @@body
/**
 * Allowable types for arguments of any cli option.
 * @typedef {string|string[]|boolean|undefined} CliArgument
 */

/**
 * Type of cli option object for setting, names, aliases, defaults, and
 * descriptions of a given cli option for correctly parsing cli arguments.
 * @typedef {object} CliOption
 * @property {string} name Option name.
 * @property {string[]} [aliases] All allowable aliases for the named option.
 * @property {CliArgument} [value] Default value of cli option argument.
 * @property {string} [description] Description of cli option for help.
 * @property {number} [arity] Number of arguments which can be passed to cli
 * option.
 */

// @@exports
/**
 * @type {CliArgument}
 * @ignore
 */
export let CliArgument

/**
 * @type {CliOption}
 * @ignore
 */
export let CliOption
