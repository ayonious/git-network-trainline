const git = require("./git");

// so far visited
let stationVisitedByLines = {};

function visitStatus(stationToLines, stationName) {
  const stationVisitedByCntLines =
    (stationVisitedByLines[stationName] &&
      stationVisitedByLines[stationName].length) ||
    0;

  // case1: already visited => then dont visit
  if (stationVisitedByCntLines === stationToLines[stationName].length) {
    return "AlreadyVisited";
  }

  // case2: you cant visit it just now because it should be visited a little later
  if (stationVisitedByCntLines === stationToLines[stationName].length - 1) {
    return "VisitNow";
  }

  // case3: You can visit is now. Merge all other lines into this
  if (stationVisitedByCntLines < stationToLines[stationName].length - 1) {
    return "VisitLater";
  }
}

function getJunctionStatus(stationName) {
  const isJunction =
    stationVisitedByLines[stationName] &&
    stationVisitedByLines[stationName].length > 0;

  const lines = stationVisitedByLines[stationName];
  return {
    isJunction,
    lines,
  };
}

function traverse(stationToLines, adj, stack) {
  function visitNode(node) {
    if (!stationVisitedByLines[node.stationName]) {
      stationVisitedByLines[node.stationName] = [];
    }
    stationVisitedByLines[node.stationName].push(node.lineName);
    stack.push(node);
  }

  function waitOnNode(node) {
    if (!stationVisitedByLines[node.stationName]) {
      stationVisitedByLines[node.stationName] = [];
    }
    stationVisitedByLines[node.stationName].push(node.lineName);
  }

  stack.forEach((node) => {
    stationVisitedByLines[node.stationName] = [node.lineName];
    git.createAndCheckoutBranch(node.lineName);
    git.createCommitInBranch(node);
  });

  while (stack.length) {
    let current = stack.pop();

    adj[current.stationName] &&
      adj[current.stationName].length &&
      adj[current.stationName].forEach((station) => {
        const visitSts = visitStatus(stationToLines, station.stationName);
        const junctionStatus = getJunctionStatus(station.stationName);

        if (visitSts === "AlreadyVisited") {
          console.log("Should never happen", station);
        } else if (visitSts === "VisitLater") {
          // console.log('VisitLater', station);
          waitOnNode(station);
        } else if (visitSts === "VisitNow") {
          // console.log('VisitNow', station);
          // console.log('current stack', stack);

          if (junctionStatus.isJunction) {
            git.mergeAllTo(junctionStatus.lines, station);
          } else {
            git.createCommitInBranch(station);
          }
          visitNode(station);
        } else {
          console.log("else Should never happen", station);
        }
      });
  }
}

module.exports = {
  traverse,
};
