/**
 *
 * This action will take an inbound message (that was not generated by this app)
 * and return a response message if the content matches specific criteria.
 *
 * The inbound params should contain the following properties:
 * spaceId - string - the target space for the new message
 * title - string - the title used for the new message
 * text: - string - the text for the new message
 *
 * Action returns the body of the create message REST call
 *
 */
var request = require('request');
var openwhisk = require('openwhisk');
var _ = require("lodash");
const {promisify} = require('util');

function samePackage(action) {
  return (process.env.__OW_ACTION_NAME.replace(/\/[^\/]+$/,"") + "/" + action).replace(/^\/[^\/]+\//,"");
}

async function main(message) {
  var postPromise = promisify(request.post);
  var ow = openwhisk(
      _.get(message,"WatsonWorkspace.OWArgs",{})
  );
  var token = await ow.actions.invoke({
    name: samePackage("Token"),
    result: true,
    blocking: true
  });
  var annotation = _.merge({
    type: 'generic',
    version: 1.0,
    color: '#6CB7FB',
    title: "title",
    text: "text",
    actor: {
      name: 'IBM Cloud Function Bot',
    }
  },_.omit(message,["spaceId","WatsonWorkspace"]));
  var res = await postPromise(
    'https://api.watsonwork.ibm.com/v1/spaces/' + message.spaceId + '/messages', {
      headers: {
        Authorization: 'Bearer ' + token.jwt
      },
      json: true,
      body: {
        type: 'appMessage',
        version: 1.0,
        annotations: [ annotation ]
      }
    }
  );
  return res.body;
}

exports.main = main;
exports.setOpenwhisk = function(obj) {
  openwhisk = obj;
}
