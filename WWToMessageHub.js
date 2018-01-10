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
    console.dir(params);
    var ow = openwhisk();
    return ow.actions.invoke({
       name: '/whisk.system/messaging/messageHubProduce',
       params: {
           topic: EventTopic,
           value: JSON.stringify(params),
           kafka_brokers_sasl: credentials.kafka_brokers_sasl,
           user: credentials.user,
           password: credentials.password,
           blocking: false
       }
    });
}
