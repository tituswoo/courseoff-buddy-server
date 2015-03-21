// Grab professor hotness, average grade, and overall quality from RMP.

var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');

module.exports = new RateMyProfessors();

function RateMyProfessors() {};
var sid = '361'; // georgia tech's school id on rate my professors.

/**
 * Returns helpfullness, clarity, and easiness ratings for the professor.
 * 
 * @param  {string} fullname full name of the professor (format: 'Simpkins, Christopher')
 * @return {object} an object containing information for the professor.
 */
RateMyProfessors.prototype.professor = function (fullname) {
	if (fullname === '') return Promise.reject('The name cannot be left blank.');

	return new Promise(function (resolve, reject) {
		fullname = convertName(fullname);
		var url = 'http://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=Georgia+Institute+of+Technology&schoolID=361&query=' + fullname;

		request(url, function (error, response, body) {
			var profURL = getProfessorURL(fullname, body);
			if (profURL) {
				request(profURL, function (error, response, body) {
					if (error) return reject(error);					
					var ratings = extractRankings(body);
					if (ratings) {
						ratings.url = profURL;
						return resolve(ratings);
					} else {
						return reject(fullname + ' has no ratings yet.');
					}
				});
			} else {
				reject('Could not find ' + fullname + ' on Rate My Professors.');
			}
		});
	});
};

function getProfessorURL(fullname, html) {
	var $ = cheerio.load(html);
	var results = $('.listings-wrap');
	var foundMatches = String(results.html());
	var url = '';
	if (foundMatches != 'null') {
		results.find('.listings > .listing').each(function () {
			var partialURL = $(this).find('a').attr('href');
			var name = $(this).find('.listing-name > .main').html();
			if (name === fullname) {
				url = 'http://www.ratemyprofessors.com' + partialURL;
				return;
			}
		});
		return url || false;
	} else {
		return false;
	}
}

function extractRankings(html) {
	var $ = cheerio.load(html);
	var context = $('.left-breakdown', '.rating-breakdown');

	var overallProfRatings = {};

	var exists = String($('.faux-slides > .rating-slider', context).html());

	if (exists != 'null') {
		// Grab helpfullness, clarity, and easiness ratings:
		$('.faux-slides > .rating-slider', context).each(function() {
			var title = $(this).find('.label').html().toLowerCase();
			var rating = $(this).find('.rating').html();
			overallProfRatings[title] = rating;
		});		
		return overallProfRatings;
	} else {
		return false;
	}	
}

/**
 * Converts name in the format "Simpkins, Christopher L" and turns it into
 * "Simpkins,+Christopher" (note how it removes the middle name).
 * 
 * @param  {string} fullname the full name of the professor to look up
 * @return {string} sanitized, RMP compatible name query.
 */
function convertName(fullname) {
	return fullname.match(/[a-zA-Z]+,\s[a-zA-Z+]+/)[0];
}