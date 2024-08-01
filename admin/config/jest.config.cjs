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
 * @file Jest config.
 * @ignore
 * @author James Reid
 */

// @ts-check

// @@no-imports

// @@body
// Fetch root directory of repository (equivalent to current working directory
// since this script is called from an npm script).
const rootDir = process.cwd()

// Declare jest configurations for test suites for each part of the repo (cli
// tools, exported package, and demo site). For more information on configuring
// jest see [here](https://jestjs.io/docs/configuration). Each config below
// is named, and declares a cache directory and directories (relative to the
// given root directory) to search for tests.
const configs = [
    // Cli tools config test suite.
    {
        name: "bin",
        config: {
            cacheDirectory: "./.cache/jest/bin",
            rootDir,
            roots: ["./src/bin"]
        }
    },

    // Package test suite.
    {
        name: "package",
        config: {
            cacheDirectory: "./.cache/jest/package",
            rootDir,
            roots: ["./src/package"]
        }
    },

    // Web demo test suite.
    {
        name: "web",
        config: {
            cacheDirectory: "./.cache/jest/web",
            rootDir,
            roots: ["./src/web"]
        }
    }
]

// Create map of available jest configurations.
const configMap = configs.reduce((map, config) => {
    return map.set(config.name, config)
}, new Map())

/**
 * Select jest configuration by name of npm script being run.
 * @returns {any} Jest config object.
 * @throws {Error} Throws when:
 * - No configuration exists by given name found in cli.
 */
const configSelector = () => {
    // Set config name according to which npm script is being run.
    const name = process.env.npm_lifecycle_event?.split(":")[1] || "package"

    // Chose config based on set name.
    const config = configMap.get(name)
    if (!config) { throw new Error(`No config by the name ${name} exists`) }

    return config.config
}

// @@exports
module.exports = configSelector()
