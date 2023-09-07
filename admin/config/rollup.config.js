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

// @no-imports

// @body
// declare rollup config object
const configs = [
    {
        name: "bin",
        development: [
            {
                input: "src/index.js",
                output: [
                    { file: "dist/package/bundle.min.cjs", format: "cjs" }
                ]
            }
        ],
        production: [
            {
                input: "src/index.js",
                output: [
                    { file: "dist/package/bundle.min.cjs", format: "cjs" }
                ]
            }
        ]
    },

    {
        name: "package",
        development: [
            {
                input: "src/index.js",
                output: [
                    { file: "dist/package/bundle.min.cjs", format: "cjs" }
                ]
            }
        ],
        production: [
            {
                input: "src/index.js",
                output: [
                    { file: "dist/package/bundle.min.cjs", format: "cjs" }
                ]
            }
        ]
    }
]

const configMap = configs.reduce((map, config) => {
    return map.set(config.name, config)
}, new Map())

const configSelector = (cliArguments, { 
    development = process.env.npm_lifecycle_event?.split(":")[1] === "dev", 
    configName = process.env.npm_lifecycle_event?.split(":")[2] || "package"
} = cliArguments) => {
    // clean
    delete cliArguments.development
    delete cliArguments.configName

    // chose conig
    const config = configMap.get(configName)
    if (!config) { 
        throw new Error(`No config by the name ${configName} exists!`) 
    }

    // return env
    return development ? config.development : config.production
}

// @exports
export default configSelector
