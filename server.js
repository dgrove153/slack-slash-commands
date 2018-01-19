var app = require('./app');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var json = require('JSON');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }))
app.set('port', (process.env.PORT || 3000));

var server = app.listen(app.get('port'), function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);
});

app.get('/', function (req, res) {
		res.send('Hello Wrld!!!!');
});

app.post('/stock', function(req, res) {
		var stockReq = req.body.stock;
		var apiUrl = 'https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=' + stockReq + '&apikey=VVCZ3DAK6MZGR2XW'
		
		var options = {
			uri: apiUrl
		};
		
		if(req.headers.host.indexOf("localhost") > -1) {
			options.proxy = "http://cs41cb06pxy03.blackstone.com:8080";
		};
		
		request(options, function (error, response, body) {
			var stock = JSON.parse(body);
			var resp = {};
			resp.symbol = stock['Stock Quotes'][0]['1. symbol'];
			resp.price = stock['Stock Quotes'][0]['2. price'];
			
			var text  = "\"attachments\": [ {\"fallback\" : \"Slack Default\""; 
			text += ", \"color\": \"good\", \"fields\":[ { \"title\":\"" + resp.symbol + "\", \"value\":\"Current Price: " + resp.price + "\" } ]"
			text += "} ]";

			res.setHeader("Content-type", "application/json");
			res.send("{ \"response_type\": \"in_channel\"," + text + " }");
		});
});


app.post('/darren', function(req, res) {
		res.setHeader("Content-type", "application/json");
		var text = "testz post: " + req.body.text;
		res.send("{ \"response_type\": \"in_channel\", \"text\": \"" + text + "\" }");
});