// Singleton to track API usage counts across all Google Maps methods
class ApiUsageTracker {
    constructor() {
        this.counts = {};
    }

    // Initialize counts for a specific method
    setInitialCount(method, count) {
        this.counts[method] = count;
    }

    // Initialize counts for multiple methods at once
    setInitialCounts(methodTotals) {
        this.counts = {...methodTotals};
    }

    // Increment count for a specific method
    incrementCount(method) {
        if (!this.counts[method]) {
            this.counts[method] = 0;
        }
        this.counts[method]++;
        console.log(`\n** Api consumed for ${method} **\nNew Counts:`);
        console.log(this.counts)
        console.log('\n');
        return this.counts[method];
    }

    // Get count for a specific method
    getCount(method) {
        return this.counts[method] || 0;
    }

    // Get all counts
    getAllCounts() {
        return {...this.counts};
    }
}

// Export singleton instance
const tracker = new ApiUsageTracker();
module.exports = tracker;