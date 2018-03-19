var should = require("chai").should();
var fs = require("fs");
var isMoment = require("../../runtimes/nodejs/IsMoment.js");

describe('IsMoment', function() {
  describe('main - with moment', function() {

		var momentAnnotation = JSON.parse(fs.readFileSync("../data/moment.json"));
    it('should return moment', function() {
			return isMoment.main(momentAnnotation).then(resp => {
				resp.should.be.deep.equal(momentAnnotation);
			})
    });

		var taxonomyAnnotation = JSON.parse(fs.readFileSync("../data/taxonomy.json"));
    it('should reject taxonomy', function() {
			return isMoment.main(taxonomyAnnotation).catch(resp => {
				resp.should.be.deep.equal(taxonomyAnnotation);
			})
    });
  });
});
