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
    var ow = openwhisk();
    if (request.annotationPayload.actionId.startsWith("/invite")) {
      ow.actions.invoke({
        name: "WatsonWorkspace/GraphQL",
        blocking: true,
        params: {
          string: mustache.render(`{
            space(id: "{{spaceId}}") {
              members(first: {{limit}}) {
                items {
                  id
                  email
                  displayName
                }
              }
            }
          }`,request)
        }
      }).then(resp => {
        var spaceMembers =_.remove(resp.response.result.data.space.members.items,"email")
        var cards = [];
        spaceMembers.forEach(member => {
          cards.push({
            type: 'INFORMATION',
            title: 'Invitation',
            subtitle: "Special Event",
            text: "Invitation for " + member.displayName,
            buttons: [
              {
                text: "Invite",
                payload: {
                  member: member,
                  response: {
                    title: "Invited!",
                    text: "You've invited " + member.displayName + "."
                  }
                },
                style: 'PRIMARY'
              }
            ]
          })
        })
        resolve({
          annotation: request,
          cards: cards
        });
      }).catch(err => {
        reject(err);
      })
    }
  })
};
