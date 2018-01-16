# WWCloudFunctions

To get started I recommend creating a new space in your organization. Here are some steps you can use to prepare for deploying this application. This is optional, if you already have a space you want to use simple use the [Bluemix CLI](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started) to set your target.
1. Install [Cloud Functions CLI](https://console.bluemix.net/openwhisk/learn/cli)
1. Run `bx cf create-space WWEchoApp` to create a new space. It will return a `cf` command to set your target to your new space. You'll just want to add `bx` to the front of it since `cf` is a subcommand of `bx`

To create a very basic application, one that will simple recieve events from Watson Workspace and make them available to IBM Cloud Functions via a trigger follow these steps:
1. Create your application in [Watson Workspace Developer](https://developer.watsonwork.ibm.com/apps)> Be sure to copy your Application ID and Application Secret.
1. Edit the the PackageParameters.json file with your app's values. For now just put in your Application ID and Secret; we'll add to it later with the Webhook Secret.
1. Next you'll want to create the package for the Watson Workspace actions along with parameters for your Watson Workspace App information `bx wsk package create WatsonWorkspace -P PackageParameters.json` (if you need to change any of the values simply run `bx wsk package update WatsonWorkspace -P PackageParameters.json`)
1. Create the main WebHook action `bx wsk action create WatsonWorkspace/WWWebHook WWWebHook.js --web raw --kind nodejs:8`
1. Get the Web Action URL `bx wsk action get WatsonWorkspace/WWWebHook --url`
1. Paste this into your App as your Webhook URL. NOTE: URL decode any coding (e.g. change %40 => @). Add the Webhook Secret to your PackageParmeters.json and update with `bx wsk package update WatsonWorkspace -P PackageParameters.json`.
1. Lastly create the trigger for out events. This is defined in the `PackageParameters.js`. `bx wsk trigger create WWEvent`

This example also includes IBM Cloud Functions for sending messages and running GraphQL commands for more advanced applications. To deploy those follow these steps:
1. First deploy the WWToken action `bx wsk action create WatsonWorkspace/WWToken WWToken.js --kind nodejs:8`
1. To deploy the SendMessage function run `bx wsk action create WatsonWorkspace/WWSendMessage WWSendMessage.js --kind nodejs:8`
1. To deploy the GraphQL function fun `bx wsk action create WatsonWorkspace/WWGraphQL WWGraphQL.js --kind nodejs:8`

To put this all together to create a simple Echo application (an application which listens for a specific message and returns a response message to the same space) do the following:
1. Create the Echo function `bx wsk action create WWEcho WWEcho.js --kind nodejs:8`
1. Create a sequence that passes the results to the Echo function, and then passes results to the send message action `bx wsk action create WWEchoBot --sequence WWEcho,WatsonWorkspace/WWSendMessage`
1. Then create a rule that links the events from WWEvent to the WWEchoBot `bx wsk rule create RunEchoBot WWEvent WWEchoBot`

Similarly, if you just want to publish the events onto a IBM Message Hub (Kafka) topic you can:
1. Add the IBM Message Hub service to your space.
1. Be sure to copy the service credentials, you'll want to paste them into the IBMMessageHubCredentials.json file.
1. Create a new package that will contain the parameters for the integration `bx wsk package update WWMessageHub -P IBMMessageHubCredentials.json`
1. Then create the action `bx wsk action create WWMessageHub/WWToMessageHub WWToMessageHub.js --kind nodejs:8`
1. Create rule to associate trigger with action `bx wsk rule create WWPublishToMessageHub WWEvent WWMessageHub/WWToMessageHub`
1. Don't forget to create the topic (default is WWEvents) in your message hub!
