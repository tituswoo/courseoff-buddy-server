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
 */
app.get('/search/:query', function(req, res) {
	res.type('text/javascript');
	courseCritique.search(req.params.query)
		.then(function(results) {
			console.log(results);
			res.setHeader('Content-Type', 'application/json');
			res.json(results);
		})
		.catch(function(error) {
			console.log(error);
		});
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
 */
app.get('/prof/:id', function(req, res) {
	res.type('text/javascript');
	courseCritique.getProfessorInfo(req.params.id)
		.averageMarks().then(function(averages) {
			console.log(averages);
			res.setHeader('Content-Type', 'application/json');
			res.json(averages);
		});
});


var httpServer = http.createServer(app);
httpServer.listen(3000);
console.log('server started...');