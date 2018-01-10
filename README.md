# WWCloudFunctions

Steps for basic events:
1. create WWWebhooks action. This will be the main webhook end point for your Watson Workspace App. It will take care of performing the authentication handshake and validate all requests coming in. It will in turn produce all events to a Trigger specified in the source code.
  1. copy the source code and paste into a new action called "WWWebhooks".
  2. in the "Endpoints" for the action, be sure to "Enable as Web Action" and "Raw HTTP handling"
  3. copy the rest API end point. You will use this as the WebHooks endpoint in your Watson Workspace App.
  4. edit the source code and copy in your Watson Workspace app's AppId, AppSecret, and Webhook Secret.
1. Create a trigger for the events (the action above defaults to "WWEvents")

To also publish events to IBM Message Hub:
1. Create IBM Message Hub service in the same space you are using for your cloud functions.
1. Copy source code from WWToMessageHub.js into a new Action
1. Copy the credentials for your IBM Message Hub to the source code for the Action.
2. By default it will publish to a topic called WWEvents
1. Edit the WWEvents trigger from above, and associate the new Action to it.
