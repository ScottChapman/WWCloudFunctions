/*
 */

var request = require('request');

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

function refresh(params) {
  return new Promise((resolve, reject) => {
    request.post('https://api.watsonwork.ibm.com/oauth/token', {
      auth: {
        user: params.WatsonWorkspace.AppId,
        pass: params.WatsonWorkspace.AppSecret
      },
      json: true,
      form: {
        grant_type: 'client_credentials'
      }
    }, (err, res) => {
      if (err || res.statusCode !== 200) {
        reject(err || res);
      } else {
        currentToken = res.body.access_token;
        tokenExpiration = Date.now() + res.body.expires_in;
        resolve({
          source: "refresh",
          jwt: currentToken
        });
      }
    })
  });
}

exports.main = main;
exports.reset = function() { tokenExpiration = 0; }
