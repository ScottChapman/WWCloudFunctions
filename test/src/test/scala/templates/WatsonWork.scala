/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package packages


import org.junit.runner.RunWith
import org.scalatest.BeforeAndAfterAll
import org.scalatest.junit.JUnitRunner
import common.{TestHelpers, Wsk, WskProps, WskTestHelpers}
import common.rest.WskRest
import java.io._

import org.apache.commons.codec.binary.Base64
import spray.json._
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import javax.xml.bind.DatatypeConverter
import DefaultJsonProtocol._


@RunWith(classOf[JUnitRunner])
class WatsonWorkTests extends TestHelpers
    with WskTestHelpers
    with BeforeAndAfterAll {

    implicit val wskprops = WskProps()
    val wsk = new Wsk()
    val wskrest = new WskRest

    behavior of "WatsonWorkspace Package"

override def beforeAll() {
  println("OpenWhisk Home")
  println(System.getenv("OPENWHISK_HOME"))

  var list = wskrest.activation
  println("CleanUp First");
  cleanUp();

  val WatsonWorkspaceParams = JsObject(
    "AppId" -> JsString(System.getenv("APP_ID")),
    "AppSecret" -> JsString(System.getenv("APP_SECRET")),
    "WebhookSecret" -> JsString(System.getenv("WEBHOOK_SECRET")),
    "OWArgs" -> JsObject(
      "ignore_certs" -> JsBoolean(true)
    )
  )

  println("WatsonWorkspace Package Create")
  var resp = wskrest.pkg.create("WatsonWorkspace", Map("WatsonWorkspace" -> WatsonWorkspaceParams))
  println(resp.statusCode)

  println("Token Action Create")
  val tokenFile = Some(new File("..", "runtimes/nodejs/Token.js").toString());
  resp = wskrest.action.create(
    "WatsonWorkspace/Token",
    tokenFile,
    main = Some("main"),
    docker = Some("ibmfunctions/action-nodejs-ibm-v8")
  )
  println(resp.statusCode)

  println("SendMessage Action Create")
  val sendMessageFile = Some(new File("..", "runtimes/nodejs/SendMessage.js").toString());
  resp = wskrest.action.create(
    "WatsonWorkspace/SendMessage",
    sendMessageFile,
    main = Some("main"),
    docker = Some("ibmfunctions/action-nodejs-ibm-v8")
  )
  println(resp.statusCode)

  println("Webhook Action Create")
  val webhookFile = Some(new File("..", "runtimes/nodejs/Webhook.js").toString());
  resp = wskrest.action.create(
    "WatsonWorkspace/Webhook",
    webhookFile,
    web = Some("raw"),
    main = Some("main"),
    docker = Some("ibmfunctions/action-nodejs-ibm-v8")
  )
  println(resp.statusCode)

  println("GraphQL Action Create")
  val graphQLFile = Some(new File("..", "runtimes/nodejs/GraphQL.js").toString());
  resp = wskrest.action.create(
    "WatsonWorkspace/GraphQL",
    graphQLFile,
    web = Some("raw"),
    main = Some("main"),
    docker = Some("ibmfunctions/action-nodejs-ibm-v8")
  )
  println(resp.statusCode)

  println("WWWebhookEvents Event Create")
  resp = wskrest.trigger.create("WWWebhookEvents")
  println(resp.statusCode)

  println("WWApplicationEvents Event Create")
  resp = wskrest.trigger.create("WWApplicationEvents")
  println(resp.statusCode)
}

def cleanUp() {

    try {
      var resp = wskrest.action.delete("WatsonWorkspace/Token");
      println("Delete Token Action")
      println(resp.statusCode)
    }
    catch {
      case e:Exception => {
        println(e);
      }
    }

    try {
      var resp = wskrest.action.delete("WatsonWorkspace/SendMessage");
      println("Delete SendMessage Action")
      println(resp.statusCode)
    }
    catch {
      case e:Exception => {
        println(e);
      }
    }

    try {
      var resp = wskrest.action.delete("WatsonWorkspace/Webhook");
      println("Delete Webhook Action")
      println(resp.statusCode)
    }
    catch {
      case e:Exception => {
        println(e);
      }
    }

    try {
      var resp = wskrest.action.delete("WatsonWorkspace/GraphQL");
      println("Delete GraphQL Action")
    println(resp.statusCode)
    }
    catch {
      case e:Exception => {
        println(e);
      }
    }

    try {
      var resp = wskrest.pkg.delete("WatsonWorkspace");
      println("Delete WatsonWorkspace Package")
      println(resp.statusCode)
    }
    catch {
      case e:Exception => {
        println(e);
      }
    }

    try {
      var resp = wskrest.trigger.delete("WWWebhookEvents");
      println("Delete WWWebHookEvents Trigger")
      println(resp.statusCode)
    }
    catch {
      case e:Exception => {
        println(e);
      }
    }

    try {
      var resp = wskrest.trigger.delete("WWApplicationEvents");
      println("Delete WWApplicationEvents Trigger")
      println(resp.statusCode)
    }
    catch {
      case e:Exception => {
        println(e);
      }
    }
  }

  override def afterAll() {
    cleanUp();
  }

  def encode(txt:String): String = {
    println("Encoding: " + txt)
    return new String(Base64.encodeBase64(txt.getBytes))
  }

  def decode(txt:String): String = {
    println("Decoding: " + txt)
    return new String(Base64.decodeBase64(txt))
  }


  def generateHMAC(preHashString: String): String = {
    val sharedSecret:String = System.getenv("WEBHOOK_SECRET")
    val secret = new SecretKeySpec(sharedSecret.getBytes, "HmacSHA256")   //Crypto Funs : 'SHA256' , 'HmacSHA1'
    val mac = Mac.getInstance("HmacSHA256")
    mac.init(secret)
    var output = mac.doFinal(preHashString.getBytes)
    DatatypeConverter.printHexBinary(output).toLowerCase
  }

  def validateRequest(request: JsObject): Boolean = {
    var token: String = generateHMAC(request.fields("rawBody").convertTo[String]);
    var expected: String = request.fields("headers").asJsObject.fields("x-outbound-token").convertTo[String]
    expected.equalsIgnoreCase(token)
  }

  def generateRequest(request: JsObject): Map[String,JsValue] = {
    var rawBody: String = request.compactPrint
    Map(
      "__ow_headers" -> JsObject(
        "x-outbound-token" -> JsString(generateHMAC(rawBody))
      ),
      "data" -> request,
      "__ow_body" -> JsString(encode(rawBody))
    )
  }

    behavior of "Watson Work Template"

    /**
     * Test the Token Action
     */

     it should "invoke Token.js and get the result" in withAssetCleaner(wskprops) { (wp, assetHelper) =>
       println("Running token test")
       withActivation(wskrest.activation, wskrest.action.invoke("WatsonWorkspace/Token")) { activation =>
         val response = activation.response
         response.result.get.fields.get("jwt") should not be empty
         println("Got response back")
         println(response.result.get.fields.get("jwt"))
       }
     }

  /**
    * Test the SendMessage action
    */

  it should "invoke SendMessage.js and get the result" in withAssetCleaner(wskprops) { (wp, assetHelper) =>
    println("Running SendMessage test")
    val message = Map(
      "spaceId" -> JsString("582754d0e4b0037e37b25ff5"),
      "title" -> JsString("From OW Test"),
      "text" -> JsString("This is a sample message!")
    )
    withActivation(wskrest.activation, wskrest.action.invoke("WatsonWorkspace/SendMessage",parameters = message)) { activation =>
      val response = activation.response
      activation.response.result.get.fields.get("id") should not be empty
      println("Got response back")
      println(activation.response.result.get.fields.get("id"))
    }
  }



  it should "invoke Webhook.js with authorization and get the result" in withAssetCleaner(wskprops) { (wp, assetHelper) =>
    var data: JsObject = JsObject(
      "type" -> JsString("verification"),
      "challenge" -> JsString("gfbhi1np1x6hwvtcr69l5cg04iv8xasl")
    )
    var request:Map[String,JsValue] = generateRequest(data);

    println("Running Webhook Authorization test")
    withActivation(wskrest.activation, wskrest.action.invoke("WatsonWorkspace/Webhook",parameters = request)) { activation =>
      val response = activation.response
      // val whatever = activation.response.result.get.fields("statusCode").convertTo[Int]
      activation.response.result.get.fields("statusCode").convertTo[Int] should equal (200)
      println("Got response back")
      println(activation.response.result.get.fields("statusCode"))
    }
  }

  it should "invoke Webhook.js with Message Added Event and get the result" in withAssetCleaner(wskprops) { (wp, assetHelper) =>
    var data: JsObject = JsObject(
      "spaceName" -> JsString("ScottSpace"),
      "spaceId" -> JsString("58822220e4b0192475567c93"),
      "messageId" -> JsString("5a95abd1e4b01e6e9ce0cee1"),
      "time" -> JsNumber(BigDecimal(1519758289517L)),
      "type" -> JsString("message-created"),
      "userName" -> JsString("Scott Chapman"),
      "userId" -> JsString("d76b3ac0-8f0a-1028-9874-db07163b51b2"),
      "contentType" -> JsString("text/markdown"),
      "content" -> JsString("do you know Joe Smith?")
    )
    var request:Map[String,JsValue] = generateRequest(data);

    println("Running Webhook Message Added Event")
    withActivation(wskrest.activation, wskrest.action.invoke("WatsonWorkspace/Webhook",parameters = request)) { activation =>
      val response = activation.response
      // val whatever = activation.response.result.get.fields("statusCode").convertTo[Int]
      activation.response.result.get.fields("statusCode").convertTo[Int] should equal (200)
      println("Got response back")
      println(activation.response.result.get.fields("statusCode"))
    }
  }

  it should "invoke Webhook.js with Annotation Added Event and get the result" in withAssetCleaner(wskprops) { (wp, assetHelper) =>
    var payload: JsObject = JsObject(
        "taxonomy" -> JsArray(Vector(
          JsObject(
            "confident" -> JsBoolean(false),
            "label" -> JsString("/shopping/toys/action figures"),
            "score" -> JsNumber(0.714851)
          ),
          JsObject(
            "confident" -> JsBoolean(false),
            "label" -> JsString("/art and entertainment/theatre/theatre awards"),
            "score" -> JsNumber(0.364781)
          ),
          JsObject(
            "confident" -> JsBoolean(false),
            "label" -> JsString("/sports/boxing"),
            "score" -> JsNumber(0.168129)
          )
        )
      )
    )
    var data: JsObject = JsObject(
      "spaceName" -> JsString("ScottSpace"),
      "spaceId" -> JsString("58822220e4b0192475567c93"),
      "messageId" -> JsString("5a95abd1e4b01e6e9ce0cee1"),
      "time" -> JsNumber(BigDecimal(1519758289517L)),
      "annotationPayload" -> JsString(payload.compactPrint),
      "annotationType" -> JsString("message-nlp-taxonomy"),
      "type" -> JsString("message-annotation-added"),
      "userName" -> JsString("Scott Chapman"),
      "userId" -> JsString("toscana-aip-nlc-consumer-client-id"),
      "contentType" -> JsString("text/markdown"),
      "content" -> JsString("do you know Joe Smith?")
    )
     var request:Map[String,JsValue] = generateRequest(data);

     println("Running Webhook Annotation Added Event")
     withActivation(wskrest.activation, wskrest.action.invoke("WatsonWorkspace/Webhook",parameters = request)) { activation =>
       val response = activation.response
       // val whatever = activation.response.result.get.fields("statusCode").convertTo[Int]
       activation.response.result.get.fields("statusCode").convertTo[Int] should equal (200)
       println("Got response back")
       println(activation.response.result.get.fields("statusCode"))
     }
   }

}
