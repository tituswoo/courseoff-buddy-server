var should = require('should');

var courseCritique = require('../courseCritique');

describe('Course Critique API', function() {
	describe('search("bill leahy")', function() {
		var promise = courseCritique.search('bill leahy');

		it('should return a proper search object', function() {
			should(promise).have.properties(['all', 'first']);
		});

		describe('all()', function() {
			it('should have found 2 professors', function(done) {
				promise.all().then(function (results) {
					should(results).have.length(2);
					done();
				}).catch(function (err) {
					done(err);
				});
			});
			it('should have found Beavers, Bill D', function(done) {
				promise.all().then(function (results) {
					should(results[0]).have.property('id').equal('BEAVERSBILLD');
				}).done(function (result) {
					done(result);
				});
			});
			it('should have found Leahy, William', function(done) {
				promise.all().then(function (results) {
					should(results[1]).have.property('id').equal('LEAHYWILLIAM');
				}).done(function (result) {
					done(result);
				});
			});
		});

		describe('first()', function() {
			it('should have found Beavers, Bill D', function(done) {
				promise.first().then(function (result) {
					should(result).have.property('id').equal('BEAVERSBILLD');
				}).done(function (res) {
					done(res);
				});
			});
		});
	});

	describe('search("cs 4400")', function() {
		var promise = courseCritique.search('cs 4400');

		it('should return a proper search object', function() {
			should(promise).have.properties(['all', 'first']);
		});

		describe('all()', function() {
			it('should have found 10 courses', function(done) {
				promise.all().then(function (searchResults) {
					should(searchResults).have.length(10);
				}).done(function(verdict) {
					done(verdict);
				});
			});
			it('should have proper search result object', function(done) {
				promise.all().then(function (searchResults) {
					should(searchResults[0]).have.properties(['id', 'professor']);
				}).done(function (verdict) {
					done(verdict);
				});
			});
			it('should have found CS4400', function(done) {
				promise.all().then(function (searchResults) {
					should(searchResults[0]).have.property('id').equal('CS4400');
				}).done(function (verdict) {
					done(verdict);
				});
			});
			it('should have found CS1316', function(done) {
				promise.all().then(function (searchResults) {
					should(searchResults[1]).have.property('id').equal('CS1316');
				}).done(function (verdict) {
					done(verdict);
				});
			})
		});

		describe('first()', function() {
			it('should have proper search result object', function(done) {
				promise.first().then(function (searchResult) {
					should(searchResult).have.properties(['id', 'professor']);
				}).done(function (verdict) {
					done(verdict);
				});
			});
			it('should have found CS 4400', function(done) {
				promise.first().then(function(searchResult) {
					should(searchResult).have.property('id').equal('CS4400');
				}).done(function (verdict) {
					done(verdict);
				});
			});
		});
	});
});
