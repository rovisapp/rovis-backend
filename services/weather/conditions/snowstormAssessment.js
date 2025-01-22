// snowstormAssessment.js
const { normalizeValue, calculateConfidence } = require('../utils');

class SnowstormAssessment {
  constructor(defaults) {
    this.config = defaults.SNOWSTORM;
  }

  assess(params) {
    const factors = {
      snow_conditions: this.calculateSnowConditions(params),
      wind_conditions: this.calculateWindConditions(params)
    };

    const assessment = this.calculateAssessment(factors, params);
    return {
      ...assessment,
      type: 'SNOWSTORM',
      details: this.getDetailedAssessment(factors)
    };
  }

  calculateSnowConditions(params) {
    const config = this.config.SNOW_CONDITIONS;
    
    // Calculate snow rate from precipitation rate if not directly available
    const snowRate = params.SNOW_RATE || 
      (((params.PRATE || 0) * 3600) * (params.CPOFP || 0) / 100);

    return Math.min(1.0, Math.max(0.0,
      normalizeValue(snowRate, config.RATE.threshold) * config.RATE.weight +
      (1 - normalizeValue(params.VIS || Infinity, config.VISIBILITY.threshold)) * 
        config.VISIBILITY.weight +
      normalizeValue(params.SNOD_RATE || 0, config.ACCUMULATION.threshold) * 
        config.ACCUMULATION.weight
    ));
  }

  calculateWindConditions(params) {
    const config = this.config.WIND_CONDITIONS;
    
    // Calculate wind speed from components if not directly available
    const windSpeed = params.WIND_SPEED || 
      Math.sqrt(Math.pow(params.UGRD_10M || 0, 2) + Math.pow(params.VGRD_10M || 0, 2));

    return Math.min(1.0, Math.max(0.0,
      normalizeValue(windSpeed, config.SPEED.threshold) * config.SPEED.weight +
      normalizeValue(params.GUST || 0, config.GUST.threshold) * config.GUST.weight
    ));
  }

  calculateAssessment(factors, params) {
    const severityScore = Object.entries(factors).reduce((score, [key, value]) => {
      return score + value * this.config.SEVERITY_WEIGHTS[key];
    }, 0);

    const requiredParams = ['VIS', 'UGRD_10M', 'VGRD_10M', 'SNOD_RATE'];
    const confidence = calculateConfidence(params, requiredParams);

    return {
      severity: this.getSeverityCategory(severityScore),
      confidence,
      factors
    };
  }

  getDetailedAssessment(factors) {
    return {
      snowConditions: this.getSnowConditionsDescription(factors.snow_conditions),
      windConditions: this.getWindConditionsDescription(factors.wind_conditions)
    };
  }

  getSeverityCategory(score) {
    if (score < 0.25) return "Optimal";
    if (score < 0.5) return "Moderate";
    if (score < 0.75) return "Difficult";
    return "Severe";
  }

  getSnowConditionsDescription(level) {
    if (level < 0.25) return "Light snow conditions";
    if (level < 0.5) return "Moderate snowfall";
    if (level < 0.75) return "Heavy snowfall";
    return "Severe snowstorm conditions";
  }

  getWindConditionsDescription(level) {
    if (level < 0.25) return "Light winds";
    if (level < 0.5) return "Moderate winds";
    if (level < 0.75) return "Strong winds";
    return "Severe blizzard conditions";
  }
}

module.exports = SnowstormAssessment;