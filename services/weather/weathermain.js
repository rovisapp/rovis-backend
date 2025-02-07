
const WeatherAssessment = require('./weatherAssessment');
const pool = require('../../db/config');
const logger = require('../../logger/logger');

/** 
 * https://www.nco.ncep.noaa.gov/pmb/products/gfs/
 * https://nomads.ncep.noaa.gov/gribfilter.php?ds=gfs_0p25
 * https://ftp.cpc.ncep.noaa.gov/wd51we/wgrib2/tricks.wgrib2
 * 
 * NOOA url : 
 * https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?dir=%2Fgfs.20250111%2F00%2Fatmos&file=gfs.t00z.pgrb2.0p25.f001&var_APCP=on&var_CAPE=on&var_CFRZR=on&var_CICEP=on&var_CIN=on&var_CPOFP=on&var_CRAIN=on&var_CSNOW=on&var_GUST=on&var_LCDC=on&var_PRATE=on&var_PWAT=on&var_REFC=on&var_RH=on&var_SNOD=on&var_SOILW=on&var_TCDC=on&var_TMP=on&var_TSOIL=on&var_UGRD=on&var_VGRD=on&var_VIS=on&var_WEASD=on&lev_0-0.1_m_below_ground=on&lev_2_m_above_ground=on&lev_10_m_above_ground=on&lev_surface=on&lev_entire_atmosphere=on&lev_entire_atmosphere_(considered_as_a_single_layer)=on&lev_low_cloud_layer=on
 * 
 * NOOA url (with lat,lon subreqion) : 
 * https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?dir=%2Fgfs.20250111%2F00%2Fatmos&file=gfs.t00z.pgrb2.0p25.f001&var_APCP=on&var_CAPE=on&var_CFRZR=on&var_CICEP=on&var_CIN=on&var_CPOFP=on&var_CRAIN=on&var_CSNOW=on&var_GUST=on&var_LCDC=on&var_PRATE=on&var_PWAT=on&var_REFC=on&var_RH=on&var_SNOD=on&var_SOILW=on&var_TCDC=on&var_TMP=on&var_TSOIL=on&var_UGRD=on&var_VGRD=on&var_VIS=on&var_WEASD=on&lev_0-0.1_m_below_ground=on&lev_2_m_above_ground=on&lev_10_m_above_ground=on&lev_surface=on&lev_entire_atmosphere=on&lev_entire_atmosphere_(considered_as_a_single_layer)=on&lev_low_cloud_layer=on&subregion=&toplat=90&leftlon=0&rightlon=360&bottomlat=-90
 * 
*/


// Example weather parameters
// const weatherParams = {
//   // Temperature parameters
//   TMP_2M: 273.15,        // 0°C - TMP:2 m above ground -- Required for Snow, fog forecast
//   TSOIL: 272.15,         // -1°C - TSOIL:0-0.1 m below ground
//   DPT_2M: 272.15,        // -1°C -- 2 m above ground,Required for Snow, fog forecast
  
//   // Precipitation parameters
//   PRATE: 0.001,          // Light precipitation - PRATE:surface -- Required for Rain forecast
//   APCP: 2.5,             // Accumulated precipitation - APCP:surface -- Required for Rain forecast
//   CPOFP: 80,             // 80% frozen precipitation - CPOFP:surface
  
//   // Wind parameters
//   UGRD_10M: 5.0,         // U-component wind - UGRD:10 m above ground
//   VGRD_10M: 5.0,         // V-component wind - VGRD:10 m above ground
//   GUST: 12.0,            // Wind gusts - GUST:surface
  
//   // Visibility and clouds
//   VIS: 5000,             // 5km visibility - VIS:surface -- Required for Rain, fog forecast
//   LCDC: 75,              // Low cloud cover - LCDC:low cloud layer
//   TCDC: 90,              // Total cloud cover - TCDC:entire atmosphere
  
//   // Snow parameters
//   SNOD: 0.05,            // Snow depth - SNOD:surface -- Required for Snow forecast
//   WEASD: 10.0,           // Snow water equivalent - WEASD:surface -- Required for Snow forecast
  
//   // Additional parameters
//   RH: 90,                // Relative humidity - RH:2 m above ground -- Required for Rain, fog forecast
//   PWAT: 15,              // Precipitable water - PWAT:entire atmosphere (considered as a single layer) -- Required for Rain forecast
//   CAPE: 500,             // CAPE - CAPE:surface -- Required for thunderstorm forecast
//   CIN: -50,              // CIN - CIN:surface -- Required for thunderstorm forecast
//   REFC: 35,              // Composite reflectivity - REFC:entire atmosphere  -- Required for thunderstorm forecast
  
//   // Road condition parameters
//   ROAD_TEMP: 271.15,     // This is TSOIL , -2°C road temperature - TSOIL:0-0.1 m below ground
//   ROAD_MOISTURE: 0.8,    // This is SOILW, Road moisture content - SOILW:0-0.1 m below ground
  
//   // Categorical parameters
//   CRAIN: 0,              // No rain - CRAIN:surface
//   CSNOW: 1,              // Snow present - CSNOW:surface
//   CFRZR: 0,              // No freezing rain - CFRZR:surface
//   CICEP: 1               // Ice pellets present - CICEP:surface
// };

// Optional custom thresholds
//  const customDefaults = {}
// const customDefaults = {
//   SNOW: {
//     ACCUMULATION: {
//       DEPTH: {
//         threshold: 0.08  // More sensitive snow depth threshold
//       }
//     }
//   }
// };



// Create assessment instance
// const assessment = new WeatherAssessment(customDefaults);

// Get comprehensive assessment
// const result = assessment.assessConditions(weatherParams);

// Print results
// console.log('\nWeather Conditions Assessment');
// console.log('============================');
// console.log(result)
// // Overall assessment
// console.log('\nOverall Assessment:');
// console.log(`Severity: ${result.overall.severity}`);
// console.log(`Confidence: ${result.overall.confidence.description}`);

// // Primary concerns
// console.log('\nPrimary Concerns:');
// result.overall.primaryConcerns.forEach(concern => {
//   console.log(`- ${concern.condition}: ${concern.severity} (${concern.confidence.toFixed(1)}% confidence)`);
// });

// // Driving recommendation
// console.log('\nDriving Recommendation:');
// console.log(result.overall.drivingRecommendation);

// Individual conditions
// console.log('\nDetailed Conditions:');
// Object.entries(result.conditions).forEach((condition) => {
//     console.log(condition)
//   if (assessment.severity !== 'Optimal') {
//     console.log(`\n${condition}:`);
//     console.log(`  Severity: ${assessment.severity}`);
//     console.log(`  Confidence: ${assessment.confidence.toFixed(1)}%`);
//     if (assessment.details) {
//       Object.entries(assessment.details).forEach(([key, detail]) => {
//         console.log(`  ${key}: ${detail}`);
//       });
//     }
//   }
// });

// // Parameter quality
// console.log('\nParameter Quality Assessment:');
// console.log(`Quality: ${result.parameterQuality.quality}`);
// if (result.parameterQuality.missingParams.length > 0) {
//   console.log('Missing Parameters:', result.parameterQuality.missingParams.join(', '));
// }
// console.log('Recommendation:', result.parameterQuality.recommendation);
// const weatheresult = result;
// module.exports = weatheresult;


const GRID_SPACING = 0.25; // GFS grid spacing in degrees
const MAX_POINTS = 4000; // Maximum number of points to return

function calculateGridPoints(bounds) {
  const latPoints = Math.ceil(Math.abs(bounds.high_lat - bounds.low_lat) / GRID_SPACING);
  const lonPoints = Math.ceil(Math.abs(bounds.high_lon - bounds.low_lon) / GRID_SPACING);
  console.log(`Grid calculation: ${latPoints} x ${lonPoints} = ${latPoints * lonPoints} points`);
  return { 
      latPoints, 
      lonPoints, 
      totalPoints: latPoints * lonPoints 
  };
}

// function adjustBoundsToMaxPoints(bounds) {
//   // Calculate center point
//   const centerLat = (bounds.high_lat + bounds.low_lat) / 2;
//   const centerLon = (bounds.high_lon + bounds.low_lon) / 2;

//   // Start with small box and increase until we hit max points
//   let latSpan = GRID_SPACING;
//   let numPoints = 0;

//   // Calculate aspect ratio of original bounds to maintain similar shape
//   const originalAspectRatio = (bounds.high_lon - bounds.low_lon) / (bounds.high_lat - bounds.low_lat);

//   while (numPoints < MAX_POINTS) {
//       // Maintain aspect ratio while increasing size 
//       const newLonSpan = latSpan * originalAspectRatio;
      
//       const adjustedBounds = {
//           low_lat: centerLat - (latSpan / 2),
//           high_lat: centerLat + (latSpan / 2),
//           low_lon: centerLon - (newLonSpan / 2),
//           high_lon: centerLon + (newLonSpan / 2)
//       };

//       const { totalPoints } = calculateGridPoints(adjustedBounds);
      
//       if (totalPoints > MAX_POINTS) {
//           // Go back to previous size that was under limit
//           latSpan -= GRID_SPACING;
//           break;
//       }

//       latSpan += GRID_SPACING;
//       numPoints = totalPoints;
//   }

//   // Calculate final bounds using the final latSpan and originalAspectRatio
//   const finalLonSpan = latSpan * originalAspectRatio;
  
//   return {
//     low_lon: centerLon - (finalLonSpan / 2),
//       low_lat: centerLat - (latSpan / 2),
//       high_lon: centerLon + (finalLonSpan / 2),
//       high_lat: centerLat + (latSpan / 2)
      
//   };
// }

function adjustBoundsToMaxPoints(bounds) {
  const GRID_SPACING = 0.25; // GFS grid spacing in degrees
  const MAX_POINTS = 4000; // Maximum number of points to return

  // Calculate center point (this remains exactly the same)
  const centerLat = (bounds.high_lat + bounds.low_lat) / 2;
  const centerLon = (bounds.high_lon + bounds.low_lon) / 2;

  // Original spans
  const originalLatSpan = bounds.high_lat - bounds.low_lat;
  const originalLonSpan = bounds.high_lon - bounds.low_lon;

  // Calculate original grid points
  const originalLatPoints = Math.ceil(originalLatSpan / GRID_SPACING);
  const originalLonPoints = Math.ceil(originalLonSpan / GRID_SPACING);
  const originalTotalPoints = originalLatPoints * originalLonPoints;

  // If already under 4000 points, return original bounds
  if (originalTotalPoints <= MAX_POINTS) {
    return bounds;
  }

  // Reduction factor calculation
  const reductionFactor = Math.sqrt(MAX_POINTS / originalTotalPoints);

  // New spans, maintaining center point
  const newLatSpan = originalLatSpan * reductionFactor;
  const newLonSpan = originalLonSpan * reductionFactor;

  return {
    low_lat: centerLat - (newLatSpan / 2),
    high_lat: centerLat + (newLatSpan / 2),
    low_lon: centerLon - (newLonSpan / 2),
    high_lon: centerLon + (newLonSpan / 2)
  };
}





// Parse PostGIS EWKB hex string to get coordinates
// EWKB format: [endianness(1)] + [type(4)] + [SRID(4)] + [X(8)] + [Y(8)]
function parseGeometry(ewkbHex) {
  // Skip first 18 chars (endianness + type + SRID)
  const coordsHex = ewkbHex.substring(18);
  
  // For double precision, read 16 chars (8 bytes) for each coordinate
  // Need to handle both little and big endian
  const isLittleEndian = ewkbHex.substring(0,2) === '01';
  
  let x, y;
  if (isLittleEndian) {
      // Reverse byte order for each coordinate
      const xHex = coordsHex.substring(0, 16).match(/../g).reverse().join('');
      const yHex = coordsHex.substring(16, 32).match(/../g).reverse().join('');
      x = Buffer.from(xHex, 'hex').readDoubleBE(0);
      y = Buffer.from(yHex, 'hex').readDoubleBE(0);
  } else {
      x = Buffer.from(coordsHex.substring(0, 16), 'hex').readDoubleBE(0);
      y = Buffer.from(coordsHex.substring(16, 32), 'hex').readDoubleBE(0);
  }
  
  return {
      latitude: y,
      longitude: x
  };
}


// Map database parameters to WeatherAssessment parameters
function mapDatabaseParamsToWeatherParams(params) {
  return {
      TMP_2M: params.TMP,
      DPT_2M: params.DPT,
      PRATE: params.PRATE,
      PWAT: params.PWAT,
      APCP: params.APCP,
      VIS: params.VIS,
      SNOD: params.SNOD,
      WEASD: params.WEASD,
      RH: params.RH,
      CAPE: params.CAPE,
      CIN: params.CIN,
      REFC: params.REFC
  };
}

// async function queryAndAssessWeather(bounds) {
//   try {
//       // Calculate number of points in requested bounds
//       const { totalPoints, latPoints, lonPoints } = calculateGridPoints(bounds);
//       logger.info(`Requested bounds would return ${totalPoints} points (${latPoints} x ${lonPoints})`);

//       // Adjust bounds if necessary
//       let queryBounds = bounds;
//       let boundsAdjusted = false;
//     //   console.log(queryBounds);
//       if (totalPoints > MAX_POINTS) {
//           queryBounds = adjustBoundsToMaxPoints(bounds);
//           boundsAdjusted = true;
//           const newPoints = calculateGridPoints(queryBounds);
//           logger.info(`Adjusted bounds to return ${newPoints.totalPoints} points (${newPoints.latPoints} x ${newPoints.lonPoints})`);
//       }
//       console.log(queryBounds);

//       const query = `
//           SELECT 
//               ST_AsEWKB(geom) as geom,
//               parameter,
//               hour_000, hour_003, hour_006, hour_009, hour_012, hour_015,
//               hour_018, hour_021, hour_024, hour_027, hour_030, hour_033,
//               hour_036, hour_039, hour_042, hour_045, hour_048, hour_051,
//               hour_054, hour_057, hour_060, hour_063, hour_066, hour_069,
//               hour_072, hour_075, hour_078, hour_081, hour_084, hour_087,
//               hour_090, hour_093, hour_096, hour_099, hour_102, hour_105,
//               hour_108, hour_111, hour_114, hour_117, hour_120, hour_123,
//               hour_126, hour_129, hour_132, hour_135, hour_138, hour_141,
//               hour_144, hour_147, hour_150, hour_153, hour_156, hour_159,
//               hour_162, hour_165, hour_168, hour_171, hour_174, hour_177,
//               hour_180, hour_183, hour_186, hour_189, hour_192, hour_195,
//               hour_198, hour_201, hour_204, hour_207, hour_210, hour_213,
//               hour_216, hour_219, hour_222, hour_225, hour_228, hour_231,
//               hour_234, hour_237, hour_240, hour_243, hour_246, hour_249,
//               hour_252, hour_255, hour_258, hour_261, hour_264, hour_267,
//               hour_270, hour_273, hour_276, hour_279, hour_282, hour_285,
//               hour_288, hour_291, hour_294, hour_297, hour_300, hour_303,
//               hour_306, hour_309, hour_312, hour_315, hour_318, hour_321,
//               hour_324, hour_327, hour_330, hour_333, hour_336, hour_339,
//               hour_342, hour_345, hour_348, hour_351, hour_354, hour_357,
//               hour_360, hour_363, hour_366, hour_369, hour_372, hour_375,
//               hour_378, hour_381, hour_384
//           FROM forecasts 
//           WHERE ST_Contains(
//               ST_MakeEnvelope($1, $2, $3, $4, 4326),
//               geom
//           )
//           ORDER BY geom, parameter;
//       `;
//     //   console.log(queryBounds);
//       const client = await pool.connect();
//       const result = await client.query(query, [
//           queryBounds.low_lon,
//           queryBounds.low_lat,
//           queryBounds.high_lon,
//           queryBounds.high_lat
//       ]);
//       client.release();

//       // Structure to hold our points data
//       const points = new Map();
//       const assessor = new WeatherAssessment();

//       // First pass: Group by geometry and organize data
//       console.log(`No of matching POSTGIS rows found ${result.rows.length}`)
//       for (const row of result.rows) {
//           const geomStr = row.geom.toString('hex');
          
//           if (!points.has(geomStr)) {
//               const coords = parseGeometry(geomStr);
//               points.set(geomStr, {
//                   coordinates: coords,
//                   parameters: {},
//                   geomstr:geomStr
//               });
//           }

//           const point = points.get(geomStr);
//           const parameter = row.parameter;
          
//           if (!point.parameters[parameter]) {
//               point.parameters[parameter] = {
//                   forecastHours: {}
//               };
//           }

//           // Process each forecast hour
//           for (let hour = 0; hour <= 384; hour += 3) {
//               const hourKey = `hour_${hour.toString().padStart(3, '0')}`;
//               const value = row[hourKey];

//               if (value !== null) {
//                   if (!point.parameters[parameter].forecastHours[hour]) {
//                       point.parameters[parameter].forecastHours[hour] = {
//                           value: value
//                       };
//                   }
//               }
//           }
//       }

//       // Second pass: Perform assessments for each point and forecast hour
//       for (const [geomStr, point] of points) {
//           for (let hour = 0; hour <= 384; hour += 3) {
//               const hourParams = {};
              
//               let hasData = false;
//               for (const [paramName, paramData] of Object.entries(point.parameters)) {
//                   if (paramData.forecastHours[hour]) {
//                       hourParams[paramName] = paramData.forecastHours[hour].value;
//                       hasData = true;
//                   }
//               }

//               if (!hasData) continue;

//               const weatherParams = mapDatabaseParamsToWeatherParams(hourParams);
//               const assessment = assessor.assessConditions(weatherParams);

//               for (const paramName of Object.keys(point.parameters)) {
//                   if (point.parameters[paramName].forecastHours[hour]) {
//                       point.parameters[paramName].forecastHours[hour].assessment = assessment;
//                   }
//               }
//           }
//       }

//       // Convert Map to array and add metadata
//       return {
//           metadata: {
//               requestedBounds: bounds,
//               actualBounds: boundsAdjusted ? queryBounds : bounds,
//               boundsAdjusted,
//               points: points.size
//           },
//           points: Array.from(points.values())
//       };

//   } catch (error) {
//       logger.error('Error in queryAndAssessWeather:', error);
//       throw error;
//   }
// }

async function queryAndAssessWeather(bounds) {
    try {
      const { totalPoints, latPoints, lonPoints } = calculateGridPoints(bounds);
      logger.info(`Requested bounds would return ${totalPoints} points (${latPoints} x ${lonPoints})`);
  
      let queryBounds = bounds;
      let boundsAdjusted = false;
  
      if (totalPoints > MAX_POINTS) {
        queryBounds = adjustBoundsToMaxPoints(bounds);
        boundsAdjusted = true;
        const newPoints = calculateGridPoints(queryBounds);
        logger.info(`Adjusted bounds to return ${newPoints.totalPoints} points (${newPoints.latPoints} x ${newPoints.lonPoints})`);
      }
  
      console.log(queryBounds);
  
      const query = `
        SELECT ST_AsEWKB(geom) as geom, parameter, 
          hour_000, hour_003, hour_006, hour_009, hour_012, hour_015, hour_018, hour_021, hour_024,
          hour_027, hour_030, hour_033, hour_036, hour_039, hour_042, hour_045, hour_048, hour_051,
          hour_054, hour_057, hour_060, hour_063, hour_066, hour_069, hour_072, hour_075, hour_078,
          hour_081, hour_084, hour_087, hour_090, hour_093, hour_096, hour_099, hour_102, hour_105,
          hour_108, hour_111, hour_114, hour_117, hour_120, hour_123, hour_126, hour_129, hour_132,
          hour_135, hour_138, hour_141, hour_144, hour_147, hour_150, hour_153, hour_156, hour_159,
          hour_162, hour_165, hour_168, hour_171, hour_174, hour_177, hour_180, hour_183, hour_186,
          hour_189, hour_192, hour_195, hour_198, hour_201, hour_204, hour_207, hour_210, hour_213,
          hour_216, hour_219, hour_222, hour_225, hour_228, hour_231, hour_234, hour_237, hour_240,
          hour_243, hour_246, hour_249, hour_252, hour_255, hour_258, hour_261, hour_264, hour_267,
          hour_270, hour_273, hour_276, hour_279, hour_282, hour_285, hour_288, hour_291, hour_294,
          hour_297, hour_300, hour_303, hour_306, hour_309, hour_312, hour_315, hour_318, hour_321,
          hour_324, hour_327, hour_330, hour_333, hour_336, hour_339, hour_342, hour_345, hour_348,
          hour_351, hour_354, hour_357, hour_360, hour_363, hour_366, hour_369, hour_372, hour_375,
          hour_378, hour_381, hour_384
        FROM forecasts 
        WHERE ST_Intersects(ST_MakeEnvelope($1, $2, $3, $4, 4326), geom)
        ORDER BY geom, parameter;
      `;
  
      const client = await pool.connect();
      const result = await client.query(query, [
        queryBounds.low_lon,
        queryBounds.low_lat,
        queryBounds.high_lon,
        queryBounds.high_lat
      ]);
      client.release();
  
      const points = new Map();
      const assessor = new WeatherAssessment();
  
      // First pass: Group by geometry and organize data
      console.log(`No of matching POSTGIS rows found ${result.rows.length}`);
  
      for (const row of result.rows) {
        const geomStr = row.geom.toString('hex');
        
        if (!points.has(geomStr)) {
          const coords = parseGeometry(geomStr);
          points.set(geomStr, {
            coordinates: coords,
            forecastHours: {},
            geomstr: geomStr
          });
        }
  
        const point = points.get(geomStr);
        const parameter = row.parameter;
  
        // Process each forecast hour
        for (let hour = 0; hour <= 384; hour += 3) {
          const hourKey = `hour_${hour.toString().padStart(3, '0')}`;
          const value = row[hourKey];
  
          if (value !== null) {
            if (!point.forecastHours[hour]) {
              point.forecastHours[hour] = {
                parameters: {}
              };
            }
            point.forecastHours[hour].parameters[parameter] = value;
          }
        }
      }
  
      // Second pass: Perform assessments for each point's forecast hours
      for (const [_, point] of points) {
        for (let hour = 0; hour <= 384; hour += 3) {
          if (!point.forecastHours[hour]) continue;
  
          const params = point.forecastHours[hour].parameters;
          if (Object.keys(params).length === 0) continue;
  
          const weatherParams = mapDatabaseParamsToWeatherParams(params);
          const assessment = assessor.assessConditions(weatherParams);
  
          // Store assessment for this specific forecast hour
          point.forecastHours[hour].assessment = assessment;
        }
        
      }
  
      return {
        metadata: {
          requestedBounds: bounds,
          actualBounds: boundsAdjusted ? queryBounds : bounds,
          boundsAdjusted,
          points: points.size
        },
        points: Array.from(points.values())
      };
  
    } catch (error) {
      logger.error('Error in queryAndAssessWeather:', error);
      throw error;
    }
  }


module.exports = {
  queryAndAssessWeather
};