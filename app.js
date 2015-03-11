var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var app = express();

app.get('/', function(req, res) {
	res.type('text/plain');
	res.send('Unofficial Course Critique API.');
});

/**
 * Search for a class or professor.
 */
app.get('/search/:query', function(req, res) {
	res.type('text/javascript');
	var url = 'https://critique.gatech.edu/search.php?query=' + req.params.query;
	request(url, function (error, response, body) {
		if (error) throw error;
		var results = getSearchResults(body);
		res.json(results);
	});
});

/**
 * Get course stats and profs teaching the course.
 */
app.get('/course/:id', function(req, res) {
	res.type('text/javascript');
	var url = 'https://critique.gatech.edu/course.php?id=' + req.params.id;
	request(url, function (error, response, body) {
		if (error) throw error;
		var courseInfo = getCourse(body);
		res.json(courseInfo);
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

function getSearchResults(json) {
	json = JSON.parse(html);
	var results = [];
	json.hits.hits.map(function (hit) {
		results.push({
			id: hit._id,
			professor: {
				name: hit._source.prof
			}
		});
	});
	return results;
}

function getCourse(html) {
	$ = cheerio.load(html);

	var course = {
		title: $('h2', '.row').text(),
		averageMarks: {
			gpa: $('tr', '.row tbody').children().eq(1).text(),
			a: $('tr', '.row tbody').children().eq(2).text(),
			b: $('tr', '.row tbody').children().eq(3).text(),
			c: $('tr', '.row tbody').children().eq(4).text(),
			d: $('tr', '.row tbody').children().eq(5).text(),
			f: $('tr', '.row tbody').children().eq(6).text()
		}
	};

	// Get professors and their stats for this course.
	course.professors = [];
	$('tr', '#dataTable tbody').each(function (index, element) {
		var professor = {
			id: $(this).attr('class'),
			name: $(this).children().eq(0).text(),
			classSize: $(this).children().eq(1).text(),
			averageMarks: {
				gpa: $(this).children().eq(2).text(),
				a: $(this).children().eq(3).text(),
				b: $(this).children().eq(4).text(),
				c: $(this).children().eq(5).text(),
				d: $(this).children().eq(6).text(),
				f: $(this).children().eq(7).text(),
				w: $(this).children().eq(8).text(),
			}
		};
		course.professors.push(professor);
	});

	return course;
}

app.listen(process.env.PORT || 3000);
console.log('server started...');