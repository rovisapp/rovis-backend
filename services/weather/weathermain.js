// example.js
const WeatherAssessment = require('./weatherAssessment');
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
const weatherParams = {
  // Temperature parameters
  TMP_2M: 273.15,        // 0°C - TMP:2 m above ground -- Required for Snow, fog forecast
  TSOIL: 272.15,         // -1°C - TSOIL:0-0.1 m below ground
  DPT_2M: 272.15,        // -1°C -- 2 m above ground,Required for Snow, fog forecast
  
  // Precipitation parameters
  PRATE: 0.001,          // Light precipitation - PRATE:surface -- Required for Rain forecast
  APCP: 2.5,             // Accumulated precipitation - APCP:surface -- Required for Rain forecast
  CPOFP: 80,             // 80% frozen precipitation - CPOFP:surface
  
  // Wind parameters
  UGRD_10M: 5.0,         // U-component wind - UGRD:10 m above ground
  VGRD_10M: 5.0,         // V-component wind - VGRD:10 m above ground
  GUST: 12.0,            // Wind gusts - GUST:surface
  
  // Visibility and clouds
  VIS: 5000,             // 5km visibility - VIS:surface -- Required for Rain, fog forecast
  LCDC: 75,              // Low cloud cover - LCDC:low cloud layer
  TCDC: 90,              // Total cloud cover - TCDC:entire atmosphere
  
  // Snow parameters
  SNOD: 0.05,            // Snow depth - SNOD:surface -- Required for Snow forecast
  WEASD: 10.0,           // Snow water equivalent - WEASD:surface -- Required for Snow forecast
  
  // Additional parameters
  RH: 90,                // Relative humidity - RH:2 m above ground -- Required for Rain, fog forecast
  PWAT: 15,              // Precipitable water - PWAT:entire atmosphere (considered as a single layer) -- Required for Rain forecast
  CAPE: 500,             // CAPE - CAPE:surface -- Required for thunderstorm forecast
  CIN: -50,              // CIN - CIN:surface -- Required for thunderstorm forecast
  REFC: 35,              // Composite reflectivity - REFC:entire atmosphere  -- Required for thunderstorm forecast
  
  // Road condition parameters
  ROAD_TEMP: 271.15,     // This is TSOIL , -2°C road temperature - TSOIL:0-0.1 m below ground
  ROAD_MOISTURE: 0.8,    // This is SOILW, Road moisture content - SOILW:0-0.1 m below ground
  
  // Categorical parameters
  CRAIN: 0,              // No rain - CRAIN:surface
  CSNOW: 1,              // Snow present - CSNOW:surface
  CFRZR: 0,              // No freezing rain - CFRZR:surface
  CICEP: 1               // Ice pellets present - CICEP:surface
};

// Optional custom thresholds
 const customDefaults = {}
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
const assessment = new WeatherAssessment(customDefaults);

// Get comprehensive assessment
const result = assessment.assessConditions(weatherParams);

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

const weatheresult = result;
module.exports = weatheresult;