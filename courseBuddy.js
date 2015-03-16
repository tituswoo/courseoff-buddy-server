var Promise = require('promise');
var courseCritique = require('./courseCritique');
var gatechCatalog = require('./gatechCatalog');

module.exports = new CourseBuddy();
function CourseBuddy() {};

/**
 * Search for a class or professor.
 * @param  {string} query The string query to search for.
 * @return {[type]}       [description]
 */
CourseBuddy.prototype.search = function (query, limit) {
	return new Promise(function (resolve, reject) {
		if (query === '') {
			reject('A query must be specified.');
		} else {
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
		}
	});
};