var json = require('JSON');
var slackAPI = require('./slackAPI');
var xml = require('xml-parser');

const proxy = "http://cs41cb06pxy03.blackstone.com:8080"
const localSlackUri = 'https://hooks.slack.com/services/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';

var stockCNBCAsync = async function(req, res) {
	var inputString = req.body.text;
	var filter = createFilter(inputString);
	
	if(inputString == "all" || inputString == "hot" || inputString == "shit") {
		inputString = ".djia .spx fb aapl snap amzn sq tsla evh wtr ua cmcsa amd jpm googl txmd";
	};
	var stockReqs = inputString.split(" ");
	stockReqs.forEach(async function(e) { 
		var slackUrl = req.body.response_url || localSlackUri
		var apiUrl = 'http://quote.cnbc.com/quote-html-webservice/quote.htm?symbols=' + e +'&symbolType=symbol&requestMethod=itv&exthrs=1&extMode=&fund=1&skipcache=&extendedMask=1&partnerId=20051&noform=1';
		
		await slackAPI.getAndFormatResp(apiUrl, slackUrl, formatStockResults, req, res, filter);
	});
};

var cryptoAsync = async function(req, res) {
	var cryptoReq = req.body.text;
	var slackUrl = req.body.response_url || localSlackUri
	var apiUrl = 'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_INTRADAY&symbol=' + cryptoReq + '&market=USD&apikey=VVCZ3DAK6MZGR2XW'
	
	await slackAPI.getAndFormatResp(apiUrl, slackUrl, formatCryptoResults, req, res);
};

var createFilter = function(input) {
	var filter = {};
	
	if(input == "hot") {
		filter.minChange = 1;
	};
	if (input == "shit") {
		filter.lessThan = 0;	
	};
	
	return filter;
};

var formatStockResults = function(apiResp, filter) {
	var resp = {};
			
	resp.attachments = [];
	var attachment = {
		fallback: "Slack Default"
	};
	var fields = {};
	
	var stockParsed = xml(apiResp);
	var stock = stockParsed.root.children[0].children;
	if(!stock.length > 0) {
		throw("No stock data");
	};
	
	var stockInfo = {};
	
	stock.forEach(function(e) {
		switch (e.name) {
			case "last_timedate":
				stockInfo.time = e.content;
				break;
			case "shortName":
				stockInfo.symbol = e.content.replace('&amp;','&');
				break;
			case "name":
				stockInfo.name = e.content.replace('&amp;','&');
				break;
			case "last":
				stockInfo.current = e.content;
				break;
			case "change":
				stockInfo.change = e.content.replace('UNCH','0.0');
				break;
			case "change_pct":
				stockInfo.changePercent = e.content.replace('UNCH','0.00%');
				break;
			case "curmktstatus":
				stockInfo.curmktstatus = e.content;
				break;
			case "type":
				stockInfo.assetClass = e.content;
				break;
			case "ExtendedMktQuote": {
				var extended = e.children;
				extended.forEach(function(ex) {
					switch (ex.name) {
						case "last":
							stockInfo.extCurrent = ex.content;
							break;
						case "last_timedate":
							stockInfo.extTime = ex.content;
							break;
						case "change":
							stockInfo.extChange = ex.content.replace('UNCH','0.0');
							break;
						case "change_pct":
							stockInfo.extChangePercent = ex.content.replace('UNCH','0.00%');
							break;
					}
				});
			}
		}
	});
	
	if (stockInfo.assetClass === "STOCK" && stockInfo.curmktstatus != "REG_MKT") {
		var extChange = parseFloat(stockInfo.extChange);
		var change = parseFloat(stockInfo.change);
		attachment.color = extChange < 0 ? "#f41f1f" : extChange == 0 ? "#909494" : "#78f41f";
		var marketCloseIndicator = change < 0 ? ":red_arrow_down:" : change == 0 ? "" : ":green_arrow_up:";

		fields.title =  ":clock4: " + stockInfo.name + " (" + stockInfo.symbol + ") ";
		fields.value = "Last Price: $" + stockInfo.extCurrent + " | " + stockInfo.extChange + " | " + stockInfo.extChangePercent;
		fields.value += "\nLast Updated: " + stockInfo.extTime;
		fields.value += "\n" + marketCloseIndicator + " Market Close: $" + stockInfo.current + " | " + stockInfo.change + " | " + stockInfo.changePercent;
		
	} else {
		attachment.color = parseFloat(stockInfo.change) < 0 ? "#f41f1f" : "#78f41f";
		
		fields.title = stockInfo.name + " (" + stockInfo.symbol + ") ";
		fields.value = "Last Price: $" + stockInfo.current + " | " + stockInfo.change + " | " + stockInfo.changePercent;		
		fields.value += "\nLast Updated: " + stockInfo.time;
	};
	
	attachment.fields = [fields];
	resp.attachments.push(attachment);
	resp.response_type = "in_channel";
	resp.filter = false;
	
	if(filter.minChange) {
		resp.filter = resp.filter || Math.abs(parseFloat(stockInfo.changePercent)) < filter.minChange;
	};
	if(filter.lessThan) {
		resp.filter = resp.filter || stockInfo.change >= filter.lessThan || stockInfo.extChange >= filter.lessThan;
	};
	
	return resp;
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
		text += ", \"color\": \"#f41f1f\", \"fields\":[ { \"title\":\"" + resp.name + " (" + resp.symbol + ") to USD\", \"value\":\"Last Price: $" + resp.current + " | " + resp.change + " | " + resp.changePercent + "%";
		text += "\nLast Updated: " + formattedDate;
		text += "\" } ]";
	} else {
		text += ", \"color\": \"#78f41f\", \"fields\":[ { \"title\":\"" + resp.name + " (" + resp.symbol + ") to USD\", \"value\":\"Last Price: $" + resp.current + " | +" + resp.change + " | " + resp.changePercent + "%";
		text += "\nLast Updated: " + formattedDate;
		text += "\" } ]";
	};

	text += "} ]";

	return "{ \"response_type\": \"in_channel\"," + text + " }";
};


var formatDate = function(date, offSetHours) {
	var hours = date.getHours() - offSetHours;
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
};


module.exports = {
	crypto: cryptoAsync,
	stockCNBC: stockCNBCAsync
};


