import { useState } from 'react';
import { WeatherMap } from '@/components/WeatherMap';
import { AnalysisForm, AnalysisParams } from '@/components/AnalysisForm';
import { ResultsPanel, AnalysisResults } from '@/components/ResultsPanel';
import { TemperatureChart } from '@/components/TemperatureChart';
import { useToast } from '@/hooks/use-toast';
import { Cloud } from 'lucide-react';

const Index = () => {
  const [latitude, setLatitude] = useState(43.65);
  const [longitude, setLongitude] = useState(-79.38);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisParams, setAnalysisParams] = useState<AnalysisParams | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (params: AnalysisParams) => {
    setIsLoading(true);
    setAnalysisParams(params);
    
    try {
      const response = await fetch('/api/probability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data: AnalysisResults = await response.json();
      setResults(data);
      
      toast({
        title: 'Analysis Complete',
        description: `Probability: ${data.probability.toFixed(1)}%`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch analysis. Using sample data for demo.',
        variant: 'destructive',
      });
      
      // Demo data for testing UI
      setResults({
        probability: 68.5,
        confidenceInterval: [62.3, 74.7],
        yearsAnalyzed: 42,
        percentiles: {
          p25: 22.5,
          p50: 25.2,
          p75: 27.8,
          p90: 29.3,
        },
        yearlyData: Array.from({ length: 42 }, (_, i) => ({
          year: 1981 + i,
          maxTemp: 20 + Math.random() * 12,
        })),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!results) return;

    const csvContent = [
      ['Year', 'Maximum Temperature (°C)'],
      ...results.yearlyData.map(d => [d.year, d.maxTemp.toFixed(2)]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Download Started',
      description: 'CSV file is being downloaded',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Cloud className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Weather Probability Analysis</h1>
              <p className="text-sm text-muted-foreground">NASA POWER API Integration</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Map and Form */}
          <div className="space-y-6">
            <div className="h-[450px]">
              <WeatherMap
                latitude={latitude}
                longitude={longitude}
                onLocationChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
              />
            </div>
            
            <AnalysisForm
              latitude={latitude}
              longitude={longitude}
              onLatitudeChange={setLatitude}
              onLongitudeChange={setLongitude}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <ResultsPanel results={results} onDownloadCSV={handleDownloadCSV} />
            
            {results && analysisParams && (
              <TemperatureChart 
                data={results.yearlyData} 
                threshold={analysisParams.threshold}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Data provided by NASA POWER API • Built with React, Leaflet, and Chart.js</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
