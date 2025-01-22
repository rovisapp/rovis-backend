// utils.js

/**
 * Normalize a value between 0 and 1 based on a maximum threshold
 */
function normalizeValue(value, maxValue) {
    return Math.min(1.0, Math.max(0.0, value / maxValue));
  }
  
  /**
   * Calculate confidence score based on parameter availability and validation
   */
  function calculateConfidence(params, requiredParams) {
    // Check parameter availability
    const availableParams = requiredParams.filter(param => params[param] != null).length;
    const paramConfidence = availableParams / requiredParams.length;
  
    // Check parameter validity (within reasonable ranges)
    const validParams = requiredParams.filter(param => {
      const value = params[param];
      if (value == null) return false;
      return isValidParameter(param, value);
    }).length;
    const validityConfidence = validParams / requiredParams.length;
  
    return (paramConfidence * 0.6 + validityConfidence * 0.4) * 100;
  }
  
  /**
   * Validate individual parameter values
   */
  function isValidParameter(param, value) {
    const validationRules = {
      // Temperature related (in Kelvin)
      TMP_2M: (v) => v > 200 && v < 330,
      TSOIL: (v) => v > 200 && v < 330,
      
      // Precipitation related (in mm/hr)
      PRATE: (v) => v >= 0 && v < 100,
      
      // Wind related (in m/s)
      GUST: (v) => v >= 0 && v < 100,
      UGRD_10M: (v) => Math.abs(v) < 100,
      VGRD_10M: (v) => Math.abs(v) < 100,
      
      // Visibility (in meters)
      VIS: (v) => v >= 0 && v < 100000,
      
      // Percentage values
      RH: (v) => v >= 0 && v <= 100,
      CPOFP: (v) => v >= 0 && v <= 100,
      
      // Pressure (in Pa)
      PRES: (v) => v > 50000 && v < 110000,
      
      // Default validation
      default: (v) => v != null && !isNaN(v)
    };
  
    const validationFunction = validationRules[param] || validationRules.default;
    return validationFunction(value);
  }
  
  /**
   * Deep merge two objects
   */
  function deepMerge(target, source) {
    if (typeof source !== 'object' || source === null) {
      return source;
    }
  
    const output = { ...target };
    
    Object.keys(source).forEach(key => {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
    
    return output;
  }
  
  /**
   * Format confidence level for display
   */
  function formatConfidence(confidence) {
    return {
      value: confidence,
      level: confidence > 80 ? "High" : confidence > 60 ? "Medium" : "Low",
      description: `${confidence.toFixed(1)}% confidence in assessment`
    };
  }
  
  /**
   * Calculate vector magnitude (e.g., for wind components)
   */
  function calculateMagnitude(u, v) {
    return Math.sqrt(Math.pow(u || 0, 2) + Math.pow(v || 0, 2));
  }
  
  module.exports = {
    normalizeValue,
    calculateConfidence,
    isValidParameter,
    deepMerge,
    formatConfidence,
    calculateMagnitude
  };