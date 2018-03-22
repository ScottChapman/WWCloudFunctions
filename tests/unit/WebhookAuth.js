var should = require("chai").should();
var fs = require("fs");
var webhook = require("../../runtimes/nodejs/Webhook.js");
var openwhisk = require("openwhisk");
var util = require("./utils/Util.js");


var WatsonWorkspace = {
  AppId: "some_id",
  AppSecret: "some_secret",
  WebhookSecret: "some_other_secret"
}

var challenge = {
  type: "verification",
  challenge: "challenge_token"
};

var message = util.generateEvent(challenge,WatsonWorkspace);

webhook.setOpenwhisk(util.openWhiskStub);

process.env.__OW_ACTION_NAME = "/scottchapman@us.ibm.com_WskDeploy/WatsonWorkspace/Webhook";

describe('Webhook', function() {
  describe('main - Webhook Auth', function() {
    it('should return successful challenge', function() {
        return webhook.main(message).then(resp => {
            var body = JSON.parse(resp.body);
            resp.statusCode.should.equal(200);
            body.response.should.equal(challenge.challenge);
        })
    });
  });

  describe('main - Webhook bad request', function() {
    it('should return bad response', function() {
        message.__ow_headers["x-outbound-token"] = "junk";
        return webhook.main(message).catch(err => {
          err.statusCode.should.equal(401);
          err.body.should.equal('Invalid Request Signature');
        })
    });
  });
});
