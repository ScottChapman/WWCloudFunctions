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
import spray.json._

@RunWith(classOf[JUnitRunner])
class WatsonWorkTests extends TestHelpers
    with WskTestHelpers
    with BeforeAndAfterAll {

    implicit val wskprops = WskProps()
    val wsk = new Wsk()
    val wskrest = new WskRest

    behavior of "WatsonWorkspace Package"

    override def beforeAll() {
      println(System.getProperty("user.dir"))
      val WatsonWorkspaceParams = JsObject(
        "AppInfo" -> JsObject(
          "AppId" -> JsString("e798f199-42f2-4323-b96f-63467945e0db"),
          "AppSecret" -> JsString("Nkm73mdP1wYmHk2xsVBKoNV3xgtk"),
          "WebhookSecret" -> JsString("nuqv9td7ohgva2g6ewwolqhkc04hvdep")
        ),
       "OwnEventTrigger" -> JsString("WWOwnEvent"),
       "ActionSelected" -> JsString("WWActionSelected"),
       "ButtonSelected" -> JsString("WWButtonSelected"),
       "OthersEventTrigger" -> JsString("WWOthersEvent"),
         "ButtonSelectedPrefix" -> JsString("BUTTON_SELECTED: ")
      )

      println("WatsonWorkspace Package Create")
      var resp = wskrest.pkg.create("WatsonWorkspace", Map("WatsonWorkspace" -> WatsonWorkspaceParams))
      println(resp.statusCode)

      println("Token Action Create")
      val tokenFile = Some(new File("..", "Token.js").toString());
      resp = wskrest.action.create(
        "WatsonWorkspace/Token",
        tokenFile,
        main = Some("main"),
        docker = Some("ibmfunctions/action-nodejs-ibm-v8")
      )
      println(resp.statusCode)
    }

    override def afterAll() {
      var resp = wskrest.pkg.delete("WatsonWorkspace");
      println("Delete WatsonWorkspace Package")
      println(resp.statusCode)

      resp = wskrest.action.delete("WatsonWorkspace/Token");
      println("Delete Token Action")
      println(resp.statusCode)
    }

    behavior of "Watson Work Template"

    /**
     * Test the nodejs "Watson Work" template
     */

     it should "invoke Token.js and get the result" in withAssetCleaner(wskprops) { (wp, assetHelper) =>
       /*
       val name = "WatsonWorkspace/Token"
       val file = Some(new File("..", "Token.js").toString());
       assetHelper.withCleaner(wsk.action, name) { (action, _) =>
         action.create(
           name,
           file,
           main = Some("main"),
           docker = Some("ibmfunctions/action-nodejs-ibm-v8")
         )
       }
       */

       println("Running token test")
       withActivation(wsk.activation, wsk.action.invoke("WatsonWorkspace/Token")) { activation =>
         val response = activation.response
         response.result.get.fields.get("jwt") should not be empty
         println("Got response back")
         println(response.result.get.fields.get("jwt"))
       }
     }
}
