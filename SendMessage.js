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

function main(message) {
  return new Promise(function(success, failure) {
    var ow = openwhisk(
        _.get(message,"WatsonWorkspace.OWArgs",{})
    );
    ow.actions.invoke({
      name: 'WatsonWorkspace/Token',
      blocking: true
    }).then(token => {
      request.post(
        'https://api.watsonwork.ibm.com/v1/spaces/' + message.spaceId + '/messages', {
          headers: {
            Authorization: 'Bearer ' + token.response.result.jwt
          },
          json: true,
          body: {
            type: 'appMessage',
            version: 1.0,
            annotations: [{
              type: 'generic',
              version: 1.0,
              color: '#6CB7FB',
              title: message.title,
              text: message.text,
              actor: {
                name: 'IBM Cloud Function Bot',
              }
            }]
          }
        }, (err, res) => {
          if (err || res.statusCode !== 201) {
            failure(res.statusCode);
          }
          success(res.body);
        });
    }).catch(err => {
      failure(err);
    })
  })
}
