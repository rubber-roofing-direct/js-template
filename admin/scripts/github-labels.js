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
 * This script replaces all labels on a github remote with a set of updated or
 * default labels from an external json file. Any missing data, or data which
 * this script cannot parse will cause an error to be thrown, and the process
 * will terminate without updating the labels.
 *
 * @ignore
 * @file Update labels on github remote given a file of updated labels to add.
 * @author James Reid
 */

// @ts-check

// @@imports-node
import fs from "fs"
import https from "https"
import readline from "readline"

// @@imports-dependencies
import "dotenv/config"

// @@imports-utils
import {
    DecoratedError,
    decorateFg,
    parseCliArguments,
    checkRemote,
    getRemote
} from "./utils/index.js"

// @@imports-types
/* eslint-disable no-unused-vars -- Types only used in comments. */
import { GithubLabel, LabelCliOptions } from "./types/index.js"
import { ClientRequest } from "http"
/* eslint-enable no-unused-vars -- Close disable-enable pair. */

// @@body
/**
 *
 * @param {string} methodPath
 * @returns {https.RequestOptions}
 */
const getRepoOptions = (methodPath, { repoOwner, repoName } = cli) => {
    //
    const methodPathRegex = /^(?<method>[a-z,A-Z]*)\s?(?<path>.*)$/
    const { method, path } = methodPath.match(methodPathRegex)?.groups || {}

    //
    return {
        hostname: "api.github.com",
        path: encodeURI(
            `/repos/${repoOwner}/${repoName}${path ? `/${path}` : ""}`
        ),
        method: method?.toUpperCase() || "GET",
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${cli.token}`,
            "User-Agent": `node/${process.versions.node}`
        }
    }
}

/**
 *
 * @param {ClientRequest} request
 * @returns {string}
 */
const getUrl = request => {
    return `${request.protocol}//${request.host}${request.path}`
}

/**
 *
 * @param {string} name
 * @returns {Promise.<{name:string, status:number|undefined, message:string}>}
 *      Returns promise, rejects if label deletion fails.
 */
const deleteLabel = name => {
    return new Promise((resolve, reject) => {
        //
        const options = getRepoOptions(`DELETE labels/${encodeURI(name)}`)
        const req = https.request(options, res => {
            //
            const data = { name, url: getUrl(req), status: res.statusCode }
            if (res.statusCode !== 204) {
                reject({ ...data, message: "Label not deleted" })
            }

            resolve({ ...data, message: "Label deleted" })
        })
        req.on("error", error => { throw error })

        req.end()
    })
}

/**
 *
 * @param {{name:string, color:string, description:string}} obj -
 * @returns {Promise.<{name:string, status:number|undefined, message:string}>}
 *      Returns promise, rejects if label creation fails.
 */
const createLabel = ({ name, color, description }) => {
    return new Promise((resolve, reject) => {
        //
        const req = https.request(getRepoOptions("POST labels"), res => {
            //
            const data = { name, url: getUrl(req), status: res.statusCode }
            if (res.statusCode !== 201) {
                reject({ ...data, message: "Label not created" })
            }

            resolve({ ...data, message: "Label created" })
        })
        req.on("error", error => { throw error })

        //
        req.write(JSON.stringify({ name: encodeURI(name), color, description }))

        req.end()
    })
}

// Fetch owner (username or organisation name) and repo name of repo on github.
const { owner, repo } = getRemote()

// Parse options from cli with appropriate defaults.
const defaults = {
    path: {
        name: "path",
        aliases: ["p"],
        value: "admin/config/labels.json",
        description: "Relative path to changelog from repo package.json file."
    },
    token: {
        name: "token",
        aliases: ["t"],
        value: process.env.GITHUB_ACCESS_TOKEN || "",
        description: "Relative path to changelog from repo package.json file."
    },
    repoOwner: {
        name: "repo-owner",
        aliases: ["o"],
        value: owner,
        description: "Github organisation or user of remote repository."
    },
    repoName: {
        name: "repo-name",
        aliases: ["n"],
        value: repo,
        description: "Github repository name of remote repository."
    }
}
const cli = /** @type {LabelCliOptions} */ (parseCliArguments(defaults))

// Check that git repository exists on github.
await checkRemote(cli.repoOwner, cli.repoName)

// Array of updated labels to be added to repository.
let /** @type {GithubLabel[]} */ updatedLabels

// Load default labels to be used for updated github repository labels.
try { updatedLabels = JSON.parse(fs.readFileSync(cli.path).toString()) }
catch (error) {
    throw new DecoratedError({
        name: "LabelError",
        message: "Error parsing updated labels file",
        path: `${process.cwd()}/${cli.path}`,
        detail: /** @type {Error} */ (error).message
    })
}

//
const req = https.request(getRepoOptions("GET labels"), res => {
    let data = ""
    res.on("data", buffer => { data += buffer.toString() })
    res.on("end", async () => {
        console.log("Deleting labels:")

        const currentLabels = /** @type {GithubLabel[]} */ (JSON.parse(data))

        for (const [i, { name }] of currentLabels.entries()) {
            const count = `[${i + 1}/${currentLabels.length}]`
            const msg = decorateFg(`${name} ${count}`, "gray", 1)
            readline.clearLine(process.stdout, 0)
            readline.cursorTo(process.stdout, 0)
            process.stdout.write(msg)
            await deleteLabel(name)
                .catch(error => {
                    throw new DecoratedError({
                        ...error,
                        name: "LabelError"
                    })
                })
        }

        console.log("\nCreating labels:")

        for (const [i, label] of updatedLabels.entries()) {
            const count = `[${i + 1}/${updatedLabels.length}]`
            const msg = decorateFg(`${label.name} ${count}`, "gray", 1)
            readline.clearLine(process.stdout, 0)
            readline.cursorTo(process.stdout, 0)
            process.stdout.write(msg)
            await createLabel(label)
                .catch(error => {
                    throw new DecoratedError({
                        ...error,
                        name: "LabelError"
                    })
                })
        }
    })
})
req.on("error", error => { throw error })

req.end()

// @@no-exports
