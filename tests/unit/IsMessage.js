var should = require("chai").should();
var fs = require("fs");
var isMessage = require("../../runtimes/nodejs/IsMessage.js");

describe('IsMessage', function() {
  describe('main - with focus', function() {

    var message = JSON.parse(fs.readFileSync("../data/message.json"));
    it('should return message', function() {
      return isMessage.main(message).then(resp => {
        resp.should.be.deep.equal(message);
      })
    });

    var taxonomyAnnotation = JSON.parse(fs.readFileSync("../data/taxonomy.json"));
    it('should reject annotation', function() {
      return isMessage.main(taxonomyAnnotation).catch(resp => {
        resp.should.be.deep.equal(taxonomyAnnotation);
      })
    });
  });
});
