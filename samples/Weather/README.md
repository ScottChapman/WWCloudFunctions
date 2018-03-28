# Weather App
This is a simple application which demonstrates the various cognitive features in **Watson Work**. It will recognize some simple requests for weather information, and based on the information in the question will provide relevant weather information. The requests should contain:
- **location** - this is required. It's kinda impossible to give a forecast without knowing where!
- **date** - optional. Without any date it will provide the current conditions. With a date it will give the forecast for that day at that location provided it is within the 10-day forecast window.
- **date range** - optional. You can provide a date range (e.g. "today through tomorrow", "next week") and it will reply with forecasts for all the days between those dates within the 10-day forecast window.

To begin, you should have already deployed the [template runtime](runtimes/nodejs).

Once the template has been deployed and events are being processed, you'll need to train a Watson Assistant to understand questions about the weather:

- Create an instance of the [Watson Assistant Service](https://console.bluemix.net/docs/services/conversation/getting-started.html#gettingstarted).
- Import the [training file](WatsonAssistant) from this example.

## Train Watson Assistant
The Watson Assistant is not trained to understand some basic queries for weather conditions and forecasts. It will also look for locations and dates (including date ranges). This information will appear as [extractedInfo annotations](https://developer.watsonwork.ibm.com/docs/annotations/information-extraction-annotations) on the messages. You can try out the assistant right in the Assistant Workspace Editor to see what it can understand, and you can fine-tune the behavior by changing the training data.

From your Watson Assistant service instance you will need the following things:
- Service Credentials
- Workspace ID for the assistant you just trained.

Then in Watson Work Application editor, select the "Make it Cognitive" link on the left and enter the information you gathered above. With that done Watson Work will not start recognizing weather forecast and condition requests. You can see evidence of this by adding your Watson Work application to a space, asking some weather questions, and then going to the moment view. You should see your weather related questions appear with the **WeatherForecast** focus.

## Create Weather Service
Next you will need to create an instance of the [Weather Service](https://console.bluemix.net/docs/services/Weather/index.html). That's it. Seriously.

## Deploy the sample
This sample has a single action:
- WeatherForecast - Listens for the **WeatherForecast** focus annotation.
  - Validates that the action has Weather Service crendtials (explained below)
  - Looks for required Location entities, and GeoLocates them to establish lattitude/longitude for the location.
  - If no date was found it will report the current conditions at the location.
  - If there is a date/date range it will get a forecast for that location and report on the days that are within the 10-day forecast window.
- ForecastSequence - Associated with the **WWWebHookEvents** trigger, and links the following actions:
  - **IsFocus** - validates that the event is a focus annotation creation event
  - **WeatherForecast** - generate a message from the request.
  - **SendMessage** - report the message back to the space.

## Wskdeploy
- Simply run `wskdeploy`

## Bind Weather Insights
One last step to make it all work, you will need to bind your **Weather Service** instance with the **WeatherForcast** action. This will give the action access to the credentials for the service:
- `bx wsk bind weatherinsights Forecast/WeatherForecast`

That's it, you should be able to add the application to a space and start asking about the weather!

A simple variation of this app, which I will leave to the developer, would be to also recognize questions about the weather and golf. The forecasts from the Weather Service includes weather conditions for playing golf.
