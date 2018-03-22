var should = require("chai").should();
var fs = require("fs");
var isAnnotation = require("../../runtimes/nodejs/IsAnnotation.js");

describe('IsAnnotation', function() {
  describe('main - with focus', function() {

    var taxonomyAnnotation = JSON.parse(fs.readFileSync("../data/taxonomy.json"));
    it('should return annotation', function() {
      return isAnnotation.main(taxonomyAnnotation).then(resp => {
        resp.should.be.deep.equal(taxonomyAnnotation);
      })
    });

    var message = JSON.parse(fs.readFileSync("../data/message.json"));
    it('should reject message', function() {
      return isAnnotation.main(message).catch(resp => {
        resp.should.be.deep.equal(message);
      })
    });
  });
});
