var should = require("chai").should();
var fs = require("fs");
var token = require("../../runtimes/nodejs/Token.js");
var nock = require("nock");

var credentials = {
  WatsonWorkspace: {
    AppId: "some_id",
    AppSecret: "some_secret"
  }
}
var authResp = JSON.parse(fs.readFileSync(__dirname + "/../data/auth.json"));

describe('Token', function() {
  describe('main - Token', function() {
    it('should return refreshed token', function() {
      nock.cleanAll();
      var auth = nock("https://api.watsonwork.ibm.com")
      .post("/oauth/token")
      .once()
      .reply(200,authResp);
      return token.main(credentials).then(resp => {
        resp.should.have.property("source","refresh");
      })
    });

    it('should return cached token', function() {
      return token.main(credentials).then(resp => {
        resp.should.have.property("source","cache");
      })
    });

    it('should reject bad result', function() {
      token.reset();
      var auth = nock("https://api.watsonwork.ibm.com")
      .post("/oauth/token")
      .once()
      .reply(401,{status: "failed"});
      return token.main(credentials).catch(resp => {
        resp.body.should.have.property("status","failed");
      })
    });
  });
});
