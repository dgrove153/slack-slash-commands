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


app.post('/stock', function(req, res) {
		var stockReq = req.body.text;
		var apiUrl = 'https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=' + stockReq + '&apikey=VVCZ3DAK6MZGR2XW'
		
		var options = {
			uri: apiUrl
		};
		
		if(req.headers.host.indexOf("localhost") > -1) {
			options.proxy = "http://cs41cb06pxy01.blackstone.com:8080";
		};
		
		request(options, function (error, response, body) {
			try {
				var stock = JSON.parse(body);
				var resp = {};
				resp.symbol = stock['Stock Quotes'][0]['1. symbol'];
				resp.price = stock['Stock Quotes'][0]['2. price'];
				
				var text  = "\"attachments\": [ {\"fallback\" : \"Slack Default\""; 
				text += ", \"color\": \"#439FE0\", \"fields\":[ { \"title\":\"" + resp.symbol + "\", \"value\":\"Current Price: " + resp.price + "\" } ]"
				text += "} ]";

				res.setHeader("Content-type", "application/json");
				res.send("{ \"response_type\": \"in_channel\"," + text + " }");
			} catch (err) {
				res.send("Incorrect input, please try again");
			}
		});
});

//api key for custom search api on google : AIzaSyDN8o0No9F1nMjwz-C_ByB8BOAnY-4rXzM
// var apiUrl = 'https://api.stackexchange.com/docs/faqs-by-tags#page=1&pagesize=5&tags=' + stackSubject + '&filter=default&site=stackoverflow&run=true'
			// + '&apikey=hw9E*LikkrVnJ3wf8H0s2w(('
//fitbit, bitcoin, google custom search

app.post('/google', function(req, res) {
		var stackSubject = req.body.text;
		
		//key = _cse_e24pnpmxxak 
		
		var apiUrl= 'https://www.googleapis.com/customsearch/v1?key=AIzaSyDN8o0No9F1nMjwz-C_ByB8BOAnY-4rXzM&cx=017576662512468239146:omuauf_lfve&q='
		 + stackSubject
	 		
		var options = {
			uri: apiUrl
		};
		
		if(req.headers.host.indexOf("localhost") > -1) {
			options.proxy = "http://cs41cb06pxy03.blackstone.com:8080";
		};
		
		request(options, function (error, response, body) {
			try {
				var search = JSON.parse(body);
				var resp = {};
				resp.title =  search['items'][0]['title'];
				resp.snippet = search['items'][0]['snippet'];
				//resp.thelinks = search['items']['link'];
				
				//res.send(resp);
							
				var text  = "\"attachments\": [ {\"fallback\" : \"Slack Default\""; 
				text += ", \"color\": \"#439FE0\", \"fields\":[ { \"title\":\"" + resp.title + "\", \"value\":\"Current Price: " + resp.snippet + "\" } ]"
				text += "} ]";

				res.setHeader("Content-type", "application/json");
				res.send("{ \"response_type\": \"in_channel\"," + text + " }");
			} catch (err) {
				res.send("Incorrect input, please try again");
			}
		});	
});

app.post('/direction', function(req, res) {
		var calculateCityDistance = req.body.text;
		var apiUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=601%Lexington%ave%NYC%NY&destinations='+ calculateCityDistance +'&key=AIzaSyCehJJ3gQeMG1N_CIl9vkCwHQN3RMEZnXo'

		var options = {
			uri: apiUrl
		};

		if(req.headers.host.indexOf("localhost") > -1) {
			options.proxy = "http://cs41cb06pxy03.blackstone.com:8080";
		};
		
		request(options, function (error, response, body) {
			try {
				var directions = JSON.parse(body);
				var respo = {};
				respo.distance = directions['rows'][0]['elements'][0]['distance']['text'];			 


				var text  = "\"attachments\": [ {\"fallback\" : \"Slack Default\""; 
				text += ", \"color\": \"#439FE0\", \"fields\":[ { \"title\":\"" + calculateCityDistance + "\", \"value\":\"Distance: " + respo.distance + "\" } ]"
				text += "} ]";

				res.setHeader("Content-type", "application/json");
				res.send("{ \"response_type\": \"in_channel\"," + text + " }");
			} catch (err) {
				res.send("Incorrect input, please try again");
			}
		});
});

app.post('/news', function(req, res) {
		var newsReq = req.body.text;
		var apiUrl = 'https://newsapi.org/v2/everything?q=' + newsReq + '&language=en&sortBy=popularity&apiKey=8734dbf7115e4897b1e5b4553325633d'
		
		var options = {
			uri: apiUrl
		};
		
		if(req.headers.host.indexOf("localhost") > -1) {
			options.proxy = "http://cs41cb06pxy01.blackstone.com:8080";
		};
		
		request(options, function (error, response, body) {
			try {
				var news = JSON.parse(body);
				var resp = {};
				resp.headline = news['articles'][0]['title'];
				resp.url = news['articles'][0]['url'];
				
				resp.headline1 = news['articles'][1]['title'];
				resp.url1 = news['articles'][1]['url'];
				
				resp.headline2 = news['articles'][2]['title'];
				resp.url2 = news['articles'][2]['url'];
				
				resp.headline3 = news['articles'][3]['title'];
				resp.url3 = news['articles'][3]['url'];
				
				var text  = "\"attachments\": [ {\"fallback\" : \"Slack Default\""; 
				text += ", \"color\": \"#439FE0\", \"fields\":[ { \"title\":\"" + resp.headline + "\", \"value\":\"Top Article: " + resp.url + "\" } ]"
				text += "} ]";

				res.setHeader("Content-type", "application/json");
				res.send("{ \"response_type\": \"in_channel\"," + text + " }");
			} catch (err) {
				res.send("Incorrect input, please try again");
			}
		});
});



app.post('/darren', function(req, res) {
		res.setHeader("Content-type", "application/json");
		var text = "testz post: " + req.body.text;
		res.send("{ \"response_type\": \"in_channel\", \"text\": \"" + text + "\" }");
});