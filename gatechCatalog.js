var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');

var baseURL = 'http://catalog.gatech.edu/courses/php/parse.php';

module.exports = {
	/**
	 * Get course description from gatech catalog.
	 * Only the course.name is required; all other fields will be populated
	 * with the current semester and year if left blank.
	 *
	 * @method getCourseDescription 
	 * @param  {object} course - options you may pass.
	 * @param {string}	course.name - course name query (required).
	 * @param {string}	course.semester - the course semester (spring, summer, fall).
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
				form: query,
				timeout: 3000
			}, function(error, response, body) {
				// @todo: apparently the gatech catalog goes down a lot. and it stops
				// any course info from showing. Program in a contingency
				// so that pertinent info will still be returned even if
				// all other parts don't.
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
	semester = convertSeasonToNumber(semester);
	year = year || new Date().getFullYear();
	return year + semester;
}

function convertSeasonToNumber(semester) {
	semester = semester || 'left blank';

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
		default:
			// auto pick the current semester
			var month = new Date().getMonth();
			if (month >= 0 && month < 5) semester = '02'; // spring
			if (month >= 5 && month < 8) semester = '05'; // summer
			if (month >= 8 && month <= 11) semester = '08'; // fall
	}
	return semester;
}

function extractCourses(html) {
	$ = cheerio.load(html);
	var courses = [];

	$('.courseblock').each(function (index) {
		var rawDescription = $('.desc', $(this)).html();
		var name = $('.course', $(this)).text();
		courses.push({
			name: name.substr(0, name.length - 1),
			link: $('a', $(this)).attr('href'),
			description: rawDescription.substring(0, rawDescription.indexOf('   '))
		});
	});
	
	return {
		first: function() {
			if (courses.length > 0) {
				return courses[0];
			} else {
				throw 'No course(s) found matching your criteria, or the server is not available.';
			}			
		},
		all: function() {
			return courses;
		}
	};
}