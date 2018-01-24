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
			var news = JSON.parse(body);
			var resp = {};
			resp.headline = news['articles'][0]['title'];
			resp.url = news['articles'][0]['url'];
			
			resp.headline1 = news['articles'][1]['title'];
			resp.url1 = news['articles'][1]['url'];
			
			resp.headline2 = news['articles'][2]['title'];
			resp.url2 = news['articles'][2]['url'];
			res.send(resp);
			
			resp.headline3 = news['articles'][3]['title'];
			resp.url3 = news['articles'][3]['url'];
			res.send(resp);
			
			var text  = "\"attachments\": [ {\"fallback\" : \"Slack Default\""; 
			text += ", \"color\": \"#439FE0\", \"fields\":[ { \"title\":\"" + resp.headline + "\", \"value\":\"Top Article: " + resp.URL + "\" } ]"
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