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
import java.io._
import spray.json.DefaultJsonProtocol.StringJsonFormat
import spray.json.pimpAny

@RunWith(classOf[JUnitRunner])
class WatsonWorkTests extends TestHelpers
    with WskTestHelpers
    with BeforeAndAfterAll {

    implicit val wskprops = WskProps()
    val wsk = new Wsk()

    behavior of "Watson Work Template"

    /**
     * Test the nodejs "Watson Work" template
     */
     it should "invoke Token.js and get the result" in withAssetCleaner(wskprops) { (wp, assetHelper) =>
       val name = "Token"
       val file = Some(new File(".", "Token.js").toString());
       assetHelper.withCleaner(wsk.action, name) { (action, _) =>
         action.create(name, file)
       }

       // val params = Map("WatsonWorkspace" -> "Red", "name" -> "Kat").mapValues(_.toJson)
       val params = Map("WatsonWorkspace" ->
         Map("AppInfo" ->
            Map("AppId" -> "e798f199-42f2-4323-b96f-63467945e0db",
                "AppSecret" -> "Nkm73mdP1wYmHk2xsVBKoNV3xgtk",
                "WebhookSecret" -> "nuqv9td7ohgva2g6ewwolqhkc04hvdep"
            ),
           "OwnEventTrigger" -> "WWOwnEvent",
           "ActionSelected" -> "WWActionSelected",
           "ButtonSelected" -> "WWButtonSelected",
           "OthersEventTrigger" -> "WWOthersEvent",
           "ButtonSelectedPrefix" -> "BUTTON_SELECTED: "
            )
          ).mapValues(_.toJson);

       withActivation(wsk.activation, wsk.action.invoke(name, params)) {
         System.out.println(_.response.result.get.toString);
         _.response.result.get.toString should include("Mindy")
       }
     }
}
