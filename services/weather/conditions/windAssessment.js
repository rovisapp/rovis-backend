// windAssessment.js
const { normalizeValue, calculateConfidence } = require('../utils');

class WindAssessment {
  constructor(defaults) {
    this.config = defaults.WIND;
  }

  assess(params) {
    const factors = {
      surface_wind: this.calculateSurfaceWind(params),
      turbulence: this.calculateTurbulence(params)
    };

    const assessment = this.calculateAssessment(factors, params);
    return {
      ...assessment,
      type: 'WIND',
      details: this.getDetailedAssessment(factors)
    };
  }

  calculateSurfaceWind(params) {
    const config = this.config.SURFACE_WIND;
    
    // Calculate sustained wind speed from components
    const sustainedWind = params.WIND_SPEED || 
      Math.sqrt(Math.pow(params.UGRD_10M || 0, 2) + Math.pow(params.VGRD_10M || 0, 2));
    
    // Direction variability (if available)
    const directionVar = params.WIND_DIR_VAR || 0;

    return Math.min(1.0, Math.max(0.0,
      normalizeValue(params.GUST || 0, config.GUST.threshold) * config.GUST.weight +
      normalizeValue(sustainedWind, config.SUSTAINED.threshold) * config.SUSTAINED.weight +
      normalizeValue(directionVar, config.DIRECTION_VARIABILITY.threshold) * 
        config.DIRECTION_VARIABILITY.weight
    ));
  }

  calculateTurbulence(params) {
    const config = this.config.TURBULENCE;
    return Math.min(1.0, Math.max(0.0,
      normalizeValue(params.FRICV || 0, config.FRICTION_VELOCITY.threshold) * 
        config.FRICTION_VELOCITY.weight +
      normalizeValue(params.VERT_SHEAR || 0, config.VERTICAL_SHEAR.threshold) * 
        config.VERTICAL_SHEAR.weight +
      normalizeValue(params.TKE || 0, config.TKE.threshold) * config.TKE.weight
    ));
  }

  calculateAssessment(factors, params) {
    const severityScore = Object.entries(factors).reduce((score, [key, value]) => {
      return score + value * this.config.SEVERITY_WEIGHTS[key];
    }, 0);

    const requiredParams = ['GUST', 'UGRD_10M', 'VGRD_10M'];
    const confidence = calculateConfidence(params, requiredParams);

    return {
      severity: this.getSeverityCategory(severityScore),
      confidence,
      factors
    };
  }

  getDetailedAssessment(factors) {
    return {
      surfaceWinds: this.getSurfaceWindDescription(factors.surface_wind),
      turbulenceConditions: this.getTurbulenceDescription(factors.turbulence)
    };
  }

  getSeverityCategory(score) {
    if (score < 0.25) return "Optimal";
    if (score < 0.5) return "Moderate";
    if (score < 0.75) return "Difficult";
    return "Severe";
  }

  getSurfaceWindDescription(level) {
    if (level < 0.25) return "Light winds";
    if (level < 0.5) return "Moderate winds";
    if (level < 0.75) return "Strong winds";
    return "Severe winds";
  }

  getTurbulenceDescription(level) {
    if (level < 0.25) return "Minimal turbulence";
    if (level < 0.5) return "Light turbulence";
    if (level < 0.75) return "Moderate turbulence";
    return "Severe turbulence";
  }
}

module.exports = WindAssessment;