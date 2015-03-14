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
	courseCritique.getCourse(req.params.id)
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
	var url = 'https://critique.gatech.edu/prof.php?id=' + req.params.id;
	request(url, function (error, response, body) {
		if (error) throw error;
		var profInfo = getProfInfo(body, req.params.id);
		res.setHeader('Content-Type', 'application/json');
		res.json(profInfo);
	});
});

function getProfInfo(html, profID) {
	$ = cheerio.load(html);

	var professor = {
		id: profID,
		name: $('h2', '.row').text(),
		averageMarks: {
			gpa: $('tr', '.row tbody').children().eq(1).text(),
			a: $('tr', '.row tbody').children().eq(2).text(),
			b: $('tr', '.row tbody').children().eq(3).text(),
			c: $('tr', '.row tbody').children().eq(4).text(),
			d: $('tr', '.row tbody').children().eq(5).text(),
			f: $('tr', '.row tbody').children().eq(6).text()
		},
		courses: []
	};

	$('tr', '#dataTable tbody').each(function (index, element) {
		var course = {
			name: $(this).children().eq(0).text(),
			id: $(this).children().eq(0).text().replace(/\s/g, ''),
			section: $(this).children().eq(1).text(),
			year: $(this).children().eq(2).text(),
			size: $(this).children().eq(3).text(),
			averageMarks: {
				gpa: $(this).children().eq(4).text(),
				a: $(this).children().eq(5).text(),
				b: $(this).children().eq(6).text(),
				c: $(this).children().eq(7).text(),
				d: $(this).children().eq(8).text(),
				f: $(this).children().eq(9).text(),
				w: $(this).children().eq(10).text(),
			}
		};
		professor.courses.push(course);
	});

	return professor;
}

var httpServer = http.createServer(app);
httpServer.listen(3000);
console.log('server started...');