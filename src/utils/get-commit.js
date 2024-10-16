const { exec } = require('child_process');
const path = require("path");
const fs = require('fs');

const hasArr = [
  "/Dev/",
  "/img/",
  "/lan/",
  "/ejs/",
  "/patiles/"
]

const noHasArr = [
  "lan/es6.js",
  "lan/normal.js",
  "/vite/"
]

// 获取暂存区的文件  
function getStagedFiles(folderPath) {
  return new Promise((resolve, reject) => {
    const gitCommand = `git -C ${folderPath} diff --name-only --cached`;
    exec(gitCommand, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }

      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }

      const stagedFiles = stdout.trim().split('\n').filter(Boolean);
      resolve(stagedFiles);
    });
  });
}

// 获取最新一次 commit 的文件  
function getLatestCommitFiles(folderPath) {
  return new Promise((resolve, reject) => {
    const gitCommand = `git -C ${folderPath} show --name-only --pretty="" HEAD`;
    exec(gitCommand, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }
      const commitFiles = stdout.trim().split('\n').filter(Boolean);
      resolve(commitFiles);
    });
  });
}

// 获取指定 commitId 的文件
function getCommitFilesByCommitId(folderPath, commitId, datas) {
  const { initLan, AsyncLan } = datas;
  return new Promise((resolve, reject) => {
    const gitCommand = `git -C ${folderPath} show --name-only --pretty="" ${commitId}`;
    exec(gitCommand, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }
      let files = stdout.trim().split('\n').filter(Boolean);
      files = files.filter(item => item.startsWith(`${initLan}/`) && noHasArr.every(item2 => !item.includes(item2)) && hasArr.some(item2 => item.includes(item2))).filter(Boolean);
      const obj = {};
      for (let i = 0; i < AsyncLan.length; i++) {
        const aLan = AsyncLan[i];
        if (!obj[aLan]) obj[aLan] = {};
        for (let j = 0; j < files.length; j++) {
          const f = files[j];
          const initP = `${folderPath}\\${f.replaceAll("/", "\\")}`;
          if (!fs.existsSync(initP)) {
            continue;
          }
          const cF = f.replace(initLan + '/', aLan + '/')
          const cP = `${folderPath}\\${cF.replaceAll("/", "\\")}`;
          const status = fs.existsSync(cP);
          const p = path.dirname(cP);
          let name = path.basename(f)
          const destinationPath = path.join(p, name);
          if (!status) {
            if (f.includes("/ejs/")) {
              const p = path.dirname(cP);
              let name = path.basename(f)
              name = name.replace(".ejs", ".html")
              const r = findFilesWithFaceSwap(p, name);
              if (r?.length) {
                obj[aLan][f] = path.dirname(cF) + "/" + r[0];
              } else {
                obj[aLan][f] = path.dirname(cF) + "/" + "unknown";
              }
            } else {
              obj[aLan][f] = cF;
            }
          } else {
            obj[aLan][f] = cF;
          }
          if (f.includes("/img/")) {
            fs.copyFileSync(`${folderPath}\\${f.replaceAll("/", "\\")}`, destinationPath);
          }
        }
      }
      resolve({
        init: files,
        obj
      })
    });
  });
}

function findFilesWithFaceSwap(folderPath, val) {
  const linkRelAlternateRegex = /<link\s+rel="alternate".*?href="([^"]*)".*?>/gi;
  const files = fs.readdirSync(folderPath);
  const ejsFiles = files.filter(file => file.endsWith('.ejs'));
  const foundFiles = [];
  ejsFiles.forEach(file => {
    const filePath = path.join(folderPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    let match;
    let found = false;
    while ((match = linkRelAlternateRegex.exec(content)) !== null) {
      const hrefValue = match[1]
      if (hrefValue.includes(val)) {
        found = true;
        break;
      }
    }
    if (found) {
      foundFiles.push(file);
    }
  });
  return foundFiles;
}

// 综合逻辑：优先获取暂存区文件，如果没有则获取最新 commit 文件
function getFiles(folderPath, datas) {
  const { initLan, AsyncLan } = datas;
  return new Promise(async (resolve, reject) => {
    try {
      let files = await getStagedFiles(folderPath);
      if (files.length === 0) {
        // 暂存区没有文件，获取最新一次 commit 的文件
        files = await getLatestCommitFiles(folderPath);
      }
      files = files.filter(item => item.startsWith(`${initLan}/`) && noHasArr.every(item2 => !item.includes(item2)) && hasArr.some(item2 => item.includes(item2))).filter(Boolean);
      const obj = {};
      for (let i = 0; i < AsyncLan.length; i++) {
        const aLan = AsyncLan[i];
        if (!obj[aLan]) obj[aLan] = {};
        for (let j = 0; j < files.length; j++) {
          const f = files[j];
          const initP = `${folderPath}\\${f.replaceAll("/", "\\")}`;
          if (!fs.existsSync(initP)) {
            continue;
          }
          const cF = f.replace(initLan + '/', aLan + '/')
          const cP = `${folderPath}\\${cF.replaceAll("/", "\\")}`;
          const status = fs.existsSync(cP);
          const p = path.dirname(cP);
          let name = path.basename(f)
          const destinationPath = path.join(p, name);
          if (!status) {
            if (f.includes("/ejs/")) {
              const p = path.dirname(cP);
              let name = path.basename(f)
              name = name.replace(".ejs", ".html")
              const r = findFilesWithFaceSwap(p, name);
              if (r?.length) {
                obj[aLan][f] = path.dirname(cF) + "/" + r[0];
              } else {
                obj[aLan][f] = path.dirname(cF) + "/" + "unknown";
              }
            } else {
              obj[aLan][f] = cF;
            }
          } else {
            obj[aLan][f] = cF;
          }
          if (f.includes("/img/")) {
            fs.copyFileSync(`${folderPath}\\${f.replaceAll("/", "\\")}`, destinationPath);
          }
        }
      }
      resolve({
        init: files,
        obj
      })
    } catch (error) {
      reject(error);
    }
  });
}

function getSubdirectories(directory) {
  try {
    const items = fs.readdirSync(directory, { withFileTypes: true });
    const directories = items
      .filter(item => item.isDirectory())
      .map(item => item.name);
    return directories;
  } catch (err) {
    console.error('Error reading directory:', err);
    return [];
  }
}

module.exports = {
  getFiles,
  getCommitFilesByCommitId,
  getSubdirectories
};