export default function (plop) {
    plop.setGenerator("Documentation", {
        description: "doc",
        // package, title
        // update contents.json (mode)
        prompts: [{
            type: "input",
            name: "name",
            message: "input name"
        }],
        actions: [{
            type: "add",
            path: "../../docs/test.md",
            templateFile: "../templates/doc.hbs"
        }]
    })
    plop.setGenerator("Script", {
        description: "test",
        // year, owner, description, author
        prompts: [{
            type: "input",
            name: "name",
            message: "input name"
        }],
        actions: data => {
            console.log(data)
            return []
        }
    })
}

// make docs file with name
// make js file with date and author name