# Invite Command Fullfilment Example
This is an example of an application that leverages [Action Fullfilment](https://developer.watsonwork.ibm.com/docs/tutorials/action-fulfillment). A great way to get familiar with this is to use [Slash Commands](https://developer.watsonwork.ibm.com/docs/tutorials/slash-commands). This application listens for action selected events, and responds with a set of Action Fullfilment Cards for the user to interact with. In this particular sample you will use a command called "/invite", it will then present you with a set of cards, one for each member of the space (limit 10). Each card will have a button you can press to invite that user.
- In your Watson Workspace Application Configuration, go to the "Add Action" section and add "/invite" as a command
- they deploy using either option below

## Sample Invite Command Application
This sample has two actions:
- CommandSelected - handles the event when the user triggers the action.
  - This is sequenced to **TargetedMessage** to generate the invitation cards for the user.
  - And there is a rule which send events from **WWActionSelected** to the sequence.
- ButtonSelected - handles the event when the user selects one of the buttons.
  - This is sequenced to **SendMessage** to tell everyone in the space that someone invited someone.
  - And there is a rule which send events from **WWButtonSelected** to the sequence.

## Wskdeploy
- Simply run `wskdeploy`
