//
// Action Fulfillment of an invitation action.
//
// Input contains:
//   - spaceId: SpaceId the command was submitted in.
//   - limit: max number of invites to generate cards for (defaults to 10)
//

var openwhisk = require("openwhisk");
var _ = require("lodash");
var request = require("superagent");
var fs = require("fs");
var mustache = require("mustache");

// Look for any locations mentioned
function getLocation(focus) {
  return new Promise((resolve,reject) => {

    // Get a list of location text from the focus.
    var locations = [];
    var locations = _.chain(focus.annotationPayload.extractedInfo.entities)
    .filter(entity => {
      return entity.type === "Location";
    })
    .map(entity => {
      return entity.text;
    })
    .value();

    if (locations.length > 0) {

      // We have some location text, so let's see if we can geolocate it.
      request
        .get(focus.__bx_creds.weatherinsights.url + "/api/weather/v3/location/search")
        .query({ query: locations.join(), language: 'en-US' })
        .then(resp => {
          var result = JSON.parse(resp.text).location;

          // Assume we want the first one and add to focus
          focus.location = {
            city: result.city[0],
            state: result.adminDistrict[0],
            latitude: result.latitude[0],
            longitude: result.longitude[0],
            country: result.country[0],
            location: [result.city[0], result.adminDistrict[0], result.country[0]].join(", ")
          }
          resolve(focus);
      }).catch(err => {
        reject({
          error: err,
          focus: focus
        });
      })
    }
    else {
      resolve(focus);
    }
  })
}

// Look for and dates mentioned.
function getDates(focus) {
  return new Promise((resolve, reject) => {
    // Get a list of date texts from the focus. Might include one, or two in the case of a date range
    var dates = [];
    var dates = _.filter(focus.annotationPayload.extractedInfo.entities, entity => {
      if (entity.type === "sys-date")
        return entity;
    })
    var from = false;
    var to = false;

    // If we have dates add them to the focus.
    if (dates.length === 1 || dates.length === 2) {
      from = dates[0];
      to = dates.length === 2 ? dates[1] : from
      focus.fromDay = from.text;
      focus.toDay = to.text;
    }
    resolve(focus);
  })
}

// Get the current conditions given a specific location
function getConditions(focus) {
  return new Promise((resolve,reject) => {
    request
      .get(focus.__bx_creds.weatherinsights.url + "/api/weather/v1/geocode/" + focus.location.latitude + "/" + focus.location.longitude + "/observations.json")
      .query({ language: 'en-US' })
      .then(resp => {
        var conditions = resp.body.observation;
        var text = mustache.render(`Weather is {{wx_phrase}}, temp of {{temp}}, but it feels like {{feels_like}}`,conditions)
        resolve({
          spaceId: focus.spaceId,
          title: "The current weather at " + focus.location.location,
          text: text,
          actor: {
            name: "Weather Bot"
          }
        });
      }).catch(err => {
        reject(err);
      })
    })
}

// Response when no location is found
function noLocation(focus) {
  return {
    spaceId: focus.spaceId,
    title: "Where exactly?",
    text: "I need to know a location in order to tell you the weather there...",
    actor: {
      name: "Weather Bot"
    }
  }
}

// Get the forecast at a given location between two days
function getForecast(focus) {
  return new Promise((resolve,reject) => {
    request
      .get(focus.__bx_creds.weatherinsights.url + "/api/weather/v1/geocode/" + focus.location.latitude + "/" + focus.location.longitude + "/forecast/daily/10day.json?")
      .query({ language: 'en-US' })
    .then(resp => {
      var forecasts = resp.body.forecasts;
      var result = _.chain(forecasts)
        .filter(forecast => {
          var date = new Date(Date.parse(forecast.sunrise));
          forecast.date = date.toISOString().substr(0,10);
          forecast.dateString = date.toDateString();
          return (forecast.date >= focus.fromDay && forecast.date <= focus.toDay)
        })
        .map(forecast => {
          var strs = [];
          var items = _.pick(forecast,["day","night"]);
          _.keys(items).forEach(item => {
            strs.push("*" + forecast.dateString + " " + item + ":* " + forecast[item].narrative);
          })
          return strs.join("\n");
        })
        .value();
      resolve({
          spaceId: focus.spaceId,
          title: "Weather Forecast for " + focus.location.location,
          text: result.join("\n"),
          actor: {
            name: "Weather Bot"
          }
      });
    }).catch(err => {
      reject(err);
    })
  })
}

function validateCredentials(focus) {
  return new Promise((resolve,reject) => {
    if (_.get(focus,"__bx_creds.weatherinsights.url"))
      resolve(focus);
    else {
      reject({
        response: {
          spaceId: focus.spaceId,
          title: "Missing Credentials",
          text: "The WeatherInsights service has not been bound to this action, please read instructions.",
          actor: {
            name: "Weather Bot"
          }
        }
      })
    }
  })
}

function main(focus) {
  return new Promise((resolve,reject) => {

    // check to see if we got a Weather Forecast Request
    if (focus.annotationPayload.lens === "WeatherForecast") {
      validateCredentials(focus).then(focus => {
        return getLocation(focus);
      }).then(focus => {
        return getDates(focus);
      }).then(focus => {
        if (!focus.hasOwnProperty('location')) {
          resolve(noLocation(focus));
        }
        else if (!focus.hasOwnProperty('fromDay')){
          resolve(getConditions(focus));
        }
        else {
          resolve(getForecast(focus));
        }
      }).catch(err => {
        console.log("*** Error: " + JSON.stringify(err) + "***")
        console.log("*** Focus: " + JSON.stringify(focus) + "***")
        if (err.response)
          resolve(err.response)
        else
          resolve({
            spaceId: focus.spaceId,
            title: "Oops!",
            text: "There was an error processing, please try again later.",
            actor: {
              name: "Weather Bot"
            }
          })
      });
    }
  })
};
