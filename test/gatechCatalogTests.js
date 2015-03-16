var should = require('should');
var gatechCatalog = require('../gatechCatalog');

describe('Gatech Catalog API', function() {
	describe('getCourseDescription()', function() {
		var course = {
			name: 'CS 44',
			semester: 'spring',
			year: '2015'
		};
		it('should return a proper description object', function(done) {
			gatechCatalog.getCourseDescription(course).then(function (desc) {
				should(desc).have.properties(['name', 'link', 'description']);
			}).done(function (verdict) {
				done(verdict);
			});
		});

		it('should return description for the course matching provided criteria', function(done) {
			gatechCatalog.getCourseDescription(course)
				.then(function(description) {
					should(description).have.properties(['name', 'link', 'description']);
					should(description.name).equal('CS 4400 Intr to Database Systems ');
				})
				.done(function (verdict) {
					done(verdict);
				});
		});
		
	});
});