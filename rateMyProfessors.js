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
		var url = 'http://search.mtvnservices.com/typeahead/suggest/?solrformat=true&rows=10&callback=jQuery1110046836297819390893_1426482151287&q='+fullname+'+AND+schoolid_s%3A361&defType=edismax&qf=teacherfullname_t%5E1000+autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+desc&siteName=rmp&rows=20&start=0&fl=pk_id+teacherfirstname_t+teacherlastname_t+total_number_of_ratings_i+averageratingscore_rf+schoolid_s';

		request(url, function (error, response, body) {
			if (error) return eject(error);
			var pkid = getPKID(body);
			var newURL = 'http://www.ratemyprofessors.com/ShowRatings.jsp?tid=' + pkid;
			request(newURL, function (err, resp, body) {
				if (err) return eject(err);

				var profRankings = extractRankings(body);
				profRankings.url = newURL;
				resolve(profRankings);
			});
		});
	});
};

function extractRankings(html) {
	var $ = cheerio.load(html);
	var context = $('.left-breakdown', '.rating-breakdown');

	var overallProfRatings = {};

	// Grab helpfullness, clarity, and easiness ratings:
	$('.faux-slides > .rating-slider', context).each(function() {
		var title = $(this).find('.label').html().toLowerCase();
		var rating = $(this).find('.rating').html();

		overallProfRatings[title] = rating;
	});
	
	return overallProfRatings;
}

function getPKID(result) {
	var pkidLoc = result.indexOf('pk_id') + 7;
	var pkid = result.substr(pkidLoc, 7);
	
	return pkid;
}

/**
 * Converts name in the format "Simpkins, Christopher L" and turns it into
 * "Simpkins,+Christopher" (note how it removes the middle name).
 * 
 * @param  {string} fullname the full name of the professor to look up
 * @return {string} sanitized, RMP compatible name query.
 */
function convertName(fullname) {
	fullname = fullname.replace(' ', '+');
	fullname = fullname.substr(0, fullname.indexOf(' '));
	return fullname;
}