// fogAssessment.js
const { normalizeValue, calculateConfidence, calculateWeightedScores } = require('../utils');

class FogAssessment {
  constructor(defaults) {
    this.config = defaults.FOG;
  }

  assess(params) {
    const factors = {
      visibility: this.calculateVisibility(params),
      low_level_conditions: this.calculateLowLevelConditions(params)
    };

    const assessment = this.calculateAssessment(factors, params);
    return {
      ...assessment,
      type: 'FOG',
      details: this.getDetailedAssessment(factors)
    };
  }

  // calculateVisibility(params) {
  //   const config = this.config.VISIBILITY;
    
  //   // Calculate dewpoint depression
  //   const tempC = params.TMP_2M - 273.15;
  //   const dewC = params.DPT_2M - 273.15;
  //   const dewPointDepression = Math.max(0, tempC - dewC);

  //   return Math.min(1.0, Math.max(0.0,
  //     (1 - normalizeValue(params.VIS, config.VIS.threshold)) * config.VIS.weight +
  //     normalizeValue(params.RH, config.RH_SURFACE.threshold) * config.RH_SURFACE.weight +
  //     (1 - normalizeValue(dewPointDepression, config.DEW_POINT_DEPRESSION.threshold)) * 
  //       config.DEW_POINT_DEPRESSION.weight
  //   ));
  // }

  // calculateLowLevelConditions(params) {
  //   const config = this.config.LOW_LEVEL_CONDITIONS;
    
  //   // Calculate wind speed from components if available
  //   const windSpeed = params.WIND_SPEED || 
  //     Math.sqrt(Math.pow(params.UGRD_10M || 0, 2) + Math.pow(params.VGRD_10M || 0, 2));

  //   // Temperature inversion (if available)
  //   const inversion = params.TEMP_INVERSION || 0;

  //   return Math.min(1.0, Math.max(0.0,
  //     normalizeValue(params.CLOUD_BASE || Infinity, config.LOW_CLOUD_BASE.threshold) * 
  //       config.LOW_CLOUD_BASE.weight +
  //     (1 - normalizeValue(windSpeed, config.WIND_SPEED.threshold)) * config.WIND_SPEED.weight +
  //     normalizeValue(inversion, config.TEMPERATURE_INVERSION.threshold) * 
  //       config.TEMPERATURE_INVERSION.weight
  //   ));
  // }

  calculateVisibility(params) {
    const config = this.config.VISIBILITY;
    
    // Calculate dewpoint depression
    const tempC = params.TMP_2M - 273.15;
    const dewC = params.DPT_2M - 273.15;
    const dewPointDepression = Math.max(0, tempC - dewC);

    return Math.min(1.0, Math.max(0.0,
      calculateWeightedScores([
        {
          value: params.VIS,
          threshold: config.VIS.threshold,
          weight: config.VIS.weight,
          transform: (normalized) => 1 - normalized  // Inverse for visibility
        },
        {
          value: params.RH,
          threshold: config.RH_SURFACE.threshold,
          weight: config.RH_SURFACE.weight
        },
        {
          value: dewPointDepression,
          threshold: config.DEW_POINT_DEPRESSION.threshold,
          weight: config.DEW_POINT_DEPRESSION.weight,
          transform: (normalized) => 1 - normalized  // Inverse for depression
        }
      ])
    ));
}

calculateLowLevelConditions(params) {
    const config = this.config.LOW_LEVEL_CONDITIONS;
    
    // Calculate wind speed from components if available
    const windSpeed = params.WIND_SPEED !== undefined ? params.WIND_SPEED :
      (params.UGRD_10M !== undefined && params.VGRD_10M !== undefined) ?
        Math.sqrt(Math.pow(params.UGRD_10M, 2) + Math.pow(params.VGRD_10M, 2)) :
        undefined;

    return Math.min(1.0, Math.max(0.0,
      calculateWeightedScores([
        {
          value: params.CLOUD_BASE,
          threshold: config.LOW_CLOUD_BASE.threshold,
          weight: config.LOW_CLOUD_BASE.weight
        },
        {
          value: windSpeed,
          threshold: config.WIND_SPEED.threshold,
          weight: config.WIND_SPEED.weight,
          transform: (normalized) => 1 - normalized  // Inverse for wind speed, HIGH winds disperse fog therefore LOW severity
        },
        {
          value: params.TEMP_INVERSION,
          threshold: config.TEMPERATURE_INVERSION.threshold,
          weight: config.TEMPERATURE_INVERSION.weight
        }
      ])
    ));
}

  calculateAssessment(factors, params) {
    const severityScore = Object.entries(factors).reduce((score, [key, value]) => {
      return score + value * this.config.SEVERITY_WEIGHTS[key];
    }, 0);

    const requiredParams = ['VIS', 'RH', 'TMP_2M', 'DPT_2M'];
    const confidence = calculateConfidence(params, requiredParams);

    return {
      severity: this.getSeverityCategory(severityScore),
      confidence,
      factors
    };
  }

  getDetailedAssessment(factors) {
    return {
      visibilityConditions: this.getVisibilityDescription(factors.visibility),
      surfaceConditions: this.getLowLevelDescription(factors.low_level_conditions)
    };
  }

  getSeverityCategory(score) {
    if (score < 0.25) return "Optimal";
    if (score < 0.5) return "Moderate";
    if (score < 0.75) return "Difficult";
    return "Severe";
  }

  getVisibilityDescription(level) {
    if (level < 0.25) return "Good visibility, no fog";
    if (level < 0.5) return "Light fog possible";
    if (level < 0.75) return "Moderate fog";
    return "Dense fog";
  }

  getLowLevelDescription(level) {
    if (level < 0.25) return "Conditions unfavorable for fog";
    if (level < 0.5) return "Conditions marginally favorable for fog";
    if (level < 0.75) return "Conditions favorable for fog";
    return "Conditions highly favorable for fog persistence";
  }
}

module.exports = FogAssessment;