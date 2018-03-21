var crypto = require("crypto");
var sinon = require("sinon");
var fs = require("fs");

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

var tokenResponse = JSON.parse(fs.readFileSync("../data/token.json"));

var actions = {
  "WatsonWorkspace/Token": tokenResponse
}

function InvokeAction(obj) {
  return Promise.resolve(actions[obj.name]);
}

var stub = sinon.stub();
stub.withArgs().returns({
  actions: {
    invoke: InvokeAction
  }
});

exports.addAction = function(action, obj) {
  actions[action] = obj;
}

exports.openWhiskStub = stub;
