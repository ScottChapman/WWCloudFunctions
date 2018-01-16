/*
 * This is a Webhook End-point for Watson Workspace. You will need to modify the credentials below
 * to contain the actual credentials for your Watson Workspace App.
 *
 * This action will perform all the necesary validation and hand-shaking to Watson Work Services.
 * Actual events will be published on the EventTrigger trigger
 * The following package parameters are used:
 * WWAppId - The Watson Workspace appId
 * WWAppSecret - The Watson Workspace App AppSecret
 * WWWebhookSecret - The Watson Workspace Webhook Secret
 * WWEventTopic - The name of the topic to send events to
 */

 var crypto = require('crypto');
 var openwhisk = require('openwhisk');

 function main(params) {
     return new Promise((resolve,reject) => {
       console.dir(params);
       var ow = openwhisk();
       var req = {
           rawBody: Buffer.from(params.__ow_body,'base64').toString(),
           body: JSON.parse(Buffer.from(params.__ow_body,'base64').toString()),
           headers: params.__ow_headers
       }
       console.dir(req);
       if (!validateSender(params,req)) {
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
           var validationToken = crypto.createHmac('sha256', params.WatsonWorkspace.AppInfo.WebhookSecret).update(strBody).digest('hex');
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
               console.dir(req.body);
               req.body.myEvent = req.body.userId === params.WatsonWorkspace.AppInfo.AppId;
               ow.triggers.invoke({
                   name: params.WatsonWorkspace.EventTrigger,
                   params: req.body})
               .then(result => {
                   resolve({
                     statusCode: 200,
                     headers: {
                         'Content-Type': 'application/json'
                     },
                     body: {status: "OK!"}
                   });
                 })
               .catch(err => {
                 reject({
                     statusCode: 401,
                     body: "Error firing trigger"
                 });
               });
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


 function validateSender(params,req) {
     var ob_token = req.headers['x-outbound-token'];
     var calculated = crypto.createHmac('sha256',params.WatsonWorkspace.AppInfo.WebhookSecret).update(req.rawBody).digest('hex')
     return ob_token == calculated;
 }
