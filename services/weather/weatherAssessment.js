// weatherAssessment.js
const defaults = require('./thresholdDefaults');
const { deepMerge, formatConfidence } = require('./utils');

// Import all condition assessments
const RainAssessment = require('./conditions/rainAssessment');
const SnowAssessment = require('./conditions/snowAssessment');
const FogAssessment = require('./conditions/fogAssessment');
const WindAssessment = require('./conditions/windAssessment');
const ThunderstormAssessment = require('./conditions/thunderstormAssessment');
const SnowstormAssessment = require('./conditions/snowstormAssessment');
const IcePotentialAssessment = require('./conditions/icePotentialAssessment');
const TemperatureSwingAssessment = require('./conditions/temperatureSwingAssessment');
const RoadConditionsAssessment = require('./conditions/roadConditionsAssessment');

class WeatherAssessment {
  constructor(customDefaults = {}) {
    // Merge custom defaults with base defaults
    this.config = deepMerge(defaults, customDefaults);
    
    // Initialize all condition assessors
    this.assessors = {
      rain: new RainAssessment(this.config),
      snow: new SnowAssessment(this.config),
      fog: new FogAssessment(this.config),
      // wind: new WindAssessment(this.config),
      thunderstorm: new ThunderstormAssessment(this.config),
      // snowstorm: new SnowstormAssessment(this.config),
      // icePotential: new IcePotentialAssessment(this.config),
      // temperatureSwing: new TemperatureSwingAssessment(this.config),
      // roadConditions: new RoadConditionsAssessment(this.config)
    };
  }

  assessConditions(params) {
    // Get individual condition assessments
    const assessments = {};
    for (const [condition, assessor] of Object.entries(this.assessors)) {
      assessments[condition] = assessor.assess(params);
    }

    // Calculate overall assessment
    const overall = this.calculateOverallAssessment(assessments);

    // Generate comprehensive report
    return {
      overall: {
        severity: overall.severity,
        confidence: formatConfidence(overall.confidence),
        primaryConcerns: this.identifyPrimaryConcerns(assessments),
        drivingRecommendation: this.getDrivingRecommendation(overall.severity, assessments)
      },
      conditions: assessments,
      timestamp: new Date().toISOString(),
      parameterQuality: this.assessParameterQuality(params)
    };
  }

  // calculateOverallAssessment(assessments) {
  //   // Weight assessments by their confidence
  //   const weightedSeverities = Object.values(assessments).map(assessment => ({
  //     severity: this.severityToScore(assessment.severity),
  //     confidence: assessment.confidence
  //   }));

  //   // Calculate weighted average severity
  //   const totalConfidence = weightedSeverities.reduce((sum, a) => sum + a.confidence, 0);
  //   const weightedSeverity = weightedSeverities.reduce((sum, a) => 
  //     sum + (a.severity * a.confidence), 0) / totalConfidence;

  //   // Calculate overall confidence
  //   const overallConfidence = weightedSeverities.reduce((sum, a) => sum + a.confidence, 0) / 
  //     weightedSeverities.length;

  //   return {
  //     severity: this.scoreToSeverity(weightedSeverity),
  //     confidence: overallConfidence
  //   };
  // }


  calculateOverallAssessment(assessments) {
    // Convert severities to scores to find highest
    const severityScores = Object.values(assessments).map(assessment => ({
      severity: this.severityToScore(assessment.severity),
      confidence: assessment.confidence
    }));
  
    // Find highest severity score
    const highestSeverityScore = Math.max(...severityScores.map(s => s.severity));
  
    // Calculate mean confidence
    const overallConfidence = severityScores.reduce((sum, a) => sum + a.confidence, 0) / 
      severityScores.length;
  
    return {
      severity: this.scoreToSeverity(highestSeverityScore),
      confidence: overallConfidence
    };
  }


  identifyPrimaryConcerns(assessments) {
    return Object.entries(assessments)
      .filter(([_, assessment]) => 
        this.severityToScore(assessment.severity) >= 2 && assessment.confidence > 70)
      .map(([condition, assessment]) => ({
        condition,
        severity: assessment.severity,
        confidence: assessment.confidence,
        details: assessment.details
      }))
      .sort((a, b) => this.severityToScore(b.severity) - this.severityToScore(a.severity));
  }

  getDrivingRecommendation(severity, assessments) {
    const conditions = this.identifyPrimaryConcerns(assessments);
    
    switch (severity) {
      case "Optimal":
        return "Normal driving conditions. Proceed with regular caution.";
      case "Moderate":
        return `Exercise increased caution. ${conditions.map(c => c.details).join(' ')}`;
      case "Difficult":
        return "Hazardous conditions present. Consider postponing non-essential travel. " +
          `${conditions.map(c => c.details).join(' ')}`;
      case "Severe":
        return "Extremely hazardous conditions. Avoid travel if possible. " +
          `${conditions.map(c => c.details).join(' ')}`;
      default:
        return "Unable to provide driving recommendation due to insufficient data.";
    }
  }

  assessParameterQuality(params) {
    const requiredParams = [
      'TMP_2M', 'RH', 'PRATE', 'VIS', 'UGRD_10M', 'VGRD_10M',
      'GUST', 'TSOIL', 'SNOD', 'CPOFP'
    ];
    
    const available = requiredParams.filter(param => params[param] != null).length;
    const quality = (available / requiredParams.length) * 100;
    
    return {
      quality: quality.toFixed(1) + '%',
      missingParams: requiredParams.filter(param => params[param] == null),
      recommendation: quality < 70 ? 
        "Consider obtaining additional weather parameters for more accurate assessment" : 
        "Sufficient parameters available for accurate assessment"
    };
  }

  severityToScore(severity) {
    const scores = {
      "Optimal": 0,
      "Moderate": 1,
      "Difficult": 2,
      "Severe": 3
    };
    return scores[severity] || 0;
  }

  scoreToSeverity(score) {
    if (score < 0.5) return "Optimal";
    if (score < 1.5) return "Moderate";
    if (score < 2.5) return "Difficult";
    return "Severe";
  }
}

module.exports = WeatherAssessment;