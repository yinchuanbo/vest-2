const sass = require("sass");
const { minify } = require("terser");
var ejs = require("ejs");
const path = require("path");
const fs = require("fs").promises;
const fs2 = require("fs");
// const babel = require("@babel/core");

const compressAndObfuscate = (filePath) => {
  return new Promise((resolve, reject) => {
    const lanRoot = filePath.split("\\ejs\\")[0];
    const indexJsPath = `${lanRoot}\\dist\\lan\\index.js`;
    const name = path.basename(filePath);
    let outputFilePath = `${lanRoot}\\${name.replace(".ejs", ".html")}`;
    try {
      delete require.cache[require.resolve(indexJsPath)];
      let jsonData = require(indexJsPath);
      const templatePath = filePath;
      const params = {
        ...jsonData,
        faceSSwap: JSON.stringify(jsonData?.faceSwap || {}),
        allData: JSON.stringify(jsonData),
        voice_Generator: JSON.stringify(jsonData?.voiceGenerator || {}),
      }
      ejs.renderFile(
        templatePath,
        params,
        async (err, result) => {
          if (err) {
            reject(err?.message || err)
          }
          const outputDir = path.dirname(outputFilePath);
          await fs.mkdir(outputDir, { recursive: true });
          await fs.writeFile(outputFilePath, result);
          resolve()
        }
      );
    } catch (error) {
      reject(error?.message || error)
    }
  })
};

function getAllFilePaths(dirPath) {
  const files = fs2.readdirSync(dirPath);
  const filePaths = [];
  for (const file of files) {
    const filePath = `${dirPath}/${file}`;
    if (fs2.statSync(filePath).isDirectory()) {
      filePaths.push(...getAllFilePaths(filePath));
    } else {
      filePaths.push(filePath);
    }
  }
  return filePaths;
}

const compileSCSS = (filePath) => {
  return new Promise(async (resolve, reject) => {
    const lanRoot = filePath.split("\\dist\\")[0];
    const outputFilePath = path.join(
      `${lanRoot}\\dist\\css`,
      path.basename(filePath).replace(".scss", ".css")
    );
    try {
      const result = await sass.compileAsync(filePath, { style: 'compressed' });
      await fs.writeFile(outputFilePath, result.css);
      resolve();
    } catch (writeError) {
      reject(writeError?.message || writeError);
    }

  });
};

const compressJS = async (filePath) => {
  try {
    const lanRoot = filePath.split("\\dist\\")[0];
    const fileContent = await fs.readFile(filePath, "utf-8");
    // let es5Content = await babel.transform(fileContent);
    // const minified = await minify(es5Content.code);
    const minified = await minify(fileContent);
    let originalFileName = null;
    originalFileName = path.basename(filePath, path.extname(filePath));
    originalFileName = `${originalFileName}.js`;
    await fs.writeFile(
      path.join(`${lanRoot}\\dist\\js`, originalFileName),
      minified.code
    );
  } catch (error) {
    throw new Error(error?.message || error)
  }
};

async function asyncEs6Json(pp = "") {
  delete require.cache[require.resolve(`${pp}/index.js`)];
  let jsonData = require(`${pp}/index.js`);
  await fs.writeFile(
    path.join(`./`, `${pp}/es6.js`),
    `var jsonData = ${JSON.stringify(
      jsonData,
      null,
      2
    )}; export default jsonData`
  );
  await fs.writeFile(
    path.join(`./`, `${pp}/normal.js`),
    `var jsonData = ${JSON.stringify(jsonData, null, 2)}`
  );
}

async function compileCode({
  langs = [],
  curP = ""
}) {
  try {
    for (let i = 0; i < langs.length; i++) {
      const lan = langs[i];
      let p = curP;
      p = p.replaceAll("\\", "/")
      const ejsSourceDir = `/${lan}/ejs`;
      const jsSourceDir = `/${lan}/dist/Dev/js`;
      const scssSourceDir = `/${lan}/dist/Dev/scss`;
      const getAllEjs = async () => {
        const ress = getAllFilePaths(`${p}${ejsSourceDir}`)
        for (let i = 0; i < ress.length; i++) {
          let p = ress[i];
          p = p.replace(/\//g, "\\");
          await compressAndObfuscate(p, lan);
        }
      }
      const getAllJS = async () => {
        const ress = getAllFilePaths(`${p}${jsSourceDir}`)
        for (let i = 0; i < ress.length; i++) {
          let p = ress[i];
          p = p.replace(/\//g, "\\");
          await compressJS(p, lan);
        }
      }
      const getAllSCSS = async () => {
        const ress = getAllFilePaths(`${p}${scssSourceDir}`)
        for (let i = 0; i < ress.length; i++) {
          let p = ress[i];
          p = p.replace(/\//g, "\\");
          await compileSCSS(p, lan);
        }
      }
      await asyncEs6Json(`${p}/${lan}/dist/lan`.replace(/\//g, "\\"));
      await getAllEjs()
      await getAllJS()
      await getAllSCSS()
    }
    return '全部编译成功'
  } catch (error) {
    return error;
  }
}

module.exports = compileCode;