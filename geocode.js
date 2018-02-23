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
	var directionInfo = bearing(endpoint, startpoint);

	fields.title = address;
	fields.value = "Direction: " + directionInfo.degrees + " degrees clockwise from the North (" + directionInfo.bearingName + ")";

	attachment.fields = [fields];
	resp.attachments.push(attachment);
	resp.response_type = "in_channel";
	
	//console.log(JSON.stringify(resp));
	return JSON.stringify(resp);
}

var bearing = function(endpoint, startpoint) {
    var x1 = endpoint.lat,
    y1 = endpoint.lng,
    x2 = startpoint.lat,
    y2 = startpoint.lng;

    var radians = Math.atan2((y1 - y2), (x1 - x2));

    var compassReading = radians * (180 / Math.PI);

    var coordNames = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
    var coordIndex = Math.round(compassReading / 22.5);
    if (coordIndex < 0) {
        coordIndex = coordIndex + 16
    };

    return {
		bearingName: coordNames[coordIndex],
		degrees: compassReading,
	};
};

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