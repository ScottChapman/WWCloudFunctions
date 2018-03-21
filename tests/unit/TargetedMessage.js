var should = require("chai").should();
var fs = require("fs");
var graphQL = require("../../runtimes/nodejs/TargetedMessage.js");
var openwhisk = require("openwhisk");
var util = require("./utils/Util.js");

var message = JSON.parse(fs.readFileSync("../data/targeted_message.json"));

var tokenResponse = JSON.parse(fs.readFileSync("../data/token.json"));
var graphQLResp = JSON.parse(fs.readFileSync("../data/graphql_response.json"));
var response = JSON.parse(fs.readFileSync("../data/targeted_response.json"));

util.addAction("WatsonWorkspace/GraphQL", graphQLResp);

graphQL.setOpenwhisk(util.openWhiskStub);

process.env.__OW_ACTION_NAME = "/scottchapman@us.ibm.com_WskDeploy/WatsonWorkspace/TargetedMessage";

describe('TargetedMessage', function() {
  describe('main - TargetedMessage', function() {
    it('should return successfully send targetted message', function() {
        return graphQL.main(message).then(resp => {
            resp.should.be.deep.equal(response);
        })
    });
  });
});
