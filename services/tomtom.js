/* eslint-disable eqeqeq */
/* eslint-disable new-cap */
/* eslint-disable max-len */
// const config = require('config');
// const ifaces = require('os').networkInterfaces();

//https://gearside.com/easily-link-to-locations-and-directions-using-the-new-google-maps/
require('dotenv').config();
const https = require("https");
const fs = require("fs");
const util = require("util");
const axios = require("axios");
const crypto = require("crypto");
const logger = require("../logger/logger");
const BaseError = require("../errorHandler/baseError");
const { distance } = require("./geodatasource");
const { stopcategories } = require("./yelpcategories");
const qrate = require("qrate");

// Use a different API key for map frontend. The maps javascript web api uses the key on the frontend.
// One for Map tiles only (with domain whitelisting set), which will be used at frontend to show a map.
// Source https://devforum.tomtom.com/t/api-key-security/2938


// Access the API keys from environment variables
const TOMTOMAPIKEY = process.env.TOMTOM_API_KEY;
const YELPAPIKEY = process.env.YELP_API_KEY;

  const DEFAULTSEARCHRADIUSINMILES = 5;
const MILETOMETER = 1609.34;

const state = {
  routehashes: new Map(),
};

const TOMTOMAPISEARCHURL = "https://api.tomtom.com/search/2";
const TOMTOMROUTINGURL = "https://api.tomtom.com/routing/1/calculateRoute";
const TOMTOMREVERSEGEOCODE = "https://api.tomtom.com/search/2/reverseGeocode";
const YELPBUSINESSSEARCHURL = "https://api.yelp.com/v3/businesses/search";

// **************************************************
// **************************************************
// ********* BEGIN: RATE LIMIT WORKER QUEUE HANDLING
// **************************************************
// **************************************************

// Predefined worker function for API Calls
// param is of form {
//   func: //functionname string to execute
//   data: Object {} to pass to func
//   outsideResolve: an outside promise's resolve function
//   outsideReject: an outside promise's resolve function
// }

// Pass into an outside Promise's resolve or reject function as param.outsideResolve or param.outsideReject
// and use that promise variable to track in await() calls

const APIWorker = async (param) => {
  let retdata;
  if (param.func == "reversegeocode") {
    retdata = await reversegeocode(param.data.latitude, param.data.longitude);
  } else if (param.func == "searchLocation") {
    retdata = await searchLocation(param.data.locationQuery);
  } else if (param.func == "routebetweenLocations") {
    retdata = await routebetweenLocations(
      param.data.req,
      param.data.slat,
      param.data.slong,
      param.data.dlat,
      param.data.dlong,
      param.data.departAt,
      param.data.arriveAt,
      param.data.routedefaults
    );
  } else if (param.func == "poisearch") {
    retdata = await poisearch(
      param.data.latitude,
      param.data.longitude,
      param.data.radius,
      param.data.type,
      param.data.limit,
      param.data.offset,
      param.data.tags,
      param.data.open_at
    );
  }

  param.outsideResolve(retdata);
  return retdata;
  //return param.data.res.json(retdata);
};

// Define worker queue using qrate
// concurrency 1, rateLimit 4 workers per second
const rateLimitedAPIQueue = qrate(APIWorker, 1, 4);

// Add work to workerqueue
const callRateLimitedAPI = (worker, data) => {
  // Build outside promise and pass the resolve() and reject() into .push() call into worker function.
  // With this strategy the caller of callRateLimitedAPI() would not know when work was completed.
  let outsideResolve;
  let outsideReject;
  let prom = new Promise(function (resolve, reject) {
    outsideResolve = resolve;
    outsideReject = reject;
  });

  rateLimitedAPIQueue.push({
    func: worker,
    data: data,
    outsideResolve: outsideResolve,
    outsideReject: outsideReject,
  });

  return prom;
};

const reversegeocode = async (latitude, longitude) => {
  // console.log('searching>> '+locationQuery)
  const query = `${TOMTOMREVERSEGEOCODE}/${latitude},${longitude}.json?key=${TOMTOMAPIKEY}&radius=100`;
  // console.log(query);
  let retdata = [];
  try {
    // const { data, error } = await queryWorkerQueue.push(query);
    const { data, error } = await axios.get(query);
    //  console.log(data);
    retdata = data;
  } catch (error) {
    console.log(error.response?.data || error);
    throw new BaseError(
      "Failed to reverse geocode",
      true,
      error.response.status,
      `Failed to reverse geocode ${JSON.stringify(
        error.response?.data || error
      )}`
    );
  }

  return retdata;
};

const restaurantcategories = () => {
  return [
   ...stopcategories.get("restaurants"),
   ...stopcategories.get("food"),
   ...stopcategories.get("bars"),
    
  ];
};

const regularcategories = () => {
  return [
    ...stopcategories.get("x-rest"),
    ...stopcategories.get("x-day"),
    ...stopcategories.get("x-meal"),
  ];
};

const yelpcategories_alias_to_title = (aliasarray) =>{

 if (!Array.isArray(aliasarray)){
  throw new BaseError('yelpcategories_alias_to_title() failed - Not an array');
    return [];
  }
let alias_to_title_map = new Map();
let titlearray = [];

[
  ...restaurantcategories(),
  ...regularcategories(),
].map((cat)=>{
  alias_to_title_map.set(cat.alias, cat.title);
})
titlearray = aliasarray.reduce((titles,alias)=>{
  if (alias_to_title_map.has(alias)){
    titles.push(alias_to_title_map.get(alias));
  }
   
    return titles;
  },[]);

  return titlearray;
}

const default_yelpcategories = (type) => {
  let yelpcategories = "";
  if (type.includes("meal")) {
    yelpcategories += "restaurants,food,bars";
  }
  if (type.includes("rest")) {
    yelpcategories = yelpcategories == "" ? "" : `${yelpcategories},`;
    yelpcategories +=
      "reststops,parking,servicestations,evchargingstations,service_stations,deptstores,shoppingcenters,campgrounds,rvparks";
  }
  if (type.includes("day")) {
    yelpcategories = yelpcategories == "" ? "" : `${yelpcategories},`;
    yelpcategories =
      "hotels,bedbreakfast,campgrounds,guesthouses,hostels,resorts,vacation_rentals,rvparks,skiresorts";
  }
  return yelpcategories;
};


const customtags_yelpcategories = (tags) =>{
  let yelpcategories =''
  if (tags.length > 0) {
    //yelpcategories = yelpcategories==''?'':`${yelpcategories},`;

    let cataliastosearch = [
      ...restaurantcategories(),
      ...regularcategories(),
    ].reduce((accumulator, cat) => {
      if (tags.includes(cat.title)) {
        accumulator.push(cat.alias);
      }
      return accumulator;
    }, []);

    let cataliastosearch_deduped = [...new Set(cataliastosearch)];
    yelpcategories = cataliastosearch_deduped.join(",");
    console.log(yelpcategories);
  }
  return yelpcategories;
}

const poisearch = async (
  latitude,
  longitude,
  radius = (DEFAULTSEARCHRADIUSINMILES * MILETOMETER).toFixed(0),
  type,
  limit = 50,
  offset = 0,
  tags = [],
  open_at =0
) => {
  if(type=='userdefined'){
    return [];
  }
  if (limit > 50) {
    console.log("Forcing search limit to 50 results");
    limit = 50;
  }
  if (radius > 40000) {
    // Yelp limit as per https://docs.developer.yelp.com/reference/v3_business_search
    console.log(`Search requested withing ${radius} meters`);
    console.log("Forcing search to 40000 meters");
    radius = 40000;
  }

  let yelpcategories = default_yelpcategories(type); // determine default yelp categories from type (meal, rest or day)
  // If extra search tags were passed, override yelpcategories with the tags' respective categories.
  console.log(tags);
  if (tags.length > 0) {
    yelpcategories = customtags_yelpcategories(tags);
  }



  let query = `${YELPBUSINESSSEARCHURL}?latitude=${latitude}&longitude=${longitude}&radius=${radius}&categories=${yelpcategories}&sort_by=distance&limit=${limit}&offset=${offset}`;
  if (open_at!=0){
     query +=`&open_at=${open_at}`;
  }
  console.log(query);
  let retdata = [];
  try {
    // const { data, error } = await queryWorkerQueue.push(query);
    const { data, error } = await axios.get(query, {
      headers: {
        Authorization: `Bearer ${YELPAPIKEY}`,
        Accept: "application/json",
      },
    });
    // console.log(data);
    retdata = data;
  } catch (error) {
    console.log(error.response?.data || error);
    throw new BaseError(
      "Failed to perform poisearch",
      true,
      error.response.status,
      `Failed to perform poisearch ${JSON.stringify(
        error.response?.data || error
      )}`
    );
  }

  return retdata;
};

// **************************************************
// **************************************************
// ********* END: RATE LIMIT WORKER QUEUE HANDLING
// **************************************************
// **************************************************

const searchLocation = async (locationQuery) => {
  // console.log('searching>> '+locationQuery)
  const query = `${TOMTOMAPISEARCHURL}/search/${encodeURIComponent(
    locationQuery
  )}.json?key=${TOMTOMAPIKEY}&limit=10`;
  // console.log(query);
  let retdata = [];
  try {
    const { data, error } = await axios.get(query);
    // const { data, error } = await queryWorkerQueue.push(query);
    // console.log(data.results);
    retdata = data.results;
  } catch (error) {
    console.log(error.response?.data || error);
    throw new BaseError(
      "Failed to search location",
      true,
      error.response.status,
      `Failed to search location ${JSON.stringify(
        error.response?.data || error
      )}`
    );
  }

  return retdata;
};





// Returns startpoint and endpoint for a stop based on fraction of totalTime (in secs)
const findStopCenter = (points, totalTime, fraction) => {
  let fractionOfTotalTime = Math.round(fraction * totalTime);
  let i = 1;
  // console.log(points.length);
  // console.log(fractionOfTotalTime);
  while (i < points.length) {
    if (points[i].travelTimeInSeconds > fractionOfTotalTime) {
      // points[i].travelTimeInSeconds is cummulative traveltime.
      // console.log(points[i].travelTimeInSeconds);
      let fractionleft =
        (fractionOfTotalTime - points[i - 1].travelTimeInSeconds) /
        (points[i].travelTimeInSeconds - points[i - 1].travelTimeInSeconds);
      return [points[i - 1], points[i], fractionleft];
    }
    i++;
  }
  return [];
};

// Find closest pointsB (array of 2 points) on list of more pointsA (array of multiple points) and guess a better center.
const refineStopCenter = (pointsA, pointsB) => {
  const startPoint = pointsB[0];
  const endPoint = pointsB[1];
  const fractionRemaining = pointsB[2];

  const closestStartPointonA = pointsA.reduce(
    function (result, pointA, index) {
      let distanceBetweenStartPointAndThisPointA =
        distance(
          startPoint.point.latitude,
          startPoint.point.longitude,
          pointA.latitude,
          pointA.longitude,
          "K"
        ) * 1000;

      if (
        index == 0 ||
        distanceBetweenStartPointAndThisPointA < result.distance
      )
        return {
          distance: distanceBetweenStartPointAndThisPointA,
          point: pointA,
          index: index,
        };
      else return result;
    },
    {
      distance: 0,
      point: {},
      index: 0,
    }
  );

  const closestEndPointonA = pointsA.reduce(
    function (result, pointA, index) {
      let distanceBetweenEndPointAndThisPointA =
        distance(
          endPoint.point.latitude,
          endPoint.point.longitude,
          pointA.latitude,
          pointA.longitude,
          "K"
        ) * 1000;
      if (index == 0 || distanceBetweenEndPointAndThisPointA < result.distance)
        return {
          distance: distanceBetweenEndPointAndThisPointA,
          point: pointA,
          index: index,
        };
      else return result;
    },
    {
      distance: 0,
      point: {},
      index: 0,
    }
  );

  // console.log('Probable center lies in between pointsA[closestStartPointonA.index] and pointsA[closestEndPointonA.index] :');
  let cummulativedistanceArray = [];
  let summationOfDistances = 0;
  for (let i = closestStartPointonA.index; i < closestEndPointonA.index; i++) {
    // console.log(pointsA[i]);
    let distanceToNextPoint =
      distance(
        pointsA[i].latitude,
        pointsA[i].longitude,
        pointsA[i + 1].latitude,
        pointsA[i + 1].longitude,
        "K"
      ) * 1000;
    summationOfDistances = summationOfDistances + distanceToNextPoint;
    cummulativedistanceArray.push(summationOfDistances);
  }
  // console.log(cummulativedistanceArray);
  // console.log(`fractionRemaining: ${fractionRemaining}`);
  const centrePointIdxOffset = cummulativedistanceArray.reduce(
    (result, item, index) => {
      if (fractionRemaining * summationOfDistances > item) return index;
      else return result;
    },
    0
  );

  let probableCenter =
    pointsA[closestStartPointonA.index + centrePointIdxOffset];

  // console.log(`probable stop lies at  ${JSON.stringify(probableCenter)}`);
  return probableCenter;
};

const locateStop = async (routehash, interval) => {
  // 0<=interval <= 1
  if (!state.routehashes.has(routehash)) {
    return {};
  }
  let route = state.routehashes.get(routehash);

  let startEndPointsRange = findStopCenter(
    route.guidance.instructions,
    route.summary.travelTimeInSeconds,
    interval
  );
  let allpoints =[];
  route.legs.map(leg=>{
    allpoints.push(...leg.points);
  });
  return refineStopCenter(allpoints, startEndPointsRange);
};

const calculateStopsArray = (routehash, routedefaults, userdefinedstops=[]) => {
  const {
    hrstodrivewithoutstopping,
    hrstodriveperday,
    mealintervalinhrs,
    enablemealstops,
    startinghungrypercent,
    enablefuelstops,
    startingfuelpercent,
    mileageinmpg,
    gastanksizeingal,
    reservefuelpercent,
  } = routedefaults;
  if (!state.routehashes.has(routehash)) {
    return {};
  }
  const route = state.routehashes.get(routehash);
  const totaltimeinsecs = route.summary.travelTimeInSeconds;
  const totaltriplengthinmiles = route.summary.lengthInMeters * 0.000621371;
  let hungrytimer = mealintervalinhrs * 60 * 60 * startinghungrypercent * 0.01,
    daytimer = 0,
    resttimer = 0,
    totalelapsedtime = 0;
  let stops = new Map();
  // console.log('hungrytimer'+hungrytimer)
  while (totalelapsedtime < totaltimeinsecs) {
    let stopratio = totalelapsedtime / totaltimeinsecs;

    //need meal stop if hungrytimer crosses mealintervalinhrs
    if (hungrytimer >= mealintervalinhrs * 60 * 60 && enablemealstops) {
      if (stops.has(stopratio)) {
        stops.get(stopratio).add("meal");
      } else {
        stops.set(stopratio, new Set(["meal"]));
      }
      //resets hungrytimer
      hungrytimer = 0;
    }

    //need rest stop if resttimer crosses hrstodriveperday
    if (resttimer >= hrstodrivewithoutstopping * 60 * 60) {
      if (stops.has(stopratio)) {
        stops.get(stopratio).add("rest");
      } else {
        stops.set(stopratio, new Set(["rest"]));
      }
      //resets resttimer
      resttimer = 0;
    }

    //need overnight stop if daytimer crosses hrstodrivewithoutstopping
    if (daytimer >= hrstodriveperday * 60 * 60) {
      if (stops.has(stopratio)) {
        stops.get(stopratio).add("day");
      } else {
        stops.set(stopratio, new Set(["day"]));
      }
      //resets daytimer
      daytimer = 0;
    }
    hungrytimer++;
    resttimer++;
    daytimer++;
    totalelapsedtime++;
  }

  let milescango =
    ((startingfuelpercent - reservefuelpercent) *
      mileageinmpg *
      gastanksizeingal) /
    100;
  let elapseddist = 0;
  while (elapseddist < totaltriplengthinmiles && enablefuelstops) {
    let stopratio = elapseddist / totaltriplengthinmiles;

    //need fuel stop if milescango value falls <=0
    if (milescango <= 0) {
      if (stops.has(stopratio)) {
        stops.get(stopratio).add("fuel");
      } else {
        stops.set(stopratio, new Set(["fuel"]));
      }
      //resets milescango count
      milescango = (100 - reservefuelpercent) * mileageinmpg * gastanksizeingal;
    }
    milescango--;
    elapseddist++;
  }
  return stops;
};

const routebetweenLocations = async (
  req,
  slat,
  slong,
  dlat,
  dlong,
  departAt,
  arriveAt,
  routedefaults
) => {
  console.log(
    `routing between >> ${req.query.slat},${req.query.slong} : ${req.query.dlat},${req.query.dlong}`
  );
  let waypoints = [];

  if (req.query.waypoints && req.query.waypoints.length > 0) {
    req.query.waypoints.map((waypoint) => {
      if(waypoint.slat!=null && waypoint.slong!=null){
        waypoints.push({ latitude: waypoint.slat, longitude: waypoint.slong });
      }
      
    });
  }

  // let query = `${TOMTOMROUTINGURL}/${req.query.slat},${req.query.slong}:${req.query.dlat},${req.query.dlong}/json?instructionsType=text&routeRepresentation=polyline&computeTravelTimeFor=all&routeType=fastest&traffic=true&extendedRouteRepresentation=travelTime&key=${TOMTOMAPIKEY}`;
  // let postOrGet = waypoints.length > 0 ? "POST" : "GET";
  let query = `${TOMTOMROUTINGURL}/${req.query.routecoordinates}/json?instructionsType=text&routeRepresentation=polyline&computeTravelTimeFor=all&routeType=fastest&traffic=true&extendedRouteRepresentation=travelTime&key=${TOMTOMAPIKEY}`;
  let postOrGet = "POST"; // make it always a POST call
  let postbody = postOrGet == "POST" ? { supportingPoints: waypoints } : {};
  // DO NOT USE GET . Instead use POST along with supportingPoints: waypoints in POST body. 
  // Using more than one routecoordinates in GET calls returns suspiciously incorrect times for each "leg" of the journey 
  // For each extra waypoint, other than start and end, supplied as coordinates in the GET URL, 
  // it produces a leg in the trip and the time elapsed for each of legs are suspiciously incorrect). Therefore reverting to POST is the best option.
  //  query = postOrGet == "GET" ? (query += "&computeBestOrder=true") : query; // cannot use ComputeBestOrder with supportingPoints

   
 let timeconstraints = {};
  if (
    typeof req.query.departAt !== "undefined" &&
    typeof req.query.arriveAt !== "undefined"
  ) {
    query += `&departAt=${req.query.departAt}`;
    timeconstraints = {'departAt':req.query.departAt};
  } else if (typeof req.query.departAt !== "undefined") {
    query += `&departAt=${req.query.departAt}`;
    timeconstraints = {'departAt':req.query.departAt};
  } else if (typeof req.query.arriveAt !== "undefined") {
    query += `&arriveAt=${req.query.arriveAt}`;
    timeconstraints = {'arriveAt':req.query.departAt};
  }
  console.log(query);
  // console.log(postbody);
  let retdata = [];
  try {
    const { data, error } =
      postOrGet == "POST"
        ? await axios.post(query, postbody)
        : await axios.get(query);
    // const { data, error } = await queryWorkerQueue.push(query);
   
    console.log(data.routes[0].summary);
    // Output:
    // {
    //     lengthInMeters: 450425,
    //     travelTimeInSeconds: 15976,
    //     trafficDelayInSeconds: 0,
    //     trafficLengthInMeters: 0,
    //     departureTime: '2023-07-10T18:25:35-04:00',
    //     arrivalTime: '2023-07-10T22:51:50-04:00',
    //     noTrafficTravelTimeInSeconds: 15545,
    //     historicTrafficTravelTimeInSeconds: 15976,
    //     liveTrafficIncidentsTravelTimeInSeconds: 15976
    //   }

    //console.log(data.routes[0].legs[0].points);
    // Output:
    // [ { latitude: 41.74296, longitude: -72.73487 },
    //     { latitude: 41.74304, longitude: -72.73489 },
    //     { latitude: 41.74347, longitude: -72.73489 },...]

    // console.log(data.routes[0].guidance.instructions);
    // Output:
    // [ {
    //     routeOffsetInMeters: 449876,
    //     travelTimeInSeconds: 15867,
    //     point: { latitude: 39.17194, longitude: -75.54146 },..
    // ]

    // removed.....
    // let startEndPointsRange = findStopCenter(
    //   data.routes[0].guidance.instructions,
    //   data.routes[0].summary.travelTimeInSeconds,
    //   0.5
    // );
    // let centerPointOfStop = refineStopCenter(
    //   data.routes[0].legs[0].points,
    //   startEndPointsRange
    // );
    // retdata = [data.routes[0].legs[0].points, centerPointOfStop];

    retdata = data.routes[0];
    retdata.routehash = crypto.randomBytes(8).toString("hex");
    state.routehashes.set(retdata.routehash, retdata);
    retdata.stopIntervalsStartEndTimes = estimatestarttimesofstopsfromstate(retdata.routehash, req.query.waypoints, routedefaults, retdata.summary);
// console.log(retdata.stopIntervalsStartEndTimes);
  } catch (error) {
    console.log(error.response?.data || error);
    throw new BaseError(
      "Failed to route",
      true,
      error.response.status,
      `Failed to route ${JSON.stringify(error.response?.data || error)}`
    );
  }

  return retdata;
};

const yesterdayAtFixedHours=(checkOutAt, fixedHours)=>{
  let oneDayBeforeCheckout = new Date(checkOutAt);
  oneDayBeforeCheckout.setDate(oneDayBeforeCheckout.getDate()-1);
  oneDayBeforeCheckout.setHours(fixedHours,0,0);
  // console.log(oneDayBeforeCheckout)
return   oneDayBeforeCheckout;
}

const hoursBefore=(checkOutAt, hoursBefore)=>{
  let hoursBeforeBeforeCheckout = new Date(checkOutAt);
  hoursBeforeBeforeCheckout.setSeconds(hoursBeforeBeforeCheckout.getSeconds()-hoursBefore*60*60);
  // console.log(hoursBeforeBeforeCheckout)
return  hoursBeforeBeforeCheckout;
}


// Check in at : 10PM (22:00 hrs) on the Previous Day OR 8 Hours before checkout, whichever is earlier.
const checkInAt_StayByNight =(checkOutAt)=>{
// console.log(checkOutAt.toUTCString());
let checkIn;
let TenPMOnPreviousDayOfCheckOut = yesterdayAtFixedHours(checkOutAt, 22); 
let EightHoursBeforeCheckOut = hoursBefore(checkOutAt, 8);
if (TenPMOnPreviousDayOfCheckOut<= EightHoursBeforeCheckOut){
  checkIn = TenPMOnPreviousDayOfCheckOut;
} else {
  checkIn = EightHoursBeforeCheckOut;
}
// console.log(checkIn.toUTCString());
return checkIn;
}

// Check out at 10AM the next day
const checkOutAt_StayByNight = (checkInAt)=>{
  console.log(checkInAt.toUTCString());
  let checkOut = new Date(checkInAt);

  checkOut.setDate(checkInAt.getDate() + 1);
  checkOut.setHours(10,0,0);
  return checkOut;
}




const calculatestopstartendtimes = (routedefaults, routesummary, stopIntervalsStartEndTimes) =>{
  let actualstartdatetime = new Date(routesummary.departureTime);
  let actualenddatetime = new Date(routesummary.arrivalTime);
  try{

  

    let DepartureHasPriorityOverArrival = routedefaults.startenddatechoice=='Start at'?true:false;
    DepartureHasPriorityOverArrival = routedefaults.startenddatechoice=='End by'?false:true;

    if (DepartureHasPriorityOverArrival){
      // Departure datetime has priority over arrival datetime
      // Meaning Departure date time is not flexible, arrival date time is flexible
      // Start counting time after routesummary.departureTime for each forward increment of stops, then arrive to an expected arrival date time
      let triptimer = new Date(routesummary.departureTime);
      let traveltimebetweenstopsinsecs = 0;
      let previouscummulativereachtimesinsecs =0;
      
      stopIntervalsStartEndTimes.map(stop=>{
        
        traveltimebetweenstopsinsecs = stop.cummulativereachtimesinsecs - previouscummulativereachtimesinsecs;
        // console.log('stop.cummulativereachtimesinsecs '+stop.cummulativereachtimesinsecs)
        // console.log('traveltimebetweenstopsinsecs '+traveltimebetweenstopsinsecs)
        if (stop.stoptype.includes('day')){
          triptimer.setSeconds(triptimer.getSeconds() + traveltimebetweenstopsinsecs);
          stop.arrive = new Date(triptimer);
          //set departure for next day 10AM
          // triptimer.setDate(triptimer.getDate() + 1);
          // triptimer.setHours(10,0,0);
          triptimer = checkOutAt_StayByNight(triptimer);
          stop.depart =new Date(triptimer);
        } else if (stop.stoptype.includes('meal')){
          triptimer.setSeconds(triptimer.getSeconds() + traveltimebetweenstopsinsecs);
          stop.arrive = new Date(triptimer);
          triptimer.setSeconds(triptimer.getSeconds() + routedefaults.mealbreaktimeinminutes*60);
          stop.depart =new Date(triptimer);
        } else if (stop.stoptype.includes('fuel')){
          triptimer.setSeconds(triptimer.getSeconds() + traveltimebetweenstopsinsecs);
          stop.arrive = new Date(triptimer);
          triptimer.setSeconds(triptimer.getSeconds() + routedefaults.fuelbreaktimeinminutes*60);
          stop.depart =new Date(triptimer);
        }else if (stop.stoptype.includes('rest')){
          triptimer.setSeconds(triptimer.getSeconds() + traveltimebetweenstopsinsecs);
          stop.arrive = new Date(triptimer);
          triptimer.setSeconds(triptimer.getSeconds() + routedefaults.restbreaktimeinminutes*60);
          stop.depart =new Date(triptimer);
        }else if (stop.stoptype.includes('userdefined')){
          triptimer.setSeconds(triptimer.getSeconds() + traveltimebetweenstopsinsecs);
          stop.arrive = new Date(triptimer);
          triptimer.setSeconds(triptimer.getSeconds() + routedefaults.userbreaktimeinminutes*60);
          stop.depart =new Date(triptimer);
        }
  
         stop.traveltimebetweenstopsinsecs_calculatedfromsource = traveltimebetweenstopsinsecs;
         previouscummulativereachtimesinsecs = stop.cummulativereachtimesinsecs;
         // Code performs : actualenddatetime = triptimer+timeleftintrip 
         let timeleftintrip = routesummary.travelTimeInSeconds - stop.cummulativereachtimesinsecs;
         actualenddatetime = new Date(triptimer);
         actualenddatetime.setSeconds(actualenddatetime.getSeconds()+timeleftintrip);
        //  console.log(`stop.cummulativereachtimesinsecs ${stop.cummulativereachtimesinsecs} triptimer ${triptimer}, timeleftintrip ${timeleftintrip}, actualenddatetime ${actualenddatetime}`)

      })
    }
    else {
      // Arrival datetime has priority over departure datetime
      // Meaning arrival date time is not flexible, departure date time is flexible
      // Start counting time backwards from routesummary.arrivalTime for each backward decrement of stops, then arrive to an expected departure date time

      let triptimer = new Date(routesummary.arrivalTime);
      let traveltimebetweenstopsinsecs = routesummary.travelTimeInSeconds;
      // stopIntervalsStartEndTimes traversing backwards
      for (let i=stopIntervalsStartEndTimes.length-1; i>=0;i--){
        let stop=stopIntervalsStartEndTimes[i];
        
        if (i==stopIntervalsStartEndTimes.length-1){
          traveltimebetweenstopsinsecs = routesummary.travelTimeInSeconds - stopIntervalsStartEndTimes[i].cummulativereachtimesinsecs ;
        } else {
          traveltimebetweenstopsinsecs = stopIntervalsStartEndTimes[i+1].cummulativereachtimesinsecs - stopIntervalsStartEndTimes[i].cummulativereachtimesinsecs ;
        }
        
       
        if (stop.stoptype.includes('day')){
          triptimer.setSeconds(triptimer.getSeconds() - traveltimebetweenstopsinsecs);
          stop.depart = new Date(triptimer);
          triptimer = checkInAt_StayByNight(triptimer);
          stop.arrive = new Date(triptimer);

        } else if (stop.stoptype.includes('meal')){
          triptimer.setSeconds(triptimer.getSeconds() - traveltimebetweenstopsinsecs);
          stop.depart =new Date(triptimer);
          triptimer.setSeconds(triptimer.getSeconds() - routedefaults.mealbreaktimeinminutes*60);
          stop.arrive =new Date(triptimer);
        } else if (stop.stoptype.includes('fuel')){
          triptimer.setSeconds(triptimer.getSeconds() - traveltimebetweenstopsinsecs);
          stop.depart =new Date(triptimer);
          triptimer.setSeconds(triptimer.getSeconds() - routedefaults.fuelbreaktimeinminutes*60);
          stop.arrive =new Date(triptimer);
        }else if (stop.stoptype.includes('rest')){
          triptimer.setSeconds(triptimer.getSeconds() - traveltimebetweenstopsinsecs);
          stop.depart =new Date(triptimer);
          triptimer.setSeconds(triptimer.getSeconds() - routedefaults.restbreaktimeinminutes*60);
          stop.arrive =new Date(triptimer);
        }
        else if (stop.stoptype.includes('userdefined')){
          triptimer.setSeconds(triptimer.getSeconds() - traveltimebetweenstopsinsecs);
          stop.arrive = new Date(triptimer);
          triptimer.setSeconds(triptimer.getSeconds() - routedefaults.userbreaktimeinminutes*60);
          stop.depart =new Date(triptimer);
        }
       
        stop.traveltimebetweenstopsinsecs_calculatedfromdestination = traveltimebetweenstopsinsecs; 
         
        // Code performs : actualenddatetime = triptimer-stop.cummulativereachtimesinsecs 
        actualstartdatetime = new Date(triptimer);
        actualstartdatetime.setSeconds(actualstartdatetime.getSeconds()-stop.cummulativereachtimesinsecs);
      }
      
    }
  }
  catch(error){
    console.error(error);
    throw new BaseError(
      "Failed to calculate stopIntervalsStartEndTimes",
      true,
      error,
      `Failed to calculate stopIntervalsStartEndTimes ${JSON.stringify(error)}`
    );
   
  }

  return {
    actual:
      {start: actualstartdatetime, 
        end: actualenddatetime}, 
    stopIntervalsStartEndTimes:stopIntervalsStartEndTimes
  };
}




const estimatestarttimesofstopsfromstate = (routehash, stops = [], routedefaults, routesummary=null) => {
  // if (stops.length<=0){
  //   return;
  // }

  if (!state.routehashes.has(routehash)) {
    return {};
  }
  if (routesummary==null){
    routesummary = state.routehashes.get(routehash).summary;
  }
  const route = state.routehashes.get(routehash);
  
  // console.log('estimating start end times of stops');
  let stopIntervalsStartEndTimes = [];

  stops.map (stop=>{
    //Locate this stop among all points on route
    // console.log(stop)
    let distdiffarray =[];
    
    // iterate through points on route and calculate distance between stop and routepoint
    //  The point with the lowest distance is the "same" stop/poi -- thats the point we are looking for.
    route.legs.map(leg=>{
      leg.points.map(point=>{
        // store diff of distances (between thiswaypoint and routepoint) in distdiffarray
        distdiffarray.push(
          distance(
            stop.slat || stop.latitude,
            stop.slong|| stop.longitude,
            point.latitude,
            point.longitude,
            "K"
          ));
   
    });
  });

  let minimumDistance = Math.min(...distdiffarray); // lowest value amoung elements of wpdistarray is the stop (poi) location
  
  let indexOfclosestPoint = distdiffarray.indexOf(minimumDistance); // index of that array element
  // console.log(indexOfclosestPoint);
  // Now loop through a different array ie route.progress to calculate traveltime to reach that point. 
  route.progress.some(prog=>{
    if (prog.pointIndex >= indexOfclosestPoint ){
      stopIntervalsStartEndTimes.push({
        stoptype:stop.type, 
        cummulativereachtimesinsecs: prog.travelTimeInSeconds, // prog.travelTimeInSeconds is the time taken to reach the stop.
        latitude: stop.latitude,
        longitude: stop.longitude

      }); 
      
      return true;
    }
  })
  });
  stopIntervalsStartEndTimes.sort((a,b)=>{
    if ( a.cummulativereachtimesinsecs < b.cummulativereachtimesinsecs ){
      return -1;
    }
    if ( a.cummulativereachtimesinsecs > b.cummulativereachtimesinsecs ){
      return 1;
    }
    return 0;
  });

  csset = calculatestopstartendtimes(routedefaults,routesummary,stopIntervalsStartEndTimes);
  // sort based on cummulativereachtimesinsecs
  
return csset;
  };



module.exports = {
  searchLocation,
  routebetweenLocations,
  locateStop,
  calculateStopsArray,
  reversegeocode,
  callRateLimitedAPI,
  restaurantcategories,
  regularcategories,
  default_yelpcategories,
  yelpcategories_alias_to_title,
  estimatestarttimesofstopsfromstate,
};
