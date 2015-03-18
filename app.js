var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var http = require('http');
var Promise = require('promise');

var app = express();
var courseBuddy = require('./courseBuddy');

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

	var limit = req.query.limit || 3;
	var query = req.params.query;
	var helper = ApiHelper(res);

	courseBuddy.search(query, limit)
		.then(helper.returnJSON)
		.catch(function (e) {
			res.status(404).send(e);
		});
});

/**
 * Get course stats and profs teaching the course.
 */
app.get('/course/:id', function(req, res) {
	res.type('text/javascript');

	var courseID = req.params.id;
	var options = {
		professors: req.query.professors || false,
		averageMarks: req.query.averageMarks || true,
		details: req.query.details || true
	};
	var helper = ApiHelper(res);

	courseBuddy.course(courseID, options)
		.then(helper.returnJSON)
		.catch(helper.logErrors);
});

/**
 * Get professor stats and courses taught by him/her.
 * Supports getting full data (prof + courses), or just
 * the prof's average marks overall.
 */
app.get('/prof/:id', function(req, res) {
	res.type('text/javascript');

	var profID = req.params.id;
	var options = {
		averageMarks: req.query.averageMarks || true,
		courses: req.query.courses || false,
		rmp: req.query.rmp || true
	}

	var helper = new ApiHelper(res);

	courseBuddy.prof(profID, options)
		.then(helper.returnJSON)
		.catch(helper.logErrors);
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