var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');

var baseURL = 'http://catalog.gatech.edu/courses/php/parse.php';

module.exports = {
	/**
	 * Get course description from gatech catalog.
	 *
	 * @method getCourseDescription 
	 * @param  {object} course - options you may pass.
	 * @param {string}	course.name - course name query.
	 * @param {string}	course.semester - the course semester.
	 * @param {string} 	course.year - the course year.
	 * @return {[type]}          [description]
	 */
	getCourseDescription: function(course) {
		return new Promise(function (resolve, reject) {
			var string = course.name;
			var term = parseTermFromDate(course.semester, course.year);

			var query = {
				string: string,
				term: term
			};

			request.post({
				url: baseURL,
				form: query
			}, function(error, response, body) {
				if (error) reject(error);
				try {
					var course = extractCourses(body).first();
					resolve(course);
				} catch (e) {
					reject(e);
				}
			});
		});		
	}
};

/**
 * Creates a term string from a semester and year.
 *
 * @method parseTermFromDate
 * 
 * @param  {string} semester - the course semester.
 * @param  {string} year - the course year.
 * @return {string} term - the encoded term.
 */
function parseTermFromDate(semester, year) {
	switch (semester.toLowerCase()) {
		case 'fall':
			semester = '08';
			break;
		case 'spring':
			semester = '02';
			break;
		case 'summer':
			semester = '05';
			break;
	}
	year = year || new Date().getFullYear();
	return year + semester;
}

function extractCourses(html) {
	$ = cheerio.load(html);
	var courses = [];

	$('.courseblock').each(function (index) {
		var rawDescription = $('.desc', $(this)).html();
		courses.push({
			name: $('.course', $(this)).text(),
			link: $('a', $(this)).attr('href'),
			description: rawDescription.substring(0, rawDescription.indexOf('<br>'))
		});
	});
	
	return {
		first: function() {
			if (courses.length > 0) {
				return courses[0];
			} else {
				throw 'No course(s) found that match the given criteria.';
			}			
		},
		all: function() {
			return courses;
		}
	};
}