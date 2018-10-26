var should = require("chai").should();
var fs = require("fs");
var isMessage = require("../../runtimes/nodejs/IsMessage.js");

describe('IsMessage', function() {
  describe('main - with focus', function() {

    it('should return message', function() {
      var message = JSON.parse(fs.readFileSync(__dirname + "/../data/message.json"));
      return isMessage.main(message).then(resp => {
        resp.should.be.deep.equal(message);
      })
    });

    it('should return message (generic annotation)', function() {
      var message = JSON.parse(fs.readFileSync(__dirname + "/../data/generic_annotation.json"));
      return isMessage.main(message).then(resp => {
        resp.should.be.deep.equal(message);
      })
    });

    var taxonomyAnnotation = JSON.parse(fs.readFileSync(__dirname + "/../data/taxonomy.json"));
    it('should reject annotation', function() {
      return isMessage.main(taxonomyAnnotation).catch(resp => {
        resp.should.be.deep.equal(taxonomyAnnotation);
      })
    });
  });
});
