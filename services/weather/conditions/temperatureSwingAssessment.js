// temperatureSwingAssessment.js
const { normalizeValue, calculateConfidence } = require('../utils');

class TemperatureSwingAssessment {
  constructor(defaults) {
    this.config = defaults.TEMPERATURE_SWING;
  }

  assess(params) {
    const factors = {
      temperature_change: this.calculateTemperatureChange(params),
      moisture_conditions: this.calculateMoistureConditions(params)
    };

    const assessment = this.calculateAssessment(factors, params);
    return {
      ...assessment,
      type: 'TEMPERATURE_SWING',
      details: this.getDetailedAssessment(factors)
    };
  }

  calculateTemperatureChange(params) {
    const config = this.config.TEMPERATURE_CHANGE;
    
    // Calculate temperature swing
    const maxSwing = Math.abs((params.TMAX || 0) - (params.TMIN || 0));
    const changeRate = params.TEMP_CHANGE_RATE || 0;
    const changeDuration = params.TEMP_CHANGE_DURATION || 0;

    return Math.min(1.0, Math.max(0.0,
      normalizeValue(maxSwing, config.MAX_SWING.threshold) * config.MAX_SWING.weight +
      normalizeValue(changeRate, config.RATE.threshold) * config.RATE.weight +
      normalizeValue(changeDuration, config.PERSISTENCE.threshold) * config.PERSISTENCE.weight
    ));
  }

  calculateMoistureConditions(params) {
    const config = this.config.MOISTURE_CONDITIONS;
    
    // Calculate relative humidity and dew point changes
    const rhChange = Math.abs(params.RH_CHANGE || 0);
    const dewPointChange = Math.abs(params.DPT_CHANGE || 0);

    return Math.min(1.0, Math.max(0.0,
      normalizeValue(rhChange, config.RH_CHANGE.threshold) * config.RH_CHANGE.weight +
      normalizeValue(dewPointChange, config.DEW_POINT_CHANGE.threshold) * 
        config.DEW_POINT_CHANGE.weight
    ));
  }

  calculateAssessment(factors, params) {
    const severityScore = Object.entries(factors).reduce((score, [key, value]) => {
      return score + value * this.config.SEVERITY_WEIGHTS[key];
    }, 0);

    const requiredParams = ['TMAX', 'TMIN', 'RH_CHANGE', 'DPT_CHANGE'];
    const confidence = calculateConfidence(params, requiredParams);

    return {
      severity: this.getSeverityCategory(severityScore),
      confidence,
      factors
    };
  }

  getDetailedAssessment(factors) {
    return {
      temperatureChange: this.getTemperatureChangeDescription(factors.temperature_change),
      moistureChange: this.getMoistureChangeDescription(factors.moisture_conditions)
    };
  }

  getSeverityCategory(score) {
    if (score < 0.25) return "Optimal";
    if (score < 0.5) return "Moderate";
    if (score < 0.75) return "Difficult";
    return "Severe";
  }

  getTemperatureChangeDescription(level) {
    if (level < 0.25) return "Stable temperature conditions";
    if (level < 0.5) return "Moderate temperature changes";
    if (level < 0.75) return "Significant temperature swings";
    return "Severe temperature fluctuations";
  }

  getMoistureChangeDescription(level) {
    if (level < 0.25) return "Stable moisture conditions";
    if (level < 0.5) return "Moderate moisture changes";
    if (level < 0.75) return "Significant moisture changes";
    return "Severe moisture fluctuations";
  }
}

module.exports = TemperatureSwingAssessment;