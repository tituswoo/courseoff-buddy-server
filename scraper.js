var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');

module.export = scraper;

var scraper = {};

scraper.scrapeCourses = scrapeCourses;

function scrapeCourses() {
	var url = 'https://oscar.gatech.edu/pls/bprod/bwckctlg.p_disp_dyn_ctlg';
	getTerms(url).then(function (terms) {
		getSubjects('201508').then(function (subjects) {
			console.log('got the subjects: ' + subjects.length);
			getCourses(terms[0], subjects[0]).then(function (courses) {
				console.log('----');
				console.log('courses: ' + courses.length)
				console.log('terms: ' + terms.length);
			})
		});
	});
};

/**
 * Retrieves the course terms from the dropdown menu on the GTech website.
 * @param  url - the url of the site to scrape.
 * @return promise that resolves to an array of terms.
 */
function getTerms(url) {
	return new Promise(function (resolve, reject) {
		request(url, function (err, response, body) {
			if (err) return reject(err);
			var $ = cheerio.load(body);
			var terms = [];
			$('option', '#term_input_id').each(function () {
				var termID = $(this).attr('value');
				terms.push(termID);
			});
			terms = terms.slice(1, terms.length);
			return resolve(terms);
		});
	});
}

/**
 * Get all the subjects that belong to the given term.
 * @param term - the term.
 * @return promise that resolves to an array of subjects.
 */
function getSubjects(term) {
	return new Promise(function (resolve, reject) {
		request.post({
			url: 'https://oscar.gatech.edu/pls/bprod/bwckctlg.p_disp_cat_term_date',
			form: {
				call_proc_in: 'bwckctlg.p_disp_dyn_ctlg',
				cat_term_in: term
			}
		}, function (err, response, body) {
			if (err) return reject(err);
			$ = cheerio.load(body);
			var subjects = [];
			$('option', '#subj_id').each(function () {
				var subjectID = $(this).attr('value');
				subjects.push(subjectID);
			});
			return resolve(subjects);
		});
	});
}

function getCourses(term, subject) {
	console.log('===');
	console.log("term: " + term);
	console.log("subject: " + subject);
	console.log('===');

	return new Promise(function (resolve, reject) {
		request.post({
			url: 'https://oscar.gatech.edu/pls/bprod/bwckctlg.p_display_courses',
			form: {
				term_in: term,
				call_proc_in: 'bwckctlg.p_disp_dyn_ctlg',
				sel_subj: 'dummy',
				sel_levl: 'dummy',
				sel_schd: 'dummy',
				sel_coll: 'dummy',
				sel_divs: 'dummy',
				sel_dept: 'dummy',
				sel_attr: 'dummy',
				sel_subj: subject,
				sel_crse_strt: '',
				sel_crse_end: '',
				sel_title: '',
				sel_levl: '%',
				sel_schd: '%',
				sel_coll: '%',
				sel_divs: '%',
				sel_dept: '%',
				sel_from_cred: '',
				sel_to_cred: '',
				sel_attr: '%'
			}
		}, function (err, response, body) {
			// console.log(body);
			if (err) return reject(err);
			var $ = cheerio.load(body);
			var courses = [];
			$('#subj_id option').each(function () {
				var courseValue = $(this).attr();
				courses.push(courseValue);
			});
			return resolve(courses);
		});
	});
}

(function init() {
	scraper.scrapeCourses();
})();
