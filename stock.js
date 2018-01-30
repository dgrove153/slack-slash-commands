var request = require('request-promise');
var json = require('JSON');

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

var stockAsync = async function(req, res) {
	var stockReq = req.body.text;
	var apiUrl = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=' + stockReq + '&interval=1min&apikey=VVCZ3DAK6MZGR2XW'
	
	await getAndFormatResp(apiUrl, formatStockResults, req, res);
};

var cryptoAsync = async function(req, res) {
	var cryptoReq = req.body.text;
	var apiUrl = 'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_INTRADAY&symbol=' + cryptoReq + '&market=USD&apikey=VVCZ3DAK6MZGR2XW'
	
	await getAndFormatResp(apiUrl, formatCryptoResults, req, res);
};

var getAndFormatResp = async function(apiUrl, formatMethod, req, res) {
	var options = {
		uri: apiUrl
	};
	
	if(req.headers.host.indexOf("localhost") > -1) {
		options.proxy = "http://cs41cb06pxy03.blackstone.com:8080";
	};
	
	res.setHeader("Content-type", "application/json");
	res.write("{\"text\": \"Starting...\"}");
	
	try {
		var task = request(options);
		await snooze(1000);
		res.write("{\"text\": \"Still going...\"}");
		await snooze(1000);
		res.write("{\"text\": \"Still going...\"}");
		var apiResp = await task;
		var formatted = formatMethod(apiResp);
		res.write(formatted);
		res.end();
	} catch (err) {
		res.write("{'text': 'Incorrect input or issue with the API, please try again. If this keeps happening, contact your system administrator'}");
		res.end();
		console.log(err);
	};
};

function formatDate(date, offSetHours) {
	var hours = date.getHours() - offSetHours;
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
};

var formatStockResults = function(apiResp) {
	var stock = JSON.parse(apiResp);
	var prices = stock['Time Series (1min)'];
	var index = [];

	var today = new Date().getDate();

	// build the index
	for (var x in prices) {
		var date = new Date(x).toLocaleString();
		var today = new Date(Date.now()).toLocaleString();
		if(date.substring(0,9) === today.substring(0, 9)) {
			index.push(x);
		};
	};

	// sort the index
	index.sort(function (a, b) {    
	   return a == b ? 0 : (a > b ? 1 : -1); 
	}); 

	var resp = {};
	resp.time = index[index.length-1];
	var latest = prices[resp.time];
	var earliest = prices[index[0]];
	var open = earliest['1. open'];
	var close = latest['4. close'];
	resp.symbol = stock['Meta Data']['2. Symbol'].toUpperCase();
	resp.current = close;
	resp.change = (close - open).toFixed(2);
	resp.changePercent = (((close - open) / open)*100).toFixed(2);

	var formattedDate = formatDate(new Date(resp.time), 0);

	var text  = "\"attachments\": [ {\"fallback\" : \"Slack Default\""; 
	if(resp.changePercent < 0) {
		text += ", \"color\": \"#f41f1f\", \"fields\":[ { \"title\":\"" + resp.symbol + " - Last Price: $" + resp.current + " | " + resp.change + " | " + resp.changePercent + "%\", \"value\":\"Last Updated: " + formattedDate + "\" } ]"
	} else {
		text += ", \"color\": \"#78f41f\", \"fields\":[ { \"title\":\"" + resp.symbol + " - Last Price: $" + resp.current + " | +" + resp.change + " | " + resp.changePercent + "%\", \"value\":\"Last Updated: " + formattedDate + "\" } ]"
	}

	text += "} ]";

	return "{ \"response_type\": \"in_channel\"," + text + " }";
}

var formatCryptoResults = function(apiResp) {
	var stock = JSON.parse(apiResp);
	var prices = stock['Time Series (Digital Currency Intraday)'];
	var index = [];

	var today = new Date().getDate();

	// build the index
	for (var x in prices) {
		var date = new Date(x).toLocaleString();
		var today = new Date(Date.now()).toLocaleString();
		if(date.substring(0,9) === today.substring(0, 9)) {
			index.push(x);
		};
	};

	// sort the index
	index.sort(function (a, b) {    
	   return a == b ? 0 : (a > b ? 1 : -1); 
	}); 

	var resp = {};
	resp.time = index[index.length-1];
	var latest = prices[resp.time];
	var earliest = prices[index[0]];
	var open = earliest['1b. price (USD)'];
	var close = latest['1b. price (USD)'];
	resp.symbol = stock['Meta Data']['2. Digital Currency Code'].toUpperCase();
	resp.name = stock['Meta Data']['3. Digital Currency Name'];
	resp.current = parseFloat(close).toFixed(2);
	resp.change = (close - open).toFixed(2);
	resp.changePercent = (((close - open) / open)*100).toFixed(2);

	var formattedDate = formatDate(new Date(resp.time), 5);

	var text  = "\"attachments\": [ {\"fallback\" : \"Slack Default\""; 
	if(resp.changePercent < 0) {
		text += ", \"color\": \"#f41f1f\", \"fields\":[ { \"title\":\"" + resp.name + " (" + resp.symbol + ") to USD\", \"value\":\"Last Price: $" + resp.current + " | +" + resp.change + " | " + resp.changePercent + "%";
		text += "\n Last Updated: " + formattedDate;
		text += "\" } ]";
	} else {
		text += ", \"color\": \"#78f41f\", \"fields\":[ { \"title\":\"" + resp.name + " (" + resp.symbol + ") to USD\", \"value\":\"Last Price: $" + resp.current + " | +" + resp.change + " | " + resp.changePercent + "%";
		text += "\n Last Updated: " + formattedDate;
		text += "\" } ]";
	};

	text += "} ]";

	return "{ \"response_type\": \"in_channel\"," + text + " }";
};

module.exports = {
	stock: stockAsync,
	crypto: cryptoAsync
};


