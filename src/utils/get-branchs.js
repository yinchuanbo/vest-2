const { exec } = require("child_process");

async function getBranchs({ curP }) {
  return new Promise((resolve, reject) => {
    exec(`git -C ${curP} branch -a`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      const remoteBranches = stdout.trim().split("\n").map((branch) => branch.trim().replace("origin/HEAD -> ", "").replace("* ", ""));
      resolve(remoteBranches);
    });
  });
}

module.exports = getBranchs;