var should = require("chai").should();
var fs = require("fs");
var isFocus = require("../../runtimes/nodejs/IsFocus.js");

describe('IsFocus', function() {
  describe('main - with focus', function() {

    var focusAnnotation = JSON.parse(fs.readFileSync(__dirname + "/../data/focus.json"));
    it('should return focus', function() {
      return isFocus.main(focusAnnotation).then(resp => {
        resp.should.be.deep.equal(focusAnnotation);
      })
    });

    var taxonomyAnnotation = JSON.parse(fs.readFileSync(__dirname + "/../data/taxonomy.json"));
    it('should reject taxonomy', function() {
      return isFocus.main(taxonomyAnnotation).catch(resp => {
        resp.should.be.deep.equal(taxonomyAnnotation);
      })
    });
  });
});
