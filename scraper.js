var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');

module.export = new Scraper();

function Scraper() {};

Scraper.prototype.scrapeCourses = function () {
	var url = 'https://oscar.gatech.edu/pls/bprod/bwckctlg.p_disp_dyn_ctlg';
	request(url, function (error, response, body) {
		var $ = cheerio.load(body);
		var terms = [];
		// var context = $('.dataentrytable');

		// $('option', context).each(function () {
		// 	var subjectID = $(this).attr('value');
		// 	console.log(subjectID);
		// });
		// 
		$('option', '#term_input_id').each(function (){
			var termID = $(this).attr('value');
			// console.log(termID);
			terms.push(termID);
		});
		console.log(terms);
	});
};

new Scraper().scrapeCourses();
