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
 * @file Repository plopfile which offers generators exported from ./plop.
 * @author James Reid
 */

// @ts-check

// @@imports-module
import {
    docGenerator,
    packageGenerator,
    resetGenerator,
    scriptGenerator
} from "./plop/index.js"

// @imports-types
/* eslint-disable no-unused-vars -- Types only used in comments. */
import * as plop from "plop"
/* eslint-enable no-unused-vars -- Close disable-enable pair. */

// @@body
/**
 * Prompt each generator exported by the ./plop directory.
 *
 * @param {plop.NodePlopAPI} plop - Instance of plop.
 * @returns {void}
 */
const plopCli = plop => {
    plop.setGenerator("Script", /** @type {any} */ (scriptGenerator))
    plop.setGenerator("Documentation", /** @type {any} */ (docGenerator))
    plop.setGenerator("Package", /** @type {any} */ (packageGenerator))
    plop.setGenerator("Reset", /** @type {any} */ (resetGenerator))
}

// @@exports
export default plopCli
