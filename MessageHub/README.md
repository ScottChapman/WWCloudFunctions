# Message Hub Integration

## Create your service
- Add the IBM Message Hub service to your space.
- Be sure to copy the service credentials, you'll want to paste them into the IBMMessageHubCredentials.json file.

## Publish events to IBM Message Hub
- Create a new package that will contain the parameters for the integration
  - `bx wsk package update WWMessageHub -P IBMMessageHubCredentials.json`
- Then create the action
  - `bx wsk action create WWMessageHub/ToMessageHub ToMessageHub.js --kind nodejs:8`
- Create rule to associate trigger with action
  - `bx wsk rule create PublishToMessageHub WWApplicationEvents WWMessageHub/ToMessageHub`
  - `bx wsk rule create PublishToMessageHub WWWebhookEvents WWMessageHub/ToMessageHub`
- Don't forget to create the topic (default is WWEvents) in your message hub!

## Deploy with `wskdeploy`
- Run `wskdeploy`
