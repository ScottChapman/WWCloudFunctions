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

function main(query) {
  return new Promise(function(success, failure) {
    var ow = openwhisk();
    ow.actions.invoke({
      name: 'WatsonWorkspace/WWToken',
      blocking: true
    }).then(token => {
      request.post(
        'https://api.watsonwork.ibm.com/graphql', {
          headers: {
            'Content-Type': 'application/graphql',
            'Authorization': 'Bearer ' + token.response.result.jwt,
            'x-graphql-view': 'ACTIONS,PUBLIC'
          },
          body: query.string
        }, (err, response) => {
          if (response.hasOwnProperty("body") && typeof response.body === "string")
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
