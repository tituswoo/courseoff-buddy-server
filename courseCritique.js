var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');

var baseURL = 'https://critique.gatech.edu/';

module.exports = {
	search: function(query) {
		var url = baseURL + 'search.php?query=' + query;

		var promise = new Promise(function (resolve, reject) {
			request(url, function (error, response, body) {
				if (error) reject(error);
				var results = getSearchResults(body);
				resolve(results);
			});
		});

		return {
			all: function() {
				return new Promise(function (resolve, reject) {
					promise.then(function(results) {
						resolve(results);
					}).catch(function(e) {
						reject(e);
					});
				});
			},
			first: function() {
				return new Promise(function (resolve, reject) {
					promise.then(function(results) {
						resolve(results[0]);
					}).catch(function(e) {
						reject(e);
					});
				});
			}
		}
	},
	getCourseInfo: function(courseID) {
		var url = baseURL + 'course.php?id=' + courseID;

		var promise = new Promise(function (resolve, reject) {
			request(url, function (error, response, body) {
				if (error) reject(error);
				var courseInfo = getCourse(body);
				courseInfo.averageMarks.url = url;
				resolve(courseInfo);
			});
		});

		return {
			all: function () {
				return new Promise(function (resolve, reject) {
					promise.then(function(result) {
						resolve(result);
					}).catch(function(e) {
						reject(e);
					});
				});
			},
			averageMarks: function () {
				return new Promise(function (resolve, reject) {
					promise.then(function(result) {
						delete result.professors;
						resolve(result);
					}).catch(function(e) {
						reject(e);
					});
				});
			}
		};
	},
	getProfessorInfo: function(profID) {
		var url = baseURL + 'prof.php?id=' + profID;

		var promise = new Promise(function (resolve, reject) {
			request(url, function (error, response, body) {
				if (error) reject(error);
				var profInfo = getProfInfo(body, profID);
				profInfo.averageMarks.url = url;
				resolve(profInfo);
			});
		});

		return {
			all: function() {
				return new Promise(function (resolve, reject) {
					promise.then(function(profInfo) {
						resolve(profInfo);
					}).catch(function(e) {
						reject(e);
					});
				});
			},
			averageMarks: function() {
				return new Promise(function (resolve, reject) {
					promise.then(function(profInfo) {
						delete profInfo.courses;
						resolve(profInfo);
					}).catch(function(e) {
						reject(e);
					});
				});
			}
		};
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