// snowAssessment.js
const { normalizeValue, calculateConfidence } = require('../utils');

class SnowAssessment {
  constructor(defaults) {
    this.config = defaults.SNOW;
  }

  assess(params) {
    const factors = {
      accumulation: this.calculateAccumulation(params),
      temperature: this.calculateTemperature(params)
    };

    const assessment = this.calculateAssessment(factors, params);
    return {
      ...assessment,
      type: 'SNOW',
      details: this.getDetailedAssessment(factors)
    };
  }

  calculateAccumulation(params) {
    const config = this.config.ACCUMULATION;
    return Math.min(1.0, Math.max(0.0,
      normalizeValue(params.SNOD || 0, config.DEPTH.threshold) * config.DEPTH.weight +
      normalizeValue(params.WEASD || 0, config.WATER_EQUIV.threshold) * config.WATER_EQUIV.weight +
      normalizeValue((params.SNOWRATE || 0), config.RATE.threshold) * config.RATE.weight
    ));
  }

  calculateTemperature(params) {
    const config = this.config.TEMPERATURE;
    const surfaceTemp = params.TMP_2M || 273.15;
    const dewPoint = params.DPT_2M || 273.15;

    return Math.min(1.0, Math.max(0.0,
      (1 - normalizeValue(surfaceTemp, config.SURFACE.threshold)) * config.SURFACE.weight +
      (1 - normalizeValue(dewPoint, config.DEW_POINT.threshold)) * config.DEW_POINT.weight
    ));
  }

  calculateAssessment(factors, params) {
    const severityScore = Object.entries(factors).reduce((score, [key, value]) => {
      return score + value * this.config.SEVERITY_WEIGHTS[key];
    }, 0);

    const requiredParams = ['SNOD', 'WEASD', 'TMP_2M', 'DPT_2M'];
    const confidence = calculateConfidence(params, requiredParams);

    return {
      severity: this.getSeverityCategory(severityScore),
      confidence,
      factors
    };
  }

  getDetailedAssessment(factors) {
    return {
      snowAccumulation: this.getAccumulationDescription(factors.accumulation),
      temperatureConditions: this.getTemperatureDescription(factors.temperature)
    };
  }

  getSeverityCategory(score) {
    if (score < 0.25) return "Optimal";
    if (score < 0.5) return "Moderate";
    if (score < 0.75) return "Difficult";
    return "Severe";
  }

  getAccumulationDescription(level) {
    if (level < 0.25) return "Light or no snow accumulation";
    if (level < 0.5) return "Moderate snow accumulation";
    if (level < 0.75) return "Heavy snow accumulation";
    return "Severe snow accumulation";
  }

  getTemperatureDescription(level) {
    if (level < 0.25) return "Temperatures unfavorable for snow";
    if (level < 0.5) return "Temperatures marginally favorable for snow";
    if (level < 0.75) return "Temperatures favorable for snow";
    return "Temperatures highly favorable for snow";
  }
}

module.exports = SnowAssessment;