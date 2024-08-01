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
 * @file Parse package.json file with methods for extracting remote owner
 * (github user or organisation), and for checking that the remote
 * repository exists.
 * @ignore
 * @author James Reid
 */

// @ts-check

// @@imports-node
import fs from "fs"

// @@imports-module
import { DecoratedError } from "./decorate-cli.js"

// @@body
/**
 * Parse repository package.json file into object, providing wrapped error
 * function which may be called by any consumer to throw a consistently
 * formatted error.
 * @summary Parse repository package.json file into object.
 * @param {string} [pathname=package.json] Path to repo package.json file.
 * @returns {{packageObject:any, packageError:(error:Error)=>never}} Parsed
 * packageObject returned by JSON.parse method, and packageError function
 * which allows any consumer of the json file to throw a consistently
 * formatted error.
 */
const parsePackage = (pathname = "package.json") => {
    // Create custom "PackageJsonError" from DecoratedError constructor. This
    // allows any consumer of the package json file to throw a consistently
    // formatted error if any missing/incorrectly formatted data is found.
    const packageError = (/** @type {Error} */ error) => {
        throw new DecoratedError({
            name: "PackageJsonError",
            message: "Error encountered parsing repository package.json file",
            path: `${process.cwd()}/${pathname}`,
            detail: error.message,
            "caller-stack": /** @type {string} */ (error.stack)
        })
    }

    // Parsed package.json object.
    let packageObject

    // Fetch and parse package.json file, throwing error if not found or if file
    // format incorrect.
    try { packageObject = JSON.parse(fs.readFileSync(pathname).toString()) }
    catch (error) { packageError(/** @type {Error} */ (error)) }

    return { packageObject, packageError }
}

/**
 * Fetch owner and repo name of github remote using the repository object in
 * found in the package.json file.
 * @summary Fetch owner and repo name of github remote.
 * @returns {{owner:string, repo:string}} Owner and repo name fetched from
 * package.json repository object.
 */
const getRemote = () => {
    // Fetch owner and repo from the from the repository field of the
    // package.json file. Regex for fetching owner and repo are currently based
    // on the github url format only since the template repository which this
    // script is from is intended only for initialising boilerplate javascript
    // repositories on github.
    const regex = /https:\/\/github\.com\/(?<owner>.*)\/(?<repo>.*)\.git$/
    const { packageObject, packageError } = parsePackage()

    // Owner (username or organisation name) and repo name of repo on github.
    const { owner, repo } = /** @type {{owner:string, repo:string}} */
        (packageObject.repository?.url?.match(regex)?.groups || {})

    // If format not recognised, call error handler form parsePackage.
    if (!owner || !repo) {
        const msg = "Repository unset or unrecognized, no remote url found"
        packageError(new Error(msg))
    }

    return { owner, repo }
}

/**
 * Check that remote github repository exists, throwing error if the repository
 * is not found.
 * @summary Check that remote github repository exists.
 * @param {string} repoOwner Github owner (user or organisation) of remote.
 * @param {string} repoName Github repository name of remote.
 * @param {string} token Fine grained GitHub access token.
 * @returns {Promise<void>} No return value, throws error if not found.
 * @throws {DecoratedError} Throws when:
 * - Remote repository not found.
 */
const checkRemote = async (repoOwner, repoName, token) => {
    // Setup controller.
    const controller = new AbortController()
    const { signal } = controller

    // Fetch github repository remote using api and fine-grained access token
    // such that private repositories will also be found.
    await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
        method: "GET",
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${token}`,
            "User-Agent": `node/${process.versions.node}`
        },
        signal
    })
        .then(res => {
            // End connection.
            controller.abort()

            // Throw error if the returned status code is not 2xx.
            if (!res.ok) {
                throw new DecoratedError({
                    name: "RemoteRepositoryError",
                    message: `Remote responded with "${res.statusText}"`,
                    url: res.url,
                    status: res.status
                })
            }
        })
        .catch(error => { throw error })
}

// @@exports
export { parsePackage, getRemote, checkRemote }
