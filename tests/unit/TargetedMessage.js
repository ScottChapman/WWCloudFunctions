var should = require("chai").should();
var fs = require("fs");
var graphQL = require("../../runtimes/nodejs/GraphQL.js");
var nock = require("nock");
var sinon = require("sinon");
var openwhisk = require("openwhisk");

var message = {
  WatsonWorkspace: {
    AppId: "some_id",
    AppSecret: "some_secret"
  },
  "annotation": {
    "annotationPayload": {
      "referralMessageId": "a67207a0-2620-11e8-928c-f1f45453ff65",
      "targetAppId": "e798f199-42f2-4323-b96f-63467945e0db",
      "actionId": "/invite someone",
      "version": "1.0",
      "updated": 1521641606055,
      "conversationId": "582754d0e4b0037e37b25ff5",
      "tokenClientId": "toscana-web-client-id",
      "createdBy": "d76b3ac0-8f0a-1028-9874-db07163b51b2",
      "targetDialogId": "a67207a0-2620-11e8-928c-f1f45453ff65",
      "type": "actionSelected",
      "annotationId": "5ab26886e4b060b1da247632",
      "updatedBy": "d76b3ac0-8f0a-1028-9874-db07163b51b2",
      "created": 1521641606055
    },
    "spaceName": "ScottsSpace",
    "messageId": "5ab26886e4b060b1da247631",
    "appEvent": true,
    "time": "Wed Mar 21 2018 14:13:27 GMT+0000 (UTC)",
    "userId": "d76b3ac0-8f0a-1028-9874-db07163b51b2",
    "type": "message-annotation-added",
    "annotationId": "5ab26886e4b060b1da247632",
    "limit": 10,
    "spaceId": "582754d0e4b0037e37b25ff5",
    "userName": "Scott Chapman",
    "annotationType": "actionSelected"
  },
  "cards": [
    {
      "subtitle": "Special Event",
      "text": "Invitation for Scott Chapman",
      "buttons": [
        {
          "text": "Invite",
          "payload": {
            "member": {
              "id": "d76b3ac0-8f0a-1028-9874-db07163b51b2",
              "email": "scottchapman@us.ibm.com",
              "displayName": "Scott Chapman"
            },
            "response": {
              "title": "Invited!",
              "text": "You've invited Scott Chapman."
            }
          },
          "style": "PRIMARY"
        }
      ],
      "title": "Invitation",
      "type": "INFORMATION"
    }
  ]
}

var tokenResponse = JSON.parse(fs.readFileSync("../data/token.json"));
var response = JSON.parse(fs.readFileSync("../data/targeted_message.json"));

var stub = sinon.stub();
stub.withArgs().returns({
  actions: {
    invoke: function (obj) {
      return Promise.resolve(tokenResponse)}
  }
});
graphQL.setOpenwhisk(stub);

process.env.__OW_ACTION_NAME = "/scottchapman@us.ibm.com_WskDeploy/WatsonWorkspace/SendMessage";

describe('TargetedMessage', function() {
  describe('main - TargetedMessage', function() {
    it('should return successfully send targetted message', function() {
        var auth = nock("https://api.watsonwork.ibm.com")
          .post("/graphql")
          .reply(200,response);
        return graphQL.main(message).then(resp => {
            resp.should.be.deep.equal(response);
        })
    });
  });
});
