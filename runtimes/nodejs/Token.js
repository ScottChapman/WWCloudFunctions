/*
 */

var request = require('request');
const {promisify} = require('util');

var currentToken;
var tokenExpiration = 0;

function main(params) {
  if (tokenExpiration < Date.now())
    return refresh(params);
  else
    return Promise.resolve({
      jwt: currentToken,
      source: "cache"
    });
}

async function refresh(params) {
  var postPromise = promisify(request.post);
  var res = await postPromise('https://api.watsonwork.ibm.com/oauth/token', {
    auth: {
      user: params.WatsonWorkspace.AppId,
      pass: params.WatsonWorkspace.AppSecret
    },
    json: true,
    form: {
      grant_type: 'client_credentials'
    }
  });
  currentToken = res.body.access_token;
  tokenExpiration = Date.now() + ((res.body.expires_in - 2) * 1000);
  return {
    source: "refresh",
    jwt: currentToken
  };
}

exports.main = main;
exports.reset = function() { tokenExpiration = 0; }
