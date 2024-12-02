const monitoring = require('@google-cloud/monitoring');
const apiUsageTracker = require('./apiUsageTracker');

function getCurrentPacificTime() {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric', 
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      timeZoneName: 'short'
    });
    return formatter.format(new Date());
  }
  
  function getPacificFirstDayOfMonth() {
    // Get current Pacific time components
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).formatToParts(new Date());
  
    const year = parseInt(parts.find(p => p.type === 'year').value);
    const month = parseInt(parts.find(p => p.type === 'month').value) - 1; // 0-based month
  
    // Create a Date object for the first day of the target month in Pacific time
    const firstDayPacific = new Date(year, month, 1);
  
    // Adjust the time to midnight Pacific time
    firstDayPacific.setHours(0, 0, 0, 0);
  
    // Format the first day of the month in Pacific time
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      timeZoneName: 'short'
    }).format(firstDayPacific);
  }
  
  
  

async function getMapsApiUsage() {
  const client = new monitoring.MetricServiceClient({
    keyFilename: process.cwd() + '/.secret/g-service-usage-credential.json'
  });

  try {
    const currentPacificDate = new Date(getCurrentPacificTime());
    const firstDayOfMonthPacificDate = new Date(getPacificFirstDayOfMonth());

// Convert the Pacific time Date objects to UTC
  const currentPacificTimeEpoch = currentPacificDate.getTime();
  const firstDayOfMonthPacificEpoch = firstDayOfMonthPacificDate.getTime();


    const request = {
      name: client.projectPath(process.env.GPROJECT_ID),
      filter: 'metric.type = "maps.googleapis.com/service/v2/request_count"',
      interval: {
        startTime: {
          seconds: Math.floor(firstDayOfMonthPacificEpoch / 1000),
        },
        endTime: {
          seconds: Math.floor(currentPacificTimeEpoch / 1000),
        },
      },
    };

    const [timeSeries] = await client.listTimeSeries(request);

    // Group by method
    const methodTotals = {};

    
    console.log('\n======================')
    console.log('** Totals per Method per Response code **');
    console.log('** (Google Billing starts 1st day of current month midnight) **');
    console.log(`** Since ${firstDayOfMonthPacificDate} to ${currentPacificDate}`);


    timeSeries.forEach(data => {
      const method = data.resource.labels.method;
      const responseCode = data.metric.labels.response_code;
      const totalRequests = data.points.reduce((sum, point) => {
        const value = parseInt(point?.value?.int64Value || 0, 10);
        return sum + value;
      }, 0);

      if (!methodTotals[method]) {
        methodTotals[method] = 0;
      }
      methodTotals[method] += totalRequests;

      console.log(`${method} [HTTP ${responseCode}]: ${totalRequests}`);
    });
        // Initialize all counters with actual counts from Google
        apiUsageTracker.setInitialCounts(methodTotals);

    console.log('\n** Totals per Method **');
    Object.entries(methodTotals).forEach(([method, total]) => {
      console.log(`${method}: ${total}`);
    });

    const latestDataTime = timeSeries[0]?.points[0]?.interval?.endTime?.seconds * 1000;
    console.log('\nAs per latest metric available at: ' + new Date(latestDataTime).toLocaleString());
    console.log('\n======================')

  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getMapsApiUsage
};