var Promise = require('promise');
var courseCritique = require('./courseCritique');
var gatechCatalog = require('./gatechCatalog');
var gatechDirectory require('./gatechDirectory');
var rateMyProfessors = require('./rateMyProfessors');

module.exports = new CourseBuddy();
function CourseBuddy() {};

/**
 * Search for a class or professor.
 * @param  {string} query The string query to search for.
 * @return {object} An array of search objects.
 */
CourseBuddy.prototype.search = function (query, limit) {
	if (query === '') return Promise.reject('Query cannot be left blank.');

	return new Promise(function (resolve, reject) {
		var searchPromise = courseCritique.search(query);
		limit = limit || -1;

		searchPromise.all().then(function(results) {
			if (limit > -1) {
				resolve(results.slice(0, limit));
			} else {
				resolve(results);
			}
		}).catch(function (error) {
			reject(error);
		});
	});
};

/**
 * Returns course information associated with the provided course ID.
 * @param {string} id The unique ID for the course.
 * @param {object} 	options - filter to specify what course info to return.
 * @param {object}	options.averageMarks - return the average marks for the course or not.
 * @param {boolean} options.professors - return info of professors teaching the course.
 * @param {boolean}	options.details - return course details or not.
 * @return {object} A course object that contains course-related info.
 */
CourseBuddy.prototype.course = function (id, options) {
	if (id === '') return Promise.reject('ID cannot be left blank.');

	return new Promise(function (resolve, reject) {
		var courseInfoPromise = courseCritique.getCourseInfo(id);
		courseInfoPromise.all().then(function (course) {
			course.id = id;
			if (!options.professors) delete course.professors;
			if (!options.averageMarks) delete course.averageMarks;
			if (options.details) {
				var firstDigit = id.search(/\d/);
				var courseName = id.substr(0, firstDigit) + ' ' + id.substr(firstDigit, id.length);
				gatechCatalog.getCourseDescription({name: courseName}).then(function (desc) {
					course.details = desc;
					resolve(course);
				});
			} else {
				resolve(course);
			}
		}).catch(function (e) {
			reject(e);
		});
	});
};

/**
 * Returns professor information with the provided profID.
 * @param {string} id      The professor's unique ID.
 * @param {object} options Specifies what information to return.
 * @param {string} options.averageMarks - include average marks or not.
 * @param {string} options.courses - include courses or not.
 * @return {object}        A professor object that contains professor-related info.
 */
CourseBuddy.prototype.prof = function (id, options) {
	if (id === '') return Promise.reject('ID cannot be left blank.');

	return new Promise(function (resolve, reject) {
		var profInfoPromise = courseCritique.getProfessorInfo(id);
		profInfoPromise.all().then(function (info) {
			if (!options.averageMarks) delete info.averageMarks;
			if (!options.courses) delete info.courses;
			resolve(info);
		}).catch(function (e) {
			reject(e);
		});
	});
};