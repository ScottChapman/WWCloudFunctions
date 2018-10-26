var crypto = require("crypto");
var sinon = require("sinon");
var fs = require("fs");

exports.decodeBody = function(body) {
  return JSON.parse(Buffer.from(body, "base64").toString());
}

exports.generateEvent = function(body,params) {
  var message = {
    WatsonWorkspace: params,
    __ow_method: "post",
    __ow_query: "",
    __ow_headers: {
    }
  }
  var rawBody = JSON.stringify(body);
  message.__ow_body = Buffer.from(rawBody).toString("base64");
  message.__ow_headers["x-outbound-token"] = crypto.createHmac("sha256", message.WatsonWorkspace.WebhookSecret).update(rawBody).digest("hex");
  return(message);
}

var tokenResolveResponse = JSON.parse(fs.readFileSync(__dirname + "/../../data/token.json"));
var tokenRejectResponse = JSON.parse(fs.readFileSync(__dirname + "/../../data/failed_auth.json"));

var resolveActions = {
  "WatsonWorkspace/Token": tokenResolveResponse
}

var rejectActions = {
  "WatsonWorkspace/Token": tokenRejectResponse
}

var reject = false;
function InvokeAction(obj) {
  if (reject)
    return Promise.reject(rejectActions[obj.name]);
  else
    return Promise.resolve(resolveActions[obj.name]);
}

function InvokeTrigger(obj) {
  if (reject)
    return Promise.reject({status: "failed"});
  else
    return Promise.resolve({status: "success"});
}


var stub = sinon.stub();
stub.withArgs().returns({
  actions: {
    invoke: InvokeAction
  },
  triggers: {
    invoke: InvokeTrigger
  }
});

exports.addResolveAction = function(action, obj) {
  resolveActions[action] = obj;
}

exports.addRejectAction = function(action, obj) {
  rejectActions[action] = obj;
}

exports.openWhiskStub = stub;

exports.reject = function(rej) {
  reject = rej;
}
