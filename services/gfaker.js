require('dotenv').config();
const {hardcodedplaces1} = require('../.dataseed/hardcodedplaces');
const{distance} = require('./geodatasource')

function convertGooglePlaceToYelpPlace(googlePlace) {
   //console.log(googlePlace)

    return {
      ...googlePlace,  // Spread the remaining attributes into the object
        name: googlePlace.displayName.text,
        location: {
            display_address: [googlePlace.formattedAddress],
            latitude: googlePlace.location.latitude,
            longitude: googlePlace.location.longitude
        },
        rating: googlePlace.rating,
        review_count: googlePlace.userRatingCount,
        url: googlePlace.websiteUri,
        distance: googlePlace.distance,
        price: googlePlace.priceLevel,
        coordinates: {
            latitude: googlePlace.location.latitude,
            longitude: googlePlace.location.longitude
        },
        categories: (googlePlace.types || []).map(type => ({
          title: type
      }))
        
    };
}



function getRandomCoordinates(locationBias) {
    const center = locationBias.circle.center;
    const radius = locationBias.circle.radius; // in meters
  
    const earthRadius = 6371000; // Earth radius in meters
  
    // Convert the radius from meters to degrees
    const latDelta = radius / earthRadius; // in degrees
    const lonDelta = radius / (earthRadius * Math.cos(Math.PI * center.latitude / 180)); // adjust for the curvature of the Earth
  
    // Generate a random angle within the circle
    const randomAngle = Math.random() * 2 * Math.PI;
  
    // Random distance from the center, within the circle
    const randomDistance = Math.random() * radius;
  
    // Calculate the change in latitude and longitude based on the random distance and angle
    const deltaLat = randomDistance * Math.sin(randomAngle) / earthRadius;
    const deltaLon = randomDistance * Math.cos(randomAngle) / (earthRadius * Math.cos(Math.PI * center.latitude / 180));
  
    // Calculate the new random coordinates
    const randomLat = center.latitude + deltaLat * (180 / Math.PI); // Convert radians back to degrees
    const randomLon = center.longitude + deltaLon * (180 / Math.PI); // Convert radians back to degrees
  
    return { latitude: randomLat, longitude: randomLon };
  }

  function getRandomCoordinatesfromRectangle(locationRestriction) {
    const { low, high } = locationRestriction.rectangle;
  
    // Get random latitude and longitude within the bounds
    const randomLat = low.latitude + (Math.random() * (high.latitude - low.latitude));
    const randomLon = low.longitude + (Math.random() * (high.longitude - low.longitude));
  
    // Calculate center point of rectangle
    const centerLat = (low.latitude + high.latitude) / 2;
    const centerLon = (low.longitude + high.longitude) / 2;
  
    // Calculate distance from center in meters
    const distfromcenter = distance(
      randomLat, 
      randomLon,
      centerLat,
      centerLon,
      "K"
    ) * 1000; // Convert km to meters
  
    return {
      randomCoordinates: {
        latitude: randomLat,
        longitude: randomLon
      },
      distfromcenter
    };
  }



const gsearch = (req,res) =>{
    // Check for required headers
  const apiKey = req.header('X-Goog-Api-Key');
  const fieldMask = req.header('X-Goog-FieldMask');

  if (!apiKey || !fieldMask) {
      return res.status(400).json({ error: 'Missing required headers.' });
  }
 // Check if API key matches the one in .env
 if (!apiKey || apiKey !== process.env.GOOGLE_API_KEY) {
  return res.status(403).json({ error: 'Invalid API key.' });
}
console.log('gfaker body')
console.log(req.body);
  // Validate request body structure
  let { locationRestriction, textQuery, pageToken } = req.body;
  if (!locationRestriction || !textQuery) {
      return res.status(400).json({ error: 'Invalid request body.' });
  }

   // Prepare response based on pageToken
   let responsePlaces = hardcodedplaces1.places; // Default to all places
   let nextpageToken = [];
   pageToken = pageToken || '';
   if(pageToken==''){
    pageToken = '0~1~2';
   }

       try {
        console.log('Received pageToken:', pageToken); // Debugging line
           // Parse the pageToken string as JSON
           const indices = pageToken.split('~');
           const lastElement = Number(indices[indices.length - 1]);
           nextpageToken = [lastElement+1,lastElement+2,lastElement+3 ];
           
           if (lastElement+1<hardcodedplaces1.places.length)
           nextpageToken=nextpageToken.join('~');
          else
          nextpageToken='';
        
          console.log('next pageToken:' + nextpageToken);
           // Ensure indices is an array
           if (!Array.isArray(indices)) {
               return res.status(400).json({ error: 'pageToken must be a valid JSON array.' });
           }

           // Filter the hardcoded places based on indices
           responsePlaces = indices.map(index => hardcodedplaces1.places[index]).filter(place => place !== undefined);
           //update locations to random 
           responsePlaces =responsePlaces.map(place=>{
            const {randomCoordinates, distfromcenter}  = getRandomCoordinatesfromRectangle(locationRestriction);
            // const randomCoordinates  = getRandomCoordinates(locationBias);
            // const distfromcenter = distance(
            //   randomCoordinates.latitude,
            //   randomCoordinates.longitude,
            //   locationBias.circle.center.latitude,
            //   locationBias.circle.center.longitude,
            //   "K"
            // ) * 1000;

            return convertGooglePlaceToYelpPlace({
              ...place,
              distance: distfromcenter,
              location : {
                latitude: randomCoordinates.latitude,
                longitude: randomCoordinates.longitude,
              }
            })
           })

       } catch (error) {
        console.log(error);
           return res.status(400).json({ error: 'Invalid pageToken format. It must be a valid JSON array.' });
       }
// console.log(responsePlaces)
       // Return the hardcoded places response
       if(nextpageToken!=''){
       return res.json({places:responsePlaces, nextPageToken:nextpageToken});
      } else {
        return res.json({places:responsePlaces});
      }
}


module.exports = {
    gsearch,
};