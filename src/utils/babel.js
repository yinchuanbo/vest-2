const babel = require("@babel/core");
const { minify } = require("terser");

async function compileAndMinify(code) {
  try {
    const result = babel.transformSync(code, {
      presets: ["@babel/preset-env"]
    });
    const minified = await minify(result.code);
    if (minified.error) {
      return minified.error;
    }
    return minified.code;
  } catch (error) {
    return error.message;;
  }
}


module.exports = compileAndMinify;