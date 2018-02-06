# Simple Echo App

## Sample Echo Application
To put this all together to create a simple Echo application (an application which listens for a specific message and returns a response message to the same space) do the following:
- Create the Echo function
  - `bx wsk action create WWEcho WWEcho.js --kind nodejs:8`
- Create a sequence that passes the results to the Echo function, and then passes results to the send message action
  - `bx wsk action create WWEchoBot --sequence WWEcho,WatsonWorkspace/SendMessage`
- Then create a rule that links the events from WWOtherEvent to the WWEchoBot
  - `bx wsk rule create RunEchoBot WWOtherEvent WWEchoBot`

## Wskdeploy
- Simply run `wskdeploy`
