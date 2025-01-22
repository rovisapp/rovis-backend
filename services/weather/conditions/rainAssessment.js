// rainAssessment.js

const { normalizeValue, calculateConfidence } = require('../utils');

class RainAssessment {
  constructor(defaults) {
    this.config = defaults.RAIN;
  }

  assess(params) {
    const factors = {
      precipitation_intensity: this.calculatePrecipitationIntensity(params),
      visibility_impact: this.calculateVisibilityImpact(params),
      atmospheric_conditions: this.calculateAtmosphericConditions(params)
    };

    const assessment = this.calculateAssessment(factors, params);
    return {
      ...assessment,
      type: 'RAIN',
      details: this.getDetailedAssessment(factors)
    };
  }

  calculatePrecipitationIntensity(params) {
    const config = this.config.PRECIPITATION_INTENSITY;
    const hourlyRate = params.PRATE * 3600; // Convert to mm/hr

    return Math.min(1.0, Math.max(0.0,
      normalizeValue(hourlyRate, config.RATE.threshold) * config.RATE.weight +
      normalizeValue(params.APCP, config.ACCUMULATION.threshold) * config.ACCUMULATION.weight +
      normalizeValue((params.CPRAT || 0) * 3600, config.CONV_RATE.threshold) * config.CONV_RATE.weight
    ));
  }

  calculateVisibilityImpact(params) {
    const config = this.config.VISIBILITY_IMPACT;
    return Math.min(1.0, Math.max(0.0,
      (1 - normalizeValue(params.VIS, config.VIS.threshold)) * config.VIS.weight +
      normalizeValue(params.LCDC || 0, config.LOW_CLOUD_COVER.threshold) * config.LOW_CLOUD_COVER.weight
    ));
  }

  calculateAtmosphericConditions(params) {
    const config = this.config.ATMOSPHERIC_CONDITIONS;
    return Math.min(1.0, Math.max(0.0,
      normalizeValue(params.RH, config.RH.threshold) * config.RH.weight +
      normalizeValue(params.PWAT, config.PWAT.threshold) * config.PWAT.weight +
      normalizeValue(Math.abs(params.PRES_TREND || 0), config.PRESSURE_TREND.threshold) * 
        config.PRESSURE_TREND.weight
    ));
  }

  calculateAssessment(factors, params) {
    const severityScore = Object.entries(factors).reduce((score, [key, value]) => {
      return score + value * this.config.SEVERITY_WEIGHTS[key];
    }, 0);

    const requiredParams = ['PRATE', 'APCP', 'VIS', 'RH', 'PWAT'];
    const confidence = calculateConfidence(params, requiredParams);

    return {
      severity: this.getSeverityCategory(severityScore),
      confidence,
      factors
    };
  }

  getDetailedAssessment(factors) {
    return {
      precipitationIntensity: this.getIntensityDescription(factors.precipitation_intensity),
      visibilityConditions: this.getVisibilityDescription(factors.visibility_impact),
      atmosphericConditions: this.getAtmosphericDescription(factors.atmospheric_conditions)
    };
  }

  getSeverityCategory(score) {
    if (score < 0.25) return "Optimal";
    if (score < 0.5) return "Moderate";
    if (score < 0.75) return "Difficult";
    return "Severe";
  }

  getIntensityDescription(level) {
    if (level < 0.25) return "Light or no rainfall";
    if (level < 0.5) return "Moderate rainfall";
    if (level < 0.75) return "Heavy rainfall";
    return "Severe rainfall";
  }

  getVisibilityDescription(level) {
    if (level < 0.25) return "Good visibility";
    if (level < 0.5) return "Moderately reduced visibility";
    if (level < 0.75) return "Poor visibility";
    return "Severely restricted visibility";
  }

  getAtmosphericDescription(level) {
    if (level < 0.25) return "Stable conditions";
    if (level < 0.5) return "Moderately unstable";
    if (level < 0.75) return "Unstable conditions";
    return "Severely unstable conditions";
  }
}

module.exports = RainAssessment;