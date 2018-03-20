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
var authResp = JSON.parse(fs.readFileSync("../data/auth.json"));

describe('Token', function() {
  describe('main - Token', function() {
    it('should return refreshed token', function() {
      var auth = nock("https://api.watsonwork.ibm.com")
      .post("/oauth/token")
      .reply(200,authResp);
			return token.main(credentials).then(resp => {
				resp.should.have.property("source","refresh");
			})
    });

    it('should return cached token', function() {
      var auth = nock("https://api.watsonwork.ibm.com")
      .post("/oauth/token")
      .reply(200,authResp);
			return token.main(credentials).then(resp => {
				resp.should.have.property("source","cache");
			})
    });
  });
});
