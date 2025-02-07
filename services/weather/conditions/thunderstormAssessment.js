// thunderstormAssessment.js
const { normalizeValue, calculateConfidence, calculateWeightedScores } = require('../utils');

class ThunderstormAssessment {
  constructor(defaults) {
    this.config = defaults.THUNDERSTORM;
  }

  assess(params) {
    const factors = {
      instability: this.calculateInstability(params),
      radar: this.calculateRadar(params)
    };

    const assessment = this.calculateAssessment(factors, params);
    return {
      ...assessment,
      type: 'THUNDERSTORM',
      details: this.getDetailedAssessment(factors)
    };
  }

  // calculateInstability(params) {
  //   const config = this.config.INSTABILITY;
  //   return Math.min(1.0, Math.max(0.0,
  //     normalizeValue(params.CAPE || 0, config.CAPE.threshold) * config.CAPE.weight +
  //     normalizeValue(Math.abs(params.CIN || 0), Math.abs(config.CIN.threshold)) * config.CIN.weight +
  //     normalizeValue(Math.abs(params.LIFTED_INDEX || 0), Math.abs(config.LI.threshold)) * 
  //       config.LI.weight
  //   ));
  // }

  // calculateRadar(params) {
  //   const config = this.config.RADAR;
  //   return Math.min(1.0, Math.max(0.0,
  //     normalizeValue(params.REFC || 0, config.REFL_COMPOSITE.threshold) * 
  //       config.REFL_COMPOSITE.weight +
  //     normalizeValue(params.ECHO_TOP || 0, config.ECHO_TOP.threshold) * config.ECHO_TOP.weight +
  //     normalizeValue(params.VIL || 0, config.VIL.threshold) * config.VIL.weight
  //   ));
  // }

  calculateInstability(params) {
    const config = this.config.INSTABILITY;
    
    return Math.min(1.0, Math.max(0.0,
      calculateWeightedScores([
        {
          value: params.CAPE,
          threshold: config.CAPE.threshold,
          weight: config.CAPE.weight
        },
        {
          value: params.CIN !== undefined ? Math.abs(params.CIN) : undefined,
          threshold: Math.abs(config.CIN.threshold),
          weight: config.CIN.weight
        },
        {
          value: params.LIFTED_INDEX !== undefined ? Math.abs(params.LIFTED_INDEX) : undefined,
          threshold: Math.abs(config.LI.threshold),
          weight: config.LI.weight
        }
      ])
    ));
}

calculateRadar(params) {
    const config = this.config.RADAR;
    
    return Math.min(1.0, Math.max(0.0,
      calculateWeightedScores([
        {
          value: params.REFC,
          threshold: config.REFL_COMPOSITE.threshold,
          weight: config.REFL_COMPOSITE.weight
        },
        {
          value: params.ECHO_TOP,
          threshold: config.ECHO_TOP.threshold,
          weight: config.ECHO_TOP.weight
        },
        {
          value: params.VIL,
          threshold: config.VIL.threshold,
          weight: config.VIL.weight
        }
      ])
    ));
}


  calculateAssessment(factors, params) {
    const severityScore = Object.entries(factors).reduce((score, [key, value]) => {
      return score + value * this.config.SEVERITY_WEIGHTS[key];
    }, 0);

    const requiredParams = ['CAPE', 'CIN', 'REFC'];
    const confidence = calculateConfidence(params, requiredParams);

    return {
      severity: this.getSeverityCategory(severityScore),
      confidence,
      factors
    };
  }

  getDetailedAssessment(factors) {
    return {
      instabilityConditions: this.getInstabilityDescription(factors.instability),
      stormIntensity: this.getRadarDescription(factors.radar)
    };
  }

  getSeverityCategory(score) {
    if (score < 0.25) return "Optimal";
    if (score < 0.5) return "Moderate";
    if (score < 0.75) return "Difficult";
    return "Severe";
  }

  getInstabilityDescription(level) {
    if (level < 0.25) return "Stable conditions";
    if (level < 0.5) return "Marginally unstable";
    if (level < 0.75) return "Unstable conditions";
    return "Severely unstable conditions";
  }

  getRadarDescription(level) {
    if (level < 0.25) return "No significant radar returns";
    if (level < 0.5) return "Moderate radar signatures";
    if (level < 0.75) return "Strong radar signatures";
    return "Severe thunderstorm signatures";
  }
}

module.exports = ThunderstormAssessment;