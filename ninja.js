var http = require('http'),
  util = require('util'),
  https = require('https');

if (process.argv.length < 3) {
  console.log("Usage: node ninja.js <cftfKey> <ninjaKey> <deviceId>");
  process.exit(1);
}

var appKey = process.argv[2],
  ninjaKey = process.argv[3],
  deviceId = process.argv[4],
  YELLOW = 'FFFF00',
  GREEN = '00FF00',
  RED = 'FF0000';


/**
 * Requests current truck-stop data from Chicago Food Truck Finder and invokes the callback with the results.
 */
function requestFoodTruckData(callback) {
  var path = '/services/daily_schedule?appKey=' + appKey;
  var req = http.request({hostname : 'www.chicagofoodtruckfinder.com', path: path}, function(res) {
    var responseData = '';
    res.on('data', function(chunk) {
      responseData += chunk;
    });
    res.on('end', function() {
      callback(JSON.parse(responseData));
    });
  });
  req.on("error", function(e) {
    console.log("Problem contacting food truck finder: " + e.message);
  });
  req.end();
}

/**
 * Sets the color on the ninja block eyes.
 */
function setColor(color) {
  var req = https.request({hostname : 'api.ninja.is', method: 'PUT', path: '/rest/v0/device/'+ deviceId + '?user_access_token=' + ninjaKey}, function(res) {

  });

  var body = {
    "DA" : color
  };
  req.on("error", function(e) {
    console.log("Problem contacting Ninja API: " + e.message);
  });

  req.write(JSON.stringify(body));
  req.end();
}

function findOpenNow(truckList) {
  var count =0, now = new Date().getTime();
  truckList["stops"].forEach(function(item) {
    if (now < item["endMillis"] && now >= item["startMillis"]) {
      count++;
    }
  });
  return count;
}

// Call food truck finder for stops, then set the color accordingly.
requestFoodTruckData(function(truckList) {
  var numberOfTrucksOpenNow = findOpenNow(truckList);
  if (numberOfTrucksOpenNow == 0) {
    console.log("No trucks on the road, setting color to red");
    setColor(RED);
  } else if (numberOfTrucksOpenNow < 3) {
    console.log("Only a few trucks on the road, setting color to yellow");
    setColor(YELLOW);
  } else {
    console.log(numberOfTrucksOpenNow + " trucks on the road, setting color to green");
    setColor(GREEN);
  }
});
