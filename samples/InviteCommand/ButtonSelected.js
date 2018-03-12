//
// Action Fulfillment of an invitation action.
//
// Input contains:
//   - spaceId: SpaceId the command was submitted in.
//   - limit: max number of invites to generate cards for (defaults to 10)
//

var openwhisk = require("openwhisk");
var mustache = require("mustache");
var _ = require("lodash");

function main(request) {
  return new Promise((resolve,reject) => {
    console.log(JSON.stringify(request,null,2));
    resolve({
      spaceId: request.spaceId,
      title: "Invitation",
      text: request.userName + " has invited " + request.annotationPayload.actionId.member.displayName
    });
  })
};
