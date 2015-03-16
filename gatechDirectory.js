// Scrubs the Georgia Tech RcR directory for contact information

var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');

module.exports = new GatechDirectory();

function GatechDirectory() {};

var baseURL = 'http://www.rcr.gatech.edu/directory/results/';

/**
 * Searches the RCR directory for student and staff.
 * @param  {string} name - The name of the person to look for.
 */
GatechDirectory.prototype.search = function (name) {
	if (name === '') return new Promise.reject('Name cannot be left blank.');
	var url = baseURL + formatName(name);

	return new Promise(function (resolve, reject) {
		request(url, function (error, response, body) {
			if (error) return reject(error);
			var searchResults = extractSearchResults(body);
			if (searchResults.length > 0) {
				resolve(searchResults);
			} else {
				reject('Nothing was found.');
			}
		});
	});	
};

/**
 * Grabs the email and full name of the student or professor.
 * 
 * @param  {string} url - the rcr resource url for the person or professor.
 * @return {object}     A user object that contains the person's nae, email, and url.
 */
GatechDirectory.prototype.person = function (url) {
	if (url === '') return new Promise.reject('The URL cannot be left blank.');

	return new Promise(function (resolve, reject) {
		request(url, function (error, response, body) {
			if (error) return new Promise.reject(error);

			var info = extractPerson(body);
			info.url = url;

			resolve(info);
		});
	});
};

/**
 * Extracts the person's detailed information and contact info from RCR.
 * @param  {string} html - the raw html to extract info from.
 * @return {object}      a user object that contains useful info about the person.
 */
function extractPerson(html) {
	var $ = cheerio.load(html);
	var person = {};

	var context = $('.content.block-body', '#block-system-main');

	person.name = $('h2', context).html();
	person.email = $('p > a', context).html();

	return person;
}

/**
 * Extract the search results from the given html.
 * @param  {string} html the raw html from the rcr website.
 * @return {Array}      An array of 'user' objects that have name and resource url.
 */
function extractSearchResults(html) {
	var $ = cheerio.load(html);
	var results = [];

	var content = $('.content > p', '#block-system-main').each(function () {
		results.push({
			name: $(this).text(),
			url: 'http://www.rcr.gatech.edu/' + $(this).find('a').attr('href')
		});
	});
	
	return results;
}

/**
 * Format a name of format "Leahy, William" and turn it into
 * "William/Leahy" to make it compatible with RcR internal API.
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function formatName(name) {
	var firstIndex = name.indexOf(',') + 2;
	var last = name.substr(0, firstIndex - 2);
	var first = name.substr(firstIndex, name.length);
	return first + '/' + last;
}