const execSync = require("child_process").execSync;
const { gitRemoteHead } = require("./rawInput");

function runCommand(command) {
  return execSync(command, { encoding: "utf-8" });
}

function pushAllRemote() {
  runCommand("git push --all --force");
}

function deleteAllRemoteBranches() {
  runCommand(`git checkout master`);
  runCommand(`git fetch -a`);
  runCommand(
    `git branch -r | awk -F/ '/\\//{print $2}' | grep -v 'master' |  xargs git push origin --delete`
  );
}

function init() {
  deleteAllRemoteBranches();
  runCommand("rm -rf .git");
  runCommand("git init");
  runCommand("git add .");
  runCommand("git commit -m 'Add generation script and README'");
  runCommand(`git remote add origin ${gitRemoteHead}`);
  deleteAllRemoteBranches();
}

function createAndCheckoutBranch(branch) {
  runCommand(`git checkout -b ${branch}`);
  runCommand(`git checkout -`);
}

function createCommitInBranch(node) {
  const branch = node.lineName;
  const commitMesssage = node.stationName;
  const specialComment = node.imoji;

  runCommand(`git checkout ${branch}`);
  runCommand(`git commit --allow-empty -m '${commitMesssage}'`);
  if (specialComment) {
    // imojis
    runCommand(`git branch ${specialComment}`);
  }
  runCommand(`git checkout -`);
}

function startFromBranch(branch) {
  runCommand(`git checkout ${branch}`);
}

function mergeAllTo(lines, node) {
  const collisionLine = node.lineName;
  const collisionStation = node.stationName;
  const comments = node.imoji;

  runCommand(`git checkout ${collisionLine}`);

  const joinedBranches = lines.join(" ");

  runCommand(`git merge ${joinedBranches} -m '${collisionStation}'`);

  for (line of lines) {
    runCommand(`git branch -D ${line}`);
    runCommand(`git branch ${line}`);
  }

  if (comments) {
    runCommand(`git branch ${comments}`);
  }

  /*
  const collisionStationBranchName = [...lines, collisionLine, collisionStation]
    .join('-')
    .split(' ')
    .join('')
    .split('.')
    .join('');
  runCommand(`git branch ${collisionStationBranchName}`);
  */
}

module.exports = {
  runCommand,
  init,
  pushAllRemote,
  startFromBranch,
  createAndCheckoutBranch,
  createCommitInBranch,
  mergeAllTo,
};
