var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var http = require('http');
var Promise = require('promise');

var app = express();
var gatechCatalog = require('./gatechCatalog');
var courseCritique = require('./courseCritique');

gatechCatalog.getCourseDescription(
	{
		name: 'cs 4400',
		semester: 'fall',
		year: '2015'
	})
	.then(function(data) {
		// console.log(data);
	})
	.catch(logErrors);

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

	if (mode === 'all') {
		searchResults.all().then(returnJSON).catch(logErrors);
	} else if (mode === 'first' || mode === undefined) {
		searchResults.first().then(returnJSON).catch(logErrors);
	}

	function returnJSON(result) {
		res.setHeader('Content-Type', 'application/json');
		res.json(result);
	}
});

/**
 * Get course stats and profs teaching the course.
 */
app.get('/course/:id', function(req, res) {
	res.type('text/javascript');
	var mode = req.query.mode;
	var courseInfo = courseCritique.getCourseInfo(req.params.id);

	if (mode === 'all') {
		courseInfo.all().then(returnJSON).catch(logErrors);
	} else if (mode === 'averageMarks' || mode === undefined) {
		courseInfo.averageMarks().then(returnJSON).catch(logErrors);
	}

	function returnJSON(result) {
		res.setHeader('Content-Type', 'application/json');
		res.json(result);
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

	if (mode === 'averageMarks' || mode === undefined) {
		profData.averageMarks().then(returnJSON).catch(logErrors);
	} else if (mode === 'all') {
		profData.all().then(returnJSON).catch(logErrors);
	}

	function returnJSON(result) {
		res.setHeader('Content-Type', 'application/json');
		res.json(result);
	}
});

function logErrors(e) {
	console.log(e);
}

var httpServer = http.createServer(app);
httpServer.listen(3000);
console.log('Server started...');