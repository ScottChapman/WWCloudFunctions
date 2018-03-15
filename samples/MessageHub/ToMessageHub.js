/*
 * This action will simple take the input and produce it on an IBM Message Hub.
 * Include your credentials below, and specify the event topic to publish on.
 */

var openwhisk = require('openwhisk');
var _ = require("lodash");

function main(params) {
    var ow = openwhisk();
    return ow.actions.invoke({
       name: '/whisk.system/messaging/messageHubProduce',
       params: {
           topic: params.IBMMessageHub.Topic,
           value: JSON.stringify(_.omit(params,"IBMMessageHub")),
           kafka_brokers_sasl: params.IBMMessageHub.Credentials.kafka_brokers_sasl,
           user: params.IBMMessageHub.Credentials.user,
           password: params.IBMMessageHub.Credentials.password,
           blocking: true
       }
    });
}
