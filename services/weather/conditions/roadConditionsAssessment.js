// roadConditionsAssessment.js
const { normalizeValue, calculateConfidence } = require('../utils');

class RoadConditionsAssessment {
  constructor(defaults) {
    this.config = defaults.ROAD_CONDITIONS;
  }

  assess(params) {
    const factors = {
      surface: this.calculateSurfaceConditions(params),
      sub_surface: this.calculateSubSurfaceConditions(params)
    };

    const assessment = this.calculateAssessment(factors, params);
    return {
      ...assessment,
      type: 'ROAD_CONDITIONS',
      details: this.getDetailedAssessment(factors)
    };
  }

  calculateSurfaceConditions(params) {
    const config = this.config.SURFACE;
    
    // Temperature relative to freezing
    const surfaceTemp = params.ROAD_TEMP || params.TSOIL || 273.15;
    const freezingRisk = this.calculateFreezingRisk(surfaceTemp);

    return Math.min(1.0, Math.max(0.0,
      freezingRisk * config.TEMPERATURE.weight +
      normalizeValue(params.ROAD_MOISTURE || params.SOILW || 0, config.MOISTURE.threshold) * 
        config.MOISTURE.weight +
      normalizeValue(params.ROAD_STATE || 0, config.STATE.threshold) * config.STATE.weight
    ));
  }

  calculateSubSurfaceConditions(params) {
    const config = this.config.SUB_SURFACE;
    
    // Sub-surface temperature and moisture
    const subTemp = params.SUB_ROAD_TEMP || params.TSOIL_DEEP || 273.15;
    const freezingRisk = this.calculateFreezingRisk(subTemp);

    return Math.min(1.0, Math.max(0.0,
      freezingRisk * config.TEMPERATURE.weight +
      normalizeValue(params.SUB_MOISTURE || params.SOILW_DEEP || 0, config.MOISTURE.threshold) * 
        config.MOISTURE.weight
    ));
  }

  calculateFreezingRisk(temperature) {
    // Returns higher values when temperature is at or below freezing
    const freezingPoint = 273.15; // 0°C in Kelvin
    if (temperature <= freezingPoint) {
      return 1.0;
    }
    // Gradual decrease in risk as temperature rises above freezing
    return Math.exp(-0.5 * Math.pow((temperature - freezingPoint) / 2, 2));
  }

  calculateAssessment(factors, params) {
    const severityScore = Object.entries(factors).reduce((score, [key, value]) => {
      return score + value * this.config.SEVERITY_WEIGHTS[key];
    }, 0);

    const requiredParams = ['ROAD_TEMP', 'ROAD_MOISTURE', 'TSOIL'];
    const confidence = calculateConfidence(params, requiredParams);

    return {
      severity: this.getSeverityCategory(severityScore),
      confidence,
      factors
    };
  }

  getDetailedAssessment(factors) {
    return {
      surfaceConditions: this.getSurfaceDescription(factors.surface),
      subSurfaceConditions: this.getSubSurfaceDescription(factors.sub_surface),
      drivingRecommendation: this.getDrivingRecommendation(factors)
    };
  }

  getSeverityCategory(score) {
    if (score < 0.25) return "Optimal";
    if (score < 0.5) return "Moderate";
    if (score < 0.75) return "Difficult";
    return "Severe";
  }

  getSurfaceDescription(level) {
    if (level < 0.25) return "Dry road conditions";
    if (level < 0.5) return "Slightly wet roads";
    if (level < 0.75) return "Wet or slippery roads";
    return "Hazardous road conditions";
  }

  getSubSurfaceDescription(level) {
    if (level < 0.25) return "Stable sub-surface conditions";
    if (level < 0.5) return "Minor sub-surface concerns";
    if (level < 0.75) return "Unstable sub-surface conditions";
    return "Severely compromised sub-surface";
  }

  getDrivingRecommendation(factors) {
    const averageSeverity = (factors.surface + factors.sub_surface) / 2;
    if (averageSeverity < 0.25) {
      return "Normal driving conditions";
    } else if (averageSeverity < 0.5) {
      return "Exercise caution, especially on bridges and exposed roads";
    } else if (averageSeverity < 0.75) {
      return "Reduce speed and increase following distance";
    } else {
      return "Avoid unnecessary travel, hazardous conditions present";
    }
  }
}

module.exports = RoadConditionsAssessment;