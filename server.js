var app = require('./app');
var bodyParser = require('body-parser');
var randomCommands = require('./randomCommands');
var geocode = require('./geocode');
var stock = require('./stock');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.set('port', (process.env.PORT || 3000));

var server = app.listen(app.get('port'), function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);
});

app.get('/', function(req, res) {
	res.send('Brian\'s World');
});

app.post('/google', function (req, res) {
	randomCommands.google(req, res);
});

app.post('/direction', function (req, res) {
	res.setHeader("Content-type", "application/json");
	res.send({"response_type": "in_channel"});
	geocode.direction(req, res);
});

app.post('/distance', function (req, res) {
	res.setHeader("Content-type", "application/json");
	res.send({"response_type": "in_channel"});
	geocode.distance(req, res);
});

app.post('/news', function (req, res) {
	randomCommands.news(req, res);
});

app.post('/crypto', function (req, res) {
	res.setHeader("Content-type", "application/json");
	res.send({"response_type": "in_channel"});
	stock.crypto(req, res);
});

app.post('/stockcnbc', function (req, res) {
	res.setHeader("Content-type", "application/json");
	res.send({"response_type": "in_channel"});
	stock.stockCNBC(req, res);
});