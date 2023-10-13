// Copyright (c) 2022 James Reid. All rights reserved.
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
 * @file Rollup config
 * @author James Reid
 */

// @ts-check

// @@imports-dependencies
import { nodeResolve } from "@rollup/plugin-node-resolve"
import terser from "@rollup/plugin-terser"
import dts from "rollup-plugin-dts"

// @@body
// declare rollup config object
const configs = [
    {
        name: "bin",
        development: [
            {
                input: "./src/bin/index.js",
                output: [
                    { file: "./dist/package/index.js", format: "es" }
                ]
            }
        ],
        production: [
            {
                input: "./src/bin/index.js",
                output: [
                    { file: "./dist/package/index.js", format: "es" }
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
                    { file: "./dist/package/index.js", format: "es" }
                ]
            }
        ],
        production: [
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
            {
                input: "./dist/package/declarations/index.d.ts",
                output: [
                    { file: "./dist/package/index.d.ts", format: "es" }
                ],
                plugins: [
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
 * @returns
 */
const configSelector = () => {
    //
    const development = process.env.npm_lifecycle_event?.split(":")[1] === "dev"
    const name = process.env.npm_lifecycle_event?.split(":")[2] || "package"

    // chose config
    const config = configMap.get(name)
    if (!config) { throw new Error(`No config by the name ${name} exists`) }

    // return env
    return development ? config.development : config.production
}

// @@exports
export default configSelector
