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
 * Generate RequestOptions object for https request to "/repos/<path>" endpoint
 * of the github api. See [here](https://docs.github.com/en/rest/overview/endpoints-available-for-fine-grained-personal-access-tokens?apiVersion=2022-11-28#repos)
 * for available repo endpoints using fine grained personal access tokens.
 *
 * @param {string} methodPath - String of the format "<METHOD> <endpoint>"
 *      containing the required http method, and subpath of github api endpoint
 *      (excluding the identifying repo owner and name) for the request.
 * @param {{repoOwner:string, repoName:string}} obj - Repo owner and name
 *      forming part of full api endpoint path to identify the required repo.
 * @returns {https.RequestOptions} - Http RequestOptions object for github api.
 */
const getRepoOptions = (methodPath, { repoOwner, repoName } = cli) => {
    // Get http request method and endpoint path for request.
    const methodPathRegex = /^(?<method>[a-z,A-Z]*)\s?(?<path>.*)$/
    const { method, path } = methodPath.match(methodPathRegex)?.groups || {}

    // Return https RequestOptions object for github api.
    return {
        hostname: "api.github.com",
        path: `/repos/${repoOwner}/${repoName}${path ? `/${path}` : ""}`,
        method: method?.toUpperCase() || "GET",
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${cli.token}`,
            "User-Agent": `node/${process.versions.node}`
        }
    }
}

/**
 * Get request url from ClientRequest object returned by https.request() method.
 *
 * @param {ClientRequest} request - Node ClientRequest object.
 * @returns {string} Url of request.
 */
const getUrl = request => {
    return `${request.protocol}//${request.host}${request.path}`
}

/**
 * Delete issue label by name from github issue tracker for the given repo
 * identified by options passed in the cli.
 *
 * @param {string} name - Name of label to delete.
 * @returns {Promise.<{name:string, status:number|undefined, message:string}>}
 *      Returns promise, rejects if label deletion fails.
 */
const deleteLabel = name => {
    return new Promise((resolve, reject) => {
        // Get https request options object, and request label deletion.
        const options = getRepoOptions(`DELETE labels/${encodeURI(name)}`)
        const req = https.request(options, res => {
            // Generate data object containing summary details of request.
            const data = { name, url: getUrl(req), status: res.statusCode }

            // Resolve promise if label is deleted (expected response code 204),
            // otherwise reject.
            res.statusCode === 204
                ? resolve({ ...data, message: "Label deleted" })
                : reject({ ...data, message: "Label not deleted" })
        })

        // Throw any error on request.
        req.on("error", error => { throw error })

        // End request.
        req.end()
    })
}

/**
 * Create issue label in github issue tracker for the given repo identified by
 * options passed in the cli.
 *
 * @param {{name:string, color:string, description:string}} obj - Name, color
 *      and description string of label to be created.
 * @returns {Promise.<{name:string, status:number|undefined, message:string}>}
 *      Returns promise, rejects if label creation fails.
 */
const createLabel = ({ name, color, description }) => {
    return new Promise((resolve, reject) => {
        // Get https request options object, and request label creation.
        const options = getRepoOptions("POST labels")
        const req = https.request(options, res => {
            // Generate data object containing summary details of request.
            const data = { name, url: getUrl(req), status: res.statusCode }

            // Resolve promise if label is created (expected response code 201),
            // otherwise reject.
            res.statusCode === 201
                ? resolve({ ...data, message: "Label created" })
                : reject({ ...data, message: "Label not created" })
        })

        // Throw any error on request.
        req.on("error", error => { throw error })

        // Write object containing details of label to be created to request.
        req.write(JSON.stringify({ name: encodeURI(name), color, description }))

        // End request.
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

// Get https request options object, and request all current labels from repo.
// Upon end of response, delete *all* existing labels then create new labels
// from json file containing label objects.
const options = getRepoOptions("GET labels")
const req = https.request(options, res => {
    // Throw error if success status code not received.
    if (!res.statusCode?.toString().match(/^2\d{2}$/)) {
        throw new DecoratedError({
            name: "GithubApiError",
            message: "Existing labels not found",
            "status-code": res.statusCode?.toString() || "",
            "status-message": res.statusMessage || ""
        })
    }

    // Read contents of response to string.
    let data = ""
    res.on("data", buffer => { data += buffer.toString() })

    // Delete all labels then create new labels in repo when response is ended.
    res.on("end", async () => {
        console.log("Deleting labels:")

        // Parse labels array into object.
        const currentLabels = /** @type {GithubLabel[]} */ (JSON.parse(data))

        // Delete all existing labels.
        for (const [i, { name }] of currentLabels.entries()) {
            // Log details of current label being deleted, clearing console line
            // each time.
            const count = `[${i + 1}/${currentLabels.length}]`
            const msg = decorateFg(`${name} ${count}`, "gray", 1)
            readline.clearLine(process.stdout, 0)
            readline.cursorTo(process.stdout, 0)
            process.stdout.write(msg)

            // Delete label, throwing error if deletion promise is rejected.
            await deleteLabel(name)
                .catch(error => {
                    throw new DecoratedError({
                        ...error,
                        name: "LabelError"
                    })
                })
        }

        console.log("\nCreating labels:")

        // Create new labels from those fetched from json data file.
        for (const [i, label] of updatedLabels.entries()) {
            // Log details of current label being created, clearing console line
            // each time.
            const count = `[${i + 1}/${updatedLabels.length}]`
            const msg = decorateFg(`${label.name} ${count}`, "gray", 1)
            readline.clearLine(process.stdout, 0)
            readline.cursorTo(process.stdout, 0)
            process.stdout.write(msg)

            // Create label, throwing error if creation promise is rejected.
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

// Throw any error on request.
req.on("error", error => { throw error })

// End request.
req.end()

// @@no-exports
