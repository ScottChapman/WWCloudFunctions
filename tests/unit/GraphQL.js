var should = require("chai").should();
var fs = require("fs");
var graphQL = require("../../runtimes/nodejs/GraphQL.js");
var nock = require("nock");
var openwhisk = require("openwhisk");
var utils = require("./utils/Util.js");

var message = {
  WatsonWorkspace: {
    AppId: "some_id",
    AppSecret: "some_secret"
  },
  string: "query {message(id: \"5ab264b8e4b0d55dce2190ad\") {content id created createdBy {displayName id emailAddresses photoUrl}}}"
}

var queryResponse = JSON.parse(fs.readFileSync("../data/graphql_response.json"));

graphQL.setOpenwhisk(utils.openWhiskStub);

process.env.__OW_ACTION_NAME = "/scottchapman@us.ibm.com_WskDeploy/WatsonWorkspace/GraphQL";

describe('GraphQL', function() {
  describe('main - GraphQL', function() {
    it('String response should return data', function() {
        utils.reject(false);
        var auth = nock("https://api.watsonwork.ibm.com")
          .post("/graphql")
          .once()
          .reply(200,queryResponse);
        return graphQL.main(JSON.stringify(message)).then(resp => {
            resp.should.be.deep.equal(queryResponse);
        })
    });

    it('Object response should return data', function() {
        utils.reject(false);
        var auth = nock("https://api.watsonwork.ibm.com")
          .post("/graphql")
          .once()
          .reply(200,queryResponse);
        return graphQL.main(message).then(resp => {
            resp.should.be.deep.equal(queryResponse);
        })
    });

    it('should return failure', function() {
        utils.reject(false);
        var auth = nock("https://api.watsonwork.ibm.com")
          .post("/graphql")
          .once()
          .reply(401,{errors: {text: "just went bad"}});
        return graphQL.main(message).catch(resp => {
            resp.text.should.be.deep.equal("just went bad");
        })
    });

    it('should fail on bad token', function() {
        utils.reject(true);
        return graphQL.main(message).catch(resp => {
            resp.message.should.equal("Bad credentials");
        })
    });
  });
});
