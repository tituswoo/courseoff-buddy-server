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
	.catch(function (error) {
		console.log(error);
	});

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
		searchResults.all().then(returnIt)
			.catch(function(e) {
				console.log(e);
			});
	} else if (mode === 'first' || mode === undefined) {
		searchResults.first().then(returnIt)
			.catch(function(e) {
				console.log(e);
			});
	}

	function returnIt(result) {
		res.setHeader('Content-Type', 'application/json');
		res.json(result);
	}
});

/**
 * Get course stats and profs teaching the course.
 */
app.get('/course/:id', function(req, res) {
	res.type('text/javascript');
	courseCritique.getCourseInfo(req.params.id)
		.then(function(courseInfo) {
			res.setHeader('Content-Type', 'application/json');
			res.json(courseInfo);
		})
		.catch(function(error) {
			console.log(error);
		});
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
		profData.averageMarks().then(returnIt);
	} else if (mode === 'all') {
		profData.all().then(returnIt);
	}

	function returnIt(result) {
		res.setHeader('Content-Type', 'application/json');
		res.json(result);
	}
});

var httpServer = http.createServer(app);
httpServer.listen(3000);
console.log('Server started...');