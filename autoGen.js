const { allLines } = require("./src/rawInput");
const git = require("./src/git");
const { traverse } = require("./src/graph");
const { Node } = require("./src/Node");

// which lines are connected to this station
/*
{
  "A": ["U2","U3"],
  "B": ["U1","U2"],
}
*/

let stationToLines = {};

// which stations are connected to this station
/*
{
  "A": [Node("B", trainLine)],
  "A": [Node("B", trainLine)],
  "A": [Node("B", trainLine)],
}
*/
let adj = {};

function preProcess(trainlines) {
  function addNewLineToStation(line, station) {
    if (!stationToLines[station]) {
      stationToLines[station] = [];
    }
    stationToLines[station].push(line);
  }

  function addNewAdjStationToStation(fromStation, toStation) {
    if (!adj[fromStation.stationName]) {
      adj[fromStation.stationName] = [];
    }
    adj[fromStation.stationName].push(toStation);
  }

  // making edges
  //
  Object.values(trainlines).forEach((trainline) => {
    const { name } = trainline;

    let prevNode = null;
    trainline.stations.forEach((station) => {
      addNewLineToStation(name, station.name);
      let currentNode = new Node(station.name, name, station.imoji);
      if (prevNode) {
        addNewAdjStationToStation(prevNode, currentNode);
      }
      prevNode = currentNode;
    });
  });
}

preProcess(allLines);

git.init();
traverse(
  stationToLines,
  adj,
  Object.values(allLines).map(
    (line) => new Node(line.stations[0].name, line.name, line.stations[0].imoji)
  )
);
git.pushAllRemote();

console.log(`\x1b[32mGit Network generated Successfully!!\x1b[0m`);
