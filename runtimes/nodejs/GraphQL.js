/**
 *
 * Performs a GraphQL call

 * The inbound params should contain the following properties:
 * string - string - the GraphQL text to execute
 *
 * The results are the body of the GraphQL response.
 *
 */

var openwhisk = require('openwhisk');
var request = require('request');
const {promisify} = require('util');
var _ = require('lodash');

function samePackage(action) {
  // return (process.env.__OW_ACTION_NAME.replace(/\/[^\/]+$/,"") + "/" + action).replace(/^\/[^\/]+\//,"");
  return "WatsonWorkspace/" + action;
}

async function main(query) {
  var postPromise = promisify(request.post)
  var ow = openwhisk(
      _.get(query,"WatsonWorkspace.OWArgs",{})
  );
  var token = await ow.actions.invoke({
    name: samePackage('Token'),
    result: true,
    blocking: true
  });
  var response = await postPromise(
    'https://api.watsonwork.ibm.com/graphql', {
      headers: {
        'Content-Type': 'application/graphql',
        'Authorization': 'Bearer ' + token.jwt,
        'x-graphql-view': 'TYPED_ANNOTATIONS,BETA,PUBLIC'
      },
    body: query.string
  });
  response.body = JSON.parse(response.body);
  return response.body;
}

exports.main = main;
exports.setOpenwhisk = function(obj) {
  openwhisk = obj;
}
