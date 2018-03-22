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

var graphQLResp = JSON.parse(fs.readFileSync("../data/raw/webhook/graphql_message.json"));
util.addResolveAction("WatsonWorkspace/GraphQL", graphQLResp);

webhook.setOpenwhisk(util.openWhiskStub);

process.env.__OW_ACTION_NAME = "/scottchapman@us.ibm.com_WskDeploy/WatsonWorkspace/Webhook";

describe('Webhook', function() {
  describe('main - Webhook Events', function() {
    it('should return successful message created event', function() {
      var body = JSON.parse(fs.readFileSync("../data/raw/webhook/message_created.json"));
      var message = util.generateEvent(body,WatsonWorkspace);
      return webhook.main(message).then(resp => {
        resp.statusCode.should.equal(200);
        resp.body.status.should.equal("OK!");
      })
    });

    it('should return successful annotation created event', function() {
      var body = JSON.parse(fs.readFileSync("../data/raw/webhook/keywords_annotation.json"));
      var message = util.generateEvent(body,WatsonWorkspace);
      return webhook.main(message).then(resp => {
        resp.statusCode.should.equal(200);
        resp.body.status.should.equal("OK!");
      })
    });
  });
});
