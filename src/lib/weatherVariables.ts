export interface WeatherVariable {
  id: string;
  name: string;
  nasaPowerParam: string;
  unit: string;
  description: string;
  category: 'temperature' | 'precipitation' | 'wind' | 'atmosphere' | 'other';
}

export const WEATHER_VARIABLES: WeatherVariable[] = [
  {
    id: 'T2M_MAX',
    name: 'Maximum Temperature',
    nasaPowerParam: 'T2M_MAX',
    unit: '°C',
    description: 'Daily maximum temperature at 2 meters above ground',
    category: 'temperature',
  },
  {
    id: 'T2M_MIN',
    name: 'Minimum Temperature',
    nasaPowerParam: 'T2M_MIN',
    unit: '°C',
    description: 'Daily minimum temperature at 2 meters above ground',
    category: 'temperature',
  },
  {
    id: 'PRECTOTCORR',
    name: 'Precipitation',
    nasaPowerParam: 'PRECTOTCORR',
    unit: 'mm/day',
    description: 'Precipitation (bias-corrected)',
    category: 'precipitation',
  },
  {
    id: 'WS2M',
    name: 'Wind Speed',
    nasaPowerParam: 'WS2M',
    unit: 'm/s',
    description: 'Wind speed at 2 meters above ground',
    category: 'wind',
  },
  {
    id: 'RH2M',
    name: 'Relative Humidity',
    nasaPowerParam: 'RH2M',
    unit: '%',
    description: 'Relative humidity at 2 meters above ground',
    category: 'atmosphere',
  },
  {
    id: 'CLOUD_AMT',
    name: 'Cloud Cover',
    nasaPowerParam: 'CLOUD_AMT',
    unit: '%',
    description: 'Total cloud amount',
    category: 'atmosphere',
  },
];

export const getVariableById = (id: string): WeatherVariable | undefined => {
  return WEATHER_VARIABLES.find(v => v.id === id);
};

export const getVariablesByCategory = (category: WeatherVariable['category']): WeatherVariable[] => {
  return WEATHER_VARIABLES.filter(v => v.category === category);
};
