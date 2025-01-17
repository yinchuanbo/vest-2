const { exec } = require("child_process");

async function pullCode({ curP }) {
  function executeGitCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: curP }, (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      });
    });
  }
  async function checkGitStatus() {
    const { stdout: status } = await executeGitCommand(
      "git status --porcelain"
    );
    console.log("status", status);
    if (status) {
      throw new Error("工作目录不干净，有未提交的更改");
    }
  }
  async function gitPullRebase() {
    try {
      const { stdout, stderr } = await executeGitCommand("git pull --rebase");
      if (stderr.includes("CONFLICT") || stdout.includes("CONFLICT")) {
        throw new Error("执行 git pull --rebase 时发生冲突");
      }
    } catch (error) {
      if (error.message.includes("冲突")) {
        throw error;
      }
      if (
        error.message.includes(
          "There is no tracking information for the current branch"
        )
      ) {
        console.warn("没有跟踪分支，跳过 git pull 操作，继续执行下一步。");
        return;
      }
      try {
        const { stdout, stderr } = await executeGitCommand("git pull");
        if (stderr) {
          if (
            stderr.includes(
              "There is no tracking information for the current branch"
            )
          ) {
            console.warn("没有跟踪分支，跳过 git pull 操作，继续执行下一步。");
            return;
          }
          throw new Error(`git pull 失败: ${stderr}`);
        }
        console.log("git pull 成功");
      } catch (pullError) {
        throw new Error(
          `git pull 和 git pull --rebase 都失败: ${pullError.message}`
        );
      }
    }
  }

  try {
    await checkGitStatus();
    await gitPullRebase();
    return Promise.resolve("代码成功拉取并rebase");
  } catch (error) {
    return Promise.reject(error.message);
  }
}

async function pushCode({
  curP,
  commit = "提交",
  status: resStatus = false,
  type,
}) {

  function executeGitCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: curP }, (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      });
    });
  }

  try {
    if (!resStatus) {
      await executeGitCommand("git add .");
      const { stdout: commitResult } = await executeGitCommand(
        `git commit -m "${commit}"`
      );
      if (type === "commit") {
        return Promise.resolve(commitResult || "commit 提交成功");
      }
    } else {
      // 无文件修改
      if (type === "commit") {
        return Promise.resolve("无修改可用来 commit");
      }
    }

    await pullCode({ curP });
    console.log("成功拉取并rebase最新代码");

    // 检查并设置上游分支
    const { stdout: currentBranch } = await executeGitCommand(
      "git rev-parse --abbrev-ref HEAD"
    );
    try {
      await executeGitCommand(
        `git push --set-upstream origin ${currentBranch}`
      );
      console.log(`已设置上游分支为 origin/${currentBranch}`);
    } catch (error) {
      if (error.message.includes("fatal: The current branch")) {
        console.warn("无法自动设置上游分支, 请手动设置后再次推送");
        return Promise.reject(`推送失败: ${error.message}`);
      }
      throw error;
    }

    // 检查是否有未推送的 commit 需要推送到远程，没有就报错提示
    // const { stdout: unpushedCommits } = await executeGitCommand("git log @{u}..HEAD");
    // if (!unpushedCommits.trim()) {
    //   throw new Error("没有需要推送的提交");
    // }

    const { stdout: pushResult } = await executeGitCommand("git push");
    console.log("推送结果:", pushResult);
    return Promise.resolve(pushResult || "代码成功推送到远程仓库");
  } catch (error) {
    console.log("error", error);
    return Promise.reject(`推送失败: ${error.message}`);
  }
}
module.exports = pushCode;
