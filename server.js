var app = require('./app');
var express = require('express');
var bodyParser = require('body-parser');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }))
app.set('port', (process.env.PORT || 3000));

var server = app.listen(app.get('port'), function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);
});

app.get('/', function (req, res) {
		res.send('Hello Wrld!');
});

app.post('/darren', function(req, res) {
		res.send('tests post: ' + req.body.text);
});