var app = require('./app');
var bodyParser = require('body-parser');
var randomCommands = require('./randomCommands');
var stock = require('./stock');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.set('port', (process.env.PORT || 3000));

var server = app.listen(app.get('port'), function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);
});

app.post('/google', function (req, res) {
	randomCommands.google(req, res);
});

app.post('/direction', function (req, res) {
	randomCommands.direction(req, res);
});

app.post('/news', function (req, res) {
	randomCommands.news(req, res);
});

app.post('/stock', function (req, res) {
	res.send();
	stock.stock(req, res);
});

app.post('/crypto', function (req, res) {
	res.send();
	stock.crypto(req, res);
});

app.post('/stockcnbc', function (req, res) {
	stock.stockCNBC(req, res);
});