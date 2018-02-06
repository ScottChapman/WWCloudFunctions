# Echo Action Fullfilment Example
This is an example of an application that leverages [Action Fullfilment](https://developer.watsonwork.ibm.com/docs/tutorials/action-fulfillment). A great way to get familiar with this is to use [Slash Commands](https://developer.watsonwork.ibm.com/docs/tutorials/slash-commands). This application listens for action selected events, and responds with a set of Action Fullfilment Cards for the user to interact with.
- In your Watson Workspace Application Configuration, go to the "Add Action" section and add the action you want to respond to.
- they deploy using either option below

## Sample Echo Application
This is a simple application which listens for Action
- Create the Echo function
  - `bx wsk action create WWEcho WWEcho.js --kind nodejs:8`
- Create a sequence that passes the results to the Echo function, and then passes results to the send message action
  - `bx wsk action create WWEchoBot --sequence WWEcho,WatsonWorkspace/SendMessage`
- Then create a rule that links the events from WWActionSelected to the WWEchoBot
  - `bx wsk rule create RunEchoBot WWActionSelected WWEchoBot`


## Wskdeploy
- Simply run `wskdeploy`
