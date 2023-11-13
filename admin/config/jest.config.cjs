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
 * @file Jest config.
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
 *
 * @returns {any} Jest config object.
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
