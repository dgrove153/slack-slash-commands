var app = require('./app');
var bodyParser = require('body-parser');
var winterns = require('./winterns');
var stock = require('./stock');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }))
app.set('port', (process.env.PORT || 3000));

var server = app.listen(app.get('port'), function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);
});

app.post('/google', function (req, res) {
	winterns.google(req, res)
});

app.post('/direction', function (req, res) {
	winterns.direction(req, res)
});

app.post('/news', function (req, res) {
	winterns.news(req, res)
});

app.post('/stock', function (req, res) {
	(async () => {
		stock.stock(req, res)
	})();
});

app.post('/crypto', function (req, res) {
	stock.crypto(req, res)
});