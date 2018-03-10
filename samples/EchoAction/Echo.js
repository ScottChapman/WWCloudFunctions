function main(params) {
  return new Promise((resolve,reject) => {

  if (params.annotationPayload.actionId.startsWith("/echo")) {
      resolve({
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
      })
    }
    else {
      reject({status: "Not an echo action"});
    }
  })
};
