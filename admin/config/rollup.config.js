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
 * @file Rollup config.
 * @ignore
 * @author James Reid
 */

// @ts-check

// @@imports-dependencies
import { nodeResolve } from "@rollup/plugin-node-resolve"
import terser from "@rollup/plugin-terser"
import dts from "rollup-plugin-dts"

// @@imports-types
import * as rollup from "rollup"

// @@body
// Declare node shebang banner for executable scripts.
const banner = "#!/usr/bin/env node"

// Declare rollup config objects for bundling cli tools (executable scripts) and
// package exports for this repository. Each configuration is named and declares
// a rollup configuration for both development and production builds of the
// given source files.
const configs = [
    // Executable scripts config.
    {
        name: "bin",
        development: [
            {
                input: "./src/bin/index.js",
                output: [
                    { banner, file: "./build/bin/index.js", format: "es" }
                ]
            }
        ],
        production: [
            {
                input: "./src/bin/index.js",
                output: [
                    { banner, file: "./dist/bin/index.js", format: "es" }
                ],
                plugins: [
                    // @ts-expect-error - Terser is callable, but has no call
                    // signature supplied provided by exported types.
                    terser({ maxWorkers: 6 }),
                    nodeResolve()
                ]
            }
        ]
    },

    // Package exports config.
    {
        name: "package",
        development: [
            {
                input: "./src/package/index.js",
                output: [
                    { file: "./build/package/index.js", format: "es" }
                ]
            }
        ],
        production: [
            // Production build of package only (excluding types) including
            // single bundle file for CommonJS.
            {
                input: "./src/package/index.js",
                output: [
                    { file: "./dist/package/index.js", format: "es" },
                    { file: "./dist/package/index.cjs", format: "cjs" }
                ],
                plugins: [
                    // @ts-expect-error - Terser is callable, but has no call
                    // signature supplied provided by exported types.
                    terser({ maxWorkers: 6 }),
                    nodeResolve()
                ]
            },

            // Bundle type declarations into one file.
            {
                input: "./dist/package/declarations/index.d.ts",
                output: [
                    { file: "./dist/package/index.d.ts", format: "es" }
                ],
                plugins: [
                    // Note that if dts becomes unsupported there are three main
                    // options for exporting types:
                    //   - Bundle without terser so jsdoc comments are preserved
                    //   - Use terser configured to preserve jsdoc comments
                    //   - Use typescript without dts to which will generate
                    //   multiple declaration files instead of one
                    dts()
                ]
            }
        ]
    }
]

// Create map of available rollup configurations.
const configMap = configs.reduce((map, config) => {
    return map.set(config.name, config)
}, new Map())

/**
 * Select rollup configuration by name of npm script being run.
 * @returns {rollup.RollupOptions} Rollup config object.
 * @throws {Error} Throws when:
 * - No configuration exists by given name found in cli.
 */
const configSelector = () => {
    //
    const development = process.env.npm_lifecycle_event?.split(":")[1] === "dev"
    const name = process.env.npm_lifecycle_event?.split(":")[2] || "package"

    // Chose config type (binary script or package) based on script name called.
    const config = configMap.get(name)
    if (!config) { throw new Error(`No config by the name ${name} exists`) }

    // Return appropriate config based on if it is a dev or production build.
    return development ? config.development : config.production
}

// @@exports
export default configSelector
