var request = require('request');
var slackAPI = require('./slackAPI');
var json = require('JSON');

const localSlackUri = 'https://hooks.slack.com/services/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';

var direction = async function(req, res) {
		var calculateDirectionTo = req.body.text;
		
		var apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + calculateDirectionTo + '&key=AIzaSyAX6qyCU78wobOyzxfzMp0Ixiop8_JiFqY'
		
		var slackUrl = req.body.response_url || localSlackUri;

		await slackAPI.getAndFormatResp(apiUrl, slackUrl, formatDirectionResult, req);
};

var formatDirectionResult = function(apiResponse) {
	const startpoint = {
		lat : 40.7585573,
		lng : -73.9703427
	};
	
	var resp = {};
			
	resp.attachments = [];
	var attachment = {
		fallback: "Slack Default"
	};
	var fields = {};

	var directions = JSON.parse(apiResponse);
	
	if (directions.results.length == 0) {
		throw("No address found");
	}

	var endpoint = directions['results'][0]['geometry']['location'];
	var address = directions['results'][0]['formatted_address'];
	var bearing = Bearing(endpoint, startpoint);

	fields.title = address;
	fields.value = "Direction: " + cardinalDirection(bearing) + "\r\nBearing:  " + formatDegrees(bearing);

	attachment.fields = [fields];
	resp.attachments.push(attachment);
	resp.response_type = "in_channel";
	
	//console.log(JSON.stringify(resp));
	return JSON.stringify(resp);
}

var Bearing = function(endpoint, startpoint) {
    var x1 = endpoint.lat,
    y1 = endpoint.lng,
    x2 = startpoint.lat,
    y2 = startpoint.lng;

    var radians = Math.atan2((y1 - y2), (x1 - x2));

    var compassReading = (radians * (180 / Math.PI) + 360) % 360;

    return compassReading;
};

var cardinalDirection = function(bearing) {
	//const coordNames = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
	const coordNames = [
		"North",
		"North-Northeast",
		"Northeast",
		"East-Northeast",
		"East",
		"East-Southeast",
		"Southeast",
		"South-Southeast",
		"South",
		"South-Southwest",
		"Southwest",
		"West-Southwest",
		"West",
		"West-Northwest",
		"Northwest",
		"North-Northwest",
		"North"
	];

	var idx = Math.round(bearing / 22.5);
	idx = (idx + 16) % 16;

	return coordNames[idx];
}

var formatDegrees = function(bearing) {
	var degrees = Math.floor(bearing),
		minutes = Math.floor(60 * (bearing - degrees)),
		seconds = 3600 * (bearing - degrees) - 60 * minutes;

	return degrees.toString() + "° " + minutes + "′ " + seconds.toFixed(3) + "″";
}

var distance = async function(req, res) {
		var calculateCityDistance = req.body.text;
		var apiUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=601%Lexington%ave%NYC%NY&destinations='+ calculateCityDistance +'&key=AIzaSyCehJJ3gQeMG1N_CIl9vkCwHQN3RMEZnXo'

		var slackUrl = req.body.response_url || localSlackUri

		await slackAPI.getAndFormatResp(apiUrl, slackUrl, formatDistanceResult, req);
};

var formatDistanceResult = function(apiResponse) {
	var resp = {};
			
	resp.attachments = [];
	var attachment = {
		fallback: "Slack Default"
	};
	var fields = {};

	var distance = JSON.parse(apiResponse);

	if (distance.rows.length == 0) {
		throw("No address found");
	}
	var destination = distance.destination_addresses[0];
	fields.title = destination;
	fields.value = "Distance: " + distance['rows'][0]['elements'][0]['distance']['text'];;

	attachment.fields = [fields];
	resp.attachments.push(attachment);
	resp.response_type = "in_channel";
	
	//console.log(JSON.stringify(resp));
	return JSON.stringify(resp);
}


module.exports = {
	direction: direction,
	distance: distance,
};