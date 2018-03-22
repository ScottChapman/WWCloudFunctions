var should = require("chai").should();
var fs = require("fs");
var sendMessage = require("../../runtimes/nodejs/SendMessage.js");
var nock = require("nock");
var utils = require("./utils/Util.js");

var message = {
  WatsonWorkspace: {
    AppId: "some_id",
    AppSecret: "some_secret"
  },
  spaceId: "someSpaceId"
}
var tokenResponse = JSON.parse(fs.readFileSync("../data/token.json"));
var sentMessageResponse = JSON.parse(fs.readFileSync("../data/created_message.json"));

sendMessage.setOpenwhisk(utils.openWhiskStub);

process.env.__OW_ACTION_NAME = "/scottchapman@us.ibm.com_WskDeploy/WatsonWorkspace/SendMessage";

describe('SendMessage', function() {
  describe('main - SendMessage', function() {
    it('should return Sent Message', function() {
      utils.reject(false);
      var auth = nock("https://api.watsonwork.ibm.com")
        .post("/v1/spaces/" + message.spaceId + "/messages")
        .once()
        .reply(201,sentMessageResponse);
      return sendMessage.main(message).then(resp => {
        resp.should.be.deep.equal(sentMessageResponse);
      })
    });

    it('should fail Send Message', function() {
      utils.reject(false);
      var auth = nock("https://api.watsonwork.ibm.com")
        .post("/v1/spaces/" + message.spaceId + "/messages")
        .once()
        .reply(401,sentMessageResponse);
      return sendMessage.main(message).catch(resp => {
        resp.should.be.equal(401);
      })
    });

    it('should fail on bad token', function() {
        utils.reject(true);
        return sendMessage.main(message).catch(resp => {
            resp.message.should.equal("Bad credentials");
        })
    });
  });
});
