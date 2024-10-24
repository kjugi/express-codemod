const { Command } = require("commander")
const jscodeshift = require("jscodeshift")
const packageJson = require('./package.json')
const { resolve } = require('node:path');
const { existsSync, lstatSync, readFileSync, writeFileSync } = require("node:fs");

const program = new Command();
const j = jscodeshift

const convertDeprecated = (filePath) => {
    const fileContent = readFileSync(filePath).toString()
    const newFileContent = j(fileContent)
        .find(j.CallExpression, {
            callee: {
                property: {
                    name: 'redirect'
                }
            }
        })
        .map(path => {
            if (path.value.arguments.length === 2) {
                path.value.arguments.reverse()
            }
        })
        .toSource();

    // Save new file content
    writeFileSync(filePath, newFileContent)
}

program
    .name('express-codemods')
    .description('to help community move to new API in express projects')
    .version(packageJson.version);

program
    .command('removed-api-v5')
    // based on:
    // - http://expressjs.com/en/guide/migrating-5.html#app.del
    // - http://expressjs.com/2024/10/15/v5-release.html
    .description('goes through project and replaces with new syntax')
    .argument('[path]', 'path to project directory or file (current directory as default)')
    .action((path) => {
        console.log('Starting process... \n');
        const projectPath = resolve(__dirname, path || '');

        if (!existsSync(projectPath)) {
            throw new Error('Provided path does not exists');
        }

        if (projectPath.endsWith('.js') || projectPath.endsWith('.ts')) {
            convertDeprecated(projectPath)
        } else if (lstatSync(projectPath).isDirectory()) {
            // TODO: Glob for a directory files and run script
        } else {
            console.error('Couldn\'t run any codemod on given path! Try again')
        }

        // TODO: Update package.json file with express v5

        console.log('Finished. \n')
    })

program.parse()