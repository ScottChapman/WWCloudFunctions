var openwhisk = require('openwhisk');

function main(params) {
  var ow = openwhisk();

  if (params.annotationPayload.actionId.startsWith("/echo")) {
		return ow.actions.invoke({
      name: "WatsonWorkspace/TargetedMessage",
      params: {
  			annotation: params,
  			cards: {
          type: 'INFORMATION',
          title: 'My Title',
          subtitle: "My Substring",
          text: "My Text",
          buttons: [
            {
              text: "Prime Button",
              payload: "Something",
              style: 'PRIMARY'
            },
            {
              text: "Secondary Button",
              payload: {
                something: "something type",
                response: {
                  title: "Button Pressed",
                  text: "You've pressed the Secondary Button"
                }
              },
              style: 'SECONDARY'
            }
          ]
        }
  		}
  	})
  }
  else {
    return Promise.reject();
  }
};
