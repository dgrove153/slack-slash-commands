var reqSync = require('request');
var request = require('request-promise');

const proxy = "http://cs41cb06pxy03.blackstone.com:8080"

var useProxy = function(req) {
	return req.headers.host.indexOf("localhost") > -1;
}

var postToSlack = function (slackUrl, payLoad) {
	var webhook = slackUrl;
	var headers = { "Content-type": "application/json" };
	var options = {
		uri: webhook,
		form: { payload: JSON.stringify(payLoad) },
		headers: headers
    };
	
	if(useProxy()) {
		options.proxy = proxy;
	};
	
	if(!payLoad.filter) {
		reqSync.post(options, function(err, res){
			if(err) {
				console.log(err)
			}
			if(res) {
				console.log(res.body)
			}
		});
		
		return true;
	} else {
		return false;
	};
};

var getAndFormatResp = async function(apiUrl, slackUrl, formatMethod, req, res, filter) {
	var options = {
		uri: apiUrl
	};
	
	if(useProxy()) {
		options.proxy = proxy;
	};
	
	var slackPayload = {"text":"Keeping slack response alive...", "response_type":"ephemeral"};
	slackPayload = JSON.stringify(slackPayload);

	try {
		var apiResp = await request(options);
		var formatted = formatMethod(apiResp, filter, req.body);
		return postToSlack(slackUrl, formatted);
	} catch (err) {
		var error = "Incorrect input or issue with the API, please try again. If this keeps happening, contact your system administrator";
		return sendError(slackUrl, error, true);
	};
};

var sendError = function(slackUrl, errorMessage, isEphemeral) {
	var error = {"text": errorMessage};
	error.response_type = isEphemeral ? "ephemeral" : "in_channel";
	error = JSON.stringify(error);
	console.log(err);
	return postToSlack(slackUrl, error);
}

module.exports = {
	postToSlack: postToSlack,
	getAndFormatResp: getAndFormatResp,
	sendError: sendError
};