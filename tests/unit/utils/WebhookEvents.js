// var should = require("chai").should();
var fs = require("fs");
var webhook = require("../../runtimes/nodejs/Webhook.js");
var openwhisk = require("openwhisk");
var util = require("./utils/Util.js");

var message = {
  "__ow_method": "post",
  "__ow_query": "",
  "__ow_body": "eyJzcGFjZU5hbWUiOiJTY290dHNTcGFjZSIsInNwYWNlSWQiOiI1ODI3NTRkMGU0YjAwMzdlMzdiMjVmZjUiLCJhbm5vdGF0aW9uUGF5bG9hZCI6IntcInR5cGVcIjpcImdlbmVyaWNcIixcInZlcnNpb25cIjoxLFwiY29sb3JcIjpcIiM2Q0I3RkJcIixcInRpdGxlXCI6XCJGcm9tIE9XIFR0ZXN0XCIsXCJ0ZXh0XCI6XCJUaGlzIGlzIGEgc2FtcGxlIG1lc3NhZ2UhXCIsXCJhY3RvclwiOntcIm5hbWVcIjpcIklCTSBDbG91ZCBGdW5jdGlvbiBCb3RcIn19IiwibWVzc2FnZUlkIjoiNWFiM2UwZTRlNGIwNjg4ODBlMzVlMWNkIiwiYW5ub3RhdGlvblR5cGUiOiJnZW5lcmljIiwiYW5ub3RhdGlvbklkIjoiNWFiM2UwZTRlNGIwNjg4ODBlMzVlMWNjIiwidGltZSI6MTUyMTczNzk1NjgyNCwidHlwZSI6Im1lc3NhZ2UtYW5ub3RhdGlvbi1hZGRlZCIsInVzZXJOYW1lIjoiV1dDbG91ZEZ1bmN0aW9ucyIsInVzZXJJZCI6ImU3OThmMTk5LTQyZjItNDMyMy1iOTZmLTYzNDY3OTQ1ZTBkYiJ9",
  "__ow_headers": {
    "accept": "text/plain, application/json, application/*+json, */*",
    "content-type": "application/json",
    "x-outbound-token": "1c686d32156eb951be6254a73945dc2211d6e1c15bd045bab6d2c7b2f19d9954",
  },
  "__ow_path": ""
}


var WatsonWorkspace = {
  AppId: "some_id",
  AppSecret: "some_secret",
  WebhookSecret: "some_other_secret"
}

message.WatsonWorkspace = WatsonWorkspace

var body = util.decodeBody(message.__ow_body);
console.log(JSON.stringify(body,null,2));

var tokenResponse = JSON.parse(fs.readFileSync(__dirname + "/../../data/token.json"));

webhook.setOpenwhisk(util.openWhiskStub);

process.env.__OW_ACTION_NAME = "/scottchapman@us.ibm.com_WskDeploy/WatsonWorkspace/Webhook";

/*
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
*/
