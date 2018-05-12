const fs = require('fs');
const { mongoose } = require('./db/mongoose');
const { Station } = require('./models/station');

var counter = 0
var linesList = ['M1', 'M2', 'M3', 'M3b', 'M4', 'M5', 'M6', 'M7', 'M7b', 'M8', 'M9', 'M10', 'M11', 'M12', 'M13', 'M14'];
let upserts = []

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('connected', function(){
  var upsertStation = (updatedStationName, updateQuery) => {
    upserts.push({updatedStationName, updateQuery})
  };
  
  linesList.forEach((line) => {
    var data = fs.readFileSync('./stations/' + line + '.txt').toString();
    var dataSplit = data.split('\n');
    var previousStationName = null;
    var unidirection = false;
    dataSplit = dataSplit.filter((stationName) => (stationName));
    dataSplit.forEach(function(rowContent) {
      if(rowContent.includes('### Unidirection branch')) {
        previousStationName = rowContent.split("### Unidirection branch - linked to ").pop().replace("\r", "");
        unidirection = true;
        return;
      }
      else if(rowContent.includes('### End unidirection branch')) {
        var nextStationName = rowContent.split("### End unidirection branch - linked to ").pop().replace("\r", "");
        unidirection = false;
        var nextStation = { name: nextStationName, line: line };
        upsertStation(previousStationName, { $addToSet: { linkedTo: nextStation } });
        previousStationsName = null;
        return;
      }
      else if(rowContent.includes('### Side branch')) {
        previousStationName = rowContent.split("### Side branch - linked to ").pop().replace("\r", "");
        return;
      }
      else if(rowContent.includes('### End side branch')) {
        previousStationName = null;
        return;
      }
      var currentStationName = rowContent.trim();
      var addToSet = { lines: line };
      if(previousStationName  && !unidirection) {
        addToSet.linkedTo = { name: previousStationName, line: line };
      }
      upsertStation(currentStationName, { $addToSet: addToSet });
      if(previousStationName) {
          var currentStation = { name: currentStationName, line: line };
          upsertStation(previousStationName, { $addToSet: { linkedTo: currentStation } });
      }
      previousStationName = currentStationName;
    });
  });
  
  const completeUpserts = async function() {
    await Station.remove({});
    for (let upsert of upserts) {
      await Station.findOneAndUpdate({ name: upsert.updatedStationName }, upsert.updateQuery, { upsert: true })
      counter++
      console.log(counter + '/' + upserts.length)
    }
    db.close()
    process.exit()
  }
  
  completeUpserts()
});
