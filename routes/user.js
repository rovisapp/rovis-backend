/* eslint-disable max-len */
/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
/* eslint-disable new-cap */
const express = require("express");
require('dotenv').config();
const bodyParser = require('body-parser');
const {searchLocation, routebetweenLocations, locateStop, calculateStopsArray, reversegeocode, callRateLimitedAPI, restaurantcategories, regularcategories,default_yelpcategories,yelpcategories_alias_to_title,estimatestarttimesofstopsfromstate} =  require("../services/tomtom");
const {gsearch} = require('../services/gfaker');
// const GribDownloader = require('../services/weather/gribdownloader')
const weatherresult = require('../services/weather/weathermain');
const { logErrorMiddleware, returnError } = require('../errorHandler/errorHandler');
const api400Error = require('../errorHandler/api400Error');
const api500Error = require('../errorHandler/api500Error');
const logger = require("../logger/logger");
// const BaseError = require("../errorHandler/baseError");
const DEFAULTSEARCHRADIUSINMILES =5;
const MILETOMETER=1609.34;

const app = express();
app.use(express.json());
//

//http://localhost:3070/api/user/weather
app.get('/weather', (req, res) => {
  res.json( {weatherresult} );
});

//http://localhost:3070/api/user/gribdownload
// app.get('/gribdownload', (req, res) => {
//   const submitted = new GribDownloader().downloadBatch();
//   // This response is sent immediately, while downloads happen in background
//   res.json({ message: 'Download submitted successfully' });
// });

app.post('/fake/gsearch', (req, res) => {
  try {
  const ret = gsearch(req,res);
  return ret;
  }
  catch (error) {
    next(error);
  }
});

app.get('/getsearchparam', (req, res) => {
  const searchparam = process.env.TOMTOMAPIFRONTENDKEY; 
  res.json({ searchparam });
});
app.get('/getgsearchparam', (req, res) => {
  const searchparam = process.env.GOOGLE_JAVASCRIPT_KEY; 
  res.json({ searchparam });
});
app.get('/getplacesprovider', (req, res) => {
  const placesprovider = process.env.PLACES_PROVIDER; 
  res.json({ placesprovider });
});

app.get("/search", async (req, res, next) => {
  
  let location=[]
  try {
    // location = await searchLocation(req.query.q);
    location = await callRateLimitedAPI('searchLocation',{locationQuery:req.query.q, req:req,res:res});
  } catch (error) {
    next(error);
  }
  res.json(location);
});

app.get("/restaurantcategories", async (req, res, next) => {
  
  let location=[]
  try {
    location = restaurantcategories();
  } catch (error) {
    next(error);
  }
  res.json(location);
});

app.get("/regularcategories", async (req, res, next) => {
  
  let location=[]
  try {
    location = regularcategories();
  } catch (error) {
    next(error);
  }
  res.json(location);
});


app.post("/routing", async (req, res, next) => {
  
  let location=[]
  try {
    req.query.waypoints = req.body.waypoints;
    // location = await routebetweenLocations(req,req.query.slat,req.query.slong,req.query.dlat,req.query.dlong, req.query.departAt, req.query.arriveAt);
    location = await callRateLimitedAPI('routebetweenLocations',{req: req,slat:req.query.slat,slong:req.query.slong,dlat:req.query.dlat,dlong:req.query.dlong,departAt: req.query.departAt,arriveAt: req.query.arriveAt, routedefaults: req.body.routedefaults, res:res});
  } catch (error) {
    next(error);
  }
  res.json(location);
});

app.post("/locatestop", bodyParser.json(), async (req, res, next) => {
  // console.log(`locating individual stop at ${req.body.interval} fraction of trip`)
  let location=[]
  try {
    location = await locateStop(req.body.routehash, req.body.interval);
  } catch (error) {
    next(error);
  }
  // console.log(`End locating individual stop`)
  res.json(location);
});


// Takes in route and route defaults.
// Creates Map <stopfraction => Set (stop type)>  marking what fraction of routes must be stopped.
// Updates Map with stop latitute, longtitude
// Uses Promises.all technique to call await inside map.
app.post("/locatestoparray", bodyParser.json(), async (req, res, next) => {
  
  let location=[];
  let stopIntervalsStartEndTimes
  try {
    
    // find stop Map  Map <stopfraction => Set (stop type)>  marking what fraction of routes must be stopped.
    // This DOESNOT CONSIDER userdefined stops at this time
    // eg
    // stops:
    // Map(3) {
    //   0.4410683655966675 => Set(1) { 'rest' },
    //   0.6285224209752511 => Set(1) { 'meal' },
    //   0.882136731193335 => Set(1) { 'rest' }
    // }
    let stops = calculateStopsArray(req.body.routehash, req.body.routedefaults);
     console.log('stops Map');
     console.log(stops);
     
    

    //   builds location[]  from stops Map : 
    // [
    //   { latitude: 40.88143, longitude: -74.16587, type: [ 'rest' ],  },
    //   { latitude: 40.20719, longitude: -74.58131, type: [ 'meal' ], },
    //   { latitude: 39.55637, longitude: -75.66221, type: [ 'rest' ],  }
    // ]
    const AllPromises = async() => {
      await Promise.all(
        Array.from(stops.keys()).map(async (interval)=>{
          //find latitude, longitude for each stop
          let eachstop = await locateStop(req.body.routehash, interval); // creates eachstop.latitude, eachstop.longitude, 
          //find type for each stop
          eachstop.type = Array.from(stops.get(interval));
          if (req.body.routedefaultmealsearchtags.length > 0  && eachstop.type.includes('meal')){
            eachstop.tags = req.body.routedefaultmealsearchtags;
          }
          // eachstop.intervalfraction = interval;
          location.push(eachstop);
          return;
        })
      )
    }
    
    await AllPromises();
 

  
  //   updates location[]  with address data : 
  // [
  //   { latitude: 40.88143, longitude: -74.16587, type: [ 'rest' ], address:{freeformAddress,...} },
  //   { latitude: 40.20719, longitude: -74.58131, type: [ 'meal' ], address:{freeformAddress,...} },
  //   { latitude: 39.55637, longitude: -75.66221, type: [ 'rest' ], address:{freeformAddress,...} }
  // ]
    const AllPromises1 = async() => {``
      await Promise.all(
        location.map(async (eachlocation)=>{
          //find address for each stop using reverse geocoding
         // let result = await reversegeocode(eachlocation.latitude,eachlocation.longitude );
         let result = await callRateLimitedAPI('reversegeocode',{latitude:eachlocation.latitude,longitude:eachlocation.longitude});
        //  console.log(result)
         eachlocation.address = result.addresses[0]?.address;
          return;
        })
      )
    }
    await AllPromises1();
    console.log(req.body.userdefinedstops)
    // USERDEFINED STOPS are injected here
    location.push(...req.body.userdefinedstops);
    
  // console.log('location array:');
  // console.log(location);

    //The following code finds the start/end times for each stop center, so that that it can be used to search for only open POIs, in the step after that
    // {
    //   actual: {start:'2024-05-15T13:00:00.000Z', end: '2024-05-15T22:27:30.000Z'},
    //   stopIntervalsStartEndTimes: [
    //     {stoptype=['Meal',cummulativereachtimesinsecs: 7603, arrive: '2024-05-15T15:06:43.000Z', depart: '2024-05-15T15:26:43.000Z', traveltimebetweenstopsinsecs_calculatedfromsource: 7603]},
    //     {stoptype=['Meal',cummulativereachtimesinsecs: 7603, arrive: '2024-05-15T15:06:43.000Z', depart: '2024-05-15T15:26:43.000Z', traveltimebetweenstopsinsecs_calculatedfromsource: 7603]},
    //   ]
    // }
    stopIntervalsStartEndTimes = estimatestarttimesofstopsfromstate(req.body.routehash, location, req.body.routedefaults);

    //rearrange location array based on lat/long sequence in stopIntervalsStartEndTimes
    let locationsorted = [];
    stopIntervalsStartEndTimes.stopIntervalsStartEndTimes.map(i=>{
      location.map(j=>{
        if(i.latitude==j.latitude && i.longitude==j.longitude){
          locationsorted.push(j);
        }
      })
    })
    location = locationsorted;


  // The following code searches for 0-50 stop/POIs options around 5000 metres of each location (each location = center of search)
  //   updates location[]  with searched data array : 
  // [
  //   { latitude: 40.88143, longitude: -74.16587, type: [ 'rest' ], address:{freeformAddress,...}, poisearchbyoffsetarray =[[]]},
  //   { latitude: 40.20719, longitude: -74.58131, type: [ 'meal' ], address:{freeformAddress,...}, poisearchbyoffsetarray =[[]] },
  //   { latitude: 39.55637, longitude: -75.66221, type: [ 'rest' ], address:{freeformAddress,...}, poisearchbyoffsetarray =[[]] }
  // ]
  // poisearchbyoffsetarray is meant to be array of  results by offset position, as in: [[results 0-50], [results 51-100]...] 
  // This method just returns 0-50 whereas the frontend might ask for a consecutive searches beyond offset 50 as separate transactions.
    
  const AllPromises2 = async() => {
      
      await Promise.all(
        location.map(async (eachlocation, idx)=>{
        eachlocation.poisearchbyoffsetarray = eachlocation.poisearchbyoffsetarray || [];
        
        // find estimated arrival time (local time) at stop and search for only open pois
        let estlocationarrivaltime = 0;
        if(typeof stopIntervalsStartEndTimes.stopIntervalsStartEndTimes[idx].arrive !=='undefined'){
          estlocationarrivaltime = new Date(stopIntervalsStartEndTimes.stopIntervalsStartEndTimes[idx].arrive).getTime()/1000; // Yelp needs ?open_at parameter to be EPOC integer time in secs
        }
          // default search within 5 miles = 8046 meters
          let result = [];
          result = await callRateLimitedAPI('poisearch',{latitude:eachlocation.latitude,longitude:eachlocation.longitude, radius:parseInt(DEFAULTSEARCHRADIUSINMILES*MILETOMETER), type:eachlocation.type, limit:50, offset:0,locationRestriction:{}, tags:eachlocation.tags, open_at:estlocationarrivaltime});
          
        let poiresultsforthisstop = [];
        //  console.log(result.businesses)
        if (typeof result.businesses!=='undefined'){
          result.businesses.map(poi=>{
            
            if(poi.distance <= parseInt(DEFAULTSEARCHRADIUSINMILES*MILETOMETER)){
              poiresultsforthisstop.push(poi)
            } //else poiresultsforthisstop.push(poi)
          })
        }
        
        eachlocation.poisearchradiusinmiles=5;
        if (poiresultsforthisstop.length>0){
          eachlocation.poisearchbyoffsetarray.push(poiresultsforthisstop);
        }
        eachlocation.poiselected = poiresultsforthisstop.length>0?[0,0]:[-1,-1]; // select first choice [0,0] as chosen poi option 
        eachlocation.poisearchexpandradius = poiresultsforthisstop.length>0?0:1;
        eachlocation.totalpoisfound = result.total || 0;
        //google api returns nextPageToken
        if (typeof result.nextPageToken!=='undefined'){
          eachlocation.nextPageToken = result.nextPageToken;
        }
      
        if (typeof result.locationRestriction!=='undefined'){
          eachlocation.locationRestriction = result.locationRestriction;
        }
         
        eachlocation.poisearchtags = eachlocation.tags;
          return;
        })
      )
    }
    await AllPromises2();


    // // select first choice as chosen poi option
    // location.map( (eachlocation)=>{
    //   eachlocation.poiselected = eachlocation.poiselected || [];
    //   eachlocation.poisearchbyoffsetarray.map((eachpoi) => {
    //     if (eachpoi.length > 0){
    //       eachlocation.poiselected.push(0); // choosing the 1st poi 
    //     }else{
    //       eachlocation.poiselected.push(-1); // No poi exist therefore default to -1
    //     }
    //   })
    //   })


  } catch (error) {
    next(error);
  }

  // console.log('location array:');
  // console.log(location);


  
  // res.json(location); 
  res.json({
    stopIntervalsStartEndTimes: stopIntervalsStartEndTimes,
    stoparray:location,
  })
});



app.post("/poisearch", bodyParser.json(), async (req, res, next) => {
   console.log(`locating pois around individual stop at offset ${req.body.offset} `)
  let outresults={};
  let locations=[]
  try {
    let searchradius = req.body.radius || parseInt(DEFAULTSEARCHRADIUSINMILES*MILETOMETER) ;
         let result = await callRateLimitedAPI('poisearch',{latitude:req.body.latitude,longitude:req.body.longitude, radius:searchradius.toFixed(0), type:req.body.type, limit:req.body.limit||50, offset:req.body.offset, locationRestriction: req.body.locationRestriction, tags:req.body.tags, open_at: req.body.open_at});
        //  console.log(result)

        //Strangely Yelp api does not respect radius limits sometimes in non-zero offset calls.  
        result.businesses.map(poi=>{
          if(poi.distance <= searchradius){
            locations.push(poi)
          }
        });
        outresults.locations = locations;
        //google api returns nextPageToken
        if (typeof result.nextPageToken!=='undefined'){
          outresults.nextPageToken = result.nextPageToken;
        }
        

        if (typeof result.locationRestriction!=='undefined'){
          outresults.locationRestriction = result.locationRestriction;
        }
        

         
      if (locations.length<=0)  {
         throw new api500Error(" No locations were found within search radius")
      }
  } catch (error) {
    next(error);
  }
  // console.log(`End locating individual stop`)
  res.json(outresults);
});

app.use(logErrorMiddleware);
app.use(returnError);

module.exports = app;
