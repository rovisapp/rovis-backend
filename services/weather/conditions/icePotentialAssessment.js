// icePotentialAssessment.js
const { normalizeValue, calculateConfidence } = require('../utils');

class IcePotentialAssessment {
  constructor(defaults) {
    this.config = defaults.ICE_POTENTIAL;
  }

  assess(params) {
    const factors = {
      surface_conditions: this.calculateSurfaceConditions(params),
      precipitation: this.calculatePrecipitation(params)
    };

    const assessment = this.calculateAssessment(factors, params);
    return {
      ...assessment,
      type: 'ICE_POTENTIAL',
      details: this.getDetailedAssessment(factors)
    };
  }

  calculateSurfaceConditions(params) {
    const config = this.config.SURFACE_CONDITIONS;
    
    // Temperature checks relative to freezing
    const surfaceTemp = params.TMP_2M || 273.15;
    const groundTemp = params.TSOIL || 273.15;
    const wetBulbTemp = params.WBT || surfaceTemp;

    return Math.min(1.0, Math.max(0.0,
      this.calculateFreezingProximity(surfaceTemp, config.TEMPERATURE.threshold) * 
        config.TEMPERATURE.weight +
      this.calculateFreezingProximity(wetBulbTemp, config.WETBULB.threshold) * 
        config.WETBULB.weight +
      this.calculateFreezingProximity(groundTemp, config.GROUND_TEMP.threshold) * 
        config.GROUND_TEMP.weight
    ));
  }

  calculateFreezingProximity(temp, threshold) {
    // Returns higher values when temperature is close to freezing
    const tempDiff = Math.abs(temp - threshold);
    return Math.exp(-0.5 * Math.pow(tempDiff / 2, 2)); // Gaussian curve centered at freezing
  }

  calculatePrecipitation(params) {
    const config = this.config.PRECIPITATION;
    return Math.min(1.0, Math.max(0.0,
      (params.CFRZR || 0) * config.FREEZING_RAIN.weight +
      (params.CICEP || 0) * config.ICE_PELLETS.weight +
      normalizeValue(params.CPOFP || 0, config.FROZEN_PRECIP.threshold) * 
        config.FROZEN_PRECIP.weight
    ));
  }

  calculateAssessment(factors, params) {
    const severityScore = Object.entries(factors).reduce((score, [key, value]) => {
      return score + value * this.config.SEVERITY_WEIGHTS[key];
    }, 0);

    const requiredParams = ['TMP_2M', 'TSOIL', 'CFRZR', 'CICEP', 'CPOFP'];
    const confidence = calculateConfidence(params, requiredParams);

    return {
      severity: this.getSeverityCategory(severityScore),
      confidence,
      factors
    };
  }

  getDetailedAssessment(factors) {
    return {
      surfaceConditions: this.getSurfaceDescription(factors.surface_conditions),
      precipitationType: this.getPrecipitationDescription(factors.precipitation)
    };
  }

  getSeverityCategory(score) {
    if (score < 0.25) return "Optimal";
    if (score < 0.5) return "Moderate";
    if (score < 0.75) return "Difficult";
    return "Severe";
  }

  getSurfaceDescription(level) {
    if (level < 0.25) return "Above freezing conditions";
    if (level < 0.5) return "Near freezing conditions";
    if (level < 0.75) return "Freezing conditions likely";
    return "Severe freezing conditions";
  }

  getPrecipitationDescription(level) {
    if (level < 0.25) return "No freezing precipitation";
    if (level < 0.5) return "Light freezing precipitation possible";
    if (level < 0.75) return "Moderate freezing precipitation";
    return "Severe freezing precipitation";
  }
}

module.exports = IcePotentialAssessment;