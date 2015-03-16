var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var http = require('http');
var Promise = require('promise');

var app = express();
var gatechCatalog = require('./gatechCatalog');
var courseCritique = require('./courseCritique');

/**
 * Returns a simple welcome page (root of the API).
 */
app.get('/', function(req, res) {
	res.type('text/plain');
	res.send('The unofficial gatech course data api.');
});

/**
 * Search for a class or professor.
 * By default, returns the top match. Setting the mode to 'all'
 * will return all the search results.
 */
app.get('/search/:query', function(req, res) {
	res.type('text/javascript');

	var mode = req.query.mode;
	var searchResults = courseCritique.search(req.params.query);

	var helper = new ApiHelper(res);

	if (mode === 'all') {
		searchResults.all().then(helper.returnJSON).catch(helper.logErrors);
	} else if (mode === 'first' || mode === undefined) {
		searchResults.first().then(helper.returnJSON).catch(helper.logErrors);
	}
});

/**
 * Get course stats and profs teaching the course.
 */
app.get('/course/:id', function(req, res) {
	res.type('text/javascript');
	var mode = req.query.mode;
	var courseInfo = courseCritique.getCourseInfo(req.params.id);

	var helper = new ApiHelper(res);

	if (mode === 'all') {
		courseInfo.all().then(helper.returnJSON).catch(helper.logErrors);
	} else if (mode === 'averageMarks' || mode === undefined) {
		courseInfo.averageMarks().then(helper.returnJSON).catch(helper.logErrors);
	}
});

/**
 * Get professor stats and courses taught by him/her.
 * Supports getting full data (prof + courses), or just
 * the prof's average marks overall.
 */
app.get('/prof/:id', function(req, res) {
	res.type('text/javascript');
	var profData = courseCritique.getProfessorInfo(req.params.id);
	var mode = req.query.mode;

	var helper = new ApiHelper(res);

	if (mode === 'averageMarks' || mode === undefined) {
		profData.averageMarks().then(helper.returnJSON).catch(helper.logErrors);
	} else if (mode === 'all') {
		profData.all().then(helper.returnJSON).catch(helper.logErrors);
	}
});

/**
 * API Helper class for returning json and logging any errors.
 * @param {object} response the Express response object.
 */
function ApiHelper(response) {
	var methods = {};
	methods.returnJSON = function(result) {
		response.setHeader('Content-Type', 'application/json');
		response.json(result);
	};
	methods.logErrors = function(e) {
		console.log(e);
	}
	return methods;
}

// Start the server"
var httpServer = http.createServer(app);
httpServer.listen(3000);
console.log('Server started...');