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
  string: "query {message(id: \"5ab264b8e4b0d55dce2190ad\") {content id created createdBy {displayName id emailAddresses photoUrl}}}"
}

var tokenResponse = JSON.parse(fs.readFileSync("../data/token.json"));
var queryResponse = JSON.parse(fs.readFileSync("../data/graphql_response.json"));

var stub = sinon.stub();
stub.withArgs().returns({
  actions: {
    invoke: function (obj) {
      return Promise.resolve(tokenResponse)}
  }
});
graphQL.setOpenwhisk(stub);

process.env.__OW_ACTION_NAME = "/scottchapman@us.ibm.com_WskDeploy/WatsonWorkspace/SendMessage";

describe('GraphQL', function() {
  describe('main - GraphQL', function() {
    it('should return data', function() {
        var auth = nock("https://api.watsonwork.ibm.com")
          .post("/graphql")
          .reply(200,queryResponse);
        return graphQL.main(message).then(resp => {
            resp.should.be.deep.equal(queryResponse);
        })
    });
  });
});
