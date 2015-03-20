var Promise = require('promise');
var courseCritique = require('./courseCritique');
var gatechCatalog = require('./gatechCatalog');
var gatechDirectory = require('./gatechDirectory');
var rateMyProfessors = require('./rateMyProfessors');

module.exports = new CourseBuddy();
function CourseBuddy() {};

/**
 * Search for a class or professor.
 * @param  {string} query The string query to search for.
 * @return {object} An array of search objects.
 */
CourseBuddy.prototype.search = function (query, limit) {
	if (!isValid(query)) return Promise.reject('Query cannot be left blank.');

	return new Promise(function (resolve, reject) {
		var searchPromise = courseCritique.search(query);
		limit = limit || 3;

		searchPromise.all().then(function(results) {
			if (limit > -1) {
				// console.log('searching for: ' + query);

				var courseNumber = query.match(/(\d.*\d)|\d/);

				if (courseNumber != null) {
					// console.log('Searching for a course');
					courseNumber = courseNumber[0];

					var id = query.match(/[a-zA-z]+/)[0].toUpperCase() + courseNumber;

					var found = false;
					results.map(function (r) {
						if (r.id === id) {
							found = true;
						}
					});
					if (found) {
						resolve(results.slice(0, limit));
					} else {
						reject('No course matches the the criteria: ' + query);
					}
				} else {
					// console.log('Searching for a professor');

					var found = false;
					var firstName = query.match(/[^\s|,]+/)[0].toLowerCase();
					results.map(function (r) {
						var name = r.professor.name.toLowerCase();
						if (name.indexOf(firstName) > -1) {
							found = true;
						}
					});
					if (found) {
						resolve(results.slice(0, limit));
					} else {
						reject('No professor was found with the query: ' + query);
					}					
				}
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
	if (!isValid(id)) return Promise.reject('ID cannot be left blank.');

	var course = {};

	return new Promise(function (resolve, reject) {
		courseCritique.getCourseInfo(id).all()
		.then(function (courseInfo) {
			if (!options.professors) delete courseInfo.professors;
			if (!options.averageMarks) delete courseInfo.averageMarks;
			addObjProps(courseInfo).to(course);
			return courseInfo;
		}).then(function (courseInfo) {
			var firstDigit = id.search(/\d/);
			var courseName = id.substr(0, firstDigit) + ' ' + id.substr(firstDigit, id.length);			
			gatechCatalog.getCourseDescription({name: courseName}).then(function (details) {
				course.details = details;
			}).catch(function (e) {
				course.details = e;
				// todo: if I put reject(e) here, it doesn't return anything.
			}).done(function () {
				if (courseInfo.averageMarks.gpa === '') {
					reject(course);
				} else {
					resolve(course);
				}
			});
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
	if (!isValid(id)) return Promise.reject('ID cannot be left blank.');

	var professor = {};

	return new Promise(function (resolve, reject) {
		courseCritique.getProfessorInfo(id).all()
			.then(function (info) {
				// console.log('1: got the info');
				if (!options.courses) delete info.courses;
				if (!options.averageMarks) delete info.averageMarks;
				addObjProps(info).to(professor);
				return info;
			})
			.then(function (info) {
				// console.log('2: got the info');
				return gatechDirectory.search(info.name)
					.then(function (results) {
						// console.log('2.1: successfully got the results');
						return Promise.resolve(results);
					})
					.catch(function (e) {
						// console.log('2.1: failed to get the results');
						return Promise.reject(e);
					});
			})
			.catch(function (e) {
				// console.log('[error1]: ' + e);
				return Promise.reject(e);
			})
			.then(function (searchResults) {
				// console.log('3: got the search results');
				var url = searchResults[0].url;
				return gatechDirectory.person(url)
					.then(function (profInfo) {
						return Promise.resolve(profInfo);
					})
					.catch(function (e) {
						return Promise.reject(e);
					});
			})
			.catch(function (e) {
				// console.log('[error2]: ' + e);
				return Promise.reject(e);
			})
			.then(function (profInfo) {
				professor.email = profInfo.email;
				professor.url = profInfo.url;

				return rateMyProfessors.professor(professor.name)
					.then(function (ratings) {
						return Promise.resolve(ratings);
					})
					.catch(function (e) {
						return Promise.reject(e);
					});
			})
			.catch(function (e) {
				reject(e);
			})
			.then(function (ratings) {
				professor.rateMyProfessors = ratings;
				resolve(professor);
			});
	});
};

function addObjProps(from) {
	function to(to) {
		for(var prop in from) {
			to[prop] = from[prop];
		}
	}

	return {
		to: to
	};
}

function isValid(id) {
	if (!id || id === 'undefined' || id === '') return false;
	return true;
}