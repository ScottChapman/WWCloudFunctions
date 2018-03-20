var util = require('util');
var openwhisk = require('openwhisk');
var _ = require ('lodash');

/*
 * takes an array of cards which looks like:
  {
    type: 'INFORMATION',
    title: <string>,
    subtitle: <string>,
    text: <string>,
    date: <string>,
    buttons: [
      {
        text: <string>,
        payload: <string>,
        style: 'PRIMARY' || 'SECONDARY'
      }
    ]
  }
 */

function generateCards(cards, prefix) {
  if (!cards.hasOwnProperty("length"))
    cards = [cards];
  var results = [];
  cards.forEach(card => {
    var buttonArray = [];
    card.buttons.forEach(button => {
      var payload = button.payload;
      if (typeof button.payload === "object")
        payload = JSON.stringify(button.payload).replace(/\"/g,"\\\"");
      buttonArray.push(util.format(`{
                            text: "%s",
                            payload: "%s",
                            style: %s
                        }`,button.text,prefix + payload,button.style));
    })
    results.push(util.format(`{
      type: CARD,
      cardInput: {
          type: %s,
          informationCardInput: {
              title: "%s",
              subtitle: "%s",
              text: "%s",
              date: "%s",
              buttons:  %s
          }
      }
    }`, card.type, card.title, card.subtitle, card.text, Date.now(), '[' + buttonArray.join(', ') + ']'));
  });
  return results;
}

function samePackage(action) {
  return (process.env.__OW_ACTION_NAME.replace(/\/[^\/]+$/,"") + "/" + action).replace(/^\/[^\/]+\//,"");
}

function main(params) {
  var cards = generateCards(params.cards,"BUTTON_SELECTED: ");
  var annotation = params.annotation;
  var ow = openwhisk(
    _.get(params,"WatsonWorkspace.OWArgs",{})
  );

  return ow.actions.invoke({
      name: samePackage("GraphQL"),
      params: {
        string: util.format(`mutation {
          createTargetedMessage(input: {
            conversationId: "%s"
            targetUserId: "%s"
            targetDialogId: "%s"
            attachments: %s
          }) {
            successful
          }
        }`, annotation.annotationPayload.conversationId, annotation.userId, annotation.annotationPayload.targetDialogId, cards)
      }
  });
}

exports.main = main;
exports.setOpenwhisk = function(obj) {
  openwhisk = obj;
}
