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
 * @file Rollup config.
 * @author James Reid
 */

// @ts-check

// @@imports-dependencies
import { nodeResolve } from "@rollup/plugin-node-resolve"
import terser from "@rollup/plugin-terser"
import dts from "rollup-plugin-dts"

// @@imports-types
/* eslint-disable no-unused-vars -- Types only used in comments. */
import * as rollup from "rollup"
/* eslint-enable no-unused-vars -- Close disable-enable pair. */

// @@body
//
const banner = "#!/usr/bin/env node"

// Declare rollup config object.
const configs = [
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
            // Production build of package.
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

const configMap = configs.reduce((map, config) => {
    return map.set(config.name, config)
}, new Map())

/**
 *
 * @returns {rollup.RollupOptions}
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
