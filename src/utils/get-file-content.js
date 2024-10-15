const fs = require('fs');
const prettier = require("prettier");
const path = require('path');

const settings = (parser = 'babel') => ({
    arrowParens: "always",
    bracketSpacing: true,
    endOfLine: "lf",
    htmlWhitespaceSensitivity: "css",
    insertPragma: false,
    singleAttributePerLine: false,
    bracketSameLine: false,
    jsxBracketSameLine: false,
    jsxSingleQuote: false,
    printWidth: 80,
    proseWrap: "preserve",
    quoteProps: "as-needed",
    requirePragma: false,
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
    useTabs: false,
    embeddedLanguageFormatting: "auto",
    vueIndentScriptAndStyle: false,
    experimentalTernaries: false,
    parser,
})

async function readFile(filePath, initPath = '') {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
        if (initPath) {
            fs.copyFileSync(initPath, filePath);
        } else {
            return Promise.reject('File path is invalid or does not exist.')
        }
    }
    try {
        const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
        let setInfo = {};
        if (filePath.endsWith(".js")) {
            setInfo = settings();
        }
        if (filePath.endsWith(".ejs")) {
            setInfo = settings("html");
        }
        if (filePath.endsWith(".css")) {
            setInfo = settings("css");
        }
        if (filePath.endsWith(".scss")) {
            setInfo = settings("scss");
        }
        if (filePath.endsWith(".json")) {
            setInfo = settings("json");
        }
        return await prettier.format(fileContent, setInfo);;
    } catch (error) {
        console.log('error', error)
        return Promise.reject('An error occurred while reading the file.')
    }
}

function updateFile(filePath, newContent) {
    const resolvedPath = path.resolve(filePath);
    try {
        fs.writeFileSync(resolvedPath, newContent, 'utf-8');
    } catch (error) {
        throw new Error(error?.message || 'Failed to update file content.');
    }
}

function copyImg({ sourceImage, destinationImage }) {
    try {
        fs.copyFileSync(sourceImage, destinationImage);
        console.log(`Image copied to ${destinationImage}`);
    } catch (error) {
        throw new Error(error?.message || 'Failed to copy img.');
    }
}

module.exports = {
    readFile,
    updateFile,
    copyImg
}