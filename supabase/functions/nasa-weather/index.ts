import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestParams {
  latitude: number;
  longitude: number;
  month: number;
  day: number;
  window: number;
  threshold: number;
  variable: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params: RequestParams = await req.json();
    console.log('Received request:', params);

    const { latitude, longitude, month, day, window, threshold, variable } = params;

    // Calculate date range with window
    const startDate = new Date(2000, month - 1, Math.max(1, day - window));
    const endDate = new Date(2000, month - 1, Math.min(31, day + window));
    
    const startMonth = startDate.getMonth() + 1;
    const startDay = startDate.getDate();
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();

    // Fetch historical data from NASA POWER API
    const startYear = 1981;
    const endYear = 2023;
    
    const nasaUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?` +
      `parameters=${variable}&` +
      `community=RE&` +
      `longitude=${longitude}&` +
      `latitude=${latitude}&` +
      `start=${startYear}0101&` +
      `end=${endYear}1231&` +
      `format=JSON`;

    console.log('Fetching from NASA POWER API:', nasaUrl);

    const response = await fetch(nasaUrl);
    
    if (!response.ok) {
      console.error('NASA API error:', response.status, await response.text());
      throw new Error(`NASA POWER API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('NASA API response received');

    // Process the data
    const yearlyMaximums: Array<{ year: number; maxValue: number }> = [];
    
    for (let year = startYear; year <= endYear; year++) {
      let maxValue = -Infinity;
      
      // Check each day in the window
      for (let checkMonth = startMonth; checkMonth <= endMonth; checkMonth++) {
        const daysInMonth = new Date(year, checkMonth, 0).getDate();
        const startCheckDay = checkMonth === startMonth ? startDay : 1;
        const endCheckDay = checkMonth === endMonth ? endDay : daysInMonth;
        
        for (let checkDay = startCheckDay; checkDay <= endCheckDay; checkDay++) {
          const dateKey = `${year}${String(checkMonth).padStart(2, '0')}${String(checkDay).padStart(2, '0')}`;
          const value = data.properties.parameter[variable]?.[dateKey];
          
          if (value !== undefined && value !== null && value > maxValue) {
            maxValue = value;
          }
        }
      }
      
      if (maxValue > -Infinity) {
        yearlyMaximums.push({ year, maxValue });
      }
    }

    // Calculate probability of exceeding threshold
    const exceedingCount = yearlyMaximums.filter(item => item.maxValue > threshold).length;
    const probability = (exceedingCount / yearlyMaximums.length) * 100;

    // Calculate confidence interval (95%)
    const p = probability / 100;
    const n = yearlyMaximums.length;
    const standardError = Math.sqrt((p * (1 - p)) / n);
    const marginOfError = 1.96 * standardError * 100;
    const confidenceInterval: [number, number] = [
      Math.max(0, probability - marginOfError),
      Math.min(100, probability + marginOfError),
    ];

    // Calculate percentiles
    const sortedValues = yearlyMaximums.map(item => item.maxValue).sort((a, b) => a - b);
    const getPercentile = (p: number) => {
      const index = Math.ceil((p / 100) * sortedValues.length) - 1;
      return sortedValues[Math.max(0, index)];
    };

    const percentiles = {
      p25: getPercentile(25),
      p50: getPercentile(50),
      p75: getPercentile(75),
      p90: getPercentile(90),
    };

    const result = {
      probability,
      confidenceInterval,
      yearsAnalyzed: yearlyMaximums.length,
      percentiles,
      yearlyData: yearlyMaximums.map(item => ({
        year: item.year,
        maxValue: item.maxValue,
      })),
      metadata: {
        location: { latitude, longitude },
        dateWindow: {
          month,
          day,
          windowDays: window,
        },
        threshold,
        variable,
        dataSource: 'NASA POWER API',
        apiUrl: 'https://power.larc.nasa.gov/',
        dateRange: { startYear, endYear },
      },
    };

    console.log('Calculation complete. Probability:', probability);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in nasa-weather function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to fetch weather analysis from NASA POWER API'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
