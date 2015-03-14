var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');

var baseURL = 'https://critique.gatech.edu/';

module.exports = {
	search: function(query) {
		var url = baseURL + 'search.php?query=' + query;

		return new Promise(function (resolve, reject) {
			request(url, function (error, response, body) {
				if (error) reject(error);
				var results = getSearchResults(body);
				resolve(results);
			});
		});
	},
	getCourse: function(cid) {
		var url = baseURL + 'course.php?id=' + cid;
		
		return new Promise(function (resolve, reject) {
			request(url, function (error, response, body) {
				if (error) reject(error);
				var courseInfo = getCourse(body);
				resolve(courseInfo);
			});
		});
	}
};

function getSearchResults(html) {
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