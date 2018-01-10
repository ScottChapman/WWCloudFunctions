/*
 * This is a Webhook End-point for Watson Workspace. You will need to modify the credentials below
 * to contain the actual credentials for your Watson Workspace App.
 *
 * This action will perform all the necesary validation and hand-shaking to Watson Work Services.
 * Actual events will be published on the EventTrigger trigger (which can be configued below)
 */

/*
 * Customize below
 */
var WWCredentials = {
  webhookSecret: "XXXX",
  appId: 'XXXXX',
  appSecret: 'XXXXX'
}

var EventTrigger = "WWEvent";
/*
 * End customization
 */

var crypto = require('crypto');
var openwhisk = require('openwhisk');
var request = require('request');
var currentToken;
var tokenExpiration = 0;

function main(params) {
    return new Promise((resolve,reject) => {
      var ow = openwhisk();
      var req = {
          rawBody: Buffer.from(params.__ow_body,'base64').toString(),
          body: JSON.parse(Buffer.from(params.__ow_body,'base64').toString()),
          headers: params.__ow_headers
      }
      if (!validateSender(req)) {
          reject({
              statusCode: 401,
              body: "Invalid Request Signature"
          });
      }
      if (req.body.hasOwnProperty("type") && req.body.type === 'verification') {
          var body = {
              response: req.body.challenge
          };
          var strBody = JSON.stringify(body);
          var validationToken = crypto.createHmac('sha256', WWCredentials.webhookSecret).update(strBody).digest('hex');
          resolve({
              statusCode: 200,
              headers: {
                  'Content-Type': 'text/plain; charset=utf-8',
                  'X-OUTBOUND-TOKEN': validationToken
              },
              body: strBody
          });
      }
      else {
          if (req.body.hasOwnProperty("content") && req.body.content.length > 0) {
              token().then(token => {
                  ow.triggers.invoke({
                  name: EventTrigger,
                  params: {
                      jwt: token,
                      event: req.body
                  }}).then(result => {
                      resolve({
                          statusCode: 200,
                           headers: {
                              'Content-Type': 'application/json'
                          },
                          body: {status: "OK!"}
                      });
                  }).catch(err => {
                    reject({
                        statusCode: 401,
                        body: "Error firing trigger"
                    });
                  });
              }).catch(err => {
                  reject({
                      statusCode: 401,
                      body: "Error getting token"
                  });
              })
          }
          else {
            resolve({
                statusCode: 200,
                    headers: {
                    'Content-Type': 'application/json'
                },
                body: {status: "Nothing to process"}
            });
          }
      }
    })
}


function validateSender(params) {
    var ob_token = params.headers['x-outbound-token'];
    var calculated = crypto.createHmac('sha256',WWCredentials.webhookSecret).update(params.rawBody).digest('hex')
    return ob_token == calculated;
}

function expires(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  var object = JSON.parse(Buffer.from(base64,'base64').toString());
  return object.exp * 1000;
};

function refresh() {
  return new Promise((resolve, reject) => {
    request.post('https://api.watsonwork.ibm.com/oauth/token', {
      auth: {
        user: WWCredentials.appId,
        pass: WWCredentials.appSecret
      },
      json: true,
      form: {
        grant_type: 'client_credentials'
      }
    }, (err, res) => {
      if(err || res.statusCode !== 200) {
        reject(err || res);
      }
      else {
        currentToken = res.body.access_token;
        tokenExpiration = expires(currentToken);
        resolve(currentToken);
      }
    })
  });
}

function token() {
  if (tokenExpiration < Date.now())
    return refresh();
  else
    return new Promise((resolve,reject) => {
      resolve(currentToken);
    })
}
