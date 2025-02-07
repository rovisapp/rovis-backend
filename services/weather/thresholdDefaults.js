// thresholdDefaults.js

const defaults = {
    RAIN: {
      PRECIPITATION_INTENSITY: {
        RATE: {
          threshold: 10.0,    // mm/hr considered heavy rain
          weight: 0.5,
          description: "Surface precipitation rate"
        },
        ACCUMULATION: {
          threshold: 20.0,    // mm/3hr considered heavy accumulation
          weight: 0.3,
          description: "Total precipitation accumulation"
        },
        CONV_RATE: {
          threshold: 5.0,     // mm/hr convective precipitation
          weight: 0.2,
          description: "Convective precipitation rate"
        }
      },
      VISIBILITY_IMPACT: {
        VIS: {
          threshold: 6000.0, // m considered clear visibility
          weight: 0.6,
          description: "Surface visibility"
        },
        LOW_CLOUD_COVER: {
          threshold: 100.0,   // percent
          weight: 0.4,
          description: "Low cloud cover percentage"
        }
      },
      ATMOSPHERIC_CONDITIONS: {
        RH: {
          threshold: 95.0,    // percent
          weight: 0.3,
          description: "Relative humidity"
        },
        PWAT: {
          threshold: 50.0,    // kg/m^2
          weight: 0.4,
          description: "Precipitable water"
        },
        PRESSURE_TREND: {
          threshold: 300.0,   // Pa/3hr
          weight: 0.3,
          description: "Pressure trend"
        }
      },
      SEVERITY_WEIGHTS: {
        precipitation_intensity: 0.4,
        visibility_impact: 0.3,
        atmospheric_conditions: 0.3
      }
    },
  
    SNOW: {
      ACCUMULATION: {
        DEPTH: {
          threshold: 0.05,    // m fresh snow
          weight: 0.4,
          description: "Snow depth"
        },
        WATER_EQUIV: {
          threshold: 10.0,    // kg/m^2
          weight: 0.3,
          description: "Snow water equivalent"
        },
        RATE: {
          threshold: 0.02,    // m/hr
          weight: 0.3,
          description: "Snowfall rate"
        }
      },
      TEMPERATURE: {
        SURFACE: {
          threshold: 273.15,  // K (0°C)
          weight: 0.5,
          description: "Surface temperature"
        },
        DEW_POINT: {
          threshold: 270.15,  // K (-3°C)
          weight: 0.5,
          description: "Dew point temperature"
        }
      },
      SEVERITY_WEIGHTS: {
        accumulation: 0.5,
        temperature: 0.5
      }
    },
  
    FOG: {
      VISIBILITY: {
        VIS: {
          threshold: 1000.0,  // m dense fog
          weight: 0.5,
          description: "Surface visibility"
        },
        RH_SURFACE: {
          threshold: 95.0,    // percent
          weight: 0.3,
          description: "Surface relative humidity"
        },
        DEW_POINT_DEPRESSION: {
          threshold: 2.0,     // K
          weight: 0.2,
          description: "Temperature-dewpoint difference"
        }
      },
      LOW_LEVEL_CONDITIONS: {
        LOW_CLOUD_BASE: {
          threshold: 100.0,   // m
          weight: 0.4,
          description: "Height of cloud base"
        },
        WIND_SPEED: {
          threshold: 3.0,     // m/s
          weight: 0.3,
          description: "Surface wind speed"
        },
        TEMPERATURE_INVERSION: {
          threshold: 2.0,     // K
          weight: 0.3,
          description: "Temperature inversion strength"
        }
      },
      SEVERITY_WEIGHTS: {
        visibility: 0.6,
        low_level_conditions: 0.4
      }
    },
  
    WIND: {
      SURFACE_WIND: {
        GUST: {
          threshold: 15.0,    // m/s strong gusts
          weight: 0.4,
          description: "Wind gusts"
        },
        SUSTAINED: {
          threshold: 10.0,    // m/s sustained
          weight: 0.4,
          description: "Sustained wind speed"
        },
        DIRECTION_VARIABILITY: {
          threshold: 45.0,    // degrees
          weight: 0.2,
          description: "Wind direction variability"
        }
      },
      TURBULENCE: {
        FRICTION_VELOCITY: {
          threshold: 0.5,     // m/s
          weight: 0.4,
          description: "Surface friction velocity"
        },
        VERTICAL_SHEAR: {
          threshold: 0.05,    // 1/s
          weight: 0.3,
          description: "Vertical wind shear"
        },
        TKE: {
          threshold: 1.0,     // m^2/s^2
          weight: 0.3,
          description: "Turbulent kinetic energy"
        }
      },
      SEVERITY_WEIGHTS: {
        surface_wind: 0.6,
        turbulence: 0.4
      }
    },
  
    THUNDERSTORM: {
      INSTABILITY: {
        CAPE: {
          threshold: 1000.0,  // J/kg
          weight: 0.4,
          description: "Convective Available Potential Energy"
        },
        CIN: {
          threshold: -100.0,  // J/kg
          weight: 0.3,
          description: "Convective Inhibition"
        },
        LI: {
          threshold: -4.0,    // K
          weight: 0.3,
          description: "Lifted Index"
        }
      },
      RADAR: {
        REFL_COMPOSITE: {
          threshold: 45.0,    // dBZ
          weight: 0.5,
          description: "Composite reflectivity"
        },
        ECHO_TOP: {
          threshold: 10000.0, // m
          weight: 0.3,
          description: "Echo top height"
        },
        VIL: {
          threshold: 30.0,    // kg/m^2
          weight: 0.2,
          description: "Vertically Integrated Liquid"
        }
      },
      SEVERITY_WEIGHTS: {
        instability: 0.5,
        radar: 0.5
      }
    },
  
    SNOWSTORM: {
      SNOW_CONDITIONS: {
        RATE: {
          threshold: 0.05,    // m/hr
          weight: 0.4,
          description: "Snowfall rate"
        },
        VISIBILITY: {
          threshold: 500.0,   // m
          weight: 0.3,
          description: "Visibility in snow"
        },
        ACCUMULATION: {
          threshold: 0.1,     // m/3hr
          weight: 0.3,
          description: "Snow accumulation rate"
        }
      },
      WIND_CONDITIONS: {
        SPEED: {
          threshold: 10.0,    // m/s
          weight: 0.5,
          description: "Wind speed"
        },
        GUST: {
          threshold: 15.0,    // m/s
          weight: 0.5,
          description: "Wind gusts"
        }
      },
      SEVERITY_WEIGHTS: {
        snow_conditions: 0.6,
        wind_conditions: 0.4
      }
    },
  
    ICE_POTENTIAL: {
      SURFACE_CONDITIONS: {
        TEMPERATURE: {
          threshold: 273.15,  // K (0°C)
          weight: 0.4,
          description: "Surface temperature"
        },
        WETBULB: {
          threshold: 273.15,  // K (0°C)
          weight: 0.3,
          description: "Wet-bulb temperature"
        },
        GROUND_TEMP: {
          threshold: 273.15,  // K (0°C)
          weight: 0.3,
          description: "Ground temperature"
        }
      },
      PRECIPITATION: {
        FREEZING_RAIN: {
          threshold: 1.0,     // categorical
          weight: 0.4,
          description: "Freezing rain likelihood"
        },
        ICE_PELLETS: {
          threshold: 1.0,     // categorical
          weight: 0.3,
          description: "Ice pellets likelihood"
        },
        FROZEN_PRECIP: {
          threshold: 50.0,    // percent
          weight: 0.3,
          description: "Frozen precipitation percentage"
        }
      },
      SEVERITY_WEIGHTS: {
        surface_conditions: 0.5,
        precipitation: 0.5
      }
    },
  
    TEMPERATURE_SWING: {
      TEMPERATURE_CHANGE: {
        MAX_SWING: {
          threshold: 10.0,    // K/12hr
          weight: 0.4,
          description: "Maximum temperature change"
        },
        RATE: {
          threshold: 5.0,     // K/hr
          weight: 0.3,
          description: "Rate of temperature change"
        },
        PERSISTENCE: {
          threshold: 6.0,     // hours
          weight: 0.3,
          description: "Duration of rapid change"
        }
      },
      MOISTURE_CONDITIONS: {
        RH_CHANGE: {
          threshold: 30.0,    // percent
          weight: 0.5,
          description: "Relative humidity change"
        },
        DEW_POINT_CHANGE: {
          threshold: 5.0,     // K
          weight: 0.5,
          description: "Dew point temperature change"
        }
      },
      SEVERITY_WEIGHTS: {
        temperature_change: 0.7,
        moisture_conditions: 0.3
      }
    },
  
    ROAD_CONDITIONS: {
      SURFACE: {
        TEMPERATURE: {
          threshold: 273.15,  // K (0°C)
          weight: 0.4,
          description: "Road surface temperature"
        },
        MOISTURE: {
          threshold: 0.5,     // fraction
          weight: 0.3,
          description: "Surface moisture content"
        },
        STATE: {
          threshold: 1.0,     // categorical
          weight: 0.3,
          description: "Surface state (wet/dry/frozen)"
        }
      },
      SUB_SURFACE: {
        TEMPERATURE: {
          threshold: 273.15,  // K (0°C)
          weight: 0.5,
          description: "Sub-surface temperature"
        },
        MOISTURE: {
          threshold: 0.3,     // fraction
          weight: 0.5,
          description: "Sub-surface moisture content"
        }
      },
      SEVERITY_WEIGHTS: {
        surface: 0.7,
        sub_surface: 0.3
      }
    }
  };
  
  module.exports = defaults;