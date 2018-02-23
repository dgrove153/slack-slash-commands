var reqSync = require('request');
var request = require('request-promise');

const proxy = "http://proxy.blackstone.com:8080"

var postToSlack = function (slackUrl, useProxy, payLoad) {
	var webhook = slackUrl;
	var headers = { "Content-type": "application/json" };
	var options = {
		uri: webhook,
		form: { payload: payLoad },
		headers: headers
    };
	
	if(useProxy) {
		options.proxy = proxy;
	};
	
	console.log(payLoad);
	
	reqSync.post(options, function(err, res){
		if(err) {
            console.log(err)
        }
		if(res) {
            console.log(res.body)
        }
	});
};

var getAndFormatResp = async function(apiUrl, slackUrl, formatMethod, req) {
	var useProxy = req.headers.host.indexOf("localhost") > -1;
	
	var options = {
		uri: apiUrl
	};
	
	if(useProxy) {
		options.proxy = proxy;
	};
	
	var slackPayload = {"text":"Keeping slack response alive...", "response_type":"ephemeral"};
	slackPayload = JSON.stringify(slackPayload);
	
	console.log("Proxy:", options.proxy);

	try {
		var apiResp = await request(options);
		var formatted = formatMethod(apiResp);
		console.log(formatted);
		postToSlack(slackUrl, useProxy, formatted);
	} catch (err) {
		var error = {"text":"Incorrect input or issue with the API, please try again. If this keeps happening, contact your system administrator", "response_type":"ephemeral"};
		error = JSON.stringify(error);
		postToSlack(slackUrl, useProxy, error);
		console.log(err);
	};
};

module.exports = {
	postToSlack: postToSlack,
	getAndFormatResp: getAndFormatResp,
};