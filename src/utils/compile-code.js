const fs = require('fs');

async function compileCode({
  curP = '',
  langs = []
}) {
  const allP = `${curP}\\compile-code.js`
  if (!fs.existsSync(allP)) {
    return "项目更目录下缺少 compile-code.js";
  }
  const compileCode = require(allP)
  await compileCode({ curP, langs })
}

module.exports = compileCode;