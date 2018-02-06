/*
 * This action will simple take the input and produce it on an IBM Message Hub.
 * Include your credentials below, and specify the event topic to publish on.
 */

/*
 * Customize below
 */
var credentials = /* Paste your IBM MessageHub credentials here */
var EventTopic = "WWEvents";
/*
 * End customization
 */

var openwhisk = require('openwhisk');

function main(params) {
    var ow = openwhisk();
    return ow.actions.invoke({
       name: '/whisk.system/messaging/messageHubProduce',
       params: {
           topic: params.IBMMessageHub.EventTopic,
           value: JSON.stringify(params),
           kafka_brokers_sasl: params.IBMMessageHub.Credentials.kafka_brokers_sasl,
           user: params.IBMMessageHub.Credentials.user,
           password: params.IBMMessageHub.Credentials.password,
           blocking: false
       }
    });
}
