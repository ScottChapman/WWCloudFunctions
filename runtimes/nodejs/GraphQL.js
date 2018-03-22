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
var _ = require('lodash');

function samePackage(action) {
  // return (process.env.__OW_ACTION_NAME.replace(/\/[^\/]+$/,"") + "/" + action).replace(/^\/[^\/]+\//,"");
  return "WatsonWorkspace/" + action;
}

function main(query) {
  return new Promise(function(success, failure) {
    var ow = openwhisk(
        _.get(query,"WatsonWorkspace.OWArgs",{})
    );
    ow.actions.invoke({
      name: samePackage('Token'),
      blocking: true
    }).then(token => {
      request.post(
        'https://api.watsonwork.ibm.com/graphql', {
          headers: {
            'Content-Type': 'application/graphql',
            'Authorization': 'Bearer ' + token.response.result.jwt,
            'x-graphql-view': 'TYPED_ANNOTATIONS,BETA,PUBLIC'
          },
          body: query.string
        }, (err, response) => {
          response.body = JSON.parse(response.body);
          if (err || response.statusCode !== 200 || response.body.hasOwnProperty("errors")) {
            failure(response.body.errors);
          } else {
            success(response.body);
          }
        });
    }).catch(err => {
      failure(err);
    });
  });
}

exports.main = main;
exports.setOpenwhisk = function(obj) {
  openwhisk = obj;
}
